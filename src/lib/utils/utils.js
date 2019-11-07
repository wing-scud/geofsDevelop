import geofs from '../geofs'
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
var V2 = {
    add: function(a, b) {
        return [a[0] + b[0], a[1] + b[1]]
    },
    sub: function(a, b) {
        return [a[0] - b[0], a[1] - b[1]]
    },
    length: function(a) {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1])
    },
    scale: function(a, b) {
        return [a[0] * b, a[1] * b]
    }
};
var V3 = {
    isValid: function(a) {
        if (!a)
            return !1;
        for (var b = 0; 2 >= b; b++)
            if (null === a[b] || isNaN(a[b]))
                return !1;
        return !0
    },
    dup: function(a) {
        return [a[0], a[1], a[2]]
    },
    toString: function(a) {
        return "[" + a[0] + ", " + a[1] + ", " + a[2] + "]"
    },
    nearlyEqual: function(a, b, c) {
        c || (c = 1E-6);
        return Math.abs(a[0] - b[0]) <= c && Math.abs(a[1] - b[1]) <= c && Math.abs(a[2] - b[2]) <= c
    },
    abs: function(a) {
        return [Math.abs(a[0]), Math.abs(a[1]), Math.abs(a[2])]
    },
    cross: function(a, b) {
        var c = a[0],
            d = a[1];
        a = a[2];
        var e = b[0],
            f = b[1];
        b = b[2];
        return [d * b - a * f, a * e - c * b, c * f - d * e]
    },
    dot: function(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
    },
    add: function(a, b) {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
    },
    addAngles: function(a, b) {
        return [fixAngle(a[0] + b[0]), fixAngle(a[1] + b[1]), fixAngle(a[2] + b[2])]
    },
    sub: function(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
    },
    mult: function(a, b) {
        return [a[0] * b[0], a[1] * b[1], a[2] * b[2]]
    },
    scale: function(a, b) {
        return [a[0] * b, a[1] * b, a[2] * b]
    },
    length: function(a) {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2])
    },
    normalize: function(a) {
        var b = V3.length(a);
        return 0 >= b ? [NaN, NaN, NaN] : V3.scale(a, 1 / b)
    },
    bisect: function(a, b) {
        return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
    },
    rotate: function(a, b, c) {
        var d = V3.dot(a, b);
        a = V3.sub(a, V3.scale(b, d));
        var e = V3.cross(b, a);
        return V3.add(V3.scale(b, d), V3.add(V3.scale(a, Math.cos(c)), V3.scale(e, Math.sin(c))))
    },
    toRadians: function(a) {
        return [a[0] * DEGREES_TO_RAD, a[1] * DEGREES_TO_RAD, a[2] * DEGREES_TO_RAD]
    },
    toDegrees: function(a) {
        return [a[0] * RAD_TO_DEGREES, a[1] * RAD_TO_DEGREES, a[2] * RAD_TO_DEGREES]
    },
    clamp: function(a, b, c) {
        return [clamp(a[0], b, c), clamp(a[1], b, c), clamp(a[2], b, c)]
    },
    exponentialSmoothing: function(a, b, c) {
        return [exponentialSmoothing(a + "0", b[0], c), exponentialSmoothing(a + "1", b[1], c), exponentialSmoothing(a + "2", b[2], c)]
    },
    sqrt: function(a) {
        return [Math.sqrt(Math.abs(a[0])) * Math.sign(a[0]), Math.sqrt(Math.abs(a[1])) * Math.sign(a[1]), Math.sqrt(Math.abs(a[2])) * Math.sign(a[2])]
    }
};
var M33 = {
    toString: function(a) {
        return "[" + V3.toString(a[0]) + ", " + V3.toString(a[1]) + ", " + V3.toString(a[2]) + "]"
    },
    toArray: function(a) {
        return [a[0][0], a[0][1], a[0][2], a[1][0], a[1][1], a[1][2], a[2][0], a[2][1], a[2][2]]
    },
    toRowMajorArray: function(a) {
        return [a[0][0], a[1][0], a[2][0], a[0][1], a[1][1], a[2][1], a[0][2], a[1][2], a[2][2]]
    },
    fromRowMajorArray: function(a) {
        return [
            [a[0], a[3], a[6]],
            [a[1], a[4], a[7]],
            [a[2], a[5], a[8]]
        ]
    },
    identity: function() {
        return [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ]
    },
    dup: function(a) {
        return [V3.dup(a[0]), V3.dup(a[1]), V3.dup(a[2])]
    },
    nearlyEqual: function(a, b) {
        return V3.nearlyEqual(a[0], b[0]) && V3.nearlyEqual(a[1], b[1]) && V3.nearlyEqual(a[2], b[2])
    },
    transpose: function(a) {
        return [
            [a[0][0], a[1][0], a[2][0]],
            [a[0][1], a[1][1], a[2][1]],
            [a[0][2], a[1][2], a[2][2]]
        ]
    },
    add: function(a, b) {
        return [V3.add(a[0], b[0]), V3.add(a[1], b[1]), V3.add(a[2], b[2])]
    },
    multiplyV: function(a, b) {
        var c = b[0],
            d = b[1];
        b = b[2];
        var e = a[0],
            f = a[1];
        a = a[2];
        return [e[0] * c + e[1] * d + e[2] * b, f[0] * c + f[1] * d + f[2] * b, a[0] * c + a[1] * d + a[2] * b]
    },
    multiply: function(a, b) {
        var c = a[0][0],
            d = a[0][1],
            e = a[0][2],
            f = a[1][0],
            g = a[1][1],
            h = a[1][2],
            k = a[2][0],
            n = a[2][1];
        a = a[2][2];
        var v = b[0][0],
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
        ]
    },
    scaled: function(a, b) {
        return [
            [a[0][0] * b[0], a[0][1] * b[1], a[0][2] * b[2]],
            [a[1][0] * b[0], a[1][1] * b[1], a[1][2] * b[2]],
            [a[2][0] * b[0], a[2][1] * b[1], a[2][2] * b[2]]
        ]
    },
    transform: function(a, b) {
        var c = a[0],
            d = a[1];
        a = a[2];
        var e = b[0],
            f = b[1];
        b = b[2];
        return [c[0] * e + d[0] * f + a[0] * b, c[1] * e + d[1] * f + a[1] * b, c[2] * e + d[2] * f + a[2] * b]
    },
    rotationXYZ: function(a, b) {
        b = M33.setFromEuler(b);
        return b = M33.multiply(a, b)
    },
    rotationX: function(a, b) {
        var c = Math.cos(b);
        b = Math.sin(b);
        return M33.multiply(a, [
            [1, 0, 0],
            [0, c, -b],
            [0, b, c]
        ])
    },
    rotationY: function(a, b) {
        var c = Math.cos(b);
        b = Math.sin(b);
        return M33.multiply(a, [
            [c, 0, b],
            [0, 1, 0],
            [-b, 0, c]
        ])
    },
    rotationZ: function(a, b) {
        var c = Math.cos(b);
        b = Math.sin(b);
        return M33.multiply(a, [
            [c, -b, 0],
            [b, c, 0],
            [0, 0, 1]
        ])
    },
    rotationParentFrameX: function(a, b) {
        var c = Math.cos(b);
        b = Math.sin(b);
        return M33.multiply([
            [1, 0, 0],
            [0, c, -b],
            [0, b, c]
        ], a)
    },
    rotationParentFrameY: function(a, b) {
        var c = Math.cos(b);
        b = Math.sin(b);
        return M33.multiply([
            [c, 0, b],
            [0, 1, 0],
            [-b, 0, c]
        ], a)
    },
    rotationParentFrameZ: function(a, b) {
        var c = Math.cos(b);
        b = Math.sin(b);
        return M33.multiply([
            [c, -b, 0],
            [b, c, 0],
            [0, 0, 1]
        ], a)
    },
    rotate: function(a, b, c) {
        var d = b[0],
            e = b[1];
        b = b[2];
        var f = Math.cos(c),
            g = 1 - f;
        c = Math.sin(c);
        return M33.multiply(a, [
            [d * d * g + f, e * d * g + b * c, b * d * g - e * c],
            [d * e * g - b * c, e * e * g + f, e * b * g + d * c],
            [d * b * g + e * c, e * b * g - d * c, b * b * g + f]
        ])
    },
    transformByTranspose: function(a, b) {
        return [a[0][0] * b[0] + a[0][1] * b[1] + a[0][2] * b[2], a[1][0] * b[0] + a[1][1] * b[1] + a[1][2] * b[2], a[2][0] * b[0] + a[2][1] * b[1] + a[2][2] * b[2]]
    },
    makeOrthonormalFrame: function(a, b) {
        a = V3.normalize(a);
        b = V3.normalize(V3.cross(b, a));
        var c = V3.cross(b, a);
        return [b, a, c]
    },
    setFromEuler: function(a) {
        var b = Math.cos(a[0]),
            c = Math.sin(a[0]),
            d = Math.cos(a[1]),
            e = Math.sin(a[1]),
            f = Math.cos(a[2]);
        a = Math.sin(a[2]);
        return [
            [f * d + a * c * e, -a * d + f * c * e, b * e],
            [a * b, f * b, -c],
            [f * -e + a * c * d, -a * -e + f * c * d, b * d]
        ]
    },
    getOrientation: function(a) {
        if (.998 < a[1][2]) {
            var b = Math.atan2(-a[2][0], -a[2][1]);
            var c = -HALF_PI;
            a = 0
        } else
            -.998 > a[1][2] ? (b = Math.atan2(a[2][0], a[2][1]),
                c = HALF_PI,
                a = 0) : (b = Math.atan2(a[1][0], a[1][1]),
                c = Math.asin(-a[1][2]),
                a = Math.atan2(a[0][2], a[2][2]));
        return [b * RAD_TO_DEGREES, c * RAD_TO_DEGREES, a * RAD_TO_DEGREES]
    },
    toMatrix: function(a) {
        return a
    }
};
M33.toEuler = M33.getOrientation;
var M3 = {
    identity: function() {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    sub: function(a, b) {
        for (var c = [], d = 0; 9 > d; d++)
            c[d] = a[d] - b[d];
        return c
    },
    add: function(a, b) {
        for (var c = [], d = 0; 9 > d; d++)
            c[d] = a[d] + b[d];
        return c
    },
    dup: function(a) {
        return [a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]]
    },
    scale: function(a, b) {
        for (var c = [], d = 0; 9 > d; d++)
            c[d] = a[d] * b;
        return c
    }
};
var SMALL_NUM = 1E-8;

function intersect_RayTriangle(a, b) {
    var c = b.u;
    var d = b.v;
    var e = b.n;
    var f = V3.sub(a[1], a[0]);
    var g = V3.sub(a[0], b[0]);
    g = -V3.dot(e, g);
    e = V3.dot(e, f);
    if (Math.abs(e) < SMALL_NUM)
        return null;
    e = g / e;
    if (0 > e || 1 < e)
        return null;
    f = V3.scale(f, e);
    a = V3.add(a[0], f);
    f = V3.dot(c, c);
    e = V3.dot(c, d);
    g = V3.dot(d, d);
    b = V3.sub(a, b[0]);
    c = V3.dot(b, c);
    d = V3.dot(b, d);
    b = e * e - f * g;
    g = (e * d - g * c) / b;
    if (0 > g || 1 < g)
        return null;
    d = (e * c - f * d) / b;
    return 0 > d || 1 < g + d ? null : {
        point: a
    }
}
var S2 = {
    identity: function() {
        return {
            x: 1,
            y: 1
        }
    },
    mult: function(a, b) {
        return {
            x: a.x * b.x,
            y: a.y * b.y
        }
    },
    add: function(a, b) {
        return {
            x: a.x + b.x,
            y: a.y + b.y
        }
    },
    scale: function(a, b) {
        return {
            x: a.x * b,
            y: a.y * b
        }
    }
};
Math.sign = function(a) {
    return 0 > a ? -1 : 1
};
Math.arrayToPrecision = function(a, b) {
    for (var c = a.length; 0 <= c; c--)
        a[c] && a[c].toFixed && (a[c] = parseFloat(a[c].toFixed(b)));
    return a
};

function clone(a) {
    if ("object" == typeof a)
        if (geofs.isArray(a)) {
            var b = [];
            for (var c = 0; c < a.length; c++)
                b[c] = clone(a[c])
        } else
            for (c in b = {},
                a)
                b[c] = clone(a[c]);
    else
        b = a;
    return b
}

function absMin(a, b) {
    asbA = Math.abs(a);
    asbB = Math.abs(b);
    return asbA < asbB ? a : b
}

function rad(d) {
    return d * Math.PI / 180.0;
}

function GetDistanceTwo(destination, llaLoccation) {
    var lon1 = destination.lng
    var lat1 = destination.lat
    var lon2 = llaLoccation[1]
    var lat2 = llaLoccation[0]
    let radLat1 = rad(lat1);
    let radLat2 = rad(lat2);
    let a = radLat1 - radLat2;
    let b = rad(lon1) - rad(lon2);
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
        Math.cos(radLat1) * Math.cos(radLat2) *
        Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137;
    return s;
}

function GetAzimuth(latlng1, latlng2) {
    var lon1 = latlng1.lng
    var lat1 = latlng1.lat
    var lon2 = latlng2.lng
    var lat2 = latlng2.lat
    lat1 = rad(lat1);
    lat2 = rad(lat2);
    lon1 = rad(lon1);
    lon2 = rad(lon2);
    let azimuth = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) *
        Math.cos(lat2) * Math.cos(lon2 - lon1);
    azimuth = Math.sqrt(1 - azimuth * azimuth);
    azimuth = Math.cos(lat2) * Math.sin(lon2 - lon1) / azimuth;
    azimuth = Math.asin(azimuth) * 180 / Math.PI;
    if (typeof(azimuth) === "undefined") {
        if (lon1 < lon2) {
            azimuth = 90.0;
        } else {
            azimuth = 270.0;
        }
    }
    return azimuth;
}



function clamp(a, b, c) {
    return void 0 == b || void 0 == c ? a : a < b ? b : a > c ? c : a
}

function boundHours24(a) {
    a %= 24;
    0 > a && (a = 24 + a);
    return a
}

function fixAngle(a) {
    return fixAngle360(a + 180) - 180
}

function fixAngle360(a) {
    a %= 360;
    return 0 <= a ? a : a + 360
}

function fixAngles360(a) {
    for (var b = a.length - 1; 0 <= b; b--)
        a[b] = fixAngle(a[b]);
    return a
}

function fixAngles(a) {
    for (var b = a.length - 1; 0 <= b; b--)
        a[b] = fixAngle(a[b]);
    return a
}

function lookAt(a, b, c) {
    a = lla2xyz(V3.sub(a, b), b);
    c = M33.makeOrthonormalFrame(a, c);
    return M33.getOrientation(c)
}


function exponentialSmoothingV3(a, b, c, d) {
    return [exponentialSmoothing(a, b[0], c, d), exponentialSmoothing(a, b[1], c, d), exponentialSmoothing(a, b[2], c, d)]
}

function exponentialSmoothing(a, b, c, d) {
    SMOOTH_BUFFER[a] || (SMOOTH_BUFFER[a] = {
            Stm1: d || 0,
            Xtm1: d || 0
        },
        c ? (SMOOTH_BUFFER[a].smoothingFactor = c,
            SMOOTH_BUFFER[a].invSmoothingFactor = 1 - c) : (SMOOTH_BUFFER[a].smoothingFactor = SMOOTHING_FACTOR,
            SMOOTH_BUFFER[a].invSmoothingFactor = 1 - SMOOTHING_FACTOR));
    a = SMOOTH_BUFFER[a];
    c = a.Xtm1 * a.smoothingFactor + a.invSmoothingFactor * a.Stm1;
    a.Stm1 = c;
    a.Xtm1 = b;
    return c
}

function getBuildingCollision(a) {
    return null
}

function xyz2lla(a, b) {
    return geofs.api.xyz2lla(a, b)
}

function xy2ll(a, b) {
    var c = [];
    c[0] = a[1] * METERS_TO_LOCAL_LAT;
    c[1] = a[0] / (Math.cos((b[0] + c[0]) * DEGREES_TO_RAD) * MERIDIONAL_RADIUS * DEGREES_TO_RAD);
    return c
}

function lla2xyz(a, b) {
    b = ll2xy(a, b);
    b[2] = a[2];
    return b
}

function ll2xy(a, b) {
    var c = [];
    c[1] = a[0] / METERS_TO_LOCAL_LAT;
    c[0] = a[1] / (1 / (Math.cos((b[0] + a[0]) * DEGREES_TO_RAD) * MERIDIONAL_RADIUS * DEGREES_TO_RAD));
    return c
}

function clamp(a, b, c) {
    return a > c ? c : a < b ? b : a
}

function clamp(a, b, c) {
    return void 0 == b || void 0 == c ? a : a < b ? b : a > c ? c : a
}

function geoDecodeLocation(a, b) {
    geofs.api.reverserGeocode(a, b)
}

var PID = function(a, b, c) {
    this._kp = a;
    this._ki = b;
    this._kd = c;
    this.reset()
};
PID.prototype.reset = function() {
    this._iTerm = this._lastError = this._lastInput = 0
};
PID.prototype.set = function(a, b, c) {
    this._minOutput = b;
    this._maxOutput = c;
    this._setPoint = a
};
PID.prototype.compute = function(a, b) {
    var c = this._setPoint - a;
    this._iTerm += clamp(c * b * this._ki, this._minOutput, this._maxOutput);
    clamp(c * b * this._ki, this._minOutput, this._maxOutput);
    b = (a - this._lastInput) / b;
    this._lastErr = c;
    this._lastInput = a;
    return clamp(this._kp * c + this._iTerm - this._kd * b, this._minOutput, this._maxOutput)
};



function boundHours24(a) {
    a %= 24;
    0 > a && (a = 24 + a);
    return a
}

const hi = {
    on(t, i, e) {
        if (typeof t === 'object') {
            for (const n in t) { this._on(n, t[n], i); }
        } else {
            for (let o = 0, s = (t = u(t)).length; o < s; o++) { this._on(t[o], i, e); }
        }
        return this;
    },
    off(t, i, e) {
        if (t) {
            if (typeof t === 'object') {
                for (const n in t) { this._off(n, t[n], i); }
            } else {
                for (let o = 0, s = (t = u(t)).length; o < s; o++) { this._off(t[o], i, e); }
            }
        } else { delete this._events; }
        return this;
    },
    _on(t, i, e) {
        this._events = this._events || {};
        let n = this._events[t];
        n || (n = [],
                this._events[t] = n),
            e === this && (e = void 0);
        for (var o = {
                fn: i,
                ctx: e,
            }, s = n, r = 0, a = s.length; r < a; r++) {
            if (s[r].fn === i && s[r].ctx === e) { return; }
        }
        s.push(o);
    },
    _off(t, i, e) {
        let n,
            o,
            s;
        if (this._events && (n = this._events[t])) {
            if (i) {
                if (e === this && (e = void 0),
                    n) {
                    for (o = 0,
                        s = n.length; o < s; o++) {
                        const a = n[o];
                        if (a.ctx === e && a.fn === i) {
                            return a.fn = r,
                                this._firingCount && (this._events[t] = n = n.slice()),
                                void n.splice(o, 1);
                        }
                    }
                }
            } else {
                for (o = 0,
                    s = n.length; o < s; o++) { n[o].fn = r; }
                delete this._events[t];
            }
        }
    },
    fire(t, e, n) {
        if (!this.listens(t, n)) { return this; }
        const o = i({}, e, {
            type: t,
            target: this,
            sourceTarget: e && e.sourceTarget || this,
        });
        if (this._events) {
            const s = this._events[t];
            if (s) {
                this._firingCount = this._firingCount + 1 || 1;
                for (let r = 0, a = s.length; r < a; r++) {
                    const h = s[r];
                    h.fn.call(h.ctx || this, o);
                }
                this._firingCount--;
            }
        }
        return n && this._propagateEvent(o),
            this;
    },
    listens(t, i) {
        const e = this._events && this._events[t];
        if (e && e.length) { return !0; }
        if (i) {
            for (const n in this._eventParents) {
                if (this._eventParents[n].listens(t, i)) { return !0; }
            }
        }
        return !1;
    },
    once(t, i, n) {
        if (typeof t === 'object') {
            for (const o in t) { this.once(o, t[o], i); }
            return this;
        }
        var s = e(function() {
            this.off(t, i, n).off(t, s, n);
        }, this);
        return this.on(t, i, n).on(t, s, n);
    },
    addEventParent(t) {
        return this._eventParents = this._eventParents || {},
            this._eventParents[n(t)] = t,
            this;
    },
    removeEventParent(t) {
        return this._eventParents && delete this._eventParents[n(t)],
            this;
    },
    _propagateEvent(t) {
        for (const e in this._eventParents) {
            this._eventParents[e].fire(t.type, i({
                layer: t.target,
                propagatedFrom: t.target,
            }, t), !0);
        }
    },
};
hi.addEventListener = hi.on,
    hi.removeEventListener = hi.clearAllEventListeners = hi.off,
    hi.addOneTimeEventListener = hi.once,
    hi.fireEvent = hi.fire,
    hi.hasEventListeners = hi.listens;
window.hi = hi;

var PAGE_PATH = 'http://localhost:3030/proxy/';
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
export { V2, V3, M33, M3, S2, PID };


export {
    clone,
    xyz2lla,
    clamp,
    ll2xy,
    lla2xyz,
    geoDecodeLocation,
    getBuildingCollision,
    xy2ll,
    lookAt,
    intersect_RayTriangle,
    absMin,
    boundHours24,
    fixAngle,
    fixAngle360,
    fixAngles360,
    fixAngles,
    exponentialSmoothing,
    exponentialSmoothingV3,
    GetAzimuth,
    GetDistanceTwo
}
export {
    GRAVITY,
    PAGE_PATH,
    FEET_TO_METERS,
    HALF_PI,
    PI,
    DEGREES_TO_RAD,
    RAD_TO_DEGREES,
    KMH_TO_MS,
    METERS_TO_LOCAL_LAT,
    WGS84_TO_EGM96,
    EGM96_TO_WGS84,
    TWO_PI,
    MS_TO_KNOTS,
    KNOTS_TO_MS,
    KMH_TO_KNOTS,
    AXIS_TO_INDEX,
    AXIS_TO_VECTOR,
    KELVIN_OFFSET,
    LONGITUDE_TO_HOURS,
    METERS_TO_FEET,
    TEMPERATURE_LAPSE_RATE,
    AIR_PRESSURE_SL,
    AIR_DENSITY_SL,
    AIR_TEMP_SL,
    DRAG_CONSTANT,
    MIN_DRAG_COEF,
    TOTAL_DRAG_CONSTANT,
    IDEAL_GAS_CONSTANT,
    MOLAR_MASS_DRY_AIR,
    GAS_CONSTANT,
    GR_LM,
    DEFAULT_AIRFOIL_ASPECT_RATIO,
    FOV,
    VIEWPORT_REFERENCE_WIDTH,
    VIEWPORT_REFERENCE_HEIGHT,
    SMOOTH_BUFFER,
    SMOOTHING_FACTOR,
    SIX_STEP_WARNING
}


export default utils;