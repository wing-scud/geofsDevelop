
import ui from '../ui/ui'
import camera from './camera'
import geofs  from '../geofs'
import audio from "./audio"
import instruments from "./instruments"
import {fixAngle,clamp,exponentialSmoothing ,V3,PID} from "../utils/utils" 
window.controls = window.controls || {};
console.log(V3)
controls = {
    states: {},
    mouse: {}
};
controls.mouse.down = !1;
controls.mouse.orbit = {};
controls.keyboard = {};
controls.keyboard.rollIncrement = .5;
controls.keyboard.pitchIncrement = .5;
controls.keyboard.yawIncrement = .5;
controls.keyboard.throttleIncrement = .8;
controls.keyboard.recenterRatio = .05;
controls.keyboard.override = !1;
controls.keyboard.overrideRudder = !1;
controls.keyboard.exponential = 0;
controls.touch = {
    pitch: 0,
    roll: 0,
    yaw: 0,
    throttle: 0
};
controls.orientation = {
    values: [0, 0, 0],
    generalMultiplier: 1
};
controls.mixYawRoll = !0;
controls.exponential = 1;
controls.mixYawRollQuantity = 1;
controls.mode = "mouse";
controls.init = function() {
    controls.reset();
    geofs.addResizeHandler(controls.initViewportDimensions, controls);
    $(document).on("keydown", controls.keyDown).on("keyup", controls.keyUp);
    controls.mouseHandler = function(a) {
        !1 === controls.mouse.down || geofs.api.nativeMouseHandling ? "mouse" == controls.mode && (controls.mouse.xValue = clamp((a.pageX - controls.mouse.oX - controls.mouse.cX) * controls.mouse.rX, -1, 1),
            controls.mouse.yValue = clamp((a.pageY - controls.mouse.tY - controls.mouse.cY) * controls.mouse.rY, -1, 1),
            controls.keyboard.override = !1) : (1 == controls.mouse.down && camera.rotate((controls.mouse.originalX - a.pageX) * controls.mouse.orbit.ratioX, (controls.mouse.originalY - a.pageY) * controls.mouse.orbit.ratioY) && (a.preventDefault(),
                a.stopPropagation(),
                a.stopImmediatePropagation()),
            3 == controls.mouse.down && camera.translate(-(controls.mouse.lastY - a.pageY) * controls.mouse.orbit.ratioZ) && (a.preventDefault(),
                a.stopImmediatePropagation()),
            controls.mouse.lastY = a.pageY);
        geofs.api.nativeMouseHandling || (a.preventDefault(),
            a.stopImmediatePropagation())
    };
    $(document).on("click", ".geofs-orientationReset, .geofs-orientationCalibrate", function() {
        controls.orientation.recenter()
    });
    $(".geofs-canvas-mouse-overlay, .geofs-ui-right").on("mousemove", function(a) {
        controls.mouseHandler(a)
    });
    controls.mouseDownHandler = function(a) {
        controls.mouse.down = a.which;
        0 === controls.mouse.down && (controls.mouse.down = 1);
        camera.isHandlingMouseRotation() && (a.preventDefault(),
            a.stopImmediatePropagation && a.stopImmediatePropagation(),
            controls.mouse.originalX = a.pageX,
            controls.mouse.originalY = a.pageY,
            controls.mouse.lastY = controls.mouse.originalY,
            camera.saveRotation())
    };
    controls.mouseUpHandler = function(a) {
        camera.isHandlingMouseRotation() && camera.saveRotation();
        a.preventDefault();
        controls.mouse.down = !1
    };
    $(".geofs-canvas-mouse-overlay").on("mousedown", controls.mouseDownHandler);
    $(".geofs-canvas-mouse-overlay").on("mouseup", controls.mouseUpHandler);
    $(".geofs-canvas-mouse-overlay").on("mousewheel", function(a) {
        0 < a.originalEvent.wheelDelta / 120 ? camera.decreaseFOV() : camera.increaseFOV();
        a.preventDefault()
    });
    controls.joystick.init();
    controls.autopilot.initUI();
    controls.setMode(geofs.preferences.controlMode)
};
controls.initViewportDimensions = function() {
    var a = $(".geofs-canvas-mouse-overlay"),
        b = a[0];
    controls.mouse.oX = a.offset().left;
    controls.mouse.cX = b.offsetWidth / 2;
    controls.mouse.rX = 1 / controls.mouse.cX;
    controls.mouse.tY = a.offset().top;
    controls.mouse.cY = b.offsetHeight / 2;
    controls.mouse.rY = 1 / controls.mouse.cY;
    controls.throttlePad = $(".geofs-throttle-pad")[0];
    controls.throttlePad && (controls.throttlePad.tY = controls.throttlePad.offsetTop,
        controls.throttlePad.hY = controls.throttlePad.offsetHeight,
        controls.throttlePad.rY = 1 / controls.throttlePad.hY);
    controls.controlPad = $(".geofs-control-pad")[0];
    controls.controlPad && (controls.controlPad.tY = controls.controlPad.offsetTop,
        controls.controlPad.hY = 75,
        controls.controlPad.rY = 1 / controls.controlPad.hY,
        controls.controlPad.oX = controls.controlPad.offsetLeft,
        controls.controlPad.eX = 75,
        controls.controlPad.rX = 1 / controls.controlPad.eX);
    controls.rudderPad = $(".geofs-rudder-pad")[0];
    controls.rudderPad && (controls.rudderPad.oX = controls.rudderPad.offsetLeft,
        controls.rudderPad.eX = 70,
        controls.rudderPad.rX = 1 / controls.rudderPad.eX);
    controls.viewportWidth = b.offsetWidth;
    controls.viewportHeight = b.offsetHeight;
    controls.mouse.orbit.ratioX = 360 / controls.viewportWidth;
    controls.mouse.orbit.ratioY = 360 / controls.viewportHeight;
    controls.mouse.orbit.ratioZ = .1
};
controls.resetWithAircraftDefinition = function() {
    controls.flaps.maxPosition = geofs.aircraft.instance.setup.flapsPositions ? geofs.aircraft.instance.setup.flapsPositions.length : geofs.aircraft.instance.setup.flapsSteps
};
controls.reset = function() {
    controls.roll = 0;
    controls.rawPitch = 0;
    controls.pitch = 0;
    controls.yaw = 0;
    controls.throttle = 0;
    controls.brakes = 0;
    controls.engine = {};
    controls.engine.on = !1;
    controls.elevatorTrim = 0;
    controls.elevatorTrimMin = -.5;
    controls.elevatorTrimMax = .5;
    controls.elevatorTrimStep = .01;
    controls.gear = {};
    controls.gear.position = 0;
    controls.gear.target = 0;
    controls.flaps = {};
    controls.flaps.position = 0;
    controls.flaps.target = 0;
    controls.flaps.maxPosition = 1;
    controls.airbrakes = {};
    controls.airbrakes.position = 0;
    controls.airbrakes.target = 0;
    controls.optionalAnimatedPart = {};
    controls.optionalAnimatedPart.position = 0;
    controls.optionalAnimatedPart.target = 0;
    controls.states.left = !1;
    controls.states.right = !1;
    controls.states.up = !1;
    controls.states.down = !1;
    controls.states.rudderLeft = !1;
    controls.states.rudderRight = !1;
    controls.states.increaseThrottle = !1;
    controls.states.decreaseThrottle = !1;
    controls.mouse.xValue = 0;
    controls.mouse.yValue = 0;
    controls.initViewportDimensions();
    geofs.aircraft.instance && geofs.aircraft.instance.setup && controls.resetWithAircraftDefinition()
};
controls.setMode = function(a) {
    a = a || geofs.preferences.controlMode || "mouse";
    geofs.isMobile && "orientation" != a && "touch" != a && (a = "orientation");
    controls.mode = a;
    "orientation" == controls.mode ? (controls.orientation.init(),
        controls.orientation.available ? $("body").addClass("geofs-orientation") : (controls.setMode("touch"),
            $("body").removeClass("geofs-orientation")),
        controls.exponential = geofs.preferences.orientation.exponential,
        controls.mixYawRoll = geofs.preferences.orientation.mixYawRoll,
        controls.mixYawRollQuantity = geofs.preferences.orientation.mixYawRollQuantity,
        controls.sensitivity = geofs.preferences.orientation.sensitivity,
        controls.multiplier = {
            pitch: geofs.preferences.orientation.multiplier.pitch ? -1 : 1,
            roll: geofs.preferences.orientation.multiplier.roll ? -1 : 1,
            yaw: 1
        }) : $("body").removeClass("geofs-orientation");
    "touch" == controls.mode ? (controls.exponential = geofs.preferences.touch.exponential,
        controls.mixYawRoll = geofs.preferences.touch.mixYawRoll,
        controls.mixYawRollQuantity = geofs.preferences.touch.mixYawRollQuantity,
        controls.sensitivity = geofs.preferences.touch.sensitivity,
        controls.multiplier = {
            pitch: 1,
            roll: 1,
            yaw: 1
        },
        $("body").addClass("geofs-touch")) : $("body").removeClass("geofs-touch");
    "joystick" == controls.mode && (controls.exponential = geofs.preferences.joystick.exponential,
        controls.mixYawRoll = geofs.preferences.joystick.mixYawRoll,
        controls.mixYawRollQuantity = geofs.preferences.joystick.mixYawRollQuantity,
        controls.sensitivity = geofs.preferences.joystick.sensitivity,
        controls.multiplier = {
            pitch: 1,
            roll: 1,
            yaw: 1,
            throttle: geofs.preferences.joystick.multiplier.throttle ? -1 : 1
        });
    "mouse" == controls.mode && (controls.exponential = geofs.preferences.mouse.exponential,
        controls.mixYawRoll = geofs.preferences.mouse.mixYawRoll,
        controls.mixYawRollQuantity = geofs.preferences.mouse.mixYawRollQuantity,
        controls.sensitivity = geofs.preferences.mouse.sensitivity,
        controls.multiplier = {
            pitch: 1,
            roll: 1,
            yaw: 1
        });
    "keyboard" == controls.mode && (controls.exponential = 0,
        controls.mixYawRoll = geofs.preferences.keyboard.mixYawRoll,
        controls.mixYawRollQuantity = geofs.preferences.keyboard.mixYawRollQuantity,
        controls.sensitivity = geofs.preferences.keyboard.sensitivity,
        controls.multiplier = {
            pitch: 1,
            roll: 1,
            yaw: 1
        });
    geofs.preferences.controlMode = a
};
controls.axisSetters = {
    none: {
        label: "none",
        value: null
    },
    pitch: {
        label: "Pitch",
        process: function(a) {
            return controls.rawPitch = a * geofs.preferences.joystick.sensitivity
        }
    },
    roll: {
        label: "Roll",
        process: function(a) {
            return controls.roll = a * geofs.preferences.joystick.sensitivity
        }
    },
    yaw: {
        label: "Yaw",
        process: function(a) {
            return controls.yaw = a * geofs.preferences.joystick.sensitivity
        }
    },
    throttle: {
        label: "Throttle",
        process: function(a) {
            return controls.throttle = (a + 1) / 2
        }
    },
    brakes: {
        label: "Brakes",
        process: function(a) {
            return controls.brakes = a
        }
    },
    airbrakesPosition: {
        label: "Air Brakes",
        process: function(a) {
            controls.airbrakes.target = (a + 1) / 2;
            controls.setPartAnimationDelta(controls.airbrakes)
        }
    },
    hatView: {
        label: "Hat Button View",
        max: 3,
        process: function(a, b) {
            var c = 0,
                d = 0; -
            1 < a && 0 > a && (c = -40); -
            .4 < a && .7 > a && (d = -40);
            .4 < a && 1.1 > a && (c = 40);
            if (1 == a || -.7 > a)
                d = 40;
            if (c || d)
                camera.rotate(c * b, d * b),
                camera.saveRotation()
        }
    },
    lookAround: {
        label: "Look left/right",
        process: function(a) {
            a != geofs.lookAroundValue && (camera.lookAround(90 * a),
                geofs.lookAroundValue = a)
        }
    },
    lookUpDown: {
        label: "Look up/down",
        process: function(a) {
            a != geofs.lookUpDownValue && (camera.lookAround(null, -90 * a),
                geofs.lookUpDownValue = a)
        }
    }
};
controls.setters = {
    none: {
        label: "none",
        set: function() {},
        unset: function() {}
    },
    setBrakes: {
        label: "Brakes",
        set: function() {
            geofs.aircraft.instance.brakesOn = !0;
            controls.brakes = 1
        },
        unset: function() {
            geofs.aircraft.instance.brakesOn = !1;
            controls.brakes = 0
        }
    },
    toggleParkingBrake: {
        label: "Parking brake",
        set: function() {
            geofs.aircraft.instance.brakesOn ? (geofs.aircraft.instance.brakesOn = !1,
                controls.brakes = 0) : (geofs.aircraft.instance.brakesOn = !0,
                controls.brakes = 1)
        }
    },
    setAirbrakes: {
        label: "Air Brakes",
        set: function() {
            controls.airbrakes.target = 0 == controls.airbrakes.target ? 1 : 0;
            controls.setPartAnimationDelta(controls.airbrakes)
        }
    },
    setOptionalAnimatedPart: {
        label: "Optional Animated Parts",
        set: function() {
            controls.optionalAnimatedPart.target = 0 == controls.optionalAnimatedPart.target ? 1 : 0;
            controls.setPartAnimationDelta(controls.optionalAnimatedPart)
        }
    },
    setFlapsUp: {
        label: "Flaps Up",
        set: function() {
            0 < controls.flaps.target && (controls.flaps.target--,
                geofs.aircraft.instance.setup.flapsPositions && (controls.flaps.positionTarget = geofs.aircraft.instance.setup.flapsPositions[controls.flaps.target]),
                controls.setPartAnimationDelta(controls.flaps))
        }
    },
    setFlapsDown: {
        label: "Flaps down",
        set: function() {
            controls.flaps.target < geofs.aircraft.instance.setup.flapsSteps && (controls.flaps.target++,
                geofs.aircraft.instance.setup.flapsPositions && (controls.flaps.positionTarget = geofs.aircraft.instance.setup.flapsPositions[controls.flaps.target]),
                controls.setPartAnimationDelta(controls.flaps))
        }
    },
    cycleFlaps: {
        label: "Cycle Flaps",
        set: function() {
            controls.flaps.target < geofs.aircraft.instance.setup.flapsSteps ? controls.flaps.target++ : controls.flaps.target = 0;
            geofs.aircraft.instance.setup.flapsPositions && (controls.flaps.positionTarget = geofs.aircraft.instance.setup.flapsPositions[controls.flaps.target]);
            controls.setPartAnimationDelta(controls.flaps)
        }
    },
    setGear: {
        label: "Toggle Gear (up/down)",
        set: function() {
            if (!geofs.aircraft.instance.groundContact || geofs.debug.on)
                controls.gear.target = 0 == controls.gear.target ? 1 : 0,
                controls.setPartAnimationDelta(controls.gear)
        }
    },
    setElevatorTrimUp: {
        label: "Elevator Trim Up",
        set: function() {
            controls.states.elevatorTrimUp = !0
        },
        unset: function() {
            controls.states.elevatorTrimUp = !1
        }
    },
    setElevatorTrimDown: {
        label: "Elevator Trim Down",
        set: function() {
            controls.states.elevatorTrimDown = !0
        },
        unset: function() {
            controls.states.elevatorTrimDown = !1
        }
    },
    setElevatorTrimNeutral: {
        label: "Elevator Trim Neutral",
        set: function() {
            controls.elevatorTrim = 0
        }
    }
};
controls.trimUp = function() {
    controls.elevatorTrim < controls.elevatorTrimMax && (controls.elevatorTrim += controls.elevatorTrimStep)
};
controls.trimDown = function() {
    controls.elevatorTrim > controls.elevatorTrimMin && (controls.elevatorTrim -= controls.elevatorTrimStep)
};
controls.update = function(a) {
    controls.updateKeyboard(a);
    "joystick" == controls.mode && controls.updateJoystick(a);
    if (controls.autopilot.on)
        controls.autopilot.update(a);
    else {
        controls.states.elevatorTrimUp ? controls.trimUp() : controls.states.elevatorTrimDown && controls.trimDown();
        controls.elevatorTrim = clamp(controls.elevatorTrim, controls.elevatorTrimMin, controls.elevatorTrimMax);
        "mouse" != controls.mode && "touch" != controls.mode || controls.keyboard.override || controls.updateMouse(a);
        "orientation" == controls.mode && controls.updateOrientation(a);
        "touch" == controls.mode && controls.updateTouch(a);
        var b = controls.exponential;
        controls.keyboard.override && (b = controls.keyboard.exponential);
        controls.roll *= controls.multiplier.roll;
        controls.rawPitch *= controls.multiplier.pitch;
        controls.yaw *= controls.multiplier.yaw;
        controls.roll *= Math.pow(Math.abs(controls.roll), b);
        controls.rawPitch *= Math.pow(Math.abs(controls.rawPitch), b);
        controls.mixYawRoll ? controls.yaw = controls.roll * controls.mixYawRollQuantity : (controls.keyboard.overrideRudder && (b = geofs.preferences.keyboard.exponential),
            controls.yaw *= Math.pow(Math.abs(controls.yaw), b))
    }
    controls.roll = clamp(controls.roll, -1, 1);
    controls.rawPitch = clamp(controls.rawPitch, -1, 1);
    controls.yaw = clamp(controls.yaw, -1, 1);
    controls.pitch = controls.rawPitch + controls.elevatorTrim;
    b = 0;
    geofs.aircraft.instance.setup.reverse && (b = -1);
    controls.throttle = clamp(controls.throttle, b, 1);
    controls.animatePart("gear", a);
    controls.animatePart("flaps", a);
    controls.animatePart("airbrakes", a);
    controls.animatePart("optionalAnimatedPart", a)
};
controls.setPartAnimationDelta = function(a) {
    a.delta = a.positionTarget ? a.positionTarget - a.position : a.target - a.position
};
controls.animatePart = function(a, b) {
    var c = controls[a];
    var d = c.positionTarget ? c.positionTarget : c.target;
    c.position != d && geofs.aircraft.instance.setup[a + "TravelTime"] && (c.position += c.delta / (geofs.aircraft.instance.setup[a + "TravelTime"] / b),
        0 > c.delta && c.position <= d && (c.position = d,
            c.delta = null),
        0 < c.delta && c.position >= d && (c.position = d,
            c.delta = null))
};
controls.updateMouse = function(a) {
    controls.roll = controls.mouse.xValue * geofs.preferences.mouse.sensitivity;
    controls.rawPitch = controls.mouse.yValue * geofs.preferences.mouse.sensitivity
};
controls.updateKeyboard = function(a) {
    var b = controls.keyboard.rollIncrement * a * geofs.preferences.keyboard.sensitivity;
    controls.states.left ? controls.roll -= b : controls.states.right ? controls.roll += b : geofs.aircraft.instance.controllers.roll.recenter && (controls.roll -= [controls.roll - 0] * controls.keyboard.recenterRatio * geofs.preferences.keyboard.sensitivity);
    b = controls.keyboard.pitchIncrement * a * geofs.preferences.keyboard.sensitivity * geofs.aircraft.instance.controllers.pitch.sensitivity;
    controls.states.up ? controls.rawPitch -= b * geofs.aircraft.instance.controllers.pitch.ratio : controls.states.down ? controls.rawPitch += b * geofs.aircraft.instance.controllers.pitch.ratio : geofs.aircraft.instance.controllers.pitch.recenter && (controls.rawPitch -= [controls.rawPitch - 0] * b);
    b = controls.keyboard.yawIncrement * a * geofs.preferences.keyboard.sensitivity;
    controls.states.rudderLeft ? controls.yaw -= b : controls.states.rudderRight ? controls.yaw += b : geofs.aircraft.instance.controllers.yaw.recenter && (controls.yaw -= [controls.yaw - 0] * controls.keyboard.recenterRatio * geofs.preferences.keyboard.sensitivity);
    a *= controls.keyboard.throttleIncrement;
    controls.states.increaseThrottle ? controls.throttle += a : controls.states.decreaseThrottle && (controls.throttle -= a)
};
controls.recenter = function() {
    controls.mouse.xValue = 0;
    controls.mouse.yValue = 0;
    controls.yaw = 0;
    controls.roll = 0;
    controls.rawPitch = 0
};
controls.keyDown = function(a) {
    switch (a.which) {
        case geofs.preferences.keyboard.keys["Bank left"].keycode:
            controls.states.left = !0;
            a.returnValue = !1;
            controls.keyboard.override = !0;
            break;
        case geofs.preferences.keyboard.keys["Bank right"].keycode:
            controls.states.right = !0;
            a.returnValue = !1;
            controls.keyboard.override = !0;
            break;
        case geofs.preferences.keyboard.keys["Pitch down"].keycode:
            controls.states.up = !0;
            a.returnValue = !1;
            controls.keyboard.override = !0;
            break;
        case geofs.preferences.keyboard.keys["Pitch up"].keycode:
            controls.states.down = !0;
            a.returnValue = !1;
            controls.keyboard.override = !0;
            break;
        case geofs.preferences.keyboard.keys["Steer left"].keycode:
            controls.states.rudderLeft = !0;
            a.returnValue = !1;
            controls.keyboard.overrideRudder = !0;
            break;
        case geofs.preferences.keyboard.keys["Steer right"].keycode:
            controls.states.rudderRight = !0;
            a.returnValue = !1;
            controls.keyboard.overrideRudder = !0;
            break;
        case geofs.preferences.keyboard.keys["Increase throttle"].keycode:
        case geofs.preferences.keyboard.keys.PgUp.keycode:
            controls.states.increaseThrottle = !0;
            a.returnValue = !1;
            break;
        case geofs.preferences.keyboard.keys["Decrease throttle"].keycode:
        case geofs.preferences.keyboard.keys.PgDwn.keycode:
            controls.states.decreaseThrottle = !0;
            a.returnValue = !1;
            break;
        case geofs.preferences.keyboard.keys.Brakes.keycode:
            controls.setters.setBrakes.set();
            break;
        case geofs.preferences.keyboard.keys["Parking brake"].keycode:
            controls.setters.toggleParkingBrake.set();
            break;
        case geofs.preferences.keyboard.keys["Engine switch (on/off)"].keycode:
            geofs.aircraft.instance.engine.on ? geofs.aircraft.instance.stopEngine() : geofs.aircraft.instance.startEngine();
            break;
        case geofs.preferences.keyboard.keys["Gear toggle (up/down)"].keycode:
            controls.setters.setGear.set();
            break;
        case geofs.preferences.keyboard.keys["Lower flaps"].keycode:
            controls.setters.setFlapsDown.set();
            break;
        case geofs.preferences.keyboard.keys["Raise flaps"].keycode:
            controls.setters.setFlapsUp.set();
            break;
        case geofs.preferences.keyboard.keys["Airbrake toggle (on/off)"].keycode:
            controls.setters.setAirbrakes.set();
            break;
        case geofs.preferences.keyboard.keys["Optional Animated Part toggle (on/off)"].keycode:
            controls.setters.setOptionalAnimatedPart.set();
            break;
        case geofs.preferences.keyboard.keys["Elevator trim up"].keycode:
            controls.setters.setElevatorTrimUp.set();
            break;
        case geofs.preferences.keyboard.keys["Elevator trim down"].keycode:
            controls.setters.setElevatorTrimDown.set();
            break;
        case geofs.preferences.keyboard.keys["Elevator trim neutral"].keycode:
            controls.setters.setElevatorTrimNeutral.set();
            break;
        case 13:
            controls.recenter();
            break;
        case 27:
            flight.recorder.playing && (flight.recorder.exitPlayback(),
                a.preventDefault());
            break;
        case 86:
            flight.recorder.enterPlayback();
            break;
        case 65:
            controls.autopilot.toggle();
            break;
        case 83:
            audio.toggleMute();
            break;
        case 80:
            geofs.togglePause();
            break;
        case 67:
            camera.cycle();
            break;
        case 78:
            ui.panel.toggle(".geofs-map-list");
            break;
        case 79:
            ui.panel.toggle(".geofs-preference-list");
            break;
        case 9:
            geofs.flyToCamera();
            break;
        case 72:
            instruments.toggle();
            break;
        case 77:
            controls.setMode("mouse");
            break;
        case 75:
            controls.setMode("keyboard");
            break;
        case 74:
            controls.setMode("joystick");
            break;
        case 81:
            camera.animations.orbitHorizontal.active = !camera.animations.orbitHorizontal.active;
            break;
        case 82:
            geofs.resetFlight();
            break;
        case 101:
            camera.setToNeutral();
            break;
        case 97:
            camera.setRotation(45);
            break;
        case 98:
            camera.setRotation(0);
            break;
        case 99:
            camera.setRotation(-45);
            break;
        case 100:
            camera.setRotation(90);
            break;
        case 102:
            camera.setRotation(-90);
            break;
        case 103:
            camera.setRotation(135);
            break;
        case 104:
            camera.setRotation(180);
            break;
        case 105:
            camera.setRotation(-135)
    }
    48 <= a.keyCode && 57 >= a.keyCode && (controls.throttle = (a.keyCode - 48) / 9)
};
controls.keyUp = function(a) {
    switch (a.which) {
        case geofs.preferences.keyboard.keys["Bank left"].keycode:
            controls.states.left = !1;
            a.returnValue = !1;
            break;
        case geofs.preferences.keyboard.keys["Bank right"].keycode:
            controls.states.right = !1;
            a.returnValue = !1;
            break;
        case geofs.preferences.keyboard.keys["Pitch down"].keycode:
            controls.states.up = !1;
            a.returnValue = !1;
            break;
        case geofs.preferences.keyboard.keys["Pitch up"].keycode:
            controls.states.down = !1;
            a.returnValue = !1;
            break;
        case geofs.preferences.keyboard.keys["Steer left"].keycode:
            controls.states.rudderLeft = !1;
            a.returnValue = !1;
            break;
        case geofs.preferences.keyboard.keys["Steer right"].keycode:
            controls.states.rudderRight = !1;
            a.returnValue = !1;
            break;
        case geofs.preferences.keyboard.keys["Increase throttle"].keycode:
        case geofs.preferences.keyboard.keys.PgUp.keycode:
            controls.states.increaseThrottle = !1;
            a.returnValue = !1;
            break;
        case geofs.preferences.keyboard.keys["Decrease throttle"].keycode:
        case geofs.preferences.keyboard.keys.PgDwn.keycode:
            controls.states.decreaseThrottle = !1;
            a.returnValue = !1;
            break;
        case geofs.preferences.keyboard.keys["Elevator trim up"].keycode:
            controls.setters.setElevatorTrimUp.unset();
            break;
        case geofs.preferences.keyboard.keys["Elevator trim down"].keycode:
            controls.setters.setElevatorTrimDown.unset();
            break;
        case geofs.preferences.keyboard.keys.Brakes.keycode:
            controls.setters.setBrakes.unset();
            break;
        case 84:
            ui.chat.showInput()
    }
};
controls.joystick = {};
controls.joystick.deadZoneUp = .1;
controls.joystick.deadZoneDown = -.1;
controls.joystick.ready = !1;
controls.joystick.sticksNumber = 0;
controls.joystick.poll = function() {
    controls.joystick.sticks = [];
    if (!controls.joystick.api)
        return !1;
    var a = controls.joystick.api.call(navigator);
    if (0 < a.length) {
        for (var b = 0; a[b] && 5 > b;)
            controls.joystick.sticks.push(a[b]),
            b++;
        controls.joystick.sticksNumber != controls.joystick.sticks.length && (controls.joystick.info = "",
            controls.joystick.sticks.forEach(function(a) {
                controls.joystick.info += a.id + "<br/>"
            }),
            controls.joystick.ready = !0,
            controls.joystick.configure(),
            $(controls.joystick).trigger("joystickReady"),
            controls.joystick.sticksNumber = controls.joystick.sticks.length);
        return !0
    }
    return controls.joystick.ready = !1
};
controls.joystick.init = function() {
    controls.joystick.api = ("function" == typeof navigator.getGamepads ? navigator.getGamepads : null) || ("function" == typeof navigator.webkitGetGamepads ? navigator.webkitGetGamepads : null) || null;
    controls.joystick.poll()
};
controls.joystick.configure = function() {
    controls.joystick.oldButtonsValue = 0;
    controls.joystick.buttons = {};
    controls.joystick.axes = {};
    controls.joystick.buttonHandlers = [];
    var a = 0,
        b = 0;
    controls.joystick.sticks.forEach(function(c, d) {
        c.hash = geofs.utils.hashCode(c.id);
        for (var e in c.buttons) {
            var f = c.hash + e;
            if (geofs.preferences.joystick.buttons[f]) {
                var g = controls.setters[geofs.preferences.joystick.buttons[f]].set,
                    h = controls.setters[geofs.preferences.joystick.buttons[f]].unset;
                g && controls.joystick.addButtonListener(f, "buttondown", g);
                h && controls.joystick.addButtonListener(f, "buttonup", h)
            }
            controls.joystick.buttons[f] = {
                stick: d,
                globalId: a,
                id: e
            };
            a++
        }
        for (var k in c.axes)
            f = c.hash + k,
            controls.joystick.axes[f] = {
                stick: d,
                globalId: b,
                id: k,
                enabled: 0 != c.axes[k]
            },
            b++
    })
};
controls.joystick.checkButton = function(a) {
    if (a = controls.joystick.buttons[a])
        return controls.joystick.sticks[a.stick].buttons[a.id].pressed
};
controls.joystick.getAxisValue = function(a, b, c) {
    if (controls.joystick.axes && (a = controls.joystick.axes[a]))
        return clamp(controls.joystick.sticks[a.stick].axes[a.id], b || -1, c || 1)
};

controls.updateJoystick = function(a) {
    if (controls.joystick.poll()) {
        for (var b in controls.joystick.axes) {
            var c = geofs.preferences.joystick.axis[b];
            if ("none" != c && (c = controls.axisSetters[c])) {
                var d = controls.joystick.getAxisValue(b, c.min, c.max);
                geofs.preferences.joystick.multiplier[b] && (d *= -1);
                d < controls.joystick.deadZoneUp && d > controls.joystick.deadZoneDown && (d = 0);
                c.process && c.process(d, a)
            }
        }
        if (controls.joystick.buttons)
            for (b in controls.joystick.buttons)
                if ((a = controls.joystick.buttons[b]) && "none" != geofs.preferences.joystick.buttons[b] && (d = a.oldValue,
                        c = controls.joystick.checkButton(b),
                        c != d)) {
                    if (d = c ? controls.joystick.buttonHandlers.buttondown[b] : controls.joystick.buttonHandlers.buttonup[b])
                        for (var e = 0; e < d.length; e++)
                            d[e]();
                    a.oldValue = c
                }
    }
};
controls.joystick.addButtonListener = function(a, b, c) {
    controls.joystick.buttonHandlers[b] = controls.joystick.buttonHandlers[b] || [];
    controls.joystick.buttonHandlers[b][a] = controls.joystick.buttonHandlers[a] || [];
    controls.joystick.buttonHandlers[b][a].push(c)
};
controls.orientation.init = function() {
    controls.orientation.eventListenerSet || (controls.orientation.centers = null,
        $(".geofs-orientationCalibrate").show(),
        window.DeviceOrientationEvent ? (controls.orientation.available = !0,
            window.addEventListener("deviceorientation", function(a) {
                controls.orientation.values = [a.gamma, a.beta, a.alpha];
                controls.orientation.centers || (controls.orientation.centers = V3.dup(controls.orientation.values),
                    controls.orientation.fixPitch(controls.orientation.centers))
            }),
            controls.orientation.eventListenerSet = !0) : controls.orientation.available = !1)
};
controls.orientation.fixPitch = function(a) {
    a && 90 < Math.abs(a[1]) && (0 > a[0] && (a[0] += 180),
        0 < a[0] && (a[0] -= 180))
};
controls.orientation.recenter = function() {
    controls.orientation.centers = null;
    $(".geofs-orientationCalibrate").hide()
};
controls.orientation.isAvailable = function() {
    return controls.orientation.available && geofs.isMobile
};
controls.orientation.getNormalizedAxis = function(a) {
    if (controls.orientation.values) {
        if (0 == a)
            return controls.orientation.fixPitch(controls.orientation.values),
                a = controls.orientation.values[0] - controls.orientation.centers[0],
                geofs.debug.watch("beta", controls.orientation.values[0]),
                geofs.debug.watch("centeredPitch", a),
                a / -30;
        if (1 == a)
            return a = controls.orientation.values[1],
                90 < a && (a = 180 - a), -90 > a && (a = -180 - a),
                geofs.debug.watch("gamma", controls.orientation.values[1]),
                a / 30
    }
};
controls.orientation.getHtr = function() {
    return [controls.orientation.values[2], controls.orientation.values[1] + 270, controls.orientation.values[0]]
};
controls.updateOrientation = function(a) {
    if (controls.orientation.centers) {
        a = controls.orientation.getNormalizedAxis(geofs.preferences.orientation.axis.pitch);
        var b = controls.orientation.getNormalizedAxis(geofs.preferences.orientation.axis.roll);
        controls.rawPitch = a * controls.orientation.generalMultiplier;
        controls.roll = b * controls.orientation.generalMultiplier;
        controls.yaw = controls.orientation.yaw;
        controls.keyboard.overrideRudder = !1
    }
};
controls.updateTouch = function(a) {
    controls.rawPitch = controls.touch.pitch;
    controls.roll = controls.touch.roll;
    controls.yaw = controls.touch.yaw
};

controls.autopilot = {
        on: !1,
        maxBankAngle: 30,
        maxPitchAngle: 10,
        minPitchAngle: -20,
        commonClimbrate: 500,
        commonDescentrate: -750,
        maxClimbrate: 3E3,
        maxDescentrate: -4E3,
        heading: 0,
        altitude: 0,
        kias: 0,
        climbrate: 0,
        climbPID: new PID(.01, .001, .001),
        pitchPID: new PID(.03, .002, .01),
        rollPID: new PID(.02, 1E-5, 0),
        throttlePID: new PID(.1, 0, 0)
    };
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
                $(".geofs-autopilot-altitude").text(controls.autopilot.altitude),//更新map内的自动驾驶数据
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
    controls.autopilot.initUI = function() {
        var a = $(".geofs-autopilot-pad .control-pad-label"),
            b;
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
    };
controls.autopilot.toggle = function() {
    controls.autopilot.on ? controls.autopilot.turnOff() : controls.autopilot.turnOn()
};
controls.autopilot.turnOn = function() {
    if (geofs.aircraft.instance.setup.autopilot) {
        var a = geofs.animation.values;
        controls.autopilot.climbPID.reset();
        controls.autopilot.pitchPID.reset();
        controls.autopilot.rollPID.reset();
        controls.autopilot.throttlePID.reset();
        controls.autopilot.setAltitude(a.altitude);
        controls.autopilot.setHeading(a.heading);
        controls.autopilot.setKias(a.kias);
        controls.autopilot.setClimbrate(0);
        controls.autopilot.on = !0;
        $(document).trigger("autopilotOn")
    }
};
controls.autopilot.turnOff = function() {
    controls.autopilot.on = !1;
    $(document).trigger("autopilotOff")
};
controls.autopilot.update = function(a) {
    var b = geofs.animation.values,
        c = controls.autopilot,
        d = clamp(b.kias / 100, 1, 5),
        e = fixAngle(b.heading - c.heading);
    e = clamp(e, -c.maxBankAngle, c.maxBankAngle);
    controls.yaw = exponentialSmoothing("apYaw", e / -60, .1);
    c.rollPID.set(e);
    controls.roll = exponentialSmoothing("apRoll", -c.rollPID.compute(b.aroll, a) / d, .9);
    var f = c.altitude - b.altitude;
    e = clamp(d * c.commonClimbrate, 0, c.maxClimbrate);
    var g = clamp(d * c.commonDescentrate, c.maxDescentrate, 0);
    f = clamp(5 * f, g, e);
    c.climbPID.set(-f);
    e = clamp(b.climbrate, g, e);
    e = c.climbPID.compute(-e, a) / d;
    e = clamp(e, -c.maxPitchAngle, -c.minPitchAngle);
    c.pitchPID.set(-e);
    controls.rawPitch = exponentialSmoothing("apPitch", c.pitchPID.compute(-b.atilt, a) / d, .9);
    c.throttlePID.set(c.kias);
    controls.throttle = exponentialSmoothing("apThrottle", c.throttlePID.compute(b.kias, a), .9);
    controls.throttle = clamp(controls.throttle, 0, 1)
};
export default controls;