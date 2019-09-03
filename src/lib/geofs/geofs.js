
import aircraft from './Aircraft';
import debug from './debug';
import animation from './animation';
import api from './api';
// @ts-ignore
import fx from './fx';
import GlassPanel from './GlassPanel';
import runwayslights from './runwayslights';
// @ts-ignore
import runways from './runways';
import utils from './utils';
import {  V3,VIEWPORT_REFERENCE_WIDTH  } from './utils'
import hackGeoFS from './preferences';
// @ts-ignore
import ui from '../ui/ui'
import controls from '../controls'
import { list } from "./AircraftList"
import objects from '../objects'
import weather from '../weather'
import multiplayer from "../multiplayer"
import audio from "../audio"
import camera from "../camera"
import flight from "../flight"
import  shadowGeofs from "./shadow"
import instruments from "../instruments"
// import Cesium from "cesium/Cesium"
var geofs  =  window.geofs || {
};
geofs.aircraft=aircraft
geofs.animation=animation
geofs.api=api
geofs.debug=debug
geofs.GlassPanel=GlassPanel
geofs.fx=fx
geofs.runways=runways
geofs.utils=utils
hackGeoFS(geofs)
shadowGeofs(geofs)
geofs.runwaysLights = runwayslights;
geofs.includes = {};
geofs.aircraftList = list;
geofs.frameCallbackStack = {};
geofs.minPenetrationThreshold = 0.001;
geofs.multiplayerHost = geofs.multiplayerHost || 'https://net.geo-fs.com:8080';
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
        debugger
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
    b && c ? ( b = geofs.getAltitudeAtPointFromCollisionResult(c, [b[0], b[1], 0]),

        a = {
            location: [a[0], a[1], b],
            normal: V3.dup(c.normal),
        }) : a = geofs.getGroundAltitude(a[0], a[1], d);
    return a;
};
geofs.getAltitudeAtPointFromCollisionResult = function(a, b) {
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

{
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
 };

Math.sign = function(a) {
    return a < 0 ? -1 : 1;
};
Math.arrayToPrecision = function(a, b) {
    for (let c = a.length; c >= 0; c--) { a[c] && a[c].toFixed && (a[c] = parseFloat(a[c].toFixed(b))); }
    return a;
};

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
export default geofs;