<template>
    <el-upload drag :auto-upload="false" action="api/template/analysis/har" :http-request="upload" :limit="1" ref="upload"
        accept=".har" :on-success="onSuccess" :on-error="onError">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">拖动文件 或者 <em>点击窗口</em></div>
    </el-upload>
    <el-button class="ml-2" type="success" @click="btnSubmit">
        上传到服务器
    </el-button>
</template>

<script>
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'
export default {
    name: 'MyUpload',
    data() {
        return {
            tempParams: {
                tempName: '',
                projectName: '',
            }
        }
    },
    methods: {
        btnSubmit() {
            this.$refs.upload.submit()
        },
        onSuccess() {
            ElNotification.success({
                title: 'Success',
                message: '上传成功',
                offset: 200,
            })
        },
        onError() {
            ElMessage.error('上传失败')
        }

    }
}
</script>
