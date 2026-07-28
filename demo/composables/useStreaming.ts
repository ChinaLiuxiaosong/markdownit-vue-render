import { computed, ref, watch } from 'vue'

export type StreamingMode = 'char' | 'word' | 'line'

export function useStreaming(content: string) {
    const mode = ref<StreamingMode>('char')
    const interval = ref(30)
    const isPlaying = ref(false)
    const visibleIndex = ref(0)

    const tokens = computed(() => {
        const src = content
        if (mode.value === 'char') {
            return Array.from(src)
        }
        if (mode.value === 'word') {
            return src.split(/(\s+|[，。、；：？！\"\"''（）【】\[\]{}]|\n)/).filter(Boolean)
        }
        return src.split('\n')
    })

    const visibleSource = computed(() => tokens.value.slice(0, visibleIndex.value).join(''))

    let timer: ReturnType<typeof setTimeout> | null = null

    function tick() {
        if (!isPlaying.value) return
        if (visibleIndex.value >= tokens.value.length) {
            isPlaying.value = false
            return
        }
        visibleIndex.value += 1
        timer = setTimeout(tick, interval.value)
    }

    function start() {
        if (isPlaying.value) return
        // 点击播放时从头开始流式渲染
        stop()
        visibleIndex.value = 0
        isPlaying.value = true
        tick()
    }

    function stop() {
        isPlaying.value = false
        if (timer) {
            clearTimeout(timer)
            timer = null
        }
    }

    function reset() {
        stop()
        visibleIndex.value = 0
    }

    function showAll() {
        stop()
        visibleIndex.value = tokens.value.length
    }

    watch(
        () => content,
        () => {
            showAll()
        }
    )

    watch(
        () => tokens.value.length,
        () => {
            showAll()
        }
    )

    return {
        mode,
        interval,
        isPlaying,
        visibleSource,
        start,
        stop,
        reset,
    }
}
