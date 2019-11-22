<template>
    <div class="location">
        <el-collapse  style="background-color:none;" v-model="activeName" accordion>
            <el-collapse-item  title="台湾" name="1">
                <div  class="image_item" :key="location.name" v-for="location in mountains"  @click="flyTo(location)">
                    <el-row>
                        <el-col :span="24"> {{location.name}}</el-col>
                    </el-row> 
                </div>
            </el-collapse-item>
            <el-collapse-item title="跑道" name="2">
                <div  class="image_item" :key="location.name" v-for="location in runways" @click="flyTo(location)">
                    <el-row>
                        <el-col :span="24"> {{location.name}}</el-col>
                    </el-row> 
                </div>
            </el-collapse-item>
            <el-collapse-item title="其他" name="3">
                <div  class="image_item" :key="location.name" v-for="location in others"  @click="flyTo(location)">
                    <el-row>
                        <el-col :span="24"> {{location.name}}</el-col>
                    </el-row> 
                </div>
            </el-collapse-item>
        </el-collapse>
    <div class="search">
        <el-input style="width:200px" placeholder="目的地" prefix-icon="el-icon-search" v-model="destination" size="small"></el-input>
        <div class="space"></div>
        <el-button icon="el-icon-search" size="medium" circle></el-button>
    </div>
</div>
</template>
<script>
import geofs from "../lib/geofs"
import controls from '../lib/modules/controls';
export default {
    name:"LocationDrawer",
    components:{
    },
    data(){
        return{
            activeName: '2',
            destination:"",
            mountains:[{windOverride:false,coordinate:[22.74656,120.741469,3400,134, true],name:"樱花王山脉"},
                  {windOverride:false,coordinate:[23.148523,120.282713,2900,95.18337967272,true],name:"善化胡厝寮彩绘村"},
               {windOverride:false,coordinate:[24.817414,121.416255,8000,-140.62100383790101],name:"东眼山国家森林游乐区"},
               // {windOverride:true,windSpeed:12,windDirection:90,coordinate:[27.990458,86.93416,1000,false],name:"珠穆朗玛峰(雪山)"}
               // , {windOverride:true,windSpeed:14,windDirection:90,coordinate:[35.288147, -83.666558,500,false],name:"美国楠塔哈拉国家森林公园"}
           ],
            runways:[
                // {windOverride:false,coordinate:[42.36021520436057,-70.98767662157663,0,-103.54],name:"Logan Int'l (Boston) - 27"},
                // {windOverride:false,coordinate:[43.578924,-6.09867,550,104, true],name:"Miami Int'l - 8R"},
                //滨海阿尔卑斯
                {windOverride:false,coordinate:[43.66555302435758,7.228367855065596,0,-135],name:"美国阿尔卑斯机场"}
            ],
            others:[
                // 苏州纳米城(城市) 120.782336,31.287121 平原 
                {windOverride:false,coordinate:[31.287121,120.782336,1500,37.89311560373897],name:"苏州纳米城(城市)"},
                {windOverride:false,coordinate:[31.297103,122.391435,455,-51.942644559501176],name:"黄海(海洋)"},
                {windOverride:false,coordinate:[29.619023,94.944433,1288,-140.62100383790101],name:"雅鲁藏布大峡谷"},
               {windOverride:false,coordinate:[36.110353463200575,-113.24040648366983,800,-140.62100383790101],name:"亚利桑那州大峡谷"},
            ]
        }
    },
    methods:{
        flyTo(location){
            if(location.windSpeed){
                geofs.windSpeed=location.windSpeed
            }
            if(location.windDirection){
                geofs.windDirection=location.windDirection
            }
            geofs.windOverride=location.windOverride
            geofs.flyTo(location.coordinate)
            let kias=this.$store.getters.getKias
             controls.autopilot.setKias(kias)
             let height=geofs.preferences.coordinates[2]+5000
             controls.autopilot.setAltitude(height)
             controls.autopilot.turnOn()
        }
    }
}
</script>
<style scoped>
.location{
    position: absolute;
    width: 100%;
    height: 90%;
}
.search{
    position:absolute;
    width:100%;
    height:50px;
    display:flex;
    flex-direction: row;
    justify-content:flex-start;
    align-items: center;
    padding-left:10px;
    padding-right:10px;
    bottom:0;
}
.space{
    width:20px;
}
.image_item{
    height:40px;
    padding-left:5px;
    border-top: 1px solid #EBEEF5;
    cursor:hand
}
.image_item:hover{
    height: 60px;
    font-size: 15px;
    background-color:rgba(255,255,255,0.8)
}
.el-collapse-item__header{
    padding-left:15px;
}
.el-image:hover{
    height:60px;
}
</style>