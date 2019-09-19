//覆盖图 ，拿取图片
import camera from './camera'
import {S2,VIEWPORT_REFERENCE_WIDTH,
    VIEWPORT_REFERENCE_HEIGHT,DEGREES_TO_RAD,M33 } from "../utils/utils"
import geofs from "../geofs"
function Overlay(a, b) {
    this.definition = {
        url: '',
        anchor: {
            x: 0,
            y: 0,
        },
        position: {
            x: 0,
            y: 0,
        },
        rotation: 0,
        size: {
            x: 0,
            y: 0,
        },
        offset: {
            x: 0,
            y: 0,
        },
        visibility: !0,
        opacity: b ? b.definition.opacity : 1,
        scale: {
            x: 1,
            y: 1,
        },
        rescale: b ? b.definition.rescale : !1,
        rescalePosition: !1,
        alignment: {
            x: 'left',
            y: 'bottom',
        },
        overlays: [],
    };
    this.children = [];
    this.definition = $.extend(!0, {}, this.definition, a);
    console.log(this.definition['url']+" url")
    this.position = this.definition.position;
    this.size = this.definition.size;
    this.iconFrame = {
        x: 0,
        y: 0,
    };
    this.scale = this.definition.scale;
    this.positionOffset = this.definition.offset;
    this._offset = {
        x: 0,
        y: 0,
    };
    this._sizeScale = 1;
    this.rotation = this.definition.rotation;
    this.opacity = this.definition.opacity;
    this.anchor = this.definition.anchor;
    this.visibility = this.definition.visibility;
    this.overlay = new geofs.api.cssTransform();
    this.overlay.setUrl(this.definition.url);
    this.overlay.setText(this.definition.text);
    this.overlay.setClass(this.definition.class);
    this.overlay.setStyle(this.definition.style);
    this.overlay.setDrawOrder(this.definition.drawOrder || 0);
    const c = this;
    $(this.overlay).on('load', function() {
        const a = c.definition.size.x / this.naturalSize.x;
        c.definition.size = this.naturalSize;
        c._sizeScale = a;
        c.scaleAndPlace();
    });
    this.overlay.setVisibility(this.definition.visibility);
    if (this.definition.animations) {
        for (a = 0,
            b = this.definition.animations.length; a < b; a++) {
            const d = this.definition.animations[a];
            d.type == 'rotate' && (this.definition.animateRotation = !0);
            d.type == 'show' && (this.animateVisibility = !0,
                this.animationVisibility = this.definition.visibility);
        }
    }
    for (a = 0; a < this.definition.overlays.length; a++) {
        b = new Overlay(this.definition.overlays[a], this),
            b.parent = this,
            this.children[a] = b;
    }
}
Overlay.prototype.setVisibility = function(a) {
    this.animateVisibility && !this.animationVisibility || this.overlay.setVisibility(a);
    this.visibility = a;
    for (let b = 0; b < this.children.length; b++) { this.children[b].setVisibility(a); }
};
Overlay.prototype.setOpacity = function(a) {
    this.overlay.setOpacity(a);
    this.opacity = a;
    for (let b = 0; b < this.children.length; b++) { this.children[b].setOpacity(a); }
};
Overlay.prototype.scaleAllProperties = function(a) {
    a = a || this.scale;
    let b = 1,
        c = 1,
        d = {
            x: 1 * this._sizeScale,
            y: 1 * this._sizeScale,
        };
    this.definition.rescalePosition && (b = a.x,
        c = a.y);
    this.definition.rescale && (d = {
        x: d.x * a.x,
        y: d.y * a.y,
    });
    this.position = {
        x: this.definition.position.x * b,
        y: this.definition.position.y * c,
    };
    this.size = {
        x: this.definition.size.x * d.x,
        y: this.definition.size.y * d.y,
    };
    this.overlay.setSize(this.size);
    this.positionOffset = {
        x: this.definition.offset.x * d.x,
        y: this.definition.offset.y * d.y,
    };
    this.overlay.setPositionOffset(this.positionOffset);
    this.definition.iconFrame ? (this.iconFrame = {
            x: this.definition.iconFrame.x * d.x,
            y: this.definition.iconFrame.y * d.y,
        },
        this.overlay.setFrameSize(this.iconFrame)) : (this.iconFrame = this.size,
        this.overlay.setFrameSize(this.size));
    this.anchor = {
        x: this.definition.anchor.x * d.x,
        y: this.definition.anchor.y * d.y,
    };
    this.overlay.setAnchor(this.anchor);
    this.rotationCenter = {
        x: this.anchor.x,
        y: this.iconFrame.y - this.anchor.y,
    };
    this.overlay.setRotationCenter(this.rotationCenter);
};

function clamp(a, b, c) {
    return a > c ? c : a < b ? b : a;
}
Overlay.prototype.scaleAndPlace = function(a, b, c) {
    (this.definition.rescale && !this.parent || this.definition.rescalePosition) && !c ? (this.scale = this.scaleFromParent(a),
        a = clamp(geofs.viewportWidth / VIEWPORT_REFERENCE_WIDTH, 0.3, 1),
        c = clamp(geofs.viewportHeight / VIEWPORT_REFERENCE_HEIGHT, 0.3, 1),
        this.scale = S2.scale(this.scale, Math.min(a, c))) : this.scale = this.scaleFromParent(a);
    this.offset = {              
        x: 0,
        y: 0,
    };
    this.scaleAllProperties();
    this.place(b);
    for (b = 0; b < this.children.length; b++) { this.children[b].scaleAndPlace(); }
};
Overlay.prototype.place = function(a) {
    this.parent ? (this.definition.animateRotation || (this.rotation = this.definition.rotation + this.parent.rotation),
        this.position = {
            x: this.parent.position.x + this.definition.position.x * this.scale.x,
            y: this.parent.position.y + this.definition.position.y * this.scale.y,
        }) : (a = a || this.definition.position,
        camera.currentModeName == 'cockpit' && this.definition.cockpit ? this.position = a : this.definition.alignment && (this.definition.alignment.x == 'right' && (this.position.x = geofs.viewportWidth - a.x * this.scale.x),
            this.definition.alignment.x == 'center' && (this.position.x = geofs.viewportWidth / 2 - a.x * this.scale.x),
            this.definition.alignment.y == 'top' && (this.position.y = geofs.viewportHeight - a.y * this.scale.y),
            this.definition.alignment.y == 'center' && (this.position.y = geofs.viewportHeight / 2 - a.y * this.scale.y)));
    this.overlay.setPosition(this.position);
    this.overlay.setOpacity(this.opacity);
    this.overlay.setRotation(this.rotation);
};
Overlay.prototype.scaleFromParent = function(a) {
    a = a || {
        x: 1,
        y: 1,
    };
    const b = this.parent ? this.parent.scale : a;
    return {
        x: this.definition.scale.x * b.x * a.x,
        y: this.definition.scale.y * b.y * a.y,
    };
};
Overlay.prototype.positionFromParentRotation = function() {
    let a = [this.position.x, this.position.y, 0],
        b = M33.identity();
    b = M33.rotationZ(b, -this.parent.rotation * DEGREES_TO_RAD);
    a = M33.transform(b, a);
    return {         
        x: a[0],
        y: a[1],
    };
};
Overlay.prototype.animate = function(a) {
    if (this.definition.animations) {
        for (var b = 0; b < this.definition.animations.length; b++) {
            let c = this.definition.animations[b],
                d = geofs.animation.filter(c);
            if (c.lastValue != d || a) {
                switch (c.lastValue = d,
                    c.type) {
                    case 'moveY':
                        this.visibility && this.overlay.setPositionY(this.position.y + d * this.scale.y);
                        break;
                    case 'translateY':
                        this.visibility && this.translateIcon(d, 'Y');
                        break;
                    case 'translateX':
                        this.visibility && this.translateIcon(d, 'X');
                        break;
                    case 'scaleX':
                        this.visibility && (this.size.x = d * this.scale.x,
                            this.overlay.setSize(this.size));
                        break;
                    case 'text':
                        this.overlay.setText(d);
                        break;
                    case 'title':
                        this.overlay.setTitle(d);
                        break;
                    case 'opacity':
                        this.setOpacity(d);
                    case 'show':
                        this.visibility && this.overlay.setVisibility(d);
                        this.animationVisibility = d;
                        break;
                    default:
                        d && this.visibility && this.rotate(d);
                }
            }
        }
    }
    for (b = 0; b < this.children.length; b++) { this.children[b].animate(a); }
};
Overlay.prototype.translateIcon = function(a, b) {
    b == 'Y' ? this._offset.y = a * this.scale.y * this._sizeScale - this.size.y + this.iconFrame.y : this._offset.x = a * this.scale.x * this._sizeScale;
    this.overlay.setPositionOffset(S2.add(this.positionOffset, this._offset));
};
Overlay.prototype.rotate = function(a) {
    this.rotation = a;
    this.parent && (this.rotation += this.parent.rotation);
    this.overlay.setRotation(this.rotation);
};
Overlay.prototype.setText = function(a) {
    this.overlay.setText(a);
};
Overlay.prototype.setTitle = function(a) {
    this.overlay.setTitle(a);
};
Overlay.prototype.destroy = function() {
    geofs.removeResizeHandler(this.resizeHandler);
    this.overlay && this.overlay.destroy();
};

export default Overlay