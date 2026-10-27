// Write by hand: trace kana and kanji stroke by stroke with your finger.
// Each stroke is checked for shape, direction and order against KanjiVG stroke data
// (fetched when online and cached by the service worker), with bundled sketches as a fallback.
(function (A) {
  const esc = A.esc;
  const KANJIVG = 'https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/';
  const cache = {};
  A.state.writing = A.state.writing || {}; // char → best stars

  async function strokesFor(ch) {
    if (cache[ch]) return cache[ch];
    try {
      const hex = ch.codePointAt(0).toString(16).padStart(5, '0');
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(`${KANJIVG}${hex}.svg`, { signal: ctrl.signal }).finally(() => clearTimeout(t));
      if (!res.ok) throw new Error('missing');
      const doc = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');
      const paths = Array.from(doc.querySelectorAll('path')).filter((p) => /-s\d+$/.test(p.id || ''))
        .sort((a, b) => +a.id.split('-s').pop() - +b.id.split('-s').pop()).map((p) => p.getAttribute('d'));
      if (!paths.length) throw new Error('empty');
      return (cache[ch] = { size: 109, strokes: paths });
    } catch (e) {
      const s = typeof STROKE_DATA !== 'undefined' && STROKE_DATA[ch];
      return s ? (cache[ch] = { size: 200, strokes: s.map((x) => x[0]) }) : null;
    }
  }

  const SETS = {
    h: { label: 'Hiragana', jp: 'ひらがな', chars: () => HIRAGANA_ROWS.slice(0, 11).flatMap((r) => r.cells).filter((c) => c.k && !/[ゐゑ]/.test(c.k)).map((c) => ({ ch: c.k, read: c.r, id: `h:${c.k}` })) },
    k: { label: 'Katakana', jp: 'カタカナ', chars: () => KATAKANA_ROWS.slice(0, 11).flatMap((r) => r.cells).filter((c) => c.k && !/[ヰヱ]/.test(c.k)).map((c) => ({ ch: c.k, read: c.r, id: `k:${c.k}` })) },
    j: { label: 'Kanji (N5)', jp: 'かんじ', chars: () => KANJI.map((k) => ({ ch: k.char, read: `${(k.kun || k.on || '').split('・')[0]} · ${k.meaning}`, id: `k:${k.char}`, say: (k.kun || k.on || '').split('・')[0].replace(/[()（）.-]/g, '') })) },
  };

  // ── Geometry ──
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function resample(pts, n) {
    const out = [pts[0]];
    const total = pts.slice(1).reduce((s, p, i) => s + dist(pts[i], p), 0);
    if (!total) return Array(n).fill(pts[0]);
    const step = total / (n - 1);
    let acc = 0, i = 1, prev = pts[0];
    while (out.length < n && i < pts.length) {
      const d = dist(prev, pts[i]);
      if (acc + d >= step) {
        const k = (step - acc) / d;
        prev = { x: prev.x + k * (pts[i].x - prev.x), y: prev.y + k * (pts[i].y - prev.y) };
        out.push(prev); acc = 0;
      } else { acc += d; prev = pts[i]; i++; }
    }
    while (out.length < n) out.push(pts[pts.length - 1]);
    return out;
  }
  const samplePath = (pathEl, n) => { const L = pathEl.getTotalLength(); return Array.from({ length: n }, (_, i) => pathEl.getPointAtLength((L * i) / (n - 1))); };
  const meanDist = (a, b) => a.reduce((s, p, i) => s + dist(p, b[i]), 0) / a.length;

  // Does the drawn stroke match the expected one?
  function judge(drawn, pathEl, size) {
    const N = 20;
    const exp = samplePath(pathEl, N), len = pathEl.getTotalLength();
    const got = resample(drawn, N);
    const tol = size * 0.14;
    if (len < size * 0.12) { // a dot or tiny tick: just needs to be in the right place
      const c = (pts) => ({ x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length });
      return dist(c(got), c(exp)) < size * 0.16;
    }
    const fwd = meanDist(got, exp);
    return fwd < tol && dist(got[0], exp[0]) < size * 0.22 && dist(got[N - 1], exp[N - 1]) < size * 0.26;
  }

  function session(setId) {
    const set = SETS[setId];
    const all = set.chars();
    const weak = all.sort((a, b) => (A.state.writing[a.ch] || 0) - (A.state.writing[b.ch] || 0) || Math.random() - 0.5);
    const queue = A.shuffle(weak.slice(0, 14)).slice(0, 6);
    let qi = 0, totalStars = 0, written = 0;
    const p = A.panel('', { title: `Write · ${set.label}`, onClose: () => A.go(A.tab) });

    const finish = () => {
      const xpFrom = A.state.xp, xp = Math.max(4, written * 2);
      A.addXp(xp);
      A.pending = { ...(A.pending || {}), xp, xpFrom };
      A.save(); A.sfx('bell'); if (totalStars >= written * 2.5) A.confetti();
      p.body.innerHTML = `<div class="game-over center"><div class="maru-host">${A.mascot('cheer big')}</div><h1 lang="ja">よく かけました！</h1>
        <p class="muted">You wrote ${written} character${written === 1 ? '' : 's'}.</p>
        <div class="stars big">${'★'.repeat(Math.round(totalStars / Math.max(1, written)))}${'☆'.repeat(3 - Math.round(totalStars / Math.max(1, written)))}</div>
        <dl class="tally"><div><dt>${A.icon('bolt')} XP</dt><dd>+${xp}</dd></div></dl>
        <button class="btn primary block lg" data-again>Write more</button><button class="btn ghost block" data-done>Done</button></div>`;
      A.$('[data-again]', p.body).addEventListener('click', () => { p.close(); session(setId); });
      A.$('[data-done]', p.body).addEventListener('click', () => p.close());
    };

    const show = async () => {
      if (qi >= queue.length) return finish();
      const c = queue[qi];
      p.body.innerHTML = `<div class="write"><div class="write-top"><span class="muted small">${qi + 1} / ${queue.length}</span><span class="write-read">${esc(c.read)}</span></div>
        <div class="write-load muted">Loading strokes…</div></div>`;
      const data = await strokesFor(c.ch);
      if (!data) { qi++; return show(); }
      const { size, strokes } = data;
      let si = 0, misses = 0, strokeMiss = 0, guide = (A.state.writing[c.ch] || 0) < 3;
      p.body.innerHTML = `<div class="write">
        <div class="write-top"><span class="muted small">${qi + 1} / ${queue.length}</span><span class="write-read">${esc(c.read)}</span><button class="speaker sm" data-say="${esc(c.say || c.ch)}">${A.icon('volume')}</button></div>
        <div class="write-pad">
          <svg viewBox="0 0 ${size} ${size}" data-pad>
            <path d="M${size / 2} 0V${size}M0 ${size / 2}H${size}" class="pad-grid"/>
            <g class="pad-guide" data-guide>${strokes.map((d) => `<path d="${d}"/>`).join('')}</g>
            <g class="pad-hidden">${strokes.map((d, i) => `<path d="${d}" data-exp="${i}"/>`).join('')}</g>
            <g class="pad-done" data-done-g></g>
            <g data-hint-g></g>
            <polyline class="pad-ink" data-ink points=""/>
          </svg>
          <div class="write-msg" data-msg>Stroke 1 of ${strokes.length}</div>
        </div>
        <div class="write-tools"><button class="btn" data-hint>${A.icon('target')} Hint</button><button class="btn" data-guide-t>${guide ? 'Hide guide' : 'Show guide'}</button><button class="btn" data-skip>Skip</button></div></div>`;
      const svg = A.$('[data-pad]', p.body), ink = A.$('[data-ink]', p.body), msg = A.$('[data-msg]', p.body);
      const guideG = A.$('[data-guide]', p.body), doneG = A.$('[data-done-g]', p.body), hintG = A.$('[data-hint-g]', p.body);
      guideG.style.opacity = guide ? 1 : 0;
      svg.style.setProperty('--sw', size / 20);
      const toSvg = (e) => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const r = pt.matrixTransform(svg.getScreenCTM().inverse()); return { x: r.x, y: r.y }; };

      const showHint = () => {
        const d = strokes[si], el = A.$(`[data-exp="${si}"]`, svg);
        const s0 = el.getPointAtLength(0);
        hintG.innerHTML = `<path d="${d}" class="pad-hint"/><circle cx="${s0.x}" cy="${s0.y}" r="${size / 22}" class="pad-start"/>`;
        const hp = A.$('.pad-hint', hintG), L = el.getTotalLength();
        hp.style.strokeDasharray = L; hp.style.strokeDashoffset = L;
        hp.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 700, fill: 'forwards', easing: 'ease-out' });
      };
      const accept = () => {
        const el = A.$(`[data-exp="${si}"]`, svg), L = el.getTotalLength();
        const np = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        np.setAttribute('d', strokes[si]);
        np.style.strokeDasharray = L; np.style.strokeDashoffset = L;
        doneG.appendChild(np);
        np.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 220, fill: 'forwards' });
        hintG.innerHTML = ''; strokeMiss = 0; si++;
        A.sfx('pop');
        if (si === strokes.length) return complete();
        msg.textContent = `Stroke ${si + 1} of ${strokes.length}`;
      };
      const complete = () => {
        const stars = misses === 0 ? 3 : misses <= 2 ? 2 : 1;
        A.state.writing[c.ch] = Math.max(A.state.writing[c.ch] || 0, stars);
        if (A.items[c.id]) A.srsMark(c.id, stars >= 2);
        totalStars += stars; written++;
        A.quest('write', 1); A.save();
        A.sfx('correct'); A.speak(c.say || c.ch);
        svg.classList.add('complete');
        msg.innerHTML = `<span class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span> ${stars === 3 ? 'きれい！ Beautiful!' : stars === 2 ? 'Nice writing!' : 'Done — practise again soon!'}`;
        A.$('.write-tools', p.body).innerHTML = `<button class="btn primary block lg" data-next>${qi + 1 < queue.length ? 'Next character' : 'Finish'}</button>`;
        A.$('[data-next]', p.body).addEventListener('click', () => { qi++; show(); });
      };

      let pts = null;
      svg.addEventListener('pointerdown', (e) => { if (si >= strokes.length) return; e.preventDefault(); svg.setPointerCapture(e.pointerId); pts = [toSvg(e)]; ink.setAttribute('points', ''); ink.classList.remove('bad'); });
      svg.addEventListener('pointermove', (e) => { if (!pts) return; pts.push(toSvg(e)); ink.setAttribute('points', pts.map((q) => `${q.x},${q.y}`).join(' ')); });
      const up = () => {
        if (!pts) return;
        const drawn = pts; pts = null;
        if (drawn.length < 2) drawn.push({ x: drawn[0].x + 0.5, y: drawn[0].y + 0.5 });
        if (judge(drawn, A.$(`[data-exp="${si}"]`, svg), size)) { ink.setAttribute('points', ''); accept(); }
        else {
          misses++; strokeMiss++;
          ink.classList.add('bad'); A.sfx('wrong');
          setTimeout(() => { ink.setAttribute('points', ''); ink.classList.remove('bad'); }, 450);
          msg.textContent = strokeMiss >= 2 ? 'Follow the red line, starting at the dot' : 'Not quite — check the direction and order';
          if (strokeMiss >= 2) showHint();
        }
      };
      svg.addEventListener('pointerup', up);
      svg.addEventListener('pointercancel', () => { pts = null; ink.setAttribute('points', ''); });
      p.body.onclick = (e) => {
        if (e.target.closest('[data-hint]')) { misses++; showHint(); }
        if (e.target.closest('[data-guide-t]')) { guide = !guide; guideG.style.opacity = guide ? 1 : 0; e.target.closest('[data-guide-t]').textContent = guide ? 'Hide guide' : 'Show guide'; }
        if (e.target.closest('[data-skip]')) { qi++; show(); }
      };
    };
    show();
  }

  A.openWriting = () => {
    const s = A.sheet(`<div class="sheet-body"><h2>Write by hand</h2><p class="muted">Trace each character stroke by stroke with your finger. Stroke order and direction count!</p>
      <div class="mini-list">${Object.entries(SETS).map(([id, st]) => {
        const chars = st.chars(), done = chars.filter((c) => A.state.writing[c.ch]).length;
        return `<button class="mini-row" data-set="${id}"><span class="lv lv${id === 'h' ? 1 : id === 'k' ? 2 : 3}" lang="ja">${id === 'j' ? '字' : st.jp.charAt(0)}</span><span><b>${st.label}</b><small>${done}/${chars.length} written</small></span><span class="chev">›</span></button>`;
      }).join('')}</div>
      <p class="muted small">Tip: stroke data comes from the KanjiVG project and needs an internet connection the first time.</p>
      <button class="btn primary block" data-close>Close</button></div>`);
    s.el.addEventListener('click', (e) => { const b = e.target.closest('[data-set]'); if (b) { s.close(); session(b.dataset.set); } });
  };
})(window.A);
