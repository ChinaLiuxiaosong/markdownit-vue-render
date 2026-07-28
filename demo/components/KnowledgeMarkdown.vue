<template>
    <div class="knowledge-markdown">
        <div class="markdown" @click="onMarkdownClick">
            <MarkdownRender :tokens="markdownResult.tokens" />
        </div>
        <PopupPanel v-model:show="popupVisible">
            <template #title>
                <div class="docref-popup-title">
                    <span>引用来源（{{ popupDocList.length }}）</span>
                </div>
            </template>
            <div class="docref-popup-body">
                <div
                    v-for="item of popupDocList"
                    :key="item.index"
                    class="docref-popup-item"
                    :style="{ '--docref-popup-item-index': `'${item.index}'` }"
                    @click="openDoc(item.doc, item.unitIds)"
                >
                    <span v-if="item.doc">{{ item.doc.title }}</span>
                </div>
            </div>
        </PopupPanel>
    </div>
</template>

<script setup lang="ts">
import { createDefaultMarkdownIt, MarkdownRender } from 'markdownit-vue-render'
import 'markdownit-vue-render/style.css'
import { computed, ref, type Ref } from 'vue'
import markdownitDocref, { buildMarkdownDocrefEnv } from '../plugins/docref'
import markdownitEntity, { transformMarkdownEntity } from '../plugins/entity'
import type { MarkdownEntity } from '../plugins/entity'
import PopupPanel from './PopupPanel.vue'

export type { MarkdownEntity }

export type RefDocument = {
    id: string
    title: string
}

const props = defineProps<{
    content: string
    documents?: RefDocument[]
    entities?: MarkdownEntity[]
}>()

const emit = defineEmits<{
    'open-entity': [title: string, entities: MarkdownEntity[]]
    'open-document': [id: string, title: string, unitIds?: string[]]
}>()

const markdownit = createDefaultMarkdownIt()
markdownit.use(markdownitDocref)
markdownit.use(markdownitEntity)

const markdownResult = computed(() => {
    const env = buildMarkdownDocrefEnv()
    let src = props.content
    if (props.entities) {
        src = transformMarkdownEntity(src, props.entities)
    }
    const tokens = markdownit.parse(src, env)
    return {
        tokens,
        docRefIdList: env.docRefIdList,
    }
})

const refDocuments = computed(() =>
    markdownResult.value.docRefIdList.map((id) => props.documents?.find((doc) => doc.id == id))
)

const popupDocList: Ref<{ index: string; doc?: RefDocument; unitIds?: string[] }[]> = ref([])
const popupVisible = ref(false)

function onMarkdownClick(event: MouseEvent) {
    if (event.target instanceof HTMLElement) {
        const { dataset } = event.target
        if (dataset.type === 'docref') {
            event.preventDefault()
            popupDocList.value = []
            const docrefNodes = event.target.parentElement?.querySelectorAll<HTMLLinkElement>('[data-type="docref"]')
            if (docrefNodes?.length) {
                for (let i = 0; i < docrefNodes.length; i++) {
                    const {
                        dataset: { docrefIndex, docrefId: _docrefId, docrefUnitIds },
                    } = docrefNodes.item(i)
                    if (docrefIndex) {
                        const index = Number.parseInt(docrefIndex)
                        const doc = refDocuments.value?.[index]
                        popupDocList.value.push({ index: `${index + 1}`, doc, unitIds: docrefUnitIds?.split(',') })
                    }
                }
                popupVisible.value = true
            }
        } else if (dataset.type === 'entity') {
            event.preventDefault()
            const title = event.target.innerText
            const entityIds = dataset.entityIds?.split(',')
            if (entityIds?.length) {
                const targetEntities = props.entities?.filter((e) => entityIds.includes(e.id))
                if (targetEntities) {
                    openEntity(title, targetEntities)
                }
            }
        }
    }
}

function openDoc(doc: RefDocument | undefined, unitIds?: string[]) {
    if (doc) {
        emit('open-document', doc.id, doc.title, unitIds)
        popupVisible.value = false
    }
}

function openEntity(title: string, entities: MarkdownEntity[]) {
    emit('open-entity', title, entities)
}
</script>

<style scoped lang="less">
.knowledge-markdown {
    :deep(.markdown) {
        .markdown-docref-group {
            font-weight: 600;
            font-size: 10px;
            color: #5e5e5e;
            display: inline-flex;
            vertical-align: top;
            height: 22px;
            gap: 4px;
            align-items: center;
        }

        .markdown-docref {
            width: 16px;
            height: 16px;
            background: #edf5ff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .markdown-entity {
            color: #1770e5;
        }
    }

    .docref-popup-title {
        padding: 16px;
        font-weight: 600;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.9);
        line-height: 26px;
    }

    .docref-popup-body {
        padding: 0 16px 6px;
    }

    .docref-popup-item {
        position: relative;
        background: #f3f3f3;
        border-radius: 12px;
        margin-bottom: 10px;
        padding: 12px 16px 12px 36px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.9);
        line-height: 22px;
        min-height: 46px;

        &::before {
            content: var(--docref-popup-item-index);
            position: absolute;
            left: 16px;
            top: 15px;
            width: 16px;
            height: 16px;
            background: #edf5ff;
            border-radius: 8px;
            font-weight: 600;
            font-size: 10px;
            color: #5e5e5e;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
}
</style>
