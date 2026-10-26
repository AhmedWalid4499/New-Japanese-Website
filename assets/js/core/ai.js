// AI integrations for the website — a thin layer over the shared SakuraAI module
// (assets/js/shared/sakura-ai.js), which the iPhone app uses too.
//   • Chat — Claude (Anthropic API) powers the tutor, study-plan coach, corrections and generated practice.
//   • Voice — ChatGPT (OpenAI) gives natural Japanese pronunciation and hears you speak.
// Keys stay in this browser only — never exported in backups or synced to the cloud.
(function (S, AI) {
  // One-time migration from the first version, which used a single OpenAI key for everything
  (function migrate() {
    const raw = S.store.read(AI.KEY_STORE, null);
    if (!raw || !('chatKey' in raw || 'voiceKey' in raw)) return;
    const { chatKey = '', voiceKey = '', chatModel, ...rest } = raw;
    const openaiKey = voiceKey || (chatKey.startsWith('sk-ant-') ? '' : chatKey);
    const anthropicKey = chatKey.startsWith('sk-ant-') ? chatKey : '';
    S.store.write(AI.KEY_STORE, { ...rest, anthropicKey, openaiKey }, true);
  })();

  // A short summary of the learner's progress so the AI can personalise its help
  function learnerContext() {
    const st = S.store.streak();
    const best = {};
    S.store.scores.list().forEach((s) => { if (!best[s.type] || s.pct > best[s.type]) best[s.type] = s.pct; });
    const m = S.mastery ? S.mastery().map((x) => `${x.label} ${x.done}/${x.total}`).join(', ') : '';
    const plan = S.store.read(S.store.KEYS.aiplan, null);
    const course = S.course ? S.course.summary() : '';
    return [
      `Current streak: ${st.current} days (best ${st.best}).`,
      m && `Mastery: ${m}.`,
      course,
      Object.keys(best).length ? `Best quiz scores: ${Object.entries(best).map(([t, p]) => `${t} ${p}%`).join(', ')}.` : 'No quizzes taken yet.',
      plan ? `They follow a personal plan: “${plan.title}”.` : '',
    ].filter(Boolean).join(' ');
  }

  S.ai = { ...AI, learnerContext };

  // Open the AI tutor with a question already asked (used by "Ask Sensei" buttons)
  S.askSensei = (question) => {
    try { sessionStorage.setItem('sakura_ask', question); } catch (e) {}
    S.go('tutor');
  };
})(window.S, window.SakuraAI);
