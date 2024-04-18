import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import {visualizer} from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import externalGlobals from "rollup-plugin-external-globals";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        viteCompression(),
        visualizer({
            gzipSize: true,
            brotliSize: true,
            emitFile: false,
            filename: "test.html", //分析图生成的文件名
            open: true //如果存在本地服务端口，将在打包后自动展示
        })
    ],
    build: {
        rollupOptions: {
            plugins: [
                externalGlobals({
                    vue: "Vue",
                    'vue-router': 'VueRouter',
                    'vue-demi': 'VueDemi',
                    pinia: "Pinia",
                    three: "THREE",
                    gsap: "gsap"
                }),
            ],
        },
    },
    resolve: {
        alias: [
            {
                find: "@",
                replacement: path.resolve(path.dirname("./"), "src"),
            },
        ],
    },
    server: {
        port: 7000,
    },
});
