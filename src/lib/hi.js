//@ts-check
const hi = {
  on(t, i, e) {
    if (typeof t === 'object') {
      for (const n in t) { this._on(n, t[n], i); }
    } else {
      for (let o = 0, s = (t = u(t)).length; o < s; o++) { this._on(t[o], i, e); }
    }
    return this;
  },
  off(t, i, e) {
    if (t) {
      if (typeof t === 'object') {
        for (const n in t) { this._off(n, t[n], i); }
      } else {
        for (let o = 0, s = (t = u(t)).length; o < s; o++) { this._off(t[o], i, e); }
      }
    } else { delete this._events; }
    return this;
  },
  _on(t, i, e) {
    this._events = this._events || {};
    let n = this._events[t];
    n || (n = [],
    this._events[t] = n),
    e === this && (e = void 0);
    for (var o = {
        fn: i,
        ctx: e,
      }, s = n, r = 0, a = s.length; r < a; r++) {
      if (s[r].fn === i && s[r].ctx === e) { return; }
    }
    s.push(o);
  },
  _off(t, i, e) {
    let n,
      o,
      s;
    if (this._events && (n = this._events[t])) {
      if (i) {
        if (e === this && (e = void 0),
        n) {
          for (o = 0,
          s = n.length; o < s; o++) {
            const a = n[o];
            if (a.ctx === e && a.fn === i) {
              return a.fn = r,
              this._firingCount && (this._events[t] = n = n.slice()),
              void n.splice(o, 1);
            }
          }
        }
      } else {
        for (o = 0,
        s = n.length; o < s; o++) { n[o].fn = r; }
        delete this._events[t];
      }
    }
  },
  fire(t, e, n) {
    if (!this.listens(t, n)) { return this; }
    const o = i({}, e, {
      type: t,
      target: this,
      sourceTarget: e && e.sourceTarget || this,
    });
    if (this._events) {
      const s = this._events[t];
      if (s) {
        this._firingCount = this._firingCount + 1 || 1;
        for (let r = 0, a = s.length; r < a; r++) {
          const h = s[r];
          h.fn.call(h.ctx || this, o);
        }
        this._firingCount--;
      }
    }
    return n && this._propagateEvent(o),
    this;
  },
  listens(t, i) {
    const e = this._events && this._events[t];
    if (e && e.length) { return !0; }
    if (i) {
      for (const n in this._eventParents) {
        if (this._eventParents[n].listens(t, i)) { return !0; }
      }
    }
    return !1;
  },
  once(t, i, n) {
    if (typeof t === 'object') {
      for (const o in t) { this.once(o, t[o], i); }
      return this;
    }
    var s = e(function () {
      this.off(t, i, n).off(t, s, n);
    }, this);
    return this.on(t, i, n).on(t, s, n);
  },
  addEventParent(t) {
    return this._eventParents = this._eventParents || {},
    this._eventParents[n(t)] = t,
    this;
  },
  removeEventParent(t) {
    return this._eventParents && delete this._eventParents[n(t)],
    this;
  },
  _propagateEvent(t) {
    for (const e in this._eventParents) {
      this._eventParents[e].fire(t.type, i({
        layer: t.target,
        propagatedFrom: t.target,
      }, t), !0);
    }
  },
};
hi.addEventListener = hi.on,
hi.removeEventListener = hi.clearAllEventListeners = hi.off,
hi.addOneTimeEventListener = hi.once,
hi.fireEvent = hi.fire,
hi.hasEventListeners = hi.listens;
export default hi;
