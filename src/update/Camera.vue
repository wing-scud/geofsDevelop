<template>
<div>
    <el-row v-for="(item,index) in cameraViews" :key="item">
        <div class="textItem" @click="clickItem(index)"> 
            {{item}}
        </div>
    </el-row>
</div>
</template>
<script>
export default {
    name:"Camera",
    data(){
        return{
            cameraViews:[
                "紧跟视角",
                "驾驶舱视角",
                "机头视角",
                "追随视角",
                " 自由视角",
                // "Extra views"
            ]
        }
    },
    methods:{
        clickItem(val){
            camera.set(val)
        }
    },
    created(){

    }
}
</script>

<style scoped>
.textItem{
    width:100%;
    height:100%;
    padding-top:10px;
    padding-bottom:10px;
    text-align: center;
}
.textItem:hover{
    background-color: rgb(224,224,224)
}
</style>