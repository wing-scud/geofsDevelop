import instruments from './instruments'
import Overlay from './Overlay'
//指示器
var Indicator = function(a) {
    this.definition = $.extend(this.definition, a);
    this.scale();
    const b = a.overlay;
    b.cockpit = !!this.definition.cockpit;
    this.visibility = void 0 != a.visibility ? a.visibility : !0;
    if (a.stackX) {
        const c = b.position.x;
        b.position.x = instruments.stackPosition.x + c;
        instruments.stackPosition.x += b.size.x + instruments.defaultMargin + c;
    }
    a.stackY && (a = b.position.y,
        b.position.y = instruments.stackPosition.y + b.size.y / 2 + a,
        instruments.stackPosition.y += b.size.y + instruments.defaultMargin + a);
    b.position.y = b.alignment && b.alignment.y == 'top' ? b.position.y + instruments.margins[0] : b.position.y + instruments.margins[2];
    b.position.x = b.alignment && b.alignment.x == 'right' ? b.position.x + instruments.margins[1] : b.position.x + instruments.margins[3];
    this.overlay = new Overlay(b);
    this.setVisibility(this.visibility);
    return this;
};
Indicator.prototype.scale = function() {
    if (this.definition.cockpit && this.definition.cockpit.position) {
        const a = geofs.aircraft.instance.setup.scale * geofs.aircraft.instance.setup.cockpitScaleFix;
        this.definition.cockpit.originalScale = this.definition.cockpit.originalScale || this.definition.cockpit.scale;
        this.definition.cockpit.scale = this.definition.cockpit.originalScale * a;
    }
};
Indicator.prototype.show = function() {
    this.overlay.setVisibility(!0);
    this.visibility = !0;
};
Indicator.prototype.hide = function() {
    this.overlay.setVisibility(!1);
    this.visibility = !1;
};
Indicator.prototype.setVisibility = function(a) {
    this.overlay.setVisibility(a);
    this.visibility = a;
};
Indicator.prototype.updateCockpitPosition = function() {
    if (this.definition.cockpit) {
        let a = this.definition.cockpit.position;
        geofs.aircraft.instance.object3d.setVectorWorldPosition(a);
        a.worldPosition = V3.scale(a.worldPosition, geofs.aircraft.instance.setup.cockpitScaleFix);
        let b = V3.add(geofs.aircraft.instance.llaLocation, xyz2lla(a.worldPosition, geofs.aircraft.instance.llaLocation)),
            c = geofs.api.getScreenCoordFromLla(b);
        c && (b = c.x,
            c = c.y,
            a = 0.8 / V3.length(V3.sub(camera.worldPosition, a.worldPosition)) * this.definition.cockpit.scale,
            this.overlay.scale = {
                x: a * geofs.fovScale,
                y: a * geofs.fovScale,
            },
            this.overlay.position = {
                x: b,
                y: geofs.viewportHeight - c,
            },
            this.overlay.rotation = 0.3 * fixAngle(camera.definitions.cockpit.orientations.current[0]),
            this.overlay.scaleAndPlace(this.overlay.scale, this.overlay.position, !0));
    }
};
Indicator.prototype.update = function(a) {
    this.overlay.animate(a);
    if (this.definition.animations) {
        for (a = 0; a < this.definition.animations.length; a++) {
            let b = this.definition.animations[a],
                c = geofs.animation.filter(b);
            switch (b.type) {
                case 'show':
                    this.visibility && this.overlay.setVisibility(c);
            }
        }
    }
};
Indicator.prototype.destroy = function() {
    this.overlay && this.overlay.destroy();
    for (let a = 0; a < this.overlay.children.length; a++) { this.overlay.children[a].destroy(); }
};
export default Indicator;