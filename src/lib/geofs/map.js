a.b.xxxfunction =
map = {};
ui.createMap = function (a) {
  if (geofs.aircraft && geofs.aircraft.instance) {
    var b = geofs.aircraft.instance.llaLocation[0];
    var c = geofs.aircraft.instance.llaLocation[1];
  } else {
    b = a.lat,
    c = a.lon;
  }
  ui.mapInstance ? (ui.mapInstance.startMap(),
  ui.mapInstance.updateMap(b, c)) : ui.mapInstance = new map(a, b, c);
}
;
map = function (a, b, c) {
  this.dontMoveTimeoutValue = 1E4;
  this._options = a = a || {};
  this.apiMap = new geofs.api.map(a, b, c);
  a.standalone || (this.planeMarker = new geofs.api.map.planeMarker(b, c, this.apiMap, 'yellow', 100, 'Here I am'));
  this.setMapInfoWindow();
  a.norunways || this.addRunways();
  a.standalone ? this.mapActive = !0 : this.startMap();
  this.apiMap.init();
}
;
map.prototype = {
  addRunways() {
    const a = this;
    $.getJSON(`${geofs.localUrl}data/runways.json`, (b) => {
      b.forEach((b) => {
        geofs.api.map.addRunwayMarker(b, a.apiMap);
      });
      a.apiMap.updateMarkerLayers();
    });
  },
  setMapInfoWindow() {
    const a = this;
    this.apiMap.setGenericLocationPopup();
    $(this.apiMap._holder).on('click', (b) => {
      try {
        a.apiMap.mapClickHandler && (a.apiMap.mapClickHandler(b),
        a.stopMovingMap());
      } catch (c) {}
    }).mousedown(() => {
      a.stopMovingMap(!0);
    }).mouseup(() => {
      a.stopMovingMap();
    });
  },
  stopMap() {
    this.mapUpdateInterval && (clearInterval(this.mapUpdateInterval),
    this.mapUpdateInterval = null);
    this.mapActive = !1;
  },
  startMap() {
    const a = this;
    this.stopMap();
    this.mapActive = !0;
    this.mapUpdateInterval = setInterval(() => {
      try {
        a.updateMap(geofs.aircraft.instance.llaLocation[0], geofs.aircraft.instance.llaLocation[1]);
      } catch (b) {
        geofs.debug.error(b, 'this.mapUpdateInterval');
      }
    }, 1E3);
  },
  stopMovingMap(a) {
    const b = this;
    this.dontMoveTimeout && clearTimeout(this.dontMoveTimeout);
    a || (this.dontMoveTimeout = setTimeout(() => {
      b.dontMove = !1;
    }, this.dontMoveTimeoutValue));
    this.dontMove = !0;
  },
  updateMap(a, b) {
    this.apiMap && this.mapActive && !geofs.pause && !geofs.absolutePause && (this.dontMove || this.apiMap.updateMap(a, b),
    this.planeMarker.updatePlaneMarker(a, b, geofs.aircraft.instance.htr[0]));
  },
  addPlayerMarker(a, b, c) {
    b = new geofs.api.map.planeMarker(0, 0, this.apiMap, b, 1, c || '');
    return this.apiMap.map && this.mapActive && b ? ui.playerMarkers[a] = b : ui.playerMarkers[a] = null;
  },
  updatePlayerMarker(a, b, c, d, e, f) {
    this.apiMap.map && this.mapActive && (ui.playerMarkers[a] || this.addPlayerMarker(a, d, c),
    ui.playerMarkers[a] && (d = parseInt(b[2] * METERS_TO_FEET),
    ui.playerMarkers[a].updatePlaneMarker(b[0], b[1], b[3], `${c} (${e != 'unknown' ? e : ''})\n${d}ft.\n${f}kts.`)));
  },
  deletePlayerMarker(a) {
    this.apiMap.map && ui.playerMarkers[a] && ui.playerMarkers[a].destoryPlaneMarker();
    ui.playerMarkers[a] = null;
    delete ui.playerMarkers[a];
  },
};
export default map;
