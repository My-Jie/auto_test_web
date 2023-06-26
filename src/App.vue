
<script>
import MyTempInfo from "./components/MyTempInfo.vue"
import MyCaseInfo from "./components/MyCaseInfo.vue"
import MyChange from './components/MyChange.vue'
import MyUpload from './components/Upload.vue'
import MyTransfer from "./components/MyTransfer.vue"
import MyWholeConf from './components/WholeConf.vue'
import MonacoEditor from "./components/MonacoEditor.vue"
import MyUiTempInfo from "./components/MyUiTempInfo.vue"
import { ElMessage } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'
import { useDark, useToggle } from '@vueuse/core'
export default {
  components: {
    MyTempInfo,
    MyCaseInfo,
    MyChange,
    MyUpload,
    MyTransfer,
    MyWholeConf,
    MonacoEditor,
    MyUiTempInfo,
  },
  data() {
    return {
      Check,
      Close,
      // 判断哪个按钮点击了
      clickStatus: {
        isTemp: false,
        isCase: false,
        isUiTemp: false,
      },
      // 存获取的数据
      tempInfo: [],
      caseInfo: [],
      uiTempInfo: [],
      timer: null,
      // 全局参数变更弹窗
      dialogParamsCharge: false,
      dialogUpload: false,
      dialogMonaco: false,
      mySwitch: true,
      dialogTempSuit: false,
      dialogWholeConf: false,
      tempInfoLoading: false,
      caseInfoLoading: false,
      uiCaseInfoLoading: false,
      confWholeLoading: false,
      confWholeCheckLoading: false,
      caseStatus: false,
      isDark: useDark(),

      tempTotal: 0,
      caseTotal: 0,
      uiTempTotal: 0,

      confData: {},
      uploadFileType: '',
      fileType: '',
      uiTempValue: 'import allure\n' +
        'from playwright.sync_api import Playwright, sync_playwright, expect\n' +
        '# 在虚线框内粘贴录制好的playwright脚本，只需要run函数的内容，包含run函数\n' +
        '#======================================\n' +
        '\n\n\n' +
        '#======================================\n' +
        '@allure.title("{{case_name}}")  # 这个会自动替换，请勿修改\n' +
        'def test_ui():\n' +
        '\twith sync_playwright() as playwright:\n' +
        '\t\trun(playwright)\n'
    }
  },
  provide() {
    return {
      'get_temp': this.getTempInfo,
      'get_case': this.getCaseInfo
    };
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
    async getTempInfo(page_ = 1, size_ = 10) {
      // 关闭定时器
      this.end()

      this.tempInfoLoading = true
      var temp = []
      var tempTotal = 0
      await this.$http({
        url: '/template/name/list',
        method: 'GET',
        params: {
          outline: false,
          page: page_,
          size: size_,
        }
      }).then(
        function (response) {
          temp = response.data.items
          tempTotal = response.data.total
        }).catch(function (error) {
          ElMessage.error(error.message)
        })
      this.tempTotal = tempTotal
      this.tempInfo = temp
      // 给每个模板加loading属性
      for (var x in this.tempInfo) {
        this.tempInfo[x].runLoading = false
        this.tempInfo[x].delLoading = false
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

    async getUiCaseInfo(page_ = 1, size_ = 10) {
      // 关闭定时器
      this.end()

      this.uiCaseInfoLoading = true

      var info_ = []
      var uiTempTotal = 0
      await this.$http({
        url: '/caseUi/get/playwright/list',
        method: 'GET',
        params: {
          page: page_,
          size: size_,
        }
      }).then(
        function (response) {
          info_ = response.data.items
          uiTempTotal = response.data.total
        }
      ).catch(function (error) {
        ElMessage.error(error.message)
      })
      this.uiTempInfo = info_
      this.uiTempTotal = uiTempTotal

      // 给每个用例加loading属性
      for (var x in this.uiTempInfo) {
        this.uiTempInfo[x].runLoading = false
        this.uiTempInfo[x].delLoading = false
        this.uiTempInfo[x].dataLoading = false
        this.uiTempInfo[x].CaseLoading = false
        // this.caseInfo[x].edit = true
        // this.caseInfo[x].checkLoading = false
        // this.caseInfo[x].percentage = 0
        // this.caseInfo[x].percentageStatus = 'success'
        // this.caseInfo[x].key_id = ''
        // 测试报告地址
        this.uiTempInfo[x].allureReport = '/ui/allure/' + this.uiTempInfo[x].id + '/' + this.uiTempInfo[x].run_order + '/index.html'
        // this.caseInfo[x].repLoading = false
      }

      // 所有的状态都改为false
      for (var x in this.clickStatus) {
        this.clickStatus[x] = false
      }
      // 再改单个状态为true
      if (!this.isTemp) {
        this.clickStatus['isUiTemp'] = true
      }
      this.uiCaseInfoLoading = false
    },

    // 获取用例信息
    async getCaseInfo(page_ = 1, size_ = 10) {
      this.caseInfoLoading = true
      var case_ = []
      var caseTotal = 0
      await this.$http({
        url: '/caseService/data/case/list',
        method: 'GET',
        params: {
          outline: false,
          page: page_,
          size: size_,
        }
      }).then(
        function (response) {
          case_ = response.data.items
          caseTotal = response.data.total
        }
      ).catch(function (error) {
        ElMessage.error(error.message)
      })
      this.caseInfo = case_
      this.caseTotal = caseTotal
      // 给每个用例加loading属性
      for (var x in this.caseInfo) {
        this.caseInfo[x].runLoading = false
        this.caseInfo[x].delLoading = false
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
                var scale = Math.round((response.data[x].success + response.data[x].fail) / response.data[x].total * 100)
                if (scale == 100 && response.data[x].fail == 0) {
                  caseInfo[y].percentageStatus = 'success'
                }
                caseInfo[y].percentage = scale
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
    // 全局配置设置
    async getWholeConf() {
      this.confWholeLoading = true
      var wholeConf
      await this.$http({
        url: '/conf/get/setting',
        method: 'GET'
      }).then(
        function (response) {
          wholeConf = response.data
          for (var x in wholeConf.host) {
            wholeConf.host[x].num = x
          }
          for (var x in wholeConf.project) {
            wholeConf.project[x].num = x
          }
          for (var x in wholeConf.unify_res) {
            wholeConf.unify_res[x].num = x
          }
        }
      ).catch(function (error) {
        ElMessage.error(error.message)
      })
      this.confWholeLoading = false
      this.dialogWholeConf = true
      this.confData = wholeConf
      console.log(this.confData);
    },

    async setSetting() {
      this.confWholeCheckLoading = true
      await this.$http({
        url: '/conf/set/setting',
        method: 'PUT',
        data: JSON.stringify(this.confData),
        headers: {
          'content-type': "application/json"
        }
      }).then(
        ElMessage.success('提交成功')
      ).catch(function (error) {
        ElMessage.error(error.message)
      })
      this.confWholeCheckLoading = false
    },

    uploadFile(type_, fileType) {
      this.dialogUpload = true
      this.uploadFileType = type_
      this.fileType = fileType
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
        <el-button-group class="ml-4">
          <!-- 模板信息 -->
          <el-button type="primary" @click="getTempInfo()" :loading="tempInfoLoading">API模板列表</el-button>
          <!-- 用例信息 -->
          <el-button type="primary" @click="getCaseInfo()" :loading="caseInfoLoading">API用例列表</el-button>
          <!-- 文件上传 -->
          <el-button type="primary" @click="uploadFile('temp-har', '.har')">模板用例上传</el-button>
          <!-- 模板组装 -->
          <el-button type="primary" @click="dialogTempSuit = true">模板场景组装</el-button>
        </el-button-group>&nbsp;

        <el-button-group class="ml-4">
          <!-- UI用例信息 -->
          <el-button type="success" @click="getUiCaseInfo()" :loading="uiCaseInfoLoading">UI用例列表</el-button>
          <!-- 编辑器 -->
          <el-button type="success" @click="dialogMonaco = true">UI脚本编辑</el-button>
          <!-- 文件上传 -->
          <el-button type="success" @click="uploadFile('ui-case', '.xlsx')">UI数据上传</el-button>
        </el-button-group>&nbsp;

        <el-button-group class="ml-4">
          <!-- 参数变更 -->
          <el-button type="warning" @click="dialogParamsCharge = true">全局参数变更</el-button>
          <!-- 全局配置 -->
          <el-button type="warning" @click="getWholeConf()" :loading="confWholeLoading">全局配置</el-button>
        </el-button-group>

        <!-- 开关灯 -->
        <span @click.stop="toggleDark()"></span>
        <el-switch size="small" v-model="isDark" />
      </el-affix>
      <el-backtop :right="100" :bottom="100" />
    </el-header>
    <el-main>
      <my-temp-info v-show="clickStatus['isTemp']" :temp-info="tempInfo" :temp-total="tempTotal"></my-temp-info>
      <my-case-info v-show="clickStatus['isCase']" :case-info="caseInfo" :case-total="caseTotal"></my-case-info>
      <my-ui-temp-info v-show="clickStatus['isUiTemp']" :ui-temp-info="uiTempInfo"
        :case-total="uiTempTotal"></my-ui-temp-info>
      <!-- 字段变更的弹窗 -->
      <el-dialog v-model='dialogParamsCharge' width="70%" title="全局参数变更" :close-on-click-modal=false
        :close-on-press-escape=false @close='dialogParamsCharge = false' draggable>
        <my-change v-if="dialogParamsCharge"></my-change>
      </el-dialog>
      <!-- 文件上传的弹窗 -->
      <el-dialog v-model='dialogUpload' width="40%" title="文件上传" @close='dialogUpload = false' draggable>
        <my-upload v-if="dialogUpload" :upload-type="uploadFileType" :file-type="fileType"></my-upload>
      </el-dialog>
      <!-- 模板组装的弹窗 -->
      <el-dialog v-model="dialogTempSuit" width="80%" title="选择接口组装新模板，或创建空模板" :close-on-click-modal=false
        :close-on-press-escape=false @close='dialogTempSuit = false' draggable>
        <my-transfer v-if="dialogTempSuit"></my-transfer>
      </el-dialog>
      <!-- 全局配置弹窗 -->
      <el-dialog v-model="dialogWholeConf" width="50%" title="全局配置项" @close='dialogTempSuit = false' draggable>
        <my-whole-conf v-if="dialogWholeConf" :conf-info="confData"></my-whole-conf>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogWholeConf = false">取消</el-button>
            <el-button type="primary" @click="setSetting()" :loading="confWholeCheckLoading">确认</el-button>
          </span>
        </template>
      </el-dialog>
      <!-- 编辑器 -->
      <el-dialog v-model='dialogMonaco' width="70%" title="Python页面编辑器" :close-on-click-modal=false
        :close-on-press-escape=false @close='dialogMonaco = false' draggable>
        <monaco-editor v-if="dialogMonaco" :ui-temp-value="uiTempValue"></monaco-editor>
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
