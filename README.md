# markdownit-vue-render

[![npm](https://img.shields.io/npm/v/markdownit-vue-render.svg)](https://www.npmjs.com/package/markdownit-vue-render)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 基于 Vue 3 与 markdown-it 的 Markdown 渲染器，将 token 流转换为可自定义的 Vue 虚拟 DOM 树，**不使用 `innerHTML` / `v-html`**，专为 AI 流式对话 / RAG 引用展示场景设计。

## 在线演示

[GitHub Pages Demo](https://chinaliuxiaosong.github.io/markdownit-vue-render/)

## 为什么不用 `markdown-it.render()` + `v-html`

主流 markdown 渲染方案是 `markdown-it.render(text)` 拿到 html 字符串后 `v-html` 注入。这在 AI 场景下有三个痛点：

1. **不可拦截**。AI 输出中常见的「引用标号」「实体链接」「工具调用块」需要渲染成可点击组件，而不是死链接。`v-html` 之后只能用事件代理 + DOM 查询打补丁，脆弱且难测试。
2. **流式更新代价大**。AI 一边吐字，内容一直在变；每帧重新 `v-html` 整段相当于全量替换 DOM，输入框焦点丢失、动画断裂。
3. **XSS 风险**。用户输入混进流里时，纯 `v-html` 必须额外配合 sanitizer，规则容易出错。

本库做的事：把 markdown-it 输出的扁平 token 流转成嵌套树，再用 **Vue 3 函数式组件递归渲染**。流式更新走 Vue diff，无 `v-html`；外层用一个 `default` slot 即可拦截任意节点。

## 安装

```bash
bun add markdownit-vue-render
```

## 使用

### 基础渲染

```vue
<template>
    <Markdown :content="content" />
</template>

<script setup lang="ts">
import { Markdown } from 'markdownit-vue-render'
import 'markdownit-vue-render/style.css'

const content = '# Hello\n\nThis is **markdown**.'
</script>
```

### 自定义 markdown-it 实例

```vue
<template>
    <Markdown :content="content" :markdownit="markdownit" />
</template>

<script setup lang="ts">
import { Markdown, createDefaultMarkdownIt } from 'markdownit-vue-render'
import 'markdownit-vue-render/style.css'

const markdownit = createDefaultMarkdownIt()
markdownit.use(myPlugin)

const content = '# Custom'
</script>
```

> `Markdown` 组件的 `markdownit` 属性是可选的；不传时会自动使用 `createDefaultMarkdownIt()` 创建的默认实例。

### 全局注册

```typescript
import { createApp } from 'vue'
import MarkdownitVueRender from 'markdownit-vue-render'
import 'markdownit-vue-render/style.css'

const app = createApp(App)
app.use(MarkdownitVueRender)
```

### 自定义 token 渲染

```vue
<template>
    <Markdown :content="content">
        <template #default="{ token, Component, text }">
            <Component v-if="token.tag !== 'a'" />
            <a v-else :href="token.attrs?.href">{{ text }}</a>
        </template>
    </Markdown>
</template>
```

## 自定义插件示例

演示目录 `demo/plugins/` 提供了两个自定义 markdown-it 插件示例：

- `docref.ts`：解析 `[Data: Document(docId_unitId, ...); ...]` 文档引用语法。
- `entity.ts`：解析 `[Entity:ids:encodedTitle]` 实体链接语法，并支持按实体 title/alias 自动替换原文。

对应的业务组件 `demo/components/KnowledgeMarkdown.vue` 展示了如何组合核心库与自定义插件，实现带弹窗的文档引用与实体点击交互。

### 流式渲染演示

`demo/components/StreamingMarkdown.vue` 提供了一个流式播放控制示例：

- 通过 slot 暴露当前应显示的 `visibleSource` 文本流片段。
- 点击"播放"按钮可从头开始，按逐字/逐词/逐段模式模拟大模型输出。
- 父组件负责将 `visibleSource` 传给 `Markdown` 组件完成实际渲染。

## API

### 组件

- `Markdown`：便捷包装组件，Props: `content?: string`, `markdownit?: MarkdownIt`。

### 函数

- `createDefaultMarkdownIt()`：创建预装 `markdown-it-cjk-friendly` 与 `markdownitTagClass` 的 markdown-it 实例。
- `markdownItTokenStreamToTree(tokens)`：将 markdown-it token 流转换为树形结构。
- `MarkdownRender`：函数式组件，接收 `tokens` 并渲染为 Vue 虚拟 DOM。

### 插件

- `markdownitTagClass`：自动为 Markdown 标签添加 `markdown-{tag}`、`markdown-block`、`markdown-level-{level}` 等 class。

## 设计要点

- **不用 `v-html`**：除 markdown-it 自身就是 raw html 的极少数节点外，其他全部用 `h()` 创建。
- **流式友好**：tokens 是响应式数组，Vue diff 算法负责最小更新；不会全量重渲染整段对话。
- **可扩展**：自定义 markdown-it inline rule 产出的 token 类型，通过 default slot 接管即可。
- **零业务耦合**：库本身只关心通用模式，具体业务面板由外层组件实现。

## 兼容性

- Vue ^3.5
- markdown-it ^14

## 开发

```bash
# 安装依赖
bun install

# 启动演示
bun run dev

# 构建库（纯 Bun，输出 JS/CSS）
bun run build:lib

# 生成 TypeScript 类型声明（需 Node.js 兼容环境）
bun run build:types

# 构建演示
bun run build:demo

# 类型检查
bun run typecheck
```

## 发布

### npm

发布到 npm 前，请执行 `prepublishOnly` 脚本，确保同时构建库产物和类型声明：

```bash
bun run prepublishOnly
npm publish --registry https://registry.npmjs.org/
```

### GitHub Pages

`.github/workflows/deploy.yml` 已配置好自动构建部署工作流，但需要在 GitHub 仓库设置中手动启用 Pages 并选择 "GitHub Actions" 作为 Source。首次启用后，推送代码到 `main` 分支会自动触发部署。

## 实战来源

抽取自一套企业级 AI 对话 + 知识检索产品，用于：

- LLM 流式对话渲染（chunked 文本 + 引用 + 实体）
- RAG 引用来源面板（点击标号弹出引用文档）
- 智能阅读场景下的实体高亮（点击实体跳转概念页）

线上覆盖浏览器和微信小程序两端（小程序端可与 [cross-sse](https://github.com/ChinaLiuxiaosong/cross-sse) 配合）。

## License

[MIT](./LICENSE) © 2026 Liu Xiaosong
