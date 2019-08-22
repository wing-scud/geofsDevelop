let runwayslights = function (a) {
  this.runway = a;
  this.on = !1;
  this.lights = [];
  this.papis = [];
  this.localStepXm = a.widthMeters / 33;
  this.localStepYm = 50;
  let b = M33.identity();
  b = M33.rotationZ(b, a.headingRad);
  this.stepX = xy2ll(V2.scale(b[0], this.localStepXm), a.threshold1);
  this.stepY = xy2ll(V2.scale(b[1], this.localStepYm), a.threshold1);
  if (geofs.preferences.showPapi) {
    let c = xy2ll(V2.scale(b[0], 9), a.threshold1),
      d = V2.add(a.threshold1, xy2ll(V2.scale(b[0], a.widthMeters / 2 + 15), a.threshold1));
    d = V2.add(d, V2.scale(this.stepY, 5));
    this.addPapi(d, c);
    c = xy2ll(V2.scale(b[0], -9), a.threshold2);
    d = V2.add(a.threshold2, xy2ll(V2.scale(b[0], -a.widthMeters / 2 - 15), a.threshold2));
    d = V2.add(d, V2.scale(this.stepY, -5));
    this.addPapi(d, c);
  }
}
;
runwayslights.turnAllOff = function () {
  for (const a in geofs.fx.litRunways) { geofs.fx.litRunways[a].turnOff(); }
}
;
runwayslights.turnAllOn = function () {
  for (const a in geofs.fx.litRunways) { geofs.fx.litRunways[a].turnOn(); }
}
;
runwayslights.updateAll = function () {
  for (var a in geofs.runways.nearRunways) {
    const b = geofs.runways.nearRunways[a];
    geofs.fx.litRunways[b.id] || (geofs.fx.litRunways[b.id] = new runwayslights(b));
  }
  for (a in geofs.fx.litRunways) { geofs.runways.nearRunways[a] || geofs.fx.litRunways[a].destroy(); }
  geofs.isNight ? runwayslights.turnAllOn() : runwayslights.turnAllOff();
}
;
runwayslights.prototype = {
  turnOn() {
    if (!this.on) {
      let a = geofs.fx.templateCenter[1] - 1,
        b = geofs.fx.thresholdLightTemplate[a],
        c = b[1];
      b = -c;
      for (var d = a, e = geofs.fx.thresholdLightTemplate.length; d < e; d++) {
        var f = geofs.fx.thresholdLightTemplate[d];
        a = f[0];
        var g = b;
        for (f = b + f[1]; g < f; g++) {
          this.addRow(this.runway.threshold1, a, -g),
          b++;
        }
      }
      d = V2.add(this.runway.threshold1, V2.scale(this.stepY, c));
      c = (this.runway.lengthMeters - this.localStepYm * c) / this.localStepYm;
      a = geofs.fx.thresholdLightTemplate[0][0];
      for (b = 0; b < c; b++) { this.addRow(d, a, b); }
      a = geofs.fx.templateCenter[1] - 1;
      b = geofs.fx.thresholdLightTemplate[a];
      c = b[1];
      b = -c;
      d = a;
      for (e = geofs.fx.thresholdLightTemplate.length; d < e; d++) {
        for (f = geofs.fx.thresholdLightTemplate[d],
        a = f[0],
        g = b,
        f = b + f[1]; g < f; g++) {
          this.addRow(this.runway.threshold2, a, g),
          b++;
        }
      }
      this.on = !0;
    }
  },
  turnOff() {
    if (this.on) {
      for (let a = 0; a < this.lights.length; a++) { this.lights[a].destroy(); }
      this.on = !1;
    }
  },
  addRow(a, b, c) {
    a = V2.add(a, V2.scale(this.stepY, c));
    c = 0;
    for (let d = b.length; c < d; c++) {
      const e = b[c];
      if (e) {
        const f = V2.add(a, V3.scale(this.stepX, c - geofs.fx.templateCenter[0]));
        this.addLight(f, e);
      }
    }
  },
  addPapi(a, b) {
    this.papis = this.papis || [];
    a[2] = 0.5;
    this.papis.push(new geofs.fx.papi(a, b));
  },
  addLight(a, b) {
    a[2] = 0.2;
    this.lights.push(new geofs.light(a, b, geofs.fx.lightBillboardOptions));
  },
  destroy() {
    if (this.lights) {
      for (var a = 0; a < this.lights.length; a++) { this.lights[a].destroy(); }
      this.lights = [];
    }
    if (this.papis) {
      for (a = 0; a < this.papis.length; a++) { this.papis[a].destroy(); }
      this.papis = [];
    }
  },
};
export default runwayslights;
