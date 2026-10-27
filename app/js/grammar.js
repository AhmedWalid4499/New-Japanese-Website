// Grammar tab: the 32-lesson N5 grammar course (shared with the website) — read the lesson,
// listen to the examples, then practise it as an exercise session.
(function (A) {
  const esc = A.esc;
  const isJp = (s) => /[ぁ-んァ-ン一-龯]/.test(String(s));
  const md = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

  A.state.grammar = A.state.grammar || {};

  // Full-screen panel with a close button (used by the grammar reader and the extra practice modes)
  A.panel = (html, { title = '', onClose } = {}) => {
    const root = document.createElement('div');
    root.className = 'lesson panel';
    root.innerHTML = `<header class="panel-top"><button class="icon-btn" data-x aria-label="Close">${A.icon('x')}</button><b class="panel-title">${esc(title)}</b><span class="panel-slot" data-slot></span></header>
      <main class="lesson-body panel-body" data-body>${html}</main>`;
    document.body.appendChild(root);
    document.body.classList.add('in-lesson');
    const close = () => { A.speakStop(); root.remove(); if (!A.$('.lesson')) document.body.classList.remove('in-lesson'); onClose && onClose(); };
    A.$('[data-x]', root).addEventListener('click', close);
    root.addEventListener('click', (e) => { const s = e.target.closest('[data-say]'); if (s && !e.target.closest('.lesson-body .ex')) { A.speak(s.dataset.say, s.hasAttribute('data-slow')); } });
    return { el: root, body: A.$('[data-body]', root), slot: A.$('[data-slot]', root), close };
  };

  // Example sentences become practice items (so they also show up in review)
  const sentenceItems = (m) => m.examples.map((x, i) => {
    const id = `g:${m.id}:${i}`;
    if (!A.items[id]) A.items[id] = { id, kind: 'sentence', jp: x.jp.replace(/[。？！]$/, ''), en: x.en, read: x.rom, say: x.jp, unit: 'grammar' };
    return A.items[id];
  });
  if (typeof GRAMMAR_COURSE !== 'undefined') GRAMMAR_COURSE.forEach(sentenceItems);

  const quizEx = (m) => m.quiz.map((q) => {
    const order = A.shuffle(q.opts.map((_, i) => i));
    const options = order.map((i) => q.opts[i]);
    return { type: 'choice', title: isJp(q.q) ? 'Choose the right answer' : q.q, prompt: isJp(q.q) ? q.q : '', promptJp: true, options, answer: order.indexOf(q.ans), optJp: options.some(isJp), explain: q.exp, say: isJp(q.q) ? q.q.replace(/＿+/g, '、') : '' };
  });

  function practise(m, onFinish) {
    const quiz = quizEx(m);
    const sentences = A.buildPractice(A.sample(sentenceItems(m).filter((it) => it.en.split(' ').length <= 9), 4));
    const exercises = [...quiz.slice(0, 3), ...sentences, ...quiz.slice(3)];
    A.play({
      exercises, hearts: false, xp: 15, doneTitle: `${m.short || 'Grammar'} — lesson complete!`,
      onDone: (r) => {
        if (r) {
          const g = A.state.grammar[m.id] || {};
          A.state.grammar[m.id] = { done: g.done || r.acc >= 60, best: Math.max(g.best || 0, r.acc), at: Date.now() };
          A.quest('grammar', 1);
          A.save(); A.checkAchievements();
        }
        onFinish && onFinish();
      },
    });
  }

  function reader(m) {
    const u = COURSE_UNITS.find((x) => x.n === m.unit) || COURSE_UNITS[0];
    const romaji = A.state.profile.romaji;
    const idx = GRAMMAR_COURSE.indexOf(m), next = GRAMMAR_COURSE[idx + 1];
    const p = A.panel(`<article class="gram" style="--u:${u.color}">
        <div class="gram-kicker" lang="ja">第${A.kanjiNum(u.n)}課 · ${esc(u.title)}</div>
        <h1 class="gram-title">${esc(m.title)}</h1>
        <p class="muted">${esc(m.summary)}</p>
        <h3 class="gram-h"><span lang="ja">式</span> How to build it</h3>
        ${m.formulas.map((f) => `<div class="formula"><small>${esc(f.label)}</small><b lang="ja">${esc(f.f)}</b></div>`).join('')}
        <h3 class="gram-h"><span lang="ja">説</span> Explanation</h3>
        ${m.explain.map((t) => `<p>${md(t)}</p>`).join('')}
        ${m.table ? `<div class="gram-table"><table><thead><tr>${m.table.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${m.table.rows.map((r) => `<tr>${r.map((c, i) => `<td ${i ? 'lang="ja"' : ''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : ''}
        <h3 class="gram-h"><span lang="ja">例</span> Examples</h3>
        ${m.examples.map((x) => `<button class="gram-ex" data-say="${esc(x.jp)}"><span class="speaker sm">${A.icon('volume')}</span><span><span lang="ja" class="gram-ex-jp">${esc(x.jp)}</span>${romaji && x.rom ? `<small>${esc(x.rom)}</small>` : ''}<em>${esc(x.en)}</em></span></button>`).join('')}
        ${m.mistakes?.length ? `<h3 class="gram-h"><span lang="ja">誤</span> Common mistakes</h3>${m.mistakes.map((x) => `<div class="gram-mistake"><div class="bad" lang="ja">✗ ${esc(x.wrong)}</div><div class="good" lang="ja">✓ ${esc(x.right)}</div><small>${esc(x.why)}</small></div>`).join('')}` : ''}
        ${m.tips?.length ? `<div class="gram-tip">${A.mascot('mini')}<div>${m.tips.map((t) => `<p>${md(t)}</p>`).join('')}</div></div>` : ''}
        <button class="btn primary block lg" data-practise>Practise this lesson</button>
        ${window.SakuraAI && SakuraAI.hasChat() ? `<button class="btn block" data-ask>${A.icon('chat')} Ask Sensei about this</button>` : ''}
        ${next ? `<button class="btn ghost block" data-next>Next: ${esc(next.title)} ›</button>` : ''}
      </article>`, { title: `Lesson ${m.n}`, onClose: () => A.go('grammar') });
    p.body.addEventListener('click', (e) => {
      if (e.target.closest('[data-practise]')) practise(m, () => { p.close(); });
      if (e.target.closest('[data-next]')) { p.close(); reader(next); }
      if (e.target.closest('[data-ask]')) A.openSensei(`I’m studying “${m.title}”. Explain it another way with new simple examples, then give me one sentence to translate.`);
    });
  }
  A.openGrammar = reader;

  A.screens.grammar = (el) => {
    const g = A.state.grammar;
    const done = GRAMMAR_COURSE.filter((m) => g[m.id]?.done).length;
    const next = GRAMMAR_COURSE.find((m) => !g[m.id]?.done);
    el.innerHTML = `${A.statusBar()}
      <div class="screen-head"><h1>Grammar</h1><p class="muted">${GRAMMAR_COURSE.length} short lessons covering all of N5 grammar. Read, listen, then practise.</p></div>
      <div class="gram-progress card">${A.ring((done / GRAMMAR_COURSE.length) * 100, `${done}/${GRAMMAR_COURSE.length}`, 76)}
        <div><b>${next ? `Next: ${esc(next.title)}` : 'Course complete — おめでとう！'}</b>${next ? `<button class="btn primary" data-open="${esc(next.id)}">Continue</button>` : ''}</div></div>
      ${COURSE_UNITS.map((u) => {
        const mods = GRAMMAR_COURSE.filter((m) => m.unit === u.n);
        return `<h3 class="section-label" style="--u:${u.color}"><span class="unit-pill" lang="ja">第${A.kanjiNum(u.n)}課</span> ${esc(u.title)}</h3>
          <div class="gram-list">${mods.map((m) => `<button class="gram-row ${g[m.id]?.done ? 'done' : ''} ${next && next.id === m.id ? 'next' : ''}" data-open="${esc(m.id)}" style="--u:${u.color}">
            <span class="gram-n">${g[m.id]?.done ? '<span lang="ja">済</span>' : m.n}</span>
            <span class="gram-text"><b>${esc(m.title)}</b><small>${esc(m.summary)}</small></span><span class="chev">›</span></button>`).join('')}</div>`;
      }).join('')}`;
    el.addEventListener('click', (e) => {
      const o = e.target.closest('[data-open]');
      if (o) { A.sfx('tap'); reader(GRAMMAR_COURSE.find((m) => m.id === o.dataset.open)); }
    });
  };
})(window.A);
