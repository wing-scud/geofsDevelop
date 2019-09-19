<template>
<div>
        <ul class="geofs-list geofs-toggle-panel geofs-player-list geofs-authenticated" onshow="ui.initPlayerList();" onhide="ui.clearPlayerList();"></ul>
        <!-- Navigation panel -->
        <div class="geofs-map-list geofs-toggle-panel" onshow="ui.createMap();" onhide="ui.stopMap();" data-noblur="true">
            <div class="geofs-createPath">Create flight path</div>
            <div class="geofs-clearPath">Clear path</div>
            <div class="geofs-map-viewport geofs-stopMousePropagation"></div>
            <!-- map内自动驾驶 autopilot -->
            <div class="geofs-autopilot geofs-stopKeyboardPropagation geofs-stopMousePropagation">
                <h6>Autopilot</h6>
                <button class="mdl-button mdl-js-button mdl-button--raised geofs-autopilot-toggle" onclick="controls.autopilot.toggle();" title="Toggle autopilot on/off - [A]">Disengaged</button>
                <div class="geofs-autopilot-displays">
                    <label>
                Altitude
                        <input type="number" placeholder="00000" min="0" step="1000" class="geofs-autopilot-altitude" onchange="controls.autopilot.setAltitude(this.value);"/>
                <span>Ft.</span>
            </label>
                    <label>
                Heading
                        <input type="number" placeholder="000" min="0" max="359" step="1" class="geofs-autopilot-heading" onchange="controls.autopilot.setHeading(this.value);"/>
                <span>Deg.</span>
            </label>
                    <label>
                Speed
                        <input type="number" placeholder="0" min="0" step="10" class="geofs-autopilot-kias" onchange="controls.autopilot.setKias(this.value);"/>
                <span>Kts.</span>
            </label>
                </div>
            </div>
        </div>
</div>
</template>

<script>
export default {
  name: 'Navigation',
  data() {
    return {
    
    };
  },
  created() {

  },
};

</script>
