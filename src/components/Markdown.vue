<template>
    <div class="markdown">
        <MarkdownRender :tokens="tokens">
            <template v-if="$slots.default" #default="slot">
                <slot v-bind="slot"></slot>
            </template>
        </MarkdownRender>
    </div>
</template>

<script setup lang="ts">
import type MarkdownIt from 'markdown-it'
import { computed } from 'vue'
import { createDefaultMarkdownIt } from '../core'
import { MarkdownRender } from '../render'
import '../style.less'

export type MarkdownEnv = {}

const props = withDefaults(
    defineProps<{
        content?: string
        markdownit?: MarkdownIt
    }>(),
    {
        markdownit: () => createDefaultMarkdownIt(),
    }
)

const tokens = computed(() => (props.content?.trim() ? props.markdownit.parse(props.content, {}) : []))
</script>

<style scoped lang="less"></style>
