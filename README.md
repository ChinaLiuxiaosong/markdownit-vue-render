# markdownit-vue-render

基于 Vue 3 与 markdown-it 的 Markdown 渲染器，将 token 流转换为可自定义的 Vue 虚拟 DOM 树，不使用 `innerHTML`。

## 在线演示

[GitHub Pages Demo](https://chinaliuxiaosong.github.io/markdownit-vue-render/)

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
import MarkdownIt from 'markdown-it'
import { Markdown, createDefaultMarkdownIt } from 'markdownit-vue-render'
import 'markdownit-vue-render/style.css'

const markdownit = createDefaultMarkdownIt()
markdownit.use(myPlugin)

const content = '# Custom'
</script>
```

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
        <template #default="{ token, Component }">
            <Component v-if="token.tag !== 'a'" />
            <a v-else :href="token.attrs?.href">{{ token.content }}</a>
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

`demo/components/StreamingMarkdown.vue` 提供了一个流式渲染示例：

- 进入页面时直接显示完整 Markdown 内容。
- 点击"播放"按钮可从头开始，按逐字/逐词/逐段模式模拟大模型输出。
- 原文输出区与渲染结果区同步更新。

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

## API

### 组件

- `Markdown`：便捷包装组件，Props: `content?: string`, `markdownit?: MarkdownIt`。

### 函数

- `createDefaultMarkdownIt()`：创建预装 `markdown-it-cjk-friendly` 与 `markdownitTagClass` 的 markdown-it 实例。
- `markdownItTokenStreamToTree(tokens)`：将 markdown-it token 流转换为树形结构。
- `MarkdownRender`：函数式组件，接收 `tokens` 并渲染为 Vue 虚拟 DOM。

### 插件

- `markdownitTagClass`：自动为 Markdown 标签添加 `markdown-{tag}`、`markdown-block`、`markdown-level-{level}` 等 class。

## License

MIT
