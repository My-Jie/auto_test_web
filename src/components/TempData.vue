<template>
    <el-table v-loading='loading' :data="tempData" stripe fit>
        <el-table-column label="number" prop="number" type="index" :index="indexMethod" width="100%" align="center"></el-table-column>
        <el-table-column label="host" prop="host" width="300px"></el-table-column>
        <el-table-column label="path" prop="path" width="300px"></el-table-column>
        <el-table-column label="method" prop="method" width="100%" align="center"></el-table-column>
        <el-table-column label="code" prop="code" width="100%" align="center"></el-table-column>
        <el-table-column label="json_body" prop="json_body" width="100%" align="center"></el-table-column>
        <el-table-column label="params" prop="params" show-overflow-tooltip='true' >
            <template #default="scope">
                <json-viewer :value="scope.row.params" />
                <!-- <p>{{ JSON.stringify(scope.row.params, null, 1) }}</p> -->
            </template>
        </el-table-column>
        <el-table-column label="data" prop="data" show-overflow-tooltip='true'>
            <template #default="scope">
                <json-viewer :value="scope.row.data" />
                <!-- <json-viewer :value="JSON.stringify(scope.row.data, 4)" /> -->
                <!-- <p>{{ JSON.stringify(scope.row.data, null, 1) }}</p> -->
            </template>
        </el-table-column>
        <el-table-column label="response" prop="response" show-overflow-tooltip='true'>
            <template #default="scope">
                <json-viewer :value="scope.row.response" />
                <!-- <json-viewer :value="JSON.stringify(scope.row.data, 4)" /> -->
                <!-- <p>{{ JSON.stringify(scope.row.data, null, 1) }}</p> -->
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
export default {
    name: 'TempData',
    props: {
        'tempData': Array
    },

    data() {
        return {
            isTest: 111111
        }
    },


    methods: {
        indexMethod(index) {
            return this.tempData[index]['number']
        }
    }
}

</script>