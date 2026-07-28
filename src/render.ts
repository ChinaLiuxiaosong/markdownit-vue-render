import { h, resolveDirective, Text, withDirectives, type Component, type FunctionalComponent } from 'vue'
import type { MarkdownItToken, MarkdownToken } from './core'

export function markdownItTokenStreamToTree(tokens: MarkdownItToken[]) {
    const tree: MarkdownToken[] = []
    const stack: MarkdownToken[] = []
    for (const raw of tokens) {
        const token: MarkdownToken = {
            raw,
            type: raw.type,
            tag: raw.tag,
            attrs: raw.attrs ? Object.fromEntries(raw.attrs) : undefined,
            content: raw.content,
        }
        if (raw.children) {
            token.children = markdownItTokenStreamToTree(raw.children)
        }
        const parent = stack[stack.length - 1]
        if (raw.nesting > 0) {
            if (parent) {
                if (parent.children) {
                    parent.children.push(token)
                } else {
                    parent.children = [token]
                }
            }
            stack.push(token)
        } else if (raw.nesting < 0) {
            const poped = stack.pop()
            if (poped && !stack.length) {
                tree.push(poped)
            }
        } else if (raw.type === 'inline') {
            if (token.children) {
                if (parent) {
                    if (parent.children) {
                        parent.children.push(...token.children)
                    } else {
                        parent.children = [...token.children]
                    }
                } else {
                    tree.push(...token.children)
                }
            }
        } else {
            if (parent) {
                if (parent.children) {
                    parent.children.push(token)
                } else {
                    parent.children = [token]
                }
            } else {
                tree.push(token)
            }
        }
    }
    return tree
}

export type MarkdownSlotProps = { token: MarkdownToken; Component: Component; text: string }
export type MarkdownSlots = { default?: (props: MarkdownSlotProps) => any }

export const MarkdownRender: FunctionalComponent<{ tokens: MarkdownItToken[] }, {}, MarkdownSlots> = (
    props,
    { slots }
) => {
    return h(MarkdownTokenChildrenRender, { tokens: markdownItTokenStreamToTree(props.tokens) }, slots)
}

const MarkdownTokenChildrenRender: FunctionalComponent<{ tokens: MarkdownToken[] }, {}, MarkdownSlots> = (
    props,
    { slots }
) => {
    return props.tokens.map((token) => {
        const render = () => h(MarkdownTokenRender, { token }, slots)
        if (slots.default) {
            return slots.default({ token, Component: render, text: getTokenText(token) })
        }
        return render()
    })
}

const MarkdownTokenRender: FunctionalComponent<{ token: MarkdownToken }, {}, MarkdownSlots> = (props, { slots }) => {
    if (props.token.raw.hidden) {
        if (props.token.children?.length) {
            return h(MarkdownTokenChildrenRender, { tokens: props.token.children }, slots)
        }
    } else {
        const render =
            markdownTypeRenders[props.token.type] || markdownTagRenders[props.token.tag] || MarkdownTokenTagRender
        return h(render, props, slots)
    }
}

const MarkdownTokenTagRender: FunctionalComponent<{ token: MarkdownToken }, {}, MarkdownSlots> = (props, { slots }) => {
    return renderTag(
        {
            tag: props.token.tag,
            attrs: props.token.attrs,
            children: props.token.children,
            content: props.token.content,
        },
        slots
    )
}

function renderTag(
    props: { tag: string; attrs?: Record<string, string>; children?: MarkdownToken[] | null; content?: string },
    slots: MarkdownSlots = {}
) {
    if (props.children?.length) {
        return h(props.tag, props.attrs, h(MarkdownTokenChildrenRender, { tokens: props.children }, slots))
    }
    if (props.content) {
        return withDirectives(h(props.tag, props.attrs), [[resolveDirective('html'), props.content]])
    }
    return h(props.tag, props.attrs)
}

const markdownTypeRenders: Record<string, FunctionalComponent<{ token: MarkdownToken }, {}, MarkdownSlots>> = {
    text: (props, {}) => {
        return h(Text, props.token.content)
    },
    code_inline: (props, { slots }) => {
        return renderTag(
            {
                tag: 'code',
                attrs: props.token.attrs,
                children: props.token.children,
                content: props.token.content,
            },
            slots
        )
    },
    code_block: (props, { slots }) => {
        return h(
            'pre',
            props.token.attrs,
            renderTag(
                {
                    tag: 'code',
                    children: props.token.children,
                    content: props.token.content,
                },
                slots
            )
        )
    },
    fence: (props, { slots }) => {
        return h(
            'pre',
            renderTag(
                {
                    tag: 'code',
                    attrs: props.token.attrs,
                    children: props.token.children,
                    content: props.token.content,
                },
                slots
            )
        )
    },
    image: (props, {}) => {
        return renderTag({
            tag: props.token.tag,
            attrs: { ...props.token.attrs, alt: props.token.content },
        })
    },
    hardbreak: () => {
        return h('br')
    },
    softbreak: () => {
        return h(Text, '\n')
    },
    html_block: (props) => {
        return withDirectives(h('div', { class: 'markdown-html-block' }), [
            [resolveDirective('html'), props.token.content],
        ])
    },
    html_inline: (props) => {
        return withDirectives(h('span', { class: 'markdown-html-inline' }), [
            [resolveDirective('html'), props.token.content],
        ])
    },
}

const markdownTagRenders: Record<string, FunctionalComponent<{ token: MarkdownToken }, {}, MarkdownSlots>> = {
    ol: (props, { slots }) => {
        return renderTag(
            {
                tag: 'div',
                attrs: props.token.attrs,
                children: props.token.children,
                content: props.token.content,
            },
            slots
        )
    },
    ul: (props, { slots }) => {
        return renderTag(
            {
                tag: 'div',
                attrs: props.token.attrs,
                children: props.token.children,
                content: props.token.content,
            },
            slots
        )
    },
    li: (props, { slots }) => {
        return renderTag(
            {
                tag: 'div',
                attrs: props.token.attrs,
                children: props.token.children,
                content: props.token.content,
            },
            slots
        )
    },
}

function getTokenText(token: MarkdownToken): string {
    let text = token.raw.hidden ? '' : token.raw.content
    if (token.children?.length) {
        for (const t of token.children) {
            if (t.raw.block) {
                text += '\n'
            }
            text += getTokenText(t)
        }
    }
    return text
}
