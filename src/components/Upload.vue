<template>
    <el-radio-group v-model="uploadType">
        <el-radio-button label='temp' @click="cutFile('temp')">模板</el-radio-button>
        <el-radio-button label='case' @click="cutFile('case')">用例</el-radio-button>
        <el-radio-button label='gather' @click="cutFile('gather')">数据集</el-radio-button>
    </el-radio-group>
    <br>
    <br>
    <!-- 模板 -->
    <el-form v-if="uploadType == 'temp'">
        <el-form-item label="模板名称" label-width="100px" :required="true" placeholder="">
            <el-input v-model="tempName" />
        </el-form-item>
        <el-form-item label="项目名称" label-width="100px" :required="true">
            <el-select v-model="projectName" placeholder="选择项目">
                <el-option label="sales" value="sales" />
                <el-option label="oms" value="oms" />
                <el-option label="site" value="site" />
                <el-option label="tms" value="tms" />
                <el-option label="wxApp" value="wxapp" />
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

    <!-- 上传窗口 -->
    <el-upload drag :auto-upload="false" :action="uploadUrl" :http-request="upload" :limit="1" ref="upload"
        :accept="fileType" :on-success="onSuccess" :on-error="onError">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖拽到此处 或者 <em>点击上传</em></div>
    </el-upload>
    <el-button class="ml-2" type="success" @click="btnSubmit">上传到服务器</el-button>

    <!-- 成功的弹窗 -->
    <el-dialog v-model='mySuccess' width="50%" title="上传成功">
        <el-form :model="successData">
            <!-- 模板内容 -->
            <el-form-item label="模板名称 : " v-if="this.uploadType == 'temp'">
                {{ successData.temp_name }}
            </el-form-item>
            <el-form-item label="项目名称 : " v-if="this.uploadType == 'temp'">
                {{ successData.project_name }}
            </el-form-item>
            <el-form-item label="模板ID : " v-if="this.uploadType == 'temp'">
                {{ successData.id }}
            </el-form-item>
            <el-form-item label="API数量 : " v-if="this.uploadType == 'temp'">
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
    data() {
        return {
            // 模板
            tempName: '',
            projectName: '',
            // 上传的基本信息
            uploadUrl: '',
            uploadType: 'temp',
            fileType: '.har',
            // 用例
            tempId: '',
            caseId: null,
            caseName: '',
            cover: false,

            // 成功信息
            mySuccess: false,
            successData: {}
        }
    },
    methods: {
        // 切换文件类型
        cutFile(myType) {
            if (myType == 'temp') {
                this.fileType = '.har'
            } else if (myType == 'case') {
                this.fileType = '.json'
            } else if (myType == 'gather') {
                this.fileType = '.xlsx'
            }
        },
        btnSubmit() {
            if (this.uploadType == 'temp') {
                this.uploadUrl = '/template/upload/har?temp_name=' + this.tempName + '&project_name=' + this.projectName
            } else if (this.uploadType == 'case') {
                if (this.cover) {
                    this.uploadUrl = '/caseService/upload/json?temp_id=' + this.tempId + '&cover=' + this.cover + '&case_id=' + this.caseId
                } else {
                    this.uploadUrl = '/caseService/upload/json?temp_id=' + this.tempId + '&cover=' + this.cover + '&case_name=' + this.caseName
                }
            } else if ((this.uploadType == 'gather')) {
                this.uploadUrl = '/api/caseService/upload/data/gather?case_id=' + this.caseId
            }
            this.$refs.upload.submit()
        },
        onSuccess(response) {
            if (this.uploadType != 'gather') {
                this.successData = response
                this.mySuccess = true
            }

            ElMessage.success('上传成功')
        },
        onError() {
            ElMessage.error('上传失败')
        }

    }
}
</script>
