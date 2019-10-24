<template>
    <div class="block">
        <el-switch v-model="crash"  active-text="监测碰撞" @change="crashChange" ></el-switch>
    </div>
        <!-- <el-collapse-item>
            <el-button  >得到当前位置</el-button>
        </el-collapse-item> -->
            <!-- <li class="geofs-list-collapsible-item geofs-hideForApp">
                Simulation
                <div class="geofs-collapsible">
                    <fieldset>
                        <legend>General
                        </legend>
                        <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="crashDetection" title="Enable crash detection">
                                <input type="checkbox" id="crashDetection" class="mdl-switch__input" gespref="geofs.preferences.crashDetection">
                                <span class="mdl-switch__label">Detect crashes</span>
                            </label>
                    </fieldset>
                    <fieldset class="geofs-hideForApp">
                        <legend>Linking
                        </legend>
                        <button class="mdl-button mdl-js-button mdl-button--raised " onclick="geofs.getLink();" title="Get a URL to the current flight and location">Generate a link to the current location
                     </button>
                        <div class="geofs-linkOutput"></div>
                    </fieldset>
                    <fieldset class="geofs-hideForApp">
                        <legend>Multi-monitor
                        </legend>
                        <button class="mdl-button mdl-js-button mdl-button--raised" onclick="camera.openSlaveWindow(-1);" title="Extend screen to the left">Open left screen</button>
                        <button class="mdl-button mdl-js-button mdl-button--raised" onclick="camera.openSlaveWindow(1);" title="Extend screen to the right">Open right screen</button>
                    </fieldset>
                </div>
            </li> -->
</template>

<script>
import geofs from "../../lib/geofs"
export default {
  name: 'Simulation',
  data() {
    return {
        crash:false,

    };
  },
  method:{
      crashChange(){
          geofs.preferences.crashDetection()
      }
  },
  created() {

  },
};

</script>
<style scoped>
.block{
        margin-bottom: 5px;
    padding-left:10px;
     padding-right:10px
}
</style>



