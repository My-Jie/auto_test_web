
<script>
import MyTempInfo from "./components/MyTempInfo.vue"
import MyCaseInfo from "./components/MyCaseInfo.vue"
import MyChange from './components/MyChange.vue'
import { ElMessage } from 'element-plus'
export default {
  components: {
    MyTempInfo,
    MyCaseInfo,
    MyChange
  },
  data() {
    return {
      // 判断哪个按钮点击了
      clickStatus: {
        isTemp: false,
        isCase: false,
      },
      // 存获取的数据
      tempInfo: [],
      caseInfo: [],
      // 全局参数变更弹窗
      dialogParamsCharge: false
    }
  },

  methods: {
    // 获取模板信息
    async getTempInfo() {
      this.tempInfo = []
      var temp = []
      await this.$http.get('/template/name/list?outline=false').then(
        function (response) {
          temp = response.data
        }).catch(function (error) {
          ElMessage.error(error.message)
        })
      this.tempInfo = temp
      // 给每个模板加loading属性
      for (var x in this.tempInfo) {
        this.tempInfo[x].runLoading = false
        this.tempInfo[x].dataLoading = false
        this.tempInfo[x].tempToCaseLoading = false
        // this.tempInfo[x].paramsChangeLoading = false
      }
      // 所有的状态都改为false
      for (var x in this.clickStatus) {
        this.clickStatus[x] = false
      }
      // 再改单个状态为true
      if (!this.isTemp) {
        this.clickStatus['isTemp'] = true
      }

    },

    // 获取用例信息
    async getCaseInfo() {
      this.caseInfo = []
      var case_ = []
      await this.$http.get('/caseService/data/case/list?outline=false').then(
        function (response) {
          case_ = response.data
        }).catch(function (error) {
          ElMessage.error(error.message)
        })
      this.caseInfo = case_
      // 给每个用例加loading属性
      for (var x in this.caseInfo) {
        this.caseInfo[x].runLoading = false
        this.caseInfo[x].dataLoading = false
        this.caseInfo[x].copyLoading = false
        // 测试报告地址
        this.caseInfo[x].allureReport = '/allure/' + this.caseInfo[x].case_id + '/' + this.caseInfo[x].run_order + '/index.html'
        // this.caseInfo[x].repLoading = false
      }
      // 所有的状态都改为false
      for (var x in this.clickStatus) {
        this.clickStatus[x] = false
      }
      // 再改单个状态为true
      if (!this.isTemp) {
        this.clickStatus['isCase'] = true
      }
    }
  }
}
</script>


<template>
  <el-container>
    <el-header>
      <!-- 模板信息 -->
      <el-button type="primary" @click="getTempInfo">获取模板信息</el-button>
      <!-- 用例信息 -->
      <el-button type="primary" @click="getCaseInfo">获取用例信息</el-button>
      <!-- 参数变更 -->
      <el-button type="primary" @click="dialogParamsCharge = true">全局参数变更</el-button>
    </el-header>
    <el-main>
      <my-temp-info v-show="clickStatus['isTemp']" :temp-info="tempInfo"></my-temp-info>
      <my-case-info v-show="clickStatus['isCase']" :case-info="caseInfo"></my-case-info>
      <!-- 字段变更的弹窗 -->
      <el-dialog v-model='dialogParamsCharge' width="70%" title="全局参数变更" :close-on-click-modal=false
        :close-on-press-escape=false @close='dialogParamsCharge = false'>
        <my-change v-if="dialogParamsCharge"></my-change>
      </el-dialog>
    </el-main>




  </el-container>
  <el-backtop :bottom="100">
    <div style="
            height: 100%;
            width: 100%;
            background-color: var(--el-bg-color-overlay);
            box-shadow: var(--el-box-shadow-lighter);
            text-align: center;
            line-height: 40px;
            color: #1989fa;
            visibility-height: 50px;
          ">
      UP
    </div>
  </el-backtop>
</template>


<style scoped>
/* .logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
} */
</style>
