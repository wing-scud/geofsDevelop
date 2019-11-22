<template>
<div>
    <div class="geofs">
        <div class="bar">
            <Navigation></Navigation>
        </div >
        <div class="page">
            <Map></Map>
        </div >
    </div>
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
    },
    created(){
    }
}
</script>
<style >
 .geofs{
     width:100%;
     height:100%;

 }
 .bar{
     width:60px;
     height:100%;
     float: left;
 }
 .page{
     float: left;
     width: calc(100% - 60px);
     height:100%;
 }
</style>