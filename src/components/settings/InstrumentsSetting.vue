<template>
<div>
<li class="geofs-list-collapsible-item">
     Instructions
    <div class="geofs-collapsible">
   <div class="geofs-onlyForApp">
                        <img src="images/help.jpg" style="width: 100%;" /> GeoFS is generally flown using the device orientation: when starting, press "Tap to calibrate" to center the controls in the device current position.<br/>
                        <br/> It is possible to re-center the orientation controls during flight by tapping the circle icon at the bottom right of the screen.<br/>
                        <br/> Tilt forward for nose down and backward for nose up. Tilt left and right to steer.<br/>
                        <br/> By Default, rudder is synchronised with ailerons: this can be disabled in the options panel.<br/> If available, device magnetometer (yaw orientation) is used to control the rudder<br/>
                        <br/> Throttle is controlled with the vertical slider on the right of the screen.<br/>
                        <br/> An alternate control method is available and can be configured in the options panel: the "touch stick" is a touch controller located on the left of the screen that works just like a game pad.<br/>
                        <br/> Camera is rotated by panning the main view.<br/> Zooming is achieved by pinching the main view.<br/>
                        <br/> On the map, each dot represent a runway (blue dots are large runways and yellow dots are small airstrips).<br/> Tapping a dot allows you to take-off or approach any runway.<br/> Tapping anywhere on the map gives the option
                        to fly to the location at predefined altitudes.<br/>
                        <br/> You can synchronise your mobile device and your existing (web) GeoFS account in order to retrieve your HD susbscription (if you already purchased one).<br/> A Google sign-in button is shown in Options > User account > Account
                        for that purpose. Once synced, your call-sign and statistics will also be retrieved from your existing account.<br/>
                        <br/> For more info about GeoFS options and controls, please visit <a href="https://www.geo-fs.com/pages/instructions.php">geo-fs.com</a>
                    </div>
                    <div class="geofs-hideForApp">
                        <a name="requirements"></a>
                        <h4>Requirements:</h4>
                        To use this flight simulator, you will need a WebGL compatible web browser. You can test this here <a href="http://webglreport.com" target="_blank">http://webglreport.com</a>
                        <br/> If you want to play using a joystick, you will need a GamePad API compliant browser (test it <a href="http://html5gamepad.com/">here</a> ) (Chrome, Firefox, Opera, <a href="http://caniuse.com/#feat=gamepad" target="_blank">etc.</a>                        ).

                        <a name="imagery"></a>
                        <h4>Satellite Images:</h4>
                        GeoFS is providing 10–60 meter global Sentinel-2 satellite images for free.<br/> When flying with this dataset, the resolution is not sufficient to clearly render runways so GeoFS overlay a standard runway image for all the world
                        major airports.<br/>
                        <br/> For a photo-realistic rendering, you can purchase HD (sub-meter) Microsoft Bing imagery subscription for <span style="font-size: 16px;">€9.99</span> per year
                        </b><br/> More about GeoFS HD on the <a href="/pages/hd.php">GeoFS HD Subscriptions page</a> ).

                        <a name="controls"></a>
                        <h4>How to control the flight simulator?</h4>
                        <h5>Option bar</h5>
                        The option bar, at the bottom of the game screen, is the main way to interact with the flight simulator:

                        <ul>
                            <li>The first three menus are used to choose your aircraft, location and camera mode.</li>
                            <li>The "options" button opens the configuration panel: configure controls, enable multiplayer/chat, weather preferences, etc.</li>
                            <li>The "nav" button opens the navigation panel that contains the map and autopilot interface.</li>
                            <li>The "pause", "mute", "reset" and "replay" buttons respectively pause the game, mute the sound, reset your flight to the last state and open the flight record player.</li>
                            <li>
                                The "talk" button shows an input field to type a chat message. <b>(Chat is disabled by default, enable it from the option panel)</b>
                            </li>
                        </ul>
                        <h5>Keyboard:</h5>
                        Configurable:

                        <ul>
                            <li>
                                <b>Arrows up &down</b> : tilt the aircraft
                            </li>
                            a

                            <li>
                                <b>Arrow left &right</b> : roll the aircraft (mixed with yaw by default but can be configured)
                            </li>
                            <li>
                                <b>Enter</b> recenter keyboard control input
                            </li>
                            <li>
                                <b>&lt;&&gt;</b> : steer the aircraft (Yaw) (only effective when roll/yaw mixing is disabled)
                            </li>
                            <li>
                                <b>+ &-</b> (or PgUp &PgDn): Increase or decrease throttle
                            </li>
                            <li>
                                <b>[</b> : lower the flaps one step (when available)
                            </li>
                            <li>
                                <b>]</b> : raise the flaps one step (when available)
                            </li>
                            <li>
                                <b>Home/End</b> : increase/decrease elevator trim
                            </li>
                            <li>
                                <b>Delete</b> : Reset elevator trim
                            </li>
                            <li>
                                <b>G</b> : raise or lower the landing gear (when available)
                            </li>
                            <li>
                                <b>B</b> : extend/retract air-brakes (when available)
                            </li>
                            <li>
                                <b>E</b> : start/stop engine
                            </li>
                            <li>
                                <b>Space</b> : brakes
                            </li>
                            <li>
                                <b>;</b> : Engage/Disengage parking brake
                            </li>
                            <li>
                                <b>X</b> : Optional animated parts toggle
                            </li>
                            <li>You can configure the keyboard sensitivity from the "option" panel.</li>
                        </ul>
                        Fixed:

                        <ul>
                            <li>
                                <b>0 to 9</b> : Directly set throttle by 10% steps
                            </li>
                            <li>
                                <b>A</b> : Toggle autopilot
                            </li>
                            <li>
                                <b>C</b> : cycle camera mode
                            </li>
                            <li>
                                <b>Q</b> : orbit the camera (in follow or cockpit mode)
                            </li>
                            <li>
                                <b>N</b> : open navigation panel (map)
                            </li>
                            <li>
                                <b>O</b> : open option panel
                            </li>
                            <li>
                                <b>Tab</b> : fly to camera location (in free camera mode)
                            </li>
                            <li>
                                <b>P</b> : Pause the simulation
                            </li>
                            <li>
                                <b>S</b> : mute/unmute sound
                            </li>
                            <li>
                                <b>K</b> : set controls mode to "Keyboard"
                            </li>
                            <li>
                                <b>M</b> : set controls mode to "Mouse"
                            </li>
                            <li>
                                <b>J</b> : set controls mode to "Joystick"
                            </li>
                            <li>
                                <b>T</b> : to start typing a chat message
                            </li>
                            <li>
                                <b>H</b> : to hide/show the HUD (indicators)
                            </li>
                        </ul>
                        <h5>Mouse:</h5>
                        <ul>
                            <li>Mouse acts as a Joystick

                                <li>push/pull for tilt</li>
                                <li>left/right for roll (mixed with yaw by default but can be configured)</li>
                                <li>You can configure the mouse (sensitivity, exponential) from the "option" panel.</li>
                                <li>All other keyboard controls (except for arrows) are the same</li>
                        </ul>
                        <h5>Joystick:</h5>
                        <b>Note:</b> see <a href="#joystick">how to enable the joystick</a> .

                        <ul>
                            <li>Joystick axis and button are by set by default</li>
                            <li>If available, yaw is set on twist axis</li>
                            <li>You can reconfigure every axis and buttons of the joystick from the "option" panel.</li>
                            <li>All other keyboard controls are the same</li>
                        </ul>
                        <h5>Mobile:</h5>
                        <b>Note:</b> this is an experimental feature. Not all mobile device may be supported.

                        <ul>
                            <li>Orientation input is only available on mobile devices</li>
                            <li>If available, yaw is set on the magnetometer axis</li>
                            <li>You can reconfigure every axis from the "option" panel.</li>
                            <li>A throttle touch pad is displayed in the viewport</li>
                            <li>
                                <b>Tap anywhere in the viewport to recenter the orientation inputs</b>
                            </li>
                        </ul>
                        <a name="helicopter"></a>
                        <h4>Flying helicopters:</h4>
                        Helicopters are by definition much more difficult to fly than airplanes. The basic principle is to play with collective pitch (going up and down), cyclic pitch (going forward, backward, right and left) and anti-torque control (rotation/yaw). By default,
                        mouse and keyboard controls are mixing roll and yaw (aileron and rudder). This has to be disabled (in configuration panel) in order to properly fly the helicopter. Ideally, you would have to use a joystick to be accurate enough
                        with the helicopter but the mouse should be enough for a start. In GeoFS, the collective pitch is controlled using the same input as the throttle for airplanes: if you press '+' several times, the helicopter will lift-off, if you
                        press '-' it will go down. Cyclic pitch can be controlled using the arrow keys or the mouse. When roll/yaw mixing is disabled, use the rudder keys (default are keys A &D) for the anti-torque (yaw). The rest is just practice and
                        finesse.
                        <a name="balloon"></a>
                        <h4>Flying Major Tom:</h4>
                        Major Tom is probably the easiest and most relaxing way of flying in GeoFS. With just two keys you can take to the skies and look down at the earth. The 'up' arrow key (or moving mouse or joystick up) fires the burner and when air is hot enough the balloon
                        will take-off. To navigate, you can try to climb to different altitudes and reach different direction and speed of wind.
                        <a name="camera"></a>
                        <h4>Camera:</h4>
                        Five cameras are available. You can choose between these five modes from the option bar or by pressing "C" to cycle through all modes.

                        <ul>
                            <li>Follow: the camera follows the plane at a distance.</li>
                            <li>Cockpit: the camera gives a view from the pilot seat.</li>
                            <li>Cockpit-less: same as "cockpit" but without visible 3D model.</li>
                            <li>Chase: the camera is static but look at the plane.</li>
                            <li>Free: this is the default CesiumJS camera (uses default controls).</li>
                        </ul>
                        In "Follow" and "Cockpit" mode, you can left-click and drag your mouse to change the camera orientation.<br/> In "Follow" mode, you can right-click and drag to set the camera's zoom factor/distance.<br/> Use mouse wheel to increase
                        or decrease camera field of view. When in "Free" mode, you can position the camera to a location you like and press &lt;Tab &gt;to place the aircraft where the camera is.<br/> Some aircraft will add extra cameras to the menu (cabin,
                        wheels, wing, etc...)
                        <a name="destinations"></a>
                        <h4>Where can I fly?</h4>
                        Virtually everywhere!

                        <ul>
                            <li>You can pick a preset destination from the option bar.</li>
                            <li>The location selector also offer a search input field in which you can type any destination. The aircraft will be positioned at the chosen place and at an altitude of 1000 feet.</li>
                            <li>
                                The last (and best?) way is to <a href="#map">use the in-game map</a> to fly from over 30,000 runways in the world or anywhere else you may choose.
                            </li>
                        </ul>
                        <a name="map"></a>
                        <h4>How to use the map?</h4>
                        <br/>
                        <a href="/pages/map.php" target="_blank">See the standalone live GeoFS map</a>
                        <br/>
                        <br/> Open the map using the "Nav" button in the option bar.<br/> Three types of map are available: standard, runways and aeronautical.<br/> In Runway mode, every coloured dot marks a runway threshold. You can click on these dots
                        to open an info balloon in which you can see two links to "take-off from" or "fly by" the clicked runway. When choosing "take-off from", the aircraft should be positioned on the threshold and facing the runway. <b>note: due to some imprecision in the collected data, this is not always true (especially for small airfields).</b>
                        <br/> Dots are colour coded depending on the length of the runway: blue for major runways (>3,000 ft), green for airfield size runways, yellow when length is unknown.<br/>
                        <br/> A right-click on the map will bring a window to fly to the clicked destination from 4 pre-set altitudes.
                        <br/> In "Aeronautical" mode, the map shows a layer of airspace areas. This overlay has been generated using DAFIF data. <b>While this can be useful to practice some flight patterns, these data are to be used with this game only and should not be used for real life flying.</b>
                        <a name="chat"></a>
                        <h4>How to block users in the chat?:</h4>
                        You can block a user's chat messages by clicking on it's call-sign (name) and clicking the "block" button. If you accidentally blocked a user, you can un-block him from your profile panel (home page > profile > blocked users).

                        <a name="performance"></a>
                        <h4>CesiumJS performance issue:</h4>
                        On laptops running Windows and using dual graphic card configuration (via Nvidia Optimus), browsers seems to always be using the integrated Intel GPU.<br/> For Google Chrome, using the --disable-gpu-driver-bug-workarounds command
                        line flag will help forcing the browser to switch to the Nvidia GPU.<br/> Using Opera, make sure to enable hardware acceleration in the settings panel (show advanced settings)<br/> The configuration panel ("Simulation" tab) offers
                        a degraded rendering to improve frame rate on low end devices.<br/> The new dropped shadows can have a performance impact and can be disabled in the same panel.<br/> Also read:<br/>
                        <a href="http://alteredqualia.com/texts/optimus/" target=_blank ">http://alteredqualia.com/texts/optimus/</a><br/>
                       <a href=" https://cesiumjs.org/2014/12/01/WebGL-Profiling-Tips " target=_blank">https://cesiumjs.org/2014/12/01/WebGL-Profiling-Tips</a>
                        <a name="joystick"></a>
                        <h4>How to enable Joystick control:</h4>
                        If your browser implements the gamePad API, simply press one of the joystick's button to activate it.<br/> You can test if your joystick works and make sure your browser support the gamePadAPI <a href="http://html5gamepad.com/">here</a>
                        <a name="issues"></a>
                        <h4>Known issues and troubleshooting:</h4>
                        <ul>
                            <li>Runways are bumpy: this is inherent to the data provided by CesiumJS. I can not do much about this.</li>
                            <li>The new Cesium based GeoFS is flat (no 3D buildings): Cesium does not provide any 3D buildings yet but this is in their development plan.</li>
                        </ul>
                        <b>The flight simulator is slow</b>
                        <ul>
                            <li>GeoFS requires a recent computer and a good graphic card in order to achieve comfortable frame-rate.</li>
                            <li>Make sure GeoFS only is running (close other browser tabs and background applications)</li>
                            <li>
                                Read the <a href="#performance">Performance</a> section of this page
                            </li>
                        </ul>
                        <b>In general, a few things to try...</b>
                        <ul>
                            <li>Reset GeoFS preferences from the option panel</li>
                            <li>Try to clear you cache and refresh the page.</li>
                            <li>If the flight simulator does not work, please try using a different web browser.</li>
                        </ul>
                        <br/> For any other issues, please submit a bug report (see below, and remember to mention your web browser and operating system version).

                        <a name="bugreport"></a>
                        <h4>Bug report:</h4>
                        You can report issues on <a href="https://groups.google.com/forum/#!forum/geo-fs-bugs" target="_blank">this Google Group</a> .
                        <br/> When reporting a bug, please be as descriptive as possible and indicate what operating system, web browser and graphic card you are using to run this game.
                        <br/>A "debug info" tab is available in the option panel. Please communicate this info when reporting a bug.

                    </div>
                </div>
                </li>
                <li class="geofs-list-collapsible-item geofs-onlyForApp">
                    Credits/Attributions

                    <div class="geofs-collapsible">
                        <br/>
                        <img src="images/bing.png" />
                        <br/>
                        <br/>
                        <br/> HD images are provided by Microsoft Bing Maps<br/>
                        <br/> SD images come from
                        <i>
              <a class="a-light" xmlns:dct="http://purl.org/dc/terms/" href="https://s2maps.eu" property="dct:title">Sentinel-2 cloudless - https://s2maps.eu</a>
                by <a class="a-light" xmlns:cc="http://creativecommons.org/ns#" href="https://eox.at" property="cc:attributionName" rel="cc:attributionURL">EOX IT Services GmbH</a>
              (Contains modified Copernicus Sentinel data 2016 &amp;2017)
               </i>
                        <br/>
                        <br/> GeoFS uses Cesium (<a href="https://cesium.com">https://cesium.com</a> ) for rendering.<br/>
                        <br/> For more information about credits and attribution for GeoFS, please visit <a href="https://www.geo-fs.com">https://www.geo-fs.com</a>
                    </div>
                </li>
</div>
                
</template>

<script>
export default {
  name: 'InstrumentsSetting',
  data() {
    return {
    
    };
  },
  created() {

  },
};