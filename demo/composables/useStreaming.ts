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

    // 临时补全未闭合的代码块围栏，使流式输出时代码块能正确渲染
    const renderSource = computed(() => {
        const src = visibleSource.value
        const lines = src.split('\n')
        let open = false
        let lastFence = ''
        for (const line of lines) {
            const trimmed = line.trim()
            if (/^```|^~~~/.test(trimmed)) {
                open = !open
                lastFence = trimmed.match(/^(`+|~+)/)?.[0] || '```'
            }
        }
        if (open) {
            return src + '\n' + lastFence
        }
        return src
    })

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
        isPlaying.value = true
        if (visibleIndex.value >= tokens.value.length) {
            visibleIndex.value = 0
        }
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

    watch(
        () => content,
        () => {
            reset()
        }
    )

    return {
        mode,
        interval,
        isPlaying,
        visibleSource,
        renderSource,
        start,
        stop,
        reset,
    }
}
