/**
 * সেবা বাজার — Providers listing logic (per-service provider cards).
 * Renders the provider cards, wires the area-filter card (filters the list),
 * the ad banner carousel and the "অন্যান্য সেবা" quick-pick row.
 * The service is chosen by ?service=<name> (from the সেবাসমূহ grid) — defaults to ডাক্তার পাওয়া.
 * Depends on main.js having run first (window.shebaServices / shebaAdSlides / shebaToast).
 */
'use strict';

(function () {

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const BN_DIGITS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
const toBn = (n) => String(n).split('').map(d => BN_DIGITS[+d] ?? d).join('');
const toast = (msg, type) => (window.shebaToast ? window.shebaToast(msg, type) : undefined);

/* ────────────────────────────────────────────────
   PROVIDERS — dynamic, from the shared account store
   (shebaBazarAccounts · role=provider · available only).
   Category = সেবা select; area = বিভাগ/জেলা/উপজেলা filter.
   ──────────────────────────────────────────────── */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

const PIN = '<svg class="doctor-pin" viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="#e11d48" d="M12 2a7.4 7.4 0 0 0-7.4 7.4c0 5.5 7.4 12.6 7.4 12.6s7.4-7.1 7.4-12.6A7.4 7.4 0 0 0 12 2z"/><circle cx="12" cy="9.4" r="2.55" fill="#fff"/></svg>';
const ACCOUNTS = window.shebaAccounts;

const SERVICES = window.shebaServices || [];
const DEFAULT_SERVICE = 'ডাক্তার পাওয়া';

/* per-service hero copy (keyed by SERVICES id) */
const SERVICE_SUB = {
  'poribohon':       'পরিবহন ও লজিস্টিক সেবা — সরাসরি ফোনে কথা বলুন।',
  'micro-driver':    'মাইক্রো ড্রাইভার ও গাড়ি ভাড়া সেবা — সরাসরি যোগাযোগ করুন।',
  'current':         'বিদ্যুৎ মেরামত ও ইনস্টলেশন — অভিজ্ঞ ইলেকট্রিশিয়ান পান।',
  'ac':              'এসি সার্ভিস, মেরামত ও ইনস্টলেশন — অভিজ্ঞ মিস্ত্রি পান।',
  'nirman-mistri':   'বাড়ি নির্মাণ ও মেরামতের অভিজ্ঞতাসম্পন্ন রাজমিস্ত্রি।',
  'nirman-thikedar': 'নির্মাণ ঠিকাদারি সেবা — সরাসরি কথা বলে কাজ ঠিক করুন।',
  'engineer':        'ইঞ্জিনিয়ারিং পরামর্শ ও সাইট সেবা।',
  'haircut':         'সেলুন ও হেয়ার কাটিং — আপনার এলাকায় দক্ষ হেয়ারকাটার।',
  'doctor':          'বিশেষজ্ঞ ডাক্তার ও চিকিৎসা সেবা। পছন্দের জনকে সরাসরি ফোন করে কথা বলুন।',
  'plumber':         'পাইপ, ট্যাপ ও পানির লাইনে দ্রুত সমাধান — প্লাম্বার পান সহজে।',
  'rang':            'বাড়ি-ঘর রঙ ও ফিনিশিং — রং মিস্ত্রি পান সহজে।',
  'photographer':    'ওয়েডিং, ইভেন্ট ও প্রোডাকশন ফটোগ্রাফি সেবা।',
};

const byName = (name) => SERVICES.find((s) => s.name === name) || null;

const areaServiceSelect = $('#areaService');
const svcTitle = $('#svcTitle'), svcSub = $('#svcSub'), crumbService = $('#crumbService'),
      svcHeadIcon = $('#svcHeadIcon');

const doctorGrid  = $('#doctorGrid');
const doctorEmpty = $('#doctorEmpty');
const countBadge  = $('#docCountBadge');
const listTitle   = $('#svcListTitle');

const state = { service: DEFAULT_SERVICE, division: '', district: '', upazila: '' };

const listTitleFor = (svc) => (svc === 'ডাক্তার পাওয়া' ? 'আপনার এলাকার বিশেষজ্ঞ ডাঃ' : `আপনার এলাকার ${svc}`);

function applyService(name) {
  const hit = byName(name);
  const service = hit ? hit.name : DEFAULT_SERVICE;
  state.service = service;
  if (areaServiceSelect && areaServiceSelect.value !== service) areaServiceSelect.value = service;
  if (svcTitle) svcTitle.textContent = service;
  if (svcSub) svcSub.textContent = SERVICE_SUB[hit ? hit.id : 'doctor'] || `${service} — সরাসরি ফোনে কথা বলুন।`;
  if (crumbService) crumbService.textContent = service;
  if (svcHeadIcon && hit) {
    svcHeadIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${hit.icon}</svg>`;
  }
  document.title = `${service} | সেবা বাজার — আপনার এলাকার সেবাদাতা`;
}

const currentServiceName = () => areaServiceSelect?.value || DEFAULT_SERVICE;

function visibleProviders() {
  const all = ACCOUNTS ? ACCOUNTS.listOpenProviders() : [];
  return all.filter((a) =>
    a.service === state.service
    && (!state.division || a.division === state.division)
    && (!state.district || a.district === state.district)
    && (!state.upazila || a.upazila === state.upazila)
  );
}

function renderProviders() {
  const list = visibleProviders();
  doctorGrid.innerHTML = list.map((a) => `
    <a class="doctor-card" href="service.html?id=${encodeURIComponent(a.id)}" data-upazila="${esc(a.upazila)}" aria-label="${esc(a.name)} — ${esc(a.service)}, ${esc(a.upazila)} — প্রোফাইল দেখুন">
      <div class="doctor-photo" aria-hidden="true">${esc((a.name.trim()[0] || 'স').toUpperCase())}</div>
      <div class="doctor-info">
        <h3 class="doctor-name">${esc(a.name)}</h3>
        <p class="doctor-specialty">${esc(a.service)}</p>
        <p class="doctor-location">${PIN}${esc(a.upazila)}</p>
      </div>
    </a>`).join('');
  doctorEmpty.hidden = list.length !== 0;
  doctorEmpty.textContent = `এই এলাকায় কোনো ${state.service} সেবাদাতা পাওয়া যায়নি — নিচের ফর্মে অনুরোধ পাঠিয়ে দিন।`;
  countBadge.textContent = `${toBn(list.length)} জন পাওয়া গেছে`;
  if (listTitle) listTitle.textContent = listTitleFor(state.service);
  /* refresh the "অন্যান্য সেবা" quick-pick row (current service removed) */
  renderOtherServices();
}

function renderOtherServices() {
  const grid = $('#svcOtherGrid');
  if (!grid) return;
  const others = SERVICES.filter((s) => s.name !== state.service);
  grid.innerHTML = others.map((s) => `
    <button class="svc-other-item" type="button" data-service="${s.name}" aria-label="${s.name} — এই সেবাটি বেছে নিন">
      <span class="svc-other-circle">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${s.icon}</svg>
      </span>
      <span class="svc-other-label">${s.name}</span>
    </button>`).join('');
}

/* boot: pick up ?service=<name> (deep-link from the সেবাসমূহ grid) — default doctor service */
const params = new URLSearchParams(location.search);
const wanted = params.get('service');
const startService = byName(wanted || '') ? wanted : DEFAULT_SERVICE;
applyService(startService);

/* re-render on page load with the chosen category */
renderProviders();
/* …and again once the file-backed seed (account_db.txt) has landed */
if (ACCOUNTS?.ready) ACCOUNTS.ready.then(renderProviders);

/* pick another সেবা — re-filter immediately (hero copy + list update together) */
areaServiceSelect?.addEventListener('change', () => {
  applyService(currentServiceName());
  renderProviders();
});

/* ────────────────────────────────────────────────
   AREA FILTER — filter the doctor list on submit
   (main.js emits sheba:filter-applied on this page)
   ──────────────────────────────────────────────── */
document.addEventListener('sheba:filter-applied', (e) => {
  const { division, district, upazila, service } = e.detail || {};
  if (service) applyService(service);
  state.division = division || '';
  state.district = district || '';
  state.upazila = upazila || '';
  const list = visibleProviders();
  renderProviders();
  toast(`${upazila || district || division} এলাকায় ${toBn(list.length)} জন ${state.service} সেবাদাতা পাওয়া গেছে।`);
  $('.svc-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ────────────────────────────────────────────────
   AD BANNER — fade carousel (prev / next)
   ──────────────────────────────────────────────── */
const AD_SLIDES = window.shebaAdSlides || [
  { badge: 'বিজ্ঞাপন', headline: 'আপনার ব্যবসার বিজ্ঞাপন এখানে দিন', sub: 'হাজারো মানুষের কাছে পৌঁছান', cta: 'বিজ্ঞাপন দিন' }
];
const adBadge = $('#svcAdBadge'), adHeadline = $('#svcAdHeadline'),
      adSub = $('#svcAdSub'), adBtn = $('#svcAdCta'),
      adEl = $('.svc-ad');
let adIndex = 0, adTimer = null;

function renderAd(i) {
  adIndex = (i + AD_SLIDES.length) % AD_SLIDES.length;
  adEl.classList.add('is-switching');
  setTimeout(() => {
    const s = AD_SLIDES[adIndex];
    adBadge.textContent = s.badge;
    adHeadline.textContent = s.headline;
    adSub.textContent = s.sub;
    adBtn.textContent = s.cta;
    adEl.classList.remove('is-switching');
  }, 160);
}
function startAdAutoplay() {
  clearInterval(adTimer);
  adTimer = setInterval(() => renderAd(adIndex + 1), 5000);
}
$('#svcAdPrev').addEventListener('click', () => { renderAd(adIndex - 1); startAdAutoplay(); });
$('#svcAdNext').addEventListener('click', () => { renderAd(adIndex + 1); startAdAutoplay(); });
adBtn.addEventListener('click', () => toast('বিজ্ঞাপনের জন্য কল করুন: ০১XXX-XXXXXX'));
startAdAutoplay();

/* ────────────────────────────────────────────────
   অন্যান্য সেবা — quick-pick sets the area-card service
   ──────────────────────────────────────────────── */
const otherGrid = $('#svcOtherGrid');

otherGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.svc-other-item');
  if (!btn) return;
  const name = btn.dataset.service;
  applyService(name);
  renderProviders();
  toast(`সেবা বাছাই করা হয়েছে: ${name}`);
  $('#areaFilterForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
})();
