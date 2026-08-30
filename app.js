const app = document.getElementById('app');
let db = null;

function show(message, title = 'Loan Appraise V3') {
  app.innerHTML = '<main class="auth"><section class="card"><h1>' + title + '</h1><p>' + message + '</p></section></main>';
}

function login() {
  app.innerHTML = '<main class="auth"><section class="card"><h1>Loan Appraise V3</h1><p>Secure loan appraisal and approval.</p><label>Email<input id="email" type="email" autocomplete="email"></label><label>Password<input id="password" type="password" autocomplete="current-password"></label><button class="primary" id="signin">Sign In</button><p id="msg"></p></section></main>';
  document.getElementById('signin').onclick = async function () {
    const msg = document.getElementById('msg');
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!email || !password) { msg.textContent = 'Email and password are required.'; return; }
    msg.textContent = 'Signing in...';
    try {
      const result = await db.auth.signInWithPassword({ email: email, password: password });
      if (result.error) { msg.textContent = result.error.message; return; }
      location.reload();
    } catch (e) { msg.textContent = e.message || String(e); }
  };
}

async function init() {
  try {
    if (!window.SUPABASE_URL || !window.SUPABASE_PUBLISHABLE_KEY) {
      show('Supabase configuration is missing.');
      return;
    }
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      show('The secure database library did not load. Please refresh the page.');
      return;
    }
    db = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
    const result = await db.auth.getSession();
    if (result.error) { show('Supabase connection error: ' + result.error.message); return; }
    if (result.data && result.data.session) {
      show('Login successful. Dashboard is ready.', 'Loan Appraise V3');
      return;
    }
    login();
  } catch (e) {
    show('Application startup error: ' + (e.message || String(e)));
  }
}

init();
