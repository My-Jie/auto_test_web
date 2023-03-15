
<script>
import MyTempInfo from "./components/MyTempInfo.vue"
import MyCaseInfo from "./components/MyCaseInfo.vue"
import MyChange from './components/MyChange.vue'
import MyUpload from './components/Upload.vue'
import { ElMessage } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'
import { useDark, useToggle } from '@vueuse/core'
export default {
  components: {
    MyTempInfo,
    MyCaseInfo,
    MyChange,
    MyUpload
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
      timer: null,
      // 全局参数变更弹窗
      dialogParamsCharge: false,
      dialogUpload: false,
      mySwitch: true,
      tempInfoLoading: false,
      caseInfoLoading: false,
      caseStatus: false,
      isDark: useDark(),
      progressPercentage: 0
    }
  },

  methods: {
    // 开启定时器
    start(time) {
      if (this.caseInfo.length > 0) {
        if (!this.timer) {
          this.timer = setInterval(() => {
            this.getCaseStatus()
          }, time)
        }
      }
    },
    // 关闭定时器
    end() {
      clearInterval(this.timer)
      this.timer = null
    },

    // 获取模板信息
    async getTempInfo() {
      // 关闭定时器
      this.end()

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
        this.caseInfo[x].gatherLoading = false
        this.caseInfo[x].edit = true
        this.caseInfo[x].checkLoading = false
        this.caseInfo[x].percentage = 0
        this.caseInfo[x].percentageStatus = 'success'
        this.caseInfo[x].key_id = ''
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

      // 启动定时器
      this.start(5000)

    },
    getCaseStatus(key_id = null) {
      var caseInfo = this.caseInfo
      this.$http({
        url: '/runCase/case/status',
        method: 'GET',
        params: {
          key_id: key_id
        }
      }).then(
        function (response) {
          for (var x in response.data) {
            for (var y in caseInfo) {
              if (response.data[x].case_id == caseInfo[y].case_id) {
                caseInfo[y].percentage = Math.round((response.data[x].success + response.data[x].fail) / response.data[x].total * 100)
                if (response.data[x].fail > 0) {
                  caseInfo[y].percentageStatus = 'warning'
                }
                caseInfo[y].key_id = x
                break
              }
            }
          }
        }
      )
    },

    // 暗黑模式
    toggleDark() {
      useToggle(this.isDark)
    },
  }
}
</script>


<template>
  <el-container>
    <el-header>
      <el-affix :offset="10">
        <!-- 模板信息 -->
        <el-button type="primary" @click="getTempInfo" :loading="tempInfoLoading">获取模板信息</el-button>
        <!-- 用例信息 -->
        <el-button type="primary" @click="getCaseInfo" :loading="caseInfoLoading">获取用例信息</el-button>
        <!-- 参数变更 -->
        <el-button type="primary" @click="dialogParamsCharge = true">全局参数变更</el-button>
        <!-- 文件上传 -->
        <el-button type="primary" @click="dialogUpload = true">文件上传</el-button>
        <!-- 开关灯 -->
        <span @click.stop="toggleDark()"></span>
        <el-switch size="small" v-model="isDark" />
      </el-affix>
      <el-backtop :right="100" :bottom="100" />
    </el-header>
    <el-main>
      <my-temp-info v-show="clickStatus['isTemp']" :temp-info="tempInfo"></my-temp-info>
      <my-case-info v-show="clickStatus['isCase']" :case-info="caseInfo"></my-case-info>
      <!-- 字段变更的弹窗 -->
      <el-dialog v-model='dialogParamsCharge' width="70%" title="全局参数变更" :close-on-click-modal=false
        :close-on-press-escape=false @close='dialogParamsCharge = false' draggable>
        <my-change v-if="dialogParamsCharge"></my-change>
      </el-dialog>
      <!-- 文件上传的弹窗 -->
      <el-dialog v-model='dialogUpload' width="40%" title="文件上传" @close='dialogUpload = false' draggable>
        <my-upload v-if="dialogUpload"></my-upload>
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
