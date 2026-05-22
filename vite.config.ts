import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron/simple'
import path from 'node:path'

export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),

        electron({
            main: {
                entry: 'electron/main.ts'
            },

            preload: {
                input: 'electron/preload.ts',
                vite: {
                    build: {
                        rollupOptions: {
                            output: {
                                format: 'cjs',
                                entryFileNames: 'preload.cjs',
                            },
                        },
                    },
                },
            },
        }),
    ],

    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },

    optimizeDeps: {
        exclude: [
            'bufferutil',
            'utf-8-validate'
        ]
    },

    build: {
        outDir: 'dist',
        emptyOutDir: true
    },
})