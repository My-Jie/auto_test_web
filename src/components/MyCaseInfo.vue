<template>
    <div>
        <el-table v-loading='loading' :data="caseInfo" row-key="case_id" stripe fit>
            <el-table-column label="CaseId" prop="case_id" type="index" :index="indexMethod"
                width="100%"></el-table-column>
            <el-table-column label="用例名称" prop="name"></el-table-column>
            <el-table-column label="API数量" prop="api_count"></el-table-column>
            <el-table-column label="运行次数" prop="run_order"></el-table-column>
            <el-table-column label="创建时间" prop="created_at"></el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button type="primary" plain @click="getCaseData(scope.row)"
                        :loading="scope.row.dataLoading">查看详情</el-button>
                    <el-button type="success" plain :loading="scope.row.runLoading"
                        @click="setDialogVisible(scope.row)">运行</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 详情弹窗 -->
        <el-dialog v-model='myDialog' width="90%" :title="caseId + ' ' + dataTitle">
            <case-data :case-data="thisCaseData" :case-id="caseId"></case-data>
        </el-dialog>
        <!-- 运行用例弹窗 -->
        <el-dialog v-model="dialogVisible" title="Tips" width="30%">
            <span>执行用例 [ {{ caseId }} - {{ caseName }} ]</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="runCase(caseRow)">确认</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import CaseData from './CaseData.vue';
import { ElNotification } from 'element-plus'
import { ElMessage } from 'element-plus'
export default {
    name: "MyCaseInfo",
    props: {
        'caseInfo': Array
    },

    components: {
        CaseData
    },

    data() {
        return {
            loading: !this.caseInfo ? true : false,
            myDialog: false,
            thisCaseData: [],
            caseId: null,
            dataTitle: null,
            dialogVisible: false,
            caseName: null,
            caseRow: null
        }
    },

    methods: {
        indexMethod(index) {
            return this.caseInfo[index]['case_id']
        },

        setDialogVisible(row) {
            this.dialogVisible = true
            this.caseName = row.name
            this.caseId = row.case_id
            this.caseRow = row
        },
        // 用例详情数据
        async getCaseData(row) {
            this.dataTitle = row.name
            this.caseId = row.case_id
            row.dataLoading = true
            var case_ = []
            var dialog_ = false
            await this.$http.get('/caseService/data/' + row.case_id).then(
                function (response) {
                    row.dataLoading = false
                    case_ = response.data['data']
                    for (var x in case_) {
                        case_[x].stopLoading = false
                        case_[x].failStopLoading = false
                        case_[x].isLoginLoading = false
                    }
                    dialog_ = true
                }
            ).catch(
                function (error) {
                    row.dataLoading = false
                    ElMessage.error(error.message)
                }
            )
            this.myDialog = dialog_
            this.thisCaseData = case_
        },

        // 运行用例数据
        async runCase(row) {
            this.dialogVisible = false
            row.runLoading = true
            ElNotification.success({
                title: 'Success',
                message: '开始执行 用例ID: ' + row.case_id,
                offset: 200,
            })
            await this.$http.post('/runCase/case11', [row.case_id]).then(
                function (response) {
                    row.runLoading = false
                    if (response.data.code == 0) {
                        ElNotification.success({
                            title: 'Success',
                            message: '用例\n[ ' + row.case_id + '-' + row.name + ' ]\n执行完成',
                            offset: 200,
                        })
                    } else {
                        ElNotification.warning({
                            title: 'Warning',
                            message: '用例\n[ ' + row.case_id + '-' + row.name + ' ] 执行失败',
                            offset: 200,
                        })
                    }
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
                ElNotification.error({
                    title: 'Error',
                    message: '执行失败 用例ID: ' + row.case_id,
                    offset: 200,
                })
                row.runLoading = false
            })
        }
    }
}
</script>