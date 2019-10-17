<template>
<div>
    <div class="geofs-canvas-mouse-overlay">
        <div class="geofs-orientationCalibrate">
            <i class="material-icons md-48">adjust </i><br>Tap to calibrate controls
        </div>
        <div class="geofs-3dloader" title="Still loading and refining graphics."></div>
        <img src="/images/hd-logo.png" class="geofs-hd-logo">
        <!-- Instrument container -->
        <div class="geofs-overlay-container"></div>
        <!-- Chat section -->
        <!-- <div class="geofs-chat-messages geofs-authenticated"></div> -->
    </div>
    <!-- <div class="geofs-creditContainer"></div> 见index.html -->
    <!-- Canvas placeholder -->
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
    width: 95.833%;
    left: unset;
}
</style>
