//音频
import geofs from "../geofs"
import ui from "../ui/ui"
window.audio = window.audio || {};
audio.init = function(a) {
    a = a || [];
    audio.soundplayer = audio.impl.webAudio.createPlayer() || audio.impl.html5.createPlayer();
    audio.sounds = {};
    for (let b = 0, c = a.length; b < c; b++) {
        let d = a[b];
        audio.sounds[d.id] = d;
        d.cut = d.cut || [0, 0];
        d.playing = !1;
        d.loading = !1;
        d.loaded = !1;
        d = d.effects;
        for (const e in d) {
            const f = d[e];
            f.lastValue = null;
            e == 'volume' && (f.ratio = 100);
        }
    }
    geofs.preferences.sound ? !1 !== audio.on && (audio.on = !0) : audio.mute();
};
audio.loaded = function(a) {
    audio.sounds[a].loaded = !0;
};
audio.stopped = function(a) {
    audio.sounds[a].playing = !1;
};
audio.update = function() {
    if (audio.on && audio.soundplayer) {
        for (const a in audio.sounds) {
            let b = audio.sounds[a],
                c = b.effects;
            if (b.file && !b.loading && !b.loaded && audio.soundplayer.loadMP3) {
                //添加获取声音代理
                audio.soundplayer.loadMP3(b.id, geofs.localUrl + b.file + geofs.killCache, b.cut[0], b.cut[1], b.lowLatency || !1, b.fadeDuration || 0),
                    b.loading = !0;
            } else if (b.loaded) {
                for (const d in c) {
                    let e = c[d],
                        f = geofs.animation.filter(e);
                    if (e.lastValue != f) {
                        switch (d) {
                            case 'volume':
                                f -= 0.01 * geofs.animation.values.cameraAircraftDistance;
                                if (f <= 0 && !0 === b.playing) {
                                    try {
                                        b.playing = 'stopping',
                                            audio.soundplayer.stopSound(b.id);
                                    } catch (g) {}
                                }
                                if (f > 0) {
                                    if (!b.playing) {
                                        try {
                                            b.playing = !0,
                                                audio.soundplayer.playSound(b.id);
                                        } catch (g) {}
                                    }
                                    try {
                                        audio.soundplayer.setVolume(b.id, f);
                                    } catch (g) {}
                                }
                                break;
                            case 'pitch':
                                f += 0.001 * geofs.animation.values.cameraAircraftSpeed;
                                try {
                                    audio.soundplayer.setRate(b.id, f);
                                } catch (g) {}
                                break;
                            case 'start':
                                if (f > 0) {
                                    if (!b.playing) {
                                        try {
                                            b.playing = !0,
                                                audio.soundplayer.playSound(b.id, b.loop);
                                        } catch (g) {}
                                    }
                                } else if (!0 === b.playing) {
                                    try {
                                        b.playing = 'stopping',
                                            audio.soundplayer.setVolume(b.id, 0),
                                            audio.soundplayer.stopSound(b.id);
                                    } catch (g) {}
                                }
                                break;
                            case 'stop':
                                if (f > 0) {
                                    if (!0 === b.playing) {
                                        try {
                                            b.playing = 'stopping',
                                                audio.soundplayer.setVolume(b.id, 0),
                                                audio.soundplayer.stopSound(b.id);
                                        } catch (g) {}
                                    }
                                } else if (!b.playing) {
                                    try {
                                        b.playing = !0,
                                            audio.soundplayer.playSound(b.id, b.loop);
                                    } catch (g) {}
                                }
                        }
                        e.lastValue = f;
                    }
                }
            }
        }
    }
};
audio.toggleMute = function() {
    audio.on ? audio.mute() : audio.unmute();
};
audio.stop = function() {
    try {
        if (audio.soundplayer && audio.soundplayer.stopSound) {
            for (const a in audio.sounds) {
                const b = audio.sounds[a];
                audio.soundplayer.stopSound(b.id);
                b.playing = !1;
                var c = b.effects,
                    d;
                for (d in c) { c[d].lastValue = null; }
            }
        }
    } catch (e) {}
};
audio.mute = function() {
    audio.stop();
    audio.on = !1;
    geofs.preferences.sound = !1;
};
audio.unmute = function() {
    audio.on = !0;
    geofs.preferences.sound = !0;
};
audio.playStartup = function() {
    if (audio.on && audio.soundplayer && audio.soundplayer.playSound) {
        try {
            audio.soundplayer.playSound('startup', !1);
        } catch (a) {}
    }
};
audio.playShutdown = function() {
    if (audio.on && audio.soundplayer && audio.soundplayer.playSound) {
        try {
            audio.soundplayer.playSound('shutdown', !1);
        } catch (a) {}
    }
};
audio.playSoundLoop = function(a, b) {
    if (audio.on && audio.soundplayer && audio.soundplayer.playSound) {
        try {
            audio.soundplayer.playSound(a, b);
        } catch (c) {}
    }
};
audio.stopSoundLoop = function(a) {
    if (audio.soundplayer && audio.soundplayer.stopSound) {
        try {
            audio.soundplayer.stopSound(a);
        } catch (b) {}
    }
};
audio.impl = {};
audio.impl.webAudio = {
    decodingStack: [],
    createPlayer() {
        audio.impl.webAudio.destroyPlayer();
        if (!window.AudioContext && !window.webkitAudioContext) { return null; }
        audio.impl.webAudio.context = audio.impl.webAudio.context || new(window.AudioContext || window.webkitAudioContext)();
        return audio.impl.webAudio.context ? audio.impl.webAudio : null;
    },
    stackDecoding(a, b) {
        audio.impl.webAudio.decodingStack.push(() => {
            a();
            audio.impl.webAudio.decodingStack.shift();
            if (audio.impl.webAudio.decodingStack.length > 0) { audio.impl.webAudio.decodingStack[0](); }
        });
        if (audio.impl.webAudio.decodingStack.length == 1) { audio.impl.webAudio.decodingStack[0](); }
    },
    loadMP3(a, b) {
        let c = audio.sounds[a],
            d = new XMLHttpRequest();
        d.open('GET', b, !0);
        d.responseType = 'arraybuffer';
        d.onload = function() {
            audio.impl.webAudio.stackDecoding(() => {
                audio.impl.webAudio.context.decodeAudioData(d.response, (b) => {

                    c.buffer = b;
                    audio.loaded(a);
                }, (a) => {
                    throw `Error with decoding audio data ${a}`;

                });
            }, a);
        };
        d.send();
    },
    playSound(a, b) {
        a = audio.sounds[a];
        a.buffer && (b = a.loop || b,
            a.sourceNode = audio.impl.webAudio.context.createBufferSource(),
            a.sourceNode.loop = !1 !== b,
            a.sourceNode.buffer = a.buffer,
            a.gainNode = audio.impl.webAudio.context.createGain(),
            a.sourceNode.connect(a.gainNode),
            a.gainNode.connect(audio.impl.webAudio.context.destination),
            a.sourceNode.start(0));
    },
    stopSound(a) {
        const b = audio.sounds[a];
        b.sourceNode && (b.sourceNode.stop(),
            b.sourceNode = null);
        audio.stopped(a);
    },
    setVolume(a, b) {
        a = audio.sounds[a];
        a.gainNode && (a.gainNode.gain.value = b / 100);
    },
    setRate(a, b) {
        a = audio.sounds[a];
        a.sourceNode && (a.sourceNode.playbackRate.value = b);
    },
    destroyPlayer() {
        for (const a in audio.sounds) {
            this.stopSound(a),
                audio.sounds[a] = null,
                delete audio.sounds[a];
        }
    },
};
audio.impl.html5 = {
    player: null,
    createPlayer() {
        audio.impl.html5.destroyPlayer();
        return window.Audio ? audio.impl.html5 : null;
    },
    loadMP3(a, b) {
        a = audio.sounds[a];
        a.element = new Audio(b);
        a.loop && a.element.addEventListener('timeupdate', function() {
            this.currentTime > this.duration - 3 && (this.currentTime = 0,
                this.play());
        }, !1);
        a.loaded = !0;
    },
    playSound(a) {
        a = audio.sounds[a];
        a.element && a.element.play();
    },
    stopSound(a) {
        const b = audio.sounds[a];
        b.element && b.element.pause();
        audio.stopped(a);
    },
    setVolume(a, b) {
        a = audio.sounds[a];
        a.element && (a.element.volume = b / 100);
    },
    setRate(a, b) {},
    destroyPlayer() {
        for (const a in audio.sounds) {
            const b = audio.sounds[a].element;
            b && b.close && b.close();
        }
    },
};
audio.impl.cordova = {
    player: null,
    decodingStack: [],
    createPlayer() {
        audio.impl.cordova.destroyPlayer();
        return window.Media ? audio.impl.cordova : null;
    },
    loadMP3(a, b) {
        b = `${geofs.url}/${b}`;
        const c = audio.sounds[a];
        c.media = new Media(b, (() => {
            c.media.loop && c.media.play();
        }), ((a) => {
            geofs.debug.log(`loadMP3: ${a}`);
        }), );
        c.loaded = !0;
    },
    playSound(a, b) {
        a = audio.sounds[a];
        a.media && (a.media.play(),
            a.media.loop = !1 !== (a.loop || b));
    },
    stopSound(a) {
        const b = audio.sounds[a];
        b.media && b.media.stop();
        b.media.loop = !1;
        audio.stopped(a);
    },
    setVolume(a, b) {
        a = audio.sounds[a];
        a.media && a.setVolume(b / 100);
    },
    setRate(a, b) {
        a = audio.sounds[a];
        a.media && a.setRate(b / 100);
    },
    destroyPlayer() {
        if (this.player) {
            for (const a in audio.sounds) { audio.sounds[a].media.release(); }
            this.player = null;
        }
    },
};
export default audio