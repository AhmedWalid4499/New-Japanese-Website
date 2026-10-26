// AI tutor — chat with a Claude-powered Japanese teacher that knows your progress.
(function (S) {
  const SYSTEM = () => `You are Sensei, a warm, encouraging Japanese tutor inside the "Sakura Study" JLPT N5 website.
- The learner is a beginner (JLPT N5 level). Use N5 vocabulary and grammar; avoid kanji above N5 or add the reading in hiragana in brackets, e.g. 勉強(べんきょう).
- When you write Japanese, add romaji and an English translation on the next line unless the learner asks you not to.
- Explain grammar briefly with 1–3 short examples. Correct mistakes gently: show the fixed sentence and say why.
- If asked to quiz, ask ONE question at a time and wait for the answer.
- If asked to role-play a conversation, keep your lines short and simple.
- Keep replies concise (under ~150 words) and friendly. Use **bold** for key words and "-" bullet lists when helpful.
- If it helps, suggest a section of the site to practise in: Kana, Grammar, Kanji, Vocabulary, Flashcards, Quizzes, Sentence drills, Listening, Reading, Writing, Mock exam.
Learner progress: ${S.ai.learnerContext()}`;

  const GREETING = 'こんにちは！ I’m **Sensei**, your Japanese tutor. 🌸\n\nAsk me anything — grammar, words, how to say something, or say “quiz me”. I can also correct your sentences or practise a simple conversation with you.';
  const SUGGEST = ['Explain the て-form simply', 'Quiz me on particles', 'Let’s practise a simple conversation', 'Correct my sentence: わたしは がっこうに べんきょうします', 'What should I study today?'];

  S.view('tutor', {
    render(root) {
      root.innerHTML = `
        ${S.ui.pageHead({ kicker: 'Practice', title: 'AI tutor', jp: 'せんせい', desc: 'A Claude-powered teacher who knows your progress. Tap the speaker on any reply to hear the Japanese.', actions: S.ai.hasChat() ? `<button class="btn ghost" data-new>${S.icon('refresh')} New chat</button>` : '' })}
        <div data-body></div>`;
      const body = S.$('[data-body]', root);
      if (!S.ai.hasChat()) { try { sessionStorage.removeItem('sakura_ask'); } catch (e) {} body.innerHTML = S.aiKeyNeeded('The AI tutor'); return; }
      const pane = S.chatPane(body, { storageKey: 'sakura_ai_chat', system: SYSTEM, greeting: GREETING, suggestions: SUGGEST, placeholder: 'Ask Sensei anything… (Enter to send, Shift+Enter for a new line)' });
      S.$('[data-new]', root).addEventListener('click', () => { if (pane.messages().length <= 1 || S.confirm('Start a new chat? This conversation will be cleared.')) pane.reset(); });
      // A question handed over by an "Ask Sensei" button elsewhere on the site
      let ask = null;
      try { ask = sessionStorage.getItem('sakura_ask'); sessionStorage.removeItem('sakura_ask'); } catch (e) {}
      if (ask) pane.send(ask);
    },
  });
})(window.S);
