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
        <div class="streaming-panels">
            <div class="streaming-panel">
                <h4>原文输出</h4>
                <pre class="streaming-source">{{ visibleSource }}</pre>
            </div>
            <div class="streaming-panel">
                <h4>同步渲染</h4>
                <div class="streaming-render">
                    <Markdown :content="visibleSource" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Markdown } from 'markdownit-vue-render'

const props = defineProps<{
    content: string
}>()

const mode = ref<'char' | 'word' | 'line'>('char')
const interval = ref(50)
const isPlaying = ref(false)
const visibleIndex = ref(0)

const tokens = computed(() => {
    const src = props.content
    if (mode.value === 'char') {
        return Array.from(src)
    }
    if (mode.value === 'word') {
        // 按空白或标点切分，保留分隔符
        return src.split(/(\s+|[，。、；：？！\"\"''（）【】\[\]{}]|\n)/).filter(Boolean)
    }
    return src.split('\n')
})

const visibleSource = computed(() => tokens.value.slice(0, visibleIndex.value).join(''))

let timer: ReturnType<typeof setTimeout> | null = null

function start() {
    if (isPlaying.value) return
    isPlaying.value = true
    if (visibleIndex.value >= tokens.value.length) {
        visibleIndex.value = 0
    }
    tick()
}

function tick() {
    if (!isPlaying.value) return
    if (visibleIndex.value >= tokens.value.length) {
        isPlaying.value = false
        return
    }
    visibleIndex.value += 1
    timer = setTimeout(tick, interval.value)
}

function reset() {
    stop()
    visibleIndex.value = 0
}

function stop() {
    isPlaying.value = false
    if (timer) {
        clearTimeout(timer)
        timer = null
    }
}

watch(
    () => props.content,
    () => {
        reset()
    }
)

watch(mode, () => {
    reset()
})
</script>

<style scoped lang="less">
.streaming-markdown {
    .streaming-controls {
        display: flex;
        align-items: flex-end;
        gap: 16px;
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

    .streaming-panels {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
    }

    .streaming-panel {
        h4 {
            margin: 0 0 8px;
            font-size: 13px;
            color: #718096;
            font-weight: 600;
        }
    }

    .streaming-source,
    .streaming-render {
        margin: 0;
        padding: 16px;
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        min-height: 200px;
        max-height: 400px;
        overflow: auto;
        font-size: 13px;
        line-height: 1.6;
    }

    .streaming-source {
        white-space: pre-wrap;
        word-break: break-word;
        color: #2d3748;
    }

    .streaming-render {
        background: #fff;
    }
}
</style>
