<template>
    <el-tabs :tab-position="'top'" type="border-card" v-model="activeNames">
        <el-tab-pane label="统计表" name="1">
            <el-card>
                <el-col :span="13" class="centered">
                    <el-progress type="dashboard" :percentage="wholeRate.toFixed(0)">
                        <template #default="{ percentage }">
                            <span class="percentage-value">{{ percentage }}%</span>
                            <span class="percentage-label">执行完整率</span>
                        </template>
                    </el-progress>
                    <el-statistic :value="whole">
                        <template #title>
                            <div style="display: inline-flex; align-items: center">
                                <div>完整执行/总条数</div>
                            </div>
                        </template>
                        <template #suffix>/ {{ totalApi }}</template>
                    </el-statistic>
                    <el-statistic :value="totalTime">
                        <template #title>
                            <div style="display: inline-flex; align-items: center">
                                <div>总耗时</div>
                            </div>
                        </template>
                    </el-statistic>
                    <el-statistic :value="initiativeStop">
                        <template #title>
                            <div style="display: inline-flex; align-items: center">
                                <div>主动结束</div>
                            </div>
                        </template>
                    </el-statistic>
                    <el-statistic :value="failStop">
                        <template #title>
                            <div style="display: inline-flex; align-items: center">
                                <div>失败停止</div>
                            </div>
                        </template>
                    </el-statistic>
                </el-col>
                <el-col :span="5" class="centered">
                    <el-progress type="dashboard" :percentage="successRate.toFixed(0)" :color="colors">
                        <template #default="{ percentage }">
                            <span class="percentage-value">{{ percentage }}%</span>
                            <span class="percentage-label">执行成功率</span>
                        </template>
                    </el-progress>
                    <el-statistic :value="successCount">
                        <template #title>
                            <div style="display: inline-flex; align-items: center">
                                <div>成功/总数</div>
                            </div>
                        </template>
                        <template #suffix>/ {{ reportList.length }}</template>
                    </el-statistic>
                    <el-statistic :value="failCount">
                        <template #title>
                            <div style="display: inline-flex; align-items: center">
                                <div>失败</div>
                            </div>
                        </template>
                    </el-statistic>
                </el-col>
            </el-card>
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
                        <el-progress :percentage="((scope.row.run_api / scope.row.total_api) * 100).toFixed(0)" />
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
            :detail-total-time="detailTotalTime" :detail-max-time="detailMaxTime" :detail-avg-time="detailAvgTime"
            :check-success="checkSuccess" :check-fail="checkFail" :check-skip="checkSkip"
            :run-time="runTime"></case-report-detail>
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
            whole: 0,
            wholeRate: 0,
            successRate: 0,
            totalTime: 0,
            initiativeStop: 0,
            failStop: 0,

            colors: [
                // { color: '#F29492', percentage: 20 },
                { color: '#F29492', percentage: 40 },
                // { color: '#5cb87a', percentage: 60 },
                { color: '#FFC857', percentage: 99 },
                { color: '#6FCF97', percentage: 100 },
            ],

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
            timeData: [],

            checkSuccess: 0,
            checkFail: 0,
            checkSkip: 0,
            runTime: 0
        }
    },


    mounted() {
        if (this.reportList.length <= 0) {
            return
        }


        for (var x in this.reportList) {
            this.reportList[x].detailLoading = false
            if (this.reportList[x].is_fail) {
                this.failCount++
            } else {
                this.successCount++
            }

            if (this.reportList[x].run_api == this.reportList[x].total_api) {
                this.whole++
            }

            if (this.reportList[x].initiative_stop == 1) {
                this.initiativeStop++
            }

            if (this.reportList[x].fail_stop == 1) {
                this.failStop++
            }

            this.totalTime += this.reportList[x].total_time

            // 统计图的
            this.success.push(this.reportList[x].success)
            this.fail.push(this.reportList[x].fail)
            this.notRun.push(this.reportList[x].total_api - this.reportList[x].run_api)

            this.timeData.push(new Date(this.reportList[x].created_at).toLocaleString('zh', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }))
        }

        this.totalTime = this.timeToString(this.totalTime)
        this.totalApi = this.reportList.length
        this.wholeRate = (this.whole / this.totalApi) * 100
        this.successRate = (this.successCount / this.reportList.length) * 100
    },


    methods: {
        // 秒转时间

        timeToString(millisecond) {
            var seconds = Math.round(millisecond);
            var result = []
            var count = 2
            while (count >= 0) {
                var current = Math.floor(seconds / (60 ** count));
                result.push(current);
                seconds -= current * (60 ** count);
                --count;
            }
            return result.map(item => item <= 9 ? `0${item}` : item).join(":")
        },
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

            this.checkSuccess = 0
            this.checkFail = 0
            this.checkSkip = 0
            for (var x in this.detailList) {
                for (var i in this.detailList[x].other_info.assert_info) {
                    if (this.detailList[x].other_info.assert_info[i].is_fail == 'pass') {
                        this.checkSuccess++
                    }
                    if (this.detailList[x].other_info.assert_info[i].is_fail == 'fail') {
                        this.checkFail++
                    }
                    if (this.detailList[x].other_info.assert_info[i].is_fail == 'skip') {
                        this.checkSkip++
                    }
                }
            }

            this.detailTotalApi = row.total_api
            this.detailSuccessCount = row.success
            this.detailFailCount = row.fail
            this.detailMaxTime = row.max_time * 1000
            this.detailAvgTime = row.avg_time * 1000
            this.detailTotalTime = row.total_time * 1000
            this.runTime = new Date(row.created_at).toLocaleString('zh', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })

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

.percentage-value {
    display: block;
    margin-top: 10px;
    font-size: 28px;
}

.percentage-label {
    display: block;
    margin-top: 10px;
    font-size: 12px;
}

.centered {
    display: inline-flex;
    /* justify-content: left; */
    width: 100%;
}

.el-statistic {
    text-align: center;
    margin: 0 20px;
    padding: 35px 0;

}
</style>