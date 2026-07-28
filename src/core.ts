import MarkdownIt from 'markdown-it'
import markdownItCjkFriendlyPlugin from 'markdown-it-cjk-friendly'
import type Token from 'markdown-it/lib/token.mjs'
import markdownitTagClass from './plugins/tag-class'

export type MarkdownItToken = Token

export interface MarkdownToken {
    raw: MarkdownItToken
    type: MarkdownItToken['type']
    tag: MarkdownItToken['tag']
    attrs?: Record<string, string>
    content: string
    children?: MarkdownToken[]
}

export function createDefaultMarkdownIt() {
    const markdownit = new MarkdownIt()
    markdownit.use(markdownItCjkFriendlyPlugin)
    markdownit.use(markdownitTagClass)
    return markdownit
}
