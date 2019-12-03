//提供一些初始化的参数->>>键码 . 风速风向。
//数据保存在本地，序列化（对象，字符串）保存
import controls from "../modules/controls";
import { clone } from "../utils/utils";

function hackGeoFS(geofs) {
    geofs.preferences = {};
    geofs.userRecord = geofs.userRecord || {};
    geofs.preferencesDefault = {
        aircraft: '',
        coordinates: '',
        controlMode: 'keyboard',
        keyboard: {
            sensitivity: 1,
            exponential: 0,
            mixYawRoll: !0,
            mixYawRollQuantity: 1,
            keys: {
                'Bank left': {
                    keycode: 37,
                    label: '<Left Arrow>',
                },
                'Bank right': {
                    keycode: 39,
                    label: '<Right Arrow>',
                },
                'Pitch down': {
                    keycode: 38,
                    label: '<Up Arrow>',
                },
                'Pitch up': {
                    keycode: 40,
                    label: '<Down Arrow>',
                },
                'Steer left': {
                    keycode: 188,
                    label: '<',
                },
                'Steer right': {
                    keycode: 190,
                    label: '>',
                },
                Brakes: {
                    keycode: 32,
                    label: '<Space bar>',
                },
                'Parking brake': {
                    keycode: 186,
                    label: ';',
                },
                'Increase throttle': {
                    keycode: 107,
                    label: '+',
                },
                'Decrease throttle': {
                    keycode: 109,
                    label: '-',
                },
                PgUp: {
                    keycode: 33,
                    label: '<Page up>',
                },
                PgDwn: {
                    keycode: 34,
                    label: '<Page down>',
                },
                'Elevator trim up': {
                    keycode: 36,
                    label: '<Home>',
                },
                'Elevator trim down': {
                    keycode: 35,
                    label: '<End>',
                },
                'Elevator trim neutral': {
                    keycode: 46,
                    label: '<Delete>',
                },
                'Engine switch (on/off)': {
                    keycode: 69,
                    label: 'E',
                },
                'Gear toggle (up/down)': {
                    keycode: 71,
                    label: 'G',
                },
                'Lower flaps': {
                    keycode: 219,
                    label: '[',
                },
                'Raise flaps': {
                    keycode: 221,
                    label: ']',
                },
                'Airbrake toggle (on/off)': {
                    keycode: 66,
                    label: 'B',
                },
                'Optional Animated Part toggle (on/off)': {
                    keycode: 88,
                    label: 'X',
                },
            },
        },
        mouse: {
            sensitivity: 1,
            exponential: 1,
            mixYawRoll: !0,
            mixYawRollQuantity: 1,
        },
        joystick: {
            sensitivity: 1,
            exponential: 1,
            mixYawRoll: !1,
            mixYawRollQuantity: 1,
            axis: {
                pitch: 1,
                roll: 0,
                yaw: 5,
                throttle: 6,
            },
            multiplier: {
                pitch: !1,
                roll: !1,
                yaw: !1,
                throttle: !1,
            },
            buttons: {
                0: 'setBrakes',
                1: 'setElevatorTrimDown',
                2: 'setElevatorTrimUp',
                3: 'setFlapsUp',
                4: 'setFlapsDown',
                5: 'setGear',
                6: 'setAirbrakes',
                7: 'setOptionalAnimatedPart',
            },
        },
        orientation: {
            sensitivity: 1,
            exponential: 1,
            mixYawRoll: !0,
            mixYawRollQuantity: 1,
            axis: {
                pitch: 0,
                roll: 1,
                yaw: 2,
            },
            multiplier: {
                pitch: !1,
                roll: !1,
                yaw: !1,
            },
        },
        touch: {
            sensitivity: 0.2,
            exponential: 1.5,
            mixYawRoll: !0,
            mixYawRollQuantity: 1,
            axis: {
                pitch: 0,
                roll: 1,
                yaw: 2,
            },
            multiplier: {
                pitch: !1,
                roll: !1,
                yaw: !1,
            },
        },
        camera: {
            headMotion: !1,
        },
        weather: {
            advanced: {
                clouds: 0,
                fog: 0,
                windSpeedMS: 0,
                windDirection: 0
            },
            sun: !1,
            localTime: 12,
            season: 0,
            manual: !0,
            quality: 0,
            customWindActive: !1,
            windSpeed: 0,
            windDirection: 0,
            randomizeWind: !0,
        },
        graphics: {
            quality: 3,
            enhanceColors: 0.7,
            waterEffect: !1,
            simpleShadow: !1,
            forceSimpleShadow: !1,
            HD: !0,
        },
        crashDetection: !1,
        showPapi: !0,
        adsb: !0,
        sound: !0,
    };
    geofs.preferencesKeycodeLookup = {
        8: '<Back space>',
        9: '<Tab>',
        13: '<Enter>',
        16: '<Shift>',
        17: '<Control>',
        18: '<Alt>',
        19: '<Break>',
        20: '<Caps Lock>',
        32: '<Space bar>',
        33: '<Page up>',
        34: '<Page down>',
        35: '<End>',
        36: '<Home>',
        37: '<Left Arrow>',
        38: '<Up Arrow>',
        39: '<Right Arrow>',
        40: '<Down Arrow>',
        44: '<Print scr>',
        45: '<Insert>',
        46: '<Delete>',
        110: '<Delete>',
        112: 'F1',
        113: 'F2',
        114: 'F3',
        115: 'F4',
        116: 'F5',
        117: 'F6',
        118: 'F7',
        119: 'F8',
        120: 'F9',
        121: 'F10',
        122: 'F11',
        123: 'F12',
        144: '<Num lock>',
        145: '<Scroll Lock>',
    };
    //生成geofs.localSotrage
    geofs.initPreferences = function() {
        geofs.localStorage = window.localStorage || {};
    };
    geofs.savePreferences = function() {
        geofs.aircraft.instance && (geofs.preferences.coordinates = geofs.aircraft.instance.getCurrentCoordinates(),
            geofs.aircraft.instance.groundContact ? geofs.preferences.coordinates[2] = 0 : geofs.preferences.coordinates[4] = !0);
        const a = serialize(geofs.preferences);
        try {
            geofs.localStorage.setItem('preferences', a);
        } catch (b) {
            geofs.debug.error(b, 'Could not save preferences');
        }
    };
    geofs.resetPreferences = function() {
        geofs.preferences = clone(geofs.preferencesDefault);
        geofs.preferences.version = geofs.version;
        geofs.savePreferences();
    };
    //从localStorage读取，失败时，初始化为默认配置
    geofs.readPreferences = function(a) {
        let b = geofs.localStorage.getItem('preferences'),
            c = b || {};
        try {
            c = eval(c),
                c = c[0];
        } catch (d) {
            geofs.debug.error(d, 'geofs.readPreferences'),
                alert('Unable to read saved preferendes. Preferences are reset to default.'),
                c == {};
        }
        geofs.preferences.version = geofs.version;
        geofs.preferences = $.extend(!0, {}, geofs.preferencesDefault, c);
        geofs.preferences.graphics.waterEffect = !1;
        geofs.userRecord.id || (geofs.preferences.chat = !1);
        a && a();
    };

    function serialize(a) {
        var b = function(a) {
            if ("undefined" !== typeof a.toSource && "undefined" === typeof a.callee)
                return a.toSource();
            switch (typeof a) {
                case "number":
                case "boolean":
                case "function":
                    return a;
                case "string":
                    return "'" + a + "'";
                case "object":
                    if (geofs.isArray(a) || "undefined" !== typeof a.callee) {
                        var c = "[";
                        var e, f = a.length;
                        for (e = 0; e < f - 1; e++)
                            c += b(a[e]) + ",";
                        c += b(a[e]) + "]"
                    } else {
                        c = "{";
                        for (e in a)
                            c += "'" + e + "':" + b(a[e]) + ",";
                        c = c.replace(/,$/, "") + "}"
                    }
                    return c;
                default:
                    return "UNKNOWN"
            }
        };
        return "[" + b(a) + "]"
    }
}
export default hackGeoFS;