<template>
    <el-tabs :tab-position="'top'" type="border-card" v-model="activeNames">
        <el-tab-pane label="统计表" name="1">
            <el-descriptions border>
                <el-descriptions-item label="执行次数">{{ reportList.length }}</el-descriptions-item>
                <el-descriptions-item label="成功次数">{{ successCount }}</el-descriptions-item>
                <el-descriptions-item label="失败次数">
                    <font color="#F29492">{{ failCount }}</font>
                </el-descriptions-item>
                <el-descriptions-item label="API总数">{{ totalApi }}</el-descriptions-item>
                <el-descriptions-item label="执行完整率">{{ wholeRate.toFixed(2) }}%</el-descriptions-item>
                <el-descriptions-item label="执行成功率">{{ successRate.toFixed(2) }}%</el-descriptions-item>
            </el-descriptions>
            <el-divider content-position="left">报告列表</el-divider>
            <el-table :data="reportList" stripe fit max-height="400">
                <el-table-column label="执行序号" prop="run_number" width="85px" align="center"></el-table-column>
                <el-table-column label="执行/总数" align="center">
                    <template #default="scope">
                        {{ scope.row.run_api }}/{{ scope.row.total_api }}
                    </template>
                </el-table-column>
                <el-table-column label="执行结果" align="center">
                    <template #default="scope">
                        <el-tag size="small" :type="scope.row.is_fail != true ? 'success' : 'danger'">
                            {{ scope.row.is_fail != true ? 'PASS' : 'FAIL' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="执行状态" align="center">
                    <template #default="scope">
                        <el-progress :percentage="(scope.row.run_api / scope.row.total_api) * 100" />
                    </template>
                </el-table-column>
                <el-table-column label="主动结束" align="center">
                    <template #default="scope">
                        <el-tag size="small" :type="scope.row.initiative_stop == true ? 'warning' : 'info'">
                            {{ scope.row.initiative_stop == true ? '是' : '否' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="失败停止" align="center">
                    <template #default="scope">
                        <el-tag size="small" :type="scope.row.fail_stop == true ? 'primary' : 'info'">
                            {{ scope.row.fail_stop == true ? '是' : '否' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="总耗时" prop="total_time" align="center">
                    <template #default="scope">
                        <el-tag type="success" size="small" effect="Plain">{{ scope.row.total_time.toFixed(2) }}s</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="执行时间" align="center" show-overflow-tooltip>
                    <template #default="scope">
                        {{ new Date(scope.row.created_at).toLocaleString() }}
                    </template>
                </el-table-column>
                <el-table-column label="详情" prop="host" align="center" width="100px">
                    <template #default="scope">
                        <el-button :icon="Postcard" type="primary" plain size="small" @click="caseReport(scope.row)"
                            :loading="scope.row.detailLoading"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>
        <el-tab-pane label="趋势图" name="2">
            <api-case-echarts v-if="activeNames == '2'" :success="success" :fail="fail" :not-run="notRun"
                :time-data="timeData"></api-case-echarts>
        </el-tab-pane>
    </el-tabs>


    <!-- 测试报告详情弹窗 -->
    <el-dialog class="details" v-model='reportDialog' width="90%" :title="caseName + '-报告详情'">
        <case-report-detail v-if="reportDialog" :detail-list="detailList" :detail-total-api="detailTotalApi"
            :detail-success-count="detailSuccessCount" :detail-fail-count="detailFailCount"
            :detail-total-time="detailTotalTime" :detail-max-time="detailMaxTime"
            :detail-avg-time="detailAvgTime"></case-report-detail>
    </el-dialog>
</template>
  

<script>
import CaseReportDetail from './CaseReportDetail.vue'
import ApiCaseEcharts from './ApiCaseEcharts.vue'
import { ElMessage } from 'element-plus'
import { Postcard } from '@element-plus/icons-vue'

export default {
    name: "ApiCaseReport",

    components: {
        CaseReportDetail,
        ApiCaseEcharts
    },

    props: {
        'caseName': String,
        'reportList': Array,
    },

    data() {
        return {
            Postcard,
            // 列表的统计数据
            totalApi: 0,
            successCount: 0,
            failCount: 0,
            wholeRate: 0,
            successRate: 0,

            // 详情的统计数据
            detailTotalApi: 0,
            detailSuccessCount: 0,
            detailFailCount: 0,
            detailMaxTime: 0,
            detailAvgTime: 0,
            detailTotalTime: 0,

            activeNames: '1',
            reportDialog: false,

            // 统计图的
            success: [],
            fail: [],
            notRun: [],
            timeData: []
        }
    },


    mounted() {
        if (this.reportList.length <= 0) {
            return
        }

        var whole = 0
        for (var x in this.reportList) {
            this.reportList[x].detailLoading = false
            if (this.reportList[x].is_fail) {
                this.failCount++
            } else {
                this.successCount++
            }

            whole += (this.reportList[x].run_api / this.reportList[x].total_api) * 100

            // 统计图的
            this.success.push(this.reportList[x].success)
            this.fail.push(this.reportList[x].fail)
            this.notRun.push(this.reportList[x].total_api - this.reportList[x].run_api)

            this.timeData.push(new Date(this.reportList[x].created_at).toLocaleString('zh', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }))
        }
        this.totalApi = this.reportList[0].total_api
        this.wholeRate = whole / this.reportList.length
        this.successRate = (this.successCount / this.reportList.length) * 100
    },


    methods: {
        // 测试报告详情
        async caseReport(row) {
            row.detailLoading = true

            var detail = []
            await this.$http({
                url: '/report/detail/' + row.id,
                method: 'GET',
                params: {
                    page: 1,
                    size: 999,
                }
            }).then(
                function (response) {
                    detail = response.data
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            this.detailList = detail

            this.detailTotalApi = row.total_api
            this.detailSuccessCount = row.success
            this.detailFailCount = row.fail
            this.detailMaxTime = row.max_time * 1000
            this.detailAvgTime = row.avg_time * 1000
            this.detailTotalTime = row.total_time * 1000

            row.detailLoading = false
            this.reportDialog = true
        }
    }
}
</script>

<style scoped>
.el-tag.el-tag--warning {
    --el-tag-border-color: #FFC857;
    --el-tag-hover-color: #FFC857;
}

.el-tag.el-tag--primary {
    --el-tag-border-color: #F29492;
    --el-tag-hover-color: #F29492;
    --el-tag-text-color: #F29492;
}
</style>