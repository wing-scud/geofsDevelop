/* eslint-disable */
import geofs from './geofs/geofs';
import instruments from './instruments';
import { V3, M33 } from './geofs/utils'
import api from './geofs/api'
import Object3D from './geofs/Object3D'
const camera = window.camera || {};

camera.animations = {
    orbitHorizontal: {
        rate: 5,
    },
    orbitVertical: {
        rate: 2,
        min: -60,
        max: 60,
    },
    zoom: {
        rate: 2,
        min: -20,
        max: 50,
    },
};
camera.currentMode = 0;
camera.currentModeName = 'follow';
camera.lastCurrentMode = 0;
camera.worldPosition = [0, 0, 0];
camera.openSlave = !1;
camera.motionRange = [0.5, 0.5, 0.5];
camera.FOVIncrement = 0.1;
camera.defaultFOV = 1;
camera.currentFOV = camera.defaultFOV;
camera.minFOV = 0.2;
camera.maxFOV = 2.5;
camera.groundAvoidanceMargin = 1;
camera.groundAvoidanceIgnore = 100;
var GRAVITY = 9.81,
    DEGREES_TO_RAD = Math.PI / 180,
    RAD_TO_DEGREES = 180 / Math.PI,
    KMH_TO_MS = 1 / 3.6,
    METERS_TO_FEET = 3.2808399,
    FEET_TO_METERS = .3048,
    LONGITUDE_TO_HOURS = .0666,
    MERIDIONAL_RADIUS = 6378137,
    EARTH_CIRCUMFERENCE = 2 * MERIDIONAL_RADIUS * Math.PI,
    METERS_TO_LOCAL_LAT = 1 / (EARTH_CIRCUMFERENCE / 360),
    WGS84_TO_EGM96 = -37,
    EGM96_TO_WGS84 = 37,
    PI = Math.PI,
    HALF_PI = PI / 2,
    TWO_PI = 2 * PI,
    MS_TO_KNOTS = 1.94384449,
    KNOTS_TO_MS = .514444444,
    KMH_TO_KNOTS = .539956803,
    AXIS_TO_INDEX = {
        X: 0,
        Y: 1,
        Z: 2
    },
    AXIS_TO_VECTOR = {
        X: [1, 0, 0],
        Y: [0, 1, 0],
        Z: [0, 0, 1]
    },
    KELVIN_OFFSET = 273.15,
    TEMPERATURE_LAPSE_RATE = .0065,
    AIR_DENSITY_SL = 1.22,
    AIR_PRESSURE_SL = 101325,
    AIR_TEMP_SL = 20,
    DRAG_CONSTANT = .07,
    MIN_DRAG_COEF = .02,
    TOTAL_DRAG_CONSTANT = DRAG_CONSTANT + MIN_DRAG_COEF,
    IDEAL_GAS_CONSTANT = 8.31447,
    MOLAR_MASS_DRY_AIR = .0289644,
    GAS_CONSTANT = IDEAL_GAS_CONSTANT / MOLAR_MASS_DRY_AIR,
    GR_LM = GRAVITY * MOLAR_MASS_DRY_AIR / (IDEAL_GAS_CONSTANT * TEMPERATURE_LAPSE_RATE),
    DEFAULT_AIRFOIL_ASPECT_RATIO = 7,
    FOV = 60,
    VIEWPORT_REFERENCE_WIDTH = 1800,
    VIEWPORT_REFERENCE_HEIGHT = 800,
    SMOOTH_BUFFER = {},
    SMOOTHING_FACTOR = .2,
    SIX_STEP_WARNING = "#18a400 #2b9100 #487300 #835b00 #933700 #a71500".split(" ");
camera.init = function() {
    camera.cam = geofs.api.initAndGetCamera();
    camera.lla = [0, 0, 0];
    camera.htr = [0, 0, 0];
    camera.hasMoved = !1;
    $(document).on('click', '[data-cameraanim]', (a) => {
        a = $(a.currentTarget).attr('data-cameraAnim');
        camera.animations[a].active = !camera.animations[a].active;
    }).on('click', '.geofs-stopAllAnim', () => {
        for (const a in camera.animations) { camera.animations[a].active = !1; }
    }).on('click', '.geofs-startAllAnim', () => {
        for (const a in camera.animations) { camera.animations[a].active = !0; }
    });
};
camera.setFOV = function(a) {
    camera.currentFOV = a || camera.currentFOV || camera.defaultFOV;
    camera.currentFOV = clamp(camera.currentFOV, camera.minFOV, camera.maxFOV);
    geofs.api.setFOV(camera.cam, camera.currentFOV);
    geofs.getViewportDimentions();
    camera.currentModeName == 'cockpit' && instruments.updateCockpitPositions();
};
camera.increaseFOV = function(a) {
    let b = geofs.api.getFOV(camera.cam);
    b += a || camera.FOVIncrement;
    b > camera.maxFOV && (b = camera.maxFOV);
    camera.setFOV(b);
};
camera.decreaseFOV = function(a) {
    let b = geofs.api.getFOV(camera.cam);
    b -= a || camera.FOVIncrement;
    b < camera.minFOV && (b = camera.minFOV);
    camera.setFOV(b);
};
camera.reset = function() {
    camera.definitions = {
        follow: {
            orientation: [0, 5, 0],
        },
        cockpit: {},
        cockpitless: {},
        chase: {
            reset: !0,
        },
        free: {
            reset: !0,
        },
    };
    let a = '',
        b;
    for (b in geofs.aircraft.instance.setup.cameras) { camera.definitions[b] || (a += `<li class="mdl-menu__item" data-camera="camera.set(null, '${b}');">${b}</li>`); }
    a.length ? $('.geofs-extra-views').show().find('.geofs-extra-views-holder').html(a) : $('.geofs-extra-views').hide();
    a = $.extend(!0, {}, camera.definitions, geofs.aircraft.instance.setup.cameras);
    let c = 0;
    camera.modes = [];
    for (b in a) {
        var d = a[b];
        d.name = b;
        d.mode = c;
        d.view = d.view || d.name;
        d.position = d.position || [0, 0, 0];
        d.orientations = {};
        d.orientations.neutral = d.orientation || [0, 0, 0];
        d.orientations.current = V3.dup(d.orientations.neutral);
        d.orientations.last = V3.dup(d.orientations.neutral);
        camera.definitions[b] = d;
        camera.modes.push(camera.definitions[b]);
        c++;
    }
    for (b in camera.definitions) {
        d = camera.definitions[b],
            d.orientations.current = V3.dup(d.orientations.neutral),
            d.orientations.last = V3.dup(d.orientations.neutral);
    }
    camera.definitions.follow.lastUsedHtr = V3.dup(geofs.aircraft.instance.htr);
    camera.set(0);
    camera.setToNeutral();
    camera.lla = [0, 0, 0];
    camera.htr = [0, 0, 0];
    camera.zoomDistance = 0;
    camera.update(0);
};
camera.cycle = function() {
    let a = camera.currentMode + 1;
    a >= camera.modes.length && (a = 0);
    camera.set(a);
};
camera.set = function(a, b) {
    camera.currentDefinition = camera.modes[a] || camera.definitions[b] || camera.definitions[0];
    camera.currentMode = camera.currentDefinition.mode;
    camera.currentModeName = camera.currentDefinition.name;
    camera.currentView = camera.currentDefinition.view;
    camera.setFOV(camera.currentDefinition.FOV);
    camera.currentModeName == 'follow' && (a = V3.scale(geofs.aircraft.instance.object3d.getWorldFrame()[1], -camera.definitions.follow.distance),
        a = xyz2lla(a, geofs.aircraft.instance.llaLocation),
        camera.lla = V3.add(geofs.aircraft.instance.llaLocation, a),
        camera.avoidGround(),
        a = lookAt(geofs.aircraft.instance.llaLocation, camera.lla, [0, 0, 1]),
        a = [a[0], -a[1] + 90, 0],
        geofs.api.setCameraPositionAndOrientation(camera.cam, camera.lla, a),
        instruments.updateScreenPositions());
    camera.currentModeName == 'free' || camera.currentModeName == 'chase' ? ($('.geofs-canvas-mouse-overlay').css('pointer-events', 'none'),
        geofs.api.nativeMouseHandling = !0) : ($('.geofs-canvas-mouse-overlay').css('pointer-events', 'auto'),
        geofs.api.nativeMouseHandling = !1);
    geofs.aircraft.instance && (camera.currentModeName == 'cockpitless' ? (geofs.aircraft.instance.setVisibility(!1),
        instruments.updateScreenPositions()) : geofs.aircraft.instance.setVisibility(!0));
    camera.currentModeName == 'cockpit' || camera.currentDefinition.nearClipping ? (geofs.aircraft.instance.setup.cockpitScaleFix && geofs.aircraft.instance.fixCockpitScale(geofs.aircraft.instance.setup.cockpitScaleFix),
        geofs.aircraft.instance.loadCockpit(),
        instruments.updateCockpitPositions(),
        geofs.api.configureInsideView(),
        camera.motionOffset = [0, 0, 0],
        geofs.animation.values.overlaysVisibility = 'hidden') : (geofs.aircraft.instance.fixCockpitScale(1),
        camera.currentDefinition.insideView ? geofs.api.configureInsideView() : geofs.api.configureOutsideView(),
        geofs.animation.values.overlaysVisibility = 'visible');
    geofs.animation.values.view = camera.currentModeName;
    geofs.aircraft.instance.placeParts();
    geofs.aircraft.instance.render();
    instruments.updateScreenPositions();
    instruments.update();
    $(document).trigger('cameraChange');
    camera.hasMoved = !0;
};
camera.translate = function(a) {
    return camera.currentModeName == 'follow' ? (camera.zoomDistance += a,
        camera.zoomDistance < -geofs.aircraft.instance.setup.cameras.follow.distance + 5 && (camera.zoomDistance = -geofs.aircraft.instance.setup.cameras.follow.distance + 5), !0) : !1;
};
camera.lookAround = function(a, b) {
    if (camera.isHandlingMouseRotation()) {
        const c = camera.definitions[camera.currentModeName];
        void 0 != a && (c.orientations.current[0] = a);
        void 0 != b && (c.orientations.current[1] = b);
        camera.saveRotation();
        camera.currentModeName == 'cockpit' && (camera.hasMoved = !0);
        return !0;
    }
    return !1;
};
camera.rotate = function(a, b, c) {
    a = a || 0;
    b = b || 0;
    c = c || 0;
    if (camera.isHandlingMouseRotation()) {
        const d = camera.definitions[camera.currentModeName];
        d.orientations.current[0] = d.orientations.last[0] - a;
        d.orientations.current[1] = d.orientations.last[1] + b;
        d.orientations.current[2] = d.orientations.last[2] + (c || 0);
        camera.currentModeName == 'cockpit' && (camera.hasMoved = !0);
        return !0;
    }
    return !1;
};
camera.isHandlingMouseRotation = function() {
    return camera.currentModeName == 'follow' || camera.currentModeName == 'cockpit' || camera.currentDefinition.rotatable ? !0 : !1;
};
camera.setRotation = function(a, b) {
    const c = camera.definitions[camera.currentModeName];
    return camera.currentModeName == 'follow' ? (c.orientations.current[0] = a,
        c.orientations.current[1] = b || c.orientations.last[1], !0) : camera.currentModeName == 'cockpit' ? (a = fixAngle(a + 180),
        c.orientations.current[0] = a || c.orientations.last[0],
        c.orientations.current[1] = b || c.orientations.last[1],
        camera.hasMoved = !0) : !1;
};
camera.saveRotation = function() {
    if (camera.definitions) {
        const a = camera.definitions[camera.currentModeName];
        a.orientations.last = V3.dup(a.orientations.current);
    }
};

function xyz2lla(a, b) {
    return geofs.api.xyz2lla(a, b)
}
camera.setToNeutral = function() {
    const a = camera.definitions[camera.currentModeName];
    a.orientations.current = V3.dup(a.orientations.neutral);
    a.orientations.last = V3.dup(a.orientations.neutral);
    camera.currentModeName == 'cockpit' && (camera.hasMoved = !0);
};
camera.avoidGround = function() {
    camera.groundAltitude = geofs.aircraft.instance.collResult.location[2];
    const a = camera.lla[2] - camera.groundAltitude;
    geofs.cautiousWithTerrain && Math.abs(a) > camera.groundAvoidanceIgnore || (a <= camera.groundAvoidanceMargin && (camera.lla[2] = camera.groundAltitude + camera.groundAvoidanceMargin),
        camera.hasMoved = !0);
};
camera.getFlytToCoordinates = function() {
    const a = clone(camera.lla);
    a[2] = clamp(a[2], 0, 3E4);
    a[3] = camera.htr[0];
    camera.lla[2] - camera.groundAltitude < camera.groundAvoidanceMargin ? (a[2] = 0,
        a[4] = !1) : a[4] = !0;
    return a;
};

function clamp(a, b, c) {
    return void 0 == b || void 0 == c ? a : a < b ? b : a > c ? c : a
}

camera.update = function(a) {
    let b = geofs.aircraft.instance;
    if (geofs.aircraft.instance.object3d) {
        let c = geofs.aircraft.instance.object3d.getWorldFrame(),
            d = camera.definitions[camera.currentModeName];
        if (geofs.vr && controls.orientation.available) {
            var e = controls.orientation.getHtr();
            camera.rotate(e[0], e[1], e[2]);
        }
        if (camera.animations.zoom.active) {
            e = camera.animations.zoom;
            if (camera.zoomDistance >= e.max || camera.zoomDistance <= e.min || camera.zoomDistance <= -geofs.aircraft.instance.setup.cameras.follow.distance + 5) { e.rate = -e.rate; }
            camera.translate(e.rate * a);
        }
        camera.animations.orbitHorizontal.active && (camera.rotate(camera.animations.orbitHorizontal.rate * a),
            camera.saveRotation());
        if (camera.animations.orbitVertical.active) {
            e = camera.animations.orbitVertical;
            var f = fixAngle(camera.htr[1]);
            if (f <= e.min || f >= e.max) { e.rate = -e.rate; }
            camera.rotate(null, e.rate * a);
            camera.saveRotation();
        }
        if (camera.currentModeName == 'follow') {
            c = V3.add(b.llaLocation, [0, 0, d.lookAtHeight || 0]);
            f = d.orientations.current[0];
            e = d.orientations.current[1];
            let g = 1 - Math.exp(-a / 0.5);
            a = d.lastUsedHtr[0] + fixAngle(b.htr[0] - d.lastUsedHtr[0]) * g;
            g = d.lastUsedHtr[1] + fixAngle(b.htr[1] - d.lastUsedHtr[1]) * g;
            d.lastUsedHtr = [a, g, 0];
            a += f;
            e = g + e;
            a = M33.rotationXYZ(M33.identity(), [e * DEGREES_TO_RAD, 0, a * DEGREES_TO_RAD]);
            d = V3.scale(a[1], -(d.distance + camera.zoomDistance));
            b = xyz2lla(d, b.llaLocation);
            camera.lla = V3.add(c, b);
            camera.avoidGround();
            camera.htr = lookAt(c, camera.lla, [0, 0, 1]);
            camera.htr = [fixAngle360(camera.htr[0]), fixAngle360(-camera.htr[1]), 0];
            geofs.api.setCameraPositionAndOrientation(camera.cam, camera.lla, camera.htr);
        } else {
            camera.currentModeName == 'chase' ? (camera.avoidGround(),
                camera.lla = geofs.api.getCameraLla(camera.cam),
                d = geofs.utils.llaDistanceInMeters(b.llaLocation, camera.lla, camera.lla),
                camera.setFOV(clamp(1 - 0.001 * d, 0.001, 1)),
                controls.mouse.down || (camera.htr = lookAt(b.llaLocation, camera.lla, [0, 0, 1]),
                    camera.htr = [fixAngle360(camera.htr[0]), fixAngle360(-camera.htr[1]), 0],
                    geofs.api.setCameraPositionAndOrientation(camera.cam, camera.lla, camera.htr))) : camera.currentModeName == 'free' ? (camera.avoidGround(),
                camera.lla = geofs.api.getCameraLla(camera.cam),
                camera.htr[0] = geofs.api.getHeading(camera.cam)) : (a = d.orientations.current[0],
                e = d.orientations.current[1],
                a = M33.rotationXYZ(c, [-e * DEGREES_TO_RAD, 0, a * DEGREES_TO_RAD]),
                camera.htr = M33.getOrientation(a),
                camera.worldPosition = V3.dup(d.position),
                camera.currentModeName == 'cockpit' && geofs.preferences.camera.headMotion && (d = V3.scale([-geofs.animation.values.accX, -geofs.animation.values.accY, -geofs.animation.values.accZ], 0.004 * b.setup.motionSensitivity),
                    d = V3.exponentialSmoothing('gsmooth', d, 0.1),
                    camera.motionOffset[0] = d[0] / (camera.motionRange[0] / (camera.motionRange[0] - camera.motionOffset[0])),
                    camera.motionOffset[1] = d[1] / (camera.motionRange[1] / (camera.motionRange[1] - camera.motionOffset[1])),
                    camera.motionOffset[2] = d[2] / (camera.motionRange[2] / (camera.motionRange[2] - camera.motionOffset[2])),
                    camera.motionOffset = V3.clamp(camera.motionOffset, -0.2, 0.2),
                    camera.worldPosition = V3.add(camera.worldPosition, camera.motionOffset),
                    camera.hasMoved = !0),
                camera.worldPosition = b.object3d.setVectorWorldPosition(camera.worldPosition),
                camera.currentModeName == 'cockpit' && (camera.worldPosition = V3.scale(camera.worldPosition, geofs.aircraft.instance.setup.cockpitScaleFix)),
                camera.lla = V3.add(b.llaLocation, xyz2lla(camera.worldPosition, b.llaLocation)),
                camera.htr = [fixAngle360(camera.htr[0]), fixAngle360(-camera.htr[1]), -camera.htr[2]],
                geofs.api.setCameraPositionAndOrientation(camera.cam, camera.lla, camera.htr));
        }
        camera.radianRoll = camera.htr[2] * DEGREES_TO_RAD;
        camera.openSlave && camera.updateSlaveData();
        camera.currentModeName == 'cockpit' && camera.hasMoved && (instruments.updateCockpitPositions(),
            camera.hasMoved = !1);
        camera.update3DOverlayPosition();
    }
};
camera.update3DOverlayPosition = function() {
    if (geofs.aircraft.instance.parts.camera && geofs.aircraft.instance.parts.camera.object3d) {
        let a = V3.toRadians(camera.htr);
        geofs.aircraft.instance.parts.camera.object3d.setInitiallRotation([-a[1], -a[2], a[0]]);
        if (a = geofs.api.getLlaFromScreencoordDepth(instruments.gaugeOverlayPosition[0], instruments.gaugeOverlayPosition[1], instruments.gaugeOverlayPosition[2])) {
            geofs.aircraft.instance.parts.camera.object3d.compute(a),
                geofs.aircraft.instance.parts.camera.object3d.render(a);
        }
    }
};
camera.openSlaveWindow = function(a) {
    const b = `left=${(window.screenX || window.screenLeft) + a * (window.outerWidth || 1024)}`;
    window.open(`slave.html?order=${a}`, (`geofsSlave${a}`).replace('-', 'l'), b) && (camera.openSlave = !0);
};
camera.updateSlaveData = function() {
    camera.transform = M33.setFromEuler([-camera.htr[1] * DEGREES_TO_RAD, -camera.htr[2] * DEGREES_TO_RAD, camera.htr[0] * DEGREES_TO_RAD]);
};

function lookAt(a, b, c) {
    a = lla2xyz(V3.sub(a, b), b);
    c = M33.makeOrthonormalFrame(a, c);
    return M33.getOrientation(c)
}

function ll2xy(a, b) {
    var c = [];
    c[1] = a[0] / METERS_TO_LOCAL_LAT;
    c[0] = a[1] / (1 / (Math.cos((b[0] + a[0]) * DEGREES_TO_RAD) * MERIDIONAL_RADIUS * DEGREES_TO_RAD));
    return c
}

function lla2xyz(a, b) {
    b = ll2xy(a, b);
    b[2] = a[2];
    return b
}

function fixAngle(a) {
    return fixAngle360(a + 180) - 180
}

function fixAngle360(a) {
    a %= 360;
    return 0 <= a ? a : a + 360
}

export default camera;