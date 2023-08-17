<template>
    <el-form>
        <el-form-item label="模板名称" label-width="100px" :required="true" placeholder="">
            <el-input v-model="localUiTempName" />
        </el-form-item>
        <el-form-item label="系统名称" label-width="100px" :required="true">
            <el-select v-model="localProjectName" placeholder="选择系统" @visible-change="handleVisibleChange">
                <el-option v-for="item in projects" :key="item.code" :label="item.code" :value="item.code"></el-option>
            </el-select>
        </el-form-item>
    </el-form>
    <el-button type="primary" @click="postValue()" :loading="loadingPost">提交</el-button>
    <el-button type="primary" @click="getCaseData()" :loading="loadingGet">提取数据</el-button>
    <br>
    <br>
    <div ref="main" style="width: 100%; height: 500px;"></div>

    <!-- 提取数据的弹窗 -->
    <el-dialog v-model='dialogPlaywrightData' width="50%" title="获取到的可替换内容" :close-on-click-modal=false
        @close='dialogPlaywrightData = false' draggable>
        <el-table :data="caseInfo" stripe fit>
            <el-table-column label="Row" prop="row" type="index" :index="indexMethod" width="50"
                align="center"></el-table-column>
            <el-table-column label="原内容" prop="data" align="center"></el-table-column>
        </el-table>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogPlaywrightData = false">取消</el-button>
                <el-button type="primary" @click="downExcel()" :loading="downExcelLoading">下载</el-button>
            </span>
        </template>
    </el-dialog>
</template>
   
<script>
import * as monaco from "monaco-editor";
import { toRaw } from "vue";
import { ElNotification } from 'element-plus'
import { ElMessage } from 'element-plus'

export default {
    name: "MyMonaco",

    props: {
        'uiTempId': Number,
        'uiTempName': String,
        'projectName': String,
        'uiTempValue': String,
    },

    data() {
        return {
            monacoEditor: null,
            localUiTempId: this.uiTempId,
            localUiTempName: this.uiTempName,
            localProjectName: this.projectName,
            localUiTempValue: this.uiTempValue,
            projects: [],

            loadingPost: false,
            loadingGet: false,
            dialogPlaywrightData: false,
            downExcelLoading: false,

            caseInfo: []
        };
    },

    mounted() {
        this.init();
    },
    methods: {
        init() {
            // 使用 - 创建 monacoEditor 对象
            this.monacoEditor = monaco.editor.create(this.$refs.main, {
                theme: "vs-dark", // 主题
                value: this.localUiTempValue, // 默认显示的值
                language: "python",
                folding: true, // 是否折叠
                foldingHighlight: true, // 折叠等高线
                foldingStrategy: "indentation", // 折叠方式  auto | indentation
                showFoldingControls: "always", // 是否一直显示折叠 always | mouseover
                disableLayerHinting: true, // 等宽优化
                emptySelectionClipboard: false, // 空选择剪切板
                selectionClipboard: false, // 选择剪切板
                automaticLayout: true, // 自动布局
                codeLens: false, // 代码镜头
                scrollBeyondLastLine: false, // 滚动完最后一行后再滚动一屏幕
                colorDecorators: true, // 颜色装饰器
                accessibilitySupport: "auto", // 辅助功能支持  "auto" | "off" | "on"
                lineNumbers: "on", // 行号 取值： "on" | "off" | "relative" | "interval" | function
                lineNumbersMinChars: 5, // 行号最小字符   number
                enableSplitViewResizing: false,
                readOnly: false, //是否只读  取值 true | false
            })
        },
        // 提交数据
        async postValue() {
            this.loadingPost = true
            await this.$http({
                url: '/caseUi/add/playwright',
                method: 'PUT',
                data: JSON.stringify({
                    id: this.localUiTempId,
                    project_name: this.localProjectName,
                    temp_name: this.localUiTempName,
                    text: toRaw(this.monacoEditor).getValue()
                }),
                headers: {
                    'content-type': "application/json"
                }
            }).then(
                function () {
                    ElNotification.success({
                        title: 'Success',
                        message: '保存成功',
                    })
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            this.loadingPost = false

        },
        // 提取文本中的数据
        async getCaseData() {

            this.loadingGet = true
            var flag = this.dialogPlaywrightData
            var caseData = []
            await this.$http({
                url: '/caseUi/get/playwright/case/' + this.localUiTempId,
                method: 'GET',
            }).then(
                function (response) {
                    flag = true
                    caseData = response.data.data
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            this.dialogPlaywrightData = flag
            this.loadingGet = false
            this.caseInfo = caseData
        },
        // 项目列表
        async handleVisibleChange(val) {
            if (!val) {
                return
            }
            var projects = []
            await this.$http({
                url: '/conf/get/project',
                method: 'GET',
            }).then(
                function (response) {
                    projects = response.data
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            this.projects = projects
        },
        // 下载数据excel
        async downExcel() {

            var localUiTempName = this.localUiTempName
            await this.$http({
                url: '/caseUi/down/playwright/data/' + this.localUiTempId,
                method: 'GET',
                responseType: 'blob'
            }).then(
                function (response) {
                    var blobUrl = window.URL.createObjectURL(new Blob([response.data]))
                    var link = document.createElement('a')
                    link.href = blobUrl
                    link.setAttribute('download', localUiTempName + '.xlsx')
                    document.body.appendChild(link)
                    link.click()
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
            })
        },

        indexMethod(index) {
            return this.caseInfo[index]['row']
        },
    },
};
</script>
   
<style scoped></style>