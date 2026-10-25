// Study ambience generated live with the Web Audio API (no audio files needed).
(function (S) {
  let ctx = null, master = null, current = 'off', nodes = [], timers = [];

  const SOUNDS = [
    { id: 'off', label: 'Off' },
    { id: 'rain', label: 'Soft rain' },
    { id: 'cafe', label: 'Café' },
    { id: 'temple', label: 'Temple bells' },
    { id: 'forest', label: 'Forest' },
    { id: 'lofi', label: 'Lo-fi tones' },
  ];

  const audio = () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = S.store.settings.get('ambientVol') ?? 0.35;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function noise(gain, freq, type = 'lowpass') {
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
    const g = ctx.createGain(); g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(master);
    src.start(); nodes.push(src);
  }
  function blip(freq, { type = 'sine', gain = 0.05, attack = 0.01, dur = 0.4, slideTo, at = 0 } = {}) {
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  const loop = (id, fn, min, spread) => {
    const tick = () => { if (current !== id) return; fn(); later(tick, min + Math.random() * spread); };
    tick();
  };

  const MAKERS = {
    rain() {
      noise(0.55, 1800); noise(0.18, 400);
      loop('rain', () => blip(1200 + Math.random() * 600, { gain: 0.04, dur: 0.35, slideTo: 300 }), 400, 1200);
    },
    cafe() {
      noise(0.07, 3200, 'bandpass'); noise(0.04, 800);
      loop('cafe', () => [220, 280, 350, 420, 180].forEach((f) => blip(f + Math.random() * 60, { type: 'triangle', gain: 0.012, attack: 0.1, dur: 0.3 + Math.random() * 0.4 })), 600, 1400);
      loop('cafe', () => blip(900 + Math.random() * 300, { gain: 0.06, dur: 0.5 }), 3000, 5000);
    },
    temple() {
      noise(0.025, 600);
      loop('temple', () => {
        const f = S.pick([220, 293, 370, 440, 587]);
        [1, 2, 3, 4].forEach((h, i) => blip(f * h, { gain: 0.06 / (i + 1), dur: 3 + i }));
      }, 4000, 6000);
    },
    forest() {
      noise(0.12, 2000, 'bandpass'); noise(0.06, 300);
      loop('forest', () => {
        const base = 800 + Math.random() * 1200;
        for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) blip(base, { gain: 0.04, dur: 0.15, slideTo: base * 1.4, at: i * 0.18 });
      }, 1500, 3500);
    },
    lofi() {
      noise(0.025, 500);
      const scale = [261, 294, 329, 349, 392, 440, 494, 523];
      let n = 0;
      loop('lofi', () => { blip(scale[n++ % scale.length] * (Math.random() > 0.7 ? 0.5 : 1), { type: Math.random() > 0.5 ? 'triangle' : 'sine', gain: 0.06, attack: 0.05, dur: 0.5 }); }, 350, 500);
    },
  };

  function stop() {
    nodes.forEach((n) => { try { n.stop(); } catch (e) {} });
    timers.forEach(clearTimeout);
    nodes = []; timers = [];
  }

  S.ambient = {
    SOUNDS,
    get current() { return current; },
    set(id) {
      stop();
      current = id;
      if (id !== 'off' && MAKERS[id]) { audio(); MAKERS[id](); }
    },
    volume(v) {
      S.store.settings.set('ambientVol', v);
      if (master) master.gain.value = v;
    },
  };
})(window.S);
