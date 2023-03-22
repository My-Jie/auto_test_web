<template>
    <el-table v-loading='loading' :data="tempData" stripe fit>
        <el-table-column label="number" prop="number" type="index" :index="indexMethod" width="80px"
            align="center"></el-table-column>
        <el-table-column label="host" prop="host" width="300px"></el-table-column>
        <el-table-column label="path" prop="path" width="300px"></el-table-column>
        <el-table-column label="method" prop="method" width="100%" align="center"></el-table-column>
        <el-table-column label="code" prop="code" width="100%" align="center"></el-table-column>
        <el-table-column label="json_body" prop="json_body" width="100%" align="center"></el-table-column>
        <el-table-column label="params" prop="params" show-overflow-tooltip='true'>
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.params, null, 1) }}</div>
            </template>
        </el-table-column>
        <el-table-column label="data" prop="data" show-overflow-tooltip='true'>
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.data, null, 1) }}</div>
            </template>
        </el-table-column>
        <el-table-column label="headers" prop="headers" show-overflow-tooltip='true'>
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.headers, null, 1) }}</div>
            </template>
        </el-table-column>
        <el-table-column label="response" prop="response" show-overflow-tooltip='true'>
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.response, null, 1) }}</div>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
            <template #default="scope">
                <!-- 编辑操作 -->
                <el-button :icon="Edit" type="primary" size="small" v-if="!scope.row.edit"
                    :disabled="scope.row.EditDisabled" @click="editTemp(scope.row)"></el-button>
                <el-button :icon="Check" type="success" size="small" v-if="scope.row.edit"
                    @click="editTemp(scope.row, 'edit')"></el-button>
                <!-- 增加操作 -->
                <el-button :icon="Plus" type="warning" size="small" @click="addTemp(scope.row)"></el-button>
                <!-- 删除操作 -->
                <el-button :icon="Delete" type="danger" size="small" v-if="!scope.row.del" :disabled="scope.row.delDisabled"
                    @click="delTemp(scope.row)"></el-button>
                <el-button :icon="Check" type="success" size="small" v-if="scope.row.del"
                    @click="delTemp(scope.row, 'del')"></el-button>
            </template>
        </el-table-column>
    </el-table>
    <!-- 新增修改数据的弹窗 -->
    <el-dialog v-model='tempDialog' width="60%" :title="tempTitle" :close-on-click-modal=false :close-on-press-escape=false
        @close="closeTempDialog(tempInfo)" draggable>
        <el-form v-model="tempInfo" label-width="65px">
            <el-form-item label="Host">
                <el-input v-model="tempInfo.host"></el-input>
            </el-form-item>
            <el-form-item label="Path">
                <el-input v-model="tempInfo.path"></el-input>
            </el-form-item>
            <el-form-item label="Method">
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
            <el-form-item label="Code">
                <el-input v-model="tempInfo.code" style="width: 115px"></el-input>
            </el-form-item>
            <el-button type="info" @click="initData()">初始化</el-button>
            <el-button type="success" @click="formatData()">格式化</el-button>
            <el-button type="warning" @click="emptyData()">清空数据</el-button>
            <el-tabs v-model="activeName">
                <el-tab-pane label="Params" name="Params">
                    <el-input type="textarea" v-model="params" :rows="paramsLen"></el-input>
                </el-tab-pane>
                <el-tab-pane label="Data" name="Data">
                    <el-input type="textarea" v-model="data" :rows="dataLen"></el-input>
                </el-tab-pane>
                <el-tab-pane label="Headers" name="Headers">
                    <el-input type="textarea" v-model="headers" :rows="headersLen"></el-input>
                </el-tab-pane>
                <el-tab-pane label="Response" name="Response">
                    <el-input type="textarea" v-model="response" :rows="responseLen"></el-input>
                </el-tab-pane>
            </el-tabs>
        </el-form>
    </el-dialog>
</template>

<script>
import { Edit, Check, Plus, Delete } from '@element-plus/icons-vue'
import _ from 'lodash'
export default {
    name: 'TempData',
    props: {
        'tempData': Array
    },

    data() {
        return {
            Edit,
            Check,
            Plus,
            Delete,
            tempDialog: false,
            tempTitle: '',
            tempInfo: {},

            // json
            activeName: 'Params',
            params: {},
            data: {},
            headers: {},
            response: {},
            paramsLen: 0,
            dataLen: 0,
            headersLen: 0,
            responseLen: 0,
        }
    },


    methods: {
        // 新增数据接口
        addTemp(row) {

        },
        // 修改数据接口
        editTemp(row, type) {
            this.tempInfo = _.cloneDeep(row)
            this.params = JSON.stringify(this.tempInfo.params, null, 8);
            this.data = JSON.stringify(this.tempInfo.data, null, 8);
            this.headers = JSON.stringify(this.tempInfo.headers, null, 8);
            this.response = JSON.stringify(this.tempInfo.response, null, 8);
            // this.paramsLen = Object.keys(this.tempInfo.params).length + 2
            // this.dataLen = Object.keys(this.tempInfo.data).length + 2
            // this.headersLen = Object.keys(this.tempInfo.headers).length + 2
            // this.responseLen = Object.keys(this.tempInfo.response).length + 2
            this.paramsLen = 15
            this.dataLen = 15
            this.headersLen = 15
            this.responseLen = 15


            this.tempTitle = '对模板接口数据查看或编辑'
            if (type == 'edit') {

                row.edit = false
                row.delDisabled = false
            } else {
                this.tempDialog = true
                row.edit = true
                row.delDisabled = true
            }
        },
        // 删除数据接口
        delTemp(row, type) {
            if (type == 'del') {

                row.del = false
                row.EditDisabled = false
            } else {
                row.del = true
                row.EditDisabled = true
            }
        },
        // 关闭窗口
        closeTempDialog(row) {
            row.del = false
            row.EditDisabled = false
        },
        indexMethod(index) {
            return this.tempData[index]['number']
        }
    }
}

</script>