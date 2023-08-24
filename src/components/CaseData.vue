<template>
    <el-affix :offset="10">
        <el-button type="primary" @click="repData = true">关联数据</el-button>
        <el-button type="primary" :loading="dataLoading" @click="getCaseData">刷新</el-button>
    </el-affix>

    <!-- 替换数据弹窗 -->
    <el-dialog class="case-data" v-model='repData' v-if="repData" width="70%" :close-on-click-modal=false draggable
        :title="'提取Jsonpath数据, 进行上下接口数据关联'" @close='repData = false'>
        <my-replace-data :case-id="caseId"></my-replace-data>
    </el-dialog>
    <br>
    <!-- 表格 -->
    <el-table :data="caseData" stripe fit>
        <el-table-column fixed="left" label="config" prop="config" width="250%">
            <template #default="scope">
                <el-switch v-model="scope.row.config.stop" active-text="主动结束" inactive-text="主动结束"
                    :loading="scope.row.stopLoading" class="ml-2" style="--el-switch-on-color: #FFC857;"
                    @click="setConfigStatus(scope.row, 'stop')" inline-prompt></el-switch>&nbsp;
                <el-switch v-model="scope.row.config.fail_stop" active-text="失败停止" inactive-text="失败停止"
                    :loading="scope.row.failStopLoading" class="ml-2" style="--el-switch-on-color: #F29492;"
                    @click="setConfigStatus(scope.row, 'fail_stop')" inline-prompt></el-switch>&nbsp;
                <el-switch v-model="scope.row.config.is_login" active-text="登录" inactive-text="登录"
                    :loading="scope.row.isLoginLoading" class="ml-2" style="--el-switch-on-color: #6FCF97;"
                    @click="setConfigStatus(scope.row, 'is_login')" inline-prompt></el-switch>
                <el-col :span="22">
                    <el-input v-model="scope.row.config.sleep" size="small"
                        @keyup.enter.native="setConfigStatus(scope.row, 'sleep')">
                        <template #prepend>轮询</template>
                        <template #append>
                            <el-button :icon="Check" size="small"
                                @click="setConfigStatus(scope.row, 'sleep')">轮询失败</el-button>
                        </template>
                    </el-input>
                </el-col>
            </template>
        </el-table-column>
        <el-table-column fixed="left" label="num" prop="number" type="index" :index="indexMethod" width="70px"
            align="center"></el-table-column>
        <el-table-column label="host" prop="host" width="280px"></el-table-column>
        <el-table-column label="method" prop="method" width="80px"></el-table-column>
        <el-table-column label="path" prop="path" width="300px"></el-table-column>

        <!-- params的按钮和内容框 -->
        <el-table-column label="" width="55" align="center">
            <template #default="scope">
                <el-button :icon="Edit" size="small" @click="setData(scope.row, 'Params')"></el-button>
            </template>
        </el-table-column>
        <el-table-column label="params" prop="params" show-overflow-tooltip='true' width="400px">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.params, null, 1) }}</div>
            </template>
        </el-table-column>
        <!-- data的按钮和内容框 -->
        <el-table-column label="" width="55" align="center">
            <template #default="scope">
                <el-button :icon="Edit" size="small" @click="setData(scope.row, 'Data')"></el-button>
            </template>
        </el-table-column>
        <el-table-column label="data" prop="data" show-overflow-tooltip='true' width="400px">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.data, null, 1) }}</div>
            </template>
        </el-table-column>
        <!-- 校验的按钮和内容框 -->
        <el-table-column label="" width="55" align="center">
            <template #default="scope">
                <el-button :icon="Edit" size="small" @click=setCheck(scope.row)></el-button>
            </template>
        </el-table-column>
        <el-table-column label="check" prop="check" show-overflow-tooltip='true' width="250px">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.check, null, 1) }}</div>
            </template>
        </el-table-column>
        <!-- headers的按钮和内容框 -->
        <el-table-column label="" width="55" align="center">
            <template #default="scope">
                <el-button :icon="Edit" size="small" @click=setHeader(scope.row)></el-button>
            </template>
        </el-table-column>
        <el-table-column label="headers" prop="headers" show-overflow-tooltip='true' width="400px">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.headers, null, 1) }}</div>
            </template>
        </el-table-column>
        <!-- 描述的按钮和内容框 -->
        <el-table-column label="" width="55" align="center" fixed="right">
            <template #default="scope">
                <el-button :icon="Edit" size="small" v-if="scope.row.edit" @click="scope.row.edit = false"></el-button>
                <el-button :icon="Check" size="small" v-if="!scope.row.edit"
                    @click="checkDescription(scope.row)"></el-button>
            </template>
        </el-table-column>
        <el-table-column label="description" prop="description" width="150px" fixed="right">
            <template #default="scope">
                <div v-if="scope.row.description && scope.row.edit">{{ scope.row.description }}</div>
                <el-input v-model="scope.row.description" placeholder="可输入" v-if="scope.row.edit == false"
                    @keyup.enter.native="checkDescription(scope.row)"></el-input>
            </template>
        </el-table-column>
    </el-table>
    <!-- check的弹窗 -->
    <el-dialog class="case-data" v-if="checkDialog" v-model='checkDialog' width="50%" draggable height="550px"
        :title="'CaseId-' + this.caseId + ' , Number-' + this.checkNumber + ' , 响应校验-断言'" :close-on-click-modal=false
        @close="closeCheckDialog('Check')">
        <!-- 增加操作 -->
        <el-button v-if="checkInfo.length <= 0" :icon="Plus" type="warning" size="small"
            @click="addRow('check')"></el-button>
        <el-table :data="checkInfo" stripe fit empty-text="空">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="key" align="center" width="120px">
                <template #default="scope">
                    <div v-if="!scope.row.edit">{{ scope.row.key }}</div>
                    <el-input v-if="scope.row.edit" v-model="scope.row.key" placeholder="校验字段" size="small" />
                </template>
            </el-table-column>
            <el-table-column label="数据类型" align="center" width="90px">
                <template #default="scope">
                    <el-button v-if="!scope.row.edit" :type="scope.row.color" size="small" link>{{ scope.row.type
                    }}</el-button>
                    <el-select v-model="scope.row.type" :placeholder="scope.row.type" v-if="scope.row.edit" size="small">
                        <el-option label="string" value='string' />
                        <el-option label="number" value='number' />
                        <el-option label="boolean" value='boolean' />
                        <el-option label="null" value='null' />
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column label="比较符" align="center" width="90px">
                <template #default="scope">
                    <div v-if="!scope.row.edit">{{ scope.row.s }}</div>
                    <el-select v-model="scope.row.s" :placeholder="scope.row.s" v-if="scope.row.edit" size="small">
                        <el-option label="==" value="==" />
                        <el-option label="!=" value="!=" />
                        <el-option label="<" value="<" />
                        <el-option label="<=" value="<=" />
                        <el-option label=">" value=">" />
                        <el-option label=">=" value=">=" />
                        <el-option label="in" value="in" />
                        <el-option label="!in" value="!in" />
                        <el-option label="not in" value="not in" />
                        <el-option label="notin" value="notin" />
                        <el-option label="!not in" value="!not in" />
                        <el-option label="!notin" value="!notin" />
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column label="value" align="center">
                <template #default="scope">
                    <div v-if="!scope.row.edit">{{ scope.row.value }}</div>
                    <el-input v-if="scope.row.edit && scope.row.type == 'string'" v-model="scope.row.value"
                        placeholder="校验内容" size="small" />
                    <el-input-number v-if="scope.row.edit && scope.row.type == 'number'" v-model="scope.row.value"
                        placeholder="校验内容" size="small" />
                    <el-select v-if="scope.row.edit && scope.row.type == 'boolean'" v-model="scope.row.value"
                        :placeholder=true size="small">
                        <el-option label="true" :value='true' />
                        <el-option label="false" :value='false' />
                    </el-select>
                    <el-input v-if="scope.row.edit && scope.row.type == 'null'" v-model="scope.row.value" disabled=true
                        placeholder="null" size="small" />
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="180px">
                <template #default="scope">
                    <!-- 编辑操作 -->
                    <el-button :icon="Edit" type="primary" size="small" v-if="!scope.row.edit && !scope.row.EditDisabled"
                        :disabled="scope.row.EditDisabled" @click="myEdit(scope.row)"></el-button>
                    <el-button :icon="Check" type="success" size="small" v-if="scope.row.edit"
                        @click="checkCheck(scope.row, 'edit')"></el-button>
                    <el-button :icon="Close" type="success" size="small" v-if="scope.row.EditDisabled"
                        @click="myClose(scope.row)"></el-button>
                    <!-- 增加操作 -->
                    <el-button :icon="Plus" type="warning" size="small" @click="addRow('check')"></el-button>
                    <!-- 删除操作 -->
                    <el-button :icon="Delete" type="danger" size="small" v-if="!scope.row.del && !scope.row.delDisabled"
                        :disabled="scope.row.delDisabled" @click="checkDel(scope.row)"></el-button>
                    <el-button :icon="Check" type="success" size="small" v-if="scope.row.del"
                        @click="checkCheck(scope.row, 'del')"></el-button>
                    <el-button :icon="Close" type="success" size="small" v-if="scope.row.delDisabled"
                        @click="myClose(scope.row)"></el-button>
                </template>
            </el-table-column>
        </el-table>
        <br>
        <!-- 响应信息内容 -->
        <el-tabs v-model="activeName" :tab-position="'top'" type="border-card" @tab-click="handleTabClick">
            <el-tab-pane label="tempResponse" name="tempResponse">
                <vue-json-pretty :data="JSON.parse(tempResponse)"></vue-json-pretty>
            </el-tab-pane>
            <el-tab-pane label="caseResponse" name="caseResponse">
                <vue-json-pretty :data="JSON.parse(caseResponse)"></vue-json-pretty>
            </el-tab-pane>
        </el-tabs>
    </el-dialog>
    <!-- params\data的弹窗 -->
    <el-dialog class="case-data" v-if="dataDialog" v-model="dataDialog" width="50%" draggable height="550px"
        :title="'CaseId-' + this.caseId + ' , Number-' + this.checkNumber + ' , ' + this.dataTitle + ' 数据'"
        :close-on-click-modal=false @close="closeCheckDialog(this.dataTitle)">
        <el-button type="info" @click="initData()">初始化</el-button>
        <el-button type="success" @click="formatData()">格式化</el-button>
        <el-button type="warning" @click="emptyData()">清空数据</el-button>
        <el-button type="primary" :icon="Check" @click="setParamsData(this.dataTitle)">提交</el-button>
        <br>
        <br>
        <el-input v-model="dataInfo" type="textarea" :rows="dataLength" spellcheck="false">
        </el-input>
        <br>
        <br>

        <el-tabs v-if="dataTitle == 'Params'" v-model="activeNameParams" :tab-position="'top'" type="border-card"
            @tab-click="handleTabClickParams">
            <el-tab-pane label="tempParams" name="tempParams">
                <vue-json-pretty :data="JSON.parse(tempParams)"></vue-json-pretty>
            </el-tab-pane>
            <el-tab-pane label="caseParams" name="caseParams">
                <vue-json-pretty :data="JSON.parse(caseParams)"></vue-json-pretty>
            </el-tab-pane>
        </el-tabs>

        <el-tabs v-if="dataTitle == 'Data'" v-model="activeNameData" :tab-position="'top'" type="border-card"
            @tab-click="handleTabClickData">
            <el-tab-pane label="tempData" name="tempData">
                <vue-json-pretty :data="JSON.parse(tempDataS)"></vue-json-pretty>
            </el-tab-pane>
            <el-tab-pane label="caseData" name="caseData">
                <vue-json-pretty :data="JSON.parse(caseDataS)"></vue-json-pretty>
            </el-tab-pane>
        </el-tabs>
        <br>
        <my-collapse :column="2"></my-collapse>
    </el-dialog>
    <!-- header的弹窗 -->
    <el-dialog class="case-data" v-if="headerDialog" v-model='headerDialog' width="50%" draggable height="550px"
        :title="'CaseId-' + this.caseId + ' , Number-' + this.checkNumber + ' , 请求头'" :close-on-click-modal=false
        @close="closeCheckDialog('Header')">
        <!-- 增加操作 -->
        <el-button v-if="headerInfo.length <= 0" :icon="Plus" type="warning" size="small"
            @click="addRow('header')"></el-button>
        <el-table :data="headerInfo" stripe fit empty-text="空">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="key" align="center" width="120px">
                <template #default="scope">
                    <div v-if="!scope.row.edit">{{ scope.row.key }}</div>
                    <el-input v-if="scope.row.edit" v-model="scope.row.key" placeholder="header键" size="small" />
                </template>
            </el-table-column>
            <el-table-column label="value" align="center">
                <template #default="scope">
                    <div v-if="!scope.row.edit">{{ scope.row.value }}</div>
                    <el-input v-if="scope.row.edit" v-model="scope.row.value" placeholder="header值" size="small" />
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="180px">
                <template #default="scope">
                    <!-- 编辑操作 -->
                    <el-button :icon="Edit" type="primary" size="small" v-if="!scope.row.edit && !scope.row.EditDisabled"
                        :disabled="scope.row.EditDisabled" @click="myEdit(scope.row)"></el-button>
                    <el-button :icon="Check" type="success" size="small" v-if="scope.row.edit"
                        @click="HeaderCheck(scope.row, 'edit')"></el-button>
                    <el-button :icon="Close" type="success" size="small" v-if="scope.row.EditDisabled"
                        @click="myClose(scope.row)"></el-button>
                    <!-- 增加操作 -->
                    <el-button :icon="Plus" type="warning" size="small" @click="addRow('header')"></el-button>
                    <!-- 删除操作 -->
                    <el-button :icon="Delete" type="danger" size="small" v-if="!scope.row.del && !scope.row.delDisabled"
                        :disabled="scope.row.delDisabled" @click="headerDel(scope.row)"></el-button>
                    <el-button :icon="Check" type="success" size="small" v-if="scope.row.del"
                        @click="HeaderCheck(scope.row, 'del')"></el-button>
                    <el-button :icon="Close" type="success" size="small" v-if="scope.row.delDisabled"
                        @click="myClose(scope.row)"></el-button>
                </template>
            </el-table-column>
        </el-table>
        <br>
        <br>
        <!-- 响应信息内容 -->
        <el-tabs v-model="activeNameHeaders" :tab-position="'top'" type="border-card" @tab-click="handleTabClickHeaders">
            <el-tab-pane label="tempHeaders" name="tempHeaders">
                <vue-json-pretty :data="JSON.parse(tempHeaders)"></vue-json-pretty>
            </el-tab-pane>
            <el-tab-pane label="caseHeaders" name="caseParams">
                <vue-json-pretty :data="JSON.parse(caseHeaders)"></vue-json-pretty>
            </el-tab-pane>
        </el-tabs>
    </el-dialog>
</template>

<script>
import { ElNotification } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Edit, Check, Plus, Delete, Close } from '@element-plus/icons-vue'
import MyReplaceData from './ReplaceData.vue'
import MyCollapse from './MyCollapse.vue'
import VueJsonPretty from 'vue-json-pretty'
export default {
    name: 'CaseData',
    components: {
        MyReplaceData,
        MyCollapse,
        VueJsonPretty
    },
    props: {
        'caseData': Array,
        'caseId': Number
    },

    data() {
        return {
            Edit,
            Check,
            Plus,
            Delete,
            Close,
            checkDialog: false,
            dataDialog: false,
            headerDialog: false,
            dataInfo: '',
            dataInit: '',
            dataTitle: '',
            dataLength: 5,
            checkNumber: null,
            checkInfo: [],
            headerInfo: [],
            renovate: false,
            repData: false,
            dataLoading: false,

            activeNameParams: 'tempParams',
            tabNameParams: { props: { name: 'tempParams' } },
            tempParams: null,
            caseParams: null,

            activeNameData: 'tempData',
            tabNameData: { props: { name: 'tempData' } },
            tempDataS: null,
            caseDataS: null,

            activeNameHeaders: 'tempHeaders',
            tabNameHeaders: { props: { name: 'tempHeaders' } },
            tempHeaders: null,
            caseHeaders: null,

            activeName: 'tempResponse',
            tabName: { props: { name: 'tempResponse' } },
            tempResponse: null,
            caseResponse: null,
        }
    },
    methods: {
        // 获取单接口的response
        async handleTabClick(tab) {
            this.tabName.props.name = tab.props.name
            switch (tab.props.name) {
                case 'tempResponse':
                    var tempRes = null
                    await this.$http({
                        url: '/caseService/get/apiInfo',
                        method: 'GET',
                        params: {
                            case_id: this.caseId,
                            type_: 'response',
                            number: this.checkNumber
                        }
                    }).then(
                        function (response) {
                            tempRes = response.data
                        }
                    ).catch(
                        function (error) {
                            ElMessage.error(error.message)
                        }
                    )
                    this.tempResponse = JSON.stringify(tempRes, null, 4)
                    break

                case 'caseResponse':
                    var caseRes = null
                    await this.$http({
                        url: '/runCase/get/apiInfo',
                        method: 'GET',
                        params: {
                            case_id: this.caseId,
                            type_: 'response',
                            number: this.checkNumber
                        }
                    }).then(
                        function (response) {
                            caseRes = response.data
                        }
                    ).catch(
                        function (error) {
                            ElMessage.error(error.message)
                        }
                    )
                    this.caseResponse = JSON.stringify(caseRes, null, 4)
                    break
            }
        },
        // 获取单接口的Params
        async handleTabClickParams(tab) {
            this.tabNameParams.props.name = tab.props.name
            switch (tab.props.name) {
                case 'tempParams':
                    var tempParams = null
                    await this.$http({
                        url: '/caseService/get/apiInfo',
                        method: 'GET',
                        params: {
                            case_id: this.caseId,
                            type_: 'params',
                            number: this.checkNumber
                        }
                    }).then(
                        function (response) {
                            tempParams = response.data
                        }
                    ).catch(
                        function (error) {
                            ElMessage.error(error.message)
                        }
                    )
                    this.tempParams = JSON.stringify(tempParams, null, 4)
                    break

                case 'caseParams':
                    var caseParams = null
                    await this.$http({
                        url: '/runCase/get/apiInfo',
                        method: 'GET',
                        params: {
                            case_id: this.caseId,
                            type_: 'params',
                            number: this.checkNumber
                        }
                    }).then(
                        function (response) {
                            caseParams = response.data
                        }
                    ).catch(
                        function (error) {
                            ElMessage.error(error.message)
                        }
                    )
                    this.caseParams = JSON.stringify(caseParams, null, 4)
                    break
            }
        },
        // 获取单接口的Data
        async handleTabClickData(tab) {
            this.tabNameData.props.name = tab.props.name
            switch (tab.props.name) {
                case 'tempData':
                    var tempData = null
                    await this.$http({
                        url: '/caseService/get/apiInfo',
                        method: 'GET',
                        params: {
                            case_id: this.caseId,
                            type_: 'data',
                            number: this.checkNumber
                        }
                    }).then(
                        function (response) {
                            tempData = response.data
                        }
                    ).catch(
                        function (error) {
                            ElMessage.error(error.message)
                        }
                    )
                    this.tempDataS = JSON.stringify(tempData, null, 4)
                    break

                case 'caseData':
                    var caseData = null
                    await this.$http({
                        url: '/runCase/get/apiInfo',
                        method: 'GET',
                        params: {
                            case_id: this.caseId,
                            type_: 'data',
                            number: this.checkNumber
                        }
                    }).then(
                        function (response) {
                            caseData = response.data
                        }
                    ).catch(
                        function (error) {
                            ElMessage.error(error.message)
                        }
                    )
                    this.caseDataS = JSON.stringify(caseData, null, 4)
                    break
            }
        },
        // 获取单接口的Headers
        async handleTabClickHeaders(tab) {
            this.tabNameHeaders.props.name = tab.props.name
            switch (tab.props.name) {
                case 'tempHeaders':
                    var tempHeaders = null
                    await this.$http({
                        url: '/caseService/get/apiInfo',
                        method: 'GET',
                        params: {
                            case_id: this.caseId,
                            type_: 'headers',
                            number: this.checkNumber
                        }
                    }).then(
                        function (response) {
                            tempHeaders = response.data
                        }
                    ).catch(
                        function (error) {
                            ElMessage.error(error.message)
                        }
                    )
                    this.tempHeaders = JSON.stringify(tempHeaders, null, 4)
                    break

                case 'caseHeaders':
                    var caseHeaders = null
                    await this.$http({
                        url: '/runCase/get/apiInfo',
                        method: 'GET',
                        params: {
                            case_id: this.caseId,
                            type_: 'headers',
                            number: this.checkNumber
                        }
                    }).then(
                        function (response) {
                            caseHeaders = response.data
                        }
                    ).catch(
                        function (error) {
                            ElMessage.error(error.message)
                        }
                    )
                    this.caseHeaders = JSON.stringify(caseHeaders, null, 4)
                    break
            }
        },
        // 刷新用例详情数据
        async getCaseData() {
            this.dataLoading = true
            var case_ = []
            await this.$http.get('/caseService/data/' + this.caseId).then(
                function (response) {
                    case_ = response.data['data']
                    for (var x in case_) {
                        case_[x].stopLoading = false
                        case_[x].failStopLoading = false
                        case_[x].isLoginLoading = false
                        case_[x].sleepLoading = false
                        case_[x].descriptionLoading = false
                        case_[x].edit = true
                    }
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            for (var x in case_) {
                this.caseData[x] = case_[x]
            }
            this.dataLoading = false
        },
        // params/data数据的弹窗
        setData(row, type_) {
            this.checkNumber = row.number
            this.dataTitle = type_
            this.dataDialog = true
            if (type_ == 'Params') {
                var length = 0
                for (var _ in row.params) {
                    length++
                }
                this.dataLength = length > this.dataLength ? length + 2 : this.dataLength + 2
                this.dataInfo = JSON.stringify(row.params, null, 4);
                this.dataInit = row.params
                this.handleTabClickParams(this.tabNameParams)
            } else {
                var length = 0
                for (var _ in row.data) {
                    length++
                }
                this.dataLength = length > this.dataLength ? length + 2 : this.dataLength + 2
                this.dataInfo = JSON.stringify(row.data, null, 4);
                this.dataInit = row.data
                this.handleTabClickData(this.tabNameData)
            }
        },
        // 初始化数据
        initData() {
            try {
                this.dataInfo = JSON.stringify(this.dataInit, null, 4);
                ElMessage.success('数据初始化成功')
            } catch (e) {
                ElMessage.error('数据初始化失败，格式有误')
            }
        },
        // 格式化数据
        formatData() {
            try {
                this.dataInfo = JSON.stringify(JSON.parse(this.dataInfo), null, 4);
                ElMessage.success('数据格式化成功')
            } catch (e) {
                ElMessage.error('数据格式化失败，格式有误')
            }
        },
        // 清空数据
        emptyData() {
            this.dataInfo = JSON.stringify({}, null, 4);
        },
        // 请求头内容的弹窗
        setHeader(row) {
            this.checkNumber = row.number
            var num = 0
            for (var x in row.headers) {
                var checkDict = {}
                checkDict.key = x
                checkDict.value = row.headers[x]
                checkDict.edit = false
                checkDict.del = false
                checkDict.delDisabled = false
                checkDict.EditDisabled = false
                checkDict.num = num
                // 添加到数组
                this.headerInfo.push(checkDict)
                num++
            }
            this.headerDialog = true
            this.handleTabClickHeaders(this.tabNameHeaders)
        },
        // 请求头内容的提交
        async HeaderCheck(row, myType) {
            var flag = false
            await this.$http({
                url: '/caseService/set/api/header',
                method: 'PUT',
                data: JSON.stringify({
                    case_id: this.caseId,
                    number: this.checkNumber,
                    type: myType,
                    header: {
                        key: row.key,
                        value: row.value,
                    }
                }),
                headers: {
                    'content-type': "application/json"
                }
            }).then(
                function () {
                    flag = true
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
            if (flag) {
                row.edit = false
                row.delDisabled = false
                row.EditDisabled = false
                if (myType == 'edit') {
                    // 判断key出现的次数
                    var num = 0
                    for (var x in this.headerInfo) {
                        if (this.headerInfo[x].key == row.key) {
                            num++
                        }
                    }
                    // key超出2次就删掉最前面的一个
                    if (num >= 2) {
                        for (var x in this.headerInfo) {
                            if (this.headerInfo[x].key == row.key) {
                                this.headerInfo.splice(x, 1)
                                break
                            }
                        }
                    }
                } else {
                    // 删除逻辑
                    for (var x in this.headerInfo) {
                        if (this.headerInfo[x].key == row.key) {
                            this.headerInfo.splice(x, 1)
                            break
                        }
                    }
                }
            }
            this.renovate = true
        },

        // 校验内容的弹窗
        setCheck(row) {
            this.checkNumber = row.number
            var num = 0
            for (var x in row.check) {
                var checkDict = {}
                checkDict.key = x
                checkDict.edit = false
                checkDict.del = false
                checkDict.delDisabled = false
                checkDict.EditDisabled = false
                checkDict.num = num
                if (row.check[x] instanceof Array) {
                    var compare = row.check[x][0]
                    checkDict.type = row.check[x][1] == null ? "null" : typeof row.check[x][1]
                    if (compare == '==') {
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    } else if (compare == '<') {
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    } else if (compare == '<=') {
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    } else if (compare == '!=') {
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    } else if (compare == '>') {
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    } else if (compare == '>=') {
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    } else if (compare == 'in') {
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    } else if (compare == 'not in') {
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    } else if (compare == 'notin') {
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    } else {
                        checkDict.s = compare
                        checkDict.value = row.check[x][1]
                    }

                } else {
                    checkDict.compare = '等于'
                    checkDict.s = '=='
                    checkDict.value = row.check[x]
                    checkDict.type = row.check[x] == null ? "null" : typeof row.check[x]
                }
                if (checkDict.value == null) {
                    checkDict.value = 'null'
                }
                // 颜色
                if (checkDict.type == 'string') {
                    checkDict.color = 'success'
                } else if (checkDict.type == 'number') {
                    checkDict.color = 'primary'
                } else if (checkDict.type == 'boolean') {
                    checkDict.color = 'warning'
                } else if (checkDict.type == 'null') {
                    checkDict.color = 'danger'
                } else {
                    checkDict.color = 'info'
                }
                // 添加到数组
                this.checkInfo.push(checkDict)
                num++
            }
            this.checkDialog = true
            this.handleTabClick(this.tabName)
        },
        // 新增row
        addRow(myType) {
            if (myType == 'check') {
                this.checkInfo.push({
                    compare: '等于',
                    key: '',
                    s: '==',
                    value: null,
                    del: false,
                    edit: true,
                    type: 'string',
                    color: '',
                    num: this.checkInfo.length
                })
            } else {
                this.headerInfo.push({
                    key: '',
                    value: null,
                    del: false,
                    edit: true,
                    num: this.headerInfo.length
                })
            }

        },
        // 编辑的判断
        myEdit(row) {
            row.edit = true
            row.delDisabled = true
        },
        // 取消操作
        myClose(row) {
            row.edit = false
            row.delDisabled = false
            row.del = false
            row.EditDisabled = false
        },
        // 删除的判断
        checkDel(row) {
            row.EditDisabled = true
            if (row.key == null || row.key == '') {
                var num = 0
                for (var x in this.checkInfo) {
                    if (this.checkInfo[x].num == row.num) {
                        this.checkInfo.splice(num, 1)
                    }
                    num++
                }
            } else {
                row.del = true
            }
        },
        // header删除的判断
        headerDel(row) {
            row.EditDisabled = true
            if (row.key == null || row.key == '') {
                var num = 0
                for (var x in this.headerInfo) {
                    if (this.headerInfo[x].num == row.num) {
                        this.headerInfo.splice(num, 1)
                    }
                    num++
                }
            } else {
                row.del = true
            }
        },
        // 编辑的Check的确认
        async checkCheck(row, myType) {
            var flag = false
            await this.$http({
                url: '/caseService/set/api/check',
                method: 'PUT',
                data: JSON.stringify({
                    case_id: this.caseId,
                    number: this.checkNumber,
                    type: myType,
                    check: {
                        key: row.key,
                        s: row.s,
                        type: row.type,
                        value: row.value,
                    }
                }),
                headers: {
                    'content-type': "application/json"
                }
            }).then(
                function () {
                    flag = true
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

            if (flag) {
                row.edit = false
                row.delDisabled = false
                row.EditDisabled = false
                if (myType == 'edit') {
                    // 判断key出现的次数
                    var num = 0
                    for (var x in this.checkInfo) {
                        if (this.checkInfo[x].key == row.key) {
                            num++
                        }
                        // 颜色
                        if (this.checkInfo[x].type == 'string') {
                            this.checkInfo[x].color = 'success'
                        } else if (this.checkInfo[x].type == 'number') {
                            this.checkInfo[x].color = 'primary'
                        } else if (this.checkInfo[x].type == 'boolean') {
                            this.checkInfo[x].color = 'warning'
                        } else if (this.checkInfo[x].type == 'null') {
                            this.checkInfo[x].color = 'danger'
                        } else {
                            this.checkInfo[x].color = 'info'
                        }
                    }
                    // key超出2次就删掉最前面的一个
                    if (num >= 2) {
                        for (var x in this.checkInfo) {
                            if (this.checkInfo[x].key == row.key) {
                                this.checkInfo.splice(x, 1)
                                break
                            }
                        }
                    }
                } else {
                    // 删除逻辑
                    for (var x in this.checkInfo) {
                        if (this.checkInfo[x].key == row.key) {
                            this.checkInfo.splice(x, 1)
                            break
                        }
                    }
                }
            }
            this.renovate = true
        },
        // 关闭校验弹窗
        async closeCheckDialog(type_) {
            this.dataLength = 5
            this.checkDialog = false
            this.checkInfo = []
            this.headerDialog = false
            this.headerInfo = []
            var responseData = null
            if (!this.renovate) {
                return
            }
            await this.$http({
                url: '/caseService/query/api/info',
                method: 'GET',
                params: {
                    case_id: this.caseId,
                    number: this.checkNumber,
                }
            }).then(
                function (response) {
                    responseData = response.data
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            for (var x in this.caseData) {
                if (this.checkNumber == this.caseData[x].number) {
                    if (type_ == 'Check') {
                        this.caseData[x].check = responseData.check
                    } else if (type_ == 'Params') {
                        this.caseData[x].params = responseData.params
                    } else if (type_ == 'Data') {
                        this.caseData[x].data = responseData.data
                    } else if (type_ == 'Header') {
                        this.caseData[x].headers = responseData.headers
                    }
                    break
                }
            }
            ElNotification.success({
                title: 'Success',
                message: 'CaseId : ' + this.caseId + ' -Number : ' + this.checkNumber + ' 刷新成功',
            })
            this.renovate = false
            this.tempResponse = null
            this.caseResponse = null
        },

        indexMethod(index) {
            return this.caseData[index]['number']
        },

        // 修改描述的接口
        async checkDescription(row) {
            row.descriptionLoading = true
            await this.$http({
                url: '/caseService/set/api/description',
                method: 'PUT',
                data: JSON.stringify({
                    case_id: this.caseId,
                    number: row.number,
                    description: row.description
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
            row.descriptionLoading = false
            row.edit = true
        },

        // 配置项设置方法
        async setConfigStatus(row, config) {
            var newConfig = {}
            var stopMsg = row.config.stop ? '开启主动结束' : '关闭主动结束'
            var failStopMsg = row.config.fail_stop ? '开启失败停止' : '关闭失败停止'
            var isLoginMsg = row.config.is_login ? '登录标记' : '取消登录标记'
            if (config == 'stop') {
                newConfig.stop = row.config.stop
                row.stopLoading = true
            } else if (config == 'fail_stop') {
                newConfig.fail_stop = row.config.fail_stop
                row.failStopLoading = true
            } else if (config == 'is_login') {
                newConfig.is_login = row.config.is_login
                row.isLoginLoading = true
            } else if (config == 'sleep') {
                newConfig.sleep = row.config.sleep
                row.sleepLoading = true
            }
            await this.$http({
                url: '/caseService/set/api/config',
                method: "PUT",
                data: JSON.stringify({
                    case_id: this.caseId,
                    number: row.number,
                    config: newConfig
                }),
                headers: {
                    'content-type': "application/json"
                }
            }).then(
                function () {
                    if (config == 'stop') {
                        row.stopLoading = false
                        ElNotification.success({
                            title: 'Success',
                            message: 'number:' + row.number + ' ' + stopMsg,
                            offset: 200,
                        })
                    } else if (config == 'fail_stop') {
                        row.failStopLoading = false
                        ElNotification.success({
                            title: 'Success',
                            message: 'number:' + row.number + ' ' + failStopMsg,
                            offset: 200,
                        })
                    } else if (config == 'is_login') {
                        row.isLoginLoading = false
                        ElNotification.success({
                            title: 'Success',
                            message: 'number:' + row.number + ' ' + isLoginMsg,
                            offset: 200,
                        })
                    } else if (config == 'sleep') {
                        row.sleepLoading = false
                        ElNotification.success({
                            title: 'Success',
                            message: 'number:' + row.number + ' ' + row.config.sleep + 's',
                            offset: 200,
                        })
                    }
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
            })
        },

        // 修改params/data数据
        async setParamsData(type_) {
            try {
                var dataInfo = JSON.parse(this.dataInfo)
            } catch (e) {
                ElMessage.error('Json数据格式有误, 未提交')
                return
            }
            await this.$http({
                url: '/caseService/set/api/params/data',
                method: 'PUT',
                data: JSON.stringify({
                    case_id: this.caseId,
                    number: this.checkNumber,
                    type: type_,
                    data_info: dataInfo
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
            this.renovate = true
        }
    }
}
</script>
