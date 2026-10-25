// ChatGPT (OpenAI) integration: the AI tutor, the AI study-plan coach, and natural voices.
// Keys are entered by the learner in Account & settings and stay in this browser only —
// they are never exported in backups or synced to the cloud.
(function (S) {
  const API = 'https://api.openai.com/v1';
  const KEY_STORE = 'sakura_ai_keys';
  const DEFAULTS = { chatKey: '', voiceKey: '', chatModel: 'gpt-4o-mini', ttsModel: 'gpt-4o-mini-tts', voice: 'nova', voiceEngine: 'browser' };

  const cfg = () => ({ ...DEFAULTS, ...S.store.read(KEY_STORE, {}) });
  const chatKey = () => cfg().chatKey.trim();
  const voiceKey = () => (cfg().voiceKey || cfg().chatKey).trim();

  async function request(path, key, body) {
    if (!key) throw new Error('Add your OpenAI API key in Account & settings first.');
    let res;
    try {
      res = await fetch(`${API}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify(body),
      });
    } catch (e) {
      throw new Error('Couldn’t reach OpenAI. Check your internet connection.');
    }
    if (!res.ok) {
      let detail = '';
      try { detail = (await res.json()).error?.message || ''; } catch (e) {}
      if (res.status === 401) throw new Error('OpenAI rejected the API key. Check it in Account & settings.');
      if (res.status === 429) throw new Error(/quota|billing/i.test(detail) ? 'Your OpenAI account is out of credit — check billing on platform.openai.com.' : 'OpenAI is rate-limiting requests. Wait a moment and try again.');
      throw new Error(detail || `OpenAI error (${res.status}).`);
    }
    return res;
  }

  // A short summary of the learner's progress so the AI can personalise its help
  function learnerContext() {
    const st = S.store.streak();
    const scores = S.store.scores.list();
    const best = {};
    scores.forEach((s) => { if (!best[s.type] || s.pct > best[s.type]) best[s.type] = s.pct; });
    const m = S.mastery ? S.mastery().map((x) => `${x.label} ${x.done}/${x.total}`).join(', ') : '';
    const plan = S.store.read(S.store.KEYS.aiplan, null);
    return [
      `Current streak: ${st.current} days (best ${st.best}).`,
      m && `Mastery: ${m}.`,
      Object.keys(best).length ? `Best quiz scores: ${Object.entries(best).map(([t, p]) => `${t} ${p}%`).join(', ')}.` : 'No quizzes taken yet.',
      plan ? `They follow a personal plan: “${plan.title}”.` : '',
    ].filter(Boolean).join(' ');
  }

  S.ai = {
    MODELS: [['gpt-4o-mini', 'GPT-4o mini — fast & cheap'], ['gpt-4.1-mini', 'GPT-4.1 mini'], ['gpt-4o', 'GPT-4o — best quality'], ['gpt-4.1', 'GPT-4.1']],
    TTS_MODELS: [['gpt-4o-mini-tts', 'gpt-4o-mini-tts — most natural'], ['tts-1', 'tts-1 — fastest'], ['tts-1-hd', 'tts-1-hd — high quality']],
    VOICES: ['nova', 'shimmer', 'alloy', 'coral', 'sage', 'echo', 'fable', 'onyx'],
    config: cfg,
    save(patch) { S.store.write(KEY_STORE, { ...cfg(), ...patch }, true); },
    hasChat: () => !!chatKey(),
    useVoice: () => cfg().voiceEngine === 'openai' && !!voiceKey(),
    learnerContext,

    // messages: [{role, content}] → reply text. `schema` turns on structured JSON output.
    async chat(messages, { schema, temperature = 0.7 } = {}) {
      const body = { model: cfg().chatModel, messages, temperature };
      if (schema) body.response_format = { type: 'json_schema', json_schema: schema };
      const res = await request('/chat/completions', chatKey(), body);
      const data = await res.json();
      const msg = data.choices?.[0]?.message;
      if (msg?.refusal) throw new Error(msg.refusal);
      return msg?.content || '';
    },

    // Returns a playable audio URL for Japanese text (cached so repeats cost nothing)
    _cache: new Map(),
    async speechUrl(text, { slow = false } = {}) {
      const c = cfg();
      const id = `${c.ttsModel}|${c.voice}|${slow}|${text}`;
      if (S.ai._cache.has(id)) return S.ai._cache.get(id);
      const body = { model: c.ttsModel, voice: c.voice, input: text.slice(0, 4000), response_format: 'mp3' };
      if (c.ttsModel === 'gpt-4o-mini-tts') body.instructions = `Speak natural, clear standard Japanese like a friendly teacher${slow ? ', slowly and carefully' : ''}.`;
      else if (slow) body.speed = 0.7;
      const res = await request('/audio/speech', voiceKey(), body);
      const url = URL.createObjectURL(await res.blob());
      S.ai._cache.set(id, url);
      return url;
    },
  };

  // Light, safe markdown for AI replies: escape first, then **bold**, `code`, lists and line breaks
  S.ai.render = (text) => {
    const lines = S.esc(text).split('\n');
    let html = '', inList = false;
    lines.forEach((ln) => {
      const item = ln.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)/);
      if (item) { if (!inList) { html += '<ul>'; inList = true; } html += `<li>${item[1]}</li>`; return; }
      if (inList) { html += '</ul>'; inList = false; }
      html += ln.trim() ? `<p>${ln}</p>` : '';
    });
    if (inList) html += '</ul>';
    return html.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>');
  };

  // Just the Japanese parts of a reply, for reading aloud
  S.ai.japaneseOnly = (text) => (String(text).match(/[　-ヿ一-鿿！-～]+/g) || []).join('、');
})(window.S);
