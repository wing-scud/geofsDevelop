<template>
<div class="panel">
    <div class="blockAuto">
        <!-- <span>速度</span> -->
        <el-slider v-model="kias" :min=0 :max="kiasMax" :marks="kiasMarks" style="width:130px">
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
        <el-slider v-model="height" :marks="heightMarks"  :min=0 :max=6000 style="width:130px">
        </el-slider>
        <!-- <el-input v-model="height" size="small" style="width:130px">
        </el-input> -->
    </div>
</div>
</template>

<script>
import range from "../lib/utils/aircraftRange"
import {
    fixAngle360,
    clamp
} from "../lib/utils/utils"
import controls from "../lib/modules/controls"
import { async } from 'q'
export default {
    name: 'Autopilot',
    data() {
        return {
            kias: 0,
            height: 0,
            heading: 0,
            kiasMax:0,
            heightMarks: {
                1500: '低空',
                4000: {
                    style: {
                        color: '#1989FA'
                    },
                    label: this.$createElement('strong', '高空')
                }
            },
            kiasMarks: {
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
    methods: {
          setRange(val){
              
              let kias=range[val].maxKias
              this.kiasMax=kias
              this.kiasMarks[kias]={
                    style: {
                        color: '#1989FA'
                    },
                    label: this.$createElement('strong', 'max')
                }
                let low =parseInt(kias/3)
                this.kiasMarks[low]="低速"
                let high=parseInt(kias/1.5)
                this.kiasMarks[high]="高速"
        }
    },
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
         this.setRange(geofs.aircraft.instance.id)
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
    color:black
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
.el-slider__marks-text {
    position: absolute;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
    font-size: 14px;
     color: black;
    margin-top: 15px;
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
