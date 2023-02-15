<template>
    <div>
        <!-- <el-button round @click="uploadDialog">
            上传Charles.har文件&nbsp;<el-icon>
                <DocumentAdd />
            </el-icon>
        </el-button> -->

        <el-dialog v-model="uploadDialogBl" title="上传Charles.har文件">
            <el-form>
                <el-form-item label="模板名称">
                    <el-input></el-input>
                </el-form-item>
                <el-form-item label="HAR文件">
                    <el-upload class="el-upload-demo" action="" accept=".har">
                        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                        <div class="el-upload__text">
                            点击 或者 <em>拖拽</em>
                        </div>
                        <template #tip>
                            <div class="el-upload__tip">
                                请上传HAR文件
                            </div>
                        </template>
                    </el-upload>
                </el-form-item>

            </el-form>
        </el-dialog>

        <el-table v-loading='loading' :data="tempInfo" stripe fit>
            <el-table-column label="TempId" prop="id" type="index" :index="indexMethod" width="100%"></el-table-column>
            <el-table-column label="模板名称" prop="temp_name"></el-table-column>
            <el-table-column label="项目名称" prop="project_name"></el-table-column>
            <el-table-column label="API数量" prop="api_count"></el-table-column>
            <el-table-column label="关联用例-Id" prop="case_info" :formatter="formatterData"></el-table-column>
            <el-table-column label="创建时间" prop="created_at"></el-table-column>
            <el-table-column label="修改时间" prop="updated_at"></el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button type="success" plain :loading="scope.row.runLoading"
                        @click="setDialogVisible(scope.row)">运行</el-button>
                    <el-button type="primary" plain @click="getTempData(scope.row)"
                        :loading="scope.row.dataLoading">查看详情</el-button>
                    
                </template>
            </el-table-column>
        </el-table>

        <!-- 详情弹窗 -->
        <el-dialog v-model='myDialog' width="90%" :title="tempTitle">
            <temp-data :temp-data="thisTempData"></temp-data>
        </el-dialog>
        <!-- 运行用例弹窗 -->
        <el-dialog v-model="dialogVisible" title="Tips" width="30%">
            <span>模板 [ {{ tempId }} - {{ tempName }} ] 包含以下用例</span>
            <el-table :data="thisCaseInfo">
                <el-table-column label="CaseId" prop="case_id" width="100%"></el-table-column>
                <el-table-column label="CaseName" prop="case_name"></el-table-column>
            </el-table>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="runCase(tempRow)">确认</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import TempData from './TempData.vue'
import { ElNotification } from 'element-plus'
import { ElMessage } from 'element-plus'
export default {
    name: "MyTempInfo",

    components: {
        TempData
    },

    props: {
        'tempInfo': Array
    },

    data() {
        return {
            loading: !this.tempInfo ? true : false,
            myDialog: false,
            uploadDialogBl: false,
            thisTempData: [],
            tempTitle: null,
            dialogVisible: false,
            tempName: null,
            tempId: null,
            tempRow: null,
            thisCaseInfo: []
        }
    },

    methods: {
        indexMethod(index) {
            return this.tempInfo[index]['id']
        },

        setDialogVisible(row) {
            this.dialogVisible = true
            this.tempName = row.temp_name
            this.tempId = row.id
            this.tempRow = row
            this.thisCaseInfo = []
            for (var x in row.case_info) {
                this.thisCaseInfo.push({ 'case_id': row.case_info[x]['id'], 'case_name': row.case_info[x]['name'] })
            }
        },
        // 模板详情数据
        async getTempData(row) {
            this.tempTitle = row.temp_name
            row.dataLoading = true
            var temp_ = []
            var dialog_ = false
            await this.$http.get('template/data/list?temp_id=' + row.id).then(
                function (response) {
                    row.dataLoading = false
                    temp_ = response.data
                    dialog_ = true
                }
            ).catch(function (error) {
                row.dataLoading = false
                ElMessage.error(error.message)
            })
            this.myDialog = dialog_
            this.thisTempData = temp_
        },

        // 按模板运行数据
        async runCase(row) {
            this.dialogVisible = false
            row.runLoading = true
            ElNotification.success({
                title: 'Success',
                message: '开始执行 模板ID: ' + row.id,
                offset: 200,
            })
            await this.$http.post('/runCase/temp', [row.id]).then(
                function (response) {
                    row.runLoading = false
                    if (response.data.code == 0) {
                        var msg = ''
                        for (var x in response.data.data.allure_report){
                            msg += '<a href="' + response.data.data.allure_report[x] + '/index.html" target="_blank">查看用例[' + x + ']的报告</a><br>'
                        }
                        ElNotification({
                            title: '测试报告',
                            message: msg,
                            duration: 0,
                            type: 'success',
                            position: 'bottom-right',
                            dangerouslyUseHTMLString: true,
                        })
                    } else {
                        ElNotification.warning({
                            title: 'Warning',
                            message: '模板\n[ ' + row.id + '-' + row.temp_name + ' ] 执行失败',
                            offset: 200,
                        })
                    }
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
                ElNotification.error({
                    title: 'Error',
                    message: '执行失败 模板ID: ' + row.id,
                    offset: 200,
                })
                row.runLoading = false
            })
        },

        uploadDialog() {
            this.uploadDialogBl = true
        },

        formatterData(row) {
            var arrCaseId = []
            for (var x in row.case_info) {
                arrCaseId.push(row.case_info[x]['id'])
            }
            return arrCaseId.join()
        },

        getTime(row, column, cellValue, index) {
            return this.dataFilter(cellValue)
        }
    }
}
</script>


<style>
.el-upload-demo {
    height: 220px;
    width: 100%;
    border: 1px dashed #DEDEDE;
    /* border-radius: 4px; */
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    border: 1px dashed #2260FF;
    font-size: 14px;
    margin-top: 30px;
    text-align: center;
    line-height: unset;
}
</style>