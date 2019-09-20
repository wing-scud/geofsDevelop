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
        <Global></Global>
   </div>
        <Options></Options>
  </div>
 
</template>

<script>
import AircraftLocation from './components/settings/AircraftLocation';
import AircraftList from './components/settings/AircraftList';
import Debug from './components/settings/Debug';
import Navigation from './components/settings/Navigation'
import Global from './components/global/Global';
import Options from './components/options/Options';
import OptionsSetting from './components/settings/OptionsSetting';
import "./lib/geofs"

export default {
  name: 'App',
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
#app {
  width:100%;
    flex-direction: row;
    display: flex;
    align-items: stretch;
    height: 100%;
}
</style>
