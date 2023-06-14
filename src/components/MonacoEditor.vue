<template>
    <el-form>
        <el-form-item label="模板名称" label-width="100px" :required="true" placeholder="">
            <el-input v-model="localUiTempName" />
        </el-form-item>
        <el-form-item label="项目名称" label-width="100px" :required="true">
            <el-select v-model="localProjectName" placeholder="选择项目" @visible-change="handleVisibleChange">
                <el-option v-for="item in projects" :key="item.value" :label="item.value" :value="item.value"></el-option>
            </el-select>
        </el-form-item>
    </el-form>
    <el-button type="primary" @click="postValue()">提交</el-button>
    <br>
    <br>
    <div ref="main" style="width: 100%; height: 600px;"></div>
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
            projects: []
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
        async postValue() {
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
                        offset: 200,
                    })
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )

        },
        // 项目列表
        async handleVisibleChange(val) {
            if (!val) {
                return
            }
            var projects = []
            await this.$http({
                url: '/conf/get/setting',
                method: 'GET',
            }).then(
                function (response) {
                    projects = response.data.project
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            this.projects = projects
        },
    },
};
</script>
   
<style lang="scss" scoped></style>