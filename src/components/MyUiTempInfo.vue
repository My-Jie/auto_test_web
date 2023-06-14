<template>
    <div>
        <el-table v-loading='loading' :data="uiTempInfo" stripe fit>
            <el-table-column label="TempId" prop="id" type="index" :index="indexMethod" width="100%"
                align="center"></el-table-column>
            <el-table-column label="项目名称" prop="project_name" align="center"></el-table-column>
            <el-table-column label="模板名称" prop="temp_name" align="center"></el-table-column>
            <el-table-column label="行数" prop="rows" align="center"></el-table-column>
            <el-table-column label="运行次数" prop="run_order" align="center"></el-table-column>
            <el-table-column label="操作" align="center" width="300">
                <template #default="scope">
                    <el-button type="success" plain :loading="scope.row.runLoading">运行</el-button>&nbsp;
                    <el-button-group class="ml-4">
                        <el-button type="primary" plain @click="getUiTempData(scope.row)"
                            :loading="scope.row.dataLoading">详情</el-button>
                        <el-button type="primary" plain :loading="scope.row.tempToCaseLoading">用例</el-button>
                    </el-button-group>&nbsp;
                    <el-button type="danger" plain :loading="scope.row.delLoading" @click="delDialogVisible(scope.row)">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 详情弹窗 -->
        <el-dialog v-model='dialogUiMonaco' width="70%" title="Python页面编辑器" :close-on-click-modal=false
            :close-on-press-escape=false @close='dialogUiMonaco = false' draggable>
            <monaco-editor v-if="dialogUiMonaco" :ui-temp-id="uiTempId" :ui-temp-name="uiTempName"
                :project-name="projectName" :ui-temp-value="uiTempValue"></monaco-editor>
        </el-dialog>

        <!-- 删除的窗口 -->
        <el-dialog v-model="delDialog" title="Tips" width="30%">
            <span>删除Playwright模板和测试数据 [ {{ uiTempId }} - {{ uiTempName }} ]</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="delDialog = false">取消</el-button>
                    <el-button type="primary" @click="delUiTemp(uiTempRow)">确认</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import MonacoEditor from "./MonacoEditor.vue"
import { ElNotification, ElMessage } from 'element-plus'

export default {
    name: "MyUiTempInfo",

    components: {
        MonacoEditor,
    },

    props: {
        'uiTempInfo': Array,
        'uiTempTotal': Number,
    },

    data() {
        return {
            loading: !this.uiTempInfo ? true : false,
            uiTempTitle: null,
            dialogUiMonaco: false,
            delDialog: false,
            uiTempRow: [],

            // 详情信息
            uiTempId: null,
            uiTempName: '',
            projectName: '',
            uiTempValue: ''
        }
    },

    methods: {
        indexMethod(index) {
            return this.uiTempInfo[index]['id']
        },
        // 模板详情数据
        async getUiTempData(row) {
            this.uiTempTitle = row.temp_name
            row.dataLoading = true
            var dialog_ = false
            var temp_ = ''
            await this.$http.get('/caseUi/get/playwright/data?temp_id=' + row.id).then(
                function (response) {
                    row.dataLoading = false
                    temp_ = response.data
                    dialog_ = true
                }
            ).catch(function (error) {
                row.dataLoading = false
                ElMessage.error(error.message)
            })

            this.dialogUiMonaco = dialog_

            // 详情信息
            this.uiTempId = temp_.id
            this.uiTempName = temp_.temp_name
            this.projectName = temp_.project_name
            this.uiTempValue = temp_.text
        },

        // 删除窗口
        delDialogVisible(row) {
            this.delDialog = true
            this.uiTempId = row.id
            this.uiTempName = row.temp_name
            this.uiTempRow = row
        },
        // 删除模板
        async delUiTemp(row) {
            var flag = false
            row.delLoading = true
            await this.$http({
                url: '/caseUi/del/playwright/data/' + row.id,
                method: 'DELETE',
            }).then(
                function () {
                    ElNotification.success({
                        title: 'Success',
                        message: '模板[ ' + row.temp_name + ' ] 删除成功',
                        offset: 200,
                    })
                    flag = true
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
            })

            if (flag) {
                for (var x in this.uiTempInfo) {
                    if (this.uiTempInfo[x].id == row.id) {
                        this.uiTempInfo.splice(x, 1)
                        break
                    }
                }
            }

            row.delLoading = false
            this.delDialog = false
        },
    }
}
</script>

<style lang="scss" scoped></style>