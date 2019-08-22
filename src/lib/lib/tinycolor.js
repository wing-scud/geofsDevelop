!(function (i, e) {
  typeof define === 'function' && define.amd ? define(['leaflet'], e) : e(typeof module === 'object' && module.exports ? require('leaflet') : i.L);
}(this, (i) => {
  i.TileLayer.Fallback = i.TileLayer.extend({
    options: {
      minNativeZoom: 0,
    },
    initialize(e, r) {
      i.TileLayer.prototype.initialize.call(this, e, r);
    },
    createTile(e, r) {
      const t = i.TileLayer.prototype.createTile.call(this, e, r);
      return t._originalCoords = e,
      t._originalSrc = t.src,
      t;
    },
    _createCurrentCoords(i) {
      const e = this._wrapCoords(i);
      return e.fallback = !0,
      e;
    },
    _originalTileOnError: i.TileLayer.prototype._tileOnError,
    _tileOnError(i, e, r) {
      let t,
        l,
        o,
        a = this,
        n = e._originalCoords,
        c = e._currentCoords = e._currentCoords || a._createCurrentCoords(n),
        s = e._fallbackZoom = void 0 === e._fallbackZoom ? n.z - 1 : e._fallbackZoom - 1,
        f = e._fallbackScale = 2 * (e._fallbackScale || 1),
        p = a.getTileSize(),
        u = e.style;
      if (s < a.options.minNativeZoom) { return this._originalTileOnError(i, e, r); }
      c.z = s,
      c.x = Math.floor(c.x / 2),
      c.y = Math.floor(c.y / 2),
      t = a.getTileUrl(c),
      u.width = `${p.x * f}px`,
      u.height = `${p.y * f}px`,
      l = (n.y - c.y * f) * p.y,
      u.marginTop = `${-l}px`,
      o = (n.x - c.x * f) * p.x,
      u.marginLeft = `${-o}px`,
      u.clip = `rect(${l}px ${o + p.x}px ${l + p.y}px ${o}px)`,
      a.fire('tilefallback', {
        tile: e,
        url: e._originalSrc,
        urlMissing: e.src,
        urlFallback: t,
      }),
      e.src = t;
    },
    getTileUrl(e) {
      let r = e.z = e.fallback ? e.z : this._getZoomForUrl(),
        t = {
          r: i.Browser.retina ? '@2x' : '',
          s: this._getSubdomain(e),
          x: e.x,
          y: e.y,
          z: r,
        };
      if (this._map && !this._map.options.crs.infinite) {
        const l = this._globalTileRange.max.y - e.y;
        this.options.tms && (t.y = l),
        t['-y'] = l;
      }
      return i.Util.template(this._url, i.extend(t, this.options));
    },
  }),
  i.tileLayer.fallback = function (e, r) {
    return new i.TileLayer.Fallback(e, r);
  };
}));


!(function (a) {
  function b(a, d) {
    if (a = a || '',
    d = d || {},
    a instanceof b) { return a; }
    if (!(this instanceof b)) { return new b(a, d); }
    const e = c(a);
    this._originalInput = a,
    this._r = e.r,
    this._g = e.g,
    this._b = e.b,
    this._a = e.a,
    this._roundA = P(100 * this._a) / 100,
    this._format = d.format || e.format,
    this._gradientType = d.gradientType,
    this._r < 1 && (this._r = P(this._r)),
    this._g < 1 && (this._g = P(this._g)),
    this._b < 1 && (this._b = P(this._b)),
    this._ok = e.ok,
    this._tc_id = O++;
  }
  function c(a) {
    let b = {
        r: 0,
        g: 0,
        b: 0,
      },
      c = 1,
      e = null,
      g = null,
      i = null,
      j = !1,
      k = !1;
    return typeof a === 'string' && (a = K(a)),
    typeof a === 'object' && (J(a.r) && J(a.g) && J(a.b) ? (b = d(a.r, a.g, a.b),
    j = !0,
    k = String(a.r).substr(-1) === '%' ? 'prgb' : 'rgb') : J(a.h) && J(a.s) && J(a.v) ? (e = G(a.s),
    g = G(a.v),
    b = h(a.h, e, g),
    j = !0,
    k = 'hsv') : J(a.h) && J(a.s) && J(a.l) && (e = G(a.s),
    i = G(a.l),
    b = f(a.h, e, i),
    j = !0,
    k = 'hsl'),
    a.hasOwnProperty('a') && (c = a.a)),
    c = z(c),
    {
      ok: j,
      format: a.format || k,
      r: Q(255, R(b.r, 0)),
      g: Q(255, R(b.g, 0)),
      b: Q(255, R(b.b, 0)),
      a: c,
    };
  }
  function d(a, b, c) {
    return {
      r: 255 * A(a, 255),
      g: 255 * A(b, 255),
      b: 255 * A(c, 255),
    };
  }
  function e(a, b, c) {
    a = A(a, 255),
    b = A(b, 255),
    c = A(c, 255);
    let d,
      e,
      f = R(a, b, c),
      g = Q(a, b, c),
      h = (f + g) / 2;
    if (f == g) { d = e = 0; } else {
      const i = f - g;
      switch (e = h > 0.5 ? i / (2 - f - g) : i / (f + g),
      f) {
        case a:
          d = (b - c) / i + (c > b ? 6 : 0);
          break;
        case b:
          d = (c - a) / i + 2;
          break;
        case c:
          d = (a - b) / i + 4;
      }
      d /= 6;
    }
    return {
      h: d,
      s: e,
      l: h,
    };
  }
  function f(a, b, c) {
    function d(a, b, c) {
      return c < 0 && (c += 1),
      c > 1 && (c -= 1),
      1 / 6 > c ? a + 6 * (b - a) * c : c < 0.5 ? b : 2 / 3 > c ? a + 6 * (b - a) * (2 / 3 - c) : a;
    }
    let e,
      f,
      g;
    if (a = A(a, 360),
    b = A(b, 100),
    c = A(c, 100),
    b === 0) { e = f = g = c; } else {
      let h = c < 0.5 ? c * (1 + b) : c + b - c * b,
        i = 2 * c - h;
      e = d(i, h, a + 1 / 3),
      f = d(i, h, a),
      g = d(i, h, a - 1 / 3);
    }
    return {
      r: 255 * e,
      g: 255 * f,
      b: 255 * g,
    };
  }
  function g(a, b, c) {
    a = A(a, 255),
    b = A(b, 255),
    c = A(c, 255);
    let d,
      e,
      f = R(a, b, c),
      g = Q(a, b, c),
      h = f,
      i = f - g;
    if (e = f === 0 ? 0 : i / f,
    f == g) { d = 0; } else {
      switch (f) {
        case a:
          d = (b - c) / i + (c > b ? 6 : 0);
          break;
        case b:
          d = (c - a) / i + 2;
          break;
        case c:
          d = (a - b) / i + 4;
      }
      d /= 6;
    }
    return {
      h: d,
      s: e,
      v: h,
    };
  }
  function h(b, c, d) {
    b = 6 * A(b, 360),
    c = A(c, 100),
    d = A(d, 100);
    let e = a.floor(b),
      f = b - e,
      g = d * (1 - c),
      h = d * (1 - f * c),
      i = d * (1 - (1 - f) * c),
      j = e % 6,
      k = [d, h, g, g, i, d][j],
      l = [i, d, d, h, g, g][j],
      m = [g, g, i, d, d, h][j];
    return {
      r: 255 * k,
      g: 255 * l,
      b: 255 * m,
    };
  }
  function i(a, b, c, d) {
    const e = [F(P(a).toString(16)), F(P(b).toString(16)), F(P(c).toString(16))];
    return d && e[0].charAt(0) == e[0].charAt(1) && e[1].charAt(0) == e[1].charAt(1) && e[2].charAt(0) == e[2].charAt(1) ? e[0].charAt(0) + e[1].charAt(0) + e[2].charAt(0) : e.join('');
  }
  function j(a, b, c, d, e) {
    const f = [F(P(a).toString(16)), F(P(b).toString(16)), F(P(c).toString(16)), F(H(d))];
    return e && f[0].charAt(0) == f[0].charAt(1) && f[1].charAt(0) == f[1].charAt(1) && f[2].charAt(0) == f[2].charAt(1) && f[3].charAt(0) == f[3].charAt(1) ? f[0].charAt(0) + f[1].charAt(0) + f[2].charAt(0) + f[3].charAt(0) : f.join('');
  }
  function k(a, b, c, d) {
    const e = [F(H(d)), F(P(a).toString(16)), F(P(b).toString(16)), F(P(c).toString(16))];
    return e.join('');
  }
  function l(a, c) {
    c = c === 0 ? 0 : c || 10;
    const d = b(a).toHsl();
    return d.s -= c / 100,
    d.s = B(d.s),
    b(d);
  }
  function m(a, c) {
    c = c === 0 ? 0 : c || 10;
    const d = b(a).toHsl();
    return d.s += c / 100,
    d.s = B(d.s),
    b(d);
  }
  function n(a) {
    return b(a).desaturate(100);
  }
  function o(a, c) {
    c = c === 0 ? 0 : c || 10;
    const d = b(a).toHsl();
    return d.l += c / 100,
    d.l = B(d.l),
    b(d);
  }
  function p(a, c) {
    c = c === 0 ? 0 : c || 10;
    const d = b(a).toRgb();
    return d.r = R(0, Q(255, d.r - P(255 * -(c / 100)))),
    d.g = R(0, Q(255, d.g - P(255 * -(c / 100)))),
    d.b = R(0, Q(255, d.b - P(255 * -(c / 100)))),
    b(d);
  }
  function q(a, c) {
    c = c === 0 ? 0 : c || 10;
    const d = b(a).toHsl();
    return d.l -= c / 100,
    d.l = B(d.l),
    b(d);
  }
  function r(a, c) {
    let d = b(a).toHsl(),
      e = (d.h + c) % 360;
    return d.h = e < 0 ? 360 + e : e,
    b(d);
  }
  function s(a) {
    const c = b(a).toHsl();
    return c.h = (c.h + 180) % 360,
    b(c);
  }
  function t(a) {
    let c = b(a).toHsl(),
      d = c.h;
    return [b(a), b({
      h: (d + 120) % 360,
      s: c.s,
      l: c.l,
    }), b({
      h: (d + 240) % 360,
      s: c.s,
      l: c.l,
    })];
  }
  function u(a) {
    let c = b(a).toHsl(),
      d = c.h;
    return [b(a), b({
      h: (d + 90) % 360,
      s: c.s,
      l: c.l,
    }), b({
      h: (d + 180) % 360,
      s: c.s,
      l: c.l,
    }), b({
      h: (d + 270) % 360,
      s: c.s,
      l: c.l,
    })];
  }
  function v(a) {
    let c = b(a).toHsl(),
      d = c.h;
    return [b(a), b({
      h: (d + 72) % 360,
      s: c.s,
      l: c.l,
    }), b({
      h: (d + 216) % 360,
      s: c.s,
      l: c.l,
    })];
  }
  function w(a, c, d) {
    c = c || 6,
    d = d || 30;
    let e = b(a).toHsl(),
      f = 360 / d,
      g = [b(a)];
    for (e.h = (e.h - (f * c >> 1) + 720) % 360; --c;) {
      e.h = (e.h + f) % 360,
      g.push(b(e));
    }
    return g;
  }
  function x(a, c) {
    c = c || 6;
    for (var d = b(a).toHsv(), e = d.h, f = d.s, g = d.v, h = [], i = 1 / c; c--;) {
      h.push(b({
        h: e,
        s: f,
        v: g,
      })),
      g = (g + i) % 1;
    }
    return h;
  }
  function y(a) {
    const b = {};
    for (const c in a) { a.hasOwnProperty(c) && (b[a[c]] = c); }
    return b;
  }
  function z(a) {
    return a = parseFloat(a),
    (isNaN(a) || a < 0 || a > 1) && (a = 1),
    a;
  }
  function A(b, c) {
    D(b) && (b = '100%');
    const d = E(b);
    return b = Q(c, R(0, parseFloat(b))),
    d && (b = parseInt(b * c, 10) / 100),
    a.abs(b - c) < 1e-6 ? 1 : b % c / parseFloat(c);
  }
  function B(a) {
    return Q(1, R(0, a));
  }
  function C(a) {
    return parseInt(a, 16);
  }
  function D(a) {
    return typeof a === 'string' && a.indexOf('.') != -1 && parseFloat(a) === 1;
  }
  function E(a) {
    return typeof a === 'string' && a.indexOf('%') != -1;
  }
  function F(a) {
    return a.length == 1 ? `0${a}` : `${a}`;
  }
  function G(a) {
    return a <= 1 && (a = `${100 * a}%`),
    a;
  }
  function H(b) {
    return a.round(255 * parseFloat(b)).toString(16);
  }
  function I(a) {
    return C(a) / 255;
  }
  function J(a) {
    return !!V.CSS_UNIT.exec(a);
  }
  function K(a) {
    a = a.replace(M, '').replace(N, '').toLowerCase();
    let b = !1;
    if (T[a]) {
      a = T[a],
      b = !0;
    } else if (a == 'transparent') {
      return {
        r: 0,
        g: 0,
        b: 0,
        a: 0,
        format: 'name',
      };
    }
    let c;
    return (c = V.rgb.exec(a)) ? {
      r: c[1],
      g: c[2],
      b: c[3],
    } : (c = V.rgba.exec(a)) ? {
      r: c[1],
      g: c[2],
      b: c[3],
      a: c[4],
    } : (c = V.hsl.exec(a)) ? {
      h: c[1],
      s: c[2],
      l: c[3],
    } : (c = V.hsla.exec(a)) ? {
      h: c[1],
      s: c[2],
      l: c[3],
      a: c[4],
    } : (c = V.hsv.exec(a)) ? {
      h: c[1],
      s: c[2],
      v: c[3],
    } : (c = V.hsva.exec(a)) ? {
      h: c[1],
      s: c[2],
      v: c[3],
      a: c[4],
    } : (c = V.hex8.exec(a)) ? {
      r: C(c[1]),
      g: C(c[2]),
      b: C(c[3]),
      a: I(c[4]),
      format: b ? 'name' : 'hex8',
    } : (c = V.hex6.exec(a)) ? {
      r: C(c[1]),
      g: C(c[2]),
      b: C(c[3]),
      format: b ? 'name' : 'hex',
    } : (c = V.hex4.exec(a)) ? {
      r: C(`${c[1]}${c[1]}`),
      g: C(`${c[2]}${c[2]}`),
      b: C(`${c[3]}${c[3]}`),
      a: I(`${c[4]}${c[4]}`),
      format: b ? 'name' : 'hex8',
    } : (c = V.hex3.exec(a)) ? {
      r: C(`${c[1]}${c[1]}`),
      g: C(`${c[2]}${c[2]}`),
      b: C(`${c[3]}${c[3]}`),
      format: b ? 'name' : 'hex',
    } : !1;
  }
  function L(a) {
    let b,
      c;
    return a = a || {
      level: 'AA',
      size: 'small',
    },
    b = (a.level || 'AA').toUpperCase(),
    c = (a.size || 'small').toLowerCase(),
    b !== 'AA' && b !== 'AAA' && (b = 'AA'),
    c !== 'small' && c !== 'large' && (c = 'small'),
    {
      level: b,
      size: c,
    };
  }
  var M = /^\s+/,
    N = /\s+$/,
    O = 0,
    P = a.round,
    Q = a.min,
    R = a.max,
    S = a.random;
  b.prototype = {
    isDark() {
      return this.getBrightness() < 128;
    },
    isLight() {
      return !this.isDark();
    },
    isValid() {
      return this._ok;
    },
    getOriginalInput() {
      return this._originalInput;
    },
    getFormat() {
      return this._format;
    },
    getAlpha() {
      return this._a;
    },
    getBrightness() {
      const a = this.toRgb();
      return (299 * a.r + 587 * a.g + 114 * a.b) / 1e3;
    },
    getLuminance() {
      let b,
        c,
        d,
        e,
        f,
        g,
        h = this.toRgb();
      return b = h.r / 255,
      c = h.g / 255,
      d = h.b / 255,
      e = b <= 0.03928 ? b / 12.92 : a.pow((b + 0.055) / 1.055, 2.4),
      f = c <= 0.03928 ? c / 12.92 : a.pow((c + 0.055) / 1.055, 2.4),
      g = d <= 0.03928 ? d / 12.92 : a.pow((d + 0.055) / 1.055, 2.4),
      0.2126 * e + 0.7152 * f + 0.0722 * g;
    },
    setAlpha(a) {
      return this._a = z(a),
      this._roundA = P(100 * this._a) / 100,
      this;
    },
    toHsv() {
      const a = g(this._r, this._g, this._b);
      return {
        h: 360 * a.h,
        s: a.s,
        v: a.v,
        a: this._a,
      };
    },
    toHsvString() {
      let a = g(this._r, this._g, this._b),
        b = P(360 * a.h),
        c = P(100 * a.s),
        d = P(100 * a.v);
      return this._a == 1 ? `hsv(${b}, ${c}%, ${d}%)` : `hsva(${b}, ${c}%, ${d}%, ${this._roundA})`;
    },
    toHsl() {
      const a = e(this._r, this._g, this._b);
      return {
        h: 360 * a.h,
        s: a.s,
        l: a.l,
        a: this._a,
      };
    },
    toHslString() {
      let a = e(this._r, this._g, this._b),
        b = P(360 * a.h),
        c = P(100 * a.s),
        d = P(100 * a.l);
      return this._a == 1 ? `hsl(${b}, ${c}%, ${d}%)` : `hsla(${b}, ${c}%, ${d}%, ${this._roundA})`;
    },
    toHex(a) {
      return i(this._r, this._g, this._b, a);
    },
    toHexString(a) {
      return `#${this.toHex(a)}`;
    },
    toHex8(a) {
      return j(this._r, this._g, this._b, this._a, a);
    },
    toHex8String(a) {
      return `#${this.toHex8(a)}`;
    },
    toRgb() {
      return {
        r: P(this._r),
        g: P(this._g),
        b: P(this._b),
        a: this._a,
      };
    },
    toRgbString() {
      return this._a == 1 ? `rgb(${P(this._r)}, ${P(this._g)}, ${P(this._b)})` : `rgba(${P(this._r)}, ${P(this._g)}, ${P(this._b)}, ${this._roundA})`;
    },
    toPercentageRgb() {
      return {
        r: `${P(100 * A(this._r, 255))}%`,
        g: `${P(100 * A(this._g, 255))}%`,
        b: `${P(100 * A(this._b, 255))}%`,
        a: this._a,
      };
    },
    toPercentageRgbString() {
      return this._a == 1 ? `rgb(${P(100 * A(this._r, 255))}%, ${P(100 * A(this._g, 255))}%, ${P(100 * A(this._b, 255))}%)` : `rgba(${P(100 * A(this._r, 255))}%, ${P(100 * A(this._g, 255))}%, ${P(100 * A(this._b, 255))}%, ${this._roundA})`;
    },
    toName() {
      return this._a === 0 ? 'transparent' : this._a < 1 ? !1 : U[i(this._r, this._g, this._b, !0)] || !1;
    },
    toFilter(a) {
      let c = `#${k(this._r, this._g, this._b, this._a)}`,
        d = c,
        e = this._gradientType ? 'GradientType = 1, ' : '';
      if (a) {
        const f = b(a);
        d = `#${k(f._r, f._g, f._b, f._a)}`;
      }
      return `progid:DXImageTransform.Microsoft.gradient(${e}startColorstr=${c},endColorstr=${d})`;
    },
    toString(a) {
      const b = !!a;
      a = a || this._format;
      let c = !1,
        d = this._a < 1 && this._a >= 0,
        e = !b && d && (a === 'hex' || a === 'hex6' || a === 'hex3' || a === 'hex4' || a === 'hex8' || a === 'name');
      return e ? a === 'name' && this._a === 0 ? this.toName() : this.toRgbString() : (a === 'rgb' && (c = this.toRgbString()),
      a === 'prgb' && (c = this.toPercentageRgbString()),
      (a === 'hex' || a === 'hex6') && (c = this.toHexString()),
      a === 'hex3' && (c = this.toHexString(!0)),
      a === 'hex4' && (c = this.toHex8String(!0)),
      a === 'hex8' && (c = this.toHex8String()),
      a === 'name' && (c = this.toName()),
      a === 'hsl' && (c = this.toHslString()),
      a === 'hsv' && (c = this.toHsvString()),
      c || this.toHexString());
    },
    clone() {
      return b(this.toString());
    },
    _applyModification(a, b) {
      const c = a(...[this].concat([].slice.call(b)));
      return this._r = c._r,
      this._g = c._g,
      this._b = c._b,
      this.setAlpha(c._a),
      this;
    },
    lighten() {
      return this._applyModification(o, arguments);
    },
    brighten() {
      return this._applyModification(p, arguments);
    },
    darken() {
      return this._applyModification(q, arguments);
    },
    desaturate() {
      return this._applyModification(l, arguments);
    },
    saturate() {
      return this._applyModification(m, arguments);
    },
    greyscale() {
      return this._applyModification(n, arguments);
    },
    spin() {
      return this._applyModification(r, arguments);
    },
    _applyCombination(a, b) {
      return a(...[this].concat([].slice.call(b)));
    },
    analogous() {
      return this._applyCombination(w, arguments);
    },
    complement() {
      return this._applyCombination(s, arguments);
    },
    monochromatic() {
      return this._applyCombination(x, arguments);
    },
    splitcomplement() {
      return this._applyCombination(v, arguments);
    },
    triad() {
      return this._applyCombination(t, arguments);
    },
    tetrad() {
      return this._applyCombination(u, arguments);
    },
  },
  b.fromRatio = function (a, c) {
    if (typeof a === 'object') {
      const d = {};
      for (const e in a) { a.hasOwnProperty(e) && (d[e] = e === 'a' ? a[e] : G(a[e])); }
      a = d;
    }
    return b(a, c);
  }
  ,
  b.equals = function (a, c) {
    return a && c ? b(a).toRgbString() == b(c).toRgbString() : !1;
  }
  ,
  b.random = function () {
    return b.fromRatio({
      r: S(),
      g: S(),
      b: S(),
    });
  }
  ,
  b.mix = function (a, c, d) {
    d = d === 0 ? 0 : d || 50;
    let e = b(a).toRgb(),
      f = b(c).toRgb(),
      g = d / 100,
      h = {
        r: (f.r - e.r) * g + e.r,
        g: (f.g - e.g) * g + e.g,
        b: (f.b - e.b) * g + e.b,
        a: (f.a - e.a) * g + e.a,
      };
    return b(h);
  }
  ,
  b.readability = function (c, d) {
    let e = b(c),
      f = b(d);
    return (a.max(e.getLuminance(), f.getLuminance()) + 0.05) / (a.min(e.getLuminance(), f.getLuminance()) + 0.05);
  }
  ,
  b.isReadable = function (a, c, d) {
    let e,
      f,
      g = b.readability(a, c);
    switch (f = !1,
    e = L(d),
    e.level + e.size) {
      case 'AAsmall':
      case 'AAAlarge':
        f = g >= 4.5;
        break;
      case 'AAlarge':
        f = g >= 3;
        break;
      case 'AAAsmall':
        f = g >= 7;
    }
    return f;
  }
  ,
  b.mostReadable = function (a, c, d) {
    let e,
      f,
      g,
      h,
      i = null,
      j = 0;
    d = d || {},
    f = d.includeFallbackColors,
    g = d.level,
    h = d.size;
    for (let k = 0; k < c.length; k++) {
      e = b.readability(a, c[k]),
      e > j && (j = e,
      i = b(c[k]));
    }
    return b.isReadable(a, i, {
      level: g,
      size: h,
    }) || !f ? i : (d.includeFallbackColors = !1,
      b.mostReadable(a, ['#fff', '#000'], d));
  }
  ;
  var T = b.names = {
      aliceblue: 'f0f8ff',
      antiquewhite: 'faebd7',
      aqua: '0ff',
      aquamarine: '7fffd4',
      azure: 'f0ffff',
      beige: 'f5f5dc',
      bisque: 'ffe4c4',
      black: '000',
      blanchedalmond: 'ffebcd',
      blue: '00f',
      blueviolet: '8a2be2',
      brown: 'a52a2a',
      burlywood: 'deb887',
      burntsienna: 'ea7e5d',
      cadetblue: '5f9ea0',
      chartreuse: '7fff00',
      chocolate: 'd2691e',
      coral: 'ff7f50',
      cornflowerblue: '6495ed',
      cornsilk: 'fff8dc',
      crimson: 'dc143c',
      cyan: '0ff',
      darkblue: '00008b',
      darkcyan: '008b8b',
      darkgoldenrod: 'b8860b',
      darkgray: 'a9a9a9',
      darkgreen: '006400',
      darkgrey: 'a9a9a9',
      darkkhaki: 'bdb76b',
      darkmagenta: '8b008b',
      darkolivegreen: '556b2f',
      darkorange: 'ff8c00',
      darkorchid: '9932cc',
      darkred: '8b0000',
      darksalmon: 'e9967a',
      darkseagreen: '8fbc8f',
      darkslateblue: '483d8b',
      darkslategray: '2f4f4f',
      darkslategrey: '2f4f4f',
      darkturquoise: '00ced1',
      darkviolet: '9400d3',
      deeppink: 'ff1493',
      deepskyblue: '00bfff',
      dimgray: '696969',
      dimgrey: '696969',
      dodgerblue: '1e90ff',
      firebrick: 'b22222',
      floralwhite: 'fffaf0',
      forestgreen: '228b22',
      fuchsia: 'f0f',
      gainsboro: 'dcdcdc',
      ghostwhite: 'f8f8ff',
      gold: 'ffd700',
      goldenrod: 'daa520',
      gray: '808080',
      green: '008000',
      greenyellow: 'adff2f',
      grey: '808080',
      honeydew: 'f0fff0',
      hotpink: 'ff69b4',
      indianred: 'cd5c5c',
      indigo: '4b0082',
      ivory: 'fffff0',
      khaki: 'f0e68c',
      lavender: 'e6e6fa',
      lavenderblush: 'fff0f5',
      lawngreen: '7cfc00',
      lemonchiffon: 'fffacd',
      lightblue: 'add8e6',
      lightcoral: 'f08080',
      lightcyan: 'e0ffff',
      lightgoldenrodyellow: 'fafad2',
      lightgray: 'd3d3d3',
      lightgreen: '90ee90',
      lightgrey: 'd3d3d3',
      lightpink: 'ffb6c1',
      lightsalmon: 'ffa07a',
      lightseagreen: '20b2aa',
      lightskyblue: '87cefa',
      lightslategray: '789',
      lightslategrey: '789',
      lightsteelblue: 'b0c4de',
      lightyellow: 'ffffe0',
      lime: '0f0',
      limegreen: '32cd32',
      linen: 'faf0e6',
      magenta: 'f0f',
      maroon: '800000',
      mediumaquamarine: '66cdaa',
      mediumblue: '0000cd',
      mediumorchid: 'ba55d3',
      mediumpurple: '9370db',
      mediumseagreen: '3cb371',
      mediumslateblue: '7b68ee',
      mediumspringgreen: '00fa9a',
      mediumturquoise: '48d1cc',
      mediumvioletred: 'c71585',
      midnightblue: '191970',
      mintcream: 'f5fffa',
      mistyrose: 'ffe4e1',
      moccasin: 'ffe4b5',
      navajowhite: 'ffdead',
      navy: '000080',
      oldlace: 'fdf5e6',
      olive: '808000',
      olivedrab: '6b8e23',
      orange: 'ffa500',
      orangered: 'ff4500',
      orchid: 'da70d6',
      palegoldenrod: 'eee8aa',
      palegreen: '98fb98',
      paleturquoise: 'afeeee',
      palevioletred: 'db7093',
      papayawhip: 'ffefd5',
      peachpuff: 'ffdab9',
      peru: 'cd853f',
      pink: 'ffc0cb',
      plum: 'dda0dd',
      powderblue: 'b0e0e6',
      purple: '800080',
      rebeccapurple: '663399',
      red: 'f00',
      rosybrown: 'bc8f8f',
      royalblue: '4169e1',
      saddlebrown: '8b4513',
      salmon: 'fa8072',
      sandybrown: 'f4a460',
      seagreen: '2e8b57',
      seashell: 'fff5ee',
      sienna: 'a0522d',
      silver: 'c0c0c0',
      skyblue: '87ceeb',
      slateblue: '6a5acd',
      slategray: '708090',
      slategrey: '708090',
      snow: 'fffafa',
      springgreen: '00ff7f',
      steelblue: '4682b4',
      tan: 'd2b48c',
      teal: '008080',
      thistle: 'd8bfd8',
      tomato: 'ff6347',
      turquoise: '40e0d0',
      violet: 'ee82ee',
      wheat: 'f5deb3',
      white: 'fff',
      whitesmoke: 'f5f5f5',
      yellow: 'ff0',
      yellowgreen: '9acd32',
    },
    U = b.hexNames = y(T),
    V = (function () {
      let a = '[-\\+]?\\d+%?',
        b = '[-\\+]?\\d*\\.\\d+%?',
        c = `(?:${b})|(?:${a})`,
        d = `[\\s|\\(]+(${c})[,|\\s]+(${c})[,|\\s]+(${c})\\s*\\)?`,
        e = `[\\s|\\(]+(${c})[,|\\s]+(${c})[,|\\s]+(${c})[,|\\s]+(${c})\\s*\\)?`;
      return {
        CSS_UNIT: new RegExp(c),
        rgb: new RegExp(`rgb${d}`),
        rgba: new RegExp(`rgba${e}`),
        hsl: new RegExp(`hsl${d}`),
        hsla: new RegExp(`hsla${e}`),
        hsv: new RegExp(`hsv${d}`),
        hsva: new RegExp(`hsva${e}`),
        hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
        hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
      };
    }());
  typeof module !== 'undefined' && module.exports ? module.exports = b : typeof define === 'function' && define.amd ? define(() => b) : window.tinycolor = b;
}(Math));

