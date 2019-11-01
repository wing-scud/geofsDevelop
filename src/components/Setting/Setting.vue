
<template>
<div class=".setttingPanel">
        <el-collapse accordion> 
            <el-collapse-item title="控制模式" name="1">
                <Control></Control>
            </el-collapse-item>
            <el-collapse-item  title="探测" name="2">
                <Simulation></Simulation>
            </el-collapse-item>
            <el-collapse-item  title="图形" name="3">
                <Graphics></Graphics>
            </el-collapse-item>
            <el-collapse-item  title="环境设置" name="4">
                <Environment></Environment>
            </el-collapse-item>
       </el-collapse>
        <!--功能添加到选择哪个drawer启动时候 onShow="geofs.initializePreferencesPanel();" onHide="geofs.savePreferencesPanel();" -->
                <!-- Bottom buttons 恢复默认设置和 关闭按钮 -->
                <div class="bottomButton">
                    <div style="float: left;">
                         <el-button type="warning" @click="geofs.resetPreferences()" round>恢复默认设置</el-button>
                    </div>
                    <div style="float: right;">
                        <el-button type="primary" @click="geofs.savePreferencesPanel()" plain>关闭</el-button>
                    </div>
                </div>

    </div>
</template>
<script>
import Control from "./Control"
import Simulation from "./Simulation"
import Environment from "./Environment"
import Graphics from "./Graphics"
import geofs from "../../lib/geofs"
export default {
  name: 'Setting',
  components:{
    Control,
    Simulation,
    Environment,
    Graphics,
  },
  data() {
    return {
    };
  },
  created() {

  },
};
</script>
<style scoped>
.settingPanel{
    width:100%;
    font-family: "Helvetica", "Arial", sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;
    list-style: none;
    padding: 0px;
    margin: 0px;
    overflow-y:auto;
}
.bottomButton {
    position: absolute;
    bottom: 0px;
    box-sizing: border-box;
    padding: 5px;
    height: 50px;
    width: 100%;
    margin-right: 10px;
    white-space: nowrap;
    box-shadow: 0px -2px 36px #aaa;
}
</style>