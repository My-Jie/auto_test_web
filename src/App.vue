
<script>
import MyTempInfo from "./components/MyTempInfo.vue"
import MyCaseInfo from "./components/MyCaseInfo.vue"
import MyChange from './components/MyChange.vue'
import { ElMessage } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'
export default {
  components: {
    MyTempInfo,
    MyCaseInfo,
    MyChange
  },
  data() {
    return {
      Check,
      Close,
      // 判断哪个按钮点击了
      clickStatus: {
        isTemp: false,
        isCase: false,
      },
      // 存获取的数据
      tempInfo: [],
      caseInfo: [],
      // 全局参数变更弹窗
      dialogParamsCharge: false,
      mySwitch: true,
      tempInfoLoading: false,
      caseInfoLoading: false
    }
  },

  methods: {
    // 获取模板信息
    async getTempInfo() {
      this.tempInfoLoading = true
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
        this.tempInfo[x].edit = true
        this.tempInfo[x].checkLoading = false
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
      this.tempInfoLoading = false

    },

    // 获取用例信息
    async getCaseInfo() {
      this.caseInfoLoading = true
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
        this.caseInfo[x].edit = true
        this.caseInfo[x].checkLoading = false
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
      this.caseInfoLoading = false
    },
    mySwitchTo() {
      var myDark = document.querySelector('html').style
      console.log(myDark);
      dark.color = '#fff'
    }
  }
}
</script>


<template>
  <el-container>
    <el-header>
      <!-- 模板信息 -->
      <el-button type="primary" @click="getTempInfo" :loading="tempInfoLoading">获取模板信息</el-button>
      <!-- 用例信息 -->
      <el-button type="primary" @click="getCaseInfo" :loading="caseInfoLoading">获取用例信息</el-button>
      <!-- 参数变更 -->
      <el-button type="primary" @click="dialogParamsCharge = true">全局参数变更</el-button>
      <!-- 开关灯 -->
      <!-- <el-switch v-model="mySwitch" class="mt-2" style="--el-switch-on-color: #000; --el-switch-off-color: #959999aa;"
            inline-prompt :active-icon="Check" :inactive-icon="Close" @click="mySwitchTo()" /> -->
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
</template>


<style scoped>
.el-switch {
  position: absolute;
  right: 80px;
}

/* .logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #959999aa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
} */
</style>
