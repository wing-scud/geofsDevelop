function rigidBody() {
  this.s_inverseMass = this.mass = 0;
  this.reset();
  this.minLinearVelocity = 0.1;
  this.minAngularVelocity = 0.01;
}
rigidBody.prototype.reset = function () {
  this.v_linearVelocity = [0, 0, 0];
  this.v_angularVelocity = [0, 0, 0];
  this.v_totalForce = [0, 0, 0];
  this.v_totalTorque = [0, 0, 0];
  this.v_prevLinearVelocity = [0, 0, 0];
  this.v_prevTotalTorque = [0, 0, 0];
  this.v_acceleration = [0, 0, 0];
  this.v_torque = [0, 0, 0];
}
;
rigidBody.prototype.setMassProps = function (a, b) {
  b = b || 0.1;
  $.isArray(b) || (b = [b, b, b]);
  this.mass = a;
  this.s_inverseMass = 1 / a;
  this.v_localInvInertia = [b[0] / a, b[1] / a, b[2] / a];
  this.m_localInvInertiaTensor = [[this.v_localInvInertia[0], 0, 0], [0, this.v_localInvInertia[1], 0], [0, 0, this.v_localInvInertia[2]]];
  this.m_worldInvInertiaTensor = M33.dup(this.m_localInvInertiaTensor);
  this.gravityForce = [0, 0, -GRAVITY * a];
}
;
rigidBody.prototype.getLinearVelocity = function () {
  return this.v_linearVelocity;
}
;
rigidBody.prototype.getAngularVelocity = function () {
  return this.v_angularVelocity;
}
;
rigidBody.prototype.setLinearVelocity = function (a) {
  this.v_linearVelocity = a;
}
;
rigidBody.prototype.setAngularVelocity = function (a) {
  this.v_angularVelocity = a;
}
;
rigidBody.prototype.getVelocityInLocalPoint = function (a) {
  return V3.add(this.v_linearVelocity, V3.cross(a, this.v_angularVelocity));
}
;
rigidBody.prototype.getForceInLocalPoint = function (a) {
  const b = V3.add(this.v_totalForce, V3.cross(a, this.v_totalTorque));
  return V3.add(b, V3.scale(this.getVelocityInLocalPoint(a), this.mass));
}
;
rigidBody.prototype.applyCentralForce = function (a) {
  this.v_totalForce = V3.add(this.v_totalForce, a);
}
;
rigidBody.prototype.applyTorque = function (a) {
  this.v_totalTorque = V3.add(this.v_totalTorque, a);
}
;
rigidBody.prototype.applyForce = function (a, b) {
  this.applyCentralForce(a);
  this.applyTorque(V3.cross(a, b));
}
;
rigidBody.prototype.applyCentralImpulse = function (a) {
  this.v_linearVelocity = V3.add(this.v_linearVelocity, V3.scale(a, this.s_inverseMass));
}
;
rigidBody.prototype.applyTorqueImpulse = function (a) {
  this.v_angularVelocity = V3.add(this.v_angularVelocity, M33.multiplyV(this.m_worldInvInertiaTensor, a));
}
;
rigidBody.prototype.applyImpulse = function (a, b) {
  this.applyCentralImpulse(a);
  this.applyTorqueImpulse(V3.cross(a, b));
}
;
rigidBody.prototype.computeJacobian = function (a, b, c, d) {
  a = -(1 + a) * b;
  b = this.s_inverseMass;
  c = V3.dot(d, V3.cross(c, M33.multiplyV(this.m_worldInvInertiaTensor, V3.cross(d, c))));
  return a / (b + c);
}
;
rigidBody.prototype.computeImpulse = function (a, b, c, d) {
  a = this.computeJacobian(a, b, c, d);
  return V3.scale(d, a);
}
;
rigidBody.prototype.integrateVelocities = function (a) {
  this.v_linearVelocity = V3.add(this.v_linearVelocity, V3.scale(this.v_totalForce, this.s_inverseMass * a));
  this.v_angularVelocity = V3.add(this.v_angularVelocity, M33.multiplyV(this.m_worldInvInertiaTensor, V3.scale(this.v_totalTorque, a)));
}
;
rigidBody.prototype.integrateTransform = function (a) {
  let b = V3.length(this.v_linearVelocity),
    c = V3.length(this.v_angularVelocity);
  if (b > this.minLinearVelocity || c > this.minAngularVelocity) {
    b = geofs.aircraft.instance,
    c = xyz2lla(V3.scale(this.v_linearVelocity, a), b.llaLocation),
    b.llaLocation = V3.add(b.llaLocation, c),
    a = V3.scale(this.v_angularVelocity, a),
    a = M33.transformByTranspose(b.object3d._initialRotation, a),
    b.object3d.rotateInitialRotation(a);
  }
  this.setFrameForces();
  this.clearForces();
}
;
rigidBody.prototype.setFrameForces = function () {}
;
rigidBody.prototype.setCurrentAcceleration = function (a, b) {
  this.v_acceleration = V3.scale(V3.sub(this.v_linearVelocity, this.v_prevLinearVelocity), a);
  this.v_acceleration = V3.add([0, 0, GRAVITY], this.v_acceleration);
  this.v_torque = V3.scale(V3.sub(this.v_angularVelocity, this.v_prevTotalTorque), a);
  this.v_prevLinearVelocity = V3.dup(this.v_linearVelocity);
  this.v_prevTotalTorque = V3.dup(this.v_angularVelocity);
}
;
setInterval(() => {
  if (geofs.aircraft.instance && geofs.aircraft.instance.object3d) {
    try {
      geofs.aircraft.instance.object3d.resetRotationMatrix();
    } catch (a) {
      geofs.debug.error(a, 'resetRotationMatrix interval');
    }
  }
}, 1E4);
rigidBody.prototype.clearForces = function () {
  this.v_totalForce = [0, 0, 0];
  this.v_totalTorque = [0, 0, 0];
}
;
rigidBody.prototype.saveState = function () {
  this.savedLinearVelocity = V3.dup(this.v_linearVelocity);
  this.savedAngularVelocity = V3.dup(this.v_angularVelocity);
}
;
rigidBody.prototype.restoreState = function () {
  this.clearForces();
  this.v_linearVelocity = V3.dup(this.savedLinearVelocity);
  this.v_angularVelocity = V3.dup(this.savedAngularVelocity);
};
export default rigidBody;
