<template>
    <div>
        <!-- 模板列表 -->
        <el-table v-loading='loading' :data="tempInfo" stripe fit>
            <el-table-column label="TempId" prop="id" type="index" :index="indexMethod" width="100%"
                align="center"></el-table-column>
            <el-table-column label="" width="40" align="center">
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
            <el-table-column label="项目名称" prop="project_name" align="center"></el-table-column>
            <el-table-column label="API数量" prop="api_count" align="center"></el-table-column>
            <el-table-column label="关联用例-Id" prop="case_info" :formatter="formatterData" align="center"></el-table-column>
            <el-table-column label="创建时间" prop="created_at" align="center"></el-table-column>
            <el-table-column label="修改时间" prop="updated_at" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
                <template #default="scope">
                    <el-button type="success" plain :loading="scope.row.runLoading"
                        @click="setDialogVisible(scope.row)">运行</el-button>&nbsp;
                    <el-button-group class="ml-4">
                        <el-button type="primary" plain @click="getTempData(scope.row)"
                            :loading="scope.row.dataLoading">详情</el-button>
                        <el-button type="primary" plain @click="tempToCase(scope.row)"
                            :loading="scope.row.tempToCaseLoading">转化</el-button>
                    </el-button-group>
                </template>
            </el-table-column>
        </el-table>

        <!-- 详情弹窗 -->
        <el-dialog v-model='myDialog' width="90%" :title="tempTitle">
            <temp-data :temp-data="thisTempData"></temp-data>
        </el-dialog>
        <!-- 运行用例弹窗 -->
        <el-dialog v-model="dialogVisible" title="Tips" width="30%">
            <span>模板 [ {{ tempId }} - {{ tempName }} ] 包含以下用例</span>
            <br>
            <el-table :data="thisCaseInfo">
                <el-table-column label="CaseId" prop="case_id" width="100%" align="center"></el-table-column>
                <el-table-column label="CaseName" prop="case_name" align="center"></el-table-column>
            </el-table>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="runCase(tempRow)">确认</el-button>
                </span>
            </template>
        </el-dialog>
        <!-- 转化为用例的弹窗 -->
        <el-dialog v-model='dialogTempToCase' width="50%" :title="tempToCaseTitle" @close='closeDialog'>
            <el-radio-group v-model="radioTempToCase">
                <el-radio-button :label='true'>新增</el-radio-button>
                <el-radio-button :label='false'>覆盖</el-radio-button>
                <el-radio-button :label='null'>下载预处理数据后的测试用例</el-radio-button>
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
import { Edit, Check } from '@element-plus/icons-vue'
export default {
    name: "MyTempInfo",

    components: {
        TempData,
    },

    props: {
        'tempInfo': Array
    },

    data() {
        return {
            Edit,
            Check,
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
        }
    },

    methods: {
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
                        offset: 200,
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
                        offset: 200,
                    })
                } else {
                    ElNotification.success({
                        title: 'Success',
                        message: '模板 [' + tempId + '] 覆盖用例 [' + response.data.data.case_id + '] 成功',
                        offset: 200,
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
                    dialog_ = true
                }
            ).catch(function (error) {
                row.dataLoading = false
                ElMessage.error(error.message)
            })
            this.myDialog = dialog_
            this.thisTempData = temp_
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
                offset: 200,
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
                            offset: 200,
                        })
                    }
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
                ElNotification.error({
                    title: 'Error',
                    message: '执行失败 模板ID: ' + row.id,
                    offset: 200,
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


<style>
.el-upload-demo {
    height: 220px;
    width: 100%;
    border: 1px dashed #DEDEDE;
    /* border-radius: 4px; */
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    border: 1px dashed #2260FF;
    font-size: 14px;
    margin-top: 30px;
    text-align: center;
    line-height: unset;
}
</style>