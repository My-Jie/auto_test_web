<template>
    <el-affix position="top" :offset="150" class="container">
        <el-button v-show="statusLoading[statusLoading.length - 1]" :icon="Close" size="small" type="warning"
            @click="stopCase">
            停止
        </el-button>
    </el-affix>
    <el-timeline style="padding: 0;">
        <el-timeline-item placement="top" v-for="(activity, index) in activities"
            :color="activity[activity.length - 1].color" :icon="activity[activity.length - 1].icon"
            :timestamp="activity[activity.length - 1].time_str">
            <el-table :data="activity" fit size="small" :show-header="false" highlight-current-row>
                <el-table-column prop="number" align="center" width="45"></el-table-column>
                <el-table-column align="center" width="65">
                    <template #default="scope">
                        <el-tag size="small" :type="scope.row.is_fail ? 'danger' : 'success'">
                            {{ scope.row.is_fail == false ? 'PASS' : 'FAIL' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column align="center" width="85">
                    <template #default="scope">
                        {{ scope.row.request_info.method }}
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip>
                    <template #default="scope">
                        <!-- {{ scope.row.host }} -->
                        <font :color="'#F29492'">{{ scope.row.path }}</font>
                    </template>
                </el-table-column>
                <el-table-column v-if="activity.length > 1" type="index" width="35" align="center"></el-table-column>
                <el-table-column show-overflow-tooltip width="50">
                    <template #default="scope">
                        <font :color="scope.row.status_code < 400 ? '#6FCF97' : '#F29492'">{{
                            scope.row.status_code }}
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
        </el-timeline-item>
    </el-timeline>
    <el-divider id="moreMerchant" v-show="statusLoading[statusLoading.length - 1]">
        <el-tag type="success">
            Loading...
            <font v-show="sleepTime[sleepTime.length - 1] != 0">{{ sleepTime[sleepTime.length - 1] }}s</font>
        </el-tag>
    </el-divider>
    <el-divider id="moreMerchant2" v-show="!statusLoading[statusLoading.length - 1]">
        <el-tag type="success">{{ tips[tips.length - 1] }}</el-tag>
    </el-divider>
</template>

<script>
import { connectWebSocket } from '../websocket.js'
import { ref } from 'vue';
import { MoreFilled, Close } from '@element-plus/icons-vue'
export default {
    name: "CaseStatus",

    props: {
        caseId: Number,
        rowKeyId: String
    },

    inject: ["stopCaseRun"],

    data() {
        return {
            MoreFilled,
            Close,
            message: '',
            ws: Object,
            timeInter: null,
            smoothTimeInter: [],
            activities: [],
            statusLoading: [],
            oldKeyId: null,
            oldCaseId: null,
            oldData: {},
            tips: ['暂无数据'],
            sleepTime: [0]
        }
    },
    activated() {
        if (this.rowKeyId != this.oldKeyId) {
            this.statusLoading = []
            this.activities = []
            this.tips = ['暂无数据']
            this.sleepTime = [0]
        }

        this.ws = connectWebSocket('ws://127.0.0.1:8000/ws/status/' + new Date().getTime())

        var ws = this.ws
        var rowKeyId = this.rowKeyId

        var activities = ref(this.activities);
        var loading_ = ref(this.statusLoading)
        var tips = ref(this.tips)
        var oldData = ref(this.oldData)
        var sleepTime = ref(this.sleepTime)
        var smoothTimeInter = ref(this.smoothTimeInter)

        if (this.rowKeyId) {
            this.oldKeyId = this.rowKeyId
            if (tips.value[tips.value.length - 1] != '执行完成') {
                loading_.value.push(true)
            }

            if (this.activities.length == 0) {
                tips.value.push('暂无数据')
                loading_.value.push(false)
            }

            function timerPromise() {
                return new Promise(function (resolve, reject) {
                    var result = ws.sendMessage(rowKeyId);
                    resolve(result);
                });
            }

            this.timeInter = setInterval(function () {
                timerPromise().then(function (result) {
                    var newResult = JSON.parse(decodeURIComponent(result))
                    try {
                        if (newResult[newResult.length - 1].run == true) {
                            loading_.value.push(true)
                        } else {
                            loading_.value.push(false)
                            tips.value.push('执行完成')
                            window.clearInterval(
                                smoothTimeInter.value[smoothTimeInter.value.length - 1]
                            )

                            overTime = setTimeout(function () {
                                document.getElementById("moreMerchant2").scrollIntoView({
                                    behavior: "smooth"
                                })
                            }, 1000)

                            window.clearTimeout(
                                overTime
                            )
                        }
                    } catch (TypeError) {

                    }

                    if (newResult.length == 0) {
                        sleepTime.value[sleepTime.value.length - 1]++
                    } else {
                        sleepTime.value.push(0)
                    }

                    for (var x in newResult) {
                        newResult[x].color = newResult[x].is_fail ? '#F29492' : '#6FCF97'
                        newResult[x].icon = newResult[x].is_login ? MoreFilled : null

                        var url = newResult[x].request_info.url.split('/')
                        newResult[x].host = url.slice(0, 3).join('/')
                        newResult[x].path = '/' + url.slice(3).join('/')
                        if (newResult[x].continued) {
                            activities.value[activities.value.length - 1].push(newResult[x])
                        } else {
                            activities.value.push([newResult[x]])
                        }
                    }
                    oldData.value[rowKeyId] = activities
                });
            }, 1000)

            if (tips.value[tips.value.length - 1] != '执行完成') {
                var timeInter = setInterval(function () {
                    document.getElementById("moreMerchant").scrollIntoView({
                        behavior: "smooth"
                    })
                }, 300)
                smoothTimeInter.value.push(timeInter)
            }
        }
    },

    deactivated() {
        window.clearInterval(
            this.timeInter
        )
        window.clearInterval(
            this.smoothTimeInter[this.smoothTimeInter.length - 1]
        )
    },

    methods: {
        closeMessage() {
            this.ws.closeWebSocket()
        },
        stopCase() {
            this.stopCaseRun({ key_id: this.rowKeyId, case_id: this.caseId })
            this.statusLoading.push(true)
            this.tips.push('执行完成')
            window.clearInterval(
                this.smoothTimeInter[this.smoothTimeInter.length - 1]
            )
        }
    },
}
</script>

<style  scoped>
.container {
    display: inline;
    position: absolute;
    right: 20px;
}
</style>