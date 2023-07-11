<template>
    <div>
        <el-input v-model="likeTempName" placeholder="按模板名称模糊查询" @keyup.enter.native="get_ui_case(page, size, likeTempName)">
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
            <el-table-column label="行数" prop="rows" width="50px" align="center"></el-table-column>
            <el-table-column label="运行" prop="run_order" width="50px" align="center"></el-table-column>
            <el-table-column label="成功" prop="success" width="50px" align="center"></el-table-column>
            <el-table-column label="失败" prop="fail" width="50px" align="center"></el-table-column>
            <el-table-column label="创建时间" prop="created_at" align="center"></el-table-column>
            <el-table-column label="操作" align="center" width="400px">
                <template #default="scope">
                    <el-button type="success" plain :loading="scope.row.runLoading"
                        @click="getCaseInfo(scope.row)">运行</el-button>&nbsp;
                    <el-button-group class="ml-4">
                        <el-button type="primary" plain @click="getUiTempData(scope.row)"
                            :loading="scope.row.dataLoading">编辑</el-button>
                        <el-button type="primary" plain @click="getUiCaseData(scope.row)"
                            :loading="scope.row.CaseLoading">数据</el-button>
                    </el-button-group>&nbsp;
                    <el-button type="danger" plain :loading="scope.row.delLoading" @click="delDialogVisible(scope.row)">删除
                    </el-button>&nbsp;
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
        <el-dialog v-model="dialogVisible" title="Tips" width="40%"
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
        <el-dialog v-model='dialogUiMonaco' width="70%" title="Python页面编辑器" :close-on-click-modal=false
            :close-on-press-escape=false @close='dialogUiMonaco = false' draggable>
            <monaco-editor v-if="dialogUiMonaco" :ui-temp-id="uiTempId" :ui-temp-name="uiTempName"
                :project-name="projectName" :ui-temp-value="uiTempValue"></monaco-editor>
        </el-dialog>

        <!-- 数据详情的弹窗 -->
        <el-dialog v-model="dialogGather" title="Tips" width="60%" @close='dialogGather = false' :close-on-click-modal=false
            :close-on-press-escape=false>
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

    inject: ["get_ui_case"],

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

        getCaseInfo(row) {
            this.dialogVisible = true
            this.uiTempId = row.id
            this.uiTempName = row.temp_name
            this.uiTempRow = row
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
                offset: 200,
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
                    offset: 200,
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