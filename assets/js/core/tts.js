// Japanese text-to-speech using the browser's built-in voices.
(function (S) {
  const synth = window.speechSynthesis;
  let voice = null;
  let activeBtn = null;

  const pickVoice = () => {
    if (!synth) return;
    const vs = synth.getVoices().filter((v) => /^ja(-|_|$)/i.test(v.lang));
    // Prefer higher quality voices when the browser offers several
    voice = vs.find((v) => /google|kyoko|otoya|nanami|keita|haruka/i.test(v.name)) || vs[0] || null;
  };
  if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }

  const clearBtn = () => { if (activeBtn) activeBtn.classList.remove('speaking'); activeBtn = null; };

  S.tts = {
    supported: !!synth,
    hasVoice: () => !!voice,
    stop() { if (synth) synth.cancel(); clearBtn(); },
    speak(text, { rate, btn } = {}) {
      if (!synth) { S.toast('Speech is not supported in this browser — try Chrome, Edge or Safari.'); return; }
      const clean = String(text).replace(/_{2,}/g, '、').replace(/[()（）]/g, '').trim();
      if (!clean) return;
      // Tapping the button that is already speaking stops it
      if (btn && btn === activeBtn) { S.tts.stop(); return; }
      S.tts.stop();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = 'ja-JP';
      u.rate = rate || S.store.settings.get('ttsRate') || 0.85;
      if (voice) u.voice = voice;
      if (btn) { activeBtn = btn; btn.classList.add('speaking'); }
      u.onend = u.onerror = () => { if (!btn || btn === activeBtn) clearBtn(); };
      synth.speak(u);
    },
  };
})(window.S);
