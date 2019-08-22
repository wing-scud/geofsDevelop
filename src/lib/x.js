x.prototype = {
  clone() {
    return new x(this.x, this.y);
  },
  add(t) {
    return this.clone()._add(w(t));
  },
  _add(t) {
    return this.x += t.x,
    this.y += t.y,
    this;
  },
  subtract(t) {
    return this.clone()._subtract(w(t));
  },
  _subtract(t) {
    return this.x -= t.x,
    this.y -= t.y,
    this;
  },
  divideBy(t) {
    return this.clone()._divideBy(t);
  },
  _divideBy(t) {
    return this.x /= t,
    this.y /= t,
    this;
  },
  multiplyBy(t) {
    return this.clone()._multiplyBy(t);
  },
  _multiplyBy(t) {
    return this.x *= t,
    this.y *= t,
    this;
  },
  scaleBy(t) {
    return new x(this.x * t.x, this.y * t.y);
  },
  unscaleBy(t) {
    return new x(this.x / t.x, this.y / t.y);
  },
  round() {
    return this.clone()._round();
  },
  _round() {
    return this.x = Math.round(this.x),
    this.y = Math.round(this.y),
    this;
  },
  floor() {
    return this.clone()._floor();
  },
  _floor() {
    return this.x = Math.floor(this.x),
    this.y = Math.floor(this.y),
    this;
  },
  ceil() {
    return this.clone()._ceil();
  },
  _ceil() {
    return this.x = Math.ceil(this.x),
    this.y = Math.ceil(this.y),
    this;
  },
  trunc() {
    return this.clone()._trunc();
  },
  _trunc() {
    return this.x = li(this.x),
    this.y = li(this.y),
    this;
  },
  distanceTo(t) {
    let i = (t = w(t)).x - this.x,
      e = t.y - this.y;
    return Math.sqrt(i * i + e * e);
  },
  equals(t) {
    return (t = w(t)).x === this.x && t.y === this.y;
  },
  contains(t) {
    return t = w(t),
    Math.abs(t.x) <= Math.abs(this.x) && Math.abs(t.y) <= Math.abs(this.y);
  },
  toString() {
    return `Point(${a(this.x)}, ${a(this.y)})`;
  },
};
P.prototype = {
  extend(t) {
    return t = w(t),
    this.min || this.max ? (this.min.x = Math.min(t.x, this.min.x),
    this.max.x = Math.max(t.x, this.max.x),
    this.min.y = Math.min(t.y, this.min.y),
    this.max.y = Math.max(t.y, this.max.y)) : (this.min = t.clone(),
    this.max = t.clone()),
    this;
  },
  getCenter(t) {
    return new x((this.min.x + this.max.x) / 2, (this.min.y + this.max.y) / 2, t);
  },
  getBottomLeft() {
    return new x(this.min.x, this.max.y);
  },
  getTopRight() {
    return new x(this.max.x, this.min.y);
  },
  getTopLeft() {
    return this.min;
  },
  getBottomRight() {
    return this.max;
  },
  getSize() {
    return this.max.subtract(this.min);
  },
  contains(t) {
    let i,
      e;
    return (t = typeof t[0] === 'number' || t instanceof x ? w(t) : b(t)) instanceof P ? (i = t.min,
    e = t.max) : i = e = t,
    i.x >= this.min.x && e.x <= this.max.x && i.y >= this.min.y && e.y <= this.max.y;
  },
  intersects(t) {
    t = b(t);
    let i = this.min,
      e = this.max,
      n = t.min,
      o = t.max,
      s = o.x >= i.x && n.x <= e.x,
      r = o.y >= i.y && n.y <= e.y;
    return s && r;
  },
  overlaps(t) {
    t = b(t);
    let i = this.min,
      e = this.max,
      n = t.min,
      o = t.max,
      s = o.x > i.x && n.x < e.x,
      r = o.y > i.y && n.y < e.y;
    return s && r;
  },
  isValid() {
    return !(!this.min || !this.max);
  },
},
T.prototype = {
  extend(t) {
    let i,
      e,
      n = this._southWest,
      o = this._northEast;
    if (t instanceof M) {
      i = t,
      e = t;
    } else {
      if (!(t instanceof T)) { return t ? this.extend(C(t) || z(t)) : this; }
      if (i = t._southWest,
      e = t._northEast,
      !i || !e) { return this; }
    }
    return n || o ? (n.lat = Math.min(i.lat, n.lat),
    n.lng = Math.min(i.lng, n.lng),
    o.lat = Math.max(e.lat, o.lat),
    o.lng = Math.max(e.lng, o.lng)) : (this._southWest = new M(i.lat, i.lng),
    this._northEast = new M(e.lat, e.lng)),
    this;
  },
  pad(t) {
    let i = this._southWest,
      e = this._northEast,
      n = Math.abs(i.lat - e.lat) * t,
      o = Math.abs(i.lng - e.lng) * t;
    return new T(new M(i.lat - n, i.lng - o), new M(e.lat + n, e.lng + o));
  },
  getCenter() {
    return new M((this._southWest.lat + this._northEast.lat) / 2, (this._southWest.lng + this._northEast.lng) / 2);
  },
  getSouthWest() {
    return this._southWest;
  },
  getNorthEast() {
    return this._northEast;
  },
  getNorthWest() {
    return new M(this.getNorth(), this.getWest());
  },
  getSouthEast() {
    return new M(this.getSouth(), this.getEast());
  },
  getWest() {
    return this._southWest.lng;
  },
  getSouth() {
    return this._southWest.lat;
  },
  getEast() {
    return this._northEast.lng;
  },
  getNorth() {
    return this._northEast.lat;
  },
  contains(t) {
    t = typeof t[0] === 'number' || t instanceof M || 'lat' in t ? C(t) : z(t);
    let i,
      e,
      n = this._southWest,
      o = this._northEast;
    return t instanceof T ? (i = t.getSouthWest(),
    e = t.getNorthEast()) : i = e = t,
    i.lat >= n.lat && e.lat <= o.lat && i.lng >= n.lng && e.lng <= o.lng;
  },
  intersects(t) {
    t = z(t);
    let i = this._southWest,
      e = this._northEast,
      n = t.getSouthWest(),
      o = t.getNorthEast(),
      s = o.lat >= i.lat && n.lat <= e.lat,
      r = o.lng >= i.lng && n.lng <= e.lng;
    return s && r;
  },
  overlaps(t) {
    t = z(t);
    let i = this._southWest,
      e = this._northEast,
      n = t.getSouthWest(),
      o = t.getNorthEast(),
      s = o.lat > i.lat && n.lat < e.lat,
      r = o.lng > i.lng && n.lng < e.lng;
    return s && r;
  },
  toBBoxString() {
    return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(',');
  },
  equals(t, i) {
    return !!t && (t = z(t),
    this._southWest.equals(t.getSouthWest(), i) && this._northEast.equals(t.getNorthEast(), i));
  },
  isValid() {
    return !(!this._southWest || !this._northEast);
  },
},
M.prototype = {
  equals(t, i) {
    return !!t && (t = C(t),
    Math.max(Math.abs(this.lat - t.lat), Math.abs(this.lng - t.lng)) <= (void 0 === i ? 1e-9 : i));
  },
  toString(t) {
    return `LatLng(${a(this.lat, t)}, ${a(this.lng, t)})`;
  },
  distanceTo(t) {
    return _i.distance(this, C(t));
  },
  wrap() {
    return _i.wrapLatLng(this);
  },
  toBounds(t) {
    let i = 180 * t / 40075017,
      e = i / Math.cos(Math.PI / 180 * this.lat);
    return z([this.lat - i, this.lng - e], [this.lat + i, this.lng + e]);
  },
  clone() {
    return new M(this.lat, this.lng, this.alt);
  },
};
export { x, M, P, T };
