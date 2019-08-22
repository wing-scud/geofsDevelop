const weather = window.weather || {};
weather.dataProxy = `${geofs.url}/backend/weather/metar.php?icao=`;
weather.minimumCloudCover = 10;
weather.updateRate = 6E4;
weather.timeRatio = 1;
weather.seasonRatio = 1;
weather.defaults = {
  ceiling: 1E3,
  cloudCoverThickness: 200,
  cloudCover: 0,
  precipitationType: 'none',
  precipitationQuantity: 0,
  thunderstorm: 0,
  visibility: 1E4,
  windDirection: 0,
  windSpeedMS: 0,
  windLayerHeight: 7E3,
  windLayerNb: 3,
  AIR_PRESSURE_SL,
  AIR_TEMP_SL,
};
weather.thermals = {
  radius: 100,
  speed: 3,
  closest: 0,
  currentVector: [0, 0, 0],
};
weather.init = function () {
  weather.currentWindVector = [0, 0, 0];
  weather.currentWindDirection = 0;
  weather.currentWindSpeed = 0;
  weather.currentWindSpeedMs = 0;
  weather.activeWindLayer = 0;
  weather.windLayers = [];
  setInterval(() => {
    weather.refresh();
  }, weather.updateRate);
  $(document).on('change', '.geofs-timeSlider', function (a, b) {
    a = (`00${parseInt(60 * (b % 1).toFixed(2))}`).slice(-2);
    b = parseInt(b);
    $(this).find('.slider-input').val(`${b}:${a}`);
  });
}
;
weather.reset = function () {
  weather.set($.extend({}, weather.defaults));
}
;
weather.refresh = function (a) {
  a = a || camera.lla;
  const b = function (b) {
    try {
      var c = eval(b);
    } catch (g) {
      geofs.debug.error(g, 'weather.refresh refreshCallback eval(response)');
    }
    if (c = c || [],
    c.length > 0) { var d = c[0]; }
    weather.set($.extend({}, weather.defaults, weather.definition, d), a);
  };
  if (geofs.preferences.weather.manual) { weather.set(null, a); } else {
    const c = geofs.runways.getNearestRunway(a);
    c ? $.ajax(weather.dataProxy + c.icao, {
      success: b,
      error: b,
    }) : b();
  }
}
;
weather.generateFromPreferences = function () {
  let a = parseInt(Math.abs(camera.lla[0])),
    b = geofs.preferences.weather.localTime,
    c = weather.timeRatio,
    d = geofs.preferences.weather.quality,
    e = d / 100,
    f = geofs.preferences.weather.season;
  weather.manualDefinition && weather.roundedLatitude == a && weather.manualQuality == d && weather.manualSeason == f && weather.manualTimeOfDay == b || (weather.roundedLatitude = a,
  weather.manualQuality = d,
  weather.manualSeason = f,
  weather.manualTimeOfDay = b,
  weather.manualDefinition = {
    cloudCover: Math.min(100, 2 * d),
    fogDensity: (1 - 2 * Math.abs(c - 0.5)) * (e > 0.1 ? 1 - e : 0) * 100,
    fogBottom: geofs.groundElevation || 0,
    fogCeiling: 2 * geofs.groundElevation + 50 || 0,
    precipitationAmount: d > 50 ? 2 * (d - 50) : 0,
    precipitationType: f > 75 && Math.abs(a) > 30 ? 'snow' : 'rain',
    thunderstorm: d > 90 ? 10 * (d - 90) : 0,
    visibility: 1E4,
    windDirection: 360 * Math.random(),
    windSpeedMS: d / 6,
    windLayerHeight: 7E3,
    windLayerNb: 3,
    AIR_TEMP_SL: clamp(0.5 * (100 - f - Math.abs(a)) * (1 - c), -50, 50),
  });
  return weather.manualDefinition;
}
;
weather.set = function (a, b) {
  a = a || {};
  b = b || camera.lla;
  weather.setDateAndTime(b);
  geofs.fx.dayNightManager.init();
  geofs.preferences.weather.manual ? ($('.geofs-manualWeather').show(),
  a = weather.generateFromPreferences(),
  $('.geofs-metarDisplay').html('').parent().hide()) : ($('.geofs-manualWeather').hide(),
  $('.geofs-metarDisplay').html(a.METAR).parent().show());
  weather.definition = $.extend({}, weather.defaults, a);
  a = 0.01 * weather.definition.precipitationAmount;
  weather.definition.windSpeedMS > 0 ? (weather.initWind(weather.definition.windDirection, weather.definition.windSpeedMS),
  weather.windActive = !0,
  weather.setWindIndicatorVisibility(!0)) : (weather.windOff(),
  weather.setWindIndicatorVisibility(!1));
  geofs.fx.fog.create();
  weather.definition.fog = 0.01 * weather.definition.fogDensity;
  weather.definition.backgroundFogDensity = clamp(4 * (a - 0.5), weather.definition.fog, 0.9);
  weather.definition.coverHalfThickness = weather.definition.cloudCoverThickness / 2;
  b = weather.definition.cloudCover;
  b < weather.minimumCloudCover && (weather.definition.cloudCover = 0);
  geofs.fx.cloudManager.init(camera.lla);
  geofs.fx.cloudManager.instance.setCloudCover(b);
  weather.definition.precipitationAmount > 0 ? geofs.fx.precipitation.create(weather.definition.precipitationType, weather.definition.precipitationAmount) : geofs.fx.precipitation.destroy();
  weather.belowCeilingBrightness = clamp(1.2 - a, 0, 1);
  weather.definition.precipitationType == 'snow' ? geofs.api.setImageryColorModifier('snow', {
    brightness: 2.5,
    contrast: 1.5,
    saturation: 0.1,
  }) : geofs.api.removeImageryColorModifier('snow');
}
;
weather.update = function (a) {
  const b = camera.lla;
  if (weather.windActive && weather.windLayers.length > 0) {
    for (var c = geofs.aircraft.instance.llaLocation[2], d = 0, e = 1; e < weather.windLayers.length && !(c < weather.windLayers[e].floor); e++) { d = e; }
    weather.activeWindLayer != d && (weather.windLayers[d].computeAndSet(),
    weather.activeWindLayer = d);
  }
  geofs.fx.cloudManager.update(b, a);
  geofs.fx.precipitation.update(b, a);
  geofs.fx.dayNightManager.update(b, a);
}
;
weather.setWindIndicatorVisibility = function (a) {
  instruments.list.wind && (a ? instruments.visible && instruments.list.wind.show() : instruments.list.wind.hide());
}
;
weather.setDateAndTime = function (a) {
  a = a || camera.lla || [0, 0, 0];
  a = a[1] * LONGITUDE_TO_HOURS;
  if (geofs.preferences.weather.manual) {
    weather.localTime = geofs.preferences.weather.localTime,
    weather.localSeason = geofs.preferences.weather.season,
    weather.zuluTime = boundHours24(weather.localTime - a),
    geofs.api.setTimeAndDate(3600 * weather.zuluTime, Math.floor(3.65 * weather.localSeason));
  } else {
    const b = new Date();
    geofs.api.setClock(b);
    weather.zuluTime = b.getUTCHours();
    weather.localTime = boundHours24(weather.zuluTime + a);
    a = (Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(b.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1E3;
    weather.localSeason = 0.27 * a;
  }
  weather.timeRatio = Math.abs(weather.localTime / 12 - 1);
  weather.timeRatio = Number.parseFloat(weather.timeRatio.toFixed(2));
  weather.seasonRatio = Math.sin(2.7 * weather.localSeason * DEGREES_TO_RAD);
  geofs.isNight = weather.timeRatio > 0.4;
  geofs.animation.values.night != geofs.isNight && $('body').trigger('nightChange');
  geofs.animation.values.night = geofs.isNight;
  $('body').trigger('geofsTimeChange');
}
;
weather.Wind = function (a, b, c, d) {
  this.mainDirection = a;
  this.mainSpeedKnots = b * MS_TO_KNOTS;
  this.mainSpeedMs = b;
  a = this.mainDirection * DEGREES_TO_RAD;
  this.mainVectorMs = [Math.sin(a), Math.cos(a), 0];
  this.mainVectorMs = V3.scale(this.mainVectorMs, this.mainSpeedMs);
  this.floor = c;
  this.ceiling = d;
  this.direction = this.mainDirection;
  this.speed = this.mainSpeedMs;
  this.maxSpeedDelta = 0.3 * b;
  this.maxDirectionDelta = 45;
  this.directionOffset = this.speedOffset = 0;
  this.randomizerSpeed = 1;
}
;
weather.Wind.prototype.randomize = function () {
  this.speedOffset += (Math.random() - 0.5) * this.randomizerSpeed;
  this.speedOffset = clamp(this.speedOffset, -this.maxSpeedDelta, this.maxSpeedDelta);
  this.directionOffset += (Math.random() - 0.5) * this.randomizerSpeed;
  this.directionOffset = clamp(this.directionOffset, -this.maxDirectionDelta, this.maxDirectionDelta);
  this.direction = fixAngle(this.mainDirection + this.directionOffset);
  this.speed = this.mainSpeedMs + this.speedOffset;
}
;
weather.Wind.prototype.computeAndSet = function () {
  geofs.preferences.weather.randomizeWind && this.randomize();
  let a = [0, 0, 0];
  this.direction && (a = this.direction * DEGREES_TO_RAD,
  a = [Math.sin(a), Math.cos(a), 0],
  a = this.computeLift(a));
  weather.currentWindVector = V3.scale(a, this.speed);
  weather.currentWindDirection = this.direction;
  weather.currentWindSpeedMs = this.speed;
  weather.currentWindSpeed = this.speed * MS_TO_KNOTS;
}
;
weather.Wind.prototype.computeLift = function (a) {
  let b = geofs.aircraft.instance.llaLocation,
    c = V3.add(b, xyz2lla(V3.scale(a, 50), b)),
    d = geofs.getGroundAltitude(b[0], b[1]).location[2],
    e = geofs.getGroundAltitude(c[0], c[1]).location[2];
  geofs.debug && geofs.debug.probe && geofs.api.setModelPositionOrientationAndScale(geofs.debug.probe.model, [c[0], c[1], e]);
  c = d - e;
  c = Math.asin(c / Math.sqrt(c * c + 2500));
  b = clamp(500 - (b[2] - d), 0, 500) / 500;
  c *= b;
  b = V3.cross(a, [0, 0, 1]);
  return V3.rotate(a, b, -c);
}
;
weather.initWind = function (a, b) {
  weather.windLayers = [];
  a = fixAngle(a + 180);
  let c = weather.definition.windLayerHeight + Math.random() * weather.definition.windLayerHeight;
  weather.windLayers.push(new weather.Wind(a, b, 0, c));
  weather.windLayers[0].computeAndSet();
  if (b) {
    for (let d = 1; d < weather.windLayerNb; d++) {
      const e = c;
      c = e + weather.windLayerHeight + Math.random() * weather.definition.windLayerHeight;
      let f = b + (10 * Math.random() - 5),
        g = fixAngle(a + 360 * Math.random());
      weather.windLayers.push(new weather.Wind(g, f, e, c));
    }
  }
}
;
weather.windOff = function () {
  weather.windLayers = [];
  weather.currentWindVector = [0, 0, 0];
  weather.currentWindDirection = 0;
  weather.currentWindSpeed = 0;
  weather.currentWindSpeedMs = 0;
}
;
weather.getWindVector = function (a) {
  return weather.windActive && weather.windLayers.length > 0 ? V3.dup(weather.windLayers[0].mainVectorMs) : !1;
}
;
weather.atmosphere = {};
weather.atmosphere.init = function () {
  weather.atmosphere.update();
}
;
weather.atmosphere.update = function (a) {
  a = a || geofs.aircraft.instance.altitude;
  const b = weather.definition.AIR_TEMP_SL + KELVIN_OFFSET;
  weather.atmosphere.airTempAtAltitude = weather.definition.AIR_TEMP_SL - a * TEMPERATURE_LAPSE_RATE;
  weather.atmosphere.airTempAtAltitudeKelvin = weather.atmosphere.airTempAtAltitude + KELVIN_OFFSET;
  weather.atmosphere.airPressureAtAltitude = weather.definition.AIR_PRESSURE_SL * Math.pow(1 - a * TEMPERATURE_LAPSE_RATE / b, GR_LM);
  weather.atmosphere.airDensityAtAltitude = weather.atmosphere.airPressureAtAltitude * MOLAR_MASS_DRY_AIR / (IDEAL_GAS_CONSTANT * weather.atmosphere.airTempAtAltitudeKelvin);
};
export default weather;
