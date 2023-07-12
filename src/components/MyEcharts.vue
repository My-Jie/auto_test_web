<template>
    <div>
        <div id="apiChart" :style="{ width: '900px', height: '500px' }" style="display:inline-block"></div>
        <div id="uiChart" :style="{ width: '900px', height: '500px' }" style="display:inline-block"></div>
    </div>
</template>

<script>
import * as echarts from "echarts";
export default {
    name: 'MyEcharts',

    props: {
        'apiEcharts': Array,
        'uiEcharts': Array,
    },

    data() {
        return {
            initEcharts: {
                color: ["#e1386d", "#4c7a8a", "#db889d"],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        // Use axis to trigger tooltip
                        type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
                    },
                },
                title: {
                    text: '标题文本',
                    left: '20%',
                    textStyle: {
                        //文字颜色
                        color: '#fff',
                        //字体风格,'normal','italic','oblique'
                        fontStyle: 'normal',
                        //字体粗细 'normal','bold','bolder','lighter',100 | 200 | 300 | 400...
                        fontWeight: 'bold',
                        //字体系列
                        // fontFamily: 'sans-serif',
                        //字体大小
                        fontSize: 18
                    },
                },
                legend: {
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                xAxis: {
                    type: 'value',
                    axisLabel: {//修改坐标系字体颜色
                        show: true,
                        textStyle: {
                            color: "#fff"
                        }
                    },
                },
                yAxis: {
                    type: 'category',
                    data: [],
                    axisLabel: {//修改坐标系字体颜色
                        show: true,
                        textStyle: {
                            color: "#fff"
                        }
                    },
                },
                series: [
                    {
                        name: 'Fail',
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: [],
                    },
                    {
                        name: 'Success',
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: [],
                    },
                    {
                        name: 'Total',
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: [],
                    }
                ],
                dataZoom: [//给x轴设置滚动条
                    {
                        start: 0,//默认为0
                        end: 100 - 1500 / 31,//默认为100
                        type: 'slider',
                        maxValueSpan: 14,//窗口的大小，显示数据的条数的
                        show: true,
                        yAxisIndex: [0],
                        handleSize: 0,//滑动条的 左右2个滑动条的大小
                        height: '90%',//组件高度
                        left: 870, //左边的距离
                        right: 15,//右边的距离
                        top: 55,//距离
                        borderColor: "rgba(43,48,67,0)",
                        // fillerColor: '#33384b',
                        backgroundColor: 'rgba(43,48,67,.8)',//两边未选中的滑动条区域的颜色
                        // showDataShadow: false,//是否显示数据阴影 默认auto
                        showDetail: true,//即拖拽时候是否显示详细数值信息 默认true
                        realtime: true, //是否实时更新
                        filterMode: 'filter',
                        yAxisIndex: [0, 1],//控制的 y轴
                    },
                    //下面这个属性是里面拖到
                    {
                        type: 'inside',
                        show: true,
                        yAxisIndex: [0, 1],
                        start: 1,//默认为1
                        end: 100 - 1500 / 31,//默认为100
                    },
                ],
            }
        }
    },
    async mounted() {

        // 基于准备好的dom，初始化echarts实例
        var apiChart = echarts.init(document.getElementById('apiChart'));


        var apiInitEcharts = JSON.parse(JSON.stringify(this.initEcharts))
        var yAxisFData = []
        for (var x in this.apiEcharts) {
            yAxisFData.push(this.apiEcharts[x].name)
        }
        apiInitEcharts.yAxis.data = yAxisFData

        // 次数/成功/失败
        var series_total = []
        var series_success = []
        var series_fail = []
        for (var x in this.apiEcharts) {
            if (this.apiEcharts[x].fail == 0) {
                series_fail.push('')
            } else {
                series_fail.push(this.apiEcharts[x].fail)
            }

            if (this.apiEcharts[x].success == 0) {
                series_success.push('')
            } else {
                series_success.push(this.apiEcharts[x].success)
            }

            if (this.apiEcharts[x].run_order == 0) {
                series_total.push('')
            } else {
                series_total.push(this.apiEcharts[x].run_order)
            }

        }
        apiInitEcharts.title.text = 'API统计数据'
        apiInitEcharts.series[0].data = series_fail
        apiInitEcharts.series[1].data = series_success
        apiInitEcharts.series[2].data = series_total

        // 绘制图表
        apiChart.setOption(
            apiInitEcharts
        )


        // 基于准备好的dom，初始化echarts实例
        var uiChart = echarts.init(document.getElementById('uiChart'));

        // 处理数据
        var uiInitEcharts = JSON.parse(JSON.stringify(this.initEcharts))
        var yAxisFData = []
        for (var x in this.uiEcharts) {
            yAxisFData.push(this.uiEcharts[x].name)
        }
        uiInitEcharts.yAxis.data = yAxisFData

        // 次数/成功/失败
        var series_fail = []
        var series_success = []
        var series_total = []
        for (var x in this.uiEcharts) {
            if (this.uiEcharts[x].fail == 0) {
                series_fail.push('')
            } else {
                series_fail.push(this.uiEcharts[x].fail)
            }

            if (this.uiEcharts[x].success == 0) {
                series_success.push('')
            } else {
                series_success.push(this.uiEcharts[x].success)
            }

            if (this.uiEcharts[x].run_order == 0) {
                series_total.push('')
            } else {
                series_total.push(this.uiEcharts[x].run_order)
            }

        }
        uiInitEcharts.title.text = 'UI统计数据'
        uiInitEcharts.series[0].data = series_fail
        uiInitEcharts.series[1].data = series_success
        uiInitEcharts.series[2].data = series_total

        // 绘制图表
        uiChart.setOption(
            uiInitEcharts
        )
    },

    methods: {

    }
}
</script>

<style ></style>