<template>
    <!-- 原始数据查询 -->
    <el-form-item :inline="true">
        <el-input v-model="responseValueInput" placeholder="请输入需要查找的原始数据" clearable minlength="3"
            @keyup.enter.native="getResponseJsonPath">
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
        <el-table-column label="把这个数据" prop="path" show-overflow-tooltip='true'></el-table-column>
        <el-table-column label="通过这个表达式" prop="jsonpath"></el-table-column>
        <el-table-column label="查询序号" prop="number" width="100%" align="center"></el-table-column>
        <el-table-column label="替换成这样" prop="new_data"></el-table-column>
        <el-table-column label="操作" width="65px">
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
        <el-table-column label="操作" width="65px">
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
        <el-table-column label="操作" width="65px">
            <template #default="scope">
                <el-switch v-model="scope.row.rep" active-text="替换" inactive-text="未替换" :loading="scope.row.caseDataLoading"
                    style="--el-switch-on-color: #67C23A;" @click="repCaseData(scope.row, 'data')"
                    inline-prompt></el-switch>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
import { ElNotification } from 'element-plus'
import { ElMessage } from 'element-plus'
export default {
    name: 'MyReplaceData',
    props: {
        'caseId': Number
    },
    data() {
        return {
            responseValueInput: '',
            responseValueJsonpath: [],
            selectResponse: 'value',
            select: '==',
            fixedResponseValueJsonpath: '',
            urlJsonpath: [],
            parmaJsonpath: [],
            dataJsonpath: [],
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
        }
    }
}
</script>
