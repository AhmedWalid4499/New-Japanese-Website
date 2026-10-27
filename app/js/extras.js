// Extra practice in the app: conjugation drills, stories, dialogues, speaking, Sensei (Claude) chat,
// and the AI & voice settings. AI keys are shared with the website (same browser storage).
(function (A) {
  const esc = A.esc;
  const AI = window.SakuraAI;
  const C = window.Conj;
  const hasChat = () => !!(AI && AI.hasChat());
  A.state.read = A.state.read || {}; // stories & dialogues finished: {id: best%}

  // ── Conjugation drill (as an exercise session) ──
  const VFORMS = ['masu', 'masen', 'mashita', 'te', 'nai', 'ta', 'tai'];
  const AFORMS = ['neg', 'past', 'pastneg', 'te'];
  function conjExercise() {
    const adj = Math.random() < 0.3;
    const w = A.pick(adj ? C.ADJS : C.VERBS);
    const f = A.pick(adj ? AFORMS : VFORMS);
    const fd = (adj ? C.ADJ_FORMS : C.VERB_FORMS)[f];
    const answer = C.conjugate(w, f);
    const wrong = new Set();
    (adj ? [{ ...w, group: w.group === 'i' ? 'na' : 'i' }] : ['u', 'ru'].filter((g) => g !== w.group).map((g) => ({ ...w, group: g }))).forEach((x) => { try { wrong.add(C.conjugate(x, f)); } catch (e) {} });
    Object.keys(adj ? C.ADJ_FORMS : C.VERB_FORMS).filter((k) => k !== f).forEach((k) => wrong.add(C.conjugate(w, k)));
    wrong.delete(answer);
    const options = A.shuffle([answer, ...A.sample([...wrong], 3)]);
    return { type: 'choice', title: `${fd.label} (${fd.jp})`, prompt: w.dict, promptJp: true, say: w.dict, options, answer: options.indexOf(answer), optJp: true, explain: `${w.en} · ${C.rule(w, f)}` };
  }
  A.conjugationDrill = () => A.play({ exercises: Array.from({ length: 12 }, conjExercise), hearts: false, xp: 10, doneTitle: 'Conjugation drill complete!', onDone: () => A.go('practice') });

  // ── Inline multiple-choice questions (stories & dialogues) ──
  function questions(el, qs, onDone) {
    const picked = {};
    const paint = () => {
      el.innerHTML = qs.map((q, i) => `<div class="mq"><b>${i + 1}. ${esc(q.q)}</b><div class="mq-opts">${q.opts.map((o, k) => `<button class="mq-opt ${picked[i] != null && k === q.ans ? 'good' : ''} ${picked[i] === k && k !== q.ans ? 'bad' : ''}" data-q="${i}" data-k="${k}" ${picked[i] != null ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div></div>`).join('');
    };
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-q]');
      if (!b || picked[b.dataset.q] != null) return;
      const i = +b.dataset.q; picked[i] = +b.dataset.k;
      A.sfx(picked[i] === qs[i].ans ? 'correct' : 'wrong');
      paint();
      if (Object.keys(picked).length === qs.length) onDone(Math.round((qs.filter((q, k) => picked[k] === q.ans).length / qs.length) * 100));
    });
    paint();
  }
  const finishRead = (id, pct) => {
    A.state.read[id] = Math.max(A.state.read[id] || 0, pct);
    A.quest('read', 1);
    A.addXp(pct === 100 ? 15 : 10); A.save();
    if (pct === 100) { A.confetti(); A.sfx('complete'); }
    A.toast(pct === 100 ? 'Perfect! +15 XP' : `${pct}% · +10 XP`);
  };

  // ── Stories ──
  const allStories = () => [...(typeof STORIES !== 'undefined' ? STORIES : []), ...((() => { try { return JSON.parse(localStorage.getItem('sakura_ai_stories')) || []; } catch (e) { return []; } })())];
  const LV = { 1: 'Very easy', 2: 'Easy', 3: 'Full N5' };
  function storyList() {
    const s = A.sheet(`<div class="sheet-body"><h2>Stories</h2><p class="muted">Tap any word for its meaning. Read, listen, then answer.</p>
      ${hasChat() ? `<button class="btn block" data-gen>${A.icon('spark')} Write me a new story (Claude)</button>` : ''}
      <div class="mini-list">${allStories().map((x) => `<button class="mini-row" data-id="${esc(x.id)}"><span class="lv lv${x.level || 2}" lang="ja">${'初中上'[(x.level || 2) - 1]}</span><span><b>${esc(x.title)}</b><small lang="ja">${esc(x.jp)}</small><small>${LV[x.level] || 'N5'}${A.state.read[x.id] != null ? ` · ${A.state.read[x.id]}%` : ''}</small></span><span class="chev">›</span></button>`).join('')}</div>
      <button class="btn primary block" data-close>Close</button></div>`);
    s.el.addEventListener('click', async (e) => {
      const r = e.target.closest('[data-id]');
      if (r) { s.close(); story(allStories().find((x) => x.id === r.dataset.id)); }
      const g = e.target.closest('[data-gen]');
      if (g) {
        const topic = prompt('What should the story be about?', 'a day at the beach');
        if (topic == null) return;
        g.disabled = true; g.textContent = 'Claude is writing…';
        try {
          const st = await AI.story({ topic, level: 2 });
          const item = { ...st, id: `ai-${Date.now().toString(36)}`, level: 2, ai: true };
          let list = []; try { list = JSON.parse(localStorage.getItem('sakura_ai_stories')) || []; } catch (er) {}
          localStorage.setItem('sakura_ai_stories', JSON.stringify([item, ...list].slice(0, 30)));
          s.close(); story(item);
        } catch (er) { A.toast(er.message); g.disabled = false; g.innerHTML = `${A.icon('spark')} Write me a new story (Claude)`; }
      }
    });
  }
  function story(st) {
    const romaji = A.state.profile.romaji;
    let playing = false;
    const text = (l) => l.t.map((t) => t[0]).join('');
    const p = A.panel(`<div class="story-head"><div class="story-jp" lang="ja">${esc(st.jp)}</div><h1>${esc(st.title)}</h1>
        <button class="btn" data-all>${A.icon('play')} Play story</button></div>
      <div class="story">${st.lines.map((l, i) => `<div class="s-line" data-line="${i}"><button class="speaker sm" data-line-say="${i}">${A.icon('volume')}</button>
        <div><p class="s-jp" lang="ja">${l.t.map((t, k) => (t.length > 1 ? `<button class="s-word" data-w="${i}-${k}">${esc(t[0])}</button>` : `<span>${esc(t[0])}</span>`)).join('')}</p>
        <p class="s-en" hidden>${esc(l.en)}</p></div></div>`).join('')}</div>
      <button class="btn ghost block" data-en>Show English</button>
      <div class="word-card" data-pop hidden></div>
      <h3 class="section-label">Questions</h3><div data-qs></div>`, { title: 'Story', onClose: () => { playing = false; } });
    const pop = A.$('[data-pop]', p.el);
    p.body.addEventListener('click', async (e) => {
      const w = e.target.closest('[data-w]');
      if (w) {
        const [i, k] = w.dataset.w.split('-').map(Number); const t = st.lines[i].t[k];
        A.$$('.s-word.on', p.el).forEach((x) => x.classList.remove('on')); w.classList.add('on');
        pop.hidden = false; pop.innerHTML = `<b lang="ja">${esc(t[0])}</b>${romaji ? ` <span class="muted">${esc(t[1])}</span>` : ''}<div>${esc(t[2])}</div>`;
        A.speak(t[0]); return;
      }
      const ls = e.target.closest('[data-line-say]');
      if (ls) { playing = false; A.speak(text(st.lines[+ls.dataset.lineSay])); return; }
      if (e.target.closest('[data-en]')) { A.$$('.s-en', p.el).forEach((x) => { x.hidden = !x.hidden; }); return; }
      if (e.target.closest('[data-all]')) {
        if (playing) { playing = false; A.speakStop(); return; }
        playing = true;
        for (let i = 0; i < st.lines.length && playing; i++) {
          A.$$('.s-line', p.el).forEach((x) => x.classList.toggle('on', +x.dataset.line === i));
          await A.say(text(st.lines[i]));
        }
        playing = false; A.$$('.s-line', p.el).forEach((x) => x.classList.remove('on'));
      }
    });
    questions(A.$('[data-qs]', p.el), st.questions || [], (pct) => finishRead(st.id, pct));
  }

  // ── Dialogues ──
  function dialogueList() {
    const s = A.sheet(`<div class="sheet-body"><h2>Dialogues</h2><p class="muted">JLPT-style listening: hear the conversation, answer, then read the transcript.</p>
      <div class="mini-list">${DIALOGUES.map((d) => `<button class="mini-row" data-id="${esc(d.id)}"><span>${A.icon('volume')}</span><span><b>${esc(d.title)}</b><small>${esc(d.scene)}${A.state.read[`dlg_${d.id}`] != null ? ` · ${A.state.read[`dlg_${d.id}`]}%` : ''}</small></span><span class="chev">›</span></button>`).join('')}</div>
      <button class="btn primary block" data-close>Close</button></div>`);
    s.el.addEventListener('click', (e) => { const r = e.target.closest('[data-id]'); if (r) { s.close(); dialogue(DIALOGUES.find((d) => d.id === r.dataset.id)); } });
  }
  function dialogue(d) {
    let playing = false;
    const p = A.panel(`<div class="center"><p class="muted">${esc(d.scene)}</p>
        <div class="cast">${Object.values(d.speakers).map((s) => `<span class="${s.voice}" lang="ja">${esc(s.name)} <small>${esc(s.role)}</small></span>`).join('')}</div>
        <button class="speaker big" data-play aria-label="Play">${A.icon('play')}</button><p class="muted small" data-st>Read the questions, then tap play.</p></div>
      <div data-qs></div>
      <button class="btn ghost block" data-tr>Show transcript</button>
      <div class="transcript" data-lines hidden>${d.lines.map((l, i) => `<div class="t-line ${l.s === 'A' ? 'a' : 'b'}" data-l="${i}"><small lang="ja">${esc(d.speakers[l.s]?.name || l.s)}</small><div lang="ja">${esc(l.jp)}</div><em>${esc(l.en)}</em></div>`).join('')}</div>`,
      { title: d.title, onClose: () => { playing = false; } });
    p.body.addEventListener('click', async (e) => {
      if (e.target.closest('[data-tr]')) { A.$('[data-lines]', p.el).hidden = !A.$('[data-lines]', p.el).hidden; return; }
      const pb = e.target.closest('[data-play]');
      if (!pb) return;
      if (playing) { playing = false; A.speakStop(); return; }
      playing = true; pb.innerHTML = A.icon('stop');
      for (let i = 0; i < d.lines.length && playing; i++) {
        const l = d.lines[i], sp = d.speakers[l.s] || {};
        const same = Object.values(d.speakers).filter((x) => x.voice === sp.voice).length > 1;
        A.$$('.t-line', p.el).forEach((x) => x.classList.toggle('on', +x.dataset.l === i));
        A.$('[data-st]', p.el).textContent = `Line ${i + 1} of ${d.lines.length}`;
        await A.say(l.jp, { gender: sp.voice, voice: AI && AI.useVoice() ? AI.SPEAKER_VOICES[sp.voice || 'f'][same && l.s === 'B' ? 1 : 0] : undefined });
        await new Promise((r) => setTimeout(r, 300));
      }
      playing = false; pb.innerHTML = A.icon('play'); A.$('[data-st]', p.el).textContent = 'Tap play to listen again.';
      A.$$('.t-line', p.el).forEach((x) => x.classList.remove('on'));
    });
    questions(A.$('[data-qs]', p.el), d.questions, (pct) => { finishRead(`dlg_${d.id}`, pct); A.$('[data-lines]', p.el).hidden = false; });
  }

  // ── Microphone button (tap to start / tap to stop) ──
  function mic(btn, onText) {
    let session = null;
    const set = (st) => { btn.dataset.state = st; btn.classList.toggle('rec', st === 'rec'); btn.disabled = st === 'busy'; btn.innerHTML = st === 'rec' ? `${A.icon('stop')} Stop` : st === 'busy' ? 'Listening…' : `${A.icon('mic')} Speak`; };
    set('idle');
    btn.addEventListener('click', async () => {
      if (btn.dataset.state === 'rec') {
        set('busy');
        try { const t = await session.stop(); set('idle'); onText(t); } catch (e) { set('idle'); A.toast(e.message); }
        session = null; return;
      }
      A.speakStop();
      try { session = await AI.listen(); set('rec'); } catch (e) { A.toast(e.message); }
    });
    return () => { if (session) session.cancel(); };
  }

  // ── Speaking: repeat after me ──
  const kanaSim = (a, b) => {
    a = C.normalize(a); b = C.normalize(b);
    if (!a || !b) return 0;
    const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    return Math.round((2 * dp[a.length][b.length] / (a.length + b.length)) * 100);
  };
  function speaking() {
    if (!AI || !AI.canListen()) { A.toast('Speech recognition isn’t available here — add a ChatGPT key in Settings › AI & voice'); return; }
    const pool = [...SURVIVAL_PHRASES.map((x) => ({ jp: x.jp, rom: x.rom, en: x.en })), ...GRAMMAR_COURSE.flatMap((m) => m.examples)].filter((x) => x.jp && !/[_＿〜～]/.test(x.jp) && x.jp.length <= 22);
    const items = A.sample(pool, 8);
    let i = 0, total = 0, cancel = null;
    const p = A.panel('', { title: 'Repeat after me', onClose: () => cancel && cancel() });
    const show = () => {
      const it = items[i];
      p.body.innerHTML = `<div class="speak center"><div class="muted small">${i + 1} / ${items.length}</div>
        <div class="speak-jp" lang="ja">${esc(it.jp)}</div>${A.state.profile.romaji && it.rom ? `<div class="muted">${esc(it.rom)}</div>` : ''}<div>${esc(it.en)}</div>
        <div class="row center speak-btns"><button class="speaker" data-say="${esc(it.jp)}">${A.icon('volume')}</button><button class="speaker slow sm-slow" data-say="${esc(it.jp)}" data-slow><span class="slow-txt">0.5×</span></button></div>
        <button class="btn primary block lg mic-btn" data-mic></button><div data-res></div></div>`;
      A.speak(it.jp);
      cancel = mic(A.$('[data-mic]', p.el), async (heard) => {
        const res = A.$('[data-res]', p.el);
        if (!heard) { res.innerHTML = '<p class="muted">I didn’t catch that — try again a little louder.</p>'; return; }
        res.innerHTML = `<div class="heard"><small>I heard</small><div lang="ja">${esc(heard)}</div></div><p class="muted small">Checking…</p>`;
        let score = kanaSim(it.jp, heard), fb = '';
        if (hasChat()) { try { const r = await AI.judgeSpeech({ target: it.jp, heard }); score = r.score; fb = r.feedback; } catch (e) { fb = ''; } }
        total += score;
        A.quest('speak', 1);
        A.sfx(score >= 80 ? 'correct' : 'wrong');
        res.innerHTML = `<div class="heard"><small>I heard</small><div lang="ja">${esc(heard)}</div></div>
          <div class="speak-score ${score >= 80 ? 'good' : score >= 60 ? 'ok' : 'bad'}"><b>${score}%</b> ${score >= 80 ? 'じょうず！ Great!' : score >= 60 ? 'Close!' : 'Try again'}</div>${fb ? `<p class="small">${esc(fb)}</p>` : ''}
          <button class="btn block" data-next>${i + 1 < items.length ? 'Next' : 'Finish'}</button>`;
        A.$('[data-next]', res).addEventListener('click', () => { i++; if (i < items.length) show(); else { A.addXp(10); A.save(); p.close(); A.toast(`Average ${Math.round(total / items.length)}% · +10 XP`); } });
      });
    };
    show();
  }

  // ── Chat with Claude: Sensei (free questions) or a spoken role-play ──
  const SCENES = [
    ['café', 'You are a staff member at a Tokyo café. The learner is a customer ordering.'],
    ['self-introduction', 'You are Yuki, a friendly student meeting the learner at a language exchange. Ask about their name, country, job and hobbies.'],
    ['directions', 'You are a kind passer-by. The learner is lost and asks for directions to the station.'],
    ['weekend plans', 'You are Ken, the learner’s friend. Talk about last weekend and make plans for next weekend.'],
  ];
  A.openSensei = (question, scene) => {
    if (!hasChat()) { aiSettings(); A.toast('Add your Claude key first'); return; }
    const role = scene ? SCENES.find((s) => s[0] === scene) : null;
    const msgs = []; // shown
    const hist = []; // sent to Claude
    let busy = false, cancel = null;
    const p = A.panel(`<div class="chat-log" data-log></div><div class="chat-hint" data-hint></div>
      <div class="chat-bar">${AI.canListen() ? '<button class="btn mic-btn" data-mic></button>' : ''}<form data-f><input data-in lang="ja" placeholder="${role ? 'Reply in Japanese…' : 'Ask Sensei anything…'}"><button class="btn primary" type="submit" aria-label="Send">${A.icon('send')}</button></form></div>`,
      { title: role ? `Talk: ${role[0]}` : 'Sensei', onClose: () => cancel && cancel() });
    p.el.classList.add('chat-panel');
    const log = A.$('[data-log]', p.el), hint = A.$('[data-hint]', p.el);
    const paint = () => {
      log.innerHTML = msgs.map((m) => `<div class="msg ${m.me ? 'me' : ''}">${m.me ? '' : A.mascot('mini')}<div class="msg-b">${m.html}${m.say ? `<button class="speaker sm" data-say="${esc(m.say)}">${A.icon('volume')}</button>` : ''}${m.fix ? `<div class="fix">✎ ${esc(m.fix)}</div>` : ''}</div></div>`).join('') + (busy ? `<div class="msg">${A.mascot('mini')}<div class="msg-b typing"><i></i><i></i><i></i></div></div>` : '');
      log.scrollTop = log.scrollHeight;
    };
    const send = async (text) => {
      if (busy) return;
      if (text) { msgs.push({ me: true, html: `<p lang="ja">${esc(text)}</p>` }); hist.push({ role: 'user', content: text }); }
      busy = true; paint();
      try {
        if (role) {
          const r = await AI.roleplayTurn({ scenario: role[1], history: hist.length ? hist : [] });
          if (text && r.correction) msgs[msgs.length - 1].fix = r.correction;
          if (!hist.length) hist.push({ role: 'user', content: '(start the conversation)' });
          hist.push({ role: 'assistant', content: r.reply_jp });
          msgs.push({ html: `<p lang="ja">${esc(r.reply_jp)}</p>${A.state.profile.romaji ? `<small>${esc(r.reply_romaji)}</small>` : ''}<em>${esc(r.reply_en)}</em>`, say: r.reply_jp });
          hint.innerHTML = r.suggestion_jp ? `<span class="muted small">Try:</span> <button class="chip" data-say="${esc(r.suggestion_jp)}" lang="ja">${esc(r.suggestion_jp)}</button>` : '';
          busy = false; paint(); A.say(r.reply_jp);
        } else {
          const reply = await AI.chat(hist.slice(-20), { system: 'You are Sensei, a warm Japanese tutor inside the Sakura Study iPhone app. The learner is a JLPT N5 beginner. Keep replies short (under 120 words), add romaji and English for Japanese, use **bold** for key words and "-" bullet lists. Ask one quiz question at a time.' });
          hist.push({ role: 'assistant', content: reply });
          const jp = AI.japaneseOnly(reply);
          msgs.push({ html: AI.render(reply), say: jp });
          busy = false; paint();
        }
        A.addXp(1); A.save();
      } catch (e) {
        busy = false;
        if (text) { msgs.pop(); hist.pop(); }
        paint(); A.toast(e.message);
      }
    };
    A.$('[data-f]', p.el).addEventListener('submit', (e) => { e.preventDefault(); const inp = A.$('[data-in]', p.el); const v = inp.value.trim(); if (v) { inp.value = ''; send(v); } });
    const mb = A.$('[data-mic]', p.el);
    if (mb) cancel = mic(mb, (t) => (t ? send(t) : A.toast('I didn’t catch that')));
    if (role) send(null);
    else if (question) send(question);
    else { msgs.push({ html: '<p>こんにちは！ I’m <b>Sensei</b>. Ask me about grammar, words, or say “quiz me”.</p>' }); paint(); }
  };

  function talkMenu() {
    const s = A.sheet(`<div class="sheet-body"><h2>Talk with Claude</h2><p class="muted">Speak (or type) and Claude answers out loud, correcting you gently.</p>
      <div class="mini-list">${SCENES.map(([n]) => `<button class="mini-row" data-scene="${esc(n)}"><span>${A.icon('chat')}</span><span><b>${esc(n[0].toUpperCase() + n.slice(1))}</b></span><span class="chev">›</span></button>`).join('')}
        <button class="mini-row" data-sensei><span lang="ja">先</span><span><b>Ask Sensei</b><small>Free questions about anything</small></span><span class="chev">›</span></button></div>
      <button class="btn primary block" data-close>Close</button></div>`);
    s.el.addEventListener('click', (e) => {
      const sc = e.target.closest('[data-scene]');
      if (sc) { s.close(); A.openSensei(null, sc.dataset.scene); }
      if (e.target.closest('[data-sensei]')) { s.close(); A.openSensei(); }
    });
  }

  // ── AI & voice settings (same keys as the website) ──
  function aiSettings() {
    const c = AI.config();
    const s = A.sheet(`<div class="sheet-body settings"><h2>AI & voice</h2>
      <p class="muted small">Use your own keys: <b>Claude</b> for Sensei, conversations and feedback; <b>ChatGPT</b> for natural voices and to hear you speak. Keys stay on this device — the website uses the same ones.</p>
      <label class="field"><span>Claude API key</span><input data-k="anthropicKey" type="password" autocomplete="off" placeholder="sk-ant-…" value="${esc(c.anthropicKey)}"></label>
      <label class="field"><span>ChatGPT (OpenAI) API key</span><input data-k="openaiKey" type="password" autocomplete="off" placeholder="sk-…" value="${esc(c.openaiKey)}"></label>
      <label class="toggle"><span>Use ChatGPT voice</span><input type="checkbox" data-voice ${c.voiceEngine === 'openai' ? 'checked' : ''}><i></i></label>
      <button class="btn block" data-test>${A.icon('volume')} Test voice</button>
      <button class="btn primary block" data-close>Save</button></div>`, { onClose: () => A.go(A.tab) });
    const save = () => AI.save({ anthropicKey: A.$('[data-k="anthropicKey"]', s.el).value.trim(), openaiKey: A.$('[data-k="openaiKey"]', s.el).value.trim(), voiceEngine: A.$('[data-voice]', s.el).checked ? 'openai' : 'browser' });
    s.el.addEventListener('input', save);
    s.el.addEventListener('change', save);
    s.el.addEventListener('click', (e) => { if (e.target.closest('[data-test]')) { save(); A.speak('こんにちは。いっしょに にほんごを べんきょうしましょう。'); } });
  }
  A.aiSettings = aiSettings;

  A.extraCards = () => [
    ['games', 'Mini-games', 'Kana Rain, Memory, Time Attack', '遊', '#e2843a', '#b8642a'],
    ['write', 'Write by hand', 'Trace kana & kanji with your finger', '書', '#2a2522', '#000000'],
    ['conj', 'Conjugation drill', 'Verb & adjective forms', '活', '#5f8a37', '#466a26'],
    ['stories', 'Stories', 'Tap-to-translate reading', '物', '#b2547a', '#8e3f60'],
    ['dialogues', 'Dialogues', 'JLPT-style listening, two voices', '会', '#3b5a8c', '#2c446b'],
    ['speak', 'Repeat after me', 'Say it out loud, get a score', '声', '#c4473a', '#9c372c'],
    ['talk', 'Talk with Claude', hasChat() ? 'Spoken role-play & Sensei' : 'Add a Claude key in settings', '話', '#6b5bd2', '#5143a8'],
  ];
  A.openExtra = (id) => ({ games: () => A.openGames(), write: () => A.openWriting(), conj: A.conjugationDrill, stories: storyList, dialogues: dialogueList, speak: speaking, talk: () => (hasChat() ? talkMenu() : aiSettings()) }[id] || (() => {}))();
})(window.A);
