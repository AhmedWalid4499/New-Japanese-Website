// Vocabulary — every N5 word, filterable by topic, searchable, with audio.
(function (S) {
  const esc = S.esc;
  const LABELS = Object.fromEntries(S.custom.VOCAB_CATS);
  S.vocabLabel = (c) => LABELS[c] || c;

  S.view('vocab', {
    render(root, { query }) {
      let cat = query.cat || 'all', q = query.q || '';
      const cats = S.uniq(VOCAB.map((v) => v.cat));
      root.innerHTML = `
        ${S.ui.pageHead({ kicker: 'Learn', title: 'Vocabulary', jp: 'ごい', desc: `${VOCAB.length} essential N5 words grouped by topic. Tap the speaker to hear any word.`, actions: `<button class="btn" data-add>${S.icon('plus')} Add word</button><button class="btn primary" data-study>${S.icon('cards')} Study as flashcards</button>` })}
        <div class="toolbar sticky">
          ${S.ui.chips('cat', [{ value: 'all', label: 'All', count: VOCAB.length }, ...cats.map((c) => ({ value: c, label: S.vocabLabel(c), count: VOCAB.filter((v) => v.cat === c).length })), { value: 'mine', label: 'Mine', count: S.store.custom.list('vocab').length }], cat)}
          ${S.ui.searchBox('Search Japanese, romaji or English', q)}
        </div>
        <div class="card flush"><div class="table-wrap"><table class="table vocab-table">
          <thead><tr><th>Japanese</th><th>Reading</th><th>Meaning</th><th class="hide-sm">Topic</th><th class="right"><span class="sr-only">Actions</span></th></tr></thead>
          <tbody data-body></tbody></table></div></div>
        <p class="muted small center" data-count></p>`;

      const body = S.$('[data-body]', root);
      const paint = () => {
        const t = q.toLowerCase();
        const custom = S.store.custom.list('vocab').map((v, i) => ({ ...v, _ci: i }));
        const pool = cat === 'mine' ? custom : [...VOCAB.filter((v) => cat === 'all' || v.cat === cat), ...custom.filter((v) => cat === 'all' || v.cat === cat)];
        const rows = pool.filter((v) => !t || v.jp.includes(q) || String(v.read || '').toLowerCase().includes(t) || v.en.toLowerCase().includes(t));
        body.innerHTML = rows.length ? rows.map((v) => {
          const id = `vocab_${v.jp}`;
          return `<tr>
            <td><span class="jp-word" lang="ja">${esc(v.jp)}</span>${v._ci != null ? ' ' + S.ui.badge('mine', 'soft') : ''}</td>
            <td class="muted">${esc(v.read || '')}</td>
            <td>${esc(v.en)}</td>
            <td class="hide-sm"><span class="tag">${esc(S.vocabLabel(v.cat))}</span></td>
            <td class="right nowrap">${S.ui.speak(v.jp, { slow: false })}${v._ci != null ? `<button class="btn-icon" data-del="${v._ci}" title="Delete">${S.icon('trash')}</button>` : S.ui.bm(id, { type: 'vocab', label: v.jp, detail: `${v.read} — ${v.en}` })}</td>
          </tr>`;
        }).join('') : `<tr><td colspan="5">${S.ui.empty(cat === 'mine' ? 'No custom words yet' : 'No words found', cat === 'mine' ? 'Add words from anime, songs or class.' : 'Try a different search.')}</td></tr>`;
        S.$('[data-count]', root).textContent = rows.length ? `${rows.length} word${rows.length === 1 ? '' : 's'}` : '';
      };

      root.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-chip]');
        if (chip) { cat = chip.dataset.chip; S.ui.setChip(root, 'cat', cat); paint(); return; }
        if (e.target.closest('[data-add]')) { S.custom.openForm('vocab', () => { cat = 'mine'; S.ui.setChip(root, 'cat', 'mine'); paint(); }); return; }
        if (e.target.closest('[data-study]')) { S.go(`review?deck=${cat === 'mine' ? 'custom' : 'vocab'}${cat !== 'all' && cat !== 'mine' ? `&cat=${cat}` : ''}`); return; }
        const del = e.target.closest('[data-del]');
        if (del) S.custom.remove('vocab', +del.dataset.del, paint);
      });
      S.$('input[type=search]', root).addEventListener('input', S.debounce((e) => { q = e.target.value.trim(); paint(); }, 120));
      paint();
    },
  });
})(window.S);
