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
                    <el-button type="success" plain :loading="scope.row.runLoading"
                        @click="setDialogVisible(scope.row)">运行
                    </el-button>
                    <el-button type="primary" plain @click="getCaseData(scope.row)"
                        :loading="scope.row.dataLoading">查看详情
                    </el-button>
                    <el-button type="primary" plain @click="replaceData(scope.row)">替换数据
                    </el-button>
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
        <!-- 替换数据弹窗 -->
        <el-dialog v-model='repData' width="60%" :title="caseId + ' ' + dataTitle + '      --从response中提取jsonpath路径'"
            @close='closeDialog'>
            <el-form-item :inline="true">
                <el-col :span="22">
                    <el-input v-model="responseValueInput" placeholder="请输入需要替换的原始数据" clearable minlength="3" />
                </el-col>
                <el-button type="info" plain @click="getResponseJsonPath">查询</el-button>
            </el-form-item>

            <el-table :data="responseValueJsonpath" stripe fit>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="JsonPath" prop="jsonpath"></el-table-column>
                <el-table-column label="选择数据">
                    <el-radio-group v-model="radio">
                        <el-radio label='1'>Option 1</el-radio>
                        <el-radio label='2'>Option 2</el-radio>
                    </el-radio-group>

                </el-table-column>
            </el-table>


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
            caseRow: null,
            repData: false,
            responseValueInput: '',
            responseValueJsonpath: [],
            radio: '2'
        }
    },

    methods: {
        indexMethod(index) {
            return this.caseInfo[index]['case_id']
        },
        indexMethodJsonpath(index) {

        },

        // 运行窗口
        setDialogVisible(row) {
            this.dialogVisible = true
            this.caseName = row.name
            this.caseId = row.case_id
            this.caseRow = row
        },
        // 替换测试数据
        replaceData(row) {
            this.dataTitle = row.name
            this.caseId = row.case_id
            this.repData = true
        },

        // 清理替换窗口的数据
        closeDialog() {
            this.responseValueInput = ''
            this.responseValueJsonpath = []
        },

        // 获取jsonpath接口
        async getResponseJsonPath() {
            if (this.responseValueInput.length < 3) {
                ElMessage.warning('最小长度: 3')
                return
            }
            this.responseValueJsonpath = []
            var responseValueJsonpath = []
            await this.$http.get('/caseService/response/jsonpath/list?case_id=' + this.caseId + '&extract_contents=' + this.responseValueInput).then(
                function (response) {
                    for (var x in response.data.data) {
                        responseValueJsonpath = response.data.data[x]
                    }
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            this.responseValueJsonpath = responseValueJsonpath
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
            await this.$http.post('/runCase/case', [row.case_id]).then(
                function (response) {
                    row.runLoading = false
                    if (response.data.code == 0) {
                        ElNotification({
                            title: '测试报告',
                            message: '<a href="' + response.data.data.allure_report[row.case_id] + '/index.html" target="_blank">查看用例[' + row.case_id + ']的报告</a>',
                            duration: 0,
                            type: 'success',
                            position: 'bottom-right',
                            dangerouslyUseHTMLString: true,
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


<style scoped>
.el-link {
    margin-right: 8px;
}

.el-link .el-icon--right.el-icon {
    vertical-align: text-bottom;
}
</style>