import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'vue-json-pretty/lib/styles.css';
import JsonViewer from "vue3-json-viewer"
import dayjs from 'dayjs'
import axios from 'axios'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(ElementPlus)
app.use(JsonViewer)

// axios.defaults.baseURL = '/api'
app.config.globalProperties.$http = axios

app.config.warnHandler = () => null;
app.mount('#app')