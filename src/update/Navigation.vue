<template>
<div class="root"> 
  <div class="menu_item" v-for="option in options" :key="option.name" :title="option.name">
        <el-button icon="el-icon-search"  style="width:80%;height:100%" @click="clickButton" circle></el-button>
        <!-- <el-image :src="require('@/assets/'+data)"></el-image>   --> <!-- 图片地址加载问题,:src和src，@和../  require--> 
     <!-- <img src="@/assets/options/aircraft.png" width="80%" height="100%"> -->
  </div>
  <el-drawer
      title="飞机"
      custom-class="drawer"
      :modal-append-to-body="false"
      :visible.sync="drawer"
      :wrapperClosable="true"
      :modal="false"
      direction="ltr" >
      <el-collapse v-model="activeName" accordion>
          <el-collapse-item class="el-collapse-item__content" title="飞机列表" name="1">
              <ImageItem/>
              <ImageItem/>
          </el-collapse-item>
          <el-collapse-item class="el-collapse-item__content" title="" name="1">
              <ImageItem/>
              <ImageItem/>
          </el-collapse-item>
      </el-collapse>
      
</el-drawer>
</div>
</template>

<style>
.root{
  position: absolute;
  top:0; 
  left:0;
  height:100%;
  width:4%;
  border:1px;
  border-style: solid;
  border-color: aqua;
  background-color: rgba(250,255,255,0.5);
}
 .menu_item{
   margin:5px 10% 5px 10%;
   width:80%;
   height:5%;
 }
 .drawer{
   width: 300px !important;
   left: 4% !important;
   background-color:rgba(250,255,255,0.5)
 }
 .el-collapse-item__content{
   width:100%;
   height:40px;
   background-color:rgba(250,255,255,0.5);
   padding-bottom: 0 !important;
 }
 .el-drawer__header {
    margin-bottom: 15px;
}
</style>

<script>
import ImageItem from "../Plugins/ImageItem"

  export default {
    name:"Navigation",
    components:{
      ImageItem
    },
    data() {
      return{
        activeName: '1',
        data:'logo.png',
         drawer: false,
         options:[
          {src:"../assets/logo.png",name:"aircraft"},
        ]
      }
    },
    methods: {
      clickButton(){
        this.drawer = !this.drawer
      }
    }
  }
</script>