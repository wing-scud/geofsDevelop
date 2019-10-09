<template>
  <div class="geofs geofs-ingame legacyAutopilot">
    <div class="geofs-ui-left" :style="{height:'95%'}">
        <div class="geofs-apiResponse"></div>
        <AircraftLocation></AircraftLocation>
        <AircraftList></AircraftList>
        <OptionsSetting></OptionsSetting>
        <Debug></Debug>
        <Navigation></Navigation>
    </div>
    <div class="geofs-ui-right">
        <Global></Global>
     </div>
        <Options></Options>
  </div>
 
</template>

<script>
import "../lib/geofs"
import AircraftLocation from './settings/AircraftLocation';
import AircraftList from './settings/AircraftList';
import Debug from './settings/Debug';
import Navigation from './settings/Navigation'
import Global from './global/Global';
import Options from './options/Options';
import OptionsSetting from './settings/Index';


export default {
  name: 'Index',
  components: {
    AircraftLocation,
    OptionsSetting,
    Global,
    Options,
    AircraftList,
    Debug,
    Navigation
  },
  created(){
  }
};
</script>




