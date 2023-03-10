<template>
    <div>
        <el-table v-loading='loading' :data="caseInfo" row-key="case_id" stripe fit>
            <el-table-column label="CaseId" prop="case_id" type="index" :index="indexMethod" width="100%"
                align="center"></el-table-column>
            <el-table-column label="" width="40" align="center">
                <template #default="scope">
                    <el-button :icon="Edit" size="small" v-if="scope.row.edit" @click="scope.row.edit = false"></el-button>
                    <el-button :icon="Check" size="small" v-if="!scope.row.edit" @click="updateName(scope.row)"></el-button>
                </template>
            </el-table-column>
            <el-table-column label="用例名称" prop="name" width="500px">
                <template #default="scope">
                    <div v-if="scope.row.name && scope.row.edit">{{ scope.row.temp_name }}-{{ scope.row.case_name }}</div>
                    <el-input v-model="scope.row.case_name" placeholder="可输入" v-if="scope.row.edit == false"
                        @keyup.enter.native="updateName(scope.row)"></el-input>
                </template>
            </el-table-column>
            <el-table-column label="API数量" prop="api_count" width="100%" align="center"></el-table-column>
            <el-table-column label="运行次数" prop="run_order" align="center"></el-table-column>
            <el-table-column label="创建时间" prop="created_at" align="center"></el-table-column>
            <el-table-column label="操作" align="center" width="450">
                <template #default="scope">
                    <el-button type="success" plain :loading="scope.row.runLoading" @click="setDialogVisible(scope.row)">运行
                    </el-button>&nbsp;
                    <el-button-group class="ml-4">
                        <el-button type="primary" plain @click="getCaseData(scope.row)"
                            :loading="scope.row.dataLoading">详情</el-button>
                        <el-button type="primary" plain @click="copyDialogVisible(scope.row)"
                            :loading="scope.row.copyLoading">复制</el-button>
                        <el-button type="primary" plain @click="getGather(scope.row)"
                            :loading="scope.row.gatherLoading">数据</el-button>
                        <el-popconfirm width="250" confirm-button-text="数据集EXCEL" cancel-button-text="原用例JSON"
                            confirm-button-type="primary" cancel-button-type="primary" @cancel="caseDown(scope.row)"
                            @confirm="caseDataSet(scope.row)" :icon="Download" icon-color="#626AEF" title="下载用例">
                            <template #reference>
                                <el-button type="primary" plain>下载</el-button>
                            </template>
                        </el-popconfirm>
                    </el-button-group>&nbsp;
                    <el-button type="Info" plain>
                        <el-link :href="scope.row.allureReport" target="_blank" :underline="false">报告</el-link>
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
        <!-- 复制用例弹窗 -->
        <el-dialog v-model="setCopyDialogVisible" title="Tips" width="30%">
            <span>复制用例 [ {{ caseId }} - {{ caseName }} ]</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="setCopyDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="copyCase(caseRow)">确认</el-button>
                </span>
            </template>
        </el-dialog>
        <!-- 数据集的弹窗 -->
        <el-dialog v-model="gatherDialog" :title="caseId + '-' + caseName + '-数据集'" v-if="gatherDialog" width="70%">
            <my-gather :gather-data="gatherData"></my-gather>
        </el-dialog>
    </div>
</template>

<script>

import CaseData from './CaseData.vue'
import MyGather from './MyGather.vue'
import { ElNotification } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Edit, Check, Download } from '@element-plus/icons-vue'
export default {
    name: "MyCaseInfo",
    props: {
        'caseInfo': Array
    },

    components: {
        CaseData,
        MyGather
    },

    data() {
        return {
            Edit,
            Check,
            Download,
            loading: !this.caseInfo ? true : false,
            myDialog: false,
            thisCaseData: [],
            caseId: null,
            dataTitle: null,
            dialogVisible: false,
            setCopyDialogVisible: false,
            caseName: null,
            caseRow: null,
            gatherDialog: false,
            gatherData: []
        }
    },

    methods: {
        async updateName(row) {
            row.checkLoading = true
            await this.$http({
                url: '/caseService/name/edit',
                method: 'PUT',
                data: JSON.stringify({
                    case_id: row.case_id,
                    new_name: row.case_name
                }),
                headers: {
                    'content-type': "application/json"
                }
            }).then(
                function () {
                    ElNotification.success({
                        title: 'Success',
                        message: '修改成功',
                        offset: 200,
                    })
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            row.checkLoading = false
            row.edit = true
        },
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
        // 复制窗口
        copyDialogVisible(row) {
            this.setCopyDialogVisible = true
            this.caseName = row.name
            this.caseId = row.case_id
            this.caseRow = row
        },
        // 获取数据集
        async getGather(row) {
            row.gatherLoading = true
            this.caseName = row.name
            this.caseId = row.case_id
            var gather_data = []
            var gatherDialog = false
            await this.$http({
                url: '/caseDdt/data/gather',
                method: "GET",
                params: {
                    case_id: row.case_id
                }
            }).then(
                function (response) {
                    gather_data = response.data
                    row.gatherLoading = false
                    gatherDialog = true
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                    row.gatherLoading = false
                })
            this.gatherDialog = gatherDialog
            this.gatherData = gather_data

        },
        // 下载数据集
        async caseDataSet(row) {
            await this.$http({
                url: '/caseDdt/down/data/gather',
                method: 'GET',
                params: {
                    case_id: row.case_id
                },
                responseType: 'blob'
            }).then(
                function (response) {
                    var blobUrl = window.URL.createObjectURL(new Blob([response.data]))
                    var link = document.createElement('a')
                    link.href = blobUrl
                    link.setAttribute('download', row.temp_name + '-' + row.case_name + '.xlsx')
                    document.body.appendChild(link)
                    link.click()
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
            })
        },
        // 下载用例
        async caseDown(row) {
            await this.$http({
                url: '/caseService/download/data/' + row.case_id,
                method: 'GET',
                headers: {
                    responseType: 'blob'
                }
            }).then(
                function (response) {
                    var blob = new Blob([JSON.stringify(response.data, null, 2)])
                    var blobUrl = window.URL.createObjectURL(blob)

                    var a = document.createElement('a')
                    a.style.display = 'none'
                    a.download = response.data.case_name + '.json' // 自定义下载的文件名
                    a.href = blobUrl
                    document.body.appendChild(a)
                    a.click()
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
            })
        },
        // 复制测试用例
        async copyCase(row) {
            this.setCopyDialogVisible = false
            row.copyLoading = true
            console.log(row);
            await this.$http({
                url: '/caseService/copy/case',
                method: 'GET',
                params: {
                    case_id: row.case_id
                }
            }).then(
                function (response) {
                    ElNotification.success({
                        title: 'Success',
                        message: '用例[ ' + row.name + ' ] 复制成功 新用例名称 [ ' + response.data.case_name + ' ]',
                        offset: 200,
                    })
                    row.copyLoading = false
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
                row.copyLoading = false
            })
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
                        case_[x].sleepLoading = false
                        case_[x].descriptionLoading = false
                        case_[x].edit = true
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
            var flag = false
            var run_order = null
            ElNotification.success({
                title: 'Success',
                message: '开始执行 用例ID: ' + row.case_id,
                offset: 200,
            })
            await this.$http.post('/runCase/case', [row.case_id]).then(
                function (response) {
                    row.runLoading = false
                    if (response.data.code == 0) {
                        var case_report = response.data.data.allure_report[row.case_id]
                        if (!case_report.is_fail) {
                            ElNotification({
                                title: '测试报告',
                                message: '<a href="' + case_report.report + '/index.html" target="_blank">查看用例[' + row.case_id + ']的报告</a>',
                                duration: 0,
                                type: 'success',
                                position: 'bottom-right',
                                dangerouslyUseHTMLString: true,
                            })
                        } else {
                            ElNotification({
                                title: '测试报告',
                                message: '<a href="' + case_report.report + '/index.html" target="_blank">查看用例[' + row.case_id + ']的报告</a>',
                                duration: 0,
                                type: 'warning',
                                position: 'bottom-right',
                                dangerouslyUseHTMLString: true,
                            })
                        }
                        flag = true
                        run_order = case_report.run_order

                    } else {
                        ElNotification.error({
                            title: 'Error',
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
            // 跟新用例数据
            if (flag && run_order) {
                for (var x in this.caseInfo) {
                    if (this.caseInfo[x].case_id == row.case_id) {
                        this.caseInfo[x].run_order = run_order
                        break
                    }
                }
            }
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