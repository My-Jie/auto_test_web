<template>
    <div>
        <el-button type="success" :loading="runLoading" @click="queryRun(false)">同步运行</el-button>
        <el-button type="success" :loading="asyncRunLoading" @click="queryRun(true)">异步运行</el-button>
        <el-popover title="确定删除？" placement="top" trigger="focus">
            <div style="text-align: right; margin: 0">
                <el-button size="small" type="primary" @click="delGather">是</el-button>
            </div>
            <template #reference>
                <el-button type="danger" plain>删除</el-button>
            </template>
        </el-popover>
        <br>
        <br>

        <el-table v-loading='loading' :data="gatherInfo" row-key="case_id" stripe fit>
            <el-table-column label="选择" width="60px" align="center" size="small" fixed="left">
                <template #default="scope">
                    <el-checkbox v-model=scope.row.checkbox />
                </template>
            </el-table-column>

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


        <!-- 运行用例弹窗 -->
        <el-dialog class="confirm" v-model="dialogVisible" title="Tips" width="50%"
            @close='browserId = null, headless = true, gatherId = null'>
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
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" :loading="loading" @click="runCase()">确认</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { ElNotification, ElMessage } from 'element-plus'
export default {
    name: 'MyUiGather',
    props: {
        'gatherInfo': Array,
        'uiTempId': Number,
    },
    data() {
        return {
            dialogVisible: false,
            browserId: null,
            headless: true,
            headlessList: [{ key: 'true', value: 'true' }, { key: 'false', value: 'false' }],
            browsers: [],
            loading: false,
            runLoading: false,
            asyncRunLoading: false,
            gather_ids: [],
            async_: null,
            uiTempRow: null
        }
    },
    methods: {
        indexMethodGather(index) {
            return this.gatherInfo[index]['id']
        },
        // 确认运行
        async queryRun(type) {
            this.dialogVisible = true

            this.async_ = type
            if (type) {
                this.runTitle = '异步运行'
            } else (
                this.runTitle = '同步运行'
            )
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
        // 删除数据集
        async delGather() {
            var suite_list = []
            for (var x in this.gatherInfo) {
                if (this.gatherInfo[x].checkbox && !suite_list.includes(this.gatherInfo[x].id)) {
                    suite_list.push(this.gatherInfo[x].id)
                }
            }

            if (suite_list.length <= 0) {
                ElMessage.warning('当前没有选中需要删除的数据集')
                return
            }

            var flag = false

            await this.$http({
                url: '/caseUi/del/gather',
                method: 'DELETE',
                data: JSON.stringify({
                    temp_id: this.uiTempId,
                    gather_ids: suite_list
                }),
                headers: {
                    'content-type': "application/json"
                }

            }).then(
                function () {
                    flag = true
                    ElNotification.success({
                        title: 'Success',
                        message: '删除成功',
                    })
                }

            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )

            if (flag) {
                for (var i = this.gatherInfo.length - 1; i >= 0; i--) {
                    if (this.gatherInfo[i].checkbox) {
                        this.gatherInfo.splice(i, 1)
                    }
                }
            }

        },
        // 运行用例
        async runCase() {
            this.loading = true

            if (this.async_) {
                this.asyncRunLoading = true
            } else {
                this.runLoading = true
            }
            var suite_list = []
            for (var x in this.gatherInfo) {
                if (this.gatherInfo[x].checkbox && !suite_list.includes(this.gatherInfo[x].id)) {
                    suite_list.push(this.gatherInfo[x].id)
                }
            }

            if (suite_list.length <= 0) {
                ElMessage.warning('当前没有选中需要运行的数据集')
                if (this.async_) {
                    this.asyncRunLoading = false
                } else {
                    this.runLoading = false
                }
                return
            }

            this.dialogVisible = false
            this.loading = false
            var uiTempId = this.uiTempId
            await this.$http({
                url: '/runCase/ui/gather',
                method: "POST",
                data: JSON.stringify({
                    temp_id: this.uiTempId,
                    remote: this.browserId ? true : false,
                    remote_id: this.browserId,
                    headless: this.headless,
                    gather_id: this.gatherId,
                    gather_ids: suite_list,
                    async_: this.async_
                }),
                headers: {
                    'content-type': "application/json"
                }
            }).then(
                function (response) {
                    var case_report = response.data.data.pop()
                    ElNotification({
                        title: '测试报告',
                        message: '<a href="' + case_report.report + '/index.html" target="_blank">查看用例[' + uiTempId + ']的报告</a>',
                        duration: 0,
                        type: 'success',
                        position: 'bottom-right',
                        dangerouslyUseHTMLString: true,
                    })
                }
            ).catch(function (error) {
                ElNotification.error({
                    title: 'Error',
                    message: '执行失败 用例ID: ' + uiTempId,
                })
            })

            if (this.async_) {
                this.asyncRunLoading = false
            } else {
                this.runLoading = false
            }
        }
    }
}
</script>

<style lang="scss" scoped></style>