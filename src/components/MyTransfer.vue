<template>
    <el-transfer v-model="value" :data="allTempInfo" filterable filter-placeholder="搜索内容" :titles="['可选接口列表', '已选接口列表']"
        :button-texts="['取消', '预选']" target-order="push">
        <template #left-footer>
            &nbsp;
            <el-button type="success" size="small" :loading="tempInfoLoading" @click="getTempInfo">查询模板列表</el-button>
            <el-button type="success" size="small" :loading="tempDataLoading" @click="getTempData">查询模板详情</el-button>&nbsp;
            <el-input v-model="tempId" style="width:100px" size="small"
                placeholder="tempId"></el-input>&nbsp;&nbsp;&nbsp;&nbsp;
            <el-button type="success" size="small" :loading="tempInfoAllLoading"
                @click="getTempInfoAll">查询所有模板详情</el-button>
            <el-button type="success" size="small" @click="closeData">清空</el-button>
        </template>
        <template #right-footer>
            &nbsp;
            <el-button type="primary" size="small" @click="checkTemp" :loading="tempCheckLoading">确认组装</el-button>&nbsp;
            <el-input v-model="tempName" style="width:200px" size="small" placeholder="tempName"></el-input>
            <el-select v-model="projectName" placeholder="选择系统" size="small" @visible-change="handleVisibleChange">
                <el-option v-for="item in projects" :key="item.code" :label="item.code" :value="item.id"></el-option>
            </el-select>
        </template>
    </el-transfer>
</template>

<script>
import { Check } from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'
export default {
    name: 'MyTransfer',

    data() {
        return {
            Check,
            tempId: null,
            tempName: null,
            projectName: null,
            allTempInfo: [],
            tempInfoLoading: false,
            tempDataLoading: false,
            tempCheckLoading: false,
            tempInfoAllLoading: false,
            value: [],
            infoFlag: false,
            getTempId: [],
            projects: []
        }
    },

    mounted() {
        this.width = window.innerWidth
        window.addEventListener('resize', this.handleResize)
        var dialogWidth = (this.width * 0.65) / 2
        var temp_list = document.getElementsByClassName('el-transfer-panel')[0]
        temp_list.style.width = dialogWidth + 'px'
        var temp_list_1 = document.getElementsByClassName('el-transfer-panel')[1]
        temp_list_1.style.width = dialogWidth + 'px'
        temp_list_1.style.float = 'right'

        var elt_bt = document.getElementsByClassName('el-transfer__buttons')[0]
        elt_bt.style.padding = '0px 10px'
        elt_bt.style.marginLeft = (this.width * 0.8 / 2 - 20) - dialogWidth - 89 + 'px'

    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize)
    },

    methods: {
        handleResize() {
            this.width = window.innerWidth
            var dialogWidth = (this.width * 0.65) / 2

            var temp_list = document.getElementsByClassName('el-transfer-panel')[0]
            temp_list.style.width = dialogWidth + 'px'
            var temp_list_1 = document.getElementsByClassName('el-transfer-panel')[1]
            temp_list_1.style.width = dialogWidth + 'px'
            temp_list_1.style.float = 'right'

            var elt_bt = document.getElementsByClassName('el-transfer__buttons')[0]
            elt_bt.style.marginLeft = (this.width * 0.8 / 2 - 20) - dialogWidth - 89 + 'px'
        },

        // 项目列表
        async handleVisibleChange(val) {
            if (!val) {
                return
            }
            var projects = []
            await this.$http({
                url: '/conf/get/project',
                method: 'GET',
            }).then(
                function (response) {
                    projects = response.data
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            this.projects = projects
        },
        closeData() {
            this.allTempInfo = []
            this.getTempId = []
            this.tempId = null
        },
        // 保存模板数据
        async checkTemp() {
            this.tempCheckLoading = true
            await this.$http({
                url: '/template/create/new/temp',
                method: 'POST',
                params: {
                    temp_name: this.tempName,
                    project_name: this.projectName
                },
                data: JSON.stringify(this.value),
                headers: {
                    'content-type': "application/json"
                }
            }).then(
                function () {
                    ElNotification.success({
                        title: 'Success',
                        message: '创建成功',
                    })
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            this.tempCheckLoading = false
        },
        // 查询所有接口
        async getTempInfoAll() {
            this.tempInfoAllLoading = true
            if (this.infoFlag) {
                this.allTempInfo = []
                this.infoFlag = false
            }

            if (!this.getTempId.includes('all')) {
                var tempInfo = this.allTempInfo
                await this.$http.get('/template/temp/all').then(
                    function (response) {
                        var data = response.data
                        for (var x in data) {
                            tempInfo.push({
                                key: data[x].temp_id + '-' + data[x].number + '-' + data[x].method,
                                label: data[x].temp_id + '-' + data[x].number + '-' + data[x].path + '_' + data[x].method,
                                disabled: false
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
                this.getTempId.push('all')
            } else {
                ElMessage.warning('列表中已有全部模板的数据, 请查询其他模板ID')
            }
            this.tempInfoAllLoading = false
        },
        // 获取模板信息
        async getTempInfo() {
            this.tempInfoLoading = true
            this.allTempInfo = []
            var temp = []
            await this.$http.get('/template/name/list?outline=false').then(
                function (response) {
                    temp = response.data.items
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
                var flag = false
                await this.$http.get('/template/data/list?temp_id=' + this.tempId).then(
                    function (response) {
                        var data = response.data
                        for (var x in data) {
                            tempInfo.push({
                                key: data[x].temp_id + '-' + data[x].number + '-' + data[x].method,
                                label: data[x].temp_id + '-' + data[x].number + '-' + data[x].method.padEnd(7, '-') + '-' + data[x].path,
                                disabled: false
                            })
                        }
                        flag = true
                    }
                ).catch(function (error) {
                    ElMessage.error(error.message)
                })

                if (flag) {
                    this.getTempId.push(this.tempId)
                    this.allTempInfo = []
                    for (var x in tempInfo) {
                        this.allTempInfo.push(tempInfo[x])
                    }
                }
            } else {
                ElMessage.warning('列表中已有该模板' + this.tempId + '的数据, 请查询其他模板ID')
            }
            this.tempDataLoading = false
        },
    }
}
</script>

<style scoped>
.el-dialog__header {
    color: beige;
}
</style>
