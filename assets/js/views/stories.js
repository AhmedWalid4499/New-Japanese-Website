// Stories — graded readers with tap-to-translate words, audio, and comprehension questions.
// Claude can write new stories on any topic; those are kept on this device.
(function (S) {
  const esc = S.esc;
  const AI_KEY = 'sakura_ai_stories';
  const LEVELS = { 1: 'Very easy', 2: 'Easy', 3: 'Full N5' };

  const mine = () => S.store.read(AI_KEY, []);
  const all = () => [...(typeof STORIES !== 'undefined' ? STORIES : []), ...mine()];
  const results = () => S.store.read(S.store.KEYS.stories, {});
  const saveResult = (id, best) => {
    const r = results();
    r[id] = { best: Math.max(r[id]?.best || 0, best), done: true, date: new Date().toISOString() };
    S.store.write(S.store.KEYS.stories, r);
  };
  const lineText = (line) => line.t.map((t) => t[0]).join('');
  const storyText = (s) => s.lines.map(lineText).join('');

  function list(root) {
    const r = results();
    const card = (s) => `<a class="story-card ${r[s.id] ? 'done' : ''}" href="#/stories/${esc(s.id)}">
      <span class="story-jp" lang="ja">${esc(s.jp)}</span>
      <b>${esc(s.title)}</b>
      <span class="row gap-sm">${S.ui.badge(LEVELS[s.level] || 'N5', s.level === 1 ? 'good' : s.level === 3 ? 'warn' : 'soft')}${s.ai ? S.ui.badge('AI', 'accent') : ''}${r[s.id] ? `<span class="muted small">${S.icon('check')} ${r[s.id].best}%</span>` : ''}</span>
    </a>`;
    root.innerHTML = `
      ${S.ui.pageHead({ kicker: 'Practice', title: 'Stories', jp: 'ものがたり', desc: 'Short graded stories. Tap any word to see its reading and meaning, listen line by line, then answer a few questions.' })}
      <section class="card ai-gen">
        <div class="grow"><h2 class="card-title">${S.icon('spark')} Write me a new story</h2>
          <p class="muted">Claude writes an original story at your level on any topic you like.</p></div>
        ${S.ai.hasChat() ? `<form class="row gap wrap" data-gen>
          <input name="topic" placeholder="Topic, e.g. a rainy day in Tokyo" maxlength="80">
          <select name="level">${Object.entries(LEVELS).map(([k, v]) => `<option value="${k}" ${k === '2' ? 'selected' : ''}>${v}</option>`).join('')}</select>
          <button class="btn primary" type="submit">${S.icon('spark')} Write story</button></form>`
          : `<a class="btn" href="#/account?ai=1">${S.icon('pencil')} Add a Claude key to generate stories</a>`}
      </section>
      ${[1, 2, 3].map((lv) => {
        const items = all().filter((s) => (s.level || 2) === lv);
        return items.length ? `<section class="section-block"><h2 class="section-title">${LEVELS[lv]} <span class="muted">${items.length}</span></h2><div class="story-grid">${items.map(card).join('')}</div></section>` : '';
      }).join('')}`;

    const form = S.$('[data-gen]', root);
    if (form) form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = S.$('button', form);
      const fd = Object.fromEntries(new FormData(form));
      btn.classList.add('loading'); btn.disabled = true;
      try {
        const s = await S.ai.story({ topic: fd.topic.trim() || 'a day in the life of a student in Japan', level: +fd.level });
        const story = { ...s, id: `ai-${Date.now().toString(36)}`, level: +fd.level, topic: fd.topic.trim(), ai: true };
        S.store.write(AI_KEY, [story, ...mine()].slice(0, 30), true);
        S.go(`stories/${story.id}`);
      } catch (err) { S.toast(err.message); }
      btn.classList.remove('loading'); btn.disabled = false;
    });
  }

  function read(root, s) {
    const romaji = S.store.settings.get('romaji') !== false;
    let showEn = false;
    window.scrollTo(0, 0);
    root.innerHTML = `
      <nav class="lesson-nav"><a class="btn ghost sm" href="#/stories">${S.icon('left')} All stories</a>
        <span class="row gap-sm">${S.ui.badge(LEVELS[s.level] || 'N5', 'soft')}${s.ai ? `<button class="btn ghost sm danger" data-del>${S.icon('trash')} Delete</button>` : ''}</span></nav>
      ${S.ui.pageHead({ title: s.title, jp: s.jp, desc: 'Tap a word for its meaning. Use ▶ to hear each line, or play the whole story.' })}
      <div class="toolbar">
        <button class="btn primary" data-all>${S.icon('play')} Play story</button>
        <label class="switch"><input type="checkbox" data-en><span></span>Show English</label>
      </div>
      <section class="card story">${s.lines.map((line, i) => `
        <div class="story-line" data-line="${i}">
          <button class="btn-icon" data-play="${i}" aria-label="Play line">${S.icon('play')}</button>
          <div class="grow">
            <p class="story-jp-line" lang="ja">${line.t.map((t, k) => (t.length > 1 ? `<button class="word" data-w="${i}-${k}">${esc(t[0])}</button>` : `<span>${esc(t[0])}</span>`)).join('')}</p>
            <p class="story-en" hidden>${esc(line.en)}</p>
          </div>
        </div>`).join('')}
        <div class="word-pop" data-pop hidden></div>
      </section>
      <section class="card" data-questions></section>`;

    const pop = S.$('[data-pop]', root);
    let playing = false;
    const playFrom = async (i, one) => {
      playing = true;
      for (let k = i; k < s.lines.length && playing; k++) {
        S.$$('.story-line', root).forEach((el) => el.classList.toggle('on', +el.dataset.line === k));
        await S.tts.say(lineText(s.lines[k]));
        if (one) break;
      }
      playing = false;
      S.$$('.story-line', root).forEach((el) => el.classList.remove('on'));
    };
    root.addEventListener('click', (e) => {
      const w = e.target.closest('[data-w]');
      if (w) {
        const [li, ti] = w.dataset.w.split('-').map(Number);
        const t = s.lines[li].t[ti];
        S.$$('.word.on', root).forEach((x) => x.classList.remove('on'));
        w.classList.add('on');
        pop.hidden = false;
        pop.innerHTML = `<b lang="ja">${esc(t[0])}</b>${romaji ? ` <span class="muted">${esc(t[1])}</span>` : ''}<div>${esc(t[2])}</div>`;
        const box = S.$('.story', root).getBoundingClientRect(), wr = w.getBoundingClientRect();
        pop.style.top = `${wr.bottom - box.top + 6}px`;
        pop.style.left = `${Math.max(8, Math.min(box.width - 228, wr.left - box.left - 20))}px`;
        S.tts.speak(t[0]);
        return;
      }
      if (!e.target.closest('[data-pop]')) { pop.hidden = true; S.$$('.word.on', root).forEach((x) => x.classList.remove('on')); }
      const p = e.target.closest('[data-play]');
      if (p) { playing = false; playFrom(+p.dataset.play, true); return; }
      if (e.target.closest('[data-all]')) { if (playing) { playing = false; S.tts.stop(); } else playFrom(0); return; }
      if (e.target.closest('[data-del]') && S.confirm('Delete this story?')) { S.store.write(AI_KEY, mine().filter((x) => x.id !== s.id), true); S.go('stories'); }
    });
    S.$('[data-en]', root).addEventListener('change', (e) => { showEn = e.target.checked; S.$$('.story-en', root).forEach((x) => { x.hidden = !showEn; }); });
    S.onLeave(() => { playing = false; });

    // Comprehension questions
    const qel = S.$('[data-questions]', root);
    const picked = {};
    const qs = s.questions || [];
    const paintQ = () => {
      const n = Object.keys(picked).length, score = qs.filter((q, i) => picked[i] === q.ans).length;
      qel.innerHTML = `<h2 class="card-title"><span class="glyph sm" lang="ja">問</span> Questions</h2>
        <ol class="cq-list">${qs.map((q, i) => `<li class="cq"><div class="cq-q">${esc(q.q)}</div>
          <div class="options inline">${q.opts.map((o, k) => `<button class="option sm ${picked[i] != null && k === q.ans ? 'correct' : ''} ${picked[i] === k && k !== q.ans ? 'wrong' : ''}" data-q="${i}" data-k="${k}" ${picked[i] != null ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div></li>`).join('')}</ol>
        ${n === qs.length && qs.length ? `<div class="cq-result ${score === qs.length ? 'pass' : ''}"><b>${score}/${qs.length}</b> ${score === qs.length ? '— perfect understanding! よくできました。' : '— tap words you missed and read it once more.'}</div>` : ''}
        <div class="row gap wrap"><button class="btn ghost sm" data-ask>${S.icon('chat')} Ask Sensei about this story</button></div>`;
    };
    qel.addEventListener('click', (e) => {
      const b = e.target.closest('[data-q]');
      if (b && picked[b.dataset.q] == null) {
        picked[b.dataset.q] = +b.dataset.k; paintQ();
        if (Object.keys(picked).length === qs.length) {
          const pct = S.pct(qs.filter((q, i) => picked[i] === q.ans).length, qs.length);
          saveResult(s.id, pct); S.store.activity.log(2);
          if (pct === 100) S.confetti();
        }
      }
      if (e.target.closest('[data-ask]')) S.askSensei(`I just read this short story:\n${storyText(s)}\n\nExplain the most useful grammar points in it for a beginner, with simple examples.`);
    });
    paintQ();
  }

  S.view('stories', {
    render(root, { params }) {
      const s = params[0] && all().find((x) => x.id === params[0]);
      if (s) read(root, s); else list(root);
    },
  });
})(window.S);
