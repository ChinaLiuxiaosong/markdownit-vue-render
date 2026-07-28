import type MarkdownIt from 'markdown-it'

export interface MarkdownDocrefEnv {
    docRefIdList: string[]
}

export function buildMarkdownDocrefEnv(): MarkdownDocrefEnv {
    return { docRefIdList: [] }
}

const TYPE_GROUP_REG = /^([A-Za-z0-9_-]+)\s*\((.+)\)$/
const ID_VALIDATE_REG = /^[A-Za-z0-9_-]+$/

// [Data: Document(docId_unitId, docId_unitId); Document(docId_unitId, docId_unitId); Type1(id1, id2); Type2(id1, id2)]
export default function markdownitDocref(
    md: MarkdownIt,
    { docrefClass = 'markdown-docref', docrefGroupClass = 'markdown-docref-group' } = {}
) {
    md.inline.ruler.push('markdownit-docref', (state, silent) => {
        if (silent) {
            return false
        }
        const { docRefIdList } = state.env as MarkdownDocrefEnv
        if (state.src.substring(state.pos).startsWith('[Data:')) {
            const offset = '[Data:'.length
            const endIndex = state.src.indexOf(']', state.pos)
            if (endIndex > -1 && endIndex < state.posMax) {
                const endPos = endIndex + 1
                const typeGroups = state.src
                    .substring(state.pos + offset, endIndex)
                    .split(';')
                    .map((s) => s.trim())
                if (typeGroups.length) {
                    const groupedType: { type: string; ids: string[] }[] = []
                    for (const typeGroup of typeGroups) {
                        const typeGroupMatched = typeGroup.match(TYPE_GROUP_REG)
                        if (!typeGroupMatched) {
                            return false
                        }
                        const type = typeGroupMatched[1]
                        const ids = typeGroupMatched[2].split(',').map((s) => s.trim())
                        for (const id of ids) {
                            if (!ID_VALIDATE_REG.test(id)) {
                                return false
                            }
                        }
                        groupedType.push({ type, ids })
                    }

                    const docIds = new Map<string, Set<string>>()
                    for (const { type, ids } of groupedType) {
                        if (type === 'Document') {
                            for (const id of ids) {
                                const [docId, ...unitIds] = id.split('_')
                                const docUnitIds = docIds.get(docId) || new Set()
                                for (const unitId of unitIds) {
                                    docUnitIds.add(unitId)
                                }
                                docIds.set(docId, docUnitIds)
                            }
                        }
                        // 忽略其他类型
                    }
                    if (docIds.size) {
                        for (const id of docIds.keys()) {
                            if (!docRefIdList.includes(id)) {
                                docRefIdList.push(id)
                            }
                        }
                        const token_g = state.push('docref-group_open', 'span', 1)
                        token_g.attrs = [
                            ['class', docrefGroupClass],
                            ['data-type', 'docref-group'],
                        ]
                        for (let i = 0; i < docRefIdList.length; i++) {
                            const docId = docRefIdList[i]
                            const unitIds = docIds.get(docId)
                            if (unitIds) {
                                const index = i
                                const token_o = state.push('docref_open', 'a', 1)
                                token_o.attrs = [
                                    ['class', docrefClass],
                                    ['data-type', 'docref'],
                                    ['data-docref-index', `${index}`],
                                    ['data-docref-id', docId],
                                    ['data-docref-unit-ids', [...unitIds].join(',')],
                                ]
                                const token_t = state.push('text', '', 0)
                                token_t.content = `${index + 1}`
                                state.push('docref_close', 'a', -1)
                            }
                        }
                        state.push('docref-group_close', 'span', -1)
                    }

                    state.pos = endPos
                    return true
                }
            }
        }
        return false
    })
}
