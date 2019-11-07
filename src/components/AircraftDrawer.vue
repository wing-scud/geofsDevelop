<template>
    <div>
        <el-collapse  style="background-color:none" v-model="activeName" accordion>
            <el-collapse-item  title="自定义模型" name="1">
                <div class="scroll">
                <div  class="image_item" :key="aircraft.serialNumber" v-for="aircraft in customs" @click="changeAircraft(aircraft)" >
                    <el-row>
                        <el-col :span="24" > {{aircraft.name}}</el-col>
                    </el-row> 
                </div>
                </div>
            </el-collapse-item>
            <el-collapse-item title="默认" name="2">
                <div class="scroll">
                <div  class="image_item" :key="aircraft.serialNumber" v-for="aircraft in defaults"  @click="changeAircraft(aircraft)">
                    <el-row :gutter="20">
                        <el-col :span="8">
                             <el-image  :src="aircraft.src" fit="fit" style="width:80px"></el-image>
                       </el-col>
                        <el-col :span="16">{{aircraft.name}}</el-col>
                    </el-row> 
                </div>
                </div>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>
<script>
import geofs from "../lib/geofs"
export default {
    name:"AircraftDrawer",
    data(){
        return{
            activeName: '2',
            customs:[
                {name:"Boeing 787-8 (by GX Development)",serialNumber:"235"},
                {name:"Embraer E190 (by GX Development)",serialNumber:"236"},
                {name:"Boeing 767-300ER (by GX Development)",serialNumber:"237"},
                {name:"Boeing 757-200 (by GX Development)",serialNumber:"238"},
                {name:"Airbus A350-900 (by GX Development)",serialNumber:"239"},
                {name:"Boeing 777-300ER (by LRX)",serialNumber:"240"},
                {name:"FLDG Boeing 737 MAX 8 (by LRX)",serialNumber:"241"},
                {name:"FLDG Airbus A320neo (by LRX)",serialNumber:"242"},
                {name:"Airbus A330-300 (by LRX)",serialNumber:"244"},
                {name:"FLDG Bombardier Dash 8 Q400 (by LRX)",serialNumber:"247"},
                {name:"Boeing 747-8 Freighter (by LRX)",serialNumber:"252"},
                {name:"Cirrus SR22 Turbo (by LRX)",serialNumber:"1069"},
                {name:"Boeing 737-800 (by King Solomon)",serialNumber:"2003"},
                {name:"CRJ-900 (by King Solomon)",serialNumber:"2004"},
                {name:"Airbus A340-600 (by LRX)",serialNumber:"2153"},
            ],
            defaults:[
                {name:"Piper Cub",serialNumber:"1",src:require('../assets/images/planes/cub.png')},
                {name:"Cessna 172",serialNumber:"2",src:require('../assets/images/planes/c172.png')},
                {name:"Alphajet PAF",serialNumber:"3",src:require('../assets/images/planes/alphajet.png')},
                {name:"Boeing 737-700",serialNumber:"4",src:require('../assets/images/planes/737-700.png')},
                {name:"Embraer Phenom 100",serialNumber:"5",src:require('../assets/images/planes/phenom.png')},
                {name:"de Havilland DHC6 Twin Otter",serialNumber:"6",src:require('../assets/images/planes/dhc6.png')},
                {name:"F-16 Fighting Falcon",serialNumber:"7",src:require('../assets/images/planes/f16.png')},
                {name:"Pitts Special S1",serialNumber:"8",src:require('../assets/images/planes/pitts.png')},
                {name:"Douglas DC-3",serialNumber:"16",src:require('../assets/images/planes/dc3.png')},
                {name:"McDonnell Douglas MD-11",serialNumber:"17",src:require('../assets/images/planes/md11.png')},
                {name:"Sukhoi Su-35",serialNumber:"18",src:require('../assets/images/planes/su35.png')},
                {name:"Airbus A380",serialNumber:"19",src:require('../assets/images/planes/a380.png')},
                {name:"Concorde",serialNumber:"20",src:require('../assets/images/planes/concorde.png')},
                {name:"Zlin Z-50",serialNumber:"21",src:require('../assets/images/planes/zlin.png')},
                {name:"Cessna 152",serialNumber:"22",src:require('../assets/images/planes/c152.png')},
                {name:"Antonov An-140",serialNumber:"26",src:require('../assets/images/planes/an140.png')},
                {name:"Evektor Sportstar",serialNumber:"40",src:require('../assets/images/planes/sportstar.png')},
                {name:"szd-48-3 Jantar",serialNumber:"41",src:require('../assets/images/planes/jantar.png')},
                {name:"paraglider",serialNumber:"50",src:require('../assets/images/planes/Paraglider.png')},
                {name:"Major Tom (hot air balloon)",serialNumber:"51",src:require('../assets/images/planes/tom.png')},
                {name:"Hughes 269a/TH-55 Osage",serialNumber:"52",src:require('../assets/images/planes/hughes.png')},
                {name:"Goat Airchair",serialNumber:"53",src:require('../assets/images/planes/goat.png')},
            ]
        }
    },
    methods:{
        changeAircraft(val){
            geofs.aircraft.instance.change(val.serialNumber);
        }
    }
}
</script>
<style scoped>
.image_item{
    height:40px;
    padding-left:5px;
    cursor: pointer;
    border-top: 1px solid #EBEEF5;
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
.scroll{
    overflow-y:auto;
    height:90%;

}
</style>