<template>
    <!-- 增加操作 -->
    <el-button v-if="settingInfo.length <= 0" type="warning" size="small" @click="addSettingSet()">添加</el-button>
    <el-table :data="settingInfo" stripe fit empty-text="空">
        <el-table-column label="环境名称" prop="name" align="center">
            <template #default="scope">
                <el-input v-model="scope.row.name" placeholder="环境名称" v-if="scope.row.add" />
            </template>
        </el-table-column>
        <el-table-column label="关联api用例" prop="api_case_ids" align="center">
            <template #default="scope">
                <div>{{ scope.row.api_case_ids.length }} 条</div>
            </template>
        </el-table-column>
        <el-table-column label="关联ui用例" prop="ui_case_ids" align="center">
            <template #default="scope">
                <div>{{ scope.row.ui_case_ids.length }} 条</div>
            </template>
        </el-table-column>
        <el-table-column label="域名列表" prop="host_ids" align="center">
            <template #default="scope">
                <div>{{ scope.row.host_ids.length }} 个</div>
            </template>
        </el-table-column>
        <el-table-column label="自定参数" prop="customize_ids" align="center">
            <template #default="scope">
                <div>{{ scope.row.customize_ids.length }} 个</div>
            </template>
        </el-table-column>
        <el-table-column label="数据库表" prop="db_ids" align="center">
            <template #default="scope">
                <div>{{ scope.row.db_ids.length }} 个</div>
            </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200px">
            <template #default="scope">
                <!-- 编辑操作 -->
                <el-button type="primary" size="small" v-if="!scope.row.edit && !scope.row.EditDisabled"
                    :disabled="scope.row.EditDisabled" @click="myEdit(scope.row)">编辑</el-button>
                <el-button type="success" size="small" v-if="scope.row.edit" @click="settingCheck(scope.row)">确认</el-button>
                <el-button type="success" size="small" v-if="scope.row.EditDisabled"
                    @click="myClose(scope.row)">关闭</el-button>
                <!-- 增加操作 -->
                <el-button type="warning" size="small" @click="addSettingSet()">添加</el-button>
                <!-- 删除操作 -->
                <el-button type="danger" size="small" v-if="!scope.row.del && !scope.row.delDisabled"
                    :disabled="scope.row.delDisabled" @click="myDel(scope.row)">删除</el-button>
                <el-button type="success" size="small" v-if="scope.row.del" @click="settingDel(scope.row)">确认</el-button>
                <el-button type="success" size="small" v-if="scope.row.delDisabled"
                    @click="myClose(scope.row)">关闭</el-button>
            </template>
        </el-table-column>
    </el-table>

    <!-- 绑定窗口 -->
    <el-dialog class="setting-bind" v-if="settingEdit" v-model="settingEdit" width="60%" title="配置项绑定" @close="get_setting" draggable>
        <my-setting-bind v-if="settingEdit" :setting-name="settingName" :setting-id="settingId"></my-setting-bind>
    </el-dialog>
</template>

<script>
import { ElMessage, ElNotification } from 'element-plus'
import { Edit, Check, Plus, Delete, Close } from '@element-plus/icons-vue'
import MySettingBind from './MySettingBind.vue'
export default {
    name: 'MySettingSet',

    props: {
        'settingInfo': Array
    },

    components: {
        MySettingBind,
    },

    inject: ["get_setting"],

    data() {
        return {
            Edit,
            Check,
            Plus,
            Delete,
            Close,
            MySettingBind,
            settingEdit: false,
            settingName: null,
            settingId: null,
        }
    },
    methods: {
        // 初始化数据
        addSettingSet() {
            this.settingInfo.push({
                name: null,
                api_case_ids: [],
                ui_case_ids: [],
                host_ids: [],
                customize_ids: [],
                db_ids: [],

                edit: true,
                delDisabled: true,
                add: true
            })
        },
        // 环境名称的提交
        async settingCheck(row) {
            if (row.add) {
                await this.$http({
                    url: '/setting/add/setting',
                    method: 'POST',
                    data: JSON.stringify({
                        name: row.name,
                    }),
                    headers: {
                        'content-type': "application/json"
                    }
                }).then(
                    function () {
                        ElNotification.success({
                            title: 'Success',
                            message: '添加成功',
                        })
                        row.edit = false
                        row.delDisabled = false
                    }
                ).catch(
                    function (error) {
                        ElMessage.error(error.message)
                    }
                )
                this.get_setting()
            } else {
                row.edit = false
                row.delDisabled = false
            }
        },
        // 环境删除
        async settingDel(row) {
            await this.$http({
                url: '/setting/del/setting',
                method: 'DELETE',
                params: {
                    setting_id: row.id
                },
            }).then(
                function () {
                    ElNotification.success({
                        title: 'Success',
                        message: '删除成功',
                    })
                    row.del = false
                    row.EditDisabled = false
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            this.get_setting()
        },
        // 编辑的判断
        myEdit(row) {
            this.settingEdit = true
            this.settingName = row.name
            this.settingId = row.id
            row.edit = true
            row.delDisabled = true
        },
        // 删除的判断
        myDel(row) {
            row.del = true
            row.EditDisabled = true
        },
        // 取消操作
        myClose(row) {
            row.edit = false
            row.delDisabled = false
            row.del = false
            row.EditDisabled = false
        },
    }
}
</script>

<style ></style>