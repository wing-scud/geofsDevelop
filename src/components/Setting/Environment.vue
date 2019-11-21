<template>
<div>
    <div class="block">
        <el-switch active-text="手控" v-model="manual" />
    </div>
    <div class="block">
        <span class="">时刻</span>
        <el-slider v-model="localTime" :min=0 :max=1440 :step=1 :format-tooltip="formatTime" />
    </div>
    <div class="block">
        <span class="">季节</span>
        <el-slider v-model="season" :min=0 :max=100 :step=1 :format-tooltip="formatSeason" />
    </div>
    <div class="block">
        <span class="">天气</span>
        <el-slider v-model="quality" :min=0 :max=100 :step=1 />
    </div>
    <!-- <div class="block">
        <span class="">云层</span>
        <el-slider v-model="qualityCloud" :min=0 :max=100 :step=1 />
    </div> -->
</div>
</template>

<script>
import weather from "../../lib/modules/weather"
export default {
    name: 'Environment',
    data() {
        return {
            manual: false,
            localTime:0,
            season: 0,
            quality: 0,
            qualityCloud:0
        };
    },
    created() {
        this.manual = geofs.preferences.weather.manual;
        this.localTime = this.returnTime(geofs.preferences.weather.localTime);
        this.season = geofs.preferences.weather.season;
        this.quality = geofs.preferences.weather.quality;
       // this.qualityCloud= geofs.preferences.weather.quality
    },
    methods: {
        returnTime(val){
            let time=Math.floor(val)*60
            time+=val%1*100
            return time;
        },
        formatTime(val) {
            let time =0
            time = parseInt(val / 60) + val % 60/100
            return time
        },
        formatSeason(val) {
            let arrays = ['春','夏','秋',"冬"]
            let temp=parseInt(val/25)
            return arrays[temp]
        },
    },
    watch: {
        manual: function (newValue, oldValue) {
            geofs.preferences.weather.manual = newValue
            weather.set()
        },
        localTime: function (newValue, oldValue) {
            geofs.preferences.weather.localTime =this.formatTime(newValue)
            weather.set()
        },
        season: function (newValue, oldValue) {
            geofs.preferences.weather.season = newValue
            weather.set()
        },
        quality: function (newValue, oldValue) {
            geofs.preferences.weather.quality = newValue
            weather.set()
        },
        // qualityCloud:function (newValue, oldValue) {
        //      geofs.preferences.weather.advanced.clouds=newValue
        //      weather.setAdvanced()
        // },

    }
};
</script>

<style scoped>
.block {
    margin-bottom: 5px;
    padding-left: 10px;
    padding-right: 10px
}
</style>
