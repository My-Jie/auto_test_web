<template>
    <div id="apiReportCharts" :style="{ height: '530px', width: '100%' }"></div>
</template>

<script>
import * as echarts from "echarts";
export default {
    name: 'ApiCaseEcharts',

    props: {
        'success': Array,
        'fail': Array,
        'notRun': Array,
        'timeData': Array
    },

    data() {
        return {
            initEcharts: {
                color: ["#6FCF97", "#F29492", "#A6A6A6"],
                title: {
                    text: '用例执行结果趋势图'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#6a7985'
                        }
                    }
                },
                legend: {
                    data: ['success', 'fail', 'not run']
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: false,
                        data: this.timeData.reverse(),
                        axisLabel: {
                            interval: 0,
                            rotate: 40
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [
                    {
                        name: 'success',
                        type: 'line',
                        stack: 'Total',
                        areaStyle: {},
                        emphasis: {
                            focus: 'series'
                        },
                        data: this.success.reverse()
                    },
                    {
                        name: 'fail',
                        type: 'line',
                        stack: 'Total',
                        areaStyle: {},
                        emphasis: {
                            focus: 'series'
                        },
                        data: this.fail.reverse()
                    },
                    {
                        name: 'not run',
                        type: 'line',
                        stack: 'Total',
                        areaStyle: {},
                        emphasis: {
                            focus: 'series'
                        },
                        data: this.notRun.reverse()
                    }
                ],
            },
        }
    },
    mounted() {
        this.width = window.innerWidth
        window.addEventListener('resize', this.handleResize)
        var dialogWidth = (this.width * 0.9) - 30

        var apiReportCharts = document.getElementById('apiReportCharts')
        apiReportCharts.style.width = dialogWidth + 'px'


        var apiChart = echarts.init(document.getElementById('apiReportCharts'));
        // 绘制图表
        apiChart.setOption(
            this.initEcharts
        )
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize)
    },

    methods: {
        handleResize() {
            this.width = window.innerWidth
            var dialogWidth = (this.width * 0.9) - 30

            var apiReportCharts = document.getElementById('apiReportCharts')
            apiReportCharts.style.width = dialogWidth + 'px'
        },
    }

}
</script>

<style lang="scss"></style>