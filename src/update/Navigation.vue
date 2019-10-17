<template>
<div class="root"> 
  <div class="menu_item" v-for="option in options" :key="option.name" :title="option.name">
        <el-button icon="el-icon-search"  style="width:80%;height:100%" @click="clickButton" circle></el-button>
        <!-- <el-image :src="require('@/assets/'+data)"></el-image>   --> <!-- 图片地址加载问题,:src和src，@和../  require--> 
     <!-- <img src="@/assets/options/aircraft.png" width="80%" height="100%"> -->
  </div>
  <!-- 二种，信息量大的drawer，小的popover,二种生成方式不同 -->
  <el-drawer
      title="飞机"
      custom-class="drawer"
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :wrapperClosable="true"
      :modal="false"
      direction="ltr" >
      <Setting/>
      <!-- <LocationDrawer/> -->
      <!-- <AircraftDrawer/> -->
</el-drawer>
<div class="menu_item">
    <el-image :src='!autopilotShow? autopilotImageOff : autopilotImageOn'  @click="toggle"  
            :alt='!autopilotShow?"toggleOff":"toggleOn"' :title='!autopilotShow ?"toggleOff":"toggleOn"'> </el-image>
</div>
<!-- 自定义的就用custom-class？？？好像都可以 -->
<el-popover  width="185px" v-model='autopilotShow' custom-class="el-popover" title="自动驾驶" >
      <Autopilot/>
      <!-- popover的slot属性怎么使用 -->
      <!-- 应该给这个button添加特殊，所有就不用循环打印，就，纯手写？？ -->
      <!-- 这个button点击一次，打开面板，悬浮显示toggle on，再点击关闭,点击成功则一直保持一个状态 -->
</el-popover>
</div>
</template>

<script>
import AircraftDrawer from "./AircraftDrawer"
import Autopilot from "./Autopilot"
import controls from "../lib/modules/controls"
import LocationDrawer from "./LocationDrawer"
import Setting from "./Setting/Setting"
  export default {
    name:"Navigation",
    components:{
      AircraftDrawer,
      Autopilot,
      LocationDrawer,
      Setting
    },
    data() {
      return{
         drawer: false,
         autopilotImageOff:require('../assets/autopilotOff.png'),
         autopilotImageOn:require('../assets/autopilotOn.png'),
         autopilotShow:false,
         options:[
          {src:"../assets/options/aircrft.png",name:"aircraft"},
          {src:"../assets/logo.png",name:"autopilot"},
        ],
        visible: false,
      }
    },
    methods: {
      clickButton(){
        this.drawer = !this.drawer
        if(this.drawer===true){
     
          geofs.initializePreferencesPanel();
        }
        else{
          geofs.savePreferencesPanel()
        }
        
      },
      toggle(){
        this.autopilotShow=!this.autopilotShow;
        controls.autopilot.toggle();
      }
    }
  }
</script>
<style>
.root{
  height:100%;
  width:100%;
  box-shadow: rgba(0, 0, 0, 0.247059) 0px 14px 45px, rgba(0, 0, 0, 0.219608) 0px 10px 18px!important;
}
 .menu_item{
   margin:0 10% 5px 10%;
   width:80%;
   height:6%;
   padding-top:10px;
 }
 .drawer{
   width: 300px !important;
   left: 4.2% !important;
   overflow-y: auto;
 }
 .el-popover{
   left:4.2% !important
 }
 .el-drawer{
     /* background-color: rgba(1,27,36,0.6)	; */
 }
 .el-drawer__header {
    margin-bottom: 15px;
}
::-webkit-scrollbar {/*滚动条整体样式*/
        width: 5px;     /*高宽分别对应横竖滚动条的尺寸*/
    }
::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
        border-radius: 10px;
        -webkit-box-shadow: inset 0 0 5px rgba(211,211,211,0.2);
        background: rgba(119,136,153,0.2);
    }
::-webkit-scrollbar-track {/*滚动条里面轨道*/
        -webkit-box-shadow: inset 0 0 5px rgba(211,211,211,0.2);
        border-radius: 10px;
        background: #EDEDED;
    }
</style>