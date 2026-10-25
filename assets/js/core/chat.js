// Reusable chat panel (used by the AI tutor and the study-plan coach).
//
// S.chatPane(el, {
//   storageKey,                 // where the transcript is kept (device only)
//   system: () => string,       // system prompt, built fresh for every reply
//   greeting,                   // first assistant message (shown without calling the API)
//   suggestions: [string],      // quick-reply chips
//   placeholder,
//   onReply(messages),          // called after each AI reply
// }) → { messages, reset }
(function (S) {
  const esc = S.esc;
  const HISTORY = 24; // messages sent with each request

  S.chatPane = (el, opts) => {
    let messages = S.store.read(opts.storageKey, null) || [{ role: 'assistant', content: opts.greeting }];
    let busy = false;
    const save = () => S.store.write(opts.storageKey, messages, true);

    el.innerHTML = `
      <div class="chat">
        <div class="chat-log" data-log aria-live="polite"></div>
        <div class="chat-suggest" data-suggest></div>
        <form class="chat-form" data-form>
          <textarea rows="1" placeholder="${esc(opts.placeholder || 'Type a message…')}" aria-label="Message" data-input></textarea>
          <button class="btn primary" type="submit" aria-label="Send">${S.icon('arrow')}</button>
        </form>
      </div>`;
    const log = S.$('[data-log]', el), input = S.$('[data-input]', el), form = S.$('[data-form]', el);

    const bubble = (m) => {
      const jp = m.role === 'assistant' ? S.ai.japaneseOnly(m.content) : '';
      return `<div class="msg-row ${m.role}">
        ${m.role === 'assistant' ? '<span class="msg-avatar" lang="ja">先</span>' : ''}
        <div class="bubble">${m.role === 'assistant' ? S.ai.render(m.content) : `<p>${esc(m.content).replace(/\n/g, '<br>')}</p>`}
          ${jp ? `<div class="bubble-tools"><button class="btn-icon" data-speak="${esc(jp)}" title="Read the Japanese aloud">${S.icon('volume')}</button></div>` : ''}
        </div></div>`;
    };
    const paint = () => {
      log.innerHTML = messages.map(bubble).join('') + (busy ? '<div class="msg-row assistant"><span class="msg-avatar" lang="ja">先</span><div class="bubble typing"><span></span><span></span><span></span></div></div>' : '');
      log.scrollTop = log.scrollHeight;
      const sug = messages.length <= 1 && !busy ? opts.suggestions || [] : [];
      S.$('[data-suggest]', el).innerHTML = sug.map((s) => `<button type="button" class="chip" data-say="${esc(s)}">${esc(s)}</button>`).join('');
    };

    async function send(text) {
      text = text.trim();
      if (!text || busy) return;
      messages.push({ role: 'user', content: text });
      busy = true; save(); paint();
      input.value = ''; input.style.height = '';
      try {
        const reply = await S.ai.chat([{ role: 'system', content: opts.system() }, ...messages.slice(-HISTORY)]);
        messages.push({ role: 'assistant', content: reply });
        S.store.activity.log(1);
      } catch (e) {
        messages.pop();
        input.value = text;
        S.toast(e.message);
      }
      busy = false; save(); paint();
      opts.onReply && opts.onReply(messages);
      input.focus();
    }

    form.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(input.value); } });
    input.addEventListener('input', () => { input.style.height = ''; input.style.height = `${Math.min(160, input.scrollHeight)}px`; });
    el.addEventListener('click', (e) => { const s = e.target.closest('[data-say]'); if (s) send(s.dataset.say); });
    paint();

    return {
      messages: () => messages,
      reset(greeting = opts.greeting) { messages = [{ role: 'assistant', content: greeting }]; save(); paint(); },
      push(m) { messages.push(m); save(); paint(); },
    };
  };

  // Shown wherever an AI feature needs a key that hasn't been added yet
  S.aiKeyNeeded = (what) => `<section class="card center hero-card">
    <div class="glyph huge" lang="ja">鍵</div>
    <h2>Add your ChatGPT API key</h2>
    <p class="muted">${esc(what)} uses your own OpenAI account. Paste an API key in settings — it stays in this browser only.</p>
    <div class="row gap center"><a class="btn primary" href="#/account?ai=1">${S.icon('pencil')} Add API key</a>
      <a class="btn" href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">Get a key ${S.icon('external')}</a></div>
  </section>`;
})(window.S);
