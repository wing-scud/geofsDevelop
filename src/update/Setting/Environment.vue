<template>
    <div>
        <div class="block">
            <el-switch active-text="手控" v-model="manual"/>
        </div>
        <div class="block">
            <span class="">时刻</span>
            <el-slider  v-model="localTime" :format-tooltip="formatTime"/>
        </div>
        <div class="block">
            <span class="">季节</span>
            <el-slider  v-model="season" :min=0 :max=3 :step=1 :format-tooltip="formatSeason"/>
        </div>
        <div class="block">
            <span class="">天气</span>
            <el-slider  v-model="quality" :min=0 :max=100 :step=1 />
        </div>
    </div>
<!-- 
            <li class="geofs-list-collapsible-item">
                Environment
                <div class="geofs-collapsible">
                    <fieldset>
                        <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="weatherManual" title="Set environment manually">
                                <input type="checkbox" id="weatherManual" class="mdl-switch__input" gespref="geofs.preferences.weather.manual" update="weather.refresh();">
                                <span class="mdl-switch__label">Set environment manually</span>
                            </label>
                    </fieldset>
                    <fieldset>
                        <legend>METAR</legend>
                        <div class="geofs-metarDisplay"> </div>
                    </fieldset>
                    <fieldset class="geofs-manualWeather">
                        <legend>Time of the day
                        </legend>
                        <div title="Set time of day" class="slider span2 geofs-timeSlider" type="slider" gespref="geofs.preferences.weather.localTime" update="(weather.set)" value="12" min="0" max="24" precision="2">
                            <div class="slider-rail">
                                <div class="slider-selection">
                                    <div class="slider-grippy">
                                        <input class="slider-input" />
                                    </div>
                                </div>
                            </div>
                            <label>Time of the day in hours</label>
                        </div>
                    </fieldset>
                    <fieldset class="geofs-manualWeather">
                        <legend>Season
                        </legend>
                        <div title="Season" class="slider span2" type="slider" gespref="geofs.preferences.weather.season" update="(weather.set)" value="0" min="0" max="100" precision="0">
                            <div class="slider-rail">
                                <div class="slider-selection">
                                    <div class="slider-grippy">
                                        <input class="slider-input" />
                                    </div>
                                </div>
                            </div>
                            <label>Spring > Summer > Autumn > Winter</label>
                        </div>
                    </fieldset>
                    <fieldset class="geofs-manualWeather">
                        <legend>Weather
                        </legend>
                        <div title="Weather quality" class="slider span2" type="slider" gespref="geofs.preferences.weather.quality" update="(weather.set)" value="0" min="0" max="100" precision="0">
                            <div class="slider-rail">
                                <div class="slider-selection">
                                    <div class="slider-grippy">
                                        <input class="slider-input" />
                                    </div>
                                </div>
                            </div>
                            <label>Weather quality</label>
                        </div>
                    </fieldset>
                    </div>
            </li> -->
</template>

<script>
import weather from "../../lib/modules/weather"
export default {
  name: 'Environment',
  data() {
    return {
        manual:false,
        //localTime存在双向转化，拿过来的时候也需要转化
        localTime:1*60+40,
        season:1,
        quality:1
    };
  },
  created() {
       geofs.preferences.weather.manual;
       geofs.preferences.weather.localTime;
       geofs.preferences.weather.season;
       geofs.preferences.weather.quality;
  },
  methods:{
      formatTime(val){
          let time=""
          time=val/60+":"+val%60
          return time
      },
      formatSeason(val){
          let arrays=["春，夏，秋，冬"]
          return arrays[val]
      },
      update(){
        //  weather.refresh()
      },
      //原始的数据更新，均是html直接与js绑定，然后调用weather.set更新，
      //现在需要通过v-model
      update(){
        //  weather.set()
      }
  }
};

</script>
<style scoped>
.block{
    margin-bottom: 5px;
    padding-left:10px;
     padding-right:10px
}
</style>


