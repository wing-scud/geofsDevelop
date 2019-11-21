<template>
<div class="root">
    <!-- <div class="menu_item"  title="自动驾驶">
      <el-button circle  @click="clickButton($event)"  id="autopilot" ><i class="iconfont">   &#xe622;</i></el-button>
  </div> -->
    <!-- 回放按钮暂且不做 -->
    <!-- Bug:
      给button绑定事件，附带的icon点击则无效 -->
    <div class="menu_item" title="飞机">
        <el-button @click="clickButton($event)" id="aircraft" circle><i class="iconfont">&#xe600;</i></el-button>
    </div>
    <div class="menu_item" title="位置">
        <el-button icon="el-icon-location-information" @click="clickButton($event)" id="position" circle></el-button>
    </div>
    <div class="menu_item" title="声音">
        <el-button icon="el-icon-message-solid" @click="clickButton($event)" id="volume" circle></el-button>
    </div>
    <div class="menu_item" title="相机">
        <el-button icon="el-icon-camera-solid" @click="clickButton($event)" id="camera" v-popover:camera circle></el-button>
    </div>
    <div class="menu_item" title="设置">
        <el-button icon="el-icon-s-tools" @click="clickButton($event)" id="setting" circle></el-button>
    </div>
    <div class="menu_item" title="地图">
        <el-button @click="clickButton($event)" id="map" circle><i class="iconfont">&#xec72;</i></el-button>
    </div>
    <div class="menu_item" title="暂停">
        <el-button @click="clickButton($event)" id="stop" circle><i class="iconfont"> &#xe612;</i></el-button>
    </div>
    <div class="menu_item" title="重置">
        <el-button @click="clickButton($event)" id="reset" circle><i class="iconfont">&#xe7fe;</i></el-button>
    </div>
    <div class="menu_item_bottom" title="更多">
        <el-button id="more" circle><i class="iconfont"> &#xe601;</i></el-button>
    </div>
    <div class="menu_item" title="自动驾驶">
        <el-button @click="clickButton($event)" v-popover:autopilot id="autopilot" :style="{backgroundColor:autopilotShow?'#87CEEB':'white'}" circle> <i class="iconfont">&#xe622;</i></el-button>
    </div>
    <!-- 二种，信息量大的drawer，小的popover,二种生成方式不同 -->
    <el-drawer :title="format(current)" custom-class="drawer" :modal-append-to-body="false" :visible.sync="drawer"
       :wrapperClosable="false" :modal="false" direction="ltr">
        <Setting v-on:update="receive" v-if="current==='setting'" />
        <!-- <component :is="componentId"></component>  不使用的原因，keep-alive-->
        <keep-alive>
            <Automap v-if="current==='map'" />
        </keep-alive>
        <LocationDrawer v-if="current==='position'" />
        <AircraftDrawer v-if="current==='aircraft'" />
    </el-drawer>
    <div class="autopilotPosition" v-if="autopilotShow"  @click="showPanel">
         <i class="iconfontBigArrow" v-if="show">&#xec75;</i>
         <i class="iconfontBigArrow" v-else>&#xec74;</i>
    </div>
    <Autopilot v-if="show" />
    <el-popover width="80px" custom-class="el-popover" :title="format(current)" placement="right-start" ref="camera">
        <Camera v-if="current==='camera'" />
    </el-popover>
</div>
</template>

<script>
import range from "../lib/utils/aircraftRange"
import Automap from "./Automap"
import AircraftDrawer from "./AircraftDrawer"
import Autopilot from "./Autopilot"
import controls from "../lib/modules/controls"
import LocationDrawer from "./LocationDrawer"
import Setting from "./Setting/Setting"
import aircraft from '../lib/aircraft/Aircraft'
import Camera from "./Camera"
export default {
    name: "Navigation",
    components: {
        AircraftDrawer,
        Autopilot,
        LocationDrawer,
        Setting,
        Automap,
        Camera
    },
    mounted(){ 
           if (!controls.autopilot.on) {
                this.autopilotShow=false
              } else {
                this.autopilotShow=true
            }
        setTimeout(() => {
            this.autopilotShow = !this.autopilotShow;
            controls.autopilot.toggle();
        }, 1300);
    },
    data() {
        return {
            drawer: false,
            autopilotShow: false,
            current: "",
            color: "",
            show: false
        }
    },
    methods: {
        showPanel() {
            this.show = !this.show
        },
        receive(val){
            this.drawer=false
        },
        clickButton(e) {
            switch (e.target.id) {
                case "aircraft":
                    this.current = 'aircraft';
                    this.drawer = !this.drawer
                    break;
                case "position":
                    this.current = 'position';
                    this.drawer = !this.drawer
                    break;
                case "volume":
                    audio.toggleMute();
                    break;
                case "camera":
                    this.current = 'camera'
                    break;
                case "setting":
                    this.current = 'setting';
                    this.drawer = !this.drawer
                    break;
                case "map":
                    this.current = 'map';
                    this.drawer = !this.drawer
                    break;
                case "stop":
                    geofs.togglePause()
                    break;
                case "reset":
                    geofs.resetFlight()
                    break;
                case "autopilot":
                    this.autopilotShow = !this.autopilotShow;
                    controls.autopilot.toggle();
                    if (!controls.autopilot.on) {
                        this.autopilotShow=false
                    } else {
                        this.autopilotShow=true
                    }
                    break;
            }
            if (this.drawer === true) {
                geofs.initializePreferencesPanel();
            } else {
                geofs.savePreferencesPanel()
            }
        },
        format(val) {
            switch (val) {
                case "aircraft":
                    return "飞机"
                    break;
                case "position":
                    return "位置"
                    break;
                case "setting":
                    return "设置"
                    break;
                case "map":
                    return "地图"
                    break;
                case "autopilot":
                    return "自动驾驶"
                    break;
                case "camera":
                    return "相机"
                    break;
            }
        },
    },
    watch:{
        // 'controls.autopilot.on':function(){
        //             if (!controls.autopilot.on) {
        //         this.autopilotShow=false
        //        this.color = "white"
        //       } else {
        //         this.autopilotShow=true
        //         this.color = "#87CEEB"
        //     }
        // }
    }
}
</script>

<style>
.root {
    height: 100%;
    width: 100%;
    box-shadow: rgba(0, 0, 0, 0.247059) 0px 14px 45px, rgba(0, 0, 0, 0.219608) 0px 10px 18px !important;
}
.v-modal{
    width:0;
    height:0;
}
.menu_item {
    margin: 0 10% 5px 10%;
    width: 40px;
    height: 39px;
    padding-top: 10px;
}
.el-dialog__wrapper{
    width: 300px !important;
    left: 60px !important;
    border-left:1px solid #0000002b;
}
.drawer {
    padding-left:5px;
    width: 300px !important;
}
.autopilotPosition {
    width: 30px;
    height: 30px;
    position: fixed;
    right: 10px;
    top: 30px;
    z-index: 1000;
    /*background-color:rgba(97,117,157)*/
}

.menu_item_bottom {
    position: fixed;
    left: 10px;
    bottom: 20px;
    width: 40px;
    height: 39px;
}

/* .el-button:focus {
    color: #606266;
    border-color:  #DCDFE6;
    background-color: rgb(255, 255, 255);
} */

.el-popover {
    left: 4.2% !important
}
.el-drawer__header {
    margin-bottom: 15px;
}

::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 5px;
    /*高宽分别对应横竖滚动条的尺寸*/
}

::-webkit-scrollbar-thumb {
    /*滚动条里面小方块*/
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 5px rgba(211, 211, 211, 0.2);
    background: rgba(119, 136, 153, 0.2);
}

::-webkit-scrollbar-track {
    /*滚动条里面轨道*/
    -webkit-box-shadow: inset 0 0 5px rgba(211, 211, 211, 0.2);
    border-radius: 10px;
    background: #EDEDED;
}

i,button span {
    pointer-events: none;
}
</style>
<style scoped>
@import '../assets/css/font.css'
</style>
