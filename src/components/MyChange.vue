<template>
    <el-form-item :inline="true">
        <el-input v-model="urlMethodInput" placeholder="请输入需要查找的URL" clearable minlength="3">
            <template #prepend>
                <el-select v-model="select" placeholder="Method" style="width: 115px">
                    <el-option label="GET" value="GET" />
                    <el-option label="POST" value="POST" />
                    <el-option label="PUT" value="PUT" />
                    <el-option label="DELETE" value="DELETE" />
                    <el-option label="HEAD" value="HEAD" />
                    <el-option label="OPTIONS" value="OPTIONS" />
                    <el-option label="PATCH" value="PATCH" />
                </el-select>
            </template>
            <template #append>
                <el-button plain @click="getAllInfo()">全局查询</el-button>
            </template>
        </el-input>
    </el-form-item>
    <!-- 字段变更查询数据列表 -->
    <el-table :data="changeTempData" stripe fit v-show="changeTempData.length > 0">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="TempName" prop="temp_name" width="300px" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column label="Url" prop="path" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column label="TempId" prop="temp_id" width="100px" align="center"></el-table-column>
        <el-table-column label="Number" prop="number" width="100px" align="center"></el-table-column>
        <el-table-column label="多选" width="70px" align="center">
            <template #default="scope">
                <el-checkbox v-model=scope.row.checkbox @click.prevent="changeBoxClick(scope.row)" />
            </template>
        </el-table-column>
    </el-table>
    <br>
    <!-- 复选框的按钮 -->
    <el-radio-group v-model="tableLayout" v-show="primaryUrl.length > 0">
        <el-radio-button label="url" />
        <el-radio-button label="params" />
        <el-radio-button label="data" />
    </el-radio-group>
    <br>
    <br>
    <!-- URL的替换操作 -->
    <div v-show="tableLayout == 'url' && primaryUrl.length > 0">
        <el-input v-model="changeUrlInput" placeholder="">
            <template #prepend>变更的URL</template>
        </el-input>
        <el-table :data="primaryUrl" :cell-style="urlColumnColor">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="把这个url" prop="path" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="改成这样">
                <el-input v-model="changeUrlInput" placeholder="" disabled></el-input>
            </el-table-column>
            <el-table-column label="temp_id" prop="temp_id" width="100px" align="center"></el-table-column>
            <el-table-column label="case_id" prop="case_id" width="100px" align="center"></el-table-column>
            <el-table-column label="number" prop="number" width="100px" align="center"></el-table-column>
            <el-table-column label="操作" width="75px">
                <template #default="scope">
                    <el-switch v-model="scope.row.repUrl" active-text="变更" inactive-text="未变更"
                        :loading="scope.row.loadingUrlEdit" style="--el-switch-on-color: #67C23A;"
                        @click="repCaseData(scope.row, 'url', 'edit')" inline-prompt></el-switch>
                </template>
            </el-table-column>
        </el-table>
    </div>
    <!-- params的替换操作 -->
    <div v-show="tableLayout == 'params' && primaryParams.length > 0">
        <el-radio-group v-model="paramsTableLayout" style="display:block">
            <el-radio-button label="add" />
            <el-radio-button label="edit" />
            <el-radio-button label="del" />
        </el-radio-group>
        <br>
        <el-input v-model="changeParamsAddInput" placeholder="查找的key.插入的key" v-if="paramsTableLayout == 'add'"
            style="display:inline">
            <template #prepend>表达式</template>
        </el-input>&nbsp;
        <el-input v-model="changeParamsAddInputValue" placeholder="默认Null" v-if="paramsTableLayout == 'add'"
            style="display:inline">
            <template #prepend>值</template>
        </el-input>

        <el-input v-model="changeParamsDelInput" placeholder="key字段" v-if="paramsTableLayout == 'del'"
            style="display:inline">
            <template #prepend>需要删除的key</template>
        </el-input>
        <el-input v-model="changeParamsEditInputA" placeholder="testOne" v-if="paramsTableLayout == 'edit'"
            style="display:inline">
            <template #prepend>把这个key</template>
        </el-input>&nbsp;
        <el-input v-model="changeParamsEditInputB" placeholder="testTwo" v-if="paramsTableLayout == 'edit'"
            style="display:inline">
            <template #prepend>改为</template>
        </el-input>&nbsp;
        <el-input v-model="changeParamsEditInputC" placeholder="默认Null" v-if="paramsTableLayout == 'edit'"
            style="display:inline">
            <template #prepend>value</template>
        </el-input>

        <el-table :data="primaryParams" v-show="paramsTableLayout == 'add'" :cell-style="addColumnColor">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="预览" width="80px" :show-overflow-tooltip="true">
                <template #default="scope">
                    <div>{{ JSON.stringify(scope.row.params, null, 1) }}</div>
                </template>
            </el-table-column>
            <el-table-column label="key">
                <el-input v-model="changeParamsAddInput" placeholder="" disabled></el-input>
            </el-table-column>
            <el-table-column label="value">
                <el-input v-model="changeParamsAddInputValue" placeholder="" disabled></el-input>
            </el-table-column>
            <el-table-column label="temp_id" prop="temp_id" align="center"></el-table-column>
            <el-table-column label="case_id" prop="case_id" align="center"></el-table-column>
            <el-table-column label="number" prop="number" align="center"></el-table-column>
            <el-table-column label="操作" width="75px">
                <template #default="scope">
                    <el-switch v-model="scope.row.repParamsAdd" active-text="插入" inactive-text="未插入"
                        :loading="scope.row.loadingParamsAdd" style="--el-switch-on-color: #67C23A;"
                        @click="repCaseData(scope.row, 'params', 'add')" inline-prompt></el-switch>
                </template>
            </el-table-column>
        </el-table>
        <el-table :data="primaryParams" v-show="paramsTableLayout == 'edit'" :cell-style="editColumnColor">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="预览" width="80px" :show-overflow-tooltip="true">
                <template #default="scope">
                    <div>{{ JSON.stringify(scope.row.params, null, 1) }}</div>
                </template>
            </el-table-column>
            <el-table-column label="把这个key">
                <el-input v-model="changeParamsEditInputA" placeholder="" disabled></el-input>
            </el-table-column>
            <el-table-column label="改为这个key">
                <el-input v-model="changeParamsEditInputB" placeholder="" disabled></el-input>
            </el-table-column>
            <el-table-column label="value">
                <el-input v-model="changeParamsEditInputC" placeholder="" disabled></el-input>
            </el-table-column>
            <el-table-column label="temp_id" prop="temp_id" align="center"></el-table-column>
            <el-table-column label="case_id" prop="case_id" align="center"></el-table-column>
            <el-table-column label="number" prop="number" align="center"></el-table-column>
            <el-table-column label="操作" width="75px">
                <template #default="scope">
                    <el-switch v-model="scope.row.repParamsEdit" active-text="修改" inactive-text="未修改"
                        :loading="scope.row.loadingParamsEdit" style="--el-switch-on-color: #67C23A;"
                        @click="repCaseData(scope.row, 'params', 'edit')" inline-prompt></el-switch>
                </template>
            </el-table-column>
        </el-table>
        <el-table :data="primaryParams" v-show="paramsTableLayout == 'del'" :cell-style="delColumnColor">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="预览" width="80px" :show-overflow-tooltip="true">
                <template #default="scope">
                    <div>{{ JSON.stringify(scope.row.params, null, 1) }}</div>
                </template>
            </el-table-column>
            <el-table-column label="将这个key删除掉">
                <el-input v-model="changeParamsDelInput" placeholder="" disabled></el-input>
            </el-table-column>
            <el-table-column label="temp_id" prop="temp_id" align="center"></el-table-column>
            <el-table-column label="case_id" prop="case_id" align="center"></el-table-column>
            <el-table-column label="number" prop="number" align="center"></el-table-column>
            <el-table-column label="操作" width="75px">
                <template #default="scope">
                    <el-switch v-model="scope.row.repParamsDel" active-text="删除" inactive-text="未删除"
                        :loading="scope.row.loadingParamsDel" style="--el-switch-on-color: #67C23A;"
                        @click="repCaseData(scope.row, 'params', 'del')" inline-prompt></el-switch>
                </template>
            </el-table-column>
        </el-table>
    </div>
    <!-- data的替换操作 -->
    <div v-show="tableLayout == 'data' && primaryData.length > 0">
        <el-radio-group v-model="dataTableLayout" style="display:block">
            <el-radio-button label="add" />
            <el-radio-button label="edit" />
            <el-radio-button label="del" />
        </el-radio-group>
        <br>
        <el-input v-model="changeDataAddInput" placeholder="查找的key.插入的key" v-if="dataTableLayout == 'add'"
            style="display:inline">
            <template #prepend>表达式</template>
        </el-input>&nbsp;
        <el-input v-model="changeDataAddInputValue" placeholder="默认Null" v-if="dataTableLayout == 'add'"
            style="display:inline">
            <template #prepend>值</template>
        </el-input>
        <el-input v-model="changeDataDelInput" placeholder="key字段" v-if="dataTableLayout == 'del'" style="display:inline">
            <template #prepend>需要删除的key</template>
        </el-input>
        <el-input v-model="changeDataEditInputA" placeholder="testOne" v-if="dataTableLayout == 'edit'"
            style="display:inline">
            <template #prepend>把这个key</template>
        </el-input>&nbsp;
        <el-input v-model="changeDataEditInputB" placeholder="testTwo" v-if="dataTableLayout == 'edit'"
            style="display:inline">
            <template #prepend>改为</template>
        </el-input>&nbsp;
        <el-input v-model="changeDataEditInputC" placeholder="默认Null" v-if="dataTableLayout == 'edit'"
            style="display:inline">
            <template #prepend>value</template>
        </el-input>

        <el-table :data="primaryData" v-show="dataTableLayout == 'add'" :cell-style="addColumnColor">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="预览" width="80px" :show-overflow-tooltip="true">
                <template #default="scope">
                    <div>{{ JSON.stringify(scope.row.data, null, 1) }}</div>
                </template>
            </el-table-column>
            <el-table-column label="key">
                <el-input v-model="changeDataAddInput" placeholder="" disabled></el-input>
            </el-table-column>
            <el-table-column label="value">
                <el-input v-model="changeDataAddInputValue" placeholder="" disabled></el-input>
            </el-table-column>
            <el-table-column label="temp_id" prop="temp_id" align="center"></el-table-column>
            <el-table-column label="case_id" prop="case_id" align="center"></el-table-column>
            <el-table-column label="number" prop="number" align="center"></el-table-column>
            <el-table-column label="操作" width="75px">
                <template #default="scope">
                    <el-switch v-model="scope.row.repDataAdd" active-text="插入" inactive-text="未插入"
                        :loading="scope.row.loadingDataAdd" style="--el-switch-on-color: #67C23A;"
                        @click="repCaseData(scope.row, 'data', 'add')" inline-prompt></el-switch>
                </template>
            </el-table-column>
        </el-table>
        <el-table :data="primaryData" v-show="dataTableLayout == 'edit'" :cell-style="editColumnColor">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="预览" width="80px" :show-overflow-tooltip="true">
                <template #default="scope">
                    <div>{{ JSON.stringify(scope.row.data, null, 1) }}</div>
                </template>
            </el-table-column>
            <el-table-column label="把这个key">
                <el-input v-model="changeDataEditInputA" placeholder="" disabled></el-input>
            </el-table-column>
            <el-table-column label="改为这个key">
                <el-input v-model="changeDataEditInputB" placeholder="" disabled></el-input>
            </el-table-column>
            <el-table-column label="value">
                <el-input v-model="changeDataEditInputC" placeholder="" disabled></el-input>
            </el-table-column>
            <el-table-column label="temp_id" prop="temp_id" align="center"></el-table-column>
            <el-table-column label="case_id" prop="case_id" align="center"></el-table-column>
            <el-table-column label="number" prop="number" align="center"></el-table-column>
            <el-table-column label="操作" width="75px">
                <template #default="scope">
                    <el-switch v-model="scope.row.repDataEdit" active-text="修改" inactive-text="未修改"
                        :loading="scope.row.loadingDataEdit" style="--el-switch-on-color: #67C23A;"
                        @click="repCaseData(scope.row, 'data', 'edit')" inline-prompt></el-switch>
                </template>
            </el-table-column>
        </el-table>
        <el-table :data="primaryData" v-show="dataTableLayout == 'del'" :cell-style="delColumnColor">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="预览" width="80px" :show-overflow-tooltip="true">
                <template #default="scope">
                    <div>{{ JSON.stringify(scope.row.data, null, 1) }}</div>
                </template>
            </el-table-column>
            <el-table-column label="将这个Key删除掉">
                <el-input v-model="changeDataDelInput" placeholder="" disabled></el-input>
            </el-table-column>
            <el-table-column label="temp_id" prop="temp_id" align="center"></el-table-column>
            <el-table-column label="case_id" prop="case_id" align="center"></el-table-column>
            <el-table-column label="number" prop="number" align="center"></el-table-column>
            <el-table-column label="操作" width="75px">
                <template #default="scope">
                    <el-switch v-model="scope.row.repDataDel" active-text="删除" inactive-text="未删除"
                        :loading="scope.row.loadingDataDel" style="--el-switch-on-color: #67C23A;"
                        @click="repCaseData(scope.row, 'data', 'del')" inline-prompt></el-switch>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>


<script>
import { ElNotification } from 'element-plus'
import { ElMessage } from 'element-plus'
export default {
    name: 'MyChange',

    data() {
        return {
            select: null,
            urlMethodInput: null,
            changeTempData: [],
            tableLayout: 'url',
            paramsTableLayout: 'add',
            dataTableLayout: 'add',
            primaryUrl: [],
            primaryParams: [],
            primaryData: [],

            changeUrlInput: '',

            changeParamsAddInput: '',
            changeParamsAddInputValue: null,
            changeParamsEditInputA: '',
            changeParamsEditInputB: '',
            changeParamsEditInputC: '',
            changeParamsDelInput: '',

            changeDataAddInput: '',
            changeDataAddInputValue: null,
            changeDataEditInputA: '',
            changeDataEditInputB: '',
            changeDataEditInputC: '',
            changeDataDelInput: ''
        }
    },

    methods: {
        // 变更数据操作
        async repCaseData(row, repType, operate) {
            // 模板数据变更
            if (repType == 'url') {
                row.loadingUrlEdit = true
                await this.$http({
                    url: '/ownRep/url/edit',
                    method: 'PUT',
                    data: JSON.stringify({
                        temp_id: row.temp_id,
                        case_id: row.case_id,
                        number: row.number,
                        rep_url: row.repUrl,
                        old_url: row.path,
                        new_url: this.changeUrlInput
                    }),
                    headers: {
                        'content-type': "application/json"
                    }
                }).then(
                    function () {
                        row.loadingUrlEdit = false
                        if (row.repUrl) {
                            ElNotification.success({
                                title: 'Success',
                                message: '变更成功',
                            })
                        } else {
                            ElNotification.warning({
                                title: 'Warning',
                                message: '未变更',
                            })
                        }

                    }
                ).catch(
                    function (error) {
                        row.loadingUrlEdit = false
                        ElMessage.error(error.message)
                    }
                )

            } else if (repType == 'params') {
                if (operate == 'add') {
                    row.loadingParamsAdd = true
                    await this.$http({
                        url: '/ownRep/params/add',
                        method: 'PUT',
                        data: JSON.stringify({
                            temp_id: row.temp_id,
                            case_id: row.case_id,
                            number: row.number,
                            rep_params_add: row.repParamsAdd,
                            key: this.changeParamsAddInput,
                            value: this.changeParamsAddInputValue
                        }),
                        headers: {
                            'content-type': "application/json"
                        }
                    }).then(
                        function () {
                            row.loadingParamsAdd = false
                            ElNotification.success({
                                title: 'Success',
                                message: 'Params插入字段成功',
                            })
                        }
                    ).catch(
                        function () {
                            row.loadingParamsAdd = false
                            ElNotification.warning({
                                title: 'Warning',
                                message: 'Params插入操作不可逆',
                            })
                        }
                    )
                } else if (operate == 'edit') {
                    row.loadingParamsEdit = true
                    await this.$http({
                        url: '/ownRep/params/edit',
                        method: 'PUT',
                        data: JSON.stringify({
                            temp_id: row.temp_id,
                            case_id: row.case_id,
                            number: row.number,
                            rep_params_edit: row.repParamsEdit,
                            old_key: this.changeParamsEditInputA,
                            new_key: this.changeParamsEditInputB,
                            value: this.changeParamsEditInputC
                        }),
                        headers: {
                            'content-type': "application/json"
                        }
                    }).then(
                        function () {
                            row.loadingParamsEdit = false
                            if (row.repParamsEdit) {
                                ElNotification.success({
                                    title: 'Success',
                                    message: 'Params替换字段成功',
                                })
                            } else {
                                ElNotification.warning({
                                    title: 'Warning',
                                    message: 'Params替换字段未替换',
                                })
                            }
                        }
                    ).catch(
                        function () {
                            row.loadingParamsEdit = false
                            ElNotification.warning({
                                title: 'Warning',
                                message: 'Params字段未替换',
                            })
                        }
                    )
                } else if (operate == 'del') {
                    row.loadingParamsDel = true
                    await this.$http({
                        url: '/ownRep/params/del',
                        method: 'PUT',
                        data: JSON.stringify({
                            temp_id: row.temp_id,
                            case_id: row.case_id,
                            number: row.number,
                            rep_params_del: row.repParamsDel,
                            key: this.changeParamsDelInput,
                        }),
                        headers: {
                            'content-type': "application/json"
                        }
                    }).then(
                        function () {
                            row.loadingParamsDel = false
                            ElNotification.success({
                                title: 'Success',
                                message: 'Params字段删除成功',
                            })
                        }
                    ).catch(
                        function () {
                            row.loadingParamsDel = false
                            ElNotification.warning({
                                title: 'Warning',
                                message: 'Params删除操作不可逆',
                            })
                        }
                    )
                }
            } else if (repType == 'data') {
                if (operate == 'add') {
                    row.loadingDataAdd = true
                    await this.$http({
                        url: '/ownRep/data/add',
                        method: 'PUT',
                        data: JSON.stringify({
                            temp_id: row.temp_id,
                            case_id: row.case_id,
                            number: row.number,
                            rep_data_add: row.repDataAdd,
                            key: this.changeDataAddInput,
                            value: this.changeDataAddInputValue
                        }),
                        headers: {
                            'content-type': "application/json"
                        }
                    }).then(
                        function () {
                            row.loadingDataAdd = false
                            ElNotification.success({
                                title: 'Success',
                                message: 'Data插入字段成功',
                            })
                        }
                    ).catch(
                        function () {
                            row.loadingDataAdd = false
                            ElNotification.warning({
                                title: 'Warning',
                                message: 'Data插入操作不可逆',
                            })
                        }
                    )
                } else if (operate == 'edit') {
                    row.loadingDataDel = true
                    await this.$http({
                        url: '/ownRep/data/edit',
                        method: 'PUT',
                        data: JSON.stringify({
                            temp_id: row.temp_id,
                            case_id: row.case_id,
                            number: row.number,
                            rep_data_edit: row.repDataEdit,
                            old_key: this.changeDataEditInputA,
                            new_key: this.changeDataEditInputB,
                            value: this.changeDataEditInputC
                        }),
                        headers: {
                            'content-type': "application/json"
                        }
                    }).then(
                        function () {
                            row.loadingDataDel = false
                            if (row.repDataEdit) {
                                ElNotification.success({
                                    title: 'Success',
                                    message: 'Data替换字段成功',
                                })
                            } else {
                                ElNotification.warning({
                                    title: 'Warning',
                                    message: 'Data替换字段未替换',
                                })
                            }
                        }
                    ).catch(
                        function () {
                            row.loadingDataDel = false
                            ElNotification.warning({
                                title: 'Warning',
                                message: 'Data字段未替换',
                            })
                        }
                    )
                } else if (operate == 'del') {
                    row.loadingDataDel = true
                    await this.$http({
                        url: '/ownRep/data/del',
                        method: 'PUT',
                        data: JSON.stringify({
                            temp_id: row.temp_id,
                            case_id: row.case_id,
                            number: row.number,
                            rep_data_del: row.repDataDel,
                            key: this.changeDataDelInput,
                        }),
                        headers: {
                            'content-type': "application/json"
                        }
                    }).then(
                        function () {
                            row.loadingDataDel = false
                            ElNotification.success({
                                title: 'Success',
                                message: 'Data字段删除成功',
                            })
                        }
                    ).catch(
                        function () {
                            row.loadingDataDel = false
                            ElNotification.warning({
                                title: 'Warning',
                                message: 'Data删除操作不可逆',
                            })
                        }
                    )
                }
            }
        },

        // 全局搜索url+method
        async getAllInfo() {
            var changeData = []
            await this.$http({
                url: '/ownRep/url/for/data',
                method: 'GET',
                params: {
                    method: this.select,
                    path: this.urlMethodInput
                }
            }).then(
                function (response) {
                    changeData = response.data
                    for (var x in changeData) {
                        changeData[x].checkbox = false
                        changeData[x].caseNum = {}
                    }
                }
            ).catch(function (error) {
                ElMessage.error(error.message)
            })
            this.changeTempData = changeData
            this.primaryUrl = []
            this.primaryParams = []
            this.primaryData = []
        },

        // 搜索单个数据
        getCaseDataInfo() {

        },
        // 全局替换参数的复选框
        async changeBoxClick(row) {
            row.checkbox = row.checkbox == true ? false : true
            if (row.checkbox == true) {
                row.loadingUrlEdit = false
                this.primaryUrl.push(row)

                row.loadingParamsAdd = false
                row.loadingParamsEdit = false
                row.loadingParamsDel = false
                this.primaryParams.push(row)

                row.loadingDataAdd = false
                row.loadingDataEdit = false
                row.loadingDataDel = false
                this.primaryData.push(row)
                // 请求用例接口
                var responseData = []
                await this.$http({
                    url: '/ownRep/temp/for/casedata',
                    method: 'GET',
                    params: {
                        temp_id: row.temp_id,
                        number: row.number
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
                var num = 1
                for (var x in responseData) {
                    this.primaryUrl.push(responseData[x])
                    this.primaryParams.push(responseData[x])
                    this.primaryData.push(responseData[x])
                    num++
                }
                row.caseNum[row.temp_id + '_' + row.number] = num
            } else {
                console.log(row.caseNum);
                for (var x in this.primaryUrl) {
                    if (this.primaryUrl[x].temp_id == row.temp_id && this.primaryUrl[x].number == row.number) {
                        this.primaryUrl.splice(x, row.caseNum[row.temp_id + '_' + row.number])
                    }
                    if (this.primaryParams[x].temp_id == row.temp_id && this.primaryParams[x].number == row.number) {
                        this.primaryParams.splice(x, row.caseNum[row.temp_id + '_' + row.number])
                    }
                    if (this.primaryData[x].temp_id == row.temp_id && this.primaryData[x].number == row.number) {
                        this.primaryData.splice(x, row.caseNum[row.temp_id + '_' + row.number])
                    }
                }
            }
        },
        // 表格颜色
        urlColumnColor({ row, column, rowIndex, columnIndex }) {
            if (row.temp_id > 0 && columnIndex === 3) {
                return {
                    background: '#77693b'
                }
            }
            if (row.case_id > 0 && columnIndex === 4) {
                return {
                    background: '#4a7538'
                }
            }
        },
        addColumnColor({ row, column, rowIndex, columnIndex }) {
            if (row.temp_id > 0 && columnIndex === 4) {
                return {
                    background: '#77693b'
                }
            }
            if (row.case_id > 0 && columnIndex === 5) {
                return {
                    background: '#4a7538'
                }
            }
        },
        editColumnColor({ row, column, rowIndex, columnIndex }) {
            if (row.temp_id > 0 && columnIndex === 5) {
                return {
                    background: '#77693b'
                }
            }
            if (row.case_id > 0 && columnIndex === 6) {
                return {
                    background: '#4a7538'
                }
            }
        },
        delColumnColor({ row, column, rowIndex, columnIndex }) {
            if (row.temp_id > 0 && columnIndex === 3) {
                return {
                    background: '#77693b'
                }
            }
            if (row.case_id > 0 && columnIndex === 4) {
                return {
                    background: '#4a7538'
                }
            }
        },

    }
};
</script>


