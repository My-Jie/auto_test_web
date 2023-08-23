<template>
    <el-collapse :v-model="activeName2 = '1'" accordion>
        <el-collapse-item title=" 自定参数表达式(*双花括号)" name="1">
            <el-descriptions border :size="'small'">
                <el-descriptions-item label="直接提取">%{key}</el-descriptions-item>
            </el-descriptions>
        </el-collapse-item>
        <el-collapse-item title=" JsonPath表达式(*双花括号)" name="2">
            <el-descriptions border :size="'small'" :column="column">
                <el-descriptions-item label="提取response">{number.$.jsonPath}</el-descriptions-item>
                <el-descriptions-item label="提取response-headers">{number.<font color="#F29492">h</font>$.jsonPath}</el-descriptions-item>
                <el-descriptions-item label="索引切片(组合时后置)">{number.$.jsonPath<font color="#F29492">|index:index</font>}</el-descriptions-item>
                <el-descriptions-item label="列表取值(组合时后置)">{number.$.jsonPath<font color="#F29492">?number</font>}</el-descriptions-item>
                <el-descriptions-item label="同级邻居确认">{number.$.jsonPath<font color="#F29492">,string in key,string ==
                    key</font>}</el-descriptions-item>
            </el-descriptions>
        </el-collapse-item>
        <el-collapse-item title=" 假数据表达式(*单花括号)" name="3">
            <el-descriptions border :size="'small'" :column="column">
                <el-descriptions-item label="身份证">{ssn}</el-descriptions-item>
                <el-descriptions-item label="电话">{phone_number}</el-descriptions-item>
                <el-descriptions-item label="银行卡">{credit_card_number}</el-descriptions-item>
                <el-descriptions-item label="城市">{city}</el-descriptions-item>
                <el-descriptions-item label="地址">{address}</el-descriptions-item>
                <el-descriptions-item label="随机数字">{random_int.1} number为长度</el-descriptions-item>
                <el-descriptions-item label="随机小写字母">{random_lower.1} number为长度</el-descriptions-item>
                <el-descriptions-item label="随机大写字母">{random_upper.1} number为长度</el-descriptions-item>
                <el-descriptions-item label="随机大小写字母">{random_letter.1} number为长度</el-descriptions-item>
                <el-descriptions-item label="随机汉字">{random_cn.1} number为长度</el-descriptions-item>
                <el-descriptions-item label="数字计算">{compute}</el-descriptions-item>
                <el-descriptions-item label="时间字符串">{time_str.1} 同时间戳</el-descriptions-item>
                <el-descriptions-item label="时间戳">{time_int.0} 0:当前时间, -1:当前时间前一天, 1:当前时间后一天,-2:前一天00:00:00,
                    2:后一天23:59:59</el-descriptions-item>
            </el-descriptions>
        </el-collapse-item>
    </el-collapse>
</template>

<script>
export default {
    name: 'MyCollapse',

    props: {
        'column': Number
    },

    data() {
        return {}
    }
}
</script>

<style lang="scss" scoped></style>