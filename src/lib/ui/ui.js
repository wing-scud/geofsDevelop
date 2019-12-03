import hud from './hud';
import geofs from '../geofs'
import camera from "../modules/camera"
import map from "./map"
window.ui = window.ui || {};
ui.hud = hud;
ui.playerMarkers = {};
ui.playerSymbols = {};
ui.mouseUpHandlers = [];
ui.svgPlanePath = 'M250.2,59.002c11.001,0,20.176,9.165,20.176,20.777v122.24l171.12,95.954v42.779l-171.12-49.501v89.227l40.337,29.946v35.446l-60.52-20.18-60.502,20.166v-35.45l40.341-29.946v-89.227l-171.14,49.51v-42.779l171.14-95.954v-122.24c0-11.612,9.15-20.777,20.16-20.777z';
ui.svgPlaneStyles = {
    traffic: {
        path: ui.svgPlanePath,
        fillColor: '#9abcc8',
        fillOpacity: 1,
        scale: 0.05,
        strokeColor: '#4a68b8',
        strokeWeight: 1,
        anchor: [250, 250],
    },
    blue: {
        path: ui.svgPlanePath,
        fillColor: '#19abff',
        fillOpacity: 1,
        scale: 0.06,
        strokeColor: '#162b63',
        strokeWeight: 1,
        anchor: [250, 250],
    },
    yellow: {
        path: ui.svgPlanePath,
        fillColor: '#dbb33c',
        fillOpacity: 1,
        scale: 0.07,
        strokeColor: '#5d4c1a',
        strokeWeight: 1,
        anchor: [250, 250],
    },
};
ui.init = function() {
    ui.mouseUpHandler = function(a) {
        if (ui.dragging) {
            if (ui.resizeV || ui.resizeH) {
                ui.dragging.resize && ui.dragging.resize(),
                    ui.resizeV = null,
                    ui.resizeH = null,
                    ui.dragging.style.cursor = 'default';
            }
            ui.dragging = null;
        }
        ui.runMouseUpHandlers(a);
    };
    $(document).mouseup(ui.mouseUpHandler);
    $('.geofs-ui-3dview, .geofs-canvas-mouse-overlay').on('click', () => {
        window.focus();
        document.activeElement && document.activeElement.blur();
    });
    $(document).on('contextmenu', '.geofs-canvas-mouse-overlay', (a) => {
        a.preventDefault();
    });
    ui.hud.init();
};
ui.expandLeft = function() {
    geofs.handleResize();
};
ui.collapseLeft = function(a) {
    geofs.handleResize();
};
ui.addMouseUpHandler = function(a) {
    ui.mouseUpHandlers.push(a);
};
ui.runMouseUpHandlers = function(a) {
    for (let b = 0; b < ui.mouseUpHandlers.length; b++) {
        try {
            ui.mouseUpHandlers[b](a);
        } catch (c) {
            geofs.debug.error(c, 'ui.runMouseUpHandlers');
        }
    }
};
ui.Text = function(a, b) {
    b = $.extend({}, this.defaultOptions, b);
    b.text = `${a}`;
    this._overlay = new geofs.api.cssTransform(b);
};
ui.Text.prototype = {
    defaultOptions: {
        rescale: !1,
        anchor: {
            x: 0,
            y: 0,
        },
    },
    show() {
        this._overlay.setVisibility(!0);
    },
    hide() {
        this._overlay.setVisibility(!1);
    },
    setText(a) {
        this._overlay.setText(a);
    },
    destroy() {
        this._overlay.destroy();
    },
};
ui.initPlayerList = function() {};
ui.notification = {};
ui.notification.show = function(a) {
    geofs.api.notify(a);
};
ui.vr = function(a) {
    a ? ($('body').addClass('geofs-vr'),
        camera.set(1, 'cockpit')) : $(body).removeClass('geofs-vr');
    instruments.toggle();
    geofs.api.vr(a);
    geofs.vr = a;
};
ui.createMap = function(a) {
    if (geofs.aircraft && geofs.aircraft.instance) {
        var b = geofs.aircraft.instance.llaLocation[0];
        var c = geofs.aircraft.instance.llaLocation[1];
    } else {
        b = a.lat,
            c = a.lon;
    }
    ui.mapInstance ? (ui.mapInstance.startMap(),
        ui.mapInstance.updateMap(b, c)) : ui.mapInstance = new map(a, b, c);
};

export default ui;