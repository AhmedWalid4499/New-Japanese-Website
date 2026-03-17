// ============================================================
//  Sakura Study! — Shared Utilities
//  TTS, SRS, Bookmarks, Toast, Confetti, Dark Mode, Sidebar
//  Ambient Sound, Global Search, Egypt Clock, Stroke Order, Mascot
//  © 2026 Ahmed El Bourgy
// ============================================================

// ── Pre-declare shared variables ──
var mascotTipIndex = 0;
var mascotBubbleTimer = null;
var phrasesFilter = 'all';
var currentVocabFilter = 'all';
var currentKanjiFilter = 'all';
var currentAdjFilter = 'all';
var currentCounterFilter = 'all';

// ══════════════════════════════════════════════
//  CUSTOM ENTRIES — must be first so render functions can call loadCustom()
// ══════════════════════════════════════════════
const CUSTOM_KEYS = {
  vocab:    'sakura_custom_vocab',
  kanji:    'sakura_custom_kanji',
  grammar:  'sakura_custom_grammar',
  adj:      'sakura_custom_adj',
  counters: 'sakura_custom_counters',
};
function loadCustom(type) {
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEYS[type]) || '[]'); }
  catch(e) { return []; }
}
function saveCustom(type, data) {
  try { localStorage.setItem(CUSTOM_KEYS[type], JSON.stringify(data)); } catch(e) {}
}
function deleteCustomEntry(type, idx) {
  if (!confirm('Delete this custom entry?')) return;
  const data = loadCustom(type);
  data.splice(idx, 1);
  saveCustom(type, data);
  if (type === 'vocab')    renderVocab(currentVocabFilter, document.getElementById('vocab-search')?.value||'');
  if (type === 'kanji')    renderKanji(currentKanjiFilter||'all');
  if (type === 'grammar')  renderGrammar(document.getElementById('grammar-search')?.value||'');
  if (type === 'adj')      renderAdjPairs(currentAdjFilter||'all');
  if (type === 'counters') renderCounters(currentCounterFilter||'all');
  showToast('Entry deleted 🗑️');
}

// ── Pre-declare variables used across the file to avoid TDZ errors ──
var mascotTipIndex = 0;
var mascotBubbleTimer = null;
var phrasesFilter = 'all';
var currentVocabFilter = 'all';
var currentKanjiFilter = 'all';
var currentAdjFilter = 'all';
var currentCounterFilter = 'all';



// ============================================================
//  EGYPT CLOCK
// ============================================================
function updateClock() {
  const el = document.getElementById('clk-time');
  if (!el) return;
  const now = new Date();
  // Egypt is UTC+2 (EET) — no DST complications for a fixed offset approach
  const egypt = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Cairo' }));
  const h = String(egypt.getHours()).padStart(2,'0');
  const m = String(egypt.getMinutes()).padStart(2,'0');
  const s = String(egypt.getSeconds()).padStart(2,'0');
  el.textContent = h + ':' + m + ':' + s;
}
updateClock();
setInterval(updateClock, 1000);


// ============================================================
//  AMBIENT SOUND ENGINE (Web Audio API — no external files)
// ============================================================
let ambCtx = null, ambNodes = [], ambCurrent = 'off', ambVol = 0.35;

function getAudioCtx() {
  if (!ambCtx) ambCtx = new (window.AudioContext || window.webkitAudioContext)();
  return ambCtx;
}

function stopAmbient() {
  ambNodes.forEach(n => { try { n.stop(); } catch(e){} });
  ambNodes = [];
}

function makeWhiteNoise(ctx, gainVal, filterFreq, filterType) {
  const bufSize = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf; src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = filterType || 'lowpass';
  filter.frequency.value = filterFreq;
  const gain = ctx.createGain();
  gain.gain.value = gainVal * ambVol;
  src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  src.start(); ambNodes.push(src);
  return gain;
}

function makeTone(ctx, freq, gainVal, waveType) {
  const osc = ctx.createOscillator();
  osc.type = waveType || 'sine'; osc.frequency.value = freq;
  const gain = ctx.createGain();
  gain.gain.value = gainVal * ambVol;
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); ambNodes.push(osc);
  return gain;
}

function makeRainAmbient(ctx) {
  makeWhiteNoise(ctx, 0.55, 1800, 'lowpass');
  makeWhiteNoise(ctx, 0.18, 400, 'lowpass');
  // occasional drip pings
  function drip() {
    if (ambCurrent !== 'rain') return;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(1200 + Math.random()*600, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.35);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.04 * ambVol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.35);
    setTimeout(drip, 400 + Math.random() * 1200);
  }
  drip();
}

function makeCafeAmbient(ctx) {
  makeWhiteNoise(ctx, 0.07, 3200, 'bandpass');
  makeWhiteNoise(ctx, 0.04, 800, 'lowpass');
  function chatter() {
    if (ambCurrent !== 'cafe') return;
    const freqs = [220, 280, 350, 420, 180];
    freqs.forEach(f => {
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f + Math.random()*60;
      const g = ctx.createGain(); const t = ctx.currentTime;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.012 * ambVol, t + 0.1);
      g.gain.linearRampToValueAtTime(0, t + 0.3 + Math.random()*0.4);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.6);
    });
    setTimeout(chatter, 600 + Math.random() * 1400);
  }
  chatter();
  // cup clinks
  function clink() {
    if (ambCurrent !== 'cafe') return;
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 900 + Math.random()*300;
    const g = ctx.createGain(); const t = ctx.currentTime;
    g.gain.setValueAtTime(0.06 * ambVol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.5);
    setTimeout(clink, 3000 + Math.random() * 5000);
  }
  clink();
}

function makeTempleAmbient(ctx) {
  makeWhiteNoise(ctx, 0.025, 600, 'lowpass');
  const bellFreqs = [220, 293, 370, 440, 587];
  function bell() {
    if (ambCurrent !== 'temple') return;
    const f = bellFreqs[Math.floor(Math.random() * bellFreqs.length)];
    [1, 2, 3, 4].forEach((harm, i) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * harm;
      const g = ctx.createGain(); const t = ctx.currentTime;
      g.gain.setValueAtTime(0.06 * ambVol / (i + 1), t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3 + i);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 4 + i);
    });
    setTimeout(bell, 4000 + Math.random() * 6000);
  }
  bell();
}

function makeForestAmbient(ctx) {
  makeWhiteNoise(ctx, 0.12, 2000, 'bandpass');
  makeWhiteNoise(ctx, 0.06, 300, 'lowpass');
  function bird() {
    if (ambCurrent !== 'forest') return;
    const baseF = 800 + Math.random() * 1200;
    for (let i = 0; i < 3 + Math.floor(Math.random()*3); i++) {
      const o = ctx.createOscillator(); o.type = 'sine';
      const t = ctx.currentTime + i * 0.18;
      o.frequency.setValueAtTime(baseF, t);
      o.frequency.exponentialRampToValueAtTime(baseF * 1.4, t + 0.1);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.04 * ambVol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.2);
    }
    setTimeout(bird, 1500 + Math.random() * 3500);
  }
  bird();
}

function makeLofiAmbient(ctx) {
  makeWhiteNoise(ctx, 0.025, 500, 'lowpass'); // vinyl hiss
  const scale = [261, 294, 329, 349, 392, 440, 494, 523];
  let noteIdx = 0;
  function note() {
    if (ambCurrent !== 'lofi') return;
    const freq = scale[noteIdx % scale.length] * (Math.random() > 0.7 ? 0.5 : 1);
    noteIdx++;
    const o = ctx.createOscillator(); o.type = Math.random()>0.5?'triangle':'sine';
    o.frequency.value = freq;
    const g = ctx.createGain(); const t = ctx.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.06 * ambVol, t + 0.05);
    g.gain.setValueAtTime(0.06 * ambVol, t + 0.3);
    g.gain.linearRampToValueAtTime(0, t + 0.5);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.6);
    setTimeout(note, 350 + Math.random() * 500);
  }
  note();
}

const AMBIENT_MAKERS = { rain: makeRainAmbient, cafe: makeCafeAmbient, temple: makeTempleAmbient, forest: makeForestAmbient, lofi: makeLofiAmbient };

function setAmbient(type, btn) {
  stopAmbient();
  ambCurrent = type;
  document.querySelectorAll('.amb-option').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const ambBtn = document.getElementById('ambient-btn');
  const icons = { off:'🎵 Sounds', rain:'🌧️ Rain', cafe:'☕ Café', temple:'⛩️ Temple', forest:'🌿 Forest', lofi:'🎹 Lo-fi' };
  ambBtn.textContent = icons[type] || '🎵 Sounds';
  if (type === 'off') { ambBtn.classList.remove('playing'); return; }
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  AMBIENT_MAKERS[type](ctx);
  ambBtn.classList.add('playing');
  document.getElementById('ambient-panel').classList.remove('open');
}

function setAmbientVol(v) {
  ambVol = parseFloat(v);
  // Restart current ambient to apply new volume
  if (ambCurrent !== 'off') {
    const btn = document.getElementById('amb_' + ambCurrent);
    if (btn) setAmbient(ambCurrent, btn);
  }
}

function toggleAmbientPanel() {
  document.getElementById('ambient-panel').classList.toggle('open');
}
// Close ambient panel when clicking outside
document.addEventListener('click', e => {
  const wrap = document.getElementById('ambient-wrap');
  if (wrap && !wrap.contains(e.target)) document.getElementById('ambient-panel').classList.remove('open');
});


// ============================================================
//  GLOBAL SEARCH
// ============================================================
function openSearch() {
  document.getElementById('gsearch-overlay').classList.add('open');
  setTimeout(() => document.getElementById('gsearch-input').focus(), 50);
}
function closeSearch() {
  document.getElementById('gsearch-overlay').classList.remove('open');
  document.getElementById('gsearch-input').value = '';
  document.getElementById('gsearch-results').innerHTML = `<div id="gsearch-hint">Type to search across <strong>all 20 sections</strong> — kanji, grammar, vocab, phrases, counters &amp; more.<br><span style="font-size:.75rem;color:#ddd;">Tip: press <kbd style="background:#eee;border-radius:.3rem;padding:.1rem .35rem;color:#555;">/</kbd> anywhere to open</span></div>`;
}
function closeSearchIfOutside(e) {
  if (e.target === document.getElementById('gsearch-overlay')) closeSearch();
}
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault(); openSearch();
  }
  if (e.key === 'Escape') { closeSearch(); closeStrokeModal(); }
});

function runSearch(q) {
  const res = document.getElementById('gsearch-results');
  if (!q || q.trim().length < 1) { closeSearch(); openSearch(); return; }
  const term = q.trim().toLowerCase();
  const results = [];

  // Search KANJI
  (typeof KANJI !== 'undefined' ? KANJI : []).forEach(k => {
    if (k.char.includes(term) || k.meaning.toLowerCase().includes(term) ||
        k.on.toLowerCase().includes(term) || (k.kun||'').toLowerCase().includes(term)) {
      results.push({ section:'kanji', icon:'漢', tag:'Kanji', tagColor:'#4cc9f0',
        title: k.char + ' — ' + k.meaning, sub: 'On: ' + k.on + (k.kun?' · Kun: '+k.kun:'') + ' · ' + k.strokes + ' strokes',
        action: () => { showSection('kanji'); }
      });
    }
  });

  // Search VOCAB
  (typeof VOCAB !== 'undefined' ? VOCAB : []).forEach(v => {
    if (v.jp.includes(term) || v.read.toLowerCase().includes(term) || v.en.toLowerCase().includes(term)) {
      results.push({ section:'vocab', icon:'📝', tag:'Vocab', tagColor:'#ffcc80',
        title: v.jp + ' (' + v.read + ')', sub: v.en + ' · ' + v.cat,
        action: () => { showSection('vocab'); }
      });
    }
  });

  // Search GRAMMAR
  (typeof GRAMMAR_SECTIONS !== 'undefined' ? GRAMMAR_SECTIONS : []).forEach(sec => {
    sec.items.forEach(item => {
      if (item.pattern.toLowerCase().includes(term) || item.meaning.toLowerCase().includes(term) ||
          (item.explanation||'').toLowerCase().includes(term)) {
        results.push({ section:'grammar', icon:'📖', tag:'Grammar', tagColor:'#ff85a1',
          title: item.pattern, sub: item.meaning + ' — ' + sec.title,
          action: () => { showSection('grammar'); }
        });
      }
    });
  });

  // Search SURVIVAL PHRASES
  (typeof SURVIVAL_PHRASES !== 'undefined' ? SURVIVAL_PHRASES : []).forEach(p => {
    if (p.jp.includes(term) || p.rom.toLowerCase().includes(term) || p.en.toLowerCase().includes(term)) {
      results.push({ section:'phrases', icon:'💬', tag:'Phrases', tagColor:'#06d6a0',
        title: p.jp, sub: p.rom + ' — ' + p.en,
        action: () => { showSection('phrases'); }
      });
    }
  });

  // Search COUNTERS
  (typeof COUNTERS !== 'undefined' ? COUNTERS : []).forEach(c => {
    if (c.name.toLowerCase().includes(term) || c.suffix.includes(term) || c.desc.toLowerCase().includes(term)) {
      results.push({ section:'counters', icon:'🔢', tag:'Counters', tagColor:'#a5d6a7',
        title: c.suffix + ' — ' + c.name, sub: c.desc,
        action: () => { showSection('counters'); }
      });
    }
  });

  // Search COMPREHENSION
  (typeof COMP_PASSAGES !== 'undefined' ? COMP_PASSAGES : []).forEach(p => {
    if (p.title.toLowerCase().includes(term) || p.titleEn.toLowerCase().includes(term) || p.passage.includes(term)) {
      results.push({ section:'comprehension', icon:'🧠', tag:'Comprehension', tagColor:'#f7c59f',
        title: p.title + ' — ' + p.titleEn, sub: p.diff + ' · ' + p.questions.length + ' questions',
        action: () => { showSection('comprehension'); }
      });
    }
  });

  if (results.length === 0) {
    res.innerHTML = `<div id="gsearch-empty">😔 No results for "<strong>${q}</strong>" — try a different word or kanji</div>`;
    return;
  }

  const grouped = {};
  results.forEach(r => { if (!grouped[r.tag]) grouped[r.tag] = []; grouped[r.tag].push(r); });
  let html = '';
  Object.entries(grouped).forEach(([tag, items]) => {
    html += `<div class="gsr-section-label">${tag} (${items.length})</div>`;
    items.slice(0, 8).forEach(item => {
      html += `<div class="gsr-item" onclick="(${item.action.toString()})();closeSearch();">
        <div class="gsr-icon">${item.icon}</div>
        <div class="gsr-main">
          <div class="gsr-title">${item.title}</div>
          <div class="gsr-sub">${item.sub}</div>
        </div>
        <span class="gsr-tag" style="background:${item.tagColor}22;color:${item.tagColor};border:1px solid ${item.tagColor}44;">${item.tag}</span>
      </div>`;
    });
    if (items.length > 8) html += `<div style="font-size:.72rem;color:#aaa;padding:.3rem .8rem;">…and ${items.length-8} more — keep typing to narrow down</div>`;
  });
  res.innerHTML = html;
}


// ============================================================
//  STROKE ORDER ANIMATIONS
// ============================================================
// Stroke data: each kanji maps to an array of SVG path strings
// Coordinate system: 0-200 x 0-200 viewBox
// Strokes are drawn sequentially with animation
const STROKE_DATA = {
  '一': [['M20,100 L180,100']],
  '二': [['M30,70 L170,70'],['M20,130 L180,130']],
  '三': [['M40,55 L160,55'],['M20,100 L180,100'],['M30,145 L170,145']],
  '四': [['M40,30 L40,170'],['M160,30 L160,170'],['M40,30 L160,30'],['M40,100 L160,100'],['M70,100 L70,170'],['M120,100 L120,170'],['M40,170 L160,170']],
  '五': [['M30,50 L170,50'],['M100,50 L100,110'],['M30,110 L170,110'],['M50,110 Q40,155 80,170 Q120,185 160,165'],['M30,165 L170,165']],
  '六': [['M100,25 L100,60'],['M60,60 L140,60'],['M50,90 Q30,140 60,175'],['M150,90 Q170,140 140,175']],
  '七': [['M30,65 L170,65'],['M120,30 Q115,100 80,175']],
  '八': [['M95,35 Q75,80 40,170'],['M105,35 Q125,80 160,170']],
  '九': [['M55,35 Q100,75 100,120 Q100,170 60,175'],['M145,70 Q120,100 60,105']],
  '十': [['M100,25 L100,175'],['M25,100 L175,100']],
  '百': [['M60,30 L140,30'],['M100,30 L100,70'],['M25,70 L175,70'],['M55,70 L55,175'],['M55,100 L145,100'],['M55,130 L145,130'],['M55,175 L145,175'],['M145,70 L145,175']],
  '千': [['M30,55 L170,55'],['M100,25 L100,175'],['M30,120 L170,120']],
  '万': [['M30,50 L170,50'],['M110,50 Q170,110 155,175'],['M110,90 Q80,145 40,170']],
  '円': [['M50,25 L50,175'],['M150,25 L150,175'],['M50,25 L150,25'],['M50,85 L150,85'],['M50,175 L150,175'],['M85,85 L85,175'],['M115,85 L115,175']],
  '日': [['M45,25 L45,175'],['M155,25 L155,175'],['M45,25 L155,25'],['M45,100 L155,100'],['M45,175 L155,175']],
  '月': [['M50,25 Q35,100 45,175'],['M155,25 L155,175'],['M50,25 L155,25'],['M52,100 L155,100'],['M50,175 L155,175']],
  '年': [['M60,35 L140,35'],['M100,35 L100,75'],['M30,75 L170,75'],['M70,75 L70,175'],['M70,120 L145,120'],['M145,75 L145,175'],['M70,175 L145,175']],
  '時': [['M35,30 L35,175'],['M35,85 L90,85'],['M35,130 L90,130'],['M65,30 L65,85'],['M110,30 L110,175'],['M110,80 Q145,55 170,80'],['M110,120 Q145,105 170,120'],['M110,160 Q145,150 170,160']],
  '分': [['M75,30 L100,70'],['M125,30 L100,70'],['M100,70 L100,175'],['M60,120 L140,120']],
  '何': [['M50,30 L50,175'],['M50,80 L140,80'],['M50,130 L95,130'],['M110,30 L110,175'],['M140,30 L140,80'],['M140,80 Q165,120 150,175'],['M110,50 L140,50']],
  '人': [['M100,25 Q75,80 40,175'],['M105,25 Q130,90 165,175']],
  '山': [['M100,25 L100,175'],['M30,175 L30,90 Q65,30 100,25'],['M170,175 L170,90 Q135,30 100,25']],
  '川': [['M65,25 Q55,100 65,175'],['M100,25 L100,175'],['M135,25 Q145,100 135,175']],
  '田': [['M40,25 L40,175'],['M160,25 L160,175'],['M40,25 L160,25'],['M40,100 L160,100'],['M40,175 L160,175'],['M100,25 L100,175']],
  '木': [['M100,25 L100,175'],['M30,85 L170,85'],['M40,175 Q70,130 100,110'],['M160,175 Q130,130 100,110']],
  '火': [['M100,30 L100,90'],['M45,175 Q75,130 100,90'],['M155,175 Q125,130 100,90'],['M65,130 Q100,155 135,130']],
  '水': [['M100,25 L100,175'],['M45,70 Q75,90 100,85'],['M155,70 Q125,90 100,85'],['M40,145 Q70,165 100,155'],['M160,145 Q130,165 100,155']],
  '金': [['M100,25 L100,100'],['M40,65 L160,65'],['M60,100 L140,100'],['M35,135 L165,135'],['M55,175 Q100,155 145,175'],['M75,135 L55,175'],['M125,135 L145,175']],
  '土': [['M100,25 L100,155'],['M30,155 L170,155'],['M50,90 L150,90']],
  '天': [['M40,55 L160,55'],['M25,100 L175,100'],['M100,100 Q65,140 45,175'],['M100,100 Q135,140 155,175']],
  '気': [['M55,30 L55,175'],['M55,75 L145,75'],['M55,120 L100,120'],['M105,30 L105,75'],['M145,30 L145,75'],['M100,120 Q130,148 155,130'],['M100,148 Q115,165 100,178']],
  '大': [['M100,25 L100,175'],['M25,80 L175,80'],['M35,175 Q67,130 100,110'],['M165,175 Q133,130 100,110']],
  '小': [['M100,30 L100,175'],['M45,75 Q55,110 50,140'],['M155,75 Q145,110 150,140']],
  '上': [['M100,25 L100,155'],['M30,155 L170,155'],['M55,75 L145,75']],
  '下': [['M100,25 L100,155'],['M30,55 L170,55'],['M85,155 L100,175 L115,155']],
  '中': [['M100,25 L100,175'],['M40,70 L40,130 L160,130 L160,70 L40,70']],
  '本': [['M100,25 L100,175'],['M30,85 L170,85'],['M40,175 Q70,130 100,110'],['M160,175 Q130,130 100,110'],['M80,135 L120,135']],
  '白': [['M65,25 Q50,90 55,175'],['M135,25 Q150,90 145,175'],['M55,25 L145,25'],['M55,75 L145,75'],['M55,120 L145,120'],['M55,175 L145,175']],
  '見': [['M55,30 L145,30'],['M100,30 L100,90'],['M45,90 L155,90'],['M65,90 Q55,140 40,175'],['M100,90 L100,175'],['M135,90 Q145,140 160,175']],
  '聞': [['M40,25 L40,175'],['M160,25 L160,175'],['M40,25 L160,25'],['M40,85 L160,85'],['M40,175 L160,175'],['M100,25 L100,85'],['M70,85 L70,175'],['M130,85 L130,175'],['M70,130 L130,130']],
  '食': [['M100,25 L100,75'],['M40,55 L160,55'],['M55,75 L145,75'],['M60,75 L40,175'],['M100,75 L100,175'],['M140,75 L160,175'],['M55,120 L145,120']],
  '飲': [['M55,25 L55,175'],['M55,70 L130,70'],['M55,120 L115,120'],['M95,25 Q130,60 165,45'],['M130,70 Q155,100 150,175'],['M115,120 Q135,148 130,175']],
  '行': [['M100,25 L100,75'],['M50,50 L150,50'],['M55,75 L55,175'],['M145,75 L145,175'],['M55,125 L145,125'],['M55,175 L145,175']],
  '来': [['M100,25 L100,75'],['M40,65 L160,65'],['M40,110 L160,110'],['M45,175 Q72,140 100,120'],['M155,175 Q128,140 100,120']],
  '帰': [['M55,25 L55,175'],['M55,80 L145,80'],['M100,25 L100,80'],['M145,25 L145,175'],['M55,130 L145,130'],['M55,175 L145,175']],
  '出': [['M100,25 L100,175'],['M55,70 L55,125 L145,125 L145,70'],['M40,175 L160,175']],
  '入': [['M95,25 Q65,80 35,175'],['M100,25 Q130,90 165,175']],
  '買': [['M45,35 L155,35'],['M100,35 L100,80'],['M40,80 L160,80'],['M70,80 L70,175'],['M130,80 L130,175'],['M70,120 L130,120'],['M70,175 L130,175'],['M45,55 L155,55']],
  '読': [['M40,35 L40,175'],['M40,90 L120,90'],['M40,135 L120,135'],['M80,35 L80,90'],['M130,35 Q165,65 160,100 Q155,140 130,175'],['M120,90 Q140,112 120,135']],
  '書': [['M50,35 L150,35'],['M50,70 L150,70'],['M50,105 L150,105'],['M65,35 L65,105'],['M100,35 L100,105'],['M135,35 L135,105'],['M55,140 L145,140'],['M100,140 L100,175'],['M60,175 L140,175']],
  '話': [['M35,35 L35,175'],['M35,90 L95,90'],['M35,140 L95,140'],['M65,35 L65,90'],['M105,35 L105,175'],['M145,35 Q175,60 170,90 Q165,120 145,130'],['M105,90 L145,90'],['M105,130 L160,130'],['M115,155 Q140,165 115,180']],
  '聴': [['M35,30 L35,175'],['M35,80 L90,80'],['M35,130 L90,130'],['M65,30 L65,80'],['M100,30 L100,90'],['M130,30 L165,50'],['M100,90 L165,90'],['M130,90 L130,175'],['M100,130 L165,130'],['M100,175 L165,175']],
  '語': [['M35,30 L35,175'],['M35,80 L95,80'],['M35,130 L95,130'],['M65,30 L65,80'],['M105,30 L105,175'],['M140,30 L165,60'],['M105,75 L165,75'],['M105,115 L165,115'],['M105,155 L165,155'],['M105,175 L165,175']],
  '学': [['M70,25 L130,25'],['M100,25 L100,75'],['M45,55 L155,55'],['M55,75 L145,75'],['M100,75 L100,175'],['M55,120 L145,120']],
  '校': [['M40,30 L40,175'],['M40,85 L100,85'],['M40,135 L100,135'],['M70,30 L70,85'],['M110,30 L110,175'],['M140,30 Q165,50 165,85 Q165,120 140,140'],['M110,85 L155,85'],['M110,140 L155,140']],
  '先': [['M70,25 L130,25'],['M100,25 L100,100'],['M30,75 L170,75'],['M55,100 L145,100'],['M75,150 Q100,175 125,150'],['M100,100 L100,175']],
  '生': [['M100,25 L100,175'],['M30,75 L170,75'],['M30,120 L170,120'],['M60,25 L140,25']],
  '電': [['M40,25 L40,120'],['M160,25 L160,120'],['M40,25 L160,25'],['M40,75 L160,75'],['M40,120 L160,120'],['M100,25 L100,120'],['M55,120 Q40,148 55,175'],['M100,120 L100,175'],['M145,120 Q160,148 145,175']],
  '車': [['M100,25 L100,175'],['M30,65 L170,65'],['M30,120 L170,120'],['M55,25 L55,65'],['M145,25 L145,65'],['M40,175 L160,175']],
  '駅': [['M35,30 L35,175'],['M35,90 L100,90'],['M35,140 L100,140'],['M65,30 L65,90'],['M110,30 Q140,55 140,90 Q140,120 115,140'],['M110,90 L140,90'],['M110,140 L155,175'],['M140,140 L110,175']],
  '国': [['M35,25 L35,175'],['M165,25 L165,175'],['M35,25 L165,25'],['M35,175 L165,175'],['M90,70 L90,130 L125,130 L125,70 L90,70'],['M100,130 L100,160']],
  '私': [['M55,25 Q40,80 45,175'],['M55,70 L120,70'],['M85,25 L85,70'],['M120,25 L120,70'],['M130,30 Q165,55 160,85 Q155,120 130,140'],['M120,70 Q145,90 140,140'],['M120,140 L100,175'],['M140,140 L160,175']],
  '友': [['M40,50 L160,50'],['M70,50 Q55,100 40,175'],['M100,50 L100,100'],['M150,50 Q160,100 145,175'],['M60,120 L140,120']],
  '父': [['M70,30 L130,30'],['M70,30 L40,175'],['M130,30 L160,175'],['M40,115 L160,115']],
  '母': [['M55,25 L55,175'],['M55,70 L145,70'],['M55,120 L145,120'],['M145,25 L145,175'],['M80,70 L80,120'],['M120,70 L120,120'],['M30,175 L170,175']],
  '子': [['M65,30 Q110,55 130,75'],['M100,35 L100,100'],['M30,100 L170,100'],['M85,100 Q70,145 55,175'],['M115,100 Q130,145 145,175']],
  '女': [['M100,30 L100,90'],['M30,90 L170,90'],['M45,175 Q72,140 100,110 Q128,140 155,175'],['M65,65 L135,65']],
  '男': [['M40,25 L160,25'],['M100,25 L100,85'],['M40,85 L160,85'],['M70,85 L70,175'],['M130,85 L130,175'],['M70,130 L130,130'],['M70,175 L130,175']],
  '好': [['M55,25 L55,100'],['M25,65 L85,65'],['M85,25 L85,100'],['M115,25 Q150,45 150,75 Q150,105 115,120'],['M115,120 Q140,148 130,175'],['M115,75 L150,75']],
  '高': [['M100,25 L100,75'],['M45,55 L155,55'],['M55,75 L145,75'],['M55,75 L55,145 L145,145 L145,75'],['M55,110 L145,110'],['M70,145 L70,175'],['M130,145 L130,175'],['M70,175 L130,175']],
  '安': [['M100,25 L100,75'],['M30,55 L170,55'],['M70,100 L130,100'],['M55,130 Q100,165 145,130'],['M100,100 L100,175']],
  '新': [['M45,30 L45,175'],['M45,80 L115,80'],['M45,130 L115,130'],['M75,30 L75,80'],['M125,30 L125,80'],['M155,30 L125,60'],['M125,80 Q155,100 155,135 Q155,160 130,175'],['M115,80 Q140,100 140,130 Q140,150 120,165']],
  '古': [['M40,50 L160,50'],['M100,50 L100,175'],['M45,95 L155,95'],['M55,175 L145,175']],
  '長': [['M100,25 L100,75'],['M35,55 L165,55'],['M55,75 L145,75'],['M60,75 Q45,120 50,175'],['M140,75 Q155,120 150,175'],['M55,120 L145,120'],['M50,175 L150,175']],
  '多': [['M35,40 L165,40'],['M45,80 Q100,65 155,80'],['M35,120 L165,120'],['M45,160 Q100,145 155,160']],
  '少': [['M100,25 L100,100'],['M35,75 L165,75'],['M60,125 Q80,155 70,180'],['M140,100 Q155,140 140,175']],
  '毎': [['M100,25 L100,75'],['M35,55 L165,55'],['M55,75 L55,175'],['M145,75 L145,175'],['M55,120 L145,120'],['M55,175 L145,175'],['M80,75 L80,120'],['M120,75 L120,120']],
  '今': [['M100,25 L100,80'],['M30,60 L170,60'],['M65,80 L135,80'],['M55,130 Q100,115 145,130'],['M100,80 L100,175']],
  '週': [['M40,30 L40,175'],['M160,30 L160,175'],['M40,30 L160,30'],['M40,80 L160,80'],['M40,130 L160,130'],['M40,175 L160,175'],['M100,30 L100,175']],
  '午': [['M100,25 L100,75'],['M30,55 L170,55'],['M100,75 L100,175'],['M40,120 L160,120']],
  '前': [['M100,25 L100,80'],['M30,55 L170,55'],['M55,80 L55,175'],['M145,80 L145,175'],['M55,120 L145,120'],['M55,175 L145,175'],['M80,80 L80,120'],['M120,80 L120,120']],
  '後': [['M55,25 L55,175'],['M55,75 L130,75'],['M55,130 L130,130'],['M90,25 L90,75'],['M140,25 Q170,50 170,80 Q170,115 140,130'],['M130,75 Q155,95 155,120 Q155,145 130,160'],['M130,130 L155,175']],
  '東': [['M100,25 L100,175'],['M30,70 L170,70'],['M30,120 L170,120'],['M55,25 L55,70'],['M145,25 L145,70'],['M40,175 Q70,148 100,130'],['M160,175 Q130,148 100,130']],
  '西': [['M35,35 L165,35'],['M45,35 L45,155'],['M155,35 L155,155'],['M45,90 L155,90'],['M45,155 L155,155'],['M75,90 L75,155'],['M125,90 L125,155']],
  '南': [['M100,25 L100,75'],['M35,55 L165,55'],['M50,75 L50,175'],['M150,75 L150,175'],['M50,120 L150,120'],['M50,175 L150,175'],['M100,75 L100,175'],['M50,75 L150,75']],
  '北': [['M75,25 L75,100'],['M75,65 L155,65'],['M155,25 L155,100'],['M30,125 L170,125'],['M60,125 Q50,155 60,175'],['M100,125 L100,175'],['M140,125 Q150,155 140,175']],
  '右': [['M100,25 Q70,65 35,90'],['M100,25 Q130,65 165,90'],['M65,90 L135,90'],['M100,90 L100,175']],
  '左': [['M100,25 Q70,65 35,90'],['M100,25 Q130,65 165,90'],['M65,90 L135,90'],['M100,90 L100,175'],['M55,65 L145,65']],
};

let strokeCurrent = null, strokeStepIdx = 0, strokeAnimTimer = null;

function openStrokeModal(char, e) {
  if (e) e.stopPropagation();
  strokeCurrent = char;
  strokeStepIdx = 0;
  clearInterval(strokeAnimTimer);
  renderStrokeModal(char);
  document.getElementById('stroke-modal-overlay').classList.add('open');
}

function closeStrokeModal() {
  document.getElementById('stroke-modal-overlay').classList.remove('open');
  clearInterval(strokeAnimTimer);
  strokeCurrent = null;
}

function closeStrokeIfOutside(e) {
  if (e.target === document.getElementById('stroke-modal-overlay')) closeStrokeModal();
}

function renderStrokeModal(char) {
  const k = (typeof KANJI !== 'undefined' ? KANJI : []).find(k => k.char === char);
  if (!k) return;
  const strokes = STROKE_DATA[char] || [];
  const hasStrokes = strokes.length > 0;

  const content = document.getElementById('stroke-modal-content');
  content.innerHTML = `
    <div style="text-align:center;margin-bottom:1rem;">
      <div style="font-size:.7rem;font-weight:800;color:var(--pink);letter-spacing:.06em;text-transform:uppercase;margin-bottom:.3rem;">Stroke Order</div>
      <div style="font-size:1.1rem;font-weight:900;color:var(--mid);">${char} — ${k.meaning}</div>
      <div style="font-size:.78rem;color:#aaa;margin-top:.2rem;">On: ${k.on} · Kun: ${k.kun||'—'} · ${k.strokes} stroke${k.strokes!==1?'s':''}</div>
    </div>
    <div class="stroke-canvas-wrap">
      <div style="display:flex;flex-direction:column;align-items:center;gap:.5rem;">
        <svg id="stroke-svg-area" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <!-- Grid lines -->
          <line x1="100" y1="0" x2="100" y2="200" class="stroke-grid-line"/>
          <line x1="0" y1="100" x2="200" y2="100" class="stroke-grid-line"/>
          <line x1="0" y1="0" x2="200" y2="200" class="stroke-grid-line" style="stroke-dasharray:4,6;stroke:rgba(255,182,193,.15)"/>
          <line x1="200" y1="0" x2="0" y2="200" class="stroke-grid-line" style="stroke-dasharray:4,6;stroke:rgba(255,182,193,.15)"/>
          <text x="100" y="115" text-anchor="middle" font-size="120" font-family="serif" fill="rgba(255,182,193,0.08)" dominant-baseline="middle">${char}</text>
          <g id="stroke-paths"></g>
        </svg>
        <div class="stroke-step-info" id="stroke-step-info">${hasStrokes ? 'Press Play to animate stroke order' : '✏️ ' + k.strokes + ' strokes — tap the kanji to hear it'}</div>
      </div>
    </div>
    <div class="stroke-controls">
      ${hasStrokes ? `
      <button class="stroke-btn" onclick="strokePlay()">▶ Play</button>
      <button class="stroke-btn" onclick="strokeBack()">⟨ Back</button>
      <button class="stroke-btn" onclick="strokeStepFwd()">Next ⟩</button>
      <button class="stroke-btn" onclick="strokeReset()">↺ Reset</button>
      ` : '<div style="color:#aaa;font-size:.8rem;font-style:italic;">Stroke animation coming soon for this kanji</div>'}
      <button class="stroke-btn" onclick="speakJP('${char}',this)">🔊 Listen</button>
    </div>`;

  if (hasStrokes) drawStrokes(char, strokes.length);
}

let currentStrokeIdx = 0;

function drawStrokes(char, upTo) {
  const strokes = STROKE_DATA[char] || [];
  const g = document.getElementById('stroke-paths');
  if (!g) return;
  g.innerHTML = '';
  for (let i = 0; i < Math.min(upTo, strokes.length); i++) {
    const strokePaths = strokes[i];
    const color = i === upTo - 1 ? '#ff85a1' : '#3d1a2e';
    const group = document.createElementNS('http://www.w3.org/2000/svg','g');
    strokePaths.forEach(d => {
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d', d);
      path.setAttribute('fill','none');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width','9');
      path.setAttribute('stroke-linecap','round');
      path.setAttribute('stroke-linejoin','round');
      // Animate the newest stroke
      if (i === upTo - 1) {
        const len = 300;
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        path.style.transition = 'stroke-dashoffset 0.55s ease';
        setTimeout(() => { path.style.strokeDashoffset = 0; }, 30);
      }
      group.appendChild(path);
    });
    // Stroke number badge
    const firstPath = strokePaths[0];
    const match = firstPath.match(/M([\d.]+),([\d.]+)/);
    if (match) {
      const bx = parseFloat(match[1]), by = parseFloat(match[2]);
      const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
      circle.setAttribute('cx', bx); circle.setAttribute('cy', by); circle.setAttribute('r','10');
      circle.setAttribute('fill', i === upTo-1 ? '#ff85a1' : 'rgba(100,50,80,0.5)');
      const text = document.createElementNS('http://www.w3.org/2000/svg','text');
      text.setAttribute('x', bx); text.setAttribute('y', by);
      text.setAttribute('text-anchor','middle'); text.setAttribute('dominant-baseline','central');
      text.setAttribute('font-size','9'); text.setAttribute('fill','white'); text.setAttribute('font-weight','900');
      text.textContent = i + 1;
      group.appendChild(circle); group.appendChild(text);
    }
    g.appendChild(group);
    // Darken previous strokes
    if (i < upTo - 1) {
      group.querySelectorAll('path').forEach(p => p.setAttribute('stroke','rgba(61,26,46,0.45)'));
    }
  }
  currentStrokeIdx = upTo;
  const info = document.getElementById('stroke-step-info');
  if (info) {
    const total = strokes.length;
    if (upTo === 0) info.textContent = 'Press Play or Next to start';
    else if (upTo >= total) info.textContent = `✅ All ${total} strokes complete!`;
    else info.textContent = `Stroke ${upTo} of ${total}`;
  }
}

function strokePlay() {
  if (!strokeCurrent) return;
  const strokes = STROKE_DATA[strokeCurrent] || [];
  if (!strokes.length) return;
  clearInterval(strokeAnimTimer);
  currentStrokeIdx = 0;
  drawStrokes(strokeCurrent, 0);
  let i = 1;
  strokeAnimTimer = setInterval(() => {
    drawStrokes(strokeCurrent, i);
    i++;
    if (i > strokes.length) clearInterval(strokeAnimTimer);
  }, 700);
}

function strokeStepFwd() {
  if (!strokeCurrent) return;
  const strokes = STROKE_DATA[strokeCurrent] || [];
  if (currentStrokeIdx < strokes.length) drawStrokes(strokeCurrent, currentStrokeIdx + 1);
}

function strokeBack() {
  if (!strokeCurrent) return;
  const next = Math.max(0, currentStrokeIdx - 1);
  drawStrokes(strokeCurrent, next);
}

function strokeReset() {
  clearInterval(strokeAnimTimer);
  if (strokeCurrent) drawStrokes(strokeCurrent, 0);
}


// ============================================================
//  TEXT-TO-SPEECH
// ============================================================
let ttsSpeed = 0.65;
let _ttsActive = null;

function setTTSSpeed(speed, btn) {
  ttsSpeed = speed;
  document.querySelectorAll('.tts-speed-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// speakJP — used everywhere (grammar, listening, vocab, etc.)
function speakJP(text, btn, speed) {
  const synth = window.speechSynthesis;
  if (!synth) { alert('Text-to-speech is not supported in this browser. Try Chrome or Edge!'); return; }
  synth.cancel();
  // Toggle off if already speaking this button
  if (btn && btn.dataset.speaking === '1') {
    btn.dataset.speaking = '0';
    btn.classList.remove('playing','speaking');
    const statusEl = document.getElementById('tts-status');
    if (statusEl) statusEl.textContent = 'Stopped ■';
    return;
  }
  const rate = (speed !== undefined) ? speed : ttsSpeed;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';
  utter.rate = rate;
  utter.pitch = 1.05;
  // Pick best Japanese voice available
  const voices = synth.getVoices();
  const jaVoice = voices.find(v => v.lang === 'ja-JP') || voices.find(v => v.lang.startsWith('ja'));
  if (jaVoice) utter.voice = jaVoice;

  if (btn) {
    btn.dataset.speaking = '1';
    btn.classList.add('playing');
  }
  const statusEl = document.getElementById('tts-status');
  if (statusEl) statusEl.textContent = '🔊 Speaking...';

  utter.onend = utter.onerror = () => {
    if (btn) { btn.dataset.speaking = '0'; btn.classList.remove('playing','speaking'); }
    if (statusEl) statusEl.textContent = 'Ready ✓';
  };
  synth.speak(utter);
}
// Alias for backwards compat
const speakJapanese = speakJP;

// Voices load async in some browsers — ensure we can find ja voice
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {};
}

// ============================================================
//  SRS — SPACED REPETITION
// ============================================================

//  SRS — SPACED REPETITION
// ============================================================
function getSRSData() {
  try { return JSON.parse(localStorage.getItem('sakura_srs') || '{}'); } catch(e) { return {}; }
}
function saveSRSData(d) {
  try { localStorage.setItem('sakura_srs', JSON.stringify(d)); } catch(e) {}
}
function markSRS(type, id, status) {
  const d = getSRSData();
  if (!d[type]) d[type] = {};
  d[type][id] = { status, date: new Date().toISOString() };
  saveSRSData(d);
  // Update badge on card
  const card = document.getElementById(id);
  if (card) {
    card.querySelectorAll('.srs-badge').forEach(b => b.remove());
    const badge = document.createElement('span');
    badge.className = `srs-badge ${status}`;
    badge.textContent = status === 'known' ? '✅ Known' : '🔁 Review';
    const actions = card.querySelector('.listen-actions');
    if (actions) actions.appendChild(badge);
  }
  if (document.getElementById('progress').classList.contains('active')) renderProgress();
}
function getSRSBadge(type, id) {
  const d = getSRSData();
  const item = d[type] && d[type][id];
  if (!item) return '';
  return `<span class="srs-badge ${item.status}">${item.status === 'known' ? '✅ Known' : '🔁 Review'}</span>`;
}

// ============================================================
//  SCORE TRACKER
// ============================================================
function saveScore(type, score, total) {
  try {
    const h = JSON.parse(localStorage.getItem('sakura_scores') || '[]');
    h.unshift({ type, score, total, pct: Math.round(score/total*100), date: new Date().toISOString() });
    if (h.length > 100) h.pop();
    localStorage.setItem('sakura_scores', JSON.stringify(h));
  } catch(e) {}
}
function getScores() {
  try { return JSON.parse(localStorage.getItem('sakura_scores') || '[]'); } catch(e) { return []; }
}

// ============================================================
//  STREAK TRACKER
// ============================================================
function getStreak() {
  try {
    const raw = localStorage.getItem('sakura_streak');
    const d = raw ? JSON.parse(raw) : { streak: 0, lastDate: '' };
    const today = new Date().toDateString();
    const last = d.lastDate ? new Date(d.lastDate).toDateString() : '';
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (last === today) return d; // already recorded today
    if (last === yesterday) d.streak = (d.streak || 0) + 1;
    else d.streak = 1;
    d.lastDate = new Date().toISOString();
    localStorage.setItem('sakura_streak', JSON.stringify(d));
    return d;
  } catch(e) { return { streak: 1 }; }
}
getStreak(); // record visit on page load

// ============================================================
//  LISTENING PRACTICE DATA & RENDER

// ============================================================
//  SCORE TRACKER
// ============================================================
function saveScore(type, score, total) {
  try {
    const h = JSON.parse(localStorage.getItem('sakura_scores') || '[]');
    h.unshift({ type, score, total, pct: Math.round(score/total*100), date: new Date().toISOString() });
    if (h.length > 100) h.pop();
    localStorage.setItem('sakura_scores', JSON.stringify(h));
  } catch(e) {}
}
function getScores() {
  try { return JSON.parse(localStorage.getItem('sakura_scores') || '[]'); } catch(e) { return []; }
}

// ============================================================
//  STREAK TRACKER
// ============================================================
function getStreak() {
  try {
    const raw = localStorage.getItem('sakura_streak');
    const d = raw ? JSON.parse(raw) : { streak: 0, lastDate: '' };
    const today = new Date().toDateString();
    const last = d.lastDate ? new Date(d.lastDate).toDateString() : '';
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (last === today) return d; // already recorded today
    if (last === yesterday) d.streak = (d.streak || 0) + 1;
    else d.streak = 1;
    d.lastDate = new Date().toISOString();
    localStorage.setItem('sakura_streak', JSON.stringify(d));
    return d;
  } catch(e) { return { streak: 1 }; }
}
getStreak(); // record visit on page load

// ============================================================
//  LISTENING PRACTICE DATA & RENDER
// ============================================================
const LISTEN_CATEGORIES = [
  { title: '🌅 Greetings & Daily Phrases', icon: '🌅', items: [
    { jp: 'おはようございます。', rom: 'Ohayou gozaimasu.', en: 'Good morning. (polite)' },
    { jp: 'こんにちは！', rom: 'Konnichiwa!', en: 'Hello! / Good afternoon!' },
    { jp: 'こんばんは。', rom: 'Konbanwa.', en: 'Good evening.' },
    { jp: 'おやすみなさい。', rom: 'Oyasuminasai.', en: 'Good night.' },
    { jp: 'ありがとうございます。', rom: 'Arigatou gozaimasu.', en: 'Thank you very much.' },
    { jp: 'すみません。', rom: 'Sumimasen.', en: 'Excuse me. / Sorry.' },
    { jp: 'はじめまして。どうぞ よろしく。', rom: 'Hajimemashite. Douzo yoroshiku.', en: 'Nice to meet you.' },
    { jp: 'おげんきですか。', rom: 'Ogenki desu ka?', en: 'How are you?' },
    { jp: 'はい、げんきです。ありがとう。', rom: 'Hai, genki desu. Arigatou.', en: 'Yes, I\'m fine. Thank you.' },
    { jp: 'またね！', rom: 'Mata ne!', en: 'See you later!' },
    { jp: 'いってきます！', rom: 'Ittekimasu!', en: 'I\'m heading out!' },
    { jp: 'おかえりなさい。', rom: 'Okaerinasai.', en: 'Welcome back.' },
    { jp: 'いただきます！', rom: 'Itadakimasu!', en: 'Let\'s eat! (before meals)' },
    { jp: 'ごちそうさまでした。', rom: 'Gochisousama deshita.', en: 'Thank you for the meal.' },
  ]},
  { title: '🛒 Shopping & Numbers', icon: '🏪', items: [
    { jp: 'これは いくらですか。', rom: 'Kore wa ikura desu ka?', en: 'How much is this?' },
    { jp: 'ひゃくえんです。', rom: 'Hyaku-en desu.', en: 'It\'s 100 yen.' },
    { jp: 'これを ください。', rom: 'Kore o kudasai.', en: 'Please give me this.' },
    { jp: 'りんごを みっつ ください。', rom: 'Ringo o mittsu kudasai.', en: 'Three apples, please.' },
    { jp: 'たかいですね。やすいのは ありますか。', rom: 'Takai desu ne. Yasui no wa arimasu ka?', en: 'That\'s expensive! Do you have a cheaper one?' },
    { jp: 'クレジットカードは つかえますか。', rom: 'Kurejitto kaado wa tsukaemasu ka?', en: 'Can I use a credit card?' },
    { jp: 'レシートを ください。', rom: 'Reshiito o kudasai.', en: 'Please give me a receipt.' },
    { jp: 'ふくろは いりますか。', rom: 'Fukuro wa irimasu ka?', en: 'Do you need a bag?' },
  ]},
  { title: '🕐 Time & Dates', icon: '📅', items: [
    { jp: 'いま なんじですか。', rom: 'Ima nanji desu ka?', en: 'What time is it now?' },
    { jp: 'ごぜん くじはんです。', rom: 'Gozen kuji han desu.', en: 'It\'s 9:30 AM.' },
    { jp: 'きょうは なんようびですか。', rom: 'Kyou wa nan-youbi desu ka?', en: 'What day of the week is today?' },
    { jp: 'きょうは もくようびです。', rom: 'Kyou wa mokuyoubi desu.', en: 'Today is Thursday.' },
    { jp: 'たんじょうびは いつですか。', rom: 'Tanjoubi wa itsu desu ka?', en: 'When is your birthday?' },
    { jp: 'わたしの たんじょうびは しちがつ ふつかです。', rom: 'Watashi no tanjoubi wa shichigatsu futsuka desu.', en: 'My birthday is July 2nd.' },
    { jp: 'あしたは なんがつ なんにちですか。', rom: 'Ashita wa nangatsu nannichi desu ka?', en: 'What is tomorrow\'s date?' },
    { jp: 'よじに あいましょう。', rom: 'Yoji ni aimashou.', en: 'Let\'s meet at 4 o\'clock.' },
  ]},
  { title: '📚 Study & School', icon: '🏫', items: [
    { jp: 'にほんごを べんきょうしています。', rom: 'Nihongo o benkyou shite imasu.', en: 'I am studying Japanese.' },
    { jp: 'まいにち にじかん べんきょうします。', rom: 'Mainichi ni-jikan benkyou shimasu.', en: 'I study for 2 hours every day.' },
    { jp: 'このかんじの よみかたは なんですか。', rom: 'Kono kanji no yomikata wa nan desu ka?', en: 'What is the reading of this kanji?' },
    { jp: 'もういちど いってください。', rom: 'Mou ichido itte kudasai.', en: 'Please say it one more time.' },
    { jp: 'ゆっくり はなしてください。', rom: 'Yukkuri hanashite kudasai.', en: 'Please speak slowly.' },
    { jp: 'わかりません。', rom: 'Wakarimasen.', en: 'I don\'t understand.' },
    { jp: 'にほんごが すこし はなせます。', rom: 'Nihongo ga sukoshi hanasemasu.', en: 'I can speak a little Japanese.' },
    { jp: 'もう いちど かいてください。', rom: 'Mou ichido kaite kudasai.', en: 'Please write it one more time.' },
  ]},
  { title: '🏠 Home & Family', icon: '👨‍👩‍👧', items: [
    { jp: 'かぞくは よにんです。', rom: 'Kazoku wa yo-nin desu.', en: 'My family has four people.' },
    { jp: 'ちちは さんじゅうごさいです。', rom: 'Chichi wa sanjuugo-sai desu.', en: 'My father is 35 years old.' },
    { jp: 'いもうとは がくせいです。', rom: 'Imouto wa gakusei desu.', en: 'My younger sister is a student.' },
    { jp: 'へやに ねこが います。', rom: 'Heya ni neko ga imasu.', en: 'There is a cat in the room.' },
    { jp: 'うちに かえってから、ばんごはんを たべます。', rom: 'Uchi ni kaette kara, bangohan o tabemasu.', en: 'After returning home, I eat dinner.' },
    { jp: 'まいあさ はちじに おきます。', rom: 'Maiasa hachiji ni okimasu.', en: 'I wake up at 8 every morning.' },
    { jp: 'つくえの うえに ほんが あります。', rom: 'Tsukue no ue ni hon ga arimasu.', en: 'There is a book on the desk.' },
  ]},
  { title: '🍜 Food & Restaurant', icon: '🍣', items: [
    { jp: 'なにが たべたいですか。', rom: 'Nani ga tabetai desu ka?', en: 'What do you want to eat?' },
    { jp: 'すしが だいすきです！', rom: 'Sushi ga daisuki desu!', en: 'I love sushi!' },
    { jp: 'このりょうりは おいしいですね。', rom: 'Kono ryouri wa oishii desu ne.', en: 'This dish is delicious, isn\'t it?' },
    { jp: 'みずを いっぱい ください。', rom: 'Mizu o ippai kudasai.', en: 'One glass of water, please.' },
    { jp: 'おかいけいを おねがいします。', rom: 'Okaikei o onegaishimasu.', en: 'The bill, please.' },
    { jp: 'からいものは すこし にがてです。', rom: 'Karai mono wa sukoshi nigate desu.', en: 'I\'m not very good with spicy food.' },
    { jp: 'なんにん さまですか。', rom: 'Nan-nin-sama desu ka?', en: 'How many in your party?' },
    { jp: 'えいごの メニューは ありますか。', rom: 'Eigo no menyuu wa arimasu ka?', en: 'Do you have an English menu?' },
  ]},
  { title: '🚉 Transport & Directions', icon: '🗺️', items: [
    { jp: 'えきは どこですか。', rom: 'Eki wa doko desu ka?', en: 'Where is the station?' },
    { jp: 'まっすぐ いって、みぎに まがってください。', rom: 'Massugu itte, migi ni magatte kudasai.', en: 'Go straight, then turn right.' },
    { jp: 'このでんしゃは とうきょうへ いきますか。', rom: 'Kono densha wa Toukyou e ikimasu ka?', en: 'Does this train go to Tokyo?' },
    { jp: 'つぎのえきは なんですか。', rom: 'Tsugi no eki wa nan desu ka?', en: 'What is the next station?' },
    { jp: 'バスていは ちかくに ありますか。', rom: 'Basutei wa chikaku ni arimasu ka?', en: 'Is there a bus stop nearby?' },
    { jp: 'とうきょうまで いくらですか。', rom: 'Toukyou made ikura desu ka?', en: 'How much to Tokyo?' },
    { jp: 'このでんしゃは なんじに でますか。', rom: 'Kono densha wa nanji ni demasu ka?', en: 'What time does this train depart?' },
  ]},
  { title: '🌤 Weather & Seasons', icon: '🌸', items: [
    { jp: 'きょうの てんきは どうですか。', rom: 'Kyou no tenki wa dou desu ka?', en: 'How is the weather today?' },
    { jp: 'はれています。きもちが いいですね。', rom: 'Harete imasu. Kimochi ga ii desu ne.', en: 'It\'s sunny. It feels nice, doesn\'t it?' },
    { jp: 'あしたは あめが ふるでしょう。', rom: 'Ashita wa ame ga furu deshou.', en: 'It will probably rain tomorrow.' },
    { jp: 'ふゆは さむいですが、なつは あついです。', rom: 'Fuyu wa samui desu ga, natsu wa atsui desu.', en: 'Winter is cold but summer is hot.' },
    { jp: 'はるが いちばん すきな きせつです。', rom: 'Haru ga ichiban suki na kisetsu desu.', en: 'Spring is my favourite season.' },
    { jp: 'かぜが つよいですね。', rom: 'Kaze ga tsuyoi desu ne.', en: 'The wind is strong, isn\'t it?' },
  ]},
];

function renderListening() {
  const list = document.getElementById('listening-list');
  if (!list) return;
  const srs = getSRSData();
  list.innerHTML = LISTEN_CATEGORIES.map((cat, ci) => `
    <div class="listen-category">

} catch(e) {}

// ============================================================
//  BOOKMARKS
// ============================================================
function getBookmarks() {
  try { return JSON.parse(localStorage.getItem('sakura_bm') || '{}'); } catch(e) { return {}; }
}
function saveBookmarks(d) { try { localStorage.setItem('sakura_bm', JSON.stringify(d)); } catch(e) {} }
function getBookmarkStar(id) { return getBookmarks()[id] ? '⭐' : '☆'; }

function toggleBookmark(type, id, btn) {
  const bm = getBookmarks();
  if (bm[id]) {
    delete bm[id];
    btn.textContent = '☆'; btn.classList.remove('active');
  } else {
    const card = document.getElementById(id);
    let label = '', detail = '', char = '';
    if (type === 'grammar') {
      label = card?.querySelector('.grammar-pattern')?.textContent || id;
      detail = card?.querySelector('.grammar-meaning-tag')?.textContent || '';
    } else if (type === 'kanji') {
      char = card?.querySelector('.kanji-big')?.textContent || '';
      label = char;
      detail = card?.querySelector('.kanji-info')?.textContent?.replace(/\s+/g,' ').trim() || '';
    }
    bm[id] = { type, label, detail, char, date: new Date().toISOString() };
    btn.textContent = '⭐'; btn.classList.add('active');
    showToast('⭐ Bookmarked!');
  }
  saveBookmarks(bm);
  if (document.getElementById('bookmarks').classList.contains('active')) renderBookmarks();
}

function showToast(msg) {
  let t = document.getElementById('bm-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'bm-toast';
    t.style.cssText = 'position:fixed;bottom:5.5rem;right:1.25rem;background:linear-gradient(135deg,var(--pink),#e05f88);color:white;padding:.5rem 1.2rem;border-radius:2rem;font-size:.82rem;font-weight:700;z-index:99997;box-shadow:0 4px 16px rgba(255,133,161,.4);transition:opacity .4s;pointer-events:none;opacity:0;';
    document.body.appendChild(t);
  }
  t.textContent = msg; t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 1800);
}

function renderBookmarks(filter = 'all') {
  const bm = getBookmarks();
  const list = document.getElementById('bookmarks-list');
  if (!list) return;
  const entries = Object.entries(bm).filter(([,item]) => filter === 'all' || item.type === filter);
  if (entries.length === 0) {
    list.innerHTML = `<div class="bm-empty">
      <div style="font-size:3rem;margin-bottom:.75rem;">☆</div>
      <div style="font-weight:700;color:#bbb;margin-bottom:.4rem;">No bookmarks yet!</div>
      <div>Tap the ☆ on any grammar card or kanji to save it here. 🌸</div>
      <div style="margin-top:1.1rem;display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;">
        <button class="listen-play-btn" style="font-size:.78rem;" onclick="showSection('grammar')">📖 Grammar</button>
        <button class="listen-play-btn" style="background:linear-gradient(135deg,#4cc9f0,#0077b6);font-size:.78rem;" onclick="showSection('kanji')">漢字 Kanji</button>
      </div>
    </div>`;
    return;
  }
  list.innerHTML = entries.sort((a,b) => new Date(b[1].date)-new Date(a[1].date)).map(([id,item]) => {
    const tc = item.type==='grammar'?'#ff85a1':'#4cc9f0';
    const tl = item.type==='grammar'?'📖 Grammar':'漢字 Kanji';
    const go = item.type==='grammar'?`showSection('grammar')`:`showSection('kanji')`;
    const safe = (item.char||item.label||'').replace(/'/g,"\\'");
    return `<div class="bm-item" id="bmi_${id}">
      <div style="display:flex;align-items:flex-start;gap:.75rem;">
        ${item.type==='kanji'?`<div style="font-size:2.5rem;font-weight:900;color:var(--mid);flex-shrink:0;line-height:1.1;">${item.char}</div>`:''}
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;margin-bottom:.3rem;">
            <span class="bm-tag" style="background:${tc}22;color:${tc};border:1px solid ${tc}44;">${tl}</span>
            <span style="font-weight:800;color:var(--mid);font-size:.92rem;">${item.label}</span>
          </div>
          <div style="font-size:.78rem;color:#888;line-height:1.5;max-height:2.5em;overflow:hidden;">${item.detail}</div>
          <div style="display:flex;gap:.4rem;margin-top:.55rem;flex-wrap:wrap;">
            ${safe?`<button class="tts-btn" onclick="speakJP('${safe}',this)">🔊 Listen</button>`:''}
            <button class="listen-slow-btn" style="font-size:.72rem;" onclick="${go}">→ Go to section</button>
          </div>
        </div>
      </div>
      <button class="bm-remove" onclick="removeBookmark('${id}')" title="Remove">✕</button>
    </div>`;
  }).join('');
}

function removeBookmark(id) {
  const bm = getBookmarks(); delete bm[id]; saveBookmarks(bm);
  const star = document.getElementById('bms_'+id);
  if (star) { star.textContent='☆'; star.classList.remove('active'); }
  const activeBtn = document.querySelector('#bm-filter-bar .filter-tab.active');
  const f = activeBtn?.textContent?.includes('Grammar')?'grammar':activeBtn?.textContent?.includes('Kanji')?'kanji':'all';
  renderBookmarks(f);
}
function filterBookmarks(f,btn){
  document.querySelectorAll('#bm-filter-bar .filter-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); renderBookmarks(f);
}

// ============================================================
//  CONFETTI
// ============================================================

// ============================================================
//  CONFETTI
// ============================================================
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');
let confettiFrame = null;

function launchConfetti(duration=3500) {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  const colors = ['#ff85a1','#c77dff','#4cc9f0','#ffd700','#06d6a0','#ffb347','#ff6b6b'];
  const particles = Array.from({length:180},()=>({
    x: Math.random()*confettiCanvas.width, y:-10-Math.random()*300,
    r:3+Math.random()*7, vx:Math.random()*2-1, vy:1.5+Math.random()*2.5,
    color:colors[Math.floor(Math.random()*colors.length)],
    tilt:0, ts:0.04+Math.random()*0.06,
    shape:Math.random()>.4?'rect':'circle', rot:Math.random()*360
  }));
  const end = Date.now()+duration;
  if (confettiFrame) cancelAnimationFrame(confettiFrame);
  function draw() {
    confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
    const now = Date.now(), remaining = end-now;
    const alpha = remaining<600 ? remaining/600 : 1;
    particles.forEach(p=>{
      confettiCtx.save();
      confettiCtx.globalAlpha = alpha*0.9;
      confettiCtx.fillStyle = p.color;
      confettiCtx.translate(p.x,p.y);
      confettiCtx.rotate(p.rot*Math.PI/180);
      if(p.shape==='rect') confettiCtx.fillRect(-p.r/2,-p.r*.3,p.r,p.r*.6);
      else { confettiCtx.beginPath(); confettiCtx.arc(0,0,p.r/2,0,Math.PI*2); confettiCtx.fill(); }
      confettiCtx.restore();
      p.x+=p.vx+Math.sin(p.tilt)*.8; p.y+=p.vy;
      p.rot+=2; p.tilt+=p.ts;
      if(p.y>confettiCanvas.height+20){p.y=-10;p.x=Math.random()*confettiCanvas.width;}
    });
    if(now<end) confettiFrame=requestAnimationFrame(draw);
    else confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
  }
  draw();
}

function showCelebration(emoji,title,sub,pct=80){
  document.getElementById('celeb-emoji').textContent=emoji;
  document.getElementById('celeb-title').textContent=title;
  document.getElementById('celeb-sub').textContent=sub;
  document.getElementById('celeb-banner').classList.add('show');
  launchConfetti(pct>=95?5500:pct>=80?3500:2500);
}
function closeCeleb(){
  document.getElementById('celeb-banner').classList.remove('show');
  if(confettiFrame) cancelAnimationFrame(confettiFrame);
  confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
}

// ============================================================
//  SENTENCE PATTERNS PRACTICE
// ============================================================
const SP_QUESTIONS = [
  {cat:'particles',sentence:['わたし','___','がくせいです。'],blank:1,opts:['は','が','を','に'],ans:0,hint:'Topic marker particle',eng:'I am a student.'},
  {cat:'particles',sentence:['にほんご','___','べんきょうします。'],blank:1,opts:['を','は','が','で'],ans:0,hint:'Object marker particle',eng:'I study Japanese.'},
  {cat:'particles',sentence:['うち','___','かえります。'],blank:1,opts:['に','を','は','が'],ans:0,hint:'Direction/destination particle',eng:'I go home.'},

// --- MASCOT ---
const MASCOT_TIPS = [
  "💡 Tip: Practice hiragana every morning for just 5 minutes!",
  "🌸 Remember: いい (good) is irregular! Negative = よくない, not いくない!",
  "⚡ Group 3 only has 2 verbs: する and くる. Easy to remember!",
  "漢字 Try to write each kanji 5 times while saying its meaning out loud!",
  "🔵 Particles are everything! は, が, を, に, で — master these first!",
  "🎯 For JLPT N5 you need 110/180 points to pass. You've got this!",
  "📖 Reading tip: Guess meaning from context, even if you don't know every word!",
  "🃏 Flashcards work best with spaced repetition — review right before you forget!",
  "✨ な-adjectives need な before nouns: しずかなへや (quiet room)!",
  "⏰ 〜ています can mean ongoing action OR a resultant state. Context matters!",
  "🌺 To say 'I want to do X': take the ます stem and add たい！ e.g. たべたい！",
  "💪 Study a little every day rather than a lot once a week. 継続は力なり！",
  "🎨 い-adjectives ending: negative → くない, past → かった. Easy pattern!",
  "📝 Memorize verb groups by their ending sound — RU verbs are usually Group 2!",
  "🌸 You're doing amazing! がんばれ！Keep going! 応援してるよ！",
  "🔄 Opposite adjectives help double your vocab — learn pairs, not singles!",
  "🎵 Try humming Japanese words to a tune — music helps memory!",
  "☕ Take breaks! Study 25 min → 5 min break (Pomodoro technique) works great!",
];
mascotTipIndex = Math.floor(Math.random()*MASCOT_TIPS.length);
mascotBubbleTimer = null;
var mascotVisible = true;

function mascotTap(){
  const bubble = document.getElementById('mascot-bubble');
  mascotTipIndex = (mascotTipIndex + 1) % MASCOT_TIPS.length;
  bubble.classList.remove('hidden');
  bubble.style.animation = 'none';
  void bubble.offsetWidth;
  bubble.style.animation = 'bubblePop .3s cubic-bezier(.34,1.56,.64,1)';
  bubble.innerHTML = MASCOT_TIPS[mascotTipIndex];
  clearTimeout(mascotBubbleTimer);
  mascotBubbleTimer = setTimeout(()=>bubble.classList.add('hidden'), 5000);
}

// Auto-show tip after 4 seconds, then hide, cycle every 20s
setTimeout(()=>{
  const bubble = document.getElementById('mascot-bubble');
  bubble.classList.add('hidden');
  setInterval(()=>{
    mascotTipIndex = (mascotTipIndex + 1) % MASCOT_TIPS.length;
    bubble.innerHTML = MASCOT_TIPS[mascotTipIndex];
    bubble.classList.remove('hidden');
    bubble.style.animation='none';void bubble.offsetWidth;bubble.style.animation='bubblePop .3s cubic-bezier(.34,1.56,.64,1)';
    clearTimeout(mascotBubbleTimer);
    mascotBubbleTimer = setTimeout(()=>bubble.classList.add('hidden'), 5000);
  }, 20000);
}, 4000);

// ============================================================


function toggleDark() {
  const isDark = document.body.classList.toggle('dark');
  document.getElementById('dark-toggle').innerHTML = isDark ? '☀️ Light' : '🌙 Dark';
  try { localStorage.setItem('sakura_dark', isDark ? '1' : '0'); } catch(e) {}
}
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}
function sbGo(id) {
  showSection(id);
  closeSidebar();
  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('sb_' + id);
  if (btn) btn.classList.add('active');
}
// Apply saved dark mode on load
try {
  if (localStorage.getItem('sakura_dark') === '1') {
    document.body.classList.add('dark');
    const btn = document.getElementById('dark-toggle');
    if (btn) btn.innerHTML = '☀️ Light';
  }
} catch(e) {}

// Petals
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    const pc=document.getElementById('petals');
    if (!pc) return;
    for(let i=0;i<15;i++){
      const p=document.createElement('div');
      p.className='petal';
      p.textContent=['🌸','🌺','✿','❀','🌷'][Math.floor(Math.random()*5)];
      p.style.left=Math.random()*100+'vw';
      p.style.animationDuration=(7+Math.random()*9)+'s';
      p.style.animationDelay=(Math.random()*12)+'s';
      p.style.fontSize=(.8+Math.random()*1.1)+'rem';
      pc.appendChild(p);
    }
  });
})();
