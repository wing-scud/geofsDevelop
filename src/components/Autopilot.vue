<template>
<div>
    <el-row>
        <el-col>
            <div class="blockAuto">
                <span>速度</span>
                <div class="el-input-number">
                    <span role="button" class="decrease" @click="numberMin('kias')">
                        <i class="el-icon-minus"></i>
                    </span>
                    <el-input v-model="kias" size="small" style="width:130px">
                    </el-input>
                    <span role="button" class="increase" @click="numberPlus('kias')">
                        <i class="el-icon-plus"></i>
                    </span>
                </div>
            </div>
        </el-col>
    </el-row>
    <el-row>
        <el-col>
            <div class="blockAuto">
                <span>偏航</span>
                <div class="el-input-number" debounce="300">
                    <span role="button" class="decrease" @click="numberMin('hdg')">
                        <i class="el-icon-minus"></i>
                    </span>
                    <el-input v-model="hdg" size="small" style="width:130px">
                    </el-input>
                    <span role="button" class="increase" @click="numberPlus('hdg')">
                        <i class="el-icon-plus"></i>
                    </span>
                </div>
            </div>
        </el-col>
    </el-row>
    <el-row>
        <el-col>
            <div class="blockAuto">
                <span>高度</span>
                <div class="el-input-number" debounce="300">
                    <span role="button" class="decrease" @click="numberMin('height')">
                        <i class="el-icon-minus"></i>
                    </span>
                    <el-input v-model="height" size="small" style="width:130px">
                    </el-input>
                    <span role="button" class="increase" @click="numberPlus('height')">
                        <i class="el-icon-plus"></i>
                    </span>
                </div>
            </div>
        </el-col>
    </el-row>
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
            hdg: 0
        };
    },
    methods: {
        numberMin(key) {
            switch (key) {
                case "kias":
                    this.kias--;
                    break;
                case "height":
                    this.height--;
                    break;
                case "hdg":
                    this.hdg--;
                    break;
            }
        },
        numberPlus(key) {
            switch (key) {
                case "kias":
                    this.kias++;
                    break;
                case "height":
                    this.height++;
                    break;
                case "hdg":
                    this.hdg++;
                    break;
            }
        },
    },
    watch: {
        kias: function (newValue, oldValue) {
            controls.autopilot.kias = newValue
        },
        height: function (newValue, oldValue) {
            controls.autopilot.height = newValue
        },
        hdg: function (newValue, oldValue) {
            controls.autopilot.hdg = newValue
        },
    },
    created() {
    },
};
</script>

<style >
.blockAuto {
    width: 100%;
    height: 40px;
    display: flex;
    margin-top: 10px;
    flex-direction: row;
    margin-bottom: 5px;
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
