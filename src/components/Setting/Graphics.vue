<template>
    <div>
        <div class="block">
            <span class="demonstration">图像质量</span>
            <el-slider :min=1 :max=6 :step=1 v-model="quality" @input="updateQualityImage"></el-slider>
        </div>
        <div class="block">
            <span class="demonstration">增强</span>
            <el-slider :min=0 :max=1.4 :step=0.1 v-model="enhanceColors" @input="updateEnhancement"></el-slider>
        </div>
        <div class="block">
            <el-switch v-model="forceSimpleShadow" active-text="强制阴影" @change="updateShadow"></el-switch>
        </div>
        <div class="block">
            <el-switch v-model="HD" active-text="高清" @change="updateHd"></el-switch>
        </div>
        <div class="block">
            <el-switch v-model="headMotion" active-text="驾驶舱马达" @change="updateCockpit"></el-switch>
        </div>
    </div>
</template>

<script>
import geofs from "../../lib/geofs"
export default {
  name: 'Graphics',
  data() {
    return {
        quality:1,
        enhanceColors:1,
        forceSimpleShadow:false,
        HD:false,
        headMotion:false,
    };
  },
  created() {
    this.quality= geofs.preferences.graphics.quality
    this.enhanceColors=geofs.preferences.graphics.enhanceColors
    this.HD= geofs.preferences.graphics.HD
    this.forceSimpleShadow=geofs.preferences.graphics.forceSimpleShadow
    this.headMotion=geofs.preferences.camera.headMotion
  },
  methods:{
      updateQualityImage(){
           geofs.preferences.graphics.quality=this.quality
          geofs.api.renderingQuality(this.quality)
      },
      updateEnhancement(){
          geofs.preferences.graphics.enhanceColors=this.enhanceColors
          geofs.api.enhanceColors(this.enhanceColors)
      },
      updateShadow(){
          geofs.preferences.graphics.forceSimpleShadow=this.forceSimpleShadow
          geofs.api.renderingQuality();
      },
      updateHd(){
          geofs.preferences.graphics.HD=this.HD
          geofs.api.setHD(this.HD)
      },
      updateCockpit(){
          geofs.preferences.camera.headMotion=this.headMotion
      }
  }
};

</script>
<style scoped>
.block{
    margin-bottom: 5px;
    padding-left:10px;
    padding-right:10px;
}
</style>


