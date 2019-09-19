//@ts-check
import { V3,lla2xyz ,xyz2lla,intersect_RayTriangle} from '../utils/utils'
import geofs from "../geofs"

var objects = window.objects || {};
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
    setInterval(objects.updateVisibility, 1E4);//定时调用
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
    //c指的是aircraft ，但是没有url等属性
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