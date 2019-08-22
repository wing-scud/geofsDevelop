!(function (t, i) {
  typeof exports === 'object' && typeof module !== 'undefined' ? i(exports) : typeof define === 'function' && define.amd ? define(['exports'], i) : i(t.L = {});
}(this, (t) => {
  function i(t) {
    let i,
      e,
      n,
      o;
    for (e = 1,
    n = arguments.length; e < n; e++) {
      o = arguments[e];
      for (i in o) { t[i] = o[i]; }
    }
    return t;
  }
  function e(t, i) {
    const e = Array.prototype.slice;
    if (t.bind) { return t.bind(...e.call(arguments, 1)); }
    const n = e.call(arguments, 2);
    return function () {
      return t.apply(i, n.length ? n.concat(e.call(arguments)) : arguments);
    };
  }
  function n(t) {
    return t._leaflet_id = t._leaflet_id || ++ti,
    t._leaflet_id;
  }
  function o(t, i, e) {
    let n,
      o,
      s,
      r;
    return r = function () {
      n = !1,
      o && (s.apply(e, o),
      o = !1);
    }
    ,
    s = function () {
      n ? o = arguments : (t.apply(e, arguments),
      setTimeout(r, i),
      n = !0);
    };
  }
  function s(t, i, e) {
    let n = i[1],
      o = i[0],
      s = n - o;
    return t === n && e ? t : ((t - o) % s + s) % s + o;
  }
  function r() {
    return !1;
  }
  function a(t, i) {
    const e = Math.pow(10, void 0 === i ? 6 : i);
    return Math.round(t * e) / e;
  }
  function h(t) {
    return t.trim ? t.trim() : t.replace(/^\s+|\s+$/g, '');
  }
  function u(t) {
    return h(t).split(/\s+/);
  }
  function l(t, i) {
    t.hasOwnProperty('options') || (t.options = t.options ? Qt(t.options) : {});
    for (const e in i) { t.options[e] = i[e]; }
    return t.options;
  }
  function c(t, i, e) {
    const n = [];
    for (const o in t) { n.push(`${encodeURIComponent(e ? o.toUpperCase() : o)}=${encodeURIComponent(t[o])}`); }
    return (i && i.indexOf('?') !== -1 ? '&' : '?') + n.join('&');
  }
  function _(t, i) {
    return t.replace(ii, (t, e) => {
      let n = i[e];
      if (void 0 === n) { throw new Error(`No value provided for variable ${t}`); }
      return typeof n === 'function' && (n = n(i)),
      n;
    });
  }
  function d(t, i) {
    for (let e = 0; e < t.length; e++) {
      if (t[e] === i) { return e; }
    }
    return -1;
  }
  function p(t) {
    return window[`webkit${t}`] || window[`moz${t}`] || window[`ms${t}`];
  }
  function m(t) {
    let i = +new Date(),
      e = Math.max(0, 16 - (i - oi));
    return oi = i + e,
    window.setTimeout(t, e);
  }
  function f(t, i, n) {
    if (!n || si !== m) { return si.call(window, e(t, i)); }
    t.call(i);
  }
  function g(t) {
    t && ri.call(window, t);
  }
  function v() {}
  function y(t) {
    if (typeof L !== 'undefined' && L && L.Mixin) {
      t = ei(t) ? t : [t];
      for (let i = 0; i < t.length; i++) { t[i] === L.Mixin.Events && console.warn('Deprecated include of L.Mixin.Events: this property will be removed in future releases, please inherit from L.Evented instead.', (new Error()).stack); }
    }
  }
  function x(t, i, e) {
    this.x = e ? Math.round(t) : t,
    this.y = e ? Math.round(i) : i;
  }
  function w(t, i, e) {
    return t instanceof x ? t : ei(t) ? new x(t[0], t[1]) : void 0 === t || t === null ? t : typeof t === 'object' && 'x' in t && 'y' in t ? new x(t.x, t.y) : new x(t, i, e);
  }
  function P(t, i) {
    if (t) {
      for (let e = i ? [t, i] : t, n = 0, o = e.length; n < o; n++) { this.extend(e[n]); }
    }
  }
  function b(t, i) {
    return !t || t instanceof P ? t : new P(t, i);
  }
  function T(t, i) {
    if (t) {
      for (let e = i ? [t, i] : t, n = 0, o = e.length; n < o; n++) { this.extend(e[n]); }
    }
  }
  function z(t, i) {
    return t instanceof T ? t : new T(t, i);
  }
  function M(t, i, e) {
    if (isNaN(t) || isNaN(i)) { throw new Error(`Invalid LatLng object: (${t}, ${i})`); }
    this.lat = +t,
    this.lng = +i,
    void 0 !== e && (this.alt = +e);
  }
  function C(t, i, e) {
    return t instanceof M ? t : ei(t) && typeof t[0] !== 'object' ? t.length === 3 ? new M(t[0], t[1], t[2]) : t.length === 2 ? new M(t[0], t[1]) : null : void 0 === t || t === null ? t : typeof t === 'object' && 'lat' in t ? new M(t.lat, 'lng' in t ? t.lng : t.lon, t.alt) : void 0 === i ? null : new M(t, i, e);
  }
  function Z(t, i, e, n) {
    if (ei(t)) {
      return this._a = t[0],
      this._b = t[1],
      this._c = t[2],
      void (this._d = t[3]);
    }
    this._a = t,
    this._b = i,
    this._c = e,
    this._d = n;
  }
  function S(t, i, e, n) {
    return new Z(t, i, e, n);
  }
  function E(t) {
    return document.createElementNS('http://www.w3.org/2000/svg', t);
  }
  function k(t, i) {
    let e,
      n,
      o,
      s,
      r,
      a,
      h = '';
    for (e = 0,
    o = t.length; e < o; e++) {
      for (n = 0,
      s = (r = t[e]).length; n < s; n++) {
        a = r[n],
        h += `${(n ? 'L' : 'M') + a.x} ${a.y}`;
      }
      h += i ? Xi ? 'z' : 'x' : '';
    }
    return h || 'M0 0';
  }
  function A(t) {
    return navigator.userAgent.toLowerCase().indexOf(t) >= 0;
  }
  function I(t, i, e, n) {
    return i === 'touchstart' ? O(t, e, n) : i === 'touchmove' ? W(t, e, n) : i === 'touchend' && H(t, e, n),
    this;
  }
  function B(t, i, e) {
    const n = t[`_leaflet_${i}${e}`];
    return i === 'touchstart' ? t.removeEventListener(Qi, n, !1) : i === 'touchmove' ? t.removeEventListener(te, n, !1) : i === 'touchend' && (t.removeEventListener(ie, n, !1),
    t.removeEventListener(ee, n, !1)),
    this;
  }
  function O(t, i, n) {
    const o = e((t) => {
      if (t.pointerType !== 'mouse' && t.MSPOINTER_TYPE_MOUSE && t.pointerType !== t.MSPOINTER_TYPE_MOUSE) {
        if (!(ne.indexOf(t.target.tagName) < 0)) { return; }
        $(t);
      }
      j(t, i);
    });
    t[`_leaflet_touchstart${n}`] = o,
    t.addEventListener(Qi, o, !1),
    se || (document.documentElement.addEventListener(Qi, R, !0),
    document.documentElement.addEventListener(te, D, !0),
    document.documentElement.addEventListener(ie, N, !0),
    document.documentElement.addEventListener(ee, N, !0),
    se = !0);
  }
  function R(t) {
    oe[t.pointerId] = t,
    re++;
  }
  function D(t) {
    oe[t.pointerId] && (oe[t.pointerId] = t);
  }
  function N(t) {
    delete oe[t.pointerId],
    re--;
  }
  function j(t, i) {
    t.touches = [];
    for (const e in oe) { t.touches.push(oe[e]); }
    t.changedTouches = [t],
    i(t);
  }
  function W(t, i, e) {
    const n = function (t) {
      (t.pointerType !== t.MSPOINTER_TYPE_MOUSE && t.pointerType !== 'mouse' || t.buttons !== 0) && j(t, i);
    };
    t[`_leaflet_touchmove${e}`] = n,
    t.addEventListener(te, n, !1);
  }
  function H(t, i, e) {
    const n = function (t) {
      j(t, i);
    };
    t[`_leaflet_touchend${e}`] = n,
    t.addEventListener(ie, n, !1),
    t.addEventListener(ee, n, !1);
  }
  function F(t, i, e) {
    function n(t) {
      let i;
      if (Ui) {
        if (!Pi || t.pointerType === 'mouse') { return; }
        i = re;
      } else { i = t.touches.length; }
      if (!(i > 1)) {
        let e = Date.now(),
          n = e - (s || e);
        r = t.touches ? t.touches[0] : t,
        a = n > 0 && n <= h,
        s = e;
      }
    }
    function o(t) {
      if (a && !r.cancelBubble) {
        if (Ui) {
          if (!Pi || t.pointerType === 'mouse') { return; }
          let e,
            n,
            o = {};
          for (n in r) {
            e = r[n],
            o[n] = e && e.bind ? e.bind(r) : e;
          }
          r = o;
        }
        r.type = 'dblclick',
        i(r),
        s = null;
      }
    }
    var s,
      r,
      a = !1,
      h = 250;
    return t[ue + ae + e] = n,
    t[ue + he + e] = o,
    t[`${ue}dblclick${e}`] = i,
    t.addEventListener(ae, n, !1),
    t.addEventListener(he, o, !1),
    t.addEventListener('dblclick', i, !1),
    this;
  }
  function U(t, i) {
    let e = t[ue + ae + i],
      n = t[ue + he + i],
      o = t[`${ue}dblclick${i}`];
    return t.removeEventListener(ae, e, !1),
    t.removeEventListener(he, n, !1),
    Pi || t.removeEventListener('dblclick', o, !1),
    this;
  }
  function V(t, i, e, n) {
    if (typeof i === 'object') {
      for (const o in i) { G(t, o, i[o], e); }
    } else {
      for (let s = 0, r = (i = u(i)).length; s < r; s++) { G(t, i[s], e, n); }
    }
    return this;
  }
  function q(t, i, e, n) {
    if (typeof i === 'object') {
      for (const o in i) { K(t, o, i[o], e); }
    } else if (i) {
      for (let s = 0, r = (i = u(i)).length; s < r; s++) { K(t, i[s], e, n); }
    } else {
      for (const a in t[le]) { K(t, a, t[le][a]); }
      delete t[le];
    }
    return this;
  }
  function G(t, i, e, o) {
    const s = i + n(e) + (o ? `_${n(o)}` : '');
    if (t[le] && t[le][s]) { return this; }
    let r = function (i) {
        return e.call(o || t, i || window.event);
      },
      a = r;
    Ui && i.indexOf('touch') === 0 ? I(t, i, r, s) : !Vi || i !== 'dblclick' || !F || Ui && Si ? 'addEventListener' in t ? i === 'mousewheel' ? t.addEventListener('onwheel' in t ? 'wheel' : 'mousewheel', r, !1) : i === 'mouseenter' || i === 'mouseleave' ? (r = function (i) {
      i = i || window.event,
      ot(t, i) && a(i);
    }
    ,
    t.addEventListener(i === 'mouseenter' ? 'mouseover' : 'mouseout', r, !1)) : (i === 'click' && Ti && (r = function (t) {
      st(t, a);
    }
    ),
    t.addEventListener(i, r, !1)) : 'attachEvent' in t && t.attachEvent(`on${i}`, r) : F(t, r, s),
    t[le] = t[le] || {},
    t[le][s] = r;
  }
  function K(t, i, e, o) {
    let s = i + n(e) + (o ? `_${n(o)}` : ''),
      r = t[le] && t[le][s];
    if (!r) { return this; }
    Ui && i.indexOf('touch') === 0 ? B(t, i, s) : !Vi || i !== 'dblclick' || !U || Ui && Si ? 'removeEventListener' in t ? i === 'mousewheel' ? t.removeEventListener('onwheel' in t ? 'wheel' : 'mousewheel', r, !1) : t.removeEventListener(i === 'mouseenter' ? 'mouseover' : i === 'mouseleave' ? 'mouseout' : i, r, !1) : 'detachEvent' in t && t.detachEvent(`on${i}`, r) : U(t, s),
    t[le][s] = null;
  }
  function Y(t) {
    return t.stopPropagation ? t.stopPropagation() : t.originalEvent ? t.originalEvent._stopped = !0 : t.cancelBubble = !0,
    nt(t),
    this;
  }
  function X(t) {
    return G(t, 'mousewheel', Y),
    this;
  }
  function J(t) {
    return V(t, 'mousedown touchstart dblclick', Y),
    G(t, 'click', et),
    this;
  }
  function $(t) {
    return t.preventDefault ? t.preventDefault() : t.returnValue = !1,
    this;
  }
  function Q(t) {
    return $(t),
    Y(t),
    this;
  }
  function tt(t, i) {
    if (!i) { return new x(t.clientX, t.clientY); }
    let e = i.getBoundingClientRect(),
      n = e.width / i.offsetWidth || 1,
      o = e.height / i.offsetHeight || 1;
    return new x(t.clientX / n - e.left - i.clientLeft, t.clientY / o - e.top - i.clientTop);
  }
  function it(t) {
    return Pi ? t.wheelDeltaY / 2 : t.deltaY && t.deltaMode === 0 ? -t.deltaY / ce : t.deltaY && t.deltaMode === 1 ? 20 * -t.deltaY : t.deltaY && t.deltaMode === 2 ? 60 * -t.deltaY : t.deltaX || t.deltaZ ? 0 : t.wheelDelta ? (t.wheelDeltaY || t.wheelDelta) / 2 : t.detail && Math.abs(t.detail) < 32765 ? 20 * -t.detail : t.detail ? t.detail / -32765 * 60 : 0;
  }
  function et(t) {
    _e[t.type] = !0;
  }
  function nt(t) {
    const i = _e[t.type];
    return _e[t.type] = !1,
    i;
  }
  function ot(t, i) {
    let e = i.relatedTarget;
    if (!e) { return !0; }
    try {
      for (; e && e !== t;) { e = e.parentNode; }
    } catch (t) {
      return !1;
    }
    return e !== t;
  }
  function st(t, i) {
    let e = t.timeStamp || t.originalEvent && t.originalEvent.timeStamp,
      n = pi && e - pi;
    n && n > 100 && n < 500 || t.target._simulatedClick && !t._simulated ? Q(t) : (pi = e,
    i(t));
  }
  function rt(t) {
    return typeof t === 'string' ? document.getElementById(t) : t;
  }
  function at(t, i) {
    let e = t.style[i] || t.currentStyle && t.currentStyle[i];
    if ((!e || e === 'auto') && document.defaultView) {
      const n = document.defaultView.getComputedStyle(t, null);
      e = n ? n[i] : null;
    }
    return e === 'auto' ? null : e;
  }
  function ht(t, i, e) {
    const n = document.createElement(t);
    return n.className = i || '',
    e && e.appendChild(n),
    n;
  }
  function ut(t) {
    const i = t.parentNode;
    i && i.removeChild(t);
  }
  function lt(t) {
    for (; t.firstChild;) { t.removeChild(t.firstChild); }
  }
  function ct(t) {
    const i = t.parentNode;
    i.lastChild !== t && i.appendChild(t);
  }
  function _t(t) {
    const i = t.parentNode;
    i.firstChild !== t && i.insertBefore(t, i.firstChild);
  }
  function dt(t, i) {
    if (void 0 !== t.classList) { return t.classList.contains(i); }
    const e = gt(t);
    return e.length > 0 && new RegExp(`(^|\\s)${i}(\\s|$)`).test(e);
  }
  function pt(t, i) {
    if (void 0 !== t.classList) {
      for (let e = u(i), n = 0, o = e.length; n < o; n++) { t.classList.add(e[n]); }
    } else if (!dt(t, i)) {
      const s = gt(t);
      ft(t, (s ? `${s} ` : '') + i);
    }
  }
  function mt(t, i) {
    void 0 !== t.classList ? t.classList.remove(i) : ft(t, h((` ${gt(t)} `).replace(` ${i} `, ' ')));
  }
  function ft(t, i) {
    void 0 === t.className.baseVal ? t.className = i : t.className.baseVal = i;
  }
  function gt(t) {
    return void 0 === t.className.baseVal ? t.className : t.className.baseVal;
  }
  function vt(t, i) {
    'opacity' in t.style ? t.style.opacity = i : 'filter' in t.style && yt(t, i);
  }
  function yt(t, i) {
    let e = !1,
      n = 'DXImageTransform.Microsoft.Alpha';
    try {
      e = t.filters.item(n);
    } catch (t) {
      if (i === 1) { return; }
    }
    i = Math.round(100 * i),
    e ? (e.Enabled = i !== 100,
    e.Opacity = i) : t.style.filter += ` progid:${n}(opacity=${i})`;
  }
  function xt(t) {
    for (let i = document.documentElement.style, e = 0; e < t.length; e++) {
      if (t[e] in i) { return t[e]; }
    }
    return !1;
  }
  function wt(t, i, e) {
    const n = i || new x(0, 0);
    t.style[pe] = (Oi ? `translate(${n.x}px,${n.y}px)` : `translate3d(${n.x}px,${n.y}px,0)`) + (e ? ` scale(${e})` : '');
  }
  function Lt(t, i) {
    t._leaflet_pos = i,
    Ni ? wt(t, i) : (t.style.left = `${i.x}px`,
    t.style.top = `${i.y}px`);
  }
  function Pt(t) {
    return t._leaflet_pos || new x(0, 0);
  }
  function bt() {
    V(window, 'dragstart', $);
  }
  function Tt() {
    q(window, 'dragstart', $);
  }
  function zt(t) {
    for (; t.tabIndex === -1;) { t = t.parentNode; }
    t.style && (Mt(),
    ve = t,
    ye = t.style.outline,
    t.style.outline = 'none',
    V(window, 'keydown', Mt));
  }
  function Mt() {
    ve && (ve.style.outline = ye,
    ve = void 0,
    ye = void 0,
    q(window, 'keydown', Mt));
  }
  function Ct(t, i) {
    if (!i || !t.length) { return t.slice(); }
    const e = i * i;
    return t = kt(t, e),
    t = St(t, e);
  }
  function Zt(t, i, e) {
    return Math.sqrt(Rt(t, i, e, !0));
  }
  function St(t, i) {
    let e = t.length,
      n = new (typeof Uint8Array !== `${void 0}` ? Uint8Array : Array)(e);
    n[0] = n[e - 1] = 1,
    Et(t, n, i, 0, e - 1);
    let o,
      s = [];
    for (o = 0; o < e; o++) { n[o] && s.push(t[o]); }
    return s;
  }
  function Et(t, i, e, n, o) {
    let s,
      r,
      a,
      h = 0;
    for (r = n + 1; r <= o - 1; r++) {
      (a = Rt(t[r], t[n], t[o], !0)) > h && (s = r,
      h = a);
    }
    h > e && (i[s] = 1,
    Et(t, i, e, n, s),
    Et(t, i, e, s, o));
  }
  function kt(t, i) {
    for (var e = [t[0]], n = 1, o = 0, s = t.length; n < s; n++) {
      Ot(t[n], t[o]) > i && (e.push(t[n]),
      o = n);
    }
    return o < s - 1 && e.push(t[s - 1]),
    e;
  }
  function At(t, i, e, n, o) {
    let s,
      r,
      a,
      h = n ? Se : Bt(t, e),
      u = Bt(i, e);
    for (Se = u; ;) {
      if (!(h | u)) { return [t, i]; }
      if (h & u) { return !1; }
      a = Bt(r = It(t, i, s = h || u, e, o), e),
      s === h ? (t = r,
      h = a) : (i = r,
      u = a);
    }
  }
  function It(t, i, e, n, o) {
    let s,
      r,
      a = i.x - t.x,
      h = i.y - t.y,
      u = n.min,
      l = n.max;
    return 8 & e ? (s = t.x + a * (l.y - t.y) / h,
    r = l.y) : 4 & e ? (s = t.x + a * (u.y - t.y) / h,
    r = u.y) : 2 & e ? (s = l.x,
    r = t.y + h * (l.x - t.x) / a) : 1 & e && (s = u.x,
    r = t.y + h * (u.x - t.x) / a),
    new x(s, r, o);
  }
  function Bt(t, i) {
    let e = 0;
    return t.x < i.min.x ? e |= 1 : t.x > i.max.x && (e |= 2),
    t.y < i.min.y ? e |= 4 : t.y > i.max.y && (e |= 8),
    e;
  }
  function Ot(t, i) {
    let e = i.x - t.x,
      n = i.y - t.y;
    return e * e + n * n;
  }
  function Rt(t, i, e, n) {
    let o,
      s = i.x,
      r = i.y,
      a = e.x - s,
      h = e.y - r,
      u = a * a + h * h;
    return u > 0 && ((o = ((t.x - s) * a + (t.y - r) * h) / u) > 1 ? (s = e.x,
    r = e.y) : o > 0 && (s += a * o,
    r += h * o)),
    a = t.x - s,
    h = t.y - r,
    n ? a * a + h * h : new x(s, r);
  }
  function Dt(t) {
    return !ei(t[0]) || typeof t[0][0] !== 'object' && void 0 !== t[0][0];
  }
  function Nt(t) {
    return console.warn('Deprecated use of _flat, please use L.LineUtil.isFlat instead.'),
    Dt(t);
  }
  function jt(t, i, e) {
    let n,
      o,
      s,
      r,
      a,
      h,
      u,
      l,
      c,
      _ = [1, 4, 2, 8];
    for (o = 0,
    u = t.length; o < u; o++) { t[o]._code = Bt(t[o], i); }
    for (r = 0; r < 4; r++) {
      for (l = _[r],
      n = [],
      o = 0,
      s = (u = t.length) - 1; o < u; s = o++) {
        a = t[o],
        h = t[s],
        a._code & l ? h._code & l || ((c = It(h, a, l, i, e))._code = Bt(c, i),
        n.push(c)) : (h._code & l && ((c = It(h, a, l, i, e))._code = Bt(c, i),
        n.push(c)),
        n.push(a));
      }
      t = n;
    }
    return t;
  }
  function Wt(t, i) {
    let e,
      n,
      o,
      s,
      r = t.type === 'Feature' ? t.geometry : t,
      a = r ? r.coordinates : null,
      h = [],
      u = i && i.pointToLayer,
      l = i && i.coordsToLatLng || Ht;
    if (!a && !r) { return null; }
    switch (r.type) {
      case 'Point':
        return e = l(a),
        u ? u(t, e) : new Xe(e);
      case 'MultiPoint':
        for (o = 0,
        s = a.length; o < s; o++) {
          e = l(a[o]),
          h.push(u ? u(t, e) : new Xe(e));
        }
        return new qe(h);
      case 'LineString':
      case 'MultiLineString':
        return n = Ft(a, r.type === 'LineString' ? 0 : 1, l),
        new tn(n, i);
      case 'Polygon':
      case 'MultiPolygon':
        return n = Ft(a, r.type === 'Polygon' ? 1 : 2, l),
        new en(n, i);
      case 'GeometryCollection':
        for (o = 0,
        s = r.geometries.length; o < s; o++) {
          const c = Wt({
            geometry: r.geometries[o],
            type: 'Feature',
            properties: t.properties,
          }, i);
          c && h.push(c);
        }
        return new qe(h);
      default:
        throw new Error('Invalid GeoJSON object.');
    }
  }
  function Ht(t) {
    return new M(t[1], t[0], t[2]);
  }
  function Ft(t, i, e) {
    for (var n, o = [], s = 0, r = t.length; s < r; s++) {
      n = i ? Ft(t[s], i - 1, e) : (e || Ht)(t[s]),
      o.push(n);
    }
    return o;
  }
  function Ut(t, i) {
    return i = typeof i === 'number' ? i : 6,
    void 0 !== t.alt ? [a(t.lng, i), a(t.lat, i), a(t.alt, i)] : [a(t.lng, i), a(t.lat, i)];
  }
  function Vt(t, i, e, n) {
    for (var o = [], s = 0, r = t.length; s < r; s++) { o.push(i ? Vt(t[s], i - 1, e, n) : Ut(t[s], n)); }
    return !i && e && o.push(o[0]),
    o;
  }
  function qt(t, e) {
    return t.feature ? i({}, t.feature, {
      geometry: e,
    }) : Gt(e);
  }
  function Gt(t) {
    return t.type === 'Feature' || t.type === 'FeatureCollection' ? t : {
      type: 'Feature',
      properties: {},
      geometry: t,
    };
  }
  function Kt(t, i) {
    return new nn(t, i);
  }
  function Yt(t, i) {
    return new dn(t, i);
  }
  function Xt(t) {
    return Yi ? new fn(t) : null;
  }
  function Jt(t) {
    return Xi || Ji ? new xn(t) : null;
  }
  const $t = Object.freeze;
  Object.freeze = function (t) {
    return t;
  }
  ;
  var Qt = Object.create || (function () {
      function t() {}
      return function (i) {
        return t.prototype = i,
        new t();
      };
    }()),
    ti = 0,
    ii = /\{ *([\w_-]+) *\}/g,
    ei = Array.isArray || function (t) {
      return Object.prototype.toString.call(t) === '[object Array]';
    },
    ni = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',
    oi = 0,
    si = window.requestAnimationFrame || p('RequestAnimationFrame') || m,
    ri = window.cancelAnimationFrame || p('CancelAnimationFrame') || p('CancelRequestAnimationFrame') || function (t) {
      window.clearTimeout(t);
    },
    ai = (Object.freeze || Object)({
      freeze: $t,
      extend: i,
      create: Qt,
      bind: e,
      lastId: ti,
      stamp: n,
      throttle: o,
      wrapNum: s,
      falseFn: r,
      formatNum: a,
      trim: h,
      splitWords: u,
      setOptions: l,
      getParamString: c,
      template: _,
      isArray: ei,
      indexOf: d,
      emptyImageUrl: ni,
      requestFn: si,
      cancelFn: ri,
      requestAnimFrame: f,
      cancelAnimFrame: g,
    });
  // v.js
  // hi .js
  let ui = v.extend(hi),
    li = Math.trunc || function (t) {
      return t > 0 ? Math.floor(t) : Math.ceil(t);
    }
    ;
    // x.js

  // ci.js
  _i = i({}, ci, {
    wrapLng: [-180, 180],
    R: 6371e3,
    distance(t, i) {
      let e = Math.PI / 180,
        n = t.lat * e,
        o = i.lat * e,
        s = Math.sin((i.lat - t.lat) * e / 2),
        r = Math.sin((i.lng - t.lng) * e / 2),
        a = s * s + Math.cos(n) * Math.cos(o) * r * r,
        h = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return this.R * h;
    },
  })
  // di from ci.js
  ,
  Z.prototype = {
    transform(t, i) {
      return this._transform(t.clone(), i);
    },
    _transform(t, i) {
      return i = i || 1,
      t.x = i * (this._a * t.x + this._b),
      t.y = i * (this._c * t.y + this._d),
      t;
    },
    untransform(t, i) {
      return i = i || 1,
      new x((t.x / i - this._b) / this._a, (t.y / i - this._d) / this._c);
    },
  };
  var pi,
    mi,
    fi,
    gi,
    vi = i({}, _i, {
      code: 'EPSG:3857',
      projection: di,
      transformation: (function () {
        const t = 0.5 / (Math.PI * di.R);
        return S(t, 0.5, -t, 0.5);
      }()),
    }),
    yi = i({}, vi, {
      code: 'EPSG:900913',
    }),
    xi = document.documentElement.style,
    wi = 'ActiveXObject' in window,
    Li = wi && !document.addEventListener,
    Pi = 'msLaunchUri' in navigator && !('documentMode' in document),
    bi = A('webkit'),
    Ti = A('android'),
    zi = A('android 2') || A('android 3'),
    Mi = parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1], 10),
    Ci = Ti && A('Google') && Mi < 537 && !('AudioNode' in window),
    Zi = !!window.opera,
    Si = A('chrome'),
    Ei = A('gecko') && !bi && !Zi && !wi,
    ki = !Si && A('safari'),
    Ai = A('phantom'),
    Ii = 'OTransition' in xi,
    Bi = navigator.platform.indexOf('Win') === 0,
    Oi = wi && 'transition' in xi,
    Ri = 'WebKitCSSMatrix' in window && 'm11' in new window.WebKitCSSMatrix() && !zi,
    Di = 'MozPerspective' in xi,
    Ni = !window.L_DISABLE_3D && (Oi || Ri || Di) && !Ii && !Ai,
    ji = typeof orientation !== 'undefined' || A('mobile'),
    Wi = ji && bi,
    Hi = ji && Ri,
    Fi = !window.PointerEvent && window.MSPointerEvent,
    Ui = !(!window.PointerEvent && !Fi),
    Vi = !window.L_NO_TOUCH && (Ui || 'ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch),
    qi = ji && Zi,
    Gi = ji && Ei,
    Ki = (window.devicePixelRatio || window.screen.deviceXDPI / window.screen.logicalXDPI) > 1,
    Yi = !!document.createElement('canvas').getContext,
    Xi = !(!document.createElementNS || !E('svg').createSVGRect),
    Ji = !Xi && (function () {
      try {
        const t = document.createElement('div');
        t.innerHTML = '<v:shape adj="1"/>';
        const i = t.firstChild;
        return i.style.behavior = 'url(#default#VML)',
        i && typeof i.adj === 'object';
      } catch (t) {
        return !1;
      }
    }()),
    $i = (Object.freeze || Object)({
      ie: wi,
      ielt9: Li,
      edge: Pi,
      webkit: bi,
      android: Ti,
      android23: zi,
      androidStock: Ci,
      opera: Zi,
      chrome: Si,
      gecko: Ei,
      safari: ki,
      phantom: Ai,
      opera12: Ii,
      win: Bi,
      ie3d: Oi,
      webkit3d: Ri,
      gecko3d: Di,
      any3d: Ni,
      mobile: ji,
      mobileWebkit: Wi,
      mobileWebkit3d: Hi,
      msPointer: Fi,
      pointer: Ui,
      touch: Vi,
      mobileOpera: qi,
      mobileGecko: Gi,
      retina: Ki,
      canvas: Yi,
      svg: Xi,
      vml: Ji,
    }),
    Qi = Fi ? 'MSPointerDown' : 'pointerdown',
    te = Fi ? 'MSPointerMove' : 'pointermove',
    ie = Fi ? 'MSPointerUp' : 'pointerup',
    ee = Fi ? 'MSPointerCancel' : 'pointercancel',
    ne = ['INPUT', 'SELECT', 'OPTION'],
    oe = {},
    se = !1,
    re = 0,
    ae = Fi ? 'MSPointerDown' : Ui ? 'pointerdown' : 'touchstart',
    he = Fi ? 'MSPointerUp' : Ui ? 'pointerup' : 'touchend',
    ue = '_leaflet_',
    le = '_leaflet_events',
    ce = Bi && Si ? 2 * window.devicePixelRatio : Ei ? window.devicePixelRatio : 1,
    _e = {},
    de = (Object.freeze || Object)({
      on: V,
      off: q,
      stopPropagation: Y,
      disableScrollPropagation: X,
      disableClickPropagation: J,
      preventDefault: $,
      stop: Q,
      getMousePosition: tt,
      getWheelDelta: it,
      fakeStop: et,
      skipped: nt,
      isExternalTarget: ot,
      addListener: V,
      removeListener: q,
    }),
    pe = xt(['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform']),
    me = xt(['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']),
    fe = me === 'webkitTransition' || me === 'OTransition' ? `${me}End` : 'transitionend';
  if ('onselectstart' in document) {
    mi = function () {
      V(window, 'selectstart', $);
    }
    ,
    fi = function () {
      q(window, 'selectstart', $);
    }
    ;
  } else {
    const ge = xt(['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);
    mi = function () {
      if (ge) {
        const t = document.documentElement.style;
        gi = t[ge],
        t[ge] = 'none';
      }
    }
    ,
    fi = function () {
      ge && (document.documentElement.style[ge] = gi,
      gi = void 0);
    };
  }
  let ve,
    ye,
    xe = (Object.freeze || Object)({
      TRANSFORM: pe,
      TRANSITION: me,
      TRANSITION_END: fe,
      get: rt,
      getStyle: at,
      create: ht,
      remove: ut,
      empty: lt,
      toFront: ct,
      toBack: _t,
      hasClass: dt,
      addClass: pt,
      removeClass: mt,
      setClass: ft,
      getClass: gt,
      setOpacity: vt,
      testProp: xt,
      setTransform: wt,
      setPosition: Lt,
      getPosition: Pt,
      disableTextSelection: mi,
      enableTextSelection: fi,
      disableImageDrag: bt,
      enableImageDrag: Tt,
      preventOutline: zt,
      restoreOutline: Mt,
    }),
    we = ui.extend({
      run(t, i, e, n) {
        this.stop(),
        this._el = t,
        this._inProgress = !0,
        this._duration = e || 0.25,
        this._easeOutPower = 1 / Math.max(n || 0.5, 0.2),
        this._startPos = Pt(t),
        this._offset = i.subtract(this._startPos),
        this._startTime = +new Date(),
        this.fire('start'),
        this._animate();
      },
      stop() {
        this._inProgress && (this._step(!0),
        this._complete());
      },
      _animate() {
        this._animId = f(this._animate, this),
        this._step();
      },
      _step(t) {
        let i = +new Date() - this._startTime,
          e = 1e3 * this._duration;
        i < e ? this._runFrame(this._easeOut(i / e), t) : (this._runFrame(1),
        this._complete());
      },
      _runFrame(t, i) {
        const e = this._startPos.add(this._offset.multiplyBy(t));
        i && e._round(),
        Lt(this._el, e),
        this.fire('step');
      },
      _complete() {
        g(this._animId),
        this._inProgress = !1,
        this.fire('end');
      },
      _easeOut(t) {
        return 1 - Math.pow(1 - t, this._easeOutPower);
      },
    }),
    Le = ui.extend({
      options: {
        crs: vi,
        center: void 0,
        zoom: void 0,
        minZoom: void 0,
        maxZoom: void 0,
        layers: [],
        maxBounds: void 0,
        renderer: void 0,
        zoomAnimation: !0,
        zoomAnimationThreshold: 4,
        fadeAnimation: !0,
        markerZoomAnimation: !0,
        transform3DLimit: 8388608,
        zoomSnap: 1,
        zoomDelta: 1,
        trackResize: !0,
      },
      initialize(t, i) {
        i = l(this, i),
        this._initContainer(t),
        this._initLayout(),
        this._onResize = e(this._onResize, this),
        this._initEvents(),
        i.maxBounds && this.setMaxBounds(i.maxBounds),
        void 0 !== i.zoom && (this._zoom = this._limitZoom(i.zoom)),
        i.center && void 0 !== i.zoom && this.setView(C(i.center), i.zoom, {
          reset: !0,
        }),
        this._handlers = [],
        this._layers = {},
        this._zoomBoundLayers = {},
        this._sizeChanged = !0,
        this.callInitHooks(),
        this._zoomAnimated = me && Ni && !qi && this.options.zoomAnimation,
        this._zoomAnimated && (this._createAnimProxy(),
        V(this._proxy, fe, this._catchTransitionEnd, this)),
        this._addLayers(this.options.layers);
      },
      setView(t, e, n) {
        return e = void 0 === e ? this._zoom : this._limitZoom(e),
        t = this._limitCenter(C(t), e, this.options.maxBounds),
        n = n || {},
        this._stop(),
        this._loaded && !n.reset && !0 !== n && (void 0 !== n.animate && (n.zoom = i({
          animate: n.animate,
        }, n.zoom),
        n.pan = i({
          animate: n.animate,
          duration: n.duration,
        }, n.pan)),
        this._zoom !== e ? this._tryAnimatedZoom && this._tryAnimatedZoom(t, e, n.zoom) : this._tryAnimatedPan(t, n.pan)) ? (clearTimeout(this._sizeTimer),
          this) : (this._resetView(t, e),
          this);
      },
      setZoom(t, i) {
        return this._loaded ? this.setView(this.getCenter(), t, {
          zoom: i,
        }) : (this._zoom = t,
        this);
      },
      zoomIn(t, i) {
        return t = t || (Ni ? this.options.zoomDelta : 1),
        this.setZoom(this._zoom + t, i);
      },
      zoomOut(t, i) {
        return t = t || (Ni ? this.options.zoomDelta : 1),
        this.setZoom(this._zoom - t, i);
      },
      setZoomAround(t, i, e) {
        let n = this.getZoomScale(i),
          o = this.getSize().divideBy(2),
          s = (t instanceof x ? t : this.latLngToContainerPoint(t)).subtract(o).multiplyBy(1 - 1 / n),
          r = this.containerPointToLatLng(o.add(s));
        return this.setView(r, i, {
          zoom: e,
        });
      },
      _getBoundsCenterZoom(t, i) {
        i = i || {},
        t = t.getBounds ? t.getBounds() : z(t);
        let e = w(i.paddingTopLeft || i.padding || [0, 0]),
          n = w(i.paddingBottomRight || i.padding || [0, 0]),
          o = this.getBoundsZoom(t, !1, e.add(n));
        if ((o = typeof i.maxZoom === 'number' ? Math.min(i.maxZoom, o) : o) === 1 / 0) {
          return {
            center: t.getCenter(),
            zoom: o,
          };
        }
        let s = n.subtract(e).divideBy(2),
          r = this.project(t.getSouthWest(), o),
          a = this.project(t.getNorthEast(), o);
        return {
          center: this.unproject(r.add(a).divideBy(2).add(s), o),
          zoom: o,
        };
      },
      fitBounds(t, i) {
        if (!(t = z(t)).isValid()) { throw new Error('Bounds are not valid.'); }
        const e = this._getBoundsCenterZoom(t, i);
        return this.setView(e.center, e.zoom, i);
      },
      fitWorld(t) {
        return this.fitBounds([[-90, -180], [90, 180]], t);
      },
      panTo(t, i) {
        return this.setView(t, this._zoom, {
          pan: i,
        });
      },
      panBy(t, i) {
        if (t = w(t).round(),
        i = i || {},
        !t.x && !t.y) { return this.fire('moveend'); }
        if (!0 !== i.animate && !this.getSize().contains(t)) {
          return this._resetView(this.unproject(this.project(this.getCenter()).add(t)), this.getZoom()),
          this;
        }
        if (this._panAnim || (this._panAnim = new we(),
        this._panAnim.on({
          step: this._onPanTransitionStep,
          end: this._onPanTransitionEnd,
        }, this)),
        i.noMoveStart || this.fire('movestart'),
        !1 !== i.animate) {
          pt(this._mapPane, 'leaflet-pan-anim');
          const e = this._getMapPanePos().subtract(t).round();
          this._panAnim.run(this._mapPane, e, i.duration || 0.25, i.easeLinearity);
        } else {
          this._rawPanBy(t),
          this.fire('move').fire('moveend');
        }
        return this;
      },
      flyTo(t, i, e) {
        function n(t) {
          let i = (g * g - m * m + (t ? -1 : 1) * x * x * v * v) / (2 * (t ? g : m) * x * v),
            e = Math.sqrt(i * i + 1) - i;
          return e < 1e-9 ? -18 : Math.log(e);
        }
        function o(t) {
          return (Math.exp(t) - Math.exp(-t)) / 2;
        }
        function s(t) {
          return (Math.exp(t) + Math.exp(-t)) / 2;
        }
        function r(t) {
          return o(t) / s(t);
        }
        function a(t) {
          return m * (s(w) / s(w + y * t));
        }
        function h(t) {
          return m * (s(w) * r(w + y * t) - o(w)) / x;
        }
        function u(t) {
          return 1 - Math.pow(1 - t, 1.5);
        }
        function l() {
          let e = (Date.now() - L) / b,
            n = u(e) * P;
          e <= 1 ? (this._flyToFrame = f(l, this),
          this._move(this.unproject(c.add(_.subtract(c).multiplyBy(h(n) / v)), p), this.getScaleZoom(m / a(n), p), {
            flyTo: !0,
          })) : this._move(t, i)._moveEnd(!0);
        }
        if (!1 === (e = e || {}).animate || !Ni) { return this.setView(t, i, e); }
        this._stop();
        var c = this.project(this.getCenter()),
          _ = this.project(t),
          d = this.getSize(),
          p = this._zoom;
        t = C(t),
        i = void 0 === i ? p : i;
        var m = Math.max(d.x, d.y),
          g = m * this.getZoomScale(p, i),
          v = _.distanceTo(c) || 1,
          y = 1.42,
          x = y * y,
          w = n(0),
          L = Date.now(),
          P = (n(1) - w) / y,
          b = e.duration ? 1e3 * e.duration : 1e3 * P * 0.8;
        return this._moveStart(!0, e.noMoveStart),
        l.call(this),
        this;
      },
      flyToBounds(t, i) {
        const e = this._getBoundsCenterZoom(t, i);
        return this.flyTo(e.center, e.zoom, i);
      },
      setMaxBounds(t) {
        return (t = z(t)).isValid() ? (this.options.maxBounds && this.off('moveend', this._panInsideMaxBounds),
        this.options.maxBounds = t,
        this._loaded && this._panInsideMaxBounds(),
        this.on('moveend', this._panInsideMaxBounds)) : (this.options.maxBounds = null,
        this.off('moveend', this._panInsideMaxBounds));
      },
      setMinZoom(t) {
        const i = this.options.minZoom;
        return this.options.minZoom = t,
        this._loaded && i !== t && (this.fire('zoomlevelschange'),
        this.getZoom() < this.options.minZoom) ? this.setZoom(t) : this;
      },
      setMaxZoom(t) {
        const i = this.options.maxZoom;
        return this.options.maxZoom = t,
        this._loaded && i !== t && (this.fire('zoomlevelschange'),
        this.getZoom() > this.options.maxZoom) ? this.setZoom(t) : this;
      },
      panInsideBounds(t, i) {
        this._enforcingBounds = !0;
        let e = this.getCenter(),
          n = this._limitCenter(e, this._zoom, z(t));
        return e.equals(n) || this.panTo(n, i),
        this._enforcingBounds = !1,
        this;
      },
      invalidateSize(t) {
        if (!this._loaded) { return this; }
        t = i({
          animate: !1,
          pan: !0,
        }, !0 === t ? {
          animate: !0,
        } : t);
        const n = this.getSize();
        this._sizeChanged = !0,
        this._lastCenter = null;
        let o = this.getSize(),
          s = n.divideBy(2).round(),
          r = o.divideBy(2).round(),
          a = s.subtract(r);
        return a.x || a.y ? (t.animate && t.pan ? this.panBy(a) : (t.pan && this._rawPanBy(a),
        this.fire('move'),
        t.debounceMoveend ? (clearTimeout(this._sizeTimer),
        this._sizeTimer = setTimeout(e(this.fire, this, 'moveend'), 200)) : this.fire('moveend')),
        this.fire('resize', {
          oldSize: n,
          newSize: o,
        })) : this;
      },
      stop() {
        return this.setZoom(this._limitZoom(this._zoom)),
        this.options.zoomSnap || this.fire('viewreset'),
        this._stop();
      },
      locate(t) {
        if (t = this._locateOptions = i({
          timeout: 1e4,
          watch: !1,
        }, t),
        !('geolocation' in navigator)) {
          return this._handleGeolocationError({
            code: 0,
            message: 'Geolocation not supported.',
          }),
          this;
        }
        let n = e(this._handleGeolocationResponse, this),
          o = e(this._handleGeolocationError, this);
        return t.watch ? this._locationWatchId = navigator.geolocation.watchPosition(n, o, t) : navigator.geolocation.getCurrentPosition(n, o, t),
        this;
      },
      stopLocate() {
        return navigator.geolocation && navigator.geolocation.clearWatch && navigator.geolocation.clearWatch(this._locationWatchId),
        this._locateOptions && (this._locateOptions.setView = !1),
        this;
      },
      _handleGeolocationError(t) {
        let i = t.code,
          e = t.message || (i === 1 ? 'permission denied' : i === 2 ? 'position unavailable' : 'timeout');
        this._locateOptions.setView && !this._loaded && this.fitWorld(),
        this.fire('locationerror', {
          code: i,
          message: `Geolocation error: ${e}.`,
        });
      },
      _handleGeolocationResponse(t) {
        let i = new M(t.coords.latitude, t.coords.longitude),
          e = i.toBounds(t.coords.accuracy),
          n = this._locateOptions;
        if (n.setView) {
          const o = this.getBoundsZoom(e);
          this.setView(i, n.maxZoom ? Math.min(o, n.maxZoom) : o);
        }
        const s = {
          latlng: i,
          bounds: e,
          timestamp: t.timestamp,
        };
        for (const r in t.coords) { typeof t.coords[r] === 'number' && (s[r] = t.coords[r]); }
        this.fire('locationfound', s);
      },
      addHandler(t, i) {
        if (!i) { return this; }
        const e = this[t] = new i(this);
        return this._handlers.push(e),
        this.options[t] && e.enable(),
        this;
      },
      remove() {
        if (this._initEvents(!0),
        this._containerId !== this._container._leaflet_id) { throw new Error('Map container is being reused by another instance'); }
        try {
          delete this._container._leaflet_id,
          delete this._containerId;
        } catch (t) {
          this._container._leaflet_id = void 0,
          this._containerId = void 0;
        }
        void 0 !== this._locationWatchId && this.stopLocate(),
        this._stop(),
        ut(this._mapPane),
        this._clearControlPos && this._clearControlPos(),
        this._clearHandlers(),
        this._loaded && this.fire('unload');
        let t;
        for (t in this._layers) { this._layers[t].remove(); }
        for (t in this._panes) { ut(this._panes[t]); }
        return this._layers = [],
        this._panes = [],
        delete this._mapPane,
        delete this._renderer,
        this;
      },
      createPane(t, i) {
        const e = ht('div', `leaflet-pane${t ? ` leaflet-${t.replace('Pane', '')}-pane` : ''}`, i || this._mapPane);
        return t && (this._panes[t] = e),
        e;
      },
      getCenter() {
        return this._checkIfLoaded(),
        this._lastCenter && !this._moved() ? this._lastCenter : this.layerPointToLatLng(this._getCenterLayerPoint());
      },
      getZoom() {
        return this._zoom;
      },
      getBounds() {
        const t = this.getPixelBounds();
        return new T(this.unproject(t.getBottomLeft()), this.unproject(t.getTopRight()));
      },
      getMinZoom() {
        return void 0 === this.options.minZoom ? this._layersMinZoom || 0 : this.options.minZoom;
      },
      getMaxZoom() {
        return void 0 === this.options.maxZoom ? void 0 === this._layersMaxZoom ? 1 / 0 : this._layersMaxZoom : this.options.maxZoom;
      },
      getBoundsZoom(t, i, e) {
        t = z(t),
        e = w(e || [0, 0]);
        let n = this.getZoom() || 0,
          o = this.getMinZoom(),
          s = this.getMaxZoom(),
          r = t.getNorthWest(),
          a = t.getSouthEast(),
          h = this.getSize().subtract(e),
          u = b(this.project(a, n), this.project(r, n)).getSize(),
          l = Ni ? this.options.zoomSnap : 1,
          c = h.x / u.x,
          _ = h.y / u.y,
          d = i ? Math.max(c, _) : Math.min(c, _);
        return n = this.getScaleZoom(d, n),
        l && (n = Math.round(n / (l / 100)) * (l / 100),
        n = i ? Math.ceil(n / l) * l : Math.floor(n / l) * l),
        Math.max(o, Math.min(s, n));
      },
      getSize() {
        return this._size && !this._sizeChanged || (this._size = new x(this._container.clientWidth || 0, this._container.clientHeight || 0),
        this._sizeChanged = !1),
        this._size.clone();
      },
      getPixelBounds(t, i) {
        const e = this._getTopLeftPoint(t, i);
        return new P(e, e.add(this.getSize()));
      },
      getPixelOrigin() {
        return this._checkIfLoaded(),
        this._pixelOrigin;
      },
      getPixelWorldBounds(t) {
        return this.options.crs.getProjectedBounds(void 0 === t ? this.getZoom() : t);
      },
      getPane(t) {
        return typeof t === 'string' ? this._panes[t] : t;
      },
      getPanes() {
        return this._panes;
      },
      getContainer() {
        return this._container;
      },
      getZoomScale(t, i) {
        const e = this.options.crs;
        return i = void 0 === i ? this._zoom : i,
        e.scale(t) / e.scale(i);
      },
      getScaleZoom(t, i) {
        const e = this.options.crs;
        i = void 0 === i ? this._zoom : i;
        const n = e.zoom(t * e.scale(i));
        return isNaN(n) ? 1 / 0 : n;
      },
      project(t, i) {
        return i = void 0 === i ? this._zoom : i,
        this.options.crs.latLngToPoint(C(t), i);
      },
      unproject(t, i) {
        return i = void 0 === i ? this._zoom : i,
        this.options.crs.pointToLatLng(w(t), i);
      },
      layerPointToLatLng(t) {
        const i = w(t).add(this.getPixelOrigin());
        return this.unproject(i);
      },
      latLngToLayerPoint(t) {
        return this.project(C(t))._round()._subtract(this.getPixelOrigin());
      },
      wrapLatLng(t) {
        return this.options.crs.wrapLatLng(C(t));
      },
      wrapLatLngBounds(t) {
        return this.options.crs.wrapLatLngBounds(z(t));
      },
      distance(t, i) {
        return this.options.crs.distance(C(t), C(i));
      },
      containerPointToLayerPoint(t) {
        return w(t).subtract(this._getMapPanePos());
      },
      layerPointToContainerPoint(t) {
        return w(t).add(this._getMapPanePos());
      },
      containerPointToLatLng(t) {
        const i = this.containerPointToLayerPoint(w(t));
        return this.layerPointToLatLng(i);
      },
      latLngToContainerPoint(t) {
        return this.layerPointToContainerPoint(this.latLngToLayerPoint(C(t)));
      },
      mouseEventToContainerPoint(t) {
        return tt(t, this._container);
      },
      mouseEventToLayerPoint(t) {
        return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(t));
      },
      mouseEventToLatLng(t) {
        return this.layerPointToLatLng(this.mouseEventToLayerPoint(t));
      },
      _initContainer(t) {
        const i = this._container = rt(t);
        if (!i) { throw new Error('Map container not found.'); }
        if (i._leaflet_id) { throw new Error('Map container is already initialized.'); }
        V(i, 'scroll', this._onScroll, this),
        this._containerId = n(i);
      },
      _initLayout() {
        const t = this._container;
        this._fadeAnimated = this.options.fadeAnimation && Ni,
        pt(t, `leaflet-container${Vi ? ' leaflet-touch' : ''}${Ki ? ' leaflet-retina' : ''}${Li ? ' leaflet-oldie' : ''}${ki ? ' leaflet-safari' : ''}${this._fadeAnimated ? ' leaflet-fade-anim' : ''}`);
        const i = at(t, 'position');
        i !== 'absolute' && i !== 'relative' && i !== 'fixed' && (t.style.position = 'relative'),
        this._initPanes(),
        this._initControlPos && this._initControlPos();
      },
      _initPanes() {
        const t = this._panes = {};
        this._paneRenderers = {},
        this._mapPane = this.createPane('mapPane', this._container),
        Lt(this._mapPane, new x(0, 0)),
        this.createPane('tilePane'),
        this.createPane('shadowPane'),
        this.createPane('overlayPane'),
        this.createPane('markerPane'),
        this.createPane('tooltipPane'),
        this.createPane('popupPane'),
        this.options.markerZoomAnimation || (pt(t.markerPane, 'leaflet-zoom-hide'),
        pt(t.shadowPane, 'leaflet-zoom-hide'));
      },
      _resetView(t, i) {
        Lt(this._mapPane, new x(0, 0));
        const e = !this._loaded;
        this._loaded = !0,
        i = this._limitZoom(i),
        this.fire('viewprereset');
        const n = this._zoom !== i;
        this._moveStart(n, !1)._move(t, i)._moveEnd(n),
        this.fire('viewreset'),
        e && this.fire('load');
      },
      _moveStart(t, i) {
        return t && this.fire('zoomstart'),
        i || this.fire('movestart'),
        this;
      },
      _move(t, i, e) {
        void 0 === i && (i = this._zoom);
        const n = this._zoom !== i;
        return this._zoom = i,
        this._lastCenter = t,
        this._pixelOrigin = this._getNewPixelOrigin(t),
        (n || e && e.pinch) && this.fire('zoom', e),
        this.fire('move', e);
      },
      _moveEnd(t) {
        return t && this.fire('zoomend'),
        this.fire('moveend');
      },
      _stop() {
        return g(this._flyToFrame),
        this._panAnim && this._panAnim.stop(),
        this;
      },
      _rawPanBy(t) {
        Lt(this._mapPane, this._getMapPanePos().subtract(t));
      },
      _getZoomSpan() {
        return this.getMaxZoom() - this.getMinZoom();
      },
      _panInsideMaxBounds() {
        this._enforcingBounds || this.panInsideBounds(this.options.maxBounds);
      },
      _checkIfLoaded() {
        if (!this._loaded) { throw new Error('Set map center and zoom first.'); }
      },
      _initEvents(t) {
        this._targets = {},
        this._targets[n(this._container)] = this;
        const i = t ? q : V;
        i(this._container, 'click dblclick mousedown mouseup mouseover mouseout mousemove contextmenu keypress', this._handleDOMEvent, this),
        this.options.trackResize && i(window, 'resize', this._onResize, this),
        Ni && this.options.transform3DLimit && (t ? this.off : this.on).call(this, 'moveend', this._onMoveEnd);
      },
      _onResize() {
        g(this._resizeRequest),
        this._resizeRequest = f(function () {
          this.invalidateSize({
            debounceMoveend: !0,
          });
        }, this);
      },
      _onScroll() {
        this._container.scrollTop = 0,
        this._container.scrollLeft = 0;
      },
      _onMoveEnd() {
        const t = this._getMapPanePos();
        Math.max(Math.abs(t.x), Math.abs(t.y)) >= this.options.transform3DLimit && this._resetView(this.getCenter(), this.getZoom());
      },
      _findEventTargets(t, i) {
        for (var e, o = [], s = i === 'mouseout' || i === 'mouseover', r = t.target || t.srcElement, a = !1; r;) {
          if ((e = this._targets[n(r)]) && (i === 'click' || i === 'preclick') && !t._simulated && this._draggableMoved(e)) {
            a = !0;
            break;
          }
          if (e && e.listens(i, !0)) {
            if (s && !ot(r, t)) { break; }
            if (o.push(e),
            s) { break; }
          }
          if (r === this._container) { break; }
          r = r.parentNode;
        }
        return o.length || a || s || !ot(r, t) || (o = [this]),
        o;
      },
      _handleDOMEvent(t) {
        if (this._loaded && !nt(t)) {
          const i = t.type;
          i !== 'mousedown' && i !== 'keypress' || zt(t.target || t.srcElement),
          this._fireDOMEvent(t, i);
        }
      },
      _mouseEvents: ['click', 'dblclick', 'mouseover', 'mouseout', 'contextmenu'],
      _fireDOMEvent(t, e, n) {
        if (t.type === 'click') {
          const o = i({}, t);
          o.type = 'preclick',
          this._fireDOMEvent(o, o.type, n);
        }
        if (!t._stopped && (n = (n || []).concat(this._findEventTargets(t, e))).length) {
          const s = n[0];
          e === 'contextmenu' && s.listens(e, !0) && $(t);
          const r = {
            originalEvent: t,
          };
          if (t.type !== 'keypress') {
            const a = s.getLatLng && (!s._radius || s._radius <= 10);
            r.containerPoint = a ? this.latLngToContainerPoint(s.getLatLng()) : this.mouseEventToContainerPoint(t),
            r.layerPoint = this.containerPointToLayerPoint(r.containerPoint),
            r.latlng = a ? s.getLatLng() : this.layerPointToLatLng(r.layerPoint);
          }
          for (let h = 0; h < n.length; h++) {
            if (n[h].fire(e, r, !0),
            r.originalEvent._stopped || !1 === n[h].options.bubblingMouseEvents && d(this._mouseEvents, e) !== -1) { return; }
          }
        }
      },
      _draggableMoved(t) {
        return (t = t.dragging && t.dragging.enabled() ? t : this).dragging && t.dragging.moved() || this.boxZoom && this.boxZoom.moved();
      },
      _clearHandlers() {
        for (let t = 0, i = this._handlers.length; t < i; t++) { this._handlers[t].disable(); }
      },
      whenReady(t, i) {
        return this._loaded ? t.call(i || this, {
          target: this,
        }) : this.on('load', t, i),
        this;
      },
      _getMapPanePos() {
        return Pt(this._mapPane) || new x(0, 0);
      },
      _moved() {
        const t = this._getMapPanePos();
        return t && !t.equals([0, 0]);
      },
      _getTopLeftPoint(t, i) {
        return (t && void 0 !== i ? this._getNewPixelOrigin(t, i) : this.getPixelOrigin()).subtract(this._getMapPanePos());
      },
      _getNewPixelOrigin(t, i) {
        const e = this.getSize()._divideBy(2);
        return this.project(t, i)._subtract(e)._add(this._getMapPanePos())._round();
      },
      _latLngToNewLayerPoint(t, i, e) {
        const n = this._getNewPixelOrigin(e, i);
        return this.project(t, i)._subtract(n);
      },
      _latLngBoundsToNewLayerBounds(t, i, e) {
        const n = this._getNewPixelOrigin(e, i);
        return b([this.project(t.getSouthWest(), i)._subtract(n), this.project(t.getNorthWest(), i)._subtract(n), this.project(t.getSouthEast(), i)._subtract(n), this.project(t.getNorthEast(), i)._subtract(n)]);
      },
      _getCenterLayerPoint() {
        return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
      },
      _getCenterOffset(t) {
        return this.latLngToLayerPoint(t).subtract(this._getCenterLayerPoint());
      },
      _limitCenter(t, i, e) {
        if (!e) { return t; }
        let n = this.project(t, i),
          o = this.getSize().divideBy(2),
          s = new P(n.subtract(o), n.add(o)),
          r = this._getBoundsOffset(s, e, i);
        return r.round().equals([0, 0]) ? t : this.unproject(n.add(r), i);
      },
      _limitOffset(t, i) {
        if (!i) { return t; }
        let e = this.getPixelBounds(),
          n = new P(e.min.add(t), e.max.add(t));
        return t.add(this._getBoundsOffset(n, i));
      },
      _getBoundsOffset(t, i, e) {
        let n = b(this.project(i.getNorthEast(), e), this.project(i.getSouthWest(), e)),
          o = n.min.subtract(t.min),
          s = n.max.subtract(t.max);
        return new x(this._rebound(o.x, -s.x), this._rebound(o.y, -s.y));
      },
      _rebound(t, i) {
        return t + i > 0 ? Math.round(t - i) / 2 : Math.max(0, Math.ceil(t)) - Math.max(0, Math.floor(i));
      },
      _limitZoom(t) {
        let i = this.getMinZoom(),
          e = this.getMaxZoom(),
          n = Ni ? this.options.zoomSnap : 1;
        return n && (t = Math.round(t / n) * n),
        Math.max(i, Math.min(e, t));
      },
      _onPanTransitionStep() {
        this.fire('move');
      },
      _onPanTransitionEnd() {
        mt(this._mapPane, 'leaflet-pan-anim'),
        this.fire('moveend');
      },
      _tryAnimatedPan(t, i) {
        const e = this._getCenterOffset(t)._trunc();
        return !(!0 !== (i && i.animate) && !this.getSize().contains(e)) && (this.panBy(e, i),
        !0);
      },
      _createAnimProxy() {
        const t = this._proxy = ht('div', 'leaflet-proxy leaflet-zoom-animated');
        this._panes.mapPane.appendChild(t),
        this.on('zoomanim', function (t) {
          let i = pe,
            e = this._proxy.style[i];
          wt(this._proxy, this.project(t.center, t.zoom), this.getZoomScale(t.zoom, 1)),
          e === this._proxy.style[i] && this._animatingZoom && this._onZoomTransitionEnd();
        }, this),
        this.on('load moveend', function () {
          let t = this.getCenter(),
            i = this.getZoom();
          wt(this._proxy, this.project(t, i), this.getZoomScale(i, 1));
        }, this),
        this._on('unload', this._destroyAnimProxy, this);
      },
      _destroyAnimProxy() {
        ut(this._proxy),
        delete this._proxy;
      },
      _catchTransitionEnd(t) {
        this._animatingZoom && t.propertyName.indexOf('transform') >= 0 && this._onZoomTransitionEnd();
      },
      _nothingToAnimate() {
        return !this._container.getElementsByClassName('leaflet-zoom-animated').length;
      },
      _tryAnimatedZoom(t, i, e) {
        if (this._animatingZoom) { return !0; }
        if (e = e || {},
        !this._zoomAnimated || !1 === e.animate || this._nothingToAnimate() || Math.abs(i - this._zoom) > this.options.zoomAnimationThreshold) { return !1; }
        let n = this.getZoomScale(i),
          o = this._getCenterOffset(t)._divideBy(1 - 1 / n);
        return !(!0 !== e.animate && !this.getSize().contains(o)) && (f(function () {
          this._moveStart(!0, !1)._animateZoom(t, i, !0);
        }, this),
        !0);
      },
      _animateZoom(t, i, n, o) {
        this._mapPane && (n && (this._animatingZoom = !0,
        this._animateToCenter = t,
        this._animateToZoom = i,
        pt(this._mapPane, 'leaflet-zoom-anim')),
        this.fire('zoomanim', {
          center: t,
          zoom: i,
          noUpdate: o,
        }),
        setTimeout(e(this._onZoomTransitionEnd, this), 250));
      },
      _onZoomTransitionEnd() {
        this._animatingZoom && (this._mapPane && mt(this._mapPane, 'leaflet-zoom-anim'),
        this._animatingZoom = !1,
        this._move(this._animateToCenter, this._animateToZoom),
        f(function () {
          this._moveEnd(!0);
        }, this));
      },
    }),
    Pe = v.extend({
      options: {
        position: 'topright',
      },
      initialize(t) {
        l(this, t);
      },
      getPosition() {
        return this.options.position;
      },
      setPosition(t) {
        const i = this._map;
        return i && i.removeControl(this),
        this.options.position = t,
        i && i.addControl(this),
        this;
      },
      getContainer() {
        return this._container;
      },
      addTo(t) {
        this.remove(),
        this._map = t;
        let i = this._container = this.onAdd(t),
          e = this.getPosition(),
          n = t._controlCorners[e];
        return pt(i, 'leaflet-control'),
        e.indexOf('bottom') !== -1 ? n.insertBefore(i, n.firstChild) : n.appendChild(i),
        this;
      },
      remove() {
        return this._map ? (ut(this._container),
        this.onRemove && this.onRemove(this._map),
        this._map = null,
        this) : this;
      },
      _refocusOnMap(t) {
        this._map && t && t.screenX > 0 && t.screenY > 0 && this._map.getContainer().focus();
      },
    }),
    be = function (t) {
      return new Pe(t);
    };
  Le.include({
    addControl(t) {
      return t.addTo(this),
      this;
    },
    removeControl(t) {
      return t.remove(),
      this;
    },
    _initControlPos() {
      function t(t, o) {
        const s = `${e + t} ${e}${o}`;
        i[t + o] = ht('div', s, n);
      }
      var i = this._controlCorners = {},
        e = 'leaflet-',
        n = this._controlContainer = ht('div', `${e}control-container`, this._container);
      t('top', 'left'),
      t('top', 'right'),
      t('bottom', 'left'),
      t('bottom', 'right');
    },
    _clearControlPos() {
      for (const t in this._controlCorners) { ut(this._controlCorners[t]); }
      ut(this._controlContainer),
      delete this._controlCorners,
      delete this._controlContainer;
    },
  });
  let Te = Pe.extend({
      options: {
        collapsed: !0,
        position: 'topright',
        autoZIndex: !0,
        hideSingleBase: !1,
        sortLayers: !1,
        sortFunction(t, i, e, n) {
          return e < n ? -1 : n < e ? 1 : 0;
        },
      },
      initialize(t, i, e) {
        l(this, e),
        this._layerControlInputs = [],
        this._layers = [],
        this._lastZIndex = 0,
        this._handlingClick = !1;
        for (var n in t) { this._addLayer(t[n], n); }
        for (n in i) { this._addLayer(i[n], n, !0); }
      },
      onAdd(t) {
        this._initLayout(),
        this._update(),
        this._map = t,
        t.on('zoomend', this._checkDisabledLayers, this);
        for (let i = 0; i < this._layers.length; i++) { this._layers[i].layer.on('add remove', this._onLayerChange, this); }
        return this._container;
      },
      addTo(t) {
        return Pe.prototype.addTo.call(this, t),
        this._expandIfNotCollapsed();
      },
      onRemove() {
        this._map.off('zoomend', this._checkDisabledLayers, this);
        for (let t = 0; t < this._layers.length; t++) { this._layers[t].layer.off('add remove', this._onLayerChange, this); }
      },
      addBaseLayer(t, i) {
        return this._addLayer(t, i),
        this._map ? this._update() : this;
      },
      addOverlay(t, i) {
        return this._addLayer(t, i, !0),
        this._map ? this._update() : this;
      },
      removeLayer(t) {
        t.off('add remove', this._onLayerChange, this);
        const i = this._getLayer(n(t));
        return i && this._layers.splice(this._layers.indexOf(i), 1),
        this._map ? this._update() : this;
      },
      expand() {
        pt(this._container, 'leaflet-control-layers-expanded'),
        this._form.style.height = null;
        const t = this._map.getSize().y - (this._container.offsetTop + 50);
        return t < this._form.clientHeight ? (pt(this._form, 'leaflet-control-layers-scrollbar'),
        this._form.style.height = `${t}px`) : mt(this._form, 'leaflet-control-layers-scrollbar'),
        this._checkDisabledLayers(),
        this;
      },
      collapse() {
        return mt(this._container, 'leaflet-control-layers-expanded'),
        this;
      },
      _initLayout() {
        let t = 'leaflet-control-layers',
          i = this._container = ht('div', t),
          e = this.options.collapsed;
        i.setAttribute('aria-haspopup', !0),
        J(i),
        X(i);
        const n = this._form = ht('form', `${t}-list`);
        e && (this._map.on('click', this.collapse, this),
        Ti || V(i, {
          mouseenter: this.expand,
          mouseleave: this.collapse,
        }, this));
        const o = this._layersLink = ht('a', `${t}-toggle`, i);
        o.href = '#',
        o.title = 'Layers',
        Vi ? (V(o, 'click', Q),
        V(o, 'click', this.expand, this)) : V(o, 'focus', this.expand, this),
        e || this.expand(),
        this._baseLayersList = ht('div', `${t}-base`, n),
        this._separator = ht('div', `${t}-separator`, n),
        this._overlaysList = ht('div', `${t}-overlays`, n),
        i.appendChild(n);
      },
      _getLayer(t) {
        for (let i = 0; i < this._layers.length; i++) {
          if (this._layers[i] && n(this._layers[i].layer) === t) { return this._layers[i]; }
        }
      },
      _addLayer(t, i, n) {
        this._map && t.on('add remove', this._onLayerChange, this),
        this._layers.push({
          layer: t,
          name: i,
          overlay: n,
        }),
        this.options.sortLayers && this._layers.sort(e(function (t, i) {
          return this.options.sortFunction(t.layer, i.layer, t.name, i.name);
        }, this)),
        this.options.autoZIndex && t.setZIndex && (this._lastZIndex++,
        t.setZIndex(this._lastZIndex)),
        this._expandIfNotCollapsed();
      },
      _update() {
        if (!this._container) { return this; }
        lt(this._baseLayersList),
        lt(this._overlaysList),
        this._layerControlInputs = [];
        let t,
          i,
          e,
          n,
          o = 0;
        for (e = 0; e < this._layers.length; e++) {
          n = this._layers[e],
          this._addItem(n),
          i = i || n.overlay,
          t = t || !n.overlay,
          o += n.overlay ? 0 : 1;
        }
        return this.options.hideSingleBase && (t = t && o > 1,
        this._baseLayersList.style.display = t ? '' : 'none'),
        this._separator.style.display = i && t ? '' : 'none',
        this;
      },
      _onLayerChange(t) {
        this._handlingClick || this._update();
        let i = this._getLayer(n(t.target)),
          e = i.overlay ? t.type === 'add' ? 'overlayadd' : 'overlayremove' : t.type === 'add' ? 'baselayerchange' : null;
        e && this._map.fire(e, i);
      },
      _createRadioElement(t, i) {
        let e = `<input type="radio" class="leaflet-control-layers-selector" name="${t}"${i ? ' checked="checked"' : ''}/>`,
          n = document.createElement('div');
        return n.innerHTML = e,
        n.firstChild;
      },
      _addItem(t) {
        let i,
          e = document.createElement('label'),
          o = this._map.hasLayer(t.layer);
        t.overlay ? ((i = document.createElement('input')).type = 'checkbox',
        i.className = 'leaflet-control-layers-selector',
        i.defaultChecked = o) : i = this._createRadioElement('leaflet-base-layers', o),
        this._layerControlInputs.push(i),
        i.layerId = n(t.layer),
        V(i, 'click', this._onInputClick, this);
        const s = document.createElement('span');
        s.innerHTML = ` ${t.name}`;
        const r = document.createElement('div');
        return e.appendChild(r),
        r.appendChild(i),
        r.appendChild(s),
        (t.overlay ? this._overlaysList : this._baseLayersList).appendChild(e),
        this._checkDisabledLayers(),
        e;
      },
      _onInputClick() {
        let t,
          i,
          e = this._layerControlInputs,
          n = [],
          o = [];
        this._handlingClick = !0;
        for (var s = e.length - 1; s >= 0; s--) {
          t = e[s],
          i = this._getLayer(t.layerId).layer,
          t.checked ? n.push(i) : t.checked || o.push(i);
        }
        for (s = 0; s < o.length; s++) { this._map.hasLayer(o[s]) && this._map.removeLayer(o[s]); }
        for (s = 0; s < n.length; s++) { this._map.hasLayer(n[s]) || this._map.addLayer(n[s]); }
        this._handlingClick = !1,
        this._refocusOnMap();
      },
      _checkDisabledLayers() {
        for (var t, i, e = this._layerControlInputs, n = this._map.getZoom(), o = e.length - 1; o >= 0; o--) {
          t = e[o],
          i = this._getLayer(t.layerId).layer,
          t.disabled = void 0 !== i.options.minZoom && n < i.options.minZoom || void 0 !== i.options.maxZoom && n > i.options.maxZoom;
        }
      },
      _expandIfNotCollapsed() {
        return this._map && !this.options.collapsed && this.expand(),
        this;
      },
      _expand() {
        return this.expand();
      },
      _collapse() {
        return this.collapse();
      },
    }),
    ze = Pe.extend({
      options: {
        position: 'topleft',
        zoomInText: '+',
        zoomInTitle: 'Zoom in',
        zoomOutText: '&#x2212;',
        zoomOutTitle: 'Zoom out',
      },
      onAdd(t) {
        let i = 'leaflet-control-zoom',
          e = ht('div', `${i} leaflet-bar`),
          n = this.options;
        return this._zoomInButton = this._createButton(n.zoomInText, n.zoomInTitle, `${i}-in`, e, this._zoomIn),
        this._zoomOutButton = this._createButton(n.zoomOutText, n.zoomOutTitle, `${i}-out`, e, this._zoomOut),
        this._updateDisabled(),
        t.on('zoomend zoomlevelschange', this._updateDisabled, this),
        e;
      },
      onRemove(t) {
        t.off('zoomend zoomlevelschange', this._updateDisabled, this);
      },
      disable() {
        return this._disabled = !0,
        this._updateDisabled(),
        this;
      },
      enable() {
        return this._disabled = !1,
        this._updateDisabled(),
        this;
      },
      _zoomIn(t) {
        !this._disabled && this._map._zoom < this._map.getMaxZoom() && this._map.zoomIn(this._map.options.zoomDelta * (t.shiftKey ? 3 : 1));
      },
      _zoomOut(t) {
        !this._disabled && this._map._zoom > this._map.getMinZoom() && this._map.zoomOut(this._map.options.zoomDelta * (t.shiftKey ? 3 : 1));
      },
      _createButton(t, i, e, n, o) {
        const s = ht('a', e, n);
        return s.innerHTML = t,
        s.href = '#',
        s.title = i,
        s.setAttribute('role', 'button'),
        s.setAttribute('aria-label', i),
        J(s),
        V(s, 'click', Q),
        V(s, 'click', o, this),
        V(s, 'click', this._refocusOnMap, this),
        s;
      },
      _updateDisabled() {
        let t = this._map,
          i = 'leaflet-disabled';
        mt(this._zoomInButton, i),
        mt(this._zoomOutButton, i),
        (this._disabled || t._zoom === t.getMinZoom()) && pt(this._zoomOutButton, i),
        (this._disabled || t._zoom === t.getMaxZoom()) && pt(this._zoomInButton, i);
      },
    });
  Le.mergeOptions({
    zoomControl: !0,
  }),
  Le.addInitHook(function () {
    this.options.zoomControl && (this.zoomControl = new ze(),
    this.addControl(this.zoomControl));
  });
  let Me = Pe.extend({
      options: {
        position: 'bottomleft',
        maxWidth: 100,
        metric: !0,
        imperial: !0,
      },
      onAdd(t) {
        let i = ht('div', 'leaflet-control-scale'),
          e = this.options;
        return this._addScales(e, 'leaflet-control-scale-line', i),
        t.on(e.updateWhenIdle ? 'moveend' : 'move', this._update, this),
        t.whenReady(this._update, this),
        i;
      },
      onRemove(t) {
        t.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
      },
      _addScales(t, i, e) {
        t.metric && (this._mScale = ht('div', i, e)),
        t.imperial && (this._iScale = ht('div', i, e));
      },
      _update() {
        let t = this._map,
          i = t.getSize().y / 2,
          e = t.distance(t.containerPointToLatLng([0, i]), t.containerPointToLatLng([this.options.maxWidth, i]));
        this._updateScales(e);
      },
      _updateScales(t) {
        this.options.metric && t && this._updateMetric(t),
        this.options.imperial && t && this._updateImperial(t);
      },
      _updateMetric(t) {
        let i = this._getRoundNum(t),
          e = i < 1e3 ? `${i} m` : `${i / 1e3} km`;
        this._updateScale(this._mScale, e, i / t);
      },
      _updateImperial(t) {
        let i,
          e,
          n,
          o = 3.2808399 * t;
        o > 5280 ? (i = o / 5280,
        e = this._getRoundNum(i),
        this._updateScale(this._iScale, `${e} mi`, e / i)) : (n = this._getRoundNum(o),
        this._updateScale(this._iScale, `${n} ft`, n / o));
      },
      _updateScale(t, i, e) {
        t.style.width = `${Math.round(this.options.maxWidth * e)}px`,
        t.innerHTML = i;
      },
      _getRoundNum(t) {
        let i = Math.pow(10, (`${Math.floor(t)}`).length - 1),
          e = t / i;
        return e = e >= 10 ? 10 : e >= 5 ? 5 : e >= 3 ? 3 : e >= 2 ? 2 : 1,
        i * e;
      },
    }),
    Ce = Pe.extend({
      options: {
        position: 'bottomright',
        prefix: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>',
      },
      initialize(t) {
        l(this, t),
        this._attributions = {};
      },
      onAdd(t) {
        t.attributionControl = this,
        this._container = ht('div', 'leaflet-control-attribution'),
        J(this._container);
        for (const i in t._layers) { t._layers[i].getAttribution && this.addAttribution(t._layers[i].getAttribution()); }
        return this._update(),
        this._container;
      },
      setPrefix(t) {
        return this.options.prefix = t,
        this._update(),
        this;
      },
      addAttribution(t) {
        return t ? (this._attributions[t] || (this._attributions[t] = 0),
        this._attributions[t]++,
        this._update(),
        this) : this;
      },
      removeAttribution(t) {
        return t ? (this._attributions[t] && (this._attributions[t]--,
        this._update()),
        this) : this;
      },
      _update() {
        if (this._map) {
          const t = [];
          for (const i in this._attributions) { this._attributions[i] && t.push(i); }
          const e = [];
          this.options.prefix && e.push(this.options.prefix),
          t.length && e.push(t.join(', ')),
          this._container.innerHTML = e.join(' | ');
        }
      },
    });
  Le.mergeOptions({
    attributionControl: !0,
  }),
  Le.addInitHook(function () {
    this.options.attributionControl && (new Ce()).addTo(this);
  });
  Pe.Layers = Te,
  Pe.Zoom = ze,
  Pe.Scale = Me,
  Pe.Attribution = Ce,
  be.layers = function (t, i, e) {
    return new Te(t, i, e);
  }
  ,
  be.zoom = function (t) {
    return new ze(t);
  }
  ,
  be.scale = function (t) {
    return new Me(t);
  }
  ,
  be.attribution = function (t) {
    return new Ce(t);
  }
  ;
  const Ze = v.extend({
    initialize(t) {
      this._map = t;
    },
    enable() {
      return this._enabled ? this : (this._enabled = !0,
      this.addHooks(),
      this);
    },
    disable() {
      return this._enabled ? (this._enabled = !1,
      this.removeHooks(),
      this) : this;
    },
    enabled() {
      return !!this._enabled;
    },
  });
  Ze.addTo = function (t, i) {
    return t.addHandler(i, this),
    this;
  }
  ;
  var Se,
    Ee = {
      Events: hi,
    },
    ke = Vi ? 'touchstart mousedown' : 'mousedown',
    Ae = {
      mousedown: 'mouseup',
      touchstart: 'touchend',
      pointerdown: 'touchend',
      MSPointerDown: 'touchend',
    },
    Ie = {
      mousedown: 'mousemove',
      touchstart: 'touchmove',
      pointerdown: 'touchmove',
      MSPointerDown: 'touchmove',
    },
    Be = ui.extend({
      options: {
        clickTolerance: 3,
      },
      initialize(t, i, e, n) {
        l(this, n),
        this._element = t,
        this._dragStartTarget = i || t,
        this._preventOutline = e;
      },
      enable() {
        this._enabled || (V(this._dragStartTarget, ke, this._onDown, this),
        this._enabled = !0);
      },
      disable() {
        this._enabled && (Be._dragging === this && this.finishDrag(),
        q(this._dragStartTarget, ke, this._onDown, this),
        this._enabled = !1,
        this._moved = !1);
      },
      _onDown(t) {
        if (!t._simulated && this._enabled && (this._moved = !1,
        !dt(this._element, 'leaflet-zoom-anim') && !(Be._dragging || t.shiftKey || t.which !== 1 && t.button !== 1 && !t.touches || (Be._dragging = this,
        this._preventOutline && zt(this._element),
        bt(),
        mi(),
        this._moving)))) {
          this.fire('down');
          const i = t.touches ? t.touches[0] : t;
          this._startPoint = new x(i.clientX, i.clientY),
          V(document, Ie[t.type], this._onMove, this),
          V(document, Ae[t.type], this._onUp, this);
        }
      },
      _onMove(t) {
        if (!t._simulated && this._enabled) {
          if (t.touches && t.touches.length > 1) { this._moved = !0; } else {
            let i = t.touches && t.touches.length === 1 ? t.touches[0] : t,
              e = new x(i.clientX, i.clientY).subtract(this._startPoint);
            (e.x || e.y) && (Math.abs(e.x) + Math.abs(e.y) < this.options.clickTolerance || ($(t),
            this._moved || (this.fire('dragstart'),
            this._moved = !0,
            this._startPos = Pt(this._element).subtract(e),
            pt(document.body, 'leaflet-dragging'),
            this._lastTarget = t.target || t.srcElement,
            window.SVGElementInstance && this._lastTarget instanceof SVGElementInstance && (this._lastTarget = this._lastTarget.correspondingUseElement),
            pt(this._lastTarget, 'leaflet-drag-target')),
            this._newPos = this._startPos.add(e),
            this._moving = !0,
            g(this._animRequest),
            this._lastEvent = t,
            this._animRequest = f(this._updatePosition, this, !0)));
          }
        }
      },
      _updatePosition() {
        const t = {
          originalEvent: this._lastEvent,
        };
        this.fire('predrag', t),
        Lt(this._element, this._newPos),
        this.fire('drag', t);
      },
      _onUp(t) {
        !t._simulated && this._enabled && this.finishDrag();
      },
      finishDrag() {
        mt(document.body, 'leaflet-dragging'),
        this._lastTarget && (mt(this._lastTarget, 'leaflet-drag-target'),
        this._lastTarget = null);
        for (const t in Ie) {
          q(document, Ie[t], this._onMove, this),
          q(document, Ae[t], this._onUp, this);
        }
        Tt(),
        fi(),
        this._moved && this._moving && (g(this._animRequest),
        this.fire('dragend', {
          distance: this._newPos.distanceTo(this._startPos),
        })),
        this._moving = !1,
        Be._dragging = !1;
      },
    }),
    Oe = (Object.freeze || Object)({
      simplify: Ct,
      pointToSegmentDistance: Zt,
      closestPointOnSegment(t, i, e) {
        return Rt(t, i, e);
      },
      clipSegment: At,
      _getEdgeIntersection: It,
      _getBitCode: Bt,
      _sqClosestPointOnSegment: Rt,
      isFlat: Dt,
      _flat: Nt,
    }),
    Re = (Object.freeze || Object)({
      clipPolygon: jt,
    }),
    De = {
      project(t) {
        return new x(t.lng, t.lat);
      },
      unproject(t) {
        return new M(t.y, t.x);
      },
      bounds: new P([-180, -90], [180, 90]),
    },
    Ne = {
      R: 6378137,
      R_MINOR: 6356752.314245179,
      bounds: new P([-20037508.34279, -15496570.73972], [20037508.34279, 18764656.23138]),
      project(t) {
        let i = Math.PI / 180,
          e = this.R,
          n = t.lat * i,
          o = this.R_MINOR / e,
          s = Math.sqrt(1 - o * o),
          r = s * Math.sin(n),
          a = Math.tan(Math.PI / 4 - n / 2) / Math.pow((1 - r) / (1 + r), s / 2);
        return n = -e * Math.log(Math.max(a, 1e-10)),
        new x(t.lng * i * e, n);
      },
      unproject(t) {
        for (var i, e = 180 / Math.PI, n = this.R, o = this.R_MINOR / n, s = Math.sqrt(1 - o * o), r = Math.exp(-t.y / n), a = Math.PI / 2 - 2 * Math.atan(r), h = 0, u = 0.1; h < 15 && Math.abs(u) > 1e-7; h++) {
          i = s * Math.sin(a),
          i = Math.pow((1 - i) / (1 + i), s / 2),
          a += u = Math.PI / 2 - 2 * Math.atan(r * i) - a;
        }
        return new M(a * e, t.x * e / n);
      },
    },
    je = (Object.freeze || Object)({
      LonLat: De,
      Mercator: Ne,
      SphericalMercator: di,
    }),
    We = i({}, _i, {
      code: 'EPSG:3395',
      projection: Ne,
      transformation: (function () {
        const t = 0.5 / (Math.PI * Ne.R);
        return S(t, 0.5, -t, 0.5);
      }()),
    }),
    He = i({}, _i, {
      code: 'EPSG:4326',
      projection: De,
      transformation: S(1 / 180, 1, -1 / 180, 0.5),
    }),
    Fe = i({}, ci, {
      projection: De,
      transformation: S(1, 0, -1, 0),
      scale(t) {
        return Math.pow(2, t);
      },
      zoom(t) {
        return Math.log(t) / Math.LN2;
      },
      distance(t, i) {
        let e = i.lng - t.lng,
          n = i.lat - t.lat;
        return Math.sqrt(e * e + n * n);
      },
      infinite: !0,
    });
  ci.Earth = _i,
  ci.EPSG3395 = We,
  ci.EPSG3857 = vi,
  ci.EPSG900913 = yi,
  ci.EPSG4326 = He,
  ci.Simple = Fe;
  const Ue = ui.extend({
    options: {
      pane: 'overlayPane',
      attribution: null,
      bubblingMouseEvents: !0,
    },
    addTo(t) {
      return t.addLayer(this),
      this;
    },
    remove() {
      return this.removeFrom(this._map || this._mapToAdd);
    },
    removeFrom(t) {
      return t && t.removeLayer(this),
      this;
    },
    getPane(t) {
      return this._map.getPane(t ? this.options[t] || t : this.options.pane);
    },
    addInteractiveTarget(t) {
      return this._map._targets[n(t)] = this,
      this;
    },
    removeInteractiveTarget(t) {
      return delete this._map._targets[n(t)],
      this;
    },
    getAttribution() {
      return this.options.attribution;
    },
    _layerAdd(t) {
      const i = t.target;
      if (i.hasLayer(this)) {
        if (this._map = i,
        this._zoomAnimated = i._zoomAnimated,
        this.getEvents) {
          const e = this.getEvents();
          i.on(e, this),
          this.once('remove', function () {
            i.off(e, this);
          }, this);
        }
        this.onAdd(i),
        this.getAttribution && i.attributionControl && i.attributionControl.addAttribution(this.getAttribution()),
        this.fire('add'),
        i.fire('layeradd', {
          layer: this,
        });
      }
    },
  });
  Le.include({
    addLayer(t) {
      if (!t._layerAdd) { throw new Error('The provided object is not a Layer.'); }
      const i = n(t);
      return this._layers[i] ? this : (this._layers[i] = t,
      t._mapToAdd = this,
      t.beforeAdd && t.beforeAdd(this),
      this.whenReady(t._layerAdd, t),
      this);
    },
    removeLayer(t) {
      const i = n(t);
      return this._layers[i] ? (this._loaded && t.onRemove(this),
      t.getAttribution && this.attributionControl && this.attributionControl.removeAttribution(t.getAttribution()),
      delete this._layers[i],
      this._loaded && (this.fire('layerremove', {
        layer: t,
      }),
      t.fire('remove')),
      t._map = t._mapToAdd = null,
      this) : this;
    },
    hasLayer(t) {
      return !!t && n(t) in this._layers;
    },
    eachLayer(t, i) {
      for (const e in this._layers) { t.call(i, this._layers[e]); }
      return this;
    },
    _addLayers(t) {
      for (let i = 0, e = (t = t ? ei(t) ? t : [t] : []).length; i < e; i++) { this.addLayer(t[i]); }
    },
    _addZoomLimit(t) {
      !isNaN(t.options.maxZoom) && isNaN(t.options.minZoom) || (this._zoomBoundLayers[n(t)] = t,
      this._updateZoomLevels());
    },
    _removeZoomLimit(t) {
      const i = n(t);
      this._zoomBoundLayers[i] && (delete this._zoomBoundLayers[i],
      this._updateZoomLevels());
    },
    _updateZoomLevels() {
      let t = 1 / 0,
        i = -1 / 0,
        e = this._getZoomSpan();
      for (const n in this._zoomBoundLayers) {
        const o = this._zoomBoundLayers[n].options;
        t = void 0 === o.minZoom ? t : Math.min(t, o.minZoom),
        i = void 0 === o.maxZoom ? i : Math.max(i, o.maxZoom);
      }
      this._layersMaxZoom = i === -1 / 0 ? void 0 : i,
      this._layersMinZoom = t === 1 / 0 ? void 0 : t,
      e !== this._getZoomSpan() && this.fire('zoomlevelschange'),
      void 0 === this.options.maxZoom && this._layersMaxZoom && this.getZoom() > this._layersMaxZoom && this.setZoom(this._layersMaxZoom),
      void 0 === this.options.minZoom && this._layersMinZoom && this.getZoom() < this._layersMinZoom && this.setZoom(this._layersMinZoom);
    },
  });
  var Ve = Ue.extend({
      initialize(t, i) {
        l(this, i),
        this._layers = {};
        let e,
          n;
        if (t) {
          for (e = 0,
          n = t.length; e < n; e++) { this.addLayer(t[e]); }
        }
      },
      addLayer(t) {
        const i = this.getLayerId(t);
        return this._layers[i] = t,
        this._map && this._map.addLayer(t),
        this;
      },
      removeLayer(t) {
        const i = t in this._layers ? t : this.getLayerId(t);
        return this._map && this._layers[i] && this._map.removeLayer(this._layers[i]),
        delete this._layers[i],
        this;
      },
      hasLayer(t) {
        return !!t && (t in this._layers || this.getLayerId(t) in this._layers);
      },
      clearLayers() {
        return this.eachLayer(this.removeLayer, this);
      },
      invoke(t) {
        let i,
          e,
          n = Array.prototype.slice.call(arguments, 1);
        for (i in this._layers) { (e = this._layers[i])[t] && e[t](...n); }
        return this;
      },
      onAdd(t) {
        this.eachLayer(t.addLayer, t);
      },
      onRemove(t) {
        this.eachLayer(t.removeLayer, t);
      },
      eachLayer(t, i) {
        for (const e in this._layers) { t.call(i, this._layers[e]); }
        return this;
      },
      getLayer(t) {
        return this._layers[t];
      },
      getLayers() {
        const t = [];
        return this.eachLayer(t.push, t),
        t;
      },
      setZIndex(t) {
        return this.invoke('setZIndex', t);
      },
      getLayerId(t) {
        return n(t);
      },
    }),
    qe = Ve.extend({
      addLayer(t) {
        return this.hasLayer(t) ? this : (t.addEventParent(this),
        Ve.prototype.addLayer.call(this, t),
        this.fire('layeradd', {
          layer: t,
        }));
      },
      removeLayer(t) {
        return this.hasLayer(t) ? (t in this._layers && (t = this._layers[t]),
        t.removeEventParent(this),
        Ve.prototype.removeLayer.call(this, t),
        this.fire('layerremove', {
          layer: t,
        })) : this;
      },
      setStyle(t) {
        return this.invoke('setStyle', t);
      },
      bringToFront() {
        return this.invoke('bringToFront');
      },
      bringToBack() {
        return this.invoke('bringToBack');
      },
      getBounds() {
        const t = new T();
        for (const i in this._layers) {
          const e = this._layers[i];
          t.extend(e.getBounds ? e.getBounds() : e.getLatLng());
        }
        return t;
      },
    }),
    Ge = v.extend({
      options: {
        popupAnchor: [0, 0],
        tooltipAnchor: [0, 0],
      },
      initialize(t) {
        l(this, t);
      },
      createIcon(t) {
        return this._createIcon('icon', t);
      },
      createShadow(t) {
        return this._createIcon('shadow', t);
      },
      _createIcon(t, i) {
        const e = this._getIconUrl(t);
        if (!e) {
          if (t === 'icon') { throw new Error('iconUrl not set in Icon options (see the docs).'); }
          return null;
        }
        const n = this._createImg(e, i && i.tagName === 'IMG' ? i : null);
        return this._setIconStyles(n, t),
        n;
      },
      _setIconStyles(t, i) {
        let e = this.options,
          n = e[`${i}Size`];
        typeof n === 'number' && (n = [n, n]);
        let o = w(n),
          s = w(i === 'shadow' && e.shadowAnchor || e.iconAnchor || o && o.divideBy(2, !0));
        t.className = `leaflet-marker-${i} ${e.className || ''}`,
        s && (t.style.marginLeft = `${-s.x}px`,
        t.style.marginTop = `${-s.y}px`),
        o && (t.style.width = `${o.x}px`,
        t.style.height = `${o.y}px`);
      },
      _createImg(t, i) {
        return i = i || document.createElement('img'),
        i.src = t,
        i;
      },
      _getIconUrl(t) {
        return Ki && this.options[`${t}RetinaUrl`] || this.options[`${t}Url`];
      },
    }),
    Ke = Ge.extend({
      options: {
        iconUrl: 'marker-icon.png',
        iconRetinaUrl: 'marker-icon-2x.png',
        shadowUrl: 'marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      },
      _getIconUrl(t) {
        return Ke.imagePath || (Ke.imagePath = this._detectIconPath()),
        (this.options.imagePath || Ke.imagePath) + Ge.prototype._getIconUrl.call(this, t);
      },
      _detectIconPath() {
        let t = ht('div', 'leaflet-default-icon-path', document.body),
          i = at(t, 'background-image') || at(t, 'backgroundImage');
        return document.body.removeChild(t),
        i = i === null || i.indexOf('url') !== 0 ? '' : i.replace(/^url\(["']?/, '').replace(/marker-icon\.png["']?\)$/, '');
      },
    }),
    Ye = Ze.extend({
      initialize(t) {
        this._marker = t;
      },
      addHooks() {
        const t = this._marker._icon;
        this._draggable || (this._draggable = new Be(t, t, !0)),
        this._draggable.on({
          dragstart: this._onDragStart,
          predrag: this._onPreDrag,
          drag: this._onDrag,
          dragend: this._onDragEnd,
        }, this).enable(),
        pt(t, 'leaflet-marker-draggable');
      },
      removeHooks() {
        this._draggable.off({
          dragstart: this._onDragStart,
          predrag: this._onPreDrag,
          drag: this._onDrag,
          dragend: this._onDragEnd,
        }, this).disable(),
        this._marker._icon && mt(this._marker._icon, 'leaflet-marker-draggable');
      },
      moved() {
        return this._draggable && this._draggable._moved;
      },
      _adjustPan(t) {
        let i = this._marker,
          e = i._map,
          n = this._marker.options.autoPanSpeed,
          o = this._marker.options.autoPanPadding,
          s = L.DomUtil.getPosition(i._icon),
          r = e.getPixelBounds(),
          a = e.getPixelOrigin(),
          h = b(r.min._subtract(a).add(o), r.max._subtract(a).subtract(o));
        if (!h.contains(s)) {
          const u = w((Math.max(h.max.x, s.x) - h.max.x) / (r.max.x - h.max.x) - (Math.min(h.min.x, s.x) - h.min.x) / (r.min.x - h.min.x), (Math.max(h.max.y, s.y) - h.max.y) / (r.max.y - h.max.y) - (Math.min(h.min.y, s.y) - h.min.y) / (r.min.y - h.min.y)).multiplyBy(n);
          e.panBy(u, {
            animate: !1,
          }),
          this._draggable._newPos._add(u),
          this._draggable._startPos._add(u),
          L.DomUtil.setPosition(i._icon, this._draggable._newPos),
          this._onDrag(t),
          this._panRequest = f(this._adjustPan.bind(this, t));
        }
      },
      _onDragStart() {
        this._oldLatLng = this._marker.getLatLng(),
        this._marker.closePopup().fire('movestart').fire('dragstart');
      },
      _onPreDrag(t) {
        this._marker.options.autoPan && (g(this._panRequest),
        this._panRequest = f(this._adjustPan.bind(this, t)));
      },
      _onDrag(t) {
        let i = this._marker,
          e = i._shadow,
          n = Pt(i._icon),
          o = i._map.layerPointToLatLng(n);
        e && Lt(e, n),
        i._latlng = o,
        t.latlng = o,
        t.oldLatLng = this._oldLatLng,
        i.fire('move', t).fire('drag', t);
      },
      _onDragEnd(t) {
        g(this._panRequest),
        delete this._oldLatLng,
        this._marker.fire('moveend').fire('dragend', t);
      },
    }),
    Xe = Ue.extend({
      options: {
        icon: new Ke(),
        interactive: !0,
        draggable: !1,
        autoPan: !1,
        autoPanPadding: [50, 50],
        autoPanSpeed: 10,
        keyboard: !0,
        title: '',
        alt: '',
        zIndexOffset: 0,
        opacity: 1,
        riseOnHover: !1,
        riseOffset: 250,
        pane: 'markerPane',
        bubblingMouseEvents: !1,
      },
      initialize(t, i) {
        l(this, i),
        this._latlng = C(t);
      },
      onAdd(t) {
        this._zoomAnimated = this._zoomAnimated && t.options.markerZoomAnimation,
        this._zoomAnimated && t.on('zoomanim', this._animateZoom, this),
        this._initIcon(),
        this.update();
      },
      onRemove(t) {
        this.dragging && this.dragging.enabled() && (this.options.draggable = !0,
        this.dragging.removeHooks()),
        delete this.dragging,
        this._zoomAnimated && t.off('zoomanim', this._animateZoom, this),
        this._removeIcon(),
        this._removeShadow();
      },
      getEvents() {
        return {
          zoom: this.update,
          viewreset: this.update,
        };
      },
      getLatLng() {
        return this._latlng;
      },
      setLatLng(t) {
        const i = this._latlng;
        return this._latlng = C(t),
        this.update(),
        this.fire('move', {
          oldLatLng: i,
          latlng: this._latlng,
        });
      },
      setZIndexOffset(t) {
        return this.options.zIndexOffset = t,
        this.update();
      },
      setIcon(t) {
        return this.options.icon = t,
        this._map && (this._initIcon(),
        this.update()),
        this._popup && this.bindPopup(this._popup, this._popup.options),
        this;
      },
      getElement() {
        return this._icon;
      },
      update() {
        if (this._icon && this._map) {
          const t = this._map.latLngToLayerPoint(this._latlng).round();
          this._setPos(t);
        }
        return this;
      },
      _initIcon() {
        let t = this.options,
          i = `leaflet-zoom-${this._zoomAnimated ? 'animated' : 'hide'}`,
          e = t.icon.createIcon(this._icon),
          n = !1;
        e !== this._icon && (this._icon && this._removeIcon(),
        n = !0,
        t.title && (e.title = t.title),
        e.tagName === 'IMG' && (e.alt = t.alt || '')),
        pt(e, i),
        t.keyboard && (e.tabIndex = '0'),
        this._icon = e,
        t.riseOnHover && this.on({
          mouseover: this._bringToFront,
          mouseout: this._resetZIndex,
        });
        let o = t.icon.createShadow(this._shadow),
          s = !1;
        o !== this._shadow && (this._removeShadow(),
        s = !0),
        o && (pt(o, i),
        o.alt = ''),
        this._shadow = o,
        t.opacity < 1 && this._updateOpacity(),
        n && this.getPane().appendChild(this._icon),
        this._initInteraction(),
        o && s && this.getPane('shadowPane').appendChild(this._shadow);
      },
      _removeIcon() {
        this.options.riseOnHover && this.off({
          mouseover: this._bringToFront,
          mouseout: this._resetZIndex,
        }),
        ut(this._icon),
        this.removeInteractiveTarget(this._icon),
        this._icon = null;
      },
      _removeShadow() {
        this._shadow && ut(this._shadow),
        this._shadow = null;
      },
      _setPos(t) {
        Lt(this._icon, t),
        this._shadow && Lt(this._shadow, t),
        this._zIndex = t.y + this.options.zIndexOffset,
        this._resetZIndex();
      },
      _updateZIndex(t) {
        this._icon.style.zIndex = this._zIndex + t;
      },
      _animateZoom(t) {
        const i = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center).round();
        this._setPos(i);
      },
      _initInteraction() {
        if (this.options.interactive && (pt(this._icon, 'leaflet-interactive'),
        this.addInteractiveTarget(this._icon),
        Ye)) {
          let t = this.options.draggable;
          this.dragging && (t = this.dragging.enabled(),
          this.dragging.disable()),
          this.dragging = new Ye(this),
          t && this.dragging.enable();
        }
      },
      setOpacity(t) {
        return this.options.opacity = t,
        this._map && this._updateOpacity(),
        this;
      },
      _updateOpacity() {
        const t = this.options.opacity;
        vt(this._icon, t),
        this._shadow && vt(this._shadow, t);
      },
      _bringToFront() {
        this._updateZIndex(this.options.riseOffset);
      },
      _resetZIndex() {
        this._updateZIndex(0);
      },
      _getPopupAnchor() {
        return this.options.icon.options.popupAnchor;
      },
      _getTooltipAnchor() {
        return this.options.icon.options.tooltipAnchor;
      },
    }),
    Je = Ue.extend({
      options: {
        stroke: !0,
        color: '#3388ff',
        weight: 3,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: null,
        dashOffset: null,
        fill: !1,
        fillColor: null,
        fillOpacity: 0.2,
        fillRule: 'evenodd',
        interactive: !0,
        bubblingMouseEvents: !0,
      },
      beforeAdd(t) {
        this._renderer = t.getRenderer(this);
      },
      onAdd() {
        this._renderer._initPath(this),
        this._reset(),
        this._renderer._addPath(this);
      },
      onRemove() {
        this._renderer._removePath(this);
      },
      redraw() {
        return this._map && this._renderer._updatePath(this),
        this;
      },
      setStyle(t) {
        return l(this, t),
        this._renderer && this._renderer._updateStyle(this),
        this;
      },
      bringToFront() {
        return this._renderer && this._renderer._bringToFront(this),
        this;
      },
      bringToBack() {
        return this._renderer && this._renderer._bringToBack(this),
        this;
      },
      getElement() {
        return this._path;
      },
      _reset() {
        this._project(),
        this._update();
      },
      _clickTolerance() {
        return (this.options.stroke ? this.options.weight / 2 : 0) + this._renderer.options.tolerance;
      },
    }),
    $e = Je.extend({
      options: {
        fill: !0,
        radius: 10,
      },
      initialize(t, i) {
        l(this, i),
        this._latlng = C(t),
        this._radius = this.options.radius;
      },
      setLatLng(t) {
        return this._latlng = C(t),
        this.redraw(),
        this.fire('move', {
          latlng: this._latlng,
        });
      },
      getLatLng() {
        return this._latlng;
      },
      setRadius(t) {
        return this.options.radius = this._radius = t,
        this.redraw();
      },
      getRadius() {
        return this._radius;
      },
      setStyle(t) {
        const i = t && t.radius || this._radius;
        return Je.prototype.setStyle.call(this, t),
        this.setRadius(i),
        this;
      },
      _project() {
        this._point = this._map.latLngToLayerPoint(this._latlng),
        this._updateBounds();
      },
      _updateBounds() {
        let t = this._radius,
          i = this._radiusY || t,
          e = this._clickTolerance(),
          n = [t + e, i + e];
        this._pxBounds = new P(this._point.subtract(n), this._point.add(n));
      },
      _update() {
        this._map && this._updatePath();
      },
      _updatePath() {
        this._renderer._updateCircle(this);
      },
      _empty() {
        return this._radius && !this._renderer._bounds.intersects(this._pxBounds);
      },
      _containsPoint(t) {
        return t.distanceTo(this._point) <= this._radius + this._clickTolerance();
      },
    }),
    Qe = $e.extend({
      initialize(t, e, n) {
        if (typeof e === 'number' && (e = i({}, n, {
          radius: e,
        })),
        l(this, e),
        this._latlng = C(t),
        isNaN(this.options.radius)) { throw new Error('Circle radius cannot be NaN'); }
        this._mRadius = this.options.radius;
      },
      setRadius(t) {
        return this._mRadius = t,
        this.redraw();
      },
      getRadius() {
        return this._mRadius;
      },
      getBounds() {
        const t = [this._radius, this._radiusY || this._radius];
        return new T(this._map.layerPointToLatLng(this._point.subtract(t)), this._map.layerPointToLatLng(this._point.add(t)));
      },
      setStyle: Je.prototype.setStyle,
      _project() {
        let t = this._latlng.lng,
          i = this._latlng.lat,
          e = this._map,
          n = e.options.crs;
        if (n.distance === _i.distance) {
          let o = Math.PI / 180,
            s = this._mRadius / _i.R / o,
            r = e.project([i + s, t]),
            a = e.project([i - s, t]),
            h = r.add(a).divideBy(2),
            u = e.unproject(h).lat,
            l = Math.acos((Math.cos(s * o) - Math.sin(i * o) * Math.sin(u * o)) / (Math.cos(i * o) * Math.cos(u * o))) / o;
          (isNaN(l) || l === 0) && (l = s / Math.cos(Math.PI / 180 * i)),
          this._point = h.subtract(e.getPixelOrigin()),
          this._radius = isNaN(l) ? 0 : h.x - e.project([u, t - l]).x,
          this._radiusY = h.y - r.y;
        } else {
          const c = n.unproject(n.project(this._latlng).subtract([this._mRadius, 0]));
          this._point = e.latLngToLayerPoint(this._latlng),
          this._radius = this._point.x - e.latLngToLayerPoint(c).x;
        }
        this._updateBounds();
      },
    }),
    tn = Je.extend({
      options: {
        smoothFactor: 1,
        noClip: !1,
      },
      initialize(t, i) {
        l(this, i),
        this._setLatLngs(t);
      },
      getLatLngs() {
        return this._latlngs;
      },
      setLatLngs(t) {
        return this._setLatLngs(t),
        this.redraw();
      },
      isEmpty() {
        return !this._latlngs.length;
      },
      closestLayerPoint(t) {
        for (var i, e, n = 1 / 0, o = null, s = Rt, r = 0, a = this._parts.length; r < a; r++) {
          for (let h = this._parts[r], u = 1, l = h.length; u < l; u++) {
            const c = s(t, i = h[u - 1], e = h[u], !0);
            c < n && (n = c,
            o = s(t, i, e));
          }
        }
        return o && (o.distance = Math.sqrt(n)),
        o;
      },
      getCenter() {
        if (!this._map) { throw new Error('Must add layer to map before using getCenter()'); }
        let t,
          i,
          e,
          n,
          o,
          s,
          r,
          a = this._rings[0],
          h = a.length;
        if (!h) { return null; }
        for (t = 0,
        i = 0; t < h - 1; t++) { i += a[t].distanceTo(a[t + 1]) / 2; }
        if (i === 0) { return this._map.layerPointToLatLng(a[0]); }
        for (t = 0,
        n = 0; t < h - 1; t++) {
          if (o = a[t],
          s = a[t + 1],
          e = o.distanceTo(s),
          (n += e) > i) {
            return r = (n - i) / e,
            this._map.layerPointToLatLng([s.x - r * (s.x - o.x), s.y - r * (s.y - o.y)]);
          }
        }
      },
      getBounds() {
        return this._bounds;
      },
      addLatLng(t, i) {
        return i = i || this._defaultShape(),
        t = C(t),
        i.push(t),
        this._bounds.extend(t),
        this.redraw();
      },
      _setLatLngs(t) {
        this._bounds = new T(),
        this._latlngs = this._convertLatLngs(t);
      },
      _defaultShape() {
        return Dt(this._latlngs) ? this._latlngs : this._latlngs[0];
      },
      _convertLatLngs(t) {
        for (var i = [], e = Dt(t), n = 0, o = t.length; n < o; n++) {
          e ? (i[n] = C(t[n]),
          this._bounds.extend(i[n])) : i[n] = this._convertLatLngs(t[n]);
        }
        return i;
      },
      _project() {
        const t = new P();
        this._rings = [],
        this._projectLatlngs(this._latlngs, this._rings, t);
        let i = this._clickTolerance(),
          e = new x(i, i);
        this._bounds.isValid() && t.isValid() && (t.min._subtract(e),
        t.max._add(e),
        this._pxBounds = t);
      },
      _projectLatlngs(t, i, e) {
        let n,
          o,
          s = t[0] instanceof M,
          r = t.length;
        if (s) {
          for (o = [],
          n = 0; n < r; n++) {
            o[n] = this._map.latLngToLayerPoint(t[n]),
            e.extend(o[n]);
          }
          i.push(o);
        } else {
          for (n = 0; n < r; n++) { this._projectLatlngs(t[n], i, e); }
        }
      },
      _clipPoints() {
        const t = this._renderer._bounds;
        if (this._parts = [],
        this._pxBounds && this._pxBounds.intersects(t)) {
          if (this.options.noClip) { this._parts = this._rings; } else {
            let i,
              e,
              n,
              o,
              s,
              r,
              a,
              h = this._parts;
            for (i = 0,
            n = 0,
            o = this._rings.length; i < o; i++) {
              for (e = 0,
              s = (a = this._rings[i]).length; e < s - 1; e++) {
                (r = At(a[e], a[e + 1], t, e, !0)) && (h[n] = h[n] || [],
                h[n].push(r[0]),
                r[1] === a[e + 1] && e !== s - 2 || (h[n].push(r[1]),
                n++));
              }
            }
          }
        }
      },
      _simplifyPoints() {
        for (let t = this._parts, i = this.options.smoothFactor, e = 0, n = t.length; e < n; e++) { t[e] = Ct(t[e], i); }
      },
      _update() {
        this._map && (this._clipPoints(),
        this._simplifyPoints(),
        this._updatePath());
      },
      _updatePath() {
        this._renderer._updatePoly(this);
      },
      _containsPoint(t, i) {
        let e,
          n,
          o,
          s,
          r,
          a,
          h = this._clickTolerance();
        if (!this._pxBounds || !this._pxBounds.contains(t)) { return !1; }
        for (e = 0,
        s = this._parts.length; e < s; e++) {
          for (n = 0,
          o = (r = (a = this._parts[e]).length) - 1; n < r; o = n++) {
            if ((i || n !== 0) && Zt(t, a[o], a[n]) <= h) { return !0; }
          }
        }
        return !1;
      },
    });
  tn._flat = Nt;
  var en = tn.extend({
      options: {
        fill: !0,
      },
      isEmpty() {
        return !this._latlngs.length || !this._latlngs[0].length;
      },
      getCenter() {
        if (!this._map) { throw new Error('Must add layer to map before using getCenter()'); }
        let t,
          i,
          e,
          n,
          o,
          s,
          r,
          a,
          h,
          u = this._rings[0],
          l = u.length;
        if (!l) { return null; }
        for (s = r = a = 0,
        t = 0,
        i = l - 1; t < l; i = t++) {
          e = u[t],
          n = u[i],
          o = e.y * n.x - n.y * e.x,
          r += (e.x + n.x) * o,
          a += (e.y + n.y) * o,
          s += 3 * o;
        }
        return h = s === 0 ? u[0] : [r / s, a / s],
        this._map.layerPointToLatLng(h);
      },
      _convertLatLngs(t) {
        let i = tn.prototype._convertLatLngs.call(this, t),
          e = i.length;
        return e >= 2 && i[0] instanceof M && i[0].equals(i[e - 1]) && i.pop(),
        i;
      },
      _setLatLngs(t) {
        tn.prototype._setLatLngs.call(this, t),
        Dt(this._latlngs) && (this._latlngs = [this._latlngs]);
      },
      _defaultShape() {
        return Dt(this._latlngs[0]) ? this._latlngs[0] : this._latlngs[0][0];
      },
      _clipPoints() {
        let t = this._renderer._bounds,
          i = this.options.weight,
          e = new x(i, i);
        if (t = new P(t.min.subtract(e), t.max.add(e)),
        this._parts = [],
        this._pxBounds && this._pxBounds.intersects(t)) {
          if (this.options.noClip) { this._parts = this._rings; } else {
            for (var n, o = 0, s = this._rings.length; o < s; o++) { (n = jt(this._rings[o], t, !0)).length && this._parts.push(n); }
          }
        }
      },
      _updatePath() {
        this._renderer._updatePoly(this, !0);
      },
      _containsPoint(t) {
        let i,
          e,
          n,
          o,
          s,
          r,
          a,
          h,
          u = !1;
        if (!this._pxBounds.contains(t)) { return !1; }
        for (o = 0,
        a = this._parts.length; o < a; o++) {
          for (s = 0,
          r = (h = (i = this._parts[o]).length) - 1; s < h; r = s++) {
            e = i[s],
            n = i[r],
            e.y > t.y != n.y > t.y && t.x < (n.x - e.x) * (t.y - e.y) / (n.y - e.y) + e.x && (u = !u);
          }
        }
        return u || tn.prototype._containsPoint.call(this, t, !0);
      },
    }),
    nn = qe.extend({
      initialize(t, i) {
        l(this, i),
        this._layers = {},
        t && this.addData(t);
      },
      addData(t) {
        let i,
          e,
          n,
          o = ei(t) ? t : t.features;
        if (o) {
          for (i = 0,
          e = o.length; i < e; i++) { ((n = o[i]).geometries || n.geometry || n.features || n.coordinates) && this.addData(n); }
          return this;
        }
        const s = this.options;
        if (s.filter && !s.filter(t)) { return this; }
        const r = Wt(t, s);
        return r ? (r.feature = Gt(t),
        r.defaultOptions = r.options,
        this.resetStyle(r),
        s.onEachFeature && s.onEachFeature(t, r),
        this.addLayer(r)) : this;
      },
      resetStyle(t) {
        return t.options = i({}, t.defaultOptions),
        this._setLayerStyle(t, this.options.style),
        this;
      },
      setStyle(t) {
        return this.eachLayer(function (i) {
          this._setLayerStyle(i, t);
        }, this);
      },
      _setLayerStyle(t, i) {
        typeof i === 'function' && (i = i(t.feature)),
        t.setStyle && t.setStyle(i);
      },
    }),
    on = {
      toGeoJSON(t) {
        return qt(this, {
          type: 'Point',
          coordinates: Ut(this.getLatLng(), t),
        });
      },
    };
  Xe.include(on),
  Qe.include(on),
  $e.include(on),
  tn.include({
    toGeoJSON(t) {
      let i = !Dt(this._latlngs),
        e = Vt(this._latlngs, i ? 1 : 0, !1, t);
      return qt(this, {
        type: `${i ? 'Multi' : ''}LineString`,
        coordinates: e,
      });
    },
  }),
  en.include({
    toGeoJSON(t) {
      let i = !Dt(this._latlngs),
        e = i && !Dt(this._latlngs[0]),
        n = Vt(this._latlngs, e ? 2 : i ? 1 : 0, !0, t);
      return i || (n = [n]),
      qt(this, {
        type: `${e ? 'Multi' : ''}Polygon`,
        coordinates: n,
      });
    },
  }),
  Ve.include({
    toMultiPoint(t) {
      const i = [];
      return this.eachLayer((e) => {
        i.push(e.toGeoJSON(t).geometry.coordinates);
      }),
      qt(this, {
        type: 'MultiPoint',
        coordinates: i,
      });
    },
    toGeoJSON(t) {
      const i = this.feature && this.feature.geometry && this.feature.geometry.type;
      if (i === 'MultiPoint') { return this.toMultiPoint(t); }
      let e = i === 'GeometryCollection',
        n = [];
      return this.eachLayer((i) => {
        if (i.toGeoJSON) {
          const o = i.toGeoJSON(t);
          if (e) { n.push(o.geometry); } else {
            const s = Gt(o);
            s.type === 'FeatureCollection' ? n.push(...s.features) : n.push(s);
          }
        }
      }),
      e ? qt(this, {
        geometries: n,
        type: 'GeometryCollection',
      }) : {
        type: 'FeatureCollection',
        features: n,
      };
    },
  });
  let sn = Kt,
    rn = Ue.extend({
      options: {
        opacity: 1,
        alt: '',
        interactive: !1,
        crossOrigin: !1,
        errorOverlayUrl: '',
        zIndex: 1,
        className: '',
      },
      initialize(t, i, e) {
        this._url = t,
        this._bounds = z(i),
        l(this, e);
      },
      onAdd() {
        this._image || (this._initImage(),
        this.options.opacity < 1 && this._updateOpacity()),
        this.options.interactive && (pt(this._image, 'leaflet-interactive'),
        this.addInteractiveTarget(this._image)),
        this.getPane().appendChild(this._image),
        this._reset();
      },
      onRemove() {
        ut(this._image),
        this.options.interactive && this.removeInteractiveTarget(this._image);
      },
      setOpacity(t) {
        return this.options.opacity = t,
        this._image && this._updateOpacity(),
        this;
      },
      setStyle(t) {
        return t.opacity && this.setOpacity(t.opacity),
        this;
      },
      bringToFront() {
        return this._map && ct(this._image),
        this;
      },
      bringToBack() {
        return this._map && _t(this._image),
        this;
      },
      setUrl(t) {
        return this._url = t,
        this._image && (this._image.src = t),
        this;
      },
      setBounds(t) {
        return this._bounds = z(t),
        this._map && this._reset(),
        this;
      },
      getEvents() {
        const t = {
          zoom: this._reset,
          viewreset: this._reset,
        };
        return this._zoomAnimated && (t.zoomanim = this._animateZoom),
        t;
      },
      setZIndex(t) {
        return this.options.zIndex = t,
        this._updateZIndex(),
        this;
      },
      getBounds() {
        return this._bounds;
      },
      getElement() {
        return this._image;
      },
      _initImage() {
        let t = this._url.tagName === 'IMG',
          i = this._image = t ? this._url : ht('img');
        pt(i, 'leaflet-image-layer'),
        this._zoomAnimated && pt(i, 'leaflet-zoom-animated'),
        this.options.className && pt(i, this.options.className),
        i.onselectstart = r,
        i.onmousemove = r,
        i.onload = e(this.fire, this, 'load'),
        i.onerror = e(this._overlayOnError, this, 'error'),
        this.options.crossOrigin && (i.crossOrigin = ''),
        this.options.zIndex && this._updateZIndex(),
        t ? this._url = i.src : (i.src = this._url,
        i.alt = this.options.alt);
      },
      _animateZoom(t) {
        let i = this._map.getZoomScale(t.zoom),
          e = this._map._latLngBoundsToNewLayerBounds(this._bounds, t.zoom, t.center).min;
        wt(this._image, e, i);
      },
      _reset() {
        let t = this._image,
          i = new P(this._map.latLngToLayerPoint(this._bounds.getNorthWest()), this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
          e = i.getSize();
        Lt(t, i.min),
        t.style.width = `${e.x}px`,
        t.style.height = `${e.y}px`;
      },
      _updateOpacity() {
        vt(this._image, this.options.opacity);
      },
      _updateZIndex() {
        this._image && void 0 !== this.options.zIndex && this.options.zIndex !== null && (this._image.style.zIndex = this.options.zIndex);
      },
      _overlayOnError() {
        this.fire('error');
        const t = this.options.errorOverlayUrl;
        t && this._url !== t && (this._url = t,
        this._image.src = t);
      },
    }),
    an = rn.extend({
      options: {
        autoplay: !0,
        loop: !0,
      },
      _initImage() {
        let t = this._url.tagName === 'VIDEO',
          i = this._image = t ? this._url : ht('video');
        if (pt(i, 'leaflet-image-layer'),
        this._zoomAnimated && pt(i, 'leaflet-zoom-animated'),
        i.onselectstart = r,
        i.onmousemove = r,
        i.onloadeddata = e(this.fire, this, 'load'),
        t) {
          for (var n = i.getElementsByTagName('source'), o = [], s = 0; s < n.length; s++) { o.push(n[s].src); }
          this._url = n.length > 0 ? o : [i.src];
        } else {
          ei(this._url) || (this._url = [this._url]),
          i.autoplay = !!this.options.autoplay,
          i.loop = !!this.options.loop;
          for (let a = 0; a < this._url.length; a++) {
            const h = ht('source');
            h.src = this._url[a],
            i.appendChild(h);
          }
        }
      },
    }),
    hn = Ue.extend({
      options: {
        offset: [0, 7],
        className: '',
        pane: 'popupPane',
      },
      initialize(t, i) {
        l(this, t),
        this._source = i;
      },
      onAdd(t) {
        this._zoomAnimated = t._zoomAnimated,
        this._container || this._initLayout(),
        t._fadeAnimated && vt(this._container, 0),
        clearTimeout(this._removeTimeout),
        this.getPane().appendChild(this._container),
        this.update(),
        t._fadeAnimated && vt(this._container, 1),
        this.bringToFront();
      },
      onRemove(t) {
        t._fadeAnimated ? (vt(this._container, 0),
        this._removeTimeout = setTimeout(e(ut, void 0, this._container), 200)) : ut(this._container);
      },
      getLatLng() {
        return this._latlng;
      },
      setLatLng(t) {
        return this._latlng = C(t),
        this._map && (this._updatePosition(),
        this._adjustPan()),
        this;
      },
      getContent() {
        return this._content;
      },
      setContent(t) {
        return this._content = t,
        this.update(),
        this;
      },
      getElement() {
        return this._container;
      },
      update() {
        this._map && (this._container.style.visibility = 'hidden',
        this._updateContent(),
        this._updateLayout(),
        this._updatePosition(),
        this._container.style.visibility = '',
        this._adjustPan());
      },
      getEvents() {
        const t = {
          zoom: this._updatePosition,
          viewreset: this._updatePosition,
        };
        return this._zoomAnimated && (t.zoomanim = this._animateZoom),
        t;
      },
      isOpen() {
        return !!this._map && this._map.hasLayer(this);
      },
      bringToFront() {
        return this._map && ct(this._container),
        this;
      },
      bringToBack() {
        return this._map && _t(this._container),
        this;
      },
      _updateContent() {
        if (this._content) {
          let t = this._contentNode,
            i = typeof this._content === 'function' ? this._content(this._source || this) : this._content;
          if (typeof i === 'string') { t.innerHTML = i; } else {
            for (; t.hasChildNodes();) { t.removeChild(t.firstChild); }
            t.appendChild(i);
          }
          this.fire('contentupdate');
        }
      },
      _updatePosition() {
        if (this._map) {
          let t = this._map.latLngToLayerPoint(this._latlng),
            i = w(this.options.offset),
            e = this._getAnchor();
          this._zoomAnimated ? Lt(this._container, t.add(e)) : i = i.add(t).add(e);
          let n = this._containerBottom = -i.y,
            o = this._containerLeft = -Math.round(this._containerWidth / 2) + i.x;
          this._container.style.bottom = `${n}px`,
          this._container.style.left = `${o}px`;
        }
      },
      _getAnchor() {
        return [0, 0];
      },
    }),
    un = hn.extend({
      options: {
        maxWidth: 300,
        minWidth: 50,
        maxHeight: null,
        autoPan: !0,
        autoPanPaddingTopLeft: null,
        autoPanPaddingBottomRight: null,
        autoPanPadding: [5, 5],
        keepInView: !1,
        closeButton: !0,
        autoClose: !0,
        closeOnEscapeKey: !0,
        className: '',
      },
      openOn(t) {
        return t.openPopup(this),
        this;
      },
      onAdd(t) {
        hn.prototype.onAdd.call(this, t),
        t.fire('popupopen', {
          popup: this,
        }),
        this._source && (this._source.fire('popupopen', {
          popup: this,
        }, !0),
        this._source instanceof Je || this._source.on('preclick', Y));
      },
      onRemove(t) {
        hn.prototype.onRemove.call(this, t),
        t.fire('popupclose', {
          popup: this,
        }),
        this._source && (this._source.fire('popupclose', {
          popup: this,
        }, !0),
        this._source instanceof Je || this._source.off('preclick', Y));
      },
      getEvents() {
        const t = hn.prototype.getEvents.call(this);
        return (void 0 !== this.options.closeOnClick ? this.options.closeOnClick : this._map.options.closePopupOnClick) && (t.preclick = this._close),
        this.options.keepInView && (t.moveend = this._adjustPan),
        t;
      },
      _close() {
        this._map && this._map.closePopup(this);
      },
      _initLayout() {
        let t = 'leaflet-popup',
          i = this._container = ht('div', `${t} ${this.options.className || ''} leaflet-zoom-animated`),
          e = this._wrapper = ht('div', `${t}-content-wrapper`, i);
        if (this._contentNode = ht('div', `${t}-content`, e),
        J(e),
        X(this._contentNode),
        V(e, 'contextmenu', Y),
        this._tipContainer = ht('div', `${t}-tip-container`, i),
        this._tip = ht('div', `${t}-tip`, this._tipContainer),
        this.options.closeButton) {
          const n = this._closeButton = ht('a', `${t}-close-button`, i);
          n.href = '#close',
          n.innerHTML = '&#215;',
          V(n, 'click', this._onCloseButtonClick, this);
        }
      },
      _updateLayout() {
        let t = this._contentNode,
          i = t.style;
        i.width = '',
        i.whiteSpace = 'nowrap';
        let e = t.offsetWidth;
        e = Math.min(e, this.options.maxWidth),
        e = Math.max(e, this.options.minWidth),
        i.width = `${e + 1}px`,
        i.whiteSpace = '',
        i.height = '';
        let n = t.offsetHeight,
          o = this.options.maxHeight;
        o && n > o ? (i.height = `${o}px`,
        pt(t, 'leaflet-popup-scrolled')) : mt(t, 'leaflet-popup-scrolled'),
        this._containerWidth = this._container.offsetWidth;
      },
      _animateZoom(t) {
        let i = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center),
          e = this._getAnchor();
        Lt(this._container, i.add(e));
      },
      _adjustPan() {
        if (!(!this.options.autoPan || this._map._panAnim && this._map._panAnim._inProgress)) {
          let t = this._map,
            i = parseInt(at(this._container, 'marginBottom'), 10) || 0,
            e = this._container.offsetHeight + i,
            n = this._containerWidth,
            o = new x(this._containerLeft, -e - this._containerBottom);
          o._add(Pt(this._container));
          let s = t.layerPointToContainerPoint(o),
            r = w(this.options.autoPanPadding),
            a = w(this.options.autoPanPaddingTopLeft || r),
            h = w(this.options.autoPanPaddingBottomRight || r),
            u = t.getSize(),
            l = 0,
            c = 0;
          s.x + n + h.x > u.x && (l = s.x + n - u.x + h.x),
          s.x - l - a.x < 0 && (l = s.x - a.x),
          s.y + e + h.y > u.y && (c = s.y + e - u.y + h.y),
          s.y - c - a.y < 0 && (c = s.y - a.y),
          (l || c) && t.fire('autopanstart').panBy([l, c]);
        }
      },
      _onCloseButtonClick(t) {
        this._close(),
        Q(t);
      },
      _getAnchor() {
        return w(this._source && this._source._getPopupAnchor ? this._source._getPopupAnchor() : [0, 0]);
      },
    });
  Le.mergeOptions({
    closePopupOnClick: !0,
  }),
  Le.include({
    openPopup(t, i, e) {
      return t instanceof un || (t = new un(e).setContent(t)),
      i && t.setLatLng(i),
      this.hasLayer(t) ? this : (this._popup && this._popup.options.autoClose && this.closePopup(),
      this._popup = t,
      this.addLayer(t));
    },
    closePopup(t) {
      return t && t !== this._popup || (t = this._popup,
      this._popup = null),
      t && this.removeLayer(t),
      this;
    },
  }),
  Ue.include({
    bindPopup(t, i) {
      return t instanceof un ? (l(t, i),
      this._popup = t,
      t._source = this) : (this._popup && !i || (this._popup = new un(i, this)),
      this._popup.setContent(t)),
      this._popupHandlersAdded || (this.on({
        click: this._openPopup,
        keypress: this._onKeyPress,
        remove: this.closePopup,
        move: this._movePopup,
      }),
      this._popupHandlersAdded = !0),
      this;
    },
    unbindPopup() {
      return this._popup && (this.off({
        click: this._openPopup,
        keypress: this._onKeyPress,
        remove: this.closePopup,
        move: this._movePopup,
      }),
      this._popupHandlersAdded = !1,
      this._popup = null),
      this;
    },
    openPopup(t, i) {
      if (t instanceof Ue || (i = t,
      t = this),
      t instanceof qe) {
        for (const e in this._layers) {
          t = this._layers[e];
          break;
        }
      }
      return i || (i = t.getCenter ? t.getCenter() : t.getLatLng()),
      this._popup && this._map && (this._popup._source = t,
      this._popup.update(),
      this._map.openPopup(this._popup, i)),
      this;
    },
    closePopup() {
      return this._popup && this._popup._close(),
      this;
    },
    togglePopup(t) {
      return this._popup && (this._popup._map ? this.closePopup() : this.openPopup(t)),
      this;
    },
    isPopupOpen() {
      return !!this._popup && this._popup.isOpen();
    },
    setPopupContent(t) {
      return this._popup && this._popup.setContent(t),
      this;
    },
    getPopup() {
      return this._popup;
    },
    _openPopup(t) {
      const i = t.layer || t.target;
      this._popup && this._map && (Q(t),
      i instanceof Je ? this.openPopup(t.layer || t.target, t.latlng) : this._map.hasLayer(this._popup) && this._popup._source === i ? this.closePopup() : this.openPopup(i, t.latlng));
    },
    _movePopup(t) {
      this._popup.setLatLng(t.latlng);
    },
    _onKeyPress(t) {
      t.originalEvent.keyCode === 13 && this._openPopup(t);
    },
  });
  const ln = hn.extend({
    options: {
      pane: 'tooltipPane',
      offset: [0, 0],
      direction: 'auto',
      permanent: !1,
      sticky: !1,
      interactive: !1,
      opacity: 0.9,
    },
    onAdd(t) {
      hn.prototype.onAdd.call(this, t),
      this.setOpacity(this.options.opacity),
      t.fire('tooltipopen', {
        tooltip: this,
      }),
      this._source && this._source.fire('tooltipopen', {
        tooltip: this,
      }, !0);
    },
    onRemove(t) {
      hn.prototype.onRemove.call(this, t),
      t.fire('tooltipclose', {
        tooltip: this,
      }),
      this._source && this._source.fire('tooltipclose', {
        tooltip: this,
      }, !0);
    },
    getEvents() {
      const t = hn.prototype.getEvents.call(this);
      return Vi && !this.options.permanent && (t.preclick = this._close),
      t;
    },
    _close() {
      this._map && this._map.closeTooltip(this);
    },
    _initLayout() {
      const t = `leaflet-tooltip ${this.options.className || ''} leaflet-zoom-${this._zoomAnimated ? 'animated' : 'hide'}`;
      this._contentNode = this._container = ht('div', t);
    },
    _updateLayout() {},
    _adjustPan() {},
    _setPosition(t) {
      let i = this._map,
        e = this._container,
        n = i.latLngToContainerPoint(i.getCenter()),
        o = i.layerPointToContainerPoint(t),
        s = this.options.direction,
        r = e.offsetWidth,
        a = e.offsetHeight,
        h = w(this.options.offset),
        u = this._getAnchor();
      s === 'top' ? t = t.add(w(-r / 2 + h.x, -a + h.y + u.y, !0)) : s === 'bottom' ? t = t.subtract(w(r / 2 - h.x, -h.y, !0)) : s === 'center' ? t = t.subtract(w(r / 2 + h.x, a / 2 - u.y + h.y, !0)) : s === 'right' || s === 'auto' && o.x < n.x ? (s = 'right',
      t = t.add(w(h.x + u.x, u.y - a / 2 + h.y, !0))) : (s = 'left',
      t = t.subtract(w(r + u.x - h.x, a / 2 - u.y - h.y, !0))),
      mt(e, 'leaflet-tooltip-right'),
      mt(e, 'leaflet-tooltip-left'),
      mt(e, 'leaflet-tooltip-top'),
      mt(e, 'leaflet-tooltip-bottom'),
      pt(e, `leaflet-tooltip-${s}`),
      Lt(e, t);
    },
    _updatePosition() {
      const t = this._map.latLngToLayerPoint(this._latlng);
      this._setPosition(t);
    },
    setOpacity(t) {
      this.options.opacity = t,
      this._container && vt(this._container, t);
    },
    _animateZoom(t) {
      const i = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center);
      this._setPosition(i);
    },
    _getAnchor() {
      return w(this._source && this._source._getTooltipAnchor && !this.options.sticky ? this._source._getTooltipAnchor() : [0, 0]);
    },
  });
  Le.include({
    openTooltip(t, i, e) {
      return t instanceof ln || (t = new ln(e).setContent(t)),
      i && t.setLatLng(i),
      this.hasLayer(t) ? this : this.addLayer(t);
    },
    closeTooltip(t) {
      return t && this.removeLayer(t),
      this;
    },
  }),
  Ue.include({
    bindTooltip(t, i) {
      return t instanceof ln ? (l(t, i),
      this._tooltip = t,
      t._source = this) : (this._tooltip && !i || (this._tooltip = new ln(i, this)),
      this._tooltip.setContent(t)),
      this._initTooltipInteractions(),
      this._tooltip.options.permanent && this._map && this._map.hasLayer(this) && this.openTooltip(),
      this;
    },
    unbindTooltip() {
      return this._tooltip && (this._initTooltipInteractions(!0),
      this.closeTooltip(),
      this._tooltip = null),
      this;
    },
    _initTooltipInteractions(t) {
      if (t || !this._tooltipHandlersAdded) {
        let i = t ? 'off' : 'on',
          e = {
            remove: this.closeTooltip,
            move: this._moveTooltip,
          };
        this._tooltip.options.permanent ? e.add = this._openTooltip : (e.mouseover = this._openTooltip,
        e.mouseout = this.closeTooltip,
        this._tooltip.options.sticky && (e.mousemove = this._moveTooltip),
        Vi && (e.click = this._openTooltip)),
        this[i](e),
        this._tooltipHandlersAdded = !t;
      }
    },
    openTooltip(t, i) {
      if (t instanceof Ue || (i = t,
      t = this),
      t instanceof qe) {
        for (const e in this._layers) {
          t = this._layers[e];
          break;
        }
      }
      return i || (i = t.getCenter ? t.getCenter() : t.getLatLng()),
      this._tooltip && this._map && (this._tooltip._source = t,
      this._tooltip.update(),
      this._map.openTooltip(this._tooltip, i),
      this._tooltip.options.interactive && this._tooltip._container && (pt(this._tooltip._container, 'leaflet-clickable'),
      this.addInteractiveTarget(this._tooltip._container))),
      this;
    },
    closeTooltip() {
      return this._tooltip && (this._tooltip._close(),
      this._tooltip.options.interactive && this._tooltip._container && (mt(this._tooltip._container, 'leaflet-clickable'),
      this.removeInteractiveTarget(this._tooltip._container))),
      this;
    },
    toggleTooltip(t) {
      return this._tooltip && (this._tooltip._map ? this.closeTooltip() : this.openTooltip(t)),
      this;
    },
    isTooltipOpen() {
      return this._tooltip.isOpen();
    },
    setTooltipContent(t) {
      return this._tooltip && this._tooltip.setContent(t),
      this;
    },
    getTooltip() {
      return this._tooltip;
    },
    _openTooltip(t) {
      const i = t.layer || t.target;
      this._tooltip && this._map && this.openTooltip(i, this._tooltip.options.sticky ? t.latlng : void 0);
    },
    _moveTooltip(t) {
      let i,
        e,
        n = t.latlng;
      this._tooltip.options.sticky && t.originalEvent && (i = this._map.mouseEventToContainerPoint(t.originalEvent),
      e = this._map.containerPointToLayerPoint(i),
      n = this._map.layerPointToLatLng(e)),
      this._tooltip.setLatLng(n);
    },
  });
  const cn = Ge.extend({
    options: {
      iconSize: [12, 12],
      html: !1,
      bgPos: null,
      className: 'leaflet-div-icon',
    },
    createIcon(t) {
      let i = t && t.tagName === 'DIV' ? t : document.createElement('div'),
        e = this.options;
      if (i.innerHTML = !1 !== e.html ? e.html : '',
      e.bgPos) {
        const n = w(e.bgPos);
        i.style.backgroundPosition = `${-n.x}px ${-n.y}px`;
      }
      return this._setIconStyles(i, 'icon'),
      i;
    },
    createShadow() {
      return null;
    },
  });
  Ge.Default = Ke;
  var _n = Ue.extend({
      options: {
        tileSize: 256,
        opacity: 1,
        updateWhenIdle: ji,
        updateWhenZooming: !0,
        updateInterval: 200,
        zIndex: 1,
        bounds: null,
        minZoom: 0,
        maxZoom: void 0,
        maxNativeZoom: void 0,
        minNativeZoom: void 0,
        noWrap: !1,
        pane: 'tilePane',
        className: '',
        keepBuffer: 2,
      },
      initialize(t) {
        l(this, t);
      },
      onAdd() {
        this._initContainer(),
        this._levels = {},
        this._tiles = {},
        this._resetView(),
        this._update();
      },
      beforeAdd(t) {
        t._addZoomLimit(this);
      },
      onRemove(t) {
        this._removeAllTiles(),
        ut(this._container),
        t._removeZoomLimit(this),
        this._container = null,
        this._tileZoom = void 0;
      },
      bringToFront() {
        return this._map && (ct(this._container),
        this._setAutoZIndex(Math.max)),
        this;
      },
      bringToBack() {
        return this._map && (_t(this._container),
        this._setAutoZIndex(Math.min)),
        this;
      },
      getContainer() {
        return this._container;
      },
      setOpacity(t) {
        return this.options.opacity = t,
        this._updateOpacity(),
        this;
      },
      setZIndex(t) {
        return this.options.zIndex = t,
        this._updateZIndex(),
        this;
      },
      isLoading() {
        return this._loading;
      },
      redraw() {
        return this._map && (this._removeAllTiles(),
        this._update()),
        this;
      },
      getEvents() {
        const t = {
          viewprereset: this._invalidateAll,
          viewreset: this._resetView,
          zoom: this._resetView,
          moveend: this._onMoveEnd,
        };
        return this.options.updateWhenIdle || (this._onMove || (this._onMove = o(this._onMoveEnd, this.options.updateInterval, this)),
        t.move = this._onMove),
        this._zoomAnimated && (t.zoomanim = this._animateZoom),
        t;
      },
      createTile() {
        return document.createElement('div');
      },
      getTileSize() {
        const t = this.options.tileSize;
        return t instanceof x ? t : new x(t, t);
      },
      _updateZIndex() {
        this._container && void 0 !== this.options.zIndex && this.options.zIndex !== null && (this._container.style.zIndex = this.options.zIndex);
      },
      _setAutoZIndex(t) {
        for (var i, e = this.getPane().children, n = -t(-1 / 0, 1 / 0), o = 0, s = e.length; o < s; o++) {
          i = e[o].style.zIndex,
          e[o] !== this._container && i && (n = t(n, +i));
        }
        isFinite(n) && (this.options.zIndex = n + t(-1, 1),
        this._updateZIndex());
      },
      _updateOpacity() {
        if (this._map && !Li) {
          vt(this._container, this.options.opacity);
          let t = +new Date(),
            i = !1,
            e = !1;
          for (const n in this._tiles) {
            const o = this._tiles[n];
            if (o.current && o.loaded) {
              const s = Math.min(1, (t - o.loaded) / 200);
              vt(o.el, s),
              s < 1 ? i = !0 : (o.active ? e = !0 : this._onOpaqueTile(o),
              o.active = !0);
            }
          }
          e && !this._noPrune && this._pruneTiles(),
          i && (g(this._fadeFrame),
          this._fadeFrame = f(this._updateOpacity, this));
        }
      },
      _onOpaqueTile: r,
      _initContainer() {
        this._container || (this._container = ht('div', `leaflet-layer ${this.options.className || ''}`),
        this._updateZIndex(),
        this.options.opacity < 1 && this._updateOpacity(),
        this.getPane().appendChild(this._container));
      },
      _updateLevels() {
        let t = this._tileZoom,
          i = this.options.maxZoom;
        if (void 0 !== t) {
          for (const e in this._levels) {
            this._levels[e].el.children.length || e === t ? (this._levels[e].el.style.zIndex = i - Math.abs(t - e),
            this._onUpdateLevel(e)) : (ut(this._levels[e].el),
            this._removeTilesAtZoom(e),
            this._onRemoveLevel(e),
            delete this._levels[e]);
          }
          let n = this._levels[t],
            o = this._map;
          return n || ((n = this._levels[t] = {}).el = ht('div', 'leaflet-tile-container leaflet-zoom-animated', this._container),
          n.el.style.zIndex = i,
          n.origin = o.project(o.unproject(o.getPixelOrigin()), t).round(),
          n.zoom = t,
          this._setZoomTransform(n, o.getCenter(), o.getZoom()),
          n.el.offsetWidth,
          this._onCreateLevel(n)),
          this._level = n,
          n;
        }
      },
      _onUpdateLevel: r,
      _onRemoveLevel: r,
      _onCreateLevel: r,
      _pruneTiles() {
        if (this._map) {
          let t,
            i,
            e = this._map.getZoom();
          if (e > this.options.maxZoom || e < this.options.minZoom) { this._removeAllTiles(); } else {
            for (t in this._tiles) { (i = this._tiles[t]).retain = i.current; }
            for (t in this._tiles) {
              if ((i = this._tiles[t]).current && !i.active) {
                const n = i.coords;
                this._retainParent(n.x, n.y, n.z, n.z - 5) || this._retainChildren(n.x, n.y, n.z, n.z + 2);
              }
            }
            for (t in this._tiles) { this._tiles[t].retain || this._removeTile(t); }
          }
        }
      },
      _removeTilesAtZoom(t) {
        for (const i in this._tiles) { this._tiles[i].coords.z === t && this._removeTile(i); }
      },
      _removeAllTiles() {
        for (const t in this._tiles) { this._removeTile(t); }
      },
      _invalidateAll() {
        for (const t in this._levels) {
          ut(this._levels[t].el),
          this._onRemoveLevel(t),
          delete this._levels[t];
        }
        this._removeAllTiles(),
        this._tileZoom = void 0;
      },
      _retainParent(t, i, e, n) {
        let o = Math.floor(t / 2),
          s = Math.floor(i / 2),
          r = e - 1,
          a = new x(+o, +s);
        a.z = +r;
        let h = this._tileCoordsToKey(a),
          u = this._tiles[h];
        return u && u.active ? (u.retain = !0,
        !0) : (u && u.loaded && (u.retain = !0),
        r > n && this._retainParent(o, s, r, n));
      },
      _retainChildren(t, i, e, n) {
        for (let o = 2 * t; o < 2 * t + 2; o++) {
          for (let s = 2 * i; s < 2 * i + 2; s++) {
            const r = new x(o, s);
            r.z = e + 1;
            let a = this._tileCoordsToKey(r),
              h = this._tiles[a];
            h && h.active ? h.retain = !0 : (h && h.loaded && (h.retain = !0),
            e + 1 < n && this._retainChildren(o, s, e + 1, n));
          }
        }
      },
      _resetView(t) {
        const i = t && (t.pinch || t.flyTo);
        this._setView(this._map.getCenter(), this._map.getZoom(), i, i);
      },
      _animateZoom(t) {
        this._setView(t.center, t.zoom, !0, t.noUpdate);
      },
      _clampZoom(t) {
        const i = this.options;
        return void 0 !== i.minNativeZoom && t < i.minNativeZoom ? i.minNativeZoom : void 0 !== i.maxNativeZoom && i.maxNativeZoom < t ? i.maxNativeZoom : t;
      },
      _setView(t, i, e, n) {
        let o = this._clampZoom(Math.round(i));
        (void 0 !== this.options.maxZoom && o > this.options.maxZoom || void 0 !== this.options.minZoom && o < this.options.minZoom) && (o = void 0);
        const s = this.options.updateWhenZooming && o !== this._tileZoom;
        n && !s || (this._tileZoom = o,
        this._abortLoading && this._abortLoading(),
        this._updateLevels(),
        this._resetGrid(),
        void 0 !== o && this._update(t),
        e || this._pruneTiles(),
        this._noPrune = !!e),
        this._setZoomTransforms(t, i);
      },
      _setZoomTransforms(t, i) {
        for (const e in this._levels) { this._setZoomTransform(this._levels[e], t, i); }
      },
      _setZoomTransform(t, i, e) {
        let n = this._map.getZoomScale(e, t.zoom),
          o = t.origin.multiplyBy(n).subtract(this._map._getNewPixelOrigin(i, e)).round();
        Ni ? wt(t.el, o, n) : Lt(t.el, o);
      },
      _resetGrid() {
        let t = this._map,
          i = t.options.crs,
          e = this._tileSize = this.getTileSize(),
          n = this._tileZoom,
          o = this._map.getPixelWorldBounds(this._tileZoom);
        o && (this._globalTileRange = this._pxBoundsToTileRange(o)),
        this._wrapX = i.wrapLng && !this.options.noWrap && [Math.floor(t.project([0, i.wrapLng[0]], n).x / e.x), Math.ceil(t.project([0, i.wrapLng[1]], n).x / e.y)],
        this._wrapY = i.wrapLat && !this.options.noWrap && [Math.floor(t.project([i.wrapLat[0], 0], n).y / e.x), Math.ceil(t.project([i.wrapLat[1], 0], n).y / e.y)];
      },
      _onMoveEnd() {
        this._map && !this._map._animatingZoom && this._update();
      },
      _getTiledPixelBounds(t) {
        let i = this._map,
          e = i._animatingZoom ? Math.max(i._animateToZoom, i.getZoom()) : i.getZoom(),
          n = i.getZoomScale(e, this._tileZoom),
          o = i.project(t, this._tileZoom).floor(),
          s = i.getSize().divideBy(2 * n);
        return new P(o.subtract(s), o.add(s));
      },
      _update(t) {
        const i = this._map;
        if (i) {
          const e = this._clampZoom(i.getZoom());
          if (void 0 === t && (t = i.getCenter()),
          void 0 !== this._tileZoom) {
            let n = this._getTiledPixelBounds(t),
              o = this._pxBoundsToTileRange(n),
              s = o.getCenter(),
              r = [],
              a = this.options.keepBuffer,
              h = new P(o.getBottomLeft().subtract([a, -a]), o.getTopRight().add([a, -a]));
            if (!(isFinite(o.min.x) && isFinite(o.min.y) && isFinite(o.max.x) && isFinite(o.max.y))) { throw new Error('Attempted to load an infinite number of tiles'); }
            for (const u in this._tiles) {
              const l = this._tiles[u].coords;
              l.z === this._tileZoom && h.contains(new x(l.x, l.y)) || (this._tiles[u].current = !1);
            }
            if (Math.abs(e - this._tileZoom) > 1) { this._setView(t, e); } else {
              for (let c = o.min.y; c <= o.max.y; c++) {
                for (var _ = o.min.x; _ <= o.max.x; _++) {
                  const d = new x(_, c);
                  if (d.z = this._tileZoom,
                  this._isValidTile(d)) {
                    const p = this._tiles[this._tileCoordsToKey(d)];
                    p ? p.current = !0 : r.push(d);
                  }
                }
              }
              if (r.sort((t, i) => t.distanceTo(s) - i.distanceTo(s)),
              r.length !== 0) {
                this._loading || (this._loading = !0,
                this.fire('loading'));
                const m = document.createDocumentFragment();
                for (_ = 0; _ < r.length; _++) { this._addTile(r[_], m); }
                this._level.el.appendChild(m);
              }
            }
          }
        }
      },
      _isValidTile(t) {
        const i = this._map.options.crs;
        if (!i.infinite) {
          const e = this._globalTileRange;
          if (!i.wrapLng && (t.x < e.min.x || t.x > e.max.x) || !i.wrapLat && (t.y < e.min.y || t.y > e.max.y)) { return !1; }
        }
        if (!this.options.bounds) { return !0; }
        const n = this._tileCoordsToBounds(t);
        return z(this.options.bounds).overlaps(n);
      },
      _keyToBounds(t) {
        return this._tileCoordsToBounds(this._keyToTileCoords(t));
      },
      _tileCoordsToNwSe(t) {
        let i = this._map,
          e = this.getTileSize(),
          n = t.scaleBy(e),
          o = n.add(e);
        return [i.unproject(n, t.z), i.unproject(o, t.z)];
      },
      _tileCoordsToBounds(t) {
        let i = this._tileCoordsToNwSe(t),
          e = new T(i[0], i[1]);
        return this.options.noWrap || (e = this._map.wrapLatLngBounds(e)),
        e;
      },
      _tileCoordsToKey(t) {
        return `${t.x}:${t.y}:${t.z}`;
      },
      _keyToTileCoords(t) {
        let i = t.split(':'),
          e = new x(+i[0], +i[1]);
        return e.z = +i[2],
        e;
      },
      _removeTile(t) {
        const i = this._tiles[t];
        i && (Ci || i.el.setAttribute('src', ni),
        ut(i.el),
        delete this._tiles[t],
        this.fire('tileunload', {
          tile: i.el,
          coords: this._keyToTileCoords(t),
        }));
      },
      _initTile(t) {
        pt(t, 'leaflet-tile');
        const i = this.getTileSize();
        t.style.width = `${i.x}px`,
        t.style.height = `${i.y}px`,
        t.onselectstart = r,
        t.onmousemove = r,
        Li && this.options.opacity < 1 && vt(t, this.options.opacity),
        Ti && !zi && (t.style.WebkitBackfaceVisibility = 'hidden');
      },
      _addTile(t, i) {
        let n = this._getTilePos(t),
          o = this._tileCoordsToKey(t),
          s = this.createTile(this._wrapCoords(t), e(this._tileReady, this, t));
        this._initTile(s),
        this.createTile.length < 2 && f(e(this._tileReady, this, t, null, s)),
        Lt(s, n),
        this._tiles[o] = {
          el: s,
          coords: t,
          current: !0,
        },
        i.appendChild(s),
        this.fire('tileloadstart', {
          tile: s,
          coords: t,
        });
      },
      _tileReady(t, i, n) {
        if (this._map) {
          i && this.fire('tileerror', {
            error: i,
            tile: n,
            coords: t,
          });
          const o = this._tileCoordsToKey(t);
          (n = this._tiles[o]) && (n.loaded = +new Date(),
          this._map._fadeAnimated ? (vt(n.el, 0),
          g(this._fadeFrame),
          this._fadeFrame = f(this._updateOpacity, this)) : (n.active = !0,
          this._pruneTiles()),
          i || (pt(n.el, 'leaflet-tile-loaded'),
          this.fire('tileload', {
            tile: n.el,
            coords: t,
          })),
          this._noTilesToLoad() && (this._loading = !1,
          this.fire('load'),
          Li || !this._map._fadeAnimated ? f(this._pruneTiles, this) : setTimeout(e(this._pruneTiles, this), 250)));
        }
      },
      _getTilePos(t) {
        return t.scaleBy(this.getTileSize()).subtract(this._level.origin);
      },
      _wrapCoords(t) {
        const i = new x(this._wrapX ? s(t.x, this._wrapX) : t.x, this._wrapY ? s(t.y, this._wrapY) : t.y);
        return i.z = t.z,
        i;
      },
      _pxBoundsToTileRange(t) {
        const i = this.getTileSize();
        return new P(t.min.unscaleBy(i).floor(), t.max.unscaleBy(i).ceil().subtract([1, 1]));
      },
      _noTilesToLoad() {
        for (const t in this._tiles) {
          if (!this._tiles[t].loaded) { return !1; }
        }
        return !0;
      },
    }),
    dn = _n.extend({
      options: {
        minZoom: 0,
        maxZoom: 18,
        subdomains: 'abc',
        errorTileUrl: '',
        zoomOffset: 0,
        tms: !1,
        zoomReverse: !1,
        detectRetina: !1,
        crossOrigin: !1,
      },
      initialize(t, i) {
        this._url = t,
        (i = l(this, i)).detectRetina && Ki && i.maxZoom > 0 && (i.tileSize = Math.floor(i.tileSize / 2),
        i.zoomReverse ? (i.zoomOffset--,
        i.minZoom++) : (i.zoomOffset++,
        i.maxZoom--),
        i.minZoom = Math.max(0, i.minZoom)),
        typeof i.subdomains === 'string' && (i.subdomains = i.subdomains.split('')),
        Ti || this.on('tileunload', this._onTileRemove);
      },
      setUrl(t, i) {
        return this._url = t,
        i || this.redraw(),
        this;
      },
      createTile(t, i) {
        const n = document.createElement('img');
        return V(n, 'load', e(this._tileOnLoad, this, i, n)),
        V(n, 'error', e(this._tileOnError, this, i, n)),
        this.options.crossOrigin && (n.crossOrigin = ''),
        n.alt = '',
        n.setAttribute('role', 'presentation'),
        n.src = this.getTileUrl(t),
        n;
      },
      getTileUrl(t) {
        const e = {
          r: Ki ? '@2x' : '',
          s: this._getSubdomain(t),
          x: t.x,
          y: t.y,
          z: this._getZoomForUrl(),
        };
        if (this._map && !this._map.options.crs.infinite) {
          const n = this._globalTileRange.max.y - t.y;
          this.options.tms && (e.y = n),
          e['-y'] = n;
        }
        return _(this._url, i(e, this.options));
      },
      _tileOnLoad(t, i) {
        Li ? setTimeout(e(t, this, null, i), 0) : t(null, i);
      },
      _tileOnError(t, i, e) {
        const n = this.options.errorTileUrl;
        n && i.getAttribute('src') !== n && (i.src = n),
        t(e, i);
      },
      _onTileRemove(t) {
        t.tile.onload = null;
      },
      _getZoomForUrl() {
        let t = this._tileZoom,
          i = this.options.maxZoom,
          e = this.options.zoomReverse,
          n = this.options.zoomOffset;
        return e && (t = i - t),
        t + n;
      },
      _getSubdomain(t) {
        const i = Math.abs(t.x + t.y) % this.options.subdomains.length;
        return this.options.subdomains[i];
      },
      _abortLoading() {
        let t,
          i;
        for (t in this._tiles) {
          this._tiles[t].coords.z !== this._tileZoom && ((i = this._tiles[t].el).onload = r,
          i.onerror = r,
          i.complete || (i.src = ni,
          ut(i),
          delete this._tiles[t]));
        }
      },
    }),
    pn = dn.extend({
      defaultWmsParams: {
        service: 'WMS',
        request: 'GetMap',
        layers: '',
        styles: '',
        format: 'image/jpeg',
        transparent: !1,
        version: '1.1.1',
      },
      options: {
        crs: null,
        uppercase: !1,
      },
      initialize(t, e) {
        this._url = t;
        const n = i({}, this.defaultWmsParams);
        for (const o in e) { o in this.options || (n[o] = e[o]); }
        let s = (e = l(this, e)).detectRetina && Ki ? 2 : 1,
          r = this.getTileSize();
        n.width = r.x * s,
        n.height = r.y * s,
        this.wmsParams = n;
      },
      onAdd(t) {
        this._crs = this.options.crs || t.options.crs,
        this._wmsVersion = parseFloat(this.wmsParams.version);
        const i = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
        this.wmsParams[i] = this._crs.code,
        dn.prototype.onAdd.call(this, t);
      },
      getTileUrl(t) {
        let i = this._tileCoordsToNwSe(t),
          e = this._crs,
          n = b(e.project(i[0]), e.project(i[1])),
          o = n.min,
          s = n.max,
          r = (this._wmsVersion >= 1.3 && this._crs === He ? [o.y, o.x, s.y, s.x] : [o.x, o.y, s.x, s.y]).join(','),
          a = L.TileLayer.prototype.getTileUrl.call(this, t);
        return a + c(this.wmsParams, a, this.options.uppercase) + (this.options.uppercase ? '&BBOX=' : '&bbox=') + r;
      },
      setParams(t, e) {
        return i(this.wmsParams, t),
        e || this.redraw(),
        this;
      },
    });
  dn.WMS = pn,
  Yt.wms = function (t, i) {
    return new pn(t, i);
  }
  ;
  var mn = Ue.extend({
      options: {
        padding: 0.1,
        tolerance: 0,
      },
      initialize(t) {
        l(this, t),
        n(this),
        this._layers = this._layers || {};
      },
      onAdd() {
        this._container || (this._initContainer(),
        this._zoomAnimated && pt(this._container, 'leaflet-zoom-animated')),
        this.getPane().appendChild(this._container),
        this._update(),
        this.on('update', this._updatePaths, this);
      },
      onRemove() {
        this.off('update', this._updatePaths, this),
        this._destroyContainer();
      },
      getEvents() {
        const t = {
          viewreset: this._reset,
          zoom: this._onZoom,
          moveend: this._update,
          zoomend: this._onZoomEnd,
        };
        return this._zoomAnimated && (t.zoomanim = this._onAnimZoom),
        t;
      },
      _onAnimZoom(t) {
        this._updateTransform(t.center, t.zoom);
      },
      _onZoom() {
        this._updateTransform(this._map.getCenter(), this._map.getZoom());
      },
      _updateTransform(t, i) {
        let e = this._map.getZoomScale(i, this._zoom),
          n = Pt(this._container),
          o = this._map.getSize().multiplyBy(0.5 + this.options.padding),
          s = this._map.project(this._center, i),
          r = this._map.project(t, i).subtract(s),
          a = o.multiplyBy(-e).add(n).add(o).subtract(r);
        Ni ? wt(this._container, a, e) : Lt(this._container, a);
      },
      _reset() {
        this._update(),
        this._updateTransform(this._center, this._zoom);
        for (const t in this._layers) { this._layers[t]._reset(); }
      },
      _onZoomEnd() {
        for (const t in this._layers) { this._layers[t]._project(); }
      },
      _updatePaths() {
        for (const t in this._layers) { this._layers[t]._update(); }
      },
      _update() {
        let t = this.options.padding,
          i = this._map.getSize(),
          e = this._map.containerPointToLayerPoint(i.multiplyBy(-t)).round();
        this._bounds = new P(e, e.add(i.multiplyBy(1 + 2 * t)).round()),
        this._center = this._map.getCenter(),
        this._zoom = this._map.getZoom();
      },
    }),
    fn = mn.extend({
      getEvents() {
        const t = mn.prototype.getEvents.call(this);
        return t.viewprereset = this._onViewPreReset,
        t;
      },
      _onViewPreReset() {
        this._postponeUpdatePaths = !0;
      },
      onAdd() {
        mn.prototype.onAdd.call(this),
        this._draw();
      },
      _initContainer() {
        const t = this._container = document.createElement('canvas');
        V(t, 'mousemove', o(this._onMouseMove, 32, this), this),
        V(t, 'click dblclick mousedown mouseup contextmenu', this._onClick, this),
        V(t, 'mouseout', this._handleMouseOut, this),
        this._ctx = t.getContext('2d');
      },
      _destroyContainer() {
        delete this._ctx,
        ut(this._container),
        q(this._container),
        delete this._container;
      },
      _updatePaths() {
        if (!this._postponeUpdatePaths) {
          this._redrawBounds = null;
          for (const t in this._layers) { this._layers[t]._update(); }
          this._redraw();
        }
      },
      _update() {
        if (!this._map._animatingZoom || !this._bounds) {
          this._drawnLayers = {},
          mn.prototype._update.call(this);
          let t = this._bounds,
            i = this._container,
            e = t.getSize(),
            n = Ki ? 2 : 1;
          Lt(i, t.min),
          i.width = n * e.x,
          i.height = n * e.y,
          i.style.width = `${e.x}px`,
          i.style.height = `${e.y}px`,
          Ki && this._ctx.scale(2, 2),
          this._ctx.translate(-t.min.x, -t.min.y),
          this.fire('update');
        }
      },
      _reset() {
        mn.prototype._reset.call(this),
        this._postponeUpdatePaths && (this._postponeUpdatePaths = !1,
        this._updatePaths());
      },
      _initPath(t) {
        this._updateDashArray(t),
        this._layers[n(t)] = t;
        const i = t._order = {
          layer: t,
          prev: this._drawLast,
          next: null,
        };
        this._drawLast && (this._drawLast.next = i),
        this._drawLast = i,
        this._drawFirst = this._drawFirst || this._drawLast;
      },
      _addPath(t) {
        this._requestRedraw(t);
      },
      _removePath(t) {
        let i = t._order,
          e = i.next,
          n = i.prev;
        e ? e.prev = n : this._drawLast = n,
        n ? n.next = e : this._drawFirst = e,
        delete t._order,
        delete this._layers[L.stamp(t)],
        this._requestRedraw(t);
      },
      _updatePath(t) {
        this._extendRedrawBounds(t),
        t._project(),
        t._update(),
        this._requestRedraw(t);
      },
      _updateStyle(t) {
        this._updateDashArray(t),
        this._requestRedraw(t);
      },
      _updateDashArray(t) {
        if (t.options.dashArray) {
          let i,
            e = t.options.dashArray.split(','),
            n = [];
          for (i = 0; i < e.length; i++) { n.push(Number(e[i])); }
          t.options._dashArray = n;
        }
      },
      _requestRedraw(t) {
        this._map && (this._extendRedrawBounds(t),
        this._redrawRequest = this._redrawRequest || f(this._redraw, this));
      },
      _extendRedrawBounds(t) {
        if (t._pxBounds) {
          const i = (t.options.weight || 0) + 1;
          this._redrawBounds = this._redrawBounds || new P(),
          this._redrawBounds.extend(t._pxBounds.min.subtract([i, i])),
          this._redrawBounds.extend(t._pxBounds.max.add([i, i]));
        }
      },
      _redraw() {
        this._redrawRequest = null,
        this._redrawBounds && (this._redrawBounds.min._floor(),
        this._redrawBounds.max._ceil()),
        this._clear(),
        this._draw(),
        this._redrawBounds = null;
      },
      _clear() {
        const t = this._redrawBounds;
        if (t) {
          const i = t.getSize();
          this._ctx.clearRect(t.min.x, t.min.y, i.x, i.y);
        } else { this._ctx.clearRect(0, 0, this._container.width, this._container.height); }
      },
      _draw() {
        let t,
          i = this._redrawBounds;
        if (this._ctx.save(),
        i) {
          const e = i.getSize();
          this._ctx.beginPath(),
          this._ctx.rect(i.min.x, i.min.y, e.x, e.y),
          this._ctx.clip();
        }
        this._drawing = !0;
        for (let n = this._drawFirst; n; n = n.next) {
          t = n.layer,
          (!i || t._pxBounds && t._pxBounds.intersects(i)) && t._updatePath();
        }
        this._drawing = !1,
        this._ctx.restore();
      },
      _updatePoly(t, i) {
        if (this._drawing) {
          let e,
            n,
            o,
            s,
            r = t._parts,
            a = r.length,
            h = this._ctx;
          if (a) {
            for (this._drawnLayers[t._leaflet_id] = t,
            h.beginPath(),
            e = 0; e < a; e++) {
              for (n = 0,
              o = r[e].length; n < o; n++) {
                s = r[e][n],
                h[n ? 'lineTo' : 'moveTo'](s.x, s.y);
              }
              i && h.closePath();
            }
            this._fillStroke(h, t);
          }
        }
      },
      _updateCircle(t) {
        if (this._drawing && !t._empty()) {
          let i = t._point,
            e = this._ctx,
            n = Math.max(Math.round(t._radius), 1),
            o = (Math.max(Math.round(t._radiusY), 1) || n) / n;
          this._drawnLayers[t._leaflet_id] = t,
          o !== 1 && (e.save(),
          e.scale(1, o)),
          e.beginPath(),
          e.arc(i.x, i.y / o, n, 0, 2 * Math.PI, !1),
          o !== 1 && e.restore(),
          this._fillStroke(e, t);
        }
      },
      _fillStroke(t, i) {
        const e = i.options;
        e.fill && (t.globalAlpha = e.fillOpacity,
        t.fillStyle = e.fillColor || e.color,
        t.fill(e.fillRule || 'evenodd')),
        e.stroke && e.weight !== 0 && (t.setLineDash && t.setLineDash(i.options && i.options._dashArray || []),
        t.globalAlpha = e.opacity,
        t.lineWidth = e.weight,
        t.strokeStyle = e.color,
        t.lineCap = e.lineCap,
        t.lineJoin = e.lineJoin,
        t.stroke());
      },
      _onClick(t) {
        for (var i, e, n = this._map.mouseEventToLayerPoint(t), o = this._drawFirst; o; o = o.next) { (i = o.layer).options.interactive && i._containsPoint(n) && !this._map._draggableMoved(i) && (e = i); }
        e && (et(t),
        this._fireEvent([e], t));
      },
      _onMouseMove(t) {
        if (this._map && !this._map.dragging.moving() && !this._map._animatingZoom) {
          const i = this._map.mouseEventToLayerPoint(t);
          this._handleMouseHover(t, i);
        }
      },
      _handleMouseOut(t) {
        const i = this._hoveredLayer;
        i && (mt(this._container, 'leaflet-interactive'),
        this._fireEvent([i], t, 'mouseout'),
        this._hoveredLayer = null);
      },
      _handleMouseHover(t, i) {
        for (var e, n, o = this._drawFirst; o; o = o.next) { (e = o.layer).options.interactive && e._containsPoint(i) && (n = e); }
        n !== this._hoveredLayer && (this._handleMouseOut(t),
        n && (pt(this._container, 'leaflet-interactive'),
        this._fireEvent([n], t, 'mouseover'),
        this._hoveredLayer = n)),
        this._hoveredLayer && this._fireEvent([this._hoveredLayer], t);
      },
      _fireEvent(t, i, e) {
        this._map._fireDOMEvent(i, e || i.type, t);
      },
      _bringToFront(t) {
        let i = t._order,
          e = i.next,
          n = i.prev;
        e && (e.prev = n,
        n ? n.next = e : e && (this._drawFirst = e),
        i.prev = this._drawLast,
        this._drawLast.next = i,
        i.next = null,
        this._drawLast = i,
        this._requestRedraw(t));
      },
      _bringToBack(t) {
        let i = t._order,
          e = i.next,
          n = i.prev;
        n && (n.next = e,
        e ? e.prev = n : n && (this._drawLast = n),
        i.prev = null,
        i.next = this._drawFirst,
        this._drawFirst.prev = i,
        this._drawFirst = i,
        this._requestRedraw(t));
      },
    }),
    gn = (function () {
      try {
        return document.namespaces.add('lvml', 'urn:schemas-microsoft-com:vml'),
        function (t) {
          return document.createElement(`<lvml:${t} class="lvml">`);
        };
      } catch (t) {
        return function (t) {
          return document.createElement(`<${t} xmlns="urn:schemas-microsoft.com:vml" class="lvml">`);
        };
      }
    }()),
    vn = {
      _initContainer() {
        this._container = ht('div', 'leaflet-vml-container');
      },
      _update() {
        this._map._animatingZoom || (mn.prototype._update.call(this),
        this.fire('update'));
      },
      _initPath(t) {
        const i = t._container = gn('shape');
        pt(i, `leaflet-vml-shape ${this.options.className || ''}`),
        i.coordsize = '1 1',
        t._path = gn('path'),
        i.appendChild(t._path),
        this._updateStyle(t),
        this._layers[n(t)] = t;
      },
      _addPath(t) {
        const i = t._container;
        this._container.appendChild(i),
        t.options.interactive && t.addInteractiveTarget(i);
      },
      _removePath(t) {
        const i = t._container;
        ut(i),
        t.removeInteractiveTarget(i),
        delete this._layers[n(t)];
      },
      _updateStyle(t) {
        let i = t._stroke,
          e = t._fill,
          n = t.options,
          o = t._container;
        o.stroked = !!n.stroke,
        o.filled = !!n.fill,
        n.stroke ? (i || (i = t._stroke = gn('stroke')),
        o.appendChild(i),
        i.weight = `${n.weight}px`,
        i.color = n.color,
        i.opacity = n.opacity,
        n.dashArray ? i.dashStyle = ei(n.dashArray) ? n.dashArray.join(' ') : n.dashArray.replace(/( *, *)/g, ' ') : i.dashStyle = '',
        i.endcap = n.lineCap.replace('butt', 'flat'),
        i.joinstyle = n.lineJoin) : i && (o.removeChild(i),
        t._stroke = null),
        n.fill ? (e || (e = t._fill = gn('fill')),
        o.appendChild(e),
        e.color = n.fillColor || n.color,
        e.opacity = n.fillOpacity) : e && (o.removeChild(e),
        t._fill = null);
      },
      _updateCircle(t) {
        let i = t._point.round(),
          e = Math.round(t._radius),
          n = Math.round(t._radiusY || e);
        this._setPath(t, t._empty() ? 'M0 0' : `AL ${i.x},${i.y} ${e},${n} 0,23592600`);
      },
      _setPath(t, i) {
        t._path.v = i;
      },
      _bringToFront(t) {
        ct(t._container);
      },
      _bringToBack(t) {
        _t(t._container);
      },
    },
    yn = Ji ? gn : E,
    xn = mn.extend({
      getEvents() {
        const t = mn.prototype.getEvents.call(this);
        return t.zoomstart = this._onZoomStart,
        t;
      },
      _initContainer() {
        this._container = yn('svg'),
        this._container.setAttribute('pointer-events', 'none'),
        this._rootGroup = yn('g'),
        this._container.appendChild(this._rootGroup);
      },
      _destroyContainer() {
        ut(this._container),
        q(this._container),
        delete this._container,
        delete this._rootGroup,
        delete this._svgSize;
      },
      _onZoomStart() {
        this._update();
      },
      _update() {
        if (!this._map._animatingZoom || !this._bounds) {
          mn.prototype._update.call(this);
          let t = this._bounds,
            i = t.getSize(),
            e = this._container;
          this._svgSize && this._svgSize.equals(i) || (this._svgSize = i,
          e.setAttribute('width', i.x),
          e.setAttribute('height', i.y)),
          Lt(e, t.min),
          e.setAttribute('viewBox', [t.min.x, t.min.y, i.x, i.y].join(' ')),
          this.fire('update');
        }
      },
      _initPath(t) {
        const i = t._path = yn('path');
        t.options.className && pt(i, t.options.className),
        t.options.interactive && pt(i, 'leaflet-interactive'),
        this._updateStyle(t),
        this._layers[n(t)] = t;
      },
      _addPath(t) {
        this._rootGroup || this._initContainer(),
        this._rootGroup.appendChild(t._path),
        t.addInteractiveTarget(t._path);
      },
      _removePath(t) {
        ut(t._path),
        t.removeInteractiveTarget(t._path),
        delete this._layers[n(t)];
      },
      _updatePath(t) {
        t._project(),
        t._update();
      },
      _updateStyle(t) {
        let i = t._path,
          e = t.options;
        i && (e.stroke ? (i.setAttribute('stroke', e.color),
        i.setAttribute('stroke-opacity', e.opacity),
        i.setAttribute('stroke-width', e.weight),
        i.setAttribute('stroke-linecap', e.lineCap),
        i.setAttribute('stroke-linejoin', e.lineJoin),
        e.dashArray ? i.setAttribute('stroke-dasharray', e.dashArray) : i.removeAttribute('stroke-dasharray'),
        e.dashOffset ? i.setAttribute('stroke-dashoffset', e.dashOffset) : i.removeAttribute('stroke-dashoffset')) : i.setAttribute('stroke', 'none'),
        e.fill ? (i.setAttribute('fill', e.fillColor || e.color),
        i.setAttribute('fill-opacity', e.fillOpacity),
        i.setAttribute('fill-rule', e.fillRule || 'evenodd')) : i.setAttribute('fill', 'none'));
      },
      _updatePoly(t, i) {
        this._setPath(t, k(t._parts, i));
      },
      _updateCircle(t) {
        let i = t._point,
          e = Math.max(Math.round(t._radius), 1),
          n = `a${e},${Math.max(Math.round(t._radiusY), 1) || e} 0 1,0 `,
          o = t._empty() ? 'M0 0' : `M${i.x - e},${i.y}${n}${2 * e},0 ${n}${2 * -e},0 `;
        this._setPath(t, o);
      },
      _setPath(t, i) {
        t._path.setAttribute('d', i);
      },
      _bringToFront(t) {
        ct(t._path);
      },
      _bringToBack(t) {
        _t(t._path);
      },
    });
  Ji && xn.include(vn),
  Le.include({
    getRenderer(t) {
      let i = t.options.renderer || this._getPaneRenderer(t.options.pane) || this.options.renderer || this._renderer;
      return i || (i = this._renderer = this.options.preferCanvas && Xt() || Jt()),
      this.hasLayer(i) || this.addLayer(i),
      i;
    },
    _getPaneRenderer(t) {
      if (t === 'overlayPane' || void 0 === t) { return !1; }
      let i = this._paneRenderers[t];
      return void 0 === i && (i = xn && Jt({
        pane: t,
      }) || fn && Xt({
        pane: t,
      }),
      this._paneRenderers[t] = i),
      i;
    },
  });
  const wn = en.extend({
    initialize(t, i) {
      en.prototype.initialize.call(this, this._boundsToLatLngs(t), i);
    },
    setBounds(t) {
      return this.setLatLngs(this._boundsToLatLngs(t));
    },
    _boundsToLatLngs(t) {
      return t = z(t),
      [t.getSouthWest(), t.getNorthWest(), t.getNorthEast(), t.getSouthEast()];
    },
  });
  xn.create = yn,
  xn.pointsToPath = k,
  nn.geometryToLayer = Wt,
  nn.coordsToLatLng = Ht,
  nn.coordsToLatLngs = Ft,
  nn.latLngToCoords = Ut,
  nn.latLngsToCoords = Vt,
  nn.getFeature = qt,
  nn.asFeature = Gt,
  Le.mergeOptions({
    boxZoom: !0,
  });
  const Ln = Ze.extend({
    initialize(t) {
      this._map = t,
      this._container = t._container,
      this._pane = t._panes.overlayPane,
      this._resetStateTimeout = 0,
      t.on('unload', this._destroy, this);
    },
    addHooks() {
      V(this._container, 'mousedown', this._onMouseDown, this);
    },
    removeHooks() {
      q(this._container, 'mousedown', this._onMouseDown, this);
    },
    moved() {
      return this._moved;
    },
    _destroy() {
      ut(this._pane),
      delete this._pane;
    },
    _resetState() {
      this._resetStateTimeout = 0,
      this._moved = !1;
    },
    _clearDeferredResetState() {
      this._resetStateTimeout !== 0 && (clearTimeout(this._resetStateTimeout),
      this._resetStateTimeout = 0);
    },
    _onMouseDown(t) {
      if (!t.shiftKey || t.which !== 1 && t.button !== 1) { return !1; }
      this._clearDeferredResetState(),
      this._resetState(),
      mi(),
      bt(),
      this._startPoint = this._map.mouseEventToContainerPoint(t),
      V(document, {
        contextmenu: Q,
        mousemove: this._onMouseMove,
        mouseup: this._onMouseUp,
        keydown: this._onKeyDown,
      }, this);
    },
    _onMouseMove(t) {
      this._moved || (this._moved = !0,
      this._box = ht('div', 'leaflet-zoom-box', this._container),
      pt(this._container, 'leaflet-crosshair'),
      this._map.fire('boxzoomstart')),
      this._point = this._map.mouseEventToContainerPoint(t);
      let i = new P(this._point, this._startPoint),
        e = i.getSize();
      Lt(this._box, i.min),
      this._box.style.width = `${e.x}px`,
      this._box.style.height = `${e.y}px`;
    },
    _finish() {
      this._moved && (ut(this._box),
      mt(this._container, 'leaflet-crosshair')),
      fi(),
      Tt(),
      q(document, {
        contextmenu: Q,
        mousemove: this._onMouseMove,
        mouseup: this._onMouseUp,
        keydown: this._onKeyDown,
      }, this);
    },
    _onMouseUp(t) {
      if ((t.which === 1 || t.button === 1) && (this._finish(),
      this._moved)) {
        this._clearDeferredResetState(),
        this._resetStateTimeout = setTimeout(e(this._resetState, this), 0);
        const i = new T(this._map.containerPointToLatLng(this._startPoint), this._map.containerPointToLatLng(this._point));
        this._map.fitBounds(i).fire('boxzoomend', {
          boxZoomBounds: i,
        });
      }
    },
    _onKeyDown(t) {
      t.keyCode === 27 && this._finish();
    },
  });
  Le.addInitHook('addHandler', 'boxZoom', Ln),
  Le.mergeOptions({
    doubleClickZoom: !0,
  });
  const Pn = Ze.extend({
    addHooks() {
      this._map.on('dblclick', this._onDoubleClick, this);
    },
    removeHooks() {
      this._map.off('dblclick', this._onDoubleClick, this);
    },
    _onDoubleClick(t) {
      let i = this._map,
        e = i.getZoom(),
        n = i.options.zoomDelta,
        o = t.originalEvent.shiftKey ? e - n : e + n;
      i.options.doubleClickZoom === 'center' ? i.setZoom(o) : i.setZoomAround(t.containerPoint, o);
    },
  });
  Le.addInitHook('addHandler', 'doubleClickZoom', Pn),
  Le.mergeOptions({
    dragging: !0,
    inertia: !zi,
    inertiaDeceleration: 3400,
    inertiaMaxSpeed: 1 / 0,
    easeLinearity: 0.2,
    worldCopyJump: !1,
    maxBoundsViscosity: 0,
  });
  const bn = Ze.extend({
    addHooks() {
      if (!this._draggable) {
        const t = this._map;
        this._draggable = new Be(t._mapPane, t._container),
        this._draggable.on({
          dragstart: this._onDragStart,
          drag: this._onDrag,
          dragend: this._onDragEnd,
        }, this),
        this._draggable.on('predrag', this._onPreDragLimit, this),
        t.options.worldCopyJump && (this._draggable.on('predrag', this._onPreDragWrap, this),
        t.on('zoomend', this._onZoomEnd, this),
        t.whenReady(this._onZoomEnd, this));
      }
      pt(this._map._container, 'leaflet-grab leaflet-touch-drag'),
      this._draggable.enable(),
      this._positions = [],
      this._times = [];
    },
    removeHooks() {
      mt(this._map._container, 'leaflet-grab'),
      mt(this._map._container, 'leaflet-touch-drag'),
      this._draggable.disable();
    },
    moved() {
      return this._draggable && this._draggable._moved;
    },
    moving() {
      return this._draggable && this._draggable._moving;
    },
    _onDragStart() {
      const t = this._map;
      if (t._stop(),
      this._map.options.maxBounds && this._map.options.maxBoundsViscosity) {
        const i = z(this._map.options.maxBounds);
        this._offsetLimit = b(this._map.latLngToContainerPoint(i.getNorthWest()).multiplyBy(-1), this._map.latLngToContainerPoint(i.getSouthEast()).multiplyBy(-1).add(this._map.getSize())),
        this._viscosity = Math.min(1, Math.max(0, this._map.options.maxBoundsViscosity));
      } else { this._offsetLimit = null; }
      t.fire('movestart').fire('dragstart'),
      t.options.inertia && (this._positions = [],
      this._times = []);
    },
    _onDrag(t) {
      if (this._map.options.inertia) {
        let i = this._lastTime = +new Date(),
          e = this._lastPos = this._draggable._absPos || this._draggable._newPos;
        this._positions.push(e),
        this._times.push(i),
        this._prunePositions(i);
      }
      this._map.fire('move', t).fire('drag', t);
    },
    _prunePositions(t) {
      for (; this._positions.length > 1 && t - this._times[0] > 50;) {
        this._positions.shift(),
        this._times.shift();
      }
    },
    _onZoomEnd() {
      let t = this._map.getSize().divideBy(2),
        i = this._map.latLngToLayerPoint([0, 0]);
      this._initialWorldOffset = i.subtract(t).x,
      this._worldWidth = this._map.getPixelWorldBounds().getSize().x;
    },
    _viscousLimit(t, i) {
      return t - (t - i) * this._viscosity;
    },
    _onPreDragLimit() {
      if (this._viscosity && this._offsetLimit) {
        let t = this._draggable._newPos.subtract(this._draggable._startPos),
          i = this._offsetLimit;
        t.x < i.min.x && (t.x = this._viscousLimit(t.x, i.min.x)),
        t.y < i.min.y && (t.y = this._viscousLimit(t.y, i.min.y)),
        t.x > i.max.x && (t.x = this._viscousLimit(t.x, i.max.x)),
        t.y > i.max.y && (t.y = this._viscousLimit(t.y, i.max.y)),
        this._draggable._newPos = this._draggable._startPos.add(t);
      }
    },
    _onPreDragWrap() {
      let t = this._worldWidth,
        i = Math.round(t / 2),
        e = this._initialWorldOffset,
        n = this._draggable._newPos.x,
        o = (n - i + e) % t + i - e,
        s = (n + i + e) % t - i - e,
        r = Math.abs(o + e) < Math.abs(s + e) ? o : s;
      this._draggable._absPos = this._draggable._newPos.clone(),
      this._draggable._newPos.x = r;
    },
    _onDragEnd(t) {
      let i = this._map,
        e = i.options,
        n = !e.inertia || this._times.length < 2;
      if (i.fire('dragend', t),
      n) { i.fire('moveend'); } else {
        this._prunePositions(+new Date());
        let o = this._lastPos.subtract(this._positions[0]),
          s = (this._lastTime - this._times[0]) / 1e3,
          r = e.easeLinearity,
          a = o.multiplyBy(r / s),
          h = a.distanceTo([0, 0]),
          u = Math.min(e.inertiaMaxSpeed, h),
          l = a.multiplyBy(u / h),
          c = u / (e.inertiaDeceleration * r),
          _ = l.multiplyBy(-c / 2).round();
        _.x || _.y ? (_ = i._limitOffset(_, i.options.maxBounds),
        f(() => {
          i.panBy(_, {
            duration: c,
            easeLinearity: r,
            noMoveStart: !0,
            animate: !0,
          });
        })) : i.fire('moveend');
      }
    },
  });
  Le.addInitHook('addHandler', 'dragging', bn),
  Le.mergeOptions({
    keyboard: !0,
    keyboardPanDelta: 80,
  });
  const Tn = Ze.extend({
    keyCodes: {
      left: [37],
      right: [39],
      down: [40],
      up: [38],
      zoomIn: [187, 107, 61, 171],
      zoomOut: [189, 109, 54, 173],
    },
    initialize(t) {
      this._map = t,
      this._setPanDelta(t.options.keyboardPanDelta),
      this._setZoomDelta(t.options.zoomDelta);
    },
    addHooks() {
      const t = this._map._container;
      t.tabIndex <= 0 && (t.tabIndex = '0'),
      V(t, {
        focus: this._onFocus,
        blur: this._onBlur,
        mousedown: this._onMouseDown,
      }, this),
      this._map.on({
        focus: this._addHooks,
        blur: this._removeHooks,
      }, this);
    },
    removeHooks() {
      this._removeHooks(),
      q(this._map._container, {
        focus: this._onFocus,
        blur: this._onBlur,
        mousedown: this._onMouseDown,
      }, this),
      this._map.off({
        focus: this._addHooks,
        blur: this._removeHooks,
      }, this);
    },
    _onMouseDown() {
      if (!this._focused) {
        let t = document.body,
          i = document.documentElement,
          e = t.scrollTop || i.scrollTop,
          n = t.scrollLeft || i.scrollLeft;
        this._map._container.focus(),
        window.scrollTo(n, e);
      }
    },
    _onFocus() {
      this._focused = !0,
      this._map.fire('focus');
    },
    _onBlur() {
      this._focused = !1,
      this._map.fire('blur');
    },
    _setPanDelta(t) {
      let i,
        e,
        n = this._panKeys = {},
        o = this.keyCodes;
      for (i = 0,
      e = o.left.length; i < e; i++) { n[o.left[i]] = [-1 * t, 0]; }
      for (i = 0,
      e = o.right.length; i < e; i++) { n[o.right[i]] = [t, 0]; }
      for (i = 0,
      e = o.down.length; i < e; i++) { n[o.down[i]] = [0, t]; }
      for (i = 0,
      e = o.up.length; i < e; i++) { n[o.up[i]] = [0, -1 * t]; }
    },
    _setZoomDelta(t) {
      let i,
        e,
        n = this._zoomKeys = {},
        o = this.keyCodes;
      for (i = 0,
      e = o.zoomIn.length; i < e; i++) { n[o.zoomIn[i]] = t; }
      for (i = 0,
      e = o.zoomOut.length; i < e; i++) { n[o.zoomOut[i]] = -t; }
    },
    _addHooks() {
      V(document, 'keydown', this._onKeyDown, this);
    },
    _removeHooks() {
      q(document, 'keydown', this._onKeyDown, this);
    },
    _onKeyDown(t) {
      if (!(t.altKey || t.ctrlKey || t.metaKey)) {
        let i,
          e = t.keyCode,
          n = this._map;
        if (e in this._panKeys) {
          if (n._panAnim && n._panAnim._inProgress) { return; }
          i = this._panKeys[e],
          t.shiftKey && (i = w(i).multiplyBy(3)),
          n.panBy(i),
          n.options.maxBounds && n.panInsideBounds(n.options.maxBounds);
        } else if (e in this._zoomKeys) { n.setZoom(n.getZoom() + (t.shiftKey ? 3 : 1) * this._zoomKeys[e]); } else {
          if (e !== 27 || !n._popup || !n._popup.options.closeOnEscapeKey) { return; }
          n.closePopup();
        }
        Q(t);
      }
    },
  });
  Le.addInitHook('addHandler', 'keyboard', Tn),
  Le.mergeOptions({
    scrollWheelZoom: !0,
    wheelDebounceTime: 40,
    wheelPxPerZoomLevel: 60,
  });
  const zn = Ze.extend({
    addHooks() {
      V(this._map._container, 'mousewheel', this._onWheelScroll, this),
      this._delta = 0;
    },
    removeHooks() {
      q(this._map._container, 'mousewheel', this._onWheelScroll, this);
    },
    _onWheelScroll(t) {
      let i = it(t),
        n = this._map.options.wheelDebounceTime;
      this._delta += i,
      this._lastMousePos = this._map.mouseEventToContainerPoint(t),
      this._startTime || (this._startTime = +new Date());
      const o = Math.max(n - (+new Date() - this._startTime), 0);
      clearTimeout(this._timer),
      this._timer = setTimeout(e(this._performZoom, this), o),
      Q(t);
    },
    _performZoom() {
      let t = this._map,
        i = t.getZoom(),
        e = this._map.options.zoomSnap || 0;
      t._stop();
      let n = this._delta / (4 * this._map.options.wheelPxPerZoomLevel),
        o = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(n)))) / Math.LN2,
        s = e ? Math.ceil(o / e) * e : o,
        r = t._limitZoom(i + (this._delta > 0 ? s : -s)) - i;
      this._delta = 0,
      this._startTime = null,
      r && (t.options.scrollWheelZoom === 'center' ? t.setZoom(i + r) : t.setZoomAround(this._lastMousePos, i + r));
    },
  });
  Le.addInitHook('addHandler', 'scrollWheelZoom', zn),
  Le.mergeOptions({
    tap: !0,
    tapTolerance: 15,
  });
  const Mn = Ze.extend({
    addHooks() {
      V(this._map._container, 'touchstart', this._onDown, this);
    },
    removeHooks() {
      q(this._map._container, 'touchstart', this._onDown, this);
    },
    _onDown(t) {
      if (t.touches) {
        if ($(t),
        this._fireClick = !0,
        t.touches.length > 1) {
          return this._fireClick = !1,
          void clearTimeout(this._holdTimeout);
        }
        let i = t.touches[0],
          n = i.target;
        this._startPos = this._newPos = new x(i.clientX, i.clientY),
        n.tagName && n.tagName.toLowerCase() === 'a' && pt(n, 'leaflet-active'),
        this._holdTimeout = setTimeout(e(function () {
          this._isTapValid() && (this._fireClick = !1,
          this._onUp(),
          this._simulateEvent('contextmenu', i));
        }, this), 1e3),
        this._simulateEvent('mousedown', i),
        V(document, {
          touchmove: this._onMove,
          touchend: this._onUp,
        }, this);
      }
    },
    _onUp(t) {
      if (clearTimeout(this._holdTimeout),
      q(document, {
        touchmove: this._onMove,
        touchend: this._onUp,
      }, this),
      this._fireClick && t && t.changedTouches) {
        let i = t.changedTouches[0],
          e = i.target;
        e && e.tagName && e.tagName.toLowerCase() === 'a' && mt(e, 'leaflet-active'),
        this._simulateEvent('mouseup', i),
        this._isTapValid() && this._simulateEvent('click', i);
      }
    },
    _isTapValid() {
      return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
    },
    _onMove(t) {
      const i = t.touches[0];
      this._newPos = new x(i.clientX, i.clientY),
      this._simulateEvent('mousemove', i);
    },
    _simulateEvent(t, i) {
      const e = document.createEvent('MouseEvents');
      e._simulated = !0,
      i.target._simulatedClick = !0,
      e.initMouseEvent(t, !0, !0, window, 1, i.screenX, i.screenY, i.clientX, i.clientY, !1, !1, !1, !1, 0, null),
      i.target.dispatchEvent(e);
    },
  });
  Vi && !Ui && Le.addInitHook('addHandler', 'tap', Mn),
  Le.mergeOptions({
    touchZoom: Vi && !zi,
    bounceAtZoomLimits: !0,
  });
  const Cn = Ze.extend({
    addHooks() {
      pt(this._map._container, 'leaflet-touch-zoom'),
      V(this._map._container, 'touchstart', this._onTouchStart, this);
    },
    removeHooks() {
      mt(this._map._container, 'leaflet-touch-zoom'),
      q(this._map._container, 'touchstart', this._onTouchStart, this);
    },
    _onTouchStart(t) {
      const i = this._map;
      if (t.touches && t.touches.length === 2 && !i._animatingZoom && !this._zooming) {
        let e = i.mouseEventToContainerPoint(t.touches[0]),
          n = i.mouseEventToContainerPoint(t.touches[1]);
        this._centerPoint = i.getSize()._divideBy(2),
        this._startLatLng = i.containerPointToLatLng(this._centerPoint),
        i.options.touchZoom !== 'center' && (this._pinchStartLatLng = i.containerPointToLatLng(e.add(n)._divideBy(2))),
        this._startDist = e.distanceTo(n),
        this._startZoom = i.getZoom(),
        this._moved = !1,
        this._zooming = !0,
        i._stop(),
        V(document, 'touchmove', this._onTouchMove, this),
        V(document, 'touchend', this._onTouchEnd, this),
        $(t);
      }
    },
    _onTouchMove(t) {
      if (t.touches && t.touches.length === 2 && this._zooming) {
        let i = this._map,
          n = i.mouseEventToContainerPoint(t.touches[0]),
          o = i.mouseEventToContainerPoint(t.touches[1]),
          s = n.distanceTo(o) / this._startDist;
        if (this._zoom = i.getScaleZoom(s, this._startZoom),
        !i.options.bounceAtZoomLimits && (this._zoom < i.getMinZoom() && s < 1 || this._zoom > i.getMaxZoom() && s > 1) && (this._zoom = i._limitZoom(this._zoom)),
        i.options.touchZoom === 'center') {
          if (this._center = this._startLatLng,
          s === 1) { return; }
        } else {
          const r = n._add(o)._divideBy(2)._subtract(this._centerPoint);
          if (s === 1 && r.x === 0 && r.y === 0) { return; }
          this._center = i.unproject(i.project(this._pinchStartLatLng, this._zoom).subtract(r), this._zoom);
        }
        this._moved || (i._moveStart(!0, !1),
        this._moved = !0),
        g(this._animRequest);
        const a = e(i._move, i, this._center, this._zoom, {
          pinch: !0,
          round: !1,
        });
        this._animRequest = f(a, this, !0),
        $(t);
      }
    },
    _onTouchEnd() {
      this._moved && this._zooming ? (this._zooming = !1,
      g(this._animRequest),
      q(document, 'touchmove', this._onTouchMove),
      q(document, 'touchend', this._onTouchEnd),
      this._map.options.zoomAnimation ? this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), !0, this._map.options.zoomSnap) : this._map._resetView(this._center, this._map._limitZoom(this._zoom))) : this._zooming = !1;
    },
  });
  Le.addInitHook('addHandler', 'touchZoom', Cn),
  Le.BoxZoom = Ln,
  Le.DoubleClickZoom = Pn,
  Le.Drag = bn,
  Le.Keyboard = Tn,
  Le.ScrollWheelZoom = zn,
  Le.Tap = Mn,
  Le.TouchZoom = Cn;
  const Zn = window.L;
  window.L = t,
  Object.freeze = $t,
  t.version = '1.3.1+HEAD.ba6f97f',
  t.noConflict = function () {
    return window.L = Zn,
    this;
  }
  ,
  t.Control = Pe,
  t.control = be,
  t.Browser = $i,
  t.Evented = ui,
  t.Mixin = Ee,
  t.Util = ai,
  t.Class = v,
  t.Handler = Ze,
  t.extend = i,
  t.bind = e,
  t.stamp = n,
  t.setOptions = l,
  t.DomEvent = de,
  t.DomUtil = xe,
  t.PosAnimation = we,
  t.Draggable = Be,
  t.LineUtil = Oe,
  t.PolyUtil = Re,
  t.Point = x,
  t.point = w,
  t.Bounds = P,
  t.bounds = b,
  t.Transformation = Z,
  t.transformation = S,
  t.Projection = je,
  t.LatLng = M,
  t.latLng = C,
  t.LatLngBounds = T,
  t.latLngBounds = z,
  t.CRS = ci,
  t.GeoJSON = nn,
  t.geoJSON = Kt,
  t.geoJson = sn,
  t.Layer = Ue,
  t.LayerGroup = Ve,
  t.layerGroup = function (t, i) {
    return new Ve(t, i);
  }
  ,
  t.FeatureGroup = qe,
  t.featureGroup = function (t) {
    return new qe(t);
  }
  ,
  t.ImageOverlay = rn,
  t.imageOverlay = function (t, i, e) {
    return new rn(t, i, e);
  }
  ,
  t.VideoOverlay = an,
  t.videoOverlay = function (t, i, e) {
    return new an(t, i, e);
  }
  ,
  t.DivOverlay = hn,
  t.Popup = un,
  t.popup = function (t, i) {
    return new un(t, i);
  }
  ,
  t.Tooltip = ln,
  t.tooltip = function (t, i) {
    return new ln(t, i);
  }
  ,
  t.Icon = Ge,
  t.icon = function (t) {
    return new Ge(t);
  }
  ,
  t.DivIcon = cn,
  t.divIcon = function (t) {
    return new cn(t);
  }
  ,
  t.Marker = Xe,
  t.marker = function (t, i) {
    return new Xe(t, i);
  }
  ,
  t.TileLayer = dn,
  t.tileLayer = Yt,
  t.GridLayer = _n,
  t.gridLayer = function (t) {
    return new _n(t);
  }
  ,
  t.SVG = xn,
  t.svg = Jt,
  t.Renderer = mn,
  t.Canvas = fn,
  t.canvas = Xt,
  t.Path = Je,
  t.CircleMarker = $e,
  t.circleMarker = function (t, i) {
    return new $e(t, i);
  }
  ,
  t.Circle = Qe,
  t.circle = function (t, i, e) {
    return new Qe(t, i, e);
  }
  ,
  t.Polyline = tn,
  t.polyline = function (t, i) {
    return new tn(t, i);
  }
  ,
  t.Polygon = en,
  t.polygon = function (t, i) {
    return new en(t, i);
  }
  ,
  t.Rectangle = wn,
  t.rectangle = function (t, i) {
    return new wn(t, i);
  }
  ,
  t.Map = Le,
  t.map = function (t, i) {
    return new Le(t, i);
  };
}));

