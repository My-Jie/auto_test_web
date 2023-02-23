<template>
    <el-form-item :inline="true">
        <el-input v-model="urlMethodInput" placeholder="请输入需要查找的URL" clearable minlength="3">
            <template #prepend>
                <el-select v-model="select" placeholder="Method" style="width: 115px">
                    <el-option label="GET" value="GET" />
                    <el-option label="POST" value="POST" />
                    <el-option label="PUT" value="PUT" />
                    <el-option label="DELETE" value="DELETE" />
                </el-select>
            </template>
            <template #append>
                <el-button plain @click="getAllInfo()">全局查询</el-button>
            </template>
        </el-input>
    </el-form-item>
    <!-- 字段变更查询数据列表 -->
    <el-table :data="changeTempData" stripe fit v-show="changeTempData.length > 0" >
        <el-table-column type="index"></el-table-column>
        <el-table-column label="TempName" prop="temp_name" width="300px" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column label="Url" prop="path" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column label="TempId" prop="temp_id" width="100px" align="center"></el-table-column>
        <el-table-column label="Number" prop="number" width="100px" align="center"></el-table-column>
        <el-table-column label="多选" width="70px">
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
        <el-input v-model="changeUrlInput" placeholder="" >
            <template #prepend>变更的URL</template>
        </el-input>
        <el-table :data="primaryUrl" :cell-style="urlColumnColor">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="把这个url" prop="path" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="改成这样" >
                <el-input v-model="changeUrlInput" placeholder="" disabled ></el-input>
            </el-table-column>
            <el-table-column label="temp_id" prop="temp_id"  width="100px" align="center"></el-table-column>
            <el-table-column label="case_id" prop="case_id" width="100px" align="center"></el-table-column>
            <el-table-column label="number" prop="number" width="100px" align="center"></el-table-column>
            <el-table-column label="操作" width="65px">
                <template #default="scope">
                    <el-switch v-model="scope.row.rep" active-text="变更" inactive-text="未变更"
                        :loading="scope.row.urlLoading" style="--el-switch-on-color: #67C23A;"
                        @click="repCaseData(scope.row, 'url')" inline-prompt></el-switch>
                </template>
            </el-table-column>
        </el-table>
    </div>
    <!-- params的替换操作 -->
    <div v-show="tableLayout == 'params' && primaryUrl.length > 0">
        <el-radio-group v-model="paramsTableLayout" style="display:block">
            <el-radio-button label="add" />
            <el-radio-button label="edit"  />
            <el-radio-button label="del"  />
        </el-radio-group>
        <br>
        <el-input v-model="changeParamsAddInput" placeholder="$.result.0.test.id 会插入id" v-if="paramsTableLayout == 'add'" style="display:inline" >
            <template #prepend>表达式</template>
        </el-input>&nbsp;
        <el-input v-model="changeParamsAddInputValue" placeholder="默认Null" v-if="paramsTableLayout == 'add'" style="display:inline" >
            <template #prepend>值</template>
        </el-input>

        <el-input v-model="changeParamsDelInput" placeholder="key字段" v-if="paramsTableLayout == 'del'" style="display:inline">
            <template #prepend>需要删除的key</template>
        </el-input>
        <el-input v-model="changeParamsEditInputA" placeholder="testOne" v-if="paramsTableLayout == 'edit'" style="display:inline">
            <template #prepend>把这个key</template>
        </el-input>&nbsp;
        <el-input v-model="changeParamsEditInputB" placeholder="testTwo" v-if="paramsTableLayout == 'edit'" style="display:inline">
            <template #prepend>改为</template>
        </el-input>
        
        <el-table :data="primaryParams" v-show="paramsTableLayout == 'add'" :cell-style="urlColumnColor">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="key"  >
                <el-input v-model="changeParamsAddInput" placeholder="" disabled ></el-input>
            </el-table-column>
            <el-table-column label="value"  >
                <el-input v-model="changeParamsAddInputValue" placeholder="" disabled ></el-input>
            </el-table-column>
            <el-table-column label="temp_id" prop="temp_id" align="center"></el-table-column>
            <el-table-column label="case_id" prop="case_id" align="center"></el-table-column>
            <el-table-column label="number" prop="number" align="center"></el-table-column>
            <el-table-column label="操作" width="65px">
                <template #default="scope">
                    <el-switch v-model="scope.row.rep" active-text="插入" inactive-text="未插入"
                        :loading="scope.row.urlLoading" style="--el-switch-on-color: #67C23A;"
                        @click="repCaseData(scope.row, 'params')" inline-prompt></el-switch>
                </template>
            </el-table-column>
        </el-table>
        <el-table :data="primaryParams" v-show="paramsTableLayout == 'edit'" :cell-style="urlColumnColor">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="把这个key"  >
                <el-input v-model="changeParamsEditInputA" placeholder="" disabled ></el-input>
            </el-table-column>
            <el-table-column label="改为这个key"  >
                <el-input v-model="changeParamsEditInputB" placeholder="" disabled ></el-input>
            </el-table-column>
            <el-table-column label="temp_id" prop="temp_id" align="center"></el-table-column>
            <el-table-column label="case_id" prop="case_id" align="center"></el-table-column>
            <el-table-column label="number" prop="number" align="center"></el-table-column>
            <el-table-column label="操作" width="65px">
                <template #default="scope">
                    <el-switch v-model="scope.row.rep" active-text="修改" inactive-text="未修改"
                        :loading="scope.row.urlLoading" style="--el-switch-on-color: #67C23A;"
                        @click="repCaseData(scope.row, 'params')" inline-prompt></el-switch>
                </template>
            </el-table-column>
        </el-table>
        <el-table :data="primaryParams" v-show="paramsTableLayout == 'del'" :cell-style="delColumnColor">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="将这个key删除掉"  >
                <el-input v-model="changeParamsDelInput" placeholder="" disabled ></el-input>
            </el-table-column>
            <el-table-column label="temp_id" prop="temp_id" align="center"></el-table-column>
            <el-table-column label="case_id" prop="case_id" align="center"></el-table-column>
            <el-table-column label="number" prop="number" align="center"></el-table-column>
            <el-table-column label="操作" width="65px">
                <template #default="scope">
                    <el-switch v-model="scope.row.rep" active-text="删除" inactive-text="未删除"
                        :loading="scope.row.urlLoading" style="--el-switch-on-color: #67C23A;"
                        @click="repCaseData(scope.row, 'params')" inline-prompt></el-switch>
                </template>
            </el-table-column>
        </el-table>
    </div>
    <!-- data的替换操作 -->
    <div v-show="tableLayout == 'data' && primaryUrl.length > 0">
        <el-radio-group v-model="dataTableLayout" style="display:block">
            <el-radio-button label="add" />
            <el-radio-button label="edit"  />
            <el-radio-button label="del"  />
        </el-radio-group>
        <br>
        <el-input v-model="changeDataAddInput" placeholder="$.result.0.test.id 会插入id" v-if="dataTableLayout == 'add'" style="display:inline" >
            <template #prepend>表达式</template>
        </el-input>&nbsp;
        <el-input v-model="changeDataAddInputValue" placeholder="默认Null" v-if="dataTableLayout == 'add'" style="display:inline" >
            <template #prepend>值</template>
        </el-input>
        <el-input v-model="changeDataDelInput" placeholder="key字段" v-if="dataTableLayout == 'del'" style="display:inline">
            <template #prepend>需要删除的key</template>
        </el-input>
        <el-input v-model="changeDataEditInputA" placeholder="testOne" v-if="dataTableLayout == 'edit'" style="display:inline">
            <template #prepend>把这个key</template>
        </el-input>&nbsp;
        <el-input v-model="changeDataEditInputB" placeholder="testTwo" v-if="dataTableLayout == 'edit'" style="display:inline">
            <template #prepend>改为</template>
        </el-input>

        <el-table :data="primaryData" v-show="dataTableLayout == 'add'" :cell-style="urlColumnColor">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="key"  >
                <el-input v-model="changeDataAddInput" placeholder="" disabled ></el-input>
            </el-table-column>
            <el-table-column label="value"  >
                <el-input v-model="changeDataAddInputValue" placeholder="" disabled ></el-input>
            </el-table-column>
            <el-table-column label="temp_id" prop="temp_id" align="center"></el-table-column>
            <el-table-column label="case_id" prop="case_id" align="center"></el-table-column>
            <el-table-column label="number" prop="number" align="center"></el-table-column>
            <el-table-column label="操作" width="65px">
                <template #default="scope">
                    <el-switch v-model="scope.row.rep" active-text="插入" inactive-text="未插入"
                        :loading="scope.row.urlLoading" style="--el-switch-on-color: #67C23A;"
                        @click="repCaseData(scope.row, 'params')" inline-prompt></el-switch>
                </template>
            </el-table-column>
        </el-table>
        <el-table :data="primaryData" v-show="dataTableLayout == 'edit'" :cell-style="urlColumnColor">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="把这个key"  >
                <el-input v-model="changeDataEditInputA" placeholder="" disabled ></el-input>
            </el-table-column>
            <el-table-column label="改为这个key"  >
                <el-input v-model="changeDataEditInputB" placeholder="" disabled ></el-input>
            </el-table-column>
            <el-table-column label="temp_id" prop="temp_id" align="center"></el-table-column>
            <el-table-column label="case_id" prop="case_id" align="center"></el-table-column>
            <el-table-column label="number" prop="number" align="center"></el-table-column>
            <el-table-column label="操作" width="65px">
                <template #default="scope">
                    <el-switch v-model="scope.row.rep" active-text="修改" inactive-text="未修改"
                        :loading="scope.row.urlLoading" style="--el-switch-on-color: #67C23A;"
                        @click="repCaseData(scope.row, 'params')" inline-prompt></el-switch>
                </template>
            </el-table-column>
        </el-table>
        <el-table :data="primaryData" v-show="dataTableLayout == 'del'" :cell-style="delColumnColor">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="将这个Key删除掉"  >
                <el-input v-model="changeDataDelInput" placeholder="" disabled ></el-input>
            </el-table-column>
            <el-table-column label="temp_id" prop="temp_id" align="center"></el-table-column>
            <el-table-column label="case_id" prop="case_id" align="center"></el-table-column>
            <el-table-column label="number" prop="number" align="center"></el-table-column>
            <el-table-column label="操作" width="65px">
                <template #default="scope">
                    <el-switch v-model="scope.row.rep" active-text="删除" inactive-text="未删除"
                        :loading="scope.row.urlLoading" style="--el-switch-on-color: #67C23A;"
                        @click="repCaseData(scope.row, 'params')" inline-prompt></el-switch>
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

    data () {
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
            changeParamsDelInput: '',
            changeDataAddInput: '',
            changeDataAddInputValue: null,
            changeDataEditInputA: '',
            changeDataEditInputB: '',
            changeDataDelInput: ''
        }
    },

    methods: {
        // 变更数据操作
        repCaseData(row) {

        },

        // 全局搜索url+method
        async getAllInfo() {
            var changeData = []
            await this.$http({
                url: '/template/url/for/data',
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
        getCaseDataInfo () {

        },
        // 全局替换参数的复选框
        changeBoxClick(row) {
            row.checkbox = row.checkbox == true ? false : true
            if (row.checkbox == true) {
                this.primaryUrl.push(row)
                this.primaryParams.push(row)
                this.primaryData.push(row)
            } else {
                for (var x in this.primaryUrl) {
                    if (this.primaryUrl[x].temp_id == row.temp_id && this.primaryUrl[x].number == row.number) {
                        this.primaryUrl.splice(x, 1)
                    }
                    if (this.primaryParams[x].temp_id == row.temp_id && this.primaryParams[x].number == row.number) {
                        this.primaryParams.splice(x, 1)
                    }
                    if (this.primaryData[x].temp_id == row.temp_id && this.primaryData[x].number == row.number) {
                        this.primaryData.splice(x, 1)
                    }
                }
            }
            
            // console.log(row)
            
            // console.log(this.primaryUrl);
        },
        // 表格颜色
        urlColumnColor ({row, column, rowIndex, columnIndex}) {
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
        delColumnColor ({row, column, rowIndex, columnIndex}) {
            if (row.temp_id > 0 && columnIndex === 2) {
                return {
                    background: '#77693b'
                }
            }
            if (row.case_id > 0 && columnIndex === 3) {
                return {
                    background: '#4a7538'
                }
            }
        },

    }
};
</script>

<style>
.el-table .warning-row {
    background: #4a7538;
}

.el-table .success-row {
  background: rgb(129, 103, 54);
}


/* .el-input__wrapper {
    background-color: #283443 !important;
  } */

/* :deep(.el-input__inner){
        	text-align: center;
        } */
</style>

