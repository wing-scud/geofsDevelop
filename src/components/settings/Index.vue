
<template>
     <ul class="geofs-list geofs-toggle-panel geofs-preference-list geofs-preferences" data-noblur="true" onShow="geofs.initializePreferencesPanel();" onHide="geofs.savePreferencesPanel();">
            <ControlsSetting></ControlsSetting>
            <SimulationSetting></SimulationSetting>
             <MultiplayerSetting></MultiplayerSetting>
             <GraphicsSetting></GraphicsSetting>
            <EnvironmentSetting></EnvironmentSetting>
                <!--<li class="geofs-list-collapsible-item geofs-collapsible-profile geofs-onlyForApp">
                User account
                <div class="geofs-collapsible geofs-htmlView geofs-app-userProfile geofs-account-placeholder"></div>
            </li>-->
            <InstrumentsSetting></InstrumentsSetting>
            <DebugInforSetting></DebugInforSetting>
                <li class="geofs-list-collapsible-item geofs-onlyForApp">
                    Reset settings
                    <div class="geofs-collapsible geofs-tab-debug">
                        In case of recurring error, please try to reset saved settings to default:<br/>
                        <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" onclick="geofs.resetPreferences();">Reset Settings</button>
                    </div>
                </li>
                <!-- Bottom buttons 恢复默认设置和 关闭按钮 -->
                <div class="geofs-preferenceForm geofs-hideForApp">
                    <div style="float: left;">
                        <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" onclick="geofs.resetPreferences();">Reset Settings</button>
                    </div>
                    <div style="float: right;">
                        <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" onclick="geofs.savePreferencesPanel(); ui.closePreferencePanel();">Close</button>
                    </div>
                </div>

    </ul>
</template>
<script>
import ControlsSetting from "./ControlsSetting"
import SimulationSetting from "./SimulationSetting"
import EnvironmentSetting from "./EnvironmentSetting"
import GraphicsSetting from "./GraphicsSetting"
import MultiplayerSetting from "./MultiplayerSetting"
import InstrumentsSetting from "./InstrumentsSetting"
import DebugInforSetting from "./DebugInforSetting"
export default {
  name: 'OptionsSetting',
  components:{
    ControlsSetting,
    SimulationSetting,
    EnvironmentSetting,
    GraphicsSetting,
    MultiplayerSetting,
    InstrumentsSetting,
    DebugInforSetting
  },
  data() {
    return {
    };
  },
  created() {

  },
};
</script>