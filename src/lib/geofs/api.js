
// import $ from 'jquery';
import { V3 } from './utils'
class api {};
api.march2019theTwentyFirst = 2458563;
api.halfADayInSeconds = 43200;
api.overlayBaseZIndex = 60;
api.ALTITUDE_RELATIVE = 'ALTITUDE_RELATIVE';
api.CLAMP_TO_GROUND = 'CLAMP_TO_GROUND';
api.nativeMouseHandling = !1;
// init world ?????
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

api.isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? !0 : !1;
api.getPlatform = () => {
    if (geofs.platform) { return geofs.platform; }
    /iPhone|iPad|iPod/i.test(navigator.userAgent) && (geofs.platform = 'ios');
    /Android/i.test(navigator.userAgent) && (geofs.platform = 'android');
    return geofs.platform;
};

function clamp(a, b, c) {
    return void 0 == b || void 0 == c ? a : a < b ? b : a > c ? c : a;
}
api.isIOS = () => api.getPlatform() == 'ios' ? !0 : !1;
export default api;