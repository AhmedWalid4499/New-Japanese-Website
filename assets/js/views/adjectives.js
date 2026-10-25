// Adjectives — how い and な adjectives conjugate, plus opposite pairs.
(function (S) {
  const esc = S.esc;
  const I_FORMS = [['Present', 'たかい', 'is expensive'], ['Negative', 'たかくない', 'is not expensive'], ['Past', 'たかかった', 'was expensive'], ['Past negative', 'たかくなかった', 'was not expensive']];
  const NA_FORMS = [['Present', 'しずかです', 'is quiet'], ['Negative', 'しずかじゃないです', 'is not quiet'], ['Past', 'しずかでした', 'was quiet'], ['Past negative', 'しずかじゃなかったです', 'was not quiet']];

  const formsTable = (rows) => `<table class="table compact"><tbody>${rows.map(([f, jp, en]) => `<tr><td class="muted">${f}</td><td lang="ja" class="strong">${jp}</td><td class="muted">${en}</td></tr>`).join('')}</tbody></table>`;
  const side = (w) => `<div class="adj-side"><div class="adj-jp" lang="ja">${esc(w.jp)}</div><div class="muted small">${esc(w.rom || '')}</div><div>${esc(w.en)}</div>${S.ui.speak(w.jp, { slow: false })}</div>`;

  S.view('adjectives', {
    render(root) {
      let type = 'all';
      root.innerHTML = `
        ${S.ui.pageHead({ kicker: 'Learn', title: 'Adjectives', jp: 'けいようし', desc: 'Japanese adjectives come in two families that conjugate differently. Learn them in opposite pairs — twice the words for the same effort.', actions: `<button class="btn" data-add>${S.icon('plus')} Add pair</button><button class="btn primary" data-go="review?deck=adj">${S.icon('cards')} Flashcards</button>` })}
        <div class="grid-2">
          <section class="card"><h2 class="card-title">${S.ui.badge('い', 'iadj')} い-adjectives</h2>
            <p class="muted">End in い. Drop the final い and add endings.</p>${formsTable(I_FORMS)}
            <div class="callout">Exception: いい (good) → よくない, よかった.</div></section>
          <section class="card"><h2 class="card-title">${S.ui.badge('な', 'naadj')} な-adjectives</h2>
            <p class="muted">Add な before a noun (しずかな へや). Conjugate with です.</p>${formsTable(NA_FORMS)}
            <div class="callout">Watch out: きれい and きらい look like い-adjectives but are な-adjectives.</div></section>
        </div>
        <div class="toolbar">${S.ui.chips('type', [{ value: 'all', label: 'All pairs' }, { value: 'i', label: 'い-adjectives' }, { value: 'na', label: 'な-adjectives' }], type)}</div>
        <div class="adj-grid" data-grid></div>`;

      const grid = S.$('[data-grid]', root);
      const paint = () => {
        const custom = S.store.custom.list('adj').map((p, i) => ({ ...p, _ci: i }));
        const list = [...ADJ_PAIRS, ...custom].filter((p) => type === 'all' || p.type === type);
        grid.innerHTML = list.map((p) => `<article class="card adj-pair">
          ${side(p.a)}<div class="adj-vs" aria-hidden="true">⟷</div>${side(p.b)}
          <footer class="adj-foot">${S.ui.badge(p.type === 'i' ? 'い-adjective' : 'な-adjective', p.type === 'i' ? 'iadj' : 'naadj')}
            ${p._ci != null ? `${S.ui.badge('mine', 'soft')}<button class="btn-icon" data-del="${p._ci}" title="Delete">${S.icon('trash')}</button>` : ''}</footer>
        </article>`).join('');
      };

      root.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-chip]');
        if (chip) { type = chip.dataset.chip; S.ui.setChip(root, 'type', type); paint(); return; }
        if (e.target.closest('[data-add]')) { S.custom.openForm('adj', paint); return; }
        const del = e.target.closest('[data-del]');
        if (del) S.custom.remove('adj', +del.dataset.del, paint);
      });
      paint();
    },
  });
})(window.S);
