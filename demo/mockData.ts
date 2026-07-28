import type { MarkdownEntity } from './plugins/entity'

export type RefDocument = {
    id: string
    title: string
}

export { default as basicMarkdown } from './markdown/basic.md?raw'
export { default as knowledgeMarkdown } from './markdown/knowledge.md?raw'
export { default as streamingMarkdown } from './markdown/streaming.md?raw'

export const documents: RefDocument[] = [
    { id: 'doc-001', title: '人工智能发展白皮书（示例文档）' },
]

export const entities: MarkdownEntity[] = [
    {
        id: 'entity-001',
        title: '人工智能',
        description: '人工智能是研究如何使计算机模拟人类智能的学科。',
        alias: 'AI',
    },
    {
        id: 'entity-002',
        title: '深度学习',
        description: '深度学习是一种基于人工神经网络的机器学习方法。',
    },
    {
        id: 'entity-003',
        title: '机器学习',
        description: '机器学习让计算机能够从数据中学习规律并做出预测。',
    },
]
