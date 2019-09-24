<template>
                <li class="geofs-list-collapsible-item geofs-hideForApp">
                    Debug info
                    <div class="geofs-collapsible geofs-tab-debug">
                        <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" onclick="window.location.reload(true);">Reload GeoFS with clean cache</button>
                        <br/>
                        <br/>
                        <textarea class="geofs-debug-info"></textarea>
                    </div>
                </li>
</template>

<script>
export default {
  name: 'DebugInforSetting',
  data() {
    return {
    
    };
  },
  created() {

  },
};

</script>

