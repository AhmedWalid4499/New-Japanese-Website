// Speaking — "repeat after me" pronunciation practice and spoken role-play conversations.
// Hearing: ChatGPT speech-to-text (OpenAI key) or the browser's speech recognition.
// Judging & conversation: Claude. Voice: ChatGPT or the browser voice.
(function (S) {
  const esc = S.esc;

  const SCENARIOS = [
    { id: 'intro', glyph: '名', title: 'Introduce yourself', desc: 'Meet a new classmate: name, country, job, hobbies.', prompt: 'You are Yuki, a friendly Japanese university student meeting the learner for the first time at a language exchange. Ask about their name, country, job and hobbies.' },
    { id: 'cafe', glyph: '珈', title: 'At a café', desc: 'Order food and drinks and pay.', prompt: 'You are a staff member at a café in Tokyo. The learner is a customer. Take their order, ask about size/hot or cold, tell them the price and finish the sale.' },
    { id: 'directions', glyph: '道', title: 'Asking the way', desc: 'Find the station, a bank or a convenience store.', prompt: 'You are a kind passer-by in a Japanese town. The learner is lost and will ask for directions; give simple directions using みぎ, ひだり, まっすぐ and landmarks.' },
    { id: 'shop', glyph: '買', title: 'Shopping', desc: 'Ask for items, sizes, colours and prices.', prompt: 'You are a shop assistant in a clothes shop. Help the learner find clothes, talk about colour, size and price.' },
    { id: 'weekend', glyph: '週', title: 'Weekend plans', desc: 'Talk about what you did and will do.', prompt: 'You are Ken, the learner’s Japanese friend. Chat about what you each did last weekend and make plans together for next weekend.' },
    { id: 'free', glyph: '話', title: 'Free conversation', desc: 'Chat about anything with a friendly partner.', prompt: 'You are Sakura, a friendly Japanese conversation partner. Chat about everyday topics the learner brings up; if they run out of ideas, ask simple questions about their day, food, family or hobbies.' },
  ];

  // Sentences for "repeat after me": grammar-course examples + survival phrases
  const SENTENCE_SETS = () => [
    { id: 'phrases', label: 'Survival phrases', items: SURVIVAL_PHRASES.map((p) => ({ jp: p.jp, rom: p.rom || p.romaji || '', en: p.en })) },
    { id: 'course', label: 'Grammar lessons', items: (typeof GRAMMAR_COURSE !== 'undefined' ? GRAMMAR_COURSE : []).flatMap((m) => m.examples.map((x) => ({ ...x, from: m.short }))) },
    { id: 'listen', label: 'Everyday sentences', items: LISTEN_CATEGORIES.flatMap((c) => c.items) },
  ].map((s) => ({ ...s, items: s.items.filter((x) => x.jp && !/[_＿〜～]/.test(x.jp)) })).filter((s) => s.items.length);

  // Kana-level similarity (0–100) for when Claude isn't available
  const toHira = (s) => window.Conj.normalize(s);
  function similarity(a, b) {
    a = toHira(a); b = toHira(b);
    if (!a || !b) return 0;
    const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    return Math.round((2 * dp[a.length][b.length] / (a.length + b.length)) * 100);
  }

  // A tap-to-start / tap-to-stop microphone button. onText(transcript) after stopping.
  function micButton(el, { onText, onState }) {
    let session = null;
    const set = (state) => {
      el.dataset.state = state;
      el.classList.toggle('on', state === 'rec');
      el.innerHTML = state === 'rec' ? `${S.icon('stop')}<span>Stop</span>` : state === 'busy' ? `<span class="spin"></span><span>Listening…</span>` : `${S.icon('mic')}<span>Speak</span>`;
      el.disabled = state === 'busy';
      onState && onState(state);
    };
    set('idle');
    el.addEventListener('click', async () => {
      if (el.dataset.state === 'rec') {
        set('busy');
        try { const t = await session.stop(); set('idle'); onText(t); }
        catch (e) { set('idle'); S.toast(e.message); }
        session = null;
        return;
      }
      S.tts.stop();
      try { session = await S.ai.listen(); set('rec'); }
      catch (e) { S.toast(e.message); }
    });
    return { cancel: () => { if (session) session.cancel(); session = null; set('idle'); } };
  }

  function home(root) {
    const can = S.ai.canListen();
    root.innerHTML = `
      ${S.ui.pageHead({ kicker: 'Practice', title: 'Speaking', jp: 'はなす', desc: 'Say Japanese out loud and get instant feedback. Claude judges what you said and plays your conversation partner; ChatGPT gives the most accurate listening and the most natural voice.' })}
      ${can ? '' : '<div class="callout warn">This browser can’t use the microphone for speech recognition. Add a ChatGPT (OpenAI) key in <a href="#/account?ai=1">settings</a>, or use Safari or Chrome. You can still type your answers in conversations.</div>'}
      <div class="ai-status">${[
        [S.ai.hasChat(), 'Claude', 'feedback & conversation partner'],
        [S.ai.hasOpenAI(), 'ChatGPT', 'listening (speech-to-text)'],
        [S.ai.useVoice(), 'ChatGPT voice', 'natural Japanese voice'],
      ].map(([on, name, what]) => `<span class="ai-pill ${on ? 'on' : ''}">${on ? S.icon('check') : S.icon('x')} <b>${name}</b> ${what}</span>`).join('')}
        ${!S.ai.hasChat() || !S.ai.hasOpenAI() ? '<a class="btn ghost sm" href="#/account?ai=1">Add keys</a>' : ''}</div>
      <section class="section-block"><h2 class="section-title">Repeat after me <span class="muted">pronunciation</span></h2>
        <div class="tile-grid">${SENTENCE_SETS().map((s) => `<a class="tile" href="#/speaking/repeat/${s.id}"><span class="glyph" lang="ja">${s.id === 'phrases' ? '話' : s.id === 'course' ? '文' : '聴'}</span><span><b>${esc(s.label)}</b><small>${s.items.length} sentences · listen, then say it</small></span></a>`).join('')}</div>
      </section>
      <section class="section-block"><h2 class="section-title">Conversations <span class="muted">role-play with Claude</span></h2>
        ${S.ai.hasChat() ? '' : S.aiKeyNeeded('Spoken role-play')}
        <div class="tile-grid">${SCENARIOS.map((s) => `<a class="tile ${S.ai.hasChat() ? '' : 'disabled'}" href="#/speaking/talk/${s.id}"><span class="glyph" lang="ja">${s.glyph}</span><span><b>${esc(s.title)}</b><small>${esc(s.desc)}</small></span></a>`).join('')}</div>
      </section>`;
  }

  function repeat(root, set) {
    const items = S.shuffle(set.items).slice(0, 10);
    let i = 0;
    const scores = [];
    let mic = null;
    const show = () => {
      const it = items[i];
      window.scrollTo(0, 0);
      root.innerHTML = `
        <nav class="lesson-nav"><a class="btn ghost sm" href="#/speaking">${S.icon('left')} Speaking</a><span class="muted small">${i + 1} / ${items.length}</span></nav>
        ${S.ui.bar(S.pct(i, items.length))}
        <section class="card speak-card">
          <div class="kicker">${esc(set.label)}${it.from ? ` · ${esc(it.from)}` : ''}</div>
          <div class="speak-target" lang="ja">${esc(it.jp)}</div>
          ${it.rom ? `<div class="muted">${esc(it.rom)}</div>` : ''}
          <div>${esc(it.en)}</div>
          <div class="row gap center wrap speak-controls">
            <button class="btn lg" data-listen>${S.icon('volume')} Listen</button>
            <button class="btn lg" data-slow>½× Slow</button>
            <button class="btn primary lg mic" data-mic></button>
          </div>
          <div data-result></div>
        </section>
        <p class="muted small center">Tip: listen first, then say it with the same rhythm. Speak in a normal voice, about 30 cm from the mic.</p>`;
      S.$('[data-listen]', root).addEventListener('click', () => S.tts.speak(it.jp));
      S.$('[data-slow]', root).addEventListener('click', () => S.tts.speak(it.jp, { rate: 0.55 }));
      mic = micButton(S.$('[data-mic]', root), { onText: (t) => judge(it, t) });
      setTimeout(() => S.tts.speak(it.jp), 250);
    };
    const judge = async (it, heard) => {
      const out = S.$('[data-result]', root);
      if (!heard) { out.innerHTML = '<div class="feedback bad">I didn’t catch anything — tap Speak and try again a little louder.</div>'; return; }
      out.innerHTML = `<div class="speak-heard"><span class="muted small">I heard</span><div lang="ja">${esc(heard)}</div></div><div class="muted small">${S.ai.hasChat() ? 'Claude is checking…' : ''}</div>`;
      let score = similarity(it.jp, heard), feedback = '';
      if (S.ai.hasChat()) {
        try { const r = await S.ai.judgeSpeech({ target: it.jp, heard }); score = r.score; feedback = r.feedback; }
        catch (e) { feedback = `(Claude unavailable: ${e.message})`; }
      } else if (/[一-龯]/.test(heard)) feedback = 'The transcript contains kanji, so this score is approximate. Add a Claude key for accurate feedback.';
      scores[i] = score;
      const tone = score >= 85 ? 'good' : score >= 60 ? 'warn' : 'bad';
      out.innerHTML = `<div class="speak-heard"><span class="muted small">I heard</span><div lang="ja">${esc(heard)}</div></div>
        <div class="speak-score">${S.ui.ring(score, { size: 72, stroke: 7, tone })}<div><b>${score >= 85 ? 'Excellent! じょうず！' : score >= 60 ? 'Close — try once more?' : 'Let’s try that again.'}</b>${feedback ? `<p class="muted small">${esc(feedback)}</p>` : ''}</div></div>
        <div class="row gap center"><button class="btn" data-retry>${S.icon('refresh')} Try again</button><button class="btn primary" data-next>${i + 1 < items.length ? 'Next sentence' : 'Finish'} ${S.icon('right')}</button></div>`;
      S.$('[data-retry]', out).addEventListener('click', () => { out.innerHTML = ''; });
      S.$('[data-next]', out).addEventListener('click', () => { i++; if (i < items.length) show(); else finish(); });
      S.store.activity.log(1);
    };
    const finish = () => {
      const done = scores.filter((x) => x != null);
      const avg = done.length ? Math.round(done.reduce((a, b) => a + b, 0) / done.length) : 0;
      S.store.scores.add('Speaking', Math.round((avg / 100) * done.length), done.length || 1);
      if (avg >= 85) S.confetti();
      root.innerHTML = `${S.ui.pageHead({ kicker: 'Speaking', title: 'Session complete' })}
        <section class="card result"><div class="result-head">${S.ui.ring(avg, { size: 88, stroke: 8, tone: S.ui.scoreTone(avg) })}
          <div><h2>Average ${avg}%</h2><p class="lead">${avg >= 85 ? 'Your pronunciation is clear — すばらしい！' : 'Speaking gets easier every time you do it out loud.'}</p>
          <div class="row gap"><button class="btn primary" data-again>${S.icon('refresh')} 10 more</button><a class="btn" href="#/speaking">Back</a></div></div></div></section>`;
      S.$('[data-again]', root).addEventListener('click', () => repeat(root, set));
    };
    S.onLeave(() => mic && mic.cancel());
    show();
  }

  function talk(root, sc) {
    if (!S.ai.hasChat()) { root.innerHTML = S.aiKeyNeeded('Spoken role-play'); return; }
    const history = []; // Claude messages
    const log = [];     // what is shown: {who:'ai'|'me', jp, rom, en, correction}
    let suggestion = null, busy = false, mic = null, ended = false;
    window.scrollTo(0, 0);
    root.innerHTML = `
      <nav class="lesson-nav"><a class="btn ghost sm" href="#/speaking">${S.icon('left')} Speaking</a><button class="btn sm" data-end>Finish & get feedback</button></nav>
      ${S.ui.pageHead({ title: sc.title, desc: esc(sc.desc) })}
      <section class="card talk">
        <div class="talk-log" data-log></div>
        <div class="talk-hint" data-hint></div>
        <div class="talk-controls">
          ${S.ai.canListen() ? '<button class="btn primary lg mic" data-mic></button>' : ''}
          <form class="talk-type" data-form><input lang="ja" placeholder="${S.ai.canListen() ? 'or type…' : 'Type your reply in Japanese…'}" aria-label="Your reply"><button class="btn" type="submit">${S.icon('arrow')}</button></form>
        </div>
      </section>
      <section class="card" data-feedback hidden></section>`;
    const logEl = S.$('[data-log]', root), hint = S.$('[data-hint]', root);
    const paint = () => {
      logEl.innerHTML = log.map((m) => `<div class="msg-row ${m.who === 'ai' ? 'assistant' : 'user'}">
        ${m.who === 'ai' ? '<span class="msg-avatar" lang="ja">相</span>' : ''}
        <div class="bubble"><p lang="ja">${esc(m.jp)}</p>${m.rom ? `<p class="muted small">${esc(m.rom)}</p>` : ''}${m.en ? `<p class="small">${esc(m.en)}</p>` : ''}
          ${m.who === 'ai' ? `<div class="bubble-tools"><button class="btn-icon" data-speak="${esc(m.jp)}" title="Play again">${S.icon('volume')}</button></div>` : ''}
          ${m.correction ? `<div class="talk-fix">${S.icon('pencil')} ${esc(m.correction)}</div>` : ''}</div></div>`).join('')
        + (busy ? '<div class="msg-row assistant"><span class="msg-avatar" lang="ja">相</span><div class="bubble typing"><span></span><span></span><span></span></div></div>' : '');
      logEl.scrollTop = logEl.scrollHeight;
      hint.innerHTML = suggestion && !busy ? `<span class="muted small">You could say:</span> <button class="chip" data-use="${esc(suggestion.jp)}" lang="ja">${esc(suggestion.jp)}</button> <span class="muted small">${esc(suggestion.en)}</span>` : '';
    };
    const turn = async (said) => {
      if (busy || ended) return;
      if (said) { history.push({ role: 'user', content: said }); log.push({ who: 'me', jp: said }); }
      busy = true; paint();
      try {
        const r = await S.ai.roleplayTurn({ scenario: sc.prompt, history: history.length ? history : [] });
        if (said && r.correction) log[log.length - 1].correction = r.correction;
        history.push({ role: 'assistant', content: r.reply_jp });
        if (!said && history.length === 1) history.unshift({ role: 'user', content: '(start the conversation)' });
        log.push({ who: 'ai', jp: r.reply_jp, rom: S.store.settings.get('romaji') !== false ? r.reply_romaji : '', en: r.reply_en });
        suggestion = r.suggestion_jp ? { jp: r.suggestion_jp, en: r.suggestion_en } : null;
        busy = false; paint();
        S.tts.say(r.reply_jp);
        S.store.activity.log(1);
      } catch (e) {
        busy = false;
        if (said) { history.pop(); log.pop(); }
        paint(); S.toast(e.message);
      }
    };
    const micEl = S.$('[data-mic]', root);
    if (micEl) mic = micButton(micEl, { onText: (t) => (t ? turn(t) : S.toast('I didn’t catch that — try again a little louder.')) });
    const form = S.$('[data-form]', root);
    form.addEventListener('submit', (e) => { e.preventDefault(); const inp = S.$('input', form); if (inp.value.trim()) { turn(inp.value.trim()); inp.value = ''; } });
    root.addEventListener('click', (e) => {
      const u = e.target.closest('[data-use]');
      if (u) { S.tts.speak(u.dataset.use); S.toast('Now say it yourself — tap Speak'); }
      if (e.target.closest('[data-end]')) end();
    });
    const end = async () => {
      if (ended) return;
      const mine = log.filter((m) => m.who === 'me').length;
      if (!mine) { S.toast('Say at least one thing first!'); return; }
      ended = true; mic && mic.cancel();
      const fb = S.$('[data-feedback]', root);
      fb.hidden = false; fb.innerHTML = '<p class="muted">Claude is reviewing your conversation…</p>';
      fb.scrollIntoView({ block: 'start', behavior: 'smooth' });
      try {
        const r = await S.ai.roleplayFeedback({ scenario: sc.title, transcript: log.map((m) => `${m.who === 'ai' ? 'Partner' : 'Me'}: ${m.jp}`).join('\n') });
        S.store.scores.add('Speaking', Math.round((r.score / 100) * mine), mine);
        if (r.score >= 85) S.confetti();
        fb.innerHTML = `<div class="result-head">${S.ui.ring(r.score, { size: 80, stroke: 8, tone: S.ui.scoreTone(r.score) })}<div><h2>Conversation feedback</h2></div></div>
          <p><b>What went well:</b> ${esc(r.went_well)}</p><p><b>Work on next:</b> ${esc(r.work_on)}</p>
          <h3>Phrases to remember</h3><ul class="examples">${r.phrases.map((p) => `<li class="example"><div class="example-jp" lang="ja">${esc(p.jp)} ${S.ui.speak(p.jp)}</div><div class="example-en">${esc(p.en)}</div></li>`).join('')}</ul>
          <div class="row gap"><button class="btn primary" data-again>${S.icon('refresh')} Talk again</button><a class="btn" href="#/speaking">Other scenarios</a></div>`;
        S.$('[data-again]', fb).addEventListener('click', () => talk(root, sc));
      } catch (e) { ended = false; fb.innerHTML = `<p class="muted">${esc(e.message)}</p>`; }
    };
    S.onLeave(() => { mic && mic.cancel(); ended = true; });
    paint();
    turn(null);
  }

  S.view('speaking', {
    render(root, { params }) {
      if (params[0] === 'repeat') { const set = SENTENCE_SETS().find((s) => s.id === params[1]); if (set) return repeat(root, set); }
      if (params[0] === 'talk') { const sc = SCENARIOS.find((s) => s.id === params[1]); if (sc) return talk(root, sc); }
      home(root);
    },
  });
})(window.S);
