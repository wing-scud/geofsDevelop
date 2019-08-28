import aircraft from './Aircraft';
import debug from './debug';
import animation from './animation';
import api from './api';
import fx from './fx';
import GlassPanel from './GlassPanel';
import map from './map';
import runwayslights from './runwayslights';
import runways from './runways';
import utils from './utils';
import { M33, V3 } from './utils'
import hackGeoFS from './preferences';
import ui from '../ui/ui'
import controls from '../controls'
import shadowGeofs from './shadow';
import { list } from "./AircraftList"
import objects from '../objects'
import weather from '../weather'
import multiplayer from "../multiplayer"
import audio from "../audio"
import camera from "../camera"
import flight from "../flight"
// import L from '../lib/leaflet'
//var PAGE_PATH = document.location.href.replace(/\/[^\/]+$/, '/');
window.geofs = window.geofs || {};
geofs.includes = {};
geofs.aircraft = aircraft;
geofs.aircraftList = list;
geofs.debug = debug;
geofs.frameCallbackStack = {};
geofs.animation = animation;
geofs.api = api;
geofs.fx = fx;
geofs.GlassPanel = GlassPanel;
geofs.map = map;
geofs.runwaysLights = runwayslights;
geofs.runways = runways;
geofs.utils = utils;
geofs = hackGeoFS(geofs)
geofs = shadowGeofs(geofs)
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


geofs.init = function(a) {
    geofs.PRODUCTION = geofs.PRODUCTION || !1;
    geofs.PRODUCTION || (geofs.killCache = `?kc=${Date.now()}`,
        geofs.debug.init(),
        geofs.debug.turnOn());
    geofs.api.isMobile() && ($('body').addClass('geofs-mobile'),
        geofs.isMobile = !0,
        geofs.api.isIOS() && $('body').addClass('geofs-ios'));
    geofs.api.analytics.init();
    try {
        geofs.world = geofs.api.initWorld('geofs-ui-3dview', a);
    } catch (b) {
        geofs.debug.error(b);
    }

    function getURLParameters() {
        var a = {};
        if (window.location.search) {
            var b = window.location.search.substring(1, window.location.search.length);
            b = b.split("&");
            for (var c = 0; c < b.length; c++) {
                var d = b[c].split("=");
                a[d[0]] = d[1]
            }
        }
        return a
    }
    geofs.debug.afterWorldInit();
    geofs.doPause(1);
    geofs.canvas = $('.geofs-ui-3dview')[0];
    geofs.resizeHandlers = {};
    geofs.resizeHandlersIndex = 0;
    geofs.addResizeHandler(geofs.getViewportDimentions, geofs);
    $(window).resize(geofs.handleResize);
    geofs.getViewportDimentions();
    geofs.initPreferences();
    geofs.readPreferences(() => {
        ui.init();
        controls.init();
        geofs.api.renderingQuality(geofs.preferences.graphics.quality);
        geofs.api.enhanceColors(geofs.preferences.graphics.enhanceColors);
        geofs.api.setWaterEffect(geofs.preferences.graphics.waterEffect);
        let a = getURLParameters();
        a.coordinates = [parseFloat(a.lat) || void 0, parseFloat(a.lon) || void 0, parseFloat(a.alt) || void 0, parseFloat(a.heading) || void 0, !0];
        a.windspeed && a.windheading && (a.weather = {
            windActive: !0,
            customWindActive: !0,
            windDirection: parseInt(a.windheading),
            windSpeed: parseInt(a.windspeed),
        });
        geofs.preferences = $.extend(!0, geofs.preferences, a);
        let c = geofs.preferences.coordinates;
        c && (c[0] < -90 || c[0] > 90 || c[1] < -180 || c[1] > 180 || c[2] > 1E5) && (c = null);
        c && c[0] && c[1] || (geofs.initialRunways = [
                [33.93726741762918, -118.38364975124578, 0, -96.50347129433592],
                [42.36021520436057, -70.98767662157663, 0, -103.54],
                [25.800717256450998, -80.30116643603567, 0, 87.65],
                [43.66555302435758, 7.228367855065596, 0, -135.67487141768297]
            ],
            c = geofs.initialRunways[Math.floor(Math.random() * geofs.initialRunways.length)]);
        geofs.aircraft.instance = new geofs.aircraft.Aircraft(c);
        a = a.aircraft || geofs.preferences.aircraft || 1;
        geofs.doPause(1);
        geofs.probeTerrain();
        geofs.aircraft.instance.load(a, c);
        camera.init();
        objects.init();
        weather.init();
        multiplayer.init();
        geofs.fx.init();
        weather.refresh(c);
        geofs.initLoggedInUser();
        setInterval(() => {
            typeof CollectGarbage === 'function' && CollectGarbage();
        }, 5E3);
    });
    geofs.lastTime = geofs.utils.now();
    $(window).on("unload", geofs.unload)
        // $(window).unload(geofs.unload);
    geofs.api.addFrameCallback(geofs.frameCallback)
};
geofs.unload = function() {
    geofs.api.destroyWorld();
    geofs.savePreferences();
    if (geofs.PRODUCTION) {
        try {
            multiplayer.avgPing && geofs.api.analytics.event('system', 'networkLatency', `${50 * Math.ceil(multiplayer.avgPing / 50)}`, Math.floor(multiplayer.avgPing)),
                geofs.api.analytics.event('system', 'framerate', `${5 * Math.ceil(geofs.debug.fps / 5)}`, 1 * geofs.debug.fps);
        } catch (a) {
            geofs.debug.error(a, 'geofs.unload');
        }
    }
};
geofs.initLoggedInUser = function() {
    geofs.userRecord.muteList = geofs.utils.pivotArray(geofs.userRecord.mutelist);
    let a = 0;
    setInterval(() => {
        if (!geofs.pause) {
            const b = {
                action: 'keeptime',
            };
            a == controls.rawPitch || controls.autopilot.on || (b.activeFlying = !0);

            // $('.geofs-apiResponse').on('load', `${geofs.url}/backend/accounts/api.php`, b);
         //  $('.geofs-apiResponse').htmlView('load', `${geofs.url}/backend/accounts/api.php`, b);
        }
        a = controls.rawPitch;
    }, 6E4);
};
geofs.terrainProbbingDone = function() {
    geofs.cautiousWithTerrain && (geofs.cautiousWithTerrain = !1,
        $(geofs.canvas).trigger('terrainStable'));
};
geofs.terrainProbingDuration = 6E3;
geofs.probeTerrain = function() {
    geofs.cautiousWithTerrain || $(geofs.canvas).trigger('terrainUnstable');
    geofs.cautiousWithTerrain = !0;
    clearTimeout(geofs.probbingTimeout);
    geofs.probbingTimeout = setTimeout(() => {
        geofs.terrainProbbingDone();
    }, geofs.terrainProbingDuration);
};
geofs.togglePause = function() {
    geofs.pause ? geofs.undoPause(2) : geofs.doPause(2);
};
geofs.isPaused = function() {
    if (geofs.absolutePause || geofs.pause) { return !0; }
};
geofs.doPause = function(a, b) {
    a = a || 0;
    geofs.pauses = geofs.pauses || {};
    a < geofs.pauseLevel || (b || multiplayer.stopUpdates(),
         audio.stop(),
        flight.recorder.stopRecording(),
        flight.recorder.pausePlayback(),
        ui.toggleButton('.geofs-button-pause', !0),
        geofs.pause = !0,
        geofs.pauseLevel = a);
};
geofs.undoPause = function(a) {
    (a || 0) < geofs.pauseLevel || (geofs.lastTime = null,
        geofs.cautiousWithTerrain ? ($(geofs.canvas).one('terrainStable', multiplayer.startUpdates),
            $(geofs.canvas).one('terrainStable', flight.recorder.startRecording)) : (multiplayer.startUpdates(),
            flight.recorder.startRecording()),
        geofs.pause = !1,
        ui.toggleButton('.geofs-button-pause', !1),
        geofs.pauseLevel = 0,
        flight.recorder.unpausePlayback());
};
geofs.frameCallback = function(a) {
    if (geofs.lastTime) {
        let b = a - geofs.lastTime;
        geofs.lastTime = a;
        b <= 0 && (b = 1);
        b > 1E3 && (b = 1E3);
        a = b / 1E3;
        flight.terrainElevationManagement();
        geofs.pause ? camera.update(a) : (controls.update(a),
            flight.tick(a, b),
            multiplayer.update(b),
            geofs.debug.update(b),
            camera.update(a),
            instruments.update(),
            audio.update(),
            geofs.fx.update(b));
        weather.update(a);
    } else { geofs.lastTime = a; }
};
geofs.flyTo = function(a, b) {
    if (a) {
        geofs.doPause(1);
        const c = geofs.aircraft.instance;
        a[0] = a[0] || geofs.initialRunways[0][0];
        a[1] = a[1] || geofs.initialRunways[0][1];
        a[2] = a[2] || 0;
        a[3] = a[3] || 0;
        c.absoluteStartAltitude = a[4] ? !0 : !1;
        c.startAltitude = a[2];
        geofs.lastFlightCoordinates = a;
        let d = a[0],
            e = a[1],
            f = a[2],
            g = [0, 0, 0];
        g[0] = a[3];
        a = f == 0;
        c.llaLocation = [d, e, f];
        b ? camera.set(camera.currentMode) : (geofs.probeTerrain(),
            camera.reset(),
            controls.reset(),
            weather.refresh());
        c.reset(a);
        objects.updateVisibility();
        objects.updateCollidables();
        geofs.runways.refresh();
        geofs.runwaysLights.updateAll();
        b = geofs.getGroundAltitude(d, e).location[2];
        geofs.groundElevation = b;
        a ? (f = geofs.groundElevation + c.setup.startAltitude,
            c.absoluteStartAltitude = !1) : c.absoluteStartAltitude || (f += geofs.groundElevation);
        c.llaLocation[2] = f;
        c.elevationAtPreviousLocation = b;
        c.previousLlaLocation = c.llaLocation;
        a ? (g[1] = c.setup.startTilt || 0,
            c.startOnGround = !0,
            c.place(c.llaLocation, g)) : (c.startOnGround = !1,
            c.place(c.llaLocation, g),
            c.object3d.compute(c.llaLocation),
            f = c.setup.minimumSpeed / 1.94 * c.setup.mass,
            c.rigidBody.applyCentralImpulse(V3.scale(c.object3d.getWorldFrame()[1], f)));
        geofs.undoPause(1);
        camera.update(0);
        flight.recorder.clear();
        $(document).trigger('flyto');
    }
};
geofs.flyToCamera = function() {
    geofs.flyTo(camera.getFlytToCoordinates());
};
geofs.resetFlight = function() {
    geofs.lastFlightCoordinates && geofs.flyTo(geofs.lastFlightCoordinates, !0);
};
geofs.selectDropdown = function(a, b) {
    for (let c = 0; c < a.options.length; c++) {
        if (a.options[c].value == b) {
            a.selectedIndex = c;
            break;
        }
    }
};

function lla2xyz(a, b) {
    b = ll2xy(a, b);
    b[2] = a[2];
    return b
}
geofs.fromHeadingPitchRoll = (a, b, c, d) => {
    d = Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_X, -b);
    c = Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Y, -c);
    d = Cesium.Quaternion.multiply(d, c, c);
    a = Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Z, -a);
    return Cesium.Quaternion.multiply(a, d, d);
};
geofs.headingPitchRollScaleToFixedFrame = (a, b, c, d, e) => {
    const f = new Cesium.Quaternion();
    e = new Cesium.Cartesian3(e[0], e[1], e[2]);
    const g = new Cesium.Matrix4();
    b = geofs.fromHeadingPitchRoll(b, c, d, f);
    b = Cesium.Matrix4.fromTranslationQuaternionRotationScale(Cesium.Cartesian3.ZERO, b, e, g);
    a = Cesium.Transforms.eastNorthUpToFixedFrame(a);
    return Cesium.Matrix4.multiply(a, b, a);
};
geofs.getLink = function() {
    let a = geofs.aircraft.instance.llaLocation[2];
    geofs.aircraft.instance.groundContact && (a = 0);
    let b = new URL(window.location.href);
    b = `${b.origin + b.pathname}?`;
    b += `aircraft=${geofs.aircraft.instance.id}`;
    b += `&lon=${geofs.aircraft.instance.llaLocation[1]}`;
    b += `&lat=${geofs.aircraft.instance.llaLocation[0]}`;
    b = `${b}&alt=${a}` + `&heading=${geofs.aircraft.instance.htr[0]}`;
    geofs.preferences.weather.windActive && geofs.preferences.weather.customWindActive && (b += `&windspeed=${geofs.preferences.weather.windSpeed}`,
        b += `&windheading=${geofs.preferences.weather.windDirection}`);
    a = `Use this link to start the simulator at the current location:<textarea>${b}</textarea>`;
    $('.geofs-linkOutput').html(a);
};
geofs.isArray = function(a) {
    return a.constructor === Array;
};
geofs.loadModel = function(a, b) {
    b = b || {};
    b.url = a + geofs.killCache;
    return geofs.api.loadModel(b);
};
geofs.setModelLocation = function(a, b) {
    geofs.api.setModelPositionOrientationAndScale(a, b);
};
geofs.getGroundAltitude = function(a, b, c) {
    const d = objects.getAltitudeAtLocation(a, b);
    if (d) {
        return d.isObject = !0,
            d;
    }
    c = geofs.api.getGroundAltitude([a, b, 0], c);
    return {
        location: [a, b, c],
    };
};
geofs.getCollisionResult = function(a, b, c, d) {
    b && c ? (console.log(c + " c"), b = geofs.getAltitudeAtPointFromCollisionResult(c, [b[0], b[1], 0]),

        a = {
            location: [a[0], a[1], b],
            normal: V3.dup(c.normal),
        }) : a = geofs.getGroundAltitude(a[0], a[1], d);
    return a;
};
geofs.getAltitudeAtPointFromCollisionResult = function(a, b) {
    console.log(a.location + "           " + a.normal + "  a" + b + '  b')
    return a.location[2] + -a.normal[0] / a.normal[2] * b[0] + -a.normal[1] / a.normal[2] * b[1];
};
geofs.getNormalFromCollision = function(a, b) {
    return a.normal ? a.normal : geofs.api.getGroundNormal(a.location, b);
};
geofs.coord2tile = function(a, b, c) {
    return {
        x: Math.floor((b + 180) / 360 * Math.pow(2, c)),
        y: Math.floor((1 - Math.log(Math.tan(a * Math.PI / 180) + 1 / Math.cos(a * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, c)),
    };
};
geofs.tile2coord = function(a, b, c) {
    b = Math.PI - 2 * Math.PI * b / Math.pow(2, c);
    return {
        lat: 180 / Math.PI * Math.atan(0.5 * (Math.exp(b) - Math.exp(-b))),
        lon: a / Math.pow(2, c) * 360 - 180,
    };
};
geofs.getLatLonMatrixcoord = function(a, b, c) {
    return `${parseInt(a / c)}/${parseInt(b / c)}`;
};
geofs.handleResize = function() {
    clearTimeout(geofs.resizingTimeout);
    geofs.resizingTimeout = setTimeout(() => {
        for (const a in geofs.resizeHandlers) {
            try {
                geofs.resizeHandlers[a]();
            } catch (b) {
                geofs.debug.error(b, 'geofs.handleResize');
            }
        }
    }, 300);
};
geofs.addResizeHandler = function(a, b) {
    if (!b || !b.resizeHandlerId) {
        return geofs.resizeHandlers[geofs.resizeHandlersIndex] = a,
            a = geofs.resizeHandlersIndex++,
            b && (b.resizeHandlerId = a),
            a;
    }
};
geofs.removeResizeHandler = function(a) {
    delete geofs.resizeHandlers[a];
};
geofs.getViewportDimentions = function() {
    geofs.viewportWidth = geofs.canvas.offsetWidth;
    geofs.viewportHeight = geofs.canvas.offsetHeight;
    camera.cam && (geofs.fovScale = Math.pow(geofs.viewportWidth / VIEWPORT_REFERENCE_WIDTH, 0.5),
        geofs.fovScale /= Math.pow(geofs.api.getFOV(camera.cam), 0.6));
};
window.addEventListener('deferredload', () => {
    $(document).on('loginChange', () => {
        geofs.api.setHD(geofs.preferences.graphics.HD);
    });
    $(document).on('preferenceRead', () => {
        geofs.api.setHD(geofs.preferences.graphics.HD);
    });
    geofs.init();
});


// L.Polyline.plotter = L.Polyline.extend({
//     _lineMarkers: [],
//     _editIcon: L.divIcon({
//         className: 'leaflet-div-icon leaflet-editing-icon',
//     }),
//     _halfwayPointMarkers: [],
//     _existingLatLngs: [],
//     options: {
//         weight: 2,
//         color: '#000',
//         readOnly: !1,
//     },
//     initialize(a, b) {
//         this._lineMarkers = [];
//         this._halfwayPointMarkers = [];
//         this._setExistingLatLngs(a);
//         L.Polyline.prototype.initialize.call(this, [], b);
//     },
//     onAdd(a) {
//         L.Polyline.prototype.onAdd.call(this, a);
//         this._map = a;
//         this._plotExisting();
//         this.options.readOnly || this._bindMapClick();
//     },
//     onRemove(a) {
//         this._halfwayPointMarkers.forEach((a) => {
//             a.remove()
//         });
//         this._lineMarkers.forEach((a) => {
//             a.remove()
//         });
//         this._halfwayPointMarkers = this._lineMarkers = [];
//         this._unbindMapClick();
//         L.Polyline.prototype.onRemove.call(this, a);
//     },
//     setLatLngs(a) {
//         L.Polyline.prototype.setLatLngs.call(this, a);
//     },
//     setReadOnly(a) {
//         if (a && !this.options.readOnly) {
//             var b = '_unbindMarkerEvents',
//                 c = '_unbindHalfwayMarker';
//             this._unbindMapClick();
//         } else {
//             !a && this.options.readOnly && (c = b = '_bindMarkerEvents',
//                 this._bindMapClick());
//         }
//         if (typeof b !== 'undefined') {
//             this.options.readOnly = a;
//             for (index in this._halfwayPointMarkers) { this[c](this._halfwayPointMarkers[index]); }
//             for (index in this._lineMarkers) { this[b](this._lineMarkers[index]) };
//         }
//     },
//     _bindMapClick() {
//         this._map.on('click', this._onMapClick, this);
//     },
//     _unbindMapClick() {
//         this._map.off('click', this._onMapClick, this);
//     },
//     _setExistingLatLngs(a) {
//         this._existingLatLngs = a;
//     },
//     _replot() {
//         this._redraw();
//         this._redrawHalfwayPoints();
//     },
//     _getNewMarker(a, b) {
//         return new L.marker(a, b);
//     },
//     _unbindMarkerEvents(a) {
//         a.off('click', this._removePoint, this);
//         a.off('drag', this._replot, this);
//         a.dragging.disable();
//     },
//     _bindMarkerEvents(a) {
//         let b = this;
//         a.on('mousedown', () => {
//             b._screwedUpLeafletEventsBubblingCancellation = !0
//         }, this);
//         a.on('click', this._removePoint, this);
//         a.on('drag', this._replot, this);
//         a.dragging.enable();
//     },
//     _bindHalfwayMarker(a) {
//         a.on('click', this._addHalfwayPoint, this);
//     },
//     _unbindHalfwayMarker(a) {
//         a.off('click', this._addHalfwayPoint, this);
//     },
//     _addToMapAndBindMarker(a) {
//         a.addTo(this._map);
//         this.options.readOnly || this._bindMarkerEvents(a);
//     },
//     _removePoint(a) {
//         this._map.removeLayer(this._lineMarkers[this._lineMarkers.indexOf(a.target)]);
//         this._lineMarkers.splice(this._lineMarkers.indexOf(a.target), 1);
//         this._replot();
//     },
//     _onMapClick(a) {
//         this._screwedUpLeafletEventsBubblingCancellation ? this._screwedUpLeafletEventsBubblingCancellation = !1 : (this._addNewMarker(a),
//             this._replot());
//     },
//     _addNewMarker(a) {
//         a = this._getNewMarker(a.latlng, {
//             icon: this._editIcon,
//         });
//         this._addToMapAndBindMarker(a);
//         this._lineMarkers.push(a);
//     },
//     _redrawHalfwayPoints() {
//         for (index in this._halfwayPointMarkers) { this._map.removeLayer(this._halfwayPointMarkers[index]); }
//         this._halfwayPointMarkers = [];
//         for (index in this._lineMarkers) {
//             index = parseInt(index);
//             if (typeof this._lineMarkers[index + 1] === 'undefined') { break; }
//             let a = (new L.Marker([(this._lineMarkers[index].getLatLng().lat + this._lineMarkers[index + 1].getLatLng().lat) / 2, (this._lineMarkers[index].getLatLng().lng + this._lineMarkers[index + 1].getLatLng().lng) / 2], {
//                 icon: this._editIcon,
//                 opacity: 0.5,
//             })).addTo(this._map);
//             a.index = index;
//             this.options.readOnly || this._bindHalfwayMarker(a);
//             this._halfwayPointMarkers.push(a);
//         }
//     },
//     _addHalfwayPoint(a) {
//         let b = this._getNewMarker(a.latlng, {
//             icon: this._editIcon,
//         });
//         this._addToMapAndBindMarker(b);
//         this._lineMarkers.splice(a.target.index + 1, 0, b);
//         this._replot();
//     },
//     _plotExisting() {
//         for (index in this._existingLatLngs) {
//             this._addNewMarker({
//                 latlng: new L.LatLng(this._existingLatLngs[index][0], this._existingLatLngs[index][1])
//             });
//         }
//         this._replot();
//     },
//     _redraw() {
//         this.setLatLngs([]);
//         this.redraw();
//         for (index in this._lineMarkers) { this.addLatLng(this._lineMarkers[index].getLatLng()); }
//         this.redraw();
//     },
// });
// L.Polyline.Plotter = function(a, b) {
//     return new L.Polyline.plotter(a, b);
// };

Math.sign = function(a) {
    return a < 0 ? -1 : 1;
};
Math.arrayToPrecision = function(a, b) {
    for (let c = a.length; c >= 0; c--) { a[c] && a[c].toFixed && (a[c] = parseFloat(a[c].toFixed(b))); }
    return a;
};
// /geofs utils
// OverLay
geofs.ajax = {};
geofs.ajax.post = function(a, b, c, d) {
    b = JSON.stringify(b);
    return $.ajax({
        type: 'POST',
        url: a,
        crossDomain: !0,
        data: b,
        dataType: 'json',
        success: c,
        error(a, b, c) {
            try {
                d(a, b, c);
            } catch (h) {}
            geofs.debug.error(c, `geofs.ajax.post. POST failed${  b  } - ${  c}`);
        },
    });
};
ui.Text = function(a, b) {
    b = $.extend({}, this.defaultOptions, b);
    b.text = `${a}`;
    this._overlay = new geofs.api.cssTransform(b);
};
ui.Text.prototype = {
    defaultOptions: {
        rescale: !1,
        anchor: {
            x: 0,
            y: 0,
        },
    },
    show() {
        this._overlay.setVisibility(!0);
    },
    hide() {
        this._overlay.setVisibility(!1);
    },
    setText(a) {
        this._overlay.setText(a);
    },
    destroy() {
        this._overlay.destroy();
    },
};
ui.clearPlayerList = function() {
    $('.geofs-player-list').html('');
};
ui.initPlayerList = function() {};


ui.notification = {};
ui.notification.show = function(a) {
    geofs.api.notify(a);
};
ui.vr = function(a) {
    a ? ($('body').addClass('geofs-vr'),
        camera.set(1, 'cockpit')) : $(body).removeClass('geofs-vr');
    instruments.toggle();
    geofs.api.vr(a);
    geofs.vr = a;
};
'use strict';

geofs.fx.lastRunwayTestLocation = [0, 0];
geofs.runways.nearRunways = {};
geofs.fx.litRunways = {};
geofs.fx.particleBillboardOptions = {
    sizeInMeters: !0,
};
geofs.fx.thresholdLightTemplate = [
    [
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 'length'
    ],
    [
        [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1], 12
    ],
    [
        [3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3], 1
    ],
    [
        [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0], 5
    ],
    [
        [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0], 1
    ],
    [
        [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0], 5
    ],
    [
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1], 1
    ],
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 5
    ]
];
geofs.fx.templateCenter = [17, 2];
$('body').on('runwayUpdate', () => {
    geofs.runwaysLights.updateAll();
});
$('body').on('nightChange', () => {
    geofs.runwaysLights.updateAll();
});
((() => {
    api.initWorld = a => {
        Cesium.Ion.defaultAccessToken = geofs.ionkey;
        const b = {
            animation: !1,
            geocoder: !1,
            homeButton: !1,
            infoBox: !1,
            selectionIndicator: !1,
            sceneModePicker: !1,
            baseLayerPicker: !1,
            timeline: !1,
            imageryProvider: Cesium.createTileMapServiceImageryProvider({
                url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'),
            }),
            navigationHelpButton: !1,
            navigationInstructionsInitiallyVisible: !1,
            fullscreenButton: !1,
            scene3DOnly: !0,
            clock: new Cesium.Clock({
                currentTime: new Cesium.JulianDate(api.march2019theTwentyFirst, 43200),
            }),
            showRenderLoopErrors: geofs.debug.on,
            useDefaultRenderLoop: !0,
        };
        geofs.androidViewerOptions = geofs.androidViewerOptions || {};
        geofs.iosViewerOptions = geofs.iosViewerOptions || {};
        Object.assign(b, geofs.androidViewerOptions, geofs.iosViewerOptions);
        try {
            api.viewer = new Cesium.Viewer(a, b),
                b.useDefaultRenderLoop || (geofs.renderLoop = () => {
                        geofs.pause || api.viewer.render();
                        requestAnimationFrame(geofs.renderLoop);
                    },
                    geofs.renderLoop());

            window.camera = api.viewer.camera
        } catch (c) {
            $.haring.create('GeoFS, Free Online Flight Simulator, requires WebGL in order to run. Please visit the <a href="/pages/instructions.php">instructions page</a> for more details', 'OK');
            console.log(c);
            return;
        }
        api.blackMarble = api.viewer.imageryLayers.addImageryProvider(Cesium.createTileMapServiceImageryProvider({
            url: `${geofs.dataServer}/bm`,
            credit: 'Black Marble imagery courtesy NASA Earth Observatory',
            maximumLevel: 8,
            flipXY: !0,
        }));
        api.blackMarble.alpha = 0;
        api.blackMarble.hue = 3.5;
        api.blackMarble.saturation = 0.7;
        api.blackMarble.brightness = 4;
        api.blackMarble.show = !1;
        api.viewer.scene.highDynamicRange = !1;
        api.viewer.scene.skyBox = new Cesium.SkyBox({
            sources: {
                positiveX: 'images/skybox/tycho2t3_80_px.png',
                negativeX: 'images/skybox/tycho2t3_80_mx.png',
                positiveY: 'images/skybox/tycho2t3_80_py.png',
                negativeY: 'images/skybox/tycho2t3_80_my.png',
                positiveZ: 'images/skybox/tycho2t3_80_pz.png',
                negativeZ: 'images/skybox/tycho2t3_80_mz.png',
            },
        });
        api.viewer.scene.moon.textureUrl = 'images/moonSmall.jpg';
        api.flatRunwayTerrainProviderInstance = new api.FlatRunwayTerrainProvider({
            baseProvider: new Cesium.EllipsoidTerrainProvider(),
        });
        api.viewer.terrainProvider = api.flatRunwayTerrainProviderInstance;
        api.viewer.scene.globe.enableLighting = !1;
        api.viewer.scene.globe.oceanNormalMapUrl = 'shaders/oceanmap.jpg';
        api.viewer.scene.logarithmicDepthBuffer = !1;
        api.viewer.scene.farToNearRatio = 100;
        api.viewer.scene.globe.depthTestAgainstTerrain = !1;
        $('.geofs-ui-3dview').on('terrainStable', () => {
            api.viewer.scene.globe.depthTestAgainstTerrain = !0;
        });
        $('.geofs-ui-3dview').on('terrainUnstable', () => {
            api.viewer.scene.globe.depthTestAgainstTerrain = !1;
        });
        api.labels = api.viewer.scene.primitives.add(new Cesium.LabelCollection());
        api.billboards = {
            default: api.viewer.scene.primitives.add(new Cesium.BillboardCollection({
                scene: api.viewer.scene,
                blendOption: Cesium.BlendOption.OPAQUE_AND_TRANSLUCENT,
            })),
            opaque: api.viewer.scene.primitives.add(new Cesium.BillboardCollection({
                scene: api.viewer.scene,
                blendOption: Cesium.BlendOption.OPAQUE,
            })),
            translucent: api.viewer.scene.primitives.add(new Cesium.BillboardCollection({
                scene: api.viewer.scene,
                blendOption: Cesium.BlendOption.TRANSLUCENT,
            })),
        };
        api.models = api.viewer.scene.primitives.add(new Cesium.PrimitiveCollection({
            destroyPrimitives: !1,
        }));
        api.viewer.scene.preRender.addEventListener(api.frameCallbackWrapper);
        $('.geofs-ui-3dview').trigger('rendererInitDone');
    };
    api.destroyWorld = () => {
        api.viewer.scene.preRender.removeEventListener(api.frameCallbackWrapper);
    };
    api.addFrameCallback = (a, b, c) => {
        b = b || 'global';
        geofs.frameCallbackStack[b] || (geofs.frameCallbackStack[b] = {
            callbacks: {},
            lastId: 0,
            maxExecutionTime: c,
            lastIndex: 1,
        });
        geofs.frameCallbackStack[b].lastId++;
        geofs.frameCallbackStack[b].callbacks[geofs.frameCallbackStack[b].lastId] = a;
        return geofs.frameCallbackStack[b].lastId;
    };
    api.removeFrameCallback = (a, b) => {
        b = b || 'global';
        geofs.frameCallbackStack[b] && delete geofs.frameCallbackStack[b].callbacks[a];
    };
    api.frameCallbackWrapper = (a, b) => {
        a = geofs.utils.now();
        for (const c in geofs.frameCallbackStack) {
            if (b = geofs.frameCallbackStack[c],
                b.maxExecutionTime > 0) {
                var d = b.lastIndex;
                do {
                    try {
                        b.callbacks[d](a);
                    } catch (e) {
                        geofs.debug.throw(e);
                    }
                    d++;
                    d > b.lastId && (d = 1);
                } while (a + b.maxExecutionTime > geofs.utils.now());
                b.lastIndex = d;
            } else {
                for (d in b.callbacks) {
                    try {
                        b.callbacks[d](a);
                    } catch (e) {
                        geofs.debug.throw(e);
                    }
                }
            }
        }
    };
    api.configureOutsideView = () => {
        api.viewer.shadowMap.maximumDistance = geofs.aircraft.instance.setup.oustsideShadowMapMaxDistance || 1E3;
        api.viewer.shadowMap.darkness = 0.3;
        api.camera.frustum.near = 1;
    };
    api.configureInsideView = () => {
        api.viewer.shadowMap.maximumDistance = geofs.aircraft.instance.setup.cockpitShadowMapMaxDistance || 100;
        api.viewer.shadowMap.darkness = 0.5;
        api.camera.frustum.near = 0.2;
    };
    api.setGlobeLighting = a => {
        api.viewer.scene.globe.enableLighting = a;
    };
    api.setWaterEffect = a => {
        api.viewer.scene.globe.showWaterEffect = a;
    };



    function fixAngle360(a) {
        a %= 360;
        return a >= 0 ? a : a + 360;
    }
    api.setHD = a => {
        if (api.hdOn !== a) {
            a = {
                method: 'doGeoIp',
                nohd: a ? 'false' : 'true',
            };
            if (geofs.isApp) {
                if (!geofs.userRecord.sessionId) { return; }
                a.sessionId = geofs.userRecord.sessionId;
            }
            // $('.geofs-apiResponse').on('load', `${geofs.url}/backend/accounts/hd.php`, a);
          //  $('.geofs-apiResponse').htmlView('load', `${geofs.url}/backend/accounts/hd.php`, a);
        }
    };
    api.setImageryProvider = (a, b, c, d, e) => {
        let f = api.viewer.imageryLayers,
            g = f.get(0);
        f.remove(g);
        console.log(b + '   b')
        a = f.addImageryProvider(a, 0);
        geofs.runways.setRunwayModelVisibility(b);
        api.setImageryColorModifier('multiplier', {
            brightness: c || 1,
            contrast: d || 1,
            saturation: e || 1,
        });
        geofs.preferences && geofs.preferences.graphics && api.enhanceColors(geofs.preferences.graphics.enhanceColors);
        return a;
    };
    api.setTimeAndDate = (a, b) => {
        api.viewer.clock.shouldAnimate = !1;
        return api.viewer.clock.currentTime = new Cesium.JulianDate(api.march2019theTwentyFirst + (b || 0), a - api.halfADayInSeconds);
    };
    api.setClock = a => {
        api.viewer.clock.multiplier = 1;
        api.viewer.clock.currentTime = Cesium.JulianDate.fromDate(a);
        api.viewer.clock.shouldAnimate = !0;
    };
    api.vr = a => {
        api.viewer.scene.useWebVR = a;
    };
    api.enhanceColors = a => {
        a = a || 0;
        api.setImageryColorModifier('enhancement', {
            contrast: 1 + 0.4 * a,
            saturation: 1 + 0.4 * a,
        });
        api.setAtmosphereColorModifier('enhancement', {
            brightnessShift: 0.5,
            saturationShift: -0.2,
            groundBrightnessShift: 0.7,
            fogBrightness: 0.9,
            groundSaturationShift: -1,
        });
    };
    api.defaultImageryColorModifier = {
        brightness: 1,
        contrast: 1,
        saturation: 1,
        gamma: 1,
        hue: 0,
    };
    api.imageryColorModifiers = {};
    api.setImageryColorModifier = (a, b) => {
        b = $.extend({}, api.defaultImageryColorModifier, b);
        api.imageryColorModifiers[a || 'base'] = b;
        api.applyImageryColorModifiers();
    };
    api.removeImageryColorModifier = a => {
        delete api.imageryColorModifiers[a];
        api.applyImageryColorModifiers();
    };
    api.applyImageryColorModifiers = () => {
        api.imageryColors = $.extend({}, api.defaultImageryColorModifier);
        for (const a in api.imageryColorModifiers) {
            api.imageryColors.brightness *= api.imageryColorModifiers[a].brightness,
                api.imageryColors.contrast *= api.imageryColorModifiers[a].contrast,
                api.imageryColors.saturation *= api.imageryColorModifiers[a].saturation,
                api.imageryColors.gamma *= api.imageryColorModifiers[a].gamma,
                api.imageryColors.hue += api.imageryColorModifiers[a].hue;
        }
        api.setImageryBrightness(api.imageryColors.brightness);
        api.setImageryContrast(api.imageryColors.contrast);
        api.setImagerySaturation(api.imageryColors.saturation);
        api.setImageryGamma(api.imageryColors.gamma);
        api.setImageryHue(api.imageryColors.hue);
    };
    api.setImageryBrightness = a => {
        const b = api.viewer.imageryLayers.get(0);
        a && (b.brightness = a);
        return b.brightness;
    };
    api.setImageryContrast = a => {
        const b = api.viewer.imageryLayers.get(0);
        a && (b.contrast = a);
        return b.contrast;
    };
    api.setImagerySaturation = a => {
        const b = api.viewer.imageryLayers.get(0);
        a && (b.saturation = a);
        return b.saturation;
    };
    api.setImageryHue = a => {
        const b = api.viewer.imageryLayers.get(0);
        a && (b.hue = a);
        return b.hue;
    };
    api.setImageryGamma = a => {
        const b = api.viewer.imageryLayers.get(0);
        a && (b.gamma = a);
        return b.gamma;
    };
    api.defaultAtmosphereColorModifier = {
        brightnessShift: 0,
        saturationShift: 0,
        hueShift: 0,
        groundBrightnessShift: 0,
        groundSaturationShift: 0,
        groundHueShift: 0,
        fogBrightness: 1,
        cloudsBrightness: 1,
    };
    api.atmosphereColorModifiers = {};
    api.setAtmosphereColorModifier = (a, b) => {
        a = a || 'base';
        b = $.extend({}, api.defaultAtmosphereColorModifier, api.atmosphereColorModifiers[a] || {}, b);
        api.atmosphereColorModifiers[a] = b;
        api.applyAtmosphereColorModifiers();
    };
    api.removeAtmosphereColorModifier = a => {
        delete api.atmosphereColorModifiers[a];
        api.applyAtmosphereColorModifiers();
    };
    api.applyAtmosphereColorModifiers = () => {
        api.atmosphereColors = $.extend({}, api.defaultAtmosphereColorModifier);
        for (const a in api.atmosphereColorModifiers) {
            api.atmosphereColors.brightnessShift += api.atmosphereColorModifiers[a].brightnessShift,
                api.atmosphereColors.saturationShift += api.atmosphereColorModifiers[a].saturationShift,
                api.atmosphereColors.hueShift += api.atmosphereColorModifiers[a].hueShift,
                api.atmosphereColors.groundBrightnessShift += api.atmosphereColorModifiers[a].groundBrightnessShift,
                api.atmosphereColors.groundHueShift += api.atmosphereColorModifiers[a].groundHueShift,
                api.atmosphereColors.groundSaturationShift += api.atmosphereColorModifiers[a].groundSaturationShift,
                api.atmosphereColors.fogBrightness *= api.atmosphereColorModifiers[a].fogBrightness,
                api.atmosphereColors.cloudsBrightness *= api.atmosphereColorModifiers[a].cloudsBrightness;
        }
        api.viewer.scene.skyAtmosphere.brightnessShift = api.atmosphereColors.brightnessShift;
        api.viewer.scene.skyAtmosphere.saturationShift = api.atmosphereColors.saturationShift;
        api.viewer.scene.skyAtmosphere.hueShift = api.atmosphereColors.hueShift;
        api.viewer.scene.globe.atmosphereBrightnessShift = clamp(api.atmosphereColors.groundBrightnessShift, -1, 1);
        api.viewer.scene.globe.atmosphereHueShift = clamp(api.atmosphereColors.groundHueShift, -1, 1);
        api.viewer.scene.globe.atmosphereSaturationShift = clamp(api.atmosphereColors.groundSaturationShift, -1, 1);
        api.viewer.scene.fog.minimumBrightness = api.atmosphereColors.fogBrightness;
        geofs.fx.cloudManager.setCloudsBrightness(api.atmosphereColors.cloudsBrightness);
    };
    api.showSun = () => {
        api.viewer.scene.sun.show = !0;
    };
    api.hideSun = () => {
        api.viewer.scene.sun.show = !1;
    };
    $('.geofs-ui-3dview').on('terrainUnstable', () => {
        api.renderingQuality('loading');
        $('.geofs-3dloader').show();
    });
    $('.geofs-ui-3dview').on('terrainStable', () => {
        api.renderingQuality(geofs.preferences.graphics.quality);
        $('.geofs-3dloader').hide();
    });
    api.renderingQuality = a => {
        a = a || geofs.preferences.graphics.quality;
        switch (a) {
            case 'loading':
                api.viewer.scene.globe.tileCacheSize = 100;
                api.viewer.resolutionScale *= 0.8;
                api.viewer.scene.fxaa = !1;
                api.viewer.scene.globe.maximumScreenSpaceError = 6;
                api.setGlobeLighting(!1);
                geofs.preferences.graphics.simpleShadow = !0;
                geofs.fx.cloudManager.setCloudCoverToCloudNumber(0);
                api.viewer.scene.fog.screenSpaceErrorFactor = 2;
                api.viewer.scene.fog.density = 3.5E-4;
                api.viewer.shadowMap.size = 1024;
                api.flatRunwayTerrainProviderInstance.setMaximumLevel(10);
                break;
            case 1:
                api.viewer.scene.globe.tileCacheSize = 20;
                api.viewer.resolutionScale = 0.7;
                api.viewer.scene.fxaa = !0;
                api.viewer.scene.globe.maximumScreenSpaceError = 6;
                api.setGlobeLighting(!1);
                geofs.preferences.graphics.simpleShadow = !0;
                geofs.fx.cloudManager.setCloudCoverToCloudNumber(1);
                api.viewer.scene.fog.screenSpaceErrorFactor = 2;
                api.viewer.scene.fog.density = 3.2E-4;
                api.viewer.shadowMap.size = 1024;
                api.flatRunwayTerrainProviderInstance.setMaximumLevel(8);
                break;
            case 2:
                api.viewer.scene.globe.tileCacheSize = geofs.isMobile ? 30 : 500;
                api.viewer.resolutionScale = 0.9;
                api.viewer.scene.fxaa = !0;
                api.viewer.scene.globe.maximumScreenSpaceError = 4;
                api.setGlobeLighting(!1);
                geofs.preferences.graphics.simpleShadow = !1;
                geofs.fx.cloudManager.setCloudCoverToCloudNumber(5);
                api.viewer.scene.fog.screenSpaceErrorFactor = 2;
                api.viewer.scene.fog.density = 3E-4;
                api.viewer.shadowMap.size = 1024;
                api.flatRunwayTerrainProviderInstance.setMaximumLevel(10);
                break;
            case 3:
                api.viewer.scene.globe.tileCacheSize = geofs.isMobile ? 50 : 1E3;
                api.viewer.resolutionScale = 1;
                api.viewer.scene.fxaa = !0;
                api.viewer.scene.globe.maximumScreenSpaceError = 2;
                api.setGlobeLighting(!0);
                geofs.preferences.graphics.simpleShadow = !1;
                geofs.fx.cloudManager.setCloudCoverToCloudNumber(10);
                api.viewer.scene.fog.screenSpaceErrorFactor = 2;
                api.viewer.scene.fog.density = 2.5E-4;
                api.viewer.shadowMap.size = 2048;
                api.flatRunwayTerrainProviderInstance.setMaximumLevel(12);
                break;
            case 4:
                api.viewer.scene.globe.tileCacheSize = geofs.isMobile ? 50 : 1500;
                api.viewer.resolutionScale = 1;
                api.viewer.scene.fxaa = !0;
                api.viewer.scene.globe.maximumScreenSpaceError = 1;
                api.setGlobeLighting(!0);
                geofs.preferences.graphics.simpleShadow = !1;
                geofs.fx.cloudManager.setCloudCoverToCloudNumber(15);
                api.viewer.scene.fog.screenSpaceErrorFactor = 2;
                api.viewer.scene.fog.density = 2E-4;
                api.viewer.shadowMap.size = 2048;
                api.flatRunwayTerrainProviderInstance.setMaximumLevel(14);
                break;
            case 5:
                api.viewer.scene.globe.tileCacheSize = geofs.isMobile ? 50 : 1500;
                api.viewer.resolutionScale = 1.5;
                api.viewer.scene.fxaa = !0;
                api.viewer.scene.globe.maximumScreenSpaceError = 1;
                api.setGlobeLighting(!0);
                geofs.preferences.graphics.simpleShadow = !1;
                geofs.fx.cloudManager.setCloudCoverToCloudNumber(15);
                api.viewer.scene.fog.screenSpaceErrorFactor = 2;
                api.viewer.scene.fog.density = 2E-4;
                api.viewer.shadowMap.size = 3072;
                api.flatRunwayTerrainProviderInstance.setMaximumLevel(16);
                break;
            case 6:
                api.viewer.scene.globe.tileCacheSize = geofs.isMobile ? 100 : 1500,
                    api.viewer.resolutionScale = 2,
                    api.viewer.scene.fxaa = !0,
                    api.viewer.scene.globe.maximumScreenSpaceError = 1,
                    geofs.preferences.graphics.simpleShadow = !1,
                    geofs.fx.cloudManager.setCloudCoverToCloudNumber(15),
                    api.viewer.scene.fog.screenSpaceErrorFactor = 2,
                    api.viewer.scene.fog.density = 2E-4,
                    api.viewer.shadowMap.size = 4096,
                    api.flatRunwayTerrainProviderInstance.setMaximumLevel(20);
        }
        geofs.useSimpleShadow(geofs.preferences.graphics.forceSimpleShadow || geofs.preferences.graphics.simpleShadow);
        api.viewer.resize();
    };
    api.useNativeShadows = a => {
        api.viewer.shadows = a;
    };
    api.addLabel = (a, b, c) => {
        b = b || [0, 0, 0];
        c = c || {};
        if (V3.isValid(b)) {
            return a = {
                    position: new Cesium.Cartesian3.fromDegrees(b[1], b[0], b[2]),
                    text: api.makeLabelTextSafe(a),
                },
                c = $.extend(c, a),
                api.labels.add(c);
        }
        geofs.debug.debugger();
    };
    api.updateLabelText = (a, b) => {
        a.text = api.makeLabelTextSafe(b);
    };
    api.makeLabelTextSafe = a => a.replace(/[^\x20-\x7E]+/g, '');
    api.removeLabel = a => {
        a && api.labels.remove(a);
    };
    api.setLabelPosition = (a, b) => {
        a && (V3.isValid(b) ? a.position = new Cesium.Cartesian3.fromDegrees(b[1], b[0], b[2]) : geofs.debug.debugger());
    };
    api.altitudeErrorThreshold = 0.2;
    api.wrongAltitudeTries = 2;
    api.getGroundAltitude = (a, b) => {
        if (geofs.debug.on && !V3.isValid(a)) { debugger; }
        const c = geofs.groundElevation || 0;
        a = api.viewer.scene.globe.getHeight(new Cesium.Cartographic.fromDegrees(a[1], a[0], c));
        a < -1E3 && (a = 0);
        if (void 0 == a) {
            b ? (a = b.lastGroundAltitude || 0,
                b.wrongAltitude = !0) : a = c;
        } else if (b) {
            if (Math.abs(b.lastGroundAltitude - a) > api.altitudeErrorThreshold && b.wrongAltitudeTries <= api.wrongAltitudeTries) {
                return b.wrongAltitudeTries++,
                    b.lastGroundAltitude;
            }
            b.wrongAltitudeTries = 0;
            b.lastGroundAltitude = a;
            b.wrongAltitude = null;
        }
        return a;
    };
    api.oldNormal = [0, 0, 1];
    api.normalDotThreshold = 0.95;
    api.wrongNormalTries = 3;
    api.getMostDetailedGroundNormal = (a, b) => {
        const c = V3.dup(a);
        a = xyz2lla([1, 1, 0], c);
        let d = V3.add(c, [a[0], 0, 0]),
            e = V3.add(c, [0, a[1], 0]);
        a = Cesium.sampleTerrainMostDetailed(api.viewer.terrainProvider, [Cesium.Cartographic.fromDegrees(c[1], c[0]), Cesium.Cartographic.fromDegrees(d[1], d[0]), Cesium.Cartographic.fromDegrees(e[1], e[0])]);
        Cesium.when(a, (a) => {
            c[2] = a[0].height;
            d[2] = a[1].height;
            e[2] = a[2].height;
            a = V3.sub(d, c);
            let f = V3.sub(e, c);
            a = lla2xyz(a, c);
            f = lla2xyz(f, c);
            b({
                origin: c,
                normal: V3.normalize(V3.cross(f, a)),
            });
        });
    };
    api.getGroundNormal = (a, b) => {
        b = b || {};
        b.oldNormal = b.oldNormal || [0, 0, 1];
        a = V3.dup(a);
        let c = xyz2lla([1, 1, a[2]], a),
            d = V3.add(a, [c[0], 0, a[2]]);
        c = V3.add(a, [0, c[1], a[2]]);
        a[2] = api.getGroundAltitude(a);
        d[2] = api.getGroundAltitude(d);
        c[2] = api.getGroundAltitude(c);
        d = V3.sub(d, a);
        c = V3.sub(c, a);
        d = lla2xyz(d, a);
        c = lla2xyz(c, a);
        a = V3.normalize(V3.cross(c, d));
        if (V3.dot(a, b.oldNormal) < api.normalDotThreshold && b.wrongNormal < api.wrongNormalTries) {
            return b.wrongNormal += 1,
                b.oldNormal;
        }
        b.wrongNormal = 0;
        b.oldNormal = a;
        return api.oldNormal = a;
    };
    api.shadowOffset = 0.1;
    api.createShadow = function(a, b) {
        this.scale = V3.scale(b, 2);
        this.scale[2] = 1;
        return api.loadModel({
            url: a,
        });
    };
    api.setShadowLocationRotation = function(a, b, c) {
        b[2] += api.shadowOffset;
        api.setModelPositionOrientationAndScale(a, b, c, this.scale);
    };
    api.Model = function(a, b) {
        b = b || {};
        b.url = b.url || a;
        this._model = api.loadModel(b);
        this.setPositionOrientationAndScale(b.location, b.rotation);
    };
    api.Model.prototype.setPositionOrientationAndScale = function(a, b, c) {
        return api.setModelPositionOrientationAndScale(this._model, a, b, c);
    };
    api.Model.prototype.setLocation = function(a) {
        this.setPositionOrientationAndScale(a);
    };
    api.Model.prototype.setColor = function(a) {
        this._model.color = a;
    };
    api.Model.prototype.setCssColor = function(a) {
        this._model.color = Cesium.Color.fromCssColorString(a);
    };
    api.Model.prototype.hide = function() {
        api.setModelVisibility(this._model, !1);
    };
    api.Model.prototype.show = function() {
        api.setModelVisibility(this._model, !0);
    };
    api.Model.prototype.destroy = function() {
        api.destroyModel(this._model);
    };
    api.Model.prototype.remove = function() {
        api.removeFromWorld(this._model);
    };
    api.loadModel = a => {
        typeof a === 'string' && (a = {
            url: a,
        });
        a = $.extend({}, {
            castShadows: !1,
            receiveShadows: !1,
        }, a);
        let b = Cesium.ShadowMode.DISABLED;
        a.castShadows && (b = Cesium.ShadowMode.CAST_ONLY);
        a.receiveShadows && (b = Cesium.ShadowMode.RECEIVE_ONLY);
        a.castShadows && a.receiveShadows && (b = Cesium.ShadowMode.ENABLED);
        a.shadows = b;
        // debugger
        b = Cesium.Model.fromGltf(a);
        a.justLoad || api.addModelToWorld(b);
        return b;
    };
    api.addModelToWorld = a => {
        a && (a.isDestroyed() || api.models.add(a));
    };
    api.toggleModelShadow = (a, b) => {
        api.viewer.shadows && a && !a.isDestroyed() && (a.shadows = b ? Cesium.ShadowMode.CAST_ONLY : Cesium.ShadowMode.DISABLED);
    };
    api.removeModelFromWorld = a => {
        a && (a.isDestroyed() || api.models.remove(a));
    };
    api.setModelVisibility = (a, b) => {
        if (!a || a.isDestroyed()) { return !1; }
        a.show = b;
        return !0;
    };
    api.destroyModel = a => {
        a && (api.removeModelFromWorld(a),
            a.isDestroyed() || a.destroy());
    };
    api.getPositionOrientationAndScaleMatrix = (a, b, c) => {
        c = c || [1, 1, 1];
        b = b || [0, 0, 0];
        a = a || [0, 0, 0];
        a = Cesium.Cartesian3.fromDegrees(a[1], a[0], a[2]);
        return geofs.headingPitchRollScaleToFixedFrame(a, b[0] * DEGREES_TO_RAD, b[1] * DEGREES_TO_RAD, b[2] * DEGREES_TO_RAD, c);
    };
    api.setModelElevation = (a, b) => {
        api.setModelPositionOrientationAndScale(a, [a._apiLla[0], a._apiLla[1], b]);
    };
    api.setModelPositionOrientationAndScale = (a, b, c, d) => {
        a && !a.isDestroyed() && (d = d || a._apiScale || [1, 1, 1],
            c = c || a._apiHtr || [0, 0, 0],
            b = b || a._apiLla || [0, 0, 0],
            V3.isValid(c) ? V3.isValid(d) ? V3.isValid(b) ? (a.modelMatrix = api.getPositionOrientationAndScaleMatrix(b, c, d),
                a._apiScale = d,
                a._apiHtr = c,
                a._apiLla = b) : geofs.debug.debugger() : geofs.debug.debugger() : geofs.debug.debugger());
    };
    api.getModelNode = (a, b) => {
        a._geofsNodes = a._geofsNodes || {};
        if (!a._geofsNodes[b]) {
            if (!a || !a.ready) { return !1; }
            a._geofsNodes[b] = a.getNode(b);
        }
        return a._geofsNodes[b];
    };
    api.setModelRotationPosition = (a, b, c) => {
        a.originalTranform || (a.originalTranform = a.modelMatrix.clone(a.originalTranform));
        if (b) { var d = Cesium.Matrix3.fromColumnMajorArray(M33.toArray(b)); }
        if (c) { var e = Cesium.Cartesian3.fromDegrees(c[1], c[0], c[2]); }
        a.modelMatrix = Cesium.Matrix4.fromRotationTranslation(d, e);
        b = Cesium.Transforms.eastNorthUpToFixedFrame(e);
        a.modelMatrix = Cesium.Matrix4.multiply(b, a.modelMatrix, b);
    };
    api.setNodeRotationTranslation = (a, b, c) => {
        a.originalTranform || (a.originalTranform = a.matrix.clone(a.originalTranform));
        if (b) { var d = Cesium.Matrix3.fromColumnMajorArray(M33.toArray(b)); }
        if (c) { var e = new Cesium.Cartesian3(c[0], c[1], c[2]); }
        b = Cesium.Matrix4.fromRotationTranslation(d, e);
        a.matrix = Cesium.Matrix4.multiply(a.originalTranform, b, a.matrix);
    };
    api.setNodeScale = (a, b) => {
        b = Cesium.Matrix4.fromScale(new Cesium.Cartesian3(b[0], b[1], b[2]));
        a.matrix = Cesium.Matrix4.multiply(a.matrix, b, a.matrix);
    };
    api.setNodeVisibility = (a, b) => {
        if (!a) { return !1; }
        a.show = b;
        return !0;
    };
    api.getNodePosition = a => {
        a = Cesium.Matrix4.getTranslation(a.matrix, new Cesium.Cartesian3());
        return [a.x, a.y, a.z];
    };
    api.getNodeRotation = () => M33.identity();
    api.setEntityPositionOrientation = (a, b, c) => {
        if (a) {
            if (c = c || a._apiHtr || [0, 0, 0],
                b = b || a._apiLla || [0, 0, 0],
                V3.isValid(c)) {
                if (V3.isValid(b)) {
                    let d = Cesium.Cartesian3.fromDegrees(b[1], b[0], b[2]),
                        e = new Cesium.ConstantProperty(Cesium.Transforms.headingPitchRollQuaternion(d, new Cesium.HeadingPitchRoll(c[0] * DEGREES_TO_RAD, c[1] * DEGREES_TO_RAD, c[2] * DEGREES_TO_RAD)));
                    a.position = d;
                    a.orientation = e;
                    geofs.debug.watch('x', d.x);
                    geofs.debug.watch('y', d.y);
                    geofs.debug.watch('z', d.z);
                    a._apiHtr = c;
                    a._apiLla = b;
                } else { geofs.debug.debugger(); }
            } else { geofs.debug.debugger(); }
        }
    };
    api.initAndGetCamera = () => {
        api.camera = api.viewer.camera;
        return api.camera;
    };
    api.getFOV = a => a.frustum.fov;
    api.setFOV = (a, b) => {
        a.frustum.fov = b;
    };
    api.setCameraPositionAndOrientation = (a, b, c) => {
        V3.isValid(b) ? V3.isValid(c) ? (a.position = Cesium.Cartesian3.fromDegrees(b[1], b[0], b[2]),
            a.setView({
                orientation: {
                    heading: Cesium.Math.toRadians(c[0]),
                    pitch: Cesium.Math.toRadians(c[1]),
                    roll: Cesium.Math.toRadians(c[2]),
                },
            })) : geofs.debug.debugger() : geofs.debug.debugger();
    };
    api.getCameraLla = a => {
        a = a.positionCartographic;
        return [a.latitude * RAD_TO_DEGREES, a.longitude * RAD_TO_DEGREES, a.height];
    };
    api.setCameraLookAt = (a, b) => {
        a.lookAt(Cesium.Cartesian3.fromDegrees(b[1], b[0], b[2]));
    };
    api.getHeading = a => a.heading * RAD_TO_DEGREES;
    api.debug = a => {
        api.viewer.scene.debugShowFramesPerSecond = a ? !0 : !1;
    };
    api.getLlaFromScreencoordDepth = (a, b, c) => {
        a = camera.cam.getPickRay(new Cesium.Cartesian2(a, b));
        c = Cesium.Ray.getPoint(a, c);
        if (!isNaN(c.x)) {
            return c = Cesium.Cartographic.fromCartesian(c, null, new Cesium.Cartographic()), [c.latitude * RAD_TO_DEGREES, c.longitude * RAD_TO_DEGREES, c.height];
        }
    };
    api.getScreenCoordFromLla = a => Cesium.SceneTransforms.wgs84ToWindowCoordinates(api.viewer.scene, Cesium.Cartesian3.fromDegrees(a[1], a[0], a[2]));
    api.xyz2lla = (a, b) => {
        let c = new Cesium.Matrix4(),
            d = api.viewer.scene.globe.ellipsoid,
            e = Cesium.Cartesian3.fromDegrees(b[1], b[0], b[2]);
        Cesium.Transforms.eastNorthUpToFixedFrame(e, d, c);
        a = new Cesium.Cartesian3(a[0], a[1], a[2]);
        c = Cesium.Matrix4.multiplyByPoint(c, a, new Cesium.Cartesian3());
        return (d = Cesium.Cartographic.fromCartesian(c, d, new Cesium.Cartographic())) ? [d.latitude * RAD_TO_DEGREES - b[0], d.longitude * RAD_TO_DEGREES - b[1], d.height - b[2]] : [0, 0, 0];
    };
    api.cssTransform = function() {
        this._$element = $('<div class="geofs-overlay"></div>').appendTo('.geofs-overlay-container');
        this.positionY = this.positionX = this.rotation = 0;
        this.offset = {
            x: 0,
            y: 0,
        };
    };
    api.cssTransform.rotationThreshold = 0;
    api.cssTransform.translationThreshold = 0;
    api.cssTransform.prototype = {
        setDrawOrder(a) {
            this._$element.css('z-index', a + api.overlayBaseZIndex);
        },
        setUrl(a) {
            if (a) {
                this.image = new Image();
                this.image.src = a;
                const b = this;
                this.image.onload = () => {
                    b.loaded();
                };
                this._$element.css('background-image', `url("${a}")`);
            }
        },
        setText(a) {
            this._$element.html(a);
            this._$element.addClass('geofs-textOverlay');
        },
        setTitle(a) {
            this._$element.attr('title', a);
        },
        setClass(a) {
            this._$element.addClass(a);
        },
        setStyle(a) {
            this._$element.attr('style', a);
        },
        loaded() {
            this.naturalSize = {
                x: this.image.width,
                y: this.image.height,
            };
            $(this).trigger('load');
        },
        setFrameSize(a) {
            this._$element.css('width', `${a.x}px`);
            this._$element.css('height', `${a.y}px`);
        },
        setVisibility(a) {
            a ? this._$element.css('display', 'block') : this._$element.css('display', 'none');
        },
        setAnchor(a) {
            this._$element.css('margin-left', `${-a.x}px `);
            this._$element.css('margin-bottom', `${-a.y}px `);
        },
        setRotationCenter(a) {
            this._$element.css('transform-origin', `${a.x}px ${a.y}px`);
        },
        setSize(a) {
            this._$element.css('background-size', `${a.x}px ${a.y}px`);
        },
        setPosition(a) {
            this._$element.css('left', `${a.x}px`);
            this._$element.css('bottom', `${a.y}px`);
        },
        setPositionX(a) {
            Math.abs(a - this.positionX) < api.cssTransform.translationThreshold || (this._$element.css('left', `${a}px`),
                this.positionX = a);
        },
        setPositionY(a) {
            Math.abs(a - this.positionY) < api.cssTransform.translationThreshold || (this._$element.css('bottom', `${a}px`),
                this.positionY = a);
        },
        setPositionOffset(a) {
            Math.abs(a.x - this.offset.x) < api.cssTransform.translationThreshold && Math.abs(a.y - this.offset.y) < api.cssTransform.translationThreshold || (this._$element.css('background-position', `${a.x}px ${a.y}px`),
                this.offset.x = a.x,
                this.offset.y = a.y);
        },
        setOpacity(a) {
            this._$element.css('opacity', a);
        },
        setRotation(a) {
            if (!(Math.abs(a - this.rotation) < api.cssTransform.rotationThreshold)) {
                const b = `rotate(${fixAngle360(-a)}deg)`;
                this._$element.css('transform', b);
                this.rotation = a;
            }
        },
        destroy() {
            this._$element.remove();
        },
    };
    api.billboard = function(a, b, c) {
        c = $.extend({
            collection: 'default',
        }, c);
        a = a || [0, 0, 0];
        c.image = c.image || b;
        c.image += geofs.killCache;
        c.position = Cesium.Cartesian3.fromDegrees(a[1], a[0], a[2]);
        api.billboards[c.collection] || (api.billboards[c.collection] = api.viewer.scene.primitives.add(new Cesium.BillboardCollection({
            scene: api.viewer.scene,
            blendOption: Cesium.BlendOption.OPAQUE_AND_TRANSLUCENT,
        })));
        this._billboard = api.billboards[c.collection].add(c);
        this._lla = a;
        c.altitudeMode == api.ALTITUDE_RELATIVE && (this._billboard.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND);
        c.altitudeMode == api.CLAMP_TO_GROUND && (this._billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND);
        c.opacity && this.setOpacity(c.opacity);
        c.scale && this.setScale(c.scale);
        c.rotation && this.setRotation(c.rotation);
        c.geofsFixCameraRotation && this.fixCameraRotation();
        this._options = c;
    };
    api.billboard.prototype = {
        setUrl() {},
        setVisibility(a) {
            this._billboard && (this._billboard.show = a);
        },
        setColor(a) {
            this._billboard && (a.alpha = this.opacity || 1,
                this._billboard.color = a);
        },
        setCssColor(a) {
            this._billboard && (this._billboard.color = Cesium.Color.fromCssColorString(a));
        },
        setOpacity(a) {
            if (this._billboard) {
                const b = this._billboard.color || new Cesium.Color(1, 1, 1, 1);
                b.alpha = a;
                this._billboard.color = b;
                this.opacity = a;
            }
        },
        setRotation(a) {
            this._billboard && (this._billboard.rotation = a);
        },
        setScale(a) {
            this._billboard && (this._billboard.scale = a);
        },
        setLocation(a) {
            this._billboard && (V3.isValid(a) ? (this._lla = a,
                this._billboard.position = Cesium.Cartesian3.fromDegrees(a[1], a[0], a[2])) : geofs.debug.debugger());
        },
        getLla() {
            return this._lla;
        },
        fixCameraRotation() {
            const a = this;
            this.rotationFixCallback = api.addFrameCallback(() => {
                a._billboard.rotation = camera.radianRoll;
            }, 'billboardsRotationFix');
        },
        destroy() {
            this._billboard && (api.removeFrameCallback(this.rotationFixCallback, 'billboardsRotationFix'),
                api.billboards[this._options.collection].remove(this._billboard),
                this._billboard = null);
        },
    };
    api.notify = (a, b, c) => {
        $.haring.create(a, b || 'OK', c);
    };
    api.analytics = {
        init() {
            try {
                window._gat && window._gaq && (api.pageTracker = _gat._getTracker('UA-2996341-8'),
                    _gaq.push(['_trackPageview']));
            } catch (a) {
                geofs.debug.error(a);
            }
        },
        event(a, b, c, d) {
            api.pageTracker ? api.pageTracker._trackEvent(a, b, c, d) : api.analytics.init();
        },
    };
    api.Canvas = function(a) {
        this.canvas = document.createElement('canvas');
        this.canvas.height = a.height;
        this.canvas.width = a.width;
        this.context = this.canvas.getContext('2d');
        this.context.fillStyle = 'green';
        this.context.fillRect(10, 10, 100, 100);
    };
    api.Canvas.prototype = {
        getTexture() {
            return this.canvas.toDataURL();
        },
        destroy() {},
    };
    window.Cesium && (Cesium.sampleTerrainMostDetailed = (a, b) => a.readyPromise.then(() => {
        for (var c = [], d = a.availability, e = 0; e < b.length; ++e) {
            let f = b[e],
                g = Math.min(d.computeMaximumLevelAtPosition(f), a.maximumLevel),
                h = c[g];
            h || (c[g] = h = []);
            h.push(f);
        }
        return Cesium.when.all(c.map((b, c) => {
            if (b) { return Cesium.sampleTerrain(a, c, b); }
        })).then(() => b);
    }));
    api.FlatRunwayTerrainProvider = function(a) {
        const b = this;
        this.baseProvider = a.baseProvider;
        this.regions = {};
        this.tiles = {};
        this.minFlatteningLevel = this.defaultMinFlatteningLevel = 6;
        this.maximumLevel = 13;
        this.defaultMaximumLevel = a.maximumLevel || this.maximumLevel;
        this.flatten = !a.bypass;
        this.setMaximumLevel(this.maximumLevel);
        a = () => {
            b.regions = {};
            for (const a in geofs.runways.nearRunways) { b.addRunway(geofs.runways.nearRunways[a]); }
        };
        $(document).on('runwayUpdate', a);
        a();
    };
    api.FlatRunwayTerrainProvider.prototype = {
        aName: 'FlatRunwayTerrainProvider',
        get availability() {
            return this.baseProvider.availability;
        },
        get credit() {
            return this.baseProvider.credit;
        },
        get errorEvent() {
            return this.baseProvider.errorEvent;
        },
        get hasVertexNormals() {
            return this.baseProvider.hasVertexNormals;
        },
        get hasWaterMask() {
            return this.baseProvider.hasWaterMask;
        },
        get ready() {
            return this.baseProvider.ready;
        },
        get readyPromise() {
            return this.baseProvider.readyPromise;
        },
        get tilingScheme() {
            return this.baseProvider.tilingScheme;
        },
        getLevelMaximumGeometricError(a) {
            return this.baseProvider.getLevelMaximumGeometricError(a);
        },
        getTileDataAvailable(a, b, c) {
            return c > this.maximumLevel || c > this.defaultMaximumLevel ? !1 : this.baseProvider.getTileDataAvailable(a, b, c);
        },
        setMaximumLevel(a) {
            a > this.defaultMaximumLevel && (a = this.defaultMaximumLevel);
            this.minFlatteningLevel = a < this.defaultMinFlatteningLevel ? a : this.defaultMinFlatteningLevel;
            this.maximumLevel = a;
        },
        addRunway(a) {
            let b = xy2ll([a.padding, a.padding], a.threshold1);
            a.rec = Cesium.Rectangle.fromDegrees(Math.min(a.threshold1[1], a.threshold2[1]) - b[1], Math.min(a.threshold1[0], a.threshold2[0]) - b[0], Math.max(a.threshold1[1], a.threshold2[1]) + b[1], Math.max(a.threshold1[0], a.threshold2[0]) + b[0]);
            a.threshold1Cartesian = Cesium.Cartesian3.fromDegrees(a.threshold1[1], a.threshold1[0]);
            a.threshold2Cartesian = Cesium.Cartesian3.fromDegrees(a.threshold2[1], a.threshold2[0]);
            a.direction = Cesium.Cartesian3.subtract(a.threshold1Cartesian, a.threshold2Cartesian, new Cesium.Cartesian3());
            a = {
                name: a.id,
                rec: a.rec,
                runways: [a],
                vertices: {},
            };
            for (const c in this.regions) {
                b = this.regions[c],
                    void 0 !== Cesium.Rectangle.intersection(b.rec, a.rec) && (a.rec = Cesium.Rectangle.union(a.rec, b.rec),
                        a.name += b.name,
                        a.runways = a.runways.concat(b.runways),
                        delete this.regions[c]);
            }
            this.regions[a.name] = a;
        },
        requestTileGeometry(a, b, c, d) {
            if (c >= this.minFlatteningLevel && this.flatten) {
                let e = this.baseProvider.tilingScheme.tileXYToRectangle(a, b, c),
                    f;
                for (f in this.regions) {
                    if (void 0 !== Cesium.Rectangle.intersection(this.regions[f].rec, e)) {
                        return a = this.baseProvider.requestTileGeometry(a, b, c, d),
                            void 0 === a ? void 0 : this.getPromise(a, e, this.regions[f]);
                    }
                }
            }
            return this.baseProvider.requestTileGeometry(a, b, c, d);
        },
        getPromise(a, b, c) {
            const d = this;
            if (void 0 !== a) {
                const e = new Promise(((a, b) => {
                    if (c.referenceElevation) { a(c.referenceElevation); } else {
                        const e = Cesium.sampleTerrain(d.baseProvider, d.maximumLevel, [Cesium.Cartographic.fromDegrees(c.runways[0].threshold1[1], c.runways[0].threshold1[0])]);
                        Cesium.when(e, (d) => {
                            d[0] && d[0].height ? (c.referenceElevation = d[0].height,
                                a(c.referenceElevation)) : b('no value');
                        });
                    }
                }), );
                return Promise.all([e, a]).then((a) => {
                    try {
                        let d = a[0],
                            e = a[1];
                        for (a = 0; a < c.runways.length; a++) {
                            let f = c.runways[a],
                                n = !1;
                            e._oldMinimumHeight = e._minimumHeight;
                            e._oldMaximumHeight = e._maximumHeight;
                            const v = 32767 / (e._oldMaximumHeight - e._oldMinimumHeight);
                            d > e._maximumHeight && (e._maximumHeight = d,
                                n = !0);
                            d < e._minimumHeight && (e._minimumHeight = d,
                                n = !0);
                            for (let z = e._oldMinimumHeight - e._minimumHeight, A = 32767 / (e._maximumHeight - e._minimumHeight), C = (d - e._minimumHeight) * A, w = 0; w < e._heightValues.length; w++) {
                                let y = b.south + e._quantizedVertices[e._heightValues.length + w] / 32767 * b.height,
                                    D = b.west + e._quantizedVertices[w] / 32767 * b.width;
                                if (Cesium.Rectangle.contains(c.rec, new Cesium.Cartographic(D, y, 0))) {
                                    const B = Cesium.Cartesian3.fromRadians(D, y);
                                    Cesium.Cartesian3.subtract(f.threshold1Cartesian, B, B);
                                    let t = Cesium.Cartesian3.magnitude(B),
                                        m = Cesium.Cartesian3.multiplyByScalar(f.direction, Cesium.Cartesian3.dot(B, f.direction) / Cesium.Cartesian3.dot(f.direction, f.direction), new Cesium.Cartesian3()),
                                        O = Cesium.Cartesian3.subtract(B, m, new Cesium.Cartesian3());
                                    if (Math.sqrt(Cesium.Cartesian3.dot(O, O)) < f.padding && t < f.lengthMeters + f.padding) {
                                        e._heightValues[w] = C;
                                        continue;
                                    }
                                }
                                n && (e._heightValues[w] = (e._heightValues[w] / v + z) * A);
                            }
                        }
                        return e;
                    } catch (Y) {
                        geofs.debug.log(`FlatRunwayTerrainProvider promise: ${Y}`);
                    }
                });
            }
        },
    };
    api.add3dBuildings = () => {
        api.viewer.terrainProvider = api.flatRunwayTerrainProviderInstance = new api.FlatRunwayTerrainProvider({
            baseProvider: Cesium.createWorldTerrain({
                requestWaterMask: !0,
                requestVertexNormals: !0,
            }),
        });
        geofs.useSimpleShadow(!0);
        api.buildings = [];
        [29328, 29331, 29332, 29333, 29334, 29335].forEach((a) => {
            api.buildings.push(api.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
                url: Cesium.IonResource.fromAssetId(a),
            })));
        });
    };
    api.map = function(a, b, c) {
        const d = this;
        a.zoom = a.zoom || 10;
        this._holder = a.holder || $('.geofs-map-viewport')[0];
        this.map = L.map(this._holder, {
            minZoom: 3,
            maxZoom: 13,
            preferCanvas: !0,
        });
        L.tileLayer.fallback(geofs.mapXYZ, {
            attribution: '\u00a9 OpenStreetMap contributors - Made with Natural Earth.',
        }).addTo(this.map);
        this.icons = {
            yellow: [],
            blue: [],
            traffic: [],
        };
        for (let e = 0; e < 36; e++) {
            let f = `${e}`;
            f = (`00${f}`).substring(f.length);
            this.icons.yellow.push(L.icon({
                iconUrl: `${geofs.localUrl}images/map/icons/yellow/icon00${f}.png`,
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, 0],
            }));
            this.icons.blue.push(L.icon({
                iconUrl: `${geofs.localUrl}images/map/icons/blue/icon00${f}.png`,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, 0],
            }));
            this.icons.traffic.push(L.icon({
                iconUrl: `${geofs.localUrl}images/map/icons/blue/icon00${f}.png`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
                popupAnchor: [0, 0],
                className: 'geofs-traffic-icon',
            }));
        }
        this.map.on('load zoomend resize moveend', () => {
            d.updateMarkerLayers();
        });
        this.map.getPanes().overlayPane.style.opacity = 0.7;
        this.map.setView(L.latLng(b, c), a.zoom);
        $(document).on('click', '.geofs-createPath', () => {
            api.map.flightPathOn ? api.map.stopCreatePath(d) : api.map.createPath(d);
        }).on('click', '.geofs-clearPath', () => {
            api.map.clearPath(d);
        });
    };
    api.map.runwayMarkerRadius = 5;
    api.map.defaultLayer = {
        minZoom: 0,
        maxZoom: 15,
        tileSize: 10,
        tiles: {},
    };
    api.map.prototype = {
        init() {
            this.updateMarkerLayers();
            api.map.instance = this;
        },
        updateMap(a, b) {
            this.map.panTo(L.latLng(a, b));
        },
        addLayeredMarker(a, b, c, d) {
            c = geofs.getLatLonMatrixcoord(c, d, api.map.runwayLayers[a].tileSize);
            api.map.runwayLayers[a] || (api.map.runwayLayers[a] = Object.assign({}, api.map.defaultLayer));
            api.map.runwayLayers[a].visibileTiles = {};
            api.map.runwayLayers[a].tiles[c] || (api.map.runwayLayers[a].tiles[c] = []);
            api.map.runwayLayers[a].tiles[c].push(b);
        },
        getVisibleTiles(a, b) {
            let c = a.getNorthEast().wrap(),
                d = a.getSouthWest().wrap();
            a = Math.floor(d.lng / b);
            let e = Math.floor(d.lat / b),
                f = (parseInt((c.lng - d.lng) / b) || 1) + 2;
            b = (parseInt((c.lat - d.lat) / b) || 1) + 2;
            c = {};
            for (d = a; d < a + f; d++) {
                for (let g = e; g < e + b; g++) { c[`${g}/${d}`] = !0; }
            }
            return c;
        },
        showTile(a, b) {
            const c = this;
            a.visibileTiles && !a.visibileTiles[b] && a.tiles[b] && (a.tiles[b].forEach((a) => {
                    a.marker || (a.marker = api.map.makeMarker(a));
                    a.marker.addTo(c.map);
                }),
                a.visibileTiles[b] = a.tiles[b]);
        },
        hideTile(a, b) {
            a.visibileTiles && a.visibileTiles[b] && a.tiles[b] && (a.tiles[b].forEach((a) => {
                    a.marker && a.marker.remove();
                }),
                delete a.visibileTiles[b]);
        },
        updateMarkerLayers() {
            let a = this.map.getZoom(),
                b;
            for (b in api.map.runwayLayers) {
                const c = api.map.runwayLayers[b];
                if (a > c.minZoom && a < c.maxZoom) {
                    const d = this.getVisibleTiles(this.map.getBounds(), c.tileSize);
                    var e;
                    for (e in c.visibileTiles) { d[e] || this.hideTile(c, e); }
                    for (e in d) { this.showTile(c, e); }
                } else {
                    for (e in c.visibileTiles) { this.hideTile(c, e); }
                }
            }
        },
        setGenericLocationPopup() {
            let a = this,
                b = L.popup();
            this.map.on('contextmenu click', (c) => {
                if (c.originalEvent.button == 2 || geofs.isApp) {
                    b.closePopup();
                    const d = `${c.latlng.lat},${c.latlng.lng}`;
                    b.setContent(`<div class="geofs-map-popup"><ul><li><a href="http://flyto://${d}, 0, 0, true">On the ground</a></li><li><a href="http://flyto://${d}, 304, 0, true">At 1,000 feet</a></li><li><a href="http://flyto://${d}, 914, 0, true">At 3,000 feet</a></li><li><a href="http://flyto://${d}, 3048, 0, true">At 10,000 feet</a></li><li><a href="http://flyto://${d}, 6096, 0, true">At 20,000 feet</a></li><li><a href="http://flyto://${d}, 9144, 0, true">At 30,000 Feet</a></li></ul></div>`).setLatLng(c.latlng).openOn(a.map);
                    c.originalEvent.preventDefault();
                }
            });
        },
        mapClickHandler(a) {
            let b = a.target.getAttribute('href');
            if (b && (b = b.split('://'),
                    b[1] == 'flyto')) {
                b = b[2].split(',');
                let c = parseFloat(b[3]),
                    d = [parseFloat(b[0]), parseFloat(b[1]), parseFloat(b[2]), c];
                b[4] == 'approach' ? (c *= DEGREES_TO_RAD,
                    c = xy2ll(V2.scale([Math.sin(c), Math.cos(c)], parseFloat(b[5])), d),
                    d[0] -= c[0],
                    d[1] -= c[1],
                    d[2] = d[2] * FEET_TO_METERS + parseFloat(b[6]),
                    d[4] = !0) : d[4] = b[4];
                geofs.flyTo(d);
                a.preventDefault();
            }
        },
    };
    api.map.runwayLayers = {
        major: {
            minZoom: 6,
            maxZoom: 15,
            tileSize: 5,
            tiles: {},
        },
        minor: {
            minZoom: 8,
            maxZoom: 15,
            tileSize: 5,
            tiles: {},
        },
    };
    api.map.majorRunwayMarkers = [];
    api.map.minorRunwayMarkers = [];
    api.map.addRunwayMarker = (a, b) => {
        let c = `${a[2]},${a[3]}`,
            d = a[5];
        b.addLayeredMarker(d ? 'major' : 'minor', {
            lat: a[2],
            lon: a[3],
            options: {
                radius: api.map.runwayMarkerRadius,
                color: '#000000',
                weight: 1,
                fillColor: d ? '#9797ff' : '#ffff99',
                fillOpacity: 1,
                pane: 'overlayPane',
            },
            popupContent: `<div class="geofs-map-popup"><b>${a[0]}</b><br><a href="http://flyto://${c},0,${a[1]}">Take-off from</a><a href="http://flyto://${c},1000,${a[1]}">Fly by</a><a href="http://flyto://${c},${a[4]},${a[1]},approach,4800,450">Approach</a></div>`,
        }, a[2], a[3]);
    };
    api.map.makeMarker = a => L.circleMarker(L.latLng(a.lat, a.lon), a.options).bindPopup(a.popupContent);
    api.map.planeMarker = function(a, b, c, d, e, f) {
        this.style = d = d || 'blue';
        this.apiMap = c;
        this._marker = L.marker(L.latLng(a, b), {
            icon: c.icons[d][0],
            title: f,
            zIndexOffset: e,
        }).addTo(c.map);
    };
    api.map.planeMarker.prototype = {
        updatePlaneMarker(a, b, c, d) {
            this._marker.setLatLng(L.latLng(a, b));
            d && (this._marker._icon.title = d);
            a = this.apiMap.icons[this.style][Math.floor(fixAngle360(c) / 10)];
            this._marker.setIcon(a);
        },
        destoryPlaneMarker() {
            this._marker && this._marker.remove();
        },
    };
    api.map.flightPath = null;
    api.map.flightPathOn = !1;
    api.map.createPath = (a, b) => {
        const c = {
            weight: 5,
        };
        api.map.flightPath || (api.map.flightPath = L.Polyline.Plotter(b || [], c).addTo(a.map));
        api.map.flightPath.setReadOnly(!1);
        $('.geofs-createPath').addClass('on');
        $('.geofs-clearPath').show();
        api.map.flightPathOn = !0;
    };
    api.map.stopCreatePath = () => {
        api.map.flightPath && (api.map.flightPath.setReadOnly(!0),
            $('.geofs-createPath').removeClass('on'),
            api.map.flightPathOn = !1);
    };
    api.map.clearPath = () => {
        api.map.flightPath && (api.map.stopCreatePath(),
            api.map.flightPath.remove(),
            api.map.flightPath = null,
            $('.geofs-clearPath').hide());
    };
    api.map.getPathPoints = () => {
        if (api.map.flightPath) {
            const a = [];
            api.map.flightPath.getLatLngs().forEach((b) => {
                a.push([b.lat, b.lng]);
            });
            return a;
        }
    };
    api.map.setPathPoints = a => {
        api.map.instance && (api.map.clearPath(),
            api.map.createPath(api.map.instance, a));
    };
    api.reverserGeocode = (a, b) => {
        $.getJSON(`https://api.opencagedata.com/geocode/v1/json?q=${a}&key=f7681dd621b540a6847d2dae0dc33a99`, (a) => {
            try {
                if (a.results && a.results.length > 0) {
                    const c = a.results[0].geometry;
                    b(c.lat, c.lng);
                }
            } catch (e) {}
        });
    };
})());

function clamp(a, b, c) {
    return void 0 == b || void 0 == c ? a : a < b ? b : a > c ? c : a
}
function xy2ll(a, b) {
    var c = [];
    c[0] = a[1] * METERS_TO_LOCAL_LAT;
    c[1] = a[0] / (Math.cos((b[0] + c[0]) * DEGREES_TO_RAD) * MERIDIONAL_RADIUS * DEGREES_TO_RAD);
    return c
}
export default geofs;