<template>
<div class="root">
    <template v-for=" drawer in drawers">
        <div class="menu_item" :title="drawer.title" :key="drawer.id">
            <el-button @click="clickDrawer($event)" :id="drawer.id" circle>
                <i class="iconfont" v-html="drawer.icon"></i>
            </el-button>
        </div>
    </template>
    <div class="menu_item" title="自动驾驶">
        <el-button @click="clickButton($event)" id="autopilot" :class="autopilot.on?'onActive':''" circle>
            <i class="iconfont">&#xe622;</i>
        </el-button>
    </div>
    <div class="menu_item" title="声音">
        <el-button @click="clickButton($event)" id="volume" circle>
            <i class="iconfont">&#xe62f;</i>
        </el-button>
    </div>
    <div class="menu_item" title="相机">
        <el-button @click="clickButton($event)" id="camera" v:popover:camera circle>
            <i class="iconfont">&#xe74a;</i>
        </el-button>
    </div>
    <div class="menu_item" title="暂停">
        <el-button @click="clickButton($event)" id="stop" circle>
            <i class="iconfont"> &#xe612;</i>
        </el-button>
    </div>
    <div class="menu_item" title="重置">
        <el-button @click="clickButton($event)" id="reset" circle>
            <i class="iconfont">&#xe7fe;</i></el-button>
    </div>
    <div class="menu_item_bottom" title="更多">
        <el-button id="more" circle><i class="iconfont"> &#xe601;</i>
        </el-button>
    </div>
    <el-drawer custom-class="drawer" :modal-append-to-body="false" :visible.sync="drawer" :wrapperClosable="false" :modal="false" direction="ltr">
        <keep-alive>
            <component :is="current"></component>
        </keep-alive>
    </el-drawer>
    <div class="autopilotPosition" v-if="autopilot.on" @click="showPanel">
        <i class="iconfontBigArrow">&#xe602;</i>
    </div>
    <!-- 状态管理  -->
    <Autopilot v-if="show && autopilot.on" />
    <el-popover width="80px" popper-class="el-popover" :value="cameraShow">
        <Camera></Camera>
    </el-popover>
</div>
</template>

<script>
import Camera from "./Camera";
import geofs from "../lib/geofs";
import audio from "../lib/modules/audio";
import controls from "../lib/modules/controls";
import aircraft from '../lib/aircraft/Aircraft';
import range from "../lib/utils/aircraftRange";
import AutomapDrawer from "./AutomapDrawer";
import AircraftDrawer from "./AircraftDrawer";
import Autopilot from "./Autopilot";
import LocationDrawer from "./LocationDrawer";
import SettingDrawer from "./Setting/SettingDrawer";

export default {
    name: "Navigation",
    components: {
        AircraftDrawer,
        Autopilot,
        LocationDrawer,
        SettingDrawer,
        AutomapDrawer,
        Camera
    },
    data() {
        return {
            drawer: false,
            current: "",
            color: [],
            show: false,
            cameraShow: false,
            autopilot: controls.autopilot,
            // audioOn:audio.on, //没有追踪声音的动态变化，data的追踪依赖
            // pause:geofs.pause,
            drawers: [{
                    title: "飞机",
                    id: "AircraftDrawer",
                    icon: "&#xe600;"
                },
                {
                    title: "位置",
                    id: "LocationDrawer",
                    icon: "&#xe7f1;"
                },
                {
                    title: "设置",
                    id: "SettingDrawer",
                    icon: "&#xe699;"
                },
                {
                    title: "地图",
                    id: "AutomapDrawer",
                    icon: "&#xec72;"
                },
            ]
        }
    },
    mounted() {

    },
    methods: {
        showPanel() {
            this.show = !this.show
        },
        clickDrawer(e) {
            if (this.current === e.target.id) {
                if (this.drawer === false) {
                    this.drawer = true;
                } else {
                    this.drawer = false;
                }
            } else {
                this.drawer = true;
            }
            this.current = e.target.id;
            if (this.drawer === false) {
                geofs.savePreferences();
            }
        },
        clickButton(e) {
            switch (e.target.id) {
                case "volume":
                    audio.toggleMute();
                    break;
                case "camera":
                    this.drawer = false
                    this.cameraShow = this.cameraShow ? false : true;
                    break;
                case "stop":
                    geofs.togglePause()
                    break;
                case "reset":
                    geofs.resetFlight()
                    break;
                case "autopilot":
                    this.drawer = false
                    controls.autopilot.toggle();
            }
        },
    },
}
</script>

<style>
.root {
    height: 100%;
    width: 100%;
    box-shadow: rgba(0, 0, 0, 0.247059) 0px 14px 45px, rgba(0, 0, 0, 0.219608) 0px 10px 18px !important;
}

.v-modal {
    width: 0;
    height: 0;
}

.menu_item {
    margin: 0 10% 5px 10%;
    width: 40px;
    height: 39px;
    padding-top: 10px;
}

.el-dialog__wrapper {
    width: 300px !important;
    left: 4.1% !important;
    border-left: 1px solid #0000002b;
}

.onActive {
    color: #409EFF;
    background-color: #d5e1ee !important;
}

.drawer {
    padding-left: 5px;
    width: 300px !important;
}

.autopilotPosition {
    width: 30px;
    height: 30px;
    position: fixed;
    right: 10px;
    top: 30px;
    z-index: 1000;
}

.menu_item_bottom {
    position: fixed;
    left: 10px;
    bottom: 20px;
    width: 40px;
    height: 39px;
}

.el-collapse-item__content {
    padding-bottom: 10px !important;
}

.el-popover {
    position: absolute;
    left: 60px !important;
    top: 50%;
}

.el-drawer__header {
    margin-bottom: 15px;
}

::-webkit-scrollbar {
    width: 5px;
}

::-webkit-scrollbar-thumb {
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

i,
button span {
    pointer-events: none;
}
</style><style scoped>
@import '../assets/css/font.css'
</style>
