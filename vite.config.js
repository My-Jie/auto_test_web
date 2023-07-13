import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin"

// https://vitejs.dev/config/
export default defineConfig({
    transpileDependencies: true,
    configureWebpack: {
        plugins: [new MonacoWebpackPlugin()],
    },
    plugins: [
        vue(),
    ],
    base: './',
    // server: {
    //     host: "0.0.0.0",
    //     port: 5173,
    //     proxy: {
    //         '/api': {
    //             target: 'http://127.0.0.1:8000/',
    //             changeOrigin: true,
    //             rewrite: (path) => path.replace(/^\/api/, '')
    //         }
    //     }
    // },
})