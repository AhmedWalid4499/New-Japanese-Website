// AI layer shared by the website and the iPhone app (window.SakuraAI). Uses the learner's own keys:
//   • Claude (Anthropic API) — chat, corrections, generated stories & dialogues, speaking feedback.
//   • ChatGPT (OpenAI API)   — natural Japanese voices (text-to-speech) and speech-to-text for speaking practice.
// Keys live in localStorage under `sakura_ai_keys` on this device only — never exported or synced.
(function () {
  const SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.3.0/+esm';
  const OPENAI = 'https://api.openai.com/v1';
  const KEY_STORE = 'sakura_ai_keys';
  const DEFAULTS = { anthropicKey: '', openaiKey: '', chatModel: 'claude-opus-5-5', ttsModel: 'gpt-4o-mini-tts', voice: 'nova', voiceEngine: 'browser', sttModel: 'gpt-4o-mini-transcribe' };
  // Models that accept server-side refusal fallbacks ("default" routing)
  const FALLBACK_MODELS = ['claude-opus-5-5', 'claude-sonnet-5-5'];

  const read = () => { try { return JSON.parse(localStorage.getItem(KEY_STORE)) || {}; } catch (e) { return {}; } };
  const cfg = () => ({ ...DEFAULTS, ...read() });
  const save = (patch) => { try { localStorage.setItem(KEY_STORE, JSON.stringify({ ...cfg(), ...patch })); } catch (e) {} };

  // ── Claude ──
  let sdk = null, client = null, clientKey = '';
  async function claude() {
    const key = cfg().anthropicKey.trim();
    if (!key) throw new Error('Add your Claude API key in settings first.');
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
    if (e instanceof A.AuthenticationError) return new Error('Claude rejected the API key. Check it in settings.');
    if (e instanceof A.PermissionDeniedError) return new Error('This Claude API key doesn’t have access to that model.');
    if (e instanceof A.NotFoundError) return new Error('That Claude model isn’t available for your key — pick another in settings.');
    if (e instanceof A.RateLimitError) return new Error('Claude is rate-limiting requests. Wait a moment and try again.');
    if (e instanceof A.BadRequestError) return new Error(/credit balance/i.test(e.message) ? 'Your Anthropic account is out of credit — check Plans & Billing in the Claude Console.' : `Claude couldn’t handle that request: ${e.message}`);
    if (e instanceof A.APIConnectionError) return new Error('Couldn’t reach Claude. Check your internet connection.');
    if (e instanceof A.APIError) return new Error(`Claude error (${e.status ?? 'unknown'}). Try again shortly.`);
    return e;
  }

  // messages: [{role:'user'|'assistant', content}] (must start with a user turn).
  // schema → structured JSON output (returned parsed when `json` is true); effort controls how hard Claude thinks.
  async function chat(messages, { system, schema, effort = 'low', maxTokens = 16000 } = {}) {
    const c = await claude();
    const model = cfg().chatModel;
    const params = { model, max_tokens: maxTokens, messages, output_config: { effort } };
    if (system) params.system = system;
    if (schema) params.output_config.format = { type: 'json_schema', schema };
    if (FALLBACK_MODELS.includes(model)) { params.betas = ['server-side-fallback-2026-07-01']; params.fallbacks = 'default'; }
    let res;
    try { res = await c.beta.messages.create(params); }
    catch (e) { throw friendlyClaudeError(e); }
    if (res.stop_reason === 'refusal') throw new Error('Claude declined to answer that. Try rephrasing.');
    const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    if (!text) throw new Error(res.stop_reason === 'max_tokens' ? 'Claude’s reply was too long — try again.' : 'Claude returned an empty reply — try again.');
    return text;
  }

  // One-shot structured request: returns the parsed object
  async function json(prompt, schema, { system, effort = 'low', maxTokens } = {}) {
    const text = await chat([{ role: 'user', content: prompt }], { system, schema, effort, maxTokens });
    try { return JSON.parse(text); } catch (e) { throw new Error('Claude’s reply couldn’t be read — try again.'); }
  }

  // ── OpenAI (ChatGPT voice + speech-to-text) ──
  async function openai(path, init) {
    const key = cfg().openaiKey.trim();
    if (!key) throw new Error('Add your ChatGPT (OpenAI) API key in settings first.');
    let res;
    try { res = await fetch(`${OPENAI}${path}`, { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${key}` } }); }
    catch (e) { throw new Error('Couldn’t reach OpenAI. Check your internet connection.'); }
    if (!res.ok) {
      let detail = '';
      try { detail = (await res.json()).error?.message || ''; } catch (e) {}
      if (res.status === 401) throw new Error('OpenAI rejected the API key. Check it in settings.');
      if (res.status === 429) throw new Error(/quota|billing/i.test(detail) ? 'Your OpenAI account is out of credit — check billing on platform.openai.com.' : 'OpenAI is rate-limiting requests. Wait a moment and try again.');
      throw new Error(detail || `OpenAI error (${res.status}).`);
    }
    return res;
  }

  // A playable audio URL for Japanese text (cached so repeats cost nothing)
  const cache = new Map();
  async function speechUrl(text, { slow = false, voice } = {}) {
    const c = cfg();
    const v = voice || c.voice;
    const id = `${c.ttsModel}|${v}|${slow}|${text}`;
    if (cache.has(id)) return cache.get(id);
    const body = { model: c.ttsModel, voice: v, input: text.slice(0, 4000), response_format: 'mp3' };
    if (c.ttsModel === 'gpt-4o-mini-tts') body.instructions = `Speak natural, clear standard Japanese like a friendly teacher${slow ? ', slowly and carefully' : ''}.`;
    else if (slow) body.speed = 0.7;
    const res = await openai('/audio/speech', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const url = URL.createObjectURL(await res.blob());
    cache.set(id, url);
    return url;
  }

  // Speech-to-text (Japanese) for a recorded audio blob
  async function transcribe(blob) {
    const ext = /mp4|m4a|aac/.test(blob.type) ? 'mp4' : /ogg/.test(blob.type) ? 'ogg' : /wav/.test(blob.type) ? 'wav' : 'webm';
    const fd = new FormData();
    fd.append('file', blob, `speech.${ext}`);
    fd.append('model', cfg().sttModel);
    fd.append('language', 'ja');
    fd.append('response_format', 'json');
    const res = await openai('/audio/transcriptions', { method: 'POST', body: fd });
    return ((await res.json()).text || '').trim();
  }

  // ── Microphone ──
  // SakuraAI.listen() starts listening and returns { stop() → Promise<transcript>, cancel() }.
  // Uses ChatGPT speech-to-text when an OpenAI key is set (most accurate), else the browser's
  // built-in speech recognition (Safari / Chrome).
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const canRecord = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  const canListen = () => (hasOpenAI() && canRecord()) || !!Recognition;
  const hasOpenAI = () => !!cfg().openaiKey.trim();

  async function listen() {
    if (hasOpenAI() && canRecord()) {
      let stream;
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      catch (e) { throw new Error('Microphone access was blocked. Allow it in your browser settings to practise speaking.'); }
      const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find((m) => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || '';
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      rec.start();
      const end = () => stream.getTracks().forEach((t) => t.stop());
      return {
        engine: 'openai',
        stop: () => new Promise((resolve, reject) => {
          rec.onstop = async () => {
            end();
            const blob = new Blob(chunks, { type: rec.mimeType || mime || 'audio/webm' });
            if (blob.size < 1200) { resolve(''); return; }
            try { resolve(await transcribe(blob)); } catch (e) { reject(e); }
          };
          rec.stop();
        }),
        cancel() { rec.onstop = end; try { rec.stop(); } catch (e) { end(); } },
      };
    }
    if (!Recognition) throw new Error('Speech recognition isn’t available in this browser. Add a ChatGPT key in settings, or use Safari / Chrome.');
    const r = new Recognition();
    r.lang = 'ja-JP'; r.interimResults = false; r.continuous = true; r.maxAlternatives = 1;
    let text = '', err = null, done = null;
    r.onresult = (e) => { text = Array.from(e.results).map((x) => x[0].transcript).join(''); };
    r.onerror = (e) => { err = e.error === 'not-allowed' ? new Error('Microphone access was blocked. Allow it in your browser settings.') : e.error === 'no-speech' ? null : new Error(`Speech recognition error: ${e.error}`); };
    r.onend = () => { if (done) done(); };
    r.start();
    return {
      engine: 'browser',
      stop: () => new Promise((resolve, reject) => { done = () => (err ? reject(err) : resolve(text.trim())); try { r.stop(); } catch (e) { done(); } }),
      cancel() { done = null; try { r.abort(); } catch (e) {} },
    };
  }

  // Light, safe markdown for AI replies: escape first, then **bold**, `code`, lists and line breaks
  const escHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function render(text) {
    const lines = escHtml(text).split('\n');
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
  }
  // Just the Japanese parts of a text, for reading aloud
  const japaneseOnly = (text) => (String(text).match(/[　-ヿ一-鿿！-～]+/g) || []).join('、');

  // ── Ready-made AI tasks used by both website and app ──
  const N5 = 'The learner is a beginner studying for the JLPT N5. Use only N5 vocabulary and grammar. Write Japanese in hiragana/katakana with N5 kanji only where very common; never use kanji above N5.';

  // Grade a learner's Japanese answer to an English prompt
  const gradeSchema = {
    type: 'object', additionalProperties: false,
    required: ['verdict', 'score', 'corrected', 'romaji', 'feedback'],
    properties: {
      verdict: { type: 'string', enum: ['correct', 'almost', 'incorrect'] },
      score: { type: 'integer', description: '0–100' },
      corrected: { type: 'string', description: 'The learner’s sentence corrected with minimal changes (or unchanged if correct), in kana.' },
      romaji: { type: 'string' },
      feedback: { type: 'string', description: '1–3 short, kind sentences in English: what was right, what to fix and why.' },
    },
  };
  const grade = ({ english, answer, model }) => json(
    `English prompt: "${english}"\nModel answer: ${model || '(none)'}\nLearner's Japanese: ${answer}\n\nJudge whether the learner's Japanese correctly expresses the English. Accept any natural, grammatical alternative (different word order, polite/plain style, synonyms, kana vs kanji) — it does not need to match the model answer. Minor typos in kana count as "almost".`,
    gradeSchema, { system: `You are a kind, precise Japanese teacher. ${N5}` });

  // Correct a free piece of writing (diary etc.)
  const correctSchema = {
    type: 'object', additionalProperties: false,
    required: ['sentences', 'overall', 'score'],
    properties: {
      sentences: {
        type: 'array',
        items: {
          type: 'object', additionalProperties: false,
          required: ['original', 'corrected', 'english', 'ok', 'note'],
          properties: {
            original: { type: 'string' }, corrected: { type: 'string' }, english: { type: 'string', description: 'English meaning of the corrected sentence' },
            ok: { type: 'boolean', description: 'true if the original needed no changes' }, note: { type: 'string', description: 'Short explanation of the correction in English, or a word of praise' },
          },
        },
      },
      overall: { type: 'string', description: '2–3 encouraging sentences in English with the single most useful thing to work on next.' },
      score: { type: 'integer', description: '0–100' },
    },
  };
  const correct = ({ prompt, text }) => json(
    `Writing task: "${prompt}"\nLearner's text:\n${text}\n\nCorrect each sentence with the smallest changes that make it natural and correct. Keep the learner's meaning and style.`,
    correctSchema, { system: `You are a kind, precise Japanese teacher. ${N5}` });

  // Judge a spoken attempt at a target sentence (from a speech-to-text transcript)
  const speakSchema = {
    type: 'object', additionalProperties: false,
    required: ['score', 'feedback', 'heard_kana'],
    properties: {
      score: { type: 'integer', description: '0–100: how closely the learner said the target' },
      heard_kana: { type: 'string', description: 'The transcript rewritten in hiragana/katakana' },
      feedback: { type: 'string', description: '1–2 short sentences in English: which words were missed or different. Remember the transcript comes from speech recognition, so ignore kanji-vs-kana and punctuation differences.' },
    },
  };
  const judgeSpeech = ({ target, heard }) => json(
    `Target sentence the learner tried to say: ${target}\nSpeech-recognition transcript of what they said: ${heard || '(nothing recognised)'}`,
    speakSchema, { system: `You are a supportive Japanese pronunciation coach. ${N5}` });

  // Write a graded story in the same shape as STORIES (tokens for tap-to-translate)
  const storySchema = {
    type: 'object', additionalProperties: false,
    required: ['title', 'jp', 'lines', 'questions'],
    properties: {
      title: { type: 'string' }, jp: { type: 'string', description: 'Japanese title in kana' },
      lines: {
        type: 'array', description: '6–10 sentences',
        items: {
          type: 'object', additionalProperties: false, required: ['t', 'en'],
          properties: {
            t: { type: 'array', description: 'Tokens. Words/particles: [surface kana, romaji, short English gloss]. Punctuation: [mark] alone.', items: { type: 'array', items: { type: 'string' } } },
            en: { type: 'string' },
          },
        },
      },
      questions: {
        type: 'array', description: '3 comprehension questions in English',
        items: { type: 'object', additionalProperties: false, required: ['q', 'opts', 'ans'], properties: { q: { type: 'string' }, opts: { type: 'array', items: { type: 'string' }, description: 'exactly 4' }, ans: { type: 'integer', description: '0-based index of the correct option' } } },
      },
    },
  };
  const LEVELS = { 1: 'very easy: です/ます sentences, basic particles, present tense', 2: 'easy: add past tense, adjectives, time expressions', 3: 'full N5: て-form, ～たい, ～から, ～ています, comparisons' };
  const story = ({ topic, level }) => json(
    `Write an original short story for a Japanese learner about: ${topic || 'daily life'}. Difficulty: ${LEVELS[level] || LEVELS[2]}. Kana only (no kanji). Split every sentence into tokens with each particle as its own token; the surfaces must join (without spaces) into the natural sentence. Vary which option is correct in the questions.`,
    storySchema, { system: `You write engaging graded readers. ${N5}`, effort: 'medium' });

  // Write a two-person listening dialogue in the same shape as DIALOGUES
  const dialogueSchema = {
    type: 'object', additionalProperties: false,
    required: ['title', 'scene', 'speakers', 'lines', 'questions'],
    properties: {
      title: { type: 'string' }, scene: { type: 'string', description: 'One English sentence setting the scene' },
      speakers: {
        type: 'object', additionalProperties: false, required: ['A', 'B'],
        properties: Object.fromEntries(['A', 'B'].map((k) => [k, { type: 'object', additionalProperties: false, required: ['name', 'role', 'voice'], properties: { name: { type: 'string', description: 'kana' }, role: { type: 'string', description: 'English' }, voice: { type: 'string', enum: ['f', 'm'] } } }])),
      },
      lines: { type: 'array', description: '6–10 lines', items: { type: 'object', additionalProperties: false, required: ['s', 'jp', 'rom', 'en'], properties: { s: { type: 'string', enum: ['A', 'B'] }, jp: { type: 'string' }, rom: { type: 'string' }, en: { type: 'string' } } } },
      questions: {
        type: 'array', description: '2–3 JLPT-style questions in English',
        items: { type: 'object', additionalProperties: false, required: ['q', 'opts', 'ans'], properties: { q: { type: 'string' }, opts: { type: 'array', items: { type: 'string' }, description: 'exactly 4' }, ans: { type: 'integer' } } },
      },
    },
  };
  const dialogue = ({ topic, level }) => json(
    `Write a JLPT N5 listening-test style conversation between two people about: ${topic || 'everyday plans'}. Difficulty: ${LEVELS[level] || LEVELS[2]}. Kana only. Include a small twist (someone changes their mind or corrects a detail) so the listener must pay attention. Vary which option is correct.`,
    dialogueSchema, { system: `You write natural, clear listening practice. ${N5}`, effort: 'medium' });

  // One turn of a spoken role-play conversation
  const turnSchema = {
    type: 'object', additionalProperties: false,
    required: ['reply_jp', 'reply_romaji', 'reply_en', 'correction', 'suggestion_jp', 'suggestion_en'],
    properties: {
      reply_jp: { type: 'string', description: 'Your next line in Japanese (1–2 short sentences, kana with only very common N5 kanji)' },
      reply_romaji: { type: 'string' }, reply_en: { type: 'string' },
      correction: { type: 'string', description: 'If the learner’s last line had a mistake: the corrected Japanese and a 1-sentence English note. Empty string if it was fine or there was no learner line.' },
      suggestion_jp: { type: 'string', description: 'A simple example of what the learner could say next' },
      suggestion_en: { type: 'string' },
    },
  };
  const roleplayTurn = ({ scenario, history }) => chat(
    history.length ? history : [{ role: 'user', content: '(start the conversation)' }],
    { system: `You are role-playing to help a learner practise SPEAKING Japanese. Scenario: ${scenario}. Stay in character, keep each line short and simple so it is easy to answer out loud, and ask a question most turns to keep the conversation going. The learner's lines come from speech recognition, so ignore kanji/kana and punctuation differences and only correct real grammar or word mistakes. ${N5}`, schema: turnSchema })
    .then((t) => JSON.parse(t));

  const feedbackSchema = {
    type: 'object', additionalProperties: false, required: ['score', 'went_well', 'work_on', 'phrases'],
    properties: {
      score: { type: 'integer', description: '0–100 overall' },
      went_well: { type: 'string' }, work_on: { type: 'string' },
      phrases: { type: 'array', description: '2–4 useful phrases from this scenario to remember', items: { type: 'object', additionalProperties: false, required: ['jp', 'en'], properties: { jp: { type: 'string' }, en: { type: 'string' } } } },
    },
  };
  const roleplayFeedback = ({ scenario, transcript }) => json(
    `Scenario: ${scenario}\nTranscript (learner = "Me"):\n${transcript}\n\nGive short, encouraging feedback on the learner's speaking.`,
    feedbackSchema, { system: `You are a supportive Japanese speaking coach. ${N5}` });

  window.SakuraAI = {
    MODELS: [['claude-opus-5-5', 'Claude Opus 5.5 — best quality'], ['claude-sonnet-5-5', 'Claude Sonnet 5.5 — faster, lower cost'], ['claude-haiku-5-5', 'Claude Haiku 5.5 — fastest, cheapest']],
    TTS_MODELS: [['gpt-4o-mini-tts', 'gpt-4o-mini-tts — most natural'], ['tts-1', 'tts-1 — fastest'], ['tts-1-hd', 'tts-1-hd — high quality']],
    VOICES: ['nova', 'shimmer', 'alloy', 'coral', 'sage', 'echo', 'fable', 'onyx'],
    // voices for dialogue speakers (female / male)
    SPEAKER_VOICES: { f: ['nova', 'shimmer'], m: ['onyx', 'echo'] },
    KEY_STORE, config: cfg, save,
    hasChat: () => !!cfg().anthropicKey.trim(),
    hasOpenAI,
    useVoice: () => cfg().voiceEngine === 'openai' && hasOpenAI(),
    canListen, chat, json, speechUrl, transcribe, listen, render, japaneseOnly,
    grade, correct, judgeSpeech, story, dialogue, roleplayTurn, roleplayFeedback,
  };
})();
