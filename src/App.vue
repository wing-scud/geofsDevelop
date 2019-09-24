<template>
  <div id="app">
    <Index></Index>-
  </div>
 
</template>

<script>
import Index from  "./components/Index"
import geofs from "./lib/geofs"

export default {
  name: 'App',
  components: {
    Index,
  },
  created(){
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