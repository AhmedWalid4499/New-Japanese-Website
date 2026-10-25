// Study plan — the 8-week roadmap to N5, with tasks you can tick off.
(function (S) {
  const esc = S.esc;

  S.view('plan', {
    render(root) {
      const paint = () => {
        const done = S.store.plan.all();
        const total = STUDY_PLAN.reduce((a, w) => a + w.tasks.length, 0);
        const doneCount = Object.keys(done).length;
        const current = STUDY_PLAN.findIndex((w, wi) => w.tasks.some((_, ti) => !done[`${wi}-${ti}`]));

        root.innerHTML = `
          ${S.ui.pageHead({ kicker: 'Track', title: 'Study plan', jp: 'けいかく', desc: 'About an hour a day for eight weeks. Tick tasks off as you go — consistency beats intensity.' })}
          <section class="card plan-summary">
            ${S.ui.ring(S.pct(doneCount, total), { size: 84, stroke: 8 })}
            <div><h2>${doneCount} of ${total} tasks done</h2><p class="muted">${current >= 0 ? `You’re on <b>${esc(STUDY_PLAN[current].week)}</b>: ${esc(STUDY_PLAN[current].title)}.` : 'Every task complete — you’re ready for the exam! 頑張って！'}</p></div>
          </section>
          <ol class="timeline">${STUDY_PLAN.map((w, wi) => {
            const n = w.tasks.filter((_, ti) => done[`${wi}-${ti}`]).length;
            return `<li class="tl-item ${wi === current ? 'current' : ''} ${n === w.tasks.length ? 'complete' : ''}" style="--accent:${esc(w.color)}">
              <span class="tl-dot">${n === w.tasks.length ? S.icon('check') : wi + 1}</span>
              <section class="card tl-card">
                <header class="row gap"><div><div class="kicker">${esc(w.week)}</div><h3>${esc(w.title)}</h3></div><span class="spacer"></span><span class="muted small">${n}/${w.tasks.length}</span></header>
                <ul class="tasks">${w.tasks.map((t, ti) => `<li><label class="check"><input type="checkbox" data-task="${wi}-${ti}" ${done[`${wi}-${ti}`] ? 'checked' : ''}><span>${esc(t)}</span></label></li>`).join('')}</ul>
              </section>
            </li>`;
          }).join('')}</ol>
          <section class="card tip"><h2 class="card-title">About the JLPT N5</h2>
            <p class="muted">The test has three parts — language knowledge (vocabulary & grammar), reading, and listening. You need <b>80 of 180</b> points overall and minimum scores in each section to pass. Aim to recognise about 100 kanji and 800 words.</p></section>`;
      };
      root.addEventListener('change', (e) => {
        const cb = e.target.closest('[data-task]');
        if (cb) { S.store.plan.toggle(cb.dataset.task); paint(); }
      });
      paint();
    },
  });
})(window.S);
