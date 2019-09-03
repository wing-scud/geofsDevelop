

import ui from './ui/ui'
import geofs from "./geofs/geofs"
import Cesium from 'cesium/Cesium'
import flight from "./flight"
import {fixAngle,M3,clamp,exponentialSmoothing,V3,xyz2lla,lla2xyz,EGM96_TO_WGS84} from "./geofs/utils"

window.multiplayer = window.multiplayer || {};

multiplayer.nbUsers = 0;
multiplayer.users = {};
multiplayer.visibleUsers = {};
multiplayer.numberOfLOD = 3;
multiplayer.captainIconUrl = 'images/captain-tag.png';
multiplayer.premiumIconUrl = 'images/premium-tag.png';
multiplayer.minUpdateDelay = 500;
multiplayer.hearbeatTimeout;
multiplayer.hearbeatLife = 9E3;
multiplayer.userLife = 2E4;
multiplayer.userHalfLife = 1E4;
multiplayer.userHeartBeatPeriod = 1E3;
multiplayer.trafficLife = 4E4;
multiplayer.trafficHalfLife = 2E4;
multiplayer.trafficHeartBeatPeriod = 1E4;
multiplayer.mapUpdatePeriod = 1E4;
multiplayer.myId = '';
multiplayer.lastRequest = null;
multiplayer.lastResponse = null;
multiplayer.lastJoinedCoordinates = '';
multiplayer.lastRequestTime = Date.now();
multiplayer.serverTimeOffset = null;
multiplayer.labelVisibilityRange = 5E4;
multiplayer.farVisibilityRange = 1E4;
multiplayer.lowVisibilityRange = 1E3;
multiplayer.nearVisibilityRange = 10;
multiplayer.chatMessage = '';
multiplayer.chatMessageId = 0;
multiplayer.on = !1;
multiplayer.started = !1;
multiplayer.callsignPlacemarkAltitude = 5;
multiplayer.updateFunctions = [];
multiplayer.init = function() {
    multiplayer.labelOptions = {
        default: {
            font: 'bold 12pt sans-serif',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            eyeOffset: new Cesium.Cartesian3(0, 6, 0),
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            translucencyByDistance: new Cesium.NearFarScalar(200, 0.8, multiplayer.labelVisibilityRange, 0.2),
        },
        xavier: {
            font: 'bold 12pt sans-serif',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            eyeOffset: new Cesium.Cartesian3(0, 6, 0),
            fillColor: Cesium.Color.fromCssColorString('#0090cc'),
            outlineColor: Cesium.Color.fromCssColorString('#001d4a'),
            outlineWidth: 2,
            translucencyByDistance: new Cesium.NearFarScalar(200, 0.8, multiplayer.labelVisibilityRange, 0.2),
        },
        premium: {
            font: 'bold 12pt sans-serif',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            eyeOffset: new Cesium.Cartesian3(0, 6, 0),
            fillColor: Cesium.Color.fromCssColorString('#ffc107'),
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            translucencyByDistance: new Cesium.NearFarScalar(200, 0.8, multiplayer.labelVisibilityRange, 0.2),
        },
        traffic: {
            font: 'bold 11pt sans-serif',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            eyeOffset: new Cesium.Cartesian3(0, 6, 0),
            fillColor: Cesium.Color.fromCssColorString('#79abbd'),
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 1,
            translucencyByDistance: new Cesium.NearFarScalar(200, 0.8, multiplayer.labelVisibilityRange, 0.2),
        },
    };
    multiplayer.iconOptions = {
        premium: {
            image: multiplayer.premiumIconUrl,
            horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            eyeOffset: new Cesium.Cartesian3(0, 6, 0),
            pixelOffset: new Cesium.Cartesian2(-25, 1),
            translucencyByDistance: new Cesium.NearFarScalar(200, 0.8, multiplayer.labelVisibilityRange, 0.2),
            width: 25,
            height: 25,
        },
        xavier: {
            image: multiplayer.captainIconUrl,
            horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            eyeOffset: new Cesium.Cartesian3(0, 6, 0),
            pixelOffset: new Cesium.Cartesian2(-25, 1),
            translucencyByDistance: new Cesium.NearFarScalar(200, 0.8, multiplayer.labelVisibilityRange, 0.2),
            width: 25,
            height: 25,
        },
    };
};
multiplayer.stop = function() {
    multiplayer.stopUpdates();
    for (const a in multiplayer.users) { multiplayer.users[a].remove(); }
    $('.geofs-player-count').hide();
};
multiplayer.start = function() {
    multiplayer.startUpdates();
    $('.geofs-player-count').show();
};
multiplayer.startUpdates = function() {
    geofs.preferences.multiplayer && !multiplayer.started && (multiplayer.started = !0,
        multiplayer.nextUpdateTime = Date.now(),
        multiplayer.sendUpdate(),
        multiplayer.startMapUpdate());
};
multiplayer.stopUpdates = function(a) {
    clearTimeout(multiplayer.hearbeatTimeout);
    clearInterval(multiplayer.mapInterval);
    multiplayer.nextUpdateTime = null;
    multiplayer.started = !1;
};
multiplayer.getServerTime = function() {
    return Date.now() - multiplayer.serverTimeOffset;
};
multiplayer.updateUsers = function(a) {
    a = a || [];
    for (let b = 0, c = a.length; b < c; b++) {
        let d = a[b],
            e = d.id;
        if (!d.ad || geofs.preferences.adsb) {
            try {
                multiplayer.users[e] ? multiplayer.users[e].update(d) : multiplayer.users[e] = new multiplayer.User(d);
            } catch (f) {
                geofs.debug.error(f, 'exception in multiplayer.updateUsers');
            }
        }
    }
};
multiplayer.startMapUpdate = function() {
    const a = function(a) {
        multiplayer.setNbUsers(a.userCount);
        if (a && a.users) {
            a.users.sort((a, b) => {
                a = a.cs.toLowerCase();
                b = b.cs.toLowerCase();
                return a > b ? 1 : a < b ? -1 : 0;
            });
            for (var b = $('.geofs-player-list'), d = b.is(':visible'), e = 0, f = '', g = 0, h = a.users.length; g < h; g++) {
                let k = a.users[g],
                    n = k.id;
                if (multiplayer.myId != n) {
                    const v = multiplayer.users[n] || new multiplayer.User(k);
                    v.update(k, !0);
                    d && (v.callsign == 'Foo' ? e++ : f += `<li data-player="${n}">${v.callsign} (${v.aircraftName})</li>`);
                }
            }
            d && (e > 0 && (f += `<li>    ...and ${e} Foos</li>`),
                b.html(f));
        }
    };
    clearInterval(multiplayer.mapInterval);
    multiplayer.mapInterval = setInterval(() => {
        geofs.ajax.post(`${geofs.multiplayerHost}/map`, null, a);
    }, multiplayer.mapUpdatePeriod);
    geofs.ajax.post(`${geofs.multiplayerHost}/map`, null, a);
};
multiplayer.update = function(a) {
    try {
        multiplayer.lastResponse && (multiplayer.updateUsers(multiplayer.lastResponse.users),
            multiplayer.lastResponse = null);
        multiplayer.nextUpdateTime && Date.now() > multiplayer.nextUpdateTime && multiplayer.sendUpdate();
        for (const b in multiplayer.visibleUsers) {
            const c = multiplayer.visibleUsers[b];
            if (c.model) {
                c.currentServerTime = multiplayer.getServerTime();
                c.elapsedTime += a;
                var d = M3.add(c.referenceCoord, M3.scale(c.correctedVelocity, c.elapsedTime));
                d[3] = fixAngle(d[3]);
                d[4] = fixAngle(d[4]);
                d[5] = fixAngle(d[5]);
                c.currentCoord = d;
                geofs.api.setModelPositionOrientationAndScale(c.model, [d[0], d[1], d[2]], [d[3], d[4], d[5]]);
            } else { d = c.lastUpdate.co; }
            geofs.api.setLabelPosition(c.label, [d[0], d[1], d[2]]);
            c.icon && c.icon.setLocation([d[0], d[1], d[2]]);
        }
    } catch (e) {
        geofs.debug.error(e, 'multiplayer.update');
    }
};
multiplayer.errorCallback = function(a) {
    multiplayer.lastRequest = null;
    multiplayer.sendUpdate();
};
multiplayer.updateCallback = function(a) {
    multiplayer.lastResponse = a;
    multiplayer.lastRequest = null;
    let b = Date.now(),
        c = b - multiplayer.lastRequestTime;
    multiplayer.avgPing = exponentialSmoothing('avgPing', c).toPrecision(2);
    multiplayer.minPing = Math.min(multiplayer.minPing, c).toPrecision(2);
    multiplayer.serverTimeOffset = exponentialSmoothing('serverTimeOffset', b - (a.serverTime + c / 2), null, 0.01);
    c = clamp(multiplayer.minUpdateDelay - c, 0, multiplayer.minUpdateDelay);
    multiplayer.myId = a.myId || null; 
    multiplayer.chatMessageId = a.lastMsgId;
    multiplayer.started && (multiplayer.nextUpdateTime = b + c);
    if (a.chatMessages) {
        for (b = 0,
            c = a.chatMessages.length; b < c; b++) {
            const d = a.chatMessages[b];
            geofs.userRecord.muteList[d.acid] || ui.chat.publish(d);
        }
    }
};
multiplayer.sendUpdate = function() {
    try {
        if (!multiplayer.lastRequest && !flight.recorder.playing) {
            let a = geofs.aircraft.instance,
                b = Date.now();
            multiplayer.lastRequestTime = b;
            let c = $.merge($.merge([], a.llaLocation), a.htr),
                d = V3.scale(xyz2lla(a.rigidBody.getLinearVelocity(), a.llaLocation), 0.001),
                e = $.merge(d, a.htrAngularSpeed),
                f = {
                    acid: geofs.userRecord.id,
                    sid: geofs.userRecord.sessionId,
                    id: multiplayer.myId,
                    ac: a.aircraftRecord.id,
                    co: c,
                    ve: e,
                    st: {
                        gr: a.groundContact,
                        as: Math.round(geofs.animation.values.kias),
                    },
                    ti: multiplayer.getServerTime(),
                    m: multiplayer.chatMessage,
                    ci: multiplayer.chatMessageId,
                };
            multiplayer.chatMessage = '';
            multiplayer.lastRequest = geofs.ajax.post(`${geofs.multiplayerHost}/update`, f, multiplayer.updateCallback, multiplayer.errorCallback);
        }
    } catch (g) {
        geofs.debug.error(g, 'multiplayer.sendUpdate');
    }
};
multiplayer.User = function(a) {
    const b = a.id;
    multiplayer.users[b] = this;
    this.id = b;
    this.acid = a.acid;
    this.callsign = geofs.userRecord.muteList && !geofs.userRecord.muteList[this.id] ? a.cs : '';
    ui.mapInstance && ui.mapInstance.addPlayerMarker(b, a.ad ? 'traffic' : null, this.callsign);
    this.aircraft = null;
    this.lod = 0;
    this.model = this.lastUpdate = null;
    this.visibleGear = !0;
    this.currentServerTime = multiplayer.getServerTime();
    this.lastHeartbeatTime = Date.now();
    this.isTraffic = a.ad;
    this.updated = !0;
    this.heartBeat();
};
multiplayer.User.prototype = {
    heartBeat() {
        let a = this,
            b = Date.now(),
            c = b - this.lastHeartbeatTime;
        if (this.updated) {
            this.updated = !1,
                this.lastHeartbeatTime = b;
        } else if (c > (this.isTraffic ? multiplayer.trafficHalfLife : multiplayer.userHalfLife) && this.removeModel(),
            c > (this.isTraffic ? multiplayer.trafficLife : multiplayer.userLife)) {
            this.remove();
            return;
        }
        clearTimeout(this.heartBeatTimeout);
        this.heartBeatTimeout = setTimeout(() => {
            a.heartBeat();
        }, this.isTraffic ? multiplayer.trafficHeartBeatPeriod : multiplayer.userHeartBeatPeriod);
    },
    update(a, b) {
        this.updateAircraftName(a);
        if (!this.lastUpdate) {
            if (this.lastUpdate = $.extend({}, a),
                b) { var c = !0; } else { return; }
        }
        if (!(a.ti - this.lastUpdate.ti <= 0) || c) {
            if (ui.mapInstance && ui.mapInstance.mapActive && ui.mapInstance.updatePlayerMarker(a.id, a.co, this.callsign, a.ad ? 'traffic' : null, this.aircraftName, this.lastUpdate.st.as),
                this.updated = !0, !b) {
                this.lastUpdate = $.extend({}, a);
                this.updateModel(a);
                if (this.model) {
                    this.lastUpdate.ad && this.lastUpdate.co[2] != 0 && !this.lastUpdate.st.gr && (this.lastUpdate.co[2] += EGM96_TO_WGS84);
                    this.visibleGear != this.lastUpdate.st.gr && geofs.api.setNodeVisibility(geofs.api.getModelNode(this.model, 'gear'), this.lastUpdate.st.gr) && (this.visibleGear = this.lastUpdate.st.gr);
                    this.elapsedTime = this.currentServerTime - this.lastUpdate.ti;
                    this.correctedVelocity = M3.dup(this.lastUpdate.ve);
                    var d = this.elapsedTime;
                    this.currentCoord && (b = M3.add(this.lastUpdate.co, M3.scale(this.lastUpdate.ve, this.elapsedTime)),
                        a = M3.sub(b, this.currentCoord),
                        a[3] = fixAngle(a[3]),
                        a[4] = fixAngle(a[4]),
                        a[5] = fixAngle(a[5]),
                        b = Math.abs(V3.length(lla2xyz(a, b))),
                        c = Math.max(Math.abs(a[3]), Math.abs(a[4]), Math.abs(a[5])),
                        this.lastUpdate.ad ? b > 5E3 || c > 30 ? (this.currentCoord = null,
                            this.deviationFix = [0, 0, 0, 0, 0, 0]) : (this.deviationFix = M3.scale(a, 1E-5),
                            this.correctedVelocity = M3.add(this.correctedVelocity, this.deviationFix)) : b > 40 || c > 30 ? this.deviationFix = this.currentCoord = null : (b = 10 * multiplayer.minUpdateDelay,
                            this.deviationFix = M3.scale(a, 1 / b),
                            this.correctedVelocity = M3.add(this.correctedVelocity, this.deviationFix)));
                    this.currentCoord ? (this.elapsedTime = 0,
                        this.referenceCoord = this.currentCoord) : this.referenceCoord = this.lastUpdate.co;
                }
                geofs.debug.on && $('.debugAicraftId').val() == this.id && $('.debugMultiplayerData').html(`elapsed time: ${d}<br/>velocity co/s: ${1E3 * V3.length(this.lastUpdate.ve)}<br/>time: ${this.lastUpdate.ti}<br/>LOD: ${this.lod}`);
                this.currentCoord = null;
            }
        }
    },
    getLOD(a) {
        this.distance = geofs.utils.llaDistanceInMeters(this.currentCoord || a.co, geofs.aircraft.instance.llaLocation, geofs.aircraft.instance.llaLocation);
        if (this.distance > multiplayer.nearVisibilityRange) {
            if (this.distance < multiplayer.farVisibilityRange) { return this.distance > multiplayer.lowVisibilityRange ? 2 : 1; }
            if (this.distance < multiplayer.labelVisibilityRange) { return 3; }
        }
        return 0;
    },
    updateAircraftName(a) {
        this.aircraft == a.ac && this.aircraftName || (this.aircraft = a.ac,
            this.aircraftName = geofs.aircraftList[this.aircraft] ? geofs.aircraftList[this.aircraft].name : 'unknown',
            this.lod = null,
            this.models = []);
    },
    updateModel(a) {
        let b = this.getLOD(a);
        (!this.models || this.models.length == 0) && b > 0 && b < multiplayer.numberOfLOD && (this.models = multiplayer.loadModels(a.ac));
        if (b != this.lod) {
            this.removeModel();
            const c = b - 1;
            this.models.length > c && c >= 0 ? (this.model = this.models[c],
                geofs.api.addModelToWorld(this.model),
                multiplayer.visibleUsers[this.id] = this) : b == multiplayer.numberOfLOD && (multiplayer.visibleUsers[this.id] = this);
            this.lod = b;
        }
        if (this.premium != a.p || this.callsign != a.cs) {
            this.premium = a.p,
                this.callsign = a.cs,
                this.removeCallsign();
        }
        this.label || (b = a.p ? 'premium' : 'default',
            b = this.isTraffic ? 'traffic' : b,
            b = a.acid == 1 ? 'xavier' : b,
            this.addCallsign(this.callsign, b));
    },
    addCallsign(a, b) {
        this.label = geofs.api.addLabel(a, null, multiplayer.labelOptions[b]);
        multiplayer.iconOptions[b] && (a = $.extend({}, multiplayer.iconOptions[b], {
                pixelOffset: new Cesium.Cartesian2(-(4 * a.length + 5), 2),
            }),
            this.icon = new geofs.api.billboard(null, null, a));
    },
    removeCallsign() {
        geofs.api.removeLabel(this.label);
        this.label = null;
        this.icon && (this.icon.destroy(),
            this.icon = null);
    },
    removeModel() {
        geofs.api.removeModelFromWorld(this.model);
        this.lod = this.model = null;
        this.removeCallsign();
        delete multiplayer.visibleUsers[this.id];
    },
    remove() {
        clearTimeout(this.heartBeatTimeout);
        this.removeModel();
        if (this.models) {
            for (let a = 0; a < this.models.length; a++) { geofs.api.destroyModel(this.models[a]); }
        }
        this.models = [];
        ui.mapInstance && ui.mapInstance.deletePlayerMarker(this.id);
        delete multiplayer.users[this.id];
    },
    getCoordinates() {
        return this.lastUpdate.co;
    },
    isOnGround() {
        return this.lastUpdate.st.gr;
    },
};
multiplayer.loadModels = function(a) {
    const b = [];
    if (geofs.aircraftList[a]) {
        let c = ['multiplayer.glb', 'multiplayer-low.glb'];
        geofs.aircraftList[a].multiplayerFiles && (c = geofs.aircraftList[a].multiplayerFiles.split(','));
        const d = geofs.url + geofs.aircraftList[a].path + c[0];
        a = geofs.url + geofs.aircraftList[a].path + c[1];
        b.push(geofs.loadModel(d, {
            justLoad: !0,
            castShadows: !0,
        }));
        b.push(geofs.loadModel(a, {
            justLoad: !0,
            castShadows: !0,
        }));
    }
    return b;
};
multiplayer.setNbUsers = function(a) {
    --a;
    multiplayer.nbUsers != a && ($('.geofs-player-count').html(`${a} players online`),
        multiplayer.nbUsers = a);
};
multiplayer.setChatMessage = function(a) {
    multiplayer.chatMessage = a;
};
export default multiplayer;