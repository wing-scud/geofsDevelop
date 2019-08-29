/* eslint-disable */
import Indicator from './Indicator'
import camera from './camera'
var  instruments = window.instruments || {};
var PAGE_PATH = 'http://localhost:3030/proxy/';
    //var PAGE_PATH = document.location.href.replace(/\/[^\/]+$/, '/');
instruments.stackPosition = {
    x: 0,
    y: 0,
};
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
instruments.margins = [0, 0, 0, 0];
instruments.defaultMargin = 10;
instruments.visible = !0;
instruments.list = {};
instruments.gaugeOverlayPosition = [0, 0, 0];
instruments.gaugeOverlayOrigin = [20, 200, 0.8];
instruments.definitions = {
    airspeed: {
        stackX: !0,
        overlay: {
            url: `${PAGE_PATH}/images/instruments/airspeed.png`,
            size: {
                x: 200,
                y: 200,
            },
            anchor: {
                x: 100,
                y: 100,
            },
            position: {
                x: 0,
                y: 110,
            },
            rescale: !0,
            rescalePosition: !0,
            overlays: [{
                animations: [{
                    type: 'rotate',
                    value: 'kias',
                    ratio: -1.5,
                    min: 0,
                }],
                url: `${PAGE_PATH}images/instruments/airspeed-hand.png`,
                anchor: {
                    x: 10,
                    y: 34,
                },
                size: {
                    x: 20,
                    y: 120,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }],
        },
    },
    airspeedJet: {
        stackX: !0,
        overlay: {
            url: `${PAGE_PATH}images/instruments/airspeed-high.png`,
            size: {
                x: 200,
                y: 200,
            },
            anchor: {
                x: 100,
                y: 100,
            },
            position: {
                x: 0,
                y: 110,
            },
            rescale: !0,
            rescalePosition: !0,
            overlays: [{
                animations: [{
                    type: 'rotate',
                    value: 'kias',
                    ratio: -0.6,
                    min: 0,
                }],
                url: `${PAGE_PATH}images/instruments/airspeed-hand.png`,
                anchor: {
                    x: 10,
                    y: 34,
                },
                size: {
                    x: 20,
                    y: 120,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }],
        },
    },
    airspeedSupersonic: {
        stackX: !0,
        overlay: {
            url: `${PAGE_PATH}images/instruments/airspeed-supersonic.png`,
            size: {
                x: 200,
                y: 200,
            },
            anchor: {
                x: 100,
                y: 100,
            },
            position: {
                x: 0,
                y: 110,
            },
            rescale: !0,
            rescalePosition: !0,
            overlays: [{
                animations: [{
                    type: 'rotate',
                    value: 'kias',
                    ratio: -0.3,
                    min: 0,
                }],
                url: `${PAGE_PATH}images/instruments/airspeed-hand.png`,
                anchor: {
                    x: 10,
                    y: 34,
                },
                size: {
                    x: 20,
                    y: 120,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }, {
                animations: [{
                    type: 'rotate',
                    value: 'mach',
                    ratio: -72,
                    min: 0,
                }],
                url: `${PAGE_PATH}images/instruments/mach-hand.png`,
                anchor: {
                    x: 5,
                    y: 5,
                },
                size: {
                    x: 11,
                    y: 31,
                },
                position: {
                    x: -70,
                    y: -70,
                },
            }],
        },
    },
    altitude_legacy: {
        stackX: !0,
        overlay: {
            url: `${PAGE_PATH}images/instruments/altitude.png`,
            size: {
                x: 200,
                y: 200,
            },
            anchor: {
                x: 100,
                y: 100,
            },
            position: {
                x: 0,
                y: 110,
            },
            rescale: !0,
            rescalePosition: !0,
            overlays: [{
                animations: [{
                    type: 'rotate',
                    value: 'altitude',
                    ratio: -0.0036,
                }],
                url: `${PAGE_PATH}images/instruments/tenthousandhand.png`,
                anchor: {
                    x: 8,
                    y: 0,
                },
                size: {
                    x: 16,
                    y: 91,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }, {
                animations: [{
                    type: 'rotate',
                    value: 'altitude',
                    ratio: -0.036,
                }],
                url: `${PAGE_PATH}images/instruments/small-hand.png`,
                anchor: {
                    x: 10,
                    y: 28,
                },
                size: {
                    x: 20,
                    y: 87,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }, {
                animations: [{
                    type: 'rotate',
                    value: 'altitude',
                    ratio: -0.36,
                }],
                url: `${PAGE_PATH}images/instruments/airspeed-hand.png`,
                anchor: {
                    x: 10,
                    y: 34,
                },
                size: {
                    x: 20,
                    y: 120,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }],
        },
    },
    altitude: {
        stackX: !0,
        overlay: {
            url: `${PAGE_PATH}images/instruments/altitude2/background.png`,
            size: {
                x: 200,
                y: 200,
            },
            anchor: {
                x: 100,
                y: 100,
            },
            position: {
                x: 0,
                y: 110,
            },
            rescale: !0,
            rescalePosition: !0,
            overlays: [{
                animations: [{
                    type: 'rotate',
                    value: 'altitude',
                    ratio: -0.011,
                    preoffset: -1E4,
                    min: 1E4,
                    max: 15E3,
                }],
                url: `${PAGE_PATH}images/instruments/altitude2/stripe_mask.png`,
                anchor: {
                    x: 58,
                    y: 54,
                },
                size: {
                    x: 116,
                    y: 111,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }, {
                animations: [{
                    type: 'rotate',
                    value: 'altitude',
                    ratio: -0.0036,
                }],
                url: `${PAGE_PATH}images/instruments/tenthousandhand.png`,
                anchor: {
                    x: 8,
                    y: 0,
                },
                size: {
                    x: 16,
                    y: 91,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }, {
                animations: [{
                    type: 'rotate',
                    value: 'altitude',
                    ratio: -0.036,
                }],
                url: `${PAGE_PATH}images/instruments/small-hand.png`,
                anchor: {
                    x: 10,
                    y: 28,
                },
                size: {
                    x: 20,
                    y: 87,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }, {
                animations: [{
                    type: 'rotate',
                    value: 'altitude',
                    ratio: -0.36,
                }],
                url: `${PAGE_PATH}images/instruments/airspeed-hand.png`,
                anchor: {
                    x: 10,
                    y: 34,
                },
                size: {
                    x: 20,
                    y: 120,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }, {
                url: `${PAGE_PATH}images/instruments/altitude2/shine.png`,
                size: {
                    x: 200,
                    y: 200,
                },
                anchor: {
                    x: 100,
                    y: 100,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }],
        },
    },
    vario: {
        stackX: !0,
        overlay: {
            url: `${PAGE_PATH}images/instruments/vario.png`,
            size: {
                x: 200,
                y: 200,
            },
            anchor: {
                x: 100,
                y: 100,
            },
            position: {
                x: 0,
                y: 110,
            },
            rescale: !0,
            rescalePosition: !0,
            overlays: [{
                animations: [{
                    type: 'rotate',
                    value: 'climbrate',
                    ratio: -0.09,
                    max: 1900,
                    min: -1900,
                    offset: 90,
                }],
                url: `${PAGE_PATH}images/instruments/airspeed-hand.png`,
                anchor: {
                    x: 10,
                    y: 34,
                },
                size: {
                    x: 20,
                    y: 120,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }],
        },
    },
    varioJet: {
        stackX: !0,
        overlay: {
            url: `${PAGE_PATH}images/instruments/vario-high.png`,
            size: {
                x: 200,
                y: 200,
            },
            anchor: {
                x: 100,
                y: 100,
            },
            position: {
                x: 0,
                y: 110,
            },
            rescale: !0,
            rescalePosition: !0,
            overlays: [{
                animations: [{
                    type: 'rotate',
                    value: 'climbrate',
                    ratio: -0.025,
                    max: 6E3,
                    min: -6E3,
                    offset: 90,
                }],
                url: `${PAGE_PATH}images/instruments/airspeed-hand.png`,
                anchor: {
                    x: 10,
                    y: 34,
                },
                size: {
                    x: 20,
                    y: 120,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }],
        },
    },
    compass: {
        stackX: !0,
        overlay: {
            url: `${PAGE_PATH}images/instruments/compass.png`,
            size: {
                x: 200,
                y: 200,
            },
            anchor: {
                x: 100,
                y: 100,
            },
            position: {
                x: 0,
                y: 110,
            },
            rescale: !0,
            rescalePosition: !0,
            overlays: [{
                animations: [{
                    type: 'rotate',
                    value: 'heading',
                    ratio: 1,
                }],
                url: `${PAGE_PATH}images/instruments/compass-grad.png`,
                anchor: {
                    x: 90,
                    y: 90,
                },
                size: {
                    x: 181,
                    y: 181,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }, {
                url: `${PAGE_PATH}images/instruments/compass-hand.png`,
                anchor: {
                    x: 25,
                    y: 26,
                },
                size: {
                    x: 50,
                    y: 109,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }],
        },
    },
    attitude: {
        stackX: !0,
        overlay: {
            url: `${PAGE_PATH}images/instruments/attitude.png`,
            size: {
                x: 200,
                y: 200,
            },
            anchor: {
                x: 100,
                y: 100,
            },
            position: {
                x: 0,
                y: 110,
            },
            rescale: !0,
            rescalePosition: !0,
            overlays: [{
                animations: [{
                    type: 'rotate',
                    value: 'aroll',
                    name: 'attitude',
                    ratio: -1,
                    min: -50,
                    max: 50,
                }, {
                    type: 'translateY',
                    value: 'atilt',
                    ratio: -2,
                    offset: 75,
                    min: -25,
                    max: 25,
                }],
                url: `${PAGE_PATH}images/instruments/attitude-hand.png`,
                anchor: {
                    x: 100,
                    y: 75,
                },
                size: {
                    x: 200,
                    y: 300,
                },
                position: {
                    x: 0,
                    y: 0,
                },
                iconFrame: {
                    x: 200,
                    y: 150,
                },
            }, {
                animations: [{
                    type: 'rotate',
                    value: 'aroll',
                    ratio: -1,
                    min: -60,
                    max: 60,
                }],
                url: `${PAGE_PATH}images/instruments/attitude-grad.png`,
                anchor: {
                    x: 100,
                    y: 100,
                },
                size: {
                    x: 200,
                    y: 200,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }, {
                url: `${PAGE_PATH}images/instruments/attitude-pointer.png`,
                anchor: {
                    x: 100,
                    y: 100,
                },
                size: {
                    x: 200,
                    y: 200,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }],
        },
    },
    attitudeJet: {
        stackX: !0,
        overlay: {
            url: `${PAGE_PATH}images/instruments/attitude-jet.png`,
            size: {
                x: 200,
                y: 200,
            },
            anchor: {
                x: 100,
                y: 100,
            },
            position: {
                x: 0,
                y: 110,
            },
            rescale: !0,
            rescalePosition: !0,
            overlays: [{
                animations: [{
                    type: 'rotate',
                    value: 'aroll',
                    ratio: -1,
                    min: -180,
                    max: 180,
                }, {
                    type: 'translateY',
                    value: 'atilt',
                    ratio: -2,
                    offset: 330,
                    min: -90,
                    max: 90,
                }],
                url: `${PAGE_PATH}images/instruments/attitude-jet-hand.png`,
                anchor: {
                    x: 100,
                    y: 70,
                },
                size: {
                    x: 200,
                    y: 800,
                },
                position: {
                    x: 0,
                    y: 0,
                },
                iconFrame: {
                    x: 200,
                    y: 140,
                },
            }, {
                animations: [{
                    type: 'rotate',
                    value: 'aroll',
                    ratio: -1,
                    min: -60,
                    max: 60,
                }],
                url: `${PAGE_PATH}images/instruments/attitude-jet-pointer.png`,
                anchor: {
                    x: 100,
                    y: 100,
                },
                size: {
                    x: 200,
                    y: 200,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }, {
                url: `${PAGE_PATH}images/instruments/attitude-jet.png`,
                anchor: {
                    x: 100,
                    y: 100,
                },
                size: {
                    x: 200,
                    y: 200,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }],
        },
    },
    rpmJet: {
        stackX: !0,
        overlay: {
            url: `${PAGE_PATH}images/instruments/jet-rpm.png`,
            size: {
                x: 200,
                y: 200,
            },
            anchor: {
                x: 100,
                y: 100,
            },
            position: {
                x: 0,
                y: 110,
            },
            rescale: !0,
            rescalePosition: !0,
            overlays: [{
                animations: [{
                    type: 'rotate',
                    value: 'rpm',
                    ratio: -0.036,
                    offset: 0,
                }],
                url: `${PAGE_PATH}images/instruments/jet-rpm-hand.png`,
                anchor: {
                    x: 6,
                    y: 15,
                },
                size: {
                    x: 14,
                    y: 34,
                },
                position: {
                    x: -38,
                    y: 45,
                },
            }, {
                animations: [{
                    type: 'rotate',
                    value: 'rpm',
                    ratio: -0.027,
                    offset: 0,
                }],
                url: `${PAGE_PATH}images/instruments/airspeed-hand.png`,
                anchor: {
                    x: 10,
                    y: 34,
                },
                size: {
                    x: 20,
                    y: 120,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }],
        },
    },
    rpm: {
        stackX: !0,
        overlay: {
            url: `${PAGE_PATH}images/instruments/rpm.png`,
            size: {
                x: 100,
                y: 100,
            },
            anchor: {
                x: 50,
                y: 50,
            },
            position: {
                x: 0,
                y: 110,
            },
            rescale: !0,
            rescalePosition: !0,
            overlays: [{
                animations: [{
                    type: 'rotate',
                    value: 'rpm',
                    ratio: -0.03,
                    offset: 120,
                }],
                url: `${PAGE_PATH}images/instruments/rpm-hand.png`,
                anchor: {
                    x: 14,
                    y: 14,
                },
                size: {
                    x: 28,
                    y: 55,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }],
        },
    },
    jetfuel: {
        overlay: {
            class: 'geofs-authenticated',
            url: `${PAGE_PATH}images/instruments/jet-fuel-gauge.png`,
            opacity: 1,
            alignment: {
                x: 'right',
                y: 'bottom',
            },
            size: {
                x: 100,
                y: 100,
            },
            anchor: {
                x: 60,
                y: 50,
            },
            position: {
                x: 80,
                y: 110,
            },
            rescale: !0,
            rescalePosition: !0,
            animations: [{
                type: 'opacity',
                value() {
                    return geofs.animation.values.jetfuel == 0 ? 0.5 : 1;
                },
            }],
            overlays: [{
                animations: [{
                    type: 'rotate',
                    value: 'jetfuel',
                    ratio: -0.118,
                    offset: 120,
                    min: 0,
                    max: 1E3,
                }],
                class: 'geofs-authenticated',
                url: `${PAGE_PATH}images/instruments/jet-fuel-hand.png`,
                anchor: {
                    x: 10,
                    y: 10,
                },
                size: {
                    x: 19,
                    y: 47,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }, {
                class: 'geofs-authenticated',
                url: `${PAGE_PATH}images/instruments/jet-fuel.png`,
                anchor: {
                    x: 0,
                    y: 0,
                },
                scale: {
                    x: 0.85,
                    y: 0.85,
                },
                size: {
                    x: 100,
                    y: 100,
                },
                position: {
                    x: -20,
                    y: -70,
                },
            }, {
                class: 'geofs-authenticated',
                size: {
                    x: 100,
                    y: 100,
                },
                anchor: {
                    x: 50,
                    y: 50,
                },
                animations: [{
                    type: 'title',
                    value: 'jetfuel',
                    concat: ' liters',
                }],
            }],
        },
    },
    wind: {
        overlay: {
            url: `${PAGE_PATH}images/instruments/wind-body.png`,
            opacity: 0.5,
            scale: {
                x: 0.5,
                y: 0.5,
            },
            position: {
                x: 120,
                y: 400,
            },
            anchor: {
                x: 100,
                y: 100,
            },
            size: {
                x: 200,
                y: 200,
            },
            alignment: {
                x: 'right',
                y: 'top',
            },
            rescale: !0,
            rescalePosition: !0,
            overlays: [{
                animations: [{
                    type: 'rotate',
                    value: 'relativeWind',
                    ratio: -1,
                }],
                url: `${PAGE_PATH}images/instruments/wind-hand.png`,
                anchor: {
                    x: 100,
                    y: 100,
                },
                size: {
                    x: 200,
                    y: 200,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }, {
                animations: [{
                    type: 'text',
                    value: 'windSpeedLabel',
                }],
                text: '-',
                class: 'geofs-center',
                anchor: {
                    x: 100,
                    y: 0,
                },
                size: {
                    x: 200,
                    y: 60,
                },
                position: {
                    x: 0,
                    y: -140,
                },
            }],
        },
    },
    spoilers: {
        overlay: {
            url: `${PAGE_PATH}images/instruments/spoilers.png`,
            visibility: !0,
            anchor: {
                x: 85,
                y: 0,
            },
            alignment: {
                x: 'right',
                y: 'bottom',
            },
            position: {
                x: 20,
                y: 195,
            },
            size: {
                x: 85,
                y: 21,
            },
            rescale: !0,
            rescalePosition: !0,
            animations: [{
                value: 'airbrakesPosition',
                type: 'show',
                gt: 0.1,
            }],
        },
    },
    brakes: {
        overlay: {
            url: `${PAGE_PATH}images/instruments/brakes.png`,
            visibility: !0,
            anchor: {
                x: 73,
                y: 0,
            },
            alignment: {
                x: 'right',
                y: 'bottom',
            },
            position: {
                x: 20,
                y: 170,
            },
            size: {
                x: 73,
                y: 19,
            },
            rescale: !0,
            rescalePosition: !0,
            animations: [{
                value: 'brakes',
                type: 'show',
                gt: 0.5,
            }],
        },
    },
    gear: {
        overlay: {
            url: `${PAGE_PATH}images/instruments/gear.png`,
            anchor: {
                x: 60,
                y: 0,
            },
            alignment: {
                x: 'right',
                y: 'bottom',
            },
            position: {
                x: 30,
                y: 230,
            },
            size: {
                x: 46,
                y: 16,
            },
            class: 'gear-overlay',
            rescale: !0,
            rescalePosition: !0,
            overlays: [{
                animations: [{
                    value: 'gearPosition',
                    type: 'show',
                    when: [0],
                }],
                url: `${PAGE_PATH}images/instruments/led-green.png`,
                anchor: {
                    x: 0,
                    y: 0,
                },
                size: {
                    x: 12,
                    y: 12,
                },
                position: {
                    x: -10,
                    y: 2,
                },
            }, {
                animations: [{
                    value: 'gearPosition',
                    type: 'show',
                    when: [1],
                }],
                url: `${PAGE_PATH}images/instruments/led-red.png`,
                anchor: {
                    x: 0,
                    y: 0,
                },
                size: {
                    x: 12,
                    y: 12,
                },
                position: {
                    x: -10,
                    y: 2,
                },
            }, {
                animations: [{
                    value: 'gearPosition',
                    type: 'show',
                    whenNot: [0, 1],
                }],
                url: `${PAGE_PATH}images/instruments/led-orange.png`,
                anchor: {
                    x: 0,
                    y: 0,
                },
                size: {
                    x: 12,
                    y: 12,
                },
                position: {
                    x: -10,
                    y: 2,
                },
            }],
        },
    },
    flaps: {
        overlay: {
            url: `${PAGE_PATH}images/instruments/flaps.png`,
            anchor: {
                x: 74,
                y: 0,
            },
            alignment: {
                x: 'right',
                y: 'bottom',
            },
            position: {
                x: 20,
                y: 260,
            },
            size: {
                x: 74,
                y: 23,
            },
            class: 'flaps-overlay',
            rescale: !0,
            rescalePosition: !0,
            overlays: [{
                animations: [{
                    type: 'rotate',
                    value: 'flapsValue',
                    ratio: -90,
                }],
                url: `${PAGE_PATH}images/instruments/flaps-hand.png`,
                anchor: {
                    x: 0,
                    y: 5,
                },
                size: {
                    x: 17,
                    y: 6,
                },
                position: {
                    x: -23,
                    y: 25,
                },
            }],
        },
    },
};
instruments.definitionsMobile = {
    airspeed_mini: {
        group: 'mini',
        stackX: !0,
        visibility: !1,
        overlay: {
            anchor: {
                x: 0,
                y: 0,
            },
            position: {
                x: 0,
                y: 20,
            },
            size: {
                x: 100,
                y: 19,
            },
            opacity: 0.5,
            class: 'control-pad',
            overlays: [{
                text: 'IAS',
                class: 'geofs-instrument-display-label',
                anchor: {
                    x: 0,
                    y: 0,
                },
                size: {
                    x: 50,
                    y: 20,
                },
                position: {
                    x: 5,
                    y: 0,
                },
            }, {
                text: 'kts',
                class: 'geofs-instrument-display-label',
                anchor: {
                    x: 0,
                    y: 0,
                },
                size: {
                    x: 20,
                    y: 20,
                },
                position: {
                    x: 80,
                    y: 0,
                },
            }, {
                animations: [{
                    type: 'text',
                    value: 'kias',
                    floor: !0,
                }],
                text: '0',
                class: 'geofs-instrument-display-value',
                anchor: {
                    x: 0,
                    y: 0,
                },
                size: {
                    x: 75,
                    y: 20,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }],
        },
        animations: [{
            value: 'view',
            type: 'show',
            notEq: 'cockpit',
        }],
    },
    altitude_mini: {
        group: 'mini',
        stackX: !0,
        visibility: !1,
        overlay: {
            anchor: {
                x: 0,
                y: 0,
            },
            position: {
                x: 0,
                y: 20,
            },
            size: {
                x: 120,
                y: 19,
            },
            opacity: 0.5,
            class: 'control-pad',
            overlays: [{
                text: 'ALT',
                class: 'geofs-instrument-display-label',
                anchor: {
                    x: 0,
                    y: 0,
                },
                size: {
                    x: 50,
                    y: 20,
                },
                position: {
                    x: 5,
                    y: 0,
                },
            }, {
                text: 'ft',
                class: 'geofs-instrument-display-label',
                anchor: {
                    x: 0,
                    y: 0,
                },
                size: {
                    x: 15,
                    y: 20,
                },
                position: {
                    x: 105,
                    y: 0,
                },
            }, {
                animations: [{
                    type: 'text',
                    value: 'altitude',
                    floor: !0,
                }],
                text: '0',
                class: 'geofs-instrument-display-value',
                anchor: {
                    x: 0,
                    y: 0,
                },
                size: {
                    x: 100,
                    y: 20,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }],
        },
        animations: [{
            value: 'view',
            type: 'show',
            notEq: 'cockpit',
        }],
    },
    compass_mini: {
        group: 'mini',
        stackX: !0,
        visibility: !1,
        overlay: {
            anchor: {
                x: 0,
                y: 0,
            },
            position: {
                x: 0,
                y: 20,
            },
            size: {
                x: 80,
                y: 19,
            },
            opacity: 0.5,
            class: 'control-pad',
            overlays: [{
                text: 'HDG',
                class: 'geofs-instrument-display-label',
                anchor: {
                    x: 0,
                    y: 0,
                },
                size: {
                    x: 50,
                    y: 20,
                },
                position: {
                    x: 5,
                    y: 0,
                },
            }, {
                animations: [{
                    type: 'text',
                    value: 'heading360',
                    floor: !0,
                }],
                text: '0',
                class: 'geofs-instrument-display-value',
                anchor: {
                    x: 0,
                    y: 0,
                },
                size: {
                    x: 35,
                    y: 20,
                },
                position: {
                    x: 40,
                    y: 0,
                },
            }],
        },
        animations: [{
            value: 'view',
            type: 'show',
            notEq: 'cockpit',
        }],
    },
    brakes: {
        group: 'controls',
        overlay: {
            anchor: {
                x: 50,
                y: 0,
            },
            alignment: {
                x: 'right',
                y: 'bottom',
            },
            position: {
                x: 10,
                y: 10,
            },
            size: {
                x: 50,
                y: 50,
            },
            opacity: 0.5,
            class: 'control-pad brakes-overlay',
            overlays: [{
                animations: [{
                    value: 'brakes',
                    type: 'show',
                    when: [1],
                }],
                class: 'control-pad-label orange-pad',
                text: 'ON',
                anchor: {
                    x: 50,
                    y: 0,
                },
                size: {
                    x: 50,
                    y: 50,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }, {
                text: 'BRAKE',
                class: 'control-pad-label',
                anchor: {
                    x: 50,
                    y: 0,
                },
                size: {
                    x: 50,
                    y: 20,
                },
                position: {
                    x: 0,
                    y: 25,
                },
            }],
        },
    },
    flaps: {
        group: 'controls',
        overlay: {
            anchor: {
                x: 50,
                y: 0,
            },
            alignment: {
                x: 'right',
                y: 'bottom',
            },
            position: {
                x: 70,
                y: 10,
            },
            size: {
                x: 50,
                y: 50,
            },
            opacity: 0.5,
            class: 'control-pad flaps-overlay',
            overlays: [{
                text: 'FLAPS',
                class: 'control-pad-label',
                anchor: {
                    x: 50,
                    y: 0,
                },
                size: {
                    x: 50,
                    y: 20,
                },
                position: {
                    x: 0,
                    y: 25,
                },
            }, {
                animations: [{
                    type: 'text',
                    value: 'flapsTarget',
                    concat: [' / ', 'flapsMaxPosition'],
                }],
                class: 'control-pad-label',
                text: '0',
                anchor: {
                    x: 50,
                    y: 0,
                },
                size: {
                    x: 50,
                    y: 20,
                },
                position: {
                    x: 0,
                    y: 5,
                },
            }],
        },
    },
    gear: {
        group: 'controls',
        overlay: {
            anchor: {
                x: 50,
                y: 0,
            },
            alignment: {
                x: 'right',
                y: 'bottom',
            },
            position: {
                x: 130,
                y: 10,
            },
            size: {
                x: 50,
                y: 50,
            },
            opacity: 0.5,
            class: 'control-pad gear-overlay',
            overlays: [{
                animations: [{
                    value: 'gearPosition',
                    type: 'show',
                    when: [0],
                }],
                class: 'control-pad-label green-pad',
                text: 'DOWN',
                anchor: {
                    x: 50,
                    y: 0,
                },
                size: {
                    x: 50,
                    y: 50,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }, {
                animations: [{
                    value: 'gearPosition',
                    type: 'show',
                    when: [1],
                }],
                class: 'control-pad-label red-pad',
                text: 'UP',
                anchor: {
                    x: 50,
                    y: 0,
                },
                size: {
                    x: 50,
                    y: 50,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }, {
                animations: [{
                    value: 'gearPosition',
                    type: 'show',
                    whenNot: [0, 1],
                }],
                class: 'control-pad-label orange-pad',
                text: 'TRANS',
                anchor: {
                    x: 50,
                    y: 0,
                },
                size: {
                    x: 50,
                    y: 50,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }, {
                text: 'GEAR',
                class: 'control-pad-label',
                anchor: {
                    x: 50,
                    y: 0,
                },
                size: {
                    x: 50,
                    y: 20,
                },
                position: {
                    x: 0,
                    y: 25,
                },
            }],
        },
    },
    spoilers: {
        group: 'controls',
        overlay: {
            anchor: {
                x: 50,
                y: 0,
            },
            alignment: {
                x: 'right',
                y: 'bottom',
            },
            position: {
                x: 190,
                y: 10,
            },
            size: {
                x: 50,
                y: 50,
            },
            opacity: 0.5,
            class: 'control-pad spoiler-overlay',
            overlays: [{
                animations: [{
                    value: 'airbrakesPosition',
                    type: 'show',
                    when: [0],
                }],
                class: 'control-pad-label transp-pad',
                text: 'RET',
                anchor: {
                    x: 50,
                    y: 0,
                },
                size: {
                    x: 50,
                    y: 50,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }, {
                animations: [{
                    value: 'airbrakesPosition',
                    type: 'show',
                    whenNot: [0],
                }],
                class: 'control-pad-label orange-pad',
                text: 'DEP',
                anchor: {
                    x: 50,
                    y: 0,
                },
                size: {
                    x: 50,
                    y: 50,
                },
                position: {
                    x: 0,
                    y: 0,
                },
            }, {
                text: 'SPLR',
                class: 'control-pad-label',
                anchor: {
                    x: 50,
                    y: 0,
                },
                size: {
                    x: 50,
                    y: 20,
                },
                position: {
                    x: 0,
                    y: 25,
                },
            }],
        },
    },
};
instruments.definitions3DOverlay = {
    airspeed: {
        name: '3d-ias-overlay',
        group: '3doverlays',
        include: '3d-ias',
        parent: 'camera',
        type: 'none',
        position: [-0.2, 0, 0],
        rotation: [0, 0, 0],
    },
    airspeedJet: {
        name: '3d-ias-high-overlay',
        group: '3doverlays',
        include: '3d-ias-high',
        parent: 'camera',
        type: 'none',
        position: [-0.2, 0, 0],
        rotation: [0, 0, 0],
    },
    airspeedSupersonic: {
        name: '3d-ias-supersonic-overlay',
        group: '3doverlays',
        include: '3d-ias-supersonic',
        parent: 'camera',
        type: 'none',
        position: [-0.2, 0, 0],
        rotation: [0, 0, 0],
    },
    altitude: {
        name: '3d-altimeter-overlay',
        group: '3doverlays',
        include: '3d-altimeter',
        parent: 'camera',
        type: 'none',
        position: [-0.1, 0, -0],
        rotation: [0, 0, 0],
    },
    attitude: {
        name: '3d-attitude-overlay',
        group: '3doverlays',
        include: '3d-attitude',
        parent: 'camera',
        type: 'none',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
    },
    attitudeJet: {
        name: '3d-attitude-jet-overlay',
        group: '3doverlays',
        include: '3d-attitude-jet',
        parent: 'camera',
        type: 'none',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
    },
    attitudeJet2: {
        name: '3d-attitude-jet2-overlay',
        group: '3doverlays',
        include: '3d-attitude-jet2',
        parent: 'camera',
        type: 'none',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
    },
    compass: {
        name: '3d-compass-overlay',
        group: '3doverlays',
        include: '3d-compass',
        parent: 'camera',
        type: 'none',
        position: [0.1, 0, 0],
        rotation: [0, 0, 0],
    },
    vario: {
        name: '3d-vario-overlay',
        group: '3doverlays',
        include: '3d-vario',
        parent: 'camera',
        type: 'none',
        position: [0.2, 0, 0],
        rotation: [0, 0, 0],
    },
    varioJet: {
        name: '3d-vario-high-overlay',
        group: '3doverlays',
        include: '3d-vario-high',
        parent: 'camera',
        type: 'none',
        position: [0.2, 0, 0],
        rotation: [0, 0, 0],
    },
    rpm: {
        disabled: !0,
    },
    rpmJet: {
        disabled: !0,
    },
};
instruments.includesDefinitions = {
    '3d-altimeter': [{
        model: 'models/gauges/altimeter/altimeter.gltf',
    }, {
        name: 'hundreds',
        node: 'hundreds',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'altitude',
            ratio: -0.36,
        }],
    }, {
        name: 'thousands ',
        node: 'thousands',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'altitude',
            ratio: -0.036,
        }],
    }, {
        name: 'tenthousands ',
        node: 'tenthousands',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'altitude',
            ratio: -0.0036,
        }],
    }, {
        name: 'stripe_hand ',
        node: 'stripe_hand',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'altitude',
            ratio: -0.011,
            preoffset: -1E4,
            min: 1E4,
            max: 15E3,
        }],
    }],
    '3d-ias': [{
        model: 'models/gauges/ias/ias.gltf',
    }, {
        name: 'hand ',
        node: 'hand',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'kias',
            ratio: -1.5,
            min: 0,
        }],
    }],
    '3d-ias-high': [{
        model: 'models/gauges/kias-high/kiashigh.gltf',
    }, {
        name: 'hand ',
        node: 'kiashand',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'kias',
            ratio: -0.6,
            min: 0,
        }],
    }],
    '3d-ias-supersonic': [{
        model: 'models/gauges/kias-supersonic/kiassupersonic.gltf',
    }, {
        name: 'hand ',
        node: 'kiashand',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'kias',
            ratio: -0.3,
            min: 0,
        }],
    }],
    '3d-compass': [{
        model: 'models/gauges/compass/compass.gltf',
    }, {
        name: 'compass-hand ',
        node: 'compass-hand',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'heading',
            ratio: 1,
        }],
    }],
    '3d-vario': [{
        model: 'models/gauges/vario/vario.gltf',
    }, {
        name: 'hand ',
        node: 'hand',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'climbrate',
            ratio: -0.09,
            max: 1900,
            min: -1900,
            offset: 90,
        }],
    }],
    '3d-vario-high': [{
        model: 'models/gauges/vario-high/vario-high.gltf',
    }, {
        name: 'hand ',
        node: 'hand',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'climbrate',
            ratio: -0.025,
            max: 6E3,
            min: -6E3,
            offset: 90,
        }],
    }],
    '3d-attitude-jet': [{
        model: 'models/gauges/attitude-jet/attitude.gltf',
    }, {
        name: 'ball',
        node: 'ball',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'aroll',
            ratio: -1,
        }, {
            type: 'rotate',
            axis: 'X',
            value: 'atilt',
            ratio: 1,
        }],
    }, {
        name: 'hand',
        node: 'hand',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'aroll',
            ratio: -1,
            min: -50,
            max: 50,
        }],
    }],
    '3d-attitude-jet2': [{
        model: 'models/gauges/attitude-jet2/attitudejet.gltf',
    }, {
        name: 'ball',
        node: 'ball',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'aroll',
            ratio: -1,
        }, {
            type: 'rotate',
            axis: 'X',
            value: 'atilt',
            ratio: 1,
        }],
    }, {
        name: 'hand',
        node: 'hand',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'aroll',
            ratio: -1,
            min: -50,
            max: 50,
        }],
    }],
    '3d-rpm': [{
        model: 'models/gauges/rpm/rpm.gltf',
    }, {
        name: 'hand',
        node: 'hand',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'rpm',
            ratio: -0.03,
            offset: 120,
        }],
    }],
    '3d-jet-rpm': [{
        model: 'models/gauges/jet-rpm/rpm.gltf',
    }, {
        name: 'hand',
        node: 'hand',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'rpm',
            ratio: -0.027,
        }],
    }, {
        name: 'smallhand',
        node: 'smallhand',
        animations: [{
            type: 'rotate',
            axis: 'Z',
            value: 'rpm',
            ratio: 0.036,
        }],
    }],
    '3d-attitude': [{
        model: 'models/gauges/attitude/attitude.gltf',
    }, {
        name: 'hand',
        node: 'hand',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'aroll',
            ratio: -1,
            min: -50,
            max: 50,
        }, {
            type: 'translate',
            axis: 'Z',
            value: 'atilt',
            ratio: 7E-4,
            min: -25,
            max: 25,
        }],
    }, {
        name: 'ring',
        node: 'ring',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'aroll',
            ratio: -1,
            min: -50,
            max: 50,
        }],
    }],
    '3d-turn-coordinator': [{
        model: 'models/gauges/turn-coordinator/turncoordinator.gltf',
    }, {
        name: 'turn-rate-hand',
        node: 'turn-rate-hand',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'turnrate',
            ratio: -0.11,
            fmin: -40,
            fmax: 40,
        }],
    }, {
        name: 'ball',
        node: 'ball',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'accX',
            ratio: -4,
            fmin: -15,
            fmax: 15,
        }],
    }],
    '3d-gmeter': [{
        model: 'models/gauges/gmeter/gmeter.gltf',
    }, {
        name: 'hand ',
        node: 'hand',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'accZ',
            ratio: -2.25,
            min: -30,
            max: 180,
            offset: 0,
        }],
    }],
    '3d-compassball': [{
        model: 'models/gauges/compassball/compassball.gltf',
    }, {
        name: 'ball ',
        node: 'ball',
        animations: [{
            type: 'rotate',
            axis: 'X',
            value: 'atilt',
            ratio: -1,
            fmin: -10,
            fmax: 10,
        }, {
            type: 'rotate',
            axis: 'Y',
            value: 'aroll',
            ratio: 1,
            fmin: -10,
            fmax: 10,
        }, {
            type: 'rotate',
            axis: 'Z',
            value: 'heading360',
            ratio: -1,
            offset: 0,
        }],
    }],
    '3d-manifold': [{
        model: 'models/gauges/manifold/manifold.gltf',
    }, {
        name: 'handmanifoldpressure',
        node: 'handmanifoldpressure',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'rpm',
            ratio: -0.018,
            offset: 0,
        }],
    }, {
        name: 'handfuelflow',
        node: 'handfuelflow',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'rpm',
            ratio: -0.028,
            offset: 0,
        }],
    }],
    '3d-oil': [{
        model: 'models/gauges/oil/oil.gltf',
    }, {
        name: 'handoilpressure',
        node: 'handoilpressure',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'rpm',
            ratio: -0.3,
            offset: 0,
            fmin: -120,
        }],
    }, {
        name: 'handoiltemp',
        node: 'handoiltemp',
        animations: [{
            type: 'rotate',
            axis: 'Y',
            value: 'rpm',
            ratio: -0.1,
            offset: 0,
            fmin: -120,
        }],
    }],
    '3d-PFD': [{}],
};
instruments.init = function(a) {
    geofs.isMobile ? (instruments.definitions = $.extend(instruments.definitions, instruments.definitionsMobile),
        geofs.isApp && (instruments.definitions = $.extend(instruments.definitions, instruments.definitions3DOverlay),
            instruments.margins = [0, 0, 35, 0]),
        instruments.stackPosition = {
            x: 120,
            y: 100,
        }) : instruments.stackPosition = {
        x: 110,
        y: 100,
    };
    geofs.includes = $.extend(geofs.includes, instruments.includesDefinitions);
    a && a != 'default' || (a = {
        airspeed: '',
        altitude2: '',
        altitude: '',
        vario: '',
        compass: '',
        rpm: '',
        brakes: '',
    });
    a == 'jet' && (a = {
        airspeedJet: '',
        attitudeJet: '',
        altitude2: {
            center: !0,
        },
        varioJet: '',
        compass: '',
        rpmJet: '',
        brakes: '',
    });
    for (var b in instruments.list) { instruments.list[b].destroy(); }
    instruments.list = {};
    instruments.groups = {};
    for (b in a) {
        let c = $.extend(!0, {}, instruments.definitions[b], a[b]);
        c && (c.overlay ? (instruments.list[b] = new Indicator(c),
            c = c.group || 'all',
            instruments.groups[c] = instruments.groups[c] || {},
            instruments.groups[c][b] = instruments.list[b]) : c.include && (geofs.aircraft.instance.addParts([c]),
            geofs.aircraft.instance.parts[c.name].animations.push({
                value: 'overlaysVisibility',
                type: 'hide',
                eq: 'hidden',
            })));
    }
    instruments.list.wind || geofs.isApp || (instruments.definitions.wind.visibility = geofs.preferences.weather.windActive ? !0 : !1,
        instruments.list.wind = new Indicator($.extend(!0, {}, instruments.definitions.wind)));
    instruments.resizeHandler || (instruments.resizeHandler = geofs.addResizeHandler(() => {
        instruments.updateScreenPositions();
    }));
};
instruments.toggle = function() {
    instruments.visible ? instruments.hide() : instruments.show();
};
instruments.add = function(a, b) {
    instruments.list[b] = a;
};
instruments.hide = function(a) {
    let b = instruments.list;
    a && (b = instruments.groups[a] || {});
    for (const c in b) { b[c].hide(); }
    a && a != '3doverlays' || (geofs.animation.values.overlaysVisibility = 'hidden');
    instruments.visible = !1;
};
instruments.show = function(a) {
    let b = instruments.list;
    a && (b = instruments.groups[a] || {});
    for (const c in b) { b[c].show(); }
    a && a != '3doverlays' || (geofs.animation.values.overlaysVisibility = 'visible');
    instruments.visible = !0;
};
instruments.rescale = function() {
    for (const a in instruments.list) { instruments.list[a].scale(); }
    instruments.updateCockpitPositions();
};
instruments.update = function(a) {
    for (const b in instruments.list) { instruments.list[b].update(a); }
};

function clamp(a, b, c) {
    return a > c ? c : a < b ? b : a;
}
instruments.updateCockpitPositions = function() {
    for (const a in instruments.list) { instruments.list[a].updateCockpitPosition(); }
    instruments.update(!0);
};
instruments.updateScreenPositions = function() {
    console.log("instruments update")
    for (var a in instruments.list) {
        var b = instruments.list[a];
        camera.currentModeName == 'cockpit' ? b.updateCockpitPosition() : b.overlay && (b.overlay.rotation = 0,
            b.overlay.scaleAndPlace());
    }
    a = clamp(geofs.viewportWidth / VIEWPORT_REFERENCE_WIDTH, 0.3, 1);
    b = clamp(geofs.viewportHeight / VIEWPORT_REFERENCE_HEIGHT, 0.3, 1);
    a = Math.min(a, b);
    instruments.gaugeOverlayPosition[0] = instruments.gaugeOverlayOrigin[0] * a;
    instruments.gaugeOverlayPosition[1] = geofs.viewportHeight - instruments.gaugeOverlayOrigin[1] * a;
    instruments.gaugeOverlayPosition[2] = instruments.gaugeOverlayOrigin[2];
};
export default instruments;