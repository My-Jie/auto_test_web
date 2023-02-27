<template>
    <el-table v-loading='loading' :data="caseData" stripe fit>
        <el-table-column fixed="left" label="config" prop="config" width="250%">
            <template #default="scope">
                <el-switch v-model="scope.row.config.stop" active-text="主动结束" inactive-text="主动结束"
                    :loading="scope.row.stopLoading" class="ml-2" style="--el-switch-on-color: #E6A23C;"
                    @click="setConfigStatus(scope.row, 'stop')" inline-prompt></el-switch>&nbsp;
                <el-switch v-model="scope.row.config.fail_stop" active-text="失败停止" inactive-text="失败停止"
                    :loading="scope.row.failStopLoading" class="ml-2" style="--el-switch-on-color: #F56C6C;"
                    @click="setConfigStatus(scope.row, 'fail_stop')" inline-prompt></el-switch>&nbsp;
                <el-switch v-model="scope.row.config.is_login" active-text="登录" inactive-text="登录"
                    :loading="scope.row.isLoginLoading" class="ml-2" style="--el-switch-on-color: #67C23A;"
                    @click="setConfigStatus(scope.row, 'is_login')" inline-prompt></el-switch>
                <el-col :span="20">
                    <el-input v-model="scope.row.config.sleep" size="small">
                        <template #prepend>轮询</template>
                        <template #append>秒后失败</template>
                    </el-input>
                </el-col>
            </template>
        </el-table-column>
        <el-table-column fixed="left" label="number" prop="number" type="index" :index="indexMethod"
            width="60"></el-table-column>
        <el-table-column label="path" prop="path" width="300px"></el-table-column>
        <el-table-column label="description" prop="description" width="300px" align="center">
            <template #default="scope">
                <el-button :icon="Edit" size="small" v-if="scope.row.edit" @click="scope.row.edit = false"></el-button>
                <div v-if="scope.row.description && scope.row.edit">{{ scope.row.description }}</div>
                <el-col :span="18">
                    <el-input v-model="scope.row.description" placeholder="可输入" v-if="scope.row.edit == false">
                        <template #append>
                            <el-button :icon="Check" @click="checkDescription(scope.row)"
                                :loading="scope.row.descriptionLoading" />
                        </template>
                    </el-input>
                </el-col>
            </template>
        </el-table-column>
        <el-table-column label="check" prop="check" show-overflow-tooltip='true' width="250px">
            <template #default="scope">
                <!-- <json-viewer :value="scope.row.check" /> -->
                <el-button :icon="Edit" size="small"></el-button>
                <div>{{ JSON.stringify(scope.row.check, null, 1) }}</div>
            </template>
        </el-table-column>
        <el-table-column label="params" prop="params" show-overflow-tooltip='true' width="400px">
            <template #default="scope">
                <!-- <json-viewer :value="scope.row.params" /> -->
                <div>{{ JSON.stringify(scope.row.params, null, 1) }}</div>
            </template>
        </el-table-column>
        <el-table-column label="data" prop="data" show-overflow-tooltip='true' width="400px">
            <template #default="scope">
                <!-- <json-viewer :value="scope.row.data" /> -->
                <div>{{ JSON.stringify(scope.row.data, null, 1) }}</div>
            </template>
        </el-table-column>
        <el-table-column label="headers" prop="headers" show-overflow-tooltip='true' width="400px">
            <template #default="scope">
                <!-- <json-viewer :value="scope.row.headers" /> -->
                <div>{{ JSON.stringify(scope.row.headers, null, 1) }}</div>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
import { ElNotification } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Edit, Check } from '@element-plus/icons-vue'
export default {
    name: 'CaseData',
    props: {
        'caseData': Array,
        'caseId': Number
    },

    data() {
        return {
            Edit,
            Check
        }
    },

    methods: {
        indexMethod(index) {
            return this.caseData[index]['number']
        },

        // 修改描述的接口
        async checkDescription(row) {
            row.descriptionLoading = true
            await this.$http({
                url: '/caseService/set/api/description',
                method: 'PUT',
                data: JSON.stringify({
                    case_id: this.caseId,
                    number: row.number,
                    description: row.description
                }),
                headers: {
                    'content-type': "application/json"
                }
            }).then(
                function () {
                    ElNotification.success({
                        title: 'Success',
                        message: '修改成功',
                        offset: 200,
                    })
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            row.descriptionLoading = false
            row.edit = true
        },

        // 配置项设置方法
        async setConfigStatus(row, config) {
            var newConfig = {}
            var stopMsg = row.config.stop ? '开启主动结束' : '关闭主动结束'
            var failStopMsg = row.config.fail_stop ? '开启失败停止' : '关闭失败停止'
            var isLoginMsg = row.config.is_login ? '登录标记' : '取消登录标记'
            if (config == 'stop') {
                newConfig.stop = row.config.stop
                row.stopLoading = true
            } else if (config == 'fail_stop') {
                newConfig.fail_stop = row.config.fail_stop
                row.failStopLoading = true
            } else if (config == 'is_login') {
                newConfig.is_login = row.config.is_login
                row.isLoginLoading = true
            }
            await this.$http({
                url: '/caseService/set/api/config',
                method: "PUT",
                data: JSON.stringify({
                    case_id: this.caseId,
                    number: row.number,
                    config: newConfig
                }),
                headers: {
                    'content-type': "application/json"
                }
            }).then(
                function () {
                    if (config == 'stop') {
                        row.stopLoading = false
                        ElNotification.success({
                            title: 'Success',
                            message: 'number:' + row.number + ' ' + stopMsg,
                            offset: 200,
                        })
                    } else if (config == 'fail_stop') {
                        row.failStopLoading = false
                        ElNotification.success({
                            title: 'Success',
                            message: 'number:' + row.number + ' ' + failStopMsg,
                            offset: 200,
                        })
                    } else if (config == 'is_login') {
                        row.isLoginLoading = false
                        ElNotification.success({
                            title: 'Success',
                            message: 'number:' + row.number + ' ' + isLoginMsg,
                            offset: 200,
                        })
                    }
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
            })


        }
    }
}

</script>