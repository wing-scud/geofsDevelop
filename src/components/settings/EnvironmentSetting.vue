<template>

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
            </li>
</template>

<script>
export default {
  name: 'EnvironmentSetting',
  data() {
    return {
    
    };
  },
  created() {

  },
};

</script>



