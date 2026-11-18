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
   SAMPLE DOCTOR DATA (until the backend lands)
   ──────────────────────────────────────────────── */
const DOCTORS = [
  { name: 'ডাঃ নমুনা ১', specialty: 'মেডিসিন বিশেষজ্ঞ', division: 'খুলনা', district: 'সাতক্ষীরা', upazila: 'সাতক্ষীরা সদর' },
  { name: 'ডাঃ নমুনা ২', specialty: 'সার্জারি বিশেষজ্ঞ', division: 'খুলনা', district: 'সাতক্ষীরা', upazila: 'সাতক্ষীরা সদর' },
  { name: 'ডাঃ নমুনা ৩', specialty: 'গাইনি ও প্রসূতি',  division: 'খুলনা', district: 'সাতক্ষীরা', upazila: 'কালিয়ায়' },
  { name: 'ডাঃ নমুনা ৪', specialty: 'শিশু বিশেষজ্ঞ',    division: 'খুলনা', district: 'সাতক্ষীরা', upazila: 'তালা' },
  { name: 'ডাঃ নমুনা ৫', specialty: 'চক্ষু বিশেষজ্ঞ',   division: 'খুলনা', district: 'সাতক্ষীরা', upazila: 'কালিয়ায়' },
  { name: 'ডাঃ নমুনা ৬', specialty: 'দন্ত চিকিৎসক',     division: 'খুলনা', district: 'সাতক্ষীরা', upazila: 'সাতক্ষীরা সদর' }
];

const PIN = '<svg class="doctor-pin" viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="#e11d48" d="M12 2a7.4 7.4 0 0 0-7.4 7.4c0 5.5 7.4 12.6 7.4 12.6s7.4-7.1 7.4-12.6A7.4 7.4 0 0 0 12 2z"/><circle cx="12" cy="9.4" r="2.55" fill="#fff"/></svg>';

/* This page is the doctor service — preselect it so the area-filter form validates */
const preselect = $('#areaService');
if (preselect) preselect.value = 'ডাক্তার পাওয়া';

const doctorGrid  = $('#doctorGrid');
const doctorEmpty = $('#doctorEmpty');
const countBadge  = $('#docCountBadge');

function renderDoctors(list) {
  doctorGrid.innerHTML = list.map(d => `
    <a class="doctor-card" href="service.html" data-upazila="${d.upazila}" aria-label="${d.name} — ${d.specialty}, ${d.upazila} — প্রোফাইল দেখুন">
      <div class="doctor-photo" aria-hidden="true">ন</div>
      <div class="doctor-info">
        <h3 class="doctor-name">${d.name}</h3>
        <p class="doctor-specialty">${d.specialty}</p>
        <p class="doctor-location">${PIN}${d.upazila}</p>
      </div>
    </a>`).join('');
  doctorEmpty.hidden = list.length !== 0;
  countBadge.textContent = `${toBn(list.length)} জন পাওয়া গেছে`;
}
renderDoctors(DOCTORS);

/* ────────────────────────────────────────────────
   AREA FILTER — filter the doctor list on submit
   (main.js emits sheba:filter-applied on this page)
   ──────────────────────────────────────────────── */
document.addEventListener('sheba:filter-applied', (e) => {
  const { division, district, upazila } = e.detail || {};
  const list = DOCTORS.filter(d =>
    d.division === division && d.district === district && (!upazila || d.upazila === upazila)
  );
  renderDoctors(list);
  toast(`${upazila || district || division} এলাকায় ${toBn(list.length)} জন ডাক্তার পাওয়া গেছে।`);
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
  toast(`সেবা বাছাই করা হয়েছে: ${name}`);
  $('#areaFilterForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
})();
