<template>
    <div class="demo-app">
        <div class="demo-header">
            <h1>markdownit-vue-render</h1>
            <p>Vue 3 + markdown-it 渲染器：支持自定义 token 树渲染与扩展插件。</p>
        </div>

        <div class="demo-section">
            <h2>核心 Markdown 渲染</h2>
            <Markdown :content="basicMarkdown" />
        </div>

        <div class="demo-section">
            <h2>自定义扩展示例：文档引用 + 实体链接</h2>
            <KnowledgeMarkdown
                :content="knowledgeMarkdown"
                :documents="documents"
                :entities="entities"
                @open-entity="onOpenEntity"
                @open-document="onOpenDocument"
            />
        </div>

        <div v-if="lastEvent" class="demo-event">
            <strong>最近事件：</strong>{{ lastEvent }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Markdown } from 'markdownit-vue-render'
import KnowledgeMarkdown from './components/KnowledgeMarkdown.vue'
import type { MarkdownEntity } from './plugins/entity'
import { basicMarkdown, documents, entities, knowledgeMarkdown } from './mockData'

const lastEvent = ref('')

function onOpenEntity(title: string, list: MarkdownEntity[]) {
    lastEvent.value = `open-entity: ${title}（${list.length} 个实体）`
}

function onOpenDocument(id: string, title: string, unitIds?: string[]) {
    lastEvent.value = `open-document: ${title}（id=${id}${unitIds?.length ? ', units=' + unitIds.join(',') : ''}）`
}
</script>

<style lang="less">
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #f5f7fa;
}
</style>

<style scoped lang="less">
.demo-app {
    max-width: 880px;
    margin: 0 auto;
    padding: 24px;
}

.demo-header {
    margin-bottom: 24px;

    h1 {
        margin: 0 0 8px;
        font-size: 22px;
    }

    p {
        margin: 0;
        color: #4a5568;
    }
}

.demo-section {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

    h2 {
        margin: 0 0 16px;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.9);
    }
}

.demo-event {
    padding: 12px 16px;
    background: #e6fffa;
    border-radius: 8px;
    color: #234e52;
    font-size: 14px;
}
</style>
