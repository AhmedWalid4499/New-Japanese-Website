// Study plan — the AI coach interviews you, then builds a personal week-by-week plan
// whose tasks link straight into the right sections of the site.
(function (S) {
  const esc = S.esc;
  const KEY = () => S.store.KEYS.aiplan;
  const INTERVIEW = 'sakura_ai_interview';
  const getPlan = () => S.store.read(KEY(), null);
  const savePlan = (p) => S.store.write(KEY(), { ...p, updated: Date.now() });

  const sections = () => S.NAV.flatMap((g) => g.items).filter((n) => !['home', 'myplan'].includes(n.id));

  const COACH = () => `You are a friendly study coach inside the "Sakura Study" JLPT N5 Japanese website. Your job is to interview the learner so a personalised study plan can be built.
- Ask ONE short question at a time (one or two sentences). Be warm and encouraging.
- Find out: what they already know (kana? any kanji/grammar?), why they're learning (exam, travel, anime, work…), their deadline or exam date, how many minutes per day and days per week they can study, what they find hard or easy, and how they like to study.
- Skip anything they've already told you. Briefly acknowledge each answer.
- After about 4–6 answers, give a 2–3 line summary of what you learned and tell them to press the **Create my plan** button below the chat. They can keep chatting to add details.
- If they're adjusting an existing plan, ask what they want to change, confirm it, then tell them to press **Update my plan**.
Today is ${new Date().toDateString()}. Learner progress on the site: ${S.ai.learnerContext()}`;

  const GREETING_NEW = 'Hi! 🌸 I’ll build a study plan around **your** goals and schedule.\n\nFirst question: how much Japanese do you know right now — can you already read hiragana and katakana?';
  const GREETING_ADJUST = 'Let’s adjust your plan. What would you like to change — more or less time, a new deadline, different focus areas…?';

  const schema = () => ({
    name: 'study_plan', strict: true,
    schema: {
      type: 'object', additionalProperties: false,
      required: ['title', 'summary', 'weeklyHours', 'dailyRoutine', 'weeks', 'tips'],
      properties: {
        title: { type: 'string', description: 'Short motivating plan title' },
        summary: { type: 'string', description: '2–3 sentences: who this plan is for and the goal' },
        weeklyHours: { type: 'number' },
        dailyRoutine: { type: 'array', items: { type: 'string' }, description: '3–5 steps for a typical study session, with minutes' },
        weeks: {
          type: 'array',
          items: {
            type: 'object', additionalProperties: false, required: ['label', 'focus', 'tasks'],
            properties: {
              label: { type: 'string', description: 'e.g. "Week 1" or "Weeks 3–4"' },
              focus: { type: 'string' },
              tasks: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['text', 'section'], properties: { text: { type: 'string' }, section: { type: 'string', enum: [...sections().map((s) => s.id), 'none'] } } } },
            },
          },
        },
        tips: { type: 'array', items: { type: 'string' } },
      },
    },
  });

  async function generate(transcript, current) {
    const list = sections().map((s) => `${s.id} = ${s.label} (${s.desc})`).join('\n');
    const prompt = `Build a personalised JLPT N5 study plan from this interview.
Rules:
- Fit the learner's real time budget and deadline. Use between 4 and 12 weeks (group weeks like "Weeks 5–6" if the timeline is long).
- 3–6 concrete, checkable tasks per week, ordered sensibly (kana before kanji, etc.). Each task should be doable on this website when possible, with "section" set to the matching id below; use "none" for offline tasks.
- Mention specific content where useful (e.g. "Learn the あ–な rows of hiragana", "Particles は, が, を in Grammar").
- Daily routine: 3–5 short steps with minutes that add up to their daily time.
- 3–5 practical tips tailored to them.
Website sections:
${list}
${current ? `\nTheir CURRENT plan (update it according to the conversation, keep what still fits):\n${JSON.stringify({ title: current.title, weeks: current.weeks })}\n` : ''}
Learner progress: ${S.ai.learnerContext()}
Interview:
${transcript}`;
    const out = await S.ai.chat([{ role: 'system', content: 'You are an expert Japanese-language study planner. Reply only with the JSON plan.' }, { role: 'user', content: prompt }], { schema: schema(), temperature: 0.4 });
    const plan = JSON.parse(out);
    return { ...plan, done: current?.done || {}, created: current?.created || Date.now() };
  }

  function planView(root, plan) {
    const all = plan.weeks.flatMap((w) => w.tasks);
    const doneN = all.filter((t) => plan.done[t.text]).length;
    const current = plan.weeks.findIndex((w) => w.tasks.some((t) => !plan.done[t.text]));
    const byId = Object.fromEntries(sections().map((s) => [s.id, s]));
    root.innerHTML = `
      ${S.ui.pageHead({ kicker: 'Your plan', title: plan.title, desc: esc(plan.summary), actions: `<button class="btn" data-adjust>${S.icon('pencil')} Adjust with AI</button><button class="btn ghost" data-restart>${S.icon('refresh')} Start over</button>` })}
      <div class="grid-2 top">
        <section class="card plan-summary">
          ${S.ui.ring(S.pct(doneN, all.length), { size: 84, stroke: 8 })}
          <div><h2>${doneN} of ${all.length} tasks done</h2>
            <p class="muted">${current >= 0 ? `Now: <b>${esc(plan.weeks[current].label)}</b> — ${esc(plan.weeks[current].focus)}` : 'Plan complete — amazing work! 🎉'}</p>
            <p class="small muted">About ${esc(plan.weeklyHours)} hours a week · updated ${S.fmtDate(plan.updated || plan.created)}</p></div>
        </section>
        <section class="card"><h2 class="card-title">Your daily session</h2>
          <ol class="routine">${plan.dailyRoutine.map((r) => `<li>${esc(r)}</li>`).join('')}</ol></section>
      </div>
      <ol class="timeline">${plan.weeks.map((w, wi) => {
        const n = w.tasks.filter((t) => plan.done[t.text]).length;
        return `<li class="tl-item ${wi === current ? 'current' : ''} ${n === w.tasks.length ? 'complete' : ''}" style="--accent:var(--primary)">
          <span class="tl-dot">${n === w.tasks.length ? S.icon('check') : wi + 1}</span>
          <section class="card tl-card">
            <header class="row gap"><div><div class="kicker">${esc(w.label)}</div><h3>${esc(w.focus)}</h3></div><span class="spacer"></span><span class="muted small">${n}/${w.tasks.length}</span></header>
            <ul class="tasks">${w.tasks.map((t) => `<li class="task-row"><label class="check"><input type="checkbox" data-task="${esc(t.text)}" ${plan.done[t.text] ? 'checked' : ''}><span>${esc(t.text)}</span></label>
              ${byId[t.section] ? `<a class="btn sm ghost" href="#/${t.section}"><span class="glyph sm" lang="ja">${byId[t.section].glyph}</span>${esc(byId[t.section].label)}</a>` : ''}</li>`).join('')}</ul>
          </section></li>`;
      }).join('')}</ol>
      ${plan.tips.length ? `<section class="card tip"><h2 class="card-title">Tips for you</h2><ul class="checklist">${plan.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>` : ''}`;

    root.addEventListener('change', (e) => {
      const cb = e.target.closest('[data-task]');
      if (!cb) return;
      const p = getPlan();
      if (cb.checked) { p.done[cb.dataset.task] = true; S.store.activity.log(1); } else delete p.done[cb.dataset.task];
      savePlan(p);
      S.rerender();
    });
    S.$('[data-adjust]', root).addEventListener('click', () => {
      if (!S.ai.hasChat()) { S.go('account?ai=1'); return; }
      S.store.write(INTERVIEW, [{ role: 'assistant', content: GREETING_ADJUST }], true);
      interview(root, plan);
    });
    S.$('[data-restart]', root).addEventListener('click', () => {
      if (!S.confirm('Delete this plan and start a new interview?')) return;
      localStorage.removeItem(KEY()); localStorage.removeItem(INTERVIEW);
      S.store.write(KEY(), null);
      S.rerender();
    });
  }

  function interview(root, current) {
    root.innerHTML = `
      ${S.ui.pageHead({ kicker: 'Study plan', title: current ? 'Adjust your plan' : 'Let’s build your plan', desc: 'Answer a few questions and ChatGPT will design a week-by-week plan that fits your goals and schedule. Every task links to the right page here.', actions: current ? `<button class="btn ghost" data-back>${S.icon('left')} Back to plan</button>` : '<a class="btn ghost" href="#/plan">Use the standard 8-week roadmap</a>' })}
      <div class="card flush" data-chat></div>
      <div class="plan-bar card">
        <span class="muted small" data-hint>Answer a couple of questions first.</span><span class="spacer"></span>
        <button class="btn primary" data-create disabled>${S.icon('check')} ${current ? 'Update my plan' : 'Create my plan'}</button>
      </div>`;
    const btn = S.$('[data-create]', root);
    const refresh = (msgs) => {
      const answers = msgs.filter((m) => m.role === 'user').length;
      btn.disabled = answers < (current ? 1 : 2);
      S.$('[data-hint]', root).textContent = btn.disabled ? 'Answer a couple of questions first.' : 'Ready whenever you are — you can keep chatting to add details.';
    };
    const pane = S.chatPane(S.$('[data-chat]', root), {
      storageKey: INTERVIEW, system: COACH, greeting: current ? GREETING_ADJUST : GREETING_NEW, onReply: refresh,
      suggestions: current ? ['I have less time now', 'My exam date changed', 'Focus more on kanji'] : ['I’m a complete beginner', 'I know hiragana but not katakana', 'I can read kana and some kanji'],
      placeholder: 'Type your answer…',
    });
    refresh(pane.messages());

    btn.addEventListener('click', async () => {
      const transcript = pane.messages().map((m) => `${m.role === 'user' ? 'Learner' : 'Coach'}: ${m.content}`).join('\n');
      btn.disabled = true; btn.classList.add('loading');
      S.$('[data-hint]', root).textContent = 'Designing your plan… this takes a few seconds.';
      try {
        const plan = await generate(transcript, current);
        savePlan(plan);
        localStorage.removeItem(INTERVIEW);
        S.confetti(2200);
        S.toast(current ? 'Plan updated' : 'Your study plan is ready!');
        S.rerender();
      } catch (e) {
        S.toast(e.message);
        btn.disabled = false; btn.classList.remove('loading');
        S.$('[data-hint]', root).textContent = 'Something went wrong — try again.';
      }
    });
    const back = S.$('[data-back]', root);
    if (back) back.addEventListener('click', () => S.rerender());
  }

  S.view('myplan', {
    render(root) {
      const plan = getPlan();
      if (plan && plan.weeks) { planView(root, plan); return; }
      if (!S.ai.hasChat()) {
        root.innerHTML = `${S.ui.pageHead({ kicker: 'Track', title: 'Study plan', desc: 'Chat with the AI coach about your goals and schedule, and it builds a personal week-by-week plan for you.' })}
          ${S.aiKeyNeeded('The personal study plan')}
          <p class="center muted">No key? Follow the standard <a href="#/plan">8-week N5 roadmap</a> instead.</p>`;
        return;
      }
      interview(root, null);
    },
  });

  // Next unfinished task — used by the home page
  S.aiPlanNext = () => {
    const p = getPlan();
    if (!p || !p.weeks) return null;
    for (const w of p.weeks) { const t = w.tasks.find((x) => !p.done[x.text]); if (t) return { week: w, task: t }; }
    return null;
  };
})(window.S);
