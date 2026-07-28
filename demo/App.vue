<template>
    <div class="demo-app">
        <div class="demo-header">
            <h1>markdownit-vue-render</h1>
            <p>Vue 3 + markdown-it 渲染器：支持自定义 token 树渲染与扩展插件。</p>
        </div>

        <div class="demo-section">
            <h2>核心 Markdown 渲染</h2>
            <StreamingMarkdown :content="basicMarkdown" v-slot="{ renderSource }">
                <div class="demo-row">
                    <div class="demo-col">
                        <h3>渲染结果</h3>
                        <Markdown :content="renderSource" />
                    </div>
                    <div class="demo-col">
                        <h3>Markdown 原文</h3>
                        <pre class="demo-source">{{ renderSource }}</pre>
                    </div>
                </div>
            </StreamingMarkdown>
        </div>

        <div class="demo-section">
            <h2>自定义扩展示例：文档引用 + 实体链接</h2>
            <StreamingMarkdown :content="knowledgeMarkdown" v-slot="{ renderSource }">
                <div class="demo-row">
                    <div class="demo-col">
                        <h3>渲染结果</h3>
                        <KnowledgeMarkdown
                            :content="renderSource"
                            :documents="documents"
                            :entities="entities"
                            @open-entity="onOpenEntity"
                            @open-document="onOpenDocument"
                        />
                    </div>
                    <div class="demo-col">
                        <h3>Markdown 原文</h3>
                        <pre class="demo-source">{{ renderSource }}</pre>
                    </div>
                </div>
                <div class="demo-config">
                    <h3>自定义插件配置</h3>
                    <div class="demo-config-grid">
                        <div class="demo-config-block">
                            <h4>docref 文档列表</h4>
                            <pre>{{ configDocuments }}</pre>
                        </div>
                        <div class="demo-config-block">
                            <h4>entity 实体列表</h4>
                            <pre>{{ configEntities }}</pre>
                        </div>
                    </div>
                </div>
            </StreamingMarkdown>
        </div>

        <div v-if="lastEvent" class="demo-event">
            <strong>最近事件：</strong>{{ lastEvent }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Markdown } from 'markdownit-vue-render'
import KnowledgeMarkdown from './components/KnowledgeMarkdown.vue'
import StreamingMarkdown from './components/StreamingMarkdown.vue'
import type { MarkdownEntity } from './plugins/entity'
import { basicMarkdown, documents, entities, knowledgeMarkdown } from './mockData'

const lastEvent = ref('')

const configDocuments = computed(() => JSON.stringify(documents, null, 2))
const configEntities = computed(() => JSON.stringify(entities, null, 2))

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
    max-width: 1200px;
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

.demo-row {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
}

.demo-col {
    flex: 1;
    min-width: 300px;

    h3 {
        margin: 0 0 12px;
        font-size: 14px;
        color: #4a5568;
        font-weight: 600;
    }
}

.demo-source {
    margin: 0;
    padding: 16px;
    background: #f7fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.6;
    color: #2d3748;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 400px;
    overflow: auto;
}

.demo-config {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #e2e8f0;

    h3 {
        margin: 0 0 12px;
        font-size: 14px;
        color: #4a5568;
        font-weight: 600;
    }
}

.demo-config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
}

.demo-config-block {
    h4 {
        margin: 0 0 8px;
        font-size: 13px;
        color: #718096;
        font-weight: 600;
    }

    pre {
        margin: 0;
        padding: 12px;
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 12px;
        line-height: 1.5;
        color: #2d3748;
        white-space: pre-wrap;
        word-break: break-word;
        max-height: 300px;
        overflow: auto;
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
