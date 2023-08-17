<template>
    <el-tabs v-model="activeName" :tab-position="'top'" type="border-card" @tab-click="handleTabClick">
        <el-tab-pane label="域名列表" name="host">
            <el-table :data="settingInfo.temp_host" stripe fit empty-text="空">
                <el-table-column label="原始域名" prop="host" align="center"></el-table-column>
                <el-table-column label="环境域名" align="center">
                    <template #default="scope">
                        <el-select v-model="scope.row.settingHost" placeholder="选择域名" @visible-change="handleVisibleChange">
                            <el-option v-for="item in hosts" :key="item.host" :label="item.host"
                                :value="item.host"></el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="替换" align="center" width="70px">
                    <template #default="scope">
                        <el-checkbox v-model=scope.row.change @change="setSetting(scope.row, 'host')" />
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>

        <el-tab-pane label="自定参数" name="customize">
            <el-table :data="settingInfo.customize" stripe fit empty-text="空">
                <el-table-column label="名称" prop="name" align="center" width="150px"></el-table-column>
                <el-table-column label="key" prop="key" align="center"></el-table-column>
                <el-table-column label="value" prop="value" align="center">
                    <template #default="scope">
                        <el-input v-model="scope.row.value" :placeholder="scope.row.value"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="type" prop="type" align="center">
                    <template #default="scope">
                        <el-select v-model="scope.row.type" :placeholder="scope.row.type">
                            <el-option label="string" value='string' />
                            <el-option label="number" value='number' />
                            <el-option label="int" value='int' />
                            <el-option label="float" value='float' />
                            <el-option label="boolean" value='boolean' />
                            <el-option label="null" value='null' />
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="使用" align="center" width="70px">
                    <template #default="scope">
                        <el-checkbox v-model=scope.row.change @change="setSetting(scope.row, 'customize')" />
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>

        <el-tab-pane label="数据库表" name="db">
            <el-table :data="settingInfo.db" stripe fit empty-text="空">
                <el-table-column label="名称" prop="name" align="center" width="150px"></el-table-column>
                <el-table-column label="host" prop="host" align="center" width="150px"></el-table-column>
                <el-table-column label="user" prop="user" align="center" width="120px"></el-table-column>
                <el-table-column label="password" prop="password" align="center" width="120px"></el-table-column>
                <el-table-column label="database" prop="database" align="center" width="120px"></el-table-column>
                <el-table-column label="port" prop="port" align="center" width="120px"></el-table-column>
                <el-table-column label="charset" prop="charset" align="center"></el-table-column>
                <el-table-column label="使用" align="center" width="70px" fixed="right">
                    <template #default="scope">
                        <el-checkbox v-model=scope.row.change @change="setSetting(scope.row, 'db')" />
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>

    </el-tabs>
</template>

<script>
import { ElMessage, ElNotification } from 'element-plus'
export default {
    name: 'RunApiCase',

    props: {
        'settingInfo': Object
    },

    data() {
        return {
            activeName: 'host',
            hosts: null,
            settingHost: null,
        }
    },

    methods: {
        async handleVisibleChange(val) {
            if (!val) {
                return
            }
            this.hosts = this.settingInfo.host
        },

        // 设置环境数据
        async setSetting(row, confType) {
            switch (confType) {
                case 'host':
                    if (row.settingHost === undefined) {
                        row.change = false
                        ElNotification.warning({
                            title: 'Warning',
                            message: '需要选择环境域名',
                        })
                        return
                    }
                    break
                case 'customize':
                    break
                case 'db':
                    break
            }

            await this.$http({
                url: '/runCase/set/api/setting/info',
                method: 'PUT',
                params: {
                    setting_list_id: this.settingInfo.setting_list_id,
                    id_card: this.settingInfo.id_card,
                    conf_type: confType,
                },
                data: JSON.stringify({
                    temp_host: confType == 'host' ? this.settingInfo.temp_host : null,
                    customize: confType == 'customize' ? this.settingInfo.customize : null,
                    db_: confType == 'db' ? this.settingInfo.db : null
                }),
                headers: {
                    'content-type': "application/json"
                }

            }).then(
                function () {
                    // ElNotification.success({
                    //     title: 'Success',
                    //     message: '绑定成功',
                    // })
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
            })
        }
    }
}
</script>

<style ></style>