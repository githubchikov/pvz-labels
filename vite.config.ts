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
                entry: 'electron/main.ts',
            },

            preload: {
                input: 'electron/preload.ts',
                vite: {
                    build: {
                        rollupOptions: {
                            output: {
                                format: 'es',
                                entryFileNames: 'preload.mjs',
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
        }
    },

    build: {
        outDir: 'dist',
        emptyOutDir: true
    },
})