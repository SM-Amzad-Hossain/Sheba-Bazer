/**
 * সেবা বাজার — Portal logic (portal.html).
 * Customer & provider accounts, fully client-side (GitHub Pages, no backend yet):
 * accounts live in localStorage (shebaBazarAccounts), session in shebaBazarSession.
 * NOTE: password hashing here is demo-grade obfuscation (cyrb53), NOT security —
 * replace with a real backend before storing real user credentials.
 * Depends on main.js (window.shebaToast / window.shebaServices), data-locations.js
 * (window.BANGLADESH_LOCATIONS) and accounts.js (window.shebaAccounts — the shared
 * account/session store, localStorage shebaBazarAccounts / shebaBazarSession).
 */
'use strict';

(function () {

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const BN_DIGITS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
const toBn = (n) => String(n).split('').map((d) => BN_DIGITS[+d] ?? d).join('');
const toast = (msg, type) => (window.shebaToast ? window.shebaToast(msg, type) : undefined);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

const ACCOUNTS = window.shebaAccounts;
const {
  readAccounts, writeAccounts, readRequests, hashPass, newId,
  getSession, setSession, getAccount,
} = ACCOUNTS;

const LOCATIONS    = window.BANGLADESH_LOCATIONS || [];
const PHONE_RE     = /^01[3-9]\d{8}$/;

/* ── select fill + division cascade (shared by signup & profile) ── */
function fillSelect(select, items, placeholder, keep = true) {
  const current = keep ? select.value : '';
  select.innerHTML = `<option value="">${placeholder}</option>`;
  for (const item of items) {
    const opt = document.createElement('option');
    opt.value = item; opt.textContent = item;
    select.appendChild(opt);
  }
  if (current && items.includes(current)) select.value = current;
}

const divisionNames = LOCATIONS.map((d) => d.division);
function wireCascade(divSel, distSel, upaSel) {
  fillSelect(divSel, divisionNames, 'বিভাগ', false);
  const fillDistricts = () => {
    const division = LOCATIONS.find((d) => d.division === divSel.value);
    fillSelect(distSel, division ? division.districts.map((d) => d.name) : [], 'জেলা', false);
    distSel.disabled = !division;
    fillUpazilas();
  };
  const fillUpazilas = () => {
    const division = LOCATIONS.find((d) => d.division === divSel.value);
    const district = division && division.districts.find((d) => d.name === distSel.value);
    fillSelect(upaSel, district ? district.upazilas : [], 'উপজেলা', false);
    upaSel.disabled = !district;
  };
  divSel.addEventListener('change', fillDistricts);
  distSel.addEventListener('change', fillUpazilas);
  return {
    set(division, district, upazila) {
      divSel.value = division || '';
      fillDistricts();
      distSel.value = district || '';
      fillUpazilas();
      upaSel.value = upazila || '';
      if (upazila) upaSel.disabled = false;
    },
  };
}

/* ── Bengali date ── */
function bnDate(iso) {
  try {
    return new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleDateString();
  }
}

/* ── tabs (gateway) ── */
const gateway = $('#portalGateway');
const dashboard = $('#portalDashboard');
const tabLogin = $('#tabLogin');
const tabSignup = $('#tabSignup');
const panelLogin = $('#panelLogin');
const panelSignup = $('#panelSignup');

function openTab(name, updateHash = true) {
  const isLogin = name === 'login';
  tabLogin.classList.toggle('is-active', isLogin);
  tabSignup.classList.toggle('is-active', !isLogin);
  tabLogin.setAttribute('aria-selected', String(isLogin));
  tabSignup.setAttribute('aria-selected', String(!isLogin));
  panelLogin.hidden = !isLogin;
  panelSignup.hidden = isLogin;
  if (updateHash && (location.hash !== `#${name}`)) {
    history.replaceState(null, '', `#${name}`);
  }
}
tabLogin.addEventListener('click', () => openTab('login'));
tabSignup.addEventListener('click', () => openTab('signup'));
$$('[data-goto-tab]').forEach((b) => b.addEventListener('click', () => openTab(b.dataset.gotoTab)));
window.addEventListener('hashchange', () => {
  if (dashboard.hidden) openTab(location.hash === '#signup' ? 'signup' : 'login', false);
});

/* ── role cards (signup) ── */
const roleCards = $$('.portal-role-card');
const providerFields = $('#providerFields');
const signupService = $('#providerService');

/* service options from shared list */
const SERVICE_NAMES = (window.shebaServices || []).map((s) => s.name);
if (signupService) {
  for (const name of SERVICE_NAMES.length ? SERVICE_NAMES : ['কারেন্ট মিস্ত্রি','এসি মিস্ত্রি','প্লাম্বার','বিশেষজ্ঞ ডাক্তার']) {
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name;
    signupService.appendChild(opt);
  }
}

const signupCascade = wireCascade($('#providerDivision'), $('#providerDistrict'), $('#providerUpazila'));

function currentRole() {
  const checked = $('input[name="accountRole"]:checked');
  return checked ? checked.value : 'customer';
}
function syncRoleUI() {
  const role = currentRole();
  roleCards.forEach((c) => c.classList.toggle('is-checked', $('input', c).checked));
  providerFields.hidden = role !== 'provider';
}
roleCards.forEach((card) => $('input', card).addEventListener('change', syncRoleUI));

/* ── field helpers ── */
const setFieldState = (el, invalid) => {
  const field = el.closest('.field');
  if (field) field.classList.toggle('has-error', invalid);
  return !invalid;
};
const bindClear = (els) => els.forEach((el) => {
  el.addEventListener('input', () => el.closest('.field')?.classList.remove('has-error'));
  el.addEventListener('change', () => el.closest('.field')?.classList.remove('has-error'));
});

const loginPhone = $('#loginPhone'), loginPassword = $('#loginPassword');
const signupName = $('#signupName'), signupPhone = $('#signupPhone'), signupPassword = $('#signupPassword');
bindClear([loginPhone, loginPassword, signupName, signupPhone, signupPassword, signupService, $('#providerDivision'), $('#providerDistrict'), $('#providerUpazila')]);

[loginPhone, signupPhone, $('#providerDivision'), $('#providerDistrict'), $('#providerUpazila')].forEach((el) => {
  if (el && el.id && el.id.includes('Phone')) {
    el.addEventListener('input', () => { el.value = el.value.replace(/[^\d]/g, '').slice(0, 11); });
  }
});

/* ── signup ── */
panelSignup.addEventListener('submit', (e) => {
  e.preventDefault();
  ACCOUNTS.ready.then(() => signup(e));
});
function signup(e) {
  const role = currentRole();
  const name = signupName.value.trim();
  const phone = signupPhone.value.trim();
  const password = signupPassword.value;

  let ok = true;
  ok = setFieldState(signupName, name.length < 2) && ok;
  ok = setFieldState(signupPhone, !PHONE_RE.test(phone)) && ok;
  ok = setFieldState(signupPassword, password.length < 6) && ok;

  let providerService = '', division = '', district = '', upazila = '';
  if (role === 'provider') {
    providerService = signupService.value;
    division = $('#providerDivision').value;
    district = $('#providerDistrict').value;
    upazila  = $('#providerUpazila').value;
    signupService.closest('.field').classList.toggle('has-error', !providerService);
    $('#providerAreaError').hidden = !!(division && district && upazila);
    if (!providerService) ok = false;
    if (!(division && district && upazila)) ok = false;
  }

  if (!ok) { toast('ফর্মের লাল দাগানো ঘরগুলো ঠিক করুন।', 'error'); return; }

  const accounts = readAccounts();
  if (accounts.some((a) => a.phone === phone)) {
    setFieldState(signupPhone, true);
    toast('এই নম্বর দিয়ে আগেই অ্যাকাউন্ট খোলা আছে — লগইন করুন।', 'error');
    return;
  }

  const account = {
    id: newId(), name, phone, passHash: hashPass(password), role,
    service: providerService, division, district, upazila,
    address: '', available: true, views: 0, createdAt: new Date().toISOString(),
  };
  accounts.push(account);
  if (!writeAccounts(accounts)) {
    toast('সংরক্ষণ করা যায়নি — ব্রাউজার স্টোরেজ বন্ধ থাকতে পারে।', 'error');
    return;
  }
  setSession(account.id);
  toast('অ্যাকাউন্ট তৈরি হয়েছে — স্বাগতম, ' + name + '!');
  panelSignup.reset();
  /* reset role UI + cascade after reset */
  $('input[name="accountRole"][value="customer"]').checked = true;
  syncRoleUI();
  signupCascade.set('', '', '');
  showDashboard(account.id);
}

/* ── login ── */
panelLogin.addEventListener('submit', (e) => {
  e.preventDefault();
  ACCOUNTS.ready.then(() => login(e));
});
function login(e) {
  const phone = loginPhone.value.trim();
  const password = loginPassword.value;

  let ok = true;
  ok = setFieldState(loginPhone, !PHONE_RE.test(phone)) && ok;
  ok = setFieldState(loginPassword, password.length === 0) && ok;
  if (!ok) { toast('সঠিক তথ্য দিন।', 'error'); return; }

  const account = readAccounts().find((a) => a.phone === phone);
  if (!account || account.passHash !== hashPass(password)) {
    toast('মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়।', 'error');
    return;
  }
  setSession(account.id);
  toast('লগইন সফল! আবার স্বাগতম, ' + account.name.split(' ')[0] + '।');
  panelLogin.reset();
  showDashboard(account.id);
}

/* ── demo quick login ── */
function demoLogin(phone) {
  openTab('login', false);
  loginPhone.value = phone;
  loginPassword.value = 'demo123';
  ACCOUNTS.ready.then(() => panelLogin.requestSubmit());
}
$('#demoCustomerBtn').addEventListener('click', () => demoLogin('01700000001'));
$('#demoProviderBtn').addEventListener('click', () => demoLogin('01700000002'));

/* ── dashboard ── */
const portalAvatar = $('#portalAvatar');
const portalWelcomeName = $('#portalWelcomeName');
const portalWelcomePhone = $('#portalWelcomePhone');
const portalRoleBadge = $('#portalRoleBadge');
const portalStats = $('#portalStats');
const portalListTitle = $('#portalListTitle');
const portalListCta = $('#portalListCta');
const portalRequestList = $('#portalRequestList');
const portalEmpty = $('#portalEmpty');
const portalEmptyText = $('#portalEmptyText');

const profileForm = $('#portalProfileForm');
const profileName = $('#profileName'), profilePhoneEl = $('#profilePhone'),
      profileAddress = $('#profileAddress'), profileServiceField = $('#profileServiceField'),
      profileService = $('#profileService'), profileProviderFields = $('#profileProviderFields'),
      profileAvailable = $('#profileAvailable'), portalVerifyNote = $('#portalVerifyNote'),
      portalViewProfileBtn = $('#portalViewProfileBtn');

const profileCascade = wireCascade($('#profileDivision'), $('#profileDistrict'), $('#profileUpazila'));
if (profileService) {
  for (const name of (SERVICE_NAMES.length ? SERVICE_NAMES : ['কারেন্ট মিস্ত্রি'])) {
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name;
    profileService.appendChild(opt);
  }
}

function requestsFor(account) {
  const all = readRequests();
  if (account.role === 'provider') {
    /* open customer requests in the provider's upazila (same device data) */
    return all.filter((r) => r.mode === 'customer' && r.location && account.upazila && r.location.endsWith(account.upazila));
  }
  return all.filter((r) => r.mode === 'customer' && r.phone === account.phone);
}

function statCard(label, value, sub) {
  return `<div class="portal-stat"><p class="portal-stat-label">${label}</p><p class="portal-stat-value">${value}</p><p class="portal-stat-sub">${sub}</p></div>`;
}

function renderList(account) {
  const list = requestsFor(account).slice().reverse();
  portalRequestList.innerHTML = list.map((r) => `
    <article class="portal-request">
      <div class="portal-request-head">
        <span class="blog-tag">${esc(r.service || 'সেবা')}</span>
        <span class="portal-request-status">${account.role === 'provider' ? 'নতুন লিড' : 'অপেক্ষমাণ'}</span>
      </div>
      <p class="portal-request-details">${r.details ? esc(r.details) : '(বিবরণ নেই)'}</p>
      <div class="portal-request-meta">
        <span>${esc(r.location || '')}</span>
        ${r.submittedAt ? `<span class="blog-dot" aria-hidden="true">·</span><span>${bnDate(r.submittedAt)}</span>` : ''}
      </div>
    </article>`).join('');
  portalEmpty.hidden = list.length !== 0;
  portalRequestList.hidden = list.length === 0;
  portalListCta.hidden = account.role === 'provider';
  if (account.role === 'provider') {
    portalListTitle.textContent = 'আপনার এলাকার অনুরোধ';
    portalEmptyText.innerHTML = '<strong>আপনার এলাকায় এখনো অনুরোধ নেই।</strong> গ্রাহকরা অনুরোধ পাঠালে এখানে দেখা যাবে।';
    portalEmpty.querySelector('.btn').textContent = 'সেবাসমূহ দেখুন';
    portalEmpty.querySelector('.btn').href = 'services.html';
  } else {
    portalListTitle.textContent = 'আমার অনুরোধ';
    portalEmptyText.innerHTML = '<strong>এখনো কোনো অনুরোধ নেই।</strong> সেবার অনুরোধ পাঠালে এখানে দেখতে পাবেন।';
    portalEmpty.querySelector('.btn').textContent = 'সেবার অনুরোধ পাঠান';
    portalEmpty.querySelector('.btn').href = 'index.html#request';
  }
}

function renderDashboard(id) {
  const account = getAccount(id);
  if (!account) { setSession(null); return false; }

  gateway.hidden = true;
  dashboard.hidden = false;

  portalAvatar.textContent = (account.name.trim()[0] || 'স').toUpperCase();
  portalWelcomeName.textContent = `স্বাগতম, ${account.name.split(' ').slice(-1)[0]}!`;
  portalWelcomePhone.textContent = account.phone;
  portalRoleBadge.textContent = account.role === 'provider' ? 'সেবাদাতা' : 'গ্রাহক';
  portalRoleBadge.classList.toggle('portal-role-badge--provider', account.role === 'provider');

  const mine = readRequests().filter((r) => r.phone === account.phone && r.mode === 'customer');
  if (account.role === 'customer') {
    const services = new Set(mine.map((r) => r.service).filter(Boolean));
    const latest = mine.length ? mine.map((r) => r.submittedAt).filter(Boolean).sort().slice(-1)[0] : null;
    portalStats.innerHTML = [
      statCard('মোট অনুরোধ', toBn(mine.length), 'আপনার পাঠানো অনুরোধ'),
      statCard('সেবার ধরন', toBn(services.size || 0), 'যেসব সেবা নিয়েছেন'),
      statCard('শেষ অনুরোধ', latest ? bnDate(latest) : '—', latest ? 'সর্বশেষ পাঠানো হয়েছে' : 'এখনো নেই'),
      statCard('সদস্যতা', bnDate(account.createdAt), 'আপনার যোগদানের তারিখ'),
    ].join('');
  } else {
    const areaLeads = requestsFor(account).length;
    portalStats.innerHTML = [
      statCard('প্রোফাইল ভিউ', toBn(account.views || 0), 'গত ৩০ দিনে'),
      statCard('এলাকার অনুরোধ', toBn(areaLeads), account.upazila ? `${account.upazila} এলাকায়` : 'আপনার এলাকায়'),
      statCard('অবস্থা', 'চলমান', 'যাচাই প্রক্রিয়াধীন'),
      statCard('সদস্যতা', bnDate(account.createdAt), 'আপনার যোগদানের তারিখ'),
    ].join('');
  }

  renderList(account);

  /* profile editor */
  profileName.value = account.name;
  profilePhoneEl.value = account.phone;
  profileAddress.value = account.address || '';
  const isProvider = account.role === 'provider';
  profileServiceField.hidden = !isProvider;
  profileProviderFields.hidden = !isProvider;
  portalVerifyNote.hidden = !isProvider;
  portalViewProfileBtn.hidden = !isProvider;
  if (isProvider) {
    profileService.value = account.service || '';
    profileAvailable.checked = account.available !== false;
    profileCascade.set(account.division, account.district, account.upazila);
    portalViewProfileBtn.href = `service.html?id=${encodeURIComponent(account.id)}`;
  }
  return true;
}

function showDashboard(id) {
  if (!renderDashboard(id)) {
    showGateway();
    return;
  }
  window.scrollTo(0, 0);
}
function showGateway(forceLogin = false) {
  dashboard.hidden = true;
  gateway.hidden = false;
  if (!forceLogin && location.hash === '#signup') openTab('signup', false);
  else openTab('login', false);
}

profileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  ACCOUNTS.ready.then(() => saveProfile(e));
});
function saveProfile(e) {
  const id = getSession();
  const accounts = readAccounts();
  const account = accounts.find((a) => a.id === id);
  if (!account) return;

  const name = profileName.value.trim();
  if (name.length < 2) {
    setFieldState(profileName, true);
    toast('নামটি অন্তত ২ অক্ষরের হতে হবে।', 'error');
    return;
  }
  setFieldState(profileName, false);

  account.name = name;
  account.address = profileAddress.value.trim();
  if (account.role === 'provider') {
    account.service = profileService.value || account.service;
    account.division = $('#profileDivision').value;
    account.district = $('#profileDistrict').value;
    account.upazila  = $('#profileUpazila').value;
    account.available = profileAvailable.checked;
  }
  if (!writeAccounts(accounts)) {
    toast('সংরক্ষণ করা যায়নি — ব্রাউজার স্টোরেজ বন্ধ থাকতে পারে।', 'error');
    return;
  }
  toast('প্রোফাইল সংরক্ষিত হয়েছে!');
  renderDashboard(account.id);
}
profileName.addEventListener('input', () => setFieldState(profileName, false));

$('#portalLogoutBtn').addEventListener('click', () => {
  setSession(null);
  toast('লগআউট করা হয়েছে।');
  /* drop the lingering #signup hash so the login tab shows and stays */
  history.replaceState(null, '', location.pathname);
  showGateway(true);
});

/* ── boot (wait for the file-backed seed before reading accounts) ── */
const whenReady = (fn) => { ACCOUNTS.ready.then(fn); };
whenReady(() => {
  const existing = getSession();
  if (existing && renderDashboard(existing)) {
    /* already logged in */
  } else {
    showGateway();
  }
});

})();
