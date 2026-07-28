import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'

function setTokenClass(tokens: Token[]) {
    for (const token of tokens) {
        if (token.nesting > -1) {
            if (token.tag) {
                token.attrJoin('class', `markdown-${token.tag}`)
                if (token.tag === 'li') {
                    if (token.info) {
                        token.attrJoin('class', `markdown-ol-li`)
                    } else {
                        token.attrJoin('class', `markdown-ul-li`)
                    }
                }
            }
            if (token.block) {
                token.attrJoin('class', `markdown-block`)
            }
            token.attrJoin('class', `markdown-level-${token.level}`)
        }
        if (token.children?.length) {
            setTokenClass(token.children)
        }
    }
}

export default function markdownitTagClass(md: MarkdownIt) {
    md.core.ruler.push('markdownit-tag-class', (state) => setTokenClass(state.tokens))
}
