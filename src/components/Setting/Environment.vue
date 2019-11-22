<template>
<div >
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
    <div class="block">
        <span class="">云层</span>
        <el-slider v-model="clouds" :min=0 :max=100 :step=1 />
    </div>
    <div class="block">
        <span class="">云层高度</span>
        <el-slider v-model="ceiling" :min=0 :max=5000 :step=1 />
    </div>
    <div class="block">
        <span class="">降水量</span>
        <el-slider v-model="precipitation" :min=0 :max=100 :step=1 />
    </div>
    <div class="block">
        <span class="">雾</span>
        <el-slider v-model="fog" :min=0 :max=100 :step=1 />
    </div>
    <div class="block">
        <span class="">雾高</span>
        <el-slider v-model="fogCeiling" :min=0 :max=3000 :step=1 />
    </div>
    <div class="block">
        <span class="">风速</span>
        <el-slider v-model="windSpeed" :min=0 :max=20 :step=1 />
    </div>
    <div class="block">
        <span class="">风向</span>
        <el-slider v-model="windDirection" :min=0 :max=360 :step=1 />
    </div>
    <div class="block">
        <span class="">紊流</span>
        <el-slider v-model="turbulences" :min=0 :max=1 :step=0.1 />
    </div>
</div>
</template>

<script>
import weather from "../../lib/modules/weather"
export default {
    name: 'Environment',
    data() {
        return {
            manual: false,
            localTime: 0,
            season: 0,
            quality: 0,
            clouds: 0,
            ceiling: 0,
            precipitation: 0,
            fog: 0,
            fogCeiling: 0,
            windSpeed: 0,
            windDirection: 0,
            turbulences: 0,
        };
    },
    created() {
        this.manual = geofs.preferences.weather.manual;
        this.localTime = this.returnTime(geofs.preferences.weather.localTime);
        this.season = geofs.preferences.weather.season;
        this.quality = geofs.preferences.weather.quality;
        this.clouds = geofs.preferences.weather.advanced.clouds;
        this.ceiling = geofs.preferences.weather.advanced.ceiling;
        this.precipitation = geofs.preferences.weather.advanced.precipitationAmount
        this.fog = geofs.preferences.weather.advanced.fog
        this.fogCeiling = geofs.preferences.weather.advanced.fogCeiling
        this.windSpeed = geofs.preferences.weather.advanced.windSpeedMS
        this.windDirection = geofs.preferences.weather.advanced.windDirection
        this.turbulences = geofs.preferences.weather.advanced.turbulences

    },
    methods: {
        update() {
            //只要天气更新，全部更新
        },
        returnTime(val) {
            let time = Math.floor(val) * 60
            time += val % 1 * 100
            return time;
        },
        formatTime(val) {
            let time = 0
            time = parseInt(val / 60) + val % 60 / 100
            return time
        },
        formatSeason(val) {
            let arrays = ['春', '夏', '秋', "冬"]
            let temp = parseInt(val / 25)
            return arrays[temp]
        },
        //原始的数据更新，均是html直接与js绑定，然后调用weather.set更新，
        //现在需要通过v-model
    },
    watch: {
        manual: function (newValue, oldValue) {
            geofs.preferences.weather.manual = newValue
            weather.set()
        },
        localTime: function (newValue, oldValue) {
            geofs.preferences.weather.localTime = this.formatTime(newValue)
            weather.set()
        },
        season: function (newValue, oldValue) {
            geofs.preferences.weather.season = newValue
            weather.set()
        },
        quality: function (newValue, oldValue) {
            geofs.preferences.weather.quality = newValue
            weather.setManual();
        },
        clouds: function (newValue, oldValue) {
            geofs.preferences.weather.advanced.clouds = newValue
            weather.setAdvanced();
        },
        ceiling: function (newValue, oldValue) {
            geofs.preferences.weather.advanced.ceiling = newValue
            weather.definition.ceiling = newValue
            geofs.fx.cloudManager.instance.setCeiling()
        },
        precipitation: function (newValue, oldValue) {
            geofs.preferences.weather.advanced.precipitationAmount = newValue
            weather.setAdvanced()
        },
        fog: function (newValue, oldValue) {
            geofs.preferences.weather.advanced.fog = newValue
            weather.setAdvanced()
        },
        fogCeiling: function (newValue, oldValue) {
            geofs.preferences.weather.advanced.fogCeiling = newValue
            weather.setAdvanced()
        },
        windSpeed: function (newValue, oldValue) {
            geofs.preferences.weather.advanced.windSpeedMS = newValue
            weather.setAdvanced()
        },
        windDirection: function (newValue, oldValue) {
            geofs.preferences.weather.advanced.windDirection = newValue
            weather.setAdvanced()
        },
        turbulences: function (newValue, oldValue) {
            geofs.preferences.weather.advanced.turbulences = newValue
            weather.setAdvanced()
        },
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
