<template>
    <el-form>
        <el-form-item label="环境名称" label-width="80px" :required="true" placeholder="">
            <el-input v-model="settingName_">
                <template #append>
                    <el-button plain @click="updateName">修改</el-button>
                </template>
            </el-input>
        </el-form-item>
    </el-form>

    <el-tabs v-model="activeName" :tab-position="'top'" type="border-card" @tab-click="handleTabClick">
        <el-tab-pane label="关联api用例" name="api_case">
            <el-table :data="api_case" stripe fit empty-text="空">
                <el-table-column label="系统" prop="project_name" width="100"></el-table-column>
                <el-table-column label="模板" prop="temp_name"></el-table-column>
                <el-table-column label="用例" prop="case_name"></el-table-column>
                <el-table-column label="操作" align="center" width="180px">
                    <template #default="scope">
                        <el-switch v-model="scope.row.bind" active-text="绑定" inactive-text="未绑定"
                            :loading="scope.row.loading" style="--el-switch-on-color: #E6A23C;"
                            @click="settingBind(scope.row, 'api_case')" inline-prompt></el-switch>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>

        <el-tab-pane label="关联ui用例" name="ui_case">
            <el-table :data="ui_case" stripe fit empty-text="空">
                <el-table-column label="系统" prop="project_name" width="100px"></el-table-column>
                <el-table-column label="用例" prop="case_name"></el-table-column>
                <el-table-column label="操作" align="center" width="180px">
                    <template #default="scope">
                        <el-switch v-model="scope.row.bind" active-text="绑定" inactive-text="未绑定"
                            :loading="scope.row.caseDataLoading" style="--el-switch-on-color: #E6A23C;"
                            @click="settingBind(scope.row, 'ui_case')" inline-prompt></el-switch>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>

        <el-tab-pane label="域名列表" name="host">
            <el-table :data="host" stripe fit empty-text="空">
                <el-table-column label="名称" prop="name" align="center" width="150px"></el-table-column>
                <el-table-column label="域名" prop="host" align="center"></el-table-column>
                <el-table-column label="操作" align="center" width="180px">
                    <template #default="scope">
                        <el-switch v-model="scope.row.bind" active-text="绑定" inactive-text="未绑定"
                            :loading="scope.row.caseDataLoading" style="--el-switch-on-color: #E6A23C;"
                            @click="settingBind(scope.row, 'host')" inline-prompt></el-switch>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>

        <el-tab-pane label="自定参数" name="customize">
            <el-table :data="customize" stripe fit empty-text="空">
                <el-table-column label="名称" prop="name" align="center" width="150px"></el-table-column>
                <el-table-column label="key" prop="key" align="center"></el-table-column>
                <el-table-column label="value" prop="value" align="center"></el-table-column>
                <el-table-column label="type" prop="type" align="center"></el-table-column>
                <el-table-column label="操作" align="center" width="180px">
                    <template #default="scope">
                        <el-switch v-model="scope.row.bind" active-text="绑定" inactive-text="未绑定"
                            :loading="scope.row.caseDataLoading" style="--el-switch-on-color: #E6A23C;"
                            @click="settingBind(scope.row, 'customize')" inline-prompt></el-switch>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>

        <el-tab-pane label="数据库表" name="db">
            <el-table :data="db" stripe fit empty-text="空">
                <el-table-column label="名称" prop="name" align="center" width="150px"></el-table-column>
                <el-table-column label="host" prop="host" align="center" width="150px"></el-table-column>
                <el-table-column label="user" prop="user" align="center" width="120px"></el-table-column>
                <el-table-column label="password" prop="password" align="center" width="120px"></el-table-column>
                <el-table-column label="database" prop="database" align="center" width="120px"></el-table-column>
                <el-table-column label="port" prop="port" align="center" width="120px"></el-table-column>
                <el-table-column label="charset" prop="charset" align="center"></el-table-column>
                <el-table-column label="操作" align="center" width="180px" fixed="right">
                    <template #default="scope">
                        <el-switch v-model="scope.row.bind" active-text="绑定" inactive-text="未绑定"
                            :loading="scope.row.caseDataLoading" style="--el-switch-on-color: #E6A23C;"
                            @click="settingBind(scope.row, 'db')" inline-prompt></el-switch>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>

    </el-tabs>
</template>

<script>
import { ElMessage, ElNotification } from 'element-plus'
export default {
    name: 'MySettingBind',

    props: {
        'settingName': String,
        'settingId': Number
    },

    data() {
        return {
            api_case: [],
            ui_case: [],
            host: [],
            customize: [],
            db: [],
            settingName_: this.settingName,
            activeName: 'api_case',
            tabName: { props: { name: 'api_case' } },
        }
    },

    mounted() {
        this.handleTabClick(this.tabName)
    },

    methods: {
        // 绑定数据
        async settingBind(row, type) {
            row.loading = true
            switch (type) {
                case 'api_case':
                    var api_case = row.case_id
                    break
                case 'ui_case':
                    var ui_case = row.case_id
                    break
                case 'host':
                    var host = row.id
                    break
                case 'customize':
                    var customize = row.id
                    break
                case 'db':
                    var db = row.id
                    break

            }
            await this.$http({
                url: '/setting/update/bind',
                method: 'PUT',
                params: {
                    setting_id: this.settingId,
                    api_case: api_case,
                    ui_case: ui_case,
                    host: host,
                    customize: customize,
                    db_: db,
                    bind: row.bind
                }
            }).then(
                function () {
                    ElNotification.success({
                        title: 'Success',
                        message: '绑定成功',
                    })
                    row.loading = false
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
                row.loading = false
            })
        },
        // 修改环境名称
        async updateName() {
            await this.$http({
                url: '/setting/update/name',
                method: 'PUT',
                params: {
                    setting_id: this.settingId,
                    name: this.settingName_,
                }
            }).then(
                function () {
                    ElNotification.success({
                        title: 'Success',
                        message: '添加成功',
                    })
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
            })
        },
        // 切换tab触发
        async handleTabClick(tab) {
            this.tabName.props.name = tab.props.name
            var api_case = []
            switch (tab.props.name) {
                case 'api_case':
                    await this.$http({
                        url: '/setting/get/case/api',
                        method: 'GET',
                        params: {
                            setting_id: this.settingId,
                            page: 1,
                            size: 1000,
                        }
                    }).then(
                        function (response) {
                            api_case = response.data
                            for (var x in api_case) {
                                api_case[x].loading = false
                            }
                        }
                    ).catch(function (error) {
                        ElMessage.error(error.message)
                    })
                    this.api_case = api_case
                    break

                case 'ui_case':
                    var ui_case = []
                    await this.$http({
                        url: '/setting/get/case/ui',
                        method: 'GET',
                        params: {
                            setting_id: this.settingId,
                            page: 1,
                            size: 1000,
                        }
                    }).then(
                        function (response) {
                            ui_case = response.data
                            for (var x in ui_case) {
                                ui_case[x].loading = false
                            }
                        }
                    ).catch(function (error) {
                        ElMessage.error(error.message)
                    })
                    this.ui_case = ui_case
                    break

                case 'host':
                    var host = []
                    await this.$http({
                        url: '/setting/get/host',
                        method: 'GET',
                        params: {
                            setting_id: this.settingId,
                        }
                    }).then(
                        function (response) {
                            host = response.data
                            for (var x in host) {
                                host[x].loading = false
                            }
                        }
                    ).catch(
                        function (error) {
                            ElMessage.error(error.message)
                        }
                    )
                    this.host = host
                    break

                case 'db':
                    var db = []
                    await this.$http({
                        url: '/setting/get/db',
                        method: 'GET',
                        params: {
                            setting_id: this.settingId,
                        }
                    }).then(
                        function (response) {
                            db = response.data
                            for (var x in db) {
                                db[x].loading = false
                            }
                        }
                    ).catch(
                        function (error) {
                            ElMessage.error(error.message)
                        }
                    )
                    this.db = db
                    break


                case 'customize':
                    var customize = []
                    await this.$http({
                        url: '/setting/get/customize',
                        method: 'GET',
                        params: {
                            setting_id: this.settingId,
                        }
                    }).then(
                        function (response) {
                            customize = response.data
                            for (var x in customize) {
                                customize[x].loading = false
                            }
                        }
                    ).catch(
                        function (error) {
                            ElMessage.error(error.message)
                        }
                    )
                    this.customize = customize
                    break
            }
        },
    }
}
</script>

<style ></style>