<template>
    <div>
        <el-table v-loading='loading' :data="caseInfo" row-key="case_id" stripe fit>
            <el-table-column label="CaseId" prop="case_id" type="index" :index="indexMethod" width="100%"
                align="center"></el-table-column>
            <el-table-column label="" width="40" align="center">
                <template #default="scope">
                    <el-button :icon="Edit" size="small" v-if="scope.row.edit" @click="scope.row.edit = false"></el-button>
                    <el-button :icon="Check" size="small" v-if="!scope.row.edit" @click="updateName(scope.row)"></el-button>
                </template>
            </el-table-column>
            <el-table-column label="用例名称" prop="name" width="500px">
                <template #default="scope">
                    <div v-if="scope.row.name && scope.row.edit">{{ scope.row.temp_name }}-{{ scope.row.case_name }}</div>
                    <el-input v-model="scope.row.case_name" placeholder="可输入" v-if="scope.row.edit == false"></el-input>
                </template>
            </el-table-column>
            <el-table-column label="API数量" prop="api_count" width="100%" align="center"></el-table-column>
            <el-table-column label="运行次数" prop="run_order" align="center"></el-table-column>
            <el-table-column label="创建时间" prop="created_at" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
                <template #default="scope">
                    <el-button type="success" plain :loading="scope.row.runLoading" @click="setDialogVisible(scope.row)">运行
                    </el-button>&nbsp;
                    <el-button-group class="ml-4">
                        <el-button type="primary" plain @click="getCaseData(scope.row)"
                            :loading="scope.row.dataLoading">详情</el-button>
                        <el-button type="primary" plain @click="replaceData(scope.row)">提取</el-button>
                        <el-button type="primary" plain @click="copyDialogVisible(scope.row)"
                            :loading="scope.row.copyLoading">复制</el-button>
                    </el-button-group>&nbsp;
                    <el-button type="Info" plain>
                        <el-link :href="scope.row.allureReport" target="_blank" :underline="false">报告</el-link>
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 详情弹窗 -->
        <el-dialog v-model='myDialog' width="90%" :title="caseId + ' ' + dataTitle">
            <case-data :case-data="thisCaseData" :case-id="caseId"></case-data>
        </el-dialog>
        <!-- 运行用例弹窗 -->
        <el-dialog v-model="dialogVisible" title="Tips" width="30%">
            <span>执行用例 [ {{ caseId }} - {{ caseName }} ]</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="runCase(caseRow)">确认</el-button>
                </span>
            </template>
        </el-dialog>
        <!-- 复制用例弹窗 -->
        <el-dialog v-model="setCopyDialogVisible" title="Tips" width="30%">
            <span>复制用例 [ {{ caseId }} - {{ caseName }} ]</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="setCopyDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="copyCase(caseRow)">确认</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 替换数据弹窗 -->
        <el-dialog v-model='repData' width="70%" :close-on-click-modal=false :close-on-press-escape=false
            :title="caseId + ' ' + dataTitle + '      --从response中提取jsonpath路径, 替换测试数据'" @close='closeDialog'>

            <!-- 原始数据查询 -->
            <el-form-item :inline="true">
                <el-input v-model="responseValueInput" placeholder="请输入需要查找的原始数据" clearable minlength="3">
                    <template #prepend>
                        <el-select v-model="selectResponse" placeholder="请选择数据源">
                            <el-option label="从Response中的value字段" value="value" />
                            <el-option label="从Response中的key字段" value="key" />
                        </el-select>
                        <div v-show="selectResponse == 'value'">
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <el-select v-model="select" placeholder="==" style="width: 80px">
                                <el-option label="==" value="==" />
                                <el-option label="in" value="in" />
                            </el-select>
                        </div>
                    </template>
                    <template #append>
                        <el-button plain @click="getResponseJsonPath">查询</el-button>
                    </template>
                </el-input>
            </el-form-item>
            <!-- 选择jsonpath数据 -->
            <el-table :data="responseValueJsonpath" stripe fit v-show="responseValueJsonpath.length > 0">
                <el-table-column type="index"></el-table-column>
                <el-table-column label="用例序号.$.取值表达式" prop="jsonpath"></el-table-column>
                <el-table-column label="选择[建议第一条]" width="200px" align="center">
                    <template #default="scope">
                        <el-checkbox v-model=scope.row.checkbox @click.stop="checkboxClick(scope.row)" label="" />
                    </template>
                </el-table-column>
            </el-table>
            <br>
            <!-- 被替换数据的查询预览 -->
            <el-form-item :inline="true">
                <el-input v-model="fixedResponseValueJsonpath" placeholder="准备替换的数据" clearable minlength="3">
                    <template #prepend>预选表达式</template>
                    <template #append>
                        <el-button @click="getTestDataJsonpath">
                            使用[ {{ selectResponse }} ]->[ {{ responseValueInput }} ]从测试数据的 url.params.data 预览查询
                        </el-button>
                    </template>
                </el-input>
            </el-form-item>
            <div class="demo-collapse">
                <el-collapse v-model="activeName" accordion>
                    <el-collapse-item title="JsonPath表达式实例(*双花括号)" name="1">
                        <p>1.直接提取: {number.$.jsonPath表达式}</p>
                        <p>2.索引切片: {number.$.jsonPath表达式}|index:index</p>
                        <p>3.同级邻居确认: {number.$.jsonPath表达式},string in key,string == key</p>
                    </el-collapse-item>
                    <el-collapse-item title="假数据表达式(*单花括号)" name="2">
                        <p>1.身份证: {ssn}</p>
                        <p>2.电话: {phone_number}</p>
                        <p>3.银行卡: {credit_card_number}</p>
                        <p>4.城市: {city}</p>
                        <p>5.地址: {address}</p>
                        <p>6.随机数字: {random_int.1} number为长度</p>
                        <p>7.随机小写字母: {random_lower.1} number为长度</p>
                        <p>8.随机大写字母: {random_upper.1} number为长度</p>
                        <p>9.随机大小写字母: {random_letter.1} number为长度</p>
                        <p>10.随机汉字: {random_cn.1} number为长度</p>
                        <p>11.数字计算: {compute}</p>
                        <p>12.时间戳: {time_int.0} 0:当前时间, -1:当前时间前一天, 1:当前时间后一天,-2:前一天00:00:00, 2:后一天23:59:59</p>
                        <p>13.时间字符串: {time_str.1} 同上</p>
                    </el-collapse-item>
                </el-collapse>
            </div>

            <!-- 复选框的按钮 -->
            <el-radio-group v-model="tableLayout">
                <el-radio-button label="url" v-show="urlJsonpath.length > 0 ? true : false" />
                <el-radio-button label="params" v-show="parmaJsonpath.length > 0 ? true : false" />
                <el-radio-button label="data" v-show="dataJsonpath.length > 0 ? true : false" />
            </el-radio-group>

            <!-- url的表格 -->
            <el-table v-show="tableLayout == 'url'" :data="urlJsonpath" stripe fit>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="把这个数据" prop="old_data"></el-table-column>
                <el-table-column label="通过这个表达式" prop="jsonpath"></el-table-column>
                <el-table-column label="查询序号" prop="number" width="100%" align="center"></el-table-column>
                <el-table-column label="替换成这样" prop="new_data"></el-table-column>
                <el-table-column label="操作" width="65px">
                    <template #default="scope">
                        <el-switch v-model="scope.row.rep" active-text="替换" inactive-text="未替换"
                            :loading="scope.row.urlLoading" style="--el-switch-on-color: #67C23A;"
                            @click="repCaseData(scope.row, 'url')" inline-prompt></el-switch>
                    </template>
                </el-table-column>
            </el-table>

            <!-- params的表格 -->
            <el-table v-show="tableLayout == 'params'" :data="parmaJsonpath" stripe fit>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="把这个数据" prop="old_data"></el-table-column>
                <el-table-column label="通过这个表达式从params取值" prop="jsonpath"></el-table-column>
                <el-table-column label="查询序号" prop="number" width="100%" align="center"></el-table-column>
                <el-table-column label="替换成这样" prop="new_data"></el-table-column>
                <el-table-column label="操作" width="65px">
                    <template #default="scope">
                        <el-switch v-model="scope.row.rep" active-text="替换" inactive-text="未替换"
                            :loading="scope.row.paramsLoading" style="--el-switch-on-color: #67C23A;"
                            @click="repCaseData(scope.row, 'params')" inline-prompt></el-switch>
                    </template>
                </el-table-column>
            </el-table>

            <!-- data的表格 -->
            <el-table v-show="tableLayout == 'data'" :data="dataJsonpath" stripe fit>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="把这个数据" prop="old_data"></el-table-column>
                <el-table-column label="通过这个表达式从data取值" prop="jsonpath"></el-table-column>
                <el-table-column label="查询序号" prop="number" width="100%" align="center"></el-table-column>
                <el-table-column label="替换成这样" prop="new_data"></el-table-column>
                <el-table-column label="操作" width="65px">
                    <template #default="scope">
                        <el-switch v-model="scope.row.rep" active-text="替换" inactive-text="未替换"
                            :loading="scope.row.caseDataLoading" style="--el-switch-on-color: #67C23A;"
                            @click="repCaseData(scope.row, 'data')" inline-prompt></el-switch>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>

    </div>
</template>

<script>

import CaseData from './CaseData.vue';
import { ElNotification } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Edit, Check } from '@element-plus/icons-vue'
export default {
    name: "MyCaseInfo",
    props: {
        'caseInfo': Array
    },

    components: {
        CaseData
    },

    data() {
        return {
            Edit,
            Check,
            loading: !this.caseInfo ? true : false,
            myDialog: false,
            thisCaseData: [],
            caseId: null,
            dataTitle: null,
            dialogVisible: false,
            setCopyDialogVisible: false,
            caseName: null,
            caseRow: null,
            repData: false,
            responseValueInput: '',
            responseValueJsonpath: [],
            fixedResponseValueJsonpath: '',
            urlJsonpath: [],
            parmaJsonpath: [],
            dataJsonpath: [],
            tableLayout: '',
            activeName: null,
            select: '==',
            selectResponse: 'value'
        }
    },

    methods: {
        async updateName(row) {
            row.checkLoading = true
            await this.$http({
                url: '/caseService/name/edit',
                method: 'PUT',
                data: JSON.stringify({
                    case_id: row.case_id,
                    new_name: row.case_name
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
            return this.caseInfo[index]['case_id']
        },

        // 运行窗口
        setDialogVisible(row) {
            this.dialogVisible = true
            this.caseName = row.name
            this.caseId = row.case_id
            this.caseRow = row
        },
        // 复制窗口
        copyDialogVisible(row) {
            this.setCopyDialogVisible = true
            this.caseName = row.name
            this.caseId = row.case_id
            this.caseRow = row
        },
        // 替换测试数据
        replaceData(row) {
            this.dataTitle = row.name
            this.caseId = row.case_id
            this.repData = true
        },

        // 清理替换窗口的数据
        closeDialog() {
            this.responseValueInput = ''
            this.responseValueJsonpath = []
            this.fixedResponseValueJsonpath = ''
            this.urlJsonpath = []
            this.parmaJsonpath = []
            this.dataJsonpath = []
            this.tableLayout = ''
            this.selectResponse = 'value'
            this.select = '=='
        },

        // jsonpath多选框
        checkboxClick(row) {
            row.checkbox = true
            this.fixedResponseValueJsonpath = row.jsonpath
            for (var x in this.responseValueJsonpath) {
                if (this.responseValueJsonpath[x]['checkbox'] != row.checkbox['checkbox']) {
                    this.responseValueJsonpath[x]['checkbox'] = false
                }
            }
        },

        // 复制测试用例
        async copyCase(row) {
            this.setCopyDialogVisible = false
            row.copyLoading = true
            console.log(row);
            await this.$http({
                url: '/caseService/copy/case',
                method: 'GET',
                params: {
                    case_id: row.case_id
                }
            }).then(
                function (response) {
                    ElNotification.success({
                        title: 'Success',
                        message: '用例[ ' + row.name + ' ] 复制成功 新用例名称 [ ' + response.data.case_name + ' ]',
                        offset: 200,
                    })
                    row.copyLoading = false
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
                row.copyLoading = false
            })
        },

        // 替换测试数据
        async repCaseData(row, rep) {
            if (rep == 'url') {
                row.urlLoading = true
            } else if (rep == 'params') {
                row.paramsLoading = true
            } else if (rep == 'data') {
                row.caseDataLoading = true
            }
            var case_id = this.caseId
            await this.$http({
                url: '/caseService/replace/one/casedata',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                params: {
                    case_id: case_id,
                    number: row.number,
                    old_data: row.old_data,
                    new_data: row.new_data,
                    rep: row.rep,
                    data_type: rep,
                }
            }).then(
                function () {
                    if (row.rep) {
                        ElNotification.success({
                            title: 'Success',
                            message: '用例[ ' + case_id + '-' + row.number + '-' + rep + ' ] 替换成功',
                            offset: 200,
                        })
                    } else {
                        ElNotification.warning({
                            title: 'Warning',
                            message: '用例[ ' + case_id + '-' + row.number + '-' + rep + ' ] 取消替换',
                            offset: 200,
                        })
                    }
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )

            if (rep == 'url') {
                row.urlLoading = false
            } else if (rep == 'params') {
                row.paramsLoading = false
            } else if (rep == 'data') {
                row.caseDataLoading = false
            }
        },

        // 测试数据预览查询
        async getTestDataJsonpath() {
            if (this.responseValueInput.length < 3) {
                ElMessage.warning('最小长度: 3')
                return
            }
            this.urlJsonpath = []
            this.parmaJsonpath = []
            this.dataJsonpath = []

            var urlStr = []
            var paramStr = []
            var dataStr = []
            await this.$http({
                url: '/caseService/casedata/jsonpath/list',
                method: "GET",
                params: {
                    case_id: this.caseId,
                    extract_contents: this.responseValueInput,
                    new_str: this.fixedResponseValueJsonpath,
                    key_value: this.selectResponse,
                    ext_type: this.select
                }
            }).then(
                function (response) {
                    urlStr = response.data['data']['url_list']['extract_contents']
                    for (var x in urlStr) {
                        urlStr[x]['rep'] = false
                        urlStr[x]['urlLoading'] = false
                    }
                    paramStr = response.data['data']['params_list']['extract_contents']
                    for (var x in paramStr) {
                        paramStr[x]['rep'] = false
                        paramStr[x]['paramsLoading'] = false
                    }
                    dataStr = response.data['data']['data_list']['extract_contents']
                    for (var x in dataStr) {
                        dataStr[x]['rep'] = false
                        dataStr[x]['caseDataLoading'] = false
                    }
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            this.urlJsonpath = urlStr
            this.parmaJsonpath = paramStr
            this.dataJsonpath = dataStr

            // 给复选框绑定上值
            if (this.urlJsonpath.length > 0) {
                this.tableLayout = 'url'
            } else if (this.parmaJsonpath.length > 0) {
                this.tableLayout = 'params'
            } else if (this.dataJsonpath.length > 0) {
                this.tableLayout = 'data'
            }
        },


        // 获取jsonpath接口
        async getResponseJsonPath() {
            if (this.responseValueInput.length < 3) {
                ElMessage.warning('最小长度: 3')
                return
            }
            this.responseValueJsonpath = []
            var responseValueJsonpath = []
            var fixedResponseValueJsonpath = ''
            await this.$http({
                url: '/caseService/response/jsonpath/list',
                method: 'GET',
                params: {
                    case_id: this.caseId,
                    extract_contents: this.responseValueInput,
                    key_value: this.selectResponse,
                    ext_type: this.select
                }
            }).then(
                function (response) {
                    for (var x in response.data.data) {
                        responseValueJsonpath = response.data.data[x]
                        for (var i in response.data.data[x]) {
                            if (i == 0) {
                                response.data.data[x][i]['checkbox'] = true
                                fixedResponseValueJsonpath = response.data.data[x][i]['jsonpath']
                            } else {
                                response.data.data[x][i]['checkbox'] = false
                            }
                        }
                    }
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            this.responseValueJsonpath = responseValueJsonpath
            this.fixedResponseValueJsonpath = fixedResponseValueJsonpath
        },

        // 用例详情数据
        async getCaseData(row) {
            this.dataTitle = row.name
            this.caseId = row.case_id
            row.dataLoading = true
            var case_ = []
            var dialog_ = false
            await this.$http.get('/caseService/data/' + row.case_id).then(
                function (response) {
                    row.dataLoading = false
                    case_ = response.data['data']
                    for (var x in case_) {
                        case_[x].stopLoading = false
                        case_[x].failStopLoading = false
                        case_[x].isLoginLoading = false
                        case_[x].descriptionLoading = false
                        case_[x].edit = true
                    }
                    dialog_ = true
                }
            ).catch(
                function (error) {
                    row.dataLoading = false
                    ElMessage.error(error.message)
                }
            )
            this.myDialog = dialog_
            this.thisCaseData = case_
        },

        // 运行用例数据
        async runCase(row) {
            this.dialogVisible = false
            row.runLoading = true
            ElNotification.success({
                title: 'Success',
                message: '开始执行 用例ID: ' + row.case_id,
                offset: 200,
            })
            await this.$http.post('/runCase/case', [row.case_id]).then(
                function (response) {
                    row.runLoading = false
                    if (response.data.code == 0) {
                        ElNotification({
                            title: '测试报告',
                            message: '<a href="' + response.data.data.allure_report[row.case_id] + '/index.html" target="_blank">查看用例[' + row.case_id + ']的报告</a>',
                            duration: 0,
                            type: 'success',
                            position: 'bottom-right',
                            dangerouslyUseHTMLString: true,
                        })
                    } else {
                        ElNotification.warning({
                            title: 'Warning',
                            message: '用例\n[ ' + row.case_id + '-' + row.name + ' ] 执行失败',
                            offset: 200,
                        })
                    }
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
                ElNotification.error({
                    title: 'Error',
                    message: '执行失败 用例ID: ' + row.case_id,
                    offset: 200,
                })
                row.runLoading = false
            })
        }
    }
}
</script>


<style scoped>
.el-link {
    margin-right: 8px;
}

.el-link .el-icon--right.el-icon {
    vertical-align: text-bottom;
}
</style>