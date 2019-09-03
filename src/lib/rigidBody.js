//@ts-check
import { M33 ,V3, xyz2lla} from './geofs/utils'
import geofs from './geofs/geofs';
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

//@ts-check
import { M33 ,V3,GRAVITY,xyz2lla} from './geofs/utils'
import geofs from "./geofs/geofs"
function rigidBody() {
    this.s_inverseMass = this.mass = 0;
    this.reset();
    this.minLinearVelocity = 0.1;
    this.minAngularVelocity = 0.01;
}
rigidBody.prototype.reset = function() {
    this.v_linearVelocity = [0, 0, 0];
    this.v_angularVelocity = [0, 0, 0];
    this.v_totalForce = [0, 0, 0];
    this.v_totalTorque = [0, 0, 0];
    this.v_prevLinearVelocity = [0, 0, 0];
    this.v_prevTotalTorque = [0, 0, 0];
    this.v_acceleration = [0, 0, 0];
    this.v_torque = [0, 0, 0];
};
rigidBody.prototype.setMassProps = function(a, b) {
    b = b || 0.1;
    $.isArray(b) || (b = [b, b, b]);
    this.mass = a;
    this.s_inverseMass = 1 / a;
    this.v_localInvInertia = [b[0] / a, b[1] / a, b[2] / a];
    this.m_localInvInertiaTensor = [
        [this.v_localInvInertia[0], 0, 0],
        [0, this.v_localInvInertia[1], 0],
        [0, 0, this.v_localInvInertia[2]]
    ];
    console.log(this.m_localInvInertiaTensor[0] + "   this.m_localInvInertiaTensor");
    this.m_worldInvInertiaTensor = M33.dup(this.m_localInvInertiaTensor);
    this.gravityForce = [0, 0, -GRAVITY * a];
};
rigidBody.prototype.getLinearVelocity = function() {
    return this.v_linearVelocity;
};
rigidBody.prototype.getAngularVelocity = function() {
    return this.v_angularVelocity;
};
rigidBody.prototype.setLinearVelocity = function(a) {
    this.v_linearVelocity = a;
};
rigidBody.prototype.setAngularVelocity = function(a) {
    this.v_angularVelocity = a;
};
rigidBody.prototype.getVelocityInLocalPoint = function(a) {
    return V3.add(this.v_linearVelocity, V3.cross(a, this.v_angularVelocity));
};
rigidBody.prototype.getForceInLocalPoint = function(a) {
    const b = V3.add(this.v_totalForce, V3.cross(a, this.v_totalTorque));
    return V3.add(b, V3.scale(this.getVelocityInLocalPoint(a), this.mass));
};
rigidBody.prototype.applyCentralForce = function(a) {
    this.v_totalForce = V3.add(this.v_totalForce, a);
};
rigidBody.prototype.applyTorque = function(a) {
    this.v_totalTorque = V3.add(this.v_totalTorque, a);
};
rigidBody.prototype.applyForce = function(a, b) {
    this.applyCentralForce(a);
    this.applyTorque(V3.cross(a, b));
};
rigidBody.prototype.applyCentralImpulse = function(a) {
    this.v_linearVelocity = V3.add(this.v_linearVelocity, V3.scale(a, this.s_inverseMass));
};
rigidBody.prototype.applyTorqueImpulse = function(a) {
    this.v_angularVelocity = V3.add(this.v_angularVelocity, M33.multiplyV(this.m_worldInvInertiaTensor, a));
};
rigidBody.prototype.applyImpulse = function(a, b) {
    this.applyCentralImpulse(a);
    this.applyTorqueImpulse(V3.cross(a, b));
};
rigidBody.prototype.computeJacobian = function(a, b, c, d) {
    a = -(1 + a) * b;
    b = this.s_inverseMass;
    c = V3.dot(d, V3.cross(c, M33.multiplyV(this.m_worldInvInertiaTensor, V3.cross(d, c))));
    return a / (b + c);
};
rigidBody.prototype.computeImpulse = function(a, b, c, d) {
    a = this.computeJacobian(a, b, c, d);
    return V3.scale(d, a);
};
rigidBody.prototype.integrateVelocities = function(a) {
    this.v_linearVelocity = V3.add(this.v_linearVelocity, V3.scale(this.v_totalForce, this.s_inverseMass * a));
    this.v_angularVelocity = V3.add(this.v_angularVelocity, M33.multiplyV(this.m_worldInvInertiaTensor, V3.scale(this.v_totalTorque, a)));
};
rigidBody.prototype.integrateTransform = function(a) {
    let b = V3.length(this.v_linearVelocity),
        c = V3.length(this.v_angularVelocity);
    if (b > this.minLinearVelocity || c > this.minAngularVelocity) {
        b = geofs.aircraft.instance,
            c = xyz2lla(V3.scale(this.v_linearVelocity, a), b.llaLocation),
            b.llaLocation = V3.add(b.llaLocation, c),
            a = V3.scale(this.v_angularVelocity, a),
            a = M33.transformByTranspose(b.object3d._initialRotation, a),
            b.object3d.rotateInitialRotation(a);
    }
    this.setFrameForces();
    this.clearForces();
};
rigidBody.prototype.setFrameForces = function() {};
rigidBody.prototype.setCurrentAcceleration = function(a, b) {
    this.v_acceleration = V3.scale(V3.sub(this.v_linearVelocity, this.v_prevLinearVelocity), a);
    this.v_acceleration = V3.add([0, 0, GRAVITY], this.v_acceleration);
    this.v_torque = V3.scale(V3.sub(this.v_angularVelocity, this.v_prevTotalTorque), a);
    this.v_prevLinearVelocity = V3.dup(this.v_linearVelocity);
    this.v_prevTotalTorque = V3.dup(this.v_angularVelocity);
};
setInterval(() => {
    if (geofs.aircraft.instance && geofs.aircraft.instance.object3d) {
        try {
            geofs.aircraft.instance.object3d.resetRotationMatrix();
        } catch (a) {
            geofs.debug.error(a, 'resetRotationMatrix interval');
        }
    }
}, 1E4);
rigidBody.prototype.clearForces = function() {
    this.v_totalForce = [0, 0, 0];
    this.v_totalTorque = [0, 0, 0];
};
rigidBody.prototype.saveState = function() {
    this.savedLinearVelocity = V3.dup(this.v_linearVelocity);
    this.savedAngularVelocity = V3.dup(this.v_angularVelocity);
};
rigidBody.prototype.restoreState = function() {
    this.clearForces();
    this.v_linearVelocity = V3.dup(this.savedLinearVelocity);
    this.v_angularVelocity = V3.dup(this.savedAngularVelocity);
};
export default rigidBody;