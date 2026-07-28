<template>
    <Popup
        v-model:show="show"
        position="bottom"
        round
        close-on-popstate
        closeable
        safe-area-inset-bottom
        v-bind="$attrs"
    >
        <div v-if="$slots.title || title" class="popup-title">
            <slot name="title">
                <div class="popup-center-title">{{ title }}</div>
            </slot>
        </div>
        <div class="popup-body">
            <slot></slot>
        </div>
    </Popup>
</template>

<script setup lang="ts">
import { Popup } from 'vant'

defineOptions({ inheritAttrs: false })

const show = defineModel<boolean>('show', { default: false })

defineProps<{ title?: string }>()
</script>

<style scoped lang="less">
.popup-center-title {
    padding: 16px 0;
    font-weight: 600;
    font-size: 18px;
    color: rgba(0, 0, 0, 0.9);
    line-height: 26px;
    text-align: center;
}

.popup-body {
    overflow: hidden;
}
</style>
