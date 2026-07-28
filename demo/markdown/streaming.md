# 流式渲染演示

这段内容会**模拟大模型输出**，逐字/逐词/逐段补全。

## 列表示例

- 支持标题、列表、代码块等元素
- 渲染结果与原文同步更新
- 可切换逐字/逐词/逐段模式

## 代码示例

```typescript
function greet(name: string) {
    return `Hello, ${name}!`
}
```

> 流式输出时，markdown-it 会即时解析已输入的内容并渲染为 DOM。

普通段落结束。
