import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ mode }) => {
    const isLib = mode === 'lib'

    const shared = {
        plugins: [vue()],
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
            },
        },
    }

    if (isLib) {
        return {
            ...shared,
            build: {
                lib: {
                    entry: resolve(__dirname, 'src/index.ts'),
                    name: 'MarkdownitVueRender',
                    fileName: (format) =>
                        format === 'es' ? 'markdownit-vue-render.mjs' : 'markdownit-vue-render.cjs',
                    formats: ['es', 'cjs'],
                },
                rollupOptions: {
                    external: ['vue', 'markdown-it', 'markdown-it-cjk-friendly'],
                    output: {
                        exports: 'named',
                        globals: {
                            vue: 'Vue',
                            'markdown-it': 'MarkdownIt',
                            'markdown-it-cjk-friendly': 'MarkdownItCjkFriendly',
                        },
                    },
                },
                outDir: 'dist',
                emptyOutDir: true,
                cssCodeSplit: false,
            },
        }
    }

    return {
        ...shared,
        root: resolve(__dirname, 'demo'),
        base: '/markdownit-vue-render/',
        build: {
            outDir: resolve(__dirname, 'dist-demo'),
            emptyOutDir: true,
        },
        resolve: {
            alias: [
                { find: '@', replacement: resolve(__dirname, 'src') },
                { find: /^markdownit-vue-render\/style\.css$/, replacement: resolve(__dirname, 'src/style.less') },
                { find: /^markdownit-vue-render$/, replacement: resolve(__dirname, 'src/index.ts') },
            ],
        },
    }
})
