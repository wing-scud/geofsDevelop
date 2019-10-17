<template>
<div>
            <!-- Top UI overlay -->
            <div class="geofs-ui-top">
                <div class="geofs-auth geofs-htmlView">
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
                <!-- 地图提供-->
            <div id="geofs-ui-3dview" class="geofs-ui-3dview"></div>
        </div>
</template>
<script>
import {fixAngle360,clamp} from "../../lib/utils/utils"
import controls from "../../lib/modules/controls"
export default {
  name: 'Global',
  data() {
    return {
    };
  },
  methods:{
    initUI: function(){
            var a = $(".geofs-autopilot-pad .control-pad-label"),
        b;
    controls.autopilot.setHeading = function(a) {
        var b = controls.autopilot.heading;
        try {
            controls.autopilot.heading = fixAngle360(parseInt(a, 10)),
                $(".geofs-autopilot-heading").text(controls.autopilot.heading),
                $(".legacyAutopilot .geofs-autopilot-heading").val(controls.autopilot.heading)
        } catch (e) {
            controls.autopilot.heading = b
        }
    };
    controls.autopilot.setAltitude = function(a) {
        var b = controls.autopilot.altitude;
        try {
            controls.autopilot.altitude = parseInt(a, 10),
                $(".geofs-autopilot-altitude").text(controls.autopilot.altitude),
                $(".legacyAutopilot .geofs-autopilot-altitude").val(controls.autopilot.altitude)
        } catch (e) {
            controls.autopilot.altitude = b
        }
    };
    controls.autopilot.setKias = function(a) {
        var b = controls.autopilot.kias;
        try {
            controls.autopilot.kias = parseInt(a, 10),
                $(".geofs-autopilot-kias").text(controls.autopilot.kias),
                $(".legacyAutopilot .geofs-autopilot-kias").val(controls.autopilot.kias)
        } catch (e) {
            controls.autopilot.kias = b
        }
    };
    controls.autopilot.setClimbrate = function(a) {
        var b = controls.autopilot.climbrate;
        try {
            controls.autopilot.climbrate = parseInt(a, 10),
                $(".geofs-autopilot-climbrate").text(controls.autopilot.climbrate)
        } catch (e) {
            controls.autopilot.climbrate = b
        }
    };
    $(document).on("autopilotOn", function() {
        clearTimeout(b);
        a.removeClass("red-pad").addClass("green-pad");
        $(".geofs-autopilot-controls").show();
        $(".geofs-autopilot-toggle").html("Engaged").addClass("mdl-button--colored")
    });
    $(document).on("autopilotOff", function() {
        a.removeClass("green-pad").addClass("red-pad");
        $(".geofs-autopilot-controls").hide();
        $(".geofs-autopilot-toggle").html("Disengaged").removeClass("mdl-button--colored");
        b = setTimeout(function() {
            a.removeClass("red-pad").removeClass("green-pad")
        }, 3E3)
    });
    $(document).on("pointerdown touchstart", ".numberUp, .numberDown", function(a) {
        var b = $(this),
            c = $(this).parent().find(".numberValue"),
            f = parseInt(c.text()) || 0,
            g = parseInt(c.attr("step")),
            h = parseInt(c.attr("min")),
            k = parseInt(c.attr("max")),
            n = b.hasClass("numberUp") ? g : -g,
            v = c.attr("loop"),
            z = c.attr("method"),
            A = function() {
                f += n;
                f = Math.floor(f / g) * g;
                f = v && f > k ? h : v && f < h ? k : clamp(f, h, k);
                c.text(f);
                controls.autopilot[z](f)
            },
            C = function() {
                A();
                clearTimeout(window.spinnerRepeat);
                window.spinnerRepeat = setTimeout(C, 50)
            };
        clearTimeout(window.spinnerRepeat);
        window.spinnerRepeat = setTimeout(C, 500);
        A();
        a.preventDefault()
    }).on("pointerup pointercancel mouseleave touchend", ".numberUp, .numberDown", function() {
        clearTimeout(window.spinnerRepeat)
    }).on("click", ".geofs-autopilot-pad", function(a) {

        controls.autopilot.toggle()
    })
}
  },
  created() {
      this.initUI()
  },
};

</script>
