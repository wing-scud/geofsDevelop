<template>
    <div class="image_item">
        <el-row :gutter="20">
            <el-col :span="8">
                 <el-image :src="require('@/assets/'+data)" :fit="fit" style="width:80px"></el-image> <!--图片地址加载问题,:src和src，@和。../，require-->
            </el-col>
            <el-col :span="16"> {{data}}</el-col>
        </el-row> 
    </div>
</template>
<script>
export default {
    name:"ImageItem",
    data(){
        return{
            data:"logo.png",
        }
    }
}
</script>
<style>
.image_item{
    height:40px;
    border-bottom: 1px solid #EBEEF5;
}
.image_item:hover{
    height: 60px;
    font-size: 15px;
    background-color:GhostWhite;
}
.el-image:hover{
    height:60px;
}
</style>

