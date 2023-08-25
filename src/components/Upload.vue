<template>
    <el-radio-group v-model="uploadType">
        <el-radio-button label='temp-har' @click="cutFile('temp-har')">API模板-har</el-radio-button>
        <el-radio-button label='temp-swagger' @click="cutFile('temp-swagger')">API模板-swagger</el-radio-button>
        <el-radio-button label='case' @click="cutFile('case')">API用例</el-radio-button>
        <el-radio-button label='gather' @click="cutFile('gather')">API数据集</el-radio-button>
        <el-radio-button label='ui-case' @click="cutFile('ui-case')">UI数据集</el-radio-button>
    </el-radio-group>
    <br>
    <br>
    <!-- 模板-har -->
    <el-form v-if="uploadType == 'temp-har'">
        <el-form-item label="数据源" label-width="100px" :required="true" placeholder="charles">
            <el-radio-group v-model="harType">
                <el-radio label="charles">charles</el-radio>
                <el-radio label="chrome">chrome</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="模板名称" label-width="100px" :required="true" placeholder="">
            <el-input v-model="tempName" />
        </el-form-item>
        <el-form-item label="系统名称" label-width="100px" :required="true">
            <el-select v-model="projectName" placeholder="选择系统" @visible-change="handleVisibleChange">
                <el-option v-for="item in projects" :key="item.code" :label="item.code" :value="item.code"></el-option>
            </el-select>
        </el-form-item>
    </el-form>
    <!-- 模板-swagger -->
    <el-form v-if="uploadType == 'temp-swagger'">
        <el-form-item label="Host" label-width="100px" :required="true" placeholder="">
            <el-input v-model="tempHost" />
        </el-form-item>
        <el-form-item label="系统名称" label-width="100px" :required="true">
            <el-select v-model="projectName" placeholder="选择系统" @visible-change="handleVisibleChange">
                <el-option v-for="item in projects" :key="item.code" :label="item.code" :value="item.code"></el-option>
            </el-select>
        </el-form-item>
    </el-form>
    <!-- 用例 -->
    <el-form v-if="uploadType == 'case'">
        <el-form-item label="绑定模板ID" label-width="100px" :required="true">
            <el-input-number v-model="tempId" placeholder="" />
        </el-form-item>
        <el-form-item label="覆盖" label-width="100px" :required="true">
            <el-select v-model="cover" placeholder="">
                <el-option label="覆盖" :value='true' />
                <el-option label="不覆盖" :value='false' />
            </el-select>
        </el-form-item>
        <el-form-item label="用例ID" label-width="100px" :required="true" v-show="cover">
            <el-input-number v-model="caseId" placeholder="" />
        </el-form-item>
        <el-form-item label="用例名称" label-width="100px" :required="true" v-show="!cover">
            <el-input v-model="caseName" placeholder="" />
        </el-form-item>
    </el-form>
    <!-- 数据集 -->
    <el-form v-if="uploadType == 'gather'">
        <el-form-item label="用例ID" label-width="100px" :required="true">
            <el-input-number v-model="caseId" placeholder="" />
        </el-form-item>
    </el-form>
    <!-- 用例 -->
    <el-form v-if="uploadType == 'ui-case'">
        <el-form-item label="绑定模板ID" label-width="100px" :required="true">
            <el-input-number v-model="uiTempId" placeholder="" />
        </el-form-item>
    </el-form>

    <!-- 上传窗口 -->
    <el-upload drag :auto-upload="false" :action="uploadUrl" :http-request="upload" :limit="1" ref="upload"
        :accept="fileType" :on-success="onSuccess" :on-error="onError">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text"><font color="#F29492">将文件拖拽到此处</font> 或者 <font color="#F29492">点击上传</font></div>
    </el-upload>
    <el-button class="ml-2" type="success" @click="btnSubmit" :loading="submitLoading">上传到服务器</el-button>

    <!-- 成功的弹窗 -->
    <el-dialog class="confirm" v-model='mySuccess' width="50%" title="上传成功">
        <el-form :model="successData">
            <!-- 模板内容 -->
            <el-form-item label="模板名称 : " v-if="this.uploadType == 'temp-har' || this.uploadType == 'temp-swagger'">
                {{ successData.temp_name }}
            </el-form-item>
            <el-form-item label="项目名称 : " v-if="this.uploadType == 'temp-har' || this.uploadType == 'temp-swagger'">
                {{ successData.project_name }}
            </el-form-item>
            <el-form-item label="模板ID : " v-if="this.uploadType == 'temp-har' || this.uploadType == 'temp-swagger'">
                {{ successData.id }}
            </el-form-item>
            <el-form-item label="API数量 : " v-if="this.uploadType == 'temp-har' || this.uploadType == 'temp-swagger'">
                {{ successData.api_count }}
            </el-form-item>
            <!-- 用例内容 -->
            <el-form-item label="用例名称 : " v-if="this.uploadType == 'case'">
                {{ successData.case_name }}
            </el-form-item>
            <el-form-item label="用例ID : " v-if="this.uploadType == 'case'">
                {{ successData.id }}
            </el-form-item>
            <el-form-item label="用例模式 : " v-if="this.uploadType == 'case'">
                {{ successData.mode }}
            </el-form-item>
            <el-form-item label="运行次数 : " v-if="this.uploadType == 'case'">
                {{ successData.run_order }}
            </el-form-item>
            <el-form-item label="API数量 : " v-if="this.uploadType == 'case'">
                {{ successData.case_count }}
            </el-form-item>
            <!-- 共有 -->
            <el-form-item label="创建时间 : ">
                {{ successData.created_at }}
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script>
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
export default {
    name: 'MyUpload',

    props: {
        'uploadType_': String,
        'fileType_': String
    },

    data() {
        return {
            submitLoading: false,
            // 模板
            tempName: '',
            tempHost: '',
            projectName: '',
            harType: 'charles',
            // 上传的基本信息
            uploadUrl: '',
            uploadType: this.uploadType_,
            fileType: this.fileType_,
            // 用例
            tempId: '',
            caseId: null,
            caseName: '',
            cover: false,
            //UI用例
            uiTempId: null,
            uiCaseName: '',

            // 成功信息
            mySuccess: false,
            successData: {},
            projects: []
        }
    },
    methods: {
        // 项目列表
        async handleVisibleChange(val) {
            if (!val) {
                return
            }
            var projects = []
            await this.$http({
                url: '/conf/get/project',
                method: 'GET',
            }).then(
                function (response) {
                    projects = response.data
                }
            ).catch(
                function (error) {
                    ElMessage.error(error.message)
                }
            )
            this.projects = projects
        },
        // 切换文件类型
        cutFile(myType) {
            if (myType == 'temp-har') {
                this.fileType = '.har'
            } else if (myType == 'case' || myType == 'temp-swagger') {
                this.fileType = '.json'
            } else if (myType == 'gather') {
                this.fileType = '.xlsx'
            } else if (myType == 'ui-case') {
                this.fileType = '.xlsx'
            }
        },
        btnSubmit() {
            if (this.uploadType == 'temp-har') {
                this.uploadUrl = '/template/upload/har?temp_name=' + this.tempName + '&project_name=' + this.projectName + '&har_type=' + this.harType
            } else if (this.uploadType == 'temp-swagger') {
                this.uploadUrl = '/template/upload/swagger/json?host=' + this.tempHost + '&project_name=' + this.projectName
            } else if (this.uploadType == 'case') {
                if (this.cover) {
                    this.uploadUrl = '/caseService/upload/json?temp_id=' + this.tempId + '&cover=' + this.cover + '&case_id=' + this.caseId
                } else {
                    this.uploadUrl = '/caseService/upload/json?temp_id=' + this.tempId + '&cover=' + this.cover + '&case_name=' + this.caseName
                }
            } else if ((this.uploadType == 'gather')) {
                this.uploadUrl = '/caseDdt/upload/data/gather?case_id=' + this.caseId
            } else if ((this.uploadType == 'ui-case')) {
                this.uploadUrl = '/caseUi/upload/playwright/data/?temp_id=' + this.uiTempId
            }
            this.$refs.upload.submit()
            this.submitLoading = true
        },
        onSuccess(response) {
            if (this.uploadType != 'gather' && this.uploadType != 'ui-case') {
                this.successData = response
                this.mySuccess = true
            }
            ElMessage.success('上传成功')
            this.submitLoading = false
        },
        onError() {
            ElMessage.error('上传失败')
            this.submitLoading = false
        }


    }
}
</script>

<style scoped>
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
