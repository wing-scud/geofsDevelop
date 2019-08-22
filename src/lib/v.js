v.extend = function (t) {
  let e = function () {
      this.initialize && this.initialize.apply(this, arguments),
      this.callInitHooks();
    },
    n = e.__super__ = this.prototype,
    o = Qt(n);
  o.constructor = e,
  e.prototype = o;
  for (const s in this) { this.hasOwnProperty(s) && s !== 'prototype' && s !== '__super__' && (e[s] = this[s]); }
  return t.statics && (i(e, t.statics),
  delete t.statics),
  t.includes && (y(t.includes),
  i(...[o].concat(t.includes)),
  delete t.includes),
  o.options && (t.options = i(Qt(o.options), t.options)),
  i(o, t),
  o._initHooks = [],
  o.callInitHooks = function () {
    if (!this._initHooksCalled) {
      n.callInitHooks && n.callInitHooks.call(this),
      this._initHooksCalled = !0;
      for (let t = 0, i = o._initHooks.length; t < i; t++) { o._initHooks[t].call(this); }
    }
  }
  ,
  e;
}
,
v.include = function (t) {
  return i(this.prototype, t),
  this;
}
,
v.mergeOptions = function (t) {
  return i(this.prototype.options, t),
  this;
}
,
v.addInitHook = function (t) {
  let i = Array.prototype.slice.call(arguments, 1),
    e = typeof t === 'function' ? t : function () {
      this[t].apply(this, i);
    }
    ;
  return this.prototype._initHooks = this.prototype._initHooks || [],
  this.prototype._initHooks.push(e),
  this;
}
;
export default v;
