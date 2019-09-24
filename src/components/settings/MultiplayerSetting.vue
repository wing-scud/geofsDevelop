<template>
            <li class="geofs-list-collapsible-item">
                Multiplayer
                <div class="geofs-collapsible">
                    <fieldset>
                        <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="enableMultiplayer" title="Enable multiplayer">
                                <input type="checkbox" id="enableMultiplayer" class="mdl-switch__input" gespref="geofs.preferences.multiplayer" update="if (this.checked) {multiplayer.start();} else {multiplayer.stop();};"/>
                                <span class="mdl-switch__label">Enable multiplayer</span>
                            </label>
                        <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="enableADSB" title="Enable ADS-B Traffic">
                                <input type="checkbox" id="enableADSB" class="mdl-switch__input" gespref="geofs.preferences.adsb"/>
                                <span class="mdl-switch__label">Show ADS-B commercial traffic</span>
                            </label>
                        <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect geofs-hideForApp" for="enableChat" title="Enable text chat">
                                <input type="checkbox" id="enableChat" class="mdl-switch__input geofs-enabledWhenAuthenticated" gespref="geofs.preferences.chat" update="if (!this.checked) {ui.chat.hide();};"/>
                                <span class="mdl-switch__label">Enable text chat</span>
                            </label>
                        <i class="geofs-loggedout geofs-hideForApp">
                                You must be logged in to use the chat<br/>
                            </i>
                        <i class="geofs-hideForApp">
                                Note: the chat is self moderated: please stay courteous.<br/>If you may be offended by strong language, leave the chat off.
                            </i>
                    </fieldset>
                    <fieldset>
                        <legend>Discord audio chat
                        </legend>
                        A Discord server is available for audio chat in GeoFS.
                        <a href="https://discordapp.com/invite/dGpuATu" target="_blank" rel="nofollow">
                            <img src="images/discord.png" />
                        </a>
                    </fieldset>
                </div>
            </li>
</template>

<script>
export default {
  name: 'MultiplayerSetting',
  data() {
    return {
    
    };
  },
  created() {

  },
};

</script>



