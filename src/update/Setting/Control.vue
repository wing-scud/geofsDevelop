<template>
        <div>
            <el-collapse>
                <el-collapse-item>
                    <template slot="title">
                         <el-radio v-model="model" label="keyboard">键盘</el-radio>
                    </template>
                    <div class="block">
                        <el-switch v-model="mixYawRoll"  active-text="旋转" inactive-text="偏航"></el-switch>
                    </div>
                    <div class="block">
                        <span class="demonstration">比例</span>
                        <el-slider v-model="mixRatio" :min=0 :max=4  :step=0.1 ></el-slider>
                    </div>
                    <div class="block">
                        <span class="demonstration">灵敏度</span>
                        <el-slider v-model="sensitivity" :min=0 :max=4  :step=0.1></el-slider>
                    </div>
                    <div class="textArea" v-for="(value, name) in keys" :key="value.label">
                        <span>{{name}}</span>
                        <el-input v-model="value.label" size="mini" @focus="keyChoose(value,name)" ></el-input>
                     </div>
                 </el-collapse-item>
            </el-collapse>
            <el-collapse>
                <el-collapse-item>
                    <template slot="title">
                         <el-radio v-model="model" label="mouse">鼠标</el-radio>
                    </template>
                    <div class="block">
                        <el-switch v-model="mixYawRoll"  active-text="旋转" inactive-text="偏航"></el-switch>
                    </div>
                    <div class="block">
                        <span class="demonstration">比例</span>
                        <el-slider v-model="mixRatio" :min=0 :max=4  :step=0.1 ></el-slider>
                    </div>
                    <div class="block">
                        <span class="demonstration">灵敏度</span>
                        <el-slider v-model="sensitivity" :min=0 :max=2  :step=0.1></el-slider>
                    </div>
                    <div class="block">
                        <span class="demonstration">指数</span>
                        <el-slider v-model="exponential" :min=0 :max=2  :step=0.1></el-slider>
                    </div>
                 </el-collapse-item>
            </el-collapse>
        </div>
</template>

<script>
import geofs from "../../lib/geofs"
import controls from "../../lib/modules/controls"
export default {
  name: 'Control',
  data() {
    return {
        mixYawRoll:"",
        model:"",
        keys:{},
        radio:"keyboard",
        mixRatio:1,
        sensitivity:1,
        //鼠标和sensitivity和键盘的是否是一个，注意
        exponential:1
    };
  },
  methods: {
      keyChoose(value,name){
          //存在问题
          document.onkeydown = function(e) {
              let key =e.key
              this.keys[name].label=key
              };
      }
  },
  watch: {
      mixYawRoll:function(newValue,oldValue){
          controls.setMode();
      }
  },
  created() {
      //数据所有初始化，都要从preference拿数据1
      this.mixYawRoll=geofs.preferences.keyboard.mixYawRoll;
      this.model=geofs.preferences.controlMode;
      this.keys=geofs.preferences.keyboard.keys
  },
};
</script>

<style scoped>

.el-collapse{
    width:80%;
    margin-left:10%;
}
.textArea{
    padding-left:10px;
}
.block{
    margin-bottom: 5px;
    padding-left:10px;
     padding-right:10px
}
</style>