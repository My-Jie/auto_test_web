<template>
    <div>
        <el-input v-model="likeTempName" placeholder="按模板名称模糊查询" @keyup.enter.native="get_temp(page, size, likeTempName)">
            <template #prepend>模板名称</template>
            <template #append>
                <el-button plain @click="get_temp(page, size, likeTempName)">搜索</el-button>
            </template>
        </el-input>
        <br>
        <br>
        <!-- 模板列表 -->
        <el-table v-loading='loading' :data="tempInfo" stripe fit>
            <el-table-column label="TempId" prop="id" type="index" :index="indexMethod" width="100%"
                align="center"></el-table-column>
            <el-table-column label="系统名称" prop="project_name" align="center" width="100"></el-table-column>
            <el-table-column label="" width="55" align="center">
                <template #default="scope">
                    <el-button :icon="Edit" size="small" v-if="scope.row.edit" @click="scope.row.edit = false"></el-button>
                    <el-button :icon="Check" size="small" v-if="!scope.row.edit" @click="updateName(scope.row)"></el-button>
                </template>
            </el-table-column>
            <el-table-column label="模板名称" prop="temp_name" width="400px">
                <template #default="scope">
                    <div v-if="scope.row.temp_name && scope.row.edit">{{ scope.row.temp_name }}</div>
                    <el-input v-model="scope.row.temp_name" placeholder="可输入" v-if="scope.row.edit == false"
                        @keyup.enter.native="updateName(scope.row)"></el-input>
                </template>
            </el-table-column>

            <el-table-column label="API数量" prop="api_count" align="center"></el-table-column>
            <el-table-column label="关联用例-Id" prop="case_info" :formatter="formatterData" align="center"></el-table-column>
            <el-table-column label="创建时间" prop="created_at" align="center"></el-table-column>
            <el-table-column label="修改时间" prop="updated_at" align="center"></el-table-column>
            <el-table-column label="操作" align="center" width="220">
                <template #default="scope">
                    <el-tooltip content="运行用例，批量运行模板关联的所有用例" placement="top-end" effect="customized">
                        <el-button :icon="CircleCheck" type="success" plain :loading="scope.row.runLoading"
                            @click="setDialogVisible(scope.row)"></el-button>
                    </el-tooltip>

                    <el-button-group class="ml-4">
                        <el-tooltip content="模板详情，可编辑数据，调试接口" placement="top-end" effect="customized">
                            <el-button :icon="Edit" type="primary" plain @click="getTempData(scope.row)"
                                :loading="scope.row.dataLoading"></el-button>
                        </el-tooltip>

                        <el-tooltip content="转化为JSON下载，或系统内部直接转为用例，过程中会自动关联部分数据" placement="top-end" effect="customized">
                            <el-button :icon="DArrowRight" type="primary" plain @click="tempToCase(scope.row)"
                                :loading="scope.row.tempToCaseLoading"></el-button>
                        </el-tooltip>

                    </el-button-group>
                    <el-tooltip content="删除模板，会校验有无用例" placement="top-start" effect="customized">
                        <el-button :icon="Delete" type="danger" plain :loading="scope.row.delLoading"
                            @click="delDialogVisible(scope.row)" />
                    </el-tooltip>

                </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <br>
        <el-pagination background :page-sizes="[10, 20, 50, 80, 100]" layout="total, jumper, prev, pager, next, sizes"
            :total=tempTotal @size-change="handleSizeChange" @current-change="handleCurrentChange" />

        <!-- 详情弹窗 -->
        <el-dialog class="details" v-model='myDialog' width="90%" :title="tempTitle">
            <div class="el-dialog-div">
                <temp-data v-if="myDialog" :temp-data="thisTempData" :temp-id="tempId"></temp-data>
            </div>
        </el-dialog>
        <!-- 运行用例弹窗 -->
        <el-dialog class="confirm" v-model="dialogVisible" title="Tips" width="50%">
            <span>模板 [ {{ tempId }} - {{ tempName }} ] 包含以下用例</span>
            <br>
            <el-table :data="thisCaseInfo">
                <el-table-column label="CaseId" prop="case_id" width="100%" align="center"></el-table-column>
                <el-table-column label="CaseName" prop="case_name" align="center"></el-table-column>
            </el-table>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="success" @click="runCase(tempRow)">确认</el-button>
                </span>
            </template>
        </el-dialog>
        <!-- 删除的窗口 -->
        <el-dialog class="confirm" v-model="delDialog" title="Tips" width="50%">
            <span>删除模板 [ {{ tempId }} - {{ tempName }} ]</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="delDialog = false">取消</el-button>
                    <el-button type="danger" @click="delTemp(tempRow)">确认</el-button>
                </span>
            </template>
        </el-dialog>
        <!-- 转化为用例的弹窗 -->
        <el-dialog class="confirm" v-model='dialogTempToCase' width="50%" :title="tempToCaseTitle" @close='closeDialog'>
            <el-radio-group v-model="radioTempToCase">
                <el-radio-button :label='true'>新增</el-radio-button>
                <el-radio-button :label='false'>覆盖</el-radio-button>
                <el-radio-button :label='null'>JSON测试用例</el-radio-button>
            </el-radio-group>
            <br>
            <br>
            <!-- 新增 -->
            <el-input v-model="addCaseInput" placeholder="请输入用例名称" v-if="radioTempToCase == true">
                <template #prepend>用例名称</template>
            </el-input>

            <!-- 覆盖 -->
            <el-table :data="thisCaseInfo" v-if="radioTempToCase == false">
                <el-table-column label="CaseId" prop="case_id" width="100%" align="center"></el-table-column>
                <el-table-column label="CaseName" prop="case_name" align="center"></el-table-column>
                <el-table-column label="选择" align="center">
                    <template #default="scope">
                        <el-checkbox v-model=scope.row.checkbox @click.stop="checkboxClick(scope.row)" label="" />
                    </template>
                </el-table-column>
            </el-table>

            <!-- 主动停止 -->
            <br>
            <br>
            <el-radio-group v-model="activeStop">
                <el-radio-button :label='true'>失败停止</el-radio-button>
                <el-radio-button :label='false'>失败不停止</el-radio-button>
            </el-radio-group>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogTempToCase = false">取消</el-button>
                    <el-button type="primary" @click="postTempToCase" :loading="tempToCaseLoading"
                        v-if="radioTempToCase != null">确认</el-button>
                    <el-button type="primary" @click="tempDown" :loading="tempToCaseLoading"
                        v-if="radioTempToCase == null">下载</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import TempData from './TempData.vue'
import { ElNotification } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Edit, Check, DArrowRight, Document, Delete, CircleCheck } from '@element-plus/icons-vue'
export default {
    name: "MyTempInfo",

    components: {
        TempData,
    },

    props: {
        'tempInfo': Array,
        'tempTotal': Number,
    },

    inject: ["get_temp"],

    data() {
        return {
            Edit,
            Check,
            Delete,
            CircleCheck,
            Document,
            DArrowRight,
            loading: !this.tempInfo ? true : false,
            myDialog: false,
            uploadDialogBl: false,
            thisTempData: [],
            tempTitle: null,
            dialogVisible: false,
            dialogTempToCase: false,
            tempToCaseTitle: null,
            tempName: null,
            tempId: null,
            tempRow: null,
            thisCaseInfo: [],
            radioTempToCase: true,
            activeStop: true,
            addCaseInput: '',
            affTempToCaseId: 99999,
            tempToCaseLoading: false,
            delDialog: false,
            size: 10,
            page: 1,
            likeTempName: null
        }
    },

    methods: {
        // 调用父级方法
        async handleSizeChange(size) {
            this.size = size
            await this.get_temp(this.page, this.size, this.likeTempName)
        },
        async handleCurrentChange(page) {
            this.page = page
            await this.get_temp(this.page, this.size, this.likeTempName)
        },
        async updateName(row) {
            row.checkLoading = true
            await this.$http({
                url: '/template/name/edit',
                method: 'PUT',
                data: JSON.stringify({
                    temp_id: row.id,
                    new_name: row.temp_name
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
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            row.checkLoading = false
            row.edit = true
        },

        indexMethod(index) {
            return this.tempInfo[index]['id']
        },

        checkboxClick(row) {
            for (var x in this.thisCaseInfo) {
                if (this.thisCaseInfo[x]['checkbox'] != row.checkbox) {
                    this.thisCaseInfo[x]['checkbox'] = false
                }
            }
            this.affTempToCaseId = row.case_id
        },

        // 模板转用例
        async postTempToCase() {
            this.tempToCaseLoading = true
            var tempId = this.tempId
            await this.$http({
                url: '/caseService/temp/to/case',
                method: 'GET',
                params: {
                    temp_id: tempId,
                    case_id: this.affTempToCaseId,
                    case_name: this.addCaseInput,
                    cover: this.radioTempToCase,
                    fail_stop: this.activeStop
                }
            }).then(function (response) {
                if (response.data.message == '新增成功') {
                    ElNotification.success({
                        title: 'Success',
                        message: '模板 [' + tempId + '] 新增用例 [' + response.data.data.case_id + '] 成功',
                    })
                } else {
                    ElNotification.success({
                        title: 'Success',
                        message: '模板 [' + tempId + '] 覆盖用例 [' + response.data.data.case_id + '] 成功',
                    })
                }
            }).catch(function (error) {
                ElMessage.error(error.message)
            })
            this.tempToCaseLoading = false
            this.dialogTempToCase = false
        },
        // 下载预处理数据后的测试用例
        async tempDown() {
            this.tempToCaseLoading = true
            await this.$http({
                url: '/caseService/download/init/data/json',
                method: 'GET',
                params: {
                    temp_id: this.tempId,
                    mode: 'service',
                    fail_stop: this.activeStop
                },
                headers: {
                    responseType: 'blob'
                }
            }).then(
                function (response) {
                    var blob = new Blob([JSON.stringify(response.data, null, 2)])
                    var blobUrl = window.URL.createObjectURL(blob)

                    var a = document.createElement('a')
                    a.style.display = 'none'
                    a.download = response.data.temp_name + '.json' // 自定义下载的文件名
                    a.href = blobUrl
                    document.body.appendChild(a)
                    a.click()
                }
            )
            this.tempToCaseLoading = false
            this.dialogTempToCase = false
        },

        // 清理替换窗口的数据
        closeDialog() {
            this.thisCaseInfo = []
            this.addCaseInput = ''
            this.radioTempToCase = true
            this.activeStop = true
        },
        // 删除窗口
        delDialogVisible(row) {
            this.delDialog = true
            this.tempName = row.temp_name
            this.tempId = row.id
            this.tempRow = row
        },
        // 删除模板
        async delTemp(row) {
            var flag = false
            row.delLoading = true
            await this.$http({
                url: '/template/del/all/' + row.id,
                method: 'DELETE',
            }).then(
                function () {
                    ElNotification.success({
                        title: 'Success',
                        message: '模板[ ' + row.temp_name + ' ] 删除成功',
                    })
                    flag = true
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
            })

            if (flag) {
                for (var x in this.tempInfo) {
                    if (this.tempInfo[x].id == row.id) {
                        this.tempInfo.splice(x, 1)
                        break
                    }
                }
            }

            row.delLoading = false
            this.delDialog = false
        },
        // 运行的窗口
        setDialogVisible(row) {
            this.dialogVisible = true
            this.tempName = row.temp_name
            this.tempId = row.id
            this.tempRow = row
            this.thisCaseInfo = []
            for (var x in row.case_info) {
                this.thisCaseInfo.push({ 'case_id': row.case_info[x]['id'], 'case_name': row.case_info[x]['name'], 'checkbox': false })
            }
        },
        // 模板详情数据
        async getTempData(row) {
            this.tempTitle = row.temp_name
            row.dataLoading = true
            var temp_ = []
            var dialog_ = false
            await this.$http.get('/template/data/list?temp_id=' + row.id).then(
                function (response) {
                    row.dataLoading = false
                    temp_ = response.data
                    for (var x in temp_) {
                        temp_[x].edit = false
                        temp_[x].EditDisabled = false
                        temp_[x].del = false
                        temp_[x].delDisabled = false
                        temp_[x].delLoading = false
                        temp_[x].checkLoading = false
                    }
                    dialog_ = true
                }
            ).catch(function (error) {
                row.dataLoading = false
                ElMessage.error(error.message)
            })
            this.myDialog = dialog_
            this.thisTempData = temp_
            this.tempId = row.id
        },

        // 模板转用例
        tempToCase(row) {
            this.dialogTempToCase = true
            this.tempToCaseTitle = '模板 [' + row.id + '-' + row.temp_name + '] 转换用例'
            this.thisCaseInfo = []
            for (var x in row.case_info) {
                this.thisCaseInfo.push({ 'case_id': row.case_info[x]['id'], 'case_name': row.case_info[x]['name'] })
            }
            this.tempId = row.id
        },


        // 按模板运行数据
        async runCase(row) {
            this.dialogVisible = false
            row.runLoading = true
            ElNotification.success({
                title: 'Success',
                message: '开始执行 模板ID: ' + row.id,
            })
            await this.$http.post('/runCase/temp', [row.id]).then(
                function (response) {
                    row.runLoading = false
                    if (response.data.code == 0) {
                        var msg = ''
                        for (var x in response.data.data.allure_report) {
                            msg += '<a href="' + response.data.data.allure_report[x].report + '/index.html" target="_blank">查看用例[' + x + ']的报告</a><br>'
                        }
                        ElNotification({
                            title: '测试报告',
                            message: msg,
                            duration: 0,
                            type: 'success',
                            position: 'bottom-right',
                            dangerouslyUseHTMLString: true,
                        })
                    } else {
                        ElNotification.error({
                            title: 'Error',
                            message: '模板\n[ ' + row.id + '-' + row.temp_name + ' ] 执行失败',
                        })
                    }
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
                ElNotification.error({
                    title: 'Error',
                    message: '执行失败 模板ID: ' + row.id,
                })
                row.runLoading = false
            })
        },

        uploadDialog() {
            this.uploadDialogBl = true
        },

        formatterData(row) {
            var arrCaseId = []
            for (var x in row.case_info) {
                arrCaseId.push(row.case_info[x]['id'])
            }
            return arrCaseId.join()
        },

        getTime(row, column, cellValue, index) {
            return this.dataFilter(cellValue)
        }
    }
}
</script>


<style scoped>
.el-dialog-div {
    height: 65vh;
    overflow: auto;
}
</style>