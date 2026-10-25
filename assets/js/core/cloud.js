// Optional account + cloud sync (Firebase). The app works fully without it:
// Firebase is only downloaded when someone signs in (or was signed in last visit).
(function (S) {
  const FIREBASE_VERSION = '10.12.0';
  const CONFIG = {
    apiKey: 'AIzaSyDWeOYL1qYUlu9cTdwgbBafOHAdhtYHf6M',
    authDomain: 'japanese-website-70e89.firebaseapp.com',
    projectId: 'japanese-website-70e89',
    storageBucket: 'japanese-website-70e89.firebasestorage.app',
    messagingSenderId: '17723436403',
    appId: '1:17723436403:web:382fe6b4ad5fac80642906',
  };
  const FLAG = 'sakura_signed_in';
  const ERRORS = {
    'auth/user-not-found': 'No account found with that email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/email-already-in-use': 'An account already exists with that email — try signing in.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/network-request-failed': 'Network error — check your connection.',
    'auth/popup-blocked': 'The sign-in popup was blocked by the browser.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
  };

  let fb = null;          // loaded Firebase functions + instances
  let loading = null;
  let user = null;
  let pushing = false;
  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn(user));

  // Firestore document <-> local snapshot (field names match what the old site stored)
  const toRemote = (s) => ({
    scores: s.scores || [], srs: s.srs || {}, bookmarks: s.bm || {},
    streak: s.streak?.streak || 0, streakBest: s.streak?.best || 0, lastStudyDate: s.streak?.lastDate || '',
    customEntries: s.custom || {}, cards: s.cards || {}, activity: s.activity || {},
    plan: s.plan || {}, settings: s.settings || {},
  });
  const fromRemote = (d) => ({
    scores: d.scores, srs: d.srs, bm: d.bookmarks,
    streak: { streak: d.streak || 0, best: d.streakBest || 0, lastDate: d.lastStudyDate || '' },
    custom: d.customEntries, cards: d.cards, activity: d.activity, plan: d.plan, settings: d.settings,
  });

  async function load() {
    if (fb) return fb;
    if (loading) return loading;
    const base = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
    loading = Promise.all([
      import(`${base}/firebase-app.js`),
      import(`${base}/firebase-auth.js`),
      import(`${base}/firebase-firestore.js`),
    ]).then(([appMod, authMod, fsMod]) => {
      const app = appMod.initializeApp(CONFIG);
      fb = { ...authMod, ...fsMod, auth: authMod.getAuth(app), db: fsMod.getFirestore(app) };
      fb.onAuthStateChanged(fb.auth, onAuth);
      return fb;
    }).catch((e) => { loading = null; throw e; });
    return loading;
  }

  async function onAuth(u) {
    user = u;
    if (!u) { localStorage.removeItem(FLAG); emit(); return; }
    localStorage.setItem(FLAG, '1');
    try {
      const ref = fb.doc(fb.db, 'users', u.uid);
      const snap = await fb.getDoc(ref);
      if (snap.exists()) S.store.merge(fromRemote(snap.data()));
      await push(true);
    } catch (e) { console.warn('Cloud sync failed', e); }
    emit();
  }

  async function push(withProfile) {
    if (!user || !fb || pushing) return;
    pushing = true;
    try {
      const data = toRemote(S.store.snapshot());
      data.lastLogin = fb.serverTimestamp();
      if (withProfile) { data.displayName = user.displayName || user.email.split('@')[0]; data.email = user.email; }
      await fb.setDoc(fb.doc(fb.db, 'users', user.uid), data, { merge: true });
      S.cloud.lastSync = Date.now();
    } catch (e) { console.warn('Cloud save failed', e); }
    finally { pushing = false; }
  }
  const schedulePush = S.debounce(() => push(false), 2500);

  const wrap = async (fn) => {
    try { await load(); return await fn(); }
    catch (e) {
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return null;
      throw new Error(ERRORS[e.code] || (e.code ? 'Something went wrong. Please try again.' : 'Could not reach the sign-in service. Check your connection.'));
    }
  };

  S.cloud = {
    lastSync: 0,
    get user() { return user; },
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    load,
    signIn: (email, password) => wrap(() => fb.signInWithEmailAndPassword(fb.auth, email, password)),
    signUp: (name, email, password) => wrap(async () => {
      const cred = await fb.createUserWithEmailAndPassword(fb.auth, email, password);
      if (name) await fb.updateProfile(cred.user, { displayName: name });
      await fb.setDoc(fb.doc(fb.db, 'users', cred.user.uid), { createdAt: fb.serverTimestamp() }, { merge: true });
      return cred;
    }),
    google: () => wrap(() => fb.signInWithPopup(fb.auth, new fb.GoogleAuthProvider())),
    resetPassword: (email) => wrap(() => fb.sendPasswordResetEmail(fb.auth, email)),
    updateName: (name) => wrap(async () => { await fb.updateProfile(user, { displayName: name }); await push(true); emit(); }),
    signOut: () => wrap(async () => { await push(false); await fb.signOut(fb.auth); }),
    syncNow: () => wrap(async () => {
      const snap = await fb.getDoc(fb.doc(fb.db, 'users', user.uid));
      if (snap.exists()) S.store.merge(fromRemote(snap.data()));
      await push(true);
    }),
    memberSince: async () => {
      if (!user) return null;
      return user.metadata?.creationTime ? new Date(user.metadata.creationTime) : null;
    },
  };

  S.store.on(() => { if (user) schedulePush(); });

  // Restore a previous session in the background — never blocks the app from showing.
  if (localStorage.getItem(FLAG) === '1') load().catch(() => {});
})(window.S);
