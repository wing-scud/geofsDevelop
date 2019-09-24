<template>
  <div id="container">
    <div class="geofs-ui-left">
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
      for (var i in geofs.aircraftList) {
          geofs.aircraftList[i].path = geofs.aircraftList[i].dir.replace(/\|/gi, '/')
      }
  }
};
</script>

<style>
#container {
  width:100%;
    flex-direction: row;
    display: flex;
    align-items: stretch;
    height: 100%;
}
</style>



