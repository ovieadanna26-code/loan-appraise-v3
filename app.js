const app = document.getElementById('app');
let db = null;
let currentUser = null;
let currentProfile = null;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
function shell(content) {
  app.innerHTML = `<main class="layout"><header class="topbar"><strong>Loan Appraise V3</strong><span id="userLabel"></span><button id="logout" class="secondary">Logout</button></header><div class="content">${content}</div></main>`;
  document.getElementById('logout').onclick = async () => { await db.auth.signOut(); location.reload(); };
  const label = document.getElementById('userLabel');
  if (label && currentUser) label.textContent = currentUser.email;
}
function showError(message) { app.innerHTML = `<main class="auth"><section class="card"><h1>Loan Appraise V3</h1><p>${escapeHtml(message)}</p><button class="secondary" onclick="location.reload()">Refresh</button></section></main>`; }

async function login() {
  app.innerHTML = `<main class="auth"><section class="card"><h1>Loan Appraise V3</h1><p>Secure loan appraisal and approval.</p><label>Email<input id="email" type="email" autocomplete="email"></label><label>Password<input id="password" type="password" autocomplete="current-password"></label><button class="primary" id="signin">Sign In</button><p id="msg"></p></section></main>`;
  document.getElementById('signin').onclick = async () => {
    const msg = document.getElementById('msg');
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!email || !password) { msg.textContent = 'Email and password are required.'; return; }
    msg.textContent = 'Signing in...';
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) { msg.textContent = error.message; return; }
    location.reload();
  };
}

async function dashboard() {
  shell(`<section class="hero"><div><h1>Loan Officer Dashboard</h1><p>Create and manage loan applications from one place.</p></div><button id="newApp" class="primary">＋ New Application</button></section>
  <section class="cards"><div class="stat"><span>Drafts</span><strong>0</strong></div><div class="stat"><span>Submitted</span><strong>0</strong></div><div class="stat"><span>Returned</span><strong>0</strong></div><div class="stat"><span>Pending Approval</span><strong>0</strong></div></section>
  <section class="panel"><h2>Applications</h2><p>No applications yet. Start a new loan application.</p></section>`);
  document.getElementById('newApp').onclick = () => customerStep();
}

function customerStep() {
  shell(`<div class="stephead"><div><small>Step 1 of 8</small><h1>Customer Information</h1></div><span class="badge">Draft</span></div>
  <div class="steps"><b>1 Customer</b><span>2 Loan Request</span><span>3 Business & Sales</span><span>4 Financials</span><span>5 Products</span><span>6 Balance Sheet</span><span>7 Collateral</span><span>8 Review</span></div>
  <section class="panel formgrid"><label>Full Name<input id="full_name" required></label><label>Phone Number<input id="phone"></label><label>NIN<input id="nin"></label><label>BVN<input id="bvn"></label><label class="wide">Address<textarea id="address"></textarea></label><div class="actions wide"><button id="back" class="secondary">Back</button><button id="saveCustomer" class="primary">Save & Continue</button></div><p id="saveMsg" class="wide"></p></section>`);
  document.getElementById('back').onclick = dashboard;
  document.getElementById('saveCustomer').onclick = async () => {
    const msg = document.getElementById('saveMsg');
    const full_name = document.getElementById('full_name').value.trim();
    if (!full_name) { msg.textContent = 'Full name is required.'; return; }
    msg.textContent = 'Saving customer...';
    const { data, error } = await db.from('customers').insert({ full_name, phone: document.getElementById('phone').value.trim() || null, nin: document.getElementById('nin').value.trim() || null, bvn: document.getElementById('bvn').value.trim() || null, address: document.getElementById('address').value.trim() || null }).select().single();
    if (error) { msg.textContent = 'Could not save: ' + error.message; return; }
    msg.textContent = 'Customer saved.';
    loanRequestStep(data.id);
  };
}

function loanRequestStep(customerId) {
  shell(`<div class="stephead"><div><small>Step 2 of 8</small><h1>Loan Request</h1></div><span class="badge">Draft</span></div><div class="steps"><span>1 Customer</span><b>2 Loan Request</b><span>3 Business & Sales</span><span>4 Financials</span><span>5 Products</span><span>6 Balance Sheet</span><span>7 Collateral</span><span>8 Review</span></div><section class="panel formgrid"><label>Loan Amount (₦)<input id="amount" type="number" min="0"></label><label>Tenor (months)<input id="tenor" type="number" min="1"></label><label>Purpose<input id="purpose"></label><div class="actions wide"><button id="back" class="secondary">Back</button><button id="saveLoan" class="primary">Save & Continue</button></div><p id="saveMsg" class="wide"></p></section>`);
  document.getElementById('back').onclick = () => customerStep();
  document.getElementById('saveLoan').onclick = async () => {
    const msg = document.getElementById('saveMsg'); msg.textContent = 'Saving loan request...';
    const amount = Number(document.getElementById('amount').value);
    const tenor = Number(document.getElementById('tenor').value);
    if (!amount || !tenor) { msg.textContent = 'Loan amount and tenor are required.'; return; }
    const { error } = await db.from('loan_applications').insert({ customer_id: customerId, requested_amount: amount, tenor_months: tenor, purpose: document.getElementById('purpose').value.trim() || null, status: 'draft', created_by: currentUser.id }).select().single();
    if (error) { msg.textContent = 'Could not save: ' + error.message; return; }
    msg.textContent = 'Loan request saved.';
    businessStep();
  };
}
function businessStep() { shell(`<div class="stephead"><div><small>Step 3 of 8</small><h1>Business & Sales</h1></div></div><section class="panel"><p>Business & Sales section is ready for the next build.</p><button class="primary" onclick="financialsStep()">Continue</button></section>`); }
function financialsStep() { shell(`<div class="stephead"><div><small>Step 4 of 8</small><h1>Financials</h1></div></div><section class="panel"><p>Financials section is ready for the next build.</p><button class="primary" onclick="productsStep()">Continue</button></section>`); }
function productsStep() { shell(`<div class="stephead"><div><small>Step 5 of 8</small><h1>Products / Trading Lines</h1></div></div><section class="panel"><p>Add products and prices here. Product calculations will be added next.</p><button class="primary" onclick="balanceSheetStep()">Continue to Balance Sheet</button></section>`); }
function balanceSheetStep() { shell(`<div class="stephead"><div><small>Step 6 of 8</small><h1>Balance Sheet</h1></div></div><section class="panel"><p>Balance Sheet section.</p><button class="primary">Save & Continue</button></section>`); }

async function init() {
  try {
    if (!window.SUPABASE_URL || !window.SUPABASE_PUBLISHABLE_KEY) return showError('Supabase configuration is missing.');
    if (!window.supabase || typeof window.supabase.createClient !== 'function') return showError('The secure database library did not load.');
    db = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
    const { data, error } = await db.auth.getSession();
    if (error) return showError('Supabase connection error: ' + error.message);
    if (!data.session) return login();
    currentUser = data.session.user;
    const profile = await db.from('profiles').select('full_name,role').eq('id', currentUser.id).maybeSingle();
    if (profile.error) return showError('Could not load user profile: ' + profile.error.message);
    currentProfile = profile.data;
    await dashboard();
  } catch (e) { showError('Application startup error: ' + (e.message || String(e))); }
}
window.customerStep = customerStep; window.dashboard = dashboard; window.financialsStep = financialsStep; window.productsStep = productsStep; window.balanceSheetStep = balanceSheetStep;
init();
