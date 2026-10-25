// Reusable UI fragments (return HTML strings) + app-wide click handling.
(function (S) {
  const esc = S.esc;
  const ui = {};

  ui.pageHead = ({ kicker = '', title, jp = '', desc = '', actions = '' }) => `
    <header class="page-head">
      <div class="page-head-text">
        ${kicker ? `<div class="kicker">${esc(kicker)}</div>` : ''}
        <h1>${esc(title)}${jp ? ` <span class="h1-jp" lang="ja">${esc(jp)}</span>` : ''}</h1>
        ${desc ? `<p class="lead">${desc}</p>` : ''}
      </div>
      ${actions ? `<div class="page-head-actions">${actions}</div>` : ''}
    </header>`;

  // options: [{value, label, count?}]
  ui.chips = (name, options, active) => `
    <div class="chips" role="tablist" data-chips="${esc(name)}">
      ${options.map((o) => `<button class="chip ${o.value === active ? 'on' : ''}" role="tab" aria-selected="${o.value === active}" data-chip="${esc(o.value)}">${esc(o.label)}${o.count != null ? `<span class="chip-n">${o.count}</span>` : ''}</button>`).join('')}
    </div>`;

  ui.setChip = (root, name, value) => {
    S.$$(`[data-chips="${name}"] .chip`, root).forEach((b) => {
      const on = b.dataset.chip === value;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on);
    });
  };

  ui.tabs = (name, options, active) => `
    <div class="tabs" role="tablist" data-chips="${esc(name)}">
      ${options.map((o) => `<button class="tab chip ${o.value === active ? 'on' : ''}" role="tab" aria-selected="${o.value === active}" data-chip="${esc(o.value)}">${esc(o.label)}</button>`).join('')}
    </div>`;

  ui.searchBox = (placeholder, value = '', name = 'q') => `
    <label class="search-field">${S.icon('search')}<input type="search" name="${esc(name)}" placeholder="${esc(placeholder)}" value="${esc(value)}" autocomplete="off" spellcheck="false"></label>`;

  ui.speak = (text, { slow = true, label = '' } = {}) => {
    if (!text) return '';
    const t = esc(text);
    return `<span class="speak-group"><button class="btn-icon" data-speak="${t}" title="Listen" aria-label="Listen">${S.icon('volume')}${label ? `<span>${esc(label)}</span>` : ''}</button>${slow ? `<button class="btn-icon slow" data-speak="${t}" data-rate="0.55" title="Listen slowly" aria-label="Listen slowly">½×</button>` : ''}</span>`;
  };

  ui.bm = (id, meta) => {
    const on = S.store.bm.has(id);
    return `<button class="btn-icon bm ${on ? 'on' : ''}" data-bm="${esc(id)}" data-bm-meta="${esc(JSON.stringify(meta))}" aria-pressed="${on}" title="${on ? 'Remove bookmark' : 'Bookmark'}" aria-label="Bookmark">${S.icon('star')}</button>`;
  };

  ui.know = (area, id) => {
    const st = S.store.srs.get(area, id);
    return `<span class="know-group" data-srs-group>
      <button class="know-btn ${st === 'known' ? 'on known' : ''}" data-srs="${esc(area)}|${esc(id)}|known">${S.icon('check')}Know it</button>
      <button class="know-btn ${st === 'review' ? 'on review' : ''}" data-srs="${esc(area)}|${esc(id)}|review">${S.icon('repeat')}Review</button>
    </span>`;
  };

  ui.empty = (title, text = '', action = '') => `
    <div class="empty"><div class="empty-mark" lang="ja">空</div><h3>${esc(title)}</h3>${text ? `<p>${text}</p>` : ''}${action}</div>`;

  ui.bar = (pct, tone = '') => `<div class="bar ${tone}"><span style="width:${Math.max(0, Math.min(100, pct))}%"></span></div>`;

  ui.ring = (pct, { size = 64, stroke = 7, tone = 'primary', label } = {}) => {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    return `<svg class="ring ring-${tone}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${pct}%">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" class="ring-track"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" class="ring-fill" stroke-dasharray="${c}" stroke-dashoffset="${c - (c * Math.min(100, pct)) / 100}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle">${label ?? pct + '%'}</text></svg>`;
  };

  ui.badge = (text, tone = '') => `<span class="badge ${tone}">${esc(text)}</span>`;

  ui.scoreTone = (pct) => (pct >= 80 ? 'good' : pct >= 60 ? 'warn' : 'bad');

  S.ui = ui;

  // ── App-wide delegated clicks ──
  document.addEventListener('click', (e) => {
    const sp = e.target.closest('[data-speak]');
    if (sp) {
      e.preventDefault();
      S.tts.speak(sp.dataset.speak, { rate: sp.dataset.rate ? parseFloat(sp.dataset.rate) : undefined, btn: sp });
      return;
    }
    const bm = e.target.closest('[data-bm]');
    if (bm) {
      e.preventDefault();
      let meta = {};
      try { meta = JSON.parse(bm.dataset.bmMeta || '{}'); } catch (err) {}
      const on = S.store.bm.toggle(bm.dataset.bm, meta);
      S.$$(`[data-bm="${CSS.escape(bm.dataset.bm)}"]`).forEach((b) => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      S.toast(on ? 'Bookmarked' : 'Bookmark removed');
      return;
    }
    const srs = e.target.closest('[data-srs]');
    if (srs) {
      e.preventDefault();
      const [area, id, status] = srs.dataset.srs.split('|');
      const now = S.store.srs.set(area, id, status);
      const group = srs.closest('[data-srs-group]');
      S.$$('[data-srs]', group).forEach((b) => {
        const s = b.dataset.srs.split('|')[2];
        b.classList.toggle('on', s === now);
        b.classList.toggle(s, s === now);
      });
      return;
    }
    const go = e.target.closest('[data-go]');
    if (go) { e.preventDefault(); S.go(go.dataset.go); }
  });
})(window.S);
