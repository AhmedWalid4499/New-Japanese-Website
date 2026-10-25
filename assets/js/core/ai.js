// AI integrations, each with the learner's own API key (entered in Account & settings):
//   • Chat — Claude (Anthropic API) powers the AI tutor and the study-plan coach.
//   • Voice — ChatGPT (OpenAI text-to-speech) gives natural Japanese pronunciation.
// Keys stay in this browser only — never exported in backups or synced to the cloud.
(function (S) {
  const SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.3.0/+esm';
  const OPENAI = 'https://api.openai.com/v1';
  const KEY_STORE = 'sakura_ai_keys';
  const DEFAULTS = { anthropicKey: '', openaiKey: '', chatModel: 'claude-opus-5-5', ttsModel: 'gpt-4o-mini-tts', voice: 'nova', voiceEngine: 'browser' };
  // Models that accept server-side refusal fallbacks ("default" routing)
  const FALLBACK_MODELS = ['claude-opus-5-5', 'claude-sonnet-5-5'];

  // One-time migration from the first version, which used a single OpenAI key for everything
  (function migrate() {
    const raw = S.store.read(KEY_STORE, null);
    if (!raw || !('chatKey' in raw || 'voiceKey' in raw)) return;
    const { chatKey = '', voiceKey = '', chatModel, ...rest } = raw;
    const openaiKey = voiceKey || (chatKey.startsWith('sk-ant-') ? '' : chatKey);
    const anthropicKey = chatKey.startsWith('sk-ant-') ? chatKey : '';
    S.store.write(KEY_STORE, { ...rest, anthropicKey, openaiKey }, true);
  })();

  const cfg = () => ({ ...DEFAULTS, ...S.store.read(KEY_STORE, {}) });

  // ── Claude (chat) ──
  let sdk = null, client = null, clientKey = '';
  async function claude() {
    const key = cfg().anthropicKey.trim();
    if (!key) throw new Error('Add your Claude API key in Account & settings first.');
    if (!sdk) {
      try { sdk = await import(SDK_URL); }
      catch (e) { throw new Error('Couldn’t load the Claude SDK. Check your internet connection.'); }
    }
    if (!client || clientKey !== key) {
      // The key belongs to the learner and is used only from their own browser
      client = new sdk.default({ apiKey: key, dangerouslyAllowBrowser: true });
      clientKey = key;
    }
    return client;
  }

  function friendlyClaudeError(e) {
    const A = sdk && sdk.default;
    if (!A) return e;
    if (e instanceof A.AuthenticationError) return new Error('Claude rejected the API key. Check it in Account & settings.');
    if (e instanceof A.PermissionDeniedError) return new Error('This Claude API key doesn’t have access to that model.');
    if (e instanceof A.NotFoundError) return new Error('That Claude model isn’t available for your key — pick another in settings.');
    if (e instanceof A.RateLimitError) return new Error('Claude is rate-limiting requests. Wait a moment and try again.');
    if (e instanceof A.BadRequestError) return new Error(/credit balance/i.test(e.message) ? 'Your Anthropic account is out of credit — check Plans & Billing in the Claude Console.' : `Claude couldn’t handle that request: ${e.message}`);
    if (e instanceof A.APIConnectionError) return new Error('Couldn’t reach Claude. Check your internet connection.');
    if (e instanceof A.APIError) return new Error(`Claude error (${e.status ?? 'unknown'}). Try again shortly.`);
    return e;
  }

  // ── ChatGPT (voice) ──
  async function openaiSpeech(body) {
    const key = cfg().openaiKey.trim();
    if (!key) throw new Error('Add your ChatGPT (OpenAI) API key in Account & settings first.');
    let res;
    try {
      res = await fetch(`${OPENAI}/audio/speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify(body),
      });
    } catch (e) { throw new Error('Couldn’t reach OpenAI. Check your internet connection.'); }
    if (!res.ok) {
      let detail = '';
      try { detail = (await res.json()).error?.message || ''; } catch (e) {}
      if (res.status === 401) throw new Error('OpenAI rejected the API key. Check it in Account & settings.');
      if (res.status === 429) throw new Error(/quota|billing/i.test(detail) ? 'Your OpenAI account is out of credit — check billing on platform.openai.com.' : 'OpenAI is rate-limiting requests. Wait a moment and try again.');
      throw new Error(detail || `OpenAI error (${res.status}).`);
    }
    return res.blob();
  }

  // A short summary of the learner's progress so the AI can personalise its help
  function learnerContext() {
    const st = S.store.streak();
    const best = {};
    S.store.scores.list().forEach((s) => { if (!best[s.type] || s.pct > best[s.type]) best[s.type] = s.pct; });
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
    MODELS: [['claude-opus-5-5', 'Claude Opus 5.5 — best quality'], ['claude-sonnet-5-5', 'Claude Sonnet 5.5 — faster, lower cost'], ['claude-haiku-5-5', 'Claude Haiku 5.5 — fastest, cheapest']],
    TTS_MODELS: [['gpt-4o-mini-tts', 'gpt-4o-mini-tts — most natural'], ['tts-1', 'tts-1 — fastest'], ['tts-1-hd', 'tts-1-hd — high quality']],
    VOICES: ['nova', 'shimmer', 'alloy', 'coral', 'sage', 'echo', 'fable', 'onyx'],
    config: cfg,
    save(patch) { S.store.write(KEY_STORE, { ...cfg(), ...patch }, true); },
    hasChat: () => !!cfg().anthropicKey.trim(),
    useVoice: () => cfg().voiceEngine === 'openai' && !!cfg().openaiKey.trim(),
    learnerContext,

    // Claude chat. messages: [{role:'user'|'assistant', content}] (must start with a user turn).
    // schema → structured JSON output; effort controls how hard Claude thinks.
    async chat(messages, { system, schema, effort = 'low', maxTokens = 16000 } = {}) {
      const c = await claude();
      const model = cfg().chatModel;
      const params = { model, max_tokens: maxTokens, messages, output_config: { effort } };
      if (system) params.system = system;
      if (schema) params.output_config.format = { type: 'json_schema', schema };
      if (FALLBACK_MODELS.includes(model)) { params.betas = ['server-side-fallback-2026-07-01']; params.fallbacks = 'default'; }
      let res;
      try { res = await c.beta.messages.create(params); }
      catch (e) { throw friendlyClaudeError(e); }
      if (res.stop_reason === 'refusal') throw new Error('Claude declined to answer that. Try rephrasing your message.');
      const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
      if (!text) throw new Error(res.stop_reason === 'max_tokens' ? 'Claude’s reply was too long — try again.' : 'Claude returned an empty reply — try again.');
      return text;
    },

    // ChatGPT voice: a playable audio URL for Japanese text (cached so repeats cost nothing)
    _cache: new Map(),
    async speechUrl(text, { slow = false } = {}) {
      const c = cfg();
      const id = `${c.ttsModel}|${c.voice}|${slow}|${text}`;
      if (S.ai._cache.has(id)) return S.ai._cache.get(id);
      const body = { model: c.ttsModel, voice: c.voice, input: text.slice(0, 4000), response_format: 'mp3' };
      if (c.ttsModel === 'gpt-4o-mini-tts') body.instructions = `Speak natural, clear standard Japanese like a friendly teacher${slow ? ', slowly and carefully' : ''}.`;
      else if (slow) body.speed = 0.7;
      const url = URL.createObjectURL(await openaiSpeech(body));
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
      if (/^#{1,4}\s/.test(ln)) { html += `<p><b>${ln.replace(/^#+\s*/, '')}</b></p>`; return; }
      html += ln.trim() ? `<p>${ln}</p>` : '';
    });
    if (inList) html += '</ul>';
    return html.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>');
  };

  // Just the Japanese parts of a reply, for reading aloud
  S.ai.japaneseOnly = (text) => (String(text).match(/[　-ヿ一-鿿！-～]+/g) || []).join('、');
})(window.S);
