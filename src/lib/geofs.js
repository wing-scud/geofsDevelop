/* eslint-disable */
import geofs from './geofs/geofs';
import ui from './ui/ui';
import camera from './camera';
import instruments from './instruments';
import L from './lib/leaflet'

L.Polyline.plotter = L.Polyline.extend({
    _lineMarkers: [],
    _editIcon: L.divIcon({
        className: 'leaflet-div-icon leaflet-editing-icon',
    }),
    _halfwayPointMarkers: [],
    _existingLatLngs: [],
    options: {
        weight: 2,
        color: '#000',
        readOnly: !1,
    },
    initialize(a, b) {
        this._lineMarkers = [];
        this._halfwayPointMarkers = [];
        this._setExistingLatLngs(a);
        L.Polyline.prototype.initialize.call(this, [], b);
    },
    onAdd(a) {
        L.Polyline.prototype.onAdd.call(this, a);
        this._map = a;
        this._plotExisting();
        this.options.readOnly || this._bindMapClick();
    },
    onRemove(a) {
        this._halfwayPointMarkers.forEach((a) => {
            a.remove()
        });
        this._lineMarkers.forEach((a) => {
            a.remove()
        });
        this._halfwayPointMarkers = this._lineMarkers = [];
        this._unbindMapClick();
        L.Polyline.prototype.onRemove.call(this, a);
    },
    setLatLngs(a) {
        L.Polyline.prototype.setLatLngs.call(this, a);
    },
    setReadOnly(a) {
        if (a && !this.options.readOnly) {
            var b = '_unbindMarkerEvents',
                c = '_unbindHalfwayMarker';
            this._unbindMapClick();
        } else {
            !a && this.options.readOnly && (c = b = '_bindMarkerEvents',
                this._bindMapClick());
        }
        if (typeof b !== 'undefined') {
            this.options.readOnly = a;
            for (index in this._halfwayPointMarkers) { this[c](this._halfwayPointMarkers[index]); }
            for (index in this._lineMarkers) { this[b](this._lineMarkers[index]) };
        }
    },
    _bindMapClick() {
        this._map.on('click', this._onMapClick, this);
    },
    _unbindMapClick() {
        this._map.off('click', this._onMapClick, this);
    },
    _setExistingLatLngs(a) {
        this._existingLatLngs = a;
    },
    _replot() {
        this._redraw();
        this._redrawHalfwayPoints();
    },
    _getNewMarker(a, b) {
        return new L.marker(a, b);
    },
    _unbindMarkerEvents(a) {
        a.off('click', this._removePoint, this);
        a.off('drag', this._replot, this);
        a.dragging.disable();
    },
    _bindMarkerEvents(a) {
        let b = this;
        a.on('mousedown', () => {
            b._screwedUpLeafletEventsBubblingCancellation = !0
        }, this);
        a.on('click', this._removePoint, this);
        a.on('drag', this._replot, this);
        a.dragging.enable();
    },
    _bindHalfwayMarker(a) {
        a.on('click', this._addHalfwayPoint, this);
    },
    _unbindHalfwayMarker(a) {
        a.off('click', this._addHalfwayPoint, this);
    },
    _addToMapAndBindMarker(a) {
        a.addTo(this._map);
        this.options.readOnly || this._bindMarkerEvents(a);
    },
    _removePoint(a) {
        this._map.removeLayer(this._lineMarkers[this._lineMarkers.indexOf(a.target)]);
        this._lineMarkers.splice(this._lineMarkers.indexOf(a.target), 1);
        this._replot();
    },
    _onMapClick(a) {
        this._screwedUpLeafletEventsBubblingCancellation ? this._screwedUpLeafletEventsBubblingCancellation = !1 : (this._addNewMarker(a),
            this._replot());
    },
    _addNewMarker(a) {
        a = this._getNewMarker(a.latlng, {
            icon: this._editIcon,
        });
        this._addToMapAndBindMarker(a);
        this._lineMarkers.push(a);
    },
    _redrawHalfwayPoints() {
        for (index in this._halfwayPointMarkers) { this._map.removeLayer(this._halfwayPointMarkers[index]); }
        this._halfwayPointMarkers = [];
        for (index in this._lineMarkers) {
            index = parseInt(index);
            if (typeof this._lineMarkers[index + 1] === 'undefined') { break; }
            let a = (new L.Marker([(this._lineMarkers[index].getLatLng().lat + this._lineMarkers[index + 1].getLatLng().lat) / 2, (this._lineMarkers[index].getLatLng().lng + this._lineMarkers[index + 1].getLatLng().lng) / 2], {
                icon: this._editIcon,
                opacity: 0.5,
            })).addTo(this._map);
            a.index = index;
            this.options.readOnly || this._bindHalfwayMarker(a);
            this._halfwayPointMarkers.push(a);
        }
    },
    _addHalfwayPoint(a) {
        let b = this._getNewMarker(a.latlng, {
            icon: this._editIcon,
        });
        this._addToMapAndBindMarker(b);
        this._lineMarkers.splice(a.target.index + 1, 0, b);
        this._replot();
    },
    _plotExisting() {
        for (index in this._existingLatLngs) {
            this._addNewMarker({
                latlng: new L.LatLng(this._existingLatLngs[index][0], this._existingLatLngs[index][1])
            });
        }
        this._replot();
    },
    _redraw() {
        this.setLatLngs([]);
        this.redraw();
        for (index in this._lineMarkers) { this.addLatLng(this._lineMarkers[index].getLatLng()); }
        this.redraw();
    },
});
L.Polyline.Plotter = function(a, b) {
    return new L.Polyline.plotter(a, b);
};
// utils v3
Math.sign = function(a) {
    return a < 0 ? -1 : 1;
};
Math.arrayToPrecision = function(a, b) {
    for (let c = a.length; c >= 0; c--) { a[c] && a[c].toFixed && (a[c] = parseFloat(a[c].toFixed(b))); }
    return a;
};
// /geofs utils
// OverLay
geofs.ajax = {};
geofs.ajax.post = function(a, b, c, d) {
    b = JSON.stringify(b);
    return $.ajax({
        type: 'POST',
        url: a,
        crossDomain: !0,
        data: b,
        dataType: 'json',
        success: c,
        error(a, b, c) {
            try {
                d(a, b, c);
            } catch (h) {}
            geofs.debug.error(c, `geofs.ajax.post. POST failed${  b  } - ${  c}`);
        },
    });
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
ui.clearPlayerList = function() {
    $('.geofs-player-list').html('');
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
'use strict';

geofs.fx.lastRunwayTestLocation = [0, 0];
geofs.runways.nearRunways = {};
geofs.fx.litRunways = {};
geofs.fx.particleBillboardOptions = {
    sizeInMeters: !0,
};
geofs.fx.thresholdLightTemplate = [
    [
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 'length'
    ],
    [
        [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1], 12
    ],
    [
        [3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3], 1
    ],
    [
        [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0], 5
    ],
    [
        [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0], 1
    ],
    [
        [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0], 5
    ],
    [
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1], 1
    ],
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 5
    ]
];
geofs.fx.templateCenter = [17, 2];
$('body').on('runwayUpdate', () => {
    geofs.runwaysLights.updateAll();
});
$('body').on('nightChange', () => {
    geofs.runwaysLights.updateAll();
});