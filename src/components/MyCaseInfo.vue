<template>
    <div>
        <el-input v-model="likeCaseName" placeholder="按用例名称模糊查询" @keyup.enter.native="get_case(page, size, likeCaseName)">
            <template #prepend>模板名称</template>
            <template #append>
                <el-button plain @click="get_case(page, size, likeCaseName)">搜索</el-button>
            </template>
        </el-input>
        <br>
        <br>

        <el-table v-loading='loading' :data="caseInfo" row-key="case_id" stripe fit>
            <el-table-column label="CaseId" prop="case_id" type="index" :index="indexMethod" width="100%"
                align="center"></el-table-column>
            <el-table-column label="" width="55px" align="center">
                <template #default="scope">
                    <el-button :icon="Edit" size="small" v-if="scope.row.edit" @click="scope.row.edit = false"></el-button>
                    <el-button :icon="Check" size="small" v-if="!scope.row.edit" @click="updateName(scope.row)"></el-button>
                </template>
            </el-table-column>
            <el-table-column label="用例名称" prop="name" width="420px">
                <template #default="scope">
                    <div v-if="scope.row.name && scope.row.edit">{{ scope.row.temp_name }}-<font color="#F29492">{{
                        scope.row.case_name }}</font>
                    </div>
                    <el-input v-model="scope.row.case_name" placeholder="可输入" v-if="scope.row.edit == false"
                        @keyup.enter.native="updateName(scope.row)"></el-input>
                </template>
            </el-table-column>
            <el-table-column label="API数量" prop="api_count" width="80px" align="center"></el-table-column>
            <el-table-column label="运行" prop="run_order" width="60px" align="center"></el-table-column>
            <el-table-column label="成功" prop="success" width="60px" align="center"></el-table-column>
            <el-table-column label="失败" prop="fail" width="60px" align="center"></el-table-column>
            <el-table-column label="创建时间" prop="created_at" align="center"></el-table-column>
            <el-table-column label="进度">
                <template #default="scope">
                    <el-progress :text-inside="true" :stroke-width="25" :percentage=scope.row.percentage
                        :status=scope.row.percentageStatus v-if="scope.row.percentage" />
                    <div v-if="scope.row.percentage == 0">未开始</div>
                </template>
            </el-table-column>
            <el-table-column label="" width="55px">
                <template #default="scope">
                    <el-button :type=scope.row.percentageStatus :icon="Close" circle
                        v-if="scope.row.percentage > 0 && scope.row.percentage <= 99" size="small"
                        @click="stopCaseRun(scope.row)" />
                    <el-button :type=scope.row.percentageStatus :icon="Check" circle v-if="scope.row.percentage == 100"
                        size="small" @click="scope.row.percentage = 0" />
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="470">
                <template #default="scope">
                    <el-tooltip content="运行用例" placement="top-end" effect="customized">
                        <el-button :icon="CircleCheck" type="success" plain :loading="scope.row.runLoading"
                            @click="setDialogVisible(scope.row)">
                        </el-button>
                    </el-tooltip>
                    <el-button-group class="ml-4">
                        <el-tooltip content="用例详情，可编辑数据" placement="top-end" effect="customized">
                            <el-button :icon="Edit" type="primary" plain @click="getCaseData(scope.row)"
                                :loading="scope.row.dataLoading"></el-button>
                        </el-tooltip>

                        <el-popover title="确定复制？" placement="top" trigger="focus">
                            <div style="text-align: right; margin: 0">
                                <el-button size="small" type="primary" @click="copyCase(scope.row)">是</el-button>
                            </div>
                            <template #reference>
                                <el-button :loading="scope.row.copyLoading" :icon="DocumentCopy" type="primary"
                                    plain></el-button>
                            </template>
                        </el-popover>

                        <el-tooltip content="用例对应的数据集，没有则404" placement="top-start" effect="customized">
                            <el-button :icon="Postcard" type="primary" plain @click="getGather(scope.row)"
                                :loading="scope.row.gatherLoading"></el-button>
                        </el-tooltip>

                        <el-tooltip content="用例执行的时序表" placement="top-start" effect="customized">
                            <el-button :icon="More" type="primary" plain @click="schedule(scope.row)"
                                :loading="scope.row.scheduleLoading"></el-button>
                        </el-tooltip>

                        <el-popconfirm width="250" confirm-button-text="数据集EXCEL" cancel-button-text="原用例JSON"
                            confirm-button-type="primary" cancel-button-type="primary" @cancel="caseDown(scope.row)"
                            @confirm="caseDataSet(scope.row)" :icon="Download" icon-color="#626AEF" title="下载用例">
                            <template #reference>
                                <el-button :icon="Download" type="primary" plain></el-button>
                            </template>
                        </el-popconfirm>

                    </el-button-group>

                    <el-popover title="确定删除？" placement="top" trigger="focus">
                        <div style="text-align: right; margin: 0">
                            <el-button size="small" type="primary" @click="delCase(scope.row)">是</el-button>
                        </div>
                        <template #reference>
                            <el-button :loading="scope.row.delLoading" :icon="Delete" type="danger" plain></el-button>
                        </template>
                    </el-popover>

                    <el-button type="Info" plain>
                        <el-link :href="scope.row.allureReport" target="_blank" :underline="false">报告</el-link>
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <br>
        <el-pagination background :page-sizes="[10, 20, 50, 80, 100]" layout="total, jumper, prev, pager, next, sizes"
            :total=caseTotal @size-change="handleSizeChange" @current-change="handleCurrentChange" />

        <!-- 详情弹窗 -->
        <el-dialog class="details" v-model='myDialog' width="90%" :title="caseId + ' ' + dataTitle">
            <!-- <div class="el-dialog-div"> -->
            <case-data v-if="myDialog" :case-data="thisCaseData" :case-id="caseId"></case-data>
            <!-- </div> -->
        </el-dialog>
        <!-- 运行用例弹窗 -->
        <el-dialog class="confirm" v-model="dialogVisible" :title="'执行用例' + caseId + '-' + caseName" width="50%"
            @close="closeRunCase">
            <el-select v-model="settingVirtualId" placeholder="选择环境" @visible-change="selectSetting">
                <el-option v-for="item in settingInfoList" :key="item.setting_name" :label="item.setting_name"
                    :value="item.virtual_id"></el-option>
            </el-select>
            <br>
            <br>
            <run-api-case v-if="dialogVisible" :setting-info="settingInfo"></run-api-case>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="runCase(caseRow)">确认</el-button>
                </span>
            </template>
        </el-dialog>
        <!-- 数据集的弹窗 -->
        <el-dialog class="confirm" v-model="gatherDialog" :title="caseId + '-' + caseName + '-数据集'" v-if="gatherDialog"
            width="50%">
            <my-gather :gather-data="gatherData" :case-id="caseId"></my-gather>
        </el-dialog>
        <!-- 用例时序图弹窗 -->
        <el-dialog v-model='scheduleDialog' width="50%" :title="caseId + ' ' + dataTitle">
            <my-case-schedule v-if="scheduleDialog" :schedule-data="scheduleData"></my-case-schedule>
        </el-dialog>
    </div>
</template>

<script>

import CaseData from './CaseData.vue'
import MyCaseSchedule from './MyCaseSchedule.vue'
import MyGather from './MyGather.vue'
import RunApiCase from './runApiCase.vue'
import { ElNotification } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Edit, Check, Download, Close, Document, DocumentCopy, Postcard, Delete, CircleCheck, More } from '@element-plus/icons-vue'
export default {
    name: "MyCaseInfo",
    props: {
        'caseInfo': Array,
        'caseTotal': Number,
    },

    inject: ["get_case"],

    components: {
        CaseData,
        MyGather,
        RunApiCase,
        MyCaseSchedule
    },

    data() {
        return {
            Edit,
            Check,
            Download,
            Close,
            Document,
            DocumentCopy,
            Postcard,
            Delete,
            CircleCheck,
            More,
            loading: !this.caseInfo ? true : false,
            myDialog: false,
            thisCaseData: [],
            caseId: null,
            dataTitle: null,
            caseName: null,
            caseRow: null,
            gatherDialog: false,
            gatherData: [],
            page: 1,
            size: 10,
            likeCaseName: null,
            settingInfo: {},
            settingInfoList: [],
            settingVirtualId: null,
            scheduleDialog: false,
            scheduleData: [],
        }
    },

    methods: {
        // 选择环境
        async selectSetting(val) {
            if (val) {
                return
            }

            for (var x in this.settingInfoList) {
                if (this.settingInfoList[x].virtual_id == this.settingVirtualId) {
                    this.settingInfo = JSON.parse(JSON.stringify(this.settingInfoList[x]))
                }
            }

            await this.$http({
                url: '/runCase/set/api/setting/info',
                method: 'PUT',
                params: {
                    setting_list_id: this.settingInfo.setting_list_id,
                    id_card: this.settingInfo.id_card,
                }
            }).then(
                // function (response) {
                //     projects = response.data
                // }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
        },
        // 关闭弹窗
        closeRunCase() {
            this.settingVirtualId = null
            this.settingInfo = {}
            this.settingInfoList = []
        },

        // 调用父级方法
        async handleSizeChange(size) {
            this.size = size
            await this.get_case(this.page, this.size, this.likeCaseName)
        },
        async handleCurrentChange(page) {
            this.page = page
            await this.get_case(this.page, this.size, this.likeCaseName)
        },
        stopCaseRun(row) {
            this.$http({
                url: '/runCase/case/status',
                method: 'GET',
                params: {
                    key_id: row.key_id
                }
            }).then(
                function (response) {
                    if (response.data.message == '没有运行这个用例') {
                        ElNotification.warning({
                            title: 'Warning',
                            message: '没有运行这个用例[ ' + row.case_id + ' ]',
                        })
                        row.percentage = 0
                        row.percentageStatus = 'success'
                        row.key_id = null
                    } else {
                        ElNotification.warning({
                            title: 'Warning',
                            message: '用例[ ' + row.case_id + ' ]已停止',
                        })
                    }
                }
            )
        },
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
        async setDialogVisible(row) {
            this.dialogVisible = true
            this.caseName = row.name
            this.caseId = row.case_id
            this.caseRow = row

            var settingInfoList = []
            await this.$http({
                url: '/runCase/get/api/setting/info?case_id=' + this.caseId,
                method: 'GET',
            }).then(
                function (response) {
                    settingInfoList = response.data
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )

            this.settingInfoList = settingInfoList
        },
        // 删除用例
        async delCase(row) {
            row.delLoading = true
            await this.$http({
                url: '/caseService/del/' + row.case_id,
                method: 'DELETE',
            }).then(
                function () {
                    ElNotification.success({
                        title: 'Success',
                        message: '用例[ ' + row.name + ' ] 删除成功',
                    })
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
            })
            row.delLoading = false
            this.get_case()
        },
        // 用例执行时序表
        async schedule(row) {
            row.scheduleLoading = true
            this.caseId = row.case_id
            this.dataTitle = row.name

            var res = []
            await this.$http({
                url: '/runCase/get/case/schedule',
                method: "GET",
                params: {
                    case_id: row.case_id
                }
            }).then(
                function (response) {
                    res = response.data
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                    row.gatherLoading = false
                })

            this.scheduleData = res
            this.scheduleDialog = true
            row.scheduleLoading = false
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
                    for (var x in gather_data) {
                        gather_data[x]['checkbox'] = true
                    }
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
            row.copyLoading = true
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
                    })
                    row.copyLoading = false
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
                row.copyLoading = false
            })
            this.get_case()
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
            var success = null
            var fail = null
            ElNotification.success({
                title: 'Success',
                message: '开始执行 用例ID: ' + row.case_id,
            })
            await this.$http({
                url: '/runCase/case',
                method: "POST",
                data: JSON.stringify({
                    case_ids: [row.case_id],
                    setting_list_id: this.settingInfo.setting_list_id
                }),
                headers: {
                    'content-type': "application/json"
                }
            }).then(
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
                        success = case_report.success
                        fail = case_report.fail

                    } else {
                        ElNotification.error({
                            title: 'Error',
                            message: '用例\n[ ' + row.case_id + '-' + row.name + ' ] 执行失败',
                        })
                    }
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
                ElNotification.error({
                    title: 'Error',
                    message: '执行失败 用例ID: ' + row.case_id,
                })
                row.runLoading = false
            })
            // 跟新用例数据
            if (flag && run_order) {
                for (var x in this.caseInfo) {
                    if (this.caseInfo[x].case_id == row.case_id) {
                        this.caseInfo[x].run_order = run_order
                        this.caseInfo[x].success = success
                        this.caseInfo[x].fail = fail
                        this.caseInfo[x].allureReport = '/allure/' + this.caseInfo[x].case_id + '/' + run_order + '/index.html'
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

.el-dialog-div {
    height: 65vh;
    overflow: auto;
}

.el-progress.is-success {
    --el-color-success: #7dcea0;
}

.el-progress.is-warning {
    --el-color-warning: #F29492;
}
</style>