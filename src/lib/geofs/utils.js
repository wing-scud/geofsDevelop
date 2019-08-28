import geofs from './geofs'
let GRAVITY = 9.81,
    DEGREES_TO_RAD = Math.PI / 180,
    RAD_TO_DEGREES = 180 / Math.PI,
    METERS_TO_FEET = 3.2808399,
    FEET_TO_METERS = 0.3048,
    MERIDIONAL_RADIUS = 6378137,
    EARTH_CIRCUMFERENCE = 2 * MERIDIONAL_RADIUS * Math.PI,
    METERS_TO_LOCAL_LAT = 1 / (EARTH_CIRCUMFERENCE / 360),
    PI = Math.PI,
    HALF_PI = PI / 2,
    TWO_PI = 2 * PI,
    TEMPERATURE_LAPSE_RATE = 0.0065,
    DRAG_CONSTANT = 0.07,
    MIN_DRAG_COEF = 0.02,
    IDEAL_GAS_CONSTANT = 8.31447,
    MOLAR_MASS_DRY_AIR = 0.0289644,
    VIEWPORT_REFERENCE_WIDTH = 1800,
    SMOOTH_BUFFER = {},
    SMOOTHING_FACTOR = 0.2;
let utils = {
    timeProvider: window.performance || window.Date,
};
utils.lastNow = utils.timeProvider.now();
utils.fastNow = function() {
    return utils.lastNow;
};
utils.now = function() {
    utils.lastNow = utils.timeProvider.now();
    return utils.lastNow;
};
utils.llaDistanceInMeters = function(a, b, c) {
    return V2.length(ll2xy(V3.sub(a, b), c || a));
};
utils.pivotArray = function(a) {
    const b = {};
    try {
        for (i = 0,
            l = a.length; i < l; i++) { b[a[i]] = 1; }
    } catch (c) {}
    return b;
};
utils.htrFromHeadingNormal = function(a, b) {
    a *= DEGREES_TO_RAD;
    a = V3.normalize(V3.cross([Math.sin(a), Math.cos(a), 0], b));
    const c = V3.cross(b, a);
    return M33.getOrientation([a, c, b]);
};
utils.hashCode = function(a) {
    let b = 0,
        c;
    if (a.length === 0) { return b; }
    for (c = 0; c < a.length; c++) {
        const d = a.charCodeAt(c);
        b = (b << 5) - b + d;
        b |= 0;
    }
    return `${b}`;
};




function exponentialSmoothing(a, b, c, d) {
    SMOOTH_BUFFER[a] || (SMOOTH_BUFFER[a] = {
            Stm1: d || 0,
            Xtm1: d || 0,
        },
        c ? (SMOOTH_BUFFER[a].smoothingFactor = c,
            SMOOTH_BUFFER[a].invSmoothingFactor = 1 - c) : (SMOOTH_BUFFER[a].smoothingFactor = SMOOTHING_FACTOR,
            SMOOTH_BUFFER[a].invSmoothingFactor = 1 - SMOOTHING_FACTOR));
    a = SMOOTH_BUFFER[a];
    c = a.Xtm1 * a.smoothingFactor + a.invSmoothingFactor * a.Stm1;
    a.Stm1 = c;
    a.Xtm1 = b;
    return c;
}

function xyz2lla(a, b) {
    return geofs.api.xyz2lla(a, b);
}

function xy2ll(a, b) {
    const c = [];
    c[0] = a[1] * METERS_TO_LOCAL_LAT;
    c[1] = a[0] / (Math.cos((b[0] + c[0]) * DEGREES_TO_RAD) * MERIDIONAL_RADIUS * DEGREES_TO_RAD);
    return c;
}

function lla2xyz(a, b) {
    b = ll2xy(a, b);
    b[2] = a[2];
    return b;
}

function ll2xy(a, b) {
    const c = [];
    c[1] = a[0] / METERS_TO_LOCAL_LAT;
    c[0] = a[1] / (1 / (Math.cos((b[0] + a[0]) * DEGREES_TO_RAD) * MERIDIONAL_RADIUS * DEGREES_TO_RAD));
    return c;
}

function clamp(a, b, c) {
    return a > c ? c : a < b ? b : a;
}
var V2 = {
    add(a, b) {
        return [a[0] + b[0], a[1] + b[1]];
    },
    sub(a, b) {
        return [a[0] - b[0], a[1] - b[1]];
    },
    length(a) {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    },
    scale(a, b) {
        return [a[0] * b, a[1] * b];
    },
};
var V3 = {
    isValid(a) {
        if (!a) { return !1; }
        for (let b = 0; b <= 2; b++) {
            if (a[b] === null || isNaN(a[b])) { return !1; }
        }
        return !0;
    },
    dup(a) {
        return [a[0], a[1], a[2]];
    },
    toString(a) {
        return `[${a[0]}, ${a[1]}, ${a[2]}]`;
    },
    nearlyEqual(a, b, c) {
        c || (c = 1E-6);
        return Math.abs(a[0] - b[0]) <= c && Math.abs(a[1] - b[1]) <= c && Math.abs(a[2] - b[2]) <= c;
    },
    abs(a) {
        return [Math.abs(a[0]), Math.abs(a[1]), Math.abs(a[2])];
    },
    cross(a, b) {
        let c = a[0],
            d = a[1];
        a = a[2];
        let e = b[0],
            f = b[1];
        b = b[2];
        return [d * b - a * f, a * e - c * b, c * f - d * e];
    },
    dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    },
    add(a, b) {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    },
    addAngles(a, b) {
        return [fixAngle(a[0] + b[0]), fixAngle(a[1] + b[1]), fixAngle(a[2] + b[2])];
    },
    sub(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    },
    mult(a, b) {
        return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
    },
    scale(a, b) {
        return [a[0] * b, a[1] * b, a[2] * b];
    },
    length(a) {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    },
    normalize(a) {
        const b = V3.length(a);
        return b <= 0 ? [NaN, NaN, NaN] : V3.scale(a, 1 / b);
    },
    bisect(a, b) {
        return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    },
    rotate(a, b, c) {
        const d = V3.dot(a, b);
        a = V3.sub(a, V3.scale(b, d));
        const e = V3.cross(b, a);
        return V3.add(V3.scale(b, d), V3.add(V3.scale(a, Math.cos(c)), V3.scale(e, Math.sin(c))));
    },
    toRadians(a) {
        return [a[0] * DEGREES_TO_RAD, a[1] * DEGREES_TO_RAD, a[2] * DEGREES_TO_RAD];
    },
    toDegrees(a) {
        return [a[0] * RAD_TO_DEGREES, a[1] * RAD_TO_DEGREES, a[2] * RAD_TO_DEGREES];
    },
    clamp(a, b, c) {
        return [clamp(a[0], b, c), clamp(a[1], b, c), clamp(a[2], b, c)];
    },
    exponentialSmoothing(a, b, c) {
        return [exponentialSmoothing(`${a}0`, b[0], c), exponentialSmoothing(`${a}1`, b[1], c), exponentialSmoothing(`${a}2`, b[2], c)];
    },
    sqrt(a) {
        return [Math.sqrt(Math.abs(a[0])) * Math.sign(a[0]), Math.sqrt(Math.abs(a[1])) * Math.sign(a[1]), Math.sqrt(Math.abs(a[2])) * Math.sign(a[2])];
    },
};
var M33 = {
    toString(a) {
        return `[${V3.toString(a[0])}, ${V3.toString(a[1])}, ${V3.toString(a[2])}]`;
    },
    toArray(a) {
        return [a[0][0], a[0][1], a[0][2], a[1][0], a[1][1], a[1][2], a[2][0], a[2][1], a[2][2]];
    },
    toRowMajorArray(a) {
        return [a[0][0], a[1][0], a[2][0], a[0][1], a[1][1], a[2][1], a[0][2], a[1][2], a[2][2]];
    },
    fromRowMajorArray(a) {
        return [
            [a[0], a[3], a[6]],
            [a[1], a[4], a[7]],
            [a[2], a[5], a[8]]
        ];
    },
    identity() {
        return [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ];
    },
    dup(a) {
        return [V3.dup(a[0]), V3.dup(a[1]), V3.dup(a[2])];
    },
    nearlyEqual(a, b) {
        return V3.nearlyEqual(a[0], b[0]) && V3.nearlyEqual(a[1], b[1]) && V3.nearlyEqual(a[2], b[2]);
    },
    transpose(a) {
        return [
            [a[0][0], a[1][0], a[2][0]],
            [a[0][1], a[1][1], a[2][1]],
            [a[0][2], a[1][2], a[2][2]]
        ];
    },
    add(a, b) {
        return [V3.add(a[0], b[0]), V3.add(a[1], b[1]), V3.add(a[2], b[2])];
    },
    multiplyV(a, b) {
        let c = b[0],
            d = b[1];
        b = b[2];
        let e = a[0],
            f = a[1];
        a = a[2];
        return [e[0] * c + e[1] * d + e[2] * b, f[0] * c + f[1] * d + f[2] * b, a[0] * c + a[1] * d + a[2] * b];
    },
    multiply(a, b) {
        let c = a[0][0],
            d = a[0][1],
            e = a[0][2],
            f = a[1][0],
            g = a[1][1],
            h = a[1][2],
            k = a[2][0],
            n = a[2][1];
        a = a[2][2];
        let v = b[0][0],
            z = b[0][1],
            A = b[0][2],
            C = b[1][0],
            w = b[1][1],
            y = b[1][2],
            D = b[2][0],
            B = b[2][1];
        b = b[2][2];
        return [
            [c * v + f * z + k * A, d * v + g * z + n * A, e * v + h * z + a * A],
            [c * C + f * w + k * y, d * C + g * w + n * y, e * C + h * w + a * y],
            [c * D + f * B + k * b, d * D + g * B + n * b, e * D + h * B + a * b]
        ];
    },
    scaled(a, b) {
        return [
            [a[0][0] * b[0], a[0][1] * b[1], a[0][2] * b[2]],
            [a[1][0] * b[0], a[1][1] * b[1], a[1][2] * b[2]],
            [a[2][0] * b[0], a[2][1] * b[1], a[2][2] * b[2]]
        ];
    },
    transform(a, b) {
        let c = a[0],
            d = a[1];
        a = a[2];
        let e = b[0],
            f = b[1];
        b = b[2];
        return [c[0] * e + d[0] * f + a[0] * b, c[1] * e + d[1] * f + a[1] * b, c[2] * e + d[2] * f + a[2] * b];
    },
    rotationXYZ(a, b) {
        b = M33.setFromEuler(b);
        return b = M33.multiply(a, b);
    },
    rotationX(a, b) {
        const c = Math.cos(b);
        b = Math.sin(b);
        return M33.multiply(a, [
            [1, 0, 0],
            [0, c, -b],
            [0, b, c]
        ]);
    },
    rotationY(a, b) {
        const c = Math.cos(b);
        b = Math.sin(b);
        return M33.multiply(a, [
            [c, 0, b],
            [0, 1, 0],
            [-b, 0, c]
        ]);
    },
    rotationZ(a, b) {
        const c = Math.cos(b);
        b = Math.sin(b);
        return M33.multiply(a, [
            [c, -b, 0],
            [b, c, 0],
            [0, 0, 1]
        ]);
    },
    rotationParentFrameX(a, b) {
        const c = Math.cos(b);
        b = Math.sin(b);
        return M33.multiply([
            [1, 0, 0],
            [0, c, -b],
            [0, b, c]
        ], a);
    },
    rotationParentFrameY(a, b) {
        const c = Math.cos(b);
        b = Math.sin(b);
        return M33.multiply([
            [c, 0, b],
            [0, 1, 0],
            [-b, 0, c]
        ], a);
    },
    rotationParentFrameZ(a, b) {
        const c = Math.cos(b);
        b = Math.sin(b);
        return M33.multiply([
            [c, -b, 0],
            [b, c, 0],
            [0, 0, 1]
        ], a);
    },
    rotate(a, b, c) {
        let d = b[0],
            e = b[1];
        b = b[2];
        let f = Math.cos(c),
            g = 1 - f;
        c = Math.sin(c);
        return M33.multiply(a, [
            [d * d * g + f, e * d * g + b * c, b * d * g - e * c],
            [d * e * g - b * c, e * e * g + f, e * b * g + d * c],
            [d * b * g + e * c, e * b * g - d * c, b * b * g + f]
        ]);
    },
    transformByTranspose(a, b) {
        return [a[0][0] * b[0] + a[0][1] * b[1] + a[0][2] * b[2], a[1][0] * b[0] + a[1][1] * b[1] + a[1][2] * b[2], a[2][0] * b[0] + a[2][1] * b[1] + a[2][2] * b[2]];
    },
    makeOrthonormalFrame(a, b) {
        a = V3.normalize(a);
        b = V3.normalize(V3.cross(b, a));
        const c = V3.cross(b, a);
        return [b, a, c];
    },
    setFromEuler(a) {
        let b = Math.cos(a[0]),
            c = Math.sin(a[0]),
            d = Math.cos(a[1]),
            e = Math.sin(a[1]),
            f = Math.cos(a[2]);
        a = Math.sin(a[2]);
        return [
            [f * d + a * c * e, -a * d + f * c * e, b * e],
            [a * b, f * b, -c],
            [f * -e + a * c * d, -a * -e + f * c * d, b * d]
        ];
    },
    getOrientation(a) {
        if (a[1][2] > 0.998) {
            var b = Math.atan2(-a[2][0], -a[2][1]);
            var c = -HALF_PI;
            a = 0;
        } else {
            a[1][2] < -0.998 ? (b = Math.atan2(a[2][0], a[2][1]),
                c = HALF_PI,
                a = 0) : (b = Math.atan2(a[1][0], a[1][1]),
                c = Math.asin(-a[1][2]),
                a = Math.atan2(a[0][2], a[2][2]));
        }
        return [b * RAD_TO_DEGREES, c * RAD_TO_DEGREES, a * RAD_TO_DEGREES];
    },
    toMatrix(a) {
        return a;
    },
};
M33.toEuler = M33.getOrientation;
var M3 = {
    identity() {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0];
    },
    sub(a, b) {
        for (var c = [], d = 0; d < 9; d++) { c[d] = a[d] - b[d]; }
        return c;
    },
    add(a, b) {
        for (var c = [], d = 0; d < 9; d++) { c[d] = a[d] + b[d]; }
        return c;
    },
    dup(a) {
        return [a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]];
    },
    scale(a, b) {
        for (var c = [], d = 0; d < 9; d++) { c[d] = a[d] * b; }
        return c;
    },
};
const SMALL_NUM = 1E-8;
var S2 = {
    identity() {
        return {
            x: 1,
            y: 1,
        };
    },
    mult(a, b) {
        return {
            x: a.x * b.x,
            y: a.y * b.y,
        };
    },
    add(a, b) {
        return {
            x: a.x + b.x,
            y: a.y + b.y,
        };
    },
    scale(a, b) {
        return {
            x: a.x * b,
            y: a.y * b,
        };
    },
};

export { utils, V2, V3, M33, M3, S2 };
export default utils;