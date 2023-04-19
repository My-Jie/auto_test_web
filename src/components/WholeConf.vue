<template>
    <el-tabs v-model="activeName" :tab-position="'left'">
        <el-tab-pane label="环境列表" name="host">
            <!-- 增加操作 -->
            <el-button v-if="confInfo.host.length <= 0" :icon="Plus" type="warning" size="small"
                @click="addConf('host')"></el-button>
            <el-table :data="confInfo.host" stripe fit empty-text="空">
                <el-table-column label="环境" align="center" width="120px">
                    <template #default="scope">
                        <el-input v-model="scope.row.key" placeholder="名称" />
                    </template>
                </el-table-column>
                <el-table-column label="域名" align="center">
                    <template #default="scope">
                        <el-input v-model="scope.row.value" placeholder="url" />
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="180px">
                    <template #default="scope">
                        <!-- 增加操作 -->
                        <el-button :icon="Plus" type="warning" size="small" @click="addConf('host')"></el-button>
                        <!-- 删除操作 -->
                        <el-button :icon="Delete" type="danger" size="small"
                            @click="confDel(scope.row, 'host')"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>
        <el-tab-pane label="项目列表" name="project">
            <!-- 增加操作 -->
            <el-button v-if="confInfo.project.length <= 0" :icon="Plus" type="warning" size="small"
                @click="addConf('project')"></el-button>
            <el-table :data="confInfo.project" stripe fit empty-text="空">
                <el-table-column label="名称" align="center" width="120px">
                    <template #default="scope">
                        <el-input v-model="scope.row.key" placeholder="项目名称" />
                    </template>
                </el-table-column>
                <el-table-column label="编码" align="center">
                    <template #default="scope">
                        <el-input v-model="scope.row.value" placeholder="项目编码" />
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="180px">
                    <template #default="scope">
                        <!-- 增加操作 -->
                        <el-button :icon="Plus" type="warning" size="small" @click="addConf('project')"></el-button>
                        <!-- 删除操作 -->
                        <el-button :icon="Delete" type="danger" size="small"
                            @click="confDel(scope.row, 'project')"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>
        <el-tab-pane label="统一响应" name="unify_res">
            <!-- 增加操作 -->
            <el-button v-if="confInfo.unify_res.length <= 0" :icon="Plus" type="warning" size="small"
                @click="addConf('unify_res')"></el-button>
            <el-table :data="confInfo.unify_res" stripe fit empty-text="空">
                <el-table-column label="key" align="center" width="120px">
                    <template #default="scope">
                        <el-input v-model="scope.row.key" placeholder="键" />
                    </template>
                </el-table-column>
                <el-table-column label="value" align="center">
                    <template #default="scope">
                        <el-input v-model="scope.row.value" placeholder="值" />
                    </template>
                </el-table-column>
                <el-table-column label="type" align="center">
                    <template #default="scope">
                        <el-select v-model="scope.row.type" :placeholder="scope.row.type">
                            <el-option label="string" value='string' />
                            <el-option label="number" value='number' />
                            <el-option label="boolean" value='boolean' />
                            <el-option label="null" value='null' />
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="180px">
                    <template #default="scope">
                        <!-- 增加操作 -->
                        <el-button :icon="Plus" type="warning" size="small" @click="addConf('unify_res')"></el-button>
                        <!-- 删除操作 -->
                        <el-button :icon="Delete" type="danger" size="small"
                            @click="confDel(scope.row, 'unify_res')"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>
        <el-tab-pane label="数据库配置" name="db_conf">
            <el-form :model="confInfo.db_conf">
                <el-form-item label="host" label-width="100px">
                    <el-input v-model="confInfo.db_conf.host" />
                </el-form-item>
                <el-form-item label="user" label-width="100px">
                    <el-input v-model="confInfo.db_conf.user" />
                </el-form-item>
                <el-form-item label="password" label-width="100px">
                    <el-input v-model="confInfo.db_conf.password" />
                </el-form-item>
                <el-form-item label="database" label-width="100px">
                    <el-input v-model="confInfo.db_conf.database" />
                </el-form-item>
                <el-form-item label="port" label-width="100px">
                    <el-input v-model="confInfo.db_conf.port" />
                </el-form-item>
                <el-form-item label="charset" label-width="100px">
                    <el-input v-model="confInfo.db_conf.charset" />
                </el-form-item>
            </el-form>
        </el-tab-pane>
    </el-tabs>
</template>

<script>
import { Edit, Check, Plus, Delete, Close } from '@element-plus/icons-vue'

export default {
    name: "MyWholeConf",
    props: {
        'confInfo': Object
    },
    data() {
        return {
            Edit,
            Check,
            Plus,
            Delete,
            Close,
            activeName: 'host'
        }
    },
    methods: {
        // 新增配置
        addConf(myType) {
            if (myType == 'host') {
                this.confInfo.host.push({
                    key: null,
                    value: null,
                    num: this.confInfo.host.length
                })
                return
            }
            if (myType == 'project') {
                this.confInfo.project.push({
                    key: null,
                    value: null,
                    num: this.confInfo.project.length
                })
                return
            }
            if (myType == 'unify_res') {
                this.confInfo.unify_res.push({
                    key: null,
                    value: null,
                    type: 'number',
                    num: this.confInfo.unify_res.length
                })
                return
            }
        },
        confDel(row, myType) {
            var num = 0
            if (myType == 'host') {
                for (var x in this.confInfo.host) {
                    if (this.confInfo.host[x].num == row.num) {
                        this.confInfo.host.splice(num, 1)
                    }
                    num++
                }
                return
            }
            if (myType == 'project') {
                for (var x in this.confInfo.project) {
                    if (this.confInfo.project[x].num == row.num) {
                        this.confInfo.project.splice(num, 1)
                    }
                    num++
                }
                return
            }
            if (myType == 'unify_res') {
                for (var x in this.confInfo.unify_res) {
                    if (this.confInfo.unify_res[x].num == row.num) {
                        this.confInfo.unify_res.splice(num, 1)
                    }
                    num++
                }
                return
            }
        }
    }
}
</script>

