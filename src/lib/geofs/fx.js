import geofs from './geofs';
import Cesium from 'cesium/Cesium'
import weather from '../weather'
import { V3, V2 } from './utils'
import aircraft from './Aircraft'
class fx {}
//var PAGE_PATH = "https://www.geo-fs.com/"
var PAGE_PATH = 'http://localhost:3030/proxy/';
//var PAGE_PATH = document.location.href.replace(/\/[^\/]+$/, '/');
var GRAVITY = 9.81,
    DEGREES_TO_RAD = Math.PI / 180,
    RAD_TO_DEGREES = 180 / Math.PI,
    KMH_TO_MS = 1 / 3.6,
    METERS_TO_FEET = 3.2808399,
    FEET_TO_METERS = .3048,
    LONGITUDE_TO_HOURS = .0666,
    MERIDIONAL_RADIUS = 6378137,
    EARTH_CIRCUMFERENCE = 2 * MERIDIONAL_RADIUS * Math.PI,
    METERS_TO_LOCAL_LAT = 1 / (EARTH_CIRCUMFERENCE / 360),
    WGS84_TO_EGM96 = -37,
    EGM96_TO_WGS84 = 37,
    PI = Math.PI,
    HALF_PI = PI / 2,
    TWO_PI = 2 * PI,
    MS_TO_KNOTS = 1.94384449,
    KNOTS_TO_MS = .514444444,
    KMH_TO_KNOTS = .539956803,
    AXIS_TO_INDEX = {
        X: 0,
        Y: 1,
        Z: 2
    },
    AXIS_TO_VECTOR = {
        X: [1, 0, 0],
        Y: [0, 1, 0],
        Z: [0, 0, 1]
    },
    KELVIN_OFFSET = 273.15,
    TEMPERATURE_LAPSE_RATE = .0065,
    AIR_DENSITY_SL = 1.22,
    AIR_PRESSURE_SL = 101325,
    AIR_TEMP_SL = 20,
    DRAG_CONSTANT = .07,
    MIN_DRAG_COEF = .02,
    TOTAL_DRAG_CONSTANT = DRAG_CONSTANT + MIN_DRAG_COEF,
    IDEAL_GAS_CONSTANT = 8.31447,
    MOLAR_MASS_DRY_AIR = .0289644,
    GAS_CONSTANT = IDEAL_GAS_CONSTANT / MOLAR_MASS_DRY_AIR,
    GR_LM = GRAVITY * MOLAR_MASS_DRY_AIR / (IDEAL_GAS_CONSTANT * TEMPERATURE_LAPSE_RATE),
    DEFAULT_AIRFOIL_ASPECT_RATIO = 7,
    FOV = 60,
    VIEWPORT_REFERENCE_WIDTH = 1800,
    VIEWPORT_REFERENCE_HEIGHT = 800,
    SMOOTH_BUFFER = {},
    SMOOTHING_FACTOR = .2,
    SIX_STEP_WARNING = "#18a400 #2b9100 #487300 #835b00 #933700 #a71500".split(" ");
fx.papi = function(a, b) {
    this.lights = [];
    for (let c = 0; c < 4; c++) {
        a[2] = 0.5,
            this.lights[c] = {
                white: new geofs.light(a, 'whitepapi', fx.papiBillboardOptions),
                red: new geofs.light(a, 'redpapi', fx.papiBillboardOptions),
            },
            a = V2.add(a, b);
    }
    this.location = a;
    const d = this;
    a = Cesium.sampleTerrainMostDetailed(geofs.api.viewer.terrainProvider, [Cesium.Cartographic.fromDegrees(a[1], a[0])]);
    Cesium.when(a, (a) => {
        d.location[2] = a[0].height;
    });
    this.refresh();
};

function lla2xyz(a, b) {
    b = ll2xy(a, b);
    b[2] = a[2];
    return b
}

function ll2xy(a, b) {
    var c = [];
    c[1] = a[0] / METERS_TO_LOCAL_LAT;
    c[0] = a[1] / (1 / (Math.cos((b[0] + a[0]) * DEGREES_TO_RAD) * MERIDIONAL_RADIUS * DEGREES_TO_RAD));
    return c
}
fx.papi.prototype = {
    refresh() {
        const a = this;
        this.papiInterval = setInterval(() => {
            let b = geofs.utils.llaDistanceInMeters([geofs.aircraft.instance.llaLocation[0], geofs.aircraft.instance.llaLocation[1], a.location[2]], a.location, a.location),
                c = Math.atan2(geofs.aircraft.instance.llaLocation[2] - a.location[2], b) * RAD_TO_DEGREES;
            b = c < 2;
            let d = c < 2.5,
                e = c < 3.5;
            c = c < 4;
            a.lights[3].white.setVisibility(!b);
            a.lights[3].red.setVisibility(b);
            a.lights[2].white.setVisibility(!d);
            a.lights[2].red.setVisibility(d);
            a.lights[1].white.setVisibility(!e);
            a.lights[1].red.setVisibility(e);
            a.lights[0].white.setVisibility(!c);
            a.lights[0].red.setVisibility(c);
        }, 1E3);
    },
    destroy() {
        clearInterval(this.papiInterval);
        for (let a = 0; a < 4; a++) {
            this.lights[a].red.destroy(),
                this.lights[a].white.destroy();
        }
    },
};
fx.dayNightManager = {
    illumination: 1,
    saturation: {
        valueRamp: [0.12, 0.12, 0.12, 0.12, 1, 1, 1],
    },
    brightness: {
        valueRamp: [4, 4, 4, 2, 1, 1, 1],
    },
    gamma: {
        valueRamp: [0.18, 0.18, 0.18, 0.18, 1, 1, 1],
    },
    brightnessShift: {
        valueRamp: [-0.6, -0.6, -0.6, 0, 0],
    },
    groundBrightnessShift: {
        valueRamp: [-0.9, -0.9, -0.9, 0, 0],
    },
    groundAtmoSaturationShift: {
        valueRamp: [-0.6, -0.6, 0, 0, 0],
    },
    groundHueShift: {
        valueRamp: [0, 0, 0, 0, 0],
    },
    cloudsBrightness: {
        valueRamp: [0, 0, 0, 0.5, 1, 1],
    },
    fogBrightness: {
        valueRamp: [0.1, 0.1, 0.1, 0.5, 1, 1],
    },
    blackMarbleVisibility: {
        valueRamp: [1, 1, 1, 0, 0],
    },
    blackMarbleAlpha: {
        valueRamp: [0.1, 0.1, 0.1, 0, 0],
    },
    init() {
        geofs.api.viewer.scene.moon.show = weather.timeRatio > 0.55 ? !0 : !1;
    },
    update(a, b) {
        a = clamp(1 - weather.timeRatio + Math.sin(a[0] * DEGREES_TO_RAD) * weather.seasonRatio * 0.2, 0, 1);
        if (this.illumination != a) {
            geofs.api.blackMarble && (geofs.api.blackMarble.show = geofs.animation.filter(this.blackMarbleVisibility, a) > 0.3,
                geofs.api.blackMarble.alpha = geofs.animation.filter(this.blackMarbleAlpha, a));
            geofs.api.setImageryColorModifier('time', {
                brightness: geofs.animation.filter(this.brightness, a),
                saturation: geofs.animation.filter(this.saturation, a),
                gamma: geofs.animation.filter(this.gamma, a),
            });
            geofs.api.setAtmosphereColorModifier('time', {
                groundBrightnessShift: geofs.animation.filter(this.groundBrightnessShift, a),
                fogBrightness: geofs.animation.filter(this.fogBrightness, a),
                groundHueShift: geofs.animation.filter(this.groundHueShift, a),
                cloudsBrightness: geofs.animation.filter(this.cloudsBrightness, a),
                brightnessShift: geofs.animation.filter(this.brightnessShift, a),
            });
            b = parseInt(geofs.animation.filter(fx.cloudManager.redAnimation, weather.timeRatio));
            let c = parseInt(geofs.animation.filter(fx.cloudManager.greenAnimation, weather.timeRatio)),
                d = parseInt(geofs.animation.filter(fx.cloudManager.blueAnimation, weather.timeRatio));
            fx.cloudManager.setCloudColors(b, c, d);
            this.illumination = a;
        }
    },
};
fx.fog = {
    baseColor: new Cesium.Color(1, 1, 1, 1),
    brightness: 1,
    create() {
        fx.fog.ppStage || (fx.fog.ppStage = new Cesium.PostProcessStage({
                fragmentShader: 'uniform sampler2D colorTexture; \nuniform sampler2D depthTexture; \nuniform vec4 fogColor; \nuniform float fogDensity; \nvarying vec2 v_textureCoordinates; \nvoid main(void) \n{ \n    vec4 color = texture2D(colorTexture, v_textureCoordinates); \n    vec4 depth = texture2D(depthTexture, v_textureCoordinates); \n    gl_FragColor = mix(color, fogColor, clamp(depth.r * fogDensity, 0.0, 1.0)); \n} \n',
                uniforms: {
                    fogColor: this.adjustedColor,
                    fogDensity: this.density || 1,
                },
            }),
            geofs.api.viewer.scene.postProcessStages.add(fx.fog.ppStage));
    },
    setBrightness(a) {
        this.brightness = a || this.brightness;
        fx.fog.ppStage && (fx.fog.ppStage.uniforms.fogColor = new Cesium.Color(this.baseColor.red * this.brightness, this.baseColor.green * this.brightness, this.baseColor.blue * this.brightness, 1));
    },
    setColor(a, b, c) {
        this.baseColor.red = a / 255 || this.baseColor.red;
        this.baseColor.green = b / 255 || this.baseColor.green;
        this.baseColor.blue = c / 255 || this.baseColor.blue;
        fx.fog.ppStage && (fx.fog.ppStage.uniforms.fogColor = new Cesium.Color(this.baseColor.red * this.brightness, this.baseColor.green * this.brightness, this.baseColor.blue * this.brightness, 1));
    },
    setDensity(a) {
        this.density = a || this.density || 0;
        fx.fog.ppStage && (fx.fog.ppStage.uniforms.fogDensity = a);
    },
    destroy() {
        fx.fog.ppStage && (geofs.api.viewer.scene.postProcessStages.remove(fx.fog.ppStage),
            fx.fog.ppStage = null);
    },
};
fx.volumetricFog = {
    defaultRamp: {
        color: new Cesium.Color(1, 1, 1),
        opacity: 1,
        cutoff: 0.95,
    },
    getColorRamp(a) {
        this.ramp = Object.assign({}, this.defaultRamp, this.ramp, a);
        a = document.createElement('canvas');
        a.width = 100;
        a.height = 1;
        let b = a.getContext('2d'),
            c = b.createLinearGradient(0, 0, 100, 0);
        c.addColorStop(0, this.ramp.color.withAlpha(this.ramp.opacity).toCssColorString());
        c.addColorStop(this.ramp.cutoff, this.ramp.color.withAlpha(this.ramp.opacity).toCssColorString());
        c.addColorStop(1, this.ramp.color.withAlpha(0).toCssColorString());
        b.fillStyle = c;
        b.fillRect(0, 0, 100, 1);
        return a;
    },
    create(a, b, c) {
        this.ceiling = b || this.ceiling || weather.definition.ceiling;
        this.material || (this.material = Cesium.Material.fromType('ElevationRamp'));
        this.material.uniforms.image = this.getColorRamp(c);
        this.material.uniforms.minimumHeight = a || 0;
        this.material.uniforms.maximumHeight = b;
        geofs.api.viewer.scene.globe.material = this.material;
    },
    setColor(a) {
        this.ramp = Object.assign({}, this.defaultRamp, this.ramp);
        this.ramp.color = a;
        this.material && (this.material.uniforms.image = this.getColorRamp(this.ramp));
    },
    setCeiling(a) {
        geofs.api.viewer.scene.globe.material && (geofs.api.viewer.scene.globe.material.uniforms.maximumHeight = a);
    },
    destroy() {
        this.material = geofs.api.viewer.scene.globe.material = null;
    },
};
fx.cloudManager = {
    cloudCoverToCloudNumber: 15,
    clouds: {},
    numberOfClouds: 0,
    currentID: 0,
    maxNumberOfClouds: 0,
    refreshDistance: 1E3,
    currentCenter: [0, 0, 0],
    redAnimation: {
        valueRamp: [255, 255, 250, 100, 100],
    },
    greenAnimation: {
        valueRamp: [255, 255, 230, 100, 100],
    },
    blueAnimation: {
        valueRamp: [255, 255, 200, 100, 100],
    },
    fogBrightnessRamp: [0, 0, 0, 1],
    groundBrightnessRamp: [-0.4, -0.4, -0.4, 0],
    setCloudCoverToCloudNumber(a) {
        this.cloudCoverToCloudNumber = a || this.cloudCoverToCloudNumber;
        fx.cloudManager.instance && this.setCloudCover(fx.cloudManager.instance.percentCoverage);
    },
    init(a) {
        this.cloudSituation = null;
        const b = lla2xyz(V3.sub(this.currentCenter, a), geofs.aircraft.instance.llaLocation);
        V3.length(b) > this.refreshDistance && this.destroyAllClouds();
        if (fx.cloudManager.instance) {
            return fx.cloudManager.instance.update(a),
                fx.cloudManager.instance;
        }
        this.currentCenter = a;
        this.numberOfClouds = 0;
        fx.cloudManager.instance = this;
    },
    spawnClouds() {
        let a = this.maxNumberOfClouds - this.numberOfClouds;
        if (a > 0) {
            for (let b = 0; b < a; b++) { new fx.Cloud(); }
        } else if (a < 0) {
            for (; a < 0;) {
                this.destroyLastCloud(),
                    a++;
            }
        }
    },
    update(a, b) {
        if (fx.cloudManager.instance) {
            fx.cloudManager.instance.currentCenter = a;
            b = clamp((a[2] - (weather.definition.ceiling - weather.definition.coverHalfThickness)) / weather.definition.cloudCoverThickness, weather.belowCeilingBrightness, 1);
            let c = a[2] < weather.definition.ceiling - weather.definition.coverHalfThickness ? 2 : a[2] < weather.definition.ceiling ? 6 : a[2] < weather.definition.ceiling + weather.definition.coverHalfThickness ? 12 : 8;
            a[2] < weather.definition.fogCeiling && (c += 1);
            this.cloudSituation != c && (weather.definition.fog > 0 ? (fx.volumetricFog.create(weather.definition.fogBottom, weather.definition.fogCeiling, {
                        opacity: weather.definition.backgroundFogDensity,
                        cutoff: 0,
                    }),
                    a[2] < weather.definition.fogCeiling && fx.fog.setDensity(weather.definition.backgroundFogDensity)) : fx.volumetricFog.destroy(),
                c > 1 && fx.fog.setDensity(weather.definition.backgroundFogDensity),
                c <= 7 ? this.fullCover ? (fx.precipitation.show(),
                    this.fullCover.entity.show(),
                    geofs.disableShadows(),
                    geofs.api.hideSun(),
                    geofs.api.setImageryColorModifier('cloudcover', {
                        saturation: clamp(b, 0.2, 1),
                        brightness: clamp(b, 0.2, 1),
                    }),
                    geofs.api.setAtmosphereColorModifier('cloudcover', {
                        saturationShift: -2,
                        brightnessShift: b - 0.9,
                        groundBrightnessShift: b - 1.2,
                        groundSaturationShift: b - 1,
                    })) : (geofs.enableShadows(),
                    geofs.api.showSun(),
                    geofs.api.removeImageryColorModifier('cloudcover'),
                    geofs.api.removeAtmosphereColorModifier('cloudcover')) : c & 8 && (this.fullCover && (this.fullCover.entity.show(),
                        fx.volumetricFog.create(0, weather.definition.ceiling + weather.definition.coverHalfThickness, {
                            opacity: 1,
                            cutoff: 0.95,
                        })),
                    fx.fog.setDensity(0),
                    fx.precipitation.hide(),
                    geofs.enableShadows(),
                    geofs.api.showSun(),
                    geofs.api.removeImageryColorModifier('cloudcover'),
                    geofs.api.removeAtmosphereColorModifier('cloudcover')));
            if (c & 4 && this.fullCover) {
                let d = 0;
                c < 8 && (d = weather.definition.backgroundFogDensity);
                a = clamp(0.1 * (weather.definition.coverHalfThickness - Math.abs(weather.definition.ceiling - a[2])), d, 1);
                fx.fog.setDensity(a);
                a > 0.5 ? this.fullCover.entity.hide() : this.fullCover.entity.show();
            }
            b != this.lastBrightness && (geofs.api.setAtmosphereColorModifier('clouds', {
                    cloudsBrightness: b,
                    groundBrightnessShift: geofs.animation.getRampRatio(this.groundBrightnessRamp, b),
                    fogBrightness: geofs.animation.getRampRatio(this.fogBrightnessRamp, b),
                }),
                this.lastBrightness = b);
            this.cloudSituation = c;
        }
    },
    setCloudsBrightness(a) {
        fx.cloudManager.instance && this.setCloudColors(null, null, null, a);
    },
    setCloudColors(a, b, c, d) {
        if (fx.cloudManager.instance) {
            a && b && c ? this.cloudColor = Cesium.Color.fromBytes(a, b, c) : this.cloudColor || (this.cloudColor = Cesium.Color.fromBytes(255, 255, 255));
            this.brightness = d || this.brightness || 1;
            let e = this.cloudColor.darken(1 - this.brightness, new Cesium.Color()),
                f;
            for (f in fx.cloudManager.instance.clouds) { fx.cloudManager.instance.clouds[f].setColor(e); }
            this.fullCover && this.fullCover.setColor(e);
            fx.fog.setColor(a, b, c);
            fx.fog.setBrightness(clamp(d, 0, 1));
            fx.volumetricFog.setColor(e);
        }
    },
    setCloudCover(a) {
        fx.cloudManager.instance && (this.percentCoverage = a || 0,
            a *= 0.01,
            this.percentCoverage >= 100 ? this.fullCover || (this.fullCover = new fx.CloudCover([camera.lla[0], camera.lla[1], weather.definition.ceiling])) : this.fullCover && (this.fullCover.destroy(),
                this.fullCover = null),
            geofs.api.setAtmosphereColorModifier('weatherHaze', {
                groundBrightnessShift: clamp(0.5 * a, 0, 0.1),
                fogBrightness: clamp(1 + a, 1, 1.2),
                brightnessShift: clamp(0.5 * a, 0, 0.1),
            }),
            this.setNumberOfClouds(this.percentCoverage * this.cloudCoverToCloudNumber),
            this.cloudSituation = null);
    },
    setNumberOfClouds(a) {
        fx.cloudManager.instance && (this.maxNumberOfClouds = a,
            this.spawnClouds());
    },
    destroyLastCloud() {
        fx.cloudManager.instance.currentID--;
        this.clouds[fx.cloudManager.instance.currentID].destroy();
    },
    destroyAllClouds() {
        if (fx.cloudManager.instance) {
            for (const a in this.clouds) { this.clouds[a].destroy(); }
            this.fullCover && (this.fullCover.destroy(),
                this.fullCover = null);
            fx.cloudManager.instance.currentID = 0;
        }
    },
    destroy() {
        fx.cloudManager.instance && (this.destroyAllClouds(),
            fx.cloudManager.instance = null);
    },
};
fx.Cloud = function(a) {
    this._id = fx.cloudManager.instance.currentID++;
    this._type = $.extend({}, this.defaultType, this.types[Math.floor(Math.random() * this.types.length)]);
    fx.cloudManager.instance.numberOfClouds++;
    fx.cloudManager.instance.clouds[this._id] = this;
    this.create(a);
};
fx.Cloud.prototype = {
    defaultType: {
        belowCeiling: 0,
        aboveCeiling: 1E3,
        opacity: 0.8,
        minRadius: 1,
        maxRadius: 1E5,
        rotationMultiplier: 0,
        brightnessDelta: 0,
    },
    types: [{
        billboard: 'http://localhost:3030/proxy/images/weather/clouds/1.png',
        belowCeiling: 500,
        aboveCeiling: 1E3,
        minScale: 6,
        maxScale: 10,
        maxRadius: 5E4,
        opacity: 0.9,
    }, {
        billboard: 'http://localhost:3030/proxy/images/weather/clouds/6.png',
        belowCeiling: 500,
        aboveCeiling: 1E3,
        minScale: 10,
        maxScale: 15,
        maxRadius: 5E4,
        opacity: 0.9,
    }, {
        billboard: 'http://localhost:3030/proxy/images/weather/clouds/1.png',
        belowCeiling: 500,
        aboveCeiling: 1500,
        maxRadius: 1E5,
        minScale: 10,
        maxScale: 15,
        opacity: 0.9,
    }, {
        billboard: 'http://localhost:3030/proxy/images/weather/clouds/5.png',
        belowCeiling: 500,
        aboveCeiling: 1E3,
        maxRadius: 1E5,
        minScale: 6,
        maxScale: 10,
        opacity: 0.9,
    }, {
        billboard: 'http://localhost:3030/proxy/images/weather/clouds/cumuloniumbus.png',
        belowCeiling: 500,
        aboveCeiling: 100,
        maxRadius: 1E5,
        minScale: 6,
        maxScale: 10,
        opacity: 0.9,
    }, {
        model: 'http://localhost:3030/proxy/models/clouds/flat1.gltf',
        belowCeiling: 2E3,
        aboveCeiling: 9E3,
        minScale: 4E4,
        maxScale: 45E3,
        maxRadius: 3E5,
        rotationMultiplier: 360,
        opacity: 1,
    }, {
        model: 'http://localhost:3030/proxy/models/clouds/flat2.gltf',
        belowCeiling: 2E3,
        aboveCeiling: 9E3,
        minScale: 4E4,
        maxScale: 45E3,
        maxRadius: 3E5,
        rotationMultiplier: 360,
        opacity: 1,
    }],
    billboardOptions: {
        sizeInMeters: !0,
        collection: 'default',
        geofsFixCameraRotation: !0,
    },
    modelOptions: {},
    create(a) {
        if (!a) {
            a = Math.random() * TWO_PI;
            var b = Math.sqrt(Math.random()) * (this._type.maxRadius - this._type.minRadius) + this._type.minRadius;
            a = V3.add(geofs.aircraft.instance.llaLocation, xy2ll([Math.cos(a) * b, Math.sin(a) * b], geofs.aircraft.instance.llaLocation));
            a[2] = Math.random() * (this._type.aboveCeiling - this._type.belowCeiling) + (weather.definition.ceiling + this._type.belowCeiling);
        }
        this._location = a;
        this._type.billboard ? (b = $.extend({}, this.billboardOptions),
            b.scale = clamp(Math.random() * (this._type.maxScale - this._type.minScale) + this._type.minScale, this._type.minScale, this._type.maxScale),
            b.translucencyByDistance = new Cesium.NearFarScalar(this._type.maxRadius / 2, this._type.opacity, this._type.maxRadius, 0.3),
            b.opacity = this._type.billboardOpacity,
            this._entity = new geofs.api.billboard(a, this._type.billboard, b)) : this._type.model && (b = $.extend({}, this.modelOptions),
            b.scale = clamp(Math.random() * (this._type.maxScale - this._type.minScale) + this._type.minScale, this._type.minScale, this._type.maxScale),
            b.rotation = [Math.random() * this._type.rotationMultiplier, 0, 0],
            b.location = a,
            this._entity = new geofs.api.Model(this._type.model, b));
        this.update();
    },
    setColor(a) {
        this._entity.setColor(a);
    },
    move(a) {
        this._location = V3.add(this._location, a);
        this._entity.setLocation(this._location);
    },
    setLocation(a) {
        this._location = a;
        this._entity.setLocation(a);
    },
    update() {
        let a = this,
            b = ll2xy(V3.sub(this._location, geofs.aircraft.instance.llaLocation), geofs.aircraft.instance.llaLocation);
        b[2] = 0;
        if (V2.length(b) > this._type.maxRadius) {
            if (fx.cloudManager.instance.numberOfClouds <= fx.cloudManager.instance.maxNumberOfClouds) {
                b = V3.scale(V3.normalize(b), 0.9 * this._type.maxRadius),
                    b = V3.add(geofs.aircraft.instance.llaLocation, xyz2lla([-b[0], -b[1], b[2]], geofs.aircraft.instance.llaLocation)),
                    b[2] = this._location[2],
                    this.setLocation(b);
            } else {
                this.destroy();
                return;
            }
        }
        clearTimeout(this._updateTimeout);
        this._updateTimeout = setTimeout(() => {
            a.update();
        }, 2E4 + 2E4 * Math.random());
    },
    destroy() {
        clearTimeout(this._updateTimeout);
        delete fx.cloudManager.instance.clouds[this._id];
        fx.cloudManager.instance.numberOfClouds--;
        this._entity && this._entity.destroy();
    },
};
fx.CloudCover = function(a) {
    this.create(a);
};
fx.CloudCover.prototype = {
    texture: 'models/clouds/cover.jpg',
    size: 1,
    options: {
        url: 'models/clouds/cover.gltf',
        scale: 4E5,
    },
    create(a) {
        if (!this.entity) {
            const b = $.extend({}, this.options);
            b.location = a;
            this.entity = new geofs.api.Model(null, b);
            this.update();
        }
    },
    setColor(a) {
        this.entity.setColor(a);
        fx.volumetricFog.setColor(a);
    },
    setLocation(a) {
        this.entity.setLocation(a);
    },
    update() {
        const a = this;
        this.setLocation([camera.lla[0], camera.lla[1], weather.definition.ceiling]);
        clearTimeout(this._updateTimeout);
        this._updateTimeout = setTimeout(() => {
            a.update();
        }, 2E4);
    },
    destroy() {
        clearTimeout(this._updateTimeout);
        this.entity && (this.entity.destroy(),
            fx.volumetricFog.destroy());
        this.entity = null;
    },
};
fx.precipitation = {
    types: {
        snow: {
            speed: 0.001,
            model: 'models/precipitations/snow.gltf',
        },
        rain: {
            speed: 0.1,
            model: 'models/precipitations/rain.gltf?bla=1',
        },
    },
    visible: !0,
    init() {},
    create(a, b) {
        a != fx.precipitation.type && (fx.precipitation.apiModel && fx.precipitation.destroy(),
            fx.precipitation.type = a,
            fx.precipitation.amount = b,
            fx.precipitation.apiModel = new geofs.api.Model(fx.precipitation.types[a].model),
            fx.precipitation.motionOffset = 0);
    },
    update(a, b) {
        if (fx.precipitation.apiModel && this.visible) {
            !fx.precipitation._material && fx.precipitation.apiModel._model && fx.precipitation.apiModel._model.ready && (fx.precipitation._material = fx.precipitation.apiModel._model.getMaterial('rainMaterial'));
            if (camera.currentModeName == 'chase' || camera.currentModeName == 'free') {
                var c = weather.currentWindSpeedMs;
                a = weather.currentWindDirection + 180;
                var d = 90;
            } else {
                c = geofs.aircraft.instance.trueAirSpeed,
                    a = Math.atan2(geofs.aircraft.instance.veldir[0], geofs.aircraft.instance.veldir[1]) * RAD_TO_DEGREES,
                    d = Math.acos(geofs.aircraft.instance.veldir[2]) * RAD_TO_DEGREES;
            }
            a = [a, 2 * c, 0];
            a[1] = clamp(a[1], 0, d);
            c = [2, 2, clamp(2 + 0.5 * c, 2, 50)];
            fx.precipitation.apiModel.setPositionOrientationAndScale(camera.lla, a, c);
            fx.precipitation._material && !geofs.pause && (fx.precipitation.motionOffset -= Math.min(0.9, 0.01 + b * geofs.aircraft.instance.trueAirSpeed * fx.precipitation.types[fx.precipitation.type].speed),
                fx.precipitation.motionOffset < 0 && (fx.precipitation.motionOffset += 1),
                fx.precipitation._material.setValue('motion', fx.precipitation.motionOffset));
        }
    },
    show() {
        fx.precipitation.apiModel && (geofs.api.setModelVisibility(fx.precipitation.apiModel._model, !0),
            this.visible = !0);
    },
    hide() {
        fx.precipitation.apiModel && (geofs.api.setModelVisibility(fx.precipitation.apiModel._model, !1),
            this.visible = !1);
    },
    destroy() {
        fx.precipitation.apiModel && (fx.precipitation.type = 'none',
            fx.precipitation._material = null,
            fx.precipitation.apiModel.destroy(),
            fx.precipitation.apiModel = null);
    },
};
fx.retro = function(a) {
    function b() {
        geofs.aircraft.instance.parts.root.object3d._model && (geofs.aircraft.instance.parts.root.object3d._model.color = c,
            geofs.aircraft.instance.parts.root.object3d._model.colorBlendAmount = 1,
            geofs.aircraft.instance.parts.root.object3d._model.colorBlendMode = 2,
            geofs.aircraft.instance.parts.root.object3d._model.shadows = 2,
            geofs.aircraft.instance.parts.root.object3d._model.debugWireframe = !0);
    }
    weather.set = function() {};
    geofs.retroOn = !0;
    var c = Cesium.Color.fromCssColorString('#2caecf');
    a = new Cesium.Material({
        fabric: {
            type: 'SlopeColorContour',
            materials: {
                contourMaterial: {
                    type: 'ElevationContour',
                },
                colorMaterial: {
                    type: 'Color',
                },
            },
            components: {
                diffuse: 'contourMaterial.alpha == 0.0 ? colorMaterial.diffuse : contourMaterial.diffuse',
                alpha: '1.0',
            },
        },
        translucent: !1,
    });
    a.materials.contourMaterial.uniforms.width = 1;
    a.materials.contourMaterial.uniforms.spacing = 30;
    a.materials.contourMaterial.uniforms.color = c;
    a.materials.colorMaterial.uniforms.color = Cesium.Color.fromCssColorString('#0a243b');
    geofs.api.viewer.scene.globe.material = a;
    const d = geofs.api.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(0, 0, 1E6),
        billboard: {
            image: 'images/retro/sun.png',
            show: !0,
            pixelOffset: new Cesium.Cartesian2(0, 0),
            eyeOffset: new Cesium.Cartesian3(0, 0, 0),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            width: 256,
            height: 256,
        },
    });
    geofs.api.addFrameCallback(() => {
        d.position = new Cesium.Cartesian3.fromDegrees(geofs.aircraft.instance.llaLocation[1] - 10, geofs.aircraft.instance.llaLocation[0], 1E4);
    });
    geofs.api.viewer.scene.skyAtmosphere.hueShift = 0.3;
    geofs.api.viewer.scene.skyAtmosphere.brightnessShift = -0.2;
    geofs.api.viewer.scene.skyAtmosphere.saturationShift = 0.2;
    geofs.api.viewer.scene.skyBox.show = !1;
    geofs.api.viewer.scene.sun.destroy();
    geofs.api.viewer.scene.fog.density = 8E-5;
    geofs.runways.redraw();
    b();
    $(document).on('flyto', () => {
        b();
    });
};
fx = fx || {};
fx.texture2url = {
    smoke: `${PAGE_PATH}images/particles/smoke-light.png`,
    whitesmoke: `${PAGE_PATH}images/particles/smoke-white.png`,
    darkSmoke: `${PAGE_PATH}images/particles/smoke-dark.png`,
    1: `${PAGE_PATH}images/lights/yellowflare.png`,
    2: `${PAGE_PATH}images/lights/redflare.png`,
    3: `${PAGE_PATH}images/lights/greenflare.png`,
    white: `${PAGE_PATH}images/lights/whitelight.png`,
    red: `${PAGE_PATH}images/lights/redlight.png`,
    green: `${PAGE_PATH}images/lights/greenlight.png`,
    whitepapi: `${PAGE_PATH}images/lights/whitepapi.png`,
    redpapi: `${PAGE_PATH}images/lights/redpapi.png`,
};
fx.particles = {};
fx.particleEmitters = {};
fx.init = function() {
    fx.lightBillboardOptions = {
        altitudeMode: geofs.api.ALTITUDE_RELATIVE,
        sizeInMeters: !1,
        scaleByDistance: new Cesium.NearFarScalar(1, 1, 4E3, 0.15),
    };
    fx.papiBillboardOptions = {
        altitudeMode: geofs.api.ALTITUDE_RELATIVE,
        sizeInMeters: !1,
        scaleByDistance: new Cesium.NearFarScalar(1, 0.15, 4E3, 0.05),
    };
};
fx.update = function(a) {
    for (var b in fx.particleEmitters) { fx.particleEmitters[b].update(a); }
    for (b in fx.particles) { fx.particles[b].update(a); }
};
fx.ParticleEmitter = function(a) {
    this._birth = geofs.utils.fastNow();
    this._id = this._birth + Math.random();
    this._lastEmission = this._birth;
    this._options = a;
    fx.particleEmitters[this._id] = this;
    this._options.anchor && (this._options.location = Object3D.utilities.getPointLla(this._options.anchor, geofs.aircraft.instance.llaLocation));
};
fx.ParticleEmitter.prototype = {
    update() {
        const a = geofs.utils.fastNow();
        if (a - this._birth > this._options.duration) { this.destroy(); } else {
            const b = (a - this._lastEmission) * this._options.rate;
            if (this._options.anchor) {
                var c = Object3D.utilities.getPointLla(this._options.anchor, geofs.aircraft.instance.llaLocation),
                    d = V3.scale(V3.sub(c, this._options.location), 1 / b);
            }
            for (let e = 0; e < b - 1; e++) {
                this._options.anchor && (this._options.location = V3.add(this._options.location, d)),
                    new fx.Particle(this._options),
                    this._lastEmission = a;
            }
            this._options.anchor && (this._options.location = c);
        }
    },
    destroy() {
        delete fx.particleEmitters[this._id];
    },
};
fx.Particle = function(a) {
    a = $.extend({}, a);
    this._birth = geofs.utils.fastNow();
    this._id = this._birth + Math.random();
    fx.particles[this._id] = this;
    a.url = a.url || fx.texture2url[a.texture];
    a.startOpacity = a.startOpacity || 1;
    a.endOpacity = a.endOpacity || 1;
    a.startScale = a.startScale || 1;
    a.endScale = a.endScale || 1;
    a.startRotation == 'random' && (a.startRotation = Math.random() * TWO_PI);
    a.endRotation == 'random' && (a.endRotation = Math.random() * TWO_PI);
    a.startRotation = a.startRotation || 0;
    a.endRotation = a.endRotation || a.startRotation;
    this.currentLocation = V3.dup(a.location);
    a.dtOpacity = (a.endOpacity - a.startOpacity) / a.life;
    a.dtScale = (a.endScale - a.startScale) / a.life;
    a.dtRotation = (a.endRotation - a.startRotation) / a.life;
    this._options = a;
    this.create();
};
fx.Particle.prototype = {
    create() {
        this._currentScale = this._options.startScale;
        this._currentOpacity = this._options.startOpacity;
        this._currentRotation = this._options.startRotation;
        let a = {
            opacity: this._currentOpacity,
            scale: this._currentScale,
            rotation: this._currentRotation,
        };
        a = $.extend(a, fx.particleBillboardOptions);
        this._billboard = new geofs.api.billboard(this.currentLocation, this._options.url, a);
    },
    update(a) {
        const b = geofs.utils.fastNow() - this._birth;
        b > this._options.life ? this.destroy() : (this._options.dtOpacity && (this._currentOpacity = this._options.startOpacity + this._options.dtOpacity * b,
                this._currentOpacity >= 0 && this._currentOpacity <= 1 && this._billboard.setOpacity(this._currentOpacity)),
            this._options.dtScale && (this._currentScale = this._options.startScale + this._options.dtScale * b,
                this._billboard.setScale(this._currentScale)),
            this._options.dtRotation && (this._currentRotation = this._options.startRotation + this._options.dtRotation * b,
                this._billboard.setRotation(this._currentRotation)),
            this._options.velocity && this._options.direction && (this._options.velocityDamper && (this._options.velocity = this._options.velocity * this._options.velocityDamper * a),
                this.currentLocation = V3.add(this.currentLocation, V3.scale(this._options.direction, this._options.velocity)),
                this._billboard.setLocation(this.currentLocation)));
    },
    destroy() {
        this._billboard && this._billboard.destroy();
        this._billboard = null;
        delete fx.particles[this._id];
    },
};

function clamp(a, b, c) {
    return void 0 == b || void 0 == c ? a : a < b ? b : a > c ? c : a
}

function ll2xy(a, b) {
    var c = [];
    c[1] = a[0] / METERS_TO_LOCAL_LAT;
    c[0] = a[1] / (1 / (Math.cos((b[0] + a[0]) * DEGREES_TO_RAD) * MERIDIONAL_RADIUS * DEGREES_TO_RAD));
    return c
}

function xy2ll(a, b) {
    var c = [];
    c[0] = a[1] * METERS_TO_LOCAL_LAT;
    c[1] = a[0] / (Math.cos((b[0] + c[0]) * DEGREES_TO_RAD) * MERIDIONAL_RADIUS * DEGREES_TO_RAD);
    return c
}
export default fx;