<template>
<div class="mapDrawer">
    <el-button class="creatLabel" title="创建飞行路径" @click="createPath" :style="{backgroundColor:color}" circle><i class="iconfont">&#xe617;</i></el-button>
    <el-button class="clearLabel" title="清除路径" @click="clearPath" circle><i class="iconfont">&#xe62b;</i></el-button>
    <div class="map" id="autopilotMap"></div>
    <div class="autopilot">
        <el-button type="primary" @click="autoFlight" class="flyButton" plain>开始飞行</el-button>
        <div class="autoProperty">
            <div class="block">
                <span>速度</span>
                <div class="el-input-number" >
                    <el-input v-model="kias" size="small" style="width:130px">
                    </el-input>

                </div>
            </div>
            <div class="block">
                高度
                <div class="el-input-number" >
                    <el-input v-model="height" size="small" style="width:130px">
                    </el-input>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import geofs from "../lib/geofs"
import ui from "../lib/ui/ui"
export default {
    name: "AutomapDrawer",
    components: {},
    data() {
        return {
            height: 0,
            kias: 0,
            color: "white",
        }
    },
    methods: {
        createPath() {
            if (geofs.api.map.flightPathOn) {
                this.color = "white";
                geofs.api.map.stopCreatePath()
            } else {
                this.color = "#ADD8E6"
                geofs.api.createPath()
            }

        },
        clearPath() {
            geofs.api.clearPath()
        },
        autoFlight() {
            this.color = "white";
            controls.autopilot.autoLocation = 0
            controls.autopilot.setKias(Number(this.kias))
            controls.autopilot.setAltitude(Number(this.height))
            geofs.api.map.autoFlight()
        }
    },
    mounted() {
        ui.createMap();
    },
    watch: {
        //
    },
}
</script>

<style scoped>
.map {
    width: 100%;
    height: 80%;
}

.mapDrawer {
    position: flex;
    flex-direction: row;
    width: 100% !important;
    height: calc(100% - 56px)
}

.creatLabel {
    position: absolute;
    top: 70px;
    right: 20px;
    z-index: 1000;
}

.autopilot {
    width: 100%;
    height: 20%;
    margin-top: 10px;
}

.flyButton {
    float: left;
    position: relative;
    top: 30px;
}

.autoProperty {
    float: right;
    height: 100%;
    width: 60%;
    margin-right: 10px;
}

.block {
    width: 100%;
    height: 40px;
    display: flex;
    margin-top: 10px;
    flex-direction: row;
    margin-bottom: 10px;
}

.clearLabel {
    position: absolute;
    top: 120px;
    right: 20px;
    z-index: 1000;
}

.el-input-number {
    margin-left: 20px;
    width: 130px !important;
}

.decrease {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1;
    background-color: white
}

.increase {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;
    background-color: white
}
</style><style scoped>
@import '../assets/css/font.css'
</style>
