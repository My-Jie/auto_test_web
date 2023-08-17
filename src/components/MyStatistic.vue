<template>
    <el-row>
        <el-col :span="5">
            <div class="statistic-card">
                <el-statistic :value=tempCount>
                    <template #title>
                        <div style="display: inline-flex; align-items: center">
                            API 模板数量
                            <el-tooltip effect="dark" content="api模板的数量，一个模板可关联多个api用例" placement="top">
                                <el-icon style="margin-left: 4px" :size="12">
                                    <Warning />
                                </el-icon>
                            </el-tooltip>
                        </div>
                    </template>
                </el-statistic>
            </div>
        </el-col>
        <el-col :span="5">
            <div class="statistic-card">
                <el-statistic :value=caseCount>
                    <template #title>
                        <div style="display: inline-flex; align-items: center">
                            API 用例数量
                            <el-tooltip effect="dark" content="api 用例的数据" placement="top">
                                <el-icon style="margin-left: 8px" :size="12">
                                    <Warning />
                                </el-icon>
                            </el-tooltip>
                        </div>
                    </template>
                </el-statistic>
            </div>
        </el-col>
        <el-col :span="5">
            <div class="statistic-card">
                <el-statistic :value=ddtCount>
                    <template #title>
                        <div style="display: inline-flex; align-items: center">
                            API 数据集
                            <el-tooltip effect="dark" content="api 测试数据集，一个用例对应多个数据集" placement="top">
                                <el-icon style="margin-left: 8px" :size="12">
                                    <Warning />
                                </el-icon>
                            </el-tooltip>
                        </div>
                    </template>
                </el-statistic>
            </div>
        </el-col>
        <el-col :span="5">
            <div class="statistic-card">
                <el-statistic :value=uiCount>
                    <template #title>
                        <div style="display: inline-flex; align-items: center">
                            UI 模板数量
                            <el-tooltip effect="dark" content="Playwright录制的py脚本" placement="top">
                                <el-icon style="margin-left: 8px" :size="12">
                                    <Warning />
                                </el-icon>
                            </el-tooltip>
                        </div>
                    </template>
                </el-statistic>
            </div>
        </el-col>
        <el-col :span="4">
            <div class="statistic-card">
                <el-statistic :value=pDdtCount>
                    <template #title>
                        <div style="display: inline-flex; align-items: center">
                            UI 数据集
                            <el-tooltip effect="dark" content="ui 测试数据集，一个用例对应多个数据集集" placement="top">
                                <el-icon style="margin-left: 8px" :size="12">
                                    <Warning />
                                </el-icon>
                            </el-tooltip>
                        </div>
                    </template>
                </el-statistic>
            </div>
        </el-col>
    </el-row>
</template>

<script>
export default {
    name: 'MyStatistic',
    data() {
        return {
            tempCount: null,
            caseCount: null,
            ddtCount: null,
            uiCount: null,
            pDdtCount: null,
        }
    },

    async mounted() {
        var count = null
        await this.$http({
            url: '/statistic/get/all/count',
            method: 'GET',
        }).then(
            function (response) {
                count = response.data
            }
        ).catch(function (error) {
            ElMessage.error(error.message)
        })

        this.tempCount = count.temp_count
        this.caseCount = count.case_count
        this.ddtCount = count.ddt_count
        this.uiCount = count.ui_count
        this.pDdtCount = count.p_ddt_count
    }
}
</script>
<style scoped>
.el-statistic {
    --el-statistic-content-font-size: 28px;
}

.statistic-card {
    height: 60%;
    width: 62%;
    padding: 20px;
    border-radius: 10px;
    /* background-color: rgb(138, 163, 192); */
    background-color: #F2E9E4;
}

.statistic-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    font-size: 16px;
    color: var(--el-text-color-regular);
    margin-top: 16px;
}

.statistic-footer .footer-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>