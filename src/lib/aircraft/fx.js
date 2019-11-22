//粒子效果
import weather from '../modules/weather'
import camera from "../modules/camera"
import Object3D from "../modules/Object3D"
import {
    V3,
    V2,
    M33,
    PAGE_PATH,
    RAD_TO_DEGREES,
    DEGREES_TO_RAD,
    TWO_PI,
    ll2xy,
    xy2ll,
    clamp,
    xyz2lla,
    lla2xyz
} from '../utils/utils'
//papi 精密航道指示器
function fxGeofs(geofs) {
    geofs.fx = geofs.fx || {};
    geofs.fx.texture2url = {
        smoke: PAGE_PATH + "images/particles/smoke-light.png",
        whitesmoke: PAGE_PATH + "images/particles/smoke-white.png",
        darkSmoke: PAGE_PATH + "images/particles/smoke-dark.png",
        1: PAGE_PATH + "images/lights/yellowflare.png",
        2: PAGE_PATH + "images/lights/redflare.png",
        3: PAGE_PATH + "images/lights/greenflare.png",
        white: PAGE_PATH + "images/lights/whitelight.png",
        red: PAGE_PATH + "images/lights/redlight.png",
        green: PAGE_PATH + "images/lights/greenlight.png",
        whitepapi: PAGE_PATH + "images/lights/whitepapi.png",
        redpapi: PAGE_PATH + "images/lights/redpapi.png"
    };
    geofs.fx.particles = {};
    geofs.fx.particleEmitters = {};
    geofs.fx.init = function() {
        geofs.fx.lightBillboardOptions = {
            altitudeMode: geofs.api.ALTITUDE_RELATIVE,
            sizeInMeters: !1,
            scaleByDistance: new Cesium.NearFarScalar(1, 1, 4E3, .15)
        };
        geofs.fx.papiBillboardOptions = {
            altitudeMode: geofs.api.ALTITUDE_RELATIVE,
            sizeInMeters: !1,
            scaleByDistance: new Cesium.NearFarScalar(1, .15, 4E3, .05)
        }
    };
    geofs.fx.update = function(a) {
        for (var b in geofs.fx.particleEmitters)
            geofs.fx.particleEmitters[b].update(a);
        for (b in geofs.fx.particles)
            geofs.fx.particles[b].update(a)
    };
    geofs.fx.ParticleEmitter = function(a) {
        this._birth = geofs.utils.fastNow();
        this._id = this._birth + Math.random();
        this._lastEmission = this._birth;
        this._options = a;
        geofs.fx.particleEmitters[this._id] = this;
        this._options.anchor && (this._options.location = Object3D.utilities.getPointLla(this._options.anchor, geofs.aircraft.instance.llaLocation))
    };
    geofs.fx.ParticleEmitter.prototype = {
        update: function() {
            var a = geofs.utils.fastNow();
            if (a - this._birth > this._options.duration)
                this.destroy();
            else {
                var b = (a - this._lastEmission) * this._options.rate;
                if (this._options.anchor)
                    var c = Object3D.utilities.getPointLla(this._options.anchor, geofs.aircraft.instance.llaLocation),
                        d = V3.scale(V3.sub(c, this._options.location), 1 / b);
                for (var e = 0; e < b - 1; e++)
                    this._options.anchor && (this._options.location = V3.add(this._options.location, d)),
                    new geofs.fx.Particle(this._options),
                    this._lastEmission = a;
                this._options.anchor && (this._options.location = c)
            }
        },
        destroy: function() {
            delete geofs.fx.particleEmitters[this._id]
        }
    };
    geofs.fx.Particle = function(a) {
        a = $.extend({}, a);
        this._birth = geofs.utils.fastNow();
        this._id = this._birth + Math.random();
        geofs.fx.particles[this._id] = this;
        a.url = a.url || geofs.fx.texture2url[a.texture];
        a.startOpacity = a.startOpacity || 1;
        a.endOpacity = a.endOpacity || 1;
        a.startScale = a.startScale || 1;
        a.endScale = a.endScale || 1;
        "random" == a.startRotation && (a.startRotation = Math.random() * TWO_PI);
        "random" == a.endRotation && (a.endRotation = Math.random() * TWO_PI);
        a.startRotation = a.startRotation || 0;
        a.endRotation = a.endRotation || a.startRotation;
        this.currentLocation = V3.dup(a.location);
        a.dtOpacity = (a.endOpacity - a.startOpacity) / a.life;
        a.dtScale = (a.endScale - a.startScale) / a.life;
        a.dtRotation = (a.endRotation - a.startRotation) / a.life;
        this._options = a;
        this.create()
    };
    geofs.fx.Particle.prototype = {
        create: function() {
            this._currentScale = this._options.startScale;
            this._currentOpacity = this._options.startOpacity;
            this._currentRotation = this._options.startRotation;
            var a = {
                opacity: this._currentOpacity,
                scale: this._currentScale,
                rotation: this._currentRotation,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            };
            a = $.extend(a, geofs.fx.particleBillboardOptions);
            this._billboard = new geofs.api.billboard(this.currentLocation, this._options.url, a)
        },
        update: function(a) {
            var b = geofs.utils.fastNow() - this._birth;
            b > this._options.life ? this.destroy() : (this._options.dtOpacity && (this._currentOpacity = this._options.startOpacity + this._options.dtOpacity * b,
                    0 <= this._currentOpacity && 1 >= this._currentOpacity && this._billboard.setOpacity(this._currentOpacity)),
                this._options.dtScale && (this._currentScale = this._options.startScale + this._options.dtScale * b,
                    this._billboard.setScale(this._currentScale)),
                this._options.dtRotation && (this._currentRotation = this._options.startRotation + this._options.dtRotation * b,
                    this._billboard.setRotation(this._currentRotation)),
                this._options.velocity && this._options.direction && (this._options.velocityDamper && (this._options.velocity = this._options.velocity * this._options.velocityDamper * a),
                    this.currentLocation = V3.add(this.currentLocation, V3.scale(this._options.direction, this._options.velocity)),
                    this._billboard.setLocation(this.currentLocation)))
        },
        destroy: function() {
            this._billboard && this._billboard.destroy();
            this._billboard = null;
            delete geofs.fx.particles[this._id]
        }
    };
    geofs.fx.lastRunwayTestLocation = [0, 0];
    geofs.runways.nearRunways = {};
    geofs.fx.litRunways = {};
    geofs.fx.particleBillboardOptions = {
        sizeInMeters: !0
    };
    geofs.fx.thresholdLightTemplate = [
        [
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], "length"
        ],
        [
            [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1], 12
        ],
        [
            [3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3], 1
        ],
        [
            [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0], 5
        ],
        [
            [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0], 1
        ],
        [
            [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0], 5
        ],
        [
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1], 1
        ],
        [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 5
        ]
    ];
    geofs.fx.templateCenter = [17, 2];
    $("body").on("runwayUpdate", function() {
        geofs.runwaysLights.updateAll()
    });
    $("body").on("nightChange", function() {
        geofs.runwaysLights.updateAll()
    });
    geofs.runwaysLights = function(a) {
        this.runway = a;
        this.on = !1;
        this.lights = [];
        this.papis = [];
        this.localStepXm = a.widthMeters / 33;
        this.localStepYm = 50;
        var b = M33.identity();
        b = M33.rotationZ(b, a.headingRad);
        this.stepX = xy2ll(V2.scale(b[0], this.localStepXm), a.threshold1);
        this.stepY = xy2ll(V2.scale(b[1], this.localStepYm), a.threshold1);
        var c = xy2ll(V2.scale(b[0], 9), a.threshold1),
            d = V2.add(a.threshold1, xy2ll(V2.scale(b[0], a.widthMeters / 2 + 15), a.threshold1));
        d = V2.add(d, V2.scale(this.stepY, 5));
        this.addPapi(d, c);
        c = xy2ll(V2.scale(b[0], -9), a.threshold2);
        d = V2.add(a.threshold2, xy2ll(V2.scale(b[0], -a.widthMeters / 2 - 15), a.threshold2));
        d = V2.add(d, V2.scale(this.stepY, -5));
        this.addPapi(d, c)
    };
    geofs.runwaysLights.turnAllOff = function() {
        for (var a in geofs.fx.litRunways)
            geofs.fx.litRunways[a].turnOff()
    };
    geofs.runwaysLights.turnAllOn = function() {
        for (var a in geofs.fx.litRunways)
            geofs.fx.litRunways[a].turnOn()
    };
    geofs.runwaysLights.updateAll = function() {
        for (var a in geofs.runways.nearRunways) {
            var b = geofs.runways.nearRunways[a];
            geofs.fx.litRunways[b.id] || (geofs.fx.litRunways[b.id] = new geofs.runwaysLights(b))
        }
        for (a in geofs.fx.litRunways)
            geofs.runways.nearRunways[a] || (geofs.fx.litRunways[a].destroy(),
                geofs.fx.litRunways[a] = null,
                delete geofs.fx.litRunways[a]);
        geofs.isNight ? geofs.runwaysLights.turnAllOn() : geofs.runwaysLights.turnAllOff()
    };
    geofs.runwaysLights.prototype = {
        turnOn: function() {
            if (!this.on) {
                var a = geofs.fx.templateCenter[1] - 1,
                    b = geofs.fx.thresholdLightTemplate[a],
                    c = b[1];
                b = -c;
                for (var d = a, e = geofs.fx.thresholdLightTemplate.length; d < e; d++) {
                    var f = geofs.fx.thresholdLightTemplate[d];
                    a = f[0];
                    var g = b;
                    for (f = b + f[1]; g < f; g++)
                        this.addRow(this.runway.threshold1, a, -g),
                        b++
                }
                d = V2.add(this.runway.threshold1, V2.scale(this.stepY, c));
                c = (this.runway.lengthMeters - this.localStepYm * c) / this.localStepYm;
                a = geofs.fx.thresholdLightTemplate[0][0];
                for (b = 0; b < c; b++)
                    this.addRow(d, a, b);
                a = geofs.fx.templateCenter[1] - 1;
                b = geofs.fx.thresholdLightTemplate[a];
                c = b[1];
                b = -c;
                d = a;
                for (e = geofs.fx.thresholdLightTemplate.length; d < e; d++)
                    for (f = geofs.fx.thresholdLightTemplate[d],
                        a = f[0],
                        g = b,
                        f = b + f[1]; g < f; g++)
                        this.addRow(this.runway.threshold2, a, g),
                        b++;
                this.on = !0
            }
        },
        turnOff: function() {
            if (this.on) {
                for (var a = 0; a < this.lights.length; a++)
                    this.lights[a].destroy(),
                    this.lights[a] = null;
                this.lights = [];
                this.on = !1
            }
        },
        addRow: function(a, b, c) {
            a = V2.add(a, V2.scale(this.stepY, c));
            c = 0;
            for (var d = b.length; c < d; c++) {
                var e = b[c];
                if (e) {
                    var f = V2.add(a, V3.scale(this.stepX, c - geofs.fx.templateCenter[0]));
                    this.addLight(f, e)
                }
            }
        },
        addPapi: function(a, b) {
            this.papis = this.papis || [];
            a[2] = .5;
            this.papis.push(new geofs.fx.papi(a, b))
        },
        addLight: function(a, b) {
            a[2] = .2;
            this.lights.push(new geofs.fx.light(a, b, geofs.fx.lightBillboardOptions))
        },
        destroy: function() {
            if (this.lights) {
                for (var a = 0; a < this.lights.length; a++)
                    this.lights[a].destroy();
                this.lights = null
            }
            if (this.papis) {
                for (a = 0; a < this.papis.length; a++)
                    this.papis[a].destroy();
                this.papis = null
            }
            this.runway = null
        }
    };
    geofs.fx.papi = function(a, b) {
        var c = this;
        this.lights = [];
        for (var d = 0; 4 > d; d++)
            a[2] = .5,
            this.lights[d] = {
                white: new geofs.fx.light(a, "whitepapi", geofs.fx.papiBillboardOptions),
                red: new geofs.fx.light(a, "redpapi", geofs.fx.papiBillboardOptions)
            },
            a = V2.add(a, b);
        this.location = a;
        geofs.api.viewer.terrainProvider.readyPromise.then(function() {
            var b = Cesium.sampleTerrainMostDetailed(geofs.api.viewer.terrainProvider, [Cesium.Cartographic.fromDegrees(a[1], a[0])]);
            Cesium.when(b, function(a) {
                c.location[2] = a[0].height
            })
        });
        this.refresh()
    };
    geofs.fx.papi.prototype = {
        refresh: function() {
            var a = this;
            clearInterval(this.papiInterval);
            this.papiInterval = setInterval(function() {
                var b = geofs.utils.llaDistanceInMeters([geofs.aircraft.instance.llaLocation[0], geofs.aircraft.instance.llaLocation[1], a.location[2]], a.location, a.location),
                    c = Math.atan2(geofs.aircraft.instance.llaLocation[2] - a.location[2], b) * RAD_TO_DEGREES;
                b = 2 > c;
                var d = 2.5 > c,
                    e = 3.5 > c;
                c = 4 > c;
                a.lights[3].white.setVisibility(!b);
                a.lights[3].red.setVisibility(b);
                a.lights[2].white.setVisibility(!d);
                a.lights[2].red.setVisibility(d);
                a.lights[1].white.setVisibility(!e);
                a.lights[1].red.setVisibility(e);
                a.lights[0].white.setVisibility(!c);
                a.lights[0].red.setVisibility(c)
            }, 1E3)
        },
        destroy: function() {
            clearInterval(this.papiInterval);
            for (var a = 0; 4 > a; a++)
                this.lights[a].red.destroy(),
                this.lights[a].white.destroy();
            this.lights = this.location = null
        }
    };
    geofs.fx.light = function(a, b, c) {
        a = a || [0, 0, 0];
        this._billboard = new geofs.api.billboard(a, geofs.fx.texture2url[b], c)
    };
    geofs.fx.light.prototype = {
        setVisibility: function(a) {
            this._billboard.setVisibility(a);
            return !0
        },
        setLocation: function(a) {
            this._billboard.setLocation(a)
        },
        destroy: function() {
            this._billboard.destroy();
            this._billboard = null
        }
    };
    geofs.fx.dayNightManager = {
        illumination: 1,
        saturation: {
            valueRamp: [.12, .12, .12, .12, 1, 1, 1]
        },
        brightness: {
            valueRamp: [4, 4, 4, 2, 1, 1, 1]
        },
        gamma: {
            valueRamp: [.18, .18, .18, .18, 1, 1, 1]
        },
        brightnessShift: {
            valueRamp: [-.6, -.6, -.6, 0, 0]
        },
        groundBrightnessShift: {
            valueRamp: [-1.5, -1.5, -1.5, 0, 0]
        },
        groundAtmoSaturationShift: {
            valueRamp: [-.6, -.6, 0, 0, 0]
        },
        groundHueShift: {
            valueRamp: [0, 0, 0, 0, 0]
        },
        cloudsBrightness: {
            valueRamp: [0, 0, 0, .5, 1, 1]
        },
        fogBrightness: {
            valueRamp: [.1, .1, .1, .5, 1, 1]
        },
        blackMarbleVisibility: {
            valueRamp: [1, 1, 1, 0, 0]
        },
        blackMarbleAlpha: {
            valueRamp: [.1, .1, .1, 0, 0]
        },
        init: function() {
            // geofs.api.viewer.scene.moon.show = .55 < weather.timeRatio ? !0 : !1
        },
        update: function(a, b) {
            a = clamp(1 - weather.timeRatio + Math.sin(a[0] * DEGREES_TO_RAD) * weather.seasonRatio * .2, 0, 1);
            if (this.illumination != a) {
                geofs.api.blackMarble && (geofs.api.blackMarble.show = .3 < geofs.animation.filter(this.blackMarbleVisibility, a),
                    geofs.api.blackMarble.alpha = geofs.animation.filter(this.blackMarbleAlpha, a));
                geofs.api.setImageryColorModifier("time", {
                    brightness: geofs.animation.filter(this.brightness, a),
                    saturation: geofs.animation.filter(this.saturation, a),
                    gamma: geofs.animation.filter(this.gamma, a)
                });
                geofs.api.setAtmosphereColorModifier("time", {
                    groundBrightnessShift: geofs.animation.filter(this.groundBrightnessShift, a),
                    fogBrightness: geofs.animation.filter(this.fogBrightness, a),
                    groundHueShift: geofs.animation.filter(this.groundHueShift, a),
                    cloudsBrightness: geofs.animation.filter(this.cloudsBrightness, a),
                    brightnessShift: geofs.animation.filter(this.brightnessShift, a)
                });
                b = parseInt(geofs.animation.filter(geofs.fx.cloudManager.redAnimation, weather.timeRatio));
                var c = parseInt(geofs.animation.filter(geofs.fx.cloudManager.greenAnimation, weather.timeRatio)),
                    d = parseInt(geofs.animation.filter(geofs.fx.cloudManager.blueAnimation, weather.timeRatio));
                geofs.fx.cloudManager.setCloudColors(b, c, d);
                this.illumination = a
            }
        }
    };
    geofs.fx.fog = {
        baseColor: new Cesium.Color(1, 1, 1, 1),
        brightness: 1,
        create: function() {
            geofs.fx.fog.ppStage || (geofs.fx.fog.ppStage = new Cesium.PostProcessStage({
                    fragmentShader: "uniform sampler2D colorTexture; \nuniform sampler2D depthTexture; \nuniform vec4 fogColor; \nuniform float fogDensity; \nvarying vec2 v_textureCoordinates; \nvoid main(void) \n{ \n    vec4 color = texture2D(colorTexture, v_textureCoordinates); \n    vec4 depth = texture2D(depthTexture, v_textureCoordinates); \n    gl_FragColor = mix(color, fogColor, clamp(depth.r * fogDensity, 0.0, 1.0)); \n} \n",
                    uniforms: {
                        fogColor: this.adjustedColor,
                        fogDensity: this.density || 1
                    }
                }),
                geofs.api.viewer.scene.postProcessStages.add(geofs.fx.fog.ppStage))
        },
        setBrightness: function(a) {
            this.brightness = a || this.brightness;
            geofs.fx.fog.ppStage && (geofs.fx.fog.ppStage.uniforms.fogColor = new Cesium.Color(this.baseColor.red * this.brightness, this.baseColor.green * this.brightness, this.baseColor.blue * this.brightness, 1))
        },
        setColor: function(a, b, c) {
            this.baseColor.red = a / 255 || this.baseColor.red;
            this.baseColor.green = b / 255 || this.baseColor.green;
            this.baseColor.blue = c / 255 || this.baseColor.blue;
            geofs.fx.fog.ppStage && (geofs.fx.fog.ppStage.uniforms.fogColor = new Cesium.Color(this.baseColor.red * this.brightness, this.baseColor.green * this.brightness, this.baseColor.blue * this.brightness, 1))
        },
        setDensity: function(a) {
            this.density = a || this.density || 0;
            geofs.fx.fog.ppStage && (geofs.fx.fog.ppStage.uniforms.fogDensity = a)
        },
        destroy: function() {
            geofs.fx.fog.ppStage && (geofs.api.viewer.scene.postProcessStages.remove(geofs.fx.fog.ppStage),
                geofs.fx.fog.ppStage = null)
        }
    };
    geofs.fx.volumetricFog = {
        defaultRamp: {
            color: new Cesium.Color(1, 1, 1),
            opacity: 1,
            cutoff: .95
        },
        getCanvas: function() {
            this.canvases || (this.canvases = {},
                this.canvases.a = document.createElement("canvas"),
                this.canvases.a.width = 100,
                this.canvases.a.height = 1,
                this.canvases.b = document.createElement("canvas"),
                this.canvases.b.width = 100,
                this.canvases.b.height = 1);
            if (this.canvases.a.used)
                return this.canvases.a.used = !1,
                    this.canvases.b;
            this.canvases.a.used = !0;
            return this.canvases.a
        },
        getColorRamp: function(a) {
            this.ramp = Object.assign({}, this.defaultRamp, this.ramp, a);
            a = this.getCanvas();
            var b = a.getContext("2d");
            b.clearRect(0, 0, a.width, a.height);
            var c = b.createLinearGradient(0, 0, 100, 0);
            c.addColorStop(0, this.ramp.color.withAlpha(this.ramp.opacity).toCssColorString());
            c.addColorStop(this.ramp.cutoff, this.ramp.color.withAlpha(this.ramp.opacity).toCssColorString());
            c.addColorStop(1, this.ramp.color.withAlpha(0).toCssColorString());
            b.fillStyle = c;
            b.fillRect(0, 0, 100, 1);
            return a
        },
        create: function(a, b, c) {
            this.ceiling = b || this.ceiling || weather.definition.ceiling;
            this.material || (this.material = Cesium.Material.fromType("ElevationRamp"));
            this.material.uniforms.image = this.getColorRamp(c);
            this.material.uniforms.minimumHeight = a || 0;
            b < a && (b = a);
            this.material.uniforms.maximumHeight = b;
            geofs.api.viewer.scene.globe.material = this.material
        },
        setColor: function(a) {
            this.ramp = Object.assign({}, this.defaultRamp, this.ramp);
            this.ramp.color = a;
            this.material && (this.material.uniforms.image = this.getColorRamp(this.ramp));
            geofs.api.viewer.scene.globe.material = this.material
        },
        setCeiling: function(a) {
            geofs.api.viewer.scene.globe.material && (this.material.uniforms.maximumHeight = a)
        },
        destroy: function() {
            this.material = geofs.api.viewer.scene.globe.material = null
        }
    };
    geofs.fx.cloudManager = {
        cloudCoverToCloudNumber: 15,
        clouds: {},
        numberOfClouds: 0,
        currentID: 0,
        maxNumberOfClouds: 0,
        refreshDistance: 1E3,
        currentCenter: [0, 0, 0],
        redAnimation: {
            valueRamp: [255, 255, 250, 100, 100]
        },
        greenAnimation: {
            valueRamp: [255, 255, 230, 100, 100]
        },
        blueAnimation: {
            valueRamp: [255, 255, 200, 100, 100]
        },
        fogBrightnessRamp: [0, 0, 0, 1],
        groundBrightnessRamp: [-.4, -.4, -.4, 0],
        setCloudCoverToCloudNumber: function(a) {
            this.cloudCoverToCloudNumber = a || this.cloudCoverToCloudNumber;
            geofs.fx.cloudManager.instance && this.setCloudCover(geofs.fx.cloudManager.instance.percentCoverage)
        },
        init: function(a) {
            this.cloudSituation = null;
            var b = lla2xyz(V3.sub(this.currentCenter, a), geofs.aircraft.instance.llaLocation);
            V3.length(b) > this.refreshDistance && this.destroyAllClouds();
            if (geofs.fx.cloudManager.instance)
                return geofs.fx.cloudManager.instance.update(a),
                    geofs.fx.cloudManager.instance;
            this.currentCenter = a;
            this.numberOfClouds = 0;
            geofs.fx.cloudManager.instance = this
        },
        spawnClouds: function() {
            var a = this.maxNumberOfClouds - this.numberOfClouds;
            if (0 < a)
                for (var b = 0; b < a; b++)
                    new geofs.fx.Cloud;
            else if (0 > a)
                for (; 0 > a;)
                    this.destroyLastCloud(),
                    a++
        },
        update: function(a, b) {
            if (geofs.fx.cloudManager.instance) {
                geofs.fx.cloudManager.instance.currentCenter = a;
                b = clamp((a[2] - (weather.definition.ceiling - weather.definition.coverHalfThickness)) / weather.definition.cloudCoverThickness, weather.belowCeilingBrightness, 1);
                var c = a[2] < weather.definition.ceiling - weather.definition.coverHalfThickness ? 2 : a[2] < weather.definition.ceiling ? 6 : a[2] < weather.definition.ceiling + weather.definition.coverHalfThickness ? 12 : 8;
                a[2] < weather.definition.fogCeiling && (c += 1);
                this.cloudSituation != c && (0 < weather.definition.fog ? (geofs.fx.volumetricFog.create(weather.definition.fogBottom, weather.definition.fogCeiling, {
                            opacity: weather.definition.backgroundFogDensity,
                            cutoff: 0
                        }),
                        a[2] < weather.definition.fogCeiling && geofs.fx.fog.setDensity(weather.definition.backgroundFogDensity)) : geofs.fx.volumetricFog.destroy(),
                    1 < c && geofs.fx.fog.setDensity(weather.definition.backgroundFogDensity),
                    7 >= c ? this.fullCover ? (geofs.fx.precipitation.show(),
                        this.fullCover.entity.show(),
                        geofs.disableShadows(),
                        geofs.api.hideSun(),
                        geofs.api.setImageryColorModifier("cloudcover", {
                            saturation: clamp(b, .2, 1),
                            brightness: clamp(b, .2, 1)
                        }),
                        geofs.api.setAtmosphereColorModifier("cloudcover", {
                            saturationShift: -2,
                            brightnessShift: b - .9,
                            groundBrightnessShift: b - 1.2,
                            groundSaturationShift: b - 1
                        })) : (geofs.enableShadows(),
                        geofs.api.showSun(),
                        geofs.api.removeImageryColorModifier("cloudcover"),
                        geofs.api.removeAtmosphereColorModifier("cloudcover")) : c & 8 && (this.fullCover && (this.fullCover.entity.show(),
                            geofs.fx.volumetricFog.create(0, weather.definition.ceiling + weather.definition.coverHalfThickness, {
                                opacity: 1,
                                cutoff: .95
                            })),
                        geofs.fx.fog.setDensity(0),
                        geofs.fx.precipitation.hide(),
                        geofs.enableShadows(),
                        geofs.api.showSun(),
                        geofs.api.removeImageryColorModifier("cloudcover"),
                        geofs.api.removeAtmosphereColorModifier("cloudcover")));
                if (c & 4 && this.fullCover) {
                    var d = 0;
                    8 > c && (d = weather.definition.backgroundFogDensity);
                    a = clamp(.1 * (weather.definition.coverHalfThickness - Math.abs(weather.definition.ceiling - a[2])), d, 1);
                    geofs.fx.fog.setDensity(a);
                    .5 < a ? this.fullCover.entity.hide() : this.fullCover.entity.show()
                }
                b != this.lastBrightness && (geofs.api.setAtmosphereColorModifier("clouds", {
                        cloudsBrightness: b,
                        groundBrightnessShift: geofs.animation.getRampRatio(this.groundBrightnessRamp, b),
                        fogBrightness: geofs.animation.getRampRatio(this.fogBrightnessRamp, b)
                    }),
                    this.lastBrightness = b);
                this.cloudSituation = c
            }
        },
        setCloudsBrightness: function(a) {
            geofs.fx.cloudManager.instance && this.setCloudColors(null, null, null, a)
        },
        setCloudColors: function(a, b, c, d) {
            if (geofs.fx.cloudManager.instance) {
                a && b && c ? this.cloudColor = Cesium.Color.fromBytes(a, b, c) : this.cloudColor || (this.cloudColor = Cesium.Color.fromBytes(255, 255, 255));
                this.brightness = d || this.brightness || 1;
                var e = this.cloudColor.darken(1 - this.brightness, new Cesium.Color),
                    f;
                for (f in geofs.fx.cloudManager.instance.clouds)
                    geofs.fx.cloudManager.instance.clouds[f].setColor(e);
                this.fullCover && this.fullCover.setColor(e);
                geofs.fx.fog.setColor(a, b, c);
                geofs.fx.fog.setBrightness(clamp(d, 0, 1));
                geofs.fx.volumetricFog.setColor(e)
            }
        },
        setCloudCover: function(a) {
            geofs.fx.cloudManager.instance && (this.percentCoverage = a || 0,
                a *= .01,
                100 <= this.percentCoverage ? this.fullCover || (this.fullCover = new geofs.fx.CloudCover([camera.lla[0], camera.lla[1], weather.definition.ceiling])) : this.fullCover && (this.fullCover.destroy(),
                    this.fullCover = null),
                geofs.api.setAtmosphereColorModifier("weatherHaze", {
                    groundBrightnessShift: clamp(.5 * a, 0, .1),
                    fogBrightness: clamp(1 + a, 1, 1.2),
                    brightnessShift: clamp(.5 * a, 0, .1)
                }),
                this.setNumberOfClouds(this.percentCoverage * this.cloudCoverToCloudNumber),
                this.cloudSituation = null)
        },
        setNumberOfClouds: function(a) {
            geofs.fx.cloudManager.instance && (this.maxNumberOfClouds = a,
                this.spawnClouds())
        },
        setCeiling: function(a) {
            this.fullCover && this.fullCover.update();
            for (var b in this.clouds)
                this.clouds[b].setCeiling(a)
        },
        destroyLastCloud: function() {
            geofs.fx.cloudManager.instance.currentID--;
            this.clouds[geofs.fx.cloudManager.instance.currentID].destroy()
        },
        destroyAllClouds: function() {
            if (geofs.fx.cloudManager.instance) {
                for (var a in this.clouds)
                    this.clouds[a].destroy();
                this.fullCover && (this.fullCover.destroy(),
                    this.fullCover = null);
                geofs.fx.cloudManager.instance.currentID = 0
            }
        },
        destroy: function() {
            geofs.fx.cloudManager.instance && (this.destroyAllClouds(),
                geofs.fx.cloudManager.instance = null)
        }
    };
    geofs.fx.Cloud = function(a, b) {
        this._id = geofs.fx.cloudManager.instance.currentID++;
        this._type = $.extend({}, this.defaultType, this.types[Math.floor(Math.random() * this.types.length)]);
        geofs.fx.cloudManager.instance.numberOfClouds++;
        geofs.fx.cloudManager.instance.clouds[this._id] = this;
        this.create(a)
    };
    geofs.fx.Cloud.prototype = {
        defaultType: {
            belowCeiling: 0,
            aboveCeiling: 1E3,
            opacity: .8,
            minRadius: 1,
            maxRadius: 1E5,
            rotationMultiplier: 0,
            brightnessDelta: 0
        },
        types: [{
            billboard: PAGE_PATH + "images/weather/clouds/1.png",
            belowCeiling: 500,
            aboveCeiling: 1E3,
            minScale: 6,
            maxScale: 10,
            maxRadius: 5E4,
            opacity: .9
        }, {
            billboard: PAGE_PATH + "images/weather/clouds/6.png",
            belowCeiling: 500,
            aboveCeiling: 1E3,
            minScale: 10,
            maxScale: 15,
            maxRadius: 5E4,
            opacity: .9
        }, {
            billboard: PAGE_PATH + "images/weather/clouds/1.png",
            belowCeiling: 500,
            aboveCeiling: 1500,
            maxRadius: 1E5,
            minScale: 10,
            maxScale: 15,
            opacity: .9
        }, {
            billboard: PAGE_PATH + "images/weather/clouds/5.png",
            belowCeiling: 500,
            aboveCeiling: 1E3,
            maxRadius: 1E5,
            minScale: 6,
            maxScale: 10,
            opacity: .9
        }, {
            billboard: PAGE_PATH + "images/weather/clouds/cumuloniumbus.png",
            belowCeiling: 500,
            aboveCeiling: 100,
            maxRadius: 1E5,
            minScale: 6,
            maxScale: 10,
            opacity: .9
        }, {
            model: PAGE_PATH + "models/clouds/flat1.gltf",
            belowCeiling: 2E3,
            aboveCeiling: 9E3,
            minScale: 4E4,
            maxScale: 45E3,
            maxRadius: 3E5,
            rotationMultiplier: 360,
            opacity: 1
        }, {
            model: PAGE_PATH + "models/clouds/flat2.gltf",
            belowCeiling: 2E3,
            aboveCeiling: 9E3,
            minScale: 4E4,
            maxScale: 45E3,
            maxRadius: 3E5,
            rotationMultiplier: 360,
            opacity: 1
        }],
        billboardOptions: {
            sizeInMeters: !0,
            collection: "default",
            geofsFixCameraRotation: !0
        },
        modelOptions: {},
        create: function(a) {
            if (!a) {
                a = Math.random() * TWO_PI;
                var b = Math.sqrt(Math.random()) * (this._type.maxRadius - this._type.minRadius) + this._type.minRadius;
                a = V3.add(geofs.aircraft.instance.llaLocation, xy2ll([Math.cos(a) * b, Math.sin(a) * b], geofs.aircraft.instance.llaLocation));
                a[2] = Math.random() * (this._type.aboveCeiling - this._type.belowCeiling) + (weather.definition.ceiling + this._type.belowCeiling)
            }
            this._location = a;
            this._type.billboard ? (b = $.extend({}, this.billboardOptions),
                b.scale = clamp(Math.random() * (this._type.maxScale - this._type.minScale) + this._type.minScale, this._type.minScale, this._type.maxScale),
                b.translucencyByDistance = new Cesium.NearFarScalar(this._type.maxRadius / 2, this._type.opacity, this._type.maxRadius, .3),
                b.opacity = this._type.billboardOpacity,
                this._entity = new geofs.api.billboard(a, this._type.billboard, b)) : this._type.model && (b = $.extend({}, this.modelOptions),
                b.scale = clamp(Math.random() * (this._type.maxScale - this._type.minScale) + this._type.minScale, this._type.minScale, this._type.maxScale),
                b.rotation = [Math.random() * this._type.rotationMultiplier, 0, 0],
                b.location = a,
                this._entity = new geofs.api.Model(this._type.model, b));
            this.update()
        },
        setCeiling: function(a) {
            a = a || weather.definition.ceiling;
            this._entity.setLocation([this._entity._lla[0], this._entity._lla[1], Math.random() * (this._type.aboveCeiling - this._type.belowCeiling) + (a + this._type.belowCeiling)])
        },
        setColor: function(a) {
            this._entity.setColor(a)
        },
        move: function(a) {
            this._location = V3.add(this._location, a);
            this._entity.setLocation(this._location)
        },
        setLocation: function(a) {
            this._location = a;
            this._entity.setLocation(a)
        },
        update: function() {
            var a = this,
                b = ll2xy(V3.sub(this._location, geofs.aircraft.instance.llaLocation), geofs.aircraft.instance.llaLocation);
            b[2] = 0;
            if (V2.length(b) > this._type.maxRadius)
                if (geofs.fx.cloudManager.instance.numberOfClouds <= geofs.fx.cloudManager.instance.maxNumberOfClouds)
                    b = V3.scale(V3.normalize(b), .9 * this._type.maxRadius),
                    b = V3.add(geofs.aircraft.instance.llaLocation, xyz2lla([-b[0], -b[1], b[2]], geofs.aircraft.instance.llaLocation)),
                    b[2] = this._location[2],
                    this.setLocation(b);
                else {
                    this.destroy();
                    return
                }
            clearTimeout(this._updateTimeout);
            this._updateTimeout = setTimeout(function() {
                a.update()
            }, 2E4 + 2E4 * Math.random())
        },
        destroy: function() {
            clearTimeout(this._updateTimeout);
            delete geofs.fx.cloudManager.instance.clouds[this._id];
            geofs.fx.cloudManager.instance.numberOfClouds--;
            this._entity && this._entity.destroy()
        }
    };
    geofs.fx.CloudCover = function(a) {
        this.create(a)
    };
    geofs.fx.CloudCover.prototype = {
        texture: PAGE_PATH + "models/clouds/cover.jpg",
        size: 1,
        options: {
            url: PAGE_PATH + "models/clouds/cover.gltf",
            scale: 4E5
        },
        create: function(a) {
            if (!this.entity) {
                var b = $.extend({}, this.options);
                b.location = a;
                this.entity = new geofs.api.Model(null, b);
                this.update()
            }
        },
        setColor: function(a) {
            this.entity.setColor(a);
            geofs.fx.volumetricFog.setColor(a)
        },
        setLocation: function(a) {
            this.entity.setLocation(a)
        },
        update: function() {
            var a = this;
            this.setLocation([camera.lla[0], camera.lla[1], weather.definition.ceiling]);
            clearTimeout(this._updateTimeout);
            this._updateTimeout = setTimeout(function() {
                a.update()
            }, 2E4)
        },
        destroy: function() {
            clearTimeout(this._updateTimeout);
            this.entity && (this.entity.destroy(),
                geofs.fx.volumetricFog.destroy());
            this.entity = null
        }
    };
    geofs.fx.precipitation = {
        types: {
            snow: {
                speed: .001,
                model: PAGE_PATH + "models/precipitations/snow.gltf"
            },
            rain: {
                speed: .1,
                model: PAGE_PATH + "models/precipitations/rain.gltf?bla=1"
            }
        },
        visible: !0,
        init: function() {},
        create: function(a, b) {
            a != geofs.fx.precipitation.type && (geofs.fx.precipitation.apiModel && geofs.fx.precipitation.destroy(),
                geofs.fx.precipitation.type = a,
                geofs.fx.precipitation.amount = b,
                geofs.fx.precipitation.apiModel = new geofs.api.Model(geofs.fx.precipitation.types[a].model),
                geofs.fx.precipitation.motionOffset = 0);
            geofs.fx.precipitation.apiModel = new geofs.api.Model(geofs.fx.precipitation.types[a].model)
        },
        update: function(a, b) {
            if (geofs.fx.precipitation.apiModel && this.visible) {
                !geofs.fx.precipitation._material && geofs.fx.precipitation.apiModel._model && geofs.fx.precipitation.apiModel._model.ready && (geofs.fx.precipitation._material = geofs.fx.precipitation.apiModel._model.getMaterial("rainMaterial"));
                if ("chase" == camera.currentModeName || "free" == camera.currentModeName) {
                    var c = weather.currentWindSpeedMs;
                    a = weather.currentWindDirection + 180;
                    var d = 90
                } else
                    c = geofs.aircraft.instance.trueAirSpeed,
                    a = Math.atan2(geofs.aircraft.instance.veldir[0], geofs.aircraft.instance.veldir[1]) * RAD_TO_DEGREES,
                    d = Math.acos(geofs.aircraft.instance.veldir[2]) * RAD_TO_DEGREES;
                a = [a, 2 * c, 0];
                a[1] = clamp(a[1], 0, d);
                c = [2, 2, clamp(2 + .5 * c, 2, 50)];
                geofs.fx.precipitation.apiModel.setPositionOrientationAndScale(camera.lla, a, c);
                geofs.fx.precipitation._material && !geofs.pause && (geofs.fx.precipitation.motionOffset -= Math.min(.9, .01 + b * geofs.aircraft.instance.trueAirSpeed * geofs.fx.precipitation.types[geofs.fx.precipitation.type].speed),
                    0 > geofs.fx.precipitation.motionOffset && (geofs.fx.precipitation.motionOffset += 1),
                    geofs.fx.precipitation._material.setValue("motion", geofs.fx.precipitation.motionOffset))
            }
        },
        show: function() {
            geofs.fx.precipitation.apiModel && (geofs.api.setModelVisibility(geofs.fx.precipitation.apiModel._model, !0),
                this.visible = !0)
        },
        hide: function() {
            geofs.fx.precipitation.apiModel && (geofs.api.setModelVisibility(geofs.fx.precipitation.apiModel._model, !1),
                this.visible = !1)
        },
        destroy: function() {
            geofs.fx.precipitation.apiModel && (geofs.fx.precipitation.type = "none",
                geofs.fx.precipitation._material = null,
                geofs.fx.precipitation.apiModel.destroy(),
                geofs.fx.precipitation.apiModel = null)
        }
    };
    geofs.fx.retro = function(a) {
        function b() {
            geofs.aircraft.instance.parts.root.object3d._model && (geofs.aircraft.instance.parts.root.object3d._model.color = c,
                geofs.aircraft.instance.parts.root.object3d._model.colorBlendAmount = 1,
                geofs.aircraft.instance.parts.root.object3d._model.colorBlendMode = 2,
                geofs.aircraft.instance.parts.root.object3d._model.shadows = 2,
                geofs.aircraft.instance.parts.root.object3d._model.debugWireframe = !0)
        }
        weather.set = function() {};
        geofs.retroOn = !0;
        var c = Cesium.Color.fromCssColorString("#2caecf");
        a = new Cesium.Material({
            fabric: {
                type: "SlopeColorContour",
                materials: {
                    contourMaterial: {
                        type: "ElevationContour"
                    },
                    colorMaterial: {
                        type: "Color"
                    }
                },
                components: {
                    diffuse: "contourMaterial.alpha == 0.0 ? colorMaterial.diffuse : contourMaterial.diffuse",
                    alpha: "1.0"
                }
            },
            translucent: !1
        });
        a.materials.contourMaterial.uniforms.width = 1;
        a.materials.contourMaterial.uniforms.spacing = 30;
        a.materials.contourMaterial.uniforms.color = c;
        a.materials.colorMaterial.uniforms.color = Cesium.Color.fromCssColorString("#0a243b");
        geofs.api.viewer.scene.globe.material = a;
        var d = geofs.api.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(0, 0, 1E6),
            billboard: {
                image: PAGE_PATH + "images/retro/sun.png",
                show: !0,
                pixelOffset: new Cesium.Cartesian2(0, 0),
                eyeOffset: new Cesium.Cartesian3(0, 0, 0),
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                width: 256,
                height: 256
            }
        });
        geofs.api.addFrameCallback(function() {
            d.position = new Cesium.Cartesian3.fromDegrees(geofs.aircraft.instance.llaLocation[1] - 10, geofs.aircraft.instance.llaLocation[0], 1E4)
        });
        geofs.api.viewer.scene.skyAtmosphere.hueShift = .3;
        geofs.api.viewer.scene.skyAtmosphere.brightnessShift = -.2;
        geofs.api.viewer.scene.skyAtmosphere.saturationShift = .2;
        geofs.api.viewer.scene.skyBox.show = !1;
        geofs.api.viewer.scene.sun.destroy();
        geofs.api.viewer.scene.fog.density = 8E-5;
        geofs.runways.redraw();
        b();
    }
}
export default fxGeofs;