<template>
<div class="panel">
    <div class="blockAuto">
        <!-- <span>速度</span> -->
        <el-slider v-model="kias" :min=0 :max=500 :marks="kiasMarks" style="width:130px">
        </el-slider>
        <!-- <el-input v-model="kias" size="small" style="width:130px">
        </el-input> -->
    </div>
    <div class="blockAuto">
        <!-- <span>偏航</span> -->
        <el-slider v-model="heading" :marks="headingMarks" style="width:130px">
        </el-slider>
        <!-- <el-input v-model="heading" size="small" style="width:130px">
        </el-input> -->
    </div>
    <div class="blockAuto">
        <!-- <span>高度</span> -->
        <el-slider v-model="height" :marks="heightMarks"  :min=0 :max=10000 style="width:130px">
        </el-slider>
        <!-- <el-input v-model="height" size="small" style="width:130px">
        </el-input> -->
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
            heading: 0,
            heightMarks: {
                0: '低空',
                5000: '高空',
                10000: {
                    style: {
                        color: '#1989FA'
                    },
                    label: this.$createElement('strong', 'max')
                }
            },
            kiasMarks: {
                0: '低速',
                300: '高速',
                500: {
                    style: {
                        color: '#1989FA'
                    },
                    label: this.$createElement('strong', 'max')
                }
            },
          headingMarks: {
            //     0: '低空',
            //     50: '高空',
            //     100: {
            //         style: {
            //             color: '#1989FA'
            //         },
            //         label: this.$createElement('strong', 'max')
            //     }
            }
        }
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
        this.kias = controls.autopilot.kias;
        this.heading = controls.autopilot.heading;
        this.height = controls.autopilot.altitude;
    },
};
</script>

<style>
.blockAuto {
    width: 100px;
    height: 40px;
    display: flex;
    margin-top: 10px;
    flex-direction: row;
    margin-bottom: 5px;
    margin-left: 15px;
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

.panel {
    width: 150px;
    height: 30px;
    position: fixed;
    right: 50px;
    top: 20px;
    z-index: 1000;
}

.iconShow {
    z-index: 1;
}

.increase {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;
    background-color: white
}
</style>
