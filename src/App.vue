<template>
  <div id="app">
    <Index></Index>
  </div>
</template>

<script>
// import Index from  "./components/Index"
import geofs from "./lib/geofs"
import Index from "./update/Index"
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

</style>