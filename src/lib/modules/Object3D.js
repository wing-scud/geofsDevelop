
import { M33, V3,xyz2lla } from '../utils/utils'
import geofs from "../geofs"

var Object3D = function(a) {
    a = a || {};
    this._name = a.name;
    this._nodeName = a.node;
    this._children = [];
    a['3dmodel'] && this.setModel(a['3dmodel']);
    a.entity && this.setEntity(a.entity);//实体
    this.setLight(a);
    this._points = a.points || {};
    this._collisionPoints = a.collisionPoints || [];
    let b = this._points,
        c;
    for (c in b) { b[c].worldPosition = [0, 0, 0]; }
    b = this._collisionPoints;
    for (c in b) { b[c].worldPosition = [0, 0, 0]; }
    this.setInitiallRotation(a.rotation);
    this.setInitialPosition(a.position);
    this.setInitialScale(a.scale);
    this.setScale(a.scale);
    this.visible = !0;
    this._options = $.extend({}, a);
};
Object3D.prototype = {
    reset() {
        this.setInitiallRotation(this._options.rotation);
        this.setInitialPosition(this._options.position);
        this.worldRotation = this._rotation;
        this.worldPosition = this._position;
    },
    setInitiallRotation(a) {
        this._initialRotation = M33.identity();
        this._initialRotation = M33.rotationXYZ(this._initialRotation, a || [0, 0, 0]);
        this._rotation = M33.dup(this._initialRotation);
    },
    rotateInitialRotation(a) {
        this._initialRotation = M33.rotationXYZ(this._initialRotation, a || [0, 0, 0]);
        this._rotation = M33.dup(this._initialRotation);
    },
    rotate(a) {
        this._rotation = M33.rotationXYZ(this._rotation, a);
    },
    rotateX(a) {
        this._rotation = M33.rotationX(this._rotation, a);
    },
    rotateY(a) {
        this._rotation = M33.rotationY(this._rotation, a);
    },
    rotateZ(a) {
        this._rotation = M33.rotationZ(this._rotation, a);
    },
    setRotationX(a) {
        this._rotation = M33.rotationX(this._initialRotation, a);
    },
    setRotationY(a) {
        this._rotation = M33.rotationY(this._initialRotation, a);
    },
    setRotationZ(a) {
        this._rotation = M33.rotationZ(this._initialRotation, a);
    },
    rotateParentFrameX(a) {
        this._rotation = M33.rotationParentFrameX(this._rotation, a);
    },
    rotateParentFrameY(a) {
        this._rotation = M33.rotationParentFrameY(this._rotation, a);
    },
    rotateParentFrameZ(a) {
        this._rotation = M33.rotationParentFrameZ(this._rotation, a);
    },
    getRotation() {
        return this._rotation;
    },
    setInitialPosition(a) {
        this._nodeName && (this._nodeOrigin = a,
            a = [0, 0, 0]);
        a = a || [0, 0, 0];
        this._initialPosition = V3.dup(a);
        this._position = V3.dup(this._initialPosition);
    },
    setInitialScale(a) {
        a = a || 1;
        a.length || (a = [a, a, a]);
        this._initialScale = a;
    },
    scale(a, b) {
        a = a || 1;
        a.length || (a = [a, a, a]);
        this._scale = V3.mult(this._initialScale, a);
        b && this.propagateToTree('scale', [a, b]);
    },
    setPosition(a) {
        this._position = a;
    },
    translate(a) {
        this._position = V3.add(this._position, a);
    },
    setTranslation(a) {
        this._position = V3.add(this._initialPosition, a);
    },
    setScale(a, b) {
        a = a || 1;
        a.length || (a = [a, a, a]);
        this._scale = a;
        b && this.propagateToTree('setScale', [a, b]);
    },
    setScaleOffset(a, b) {
        this._scaleOffset = a;
        b && this.propagateToTree('setScaleOffset', [a, b]);
    },
    getPosition() {
        return this._position;
    },
    getLocalPosition() {
        let a = this._position;
        this._parent && (a = V3.add(a, this._parent.getLocalPosition()));
        return a;
    },
    resetAnimatedTransform() {
        this._rotation = M33.dup(this._initialRotation);
        this._position = V3.dup(this._initialPosition);
    },
    resetRotationMatrix() {
        if (this.htr) {
            const a = V3.toRadians(this.htr);
            this.setInitiallRotation([a[1], a[2], a[0]]);
        }
    },
    setVectorWorldPosition(a) {
        a.worldPosition = M33.transform(this.worldRotation, a);
        a.worldPosition = V3.add(this.worldPosition, a.worldPosition);
        return a.worldPosition;
    },
    compute(a) {
        if (this._parent) {
            this.worldRotation = M33.multiply(this._parent.worldRotation, this._rotation);
            var b = this._position;
            this._nodeName && (this._nodeOrigin = this._nodeOrigin || this.getNodePosition()) && (b = V3.add(this._position, this._nodeOrigin));
            this.worldPosition = M33.transform(this._parent.worldRotation, b);
            this.worldPosition = V3.add(this.worldPosition, this._parent.worldPosition);
        } else {
            this.worldRotation = this._initialRotation,
                this.worldPosition = M33.transform(this._initialRotation, this._position);
        }
        b = this._points;
        for (var c in b) { this.setVectorWorldPosition(b[c]); }
        b = this._collisionPoints;
        c = 0;
        for (let d = b.length; c < d; c++) { this.setVectorWorldPosition(b[c]); }!this._nodeName && (c = this._scaleOffset ? V3.scale(this.worldPosition, this._scaleOffset) : this.worldPosition,
            this._model || this._entity || this._name == 'root') && (this.htr = M33.toEuler(this.worldRotation),
            this.lla = V3.add(a, xyz2lla(c, a)));
        this.propagateToTree('compute', [a]);
    },
    render(a) {
        const b = this._scaleOffset ? V3.scale(this.worldPosition, this._scaleOffset) : this.worldPosition;
        if (this.visible) {
            if (this._model) {
                if (this._nodeName) {
                    const c = this.getNode();
                    c && geofs.api.setNodeRotationTranslation(c, this.getRotation(), this._position);
                } else { geofs.api.setModelPositionOrientationAndScale(this._model, this.lla, this.htr, this._scale, this); }
            }
            this._entity && geofs.api.setEntityPositionOrientation(this._entity, this.lla, this.htr);
            this._light && (this.lla = V3.add(a, xyz2lla(b, a)),
                this._light && this._light.setLocation(this.lla));
        }
        this.propagateToTree('render', [a]);
    },
    setModel(a) {
        this._model = a;
    },
    setEntity(a) {
        this._entity = a;
    },
    getModel() {
        return this._model;
    },
    getNode() {
        if (!this._node) {
            if (!this._model || !this._model.ready) { return; }
            this._node = geofs.api.getModelNode(this._model, this._nodeName);
        }
        return this._node;
    },
    getNodePosition() {
        const a = this.getNode();
        return a ? geofs.api.getNodePosition(a) : null;
    },
    getNodeRotation() {
        const a = this.getNode();
        return a ? geofs.api.getNodeRotation(a) : M33.identity();
    },
    setLight(a) {
        a.lightBillboard && (this._light = a.lightBillboard);
    },
    getWorldFrame() {
        return this.worldRotation;
    },
    getWorldPosition() {
        return this.worldPosition;
    },
    getLlaLocation() {
        return this.lla;
    },
    addChild(a) {
        a._parent = this;
        this._children.push(a);
    },
    setVisibility(a, b) {
        let c = !0;
        if (a && !b) {
            for (b = this._parent; b && b._options.type != 'root';) {
                c = c && b.visible,
                    b = b._parent;
            }
        }
        b = !0;
        c && (this._model && (b = this._nodeName ? geofs.api.setNodeVisibility(this.getNode(), a) : geofs.api.setModelVisibility(this._model, a)),
            this._light && (b = this._light.setVisibility(a)),
            this._entity && (this._entity.show = a,
                b = !0),
            this.propagateToTree('setVisibility', [a, !0]));
        b && (this.visible = a);
    },
    findModelInAncestry() {
        for (let a = this; a;) {
            const b = a.getModel();
            if (b) { return b; }
            a = a.getParent();
        }
    },
    getParent() {
        return this._parent;
    },
    propagateToTree(a, b) {
        for (let c = this._children, d = 0, e = c.length; d < e; d++) {
            const f = c[d];
            f[a](...b);
        }
    },
    destroy() {
        this._node = null;
        this._model && (geofs.api.destroyModel(this._model),
            this._model = null);
    },
};
Object3D.utilities = {
    getPointLla(a, b) {
        if (a.lla) { return a.lla; }
        if (a.worldPosition) { return V3.add(b, xyz2lla(a.worldPosition, b)); }
    },
};
export default Object3D;