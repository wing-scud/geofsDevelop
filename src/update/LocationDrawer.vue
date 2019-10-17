<template>
    <div class="location">
        <el-collapse  style="background-color:none;" v-model="activeName" accordion>
            <el-collapse-item  title="山脉" name="1">
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
export default {
    name:"LocationDrawer",
    components:{
        
    },
    data(){
        return{
            activeName: '2',
            destination:"",
            mountains:[
                {windOverride:true,windSpeed:12,windDirection:90,coordinate:[32.89034750891853,-117.25156658170516,0,-85],name:"Torrey Pines Gliderport (Soaring)"}
                , {windOverride:true,windSpeed:14,windDirection:90,coordinate:[44.58291179132744,-1.2190110965731453,0,-82],name:"Dune du Pyla (Soaring)"}
                ,{windOverride:false,coordinate:[42.99043614854522,-0.19668640145259153,1400,134, true],name:"Argelès-Gazost, Val d'Azun (Paragliding)"}
           ],
            runways:[
                {windOverride:false,coordinate:[42.36021520436057,-70.98767662157663,0,-103.54],name:"Logan Int'l (Boston) - 27"},
                {windOverride:false,coordinate:[43.578924,-6.09867,550,104, true],name:"Miami Int'l - 8R"},
                {windOverride:false,coordinate:[43.66555302435758,7.228367855065596,0,-135],name:">Aéroport Nice Côte d'Azur - 22L"}
            ],
            others:[
                {windOverride:false,coordinate:[45.938149486108856,6.892803255304612,1500,37.89311560373897],name:"Chamonix - Alps - France"},
                {windOverride:false,coordinate:[37.76577100453262,-122.36941785026704,455,-51.942644559501176],name:"San Francisco - USA"},
                {windOverride:false,coordinate:[36.110353463200575,-113.24040648366983,1288,-140.62100383790101],name:"Grand Canyon - USA"},
                {windOverride:false,coordinate:[55.93793884878086,-4.9214302700610455,302,350,0],name:"West Coast of Scotland"},
                {windOverride:false,coordinate:[37.969320063220124,23.706062632829592,290,95.18337970067272],name:"Acropolis - Athens - Greece"},
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