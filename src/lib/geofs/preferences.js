function hackGeoFS(geofs){
  geofs.preferences = {};
  geofs.userRecord = geofs.userRecord || {};
  geofs.preferencesDefault = {
    aircraft: '',
    coordinates: '',
    controlMode: 'mouse',
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
    multiplayer: !0,
    adsb: !0,
    chat: !1,
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
  geofs.initPreferences = function () {
    geofs.$preferencePanel = $('.geofs-preferences');
    const a = function (a) {
      a.stopPropagation();
    };
    geofs.$preferencePanel.keydown(a);
    geofs.$preferencePanel.keyup(a);
    geofs.localStorage = window.localStorage || {};
    $(document).on('expanded', '.geofs-preference-controls', () => {
      geofs.preferencesStartFeedback();
    }).on('collapsed', '.geofs-preference-controls', () => {
      geofs.preferencesStopFeedback();
    });
  }
  ;
  geofs.isPreferencePanelOpen = function () {
    return geofs.$preferencePanel.is(':visible');
  }
  ;
  geofs.savePreferences = function () {
    geofs.aircraft.instance && (geofs.preferences.coordinates = geofs.aircraft.instance.getCurrentCoordinates(),
    geofs.aircraft.instance.groundContact ? geofs.preferences.coordinates[2] = 0 : geofs.preferences.coordinates[4] = !0);
    const a = serialize(geofs.preferences);
    try {
      geofs.localStorage.setItem('preferences', a);
    } catch (b) {
      geofs.debug.error(b, 'Could not save preferences');
    }
    $(document).trigger('preferenceSaved');
  }
  ;
  geofs.resetPreferences = function () {
    geofs.preferences = clone(geofs.preferencesDefault);
    geofs.preferences.version = geofs.version;
    geofs.savePreferences();
    geofs.initializePreferencesPanel();
  }
  ;
  geofs.readPreferences = function (a) {
    let b = geofs.localStorage.getItem('preferences'),
      c = b || {};
    b || $('.geofs-preferences-alert').show();
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
    $(document).trigger('preferenceRead');
  }
  ;
  geofs.populateButtonAssignments = function () {
    const a = $('.geofs-joystick-button-container', geofs.$preferencePanel);
    if (a) {
      let b = '';
      for (i in controls.setters) { b += `<option value="${i}">${controls.setters[i].label}</option>`; }
      b += '</select>';
      let c = '',
        d;
      for (d in controls.joystick.buttons) {
        c += `<div class="geofs-feedback-wrapper"><label>Button ${controls.joystick.buttons[d].globalId}</label><div class="geofs-feedback" button="${d}"></div>`,
        c += `<select gespref="geofs.preferences.joystick.buttons.${d}" update="controls.joystick.configure">${b}</div>`;
      }
      a.html(c);
    }
  }
  ;
  geofs.populateAxesAssignments = function () {
    const a = $('.geofs-joystick-axes-container', geofs.$preferencePanel);
    if (a) {
      let b = '';
      for (i in controls.axisSetters) { b += `<option value="${i}">${controls.axisSetters[i].label}</option>`; }
      b += '</select>';
      let c = '',
        d;
      for (d in controls.joystick.axes) {
        c += `<div class="geofs-feedback-wrapper"><label>Axis ${controls.joystick.axes[d].globalId}</label>`,
        c += `<select gespref="geofs.preferences.joystick.axis.${d}">${b}`,
        c += `<div class="progress" axis="${d}"><div class="bar"></div></div>`,
        c += '<label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" title="Reverse axis">',
        c += `<input type="checkbox" class="mdl-switch__input" gespref="geofs.preferences.joystick.multiplier.${d}" update="controls.setMode();">`,
        c += '<span class="mdl-switch__label">Reverse</span>',
        c += '</label>';
      }
      a.html(c);
    }
  }
  ;
  geofs.populateKeyAssignments = function () {
    let a = $('.geofs-keyboard-keys-container', geofs.$preferencePanel),
      b = '',
      c;
    for (c in geofs.preferences.keyboard.keys) {
      const d = `keyInput${geofs.preferences.keyboard.keys[c].keycode}`;
      b += `<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label"><input id="${d}" class="geofs-preferences-key-detect mdl-textfield__input" type="text" data-type="keydetect" gespref="geofs.preferences.keyboard.keys.${c}" keycode="${geofs.preferences.keyboard.keys[c].keycode}" value="${geofs.preferences.keyboard.keys[c].label}"/><label class="mdl-textfield__label" for="${d}">${c}</label></div>`;
    }
    a.html(b);
    componentHandler.upgradeDom();
    a.on('click focus', '.geofs-preferences-key-detect', function () {
      $('.geofs-preference-key-detecting', a).each(function () {
        this.value = this._originalValue;
        $(this).removeClass('geofs-preference-key-detecting');
      });
      this._originalValue = this.value;
      this.value = '';
      $(this).addClass('geofs-preference-key-detecting');
    }).on('keyup', '.geofs-preferences-key-detect', function (a) {
      $(this).hasClass('geofs-preference-key-detecting') && (a.which != 27 ? (this.value = geofs.preferencesKeycodeLookup[a.which] ? geofs.preferencesKeycodeLookup[a.which] : this.value.toUpperCase(),
      this.setAttribute('keycode', a.which),
      geofs.setPreferenceFromInput(this)) : this.value = this._originalValue,
      $(this).removeClass('geofs-preference-key-detecting'),
      $(this).blur(),
      a.stopPropagation(),
      a.preventDefault());
    }).on('keydown', '.geofs-preferences-key-detect', function (a) {
      $(this).hasClass('geofs-preference-key-detecting') && a.which == 9 && (a.stopPropagation(),
      a.preventDefault());
    }).on('blur', '.geofs-preferences-key-detect', function (a) {
      $(this).hasClass('geofs-preference-key-detecting') && (this.value == '' && (this.value = this._originalValue),
      $(this).removeClass('geofs-preference-key-detecting'),
      a.stopPropagation(),
      a.preventDefault());
    });
  }
  ;
  geofs.preferencesDebugInfo = function () {
    for (var a = `Network Latency (avg): ${multiplayer.avgPing} ms\nFramerate (avg): ${geofs.debug.fps} fps\n--------------\nlogs:\n`, b = 0; b < geofs.debug.logStack.length; b++) { a += `${geofs.debug.logStack[b]}\n`; }
    $('.geofs-debug-info', geofs.$preferencePanel).html(a);
  }
  ;
  geofs.preferencesTestJoystick = function () {
    const a = controls.joystick.poll();
    a ? ($('.geofs-preferences-joystick-status .alert-success').show().html(controls.joystick.info),
    $('.geofs-preferences-joystick-status .alert-warning').hide(),
    $('.geofs-preferences-joystick-status .alert-error').hide()) : (controls.joystick.api ? ($('.geofs-preferences-joystick-status .alert-error').hide(),
    $('.geofs-preferences-joystick-status .alert-warning').show()) : $('.geofs-preferences-joystick-status .alert-error').show(),
    $('.geofs-preferences-joystick-status .alert-success').hide());
    return a;
  }
  ;
  geofs.preferencesTestOrientation = function () {
    if (geofs.isMobile) {
      return $('.geofs-preferences-orientation').show(),
      controls.orientation.isAvailable() ? $('.geofs-preferences-orientation-status .alert-error').hide() : $('.geofs-preferences-orientation-status .alert-error').show(),
      !0;
    }
    $('.geofs-preferences-orientation').hide();
    return !1;
  }
  ;
  geofs.preferencesStartFeedback = function () {
    geofs.preferencesFeedbackInterval || (geofs.preferencesFeedbackInterval = setInterval(() => {
      geofs.preferencesTestJoystick() && ($('.geofs-preferences-joystick .progress[axis]', geofs.$preferencePanel).each(function () {
        let a = controls.joystick.getAxisValue(this.getAttribute('axis'));
        a = 50 * (a + 1);
        $(this).find('.bar').css('width', `${a}%`);
      }),
      $('.geofs-preferences-joystick .geofs-feedback[button]', geofs.$preferencePanel).each(function () {
        controls.joystick.checkButton(parseInt(this.getAttribute('button'))) ? $(this).addClass('on') : $(this).removeClass('on');
      }));
      geofs.preferencesTestOrientation() && $('.geofs-preferences-orientation .progress[axis]', geofs.$preferencePanel).each(function () {
        let a = controls.orientation.getNormalizedAxis(geofs.preferences.orientation.axis[this.getAttribute('axis')]);
        a *= 100;
        this.getAttribute('centered') && (a = (a + 100) / 2);
        $(this).find('.bar').css('width', `${a}%`);
      });
    }, 100));
  }
  ;
  geofs.preferencesStopFeedback = function () {
    clearInterval(geofs.preferencesFeedbackInterval);
    geofs.preferencesFeedbackInterval = null;
  }
  ;
  geofs.initializePreferencesPanel = function () {
    controls.joystick.ready && (geofs.populateButtonAssignments(),
    geofs.populateAxesAssignments());
    $(controls.joystick).on('joystickReady', () => {
      geofs.populateButtonAssignments();
      geofs.populateAxesAssignments();
      geofs.setPreferenceValues(geofs.$preferencePanel.find('.geofs-preferences-joystick'));
    });
    geofs.setPreferenceValues(geofs.$preferencePanel);
    geofs.populateKeyAssignments();
    geofs.preferencesTestJoystick();
    geofs.preferencesTestOrientation();
    geofs.preferencesDebugInfo();
  }
  ;
  geofs.setPreferenceValues = function (a) {
    $(a).find('[gespref]').each(function () {
      let a = $(this),
        c = this.getAttribute('data-type') || this.getAttribute('type');
      this.nodeName == 'SELECT' && (c = 'select');
      c = c.toLowerCase();
      for (var d = this.getAttribute('gespref').split('.'), e = window, f = 0; f < d.length - 1; f++) { e = e[d[f]]; }
      d = e[d[f]];
      switch (c) {
        case 'slider':
          a.slider('value', d);
          a.on('change', function (a, b) {
            geofs.setPreferenceFromInput(this);
          });
          break;
        case 'select':
          geofs.selectDropdown(this, d);
          this.onchange = function () {
            geofs.setPreferenceFromInput(this);
          }
          ;
          break;
        case 'radio-button':
          (c = this.getAttribute('matchvalue')) && c == d && a.addClass('is-checked');
          a.on('click', 'input', function () {
            geofs.setPreferenceFromInput(this);
          });
          break;
        case 'checkbox':
        case 'radio':
          c = (c = this.getAttribute('matchvalue')) ? c == d : d == 1;
          a.prop('checked', c);
          c ? a.parent('.mdl-radio, .mdl-switch').addClass('is-checked') : a.parent('.mdl-radio, .mdl-switch').removeClass('is-checked');
          this.onchange = function () {
            geofs.setPreferenceFromInput(this);
          }
          ;
          break;
        case 'keydetect':
          break;
        default:
          this.value = d,
          this.onchange = function () {
            geofs.setPreferenceFromInput(this);
          };
      }
    });
  }
  ;
  geofs.destroyPreferencePanel = function () {
    geofs.preferencesStopFeedback();
  }
  ;
  geofs.cancelPreferencesPanel = function () {
    geofs.destroyPreferencePanel();
    ui.closePreferencePanel();
  }
  ;
  geofs.setPreferenceFromInput = function (a) {
    try {
      let b = a.getAttribute('gespref');
      if (b) {
        let c = a.getAttribute('data-type') || a.getAttribute('type');
        a.nodeName == 'SELECT' && (c = 'select');
        c = c.toLowerCase();
        const d = b.split('.');
        b = window;
        for (var e = 0; e < d.length - 1; e++) { b = b[d[e]]; }
        switch (c) {
          case 'radio-button':
            $(a).is('.is-checked') && (b[d[e]] = a.getAttribute('matchvalue'));
            break;
          case 'checkbox':
            var f = a.getAttribute('matchvalue');
            var g = a.checked;
            f ? g && (b[d[e]] = f) : b[d[e]] = g;
            break;
          case 'radio':
            f = a.getAttribute('matchvalue');
            g = a.checked;
            f ? g && (g = b[d[e]] = f) : b[d[e]] = g;
            break;
          case 'slider':
            g = parseFloat($(a).slider('value'));
            b[d[e]] = g;
            break;
          case 'keydetect':
            g = a.value;
            b[d[e]].keycode = parseInt(a.getAttribute('keycode'));
            b[d[e]].label = g;
            break;
          default:
            g = a.value,
            b[d[e]] = g;
        }
        const h = a.getAttribute('update');
        if (h) {
          c = function (a) {
            const b = eval(h);
            typeof b === 'function' && b(a);
          }
          ;
          try {
            c.call(a, g);
          } catch (k) {
            geofs.debug.error(k, 'setPreferenceFromInput updateFunction.call');
          }
        }
      }
    } catch (k) {
      geofs.debug.error(k, 'geofs.setPreferenceFromInput');
    }
  }
  ;
  geofs.savePreferencesPanel = function () {
    $('[gespref]', geofs.$preferencePanel).each(function () {
      geofs.setPreferenceFromInput(this);
    });
    geofs.destroyPreferencePanel();
    geofs.savePreferences();
  };
  
}

export default hackGeoFS;

