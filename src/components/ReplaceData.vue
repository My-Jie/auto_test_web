<template>
    <!-- 原始数据查询 -->
    <el-form-item :inline="true">
        <el-input v-model="responseValueInput" placeholder="请输入需要查找的原始数据" clearable minlength="3"
            @keyup.enter.native="getResponseJsonPath">
            <template #prepend>
                <el-space wrap :size="40">
                    <el-select v-model="dataType" placeholder="请选择数据源" style="width: 130px">
                        <el-option label="Response" value="response" />
                        <el-option label="ResHeaders" value="response_headers" />
                    </el-select>
                </el-space>
                <el-space wrap :size="40">
                    <el-select v-model="selectResponse" placeholder="请选择取值方式" style="width: 85px">
                        <el-option label="value" value="value" />
                        <el-option label="key" value="key" />
                    </el-select>
                </el-space>
                <el-space wrap :size="20">
                    <el-select v-show="selectResponse == 'value'" v-model="select" placeholder="==" style="width: 65px">
                        <el-option label="==" value="==" />
                        <el-option label="in" value="in" />
                    </el-select>
                </el-space>
            </template>
            <template #append>
                <el-button plain @click="getResponseJsonPath">查询</el-button>
            </template>
        </el-input>
    </el-form-item>
    <!-- 选择jsonpath数据 -->
    <el-table :data="responseValueJsonpath" stripe fit v-show="responseValueJsonpath.length > 0">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="从这个Url的Response数据中" prop="path" show-overflow-tooltip='true'></el-table-column>
        <el-table-column label="通过序号.$.取值表达式" prop="jsonpath"></el-table-column>
        <el-table-column label="选择数据源[建议第一条]" width="200px" align="center">
            <template #default="scope">
                <el-checkbox v-model=scope.row.checkbox @click.stop="checkboxClick(scope.row)" label="" />
            </template>
        </el-table-column>
    </el-table>
    <br>
    <!-- 被替换数据的查询预览 -->
    <el-form-item :inline="true">
        <el-input v-model="fixedResponseValueJsonpath" placeholder="准备替换的数据" clearable minlength="3"
            @keyup.enter.native="getTestDataJsonpath">
            <template #prepend>预选表达式</template>
            <template #append>
                <el-button @click="getTestDataJsonpath">
                    使用[ {{ selectResponse }} ]->[ {{ responseValueInput }} ]从测试数据的 url.params.data.headers 预览查询
                </el-button>
            </template>
        </el-input>
    </el-form-item>
    <my-collapse :column="3"></my-collapse>

    <!-- 复选框的按钮 -->
    <el-radio-group v-model="tableLayout">
        <el-radio-button label="url" v-show="urlJsonpath.length > 0 ? true : false" />
        <el-radio-button label="params" v-show="parmaJsonpath.length > 0 ? true : false" />
        <el-radio-button label="data" v-show="dataJsonpath.length > 0 ? true : false" />
        <el-radio-button label="headers" v-show="headersJsonpath.length > 0 ? true : false" />
    </el-radio-group>
    <br>
    <br>

    <!-- url的表格 -->
    <el-table v-show="tableLayout == 'url'" :data="urlJsonpath" stripe fit>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="把这个数据" prop="path" show-overflow-tooltip='true'></el-table-column>
        <el-table-column label="通过这个表达式" prop="jsonpath"></el-table-column>
        <el-table-column label="查询序号" prop="number" width="100%" align="center"></el-table-column>
        <el-table-column label="替换成这样" prop="new_data"></el-table-column>
        <el-table-column label="操作" width="75px">
            <template #default="scope">
                <el-switch v-model="scope.row.rep" active-text="替换" inactive-text="未替换" :loading="scope.row.urlLoading"
                    style="--el-switch-on-color: #67C23A;" @click="repCaseData(scope.row, 'url')" inline-prompt></el-switch>
            </template>
        </el-table-column>
    </el-table>

    <!-- params的表格 -->
    <el-table v-show="tableLayout == 'params'" :data="parmaJsonpath" stripe fit>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="把这个数据" prop="old_data" show-overflow-tooltip='true'></el-table-column>
        <el-table-column label="通过这个表达式从params取值" prop="jsonpath"></el-table-column>
        <el-table-column label="查询序号" prop="number" width="100%" align="center"></el-table-column>
        <el-table-column label="替换成这样" prop="new_data"></el-table-column>
        <el-table-column label="操作" width="75px">
            <template #default="scope">
                <el-switch v-model="scope.row.rep" active-text="替换" inactive-text="未替换" :loading="scope.row.paramsLoading"
                    style="--el-switch-on-color: #67C23A;" @click="repCaseData(scope.row, 'params')"
                    inline-prompt></el-switch>
            </template>
        </el-table-column>
    </el-table>

    <!-- data的表格 -->
    <el-table v-show="tableLayout == 'data'" :data="dataJsonpath" stripe fit>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="把这个数据" prop="old_data" show-overflow-tooltip='true'></el-table-column>
        <el-table-column label="通过这个表达式从data取值" prop="jsonpath"></el-table-column>
        <el-table-column label="查询序号" prop="number" width="100%" align="center"></el-table-column>
        <el-table-column label="替换成这样" prop="new_data"></el-table-column>
        <el-table-column label="操作" width="75px">
            <template #default="scope">
                <el-switch v-model="scope.row.rep" active-text="替换" inactive-text="未替换" :loading="scope.row.caseDataLoading"
                    style="--el-switch-on-color: #67C23A;" @click="repCaseData(scope.row, 'data')"
                    inline-prompt></el-switch>
            </template>
        </el-table-column>
    </el-table>

    <!-- headers的表格 -->
    <el-table v-show="tableLayout == 'headers'" :data="headersJsonpath" stripe fit>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="把这个数据" prop="old_data" show-overflow-tooltip='true'></el-table-column>
        <el-table-column label="通过这个表达式从data取值" prop="jsonpath"></el-table-column>
        <el-table-column label="查询序号" prop="number" width="100%" align="center"></el-table-column>
        <el-table-column label="替换成这样" prop="new_data"></el-table-column>
        <el-table-column label="操作" width="75px">
            <template #default="scope">
                <el-switch v-model="scope.row.rep" active-text="替换" inactive-text="未替换" :loading="scope.row.headersLoading"
                    style="--el-switch-on-color: #67C23A;" @click="repCaseData(scope.row, 'headers')"
                    inline-prompt></el-switch>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
import { ElNotification } from 'element-plus'
import { ElMessage } from 'element-plus'
import MyCollapse from './MyCollapse.vue'
export default {
    name: 'MyReplaceData',

    components: {
        MyCollapse
    },

    props: {
        'caseId': Number
    },
    data() {
        return {
            responseValueInput: '',
            responseValueJsonpath: [],
            dataType: 'response',
            selectResponse: 'value',
            select: '==',
            fixedResponseValueJsonpath: '',
            urlJsonpath: [],
            parmaJsonpath: [],
            dataJsonpath: [],
            headersJsonpath: [],
            tableLayout: '',
            activeName: null,
        }
    },

    methods: {
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
                    ext_type: this.select,
                    data_type: this.dataType
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
        // 替换测试数据
        async repCaseData(row, rep) {
            if (rep == 'url') {
                row.urlLoading = true
            } else if (rep == 'params') {
                row.paramsLoading = true
            } else if (rep == 'data') {
                row.caseDataLoading = true
            } else if (rep == 'headers') {
                row.headersLoading = true
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
                        })
                    } else {
                        ElNotification.warning({
                            title: 'Warning',
                            message: '用例[ ' + case_id + '-' + row.number + '-' + rep + ' ] 取消替换',
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
            } else if (rep == 'headers') {
                row.headersLoading = false
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
            this.headersJsonpath = []

            var urlStr = []
            var paramStr = []
            var dataStr = []
            var headersStr = []
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
                    headersStr = response.data['data']['headers_list']['extract_contents']
                    for (var x in headersStr) {
                        headersStr[x]['rep'] = false
                        headersStr[x]['headersLoading'] = false
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
            this.headersJsonpath = headersStr

            // 给复选框绑定上值
            if (this.urlJsonpath.length > 0) {
                this.tableLayout = 'url'
            } else if (this.parmaJsonpath.length > 0) {
                this.tableLayout = 'params'
            } else if (this.dataJsonpath.length > 0) {
                this.tableLayout = 'data'
            } else if (this.headersJsonpath.length > 0) {
                this.tableLayout = 'headers'
            }
        }
    }
}
</script>

<style scoped>
.my-card {
    background-color: #7dcea0;
}
</style>