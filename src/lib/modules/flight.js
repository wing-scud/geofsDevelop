//所有每一次完整的飞行为一次flight，可以回放上一次的飞行，回放（再次飞行）
import geofs from '../geofs'
import controls from './controls'
import weather from "./weather"
import camera from "./camera"
import ui from "../ui/ui"
import {
    clamp,
    V3,
    M33,
    M3,
    TWO_PI,
    RAD_TO_DEGREES,
    MIN_DRAG_COEF,
    fixAngle,
    DRAG_CONSTANT,
    xyz2lla,
    fixAngles,
    fixAngle360,
    METERS_TO_FEET,
    KELVIN_OFFSET,
    GAS_CONSTANT,
    GRAVITY
} from '../utils/utils';
window.flight = window.flight || {};

let currentAltitudeTestContext = {},
    pastAltitudeTestContext = {};
flight.tick = function(a, b) {
    //找到计算推力大小
    //自动驾驶通过控制最终实际空速，设置rpm-》？》/找替换
    // a,b 为随机的数》？有关于调用的 如物理延迟，没有计算意义
    //飞机组成   "elevator" -》升降舵 ，飞机的俯仰
    /**
     * flapright 襟翼 其基本效用是在飞行中增加升力、
     * "aileronleft" 副翼 飞机 转向 滚转
     * rudder 方向坨 偏航 
     */
    /**
     * 飞机的最大空速和空中和平地无区别
     */

    let c = clamp(Math.floor(b / (geofs.PHYSICS_DELTA_MS || 10)), 1, 20),
        d = a / c,
        e = 1 / a,
        aircraftInstance = geofs.aircraft.instance,
        animationValues = geofs.animation.values,
        setUp = aircraftInstance.setup,
        llaLocationHeight = aircraftInstance.llaLocation[2];
    if (flight.recorder.playing == 1) { flight.recorder.stepInterpolation(); } else {
        //大气环境 变量高度更新
        weather.atmosphere.update(aircraftInstance.llaLocation[2]);
        for (let n = 0; n < c; n++) {
            //velocity 速率 周转率
            aircraftInstance.velocity = aircraftInstance.rigidBody.v_linearVelocity; //线速度
            aircraftInstance.velocityScalar = V3.length(aircraftInstance.velocity); //缩放比例
            const v = aircraftInstance.velocityScalar * d;
            aircraftInstance.airVelocity = V3.sub(aircraftInstance.velocity, weather.currentWindVector); //空速向量
            aircraftInstance.veldir = V3.normalize(aircraftInstance.airVelocity); //归一化
            //在这将改变后的真实速度转为，然后，转为kias，作为input输入autopilot的update，然后更新 throttle，循环调用。直到？throttle=0？
            aircraftInstance.trueAirSpeed = V3.length(aircraftInstance.airVelocity); //得到长度
            var z = 0,
                A = 1,
                C = 1,
                w = setUp.zeroThrustAltitude, //0推力高度？
                y = setUp.zeroRPMAltitude; //35000 0 rpm高度？？
            w ? A = clamp(w - animationValues.altitude, 0, w) / w : y && (C = clamp(y - animationValues.altitude, 0, y) / y);
            for (var D = geofs.aircraft.instance.engines, B = D.length, t = 0; t < B; t++) {
                //不同的飞机存在多个发动机，
                //计算发动机的推力
                let instanceEngine = D[t],
                    throttle = controls.throttle,
                    Y = 1,
                    engineAnimations = instanceEngine.animations; //length=0
                if (engineAnimations) {
                    for (let ha = 0; ha < engineAnimations.length; ha++) {
                        const K = engineAnimations[ha];
                        switch (K.type) {
                            case 'throttle':
                                throttle = animationValues[K.value] * K.ratio + K.offset;
                                break;
                            case 'pitch':
                                Y = animationValues[K.value] * K.ratio + K.offset;
                        }
                    }
                }
                if (aircraftInstance.engine.on) {
                    //根据autopilot得到的需要的油门，进行加速
                    let Da = (setUp.maxRPM - setUp.minRPM) * throttle + setUp.minRPM;
                    Da *= C;
                    //engineInertia发动机惯性，惯量  instanceEngine.rpm只在这改变然后转为Ea，在转为instance.engine.rpm
                    // 6000
                    instanceEngine.rpm += (Da - instanceEngine.rpm) * setUp.engineInertia * d;
                    geofs.aircraft.instance.setup.reverse && (instanceEngine.rpm < setUp.minRPM && instanceEngine.rpm > 0 && !aircraftInstance.engine.startup && (instanceEngine.rpm = -setUp.minRPM),
                        instanceEngine.rpm > -setUp.minRPM && instanceEngine.rpm < 0 && !aircraftInstance.engine.startup && (instanceEngine.rpm = setUp.minRPM));
                } else { instanceEngine.rpm = instanceEngine.rpm < 1E-5 ? 0 : instanceEngine.rpm - instanceEngine.rpm * setUp.engineInertia * d; }
                var Ea = Math.abs(instanceEngine.rpm),
                    //发动机推力
                    ia = instanceEngine.thrust;
                //燃烧后推力
                instanceEngine.afterBurnerThrust && throttle > 0.9 && (ia = instanceEngine.afterBurnerThrust);
                instanceEngine.rpm < 0 && (ia = instanceEngine.reverseThrust ? -instanceEngine.reverseThrust : 0);
                //推力
                let Z = ia * clamp(Ea - setUp.minRPM, 0, setUp.maxRPM) * aircraftInstance.engine.invRPMRange;
                Z *= A;
                Z *= Y;
                //getWorldFrame ??作用
                const ab = instanceEngine.object3d.getWorldFrame()[instanceEngine.forceDirection];
                //产生推力，进行进行水平运动 ，
                aircraftInstance.rigidBody.applyForce(V3.scale(ab, Z), instanceEngine.points.forceSourcePoint.worldPosition);
                //z =thrust 推力
                z += Z;
            }
            B > 0 && (aircraftInstance.engine.rpm = parseInt(Ea));
            var E = 0;
            t = 0;
            //balloons 气球？？ 如果是热气球的话，运行这段代码》需要根据问题提供动力
            for (var F = geofs.aircraft.instance.balloons.length; t < F; t++) {
                let M = geofs.aircraft.instance.balloons[t],
                    bb = clamp(controls[M.controller.name], 0, 1);
                E = M.temperature;
                E += bb * M.heatingSpeed * d;
                E -= M.coolingSpeed * (E - weather.atmosphere.airTempAtAltitude) * d;
                E = clamp(E, 0, 300);
                M.temperature = E;
                aircraftInstance.rigidBody.applyForce([0, 0, (weather.atmosphere.airDensityAtAltitude - weather.atmosphere.airPressureAtAltitude / (GAS_CONSTANT * (E + KELVIN_OFFSET))) * M.volume * GRAVITY], M.points.forceSourcePoint.worldPosition);
            }
            if (aircraftInstance.trueAirSpeed > 0.01) { //拖拽因子 dragFactor
                let aa = V3.scale(aircraftInstance.veldir, -(setUp.dragFactor * aircraftInstance.trueAirSpeed * aircraftInstance.trueAirSpeed * weather.atmosphere.airDensityAtAltitude));
                //这个中心力？？
                aircraftInstance.rigidBody.applyCentralForce(aa);
                t = 0;
                //计算各个部件的力
                for (F = aircraftInstance.airfoils.length; t < F; t++) {
                    let airfoils = aircraftInstance.airfoils[t],
                        worldPosition = airfoils.points.forceSourcePoint.worldPosition,
                        cb = airfoils.object3d.getWorldFrame(),
                        G = aircraftInstance.rigidBody.getVelocityInLocalPoint(worldPosition);
                    if (airfoils.propwash) { //propwash反向偏航
                        let Fa = aircraftInstance.engine.rpm * airfoils.propwash,
                            db = V3.dot(G, aircraftInstance.object3d.worldRotation[1]);
                        G = V3.add(G, V3.scale(aircraftInstance.object3d.worldRotation[1], clamp(Fa - db, 0, Fa)));
                    }
                    G = V3.sub(G, weather.currentWindVector);
                    G = V3.sub(G, weather.thermals.currentVector);
                    airfoils.velocity = V3.length(G);
                    let ka = V3.normalize(G),
                        la = airfoils.velocity * airfoils.velocity,
                        ma = cb[airfoils.forceDirection],
                        R = -V3.dot(ma, ka),
                        eb = V3.cross(ma, ka),
                        fb = V3.rotate(ma, eb, R);
                    if (airfoils.area) {
                        let ba = R * TWO_PI;
                        if (airfoils.stalls == 1) {
                            //某一部件是否失衡
                            var ca = R * RAD_TO_DEGREES,
                                S = Math.abs(ca);
                            S > airfoils.stallIncidence && (ui.hud.stallAlarm(!0),
                                ba *= 1 - clamp(S - airfoils.stallIncidence, 0, 0.9 * airfoils.zeroLiftIncidence) / airfoils.zeroLiftIncidence);
                        }
                        //airDensityAtAltitude 密度高度
                        aa = 0.5 * la * (MIN_DRAG_COEF + DRAG_CONSTANT * ba * ba) * weather.atmosphere.airDensityAtAltitude;
                        var Ga = weather.atmosphere.airDensityAtAltitude * la * 0.5 * airfoils.area * ba;
                    } else {
                        let Ha = airfoils.liftFactor,
                            gb = airfoils.dragFactor;
                        airfoils.stalls == 1 && (ca = R * RAD_TO_DEGREES,
                            S = Math.abs(ca),
                            S > airfoils.stallIncidence && (ui.hud.stallAlarm(!0),
                                Ha *= 0.9 - clamp(S - airfoils.stallIncidence, 0, airfoils.zeroLiftIncidence) / airfoils.zeroLiftIncidence));
                        const Ia = R * la;
                        Ga = Ha * Ia * weather.atmosphere.airDensityAtAltitude;
                        aa = gb * Math.abs(Ia) * weather.atmosphere.airDensityAtAltitude;
                    }
                    //V3.scale作用，数组里每一项乘以b
                    //得到不同部件施加的某一方向的力，施加力，使其进行上升，左右运动
                    aircraftInstance.rigidBody.applyForce(V3.scale(fb, Ga), worldPosition);
                    aircraftInstance.rigidBody.applyForce(V3.scale(ka, -aa), worldPosition);
                }
            }
            var na = 0;
            aircraftInstance.groundContact = !1;
            aircraftInstance.rigidBody.applyCentralForce(aircraftInstance.rigidBody.gravityForce);
            geofs.relativeAltitude = aircraftInstance.llaLocation[2] - geofs.groundElevation; //Elevation 海拔
            if (geofs.relativeAltitude < geofs.aircraft.instance.boundingSphereRadius + v && !flight.skipCollisionResponse) {
                //collisionPoints  飞机与地面碰撞接触点
                let Ja = geofs.aircraft.instance.collisionPoints,
                    T = [],
                    U = 0;
                t = 0;
                for (F = Ja.length; t < F; t++) {
                    var p = Ja[t],
                        q = p.part;
                    q.contact = null;
                    const oa = V3.add(aircraftInstance.llaLocation, xyz2lla(p.worldPosition, aircraftInstance.llaLocation));
                    aircraftInstance.rigidBody.getVelocityInLocalPoint(p.worldPosition);
                    if (q.suspension) {
                        var P = q.points.suspensionOrigin,
                            V = geofs.getCollisionResult(oa, p.worldPosition, aircraftInstance.collResult),
                            pa = V.location[2],
                            Ka = V3.sub([P.worldPosition[0], P.worldPosition[1], P.worldPosition[2] + aircraftInstance.llaLocation[2]], [p.worldPosition[0], p.worldPosition[1], pa]),
                            hb = Math.sign(Ka[2]),
                            ib = V3.length(Ka) * hb,
                            qa = q.suspension.restLength - ib,
                            La = clamp(qa / q.suspension.restLength, 0, 1),
                            jb = La * q.suspension.restLength;
                        if (La > 0 && P.worldPosition[2] >= p.worldPosition[2]) {
                            var J = geofs.getNormalFromCollision(V, p),
                                Q = q.object3d.getWorldFrame();
                            V3.dot(J, Q[2]);
                            var u = {
                                collisionPoint: p,
                                normal: J,
                                force: q.suspension.stiffness * jb,
                                type: 'raycast',
                                contactFwdDir: V3.cross(J, V3.normalize(Q[0])),
                                contactSideDir: V3.cross(J, V3.normalize(Q[1])),
                            };
                            q.contact = u;
                            T.push(u);
                            P[2] = -qa;
                            var ra = `${q.name}Suspension`;
                            animationValues[ra] = qa;
                            q.suspension.rest = !1;
                        } else {
                            q.suspension.rest || (ra = `${q.name}Suspension`,
                                animationValues[ra] = 0,
                                P[2] = 0,
                                q.suspension.rest = !0);
                        }
                        const Ma = {};
                        Ma[q.name] = q;
                        aircraftInstance.placeParts(Ma);
                    } else {
                        V = geofs.getCollisionResult(oa, p.worldPosition, aircraftInstance.collResult);
                        pa = V.location[2];
                        const sa = pa - oa[2];
                        sa >= 0 && (Q = q.object3d.getWorldFrame(),
                            J = geofs.getNormalFromCollision(V, p),
                            U = Math.max(U, sa),
                            u = {
                                collisionPoint: p,
                                normal: J,
                                penetration: sa,
                                type: 'standard',
                                contactFwdDir: V3.cross(J, V3.normalize(Q[0])),
                                contactSideDir: V3.cross(J, V3.normalize(Q[1])),
                            },
                            q.contact = u,
                            T.push(u));
                    }
                }
                if (T.length) {
                    aircraftInstance.groundContact = !0;
                    //改变了llalocation
                    U > geofs.minPenetrationThreshold && (aircraftInstance.llaLocation[2] += U,
                        U = 0);
                    let ta = 0;
                    for (F = T.length; ta < F; ta++) {
                        u = T[ta];
                        p = u.collisionPoint;
                        q = p.part;
                        let H = p.contactProperties,
                            da = aircraftInstance.rigidBody.getVelocityInLocalPoint(p.worldPosition),
                            W = V3.dot(u.normal, da);
                        na = Math.max(na, Math.abs(W));
                        let X = 0;
                        if (u.type == 'raycast' || u.type == 'hardpoint') {
                            //applyImpulse 改变线速度
                            X = (u.force - q.suspension.damping * W) * aircraftInstance.rigidBody.mass * d,
                                X > 0 && aircraftInstance.rigidBody.applyImpulse(V3.scale(u.normal, X), p.worldPosition);
                        }
                        if ((u.type == 'standard' || u.type == 'hardpoint') && W < 0) {
                            let Na = aircraftInstance.rigidBody.computeJacobian(0, W, p.worldPosition, u.normal),
                                ua = V3.scale(u.normal, Na);
                            ua = V3.scale(ua, H.damping);
                            //applyImpulse 改变线速度
                            aircraftInstance.rigidBody.applyImpulse(ua, p.worldPosition);
                            X = Na;
                        }
                        let I = X * H.frictionCoef;
                        I = clamp(I, I, 2 * aircraftInstance.rigidBody.mass * d * H.frictionCoef);
                        if (q.type == 'wheel') {
                            let va = u.contactFwdDir,
                                wa = u.contactSideDir,
                                Oa = V3.dot(wa, da),
                                xa = V3.dot(va, da);
                            u.forwardProjVel = xa;
                            u.sideProjVel = Oa;
                            let Pa = aircraftInstance.rigidBody.computeJacobian(0, Oa, p.worldPosition, wa),
                                Qa = aircraftInstance.rigidBody.computeJacobian(0, xa, p.worldPosition, va),
                                ya = Math.abs(Pa),
                                za = Math.abs(Qa),
                                Ra = 1,
                                ea = 1;
                            Math.abs(xa) > H.lockSpeed && (ea = H.rollingFriction);
                            const Sa = q.brakesController;
                            if (Sa && za > 0) {
                                const kb = clamp(animationValues[Sa] * q.brakesControllerRatio, 0, 1);
                                ea = clamp(I / (za * H.frictionCoef), 0, 1) * kb;
                            }
                            const lb = aircraftInstance.setup.brakeDamping || 3;
                            controls.brakes > 0.05 && (ea = clamp(I / (za * H.frictionCoef * lb) * controls.brakes, 0, 1));
                            if (ya > I) {
                                var Aa = I / (ya * ya);
                                Ra = clamp(Aa, H.dynamicFriction, 1);
                            }
                            //applyImpulse 改变线速度
                            aircraftInstance.rigidBody.applyImpulse(V3.scale(wa, Pa * Ra), p.worldPosition);
                            aircraftInstance.rigidBody.applyImpulse(V3.scale(va, Qa * ea), p.worldPosition);
                        } else {
                            let Ta = V3.sub(da, V3.scale(u.normal, W)),
                                Ua = V3.normalize(Ta),
                                Va = V3.length(Ta);
                            if (Va) {
                                let Wa = aircraftInstance.rigidBody.computeJacobian(0, Va, p.worldPosition, Ua),
                                    Ba = Math.abs(Wa),
                                    Xa = 1;
                                Ba > I && (Aa = I / (Ba * Ba),
                                    Xa = clamp(Aa, H.dynamicFriction, 1));
                                //applyImpulse 改变线速度
                                aircraftInstance.rigidBody.applyImpulse(V3.scale(Ua, Xa * Wa), p.worldPosition);
                            }
                        }
                    }
                }
            }
            //此处改变了线速度 主要改变
            aircraftInstance.rigidBody.integrateVelocities(d);
            aircraftInstance.rigidBody.integrateTransform(d);
            geofs.aircraft.instance.object3d.compute(aircraftInstance.llaLocation);
            // for 循环结束
        }

        aircraftInstance.rigidBody.setCurrentAcceleration(e, a);
        aircraftInstance.placeParts();
        aircraftInstance.render();
        flight.recorder.recording == 1 && flight.recorder.record();
        //检测冲撞
        geofs.preferences.crashDetection && (na > 10 && (aircraftInstance.crashed = !0), !aircraftInstance.crashNotified && aircraftInstance.crashed && (aircraftInstance.crashNotified = !0,
            aircraftInstance.crash()));
    }
    aircraftInstance.htrAngularSpeed = V3.sub(aircraftInstance.object3d.htr, aircraftInstance.htr);
    aircraftInstance.htrAngularSpeed = fixAngles(aircraftInstance.htrAngularSpeed);
    aircraftInstance.htrAngularSpeed = V3.scale(aircraftInstance.htrAngularSpeed, 1 / b);
    aircraftInstance.htr = aircraftInstance.object3d.htr;
    let Ca = 0;
    t = 0;
    for (F = aircraftInstance.wheels.length; t < F; t++) {
        const x = aircraftInstance.wheels[t];
        x.oldAngularVelocity = x.angularVelocity;
        if (x.contact) {
            x.angularVelocity = x.contact.forwardProjVel * a / x.arcDegree;
            const Ya = x.angularVelocity / x.oldAngularVelocity;
            x.contact.forwardProjVel > 30 && Ya > 40 && new geofs.fx.ParticleEmitter({
                anchor: x.contact.collisionPoint,
                duration: 200,
                rate: 0.05,
                life: 2E3,
                startScale: 0.001,
                endScale: 0.05,
                startOpacity: 0.3,
                endOpacity: 0.001,
                startRotation: 'random',
                endRotation: 'random',
                texture: 'smoke',
            });
            Ca = Math.max(Ca, Ya);
        } else { x.angularVelocity > 0.01 && (x.angularVelocity *= 0.9); }
        const Za = `${x.name}Rotation`;
        animationValues[Za] = fixAngle360((animationValues[Za] || 0) + x.angularVelocity);
    }
    let N = aircraftInstance.llaLocation[2] * METERS_TO_FEET,
        //爬升率，以英尺为单位 ，与高度有关 N,
        //调试mb改变
        //llaLocationHeight = aircraftInstance.llaLocation[2]; ????   a 传过来的函数 参数a
        mb = 60 * (N - llaLocationHeight * METERS_TO_FEET) / a,
        nb = fixAngle(weather.currentWindDirection - aircraftInstance.htr[0]),
        ob = aircraftInstance.engine.rpm * setUp.RPM2PropAS * a;

    animationValues.maxAngularVRatio = Ca;
    animationValues.enginesOn = geofs.aircraft.instance.engine.on;
    animationValues.prop = fixAngle360(animationValues.prop + ob);
    animationValues.thrust = z;
    animationValues.rpm = aircraftInstance.engine.rpm;
    animationValues.throttle = controls.throttle;
    animationValues.pitch = controls.pitch;
    animationValues.rawPitch = controls.rawPitch;
    animationValues.roll = controls.roll;
    animationValues.yaw = controls.yaw;
    animationValues.trim = controls.elevatorTrim;
    animationValues.brakes = controls.brakes;
    animationValues.gearPosition = controls.gear.position;
    animationValues.invGearPosition = 1 - controls.gear.position;
    animationValues.gearTarget = controls.gear.target;
    animationValues.flapsValue = controls.flaps.position / controls.flaps.maxPosition;
    animationValues.flapsPosition = controls.flaps.position;
    animationValues.flapsTarget = controls.flaps.target;
    animationValues.flapsPositionTarget = controls.flaps.positionTarget;
    animationValues.flapsMaxPosition = controls.flaps.maxPosition;
    animationValues.airbrakesPosition = controls.airbrakes.position;
    animationValues.optionalAnimatedPartPosition = controls.optionalAnimatedPart.position;
    animationValues.airbrakesTarget = controls.airbrakes.target;
    animationValues.parkingBrake = geofs.aircraft.instance.brakesOn;
    animationValues.groundContact = aircraftInstance.groundContact ? 1 : 0;
    animationValues.acceleration = M33.transform(M33.transpose(aircraftInstance.object3d._rotation), aircraftInstance.rigidBody.v_acceleration);
    animationValues.accX = animationValues.acceleration[0];
    animationValues.accY = animationValues.acceleration[1];
    animationValues.accZ = animationValues.acceleration[2];
    animationValues.msDt = b;
    //acceleration 加速度
    //
    animationValues.rollingSpeed = aircraftInstance.groundContact ? aircraftInstance.velocityScalar : 0;
    //得到实际空速
    animationValues.ktas = 1.94 * aircraftInstance.trueAirSpeed;
    animationValues.kias = animationValues.ktas;
    animationValues.mach = aircraftInstance.trueAirSpeed / (331.3 + 0.606 * weather.atmosphere.airTempAtAltitude);
    animationValues.altitudeMeters = aircraftInstance.llaLocation[2];
    animationValues.altitude = N;
    animationValues.altTenThousands = N % 1E5;
    animationValues.altThousands = N % 1E4;
    animationValues.altHundreds = N % 1E3;
    animationValues.altTens = N % 100;
    animationValues.altUnits = N % 10;
    //爬升率
    animationValues.climbrate = mb;
    animationValues.aoa = ca;
    animationValues.turnrate = 60 * (aircraftInstance.htr[0] - animationValues.heading) / a;
    animationValues.heading = aircraftInstance.htr[0]; //给animationValues赋值
    animationValues.heading360 = fixAngle360(aircraftInstance.htr[0]);
    animationValues.atilt = aircraftInstance.htr[1];
    animationValues.aroll = aircraftInstance.htr[2];
    animationValues.relativeWind = nb;
    animationValues.windSpeed = weather.currentWindSpeed;
    animationValues.windSpeedLabel = `${parseInt(parseInt(weather.currentWindSpeed)*0.514)}` + ' m/s';
    animationValues.view = camera.currentView;
    animationValues.envelopeTemp = E;
    //相机具有速度
    if (camera.currentModeName == 'free' || camera.currentModeName == 'chase') {
        const $a = geofs.utils.llaDistanceInMeters(camera.lla, aircraftInstance.llaLocation);
        animationValues.cameraAircraftSpeed = (animationValues.cameraAircraftDistance - $a) / a;
        animationValues.cameraAircraftDistance = $a;
    } else {
        animationValues.cameraAircraftSpeed = 0,
            animationValues.cameraAircraftDistance = 0;
    }
};
flight.recorder = {
    tape: [],
    rate: 5,
    invRate: 0.2,
    maxLength: 1E3,
    recordingFrame: 0,
    recording: !0,
    playing: !1,
    paused: !1,
};
flight.recorder.record = function() {
    if (flight.recorder.recordingFrame < flight.recorder.rate) { flight.recorder.recordingFrame++; } else {
        let a = geofs.aircraft.instance,
            b = a.llaLocation;
        a = a.htr;
        b = {
            coord: [b[0], b[1], b[2], a[0], a[1], a[2]],
            controls: [controls.pitch, controls.roll, controls.yaw, controls.throttle, controls.gear.position, controls.flaps.position, controls.airbrakes.position, geofs.aircraft.instance.trueAirSpeed],
            state: [geofs.aircraft.instance.engine.on, geofs.aircraft.instance.rigidBody.getLinearVelocity(), geofs.aircraft.instance.rigidBody.getAngularVelocity()],
        };
        flight.recorder.tape.push(b);
        flight.recorder.tape.length > flight.recorder.maxLength && flight.recorder.tape.shift();
        flight.recorder.recordingFrame = 0;
    }
};
flight.recorder.clear = function() {
    flight.recorder.tape = [];
};
flight.recorder.startRecording = function() {
    flight.recorder.playing || (flight.recorder.recording = !0);
};
flight.recorder.stopRecording = function() {
    flight.recorder.recording = !1;
};
flight.recorder.enterPlayback = function() {
    geofs.aircraft.instance.rigidBody.saveState();
    flight.recorder.stopRecording();
    $('.geofs-recordPlayer-slider').attr('max', flight.recorder.tape.length - 2);
    flight.recorder.setStep(0);
    $('.geofs-recordPlayer-slider').on('userchange', (a, b) => {
        flight.recorder.setStep(parseInt(b), !0);
    }).on('dragstart', flight.recorder.pausePlayback).on('dragend', flight.recorder.unpausePlayback);
    $('body').addClass('geofs-record-playing');
    flight.recorder.playing = !0;
};
flight.recorder.exitPlayback = function() {
    geofs.doPause();
    flight.recorder.playing = !1;
    geofs.aircraft.instance.rigidBody.restoreState();
    flight.recorder.setStep(flight.recorder.currentStep);
    geofs.aircraft.instance.object3d.resetRotationMatrix();
    $('body').removeClass('geofs-record-playing');
    flight.recorder.startRecording();
};
flight.recorder.pausePlayback = function() {
    flight.recorder.paused = !0;
};
flight.recorder.unpausePlayback = function() {
    flight.recorder.paused = !1;
};
flight.recorder.startPlayback = function() {
    flight.recorder.playing = !0;
    geofs.undoPause();
};
flight.recorder.setStep = function(a, b) {
    a > flight.recorder.tape.length - 2 && (a = flight.recorder.tape.length - 2,
        geofs.doPause());
    a < 0 && (a = 0);
    if (!flight.recorder.tape[a]) {
        return flight.recorder.pausePlayback(), !1;
    }
    flight.recorder.currentStep = a;
    flight.recorder.currentFrame = 0;
    flight.recorder.liveRecord = $.extend({}, flight.recorder.tape[a]);
    flight.recorder.setAircraft(flight.recorder.liveRecord);
    b ? (flight.tick(1, 1),
        camera.update(0)) : $('.geofs-recordPlayer-slider').slider('value', a);
    flight.recorder.setDeltaRecord(a);
    return !0;
};
flight.recorder.setDeltaRecord = function(a) {
    let b = flight.recorder.tape,
        c = b[a];
    b = b[a + 1];
    a = M3.sub(b.coord, c.coord);
    a[3] = fixAngle(a[3]);
    a[4] = fixAngle(a[4]);
    a[5] = fixAngle(a[5]);
    c = M3.sub(b.controls, c.controls);
    a = M3.scale(a, flight.recorder.invRate);
    c = M3.scale(c, flight.recorder.invRate);
    flight.recorder.deltaRecord = {
        coord: a,
        controls: c,
    };
};
flight.recorder.stepInterpolation = function() {
    if (!flight.recorder.paused) {
        if (flight.recorder.currentFrame >= flight.recorder.rate - 1) { flight.recorder.setStep(flight.recorder.currentStep + 1); } else {
            flight.recorder.currentFrame++;
            const a = flight.recorder.liveRecord;
            a.coord = M3.add(a.coord, flight.recorder.deltaRecord.coord);
            a.coord[3] = fixAngle(a.coord[3]);
            a.coord[4] = fixAngle(a.coord[4]);
            a.coord[5] = fixAngle(a.coord[5]);
            a.controls = M3.add(a.controls, flight.recorder.deltaRecord.controls);
            flight.recorder.setAircraft(a);
        }
    }
};
flight.recorder.setAircraft = function(a) {
    let b = a.coord,
        c = [b[0], b[1], b[2]];
    b = [b[3], b[4], b[5]];
    const d = a.controls;
    controls.pitch = d[0];
    controls.roll = d[1];
    controls.yaw = d[2];
    controls.throttle = d[3];
    controls.gear.position = d[4];
    controls.flaps.position = d[5];
    controls.airbrakes.position = d[6];
    geofs.aircraft.instance.trueAirSpeed = d[7];
    a.state && (geofs.aircraft.instance.engine.on = a.state[0],
        geofs.aircraft.instance.rigidBody.setLinearVelocity(a.state[1]),
        geofs.aircraft.instance.rigidBody.setAngularVelocity(a.state[2]));
    geofs.aircraft.instance.place(c, b);
    geofs.aircraft.instance.object3d.compute(geofs.aircraft.instance.llaLocation);
    geofs.aircraft.instance.render();
};
flight.terrainElevationManagement = function() {
    const a = geofs.aircraft.instance;
    a.collResult = geofs.getCollisionResult([a.llaLocation[0], a.llaLocation[1], 0], null, null, currentAltitudeTestContext);
    a.collResult.normal = geofs.getNormalFromCollision(a.collResult, currentAltitudeTestContext);
    let b = a.collResult.location[2],
        c = geofs.getGroundAltitude(a.lastLlaLocation[0], a.lastLlaLocation[1], pastAltitudeTestContext).location[2],
        d = c - a.elevationAtPreviousLocation,
        e = !(currentAltitudeTestContext.wrongAltitude || pastAltitudeTestContext.wrongAltitude);
    flight.skipCollisionResponse = !1;
    if (Math.abs(d) > 0.2) {
        if (e) {
            if (a.absoluteStartAltitude) { geofs.cautiousWithTerrain && (a.llaLocation[2] = a.startAltitude); } else if (geofs.cautiousWithTerrain || c > a.llaLocation[2] || d < 0 && a.groundContact) { a.llaLocation[2] += d; }
        }
        geofs.cautiousWithTerrain && geofs.probeTerrain();
    }
    geofs.cautiousWithTerrain && a.absoluteStartAltitude && b + a.setup.startAltitude > a.llaLocation[2] && (a.llaLocation[2] = b + a.setup.startAltitude + 100,
        flight.skipCollisionResponse = !0);
    a.elevationAtPreviousLocation = b;
    a.lastLlaLocation = a.llaLocation;
    geofs.groundElevation = b;
};
export default flight;