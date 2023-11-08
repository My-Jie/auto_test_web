
<script>
import MyTempInfo from "./components/MyTempInfo.vue"
import MyCaseInfo from "./components/MyCaseInfo.vue"
import MyChange from './components/MyChange.vue'
import MyUpload from './components/Upload.vue'
import MyTransfer from "./components/MyTransfer.vue"
import MyWholeConf from './components/WholeConf.vue'
import MonacoEditor from "./components/MonacoEditor.vue"
import MyUiTempInfo from "./components/MyUiTempInfo.vue"
import MyEcharts from "./components/MyEcharts.vue"
import MyEchartsFree from "./components/MyEchartsFree.vue"
import MyStatistic from "./components/MyStatistic.vue"
import MySettingSet from "./components/MySettingSet.vue"
import { ElMessage } from 'element-plus'
import { Check, Close, Histogram, List, UploadFilled, Crop, Grid, HelpFilled, Tools, Edit } from '@element-plus/icons-vue'
// import { useDark, useToggle } from '@vueuse/core'
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
    MyEcharts,
    MyEchartsFree,
    MyStatistic,
    MySettingSet
  },
  data() {
    return {
      Check,
      Close,
      Histogram,
      List,
      UploadFilled,
      Tools,
      Edit,
      HelpFilled,
      Grid,
      Crop,
      // 判断哪个按钮点击了
      clickStatus: {
        isTemp: false,
        isCase: false,
        isUiTemp: false,
        isSetting: false,
      },
      // 存获取的数据
      tempInfo: [],
      caseInfo: [],
      uiTempInfo: [],
      settingInfo: [],
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
      settingLoading: false,
      uiCaseInfoLoading: false,
      caseStatus: false,
      dialogSettingSet: false,
      // isDark: useDark(),

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
        '@allure.title("case_name")  # 这个会自动替换，请勿修改\n' +
        'def test_ui():\n' +
        '\twith sync_playwright() as playwright:\n' +
        '\t\trun(playwright)\n',
      echarts: false,
      freeEcharts: false,
      echartsLoading: false,
      freeEchartsLoading: false,
      apiEcharts: [],
      uiEcharts: [],
      apiFree: null,
      uiFree: null,
      ifMain: false
    }
  },
  provide() {
    return {
      'get_temp': this.getTempInfo,
      'get_case': this.getCaseInfo,
      'get_ui_case': this.getUiCaseInfo,
      'get_setting': this.getSettingSet
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

    //获取计数图
    async getECharts() {
      this.freeEcharts = false
      this.echartsLoading = true
      // 请求api统计数据
      var apiEcharts = []
      await this.$http({
        url: '/statistic/data/case/echarts',
        method: 'GET',
        params: {
          page: 1,
          size: 1000
        }
      }).then(
        function (response) {
          apiEcharts = response.data
        }
      ).catch(function (error) {
        ElMessage.error(error.message)
      })
      this.apiEcharts = apiEcharts

      // 请求ui统计数据
      var uiEcharts = []
      await this.$http({
        url: '/statistic/get/playwright/echarts',
        method: 'GET',
        params: {
          page: 1,
          size: 1000
        }
      }).then(
        function (response) {
          uiEcharts = response.data
        }
      ).catch(function (error) {
        ElMessage.error(error.message)
      })
      this.uiEcharts = uiEcharts
      this.echartsLoading = false

      // 所有的状态都改为false
      for (var x in this.clickStatus) {
        this.clickStatus[x] = false
      }
      this.echarts = true
      this.ifMain = true
    },

    async getEChartsFree() {
      this.echarts = false
      this.freeEchartsLoading = true

      // 请求api树形数据
      var apiEcharts = []
      await this.$http({
        url: '/statistic/api/charts/free',
        method: 'GET',
        params: {
          page: 1,
          size: 1000
        }
      }).then(
        function (response) {
          apiEcharts = response.data
        }
      ).catch(function (error) {
        ElMessage.error(error.message)
      })
      this.apiFree = apiEcharts

      // 请求ui树形数据
      var uiEcharts = []
      await this.$http({
        url: '/statistic/ui/charts/free',
        method: 'GET',
        params: {
          page: 1,
          size: 1000
        }
      }).then(
        function (response) {
          uiEcharts = response.data
        }
      ).catch(function (error) {
        ElMessage.error(error.message)
      })
      this.uiFree = uiEcharts

      // 所有的状态都改为false
      for (var x in this.clickStatus) {
        this.clickStatus[x] = false
      }
      this.freeEcharts = true
      this.freeEchartsLoading = false
      this.ifMain = true
    },

    // 获取模板信息
    async getTempInfo(page_ = 1, size_ = 10, temp_name_ = null) {
      // 关闭定时器
      this.end()
      this.echarts = false
      this.freeEcharts = false

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
          temp_name: temp_name_
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
      this.clickStatus['isTemp'] = true

      this.tempInfoLoading = false
      this.ifMain = true
    },

    async getUiCaseInfo(page_ = 1, size_ = 10, temp_name_ = null) {
      // 关闭定时器
      this.end()
      this.echarts = false
      this.freeEcharts = false
      this.uiCaseInfoLoading = true

      var info_ = []
      var uiTempTotal = 0
      await this.$http({
        url: '/caseUi/get/playwright/list',
        method: 'GET',
        params: {
          page: page_,
          size: size_,
          temp_name: temp_name_,
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
      this.clickStatus['isUiTemp'] = true

      this.uiCaseInfoLoading = false
      this.ifMain = true
    },

    // 获取用例信息
    async getCaseInfo(page_ = 1, size_ = 10, case_name_ = null) {
      this.echarts = false
      this.freeEcharts = false
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
          case_name: case_name_,
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
        this.caseInfo[x].scheduleLoading = false
        this.caseInfo[x].reportLoading = false
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
      this.clickStatus['isCase'] = true

      this.caseInfoLoading = false
      this.ifMain = true

      // 启动定时器
      this.start(5000)

    },
    async getSettingSet() {
      // 关闭定时器
      this.end()
      this.echarts = false
      this.freeEcharts = false

      this.settingLoading = true
      var setting = []
      await this.$http({
        url: '/setting/get/setting',
        method: 'GET',
      }).then(
        function (response) {
          setting = response.data
          for (var x in setting) {
            setting[x].edit = false
            setting[x].del = false
            setting[x].delDisabled = false
            setting[x].EditDisabled = false
          }
        }
      ).catch(
        function (error) {
          ElMessage.error(error.message)

        }
      )
      this.settingLoading = false
      this.settingInfo = setting


      // 所有的状态都改为false
      for (var x in this.clickStatus) {
        this.clickStatus[x] = false
      }
      // 再改单个状态为true
      this.clickStatus['isSettingSet'] = true

      this.ifMain = true
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
    uploadFile(type_, fileType) {
      this.dialogUpload = true
      this.uploadFileType = type_
      this.fileType = fileType
    },

    // 暗黑模式
    // toggleDark() {
    //   useToggle(this.isDark)
    // },
  }
}
</script>


<template>
  <el-container>
    <el-header>
      <el-affix :offset="10">
        <el-button-group class="ml-4">
          <!-- 计数 -->
          <el-button type="default" :icon="Histogram" @click="getECharts()" :loading="echartsLoading">计数</el-button>
          <!-- 关系 -->
          <el-button type="default" :icon="Histogram" @click="getEChartsFree()"
            :loading="freeEchartsLoading">关系</el-button>
        </el-button-group>&nbsp;

        <el-button-group>
          <!-- 模板信息 -->
          <el-button type="primary" :icon="List" @click="getTempInfo()" :loading="tempInfoLoading">API模板</el-button>
          <!-- 用例信息 -->
          <el-button type="primary" :icon="List" @click="getCaseInfo()" :loading="caseInfoLoading">API用例</el-button>
          <!-- 文件上传 -->
          <el-button type="primary" :icon="UploadFilled" @click="uploadFile('temp-har', '.har')">数据上传</el-button>
          <!-- 模板组装 -->
          <el-button type="primary" :icon="Grid" @click="dialogTempSuit = true">模板组装</el-button>
          <!-- 参数变更 -->
          <el-button type="primary" :icon="Crop" @click="dialogParamsCharge = true">参数变更</el-button>
        </el-button-group>&nbsp;

        <el-button-group class="ml-4">
          <!-- UI用例信息 -->
          <el-button type="success" :icon="List" @click="getUiCaseInfo()" :loading="uiCaseInfoLoading">UI用例</el-button>
          <!-- 编辑器 -->
          <el-button type="success" :icon="Edit" @click="dialogMonaco = true">UI脚本</el-button>
          <!-- 文件上传 -->
          <el-button type="success" :icon="UploadFilled" @click="uploadFile('ui-case', '.xlsx')">数据上传</el-button>
        </el-button-group>&nbsp;

        <el-button-group class="ml-4">
          <!-- 环境组装 -->
          <el-button type="warning" :icon="HelpFilled" @click="getSettingSet()" :loading="settingLoading">环境</el-button>
          <!-- 全局配置 -->
          <el-button type="warning" :icon="Tools" @click="dialogWholeConf = true">配置</el-button>
        </el-button-group>

        <!-- 开关灯 -->
        <!-- <span @click.stop="toggleDark()"></span>
        <el-switch size="small" v-model="isDark" /> -->
      </el-affix>
      <el-backtop :right="100" :bottom="100" />
    </el-header>
    <el-main class="main" v-if="ifMain">
      <my-temp-info v-if="clickStatus['isTemp']" :temp-info="tempInfo" :temp-total="tempTotal"></my-temp-info>
      <my-case-info v-if="clickStatus['isCase']" :case-info="caseInfo" :case-total="caseTotal"></my-case-info>
      <my-ui-temp-info v-if="clickStatus['isUiTemp']" :ui-temp-info="uiTempInfo"
        :ui-temp-total="uiTempTotal"></my-ui-temp-info>
      <my-setting-set v-if="clickStatus['isSettingSet']" :setting-info="settingInfo"></my-setting-set>

      <my-statistic v-if="echarts || freeEcharts"></my-statistic>
      <br>
      <my-echarts v-if="echarts" :api-echarts="apiEcharts" :ui-echarts="uiEcharts"></my-echarts>
      <my-echarts-free v-if="freeEcharts" :api-free="apiFree" :ui-free="uiFree"></my-echarts-free>
    </el-main>
    <!-- 参数变更的弹窗 -->
    <el-dialog class="case-data" v-model='dialogParamsCharge' width="70%" title="参数变更" :close-on-click-modal=false
      @close='dialogParamsCharge = false' draggable>
      <my-change v-if="dialogParamsCharge"></my-change>
    </el-dialog>
    <!-- 文件上传的弹窗 -->
    <el-dialog class="up" v-model='dialogUpload' width="60%" title="文件上传" @close='dialogUpload = false' draggable>
      <my-upload v-if="dialogUpload" :upload-type_="uploadFileType" :file-type_="fileType"></my-upload>
    </el-dialog>
    <!-- 模板组装的弹窗 -->
    <el-dialog class="case-data" v-model="dialogTempSuit" width="80%" title="选择接口组装新模板，或创建空模板" :close-on-click-modal=false
      @close='dialogTempSuit = false' draggable>
      <my-transfer v-if="dialogTempSuit"></my-transfer>
    </el-dialog>
    <!-- 配置弹窗 -->
    <el-dialog class="wc" v-model="dialogWholeConf" width="60%" title="配置项" draggable>
      <my-whole-conf v-if="dialogWholeConf"></my-whole-conf>
    </el-dialog>
    <!-- 编辑器 -->
    <el-dialog class="mc" v-model='dialogMonaco' width="70%" title="Python页面编辑器" :close-on-click-modal=false
      @close='dialogMonaco = false' draggable>
      <monaco-editor v-if="dialogMonaco" :ui-temp-value="uiTempValue"></monaco-editor>
    </el-dialog>
  </el-container>
</template>


<style>
main {
  background-color: rgba(192, 192, 192, 0.6);
  border-radius: 20px
}

.el-dialog.tf {
  background: url("./assets/transfer.png");
  background-size: 85% 100%;
}

.el-dialog.up {
  background: url("./assets/upload.png");
  background-size: 100%;
}

.el-dialog.wc {
  background: url("./assets/wholeConf.png");
  background-size: 100%;
  --el-text-color-primary: aliceblue;
}

.el-dialog.cg {
  background: url("./assets/charge.png");
  background-size: 100%;
  --el-text-color-primary: aliceblue;
}
</style>
