



import geofs from "../geofs"
var  GlassPanel = function (a) {
  this.canvas = new geofs.api.Canvas({
    height: 100,
    width: 100,
  });
  this.entity = geofs.api.viewer.entities.add({
    box: {
      dimensions: new Cesium.Cartesian3(1, 1, 1),
      material: this.canvas.getTexture(),
    },
  });
  return this;
}
;
GlassPanel.prototype = {
  update() {},
  updateCockpitPosition() {},
  destroy() {},
};
export default GlassPanel;
