import geofs from '../geofs';
import { V3 } from '../utils/utils';
import Object3D from '../modules/Object3D';
import audio from '../modules/audio';
import ui from '../ui/ui'
import controls from '../modules/controls'
import { list } from "../utils/AircraftList"
import rigidBody from '../modules/rigidBody'
import camera from '../modules/camera'
import instruments from '../modules/instruments'
import {
    DEGREES_TO_RAD,
    RAD_TO_DEGREES,
    PI,
    TWO_PI,
    HALF_PI,
    AXIS_TO_INDEX,
    DEFAULT_AIRFOIL_ASPECT_RATIO,
    AXIS_TO_VECTOR
} from "../utils/utils"
var aircraft = {
    default: 1,
};
var aircraftList = list
aircraft.Aircraft = function(a) {
    aircraft.instance = this;
    this.engine = {}; // rpm,on,
    this.engine.rpm = 0;
    this.engine.on = !0;
    this.brakesOn = !1;
    this.groundContact = !0;
    this.lastLlaLocation = this.llaLocation = [a[0], a[1], a[2]];
    this.collResult = {
        location: [0, 0, 0],
        normal: [0, 0, 1],
    };
    this.relativeAltitude = 0;
    this.htr = [0, 0, 0];
    this.htrAngularSpeed = [0, 0, 0];
    this.veldir = [0, 0, 0];
    this.trueAirSpeed = 0;
    geofs.animation.resetValues({
        altitude: 0,
        altitudeMeters: 0,
        prop: 0,
        throttle: 0,
        yaw: 0,
        pitch: 0,
        roll: 0,
        atilt: 0,
        aroll: 0,
        night: 0,
        cameraAircraftDistance: 0,
        kias: 0,
        optionalAnimatedPartPosition: 0,
        turnrate: 0
    });
    this.animationValue = geofs.animation.values;
    this.reset();
};
aircraft.Aircraft.prototype.getCurrentCoordinates = function() {
    const a = [];
    a[0] = this.llaLocation[0];
    a[1] = this.llaLocation[1];
    a[2] = this.llaLocation[2];
    a[2] < 0.5 || this.groundContact ? (this.groundContact = !0,
        a[2] = 0) : a[4] = !0;
    a[3] = aircraft.instance.htr[0];
    return a;
};
aircraft.Aircraft.prototype.change = function(a, b) { //点击改变飞机
    a = a || this.aircraftRecord.id;
    geofs.doPause(1);
    this.load(a, this.getCurrentCoordinates(), b);
    geofs.api.analytics.event('aircraft', aircraftList[a].name);
};
aircraft.Aircraft.prototype.addShadow = function() { //添加影子
    this.removeShadow();
    if (this.aircraftRecord) {
        let a = this.aircraftRecord.fullPath + (this.setup.shadowFile || 'shadow.glb'),
            b = V3.scale(this.setup.shadowBox, this.setup.scale);
        b[2] = 0;
        this.shadow = new geofs.shadow(a, b);
    }
};
aircraft.Aircraft.prototype.removeShadow = function() {
    this.shadow && (this.shadow.destroy(),
        this.shadow = null);
};
aircraft.Aircraft.prototype.loadDefault = a => { //显示自定义通知
    a && ui.notification.show(a);
    aircraft.instance.change(aircraft.default);
};
aircraft.Aircraft.prototype.parseRecord = function(a) {
    try {

        const b = $.parseJSON(a);
        this.aircraftRecord = b;
        if (b.definition) {
            const c = atob(b.definition);
            var d = b.isCommunity ? $.parseJSON(c)[0] : eval(c)[0];
        }
        if (b.error) {
            this.loadDefault(b.error);
            return;
        }
    } catch (e) {
        this.loadDefault(`Incorrect aircraft definition file: ${e.message}`);
        return;
    }
    return d;
};
aircraft.Aircraft.prototype.load = (a, b, c) => { //载入飞机的json，配置文件
    $.ajax(aircraftList[a] && aircraftList[a].local ? `${aircraftList[a].path}aircraft.json` : `${geofs.url}/models/aircraft/load.php`, {
        data: {
            id: a,
        },
        dataType: 'text',
        success(d, e, f) {
            // @ts-ignore
            if (e !== 'error') {
                if (aircraftList[a].local && (d = JSON.stringify({
                        id: a,
                        name: aircraftList[a].name,
                        fullPath: aircraftList[a].path,
                        isPremium: !1,
                        isCommunity: !1,
                        definition: btoa(d),
                    })),
                    d = aircraft.instance.parseRecord(d)) {
                    aircraftList[a].local || (aircraft.instance.aircraftRecord.fullPath = geofs.url + aircraft.instance.aircraftRecord.fullPath),
                        aircraft.instance.id = a,

                        aircraft.instance.init(d, b, c);

                }
            } else { aircraft.instance.loadDefault('Could not load aircraft file'); }
        },
        error(b, c, f) {
            a != aircraft.default && aircraft.instance.loadDefault(`Could not load aircraft file${f}`);
        },
    });
};
aircraft.Aircraft.prototype.init = function(a, b, c) { //初始化，
    this.setup = a;
    this.controllers = {
        pitch: {
            recenter: !1,
            sensitivity: 1,
            ratio: 1,
        },
        roll: {
            recenter: !0,
            sensitivity: 1,
            ratio: 1,
        },
        yaw: {
            recenter: !0,
            sensitivity: 1,
            ratio: 1,
        },
    };
    this.unloadAircraft();
    this.parts = {};
    this.airfoils = [];
    this.engines = [];
    this.balloons = [];
    this.wheels = [];
    this.collisionPoints = [];
    this.lights = [];
    this.currentAltitudeTest = {};
    this.pastAltitudeTest = {};
    this.setup.scale = this.setup.scale || 1;
    this.setup.startupTime = this.setup.startupTime || 1;
    this.setup.com = this.setup.com || [0, 0, 0];
    this.setup.startAltitude *= this.setup.scale;
    this.setup.cockpitScaleFix = this.setup.cockpitScaleFix || 1;
    this.setup.motionSensitivity = this.setup.motionSensitivity || 1;
    for (var d in this.setup.cameras) {
        a = this.setup.cameras[d],
            a.distance *= this.setup.scale,
            a.position && (a.position = V3.scale(a.position, this.setup.scale));
    }
    for (d = 0; d < this.setup.parts.length; d++) { this.parts[this.setup.parts[d].name] = this.setup.parts[d]; }
    this.parts.root || (d = {
            name: 'root',
            position: this.setup.com || [0, 0, 0],
        },
        this.setup.parts.push(d),
        this.parts.root = d);
    geofs.isApp && (this.parts.camera = {
            name: 'camera',
            position: [0.25, 0, 0],
        },
        this.parts.camera.object3d = new Object3D(this.parts.camera));
    this.addParts(this.setup.parts, this.aircraftRecord.fullPath, this.setup.scale);
    this.object3d = this.parts.root.object3d;
    d = this.boundingSphereRadius = 0;
    for (a = this.collisionPoints.length; d < a; d++) { this.boundingSphereRadius = Math.max(this.boundingSphereRadius, V3.length(this.collisionPoints[d])); }
    this.boundingSphereRadius *= 1.5;
    for (d in this.setup.contactProperties) {
        a = this.setup.contactProperties[d],
            a.lockSpeed = a.lockSpeed || 0.01;
    }
    this.object3d.compute(this.llaLocation);
    this.object3d.render(this.llaLocation);
    this.rigidBody || (this.rigidBody = new rigidBody());
    this.rigidBody.setMassProps(this.setup.mass, this.setup.tensorFactor);
    this.setup.RPM2PropAS = this.setup.driveRatio / 60 * 360;
    this.engine.invRPMRange = 1 / (this.setup.maxRPM - this.setup.minRPM);
    (geofs.preferences.graphics.simpleShadow || geofs.preferences.graphics.forceSimpleShadow) && this.addShadow();
    this._cockpitLoaded = !1;
    c || (audio.init(this.setup.sounds),
        instruments.init(this.setup.instruments),
        controls.reset(),
        camera.reset());
    geofs.preferences.aircraft = this.aircraftRecord.id;
    this.setup.autopilot || controls.autopilot.turnOff();
    geofs.flyTo(b, !0);
};
aircraft.Aircraft.prototype.loadCockpit = function() { //驾驶舱信息初始化
    if (!this._cockpitLoaded) {
        if (aircraft.instance.setup.cockpitModel) {
            const a = aircraft.instance.aircraftRecord.id;
            $.ajax(aircraftList[a].local ? `${aircraftList[a].path}cockpit/cockpit.json` : `${geofs.url}/models/aircraft/load.php`, {
                data: {
                    id: a,
                    cockpit: !0,
                },
                dataType: 'text',
                success(b, c) {
                    aircraftList[a].local && (b = JSON.stringify({
                        id: a,
                        name: aircraftList[a].name,
                        fullPath: aircraftList[a].path,
                        isPremium: !1,
                        isCommunity: !1,
                        definition: btoa(b),
                    }));
                    if (b = aircraft.instance.parseRecord(b)) {
                        aircraft.instance.cockpitSetup = b,
                            aircraft.instance._cockpitLoaded = !0,
                            aircraftList[a].local || (aircraft.instance.aircraftRecord.fullPath = geofs.url + aircraft.instance.aircraftRecord.fullPath),
                            aircraft.instance.addParts(b.parts, `${aircraft.instance.aircraftRecord.fullPath}cockpit/`, aircraft.instance.cockpitSetup.scale),
                            instruments.rescale(),
                            aircraft.instance.setup.cockpitScaleFix && aircraft.instance.fixCockpitScale(aircraft.instance.setup.cockpitScaleFix),
                            aircraft.instance.object3d.compute(aircraft.instance.llaLocation),
                            aircraft.instance.placeParts(),
                            aircraft.instance.render();
                    }
                },
            });
        } else { aircraft.instance._cockpitLoaded = !0; }
    }
};
aircraft.Aircraft.prototype.addParts = (a, b, c) => { //添加飞机组成，共 body  leftWing rightWing horizontalStab  verticalStab  aileronleft 
    // aileronright   elevator  rudder   gearleft  wheelleft   gearright wheelright  tailwheel   engine   prop   propblur  
    c = c || 1;
    for (var d = 0; d < a.length; d++) {
        var e = a[d];
        if (e.include) {
            var f = geofs.includes[e.include];
            e = $.extend(e, f[0]);
            for (var g = 1; g < f.length; g++) {
                var h = $.extend({}, f[g], {
                    parent: e.name,
                });
                h.name = e.name + h.name;
                a.push(h);
            }
        }
    }
    for (d = 0; d < a.length; d++) {
        e = a[d];
        e.points = e.points || {};
        e.type = e.type || !1;
        e.brakesController = e.brakesController || !1;
        e.animations = e.animations || [];
        aircraft.instance.parts[e.name] = e;
        aircraft.instance.addOffsets(e, c);
        e.forceDirection && (e.forceDirection = AXIS_TO_INDEX[e.forceDirection]);
        e.rotation && (e.rotation = V3.toRadians(e.rotation));
        e.scale = e.scale || [1, 1, 1];
        e.scale = V3.scale(e.scale, c);
        e.originalScale = e.scale;
        e.model && (f = e.model,
            b && e.model[0] != '/' && !e.include && (f = b + e.model),
            e['3dmodel'] = geofs.loadModel(f, {
                castShadows: e.noCastShadows ? !1 : !0,
                receiveShadows: e.noReceiveShadows ? !1 : !0,
            }));
        e.type == 'GlassPanel' && (f = new geofs.GlassPanel(e),
            e.entity = f.entity,
            instruments.add(f, e.name));
        e.light && (e.lightBillboard = new geofs.light(null, e.light, {
                scale: 0.2,
            }),
            aircraft.instance.lights.push(e));
        e.object3d = new Object3D(e);
        e.suspension && (e.suspension.length ? (e.suspension.origin = [e.collisionPoints[0][0], e.collisionPoints[0][1], e.collisionPoints[0][2] + e.suspension.length],
                f = e.suspension.length) : (e.suspension.origin = [e.collisionPoints[0][0], e.collisionPoints[0][1], 0],
                f = -e.collisionPoints[0][2]),
            e.suspension.restLength = f,
            e.suspension.motion == 'rotation' ? (f = V3.length(e.collisionPoints[0]),
                f = Math.atan2(e.collisionPoints[0][0] / f, e.collisionPoints[0][2] / f),
                f = {
                    type: 'rotate',
                    axis: e.suspension.axis || 'Y',
                    value: `${e.name}Suspension`,
                    ratio: (f < 0 ? f + HALF_PI : f - HALF_PI) * RAD_TO_DEGREES * (e.suspension.ratio || 1),
                }) : f = {
                type: 'translate',
                axis: e.suspension.axis || 'Z',
                value: `${e.name}Suspension`,
                ratio: e.suspension.ratio || 1,
            },
            e.animations.push(f),
            e.suspension.hardPoint = e.suspension.hardPoint || 0.5,
            e.points.suspensionOrigin = V3.dup(e.suspension.origin));
        for (g = 0; g < e.animations.length; g++) {
            f = e.animations[g],
                f.ratio = f.ratio || 1,
                f.offset = f.offset || 0,
                f.currentValue = null,
                f.delay && (f.ratio /= 1 - Math.abs(f.delay)),
                f.type == 'rotate' && (h = f.method || 'rotate',
                    f.frame == 'parent' && (h = 'rotateParentFrame'),
                    f.rotationMethod = e.object3d[h + f.axis]),
                f.type == 'translate' && (geofs.isArray(f.axis) || (f.axis = AXIS_TO_VECTOR[f.axis]));
        }
        e.type == 'wheel' && (e.radius = e.radius || 1,
            e.arcDegree = e.radius * TWO_PI / 360,
            e.angularVelocity = 0,
            aircraft.instance.wheels.push(e));
        e.type == 'airfoil' && (aircraft.instance.airfoils.push(e),
            e.stalls = e.stalls || !1,
            e.stallIncidence = e.stallIncidence || 12,
            e.zeroLiftIncidence = e.zeroLiftIncidence || 16,
            e.aspectRatio = e.aspectRatio || DEFAULT_AIRFOIL_ASPECT_RATIO,
            e.aspectRatioCoefficient = e.aspectRatio / e.aspectRatio + 2);
        e.type == 'engine' && (e.rpm = 0,
            aircraft.instance.setup.originalInertia = aircraft.instance.setup.engineInertia,
            aircraft.instance.engines.push(e));
        e.type == 'balloon' && (e.temperature = e.initialTemperature || 0,
            e.coolingSpeed = e.coolingSpeed || 0,
            aircraft.instance.balloons.push(e));
        if (e.collisionPoints) {
            for (f = e.collisionPoints,
                g = aircraft.instance.setup.contactProperties[e.type],
                h = 0; h < f.length; h++) {
                f[h].part = e,
                    f[h].contactProperties = g,
                    aircraft.instance.collisionPoints.push(f[h]);
            }
        }
        e.controller && (aircraft.instance.controllers[e.controller.name] = e.controller);
    }
    for (d = 0; d < a.length; d++) {
        e = a[d],
            e.name != 'root' && (e.parent || (e.parent = 'root'),
                aircraft.instance.parts[e.parent].object3d.addChild(e.object3d)),
            e.node && e.object3d.setModel(e.object3d.findModelInAncestry());
    }
};
aircraft.Aircraft.prototype.setVisibility = function(a) {
    this.object3d && this.object3d.setVisibility(a);
};
aircraft.Aircraft.prototype.unloadAircraft = function() {
    for (var a in aircraft.instance.parts) {
        aircraft.instance.parts[a].object3d && (aircraft.instance.parts[a].object3d.destroy(),
            delete aircraft.instance.parts[a].object3d);
    }
    aircraft.instance.parts = null;
    this.removeShadow();
    if (aircraft.instance.lights) {
        a = 0;
        for (let b = aircraft.instance.lights.length; a < b; a++) { aircraft.instance.lights[a].lightBillboard.destroy(); }
    }
};
aircraft.Aircraft.prototype.reset = function(a) {
    this.crashNotified = this.crashed = !1;
    this.groundContact = a;
    this.pastAltitudeTest = {};
    this.currentAltitudeTest = {};
    this.elevationAtPreviousLocation = 0;
    for (var b in this.collisionPoints) {
        this.collisionPoints[b].lastGroundAltitude = null,
            this.collisionPoints[b].part.contact = null;
    }
    a ? (geofs.animation.values.gearPosition = 0,
        controls.gear.position = 0,
        controls.gear.target = 0) : (geofs.animation.values.gearPosition = 1,
        controls.gear.position = 1,
        controls.gear.target = 1);
    this.rigidBody && this.rigidBody.reset();
    for (b in this.parts) {
        a = this.parts[b];
        a.object3d && a.object3d.reset();
        if (a.animations) {
            for (let c = 0; c < a.animations.length; c++) { a.animations[c].currentValue = null; }
        }
        a.type == 'wheel' && (a.angularVelocity = 0.01,
            a.oldAngularVelocity = 0.01);
    }
    this.engine.on = !0;
    if (this.engines) {
        for (b = 0; b < this.engines.length; b++) { this.engines[b].rpm = this.setup.minRPM; }
    }
    this.engine.rpm = 0;
};
aircraft.Aircraft.prototype.place = function(a, b) {
    this.lastLlaLocation = this.llaLocation = a;
    b && (this.object3d.reset(),
        b = V3.toRadians(b),
        this.object3d.setInitiallRotation([b[1], b[2], b[0]]));
    this.placeParts();
};
aircraft.Aircraft.prototype.placeParts = function(a) {
    a = a || aircraft.instance.parts;
    for (const b in a) { this.placePart(a[b]); }
};
aircraft.Aircraft.prototype.placePart = a => {
    if (a.animations) {
        a.object3d.resetAnimatedTransform();
        for (let b = 0, c = a.animations.length; b < c; b++) {

            const d = a.animations[b];
            let e = geofs.animation.filter(d);

            switch (d.type) {
                case 'rotate':
                    e *= DEGREES_TO_RAD;
                    d.rotationMethod.call(a.object3d, e);
                    e = null;
                    break;
                case 'scale':
                    let f = V3.add(a.originalScale, V3.scale(d.axis, e));
                    a.object3d.setScale(f);
                    break;
                case 'translate':
                    a.object3d.translate(V3.scale(d.axis, e));
                    e = null;
                    break;
                case 'show':
                    e <= 0 && a.object3d.visible && a.object3d.setVisibility(!1);
                case 'justshow':
                    e > 0 && (a.object3d.visible || a.object3d.setVisibility(!0));
                    break;
                case 'hide':
                    e <= 0 && !a.object3d.visible && a.object3d.setVisibility(!0);
                case 'justhide':
                    e > 0 && a.object3d.visible && a.object3d.setVisibility(!1);
                    break;
                case 'sound':
                    e > 0 ? d.playing || (d.playing = !0,
                        f = () => {
                            audio.playSoundLoop(d.name, d.loop);
                        },
                        d.retard ? (clearTimeout(d.timeOut),
                            d.timeOut = setTimeout(f, d.retard)) : f()) : d.playing && (clearTimeout(d.timeOut),
                        audio.stopSoundLoop(d.name),
                        d.playing = !1);
                    break;
                case 'property':
                    a[d.name] = e;
            }
            d.currentValue = e;
        }
    }
};
aircraft.Aircraft.prototype.render = function() {
    this.object3d.render(this.llaLocation);
    this.shadow && this.shadow.setLocationRotation(this.llaLocation, this.htr);
};
aircraft.Aircraft.prototype.startEngine = function() {
    this.engine.on || !0 === aircraft.instance.crashed || (this.engine.on = !0,
        this.engine.startup = !0,
        aircraft.instance.setup.engineInertia = 2 / this.setup.startupTime,
        setTimeout(() => {
            aircraft.instance.engine.startup = !1;
            aircraft.instance.setup.engineInertia = aircraft.instance.setup.originalInertia;
        }, 1E3 * this.setup.startupTime),
        audio.playStartup());
};
aircraft.Aircraft.prototype.stopEngine = function() {
    this.engine.on && (aircraft.instance.setup.engineInertia = 2 / (this.setup.shutdownTime || 1),
        controls.throttle = 0,
        this.engine.on = !1,
        audio.playShutdown());
};
aircraft.Aircraft.prototype.addOffsets = (a, b) => {
    a.position && !a.doNotScalePosition && (a.position = V3.scale(a.position, b));
    a.points.forceSourcePoint && (a.points.forceSourcePoint = V3.scale(a.points.forceSourcePoint, b));
    if (a.collisionPoints) {
        for (var c = 0; c < a.collisionPoints.length; c++) { a.collisionPoints[c] = V3.scale(a.collisionPoints[c], b); }
    }
    if (a.animations) {
        for (c = 0; c < a.animations.length; c++) { a.animations[c].type == 'translate' && (a.animations[c].ratio *= b); }
    }
};
aircraft.Aircraft.prototype.fixCockpitScale = function(a) {
    if (a) {
        for (const b in this.parts) {
            const c = this.parts[b];
            c.model && (c.object3d.setScale(V3.scale(c.originalScale, a)),
                a == 1 ? c.object3d.setScaleOffset(null) : c.object3d.setScaleOffset(a));
        }
    }
};
aircraft.Aircraft.prototype.crash = function() {
    //检测碰撞，如果撞击地面，产生烟雾，引擎关闭
    this.engine.on = !1;
    new geofs.fx.ParticleEmitter({
        anchor: {
            worldPosition: [0, 0, 0],
        },
        duration: 2E3,
        rate: 0.01,
        life: 1E4,
        startScale: 0.05,
        endScale: 1,
        startOpacity: 0.5,
        endOpacity: 1E-4,
        texture: 'darkSmoke',
    });
};


export default aircraft;