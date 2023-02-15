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
                    <el-button type="primary" plain @click="getCaseData(scope.row)" :loading="scope.row.dataLoading">详情
                    </el-button>
                    <el-button type="primary" plain @click="replaceData(scope.row)">替换
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
        <el-dialog v-model='repData' width="70%" :close-on-click-modal=false :close-on-press-escape=false 
            :title="caseId + ' ' + dataTitle + '      --从response中提取jsonpath路径, 替换测试数据'" @close='closeDialog'>

            <!-- 原始数据查询 -->
            <el-form-item :inline="true">
                <el-input v-model="responseValueInput" placeholder="请输入需要替换的原始数据" clearable minlength="3">
                    <template #prepend>从Response中的value字段</template>
                    <template #append>
                        <el-button plain @click="getResponseJsonPath">查询</el-button>
                    </template>
                </el-input>
            </el-form-item>
            <!-- 选择jsonpath数据 -->
            <el-table :data="responseValueJsonpath" stripe fit v-show="responseValueJsonpath.length > 0">
                <el-table-column type="index"></el-table-column>
                <el-table-column label="用例序号.$.取值表达式" prop="jsonpath"></el-table-column>
                <el-table-column label="选择[建议第一条]" width="200px">
                    <template #default="scope">
                        <el-checkbox v-model=scope.row.checkbox @click.stop="checkboxClick(scope.row)" label="" />
                    </template>
                </el-table-column>
            </el-table>
            <br>
            <!-- 被替换数据的查询预览 -->
            <el-form-item :inline="true">
                <el-input v-model="fixedResponseValueJsonpath" placeholder="准备替换的数据" clearable minlength="3">
                    <template #prepend>预选表达式</template>
                    <template #append>
                        <el-button @click="getTestDataJsonpath">
                            使用[ {{ responseValueInput }} ]从测试数据的 url.params.data 预览查询</el-button>
                    </template>
                </el-input>
            </el-form-item>
            <el-radio-group v-model="tableLayout">
                <el-radio-button label="url" v-show="urlJsonpath.length > 0 ? true : false" />
                <el-radio-button label="params" v-show="parmaJsonpath.length > 0 ? true : false" />
                <el-radio-button label="data" v-show="dataJsonpath.length > 0 ? true : false" />
            </el-radio-group>
            <!-- url的表格 -->
            <el-table v-show="tableLayout == 'url'" :data="urlJsonpath" stripe fit>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="使用数据" prop="old_data"></el-table-column>
                <el-table-column label="通过这个表达式" prop="jsonpath"></el-table-column>
                <el-table-column label="用例序号" prop="number" width="100%"></el-table-column>
                <el-table-column label="替换成这样" prop="new_data"></el-table-column>
                <el-table-column label="操作" width="65px">
                    <template #default="scope">
                        <el-switch v-model="scope.row.rep" active-text="替换" inactive-text="未替换"
                            :loading="scope.row.urlLoading" style="--el-switch-on-color: #67C23A;"
                            @click="repCaseData(scope.row, 'url')" inline-prompt></el-switch>
                    </template>
                </el-table-column>
            </el-table>

            <!-- params的表格 -->
            <el-table v-show="tableLayout == 'params'" :data="parmaJsonpath" stripe fit>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="使用数据" prop="old_data"></el-table-column>
                <el-table-column label="通过这个表达式从params取值" prop="jsonpath"></el-table-column>
                <el-table-column label="用例序号" prop="number" width="100%"></el-table-column>
                <el-table-column label="替换成这样" prop="new_data"></el-table-column>
                <el-table-column label="操作" width="65px">
                    <template #default="scope">
                        <el-switch v-model="scope.row.rep" active-text="替换" inactive-text="未替换"
                            :loading="scope.row.paramsLoading" style="--el-switch-on-color: #67C23A;"
                            @click="repCaseData(scope.row, 'params')" inline-prompt></el-switch>
                    </template>
                </el-table-column>
            </el-table>

            <!-- data的表格 -->
            <el-table v-show="tableLayout == 'data'" :data="dataJsonpath" stripe fit>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="使用数据" prop="old_data"></el-table-column>
                <el-table-column label="通过这个表达式从data取值" prop="jsonpath"></el-table-column>
                <el-table-column label="用例序号" prop="number" width="100%"></el-table-column>
                <el-table-column label="替换成这样" prop="new_data"></el-table-column>
                <el-table-column label="操作" width="65px">
                    <template #default="scope">
                        <el-switch v-model="scope.row.rep" active-text="替换" inactive-text="未替换"
                            :loading="scope.row.caseDataLoading" style="--el-switch-on-color: #67C23A;"
                            @click="repCaseData(scope.row, 'data')" inline-prompt></el-switch>
                    </template>
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
            fixedResponseValueJsonpath: '',
            urlJsonpath: [],
            parmaJsonpath: [],
            dataJsonpath: [],
            tableLayout: '',
        }
    },

    methods: {
        indexMethod(index) {
            return this.caseInfo[index]['case_id']
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
            this.fixedResponseValueJsonpath = ''
            this.urlJsonpath = []
            this.parmaJsonpath = []
            this.dataJsonpath = []
            this.tableLayout = ''
        },

        // jsonpath多选框
        checkboxClick(row) {
            row.checkbox = true
            this.fixedResponseValueJsonpath = row.jsonpath
            for (var x in this.responseValueJsonpath) {
                if (this.responseValueJsonpath[x]['checkbox'] != row.checkbox['checkbox']) {
                    this.responseValueJsonpath[x]['checkbox'] = false
                }
            }
        },
        // 替换测试数据
        repCaseData(row, rep) {
            console.log(row);
            if (rep == 'url') {
                row.urlLoading = true
            } else if (rep == 'params') {
                row.paramsLoading = true
            } else if (rep == 'data') {
                row.caseDataLoading = true
            }

            if (rep == 'url') {
                row.urlLoading = false
            } else if (rep == 'params') {
                row.paramsLoading = false
            } else if (rep == 'data') {
                row.caseDataLoading = false
            }
        },

        // 测试数据预览查询
        async getTestDataJsonpath() {
            if (this.responseValueInput.length < 3) {
                ElMessage.warning('最小长度: 3')
                return
            }
            this.urlJsonpath = []
            this.parmaJsonpath = []
            this.dataJsonpath = []

            var urlStr = []
            var paramStr = []
            var dataStr = []
            await this.$http.get('/caseService/casedata/jsonpath/list?case_id=' + this.caseId + '&extract_contents=' + this.responseValueInput + '&new_str=' + this.fixedResponseValueJsonpath).then(
                function (response) {
                    urlStr = response.data['data']['url_list']['extract_contents']
                    for (var x in urlStr) {
                        urlStr[x]['rep'] = false
                        urlStr[x]['urlLoading'] = false
                    }
                    paramStr = response.data['data']['params_list']['extract_contents']
                    for (var x in paramStr) {
                        paramStr[x]['rep'] = false
                        paramStr[x]['paramsLoading'] = false
                    }
                    dataStr = response.data['data']['data_list']['extract_contents']
                    for (var x in dataStr) {
                        dataStr[x]['rep'] = false
                        dataStr[x]['caseDataLoading'] = false
                    }
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            this.urlJsonpath = urlStr
            this.parmaJsonpath = paramStr
            this.dataJsonpath = dataStr

            // 给复选框绑定上值
            if (this.urlJsonpath.length > 0) {
                this.tableLayout = 'url'
            } else if (this.parmaJsonpath.length > 0) {
                this.tableLayout = 'params'
            } else if (this.dataJsonpath.length > 0) {
                this.tableLayout = 'data'
            }
        },


        // 获取jsonpath接口
        async getResponseJsonPath() {
            if (this.responseValueInput.length < 3) {
                ElMessage.warning('最小长度: 3')
                return
            }
            this.responseValueJsonpath = []
            var responseValueJsonpath = []
            var fixedResponseValueJsonpath = ''
            await this.$http.get('/caseService/response/jsonpath/list?case_id=' + this.caseId + '&extract_contents=' + this.responseValueInput).then(
                function (response) {
                    for (var x in response.data.data) {
                        responseValueJsonpath = response.data.data[x]
                        for (var i in response.data.data[x]) {
                            if (i == 0) {
                                response.data.data[x][i]['checkbox'] = true
                                fixedResponseValueJsonpath = response.data.data[x][i]['jsonpath']
                            } else {
                                response.data.data[x][i]['checkbox'] = false
                            }
                        }
                    }
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            this.responseValueJsonpath = responseValueJsonpath
            this.fixedResponseValueJsonpath = fixedResponseValueJsonpath
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