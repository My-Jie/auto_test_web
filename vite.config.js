import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import monacoEditorPlugin from "vite-plugin-monaco-editor"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), monacoEditorPlugin.default({
        languageWorkers: ['json', 'editorWorkerService'],
        customWorkers: [{
            label: 'graphql',
            entry: 'monaco-graphql/dist/graphql.worker'
        }]
    })],
    base: './',
    server: {
        host: "0.0.0.0",
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000/',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },


})