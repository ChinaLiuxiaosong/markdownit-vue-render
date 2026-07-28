import type { App } from 'vue'
import Markdown from './components/Markdown.vue'

export { Markdown }
export { createDefaultMarkdownIt } from './core'
export type { MarkdownToken, MarkdownItToken } from './core'
export { MarkdownRender, markdownItTokenStreamToTree } from './render'
export type { MarkdownSlotProps, MarkdownSlots } from './render'
export { default as markdownitTagClass } from './plugins/tag-class'

export default {
    install(app: App) {
        app.component('Markdown', Markdown)
    },
}
