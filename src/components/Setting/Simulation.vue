<template>
    <div class="block">
        <el-switch v-model="crash"  active-text="监测碰撞" ></el-switch>
    </div>
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
  created() {
      this.crash=geofs.preferences.crashDetection
  },
  watch:{
      crash:function(newValue,oldValue){
           geofs.preferences.crashDetection=newValue
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



