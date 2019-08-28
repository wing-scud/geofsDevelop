import { V2, V3 } from './utils'

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

var runways = {
    runwayNumberLimit: 4,
    refreshRate: 1E4,
    refreshDistanceThreshold: 0.1,
    modelVisibility: !1,
    defaultPadding: 1E3,
    tileLength: 278,
    modelRunwayWidth: 60,
    thresholdLength: 582,
    modelVerticalOffset: 0.1,
    imageryLayers: [],
    imageryOpacity: 0.7,
    redraw() {
        runways.modelVisibility && (runways.setRunwayModelVisibility(!1),
            runways.setRunwayModelVisibility(!0));
    },
    refresh() {
        let a = geofs.aircraft.instance.llaLocation;
        // clearInterval(runwaysCheckTimeout);
        // runwaysCheckTimeout = setInterval(() => {
        //     runways.refresh();
        // }, runways.refreshRate);
        if (!(V2.length(V2.sub(a, geofs.fx.lastRunwayTestLocation)) < runways.refreshDistanceThreshold)) {
            geofs.fx.lastRunwayTestLocation = a;
            a = runways.getNearRunways(a, runways.runwayNumberLimit);
            for (var b = {}, c = 0; c < a.length; c++) {
                const d = runways.generateRunwayId(a[c]);
                b[d] || (b[d] = new runways.runway(a[c], d));
            }
            for (c in runways.nearRunways) {
                b[c] || runways.nearRunways[c].destroy();
            }
            console.log(b + "   b1")
            runways.nearRunways = Object.assign({}, b);
            console.log(typeof(runways.nearRunways) + " runways.nearRunways2")
            $('body').trigger('runwayUpdate');
        }
    },
    reset() {
        Object.keys(runways.nearRunways).forEach(a => runways.nearRunways[a].destroy());
        runways.nearRunways = {};
        runways.refresh();
    },
    getNearestRunway(a) {
        let b = 0;
        console.log("getNearestRunway")
        do { var c = runways.getNearRunways(a, 1, b++); }
        while (!c.length && b < 5);
        return c[0] ? (a = c[0],
            b = runways.generateRunwayId(a),
            runways.nearRunways[b] || (runways.nearRunways[b] = new runways.runway(a, b)),
            runways.nearRunways[b]) : null;
    },
    getNearRunways(a, b, c) {
        c = c || 0;
        for (var d = parseInt(a[0]), e = parseInt(a[1]), f = [], g, h = -c; h <= c; h++) {
            g = majorRunwayGrid[e + h] || {};
            for (let k = -c; k <= c; k++) { g[d + k] && (f = f.concat(g[d + k])); }
        }
        runways.setRunwayDistance(a, f);
        f.sort((a, b) => a.distance - b.distance);
        return f.slice(0, b);
    },
    setRunwayDistance(a, b) {
        for (let c = 0, d = b.length; c < d; c++) {
            const e = b[c];
            e.distance = geofs.utils.llaDistanceInMeters(a, [e[4], e[5]]);
        }
    },
    setRunwayModelVisibility(a) {
        console.log(typeof(runways.nearRunways) + " runways.nearRunways")
        console.log(runways.nearRunways + " runways.nearRunways")
        Object.keys(runways.nearRunways).forEach((b) => {
            runways.nearRunways[b].destroyRunwayModel();
            a && runways.nearRunways[b].generateRunwayModel();
        });
        runways.modelVisibility = a;
    },
    env: {},
    getRotationCanvas(a) {
        return new Promise(((b) => {
            if (runways.env[a]) { b(runways.env[a]); } else {
                const c = document.createElement('img');
                c.onload = function() {
                    env = {
                        image: this,
                    };
                    env.canvas = document.createElement('canvas');
                    env.canvas.width = this.width;
                    env.canvas.height = this.width;
                    env.context = env.canvas.getContext('2d');
                    env.context.translate(this.width / 2, this.width / 2);
                    runways.env[a] = env;
                    b(env);
                };
                c.src = a;
            }
        }), );
    },
    asyncSetImageLayerRotationPosition(a, b, c, d) {
        let e,
            f,
            g;
        return $jscomp.asyncExecutePromiseGeneratorProgram((h) => {
            if (h.nextAddress == 1) { return h.yield(runways.getRotationCanvas(a), 2); }
            e = h.yieldResult;
            e.context.clearRect(-e.image.width, -e.image.width, 2 * e.image.width, 2 * e.image.width);
            e.context.save();
            e.context.rotate(b);
            e.context.drawImage(e.image, -e.image.width / 2, -(e.image.height / 2));
            f = {
                rectangle: c,
                alpha: runways.imageryOpacity,
                minimumTerrainLevel: 12,
            };
            e.canvas.toBlob ? e.canvas.toBlob((a) => {
                a = new Cesium.ImageryLayer(new Cesium.SingleTileImageryProvider({
                    url: URL.createObjectURL(a),
                    rectangle: c,
                }), f);
                geofs.api.viewer.imageryLayers.add(a);
                d.push(a);
            }) : (g = new Cesium.ImageryLayer(new Cesium.SingleTileImageryProvider({
                    url: e.canvas.toDataURL(),
                    rectangle: c,
                }), f),
                geofs.api.viewer.imageryLayers.add(g),
                d.push(g));
            e.context.restore();
            h.jumpToEnd();
        });
    },
};
runways.generateRunwayId = function(a) {
    return a[0] + a[1] + a[3];
};
runways.runway = function(a, b) {
    this.id = b || runways.generateRunwayId(a);
    this.icao = a[0];
    this.location = [a[4], a[5], 0];
    this.heading = fixAngle(a[3]);
    this.headingRad = this.heading * DEGREES_TO_RAD;
    this.lengthFeet = a[1];
    this.widthFeet = a[2];
    this.lengthMeters = this.lengthFeet * FEET_TO_METERS;
    this.widthMeters = this.widthFeet * FEET_TO_METERS;
    this.threshold1 = this.location;
    this.padding = a[6] || runways.defaultPadding;
    this.meterlla = xy2ll([Math.sin(this.headingRad), Math.cos(this.headingRad)], this.threshold1);
    this.lengthInLla = V2.scale(this.meterlla, this.lengthMeters);
    this.widthInLla = xy2ll([-Math.cos(this.headingRad) * this.widthMeters, Math.sin(this.headingRad) * this.widthMeters], this.threshold1);
    this.meterAcrossInLla = V3.scale(this.widthInLla, 1 / this.widthMeters);
    this.threshold2 = V2.add(this.threshold1, this.lengthInLla);
    runways.modelVisibility && this.generateRunwayModel();
};
runways.runway.prototype = {
    generateRunwayModel() {
        if (!this.modelExists) {
            let a = clamp(this.widthMeters / runways.modelRunwayWidth, 0.5, 10),
                b = new Cesium.Color(0.5, 0.5, 0.5, 0.7);
            if (geofs.retroOn) {
                b = new Cesium.GeometryInstance({
                        geometry: new Cesium.GroundPolylineGeometry({
                            positions: Cesium.Cartesian3.fromDegreesArray([this.threshold1[1] - this.widthInLla[1], this.threshold1[0] - this.widthInLla[0], this.threshold1[1] + this.widthInLla[1], this.threshold1[0] + this.widthInLla[0], this.threshold2[1] + this.widthInLla[1], this.threshold2[0] + this.widthInLla[0], this.threshold2[1] - this.widthInLla[1], this.threshold2[0] - this.widthInLla[0]]),
                            width: 10,
                            loop: !0,
                        }),
                        attributes: {
                            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString('#2caecf')),
                        },
                    }),
                    geofs.api.viewer.scene.groundPrimitives.add(new Cesium.GroundPolylinePrimitive({
                        geometryInstances: b,
                        appearance: new Cesium.PolylineColorAppearance(),
                    }));
            } else if (Cesium.Entity.supportsMaterialsforEntitiesOnTerrain(geofs.api.viewer.scene) && !geofs.isApp) {
                this.entities = [];
                var c = V2.scale(this.meterlla, runways.thresholdLength * a),
                    d = geofs.api.viewer.entities.add({
                        polygon: {
                            hierarchy: {
                                positions: [new Cesium.Cartesian3.fromDegrees(this.threshold1[1] - this.widthInLla[1], this.threshold1[0] - this.widthInLla[0], 0), new Cesium.Cartesian3.fromDegrees(this.threshold1[1] + c[1] - this.widthInLla[1], this.threshold1[0] + c[0] - this.widthInLla[0], 0), new Cesium.Cartesian3.fromDegrees(this.threshold1[1] + c[1] + this.widthInLla[1], this.threshold1[0] + c[0] + this.widthInLla[0], 0), new Cesium.Cartesian3.fromDegrees(this.threshold1[1] + this.widthInLla[1], this.threshold1[0] + this.widthInLla[0], 0)],
                            },
                            material: new Cesium.ImageMaterialProperty({
                                image: 'models/objects/runway/threshold2.jpg',
                                color: b,
                            }),
                            classificationType: Cesium.ClassificationType.TERRAIN,
                            stRotation: this.headingRad - HALF_PI,
                            shadows: Cesium.ShadowMode.ENABLED,
                        },
                        interleave: !1,
                        allowPicking: !1,
                    });
                this.entities.push(d);
                d = geofs.api.viewer.entities.add({
                    polygon: {
                        hierarchy: {
                            positions: [new Cesium.Cartesian3.fromDegrees(this.threshold2[1] - this.widthInLla[1], this.threshold2[0] - this.widthInLla[0], 0), new Cesium.Cartesian3.fromDegrees(this.threshold2[1] - c[1] - this.widthInLla[1], this.threshold2[0] - c[0] - this.widthInLla[0], 0), new Cesium.Cartesian3.fromDegrees(this.threshold2[1] - c[1] + this.widthInLla[1], this.threshold2[0] - c[0] + this.widthInLla[0], 0), new Cesium.Cartesian3.fromDegrees(this.threshold2[1] + this.widthInLla[1], this.threshold2[0] + this.widthInLla[0], 0)],
                        },
                        material: new Cesium.ImageMaterialProperty({
                            image: 'models/objects/runway/threshold2.jpg',
                            color: b,
                        }),
                        classificationType: Cesium.ClassificationType.TERRAIN,
                        stRotation: this.headingRad + HALF_PI,
                        shadows: Cesium.ShadowMode.ENABLED,
                    },
                    interleave: !1,
                    allowPicking: !1,
                });
                this.entities.push(d);
                var e = Math.ceil((this.lengthMeters - 2 * runways.thresholdLength * a) / (runways.tileLength * a));
                a = V2.scale(this.meterlla, runways.tileLength * a);
                c = [this.threshold1[0] + c[0], this.threshold1[1] + c[1]];
                for (let f = 0; f <= e; f++) {
                    d = geofs.api.viewer.entities.add({
                            polygon: {
                                hierarchy: {
                                    positions: [new Cesium.Cartesian3.fromDegrees(c[1] - this.widthInLla[1], c[0] - this.widthInLla[0], 0), new Cesium.Cartesian3.fromDegrees(c[1] + a[1] - this.widthInLla[1], c[0] + a[0] - this.widthInLla[0], 0), new Cesium.Cartesian3.fromDegrees(c[1] + a[1] + this.widthInLla[1], c[0] + a[0] + this.widthInLla[0], 0), new Cesium.Cartesian3.fromDegrees(c[1] + this.widthInLla[1], c[0] + this.widthInLla[0], 0)],
                                },
                                material: new Cesium.ImageMaterialProperty({
                                    image: 'models/objects/runway/tile2.jpg',
                                    color: b,
                                }),
                                classificationType: Cesium.ClassificationType.TERRAIN,
                                stRotation: this.headingRad + HALF_PI,
                                shadows: Cesium.ShadowMode.ENABLED,
                            },
                            interleave: !1,
                            allowPicking: !1,
                        }),
                        c = V2.add(c, a),
                        this.entities.push(d);
                }
            } else {
                this.imageryLayers = [],
                    b = 0.5 * this.lengthMeters,
                    V2.scale(this.meterlla, b),
                    d = 0.5 * b,
                    b = V2.scale(this.meterlla, d),
                    d = xy2ll([d, d], this.threshold1),
                    e = [this.threshold1[0] + b[0], this.threshold1[1] + b[1]],
                    e = Cesium.Rectangle.fromDegrees(e[1] - d[1], e[0] - d[0], e[1] + d[1], e[0] + d[0]),
                    runways.asyncSetImageLayerRotationPosition('models/objects/runway/full.jpg', this.headingRad - HALF_PI, e, this.imageryLayers),
                    e = [this.threshold2[0] - b[0], this.threshold2[1] - b[1]],
                    e = Cesium.Rectangle.fromDegrees(e[1] - d[1], e[0] - d[0], e[1] + d[1], e[0] + d[0]),
                    runways.asyncSetImageLayerRotationPosition('models/objects/runway/full.jpg', this.headingRad + HALF_PI, e, this.imageryLayers);
            }
        }
    },
    destroyRunwayModel() {
        geofs.api.destroyModel(this.threshold1Model);
        geofs.api.destroyModel(this.threshold2Model);
        this.tiles && this.tiles.forEach((a) => {
            geofs.api.destroyModel(a);
        });
        this.tiles = null;
        this.entities && this.entities.forEach((a) => {
            geofs.api.viewer.entities.remove(a);
        });
        this.entities = null;
        this.imageryLayers && (this.imageryLayers.forEach((a) => {
                geofs.api.viewer.imageryLayers.remove(a, !0);
            }),
            this.imageryLayers = null);
        this.modelExists = !1;
    },
    destroy() {
        this.destroyRunwayModel();
    },
};

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

function xy2ll(a, b) {
    var c = [];
    c[0] = a[1] * METERS_TO_LOCAL_LAT;
    c[1] = a[0] / (Math.cos((b[0] + c[0]) * DEGREES_TO_RAD) * MERIDIONAL_RADIUS * DEGREES_TO_RAD);
    return c
}
var majorRunwayGrid = {
    "-107": {
        "37": [
            ["00C", 5013, 0, 200.78, 37.209599, -107.866135],
            ["2V1", 9009, 0, 203.74, 37.296429, -107.050385],
            ["KDRO", 9201, 0, 217.31, 37.161549, -107.744171],
            ["KTEX", 6858, 100, 284.94, 37.951328, -107.89695]
        ],
        "41": [
            ["9U4", 5500, 0, 253, 41.040497, -107.487717],
            ["KRWL", 7000, 100, 234, 41.811356, -107.189362]
        ],
        "40": [
            ["KCAG", 5596, 100, 262.96, 40.496151, -107.511642],
            ["KEEO", 6500, 60, 219.47, 40.055679, -107.878517],
            ["KHDN", 9987, 150, 293.78, 40.475639, -107.201141]
        ],
        "32": [
            ["KDMN", 5674, 60, 231.49, 32.266258, -107.716858],
            ["KDMN", 6619, 75, 269.73, 32.263103, -107.706978]
        ],
        "35": [
            ["KGNT", 7178, 75, 325.06, 35.161221, -107.896446]
        ],
        "38": [
            ["KMTJ", 7501, 100, 319.49, 38.493561, -107.887779],
            ["KMTJ", 10008, 150, 359.82, 38.502377, -107.892632]
        ],
        "39": [
            ["KRIL", 6987, 100, 272.85, 39.525837, -107.714531]
        ],
        "33": [
            ["KTCS", 7207, 75, 324.63, 33.227093, -107.263382]
        ],
        "43": [
            ["KWRL", 7004, 100, 355.04, 43.957031, -107.952003]
        ],
        "24": [
            ["MMCL", 7529, 148, 213.02, 24.773592, -107.46904]
        ]
    },
    "-116": {
        "35": [
            ["00CA", 6000, 80, 234, 35.355358, -116.880203]
        ],
        "39": [
            ["05U", 7300, 0, 366, 39.594219, -116.006416]
        ],
        "41": [
            ["10U", 6700, 0, 216, 41.960667, -116.180336]
        ],
        "53": [
            ["CYET", 5989, 100, 270.64, 53.578835, -116.451172]
        ],
        "36": [
            ["DRA", 7515, 0, 214, 36.627941, -116.025627],
            ["KBTY", 5600, 60, 355, 36.853397, -116.786163]
        ],
        "40": [
            ["KBAM", 7294, 150, 229.02, 40.606953, -116.865089],
            ["KBAM", 7299, 100, 319.15, 40.590118, -116.865013]
        ],
        "33": [
            ["KBNG", 5200, 150, 274, 33.922569, -116.842003],
            ["KPSP", 10004, 150, 323.48, 33.817867, -116.497139],
            ["KTRM", 8517, 150, 360.02, 33.615776, -116.156418],
            ["L08", 5006, 0, 268.84, 33.259163, -116.312759]
        ],
        "43": [
            ["KBOI", 9750, 150, 295.18, 43.558651, -116.209244],
            ["KBOI", 9986, 150, 295.19, 43.558552, -116.202736],
            ["KEUL", 5495, 100, 315.16, 43.636497, -116.628418]
        ],
        "47": [
            ["KCOE", 5394, 75, 212.32, 47.779079, -116.809143],
            ["KCOE", 7387, 100, 250.03, 47.778809, -116.808807],
            ["S83", 5500, 0, 269, 47.547832, -116.177322]
        ],
        "34": [
            ["KDAG", 5119, 100, 230.43, 34.86097, -116.779495],
            ["KDAG", 6392, 150, 270.05, 34.851471, -116.776489],
            ["L35", 5844, 0, 269.74, 34.263676, -116.846077]
        ],
        "44": [
            ["KMYL", 6107, 75, 358.63, 44.881313, -116.101006]
        ],
        "32": [
            ["KSDM", 7991, 150, 275.62, 32.571644, -116.967651],
            ["KSEE", 5337, 100, 282.11, 32.826473, -116.964745],
            ["MMTJ", 9664, 144, 278.91, 32.538998, -116.954422]
        ],
        "48": [
            ["KSZT", 5495, 75, 212.08, 48.305927, -116.554115]
        ],
        "37": [
            ["L23", 5800, 0, 374, 37.095005, -116.315796],
            ["TNX", 12000, 0, 335, 37.779739, -116.769867]
        ],
        "45": [
            ["S80", 5092, 0, 270.6, 45.942486, -116.113373]
        ]
    },
    "-104": {
        "38": [
            ["00V", 6001, 0, 340.5, 38.937946, -104.567551],
            ["KCOS", 8264, 150, 315.16, 38.807083, -104.694878],
            ["KCOS", 11029, 150, 360.05, 38.793816, -104.715927],
            ["KCOS", 13515, 150, 360.07, 38.779011, -104.685799],
            ["KPUB", 10480, 150, 268.27, 38.287987, -104.473488],
            ["KPUB", 8315, 150, 358.33, 38.281384, -104.503227]
        ],
        "37": [
            ["07V", 5792, 0, 256.82, 37.525604, -104.999771],
            ["KTAD", 5499, 100, 224.84, 37.266434, -104.329124]
        ],
        "42": [
            ["7V6", 5499, 0, 332.1, 42.252945, -104.723518],
            ["KEAN", 5891, 75, 269.41, 42.055592, -104.917732],
            ["KLSK", 5050, 75, 295.59, 42.750813, -104.396049],
            ["KTOR", 5473, 75, 295.49, 42.060429, -104.144997]
        ],
        "41": [
            ["82V", 5336, 0, 271, 41.152554, -104.120422],
            ["KCYS", 9260, 150, 275.29, 41.154415, -104.787628],
            ["KCYS", 6687, 0, 315.34, 41.149197, -104.810364]
        ],
        "50": [
            ["CYQR", 6188, 150, 269.98, 50.429123, -104.655769],
            ["CYQR", 7911, 150, 317.95, 50.424156, -104.649704]
        ],
        "34": [
            ["I58", 5005, 0, 201.44, 34.938942, -104.637299],
            ["KFSU", 5802, 75, 225.98, 34.493679, -104.209229],
            ["KFSU", 5294, 60, 271.05, 34.486729, -104.208511]
        ],
        "39": [
            ["KAPA", 7007, 77, 357.96, 39.559772, -104.852837],
            ["KAPA", 10008, 100, 357.96, 39.556705, -104.850212],
            ["KBKF", 11008, 150, 331.13, 39.688534, -104.742485],
            ["KDEN", 11980, 151, 90.54, 39.877552, -104.66227],
            ["KDEN", 12007, 151, 180.53, 39.861244, -104.660156],
            ["KDEN", 11980, 150, 270.5, 39.840652, -104.683899],
            ["KDEN", 11980, 150, 270.54, 39.877239, -104.619453],
            ["KDEN", 16011, 200, 360.51, 39.851883, -104.696587],
            ["KDEN", 12007, 150, 360.51, 39.864101, -104.687241],
            ["KDEN", 12007, 150, 360.53, 39.828308, -104.660553],
            ["KDEN", 12008, 150, 360.54, 39.832016, -104.641708],
            ["KFTG", 7986, 100, 271.16, 39.79356, -104.536758],
            ["KFTG", 8006, 100, 359.99, 39.763638, -104.524231]
        ],
        "32": [
            ["KATS", 6302, 150, 224.95, 32.858273, -104.460564],
            ["KATS", 5391, 150, 315.12, 32.847717, -104.461296],
            ["KCNM", 7857, 150, 224.05, 32.338131, -104.256538],
            ["KCNM", 5327, 75, 270.01, 32.342293, -104.253448],
            ["KCNM", 5846, 100, 334.11, 32.328457, -104.262581]
        ],
        "43": [
            ["KECS", 5298, 75, 323.96, 43.879429, -104.309647]
        ],
        "47": [
            ["KGDV", 5696, 100, 316.41, 47.132072, -104.797722],
            ["KSDY", 5700, 100, 203.69, 47.711952, -104.191772]
        ],
        "40": [
            ["KGXY", 5792, 100, 285.46, 40.426441, -104.626022],
            ["KGXY", 10005, 100, 357.81, 40.428982, -104.630867]
        ],
        "30": [
            ["KMRF", 5311, 75, 225.2, 30.375969, -104.008484],
            ["KMRF", 6217, 75, 315.41, 30.365925, -104.011635]
        ],
        "33": [
            ["KROW", 13004, 150, 225.05, 33.311291, -104.506729],
            ["KROW", 7427, 200, 315.21, 33.299526, -104.525581],
            ["KROW", 10016, 100, 360.12, 33.287655, -104.539276]
        ],
        "36": [
            ["KRTN", 6329, 75, 214.12, 36.748531, -104.499123],
            ["NM67", 5445, 40, 351, 36.853584, -104.447212]
        ],
        "31": [
            ["KVHN", 6003, 75, 224.44, 31.065941, -104.777809],
            ["KVHN", 5346, 75, 264.4, 31.056036, -104.774467],
            ["XS44", 6300, 60, 270, 31.015278, -104.202339]
        ],
        "24": [
            ["MM11", 5104, 46, 248.1, 24.420748, -104.878006],
            ["MMDO", 9550, 148, 218.05, 24.135355, -104.519463]
        ],
        "19": [
            ["MM63", 5570, 55, 249.5, 19.747795, -104.328667],
            ["MMZO", 7199, 148, 286.13, 19.14201, -104.548431]
        ],
        "21": [
            ["MMEP", 7587, 148, 206.27, 21.428751, -104.837616]
        ],
        "29": [
            ["T77", 5213, 0, 356.61, 29.627953, -104.361031]
        ],
        "44": [
            ["W43", 5495, 0, 322.15, 44.656906, -104.561317]
        ],
        "27": [
            ["Z22T", 5580, 0, 310.006, 27.488167, -104.691261]
        ]
    },
    "-85": {
        "32": [
            ["06A", 5004, 0, 308.93, 32.456158, -85.673706],
            ["AL73", 5300, 46, 318, 32.486481, -85.769814],
            ["KALX", 5427, 96, 357.53, 32.907211, -85.96257],
            ["KAUO", 5276, 100, 1.03, 32.605728, -85.436348]
        ],
        "31": [
            ["0GE2", 5612, 0, 297, 31.136961, -85.038582],
            ["KDHN", 8504, 150, 315.03, 31.314089, -85.442368],
            ["KDHN", 5012, 150, -0.02, 31.312794, -85.445557],
            ["KEDN", 5101, 100, 231.79, 31.304028, -85.89344],
            ["KEUF", 5011, 100, 3.6, 31.944452, -85.129433],
            ["KOZR", 5012, 150, 0.99, 31.2708, -85.71122]
        ],
        "43": [
            ["3FM", 5827, 0, -0.34, 43.427937, -85.996483]
        ],
        "34": [
            ["4A9", 5003, 0, 219.47, 34.478996, -85.716118],
            ["9A5", 5418, 0, 200.72, 34.695457, -85.28727],
            ["KRMG", 6009, 150, 184.93, 34.359184, -85.157738]
        ],
        "37": [
            ["K24", 5007, 0, 355.37, 37.002853, -85.102043],
            ["KAAS", 5002, 75, 229.83, 37.362682, -85.302834],
            ["KBRY", 5007, 75, 201.47, 37.820705, -85.496452],
            ["KFTK", 5255, 75, 328.35, 37.899902, -85.968864],
            ["KFTK", 5591, 150, 356.63, 37.899418, -85.969208],
            ["KGLW", 5296, 100, 251.37, 37.034088, -85.94516]
        ],
        "29": [
            ["KAAF", 5071, 150, 240.21, 29.729366, -85.023323],
            ["KAAF", 5355, 150, 315.41, 29.722481, -85.023056],
            ["KAAF", 5261, 150, 0.31, 29.722052, -85.02317]
        ],
        "40": [
            ["KAID", 5395, 100, 295.09, 40.105671, -85.605438],
            ["KFWA", 11995, 150, 224.21, 40.986263, -85.182335],
            ["KFWA", 7997, 150, 314.82, 40.97805, -85.183067],
            ["KMIE", 6498, 150, 316.17, 40.235863, -85.389748],
            ["KMZZ", 6000, 100, 217.52, 40.496517, -85.673759]
        ],
        "33": [
            ["KANB", 7002, 150, 228.38, 33.59454, -85.849495],
            ["KCTJ", 5509, 100, 343.87, 33.624435, -85.14975],
            ["KLGC", 5008, 100, 204.33, 33.016811, -85.070076],
            ["KLGC", 5600, 150, 306.8, 33.002731, -85.064507]
        ],
        "41": [
            ["KASW", 5992, 100, 268.81, 41.272743, -85.824631],
            ["KEKM", 6490, 120, 269.89, 41.720924, -85.99556],
            ["KIRS", 5702, 100, -0.3, 41.804588, -85.440826]
        ],
        "42": [
            ["KAZO", 6501, 150, 351.13, 42.224823, -85.548248],
            ["KBTL", 9997, 150, 222.54, 42.315929, -85.240929],
            ["KGRR", 9984, 150, 261.29, 42.880779, -85.505272],
            ["KGRR", 8503, 150, 351.33, 42.866474, -85.514465]
        ],
        "39": [
            ["KBAK", 6399, 150, 224.97, 39.267654, -85.888878],
            ["KCEV", 6506, 100, 0.33, 39.689583, -85.130836],
            ["KGEZ", 5005, 100, 184.52, 39.593266, -85.803268],
            ["KMQJ", 5494, 100, 249.97, 39.842209, -85.891083],
            ["KOVO", 5001, 75, 227.68, 39.049526, -85.597466]
        ],
        "35": [
            ["KCHA", 7411, 150, 196.66, 35.04211, -85.200401],
            ["KCHA", 5002, 150, 325.51, 35.033909, -85.19883],
            ["KCSV", 5412, 100, 253.41, 35.953411, -85.076187]
        ],
        "38": [
            ["KJVY", 5506, 100, -0.02, 38.356911, -85.737877],
            ["KSDF", 7241, 150, 291.16, 38.173054, -85.723816],
            ["KSDF", 10010, 150, 345.44, 38.158161, -85.739273],
            ["KSDF", 8587, 150, 344.95, 38.164566, -85.723572],
            ["KSER", 5499, 100, 224.02, 38.929039, -85.893982],
            ["KSER", 5501, 100, 314.17, 38.918198, -85.907059]
        ],
        "30": [
            ["KPAM", 8085, 150, 314.57, 30.061869, -85.569984],
            ["KPAM", 10009, 200, 314.57, 30.060772, -85.561829],
            ["KPFN", 6316, 150, 322.45, 30.205885, -85.67617]
        ],
        "36": [
            ["KSRB", 6003, 100, 214.79, 36.062683, -85.524933]
        ],
        "44": [
            ["KTVC", 6489, 150, 273.71, 44.740009, -85.565422],
            ["KTVC", 5107, 150, 0.17, 44.735535, -85.587746]
        ],
        "10": [
            ["MRLB", 8974, 148, 250, 10.597588, -85.532738]
        ]
    },
    "-80": {
        "26": [
            ["06FA", 7003, 150, 269.5, 26.908228, -80.317642],
            ["59FD", 5600, 50, 277, 26.320293, -80.976761],
            ["KBCT", 6276, 150, 224.24, 26.384708, -80.100929],
            ["KFLL", 5272, 100, 270.39, 26.065868, -80.144211],
            ["KFLL", 8994, 150, 270.36, 26.076792, -80.139099],
            ["KFLL", 6938, 150, 315.47, 26.065336, -80.145538],
            ["KFXE", 5996, 100, 263.77, 26.199358, -80.162659],
            ["KPBI", 9994, 0, 272.78, 26.68187, -80.077644],
            ["KPBI", 6948, 0, 315.29, 26.678308, -80.089058]
        ],
        "43": [
            ["CYKF", 6991, 150, 245.1, 43.466034, -80.365799]
        ],
        "46": [
            ["CYSB", 6594, 200, 209.47, 46.633423, -80.791962]
        ],
        "35": [
            ["KAFP", 5507, 100, 334.6, 35.013813, -80.073158],
            ["KCLT", 7501, 150, 228.4, 35.222607, -80.931137],
            ["KCLT", 10016, 150, -4.02, 35.199989, -80.950821],
            ["KCLT", 8686, 150, -4.02, 35.200954, -80.93412],
            ["KEQY", 5501, 75, 226.92, 35.023975, -80.613503],
            ["KJQF", 5510, 100, 190.44, 35.392639, -80.708031],
            ["KRUQ", 5507, 100, 195.94, 35.653141, -80.517738],
            ["KSVH", 5038, 100, 276.85, 35.764454, -80.948303],
            ["KVUJ", 5500, 100, 217.06, 35.421318, -80.145401]
        ],
        "32": [
            ["KCHS", 7010, 150, 204.33, 32.902321, -80.036171],
            ["KCHS", 9011, 200, 327.5, 32.892178, -80.03231],
            ["KNBC", 12213, 200, 221.99, 32.495281, -80.703835],
            ["KNBC", 8006, 200, 315.64, 32.468727, -80.713051],
            ["KRBW", 6002, 100, 223.97, 32.927025, -80.63237],
            ["KRBW", 5495, 150, 268.57, 32.921124, -80.631798],
            ["KRBW", 5614, 100, 345.65, 32.912804, -80.640427]
        ],
        "39": [
            ["KCKB", 7004, 150, 202.78, 39.305492, -80.223274]
        ],
        "28": [
            ["KCOF", 9044, 200, 199.87, 28.24445, -80.605484],
            ["KMLB", 10174, 150, 266.87, 28.102798, -80.629646],
            ["KMLB", 5994, 150, 266.87, 28.1063, -80.641258],
            ["KTIX", 7339, 150, -0.88, 28.504459, -80.796555],
            ["KXMR", 10004, 200, 307.89, 28.459154, -80.554298],
            ["X68", 15028, 0, 330.08, 28.597021, -80.682663]
        ],
        "33": [
            ["KCUB", 5003, 75, 305.45, 33.966515, -80.988525],
            ["KMMT", 9004, 150, 314.12, 33.910217, -80.789925],
            ["KOGB", 5410, 100, 346.17, 33.446346, -80.857674],
            ["KSSC", 8007, 150, 214.64, 33.981373, -80.461113],
            ["KSSC", 10019, 150, 214.63, 33.984322, -80.462685]
        ],
        "42": [
            ["KERI", 6493, 150, 234.43, 42.086971, -80.164955]
        ],
        "27": [
            ["KFPR", 6486, 150, 270.47, 27.497108, -80.359337],
            ["KOBE", 5006, 150, 224.92, 27.271864, -80.844452],
            ["KSUA", 5824, 100, 290.34, 27.176382, -80.214569],
            ["KSUA", 5009, 100, 334.45, 27.176271, -80.215073],
            ["KVRB", 7312, 100, 290.68, 27.65077, -80.407455]
        ],
        "40": [
            ["KHLG", 5003, 150, 205.96, 40.180897, -80.643456],
            ["KPIT", 11482, 200, 271.98, 40.485638, -80.210556],
            ["KPIT", 10486, 150, 271.95, 40.50135, -80.233406],
            ["KPIT", 9693, 150, 271.98, 40.488956, -80.211342],
            ["KPIT", 8098, 150, 316.46, 40.479904, -80.204765]
        ],
        "25": [
            ["KHST", 11212, 300, 229.21, 25.498562, -80.370674],
            ["KMIA", 10498, 200, 267.38, 25.802013, -80.269508],
            ["KMIA", 8595, 150, 267.37, 25.803976, -80.275414],
            ["KMIA", 12994, 150, 267.37, 25.787731, -80.275291],
            ["KMIA", 9357, 150, 299.56, 25.786684, -80.277641],
            ["KOPF", 7996, 150, 266.93, 25.91382, -80.264343],
            ["KOPF", 6802, 150, 301.94, 25.900667, -80.271065],
            ["KTNT", 10491, 150, 270.04, 25.86178, -80.880997]
        ],
        "34": [
            ["KHVS", 5006, 75, 202.37, 34.409416, -80.116058],
            ["KLKR", 6001, 100, 238.44, 34.727207, -80.846062],
            ["KSMS", 5504, 100, 223.09, 34.001213, -80.355286]
        ],
        "41": [
            ["KHZY", 5190, 100, 258.56, 41.779381, -80.686157],
            ["KYNG", 8998, 150, 315.02, 41.255424, -80.669159]
        ],
        "36": [
            ["KINT", 6660, 150, 324.71, 36.123833, -80.213188]
        ],
        "37": [
            ["KLWB", 7004, 150, 215.23, 37.866146, -80.392464],
            ["KPSK", 6198, 150, 232.05, 37.142563, -80.670074]
        ],
        "22": [
            ["MUCF", 7902, 148, 195.89, 22.160273, -80.411102]
        ],
        "-26": [
            ["SCFX", 6562, 98, 300.207, -26.298376, -80.08754]
        ],
        "0": [
            ["SEMT", 9336, 148, 235.66, -0.938872, -80.668312],
            ["SESV", 6800, 98, 331.49, -0.616102, -80.398331]
        ],
        "-1": [
            ["SEPV", 7868, 89, 307.76, -1.048464, -80.463257]
        ],
        "-2": [
            ["SESA", 7995, 98, 310, -2.215928, -80.976845]
        ],
        "-3": [
            ["SPME", 8229, 148, 324.8, -3.558651, -80.371849]
        ],
        "-5": [
            ["SPUR", 8238, 148, 10.95, -5.216907, -80.618538]
        ]
    },
    "-114": {
        "41": [
            ["06U", 6200, 0, 346, 41.967766, -114.655319],
            ["KLWL", 5488, 150, 280.83, 41.114468, -114.912544]
        ],
        "35": [
            ["1L3", 5040, 0, 354, 35.437553, -114.908539],
            ["KIFP", 7532, 150, 356.46, 35.147068, -114.558762]
        ],
        "36": [
            ["67L", 5103, 0, 209.31, 36.84663, -114.054298]
        ],
        "53": [
            ["CER3", 5066, 75, 341, 53.259258, -114.956497]
        ],
        "52": [
            ["CYRM", 5491, 100, 326.99, 52.423363, -114.897491]
        ],
        "51": [
            ["CYYC", 6187, 150, 270.03, 51.10405, -114.003479],
            ["CYYC", 7983, 200, 300.06, 51.115738, -114.006233],
            ["CYYC", 12659, 200, 360.03, 51.096638, -114.021355]
        ],
        "62": [
            ["CYZF", 7408, 150, 356.37, 62.453331, -114.441109]
        ],
        "55": [
            ["CYZH", 5541, 100, 295.97, 55.289639, -114.765343]
        ],
        "33": [
            ["KBLH", 6555, 150, 270.21, 33.616535, -114.706192],
            ["KBLH", 5831, 100, 360.22, 33.614063, -114.71682]
        ],
        "34": [
            ["KEED", 5001, 100, 299.17, 34.760372, -114.619072],
            ["KHII", 8008, 100, 329.71, 34.561638, -114.351547]
        ],
        "39": [
            ["KELY", 6021, 150, 373.75, 39.29277, -114.840706]
        ],
        "40": [
            ["KENV", 7986, 150, 269.97, 40.718952, -114.014549],
            ["KENV", 7997, 100, 315.03, 40.710682, -114.02256]
        ],
        "48": [
            ["KFCA", 7993, 0, 214.8, 48.319054, -114.246498]
        ],
        "32": [
            ["KLGF", 5998, 100, 255.92, 32.863811, -114.381813],
            ["KLGF", 6129, 150, 370.86, 32.858917, -114.39653],
            ["KYUM", 9245, 0, 224.04, 32.666973, -114.591591],
            ["KYUM", 13306, 0, 224.02, 32.663029, -114.599281],
            ["KYUM", 6140, 0, 269.13, 32.666161, -114.585655],
            ["KYUM", 5723, 0, 359.13, 32.65202, -114.60376]
        ],
        "46": [
            ["KMSO", 9487, 150, 310.51, 46.907932, -114.077621]
        ],
        "43": [
            ["KSUN", 6950, 100, 324.83, 43.496292, -114.288292]
        ],
        "42": [
            ["KTWF", 8687, 150, 271.31, 42.480709, -114.470947]
        ],
        "28": [
            ["MM58", 7216, 0, 313.007, 28.019314, -114.0158]
        ]
    },
    "-106": {
        "48": [
            ["07MT", 13500, 300, 300, 48.411835, -106.503555]
        ],
        "38": [
            ["0V2", 7350, 0, 252, 38.542274, -106.033585],
            ["7V1", 8307, 0, 342.2, 38.803299, -106.116219],
            ["KGUC", 9386, 150, 253.52, 38.539742, -106.913559]
        ],
        "35": [
            ["1N1", 5280, 0, 281, 35.093109, -106.158554],
            ["KABQ", 10001, 150, 224.71, 35.04174, -106.607048],
            ["KABQ", 13774, 150, 270.44, 35.04406, -106.575363],
            ["KABQ", 5998, 150, 308.93, 35.033447, -106.604942],
            ["KABQ", 10013, 150, 363.37, 35.030197, -106.612976],
            ["KAEG", 7399, 100, 226.1, 35.152817, -106.791313],
            ["KAEG", 6006, 100, 359.94, 35.136131, -106.788872],
            ["KLAM", 5542, 113, 282.43, 35.87817, -106.260254],
            ["KSAF", 8344, 150, 215.04, 35.627132, -106.079979],
            ["KSAF", 6296, 75, 291.74, 35.614162, -106.081673],
            ["KSAF", 6315, 150, 346.74, 35.607544, -106.08667]
        ],
        "37": [
            ["1V8", 7000, 0, 312, 37.778297, -106.029335],
            ["C24", 6880, 0, 262, 37.822144, -106.919327],
            ["KMVI", 5903, 60, 208.51, 37.534416, -106.043243]
        ],
        "40": [
            ["20V", 5533, 0, 283.72, 40.051666, -106.359535],
            ["33V", 5900, 0, 222, 40.755985, -106.264267]
        ],
        "36": [
            ["24N", 7500, 0, 361, 36.818245, -106.884415],
            ["50NM", 5200, 75, 332, 36.299919, -106.492661]
        ],
        "31": [
            ["5T6", 8494, 0, 291.85, 31.876644, -106.692078],
            ["KBIF", 13581, 150, 224.12, 31.862741, -106.364677],
            ["KELP", 12013, 150, 229.91, 31.822779, -106.370193],
            ["KELP", 9014, 150, 273.32, 31.800781, -106.363197],
            ["KELP", 5486, 75, 268.33, 31.806152, -106.352142],
            ["MMCS", 8830, 148, 218.39, 31.647614, -106.418289],
            ["MMCS", 5712, 98, 336.43, 31.628996, -106.424995],
            ["T27", 6878, 0, 268.57, 31.720062, -106.22583]
        ],
        "52": [
            ["CYXE", 8309, 200, 281.25, 52.174164, -106.681633],
            ["CYXE", 6202, 150, 341.28, 52.162769, -106.696663]
        ],
        "34": [
            ["E80", 6601, 0, 224.92, 34.651588, -106.825935],
            ["KONM", 5849, 100, 343.57, 34.014011, -106.897285]
        ],
        "39": [
            ["KASE", 7007, 100, 339.68, 39.214146, -106.86454],
            ["KEGE", 7987, 150, 261.92, 39.644104, -106.90361],
            ["KLXV", 6405, 75, 350.28, 39.210808, -106.314529]
        ],
        "44": [
            ["KBYG", 6137, 75, 318.1, 44.374817, -106.713928],
            ["KSHR", 5030, 75, 247.95, 44.776054, -106.969536],
            ["KSHR", 8296, 100, 336.35, 44.756187, -106.974907]
        ],
        "42": [
            ["KCPR", 10158, 150, 223.84, 42.913479, -106.448692],
            ["KCPR", 8662, 150, 268.89, 42.908924, -106.449486],
            ["KCPR", 6479, 60, 313.96, 42.906918, -106.452026],
            ["KCPR", 7203, 60, 358.94, 42.899017, -106.469444]
        ],
        "32": [
            ["KHMN", 10579, 300, 227.72, 32.866314, -106.107079],
            ["KHMN", 12788, 150, 259.44, 32.852707, -106.083237],
            ["KHMN", 12155, 150, 347.86, 32.833992, -106.099335],
            ["KLRU", 7498, 100, 234.56, 32.296497, -106.912292],
            ["KLRU", 6061, 100, 269.98, 32.284958, -106.912582],
            ["KLRU", 7502, 100, 315.1, 32.284595, -106.912758],
            ["WSD", 6125, 0, 281, 32.33987, -106.393013]
        ],
        "41": [
            ["KSAA", 8787, 100, 245.94, 41.448429, -106.812843],
            ["WY11", 5700, 0, 328, 41.152897, -106.554016]
        ],
        "45": [
            ["M46", 5091, 0, 254.52, 45.85471, -106.699615]
        ],
        "23": [
            ["MMMZ", 8854, 197, 272, 23.160955, -106.251244]
        ]
    },
    "-105": {
        "34": [
            ["0E0", 7688, 0, 270.08, 34.982273, -105.992195]
        ],
        "38": [
            ["1V6", 5388, 0, 297.56, 38.42593, -105.099899],
            ["C08", 7000, 0, 321, 38.004082, -105.362549]
        ],
        "40": [
            ["3V5", 5305, 0, 308.53, 40.583794, -105.03418],
            ["KFNL", 8503, 100, 340.48, 40.440296, -105.007187],
            ["KGNB", 5095, 70, 282, 40.090195, -105.908302]
        ],
        "33": [
            ["81NM", 6000, 50, 360, 33.335499, -105.173485],
            ["KSRR", 8091, 100, 251.34, 33.4664, -105.522148],
            ["KSRR", 6302, 75, 312.49, 33.452503, -105.516357]
        ],
        "50": [
            ["CYMJ", 7383, 150, 298.69, 50.322495, -105.546921],
            ["CYMJ", 8421, 150, 298.76, 50.326935, -105.543304]
        ],
        "32": [
            ["KALM", 7007, 150, 225.47, 32.846672, -105.982437]
        ],
        "37": [
            ["KALS", 8521, 100, 211.7, 37.444927, -105.85997]
        ],
        "36": [
            ["KAXX", 8909, 100, 361.75, 36.409786, -105.290367],
            ["KSKX", 5796, 75, 236.09, 36.46262, -105.664223],
            ["N24", 6867, 0, 360.07, 36.790867, -105.597504]
        ],
        "39": [
            ["KBJC", 6996, 75, 304.34, 39.903358, -105.110916],
            ["KBJC", 8991, 100, 304.35, 39.901363, -105.101906]
        ],
        "42": [
            ["KDGW", 6523, 100, 297.9, 42.790436, -105.371704]
        ],
        "44": [
            ["KGCC", 5799, 75, 218.28, 44.357738, -105.529938],
            ["KGCC", 7499, 150, 349.68, 44.336788, -105.53875]
        ],
        "41": [
            ["KLAR", 8498, 150, 225.51, 41.319031, -105.665276],
            ["KLAR", 6296, 100, 314.62, 41.307594, -105.664963]
        ],
        "35": [
            ["KLVS", 5006, 75, 214.84, 35.659527, -105.137779],
            ["KLVS", 8203, 75, 331.7, 35.644489, -105.135712]
        ],
        "46": [
            ["KMLS", 5672, 75, 231.9, 46.43132, -105.878891],
            ["KMLS", 5617, 100, 314.93, 46.423977, -105.876778]
        ],
        "48": [
            ["KOLF", 5080, 100, 300.01, 48.091011, -105.566017]
        ],
        "27": [
            ["MM13", 5760, 65, 320.306, 27.593199, -105.099548]
        ],
        "28": [
            ["MMCU", 7915, 75, 10.84, 28.692038, -105.968117],
            ["MMCU", 8522, 148, 10.83, 28.691689, -105.966003]
        ],
        "20": [
            ["MMPR", 10169, 148, 227.06, 20.689564, -105.243294]
        ]
    },
    "-108": {
        "35": [
            ["0E8", 5820, 0, 372, 35.709846, -108.203644],
            ["KGUP", 7307, 100, 253.84, 35.51384, -108.777481]
        ],
        "38": [
            ["1V9", 5600, 0, 223, 38.790951, -108.056923]
        ],
        "40": [
            ["4V0", 6400, 0, 257.39, 40.095894, -108.751823]
        ],
        "45": [
            ["6S8", 5193, 0, 230.22, 45.710735, -108.748306],
            ["KBIL", 5489, 75, 263.97, 45.809254, -108.536934],
            ["KBIL", 10499, 150, 291.75, 45.802048, -108.516479]
        ],
        "32": [
            ["94E", 5350, 0, 361, 32.754681, -108.208534],
            ["KLSB", 5012, 75, 310.35, 32.32832, -108.684769],
            ["KSVC", 6793, 100, 270.21, 32.632351, -108.143158]
        ],
        "37": [
            ["KCEZ", 7204, 100, 221.47, 37.310402, -108.61982]
        ],
        "36": [
            ["KFMN", 6494, 150, 244.59, 36.744949, -108.22139],
            ["KFMN", 6692, 100, 268.31, 36.741623, -108.217041],
            ["NM39", 7000, 27, 262, 36.634113, -108.299614]
        ],
        "44": [
            ["KGEY", 6302, 100, 349.48, 44.509823, -108.077705],
            ["KPOY", 6199, 100, 324.79, 44.86211, -108.785378],
            ["U68", 5190, 0, 285.8, 44.910137, -108.43412]
        ],
        "39": [
            ["KGJT", 5497, 75, 234.38, 39.118683, -108.514107],
            ["KGJT", 10492, 150, 305.25, 39.118359, -108.514061]
        ],
        "43": [
            ["KRIW", 8190, 150, 294.33, 43.060287, -108.444557]
        ],
        "46": [
            ["KRPX", 5089, 75, 257.72, 46.47657, -108.531578]
        ],
        "25": [
            ["MM52", 6462, 80, 271.2, 25.651941, -108.527542]
        ]
    },
    "-96": {
        "36": [
            ["0F8", 5809, 0, 355.37, 36.167328, -96.151047],
            ["KBVO", 6207, 100, 358.86, 36.753971, -96.010941]
        ],
        "30": [
            ["11R", 5510, 0, 351.36, 30.211508, -96.372971],
            ["83TX", 7000, 150, 356, 30.623951, -96.482796],
            ["KCLL", 5152, 150, 229.65, 30.594444, -96.360588],
            ["KCLL", 5155, 150, 288.84, 30.586901, -96.357262],
            ["KCLL", 7016, 150, 348.91, 30.577751, -96.358559]
        ],
        "29": [
            ["3T5", 5015, 0, 342.54, 29.901415, -96.947632],
            ["KARM", 5013, 75, 330.9, 29.248251, -96.150574]
        ],
        "28": [
            ["72TA", 6000, 75, 246, 28.458662, -96.293068],
            ["KPKV", 5011, 75, 324.53, 28.648439, -96.676773],
            ["KPSX", 5006, 150, 315.31, 28.720963, -96.246346],
            ["KPSX", 5014, 150, 360.21, 28.719437, -96.246765],
            ["KVCT", 9108, 150, 312.55, 28.846848, -96.913078]
        ],
        "32": [
            ["7TX2", 8000, 0, 358.214, 32.723808, -96.968735],
            ["KADS", 7210, 100, 339.84, 32.959202, -96.832367],
            ["KCRS", 5004, 75, 325.15, 32.021843, -96.393417],
            ["KDAL", 8804, 150, 315.72, 32.833996, -96.843369],
            ["KDAL", 7755, 150, 315.72, 32.842037, -96.839134],
            ["KDAL", 6158, 150, 365.5, 32.841846, -96.855141],
            ["KHQZ", 6011, 100, 360.88, 32.738716, -96.530571],
            ["KJWY", 5011, 75, 364.01, 32.449242, -96.912979],
            ["KLNC", 5003, 100, 320.4, 32.573898, -96.713875],
            ["KRBD", 6453, 150, 315.17, 32.674763, -96.86161],
            ["KTRL", 5011, 75, 360, 32.70163, -96.267113]
        ],
        "35": [
            ["H45", 5014, 0, 345.57, 35.269112, -96.672798],
            ["KCUH", 5209, 100, 359.52, 35.942959, -96.769135],
            ["KSNL", 5608, 100, 359.95, 35.350155, -96.942818]
        ],
        "34": [
            ["KADH", 6213, 100, 359.99, 34.796227, -96.671974]
        ],
        "40": [
            ["KBIE", 5605, 100, 359.63, 40.294441, -96.75351],
            ["KLNK", 8649, 150, 325.09, 40.847855, -96.751755],
            ["KLNK", 5403, 100, 360.28, 40.846519, -96.750847],
            ["KLNK", 12910, 200, 360.28, 40.827579, -96.761902]
        ],
        "44": [
            ["KBKX", 5226, 100, 308.95, 44.300716, -96.806152]
        ],
        "46": [
            ["KBWP", 5097, 75, 335.96, 46.237827, -96.602951],
            ["KFAR", 6288, 100, 270.47, 46.926987, -96.802086],
            ["KFAR", 8998, 150, 360.47, 46.908184, -96.816399],
            ["KFFM", 5632, 100, 313.24, 46.278702, -96.145996]
        ],
        "33": [
            ["KDUA", 5010, 100, 360.34, 33.935299, -96.395088],
            ["KGVT", 8046, 150, 360.73, 33.056801, -96.065491],
            ["KGYI", 9020, 150, 362.31, 33.701591, -96.673492],
            ["KTKI", 7014, 100, 362.11, 33.168327, -96.59095]
        ],
        "38": [
            ["KEMP", 5004, 100, 192.05, 38.338833, -96.189354]
        ],
        "41": [
            ["KFET", 5498, 0, 320.9, 41.444073, -96.516014]
        ],
        "43": [
            ["KFSD", 8995, 150, 214.85, 43.592865, -96.734245],
            ["KFSD", 8000, 150, 334.97, 43.573238, -96.733261]
        ],
        "39": [
            ["KMHK", 6999, 150, 219.84, 39.147129, -96.66346]
        ],
        "42": [
            ["KSUX", 8996, 150, 315.74, 42.39151, -96.374405],
            ["KSUX", 6601, 150, 360.67, 42.396622, -96.38221]
        ],
        "48": [
            ["KTVF", 6495, 150, 314.84, 48.058392, -96.174477]
        ],
        "15": [
            ["MMBT", 8857, 148, 256.94, 15.777039, -96.248398]
        ],
        "19": [
            ["MMJA", 5577, 82, 267, 19.471365, -96.788277],
            ["MMVR", 7902, 148, 11.1, 19.128422, -96.190964]
        ],
        "17": [
            ["MMOX", 8061, 148, 195.61, 17.009314, -96.7229]
        ]
    },
    "-91": {
        "33": [
            ["0M0", 5009, 0, 361.62, 33.877884, -91.53476],
            ["KCRT", 5009, 75, 231.66, 33.18259, -91.873749],
            ["KLLQ", 5023, 75, 211.64, 33.644424, -91.746674]
        ],
        "50": [
            ["CYXL", 5297, 100, 339.04, 50.107258, -91.901596]
        ],
        "30": [
            ["KARA", 8020, 200, 347.55, 30.027012, -91.881157],
            ["KBTR", 6906, 150, 223.39, 30.539476, -91.141045],
            ["KBTR", 7007, 150, 313.57, 30.527452, -91.144699],
            ["KHZR", 5011, 75, 4.29, 30.711458, -91.479256],
            ["KLFT", 7661, 150, 218.68, 30.213125, -91.977783],
            ["KLFT", 5209, 148, 290.08, 30.202742, -91.98262]
        ],
        "40": [
            ["KBRL", 5345, 100, 299.61, 40.784164, -91.119171],
            ["KBRL", 6705, 150, 359.55, 40.770081, -91.123749],
            ["KEOK", 5491, 100, 265.71, 40.460743, -91.416344]
        ],
        "35": [
            ["KBVX", 5995, 150, 259.76, 35.725983, -91.64122],
            ["KSRC", 6016, 100, 192.61, 35.218658, -91.735336],
            ["M19", 5004, 0, 223.92, 35.639843, -91.171478],
            ["M19", 5010, 0, 361.02, 35.633671, -91.175583]
        ],
        "41": [
            ["KCID", 8587, 150, 270.92, 41.884266, -91.697601],
            ["KCID", 6196, 150, 316, 41.878887, -91.699287],
            ["KMUT", 5494, 100, 238.45, 41.370182, -91.137344]
        ],
        "36": [
            ["KCVK", 5158, 0, 217.48, 36.270473, -91.557304],
            ["KUNO", 5109, 75, 360.89, 36.87141, -91.902809]
        ],
        "44": [
            ["KEAU", 8093, 150, 224.94, 44.875076, -91.470505],
            ["KLUM", 5065, 75, 271.54, 44.890652, -91.857643],
            ["KONA", 5192, 100, 299.43, 44.07579, -91.702187]
        ],
        "47": [
            ["KELO", 5590, 100, 299.76, 47.820744, -91.820816]
        ],
        "31": [
            ["KHEZ", 6503, 150, 316.4, 31.607655, -91.291466],
            ["KHEZ", 5010, 150, 360.85, 31.60619, -91.2957]
        ],
        "43": [
            ["KLSE", 5296, 150, 216.33, 43.88166, -91.247879],
            ["KLSE", 6047, 150, 314.91, 43.873158, -91.248756],
            ["KLSE", 8537, 150, 359.44, 43.869968, -91.25856]
        ],
        "39": [
            ["KMYJ", 5494, 100, 245.64, 39.160503, -91.807846],
            ["KUIN", 7098, 150, 220.25, 39.951, -91.183174],
            ["KUIN", 5124, 150, 315.37, 39.935833, -91.18766],
            ["KUIN", 5402, 150, 359.33, 39.936016, -91.199089]
        ],
        "34": [
            ["KPBF", 6010, 150, 359.81, 34.166264, -91.93557],
            ["KSGT", 6026, 100, 361.85, 34.587654, -91.579124]
        ],
        "29": [
            ["KPTN", 5398, 150, 239.01, 29.714651, -91.332367]
        ],
        "45": [
            ["KRPD", 5698, 100, 191.35, 45.42934, -91.771271]
        ],
        "32": [
            ["KTVR", 5012, 100, 359.14, 32.344734, -91.027565]
        ],
        "38": [
            ["KVIH", 5498, 100, 226.49, 38.135201, -91.762756],
            ["KVIH", 5499, 100, 316.61, 38.119408, -91.762764]
        ],
        "17": [
            ["MM46", 5840, 0, 271.4, 17.463282, -91.402046]
        ],
        "18": [
            ["MMCE", 7187, 148, 319.93, 18.644411, -91.792847]
        ],
        "46": [
            ["WI31", 5300, 75, 361, 46.408798, -91.642982]
        ]
    },
    "-92": {
        "29": [
            ["0R3", 5010, 0, 338.69, 29.96937, -92.081345],
            ["LA81", 5100, 85, 364, 29.995852, -92.273811]
        ],
        "30": [
            ["4R7", 5012, 0, 345.96, 30.459616, -92.421875],
            ["KOPL", 6013, 100, 360.15, 30.552015, -92.098915],
            ["L42", 5010, 0, 358.45, 30.743629, -92.687996]
        ],
        "49": [
            ["CYHD", 5971, 150, 294.91, 49.828102, -92.732285]
        ],
        "62": [
            ["CYRT", 5994, 0, 308.79, 62.805504, -92.100594]
        ],
        "31": [
            ["KAEX", 9363, 150, 324.06, 31.317081, -92.541595],
            ["KAEX", 7017, 150, 8.95, 31.317711, -92.547821],
            ["KESF", 5993, 150, 270.86, 31.394194, -92.286758],
            ["KESF", 5607, 150, 325, 31.389242, -92.289948]
        ],
        "38": [
            ["KAIZ", 6499, 100, 217, 38.103149, -92.542664],
            ["KCOU", 6505, 150, 201.39, 38.821827, -92.215385],
            ["KJEF", 5996, 100, 302.58, 38.586876, -92.146126]
        ],
        "42": [
            ["KALO", 5396, 129, 247.75, 42.55624, -92.389198],
            ["KALO", 8393, 150, 307.84, 42.55191, -92.387299],
            ["KALO", 6004, 150, 7.77, 42.549549, -92.404495],
            ["KMIW", 5001, 100, 307.13, 42.108734, -92.909294]
        ],
        "33": [
            ["KCDH", 6513, 100, 9.04, 33.613972, -92.765083],
            ["KELD", 6603, 150, 225.84, 33.226551, -92.803246],
            ["KELD", 5102, 100, 316.01, 33.217476, -92.8069]
        ],
        "46": [
            ["KDLH", 5694, 150, 211.52, 46.849075, -92.176323],
            ["KDLH", 10133, 150, 272.27, 46.841347, -92.179726],
            ["KSUW", 5095, 75, 216.39, 46.700397, -92.088219]
        ],
        "41": [
            ["KGGI", 5197, 75, 313.06, 41.705208, -92.728615],
            ["KOTM", 5175, 200, 224.91, 41.113155, -92.44091],
            ["KOTM", 5881, 150, 315.05, 41.099533, -92.440704],
            ["KPEA", 5403, 75, 347.48, 41.393982, -92.943718]
        ],
        "47": [
            ["KHIB", 6749, 150, 312.26, 47.37923, -92.827576]
        ],
        "40": [
            ["KIRK", 6009, 100, 360.49, 40.084251, -92.54438]
        ],
        "37": [
            ["KLBO", 5005, 75, 361.7, 37.64146, -92.652695],
            ["KTBN", 6039, 150, 327.23, 37.734669, -92.135071]
        ],
        "34": [
            ["KLIT", 7201, 150, 226.44, 34.734978, -92.201286],
            ["KLIT", 8274, 150, 226.43, 34.738159, -92.218018],
            ["KLIT", 5133, 150, 361.5, 34.722691, -92.23864],
            ["KLRF", 11991, 200, 250.93, 34.922146, -92.127586]
        ],
        "32": [
            ["KMLU", 7510, 150, 224.94, 32.518421, -92.028412],
            ["KMLU", 5003, 150, 320.11, 32.505947, -92.031174],
            ["KMLU", 5011, 150, 360.03, 32.503223, -92.039902],
            ["KRSN", 5009, 100, 360, 32.507725, -92.588333]
        ],
        "35": [
            ["KMPJ", 5859, 75, 208.98, 35.145916, -92.904404]
        ],
        "44": [
            ["KRGK", 5002, 100, 273.05, 44.588982, -92.475349]
        ],
        "43": [
            ["KRST", 7299, 150, 206.43, 43.912849, -92.49456],
            ["KRST", 7527, 150, 312.19, 43.903522, -92.486687]
        ],
        "16": [
            ["MMCO", 5794, 0, 272.11, 16.176384, -92.042328],
            ["MMSC", 8699, 98, 291.86, 16.685801, -92.518402]
        ],
        "14": [
            ["MMTP", 6590, 148, 235.55, 14.799459, -92.362259]
        ],
        "17": [
            ["MMVA", 7243, 148, 266.53, 17.997478, -92.806709]
        ]
    },
    "-93": {
        "31": [
            ["0R7", 5033, 75, 359.8, 31.982994, -93.307365],
            ["KIER", 5013, 150, 346.52, 31.726288, -93.095688]
        ],
        "35": [
            ["32A", 5318, 0, 285.67, 35.08498, -93.418938],
            ["KRUE", 5088, 75, 255.01, 35.260937, -93.085037]
        ],
        "30": [
            ["5R8", 5007, 0, 337.38, 30.43474, -93.470535],
            ["KCWF", 10720, 200, 334.51, 30.197313, -93.135864],
            ["KDRI", 5507, 100, 359.42, 30.822887, -93.337624],
            ["KLCH", 5203, 100, 231.81, 30.137321, -93.216789],
            ["KLCH", 6512, 150, 334.77, 30.112566, -93.219124],
            ["L75", 5008, 0, 330.44, 30.125452, -93.372253]
        ],
        "32": [
            ["F24", 5009, 0, 196.12, 32.652615, -93.295822],
            ["KBAD", 11773, 300, 331.5, 32.487736, -93.653488],
            ["KDTN", 5022, 150, 320.43, 32.535343, -93.740028],
            ["KSHV", 6199, 150, 240.83, 32.453339, -93.815338],
            ["KSHV", 8358, 200, 322.8, 32.4356, -93.818489]
        ],
        "41": [
            ["KAMW", 5702, 100, 196.56, 41.997684, -93.618759],
            ["KIKV", 5503, 100, 360.02, 41.682556, -93.565826],
            ["KTNU", 5597, 100, 321.28, 41.668434, -93.015297]
        ],
        "38": [
            ["KDMO", 5503, 100, 361.69, 38.701736, -93.172943],
            ["KSZL", 12412, 200, 190.9, 38.746777, -93.543633]
        ],
        "43": [
            ["KFXY", 5805, 100, 334.9, 43.226212, -93.617668],
            ["KMCW", 5496, 150, 304.98, 43.151188, -93.326996],
            ["KMCW", 6503, 0, 359.93, 43.150795, -93.327675]
        ],
        "47": [
            ["KGPZ", 5751, 100, 345.64, 47.199348, -93.507423]
        ],
        "34": [
            ["KHOT", 6595, 150, 234.2, 34.483578, -93.088531],
            ["M89", 5001, 0, 222.14, 34.104923, -93.060555]
        ],
        "36": [
            ["KHRO", 6169, 150, 5.53, 36.25309, -93.155746]
        ],
        "48": [
            ["KINL", 6500, 150, 315.94, 48.560032, -93.393936]
        ],
        "44": [
            ["KMKT", 5398, 100, 334.61, 44.216858, -93.913841],
            ["KMSP", 10999, 150, 224.96, 44.89373, -93.208076],
            ["KMSP", 9988, 200, 301.39, 44.87352, -93.201149],
            ["KMSP", 8190, 150, 301.38, 44.881248, -93.193939],
            ["KOWA", 5493, 100, 304.04, 44.119175, -93.251923],
            ["KSTP", 6707, 150, 326.07, 44.925915, -93.053345]
        ],
        "37": [
            ["KSGF", 7009, 150, 201.74, 37.25351, -93.380295],
            ["KSGF", 8001, 150, 321.86, 37.237976, -93.383492]
        ],
        "33": [
            ["KTXK", 6604, 144, 224.89, 33.45908, -93.986046],
            ["KTXK", 5202, 100, 315.08, 33.449917, -93.981506],
            ["M18", 5561, 0, 227.46, 33.725315, -93.655678],
            ["M18", 5509, 0, 347.54, 33.712898, -93.652939]
        ],
        "16": [
            ["MMTB", 6678, 135, -1.08, 16.730846, -93.17305],
            ["MMTG", 8182, 0, 277.47, 16.769707, -93.342072]
        ]
    },
    "-103": {
        "30": [
            ["0TA7", 5200, 100, 309, 30.143728, -103.886551],
            ["E38", 6012, 0, 202.61, 30.390625, -103.67939],
            ["E38", 5015, 0, 241.63, 30.388906, -103.677193]
        ],
        "29": [
            ["3TE3", 5500, 80, 269, 29.469759, -103.927925],
            ["89TE", 7500, 100, 259, 29.279915, -103.675682]
        ],
        "40": [
            ["3V4", 5183, 0, 332.43, 40.328411, -103.801582],
            ["KAKO", 6992, 100, 299.38, 40.170925, -103.211098]
        ],
        "32": [
            ["E06", 6001, 0, 224.89, 32.960377, -103.400543],
            ["KHOB", 7400, 150, 225.02, 32.693039, -103.208824],
            ["KHOB", 6003, 150, 315.18, 32.682228, -103.207527],
            ["KHOB", 5007, 100, 360.11, 32.682343, -103.220856],
            ["NM83", 7000, 150, 220, 32.783085, -103.215302],
            ["NM83", 8810, 150, 310, 32.75901, -103.197815]
        ],
        "41": [
            ["KBFF", 7990, 150, 248.06, 41.87796, -103.583359],
            ["KBFF", 8275, 150, 315.65, 41.866051, -103.583656],
            ["KIBM", 6189, 75, 284.82, 41.185879, -103.666481]
        ],
        "42": [
            ["KCDR", 5999, 100, 215.04, 42.846413, -103.087494]
        ],
        "43": [
            ["KCUT", 5500, 60, 261, 43.734489, -103.607384]
        ],
        "34": [
            ["KCVN", 6200, 150, 225.52, 34.432568, -103.071281],
            ["KCVN", 5697, 150, 310.55, 34.421436, -103.071098],
            ["KCVS", 10006, 150, 224.93, 34.396156, -103.308434],
            ["KCVS", 8197, 150, 315.1, 34.370319, -103.314919],
            ["KPRZ", 5706, 60, 202.81, 34.152538, -103.408104]
        ],
        "31": [
            ["KINK", 5005, 100, 320.55, 31.772413, -103.197502],
            ["KPEQ", 5949, 80, 281.24, 31.378645, -103.500519],
            ["KPEQ", 6244, 80, 326.29, 31.377287, -103.50592]
        ],
        "48": [
            ["KISN", 6639, 100, 304.24, 48.173851, -103.632019]
        ],
        "38": [
            ["KLHX", 6842, 75, 269.8, 38.048203, -103.499542],
            ["KLHX", 5799, 60, 315.3, 38.045906, -103.499908]
        ],
        "44": [
            ["KRAP", 8697, 150, 331.87, 44.032787, -103.049377],
            ["KRCA", 13486, 300, 318.12, 44.131317, -103.086349],
            ["KSPF", 5492, 0, 315.23, 44.476479, -103.777145]
        ],
        "35": [
            ["KTCC", 7102, 100, 224.96, 35.188656, -103.594322]
        ],
        "25": [
            ["MM16", 6632, 65, 216.5, 25.549007, -103.502853],
            ["MMTC", 9002, 148, 315.87, 25.554243, -103.395584]
        ],
        "21": [
            ["MM33", 6586, 0, 232.3, 21.987947, -103.298157]
        ],
        "28": [
            ["MM68", 6406, 60, 287, 28.030928, -103.794128]
        ],
        "20": [
            ["MMGL", 5998, 94, 210.16, 20.534904, -103.30304],
            ["MMGL", 13134, 197, 294.12, 20.514061, -103.292625],
            ["MMZP", 8860, 136, 272.3, 20.750177, -103.450378]
        ],
        "19": [
            ["MMIA", 7565, 148, 253.78, 19.279909, -103.567055],
            ["MMTX", 6700, 0, 229, 19.605797, -103.362045]
        ]
    },
    "-99": {
        "27": [
            ["0TE5", 5992, 77, 357, 27.425579, -99.185448],
            ["KLRD", 5938, 150, 327.4, 27.535727, -99.456841],
            ["KLRD", 7852, 150, 362.55, 27.532459, -99.463623],
            ["KLRD", 8225, 150, 362.55, 27.533819, -99.460464],
            ["MMNL", 6596, 148, 330.96, 27.435442, -99.564964],
            ["XS94", 5500, 100, 358, 27.103853, -99.422585]
        ],
        "35": [
            ["3O4", 5017, 0, 358, 35.160667, -99.657578],
            ["KCSM", 13524, 150, 360.08, 35.322559, -99.201508],
            ["KCSM", 5200, 75, 360.08, 35.329384, -99.197975],
            ["KELK", 5409, 75, 360.13, 35.423367, -99.394287]
        ],
        "28": [
            ["72TE", 5100, 50, 338, 28.872927, -99.987625],
            ["KCZT", 5002, 75, 314.08, 28.517473, -99.818024],
            ["T30", 5031, 0, 317.28, 28.817175, -99.103691],
            ["TE83", 5117, 50, 347, 28.913958, -99.754349]
        ],
        "49": [
            ["CYBR", 6495, 150, 270.34, 49.907482, -99.938408]
        ],
        "34": [
            ["F05", 5103, 0, 211.82, 34.23172, -99.278862],
            ["KAXS", 5510, 75, 359.84, 34.691242, -99.338448],
            ["KHBR", 5516, 100, 360.23, 34.98373, -99.054459],
            ["KLTS", 13463, 150, 360, 34.645542, -99.273811],
            ["KLTS", 9016, 150, 359.97, 34.657745, -99.259521]
        ],
        "32": [
            ["KABI", 7217, 150, 359.76, 32.408279, -99.684822],
            ["KABI", 7213, 150, 359.76, 32.388741, -99.674683],
            ["KDYS", 13527, 300, 348.87, 32.4025, -99.85038]
        ],
        "42": [
            ["KANW", 5497, 0, 314.38, 42.576996, -99.981262],
            ["KANW", 6825, 110, 359.33, 42.56741, -99.996361]
        ],
        "37": [
            ["KDDC", 6903, 100, 333.89, 37.756207, -99.961517]
        ],
        "40": [
            ["KEAR", 7097, 150, 7.39, 40.717094, -99.010399],
            ["KLXN", 5487, 100, 323.17, 40.784962, -99.771309]
        ],
        "29": [
            ["KERV", 6002, 100, 310.63, 29.967703, -99.077377],
            ["KHDO", 5404, 150, 224.87, 29.365944, -99.17141],
            ["KHDO", 6052, 150, 269.95, 29.364046, -99.166046],
            ["KHDO", 6049, 150, 315.07, 29.349997, -99.171562],
            ["KHDO", 6039, 150, 359.97, 29.349836, -99.172005],
            ["KUVA", 5264, 100, 335.04, 29.20479, -99.740097],
            ["TE78", 5300, 75, 227, 29.573656, -99.968399],
            ["XS62", 5200, 60, 258, 29.635986, -99.719437]
        ],
        "36": [
            ["KGAG", 5427, 0, 359.77, 36.288094, -99.776352],
            ["KWWR", 5509, 100, 360.46, 36.429146, -99.521072]
        ],
        "39": [
            ["KHLC", 5005, 75, 361.18, 39.373341, -99.831642]
        ],
        "38": [
            ["KHYS", 6506, 100, 347.42, 38.835423, -99.271309]
        ],
        "30": [
            ["KJCT", 5012, 75, 360.32, 30.503403, -99.764481]
        ],
        "22": [
            ["MM01", 6562, 0, 9.007, 22.731474, -99.019753]
        ],
        "26": [
            ["MM38", 5074, 34, 276, 26.520376, -99.140877],
            ["MMAL", 9853, 108, 207.36, 26.347548, -99.537506],
            ["T86", 5002, 0, 309.53, 26.964418, -99.242973]
        ],
        "16": [
            ["MM41", 7612, 150, 289.208, 16.910751, -99.977371],
            ["MMAA", 5580, 115, 246.92, 16.759661, -99.74752],
            ["MMAA", 10831, 148, 288.08, 16.750772, -99.73362]
        ],
        "18": [
            ["MM62", 5580, 0, 271.1, 18.268456, -99.490631],
            ["MMCB", 9215, 148, 211.54, 18.845285, -99.254601]
        ],
        "19": [
            ["MMMX", 12795, 148, 239.3, 19.444883, -99.053833],
            ["MMMX", 12966, 148, 239.25, 19.445719, -99.058014],
            ["MMTO", 13823, 148, 337.09, 19.319632, -99.55822]
        ]
    },
    "-98": {
        "30": [
            ["0TE7", 6291, 60, 355, 30.243221, -98.621666],
            ["4XS7", 5978, 0, 361, 30.518843, -98.358917],
            ["KBMQ", 5011, 75, 196.09, 30.745529, -98.236397],
            ["T82", 5009, 0, 326.82, 30.23749, -98.904839]
        ],
        "27": [
            ["14TS", 6044, 70, 347, 27.413624, -98.602364],
            ["28TA", 10280, 34, 327, 27.816626, -98.707253],
            ["KALI", 6004, 100, 314.59, 27.733755, -98.02066],
            ["KBKS", 5016, 75, 359.9, 27.20085, -98.120094],
            ["KHBV", 5002, 75, 314.34, 27.344786, -98.731438],
            ["KIKG", 6007, 75, 320.11, 27.544563, -98.024971],
            ["KNOG", 8019, 200, 194.57, 27.906151, -98.042458],
            ["KNOG", 8009, 200, 314.73, 27.890375, -98.032669]
        ],
        "26": [
            ["2TA8", 5500, 75, 317, 26.857042, -98.221169],
            ["38XS", 6000, 75, 327, 26.812923, -98.481255],
            ["7TE7", 5150, 300, 317, 26.378874, -98.330856],
            ["KEBG", 5009, 75, 323.98, 26.43611, -98.117706],
            ["KMFE", 7131, 150, 320.68, 26.167854, -98.233009],
            ["MMRX", 6224, 148, 320.89, 26.001957, -98.22226]
        ],
        "49": [
            ["CYPG", 6909, 200, 313.67, 49.894485, -98.263008]
        ],
        "35": [
            ["F28", 5606, 0, 359.98, 35.46582, -98.004333]
        ],
        "45": [
            ["KABR", 6893, 100, 315.11, 45.441837, -98.409027],
            ["KABR", 5499, 100, 359.93, 45.440464, -98.427322]
        ],
        "29": [
            ["KBAZ", 5356, 100, 315.82, 29.701567, -98.034813],
            ["KBAZ", 5376, 100, 360.72, 29.694702, -98.043846],
            ["KRND", 8367, 200, 330.11, 29.515055, -98.280075],
            ["KRND", 8365, 200, 330.12, 29.522848, -98.262817],
            ["KSAT", 7513, 150, 220.68, 29.538855, -98.454475],
            ["KSAT", 8508, 150, 311.71, 29.527218, -98.465538],
            ["KSAT", 5522, 100, 311.73, 29.53021, -98.464722],
            ["KSKF", 11575, 300, 342.21, 29.369106, -98.575531],
            ["XS88", 5200, 0, 227, 29.348135, -98.430595]
        ],
        "32": [
            ["KBKD", 5008, 100, 359.63, 32.711956, -98.890892],
            ["KMWL", 6003, 100, 315.69, 32.775642, -98.050606]
        ],
        "31": [
            ["KBWD", 5611, 150, 359.37, 31.786495, -98.95488],
            ["KMNZ", 5010, 75, 8.97, 31.65914, -98.149895]
        ],
        "36": [
            ["KCKA", 7946, 150, 357, 36.739109, -98.115959]
        ],
        "48": [
            ["KDVL", 5503, 150, 318.11, 48.109249, -98.899788]
        ],
        "34": [
            ["KFDR", 6010, 150, 360.04, 34.343792, -98.989349],
            ["KFSI", 5008, 200, 360.03, 34.642952, -98.402168],
            ["KLAW", 8615, 150, 356.93, 34.554951, -98.415611]
        ],
        "38": [
            ["KGBD", 7859, 100, 359.59, 38.3363, -98.857162]
        ],
        "40": [
            ["KGRI", 5278, 0, 225.23, 40.964912, -98.300957],
            ["KGRI", 6604, 100, 315.39, 40.965469, -98.294884],
            ["KGRI", 7006, 150, 360.3, 40.957954, -98.314911],
            ["KHSI", 6451, 100, 330.36, 40.599163, -98.422264]
        ],
        "44": [
            ["KHON", 7192, 100, 308.12, 44.380219, -98.219734]
        ],
        "46": [
            ["KJMS", 5742, 75, 224.62, 46.935703, -98.670464],
            ["KJMS", 6492, 100, 314.82, 46.923096, -98.668625]
        ],
        "43": [
            ["KMHE", 6695, 100, 314.47, 43.768082, -98.033386],
            ["KMHE", 5513, 100, 359.56, 43.767628, -98.033867]
        ],
        "33": [
            ["KONY", 5098, 75, 225.22, 33.358128, -98.812645],
            ["KONY", 5099, 150, 315.4, 33.343563, -98.812752],
            ["KONY", 5111, 75, 360.29, 33.343872, -98.82032],
            ["KSPS", 13119, 300, 338.31, 33.970333, -98.483467],
            ["KSPS", 6008, 150, 338.31, 33.995853, -98.485931],
            ["KSPS", 10016, 150, 338.31, 33.980732, -98.484894],
            ["KSPS", 7033, 150, 360.49, 33.963127, -98.495964]
        ],
        "37": [
            ["KPTT", 5506, 100, 360.11, 37.694057, -98.74688]
        ],
        "24": [
            ["MM53", 5148, 33, 349.405, 24.054533, -98.414139]
        ],
        "23": [
            ["MMCV", 7200, 148, 336.67, 23.694351, -98.952171]
        ],
        "19": [
            ["MMPB", 11879, 148, 358, 19.14188, -98.370903],
            ["MMTA", 8270, 98, 196.4, 19.557386, -98.155609]
        ],
        "20": [
            ["MMPC", 5906, 85, 217, 20.080076, -98.778145]
        ],
        "28": [
            ["TE26", 5500, 50, 307, 28.77812, -98.318832]
        ]
    },
    "-110": {
        "36": [
            ["0V7", 7140, 0, 243, 36.718063, -110.224243],
            ["38AZ", 7500, 75, 213, 36.480171, -110.412415]
        ],
        "33": [
            ["4AZ7", 7335, 70, 332, 33.371056, -110.459183],
            ["P13", 6494, 0, 281.88, 33.351307, -110.656921]
        ],
        "40": [
            ["74V", 6490, 0, 262.89, 40.279377, -110.039795],
            ["U69", 5805, 0, 360, 40.184116, -110.383766]
        ],
        "46": [
            ["7S6", 6100, 0, 206, 46.511623, -110.907944]
        ],
        "52": [
            ["CEH6", 5004, 75, 318.86, 52.333847, -110.271637]
        ],
        "53": [
            ["CYLL", 5566, 0, 270.02, 53.309223, -110.059914]
        ],
        "54": [
            ["CYOD", 8178, 200, 233.68, 54.409752, -110.254311],
            ["CYOD", 10202, 150, 322.58, 54.394157, -110.282753],
            ["CYOD", 12532, 200, 323.92, 54.390553, -110.269699]
        ],
        "42": [
            ["KAFO", 5221, 75, 360.15, 42.704082, -110.942184],
            ["KBPI", 6800, 75, 327.74, 42.577179, -110.104393],
            ["WY33", 7500, 75, 250, 42.818142, -110.262466]
        ],
        "32": [
            ["KDMA", 13653, 200, 317.49, 32.152565, -110.868225],
            ["KTUS", 7003, 150, 224.95, 32.130852, -110.942917],
            ["KTUS", 8411, 75, 315.11, 32.105526, -110.930176],
            ["KTUS", 11000, 150, 315.12, 32.101982, -110.922798]
        ],
        "41": [
            ["KEMM", 8204, 75, 353.75, 41.810753, -110.555695],
            ["KFBR", 6395, 80, 234.37, 41.397038, -110.397285]
        ],
        "31": [
            ["KFHU", 11986, 150, 269.9, 31.587624, -110.328484],
            ["KFHU", 5364, 100, 306.78, 31.584064, -110.32943],
            ["KOLS", 7190, 90, 226.22, 31.424042, -110.840149],
            ["MMNG", 5904, 98, 353, 31.194651, -110.978088]
        ],
        "38": [
            ["KHVE", 5668, 75, 277.27, 38.41468, -110.694374],
            ["U34", 5600, 0, 323, 38.955219, -110.22142]
        ],
        "35": [
            ["KINW", 7493, 150, 238.55, 35.024834, -110.716782],
            ["KINW", 7097, 150, 299.74, 35.019489, -110.707283]
        ],
        "43": [
            ["KJAC", 6298, 150, 199.48, 43.615475, -110.733772]
        ],
        "45": [
            ["KLVM", 5692, 75, 234.6, 45.702358, -110.436867]
        ],
        "39": [
            ["KPUC", 8324, 100, 18.45, 39.604916, -110.755302]
        ],
        "34": [
            ["KTYL", 7205, 75, 221, 34.460312, -110.106964],
            ["P14", 6701, 0, 219.52, 34.948925, -110.130394]
        ],
        "27": [
            ["MMGM", 7669, 148, 209.62, 27.978464, -110.917831]
        ],
        "24": [
            ["MMLP", 8229, 148, 367.55, 24.061552, -110.364166]
        ],
        "37": [
            ["U96", 5700, 0, 203, 37.449409, -110.565735]
        ]
    },
    "-100": {
        "29": [
            ["0XS7", 6000, 60, 318, 29.188034, -100.271118],
            ["2TX3", 5280, 50, 368, 29.209726, -100.618179],
            ["KDLF", 6143, 150, 315.15, 29.353836, -100.774521],
            ["KDLF", 8318, 150, 315.54, 29.351929, -100.766037],
            ["KDLF", 8860, 150, 315.54, 29.350103, -100.768394],
            ["KDRT", 5006, 100, 320.32, 29.367548, -100.920822],
            ["MMCC", 5578, 100, 319, 29.32589, -100.975349],
            ["T70", 6277, 0, 318, 29.123009, -100.465622]
        ],
        "28": [
            ["5T9", 5500, 0, 307, 28.852655, -100.505417],
            ["5TE0", 5500, 80, 338, 28.621037, -100.155731],
            ["6TA4", 6300, 64, 328, 28.709589, -100.403465],
            ["MMPG", 6341, 98, 306.82, 28.622431, -100.526909],
            ["TA34", 5200, 60, 318, 28.761612, -100.077393]
        ],
        "33": [
            ["6TE6", 5086, 75, 198, 33.647823, -100.345024]
        ],
        "51": [
            ["CYDN", 5044, 150, 329.26, 51.09576, -100.047882]
        ],
        "46": [
            ["KBIS", 6594, 100, 218.98, 46.776669, -100.731796],
            ["KBIS", 8785, 150, 317.62, 46.766148, -100.738091]
        ],
        "34": [
            ["KCDS", 5960, 75, 361.86, 34.423916, -100.286171]
        ],
        "37": [
            ["KGCK", 5698, 100, 315.49, 37.919739, -100.719398],
            ["KGCK", 7307, 100, 360.41, 37.919205, -100.723],
            ["KLBL", 5721, 0, 224.84, 37.049793, -100.957199],
            ["KLBL", 7110, 150, 359.9, 37.034428, -100.95639]
        ],
        "41": [
            ["KLBF", 7993, 150, 305.96, 41.119362, -100.666679]
        ],
        "40": [
            ["KMCK", 6446, 100, 311.53, 40.200848, -100.582069]
        ],
        "39": [
            ["KOEL", 5003, 75, 348.96, 39.103214, -100.814735]
        ],
        "44": [
            ["KPIR", 6875, 150, 257.13, 44.389919, -100.273628],
            ["KPIR", 6895, 100, 320.7, 44.370243, -100.277077]
        ],
        "35": [
            ["KPPA", 5874, 100, 360.02, 35.602383, -100.993828]
        ],
        "36": [
            ["KPYX", 5708, 75, 359.87, 36.407082, -100.749687]
        ],
        "31": [
            ["KSJT", 5943, 150, 223.06, 31.361607, -100.486847],
            ["KSJT", 8063, 150, 367.29, 31.346689, -100.500816]
        ],
        "32": [
            ["KSNK", 5611, 100, 360.35, 32.688011, -100.948898],
            ["KSWW", 5661, 75, 223.33, 32.472279, -100.458336],
            ["KSWW", 5851, 100, 353.67, 32.460087, -100.467369],
            ["T88", 5420, 0, 358, 32.460999, -100.920815]
        ],
        "38": [
            ["KTQK", 5004, 70, 359.34, 38.467415, -100.884834]
        ],
        "18": [
            ["MM35", 5320, 0, 328.405, 18.319349, -100.63208],
            ["MM73", 5365, 60, 353.405, 18.520538, -100.837959]
        ],
        "26": [
            ["MM36", 5200, 70, 296.305, 26.650248, -100.117729]
        ],
        "23": [
            ["MM67", 6570, 80, 215.4, 23.683929, -100.617188]
        ],
        "25": [
            ["MMAN", 6607, 148, 212.17, 25.871447, -100.233124],
            ["MMAN", 5021, 148, 302.36, 25.864277, -100.234886],
            ["MMIO", 9485, 148, 359.93, 25.525467, -100.928322],
            ["MMMY", 9851, 148, 299.37, 25.770523, -100.091354],
            ["MMMY", 5888, 98, 345.82, 25.772478, -100.105278]
        ],
        "20": [
            ["MMCY", 6358, 98, 268, 20.553366, -100.89064],
            ["MMQT", 11481, 148, 281.1, 20.614323, -100.169083]
        ],
        "22": [
            ["MMSP", 9885, 148, 329.39, 22.250221, -100.928169]
        ],
        "30": [
            ["TE37", 6200, 60, 338, 30.261198, -100.447235]
        ]
    },
    "-84": {
        "31": [
            ["11J", 5502, 0, 229.46, 31.40237, -84.88813],
            ["GA14", 5600, 75, 268, 31.403217, -84.31369],
            ["KABY", 6606, 150, 222.01, 31.543045, -84.185501],
            ["KABY", 5210, 150, 341.88, 31.527704, -84.194229]
        ],
        "30": [
            ["17J", 5198, 0, 2.46, 30.999813, -84.877975],
            ["KBGE", 5497, 150, 269.71, 30.972887, -84.625732],
            ["KBGE", 5007, 100, 318.64, 30.965059, -84.634277],
            ["KTLH", 7992, 150, 269.47, 30.391508, -84.331154],
            ["KTLH", 6091, 150, -0.52, 30.394913, -84.358795]
        ],
        "38": [
            ["27K", 5504, 0, 205.62, 38.24123, -84.430527],
            ["KLEX", 7003, 150, 221.5, 38.042736, -84.598213]
        ],
        "35": [
            ["2A0", 5004, 0, 208.45, 35.492279, -84.927086],
            ["KMMI", 5006, 75, 198.66, 35.403782, -84.559891]
        ],
        "37": [
            ["79KY", 5500, 100, 270, 37.871105, -84.60128],
            ["KLOZ", 5998, 150, 232.25, 37.092304, -84.068626],
            ["KSME", 5801, 100, 222.83, 37.059406, -84.608887]
        ],
        "44": [
            ["8M8", 5047, 0, 354, 44.799614, -84.275146]
        ],
        "46": [
            ["CYAM", 5997, 200, 212.4, 46.491936, -84.500267],
            ["CYAM", 6144, 200, 287.26, 46.480827, -84.497757],
            ["KANJ", 5230, 100, 315.93, 46.474079, -84.361206],
            ["KCIU", 7196, 200, 330.03, 46.239246, -84.463852]
        ],
        "32": [
            ["KACJ", 6024, 100, 225.75, 32.115906, -84.181549],
            ["KCSG", 6996, 150, 233.76, 32.522507, -84.926979],
            ["KLSF", 10012, 150, 324.79, 32.320618, -84.977829],
            ["KOPN", 5699, 100, 299.52, 32.950764, -84.255219]
        ],
        "40": [
            ["KAOH", 5142, 150, 270.01, 40.706932, -84.017357]
        ],
        "33": [
            ["KATL", 8990, 151, 89.98, 33.631809, -84.44799],
            ["KATL", 9989, 150, 269.98, 33.64679, -84.405479],
            ["KATL", 8990, 150, 269.98, 33.649532, -84.409431],
            ["KATL", 8990, 150, 269.98, 33.631817, -84.418373],
            ["KATL", 11876, 150, 270, 33.634701, -84.408875],
            ["KCCO", 5004, 100, 319.55, 33.306911, -84.765015],
            ["KFFC", 5200, 100, 308.22, 33.352829, -84.565117],
            ["KFTY", 5790, 100, 259.66, 33.781544, -84.511314],
            ["KMGE", 9993, 300, 286.28, 33.91143, -84.500496],
            ["KPDK", 6008, 100, 200.44, 33.883812, -84.297165]
        ],
        "45": [
            ["KBFA", 5189, 60, 349.3, 45.158894, -84.922249],
            ["KGLR", 6567, 150, 270.12, 45.014458, -84.691551],
            ["KPLN", 5389, 150, 224.66, 45.577908, -84.787933],
            ["KPLN", 6506, 150, 314.73, 45.563206, -84.788795]
        ],
        "39": [
            ["KCVG", 11984, 150, 270.18, 39.046257, -84.652809],
            ["KCVG", 11010, 150, 0.18, 39.034538, -84.668739],
            ["KCVG", 10010, 150, 0.21, 39.028397, -84.64679],
            ["KDAY", 6995, 150, 235.3, 39.901924, -84.201866],
            ["KDAY", 10893, 150, 235.29, 39.912121, -84.214035],
            ["KDAY", 8507, 150, -1.47, 39.893993, -84.211273],
            ["KFFO", 6997, 150, 228.87, 39.83176, -84.032837],
            ["KFFO", 12595, 300, 228.87, 39.837612, -84.031296],
            ["KHAO", 5494, 100, 290.41, 39.361099, -84.512825],
            ["KLUK", 6106, 150, 200.96, 39.108353, -84.411781],
            ["KLUK", 5124, 100, 242.04, 39.109192, -84.411888],
            ["KMGY", 5002, 100, 202.18, 39.595219, -84.221542],
            ["KMWO", 6097, 100, 229.37, 39.536442, -84.387085],
            ["KRID", 5496, 150, 235.09, 39.760292, -84.834015]
        ],
        "34": [
            ["KCZL", 5008, 75, 348.18, 34.450077, -84.93779],
            ["KDNN", 5002, 100, 317.54, 34.717369, -84.864044],
            ["KJZP", 5007, 100, 339.42, 34.446941, -84.454437],
            ["KRYY", 5350, 75, 268.77, 34.013321, -84.589516],
            ["KVPC", 5749, 100, 183.48, 34.131142, -84.848122]
        ],
        "42": [
            ["KJXN", 5339, 150, 230.89, 42.265366, -84.451302],
            ["KLAN", 7239, 150, 270.61, 42.777985, -84.574028]
        ],
        "43": [
            ["KMBS", 7996, 150, 225.56, 43.542168, -84.067665],
            ["KMBS", 6395, 150, 315.67, 43.524677, -84.072655]
        ],
        "36": [
            ["KSCX", 5502, 75, 226.38, 36.460907, -84.578972]
        ],
        "9": [
            ["MROC", 9944, 151, 249.11, 9.998415, -84.196312],
            ["MRPV", 5249, 60, 273.99, 9.956464, -84.131844]
        ],
        "22": [
            ["MUSJ", 7037, 0, 190.3, 22.112299, -84.149055],
            ["MUSJ", 8497, 0, 259.33, 22.095919, -84.150124]
        ]
    },
    "-87": {
        "31": [
            ["12J", 5133, 0, 242.82, 31.056412, -87.06118],
            ["12J", 5605, 0, 299.96, 31.043913, -87.057404],
            ["KMVC", 6011, 100, 209.6, 31.465212, -87.346268]
        ],
        "34": [
            ["1M4", 5017, 0, 361.68, 34.273453, -87.600662],
            ["9A4", 5009, 0, 355.3, 34.654907, -87.349754],
            ["KHAB", 5010, 100, 361.84, 34.11058, -87.998466],
            ["KMSL", 6688, 150, 294.19, 34.741493, -87.596664]
        ],
        "35": [
            ["2M2", 5010, 0, 346.56, 35.227615, -87.255989],
            ["KGZS", 5006, 0, 333.01, 35.147579, -87.053009],
            ["KMRC", 6002, 100, 233.62, 35.560074, -87.170853]
        ],
        "30": [
            ["4R4", 6614, 0, 189.35, 30.47105, -87.876305],
            ["KJKA", 6957, 100, 269.89, 30.290319, -87.658119],
            ["KNDZ", 6000, 200, 226.99, 30.705856, -87.005341],
            ["KNDZ", 6007, 200, 317.22, 30.690876, -87.009956],
            ["KNPA", 7153, 200, 186.22, 30.361523, -87.319107],
            ["KNPA", 7998, 200, 248.28, 30.357105, -87.304688],
            ["KNPA", 7999, 200, 248.26, 30.358892, -87.305504],
            ["KNSE", 6006, 200, 227, 30.726431, -87.018951],
            ["KNSE", 6007, 200, 317.19, 30.718088, -87.015312],
            ["KPNS", 5994, 150, 258.03, 30.474737, -87.177292],
            ["KPNS", 7019, 150, 347.03, 30.464148, -87.185646]
        ],
        "32": [
            ["7A2", 5006, 0, 222.66, 32.468868, -87.948547],
            ["A08", 6377, 0, 340, 32.504139, -87.382011]
        ],
        "37": [
            ["I05", 5051, 0, 228.08, 37.544556, -87.942863],
            ["I05", 5006, 0, 3.15, 37.534908, -87.954826],
            ["KEHR", 5496, 100, 268.34, 37.808044, -87.676155],
            ["KOWB", 6503, 150, 357.73, 37.731079, -87.16687]
        ],
        "36": [
            ["KCKV", 6007, 100, 346.18, 36.613468, -87.412689],
            ["KHOP", 11828, 200, 224.12, 36.684586, -87.476883],
            ["KHVC", 5496, 100, 257.77, 36.858562, -87.445862]
        ],
        "40": [
            ["KDNV", 5400, 100, 209.15, 40.206684, -87.59021]
        ],
        "42": [
            ["KENW", 5492, 0, 243.71, 42.59967, -87.923386],
            ["KMKE", 9694, 200, 187.15, 42.9576, -87.893005],
            ["KMKE", 8001, 150, 251.61, 42.946434, -87.887527],
            ["KMKE", 5864, 150, 312.3, 42.947266, -87.887123],
            ["KPWK", 5001, 150, 338.64, 42.110546, -87.900406],
            ["KRAC", 6553, 100, 216.9, 42.768749, -87.805672],
            ["KUGN", 5996, 150, 228.4, 42.426769, -87.858963]
        ],
        "45": [
            ["KESC", 6490, 150, 270.89, 45.720547, -87.086479],
            ["KMNM", 5996, 100, 210.85, 45.137341, -87.632477],
            ["KMNM", 5096, 100, 319.88, 45.117115, -87.632271]
        ],
        "38": [
            ["KEVV", 8022, 150, 218.02, 38.048206, -87.518501],
            ["KEVV", 6293, 150, 1.14, 38.028885, -87.534515],
            ["KLWV", 5191, 150, 269.42, 38.767792, -87.600838],
            ["KLWV", 5203, 150, 359.49, 38.753716, -87.600952],
            ["OTN", 5800, 0, 359, 38.843475, -87.49955]
        ],
        "41": [
            ["KGYY", 6996, 150, 304.21, 41.610497, -87.400383],
            ["KIKK", 5978, 100, 218.26, 41.078663, -87.841415],
            ["KMDW", 6443, 150, 223.42, 41.791977, -87.743065],
            ["KMDW", 5504, 150, 223.41, 41.792301, -87.747337],
            ["KMDW", 5139, 150, 313.6, 41.782486, -87.744118],
            ["KMDW", 6519, 150, 313.61, 41.77927, -87.743774],
            ["KORD", 8072, 150, 221.45, 41.969917, -87.879723],
            ["KORD", 7497, 150, 219.44, 41.997635, -87.896255],
            ["KORD", 10127, 150, 269.89, 41.969143, -87.883682],
            ["KORD", 7955, 150, 269.99, 41.984016, -87.888977],
            ["KORD", 12994, 200, 320.04, 41.963146, -87.902283],
            ["KORD", 10001, 150, 320.06, 41.98148, -87.89167]
        ],
        "39": [
            ["KHUF", 9018, 150, 227.15, 39.457344, -87.299698],
            ["KHUF", 7198, 150, 314.97, 39.445782, -87.292366],
            ["KRSV", 5101, 75, 271.82, 39.016193, -87.643005]
        ],
        "44": [
            ["KMTW", 5003, 100, 350, 44.120686, -87.680443]
        ],
        "46": [
            ["KSAW", 12366, 150, 188.94, 46.370377, -87.391533]
        ],
        "43": [
            ["KSBM", 5400, 100, 215.1, 43.776703, -87.845169]
        ],
        "33": [
            ["KTCL", 6503, 150, 220.94, 33.223621, -87.605209]
        ],
        "15": [
            ["MHLM", 9224, 148, 220.21, 15.461658, -87.915634]
        ],
        "14": [
            ["MHSC", 8042, 148, 350.04, 14.371464, -87.619194],
            ["MHTG", 6830, 0, 198.91, 14.068919, -87.214355]
        ],
        "20": [
            ["MXA4", 6070, 0, 303, 20.222126, -87.425896]
        ]
    },
    "-82": {
        "29": [
            ["17FL", 7550, 210, 357, 29.267279, -82.121284],
            ["42J", 5048, 0, 224.92, 29.846371, -82.040802],
            ["FL03", 6002, 175, 357, 29.983685, -82.366005],
            ["KGNV", 7495, 150, 282.31, 29.686169, -82.257492],
            ["KOCF", 6925, 150, -0.07, 29.159826, -82.22303],
            ["X60", 6395, 0, 224.81, 29.364717, -82.4627]
        ],
        "28": [
            ["3FD1", 5001, 0, 255, 28.189783, -82.618103],
            ["KBKV", 5026, 150, 205.99, 28.476513, -82.445992],
            ["KBKV", 6996, 150, 269.8, 28.475973, -82.448799],
            ["KVDF", 5002, 100, 222.36, 28.022125, -82.337379],
            ["KZPH", 5007, 100, 222.59, 28.234259, -82.153229],
            ["KZPH", 5079, 100, 0.3, 28.22023, -82.153305]
        ],
        "42": [
            ["CYQG", 8992, 200, 243.16, 42.284607, -82.940727],
            ["CYQG", 5195, 150, 295.56, 42.267109, -82.95298],
            ["CYZR", 5096, 100, 317.4, 42.994476, -82.302856],
            ["KMTC", 9004, 150, 181.47, 42.626225, -82.836487],
            ["KPHN", 5101, 100, 216.1, 42.915932, -82.524078]
        ],
        "49": [
            ["CYYU", 5507, 100, 336.3, 49.404659, -82.464874]
        ],
        "38": [
            ["I43", 5206, 0, 185.06, 38.988495, -82.577042],
            ["KDWU", 5594, 100, 278.2, 38.553406, -82.728294],
            ["KHTS", 6502, 150, 292.43, 38.364838, -82.549042],
            ["KPMH", 5001, 100, -2.12, 38.833607, -82.846992]
        ],
        "37": [
            ["K22", 5001, 0, 211.05, 37.756886, -82.632217],
            ["KPBX", 5344, 100, 266.92, 37.561108, -82.560837]
        ],
        "31": [
            ["KAMG", 5006, 100, 330.98, 31.530056, -82.502655],
            ["KAYS", 5039, 100, 222.22, 31.253454, -82.388939],
            ["KAYS", 5241, 150, -0.75, 31.241068, -82.398163],
            ["KBHC", 5002, 75, 254.81, 31.715639, -82.386009],
            ["KDQH", 6012, 100, 216.81, 31.483292, -82.854736]
        ],
        "34": [
            ["KAND", 5002, 150, 225.8, 34.499779, -82.701965],
            ["KAND", 5003, 150, 345.94, 34.488232, -82.708099],
            ["KGMU", 5401, 100, 181.2, 34.855309, -82.348206],
            ["KGSP", 11010, 150, 212.14, 34.908455, -82.209061],
            ["KGYH", 8005, 150, 219.89, 34.766739, -82.367844],
            ["KLQK", 5003, 100, 223.81, 34.814919, -82.697098]
        ],
        "35": [
            ["KAVL", 8011, 150, 339.88, 35.425861, -82.53717]
        ],
        "39": [
            ["KCMH", 10236, 150, 274.22, 39.993504, -82.872421],
            ["KLCK", 12098, 200, 225.24, 39.824425, -82.911331],
            ["KLCK", 11934, 150, 225.25, 39.826344, -82.913872],
            ["KUNI", 5596, 100, 240.65, 39.215748, -82.220398]
        ],
        "40": [
            ["KCMH", 7989, 150, 274.22, 40.001587, -82.879135],
            ["KMFD", 6791, 150, 226.88, 40.824276, -82.506859],
            ["KMFD", 8997, 150, 317.01, 40.815029, -82.506111]
        ],
        "32": [
            ["KDBN", 6011, 150, 196.26, 32.573128, -82.979431],
            ["KDBN", 5003, 150, 316.13, 32.558525, -82.983231],
            ["KOKZ", 5014, 75, 300.53, 32.963219, -82.831116],
            ["KSBO", 5041, 100, 309.6, 32.603836, -82.362335],
            ["KVDI", 6000, 100, 242.73, 32.195148, -82.361984],
            ["KVDI", 5004, 150, 311.71, 32.189766, -82.365746]
        ],
        "36": [
            ["KGCY", 6301, 100, 227.29, 36.198845, -82.807198],
            ["KLNP", 5277, 100, 236.11, 36.99155, -82.522476],
            ["KTRI", 8001, 150, 222.5, 36.481525, -82.400696]
        ],
        "33": [
            ["KHQU", 5195, 100, 272.66, 33.529377, -82.507942]
        ],
        "27": [
            ["KLAL", 5005, 150, 224.74, 27.993198, -82.009438],
            ["KLAL", 8493, 150, 269.86, 27.989288, -82.007507],
            ["KMCF", 11435, 151, 220.37, 27.861282, -82.509727],
            ["KPIE", 5509, 150, 219.62, 27.912457, -82.677452],
            ["KPIE", 5159, 150, 268.14, 27.909727, -82.679436],
            ["KPIE", 8822, 150, 351.35, 27.899525, -82.686592],
            ["KSRQ", 5017, 150, 218.01, 27.40082, -82.548111],
            ["KSRQ", 9509, 150, 314.1, 27.386396, -82.544518],
            ["KTPA", 6992, 150, 271.74, 27.970242, -82.514404],
            ["KTPA", 11032, 150, 1.72, 27.963284, -82.542351],
            ["KTPA", 8323, 150, 1.72, 27.964308, -82.528992]
        ],
        "30": [
            ["KLCQ", 7997, 150, 277.06, 30.181358, -82.564964]
        ],
        "8": [
            ["MPDA", 6908, 148, 217.86, 8.398439, -82.429161],
            ["PX02", 6562, 0, 301, 8.762027, -82.675529]
        ],
        "22": [
            ["MUHA", 13136, 148, 234.27, 22.99967, -82.393204],
            ["MUMG", 9334, 148, 272.7, 22.969444, -82.262947],
            ["MUSA", 7873, 150, 183.8, 22.879642, -82.508636],
            ["MUSA", 11799, 185, 232.8, 22.870726, -82.510925],
            ["MUSA", 8144, 150, 293.808, 22.870829, -82.508232]
        ],
        "23": [
            ["MULB", 6775, 165, 261.8, 23.095839, -82.424088],
            ["MUML", 5893, 127, 244.9, 23.010782, -82.75959],
            ["MUPB", 7578, 148, 201.84, 23.042315, -82.575127]
        ],
        "21": [
            ["MUNG", 8212, 148, 228.05, 21.842207, -82.774796],
            ["MUNG", 5346, 98, 351.82, 21.827223, -82.778038],
            ["MUSN", 5913, 98, 229.87, 21.647717, -82.948334]
        ]
    },
    "-95": {
        "32": [
            ["18TE", 5093, 40, 271, 32.585064, -95.055641],
            ["KTYR", 7204, 150, 225.03, 32.359901, -95.39415],
            ["KTYR", 5203, 150, 315.24, 32.351074, -95.393524]
        ],
        "30": [
            ["6R3", 5008, 0, 341.81, 30.349905, -95.005531],
            ["KCXO", 6007, 150, 325.54, 30.345644, -95.406906],
            ["KDWH", 7024, 100, 352.78, 30.053991, -95.551994],
            ["KIAH", 8992, 150, 269.95, 30.007177, -95.33033],
            ["KUTS", 5017, 100, 5.76, 30.740036, -95.587959]
        ],
        "31": [
            ["89TS", 5200, 75, 364, 31.559721, -95.767212],
            ["KJSO", 5015, 75, 320.15, 31.864038, -95.212212],
            ["KPSN", 5017, 100, 360.52, 31.774946, -95.706413]
        ],
        "36": [
            ["H71", 5003, 0, 360.02, 36.218529, -95.330063],
            ["KGCM", 5207, 75, 360.12, 36.285568, -95.47963],
            ["KRVS", 5108, 100, 193.3, 36.046642, -95.983887],
            ["KTUL", 7367, 150, 269.42, 36.195629, -95.874016],
            ["KTUL", 6109, 150, 363.08, 36.190483, -95.900208],
            ["KTUL", 10014, 200, 363.08, 36.186501, -95.883141]
        ],
        "45": [
            ["KAXN", 5095, 100, 319.35, 45.861019, -95.389008],
            ["KILL", 5690, 100, 288.59, 45.112907, -95.079735]
        ],
        "28": [
            ["KBYY", 5111, 75, 313.66, 28.968426, -95.857651]
        ],
        "37": [
            ["KCFV", 5874, 100, 359.83, 37.087124, -95.574326],
            ["KIDP", 5508, 100, 360.29, 37.149616, -95.776649],
            ["KPPF", 5695, 100, 359.63, 37.322067, -95.506104]
        ],
        "29": [
            ["KEFD", 8008, 150, 223.76, 29.614038, -95.145531],
            ["KEFD", 9023, 150, 358.84, 29.59358, -95.163818],
            ["KHOU", 7609, 150, 223.86, 29.65416, -95.268692],
            ["KHOU", 7607, 150, 314.06, 29.636293, -95.26812],
            ["KHOU", 5152, 100, 314.04, 29.642776, -95.272194],
            ["KHOU", 6015, 150, 358.94, 29.635859, -95.284317],
            ["KIAH", 9394, 150, 269.95, 29.993437, -95.325233],
            ["KIAH", 9991, 150, 269.95, 29.977608, -95.302498],
            ["KIAH", 10016, 150, 332.03, 29.963539, -95.346535],
            ["KIAH", 12022, 150, 332.04, 29.958759, -95.340034],
            ["KLBX", 7017, 100, 359.93, 29.099012, -95.462082],
            ["KSGR", 8014, 100, 355.29, 29.611942, -95.655556]
        ],
        "38": [
            ["KFOE", 7000, 150, 219.75, 38.955139, -95.657356],
            ["KFOE", 12801, 200, 317.12, 38.939827, -95.647346],
            ["KUKL", 5506, 75, 359.7, 38.29493, -95.724907]
        ],
        "40": [
            ["KICL", 5001, 75, 204.32, 40.727642, -95.023148]
        ],
        "39": [
            ["KLWC", 5702, 100, 333.53, 39.004658, -95.211121],
            ["KTOP", 5097, 100, 314.4, 39.065002, -95.614189]
        ],
        "35": [
            ["KMKO", 7203, 150, 316.64, 35.64637, -95.349976],
            ["KOKM", 5118, 0, 360.18, 35.661057, -95.948555]
        ],
        "34": [
            ["KMLC", 5609, 0, 200.32, 34.88961, -95.78022]
        ],
        "44": [
            ["KMML", 5004, 100, 309.96, 44.445843, -95.816872]
        ],
        "41": [
            ["KOFF", 11708, 300, 309.18, 41.109177, -95.891983],
            ["KOMA", 9501, 150, 324.45, 41.292641, -95.885933],
            ["KOMA", 7019, 150, 324.45, 41.294563, -95.882393],
            ["KOMA", 8158, 150, 360.21, 41.290962, -95.894615]
        ],
        "43": [
            ["KOTG", 5499, 100, 294.77, 43.651318, -95.56649],
            ["KSPW", 5995, 100, 306.3, 43.161018, -95.194069],
            ["KSPW", 5101, 75, 5.59, 43.158169, -95.203407]
        ],
        "46": [
            ["KPKD", 5491, 100, 315.1, 46.896042, -95.065567]
        ],
        "33": [
            ["KPRX", 6012, 150, 359.18, 33.62833, -95.454147],
            ["KSLR", 5010, 75, 9.63, 33.153053, -95.62252]
        ],
        "48": [
            ["KRRT", 5393, 100, 318.62, 48.934868, -95.339325]
        ],
        "42": [
            ["KSLB", 5003, 75, 354.92, 42.587391, -95.240547]
        ],
        "16": [
            ["MM57", 5629, 0, 362.406, 16.20492, -95.20192],
            ["MMIT", 7596, 148, 359.27, 16.437767, -95.093338]
        ]
    },
    "-86": {
        "32": [
            ["1A9", 5397, 0, 269.25, 32.438824, -86.503922],
            ["KMGM", 9002, 150, 276.03, 32.299801, -86.380951],
            ["KMXF", 8017, 150, 328.54, 32.37257, -86.359512],
            ["KSEM", 8011, 150, 325.88, 32.334846, -86.980507]
        ],
        "36": [
            ["1M5", 5007, 0, 191.07, 36.599602, -86.475273],
            ["KBNA", 8009, 150, 197.94, 36.13361, -86.659271],
            ["KBNA", 7711, 150, 197.6, 36.13784, -86.678566],
            ["KBNA", 8010, 150, 197.94, 36.124229, -86.679588],
            ["KBNA", 11030, 150, 313.38, 36.120483, -86.668144],
            ["KBWG", 6504, 150, 209.82, 36.974163, -86.41394],
            ["KJWN", 5506, 0, 194.71, 36.189594, -86.884361],
            ["KMQY", 5554, 100, 184.12, 36.015823, -86.519791],
            ["KMQY", 8039, 150, 319.21, 36.001137, -86.510925],
            ["M33", 5007, 0, 351.08, 36.370052, -86.40744],
            ["M54", 5003, 0, 186.53, 36.197269, -86.315483],
            ["M91", 5009, 0, 213.01, 36.542938, -86.915962]
        ],
        "34": [
            ["3A1", 5509, 0, 196.48, 34.27594, -86.855446],
            ["4A6", 5253, 0, 217.39, 34.694393, -86.000641],
            ["8A0", 6117, 0, 228.23, 34.234646, -86.24826],
            ["KDCU", 5105, 100, 1.12, 34.645657, -86.945534],
            ["KHSV", 12622, 150, 0.94, 34.618172, -86.782791],
            ["KHSV", 10024, 150, 0.95, 34.625614, -86.766014],
            ["KHUA", 7313, 150, 349.48, 34.668701, -86.682495],
            ["KMDQ", 5017, 100, 360.93, 34.854519, -86.55761]
        ],
        "39": [
            ["4I7", 5005, 0, 1.1, 39.626728, -86.813988],
            ["KBMG", 6506, 150, 351.68, 39.140541, -86.614815],
            ["KIND", 9998, 150, 224.49, 39.719795, -86.279472],
            ["KIND", 11197, 150, 224.48, 39.728306, -86.29287],
            ["KIND", 7602, 150, 314.62, 39.71957, -86.269554]
        ],
        "30": [
            ["FL34", 8000, 90, 361, 30.62262, -86.742973],
            ["KCEW", 8024, 150, 351.03, 30.767956, -86.520111],
            ["KDTS", 5005, 100, 322.24, 30.394629, -86.466599],
            ["KEGI", 8019, 150, 0.92, 30.639359, -86.523094],
            ["KHRT", 9624, 150, 355.98, 30.415747, -86.687729],
            ["KNFJ", 8000, 150, 359, 30.489218, -86.949738],
            ["KVPS", 10024, 300, 192.15, 30.499798, -86.511169],
            ["KVPS", 12000, 300, 299.75, 30.47245, -86.519073]
        ],
        "33": [
            ["KASN", 6006, 100, 215.31, 33.576633, -86.045143],
            ["KBHM", 9999, 150, 235.39, 33.570118, -86.744934],
            ["KBHM", 7112, 150, 0.03, 33.553707, -86.747215],
            ["KEKY", 5701, 100, 229.73, 33.317936, -86.918777],
            ["KGAD", 6799, 150, 240.7, 33.974941, -86.081406],
            ["KSCD", 5383, 100, 270.54, 33.171761, -86.296722]
        ],
        "35": [
            ["KAYX", 6005, 150, 209.93, 35.399708, -86.080772],
            ["KBGF", 5010, 75, 1.71, 35.170658, -86.066422],
            ["KLUG", 5008, 75, 198.09, 35.513496, -86.80127],
            ["KSYI", 5010, 100, -0.65, 35.553223, -86.44239],
            ["KTHA", 5010, 150, -0.16, 35.374344, -86.243523]
        ],
        "42": [
            ["KBEH", 5102, 100, 270.45, 42.127831, -86.418091]
        ],
        "38": [
            ["KFRH", 5493, 100, 255.86, 38.50806, -86.627609]
        ],
        "40": [
            ["KGUS", 12496, 200, 224.33, 40.660343, -86.13633],
            ["KLAF", 6590, 150, 279.13, 40.411106, -86.927513],
            ["KOKK", 5199, 150, 224.87, 40.532719, -86.05407],
            ["KTYQ", 5504, 100, -0.52, 40.023125, -86.251343]
        ],
        "44": [
            ["KMBL", 5491, 100, 271.43, 44.272442, -86.233826]
        ],
        "43": [
            ["KMKG", 6494, 150, 236.33, 43.171497, -86.230591]
        ],
        "41": [
            ["KPPO", 5001, 75, 200.07, 41.57843, -86.731361],
            ["KSBN", 8399, 150, 268.79, 41.704803, -86.298592],
            ["KSBN", 6004, 150, -1.26, 41.702286, -86.318916],
            ["KVPZ", 6990, 150, 270.13, 41.452366, -86.99427]
        ],
        "31": [
            ["KPRN", 5505, 80, 319.77, 31.839943, -86.605019],
            ["KTOI", 5005, 100, 249.42, 31.863569, -86.006767],
            ["KTOI", 5027, 100, 322.98, 31.854158, -86.005081]
        ],
        "15": [
            ["MHLC", 9880, 0, 247.53, 15.747367, -86.839767]
        ],
        "16": [
            ["MHRO", 9083, 0, 227.62, 16.321255, -86.513405]
        ],
        "20": [
            ["MMCZ", 8184, 148, 234.93, 20.535826, -86.920502],
            ["MMCZ", 8847, 148, 295.75, 20.509518, -86.916565]
        ],
        "21": [
            ["MMUN", 11497, 0, 303.8, 21.027792, -86.862968]
        ],
        "12": [
            ["MN0A", 9838, 0, 285.51, 12.349746, -86.169586],
            ["MNFC", 9843, 148, 285.52, 12.346564, -86.170654],
            ["MNMG", 8015, 148, 276.52, 12.140326, -86.157166]
        ],
        "11": [
            ["MNMR", 5185, 150, 231.74, 11.809716, -86.505402]
        ]
    },
    "-73": {
        "42": [
            ["1B1", 5351, 0, 191.59, 42.298485, -73.708328],
            ["KALB", 7202, 150, 178.17, 42.756908, -73.805107],
            ["KALB", 7188, 150, 268.19, 42.749771, -73.785645],
            ["KSCH", 7000, 150, 205.94, 42.864155, -73.922348]
        ],
        "45": [
            ["CYHU", 7790, 150, 226.89, 45.525501, -73.406631],
            ["CYMX", 11988, 200, 224.92, 45.693687, -73.988533],
            ["CYUL", 9526, 200, 222.81, 45.476948, -73.716095],
            ["CYUL", 11020, 200, 222.67, 45.48333, -73.735809],
            ["CYUL", 6979, 200, 267.51, 45.463612, -73.738586]
        ],
        "44": [
            ["KBTV", 8312, 150, 310.87, 44.465782, -73.141792],
            ["KPBG", 11756, 200, 337.51, 44.636036, -73.459457]
        ],
        "40": [
            ["KFRG", 5519, 150, 179.18, 40.736755, -73.414543],
            ["KFRG", 6823, 150, 312.3, 40.721962, -73.403389],
            ["KISP", 7000, 150, 224.92, 40.802231, -73.094543],
            ["KISP", 5028, 150, 269.99, 40.792526, -73.089798],
            ["KISP", 5184, 150, 315.07, 40.792152, -73.094086],
            ["KJFK", 8401, 200, 210.71, 40.645229, -73.754852],
            ["KJFK", 11353, 150, 210.7, 40.648037, -73.765244],
            ["KJFK", 14564, 150, 300.81, 40.628105, -73.771996],
            ["KJFK", 9992, 150, 300.82, 40.643723, -73.759262],
            ["KLGA", 7000, 150, 212.08, 40.785435, -73.870659],
            ["KLGA", 6994, 150, 302.22, 40.772068, -73.857101]
        ],
        "43": [
            ["KGFL", 5002, 150, 178.44, 43.349384, -73.6092]
        ],
        "41": [
            ["KHPN", 6548, 150, 329.95, 41.059994, -73.701385],
            ["KOXC", 5802, 100, -9.21, 41.470459, -73.133492]
        ],
        "20": [
            ["MYIG", 7000, 89, 265, 20.984167, -73.656418]
        ],
        "22": [
            ["MYMM", 7700, 150, 233, 22.389687, -73.024208]
        ],
        "-36": [
            ["SCIE", 7548, 148, 205.02, -36.76326, -73.057648]
        ],
        "-40": [
            ["SCJO", 5579, 0, 335.04, -40.618313, -73.056305]
        ],
        "-41": [
            ["SCTE", 8718, 148, 361.53, -41.450825, -73.094383]
        ],
        "-39": [
            ["SCVD", 6887, 148, 360.06, -39.658875, -73.086388]
        ],
        "4": [
            ["SKAP", 8196, 0, 270, 4.079166, -73.55526],
            ["SKVV", 5593, 0, 219.05, 4.173911, -73.608574]
        ],
        "7": [
            ["SKBG", 7445, 0, 339.45, 7.116985, -73.181183],
            ["SKEJ", 5925, 0, 210.87, 7.031406, -73.802605]
        ],
        "5": [
            ["SKPA", 5382, 98, 218, 5.770352, -73.100861]
        ],
        "10": [
            ["SKVP", 6920, 98, 189.87, 10.444419, -73.24778]
        ],
        "-13": [
            ["SPHY", 8202, 98, 209.5, -13.694362, -73.342354]
        ],
        "-3": [
            ["SPQT", 8216, 148, 236.57, -3.778521, -73.299385]
        ]
    },
    "-119": {
        "35": [
            ["1CA1", 5600, 0, 330, 35.461361, -119.717361],
            ["KBFL", 10859, 150, 315.4, 35.426186, -119.046898],
            ["KDLO", 5655, 75, 338.61, 35.737747, -119.232719]
        ],
        "36": [
            ["24CL", 7000, 80, 335, 36.079906, -119.533585],
            ["KFAT", 7203, 100, 305.43, 36.770264, -119.709991],
            ["KFAT", 9213, 150, 305.43, 36.768845, -119.703514],
            ["KHJO", 5179, 75, 331.64, 36.310467, -119.623466],
            ["KNLC", 13514, 200, 336.04, 36.302082, -119.943604],
            ["KNLC", 13517, 200, 336.05, 36.330273, -119.942024],
            ["KPTV", 5908, 150, 315.36, 36.023842, -119.055687],
            ["KVIS", 6560, 150, 314.88, 36.312286, -119.384956]
        ],
        "39": [
            ["4SD", 7595, 0, 275.92, 39.662193, -119.865295],
            ["4SD", 8089, 0, 333.65, 39.661255, -119.867363],
            ["A34", 5337, 0, 244.9, 39.241631, -119.5466],
            ["KCXP", 5897, 75, 286.63, 39.189911, -119.724449],
            ["KRNO", 6093, 150, 270.25, 39.496208, -119.757202],
            ["KRNO", 11008, 150, 360.11, 39.483643, -119.769295],
            ["KRNO", 9006, 150, 360.11, 39.489132, -119.7668],
            ["O43", 5800, 0, 206, 39.011993, -119.153015]
        ],
        "49": [
            ["CYLW", 7416, 200, 355.46, 49.946381, -119.376389],
            ["CYYF", 5770, 148, 361.38, 49.455307, -119.602524]
        ],
        "34": [
            ["KCMA", 6003, 150, 270.57, 34.213669, -119.084358],
            ["KNTD", 11106, 200, 223.74, 34.130444, -119.109062],
            ["KNTD", 5498, 200, 285.06, 34.116936, -119.106293],
            ["KOXR", 5944, 100, 270.53, 34.200726, -119.197884],
            ["KSBA", 6042, 150, 268.55, 34.427959, -119.831947]
        ],
        "47": [
            ["KEPH", 6692, 0, 222.67, 47.317848, -119.5056],
            ["KMWH", 9985, 100, 234.15, 47.212769, -119.300262],
            ["KMWH", 13494, 200, 342.15, 47.190426, -119.309814]
        ],
        "38": [
            ["KMEV", 5297, 75, 314.86, 38.995239, -119.7453],
            ["KMEV", 7406, 100, 359.79, 38.991158, -119.751884],
            ["KTVL", 8548, 150, 372.9, 38.883102, -119.998505]
        ],
        "33": [
            ["KNSI", 10003, 200, 312.68, 33.230377, -119.445999]
        ]
    },
    "-97": {
        "34": [
            ["1F0", 5009, 0, 359.18, 34.14011, -97.122528],
            ["KADM", 7222, 150, 315.5, 34.297119, -97.008308],
            ["KADM", 5015, 100, 360.42, 34.29501, -97.023628],
            ["KDUC", 6660, 100, 359.3, 34.461739, -97.959724],
            ["KPVJ", 5007, 100, 360, 34.700706, -97.22419]
        ],
        "32": [
            ["4TA2", 6000, 0, 357, 32.969124, -97.487846],
            ["KAFW", 8232, 150, 350.24, 32.975346, -97.317352],
            ["KAFW", 9615, 150, 350.24, 32.975365, -97.315369],
            ["KCPT", 5709, 100, 339.27, 32.346416, -97.430458],
            ["KDFW", 13427, 151, 180.25, 32.915794, -97.050728],
            ["KDFW", 13427, 151, 180.25, 32.91581, -97.054642],
            ["KDFW", 9307, 150, 319.14, 32.890263, -97.063255],
            ["KDFW", 9002, 200, 315.37, 32.894939, -97.000778],
            ["KDFW", 13427, 200, 360.26, 32.878895, -97.030083],
            ["KDFW", 8517, 150, 360.27, 32.874954, -97.009911],
            ["KDFW", 11411, 150, 360.26, 32.878876, -97.026169],
            ["KDFW", 13427, 150, 360.25, 32.878983, -97.05484],
            ["KDFW", 13427, 200, 360.25, 32.878967, -97.050926],
            ["KFTW", 7516, 150, 351.93, 32.809761, -97.359039],
            ["KFWS", 6015, 100, 360.11, 32.556007, -97.309692],
            ["KGKY", 6092, 100, 348.06, 32.655685, -97.092224],
            ["KNFW", 12026, 200, 360.52, 32.752674, -97.441704]
        ],
        "50": [
            ["CYGM", 6786, 150, 330.07, 50.620056, -97.035912]
        ],
        "55": [
            ["CYTH", 5788, 150, 240.99, 55.804111, -97.850067]
        ],
        "49": [
            ["CYWG", 8672, 200, 318.66, 49.895168, -97.227844],
            ["CYWG", 10989, 200, 8.47, 49.8951, -97.24189]
        ],
        "36": [
            ["F22", 5104, 0, 359.72, 36.378593, -97.277168],
            ["KEND", 5013, 0, 225.54, 36.346817, -97.910728],
            ["KEND", 9216, 150, 360.02, 36.32394, -97.923203],
            ["KEND", 5031, 150, 360.03, 36.333096, -97.911011],
            ["KEND", 9215, 150, 360.03, 36.330257, -97.914673],
            ["KPNC", 7211, 150, 359.63, 36.722057, -97.099701],
            ["KSWO", 5002, 75, 224.42, 36.165169, -97.078674],
            ["KSWO", 7409, 100, 359.49, 36.151981, -97.086632],
            ["KWDG", 5512, 0, 315.1, 36.375519, -97.78109],
            ["KWDG", 6397, 150, 360.01, 36.369656, -97.791077]
        ],
        "35": [
            ["F29", 6023, 0, 360.2, 35.479786, -97.824829],
            ["KCHK", 5108, 100, 360, 35.089401, -97.969208],
            ["KHSD", 5008, 100, 357.97, 35.594967, -97.705856],
            ["KOKC", 7801, 150, 315.15, 35.389442, -97.597412],
            ["KOKC", 9816, 150, 359.96, 35.379017, -97.605698],
            ["KOKC", 9817, 150, 359.96, 35.378227, -97.588913],
            ["KOUN", 5207, 100, 359.65, 35.242146, -97.473007],
            ["KPWA", 5009, 75, 360, 35.529549, -97.649185],
            ["KPWA", 7209, 150, 359.99, 35.524578, -97.645493],
            ["KTIK", 10000, 200, 311.14, 35.406811, -97.378914],
            ["KTIK", 11119, 200, 360.21, 35.398491, -97.382118]
        ],
        "37": [
            ["KAAO", 6106, 100, 6.83, 37.73925, -97.222374],
            ["KBEC", 8009, 100, 10.49, 37.683666, -97.217514],
            ["KIAB", 12014, 300, 192.44, 37.638958, -97.261749],
            ["KIAB", 12013, 200, 192.44, 37.639442, -97.264526],
            ["KICT", 7308, 150, 199.97, 37.661602, -97.417648],
            ["KICT", 10310, 150, 199.95, 37.661594, -97.433815],
            ["KICT", 6304, 150, 330.06, 37.642559, -97.429184],
            ["KWLD", 5512, 100, 359.99, 37.162144, -97.03611],
            ["SN76", 7000, 200, 357, 37.916813, -97.909332]
        ],
        "31": [
            ["KACT", 6609, 150, 194.19, 31.621101, -97.224739],
            ["KACT", 5903, 150, 329.32, 31.603165, -97.22921],
            ["KCNW", 6305, 150, 357.54, 31.626478, -97.074959],
            ["KCNW", 8619, 150, 357.55, 31.627975, -97.072624],
            ["KGRK", 10019, 200, 337.42, 31.054546, -97.822769],
            ["KILE", 5504, 100, 196.75, 31.093216, -97.683907],
            ["KPWG", 5513, 75, 359, 31.478666, -97.318039],
            ["KTPL", 6314, 150, 342.66, 31.143454, -97.406136]
        ],
        "44": [
            ["KATY", 6892, 150, 304.6, 44.911488, -97.147362],
            ["KATY", 6895, 150, 360.25, 44.901649, -97.151169]
        ],
        "30": [
            ["KAUS", 12278, 150, 358.69, 30.179937, -97.678474],
            ["KAUS", 9022, 150, 358.7, 30.179083, -97.657242],
            ["KGTU", 5011, 100, 363.55, 30.672184, -97.678902]
        ],
        "25": [
            ["KBRO", 7410, 150, 315.51, 25.898325, -97.415482],
            ["KBRO", 6019, 150, 362.14, 25.898567, -97.429535],
            ["MMMA", 7528, 151, 336.26, 25.76049, -97.520622]
        ],
        "27": [
            ["KCRP", 7516, 150, 315.92, 27.762186, -97.4972],
            ["KCRP", 6096, 150, 359.11, 27.762922, -97.496033],
            ["KNGP", 5002, 200, 224.93, 27.69976, -97.286499],
            ["KNGP", 8012, 200, 315.08, 27.685171, -97.284073],
            ["KNGP", 5003, 200, 315.08, 27.685574, -97.281242],
            ["KNGP", 5017, 200, 359.98, 27.685448, -97.288467],
            ["KNQI", 8008, 200, 134.49, 27.512571, -97.81675],
            ["KNQI", 8008, 200, 314.49, 27.497179, -97.79908],
            ["KNQI", 8008, 200, 314.48, 27.498556, -97.797569],
            ["KNQI", 8023, 200, 359.38, 27.492432, -97.810333],
            ["KNQI", 8022, 200, 359.38, 27.492451, -97.808174],
            ["T43", 5006, 0, 319.84, 27.907778, -97.206474]
        ],
        "33": [
            ["KDTO", 6011, 150, 361.06, 33.192471, -97.198158],
            ["KGLE", 6011, 100, 361.11, 33.644753, -97.19986]
        ],
        "38": [
            ["KEWK", 7010, 100, 360.01, 38.045662, -97.276382],
            ["KHUT", 5999, 100, 222.36, 38.07069, -97.849548],
            ["KHUT", 7004, 100, 318.34, 38.059853, -97.854874],
            ["KMPR", 5506, 100, 365.6, 38.344341, -97.690804],
            ["KSLN", 8499, 100, 312.46, 38.779034, -97.646606],
            ["KSLN", 12312, 150, 359.89, 38.776627, -97.645882]
        ],
        "47": [
            ["KGFK", 7345, 150, 360.02, 47.939095, -97.181236],
            ["KRDR", 12345, 150, 360.05, 47.944336, -97.40081]
        ],
        "26": [
            ["KHRL", 7265, 150, 315.74, 26.21891, -97.648476],
            ["KHRL", 8326, 150, 360.63, 26.217541, -97.658852],
            ["KHRL", 5967, 150, 360.63, 26.217592, -97.648888],
            ["KPIL", 5008, 150, 214.75, 26.173254, -97.34626],
            ["KPIL", 5295, 150, 269.9, 26.163637, -97.337929],
            ["KPIL", 8009, 200, 314.95, 26.157473, -97.332573],
            ["T65", 5005, 0, 321.68, 26.17223, -97.9683]
        ],
        "29": [
            ["KHYI", 5515, 0, 230.81, 29.901363, -97.86348],
            ["KHYI", 6323, 100, 267.84, 29.892456, -97.857109],
            ["KHYI", 5606, 150, 312.97, 29.886547, -97.857056],
            ["KHYI", 5225, 100, 357.88, 29.887352, -97.85714],
            ["SEQ", 8350, 0, 317, 29.557409, -97.899353]
        ],
        "40": [
            ["KJYR", 5902, 100, 354.66, 40.888577, -97.621773]
        ],
        "41": [
            ["KOFK", 5801, 100, 199.37, 41.992622, -97.430412],
            ["KOFK", 5798, 100, 321.99, 41.979553, -97.429688],
            ["KOLU", 6800, 100, 329.87, 41.441425, -97.337532]
        ],
        "28": [
            ["KRKP", 5616, 150, 325.55, 28.080011, -97.041756]
        ],
        "42": [
            ["KYKN", 6092, 100, 319.81, 42.911537, -97.379639]
        ],
        "24": [
            ["MM18", 5751, 0, 8.306, 24.496258, -97.753105]
        ],
        "23": [
            ["MM22", 6775, 70, 348.207, 23.793062, -97.771637]
        ],
        "18": [
            ["MMHC", 5576, 115, 317, 18.494406, -97.411163]
        ],
        "20": [
            ["MMPA", 5864, 148, 269.17, 20.602209, -97.451981]
        ],
        "15": [
            ["MMPS", 7572, 148, 273.57, 15.876256, -97.078316]
        ],
        "22": [
            ["MMTM", 8348, 148, 324.98, 22.283232, -97.859924]
        ]
    },
    "-113": {
        "35": [
            ["1G4", 5066, 0, 365.41, 35.976543, -113.818039],
            ["KIGM", 6831, 150, 224.92, 35.26474, -113.931915],
            ["KIGM", 6735, 75, 360.03, 35.251625, -113.936058]
        ],
        "53": [
            ["CYEG", 10981, 200, 214.93, 53.333336, -113.567619],
            ["CYEG", 10181, 200, 314.98, 53.286446, -113.562508],
            ["CYXD", 5861, 200, 318.26, 53.565948, -113.51062],
            ["CYXD", 5692, 200, 359.99, 53.564823, -113.51284]
        ],
        "52": [
            ["CYQF", 5523, 98, 359.95, 52.176003, -113.892601]
        ],
        "49": [
            ["CZPC", 6593, 100, 270.01, 49.520432, -113.983566]
        ],
        "43": [
            ["KAOC", 6590, 75, 250.12, 43.606609, -113.322525]
        ],
        "36": [
            ["KAZC", 5107, 60, 207.82, 36.965977, -113.008652],
            ["KAZC", 6301, 75, 302.62, 36.955383, -113.005676]
        ],
        "37": [
            ["KCDC", 8653, 150, 214.19, 37.710239, -113.090973],
            ["KSGU", 6614, 100, 360.11, 37.081501, -113.593079]
        ],
        "38": [
            ["KMLF", 5006, 75, 360, 38.419685, -113.013008]
        ],
        "45": [
            ["KSMN", 5147, 60, 367.78, 45.116779, -113.88269]
        ]
    },
    "-88": {
        "39": [
            ["1H2", 5095, 0, 293.04, 39.068111, -88.524757],
            ["KDEC", 8489, 150, 239.07, 39.839062, -88.848526],
            ["KDEC", 6792, 150, 299.2, 39.832161, -88.853638],
            ["KDEC", 5304, 150, -0.88, 39.8269, -88.874084],
            ["KMTO", 5794, 100, 240.15, 39.482056, -88.270485],
            ["KMTO", 6494, 150, 292.97, 39.474308, -88.268463]
        ],
        "32": [
            ["1MS8", 6300, 150, 312, 32.934402, -88.571564],
            ["KMEI", 10020, 150, 189.25, 32.344852, -88.751175],
            ["KNJW", 8003, 150, 314.2, 32.791275, -88.825157],
            ["KNMM", 8015, 200, 189, 32.581394, -88.548332],
            ["KNMM", 8018, 200, 188.98, 32.552101, -88.566963],
            ["KNMM", 6395, 200, 279.05, 32.546059, -88.533905]
        ],
        "33": [
            ["3M8", 5154, 0, 186.52, 33.393772, -88.005615],
            ["KCBM", 6324, 175, 315.09, 33.638882, -88.44574],
            ["KCBM", 8004, 150, 315.09, 33.63982, -88.433151],
            ["KCBM", 12009, 300, 315.08, 33.631958, -88.430466],
            ["KGTR", 6509, 150, 360.47, 33.441406, -88.591461],
            ["KSTF", 5559, 150, 358.57, 33.42448, -88.848389],
            ["M40", 5010, 0, 6.2, 33.866913, -88.49057]
        ],
        "42": [
            ["44IL", 5400, 0, 269, 42.378204, -88.3134]
        ],
        "41": [
            ["KARR", 6491, 100, 269.14, 41.77042, -88.461517],
            ["KARR", 5502, 100, 326.76, 41.767403, -88.475075],
            ["KDKB", 7229, 100, 199.47, 41.945805, -88.698158],
            ["KDPA", 5101, 100, 193.99, 41.906933, -88.245377],
            ["KDPA", 7573, 100, 193.99, 41.914181, -88.246811],
            ["KLOT", 5102, 100, 193.7, 41.612827, -88.096466],
            ["KLOT", 5689, 75, 267.77, 41.608654, -88.083626]
        ],
        "44": [
            ["KATW", 8000, 150, 206.08, 44.268635, -88.512718],
            ["KATW", 6491, 150, 296.16, 44.253326, -88.507439],
            ["KGRB", 7690, 150, 239.87, 44.493023, -88.112495],
            ["KGRB", 8200, 150, -0.08, 44.471317, -88.133614]
        ],
        "30": [
            ["KBFM", 9627, 150, 318.84, 30.613194, -88.059761],
            ["KBFM", 7818, 150, -0.03, 30.620546, -88.065903],
            ["KBIX", 7638, 150, 215.36, 30.418964, -88.917099],
            ["KMOB", 8532, 150, 324.3, 30.683298, -88.238136],
            ["KPQL", 6513, 100, 346.1, 30.454103, -88.526741]
        ],
        "40": [
            ["KBMI", 8005, 150, 197.86, 40.484943, -88.907181],
            ["KBMI", 6517, 150, 287.93, 40.477566, -88.910004],
            ["KCMI", 6499, 150, 221, 40.045273, -88.270142],
            ["KCMI", 8098, 150, 315.67, 40.031464, -88.265472],
            ["KCMI", 5303, 150, 359.4, 40.032516, -88.282097]
        ],
        "36": [
            ["KCEY", 6199, 100, 229.81, 36.670063, -88.364685],
            ["KHZD", 5508, 100, 192.19, 36.096687, -88.461319],
            ["KPHT", 5007, 100, 196.32, 36.342541, -88.382034],
            ["KUCY", 5007, 100, 186.36, 36.388611, -88.984474]
        ],
        "47": [
            ["KCMX", 5187, 100, 246.85, 47.169868, -88.47953],
            ["KCMX", 6492, 150, 310.9, 47.163654, -88.479088]
        ],
        "34": [
            ["KCRX", 6511, 0, 353.57, 34.90609, -88.602264],
            ["KTUP", 6512, 100, 359.87, 34.259171, -88.769875]
        ],
        "43": [
            ["KFLD", 5943, 100, 0.05, 43.762833, -88.486198],
            ["KOSH", 6167, 150, 270.56, 43.99147, -88.54863],
            ["KOSH", 8002, 150, 360.54, 43.963833, -88.556717],
            ["KUES", 5839, 100, 281.98, 43.040611, -88.228294],
            ["KUNU", 5052, 100, 259.71, 43.427547, -88.696724]
        ],
        "38": [
            ["KFOA", 5006, 75, 209.59, 38.670216, -88.44841],
            ["KMVN", 6496, 150, 230, 38.329346, -88.849251]
        ],
        "45": [
            ["KIMT", 6498, 150, 187.66, 45.828175, -88.111732]
        ],
        "35": [
            ["KMKL", 6013, 150, 202.18, 35.605721, -88.912064],
            ["KSNH", 5007, 100, 187.49, 35.177055, -88.21563],
            ["KSZY", 5009, 75, 345.66, 35.196289, -88.496277],
            ["M52", 5003, 0, 328.76, 35.644276, -88.372673]
        ],
        "37": [
            ["KPAH", 6500, 150, 223.61, 37.066387, -88.76609]
        ],
        "15": [
            ["MGPB", 8957, 110, 304, 15.72479, -88.574417]
        ],
        "18": [
            ["MMCM", 7192, 151, 288.06, 18.501619, -88.31707]
        ],
        "20": [
            ["MMCT", 9177, 148, 280.32, 20.63908, -88.432999]
        ],
        "21": [
            ["MXA3", 5904, 0, 303, 21.145588, -88.159386]
        ],
        "17": [
            ["MZBZ", 7093, 150, 257, 17.541271, -88.298264]
        ]
    },
    "-90": {
        "31": [
            ["1R7", 5001, 0, 227.54, 31.610727, -90.403038],
            ["KMCB", 5009, 100, 335.71, 31.172167, -90.468552]
        ],
        "32": [
            ["87I", 5010, 0, 354.35, 32.876369, -90.462837],
            ["KHKS", 5395, 150, 338.79, 32.32909, -90.220398],
            ["KJAN", 8515, 151, 158.04, 32.315815, -90.084396],
            ["KJAN", 8515, 150, 338.04, 32.294155, -90.074066],
            ["KJAN", 8515, 150, 338.05, 32.30653, -90.06739],
            ["KVKS", 5010, 100, 187.26, 32.246014, -90.927589]
        ],
        "38": [
            ["KALN", 8093, 150, 293.4, 38.886425, -90.028824],
            ["KALN", 6507, 100, 353.37, 38.880745, -90.049873],
            ["KCPS", 6993, 100, 302.28, 38.563747, -90.144333],
            ["KSTL", 7595, 150, 242.76, 38.756218, -90.357483],
            ["KSTL", 11032, 200, 302.25, 38.737762, -90.34639],
            ["KSTL", 8996, 150, 302.26, 38.738609, -90.339569],
            ["KSUS", 7476, 150, 258.04, 38.661934, -90.634125]
        ],
        "36": [
            ["KARG", 5002, 150, 224.97, 36.125206, -90.919273],
            ["KARG", 5003, 150, 315.11, 36.124916, -90.919273],
            ["KARG", 5009, 150, 360.04, 36.118992, -90.923286],
            ["KPOF", 5013, 100, 361.38, 36.767082, -90.325058],
            ["KTKX", 5006, 75, 197.83, 36.230282, -90.035355]
        ],
        "46": [
            ["KASX", 5196, 100, 200.76, 46.553871, -90.91732],
            ["KIWD", 6488, 130, 270.2, 46.527443, -90.118462]
        ],
        "35": [
            ["KAWM", 6013, 100, 360.55, 35.126804, -90.234543],
            ["KJBR", 6200, 150, 229.73, 35.839703, -90.635147]
        ],
        "34": [
            ["KCKM", 5413, 100, 2.61, 34.292286, -90.512726],
            ["KHEE", 5008, 96, 360.46, 34.57214, -90.67775],
            ["KUTA", 7011, 150, 347.04, 34.673676, -90.344597]
        ],
        "41": [
            ["KCWI", 5204, 100, 209.61, 41.838741, -90.323578],
            ["KDVN", 5500, 100, 329.61, 41.602345, -90.583199],
            ["KMLI", 9987, 150, 271.19, 41.448627, -90.490532],
            ["KMLI", 6995, 150, 307.44, 41.443325, -90.495155]
        ],
        "42": [
            ["KDBQ", 6497, 100, 314.99, 42.396713, -90.698463],
            ["KDBQ", 6329, 150, 359.95, 42.392262, -90.712021]
        ],
        "40": [
            ["KGBG", 5793, 150, 208.12, 40.944912, -90.426582],
            ["KMQB", 5093, 100, 270.1, 40.519672, -90.642693]
        ],
        "33": [
            ["KGLH", 7032, 150, 359.99, 33.474884, -90.987221],
            ["KGLH", 8016, 150, 360, 33.47488, -90.982086],
            ["KGWO", 5005, 150, 232.41, 33.50153, -90.078064],
            ["KGWO", 6516, 150, 361.41, 33.481262, -90.088547],
            ["KIDL", 7005, 150, 359.81, 33.476135, -90.678841]
        ],
        "30": [
            ["KHDC", 6507, 100, 314.61, 30.515465, -90.410484],
            ["KHDC", 5013, 150, 359.52, 30.514837, -90.41909],
            ["KMSY", 7017, 150, 195.43, 30.003054, -90.245499],
            ["KNEW", 6894, 150, 359.26, 30.034019, -90.029648]
        ],
        "29": [
            ["KHUM", 6524, 150, 360.33, 29.55707, -90.66037],
            ["KMSY", 10097, 150, 285.53, 29.989214, -90.250961],
            ["KNBG", 8007, 200, 224.18, 29.843189, -90.015266],
            ["KNBG", 6008, 200, 320.62, 29.810616, -90.021049]
        ],
        "43": [
            ["KVOK", 8985, 150, 269.31, 43.939083, -90.23632]
        ],
        "14": [
            ["MGGT", 9838, 196, 197.92, 14.593914, -90.524101]
        ],
        "13": [
            ["MGSJ", 6580, 150, 339.87, 13.925831, -90.833328]
        ],
        "19": [
            ["MMCP", 8231, 148, 346.22, 19.805836, -90.497444]
        ],
        "0": [
            ["SEGS", 7905, 115, 323.82, -0.462488, -90.25943]
        ]
    },
    "-111": {
        "42": [
            ["1U7", 5730, 0, 295, 42.247093, -111.320602]
        ],
        "33": [
            ["34AZ", 5200, 200, 223, 33.248905, -111.909874],
            ["34AZ", 8560, 75, 313, 33.235371, -111.902817],
            ["KFFZ", 5102, 100, 231.08, 33.46468, -111.721054],
            ["KIWA", 10405, 150, 315.64, 33.29726, -111.64901],
            ["KIWA", 9306, 150, 315.65, 33.299324, -111.639984],
            ["KIWA", 10206, 150, 315.65, 33.297588, -111.642525],
            ["KPHX", 10287, 150, 270.05, 33.431026, -111.993317],
            ["KPHX", 11477, 150, 270.07, 33.440819, -111.992111],
            ["KSDL", 8255, 100, 223.89, 33.630756, -111.901413]
        ],
        "40": [
            ["36U", 6893, 0, 229.71, 40.487915, -111.419319],
            ["KPVU", 8599, 150, 325.85, 40.21069, -111.715118],
            ["KPVU", 6617, 150, 371.74, 40.20866, -111.72522],
            ["KSLC", 12006, 150, 354.994, 40.774933, -111.995438],
            ["KSLC", 12011, 150, 354.97, 40.774612, -111.973038],
            ["KSLC", 9602, 150, 359.99, 40.772484, -111.962006],
            ["U42", 5862, 0, 352.47, 40.61158, -111.991501],
            ["U77", 5700, 0, 314, 40.136185, -111.653954]
        ],
        "38": [
            ["38U", 5900, 0, 324, 38.355927, -111.589951]
        ],
        "43": [
            ["46U", 5625, 0, 325, 43.172749, -111.030983],
            ["U59", 7291, 0, 228.14, 43.749123, -111.087181]
        ],
        "45": [
            ["9S5", 5093, 0, 219.91, 45.883472, -111.562996],
            ["KBZN", 8992, 150, 315.81, 45.770405, -111.141861]
        ],
        "52": [
            ["CFP7", 6700, 0, 308, 52.824898, -111.08857]
        ],
        "56": [
            ["CYMM", 5984, 150, 270.01, 56.653202, -111.207085]
        ],
        "50": [
            ["CYSD", 6000, 0, 237, 50.268372, -111.179283]
        ],
        "60": [
            ["CYSM", 5986, 200, 312.97, 60.014709, -111.949821]
        ],
        "31": [
            ["E78", 5830, 0, 232, 31.937769, -111.886864]
        ],
        "32": [
            ["KAVQ", 6904, 100, 315.57, 32.404144, -111.210518],
            ["KCGZ", 5198, 100, 239.84, 32.958477, -111.759476],
            ["KMZJ", 6853, 150, 314.92, 32.503204, -111.317444],
            ["KRYN", 5495, 75, 250.26, 32.145233, -111.16256],
            ["P08", 5526, 0, 239.98, 32.941223, -111.419716]
        ],
        "41": [
            ["KEVW", 7290, 100, 246.72, 41.278919, -111.019806],
            ["KHIF", 13500, 200, 332.92, 41.107449, -111.961853],
            ["KLGU", 9098, 100, 362.71, 41.780914, -111.849228]
        ],
        "35": [
            ["KFLG", 6999, 150, 221.09, 35.145683, -111.663506]
        ],
        "47": [
            ["KGTF", 10487, 150, 224.98, 47.489681, -111.353775],
            ["KGTF", 6353, 150, 360.01, 47.47612, -111.372841]
        ],
        "46": [
            ["KHLN", 8982, 150, 282.72, 46.602985, -111.96273]
        ],
        "34": [
            ["KPAN", 5494, 75, 255.95, 34.258667, -111.330414],
            ["KSEZ", 5132, 100, 225.7, 34.853523, -111.782333]
        ],
        "36": [
            ["KPGA", 5504, 150, 350.13, 36.917267, -111.445702],
            ["T03", 6230, 0, 343, 36.084602, -111.379547]
        ],
        "44": [
            ["KWYS", 8394, 150, 206.23, 44.698719, -111.110481]
        ],
        "25": [
            ["MM71", 5250, 0, 311.005, 25.049051, -111.608871],
            ["MMLT", 7234, 148, 353.04, 25.980017, -111.347008]
        ],
        "29": [
            ["MMHO", 7527, 148, 238.7, 29.098684, -111.042442]
        ]
    },
    "-117": {
        "41": [
            ["26U", 5900, 0, 357, 41.994022, -117.722626]
        ],
        "45": [
            ["4S3", 5199, 0, 346.89, 45.352608, -117.251534],
            ["KLGD", 5594, 100, 315.09, 45.284676, -117.996574]
        ],
        "34": [
            ["9L2", 5992, 0, 254.08, 34.993034, -117.853546],
            ["KAPV", 6505, 150, 16.04, 34.570465, -117.188499],
            ["KEDW", 15008, 0, 238.16, 34.916283, -117.862389],
            ["KEDW", 8000, 50, 253.8, 34.902344, -117.857018],
            ["KONT", 10187, 150, 269.98, 34.054958, -117.582527],
            ["KONT", 12185, 150, 269.97, 34.056889, -117.582382],
            ["KSBD", 9993, 200, 250.38, 34.099949, -117.219284],
            ["KVCV", 9140, 150, 224.45, 34.600597, -117.36644],
            ["KVCV", 15067, 150, 359.52, 34.578838, -117.386345]
        ],
        "39": [
            ["9U3", 6000, 0, 376, 39.460064, -117.198311],
            ["NV30", 6000, 60, 355, 39.954575, -117.826256]
        ],
        "38": [
            ["A36", 6776, 0, 365, 38.684834, -117.147789],
            ["KTPH", 5461, 50, 305.05, 38.058559, -117.076271],
            ["KTPH", 7064, 80, 345.01, 38.048817, -117.086365]
        ],
        "56": [
            ["CFX4", 5563, 100, 269.99, 56.950871, -117.628792]
        ],
        "49": [
            ["CYCG", 5371, 150, 348.64, 49.289165, -117.630547]
        ],
        "44": [
            ["KBKE", 5090, 100, 321.58, 44.831326, -117.801186]
        ],
        "33": [
            ["KCNO", 6025, 150, 224.33, 33.98098, -117.629585],
            ["KCNO", 6992, 150, 269.43, 33.973705, -117.623619],
            ["KNFG", 6002, 200, 224.66, 33.307446, -117.347916],
            ["KNZJ", 7995, 200, 90, 33.67038, -117.744629],
            ["KNZJ", 10020, 200, 180, 33.686695, -117.729744],
            ["KNZJ", 7995, 200, 270, 33.67038, -117.718277],
            ["KNZJ", 7995, 200, 270, 33.671764, -117.718277],
            ["KNZJ", 10020, 200, 360, 33.659214, -117.729744],
            ["KNZJ", 10020, 200, 360, 33.659214, -117.727913],
            ["KRAL", 5395, 100, 283.09, 33.950535, -117.434608],
            ["KRIV", 13315, 200, 329.4, 33.864983, -117.248238],
            ["KSNA", 5708, 150, 207.84, 33.681641, -117.865051],
            ["L65", 5100, 0, 344, 33.754124, -117.216049]
        ],
        "47": [
            ["KDEW", 6096, 75, 359.81, 47.96019, -117.431129],
            ["KGEG", 8987, 150, 225.46, 47.631218, -117.51825],
            ["KGEG", 8183, 150, 270.5, 47.616768, -117.520004],
            ["KSKA", 13879, 200, 246.7, 47.622581, -117.629845]
        ],
        "35": [
            ["KIYK", 6143, 75, 210.8, 35.662731, -117.822762],
            ["KIYK", 7109, 75, 345.9, 35.648144, -117.828461],
            ["KNID", 10048, 200, 223.05, 35.695675, -117.685333],
            ["KNID", 7706, 200, 271.13, 35.682945, -117.678185],
            ["KNID", 9028, 200, 334.19, 35.676445, -117.679909],
            ["L72", 5960, 0, 365, 35.804302, -117.328156]
        ],
        "46": [
            ["KLWS", 6500, 150, 278.81, 46.371029, -117.00206],
            ["KPUW", 6719, 100, 250.09, 46.746952, -117.097107]
        ],
        "32": [
            ["KNKX", 7993, 200, 255.36, 32.870995, -117.126419],
            ["KNKX", 11990, 200, 255.37, 32.872856, -117.126976],
            ["KNZY", 7500, 300, 302.05, 32.691399, -117.200554],
            ["KNZY", 8015, 200, 15.43, 32.688824, -117.218613],
            ["KSAN", 9394, 200, 286.05, 32.730099, -117.175407]
        ],
        "40": [
            ["KWMC", 7002, 100, 339.63, 40.887993, -117.805099]
        ]
    },
    "-81": {
        "29": [
            ["28J", 5996, 0, 267.31, 29.658575, -81.68116],
            ["KDAB", 10498, 150, 245.14, 29.184679, -81.047829],
            ["KDAB", 6013, 150, 337.24, 29.175665, -81.049026],
            ["KDED", 5999, 100, 297.08, 29.064911, -81.275871],
            ["KSGJ", 7997, 150, 306.39, 29.954351, -81.330269],
            ["X47", 5002, 0, 234.42, 29.468716, -81.199402]
        ],
        "26": [
            ["2IS", 5950, 0, 307, 26.737095, -81.042488],
            ["KFMY", 6412, 150, 227.75, 26.591833, -81.856544],
            ["KIMM", 5015, 150, -1.97, 26.423498, -81.404686],
            ["KPGD", 6594, 0, 209.09, 26.927456, -81.981377],
            ["KPGD", 5138, 150, 329.27, 26.910221, -81.990234],
            ["KRSW", 12007, 150, 234.01, 26.545835, -81.740257]
        ],
        "30": [
            ["55J", 5311, 0, 215.45, 30.616596, -81.456757],
            ["55J", 5153, 0, 305.67, 30.606253, -81.45507],
            ["FD48", 6425, 60, 357, 30.233107, -81.449272],
            ["KJAX", 9995, 150, 250.49, 30.505369, -81.669998],
            ["KJAX", 7704, 150, 310.63, 30.478399, -81.682236],
            ["KNEN", 8000, 0, 286, 30.346972, -81.854446],
            ["KNIP", 7993, 0, 269.67, 30.231739, -81.664429],
            ["KNIP", 5985, 200, 314.77, 30.229801, -81.663963],
            ["KNRB", 7989, 200, 223.2, 30.399206, -81.415817],
            ["KVQQ", 7996, 200, 269.55, 30.215816, -81.86631],
            ["KVQQ", 7995, 200, 269.55, 30.217743, -81.866325],
            ["KVQQ", 8022, 200, -0.45, 30.212999, -81.876122],
            ["KVQQ", 12534, 200, -0.44, 30.20064, -81.873802]
        ],
        "28": [
            ["57FA", 5100, 60, 347, 28.20027, -81.115913],
            ["KGIF", 5011, 100, 224.9, 28.068256, -81.746887],
            ["KISM", 5001, 150, 237.97, 28.294111, -81.430847],
            ["KISM", 6009, 100, 328.18, 28.282185, -81.431801],
            ["KLEE", 5003, 100, 309.91, 28.820019, -81.804092],
            ["KMCO", 12037, 200, 179.46, 28.448292, -81.326973],
            ["KMCO", 10027, 150, -0.53, 28.408108, -81.295593],
            ["KMCO", 9025, 150, -0.52, 28.41894, -81.282326],
            ["KMCO", 12037, 200, -0.54, 28.415276, -81.326622],
            ["KMCO", 12037, 200, -0.54, 28.415312, -81.321953],
            ["KORL", 6002, 150, 246.62, 28.549358, -81.32209],
            ["KSFB", 9593, 150, 269.89, 28.781776, -81.225853],
            ["KSFB", 6019, 150, -0.12, 28.766775, -81.234749]
        ],
        "32": [
            ["88J", 5008, 0, 342.19, 32.988571, -81.267731],
            ["KJYL", 5002, 100, 227.39, 32.649254, -81.588654],
            ["KSAV", 9341, 0, 270.62, 32.128471, -81.18856],
            ["KSAV", 7017, 0, -0.37, 32.116562, -81.199989],
            ["KSVN", 11375, 200, 272.18, 32.009415, -81.127617],
            ["KTBR", 6004, 100, 315.13, 32.473927, -81.729721]
        ],
        "34": [
            ["9A6", 5008, 0, 348.08, 34.78352, -81.196945],
            ["KFDW", 5006, 100, 218.16, 34.320858, -81.103668],
            ["KSPA", 5204, 100, 221.51, 34.92107, -81.950729],
            ["KUZA", 5510, 100, 191.19, 34.995232, -81.055382]
        ],
        "27": [
            ["AGR", 8000, 0, 221, 27.653862, -81.336807],
            ["KAVO", 5367, 100, 225.06, 27.594696, -81.523537],
            ["KBOW", 5005, 100, 225.98, 27.94768, -81.778236],
            ["KSEF", 5185, 300, 314.92, 27.452295, -81.33596],
            ["KSEF", 5204, 150, -0.2, 27.448309, -81.343025]
        ],
        "43": [
            ["CYCE", 5004, 100, 271.99, 43.283054, -81.497345],
            ["CYGD", 5121, 0, 307.76, 43.764061, -81.701508],
            ["CYXU", 6273, 200, 258.83, 43.041668, -81.140808],
            ["CYXU", 8796, 200, 318.65, 43.023994, -81.138039]
        ],
        "42": [
            ["CYQS", 5046, 100, 263.44, 42.77359, -81.100517]
        ],
        "48": [
            ["CYTS", 5985, 150, 200.3, 48.578327, -81.369995]
        ],
        "33": [
            ["KAGS", 5996, 75, 258.18, 33.369404, -81.949974],
            ["KAGS", 8016, 150, 348.25, 33.360859, -81.965485],
            ["KAIK", 5497, 0, 240.26, 33.653549, -81.680061],
            ["KBNL", 5257, 0, 225.31, 33.262718, -81.386093],
            ["KBNL", 5126, 0, 340.47, 33.251293, -81.381554],
            ["KCAE", 8003, 150, 224.57, 33.944042, -81.10556],
            ["KCAE", 8592, 150, 284.71, 33.93816, -81.110298]
        ],
        "41": [
            ["KAKR", 6331, 150, 241.91, 41.041443, -81.457672],
            ["KBKL", 5194, 100, 237.86, 41.520271, -81.675568],
            ["KBKL", 6194, 150, 237.86, 41.522896, -81.673454],
            ["KCGF", 5098, 100, 229.41, 41.569672, -81.479256],
            ["KCLE", 8993, 150, 229.9, 41.417027, -81.839317],
            ["KCLE", 8995, 150, 229.89, 41.41576, -81.848351],
            ["KCLE", 7091, 150, 229.89, 41.417107, -81.84169],
            ["KCLE", 6008, 150, 273.32, 41.416107, -81.833527],
            ["KLNN", 5025, 100, 224.53, 41.690281, -81.38446]
        ],
        "40": [
            ["KBJJ", 5184, 100, 270, 40.874798, -81.878876],
            ["KCAK", 7005, 150, 182.46, 40.926353, -81.440254],
            ["KCAK", 7594, 150, 227.4, 40.921593, -81.433464]
        ],
        "37": [
            ["KBKW", 6757, 150, 187.47, 37.800442, -81.122726]
        ],
        "31": [
            ["KBQK", 7998, 150, 245.28, 31.26339, -81.454834],
            ["KJES", 5495, 0, 279.51, 31.552713, -81.873795],
            ["KLHW", 5011, 100, 230.48, 31.893002, -81.558746],
            ["KLHW", 5004, 150, 320.65, 31.883745, -81.553406],
            ["KSSI", 5805, 100, 216.11, 31.158125, -81.388374]
        ],
        "38": [
            ["KCRW", 6300, 150, 227.06, 38.381344, -81.585571]
        ],
        "35": [
            ["KEHO", 5005, 100, 223.84, 35.260105, -81.59565],
            ["KFQD", 5007, 100, 183.59, 35.435085, -81.934547],
            ["KHKY", 6397, 150, 235.29, 35.74498, -81.379539],
            ["KIPJ", 5500, 100, 227.07, 35.488457, -81.154472],
            ["KMRN", 5507, 75, 203.55, 35.827152, -81.607689]
        ],
        "36": [
            ["KMKJ", 5245, 75, 253.18, 36.896931, -81.341331],
            ["KUKF", 6209, 100, 178.66, 36.232109, -81.098854]
        ],
        "25": [
            ["KMKY", 5015, 100, 347.75, 25.988316, -81.670906]
        ],
        "24": [
            ["KMTH", 5008, 100, 247.21, 24.72884, -81.044395],
            ["KNQX", 7016, 150, 211.37, 24.582123, -81.68486],
            ["KNQX", 9997, 200, 252.93, 24.580515, -81.671249],
            ["KNQX", 7008, 150, 310.97, 24.566355, -81.67627]
        ],
        "39": [
            ["KPKB", 6784, 150, 201.96, 39.355091, -81.434418],
            ["KZZV", 5001, 150, 213.77, 39.950451, -81.88591]
        ],
        "21": [
            ["MUCL", 9848, 148, 296.11, 21.610308, -81.532547]
        ],
        "23": [
            ["MUVR", 11497, 148, 235.52, 23.043356, -81.421143]
        ],
        "19": [
            ["MWCR", 7421, 148, 255.87, 19.295387, -81.346764]
        ],
        "12": [
            ["SKSP", 7806, 148, 239.57, 12.589054, -81.701546]
        ],
        "-4": [
            ["SPTP", 8570, 0, 1.009, -4.561544, -81.224281],
            ["SPYL", 8108, 148, 350.67, -4.582209, -81.251106]
        ]
    },
    "-112": {
        "32": [
            ["29AZ", 5500, 60, 223, 32.91111, -112.894043],
            ["E63", 5200, 0, 233, 32.962383, -112.671432],
            ["KGBN", 8500, 150, 364, 32.875912, -112.720856]
        ],
        "46": [
            ["3U3", 6008, 0, 359.97, 46.147446, -112.871124]
        ],
        "47": [
            ["3U7", 6000, 0, 317, 47.475304, -112.861465]
        ],
        "44": [
            ["4U9", 7000, 0, 336, 44.726974, -112.714516]
        ],
        "54": [
            ["CYLB", 5693, 100, 309.39, 54.765366, -112.021309]
        ],
        "49": [
            ["CYQL", 6487, 200, 250.11, 49.629898, -112.789536],
            ["CYQL", 5496, 150, 320.18, 49.625034, -112.784027]
        ],
        "33": [
            ["E25", 5050, 0, 243, 33.972054, -112.791077],
            ["KBXK", 5510, 75, 362.03, 33.414982, -112.686501],
            ["KDVT", 8185, 100, 265.98, 33.688396, -112.069389],
            ["KGEU", 7158, 100, 206.15, 33.536278, -112.290215],
            ["KGYR", 8503, 150, 223.95, 33.430824, -112.369453],
            ["KLUF", 9908, 150, 222.47, 33.546848, -112.367874],
            ["KLUF", 10005, 150, 222.46, 33.543198, -112.376335],
            ["KPHX", 7791, 150, 270.04, 33.428837, -112.001518]
        ],
        "37": [
            ["KBCE", 7386, 75, 226.72, 37.713318, -112.136292],
            ["KKNB", 6195, 75, 200.88, 37.018463, -112.527679],
            ["U55", 5700, 0, 204, 37.852367, -112.38784]
        ],
        "41": [
            ["KBMC", 7504, 100, 359.5, 41.542095, -112.062096],
            ["KOGD", 8098, 150, 224.77, 41.203701, -112.000168],
            ["KOGD", 5590, 150, 269.76, 41.197918, -112.001869],
            ["KOGD", 5197, 150, 359.81, 41.186623, -112.014908]
        ],
        "45": [
            ["KBTM", 5094, 75, 309.17, 45.950165, -112.490166],
            ["KBTM", 8995, 150, 346.88, 45.942898, -112.493149],
            ["KDLN", 6498, 0, 358.6, 45.24831, -112.551872]
        ],
        "48": [
            ["KCTB", 5289, 75, 243.88, 48.612865, -112.365532],
            ["KCTB", 5294, 75, 332.2, 48.600605, -112.371788]
        ],
        "40": [
            ["KDPG", 13126, 150, 315.03, 40.186684, -112.921082],
            ["KTVY", 6102, 100, 359.11, 40.604179, -112.350609]
        ],
        "39": [
            ["KDTA", 5933, 85, 315.4, 39.374554, -112.501877],
            ["KDTA", 5504, 0, 360.27, 39.376049, -112.502251]
        ],
        "35": [
            ["KGCN", 8999, 150, 220.58, 35.961727, -112.137047],
            ["P32", 5992, 0, 373, 35.29422, -112.196327]
        ],
        "43": [
            ["KIDA", 8995, 150, 217.97, 43.521961, -112.064301]
        ],
        "42": [
            ["KPIH", 9052, 150, 224.92, 42.919281, -112.576859],
            ["KPIH", 7147, 100, 359.95, 42.89909, -112.604881]
        ],
        "34": [
            ["KPRC", 7552, 150, 221.2, 34.661411, -112.412109]
        ],
        "38": [
            ["KRIF", 6603, 75, 204.94, 38.744652, -112.094055],
            ["U19", 5050, 0, 234, 38.962364, -112.356071],
            ["U52", 5103, 0, 328.36, 38.225685, -112.670097]
        ],
        "27": [
            ["MM26", 5053, 0, 363.405, 27.290255, -112.939064]
        ],
        "29": [
            ["MM32", 6598, 148, 205, 29.937809, -112.651718]
        ]
    },
    "-102": {
        "36": [
            ["2E1", 6500, 0, 360, 36.082779, -102.415741],
            ["KDHT", 5668, 75, 224.76, 36.028378, -102.541527],
            ["KDHT", 6410, 75, 359.85, 36.013542, -102.546356]
        ],
        "34": [
            ["2T1", 5094, 0, 257.52, 34.186646, -102.632843],
            ["KHRX", 5389, 0, 215.79, 34.863754, -102.321152],
            ["T55", 5500, 0, 199, 34.573864, -102.31971]
        ],
        "40": [
            ["2V5", 5405, 0, 359.83, 40.092983, -102.241142]
        ],
        "32": [
            ["7TX5", 6080, 50, 359, 32.208714, -102.159691],
            ["E11", 5826, 0, 344.52, 32.324711, -102.528885],
            ["E57", 5780, 0, 229, 32.985302, -102.831078],
            ["KGNC", 5369, 75, 269.72, 32.678589, -102.647827],
            ["KGNC", 5007, 75, 359.37, 32.664993, -102.648361],
            ["KMDD", 5017, 75, 254.92, 32.040916, -102.093224]
        ],
        "30": [
            ["8TE6", 5800, 75, 219, 30.306355, -102.711296],
            ["KFST", 7507, 100, 306.61, 30.907833, -102.907524]
        ],
        "33": [
            ["8XS8", 10500, 150, 358, 33.582642, -102.039589],
            ["KBFE", 5223, 75, 205.91, 33.178661, -102.189484],
            ["KLLN", 6121, 75, 361.55, 33.541409, -102.373009]
        ],
        "42": [
            ["KAIA", 6190, 75, 269.33, 42.058865, -102.797279],
            ["KAIA", 9195, 150, 314.37, 42.042362, -102.794334],
            ["KAIA", 6313, 75, 359.32, 42.042088, -102.79483],
            ["KGRN", 5191, 75, 228.67, 42.811401, -102.166611]
        ],
        "46": [
            ["KDIK", 6394, 100, 330.42, 46.789665, -102.795128]
        ],
        "35": [
            ["KDUX", 5478, 75, 203.09, 35.863953, -102.009689]
        ],
        "43": [
            ["KIEN", 5194, 60, 308.7, 43.01696, -102.49926]
        ],
        "39": [
            ["KITR", 5205, 75, 339.95, 39.235794, -102.282219]
        ],
        "38": [
            ["KLAA", 6310, 100, 369.59, 38.057785, -102.693214]
        ],
        "31": [
            ["KMAF", 8298, 150, 293.65, 31.93854, -102.191887],
            ["KMAF", 9520, 150, 355.05, 31.933382, -102.202866],
            ["KODO", 5710, 75, 209.58, 31.927681, -102.383575],
            ["KODO", 5012, 75, 344.72, 31.914724, -102.386551]
        ],
        "41": [
            ["KSNY", 6595, 0, 315, 41.094917, -102.976807]
        ],
        "20": [
            ["MM1P", 5500, 0, 247.3, 20.166214, -102.61367]
        ],
        "25": [
            ["MM37", 6835, 68, 289.207, 25.488646, -102.194122]
        ],
        "21": [
            ["MMAS", 9875, 148, 362.63, 21.687469, -102.318787]
        ],
        "19": [
            ["MMPN", 7905, 148, 211.71, 19.405663, -102.032852]
        ],
        "22": [
            ["MMZC", 9867, 148, 207.94, 22.907782, -102.679787]
        ]
    },
    "-101": {
        "32": [
            ["2F5", 5009, 0, 345.39, 32.747177, -101.914177],
            ["KBPG", 8821, 100, 361.88, 32.202641, -101.521797],
            ["TX31", 5200, 100, 209, 32.079971, -101.560211]
        ],
        "38": [
            ["5K2", 5100, 60, 359, 38.447186, -101.746132]
        ],
        "53": [
            ["CYQD", 5888, 150, 315.08, 53.965729, -101.081429]
        ],
        "36": [
            ["E42", 5004, 0, 209.34, 36.226982, -101.190331],
            ["KGUY", 5907, 100, 366.09, 36.67701, -101.50885]
        ],
        "39": [
            ["KADT", 5004, 75, 353.1, 39.834614, -101.042183],
            ["KCBK", 5114, 75, 360.39, 39.42123, -101.048416],
            ["KGLD", 5497, 100, 314.43, 39.364162, -101.691162]
        ],
        "35": [
            ["KAMA", 13502, 300, 225.9, 35.230888, -101.700172],
            ["KAMA", 7903, 150, 317.55, 35.213692, -101.678993],
            ["KBGD", 6308, 100, 358.38, 35.692711, -101.393135],
            ["KTDW", 5106, 60, 359.88, 35.164089, -101.826408]
        ],
        "37": [
            ["KHQG", 5003, 75, 210.92, 37.167484, -101.36776],
            ["KULS", 6006, 100, 359.58, 37.59972, -101.373688]
        ],
        "40": [
            ["KIML", 5022, 100, 323.71, 40.503742, -101.61515]
        ],
        "33": [
            ["KLBB", 7993, 150, 269.66, 33.662319, -101.802826],
            ["KLBB", 11520, 150, 359.67, 33.650753, -101.828819]
        ],
        "48": [
            ["KMIB", 13178, 300, 305.15, 48.40535, -101.33577],
            ["KMOT", 6344, 100, 270.26, 48.257969, -101.264664],
            ["KMOT", 7691, 150, 318.44, 48.249466, -101.267738]
        ],
        "41": [
            ["KOGA", 5093, 75, 269.91, 41.117813, -101.762619]
        ],
        "30": [
            ["KOZA", 6015, 75, 347.76, 30.727131, -101.200165]
        ],
        "34": [
            ["KPVW", 5996, 100, 230.64, 34.172829, -101.710564]
        ],
        "20": [
            ["MM70", 5800, 0, 217.5, 20.681246, -101.305801],
            ["MMLO", 11460, 148, 314.28, 20.982327, -101.46891]
        ],
        "19": [
            ["MMMM", 11125, 148, 234.51, 19.858719, -101.012169],
            ["MXA9", 5249, 0, 278, 19.829872, -101.745575]
        ],
        "26": [
            ["MMMV", 7671, 148, 252.6, 26.957182, -101.45932]
        ],
        "17": [
            ["MMZH", 8199, 197, 267.99, 17.602016, -101.448761]
        ],
        "29": [
            ["TX07", 6000, 75, 348, 29.92622, -101.232277]
        ]
    },
    "-121": {
        "38": [
            ["2Q3", 6006, 0, 360.3, 38.570759, -121.85672],
            ["KLHM", 6007, 100, 345.34, 38.901188, -121.348656],
            ["KMCC", 10611, 200, 360.07, 38.653084, -121.40062],
            ["KMHR", 11295, 150, 233.64, 38.563084, -121.281639],
            ["KMHR", 6037, 150, 234.22, 38.562653, -121.288033],
            ["KSAC", 5505, 150, 213.05, 38.517853, -121.490211],
            ["KSMF", 8609, 151, 180.74, 38.70734, -121.601082],
            ["KSMF", 8609, 150, 360.74, 38.683727, -121.601479],
            ["KSMF", 8609, 150, 360.75, 38.68351, -121.580452],
            ["KSUU", 10990, 150, 227.61, 38.28178, -121.898155],
            ["KSUU", 10999, 150, 227.59, 38.26363, -121.928619]
        ],
        "36": [
            ["3O7", 6353, 0, 321.95, 36.887608, -121.404533],
            ["KMRY", 7611, 150, 292.82, 36.583126, -121.832924],
            ["KSNS", 5997, 150, 276.85, 36.660942, -121.59819]
        ],
        "61": [
            ["CYFS", 5987, 150, 335.9, 61.752647, -121.229439]
        ],
        "56": [
            ["CYNH", 5200, 100, 255, 56.037399, -121.963501]
        ],
        "39": [
            ["KBAB", 12009, 300, 341.4, 39.120476, -121.429794],
            ["KCIC", 6725, 150, 327.49, 39.787819, -121.851227],
            ["KMYV", 6010, 150, 336.82, 39.089745, -121.566231],
            ["KOVE", 6021, 100, 212.92, 39.492706, -121.620193]
        ],
        "45": [
            ["KDLS", 5094, 100, 324.62, 45.612129, -121.161873]
        ],
        "42": [
            ["KLMT", 5547, 100, 270.42, 42.156208, -121.722443],
            ["KLMT", 10302, 150, 338.27, 42.142948, -121.726303]
        ],
        "37": [
            ["KLVK", 5245, 100, 270.58, 37.69379, -121.811241],
            ["KSCK", 10647, 150, 307.66, 37.884499, -121.221619],
            ["KSJC", 11002, 150, 318.89, 37.351437, -121.917534],
            ["KSJC", 11003, 150, 318.89, 37.352692, -121.915718],
            ["NRC", 6975, 200, 316, 37.399555, -121.104477],
            ["NRC", 7950, 200, 366, 37.397129, -121.110794]
        ],
        "44": [
            ["KRDM", 7030, 150, 240.31, 44.25906, -121.138412],
            ["KRDM", 6989, 100, 301.94, 44.248772, -121.138458],
            ["S07", 5004, 0, 360.03, 44.087978, -121.200645],
            ["S33", 5100, 0, 360.47, 44.660007, -121.153496]
        ],
        "40": [
            ["O05", 5003, 0, 351.64, 40.278008, -121.240036]
        ],
        "43": [
            ["S21", 5453, 0, 375.88, 43.868885, -121.455978]
        ]
    },
    "-77": {
        "38": [
            ["2VG2", 5100, 0, 306, 38.967663, -77.862442],
            ["KCJR", 5003, 100, 208.19, 38.531517, -77.855484],
            ["KDAA", 5617, 75, 313.55, 38.70985, -77.174065],
            ["KDCA", 6875, 150, 175.52, 38.861179, -77.038727],
            ["KDCA", 5190, 150, 322.72, 38.850346, -77.03273],
            ["KHEF", 5703, 100, 330.68, 38.71405, -77.508965],
            ["KIAD", 11511, 150, 180.66, 38.955326, -77.435982],
            ["KIAD", 11512, 150, 180.64, 38.970638, -77.45932],
            ["KIAD", 10490, 150, 290.68, 38.933605, -77.455864]
        ],
        "44": [
            ["CPZ3", 5007, 0, 228, 44.074032, -77.330956],
            ["CYTR", 9941, 200, 230.38, 44.127579, -77.51371]
        ],
        "53": [
            ["CYGL", 6474, 150, 293.01, 53.621899, -77.690338]
        ],
        "48": [
            ["CYVO", 9995, 150, -10.88, 48.039822, -77.778793]
        ],
        "39": [
            ["KDMW", 5102, 100, 328.08, 39.602329, -77.002861],
            ["KFDK", 5219, 100, 220.42, 39.420498, -77.368431],
            ["KHGR", 5453, 150, 260.48, 39.709171, -77.721184],
            ["KJYO", 5503, 100, 341.33, 39.070816, -77.554382],
            ["KMRB", 6992, 150, 250.6, 39.405453, -77.971611],
            ["KMRB", 5004, 150, 340.66, 39.394974, -77.983376]
        ],
        "35": [
            ["KDPL", 6006, 75, 216.27, 35.006699, -77.975746],
            ["KEWN", 6009, 150, 210.64, 35.079617, -77.038025],
            ["KGSB", 11749, 300, 253.06, 35.344067, -77.941689],
            ["KGWW", 5502, 100, 218.67, 35.466442, -77.959145],
            ["KISO", 11505, 150, 221.02, 35.343357, -77.596107],
            ["KMCZ", 5006, 75, 203.67, 35.868477, -77.174805],
            ["KOCW", 5002, 100, 216.71, 35.577705, -77.046341],
            ["KOCW", 5005, 150, 335.26, 35.565361, -77.044601],
            ["KPGV", 6509, 150, 187.55, 35.643539, -77.382927],
            ["KRWI", 7105, 150, 213.23, 35.864403, -77.885338]
        ],
        "42": [
            ["KELZ", 5293, 100, 269.29, 42.109608, -77.980141],
            ["KPEO", 5501, 100, 176.89, 42.640923, -77.052696]
        ],
        "36": [
            ["KEMV", 5009, 100, 325.47, 36.681198, -77.477905]
        ],
        "37": [
            ["KFCI", 5502, 100, 321.18, 37.400547, -77.518875],
            ["KOFP", 5403, 100, 329.77, 37.702534, -77.431923],
            ["KRIC", 6614, 150, 193.43, 37.516518, -77.324348],
            ["KRIC", 5322, 100, 237.41, 37.504215, -77.310349],
            ["KRIC", 9007, 150, 327.53, 37.495789, -77.30687]
        ],
        "34": [
            ["KILM", 8018, 200, 228.28, 34.276516, -77.890457],
            ["KILM", 7013, 150, 339.28, 34.263206, -77.900909],
            ["KNCA", 5116, 150, 224.87, 34.714546, -77.436424],
            ["KOAJ", 7103, 150, 224.33, 34.836121, -77.603844]
        ],
        "43": [
            ["KROC", 8000, 150, 211.6, 43.125561, -77.671974],
            ["KROC", 5490, 150, 267.66, 43.123428, -77.655899]
        ],
        "40": [
            ["KUNV", 6696, 150, 232.7, 40.855572, -77.837929]
        ],
        "18": [
            ["MKJS", 8738, 150, 245.41, 18.508638, -77.901939]
        ],
        "21": [
            ["MUCM", 9843, 148, 248.44, 21.425316, -77.833916],
            ["MUSL", 5907, 98, 251.48, 21.512022, -77.012115]
        ],
        "20": [
            ["MUMZ", 7874, 148, 254.11, 20.291121, -77.078232]
        ],
        "24": [
            ["MYAK", 5300, 100, 276, 24.157907, -77.581917]
        ],
        "26": [
            ["MYAT", 7008, 150, 313.28, 26.738745, -77.38343]
        ],
        "25": [
            ["MYNN", 8318, 150, 269.63, 25.036097, -77.456848],
            ["MYNN", 11031, 150, 314.78, 25.030512, -77.451958]
        ],
        "0": [
            ["SETU", 8073, 98, 234.76, 0.815833, -77.69915],
            ["SKIP", 5815, 92, 241.12, 0.865748, -77.664864]
        ],
        "1": [
            ["SKPS", 7251, 0, 194.88, 1.406176, -77.288429]
        ],
        "-6": [
            ["SP0A", 5915, 0, 289.006, -6.386737, -77.53727],
            ["SPJA", 6168, 98, 343, -6.075854, -77.157234],
            ["SPLN", 5906, 98, 283, -6.285143, -77.425392],
            ["SPPY", 6496, 98, 311.6, -6.207846, -77.849411]
        ],
        "-4": [
            ["SPAC", 5269, 0, 202.99, -4.60037, -77.937836],
            ["SPGB", 6550, 98, 351.107, -4.028976, -77.759193]
        ],
        "-9": [
            ["SPHZ", 10050, 98, 344.07, -9.343316, -77.596657]
        ],
        "-12": [
            ["SPIM", 11549, 148, 334.22, -12.036141, -77.107277]
        ]
    },
    "-76": {
        "37": [
            ["31VA", 5921, 60, 190, 37.028191, -76.58712],
            ["KLFI", 9992, 150, 247.55, 37.088104, -76.344666],
            ["KPHF", 6533, 150, 192.76, 37.141903, -76.494446],
            ["KPHF", 7999, 150, 237.74, 37.136707, -76.478142]
        ],
        "44": [
            ["CYGK", 5448, 100, 175.14, 44.232773, -76.603333]
        ],
        "38": [
            ["KADW", 9766, 150, 179.87, 38.82452, -76.863655],
            ["KADW", 9310, 200, 179.86, 38.823254, -76.870667],
            ["KESN", 5512, 100, 210.45, 38.810425, -76.062149],
            ["KNHK", 5013, 75, 188.05, 38.290169, -76.418564],
            ["KNHK", 11806, 200, 229.15, 38.298096, -76.390472],
            ["KNHK", 9738, 200, 306.04, 38.278568, -76.395828]
        ],
        "39": [
            ["KAPG", 8003, 200, 208.39, 39.475121, -76.16153],
            ["KAPG", 5009, 149, 341.48, 39.457058, -76.169594],
            ["KBWI", 6002, 150, 213.13, 39.180656, -76.659767],
            ["KBWI", 10489, 200, 274.21, 39.172626, -76.652626],
            ["KBWI", 9503, 150, 324.27, 39.164196, -76.662361],
            ["KMTN", 6995, 180, 315.25, 39.318844, -76.405045],
            ["KTHV", 5189, 100, 335.42, 39.910496, -76.869156]
        ],
        "36": [
            ["KCPK", 5502, 100, 216.83, 36.671654, -76.315025],
            ["KECG", 7210, 150, 272.42, 36.260513, -76.159729],
            ["KEDE", 6008, 100, 179.91, 36.036827, -76.569786],
            ["KNFE", 8013, 175, 226.96, 36.702492, -76.125816],
            ["KNGU", 8361, 200, 269.98, 36.937458, -76.275124],
            ["KNTU", 11999, 200, 222.05, 36.82988, -76.022423],
            ["KNTU", 8000, 150, 222.05, 36.831181, -76.024208],
            ["KNTU", 7998, 200, 313.87, 36.817959, -76.018898],
            ["KNTU", 8059, 150, 313.48, 36.81934, -76.017242],
            ["KORF", 9004, 150, 217.72, 36.905518, -76.189301],
            ["KSFQ", 5010, 100, 209.93, 36.686596, -76.59494]
        ],
        "42": [
            ["KELM", 6995, 150, 230.34, 42.166904, -76.881737],
            ["KELM", 5397, 150, 269.29, 42.157974, -76.883049],
            ["KITH", 6597, 150, 312.57, 42.48489, -76.449409],
            ["KSSN", 6996, 0, 332.9, 42.707748, -76.877327]
        ],
        "43": [
            ["KFZY", 5193, 100, 316.94, 43.345989, -76.381348],
            ["KSYR", 8988, 150, 267.42, 43.109299, -76.092445],
            ["KSYR", 7494, 150, 313.89, 43.106976, -76.09256]
        ],
        "41": [
            ["KIPT", 6465, 150, 256.88, 41.24268, -76.911461]
        ],
        "40": [
            ["KLNS", 5392, 150, 247.93, 40.125477, -76.286133],
            ["KMDT", 9994, 200, 296.83, 40.186996, -76.746605]
        ],
        "34": [
            ["KNKT", 8192, 196, 225.41, 34.90379, -76.878227],
            ["KNKT", 8492, 200, 225.47, 34.91835, -76.862602],
            ["KNKT", 8403, 200, 315.38, 34.886646, -76.862823],
            ["KNKT", 8983, 200, 315.58, 34.902065, -76.878975]
        ],
        "17": [
            ["MKJP", 8910, 150, 292.1, 17.931074, -76.775635]
        ],
        "20": [
            ["MUBY", 6887, 148, 248.24, 20.399954, -76.612122],
            ["MUHG", 10641, 148, 226.17, 20.795668, -76.303833],
            ["MUVT", 5985, 148, 224.51, 20.993511, -76.929611]
        ],
        "25": [
            ["MYEH", 5999, 100, 247.94, 25.478729, -76.672966],
            ["MYEM", 8046, 150, 324.84, 25.275545, -76.323883]
        ],
        "24": [
            ["MYER", 7178, 150, 270, 24.891661, -76.166649]
        ],
        "35": [
            ["NC12", 5815, 75, 252, 35.387405, -76.778267]
        ],
        "0": [
            ["SECO", 6660, 90, 333.79, -0.468878, -76.983879],
            ["SENL", 7523, 0, 232.71, 0.098611, -76.861099],
            ["SETR", 5148, 49, 302.08, -0.12665, -76.331657],
            ["SKAS", 5274, 131, 188.55, 0.512136, -76.499794]
        ],
        "3": [
            ["SKCL", 9890, 148, 189.84, 3.556513, -76.379372],
            ["SKGB", 6233, 98, 241.7, 3.463038, -76.489105]
        ],
        "7": [
            ["SKLC", 7178, 98, 329.97, 7.803226, -76.711464]
        ],
        "2": [
            ["SKPP", 6236, 98, 250.47, 2.457099, -76.601791]
        ],
        "4": [
            ["SKUL", 5906, 100, 188.8, 4.105501, -76.224869]
        ],
        "-2": [
            ["SPAS", 6749, 131, 302, -2.801004, -76.458755]
        ],
        "-12": [
            ["SPLP", 8049, 0, 192, -12.150853, -76.995987]
        ],
        "-5": [
            ["SPMS", 5906, 98, 268.99, -5.893457, -76.109909]
        ],
        "-13": [
            ["SPSO", 9937, 148, 219.42, -13.734261, -76.211502]
        ],
        "-6": [
            ["SPST", 8570, 148, 349.86, -6.520302, -76.371162]
        ]
    },
    "-109": {
        "40": [
            ["33U", 6600, 0, 304, 40.912666, -109.38076],
            ["40U", 5300, 0, 264, 40.986824, -109.668907],
            ["KVEL", 6205, 150, 359.02, 40.429836, -109.5103]
        ],
        "45": [
            ["6S0", 5285, 0, 255, 45.808731, -109.968529]
        ],
        "34": [
            ["D68", 8420, 0, 223.72, 34.138672, -109.301491],
            ["KSJN", 5325, 75, 328.42, 34.513718, -109.373436],
            ["KSOW", 7192, 100, 255.93, 34.268566, -109.99575]
        ],
        "33": [
            ["E24", 6288, 0, 202, 33.819183, -109.980171]
        ],
        "36": [
            ["E91", 6149, 0, 372, 36.102631, -109.577591]
        ],
        "37": [
            ["KBDG", 6005, 75, 360.04, 37.574814, -109.483299]
        ],
        "38": [
            ["KCNY", 7101, 75, 219.82, 38.762428, -109.746849],
            ["UT53", 5140, 60, 313, 38.482952, -109.442146]
        ],
        "44": [
            ["KCOD", 8258, 100, 232.27, 44.527153, -109.011192]
        ],
        "31": [
            ["KDGL", 5760, 75, 221, 31.348557, -109.497284],
            ["KDUG", 7328, 100, 359.8, 31.454185, -109.604408],
            ["P03", 5303, 0, 242, 31.374525, -109.682198],
            ["P04", 5929, 0, 361, 31.355854, -109.883293]
        ],
        "48": [
            ["KHVR", 5195, 0, 270.04, 48.544037, -109.751266]
        ],
        "47": [
            ["KLWT", 5592, 100, 217.91, 47.052471, -109.467125],
            ["KLWT", 6087, 100, 270.02, 47.052998, -109.445068]
        ],
        "42": [
            ["KPNA", 7090, 100, 302.9, 42.790695, -109.797211]
        ],
        "41": [
            ["KRKS", 5218, 75, 225.15, 41.598648, -109.059868],
            ["KRKS", 9983, 150, 283.24, 41.5914, -109.046608]
        ],
        "35": [
            ["KRQE", 7002, 75, 213.99, 35.660019, -109.060768]
        ],
        "32": [
            ["KSAD", 6019, 100, 315.43, 32.847675, -109.628853],
            ["P33", 6098, 0, 225.1, 32.251305, -109.887627]
        ],
        "30": [
            ["MM80", 8170, 95, 343.208, 30.470205, -109.640228]
        ],
        "27": [
            ["MMCN", 7578, 148, 317.16, 27.385132, -109.825134]
        ],
        "25": [
            ["MMLM", 6579, 148, 279.9, 25.683968, -109.071289]
        ],
        "23": [
            ["MMSD", 9838, 148, 354.03, 23.138647, -109.719215]
        ],
        "-27": [
            ["SCIP", 10841, 148, 297.09, -27.171551, -109.406921]
        ],
        "43": [
            ["U25", 6100, 0, 294, 43.544945, -109.679718]
        ]
    },
    "-72": {
        "40": [
            ["3C8", 10001, 0, 311, 40.905796, -72.766693],
            ["KFOK", 5003, 150, 177.49, 40.848621, -72.637764],
            ["KFOK", 8996, 150, 222.45, 40.854439, -72.617012]
        ],
        "46": [
            ["CYRQ", 5998, 150, 211.37, 46.359764, -72.673241]
        ],
        "45": [
            ["CZBM", 5001, 100, 217.36, 45.296379, -72.736061]
        ],
        "42": [
            ["KBAF", 9004, 150, 190.19, 42.169605, -72.712929],
            ["KCEF", 11595, 301, 214.14, 42.203926, -72.523804],
            ["KCEF", 7078, 150, 315.07, 42.192692, -72.523567],
            ["KEEN", 6203, 100, 183.23, 42.904305, -72.269562],
            ["KORE", 5001, 75, 180.58, 42.574757, -72.290115]
        ],
        "41": [
            ["KBDL", 5146, 100, 179.03, 41.945435, -72.679886],
            ["KBDL", 9505, 200, 224.32, 41.950665, -72.672112],
            ["KBDL", 6844, 150, 314.43, 41.929249, -72.675247],
            ["KHVN", 5604, 150, 182.91, 41.271366, -72.887207]
        ],
        "43": [
            ["KLEB", 5489, 100, 239.25, 43.633533, -72.294189],
            ["KLEB", 5201, 100, -12, 43.615345, -72.303268],
            ["KRUT", 5001, 100, 178.53, 43.538582, -72.949974],
            ["KVSF", 5495, 100, 214.6, 43.351322, -72.509514]
        ],
        "21": [
            ["MBPV", 7618, 148, 273.02, 21.773064, -72.254539]
        ],
        "19": [
            ["MTCH", 5011, 131, 223.32, 19.73527, -72.19693]
        ],
        "18": [
            ["MTPP", 9970, 0, 265.98, 18.580414, -72.277054]
        ],
        "-50": [
            ["SAWC", 8350, 148, 263.94, -50.279015, -72.035393]
        ],
        "-7": [
            ["SBCZ", 7854, 148, 272.96, -7.600545, -72.758598]
        ],
        "-36": [
            ["SCCH", 5740, 98, 226.93, -36.577389, -72.024506]
        ],
        "-45": [
            ["SCCY", 5067, 98, 223.96, -45.587761, -72.095047]
        ],
        "-37": [
            ["SCGE", 5584, 98, 8.03, -37.409512, -72.426964]
        ],
        "-51": [
            ["SCNT", 5774, 98, 296, -51.675129, -72.514359]
        ],
        "-38": [
            ["SCTC", 5573, 147, 249.97, -38.760738, -72.62793]
        ],
        "11": [
            ["SKAO", 5394, 0, 245, 11.386458, -72.226494],
            ["SKRH", 5413, 98, 268.25, 11.5264, -72.918427]
        ],
        "7": [
            ["SKCC", 6520, 148, 196.94, 7.934394, -72.509453],
            ["SKCC", 7633, 0, 328.81, 7.922445, -72.508591],
            ["SVSA", 6070, 131, 346, 7.858589, -72.447968],
            ["SVSO", 9991, 148, 282.06, 7.562338, -72.021492]
        ],
        "5": [
            ["SKSO", 6171, 80, 222, 5.682496, -72.9646],
            ["SKYP", 7388, 98, 224.31, 5.326355, -72.377037]
        ],
        "9": [
            ["SV74", 7086, 66, 246.9, 9.585678, -72.778946]
        ],
        "10": [
            ["SV75", 5760, 70, 183.8, 10.096197, -72.554283]
        ],
        "8": [
            ["SVLF", 6669, 0, -2.33, 8.232816, -72.268906]
        ]
    },
    "-123": {
        "42": [
            ["3S4", 5200, 0, 378, 42.096939, -123.685257]
        ],
        "49": [
            ["CYVR", 11962, 200, 279.94, 49.184658, -123.160408],
            ["CYVR", 9918, 200, 280.02, 49.200439, -123.160126],
            ["CYVR", 7290, 200, 321.87, 49.184177, -123.182022]
        ],
        "48": [
            ["CYYJ", 6973, 200, 286.02, 48.646664, -123.411919],
            ["CYYJ", 5432, 200, 332.91, 48.640789, -123.424126],
            ["KCLM", 6340, 150, 284.59, 48.116745, -123.486893]
        ],
        "46": [
            ["KAST", 5795, 100, 275.52, 46.158314, -123.867058]
        ],
        "44": [
            ["KCVO", 5900, 150, 366.95, 44.487389, -123.293823],
            ["KEUG", 5223, 150, 226.83, 44.126305, -123.210915],
            ["KEUG", 8010, 0, 359.37, 44.113476, -123.218819],
            ["KSLE", 5144, 100, 360.77, 44.902, -123.003578]
        ],
        "45": [
            ["KMMV", 5413, 150, 237.15, 45.199806, -123.130493]
        ],
        "39": [
            ["O48", 5246, 0, 307.92, 39.257607, -123.746407]
        ]
    },
    "-75": {
        "39": [
            ["40N", 5392, 0, 281.66, 39.977463, -75.856018],
            ["KDOV", 9611, 200, 183.21, 39.143517, -75.4627],
            ["KDOV", 12897, 150, 305.89, 39.117439, -75.447205],
            ["KILG", 7008, 150, 185.06, 39.688438, -75.601631],
            ["KILG", 7155, 150, 257.71, 39.682312, -75.595245],
            ["KMIV", 5993, 150, 270.03, 39.367027, -75.061157],
            ["KMIV", 5057, 150, 315.08, 39.363796, -75.066399],
            ["KPHL", 10493, 200, 255.45, 39.868034, -75.23893],
            ["KPHL", 9487, 150, 255.45, 39.875221, -75.22287],
            ["KPHL", 5462, 150, 339.1, 39.872025, -75.228325]
        ],
        "45": [
            ["CYND", 5987, 150, 255.4, 45.527832, -75.550804],
            ["CYOW", 8099, 200, 236.22, 45.325054, -75.645088],
            ["CYOW", 9991, 200, 305.88, 45.310829, -75.6548]
        ],
        "40": [
            ["KABE", 7595, 150, 231.21, 40.66, -75.429291],
            ["KABE", 5791, 150, 303.05, 40.646523, -75.43222],
            ["KNXX", 8001, 200, 321.76, 40.191288, -75.139297],
            ["KPNE", 6997, 150, 228.34, 40.09026, -75.001534],
            ["KRDG", 6344, 150, 301.33, 40.374523, -75.958603],
            ["KRDG", 5154, 150, -7.82, 40.370811, -75.960152]
        ],
        "41": [
            ["KAVP", 7500, 150, 212.65, 41.346012, -75.716759]
        ],
        "42": [
            ["KBGM", 7098, 150, 328.37, 42.202641, -75.973053]
        ],
        "38": [
            ["KGED", 5001, 150, 212.85, 38.69558, -75.355339],
            ["KSBY", 5001, 100, 216.59, 38.344948, -75.5065],
            ["KSBY", 5497, 150, 306.74, 38.336998, -75.501289]
        ],
        "44": [
            ["KGTB", 10000, 150, 195.96, 44.072079, -75.715218],
            ["KOGS", 5191, 150, 255.99, 44.683567, -75.455788]
        ],
        "37": [
            ["KMFV", 5008, 100, 202.94, 37.653198, -75.757668],
            ["KWAL", 8753, 150, 212.12, 37.947392, -75.454773],
            ["KWAL", 7995, 200, 270.36, 37.942791, -75.457298]
        ],
        "43": [
            ["KRME", 11815, 200, 314.12, 43.222519, -75.391068],
            ["KUCA", 5391, 150, 257.01, 43.144424, -75.372704],
            ["KUCA", 5997, 150, 317.11, 43.141205, -75.377388]
        ],
        "19": [
            ["MUCU", 13117, 148, 269.38, 19.970076, -75.81646],
            ["MUGM", 7995, 200, 271.09, 19.906244, -75.195396]
        ],
        "20": [
            ["MUGT", 8050, 148, 345.73, 20.07473, -75.155495],
            ["MUNC", 5906, 0, 236, 20.68786, -75.526154]
        ],
        "24": [
            ["MYCA", 7000, 150, 315, 24.626535, -75.659195]
        ],
        "23": [
            ["MYEF", 7053, 150, 297.58, 23.55798, -75.868248]
        ],
        "4": [
            ["SKAR", 6241, 0, 193.48, 4.461779, -75.763931],
            ["SKGO", 7225, 0, 4.82, 4.748557, -75.956779],
            ["SKIB", 5899, 0, 312.82, 4.415833, -75.126572],
            ["SKPE", 6431, 0, 252.01, 4.815334, -75.731239]
        ],
        "10": [
            ["SKCG", 8567, 148, 182.51, 10.454132, -75.512352]
        ],
        "6": [
            ["SKMD", 5931, 0, 190.74, 6.228342, -75.588921],
            ["SKRG", 11537, 148, -0.41, 6.148702, -75.422997]
        ],
        "8": [
            ["SKMR", 6302, 115, 317.84, 8.817269, -75.820076],
            ["Z09A", 5184, 0, 278.005, 8.689258, -75.152473]
        ],
        "2": [
            ["SKNV", 5819, 0, 194.15, 2.95816, -75.29203]
        ],
        "-3": [
            ["SPDR", 6075, 100, 284.406, -3.808065, -75.031204]
        ],
        "-15": [
            ["SPJN", 6562, 0, 334, -15.35808, -75.145912]
        ]
    },
    "-94": {
        "33": [
            ["4O4", 5010, 0, 203.1, 33.91568, -94.85611],
            ["KOSA", 5010, 75, 352.02, 33.088718, -94.960381]
        ],
        "32": [
            ["4TE0", 5350, 42, 315, 32.924549, -94.736717],
            ["KASL", 5008, 100, 336.77, 32.513275, -94.304543],
            ["KGGG", 10005, 150, 313.88, 32.37352, -94.696716],
            ["KGGG", 6120, 0, 358.8, 32.37722, -94.716286]
        ],
        "29": [
            ["54T", 5031, 0, 269.02, 29.761763, -94.838837],
            ["KBPT", 6750, 150, 301.04, 29.945755, -94.009506],
            ["KBPT", 5082, 150, 346.01, 29.94446, -94.021469],
            ["KGLS", 6007, 150, 320.21, 29.25905, -94.855568],
            ["KGLS", 6016, 150, 360.86, 29.257006, -94.859352]
        ],
        "49": [
            ["CYQK", 5781, 0, 257.46, 49.790043, -94.351112]
        ],
        "58": [
            ["CYYQ", 9172, 160, 332.6, 58.723324, -94.05542]
        ],
        "31": [
            ["F17", 5513, 0, 350.56, 31.824129, -94.154968],
            ["KLFK", 5393, 100, 255.2, 31.238052, -94.74073],
            ["KOCH", 5011, 75, 364.48, 31.570917, -94.710762]
        ],
        "36": [
            ["KASG", 5308, 75, 7.07, 36.169136, -94.120361],
            ["KEOS", 5008, 100, 191.98, 36.81752, -94.389931],
            ["KGMJ", 5257, 75, 359.93, 36.599499, -94.738564],
            ["KMIO", 5027, 100, 360.43, 36.902325, -94.887566],
            ["KROG", 6018, 0, 199.11, 36.380207, -94.103607],
            ["KSLG", 5005, 75, 365.31, 36.18502, -94.490776],
            ["KXNA", 8810, 150, 339.78, 36.270519, -94.301628],
            ["M58", 5006, 0, 361.64, 36.899349, -94.013]
        ],
        "48": [
            ["KBDE", 5489, 100, 300.86, 48.724583, -94.602409]
        ],
        "47": [
            ["KBJI", 5690, 150, 253.98, 47.511276, -94.92276],
            ["KBJI", 6591, 150, 314.04, 47.503414, -94.92382]
        ],
        "46": [
            ["KBRD", 6491, 150, 233.5, 46.405235, -94.125549],
            ["KRYM", 6096, 100, 315.34, 46.085247, -94.352058]
        ],
        "42": [
            ["KCIN", 5502, 100, 316.7, 42.040638, -94.781624],
            ["KFOD", 6539, 150, 244.96, 42.555218, -94.183701]
        ],
        "39": [
            ["KFLV", 5910, 100, 339.45, 39.360672, -94.911003],
            ["KGPH", 5507, 100, 7.1, 39.325008, -94.310852],
            ["KMCI", 9507, 150, 192.92, 39.306873, -94.701469],
            ["KMCI", 10810, 150, 192.9, 39.322235, -94.720764],
            ["KMCI", 9487, 150, 276.14, 39.288071, -94.693192],
            ["KMKC", 7006, 150, 192.67, 39.133701, -94.589844],
            ["KMKC", 5050, 150, 218.38, 39.127098, -94.587486],
            ["KSTJ", 8065, 150, 360.01, 39.762444, -94.906914]
        ],
        "43": [
            ["KFRM", 5500, 100, 314.16, 43.638805, -94.410179]
        ],
        "35": [
            ["KFSM", 5008, 150, 201.11, 35.34507, -94.363251],
            ["KFSM", 7991, 150, 261.17, 35.336967, -94.354897],
            ["KFYV", 6013, 100, 348.98, 35.996971, -94.167679]
        ],
        "38": [
            ["KIXD", 5128, 100, 226.98, 38.837811, -94.881874],
            ["KIXD", 7345, 0, 360.04, 38.819355, -94.891586]
        ],
        "30": [
            ["KJAS", 5513, 70, 360.94, 30.878139, -94.03508]
        ],
        "37": [
            ["KJLN", 6504, 150, 318.05, 37.144535, -94.492332],
            ["KJLN", 6508, 100, 361.96, 37.146317, -94.498108],
            ["KNVD", 5905, 75, 206.44, 37.858974, -94.300613],
            ["KPTS", 5506, 100, 349.87, 37.443562, -94.728905]
        ],
        "34": [
            ["KMEZ", 5993, 100, 272.19, 34.542385, -94.188171],
            ["KMEZ", 5008, 75, 353.45, 34.541809, -94.207092]
        ],
        "45": [
            ["KSTC", 6994, 150, 316.05, 45.540127, -94.050339]
        ],
        "18": [
            ["MMMT", 6916, 148, 197.85, 18.112368, -94.577553]
        ]
    },
    "-124": {
        "42": [
            ["5S6", 5100, 0, 338, 42.851395, -124.51403]
        ],
        "54": [
            ["CAU4", 5018, 100, 264, 54.046829, -124.000839]
        ],
        "52": [
            ["CYPU", 6000, 0, 240, 52.116886, -124.132004]
        ],
        "49": [
            ["CYQQ", 9703, 200, 316.94, 49.701103, -124.873032]
        ],
        "40": [
            ["KACV", 5999, 150, 332.81, 40.970882, -124.10334]
        ],
        "41": [
            ["KCEC", 5004, 150, 373.16, 41.773338, -124.240303]
        ],
        "44": [
            ["KONP", 5398, 150, 357.33, 44.572071, -124.058411]
        ],
        "43": [
            ["KOTH", 5314, 150, 240.63, 43.421867, -124.243156]
        ]
    },
    "-79": {
        "35": [
            ["5W8", 5005, 0, 211.21, 35.710327, -79.499649],
            ["KHBI", 5508, 100, 201.5, 35.661549, -79.891327],
            ["KPOB", 7504, 150, 221.36, 35.1786, -79.006165],
            ["KSOP", 5503, 150, 226.16, 35.242836, -79.382126],
            ["KTTA", 6510, 100, 200.78, 35.590801, -79.097466]
        ],
        "36": [
            ["78N", 5197, 0, 304.66, 36.433151, -79.843719],
            ["KDAN", 6506, 150, 196.27, 36.579891, -79.33532],
            ["KGSO", 10000, 0, 225.92, 36.110134, -79.920296],
            ["KGSO", 6381, 150, 315.23, 36.087055, -79.93721]
        ],
        "44": [
            ["CNB9", 5066, 0, 266.69, 44.486526, -79.545944],
            ["CYQA", 6048, 150, -10.24, 44.967911, -79.304688]
        ],
        "43": [
            ["CYHM", 6005, 150, 228.68, 43.177605, -79.91774],
            ["CYHM", 9993, 200, 287.25, 43.172344, -79.916672],
            ["CYYZ", 11089, 200, 226.32, 43.695148, -79.633614],
            ["CYYZ", 8995, 200, 226.48, 43.675289, -79.597214],
            ["CYYZ", 9728, 200, 226.49, 43.679417, -79.596672],
            ["CYYZ", 9088, 200, 317, 43.667934, -79.629143],
            ["CYYZ", 11134, 200, 316.85, 43.670708, -79.614494],
            ["CYZD", 7040, 200, 321.5, 43.735191, -79.45713]
        ],
        "47": [
            ["CYXR", 6108, 150, 243.41, 47.701389, -79.835533]
        ],
        "46": [
            ["CYYB", 9988, 200, 245.35, 46.368832, -79.406189]
        ],
        "40": [
            ["KAGC", 6491, 150, 269.91, 40.354309, -79.917755],
            ["KLBE", 6998, 100, 225.71, 40.281548, -79.398979]
        ],
        "33": [
            ["KCKI", 5001, 75, 312.29, 33.712608, -79.850876],
            ["KGGE", 5004, 100, 221.3, 33.319912, -79.315422]
        ],
        "41": [
            ["KFKL", 5202, 150, 197.24, 41.383698, -79.857704]
        ],
        "34": [
            ["KFLO", 6010, 150, 181.49, 34.192528, -79.724297],
            ["KFLO", 6492, 150, 263.54, 34.187351, -79.712563],
            ["KLBT", 5512, 150, 225.03, 34.614952, -79.054344],
            ["KMEB", 6489, 150, 225.72, 34.802792, -79.356461],
            ["KUDG", 5001, 100, 223.57, 34.451958, -79.881264]
        ],
        "37": [
            ["KHSP", 5595, 100, 238.75, 37.955437, -79.825569],
            ["KLYH", 5803, 150, 207.75, 37.331963, -79.196571],
            ["KROA", 6798, 150, 229.65, 37.334221, -79.966263],
            ["KROA", 5813, 150, 327.99, 37.315434, -79.970505]
        ],
        "42": [
            ["KJHW", 5293, 100, 238.91, 42.155651, -79.251358]
        ],
        "39": [
            ["KMGW", 5202, 150, -7.59, 39.636524, -79.916328]
        ],
        "9": [
            ["MPEJ", 5578, 151, 3.09, 9.34833, -79.867783],
            ["MPTO", 10042, 148, 209.36, 9.071565, -79.37899],
            ["MPTO", 8832, 200, 210.72, 9.093631, -79.374802]
        ],
        "8": [
            ["MPHO", 8542, 148, 0, 8.901801, -79.5998],
            ["MPMG", 5915, 98, 4.83, 8.965281, -79.556274]
        ],
        "22": [
            ["MUBR", 5912, 148, 267.59, 22.621599, -79.138397],
            ["MUSC", 9895, 148, 256.08, 22.495451, -79.929359]
        ],
        "21": [
            ["MUSS", 5908, 95, 205.9, 21.977934, -79.43866],
            ["MUTD", 5912, 98, 233.24, 21.793171, -79.990402]
        ],
        "19": [
            ["MWCB", 5970, 148, 264.74, 19.687731, -79.87413]
        ],
        "-2": [
            ["SEGU", 9140, 151, 210.49, -2.14675, -79.877235],
            ["SETA", 9869, 0, 204.8, -2.248603, -79.674583]
        ],
        "-3": [
            ["SEMH", 5112, 115, 326.31, -3.273873, -79.958046],
            ["SETM", 6066, 98, 244.27, -3.992211, -79.364426]
        ],
        "0": [
            ["SETN", 7910, 148, 2.94, 0.967772, -79.62722]
        ],
        "-6": [
            ["SPHI", 8238, 148, 187.22, -6.776258, -79.826675]
        ],
        "-8": [
            ["SPRU", 7920, 145, 197.22, -8.074413, -79.106361]
        ]
    },
    "-120": {
        "43": [
            ["62S", 5200, 0, 268, 43.236774, -120.656319]
        ],
        "50": [
            ["CYKA", 6118, 148, 282.43, 50.700832, -120.431641]
        ],
        "56": [
            ["CYXJ", 6686, 200, 225.04, 56.245037, -120.726723],
            ["CYXJ", 6883, 150, 315.06, 56.231686, -120.72982]
        ],
        "40": [
            ["KAHC", 7156, 150, 279.01, 40.264626, -120.139915]
        ],
        "47": [
            ["KEAT", 5493, 150, 315.07, 47.3937, -120.199539],
            ["KELN", 5578, 150, 267.95, 47.031914, -120.520889]
        ],
        "42": [
            ["KLKV", 5307, 100, 360.26, 42.153816, -120.399124]
        ],
        "36": [
            ["KMAE", 5544, 150, 315.09, 36.983208, -120.105728]
        ],
        "37": [
            ["KMCE", 5904, 150, 318.55, 37.278652, -120.507149],
            ["KMER", 11806, 150, 321.11, 37.36787, -120.555397],
            ["KMOD", 5908, 150, 304.19, 37.620644, -120.943214]
        ],
        "35": [
            ["KPRB", 6014, 150, 208.6, 35.68058, -120.625862],
            ["KSBP", 5298, 150, 304.83, 35.232685, -120.632835]
        ],
        "34": [
            ["KSMX", 5133, 75, 215.91, 34.904781, -120.457863],
            ["KSMX", 6302, 150, 315.5, 34.892609, -120.445602],
            ["KVBG", 15006, 200, 316.61, 34.722366, -120.567085]
        ],
        "39": [
            ["KTRK", 6993, 100, 300.04, 39.315228, -120.131287]
        ],
        "46": [
            ["KYKM", 7590, 150, 290.02, 46.565422, -120.531105]
        ],
        "48": [
            ["S52", 5044, 0, 326.91, 48.419159, -120.140205]
        ]
    },
    "-83": {
        "39": [
            ["6I6", 5886, 0, 267.34, 39.94236, -83.193924],
            ["I23", 5100, 0, 213.99, 39.576195, -83.415451],
            ["KILN", 9001, 150, 217.24, 39.434032, -83.775696],
            ["KILN", 10701, 150, 217.25, 39.442719, -83.786293],
            ["KRZT", 5403, 100, 222.36, 39.445889, -83.016594],
            ["KSGH", 9003, 150, 234.12, 39.849537, -83.825356],
            ["KSGH", 5499, 100, 324.25, 39.83086, -83.837334],
            ["KTZR", 5501, 100, 212.11, 39.907551, -83.131683]
        ],
        "34": [
            ["GE99", 5069, 50, 230, 34.918907, -83.453232],
            ["KGVL", 5503, 0, 220.92, 34.278465, -83.825981]
        ],
        "33": [
            ["KAHN", 5516, 100, 268.31, 33.949352, -83.319992],
            ["KLZU", 5996, 100, 243.62, 33.981728, -83.953484],
            ["KMLJ", 5494, 100, 271.06, 33.154026, -83.232368],
            ["KWDR", 5500, 100, 308.73, 33.979229, -83.659416]
        ],
        "45": [
            ["KAPN", 8999, 150, 179.8, 45.089619, -83.561493],
            ["KAPN", 5024, 100, 239.77, 45.08297, -83.549858]
        ],
        "31": [
            ["KCKF", 5009, 100, 229.57, 31.994902, -83.768295],
            ["KFZG", 5012, 100, 191.86, 31.689966, -83.271317],
            ["KMGR", 5134, 100, 218.78, 31.091467, -83.799202],
            ["KTMA", 5512, 100, 329.43, 31.42067, -83.48571]
        ],
        "29": [
            ["KCTY", 5010, 75, 223.52, 29.643995, -83.097008],
            ["KCTY", 5005, 100, 313.71, 29.62727, -83.101341]
        ],
        "42": [
            ["KDET", 5089, 100, 323.38, 42.406704, -83.004921],
            ["KDTW", 10000, 150, 208.65, 42.219681, -83.334053],
            ["KDTW", 8499, 200, 208.65, 42.228294, -83.336136],
            ["KDTW", 12001, 200, 208.65, 42.231201, -83.349976],
            ["KDTW", 10002, 150, 208.64, 42.226242, -83.366264],
            ["KDTW", 8486, 150, 268.71, 42.199539, -83.330345],
            ["KDTW", 8687, 200, 268.69, 42.217506, -83.331009],
            ["KFNT", 7186, 150, 268.25, 42.969574, -83.732918],
            ["KFNT", 7850, 150, -0.87, 42.951191, -83.743019],
            ["KPTK", 6190, 150, 267.66, 42.665344, -83.410072],
            ["KYIP", 7521, 150, 226.66, 42.244778, -83.519608],
            ["KYIP", 6650, 160, 226.66, 42.244698, -83.523781],
            ["KYIP", 6501, 160, 268.57, 42.231209, -83.51577],
            ["KYIP", 7282, 160, 268.56, 42.244457, -83.516373],
            ["KYIP", 6910, 160, 316.1, 42.230709, -83.523079]
        ],
        "41": [
            ["KDUH", 5009, 50, 266.86, 41.736252, -83.646095],
            ["KFDY", 5878, 100, 248.62, 41.0172, -83.66156],
            ["KFDY", 6504, 100, 0.31, 41.000999, -83.666267],
            ["KTDZ", 5827, 100, 314.05, 41.559933, -83.474777],
            ["KTOL", 10588, 150, 247.13, 41.592667, -83.794952],
            ["KTOL", 5600, 150, 337.24, 41.579319, -83.79435],
            ["S24", 5495, 0, 239.59, 41.299541, -83.02858]
        ],
        "32": [
            ["KEZM", 5110, 100, 195.34, 32.220985, -83.125839],
            ["KMCN", 6503, 150, 227.87, 32.697979, -83.644928],
            ["KMCN", 5002, 150, 310.15, 32.689518, -83.638329],
            ["KPXE", 5011, 100, -0.53, 32.503681, -83.767281],
            ["KWRB", 12012, 300, 324.13, 32.626816, -83.580452]
        ],
        "35": [
            ["KGKT", 5498, 75, 278.83, 35.856606, -83.519547],
            ["KTYS", 9002, 150, 224.73, 35.817589, -83.98262],
            ["KTYS", 9006, 150, 224.74, 35.821877, -83.984047]
        ],
        "38": [
            ["KIOB", 5004, 75, 207.08, 38.06424, -83.975609]
        ],
        "36": [
            ["KMOR", 5700, 100, 229.34, 36.184475, -83.368111]
        ],
        "44": [
            ["KOSC", 11786, 200, 238.18, 44.460075, -83.374809]
        ],
        "30": [
            ["KTVI", 5506, 100, 219.77, 30.906811, -83.876297],
            ["KTVI", 5002, 100, 313.25, 30.897936, -83.874428],
            ["KVAD", 8019, 150, 0.47, 30.957291, -83.195435],
            ["KVAD", 9325, 150, 0.48, 30.956245, -83.191055],
            ["KVLD", 5604, 100, 215.73, 30.790356, -83.274727],
            ["KVLD", 6317, 150, 350.85, 30.77335, -83.272011]
        ],
        "11": [
            ["MNBL", 5971, 98, 233, 11.994737, -83.767296]
        ],
        "14": [
            ["MNPC", 8136, 167, 261, 14.047945, -83.376343]
        ],
        "9": [
            ["MRLM", 5924, 98, 326.79, 9.952272, -83.018219]
        ],
        "22": [
            ["MULM", 6560, 148, 251.93, 22.338898, -83.632698]
        ]
    },
    "160": {
        "-9": [
            ["AGGH", 7234, 148, 247.93, -9.424499, 160.063828]
        ]
    },
    "166": {
        "0": [
            ["ANYN", 7672, 148, 311.12, -0.556589, 166.925537]
        ],
        "-22": [
            ["NWWW", 10672, 148, 301.21, -22.022114, 166.226501]
        ],
        "19": [
            ["PWAK", 9857, 150, 281.8, 19.278198, 166.650742]
        ]
    },
    "-115": {
        "37": [
            ["AR51", 5500, 0, 315.87, 37.220173, -115.794472],
            ["AR51", 11960, 0, 335.72, 37.219776, -115.785172]
        ],
        "34": [
            ["CA90", 5280, 49, 273, 34.513504, -115.510674],
            ["KTNP", 5524, 75, 269.65, 34.134438, -115.93515]
        ],
        "50": [
            ["CYCZ", 5335, 100, 349.58, 50.324066, -115.871353]
        ],
        "60": [
            ["CYHY", 5986, 0, 335.08, 60.832329, -115.781982]
        ],
        "49": [
            ["CYXC", 5975, 150, 359.37, 49.602501, -115.781944]
        ],
        "54": [
            ["CYZU", 5785, 100, 305.96, 54.139172, -115.775818]
        ],
        "40": [
            ["KEKO", 7203, 150, 248.59, 40.826241, -115.781487]
        ],
        "35": [
            ["KHND", 6482, 100, 360.73, 35.963055, -115.135551]
        ],
        "36": [
            ["KINS", 6500, 0, 234, 36.594791, -115.664566],
            ["KINS", 9002, 150, 274, 36.585762, -115.657181],
            ["KINS", 5200, 100, 324, 36.583782, -115.658447],
            ["KLAS", 9783, 150, 204.86, 36.098522, -115.153572],
            ["KLAS", 8993, 150, 204.86, 36.097729, -115.157387],
            ["KLAS", 10512, 150, 269.94, 36.07365, -115.125793],
            ["KLAS", 14495, 150, 269.95, 36.076344, -115.120728],
            ["KLSV", 10054, 150, 220.93, 36.245663, -115.021828],
            ["KLSV", 10122, 200, 220.93, 36.247604, -115.024315],
            ["NV74", 5200, 150, 344, 36.268166, -115.991013]
        ],
        "32": [
            ["KIPL", 5311, 100, 332.77, 32.829552, -115.571358],
            ["KNJK", 9494, 200, 269.94, 32.829151, -115.65612],
            ["KNJK", 6828, 200, 315.23, 32.816475, -115.656403],
            ["L04", 6000, 0, 273, 32.83989, -115.257698],
            ["MMML", 8490, 148, 298.35, 32.625023, -115.229462]
        ],
        "43": [
            ["KMUO", 13492, 200, 315.13, 43.030483, -115.854568]
        ]
    },
    "173": {
        "52": [
            ["ATU", 5800, 0, 203, 52.837849, 173.189209]
        ],
        "1": [
            ["NGTA", 6320, 135, 278.04, 1.377058, 173.158997]
        ]
    },
    "154": {
        "-5": [
            ["AYBK", 5063, 98, 227.68, -5.41756, 154.677933]
        ]
    },
    "145": {
        "-6": [
            ["AYGA", 5557, 98, 355, -6.091499, 145.392166]
        ],
        "-5": [
            ["AYMD", 5149, 105, 255.05, -5.20689, 145.794632]
        ],
        "14": [
            ["PGRO", 5999, 150, 271.8, 14.174043, 145.251022]
        ],
        "15": [
            ["PGSN", 8702, 200, 247.71, 15.123528, 145.740799],
            ["PGWT", 8596, 150, 259, 15.001446, 145.631317]
        ],
        "-23": [
            ["YBAR", 5608, 98, 196.28, -23.558016, 145.304733]
        ],
        "-24": [
            ["YBCK", 5544, 98, 247.14, -24.429111, 145.436386]
        ],
        "-16": [
            ["YBCS", 10525, 148, 336.58, -16.892303, 145.755539]
        ],
        "-30": [
            ["YBKE", 5994, 98, 242.53, -30.037325, 145.953705]
        ],
        "-15": [
            ["YCKN", 5341, 98, 291.53, -15.446101, 145.189682]
        ],
        "-28": [
            ["YCMU", 5690, 98, 310.26, -28.036793, 145.633179]
        ],
        "-36": [
            ["YMNG", 6645, 148, 233.98, -36.882732, 145.191391]
        ],
        "-40": [
            ["YSMI", 5287, 60, 249.39, -40.833508, 145.092667],
            ["YWYY", 5408, 98, 279.27, -40.999172, 145.743347]
        ]
    },
    "150": {
        "-10": [
            ["AYGN", 5919, 98, 281.2, -10.314168, 150.350784]
        ],
        "-5": [
            ["AYHK", 5208, 98, 312.77, -5.466588, 150.410416]
        ],
        "-2": [
            ["AYKV", 5065, 98, 305.16, -2.582967, 150.81311]
        ],
        "59": [
            ["UHMM", 11307, 195, 273.08, 59.91, 150.748383]
        ],
        "-23": [
            ["YBRK", 5407, 98, 232.34, -23.373388, 150.478165],
            ["YBRK", 8647, 148, 337.76, -23.390657, 150.480118]
        ],
        "-30": [
            ["YGDH", 5403, 98, 302.81, -30.961613, 150.255112]
        ],
        "-35": [
            ["YMRY", 5006, 98, 371.76, -35.902267, 150.144852]
        ],
        "-34": [
            ["YSNW", 6715, 148, 224.3, -34.935661, 150.552139],
            ["YSNW", 6864, 148, 274.39, -34.94931, 150.549438],
            ["YWOL", 5994, 98, 349, -34.567673, 150.789124]
        ],
        "-33": [
            ["YSRI", 6995, 148, 287.16, -33.607262, 150.793243]
        ],
        "-31": [
            ["YSTW", 7221, 148, 312.96, -31.084547, 150.853882]
        ],
        "-24": [
            ["YTNG", 5009, 98, 291.55, -24.497704, 150.585892]
        ],
        "-22": [
            ["YWIS", 5905, 98, 329, -22.47718, 150.181198]
        ]
    },
    "148": {
        "-8": [
            ["AYGR", 5501, 98, 217.84, -8.798524, 148.31366]
        ],
        "-20": [
            ["YBHM", 5796, 148, 322.99, -20.36381, 148.956726],
            ["YBPN", 6805, 148, 294.58, -20.498236, 148.562531]
        ],
        "-23": [
            ["YBTR", 5040, 98, 366.5, -23.609982, 148.805084],
            ["YEML", 6234, 98, 250.41, -23.566465, 148.188675]
        ],
        "-36": [
            ["YCOM", 6965, 148, 372.67, -36.309082, 148.970001]
        ],
        "-33": [
            ["YCWR", 5356, 98, 341.51, -33.85313, 148.650497],
            ["YPKS", 5520, 148, 234.82, -33.128506, 148.245346],
            ["YPKS", 5065, 98, 304.91, -33.132694, 148.243805]
        ],
        "-22": [
            ["YDYS", 5107, 98, 326.19, -22.628328, 148.367462],
            ["YMMU", 5085, 98, 294.005, -22.803938, 148.712738],
            ["YMRB", 5027, 98, 351.41, -22.064962, 148.077484]
        ],
        "-32": [
            ["YSDU", 5607, 148, 233.66, -32.213692, 148.583466]
        ],
        "-30": [
            ["YWLG", 5331, 98, 238.04, -30.029598, 148.132645]
        ]
    },
    "144": {
        "-5": [
            ["AYMH", 6195, 98, 301.65, -5.83335, 144.307785]
        ],
        "13": [
            ["PGUA", 11189, 200, 245.9, 13.586204, 144.942276],
            ["PGUA", 10561, 200, 245.89, 13.59236, 144.938492],
            ["PGUM", 8009, 150, 244.86, 13.486485, 144.805237],
            ["PGUM", 10022, 150, 244.73, 13.490629, 144.809525]
        ],
        "43": [
            ["RJCK", 8203, 150, 339, 43.03046, 144.198517],
            ["RJCM", 8204, 150, -5.33, 43.8694, 144.165497],
            ["RJCN", 6552, 150, 250.99, 43.580345, 144.971527]
        ],
        "-20": [
            ["YHUG", 5402, 98, 307.93, -20.81739, 144.231201]
        ],
        "-23": [
            ["YLRE", 6360, 98, 226.44, -23.425953, 144.284439]
        ],
        "-37": [
            ["YLVT", 5005, 0, 241.86, -37.85994, 144.752716],
            ["YMEN", 6295, 148, 268.04, -37.730789, 144.914688],
            ["YMEN", 5210, 148, 357.83, -37.734695, 144.901428],
            ["YMML", 7490, 148, 274.2, -37.662247, 144.848114],
            ["YMML", 12014, 148, 351.58, -37.68578, 144.841003]
        ],
        "-38": [
            ["YMAV", 10010, 148, 367.57, -38.054443, 144.464844]
        ]
    },
    "147": {
        "-2": [
            ["AYMO", 6169, 148, 340.61, -2.069853, 147.427017]
        ],
        "-9": [
            ["AYPY", 9053, 148, 328.6, -9.452052, 147.227005]
        ],
        "-36": [
            ["YCRG", 5137, 98, 252.15, -36.181236, 147.895279]
        ],
        "-38": [
            ["YMES", 7993, 148, 233.8, -38.093094, 147.161026],
            ["YMES", 7309, 148, 278.92, -38.09877, 147.153458]
        ],
        "-42": [
            ["YMHB", 7383, 148, 315.19, -42.84333, 147.521515]
        ],
        "-41": [
            ["YMLT", 6497, 148, 327.33, -41.552059, 147.216965]
        ],
        "-31": [
            ["YNYN", 5386, 98, 239.23, -31.546843, 147.210434]
        ],
        "-35": [
            ["YSWG", 5793, 148, 242.04, -35.159607, 147.47731]
        ],
        "-33": [
            ["YWWL", 5194, 98, 278.66, -33.940155, 147.198166]
        ]
    },
    "146": {
        "-6": [
            ["AYNZ", 8006, 98, 274.96, -6.570772, 146.737259]
        ],
        "-26": [
            ["YBCV", 5006, 98, 317.11, -26.417982, 146.268021]
        ],
        "-19": [
            ["YBTL", 8027, 148, 204.06, -19.238182, 146.774231]
        ],
        "-20": [
            ["YCHT", 5699, 100, 243, -20.041164, 146.280472]
        ],
        "-35": [
            ["YCOR", 5991, 148, 234.07, -35.991165, 146.361099],
            ["YCOR", 5001, 98, 324.21, -35.994205, 146.356339]
        ],
        "-41": [
            ["YDPO", 6021, 148, 256.08, -41.165745, 146.44043]
        ],
        "-18": [
            ["YIGM", 5006, 98, 238, -18.659754, 146.152252]
        ],
        "-36": [
            ["YMAY", 6229, 98, 261.16, -36.065437, 146.969757],
            ["YWGT", 5383, 98, 368.21, -36.422909, 146.307053]
        ],
        "-34": [
            ["YNAR", 5291, 98, 323.93, -34.705063, 146.515869]
        ],
        "-38": [
            ["YWSL", 5001, 98, 279.51, -38.091961, 146.973892]
        ]
    },
    "152": {
        "-4": [
            ["AYTK", 5644, 92, 286.51, -4.342608, 152.387131]
        ],
        "-27": [
            ["YAMB", 5002, 148, 234.22, -27.636578, 152.720428],
            ["YAMB", 10022, 148, 338.81, -27.647331, 152.716476]
        ],
        "-24": [
            ["YBUD", 5358, 98, 327.83, -24.908228, 152.324844]
        ],
        "-31": [
            ["YKMP", 5399, 98, 234.29, -31.067879, 152.772476],
            ["YPMQ", 5218, 98, 209.68, -31.428844, 152.866592]
        ],
        "-25": [
            ["YMYB", 5225, 98, 353.55, -25.520607, 152.714493]
        ]
    },
    "141": {
        "-2": [
            ["AYVN", 5718, 85, 309.97, -2.703485, 141.309311]
        ],
        "24": [
            ["RJAW", 8687, 200, 250.2, 24.795139, 141.337097]
        ],
        "42": [
            ["RJCC", 9845, 200, 172.63, 42.788761, 141.691742],
            ["RJCC", 9851, 200, 172.62, 42.788429, 141.688095],
            ["RJCJ", 8861, 148, -7.24, 42.786446, 141.666809],
            ["RJCJ", 9847, 200, -7.03, 42.77533, 141.671646]
        ],
        "45": [
            ["RJCW", 6552, 150, 248.87, 45.407349, 141.812866],
            ["RJER", 5898, 148, 236.99, 45.24641, 141.197235]
        ],
        "40": [
            ["RJSH", 7152, 148, 244.86, 40.55666, 141.478348],
            ["RJSM", 10136, 150, 274.47, 40.701996, 141.386703]
        ],
        "39": [
            ["RJSI", 6567, 148, 190.71, 39.439789, 141.138092]
        ],
        "38": [
            ["RJST", 9013, 150, 234.24, 38.409111, 141.231003],
            ["RJST", 5121, 150, 320.47, 38.402573, 141.226257]
        ],
        "-31": [
            ["YBHI", 8248, 98, 235.8, -31.996296, 141.482956]
        ],
        "-12": [
            ["YBWP", 5406, 98, 304.38, -12.681609, 141.928696]
        ],
        "-27": [
            ["YLLE", 5920, 98, 219.54, -27.399405, 141.815186]
        ],
        "-17": [
            ["YNTN", 5516, 98, 326.63, -17.693441, 141.076202]
        ],
        "-38": [
            ["YPOD", 5276, 98, 267.15, -38.318787, 141.481155]
        ]
    },
    "143": {
        "-5": [
            ["AYWD", 5289, 75, 318.96, -5.6397, 143.896133]
        ],
        "-3": [
            ["AYWK", 5443, 98, 283.92, -3.585572, 143.676437]
        ],
        "42": [
            ["RJCB", 8203, 150, 339.34, 42.723064, 143.222824]
        ],
        "44": [
            ["RJEB", 6555, 148, 311.97, 44.297897, 143.413361]
        ]
    },
    "-45": {
        "61": [
            ["BGBW", 5990, 148, 220.36, 61.16692, -45.414745]
        ],
        "-22": [
            ["SBGW", 5166, 98, 178.96, -22.784433, -45.205002]
        ],
        "-23": [
            ["SBSJ", 8765, 148, 315.1, -23.236681, -45.853512]
        ],
        "-12": [
            ["SNBR", 5217, 98, 241, -12.076522, -45.003597]
        ],
        "-21": [
            ["SNFE", 5249, 98, 192, -21.424616, -45.931446]
        ],
        "-2": [
            ["SNYE", 5709, 98, 250, -2.480923, -45.059856]
        ]
    },
    "-50": {
        "67": [
            ["BGSF", 9191, 197, 241.62, 67.017586, -50.686321]
        ],
        "2": [
            ["SBAM", 5034, 148, 229.93, 2.077492, -50.856659]
        ],
        "-21": [
            ["SBAU", 6965, 115, 207.51, -21.132761, -50.419437]
        ],
        "-27": [
            ["SBLJ", 5038, 98, 327.81, -27.788017, -50.277378]
        ],
        "-24": [
            ["SBTL", 5906, 98, 184, -24.308292, -50.6516]
        ],
        "-1": [
            ["SNVS", 5249, 98, 222, -1.633245, -50.436569]
        ],
        "-26": [
            ["SSCC", 5331, 0, 185, -26.789333, -50.93837]
        ],
        "-18": [
            ["SWZM", 5840, 148, 267.806, -18.986181, -50.555119]
        ]
    },
    "-68": {
        "76": [
            ["BGTL", 9940, 140, 262.39, 76.533615, -68.645737]
        ],
        "49": [
            ["CYBC", 6011, 150, 259.32, 49.134445, -68.193031]
        ],
        "63": [
            ["CYFB", 8566, 200, 315.54, 63.748184, -68.537506]
        ],
        "58": [
            ["CYVP", 5986, 150, 222.35, 58.096962, -68.417091]
        ],
        "48": [
            ["CYYY", 6159, 150, 218.05, 48.617264, -68.200493]
        ],
        "44": [
            ["KBGR", 11431, 200, 314.23, 44.796497, -68.812302],
            ["KBHB", 5194, 100, 204.55, 44.456814, -68.359016]
        ],
        "46": [
            ["KPQI", 7434, 150, 165.71, 46.700974, -68.052917],
            ["KPQI", 5983, 150, 255.67, 46.688343, -68.027695]
        ],
        "18": [
            ["MDLR", 9673, 148, 277.07, 18.449072, -68.897957],
            ["MDPC", 10171, 157, 264.8, 18.568624, -68.34877]
        ],
        "-31": [
            ["SA40", 5283, 98, 6.405, -31.610029, -68.548264],
            ["SANU", 8119, 148, 3.66, -31.584436, -68.418053]
        ],
        "-32": [
            ["SAME", 9319, 177, 360.68, -32.844193, -68.793053]
        ],
        "-34": [
            ["SAMR", 7462, 98, 285.75, -34.594704, -68.381645]
        ],
        "-54": [
            ["SAWH", 9162, 148, 266.17, -54.842464, -68.273926],
            ["SAWO", 5299, 161, 358.11, -54.830402, -68.326302]
        ],
        "-50": [
            ["SAWU", 5570, 98, 262.9, -50.015289, -68.564911]
        ],
        "-38": [
            ["SAZN", 8418, 0, 270.22, -38.949028, -68.140869]
        ],
        "-22": [
            ["SCCF", 9473, 98, 273.01, -22.499004, -68.889565]
        ],
        "-20": [
            ["SCKP", 10499, 98, 350.21, -20.765854, -68.679825]
        ],
        "5": [
            ["SKUA", 6780, 145, 243.8, 5.528581, -68.677216]
        ],
        "-11": [
            ["SLCO", 6591, 98, 189.96, -11.036078, -68.781181]
        ],
        "-16": [
            ["SLLP", 13116, 151, 271.89, -16.513918, -68.1735]
        ],
        "10": [
            ["SVPC", 6972, 145, 272, 10.483039, -68.056793]
        ],
        "12": [
            ["TNCB", 9448, 148, 272.02, 12.138905, -68.261757],
            ["TNCC", 11186, 197, 282.06, 12.185513, -68.943428]
        ]
    },
    "-18": {
        "65": [
            ["BIAR", 6343, 148, 175.54, 65.667305, -18.074003]
        ]
    },
    "-14": {
        "65": [
            ["BIEG", 6552, 148, 205.32, 65.290878, -14.392709]
        ],
        "-7": [
            ["FHAW", 10010, 150, 298.92, -7.975887, -14.381446]
        ]
    },
    "-22": {
        "63": [
            ["BIKF", 9989, 197, 180.02, 63.991871, -22.605431],
            ["BIKF", 10030, 197, 269.99, 63.985043, -22.592335]
        ],
        "16": [
            ["GVAC", 10777, 148, 179.62, 16.751158, -22.949053]
        ]
    },
    "-21": {
        "64": [
            ["BIRK", 5124, 148, 175.26, 64.135979, -21.93886]
        ]
    },
    "21": {
        "42": [
            ["BKPR", 8225, 148, 355.83, 42.562775, 21.036947]
        ],
        "61": [
            ["EFPO", 7698, 197, 305.77, 61.455891, 21.816811]
        ],
        "63": [
            ["EFVA", 8176, 157, 343.16, 63.040596, 21.76881]
        ],
        "51": [
            ["EPDE", 8189, 197, 300.76, 51.545395, 21.907545]
        ],
        "50": [
            ["EPML", 8163, 148, 270.23, 50.322227, 21.47934]
        ],
        "52": [
            ["EPMM", 8183, 140, 270.26, 52.195507, 21.674208]
        ],
        "65": [
            ["ESNP", 6562, 82, 343, 65.389725, 21.267155],
            ["ESPJ", 6562, 0, 297, 65.834236, 21.48848]
        ],
        "64": [
            ["ESNS", 6876, 148, 286.25, 64.622124, 21.097992]
        ],
        "56": [
            ["EVLA", 6552, 131, 250.24, 56.520554, 21.112389]
        ],
        "55": [
            ["EYPA", 6467, 131, 192.73, 55.981762, 21.097303]
        ],
        "-28": [
            ["FAUP", 8017, 0, 169.74, -28.391287, 21.256136],
            ["FAUP", 16108, 197, 333.55, -28.419376, 21.274464]
        ],
        "-7": [
            ["FNZG", 5906, 68, 256.6, -7.715037, 21.366117]
        ],
        "29": [
            ["HL49", 5700, 0, 312.106, 29.474257, 21.129108],
            ["HL65", 9910, 0, 326.11, 29.201908, 21.601032]
        ],
        "21": [
            ["HL56", 7491, 148, 188.4, 21.696154, 21.833473],
            ["HL56", 11013, 98, 189.4, 21.704346, 21.83267]
        ],
        "31": [
            ["HL59", 11838, 148, 330.212, 31.984392, 21.201263]
        ],
        "27": [
            ["HL70", 11811, 148, 322.012, 27.244967, 21.629341]
        ],
        "28": [
            ["HLGL", 6575, 100, 360.107, 28.621235, 21.437832]
        ],
        "32": [
            ["HLLQ", 11811, 148, 281, 32.791069, 21.982803]
        ],
        "37": [
            ["LGAD", 10182, 148, 347.03, 37.911839, 21.295309]
        ],
        "38": [
            ["LGAG", 9607, 98, 272, 38.602314, 21.36685],
            ["LGRX", 11006, 148, 3.17, 38.136154, 21.424616],
            ["LGRX", 9786, 70, 3.17, 38.137753, 21.426329]
        ],
        "40": [
            ["LGKA", 8852, 148, 305, 40.439423, 21.294178],
            ["LGKZ", 6008, 98, 322.72, 40.279682, 21.849874]
        ],
        "47": [
            ["LHDC", 8190, 131, 227.9, 47.496334, 21.627495],
            ["LROD", 5857, 98, 191.14, 47.033203, 21.904688]
        ],
        "46": [
            ["LRAR", 6510, 148, 275.29, 46.17572, 21.27486]
        ],
        "45": [
            ["LRTR", 11426, 148, 289.79, 45.804523, 21.359026]
        ],
        "41": [
            ["LWSK", 8052, 140, 345.45, 41.95092, 21.625162]
        ],
        "43": [
            ["LYNI", 8193, 148, 293.68, 43.332245, 21.869463]
        ],
        "48": [
            ["LZKZ", 10166, 148, 193.02, 48.676609, 21.245909]
        ],
        "-27": [
            ["Z26X", 5271, 0, 333.005, -27.841433, 21.633709]
        ]
    },
    "-67": {
        "46": [
            ["CCR3", 5412, 100, 338.94, 46.419216, -67.624107],
            ["ME16", 12100, 300, 169, 46.966885, -67.890213]
        ],
        "48": [
            ["CYME", 5453, 150, 250.47, 48.859161, -67.442207]
        ],
        "-27": [
            ["SA44", 5413, 75, 253.8, -27.705853, -67.087013],
            ["SA46", 6050, 0, 189.5, -27.63397, -67.623192]
        ],
        "-38": [
            ["SAHR", 6893, 148, 277, -38.985191, -67.58799]
        ],
        "-28": [
            ["SANI", 5249, 75, 323, -28.055738, -67.57843]
        ],
        "-29": [
            ["SANO", 6890, 112, 350, -29.242624, -67.431458]
        ],
        "-45": [
            ["SAVC", 9202, 164, 259.34, -45.782913, -67.447899]
        ],
        "-53": [
            ["SAWE", 6545, 131, 267.46, -53.777187, -67.734344]
        ],
        "-49": [
            ["SAWJ", 6562, 131, 263, -49.308327, -67.787407]
        ],
        "-9": [
            ["SBRB", 7180, 148, 236.63, -9.863597, -67.885544]
        ],
        "6": [
            ["SKPC", 5974, 0, 239.43, 6.189163, -67.485268]
        ],
        "-17": [
            ["SLOR", 8202, 75, 355, -17.97064, -67.073418]
        ],
        "10": [
            ["SVBL", 10401, 157, 263, 10.185112, -67.552132],
            ["SVBS", 7085, 0, 273, 10.249526, -67.639984],
            ["SVVA", 10098, 164, 272.87, 10.151942, -67.912193]
        ],
        "5": [
            ["SVPA", 8236, 0, 202.94, 5.631529, -67.600647]
        ],
        "7": [
            ["SVSR", 5899, 160, 282.09, 7.883895, -67.432411]
        ],
        "-8": [
            ["SWNK", 5249, 108, 353, -8.840746, -67.31134]
        ],
        "18": [
            ["TJBQ", 11701, 200, 252.34, 18.499718, -67.113319]
        ]
    },
    "-63": {
        "44": [
            ["CYAW", 5692, 200, 265, 44.641392, -63.494884],
            ["CYHZ", 8797, 0, 215.03, 44.888409, -63.504757],
            ["CYHZ", 7698, 0, 305.15, 44.881577, -63.493088]
        ],
        "46": [
            ["CYSU", 7994, 200, 215.23, 46.449471, -63.824299],
            ["CYYG", 7004, 150, 189.18, 46.298641, -63.12307]
        ],
        "-35": [
            ["SAZG", 5518, 148, 340, -35.699329, -63.729549]
        ],
        "-8": [
            ["SBPV", 7913, 148, 176.59, -8.698454, -63.903053]
        ],
        "-17": [
            ["SLET", 10705, 124, 322.06, -17.821901, -63.163548],
            ["SLVR", 11515, 148, 327.3, -17.658033, -63.126408]
        ],
        "-21": [
            ["SLYA", 6890, 118, 193, -21.94022, -63.645763]
        ],
        "7": [
            ["SV76", 5905, 0, 284.006, 7.755798, -63.074413],
            ["SVDW", 5212, 131, 254.5, 7.494665, -63.263283]
        ],
        "8": [
            ["SVCB", 5794, 0, 228, 8.138687, -63.528881]
        ],
        "10": [
            ["SVCP", 6611, 148, 339, 10.658241, -63.24654],
            ["SVMG", 10478, 150, 258.29, 10.918645, -63.950375]
        ],
        "9": [
            ["SVMT", 6902, 148, 228.21, 9.757606, -63.145317]
        ],
        "-4": [
            ["SWKO", 5249, 118, 269, -4.133751, -63.123894]
        ],
        "18": [
            ["TNCM", 7150, 148, 261.7, 18.042223, -63.09906],
            ["TQPF", 5460, 98, 272.2, 18.204597, -63.047119]
        ]
    },
    "-70": {
        "48": [
            ["CYBG", 10053, 150, 271.73, 48.331665, -70.975517],
            ["CYBG", 6014, 150, -16.28, 48.322498, -70.988327]
        ],
        "46": [
            ["CYSG", 5102, 75, 225.65, 46.101185, -70.70739]
        ],
        "41": [
            ["KACK", 6313, 150, 224.96, 41.259216, -70.056229],
            ["KFMH", 7997, 200, 218.87, 41.66721, -70.511612],
            ["KFMH", 9492, 200, 307.48, 41.651592, -70.510651],
            ["KHYA", 5421, 150, 229.75, 41.674225, -70.267548],
            ["KHYA", 5251, 150, 319.83, 41.663765, -70.27948],
            ["KMVY", 5502, 100, 220.55, 41.397484, -70.606987]
        ],
        "42": [
            ["KBOS", 10006, 150, 199.71, 42.376884, -70.999283],
            ["KBOS", 6990, 150, 256.55, 42.360214, -70.987679],
            ["KBOS", 10078, 150, 315.22, 42.354568, -70.991463]
        ],
        "43": [
            ["KPSM", 11319, 150, 329.12, 43.064556, -70.812309],
            ["KPWM", 7188, 150, 275.32, 43.644032, -70.298973],
            ["KSFM", 5993, 150, 238.32, 43.395535, -70.699997]
        ],
        "19": [
            ["MDPP", 10108, 151, 252.97, 19.761957, -70.555954],
            ["MDST", 8708, 148, 282.93, 19.403412, -70.592224]
        ],
        "-38": [
            ["SA18", 5249, 0, 278, -38.083076, -70.634872],
            ["SA38", 5249, 98, 287.005, -38.541019, -70.32827],
            ["SAHZ", 7218, 131, 278, -38.97686, -70.100967]
        ],
        "-18": [
            ["SCAR", 7179, 148, 199.2, -18.33922, -70.335335],
            ["SPTN", 8229, 148, 199.41, -18.042625, -70.271873]
        ],
        "-27": [
            ["SCAT", 7239, 148, 355.44, -27.271284, -70.778358],
            ["SCHA", 5446, 92, 276, -27.297432, -70.405251]
        ],
        "-22": [
            ["SCBE", 5379, 95, 309.6, -22.14719, -70.0597]
        ],
        "-33": [
            ["SCBQ", 6024, 131, 207, -33.552067, -70.681335],
            ["SCEL", 12318, 0, 357.42, -33.409458, -70.784912],
            ["SCTI", 6954, 0, 212.93, -33.481857, -70.689224]
        ],
        "-52": [
            ["SCCI", 5495, 148, 208.73, -52.994785, -70.842972]
        ],
        "-53": [
            ["SCCI", 9133, 148, 268.99, -53.000603, -70.833755],
            ["SCCI", 7861, 148, 318.87, -53.013779, -70.845146],
            ["SCFM", 8184, 98, 286, -53.256603, -70.298622]
        ],
        "-20": [
            ["SCDA", 11039, 0, 2.88, -20.550339, -70.182091]
        ],
        "-23": [
            ["SCFA", 8611, 164, 186.42, -23.432699, -70.443604]
        ],
        "-34": [
            ["SCRG", 5413, 75, 220, -34.168747, -70.769791]
        ],
        "1": [
            ["SKMU", 5879, 0, 191.23, 1.261434, -70.232498]
        ],
        "7": [
            ["SKUC", 6884, 0, 277.57, 7.067658, -70.727509]
        ],
        "-3": [
            ["SPBC", 5888, 98, 296.506, -3.920448, -70.500984]
        ],
        "-9": [
            ["SPEP", 5906, 98, 247, -9.7671, -70.701599]
        ],
        "-15": [
            ["SPJL", 13604, 150, 292.19, -15.474026, -70.1399]
        ],
        "8": [
            ["SVBI", 6562, 0, 294, 8.615895, -70.204361]
        ],
        "10": [
            ["SVCO", 5052, 135, 274, 10.132886, -70.076164]
        ],
        "11": [
            ["SVJC", 9186, 148, 261, 11.778669, -70.134895]
        ],
        "9": [
            ["SVVL", 7710, 148, 197, 9.36015, -70.61338]
        ],
        "12": [
            ["TNCA", 9017, 148, 283.69, 12.49845, -70.002922]
        ]
    },
    "-65": {
        "47": [
            ["CYCH", 5889, 150, 250.89, 47.010265, -65.437859]
        ],
        "45": [
            ["CYSJ", 7002, 200, 210.94, 45.318798, -65.881317],
            ["CYSJ", 5090, 200, 301.02, 45.322704, -65.882484]
        ],
        "48": [
            ["CYVB", 5974, 150, 294.89, 48.067635, -65.449097]
        ],
        "18": [
            ["NRR", 11000, 0, 239, 18.250917, -65.629044],
            ["TJSJ", 10005, 200, 246.9, 18.44952, -65.988281],
            ["TJSJ", 8013, 150, 270.14, 18.4335, -65.990585]
        ],
        "-39": [
            ["SA29", 6930, 148, 276.1, -39.287426, -65.598175]
        ],
        "-43": [
            ["SA34", 5413, 98, 266.2, -43.235188, -65.314133],
            ["SAVT", 8388, 148, 249.13, -43.206341, -65.25563]
        ],
        "-28": [
            ["SANC", 9165, 98, 193.49, -28.578878, -65.749161]
        ],
        "-26": [
            ["SANT", 9545, 148, 189.72, -26.828014, -65.102325]
        ],
        "-33": [
            ["SAOR", 7748, 164, 238.43, -33.719521, -65.367226],
            ["SAOR", 7855, 148, 281.2, -33.733852, -65.363075]
        ],
        "-32": [
            ["SAOS", 8382, 148, 198.95, -32.373562, -65.181412]
        ],
        "-24": [
            ["SASA", 9837, 148, 191.25, -24.846367, -65.4841],
            ["SASA", 7880, 98, 232.12, -24.84481, -65.470749],
            ["SASJ", 9719, 0, 330.25, -24.404287, -65.090576]
        ],
        "-22": [
            ["SASQ", 8858, 98, 333.51, -22.173222, -65.564011]
        ],
        "-40": [
            ["SAVN", 5906, 98, 304.4, -40.787899, -65.091171]
        ],
        "-42": [
            ["SAVY", 8202, 148, 238, -42.744026, -65.087006]
        ],
        "-10": [
            ["SBGM", 5909, 148, 347.05, -10.795939, -65.279266]
        ],
        "-19": [
            ["SLPO", 9186, 98, 234.7, -19.539963, -65.719078]
        ],
        "-13": [
            ["SLSA", 5013, 69, 314, -13.763099, -65.427132]
        ],
        "-18": [
            ["SLSU", 10322, 98, 229.64, -18.995264, -65.282486]
        ]
    },
    "-66": {
        "47": [
            ["CYCL", 5987, 0, 283.76, 47.988945, -66.319077]
        ],
        "45": [
            ["CYFC", 8000, 200, 249.86, 45.870548, -66.522751],
            ["CYFC", 5994, 200, 310.3, 45.864056, -66.522675]
        ],
        "43": [
            ["CYQI", 5989, 150, 221.51, 43.82946, -66.083]
        ],
        "52": [
            ["CYWK", 5998, 150, -19.64, 52.914978, -66.860092]
        ],
        "50": [
            ["CYZV", 6539, 150, 248.88, 50.223919, -66.252617],
            ["CYZV", 5759, 200, 289.02, 50.224171, -66.253471]
        ],
        "-27": [
            ["SA11", 6283, 75, 242, -27.06822, -66.577553],
            ["SA35", 5020, 98, 250, -27.625744, -66.33445]
        ],
        "-26": [
            ["SA42", 5709, 98, -3.394, -26.681696, -66.0242]
        ],
        "-30": [
            ["SACT", 6726, 98, 190, -30.33618, -66.291756]
        ],
        "-29": [
            ["SANL", 9402, 0, 207.2, -29.369785, -66.789055]
        ],
        "-33": [
            ["SAOU", 9678, 98, 361, -33.290482, -66.352493]
        ],
        "0": [
            ["SBUA", 8536, 148, 222.64, -0.139709, -66.977493]
        ],
        "-17": [
            ["SLCB", 8723, 148, 217.3, -17.410805, -66.168938],
            ["SLCB", 12495, 148, 312.05, -17.43189, -66.164566]
        ],
        "10": [
            ["SVCS", 6561, 98, 273.02, 10.289918, -66.805489],
            ["SVFM", 5971, 140, 282, 10.48167, -66.825027],
            ["SVMI", 10092, 145, 252.9, 10.609479, -66.969673],
            ["SVMI", 11483, 148, 266.99, 10.607972, -66.978958]
        ],
        "9": [
            ["SVCZ", 9842, 195, 258.5, 9.374857, -66.909584]
        ],
        "11": [
            ["SVLO", 10499, 148, 251, 11.807158, -66.148804]
        ],
        "-4": [
            ["SWCA", 5462, 59, 212, -4.872242, -66.891571]
        ],
        "18": [
            ["TJIG", 5318, 100, 262.79, 18.457748, -66.090378],
            ["TJPS", 6904, 150, 288, 18.005344, -66.553421]
        ]
    },
    "-57": {
        "49": [
            ["CYDF", 5988, 150, 226.34, 49.216717, -57.382229]
        ],
        "-38": [
            ["SA14", 5472, 102, -2.095, -38.233501, -57.870857]
        ],
        "-31": [
            ["SAAC", 5028, 98, 210, -31.289984, -57.988602],
            ["SUSO", 5213, 148, 218.8, -31.432894, -57.980045]
        ],
        "-35": [
            ["SAAI", 6955, 0, 225, -35.352089, -57.277191]
        ],
        "-29": [
            ["SARL", 7431, 148, -9.21, -29.699303, -57.150249],
            ["SATU", 7054, 98, 186, -29.762199, -57.965061]
        ],
        "-37": [
            ["SAZM", 7214, 148, 302.74, -37.939545, -57.562695]
        ],
        "-19": [
            ["SBCR", 5397, 98, 253.65, -19.00943, -57.663879]
        ],
        "-6": [
            ["SBEK", 5237, 98, 242.35, -6.229984, -57.770821]
        ],
        "-25": [
            ["SGAS", 11058, 151, 192.43, -25.225025, -57.515526]
        ],
        "-23": [
            ["SGCO", 6089, 148, 196.93, -23.43199, -57.424015]
        ],
        "-18": [
            ["SLPS", 6582, 118, 206.9, -18.97249, -57.818459]
        ],
        "-14": [
            ["SWGB", 5954, 0, 188.6, -14.768195, -57.186913],
            ["SWIN", 6562, 98, 172.9, -14.234028, -57.996468]
        ],
        "-16": [
            ["SWKC", 6070, 0, 347, -16.05171, -57.628883]
        ]
    },
    "-130": {
        "58": [
            ["CYDL", 6105, 90, 228.95, 58.429302, -130.014847]
        ],
        "54": [
            ["CYPR", 6046, 200, 332, 54.27837, -130.437088]
        ]
    },
    "-133": {
        "68": [
            ["CYEV", 5984, 0, 265.87, 68.304367, -133.461029]
        ]
    },
    "-58": {
        "48": [
            ["CYJT", 9974, 200, 251.15, 48.54884, -58.530346]
        ],
        "-51": [
            ["EGYP", 8444, 150, 285.3, -51.823879, -58.438866]
        ],
        "-34": [
            ["SABE", 6859, 131, 304.08, -34.564453, -58.406376],
            ["SADF", 5907, 98, 224.11, -34.448326, -58.58358],
            ["SADJ", 7889, 131, 336.07, -34.56596, -58.780769],
            ["SADM", 9350, 131, 185, -34.641376, -58.642532],
            ["SADO", 5774, 98, -3.394, -34.542332, -58.671169],
            ["SADP", 6927, 164, 335.02, -34.620567, -58.605572],
            ["SAEZ", 10801, 197, 282.3, -34.825352, -58.518223],
            ["SAEZ", 10210, 148, 344.06, -34.83506, -58.524632]
        ],
        "-27": [
            ["SARC", 6914, 148, 187.72, -27.436178, -58.760376]
        ],
        "-26": [
            ["SARF", 5913, 0, 204.92, -26.205408, -58.224339]
        ],
        "-29": [
            ["SATM", 5906, 0, 193, -29.218201, -58.082359]
        ],
        "6": [
            ["SYCJ", 7466, 148, 224.84, 6.506418, -58.246288],
            ["SYCJ", 5001, 148, 269.99, 6.498583, -58.248638]
        ]
    },
    "-74": {
        "49": [
            ["CYMT", 6483, 150, 208.23, 49.779663, -74.521484]
        ],
        "45": [
            ["CYMX", 11977, 200, 278.45, 45.665871, -74.042381]
        ],
        "39": [
            ["KACY", 6147, 150, 207.95, 39.464622, -74.574936],
            ["KACY", 9990, 150, 298.06, 39.45137, -74.559715],
            ["KMJX", 5946, 100, 229.8, 39.932755, -74.284256],
            ["KWWD", 5003, 150, 179.61, 39.016682, -74.905754]
        ],
        "40": [
            ["KBLM", 7298, 80, 312.55, 40.181084, -74.116394],
            ["KEWR", 9983, 150, 205.77, 40.702019, -74.158691],
            ["KEWR", 11003, 150, 205.77, 40.703053, -74.161842],
            ["KEWR", 6790, 150, 275, 40.70118, -74.156281],
            ["KMMU", 5998, 150, 216.06, 40.8064, -74.406464],
            ["KNEL", 5032, 150, 230.78, 40.040264, -74.342209],
            ["KNEL", 5001, 150, 320.59, 40.029011, -74.348915],
            ["KTEB", 7003, 150, 183.18, 40.857861, -74.05896],
            ["KTEB", 6009, 150, 228.1, 40.857727, -74.054092],
            ["KTTN", 6004, 150, 226.42, 40.281097, -74.805954],
            ["KWRI", 9997, 200, 225.7, 40.023663, -74.571671],
            ["KWRI", 7129, 150, -7.21, 40.00816, -74.599625]
        ],
        "41": [
            ["KMGJ", 5029, 100, 196.34, 41.517876, -74.264175],
            ["KMSV", 6298, 150, 322.99, 41.694748, -74.788048],
            ["KSWF", 11806, 150, 258.35, 41.507374, -74.088249],
            ["KSWF", 6005, 150, 329.43, 41.496994, -74.090225]
        ],
        "44": [
            ["KSLK", 6569, 150, 214.85, 44.394985, -74.198883]
        ],
        "20": [
            ["MUBA", 6088, 98, 335.08, 20.3577, -74.502357],
            ["MUMO", 6107, 98, 242.81, 20.657841, -74.914261]
        ],
        "24": [
            ["MYSM", 7996, 150, 275.01, 24.062164, -74.511688]
        ],
        "4": [
            ["SKBO", 12503, 148, 307.28, 4.689797, -74.141815],
            ["SKBO", 12449, 148, 307.2, 4.69274, -74.124733],
            ["SKGI", 5171, 92, 185.22, 4.283303, -74.794518],
            ["SKGY", 5608, 0, 283.23, 4.810795, -74.057625],
            ["SKMA", 6070, 80, 241, 4.735696, -74.267693],
            ["SKTI", 9280, 96, 215, 4.255226, -74.64257]
        ],
        "10": [
            ["SKBQ", 9895, 0, 219.11, 10.899957, -74.77198]
        ],
        "5": [
            ["SKPQ", 9987, 164, 1.51, 5.469912, -74.65773],
            ["SKQU", 5864, 0, 2.49, 5.204555, -74.884048],
            ["SKVL", 5520, 50, 330.806, 5.932433, -74.453255]
        ],
        "11": [
            ["SKSM", 5603, 0, -0.01, 11.112029, -74.230804]
        ],
        "2": [
            ["SKSV", 5241, 0, 308.2, 2.145549, -74.761017]
        ],
        "-8": [
            ["SPCL", 9227, 148, 199.94, -8.366025, -74.569931]
        ],
        "-13": [
            ["SPHO", 9222, 148, 200.91, -13.139986, -74.198318]
        ],
        "-11": [
            ["SPMF", 5775, 98, 331.506, -11.332361, -74.531792]
        ]
    },
    "-125": {
        "54": [
            ["CYPZ", 5049, 75, 316.77, 54.37141, -125.943237]
        ]
    },
    "-71": {
        "46": [
            ["CYQB", 9073, 150, 224.4, 46.800003, -71.380974],
            ["CYQB", 5686, 150, 277.7, 46.786968, -71.38031]
        ],
        "48": [
            ["CYRC", 6076, 150, 284.82, 48.514748, -71.038406]
        ],
        "45": [
            ["CYSC", 5990, 150, 298.85, 45.434521, -71.681114]
        ],
        "42": [
            ["KASH", 5495, 100, 302.76, 42.777676, -71.506134],
            ["KBED", 5105, 150, 217.07, 42.474606, -71.285431],
            ["KBED", 6990, 150, 277.15, 42.469429, -71.274582],
            ["KBOS", 7861, 150, 199.7, 42.378174, -71.004562],
            ["KMHT", 6846, 150, 222.38, 42.942768, -71.43103],
            ["KMHT", 9250, 150, 336.57, 42.918571, -71.42585],
            ["KORH", 6988, 150, 273.86, 42.266037, -71.864967],
            ["KORH", 5497, 100, 317.82, 42.262581, -71.866089]
        ],
        "44": [
            ["KBML", 5199, 100, 339.11, 44.568703, -71.172363]
        ],
        "43": [
            ["KCON", 6005, 100, 335.1, 43.193142, -71.4981],
            ["KLCI", 5279, 100, 247.51, 43.575493, -71.409668],
            ["NH14", 6800, 0, 333, 43.815651, -71.130669]
        ],
        "41": [
            ["KOQU", 7499, 150, 325.07, 41.590893, -71.40596],
            ["KPVD", 7166, 150, 212.11, 41.730469, -71.420975],
            ["KPVD", 6080, 150, 321.64, 41.718521, -71.418259]
        ],
        "21": [
            ["MBGT", 6358, 151, 284.52, 21.442312, -71.133095],
            ["MBSC", 5988, 98, 277.98, 21.514688, -71.519783]
        ],
        "18": [
            ["MDBH", 9837, 148, 297.47, 18.244886, -71.107925]
        ],
        "-37": [
            ["SA43", 5290, 0, 235.1, -37.847214, -71.001709]
        ],
        "-42": [
            ["SAVE", 7874, 0, 235, -42.900734, -71.132088]
        ],
        "-41": [
            ["SAZS", 7709, 157, 294.69, -41.155483, -71.145035]
        ],
        "-40": [
            ["SAZY", 8202, 148, 248.6, -40.077824, -71.132149]
        ],
        "-45": [
            ["SCBA", 8188, 148, 280.01, -45.917912, -71.673492]
        ],
        "-39": [
            ["SCPC", 5577, 98, 281, -39.292831, -71.911125]
        ],
        "-29": [
            ["SCSE", 6366, 148, 296.31, -29.920279, -71.190536]
        ],
        "-32": [
            ["SCVM", 5744, 98, 229.61, -32.944599, -71.471458]
        ],
        "12": [
            ["SKPB", 5222, 148, 262.72, 12.222461, -71.97702]
        ],
        "6": [
            ["SKTM", 6613, 0, 239.1, 6.456079, -71.750465]
        ],
        "-16": [
            ["SP70", 13064, 0, 352.813, -16.809288, -71.884239],
            ["SPQU", 9776, 148, 273.17, -16.341288, -71.557159]
        ],
        "-14": [
            ["SPIY", 8202, 0, 358, -14.817619, -71.431541]
        ],
        "-17": [
            ["SPLO", 8203, 148, 288.07, -17.701666, -71.339203]
        ],
        "-13": [
            ["SPZO", 11144, 148, 275.96, -13.537297, -71.923149]
        ],
        "10": [
            ["SVMC", 10140, 0, 200.14, 10.57476, -71.721504],
            ["SVON", 6160, 95, 236.9, 10.334681, -71.315331]
        ],
        "8": [
            ["SVMD", 5348, 148, 236, 8.589697, -71.152306],
            ["SVVG", 10627, 145, 262.1, 8.641203, -71.645241]
        ],
        "7": [
            ["SVSB", 5577, 131, 286, 7.831264, -71.159088]
        ],
        "9": [
            ["SVSZ", 7711, 130, -6.96, 9.02285, -71.948547]
        ]
    },
    "-128": {
        "60": [
            ["CYQH", 5486, 150, 289.82, 60.113895, -128.808197]
        ],
        "54": [
            ["CYXT", 5396, 150, 228.94, 54.468323, -128.56665],
            ["CYXT", 5931, 150, 352, 54.458603, -128.584991]
        ]
    },
    "-64": {
        "46": [
            ["CYQM", 6163, 200, 222.32, 46.118328, -64.67804],
            ["CYQM", 7953, 200, 267.81, 46.107773, -64.663025]
        ],
        "44": [
            ["CYZX", 8023, 200, 244.58, 44.991665, -64.903862],
            ["CYZX", 7995, 0, 286.18, 44.978046, -64.901642]
        ],
        "53": [
            ["CZUM", 5437, 150, 284.31, 53.560825, -64.093864]
        ],
        "-23": [
            ["SA24", 6693, 75, 253, -23.777861, -64.73777]
        ],
        "-31": [
            ["SACE", 6261, 0, 189, -31.438171, -64.281761],
            ["SACO", 7264, 148, 224.07, -31.308908, -64.191338],
            ["SACO", 10525, 148, -0.89, -31.324516, -64.208076]
        ],
        "-27": [
            ["SANE", 7962, 148, 207.68, -27.757149, -64.30423]
        ],
        "-33": [
            ["SAOC", 7495, 0, 218.91, -33.086411, -64.266151],
            ["SAOC", 6804, 131, 355.7, -33.104172, -64.266747]
        ],
        "-36": [
            ["SAZR", 7546, 98, 191, -36.581219, -64.276154]
        ],
        "-3": [
            ["SBTF", 7241, 148, 317.84, -3.390266, -64.717491]
        ],
        "-21": [
            ["SLTJ", 10007, 148, 312, -21.562077, -64.688232]
        ],
        "-14": [
            ["SLTR", 7882, 98, 313.61, -14.822248, -64.908508]
        ],
        "10": [
            ["SVBC", 8295, 125, 192.52, 10.122735, -64.684303],
            ["SVBC", 9834, 130, 322.46, 10.103643, -64.681778],
            ["SVCU", 10175, 148, 247.9, 10.45917, -64.116425]
        ],
        "8": [
            ["SVST", 6299, 148, 248.8, 8.953291, -64.143005]
        ],
        "18": [
            ["TIST", 6998, 150, 267.43, 18.337673, -64.964333]
        ],
        "17": [
            ["TISX", 7610, 150, 263.95, 17.702974, -64.787674]
        ],
        "32": [
            ["TXKF", 9708, 150, 281.49, 32.361382, -64.663231]
        ]
    },
    "-89": {
        "48": [
            ["CYQT", 6139, 200, 250.74, 48.375828, -89.3097],
            ["CYQT", 5332, 200, 302.13, 48.367214, -89.319427]
        ],
        "37": [
            ["K02", 7006, 0, 197.22, 37.877892, -89.858521],
            ["KCGI", 6492, 150, 285.84, 37.222507, -89.560242],
            ["KMDH", 6513, 100, 1.23, 37.770714, -89.248421],
            ["KMWA", 8019, 150, 202.6, 37.768688, -89.007339]
        ],
        "45": [
            ["KARV", 5148, 100, 358.93, 45.923599, -89.732643],
            ["KRHI", 6787, 150, 268.27, 45.630856, -89.460014],
            ["KRRL", 5092, 75, 248.55, 45.200851, -89.706734]
        ],
        "38": [
            ["KBLV", 8001, 150, 316.59, 38.535793, -89.842567],
            ["KBLV", 9999, 150, 316.63, 38.536263, -89.809441],
            ["KENL", 5006, 75, 0.64, 38.507996, -89.091797]
        ],
        "30": [
            ["KBXA", 5009, 100, 2.74, 30.806831, -89.865334],
            ["KGPT", 9008, 150, 315.01, 30.397472, -89.062065],
            ["KHSA", 8519, 150, 360.17, 30.356121, -89.454651],
            ["KMJD", 5012, 75, 360, 30.480537, -89.651169]
        ],
        "35": [
            ["KBYH", 11618, 150, 360, 35.948406, -89.943954],
            ["KFYE", 5008, 75, 187.78, 35.214504, -89.393318],
            ["KHKA", 5007, 75, 358.91, 35.933537, -89.830643],
            ["KMEM", 8936, 150, 271.97, 35.057777, -89.955833],
            ["KMEM", 9335, 150, 358.99, 35.02388, -89.986893],
            ["KMEM", 9015, 150, 359.01, 35.024086, -89.972435],
            ["KMEM", 11138, 150, 359.01, 35.024044, -89.975533],
            ["KNQA", 8004, 200, 218.82, 35.365192, -89.861992],
            ["M04", 5011, 0, 189.03, 35.590149, -89.585899]
        ],
        "44": [
            ["KCWA", 7632, 150, 257.34, 44.784458, -89.646782],
            ["KCWA", 6500, 150, 350.06, 44.763477, -89.671211],
            ["KISW", 5499, 100, 199.77, 44.3675, -89.83474],
            ["KPCZ", 5191, 100, 273.44, 44.332474, -89.012383],
            ["KSTE", 6025, 120, 209.6, 44.552788, -89.525154]
        ],
        "36": [
            ["KDYR", 5700, 100, 220.46, 36.002239, -89.401459],
            ["KMAW", 5018, 100, 360.62, 36.593674, -89.993568],
            ["KSIK", 5507, 100, 203.91, 36.905785, -89.557922]
        ],
        "42": [
            ["KFEP", 5498, 100, 234.29, 42.248768, -89.573608],
            ["KJVL", 6697, 150, 221.48, 42.625565, -89.033287],
            ["KJVL", 7295, 150, 313.59, 42.614281, -89.035469],
            ["KJVL", 5002, 75, -0.89, 42.614128, -89.035957],
            ["KRFD", 8202, 150, 185.43, 42.20586, -89.088554],
            ["KRFD", 9992, 150, 245.38, 42.201649, -89.086327]
        ],
        "33": [
            ["KGNF", 7001, 150, 311.92, 33.828598, -89.791336],
            ["KOSX", 5003, 75, 317.42, 33.085201, -89.536476]
        ],
        "31": [
            ["KHBG", 6100, 150, 311.06, 31.259308, -89.245323],
            ["KLUL", 5515, 150, 314.93, 31.667685, -89.166496],
            ["KPIB", 6517, 150, 359.94, 31.458204, -89.337051]
        ],
        "32": [
            ["KMPE", 5009, 50, 5.31, 32.792591, -89.12674]
        ],
        "43": [
            ["KMSN", 7200, 150, 208.91, 43.150444, -89.328819],
            ["KMSN", 5841, 150, 316.48, 43.136284, -89.326462],
            ["KMSN", 9007, 150, 1.93, 43.124569, -89.342163]
        ],
        "34": [
            ["KOLV", 6010, 100, 359.54, 34.970509, -89.786766],
            ["KPMU", 5007, 75, 192.12, 34.370289, -89.890823]
        ],
        "40": [
            ["KPIA", 8001, 150, 218.57, 40.671196, -89.676697],
            ["KPIA", 10097, 150, 306.58, 40.657181, -89.684532]
        ],
        "39": [
            ["KSPI", 7998, 150, 221.56, 39.85331, -89.667496],
            ["KSPI", 6996, 150, 306.67, 39.837975, -89.667488],
            ["KSPI", 5304, 150, 1.25, 39.835766, -89.679878]
        ],
        "41": [
            ["KSQI", 6491, 150, 250.11, 41.745232, -89.662292],
            ["KVYS", 6003, 100, 359.58, 41.343616, -89.153008]
        ],
        "16": [
            ["MGTK", 9845, 148, 290.48, 16.908978, -89.853203]
        ],
        "20": [
            ["MMMD", 10510, 151, 285.36, 20.93, -89.630379],
            ["MMMD", 7588, 151, 361.04, 20.919825, -89.658035]
        ],
        "13": [
            ["MSLP", 10245, 148, 249.88, 13.445637, -89.042503],
            ["MSSS", 7375, 148, 335.8, 13.690049, -89.115921]
        ],
        "0": [
            ["SEST", 6296, 66, 348.85, -0.9186, -89.615829]
        ]
    },
    "-118": {
        "55": [
            ["CYQU", 6186, 200, 269.86, 55.184464, -118.869827],
            ["CYQU", 6488, 0, 314.86, 55.173698, -118.875656]
        ],
        "46": [
            ["KALW", 6521, 150, 216.14, 46.099766, -118.276482],
            ["KALW", 5947, 150, 359.67, 46.085873, -118.294624]
        ],
        "37": [
            ["KBIH", 5557, 100, 270.5, 37.373508, -118.354965],
            ["KBIH", 7497, 100, 315.57, 37.365448, -118.355232],
            ["KBIH", 5607, 100, 360.49, 37.365345, -118.361801],
            ["KMMH", 6990, 100, 289, 37.620926, -118.827293]
        ],
        "43": [
            ["KBNO", 5095, 75, 314.56, 43.58717, -118.950478]
        ],
        "34": [
            ["KBUR", 5795, 150, 270.94, 34.197647, -118.349945],
            ["KBUR", 6895, 150, 347.11, 34.193764, -118.355324],
            ["KPMD", 11999, 150, 231.72, 34.637287, -118.060242],
            ["KPMD", 11987, 150, 266.18, 34.632767, -118.073227],
            ["KVNY", 8012, 150, 355.52, 34.19664, -118.489128],
            ["KWJF", 7194, 150, 252.02, 34.744083, -118.207214]
        ],
        "39": [
            ["KFLX", 5699, 75, 228.41, 39.50473, -118.74144],
            ["KNFL", 6994, 154, 267.83, 39.413826, -118.691086],
            ["KNFL", 14008, 201, 325.24, 39.404022, -118.685638],
            ["KNFL", 11082, 200, 325.24, 39.405594, -118.682739]
        ],
        "33": [
            ["KLAX", 10274, 150, 262.97, 33.950264, -118.401657],
            ["KLAX", 8916, 150, 262.97, 33.952148, -118.401939],
            ["KLAX", 11084, 200, 262.98, 33.93737, -118.382759],
            ["KLAX", 12078, 150, 262.98, 33.93988, -118.37986],
            ["KLGB", 5413, 150, 269.94, 33.813831, -118.143433],
            ["KLGB", 6186, 150, 270.2, 33.822693, -118.142731],
            ["KLGB", 10003, 200, 314.8, 33.807072, -118.138367],
            ["KNUC", 9295, 200, 247.23, 33.027668, -118.574455],
            ["KSLI", 8000, 200, 234.93, 33.796383, -118.038628],
            ["KSLI", 5901, 150, 234.93, 33.794601, -118.046143],
            ["KTOA", 5001, 150, 308.54, 33.799507, -118.332764]
        ],
        "40": [
            ["KLOL", 5528, 75, 210.37, 40.075001, -118.562828],
            ["KLOL", 5034, 75, 270.39, 40.064182, -118.553673]
        ],
        "35": [
            ["KMHV", 7042, 100, 270.12, 35.05917, -118.142532],
            ["KMHV", 9505, 200, 315.23, 35.048737, -118.135719],
            ["L71", 6020, 0, 255.5, 35.153309, -118.006889],
            ["L94", 5420, 0, 285, 35.098713, -118.4142],
            ["L94", 5190, 0, 285, 35.099232, -118.414734]
        ],
        "45": [
            ["KPDT", 6288, 150, 269.85, 45.695377, -118.828697],
            ["KPDT", 5575, 100, 308.16, 45.6894, -118.83667]
        ]
    },
    "-54": {
        "48": [
            ["CYQX", 10193, 200, 190.74, 48.948338, -54.560776],
            ["CYQX", 8882, 200, 287.92, 48.94574, -54.551414]
        ],
        "-25": [
            ["SARI", 10827, 148, 294.84, -25.743498, -54.458485],
            ["SBFI", 7197, 148, 311.41, -25.602486, -54.479153],
            ["SGES", 11092, 148, 220.72, -25.443872, -54.832481],
            ["SGIB", 5008, 75, 198.12, -25.401102, -54.61694]
        ],
        "-9": [
            ["SBCC", 8506, 148, 282.38, -9.335821, -54.953316]
        ],
        "-20": [
            ["SBCG", 8546, 141, 221.88, -20.461422, -54.665775]
        ],
        "-28": [
            ["SBNM", 5332, 98, 280.95, -28.283871, -54.161461]
        ],
        "-2": [
            ["SBSN", 7881, 148, 260.72, -2.420678, -54.782131]
        ],
        "-22": [
            ["SSDO", 5282, 98, 216, -22.193291, -54.903454]
        ],
        "-18": [
            ["SSZJ", 5185, 118, 245.1, -18.177694, -54.494984]
        ],
        "-16": [
            ["SWRD", 6070, 98, 185, -16.576975, -54.723412]
        ]
    },
    "-60": {
        "46": [
            ["CYQY", 5995, 150, 165.36, 46.169472, -60.04174],
            ["CYQY", 7064, 200, 225.77, 46.167412, -60.040337]
        ],
        "53": [
            ["CYYR", 11025, 209, 235, 53.32151, -60.405518],
            ["CYYR", 9586, 200, 313.37, 53.315826, -60.40358]
        ],
        "-31": [
            ["SAAP", 6874, 148, 188.46, -31.785477, -60.478714],
            ["SAAV", 7656, 98, 202.8, -31.701672, -60.80582]
        ],
        "-32": [
            ["SAAR", 9883, 0, 191.32, -32.890179, -60.781239]
        ],
        "-26": [
            ["SARS", 5315, 0, 201, -26.746872, -60.489464]
        ],
        "-24": [
            ["SATK", 5906, 0, -9.19, -24.729351, -60.547413]
        ],
        "-36": [
            ["SAZF", 7218, 148, 218, -36.881073, -60.220158]
        ],
        "2": [
            ["SBBV", 8876, 148, 242.92, 2.851888, -60.679176]
        ],
        "-3": [
            ["SBEG", 8854, 148, 270.07, -3.038594, -60.037533]
        ],
        "-12": [
            ["SBVH", 8565, 98, 194.95, -12.683116, -60.095249]
        ],
        "-22": [
            ["SGME", 11524, 131, 177.83, -22.029179, -60.622337]
        ],
        "1": [
            ["SWNP", 7054, 0, 239, 1.243157, -60.478001]
        ],
        "14": [
            ["TFFF", 9830, 147, 259.97, 14.59315, -60.990921],
            ["TLPC", 6228, 148, 255.4, 14.022177, -60.984436]
        ],
        "13": [
            ["TLPL", 8987, 148, 270, 13.733325, -60.940182]
        ],
        "11": [
            ["TTCP", 8996, 159, 274.22, 11.148753, -60.819534]
        ]
    },
    "-122": {
        "53": [
            ["CYQZ", 5493, 200, 329.56, 53.019577, -122.504021],
            ["CYXS", 6051, 150, 257.68, 53.888805, -122.665192],
            ["CYXS", 7389, 150, 348.69, 53.880615, -122.664963]
        ],
        "52": [
            ["CYWL", 7001, 150, 313.98, 52.17638, -122.043312]
        ],
        "49": [
            ["CYXX", 5260, 200, 205.75, 49.031761, -122.369171],
            ["CYXX", 7988, 200, 265.76, 49.020729, -122.34668]
        ],
        "58": [
            ["CYYE", 6366, 200, 237.26, 58.841663, -122.587479]
        ],
        "38": [
            ["KAPC", 5001, 150, 256.71, 38.210861, -122.271515],
            ["KAPC", 5935, 150, 20.69, 38.20797, -122.285278],
            ["KSTS", 5004, 100, 209.1, 38.514721, -122.812737],
            ["KSTS", 5119, 150, 337.25, 38.502323, -122.805679]
        ],
        "48": [
            ["KAWO", 5330, 100, 359.09, 48.154728, -122.156181],
            ["KBLI", 6696, 150, 359.81, 48.783501, -122.537483],
            ["KBVS", 5469, 100, 306.47, 48.468925, -122.412743],
            ["KNRA", 5400, 200, 340, 48.191784, -122.630966],
            ["KNUW", 7985, 200, 266.97, 48.352459, -122.639977],
            ["KNUW", 7994, 0, 334.68, 48.341877, -122.648384]
        ],
        "47": [
            ["KBFI", 9993, 200, 330.24, 47.516777, -122.291573],
            ["KGRF", 6125, 150, 347.11, 47.071022, -122.578011],
            ["KPAE", 9004, 150, 359.14, 47.896626, -122.285309],
            ["KPWT", 6195, 150, 212.75, 47.499626, -122.755875],
            ["KRNT", 5376, 0, 354.17, 47.485794, -122.214638],
            ["KSEA", 9421, 150, 360.34, 47.43779, -122.311241],
            ["KSEA", 11894, 150, 360.34, 47.431007, -122.308014],
            ["KTCM", 10104, 150, 359.75, 47.123817, -122.476379],
            ["KTIW", 5001, 150, 367, 47.261116, -122.579338]
        ],
        "37": [
            ["KCCR", 5004, 150, 203.47, 37.994442, -122.054443],
            ["KHWD", 5021, 150, 299.92, 37.655094, -122.114548],
            ["KNUQ", 8124, 200, 338.71, 37.404533, -122.044601],
            ["KNUQ", 9208, 200, 338.71, 37.405396, -122.042717],
            ["KOAK", 6206, 150, 292.23, 37.722263, -122.205986],
            ["KOAK", 5447, 150, 292.22, 37.724808, -122.204689],
            ["KOAK", 9998, 150, 310.07, 37.701477, -122.214218],
            ["KSFO", 8654, 200, 207.74, 37.627831, -122.366768],
            ["KSFO", 7506, 200, 207.74, 37.627243, -122.370087],
            ["KSFO", 10594, 200, 297.87, 37.611698, -122.358315],
            ["KSFO", 11861, 200, 297.87, 37.613525, -122.357109]
        ],
        "45": [
            ["KHIO", 6596, 150, 323.64, 45.535042, -122.944199],
            ["KPDX", 6995, 150, 224.97, 45.595932, -122.597542],
            ["KPDX", 10985, 150, 299.06, 45.580505, -122.583862],
            ["KPDX", 7989, 150, 299.08, 45.584145, -122.56826],
            ["KSPB", 5098, 100, 348.67, 45.764175, -122.859856],
            ["KTTD", 5389, 150, 268.66, 45.549534, -122.390701],
            ["KUAO", 5003, 100, 367.13, 45.240314, -122.771263]
        ],
        "42": [
            ["KMFR", 8801, 150, 338.8, 42.363708, -122.867386]
        ],
        "46": [
            ["KOLM", 5417, 150, 371.29, 46.963566, -122.906128]
        ],
        "40": [
            ["KRBL", 5686, 100, 348.13, 40.143017, -122.250191],
            ["KRDD", 5060, 150, 320.13, 40.50124, -122.285484],
            ["KRDD", 7008, 150, 360.07, 40.50111, -122.294907]
        ],
        "41": [
            ["KSIY", 7485, 150, 371.05, 41.771358, -122.470749]
        ],
        "44": [
            ["KSLE", 5808, 150, 330.13, 44.903053, -122.996063]
        ]
    },
    "-69": {
        "47": [
            ["CYRI", 6165, 150, 211.32, 47.771946, -69.578598]
        ],
        "43": [
            ["KNHZ", 8001, 200, -5.15, 43.881508, -69.936165],
            ["KNHZ", 8001, 200, 174.85, 43.903366, -69.938896],
            ["KNHZ", 8001, 200, 174.85, 43.903194, -69.941536]
        ],
        "44": [
            ["KWVL", 5498, 100, 208.54, 44.539757, -69.67054]
        ],
        "18": [
            ["MDSD", 11043, 200, 340.76, 18.415358, -69.663658],
            ["MDSI", 7000, 200, 200, 18.512348, -69.758202]
        ],
        "-41": [
            ["SA37", 6890, 0, 258.5, -41.319, -69.562531]
        ],
        "-35": [
            ["SAMM", 5844, 66, 279.93, -35.479481, -69.576553],
            ["SAMM", 8864, 98, 319.92, -35.493069, -69.572723]
        ],
        "-51": [
            ["SAWG", 11623, 148, 265.57, -51.607597, -69.287086]
        ],
        "-38": [
            ["SAZW", 5558, 98, 259, -38.931862, -69.240379]
        ],
        "-4": [
            ["SBTT", 7152, 98, 295.14, -4.25999, -69.926933],
            ["SKLT", 6193, 0, 200.72, -4.185178, -69.939674]
        ],
        "0": [
            ["SBYA", 5249, 98, 233.9, 0.611734, -69.180016]
        ],
        "-20": [
            ["SC1A", 10150, 98, 261, -20.424732, -69.626289]
        ],
        "-26": [
            ["SCES", 7546, 0, 264, -26.312241, -69.754349]
        ],
        "-12": [
            ["SPTU", 11545, 148, 184.98, -12.606443, -69.22081]
        ],
        "9": [
            ["SVAC", 5906, 131, 290.11, 9.553984, -69.227806],
            ["SVGU", 5906, 131, 222, 9.02272, -69.727692]
        ],
        "10": [
            ["SVBM", 9350, 147, 260.91, 10.047921, -69.344215]
        ],
        "11": [
            ["SVCR", 7708, 148, 258.64, 11.419473, -69.67009]
        ],
        "-6": [
            ["SWEI", 5249, 98, 335, -6.673458, -69.914162]
        ]
    },
    "-78": {
        "48": [
            ["CYUY", 7473, 150, 243.96, 48.21069, -78.821739]
        ],
        "40": [
            ["KAOO", 5468, 100, 195.95, 40.303146, -78.317741],
            ["KHMZ", 5003, 75, 307.66, 40.081928, -78.506401],
            ["KJST", 7002, 150, 324.2, 40.308071, -78.827484],
            ["KPSB", 5002, 100, 229.63, 40.88673, -78.080482],
            ["KPSB", 5713, 100, 336.12, 40.879063, -78.083107]
        ],
        "36": [
            ["KAVC", 5007, 75, 178.12, 36.694775, -78.054451],
            ["KLHZ", 5503, 0, 217.41, 36.029339, -78.3246],
            ["KTDF", 5999, 100, 232.04, 36.289711, -78.976563]
        ],
        "41": [
            ["KBFD", 6495, 150, 313.93, 41.79731, -78.632111],
            ["KDUJ", 5497, 100, 242.36, 41.181759, -78.889824]
        ],
        "42": [
            ["KBUF", 8097, 150, 223.89, 42.94722, -78.720657],
            ["KBUF", 7156, 150, 306.71, 42.93523, -78.720306]
        ],
        "39": [
            ["KCBE", 5048, 150, 219, 39.621826, -78.753464],
            ["KOKV", 5499, 100, 313.83, 39.138298, -78.137436]
        ],
        "38": [
            ["KCHO", 6006, 150, 202.08, 38.146263, -78.448929],
            ["KSHD", 6002, 150, 218.14, 38.270317, -78.889954]
        ],
        "34": [
            ["KCPC", 5501, 0, 227.56, 34.277962, -78.70826],
            ["KEYF", 5004, 75, 324.26, 34.59623, -78.574402]
        ],
        "33": [
            ["KCRE", 5998, 100, 225.99, 33.817459, -78.716827],
            ["KMYR", 9519, 150, 348.24, 33.666954, -78.925125]
        ],
        "35": [
            ["KFAY", 7718, 150, 211.12, 35.002438, -78.873695],
            ["KJNX", 5507, 100, 203.36, 35.547871, -78.38665],
            ["KRDU", 7501, 150, 225.07, 35.879158, -78.779381],
            ["KRDU", 10001, 150, 225.07, 35.893814, -78.778015]
        ],
        "43": [
            ["KIAG", 5183, 150, 230.1, 43.110092, -78.932007],
            ["KIAG", 9810, 150, 270.11, 43.109486, -78.931908]
        ],
        "22": [
            ["MUCA", 11591, 148, 243.9, 22.034042, -78.774223],
            ["MUCC", 9841, 148, 250.95, 22.465349, -78.314804],
            ["MUOC", 5250, 65, 255, 22.515194, -78.502472]
        ],
        "26": [
            ["MYGF", 11020, 151, 240.94, 26.566023, -78.680786],
            ["MYGW", 8000, 0, 286, 26.676973, -78.961533],
            ["MYGW", 6200, 0, 346, 26.675076, -78.964363]
        ],
        "-1": [
            ["SEAM", 6317, 82, 192.05, -1.203597, -78.572777]
        ],
        "-2": [
            ["SECU", 6202, 118, 231.64, -2.884151, -78.977768],
            ["SEMC", 8155, 98, 194.39, -2.293447, -78.120956],
            ["SEPC", 5255, 96, 206, -2.745232, -78.260452]
        ],
        "-3": [
            ["SEGZ", 6601, 85, 330, -3.424497, -78.545471]
        ],
        "0": [
            ["SEIB", 6163, 66, 205.34, 0.346385, -78.132774],
            ["SELT", 12187, 148, 4.32, -0.923825, -78.616966],
            ["SEQU", 10278, 151, 351.46, -0.15472, -78.486153]
        ],
        "1": [
            ["SKCO", 5259, 0, 232.54, 1.818676, -78.743614]
        ],
        "-9": [
            ["SPEO", 5932, 98, 182.81, -9.136803, -78.521935]
        ],
        "-7": [
            ["SPJR", 8235, 148, 337.28, -7.149624, -78.48513]
        ]
    },
    "-126": {
        "65": [
            ["CYVQ", 5980, 150, 299.58, 65.277565, -126.781158]
        ]
    },
    "-135": {
        "60": [
            ["CYXY", 9481, 150, 339.3, 60.697548, -135.057999]
        ],
        "58": [
            ["PAGS", 6704, 150, 315.03, 58.419704, -135.69249]
        ],
        "57": [
            ["PASI", 6485, 150, 315.53, 57.040771, -135.350143]
        ]
    },
    "-52": {
        "47": [
            ["CYYT", 5027, 100, 176.2, 47.625439, -52.739487],
            ["CYYT", 8490, 200, 265.95, 47.625267, -52.737156],
            ["CYYT", 6993, 200, 319.15, 47.611359, -52.733288]
        ],
        "-15": [
            ["SBBW", 5248, 98, 234.9, -15.856126, -52.382767]
        ],
        "-27": [
            ["SBCH", 6692, 148, 279.06, -27.135324, -52.648479]
        ],
        "-3": [
            ["SBHT", 6664, 125, 233.65, -3.247208, -52.246098]
        ],
        "0": [
            ["SBMD", 5910, 98, 243.87, -0.88615, -52.594944]
        ],
        "-23": [
            ["SBMG", 6943, 148, 254.78, -23.472988, -52.006279]
        ],
        "-28": [
            ["SBPF", 5576, 75, 247.92, -28.240906, -52.319756],
            ["SSKZ", 5118, 98, 277, -28.322227, -52.80764]
        ],
        "-31": [
            ["SBPK", 6506, 138, 231.49, -31.711653, -52.319706]
        ],
        "4": [
            ["SOCA", 10501, 148, 245.21, 4.82609, -52.347988]
        ],
        "-18": [
            ["SSAD", 5715, 75, 276.006, -18.764814, -52.909321]
        ]
    },
    "-131": {
        "53": [
            ["CYZP", 5072, 150, 324.95, 53.248604, -131.807755]
        ],
        "55": [
            ["PAKT", 7484, 150, 315.62, 55.348206, -131.701096],
            ["PANT", 7493, 150, 325.508, 55.028168, -131.562149]
        ]
    },
    "-3": {
        "30": [
            ["DA11", 9843, 148, 266, 30.880054, -3.052034]
        ],
        "5": [
            ["DIAP", 9879, 164, 202.33, 5.273777, -3.920711]
        ],
        "51": [
            ["EGDX", 5988, 141, 255, 51.407772, -3.420497],
            ["EGFF", 7712, 151, 296.79, 51.391808, -3.328121]
        ],
        "53": [
            ["EGNH", 6117, 151, 274.65, 53.770878, -3.014414],
            ["EGOW", 5496, 150, 210.47, 53.587234, -3.052188]
        ],
        "58": [
            ["EGPC", 5991, 148, 306.98, 58.453846, -3.080528]
        ],
        "55": [
            ["EGPH", 8384, 150, 238.85, 55.955887, -3.355023],
            ["EGPH", 5919, 150, 298.65, 55.94352, -3.334026]
        ],
        "57": [
            ["EGQK", 7553, 151, 250.52, 57.652859, -3.542346],
            ["EGQS", 9069, 150, 223.69, 57.715942, -3.321303],
            ["EGQS", 6054, 150, 276.45, 57.705372, -3.312943]
        ],
        "50": [
            ["EGTE", 6821, 151, 256.11, 50.73653, -3.399478]
        ],
        "34": [
            ["GMMW", 9830, 148, 258.13, 34.992062, -3.011741]
        ],
        "35": [
            ["GMTA", 7100, 148, 352.63, 35.167442, -3.837997]
        ],
        "37": [
            ["LEGR", 9502, 148, 269.47, 37.18885, -3.760999]
        ],
        "40": [
            ["LEGT", 8129, 197, 225.14, 40.301922, -3.713368],
            ["LEMD", 13485, 197, 322.27, 40.455406, -3.546138],
            ["LEMD", 14279, 197, -0.24, 40.49247, -3.574586],
            ["LETO", 12004, 217, 223.33, 40.508713, -3.431013]
        ],
        "43": [
            ["LEXJ", 7864, 148, 290.17, 43.42334, -3.806067]
        ],
        "47": [
            ["LFRH", 5493, 148, 196.14, 47.770645, -3.435602],
            ["LFRH", 7874, 0, 251.74, 47.763004, -3.428767]
        ],
        "48": [
            ["LFRO", 5551, 148, 287.59, 48.751995, -3.460658],
            ["LFRU", 5298, 118, 220.05, 48.608864, -3.80876]
        ]
    },
    "0": {
        "32": [
            ["DA12", 6608, 105, 296.007, 32.894539, 0.534382]
        ],
        "26": [
            ["DAAN", 8216, 98, 251.9, 26.713543, 0.29766]
        ],
        "33": [
            ["DAAY", 11780, 150, 231.9, 33.544067, -0.229615],
            ["DAAY", 9436, 100, 340.909, 33.510487, -0.231531]
        ],
        "35": [
            ["DAOE", 9834, 148, 244.8, 35.742836, -0.789396],
            ["DAOL", 9037, 140, 255.9, 35.545471, -0.517498],
            ["DAOO", 10044, 148, 246.85, 35.629158, -0.605536],
            ["DAOV", 5570, 98, 261.97, 35.209297, 0.155532]
        ],
        "27": [
            ["DAUA", 9856, 148, 218.9, 27.848326, -0.177051]
        ],
        "29": [
            ["DAUT", 9883, 148, 236.4, 29.244167, 0.28891]
        ],
        "5": [
            ["DGAA", 11195, 200, 201.9, 5.616611, -0.161918]
        ],
        "9": [
            ["DGLE", 7988, 148, 221.58, 9.565, -0.855821]
        ],
        "53": [
            ["EGCN", 9485, 200, 198, 53.486809, -0.996579],
            ["EGNE", 5514, 98, 204.98, 53.287403, -0.946045],
            ["EGNJ", 7194, 148, 202.35, 53.583462, -0.34451],
            ["EGXC", 8969, 200, 251.9, 53.096977, -0.146657],
            ["EGXP", 8973, 0, 221.12, 53.317211, -0.537286],
            ["EGXW", 8983, 0, 201.67, 53.177555, -0.516317],
            ["EGXY", 5994, 150, 243.5, 53.02457, -0.903926],
            ["EGYD", 6819, 147, 262.7, 53.030926, -0.47728]
        ],
        "51": [
            ["EGGW", 7075, 151, 254.39, 51.877235, -0.353325],
            ["EGKB", 5820, 148, 205.68, 51.33836, 0.038144],
            ["EGKK", 10352, 148, 257.63, 51.151207, -0.16797],
            ["EGKK", 8394, 148, 257.62, 51.151794, -0.176961],
            ["EGLF", 8007, 148, 242, 51.280556, -0.76259],
            ["EGLL", 11978, 148, 269.7, 51.464943, -0.434046],
            ["EGLL", 12786, 164, 269.69, 51.477676, -0.433031],
            ["EGMC", 5933, 121, 234.33, 51.576035, 0.705934],
            ["EGSS", 9984, 150, 222.85, 51.895157, 0.250072],
            ["EGSX", 6299, 148, 198, 51.729832, 0.157047],
            ["EGTD", 6009, 0, 247.08, 51.120274, -0.524147],
            ["EGVO", 6010, 141, 272.61, 51.233753, -0.929606],
            ["EGWU", 5515, 151, 249.83, 51.555912, -0.408522]
        ],
        "50": [
            ["EGMD", 5025, 121, 212.25, 50.961922, 0.944996]
        ],
        "52": [
            ["EGSC", 6429, 151, 229.86, 52.210751, 0.186117],
            ["EGTC", 5896, 0, 211.71, 52.079063, -0.609695],
            ["EGUL", 8975, 150, 235.66, 52.416344, 0.577677],
            ["EGUN", 9193, 200, 282.99, 52.358662, 0.508201],
            ["EGUW", 7936, 151, 227.86, 52.134335, 0.968597],
            ["EGUY", 8235, 200, 262.64, 52.35854, -0.089534],
            ["EGXH", 9012, 200, 262.9, 52.344341, 0.793085],
            ["EGXJ", 8989, 197, 221.29, 52.745037, -0.635284],
            ["EGXT", 9032, 200, 253.2, 52.616592, -0.456634],
            ["EGYE", 6021, 151, 245, 52.965431, -0.548942],
            ["EGYM", 5994, 300, 188.66, 52.65543, 0.559805],
            ["EGYM", 9115, 200, 235.41, 52.655342, 0.567432]
        ],
        "16": [
            ["GAGO", 8223, 148, 242.41, 16.253706, 0.005065]
        ],
        "20": [
            ["GATS", 8217, 0, 225.67, 20.250895, 0.985838]
        ],
        "38": [
            ["LEAL", 9806, 148, 280.07, 38.279812, -0.541288]
        ],
        "37": [
            ["LELC", 7553, 197, 225.69, 37.782192, -0.802816]
        ],
        "39": [
            ["LEVC", 5544, 148, 218.31, 39.494106, -0.476684],
            ["LEVC", 8890, 148, 296.23, 39.483589, -0.466578]
        ],
        "44": [
            ["LFBA", 7095, 98, 292.21, 44.170448, 0.605175],
            ["LFBD", 10176, 148, 225.42, 44.838692, -0.700975],
            ["LFBD", 7925, 148, 286.45, 44.825401, -0.699871],
            ["LFBE", 7224, 148, 274.35, 44.823769, 0.53265]
        ],
        "45": [
            ["LFBG", 7941, 148, 229.62, 45.66251, -0.300669],
            ["LFBG", 6190, 197, 263.25, 45.663597, -0.301136],
            ["LFBU", 5928, 148, 276.94, 45.728527, 0.230234],
            ["LFBX", 5740, 98, 293.66, 45.193783, 0.8272],
            ["LFDN", 7470, 148, 302.66, 45.885109, -0.972498]
        ],
        "46": [
            ["LFBI", 7722, 148, 210.56, 46.597855, 0.315774],
            ["LFBN", 5838, 98, 247.39, 46.314491, -0.390713]
        ],
        "43": [
            ["LFBM", 11804, 148, 267.21, 43.912285, -0.486951],
            ["LFBP", 8193, 148, 305.85, 43.374496, -0.40822],
            ["LFBT", 9850, 148, 200.3, 43.191929, 0.0004]
        ],
        "47": [
            ["LFJR", 5898, 148, 261.12, 47.561371, -0.301092],
            ["LFOT", 7884, 148, 195.24, 47.442654, 0.731807]
        ],
        "49": [
            ["LFOH", 7538, 130, 223.12, 49.541618, 0.099344],
            ["LFRG", 8357, 148, 297.19, 49.360035, 0.17005],
            ["LFRK", 6220, 148, 305.31, 49.169922, -0.444365]
        ],
        "48": [
            ["LFOV", 5022, 98, 322.34, 48.026192, -0.736916]
        ]
    },
    "-5": {
        "28": [
            ["DA13", 7740, 100, 231.5, 28.885859, -5.813411]
        ],
        "7": [
            ["DIBK", 10872, 148, 203.92, 7.752465, -5.067654]
        ],
        "9": [
            ["DIKO", 6890, 98, 259.83, 9.38879, -5.547303]
        ],
        "6": [
            ["DIYO", 9888, 148, 221.59, 6.913258, -5.357067]
        ],
        "54": [
            ["EGAC", 5990, 148, 214.75, 54.625568, -5.863689]
        ],
        "50": [
            ["EGDO", 5950, 151, 224, 50.007034, -5.222003],
            ["EGDR", 5990, 151, 293.05, 50.081444, -5.24207]
        ],
        "55": [
            ["EGEC", 9994, 151, 286.08, 55.433586, -5.663465]
        ],
        "11": [
            ["GASO", 5245, 100, 250.58, 11.600265, -5.792808]
        ],
        "33": [
            ["GMFI", 6890, 115, 206, 33.513527, -5.153934],
            ["GMFM", 6420, 164, 258.6, 33.88583, -5.509433],
            ["GMFM", 9252, 164, 264.6, 33.874794, -5.494998]
        ],
        "35": [
            ["GMTN", 7550, 148, 234.37, 35.600391, -5.309623],
            ["GMTT", 11421, 148, 276.54, 35.729801, -5.902365]
        ],
        "42": [
            ["LELN", 5382, 148, 225.27, 42.594193, -5.648433]
        ],
        "37": [
            ["LEMO", 11794, 200, 199.46, 37.189663, -5.609653],
            ["LEZL", 11017, 148, 269.76, 37.417999, -5.874069]
        ],
        "40": [
            ["LESA", 8248, 197, 207.86, 40.962025, -5.49505]
        ],
        "36": [
            ["LXGB", 6187, 150, 267.55, 36.151581, -5.33918]
        ]
    },
    "-7": {
        "27": [
            ["DA16", 6565, 140, 264.2, 27.583729, -7.489618],
            ["DA16", 7765, 140, 263.8, 27.58621, -7.488122],
            ["DA16", 12700, 98, 263.8, 27.588758, -7.48072]
        ],
        "7": [
            ["DIMN", 6726, 0, 204, 7.275852, -7.58073]
        ],
        "55": [
            ["EGAE", 6030, 147, 253.11, 55.045231, -7.147243]
        ],
        "57": [
            ["EGPL", 6011, 151, 235.46, 57.485775, -7.349991]
        ],
        "12": [
            ["GABS", 8890, 148, 236.56, 12.540257, -7.93952]
        ],
        "33": [
            ["GMMC", 6178, 0, 199.95, 33.564526, -7.658063],
            ["GMMN", 12197, 148, 344.01, 33.350868, -7.586411],
            ["GMMN", 12282, 148, 344.01, 33.351704, -7.582447]
        ],
        "16": [
            ["GQNI", 6887, 100, 264.97, 16.605648, -7.290122]
        ],
        "38": [
            ["LPBJ", 9690, 98, 185.92, 38.091881, -7.928224],
            ["LPBJ", 11331, 197, 185.91, 38.094353, -7.930364]
        ],
        "37": [
            ["LPFR", 8166, 148, 280.06, 37.013371, -7.958517]
        ]
    },
    "2": {
        "36": [
            ["DAAB", 5833, 150, 247.8, 36.507725, 2.821826],
            ["DAAK", 11883, 148, 224.8, 36.557434, 2.890614]
        ],
        "35": [
            ["DAAQ", 10696, 148, 91.8, 35.524734, 2.860718],
            ["DAAQ", 10696, 148, 271.8, 35.523811, 2.896749],
            ["DAAQ", 10696, 148, 271.8, 35.526131, 2.896775]
        ],
        "30": [
            ["DAUE", 5860, 148, 282.44, 30.566809, 2.876004],
            ["DAUE", 9820, 148, -0.32, 30.572468, 2.861576]
        ],
        "27": [
            ["DAUI", 9845, 148, 231.14, 27.259159, 2.523632]
        ],
        "33": [
            ["DAUL", 12477, 148, 337.812, 33.748173, 2.935069],
            ["DAUL", 12486, 148, 337.813, 33.748878, 2.937173]
        ],
        "6": [
            ["DBBB", 7893, 148, 232.92, 6.363717, 2.393117]
        ],
        "13": [
            ["DRRN", 9876, 0, 267.3, 13.482943, 2.197247]
        ],
        "51": [
            ["EBFN", 9635, 164, 291.33, 51.086235, 2.670935],
            ["EBOS", 10460, 148, 256.28, 51.203354, 2.89703]
        ],
        "41": [
            ["LEBL", 8334, 148, 198.95, 41.309399, 2.094716],
            ["LEBL", 8722, 197, 245.53, 41.292213, 2.103305],
            ["LEBL", 11646, 148, 245.53, 41.305527, 2.103194],
            ["LEGE", 7874, 148, 195.75, 41.915691, 2.766126]
        ],
        "39": [
            ["LEPA", 9836, 148, 238.53, 39.555462, 2.761831],
            ["LEPA", 10720, 148, 238.52, 39.562496, 2.743215],
            ["LEPA", 8184, 0, 238.52, 39.560486, 2.743419]
        ],
        "46": [
            ["LFBK", 6231, 148, 348.02, 46.214294, 2.36634]
        ],
        "43": [
            ["LFCI", 5132, 98, 269.33, 43.9133, 2.120303],
            ["LFCK", 5993, 98, 321.23, 43.549786, 2.296323],
            ["LFMK", 6722, 148, 276.29, 43.215034, 2.318247]
        ],
        "44": [
            ["LFCR", 6706, 148, 308.97, 44.402103, 2.492631],
            ["LFLW", 5574, 98, 329.9, 44.884506, 2.427409]
        ],
        "47": [
            ["LFLD", 5078, 148, 238.79, 47.063755, 2.377292],
            ["LFOA", 11476, 148, 240.33, 47.063526, 2.65188]
        ],
        "42": [
            ["LFMP", 8184, 148, 328.34, 42.734993, 2.877757]
        ],
        "49": [
            ["LFOB", 7957, 148, 303.69, 49.446198, 2.131761],
            ["LFPC", 7859, 164, 245.15, 49.258091, 2.534226],
            ["LFPG", 13757, 148, 265.32, 49.02364, 2.570397],
            ["LFPG", 8841, 197, 265.33, 49.026657, 2.561729],
            ["LFPT", 5532, 164, 224.6, 49.098507, 2.04357],
            ["LFPT", 5411, 164, 298.14, 49.09494, 2.045541]
        ],
        "48": [
            ["LFPB", 8732, 197, 204.82, 48.970455, 2.442163],
            ["LFPB", 9845, 148, 247.81, 48.973621, 2.456799],
            ["LFPB", 6069, 148, 265.25, 48.965054, 2.445651],
            ["LFPG", 8840, 197, 265.48, 48.994743, 2.602502],
            ["LFPG", 13813, 148, 265.37, 48.99865, 2.610361],
            ["LFPM", 6468, 0, 283.52, 48.602325, 2.689327],
            ["LFPO", 7866, 197, 198.34, 48.738018, 2.386979],
            ["LFPO", 11961, 148, 241.84, 48.7355, 2.360865],
            ["LFPO", 10882, 148, 254.4, 48.727364, 2.40176],
            ["LFPV", 5936, 148, 268.31, 48.774601, 2.213953],
            ["LFPY", 9833, 0, 223.11, 48.610909, 2.353234],
            ["LFPY", 7157, 0, 291.61, 48.590733, 2.352098]
        ],
        "50": [
            ["LFQT", 6028, 98, 217.45, 50.624947, 2.650155]
        ]
    },
    "4": {
        "35": [
            ["DAAD", 7221, 98, 221.91, 35.340309, 4.213911]
        ],
        "8": [
            ["DNIL", 10192, 197, 227.86, 8.449092, 4.505199]
        ],
        "9": [
            ["DNIX", 10966, 0, 216, 9.904812, 4.494418]
        ],
        "51": [
            ["EBAW", 5392, 148, 289.77, 51.18729, 4.475017],
            ["EBWE", 9777, 147, 248, 51.399189, 4.979092],
            ["EBZR", 9777, 148, 228, 51.273693, 4.769259],
            ["EHGR", 6179, 98, 197.46, 51.572327, 4.94184],
            ["EHGR", 8339, 148, 280.07, 51.565331, 4.950033],
            ["EHRD", 7213, 148, 237.09, 51.96283, 4.455163],
            ["EHWO", 7978, 148, 249.49, 51.452824, 4.358528]
        ],
        "50": [
            ["EBBE", 7949, 74, 218.94, 50.763145, 4.783195],
            ["EBBE", 10586, 148, 218.23, 50.768841, 4.781146],
            ["EBBR", 9786, 164, 194.44, 50.912849, 4.502001],
            ["EBBR", 10521, 148, 249.94, 50.898933, 4.523357],
            ["EBBR", 11918, 148, 245.42, 50.912643, 4.50325],
            ["EBCI", 8352, 148, 245.64, 50.46487, 4.469983],
            ["EBFS", 6722, 74, 259.63, 50.239742, 4.662429],
            ["EBFS", 10952, 148, 258.96, 50.246502, 4.67273]
        ],
        "52": [
            ["EHAM", 6619, 148, 221.24, 52.314022, 4.803041],
            ["EHAM", 11430, 148, 237.91, 52.304592, 4.7776],
            ["EHAM", 11303, 148, 266.8, 52.318367, 4.796954],
            ["EHAM", 12453, 198, 3.19, 52.328487, 4.708827],
            ["EHAM", 11134, 148, 3.25, 52.290836, 4.777386],
            ["EHAM", 10812, 148, 3.22, 52.301762, 4.737279],
            ["EHVB", 8010, 148, 231.54, 52.172997, 4.432024]
        ],
        "39": [
            ["LEMH", 7716, 0, 188.98, 39.872162, 4.22062],
            ["LESL", 6070, 148, 200, 39.870037, 4.262044]
        ],
        "44": [
            ["LF51", 6562, 98, 342.01, 44.169804, 4.923734],
            ["LFLU", 6889, 148, 187.75, 44.931065, 4.971724],
            ["LFMO", 7895, 197, 324.22, 44.131325, 4.877373]
        ],
        "48": [
            ["LFFN", 8025, 148, 279.01, 48.42915, 4.49845],
            ["LFOK", 12639, 148, 281.24, 48.77282, 4.209966],
            ["LFQB", 5416, 98, 353.76, 48.314751, 4.017751],
            ["LFSI", 7908, 148, 293.05, 48.631756, 4.9145]
        ],
        "46": [
            ["LFLN", 6669, 148, 328.14, 46.40649, 4.02111],
            ["LFLO", 5796, 98, 196.25, 46.062347, 4.003662]
        ],
        "45": [
            ["LFLY", 6000, 148, 343.43, 45.719238, 4.947653],
            ["LFMH", 7559, 148, 354.93, 45.530415, 4.297773]
        ],
        "43": [
            ["LFMI", 12304, 197, 332.68, 43.507782, 4.934639],
            ["LFMV", 6188, 148, 349.03, 43.899063, 4.904059],
            ["LFTW", 8018, 148, 357.02, 43.746445, 4.417138]
        ],
        "49": [
            ["LFSR", 8133, 157, 247.47, 49.314247, 4.065936]
        ]
    },
    "5": {
        "36": [
            ["DAAE", 7837, 148, 260.33, 36.713608, 5.083078],
            ["DAAS", 6315, 0, 267, 36.178577, 5.335208],
            ["DAAV", 7893, 148, 351.12, 36.784439, 5.875559]
        ],
        "22": [
            ["DAAT", 11865, 148, 201.93, 22.826464, 5.457593],
            ["DAAT", 10164, 148, 260.97, 22.811584, 5.452642]
        ],
        "34": [
            ["DAUB", 9469, 148, 310.109, 34.785, 5.750403]
        ],
        "31": [
            ["DAUU", 9843, 148, 196, 31.939274, 5.418269]
        ],
        "5": [
            ["DN56", 5085, 98, 305.805, 5.621241, 5.198067]
        ],
        "7": [
            ["DNAK", 9186, 148, 210, 7.255435, 5.306919]
        ],
        "6": [
            ["DNBE", 7892, 148, 225.46, 6.327456, 5.610538]
        ],
        "12": [
            ["DNSO", 9844, 197, 256.63, 12.919012, 5.22037]
        ],
        "14": [
            ["DRRT", 7054, 98, 240, 14.877857, 5.268759]
        ],
        "51": [
            ["EBBL", 7874, 75, 230, 51.173931, 5.484881],
            ["EBBL", 10065, 148, 229.74, 51.17728, 5.486852],
            ["EHEH", 9834, 148, 214.98, 51.461178, 5.386919],
            ["EHVK", 8981, 74, 237.23, 51.66222, 5.726139],
            ["EHVK", 9012, 148, 237.82, 51.663826, 5.724696]
        ],
        "49": [
            ["EBBX", 7874, 148, 238, 49.897385, 5.238104],
            ["LF52", 7874, 148, 231, 49.032253, 5.888866],
            ["LFQE", 7870, 0, 193.54, 49.237404, 5.676089]
        ],
        "50": [
            ["EBLG", 10773, 148, 225.21, 50.648006, 5.460969],
            ["EBLG", 7617, 148, 225.2, 50.646107, 5.453633],
            ["EBSL", 9777, 148, 235, 50.955181, 5.60799],
            ["EBST", 9809, 164, 239.21, 50.795906, 5.212348],
            ["EBSU", 8530, 147, 248, 50.038544, 5.456887],
            ["EHBK", 8196, 0, 212.6, 50.920769, 5.779244]
        ],
        "52": [
            ["EHDL", 7873, 164, 196.86, 52.069996, 5.87701],
            ["EHSB", 6989, 148, 271, 52.127159, 5.291862]
        ],
        "53": [
            ["EHLW", 7828, 164, 235.48, 53.231331, 5.767359],
            ["EHLW", 6559, 164, 270.53, 53.2285, 5.769693]
        ],
        "60": [
            ["ENBR", 9789, 148, 350.54, 60.280136, 5.222586]
        ],
        "59": [
            ["ENHD", 6937, 148, 314.31, 59.337368, 5.224229]
        ],
        "58": [
            ["ENZV", 8016, 148, 286.31, 58.875618, 5.645542],
            ["ENZV", 8364, 197, -0.88, 58.870758, 5.638011]
        ],
        "47": [
            ["LFGJ", 7308, 0, 234.31, 47.044773, 5.43921],
            ["LFSD", 5994, 118, 195.03, 47.280132, 5.088367],
            ["LFSD", 7870, 148, 355, 47.255058, 5.096357]
        ],
        "45": [
            ["LFLB", 6630, 148, 356.73, 45.628864, 5.880973],
            ["LFLL", 13115, 148, 355.14, 45.710743, 5.090302],
            ["LFLL", 8757, 148, 355.14, 45.711002, 5.094783],
            ["LFLS", 9989, 148, 270.23, 45.362888, 5.348873],
            ["LFXA", 6548, 98, 187.54, 45.997066, 5.329851]
        ],
        "43": [
            ["LFMA", 5254, 98, 325.68, 43.499454, 5.372915],
            ["LFML", 7784, 148, 314.86, 43.425873, 5.22435],
            ["LFML", 11485, 148, 314.02, 43.42754, 5.22808],
            ["LFMQ", 5751, 98, 306.86, 43.247856, 5.793885],
            ["LFMY", 6565, 148, 339.68, 43.598763, 5.113032]
        ],
        "48": [
            ["LFSL", 7869, 0, 215.75, 48.788807, 5.989421],
            ["LFSO", 7873, 148, 199.57, 48.593384, 5.959998],
            ["LFYD", 7863, 148, 247.96, 48.090237, 5.679048]
        ],
        "44": [
            ["LFXI", 5537, 0, 335.2, 44.049892, 5.500041]
        ]
    },
    "3": {
        "36": [
            ["DAAG", 11496, 197, 232.99, 36.713257, 3.251994],
            ["DAAG", 11469, 148, 271.76, 36.69109, 3.209978]
        ],
        "32": [
            ["DAFH", 9835, 148, 259.8, 32.932808, 3.327359],
            ["DAUG", 10164, 197, 302.55, 32.36916, 3.822802]
        ],
        "7": [
            ["DNIB", 7944, 147, 220.33, 7.369134, 3.985068]
        ],
        "6": [
            ["DNMM", 9050, 0, 179.8, 6.5962, 3.329533],
            ["DNMM", 12761, 0, 179.55, 6.586666, 3.312223]
        ],
        "50": [
            ["EBCV", 6303, 164, 259.99, 50.577358, 3.844778],
            ["EBKT", 6577, 148, 241.92, 50.822887, 3.221912],
            ["LFAV", 5511, 148, 290.83, 50.323135, 3.472232],
            ["LFQI", 8248, 164, 274.08, 50.221035, 3.171876],
            ["LFQQ", 5149, 98, 194.84, 50.57378, 3.091146],
            ["LFQQ", 9257, 148, 257.39, 50.56839, 3.1218]
        ],
        "51": [
            ["EBUL", 9777, 148, 249, 51.148968, 3.49551]
        ],
        "43": [
            ["LFCM", 5564, 98, 322.27, 43.983513, 3.189251],
            ["LFMT", 8534, 164, 304.75, 43.572765, 3.98224],
            ["LFMU", 5961, 98, 274.39, 43.322788, 3.364828]
        ],
        "47": [
            ["LFLA", 5415, 98, 185.48, 47.85778, 3.498214]
        ],
        "45": [
            ["LFLC", 9878, 148, 261.98, 45.788593, 3.189187]
        ],
        "46": [
            ["LFLV", 7212, 148, 188.06, 46.179497, 3.405611],
            ["LFQG", 5380, 98, 302.01, 46.998913, 3.122031]
        ]
    },
    "9": {
        "24": [
            ["DAAJ", 7896, 148, 201.92, 24.294096, 9.451997],
            ["DAAJ", 9850, 148, 305.1, 24.276867, 9.477094]
        ],
        "28": [
            ["DAUZ", 9901, 148, 226.81, 28.063515, 9.657362],
            ["DAUZ", 7228, 98, 324.99, 28.051823, 9.64244]
        ],
        "37": [
            ["DTTB", 9845, 166, 263, 37.243866, 9.803423]
        ],
        "31": [
            ["DTTR", 8853, 148, 292.07, 31.697016, 9.281117]
        ],
        "48": [
            ["EDDS", 10955, 148, 254, 48.694046, 9.244017],
            ["EDTM", 5244, 98, 255.97, 48.05563, 9.383586],
            ["ETHL", 5402, 98, 273.22, 48.219662, 9.921352]
        ],
        "52": [
            ["EDDV", 7659, 148, 272.61, 52.454025, 9.71118],
            ["EDDV", 12444, 148, 272.59, 52.466824, 9.704196],
            ["ETHB", 6020, 148, 257.85, 52.280178, 9.095459],
            ["ETNW", 5585, 156, 206.85, 52.458664, 9.438344],
            ["ETNW", 6142, 153, 262.04, 52.458496, 9.440858]
        ],
        "53": [
            ["EDHI", 8617, 148, 231.61, 53.542572, 9.850946]
        ],
        "47": [
            ["EDNY", 7720, 148, 240.1, 47.676624, 9.525192]
        ],
        "49": [
            ["EDTY", 5044, 98, 278.79, 49.117279, 9.794139],
            ["ETEU", 6990, 100, 257.98, 49.650913, 9.98193]
        ],
        "55": [
            ["EKBI", 10152, 148, 266.86, 55.741238, 9.181771],
            ["EKSP", 9729, 80, 285.45, 55.215588, 9.28836],
            ["EKSP", 9841, 150, 285.45, 55.2174, 9.289515]
        ],
        "56": [
            ["EKKA", 9585, 150, 269.33, 56.297451, 9.124668],
            ["EKKA", 9794, 75, 269.32, 56.2994, 9.125995]
        ],
        "54": [
            ["EKSB", 5883, 98, 319.38, 54.956699, 9.803173],
            ["ETME", 8006, 0, 189.37, 54.635666, 9.349005],
            ["ETNH", 7982, 98, 259.47, 54.314163, 9.556533],
            ["ETNS", 7969, 98, 227.85, 54.46666, 9.530356]
        ],
        "57": [
            ["EKYT", 8344, 74, 263.28, 57.094585, 9.877279],
            ["EKYT", 8689, 148, 263.26, 57.096508, 9.876913]
        ],
        "61": [
            ["ENFG", 6707, 148, 329.44, 61.002853, 9.30284]
        ],
        "63": [
            ["ENOL", 8879, 148, 334.03, 63.687958, 9.616036]
        ],
        "1": [
            ["FGBT", 6577, 0, 220.94, 1.911106, 9.811603]
        ],
        "4": [
            ["FKKD", 9367, 148, 296.9, 4.000242, 9.730994]
        ],
        "-1": [
            ["FOOH", 5578, 98, 314, -1.588632, 9.272172]
        ],
        "0": [
            ["FOOL", 9884, 148, 334.15, 0.446414, 9.418161]
        ],
        "30": [
            ["HLTD", 6516, 131, 190, 30.15465, 9.719018],
            ["HLTD", 11811, 148, 240, 30.155586, 9.725413]
        ],
        "42": [
            ["LFKB", 8268, 148, 342.81, 42.541828, 9.488278]
        ],
        "41": [
            ["LFKF", 8132, 148, 227.48, 41.509796, 9.107944],
            ["LFKS", 8623, 148, 358.95, 41.912594, 9.405643]
        ],
        "39": [
            ["LIEE", 9155, 148, 318.04, 39.242134, 9.065132]
        ],
        "40": [
            ["LIEO", 8017, 148, 235.35, 40.904949, 9.52967]
        ],
        "45": [
            ["LIME", 9603, 148, 284.86, 45.664413, 9.725449],
            ["LIML", 8009, 197, 355.67, 45.434307, 9.278229]
        ],
        "44": [
            ["LIMS", 9791, 148, 299.29, 44.909134, 9.739562]
        ],
        "46": [
            ["LSZS", 5902, 130, 208.97, 46.5415, 9.88957]
        ]
    },
    "6": {
        "36": [
            ["DAAM", 7226, 0, 260.2, 36.110378, 6.376688],
            ["DABC", 7875, 148, 316.17, 36.268887, 6.633356],
            ["DABC", 9843, 148, 339.27, 36.262772, 6.62251]
        ],
        "35": [
            ["DABT", 9316, 148, 240, 35.768074, 6.331652]
        ],
        "31": [
            ["DAUH", 9914, 0, 184.21, 31.686407, 6.141545]
        ],
        "33": [
            ["DAUK", 9829, 148, 188.45, 33.086658, 6.091947],
            ["DAUO", 6599, 98, 197.92, 33.512772, 6.782506],
            ["DAUO", 9868, 148, 310.29, 33.509995, 6.786688]
        ],
        "9": [
            ["DNMN", 11155, 145, 226.1, 9.646959, 6.46245]
        ],
        "5": [
            ["DNPO", 9884, 197, 208.14, 5.027406, 6.955945]
        ],
        "51": [
            ["EDDL", 9830, 148, 232.74, 51.295921, 6.78626],
            ["EDDL", 8846, 148, 232.74, 51.29837, 6.779547],
            ["EDLE", 5086, 148, 245.98, 51.405514, 6.949098],
            ["EDLV", 7987, 148, 272.03, 51.602016, 6.159798]
        ],
        "49": [
            ["EDRB", 10013, 148, 234.97, 49.952858, 6.581818],
            ["ELLX", 13086, 197, 240.31, 49.635555, 6.235597],
            ["ETAD", 10008, 148, 224.64, 49.987156, 6.714707],
            ["LFSF", 7869, 148, 189.77, 49.082928, 6.135555]
        ],
        "53": [
            ["EHGG", 5893, 148, 231.84, 53.124947, 6.590285]
        ],
        "52": [
            ["EHTW", 7857, 148, 235.09, 52.281998, 6.903525],
            ["EHTW", 5356, 82, 291.28, 52.265495, 6.896018]
        ],
        "62": [
            ["ENAL", 7575, 148, 244.66, 62.564785, 6.130426]
        ],
        "58": [
            ["ENLI", 7998, 148, 311.13, 58.092495, 6.641652]
        ],
        "50": [
            ["ETNG", 9992, 147, 270.77, 50.960644, 6.063506],
            ["ETNN", 7994, 148, 246.72, 50.835491, 6.674028]
        ],
        "0": [
            ["FPST", 6895, 148, 283.51, 0.375959, 6.721254]
        ],
        "48": [
            ["LFJL", 8183, 148, 219.17, 48.990837, 6.26212],
            ["LFSG", 8802, 147, 265.07, 48.326206, 6.087814]
        ],
        "45": [
            ["LFLP", 5289, 98, 218.56, 45.934902, 6.105366]
        ],
        "43": [
            ["LFMD", 5573, 148, 352.66, 43.540264, 6.952223],
            ["LFTF", 6591, 98, 290.28, 43.244774, 6.138478],
            ["LFTH", 6957, 148, 231.25, 43.106468, 6.161594],
            ["LFTH", 6302, 164, 315.13, 43.089493, 6.156721]
        ],
        "47": [
            ["LFSM", 5533, 66, 259.47, 47.488041, 6.802455],
            ["LFSX", 7622, 118, 217.84, 47.79369, 6.376236],
            ["LFSX", 7969, 148, 293.11, 47.783009, 6.364433]
        ],
        "46": [
            ["LSGG", 12789, 164, 225.48, 46.250439, 6.127154],
            ["LSMP", 9376, 130, 228, 46.851807, 6.929033]
        ]
    },
    "8": {
        "26": [
            ["DAAP", 9968, 148, 270.58, 26.72361, 8.637806]
        ],
        "35": [
            ["DABS", 9797, 148, 293.13, 35.427776, 8.138915],
            ["DABS", 7878, 98, 301.81, 35.424164, 8.13224]
        ],
        "4": [
            ["DNCA", 8060, 148, 207.64, 4.985409, 8.353342]
        ],
        "9": [
            ["DNJO", 9770, 148, 278.95, 9.637775, 8.883912]
        ],
        "12": [
            ["DNKN", 8550, 148, 224.51, 12.054654, 8.537728],
            ["DNKN", 10841, 197, 241.02, 12.056024, 8.533226]
        ],
        "7": [
            ["DNMK", 9830, 164, 232, 7.712176, 8.624658]
        ],
        "16": [
            ["DRZA", 7563, 98, 248.06, 16.968742, 8.007101]
        ],
        "13": [
            ["DRZR", 6000, 98, 232.62, 13.787622, 8.993538]
        ],
        "36": [
            ["DTKA", 9367, 148, 273.06, 36.979477, 8.89115]
        ],
        "34": [
            ["DTTF", 9467, 148, 228.43, 34.430729, 8.834278]
        ],
        "33": [
            ["DTTZ", 10531, 148, 270.08, 33.939583, 8.118472]
        ],
        "50": [
            ["EDDF", 13102, 148, 249.62, 50.04002, 8.586417],
            ["EDDF", 13099, 197, 249.62, 50.045124, 8.587026],
            ["EDGS", 5303, 98, 308.07, 50.703781, 8.090743],
            ["ETOU", 7055, 120, 253.31, 50.052593, 8.339827]
        ],
        "53": [
            ["EDDW", 6678, 148, 267.84, 53.047256, 8.804875],
            ["EDWD", 6225, 0, 334.96, 53.134758, 8.630013],
            ["ETMN", 8000, 148, 258.61, 53.769829, 8.676698]
        ],
        "51": [
            ["EDLP", 7136, 148, 236.76, 51.61945, 8.629503],
            ["ETUO", 7373, 150, 270.45, 51.922695, 8.322725]
        ],
        "48": [
            ["EDSB", 9800, 148, 211.74, 48.790775, 8.091232]
        ],
        "54": [
            ["EDXW", 5553, 148, 239.63, 54.917107, 8.352014],
            ["EDXW", 6942, 0, 324.48, 54.903847, 8.352112]
        ],
        "55": [
            ["EKEB", 8507, 148, 259.49, 55.528099, 8.573988]
        ],
        "57": [
            ["EKTS", 5236, 148, 280.1, 57.067535, 8.718229]
        ],
        "58": [
            ["ENCN", 6648, 148, 214.99, 58.21167, 8.095282]
        ],
        "60": [
            ["ENDI", 5900, 148, 256.62, 60.419579, 8.529782]
        ],
        "3": [
            ["FGSL", 9674, 151, 221.79, 3.765178, 8.717567]
        ],
        "0": [
            ["FOOG", 6261, 148, 202.23, -0.703863, 8.757634]
        ],
        "42": [
            ["LFKC", 7590, 131, 359.83, 42.520432, 8.793026]
        ],
        "41": [
            ["LFKJ", 7898, 148, 204.92, 41.931454, 8.807161]
        ],
        "40": [
            ["LIEA", 9848, 148, 204.55, 40.644417, 8.298168]
        ],
        "39": [
            ["LIED", 8565, 74, 347.2, 39.34243, 8.975032],
            ["LIED", 10745, 148, 347.01, 39.340622, 8.97901]
        ],
        "45": [
            ["LIMC", 12863, 197, 349.04, 45.611004, 8.728257],
            ["LIMC", 12862, 197, 349.05, 45.614738, 8.737782],
            ["LIMN", 9759, 94, 347.55, 45.518082, 8.673045]
        ],
        "44": [
            ["LIMJ", 9564, 148, 285.33, 44.408493, 8.859499]
        ],
        "46": [
            ["LSMC", 6890, 0, 234, 46.506718, 8.306759],
            ["LSMM", 6571, 0, 274.8, 46.743408, 8.123105],
            ["LSPM", 6523, 131, 290.03, 46.508465, 8.704759],
            ["LSZC", 6544, 130, 244.37, 46.978264, 8.40877]
        ],
        "47": [
            ["LSMD", 7726, 130, 288, 47.395184, 8.663106],
            ["LSME", 8208, 130, 216.9, 47.101372, 8.315045],
            ["LSZH", 8186, 197, 275.99, 47.456596, 8.570475],
            ["LSZH", 10818, 197, 317.26, 47.461266, 8.564512],
            ["LSZH", 12177, 197, 335, 47.445683, 8.556628]
        ]
    },
    "7": {
        "36": [
            ["DABB", 9815, 148, 186.88, 36.845005, 7.812783],
            ["DABB", 7539, 148, 231.84, 36.833328, 7.826962]
        ],
        "5": [
            ["DN52", 8858, 0, 347.509, 5.415188, 7.20867]
        ],
        "10": [
            ["DN53", 8612, 102, 226.6, 10.607055, 7.457438],
            ["DNKA", 9864, 197, 227.86, 10.704075, 7.329652]
        ],
        "13": [
            ["DN57", 11267, 98, 225.8, 13.0186, 7.67182],
            ["DRRM", 6070, 98, 264, 13.500865, 7.141848]
        ],
        "9": [
            ["DNAA", 11848, 197, 215.37, 9.016742, 7.267306]
        ],
        "6": [
            ["DNEN", 7793, 148, 259.82, 6.469102, 7.569573]
        ],
        "11": [
            ["DNZA", 5407, 98, 236.87, 11.140315, 7.689384]
        ],
        "52": [
            ["EDDG", 7104, 148, 251.04, 52.137821, 7.699921],
            ["ETNP", 8014, 0, 186.66, 52.35133, 7.544503]
        ],
        "50": [
            ["EDDK", 8050, 0, 244.38, 50.869667, 7.155299],
            ["EDDK", 6101, 148, 317.51, 50.858501, 7.138756],
            ["EDDK", 12496, 197, 317.52, 50.85519, 7.165722],
            ["ETHM", 5279, 117, 255.56, 50.367771, 7.326408],
            ["ETSB", 8218, 148, 209.25, 50.183659, 7.072016]
        ],
        "49": [
            ["EDDR", 6543, 148, 267.41, 49.21497, 7.12375],
            ["EDFH", 9982, 148, 212.44, 49.96022, 7.275307],
            ["EDRZ", 9667, 148, 209.98, 49.221004, 7.410792],
            ["ETAR", 9262, 148, 266.32, 49.437725, 7.619784]
        ],
        "51": [
            ["EDLW", 6552, 148, 240.56, 51.523514, 7.627023]
        ],
        "47": [
            ["EDTG", 5404, 148, 232.97, 47.907516, 7.626603],
            ["LFSB", 5961, 197, 256.94, 47.59161, 7.540343],
            ["LFSB", 12746, 0, 334.83, 47.585995, 7.531942],
            ["LFSC", 7963, 147, 194.21, 47.932564, 7.403671]
        ],
        "48": [
            ["EDTL", 9832, 148, 208.26, 48.381123, 7.837336],
            ["LFGA", 5254, 98, 191, 48.116909, 7.361061],
            ["LFQP", 7193, 148, 237.25, 48.771538, 7.213144],
            ["LFST", 7863, 148, 228.65, 48.545441, 7.640462]
        ],
        "63": [
            ["ENKB", 6021, 148, 251.39, 63.114422, 7.841722]
        ],
        "62": [
            ["ENML", 5533, 148, 251.01, 62.748569, 7.286531]
        ],
        "53": [
            ["ETNJ", 8126, 98, 281.65, 53.531326, 7.907032],
            ["ETNT", 7982, 98, 258.14, 53.550159, 7.685365]
        ],
        "43": [
            ["LFMN", 9713, 148, 224.91, 43.6656, 7.228467],
            ["LFMN", 8426, 148, 224.9, 43.668179, 7.226573]
        ],
        "45": [
            ["LIMF", 10847, 197, 2.56, 45.185379, 7.648654]
        ],
        "44": [
            ["LIMZ", 6900, 148, 212.54, 44.555573, 7.630465]
        ],
        "46": [
            ["LSGS", 6609, 0, 252.89, 46.221996, 7.339511],
            ["LSMI", 6500, 0, 225.8, 46.682766, 7.888491],
            ["LSMJ", 6560, 0, 262, 46.305134, 7.727272],
            ["LSMN", 7546, 0, 270.1, 46.303646, 7.83837],
            ["LSTS", 6204, 131, 316.01, 46.494293, 7.420763]
        ]
    },
    "1": {
        "35": [
            ["DAOB", 9882, 148, 261.16, 35.342804, 1.477608]
        ],
        "36": [
            ["DAOI", 5413, 98, 247, 36.219563, 1.341804]
        ],
        "9": [
            ["DXNG", 8238, 148, 202.92, 9.794502, 1.102618]
        ],
        "6": [
            ["DXXX", 9876, 148, 218.44, 6.176339, 1.262611]
        ],
        "51": [
            ["EGMH", 9008, 200, 281.26, 51.339725, 1.365591]
        ],
        "52": [
            ["EGSH", 6027, 148, 269.29, 52.676029, 1.296294],
            ["EGYC", 7482, 1, 215.79, 52.763176, 1.367575]
        ],
        "38": [
            ["LEIB", 9176, 148, 242.03, 38.878738, 1.387402]
        ],
        "41": [
            ["LERS", 8028, 148, 248.91, 41.152081, 1.18333]
        ],
        "50": [
            ["LFAC", 5025, 148, 241.01, 50.965439, 1.964331],
            ["LFAT", 6061, 131, 314.03, 50.51255, 1.63136]
        ],
        "43": [
            ["LFBF", 5868, 148, 294.28, 43.542263, 1.377422],
            ["LFBO", 11481, 148, 322.95, 43.61898, 1.372122],
            ["LFBO", 9920, 148, 322.96, 43.615639, 1.380245],
            ["LFIO", 5988, 0, 318.806, 43.562881, 1.488521]
        ],
        "45": [
            ["LFBL", 8200, 0, 213.21, 45.8713, 1.190209]
        ],
        "46": [
            ["LFLX", 11474, 148, 213.18, 46.875919, 1.743231]
        ],
        "48": [
            ["LFOC", 7538, 148, 278.03, 48.056686, 1.391941]
        ],
        "49": [
            ["LFOE", 9834, 148, 219.84, 49.039024, 1.233045],
            ["LFOP", 5575, 148, 221.32, 49.390945, 1.183947]
        ],
        "47": [
            ["LFOJ", 7872, 148, 249.3, 47.991535, 1.775715]
        ]
    },
    "-8": {
        "27": [
            ["DAOF", 9828, 150, 256.6, 27.704866, -8.152692],
            ["DAOF", 9840, 150, 256.6, 27.702116, -8.151875]
        ],
        "51": [
            ["EICK", 6990, 148, 339.89, 51.832256, -8.485779]
        ],
        "53": [
            ["EIKN", 7551, 148, 258.72, 53.912319, -8.801221]
        ],
        "52": [
            ["EINN", 10477, 148, 232.21, 52.711754, -8.905807],
            ["EINN", 5632, 148, 305.1, 52.694118, -8.904686]
        ],
        "31": [
            ["GMMX", 10122, 148, 275.68, 31.605541, -8.019838]
        ],
        "43": [
            ["LECO", 6356, 148, 210.89, 43.309738, -8.370938]
        ],
        "42": [
            ["LEST", 10505, 148, 346.18, 42.883797, -8.410935],
            ["LEVX", 7898, 148, 191.4, 42.242496, -8.623882]
        ],
        "39": [
            ["LPMR", 8074, 148, 181.75, 39.842361, -8.886821],
            ["LPTN", 7844, 148, 256.8, 39.476604, -8.359636]
        ],
        "40": [
            ["LPOV", 7972, 148, -3.86, 40.905003, -8.644951]
        ],
        "41": [
            ["LPPR", 11434, 148, 348.85, 41.232471, -8.677172]
        ]
    },
    "-1": {
        "35": [
            ["DAON", 8495, 148, 248.31, 35.017494, -1.443865]
        ],
        "12": [
            ["DFFD", 9934, 148, 213.73, 12.364431, -1.504772]
        ],
        "6": [
            ["DGSI", 6581, 148, 194.18, 6.725275, -1.581107]
        ],
        "4": [
            ["DGTK", 5753, 148, 209.97, 4.898334, -1.76268]
        ],
        "52": [
            ["EG74", 9842, 197, 239.5, 52.494556, -1.11149],
            ["EGBB", 8648, 151, 325.84, 52.446255, -1.739566],
            ["EGBE", 6571, 151, 227.33, 52.375988, -1.468695],
            ["EGNX", 9475, 151, 268.27, 52.83139, -1.306582]
        ],
        "51": [
            ["EGDL", 7811, 148, 240.18, 51.512787, -1.981248],
            ["EGDL", 5942, 148, 354.94, 51.495163, -1.987662],
            ["EGDM", 10523, 150, 230.12, 51.162548, -1.733378],
            ["EGDM", 6267, 150, 346.57, 51.144825, -1.727327],
            ["EGHL", 5896, 131, 266, 51.187225, -1.019075],
            ["EGLJ", 5993, 151, 304.02, 51.669365, -1.073153],
            ["EGUB", 5969, 150, 187.82, 51.623131, -1.094066],
            ["EGVA", 9969, 200, 267.9, 51.683998, -1.767962],
            ["EGVN", 9984, 184, 253.48, 51.753876, -1.561755]
        ],
        "50": [
            ["EGHH", 7440, 151, 255.3, 50.782745, -1.826344],
            ["EGHI", 5649, 121, 199.37, 50.95787, -1.352178]
        ],
        "53": [
            ["EGNM", 7420, 150, 317.75, 53.858452, -1.649126],
            ["EGXG", 6148, 151, 234.65, 53.839336, -1.183862],
            ["EGXG", 5459, 151, 335.69, 53.830647, -1.192573]
        ],
        "55": [
            ["EGNT", 7630, 151, 245.19, 55.042305, -1.673231]
        ],
        "54": [
            ["EGNV", 7502, 151, 227.43, 54.516148, -1.416351],
            ["EGXD", 6150, 0, 330.81, 54.130169, -1.409712],
            ["EGXE", 7497, 150, 335.79, 54.283188, -1.528171],
            ["EGXU", 6002, 150, 211.49, 54.056446, -1.245697],
            ["EGXZ", 6012, 150, 201.76, 54.213558, -1.376243]
        ],
        "34": [
            ["GMFO", 9839, 148, 237.66, 34.794365, -1.910103]
        ],
        "38": [
            ["LEAB", 8845, 197, 267.38, 38.949078, -1.847918]
        ],
        "42": [
            ["LEPP", 7234, 148, 331.82, 42.762207, -1.640616]
        ],
        "43": [
            ["LESO", 5764, 148, 218.73, 43.362686, -1.78381],
            ["LFBZ", 7370, 148, 269.17, 43.468533, -1.509397]
        ],
        "41": [
            ["LEZG", 12185, 148, 300.07, 41.663452, -1.043681],
            ["LEZG", 9938, 148, 300.09, 41.655392, -1.008289]
        ],
        "44": [
            ["LFBC", 7860, 148, 236.51, 44.539963, -1.112734]
        ],
        "46": [
            ["LFBH", 7070, 148, 272.43, 46.178833, -1.182402],
            ["LFRI", 5078, 98, 281.39, 46.700611, -1.369017]
        ],
        "49": [
            ["LFRC", 7991, 148, 280.77, 49.648094, -1.453635]
        ],
        "48": [
            ["LFRN", 6882, 148, 280.68, 48.070175, -1.718331]
        ],
        "47": [
            ["LFRS", 9497, 148, 207.42, 47.164661, -1.601965]
        ]
    },
    "-2": {
        "31": [
            ["DAOR", 12245, 148, 240.6, 31.654356, -2.261318],
            ["DAOR", 9840, 148, 0.61, 31.63187, -2.261387]
        ],
        "51": [
            ["EGBP", 6584, 148, 260.4, 51.6716, -2.043789],
            ["EGDY", 7507, 151, 263.07, 51.00951, -2.629263],
            ["EGGD", 6603, 151, 266.44, 51.383224, -2.704628],
            ["EGTG", 8063, 299, 269.74, 51.519482, -2.572683]
        ],
        "53": [
            ["EGCC", 9978, 0, 231.04, 53.349148, -2.27511],
            ["EGCC", 9988, 0, 231.05, 53.362488, -2.256818],
            ["EGCD", 7530, 151, 246.6, 53.341869, -2.134032],
            ["EGGP", 7490, 151, 265.6, 53.33498, -2.830327],
            ["EGNO", 7928, 151, 251.15, 53.748444, -2.866466],
            ["EGNR", 6684, 148, 220.98, 53.18504, -2.967607]
        ],
        "50": [
            ["EGDW", 5970, 0, 263, 50.96349, -2.922763]
        ],
        "49": [
            ["EGJJ", 5593, 151, 262.75, 49.208931, -2.183672]
        ],
        "54": [
            ["EGNC", 5993, 98, 240.37, 54.941826, -2.796094]
        ],
        "52": [
            ["EGOS", 5998, 151, -0.11, 52.785393, -2.667928]
        ],
        "57": [
            ["EGPD", 5988, 151, 338.18, 57.194294, -2.192154]
        ],
        "56": [
            ["EGQL", 8468, 150, 261.74, 56.376389, -2.839992]
        ],
        "16": [
            ["GATB", 6890, 98, 248, 16.737425, -2.989462]
        ],
        "36": [
            ["LEAM", 10490, 148, 252.98, 36.848156, -2.352868]
        ],
        "43": [
            ["LEBB", 6552, 148, 276.66, 43.301262, -2.912517],
            ["LEBB", 8521, 148, 296.7, 43.296005, -2.896719]
        ],
        "42": [
            ["LERJ", 6554, 0, 289.83, 42.45747, -2.309029],
            ["LEVT", 11478, 148, 215.89, 42.895596, -2.711865]
        ],
        "48": [
            ["LFRD", 7194, 148, 350.08, 48.578617, -2.077549],
            ["LFRT", 7217, 148, 238.82, 48.543385, -2.841823]
        ],
        "47": [
            ["LFRV", 5005, 148, 219.18, 47.728577, -2.712073],
            ["LFRZ", 7877, 148, 253.46, 47.315254, -2.133905]
        ]
    },
    "-4": {
        "11": [
            ["DFOO", 10843, 148, 232.62, 11.168831, -4.319139]
        ],
        "51": [
            ["EGDC", 6014, 151, 271, 51.087029, -4.137287]
        ],
        "50": [
            ["EGDG", 8987, 0, 300.56, 50.434505, -4.978729]
        ],
        "54": [
            ["EGNS", 5803, 151, 257.95, 54.084942, -4.610547],
            ["EGOY", 6027, 0, 234.99, 54.858082, -4.929384]
        ],
        "52": [
            ["EGOD", 7985, 0, 350.01, 52.788555, -4.126804]
        ],
        "53": [
            ["EGOQ", 5466, 150, 217, 53.264812, -4.365458],
            ["EGOV", 5369, 151, 186.31, 53.258129, -4.537758],
            ["EGOV", 7471, 151, 310.62, 53.240448, -4.520226]
        ],
        "57": [
            ["EGPE", 6670, 151, 229.45, 57.548069, -4.035391]
        ],
        "55": [
            ["EGPF", 8724, 151, 226.39, 55.87986, -4.418411],
            ["EGPK", 5991, 148, 203.73, 55.503395, -4.575747],
            ["EGPK", 9778, 150, 301.36, 55.502361, -4.574225]
        ],
        "14": [
            ["GAMB", 8355, 94, 227.22, 14.520534, -4.070867]
        ],
        "33": [
            ["GMFF", 10488, 148, 270.27, 33.927223, -4.960642]
        ],
        "31": [
            ["GMFK", 10497, 148, 305.12, 31.93989, -4.386782]
        ],
        "36": [
            ["LEMG", 10494, 148, 311.64, 36.665398, -4.485797]
        ],
        "41": [
            ["LEVD", 9850, 197, 225.15, 41.716053, -4.839116]
        ],
        "48": [
            ["LFRB", 10143, 0, 251.2, 48.452293, -4.398864],
            ["LFRJ", 8842, 148, 253.28, 48.533718, -4.134234]
        ],
        "47": [
            ["LFRQ", 7041, 148, 273.5, 47.974476, -4.15654]
        ]
    },
    "-6": {
        "6": [
            ["DIDL", 6562, 98, 216, 6.807274, -6.461339]
        ],
        "4": [
            ["DISP", 6234, 98, 201, 4.751394, -6.656941]
        ],
        "54": [
            ["EGAA", 9100, 148, 245.07, 54.662777, -6.196143],
            ["EGAA", 6194, 148, 341.96, 54.641781, -6.219546]
        ],
        "55": [
            ["EGPI", 5089, 151, 300.88, 55.683838, -6.249073]
        ],
        "58": [
            ["EGPO", 7185, 151, -5.73, 58.205761, -6.329192]
        ],
        "53": [
            ["EIDW", 8632, 148, 275.26, 53.42025, -6.250544],
            ["EIDW", 6786, 200, 336.61, 53.419907, -6.249585],
            ["EIME", 5986, 150, 281.93, 53.301304, -6.442091]
        ],
        "34": [
            ["GMME", 11459, 148, 211.27, 34.064896, -6.741679],
            ["GMSL", 11302, 140, 250.5, 34.235821, -6.032535]
        ],
        "30": [
            ["GMMZ", 9842, 148, 296.92, 30.932976, -6.895455]
        ],
        "37": [
            ["LE85", 6004, 116, -2.49, 37.343479, -6.013508]
        ],
        "43": [
            ["LEAS", 7221, 148, 288.07, 43.560493, -6.021627]
        ],
        "38": [
            ["LEBZ", 9352, 197, 305.69, 38.883781, -6.807871]
        ],
        "36": [
            ["LEJR", 7554, 0, 201.37, 36.754269, -6.055398],
            ["LERT", 12130, 200, 276.71, 36.6436, -6.328574]
        ]
    },
    "13": {
        "11": [
            ["DNMA", 9864, 197, 226.54, 11.864542, 13.091314]
        ],
        "51": [
            ["EDAK", 7864, 157, 296.02, 51.302643, 13.569628],
            ["EDDC", 8214, 167, 220.87, 51.141277, 13.77891],
            ["ETSH", 7925, 98, 273.52, 51.767166, 13.185197],
            ["Z11K", 8424, 0, 276, 51.994373, 13.001592]
        ],
        "52": [
            ["EDAV", 8249, 164, 280, 52.825253, 13.71205],
            ["EDDB", 9822, 148, 248.8, 52.377426, 13.526132],
            ["EDDB", 8872, 148, 248.81, 52.38892, 13.554285],
            ["EDDI", 6025, 140, 267.73, 52.471405, 13.418571],
            ["EDDI", 6864, 140, 265.87, 52.475636, 13.417917],
            ["EDDT", 7947, 151, 260.86, 52.56012, 13.310249],
            ["EDDT", 9896, 151, 260.86, 52.561947, 13.309796],
            ["Z11R", 8200, 0, 340.108, 52.717201, 13.224234]
        ],
        "54": [
            ["EDCP", 7858, 197, 316.02, 54.150276, 13.785131]
        ],
        "53": [
            ["EDUW", 7207, 197, 350.01, 53.91243, 13.221732],
            ["ETNU", 7480, 148, 268.14, 53.602493, 13.323362]
        ],
        "58": [
            ["ESFH", 6509, 0, 208.9, 58.417225, 13.270824],
            ["ESFR", 6501, 110, 4.61, 58.489246, 13.051861],
            ["ESGL", 6514, 148, 242.16, 58.469688, 13.18952],
            ["ESGR", 5682, 98, 195.71, 58.463875, 13.976665]
        ],
        "55": [
            ["ESFJ", 6562, 0, 300, 55.644585, 13.639698],
            ["ESMS", 9168, 148, 353.36, 55.523075, 13.378914]
        ],
        "56": [
            ["ESFY", 7546, 0, 300, 56.778152, 13.61775],
            ["ESTL", 7250, 131, 293.89, 56.079243, 13.210602],
            ["ESTL", 6581, 131, 293.06, 56.081451, 13.222159]
        ],
        "59": [
            ["ESOK", 8234, 148, 205.66, 59.454884, 13.346985]
        ],
        "7": [
            ["FKKN", 8889, 148, 203.22, 7.368244, 13.563858]
        ],
        "9": [
            ["FKKR", 11358, 148, 266.32, 9.336956, 13.385476]
        ],
        "-9": [
            ["FN19", 9830, 148, 253, -9.649092, 13.273727]
        ],
        "-12": [
            ["FNBG", 5315, 100, 308, -12.604479, 13.405887],
            ["FNCT", 12135, 0, 190.7, -12.463148, 13.490442]
        ],
        "-8": [
            ["FNLU", 12165, 148, 226.64, -8.853965, 13.238358],
            ["FNLU", 8170, 197, 247.58, -8.846973, 13.246581]
        ],
        "-14": [
            ["FNUB", 9843, 148, 266, -14.932378, 13.59727]
        ],
        "-1": [
            ["FO22", 6890, 0, 241.6, -1.124934, 13.92882],
            ["FOON", 10137, 148, 323.69, -1.667336, 13.446184]
        ],
        "31": [
            ["HL54", 5905, 140, 4.206, 31.73114, 13.953288]
        ],
        "32": [
            ["HLLM", 7201, 148, 210, 32.908173, 13.287228],
            ["HLLM", 10993, 148, 287.06, 32.886883, 13.307105],
            ["HLLT", 11745, 145, 268.76, 32.665134, 13.16781],
            ["HLLT", 7348, 145, 357.02, 32.661259, 13.160133]
        ],
        "44": [
            ["LDPL", 9609, 148, 268.26, 44.893932, 13.94075]
        ],
        "38": [
            ["LICJ", 6792, 148, 203.85, 38.183304, 13.095267],
            ["LICJ", 10903, 197, 246.87, 38.186039, 13.12144]
        ],
        "45": [
            ["LIPI", 9842, 144, 243, 45.987793, 13.072309],
            ["LIPQ", 9832, 148, 270.43, 45.827763, 13.486089]
        ],
        "43": [
            ["LIPY", 9711, 148, 224.85, 43.625809, 13.375308]
        ],
        "50": [
            ["LKPC", 8186, 95, 267.1, 50.306786, 13.951834]
        ],
        "47": [
            ["LOWS", 9009, 148, 336.96, 47.782082, 13.011068]
        ]
    },
    "12": {
        "9": [
            ["DNYO", 7908, 148, 345.67, 9.249303, 12.433296]
        ],
        "18": [
            ["DRZD", 5280, 131, 221.45, 18.974091, 12.873613]
        ],
        "13": [
            ["DRZF", 5906, 98, 269, 13.375139, 12.649991]
        ],
        "50": [
            ["EDAC", 7324, 148, 219.44, 50.989704, 12.516671],
            ["LKKV", 7020, 98, 293.1, 50.199238, 12.929054]
        ],
        "53": [
            ["EDAX", 7793, 164, 255.99, 53.308071, 12.771667],
            ["ETNL", 8251, 148, 277.7, 53.916565, 12.298328]
        ],
        "51": [
            ["EDDP", 11786, 148, 265.73, 51.433647, 12.26749],
            ["EDDP", 8183, 0, 285.34, 51.412064, 12.244331]
        ],
        "55": [
            ["EKCH", 10812, 148, 221.21, 55.625408, 12.667612],
            ["EKCH", 11694, 148, 221.19, 55.616417, 12.641004],
            ["EKCH", 8728, 148, 303.19, 55.612587, 12.670375],
            ["EKRK", 5890, 105, 296.28, 55.582825, 12.141236],
            ["EKVL", 8042, 0, 279.83, 55.767349, 12.343403]
        ],
        "57": [
            ["ESGG", 10798, 148, 205.99, 57.676147, 12.291952]
        ],
        "58": [
            ["ESGT", 5598, 98, 326.09, 58.311577, 12.352795],
            ["ESIB", 7411, 131, 184.58, 58.438419, 12.712764],
            ["ESIB", 6326, 131, 291.9, 58.426636, 12.725449]
        ],
        "56": [
            ["ESMT", 7431, 131, 186.2, 56.700825, 12.822127],
            ["ESTA", 6367, 131, 316.39, 56.285164, 12.865899]
        ],
        "60": [
            ["ESST", 5010, 95, 337.71, 60.151226, 12.996534]
        ],
        "61": [
            ["ESUE", 5103, 0, 327.06, 61.862968, 12.697169]
        ],
        "-5": [
            ["FNCA", 8202, 98, 180, -5.572067, 12.2],
            ["FZAI", 7874, 147, 225, -5.910403, 12.454066]
        ],
        "-15": [
            ["FNMO", 8202, 0, 215, -15.207438, 12.173353]
        ],
        "-6": [
            ["FNSO", 6857, 174, 242.8, -6.113667, 12.375422]
        ],
        "-1": [
            ["FO23", 5841, 0, 330.906, -1.192552, 12.445874]
        ],
        "0": [
            ["FOOK", 5906, 0, 245, 0.580528, 12.885554]
        ],
        "26": [
            ["HL51", 9349, 0, 277.5, 26.565819, 12.83734]
        ],
        "29": [
            ["HLNM", 6562, 0, 0.8, 29.504333, 12.944856]
        ],
        "32": [
            ["HLZW", 5906, 148, 240.6, 32.983967, 12.023413]
        ],
        "35": [
            ["LICD", 5901, 148, 260.6, 35.499283, 12.627884]
        ],
        "37": [
            ["LICT", 8850, 148, 307.71, 37.90403, 12.500032]
        ],
        "46": [
            ["LIPA", 8678, 144, 228.3, 46.038887, 12.609466]
        ],
        "44": [
            ["LIPC", 9810, 148, 299, 44.218468, 12.324755],
            ["LIPK", 7901, 148, 296.95, 44.190334, 12.08314],
            ["LIPR", 9821, 148, 307.75, 44.012032, 12.626565]
        ],
        "45": [
            ["LIPH", 8056, 144, 249.25, 45.652348, 12.208664],
            ["LIPS", 9851, 105, 261.94, 45.686405, 12.106339],
            ["LIPZ", 10819, 148, 222.07, 45.516148, 12.366071],
            ["LIPZ", 9114, 148, 222.07, 45.513721, 12.359448]
        ],
        "41": [
            ["LIRA", 7242, 154, 332.76, 41.790394, 12.601015],
            ["LIRE", 8367, 148, 310.22, 41.647194, 12.457011],
            ["LIRF", 10842, 148, 249.72, 41.809704, 12.269803],
            ["LIRF", 12813, 197, 342.64, 41.782082, 12.24037],
            ["LIRF", 12823, 197, 342.65, 41.812424, 12.275548],
            ["LIRF", 11815, 0, 342.65, 41.811363, 12.27275],
            ["LIRL", 5595, 131, 304.13, 41.538048, 12.917515]
        ],
        "43": [
            ["LIRZ", 5568, 148, 194.31, 43.103306, 12.515806]
        ]
    },
    "10": {
        "35": [
            ["DTMB", 9633, 148, 253.58, 35.76157, 10.769642]
        ],
        "36": [
            ["DTTA", 10473, 148, 192.31, 36.867191, 10.231403],
            ["DTTA", 9341, 148, 292.53, 36.84446, 10.247171],
            ["Z28S", 6120, 0, 335.306, 36.424316, 10.019914]
        ],
        "32": [
            ["DTTD", 7812, 148, 202.5, 32.316036, 10.38695]
        ],
        "33": [
            ["DTTJ", 10152, 148, 268.29, 33.875862, 10.793896]
        ],
        "34": [
            ["DTTX", 9820, 148, 328.05, 34.706123, 10.699501]
        ],
        "50": [
            ["EDDE", 8513, 164, 277.22, 50.978344, 10.976376],
            ["EDGE", 5633, 180, 283.01, 50.990501, 10.487876]
        ],
        "53": [
            ["EDDH", 10639, 150, 230.25, 53.636959, 10.001613],
            ["EDDH", 12007, 150, 332.83, 53.62532, 10.000367],
            ["EDHL", 6881, 197, 251.98, 53.807823, 10.732292]
        ],
        "47": [
            ["EDJA", 9754, 98, 238.92, 47.995785, 10.256424]
        ],
        "52": [
            ["EDVE", 5501, 98, 264.78, 52.319798, 10.566913],
            ["ETHC", 5994, 148, 260.98, 52.592613, 10.035531]
        ],
        "56": [
            ["EKAH", 8843, 148, 280.29, 56.301151, 10.640548],
            ["EKAH", 9088, 75, 280.3, 56.302971, 10.641969]
        ],
        "55": [
            ["EKOD", 6040, 148, 239.75, 55.479824, 10.340522]
        ],
        "59": [
            ["ENRY", 7993, 148, 296.8, 59.373848, 10.804636],
            ["ENTO", 9656, 148, 359.33, 59.173641, 10.258919]
        ],
        "63": [
            ["ENVA", 9030, 148, 270.23, 63.457546, 10.944943]
        ],
        "48": [
            ["ETSA", 6750, 98, 252.18, 48.07333, 10.919189],
            ["ETSL", 8000, 98, 209.14, 48.195, 10.86918],
            ["Z11L", 6562, 0, 247.2, 48.441811, 10.250009]
        ],
        "5": [
            ["FKKM", 6908, 148, 217.58, 5.644356, 10.756513],
            ["FKKU", 8202, 148, 328, 5.524222, 10.36237]
        ],
        "6": [
            ["FKKV", 8202, 0, 357, 6.047982, 10.113698]
        ],
        "25": [
            ["HLGT", 11848, 148, 350.04, 25.121033, 10.150869]
        ],
        "44": [
            ["LIMP", 5823, 148, 197.35, 44.83308, 10.299918]
        ],
        "45": [
            ["LIPL", 9737, 148, 315.39, 45.423409, 10.281698],
            ["LIPO", 9802, 148, 314.97, 45.419003, 10.344925],
            ["LIPX", 10058, 0, 225.65, 45.406429, 10.904159]
        ],
        "43": [
            ["LIRP", 9818, 148, 216.78, 43.694595, 10.40545],
            ["LIRP", 9156, 141, 216.76, 43.694065, 10.4016]
        ]
    },
    "14": {
        "51": [
            ["EDAB", 7200, 164, 253.28, 51.196369, 14.534831],
            ["EDBR", 8192, 148, 358, 51.351669, 14.950643],
            ["EDCD", 8133, 148, 248.9, 51.89349, 14.548848],
            ["EDCY", 6551, 98, 215.98, 51.586082, 14.147615],
            ["ETHT", 5143, 0, 257.98, 51.769463, 14.303148],
            ["ETNR", 8202, 0, 246.3, 51.668125, 14.650176]
        ],
        "53": [
            ["EDAH", 7547, 115, 285.53, 53.876083, 14.168307],
            ["EPSC", 8188, 197, 310.91, 53.57737, 14.916492]
        ],
        "52": [
            ["EDON", 7857, 164, 263.99, 52.614174, 14.260426]
        ],
        "55": [
            ["EKRN", 6554, 148, 293.74, 55.059643, 14.773927],
            ["ESMK", 7253, 148, 187.14, 55.931553, 14.087742]
        ],
        "67": [
            ["ENBO", 9141, 148, 258.01, 67.271759, 14.397017]
        ],
        "56": [
            ["ESFI", 6890, 0, 330, 56.179039, 14.144879],
            ["ESFU", 7546, 0, 340, 56.671661, 14.953111],
            ["ESMX", 6888, 148, 193.06, 56.938343, 14.731905]
        ],
        "58": [
            ["ESFM", 6562, 0, 210, 58.606285, 14.120603],
            ["ESIA", 7454, 131, 242.82, 58.518505, 14.524536]
        ],
        "57": [
            ["ESGJ", 7213, 148, 198.07, 57.766994, 14.074482],
            ["ESMV", 6726, 131, 223, 57.298965, 14.148586]
        ],
        "60": [
            ["ESKM", 5936, 148, 341.22, 60.950195, 14.516782]
        ],
        "62": [
            ["ESND", 5564, 98, 267.05, 62.048115, 14.437288]
        ],
        "63": [
            ["ESPC", 8178, 0, 294.68, 63.189438, 14.524603]
        ],
        "10": [
            ["FKKL", 6910, 148, 309.83, 10.445313, 14.264743]
        ],
        "-16": [
            ["FN17", 8220, 0, 276.808, -16.238033, 14.338692],
            ["FN17", 8477, 0, 275.808, -16.239645, 14.338551]
        ],
        "-22": [
            ["FYAR", 6300, 66, 262.5, -22.461084, 14.98927],
            ["FYWB", 6999, 98, 251.91, -22.976946, 14.655245]
        ],
        "-17": [
            ["FYRC", 7122, 98, 271.007, -17.420773, 14.392309],
            ["FYRC", 5403, 98, 320.005, -17.43084, 14.380809]
        ],
        "24": [
            ["HL57", 5166, 131, 240, 24.187214, 14.535321],
            ["HL57", 11975, 230, 311.012, 24.166895, 14.557449]
        ],
        "27": [
            ["HL66", 11130, 148, 313.111, 27.22963, 14.668789],
            ["HL73", 11806, 0, 310.112, 27.641937, 14.287004]
        ],
        "31": [
            ["HL83", 12790, 142, 304.31, 31.695253, 14.928649]
        ],
        "26": [
            ["HLLS", 11740, 148, 313.64, 26.986666, 14.453356]
        ],
        "45": [
            ["LDRG", 5156, 98, 254.39, 45.381519, 14.513209],
            ["LDRI", 8159, 148, 323.73, 45.207607, 14.580212]
        ],
        "42": [
            ["LIBP", 7934, 148, 217.43, 42.440048, 14.191996]
        ],
        "37": [
            ["LICZ", 8014, 148, 277.95, 37.397564, 14.935209],
            ["LICZ", 7871, 98, 278.88, 37.401989, 14.936013]
        ],
        "41": [
            ["LIRM", 9735, 98, 239.95, 41.067375, 14.097406]
        ],
        "40": [
            ["LIRN", 8615, 148, 238.08, 40.892384, 14.304282]
        ],
        "46": [
            ["LJLJ", 10814, 148, 306.43, 46.21487, 14.474856],
            ["LOWK", 8907, 0, 286.31, 46.639061, 14.354912]
        ],
        "48": [
            ["LKCS", 8203, 262, 269.5, 48.946476, 14.444592],
            ["LOWL", 9811, 197, 267.04, 48.23391, 14.207779]
        ],
        "50": [
            ["LKKB", 6525, 148, 241.5, 50.125668, 14.556138],
            ["LKPR", 6931, 197, 216.9, 50.102917, 14.284461],
            ["LKPR", 12166, 148, 244.98, 50.115948, 14.273409],
            ["LKPR", 10642, 148, 306.95, 50.090462, 14.281703],
            ["LKVO", 8186, 148, 284.89, 50.213791, 14.412498]
        ],
        "35": [
            ["LMML", 7806, 0, 234.46, 35.859917, 14.481555],
            ["LMML", 11629, 0, 314.83, 35.833775, 14.506213]
        ],
        "47": [
            ["LOXZ", 9007, 197, 258.98, 47.206032, 14.760822]
        ],
        "22": [
            ["Z23L", 9560, 0, 357.11, 22.770533, 14.024901]
        ]
    },
    "11": {
        "51": [
            ["EDBC", 8185, 0, 257.39, 51.858368, 11.435736]
        ],
        "48": [
            ["EDDM", 13097, 197, 83.4, 48.340664, 11.75097],
            ["EDDM", 13097, 197, 263.4, 48.344791, 11.80466],
            ["EDDM", 13097, 197, 263.42, 48.366886, 11.821219],
            ["EDMO", 7490, 147, 222.41, 48.089203, 11.293787],
            ["ETSE", 8259, 98, 258.54, 48.324669, 11.965362],
            ["ETSF", 8975, 151, 272.72, 48.204998, 11.285532],
            ["ETSI", 9648, 197, 248.19, 48.714329, 11.555866],
            ["ETSI", 7354, 98, 248.17, 48.724159, 11.543859],
            ["ETSN", 8034, 98, 270.87, 48.710827, 11.228197]
        ],
        "49": [
            ["EDDN", 8841, 148, 278.6, 49.496925, 11.096058]
        ],
        "53": [
            ["EDOP", 9822, 180, 245.02, 53.432678, 11.803929]
        ],
        "52": [
            ["EDOV", 6536, 171, 263, 52.629993, 11.834841]
        ],
        "60": [
            ["ENGM", 9656, 148, 196.05, 60.201202, 11.122499],
            ["ENGM", 11784, 148, 196.02, 60.216061, 11.09168]
        ],
        "62": [
            ["ENRO", 5629, 131, 316.07, 62.573574, 11.356377]
        ],
        "57": [
            ["ESGP", 6628, 131, 185, 57.78405, 11.871806]
        ],
        "-4": [
            ["FCPP", 8570, 148, 346.07, -4.827419, 11.889436]
        ],
        "3": [
            ["FKKY", 6591, 148, 204.11, 3.844361, 11.527145],
            ["FKYS", 11207, 148, 189.93, 3.737699, 11.55601]
        ],
        "-1": [
            ["FOGM", 5906, 100, 348, -1.857909, 11.068352]
        ],
        "1": [
            ["FOGO", 5926, 98, 204.46, 1.550556, 11.584794]
        ],
        "32": [
            ["HL77", 10500, 148, 98.1, 32.474178, 11.880768],
            ["HL77", 10500, 148, 278.1, 32.470119, 11.914566],
            ["HL77", 10500, 148, 278.1, 32.472694, 11.914792]
        ],
        "36": [
            ["LICG", 5453, 148, 256.35, 36.817654, 11.97504]
        ],
        "44": [
            ["LIPE", 9179, 150, 296.75, 44.529934, 11.303972]
        ],
        "43": [
            ["LIRQ", 5629, 98, 228.15, 43.814579, 11.212066]
        ],
        "42": [
            ["LIRS", 9822, 148, 210.92, 42.772476, 11.080047]
        ],
        "47": [
            ["LOWI", 6551, 148, 260.97, 47.26162, 11.357075]
        ]
    },
    "24": {
        "59": [
            ["EEEI", 6562, 148, 250.6, 59.263283, 24.225111],
            ["EETN", 10048, 148, 270.3, 59.413193, 24.860018]
        ],
        "58": [
            ["EEPU", 8119, 148, 215.33, 58.427876, 24.485117]
        ],
        "61": [
            ["EFHA", 8508, 197, 266.1, 61.856842, 24.811283]
        ],
        "60": [
            ["EFHK", 11260, 197, 227.52, 60.330734, 24.97924],
            ["EFHK", 10014, 197, 227.49, 60.331501, 24.944723],
            ["EFHK", 9492, 197, 333.05, 60.307064, 24.988306]
        ],
        "65": [
            ["EFKE", 8184, 157, 367.52, 65.770752, 24.578856]
        ],
        "67": [
            ["EFKT", 8173, 148, 346.1, 67.69014, 24.853947]
        ],
        "70": [
            ["ENNA", 9114, 148, 355.42, 70.056343, 24.976418]
        ],
        "54": [
            ["EYKA", 10641, 148, 265.08, 54.965172, 24.110126]
        ],
        "55": [
            ["EYPP", 6562, 131, 317.407, 55.722816, 24.472206]
        ],
        "-27": [
            ["FA0F", 7900, 0, 337.708, -27.949821, 24.822802]
        ],
        "-28": [
            ["FAKM", 9874, 150, 179.9, -28.79318, 24.765112],
            ["FAKM", 7992, 148, 259.86, -28.801264, 24.775438],
            ["Z27I", 6890, 0, 194, -28.682634, 24.046549]
        ],
        "-24": [
            ["FBJW", 5495, 82, 243.5, -24.598953, 24.698376]
        ],
        "-17": [
            ["FYKM", 7475, 128, 260.31, -17.632181, 24.187038]
        ],
        "2": [
            ["FZKJ", 6893, 98, 250.3, 2.815573, 24.801542]
        ],
        "12": [
            ["HSNN", 9879, 148, 221.26, 12.063675, 24.96526]
        ],
        "42": [
            ["LB21", 9815, 0, 260.1, 42.296074, 24.741226],
            ["LBPD", 8188, 148, 307.29, 42.06105, 24.86285]
        ],
        "43": [
            ["LB41", 7173, 230, 102.3, 43.453503, 24.489597],
            ["LB41", 7173, 0, 282.3, 43.449314, 24.516079]
        ],
        "35": [
            ["LG54", 8900, 160, 269, 35.063892, 24.782328],
            ["LGSA", 10955, 148, 293.2, 35.526268, 24.168604]
        ],
        "40": [
            ["LGKM", 5229, 98, 313.79, 40.971275, 24.339369],
            ["LGKV", 9852, 148, 235.57, 40.922501, 24.634748]
        ],
        "38": [
            ["LGSY", 9856, 98, 2.99, 38.952343, 24.487295]
        ],
        "44": [
            ["LR81", 8202, 262, 285.708, 44.07423, 24.431479]
        ],
        "45": [
            ["LRSB", 6510, 98, 271.35, 45.785587, 24.103983]
        ],
        "46": [
            ["LRTM", 6512, 98, 254.19, 46.470139, 24.424999]
        ],
        "48": [
            ["UKLI", 8210, 144, 282.83, 48.881664, 24.703362]
        ],
        "53": [
            ["UMMG", 8515, 138, 357.57, 53.589989, 24.056667]
        ]
    },
    "25": {
        "59": [
            ["EETA", 8202, 0, 236.3, 59.247066, 25.980522]
        ],
        "62": [
            ["EFJY", 8511, 197, 313.94, 62.391346, 25.696392]
        ],
        "64": [
            ["EFOU", 8183, 197, 300.99, 64.924278, 25.377264],
            ["Z11G", 8200, 0, 299.31, 64.474487, 25.979984]
        ],
        "66": [
            ["EFRO", 9816, 197, 217.21, 66.575539, 25.850889]
        ],
        "54": [
            ["EYVI", 8215, 164, 201.88, 54.644619, 25.293047]
        ],
        "-25": [
            ["FAMM", 14800, 148, 203.12, -25.779827, 25.556862]
        ],
        "-33": [
            ["FAPE", 6497, 151, 237.99, -33.98357, 25.619825],
            ["FAPE", 5514, 151, 325.74, -33.996315, 25.626537]
        ],
        "-17": [
            ["FBKE", 6562, 98, 251, -17.8279, 25.171539],
            ["FLLI", 7517, 197, 274.02, -17.824236, 25.830301]
        ],
        "-24": [
            ["FBSK", 9839, 148, 241.94, -24.548403, 25.932301],
            ["FBTP", 9850, 148, 243.7, -24.21512, 25.360552],
            ["FBTP", 6585, 60, 243.9, -24.209871, 25.349882]
        ],
        "-18": [
            ["FVFA", 7522, 98, 290.11, -18.099751, 25.849508]
        ],
        "0": [
            ["FZIA", 7218, 98, 282, 0.514604, 25.164406],
            ["FZIC", 11547, 148, 306.93, 0.471658, 25.345575]
        ],
        "-2": [
            ["FZOA", 7125, 148, 354.29, -2.937487, 25.900557]
        ],
        "-10": [
            ["FZQM", 5741, 98, 282.16, -10.764441, 25.513281]
        ],
        "-8": [
            ["FZSA", 8869, 148, 303.13, -8.619535, 25.237066],
            ["FZSA", 8925, 148, 301.38, -8.614852, 25.264891]
        ],
        "31": [
            ["HE18", 9864, 131, 345.51, 31.094179, 25.454912],
            ["HE18", 9837, 131, 345.51, 31.094719, 25.457249],
            ["HE19", 6555, 130, 316.507, 31.450787, 25.290953],
            ["HE40", 9882, 131, 159.51, 31.478741, 25.871044],
            ["HE40", 9882, 130, 339.51, 31.45335, 25.882168],
            ["HE40", 9882, 130, 338.51, 31.454206, 25.884701],
            ["HE41", 9853, 136, 341.51, 31.015482, 25.854944],
            ["HE41", 9855, 98, 341.51, 31.016153, 25.8573]
        ],
        "29": [
            ["HE24", 5905, 147, 341.406, 29.337854, 25.509701],
            ["HE27", 9840, 125, 291.41, 29.550257, 25.603411]
        ],
        "13": [
            ["HSFS", 9807, 148, 228.74, 13.61223, 25.322016]
        ],
        "41": [
            ["LB14", 7230, 0, 284.607, 41.973866, 25.602724],
            ["LB26", 7235, 0, 292.607, 41.867962, 25.617065]
        ],
        "42": [
            ["LB23", 8345, 0, 282.4, 42.111687, 25.008005],
            ["LBSZ", 8200, 148, 349.708, 42.376034, 25.654709]
        ],
        "43": [
            ["LB42", 8200, 262, 273.7, 43.327385, 25.00596],
            ["LBGO", 8026, 148, 278.01, 43.150135, 25.726509]
        ],
        "40": [
            ["LGAL", 8459, 148, 252.98, 40.860123, 25.971254],
            ["LT86", 7099, 150, 195.4, 40.214821, 25.887724]
        ],
        "35": [
            ["LGIR", 8896, 148, 274.84, 35.33897, 25.19142],
            ["LGIR", 5138, 164, 306.41, 35.33548, 25.187313],
            ["LGTL", 8038, 148, 202, 35.203266, 25.334219]
        ],
        "39": [
            ["LGLM", 9892, 148, 222.94, 39.928188, 25.249081]
        ],
        "37": [
            ["LGMK", 6259, 98, 340.61, 37.427078, 25.351812]
        ],
        "36": [
            ["LGSR", 6980, 98, 339.24, 36.390251, 25.483349]
        ],
        "48": [
            ["UKLN", 7247, 138, 333.43, 48.250828, 25.988344]
        ]
    },
    "23": {
        "68": [
            ["EFET", 6542, 148, 214.71, 68.369965, 23.438183]
        ],
        "59": [
            ["EFHN", 5239, 59, 213, 59.854141, 23.093317]
        ],
        "63": [
            ["EFKA", 8832, 197, 356.9, 63.114979, 23.052891],
            ["EFKK", 8176, 197, 190.65, 63.729885, 23.147511]
        ],
        "61": [
            ["EFTP", 8835, 148, 244.46, 61.419369, 23.627247]
        ],
        "69": [
            ["ENAT", 6828, 131, 301.17, 69.972687, 23.387959]
        ],
        "52": [
            ["EPBP", 7465, 0, 246.02, 52.004902, 23.147608],
            ["EPBP", 10804, 0, 246.02, 52.01297, 23.171135],
            ["UMBB", 8996, 138, 293.91, 52.103333, 23.916697]
        ],
        "56": [
            ["EVRA", 8351, 148, 5.15, 56.912254, 23.969309]
        ],
        "55": [
            ["EYKD", 6562, 0, 345.91, 55.30307, 23.960238],
            ["EYSA", 11458, 0, 326.11, 55.880806, 23.410624]
        ],
        "-30": [
            ["FA0D", 7500, 0, 277.707, -30.638048, 23.931864]
        ],
        "-27": [
            ["FAKU", 5542, 49, 183.83, -27.450499, 23.412365],
            ["FASS", 5709, 75, 332, -27.656889, 23.00415]
        ],
        "-28": [
            ["FALC", 5249, 49, 306.805, -28.36437, 23.445621]
        ],
        "-19": [
            ["FBMN", 6499, 98, 245.02, -19.968386, 23.438862]
        ],
        "-6": [
            ["FZWA", 6591, 146, 345.08, -6.125783, 23.569349]
        ],
        "29": [
            ["HL0N", 11503, 0, 195.1, 29.889509, 23.351875]
        ],
        "31": [
            ["HL67", 9895, 0, 200.4, 31.874804, 23.90481],
            ["HL67", 9835, 0, 269.4, 31.855062, 23.922106],
            ["HL67", 9865, 0, 329.41, 31.850355, 23.91983]
        ],
        "32": [
            ["HL68", 11155, 148, 322.411, 32.440735, 23.129608]
        ],
        "24": [
            ["HLKF", 12008, 0, 196, 24.192774, 23.320116]
        ],
        "43": [
            ["LB15", 8275, 0, 290.708, 43.540283, 23.287172]
        ],
        "42": [
            ["LB20", 7225, 0, 275.4, 42.808968, 23.299566],
            ["LB22", 8380, 70, 251.5, 42.313641, 23.26178],
            ["LBSF", 9172, 147, 275.02, 42.694733, 23.424025]
        ],
        "41": [
            ["LB45", 7523, 52, 236.8, 41.453926, 23.228556]
        ],
        "37": [
            ["LGAV", 13141, 148, 216.92, 37.952553, 23.970877],
            ["LGAV", 12461, 148, 216.95, 37.948849, 23.944876]
        ],
        "38": [
            ["LGEL", 8994, 131, 360, 38.050644, 23.554167],
            ["LGTG", 9799, 148, 284.02, 38.338047, 23.581459]
        ],
        "39": [
            ["LGSK", 5230, 98, 198.41, 39.184994, 23.507227]
        ],
        "47": [
            ["LRBM", 5858, 98, 279.12, 47.656967, 23.477995]
        ],
        "46": [
            ["LRCL", 6021, 0, 258.83, 46.78669, 23.697945],
            ["LRCT", 8202, 164, 336.608, 46.490868, 23.899263]
        ],
        "44": [
            ["LRCV", 8150, 148, 268.93, 44.318356, 23.904152]
        ],
        "49": [
            ["UK61", 8202, 185, 318.908, 49.729393, 23.680367],
            ["UKLL", 8300, 148, 316.05, 49.804443, 23.968353]
        ],
        "62": [
            ["Z11F", 8858, 0, 352.01, 62.648521, 23.558399]
        ]
    },
    "27": {
        "68": [
            ["EFIV", 8173, 148, 227.03, 68.614899, 27.427822],
            ["EFIV", 5629, 148, 272.16, 68.60582, 27.442982]
        ],
        "64": [
            ["EFKI", 8178, 157, 259.6, 64.287491, 27.717842]
        ],
        "62": [
            ["EFKU", 9158, 197, 337.18, 62.994919, 27.809092],
            ["EFVR", 6542, 148, 321.65, 62.166267, 27.877937]
        ],
        "61": [
            ["EFMI", 5573, 144, 292.59, 61.683762, 27.216835]
        ],
        "-32": [
            ["FABE", 8201, 197, 236.92, -32.889126, 27.295946]
        ],
        "-33": [
            ["FAEL", 5210, 150, 217.16, -33.030628, 27.829699],
            ["FAEL", 6443, 150, 261.87, -33.034801, 27.831652]
        ],
        "-23": [
            ["FAER", 7218, 0, 250.6, -23.738966, 27.67597]
        ],
        "-27": [
            ["FAKS", 5823, 46, 230, -27.657709, 27.322803]
        ],
        "-25": [
            ["FALA", 7302, 49, 227.33, -25.934223, 27.933403],
            ["FALA", 10018, 75, 227.33, -25.92918, 27.937361],
            ["FAPN", 9038, 98, 217.11, -25.323372, 27.182127]
        ],
        "-26": [
            ["FAVP", 5017, 0, -15.23, -26.698614, 27.779552],
            ["FAVV", 5329, 72, 188.81, -26.562481, 27.96139]
        ],
        "-21": [
            ["FBFT", 7229, 98, 278.86, -21.159985, 27.485018]
        ],
        "-22": [
            ["FBSP", 5838, 98, 283.05, -22.059162, 27.837095]
        ],
        "-18": [
            ["FVWN", 15089, 98, 248, -18.623362, 27.037573]
        ],
        "-29": [
            ["FXMM", 10916, 148, 194.55, -29.442179, 27.56052]
        ],
        "2": [
            ["FZJH", 8217, 148, 311.15, 2.819232, 27.596601]
        ],
        "-11": [
            ["FZQA", 10354, 164, 246.29, -11.585558, 27.54417]
        ],
        "29": [
            ["HE11", 6562, 140, 314.507, 29.868093, 27.948027]
        ],
        "30": [
            ["HE33", 6583, 98, 308.507, 30.726395, 27.027357]
        ],
        "31": [
            ["HEMM", 9841, 148, 239.32, 31.336164, 27.242208],
            ["HEMM", 9856, 148, 328.93, 31.313606, 27.229765]
        ],
        "44": [
            ["LB12", 8218, 0, 274.5, 44.054272, 27.194468],
            ["LR80", 8202, 262, 5.31, 44.3811, 27.725237]
        ],
        "42": [
            ["LB1J", 7232, 0, 267.4, 42.526604, 27.276737],
            ["LB1J", 8206, 0, 287.108, 42.523445, 27.2859],
            ["LBBG", 10501, 148, 224.33, 42.580433, 27.528906]
        ],
        "43": [
            ["LB43", 8200, 262, 337.908, 43.599213, 27.842314],
            ["LBWN", 8244, 180, 276.95, 43.230576, 27.840687]
        ],
        "36": [
            ["LGKO", 7880, 0, 328.06, 36.786499, 27.098726]
        ],
        "35": [
            ["LGKP", 6812, 98, 304.4, 35.416939, 27.155571]
        ],
        "45": [
            ["LR79", 8202, 262, 206.7, 45.168655, 27.438002]
        ],
        "47": [
            ["LRIA", 5901, 98, 333.81, 47.17149, 27.625298],
            ["LUBL", 7343, 140, 333.15, 47.829685, 27.789061]
        ],
        "39": [
            ["LTBF", 9725, 144, 358.62, 39.604717, 27.926668],
            ["LTFD", 6824, 98, 232.8, 39.565929, 27.033836]
        ],
        "40": [
            ["LTBG", 9997, 147, 361.3, 40.301849, 27.98237]
        ],
        "38": [
            ["LTBJ", 10603, 0, 346.69, 38.27824, 27.161228],
            ["LTBL", 9819, 147, 356.01, 38.498386, 27.01088],
            ["LTBT", 9813, 148, 319, 38.798882, 27.845013]
        ],
        "41": [
            ["LTBU", 9837, 148, 229.35, 41.145359, 27.930227]
        ],
        "37": [
            ["LTBV", 5479, 98, 243.5, 37.139458, 27.663992],
            ["LTFB", 5709, 98, 273.5, 37.950634, 27.342688],
            ["LTFE", 9793, 148, 286.67, 37.247261, 27.681515]
        ],
        "53": [
            ["UMLI", 9672, 0, 340.45, 53.761665, 27.586678],
            ["UMMM", 6503, 197, 304.06, 53.859985, 27.553387]
        ]
    },
    "29": {
        "62": [
            ["EFJO", 8179, 171, 290.32, 62.656792, 29.643435]
        ],
        "65": [
            ["EFKS", 8177, 148, 312.18, 65.979996, 29.259897]
        ],
        "69": [
            ["ENKR", 6233, 148, 249.08, 69.728348, 29.912577]
        ],
        "-23": [
            ["FALM", 13189, 151, 268.7, -23.159531, 29.716389],
            ["FAPI", 7218, 82, 244, -23.912313, 29.493067],
            ["FAPP", 8427, 148, 178.99, -23.837294, 29.458387],
            ["FAPP", 7646, 148, 217.81, -23.84222, 29.461184]
        ],
        "-22": [
            ["FAMS", 6299, 0, 282.706, -22.357903, 29.995684],
            ["FAVM", 5085, 49, 251, -22.445795, 29.344885]
        ],
        "-19": [
            ["FVTL", 8600, 0, 301.5, -19.447819, 29.868998]
        ],
        "-1": [
            ["FZNA", 9885, 148, 354.03, -1.684716, 29.231693]
        ],
        "-5": [
            ["FZRF", 5741, 90, 235, -5.86189, 29.256323]
        ],
        "-3": [
            ["HBBA", 6261, 0, 201.9, -3.321711, 29.323437],
            ["HBBA", 11869, 148, 351.08, -3.341341, 29.321182]
        ],
        "31": [
            ["HEAX", 7225, 148, 224.97, 31.188677, 29.954489],
            ["HEAX", 5921, 98, 359.99, 31.177631, 29.948904]
        ],
        "30": [
            ["HEBA", 11169, 148, 322.94, 30.905914, 29.706587]
        ],
        "25": [
            ["HEDK", 8183, 148, 329.37, 25.401922, 29.009338]
        ],
        "11": [
            ["HSLI", 8208, 175, 241.89, 11.143331, 29.710938]
        ],
        "37": [
            ["LTAY", 9833, 148, 238.86, 37.79253, 29.715902]
        ],
        "40": [
            ["LTBE", 5237, 0, 268.75, 40.233826, 29.016621],
            ["LTBR", 9820, 98, 253.5, 40.25948, 29.580364],
            ["LTBR", 9816, 148, 254.26, 40.260384, 29.57976],
            ["LTFJ", 9694, 148, 244.06, 40.904362, 29.325039]
        ],
        "38": [
            ["LTBO", 8399, 0, 262.5, 38.685516, 29.484503]
        ]
    },
    "28": {
        "61": [
            ["EFLP", 8181, 197, 246.74, 61.048977, 28.165691],
            ["EFSA", 7525, 148, 305.67, 61.937035, 28.962959]
        ],
        "-25": [
            ["FAGC", 5663, 75, 332.88, -25.993906, 28.144621],
            ["FASK", 6520, 98, 184, -25.802729, 28.164026],
            ["FAWB", 5993, 98, 272.31, -25.65324, 28.231142],
            ["FAWK", 11031, 148, 172.04, -25.814104, 28.220039],
            ["FAWK", 6306, 148, 224.66, -25.821245, 28.232105]
        ],
        "-26": [
            ["FAGM", 5619, 50, 269.24, -26.242445, 28.157717],
            ["FAJS", 11206, 197, 195.55, -26.135147, 28.257284],
            ["FAJS", 14541, 200, 195.59, -26.107988, 28.246262],
            ["FASI", 5249, 59, 194, -26.241232, 28.400726]
        ],
        "-31": [
            ["FAUT", 6562, 75, 293, -31.549334, 28.683332]
        ],
        "-15": [
            ["FLLC", 6594, 83, 252.5, -15.411088, 28.33963],
            ["FLLS", 13060, 150, 274.89, -15.330821, 28.470865]
        ],
        "-11": [
            ["FLMA", 5610, 0, 276, -11.131109, 28.864864]
        ],
        "-12": [
            ["FLND", 8259, 150, 270.67, -12.997602, 28.677273],
            ["FLSO", 6562, 100, 285, -12.90194, 28.158989]
        ],
        "-20": [
            ["FVBU", 8493, 148, 295.37, -20.026255, 28.637606]
        ],
        "-16": [
            ["FVKB", 5413, 59, 262.74, -16.518856, 28.892612]
        ],
        "-2": [
            ["FZMA", 6562, 148, 346, -2.308721, 28.818846]
        ],
        "29": [
            ["HE31", 5750, 102, 320.006, 29.805075, 28.553535]
        ],
        "22": [
            ["HEOW", 11521, 148, 188.47, 22.601297, 28.719164]
        ],
        "43": [
            ["LB25", 8095, 0, 338.41, 43.413433, 28.186928]
        ],
        "36": [
            ["LGRD", 7887, 148, 260.01, 36.386288, 28.122982],
            ["LGRP", 10832, 148, 250.03, 36.410427, 28.103542],
            ["LTBS", 9820, 148, 195.28, 36.7262, 28.796932]
        ],
        "44": [
            ["LRCK", 11446, 148, 5.58, 44.346485, 28.48632]
        ],
        "45": [
            ["LRTC", 6522, 98, 347.54, 45.054138, 28.717178]
        ],
        "40": [
            ["LTBA", 7503, 0, 241.35, 40.975788, 28.833046],
            ["LTBA", 9849, 0, 360.99, 40.969654, 28.806509],
            ["LTBA", 9813, 0, 361.3, 40.969803, 28.80901]
        ],
        "47": [
            ["LU65", 8235, 0, 252, 47.86697, 28.232664]
        ],
        "46": [
            ["LUKK", 11784, 145, 268.03, 46.928333, 28.954485]
        ],
        "49": [
            ["UKWW", 8202, 0, 309.8, 49.227203, 28.611553]
        ],
        "57": [
            ["ULOO", 7059, 144, 198.77, 57.793327, 28.403343]
        ],
        "53": [
            ["UMMS", 12057, 197, 319.11, 53.869999, 28.05003]
        ],
        "-23": [
            ["Z27L", 5429, 0, 267.805, -23.260664, 28.433983]
        ]
    },
    "19": {
        "60": [
            ["EFMA", 6227, 197, 203.38, 60.130035, 19.904961]
        ],
        "50": [
            ["EPKK", 8353, 197, 257.78, 50.080219, 19.802803],
            ["EPKT", 9164, 195, 270.2, 50.474209, 19.094105]
        ],
        "51": [
            ["EPLK", 8143, 190, 287.4, 51.548325, 19.196198]
        ],
        "54": [
            ["EPMB", 8184, 197, 259.01, 54.033726, 19.193598]
        ],
        "63": [
            ["ESNO", 6588, 148, 301.59, 63.404507, 19.005444]
        ],
        "65": [
            ["ESNX", 6541, 148, 308.2, 65.584686, 19.298784]
        ],
        "64": [
            ["ESUA", 6696, 0, 343, 64.561768, 19.320419]
        ],
        "-11": [
            ["FNUE", 7874, 130, 280, -11.772976, 19.900764]
        ],
        "17": [
            ["FTTY", 7555, 148, 237.38, 17.922304, 19.124916]
        ],
        "-17": [
            ["FYRU", 10963, 98, 251.75, -17.951775, 19.734385]
        ],
        "3": [
            ["FZFK", 7218, 148, 284.4, 3.2642, 19.77627]
        ],
        "28": [
            ["HL74", 7495, 0, 351.508, 28.488054, 19.006062],
            ["HLWA", 6890, 94, 1.8, 28.28046, 19.945314],
            ["HLZT", 5906, 0, 331.8, 28.948975, 19.775444]
        ],
        "30": [
            ["HLMB", 7220, 100, 326.007, 30.369926, 19.582861]
        ],
        "41": [
            ["LAGJ", 9186, 197, 333.509, 41.884041, 19.606161],
            ["LAGJ", 7223, 78, 349.507, 41.876637, 19.59384],
            ["LATI", 8976, 148, 354.3, 41.402481, 19.7222]
        ],
        "40": [
            ["LAKV", 9318, 220, 316.509, 40.762611, 19.913502]
        ],
        "39": [
            ["LGKR", 7793, 148, 348.79, 39.591236, 19.914871]
        ],
        "47": [
            ["LHBP", 9861, 149, 312.38, 47.430473, 19.250273],
            ["LHBP", 12148, 149, 312.41, 47.422943, 19.293888]
        ],
        "46": [
            ["LHKE", 8399, 197, 302.708, 46.911266, 19.763412]
        ],
        "43": [
            ["LY88", 10130, 148, 287.01, 43.894844, 19.716032]
        ],
        "42": [
            ["LYPG", 8206, 148, 4.31, 42.348171, 19.250734]
        ],
        "48": [
            ["LZSL", 7651, 197, 361.94, 48.627354, 19.13357]
        ]
    },
    "26": {
        "65": [
            ["EFPU", 6562, 148, 268.1, 65.402519, 26.968555]
        ],
        "60": [
            ["EFUT", 6545, 148, 258.04, 60.898247, 26.956409]
        ],
        "-29": [
            ["FABL", 8424, 151, 180.34, -29.081949, 26.30249],
            ["FABL", 7197, 151, 281.89, -29.093618, 26.307493]
        ],
        "-27": [
            ["FAWM", 6643, 59, 229.04, -27.992205, 26.676958]
        ],
        "-25": [
            ["FAZR", 6480, 100, 205, -25.589163, 26.046356],
            ["FMMM", 5046, 0, 193.6, -25.690481, 26.913195]
        ],
        "-20": [
            ["FBSN", 5381, 66, 283.805, -20.555109, 26.123421]
        ],
        "43": [
            ["LB0G", 7215, 0, 250.8, 43.697224, 26.592842],
            ["LB16", 7260, 0, 293.007, 43.301849, 26.71575],
            ["LB24", 8210, 0, 235.3, 43.695499, 26.070019]
        ],
        "42": [
            ["LB17", 8155, 0, 270.9, 42.646034, 26.373184],
            ["LB18", 8200, 80, 340.108, 42.336742, 26.578705],
            ["LB19", 8200, 72, 266.3, 42.601204, 26.64892],
            ["LB44", 8190, 0, 299.708, 42.449375, 26.365444]
        ],
        "41": [
            ["LB38", 6710, 55, 217.1, 41.836304, 26.297915],
            ["Z08G", 6778, 0, 192.4, 41.920891, 26.236794]
        ],
        "39": [
            ["LGMT", 7896, 148, 330.07, 39.047436, 26.607462]
        ],
        "37": [
            ["LGSM", 6655, 148, 274.31, 37.689514, 26.924122]
        ],
        "35": [
            ["LGST", 6804, 148, 231, 35.22337, 26.109779]
        ],
        "45": [
            ["LR82", 8202, 262, 223.8, 45.224541, 26.989658]
        ],
        "46": [
            ["LRBC", 8160, 262, 344.85, 46.511101, 26.914429]
        ],
        "44": [
            ["LRBS", 10468, 148, 253.87, 44.507195, 26.12159],
            ["LROP", 11429, 148, 263.94, 44.567966, 26.120466],
            ["LROP", 11422, 148, 263.95, 44.579922, 26.127802]
        ],
        "47": [
            ["LRSV", 5864, 98, 343.17, 47.679771, 26.357485]
        ],
        "40": [
            ["LTBH", 5906, 98, 223.1, 40.140903, 26.431404]
        ],
        "38": [
            ["LTFA", 10761, 148, 352, 38.507103, 26.976414]
        ],
        "49": [
            ["UK62", 7219, 0, 346.307, 49.350063, 26.943975]
        ],
        "50": [
            ["UKLR", 8609, 138, 298.07, 50.602497, 26.159195]
        ],
        "63": [
            ["Z11D", 9816, 0, 323.41, 63.852921, 26.843348]
        ],
        "67": [
            ["Z11E", 8241, 0, 228.2, 67.070267, 26.551617]
        ]
    },
    "22": {
        "62": [
            ["EFSI", 5047, 98, 316.18, 62.687126, 22.842772]
        ],
        "60": [
            ["EFTU", 8181, 197, 264.85, 60.515121, 22.285517]
        ],
        "50": [
            ["EPRZ", 10485, 148, 271.19, 50.109585, 22.046339]
        ],
        "65": [
            ["ESPA", 10956, 148, 317.29, 65.532715, 22.146597]
        ],
        "-34": [
            ["FAGG", 6550, 148, 267.81, -34.005173, 22.389343]
        ],
        "-33": [
            ["FAOH", 5577, 98, 190.9, -33.593231, 22.191017]
        ],
        "-27": [
            ["FATW", 5020, 0, 347, -27.231148, 22.480591]
        ],
        "-18": [
            ["FYOE", 5580, 0, 247.5, -18.026569, 22.196407]
        ],
        "-5": [
            ["FZUA", 7219, 148, 283.06, -5.904835, 22.487656]
        ],
        "32": [
            ["HL52", 11781, 0, 321.312, 32.529545, 22.757227]
        ],
        "28": [
            ["HLFL", 7051, 148, 345.107, 28.78602, 22.083775]
        ],
        "27": [
            ["HLML", 7218, 0, 352, 27.965193, 22.359894],
            ["HLSA", 7218, 160, 342, 27.648911, 22.511787]
        ],
        "13": [
            ["HSGN", 5319, 0, 220.81, 13.484236, 22.473188],
            ["HSGN", 6196, 0, 286.79, 13.482657, 22.4753]
        ],
        "42": [
            ["LB13", 8187, 160, 293.708, 42.439724, 22.997429]
        ],
        "44": [
            ["LB40", 6888, 0, 270.3, 44.021282, 22.817421]
        ],
        "40": [
            ["LGAX", 5904, 98, 312, 40.650135, 22.495432],
            ["LGTS", 7985, 164, 283.94, 40.516693, 22.986996],
            ["LGTS", 7920, 197, 346.37, 40.509163, 22.974312]
        ],
        "39": [
            ["LGBL", 9133, 148, 261.71, 39.222214, 22.81086],
            ["LGLR", 9711, 98, 259.5, 39.651035, 22.465618],
            ["LGSV", 5249, 98, 242, 39.478374, 22.791567]
        ],
        "37": [
            ["LGKL", 8736, 148, 349.43, 37.056629, 22.028143],
            ["LGTP", 6368, 98, 202, 37.524765, 22.404125]
        ],
        "45": [
            ["LRCS", 6513, 148, 289.95, 45.417168, 22.264256]
        ],
        "47": [
            ["LRSM", 8159, 148, 193.04, 47.714317, 22.889359]
        ],
        "48": [
            ["UKLU", 6653, 131, 283.17, 48.632923, 22.277311]
        ]
    },
    "-9": {
        "52": [
            ["EIKY", 6549, 148, 251.23, 52.183762, -9.509914]
        ],
        "30": [
            ["GMAA", 9547, 148, 279.01, 30.379314, -9.531301],
            ["GMAD", 10488, 148, 271.58, 30.322227, -9.394871]
        ],
        "31": [
            ["GMMI", 6864, 148, 338.77, 31.388313, -9.67805]
        ],
        "16": [
            ["GQNA", 5249, 100, 213, 16.7227, -9.629239]
        ],
        "38": [
            ["LPAR", 8207, 148, 212.55, 38.892654, -9.022243],
            ["LPMT", 7197, 148, 186.52, 38.719547, -9.035471],
            ["LPMT", 8003, 148, 252.39, 38.711639, -9.010382],
            ["LPPT", 12495, 148, 202.67, 38.796921, -9.127573],
            ["LPPT", 7906, 148, 348.15, 38.765041, -9.131572],
            ["LPST", 5869, 131, 315.52, 38.825294, -9.332414]
        ]
    },
    "16": {
        "69": [
            ["ENAN", 5465, 148, 211.47, 69.295761, 16.149948],
            ["ENAN", 8067, 0, 329.73, 69.287933, 16.151371]
        ],
        "68": [
            ["ENEV", 9202, 148, 357.6, 68.478676, 16.67955]
        ],
        "54": [
            ["EPKO", 8268, 0, 250.69, 54.046383, 16.283918]
        ],
        "52": [
            ["EPKS", 8145, 196, 297.88, 52.326702, 16.982752],
            ["EPPO", 8197, 0, 287.56, 52.418167, 16.841125]
        ],
        "51": [
            ["EPLE", 5239, 131, 260.01, 51.183968, 16.189137],
            ["EPWR", 8196, 197, 295.96, 51.098953, 16.897987]
        ],
        "53": [
            ["EPMI", 8149, 160, 304.8, 53.388649, 16.09815],
            ["EPPI", 7876, 195, 215.5, 53.178204, 16.721109]
        ],
        "58": [
            ["ESCK", 7367, 125, 327.8, 58.602333, 16.113863],
            ["ESKN", 9420, 148, 263.08, 58.789772, 16.929863],
            ["ESKN", 6674, 131, 341.8, 58.783966, 16.915104],
            ["ESKX", 6562, 0, 302, 58.786057, 16.58584],
            ["ESSP", 7209, 148, 270.87, 58.585808, 16.269592]
        ],
        "56": [
            ["ESMQ", 6712, 148, 332.19, 56.680534, 16.292288]
        ],
        "59": [
            ["ESOW", 8185, 164, 191.65, 59.600464, 16.638199],
            ["ESSU", 6172, 115, 358.06, 59.342613, 16.708961]
        ],
        "60": [
            ["ESSK", 6545, 148, 360.99, 60.584152, 16.950905]
        ],
        "-28": [
            ["FAAB", 5945, 151, 162.56, -28.566101, 16.531105],
            ["FYOG", 5266, 59, 180, -28.57749, 16.446667]
        ],
        "1": [
            ["FCOU", 6726, 98, 197, 1.62349, 16.038803]
        ],
        "-12": [
            ["FNKU", 8202, 98, 248, -12.399044, 16.958656]
        ],
        "-9": [
            ["FNMA", 7283, 98, 300, -9.521648, 16.325438]
        ],
        "8": [
            ["FTTD", 5926, 115, 214.89, 8.631135, 16.07609]
        ],
        "-17": [
            ["FYEN", 5735, 98, 256.8, -17.481207, 16.329985]
        ],
        "-27": [
            ["FYSA", 5753, 0, 332.39, -27.882935, 16.651726]
        ],
        "29": [
            ["HL69", 13729, 197, 320.314, 29.183582, 16.01498],
            ["HL72", 6515, 70, 293.307, 29.135517, 16.169548]
        ],
        "25": [
            ["HL79", 12480, 100, 240.2, 25.36525, 16.826357]
        ],
        "31": [
            ["HLGD", 12008, 148, 1.3, 31.0452, 16.59123]
        ],
        "43": [
            ["LDSP", 8339, 148, 232.53, 43.545937, 16.310556]
        ],
        "46": [
            ["LDVA", 5720, 98, 340.51, 46.287136, 16.387096]
        ],
        "45": [
            ["LDZA", 10659, 148, 226.75, 45.7519, 16.082457]
        ],
        "41": [
            ["LIBD", 7993, 148, 249.44, 41.142326, 16.774107]
        ],
        "40": [
            ["LIBV", 9970, 148, 322.03, 40.754875, 16.945435],
            ["LIBV", 9994, 98, 321.29, 40.761944, 16.94479]
        ],
        "38": [
            ["LICA", 7911, 148, 278.52, 38.903786, 16.256056]
        ],
        "49": [
            ["LKNA", 7850, 147, 309.008, 49.159054, 16.137718],
            ["LKTB", 8680, 197, 277.52, 49.14975, 16.711927]
        ],
        "48": [
            ["LOWW", 11464, 148, 295.97, 48.109035, 16.575665],
            ["LOWW", 11804, 148, 344.21, 48.088627, 16.591351]
        ]
    },
    "18": {
        "69": [
            ["ENDU", 7991, 148, 289.02, 69.052361, 18.567886],
            ["ENTC", 7821, 148, 193.07, 69.693474, 18.925722]
        ],
        "54": [
            ["EPGD", 9163, 148, 292.95, 54.371258, 18.491751],
            ["EPOK", 8184, 195, 316.37, 54.571507, 18.530521],
            ["EPPR", 6556, 197, 280.78, 54.246513, 18.688034]
        ],
        "60": [
            ["ESKA", 6562, 0, 232, 60.138317, 18.11924]
        ],
        "64": [
            ["ESNL", 6545, 98, 322.94, 64.542366, 18.726685]
        ],
        "57": [
            ["ESSV", 6547, 148, 200.98, 57.671177, 18.352219]
        ],
        "-29": [
            ["FAAG", 6824, 66, 229.5, -29.275669, 18.822027]
        ],
        "-33": [
            ["FACT", 10526, 200, 165.23, -33.95982, 18.600019],
            ["FACT", 5578, 151, 315.22, -33.972237, 18.610456],
            ["FAYP", 5209, 75, 176.51, -33.894985, 18.499722]
        ],
        "-32": [
            ["FALW", 7462, 150, 181.2, -32.958794, 18.166555],
            ["FALW", 6314, 150, 181.16, -32.961861, 18.162407],
            ["FALW", 5815, 150, 316.34, -32.978653, 18.168459]
        ],
        "1": [
            ["FCOI", 6726, 0, 259, 1.585546, 18.058968]
        ],
        "4": [
            ["FEFF", 8570, 148, 345.45, 4.388025, 18.522287]
        ],
        "-19": [
            ["FYGF", 11680, 148, 249, -19.594242, 18.149208]
        ],
        "-26": [
            ["FYKT", 7618, 148, 195.85, -26.529661, 18.114664]
        ],
        "-5": [
            ["FZCA", 5151, 95, 233, -5.029072, 18.788996]
        ],
        "0": [
            ["FZEA", 7141, 148, 353.07, 0.02, 18.290697]
        ],
        "30": [
            ["HL80", 6890, 100, 312.507, 30.630489, 18.338655],
            ["HLNF", 6295, 98, 359.006, 30.494616, 18.527615]
        ],
        "42": [
            ["LDDU", 10812, 148, 298.27, 42.555798, 18.282257],
            ["LYTV", 8196, 148, 318.98, 42.396187, 18.733276]
        ],
        "45": [
            ["LDOS", 8186, 148, 290.58, 45.458401, 18.826323]
        ],
        "47": [
            ["LH58", 6740, 62, 221.2, 47.357845, 18.438999],
            ["LHTL", 8200, 0, 321.508, 47.336685, 18.991261]
        ],
        "40": [
            ["LIBN", 6168, 197, 320, 40.23185, 18.142124]
        ],
        "49": [
            ["LKMT", 11504, 207, 226.29, 49.707119, 18.128479]
        ],
        "43": [
            ["LQSA", 8521, 150, 297.4, 43.819389, 18.345339]
        ],
        "44": [
            ["LQTZ", 8125, 148, 276.01, 44.457497, 18.740358]
        ],
        "48": [
            ["LZTN", 6552, 98, 222.97, 48.870735, 18.001532]
        ]
    },
    "15": {
        "78": [
            ["ENSB", 7598, 148, 285.34, 78.243286, 15.516413]
        ],
        "53": [
            ["EP59", 7545, 0, 289.608, 53.757603, 15.306684],
            ["EPSN", 8182, 190, 290.8, 53.786629, 15.844007]
        ],
        "52": [
            ["EPZG", 8188, 197, 244.64, 52.143326, 15.815085]
        ],
        "58": [
            ["ESCF", 7248, 115, 198.32, 58.405609, 15.527909],
            ["ESCF", 6120, 121, 263.23, 58.40361, 15.54738],
            ["ESSL", 6972, 131, 292.18, 58.402676, 15.697142]
        ],
        "56": [
            ["ESDF", 7632, 148, 188.69, 56.277615, 15.268236],
            ["ESFQ", 6515, 0, 353.23, 56.835377, 15.45463]
        ],
        "61": [
            ["ESNF", 6955, 0, 300.44, 61.892841, 15.723533]
        ],
        "59": [
            ["ESOE", 8514, 148, 191.68, 59.233852, 15.042045],
            ["ESQO", 6545, 131, 328, 59.380753, 15.930096]
        ],
        "60": [
            ["ESSD", 7561, 148, 312.43, 60.415089, 15.530865]
        ],
        "57": [
            ["ESSF", 6368, 131, 296.03, 57.521912, 15.838563]
        ],
        "-4": [
            ["FCBB", 10871, 148, 230.07, -4.242123, 15.264465],
            ["FZAA", 15279, 197, 237.17, -4.374211, 15.462348]
        ],
        "0": [
            ["FCOM", 5828, 0, 248.44, -0.018695, 15.582938],
            ["FCOO", 5906, 0, 260, -0.548577, 15.957977]
        ],
        "5": [
            ["FEFO", 6234, 0, 347, 5.946989, 15.642314]
        ],
        "4": [
            ["FEFT", 5474, 98, 348.16, 4.214065, 15.78792]
        ],
        "-14": [
            ["FN18", 8015, 98, 276.008, -14.728683, 15.025311]
        ],
        "-12": [
            ["FNHU", 8727, 148, 284, -12.81066, 15.775104]
        ],
        "-7": [
            ["FNNG", 7874, 98, 333, -7.759606, 15.304947],
            ["FNUG", 6562, 55, 180, -7.601382, 15.032188]
        ],
        "12": [
            ["FTTJ", 9200, 148, 225.77, 12.142494, 15.043249]
        ],
        "-21": [
            ["FYKA", 8369, 0, 246, -21.86198, 15.877965]
        ],
        "-26": [
            ["FYLZ", 5981, 98, 196.83, -26.675819, 15.246747]
        ],
        "-17": [
            ["FYOA", 9763, 98, 245.46, -17.872707, 15.965452],
            ["FYOS", 5350, 0, 338.505, -17.803768, 15.70181]
        ],
        "32": [
            ["HL76", 11140, 0, 326.411, 32.312614, 15.070945]
        ],
        "29": [
            ["HLON", 5906, 98, 310, 29.131802, 15.956148]
        ],
        "44": [
            ["LDZD", 6518, 147, 221.57, 44.092762, 15.357666],
            ["LDZD", 8159, 147, 315.76, 44.100346, 15.357422],
            ["LDZU", 9003, 98, 306.6, 44.551662, 15.794468]
        ],
        "41": [
            ["LIBA", 9162, 144, 293.97, 41.535587, 15.729928]
        ],
        "37": [
            ["LICC", 7978, 148, 263.95, 37.46793, 15.080125]
        ],
        "38": [
            ["LICR", 5616, 148, 292.63, 38.069221, 15.657526],
            ["LICR", 6553, 148, 332.86, 38.065365, 15.655356]
        ],
        "45": [
            ["LJCE", 7980, 150, 268, 45.900341, 15.545899]
        ],
        "46": [
            ["LJMB", 8157, 148, 326.15, 46.470562, 15.695177],
            ["LOWG", 9838, 148, 349.35, 46.977676, 15.443314]
        ],
        "49": [
            ["LKCV", 7875, 197, 317.808, 49.931644, 15.393079]
        ],
        "50": [
            ["LKHK", 7865, 187, 335.03, 50.24398, 15.855274],
            ["LKMH", 5075, 98, 246.97, 50.541397, 15.011875],
            ["LKPD", 8089, 246, 272.76, 50.01292, 15.755819]
        ],
        "54": [
            ["Z24N", 7990, 0, 255, 54.203552, 15.70504]
        ]
    },
    "17": {
        "52": [
            ["EP0A", 7543, 0, 285.208, 52.53167, 17.235188],
            ["EPPW", 11464, 197, 287.4, 52.374374, 17.876705],
            ["EPPW", 8875, 98, 287.39, 52.378651, 17.866865]
        ],
        "53": [
            ["EPBY", 8185, 197, 262.03, 53.098358, 17.996183]
        ],
        "54": [
            ["EPCE", 8184, 170, 255.99, 54.419235, 17.78352],
            ["EPSK", 7202, 197, 266.78, 54.479439, 17.124474]
        ],
        "59": [
            ["ESCM", 6234, 131, 213.2, 59.907436, 17.601913],
            ["ESCM", 6424, 131, 254.86, 59.899384, 17.603882],
            ["ESKS", 6562, 0, 342, 59.305325, 17.114616],
            ["ESSA", 8181, 148, 190.41, 59.646793, 17.960079],
            ["ESSA", 10803, 148, 190.37, 59.666397, 17.923773],
            ["ESSA", 8183, 148, 255.87, 59.663891, 17.979191],
            ["ESSB", 5459, 148, 305.03, 59.350086, 17.95105]
        ],
        "60": [
            ["ESKT", 6562, 0, 342, 60.336437, 17.427565]
        ],
        "63": [
            ["ESNI", 7349, 0, 343, 63.62286, 17.942747],
            ["ESNK", 6545, 148, 351.53, 63.039715, 17.77177]
        ],
        "62": [
            ["ESNN", 6839, 148, 340.16, 62.518913, 17.451128],
            ["ESNT", 6562, 82, 302, 62.474979, 17.016527]
        ],
        "61": [
            ["ESNY", 8260, 131, 309.59, 61.254257, 17.117205]
        ],
        "64": [
            ["ESUD", 7466, 131, 331.56, 64.951889, 17.708105]
        ],
        "-29": [
            ["FASB", 5213, 66, 259, -29.687023, 17.951488]
        ],
        "-14": [
            ["FNME", 11483, 147, 298, -14.657379, 17.747705]
        ],
        "-24": [
            ["FYML", 6562, 82, 174, -24.5952, 17.923965]
        ],
        "-22": [
            ["FYWE", 6487, 98, 171.23, -22.59626, 17.077507],
            ["FYWH", 15010, 148, 243.54, -22.471395, 17.489393],
            ["FYWH", 5009, 98, 321.28, -22.488384, 17.47834]
        ],
        "28": [
            ["HLDB", 5906, 0, 361.5, 28.967085, 17.588299],
            ["HLZA", 7050, 95, 297.407, 28.585419, 17.303635]
        ],
        "29": [
            ["HLRA", 6880, 100, 307.51, 29.466816, 17.943535]
        ],
        "47": [
            ["LHPA", 7874, 0, 340.308, 47.35379, 17.506109],
            ["LHSA", 6562, 197, 339.407, 47.06942, 17.973093]
        ],
        "46": [
            ["LHSM", 8199, 0, 345.35, 46.675499, 17.163176],
            ["LHTA", 8199, 0, 344.84, 46.382229, 17.921724]
        ],
        "38": [
            ["LIBC", 6567, 148, 348.89, 38.988319, 17.082417]
        ],
        "40": [
            ["LIBG", 5613, 148, 348.67, 40.509956, 17.405201],
            ["LIBR", 6341, 148, 232.51, 40.662548, 17.954338],
            ["LIBR", 8306, 148, 317.13, 40.655544, 17.950359]
        ],
        "49": [
            ["LKKU", 6555, 98, 205.36, 49.037529, 17.445724],
            ["LKPO", 8109, 197, 246.07, 49.430431, 17.420506]
        ],
        "44": [
            ["LQBK", 8213, 148, 349.73, 44.930325, 17.300337]
        ],
        "43": [
            ["LQMO", 7876, 158, 337.77, 43.272915, 17.851471]
        ],
        "48": [
            ["LZIB", 9505, 197, 223.88, 48.179596, 17.226488],
            ["LZIB", 9665, 148, 313.97, 48.157295, 17.232552],
            ["LZMC", 8038, 185, 200, 48.413692, 17.125681],
            ["LZPP", 6512, 98, 193.61, 48.633789, 17.831757]
        ],
        "22": [
            ["Z19X", 12467, 0, 335.412, 22.629627, 17.704237]
        ]
    },
    "20": {
        "51": [
            ["EP63", 6573, 0, 295.807, 51.580608, 20.110472]
        ],
        "52": [
            ["EPMO", 8283, 197, 260.14, 52.453327, 20.671976],
            ["EPSO", 8200, 190, 289.008, 52.194592, 20.308414],
            ["EPWA", 9190, 164, 294.55, 52.161163, 20.983471],
            ["EPWA", 12088, 197, 331.76, 52.149353, 20.981462]
        ],
        "53": [
            ["EPSY", 6551, 197, 198.46, 53.488251, 20.941277]
        ],
        "67": [
            ["ESNG", 5606, 148, 297.93, 67.128799, 20.832115],
            ["ESNQ", 8180, 148, 213.69, 67.831314, 20.353249]
        ],
        "66": [
            ["ESNJ", 6531, 82, 324.18, 66.488106, 20.161888]
        ],
        "63": [
            ["ESNU", 7529, 148, 318.46, 63.783089, 20.300282]
        ],
        "65": [
            ["ESPE", 7502, 115, 296.45, 65.87249, 20.175873],
            ["ESUF", 6562, 0, 344, 65.098839, 20.767004]
        ],
        "-34": [
            ["FAOB", 6806, 131, 255.44, -34.554497, 20.251209],
            ["FAOB", 10305, 151, 324.31, -34.577229, 20.269894]
        ],
        "-26": [
            ["FB0A", 6221, 0, 321.606, -26.454849, 20.61235]
        ],
        "-7": [
            ["FNDU", 6468, 80, 220.6, -7.394145, 20.824301]
        ],
        "-9": [
            ["FNSA", 11155, 148, 311, -9.710025, 20.445045]
        ],
        "13": [
            ["FTTC", 9185, 98, 272.48, 13.846889, 20.856209]
        ],
        "4": [
            ["FZFD", 10503, 197, 252.72, 4.248215, 20.958319]
        ],
        "32": [
            ["HLLB", 11823, 148, 329.9, 32.083603, 20.278072],
            ["HLLB", 11810, 148, 330.32, 32.08485, 20.280869]
        ],
        "29": [
            ["HLZG", 5633, 100, 332, 29.03817, 20.785814]
        ],
        "30": [
            ["HLZU", 5577, 0, 242, 30.878584, 20.077868],
            ["HLZU", 5827, 0, 352, 30.867079, 20.071295]
        ],
        "39": [
            ["LGIO", 7878, 148, 321.76, 39.688847, 20.83058]
        ],
        "38": [
            ["LGKF", 8009, 148, 326.08, 38.111328, 20.509634],
            ["LGPZ", 9798, 0, 249.96, 38.930714, 20.782896],
            ["LGPZ", 9745, 148, 249.94, 38.932774, 20.781693]
        ],
        "37": [
            ["LGZA", 7316, 98, 343.51, 37.741508, 20.887796]
        ],
        "47": [
            ["LHSN", 6562, 229, 200.9, 47.131264, 20.240219]
        ],
        "41": [
            ["LWOH", 8361, 140, 197.64, 41.190845, 20.746946]
        ],
        "44": [
            ["LY87", 7165, 98, 315.207, 44.767345, 20.971087],
            ["LYBE", 11144, 148, 301.97, 44.810448, 20.327242],
            ["LYBT", 8181, 148, 305.108, 44.934544, 20.263594]
        ],
        "42": [
            ["LYDK", 5881, 98, 357.08, 42.426384, 20.428335]
        ],
        "49": [
            ["LZTT", 8476, 148, 274.12, 49.07275, 20.258841]
        ],
        "54": [
            ["UMKK", 8206, 148, 243.62, 54.895, 20.611696],
            ["Z25W", 9805, 0, 272.7, 54.765953, 20.420296]
        ],
        "43": [
            ["Z27U", 8190, 0, 306.208, 43.267872, 20.062796]
        ]
    },
    "31": {
        "-22": [
            ["FA0E", 6849, 0, 305.707, -22.775133, 31.022892]
        ],
        "-24": [
            ["FAHS", 5758, 88, 256.5, -24.378777, 31.053955],
            ["FAHS", 12162, 151, 344.04, -24.373316, 31.057087],
            ["FASZ", 5085, 98, 335.01, -24.967251, 31.591982]
        ],
        "-25": [
            ["FAKN", 10198, 148, 214.08, -25.37184, 31.114038]
        ],
        "-28": [
            ["FAUL", 5397, 75, 214.35, -28.314777, 31.421232]
        ],
        "-26": [
            ["FDMS", 8535, 148, 233.91, -26.521416, 31.31811]
        ],
        "-8": [
            ["FLBA", 8570, 0, 293.809, -8.861337, 31.340555]
        ],
        "-13": [
            ["FLMF", 7216, 98, 263.46, -13.263776, 31.943434]
        ],
        "-21": [
            ["FVCZ", 5186, 98, 309.92, -21.013178, 31.585051]
        ],
        "-17": [
            ["FVHA", 15500, 151, 224.87, -17.916645, 31.108641]
        ],
        "30": [
            ["HE12", 8481, 141, 227.1, 30.342392, 31.45657],
            ["HE12", 8646, 131, 270.1, 30.330305, 31.461895],
            ["HE13", 10600, 130, 196.1, 30.064272, 31.84247],
            ["HE13", 11000, 130, 200.1, 30.064274, 31.84671],
            ["HE32", 9084, 131, 319.209, 30.956417, 31.441099],
            ["HE32", 9047, 131, 345.209, 30.957441, 31.440664],
            ["HE37", 11250, 150, 225.1, 30.410505, 31.608782],
            ["HE37", 8448, 150, 273.1, 30.386532, 31.610197],
            ["HE37", 5017, 150, 276.1, 30.404625, 31.610769],
            ["HE37", 9570, 160, 349.11, 30.385935, 31.610138],
            ["HE42", 9054, 114, 346.109, 30.566988, 31.132637],
            ["HE43", 9862, 0, 362.11, 30.5812, 31.663855],
            ["HE43", 9843, 0, 362.11, 30.581182, 31.664852],
            ["HEAZ", 6752, 148, 360.81, 30.08349, 31.359699],
            ["HECA", 13128, 197, 229.09, 30.123266, 31.429665],
            ["HECA", 10834, 197, 229.34, 30.139091, 31.406286],
            ["HECA", 10449, 197, 342.58, 30.110859, 31.416058],
            ["Z10T", 9860, 0, 351.41, 30.404736, 31.686897]
        ],
        "29": [
            ["HE15", 9795, 0, 315.11, 29.812235, 31.341619],
            ["HE15", 9200, 0, 315.509, 29.814264, 31.341303],
            ["HEBF", 11565, 0, 189.1, 29.213446, 31.021854],
            ["HEBF", 9843, 0, 236.1, 29.226379, 31.02697]
        ],
        "28": [
            ["HE38", 9886, 121, 14.1, 28.962337, 31.696125],
            ["HE38", 9886, 105, 194.1, 28.988636, 31.703678],
            ["HE38", 9886, 120, 194.1, 28.989033, 31.701872]
        ],
        "27": [
            ["HEAT", 9911, 148, 309.94, 27.037777, 31.023684]
        ],
        "22": [
            ["HEBL", 9868, 148, 330.05, 22.364218, 31.619028]
        ],
        "4": [
            ["HSSJ", 7892, 148, 310.37, 4.864997, 31.60939]
        ],
        "9": [
            ["HSSM", 6573, 0, 224.11, 9.565436, 31.658606]
        ],
        "39": [
            ["LTAV", 11150, 98, 293.5, 39.443371, 31.382723]
        ],
        "47": [
            ["UKON", 8427, 144, 230.43, 47.065556, 31.93391]
        ],
        "52": [
            ["UMGG", 8148, 141, 287.36, 52.521664, 31.03503]
        ]
    },
    "30": {
        "-29": [
            ["FADN", 8026, 200, 215.4, -29.960958, 30.957375],
            ["FAGY", 5328, 36, 217.8, -29.116226, 30.591833],
            ["FAPM", 5052, 98, 322.13, -29.654949, 30.402897]
        ],
        "-23": [
            ["FAGI", 5577, 0, 326.61, -23.289846, 30.654556],
            ["FATH", 5906, 0, 266.6, -23.076448, 30.392401]
        ],
        "-16": [
            ["FV77", 5108, 30, 222.9, -16.904987, 30.247431]
        ],
        "-20": [
            ["FVMV", 5682, 59, 342.16, -20.069542, 30.864035]
        ],
        "1": [
            ["FZKA", 6070, 98, 279.8, 1.564993, 30.224813]
        ],
        "31": [
            ["HE0P", 9728, 0, 339.01, 31.030859, 30.670094]
        ],
        "30": [
            ["HE16", 9850, 0, 144.11, 30.847235, 30.92631],
            ["HE16", 9850, 0, 324.11, 30.825346, 30.944757],
            ["HE16", 9850, 0, 324.11, 30.82585, 30.945652],
            ["HE28", 9925, 132, 332.11, 30.525978, 30.560284],
            ["HE28", 10568, 132, 6.111, 30.528637, 30.565657],
            ["HECW", 8710, 0, 197.1, 30.107586, 30.932119],
            ["HECW", 9125, 147, 287.109, 30.111042, 30.936102],
            ["HECW", 9757, 196, 346.11, 30.106188, 30.918266],
            ["HEGS", 9460, 145, 293.109, 30.812094, 30.203876],
            ["HEGS", 9473, 145, 304.109, 30.815109, 30.204966]
        ],
        "28": [
            ["HE25", 9839, 131, 338.01, 28.088608, 30.735294],
            ["HE25", 9832, 115, 338.01, 28.089102, 30.736588]
        ],
        "29": [
            ["HE30", 7847, 130, 333.108, 29.544056, 30.899052],
            ["HE30", 9078, 134, 343.109, 29.542767, 30.900942],
            ["HEOC", 6587, 115, 189.87, 29.821007, 30.82514]
        ],
        "25": [
            ["HEKG", 11520, 148, 359.87, 25.457823, 30.590744]
        ],
        "-1": [
            ["HRYR", 11485, 148, 280.05, -1.971298, 30.154823]
        ],
        "19": [
            ["HSDN", 9881, 148, 354.7, 19.140364, 30.431421]
        ],
        "13": [
            ["HSOB", 9885, 148, 188.33, 13.166566, 30.234753]
        ],
        "38": [
            ["LTAH", 11967, 0, 313.81, 38.714397, 30.618448]
        ],
        "36": [
            ["LTAI", 9782, 148, 6.26, 36.889015, 30.788717],
            ["LTAI", 11127, 148, 6.27, 36.885139, 30.790586]
        ],
        "39": [
            ["LTBI", 10057, 150, 269.42, 39.784168, 30.599197],
            ["LTBY", 8366, 98, 273.4, 39.81514, 30.554308]
        ],
        "40": [
            ["LTBQ", 9842, 98, 273, 40.731514, 30.100565]
        ],
        "37": [
            ["LTFC", 9838, 148, 229.54, 37.866226, 30.382336]
        ],
        "50": [
            ["UKBB", 11456, 206, 362.59, 50.320827, 30.880833],
            ["UKBB", 13078, 197, 362.55, 50.324718, 30.905554],
            ["UKKK", 5898, 161, 266.06, 50.4025, 30.463911],
            ["UKKM", 11458, 184, 334.36, 50.589439, 30.201963]
        ],
        "46": [
            ["UKOO", 9086, 184, 343.46, 46.414997, 30.683064]
        ],
        "59": [
            ["ULLI", 12487, 197, 286.98, 59.789993, 30.285057],
            ["ULLI", 10843, 197, 286.27, 59.801662, 30.305052]
        ],
        "55": [
            ["UMII", 8480, 138, 244.54, 55.131668, 30.370033]
        ],
        "53": [
            ["UMOO", 8352, 138, 316.68, 53.946663, 30.110022]
        ],
        "-22": [
            ["Z26Z", 5905, 0, 270.606, -22.374977, 30.890951]
        ],
        "-26": [
            ["Z27E", 5675, 0, 270.006, -26.63442, 30.614609]
        ]
    },
    "57": {
        "-20": [
            ["FIMP", 9975, 148, 297.16, -20.437134, 57.697975]
        ],
        "28": [
            ["OIKJ", 7240, 98, 308.73, 28.720793, 57.679111]
        ],
        "37": [
            ["OIMN", 9729, 148, 250.62, 37.49778, 57.325718]
        ],
        "36": [
            ["OIMS", 10429, 148, 274.77, 36.166908, 57.612808]
        ],
        "25": [
            ["OIZJ", 6200, 0, 240.1, 25.657785, 57.80743]
        ],
        "50": [
            ["UATT", 10145, 196, 315.18, 50.235756, 57.22245]
        ],
        "44": [
            ["UT1O", 11675, 157, 270, 44.054111, 57.570114]
        ]
    },
    "72": {
        "-7": [
            ["FJDG", 12018, 200, 302.23, -7.322197, 72.424881]
        ],
        "32": [
            ["OP0K", 8940, 0, 315.51, 32.901409, 72.784927],
            ["OPBG", 8970, 90, 249.3, 32.059826, 72.963234],
            ["OPBG", 5040, 150, 342.305, 32.049667, 72.951172],
            ["OPSR", 7956, 0, 241, 32.065762, 72.665619],
            ["OPSR", 10253, 0, 321, 32.042389, 72.671532]
        ],
        "33": [
            ["OP20", 10075, 0, 301.01, 33.863117, 72.414726],
            ["OPTA", 5600, 0, 250, 33.987621, 72.620399]
        ],
        "30": [
            ["OP21", 10283, 149, 348.11, 30.077618, 72.157112],
            ["OPRQ", 10000, 0, 331, 30.74967, 72.291069]
        ],
        "34": [
            ["OPSS", 6001, 151, 232, 34.814026, 72.363136]
        ],
        "31": [
            ["OPSW", 9285, 0, 196.3, 31.901714, 72.3134]
        ],
        "42": [
            ["UA36", 8204, 157, 268, 42.974182, 72.758942],
            ["UA36", 9844, 148, 267.9, 42.975975, 72.758888]
        ],
        "40": [
            ["UAFO", 8466, 164, 305.04, 40.601658, 72.806686],
            ["UT71", 9770, 0, 225.5, 40.737129, 72.306633]
        ],
        "24": [
            ["VA38", 5780, 0, 309.006, 24.890125, 72.852699]
        ],
        "23": [
            ["VAAH", 11547, 150, 224.94, 23.088383, 72.646637]
        ],
        "19": [
            ["VABB", 11337, 148, 269.75, 19.088879, 72.880379],
            ["VABB", 9622, 150, 314.58, 19.080105, 72.877258]
        ],
        "21": [
            ["VABV", 6313, 150, 247.65, 21.755447, 72.194534]
        ],
        "20": [
            ["VADN", 5909, 150, 205.7, 20.437653, 72.844955]
        ],
        "65": [
            ["Z25Q", 8360, 0, 336.708, 65.471283, 72.709785]
        ]
    },
    "43": {
        "-11": [
            ["FMCH", 9559, 148, 189.93, -11.520692, 43.274151]
        ],
        "-23": [
            ["FMST", 6580, 98, 203.92, -23.375004, 43.732468]
        ],
        "5": [
            ["HAGO", 7506, 115, 218.3, 5.942676, 43.58456]
        ],
        "3": [
            ["HCMB", 6614, 0, 225, 3.105238, 43.630619]
        ],
        "11": [
            ["HDAM", 10299, 150, 270.82, 11.547126, 43.173847],
            ["HDCH", 8545, 0, 280.2, 11.514712, 43.073208]
        ],
        "40": [
            ["LTCF", 11472, 148, 242.33, 40.570343, 43.13047],
            ["UDSG", 10563, 147, 203.57, 40.763744, 43.866982]
        ],
        "38": [
            ["LTCI", 9138, 148, 218.11, 38.477131, 43.340996]
        ],
        "39": [
            ["LTCO", 6562, 98, 344.3, 39.654003, 43.026413]
        ],
        "26": [
            ["OEGS", 9853, 147, 332.72, 26.29081, 43.780819]
        ],
        "29": [
            ["OERF", 9840, 147, 294.13, 29.620493, 43.504601]
        ],
        "34": [
            ["OR0E", 9890, 0, 333.41, 34.523422, 43.684872],
            ["OR0O", 9870, 0, 308.51, 34.909561, 43.401825],
            ["OR1K", 9843, 0, 322.51, 34.597538, 43.785862],
            ["ORS2", 10237, 0, 322.01, 34.657078, 43.546726],
            ["ORS2", 7351, 0, 322.01, 34.672363, 43.559971]
        ],
        "33": [
            ["OR0Q", 7800, 0, 299.308, 33.369759, 43.574223],
            ["ORAT", 13186, 200, 299.413, 33.328125, 43.614208],
            ["ORAT", 12087, 150, 299.412, 33.330925, 43.616085]
        ],
        "35": [
            ["OR1C", 9863, 0, 331.51, 35.122784, 43.734348],
            ["ORQW", 11486, 197, 332.111, 35.752289, 43.131145],
            ["ORQW", 12088, 98, 343.112, 35.752254, 43.133965]
        ],
        "36": [
            ["ORBM", 8695, 147, 337.209, 36.294762, 43.153133],
            ["Z16J", 9200, 0, 331.51, 36.224941, 43.971336]
        ],
        "44": [
            ["URMM", 12795, 197, 304.79, 44.214977, 43.103443]
        ],
        "43": [
            ["URMN", 6886, 138, 243.82, 43.516663, 43.648354]
        ],
        "56": [
            ["UWGG", 9270, 148, 370.51, 56.21666, 43.778328],
            ["UWGG", 8078, 148, 12.09, 56.219994, 43.781658]
        ]
    },
    "45": {
        "-12": [
            ["FMCZ", 6369, 92, 329.88, -12.816796, 45.286606]
        ],
        "2": [
            ["HCMM", 10420, 0, 230.86, 2.022382, 45.316132]
        ],
        "26": [
            ["OE52", 6900, 150, 212.4, 26.62005, 45.327297]
        ],
        "27": [
            ["OEKK", 12013, 148, 310.19, 27.890318, 45.542294]
        ],
        "20": [
            ["OESL", 9860, 148, 280.5, 20.462267, 45.633854],
            ["OEWD", 10003, 147, 282.01, 20.501343, 45.213333]
        ],
        "37": [
            ["OITR", 10769, 148, 213.06, 37.680382, 45.078751]
        ],
        "32": [
            ["OR1B", 11666, 0, 289.312, 32.475182, 45.77586],
            ["OR1B", 10174, 0, 289.31, 32.479115, 45.771751]
        ],
        "12": [
            ["OYAA", 10141, 148, 257.26, 12.832527, 45.042797]
        ],
        "41": [
            ["UB17", 7098, 0, 285.907, 41.126869, 45.435669],
            ["UG25", 5551, 110, 282.1, 41.951836, 45.518005],
            ["UG27", 8205, 175, 322.608, 41.605473, 45.032059]
        ],
        "39": [
            ["UBBN", 10804, 148, 317.67, 39.176807, 45.47163],
            ["UBBN", 10792, 138, 317.67, 39.177605, 45.4725]
        ],
        "40": [
            ["UG11", 8182, 135, 290.208, 40.883743, 45.970947]
        ],
        "33": [
            ["Z17C", 9815, 0, 295.31, 33.928852, 45.116154]
        ]
    },
    "55": {
        "-20": [
            ["FMEE", 10496, 148, 282.25, -20.892088, 55.534748],
            ["FMEE", 8763, 148, 296.55, -20.894855, 55.52697]
        ],
        "-21": [
            ["FMEP", 6108, 98, 309.08, -21.325205, 55.430557]
        ],
        "-4": [
            ["FSIA", 9815, 151, 305.04, -4.68206, 55.532913]
        ],
        "21": [
            ["OE55", 6915, 99, 213.4, 21.234869, 55.272923]
        ],
        "25": [
            ["OIBA", 8845, 148, 263.26, 25.877089, 55.042595],
            ["OMDB", 13143, 151, 301.47, 25.24332, 55.381546],
            ["OMDB", 13137, 197, 301.47, 25.247581, 55.381149],
            ["OMDM", 12970, 148, 269.2, 25.0271, 55.385822],
            ["OMRK", 12382, 148, 344.81, 25.596954, 55.943768],
            ["OMSJ", 13328, 148, 302.47, 25.318766, 55.534252],
            ["OMUQ", 5905, 0, 341.5, 25.569532, 55.653961]
        ],
        "26": [
            ["OIKQ", 13876, 148, 229.39, 26.767092, 55.918518]
        ],
        "29": [
            ["OIKY", 12364, 148, 312.43, 29.539335, 55.687336]
        ],
        "36": [
            ["OIMJ", 9581, 148, 250.54, 36.429016, 55.119656]
        ],
        "37": [
            ["OINE", 7246, 92, 284.57, 37.380829, 55.464188]
        ],
        "24": [
            ["OMAL", 13166, 148, 187.41, 24.279596, 55.611687]
        ],
        "51": [
            ["UWOO", 8282, 138, 270, 51.794998, 55.476696]
        ],
        "54": [
            ["UWUU", 12476, 197, 331.25, 54.543324, 55.878361],
            ["UWUU", 8261, 164, 331.97, 54.546658, 55.895016]
        ]
    },
    "47": {
        "-19": [
            ["FMMA", 8237, 148, 285.008, -19.033228, 47.18465]
        ],
        "-18": [
            ["FMMI", 10174, 148, 278.94, -18.799088, 47.493359]
        ],
        "24": [
            ["OE47", 10499, 0, 355.11, 24.04648, 47.412174],
            ["OEPS", 13176, 148, 355.39, 24.044712, 47.582127]
        ],
        "25": [
            ["OEPC", 7979, 115, 322.25, 25.166153, 47.496166]
        ],
        "17": [
            ["OESH", 12015, 147, 264.62, 17.468487, 47.138504]
        ],
        "34": [
            ["OICC", 11208, 148, 296.06, 34.338978, 47.175137]
        ],
        "32": [
            ["OICD", 6975, 0, 300.31, 32.929497, 47.49334]
        ],
        "35": [
            ["OICS", 8192, 148, 198.13, 35.257607, 47.013294]
        ],
        "39": [
            ["OITP", 8423, 115, 291.88, 39.605755, 47.881012]
        ],
        "28": [
            ["OKAJ", 9804, 0, 150.51, 28.946051, 47.783253],
            ["OKAJ", 9804, 0, 330.51, 28.922644, 47.798382],
            ["OKAJ", 9804, 0, 331.51, 28.92359, 47.800404]
        ],
        "29": [
            ["OKAS", 9806, 131, 120.27, 29.352543, 47.506779],
            ["OKAS", 9806, 146, 300.27, 29.338985, 47.533428],
            ["OKAS", 9806, 132, 300.27, 29.340929, 47.534721],
            ["OKBK", 11181, 148, 335.09, 29.212652, 47.97633],
            ["OKBK", 11509, 148, 335.1, 29.212551, 47.998623],
            ["OKDI", 5215, 80, 361.005, 29.69047, 47.435837],
            ["Z19M", 10350, 0, 360.41, 29.028528, 47.788181]
        ],
        "30": [
            ["OR0U", 9850, 0, 319.01, 30.343805, 47.118404],
            ["OR1M", 9805, 0, 321.51, 30.123869, 47.66024],
            ["ORMM", 13083, 148, 318, 30.535492, 47.676361]
        ],
        "42": [
            ["URML", 8792, 138, 326.04, 42.804993, 47.661682]
        ],
        "56": [
            ["UWKS", 8180, 161, 252.71, 56.093327, 47.368366]
        ],
        "31": [
            ["Z15I", 9843, 0, 319.01, 31.446381, 47.299442]
        ]
    },
    "49": {
        "-18": [
            ["FMMT", 7254, 131, 173.81, -18.099655, 49.391457]
        ],
        "-12": [
            ["FMNK", 8202, 0, 302, -12.261367, 49.26479]
        ],
        "26": [
            ["OE50", 7972, 148, 326.208, 26.93255, 49.710861],
            ["OEDF", 13108, 197, 344.52, 26.453802, 49.792065],
            ["OEDF", 13160, 197, 344.52, 26.453785, 49.814457]
        ],
        "25": [
            ["OEAH", 10070, 148, 344.92, 25.272085, 49.489231],
            ["OEBQ", 6090, 111, 330.32, 25.904095, 49.595753],
            ["OEUD", 7204, 98, 359.61, 25.141159, 49.328781]
        ],
        "24": [
            ["OEHR", 8028, 0, 339.35, 24.090971, 49.226986]
        ],
        "27": [
            ["OEJB", 13157, 148, 347.11, 27.020878, 49.410126]
        ],
        "30": [
            ["OIAG", 7002, 148, 315.11, 30.742975, 49.690792],
            ["OIAJ", 13500, 148, 303, 30.82374, 49.551655],
            ["OIAJ", 11500, 148, 303, 30.826809, 49.553997],
            ["OIAM", 8879, 148, 317.45, 30.547352, 49.161289]
        ],
        "31": [
            ["OIAI", 6567, 98, 319.08, 31.995556, 49.27557]
        ],
        "37": [
            ["OIGG", 10060, 148, 273, 37.325592, 49.622158]
        ],
        "34": [
            ["OIHR", 9187, 148, 259.5, 34.140236, 49.863716]
        ],
        "15": [
            ["OY75", 8460, 110, 341.508, 15.590844, 49.08448]
        ],
        "14": [
            ["OYRN", 9811, 148, 241.93, 14.668753, 49.387352]
        ],
        "40": [
            ["UB12", 8218, 132, 360.008, 40.580299, 49.557434]
        ],
        "55": [
            ["UWKD", 8422, 148, 305.26, 55.596661, 49.301697],
            ["UWKD", 12293, 144, 302.86, 55.599949, 49.303497]
        ]
    },
    "46": {
        "-15": [
            ["FMNM", 7252, 148, 312.09, -15.673817, 46.359432]
        ],
        "-25": [
            ["FMSD", 5906, 98, 232, -25.042768, 46.970673]
        ],
        "25": [
            ["OE44", 14130, 0, 351.214, 25.195246, 46.643913],
            ["OE54", 7315, 148, 331.307, 25.984617, 46.542091]
        ],
        "24": [
            ["OE53", 7531, 83, 330.208, 24.93317, 46.396873],
            ["OERK", 13829, 197, 330.12, 24.938042, 46.695705],
            ["OERK", 13826, 197, 330.13, 24.943956, 46.72282],
            ["OERY", 13321, 147, 188.07, 24.742262, 46.728004],
            ["OERY", 11780, 147, 297.61, 24.707407, 46.729881]
        ],
        "22": [
            ["OEHW", 8518, 98, 330.42, 22.95698, 46.905777]
        ],
        "28": [
            ["OEPA", 9866, 148, 338.2, 28.322659, 46.130642]
        ],
        "27": [
            ["OEPK", 6007, 98, 343.406, 27.946335, 46.745316]
        ],
        "33": [
            ["OICI", 8816, 148, 322.05, 33.577232, 46.413624]
        ],
        "37": [
            ["OITM", 9842, 98, 265, 37.349228, 46.149971]
        ],
        "38": [
            ["OITT", 11532, 98, 308.93, 38.122383, 46.249958],
            ["OITT", 11819, 148, 309.01, 38.123447, 46.251572]
        ],
        "30": [
            ["ORTL", 9991, 148, 298.11, 30.927143, 46.102852],
            ["ORTL", 10935, 148, 298.11, 30.930464, 46.106647]
        ],
        "14": [
            ["OYAT", 8858, 164, 310, 14.525521, 46.826279]
        ],
        "39": [
            ["UB13", 7304, 120, 238.5, 39.906231, 46.797703]
        ],
        "40": [
            ["UBBG", 8202, 144, 306.491, 40.728317, 46.330292]
        ],
        "41": [
            ["UG28", 8862, 130, 315.909, 41.37027, 46.357792]
        ],
        "51": [
            ["UWSS", 7399, 138, 305.09, 51.559994, 46.060024]
        ],
        "34": [
            ["Z14N", 15200, 0, 324.315, 34.051472, 46.613453]
        ]
    },
    "48": {
        "-13": [
            ["FMNN", 7170, 148, 223, -13.304863, 48.321697]
        ],
        "28": [
            ["OE45", 5715, 70, 351.406, 28.382156, 48.517845],
            ["OERM", 10637, 98, 342.82, 28.065073, 48.61594]
        ],
        "25": [
            ["OEKR", 6250, 98, 343.106, 25.061338, 48.197697]
        ],
        "27": [
            ["OETN", 8021, 98, 334.28, 27.857916, 48.774475],
            ["Z26G", 9801, 0, 288.31, 27.641468, 48.00732],
            ["Z26T", 5800, 0, 348.206, 27.985685, 48.776981]
        ],
        "30": [
            ["OIAA", 10263, 148, 324.1, 30.356915, 48.240505],
            ["OIAA", 7119, 115, 323, 30.355814, 48.243229]
        ],
        "32": [
            ["OIAD", 12653, 115, 323, 32.418995, 48.397026],
            ["OIAD", 11722, 148, 323, 32.422226, 48.397137],
            ["Z14S", 10000, 0, 279.1, 32.4006, 48.197571]
        ],
        "31": [
            ["OIAW", 11137, 148, 304.23, 31.328819, 48.776741]
        ],
        "33": [
            ["OICK", 10493, 148, 293.07, 33.429684, 48.298855]
        ],
        "34": [
            ["OIHH", 10582, 148, 284.96, 34.863785, 48.573315]
        ],
        "35": [
            ["OIHS", 13000, 148, 233.5, 35.211742, 48.665207],
            ["OIHS", 14625, 148, 313.5, 35.182796, 48.692135],
            ["Z14P", 16568, 0, 280.4, 35.230087, 48.628891]
        ],
        "38": [
            ["OITL", 10829, 148, 329.98, 38.312809, 48.433823],
            ["UB10", 5172, 0, 320.105, 38.740856, 48.82378]
        ],
        "36": [
            ["OITZ", 9697, 148, 307.1, 36.768154, 48.371284]
        ],
        "15": [
            ["OYSY", 9804, 120, 248.54, 15.971257, 48.801849]
        ],
        "40": [
            ["UB14", 8200, 145, 268.2, 40.273941, 48.178299]
        ],
        "46": [
            ["URWA", 8084, 138, 278.65, 46.281662, 48.021694]
        ],
        "54": [
            ["UWLW", 16179, 323, 210.25, 54.419994, 48.823368]
        ]
    },
    "50": {
        "-14": [
            ["FMNS", 5925, 98, 332.1, -14.292991, 50.181793]
        ],
        "26": [
            ["OBBI", 8301, 148, 302.72, 26.258604, 50.651409],
            ["OBBI", 12976, 197, 302.72, 26.261221, 50.650314],
            ["OEDR", 12042, 148, 345.06, 26.236689, 50.142105],
            ["OEDR", 11844, 148, 345.07, 26.256783, 50.173439],
            ["OERT", 7064, 98, 332.3, 26.714441, 50.035774]
        ],
        "25": [
            ["OBBS", 12502, 147, 333.91, 25.902962, 50.59901]
        ],
        "30": [
            ["OI02", 8210, 0, 316.508, 30.724459, 50.121788],
            ["OIAH", 6067, 148, 304.67, 30.332827, 50.835892]
        ],
        "29": [
            ["OI20", 7200, 100, 329.407, 29.831554, 50.278496],
            ["OIBQ", 5926, 148, 314.63, 29.254532, 50.330452]
        ],
        "28": [
            ["OIBB", 14676, 148, 312.07, 28.930552, 50.850872],
            ["OIBB", 14678, 148, 312.06, 28.932173, 50.852524]
        ],
        "32": [
            ["OIFS", 9844, 148, 326.82, 32.28548, 50.850494]
        ],
        "34": [
            ["OIIC", 11131, 148, 291.41, 34.978352, 50.823811]
        ],
        "35": [
            ["OIIP", 12016, 197, 308.05, 35.765808, 50.84288]
        ],
        "40": [
            ["UBBB", 8868, 197, 339.55, 40.456944, 50.046879],
            ["UBBB", 10500, 167, 359.34, 40.456532, 50.064373]
        ],
        "61": [
            ["UUYY", 8412, 164, 200.1, 61.653332, 50.848347]
        ],
        "53": [
            ["UWWW", 8397, 197, 239.57, 53.509991, 50.170029],
            ["UWWW", 9680, 148, 340.33, 53.493324, 50.185017]
        ]
    },
    "34": {
        "-19": [
            ["FQBR", 7743, 148, 285.94, -19.798319, 34.918354]
        ],
        "-14": [
            ["FQUG", 5906, 98, 334, -14.712543, 34.357838]
        ],
        "-15": [
            ["FWCL", 7647, 98, 276.46, -15.679694, 34.980202]
        ],
        "8": [
            ["HAGM", 8308, 148, 362, 8.117249, 34.562439]
        ],
        "10": [
            ["HASO", 6565, 152, 291.8, 10.013947, 34.595852]
        ],
        "31": [
            ["HEGR", 7867, 98, 255.42, 31.075907, 34.161503],
            ["HEGR", 7892, 148, 345.5, 31.073879, 34.127354],
            ["LL1A", 6204, 98, 283.306, 31.258751, 34.650059],
            ["LL59", 7884, 98, 205.3, 31.911451, 34.698277],
            ["LL62", 9657, 0, 285.31, 31.225386, 34.678829],
            ["LL62", 7948, 0, 285.31, 31.235811, 34.670609],
            ["LL62", 5800, 0, 323.31, 31.228191, 34.657532],
            ["LLEK", 7835, 150, 331.308, 31.828299, 34.832989],
            ["LLEK", 7830, 150, 331.308, 31.828709, 34.838776],
            ["LLEK", 7880, 150, 4.308, 31.825283, 34.816917],
            ["LLHS", 7905, 150, 233.3, 31.767025, 34.735645],
            ["LLHS", 8040, 150, 291.908, 31.755747, 34.744904],
            ["LLHS", 8005, 115, 292.308, 31.757286, 34.745522],
            ["LVGZ", 10755, 0, 191.85, 31.255278, 34.276119]
        ],
        "25": [
            ["HEMA", 9838, 148, 329.85, 25.545551, 34.591122]
        ],
        "28": [
            ["HESC", 6955, 118, 351.53, 28.675726, 34.064236]
        ],
        "27": [
            ["HESH", 10120, 148, 222.71, 27.986132, 34.40728],
            ["HESH", 10119, 148, 222.7, 27.988894, 34.403923]
        ],
        "29": [
            ["HETB", 13136, 0, 221.74, 29.602308, 34.790722],
            ["LLET", 6244, 89, 208, 29.568998, 34.964836],
            ["LLOV", 9843, 148, 205.2, 29.94985, 34.948471],
            ["LLOV", 8530, 148, 205.2, 29.949453, 34.944454]
        ],
        "0": [
            ["HKKI", 6699, 98, 242.88, -0.081333, 34.737366]
        ],
        "4": [
            ["HKLK", 5868, 62, 271.7, 4.203852, 34.356277]
        ],
        "11": [
            ["HSDZ", 8239, 148, 349.06, 11.773514, 34.339096]
        ],
        "32": [
            ["LLBG", 5848, 148, 208.48, 32.01918, 34.900417],
            ["LLBG", 11949, 148, 259.89, 32.019588, 34.898685],
            ["LLBG", 10134, 148, 301.45, 32.000614, 34.895153],
            ["LLSD", 5720, 98, 206.93, 32.122047, 34.786224],
            ["Z15C", 6285, 0, 8.006, 32.755322, 34.960087]
        ],
        "30": [
            ["LLRM", 9876, 148, 246.2, 30.780045, 34.681923],
            ["LLRM", 8858, 148, 247.2, 30.782228, 34.679077]
        ],
        "38": [
            ["LTAZ", 9794, 148, 297.28, 38.765701, 34.549862]
        ],
        "61": [
            ["ULPB", 7945, 157, 203.4, 61.894997, 34.166683]
        ],
        "53": [
            ["UUBP", 7861, 138, 352, 53.203327, 34.180008]
        ]
    },
    "36": {
        "-14": [
            ["FQCB", 8202, 0, 212, -14.805449, 36.536163]
        ],
        "-17": [
            ["FQQL", 5928, 148, 350.05, -17.849346, 36.872074]
        ],
        "7": [
            ["HAJM", 6575, 163, 312.15, 7.656621, 36.821003]
        ],
        "-1": [
            ["HKJK", 13528, 148, 233.86, -1.305699, 36.946304],
            ["HKNW", 5116, 76, 314.53, -1.329093, 36.825607],
            ["HKRE", 8010, 151, 236.87, -1.270998, 36.871616]
        ],
        "15": [
            ["HSKA", 8228, 148, 201.95, 15.396352, 36.332546]
        ],
        "-3": [
            ["HTAR", 5377, 105, 270.4, -3.366605, 36.62793]
        ],
        "41": [
            ["LTAQ", 5275, 0, 215.32, 41.281254, 36.300598],
            ["LTFH", 9837, 148, 311.35, 41.244808, 36.580563]
        ],
        "39": [
            ["LTAR", 12596, 98, 196.9, 39.830204, 36.909149]
        ],
        "40": [
            ["LTAW", 5282, 98, 224, 40.316868, 36.380211]
        ],
        "37": [
            ["LTCN", 7546, 98, 265, 37.539505, 36.966335]
        ],
        "28": [
            ["OETB", 10989, 148, 244.92, 28.382004, 36.650894],
            ["OETB", 10014, 148, 312.15, 28.362234, 36.617107],
            ["Z26K", 10007, 0, 291.51, 28.880957, 36.173401]
        ],
        "26": [
            ["OEWJ", 10112, 148, 330.5, 26.186386, 36.483318]
        ],
        "30": [
            ["OJ39", 11810, 0, 295.212, 30.3368, 36.164555]
        ],
        "31": [
            ["OJ40", 9015, 148, 259.8, 31.820063, 36.79438],
            ["OJ40", 9777, 148, 311.31, 31.824409, 36.795692],
            ["OJAI", 11953, 200, 260.38, 31.719866, 36.018555],
            ["OJAI", 11957, 200, 260.37, 31.732225, 36.007549],
            ["OJAM", 10742, 148, 244.08, 31.979139, 36.007195],
            ["Z17G", 11448, 0, 293.011, 31.244682, 36.24361],
            ["Z17I", 9395, 0, 278, 31.782732, 36.238426],
            ["Z17K", 11930, 0, 297.012, 31.584232, 36.950863]
        ],
        "32": [
            ["OJMF", 9819, 148, 310.41, 32.347721, 36.27142],
            ["OS60", 9868, 98, 56.4, 32.696587, 36.400375],
            ["OS60", 9868, 150, 236.4, 32.711563, 36.42717],
            ["OS60", 9868, 98, 236.4, 32.713814, 36.4254],
            ["Z17E", 11470, 0, 305.111, 32.021225, 36.417538]
        ],
        "34": [
            ["OLKA", 9842, 148, 240, 34.597027, 36.026939],
            ["OS65", 9770, 148, 290.51, 34.485233, 36.923759],
            ["OS65", 9810, 0, 305.51, 34.485794, 36.924309],
            ["OS70", 10000, 148, 280.5, 34.566536, 36.589211]
        ],
        "35": [
            ["OS58", 9130, 150, 279, 35.116196, 36.726307]
        ],
        "33": [
            ["OS61", 10335, 147, 244.5, 33.615726, 36.764317],
            ["OS63", 9189, 97, 243.4, 33.290115, 36.472687],
            ["OS63", 9820, 150, 243.4, 33.295021, 36.470104],
            ["OS64", 9847, 144, 223.5, 33.927902, 36.877048],
            ["OS67", 9095, 148, 240.4, 33.482956, 36.237114],
            ["OS69", 9995, 148, 254.4, 33.069435, 36.588394],
            ["OS69", 9190, 98, 329.409, 33.068027, 36.548538],
            ["OSDI", 11674, 148, 228.39, 33.406254, 36.524712],
            ["OSDI", 9706, 148, 228.39, 33.436253, 36.532677]
        ],
        "49": [
            ["UK59", 8202, 155, 353.108, 49.826988, 36.643326],
            ["UKHH", 7249, 165, 270, 49.924721, 36.306969]
        ],
        "50": [
            ["UK60", 5919, 0, 212.7, 50.032696, 36.271824],
            ["UUOB", 7846, 138, 297.69, 50.638325, 36.606693]
        ],
        "51": [
            ["UUOK", 8006, 131, 302.09, 51.744991, 36.311691]
        ],
        "55": [
            ["Z25S", 8200, 0, 229.7, 55.619038, 36.663975]
        ]
    },
    "33": {
        "-19": [
            ["FQCH", 7874, 148, 180, -19.143492, 33.429535]
        ],
        "-16": [
            ["FQTT", 8202, 148, 182, -16.097082, 33.640408]
        ],
        "-13": [
            ["FWKI", 11616, 148, 309.96, -13.799545, 33.793549]
        ],
        "27": [
            ["HE10", 5266, 0, 343.405, 27.359943, 33.670479],
            ["HE20", 7835, 148, 318.11, 27.827145, 33.53389],
            ["HEGN", 13155, 148, 345.05, 27.160755, 33.804588]
        ],
        "24": [
            ["HE17", 9863, 131, 322.51, 24.97398, 33.537632]
        ],
        "28": [
            ["HE21", 7000, 100, 328.107, 28.18844, 33.212105],
            ["HE29", 6530, 0, 310.107, 28.89324, 33.210285],
            ["HETR", 9838, 148, 284.25, 28.205654, 33.660343]
        ],
        "26": [
            ["HE26", 9842, 0, 147.01, 26.567862, 33.112885],
            ["HE26", 9842, 0, 327.01, 26.545218, 33.129318],
            ["HE26", 9842, 0, 327.01, 26.546181, 33.130966]
        ],
        "30": [
            ["HE36", 8241, 148, 326.208, 30.39768, 33.161453],
            ["Z10W", 9840, 0, 299.41, 30.18804, 33.426395]
        ],
        "31": [
            ["HEAR", 9923, 148, 337.06, 31.060684, 33.842049]
        ],
        "1": [
            ["HUSO", 6071, 98, 231.15, 1.732804, 33.629444]
        ],
        "35": [
            ["LCGK", 9350, 0, 270.3, 35.235966, 33.735626]
        ],
        "34": [
            ["LCLK", 9814, 148, 224.91, 34.883839, 33.63586],
            ["LCRA", 8996, 200, 287.7, 34.58662, 33.002064]
        ],
        "40": [
            ["LTAC", 12271, 197, 216.12, 40.141281, 33.009148],
            ["LTAC", 12271, 148, 216.13, 40.142529, 33.007286]
        ],
        "48": [
            ["UKDR", 8143, 138, 5.74, 48.032219, 33.208328]
        ],
        "45": [
            ["UKFF", 12076, 0, 193.38, 45.068333, 33.980564]
        ]
    },
    "32": {
        "-15": [
            ["FQES", 5965, 0, 297.806, -15.735664, 32.760033]
        ],
        "-25": [
            ["FQMA", 12034, 148, 208.91, -25.894943, 32.588474],
            ["FQMA", 5574, 148, 266.99, -25.917871, 32.583878]
        ],
        "30": [
            ["HE1F", 8613, 0, 270, 30.329067, 32.281811],
            ["HE1F", 8950, 0, 270, 30.34215, 32.270763],
            ["HE1F", 8336, 0, 270, 30.331369, 32.28051],
            ["HE1F", 9138, 0, 321.01, 30.329395, 32.253735],
            ["HE1F", 8695, 0, 361.01, 30.32723, 32.273201],
            ["HE34", 8805, 148, 136.21, 30.254934, 32.481796],
            ["HE34", 8805, 130, 316.21, 30.237501, 32.501144],
            ["HE34", 8805, 148, 316.209, 30.238752, 32.502537],
            ["HE35", 9752, 148, 270.2, 30.569891, 32.110592],
            ["HE35", 9712, 148, 292.21, 30.570345, 32.109947],
            ["HE39", 9836, 146, 198.2, 30.806173, 32.052807],
            ["HE39", 9857, 130, 197.2, 30.807226, 32.043961],
            ["HE39", 9855, 131, 198.2, 30.806738, 32.045761]
        ],
        "31": [
            ["HE22", 5507, 57, 255.2, 31.0021, 32.561348],
            ["HEPS", 7702, 148, 285.85, 31.276505, 32.251953]
        ],
        "24": [
            ["HE23", 9500, 69, 339.51, 24.403564, 32.960823]
        ],
        "29": [
            ["HE45", 5925, 0, 191.1, 29.608114, 32.690952]
        ],
        "25": [
            ["HELX", 9865, 148, 202.7, 25.683414, 32.710632]
        ],
        "23": [
            ["HESN", 11186, 148, 350.91, 23.94936, 32.824059]
        ],
        "15": [
            ["HSSS", 9813, 148, 359.48, 15.576035, 32.553288]
        ],
        "-2": [
            ["HTMW", 10837, 148, 296.42, -2.450757, 32.945305]
        ],
        "-5": [
            ["HTTB", 5102, 0, 259.5, -5.067709, 32.833332],
            ["HTTB", 5860, 0, 309.5, -5.078712, 32.834831]
        ],
        "0": [
            ["HUEN", 7881, 150, 301.12, 0.039721, 32.457401],
            ["HUEN", 12017, 150, 352.08, 0.022909, 32.440762]
        ],
        "2": [
            ["HUGU", 10253, 98, 350.05, 2.787215, 32.273518]
        ],
        "34": [
            ["LCPH", 8562, 148, 290.78, 34.715, 32.498356]
        ],
        "39": [
            ["LTAB", 6617, 98, 243.5, 39.939323, 32.751427],
            ["LTAD", 7218, 0, 293.1, 39.953182, 32.685848]
        ],
        "40": [
            ["LTAC", 12271, 148, 36.12, 40.11409, 32.9832],
            ["LTAE", 11024, 148, 212.7, 40.09494, 32.577065]
        ],
        "37": [
            ["LTAN", 11002, 0, 196.26, 37.982216, 32.566399]
        ],
        "41": [
            ["LTAS", 5905, 0, 194.1, 41.523682, 32.10236]
        ],
        "49": [
            ["UKKE", 8185, 138, 330.01, 49.40638, 32.005016]
        ],
        "68": [
            ["ULMM", 8129, 148, 325.31, 68.773323, 32.765034]
        ]
    },
    "35": {
        "-13": [
            ["FQLC", 8279, 148, 248.47, -13.266657, 35.268353]
        ],
        "23": [
            ["HE14", 9914, 148, 311.51, 23.962002, 35.470016],
            ["HE14", 9900, 98, 311.51, 23.963066, 35.471882],
            ["HE14", 9600, 131, 331.21, 23.965305, 35.468826]
        ],
        "0": [
            ["HKEL", 11485, 147, 256.43, 0.408301, 35.251896]
        ],
        "-6": [
            ["HTDO", 6698, 98, 278.63, -6.172948, 35.762032]
        ],
        "32": [
            ["LLES", 5413, 0, 213, 32.444225, 35.005535],
            ["LLMG", 7710, 70, 273, 32.597771, 35.247536],
            ["LLRD", 8550, 145, 265.4, 32.667728, 35.191395],
            ["LLRD", 7975, 115, 288.408, 32.656097, 35.187347],
            ["LLRD", 7895, 150, 324.408, 32.65799, 35.191868],
            ["Z14Z", 9895, 0, 339.01, 32.084923, 35.353786]
        ],
        "31": [
            ["LLJR", 6444, 0, 295.08, 31.863907, 35.227173],
            ["LLNV", 8395, 70, 257, 31.20517, 35.02253],
            ["LLNV", 8530, 147, 257.3, 31.212719, 35.020844],
            ["LLNV", 10991, 147, 257.3, 31.211166, 35.029362]
        ],
        "36": [
            ["LTAF", 8981, 148, 233.51, 36.989456, 35.292793]
        ],
        "37": [
            ["LTAG", 10062, 148, 232.85, 37.010139, 35.439468]
        ],
        "40": [
            ["LTAP", 9584, 148, 235, 40.840034, 35.530617]
        ],
        "38": [
            ["LTAU", 9832, 145, 256.36, 38.773552, 35.512226]
        ],
        "42": [
            ["LTCM", 5420, 0, 233.3, 42.020267, 35.074409]
        ],
        "29": [
            ["OJAQ", 9878, 148, 196.94, 29.623962, 35.022392],
            ["Z17F", 11200, 0, 233.5, 29.835794, 35.347012]
        ],
        "33": [
            ["OLBA", 12480, 148, 212.79, 33.826214, 35.502579],
            ["OLBA", 11047, 148, 346.98, 33.81049, 35.487118],
            ["OLBA", 10716, 197, 356.93, 33.810001, 35.488804],
            ["OLRA", 9842, 148, 223, 33.887009, 35.997787]
        ],
        "35": [
            ["OSLK", 9201, 148, 356.61, 35.388683, 35.94936]
        ],
        "48": [
            ["UKDD", 9302, 144, 270, 48.357212, 35.119755]
        ],
        "47": [
            ["UKDE", 8122, 138, 202.67, 47.877499, 35.322788]
        ],
        "56": [
            ["UUEM", 8037, 160, 252.4, 56.828327, 35.778366]
        ],
        "34": [
            ["Z19O", 5650, 0, 207.2, 34.287205, 35.684334]
        ]
    },
    "39": {
        "-11": [
            ["FQMD", 7714, 98, 337.908, -11.682714, 39.567204]
        ],
        "-15": [
            ["FQNP", 6588, 148, 223.88, -15.094375, 39.289024]
        ],
        "8": [
            ["HAHM", 10114, 0, 339.21, 8.702663, 39.013081]
        ],
        "11": [
            ["HALL", 7874, 0, 272.2, 11.973475, 39.001793]
        ],
        "13": [
            ["HAMK", 11815, 142, 291.78, 13.461291, 39.549129]
        ],
        "15": [
            ["HHMS", 11485, 148, 252.92, 15.678938, 39.394474]
        ],
        "-4": [
            ["HKMO", 10992, 151, 209.19, -4.013103, 39.60643]
        ],
        "-6": [
            ["HTDA", 10004, 151, 224.86, -6.863379, 39.217373],
            ["HTZA", 8115, 148, 354.3, -6.233081, 39.225994]
        ],
        "-9": [
            ["HTLI", 5279, 0, 216.2, -9.827475, 39.787674]
        ],
        "-5": [
            ["HTPE", 5003, 0, 208.4, -5.248765, 39.812702]
        ],
        "38": [
            ["LTCA", 5642, 0, 315.07, 38.600719, 39.299618]
        ],
        "39": [
            ["LTCD", 9833, 148, 294.06, 39.705185, 39.541378]
        ],
        "40": [
            ["LTCG", 8615, 148, 292.29, 40.99057, 39.804188]
        ],
        "21": [
            ["OE49", 7865, 140, 191.3, 21.448067, 39.996471],
            ["OEJF", 8964, 148, 335.409, 21.339924, 39.176994],
            ["OEJN", 12506, 197, 339.83, 21.670536, 39.139587],
            ["OEJN", 12143, 148, 339.84, 21.666531, 39.180496],
            ["OEJN", 10859, 197, 339.83, 21.661158, 39.164921]
        ],
        "24": [
            ["OEMA", 12657, 147, 349.05, 24.537626, 39.71154],
            ["OEMA", 10038, 147, 3.78, 24.536011, 39.701935]
        ],
        "22": [
            ["OERB", 7776, 105, 332, 22.690578, 39.072094]
        ],
        "32": [
            ["OR0C", 8858, 0, 275.3, 32.403999, 39.143673],
            ["Z17A", 9843, 0, 273.2, 32.84779, 39.326221]
        ],
        "33": [
            ["OR1L", 9850, 0, 302.31, 33.068695, 39.610519]
        ],
        "48": [
            ["UKCW", 9317, 140, 280.65, 48.415825, 39.395031]
        ],
        "45": [
            ["URKK", 9842, 145, 231.87, 45.043331, 39.203358],
            ["URKK", 7025, 160, 232.74, 45.041664, 39.163353]
        ],
        "47": [
            ["URRR", 8389, 148, 223.58, 47.266663, 39.830021]
        ],
        "43": [
            ["URSS", 7030, 161, 210.19, 43.453327, 39.960014],
            ["URSS", 9561, 164, 247.58, 43.449993, 39.96003]
        ],
        "51": [
            ["UUOO", 7882, 161, 310.74, 51.807968, 39.244038]
        ]
    },
    "40": {
        "-11": [
            ["FQMP", 6562, 88, 205.3, -11.358917, 40.362442]
        ],
        "-14": [
            ["FQNC", 8202, 148, 194, -14.477792, 40.717052]
        ],
        "-12": [
            ["FQPB", 5929, 148, 341.09, -12.995705, 40.526581]
        ],
        "-10": [
            ["HTMT", 7445, 98, 183.94, -10.32887, 40.182514]
        ],
        "37": [
            ["LTCC", 11607, 148, 343, 37.875687, 40.207611],
            ["LTCR", 8208, 118, 217.28, 37.232285, 40.640232]
        ],
        "29": [
            ["OESK", 12002, 147, 279.86, 29.782265, 40.118713]
        ],
        "21": [
            ["OETF", 12152, 148, 254.58, 21.485138, 40.555336],
            ["OETF", 11011, 148, 352.12, 21.476492, 40.54525]
        ],
        "33": [
            ["OR1I", 12795, 0, 295.313, 33.352467, 40.624588],
            ["OR1I", 8892, 0, 343.309, 33.338741, 40.592724]
        ],
        "35": [
            ["OSDZ", 9789, 0, 289.86, 35.28091, 40.191547]
        ],
        "43": [
            ["UG23", 9802, 0, 331.11, 43.093998, 40.587547]
        ],
        "64": [
            ["ULAA", 8184, 144, 278.54, 64.598328, 40.745045]
        ],
        "57": [
            ["UUDL", 9788, 135, 244.24, 57.566067, 40.180546]
        ]
    },
    "37": {
        "-13": [
            ["FQMR", 5660, 98, 324, -13.237411, 37.560295]
        ],
        "6": [
            ["HAAM", 9220, 153, 212.27, 6.050039, 37.597519]
        ],
        "11": [
            ["HABD", 9929, 200, 224.37, 11.617811, 37.33139]
        ],
        "12": [
            ["HAGN", 9121, 145, 352, 12.498285, 37.44767]
        ],
        "0": [
            ["HK0G", 13200, 0, 199.1, 0.046604, 37.029911]
        ],
        "19": [
            ["HSPN", 8234, 148, 347.47, 19.422596, 37.236675],
            ["HSSP", 6562, 0, 361.307, 19.567455, 37.215656]
        ],
        "-3": [
            ["HTKJ", 11732, 148, 267.53, -3.428697, 37.090607]
        ],
        "36": [
            ["LTAJ", 9176, 0, 283.84, 36.944759, 37.494179],
            ["OS62", 10180, 130, 280.1, 36.094284, 37.953476],
            ["OS66", 8305, 150, 280.1, 36.185104, 37.59708],
            ["OSAP", 9497, 148, 276.71, 36.179184, 37.240387]
        ],
        "31": [
            ["OEGT", 9999, 147, 283.63, 31.408787, 37.294682]
        ],
        "32": [
            ["OJHF", 9802, 140, 311.41, 32.151859, 37.161297]
        ],
        "35": [
            ["OS57", 9810, 135, 273, 35.731457, 37.120766]
        ],
        "33": [
            ["OS68", 8209, 148, 238.5, 33.690838, 37.22245],
            ["OS68", 9820, 148, 269.5, 33.679974, 37.233063]
        ],
        "34": [
            ["OS72", 10010, 0, 268.5, 34.523033, 37.646957]
        ],
        "48": [
            ["UKCC", 8134, 157, 270, 48.073608, 37.75642]
        ],
        "47": [
            ["UKCM", 8370, 164, 201.3, 47.086941, 37.457233]
        ],
        "45": [
            ["URKA", 8260, 138, 222.64, 45.009998, 37.36002]
        ],
        "55": [
            ["UUDD", 11542, 230, 327.39, 55.394989, 37.905025],
            ["UUDD", 12429, 174, 326.22, 55.394993, 37.943359],
            ["UUEE", 11973, 197, 255.3, 55.974991, 37.443382],
            ["UUEE", 11643, 197, 254.87, 55.978333, 37.441711],
            ["UUWW", 9705, 197, 202.51, 55.611656, 37.275013],
            ["UUWW", 9445, 197, 251.23, 55.596664, 37.291706]
        ],
        "54": [
            ["UUWV", 6011, 0, 271.5, 54.239025, 37.614357]
        ],
        "27": [
            ["Z26D", 9745, 0, 319.51, 27.964832, 37.961647]
        ]
    },
    "-11": {
        "14": [
            ["GAKD", 5268, 0, 261.15, 14.482773, -11.397488]
        ],
        "28": [
            ["GMAT", 6431, 98, 208.14, 28.453609, -11.153602]
        ],
        "26": [
            ["GMMA", 9850, 100, 332.01, 26.722185, -11.668738]
        ],
        "16": [
            ["GQNF", 5249, 95, 241, 16.586823, -11.39343]
        ],
        "25": [
            ["GQPT", 5906, 70, 178, 25.241425, -11.583646]
        ]
    },
    "-16": {
        "13": [
            ["GBYD", 11796, 148, 310.75, 13.327292, -16.639664]
        ],
        "28": [
            ["GCTS", 10495, 148, 248.51, 28.049747, -16.557312],
            ["GCXO", 11131, 148, 290.64, 28.477272, -16.325285]
        ],
        "12": [
            ["GOGG", 5031, 98, 267.76, 12.555998, -16.274853]
        ],
        "14": [
            ["GOOK", 5249, 98, 231, 14.154528, -16.04423]
        ],
        "16": [
            ["GOSS", 6223, 100, -7.43, 16.041794, -16.459982]
        ],
        "32": [
            ["LPMA", 9127, 148, 224.58, 32.706799, -16.764009]
        ],
        "33": [
            ["LPPS", 9881, 0, 178.11, 33.078602, -16.350479]
        ]
    },
    "-13": {
        "28": [
            ["GCFV", 7899, 148, 181.66, 28.463543, -13.863406],
            ["GCRR", 7868, 148, 206.94, 28.95508, -13.599638]
        ],
        "8": [
            ["GFLL", 10502, 150, 287.08, 8.612148, -13.181628]
        ],
        "27": [
            ["GMML", 8884, 148, 196.45, 27.153582, -13.227643],
            ["GMML", 8218, 148, 211.63, 27.154993, -13.212635]
        ],
        "13": [
            ["GOTT", 6534, 98, 229.25, 13.74262, -13.646143]
        ],
        "16": [
            ["GQNK", 8231, 148, 238.47, 16.165833, -13.497204]
        ],
        "20": [
            ["GQPA", 9868, 98, 210.9, 20.518251, -13.035542]
        ],
        "9": [
            ["GUCY", 10825, 148, 229.43, 9.581731, -13.613968]
        ],
        "10": [
            ["GUFA", 5249, 131, 229.8, 10.329664, -13.419735]
        ]
    },
    "-17": {
        "28": [
            ["GCLA", 7211, 148, 179.02, 28.63459, -17.757486]
        ],
        "14": [
            ["GOOY", 11497, 148, -7.96, 14.726207, -17.476942]
        ],
        "20": [
            ["GQPP", 7989, 148, 194.35, 20.943542, -17.027008]
        ]
    },
    "-15": {
        "27": [
            ["GCLP", 10193, 148, 201.35, 27.944212, -15.378839],
            ["GCLP", 10196, 148, 201.36, 27.94491, -15.380821]
        ],
        "11": [
            ["GGCF", 6231, 74, 231.6, 11.289774, -15.178472],
            ["GGOV", 10534, 148, 198.91, 11.908272, -15.650632]
        ],
        "23": [
            ["GMMH", 9869, 148, 202.92, 23.731686, -15.932364]
        ],
        "18": [
            ["GQNN", 9900, 148, 217.94, 18.108477, -15.939248]
        ]
    },
    "-10": {
        "6": [
            ["GLMR", 6016, 100, 219.85, 6.296134, -10.76038],
            ["GLRB", 10966, 150, 210.95, 6.246747, -10.35549]
        ],
        "29": [
            ["GM47", 10007, 0, 225.9, 29.036213, -10.039187]
        ],
        "10": [
            ["GUFH", 7595, 148, 264, 10.02547, -10.758769]
        ]
    },
    "-12": {
        "14": [
            ["GOTB", 5741, 98, 239, 14.870713, -12.476351]
        ],
        "12": [
            ["GOTK", 5906, 148, 283, 12.569787, -12.213221]
        ],
        "11": [
            ["GULB", 6572, 148, 231.87, 11.346002, -12.266332]
        ]
    },
    "38": {
        "8": [
            ["HAAB", 12428, 148, 253.59, 8.981716, 38.815685],
            ["HAAB", 12354, 148, 253.58, 8.983346, 38.814579]
        ],
        "9": [
            ["HAAL", 5669, 64, 302, 9.001684, 38.731667]
        ],
        "14": [
            ["HAAX", 7905, 148, 342.37, 14.135993, 38.775928]
        ],
        "15": [
            ["HHAS", 9843, 148, 254.23, 15.290932, 38.920948]
        ],
        "-6": [
            ["HTNG", 7900, 0, 200.5, -6.707311, 38.157642]
        ],
        "38": [
            ["LTAT", 10993, 148, 211.92, 38.44743, 38.100426]
        ],
        "37": [
            ["LTCH", 7093, 98, 334.07, 37.08654, 38.852478],
            ["LTCP", 8118, 98, 229.55, 37.738495, 38.479485]
        ],
        "31": [
            ["OETR", 9836, 148, 284.55, 31.689299, 38.746414]
        ],
        "24": [
            ["OEYN", 10559, 148, 279.96, 24.142466, 38.079338]
        ],
        "32": [
            ["OJHR", 8215, 98, 282.4, 32.536797, 38.208061]
        ],
        "35": [
            ["OS59", 9842, 131, 273.1, 35.754002, 38.583447]
        ],
        "34": [
            ["OSPR", 9449, 148, 262, 34.5518, 38.315582]
        ],
        "55": [
            ["Z25Y", 11895, 0, 310.412, 55.867802, 38.081367],
            ["Z25Y", 11593, 0, 310.61, 55.869926, 38.084587]
        ]
    },
    "41": {
        "9": [
            ["HADR", 8823, 148, 332.31, 9.604886, 41.864178]
        ],
        "39": [
            ["LTCE", 12452, 98, 267.67, 39.956661, 41.191986],
            ["LTCE", 12448, 148, 268.14, 39.958332, 41.191986]
        ],
        "37": [
            ["LTCJ", 10009, 150, 203.95, 37.943295, 41.12402],
            ["LTCL", 5906, 98, 243.4, 37.981678, 41.848358],
            ["OSKL", 8789, 150, 218.65, 37.033165, 41.203899]
        ],
        "38": [
            ["LTCK", 11637, 148, 296.17, 38.738625, 41.678074]
        ],
        "21": [
            ["OE43", 6726, 82, 294.307, 21.319754, 41.207291]
        ],
        "18": [
            ["OE48", 7235, 98, 201.1, 18.902424, 41.358852]
        ],
        "20": [
            ["OEBA", 10984, 148, 250.83, 20.300985, 41.649254]
        ],
        "27": [
            ["OEHL", 10865, 148, 3.5, 27.424915, 41.685322]
        ],
        "24": [
            ["OEPJ", 8029, 115, 358, 24.098421, 41.036285]
        ],
        "30": [
            ["OERR", 9999, 148, 284.33, 30.903038, 41.15361]
        ],
        "41": [
            ["UGSB", 7277, 150, 310.96, 41.603111, 41.610302]
        ],
        "42": [
            ["UGSS", 11904, 172, 301.83, 42.844715, 41.140587]
        ],
        "33": [
            ["Z16L", 9857, 0, 303.31, 33.807976, 41.451294]
        ]
    },
    "44": {
        "2": [
            ["HC0A", 10508, 0, 221.9, 2.681459, 44.802811]
        ],
        "9": [
            ["HCMH", 8005, 148, 240.5, 9.493175, 44.097191]
        ],
        "10": [
            ["HCMI", 13583, 164, 230.5, 10.397679, 44.962952]
        ],
        "20": [
            ["OE46", 5365, 133, 295.01, 20.472797, 44.764629]
        ],
        "24": [
            ["OEDM", 10031, 147, 333.85, 24.437487, 44.127846],
            ["OEPF", 7983, 115, 348.16, 24.700031, 44.967117]
        ],
        "17": [
            ["OENG", 10021, 147, 239.9, 17.618341, 44.431625]
        ],
        "35": [
            ["OR0H", 9842, 0, 309.51, 35.129986, 44.146305],
            ["OR1F", 6553, 0, 320.507, 35.505898, 44.291435],
            ["ORKK", 9809, 148, 313.01, 35.46051, 44.358536],
            ["ORKK", 8535, 160, 325.01, 35.459648, 44.36002]
        ],
        "32": [
            ["OR0I", 11530, 0, 301.312, 32.92025, 44.643581],
            ["OR0P", 10249, 0, 321.31, 32.959583, 44.280891]
        ],
        "34": [
            ["OR0L", 10060, 0, 315.41, 34.153721, 44.759209],
            ["OR0W", 9808, 0, 292.51, 34.929573, 44.499466],
            ["OR33", 9843, 0, 321.51, 34.15506, 44.274502]
        ],
        "33": [
            ["OR1A", 8597, 0, 326.409, 33.269169, 44.501945],
            ["ORBD", 11495, 149, 305.512, 33.92725, 44.372402],
            ["ORBD", 11490, 197, 325.511, 33.930962, 44.376907],
            ["ORBI", 10843, 148, 330.1, 33.24279, 44.234573],
            ["ORBI", 13140, 197, 330.12, 33.252571, 44.252632],
            ["ORT4", 5790, 0, 340.41, 33.516369, 44.259941]
        ],
        "36": [
            ["ORBR", 7333, 150, 319.207, 36.526073, 44.348064]
        ],
        "13": [
            ["OY74", 9250, 144, 252.2, 13.178545, 44.777493],
            ["OYTZ", 9848, 148, 188.47, 13.699478, 44.140999]
        ],
        "15": [
            ["OYSN", 10673, 148, 359.66, 15.46161, 44.219849]
        ],
        "41": [
            ["UDLS", 6551, 92, 310.72, 41.04258, 44.346199],
            ["UG22", 8170, 130, 271.1, 41.458961, 44.798103],
            ["UG24", 8131, 255, 320.208, 41.639313, 44.944504],
            ["UGGG", 9839, 0, 316.61, 41.658192, 44.964905],
            ["UGGG", 8209, 0, 313.58, 41.661381, 44.965702]
        ],
        "40": [
            ["UDYE", 8682, 132, 212.42, 40.131798, 44.473217],
            ["UDYZ", 12611, 184, 269.61, 40.147385, 44.418507]
        ],
        "43": [
            ["URMO", 9930, 148, 280.58, 43.201664, 44.626701]
        ],
        "46": [
            ["URWI", 6746, 148, 275.17, 46.373322, 44.346687]
        ],
        "48": [
            ["URWW", 8379, 161, 300.51, 48.776665, 44.361694]
        ]
    },
    "42": {
        "0": [
            ["HCMK", 12139, 0, 229, -0.377207, 42.464897]
        ],
        "13": [
            ["HHSB", 11483, 148, 301.3, 13.058476, 42.647144]
        ],
        "18": [
            ["OEAB", 11002, 148, 309.15, 18.230885, 42.668827],
            ["OEKM", 12478, 148, 240.27, 18.304743, 42.80489],
            ["OEKM", 12495, 148, 321.14, 18.284838, 42.829285]
        ],
        "19": [
            ["OEBH", 10007, 147, 6.5, 19.969042, 42.621391]
        ],
        "16": [
            ["OEGN", 10037, 148, 330.15, 16.889072, 42.592968]
        ],
        "24": [
            ["OEPI", 8024, 98, 347.7, 24.265318, 42.146366]
        ],
        "36": [
            ["OR0F", 9839, 0, 319.01, 36.272934, 42.414074]
        ],
        "35": [
            ["OR1E", 9687, 0, 311.01, 35.847641, 42.156006]
        ],
        "33": [
            ["OR31", 9878, 0, 302.51, 33.434673, 42.923351],
            ["ORAA", 13123, 148, 268.5, 33.781723, 42.449482],
            ["ORAA", 13124, 197, 268.5, 33.790424, 42.476215]
        ],
        "14": [
            ["OYHD", 9837, 148, 206.22, 14.765066, 42.982483]
        ],
        "42": [
            ["UGKO", 8195, 144, 260.45, 42.17868, 42.497669]
        ],
        "45": [
            ["URMT", 8516, 157, 255.97, 45.111153, 42.129391]
        ],
        "31": [
            ["Z16T", 13123, 0, 229.1, 31.942921, 42.158154]
        ]
    },
    "-169": {
        "16": [
            ["JON", 9000, 0, 241, 16.734947, -169.523026]
        ],
        "-19": [
            ["NIUE", 7662, 148, 290.84, -19.080931, -169.917831]
        ]
    },
    "-56": {
        "46": [
            ["LFVP", 5900, 150, 238.51, 46.766846, -56.165501]
        ],
        "-9": [
            ["SBAT", 5272, 98, 198.91, -9.859249, -56.102055]
        ],
        "-15": [
            ["SBCY", 7571, 148, 332.82, -15.662214, -56.11174]
        ],
        "-1": [
            ["SBTB", 5253, 98, 253.04, -1.487129, -56.389393]
        ],
        "-27": [
            ["SGAY", 6070, 148, 190.7, -27.362455, -56.852203]
        ],
        "-22": [
            ["SGST", 5906, 65, 188, -22.61537, -56.633213]
        ],
        "-33": [
            ["SUDU", 7495, 148, 203.22, -33.350491, -56.494923]
        ],
        "-34": [
            ["SUMU", 7393, 148, 179.41, -34.821674, -56.030987],
            ["SUMU", 8858, 148, 233.46, -34.827641, -56.013172],
            ["SUMU", 5582, 148, 270.77, -34.837605, -56.017082]
        ],
        "-13": [
            ["SWOG", 5680, 59, 267.306, -13.764129, -56.947548]
        ],
        "-2": [
            ["SWPI", 5922, 98, 226.16, -2.667869, -56.771778]
        ]
    },
    "-25": {
        "36": [
            ["LPAZ", 10034, 197, -8.95, 36.958557, -25.168043]
        ],
        "37": [
            ["LPPD", 7727, 148, 291.69, 37.738331, -25.686098]
        ]
    },
    "-28": {
        "38": [
            ["LPHR", 5226, 148, 269.71, 38.519932, -28.706772],
            ["LPPI", 5718, 148, 261.99, 38.555374, -28.431765]
        ]
    },
    "-27": {
        "38": [
            ["LPLA", 10871, 197, 320.76, 38.752869, -27.081394]
        ]
    },
    "-159": {
        "-21": [
            ["NCRG", 7632, 150, 270.03, -21.202618, -159.794403]
        ],
        "61": [
            ["PANI", 5984, 150, 301.19, 61.577347, -159.52829]
        ],
        "22": [
            ["PHBK", 6083, 146, 351.74, 22.016272, -159.781662]
        ],
        "21": [
            ["PHLI", 6509, 150, 224.89, 21.985546, -159.335251],
            ["PHLI", 6523, 150, 360.02, 21.963787, -159.335876]
        ]
    },
    "177": {
        "-17": [
            ["NFFN", 10524, 150, 216.87, -17.749634, 177.447174],
            ["NFFN", 7017, 150, 283.69, -17.758348, 177.45459]
        ],
        "64": [
            ["UHMA", 11242, 196, 193.36, 64.749992, 177.746674]
        ]
    },
    "178": {
        "-18": [
            ["NFNA", 6135, 100, 289.07, -18.04747, 178.571457]
        ]
    },
    "-175": {
        "-21": [
            ["NFTF", 8801, 147, 302.12, -21.247911, -175.138031]
        ]
    },
    "-173": {
        "-18": [
            ["NFTV", 5575, 98, 272.93, -18.585855, -173.953705]
        ]
    },
    "-176": {
        "-13": [
            ["NLWW", 6560, 148, 269.93, -13.238292, -176.189529]
        ],
        "51": [
            ["PADK", 7775, 200, 240.55, 51.888821, -176.627426],
            ["PADK", 7596, 200, 365.39, 51.861958, -176.651031]
        ]
    },
    "-171": {
        "-13": [
            ["NSFA", 9840, 148, 269.32, -13.829906, -171.994644]
        ],
        "-2": [
            ["PCIS", 6006, 140, 280.69, -2.771513, -171.708939]
        ]
    },
    "-170": {
        "-14": [
            ["NSTU", 10007, 150, 240.05, -14.326757, -170.700668]
        ]
    },
    "-149": {
        "-17": [
            ["NTAA", 11231, 148, 234.15, -17.544567, -149.593948]
        ],
        "61": [
            ["PAAQ", 5991, 100, 359.83, 61.58749, -149.087402],
            ["PAED", 9974, 200, 260.01, 61.253376, -149.788284],
            ["PAED", 7485, 150, 360.01, 61.241539, -149.793488],
            ["PANC", 10871, 0, 269.88, 61.167881, -149.972595],
            ["PANC", 10572, 0, 269.91, 61.169807, -149.948242],
            ["PANC", 11555, 150, 344.88, 61.169476, -149.997589]
        ]
    },
    "-134": {
        "-23": [
            ["NTGJ", 6562, 98, 318, -23.090006, -134.876785]
        ],
        "58": [
            ["PAJN", 8436, 150, 284.86, 58.35199, -134.554962]
        ]
    },
    "-140": {
        "-8": [
            ["NTMD", 5570, 98, 248.62, -8.79421, -140.221741]
        ],
        "-18": [
            ["NTTO", 10912, 148, 315.13, -18.086706, -140.934235]
        ]
    },
    "-147": {
        "-14": [
            ["NTTG", 6897, 98, 286.58, -14.956993, -147.651489]
        ],
        "64": [
            ["PAEI", 14389, 0, 338.96, 64.646072, -147.081818],
            ["PAFA", 6480, 0, 218.07, 64.814217, -147.84993],
            ["PAFA", 11769, 0, 218.07, 64.828041, -147.839172],
            ["PAFB", 8551, 0, 269.03, 64.837814, -147.586914]
        ]
    },
    "-138": {
        "-21": [
            ["NTTX", 7874, 0, 273, -21.817165, -138.805084]
        ]
    },
    "167": {
        "-15": [
            ["NVSS", 6571, 98, 309.31, -15.510266, 167.227081]
        ],
        "-45": [
            ["NZMO", 5007, 98, 282, -45.534466, 167.659576]
        ],
        "8": [
            ["PKWA", 6670, 198, 252.7, 8.722833, 167.740494]
        ],
        "-29": [
            ["YSNF", 6592, 150, 302.32, -29.046019, 167.946991]
        ]
    },
    "168": {
        "-17": [
            ["NVVV", 8535, 148, 297.97, -17.703655, 168.328384]
        ],
        "-46": [
            ["NZNV", 5588, 148, 248.21, -46.413319, 168.325058]
        ],
        "-45": [
            ["NZQN", 6194, 0, 257.51, -45.01643, 168.758392]
        ]
    },
    "174": {
        "-37": [
            ["NZAA", 11925, 148, 250.93, -37.006618, 174.805771]
        ],
        "-41": [
            ["NZWN", 6359, 148, 362.79, -41.33535, 174.806335]
        ],
        "-36": [
            ["NZWP", 6663, 148, 232.88, -36.785141, 174.639069],
            ["NZWP", 5182, 148, 277.99, -36.785721, 174.641022]
        ],
        "52": [
            ["PASY", 10027, 150, 287.03, 52.706993, 174.133652]
        ]
    },
    "172": {
        "-43": [
            ["NZCH", 10781, 148, 220.03, -43.474972, 172.548309],
            ["NZCH", 5709, 148, 310.12, -43.494366, 172.540894],
            ["NZWG", 5184, 0, 233, -43.546532, 172.561142]
        ]
    },
    "170": {
        "-45": [
            ["NZDN", 6224, 150, 236, -45.92437, 170.207809]
        ],
        "-43": [
            ["NZMC", 5157, 98, 333, -43.771286, 170.137772]
        ],
        "69": [
            ["UHMP", 8123, 138, 346.52, 69.771667, 170.601669]
        ]
    },
    "175": {
        "-37": [
            ["NZHN", 6433, 0, 375.96, -37.87484, 175.329681]
        ],
        "-40": [
            ["NZOH", 8013, 148, 289.12, -40.209419, 175.399826],
            ["NZOH", 6997, 148, 348.97, -40.217255, 175.390472],
            ["NZPM", 6232, 0, 269.88, -40.31982, 175.625671]
        ]
    },
    "176": {
        "-38": [
            ["NZRO", 5324, 0, 24.96, -38.113636, 176.312485]
        ],
        "-37": [
            ["NZTG", 5986, 0, 273.69, -37.673798, 176.209061]
        ]
    },
    "62": {
        "34": [
            ["OAHR", 8202, 0, 187, 34.227272, 62.22805]
        ],
        "33": [
            ["OASD", 9140, 160, 2.309, 33.378788, 62.260433]
        ],
        "35": [
            ["UT58", 8266, 0, 200.4, 35.673496, 62.559704]
        ]
    },
    "69": {
        "34": [
            ["OAIX", 9852, 180, 212.7, 34.957504, 69.273872],
            ["OAKB", 11483, 164, 287.82, 34.560951, 69.230492]
        ],
        "27": [
            ["OP37", 6015, 150, 319.506, 27.80686, 69.173119]
        ],
        "25": [
            ["OPMK", 9964, 0, 225.1, 25.692528, 69.082993]
        ],
        "31": [
            ["OPZB", 6001, 98, 271, 31.358433, 69.473053]
        ],
        "53": [
            ["UA32", 8325, 0, 211.7, 53.338829, 69.604675]
        ],
        "54": [
            ["UA35", 8190, 0, 245.5, 54.779007, 69.201721]
        ],
        "41": [
            ["UA66", 8183, 105, 260.7, 41.514347, 69.59243],
            ["UT63", 10630, 0, 261.8, 41.314568, 69.409599],
            ["UTTT", 12798, 148, 261.67, 41.258904, 69.304993],
            ["UTTT", 13107, 197, 261.72, 41.260818, 69.305168]
        ],
        "42": [
            ["UAII", 9172, 144, 286.27, 42.36071, 69.495461]
        ],
        "61": [
            ["USHH", 9173, 141, 254.63, 61.031662, 69.111717]
        ],
        "37": [
            ["UT1B", 5012, 98, 310.305, 37.635937, 69.653221]
        ],
        "38": [
            ["UTDK", 10140, 137, 196.49, 38.001663, 69.811668]
        ],
        "40": [
            ["UTDL", 10817, 164, 262.16, 40.217018, 69.715103]
        ],
        "23": [
            ["VABJ", 8344, 150, 224.26, 23.295832, 69.679047]
        ]
    },
    "70": {
        "34": [
            ["OAJL", 6070, 148, 314, 34.391434, 70.502258]
        ],
        "29": [
            ["OP22", 10000, 150, 205, 29.276398, 70.193062],
            ["OPDG", 6472, 98, 361.01, 29.952236, 70.485405]
        ],
        "32": [
            ["OPBN", 8122, 0, 256.47, 32.974709, 70.541534]
        ],
        "33": [
            ["OPMN", 7290, 0, 343.007, 33.007847, 70.066017]
        ],
        "28": [
            ["OPRK", 9868, 148, 194.95, 28.397339, 70.283325]
        ],
        "40": [
            ["UA30", 6056, 115, 323.706, 40.036045, 70.844543],
            ["UT0L", 5590, 0, 248.7, 40.450741, 70.998672],
            ["UT1A", 9525, 145, 259.8, 40.123024, 70.676125]
        ],
        "20": [
            ["VA1P", 5995, 148, 232.7, 20.718466, 70.927856]
        ],
        "22": [
            ["VAJM", 8242, 148, 240, 22.472145, 70.022095],
            ["VAJM", 8236, 148, 300, 22.460846, 70.022079],
            ["VARK", 5411, 148, 227.49, 22.314522, 70.785652]
        ],
        "26": [
            ["VIJR", 9022, 150, 222.3, 26.893818, 70.87484]
        ]
    },
    "65": {
        "31": [
            ["OAKN", 10524, 148, 234.05, 31.51305, 65.858635]
        ],
        "36": [
            ["OASG", 8600, 70, 245.2, 36.755722, 65.926529]
        ],
        "27": [
            ["OP12", 9120, 99, 219.2, 27.856237, 65.168945]
        ],
        "57": [
            ["USTR", 9852, 148, 230.18, 57.186977, 65.319153],
            ["USTR", 8729, 164, 314.11, 57.176662, 65.361694]
        ],
        "55": [
            ["USUU", 8514, 0, 222.3, 55.483685, 65.428734]
        ],
        "38": [
            ["UT1N", 9299, 144, 343.809, 38.7896, 65.779289],
            ["UTSL", 8195, 132, 256.8, 38.836197, 65.935509]
        ],
        "39": [
            ["UT73", 8180, 0, 198.5, 39.148418, 65.169891]
        ],
        "40": [
            ["UT81", 9794, 0, 257.2, 40.119385, 65.182961]
        ]
    },
    "67": {
        "36": [
            ["OAMS", 10499, 0, 242, 36.710922, 67.224197]
        ],
        "26": [
            ["OP17", 5250, 75, 346.905, 26.733437, 67.667946],
            ["OP1A", 5474, 98, 350.705, 26.19066, 67.504936],
            ["OPSN", 6001, 0, 350, 26.465225, 67.718819]
        ],
        "24": [
            ["OPKC", 11159, 151, 254.74, 24.908331, 67.175034],
            ["OPKC", 10457, 151, 254.44, 24.912397, 67.177994],
            ["OPSF", 8038, 150, 259.2, 24.876926, 67.129883]
        ],
        "29": [
            ["OPSB", 6000, 0, 311, 29.569323, 67.850197]
        ],
        "41": [
            ["UA34", 5370, 130, 219.6, 41.290398, 67.980957]
        ],
        "47": [
            ["UAKD", 8512, 138, 231.63, 47.716, 67.7528]
        ],
        "37": [
            ["UT1M", 7845, 124, 201.5, 37.634323, 67.522575],
            ["UTST", 9517, 138, 255.2, 37.289993, 67.325027]
        ],
        "40": [
            ["UT1Q", 9825, 150, 224, 40.261925, 67.923164]
        ],
        "39": [
            ["UTSS", 10197, 161, 275.7, 39.699162, 67.002815]
        ]
    },
    "68": {
        "36": [
            ["OAUZ", 6562, 148, 293, 36.661476, 68.921165]
        ],
        "28": [
            ["OPJA", 10007, 148, 331, 28.267996, 68.459221]
        ],
        "25": [
            ["OPKD", 7077, 0, 204.09, 25.327299, 68.370506]
        ],
        "27": [
            ["OPMJ", 6472, 98, 256.42, 27.33724, 68.152763],
            ["OPSK", 8974, 98, 320.62, 27.712492, 68.800644]
        ],
        "26": [
            ["OPNH", 9025, 150, 200.45, 26.23103, 68.394875]
        ],
        "24": [
            ["OPTH", 8968, 75, 241.1, 24.847456, 68.850273]
        ],
        "38": [
            ["UT45", 8270, 0, 262.6, 38.513786, 68.686836],
            ["UTDD", 10198, 147, 270.1, 38.543301, 68.842575]
        ],
        "23": [
            ["VA1K", 9000, 150, 240, 23.228661, 68.902893]
        ]
    },
    "53": {
        "22": [
            ["OE56", 6888, 95, 308.107, 22.704306, 53.289234],
            ["OESB", 10005, 98, 267, 22.515274, 53.97897]
        ],
        "35": [
            ["OI21", 11738, 0, 238.4, 35.3978, 53.688251],
            ["OIIS", 9095, 0, 218.4, 35.600861, 53.504612]
        ],
        "26": [
            ["OIBK", 12018, 148, 274.83, 26.524754, 53.998573],
            ["OIBK", 12006, 215, 274.86, 26.527456, 53.998802],
            ["OIBV", 6798, 148, 288.7, 26.80727, 53.366112]
        ],
        "36": [
            ["OINZ", 8686, 148, 340.81, 36.633774, 53.19339]
        ],
        "28": [
            ["OISF", 6510, 100, 316.99, 28.885832, 53.730289]
        ],
        "27": [
            ["OISR", 7218, 148, 292, 27.369339, 53.198391]
        ],
        "12": [
            ["OYSQ", 10827, 148, 209.9, 12.646203, 53.907589]
        ],
        "40": [
            ["UT1F", 6600, 120, 245, 40.041958, 53.33934],
            ["UTAK", 8215, 144, 346.89, 40.05249, 53.010559]
        ],
        "39": [
            ["UT1J", 5217, 115, 307.505, 39.406094, 53.205574]
        ]
    },
    "52": {
        "27": [
            ["OIBI", 11812, 148, 296.51, 27.473862, 52.632004],
            ["OIBJ", 7891, 148, 295.35, 27.815987, 52.363113]
        ],
        "29": [
            ["OISS", 13969, 148, 294.53, 29.529234, 52.609196],
            ["OISS", 14239, 148, 294.52, 29.532997, 52.611134]
        ],
        "24": [
            ["OM10", 8778, 0, 311.309, 24.27603, 52.590275],
            ["OMAH", 8205, 148, 349.308, 24.062916, 52.465931],
            ["OMAJ", 7218, 151, 310, 24.175573, 52.631924]
        ],
        "16": [
            ["OYGD", 8818, 148, 262.15, 16.195011, 52.186668]
        ],
        "41": [
            ["TM0I", 5582, 0, 341.806, 41.542873, 52.651848]
        ],
        "55": [
            ["UWKE", 8264, 138, 228.56, 55.571659, 52.110027]
        ]
    },
    "54": {
        "26": [
            ["OIBL", 8198, 148, 260.59, 26.534101, 54.8372]
        ],
        "25": [
            ["OIBS", 8217, 175, 309.51, 25.902599, 54.54924]
        ],
        "36": [
            ["OING", 7081, 148, 313.97, 36.90271, 54.410065]
        ],
        "28": [
            ["OISD", 5260, 0, 284.005, 28.71896, 54.453224]
        ],
        "27": [
            ["OISL", 10326, 148, 269.11, 27.67494, 54.399269]
        ],
        "31": [
            ["OIYY", 13308, 148, 313.97, 31.892271, 54.292404]
        ],
        "24": [
            ["OM11", 7080, 200, 311.207, 24.512459, 54.988094],
            ["OMAA", 13463, 148, 307.89, 24.421707, 54.667187],
            ["OMAD", 13198, 150, 308.11, 24.41519, 54.47657],
            ["OMAM", 12005, 0, 307.04, 24.238327, 54.562138]
        ],
        "17": [
            ["OOSA", 10967, 148, 250.71, 17.043676, 54.106129],
            ["OOTH", 13123, 148, 353.513, 17.648096, 54.026745]
        ],
        "39": [
            ["UT1H", 8200, 135, 288.808, 39.476974, 54.379772]
        ]
    },
    "51": {
        "32": [
            ["OIFE", 9824, 148, 256.97, 32.932613, 51.57666],
            ["OIFM", 14421, 148, 77.9, 32.744659, 51.838783],
            ["OIFM", 14421, 148, 257.9, 32.752953, 51.884773],
            ["OIFM", 14421, 148, 257.91, 32.756996, 51.883751],
            ["OIFP", 10807, 0, 265, 32.621288, 51.707809],
            ["OIFV", 6990, 0, 290.107, 32.323566, 51.387192]
        ],
        "33": [
            ["OIFK", 8845, 145, 290.31, 33.891121, 51.590748]
        ],
        "35": [
            ["OIID", 5954, 148, 223, 35.708656, 51.48262],
            ["OIIE", 11962, 148, 288.77, 35.412586, 51.161694],
            ["OIIE", 13757, 148, 288.84, 35.413166, 51.166],
            ["OIIG", 6000, 120, 273.5, 35.632828, 51.39344],
            ["OIII", 13236, 197, 289.73, 35.68243, 51.333672],
            ["OIII", 13085, 148, 289.68, 35.684536, 51.333729]
        ],
        "36": [
            ["OINN", 6670, 115, 288.76, 36.660683, 51.475952]
        ],
        "30": [
            ["OISY", 8944, 148, 312.61, 30.691435, 51.556713]
        ],
        "24": [
            ["OM0A", 5600, 0, 320.706, 24.208748, 51.455223]
        ],
        "25": [
            ["OTBD", 15033, 151, 338.07, 25.241543, 51.5737],
            ["OTBH", 12336, 148, 338.12, 25.100912, 51.32272]
        ],
        "51": [
            ["UARR", 7874, 138, 233, 51.15733, 51.556805]
        ],
        "43": [
            ["UATE", 8704, 147, 302.14, 43.853645, 51.105961]
        ],
        "47": [
            ["UATG", 7736, 144, 325.57, 47.11124, 51.833817]
        ]
    },
    "56": {
        "27": [
            ["OIKB", 11983, 148, 207.77, 27.232376, 56.387691],
            ["OIKB", 11316, 98, 207.78, 27.232645, 56.385002],
            ["OIKP", 8569, 115, 258.41, 27.16194, 56.185024]
        ],
        "30": [
            ["OIKK", 6646, 148, 233.54, 30.267895, 56.968288],
            ["OIKK", 12443, 148, 338.27, 30.257128, 56.958912],
            ["OIKR", 9809, 148, 292.05, 30.292656, 56.065582]
        ],
        "33": [
            ["OIMT", 9989, 148, 332.24, 33.655628, 56.900002]
        ],
        "37": [
            ["OIMX", 9560, 0, 212.1, 37.66383, 56.221889]
        ],
        "25": [
            ["OMFJ", 12303, 148, 292.44, 25.105429, 56.342033]
        ],
        "22": [
            ["OOFD", 8071, 0, 310, 22.341213, 56.491669]
        ],
        "26": [
            ["OOKB", 8202, 75, 191, 26.194372, 56.235725]
        ],
        "57": [
            ["USPP", 8414, 161, 223.76, 57.924999, 56.041695]
        ],
        "38": [
            ["UT55", 7871, 0, 281.7, 38.978321, 56.339611]
        ]
    },
    "58": {
        "29": [
            ["OIKM", 11108, 148, 302.7, 29.075932, 58.464649]
        ],
        "20": [
            ["OOMA", 8381, 148, 246.63, 20.680546, 58.903267],
            ["OOMA", 9983, 148, 346.88, 20.657831, 58.89484]
        ],
        "23": [
            ["OOMS", 11769, 148, 265, 23.594486, 58.302193]
        ],
        "53": [
            ["USCM", 10147, 148, 196.63, 53.406662, 58.763348]
        ],
        "38": [
            ["UT1G", 8665, 148, 333.409, 38.001347, 58.201775]
        ],
        "37": [
            ["UTAA", 9910, 196, 299.38, 37.975109, 58.375111],
            ["UTAA", 12178, 151, 299.93, 37.98344, 58.381786]
        ],
        "51": [
            ["UWOR", 9495, 150, 255.48, 51.074421, 58.617016]
        ]
    },
    "59": {
        "32": [
            ["OIMB", 6897, 82, 258.21, 32.898808, 59.27742],
            ["OIMB", 9415, 148, 278.52, 32.892479, 59.300613]
        ],
        "36": [
            ["OIMM", 12749, 0, 313.63, 36.222919, 59.656116],
            ["OIMM", 12388, 0, 313.7, 36.224625, 59.657295]
        ],
        "42": [
            ["UT1K", 6293, 0, 334.106, 42.476204, 59.628094],
            ["UT1K", 9829, 0, 334.21, 42.477104, 59.630344]
        ],
        "41": [
            ["UTAT", 8778, 138, 270.66, 41.760834, 59.842808]
        ]
    },
    "61": {
        "36": [
            ["OIMC", 13084, 148, 325.29, 36.483337, 61.075974],
            ["UT50", 6540, 0, 251.2, 36.494808, 61.277054]
        ],
        "31": [
            ["OIZB", 9868, 148, 346.84, 31.083967, 61.547703]
        ],
        "29": [
            ["OP35", 5015, 100, 360.305, 29.033613, 61.64735]
        ],
        "55": [
            ["USCC", 10674, 197, 283.16, 55.301662, 61.530045],
            ["Z25T", 8190, 0, 312.108, 55.253277, 61.313057]
        ],
        "41": [
            ["UT1E", 5576, 120, 191.1, 41.131908, 61.417252]
        ],
        "37": [
            ["UT52", 9855, 0, 358.01, 37.650833, 61.827572],
            ["UTAM", 8004, 98, 358.27, 37.607773, 61.896393],
            ["UTAM", 9118, 147, 358.49, 37.607773, 61.898056]
        ]
    },
    "60": {
        "25": [
            ["OIZC", 9528, 150, 270.61, 25.442493, 60.394749],
            ["OIZC", 12413, 150, 270.73, 25.444935, 60.403027]
        ],
        "29": [
            ["OIZH", 13977, 148, 352.74, 29.456774, 60.907917]
        ],
        "27": [
            ["OIZI", 8133, 150, 350.4, 27.225868, 60.722069]
        ],
        "56": [
            ["USSS", 10766, 148, 273.58, 56.739819, 60.835106],
            ["USSS", 8011, 140, 270, 56.744995, 60.823368]
        ],
        "41": [
            ["UTNU", 9685, 165, 318.84, 41.573322, 60.656689]
        ],
        "57": [
            ["Z25Z", 8202, 0, 276.9, 57.985043, 60.256325]
        ]
    },
    "73": {
        "32": [
            ["OP1Y", 9000, 75, 229.3, 32.085888, 73.801216]
        ],
        "31": [
            ["OPFA", 9245, 151, 214.77, 31.375507, 73.004311]
        ],
        "30": [
            ["OPOK", 10995, 80, 360.111, 30.725945, 73.357704]
        ],
        "33": [
            ["OPQS", 6693, 148, 322, 33.556091, 73.040115],
            ["OPRN", 11003, 150, 298.25, 33.609726, 73.114456]
        ],
        "49": [
            ["UAKK", 10813, 197, 238.37, 49.678593, 73.35405]
        ],
        "54": [
            ["UNOO", 8240, 148, 257.22, 54.96999, 73.330032],
            ["Z25X", 9907, 0, 235.7, 54.981297, 73.575233]
        ],
        "61": [
            ["USRR", 9341, 148, 270, 61.343327, 73.430046]
        ],
        "22": [
            ["VABO", 8096, 150, 223.64, 22.344358, 73.23452]
        ],
        "15": [
            ["VAGO", 11253, 148, 258.95, 15.383615, 73.848877]
        ],
        "20": [
            ["VAOZ", 9869, 0, 265, 20.120523, 73.927376]
        ],
        "18": [
            ["VAPO", 8318, 150, 279, 18.581547, 73.931885],
            ["VAPO", 6200, 150, 319, 18.576914, 73.92588]
        ],
        "24": [
            ["VAUD", 7494, 150, 262.1, 24.618999, 73.907402]
        ],
        "29": [
            ["VI43", 8990, 148, 229.5, 29.395775, 73.91468]
        ],
        "28": [
            ["VIBK", 8960, 148, 225.4, 28.079037, 73.217079]
        ],
        "26": [
            ["VIJO", 9596, 150, 230, 26.281872, 73.068192]
        ],
        "0": [
            ["VRMG", 8094, 148, 278.74, -0.694925, 73.166618]
        ],
        "4": [
            ["VRMM", 10547, 148, -0.94, 4.177435, 73.529381]
        ]
    },
    "74": {
        "32": [
            ["OP27", 6256, 148, 230.3, 32.244453, 74.138771],
            ["VIJU", 6170, 0, 360, 32.679317, 74.836464]
        ],
        "35": [
            ["OPGT", 5396, 98, 251.52, 35.921127, 74.342308]
        ],
        "31": [
            ["OPLA", 9016, 151, 360.87, 31.509201, 74.40239],
            ["OPLA", 11003, 151, 360.88, 31.506466, 74.404297],
            ["OPLH", 6700, 150, 321, 31.492855, 74.390114],
            ["VIAR", 10807, 148, 338.05, 31.695992, 74.803802]
        ],
        "43": [
            ["UAFM", 13561, 180, 259.67, 43.064991, 74.50338]
        ],
        "42": [
            ["UAFW", 8820, 164, 294.42, 42.849991, 74.861687]
        ],
        "62": [
            ["USRK", 8625, 138, 369.48, 62.178329, 74.529991]
        ],
        "38": [
            ["UT44", 8208, 0, 248.8, 38.194492, 74.038101]
        ],
        "33": [
            ["VI63", 10500, 0, 303.51, 33.868675, 74.990143],
            ["VISR", 12090, 150, 311, 33.975948, 74.788925]
        ],
        "30": [
            ["VIBT", 9200, 150, 311.009, 30.261856, 74.7668]
        ],
        "12": [
            ["VOML", 5309, 150, 269.23, 12.960917, 74.89827]
        ]
    },
    "66": {
        "29": [
            ["OP28", 8100, 60, 331.208, 29.916014, 66.750656]
        ],
        "27": [
            ["OPKH", 5958, 0, 297.58, 27.788851, 66.65123]
        ],
        "24": [
            ["OPMR", 7800, 120, 220, 24.899197, 66.931473],
            ["OPMR", 9000, 200, 270, 24.899992, 66.946945]
        ],
        "30": [
            ["OPQT", 12010, 150, 316.54, 30.240183, 66.951797]
        ],
        "50": [
            ["UA33", 8185, 0, 270.7, 50.31078, 66.972237]
        ],
        "66": [
            ["USDD", 8831, 151, 241.21, 66.595337, 66.636261]
        ]
    },
    "71": {
        "29": [
            ["OPBW", 9343, 98, 258.97, 29.350653, 71.732597]
        ],
        "35": [
            ["OPCH", 5792, 98, 207.49, 35.893234, 71.804443]
        ],
        "33": [
            ["OPKT", 7717, 0, 322, 33.568924, 71.447411],
            ["OPPS", 8981, 150, 355.93, 33.981422, 71.515648]
        ],
        "32": [
            ["OPMI", 10161, 156, 241.5, 32.568359, 71.586174],
            ["OPMI", 10348, 97, 241.5, 32.569832, 71.585213]
        ],
        "30": [
            ["OPMT", 9068, 98, 3.33, 30.190853, 71.418274]
        ],
        "34": [
            ["OPRS", 9085, 164, 274.1, 34.078617, 71.986343],
            ["OPRS", 5840, 164, 274.1, 34.082115, 71.983459]
        ],
        "51": [
            ["UACC", 11466, 147, 224.51, 51.033394, 71.484589]
        ],
        "42": [
            ["UADD", 9522, 148, 317.06, 42.844021, 71.315765]
        ],
        "40": [
            ["UT0J", 8346, 0, 246.1, 40.383255, 71.108521],
            ["UT1S", 9647, 0, 363.31, 40.34515, 71.74369],
            ["UT64", 10698, 0, 287.611, 40.980129, 71.575264]
        ],
        "37": [
            ["UT1C", 6036, 160, 337.606, 37.519569, 71.505363]
        ],
        "25": [
            ["VIUT", 9002, 150, 200.2, 25.824577, 71.487022]
        ]
    },
    "63": {
        "25": [
            ["OPPI", 8971, 151, 238.31, 25.296619, 63.355999],
            ["OPTU", 5958, 100, 263.09, 25.987345, 63.039192]
        ],
        "53": [
            ["UAUU", 8236, 157, 336.95, 53.196564, 63.557552]
        ],
        "39": [
            ["UTAV", 9022, 138, 335.957, 39.072029, 63.619831]
        ]
    },
    "75": {
        "35": [
            ["OPSD", 11954, 100, 327.07, 35.325466, 75.550468],
            ["OPSD", 6466, 101, 332.57, 35.323269, 75.535164]
        ],
        "46": [
            ["UAAH", 8198, 131, 231.78, 46.900867, 75.018112]
        ],
        "19": [
            ["VAAU", 7500, 148, 269.07, 19.863356, 75.409103]
        ],
        "15": [
            ["VAHB", 5479, 100, 262.7, 15.364461, 75.096825]
        ],
        "22": [
            ["VAID", 7504, 148, 245.11, 22.72595, 75.811607]
        ],
        "30": [
            ["VI25", 8985, 0, 311.109, 30.740425, 75.640587]
        ],
        "29": [
            ["VI29", 8987, 0, 232.5, 29.568077, 75.017319]
        ],
        "31": [
            ["VIAX", 9039, 148, 313.209, 31.424713, 75.771378]
        ],
        "26": [
            ["VIJP", 9169, 148, 264.99, 26.825081, 75.826385]
        ],
        "32": [
            ["VIPK", 9100, 150, 191, 32.24202, 75.635544],
            ["VIUX", 9058, 148, 358.409, 32.889866, 75.155533]
        ],
        "11": [
            ["VOCL", 9383, 150, 281.36, 11.133565, 75.968277]
        ]
    },
    "-161": {
        "60": [
            ["PABE", 6381, 0, 23.46, 60.771763, -161.843521]
        ]
    },
    "-145": {
        "63": [
            ["PABI", 6120, 0, 298, 63.990395, -145.704056],
            ["PABI", 7476, 0, 29.76, 63.987576, -145.733627]
        ],
        "60": [
            ["PACV", 7480, 150, 294.22, 60.488335, -145.458878]
        ]
    },
    "-156": {
        "71": [
            ["PABR", 6480, 150, 269.97, 71.285454, -156.738312]
        ],
        "64": [
            ["PAGA", 7235, 150, 269.52, 64.736084, -156.913483]
        ],
        "58": [
            ["PAKN", 8479, 0, 311.85, 58.668373, -156.63121]
        ],
        "19": [
            ["PHKO", 11041, 150, 364.8, 19.723677, -156.046982]
        ],
        "20": [
            ["PHNY", 5008, 150, 223.92, 20.790554, -156.94632],
            ["PHOG", 7011, 150, 214.86, 20.904915, -156.424561]
        ]
    },
    "-162": {
        "55": [
            ["PACD", 5114, 150, 274.78, 55.1978, -162.702942],
            ["PACD", 10401, 150, 338.36, 55.195866, -162.719498]
        ],
        "66": [
            ["PAOT", 5882, 0, 281.79, 66.886131, -162.569168]
        ],
        "5": [
            ["PLPA", 6000, 0, 249, 5.886281, -162.058945]
        ]
    },
    "-158": {
        "59": [
            ["PADL", 6385, 150, 206.49, 59.052502, -158.497925]
        ],
        "21": [
            ["PHDH", 9004, 75, 270.59, 21.579338, -158.184006],
            ["PHHI", 5617, 295, 249.93, 21.484215, -158.02829],
            ["PHJR", 8007, 200, 234.65, 21.309334, -158.05751],
            ["PHJR", 6004, 200, 300.86, 21.29882, -158.063309]
        ]
    },
    "-152": {
        "57": [
            ["PADQ", 7516, 150, 272, 57.751461, -152.47998],
            ["PADQ", 5388, 150, 307.03, 57.746037, -152.48027]
        ]
    },
    "-151": {
        "60": [
            ["PAEN", 7555, 150, 211.06, 60.58086, -151.236649]
        ],
        "59": [
            ["PAHO", 6684, 150, 235, 59.650806, -151.461716]
        ]
    },
    "-154": {
        "59": [
            ["PAIL", 5074, 100, 272.4, 59.751297, -154.896484]
        ]
    },
    "-155": {
        "62": [
            ["PAMC", 5465, 100, 358.93, 62.943546, -155.60466]
        ],
        "20": [
            ["PHMU", 5202, 100, 231.88, 20.005726, -155.66214]
        ],
        "19": [
            ["PHTO", 5610, 150, 220.66, 19.724184, -155.051773],
            ["PHTO", 9796, 150, 270.01, 19.721361, -155.029266]
        ]
    },
    "-165": {
        "64": [
            ["PAOM", 5559, 0, 221.68, 64.518608, -165.428238],
            ["PAOM", 5982, 0, 289.75, 64.508759, -165.432159]
        ]
    },
    "-132": {
        "56": [
            ["PAPG", 5990, 150, 250.75, 56.804352, -132.931137],
            ["PAWG", 5986, 150, 301.39, 56.480045, -132.357132]
        ]
    },
    "-148": {
        "70": [
            ["PASC", 6479, 0, 255.02, 70.197052, -148.439835]
        ]
    },
    "-146": {
        "61": [
            ["PAVD", 6491, 150, 261.28, 61.135292, -146.230103]
        ]
    },
    "-139": {
        "59": [
            ["PAYA", 6463, 150, 224.99, 59.509083, -139.659637],
            ["PAYA", 7726, 150, 315.02, 59.496452, -139.635193]
        ]
    },
    "-157": {
        "21": [
            ["PHNG", 7756, 200, 231.19, 21.457094, -157.757507],
            ["PHNL", 9009, 150, 232.91, 21.328815, -157.906006],
            ["PHNL", 6958, 150, 232.89, 21.32984, -157.906998],
            ["PHNL", 11995, 200, 270, 21.306795, -157.910568],
            ["PHNL", 12294, 150, 270, 21.325243, -157.90715]
        ],
        "1": [
            ["PLCH", 6813, 98, 269.89, 1.990973, -157.338882]
        ]
    },
    "162": {
        "11": [
            ["PKMA", 7700, 148, 246, 11.343994, 162.338196]
        ],
        "5": [
            ["PTSA", 5759, 150, 235.59, 5.361433, 162.964935]
        ]
    },
    "171": {
        "7": [
            ["PKMJ", 7899, 150, 256.14, 7.067339, 171.283005]
        ]
    },
    "-177": {
        "28": [
            ["PMDY", 7900, 200, 248.56, 28.205393, -177.370026]
        ]
    },
    "151": {
        "7": [
            ["PTKK", 6017, 150, 225.85, 7.467809, 151.848816]
        ],
        "-30": [
            ["YARM", 5696, 98, 238.37, -30.524752, 151.624557]
        ],
        "-27": [
            ["YBOK", 5422, 98, 325.2, -27.414867, 151.746643]
        ],
        "-23": [
            ["YGLA", 5363, 98, 290.07, -23.871954, 151.232117]
        ],
        "-29": [
            ["YIVL", 6949, 98, 350.62, -29.897411, 151.147049]
        ],
        "-26": [
            ["YKRY", 5264, 98, 349.11, -26.58663, 151.841125]
        ],
        "-28": [
            ["YSPE", 5612, 98, 271.17, -28.620241, 151.990021]
        ],
        "-33": [
            ["YSSY", 8292, 148, 254.23, -33.937557, 151.189987],
            ["YSSY", 13022, 148, 347.83, -33.964272, 151.180664],
            ["YSSY", 8011, 148, 347.82, -33.971172, 151.193939]
        ],
        "-32": [
            ["YWLM", 8002, 148, 310.39, -32.802979, 151.844742]
        ]
    },
    "158": {
        "6": [
            ["PTPN", 6001, 150, 270.27, 6.985061, 158.21727]
        ],
        "53": [
            ["UHPP", 8202, 197, 337, 53.154251, 158.45726],
            ["UHPP", 11082, 197, 338.77, 53.154999, 158.460022]
        ]
    },
    "134": {
        "7": [
            ["PTRO", 7199, 150, 271.32, 7.367071, 134.55423]
        ],
        "35": [
            ["RJOR", 6554, 150, 273.8, 35.529453, 134.176071]
        ],
        "34": [
            ["RJOS", 6560, 150, 284.03, 34.130329, 134.61676],
            ["RJOT", 8195, 200, 252.85, 34.217361, 134.028763]
        ],
        "0": [
            ["WA0K", 5757, 0, 271.4, -0.935903, 134.87999],
            ["WASR", 5440, 95, 358.26, -0.899561, 134.048996]
        ],
        "-6": [
            ["WA1B", 5165, 95, 323.205, -6.579085, 134.151337]
        ],
        "-19": [
            ["YTNK", 6427, 98, 254.07, -19.63093, 134.188263]
        ]
    },
    "138": {
        "9": [
            ["PTYA", 6002, 150, 251.58, 9.50151, 138.090408]
        ],
        "-4": [
            ["WAJW", 5413, 98, 338, -4.10437, 138.954178]
        ],
        "-18": [
            ["YCNY", 5750, 98, 321.53, -18.765884, 138.715134]
        ],
        "-30": [
            ["YLEC", 5610, 98, 301.02, -30.603579, 138.439529]
        ],
        "-34": [
            ["YPAD", 10166, 148, 230.08, -34.940605, 138.543304],
            ["YPAD", 5420, 148, 303.58, -34.950821, 138.535629],
            ["YPED", 8413, 150, 8.49, -34.717342, 138.613434]
        ]
    },
    "120": {
        "22": [
            ["RCAY", 7581, 0, 0.74, 22.771969, 120.261314],
            ["RCDC", 7817, 148, 267.81, 22.672987, 120.47332],
            ["RCKH", 10349, 197, 271.91, 22.576593, 120.365288],
            ["RCKW", 5616, 98, 319.23, 22.035, 120.735565],
            ["RCNN", 10028, 148, 178.93, 22.964161, 120.203888],
            ["RCNN", 10028, 148, -1.07, 22.936661, 120.204453],
            ["RCNN", 10028, 148, -1.07, 22.936661, 120.207779],
            ["RCSQ", 8008, 148, 257.96, 22.702276, 120.493935]
        ],
        "23": [
            ["RCKU", 10003, 0, -0.63, 23.449883, 120.390717]
        ],
        "24": [
            ["RCLG", 5338, 0, -1.33, 24.178856, 120.654015],
            ["RCMQ", 11995, 148, 356.55, 24.248634, 120.621803],
            ["RCPO", 12052, 148, 225.01, 24.829676, 120.952499]
        ],
        "14": [
            ["RPLB", 9010, 148, 247.33, 14.799209, 120.283157],
            ["RPLS", 7576, 150, 250, 14.497461, 120.915108],
            ["RPUF", 8388, 140, 205.89, 14.995769, 120.501945]
        ],
        "15": [
            ["RPLC", 10540, 197, 200.96, 15.201356, 120.56855],
            ["RPLC", 10560, 148, 200.96, 15.19763, 120.56282]
        ],
        "18": [
            ["RPLI", 7962, 148, 185.38, 18.188644, 120.532341]
        ],
        "16": [
            ["RPUB", 5516, 115, 268.37, 16.379068, 120.623512]
        ],
        "-9": [
            ["WADW", 5201, 98, 331.44, -9.671455, 120.30146]
        ],
        "-26": [
            ["YJUN", 6890, 0, 262.9, -26.420765, 120.588478]
        ],
        "-27": [
            ["YMNE", 5896, 98, 294.206, -27.290472, 120.564018]
        ],
        "30": [
            ["ZSHC", 11808, 148, 242.92, 30.235701, 120.448357]
        ],
        "36": [
            ["ZSQD", 11169, 148, 345.04, 36.252014, 120.380417]
        ]
    },
    "118": {
        "24": [
            ["RCBS", 9820, 148, 243.39, 24.434113, 118.372444],
            ["ZSAM", 11163, 148, 232.89, 24.552549, 118.138397]
        ],
        "9": [
            ["RPVP", 8533, 148, 272.52, 9.741468, 118.765846]
        ],
        "-8": [
            ["WADB", 5421, 98, 318.23, -8.55431, 118.697113]
        ],
        "5": [
            ["WBKS", 6997, 151, 260.89, 5.90391, 118.062881]
        ],
        "4": [
            ["WBKW", 8829, 155, 238.06, 4.319774, 118.132263]
        ],
        "-26": [
            ["YMEK", 7152, 98, 264.87, -26.607359, 118.556931]
        ],
        "-20": [
            ["YPPD", 8217, 148, 317.55, -20.390703, 118.637817]
        ],
        "32": [
            ["Z08T", 7218, 0, 234.7, 32.004051, 118.821198]
        ],
        "31": [
            ["ZSNJ", 11810, 148, 237.92, 31.748594, 118.876137]
        ]
    },
    "119": {
        "26": [
            ["RCFG", 5791, 98, 206.19, 26.166901, 119.962372]
        ],
        "23": [
            ["RCQC", 9873, 148, 198.16, 23.581488, 119.632851],
            ["Z28W", 6726, 0, 219.6, 23.525076, 119.589874]
        ],
        "5": [
            ["RPMN", 5249, 98, 197, 5.057673, 119.746956]
        ],
        "-5": [
            ["WAAA", 8215, 148, 310.66, -5.068955, 119.56263]
        ],
        "0": [
            ["WAML", 6809, 98, 336.06, -0.926231, 119.913116]
        ],
        "-22": [
            ["YBRY", 6365, 99, 285.406, -22.677172, 119.176537]
        ],
        "-23": [
            ["YNWN", 6805, 98, 235.72, -23.413235, 119.811447]
        ],
        "49": [
            ["ZBLA", 8512, 148, 264, 49.206211, 119.842766]
        ],
        "25": [
            ["ZSFZ", 11838, 150, 206.91, 25.947803, 119.669838]
        ]
    },
    "121": {
        "22": [
            ["RCFN", 8033, 148, 218.71, 22.763464, 121.109093],
            ["RCQS", 11019, 147, 214.54, 22.805389, 121.191185]
        ],
        "25": [
            ["RCGM", 10007, 0, 229.18, 25.064827, 121.254044],
            ["RCSS", 8571, 197, 272.01, 25.06912, 121.565536],
            ["RCTP", 12020, 197, 229.07, 25.094675, 121.243484],
            ["RCTP", 11001, 197, 229.07, 25.081377, 121.24942]
        ],
        "24": [
            ["RCYU", 9048, 148, 206.22, 24.034832, 121.62294],
            ["Z28U", 8571, 0, 226.8, 24.98638, 121.247063]
        ],
        "14": [
            ["RPLL", 11196, 197, 240.19, 14.513833, 121.028931],
            ["RPLL", 6568, 148, 314.92, 14.509962, 121.018211]
        ],
        "15": [
            ["RPLV", 5249, 78, 228.7, 15.438634, 121.092827]
        ],
        "12": [
            ["RPUH", 6024, 98, 285, 12.361221, 121.062904]
        ],
        "17": [
            ["RPUT", 5964, 98, 351, 17.631912, 121.730507]
        ],
        "16": [
            ["RPUY", 5709, 118, 300, 16.926252, 121.725197]
        ],
        "-27": [
            ["YBWG", 6688, 98, 268.63, -27.365179, 121.044449]
        ],
        "-28": [
            ["YMMI", 6562, 98, 213.2, -28.697456, 121.895752]
        ],
        "-30": [
            ["YPKG", 6558, 148, 290.51, -30.794575, 121.474205]
        ],
        "18": [
            ["Z25M", 5085, 0, 294.505, 18.601368, 121.068459]
        ],
        "29": [
            ["ZSNB", 8203, 148, 304.08, 29.816998, 121.474113]
        ],
        "31": [
            ["ZSPD", 12467, 197, 342, 31.120071, 121.821701],
            ["ZSPD", 13150, 197, 342.05, 31.124504, 121.796494],
            ["ZSSS", 11178, 190, -3.99, 31.182482, 121.3368]
        ],
        "37": [
            ["ZSYT", 8533, 148, 217.93, 37.410889, 121.380722]
        ],
        "38": [
            ["ZYTL", 10813, 148, 276.01, 38.958435, 121.549019]
        ]
    },
    "140": {
        "35": [
            ["RJAA", 13132, 196, 329.57, 35.743851, 140.390335],
            ["RJAA", 7159, 196, 329.57, 35.785778, 140.392166],
            ["RJTL", 7393, 150, 180, 35.809105, 140.012299]
        ],
        "36": [
            ["RJAH", 8867, 150, 198.97, 36.192497, 140.420532]
        ],
        "41": [
            ["RJCH", 9820, 150, 288.07, 41.765984, 140.839203]
        ],
        "40": [
            ["RJSA", 8197, 200, 231.85, 40.7416, 140.702606],
            ["RJSR", 6553, 148, 280.03, 40.1903, 140.383011]
        ],
        "38": [
            ["RJSC", 6568, 150, 186.57, 38.420841, 140.37265],
            ["RJSS", 9830, 150, 262.54, 38.142269, 140.932693]
        ],
        "37": [
            ["RJSF", 8212, 197, 182.19, 37.238674, 140.428513]
        ],
        "39": [
            ["RJSK", 8190, 200, 276.62, 39.614346, 140.233139]
        ],
        "-2": [
            ["WAJJ", 7164, 148, 306.93, -2.582944, 140.524139]
        ],
        "-8": [
            ["WAKK", 6119, 98, 338.66, -8.529469, 140.420837]
        ],
        "-20": [
            ["YCCY", 6571, 98, 311.12, -20.672052, 140.514023]
        ],
        "-37": [
            ["YMTG", 5008, 98, 365.77, -37.753948, 140.787949]
        ],
        "-28": [
            ["YOOM", 5638, 98, 306.86, -28.103544, 140.204651]
        ],
        "-34": [
            ["YREN", 5696, 98, 254.04, -34.196087, 140.677689]
        ],
        "-21": [
            ["YTEE", 5912, 98, 324.1, -21.841787, 140.893051]
        ]
    },
    "137": {
        "36": [
            ["RJAF", 6570, 150, 351.05, 36.157848, 137.924408],
            ["RJNT", 6570, 150, 193.55, 36.657177, 137.190033]
        ],
        "34": [
            ["RJNH", 8607, 148, 265.88, 34.751389, 137.7173]
        ],
        "-32": [
            ["YPAG", 5422, 98, 339.33, -32.511971, 137.717651]
        ],
        "-33": [
            ["YWHA", 5545, 148, 354.3, -33.066254, 137.520264]
        ]
    },
    "135": {
        "34": [
            ["RJBB", 11483, 200, 230.92, 34.437229, 135.258896],
            ["RJOO", 9845, 200, 315.09, 34.772194, 135.451904],
            ["RJOO", 5999, 150, 315.09, 34.783615, 135.442825]
        ],
        "33": [
            ["RJBD", 6567, 148, 321.05, 33.655304, 135.371338]
        ],
        "48": [
            ["UHHH", 13615, 197, 220.65, 48.541668, 135.208374],
            ["UHHH", 12169, 148, 221.49, 48.540001, 135.201691]
        ]
    },
    "132": {
        "34": [
            ["RJBH", 5912, 148, 208.66, 34.373875, 132.41861],
            ["RJOA", 9831, 200, 270, 34.43602, 132.935791],
            ["RJOI", 7689, 150, 189.43, 34.154911, 132.237503]
        ],
        "35": [
            ["RJOC", 6559, 148, 239.38, 35.418282, 132.89949]
        ],
        "33": [
            ["RJOM", 8204, 150, 310.63, 33.81992, 132.709915]
        ],
        "43": [
            ["UHWW", 11549, 197, 241.74, 43.406662, 132.166702]
        ],
        "-14": [
            ["YPTN", 9019, 150, 319.04, -14.530865, 132.385605]
        ]
    },
    "131": {
        "33": [
            ["RJDC", 8199, 150, 242.21, 33.935154, 131.290756],
            ["RJFO", 9860, 150, 180.42, 33.493019, 131.737244],
            ["RJFZ", 7864, 150, 243.95, 33.68972, 131.052048]
        ],
        "31": [
            ["RJFM", 8194, 150, 265.16, 31.878077, 131.461624]
        ],
        "32": [
            ["RJFN", 8846, 150, 281.09, 32.081577, 131.46608]
        ],
        "34": [
            ["RJOW", 6556, 148, 284.82, 34.674084, 131.800888]
        ],
        "0": [
            ["WASS", 5428, 98, 220.25, -0.920409, 131.125504]
        ]
    },
    "129": {
        "34": [
            ["RJDT", 6236, 150, 316.11, 34.278717, 129.337723]
        ],
        "32": [
            ["RJFU", 9850, 200, 318.08, 32.906918, 129.92421]
        ],
        "28": [
            ["RJKA", 6575, 150, 206.42, 28.438843, 129.717117]
        ],
        "35": [
            ["RKPP", 6520, 0, 324, 35.164425, 129.13475],
            ["RKPU", 6572, 148, -3.9, 35.584488, 129.352493],
            ["RKTH", 6989, 150, 269.24, 35.988068, 129.43222]
        ],
        "62": [
            ["UEEE", 10914, 197, 218.79, 62.104992, 129.795029]
        ],
        "44": [
            ["ZYMD", 8527, 148, 205.96, 44.53384, 129.573853]
        ],
        "42": [
            ["ZYYJ", 8517, 148, 261.98, 42.883293, 129.464111]
        ]
    },
    "142": {
        "43": [
            ["RJEC", 8202, 200, 334.21, 43.660587, 142.45433]
        ],
        "46": [
            ["UHSS", 10946, 148, 182.18, 46.900002, 142.716675]
        ],
        "-10": [
            ["YBAM", 5262, 98, 317.42, -10.950809, 142.459473]
        ],
        "-12": [
            ["YBSG", 10003, 148, 302, -12.631143, 142.099136]
        ],
        "-27": [
            ["YJAK", 5906, 0, 355.006, -27.654165, 142.406891]
        ],
        "-34": [
            ["YMIA", 5999, 148, 281.66, -34.229729, 142.093338]
        ]
    },
    "130": {
        "33": [
            ["RJFA", 5331, 150, 295.79, 33.879379, 130.661819],
            ["RJFF", 9213, 197, 330.31, 33.574963, 130.458191],
            ["RJFR", 5243, 0, 281.29, 33.834785, 130.955551],
            ["RJFS", 6555, 148, 279.27, 33.148262, 130.31282]
        ],
        "31": [
            ["RJFK", 9856, 150, 330.07, 31.791681, 130.727341],
            ["RJFY", 7368, 148, 258.99, 31.368912, 130.850403]
        ],
        "32": [
            ["RJFT", 9838, 150, 244.52, 32.843121, 130.869553]
        ],
        "-25": [
            ["YAYE", 8548, 98, 309.47, -25.192982, 130.986755]
        ],
        "-12": [
            ["YPDN", 11008, 197, 288.99, -12.418582, 130.894699],
            ["YPDN", 5025, 98, 359.85, -12.421974, 130.870926]
        ],
        "46": [
            ["ZYJM", 7209, 148, 226.96, 46.846745, 130.472229]
        ]
    },
    "128": {
        "32": [
            ["RJFE", 6571, 150, 205.69, 32.674385, 128.837448]
        ],
        "27": [
            ["RJKN", 6579, 150, 186.03, 27.845278, 128.882446]
        ],
        "38": [
            ["RKND", 5257, 100, 219.59, 38.153149, 128.606277],
            ["RKNY", 8203, 148, 321.02, 38.052559, 128.678146]
        ],
        "37": [
            ["RKNN", 9001, 150, 248.34, 37.758305, 128.959442]
        ],
        "35": [
            ["RKPK", 10516, 197, -6.04, 35.165173, 128.938858],
            ["RKPK", 9013, 150, -6.02, 35.169495, 128.940582],
            ["RKPS", 9014, 150, 235.04, 35.095272, 128.084457],
            ["RKPS", 8957, 150, 235.57, 35.096107, 128.081696],
            ["RKTN", 9032, 150, 304.14, 35.886669, 128.671402],
            ["RKTN", 9011, 150, 304.49, 35.887638, 128.672272]
        ],
        "36": [
            ["RKTY", 8988, 150, 269.23, 36.631882, 128.370422]
        ],
        "71": [
            ["UEST", 9790, 194, 186.73, 71.708336, 128.904999]
        ],
        "-3": [
            ["WAPP", 8222, 148, 224.9, -3.70227, 128.097595]
        ],
        "-16": [
            ["YARG", 7564, 98, 201.39, -16.625423, 128.454498]
        ],
        "-15": [
            ["YPKU", 6005, 98, 299.79, -15.782012, 128.716537]
        ]
    },
    "136": {
        "34": [
            ["RJGG", 11897, 197, 348.82, 34.842407, 136.809265]
        ],
        "35": [
            ["RJNA", 8998, 150, 332.49, 35.244545, 136.931351],
            ["RJNG", 8858, 150, 274, 35.393597, 136.884308]
        ],
        "36": [
            ["RJNK", 8857, 150, 235.05, 36.400719, 136.419937]
        ],
        "37": [
            ["RJNW", 6556, 148, 246.71, 37.29681, 136.972519]
        ],
        "-1": [
            ["WABB", 11729, 150, 289.23, -1.195331, 136.123032]
        ],
        "-4": [
            ["WABP", 7843, 148, 300.24, -4.534154, 136.896133]
        ],
        "-13": [
            ["YGTE", 6243, 98, 279.18, -13.973761, 136.4673]
        ],
        "-12": [
            ["YPGV", 7256, 148, 310.06, -12.27565, 136.825363]
        ],
        "-31": [
            ["YPWR", 7802, 148, 365.8, -31.156399, 136.81134]
        ]
    },
    "133": {
        "34": [
            ["RJOB", 9839, 150, 239.15, 34.763851, 133.869537]
        ],
        "35": [
            ["RJOH", 6562, 148, 244.99, 35.496075, 133.246933]
        ],
        "33": [
            ["RJOK", 8204, 148, 310.59, 33.5387, 133.679657]
        ],
        "-3": [
            ["WASK", 5249, 98, 190.5, -3.637428, 133.696869]
        ],
        "-23": [
            ["YBAS", 8003, 148, 300.37, -23.812115, 133.914017]
        ],
        "-32": [
            ["YCDU", 5708, 98, 290.87, -32.133404, 133.715271]
        ]
    },
    "139": {
        "37": [
            ["RJSN", 8192, 150, 272.69, 37.955784, 139.124069]
        ],
        "38": [
            ["RJSY", 6553, 150, 259.42, 38.814011, 139.798523]
        ],
        "35": [
            ["RJTA", 8013, 150, 178.52, 35.462471, 139.449112],
            ["RJTJ", 6565, 148, 340.23, 35.833801, 139.414581],
            ["RJTK", 6008, 150, 190.15, 35.406441, 139.911621],
            ["RJTT", 9851, 200, 149.95, 35.559982, 139.769058],
            ["RJTT", 8208, 200, 214.97, 35.567463, 139.77713],
            ["RJTT", 9851, 200, 329.95, 35.536591, 139.78569],
            ["RJTT", 9851, 200, 329.96, 35.542503, 139.803162],
            ["RJTY", 11007, 200, 351.18, 35.733322, 139.351334]
        ],
        "33": [
            ["RJTH", 6558, 148, 249.49, 33.118248, 139.795944]
        ],
        "34": [
            ["RJTO", 6009, 150, 199.76, 34.789673, 139.363678]
        ],
        "36": [
            ["RJTU", 5594, 150, 184.01, 36.523495, 139.871887]
        ],
        "-20": [
            ["YBMA", 8429, 148, 347.78, -20.677622, 139.491119]
        ],
        "-21": [
            ["YTMO", 6248, 98, 325.94, -21.816286, 139.926758]
        ]
    },
    "127": {
        "37": [
            ["RKGA", 5230, 0, 280, 37.198746, 127.48053],
            ["RKNW", 9007, 150, 206.26, 37.449097, 127.9673],
            ["RKSM", 9055, 150, 179.08, 37.458744, 127.115829],
            ["RKSM", 9666, 150, 188.05, 37.458752, 127.115334],
            ["RKSO", 8989, 150, 264.1, 37.088284, 127.046051],
            ["RKSW", 9000, 150, 322, 37.230263, 127.016212],
            ["RKSW", 9000, 150, 322.4, 37.231281, 127.017303],
            ["RKTI", 9359, 120, -5.02, 37.017822, 127.881546],
            ["RKTI", 9033, 200, -4.95, 37.01812, 127.883446]
        ],
        "34": [
            ["RKJY", 6899, 148, 338.08, 34.833477, 127.62159]
        ],
        "36": [
            ["RKSG", 6167, 150, 310.83, 36.953278, 127.040329],
            ["RKTU", 8992, 150, 232.05, 36.723499, 127.512405],
            ["RKTU", 8998, 200, 232.35, 36.725109, 127.511147]
        ],
        "26": [
            ["ROAH", 9872, 150, -2.42, 26.182283, 127.646507],
            ["RODN", 12108, 200, 230.82, 26.36516, 127.783676],
            ["RODN", 12109, 300, 230.83, 26.367346, 127.780136],
            ["ROTM", 9007, 150, 235.64, 26.283056, 127.767235]
        ],
        "50": [
            ["UHBB", 9319, 148, 347.99, 50.413326, 127.416672]
        ]
    },
    "126": {
        "35": [
            ["RKJJ", 9313, 150, 209.85, 35.136909, 126.817604],
            ["RKJK", 9022, 150, 349.08, 35.891594, 126.61879]
        ],
        "34": [
            ["RKJM", 5250, 98, 230.28, 34.763374, 126.386879]
        ],
        "33": [
            ["RKPC", 9840, 148, 238.39, 33.514454, 126.496849],
            ["RKPC", 6259, 148, 305.89, 33.50568, 126.50367],
            ["RKPD", 7596, 149, 179.36, 33.40361, 126.711388]
        ],
        "37": [
            ["RKSI", 12308, 197, 144.73, 37.481785, 126.436317],
            ["RKSI", 12308, 197, 324.73, 37.45422, 126.460884],
            ["RKSI", 12308, 197, 324.74, 37.456371, 126.464691],
            ["RKSS", 10493, 197, 315.09, 37.548, 126.801056],
            ["RKSS", 11820, 148, 315.09, 37.547749, 126.807129],
            ["RKSW", 9000, 151, 142, 37.249718, 126.997124]
        ],
        "36": [
            ["RKTP", 7641, 150, 203.86, 36.7136, 126.485008],
            ["RKTP", 7548, 150, 204.17, 36.713886, 126.483345]
        ],
        "26": [
            ["ROKJ", 6578, 148, 201.1, 26.371923, 126.71743]
        ],
        "6": [
            ["RPMQ", 5275, 105, 318.01, 6.952205, 126.218269]
        ],
        "-8": [
            ["WPEC", 8257, 182, 322.34, -8.497296, 126.40947]
        ],
        "45": [
            ["ZYHB", 10490, 148, 218.92, 45.627827, 126.262901]
        ]
    },
    "125": {
        "24": [
            ["ROMY", 6574, 150, 218.21, 24.7899, 125.301277],
            ["RORS", 9873, 200, 346.04, 24.813757, 125.148544]
        ],
        "6": [
            ["RPMB", 5577, 98, 191, 6.116188, 125.234566],
            ["RPMR", 10640, 148, 353.07, 6.043632, 125.097969]
        ],
        "7": [
            ["RPMD", 9862, 148, 229.14, 7.134369, 125.65609]
        ],
        "8": [
            ["RPME", 6450, 150, 296, 8.954702, 125.499718]
        ],
        "9": [
            ["RPMS", 5039, 98, 358, 9.401271, 125.473404]
        ],
        "11": [
            ["RPVA", 7046, 148, 3.76, 11.220482, 125.025948],
            ["RPVG", 7001, 148, 246, 11.041959, 125.75032]
        ],
        "-8": [
            ["WPDL", 6228, 98, 256.71, -8.544749, 125.531952]
        ],
        "39": [
            ["ZKPY", 13166, 197, 180.68, 39.26305, 125.676109]
        ],
        "43": [
            ["ZYCC", 8535, 148, 233.61, 43.911945, 125.211411]
        ]
    },
    "123": {
        "13": [
            ["RPLP", 7480, 118, 237, 13.16456, 123.731682]
        ],
        "8": [
            ["RPMG", 6273, 98, 196, 8.595342, 123.353172]
        ],
        "7": [
            ["RPMP", 5512, 98, 197, 7.835994, 123.47863]
        ],
        "9": [
            ["RPVD", 6053, 118, 273, 9.335873, 123.306984],
            ["RPVT", 5837, 98, 353, 9.656237, 123.854622]
        ],
        "10": [
            ["RPVM", 10886, 148, 224.7, 10.318173, 123.990112]
        ],
        "-10": [
            ["WATT", 8207, 148, 256.387, -10.168991, 123.682312]
        ],
        "-17": [
            ["YCIN", 10011, 148, 290.45, -17.585218, 123.842087],
            ["YDBY", 5697, 98, 290.5, -17.374306, 123.66877]
        ],
        "41": [
            ["ZYTX", 10492, 148, 227.94, 41.647694, 123.498466]
        ]
    },
    "124": {
        "7": [
            ["RPMC", 6234, 98, 283, 7.15933, 124.217567]
        ],
        "8": [
            ["RPML", 7844, 118, 192.86, 8.426481, 124.613716]
        ],
        "13": [
            ["RPUV", 5118, 98, 239, 13.579387, 124.221214]
        ],
        "12": [
            ["RPVC", 5003, 98, 346, 12.073449, 124.549171]
        ],
        "56": [
            ["UELL", 11762, 148, 248.8, 56.918327, 124.938385]
        ],
        "1": [
            ["WAMM", 8734, 148, 361.23, 1.537355, 124.926186]
        ]
    },
    "122": {
        "6": [
            ["RPMZ", 8560, 144, 273.85, 6.921628, 122.071434]
        ],
        "10": [
            ["RPVB", 6047, 0, 220.3, 10.648789, 122.935081],
            ["RPVI", 6912, 118, 206.97, 10.724233, 122.548523]
        ],
        "11": [
            ["RPVK", 6631, 148, 231, 11.687056, 122.384865],
            ["RPVR", 6201, 148, 325, 11.591887, 122.757896]
        ],
        "0": [
            ["WAMG", 5410, 100, 277.27, 0.636033, 122.858597]
        ],
        "-8": [
            ["WATC", 6070, 98, 229, -8.635249, 122.240913]
        ],
        "-4": [
            ["WAWW", 6890, 98, 259.73, -4.080217, 122.427277]
        ],
        "-17": [
            ["YBRM", 8064, 148, 285.6, -17.951664, 122.238335]
        ],
        "-28": [
            ["YLTN", 5902, 98, 249.63, -28.611105, 122.438362]
        ],
        "-21": [
            ["YTEF", 6566, 98, 301.6, -21.721258, 122.237137]
        ]
    },
    "-55": {
        "-27": [
            ["SA23", 5830, 98, 225.9, -27.899704, -55.7621],
            ["SARP", 7410, 98, 179.16, -27.375582, -55.97068]
        ],
        "-4": [
            ["SBIH", 5284, 98, 213.87, -4.236191, -55.99678]
        ],
        "-22": [
            ["SBPP", 6583, 148, 200.05, -22.541149, -55.699265],
            ["SGPJ", 5927, 98, 194.34, -22.634098, -55.827339],
            ["SSFI", 6694, 98, 223.8, -22.18152, -55.570938]
        ],
        "2": [
            ["SBTS", 5234, 98, 260.98, 2.225554, -55.938599]
        ],
        "5": [
            ["SMJP", 11409, 148, 269.49, 5.452807, -55.172119]
        ],
        "-1": [
            ["SNOX", 5249, 98, 335, -1.773455, -55.864178]
        ],
        "-34": [
            ["SULS", 5248, 125, 177.69, -34.850208, -55.094322],
            ["SULS", 6987, 148, 252.37, -34.854065, -55.089897]
        ],
        "-30": [
            ["SURV", 5981, 0, 221.81, -30.968454, -55.469749]
        ],
        "-16": [
            ["SWCE", 5070, 66, 204.6, -16.197924, -55.395687]
        ],
        "-11": [
            ["SWSI", 5249, 98, 195, -11.866649, -55.571987]
        ]
    },
    "-62": {
        "-38": [
            ["SA27", 5175, 0, 316.91, -38.902264, -62.00407],
            ["SAZB", 6660, 108, 240.66, -38.718781, -62.16066],
            ["SAZB", 5016, 98, 341.61, -38.73304, -62.17944],
            ["SAZB", 8127, 197, 343.74, -38.738041, -62.149372]
        ],
        "-40": [
            ["SAVV", 8366, 148, 282, -40.871262, -62.982933]
        ],
        "6": [
            ["SVCN", 6890, 0, 349, 6.190756, -62.848034]
        ],
        "10": [
            ["SVGI", 6562, 131, 219, 10.586991, -62.312572]
        ],
        "8": [
            ["SVPR", 6731, 148, 238.9, 8.306536, -62.733257]
        ],
        "9": [
            ["SVTC", 5577, 131, 239, 9.103975, -62.043205]
        ],
        "17": [
            ["TKPK", 7607, 148, 236.15, 17.316999, -62.709644]
        ]
    },
    "-59": {
        "-26": [
            ["SA41", 6890, 0, -3.493, -26.325588, -59.338882]
        ],
        "-27": [
            ["SARE", 9100, 148, 200.8, -27.438263, -59.051075]
        ],
        "-29": [
            ["SATG", 8475, 148, 221.71, -29.096884, -59.207413],
            ["SATR", 9175, 0, 270.17, -29.216864, -59.684952]
        ],
        "-37": [
            ["SAZT", 8377, 157, 185.08, -37.222923, -59.227299]
        ],
        "-3": [
            ["SBMN", 7109, 148, 255.99, -3.143678, -59.976982]
        ],
        "3": [
            ["SYLT", 6201, 98, 231, 3.374237, -59.78949]
        ],
        "13": [
            ["TBPB", 11027, 150, 255.88, 13.078321, -59.477066]
        ]
    },
    "-49": {
        "-8": [
            ["SBAA", 5866, 98, 238.81, -8.34415, -49.294434]
        ],
        "-6": [
            ["SBCJ", 6606, 148, 262.96, -6.116658, -49.994427]
        ],
        "-25": [
            ["SBCT", 5862, 148, 271.98, -25.528873, -49.162209],
            ["SBCT", 7339, 148, 314.18, -25.536097, -49.166931]
        ],
        "-20": [
            ["SBFT", 5658, 0, 218.31, -20.269424, -49.182213],
            ["SBSR", 5386, 115, 231.88, -20.811533, -49.398502]
        ],
        "-16": [
            ["SBGO", 7232, 148, 302.15, -16.636654, -49.214149]
        ],
        "-18": [
            ["SBIT", 5748, 98, -17.094, -18.452185, -49.210918]
        ],
        "-21": [
            ["SBLN", 5582, 105, 307.11, -21.667383, -49.724541]
        ],
        "-5": [
            ["SBMA", 6603, 148, 229.89, -5.362761, -49.131096]
        ],
        "-3": [
            ["SBTU", 6494, 148, 183.57, -3.776379, -49.719166]
        ],
        "-11": [
            ["SWGI", 5577, 98, 281, -11.745061, -49.117889]
        ]
    },
    "-43": {
        "-22": [
            ["SBAF", 6509, 171, 241.16, -22.870544, -43.376095],
            ["SBGL", 13204, 148, 254.43, -22.79221, -43.217464],
            ["SBGL", 10380, 154, 305.609, -22.829088, -43.238491],
            ["SBSC", 9019, 148, 201.26, -22.921093, -43.714436]
        ],
        "-19": [
            ["SBBH", 8332, 148, 290.86, -19.854927, -43.938564],
            ["SBCF", 9780, 148, 319.11, -19.643875, -43.959427],
            ["SBLS", 6022, 98, 284.61, -19.663876, -43.888874]
        ],
        "-21": [
            ["SBBQ", 5727, 98, -17.28, -21.27499, -43.758331],
            ["SBJF", 5046, 98, 185.47, -21.784544, -43.385357]
        ],
        "-16": [
            ["SBMK", 6946, 148, 276.7, -16.708048, -43.809147]
        ],
        "-6": [
            ["SNQG", 5905, 148, 319, -6.852213, -43.072704]
        ]
    },
    "-48": {
        "-16": [
            ["SBAN", 10827, 0, 220, -16.227219, -48.96228],
            ["SWNS", 6043, 148, 233.7, -16.357416, -48.92009]
        ],
        "-21": [
            ["SBAQ", 5941, 99, 328.46, -21.818876, -48.128605],
            ["SBGP", 16295, 148, 179.3, -21.751324, -48.405373],
            ["SDTY", 5250, 98, 281.805, -21.341228, -48.107353]
        ],
        "-1": [
            ["SBBE", 6027, 108, 184.83, -1.374065, -48.475746],
            ["SBBE", 9202, 148, 225.31, -1.370268, -48.467064]
        ],
        "-20": [
            ["SBBT", 5907, 98, 244.7, -20.583496, -48.585186],
            ["SDKO", 5045, 0, 335.905, -20.264013, -48.785553],
            ["Z06H", 5774, 0, 182.5, -20.116518, -48.699352]
        ],
        "-27": [
            ["SBFL", 7527, 148, 300.75, -27.676407, -48.531109]
        ],
        "-26": [
            ["SBJV", 5384, 148, 309.11, -26.228615, -48.790512],
            ["SBNF", 5579, 148, 235.63, -26.875128, -48.643879]
        ],
        "-10": [
            ["SBPJ", 8208, 148, 303.72, -10.29782, -48.347481],
            ["SBPN", 5569, 98, 213.88, -10.710082, -48.395924],
            ["SWFQ", 6410, 98, 192, -10.383376, -48.677391]
        ],
        "-18": [
            ["SBUL", 6417, 148, 204.19, -18.874294, -48.22094]
        ],
        "-23": [
            ["SDZM", 5090, 75, 291.805, -23.92498, -48.811188]
        ],
        "-7": [
            ["SWGN", 5912, 148, 250, -7.225266, -48.232597]
        ],
        "-17": [
            ["SWKN", 6890, 0, 211, -17.717159, -48.605446]
        ]
    },
    "-37": {
        "-10": [
            ["SBAR", 7276, 148, 272.39, -10.984433, -37.060261]
        ],
        "-5": [
            ["SBMS", 6619, 98, 200.11, -5.192817, -37.359558]
        ],
        "-7": [
            ["SNTS", 5249, 98, 278, -7.038769, -37.250317]
        ]
    },
    "-46": {
        "-19": [
            ["SBAX", 6243, 98, 311.12, -19.566442, -46.958988]
        ],
        "-20": [
            ["SBFU", 5246, 98, 313.81, -20.707783, -46.329712]
        ],
        "-23": [
            ["SBGR", 9819, 148, 253.21, -23.431095, -46.458862],
            ["SBGR", 12151, 148, 253.34, -23.424828, -46.44857],
            ["SBMT", 5197, 82, 280.1, -23.510292, -46.62978],
            ["SBSP", 6372, 148, 327.75, -23.634916, -46.650772],
            ["SDJD", 5905, 0, 331, -23.188738, -46.939339]
        ],
        "-18": [
            ["SNPD", 5577, 98, 240, -18.668385, -46.484398]
        ],
        "-17": [
            ["SNSR", 5950, 98, 190.8, -17.539875, -46.977077]
        ]
    },
    "-47": {
        "-15": [
            ["SBBR", 10494, 0, 266.18, -15.861654, -47.89772],
            ["SBBR", 8668, 148, 266, -15.878323, -47.908379]
        ],
        "-7": [
            ["SBCI", 5906, 148, 264.98, -7.321472, -47.454906]
        ],
        "-5": [
            ["SBIZ", 6004, 148, 233.82, -5.526372, -47.45332]
        ],
        "-23": [
            ["SBKP", 10604, 148, 307.75, -23.016401, -47.121979]
        ],
        "-21": [
            ["SBRP", 5924, 148, -16.65, -21.142376, -47.771496],
            ["SBYS", 6988, 148, 0, -21.99415, -47.34111],
            ["SBYS", 6988, 148, 179.23, -21.974983, -47.342777],
            ["SBYS", 6988, 148, 180, -21.974981, -47.34111]
        ],
        "-19": [
            ["SBUR", 5778, 148, 329.19, -19.771927, -47.960548]
        ],
        "-20": [
            ["SIMK", 6576, 98, 214.2, -20.582054, -47.37645]
        ],
        "-2": [
            ["SNBV", 5075, 89, 253, -2.521259, -47.510738]
        ]
    },
    "-53": {
        "-25": [
            ["SBCA", 5305, 98, 315.1, -25.007359, -53.496273]
        ],
        "-29": [
            ["SBSM", 8820, 148, 272.63, -29.710817, -53.676365]
        ],
        "-24": [
            ["SBTD", 5296, 98, 180, -24.679071, -53.69725]
        ]
    },
    "-42": {
        "-22": [
            ["SBCB", 5558, 148, 258.97, -22.923794, -42.071011],
            ["SBES", 5853, 92, 223.39, -22.808596, -42.088326]
        ],
        "-19": [
            ["SBIP", 6593, 148, 210.32, -19.462843, -42.482658]
        ],
        "-5": [
            ["SBTE", 7267, 148, 174.25, -5.049988, -42.824669],
            ["SNDR", 5620, 0, 175.2, -5.072092, -42.87431]
        ],
        "-14": [
            ["SNGI", 5577, 98, 298, -14.210521, -42.744144]
        ]
    },
    "-51": {
        "-29": [
            ["SBCO", 9052, 148, 289.61, -29.949989, -51.13081],
            ["SBCX", 5485, 98, 315.91, -29.203459, -51.18071],
            ["SBPA", 7479, 138, 271.32, -29.994904, -51.15934]
        ],
        "-22": [
            ["SBDN", 6918, 115, 277.57, -22.176924, -51.415058],
            ["SSPK", 7012, 98, 326.91, -22.774019, -51.362915]
        ],
        "-23": [
            ["SBLO", 6894, 148, 290.06, -23.33695, -51.120201]
        ],
        "0": [
            ["SBMQ", 6882, 148, 237.31, 0.05575, -51.064129]
        ],
        "-20": [
            ["SBUP", 5509, 0, 273.16, -20.777761, -51.556099]
        ],
        "-6": [
            ["SNFX", 5250, 108, 292, -6.64296, -51.983276]
        ]
    },
    "-41": {
        "-21": [
            ["SBCP", 5037, 148, 226.87, -21.693594, -41.296379]
        ],
        "-2": [
            ["SBPB", 6890, 148, 252, -2.890955, -41.723499]
        ],
        "-14": [
            ["SNBU", 5709, 98, 280.806, -14.256836, -41.809525]
        ],
        "-12": [
            ["SNDM", 6824, 0, 297.7, -12.484339, -41.272625]
        ],
        "-15": [
            ["SNTV", 5240, 82, 295.705, -15.658442, -41.647381]
        ],
        "-13": [
            ["SNYT", 5605, 98, 188.7, -13.820723, -41.301056]
        ]
    },
    "-39": {
        "-17": [
            ["SBCV", 5014, 164, 213.99, -17.644972, -39.250046]
        ],
        "-14": [
            ["SBIL", 5202, 148, 267.77, -14.815539, -39.025822]
        ],
        "-7": [
            ["SBJU", 5894, 148, 290.1, -7.221657, -39.262486]
        ],
        "-16": [
            ["SBPS", 6558, 148, 254.33, -16.4361, -39.07193]
        ]
    },
    "-32": {
        "-3": [
            ["SBFN", 6086, 148, 273.82, -3.854986, -32.414433]
        ]
    },
    "-38": {
        "-3": [
            ["SBFZ", 8275, 148, 284.89, -3.77915, -38.521648]
        ],
        "-12": [
            ["SBSV", 9869, 148, 258.22, -12.905847, -38.308945],
            ["SBSV", 5021, 148, 323.79, -12.918324, -38.334991],
            ["SDUO", 5180, 98, 177.1, -12.167945, -38.38055]
        ],
        "-15": [
            ["SBTC", 6261, 98, 177.01, -15.344745, -38.997688]
        ],
        "-9": [
            ["SBUF", 5911, 148, 296.11, -9.405095, -38.245789]
        ],
        "-13": [
            ["SNVB", 5906, 98, 197, -13.288633, -38.990067]
        ]
    },
    "-34": {
        "-7": [
            ["SBJP", 8282, 148, 315.18, -7.156658, -34.942486],
            ["SIPE", 5905, 98, 230.4, -7.652048, -34.850647]
        ],
        "-8": [
            ["SBRF", 9824, 148, -18.48, -8.141102, -34.918602]
        ]
    },
    "-35": {
        "-7": [
            ["SBKG", 5258, 138, 305.14, -7.273304, -35.889057]
        ],
        "-9": [
            ["SBMO", 7224, 148, 280.5, -9.512205, -35.783596]
        ],
        "-5": [
            ["SBNT", 6023, 148, 278.7, -5.911649, -35.239429],
            ["SBNT", 5828, 148, 321.44, -5.919989, -35.246101],
            ["SBNT", 8545, 148, 320.38, -5.919985, -35.236652],
            ["SNXX", 7218, 98, 318.607, -5.391553, -35.521809]
        ]
    },
    "-40": {
        "-9": [
            ["SBPL", 9857, 148, 289.19, -9.367233, -40.554893]
        ],
        "-14": [
            ["SBQV", 5839, 98, 306.13, -14.868042, -40.856087]
        ],
        "-20": [
            ["SBVT", 5736, 148, 212.07, -20.250822, -40.282215]
        ],
        "-19": [
            ["SIFV", 5249, 98, 227.5, -19.82151, -40.095192]
        ]
    },
    "-44": {
        "-2": [
            ["SBSL", 7784, 148, 218.68, -2.580261, -44.229988],
            ["SNCW", 8530, 98, 252.6, -2.369476, -44.385242]
        ],
        "-20": [
            ["SNAM", 5315, 0, 339, -20.918182, -44.891647],
            ["SNDV", 5052, 98, 319, -20.187159, -44.865154]
        ],
        "-4": [
            ["SNBI", 5249, 98, 260, -4.22818, -44.875111],
            ["SNXH", 5920, 95, 251.4, -4.510687, -44.012451]
        ],
        "-15": [
            ["SNPH", 5905, 65, 317.106, -15.401834, -44.13945],
            ["SNZK", 5118, 79, 278.605, -15.025352, -44.031857]
        ]
    },
    "-36": {
        "-8": [
            ["SNGN", 5315, 92, 317, -8.83976, -36.466358],
            ["SNRU", 5906, 98, 288, -8.286931, -36.003048]
        ]
    },
    "-61": {
        "5": [
            ["SVPP", 6080, 98, 254.5, 5.793237, -61.432659]
        ],
        "7": [
            ["SVTM", 9843, 125, 247, 7.255315, -61.42065]
        ],
        "-10": [
            ["SWJI", 5905, 0, 189, -10.862539, -61.845379]
        ],
        "17": [
            ["TAPA", 8992, 148, 238.34, 17.1432, -61.78159]
        ],
        "16": [
            ["TFFR", 11499, 148, 280.9, 16.262327, -61.515778]
        ],
        "12": [
            ["TGPY", 8990, 148, 270.39, 12.003995, -61.773479]
        ],
        "10": [
            ["TTPP", 10495, 150, 269.84, 10.595407, -61.322628]
        ]
    },
    "-143": {
        "63": [
            ["TSG", 5100, 150, 270, 63.375458, -143.305542]
        ]
    },
    "77": {
        "43": [
            ["UAAA", 14438, 147, 235.86, 43.363052, 77.063095]
        ],
        "52": [
            ["UASP", 8144, 148, 222.81, 52.203049, 77.086411]
        ],
        "62": [
            ["USNR", 8625, 0, 369.49, 62.146667, 77.32666]
        ],
        "23": [
            ["VABP", 6020, 148, 235.2, 23.292654, 77.350754],
            ["VABP", 6661, 148, 298.71, 23.283024, 77.341736]
        ],
        "28": [
            ["VI39", 9000, 0, 270.4, 28.707617, 77.372986],
            ["VIDP", 9278, 150, 271.52, 28.56988, 77.116898],
            ["VIDP", 12506, 150, 284.49, 28.558662, 77.122505]
        ],
        "34": [
            ["VI57", 10925, 145, 287.011, 34.653664, 77.398811],
            ["VILH", 9434, 150, 250.5, 34.140041, 77.560448]
        ],
        "27": [
            ["VIAG", 9000, 148, 230, 27.163761, 77.971458],
            ["VIAG", 6135, 148, 300, 27.151619, 77.969017]
        ],
        "29": [
            ["VISP", 9000, 150, 269.5, 29.99399, 77.442032]
        ],
        "11": [
            ["VO45", 8267, 0, 229, 11.018785, 77.166557],
            ["VOCB", 7541, 150, 226.24, 11.038773, 77.051743]
        ],
        "12": [
            ["VOBG", 10912, 200, 264.67, 12.951663, 77.684357]
        ],
        "17": [
            ["VOBR", 6955, 148, 198, 17.915047, 77.488274],
            ["VOBR", 6798, 150, 259, 17.908241, 77.488075]
        ],
        "14": [
            ["VOPN", 7339, 145, 271, 14.146482, 77.80204]
        ],
        "13": [
            ["VOYK", 6721, 145, 268, 13.135314, 77.614464]
        ]
    },
    "76": {
        "42": [
            ["UAFL", 6533, 148, 253.8, 42.589993, 76.725021]
        ],
        "60": [
            ["USNN", 10617, 197, 221.92, 60.959995, 76.503365]
        ],
        "30": [
            ["VI18", 7952, 0, 302.008, 30.358883, 76.829292],
            ["VI18", 9224, 0, 302.009, 30.364914, 76.827194],
            ["VICG", 9001, 168, 290, 30.669277, 76.801987]
        ],
        "34": [
            ["VI65", 6004, 106, 202, 34.531902, 76.159653]
        ],
        "18": [
            ["VO55", 5275, 95, 231, 18.418066, 76.470993]
        ],
        "9": [
            ["VOCC", 6000, 145, 347, 9.942134, 76.271675]
        ],
        "10": [
            ["VOCI", 11153, 148, 268.01, 10.151223, 76.408813]
        ],
        "8": [
            ["VOTV", 11171, 150, 316.15, 8.470929, 76.930496]
        ],
        "39": [
            ["ZWSH", 10484, 135, 264.98, 39.544586, 76.040245]
        ]
    },
    "82": {
        "50": [
            ["UASK", 8202, 138, 310.64, 50.028774, 82.5075]
        ],
        "55": [
            ["UNNT", 11661, 197, 261.01, 55.013329, 82.678383]
        ],
        "22": [
            ["VABI", 5945, 0, 240, 22.004766, 82.072418]
        ],
        "19": [
            ["VE46", 5665, 0, 242.5, 19.077082, 82.041573]
        ],
        "25": [
            ["VIBN", 7245, 150, 273.3, 25.451689, 82.870316]
        ]
    },
    "80": {
        "50": [
            ["UASS", 10138, 145, 263.7, 50.352825, 80.25602]
        ],
        "23": [
            ["VAJB", 6514, 150, 238.41, 23.182491, 80.060127]
        ],
        "8": [
            ["VC12", 7500, 0, 247.8, 8.053688, 80.990997],
            ["VC13", 5060, 0, 220.8, 8.746648, 80.501953],
            ["VCCA", 5177, 150, 228, 8.304746, 80.431999]
        ],
        "7": [
            ["VC15", 5925, 0, 219.7, 7.962912, 80.733742]
        ],
        "9": [
            ["VCCJ", 7533, 98, 227, 9.798988, 80.068779]
        ],
        "26": [
            ["VIBL", 9200, 150, 272.1, 26.987967, 80.907219],
            ["VICX", 9000, 150, 270, 26.403332, 80.425446],
            ["VILK", 8994, 148, 269.45, 26.760742, 80.902847]
        ],
        "24": [
            ["VIST", 5752, 95, 290, 24.559799, 80.862595]
        ],
        "16": [
            ["VOBZ", 5724, 150, 258.24, 16.532347, 80.804916]
        ],
        "12": [
            ["VOMM", 12008, 148, 249.25, 12.996051, 80.184364],
            ["VOMM", 6672, 148, 297.92, 12.993599, 80.18206],
            ["VOTX", 5900, 150, 298, 12.901195, 80.127335]
        ]
    },
    "112": {
        "66": [
            ["UERP", 10152, 138, 343.27, 66.403328, 112.06002]
        ],
        "16": [
            ["VH84", 7874, 0, 225, 16.841162, 112.352913]
        ],
        "-7": [
            ["WARA", 6464, 0, 352, -7.93551, 112.71389],
            ["WARR", 9844, 148, 279.3, -7.381998, 112.800293]
        ],
        "37": [
            ["ZBYN", 10494, 148, 307.07, 37.739655, 112.644524]
        ]
    },
    "114": {
        "62": [
            ["UERR", 9005, 148, 237.33, 62.540001, 114.056702]
        ],
        "22": [
            ["VHSK", 6175, 110, 290.906, 22.433554, 114.088921]
        ],
        "-3": [
            ["WAOO", 8206, 148, 280.45, -3.44438, 114.773727]
        ],
        "4": [
            ["WBSB", 12044, 150, 211.87, 4.958222, 114.937103]
        ],
        "-28": [
            ["YGEL", 6515, 148, 198.33, -28.787514, 114.709793]
        ],
        "-22": [
            ["YPLM", 10134, 148, 3.84, -22.247429, 114.089149]
        ],
        "38": [
            ["ZBSJ", 11160, 148, 327.06, 38.265484, 114.708939]
        ],
        "30": [
            ["ZHHH", 11165, 148, 220.91, 30.79657, 114.221672]
        ],
        "48": [
            ["ZMCD", 8504, 131, 292.31, 48.131092, 114.662788]
        ]
    },
    "113": {
        "52": [
            ["UIAA", 9171, 184, 281.46, 52.023327, 113.325035]
        ],
        "22": [
            ["VHHH", 12465, 197, 250.83, 22.307436, 113.932884],
            ["VHHH", 12468, 197, 250.83, 22.321701, 113.931244],
            ["VMMC", 11048, 148, 341.14, 22.135033, 113.596695],
            ["ZGSZ", 11225, 148, 332.15, 22.624716, 113.819458]
        ],
        "-2": [
            ["WAOP", 6748, 98, 339.07, -2.233928, 113.946014]
        ],
        "3": [
            ["WBGB", 9049, 147, 347.64, 3.111851, 113.019501]
        ],
        "4": [
            ["WBGR", 9059, 197, 205.11, 4.333643, 113.989487]
        ],
        "-24": [
            ["YCAR", 5517, 98, 223.22, -24.875645, 113.675354]
        ],
        "-25": [
            ["YSHK", 5545, 98, 358.706, -25.903055, 113.577423]
        ],
        "23": [
            ["ZGGG", 12504, 197, 193.95, 23.406591, 113.311157],
            ["ZGGG", 11848, 148, 193.95, 23.406349, 113.288864]
        ],
        "28": [
            ["ZGHA", 8553, 148, 357, 28.174997, 113.222359]
        ],
        "34": [
            ["ZHCC", 11146, 197, 292.06, 34.512589, 113.858864]
        ]
    },
    "101": {
        "56": [
            ["UIBB", 10353, 197, 294.26, 56.365002, 101.72171]
        ],
        "12": [
            ["VTBU", 11551, 197, 3.98, 12.663777, 101.003601]
        ],
        "16": [
            ["VTPB", 6924, 148, 0.05, 16.666529, 101.195099]
        ],
        "6": [
            ["VTSC", 6562, 148, 202, 6.528361, 101.746628]
        ],
        "17": [
            ["VTUL", 6929, 148, 196.78, 17.448227, 101.724945]
        ],
        "0": [
            ["WIBB", 7095, 98, 1.66, 0.451614, 101.444206]
        ],
        "1": [
            ["WIBD", 5905, 98, 210, 1.616202, 101.437607]
        ],
        "4": [
            ["WMKI", 5916, 121, 221.28, 4.574166, 101.097565]
        ],
        "2": [
            ["WMKK", 13353, 197, 326.14, 2.713286, 101.718086],
            ["WMKK", 13575, 197, 326.15, 2.747558, 101.722595]
        ],
        "3": [
            ["WMSA", 12445, 148, 329.13, 3.116622, 101.558022]
        ]
    },
    "104": {
        "52": [
            ["UIII", 10623, 148, 293.05, 52.261578, 104.413704]
        ],
        "12": [
            ["VDKH", 7874, 150, 2.908, 12.24445, 104.563316]
        ],
        "11": [
            ["VDPP", 9859, 144, 225.7, 11.553308, 104.857216]
        ],
        "16": [
            ["VLSK", 5358, 125, 220, 16.561472, 104.77005]
        ],
        "17": [
            ["VTUI", 8560, 148, 224.88, 17.203453, 104.127304],
            ["VTUW", 8238, 148, 324.94, 17.374538, 104.649818]
        ],
        "15": [
            ["VTUU", 9867, 148, 231.35, 15.259721, 104.881187]
        ],
        "1": [
            ["WIDD", 13247, 148, 221.39, 1.134636, 104.130966],
            ["WSAC", 9015, 0, 203, 1.355512, 104.01387]
        ],
        "-4": [
            ["WIPO", 6890, 125, 209.2, -4.38112, 104.407379]
        ],
        "-2": [
            ["WIPP", 8210, 148, 292.86, -2.902614, 104.710289]
        ],
        "43": [
            ["ZMBR", 7728, 0, 251, 43.765774, 104.15361]
        ]
    },
    "107": {
        "51": [
            ["UIUU", 10082, 150, 256.05, 51.811661, 107.463371]
        ],
        "16": [
            ["VVPB", 8858, 130, 268.7, 16.399664, 107.720535]
        ],
        "-6": [
            ["WI1B", 5420, 65, 294.505, -6.906927, 107.482666],
            ["WICC", 6491, 148, 289.09, -6.903993, 107.585976]
        ],
        "-2": [
            ["WIOD", 6036, 98, 26.32, -2.755242, 107.755287]
        ]
    },
    "91": {
        "53": [
            ["UNAA", 10648, 148, 205.99, 53.755016, 91.396011]
        ],
        "23": [
            ["VEAT", 6004, 148, 4.11, 23.881031, 91.240326]
        ],
        "25": [
            ["VEBI", 5368, 150, 219.04, 25.709972, 91.98716]
        ],
        "26": [
            ["VEGT", 8935, 150, 202.86, 26.11747, 91.590401]
        ],
        "21": [
            ["VGCB", 6798, 125, 349.36, 21.434408, 91.968948]
        ],
        "22": [
            ["VGEG", 9658, 150, 228.88, 22.260611, 91.826569]
        ],
        "24": [
            ["VGSY", 8493, 150, 293.04, 24.958109, 91.88002]
        ],
        "47": [
            ["ZMKD", 9344, 0, 337.38, 47.941914, 91.634583]
        ]
    },
    "83": {
        "53": [
            ["UNBB", 9276, 164, 243.35, 53.36842, 83.558655]
        ],
        "26": [
            ["VEGK", 9000, 150, 290, 26.735779, 83.462982]
        ],
        "17": [
            ["VEVZ", 5999, 150, 227.35, 17.726318, 83.230774]
        ]
    },
    "86": {
        "55": [
            ["UNEE", 10305, 197, 233.87, 55.278328, 86.128365]
        ],
        "23": [
            ["VEBK", 5300, 100, 310.805, 23.638739, 86.154892]
        ],
        "22": [
            ["VECK", 7283, 0, 349, 22.450912, 86.709892]
        ],
        "53": [
            ["Z25U", 8824, 0, 199.8, 53.822868, 86.885933],
            ["Z25U", 6576, 0, 199.7, 53.819004, 86.880203]
        ]
    },
    "92": {
        "56": [
            ["UNKL", 12193, 197, 293.5, 56.164993, 92.521713]
        ],
        "24": [
            ["VEKU", 5857, 148, 236, 24.915859, 92.98774]
        ],
        "23": [
            ["VELP", 8205, 148, 350.89, 23.829605, 92.621498]
        ],
        "26": [
            ["VETZ", 9000, 0, 225.9, 26.707567, 92.798264]
        ],
        "9": [
            ["VOCX", 7500, 140, 198, 9.16048, 92.818817]
        ],
        "11": [
            ["VOPB", 5788, 148, 216.86, 11.657917, 92.745674]
        ],
        "20": [
            ["VYSW", 5997, 151, 289.07, 20.126474, 92.875778]
        ]
    },
    "102": {
        "71": [
            ["UOHH", 8859, 158, 243.61, 71.974106, 102.526733]
        ],
        "19": [
            ["VLLB", 7218, 148, 240, 19.903555, 102.171616]
        ],
        "17": [
            ["VLVT", 9864, 148, 315.37, 17.978691, 102.57325],
            ["VTUD", 10016, 148, 297.13, 17.380169, 102.801056]
        ],
        "16": [
            ["VT85", 10359, 0, 187.7, 16.666611, 102.96962],
            ["VTUK", 10036, 148, 212.72, 16.479372, 102.792122]
        ],
        "12": [
            ["VTBO", 5899, 150, 229.8, 12.285121, 102.317131]
        ],
        "14": [
            ["VTUN", 9867, 148, 239.81, 14.923882, 102.093636],
            ["VTUQ", 6898, 148, 241.22, 14.954043, 102.32132]
        ],
        "-3": [
            ["WIPL", 5914, 98, 313.1, -3.868098, 102.343681]
        ],
        "5": [
            ["WMGK", 6522, 150, 261.97, 5.800447, 102.491508]
        ],
        "6": [
            ["WMKC", 6499, 150, 281.22, 6.163168, 102.302605]
        ],
        "25": [
            ["ZPPP", 11192, 148, 211.72, 25.014723, 102.760017]
        ],
        "27": [
            ["ZUXC", 11855, 164, -1.73, 27.968885, 102.180557]
        ]
    },
    "87": {
        "69": [
            ["UOOO", 11436, 145, 211.77, 69.323326, 87.356712]
        ],
        "22": [
            ["VE60", 9000, 0, 352.709, 22.327257, 87.216194]
        ],
        "23": [
            ["VEPH", 7203, 150, 328.82, 23.465759, 87.435776]
        ],
        "25": [
            ["VEPU", 9000, 150, 270, 25.759144, 87.41964]
        ],
        "43": [
            ["ZWWW", 11793, 148, 252.97, 43.909729, 87.498131]
        ]
    },
    "64": {
        "41": [
            ["UT76", 6098, 0, 362.406, 41.605564, 64.232773]
        ],
        "39": [
            ["UTSB", 9901, 147, 190.89, 39.78833, 64.483345]
        ]
    },
    "79": {
        "24": [
            ["VAKJ", 5970, 148, 192.74, 24.827776, 79.92128]
        ],
        "21": [
            ["VANP", 6356, 150, 264.07, 21.093111, 79.056046],
            ["VANP", 10349, 150, 323.46, 21.085999, 79.052376]
        ],
        "7": [
            ["VCBI", 11024, 148, 217.29, 7.19324, 79.893044]
        ],
        "6": [
            ["VCCC", 6031, 100, 212.19, 6.828499, 79.888451]
        ],
        "28": [
            ["VIBY", 9000, 148, 290, 28.419195, 79.460365]
        ],
        "13": [
            ["VOAR", 11040, 0, 241, 13.077625, 79.712189],
            ["VOTP", 7546, 148, 261.51, 13.634241, 79.554077]
        ],
        "16": [
            ["VONS", 5400, 100, 268.9, 16.541796, 79.325638]
        ],
        "10": [
            ["VOTJ", 6100, 150, 248, 10.72285, 79.109795]
        ],
        "17": [
            ["VOWA", 5453, 0, 274.5, 17.912956, 79.601318],
            ["VOWA", 5722, 0, 331.5, 17.908571, 79.604683]
        ],
        "37": [
            ["ZWTN", 9191, 164, 288.04, 37.029415, 79.881714]
        ]
    },
    "81": {
        "21": [
            ["VARP", 6443, 150, 238.78, 21.185038, 81.746841]
        ],
        "8": [
            ["VCCT", 7864, 85, 238, 8.545437, 81.19175]
        ],
        "25": [
            ["VIAL", 7600, 150, 299, 25.438093, 81.737679],
            ["Z13T", 6000, 0, 288.01, 25.54528, 81.889648]
        ],
        "26": [
            ["VIRB", 5800, 138, 270, 26.249361, 81.389809]
        ],
        "17": [
            ["VORY", 5750, 150, 228.37, 17.113558, 81.827271]
        ]
    },
    "103": {
        "13": [
            ["VDBG", 5269, 112, 249.76, 13.09618, 103.231407],
            ["VDSR", 8415, 148, 228.59, 13.417826, 103.820763]
        ],
        "19": [
            ["VLXK", 7873, 130, 240, 19.455397, 103.168251]
        ],
        "15": [
            ["VTUO", 6928, 148, 214.98, 15.237313, 103.258873]
        ],
        "16": [
            ["VTUV", 6932, 148, 2.46, 16.107258, 103.773369],
            ["Z28P", 6890, 0, -0.093, 16.27537, 103.768913]
        ],
        "10": [
            ["VVPQ", 6889, 95, 258.9, 10.22313, 103.982269]
        ],
        "-1": [
            ["WIPA", 6554, 98, 309.56, -1.643735, 103.65126]
        ],
        "3": [
            ["WMKD", 9245, 150, 2.99, 3.762213, 103.207253]
        ],
        "1": [
            ["WMKJ", 11119, 150, 339.73, 1.626864, 103.672745],
            ["WSAP", 12474, 200, 203.06, 1.376222, 103.916275],
            ["WSAT", 9043, 148, 3.99, 1.375212, 103.708549],
            ["WSSL", 5373, 151, 213.2, 1.423112, 103.871689],
            ["WSSS", 13152, 197, 202.88, 1.381653, 103.991257],
            ["WSSS", 13179, 197, 202.92, 1.362065, 103.999062]
        ],
        "5": [
            ["WMKN", 6615, 150, 226.33, 5.387881, 103.108505]
        ],
        "36": [
            ["ZLLL", 11828, 148, -1.99, 36.50045, 103.622368]
        ],
        "30": [
            ["ZUUU", 11833, 197, 202.11, 30.594995, 103.955566]
        ]
    },
    "95": {
        "27": [
            ["VE24", 6595, 148, 214.8, 27.559877, 95.576889],
            ["VE30", 9003, 0, 229.8, 27.470192, 95.128281],
            ["VEMN", 5986, 148, 225.35, 27.488005, 95.024895]
        ],
        "21": [
            ["VYMD", 14050, 200, 350.64, 21.682049, 95.980827]
        ],
        "20": [
            ["VYST", 8501, 150, 189, 20.96937, 95.917938]
        ],
        "5": [
            ["WITT", 8241, 148, 348.34, 5.511399, 95.422791]
        ]
    },
    "88": {
        "22": [
            ["VE31", 6116, 0, 196.8, 22.789028, 88.36187],
            ["VECC", 11818, 150, 185.41, 22.674341, 88.44976],
            ["VECC", 7859, 150, 185.06, 22.661663, 88.446365]
        ],
        "26": [
            ["VEBD", 9035, 150, 360, 26.6691, 88.328163]
        ],
        "24": [
            ["VGRJ", 6026, 100, 350.1, 24.429205, 88.618095]
        ],
        "25": [
            ["VGSD", 6029, 100, 339.63, 25.751312, 88.912201]
        ]
    },
    "89": {
        "26": [
            ["VE44", 6000, 110, 286.006, 26.708693, 89.375114],
            ["VE44", 9000, 148, 286.01, 26.69487, 89.382362],
            ["VERU", 6000, 0, 230, 26.145004, 89.917015]
        ],
        "23": [
            ["VGJR", 7960, 150, 337.58, 23.173731, 89.16539]
        ],
        "27": [
            ["VQPR", 6522, 95, 331.09, 27.39423, 89.432259]
        ]
    },
    "85": {
        "20": [
            ["VE62", 9000, 150, 222.6, 20.558701, 85.895187],
            ["VEBS", 7381, 150, 323.25, 20.241026, 85.820595]
        ],
        "25": [
            ["VEPT", 6427, 148, 248.1, 25.594215, 85.097061]
        ],
        "23": [
            ["VERC", 8890, 148, 310.95, 23.306595, 85.331848]
        ],
        "27": [
            ["VNKT", 10029, 148, 200.94, 27.709837, 85.364418]
        ],
        "56": [
            ["Z25P", 8220, 0, 213.3, 56.431179, 85.220085]
        ]
    },
    "84": {
        "24": [
            ["VEGY", 7537, 148, 283.25, 24.741816, 84.961739]
        ],
        "21": [
            ["VEJH", 6235, 148, 242.95, 21.915829, 84.060013]
        ]
    },
    "93": {
        "24": [
            ["VEIM", 9107, 148, 213.94, 24.770079, 93.904823]
        ],
        "25": [
            ["VEMR", 7513, 148, 298.5, 25.878468, 93.781227]
        ]
    },
    "94": {
        "26": [
            ["VEJT", 9000, 150, 220, 26.739449, 94.183884]
        ],
        "27": [
            ["VELR", 7481, 150, 221.91, 27.302631, 94.108093]
        ],
        "19": [
            ["VYAN", 8500, 100, 2.108, 19.757504, 94.025681]
        ],
        "21": [
            ["VYBG", 6000, 100, 359, 21.173002, 94.929329]
        ],
        "23": [
            ["VYKL", 5500, 102, 269, 23.187624, 94.066536]
        ]
    },
    "90": {
        "22": [
            ["VGBR", 6023, 100, 353.95, 22.792994, 90.301926]
        ],
        "23": [
            ["VGZR", 10534, 150, 323.97, 23.831659, 90.407074]
        ]
    },
    "78": {
        "26": [
            ["VIGR", 8970, 150, 240, 26.301142, 78.240219]
        ],
        "17": [
            ["VO28", 6873, 0, 265, 17.554123, 78.532379],
            ["VODG", 6800, 150, 278, 17.630362, 78.413025],
            ["VODG", 8250, 150, 278, 17.630991, 78.415215],
            ["VOHY", 10215, 148, 269.13, 17.453478, 78.483475]
        ],
        "9": [
            ["VOMD", 6048, 148, 267.02, 9.835188, 78.10154]
        ],
        "11": [
            ["VOSM", 5991, 150, 213.73, 11.789326, 78.069092]
        ],
        "10": [
            ["VOTR", 6115, 150, 266.27, 10.766865, 78.723358]
        ]
    },
    "105": {
        "15": [
            ["VLPS", 5339, 118, 320.11, 15.127708, 105.781532]
        ],
        "10": [
            ["VVCT", 6003, 100, 240, 10.088661, 105.727661]
        ],
        "21": [
            ["VVNB", 10500, 148, 287.2, 21.216755, 105.822067]
        ],
        "18": [
            ["VVVH", 7172, 148, 352.707, 18.726728, 105.672249]
        ],
        "-5": [
            ["WICT", 6085, 0, 319.84, -5.256276, 105.189171]
        ],
        "-10": [
            ["YPXM", 6931, 148, 355.34, -10.455225, 105.687958]
        ],
        "16": [
            ["Z19N", 5895, 0, 259.8, 16.672104, 105.017014]
        ]
    },
    "100": {
        "13": [
            ["VTBD", 11526, 148, 208.6, 13.927181, 100.617035],
            ["VTBD", 12185, 197, 208.6, 13.926346, 100.612404]
        ],
        "14": [
            ["VTBL", 7136, 148, 329, 14.86383, 100.663551]
        ],
        "18": [
            ["VTCN", 6546, 148, 200.61, 18.816309, 100.786758]
        ],
        "15": [
            ["VTPI", 9843, 148, 360, 15.264819, 100.300446]
        ],
        "16": [
            ["VTPP", 9868, 148, 324.01, 16.771986, 100.28743]
        ],
        "9": [
            ["VTSM", 8627, 148, 354.5, 9.53601, 100.063622]
        ],
        "6": [
            ["VTSS", 9994, 148, 262.8, 6.93442, 100.40789],
            ["WMKA", 6454, 151, 223.36, 6.201356, 100.409576]
        ],
        "0": [
            ["WIMG", 7088, 148, 340.27, -0.884238, 100.355377]
        ],
        "5": [
            ["WMKB", 7999, 150, 4, 5.465327, 100.393356],
            ["WMKP", 10954, 150, 222.3, 5.307981, 100.28569]
        ],
        "46": [
            ["ZMBH", 9215, 114, 336.73, 46.151012, 100.711929]
        ],
        "49": [
            ["ZMMN", 7938, 137, 282.17, 49.661163, 100.116211]
        ],
        "21": [
            ["ZPJH", 7239, 148, 340.08, 21.965656, 100.763649]
        ]
    },
    "99": {
        "14": [
            ["VTBK", 8886, 148, 209.88, 14.110586, 99.926781]
        ],
        "11": [
            ["VTBP", 6562, 131, 260, 11.788222, 99.814056]
        ],
        "18": [
            ["VTCL", 5846, 95, 355.45, 18.26412, 99.50473]
        ],
        "19": [
            ["VTCR", 5493, 103, 1.605, 19.877308, 99.826111],
            ["VTCT", 9874, 148, 208.91, 19.964188, 99.889893]
        ],
        "12": [
            ["VTPH", 6914, 115, 339.68, 12.626985, 99.954712]
        ],
        "17": [
            ["VTPO", 6919, 148, 1.12, 17.22821, 99.81813]
        ],
        "9": [
            ["VTSB", 9911, 148, 224.03, 9.142374, 99.145157]
        ],
        "10": [
            ["VTSE", 6910, 148, 239.94, 10.715942, 99.370049]
        ],
        "8": [
            ["VTSF", 6947, 148, 185.97, 8.549089, 99.945724],
            ["VTSN", 5577, 148, 360, 8.456234, 99.958336]
        ],
        "7": [
            ["VTST", 6903, 148, 260.87, 7.510238, 99.626007]
        ],
        "20": [
            ["VYTL", 7000, 102, 219, 20.49037, 99.941261]
        ],
        "6": [
            ["WMKL", 12547, 148, 214.33, 6.344243, 99.738602]
        ]
    },
    "98": {
        "18": [
            ["VTCC", 10104, 148, 0.14, 18.753178, 98.96283]
        ],
        "8": [
            ["VTSG", 6922, 148, 320.75, 8.091762, 98.992241],
            ["VTSP", 9842, 148, 264.59, 8.114522, 98.330437]
        ],
        "9": [
            ["VTSR", 6592, 148, 203.66, 9.785897, 98.589165]
        ],
        "14": [
            ["VYDW", 5500, 0, 329, 14.087624, 98.217545]
        ],
        "10": [
            ["VYKT", 6000, 150, 199, 10.0576, 98.553238]
        ],
        "12": [
            ["VYME", 6529, 180, -0.93, 12.436796, 98.615906]
        ],
        "3": [
            ["WIMM", 9537, 148, 226.33, 3.567099, 98.681396]
        ],
        "1": [
            ["WIMS", 5655, 98, 304.806, 1.551518, 98.89476]
        ]
    },
    "97": {
        "19": [
            ["VTCH", 6559, 98, 288, 19.298681, 97.98494],
            ["VYLK", 5200, 75, 189, 19.699234, 97.220917]
        ],
        "24": [
            ["VYBM", 5500, 102, 329, 24.260029, 97.253433]
        ],
        "22": [
            ["VYLS", 5270, 95, 189, 22.985275, 97.759407]
        ],
        "25": [
            ["VYMK", 6000, 100, 219, 25.396135, 97.365143],
            ["VYNP", 8586, 190, 359, 25.338221, 97.287064]
        ],
        "16": [
            ["VYMM", 5412, 150, 218.87, 16.444714, 97.659943]
        ],
        "20": [
            ["VYNS", 12001, 0, 349, 20.877853, 97.739723]
        ],
        "27": [
            ["VYPT", 7000, 102, 349, 27.316841, 97.445648]
        ]
    },
    "108": {
        "12": [
            ["VVBM", 9842, 148, 269, 12.666095, 108.128273]
        ],
        "11": [
            ["VVDL", 7723, 0, 269, 11.750733, 108.384705]
        ],
        "16": [
            ["VVDN", 10044, 148, 172.05, 16.057404, 108.196426],
            ["VVDN", 10044, 148, 352.05, 16.030117, 108.200394],
            ["VVDN", 10044, 148, 352.04, 16.030388, 108.20237]
        ],
        "14": [
            ["VVPK", 5920, 115, 273.92, 14.001634, 108.030327]
        ],
        "3": [
            ["WION", 8405, 105, 361, 3.900891, 108.37944]
        ],
        "22": [
            ["ZGNN", 8871, 148, 225.88, 22.623917, 108.192299]
        ],
        "34": [
            ["ZLXY", 9845, 148, 227.92, 34.454041, 108.762154]
        ]
    },
    "106": {
        "20": [
            ["VVCI", 7725, 164, 253.23, 20.822641, 106.73143]
        ],
        "8": [
            ["VVCS", 6004, 100, 289, 8.729823, 106.641022]
        ],
        "10": [
            ["VVTS", 12396, 148, 249, 10.823955, 106.670197],
            ["VVTS", 10026, 148, 249.01, 10.824866, 106.663239]
        ],
        "-6": [
            ["WICB", 5446, 0, 221, -6.287789, 106.57325],
            ["WICB", 5998, 100, 299.73, -6.296309, 106.575348],
            ["WIHH", 9850, 148, 245.29, -6.260973, 106.903404],
            ["WIHP", 6516, 146, 3.407, -6.345873, 106.764023],
            ["WIII", 12011, 197, 248.36, -6.130293, 106.674416],
            ["WIII", 11803, 197, 248.35, -6.108943, 106.669136]
        ],
        "-2": [
            ["WIPK", 5630, 98, 344.68, -2.170309, 106.14122]
        ],
        "47": [
            ["ZMUB", 10171, 197, 318.17, 47.832062, 106.781212]
        ],
        "29": [
            ["ZUCK", 10523, 148, 196.95, 29.730467, 106.644844]
        ]
    },
    "109": {
        "12": [
            ["VVCR", 10000, 150, 199, 12.014545, 109.227249],
            ["VVNT", 6146, 148, 297.48, 12.219265, 109.201637]
        ],
        "13": [
            ["VVPC", 10053, 148, 330.04, 13.940798, 109.054794],
            ["VVTH", 9514, 0, 210, 13.05441, 109.345551]
        ],
        "0": [
            ["WIOO", 7413, 98, 337.91, -0.160207, 109.407761]
        ],
        "18": [
            ["ZJSY", 11099, 148, 261.6, 18.303886, 109.429192]
        ]
    },
    "96": {
        "21": [
            ["VYCZ", 6523, 100, 188.69, 21.952477, 96.092651]
        ],
        "20": [
            ["VYHH", 8032, 100, 0.99, 20.732397, 96.793404]
        ],
        "19": [
            ["VYTO", 12052, 200, 1.99, 19.016312, 96.396385]
        ],
        "16": [
            ["VYYY", 8126, 200, 212.88, 16.916132, 96.141243]
        ],
        "5": [
            ["WITM", 6070, 98, 241.6, 5.230632, 96.957695]
        ],
        "-12": [
            ["YPCC", 8033, 148, 329.06, -12.200562, 96.842682]
        ]
    },
    "116": {
        "-8": [
            ["WADA", 6912, 131, 269.75, -8.560629, 116.104355]
        ],
        "-1": [
            ["WALL", 8208, 148, 247.06, -1.263868, 116.904861]
        ],
        "-3": [
            ["WAOC", 5689, 98, 271.2, -3.412843, 116.003441]
        ],
        "5": [
            ["WBKK", 9829, 150, 202.81, 5.949624, 116.053307]
        ],
        "-31": [
            ["YPEA", 5551, 148, 224.64, -31.661472, 116.021255],
            ["YPEA", 5726, 98, 353.53, -31.685598, 116.013939],
            ["YPEA", 8019, 148, 353.53, -31.68425, 116.016624]
        ],
        "-20": [
            ["YPKA", 6070, 98, 263.63, -20.711905, 116.784752]
        ],
        "40": [
            ["ZBAA", 10507, 164, 353.02, 40.071999, 116.573814],
            ["ZBAA", 12478, 197, 353.02, 40.054989, 116.600227]
        ]
    },
    "115": {
        "-8": [
            ["WADD", 9829, 148, 267.99, -8.747841, 115.181091]
        ],
        "5": [
            ["WBKL", 7493, 148, 325.8, 5.291897, 115.252769]
        ],
        "-33": [
            ["YBLN", 5560, 98, 206.1, -33.678883, 115.404099]
        ],
        "-20": [
            ["YBWX", 6252, 98, 206.44, -20.853624, 115.410789]
        ],
        "-31": [
            ["YGIG", 5994, 148, 254.95, -31.46221, 115.87233],
            ["YPPH", 11326, 148, 193.91, -31.928549, 115.968468],
            ["YPPH", 7098, 148, 238.82, -31.930866, 115.978798]
        ],
        "28": [
            ["ZSCN", 9205, 148, 202.93, 28.876623, 115.905617]
        ]
    },
    "117": {
        "3": [
            ["WALR", 6077, 95, 237.87, 3.331672, 117.574173]
        ],
        "2": [
            ["WALX", 5542, 145, 248.9, 2.009925, 117.75663]
        ],
        "-34": [
            ["YABA", 5905, 98, 314.5, -34.951611, 117.817741]
        ],
        "-31": [
            ["YCUN", 6095, 148, 225.83, -31.615622, 117.225548],
            ["YCUN", 5004, 148, 316.04, -31.627207, 117.221397]
        ],
        "-28": [
            ["YMOG", 5919, 98, 336.95, -28.122681, 117.844254]
        ],
        "-23": [
            ["YPBO", 6997, 148, 245.1, -23.167355, 117.756401]
        ],
        "39": [
            ["ZBTJ", 10505, 164, 334.05, 39.112038, 117.35479]
        ],
        "36": [
            ["ZSJN", 11827, 148, 180, 36.871216, 117.216667]
        ],
        "31": [
            ["ZSOF", 9848, 164, 315.09, 31.773764, 117.311211]
        ]
    },
    "111": {
        "-7": [
            ["WARI", 10300, 186, 350, -7.623916, 111.435829],
            ["WARI", 8448, 92, 350, -7.620946, 111.436584]
        ],
        "2": [
            ["WBGS", 6473, 148, 309.9, 2.259056, 111.983345]
        ],
        "40": [
            ["ZBHH", 10486, 148, 251.96, 40.857819, 111.839905]
        ]
    },
    "110": {
        "-7": [
            ["WARJ", 7315, 148, 267.66, -7.787664, 110.441902],
            ["WARQ", 8534, 148, 258.51, -7.513523, 110.766602]
        ],
        "-6": [
            ["WARS", 6080, 148, 308.05, -6.976985, 110.378731]
        ],
        "1": [
            ["WBGG", 8063, 151, 248.36, 1.488899, 110.354362]
        ],
        "25": [
            ["ZGKL", 9214, 147, 184.98, 25.229254, 110.041214]
        ],
        "19": [
            ["ZJHK", 11802, 148, 270, 19.933331, 110.474335]
        ],
        "44": [
            ["ZMSH", 9177, 0, 324.44, 44.976776, 110.184853]
        ]
    },
    "153": {
        "-27": [
            ["YBBN", 11709, 148, 206.96, -27.374626, 153.134354],
            ["YBBN", 5785, 98, 325.62, -27.369076, 153.134262]
        ],
        "-28": [
            ["YBCG", 6716, 148, 330.68, -28.172544, 153.510956],
            ["YBNA", 6224, 98, 253.43, -28.83087, 153.57048],
            ["YLIS", 5449, 98, 337.18, -28.837708, 153.261826]
        ],
        "-26": [
            ["YBMC", 5916, 98, 13.97, -26.610107, 153.089935]
        ],
        "-29": [
            ["YGFN", 5611, 98, 365.23, -29.762478, 153.030426]
        ],
        "-30": [
            ["YSCH", 6831, 148, 220.62, -30.324142, 153.120667]
        ]
    },
    "149": {
        "-21": [
            ["YBMK", 6520, 148, 327.8, -21.178314, 149.187683]
        ],
        "-33": [
            ["YBTH", 5601, 98, 356.2, -33.416092, 149.651917],
            ["YORG", 5499, 98, 305.59, -33.386272, 149.138443]
        ],
        "-32": [
            ["YMDG", 5701, 98, 232.05, -32.560116, 149.616638]
        ],
        "-36": [
            ["YMER", 5254, 98, 213.92, -36.900894, 149.906647]
        ],
        "-29": [
            ["YMOR", 5292, 98, 197.23, -29.492409, 149.847977]
        ],
        "-30": [
            ["YNBR", 5006, 98, 13.08, -30.327511, 149.82402]
        ],
        "-35": [
            ["YSCB", 5516, 148, 309.81, -35.310356, 149.199371],
            ["YSCB", 8806, 148, 360, -35.314781, 149.194443]
        ]
    }
};

function clamp(a, b, c) {
    return void 0 == b || void 0 == c ? a : a < b ? b : a > c ? c : a
}
export default runways;