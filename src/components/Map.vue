<template>
<div>
    <div class="geofs-canvas-mouse-overlay">
        <div class="geofs-3dloader" title="Still loading and refining graphics."></div>
        <!-- Instrument container -->
        <div class="geofs-overlay-container"></div>
    </div>
    <!-- 地图提供-->
    <div id="geofs-ui-3dview" class="geofs-ui-3dview"></div>
</div>
</template>

<script>
export default {
    name: "Map",
    components: {},
    data() {
        return {

        }
    }
}
</script>

<style>
.geofs-canvas-mouse-overlay {
    width: calc(100% - 60px);
    left: unset;
}
</style>
