

//所有每一次完整的飞行为一次flight，可以回放上一次的飞行，回放（再次飞行）
import geofs from '../geofs'
import controls from './controls'
import weather from "./weather"
import camera from "./camera"
import ui from "../ui/ui"
import { clamp,V3,M33,M3 ,TWO_PI,RAD_TO_DEGREES,MIN_DRAG_COEF,fixAngle,
    DRAG_CONSTANT,xyz2lla,fixAngles,fixAngle360,METERS_TO_FEET,KELVIN_OFFSET,GAS_CONSTANT,GRAVITY} from '../utils/utils';
    window.flight = window.flight || {};

let currentAltitudeTestContext = {},
    pastAltitudeTestContext = {};
flight.tick = function(a, b) {
    let c = clamp(Math.floor(b / (geofs.PHYSICS_DELTA_MS || 10)), 1, 20),
        d = a / c,
        e = 1 / a,
        f = geofs.aircraft.instance,
        g = geofs.animation.values,
        h = f.setup,
        k = f.llaLocation[2];
    if (flight.recorder.playing == 1) { flight.recorder.stepInterpolation(); } else {
        weather.atmosphere.update(f.llaLocation[2]);
        for (let n = 0; n < c; n++) {
            f.velocity = f.rigidBody.v_linearVelocity;
            f.velocityScalar = V3.length(f.velocity);
            const v = f.velocityScalar * d;
            f.airVelocity = V3.sub(f.velocity, weather.currentWindVector);
            f.veldir = V3.normalize(f.airVelocity);
            f.trueAirSpeed = V3.length(f.airVelocity);
            var z = 0,
                A = 1,
                C = 1,
                w = h.zeroThrustAltitude,
                y = h.zeroRPMAltitude;
            w ? A = clamp(w - g.altitude, 0, w) / w : y && (C = clamp(y - g.altitude, 0, y) / y);
            for (var D = geofs.aircraft.instance.engines, B = D.length, t = 0; t < B; t++) {
                let m = D[t],
                    O = controls.throttle,
                    Y = 1,
                    fa = m.animations;
                if (fa) {
                    for (let ha = 0; ha < fa.length; ha++) {
                        const K = fa[ha];
                        switch (K.type) {
                            case 'throttle':
                                O = g[K.value] * K.ratio + K.offset;
                                break;
                            case 'pitch':
                                Y = g[K.value] * K.ratio + K.offset;
                        }
                    }
                }
                if (f.engine.on) {
                    let Da = (h.maxRPM - h.minRPM) * O + h.minRPM;
                    Da *= C;
                    m.rpm += (Da - m.rpm) * h.engineInertia * d;
                    geofs.aircraft.instance.setup.reverse && (m.rpm < h.minRPM && m.rpm > 0 && !f.engine.startup && (m.rpm = -h.minRPM),
                        m.rpm > -h.minRPM && m.rpm < 0 && !f.engine.startup && (m.rpm = h.minRPM));
                } else { m.rpm = m.rpm < 1E-5 ? 0 : m.rpm - m.rpm * h.engineInertia * d; }
                var Ea = Math.abs(m.rpm),
                    ia = m.thrust;
                m.afterBurnerThrust && O > 0.9 && (ia = m.afterBurnerThrust);
                m.rpm < 0 && (ia = m.reverseThrust ? -m.reverseThrust : 0);
                let Z = ia * clamp(Ea - h.minRPM, 0, h.maxRPM) * f.engine.invRPMRange;
                Z *= A;
                Z *= Y;
                const ab = m.object3d.getWorldFrame()[m.forceDirection];
                f.rigidBody.applyForce(V3.scale(ab, Z), m.points.forceSourcePoint.worldPosition);
                z += Z;
            }
            B > 0 && (f.engine.rpm = parseInt(Ea));
            var E = 0;
            t = 0;
            for (var F = geofs.aircraft.instance.balloons.length; t < F; t++) {
                let M = geofs.aircraft.instance.balloons[t],
                    bb = clamp(controls[M.controller.name], 0, 1);  
                E = M.temperature;
                E += bb * M.heatingSpeed * d;
                E -= M.coolingSpeed * (E - weather.atmosphere.airTempAtAltitude) * d;
                E = clamp(E, 0, 300);
                M.temperature = E;
                f.rigidBody.applyForce([0, 0, (weather.atmosphere.airDensityAtAltitude - weather.atmosphere.airPressureAtAltitude / (GAS_CONSTANT * (E + KELVIN_OFFSET))) * M.volume * GRAVITY], M.points.forceSourcePoint.worldPosition);
            }
            if (f.trueAirSpeed > 0.01) {
                let aa = V3.scale(f.veldir, -(h.dragFactor * f.trueAirSpeed * f.trueAirSpeed * weather.atmosphere.airDensityAtAltitude));
                f.rigidBody.applyCentralForce(aa);
                t = 0;
                for (F = f.airfoils.length; t < F; t++) {
                    let r = f.airfoils[t],
                        ja = r.points.forceSourcePoint.worldPosition,
                        cb = r.object3d.getWorldFrame(),
                        G = f.rigidBody.getVelocityInLocalPoint(ja);
                    if (r.propwash) {
                        let Fa = f.engine.rpm * r.propwash,
                            db = V3.dot(G, f.object3d.worldRotation[1]);
                        G = V3.add(G, V3.scale(f.object3d.worldRotation[1], clamp(Fa - db, 0, Fa)));
                    }
                    G = V3.sub(G, weather.currentWindVector);
                    G = V3.sub(G, weather.thermals.currentVector);
                    r.velocity = V3.length(G);
                    let ka = V3.normalize(G),
                        la = r.velocity * r.velocity,
                        ma = cb[r.forceDirection],
                        R = -V3.dot(ma, ka),
                        eb = V3.cross(ma, ka),
                        fb = V3.rotate(ma, eb, R);
                    if (r.area) {
                        let ba = R * TWO_PI;  
                        if (r.stalls == 1) {
                            var ca = R * RAD_TO_DEGREES,
                                S = Math.abs(ca);
                            S > r.stallIncidence && (ui.hud.stallAlarm(!0),
                                ba *= 1 - clamp(S - r.stallIncidence, 0, 0.9 * r.zeroLiftIncidence) / r.zeroLiftIncidence);
                        }
                        aa = 0.5 * la * (MIN_DRAG_COEF + DRAG_CONSTANT * ba * ba) * weather.atmosphere.airDensityAtAltitude;
                        var Ga = weather.atmosphere.airDensityAtAltitude * la * 0.5 * r.area * ba;
                    } else {
                        let Ha = r.liftFactor,
                            gb = r.dragFactor;
                        r.stalls == 1 && (ca = R * RAD_TO_DEGREES,
                            S = Math.abs(ca),
                            S > r.stallIncidence && (ui.hud.stallAlarm(!0),
                                Ha *= 0.9 - clamp(S - r.stallIncidence, 0, r.zeroLiftIncidence) / r.zeroLiftIncidence));
                        const Ia = R * la;
                        Ga = Ha * Ia * weather.atmosphere.airDensityAtAltitude;
                        aa = gb * Math.abs(Ia) * weather.atmosphere.airDensityAtAltitude;
                    }
                    f.rigidBody.applyForce(V3.scale(fb, Ga), ja);
                    f.rigidBody.applyForce(V3.scale(ka, -aa), ja);
                }
            }
            var na = 0;
            f.groundContact = !1;
            f.rigidBody.applyCentralForce(f.rigidBody.gravityForce);
            geofs.relativeAltitude = f.llaLocation[2] - geofs.groundElevation;
            if (geofs.relativeAltitude < geofs.aircraft.instance.boundingSphereRadius + v && !flight.skipCollisionResponse) {
                let Ja = geofs.aircraft.instance.collisionPoints,
                    T = [],
                    U = 0;
                t = 0;
                for (F = Ja.length; t < F; t++) {
                    var p = Ja[t],
                        q = p.part;
                    q.contact = null;  
                    const oa = V3.add(f.llaLocation, xyz2lla(p.worldPosition, f.llaLocation));
                    f.rigidBody.getVelocityInLocalPoint(p.worldPosition);
                    if (q.suspension) {
                        var P = q.points.suspensionOrigin,
                            V = geofs.getCollisionResult(oa, p.worldPosition, f.collResult),
                            pa = V.location[2],
                            Ka = V3.sub([P.worldPosition[0], P.worldPosition[1], P.worldPosition[2] + f.llaLocation[2]], [p.worldPosition[0], p.worldPosition[1], pa]),
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
                            g[ra] = qa;
                            q.suspension.rest = !1;
                        } else {
                            q.suspension.rest || (ra = `${q.name}Suspension`,
                                g[ra] = 0,
                                P[2] = 0,
                                q.suspension.rest = !0);
                        }
                        const Ma = {};
                        Ma[q.name] = q;
                        f.placeParts(Ma);
                    } else {
                        V = geofs.getCollisionResult(oa, p.worldPosition, f.collResult);
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
                    f.groundContact = !0;
                    U > geofs.minPenetrationThreshold && (f.llaLocation[2] += U,
                        U = 0);
                    let ta = 0;
                    for (F = T.length; ta < F; ta++) {
                        u = T[ta];
                        p = u.collisionPoint;
                        q = p.part;
                        let H = p.contactProperties,
                            da = f.rigidBody.getVelocityInLocalPoint(p.worldPosition),
                            W = V3.dot(u.normal, da);
                        na = Math.max(na, Math.abs(W));
                        let X = 0;
                        if (u.type == 'raycast' || u.type == 'hardpoint') {
                            X = (u.force - q.suspension.damping * W) * f.rigidBody.mass * d,
                                X > 0 && f.rigidBody.applyImpulse(V3.scale(u.normal, X), p.worldPosition);
                        }
                        if ((u.type == 'standard' || u.type == 'hardpoint') && W < 0) {
                            let Na = f.rigidBody.computeJacobian(0, W, p.worldPosition, u.normal),
                                ua = V3.scale(u.normal, Na);
                            ua = V3.scale(ua, H.damping);
                            f.rigidBody.applyImpulse(ua, p.worldPosition);
                            X = Na;
                        }
                        let I = X * H.frictionCoef;
                        I = clamp(I, I, 2 * f.rigidBody.mass * d * H.frictionCoef);
                        if (q.type == 'wheel') {
                            let va = u.contactFwdDir,
                                wa = u.contactSideDir,
                                Oa = V3.dot(wa, da),
                                xa = V3.dot(va, da);
                            u.forwardProjVel = xa;
                            u.sideProjVel = Oa;
                            let Pa = f.rigidBody.computeJacobian(0, Oa, p.worldPosition, wa),
                                Qa = f.rigidBody.computeJacobian(0, xa, p.worldPosition, va),
                                ya = Math.abs(Pa),
                                za = Math.abs(Qa),
                                Ra = 1,
                                ea = 1;
                            Math.abs(xa) > H.lockSpeed && (ea = H.rollingFriction);
                            const Sa = q.brakesController;
                            if (Sa && za > 0) {
                                const kb = clamp(g[Sa] * q.brakesControllerRatio, 0, 1);
                                ea = clamp(I / (za * H.frictionCoef), 0, 1) * kb;
                            }
                            const lb = f.setup.brakeDamping || 3;
                            controls.brakes > 0.05 && (ea = clamp(I / (za * H.frictionCoef * lb) * controls.brakes, 0, 1));
                            if (ya > I) {
                                var Aa = I / (ya * ya);
                                Ra = clamp(Aa, H.dynamicFriction, 1);
                            }
                            f.rigidBody.applyImpulse(V3.scale(wa, Pa * Ra), p.worldPosition);
                            f.rigidBody.applyImpulse(V3.scale(va, Qa * ea), p.worldPosition);
                        } else {
                            let Ta = V3.sub(da, V3.scale(u.normal, W)),
                                Ua = V3.normalize(Ta),
                                Va = V3.length(Ta);
                            if (Va) {
                                let Wa = f.rigidBody.computeJacobian(0, Va, p.worldPosition, Ua),
                                    Ba = Math.abs(Wa),
                                    Xa = 1;
                                Ba > I && (Aa = I / (Ba * Ba),
                                    Xa = clamp(Aa, H.dynamicFriction, 1));
                                f.rigidBody.applyImpulse(V3.scale(Ua, Xa * Wa), p.worldPosition);
                            }
                        }
                    }
                }
            }
            f.rigidBody.integrateVelocities(d);
            f.rigidBody.integrateTransform(d);
            geofs.aircraft.instance.object3d.compute(f.llaLocation);
        }
        f.rigidBody.setCurrentAcceleration(e, a);
        f.placeParts();
        f.render();
        flight.recorder.recording == 1 && flight.recorder.record();
        geofs.preferences.crashDetection && (na > 10 && (f.crashed = !0), !f.crashNotified && f.crashed && (f.crashNotified = !0,
            f.crash()));
    }
    f.htrAngularSpeed = V3.sub(f.object3d.htr, f.htr);
    f.htrAngularSpeed = fixAngles(f.htrAngularSpeed);
    f.htrAngularSpeed = V3.scale(f.htrAngularSpeed, 1 / b);
    f.htr = f.object3d.htr;
    let Ca = 0; 
    t = 0;
    for (F = f.wheels.length; t < F; t++) {
        const x = f.wheels[t];
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
        g[Za] = fixAngle360((g[Za] || 0) + x.angularVelocity);
    }
    let N = f.llaLocation[2] * METERS_TO_FEET,
        mb = 60 * (N - k * METERS_TO_FEET) / a,
        nb = fixAngle(weather.currentWindDirection - f.htr[0]),
        ob = f.engine.rpm * h.RPM2PropAS * a;
    g.maxAngularVRatio = Ca;
    g.enginesOn = geofs.aircraft.instance.engine.on;
    g.prop = fixAngle360(g.prop + ob);
    g.thrust = z;
    g.rpm = f.engine.rpm;
    g.throttle = controls.throttle;
    g.pitch = controls.pitch;
    g.rawPitch = controls.rawPitch;
    g.roll = controls.roll;
    g.yaw = controls.yaw;
    g.trim = controls.elevatorTrim;
    g.brakes = controls.brakes;
    g.gearPosition = controls.gear.position;
    g.invGearPosition = 1 - controls.gear.position;
    g.gearTarget = controls.gear.target;
    g.flapsValue = controls.flaps.position / controls.flaps.maxPosition;
    g.flapsPosition = controls.flaps.position;
    g.flapsTarget = controls.flaps.target;
    g.flapsPositionTarget = controls.flaps.positionTarget;
    g.flapsMaxPosition = controls.flaps.maxPosition;
    g.airbrakesPosition = controls.airbrakes.position;
    g.optionalAnimatedPartPosition = controls.optionalAnimatedPart.position;
    g.airbrakesTarget = controls.airbrakes.target;
    g.parkingBrake = geofs.aircraft.instance.brakesOn;
    g.groundContact = f.groundContact ? 1 : 0;
    g.acceleration = M33.transform(M33.transpose(f.object3d._rotation), f.rigidBody.v_acceleration);
    g.accX = g.acceleration[0];
    g.accY = g.acceleration[1];
    g.accZ = g.acceleration[2];
    g.msDt = b;
    g.rollingSpeed = f.groundContact ? f.velocityScalar : 0;
    g.ktas = 1.94 * f.trueAirSpeed;
    g.kias = g.ktas;
    g.mach = f.trueAirSpeed / (331.3 + 0.606 * weather.atmosphere.airTempAtAltitude);
    g.altitude = N;
    g.altTenThousands = N % 1E5;
    g.altThousands = N % 1E4;
    g.altHundreds = N % 1E3;
    g.altTens = N % 100;
    g.altUnits = N % 10;
    g.climbrate = mb;
    g.aoa = ca;
    g.turnrate = 60 * (f.htr[0] - g.heading) / a;
    g.heading = f.htr[0];
    g.heading360 = fixAngle360(f.htr[0]);
    g.atilt = f.htr[1];
    g.aroll = f.htr[2];
    g.relativeWind = nb;
    g.windSpeed = weather.currentWindSpeed;
    g.windSpeedLabel = `${parseInt(weather.currentWindSpeed)} kts`;
    g.view = camera.currentView;
    g.envelopeTemp = E;
    if (camera.currentModeName == 'free' || camera.currentModeName == 'chase') {
        const $a = geofs.utils.llaDistanceInMeters(camera.lla, f.llaLocation);
        g.cameraAircraftSpeed = (g.cameraAircraftDistance - $a) / a;
        g.cameraAircraftDistance = $a;
    } else {
        g.cameraAircraftSpeed = 0,
            g.cameraAircraftDistance = 0;
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
// flight.recorder.enterPlayback = function() {
//     geofs.aircraft.instance.rigidBody.saveState();
//     flight.recorder.stopRecording();
//     $('.geofs-recordPlayer-slider').attr('max', flight.recorder.tape.length - 2);
//     flight.recorder.setStep(0);
//     $('.geofs-recordPlayer-slider').on('userchange', (a, b) => {
//         flight.recorder.setStep(parseInt(b), !0);
//     }).on('dragstart', flight.recorder.pausePlayback).on('dragend', flight.recorder.unpausePlayback);
//     $('body').addClass('geofs-record-playing');
//     flight.recorder.playing = !0;
// };
// flight.recorder.exitPlayback = function() {
//     geofs.doPause();
//     flight.recorder.playing = !1;
//     geofs.aircraft.instance.rigidBody.restoreState();
//     flight.recorder.setStep(flight.recorder.currentStep);
//     geofs.aircraft.instance.object3d.resetRotationMatrix();
//     $('body').removeClass('geofs-record-playing');
//     flight.recorder.startRecording();
// };
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