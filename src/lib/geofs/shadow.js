//@ts-check
import {M33,V3 } from "./utils"
function shadowGeofs(geofs) {
    geofs.useSimpleShadow = function(a) {
        a == 0 ? (geofs.aircraft.instance && geofs.aircraft.instance.removeShadow(),
            geofs.api.useNativeShadows(!0)) : (geofs.aircraft.instance && geofs.aircraft.instance.addShadow(),
            geofs.api.useNativeShadows(!1));
    };
    geofs.disableShadows = function() {
        geofs.shadowsDisabled || (geofs.useSimpleShadow(!0),
            geofs.shadowsDisabled = !0);
    };
    geofs.enableShadows = function() {
        !1 !== geofs.shadowsDisabled && (geofs.useSimpleShadow(geofs.preferences.graphics.forceSimpleShadow || geofs.preferences.graphics.simpleShadow),
            geofs.shadowsDisabled = !1);
    };
    geofs.shadow = function(a, b) {
        this.shadow = geofs.api.createShadow(a + geofs.killCache, b);
        this.context = {};
    };
    geofs.shadow.prototype = {
        setLocationRotation(a, b) {
            console.log(geofs.aircraft.instance.collResult.normal + "  shadow")
            b = geofs.getCollisionResult(a, [0, 0, 0], geofs.aircraft.instance.collResult, this.context);
            let c = geofs.getNormalFromCollision(b, this),
                d = geofs.aircraft.instance.object3d.getWorldFrame()[1];
            d = V3.normalize(V3.cross(d, c));
            const e = V3.cross(c, d);
            d = M33.getOrientation([d, e, c]);
            geofs.api.setShadowLocationRotation(this.shadow, [a[0], a[1], b.location[2]], d, c);
        },
        destroy() {
            geofs.api.destroyModel(this.shadow);
            this.context = this.shadowBox = null;
        },
    };
    geofs.light = function(a, b, c) {
        a = a || [0, 0, 0];
        this._billboard = new geofs.api.billboard(a, geofs.fx.texture2url[b], c);
    };
    geofs.light.prototype = {
        destroy() {
            this._billboard.destroy();
        },
        setVisibility(a) {
            this._billboard.setVisibility(a);
            return !0;
        },
        setLocation(a) {
            this._billboard.setLocation(a);
        },
    };
}
export default shadowGeofs