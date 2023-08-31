<template>
    <el-table :data="jsonpathData" stripe fit border>
        <el-table-column type="index" width="50px" align="center" show-overflow-tooltip />
        <el-table-column label="jsonpath" prop="jsonpath" width="300" show-overflow-tooltip></el-table-column>
        <el-table-column label="count" prop="count" align="center" width="70" show-overflow-tooltip></el-table-column>
        <el-table-column label="path" prop="path" align="center" width="300" show-overflow-tooltip></el-table-column>
        <el-table-column label="params" prop="params" align="center" width="300" show-overflow-tooltip></el-table-column>
        <el-table-column label="data" prop="data" align="center" width="300" show-overflow-tooltip></el-table-column>
        <el-table-column label="headers" prop="headers" align="center" width="300" show-overflow-tooltip></el-table-column>
        <el-table-column label="check" prop="check" align="center" width="300" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" align="center" fixed="right">
            <el-button :icon="Postcard" type="primary" size="small"></el-button>
        </el-table-column>
    </el-table>
</template>

<script>
import { Postcard } from '@element-plus/icons-vue'
export default {
    name: 'CaseJsonpath',
    props: {
        'jsonpathData': Array,
    },


    data() {

        return {
            Postcard,

        }
    }
}
</script>

<style lang="scss" scoped></style>