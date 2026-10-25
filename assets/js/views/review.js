// Flashcards with spaced repetition (Leitner boxes). Cards you know come back less often.
(function (S) {
  const esc = S.esc;
  const NEW_PER_SESSION = 15;

  // Every deck is a list of { id, front, back, detail, speak, bm }
  const DECKS = {
    vocab: { label: 'Vocabulary', glyph: '語', cards: (q) => VOCAB.filter((v) => !q.cat || v.cat === q.cat).map((v) => ({ id: `v:${v.jp}`, front: v.jp, back: v.en, detail: v.read, speak: v.jp, bm: `vocab_${v.jp}` })) },
    kanji: { label: 'Kanji', glyph: '漢', cards: () => KANJI.map((k) => ({ id: `k:${k.char}`, front: k.char, back: k.meaning, detail: `On ${k.on} · Kun ${k.kun || '—'}`, speak: (k.kun || k.on).split('・')[0], bm: `kanji_${k.char}` })) },
    grammar: { label: 'Grammar', glyph: '文', cards: () => GRAMMAR_SECTIONS.flatMap((s) => s.items.map((g, i) => ({ id: `g:${s.id}_${i}`, front: g.pattern, back: g.meaning, detail: g.structure, speak: g.examples?.[0]?.jp, bm: `gc_${s.id}_${i}` }))) },
    adj: { label: 'Adjective opposites', glyph: '形', cards: () => ADJ_PAIRS.map((p) => ({ id: `a:${p.a.jp}-${p.b.jp}`, front: p.a.jp, back: `${p.b.jp}`, detail: `${p.a.en} ⟷ ${p.b.en}`, speak: p.a.jp, backJp: true })) },
    kana: { label: 'Kana', glyph: 'あ', cards: () => [...HIRAGANA_ROWS, ...KATAKANA_ROWS].flatMap((r) => r.cells).filter((c) => c.k).map((c) => ({ id: `h:${c.k}`, front: c.k, back: c.r, detail: '', speak: c.k })) },
    phrases: { label: 'Survival phrases', glyph: '話', cards: () => SURVIVAL_PHRASES.map((p) => ({ id: `p:${S.phraseId(p)}`, front: p.jp, back: p.en, detail: p.rom, speak: p.jp, bm: S.phraseId(p) })) },
    custom: { label: 'My words & kanji', glyph: '私', cards: () => [
      ...S.store.custom.list('vocab').map((v) => ({ id: `cv:${v.jp}`, front: v.jp, back: v.en, detail: v.read, speak: v.jp })),
      ...S.store.custom.list('kanji').map((k) => ({ id: `ck:${k.char}`, front: k.char, back: k.meaning, detail: `On ${k.on || '—'} · Kun ${k.kun || '—'}`, speak: k.kun || k.on })),
    ] },
    bookmarks: { label: 'Bookmarked', glyph: '印', cards: () => { const b = S.store.bm.all(); return ['vocab', 'kanji', 'grammar', 'phrases'].flatMap((d) => DECKS[d].cards({})).filter((c) => c.bm && b[c.bm]); } },
  };
  S.decks = DECKS;

  const deckStats = (cards) => {
    const all = S.store.cards.all();
    const ids = cards.map((c) => c.id);
    return { total: ids.length, due: ids.filter((id) => all[id] && all[id].due <= Date.now()).length, fresh: ids.filter((id) => !all[id]).length, mastered: S.store.cards.mastered(ids, all) };
  };
  S.dueCount = () => Object.keys(DECKS).filter((d) => d !== 'bookmarks').reduce((a, d) => a + deckStats(DECKS[d].cards({})).due, 0);

  function picker(root) {
    root.innerHTML = `
      ${S.ui.pageHead({ kicker: 'Practice', title: 'Flashcards', jp: 'おぼえる', desc: 'Each session mixes cards that are due with a few new ones. Rate yourself honestly — <b>Again</b> brings a card back soon, <b>Easy</b> pushes it weeks away.' })}
      <div class="deck-grid">${Object.entries(DECKS).map(([key, d]) => {
        const st = deckStats(d.cards({}));
        return `<button class="card deck" data-deck="${key}" ${st.total ? '' : 'disabled'}>
          <span class="glyph big" lang="ja">${d.glyph}</span>
          <span class="deck-name">${esc(d.label)}</span>
          <span class="deck-meta">${st.total} cards · ${st.mastered} mastered</span>
          ${S.ui.bar(S.pct(st.mastered, st.total), 'good')}
          <span class="deck-due">${st.due ? S.ui.badge(`${st.due} due`, 'primary') : st.fresh ? S.ui.badge(`${Math.min(NEW_PER_SESSION, st.fresh)} new`, 'soft') : st.total ? S.ui.badge('All caught up', 'good') : S.ui.badge('Empty')}</span>
        </button>`;
      }).join('')}</div>
      <section class="card tip"><h2 class="card-title">Keyboard shortcuts</h2><p class="muted"><kbd>Space</kbd> flip · <kbd>1</kbd> Again · <kbd>2</kbd> Good · <kbd>3</kbd> Easy</p></section>`;
    root.addEventListener('click', (e) => { const d = e.target.closest('[data-deck]'); if (d) S.go(`review?deck=${d.dataset.deck}`); });
  }

  function session(root, deckKey, q) {
    const deck = DECKS[deckKey];
    const seen = new Set();
    const cards = deck.cards(q).filter((c) => !seen.has(c.id) && seen.add(c.id));
    const all = S.store.cards.all();
    const due = cards.filter((c) => all[c.id] && all[c.id].due <= Date.now()).sort((a, b) => all[a.id].due - all[b.id].due);
    const fresh = S.shuffle(cards.filter((c) => !all[c.id])).slice(0, NEW_PER_SESSION);
    // "cram" = practise random cards even when nothing is due
    const queue = q.mode === 'cram' ? S.sample(cards, 20) : [...due, ...fresh];
    const total = queue.length;
    let done = 0, flipped = false;
    const tally = [0, 0, 0];
    const title = `${deck.label}${q.cat ? ` · ${S.vocabLabel(q.cat)}` : ''}`;

    if (!queue.length) {
      root.innerHTML = `${S.ui.pageHead({ kicker: 'Flashcards', title })}
        ${S.ui.empty('All caught up!', 'Nothing is due in this deck right now. Come back later, or practise anyway.', `<div class="row gap center"><button class="btn primary" data-go="review?deck=${deckKey}${q.cat ? `&cat=${q.cat}` : ''}&mode=cram">Practise 20 random cards</button><button class="btn" data-go="review">All decks</button></div>`)}`;
      return;
    }

    root.innerHTML = `${S.ui.pageHead({ kicker: 'Flashcards', title, actions: `<button class="btn ghost" data-go="review">${S.icon('left')} All decks</button>` })}
      <div class="fc-wrap"><div class="fc-progress"><span data-left></span>${S.ui.bar(0)}</div><div data-stage></div></div>`;
    const stage = S.$('[data-stage]', root);

    const paint = () => {
      const c = queue[0];
      flipped = false;
      const st = S.store.cards.get(c.id);
      S.$('[data-left]', root).textContent = `${queue.length} left`;
      S.$('.fc-progress .bar span', root).style.width = `${S.pct(done, total + tally[0])}%`;
      stage.innerHTML = `
        <div class="flashcard" data-flip tabindex="0" role="button" aria-label="Flip card">
          <div class="fc-face fc-front">
            <span class="fc-state">${st ? `Box ${st.box}` : 'New'}</span>
            <div class="fc-text ${c.front.length > 8 ? 'long' : ''}" lang="ja">${esc(c.front)}</div>
            <div class="fc-hint">Tap or press Space to reveal</div>
          </div>
          <div class="fc-face fc-back">
            <div class="fc-text small ${c.backJp ? '' : 'latin'}" ${c.backJp ? 'lang="ja"' : ''}>${esc(c.back)}</div>
            ${c.detail ? `<div class="fc-detail">${esc(c.detail)}</div>` : ''}
          </div>
        </div>
        <div class="fc-actions" data-actions>
          ${c.speak ? `<button class="btn" data-speak="${esc(c.speak)}">${S.icon('volume')} Listen</button>` : ''}
          <button class="btn primary" data-reveal>Show answer</button>
        </div>`;
    };
    const reveal = () => {
      if (flipped) return;
      flipped = true;
      S.$('.flashcard', stage).classList.add('flipped');
      const c = queue[0];
      S.$('[data-actions]', stage).innerHTML = `
        ${c.speak ? `<button class="btn" data-speak="${esc(c.speak)}">${S.icon('volume')}</button>` : ''}
        <button class="btn grade again" data-grade="0"><kbd>1</kbd>Again</button>
        <button class="btn grade good" data-grade="1"><kbd>2</kbd>Good</button>
        <button class="btn grade easy" data-grade="2"><kbd>3</kbd>Easy</button>`;
    };
    const grade = (g) => {
      if (!flipped) return;
      const c = queue.shift();
      S.store.cards.rate(c.id, g);
      tally[g]++;
      if (g === 0) queue.splice(Math.min(queue.length, 3), 0, c); else done++;
      if (queue.length) paint(); else finish();
    };
    const finish = () => {
      cleanup();
      S.confetti(1800);
      stage.innerHTML = `<div class="card result center">
        <div class="kicker">Session complete</div><h2>${total} cards reviewed</h2>
        <div class="stat-row"><div class="stat"><b class="bad-text">${tally[0]}</b><span>Again</span></div><div class="stat"><b>${tally[1]}</b><span>Good</span></div><div class="stat"><b class="good-text">${tally[2]}</b><span>Easy</span></div></div>
        <div class="row gap center"><button class="btn primary" data-go="review">Back to decks</button><button class="btn" data-go="home">Home</button></div></div>`;
      S.$('[data-left]', root).textContent = 'Done';
      S.$('.fc-progress .bar span', root).style.width = '100%';
    };

    const onKey = (e) => {
      if (e.target.matches('input, textarea, select')) return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!flipped) reveal(); }
      else if (['1', '2', '3'].includes(e.key)) grade(+e.key - 1);
    };
    const cleanup = () => document.removeEventListener('keydown', onKey);
    document.addEventListener('keydown', onKey);
    S.onLeave(cleanup);
    stage.addEventListener('click', (e) => {
      if (e.target.closest('[data-speak]')) return;
      if (e.target.closest('[data-reveal]') || e.target.closest('[data-flip]')) { reveal(); return; }
      const g = e.target.closest('[data-grade]');
      if (g) grade(+g.dataset.grade);
    });
    paint();
  }

  S.view('review', {
    render(root, { query }) {
      if (query.deck && DECKS[query.deck]) session(root, query.deck, query);
      else picker(root);
    },
  });
})(window.S);
