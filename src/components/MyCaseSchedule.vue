<template>
    <el-row>
        <el-col :span="3" class="my-col">
            <el-statistic title="api总数" :value=totalApi>
                <template #suffix>个</template>
            </el-statistic>
        </el-col>
        <el-col :span="3" class="my-col">
            <el-statistic title="执行api" :value=runApi>
                <template #suffix>个</template>
            </el-statistic>
        </el-col>
        <el-col :span="3" class="my-col">
            <el-statistic title="成功api" :value=passApi>
                <template #suffix>个</template>
            </el-statistic>
        </el-col>
        <el-col :span="3" class="my-col">
            <el-statistic title="失败api" :value=failApi>
                <template #suffix>个</template>
            </el-statistic>
        </el-col>
        <el-col :span="4" class="my-col">
            <el-statistic title="最大耗时" :value=maxTime>
                <template #suffix>ms</template>
            </el-statistic>
        </el-col>
        <el-col :span="4" class="my-col">
            <el-statistic title="平均耗时" :value=avgTime>
                <template #suffix>ms</template>
            </el-statistic>
        </el-col>
        <el-col :span="4" class="my-col">
            <el-statistic title="总耗时" :value=totalTime>
                <template #suffix>ms</template>
            </el-statistic>
        </el-col>
    </el-row>
    <br>
    <br>
    <el-timeline>
        <el-timeline-item v-for="(activity, index) in this.scheduleData" :key="index" :timestamp="activity.timestamp"
            :type="activity.type" :color="activity.color" :hollow="activity.hollow" placement="top">
            <el-card class=my-card>
                <el-descriptions :title="activity.method + ' ' + activity.url" border direction="vertical" :size="'small'"
                    :extra="activity.description + ' ' + index">
                    <el-descriptions-item label="耗时">{{ activity.time }} ms</el-descriptions-item>
                    <el-descriptions-item label="预期">{{ activity.expect }}</el-descriptions-item>
                    <el-descriptions-item label="结果">
                        <el-tag size="small" :type="activity.is_fail == false ? 'success' : 'danger'">
                            {{ activity.is_fail == false ? 'PASS' : 'FAIL' }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="总耗时">{{ activity.total_time }} ms</el-descriptions-item>
                    <el-descriptions-item label="实际">{{ activity.actual }}</el-descriptions-item>

                </el-descriptions>
            </el-card>
        </el-timeline-item>
    </el-timeline>
</template>
  

<script>
import { DataBoard } from '@element-plus/icons-vue'
export default {
    name: 'MyCaseSchedule',

    props: {
        'scheduleData': Array,
    },
    data() {
        return {
            DataBoard,
            activities: [],
            totalApi: 0,
            runApi: 0,
            passApi: 0,
            failApi: 0,
            maxTime: 0,
            avgTime: 0,
            totalTime: 0,
        }
    },
    mounted() {
        var bgc = document.getElementsByClassName('my-card')
        for (var x in this.scheduleData) {
            this.runApi++
            this.totalApi = this.scheduleData[x].total_api
            this.avgTime = this.scheduleData[x].total_time / this.scheduleData.length

            if (this.scheduleData[x].is_fail == false) {
                this.passApi++
                bgc[x].style.backgroundColor = '#7dcea0';
            } else {
                this.failApi++
                bgc[x].style.backgroundColor = '#F29492';
            }

            if (this.scheduleData[x].time > this.maxTime) {
                this.maxTime = this.scheduleData[x].time
            }

            if (this.scheduleData[x].total_time > this.totalTime) {
                this.totalTime = this.scheduleData[x].total_time
            }

            if (this.scheduleData[x].config.is_login == true) {
                this.scheduleData[x].color = '#6FCF97'
            }
            this.activities[x] = this.scheduleData[x]
        }
    },
    methods: {

    }
}
</script>

<style scoped >
.my-col {
    text-align: center;
}
</style>