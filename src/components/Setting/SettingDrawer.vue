<template>
<div>
    <div class="settingPanel">
        <el-collapse accordion>
            <el-collapse-item title="控制模式" name="1">
                <Control></Control>
            </el-collapse-item>
            <el-collapse-item title="探测" name="2">
                <Simulation></Simulation>
            </el-collapse-item>
            <el-collapse-item title="图形" name="3">
                <Graphics></Graphics>
            </el-collapse-item>
            <el-collapse-item title="环境设置" name="4">
                <Environment></Environment>
            </el-collapse-item>
        </el-collapse>
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
    name: 'SettingDrawer',
    components: {
        Control,
        Simulation,
        Environment,
        Graphics,
    },
    data() {
        return {};
    },
    methods: {
    },
    created() {

    },
};
</script>

<style scoped>
.settingPanel {
    font-family: "Helvetica", "Arial", sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;
    list-style: none;
    padding: 0px;
    margin: 0 0 0 5px;
    overflow-y: auto;
    height: calc(100% - 55px)
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
