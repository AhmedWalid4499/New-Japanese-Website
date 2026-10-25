// Japanese text-to-speech. Uses ChatGPT voices when enabled in settings (S.ai),
// otherwise — or if that fails — the browser's built-in voices.
(function (S) {
  const synth = window.speechSynthesis;
  let voice = null;
  let activeBtn = null;
  let audio = null;
  let warned = false;

  const pickVoice = () => {
    if (!synth) return;
    const vs = synth.getVoices().filter((v) => /^ja(-|_|$)/i.test(v.lang));
    // Prefer higher quality voices when the browser offers several
    voice = vs.find((v) => /google|kyoko|otoya|nanami|keita|haruka/i.test(v.name)) || vs[0] || null;
  };
  if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }

  const clearBtn = () => { if (activeBtn) activeBtn.classList.remove('speaking'); activeBtn = null; };

  function browserSpeak(text, rate, btn) {
    if (!synth) { S.toast('Speech is not supported in this browser — try Chrome, Edge or Safari.'); clearBtn(); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = rate;
    if (voice) u.voice = voice;
    u.onend = u.onerror = () => { if (!btn || btn === activeBtn) clearBtn(); };
    synth.speak(u);
  }

  async function aiSpeak(text, rate, btn) {
    try {
      const url = await S.ai.speechUrl(text, { slow: rate < 0.7 });
      if (btn && btn !== activeBtn) return; // user pressed something else meanwhile
      audio = new Audio(url);
      audio.preservesPitch = true;
      audio.playbackRate = Math.max(0.5, Math.min(1.5, rate / 0.85));
      audio.onended = audio.onerror = () => { if (!btn || btn === activeBtn) clearBtn(); };
      await audio.play();
    } catch (e) {
      if (!warned) { S.toast(`ChatGPT voice unavailable — using the browser voice. (${e.message})`); warned = true; }
      browserSpeak(text, rate, btn);
    }
  }

  S.tts = {
    // true when either the browser or ChatGPT can speak
    get supported() { return !!synth || !!(S.ai && S.ai.useVoice()); },
    hasVoice: () => !!voice,
    stop() {
      if (synth) synth.cancel();
      if (audio) { audio.pause(); audio = null; }
      clearBtn();
    },
    speak(text, { rate, btn } = {}) {
      const clean = String(text).replace(/_{2,}/g, '、').replace(/[()（）]/g, '').trim();
      if (!clean) return;
      // Tapping the button that is already speaking stops it
      if (btn && btn === activeBtn) { S.tts.stop(); return; }
      S.tts.stop();
      const r = rate || S.store.settings.get('ttsRate') || 0.85;
      if (btn) { activeBtn = btn; btn.classList.add('speaking'); }
      if (S.ai && S.ai.useVoice()) aiSpeak(clean, r, btn);
      else browserSpeak(clean, r, btn);
    },
  };
})(window.S);
