<template>
<div  class="autoRow">
    <div class="blockAuto">
        <span>速度</span>
            <el-input v-model="kias" size="small" style="width:130px">
            </el-input>
    </div>
    <div class="blockAuto">
        <span>偏航</span>
            <el-input v-model="heading" size="small" style="width:130px">
            </el-input>
    </div>
    <div class="blockAuto">
        <span>高度</span>
            <el-input  v-model="height" size="small" style="width:130px">
            </el-input>
    </div>
</div>
</template>

<script>
import {
    fixAngle360,
    clamp
} from "../lib/utils/utils"
import controls from "../lib/modules/controls"
export default {
    name: 'Autopilot',
    data() {
        return {
            kias: 0,
            height: 0,
            heading: 0
        };
    },
    methods: {},
    watch: {
        kias: function (newValue, oldValue) {
            controls.autopilot.setKias(Number(newValue))
        },
        height: function (newValue, oldValue) {
            controls.autopilot.setAltitude(Number(newValue))
        },
        heading: function (newValue, oldValue) {
            controls.autopilot.setHeading(Number(newValue))
        },
    },
    created() {
        this.kias=controls.autopilot.kias;
        this.heading=controls.autopilot.heading;
        this.height=controls.autopilot.altitude;
    },
};
</script>

<style>
.autoRow{
    display: flex;
    flex-direction: row;
}
.blockAuto {
    width: 100px;
    height: 40px;
    display: flex;
    margin-top: 10px;
    flex-direction: row;
    margin-bottom: 5px;
    margin-left:15px;
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
</style>
