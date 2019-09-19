<template>
<div>
            <!-- Top UI overlay -->
            <div class="geofs-ui-top">
                <div class="geofs-auth geofs-htmlView">
                    <!-- 地图提供-->
                </div>
                <a href="/" class="geofs-home-button" title="GeoFS home page">
                    <i class="material-icons"></i>
                </a>
                <div class="geofs-player-count"></div>
                <!-- 自动驾驶的三个按钮 ，-->
                <div class="geofs-autopilot-bar" style="left: 130px;">
                    <div class="control-pad geofs-autopilot-pad" title="Toggle autopilot on/off">
                        <div class="control-pad-label transp-pad">AUTOPILOT</div>
                    </div>
                    <div class="geofs-autopilot-controls">
                        <div class="geofs-autopilot-control">
                            <a class="numberDown">-</a>
                            <div class="numberValue geofs-autopilot-kias" min="0" step="10" method="setKias">0</div>
                            <a class="numberUp">+</a>
                            <span>IAS</span>
                        </div>
                        <div class="geofs-autopilot-control">
                            <a class="numberDown">-</a>
                            <div class="numberValue geofs-autopilot-heading" min="0" max="359" loop="true" step="1" method="setHeading">000</div>
                            <a class="numberUp">+</a>
                            <span>HDG</span>
                        </div>
                        <div class="geofs-autopilot-control">
                            <a class="numberDown">-</a>
                            <div class="numberValue geofs-autopilot-altitude" min="0" step="1000" method="setAltitude">00000</div>
                            <a class="numberUp">+</a>
                            <span>ALTITUDE</span>
                        </div>
                        <div class="geofs-autopilot-control" style="display: none;">
                            <a class="numberDown">-</a>
                            <div class="numberValue geofs-autopilot-climbrate" min="-10000" step="500" method="setClimbrate">00000</div>
                            <a class="numberUp">+</a>
                            <span>VERT SPEED</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- overlayed div to fix Cesium mouse event bug in IE -->
            <div class="geofs-canvas-mouse-overlay">
                <div class="geofs-orientationCalibrate">
                    <i class="material-icons md-48">adjust
                </i>
                    <br>Tap to calibrate controls
                </div>
                <div class="geofs-3dloader" title="Still loading and refining graphics."></div>
                <img src="/images/hd-logo.png" class="geofs-hd-logo">
                <!-- Instrument container -->
                <div class="geofs-overlay-container"></div>
                <!-- Chat section -->
                <div class="geofs-chat-messages geofs-authenticated"></div>
            </div>
            <div class="geofs-creditContainer"></div>
            <!-- Canvas placeholder -->
            <div id="geofs-ui-3dview" class="geofs-ui-3dview"></div>
        </div>
</template>
<script>
export default {
  name: 'Top',
  data() {
    return {
    
    };
  },
  created() {

  },
};

</script>
