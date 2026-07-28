import type { MarkdownEntity } from './plugins/entity'

export type RefDocument = {
    id: string
    title: string
}

export const basicMarkdown = `# Markdown 基础渲染

这是**粗体**、*斜体*和\`行内代码\`示例。

## 列表示例

- 无序列表项 1
- 无序列表项 2
  - 嵌套项 A
  - 嵌套项 B

1. 有序列表项 1
2. 有序列表项 2

## 代码块

\`\`\`typescript
const hello = 'world'
console.log(hello)
\`\`\`

## 链接与图片

[markdown-it 官方文档](https://markdown-it.github.io/)

---

普通文本段落结束。
`

export const knowledgeMarkdown = `# 人工智能知识库

人工智能（Artificial Intelligence）是计算机科学的重要分支。

## 相关概念

- 人工智能常与深度学习、机器学习等概念关联。
- AI 的核心目标是使计算机模拟人类智能。

## 参考来源

详细内容见文末引用 [Data: Document(doc-001_unit-001, doc-001_unit-002); Reference(ref-001)]。

实体示例：人工智能、深度学习、机器学习。
`

export const streamingMarkdown = `# 流式渲染演示

这段内容会**模拟大模型输出**，逐字/逐词/逐段补全。

## 列表示例

- 支持标题、列表、代码块等元素
- 渲染结果与原文同步更新
- 可切换逐字/逐词/逐段模式

## 代码示例

\`\`\`typescript
function greet(name: string) {
    return \`Hello, ${name}!\`
}
\`\`\`

> 流式输出时，markdown-it 会即时解析已输入的内容并渲染为 DOM。

普通段落结束。`

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
