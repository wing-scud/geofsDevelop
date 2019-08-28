import { M33, V2,V3 } from './utils'
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

var runwayslights = function(a) {
    this.runway = a;
    this.on = !1;
    this.lights = [];
    this.papis = [];
    this.localStepXm = a.widthMeters / 33;
    this.localStepYm = 50;
    let b = M33.identity();
    b = M33.rotationZ(b, a.headingRad);
    this.stepX = xy2ll(V2.scale(b[0], this.localStepXm), a.threshold1);
    this.stepY = xy2ll(V2.scale(b[1], this.localStepYm), a.threshold1);
    if (geofs.preferences.showPapi) {
        let c = xy2ll(V2.scale(b[0], 9), a.threshold1),
            d = V2.add(a.threshold1, xy2ll(V2.scale(b[0], a.widthMeters / 2 + 15), a.threshold1));
        d = V2.add(d, V2.scale(this.stepY, 5));
        this.addPapi(d, c);
        c = xy2ll(V2.scale(b[0], -9), a.threshold2);
        d = V2.add(a.threshold2, xy2ll(V2.scale(b[0], -a.widthMeters / 2 - 15), a.threshold2));
        d = V2.add(d, V2.scale(this.stepY, -5));
        this.addPapi(d, c);
    }
};
runwayslights.turnAllOff = function() {
    for (const a in geofs.fx.litRunways) { geofs.fx.litRunways[a].turnOff(); }
};
runwayslights.turnAllOn = function() {
    for (const a in geofs.fx.litRunways) { geofs.fx.litRunways[a].turnOn(); }
};
runwayslights.updateAll = function() {
    for (var a in geofs.runways.nearRunways) {
        const b = geofs.runways.nearRunways[a];
        geofs.fx.litRunways[b.id] || (geofs.fx.litRunways[b.id] = new runwayslights(b));
    }
    for (a in geofs.fx.litRunways) { geofs.runways.nearRunways[a] || geofs.fx.litRunways[a].destroy(); }
    geofs.isNight ? runwayslights.turnAllOn() : runwayslights.turnAllOff();
};
runwayslights.prototype = {
    turnOn() {
        if (!this.on) {
            let a = geofs.fx.templateCenter[1] - 1,
                b = geofs.fx.thresholdLightTemplate[a],
                c = b[1];
            b = -c;
            for (var d = a, e = geofs.fx.thresholdLightTemplate.length; d < e; d++) {
                var f = geofs.fx.thresholdLightTemplate[d];
                a = f[0];
                var g = b;
                for (f = b + f[1]; g < f; g++) {
                    this.addRow(this.runway.threshold1, a, -g),
                        b++;
                }
            }
            d = V2.add(this.runway.threshold1, V2.scale(this.stepY, c));
            c = (this.runway.lengthMeters - this.localStepYm * c) / this.localStepYm;
            a = geofs.fx.thresholdLightTemplate[0][0];
            for (b = 0; b < c; b++) { this.addRow(d, a, b); }
            a = geofs.fx.templateCenter[1] - 1;
            b = geofs.fx.thresholdLightTemplate[a];
            c = b[1];
            b = -c;
            d = a;
            for (e = geofs.fx.thresholdLightTemplate.length; d < e; d++) {
                for (f = geofs.fx.thresholdLightTemplate[d],
                    a = f[0],
                    g = b,
                    f = b + f[1]; g < f; g++) {
                    this.addRow(this.runway.threshold2, a, g),
                        b++;
                }
            }
            this.on = !0;
        }
    },
    turnOff() {
        if (this.on) {
            for (let a = 0; a < this.lights.length; a++) { this.lights[a].destroy(); }
            this.on = !1;
        }
    },
    addRow(a, b, c) {
        a = V2.add(a, V2.scale(this.stepY, c));
        c = 0;
        for (let d = b.length; c < d; c++) {
            const e = b[c];
            if (e) {
                const f = V2.add(a, V3.scale(this.stepX, c - geofs.fx.templateCenter[0]));
                this.addLight(f, e);
            }
        }
    },
    addPapi(a, b) {
        this.papis = this.papis || [];
        a[2] = 0.5;
        this.papis.push(new geofs.fx.papi(a, b));
    },
    addLight(a, b) {
        a[2] = 0.2;
        this.lights.push(new geofs.light(a, b, geofs.fx.lightBillboardOptions));
    },
    destroy() {
        if (this.lights) {
            for (var a = 0; a < this.lights.length; a++) { this.lights[a].destroy(); }
            this.lights = [];
        }
        if (this.papis) {
            for (a = 0; a < this.papis.length; a++) { this.papis[a].destroy(); }
            this.papis = [];
        }
    },
};

function xy2ll(a, b) {
    var c = [];
    c[0] = a[1] * METERS_TO_LOCAL_LAT;
    c[1] = a[0] / (Math.cos((b[0] + c[0]) * DEGREES_TO_RAD) * MERIDIONAL_RADIUS * DEGREES_TO_RAD);
    return c
}
export default runwayslights;