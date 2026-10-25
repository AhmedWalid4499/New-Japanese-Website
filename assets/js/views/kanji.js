// Kanji — compact grid; open any kanji for readings, words and animated stroke order.
(function (S) {
  const esc = S.esc;
  const CATS = [['all', 'All'], ['numbers', 'Numbers'], ['time', 'Time'], ['nature', 'Nature'], ['people', 'People'], ['body', 'Body'], ['direction', 'Direction'], ['other', 'Other'], ['mine', 'Mine']];
  const allKanji = () => [...KANJI.map((k) => ({ ...k, _id: `kanji_${k.char}` })), ...S.store.custom.list('kanji').map((k, i) => ({ ...k, _id: `kanji_c${i}`, _ci: i }))];

  function openDetail(k, onChange) {
    const custom = k._ci != null;
    const cards = S.store.cards.get(`k:${k.char}`);
    const m = S.modal({
      title: `${k.char} — ${k.meaning}`, wide: true,
      body: `<div class="kanji-detail">
        <div class="kanji-detail-main">
          <div class="kanji-hero" lang="ja">${esc(k.char)}</div>
          <div class="row gap center">${S.ui.speak(k.kun ? k.kun.split('・')[0] : k.on.split('・')[0], { slow: false, label: 'Listen' })}${custom ? '' : S.ui.bm(k._id, { type: 'kanji', label: k.char, char: k.char, detail: `${k.meaning} · On ${k.on} · Kun ${k.kun || '—'}` })}</div>
          <dl class="facts">
            <div><dt>Meaning</dt><dd>${esc(k.meaning)}</dd></div>
            <div><dt>On’yomi</dt><dd lang="ja">${esc(k.on || '—')}</dd></div>
            <div><dt>Kun’yomi</dt><dd lang="ja">${esc(k.kun || '—')}</dd></div>
            <div><dt>Strokes</dt><dd>${esc(k.strokes || '?')}</dd></div>
            <div><dt>Flashcard</dt><dd>${cards ? (cards.box >= 4 ? S.ui.badge('Mastered', 'good') : S.ui.badge(`Learning · box ${cards.box}`, 'soft')) : S.ui.badge('Not studied yet')}</dd></div>
          </dl>
          ${custom ? `<button class="btn ghost sm" data-del>${S.icon('trash')} Delete custom kanji</button>` : ''}
        </div>
        <div class="kanji-detail-side">
          <h3 class="mini-title">Stroke order</h3>
          <div data-strokes></div>
          ${(k.words || []).length ? `<h3 class="mini-title">Example words</h3>
            <ul class="word-list">${k.words.map((w) => `<li><span lang="ja" class="strong">${esc(w.jp)}</span> <span class="muted" lang="ja">${esc(w.read)}</span> <span>${esc(w.en)}</span> ${S.ui.speak(w.read || w.jp, { slow: false })}</li>`).join('')}</ul>` : ''}
        </div>
      </div>`,
      onClose: onChange,
    });
    S.strokes.mount(S.$('[data-strokes]', m.el), k.char);
    const del = S.$('[data-del]', m.el);
    if (del) del.addEventListener('click', () => S.custom.remove('kanji', k._ci, () => { m.close(); }));
  }

  S.view('kanji', {
    render(root, { params }) {
      let cat = 'all', q = '';
      root.innerHTML = `
        ${S.ui.pageHead({ kicker: 'Learn', title: 'Kanji', jp: 'かんじ', desc: `All ${KANJI.length} N5 kanji. Open one to see readings, example words and its stroke order.`, actions: `<button class="btn" data-add>${S.icon('plus')} Add kanji</button><button class="btn primary" data-go="review?deck=kanji">${S.icon('cards')} Flashcards</button>` })}
        <div class="toolbar sticky">
          ${S.ui.chips('cat', CATS.map(([value, label]) => ({ value, label, count: value === 'all' ? null : value === 'mine' ? S.store.custom.list('kanji').length : KANJI.filter((k) => k.cat === value).length })), cat)}
          ${S.ui.searchBox('Search by kanji, meaning or reading')}
        </div>
        <div class="kanji-grid" data-grid></div>`;

      const grid = S.$('[data-grid]', root);
      const paint = () => {
        const all = S.store.cards.all();
        const t = q.toLowerCase();
        const list = allKanji().filter((k) => (cat === 'all' || (cat === 'mine' ? k._ci != null : k.cat === cat)) &&
          (!t || [k.char, k.meaning, k.on, k.kun].some((f) => String(f || '').toLowerCase().includes(t))));
        grid.innerHTML = list.length ? list.map((k) => {
          const c = all[`k:${k.char}`];
          const state = c ? (c.box >= 4 ? 'mastered' : 'learning') : '';
          return `<button class="kanji-tile ${state}" data-open="${esc(k._id)}" title="${esc(k.meaning)}">
            ${S.store.bm.has(k._id) ? `<span class="tile-star">${S.icon('star')}</span>` : ''}
            <span class="kanji-char" lang="ja">${esc(k.char)}</span>
            <span class="kanji-mean">${esc(k.meaning)}</span>
            <span class="kanji-read" lang="ja">${esc((k.kun || k.on || '').split('・')[0])}</span>
          </button>`;
        }).join('') : `<div class="span-all">${S.ui.empty(cat === 'mine' ? 'No custom kanji yet' : 'No kanji found', cat === 'mine' ? 'Add kanji you want to remember beyond N5.' : 'Try a different search.')}</div>`;
      };

      root.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-chip]');
        if (chip) { cat = chip.dataset.chip; S.ui.setChip(root, 'cat', cat); paint(); return; }
        if (e.target.closest('[data-add]')) { S.custom.openForm('kanji', () => { cat = 'mine'; S.ui.setChip(root, 'cat', 'mine'); paint(); }); return; }
        const open = e.target.closest('[data-open]');
        if (open) { const k = allKanji().find((x) => x._id === open.dataset.open); if (k) openDetail(k, paint); }
      });
      S.$('input[type=search]', root).addEventListener('input', S.debounce((e) => { q = e.target.value.trim(); paint(); }, 120));
      paint();

      if (params[0]) { const k = allKanji().find((x) => x.char === params[0]); if (k) openDetail(k, paint); }
    },
  });
})(window.S);
