<template>
    <div class="streaming-markdown">
        <div class="streaming-controls">
            <div class="streaming-control-group">
                <label>模式</label>
                <select v-model="mode">
                    <option value="char">逐字</option>
                    <option value="word">逐词</option>
                    <option value="line">逐段</option>
                </select>
            </div>
            <div class="streaming-control-group">
                <label>间隔 (ms)</label>
                <input v-model.number="interval" type="number" min="10" max="1000" step="10" />
            </div>
            <button class="streaming-play" :disabled="isPlaying" @click="start">
                {{ isPlaying ? '播放中...' : '播放' }}
            </button>
            <button class="streaming-reset" :disabled="isPlaying" @click="reset">
                重置
            </button>
        </div>

        <slot
            :source="visibleSource"
            :is-playing="isPlaying"
        />
    </div>
</template>

<script setup lang="ts">
import { useStreaming } from '../composables/useStreaming'

const props = defineProps<{
    content: string
}>()

const { mode, interval, isPlaying, visibleSource, start, reset } = useStreaming(props.content)
</script>

<style scoped lang="less">
.streaming-markdown {
    .streaming-controls {
        display: flex;
        align-items: flex-end;
        gap: 12px;
        margin-bottom: 16px;
        flex-wrap: wrap;
    }

    .streaming-control-group {
        display: flex;
        flex-direction: column;
        gap: 4px;

        label {
            font-size: 12px;
            color: #718096;
        }

        select,
        input {
            padding: 6px 10px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-size: 13px;
            background: #fff;
        }

        input {
            width: 80px;
        }
    }

    .streaming-play,
    .streaming-reset {
        padding: 7px 16px;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }

    .streaming-play {
        background: #3d5ec2;
        color: #fff;
    }

    .streaming-reset {
        background: #edf2f7;
        color: #4a5568;
    }
}
</style>
