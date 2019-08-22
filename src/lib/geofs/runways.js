var runways = {
  runwayNumberLimit: 4,
  refreshRate: 1E4,
  refreshDistanceThreshold: 0.1,
  modelVisibility: !1,
  defaultPadding: 1E3,
  tileLength: 278,
  modelRunwayWidth: 60,
  thresholdLength: 582,
  modelVerticalOffset: 0.1,
  imageryLayers: [],
  imageryOpacity: 0.7,
  redraw() {
    runways.modelVisibility && (runways.setRunwayModelVisibility(!1),
    runways.setRunwayModelVisibility(!0));
  },
  refresh() {
    let a = geofs.aircraft.instance.llaLocation;
    clearInterval(runwaysCheckTimeout);
    runwaysCheckTimeout = setInterval(() => {
      runways.refresh();
    }, runways.refreshRate);
    if (!(V2.length(V2.sub(a, geofs.fx.lastRunwayTestLocation)) < runways.refreshDistanceThreshold)) {
      geofs.fx.lastRunwayTestLocation = a;
      a = runways.getNearRunways(a, runways.runwayNumberLimit);
      for (var b = {}, c = 0; c < a.length; c++) {
        const d = runways.generateRunwayId(a[c]);
        b[d] || (b[d] = new runways.runway(a[c], d));
      }
      for (c in runways.nearRunways) { b[c] || runways.nearRunways[c].destroy(); }
      runways.nearRunways = Object.assign({}, b);
      $('body').trigger('runwayUpdate');
    }
  },
  reset() {
    Object.keys(runways.nearRunways).forEach(a => runways.nearRunways[a].destroy());
    runways.nearRunways = {};
    runways.refresh();
  },
  getNearestRunway(a) {
    let b = 0;
    do { var c = runways.getNearRunways(a, 1, b++); }
    while (!c.length && b < 5);return c[0] ? (a = c[0],
    b = runways.generateRunwayId(a),
    runways.nearRunways[b] || (runways.nearRunways[b] = new runways.runway(a, b)),
    runways.nearRunways[b]) : null;
  },
  getNearRunways(a, b, c) {
    c = c || 0;
    for (var d = parseInt(a[0]), e = parseInt(a[1]), f = [], g, h = -c; h <= c; h++) {
      g = majorRunwayGrid[e + h] || {};
      for (let k = -c; k <= c; k++) { g[d + k] && (f = f.concat(g[d + k])); }
    }
    runways.setRunwayDistance(a, f);
    f.sort((a, b) => a.distance - b.distance);
    return f.slice(0, b);
  },
  setRunwayDistance(a, b) {
    for (let c = 0, d = b.length; c < d; c++) {
      const e = b[c];
      e.distance = geofs.utils.llaDistanceInMeters(a, [e[4], e[5]]);
    }
  },
  setRunwayModelVisibility(a) {
    Object.keys(runways.nearRunways).forEach((b) => {
      runways.nearRunways[b].destroyRunwayModel();
      a && runways.nearRunways[b].generateRunwayModel();
    });
    runways.modelVisibility = a;
  },
  env: {},
  getRotationCanvas(a) {
    return new Promise(((b) => {
      if (runways.env[a]) { b(runways.env[a]); } else {
        const c = document.createElement('img');
        c.onload = function () {
          env = {
            image: this,
          };
          env.canvas = document.createElement('canvas');
          env.canvas.width = this.width;
          env.canvas.height = this.width;
          env.context = env.canvas.getContext('2d');
          env.context.translate(this.width / 2, this.width / 2);
          runways.env[a] = env;
          b(env);
        }
        ;
        c.src = a;
      }
    }),
    );
  },
  asyncSetImageLayerRotationPosition(a, b, c, d) {
    let e,
      f,
      g;
    return $jscomp.asyncExecutePromiseGeneratorProgram((h) => {
      if (h.nextAddress == 1) { return h.yield(runways.getRotationCanvas(a), 2); }
      e = h.yieldResult;
      e.context.clearRect(-e.image.width, -e.image.width, 2 * e.image.width, 2 * e.image.width);
      e.context.save();
      e.context.rotate(b);
      e.context.drawImage(e.image, -e.image.width / 2, -(e.image.height / 2));
      f = {
        rectangle: c,
        alpha: runways.imageryOpacity,
        minimumTerrainLevel: 12,
      };
      e.canvas.toBlob ? e.canvas.toBlob((a) => {
        a = new Cesium.ImageryLayer(new Cesium.SingleTileImageryProvider({
          url: URL.createObjectURL(a),
          rectangle: c,
        }), f);
        geofs.api.viewer.imageryLayers.add(a);
        d.push(a);
      }) : (g = new Cesium.ImageryLayer(new Cesium.SingleTileImageryProvider({
        url: e.canvas.toDataURL(),
        rectangle: c,
      }), f),
      geofs.api.viewer.imageryLayers.add(g),
      d.push(g));
      e.context.restore();
      h.jumpToEnd();
    });
  },
};
runways.generateRunwayId = function (a) {
  return a[0] + a[1] + a[3];
}
;
runways.runway = function (a, b) {
  this.id = b || runways.generateRunwayId(a);
  this.icao = a[0];
  this.location = [a[4], a[5], 0];
  this.heading = fixAngle(a[3]);
  this.headingRad = this.heading * DEGREES_TO_RAD;
  this.lengthFeet = a[1];
  this.widthFeet = a[2];
  this.lengthMeters = this.lengthFeet * FEET_TO_METERS;
  this.widthMeters = this.widthFeet * FEET_TO_METERS;
  this.threshold1 = this.location;
  this.padding = a[6] || runways.defaultPadding;
  this.meterlla = xy2ll([Math.sin(this.headingRad), Math.cos(this.headingRad)], this.threshold1);
  this.lengthInLla = V2.scale(this.meterlla, this.lengthMeters);
  this.widthInLla = xy2ll([-Math.cos(this.headingRad) * this.widthMeters, Math.sin(this.headingRad) * this.widthMeters], this.threshold1);
  this.meterAcrossInLla = V3.scale(this.widthInLla, 1 / this.widthMeters);
  this.threshold2 = V2.add(this.threshold1, this.lengthInLla);
  runways.modelVisibility && this.generateRunwayModel();
}
;
runways.runway.prototype = {
  generateRunwayModel() {
    if (!this.modelExists) {
      let a = clamp(this.widthMeters / runways.modelRunwayWidth, 0.5, 10),
        b = new Cesium.Color(0.5, 0.5, 0.5, 0.7);
      if (geofs.retroOn) {
        b = new Cesium.GeometryInstance({
          geometry: new Cesium.GroundPolylineGeometry({
            positions: Cesium.Cartesian3.fromDegreesArray([this.threshold1[1] - this.widthInLla[1], this.threshold1[0] - this.widthInLla[0], this.threshold1[1] + this.widthInLla[1], this.threshold1[0] + this.widthInLla[0], this.threshold2[1] + this.widthInLla[1], this.threshold2[0] + this.widthInLla[0], this.threshold2[1] - this.widthInLla[1], this.threshold2[0] - this.widthInLla[0]]),
            width: 10,
            loop: !0,
          }),
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString('#2caecf')),
          },
        }),
        geofs.api.viewer.scene.groundPrimitives.add(new Cesium.GroundPolylinePrimitive({
          geometryInstances: b,
          appearance: new Cesium.PolylineColorAppearance(),
        }));
      } else if (Cesium.Entity.supportsMaterialsforEntitiesOnTerrain(geofs.api.viewer.scene) && !geofs.isApp) {
        this.entities = [];
        var c = V2.scale(this.meterlla, runways.thresholdLength * a),
          d = geofs.api.viewer.entities.add({
            polygon: {
              hierarchy: {
                positions: [new Cesium.Cartesian3.fromDegrees(this.threshold1[1] - this.widthInLla[1], this.threshold1[0] - this.widthInLla[0], 0), new Cesium.Cartesian3.fromDegrees(this.threshold1[1] + c[1] - this.widthInLla[1], this.threshold1[0] + c[0] - this.widthInLla[0], 0), new Cesium.Cartesian3.fromDegrees(this.threshold1[1] + c[1] + this.widthInLla[1], this.threshold1[0] + c[0] + this.widthInLla[0], 0), new Cesium.Cartesian3.fromDegrees(this.threshold1[1] + this.widthInLla[1], this.threshold1[0] + this.widthInLla[0], 0)],
              },
              material: new Cesium.ImageMaterialProperty({
                image: 'models/objects/runway/threshold2.jpg',
                color: b,
              }),
              classificationType: Cesium.ClassificationType.TERRAIN,
              stRotation: this.headingRad - HALF_PI,
              shadows: Cesium.ShadowMode.ENABLED,
            },
            interleave: !1,
            allowPicking: !1,
          });
        this.entities.push(d);
        d = geofs.api.viewer.entities.add({
          polygon: {
            hierarchy: {
              positions: [new Cesium.Cartesian3.fromDegrees(this.threshold2[1] - this.widthInLla[1], this.threshold2[0] - this.widthInLla[0], 0), new Cesium.Cartesian3.fromDegrees(this.threshold2[1] - c[1] - this.widthInLla[1], this.threshold2[0] - c[0] - this.widthInLla[0], 0), new Cesium.Cartesian3.fromDegrees(this.threshold2[1] - c[1] + this.widthInLla[1], this.threshold2[0] - c[0] + this.widthInLla[0], 0), new Cesium.Cartesian3.fromDegrees(this.threshold2[1] + this.widthInLla[1], this.threshold2[0] + this.widthInLla[0], 0)],
            },
            material: new Cesium.ImageMaterialProperty({
              image: 'models/objects/runway/threshold2.jpg',
              color: b,
            }),
            classificationType: Cesium.ClassificationType.TERRAIN,
            stRotation: this.headingRad + HALF_PI,
            shadows: Cesium.ShadowMode.ENABLED,
          },
          interleave: !1,
          allowPicking: !1,
        });
        this.entities.push(d);
        var e = Math.ceil((this.lengthMeters - 2 * runways.thresholdLength * a) / (runways.tileLength * a));
        a = V2.scale(this.meterlla, runways.tileLength * a);
        c = [this.threshold1[0] + c[0], this.threshold1[1] + c[1]];
        for (let f = 0; f <= e; f++) {
          d = geofs.api.viewer.entities.add({
            polygon: {
              hierarchy: {
                positions: [new Cesium.Cartesian3.fromDegrees(c[1] - this.widthInLla[1], c[0] - this.widthInLla[0], 0), new Cesium.Cartesian3.fromDegrees(c[1] + a[1] - this.widthInLla[1], c[0] + a[0] - this.widthInLla[0], 0), new Cesium.Cartesian3.fromDegrees(c[1] + a[1] + this.widthInLla[1], c[0] + a[0] + this.widthInLla[0], 0), new Cesium.Cartesian3.fromDegrees(c[1] + this.widthInLla[1], c[0] + this.widthInLla[0], 0)],
              },
              material: new Cesium.ImageMaterialProperty({
                image: 'models/objects/runway/tile2.jpg',
                color: b,
              }),
              classificationType: Cesium.ClassificationType.TERRAIN,
              stRotation: this.headingRad + HALF_PI,
              shadows: Cesium.ShadowMode.ENABLED,
            },
            interleave: !1,
            allowPicking: !1,
          }),
          c = V2.add(c, a),
          this.entities.push(d);
        }
      } else {
        this.imageryLayers = [],
        b = 0.5 * this.lengthMeters,
        V2.scale(this.meterlla, b),
        d = 0.5 * b,
        b = V2.scale(this.meterlla, d),
        d = xy2ll([d, d], this.threshold1),
        e = [this.threshold1[0] + b[0], this.threshold1[1] + b[1]],
        e = Cesium.Rectangle.fromDegrees(e[1] - d[1], e[0] - d[0], e[1] + d[1], e[0] + d[0]),
        runways.asyncSetImageLayerRotationPosition('models/objects/runway/full.jpg', this.headingRad - HALF_PI, e, this.imageryLayers),
        e = [this.threshold2[0] - b[0], this.threshold2[1] - b[1]],
        e = Cesium.Rectangle.fromDegrees(e[1] - d[1], e[0] - d[0], e[1] + d[1], e[0] + d[0]),
        runways.asyncSetImageLayerRotationPosition('models/objects/runway/full.jpg', this.headingRad + HALF_PI, e, this.imageryLayers);
      }
    }
  },
  destroyRunwayModel() {
    geofs.api.destroyModel(this.threshold1Model);
    geofs.api.destroyModel(this.threshold2Model);
    this.tiles && this.tiles.forEach((a) => {
      geofs.api.destroyModel(a);
    });
    this.tiles = null;
    this.entities && this.entities.forEach((a) => {
      geofs.api.viewer.entities.remove(a);
    });
    this.entities = null;
    this.imageryLayers && (this.imageryLayers.forEach((a) => {
      geofs.api.viewer.imageryLayers.remove(a, !0);
    }),
    this.imageryLayers = null);
    this.modelExists = !1;
  },
  destroy() {
    this.destroyRunwayModel();
  },
};
export default runways;
