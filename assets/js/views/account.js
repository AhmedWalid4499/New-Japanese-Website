// Account & settings — optional sign-in for cloud sync, preferences, and backups.
(function (S) {
  const esc = S.esc;
  const GOOGLE = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>';

  function authPanel(mode) {
    const signup = mode === 'signup';
    return `<section class="card auth">
      <h2 class="card-title">${signup ? 'Create a free account' : 'Sign in'}</h2>
      <p class="muted">Optional — everything works without an account. Signing in backs up your progress and syncs it across devices.</p>
      <div class="msg" data-msg hidden></div>
      <form class="form" data-auth="${mode}">
        ${signup ? '<label class="field"><span class="field-label">Name</span><input name="name" autocomplete="name" placeholder="Your name"></label>' : ''}
        <label class="field"><span class="field-label">Email</span><input name="email" type="email" autocomplete="email" placeholder="you@example.com" required></label>
        <label class="field"><span class="field-label">Password</span><input name="password" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" placeholder="${signup ? 'At least 6 characters' : '••••••••'}" required minlength="6"></label>
        <button class="btn primary block" type="submit">${signup ? 'Create account' : 'Sign in'}</button>
      </form>
      <div class="divider"><span>or</span></div>
      <button class="btn block" data-google>${GOOGLE} Continue with Google</button>
      <p class="center small">${signup ? 'Already have an account? <button class="link" data-mode="signin">Sign in</button>' : 'New here? <button class="link" data-mode="signup">Create an account</button> · <button class="link" data-forgot>Forgot password?</button>'}</p>
    </section>`;
  }

  function profilePanel(u) {
    const name = u.displayName || u.email.split('@')[0];
    return `<section class="card profile">
      <div class="row gap">
        ${u.photoURL ? `<img class="avatar lg" src="${esc(u.photoURL)}" alt="" referrerpolicy="no-referrer">` : `<span class="avatar lg">${esc(name.charAt(0).toUpperCase())}</span>`}
        <div><h2>${esc(name)}</h2><div class="muted">${esc(u.email)}</div><div class="muted small" data-since></div></div>
      </div>
      <form class="form row gap end" data-name>
        <label class="field grow"><span class="field-label">Display name</span><input name="name" value="${esc(u.displayName || '')}" placeholder="Your name"></label>
        <button class="btn" type="submit">Save</button>
      </form>
      <div class="row gap wrap">
        <button class="btn" data-sync>${S.icon('cloud')} Sync now</button>
        <button class="btn ghost" data-signout>${S.icon('logout')} Sign out</button>
        <span class="muted small" data-sync-status>${S.cloud.lastSync ? `Last synced ${new Date(S.cloud.lastSync).toLocaleTimeString()}` : 'Changes sync automatically.'}</span>
      </div>
    </section>`;
  }

  const select = (name, label, opts, value) => `<label class="field inline"><span class="field-label">${esc(label)}</span>
    <select data-setting="${name}">${opts.map(([v, l]) => `<option value="${v}" ${String(v) === String(value) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`;

  function aiPanel() {
    const c = S.ai.config();
    const opt = (list, v) => list.map(([k, l]) => `<option value="${esc(k)}" ${k === v ? 'selected' : ''}>${esc(l)}</option>`).join('');
    const keyField = (name, label, value, hint, ph) => `<label class="field"><span class="field-label">${label}</span>
      <span class="key-input"><input name="${name}" type="password" value="${esc(value)}" placeholder="${ph}" autocomplete="off" spellcheck="false"><button type="button" class="btn-icon" data-reveal-key title="Show / hide">${S.icon('eye')}</button></span>
      <span class="field-hint">${hint}</span></label>`;
    return `<section class="card" id="ai-settings">
      <h2 class="card-title"><span class="glyph sm" lang="ja">鍵</span> AI & voice</h2>
      <p class="muted">Add your own keys: <b>Claude</b> powers the <a href="#/tutor">AI tutor</a> and your personal <a href="#/myplan">study plan</a>; <b>ChatGPT</b> provides natural Japanese voices. Keys are stored <b>only in this browser</b> — never synced or backed up, and only ever sent to Anthropic or OpenAI. Usage is billed to your own accounts.</p>
      <form class="form" data-ai-form>
        <div class="grid-2">
          <div>
            <h3 class="mini-title">AI chatbot — Claude</h3>
            ${keyField('anthropicKey', 'Claude API key', c.anthropicKey, c.anthropicKey ? 'Saved on this device.' : 'Create one in the <a href="https://platform.claude.com/settings/keys" target="_blank" rel="noopener">Claude Console</a>.', 'sk-ant-…')}
            <label class="field"><span class="field-label">Model</span><select name="chatModel">${opt(S.ai.MODELS, c.chatModel)}</select></label>
          </div>
          <div>
            <h3 class="mini-title">Sounds & pronunciation — ChatGPT</h3>
            <label class="field"><span class="field-label">Voice engine</span><select name="voiceEngine">${opt([['browser', 'Browser voice (free)'], ['openai', 'ChatGPT voice (natural)']], c.voiceEngine)}</select></label>
            ${keyField('openaiKey', 'ChatGPT (OpenAI) API key', c.openaiKey, c.openaiKey ? 'Saved on this device.' : 'Create one at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">platform.openai.com</a>.', 'sk-…')}
            <div class="grid-2">
              <label class="field"><span class="field-label">Voice</span><select name="voice">${opt(S.ai.VOICES.map((v) => [v, v[0].toUpperCase() + v.slice(1)]), c.voice)}</select></label>
              <label class="field"><span class="field-label">Voice model</span><select name="ttsModel">${opt(S.ai.TTS_MODELS, c.ttsModel)}</select></label>
            </div>
          </div>
        </div>
        <div class="msg" data-ai-msg hidden></div>
        <div class="row gap wrap">
          <button class="btn primary" type="submit">${S.icon('check')} Save</button>
          <button class="btn" type="button" data-test-chat>Test Claude</button>
          <button class="btn" type="button" data-test-voice>${S.icon('volume')} Test ChatGPT voice</button>
          <span class="spacer"></span>
          ${c.anthropicKey || c.openaiKey ? `<button class="btn ghost danger" type="button" data-remove-keys>${S.icon('trash')} Remove keys</button>` : ''}
        </div>
      </form>
    </section>`;
  }

  S.view('account', {
    title: 'Account & settings',
    mode: 'signin',
    render(root, { query }) {
      const u = S.cloud.user;
      const s = S.store.settings.all();
      root.innerHTML = `
        ${S.ui.pageHead({ kicker: 'Account', title: 'Account & settings' })}
        <div class="grid-2 top">
          ${u ? profilePanel(u) : authPanel(this.mode)}
          <section class="card">
            <h2 class="card-title">Preferences</h2>
            ${select('theme', 'Theme', [['auto', 'Match my device'], ['light', 'Light'], ['dark', 'Dark']], s.theme)}
            ${select('ttsRate', 'Speech speed', [[0.6, 'Slow (0.6×)'], [0.85, 'Natural (0.85×)'], [1, 'Normal (1×)'], [1.25, 'Fast (1.25×)']], s.ttsRate)}
            ${select('dailyGoal', 'Daily goal', [[10, '10 items — casual'], [20, '20 items — regular'], [40, '40 items — serious'], [80, '80 items — intense']], s.dailyGoal)}
            <div class="row gap"><button class="btn sm" data-speak="こんにちは。にほんごを べんきょうしましょう。">${S.icon('volume')} Test ChatGPT voice</button>
              <span class="muted small">${S.tts.supported ? (S.tts.hasVoice() ? 'Japanese voice found.' : 'No Japanese voice detected — install one in your device’s language settings for best results.') : 'Speech isn’t supported in this browser.'}</span></div>
          </section>
        </div>
        ${aiPanel()}
        <section class="card">
          <h2 class="card-title">Your data</h2>
          <p class="muted">Progress is saved in this browser${u ? ' and backed up to your account' : ''}. Download a backup file to move it to another device or keep it safe.</p>
          <div class="row gap wrap">
            <button class="btn" data-export>${S.icon('download')} Download backup</button>
            <label class="btn">${S.icon('upload')} Restore from file<input type="file" accept="application/json,.json" data-import hidden></label>
            <span class="spacer"></span>
            <button class="btn danger ghost" data-reset>${S.icon('trash')} Reset all progress</button>
          </div>
        </section>
        <p class="muted small center">Sakura Study — JLPT N5 study guide · © 2026 Ahmed El Bourgy</p>`;

      const msg = (text, kind = 'bad') => { const m = S.$('[data-msg]', root); if (m) { m.hidden = false; m.className = `msg ${kind}`; m.textContent = text; } };
      const busy = (btn, on) => { if (btn) { btn.disabled = on; btn.classList.toggle('loading', on); } };

      if (query.ai) { const el = S.$('#ai-settings', root); el.scrollIntoView({ block: 'start' }); el.classList.add('flash'); S.$('[name=anthropicKey]', el).focus(); }
      if (u) S.cloud.memberSince().then((d) => { const el = S.$('[data-since]', root); if (el && d) el.textContent = `Member since ${S.fmtDate(d)}`; });

      root.addEventListener('submit', async (e) => {
        e.preventDefault();
        const f = e.target;
        const data = Object.fromEntries(new FormData(f).entries());
        const btn = S.$('[type=submit]', f);
        if (f.dataset.aiForm !== undefined) {
          S.ai.save({ anthropicKey: (data.anthropicKey || '').trim(), openaiKey: (data.openaiKey || '').trim(), chatModel: data.chatModel, voiceEngine: data.voiceEngine, voice: data.voice, ttsModel: data.ttsModel });
          S.ai._cache.clear();
          S.toast(data.voiceEngine === 'openai' && !(data.openaiKey || '').trim() ? 'Saved — add a ChatGPT key to use ChatGPT voice' : 'AI settings saved');
          S.rerender();
          return;
        }
        if (f.dataset.auth) {
          if (!data.email || !data.password) { msg('Please enter your email and password.'); return; }
          busy(btn, true);
          try {
            if (f.dataset.auth === 'signup') await S.cloud.signUp(data.name.trim(), data.email.trim(), data.password);
            else await S.cloud.signIn(data.email.trim(), data.password);
            S.toast('Signed in — your progress is syncing');
          } catch (err) { msg(err.message); }
          finally { busy(btn, false); }
        }
        if (f.dataset.name !== undefined) {
          busy(btn, true);
          try { await S.cloud.updateName(data.name.trim()); S.toast('Name updated'); } catch (err) { S.toast(err.message); }
          finally { busy(btn, false); }
        }
      });

      root.addEventListener('click', async (e) => {
        const eye = e.target.closest('[data-reveal-key]');
        if (eye) { const i = eye.previousElementSibling; i.type = i.type === 'password' ? 'text' : 'password'; return; }
        const aiMsg = (text, kind) => { const m = S.$('[data-ai-msg]', root); m.hidden = false; m.className = `msg ${kind}`; m.textContent = text; };
        const tc = e.target.closest('[data-test-chat]');
        if (tc) {
          const key = S.$('[name=anthropicKey]', root).value.trim();
          if (!key) { aiMsg('Paste your Claude API key first.', 'bad'); return; }
          S.ai.save({ anthropicKey: key, chatModel: S.$('[name=chatModel]', root).value });
          busy(tc, true);
          try { const r = await S.ai.chat([{ role: 'user', content: 'Reply with one short friendly Japanese greeting and its English meaning.' }], { temperature: 0.3 }); aiMsg(`Claude works ✓ — ${r.replace(/\*\*/g, "").replace(/\s+/g, " ").slice(0, 120)}`, 'good'); }
          catch (err) { aiMsg(err.message, 'bad'); } finally { busy(tc, false); }
          return;
        }
        const tv = e.target.closest('[data-test-voice]');
        if (tv) {
          const f = S.$('[data-ai-form]', root);
          const d = Object.fromEntries(new FormData(f).entries());
          if (!d.openaiKey.trim()) { aiMsg('Paste your ChatGPT (OpenAI) API key first.', 'bad'); return; }
          S.ai.save({ openaiKey: d.openaiKey.trim(), voice: d.voice, ttsModel: d.ttsModel });
          busy(tv, true);
          try { const url = await S.ai.speechUrl('こんにちは。いっしょに にほんごを べんきょうしましょう。'); await new Audio(url).play(); aiMsg(d.voiceEngine === 'openai' ? 'Voice works ✓' : 'Voice works ✓ — set “Voice engine” to ChatGPT voice and Save to use it everywhere.', 'good'); }
          catch (err) { aiMsg(err.message, 'bad'); } finally { busy(tv, false); }
          return;
        }
        if (e.target.closest('[data-remove-keys]')) {
          if (S.confirm('Remove your API keys from this browser?')) { S.ai.save({ anthropicKey: '', openaiKey: '', voiceEngine: 'browser' }); S.toast('Keys removed'); S.rerender(); }
          return;
        }
        const mode = e.target.closest('[data-mode]');
        if (mode) { this.mode = mode.dataset.mode; S.rerender(); return; }
        if (e.target.closest('[data-google]')) {
          try { await S.cloud.google(); } catch (err) { msg(err.message); }
          return;
        }
        if (e.target.closest('[data-forgot]')) {
          const email = S.$('input[name=email]', root).value.trim();
          if (!email) { msg('Type your email above first, then press “Forgot password?” again.'); return; }
          try { await S.cloud.resetPassword(email); msg('Password reset email sent — check your inbox.', 'good'); } catch (err) { msg(err.message); }
          return;
        }
        const sync = e.target.closest('[data-sync]');
        if (sync) {
          busy(sync, true);
          try { await S.cloud.syncNow(); S.$('[data-sync-status]', root).textContent = `Last synced ${new Date().toLocaleTimeString()}`; S.toast('Synced'); }
          catch (err) { S.toast(err.message); } finally { busy(sync, false); }
          return;
        }
        if (e.target.closest('[data-signout]')) { try { await S.cloud.signOut(); S.toast('Signed out'); } catch (err) { S.toast(err.message); } return; }
        if (e.target.closest('[data-export]')) {
          const blob = new Blob([JSON.stringify({ app: 'sakura-study', version: 2, exported: new Date().toISOString(), data: S.store.snapshot() }, null, 2)], { type: 'application/json' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `sakura-study-backup-${S.today()}.json`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 1000);
          return;
        }
        if (e.target.closest('[data-reset]')) {
          if (S.confirm('Reset ALL progress on this device — streaks, scores, flashcards, bookmarks and custom entries?') && S.confirm('Are you sure? Download a backup first if you might want it back.')) {
            S.store.reset(); S.toast('Progress reset'); S.rerender();
          }
        }
      });

      root.addEventListener('change', async (e) => {
        const sel = e.target.closest('[data-setting]');
        if (sel) {
          const k = sel.dataset.setting;
          S.store.settings.set(k, k === 'theme' ? sel.value : parseFloat(sel.value));
          if (k === 'theme') S.applyTheme();
          S.toast('Saved');
        }
        const file = e.target.closest('[data-import]');
        if (file && file.files[0]) {
          try {
            const json = JSON.parse(await file.files[0].text());
            if (!json.data) throw new Error('bad file');
            S.store.merge(json.data);
            S.toast('Backup restored');
            S.rerender();
          } catch (err) { S.toast('That file isn’t a Sakura Study backup.'); }
        }
      });
    },
  });
})(window.S);
