var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function (a) {
  let b = 0;
  return function () {
    return b < a.length ? {
      done: !1,
      value: a[b++],
    } : {
      done: !0,
    };
  };
}
;
$jscomp.arrayIterator = function (a) {
  return {
    next: $jscomp.arrayIteratorImpl(a),
  };
}
;
$jscomp.makeIterator = function (a) {
  const b = typeof Symbol !== 'undefined' && Symbol.iterator && a[Symbol.iterator];
  return b ? b.call(a) : $jscomp.arrayIterator(a);
}
;
$jscomp.getGlobal = function (a) {
  return typeof window !== 'undefined' && window === a ? a : typeof global !== 'undefined' && global != null ? global : a;
}
;
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || typeof Object.defineProperties === 'function' ? Object.defineProperty : function (a, b, c) {
  a != Array.prototype && a != Object.prototype && (a[b] = c.value);
}
;
$jscomp.polyfill = function (a, b, c, d) {
  if (b) {
    c = $jscomp.global;
    a = a.split('.');
    for (d = 0; d < a.length - 1; d++) {
      const e = a[d];
      e in c || (c[e] = {});
      c = c[e];
    }
    a = a[a.length - 1];
    d = c[a];
    b = b(d);
    b != d && b != null && $jscomp.defineProperty(c, a, {
      configurable: !0,
      writable: !0,
      value: b,
    });
  }
}
;
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.polyfill('Promise', (a) => {
  function b() {
    this.batch_ = null;
  }
  function c(a) {
    return a instanceof e ? a : new e(((b, c) => {
      b(a);
    }),
    );
  }
  if (a && !$jscomp.FORCE_POLYFILL_PROMISE) { return a; }
  b.prototype.asyncExecute = function (a) {
    if (this.batch_ == null) {
      this.batch_ = [];
      const b = this;
      this.asyncExecuteFunction(() => {
        b.executeBatch_();
      });
    }
    this.batch_.push(a);
  }
  ;
  const d = $jscomp.global.setTimeout;
  b.prototype.asyncExecuteFunction = function (a) {
    d(a, 0);
  }
  ;
  b.prototype.executeBatch_ = function () {
    for (; this.batch_ && this.batch_.length;) {
      const a = this.batch_;
      this.batch_ = [];
      for (let b = 0; b < a.length; ++b) {
        const c = a[b];
        a[b] = null;
        try {
          c();
        } catch (n) {
          this.asyncThrow_(n);
        }
      }
    }
    this.batch_ = null;
  }
  ;
  b.prototype.asyncThrow_ = function (a) {
    this.asyncExecuteFunction(() => {
      throw a;
    });
  }
  ;
  var e = function (a) {
    this.state_ = 0;
    this.result_ = void 0;
    this.onSettledCallbacks_ = [];
    const b = this.createResolveAndReject_();
    try {
      a(b.resolve, b.reject);
    } catch (k) {
      b.reject(k);
    }
  };
  e.prototype.createResolveAndReject_ = function () {
    function a(a) {
      return function (d) {
        c || (c = !0,
        a.call(b, d));
      };
    }
    var b = this,
      c = !1;
    return {
      resolve: a(this.resolveTo_),
      reject: a(this.reject_),
    };
  }
  ;
  e.prototype.resolveTo_ = function (a) {
    if (a === this) { this.reject_(new TypeError('A Promise cannot resolve to itself')); } else if (a instanceof e) { this.settleSameAsPromise_(a); } else {
      switch (typeof a) {
        case 'object':
          var b = a != null;
          break;
        case 'function':
          b = !0;
          break;
        default:
          b = !1;
      }
      b ? this.resolveToNonPromiseObj_(a) : this.fulfill_(a);
    }
  }
  ;
  e.prototype.resolveToNonPromiseObj_ = function (a) {
    let b = void 0;
    try {
      b = a.then;
    } catch (k) {
      this.reject_(k);
      return;
    }
    typeof b === 'function' ? this.settleSameAsThenable_(b, a) : this.fulfill_(a);
  }
  ;
  e.prototype.reject_ = function (a) {
    this.settle_(2, a);
  }
  ;
  e.prototype.fulfill_ = function (a) {
    this.settle_(1, a);
  }
  ;
  e.prototype.settle_ = function (a, b) {
    if (this.state_ != 0) { throw Error(`Cannot settle(${a}, ${b}): Promise already settled in state${this.state_}`); }
    this.state_ = a;
    this.result_ = b;
    this.executeOnSettledCallbacks_();
  }
  ;
  e.prototype.executeOnSettledCallbacks_ = function () {
    if (this.onSettledCallbacks_ != null) {
      for (let a = 0; a < this.onSettledCallbacks_.length; ++a) { f.asyncExecute(this.onSettledCallbacks_[a]); }
      this.onSettledCallbacks_ = null;
    }
  }
  ;
  var f = new b();
  e.prototype.settleSameAsPromise_ = function (a) {
    const b = this.createResolveAndReject_();
    a.callWhenSettled_(b.resolve, b.reject);
  }
  ;
  e.prototype.settleSameAsThenable_ = function (a, b) {
    const c = this.createResolveAndReject_();
    try {
      a.call(b, c.resolve, c.reject);
    } catch (n) {
      c.reject(n);
    }
  }
  ;
  e.prototype.then = function (a, b) {
    function c(a, b) {
      return typeof a === 'function' ? function (b) {
        try {
          d(a(b));
        } catch (y) {
          f(y);
        }
      }
        : b;
    }
    let d,
      f,
      g = new e(((a, b) => {
        d = a;
        f = b;
      }),
      );
    this.callWhenSettled_(c(a, d), c(b, f));
    return g;
  }
  ;
  e.prototype.catch = function (a) {
    return this.then(void 0, a);
  }
  ;
  e.prototype.callWhenSettled_ = function (a, b) {
    function c() {
      switch (d.state_) {
        case 1:
          a(d.result_);
          break;
        case 2:
          b(d.result_);
          break;
        default:
          throw Error(`Unexpected state: ${d.state_}`);
      }
    }
    var d = this;
    this.onSettledCallbacks_ == null ? f.asyncExecute(c) : this.onSettledCallbacks_.push(c);
  }
  ;
  e.resolve = c;
  e.reject = function (a) {
    return new e(((b, c) => {
      c(a);
    }),
    );
  }
  ;
  e.race = function (a) {
    return new e(((b, d) => {
      for (let e = $jscomp.makeIterator(a), f = e.next(); !f.done; f = e.next()) { c(f.value).callWhenSettled_(b, d); }
    }),
    );
  }
  ;
  e.all = function (a) {
    let b = $jscomp.makeIterator(a),
      d = b.next();
    return d.done ? c([]) : new e(((a, e) => {
      function f(b) {
        return function (c) {
          g[b] = c;
          h--;
          h == 0 && a(g);
        };
      }
      var g = [],
        h = 0;
      do {
        g.push(void 0),
        h++,
        c(d.value).callWhenSettled_(f(g.length - 1), e),
        d = b.next();
      }
      while (!d.done);
    }),
    );
  }
  ;
  return e;
}, 'es6', 'es3');
$jscomp.polyfill('Promise.prototype.finally', a => a || function (a) {
  return this.then(b => Promise.resolve(a()).then(() => b), b => Promise.resolve(a()).then(() => {
    throw b;
  }));
}, 'es9', 'es3');
$jscomp.SYMBOL_PREFIX = 'jscomp_symbol_';
$jscomp.initSymbol = function () {
  $jscomp.initSymbol = function () {}
  ;
  $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol);
}
;
$jscomp.SymbolClass = function (a, b) {
  this.$jscomp$symbol$id_ = a;
  $jscomp.defineProperty(this, 'description', {
    configurable: !0,
    writable: !0,
    value: b,
  });
}
;
$jscomp.SymbolClass.prototype.toString = function () {
  return this.$jscomp$symbol$id_;
}
;
$jscomp.Symbol = (function () {
  function a(c) {
    if (this instanceof a) { throw new TypeError('Symbol is not a constructor'); }
    return new $jscomp.SymbolClass(`${$jscomp.SYMBOL_PREFIX + (c || '')}_${b++}`, c);
  }
  var b = 0;
  return a;
}());
$jscomp.initSymbolIterator = function () {
  $jscomp.initSymbol();
  let a = $jscomp.global.Symbol.iterator;
  a || (a = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol('Symbol.iterator'));
  typeof Array.prototype[a] !== 'function' && $jscomp.defineProperty(Array.prototype, a, {
    configurable: !0,
    writable: !0,
    value() {
      return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this));
    },
  });
  $jscomp.initSymbolIterator = function () {};
}
;
$jscomp.initSymbolAsyncIterator = function () {
  $jscomp.initSymbol();
  let a = $jscomp.global.Symbol.asyncIterator;
  a || (a = $jscomp.global.Symbol.asyncIterator = $jscomp.global.Symbol('Symbol.asyncIterator'));
  $jscomp.initSymbolAsyncIterator = function () {};
}
;
$jscomp.iteratorPrototype = function (a) {
  $jscomp.initSymbolIterator();
  a = {
    next: a,
  };
  a[$jscomp.global.Symbol.iterator] = function () {
    return this;
  }
  ;
  return a;
}
;
$jscomp.underscoreProtoCanBeSet = function () {
  let a = {
      a: !0,
    },
    b = {};
  try {
    return b.__proto__ = a,
    b.a;
  } catch (c) {}
  return !1;
}
;
$jscomp.setPrototypeOf = typeof Object.setPrototypeOf === 'function' ? Object.setPrototypeOf : $jscomp.underscoreProtoCanBeSet() ? function (a, b) {
  a.__proto__ = b;
  if (a.__proto__ !== b) { throw new TypeError(`${a} is not extensible`); }
  return a;
}
  : null;
$jscomp.generator = {};
$jscomp.generator.ensureIteratorResultIsObject_ = function (a) {
  if (!(a instanceof Object)) { throw new TypeError(`Iterator result ${a} is not an object`); }
}
;
$jscomp.generator.Context = function () {
  this.isRunning_ = !1;
  this.yieldAllIterator_ = null;
  this.yieldResult = void 0;
  this.nextAddress = 1;
  this.finallyAddress_ = this.catchAddress_ = 0;
  this.finallyContexts_ = this.abruptCompletion_ = null;
}
;
$jscomp.generator.Context.prototype.start_ = function () {
  if (this.isRunning_) { throw new TypeError('Generator is already running'); }
  this.isRunning_ = !0;
}
;
$jscomp.generator.Context.prototype.stop_ = function () {
  this.isRunning_ = !1;
}
;
$jscomp.generator.Context.prototype.jumpToErrorHandler_ = function () {
  this.nextAddress = this.catchAddress_ || this.finallyAddress_;
}
;
$jscomp.generator.Context.prototype.next_ = function (a) {
  this.yieldResult = a;
}
;
$jscomp.generator.Context.prototype.throw_ = function (a) {
  this.abruptCompletion_ = {
    exception: a,
    isException: !0,
  };
  this.jumpToErrorHandler_();
}
;
$jscomp.generator.Context.prototype.return = function (a) {
  this.abruptCompletion_ = {
    return: a,
  };
  this.nextAddress = this.finallyAddress_;
}
;
$jscomp.generator.Context.prototype.jumpThroughFinallyBlocks = function (a) {
  this.abruptCompletion_ = {
    jumpTo: a,
  };
  this.nextAddress = this.finallyAddress_;
}
;
$jscomp.generator.Context.prototype.yield = function (a, b) {
  this.nextAddress = b;
  return {
    value: a,
  };
}
;
$jscomp.generator.Context.prototype.yieldAll = function (a, b) {
  a = $jscomp.makeIterator(a);
  const c = a.next();
  $jscomp.generator.ensureIteratorResultIsObject_(c);
  if (c.done) {
    this.yieldResult = c.value,
    this.nextAddress = b;
  } else {
    return this.yieldAllIterator_ = a,
    this.yield(c.value, b);
  }
}
;
$jscomp.generator.Context.prototype.jumpTo = function (a) {
  this.nextAddress = a;
}
;
$jscomp.generator.Context.prototype.jumpToEnd = function () {
  this.nextAddress = 0;
}
;
$jscomp.generator.Context.prototype.setCatchFinallyBlocks = function (a, b) {
  this.catchAddress_ = a;
  void 0 != b && (this.finallyAddress_ = b);
}
;
$jscomp.generator.Context.prototype.setFinallyBlock = function (a) {
  this.catchAddress_ = 0;
  this.finallyAddress_ = a || 0;
}
;
$jscomp.generator.Context.prototype.leaveTryBlock = function (a, b) {
  this.nextAddress = a;
  this.catchAddress_ = b || 0;
}
;
$jscomp.generator.Context.prototype.enterCatchBlock = function (a) {
  this.catchAddress_ = a || 0;
  a = this.abruptCompletion_.exception;
  this.abruptCompletion_ = null;
  return a;
}
;
$jscomp.generator.Context.prototype.enterFinallyBlock = function (a, b, c) {
  c ? this.finallyContexts_[c] = this.abruptCompletion_ : this.finallyContexts_ = [this.abruptCompletion_];
  this.catchAddress_ = a || 0;
  this.finallyAddress_ = b || 0;
}
;
$jscomp.generator.Context.prototype.leaveFinallyBlock = function (a, b) {
  b = this.finallyContexts_.splice(b || 0)[0];
  if (b = this.abruptCompletion_ = this.abruptCompletion_ || b) {
    if (b.isException) { return this.jumpToErrorHandler_(); }
    void 0 != b.jumpTo && this.finallyAddress_ < b.jumpTo ? (this.nextAddress = b.jumpTo,
    this.abruptCompletion_ = null) : this.nextAddress = this.finallyAddress_;
  } else { this.nextAddress = a; }
}
;
$jscomp.generator.Context.prototype.forIn = function (a) {
  return new $jscomp.generator.Context.PropertyIterator(a);
}
;
$jscomp.generator.Context.PropertyIterator = function (a) {
  this.object_ = a;
  this.properties_ = [];
  for (const b in a) { this.properties_.push(b); }
  this.properties_.reverse();
}
;
$jscomp.generator.Context.PropertyIterator.prototype.getNext = function () {
  for (; this.properties_.length > 0;) {
    const a = this.properties_.pop();
    if (a in this.object_) { return a; }
  }
  return null;
}
;
$jscomp.generator.Engine_ = function (a) {
  this.context_ = new $jscomp.generator.Context();
  this.program_ = a;
}
;
$jscomp.generator.Engine_.prototype.next_ = function (a) {
  this.context_.start_();
  if (this.context_.yieldAllIterator_) { return this.yieldAllStep_(this.context_.yieldAllIterator_.next, a, this.context_.next_); }
  this.context_.next_(a);
  return this.nextStep_();
}
;
$jscomp.generator.Engine_.prototype.return_ = function (a) {
  this.context_.start_();
  const b = this.context_.yieldAllIterator_;
  if (b) {
    return this.yieldAllStep_('return' in b ? b.return : a => ({
      value: a,
      done: !0,
    })
      , a, this.context_.return);
  }
  this.context_.return(a);
  return this.nextStep_();
}
;
$jscomp.generator.Engine_.prototype.throw_ = function (a) {
  this.context_.start_();
  if (this.context_.yieldAllIterator_) { return this.yieldAllStep_(this.context_.yieldAllIterator_.throw, a, this.context_.next_); }
  this.context_.throw_(a);
  return this.nextStep_();
}
;
$jscomp.generator.Engine_.prototype.yieldAllStep_ = function (a, b, c) {
  try {
    const d = a.call(this.context_.yieldAllIterator_, b);
    $jscomp.generator.ensureIteratorResultIsObject_(d);
    if (!d.done) {
      return this.context_.stop_(),
      d;
    }
    var e = d.value;
  } catch (f) {
    return this.context_.yieldAllIterator_ = null,
    this.context_.throw_(f),
    this.nextStep_();
  }
  this.context_.yieldAllIterator_ = null;
  c.call(this.context_, e);
  return this.nextStep_();
}
;
$jscomp.generator.Engine_.prototype.nextStep_ = function () {
  for (; this.context_.nextAddress;) {
    try {
      var a = this.program_(this.context_);
      if (a) {
        return this.context_.stop_(),
        {
          value: a.value,
          done: !1,
        };
      }
    } catch (b) {
      this.context_.yieldResult = void 0,
      this.context_.throw_(b);
    }
  }
  this.context_.stop_();
  if (this.context_.abruptCompletion_) {
    a = this.context_.abruptCompletion_;
    this.context_.abruptCompletion_ = null;
    if (a.isException) { throw a.exception; }
    return {
      value: a.return,
      done: !0,
    };
  }
  return {
    value: void 0,
    done: !0,
  };
}
;
$jscomp.generator.Generator_ = function (a) {
  this.next = function (b) {
    return a.next_(b);
  }
  ;
  this.throw = function (b) {
    return a.throw_(b);
  }
  ;
  this.return = function (b) {
    return a.return_(b);
  }
  ;
  $jscomp.initSymbolIterator();
  this[Symbol.iterator] = function () {
    return this;
  };
}
;
$jscomp.generator.createGenerator = function (a, b) {
  b = new $jscomp.generator.Generator_(new $jscomp.generator.Engine_(b));
  $jscomp.setPrototypeOf && $jscomp.setPrototypeOf(b, a.prototype);
  return b;
}
;
$jscomp.asyncExecutePromiseGenerator = function (a) {
  function b(b) {
    return a.next(b);
  }
  function c(b) {
    return a.throw(b);
  }
  return new Promise(((d, e) => {
    function f(a) {
      a.done ? d(a.value) : Promise.resolve(a.value).then(b, c).then(f, e);
    }
    f(a.next());
  }),
  );
}
;
$jscomp.asyncExecutePromiseGeneratorFunction = function (a) {
  return $jscomp.asyncExecutePromiseGenerator(a());
}
;
$jscomp.asyncExecutePromiseGeneratorProgram = function (a) {
  return $jscomp.asyncExecutePromiseGenerator(new $jscomp.generator.Generator_(new $jscomp.generator.Engine_(a)));
}
;
export default $jscomp;
