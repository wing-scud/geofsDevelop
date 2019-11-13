import { clamp } from "../utils/utils"
import geofs from "../geofs"
var animation = {};
animation.init = function() {};
animation.getRampRatio = function(a, b) {
    if (b < 0 || b > 1) { return 0; }
    let c = a.length - 1,
        d = 1 / c,
        e = Math.ceil(b / d),
        f = clamp(e - 1, 0, c - 1);
    e = clamp(e, 1, c);
    c = a[f];
    a = a[e];
    return a > c ? c + (b - f * d) / d * (a - c) : a + (d - (b - f * d)) / d * (c - a);
};


animation.getRampValue = function(a, b) {
    let c = 0;
    b > a[0] && b < a[3] && (c = b < a[1] ? 1 / (a[1] - a[0]) * (b - a[0]) : b > a[2] ? 1 - 1 / (a[3] - a[2]) * (b - a[2]) : 1);
    return c;
};
animation.values = {};
animation.resetValues = function(a) {
    animation.values = a || {};
};
animation.getValue = function(a) {
    return animation.values[a] || 0;
};
animation.filter = function(a, b) {
    if (a.value == 'random') { b = Math.random(); } else if ($.isFunction(a.value)) {
        if (b = 0, !geofs.aircraft.instance.aircraftRecord.isCommunity) {
            try {
                b = a.value();
            } catch (f) {
                b = 0;
            }
        }
    } else { b = b || animation.values[a.value] || 0; }
    if (a.ramp) { b = animation.getRampValue(a.ramp, b); } else if (a.valueRamp) { b = animation.getRampRatio(a.valueRamp, b); } else if (a.ratioRamp) {
        var c = animation.getRampRatio(a.ratioRamp, b);
        b *= c;
    }
    a.value == 'strobe' ? (b = 0,
        geofs.utils.fastNow() % 1500 > 1400 && (b = 1)) : a.value == 'strobe2' ? (b = 0,
        geofs.utils.fastNow() % 1800 > 1700 && (b = 1)) : a.value == 'strobe3' && (b = 0,
        c = geofs.utils.fastNow() % 1800,
        c > 100 && c < 200 || c > 1700) && (b = 1);
    a.floor && (b = Math.floor(b));
    a.abs && (b = Math.abs(b));
    a.between && (b = b > a.between[0] && b < a.between[1] ? 1 : 0);
    a.delay && (b -= a.delay,
        b = clamp(b, 0, 1),
        a.delay < 0 && (b += a.delay));
    a.threshold && (b = b < a.threshold ? 0 : b - a.threshold);
    a.negthreshold && (b = b > a.negthreshold ? 0 : b - a.negthreshold);
    a.eq && (b = b == a.eq ? 1 : 0);
    a.notEq && (b = b != a.notEq ? 1 : 0);
    a.gt && (b = b > a.gt ? 1 : 0);
    a.lt && (b = b < a.lt ? 1 : 0);
    a.min && b < a.min && (b = a.min);
    a.max && b > a.max && (b = a.max);
    c = !1;
    if (a.when) {
        for (var d = 0, e = a.when.length; d < e; d++) {
            if (a.when[d] == b) {
                c = !0;
                break;
            }
        }
        b = c;
    } else if (a.whenNot) {
        c = !0;
        d = 0;
        for (e = a.whenNot.length; d < e; d++) {
            if (a.whenNot[d] == b) {
                c = !1;
                break;
            }
        }
        b = c;
    }
    a.preoffset && (b += a.preoffset);
    a.log && (b = Math.log(b));
    a.ratio && (b *= a.ratio);
    a.power && (b = Math.pow(b, a.power));
    a.offset && (b += a.offset);
    a.set && (b = b ? a.set : a.unset || 0);
    a.fmin && b < a.fmin && (b = a.fmin);
    a.fmax && b > a.fmax && (b = a.fmax);
    a.concat && (Array.isArray(a.concat) || (a.concat = [a.concat]),
        a.concat.forEach((a) => {
            b += animation.values[a] || a;
        }));
    return b;
};
export default animation;