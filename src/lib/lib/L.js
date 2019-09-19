
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