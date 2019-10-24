<template>
    <div class="mapDrawer">
           <el-button class="creatLabel" title="创建飞行路径" @click="createPath" circle><i class="iconfont">&#xec73;</i></el-button>
           <el-button class="clearLabel" title="清除路径" @click="clearPath" circle><i class="iconfont">&#xe62b;</i></el-button>
            <div class="map" id="autopilotMap">
            </div>
            <div class="autopilot">
                asssssssssssd
            </div>
        </div>
</template>
<script>
import geofs from "../lib/geofs"
import ui from "../lib/ui/ui"
export default {
    name:"Automap",
    components:{
    },
    data(){
        return{
        }
    },
    methods:{
        createPath(){
            geofs.api.createPath()
        },
        clearPath(){
            geofs.api.clearPath()
        }
    },
    mounted(){
         ui.createMap();
    },
    beforeDestory(){
        ui.stopMap();
    }
}
</script>
<style scoped>
.map{
    width:100%;
    height:70%;
    min-height:500px;
}
.mapDrawer{
    position:flex;
    flex-direction: row;
    width:100%;
    height:100%;
}
.creatLabel{
    position: absolute;
    top:70px;
    right:20px;
    z-index:1000;
}
.clearLabel{
    position: absolute;
    top:120px;
    right:20px;
    z-index:1000;
}
</style>>

<style scoped>
  @import '../assets/css/font.css'
</style>