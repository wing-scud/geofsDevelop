//提供接口方法

import geofs from "../geofs";
import camera from "../modules/camera";
import controls from "../modules/controls"
// import L from "../lib/L.js"
import {
    V3,
    M33,
    xyz2lla,
    V2,
    xy2ll,
    clamp,
    GetAzimuth,
    fixAngle,
    lla2xyz,
    GetDistanceTwo,
    DEGREES_TO_RAD,
    RAD_TO_DEGREES,
    FEET_TO_METERS,
    METERS_TO_LOCAL_LAT
} from '../utils/utils'


var api = {};
api.march2019theTwentyFirst = 2458563;
api.halfADayInSeconds = 43200;
api.overlayBaseZIndex = 60;
api.ALTITUDE_RELATIVE = 'ALTITUDE_RELATIVE';
api.CLAMP_TO_GROUND = 'CLAMP_TO_GROUND';
api.nativeMouseHandling = !1;
api.isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? !0 : !1;
api.getPlatform = () => { // 平台支持
    if (geofs.platform) { return geofs.platform; }
    /iPhone|iPad|iPod/i.test(navigator.userAgent) && (geofs.platform = 'ios');
    /Android/i.test(navigator.userAgent) && (geofs.platform = 'android');
    return geofs.platform;
};

api.isIOS = () => api.getPlatform() == 'ios' ? !0 : !1;
api.initWorld = a => { //初始化世界，可添加模型
    Cesium.Ion.defaultAccessToken = geofs.ionkey;
    const b = {
        animation: !1,
        geocoder: !1,
        homeButton: !1,
        infoBox: !1,
        selectionIndicator: !1,
        sceneModePicker: !1,
        baseLayerPicker: !1,
        timeline: !1,
        imageryProvider: Cesium.createTileMapServiceImageryProvider({
            url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'),
        }),
        navigationHelpButton: !1,
        navigationInstructionsInitiallyVisible: !1,
        fullscreenButton: !1,
        scene3DOnly: !0,
        clock: new Cesium.Clock({
            currentTime: new Cesium.JulianDate(api.march2019theTwentyFirst, 43200),
        }),
        showRenderLoopErrors: geofs.debug.on,
        useDefaultRenderLoop: !0,
    };
    geofs.androidViewerOptions = geofs.androidViewerOptions || {};
    geofs.iosViewerOptions = geofs.iosViewerOptions || {};
    Object.assign(b, geofs.androidViewerOptions, geofs.iosViewerOptions);
    try {
        api.viewer = new Cesium.Earth(a, b),
            b.useDefaultRenderLoop || (geofs.renderLoop = () => {
                    geofs.pause || api.viewer.render();
                    requestAnimationFrame(geofs.renderLoop);
                },
                geofs.renderLoop());
    } catch (c) {
        $.haring.create('GeoFS, Free Online Flight Simulator, requires WebGL in order to run. Please visit the <a href="/pages/instructions.php">instructions page</a> for more details', 'OK');
        return;
    }
    api.blackMarble = api.viewer.imageryLayers.addImageryProvider(Cesium.createTileMapServiceImageryProvider({
        url: `${geofs.dataServer}/bm`,
        credit: 'Black Marble imagery courtesy NASA Earth Observatory',
        maximumLevel: 8,
        flipXY: !0,
    }));
    api.blackMarble.alpha = 0;
    api.blackMarble.hue = 3.5;
    api.blackMarble.saturation = 0.7;
    api.blackMarble.brightness = 4;
    api.blackMarble.show = !1;
    api.viewer.scene.highDynamicRange = !1;
    api.viewer.scene.skyBox = new Cesium.SkyBox({
        sources: {
            positiveX: geofs.localUrl + 'images/skybox/tycho2t3_80_px.png',
            negativeX: geofs.localUrl + 'images/skybox/tycho2t3_80_mx.png',
            positiveY: geofs.localUrl + 'images/skybox/tycho2t3_80_py.png',
            negativeY: geofs.localUrl + 'images/skybox/tycho2t3_80_my.png',
            positiveZ: geofs.localUrl + 'images/skybox/tycho2t3_80_pz.png',
            negativeZ: geofs.localUrl + 'images/skybox/tycho2t3_80_mz.png',
        },
    });
    // api.viewer.scene.moon.textureUrl = 'images/moonSmall.jpg';
    api.flatRunwayTerrainProviderInstance = new api.FlatRunwayTerrainProvider({
        baseProvider: new GeoVis.GeoserverTerrainProvider({
            url: "http://syy.geovisweb.cn:10088/geoserver/wms",
            layerName: "GlobalTerrain:pyramid32",
            maxLevel: 11,
            service: "WMS",
            scale: 1,
            landScale: 1,
            oceanScale: 1,
            waterMask: true
        }),
    });
    api.viewer.terrainProvider = api.flatRunwayTerrainProviderInstance;
    api.viewer.scene.globe.enableLighting = !1;
    api.viewer.scene.globe.oceanNormalMapUrl = 'shaders/oceanmap.jpg';
    api.viewer.scene.logarithmicDepthBuffer = !1;
    api.viewer.scene.farToNearRatio = 100;
    api.viewer.scene.globe.depthTestAgainstTerrain = !1;
    $('.geofs-ui-3dview').on('terrainStable', () => {
        api.viewer.scene.globe.depthTestAgainstTerrain = !0;
    });
    $('.geofs-ui-3dview').on('terrainUnstable', () => {
        api.viewer.scene.globe.depthTestAgainstTerrain = !1;
    });
    api.labels = api.viewer.scene.primitives.add(new Cesium.LabelCollection());
    api.billboards = {
        default: api.viewer.scene.primitives.add(new Cesium.BillboardCollection({
            scene: api.viewer.scene,
            blendOption: Cesium.BlendOption.OPAQUE_AND_TRANSLUCENT,
        })),
        opaque: api.viewer.scene.primitives.add(new Cesium.BillboardCollection({
            scene: api.viewer.scene,
            blendOption: Cesium.BlendOption.OPAQUE,
        })),
        translucent: api.viewer.scene.primitives.add(new Cesium.BillboardCollection({
            scene: api.viewer.scene,
            blendOption: Cesium.BlendOption.TRANSLUCENT,
        })),
    };
    api.models = api.viewer.scene.primitives.add(new Cesium.PrimitiveCollection({
        destroyPrimitives: !1,
    }));
    api.viewer.scene.preRender.addEventListener(api.frameCallbackWrapper);
    $('.geofs-ui-3dview').trigger('rendererInitDone');
};
api.destroyWorld = () => {
    api.viewer.scene.preRender.removeEventListener(api.frameCallbackWrapper);
};
api.addFrameCallback = (a, b, c) => {
    b = b || 'global';
    geofs.frameCallbackStack[b] || (geofs.frameCallbackStack[b] = {
        callbacks: {},
        lastId: 0,
        maxExecutionTime: c,
        lastIndex: 1,
    });
    geofs.frameCallbackStack[b].lastId++;
    geofs.frameCallbackStack[b].callbacks[geofs.frameCallbackStack[b].lastId] = a;
    return geofs.frameCallbackStack[b].lastId;
};
api.removeFrameCallback = (a, b) => {
    b = b || 'global';
    geofs.frameCallbackStack[b] && delete geofs.frameCallbackStack[b].callbacks[a];
};
api.frameCallbackWrapper = (a, b) => {
    a = geofs.utils.now();
    for (const c in geofs.frameCallbackStack) {
        if (b = geofs.frameCallbackStack[c],
            b.maxExecutionTime > 0) {
            var d = b.lastIndex;
            do {
                try {
                    b.callbacks[d](a);
                } catch (e) {
                    geofs.debug.throw(e);
                }
                d++;
                d > b.lastId && (d = 1);
            } while (a + b.maxExecutionTime > geofs.utils.now());
            b.lastIndex = d;
        } else {
            for (d in b.callbacks) {
                try {
                    b.callbacks[d](a);
                } catch (e) {
                    geofs.debug.throw(e);
                }
            }
        }
    }
};
api.configureOutsideView = () => {
    api.viewer.shadowMap.maximumDistance = geofs.aircraft.instance.setup.oustsideShadowMapMaxDistance || 1E3;
    api.viewer.shadowMap.darkness = 0.3;
    api.camera.frustum.near = 1;
};
api.configureInsideView = () => {
    api.viewer.shadowMap.maximumDistance = geofs.aircraft.instance.setup.cockpitShadowMapMaxDistance || 100;
    api.viewer.shadowMap.darkness = 0.5;
    api.camera.frustum.near = 0.2;
};
api.setGlobeLighting = a => {
    api.viewer.scene.globe.enableLighting = a;
};
api.setWaterEffect = a => {
    api.viewer.scene.globe.showWaterEffect = a;
};



function fixAngle360(a) {
    a %= 360;
    return a >= 0 ? a : a + 360;
}
api.setHD = a => {
    if (api.hdOn !== a) {
        a = {
            method: 'doGeoIp',
            nohd: a ? 'false' : 'true',
        };
        if (geofs.isApp) {
            if (!geofs.userRecord.sessionId) { return; }
            a.sessionId = geofs.userRecord.sessionId;
        }
        // $('.geofs-apiResponse').htmlView('load', `${geofs.url}/backend/accounts/hd.php`, a);
    }
};
api.setImageryProvider = (a, b, c, d, e) => {
    let f = api.viewer.imageryLayers,
        g = f.get(0);
    f.remove(g);
    a = f.addImageryProvider(a, 0);
    geofs.runways.setRunwayModelVisibility(b);
    api.setImageryColorModifier('multiplier', {
        brightness: c || 1,
        contrast: d || 1,
        saturation: e || 1,
    });
    geofs.preferences && geofs.preferences.graphics && api.enhanceColors(geofs.preferences.graphics.enhanceColors);
    return a;
};
api.setTimeAndDate = (a, b) => {
    api.viewer.clock.shouldAnimate = !1;
    return api.viewer.clock.currentTime = new Cesium.JulianDate(api.march2019theTwentyFirst + (b || 0), a - api.halfADayInSeconds);
};
api.setClock = a => {
    api.viewer.clock.multiplier = 1;
    api.viewer.clock.currentTime = Cesium.JulianDate.fromDate(a);
    api.viewer.clock.shouldAnimate = !0;
};
api.vr = a => {
    api.viewer.scene.useWebVR = a;
};
api.enhanceColors = a => {
    a = a || 0;
    api.setImageryColorModifier('enhancement', {
        contrast: 1 + 0.4 * a,
        saturation: 1 + 0.4 * a,
    });
    api.setAtmosphereColorModifier('enhancement', {
        brightnessShift: 0.5,
        saturationShift: -0.2,
        groundBrightnessShift: 0.7,
        fogBrightness: 0.9,
        groundSaturationShift: -1,
    });
};
api.defaultImageryColorModifier = {
    brightness: 1,
    contrast: 1,
    saturation: 1,
    gamma: 1,
    hue: 0,
};
api.imageryColorModifiers = {};
api.setImageryColorModifier = (a, b) => {
    b = $.extend({}, api.defaultImageryColorModifier, b);
    api.imageryColorModifiers[a || 'base'] = b;
    api.applyImageryColorModifiers();
};
api.removeImageryColorModifier = a => {
    delete api.imageryColorModifiers[a];
    api.applyImageryColorModifiers();
};
api.applyImageryColorModifiers = () => {
    api.imageryColors = $.extend({}, api.defaultImageryColorModifier);
    for (const a in api.imageryColorModifiers) {
        api.imageryColors.brightness *= api.imageryColorModifiers[a].brightness,
            api.imageryColors.contrast *= api.imageryColorModifiers[a].contrast,
            api.imageryColors.saturation *= api.imageryColorModifiers[a].saturation,
            api.imageryColors.gamma *= api.imageryColorModifiers[a].gamma,
            api.imageryColors.hue += api.imageryColorModifiers[a].hue;
    }
    api.setImageryBrightness(api.imageryColors.brightness);
    api.setImageryContrast(api.imageryColors.contrast);
    api.setImagerySaturation(api.imageryColors.saturation);
    api.setImageryGamma(api.imageryColors.gamma);
    api.setImageryHue(api.imageryColors.hue);
};
api.setImageryBrightness = a => {
    const b = api.viewer.imageryLayers.get(0);
    a && (b.brightness = a);
    return b.brightness;
};
api.setImageryContrast = a => {
    const b = api.viewer.imageryLayers.get(0);
    a && (b.contrast = a);
    return b.contrast;
};
api.setImagerySaturation = a => {
    const b = api.viewer.imageryLayers.get(0);
    a && (b.saturation = a);
    return b.saturation;
};
api.setImageryHue = a => {
    const b = api.viewer.imageryLayers.get(0);
    a && (b.hue = a);
    return b.hue;
};
api.setImageryGamma = a => {
    const b = api.viewer.imageryLayers.get(0);
    a && (b.gamma = a);
    return b.gamma;
};
api.defaultAtmosphereColorModifier = {
    brightnessShift: 0,
    saturationShift: 0,
    hueShift: 0,
    groundBrightnessShift: 0,
    groundSaturationShift: 0,
    groundHueShift: 0,
    fogBrightness: 1,
    cloudsBrightness: 1,
};
api.atmosphereColorModifiers = {};
api.setAtmosphereColorModifier = (a, b) => {
    a = a || 'base';
    b = $.extend({}, api.defaultAtmosphereColorModifier, api.atmosphereColorModifiers[a] || {}, b);
    api.atmosphereColorModifiers[a] = b;
    api.applyAtmosphereColorModifiers();
};
api.removeAtmosphereColorModifier = a => {
    delete api.atmosphereColorModifiers[a];
    api.applyAtmosphereColorModifiers();
};
api.applyAtmosphereColorModifiers = () => {
    api.atmosphereColors = $.extend({}, api.defaultAtmosphereColorModifier);
    for (const a in api.atmosphereColorModifiers) {
        api.atmosphereColors.brightnessShift += api.atmosphereColorModifiers[a].brightnessShift,
            api.atmosphereColors.saturationShift += api.atmosphereColorModifiers[a].saturationShift,
            api.atmosphereColors.hueShift += api.atmosphereColorModifiers[a].hueShift,
            api.atmosphereColors.groundBrightnessShift += api.atmosphereColorModifiers[a].groundBrightnessShift,
            api.atmosphereColors.groundHueShift += api.atmosphereColorModifiers[a].groundHueShift,
            api.atmosphereColors.groundSaturationShift += api.atmosphereColorModifiers[a].groundSaturationShift,
            api.atmosphereColors.fogBrightness *= api.atmosphereColorModifiers[a].fogBrightness,
            api.atmosphereColors.cloudsBrightness *= api.atmosphereColorModifiers[a].cloudsBrightness;
    }
    api.viewer.scene.skyAtmosphere.brightnessShift = api.atmosphereColors.brightnessShift;
    api.viewer.scene.skyAtmosphere.saturationShift = api.atmosphereColors.saturationShift;
    api.viewer.scene.skyAtmosphere.hueShift = api.atmosphereColors.hueShift;
    api.viewer.scene.globe.atmosphereBrightnessShift = clamp(api.atmosphereColors.groundBrightnessShift, -1, 1);
    api.viewer.scene.globe.atmosphereHueShift = clamp(api.atmosphereColors.groundHueShift, -1, 1);
    api.viewer.scene.globe.atmosphereSaturationShift = clamp(api.atmosphereColors.groundSaturationShift, -1, 1);
    api.viewer.scene.fog.minimumBrightness = api.atmosphereColors.fogBrightness;
    geofs.fx.cloudManager.setCloudsBrightness(api.atmosphereColors.cloudsBrightness);
};
api.showSun = () => {
    // api.viewer.scene.sun.show = !0;
};
api.hideSun = () => {
    // api.viewer.scene.sun.show = !1;
};
$('.geofs-ui-3dview').on('terrainUnstable', () => {
    api.renderingQuality('loading');
    $('.geofs-3dloader').show();
});
$('.geofs-ui-3dview').on('terrainStable', () => {
    api.renderingQuality(geofs.preferences.graphics.quality);
    $('.geofs-3dloader').hide();
});
api.renderingQuality = a => {
    a = a || geofs.preferences.graphics.quality;
    switch (a) {
        case 'loading':
            api.viewer.scene.globe.tileCacheSize = 100;
            api.viewer.resolutionScale *= 0.8;
            api.viewer.scene.fxaa = !1;
            api.viewer.scene.globe.maximumScreenSpaceError = 6;
            api.setGlobeLighting(!1);
            geofs.preferences.graphics.simpleShadow = !0;
            geofs.fx.cloudManager.setCloudCoverToCloudNumber(0);
            api.viewer.scene.fog.screenSpaceErrorFactor = 2;
            api.viewer.scene.fog.density = 3.5E-4;
            api.viewer.shadowMap.size = 1024;
            api.flatRunwayTerrainProviderInstance.setMaximumLevel(10);
            break;
        case 1:
            api.viewer.scene.globe.tileCacheSize = 20;
            api.viewer.resolutionScale = 0.7;
            api.viewer.scene.fxaa = !0;
            api.viewer.scene.globe.maximumScreenSpaceError = 6;
            api.setGlobeLighting(!1);
            geofs.preferences.graphics.simpleShadow = !0;
            geofs.fx.cloudManager.setCloudCoverToCloudNumber(1);
            api.viewer.scene.fog.screenSpaceErrorFactor = 2;
            api.viewer.scene.fog.density = 3.2E-4;
            api.viewer.shadowMap.size = 1024;
            api.flatRunwayTerrainProviderInstance.setMaximumLevel(8);
            break;
        case 2:
            api.viewer.scene.globe.tileCacheSize = geofs.isMobile ? 30 : 500;
            api.viewer.resolutionScale = 0.9;
            api.viewer.scene.fxaa = !0;
            api.viewer.scene.globe.maximumScreenSpaceError = 4;
            api.setGlobeLighting(!1);
            geofs.preferences.graphics.simpleShadow = !1;
            geofs.fx.cloudManager.setCloudCoverToCloudNumber(5);
            api.viewer.scene.fog.screenSpaceErrorFactor = 2;
            api.viewer.scene.fog.density = 3E-4;
            api.viewer.shadowMap.size = 1024;
            api.flatRunwayTerrainProviderInstance.setMaximumLevel(10);
            break;
        case 3:
            api.viewer.scene.globe.tileCacheSize = geofs.isMobile ? 50 : 1E3;
            api.viewer.resolutionScale = 1;
            api.viewer.scene.fxaa = !0;
            api.viewer.scene.globe.maximumScreenSpaceError = 2;
            api.setGlobeLighting(!0);
            geofs.preferences.graphics.simpleShadow = !1;
            geofs.fx.cloudManager.setCloudCoverToCloudNumber(10);
            api.viewer.scene.fog.screenSpaceErrorFactor = 2;
            api.viewer.scene.fog.density = 2.5E-4;
            api.viewer.shadowMap.size = 2048;
            api.flatRunwayTerrainProviderInstance.setMaximumLevel(11);
            break;
        case 4:
            api.viewer.scene.globe.tileCacheSize = geofs.isMobile ? 50 : 1500;
            api.viewer.resolutionScale = 1;
            api.viewer.scene.fxaa = !0;
            api.viewer.scene.globe.maximumScreenSpaceError = 1;
            api.setGlobeLighting(!0);
            geofs.preferences.graphics.simpleShadow = !1;
            geofs.fx.cloudManager.setCloudCoverToCloudNumber(15);
            api.viewer.scene.fog.screenSpaceErrorFactor = 2;
            api.viewer.scene.fog.density = 2E-4;
            api.viewer.shadowMap.size = 2048;
            api.flatRunwayTerrainProviderInstance.setMaximumLevel(11);
            break;
        case 5:
            api.viewer.scene.globe.tileCacheSize = geofs.isMobile ? 50 : 1500;
            api.viewer.resolutionScale = 1.5;
            api.viewer.scene.fxaa = !0;
            api.viewer.scene.globe.maximumScreenSpaceError = 1;
            api.setGlobeLighting(!0);
            geofs.preferences.graphics.simpleShadow = !1;
            geofs.fx.cloudManager.setCloudCoverToCloudNumber(15);
            api.viewer.scene.fog.screenSpaceErrorFactor = 2;
            api.viewer.scene.fog.density = 2E-4;
            api.viewer.shadowMap.size = 3072;
            api.flatRunwayTerrainProviderInstance.setMaximumLevel(11);
            break;
        case 6:
            api.viewer.scene.globe.tileCacheSize = geofs.isMobile ? 100 : 1500,
                api.viewer.resolutionScale = 2,
                api.viewer.scene.fxaa = !0,
                api.viewer.scene.globe.maximumScreenSpaceError = 1,
                geofs.preferences.graphics.simpleShadow = !1,
                geofs.fx.cloudManager.setCloudCoverToCloudNumber(15),
                api.viewer.scene.fog.screenSpaceErrorFactor = 2,
                api.viewer.scene.fog.density = 2E-4,
                api.viewer.shadowMap.size = 4096,
                api.flatRunwayTerrainProviderInstance.setMaximumLevel(11);
    }
    geofs.useSimpleShadow(geofs.preferences.graphics.forceSimpleShadow || geofs.preferences.graphics.simpleShadow);
    api.viewer.handleResize();
};
api.useNativeShadows = a => {
    api.viewer.shadows = a;
};
api.addLabel = (a, b, c) => {
    b = b || [0, 0, 0];
    c = c || {};
    if (V3.isValid(b)) {
        return a = {
                position: new Cesium.Cartesian3.fromDegrees(b[1], b[0], b[2]),
                text: api.makeLabelTextSafe(a),
            },
            c = $.extend(c, a),
            api.labels.add(c);
    }
    geofs.debug.debugger();
};
api.updateLabelText = (a, b) => {
    a.text = api.makeLabelTextSafe(b);
};
api.makeLabelTextSafe = a => a.replace(/[^\x20-\x7E]+/g, '');
api.removeLabel = a => {
    a && api.labels.remove(a);
};
api.setLabelPosition = (a, b) => {
    a && (V3.isValid(b) ? a.position = new Cesium.Cartesian3.fromDegrees(b[1], b[0], b[2]) : geofs.debug.debugger());
};
api.altitudeErrorThreshold = 0.2;
api.wrongAltitudeTries = 2;
api.getGroundAltitude = (a, b) => {
    if (geofs.debug.on && !V3.isValid(a)) { debugger; }
    const c = geofs.groundElevation || 0;
    a = api.viewer.scene.globe.getHeight(new Cesium.Cartographic.fromDegrees(a[1], a[0], c));
    a < -1E3 && (a = 0);
    if (void 0 == a) {
        b ? (a = b.lastGroundAltitude || 0,
            b.wrongAltitude = !0) : a = c;
    } else if (b) {
        if (Math.abs(b.lastGroundAltitude - a) > api.altitudeErrorThreshold && b.wrongAltitudeTries <= api.wrongAltitudeTries) {
            return b.wrongAltitudeTries++,
                b.lastGroundAltitude;
        }
        b.wrongAltitudeTries = 0;
        b.lastGroundAltitude = a;
        b.wrongAltitude = null;
    }
    return a;
};
api.oldNormal = [0, 0, 1];
api.normalDotThreshold = 0.95;
api.wrongNormalTries = 3;
api.getMostDetailedGroundNormal = (a, b) => {

    const c = V3.dup(a);
    a = xyz2lla([1, 1, 0], c);
    let d = V3.add(c, [a[0], 0, 0]),
        e = V3.add(c, [0, a[1], 0]);

    a = Cesium.sampleTerrainMostDetailed(api.viewer.terrainProvider, [Cesium.Cartographic.fromDegrees(c[1], c[0]), Cesium.Cartographic.fromDegrees(d[1], d[0]), Cesium.Cartographic.fromDegrees(e[1], e[0])]);
    //对地形进行采样????
    Cesium.when(a, (a) => {
        c[2] = a[0].height;
        d[2] = a[1].height;
        e[2] = a[2].height;
        a = V3.sub(d, c);
        let f = V3.sub(e, c);
        a = lla2xyz(a, c);
        f = lla2xyz(f, c);
        b({
            origin: c,
            normal: V3.normalize(V3.cross(f, a)),
        });
    });
};
api.getGroundNormal = (a, b) => {
    b = b || {};
    b.oldNormal = b.oldNormal || [0, 0, 1];
    a = V3.dup(a);
    let c = xyz2lla([1, 1, a[2]], a),
        d = V3.add(a, [c[0], 0, a[2]]);
    c = V3.add(a, [0, c[1], a[2]]);
    a[2] = api.getGroundAltitude(a);
    d[2] = api.getGroundAltitude(d);
    c[2] = api.getGroundAltitude(c);
    d = V3.sub(d, a);
    c = V3.sub(c, a);
    d = lla2xyz(d, a);
    c = lla2xyz(c, a);
    a = V3.normalize(V3.cross(c, d));
    if (V3.dot(a, b.oldNormal) < api.normalDotThreshold && b.wrongNormal < api.wrongNormalTries) {
        return b.wrongNormal += 1,
            b.oldNormal;
    }
    b.wrongNormal = 0;
    b.oldNormal = a;
    return api.oldNormal = a;
};
api.shadowOffset = 0.1;
api.createShadow = function(a, b) {
    this.scale = V3.scale(b, 2);
    this.scale[2] = 1;
    return api.loadModel({
        url: a,
    });
};
api.setShadowLocationRotation = function(a, b, c) {
    b[2] += api.shadowOffset;
    api.setModelPositionOrientationAndScale(a, b, c, this.scale);
};
api.Model = function(a, b) {
    b = b || {};
    b.url = b.url || a;
    this._model = api.loadModel(b);
    this.setPositionOrientationAndScale(b.location, b.rotation);
};
api.Model.prototype.setPositionOrientationAndScale = function(a, b, c) {
    return api.setModelPositionOrientationAndScale(this._model, a, b, c);
};
api.Model.prototype.setLocation = function(a) {
    this.setPositionOrientationAndScale(a);
};
api.Model.prototype.setColor = function(a) {
    this._model.color = a;
};
api.Model.prototype.setCssColor = function(a) {
    this._model.color = Cesium.Color.fromCssColorString(a);
};
api.Model.prototype.hide = function() {
    api.setModelVisibility(this._model, !1);
};
api.Model.prototype.show = function() {
    api.setModelVisibility(this._model, !0);
};
api.Model.prototype.destroy = function() {
    api.destroyModel(this._model);
};
api.Model.prototype.remove = function() {
    api.removeFromWorld(this._model);
};
api.loadModel = a => {
    typeof a === 'string' && (a = {
        url: a,
    });
    a = $.extend({}, {
        castShadows: !1,
        receiveShadows: !1,
    }, a);
    let b = Cesium.ShadowMode.DISABLED;
    a.castShadows && (b = Cesium.ShadowMode.CAST_ONLY);
    a.receiveShadows && (b = Cesium.ShadowMode.RECEIVE_ONLY);
    a.castShadows && a.receiveShadows && (b = Cesium.ShadowMode.ENABLED);
    a.shadows = b;
    b = Cesium.Model.fromGltf(a);
    a.justLoad || api.addModelToWorld(b);
    return b;
};
api.addModelToWorld = a => {
    a && (a.isDestroyed() || api.models.add(a));
};
api.toggleModelShadow = (a, b) => {
    api.viewer.shadows && a && !a.isDestroyed() && (a.shadows = b ? Cesium.ShadowMode.CAST_ONLY : Cesium.ShadowMode.DISABLED);
};
api.removeModelFromWorld = a => {
    a && (a.isDestroyed() || api.models.remove(a));
};
api.setModelVisibility = (a, b) => {
    if (!a || a.isDestroyed()) { return !1; }
    a.show = b;
    return !0;
};
api.destroyModel = a => {
    a && (api.removeModelFromWorld(a),
        a.isDestroyed() || a.destroy());
};
api.getPositionOrientationAndScaleMatrix = (a, b, c) => {
    c = c || [1, 1, 1];
    b = b || [0, 0, 0];
    a = a || [0, 0, 0];
    a = Cesium.Cartesian3.fromDegrees(a[1], a[0], a[2]);
    return geofs.headingPitchRollScaleToFixedFrame(a, b[0] * DEGREES_TO_RAD, b[1] * DEGREES_TO_RAD, b[2] * DEGREES_TO_RAD, c);
};
api.setModelElevation = (a, b) => {
    api.setModelPositionOrientationAndScale(a, [a._apiLla[0], a._apiLla[1], b]);
};
api.setModelPositionOrientationAndScale = (a, b, c, d) => {
    a && !a.isDestroyed() && (d = d || a._apiScale || [1, 1, 1],
        c = c || a._apiHtr || [0, 0, 0],
        b = b || a._apiLla || [0, 0, 0],
        V3.isValid(c) ? V3.isValid(d) ? V3.isValid(b) ? (a.modelMatrix = api.getPositionOrientationAndScaleMatrix(b, c, d),
            a._apiScale = d,
            a._apiHtr = c,
            a._apiLla = b) : geofs.debug.debugger() : geofs.debug.debugger() : geofs.debug.debugger());
};
api.getModelNode = (a, b) => {
    a._geofsNodes = a._geofsNodes || {};
    if (!a._geofsNodes[b]) {
        if (!a || !a.ready) { return !1; }
        a._geofsNodes[b] = a.getNode(b);
    }
    return a._geofsNodes[b];
};
api.setModelRotationPosition = (a, b, c) => {
    a.originalTranform || (a.originalTranform = a.modelMatrix.clone(a.originalTranform));
    if (b) { var d = Cesium.Matrix3.fromColumnMajorArray(M33.toArray(b)); }
    if (c) { var e = Cesium.Cartesian3.fromDegrees(c[1], c[0], c[2]); }
    a.modelMatrix = Cesium.Matrix4.fromRotationTranslation(d, e);
    b = Cesium.Transforms.eastNorthUpToFixedFrame(e);
    a.modelMatrix = Cesium.Matrix4.multiply(b, a.modelMatrix, b);
};
api.setNodeRotationTranslation = (a, b, c) => {
    a.originalTranform || (a.originalTranform = a.matrix.clone(a.originalTranform));
    if (b) { var d = Cesium.Matrix3.fromColumnMajorArray(M33.toArray(b)); }
    if (c) { var e = new Cesium.Cartesian3(c[0], c[1], c[2]); }
    b = Cesium.Matrix4.fromRotationTranslation(d, e);
    a.matrix = Cesium.Matrix4.multiply(a.originalTranform, b, a.matrix);
};
api.setNodeScale = (a, b) => {
    b = Cesium.Matrix4.fromScale(new Cesium.Cartesian3(b[0], b[1], b[2]));
    a.matrix = Cesium.Matrix4.multiply(a.matrix, b, a.matrix);
};
api.setNodeVisibility = (a, b) => {
    if (!a) { return !1; }
    a.show = b;
    return !0;
};
api.getNodePosition = a => {
    a = Cesium.Matrix4.getTranslation(a.matrix, new Cesium.Cartesian3());
    return [a.x, a.y, a.z];
};
api.getNodeRotation = () => M33.identity();
api.setEntityPositionOrientation = (a, b, c) => {
    if (a) {
        if (c = c || a._apiHtr || [0, 0, 0],
            b = b || a._apiLla || [0, 0, 0],
            V3.isValid(c)) {
            if (V3.isValid(b)) {
                let d = Cesium.Cartesian3.fromDegrees(b[1], b[0], b[2]),
                    e = new Cesium.ConstantProperty(Cesium.Transforms.headingPitchRollQuaternion(d, new Cesium.HeadingPitchRoll(c[0] * DEGREES_TO_RAD, c[1] * DEGREES_TO_RAD, c[2] * DEGREES_TO_RAD)));
                a.position = d;
                a.orientation = e;
                geofs.debug.watch('x', d.x);
                geofs.debug.watch('y', d.y);
                geofs.debug.watch('z', d.z);
                a._apiHtr = c;
                a._apiLla = b;
            } else { geofs.debug.debugger(); }
        } else { geofs.debug.debugger(); }
    }
};
api.initAndGetCamera = () => {
    api.camera = api.viewer.camera;
    return api.camera;
};
api.getFOV = a => a.frustum.fov;
api.setFOV = (a, b) => {
    a.frustum.fov = b;
};
api.setCameraPositionAndOrientation = (a, b, c) => {
    V3.isValid(b) ? V3.isValid(c) ? (a.position = Cesium.Cartesian3.fromDegrees(b[1], b[0], b[2]),
        a.setView({
            orientation: {
                heading: Cesium.Math.toRadians(c[0]),
                pitch: Cesium.Math.toRadians(c[1]),
                roll: Cesium.Math.toRadians(c[2]),
            },
        })) : geofs.debug.debugger() : geofs.debug.debugger();
};
api.getCameraLla = a => {
    a = a.positionCartographic;
    return [a.latitude * RAD_TO_DEGREES, a.longitude * RAD_TO_DEGREES, a.height];
};
api.setCameraLookAt = (a, b) => {
    a.lookAt(Cesium.Cartesian3.fromDegrees(b[1], b[0], b[2]));
};
api.getHeading = a => a.heading * RAD_TO_DEGREES;
api.debug = a => {
    api.viewer.scene.debugShowFramesPerSecond = a ? !0 : !1;
};
api.getLlaFromScreencoordDepth = (a, b, c) => {
    a = camera.cam.getPickRay(new Cesium.Cartesian2(a, b));
    c = Cesium.Ray.getPoint(a, c);
    if (!isNaN(c.x)) {
        return c = Cesium.Cartographic.fromCartesian(c, null, new Cesium.Cartographic()), [c.latitude * RAD_TO_DEGREES, c.longitude * RAD_TO_DEGREES, c.height];
    }
};
api.getScreenCoordFromLla = a => Cesium.SceneTransforms.wgs84ToWindowCoordinates(api.viewer.scene, Cesium.Cartesian3.fromDegrees(a[1], a[0], a[2]));
api.xyz2lla = (a, b) => {
    let c = new Cesium.Matrix4(),
        d = api.viewer.scene.globe.ellipsoid,
        e = Cesium.Cartesian3.fromDegrees(b[1], b[0], b[2]);
    Cesium.Transforms.eastNorthUpToFixedFrame(e, d, c);
    a = new Cesium.Cartesian3(a[0], a[1], a[2]);
    c = Cesium.Matrix4.multiplyByPoint(c, a, new Cesium.Cartesian3());
    return (d = Cesium.Cartographic.fromCartesian(c, d, new Cesium.Cartographic())) ? [d.latitude * RAD_TO_DEGREES - b[0], d.longitude * RAD_TO_DEGREES - b[1], d.height - b[2]] : [0, 0, 0];
};
api.cssTransform = function() { //这个方法专门为instrument设计的，把OverLay添加到  <div class="geofs-overlay-container"></div>中，stall.png在ui.hub中使用
    this._$element = $('<div class="geofs-overlay"></div>').appendTo('.geofs-overlay-container');
    this.positionY = this.positionX = this.rotation = 0;
    this.offset = {
        x: 0,
        y: 0,
    };
};
api.cssTransform.rotationThreshold = 0;
api.cssTransform.translationThreshold = 0;
api.cssTransform.prototype = {
    setDrawOrder(a) {
        this._$element.css('z-index', a + api.overlayBaseZIndex);
    },
    setUrl(a) {
        if (a) {
            this.image = new Image();
            this.image.src = a;
            const b = this;
            this.image.onload = () => {
                b.loaded();
            };
            this._$element.css('background-image', `url("${a}")`);
        }
    },
    setText(a) {
        this._$element.html(a);
        this._$element.addClass('geofs-textOverlay');
    },
    setTitle(a) {
        this._$element.attr('title', a);
    },
    setClass(a) {
        this._$element.addClass(a);
    },
    setStyle(a) {
        this._$element.attr('style', a);
    },
    loaded() {
        this.naturalSize = {
            x: this.image.width,
            y: this.image.height,
        };
        $(this).trigger('load');
    },
    setFrameSize(a) {
        this._$element.css('width', `${a.x}px`);
        this._$element.css('height', `${a.y}px`);
    },
    setVisibility(a) {
        a ? this._$element.css('display', 'block') : this._$element.css('display', 'none');
    },
    setAnchor(a) {
        this._$element.css('margin-left', `${-a.x}px `);
        this._$element.css('margin-bottom', `${-a.y}px `);
    },
    setRotationCenter(a) {
        this._$element.css('transform-origin', `${a.x}px ${a.y}px`);
    },
    setSize(a) {
        this._$element.css('background-size', `${a.x}px ${a.y}px`);
    },
    setPosition(a) {
        this._$element.css('left', `${a.x}px`);
        this._$element.css('bottom', `${a.y}px`);
    },
    setPositionX(a) {
        Math.abs(a - this.positionX) < api.cssTransform.translationThreshold || (this._$element.css('left', `${a}px`),
            this.positionX = a);
    },
    setPositionY(a) {
        Math.abs(a - this.positionY) < api.cssTransform.translationThreshold || (this._$element.css('bottom', `${a}px`),
            this.positionY = a);
    },
    setPositionOffset(a) {
        Math.abs(a.x - this.offset.x) < api.cssTransform.translationThreshold && Math.abs(a.y - this.offset.y) < api.cssTransform.translationThreshold || (this._$element.css('background-position', `${a.x}px ${a.y}px`),
            this.offset.x = a.x,
            this.offset.y = a.y);
    },
    setOpacity(a) {
        this._$element.css('opacity', a);
    },
    setRotation(a) {
        if (!(Math.abs(a - this.rotation) < api.cssTransform.rotationThreshold)) {
            const b = `rotate(${fixAngle360(-a)}deg)`;
            this._$element.css('transform', b);
            this.rotation = a;
        }
    },
    destroy() {
        this._$element.remove();
    },
};
api.billboard = function(a, b, c) {
    c = $.extend({
        collection: 'default',
    }, c);
    a = a || [0, 0, 0];
    c.image = c.image || b;
    c.image += geofs.killCache;
    c.position = Cesium.Cartesian3.fromDegrees(a[1], a[0], a[2]);
    api.billboards[c.collection] || (api.billboards[c.collection] = api.viewer.scene.primitives.add(new Cesium.BillboardCollection({
        scene: api.viewer.scene,
        blendOption: Cesium.BlendOption.OPAQUE_AND_TRANSLUCENT,
    })));
    this._billboard = api.billboards[c.collection].add(c);
    this._lla = a;
    c.altitudeMode == api.ALTITUDE_RELATIVE && (this._billboard.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND);
    c.altitudeMode == api.CLAMP_TO_GROUND && (this._billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND);
    c.opacity && this.setOpacity(c.opacity);
    c.scale && this.setScale(c.scale);
    c.rotation && this.setRotation(c.rotation);
    c.geofsFixCameraRotation && this.fixCameraRotation();
    this._options = c;
};
api.billboard.prototype = {
    setUrl() {},
    setVisibility(a) {
        this._billboard && (this._billboard.show = a);
    },
    setColor(a) {
        this._billboard && (a.alpha = this.opacity || 1,
            this._billboard.color = a);
    },
    setCssColor(a) {
        this._billboard && (this._billboard.color = Cesium.Color.fromCssColorString(a));
    },
    setOpacity(a) {
        if (this._billboard) {
            const b = this._billboard.color || new Cesium.Color(1, 1, 1, 1);
            b.alpha = a;
            this._billboard.color = b;
            this.opacity = a;
        }
    },
    setRotation(a) {
        this._billboard && (this._billboard.rotation = a);
    },
    setScale(a) {
        this._billboard && (this._billboard.scale = a);
    },
    setLocation(a) {
        this._billboard && (V3.isValid(a) ? (this._lla = a,
            this._billboard.position = Cesium.Cartesian3.fromDegrees(a[1], a[0], a[2])) : geofs.debug.debugger());
    },
    getLla() {
        return this._lla;
    },
    fixCameraRotation() {
        const a = this;
        this.rotationFixCallback = api.addFrameCallback(() => {
            a._billboard.rotation = camera.radianRoll;
        }, 'billboardsRotationFix');
    },
    destroy() {
        this._billboard && (api.removeFrameCallback(this.rotationFixCallback, 'billboardsRotationFix'),
            api.billboards[this._options.collection].remove(this._billboard),
            this._billboard = null);
    },
};
api.notify = (a, b, c) => {
    $.haring.create(a, b || 'OK', c);
};
api.analytics = {
    init() {
        try {
            window._gat && window._gaq && (api.pageTracker = _gat._getTracker('UA-2996341-8'),
                _gaq.push(['_trackPageview']));
        } catch (a) {
            geofs.debug.error(a);
        }
    },
    event(a, b, c, d) {
        api.pageTracker ? api.pageTracker._trackEvent(a, b, c, d) : api.analytics.init();
    },
};
api.Canvas = function(a) {
    this.canvas = document.createElement('canvas');
    this.canvas.height = a.height;
    this.canvas.width = a.width;
    this.context = this.canvas.getContext('2d');
    this.context.fillStyle = 'green';
    this.context.fillRect(10, 10, 100, 100);
};
api.Canvas.prototype = {
    getTexture() {
        return this.canvas.toDataURL();
    },
    destroy() {},
};
window.Cesium && (Cesium.sampleTerrainMostDetailed = (a, b) => a.readyPromise.then(() => {
    for (var c = [], d = a.availability, e = 0; e < b.length; ++e) {
        let f = b[e],
            g = Math.min(d.computeMaximumLevelAtPosition(f), a.maximumLevel),
            h = c[g];
        h || (c[g] = h = []);
        h.push(f);
    }
    return Cesium.when.all(c.map((b, level) => {
        if (b) { return Cesium.sampleTerrain(a.baseProvider, level, b); }
    })).then(() => b);
}));
api.FlatRunwayTerrainProvider = function(a) {
    const b = this;
    this.baseProvider = a.baseProvider;
    this.regions = {};
    this.tiles = {};
    this.minFlatteningLevel = this.defaultMinFlatteningLevel = 6;
    this.maximumLevel = 13;
    this.defaultMaximumLevel = a.maximumLevel || this.maximumLevel;
    this.flatten = !a.bypass;
    this.setMaximumLevel(this.maximumLevel);
    a = () => {
        b.regions = {};
        for (const a in geofs.runways.nearRunways) { b.addRunway(geofs.runways.nearRunways[a]); }
    };
    $(document).on('runwayUpdate', a);
    a();
};
api.FlatRunwayTerrainProvider.prototype = {
    aName: 'FlatRunwayTerrainProvider',
    get availability() {
        return this.baseProvider.availability;
    },
    get credit() {
        return this.baseProvider.credit;
    },
    get errorEvent() {
        return this.baseProvider.errorEvent;
    },
    get hasVertexNormals() {
        return this.baseProvider.hasVertexNormals;
    },
    get hasWaterMask() {
        return this.baseProvider.hasWaterMask;
    },
    get ready() {
        return this.baseProvider.ready;
    },
    get readyPromise() {
        return this.baseProvider.readyPromise;
    },
    get tilingScheme() {
        return this.baseProvider.tilingScheme;
    },
    getLevelMaximumGeometricError(a) {
        return this.baseProvider.getLevelMaximumGeometricError(a);
    },
    getTileDataAvailable(a, b, c) {
        return c > this.maximumLevel || c > this.defaultMaximumLevel ? !1 : this.baseProvider.getTileDataAvailable(a, b, c);
    },
    setMaximumLevel(a) {
        a > this.defaultMaximumLevel && (a = this.defaultMaximumLevel);
        this.minFlatteningLevel = a < this.defaultMinFlatteningLevel ? a : this.defaultMinFlatteningLevel;
        this.maximumLevel = a;
    },
    addRunway(a) {
        let b = xy2ll([a.padding, a.padding], a.threshold1);
        a.rec = Cesium.Rectangle.fromDegrees(Math.min(a.threshold1[1], a.threshold2[1]) - b[1], Math.min(a.threshold1[0], a.threshold2[0]) - b[0], Math.max(a.threshold1[1], a.threshold2[1]) + b[1], Math.max(a.threshold1[0], a.threshold2[0]) + b[0]);
        a.threshold1Cartesian = Cesium.Cartesian3.fromDegrees(a.threshold1[1], a.threshold1[0]);
        a.threshold2Cartesian = Cesium.Cartesian3.fromDegrees(a.threshold2[1], a.threshold2[0]);
        a.direction = Cesium.Cartesian3.subtract(a.threshold1Cartesian, a.threshold2Cartesian, new Cesium.Cartesian3());
        a = {
            name: a.id,
            rec: a.rec,
            runways: [a],
            vertices: {},
        };
        for (const c in this.regions) {
            b = this.regions[c],
                void 0 !== Cesium.Rectangle.intersection(b.rec, a.rec) && (a.rec = Cesium.Rectangle.union(a.rec, b.rec),
                    a.name += b.name,
                    a.runways = a.runways.concat(b.runways),
                    delete this.regions[c]);
        }
        this.regions[a.name] = a;
    },
    requestTileGeometry(a, b, c, d) {
        if (c >= this.minFlatteningLevel && this.flatten) {
            let e = this.baseProvider.tilingScheme.tileXYToRectangle(a, b, c),
                f;
            for (f in this.regions) {
                if (void 0 !== Cesium.Rectangle.intersection(this.regions[f].rec, e)) {
                    return a = this.baseProvider.requestTileGeometry(a, b, c, d),
                        void 0 === a ? void 0 : this.getPromise(a, e, this.regions[f]);
                }
            }
        }
        return this.baseProvider.requestTileGeometry(a, b, c, d);
    },
    getPromise(a, b, c) {
        const d = this;
        if (void 0 !== a) {
            const e = new Promise(((a, b) => {
                if (c.referenceElevation) { a(c.referenceElevation); } else {
                    const e = Cesium.sampleTerrain(d.baseProvider, d.maximumLevel, [Cesium.Cartographic.fromDegrees(c.runways[0].threshold1[1], c.runways[0].threshold1[0])]);
                    Cesium.when(e, (d) => {

                        d[0] && d[0].height ? (c.referenceElevation = d[0].height,
                            a(c.referenceElevation)) : b('no value');
                    });
                }
            }), );
            return Promise.all([e, a]).then((a) => {
                try {
                    let d = a[0],
                        e = a[1];
                    for (a = 0; a < c.runways.length; a++) {
                        let f = c.runways[a],
                            n = !1;
                        e._oldMinimumHeight = e._minimumHeight;
                        e._oldMaximumHeight = e._maximumHeight;
                        const v = 32767 / (e._oldMaximumHeight - e._oldMinimumHeight);
                        d > e._maximumHeight && (e._maximumHeight = d,
                            n = !0);
                        d < e._minimumHeight && (e._minimumHeight = d,
                            n = !0);
                        for (let z = e._oldMinimumHeight - e._minimumHeight, A = 32767 / (e._maximumHeight - e._minimumHeight), C = (d - e._minimumHeight) * A, w = 0; w < e._heightValues.length; w++) {
                            let y = b.south + e._quantizedVertices[e._heightValues.length + w] / 32767 * b.height,
                                D = b.west + e._quantizedVertices[w] / 32767 * b.width;
                            if (Cesium.Rectangle.contains(c.rec, new Cesium.Cartographic(D, y, 0))) {
                                const B = Cesium.Cartesian3.fromRadians(D, y);
                                Cesium.Cartesian3.subtract(f.threshold1Cartesian, B, B);
                                let t = Cesium.Cartesian3.magnitude(B),
                                    m = Cesium.Cartesian3.multiplyByScalar(f.direction, Cesium.Cartesian3.dot(B, f.direction) / Cesium.Cartesian3.dot(f.direction, f.direction), new Cesium.Cartesian3()),
                                    O = Cesium.Cartesian3.subtract(B, m, new Cesium.Cartesian3());
                                if (Math.sqrt(Cesium.Cartesian3.dot(O, O)) < f.padding && t < f.lengthMeters + f.padding) {
                                    e._heightValues[w] = C;
                                    continue;
                                }
                            }
                            n && (e._heightValues[w] = (e._heightValues[w] / v + z) * A);
                        }
                    }
                    return e;
                } catch (Y) {
                    geofs.debug.log(`FlatRunwayTerrainProvider promise: ${Y}`);
                }
            });
        }
    },
};
api.add3dBuildings = () => {
    api.viewer.terrainProvider = api.flatRunwayTerrainProviderInstance = new api.FlatRunwayTerrainProvider({
        baseProvider: new GeoVis.GeoserverTerrainProvider({
            url: "http://syy.geovisweb.cn:10088/geoserver/wms",
            layerName: "GlobalTerrain:pyramid32",
            maxLevel: 11,
            service: "WMS",
            scale: 1,
            landScale: 1,
            oceanScale: 1,
            waterMask: true
        }),
    });
    geofs.useSimpleShadow(!0);
    api.buildings = [];
    [29328, 29331, 29332, 29333, 29334, 29335].forEach((a) => {
        api.buildings.push(api.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
            url: Cesium.IonResource.fromAssetId(a),
        })));
    });
};
api.map = function(a, b, c) {
    const d = this;
    a.zoom = a.zoom || 10;
    //寻找leaflet的容器，geofs-map-viewport
    this._holder = a.holder || document.getElementById("autopilotMap")
        // this._holder = a.holder || $('.map')[0];
    this.map = L.map(this._holder, {
        minZoom: 3,
        maxZoom: 13,
        preferCanvas: !0,
    });
    this.map.on('click', function(e) {
        e.latlng.lat //纬度
        e.latlng.lng
    });
    L.tileLayer(geofs.mapXYZ, {
        //  attribution: '\u00a9 OpenStreetMap contributors - Made with Natural Earth.',
        attribution: '',
    }).addTo(this.map);
    this.icons = {
        yellow: [],
        blue: [],
        traffic: [],
    };
    for (let e = 0; e < 36; e++) {
        let f = `${e}`;
        f = (`00${f}`).substring(f.length);
        this.icons.yellow.push(L.icon({
            iconUrl: `${geofs.localUrl}images/map/icons/yellow/icon00${f}.png`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, 0],
        }));
        this.icons.blue.push(L.icon({
            iconUrl: `${geofs.localUrl}images/map/icons/blue/icon00${f}.png`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, 0],
        }));
        this.icons.traffic.push(L.icon({
            iconUrl: `${geofs.localUrl}images/map/icons/blue/icon00${f}.png`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, 0],
            className: 'geofs-traffic-icon',
        }));
    }
    this.map.on('load zoomend resize moveend', () => {
        d.updateMarkerLayers();
    });
    this.map.getPanes().overlayPane.style.opacity = 0.7;
    this.map.setView(L.latLng(b, c), a.zoom);
};
api.createPath = function() {
    if (api.map.flightPathOn) {
        api.map.stopCreatePath(api.map)
    } else {
        api.map.createPath(ui.mapInstance.apiMap);
    }
};
api.clearPath = function() {
    api.map.clearPath(ui.mapInstance.apiMap);
};
api.map.runwayMarkerRadius = 5;
api.map.defaultLayer = {
    minZoom: 0,
    maxZoom: 15,
    tileSize: 10,
    tiles: {},
};
api.map.prototype = {
    init() {
        this.updateMarkerLayers();
        api.map.instance = this;
    },
    updateMap(a, b) {
        this.map.panTo(L.latLng(a, b));
    },
    addLayeredMarker(a, b, c, d) {
        c = geofs.getLatLonMatrixcoord(c, d, api.map.runwayLayers[a].tileSize);
        api.map.runwayLayers[a] || (api.map.runwayLayers[a] = Object.assign({}, api.map.defaultLayer));
        api.map.runwayLayers[a].visibileTiles = {};
        api.map.runwayLayers[a].tiles[c] || (api.map.runwayLayers[a].tiles[c] = []);
        api.map.runwayLayers[a].tiles[c].push(b);
    },
    getVisibleTiles(a, b) {
        let c = a.getNorthEast().wrap(),
            d = a.getSouthWest().wrap();
        a = Math.floor(d.lng / b);
        let e = Math.floor(d.lat / b),
            f = (parseInt((c.lng - d.lng) / b) || 1) + 2;
        b = (parseInt((c.lat - d.lat) / b) || 1) + 2;
        c = {};
        for (d = a; d < a + f; d++) {
            for (let g = e; g < e + b; g++) { c[`${g}/${d}`] = !0; }
        }
        return c;
    },
    showTile(a, b) {
        const c = this;
        a.visibileTiles && !a.visibileTiles[b] && a.tiles[b] && (a.tiles[b].forEach((a) => {
                a.marker || (a.marker = api.map.makeMarker(a));
                a.marker.addTo(c.map);
            }),
            a.visibileTiles[b] = a.tiles[b]);
    },
    hideTile(a, b) {
        a.visibileTiles && a.visibileTiles[b] && a.tiles[b] && (a.tiles[b].forEach((a) => {
                a.marker && a.marker.remove();
            }),
            delete a.visibileTiles[b]);
    },
    updateMarkerLayers() {
        let a = this.map.getZoom(),
            b;
        for (b in api.map.runwayLayers) {
            const c = api.map.runwayLayers[b];
            if (a > c.minZoom && a < c.maxZoom) {
                const d = this.getVisibleTiles(this.map.getBounds(), c.tileSize);
                var e;
                for (e in c.visibileTiles) { d[e] || this.hideTile(c, e); }
                for (e in d) { this.showTile(c, e); }
            } else {
                for (e in c.visibileTiles) { this.hideTile(c, e); }
            }
        }
    },
    setGenericLocationPopup() {
        let a = this,
            b = L.popup();
        this.map.on('contextmenu click', (c) => {
            if (c.originalEvent.button == 2 || geofs.isApp) {
                b.closePopup();
                const d = `${c.latlng.lat},${c.latlng.lng}`;
                b.setContent(`<div class="geofs-map-popup"><ul><li><a href="http://flyto://${d}, 0, 0, true">On the ground</a></li><li><a href="http://flyto://${d}, 304, 0, true">At 1,000 feet</a></li><li><a href="http://flyto://${d}, 914, 0, true">At 3,000 feet</a></li><li><a href="http://flyto://${d}, 3048, 0, true">At 10,000 feet</a></li><li><a href="http://flyto://${d}, 6096, 0, true">At 20,000 feet</a></li><li><a href="http://flyto://${d}, 9144, 0, true">At 30,000 Feet</a></li></ul></div>`).setLatLng(c.latlng).openOn(a.map);
                c.originalEvent.preventDefault();
            }
        });
    },
    mapClickHandler(a) {
        let b = a.target.getAttribute('href');
        if (b && (b = b.split('://'),
                b[1] == 'flyto')) {
            b = b[2].split(',');
            let c = parseFloat(b[3]),
                d = [parseFloat(b[0]), parseFloat(b[1]), parseFloat(b[2]), c];
            b[4] == 'approach' ? (c *= DEGREES_TO_RAD,
                c = xy2ll(V2.scale([Math.sin(c), Math.cos(c)], parseFloat(b[5])), d),
                d[0] -= c[0],
                d[1] -= c[1],
                //将英尺转为米
                d[2] = d[2] * FEET_TO_METERS + parseFloat(b[6]),
                d[4] = !0) : d[4] = b[4];
            geofs.flyTo(d);
            a.preventDefault();
        }
    },
};
api.map.runwayLayers = {
    major: {
        minZoom: 6,
        maxZoom: 15,
        tileSize: 5,
        tiles: {},
    },
    minor: {
        minZoom: 8,
        maxZoom: 15,
        tileSize: 5,
        tiles: {},
    },
};
api.map.majorRunwayMarkers = [];
api.map.minorRunwayMarkers = [];
api.map.addRunwayMarker = (a, b) => {
    let c = `${a[2]},${a[3]}`,
        d = a[5];
    b.addLayeredMarker(d ? 'major' : 'minor', {
        lat: a[2],
        lon: a[3],
        options: {
            radius: api.map.runwayMarkerRadius,
            color: '#000000',
            weight: 1,
            fillColor: d ? '#9797ff' : '#ffff99',
            fillOpacity: 1,
            pane: 'overlayPane',
        },
        popupContent: `<div class="geofs-map-popup"><b>${a[0]}</b><br><a href="http://flyto://${c},0,${a[1]}">Take-off from</a><a href="http://flyto://${c},1000,${a[1]}">Fly by</a><a href="http://flyto://${c},${a[4]},${a[1]},approach,4800,450">Approach</a></div>`,
    }, a[2], a[3]);
};
api.map.makeMarker = a => L.circleMarker(L.latLng(a.lat, a.lon), a.options).bindPopup(a.popupContent);
api.map.planeMarker = function(a, b, c, d, e, f) {
    this.style = d = d || 'blue';
    this.apiMap = c;
    this._marker = L.marker(L.latLng(a, b), {
        icon: c.icons[d][0],
        title: f,
        zIndexOffset: e,
    }).addTo(c.map);
};
api.map.planeMarker.prototype = {
    updatePlaneMarker(a, b, c, d) {
        this._marker.setLatLng(L.latLng(a, b));
        d && (this._marker._icon.title = d);
        a = this.apiMap.icons[this.style][Math.floor(fixAngle360(c) / 10)];
        this._marker.setIcon(a);
    },
    destoryPlaneMarker() {
        this._marker && this._marker.remove();
    },
};
api.map.autoFlight = function() {
    if (api.map.flightPath !== null) {
        var start = api.map.flightPath._latlngs[0]
        var end = api.map.flightPath._latlngs[1]
        var angle = GetAzimuth(start, end)
        controls.autopilot.heading = angle;
        let destination = [start.lat, start.lng, 0, 0, "true"]
        geofs.flyTo(destination)
        controls.autopilot.turnOn()
        let autoFlightJudge = setInterval(function() {
            if (api.map.flightPath !== null) {
                let llaLocation = [geofs.aircraft.instance.llaLocation[0], geofs.aircraft.instance.llaLocation[1]]
                let autoLocation = controls.autopilot.autoLocation
                let destination = api.map.flightPath._latlngs[autoLocation + 1]
                if (autoLocation === api.map.flightPath._latlngs.length - 1) {
                    clearInterval(autoFlightJudge);
                    controls.autopilot.autoLocation = 0
                    controls.autopilot.kias = 0
                    return;
                }
                var distance = GetDistanceTwo(destination, llaLocation)
                if (distance <= 200) {
                    controls.autopilot.autoLocation++;
                    autoLocation = controls.autopilot.autoLocation
                    var start = api.map.flightPath._latlngs[autoLocation]
                        // let destination = [start.lat, start.lng, 0, 0, "true"]
                        //  geofs.flyTo(destination)
                    var end = api.map.flightPath._latlngs[autoLocation + 1]
                    var angle = GetAzimuth(start, end)
                    controls.autopilot.heading = angle;
                }
            }
        }, 100)
    }
}
api.map.flightPath = null;
api.map.flightPathOn = !1;
api.map.createPath = (a, b) => {
    const c = {
        weight: 5,
    };
    api.map.flightPath || (api.map.flightPath = L.Polyline.Plotter(b || [], c).addTo(a.map));
    // api.flightPath._latlngs=>飞行路径点
    api.map.flightPath.setReadOnly(!1);
    $('.geofs-createPath').addClass('on');
    $('.geofs-clearPath').show();
    api.map.flightPathOn = !0;
};
api.map.stopCreatePath = () => {
    api.map.flightPath && (api.map.flightPath.setReadOnly(!0),
        $('.geofs-createPath').removeClass('on'),
        api.map.flightPathOn = !1);
};
api.map.clearPath = () => {
    api.map.flightPath && (api.map.stopCreatePath(),
        api.map.flightPath.remove(),
        api.map.flightPath = null,
        $('.geofs-clearPath').hide());
};
api.map.getPathPoints = () => {
    if (api.map.flightPath) {
        const a = [];
        api.map.flightPath.getLatLngs().forEach((b) => {
            a.push([b.lat, b.lng]);
        });
        return a;
    }
};
api.map.setPathPoints = a => {
    api.map.instance && (api.map.clearPath(),
        api.map.createPath(api.map.instance, a));
};
api.reverserGeocode = (a, b) => {
    $.getJSON(`https://api.opencagedata.com/geocode/v1/json?q=${a}&key=f7681dd621b540a6847d2dae0dc33a99`, (a) => {
        try {
            if (a.results && a.results.length > 0) {
                const c = a.results[0].geometry;
                b(c.lat, c.lng);
            }
        } catch (e) {}
    });
};
export default api;