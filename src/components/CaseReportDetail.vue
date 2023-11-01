<template>
    <el-card>
        <el-col :span="8" class="centered">
            <el-progress type="dashboard"
                :percentage="(((detailSuccessCount + detailFailCount) / detailTotalApi) * 100).toFixed(0)">
                <template #default="{ percentage }">
                    <span class="percentage-value">{{ percentage }}%</span>
                    <span class="percentage-label">执行完整率</span>
                </template>
            </el-progress>
            <el-statistic :value="detailSuccessCount + detailFailCount">
                <template #title>
                    <div style="display: inline-flex; align-items: center">
                        <div>执行/总数</div>
                    </div>
                </template>
                <template #suffix>/ {{ detailTotalApi }}</template>
            </el-statistic>
            <el-statistic :value="detailAvgTime.toFixed(0) + 'ms'">
                <template #title>
                    <div style="display: inline-flex; align-items: center">
                        <div>平均耗时</div>
                    </div>
                </template>
            </el-statistic>
            <el-statistic :value="detailTotalTime.toFixed(0) + 'ms'">
                <template #title>
                    <div style="display: inline-flex; align-items: center">
                        <div>总耗时</div>
                    </div>
                </template>
            </el-statistic>
        </el-col>
        <el-col :span="6" class="centered">
            <el-progress type="dashboard" :color="colors"
                :percentage="((detailSuccessCount / (detailSuccessCount + detailFailCount)) * 100).toFixed(0)">
                <template #default="{ percentage }">
                    <span class="percentage-value">{{ percentage }}%</span>
                    <span class="percentage-label">执行通过率</span>
                </template>
            </el-progress>
            <el-statistic :value="detailSuccessCount">
                <template #title>
                    <div style="display: inline-flex; align-items: center">
                        <div>成功/执行</div>
                    </div>
                </template>
                <template #suffix>/ {{ detailSuccessCount + detailFailCount }}</template>
            </el-statistic>
            <el-statistic :value="detailFailCount">
                <template #title>
                    <div style="display: inline-flex; align-items: center">
                        <div>失败</div>
                    </div>
                </template>
            </el-statistic>
        </el-col>
        <el-col :span="10" class="centered">
            <el-progress type="dashboard" :color="colors"
                :percentage="((checkSuccess / (checkSuccess + checkFail + checkSkip)) * 100).toFixed(0)">
                <template #default="{ percentage }">
                    <span class="percentage-value">{{ percentage }}%</span>
                    <span class="percentage-label">断言</span>
                </template>
            </el-progress>
            <el-statistic :value="checkSuccess">
                <template #title>
                    <div style="display: inline-flex; align-items: center">
                        <div>成功/总数</div>
                    </div>
                </template>
                <template #suffix>/ {{ checkSuccess + checkFail + checkSkip }}</template>
            </el-statistic>
            <el-statistic :value="checkFail">
                <template #title>
                    <div style="display: inline-flex; align-items: center">
                        <div>失败</div>
                    </div>
                </template>
            </el-statistic>
            <el-statistic :value="checkSkip">
                <template #title>
                    <div style="display: inline-flex; align-items: center">
                        <div>跳过</div>
                    </div>
                </template>
            </el-statistic>
            &nbsp;
            &nbsp;
            &nbsp;
            &nbsp;
            &nbsp;
            &nbsp;
            &nbsp;
            &nbsp;
            &nbsp;
            &nbsp;
            &nbsp;
            &nbsp;
            &nbsp;
            &nbsp;
            &nbsp;
            <el-statistic :value="runTime">
                <template #title>
                    <div style="display: inline-flex; align-items: center">
                        <b>执行时间</b>
                    </div>
                </template>
            </el-statistic>
        </el-col>
    </el-card>
    <el-divider content-position="left">接口详情</el-divider>
    <div class="case-list">
        <el-table :data="detailList" fit size="small" :show-header="false" @row-click="apiInfo" height="470px"
            highlight-current-row>
            <el-table-column prop="number" align="center" width="45"></el-table-column>
            <el-table-column align="center" width="50">
                <template #default="scope">
                    <el-tag size="small" :type="statusObj[scope.row.status]">
                        {{ scope.row.status }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="method" align="center" width="75"></el-table-column>
            <el-table-column prop="path" show-overflow-tooltip></el-table-column>
            <el-table-column show-overflow-tooltip width="50">
                <template #default="scope">
                    <font :color="scope.row.response_info.status_code < 400 ? '#6FCF97' : '#F29492'">{{
                        scope.row.response_info.status_code }}
                    </font>
                </template>
            </el-table-column>
            <el-table-column align="center" width="75" fixed="right">
                <template #default="scope">
                    <font :color="scope.row.run_time <= 3 ? '#6FCF97' : '#FFC857'">{{ scope.row.run_time.toFixed(3) }}s
                    </font>
                </template>
            </el-table-column>
        </el-table>
    </div>
    <!-- &nbsp; -->
    <div class="case-detail">
        <el-tabs :tab-position="'top'" type="border-card" v-model="activeNames">
            <el-tab-pane label="断言信息" name="1">
                <el-scrollbar max-height="400px">
                    <el-divider content-position="left">{{ description }}</el-divider>
                    <el-table :data="checkList" fit size="small" highlight-current-row>
                        <!-- <el-table-column label="数据源" prop="data_type" align="center"></el-table-column> -->
                        <el-table-column label="字段" prop="key" align="center" show-overflow-tooltip></el-table-column>
                        <el-table-column label="期望值" prop="expect" align="center" show-overflow-tooltip></el-table-column>
                        <el-table-column label="比较符" prop="compare" align="center"></el-table-column>
                        <el-table-column label="实际值" prop="actual" align="center" show-overflow-tooltip></el-table-column>
                        <el-table-column label="结果" align="center">
                            <template #default="scope">
                                <el-tag size="small" :type="statusObj[scope.row.is_fail]">
                                    {{ scope.row.is_fail }}
                                </el-tag>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-scrollbar>
            </el-tab-pane>
            <el-tab-pane label="请求信息" name="2">
                <el-scrollbar max-height="400px">
                    <!-- <el-divider content-position="left">url</el-divider> -->
                    <h4>{{ url }}</h4>
                    <el-divider content-position="left">
                        <h4>
                            <font color="#F29492">params</font>
                        </h4>
                    </el-divider>
                    <vue-json-pretty :data="JSON.parse(JSON.stringify(params))"></vue-json-pretty>

                    <el-divider content-position="left">
                        <h4>
                            <font color="#F29492">{{ this.isJson ? 'data' : 'json' }}</font>
                        </h4>
                    </el-divider>
                    <vue-json-pretty :data="JSON.parse(JSON.stringify(data))"></vue-json-pretty>

                    <el-divider content-position="left">
                        <h4>
                            <font color="#F29492">headers</font>
                        </h4>
                    </el-divider>
                    <vue-json-pretty :data="JSON.parse(JSON.stringify(headers))"></vue-json-pretty>
                </el-scrollbar>
            </el-tab-pane>
            <el-tab-pane label="响应信息" name="3">
                <el-scrollbar max-height="400px">
                    <el-divider content-position="left">
                        <h4>
                            <font color="#F29492">response</font>
                        </h4>
                    </el-divider>
                    <vue-json-pretty :data="JSON.parse(JSON.stringify(response))"></vue-json-pretty>
                    <el-divider content-position="left">
                        <h4>
                            <font color="#F29492">headers</font>
                        </h4>
                    </el-divider>
                    <vue-json-pretty :data="JSON.parse(JSON.stringify(responseHeaders))"></vue-json-pretty>
                </el-scrollbar>
            </el-tab-pane>
            <el-tab-pane label="表达式值" name="4">
                <el-scrollbar max-height="400px">
                    <el-table :data="jsonPath" fit size="small" highlight-current-row>
                        <el-table-column label="表达式" show-overflow-tooltip>
                            <template #default="scope">
                                {{ scope.row.jsonpath }}
                            </template>
                        </el-table-column>
                        <el-table-column label="取值" show-overflow-tooltip>
                            <template #default="scope">
                                {{ scope.row.case_value }}
                            </template>
                        </el-table-column>
                        <el-table-column label="位置" show-overflow-tooltip>
                            <template #default="scope">
                                {{ scope.row.site }}
                            </template>
                        </el-table-column>
                    </el-table>
                </el-scrollbar>
            </el-tab-pane>
            <el-tab-pane label="配置信息" name="5">
                <el-descriptions border size="small" column="1">
                    <el-descriptions-item label="是否登录">
                        <el-tag size="small" :type="config.is_login == true ? 'success' : 'info'">
                            {{ config.is_login == true ? '是' : '否' }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="主动停止">
                        <el-tag size="small" :type="config.stop == true ? 'warning' : 'info'">
                            {{ config.stop == true ? '是' : '否' }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="失败停止">
                        <el-tag size="small" :type="config.fail_stop == true ? 'primary' : 'info'">
                            {{ config.fail_stop == true ? '是' : '否' }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="等待时间">{{ config.sleep }}s</el-descriptions-item>
                    <!-- <el-descriptions-item label="识别验证码">{{ config.code }}</el-descriptions-item>
                    <el-descriptions-item label="提取字符串">{{ config.extract }}</el-descriptions-item> -->
                </el-descriptions>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty'
export default {
    name: "CaseReportDetail",

    components: {
        VueJsonPretty
    },

    props: {
        'detailTotalApi': Number,
        'detailSuccessCount': Number,
        'detailFailCount': Number,
        'detailMaxTime': Number,
        'detailAvgTime': Number,
        'detailTotalTime': Number,
        'detailList': Array,

        'checkSuccess': Number,
        'checkFail': Number,
        'checkSkip': Number,
        'runTime': String
    },

    data() {
        return {
            activeNames: '1',
            width: window.innerWidth,
            statusObj: {
                "pass": "success",
                "fail": "danger",
                "skip": "info",
                "err": "warning"
            },
            drawer: false,

            // 详情数据
            isJson: false,
            url: '',
            params: {},
            data: {},
            headers: {},
            response: {},
            responseHeaders: {},
            checkList: [],
            config: {},
            description: '',
            jsonPath: [],

            colors: [
                // { color: '#F29492', percentage: 20 },
                { color: '#F29492', percentage: 40 },
                // { color: '#5cb87a', percentage: 60 },
                { color: '#FFC857', percentage: 99 },
                { color: '#6FCF97', percentage: 100 },
            ]
        }
    },
    mounted() {
        this.width = window.innerWidth
        window.addEventListener('resize', this.handleResize)
        var dialogWidth = (this.width * 0.9) / 2 - 30

        var case_list = document.getElementsByClassName('case-list')[0]
        case_list.style.width = dialogWidth + 'px'
        var case_detail = document.getElementsByClassName('case-detail')[0]
        case_detail.style.width = dialogWidth + 'px'

        this.checkList = this.detailList[0].other_info.assert_info
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize)
    },

    methods: {
        handleResize() {
            this.width = window.innerWidth
            var dialogWidth = (this.width * 0.9) / 2 - 30

            var case_list = document.getElementsByClassName('case-list')[0]
            case_list.style.width = dialogWidth + 'px'
            var case_detail = document.getElementsByClassName('case-detail')[0]
            case_detail.style.width = dialogWidth + 'px'
        },
        // 处理接口信息
        apiInfo(row) {
            console.log(row);
            this.isJson = row.request_info.data ? true : false
            this.url = row.request_info.url
            this.params = row.request_info.params
            this.data = row.request_info.data ? row.request_info.data : row.request_info.json
            this.headers = row.request_info.headers
            this.response = row.response_info.response
            this.responseHeaders = row.response_info.response_headers
            this.config = row.conf_info
            this.checkList = row.other_info.assert_info
            this.description = row.other_info.description

            this.jsonPath = row.jsonpath_info
            for (var x in this.jsonPath) {
                var str = []
                if (this.jsonPath[x].path.length > 0) {
                    str.push('path')
                }
                if (this.jsonPath[x].params.length > 0) {
                    str.push('params')
                }
                if (this.jsonPath[x].data.length > 0) {
                    str.push('data')
                }
                if (this.jsonPath[x].headers.length > 0) {
                    str.push('headers')
                }

                this.jsonPath[x].site = str.join()
            }
        }
    }
}
</script>

<style scoped>
.case-list {
    display: inline-block;
    vertical-align: top;
    min-height: 450px;
    max-height: 450px;
}

.case-detail {
    display: inline-block;
    vertical-align: top;
    float: right;
    min-height: 450px;
    min-height: 450px;
}


.el-table__body tr.current-row>td {
    background-color: #178fa7 !important;
    color: #000000;
    font-weight: 700;
}

.el-tab-pane {
    min-height: 400px;
    max-height: 400px;
    overflow-y: auto;
}


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