<template>
    <el-tabs v-model="activeName" :tab-position="'top'" type="border-card" @tab-click="handleTabClick">
        <el-tab-pane label="系统列表" name="project">
            <!-- 增加操作 -->
            <el-button v-if="project.length <= 0" :icon="Plus" type="warning" size="small"
                @click="addConf('project')"></el-button>
            <el-table :data="project" stripe fit empty-text="空">
                <el-table-column label="名称" align="center" width="150px">
                    <template #default="scope">
                        <el-input v-model="scope.row.name" placeholder="系统名称" />
                    </template>
                </el-table-column>
                <el-table-column label="编码" align="center">
                    <template #default="scope">
                        <el-input v-model="scope.row.code" placeholder="系统编码" />
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="180px">
                    <template #default="scope">
                        <!-- 编辑操作 -->
                        <el-button :icon="Edit" type="primary" size="small"
                            v-if="!scope.row.edit && !scope.row.EditDisabled" :disabled="scope.row.EditDisabled"
                            @click="myEdit(scope.row)"></el-button>
                        <el-button :icon="Check" type="success" size="small" v-if="scope.row.edit"
                            @click="projectCheck(scope.row)"></el-button>
                        <el-button :icon="Close" type="success" size="small" v-if="scope.row.EditDisabled"
                            @click="myClose(scope.row)"></el-button>
                        <!-- 增加操作 -->
                        <el-button :icon="Plus" type="warning" size="small" @click="addConf('project')"></el-button>
                        <!-- 删除操作 -->
                        <el-button :icon="Delete" type="danger" size="small" v-if="!scope.row.del && !scope.row.delDisabled"
                            :disabled="scope.row.delDisabled" @click="myDel(scope.row)"></el-button>
                        <el-button :icon="Check" type="success" size="small" v-if="scope.row.del"
                            @click="projectDel(scope.row)"></el-button>
                        <el-button :icon="Close" type="success" size="small" v-if="scope.row.delDisabled"
                            @click="myClose(scope.row)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>

        <el-tab-pane label="域名列表" name="host">
            <!-- 增加操作 -->
            <el-button v-if="host.length <= 0" :icon="Plus" type="warning" size="small"
                @click="addConf('host')"></el-button>
            <el-table :data="host" stripe fit empty-text="空">
                <el-table-column label="名称" align="center" width="150px">
                    <template #default="scope">
                        <el-input v-model="scope.row.name" placeholder="谷歌" />
                    </template>
                </el-table-column>
                <el-table-column label="域名" align="center">
                    <template #default="scope">
                        <el-input v-model="scope.row.host" placeholder="http://www.google.com" />
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="180px">
                    <template #default="scope">
                        <!-- 编辑操作 -->
                        <el-button :icon="Edit" type="primary" size="small"
                            v-if="!scope.row.edit && !scope.row.EditDisabled" :disabled="scope.row.EditDisabled"
                            @click="myEdit(scope.row)"></el-button>
                        <el-button :icon="Check" type="success" size="small" v-if="scope.row.edit"
                            @click="hostCheck(scope.row)"></el-button>
                        <el-button :icon="Close" type="success" size="small" v-if="scope.row.EditDisabled"
                            @click="myClose(scope.row)"></el-button>
                        <!-- 增加操作 -->
                        <el-button :icon="Plus" type="warning" size="small" @click="addConf('host')"></el-button>
                        <!-- 删除操作 -->
                        <el-button :icon="Delete" type="danger" size="small" v-if="!scope.row.del && !scope.row.delDisabled"
                            :disabled="scope.row.delDisabled" @click="myDel(scope.row)"></el-button>
                        <el-button :icon="Check" type="success" size="small" v-if="scope.row.del"
                            @click="hostDel(scope.row)"></el-button>
                        <el-button :icon="Close" type="success" size="small" v-if="scope.row.delDisabled"
                            @click="myClose(scope.row)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>



        <el-tab-pane label="自定参数" name="customize">
            <!-- 增加操作 -->
            <el-button v-if="customize.length <= 0" :icon="Plus" type="warning" size="small"
                @click="addConf('customize')"></el-button>
            <el-table :data="customize" stripe fit empty-text="空">
                <el-table-column label="名称" align="center" width="150px">
                    <template #default="scope">
                        <el-input v-model="scope.row.name" placeholder="名称" />
                    </template>
                </el-table-column>
                <el-table-column label="key" align="center">
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
                            <el-option label="int" value='int' />
                            <el-option label="float" value='float' />
                            <el-option label="boolean" value='boolean' />
                            <el-option label="null" value='null' />
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="180px">
                    <template #default="scope">
                        <!-- 编辑操作 -->
                        <el-button :icon="Edit" type="primary" size="small"
                            v-if="!scope.row.edit && !scope.row.EditDisabled" :disabled="scope.row.EditDisabled"
                            @click="myEdit(scope.row)"></el-button>
                        <el-button :icon="Check" type="success" size="small" v-if="scope.row.edit"
                            @click="customizeCheck(scope.row)"></el-button>
                        <el-button :icon="Close" type="success" size="small" v-if="scope.row.EditDisabled"
                            @click="myClose(scope.row)"></el-button>
                        <!-- 增加操作 -->
                        <el-button :icon="Plus" type="warning" size="small" @click="addConf('customize')"></el-button>
                        <!-- 删除操作 -->
                        <el-button :icon="Delete" type="danger" size="small" v-if="!scope.row.del && !scope.row.delDisabled"
                            :disabled="scope.row.delDisabled" @click="myDel(scope.row)"></el-button>
                        <el-button :icon="Check" type="success" size="small" v-if="scope.row.del"
                            @click="customizeDel(scope.row)"></el-button>
                        <el-button :icon="Close" type="success" size="small" v-if="scope.row.delDisabled"
                            @click="myClose(scope.row)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>

        <el-tab-pane label="数据库表" name="db">
            <el-button v-if="db.length <= 0" :icon="Plus" type="warning" size="small" @click="addConf('db')"></el-button>
            <el-table :data="db" stripe fit empty-text="空">
                <el-table-column label="名称" align="center" width="150px">
                    <template #default="scope">
                        <el-input v-model="scope.row.name" placeholder="名称" />
                    </template>
                </el-table-column>
                <el-table-column label="host" align="center" width="150px">
                    <template #default="scope">
                        <el-input v-model="scope.row.host" placeholder="127.0.0.1" />
                    </template>
                </el-table-column>
                <el-table-column label="user" align="center" width="120px">
                    <template #default="scope">
                        <el-input v-model="scope.row.user" placeholder="root" />
                    </template>
                </el-table-column>
                <el-table-column label="password" align="center" width="120px">
                    <template #default="scope">
                        <el-input v-model="scope.row.password" placeholder="123456" />
                    </template>
                </el-table-column>
                <el-table-column label="database" align="center" width="120px">
                    <template #default="scope">
                        <el-input v-model="scope.row.database" placeholder="test_db" />
                    </template>
                </el-table-column>
                <el-table-column label="port" align="center" width="120px">
                    <template #default="scope">
                        <el-input v-model="scope.row.port" placeholder="3306" />
                    </template>
                </el-table-column>
                <el-table-column label="charset" align="center" width="120px">
                    <template #default="scope">
                        <el-input v-model="scope.row.charset" placeholder="utf-8" />
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="180px" fixed="right">
                    <template #default="scope">
                        <!-- 编辑操作 -->
                        <el-button :icon="Edit" type="primary" size="small"
                            v-if="!scope.row.edit && !scope.row.EditDisabled" :disabled="scope.row.EditDisabled"
                            @click="myEdit(scope.row)"></el-button>
                        <el-button :icon="Check" type="success" size="small" v-if="scope.row.edit"
                            @click="dbCheck(scope.row)"></el-button>
                        <el-button :icon="Close" type="success" size="small" v-if="scope.row.EditDisabled"
                            @click="myClose(scope.row)"></el-button>
                        <!-- 增加操作 -->
                        <el-button :icon="Plus" type="warning" size="small" @click="addConf('db')"></el-button>
                        <!-- 删除操作 -->
                        <el-button :icon="Delete" type="danger" size="small" v-if="!scope.row.del && !scope.row.delDisabled"
                            :disabled="scope.row.delDisabled" @click="myDel(scope.row)"></el-button>
                        <el-button :icon="Check" type="success" size="small" v-if="scope.row.del"
                            @click="dbDel(scope.row)"></el-button>
                        <el-button :icon="Close" type="success" size="small" v-if="scope.row.delDisabled"
                            @click="myClose(scope.row)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>

        <el-tab-pane label="统一响应" name="unify_res">
            <!-- 增加操作 -->
            <el-button v-if="unify_res.length <= 0" :icon="Plus" type="warning" size="small"
                @click="addConf('unify')"></el-button>
            <el-table :data="unify_res" stripe fit empty-text="空">
                <el-table-column label="名称" align="center" width="150px">
                    <template #default="scope">
                        <el-input v-model="scope.row.name" placeholder="名称" />
                    </template>
                </el-table-column>
                <el-table-column label="key" align="center">
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
                            <el-option label="int" value='int' />
                            <el-option label="float" value='float' />
                            <el-option label="boolean" value='boolean' />
                            <el-option label="null" value='null' />
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="180px">
                    <template #default="scope">
                        <!-- 编辑操作 -->
                        <el-button :icon="Edit" type="primary" size="small"
                            v-if="!scope.row.edit && !scope.row.EditDisabled" :disabled="scope.row.EditDisabled"
                            @click="myEdit(scope.row)"></el-button>
                        <el-button :icon="Check" type="success" size="small" v-if="scope.row.edit"
                            @click="unifyCheck(scope.row)"></el-button>
                        <el-button :icon="Close" type="success" size="small" v-if="scope.row.EditDisabled"
                            @click="myClose(scope.row)"></el-button>
                        <!-- 增加操作 -->
                        <el-button :icon="Plus" type="warning" size="small" @click="addConf('unify')"></el-button>
                        <!-- 删除操作 -->
                        <el-button :icon="Delete" type="danger" size="small" v-if="!scope.row.del && !scope.row.delDisabled"
                            :disabled="scope.row.delDisabled" @click="myDel(scope.row)"></el-button>
                        <el-button :icon="Check" type="success" size="small" v-if="scope.row.del"
                            @click="unifyDel(scope.row)"></el-button>
                        <el-button :icon="Close" type="success" size="small" v-if="scope.row.delDisabled"
                            @click="myClose(scope.row)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>

    </el-tabs>
</template>

<script>
import { Edit, Check, Plus, Delete, Close } from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'
export default {
    name: "MyWholeConf",
    data() {
        return {
            Edit,
            Check,
            Plus,
            Delete,
            Close,
            activeName: 'project',
            tabName: { props: { name: 'project' } },
            host: [],
            project: [],
            db: [],
            unify_res: [],
            customize: [],
        }
    },
    mounted() {
        this.handleTabClick(this.tabName)
    },

    methods: {
        // 切换tab触发
        async handleTabClick(tab) {
            this.tabName.props.name = tab.props.name
            switch (tab.props.name) {
                case 'host':
                    var host = []
                    await this.$http({
                        url: '/conf/get/host',
                        method: 'GET',
                    }).then(
                        function (response) {
                            host = response.data
                            for (var x in host) {
                                host[x].edit = false
                                host[x].del = false
                                host[x].delDisabled = false
                                host[x].EditDisabled = false
                            }
                        }
                    ).catch(
                        function (error) {
                            ElMessage.error(error.message)
                        }
                    )
                    this.host = host
                    break
                case 'project':
                    var project = []
                    await this.$http({
                        url: '/conf/get/project',
                        method: 'GET',
                    }).then(
                        function (response) {
                            project = response.data
                            for (var x in project) {
                                project[x].edit = false
                                project[x].del = false
                                project[x].delDisabled = false
                                project[x].EditDisabled = false
                            }
                        }
                    ).catch(
                        function (error) {
                            ElMessage.error(error.message)
                        }
                    )
                    this.project = project
                    break

                case 'db':
                    var db = []
                    await this.$http({
                        url: '/conf/get/db',
                        method: 'GET',
                    }).then(
                        function (response) {
                            db = response.data
                            for (var x in db) {
                                db[x].edit = false
                                db[x].del = false
                                db[x].delDisabled = false
                                db[x].EditDisabled = false
                            }
                        }
                    ).catch(
                        function (error) {
                            ElMessage.error(error.message)
                        }
                    )
                    this.db = db
                    break

                case 'unify_res':
                    var unify_res = []
                    await this.$http({
                        url: '/conf/get/unify',
                        method: 'GET',
                    }).then(
                        function (response) {
                            unify_res = response.data
                            for (var x in unify_res) {
                                unify_res[x].edit = false
                                unify_res[x].del = false
                                unify_res[x].delDisabled = false
                                unify_res[x].EditDisabled = false
                            }
                        }
                    ).catch(
                        function (error) {
                            ElMessage.error(error.message)
                        }
                    )
                    this.unify_res = unify_res
                    break

                case 'customize':
                    var customize = []
                    await this.$http({
                        url: '/conf/get/customize',
                        method: 'GET',
                    }).then(
                        function (response) {
                            customize = response.data
                            for (var x in customize) {
                                customize[x].edit = false
                                customize[x].del = false
                                customize[x].delDisabled = false
                                customize[x].EditDisabled = false
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
        // 项目的提交
        async projectCheck(row) {
            if (row.add) {
                await this.$http({
                    url: '/conf/add/project',
                    method: 'POST',
                    data: JSON.stringify({
                        name: row.name,
                        code: row.code
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
            } else {
                await this.$http({
                    url: '/conf/update/project',
                    method: 'PUT',
                    params: {
                        project_id: row.id
                    },
                    data: JSON.stringify({
                        name: row.name,
                        code: row.code
                    }),
                    headers: {
                        'content-type': "application/json"
                    }
                }).then(
                    function () {
                        ElNotification.success({
                            title: 'Success',
                            message: '修改成功',
                        })
                        row.edit = false
                        row.delDisabled = false
                    }
                ).catch(
                    function (error) {
                        ElMessage.error(error.message)
                    }
                )
            }
            this.handleTabClick(this.tabName)
        },
        // 域名的提交
        async hostCheck(row) {
            if (row.add) {
                await this.$http({
                    url: '/conf/add/host',
                    method: 'POST',
                    data: JSON.stringify({
                        name: row.name,
                        host: row.host
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
            } else {
                await this.$http({
                    url: '/conf/update/host',
                    method: 'PUT',
                    params: {
                        host_id: row.id
                    },
                    data: JSON.stringify({
                        name: row.name,
                        host: row.host
                    }),
                    headers: {
                        'content-type': "application/json"
                    }
                }).then(
                    function () {
                        ElNotification.success({
                            title: 'Success',
                            message: '修改成功',
                        })
                        row.edit = false
                        row.delDisabled = false
                    }
                ).catch(
                    function (error) {
                        ElMessage.error(error.message)
                    }
                )
            }
            this.handleTabClick(this.tabName)
        },
        // 统一响应的提交
        async unifyCheck(row) {
            if (row.add) {
                await this.$http({
                    url: '/conf/add/unify',
                    method: 'POST',
                    data: JSON.stringify({
                        name: row.name,
                        key: row.key,
                        type: row.type,
                        value: row.value
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
            } else {
                await this.$http({
                    url: '/conf/update/unify',
                    method: 'PUT',
                    params: {
                        unify_res_id: row.id
                    },
                    data: JSON.stringify({
                        name: row.name,
                        key: row.key,
                        type: row.type,
                        value: row.value
                    }),
                    headers: {
                        'content-type': "application/json"
                    }
                }).then(
                    function () {
                        ElNotification.success({
                            title: 'Success',
                            message: '修改成功',
                        })
                        row.edit = false
                        row.delDisabled = false
                    }
                ).catch(
                    function (error) {
                        ElMessage.error(error.message)
                    }
                )
            }
            this.handleTabClick(this.tabName)
        },
        // 自定义内容的提交
        async customizeCheck(row) {
            if (row.add) {
                await this.$http({
                    url: '/conf/add/customize',
                    method: 'POST',
                    data: JSON.stringify({
                        name: row.name,
                        key: row.key,
                        type: row.type,
                        value: row.value
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
            } else {
                await this.$http({
                    url: '/conf/update/customize',
                    method: 'PUT',
                    params: {
                        customize_id: row.id
                    },
                    data: JSON.stringify({
                        name: row.name,
                        key: row.key,
                        type: row.type,
                        value: row.value
                    }),
                    headers: {
                        'content-type': "application/json"
                    }
                }).then(
                    function () {
                        ElNotification.success({
                            title: 'Success',
                            message: '修改成功',
                        })
                        row.edit = false
                        row.delDisabled = false
                    }
                ).catch(
                    function (error) {
                        ElMessage.error(error.message)
                    }
                )
            }
            this.handleTabClick(this.tabName)
        },
        // 数据库内容的提交
        async dbCheck(row) {
            if (row.add) {
                await this.$http({
                    url: '/conf/add/db',
                    method: 'POST',
                    data: JSON.stringify({
                        name: row.name,
                        host: row.host,
                        user: row.user,
                        password: row.password,
                        database: row.database,
                        port: row.port,
                        charset: row.charset
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
            } else {
                await this.$http({
                    url: '/conf/update/db',
                    method: 'PUT',
                    params: {
                        db_id: row.id
                    },
                    data: JSON.stringify({
                        name: row.name,
                        host: row.host,
                        user: row.user,
                        password: row.password,
                        database: row.database,
                        port: row.port,
                        charset: row.charset
                    }),
                    headers: {
                        'content-type': "application/json"
                    }
                }).then(
                    function () {
                        ElNotification.success({
                            title: 'Success',
                            message: '修改成功',
                        })
                        row.edit = false
                        row.delDisabled = false
                    }
                ).catch(
                    function (error) {
                        ElMessage.error(error.message)
                    }
                )
            }
            this.handleTabClick(this.tabName)
        },

        // 项目内容的删除
        async projectDel(row) {
            await this.$http({
                url: '/conf/del/project',
                method: 'DELETE',
                params: {
                    project_id: row.id
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

            this.handleTabClick(this.tabName)
        },
        // 域名内容的删除
        async hostDel(row) {
            await this.$http({
                url: '/conf/del/host',
                method: 'DELETE',
                params: {
                    host_id: row.id
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

            this.handleTabClick(this.tabName)
        },
        // 统一响应内容的删除
        async unifyDel(row) {
            await this.$http({
                url: '/conf/del/unify',
                method: 'DELETE',
                params: {
                    unify_res_id: row.id
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

            this.handleTabClick(this.tabName)
        },
        // 自定义内容的删除
        async customizeDel(row) {
            await this.$http({
                url: '/conf/del/customize',
                method: 'DELETE',
                params: {
                    customize_id: row.id
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

            this.handleTabClick(this.tabName)
        },
        // 数据集内容的删除
        async dbDel(row) {
            await this.$http({
                url: '/conf/del/db',
                method: 'DELETE',
                params: {
                    db_id: row.id
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

            this.handleTabClick(this.tabName)
        },

        // 编辑的判断
        myEdit(row) {
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


        // 新增配置
        addConf(myType) {
            if (myType == 'host') {
                this.host.push({
                    name: null,
                    host: null,

                    edit: true,
                    delDisabled: true,
                    add: true
                })
                return
            }
            if (myType == 'project') {
                this.project.push({
                    name: null,
                    code: null,

                    edit: true,
                    delDisabled: true,
                    add: true
                })
                return
            }
            if (myType == 'unify') {
                this.unify_res.push({
                    name: null,
                    key: null,
                    type: 'string',
                    value: '',

                    edit: true,
                    delDisabled: true,
                    add: true
                })
                return
            }
            if (myType == 'customize') {
                this.customize.push({
                    name: null,
                    key: null,
                    type: 'string',
                    value: '',

                    edit: true,
                    delDisabled: true,
                    add: true
                })
                return
            }
            if (myType == 'db') {
                this.db.push({
                    name: null,
                    host: null,
                    user: null,
                    password: null,
                    database: null,
                    port: 3306,
                    charset: 'utf-8',

                    edit: true,
                    delDisabled: true,
                    add: true
                })
                return
            }
        }
    }
}
</script>
