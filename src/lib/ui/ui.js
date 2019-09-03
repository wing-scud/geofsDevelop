
import panel from './panel';
import chat from './chat';
import hud from './hud';
import geofs from '../geofs/geofs'
import multiplayer from "../multiplayer"
import camera from "../camera"
import {DEGREES_TO_RAD} from "../geofs/utils"
var ui = window.ui ||{
};

ui.panel=panel;
ui.chat=chat;
ui.hud=hud;
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
    ui.panel.init();
    ui.hud.init();
    ui.chat.init();
    $(document).on('keydown', '.geofs-stopKeyboardPropagation', (a) => {
        a.stopImmediatePropagation();
    });
    $(document).on('keyup', '.geofs-stopKeyupPropagation', (a) => {
        a.stopImmediatePropagation();
    });
    $(document).on('click', '.geofs-stopMousePropagation', (a) => {
        a.stopImmediatePropagation();
    });
    $(document).on('click', '[data-aircraft]', function() {
        geofs.aircraft.instance.change($(this).attr('data-aircraft'));
        ui.panel.hide(null, !0);
        event.stopPropagation();
    });
    $(document).on('click', '[data-camera]', function() {
        eval($(this).attr('data-camera'));
    });
    $(document).on('click', '[data-location]', function(a) {
        eval($(this).attr('data-location'));
        ui.panel.hide(null, !0);
        a.stopPropagation();
    });
    $(document).on('click', '[data-player]', function(a) {
        a = $(this).attr('data-player');
        const b = multiplayer.users[a].getCoordinates();
        b[0] -= 0.003 * Math.cos(b[3] * DEGREES_TO_RAD);
        b[1] -= 0.003 * Math.sin(b[3] * DEGREES_TO_RAD);
        multiplayer.users[a].isOnGround() && (b[2] = 0);
        b && (b[4] = !0,
            geofs.flyTo(b));
    });
    $(document).on('keydown', '.address-input', (a) => {
        a.stopImmediatePropagation();
    });
    $(document).on('submit', '.geofs-locationForm', (a) => {
        geoDecodeLocation($('.address-input').val(), (a, c) => {
            geofs != null && geofs.aircraft.instance != null && geofs.flyTo([a, c, 1E3, 0]);
        });
        $('.address-input').val('');
        ui.collapseLeft();
        a.preventDefault();
    });
};
ui.toggleButton = function(a, b) {
    (b = void 0 == b ? !$(a).hasClass('mdl-button--colored') : b) ? $(a).addClass('mdl-button--colored'): $(a).removeClass('mdl-button--colored');
};
ui.expandLeft = function() {
    $('body').addClass('geofs-expand-left');
    geofs.handleResize();
};
ui.collapseLeft = function(a) {
    $('body').removeClass('geofs-expand-left');
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

ui.closePreferencePanel = function() {
    ui.panel.hide('.geofs-preference-list', !0);
};
export default ui;