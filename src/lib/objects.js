import { V3 } from './geofs/utils'
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


window.objects = window.objects || {};
objects.clusterSize = 2;
objects.currentCellId;
objects.matrix = {};
objects.visible = [];
objects.list = {
    carrier: {
        location: [37.777228, -122.609482, 0],
        url: 'models/objects/carrier/carrier.gltf',
        collisionRadius: 400,
        collisionTriangles: [
            [
                [12.6, 330, 20.9],
                [0, 99.5, 20.9],
                [56, 334, 20.9]
            ],
            [
                [56, 334, 20.9],
                [0, 99.5, 20.9],
                [49, 0, 20.9]
            ],
            [
                [55, 295, 20.9],
                [49, 75, 20.9],
                [74.5, 288, 20.9]
            ],
            [
                [74.5, 288, 20.9],
                [49, 75, 20.9],
                [77.5, 107, 20.9]
            ],
            [
                [18, 63, 20.9],
                [23, 1, 20.9],
                [49, 1, 20.9]
            ],
            [
                [0, 330, 20.9],
                [75, 330, 20.9],
                [75, 330, 0]
            ],
            [
                [0, 330, 20.9],
                [75, 330, 0],
                [0, 330, 0]
            ]
        ],
        options: {
            castShadows: !0,
            receiveShadows: !0,
        },
    },
};
objects.collidableObjectList = [];
objects.collidableObject = !1;
objects.init = function() {
    objects.preProcessObjects();
    setInterval(objects.updateVisibility, 1E4);
    setInterval(objects.updateCollidables, 2E3);
};
objects.preProcessObjects = function() {
    for (const a in objects.list) {
        let b = objects.list[a],
            c = `${(b.location[0] / objects.clusterSize).toFixed(0)}/${(b.location[1] / objects.clusterSize).toFixed(0)}`;
        objects.matrix[c] = objects.matrix[c] || {};
        objects.matrix[c][a] = b;
        b.collisionTriangles = b.collisionTriangles || [];
        c = 0;
        for (let d = b.collisionTriangles.length; c < d; c++) {
            const e = b.collisionTriangles[c];
            e.u = V3.sub(e[1], e[0]);
            e.v = V3.sub(e[2], e[0]);
            e.n = V3.cross(e.u, e.v);
        }
    }
};

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
objects.updateVisibility = function() {
    const a = `${(geofs.aircraft.instance.llaLocation[0] / objects.clusterSize).toFixed(0)}/${(geofs.aircraft.instance.llaLocation[1] / objects.clusterSize).toFixed(0)}`;
    a != objects.currentCellId && (objects.unloadMatrixModels(objects.currentCellId),
        objects.loadMatrixModels(a),
        objects.currentCellId = a);
};
objects.unloadMatrixModels = function(a) {
    for (const b in objects.matrix[a]) {
        objects.matrix[a][b].model && (geofs.api.destroyModel(objects.matrix[a][b].model),
            objects.matrix[a][b].model = null);
    }
};
objects.loadMatrixModels = function(a) {
    for (const b in objects.matrix[a]) {
        const c = objects.matrix[a][b];
        c.url && (c.model = geofs.loadModel(c.url, c.options),
            geofs.api.setModelPositionOrientationAndScale(c.model, c.location));
    }
};
objects.updateCollidables = function() {
    objects.collidableObjectList = [];
    objects.collidableObject = !1;
    for (const a in objects.matrix[objects.currentCellId]) {
        let b = objects.matrix[objects.currentCellId][a],
            c = lla2xyz(V3.sub(geofs.aircraft.instance.llaLocation, b.location), geofs.aircraft.instance.llaLocation);
        V3.length(c) < b.collisionRadius && (b.metricOffset = c,
            objects.collidableObject = !0,
            objects.collidableObjectList.push(b));
    }
};
objects.checkCollisions = function(a, b, c) {
    if (objects.collidableObject) {
        for (let d = 0, e = objects.collidableObjectList.length; d < e; d++) {
            const f = objects.collidableObjectList[d];
            f.metricOffset = lla2xyz(V3.sub(geofs.aircraft.instance.llaLocation, f.location), geofs.aircraft.instance.llaLocation);
            a = V3.add(f.metricOffset, a);
            b = c ? V3.add(a, c) : V3.add(f.metricOffset, b);
            for (let g = 0, h = f.collisionTriangles.length; g < h; g++) {
                let k = f.collisionTriangles[g],
                    n = intersect_RayTriangle([a, b], k);
                if (n) {
                    return {
                        location: V3.add(f.location, xyz2lla(n.point, f.location)),
                        normal: V3.normalize(k.n),
                    };
                }
            }
        }
    }
};
objects.getAltitudeAtLocation = function(a, b) {
    if (objects.collidableObject) {
        for (let c = [a, b, 1E5], d = 0, e = objects.collidableObjectList.length; d < e; d++) {
            for (let f = objects.collidableObjectList[d], g = lla2xyz(V3.sub(c, f.location), f.location), h = [g[0], g[1], 0], k = 0, n = f.collisionTriangles.length; k < n; k++) {
                let v = f.collisionTriangles[k],
                    z = intersect_RayTriangle([g, h], v);
                if (z) {
                    return {
                        location: [a, b, z.point[2] + f.location[2]],
                        normal: V3.normalize(v.n),
                    };
                }
            }
        }
    }
};

export default objects;