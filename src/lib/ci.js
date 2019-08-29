var ci = {
  latLngToPoint(t, i) {
    let e = this.projection.project(t),
      n = this.scale(i);
    return this.transformation._transform(e, n);
  },
  pointToLatLng(t, i) {
    let e = this.scale(i),
      n = this.transformation.untransform(t, e);
    return this.projection.unproject(n);
  },
  project(t) {
    return this.projection.project(t);
  },
  unproject(t) {
    return this.projection.unproject(t);
  },
  scale(t) {
    return 256 * Math.pow(2, t);
  },
  zoom(t) {
    return Math.log(t / 256) / Math.LN2;
  },
  getProjectedBounds(t) {
    if (this.infinite) { return null; }
    let i = this.projection.bounds,
      e = this.scale(t);
    return new P(this.transformation.transform(i.min, e), this.transformation.transform(i.max, e));
  },
  infinite: !1,
  wrapLatLng(t) {
    const i = this.wrapLng ? s(t.lng, this.wrapLng, !0) : t.lng;
    return new M(this.wrapLat ? s(t.lat, this.wrapLat, !0) : t.lat, i, t.alt);
  },
  wrapLatLngBounds(t) {
    let i = t.getCenter(),
      e = this.wrapLatLng(i),
      n = i.lat - e.lat,
      o = i.lng - e.lng;
    if (n === 0 && o === 0) { return t; }
    let s = t.getSouthWest(),
      r = t.getNorthEast();
    return new T(new M(s.lat - n, s.lng - o), new M(r.lat - n, r.lng - o));
  },
};
di = {
  R: 6378137,
  MAX_LATITUDE: 85.0511287798,
  project(t) {
    let i = Math.PI / 180,
      e = this.MAX_LATITUDE,
      n = Math.max(Math.min(e, t.lat), -e),
      o = Math.sin(n * i);
    return new x(this.R * t.lng * i, this.R * Math.log((1 + o) / (1 - o)) / 2);
  },
  unproject(t) {
    const i = 180 / Math.PI;
    return new M((2 * Math.atan(Math.exp(t.y / this.R)) - Math.PI / 2) * i, t.x * i / this.R);
  },
  bounds: (function () {
    const t = 6378137 * Math.PI;
    return new P([-t, -t], [t, t]);
  }()),
};
export { ci, di };
