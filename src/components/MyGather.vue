<template>
    <el-button type="success" :loading="runLoading" @click="queryRun(false)">同步运行</el-button>
    <el-button type="success" :loading="asyncRunLoading" @click="queryRun(true)">异步运行</el-button>
    <el-table :data="gatherData" stripe fit :cell-class-name="onTableRowClassName">
        <el-table-column label="选择" width="50px" align="center" size="small" fixed="left">
            <template #default="scope">
                <el-checkbox v-model=scope.row.checkbox @click.prevent="suiteCheck(scope.row)" />
            </template>
        </el-table-column>
        <el-table-column label="序号" prop="suite" width="30px" align="center" fixed="left"></el-table-column>
        <el-table-column label="Number" prop="number" width="80px" align="center" fixed="left"></el-table-column>
        <el-table-column label="数据集名称" prop="name" width="150px" align="center"></el-table-column>
        <el-table-column label="Path" prop="path" show-overflow-tooltip='true' width="300px"></el-table-column>

        <el-table-column label="" width="40" align="center">
            <template #default="scope">
                <el-button :icon="View" size="small" @click="lookData(scope.row, 'params')"></el-button>
            </template>
        </el-table-column>
        <el-table-column label="Params" prop="params" show-overflow-tooltip='true' width="400px">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.params, null, 1) }}</div>
            </template>
        </el-table-column>
        <el-table-column label="" width="40" align="center">
            <template #default="scope">
                <el-button :icon="View" size="small" @click="lookData(scope.row, 'data')"></el-button>
            </template>
        </el-table-column>
        <el-table-column label="Data" prop="data" show-overflow-tooltip='true' width="400px">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.data, null, 1) }}</div>
            </template>
        </el-table-column>
        <el-table-column label="" width="40" align="center">
            <template #default="scope">
                <el-button :icon="View" size="small" @click="lookData(scope.row, 'check')"></el-button>
            </template>
        </el-table-column>
        <el-table-column label="Check" prop="check" show-overflow-tooltip='true' width="400px">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.check, null, 1) }}</div>
            </template>
        </el-table-column>
        <el-table-column label="" width="40" align="center">
            <template #default="scope">
                <el-button :icon="View" size="small" @click="lookData(scope.row, 'headers')"></el-button>
            </template>
        </el-table-column>
        <el-table-column label="Headers" prop="headers" show-overflow-tooltip='true' width="400px">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.headers, null, 1) }}</div>
            </template>
        </el-table-column>
    </el-table>
    <!-- 详情弹窗 -->
    <el-dialog v-model='dataDialog' width="50%" draggable :title="dataTitle + '-详情'">
        <el-input v-model="Data" type="textarea" spellcheck="false" :rows="dataLength"></el-input>
    </el-dialog>
    <!-- 运行弹窗 -->
    <el-dialog v-model="runDialog" :title="runTitle" width="30%">
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="runDialog = false">取消</el-button>
                <el-button type="primary" @click="runCase">确认</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script>
import { View } from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'
export default {
    name: 'MyGather',
    props: {
        'gatherData': Array,
        'caseId': Number
    },
    data() {
        return {
            View,
            Data: null,
            dataLength: 0,
            dataDialog: false,
            dataTitle: '',
            runLoading: false,
            asyncRunLoading: false,
            async_: null,
            runDialog: false,
            runTitle: ''
        }
    },

    methods: {
        // 确认运行
        queryRun(type) {
            this.async_ = type
            if (type) {
                this.runTitle = '异步运行'
            } else (
                this.runTitle = '同步运行'
            )
            this.runDialog = true
        },
        // 运行用例
        async runCase() {
            this.runDialog = false
            if (this.async_) {
                this.asyncRunLoading = true
            } else {
                this.runLoading = true
            }
            var suite_list = []
            for (var x in this.gatherData) {
                if (this.gatherData[x].checkbox && !suite_list.includes(this.gatherData[x].suite)) {
                    suite_list.push(this.gatherData[x].suite)
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

            var case_id = this.caseId
            await this.$http({
                url: '/runCase/gather',
                method: 'POST',
                data: JSON.stringify({
                    case_id: case_id,
                    suite: suite_list,
                    async_: this.async_
                }),
                headers: {
                    'content-type': "application/json"
                }

            }).then(
                function (response) {
                    if (response.data.code == 0) {
                        var case_report = response.data.data.allure_report[case_id]
                        if (!case_report.is_fail) {
                            ElNotification({
                                title: '测试报告',
                                message: '<a href="' + case_report.report + '/index.html" target="_blank">查看用例[' + case_id + ']的报告</a>',
                                duration: 0,
                                type: 'success',
                                position: 'bottom-right',
                                dangerouslyUseHTMLString: true,
                            })
                        } else {
                            ElNotification({
                                title: '测试报告',
                                message: '<a href="' + case_report.report + '/index.html" target="_blank">查看用例[' + case_id + ']的报告</a>',
                                duration: 0,
                                type: 'warning',
                                position: 'bottom-right',
                                dangerouslyUseHTMLString: true,
                            })
                        }

                    } else {
                        ElNotification.error({
                            title: 'Error',
                            message: '用例 [ ' + case_id + ' ] 执行失败',
                            offset: 200,
                        })
                    }
                }

            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            if (this.async_) {
                this.asyncRunLoading = false
            } else {
                this.runLoading = false
            }
        },

        // 查看数据详情
        lookData(row, type) {
            this.dataTitle = '序号: ' + row.suite + '-Number: ' + row.number + '-' + type
            this.Data = JSON.stringify(row[type], null, 8);
            var length = 0
            for (var _ in row[type]) {
                length++
            }
            this.dataLength = length + 2
            this.dataDialog = true
        },
        // 复选框
        suiteCheck(row) {
            row.checkbox = row.checkbox ? false : true
            for (var x in this.gatherData) {
                if (row.suite == this.gatherData[x].suite) {
                    this.gatherData[x].checkbox = row.checkbox
                }
            }
        },
        // 表格颜色
        onTableRowClassName({ row, column, rowIndex, columnIndex }) {
            var color_index = [0, 5, 7, 9, 11]
            if (row.suite % 2 != 0 && !color_index.includes(columnIndex)) {
                return 'statistics-warning-row';
            } else {
                return '';
            }
        }
    }
}
</script>


<style>
.el-table__cell.statistics-warning-row .cell {
    background: #db9667;
}
</style>

