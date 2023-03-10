<template>
    <el-table :data="gatherData" stripe fit>
        <el-table-column label="序号" prop="suite" width="30px" align="center"></el-table-column>
        <el-table-column label="数据集名称" prop="name" width="150px" align="center"></el-table-column>
        <el-table-column label="Number" prop="number" width="100px" align="center"></el-table-column>
        <el-table-column label="Path" prop="path" show-overflow-tooltip='true' width="300px"></el-table-column>
        <el-table-column label="Params" prop="params" show-overflow-tooltip='true' width="400px">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.params, null, 1) }}</div>
            </template>
        </el-table-column>
        <el-table-column label="Data" prop="data" show-overflow-tooltip='true' width="400px">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.data, null, 1) }}</div>
            </template>
        </el-table-column>
        <el-table-column label="Check" prop="check" show-overflow-tooltip='true' width="400px">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.check, null, 1) }}</div>
            </template>
        </el-table-column>
        <el-table-column label="Headers" prop="headers" show-overflow-tooltip='true' width="400px">
            <template #default="scope">
                <div>{{ JSON.stringify(scope.row.headers, null, 1) }}</div>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
export default {
    name: 'MyGather',
    props: {
        'gatherData': Array
    },
    data() {
        return {

        }
    }
}
</script>

