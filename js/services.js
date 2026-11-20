/**
 * সেবা বাজার — Services page logic (ডাক্তার পাওয়া).
 * Renders the doctor cards, wires the area-filter card (filters the list),
 * the ad banner carousel and the "অন্যান্য সেবা" quick-pick row.
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

const areaServiceSelect = $('#areaService');
/* This page defaults to the doctor service — preselect it so the area-filter form validates */
if (areaServiceSelect) areaServiceSelect.value = 'ডাক্তার পাওয়া';

const doctorGrid  = $('#doctorGrid');
const doctorEmpty = $('#doctorEmpty');
const countBadge  = $('#docCountBadge');
const listTitle   = $('#svcListTitle');

const state = { service: 'ডাক্তার পাওয়া', division: '', district: '', upazila: '' };

const currentServiceName = () => areaServiceSelect?.value || 'ডাক্তার পাওয়া';
const listTitleFor = (svc) => (svc === 'ডাক্তার পাওয়া' ? 'আপনার এলাকার বিশেষজ্ঞ ডাঃ' : `আপনার এলাকার ${svc}`);

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
}

/* re-render on page load with the preselected category */
renderProviders();

/* pick another সেবা — re-filter immediately (the form submit path also covers the area card) */
areaServiceSelect?.addEventListener('change', () => {
  state.service = currentServiceName();
  renderProviders();
});

/* ────────────────────────────────────────────────
   AREA FILTER — filter the doctor list on submit
   (main.js emits sheba:filter-applied on this page)
   ──────────────────────────────────────────────── */
document.addEventListener('sheba:filter-applied', (e) => {
  const { division, district, upazila, service } = e.detail || {};
  state.service = service || state.service;
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
const OTHER_SERVICES = (window.shebaServices || []).filter(s => s.id !== 'doctor');

otherGrid.innerHTML = OTHER_SERVICES.map(s => `
  <button class="svc-other-item" type="button" data-service="${s.name}" aria-label="${s.name} — এই সেবাটি বেছে নিন">
    <span class="svc-other-circle">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${s.icon}</svg>
    </span>
    <span class="svc-other-label">${s.name}</span>
  </button>`).join('');

otherGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.svc-other-item');
  if (!btn) return;
  const name = btn.dataset.service;
  const serviceSelect = $('#areaService');
  if (serviceSelect) serviceSelect.value = name;
  state.service = name;
  renderProviders();
  toast(`সেবা বাছাই করা হয়েছে: ${name}`);
  $('#areaFilterForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
})();
