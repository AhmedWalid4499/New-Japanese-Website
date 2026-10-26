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
    // Speak and resolve when finished — for playing dialogues line by line.
    // gender 'f' | 'm' picks a matching ChatGPT voice (or shifts the browser voice's pitch).
    say(text, { gender, voice: v, rate } = {}) {
      const clean = String(text).replace(/[()（）]/g, '').trim();
      const r = rate || S.store.settings.get('ttsRate') || 0.85;
      S.tts.stop();
      return new Promise((resolve) => {
        if (!clean) { resolve(); return; }
        const viaBrowser = () => {
          if (!synth) { resolve(); return; }
          const u = new SpeechSynthesisUtterance(clean);
          u.lang = 'ja-JP'; u.rate = r;
          if (voice) u.voice = voice;
          if (gender) u.pitch = gender === 'm' ? 0.75 : 1.2;
          u.onend = u.onerror = () => resolve();
          synth.speak(u);
        };
        if (!(S.ai && S.ai.useVoice())) { viaBrowser(); return; }
        const name = v || (gender ? S.ai.SPEAKER_VOICES[gender][0] : undefined);
        S.ai.speechUrl(clean, { slow: r < 0.7, voice: name }).then((url) => {
          audio = new Audio(url);
          audio.playbackRate = Math.max(0.5, Math.min(1.5, r / 0.85));
          audio.onended = audio.onerror = () => resolve();
          audio.onpause = () => resolve();
          return audio.play();
        }).catch((e) => {
          if (!warned) { S.toast(`ChatGPT voice unavailable — using the browser voice. (${e.message})`); warned = true; }
          viaBrowser();
        });
      });
    },
  };
})(window.S);
