<template>
    <div>
        <el-input v-model="likeTempName" placeholder="按模板名称模糊查询"
            @keyup.enter.native="get_ui_case(page, size, likeTempName)">
            <template #prepend>模板名称</template>
            <template #append>
                <el-button plain @click="get_ui_case(page, size, likeTempName)">搜索</el-button>
            </template>
        </el-input>
        <br>
        <br>

        <el-table v-loading='loading' :data="uiTempInfo" stripe fit>
            <el-table-column label="TempId" prop="id" type="index" :index="indexMethod" width="100%"
                align="center"></el-table-column>
            <el-table-column label="项目名称" prop="project_name" align="center"></el-table-column>
            <el-table-column label="模板名称" prop="temp_name" align="center"></el-table-column>
            <el-table-column label="行数" prop="rows" width="60px" align="center"></el-table-column>
            <el-table-column label="运行" prop="run_order" width="60px" align="center"></el-table-column>
            <el-table-column label="成功" prop="success" width="60px" align="center"></el-table-column>
            <el-table-column label="失败" prop="fail" width="60px" align="center"></el-table-column>
            <el-table-column label="创建时间" prop="created_at" align="center"></el-table-column>
            <el-table-column label="操作" align="center" width="350px">
                <template #default="scope">
                    <el-tooltip content="运行用例" placement="top-end" effect="customized">
                        <el-button :icon="CircleCheck" type="success" plain :loading="scope.row.runLoading"
                            @click="getCaseInfo(scope.row)"></el-button>
                    </el-tooltip>

                    <el-button-group class="ml-4">
                        <el-tooltip content="测试用例文本详情" placement="top-end" effect="customized">
                            <el-button :icon="Edit" type="primary" plain @click="getUiTempData(scope.row)"
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

                        <el-tooltip content="查看提取的变量数据，没有则404" placement="top-end" effect="customized">
                            <el-button :icon="Document" type="primary" plain @click="getUiCaseData(scope.row)"
                                :loading="scope.row.CaseLoading"></el-button>
                        </el-tooltip>
                    </el-button-group>

                    <el-popover title="确定删除？" placement="top" trigger="focus">
                        <div style="text-align: right; margin: 0">
                            <el-button size="small" type="primary" @click="delUiTemp(scope.row)">是</el-button>
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
            :total=uiTempTotal @size-change="handleSizeChange" @current-change="handleCurrentChange" />

        <!-- 运行用例弹窗 -->
        <el-dialog class="confirm" v-model="dialogVisible" title="Tips" width="50%"
            @close='browserId = null, headless = true, gatherId = null'>
            <span>执行用例 [ {{ uiTempId }} - {{ uiTempName }} ]</span>
            <br>
            <br>
            <el-form>
                <el-form-item label="远程环境" label-width="100px">
                    <el-select v-model="browserId" placeholder="选择环境" @visible-change="handleVisibleChange">
                        <el-option v-for="item in browsers" :key="item.key" :label="item.value"
                            :value="item.key"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="无头运行" label-width="100px">
                    <el-select v-model="headless" placeholder="无头运行">
                        <el-option v-for="item in headlessList" :key="item.key" :label="item.value"
                            :value="item.key"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="选择用例" label-width="100px">
                    <el-select v-model="gatherId" placeholder="选择用例" @visible-change="getUiCaseName">
                        <el-option v-for="item in gathers" :key="item.key" :label="item.value"
                            :value="item.key"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="runCase(uiTempRow)">确认</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 编辑器弹窗 -->
        <el-dialog class="mc" v-model='dialogUiMonaco' width="70%" title="Python页面编辑器" :close-on-click-modal=false
            @close='dialogUiMonaco = false' draggable>
            <monaco-editor v-if="dialogUiMonaco" :ui-temp-id="uiTempId" :ui-temp-name="uiTempName"
                :project-name="projectName" :ui-temp-value="uiTempValue"></monaco-editor>
        </el-dialog>

        <!-- 数据详情的弹窗 -->
        <el-dialog class="confirm" v-model="dialogGather" title="Tips" width="60%" @close='dialogGather = false'
            :close-on-click-modal=false>
            <el-table v-loading='loading' :data="gatherInfo" row-key="case_id" stripe fit>
                <el-table-column label="CaseId" prop="id" type="index" :index="indexMethodGather" width="100%"
                    align="center"></el-table-column>
                <el-table-column label="用例名称" prop="case_name" width="150px">
                </el-table-column>
                <el-table-column label="Gather" prop="rows_data" show-overflow-tooltip='true'>
                    <template #default="scope">
                        <div>{{ JSON.stringify(scope.row.rows_data, null, 1) }}</div>
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" prop="created_at" align="center" width="200px"></el-table-column>
            </el-table>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogGather = false">关闭</el-button>
                    <el-button type="primary" @click="downExcel()" :loading="downExcelLoading">下载</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import MonacoEditor from "./MonacoEditor.vue"
import { ElNotification, ElMessage } from 'element-plus'
import { Edit, Document, Delete, CircleCheck, DocumentCopy } from '@element-plus/icons-vue'
export default {
    name: "MyUiTempInfo",

    components: {
        MonacoEditor,
    },

    props: {
        'uiTempInfo': Array,
        'uiTempTotal': Number,
    },

    inject: ["get_ui_case"],

    data() {
        return {
            Edit,
            Document,
            Delete,
            CircleCheck,
            DocumentCopy,
            loading: !this.uiTempInfo ? true : false,
            uiTempTitle: null,
            dialogUiMonaco: false,
            uiTempRow: [],

            // 详情信息
            uiTempId: null,
            uiTempName: '',
            projectName: '',
            uiTempValue: '',

            dialogVisible: false,
            dialogGather: false,
            browsers: [],
            browserId: null,
            headless: true,
            headlessList: [{ key: 'true', value: 'true' }, { key: 'false', value: 'false' }],
            gathers: [],
            gatherId: null,

            gatherInfo: [],
            size: 10,
            page: 1,
            likeTempName: null,
            downExcelLoading: false,
        }
    },

    methods: {
        indexMethod(index) {
            return this.uiTempInfo[index]['id']
        },

        indexMethodGather(index) {
            return this.gatherInfo[index]['id']
        },
        // 调用父级方法
        async handleSizeChange(size) {
            this.size = size
            await this.get_ui_case(this.page, this.size, this.likeTempName)
        },
        async handleCurrentChange(page) {
            this.page = page
            await this.get_ui_case(this.page, this.size, this.likeTempName)
        },
        // 项目列表
        async handleVisibleChange(val) {
            if (!val) {
                return
            }
            var browsers = []
            await this.$http({
                url: '/caseUi/get/remote/browsers',
                method: 'GET',
            }).then(
                function (response) {
                    browsers = response.data.data
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            this.browsers = browsers
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
        // 测试详情数据
        async getUiCaseData(row) {
            this.uiTempId = row.id
            this.uiTempName = row.temp_name
            var flag = false
            var gather = []
            await this.$http({
                url: '/caseUi/get/playwright/gather/' + row.id,
                method: 'GET',
            }).then(
                function (response) {
                    gather = response.data
                    flag = true
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
            })

            if (flag) {
                this.gatherInfo = gather
                this.dialogGather = true
            }
        },

        async getUiCaseName(val) {
            if (!val) {
                return
            }
            var flag = false
            var gather = []
            await this.$http({
                url: '/caseUi/get/playwright/gather/' + this.uiTempId,
                method: 'GET',
            }).then(
                function (response) {
                    gather = response.data
                    flag = true
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
            })

            if (flag) {
                this.gathers = []
                for (var x in gather) {
                    this.gathers.push({ "key": gather[x].id, "value": gather[x].case_name })
                }
            }
        },
        // 复制模板
        async copyCase(row) {
            row.copyLoading = true
            await this.$http({
                url: '/caseUi/copy/case',
                method: 'GET',
                params: {
                    temp_id: row.id
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
            this.get_ui_case()
        },
        // 删除模板
        async delUiTemp(row) {
            row.delLoading = true
            await this.$http({
                url: '/caseUi/del/playwright/data/' + row.id,
                method: 'DELETE',
            }).then(
                function () {
                    ElNotification.success({
                        title: 'Success',
                        message: '模板[ ' + row.temp_name + ' ] 删除成功',
                    })
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
            })
            row.delLoading = false
            this.get_ui_case()
        },

        async getCaseInfo(row) {
            this.dialogVisible = true
            this.uiTempId = row.id
            this.uiTempName = row.temp_name
            this.uiTempRow = row

            var settingInfoList = []
            await this.$http({
                url: '/runCase/get/ui/setting/info?case_id=' + this.uiTempId,
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
        },

        async runCase(row) {
            this.dialogVisible = false
            row.runLoading = true
            var flag = false
            var run_order = null
            var success = null
            var fail = null
            ElNotification.success({
                title: 'Success',
                message: '开始执行 用例ID: ' + this.uiTempId,
            })
            await this.$http({
                url: '/runCase/ui/temp',
                method: "POST",
                data: JSON.stringify({
                    temp_id: this.uiTempId,
                    remote: this.browserId ? true : false,
                    remote_id: this.browserId,
                    headless: this.headless,
                    gather_id: this.gatherId
                }),
                headers: {
                    'content-type': "application/json"
                }
            }).then(
                function (response) {
                    var case_report = response.data.data
                    row.runLoading = false
                    flag = true
                    run_order = case_report.run_order
                    success = case_report.success
                    fail = case_report.fail
                    console.log(run_order);
                    ElNotification({
                        title: '测试报告',
                        message: '<a href="' + case_report.report + '/index.html" target="_blank">查看用例[' + row.id + ']的报告</a>',
                        duration: 0,
                        type: 'success',
                        position: 'bottom-right',
                        dangerouslyUseHTMLString: true,
                    })
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
                ElNotification.error({
                    title: 'Error',
                    message: '执行失败 用例ID: ' + row.id,
                })
                row.runLoading = false
            })
            // 跟新用例数据
            if (flag && run_order) {
                for (var x in this.uiTempInfo) {
                    if (this.uiTempInfo[x].id == row.id) {
                        this.uiTempInfo[x].run_order = run_order
                        this.uiTempInfo[x].success = success
                        this.uiTempInfo[x].fail = fail
                        this.uiTempInfo[x].allureReport = 'ui/allure/' + this.uiTempInfo[x].id + '/' + run_order + '/index.html'
                        break
                    }
                }
            }
        },
        // 下载数据excel
        async downExcel() {

            var localUiTempName = this.uiTempName
            await this.$http({
                url: '/caseUi/down/playwright/data/' + this.uiTempId,
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
    }
}
</script>

<style lang="scss" scoped></style>