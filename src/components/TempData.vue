<template>
    <!-- 增加操作 -->
    <el-button v-if="tempData.length <= 0" :icon="Plus" type="warning" size="small" @click="addOne"></el-button>
    <el-table v-loading='loading' :data="tempData" stripe fit v-if="tempData.length != 0">
        <el-table-column label="number" prop="number" type="index" :index="indexMethod" width="80px"
            align="center"></el-table-column>
        <el-table-column label="host" prop="host" width="300px"></el-table-column>
        <el-table-column label="description" prop="description" width="300px"></el-table-column>
        <el-table-column label="path" prop="path" width="300px"></el-table-column>
        <el-table-column label="method" prop="method" width="100%" align="center"></el-table-column>
        <el-table-column label="code" prop="code" width="100%" align="center"></el-table-column>
        <el-table-column label="json_body" prop="json_body" width="100%" align="center"></el-table-column>
        <el-table-column label="params" prop="params" show-overflow-tooltip='true' width="100%">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.params, null, 1) }}</div>
            </template>
        </el-table-column>
        <el-table-column label="data" prop="data" show-overflow-tooltip='true' width="100%">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.data, null, 1) }}</div>
            </template>
        </el-table-column>
        <el-table-column label="headers" prop="headers" show-overflow-tooltip='true' width="100%">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.headers, null, 1) }}</div>
            </template>
        </el-table-column>
        <el-table-column label="response" prop="response" show-overflow-tooltip='true' width="100%">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.response, null, 1) }}</div>
            </template>
        </el-table-column>
        <el-table-column label="res_headers" prop="response_headers" show-overflow-tooltip='true' width="110%">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.response_headers, null, 1) }}</div>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="scope">
                <!-- 编辑操作 -->
                <el-button :icon="Edit" type="primary" size="small" v-if="!scope.row.edit && !scope.row.EditDisabled"
                    :disabled="scope.row.EditDisabled" @click="editTemp(scope)"></el-button>
                <el-button :icon="Check" type="success" size="small" v-if="scope.row.edit" :loading="scope.row.checkLoading"
                    @click="editTemp(scope, 'edit')"></el-button>
                <el-button :icon="Close" type="success" size="small" v-if="scope.row.EditDisabled"
                    @click="myClose(scope)"></el-button>
                <!-- 增加操作 -->
                <el-button :icon="Plus" type="warning" size="small" @click="addTemp(scope)"></el-button>
                <!-- 删除操作 -->
                <el-button :icon="Delete" type="danger" size="small" v-if="!scope.row.del && !scope.row.delDisabled"
                    :disabled="scope.row.delDisabled" @click="delTemp(scope)"></el-button>
                <el-button :icon="Check" type="success" size="small" v-if="scope.row.del" :loading="scope.row.delLoading"
                    @click="delTemp(scope, 'del')"></el-button>
                <el-button :icon="Close" type="success" size="small" v-if="scope.row.delDisabled"
                    @click="myClose(scope)"></el-button>

            </template>
        </el-table-column>
    </el-table>
    <!-- 新增修改数据的弹窗 -->
    <el-dialog class="case-data" v-model='tempDialog' width="50%" :title="tempTitle" :close-on-click-modal=false
        @close="closeTempDialog(tempInfo)" draggable v-if="tempDialog">
        <el-form v-model="tempInfo" label-width="75px">
            <el-form-item label="Host" :required="true">
                <el-input v-model="tempInfo.host" spellcheck="false"></el-input>
            </el-form-item>
            <el-form-item label="Path" :required="true">
                <el-input v-model="tempInfo.path" spellcheck="false"></el-input>
            </el-form-item>
            <el-form-item label="Method" :required="true">
                <el-select v-model="tempInfo.method" placeholder="Method" style="width: 115px">
                    <el-option label="GET" value="GET" />
                    <el-option label="POST" value="POST" />
                    <el-option label="PUT" value="PUT" />
                    <el-option label="DELETE" value="DELETE" />
                    <el-option label="HEAD" value="HEAD" />
                    <el-option label="OPTIONS" value="OPTIONS" />
                    <el-option label="PATCH" value="PATCH" />
                </el-select>
            </el-form-item>
            <el-form-item label="Code" :required="true">
                <el-input v-model="tempInfo.code" style="width: 115px"></el-input>
            </el-form-item>
            <el-form-item label="Description" prop="description">
                <el-input v-model="tempInfo.description"></el-input>
            </el-form-item>
            <el-form-item label="JsonBody" :required="true">
                <el-select v-model="tempInfo.json_body" placeholder="body" style="width: 115px">
                    <el-option label="body" value="body" />
                    <el-option label="json" value="json" />
                </el-select>
            </el-form-item>
            <el-button type="info" @click="curlDialog = true">cURL</el-button>
            <el-button type="info" @click="initData()">初始化</el-button>
            <el-button type="info" @click="formatData()">格式化</el-button>
            <el-button type="warning" @click="emptyData()">清空数据</el-button>
            <el-button type="primary" @click="confirmData()">保存</el-button>
            <div class="debugInfo">
                <el-checkbox v-model="getCookie" label="提取Cookie" border :style="{ float: 'right' }" />
                <el-button type="primary" @click="sendData()" :loading="sendLoading"
                    :style="{ float: 'right' }">发送</el-button>
                <el-button type="warning" @click="delData()" :loading="delLoading"
                    :style="{ float: 'right' }">清空缓存</el-button>
            </div>
            <br>
            <br>
            <el-input v-model="responseValueInput" placeholder="请输入需要查找的原始数据" clearable minlength="3"
                @keyup.enter.native="getResponseJsonPath">
                <template #prepend>
                    <el-space wrap :size="40">
                        <el-select v-model="type_" placeholder="response" style="width: 110px">
                            <el-option label="headers" value="headers" />
                            <el-option label="response" value="response" />
                        </el-select>
                    </el-space>
                    <el-space wrap :size="40">
                        <el-select v-model="key_value" placeholder="value" style="width: 85px">
                            <el-option label="value" value="value" />
                            <el-option label="key" value="key" />
                        </el-select>
                    </el-space>
                    <el-space wrap :size="20">
                        <el-select v-model="ext_type" placeholder="==" style="width: 65px">
                            <el-option label="==" value="==" />
                            <el-option label="in" value="in" />
                        </el-select>
                    </el-space>
                </template>
                <template #append>
                    <el-button plain @click="getResponseJsonPath" style="width: 100px">查询</el-button>
                </template>
            </el-input>
            <el-input v-model="jsonPath" placeholder="jsonpath" clearable></el-input>
            <br>
            <br>
            <el-tabs v-model="activeName" type="border-card">
                <el-tab-pane label="Params" name="Params">
                    <el-input type="textarea" v-model="params" :rows="paramsLen" spellcheck="false"></el-input>
                </el-tab-pane>
                <el-tab-pane label="Data" name="Data">
                    <el-input type="textarea" v-model="data" :rows="dataLen" spellcheck="false"></el-input>
                </el-tab-pane>
                <el-tab-pane label="Headers" name="Headers">
                    <el-input type="textarea" v-model="headers" :rows="headersLen" spellcheck="false"></el-input>
                </el-tab-pane>
                <el-tab-pane label="Response" name="Response">
                    <el-input type="textarea" v-model="response" :rows="responseLen" spellcheck="false"></el-input>
                </el-tab-pane>
                <el-tab-pane label="ResponseHeaders" name="response_headers">
                    <el-input type="textarea" v-model="response_headers" :rows="response_headersLen"
                        spellcheck="false"></el-input>
                </el-tab-pane>
                <el-tab-pane label="Cookie" name="Cookie" v-if="getCookie">
                    <el-input type="textarea" v-model="cookie" rows="15" spellcheck="false"></el-input>
                </el-tab-pane>
            </el-tabs>
        </el-form>
    </el-dialog>
    <!-- 解析CURL弹窗 -->
    <el-dialog class="case-data" v-model='curlDialog' width="50%" title="解析cURL(bash)" draggable @close="curlData = ''">
        <el-input type="textarea" v-model="curlData" rows="16" spellcheck="false"></el-input>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="curlDialog = false">取消</el-button>
                <el-button type="primary" :loading="curlLoading" @click="curlHeader()">确认</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script>
import { ElMessage, ElNotification } from 'element-plus'
import { Edit, Check, Plus, Delete, Close } from '@element-plus/icons-vue'
import VueJsonPretty from 'vue-json-pretty'
import _ from 'lodash'
export default {
    name: 'TempData',

    components: {
        VueJsonPretty
    },

    props: {
        'tempData': Array,
        'tempId': Number
    },

    data() {
        return {
            Edit,
            Check,
            Plus,
            Delete,
            Close,
            tempDialog: false,
            tempTitle: '',
            tempInfo: {},
            tempRow: {},
            tempInit: {
                temp_id: this.tempId,
                number: 0,
                host: '',
                path: '',
                method: 'GET',
                code: 200,
                json_body: 'body',
                params: {},
                data: {},
                headers: {},
                response: {},
                response_headers: {},
                edit: false,
                EditDisabled: false,
                del: false,
                delDisabled: false,
                add: true
            },

            // json
            activeName: 'Params',
            params: {},
            data: {},
            jsonBody: '',
            headers: {},
            response: {},
            response_headers: {},
            cookie: '',
            paramsLen: 0,
            dataLen: 0,
            headersLen: 0,
            responseLen: 0,
            response_headersLen: 0,
            tempNumber: null,

            curlDialog: false,
            curlLoading: false,
            curlData: '',
            sendLoading: false,
            delLoading: false,
            getCookie: false,

            type_: 'response',
            key_value: 'value',
            ext_type: '==',
            responseValueInput: '',
            jsonPath: ''
        }
    },


    methods: {
        // 获取jsonpath接口
        async getResponseJsonPath() {
            if (this.responseValueInput.length < 3) {
                ElMessage.warning('最小长度: 3')
                return
            }

            var jsonPath = ''
            await this.$http({
                url: '/template/response/jsonpath/list',
                method: 'GET',
                params: {
                    temp_id: this.tempId,
                    number: this.tempNumber,
                    extract_contents: this.responseValueInput,
                    type_: this.type_,
                    key_value: this.key_value,
                    ext_type: this.ext_type
                }
            }).then(
                function (response) {
                    if (response.data != '{}' && response.data.extract_contents.length > 0) {
                        jsonPath = response.data.extract_contents[0].jsonpath
                    }
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            this.jsonPath = jsonPath
        },
        addOne() {
            this.tempData.push(_.cloneDeep(this.tempInit))
        },
        // 解析curl
        async curlHeader() {
            this.curlLoading = true
            var data = {}
            await this.$http({
                url: '/template/upload/curl',
                method: 'POST',
                data: JSON.stringify({
                    'curl_command': this.curlData
                }),
                headers: {
                    'content-type': "application/json"
                }
            }).then(
                function (response) {
                    data = response.data
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            // 用tempInfo 
            this.tempInfo.host = data.host
            this.tempInfo.path = data.path
            this.tempInfo.method = data.method
            this.tempInfo.json_body = data.json_body

            this.params = JSON.stringify(data.params, null, 8)
            this.data = JSON.stringify(data.data, null, 8)
            this.headers = JSON.stringify(data.headers, null, 8)

            this.curlLoading = false
            this.curlDialog = false
        },
        // 新增数据接口
        addTemp(scope) {
            var tempInfo = {
                temp_id: scope.row.temp_id,
                number: scope.$index + 1,
                host: '',
                path: '',
                method: 'GET',
                code: 200,
                json_body: 'body',
                params: {},
                data: {},
                headers: {},
                response: {},
                response_headers: {},
                description: '',
                edit: false,
                EditDisabled: false,
                del: false,
                delDisabled: false,
                add: true
            }
            this.tempData.splice(scope.$index + 1, 0, tempInfo)
        },
        // 修改数据接口
        async editTemp(scope, type) {
            scope.row.index = scope.$index
            this.tempNumber = scope.row.number
            this.tempRow = scope.row
            this.tempInfo = _.cloneDeep(scope.row)

            this.params = JSON.stringify(this.tempInfo.params, null, 8)
            this.data = JSON.stringify(this.tempInfo.data, null, 8)
            this.headers = JSON.stringify(this.tempInfo.headers, null, 8)
            this.response = JSON.stringify(this.tempInfo.response, null, 8)
            this.response_headers = JSON.stringify(this.tempInfo.response_headers, null, 8)
            this.jsonBody = this.tempInfo.json_body
            this.paramsLen = 15
            this.dataLen = 15
            this.headersLen = 15
            this.responseLen = 15
            this.response_headersLen = 15

            this.tempTitle = '对模板接口数据查看或编辑'
            if (type == 'edit') {
                scope.row.checkLoading = true

                var tempInfo = {
                    temp_id: this.tempId,
                    number: this.tempInfo.number,
                    host: this.tempInfo.host,
                    path: this.tempInfo.path,
                    code: this.tempInfo.code,
                    method: this.tempInfo.method,
                    params: this.tempInfo.params,
                    json_body: this.tempInfo.json_body,
                    data: this.tempInfo.data,
                    file: false,
                    file_data: [],
                    headers: this.tempInfo.headers,
                    response: this.tempInfo.response,
                    response_headers: this.tempInfo.response_headers,
                    description: this.tempInfo.description
                }
                if (this.tempInfo.add) {
                    await this.$http({
                        url: '/template/add/api',
                        method: 'PUT',
                        data: JSON.stringify(tempInfo),
                        headers: {
                            'content-type': "application/json"
                        }
                    }).then(
                        function () {
                            ElNotification.success({
                                title: 'Success',
                                message: '新增成功',
                            })
                        }
                    ).catch(
                        function (error) {
                            ElMessage.error(error.message)
                        }
                    )
                    // 刷新列表
                    this.getTempData()

                } else {
                    await this.$http({
                        url: '/template/edit/api',
                        method: 'PUT',
                        data: JSON.stringify(tempInfo),
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
                }

                scope.row.edit = false
                scope.row.delDisabled = false
                scope.row.checkLoading = false
            } else {
                this.tempDialog = true
            }
        },
        // 确认数据
        confirmData() {
            try {
                this.tempInfo.params = JSON.parse(this.params)
                this.tempInfo.data = JSON.parse(this.data)
                this.tempInfo.headers = JSON.parse(this.headers)
                this.tempInfo.response = JSON.parse(this.response)
                this.tempInfo.response_headers = JSON.parse(this.response_headers)
            } catch {
                ElMessage.error('Json数据格式有误')
                return
            }

            this.tempDialog = false
            if (this.tempInfo.host && this.tempInfo.path) {
                this.tempInfo.edit = true
                this.tempInfo.delDisabled = true

                // var len = 0
                // for (var i in this.tempInfo.data) {
                //     len++
                // }

                // if (len > 0) {
                //     this.tempInfo.json_body = 'json'
                // } else {
                //     this.tempInfo.json_body = 'body'
                // }
                this.tempData.splice(this.tempInfo.index, 1, this.tempInfo)
            }
        },
        // 删除数据接口
        async delTemp(scope, type) {
            if (type == 'del') {
                scope.row.delLoading = true
                await this.$http({
                    url: '/template/del/api',
                    method: 'DELETE',
                    params: {
                        temp_id: this.tempId,
                        number: scope.row.number
                    }
                }).then(
                    function () {
                        ElNotification.success({
                            title: 'Success',
                            message: '删除成功',
                        })
                    }
                ).catch(
                    function (error) {
                        ElMessage.error(error.message)
                    }
                )
                scope.row.delLoading = false
                // 刷新列表
                this.getTempData()
                scope.row.del = false
                scope.row.EditDisabled = false
            } else {
                if (scope.row.host == '' && scope.row.path == '') {
                    for (var x in this.tempData) {
                        if (x == scope.$index) {
                            this.tempData.splice(x, 1)
                            break
                        }
                    }
                }
                scope.row.del = true
                scope.row.EditDisabled = true
            }
        },
        // 更新列表
        async getTempData() {
            console.log('刷新列表');
            this.tempData.splice(0, this.tempData.length);
            var temp_ = []
            await this.$http.get('/template/data/list?temp_id=' + this.tempId).then(
                function (response) {
                    temp_ = response.data
                    for (var x in temp_) {
                        temp_[x].edit = false
                        temp_[x].EditDisabled = false
                        temp_[x].del = false
                        temp_[x].delDisabled = false
                    }
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
            })
            for (var x in temp_) {
                this.tempData.push(temp_[x])
            }
        },
        // 初始化数据
        initData() {
            try {
                if (this.activeName == 'Params') {
                    this.params = JSON.stringify(this.tempInfo.params, null, 8);
                } else if (this.activeName == 'Data') {
                    this.data = JSON.stringify(this.tempInfo.data, null, 8);
                } else if (this.activeName == 'Headers') {
                    this.headers = JSON.stringify(this.tempInfo.headers, null, 8);
                } else if (this.activeName == 'Response') {
                    this.response = JSON.stringify(this.tempInfo.response, null, 8);
                } else if (this.activeName == 'response_headers') {
                    this.response_headers = JSON.stringify(this.tempInfo.response_headers, null, 8);
                }
                ElMessage.success('数据初始化成功')
            } catch (e) {
                ElMessage.error('数据初始化失败，格式有误')
            }
        },
        // 格式化数据
        formatData() {
            try {
                if (this.activeName == 'Params') {
                    this.params = JSON.stringify(JSON.parse(this.params), null, 8);
                } else if (this.activeName == 'Data') {
                    this.data = JSON.stringify(JSON.parse(this.data), null, 8);
                } else if (this.activeName == 'Headers') {
                    this.headers = JSON.stringify(JSON.parse(this.headers), null, 8);
                } else if (this.activeName == 'Response') {
                    this.response = JSON.stringify(JSON.parse(this.response), null, 8);
                } else if (this.activeName == 'response_headers') {
                    this.response_headers = JSON.stringify(JSON.parse(this.response_headers), null, 8);
                }
                ElMessage.success('数据格式化成功')
            } catch (e) {
                ElMessage.error('数据格式化失败，格式有误')
            }
        },
        // 清空数据
        emptyData() {
            this.dataInfo = JSON.stringify({}, null, 8);
            if (this.activeName == 'Params') {
                this.params = JSON.stringify({}, null, 8);
            } else if (this.activeName == 'Data') {
                this.data = JSON.stringify({}, null, 8);
            } else if (this.activeName == 'Headers') {
                this.headers = JSON.stringify({}, null, 8);
            } else if (this.activeName == 'Response') {
                this.response = JSON.stringify({}, null, 8);
            } else if (this.activeName == 'response_headers') {
                this.response_headers = JSON.stringify({}, null, 8);
            }
        },
        // 清空缓存
        async delData() {
            this.delLoading = true
            await this.$http({
                url: '/template/del/debug/info',
                method: 'DELETE',
                params: {
                    temp_id: this.tempId
                },
            }).then(
                function () {
                    ElNotification.success({
                        title: 'Success',
                        message: '清除成功',
                    })
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            this.delLoading = false
        },
        // 发送数据
        async sendData() {
            var flag = false
            var resP = null
            var resH = null
            var cookie = ''

            try {
                this.tempInfo.params = JSON.parse(this.params)
                this.tempInfo.data = JSON.parse(this.data)
                this.tempInfo.headers = JSON.parse(this.headers)
                this.tempInfo.get_cookie = this.getCookie
            } catch {
                ElMessage.error('Json数据格式有误')
                return
            }
            this.sendLoading = true

            await this.$http({
                url: '/template/send/api',
                method: 'POST',
                params: {
                    get_cookie: this.tempInfo.get_cookie
                },
                data: JSON.stringify(this.tempInfo),
                headers: {
                    'content-type': "application/json"
                }
            }).then(
                function (response) {
                    flag = true
                    resP = response.data.data.response
                    resH = response.data.data.response_headers
                    console.log(response.data.data);
                    cookie = response.data.data.cookie
                    if (response.data.data.status <= 400) {
                        ElNotification.success({
                            title: 'Success',
                            message: '请求成功',
                        })
                    } else {
                        ElNotification.warning({
                            title: 'Warning',
                            message: '请求失败, status: ' + response.data.data.status,
                        })
                    }
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )

            if (flag) {
                this.response = JSON.stringify(resP, null, 8)
                this.response_headers = JSON.stringify(resH, null, 8)
                this.activeName = 'Response'
                this.cookie = cookie
            }

            this.sendLoading = false
        },

        // 关闭窗口
        closeTempDialog(row) {
            row.del = false
            row.EditDisabled = false
            this.getCookie = false
            this.activeName = 'Params'
            this.type_ = 'response'
            this.key_value = 'value'
            this.ext_type = '=='
            this.responseValueInput = ''
            this.jsonPath = ''
        },
        // 取消操作
        myClose(scope) {
            if (scope.row.edit && scope.row.add) {
                this.tempData.splice(scope.$index, 1)
            }
            scope.row.edit = false
            scope.row.delDisabled = false
            scope.row.del = false
            scope.row.EditDisabled = false
        },
        indexMethod(index) {
            return this.tempData[index]['number']
        }
    }
}

</script>

<style scoped>
.container {
    display: flex;
    justify-content: flex-end;
}

.debugInfo {
    display: inline;
}
</style>