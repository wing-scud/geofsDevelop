<template>
<div>
    <el-row>
        <el-col :span="1">
            <Navigation></Navigation>
        </el-col >
        <el-col :span="23">
            <Map></Map>
        </el-col >
    </el-row>
    
    
</div>
</template>
<script>
import "../lib/geofs"

import Navigation from "./Navigation"
import Map from "./Map"
export default {
    name:"Index",
    components:{
        Navigation,
        Map,
    }
}
</script>
<style >
 
 
</style>