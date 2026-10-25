// Bookmarks — everything you starred, in one list.
(function (S) {
  const esc = S.esc;
  const TYPES = { grammar: 'Grammar', kanji: 'Kanji', vocab: 'Words', phrase: 'Phrases' };

  const routeFor = (id, b) => {
    if (b.type === 'grammar') { const m = id.match(/^gc_(.+)_(\d+)$/); return m ? `grammar/${m[1]}-${m[2]}` : 'grammar'; }
    if (b.type === 'kanji') return `kanji/${b.char || id.replace(/^kanji_/, '')}`;
    if (b.type === 'vocab') return `vocab?q=${encodeURIComponent(b.label)}`;
    if (b.type === 'phrase') { const i = SURVIVAL_PHRASES.findIndex((p) => S.phraseId(p) === id); return i >= 0 ? `phrases/${i}` : 'phrases'; }
    return 'home';
  };

  S.view('bookmarks', {
    render(root) {
      let type = 'all';
      root.innerHTML = `
        ${S.ui.pageHead({ kicker: 'Track', title: 'Bookmarks', jp: 'しおり', desc: 'Tap the star on any grammar point, kanji, word or phrase to save it here.', actions: `<button class="btn primary" data-go="review?deck=bookmarks">${S.icon('cards')} Review as flashcards</button>` })}
        <div class="toolbar" data-chipbar></div>
        <div class="stack" data-list></div>`;
      const list = S.$('[data-list]', root);

      const paint = () => {
        const all = Object.entries(S.store.bm.all()).sort((a, b) => new Date(b[1].date) - new Date(a[1].date));
        S.$('[data-chipbar]', root).innerHTML = S.ui.chips('type', [{ value: 'all', label: 'All', count: all.length }, ...Object.entries(TYPES).map(([value, label]) => ({ value, label, count: all.filter(([, b]) => b.type === value).length }))], type);
        const items = all.filter(([, b]) => type === 'all' || b.type === type);
        list.innerHTML = items.length ? items.map(([id, b]) => `
          <article class="card bm-row">
            <span class="bm-mark" lang="ja">${esc(b.char || b.label)}</span>
            <div class="bm-body">
              <div class="row gap">${S.ui.badge(TYPES[b.type] || b.type, 'soft')}${b.char ? '' : `<b lang="ja">${esc(b.label)}</b>`}</div>
              <div class="muted small">${esc(b.detail || '')}</div>
            </div>
            <div class="row">${S.ui.speak(b.char || b.label, { slow: false })}
              <a class="btn sm ghost" href="#/${routeFor(id, b)}">Open</a>
              <button class="btn-icon" data-remove="${esc(id)}" title="Remove">${S.icon('x')}</button></div>
          </article>`).join('')
          : S.ui.empty('Nothing bookmarked yet', 'Look for the ☆ star on grammar cards, kanji, words and phrases.', '<div class="row gap center"><a class="btn" href="#/grammar">Grammar</a><a class="btn" href="#/kanji">Kanji</a></div>');
      };

      root.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-chip]');
        if (chip) { type = chip.dataset.chip; paint(); return; }
        const rm = e.target.closest('[data-remove]');
        if (rm) { S.store.bm.remove(rm.dataset.remove); paint(); }
      });
      paint();
    },
  });
})(window.S);
