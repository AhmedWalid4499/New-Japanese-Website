// Grammar — every N5 pattern, grouped by category, with examples and conjugation tables.
(function (S) {
  const esc = S.esc;
  const SHORT = { sentences: 'Basics', particles: 'Particles', verbs: 'Verbs', adjectives: 'Adjectives', tense: 'Tense & time', expressions: 'Expressions' };
  const BADGES ={ g1: 'Group 1', g2: 'Group 2', g3: 'Group 3', iadj: 'い-adj', naadj: 'な-adj' };

  const example = (ex) => `
    <li class="example">
      <div class="example-jp" lang="ja">${esc(ex.jp)} ${S.ui.speak(ex.jp)}</div>
      ${ex.rom ? `<div class="example-rom">${esc(ex.rom)}</div>` : ''}
      ${ex.en ? `<div class="example-en">${esc(ex.en)}</div>` : ''}
    </li>`;

  const conj = (t) => `
    <details class="conj"><summary>Conjugation table</summary>
      <div class="table-wrap"><table class="table">
        <thead><tr>${t[0].map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${t.slice(1).map((r) => `<tr>${r.map((c, i) => `<td ${i ? 'lang="ja"' : 'class="strong"'}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>
    </details>`;

  function card(item, id, { custom = false, customIdx = -1 } = {}) {
    return `<article class="card grammar-card" id="${esc(id)}">
      <header class="grammar-head">
        <div>
          ${item.badge ? S.ui.badge(BADGES[item.badge] || item.badge, item.badge) : ''}
          ${custom ? S.ui.badge('My pattern', 'soft') : ''}
          <h3 class="grammar-pattern" lang="ja">${esc(item.pattern)}</h3>
          <p class="grammar-meaning">${esc(item.meaning)}</p>
        </div>
        <div class="row">${custom ? `<button class="btn-icon" data-del="${customIdx}" title="Delete">${S.icon('trash')}</button>` : S.ui.bm(id, { type: 'grammar', label: item.pattern, detail: item.meaning })}</div>
      </header>
      ${item.structure ? `<div class="structure" lang="ja">${esc(item.structure)}</div>` : ''}
      ${item.explanation ? `<p class="explain">${esc(item.explanation)}</p>` : ''}
      ${item.examples?.length ? `<ul class="examples">${item.examples.map(example).join('')}</ul>` : ''}
      ${item.conjugationTable ? conj(item.conjugationTable) : ''}
      ${item.extraNote ? `<div class="callout">${esc(item.extraNote)}</div>` : ''}
      ${custom ? '' : `<footer class="card-foot">${S.ui.know('grammar', id)}</footer>`}
    </article>`;
  }

  S.view('grammar', {
    render(root, { params }) {
      let cat = 'all', q = '';
      const total = GRAMMAR_SECTIONS.reduce((a, s) => a + s.items.length, 0);
      const known = () => GRAMMAR_SECTIONS.reduce((a, s) => a + s.items.filter((_, i) => S.store.srs.get('grammar', `gc_${s.id}_${i}`) === 'known').length, 0);

      root.innerHTML = `
        ${S.ui.pageHead({ kicker: 'Learn', title: 'Grammar', jp: 'ぶんぽう', desc: `${total} JLPT N5 patterns organised by topic. Mark each one <b>Know it</b> as you master it.`, actions: `<button class="btn" data-add>${S.icon('plus')} Add pattern</button>` })}
        <div class="toolbar sticky">
          ${S.ui.chips('cat', [{ value: 'all', label: 'All' }, ...GRAMMAR_SECTIONS.map((s) => ({ value: s.id, label: SHORT[s.id] || s.title, count: s.items.length })), { value: 'mine', label: 'Mine', count: S.store.custom.list('grammar').length }], cat)}
          ${S.ui.searchBox('Search patterns, e.g. te-form, want, particle')}
        </div>
        <div class="progress-line" data-known></div>
        <div data-list></div>`;

      const list = S.$('[data-list]', root);
      const paintKnown = () => { const k = known(); S.$('[data-known]', root).innerHTML = `${S.ui.bar(S.pct(k, total))}<span>${k} of ${total} marked known</span>`; };

      const paint = () => {
        const t = q.toLowerCase();
        const match = (it) => !t || [it.pattern, it.meaning, it.explanation, it.structure].some((f) => String(f || '').toLowerCase().includes(t));
        let html = '';
        if (cat !== 'mine') {
          GRAMMAR_SECTIONS.filter((s) => cat === 'all' || s.id === cat).forEach((s) => {
            const items = s.items.map((it, i) => ({ it, i })).filter(({ it }) => match(it));
            if (!items.length) return;
            html += `<section class="section-block"><h2 class="section-title">${esc(s.title)} <span class="muted">${items.length}</span></h2>
              ${items.map(({ it, i }) => card(it, `gc_${s.id}_${i}`)).join('')}</section>`;
          });
        }
        if (cat === 'all' || cat === 'mine') {
          const mine = S.store.custom.list('grammar').map((it, i) => ({ it, i })).filter(({ it }) => match(it));
          if (mine.length) html += `<section class="section-block"><h2 class="section-title">My patterns <span class="muted">${mine.length}</span></h2>
            ${mine.map(({ it, i }) => card(it, `cg_${i}`, { custom: true, customIdx: i })).join('')}</section>`;
          else if (cat === 'mine') html += S.ui.empty('No custom patterns yet', 'Add grammar you meet in textbooks or anime — it lives right here with the rest.', `<button class="btn primary" data-add>${S.icon('plus')} Add pattern</button>`);
        }
        list.innerHTML = html || S.ui.empty('No matching patterns', `Nothing matches “${esc(q)}”. Try another word.`);
      };

      root.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-chip]');
        if (chip) { cat = chip.dataset.chip; S.ui.setChip(root, 'cat', cat); paint(); return; }
        if (e.target.closest('[data-add]')) { S.custom.openForm('grammar', () => { cat = 'mine'; S.ui.setChip(root, 'cat', 'mine'); paint(); }); return; }
        const del = e.target.closest('[data-del]');
        if (del) { S.custom.remove('grammar', +del.dataset.del, paint); return; }
        if (e.target.closest('[data-srs]')) setTimeout(paintKnown, 0);
      });
      S.$('input[type=search]', root).addEventListener('input', S.debounce((e) => { q = e.target.value.trim(); paint(); }, 150));

      paint(); paintKnown();

      // Deep link: #/grammar/<section>-<index>
      if (params[0]) {
        const [sid, idx] = [params[0].replace(/-\d+$/, ''), params[0].split('-').pop()];
        const el = document.getElementById(`gc_${sid}_${idx}`);
        if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('flash'); }
      }
    },
  });
})(window.S);
