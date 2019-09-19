<template>
     <!-- Debug panel -->
        <div class="geofs-debug geofs-toggle-panel" onshow="geofs.debug.turnOn();" onhide="geofs.debug.turnOff();" data-noblur="true">
            <div class="geofs-debugFrame">
                <label>
            Part name<input type="text" class="debugPointName">
        </label>
                <label>
            Collision point index<input title="collision point index" style="width: 20px;" class="debugCollisionPointIndex">
        </label>
                <p class="debugPartData"></p>
                <label class="checkbox">
            Force Source Point<input type="checkbox" class="debugShowForceSource" title="force source point">
        </label>
                <label class="checkbox">
            Force Direction<input type="checkbox" class="debugShowForceDirection" title="Force direction">
        </label>
                <label class="checkbox">
            Local Position<input type="checkbox" class="debugShowLocalPosition" title="Local position">
        </label>
                <label class="checkbox">
            suspension Origin<input type="checkbox" class="debugShowsuspensionOrigin" title="Local position">
        </label>
                <button class="btn btn-warning" onclick="geofs.killCache = '?killcache=' + Date.now(); geofs.debugResetAircraft = true;">Clear cache</button>
                <button class="btn" onclick="geofs.aircraft.instance.change(geofs.aircraft.instance.name, /* justReload */ true);">Just Reload</button>
                <button class="btn" onclick="geofs.aircraft.instance.change(geofs.aircraft.instance.name, /* justReload */ true); instruments.init(geofs.aircraft.instance.setup['instruments']); instruments.updateCockpitPositions();">Reload - Instru</button>                -------------------------------------

                <label>
            Multiplayer Id<input type="text" class="debugAicraftId">
        </label>
                <p class="debugMultiplayerData"></p>
                <div class="geofs-debugWatch"></div>
                <div class="geofs-debugLog"></div>
            </div>
        </div>
</template>

<script>
export default {
  name: 'Debug',
  data() {
    return {
    
    };
  },
  created() {

  },
};

</script>
