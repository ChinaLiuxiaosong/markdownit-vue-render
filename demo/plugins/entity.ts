import type MarkdownIt from 'markdown-it'
import { sortBy } from 'lodash-es'

export interface MarkdownEntity {
    id: string
    title: string
    description?: string
    alias?: string
}

interface EntityToken {
    type: 'entity'
    title: string
    entities: MarkdownEntity[]
}

interface TextToken {
    type: 'text'
    text: string
}

type MarkdownEntityAstToken = EntityToken | TextToken

function parseMarkdownEntityAst(src: string, entities: MarkdownEntity[]): MarkdownEntityAstToken[] {
    let ast: MarkdownEntityAstToken[] = [{ type: 'text', text: src }]
    if (entities.length) {
        const entitiesMap = new Map<string, MarkdownEntity[]>()
        function appendEntity(title: string, entity: MarkdownEntity) {
            let list = entitiesMap.get(title)
            if (!list) {
                list = []
                entitiesMap.set(title, list)
            }
            list.push(entity)
        }
        for (const { alias, ...entity } of entities) {
            appendEntity(entity.title, entity)
            if (alias) {
                for (const as of alias.split(',').map((s) => s.trim())) {
                    if (as) {
                        appendEntity(as, entity)
                    }
                }
            }
        }
        const sortedEntities = sortBy([...entitiesMap.entries()], ([title]) => -title.length)
        for (const [title, list] of sortedEntities) {
            ast = ast.flatMap<MarkdownEntityAstToken>((token) => {
                if (token.type === 'text') {
                    return token.text.split(title).flatMap<MarkdownEntityAstToken>((fragment, index) =>
                        index === 0
                            ? [{ type: 'text', text: fragment }]
                            : [
                                  { type: 'entity', title, entities: list },
                                  { type: 'text', text: fragment },
                              ]
                    )
                }
                return [token]
            })
        }
    }
    return ast
}

function formatEntity(title: string, entities: MarkdownEntity[]) {
    return `[Entity:${entities.map((e) => e.id).join(',')}:${encodeURIComponent(title)}]`
}

export function transformMarkdownEntity(src: string, entities: MarkdownEntity[]) {
    return parseMarkdownEntityAst(src, entities)
        .map((token) => (token.type === 'entity' ? formatEntity(token.title, token.entities) : token.text))
        .join('')
}

// [Entity:ids:encodeTitle]
export default function markdownitEntity(md: MarkdownIt, { entityClass = 'markdown-entity' } = {}) {
    md.core.ruler.push('markdownit-entity', (state) => {
        for (let i = 0; i < state.tokens.length; i++) {
            const blockToken = state.tokens[i]
            if (blockToken.type === 'inline') {
                const openToken = state.tokens[i - 1]
                if (openToken?.type === 'heading_open') {
                    if (blockToken.children?.length) {
                        let isEntity = false
                        for (const token of blockToken.children) {
                            if (token.type === 'entity_close') {
                                if (isEntity) {
                                    token.hidden = true
                                    isEntity = false
                                }
                            } else if (isEntity) {
                                // token.hidden = true
                            } else if (token.type === 'entity_open') {
                                token.hidden = true
                                isEntity = true
                            }
                        }
                    }
                }
            }
        }
    })
    md.inline.ruler.before('link', 'markdownit-entity', (state, silent) => {
        if (silent) {
            return false
        }
        if (state.src.substring(state.pos).startsWith(`[Entity:`)) {
            const offset = '[Entity:'.length
            const endIndex = state.src.indexOf(']', state.pos)
            if (endIndex > -1 && endIndex < state.posMax) {
                const endPos = endIndex + 1
                const [entityIds, encodedTitle] = state.src.substring(state.pos + offset, endIndex).split(':', 2)
                if (entityIds && encodedTitle) {
                    let title: string
                    try {
                        title = decodeURIComponent(encodedTitle)
                    } catch {
                        return false
                    }

                    const token_o = state.push('entity_open', 'a', 1)
                    token_o.attrs = [
                        ['class', entityClass],
                        ['data-type', 'entity'],
                        ['data-entity-ids', entityIds],
                    ]
                    const token_t = state.push('text', '', 0)
                    token_t.content = title
                    state.push('entity_close', 'a', -1)

                    state.pos = endPos
                    return true
                }
            }
        }
        return false
    })
}
