<template>

            <li class="geofs-list-collapsible-item geofs-preference-controls">
                Controls
                <ul class="geofs-list">
                    <legend>Select a control device and configure it.</legend>
                    <li class="no-hover geofs-list-collapsible-item geofs-hideForApp">
                        <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect geofs-stopMousePropagation geofs-expendable-radio" for="control-keyboard">
                                <input type="radio" id="control-keyboard" class="mdl-radio__button" name="control" update="controls.setMode" gespref="geofs.preferences.controlMode" matchvalue="keyboard"/>
                                <span class="mdl-radio__label">Keyboard [K]
                    </span>
                            </label> configure
                        <div class="geofs-collapsible">
                            <fieldset>
                                <legend>Settings
                                </legend>
                                <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="keyboardMixYawRoll" title="Mixes the rudder with the ailerons input">
                                        <input type="checkbox" id="keyboardMixYawRoll" class="mdl-switch__input" gespref="geofs.preferences.keyboard.mixYawRoll" update="controls.setMode();">
                                        <span class="mdl-switch__label">Mix Roll/Yaw</span>
                                    </label>
                                <div title="Sets how much rudder is mixed from the ailerons input" class="slider span2" type="slider" gespref="geofs.preferences.keyboard.mixYawRollQuantity" update="controls.setMode();" value="0" min="0.1" max="4" precision="1">
                                    <div class="slider-rail">
                                        <div class="slider-selection">
                                            <div class="slider-grippy">
                                                <input class="slider-input" />
                                            </div>
                                        </div>
                                    </div>
                                    <label>Roll/Yaw Mix Ratio</label>
                                </div>
                                <div title="Sets how quickly the input responds" class="slider span2" type="slider" gespref="geofs.preferences.keyboard.sensitivity" update="controls.setMode();" value="0" min="0.1" max="4" precision="1">
                                    <div class="slider-rail">
                                        <div class="slider-selection">
                                            <div class="slider-grippy">
                                                <input class="slider-input" />
                                            </div>
                                        </div>
                                    </div>
                                    <label>Sensitivity</label>
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend>Keys
                                </legend>
                                <div class="geofs-keyboard-keys-container">
                                </div>
                            </fieldset>
                        </div>
                    </li>
                    <li class="no-hover geofs-list-collapsible-item geofs-hideForApp">
                        <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect geofs-stopMousePropagation geofs-expendable-radio" for="control-mouse">
                                <input type="radio" id="control-mouse" class="mdl-radio__button" name="control" update="controls.setMode" gespref="geofs.preferences.controlMode" matchvalue="mouse"/>
                                <span class="mdl-radio__label">Mouse [M]</span>
                            </label> configure

                        <div class="geofs-collapsible">
                            <fieldset>
                                <legend>Settings
                                </legend>
                                <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="mouseMixYawRoll" title="Mixes the rudder with the ailerons input">
                                        <input type="checkbox" id="mouseMixYawRoll" class="mdl-switch__input" gespref="geofs.preferences.mouse.mixYawRoll" update="controls.setMode();">
                                        <span class="mdl-switch__label">Mix Roll/Yaw</span>
                                    </label>
                                <div title="Sets how much rudder is mixed from the ailerons input" class="slider span2" type="slider" gespref="geofs.preferences.mouse.mixYawRollQuantity" update="controls.setMode();" value="0" min="0.1" max="4" precision="1">
                                    <div class="slider-rail">
                                        <div class="slider-selection">
                                            <div class="slider-grippy">
                                                <input class="slider-input" />
                                            </div>
                                        </div>
                                    </div>
                                    <label>Roll/Yaw Mix Ratio</label>
                                </div>
                                <div title="Sets how quickly the input responds" class="slider span2" type="slider" gespref="geofs.preferences.mouse.sensitivity" update="controls.setMode();" value="0" min="0.1" max="2" precision="1">
                                    <div class="slider-rail">
                                        <div class="slider-selection">
                                            <div class="slider-grippy">
                                                <input class="slider-input" />
                                            </div>
                                        </div>
                                    </div>
                                    <label>Sensitivity</label>
                                </div>
                                <div title="For hight value, input will be gentle near the center and fast at the extremes" class="slider span2" type="slider" gespref="geofs.preferences.mouse.exponential" update="controls.setMode();" value="0" min="0.1" max="2" precision="1">
                                    <div class="slider-rail">
                                        <div class="slider-selection">
                                            <div class="slider-grippy">
                                                <input class="slider-input" />
                                            </div>
                                        </div>
                                    </div>
                                    <label>Exponential</label>
                                </div>
                            </fieldset>
                        </div>
                    </li>
                    <li class="no-hover geofs-list-collapsible-item geofs-hideForApp">
                        <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect geofs-stopMousePropagation geofs-expendable-radio" for="control-joystick">
                                <input type="radio" id="control-joystick" class="mdl-radio__button" name="control" update="controls.setMode" gespref="geofs.preferences.controlMode" matchvalue="joystick"/>
                                <span class="mdl-radio__label">Joystick [J]
                    </span>
                            </label> configure

                        <div class="geofs-collapsible geofs-preferences-joystick">
                            <fieldset class="geofs-preferences-joystick-status">
                                <legend>Device Status
                                </legend>
                                <div class="alert alert-error">
                                    <b style="color: red;">Your browser does not appear to support the native GamePad API</b>
                                </div>
                                <div class="alert alert-warning">
                                    <b>Joystick not detected:</b> press a button on the Joystick to enable it.

                                </div>
                                <div class="alert alert-success"></div>
                            </fieldset>
                            <fieldset>
                                <legend>Settings
                                </legend>
                                <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="joystickMixYawRoll" title="Mixes the rudder with the ailerons input">
                                        <input type="checkbox" id="joystickMixYawRoll" class="mdl-switch__input" gespref="geofs.preferences.joystick.mixYawRoll" update="controls.setMode();">
                                        <span class="mdl-switch__label">Mix Roll/Yaw</span>
                                    </label>
                                <div title="Sets how much rudder is mixed from the ailerons input" class="slider span2" type="slider" gespref="geofs.preferences.joystick.mixYawRollQuantity" update="controls.setMode();" value="0" min="0.1" max="4" precision="1">
                                    <div class="slider-rail">
                                        <div class="slider-selection">
                                            <div class="slider-grippy">
                                                <input class="slider-input" />
                                            </div>
                                        </div>
                                    </div>
                                    <label>Roll/Yaw Mix Ratio</label>
                                </div>
                                <div title="Sets how quickly the input responds" class="slider span2" type="slider" gespref="geofs.preferences.joystick.sensitivity" update="controls.setMode();" value="0" min="0.1" max="2" precision="1">
                                    <div class="slider-rail">
                                        <div class="slider-selection">
                                            <div class="slider-grippy">
                                                <input class="slider-input" />
                                            </div>
                                        </div>
                                    </div>
                                    <label>Sensitivity</label>
                                </div>
                                <div title="For hight value, input will be gentle near the center and fast at the extremes" class="slider span2" type="slider" gespref="geofs.preferences.joystick.exponential" update="controls.setMode();" value="0" min="0.1" max="2" precision="1">
                                    <div class="slider-rail">
                                        <div class="slider-selection">
                                            <div class="slider-grippy">
                                                <input class="slider-input" />
                                            </div>
                                        </div>
                                    </div>
                                    <label>Exponential</label>
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend>Axes
                                </legend>
                                <div class="geofs-preferences-comment">Move the joystick to check activity
                                </div>
                                <div class="geofs-joystick-axes-container">
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend>Buttons
                                </legend>
                                <div class="geofs-preferences-comment">Press joystick buttons to check activity
                                </div>
                                <div class="geofs-joystick-button-container">
                                </div>
                            </fieldset>
                        </div>
                    </li>
                    <li class="no-hover geofs-list-collapsible-item geofs-preferences-orientation geofs-onlyForApp">
                        <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect geofs-stopMousePropagation geofs-expendable-radio" for="control-orientation">
                                <input type="radio" id="control-orientation" class="mdl-radio__button" name="control" update="controls.setMode" gespref="geofs.preferences.controlMode" matchvalue="orientation"/>
                                <span class="mdl-radio__label">Orientation
                    </span>
                            </label> configure

                        <div class="geofs-collapsible">
                            <div class="geofs-preferences-orientation-status">
                                <div class="alert alert-error">
                                    <b style="color: red;">Your device does not appear to support the orientation API</b>
                                </div>
                            </div>
                            <fieldset>
                                <legend>Settings
                                </legend>
                                <label class="checkbox" title="Mixes the rudder with the ailerons input">
                                        <input type="checkbox" gespref="geofs.preferences.orientation.mixYawRoll" update="controls.setMode();"/>Mix Roll/Yaw 
                                    </label>
                                <div title="Sets how much rudder is mixed from the ailerons input" class="slider span2" type="slider" gespref="geofs.preferences.orientation.mixYawRollQuantity" update="controls.setMode();" value="0" min="0.1" max="4" precision="1">
                                    <div class="slider-rail">
                                        <div class="slider-selection">
                                            <div class="slider-grippy">
                                                <input class="slider-input" />
                                            </div>
                                        </div>
                                    </div>
                                    <label>Roll/Yaw Mix Ratio</label>
                                </div>
                                <div title="Sets how quickly the input responds" class="slider span2" type="slider" gespref="geofs.preferences.orientation.sensitivity" update="controls.setMode();" value="0" min="0.1" max="2" precision="1">
                                    <div class="slider-rail">
                                        <div class="slider-selection">
                                            <div class="slider-grippy">
                                                <input class="slider-input" />
                                            </div>
                                        </div>
                                    </div>
                                    <label>Sensitivity</label>
                                </div>
                                <div title="For hight value, input will be gentle near the center and fast at the extremes" class="slider span2" type="slider" gespref="geofs.preferences.orientation.exponential" update="controls.setMode();" value="0" min="0.1" max="2" precision="1">
                                    <div class="slider-rail">
                                        <div class="slider-selection">
                                            <div class="slider-grippy">
                                                <input class="slider-input" />
                                            </div>
                                        </div>
                                    </div>
                                    <label>Exponential</label>
                                </div>
                            </fieldset>
                            <fieldset style="float: left;">
                                <legend>Axis
                                </legend>
                                <div class="geofs-preferences-comment">Move the device to check activity.
                                </div>
                                <div class="geofs-feedback-wrapper">
                                    <label>Pitch</label>
                                    <select gespref="geofs.preferences.orientation.axis.pitch">
                                            <option value="none">None</option>
                                            <option value="0">Axis 0</option>
                                            <option value="1">Axis 1</option>
                                        </select>
                                    <div class="progress" axis="pitch" centered="true">
                                        <div class="bar"></div>
                                    </div>
                                    <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="reverseOrientationPitch" title="Reverse axis">
                                            <input type="checkbox" id="reverseOrientationPitch" class="mdl-switch__input" gespref="geofs.preferences.orientation.multiplier.pitch" update="controls.setMode();">
                                            <span class="mdl-switch__label">Reverse</span>
                                        </label>
                                </div>
                                <div class="geofs-feedback-wrapper">
                                    <label>Roll</label>
                                    <select gespref="geofs.preferences.orientation.axis.roll">
                                            <option value="none">None</option>
                                            <option value="0">Axis 0</option>
                                            <option value="1">Axis 1</option>
                                        </select>
                                    <div class="progress" axis="roll" centered="true">
                                        <div class="bar"></div>
                                    </div>
                                    <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="reverseOrientationRoll" title="Reverse axis">
                                            <input type="checkbox" id="reverseOrientationRoll" class="mdl-switch__input" gespref="geofs.preferences.orientation.multiplier.roll" update="controls.setMode();">
                                            <span class="mdl-switch__label">Reverse</span>
                                        </label>
                                </div>
                            </fieldset>
                            <div class="geofs-orientationReset geofs-orientationCalibratePerm" style=" margin-top: 0px; display: inline-block; position: relative;">
                                <i class="material-icons md-48">adjust
                        </i>
                                <br/>Tap to center controls

                            </div>
                        </div>
                    </li>
                    <li class="no-hover geofs-list-collapsible-item geofs-preferences-touch geofs-onlyForApp">
                        <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect geofs-stopMousePropagation geofs-expendable-radio" for="control-touch">
                                <input type="radio" id="control-touch" class="mdl-radio__button" name="control" update="controls.setMode" gespref="geofs.preferences.controlMode" matchvalue="touch"/>
                                <span class="mdl-radio__label">Touch Stick
                             </span>
                            </label> configure

                        <div class="geofs-collapsible">
                            <fieldset>
                                <legend>Settings
                                </legend>
                                <label class="checkbox" title="Mixes the rudder with the ailerons input">
                                        <input type="checkbox" gespref="geofs.preferences.touch.mixYawRoll" update="controls.setMode();"/>Mix Roll/Yaw 
                                    </label>
                                <div title="Sets how much rudder is mixed from the ailerons input" class="slider span2" type="slider" gespref="geofs.preferences.touch.mixYawRollQuantity" update="controls.setMode();" value="0" min="0.1" max="4" precision="1">
                                    <div class="slider-rail">
                                        <div class="slider-selection">
                                            <div class="slider-grippy">
                                                <input class="slider-input" />
                                            </div>
                                        </div>
                                    </div>
                                    <label>Roll/Yaw Mix Ratio</label>
                                </div>
                                <div title="Sets how quickly the input responds" class="slider span2" type="slider" gespref="geofs.preferences.touch.sensitivity" update="controls.setMode();" value="0" min="0.01" max="1" precision="2">
                                    <div class="slider-rail">
                                        <div class="slider-selection">
                                            <div class="slider-grippy">
                                                <input class="slider-input" />
                                            </div>
                                        </div>
                                    </div>
                                    <label>Sensitivity</label>
                                </div>
                                <div title="For hight value, input will be gentle near the center and fast at the extremes" class="slider span2" type="slider" gespref="geofs.preferences.touch.exponential" update="controls.setMode();" value="0" min="1" max="3" precision="1">
                                    <div class="slider-rail">
                                        <div class="slider-selection">
                                            <div class="slider-grippy">
                                                <input class="slider-input" />
                                            </div>
                                        </div>
                                    </div>
                                    <label>Exponential</label>
                                </div>
                            </fieldset>
                        </div>
                    </li>
                </ul>
            </li>
</template>

<script>
export default {
  name: 'ControlsSetting',
  data() {
    return {
    
    };
  },
  created() {

  },
};

</script>
