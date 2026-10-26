// Dialogues — JLPT-style listening: hear a two-person conversation (two different voices),
// answer the questions, then check the transcript. Claude can write new ones.
(function (S) {
  const esc = S.esc;
  const AI_KEY = 'sakura_ai_dialogues';
  const LEVELS = { 1: 'Very easy', 2: 'Easy', 3: 'Full N5' };

  const mine = () => S.store.read(AI_KEY, []);
  const all = () => [...(typeof DIALOGUES !== 'undefined' ? DIALOGUES : []), ...mine()];
  const results = () => S.store.read(S.store.KEYS.stories, {});
  const saveResult = (id, best) => {
    const r = results();
    r[`dlg_${id}`] = { best: Math.max(r[`dlg_${id}`]?.best || 0, best), done: true, date: new Date().toISOString() };
    S.store.write(S.store.KEYS.stories, r);
  };

  // Play every line, each speaker with their own voice. Returns a stop function.
  S.playDialogue = (d, { onLine, rate } = {}) => {
    let stopped = false;
    (async () => {
      for (let i = 0; i < d.lines.length && !stopped; i++) {
        const l = d.lines[i];
        onLine && onLine(i);
        const sp = d.speakers[l.s] || {};
        // two speakers of the same gender still get different voices
        const sameGender = Object.values(d.speakers).filter((x) => x.voice === sp.voice).length > 1;
        const voice = S.ai.useVoice() ? S.ai.SPEAKER_VOICES[sp.voice || 'f'][sameGender && l.s === 'B' ? 1 : 0] : undefined;
        await S.tts.say(l.jp, { gender: sp.voice, voice, rate });
        if (!stopped) await new Promise((r) => setTimeout(r, 350));
      }
      onLine && onLine(-1);
    })();
    return () => { stopped = true; S.tts.stop(); onLine && onLine(-1); };
  };

  function list(root) {
    const r = results();
    root.innerHTML = `
      ${S.ui.pageHead({ kicker: 'Practice', title: 'Dialogues', jp: 'かいわ', desc: 'Listening the JLPT way: read the situation, listen to the conversation (no text!), answer, then check the transcript. Turn on ChatGPT voice in settings to hear two natural voices.' })}
      <section class="card ai-gen">
        <div class="grow"><h2 class="card-title">${S.icon('spark')} New conversation</h2>
          <p class="muted">Claude writes a fresh JLPT-style dialogue${S.ai.useVoice() ? ' and ChatGPT voices both speakers' : ''}.</p></div>
        ${S.ai.hasChat() ? `<form class="row gap wrap" data-gen>
          <input name="topic" placeholder="Situation, e.g. buying train tickets" maxlength="80">
          <select name="level">${Object.entries(LEVELS).map(([k, v]) => `<option value="${k}" ${k === '2' ? 'selected' : ''}>${v}</option>`).join('')}</select>
          <button class="btn primary" type="submit">${S.icon('spark')} Create</button></form>`
          : `<a class="btn" href="#/account?ai=1">${S.icon('pencil')} Add a Claude key to generate dialogues</a>`}
      </section>
      ${[1, 2, 3].map((lv) => {
        const items = all().filter((d) => (d.level || 2) === lv);
        return items.length ? `<section class="section-block"><h2 class="section-title">${LEVELS[lv]} <span class="muted">${items.length}</span></h2><div class="story-grid">${items.map((d) => `
          <a class="story-card ${r[`dlg_${d.id}`] ? 'done' : ''}" href="#/dialogues/${esc(d.id)}">
            <span class="story-jp">${S.icon('volume')}</span><b>${esc(d.title)}</b><small class="muted">${esc(d.scene)}</small>
            <span class="row gap-sm">${d.ai ? S.ui.badge('AI', 'primary') : ''}${r[`dlg_${d.id}`] ? `<span class="muted small">${S.icon('check')} ${r[`dlg_${d.id}`].best}%</span>` : ''}</span>
          </a>`).join('')}</div></section>` : '';
      }).join('')}`;

    const form = S.$('[data-gen]', root);
    if (form) form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = S.$('button', form);
      const fd = Object.fromEntries(new FormData(form));
      btn.classList.add('loading'); btn.disabled = true;
      try {
        const d = await S.ai.dialogue({ topic: fd.topic.trim() || 'making plans for the weekend', level: +fd.level });
        const item = { ...d, id: `ai-${Date.now().toString(36)}`, level: +fd.level, ai: true };
        S.store.write(AI_KEY, [item, ...mine()].slice(0, 30), true);
        S.go(`dialogues/${item.id}`);
      } catch (err) { S.toast(err.message); }
      btn.classList.remove('loading'); btn.disabled = false;
    });
  }

  function play(root, d) {
    let stop = null, plays = 0, showText = false;
    const picked = {};
    window.scrollTo(0, 0);
    root.innerHTML = `
      <nav class="lesson-nav"><a class="btn ghost sm" href="#/dialogues">${S.icon('left')} All dialogues</a>
        ${d.ai ? `<button class="btn ghost sm danger" data-del>${S.icon('trash')} Delete</button>` : ''}</nav>
      ${S.ui.pageHead({ title: d.title, desc: esc(d.scene) })}
      <section class="card dlg-player">
        <div class="dlg-cast">${Object.entries(d.speakers).map(([k, sp]) => `<span class="dlg-who ${sp.voice === 'm' ? 'm' : 'f'}"><b lang="ja">${esc(sp.name)}</b> ${esc(sp.role)}</span>`).join('')}</div>
        <button class="play-big" data-play aria-label="Play conversation">${S.icon('play')}</button>
        <div class="muted small" data-status>Read the questions below first, then press play. Listen as many times as you like.</div>
        ${S.ui.chips('speed', [['0.7', 'Slow'], ['0.85', 'Natural'], ['1', 'Normal']].map(([value, label]) => ({ value, label })), '0.85')}
      </section>
      <section class="card" data-questions></section>
      <section class="card">
        <div class="row"><h2 class="card-title grow">Transcript</h2><button class="btn ghost sm" data-text>${S.icon('eye')} Show</button></div>
        <div class="dlg-lines" data-lines hidden>${d.lines.map((l, i) => {
          const sp = d.speakers[l.s] || {};
          return `<div class="dlg-line ${l.s === 'A' ? 'a' : 'b'}" data-l="${i}">
            <span class="dlg-name" lang="ja">${esc(sp.name || l.s)}</span>
            <div class="bubble"><div lang="ja">${esc(l.jp)} ${S.ui.speak(l.jp, { slow: false })}</div><div class="muted small">${esc(l.rom)}</div><div class="small">${esc(l.en)}</div></div></div>`;
        }).join('')}</div>
      </section>`;

    let rate = 0.85;
    const status = S.$('[data-status]', root), pbtn = S.$('[data-play]', root);
    const onLine = (i) => {
      S.$$('.dlg-line', root).forEach((el) => el.classList.toggle('on', +el.dataset.l === i));
      if (i < 0) { pbtn.innerHTML = S.icon('play'); pbtn.classList.remove('on'); stop = null; status.textContent = `Played ${plays} time${plays > 1 ? 's' : ''}. Answer the questions, then check the transcript.`; }
      else status.textContent = `Line ${i + 1} of ${d.lines.length}…`;
    };
    pbtn.addEventListener('click', () => {
      if (stop) { stop(); return; }
      plays++; pbtn.innerHTML = S.icon('stop'); pbtn.classList.add('on');
      stop = S.playDialogue(d, { onLine, rate });
    });
    S.onLeave(() => stop && stop());

    root.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-chip]');
      if (chip) { rate = parseFloat(chip.dataset.chip); S.ui.setChip(root, 'speed', chip.dataset.chip); return; }
      if (e.target.closest('[data-text]')) { showText = !showText; S.$('[data-lines]', root).hidden = !showText; e.target.closest('[data-text]').innerHTML = `${S.icon('eye')} ${showText ? 'Hide' : 'Show'}`; return; }
      if (e.target.closest('[data-del]') && S.confirm('Delete this dialogue?')) { S.store.write(AI_KEY, mine().filter((x) => x.id !== d.id), true); S.go('dialogues'); }
    });

    const qel = S.$('[data-questions]', root);
    const qs = d.questions || [];
    const paintQ = () => {
      const n = Object.keys(picked).length, score = qs.filter((q, i) => picked[i] === q.ans).length;
      qel.innerHTML = `<h2 class="card-title"><span class="glyph sm" lang="ja">問</span> Questions</h2>
        <ol class="cq-list">${qs.map((q, i) => `<li class="cq"><div class="cq-q">${esc(q.q)}</div>
          <div class="options inline">${q.opts.map((o, k) => `<button class="option sm ${picked[i] != null && k === q.ans ? 'correct' : ''} ${picked[i] === k && k !== q.ans ? 'wrong' : ''}" data-q="${i}" data-k="${k}" ${picked[i] != null ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div></li>`).join('')}</ol>
        ${n === qs.length && qs.length ? `<div class="cq-result ${score === qs.length ? 'pass' : ''}"><b>${score}/${qs.length}</b> ${score === qs.length ? '— you caught everything! すごい！' : '— open the transcript and listen again while reading.'}</div>` : ''}`;
    };
    qel.addEventListener('click', (e) => {
      const b = e.target.closest('[data-q]');
      if (!b || picked[b.dataset.q] != null) return;
      picked[b.dataset.q] = +b.dataset.k; paintQ();
      if (Object.keys(picked).length === qs.length) {
        const pct = S.pct(qs.filter((q, i) => picked[i] === q.ans).length, qs.length);
        saveResult(d.id, pct); S.store.activity.log(2);
        if (pct === 100) S.confetti();
        showText = true; S.$('[data-lines]', root).hidden = false; S.$('[data-text]', root).innerHTML = `${S.icon('eye')} Hide`;
      }
    });
    paintQ();
  }

  S.view('dialogues', {
    render(root, { params }) {
      const d = params[0] && all().find((x) => x.id === params[0]);
      if (d) play(root, d); else list(root);
    },
  });
})(window.S);
