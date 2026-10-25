// Progress — streaks, activity heatmap, mastery per area and quiz history.
(function (S) {
  const esc = S.esc;
  const WEEKS = 18;

  function heatmap() {
    const act = S.store.activity.map();
    const end = new Date(); end.setHours(0, 0, 0, 0);
    const start = new Date(end); start.setDate(end.getDate() - (WEEKS * 7 - 1) - end.getDay());
    const cells = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const n = act[S.dayKey(d)] || 0;
      const lvl = n === 0 ? 0 : n < 5 ? 1 : n < 15 ? 2 : n < 30 ? 3 : 4;
      cells.push(`<span class="hm l${lvl}" title="${S.fmtDate(d)}: ${n} item${n === 1 ? '' : 's'}"></span>`);
    }
    return `<div class="heatmap" role="img" aria-label="Study activity over the last ${WEEKS} weeks">${cells.join('')}</div>
      <div class="heatmap-legend muted small">Less <span class="hm l0"></span><span class="hm l1"></span><span class="hm l2"></span><span class="hm l3"></span><span class="hm l4"></span> More</div>`;
  }

  S.view('progress', {
    render(root) {
      const paint = () => {
        const scores = S.store.scores.list();
        const st = S.store.streak();
        const days = Object.values(S.store.activity.map()).filter((n) => n > 0).length;
        const avg = scores.length ? Math.round(scores.reduce((a, s) => a + s.pct, 0) / scores.length) : 0;
        const best = {};
        scores.forEach((s) => { if (!best[s.type] || s.pct > best[s.type].pct) best[s.type] = s; });

        root.innerHTML = `
          ${S.ui.pageHead({ kicker: 'Track', title: 'Progress', jp: 'しんちょく', desc: 'Everything counts: flashcard reviews, quizzes, and items you mark as known.', actions: `<a class="btn ghost" href="#/account">${S.icon('download')} Backup & data</a>` })}
          <div class="stat-cards">
            <div class="card stat-card"><span class="streak ${st.studiedToday ? 'lit' : ''}">${S.icon('flame')}</span><b>${st.current}</b><span>Current streak</span></div>
            <div class="card stat-card"><b>${st.best}</b><span>Best streak</span></div>
            <div class="card stat-card"><b>${days}</b><span>Days studied</span></div>
            <div class="card stat-card"><b>${scores.length}</b><span>Quizzes taken</span></div>
            <div class="card stat-card"><b>${scores.length ? avg + '%' : '—'}</b><span>Average score</span></div>
          </div>
          <section class="card"><h2 class="card-title">Activity</h2>${heatmap()}</section>
          <div class="grid-2">
            <section class="card"><h2 class="card-title">Mastery</h2>
              <ul class="bars">${S.mastery().map((m) => `<li><a href="#/${m.route}"><span lang="ja" class="glyph sm">${m.glyph}</span>${esc(m.label)}</a>${S.ui.bar(S.pct(m.done, m.total), 'good')}<b>${m.done}/${m.total}</b></li>`).join('')}</ul>
              <p class="muted small">Kana, kanji and vocabulary count once mastered in flashcards (box 4+). The rest count when you mark them “Know it”.</p>
            </section>
            <section class="card"><h2 class="card-title">Personal bests</h2>
              ${Object.keys(best).length ? `<ul class="bars">${Object.values(best).map((s) => `<li><span>${esc(s.type)}</span>${S.ui.bar(s.pct, S.ui.scoreTone(s.pct))}<b>${s.pct}%</b></li>`).join('')}</ul>`
                : S.ui.empty('No results yet', 'Finish a quiz, drill or reading test to see your bests.', `<button class="btn primary" data-go="quiz">Take a quiz</button>`)}
            </section>
          </div>
          <section class="card">
            <div class="section-head"><h2 class="card-title">History</h2>${scores.length ? `<button class="btn ghost sm" data-clear>${S.icon('trash')} Clear history</button>` : ''}</div>
            ${scores.length ? `<div class="table-wrap"><table class="table">
              <thead><tr><th>Activity</th><th>Score</th><th class="hide-sm">Result</th><th>Date</th></tr></thead>
              <tbody>${scores.slice(0, 40).map((s) => `<tr><td>${esc(s.type)}</td><td class="strong">${s.score}/${s.total}</td><td class="hide-sm">${S.ui.bar(s.pct, S.ui.scoreTone(s.pct))}</td><td class="muted nowrap">${S.fmtDate(s.date)}</td></tr>`).join('')}</tbody></table></div>`
              : '<p class="muted">Your quiz results will appear here.</p>'}
          </section>`;
        const clr = S.$('[data-clear]', root);
        if (clr) clr.addEventListener('click', () => { if (S.confirm('Clear your whole quiz history? This cannot be undone.')) { S.store.scores.clear(); paint(); } });
      };
      paint();
    },
  });
})(window.S);
