<template>
    <div class="edit_dev">
        <el-transfer v-model="value" :data="allTempInfo" filterable filter-placeholder="搜索内容" :titles="['可选接口列表', '已选接口列表']"
            :button-texts="['取消', '预选']" target-order="push">
            <template #left-footer>
                <el-button type="success" size="small" :loading="tempInfoLoading" @click="getTempInfo">查询模板列表</el-button>
                <el-button type="success" size="small" :loading="tempDataLoading"
                    @click="getTempData">查询模板详情</el-button><el-input v-model="tempId" style="width:100px" size="small"
                    placeholder="tempId"></el-input>
            </template>
            <template #right-footer>
                <el-button type="primary" size="small">确认</el-button>
            </template>
        </el-transfer>
    </div>
</template>

<script>
import { Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
export default {
    name: 'MyTransfer',

    data() {
        return {
            Check,
            tempId: null,
            allTempInfo: [],
            tempInfoLoading: false,
            tempDataLoading: false,
            value: [],
            infoFlag: false,
            getTempId: []
        }
    },
    methods: {
        // 获取模板信息
        async getTempInfo() {
            this.tempInfoLoading = true
            this.allTempInfo = []
            var temp = []
            await this.$http.get('/template/name/list?outline=false').then(
                function (response) {
                    temp = response.data
                }).catch(function (error) {
                    ElMessage.error(error.message)
                })
            for (var x in temp) {
                this.allTempInfo.push({
                    key: temp[x].id,
                    label: temp[x].id + '-' + temp[x].temp_name,
                    disabled: true
                })
            }
            this.tempInfoLoading = false
            this.infoFlag = true
            this.getTempId = []
        },
        // 模板详情数据
        async getTempData() {
            this.tempDataLoading = true
            if (this.infoFlag) {
                this.allTempInfo = []
                this.infoFlag = false
            }

            if (!this.getTempId.includes(this.tempId)) {
                var tempInfo = this.allTempInfo
                await this.$http.get('/template/data/list?temp_id=' + this.tempId).then(
                    function (response) {
                        var data = response.data
                        for (var x in data) {
                            tempInfo.push({
                                key: data[x].temp_id + '-' + data[x].number,
                                label: data[x].temp_id + '-' + data[x].number + '-' + data[x].method.padEnd(7, '-') + '-' + data[x].path,
                                disabled: false,
                                // 以下数据是可用的
                                temp_id: data[x].temp_id,
                                number: data[x].number,
                                method: data[x].method,
                                path: data[x].path
                            })
                        }
                    }
                ).catch(function (error) {
                    ElMessage.error(error.message)
                })
                this.allTempInfo = []
                for (var x in tempInfo) {
                    this.allTempInfo.push(tempInfo[x])
                }
                this.getTempId.push(this.tempId)
            } else {
                ElMessage.warning('列表中已有该模板的数据列表, 请查询其他模板ID')
            }
            this.tempDataLoading = false
        },
    }
}
</script>

<style scoped>
.edit_dev>>>.el-transfer-panel {
    width: 530px;
    height: 600px;
}

.edit_dev>>>.el-transfer-panel__body {
    height: 500px;
}
</style>
