<template>
    <div>
        <div id="apiFree" :style="{ width: '900px', height: '500px' }" style="display:inline-block"></div>
        <div id="uiFree" :style="{ width: '900px', height: '500px' }" style="display:inline-block"></div>
    </div>
</template>

<script>
import * as echarts from "echarts";
export default {
    name: 'MyEchartsFree',

    props: {
        'apiFree': Array,
        'uiFree': Array,
    },

    data() {
        return {
            initEcharts: {
                textStyle: {
                    fontSize: 15
                },
                tooltip: {
                    trigger: 'item',
                    triggerOn: 'mousemove'
                },
                series: [
                    {
                        itemStyle: 2.5,
                        color: "rgba(72, 121, 135, 1)",

                        type: 'tree',
                        id: 0,
                        name: 'tree',
                        data: [],
                        top: '10%',
                        left: '10%',
                        bottom: '10%',
                        right: '20%',
                        symbolSize: 10,
                        edgeShape: 'polyline',
                        edgeForkPosition: '62%',
                        initialTreeDepth: 3,
                        lineStyle: {
                            width: 2,
                            color: "#e1396e",
                            curveness: 0.5
                        },
                        label: {
                            backgroundColor: '#ecbd92',
                            position: 'left',
                            verticalAlign: 'middle',
                            align: 'right',
                            show: true
                        },
                        leaves: {
                            label: {
                                position: 'right',
                                verticalAlign: 'middle',
                                align: 'left'
                            }
                        },
                        emphasis: {
                            focus: 'descendant'
                        },
                        expandAndCollapse: true,
                        animationDuration: 550,
                        animationDurationUpdate: 750
                    }
                ]
            }
        }
    },
    async mounted() {

        // 基于准备好的dom，初始化echarts实例
        var apiFreeData = JSON.parse(JSON.stringify(this.initEcharts))
        apiFreeData.series[0].data = [this.apiFree]
        // 绘制图表
        var apiFree = echarts.init(document.getElementById('apiFree'));
        apiFree.setOption(
            apiFreeData
        )

        var uiFreeData = JSON.parse(JSON.stringify(this.initEcharts))
        uiFreeData.series[0].data = [this.uiFree]
        uiFreeData.series[0].initialTreeDepth = 2
        // 绘制图表
        var uiFree = echarts.init(document.getElementById('uiFree'));
        uiFree.setOption(
            uiFreeData
        )
    },
}
</script>

<style ></style>