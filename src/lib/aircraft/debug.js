
import geofs from "../geofs"
import instruments from "../modules/instruments"
import {V3,M33,xyz2lla} from "../utils/utils"
import ui from "../ui/ui"
var  debug= {};
debug.logStack = [];
debug.logStackMaxLength = 10;
var PAGE_PATH = 'http://localhost:3030/proxy/';
debug.init = function() {
    debug.frameComplete = !0;
    debug.$panel = $('.geofs-debug');
    debug.axis = null;
    const a = function(a) {
        a.stopPropagation();
    };
    debug.$panel.keydown(a);
    debug.$panel.keyup(a);
};
debug.turnOn = function() {
    debug.$debugFrame = $('.geofs-debugFrame');
    debug.$debugWatch = $('.geofs-debugWatch');
    debug.$debugLog = $('.geofs-debugLog');
    debug.on = !0;
};
debug.afterWorldInit = function() {
    geofs.api.debug(debug.on);
};
debug.turnOff = function() {
    debug.on = !1;
    geofs.api.debug(!1);
};
debug.watch = function(a, b) {
    debug.on && (debug[a] || (debug[a] = document.createElement('div'),
            debug.$debugFrame.append(debug[a])),
        debug[a].innerHTML = `${a}: ${b}`);
};
debug.error = function(a, b) {
    b = b || 'unknown';
    a ? (b = `${b}: ${a.message}`,
        debug.log(b),
        debug.throw(a)) : debug.log(b);
};
debug.log = function(a) {
    console.log(a)
    debug.on ? (debug.$debugLog.html(`${debug.$debugLog.html()}<br/>${a}`),
        window.console && window.console.log && console.log(a)) : debug.stackLog(a);
};
debug.debugger = function() {
    if (debug.on) { debugger; }
};
debug.throw = function(a) {
    console.error(a)
    debug.on && a && setTimeout(() => {
        throw a;
    }, 0);
};
debug.alert = function(a, b) {
    if (debug.on && b) { throw b; }
    debug.stackLog(a);
};
debug.stackLog = function(a) {
    debug.logStack.push(a);
    debug.logStack.length > debug.logStackMaxLength && debug.logStack.shift();
};
debug.update = function(a) {
    debug.fps = 1E3 / a;
    debug.fps = debug.fps.toPrecision(2);
    if (debug.on && (document.title = `fps: ${debug.fps}`,
            a = $('.debugPointName')[0].value)) {
        let b = geofs.aircraft.instance.parts[a],
            c = instruments.list[a];
        if (b) {
            let d = $('.debugCollisionPointIndex')[0].value;
            d ? (d = b.collisionPoints[parseInt(d)] || b.points[d],
                debug.placeAxis(b.object3d.getWorldFrame(), d.worldPosition)) : ($('.debugShowForceSource')[0].checked && debug.placeAxis(b.object3d.getWorldFrame(), b.points.forceSourcePoint.worldPosition),
                $('.debugShowForceDirection')[0].checked && debug.placeAxis(b.object3d.getWorldFrame(), b.points.forceDirection.worldPosition),
                $('.debugShowLocalPosition')[0].checked && debug.placeAxis(b.object3d.getWorldFrame(), b.object3d.worldPosition),
                $('.debugShowsuspensionOrigin')[0].checked && debug.placeAxis(b.object3d.getWorldFrame(), b.points.suspensionOrigin.worldPosition));
            $('.debugPartData').html(`Node Origin: ${b.object3d._nodeOrigin}<br/>worldPosition: ${b.object3d.getWorldPosition()}`);
        }
        c && c.definition.cockpit && (b = c.definition.cockpit.position,
            debug.placeAxis(geofs.aircraft.instance.object3d.getWorldFrame(), b.worldPosition));
        a == 'camera' && (b = geofs.aircraft.instance.setup.camera.cockpit,
            geofs.aircraft.instance.object3d.setVectorWorldPosition(b),
            debug.placeAxis(geofs.aircraft.instance.object3d.getWorldFrame(), b.worldPosition));
    }
};
debug.loadAxis = function() {
    const a = `${PAGE_PATH}models/debug/axis.glb`;
    debug.axis = {};
    debug.axis.model = geofs.loadModel(a);
};
debug.loadProbe = function() {
    const a = `${PAGE_PATH}models/debug/probe.glb`;
    debug.probe = {};
    debug.probe.model = geofs.loadModel(a);
};
debug.placeAxis = function(a, b) {
    debug.axis || debug.loadAxis();
    try {
        let c = V3.add(geofs.aircraft.instance.llaLocation, xyz2lla(b, geofs.aircraft.instance.llaLocation)),
            d = M33.getOrientation(a);
        geofs.api.setModelPositionOrientationAndScale(debug.axis.model, c, d);
    } catch (e) {
        debug.error(e, 'placeAxis');
    }
};
debug.toggleDebug = function() {
    ui.panel.toggle('.geofs-debug');
};
export default debug;