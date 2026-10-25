// Animated stroke order. Uses the KanjiVG project's accurate stroke data when online,
// and falls back to the bundled STROKE_DATA sketches when it can't be reached.
(function (S) {
  const KANJIVG = 'https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/';
  const cache = {};

  async function loadKanjiVG(ch) {
    if (cache[ch]) return cache[ch];
    const hex = ch.codePointAt(0).toString(16).padStart(5, '0');
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`${KANJIVG}${hex}.svg`, { signal: ctrl.signal }).finally(() => clearTimeout(t));
    if (!res.ok) throw new Error('not found');
    const doc = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');
    const paths = Array.from(doc.querySelectorAll('path'))
      .filter((p) => /-s\d+$/.test(p.id || ''))
      .sort((a, b) => +a.id.split('-s').pop() - +b.id.split('-s').pop())
      .map((p) => [p.getAttribute('d')]);
    if (!paths.length) throw new Error('empty');
    return (cache[ch] = { size: 109, width: 4, strokes: paths });
  }

  function fallback(ch) {
    const s = (typeof STROKE_DATA !== 'undefined' && STROKE_DATA[ch]) || null;
    return s ? { size: 200, width: 8, strokes: s } : null;
  }

  // Renders an interactive stroke-order player into `el`.
  async function mount(el, ch) {
    el.innerHTML = '<div class="stroke-loading">Loading stroke order…</div>';
    let data = null;
    try { data = await loadKanjiVG(ch); } catch (e) { data = fallback(ch); }
    if (!data) { el.innerHTML = '<p class="muted small">Stroke order isn\'t available for this character yet.</p>'; return; }

    const { size, width, strokes } = data;
    const total = strokes.length;
    let shown = 0, timer = null;
    el.innerHTML = `
      <div class="stroke-stage">
        <svg viewBox="0 0 ${size} ${size}" class="stroke-svg" role="img" aria-label="Stroke order for ${S.esc(ch)}">
          <path d="M${size / 2} 0V${size}M0 ${size / 2}H${size}" class="stroke-grid"/>
          <g class="stroke-ghost">${strokes.map((s) => s.map((d) => `<path d="${d}" stroke-width="${width}"/>`).join('')).join('')}</g>
          <g class="stroke-ink" data-ink></g>
        </svg>
        <div class="stroke-info muted small" data-info>${total} strokes</div>
      </div>
      <div class="row gap center">
        <button class="btn sm primary" data-s="play">${S.icon('play')} Play</button>
        <button class="btn sm" data-s="prev">${S.icon('left')}</button>
        <button class="btn sm" data-s="next">${S.icon('right')}</button>
        <button class="btn sm ghost" data-s="reset">${S.icon('refresh')}</button>
      </div>`;
    const ink = S.$('[data-ink]', el);
    const info = S.$('[data-info]', el);

    const draw = (n, animateLast) => {
      shown = Math.max(0, Math.min(total, n));
      ink.innerHTML = strokes.slice(0, shown).map((s, i) => s.map((d) => `<path d="${d}" stroke-width="${width}" class="${i === shown - 1 ? 'current' : ''}"/>`).join('')).join('');
      if (animateLast && shown) {
        S.$$('path.current', ink).forEach((p) => {
          const len = p.getTotalLength ? p.getTotalLength() : 300;
          p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
          p.getBoundingClientRect();
          p.style.transition = 'stroke-dashoffset .5s ease'; p.style.strokeDashoffset = 0;
        });
      }
      info.textContent = shown === 0 ? `${total} strokes` : shown === total ? `All ${total} strokes` : `Stroke ${shown} of ${total}`;
    };
    const stopPlay = () => { clearInterval(timer); timer = null; };
    S.onLeave(stopPlay);

    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-s]');
      if (!b) return;
      const act = b.dataset.s;
      if (act === 'play') {
        stopPlay(); draw(0);
        timer = setInterval(() => { if (shown >= total) stopPlay(); else draw(shown + 1, true); }, 650);
      } else { stopPlay(); }
      if (act === 'next') draw(shown + 1, true);
      if (act === 'prev') draw(shown - 1);
      if (act === 'reset') draw(0);
    });
    draw(total);
  }

  S.strokes = { mount };
})(window.S);
