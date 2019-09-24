
import geofs from '../geofs';
 import Overlay from '../modules/OverLay';
 const hud = {};
 var PAGE_PATH = 'http://localhost:3030/proxy/';
 hud.autopilotIndicator = function() {};
 hud.init = () => {
  
     hud.stall = new Overlay({
         name: 'stall',
         url: `${PAGE_PATH}images/instruments/stall.png`,
         visibility: !1,
         size: {
             x: 60,
             y: 20,
         },
         anchor: {
             x: 0,
             y: 0,
         },
         position: {
             x: 0,
             y: 50,
         },
         rescale: !1,
         alignment: {
             x: 'center',
             y: 'top',
         },
     });
     hud.stallAlarmOn = !1;
     geofs.addResizeHandler(() => {
         hud.stall.scaleAndPlace();
     });
     hud.stall.scaleAndPlace();
 };
 hud.stallAlarm = a => {
     !geofs.aircraft.instance.groundContact && a && !hud.stallAlarmOn && hud.stall && (hud.stall.setVisibility(!0),
         hud.stallAlarmOn = !0,
         clearTimeout(hud.stallAlarmTimeout),
         hud.stallAlarmTimeout = setTimeout(() => {
             hud.stall.setVisibility(!1);
             hud.stallAlarmOn = !1;
         }, 500));
 };
 hud.autopilotIndicator = a => {
     a ? $(document).trigger('autopilotOn') : $(document).trigger('autopilotOff');
 };
 export default hud;