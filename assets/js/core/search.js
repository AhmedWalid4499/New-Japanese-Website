// Command palette: search every page, kanji, word, grammar point, phrase, counter and passage.
// Open with "/" or Ctrl/⌘+K.
(function (S) {
  const esc = S.esc;
  let index = null;

  function buildIndex() {
    const items = [];
    (S.NAV || []).forEach((g) => g.items.forEach((n) => items.push({ kind: 'Page', title: n.label, sub: n.desc || g.group, jp: n.glyph, route: n.id, keys: `${n.label} ${n.desc || ''}` })));
    KANJI.forEach((k) => items.push({ kind: 'Kanji', title: `${k.char}  ${k.meaning}`, sub: `On ${k.on} · Kun ${k.kun || '—'}`, route: `kanji/${k.char}`, keys: `${k.char} ${k.meaning} ${k.on} ${k.kun}` }));
    [...VOCAB, ...S.store.custom.list('vocab')].forEach((v) => items.push({ kind: 'Word', title: `${v.jp}`, sub: `${v.read || ''} — ${v.en}`, route: `vocab?q=${encodeURIComponent(v.jp)}`, keys: `${v.jp} ${v.read} ${v.en}` }));
    GRAMMAR_SECTIONS.forEach((sec) => sec.items.forEach((g, i) => items.push({ kind: 'Grammar', title: g.pattern, sub: g.meaning, route: `grammar/${sec.id}-${i}`, keys: `${g.pattern} ${g.meaning} ${g.structure}` })));
    SURVIVAL_PHRASES.forEach((p, i) => items.push({ kind: 'Phrase', title: p.jp, sub: `${p.rom} — ${p.en}`, route: `phrases/${i}`, keys: `${p.jp} ${p.rom} ${p.en}` }));
    COUNTERS.forEach((c, i) => items.push({ kind: 'Counter', title: c.suffix, sub: c.title, route: `counters/${i}`, keys: `${c.suffix} ${c.title} ${c.desc}` }));
    S.readingPassages().forEach((p) => items.push({ kind: 'Reading', title: p.title, sub: p.titleEn || 'Reading passage', route: `reading/${p.id}`, keys: `${p.title} ${p.titleEn} ${p.passage}` }));
    items.forEach((it) => { it.hay = String(it.keys).toLowerCase(); });
    return items;
  }

  function query(q) {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    index = index || buildIndex();
    return index
      .map((it) => {
        const at = it.hay.indexOf(t);
        if (at < 0) return null;
        const titleHit = it.title.toLowerCase().indexOf(t);
        return { it, rank: (titleHit === 0 ? 0 : titleHit > 0 ? 1 : 2) + (it.kind === 'Page' ? -1 : 0) + at / 1000 };
      })
      .filter(Boolean)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 40)
      .map((r) => r.it);
  }

  function open() {
    if (S.$('.palette-overlay')) return;
    index = null; // pick up new custom entries
    const ov = document.createElement('div');
    ov.className = 'palette-overlay';
    ov.innerHTML = `<div class="palette" role="dialog" aria-modal="true" aria-label="Search">
      <label class="palette-input">${S.icon('search')}<input type="search" placeholder="Search kanji, words, grammar, phrases…" autocomplete="off" spellcheck="false" aria-label="Search"><kbd>Esc</kbd></label>
      <div class="palette-results" role="listbox"><div class="palette-hint">Try <b lang="ja">水</b>, <b>te-form</b>, <b>station</b> or <b lang="ja">ください</b>.</div></div>
    </div>`;
    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.classList.add('open'));
    const input = S.$('input', ov);
    const list = S.$('.palette-results', ov);
    let sel = 0, results = [];
    const close = () => { ov.classList.remove('open'); setTimeout(() => ov.remove(), 150); document.removeEventListener('keydown', onKey, true); };
    const choose = (i) => { const r = results[i]; if (r) { close(); S.go(r.route); } };
    const paint = () => {
      if (!input.value.trim()) return;
      if (!results.length) { list.innerHTML = `<div class="palette-hint">No results for “${esc(input.value)}”.</div>`; return; }
      let last = '';
      list.innerHTML = results.map((r, i) => {
        const head = r.kind !== last ? `<div class="palette-group">${esc(r.kind)}</div>` : '';
        last = r.kind;
        return `${head}<button class="palette-item ${i === sel ? 'sel' : ''}" role="option" aria-selected="${i === sel}" data-i="${i}">
          <span class="palette-title" lang="ja">${esc(r.title)}</span><span class="palette-sub">${esc(r.sub)}</span></button>`;
      }).join('');
      const cur = S.$('.palette-item.sel', list);
      cur && cur.scrollIntoView({ block: 'nearest' });
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(results.length - 1, sel + 1); paint(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); paint(); }
      else if (e.key === 'Enter') { e.preventDefault(); choose(sel); }
    };
    document.addEventListener('keydown', onKey, true);
    input.addEventListener('input', () => { results = query(input.value); sel = 0; paint(); });
    list.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) choose(+b.dataset.i); });
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    input.focus();
  }

  document.addEventListener('keydown', (e) => {
    const typing = e.target.matches('input, textarea, select, [contenteditable]');
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) { e.preventDefault(); open(); }
  });

  S.search = { open, query };
})(window.S);
