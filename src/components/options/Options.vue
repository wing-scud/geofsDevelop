<template>
        <div class="geofs-ui-bottom">
            <!-- Small screen menu -->
            <button id="small_screen_menu" class="mdl-button mdl-js-button mdl-button--icon geofs-smallScreenOnly">
        <i class="material-icons">more_vert</i>
         </button>
            <!-- Small Screen Menu -->
            <ul class="mdl-menu mdl-menu--top-left mdl-js-menu mdl-js-ripple-effect geofs-smallScreenOnly" for="small_screen_menu">
             <!-- Pause, mute, reset -->
                <li class="mdl-menu__item">
                    <div class="geofs-ui-bottom-box geofs-f-standard-ui">
                        <button class="geofs-button-pause mdl-button mdl-js-button mdl-button--icon"  v-on:click="togglePause()" title="Pause/Unpause the simulation [P]">
                            <i class="material-icons">pause_circle_outline</i>
                        </button>
                        <button class="geofs-button-mute mdl-button mdl-js-button mdl-button--icon" onclick="audio.toggleMute();" title="Mute/Unmute sound [S]">
                            <i class="material-icons">volume_off</i>
                        </button>
                        <button class="mdl-button mdl-js-button mdl-button--icon" onclick="geofs.resetFlight();" title="Reset the flight [R]">
                            <i class="material-icons">autorenew</i>
                        </button>
                    </div>
                </li>
                <!--options setting-->
                 <li class="mdl-menu__item">
                    <button class="mdl-button mdl-js-button geofs-f-standard-ui" data-toggle-panel=".geofs-preference-list" title="Open the settings/options panel [O]">
                        <i class="material-icons">settings</i>
                        Options
                    </button>
                </li>
                <li class="mdl-menu__item">
                    <button class="mdl-button mdl-js-button geofs-f-standard-ui" data-toggle-panel=".geofs-map-list" title="Navigation and Autopilot panel [N]">
                        <i class="material-icons">explore</i>
                        Nav
                    </button>
                </li>
            </ul>
            <!-- Full size menu -->
            <!-- Main panels toggle buttons -->
            <button class="mdl-button mdl-js-button geofs-f-standard-ui" data-toggle-panel=".geofs-aircraft-list">Aircraft</button>
            <button class="mdl-button mdl-js-button mdl-button--colored geofs-authenticated geofs-editor-role geofs-f-standard-ui geofs-bigScreenOnly" data-toggle-panel=".geofs-debug">Debug</button>
            <button class="mdl-button mdl-js-button geofs-f-standard-ui" data-toggle-panel=".geofs-location-list">Location</button>
            <!--   * Camera selector      -->
            <button id="geofs-camera-selector" class="mdl-button mdl-js-button">Camera</button>
            <ul class="mdl-menu mdl-menu--top-left mdl-js-menu mdl-js-ripple-effect" for="geofs-camera-selector">
                <li class="geofs-extra-views mdl-menu__item mdl-menu__item--full-bleed-divider">
                    Extra views
                    <ul class="mdl-menu geofs-extra-views-holder">
                        <!-- to be filled from aircraft definition -->
                    </ul>
                </li>
                <li class="mdl-menu__item" data-camera="camera.set(0);">Follow cam</li>
                <li class="mdl-menu__item" data-camera="camera.set(1);">Cockpit cam</li>
                <li class="mdl-menu__item" data-camera="camera.set(2);">Cockpit-less cam</li>
                <li class="mdl-menu__item" data-camera="camera.set(3);">Chase cam</li>
                <li class="mdl-menu__item" data-camera="camera.set(4);">Free cam</li>
            </ul>
            <!-- Options and map -->
            <div class="geofs-ui-bottom-separator geofs-f-standard-ui geofs-bigScreenOnly"></div>
            <button class="mdl-button mdl-js-button geofs-f-standard-ui" data-toggle-panel=".geofs-preference-list" title="Open the settings/options panel [O]" data-tooltip-classname="mdl-tooltip--top">
        Options <i class="material-icons geofs-ui-bottom-icon">settings</i>
    </button>
            <button class="mdl-button mdl-js-button geofs-f-standard-ui" data-toggle-panel=".geofs-map-list" title="Open the navigation panel [N]" data-tooltip-classname="mdl-tooltip--top">
           Nav <i class="material-icons geofs-ui-bottom-icon">explore</i>
    </button>
            <!-- Pause, mute, reset, playback -->
            <div class="geofs-ui-bottom-box geofs-f-standard-ui geofs-bigScreenOnly">
                <button class="geofs-button-pause mdl-button mdl-js-button mdl-button--icon" data-tooltip-classname="mdl-tooltip--top" v-on:click="togglePause()" title="Pause/Unpause the simulation [P]">
            <i class="material-icons">pause_circle_outline</i>
        </button>
                <button class="geofs-button-mute mdl-button mdl-js-button mdl-button--icon" data-tooltip-classname="mdl-tooltip--top" onclick="audio.toggleMute();" title="Mute/Unmute sound [S]">
            <i class="material-icons">volume_off</i>
        </button>
                <button class="mdl-button mdl-js-button mdl-button--icon" data-tooltip-classname="mdl-tooltip--top" onclick="geofs.resetFlight();" title="Reset the flight [R]">
            <i class="material-icons">autorenew</i>
        </button>
                <button class="mdl-button mdl-js-button mdl-button--icon" data-tooltip-classname="mdl-tooltip--top" v-on:click="enterPlayback()" title="Watch recorded flight">
            <i class="material-icons">play_circle_outline</i>
        </button>
                <!--<button class="mdl-button mdl-js-button mdl-button--icon" onclick="ui.vr(true);" title="Toggle VR mode"><i class="material-icons">visibility</i></button>-->
            </div>
            <button class="mdl-button mdl-js-button geofs-authenticated mdl-button--icon geofs-f-standard-ui" data-tooltip-classname="mdl-tooltip--top" data-toggle-panel=".geofs-player-list" title="List of online pilots">
        <i class="material-icons">group</i>
                    </button>
            <!-- Chat -->
            <div class="geofs-chat-input-section geofs-authenticated geofs-f-standard-ui geofs-bigScreenOnly">
                  <button class="geofs-chat-button mdl-button mdl-js-button" data-tooltip-classname="mdl-tooltip--top" title="Type a chat message [T]">
                 Talk <i class="icon-align-left"></i>
                     </button>
                    <form class="geofs-chat-form">
                    <div class="mdl-textfield mdl-js-textfield">
                        <input class="mdl-textfield__input geofs-chat-input geofs-stopKeyboardPropagation geofs-stopKeyupPropagation geofs-stopMousePropagation" size="30" maxlength="140" type="text" id="chatInput">
                        <label class="mdl-textfield__label" for="chatInput">Message...</label>
                    </div>
                    <button class="geofs-chat-send-button mdl-button mdl-js-button mdl-button--colored" type="submit">Send</button>
                     </form>
            </div>
            <button class="mdl-button mdl-js-button mdl-button--icon geofs-f-standard-ui geofs-orientationReset" data-tooltip-classname="mdl-tooltip--top" title="Reset orientation controls to neutral">
            <i class="material-icons">adjust</i>
    </button>
            <!--        * Record player  -->
            <div class="geofs-f-recordPlayer geofs-bigScreenOnly">
                <button class="mdl-button mdl-js-button" v-on:click="exitPlayback()" data-tooltip-classname="mdl-tooltip--top" title="Exit record player">Exit player</button>
                <!-- Player controls -->
                <div class="geofs-ui-bottom-box">
                    <button class="mdl-button mdl-js-button mdl-button--icon" onclick="flight.recorder.setStep(0);" data-tooltip-classname="mdl-tooltip--top" title="Begining">
                    <i class="material-icons">fast_rewind</i>
                    </button>
                    <button class="mdl-button mdl-js-button mdl-button--icon" onclick="flight.recorder.startPlayback();" data-tooltip-classname="mdl-tooltip--top" title="Start playback">
                    <i class="material-icons">play_arrow</i>
                     </button>
                     <button class="geofs-button-pause mdl-button mdl-js-button mdl-button--icon" v-on:click="togglePause()" data-tooltip-classname="mdl-tooltip--top" title="Pause/Unpause playback [P]">
                     <i class="material-icons">pause</i>
                        </button>
                    <button class="mdl-button mdl-js-button mdl-button--icon" onclick="flight.recorder.setStep(100000);" data-tooltip-classname="mdl-tooltip--top" title="End">
                         <i class="material-icons">fast_forward</i>
                    </button>
                </div>
            </div>


            <!-- player's slider -->
            <div class="geofs-f-recordPlayer geofs-slider-container geofs-bigScreenOnly">
                <div class="slider geofs-recordPlayer-slider" type="slider" value="0" min="0" precision="0" style="height: 10px;">
                    <div class="slider-rail">
                        <div class="slider-selection">
                            <div class="slider-grippy">
                                <input class="slider-input">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
</template>

<script>
import geofs from "../../lib/geofs"
import flight from "../../lib/modules/flight"
export default {
  name: 'Options',
  data() {
    return {
    
    };
  },
  methods:{
    enterPlayback:function() {
        geofs.aircraft.instance.rigidBody.saveState();
        flight.recorder.stopRecording();
        $('.geofs-recordPlayer-slider').attr('max', flight.recorder.tape.length - 2);
        flight.recorder.setStep(0);
        $('.geofs-recordPlayer-slider').on('userchange', (a, b) => {
        flight.recorder.setStep(parseInt(b), !0);
        }).on('dragstart', flight.recorder.pausePlayback).on('dragend', flight.recorder.unpausePlayback);
         $('body').addClass('geofs-record-playing');
         flight.recorder.playing = !0;
        },  
   exitPlayback:function() {
        geofs.doPause();
        flight.recorder.playing = !1;
        geofs.aircraft.instance.rigidBody.restoreState();
        flight.recorder.setStep(flight.recorder.currentStep);
        geofs.aircraft.instance.object3d.resetRotationMatrix();
        $('body').removeClass('geofs-record-playing');
        flight.recorder.startRecording();
        },
  togglePause: function() {
    geofs.pause ? geofs.undoPause(2) : geofs.doPause(2);
    }
  },
  created() {

  },
};

</script>
