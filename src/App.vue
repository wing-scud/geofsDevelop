<template>
  <div id="app">
   <div class="geofs-ui-left">
  <AircraftLocation></AircraftLocation>
  <AircraftList></AircraftList>
  <OptionsSetting></OptionsSetting>
  <Debug></Debug>
  <Navigation></Navigation>
  </div>
  <div class="geofs-ui-right">
   <Top></Top>
   </div>
   <Bottom></Bottom>
  </div>
 
</template>

<script>
import AircraftLocation from './components/left/AircraftLocation';
import AircraftList from './components/left/AircraftList';
import Debug from './components/left/Debug';
import Navigation from './components/left/Navigation'
import Autopilot from './components/Autopilot';
import Top from './components/right/Top';
import Bottom from './components/bottom/Bottom';
import OptionsSetting from './components/left/OptionsSetting';

import "./lib/geofs"
export default {
  name: 'App',
  components: {
    AircraftLocation,
    Autopilot,
    OptionsSetting,
    Top,
    Bottom,
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
#app {
  width:100%;
    flex-direction: row;
    display: flex;
    align-items: stretch;
    height: 100%;
}
</style>
