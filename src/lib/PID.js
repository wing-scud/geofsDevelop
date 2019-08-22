const PID = function (a, b, c) {
  this._kp = a;
  this._ki = b;
  this._kd = c;
  this.reset();
};
PID.prototype.reset = function () {
  this._iTerm = this._lastError = this._lastInput = 0;
}
;
PID.prototype.set = function (a, b, c) {
  this._minOutput = b;
  this._maxOutput = c;
  this._setPoint = a;
}
;
PID.prototype.compute = function (a, b) {
  const c = this._setPoint - a;
  this._iTerm += clamp(c * b * this._ki, this._minOutput, this._maxOutput);
  clamp(c * b * this._ki, this._minOutput, this._maxOutput);
  b = (a - this._lastInput) / b;
  this._lastErr = c;
  this._lastInput = a;
  return clamp(this._kp * c + this._iTerm - this._kd * b, this._minOutput, this._maxOutput);
}
;
export default PID;
