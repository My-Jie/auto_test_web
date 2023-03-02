<template>
    <el-table :data="caseData" stripe fit>
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
                    <el-input v-model="scope.row.config.sleep" size="small"
                        @keyup.enter.native="setConfigStatus(scope.row, 'sleep')">
                        <template #prepend>轮询</template>
                        <template #append>
                            <el-button :icon="Check" size="small"
                                @click="setConfigStatus(scope.row, 'sleep')">轮询失败</el-button>
                        </template>
                    </el-input>
                </el-col>
            </template>
        </el-table-column>
        <el-table-column fixed="left" label="number" prop="number" type="index" :index="indexMethod"
            width="60"></el-table-column>
        <el-table-column label="path" prop="path" width="300px"></el-table-column>
        <!-- 描述的按钮和内容框 -->
        <el-table-column label="" width="40" align="center">
            <template #default="scope">
                <el-button :icon="Edit" size="small" v-if="scope.row.edit" @click="scope.row.edit = false"></el-button>
                <el-button :icon="Check" size="small" v-if="!scope.row.edit"
                    @click="checkDescription(scope.row)"></el-button>
            </template>
        </el-table-column>
        <el-table-column label="description" prop="description" width="250px">
            <template #default="scope">
                <div v-if="scope.row.description && scope.row.edit">{{ scope.row.description }}</div>
                <el-input v-model="scope.row.description" placeholder="可输入" v-if="scope.row.edit == false"
                    @keyup.enter.native="checkDescription(scope.row)"></el-input>
            </template>
        </el-table-column>
        <!-- 校验的按钮和内容框 -->
        <el-table-column label="" width="40" align="center">
            <template #default="scope">
                <el-button :icon="Edit" size="small" @click=setCheck(scope.row)></el-button>
            </template>
        </el-table-column>
        <el-table-column label="check" prop="check" show-overflow-tooltip='true' width="250px">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.check, null, 1) }}</div>
            </template>
        </el-table-column>
        <!-- params的按钮和内容框 -->
        <el-table-column label="" width="40" align="center">
            <template #default="scope">
                <el-button :icon="Edit" size="small"></el-button>
            </template>
        </el-table-column>
        <el-table-column label="params" prop="params" show-overflow-tooltip='true' width="400px">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.params, null, 1) }}</div>
            </template>
        </el-table-column>
        <!-- data的按钮和内容框 -->
        <el-table-column label="" width="40" align="center">
            <template #default="scope">
                <el-button :icon="Edit" size="small"></el-button>
            </template>
        </el-table-column>
        <el-table-column label="data" prop="data" show-overflow-tooltip='true' width="400px">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.data, null, 1) }}</div>
            </template>
        </el-table-column>
        <!-- headers的按钮和内容框 -->
        <el-table-column label="" width="40" align="center">
            <template #default="scope">
                <el-button :icon="Edit" size="small"></el-button>
            </template>
        </el-table-column>
        <el-table-column label="headers" prop="headers" show-overflow-tooltip='true' width="400px">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.headers, null, 1) }}</div>
            </template>
        </el-table-column>
    </el-table>
    <!-- check的弹窗 -->
    <el-dialog v-model='checkDialog' width="50%"
        :title="'CaseId-' + this.caseId + ' , Number-' + this.checkNumber + ' , 响应校验-断言'" :close-on-click-modal=false
        :close-on-press-escape=false @close='closeCheckDialog'>
        <el-table :data="checkInfo" stripe fit empty-text="空">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="key" align="center" width="120px">
                <template #default="scope">
                    <div v-if="!scope.row.edit">{{ scope.row.key }}</div>
                    <el-input v-if="scope.row.edit" v-model="scope.row.key" placeholder="校验字段" size="small" />
                </template>
            </el-table-column>
            <el-table-column label="比较符" align="center" width="90px">
                <template #default="scope">
                    <div v-if="!scope.row.edit">{{ scope.row.compare }}</div>
                    <el-select v-model="scope.row.s" :placeholder="scope.row.s" v-if="scope.row.edit" size="small">
                        <el-option label="等于" value="==" />
                        <el-option label="不等于" value="!=" />
                        <el-option label="小于" value="<" />
                        <el-option label="小于等于" value="<=" />
                        <el-option label="大于" value=">" />
                        <el-option label="大于等于" value=">=" />
                        <el-option label="包含" value="in" />
                        <el-option label="不包含" value="not in" />
                        <el-option label="不包含" value="notin" />
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column label="数据类型" align="center" width="90px">
                <template #default="scope">
                    <div v-if="!scope.row.edit">{{ scope.row.type }}</div>
                    <el-select v-model="scope.row.type" :placeholder="scope.row.type" v-if="scope.row.edit" size="small">
                        <el-option label="string" value='string' />
                        <el-option label="number" value='number' />
                        <el-option label="boolean" value='boolean' />
                        <el-option label="null" value='null' />
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column label="value" align="center">
                <template #default="scope">
                    <div v-if="!scope.row.edit">{{ scope.row.value }}</div>
                    <el-input v-if="scope.row.edit && scope.row.type == 'string'" v-model="scope.row.value"
                        placeholder="校验内容" size="small" />
                    <el-input-number v-if="scope.row.edit && scope.row.type == 'number'" v-model="scope.row.value"
                        placeholder="校验内容" size="small" />
                    <el-select v-if="scope.row.edit && scope.row.type == 'boolean'" v-model="scope.row.value"
                        :placeholder=true size="small">
                        <el-option label="true" :value='true' />
                        <el-option label="false" :value='false' />
                    </el-select>
                    <el-input v-if="scope.row.edit && scope.row.type == 'null'" v-model="scope.row.value"
                        placeholder="null" size="small" />
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="180px">
                <template #default="scope">
                    <!-- 编辑操作 -->
                    <el-button :icon="Edit" type="primary" size="small" v-if="!scope.row.edit"
                        @click="scope.row.edit = true"></el-button>
                    <el-button :icon="Check" type="success" size="small" v-if="scope.row.edit"
                        @click="checkCheck(scope.row)"></el-button>
                    <!-- 增加操作 -->
                    <el-button :icon="Plus" type="warning" size="small" @click="addRow"></el-button>
                    <!-- 删除操作 -->
                    <el-button :icon="Delete" type="danger" size="small" v-if="!scope.row.del"
                        @click="Del(scope.row)"></el-button>
                    <el-button :icon="Check" type="success" size="small" v-if="scope.row.del"
                        @click="checkDel(scope.row)"></el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-dialog>
</template>

<script>
import { ElNotification } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Edit, Check, Plus, Delete } from '@element-plus/icons-vue'
export default {
    name: 'CaseData',
    props: {
        'caseData': Array,
        'caseId': Number
    },

    data() {
        return {
            Edit,
            Check,
            Plus,
            Delete,
            checkDialog: false,
            checkNumber: null,
            checkInfo: [],
        }
    },

    methods: {
        // 校验内容的弹窗
        setCheck(row) {
            this.checkNumber = row.number
            var num = 0
            for (var x in row.check) {
                var checkDict = {}
                checkDict.key = x
                checkDict.edit = false
                checkDict.del = false
                checkDict.num = num
                if (row.check[x] instanceof Array) {
                    var compare = row.check[x][0]
                    checkDict.type = row.check[x][1] == null ? "null" : typeof row.check[x][1]
                    if (compare == '==') {
                        checkDict.compare = '等于'
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    } else if (compare == '<') {
                        checkDict.compare = '小于'
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    } else if (compare == '<=') {
                        checkDict.compare = '小于等于'
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    } else if (compare == '!=') {
                        checkDict.compare = '不等于'
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    } else if (compare == '>') {
                        checkDict.compare = '大于'
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    } else if (compare == '>=') {
                        checkDict.compare = '大于等于'
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    } else if (compare == 'in') {
                        checkDict.compare = '包含'
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    } else if (compare == 'not in') {
                        checkDict.compare = '不包含'
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    } else if (compare == 'notin') {
                        checkDict.compare = '不包含'
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    } else {
                        checkDict.compare = '未识别'
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    }

                } else {
                    checkDict.compare = '等于'
                    checkDict.s = '=='
                    checkDict.value = row.check[x]
                    checkDict.type = row.check[x] == null ? "null" : typeof row.check[x]
                }
                if (checkDict.value == null) {
                    checkDict.value = 'null'
                }
                // 添加到数组
                this.checkInfo.push(checkDict)
                num++
            }
            this.checkDialog = true
        },
        // 编辑的Check的确认
        checkCheck(row) {
            row.edit = false
            console.log(row);
            console.log(this.caseId);
            console.log(this.checkNumber);
        },
        // 新增row
        addRow() {
            this.checkInfo.push({
                compare: '等于',
                key: null,
                s: '==',
                value: null,
                del: false,
                edit: true,
                type: 'string',
                num: this.checkInfo.length
            })
        },
        // 删除的判断
        Del(row) {
            console.log(row);
            if ((row.key == null || row.key == '') && (row.value == null || row.value == '')) {
                var num = 0
                for (var x in this.checkInfo) {
                    if (this.checkInfo[x].num == row.num)
                        this.checkInfo.splice(num, 1)
                    num++
                }
            } else {
                row.del = true
            }
        },
        // 删除的确认
        checkDel(row) {
            row.del = false
            console.log(row);
        },
        // 关闭校验弹窗
        closeCheckDialog() {
            this.checkDialog = false
            this.checkInfo = []
        },

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
            } else if (config == 'sleep') {
                newConfig.sleep = row.config.sleep
                row.sleepLoading = true
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
                    } else if (config == 'sleep') {
                        row.sleepLoading = false
                        ElNotification.success({
                            title: 'Success',
                            message: 'number:' + row.number + ' ' + row.config.sleep + 's',
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