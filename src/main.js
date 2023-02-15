import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'

import ElementPlus from 'element-plus'; //为vue3项目特别更新的版本
import 'element-plus/dist/index.css';

import 'element-plus/theme-chalk/dark/css-vars.css'

import JsonViewer from "vue3-json-viewer"
import dayjs from 'dayjs'


import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(ElementPlus)
app.use(JsonViewer)
app.mixin({
    methods: {
        dataFilter(val, format = "YYYY-MM-DD hh:mm:ss") {
            console.log(val)
            val = parseInt(val);
            console.log(val)
            return dayjs(val).format(format);
        }
    }
})

import axios from 'axios'
// axios.defaults.baseURL = '/api'
app.config.globalProperties.$http = axios

app.mount('#app')