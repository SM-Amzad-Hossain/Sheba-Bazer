/**
 * সেবা বাজার — Sheba Bazer · App logic
 * Navigation · hero carousel · dependent location dropdowns ·
 * services grid · ad carousel · service search with suggestions ·
 * request form (take/give tabs) · counters · auth modal · toast
 */
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const BN_DIGITS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
const toBn = (n) => String(n).split('').map(d => BN_DIGITS[+d] ?? d).join('');

/* smooth-scroll that never throws (e.g. in headless DOM) */
const scrollToEl = (el, options) => { try { el?.scrollIntoView(options); } catch { /* noop */ } };

/* ────────────────────────────────────────────────
   DATA
   ──────────────────────────────────────────────── */
const ICONS = {
  truck:   '<path d="M10 17h4V5H2v12h3"/><path d="M14 8h4l3.2 3.6a2 2 0 0 1 .8 1.6V17h-3"/><circle cx="7.5" cy="17" r="1.8"/><circle cx="16.5" cy="17" r="1.8"/>',
  car:     '<path d="M5 11l1.6-4.4A2 2 0 0 1 8.4 5.4h7.2a2 2 0 0 1 1.9 1.2L19 11"/><path d="M3 11h18"/><path d="M4 11a2 2 0 0 1 2 2v3h1.5M17.5 16H19v-3a2 2 0 0 1 2-2"/><circle cx="7.5" cy="16.5" r="1.9"/><circle cx="16.5" cy="16.5" r="1.9"/><path d="M9.4 16.5h5.2"/>',
  zap:     '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke-linejoin="round"/>',
  ac:      '<rect x="2" y="4" width="20" height="9" rx="2.5"/><path d="M6 9.5h6"/><path d="M7 17l-1.3 3.5M12 17l-1.3 3.5M17 17l-1.3 3.5"/>',
  bricks:  '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 10h18M3 14.8h18M9.5 5v5M15 5v5M6.5 10v4.8M12 10v4.8M17.5 10v4.8M9.5 14.8V19M15 14.8V19"/>',
  building:'<path d="M4 21V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v15"/><path d="M2 21h20"/><path d="M16 10h3.2a1 1 0 0 1 1 1v10"/><path d="M9 21v-4.2h2.6V21"/><path d="M7.6 8.6h1.4M11.4 8.6h1.4M7.6 12.4h1.4M11.4 12.4h1.4"/>',
  hardhat: '<path d="M3 18.5h18"/><path d="M5 18.5a7.2 7.2 0 0 1 4.6-6.7V7.4a1.2 1.2 0 0 1 1.2-1.2h2.4a1.2 1.2 0 0 1 1.2 1.2v4.4a7.2 7.2 0 0 1 4.6 6.7"/><path d="M9 7.2h6"/>',
  scissors:'<circle cx="6" cy="6" r="2.6"/><circle cx="6" cy="18" r="2.6"/><path d="M20 4 8.2 15.8M14.5 14.5 20 20M8.2 8.2 12 12"/>',
  stetho:  '<path d="M5 3v5a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6V3"/><path d="M5 3h2.5M5 3H2.5M16.5 3H19M16.5 3h-2.5"/><path d="M11 14v2.5a5.5 5.5 0 0 0 11 0V14"/><circle cx="22" cy="12" r="2"/>',
  wrench:  '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke-linejoin="round"/>',
  roller:  '<rect x="2" y="3" width="15" height="6" rx="2"/><path d="M17 6h2.4A1.6 1.6 0 0 1 21 7.6v2.4a1.6 1.6 0 0 1-1.6 1.6H11a2 2 0 0 0-2 2v1"/><rect x="7.5" y="15" width="6" height="6" rx="1.4"/>',
  camera:  '<path d="M14.5 4.5h-5L7 7.5H4.2A2.2 2.2 0 0 0 2 9.7v8.6a2.2 2.2 0 0 0 2.2 2.2h15.6a2.2 2.2 0 0 0 2.2-2.2V9.7a2.2 2.2 0 0 0-2.2-2.2H17l-2.5-3z" stroke-linejoin="round"/><circle cx="12" cy="13.6" r="3.6"/>'
};

const SERVICES = [
  { id: 'poribohon',   name: 'পরিবহন',           icon: ICONS.truck,    keywords: ['পরিবহন','transport','ট্রাক','পিকআপ','ভাড়া','গাড়ি ভাড়া'] },
  { id: 'micro-driver',name: 'মাইক্রো ড্রাইভার', icon: ICONS.car,      keywords: ['মাইক্রো','ড্রাইভার','driver','car','গাড়ি','মাইক্রোবাস','প্রাইভেট কার'] },
  { id: 'current',     name: 'কারেন্ট মিস্ত্রি', icon: ICONS.zap,      keywords: ['কারেন্ট','current','বিদ্যুৎ','ইলেকট্রিশিয়ান','electrician','ফ্যান','লাইট','প্লাগ','ঘন্টা'] },
  { id: 'ac',          name: 'এসি মিস্ত্রি',      icon: ICONS.ac,       keywords: ['এসি','ac','air','conditioner','এয়ার','এসি সার্ভিস','এসি মেরামত','ফ্রিজ'] },
  { id: 'nirman-mistri',name:'নির্মাণ মিস্ত্রি',  icon: ICONS.bricks,   keywords: ['নির্মাণ','মিস্ত্রি','রাজমিস্ত্রি','mason','দেওয়াল','ইটের','চুনার'] },
  { id: 'nirman-thikedar',name:'নির্মাণ ঠিকাদার', icon: ICONS.building, keywords: ['ঠিকাদার','contractor','builder','ভবন','বাড়ি নির্মাণ','নির্মাণ'] },
  { id: 'engineer',    name: 'ইঞ্জিনিয়ার',       icon: ICONS.hardhat,  keywords: ['ইঞ্জিনিয়ার','engineer','সাইট','সুপারভাইজার'] },
  { id: 'haircut',     name: 'হেয়ার কাটিং',      icon: ICONS.scissors, keywords: ['হেয়ার','চুল','hair','barber','সেলুন','কাটিং','স্যালোন'] },
  { id: 'doctor',      name: 'ডাক্তার পাওয়া',    icon: ICONS.stetho,   keywords: ['ডাক্তার','doctor','স্বাস্থ্য','চিকিৎসা','নার্স','হাসপাতাল','checkup'] },
  { id: 'plumber',     name: 'প্লাম্বার',         icon: ICONS.wrench,   keywords: ['প্লাম্বার','plumber','পাইপ','পানির','ট্যাপ','বালতি','leak'] },
  { id: 'rang',        name: 'রং মিস্ত্রি',       icon: ICONS.roller,   keywords: ['রং','রঙ','paint','পেইন্ট','রং করা'] },
  { id: 'photographer',name: 'ফটোগ্রাফার',        icon: ICONS.camera,   keywords: ['ফটোগ্রাফার','photographer','ক্যামেরা','camera','ছবি','ভিডিও','wedding'] }
];

const AD_SLIDES = [
  { badge: 'বিজ্ঞাপন', headline: 'আপনার ব্যবসার বিজ্ঞাপন এখানে দিন', sub: 'হাজারো মানুষের কাছে পৌঁছান', cta: 'বিজ্ঞাপন দিন' },
  { badge: 'বিজ্ঞাপন', headline: 'নতুন সেবাটি সবার কাছে পৌঁছে দিন', sub: 'প্রতিদিন ২০০০+ মানুষ সেবা বাজার ভিজিট করেন', cta: 'বিজ্ঞাপন দিন' },
  { badge: 'বিজ্ঞাপন', headline: 'স্থানীয় কাস্টমার সরাসরি আপনার সাথে যোগ দেবেন', sub: 'মাত্র এক ক্লিকে বিজ্ঞাপন চালু করুন', cta: 'বিজ্ঞাপন দিন' }
];

const PARTNERS = [
  { letter: 'এ', name: 'এসপি গোল্ডেন লাইন' },
  { letter: 'স', name: 'সাতক্ষীরী লাইন' },
  { letter: 'ই', name: 'ইমাদ পরিবহন' },
  { letter: 'ট', name: 'টুল্লিপাড়া এক্সপ্রেস' }
];

const FEATURES = [
  { n: '১', title: 'যাচাই করা সেবাদাতা', desc: 'প্রতিটি প্রোফাইল প্রকাশের আগে যাচাই করা হয়।' },
  { n: '২', title: 'সরাসরি যোগাযোগ',      desc: 'সেবাদাতার সাথে সরাসরি ফোনে কথা বলুন।' },
  { n: '৩', title: 'ন্যায্য দাম',          desc: 'মধ্যস্বত্বভোগী নেই, তাই বাড়তি খরচ নেই।' },
  { n: '৪', title: 'সব সেবা এক জায়গায়',  desc: 'মিস্ত্রি থেকে ইঞ্জিনিয়ার পর্যন্ত সবই পাবেন।' }
];

const HERO_SLIDES = [
  { badge: 'বিশ্বস্ত স্থানীয় সেবা', title: 'আপনার দরজায় <span>দক্ষ সেবা</span>', sub: 'মিস্ত্রি, ড্রাইভার, ইলেকট্রিশিয়ান, সবাই এক জায়গায়।', cta: 'সেবা খুঁজুন' },
  { badge: 'আপনার এলাকায়',          title: 'হাতের <span>নাগালেই</span> সব সেবা',   sub: 'ঘরে বসে বুক করুন, সেবাদাতা পৌঁছে যাবেন আপনার দুয়ারে।', cta: 'সেবা খুঁজুন' },
  { badge: 'যাচাই করা সেবাদাতা',     title: '<span>৫০০+</span> বিশ্বস্ত সেবা কর্মী', sub: 'প্রতিটি প্রোফাইল প্রকাশের আগে যাচাই করে নেওয়া হয়।', cta: 'সেবা খুঁজুন' },
  { badge: 'সেবাদাতা হন',            title: 'আপনিও <span>নতুন কাজ</span> পান',      sub: 'বিনামূল্যে নিবন্ধন করুন, সরাসরি গ্রাহকের কাছ থেকে কল পান।', cta: 'সেবা খুঁজুন' }
];

/* ────────────────────────────────────────────────
   TOAST
   ──────────────────────────────────────────────── */
const toastEl = $('#toast');
let toastTimer = null;
function showToast(message, type = 'ok') {
  toastEl.textContent = message;
  toastEl.classList.toggle('is-error', type === 'error');
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 3600);
}

/* ────────────────────────────────────────────────
   HEADER — shadow on scroll + scrollspy
   ──────────────────────────────────────────────── */
const header = $('#siteHeader');
const spyLinks = $$('[data-navspy]');
const spyTargets = { home: $('#home'), services: $('#services'), about: $('#about'), contact: $('#contact') };

function onScroll() {
  header.classList.toggle('is-scrolled', window.scrollY > 12);
  // scrollspy
  let current = 'home';
  for (const key of ['services', 'about', 'contact']) {
    const el = spyTargets[key];
    if (el && el.getBoundingClientRect().top <= 120) current = key;
  }
  spyLinks.forEach(a => a.classList.toggle('is-active', a.dataset.navspy === current));
}
window.addEventListener('scroll', onScroll, { passive: true });

/* ────────────────────────────────────────────────
   MOBILE MENU
   ──────────────────────────────────────────────── */
const hamburger = $('#hamburger');
const mobilePanel = $('#mobilePanel');
function closeMobileMenu() {
  mobilePanel.hidden = true;
  hamburger.setAttribute('aria-expanded', 'false');
}
hamburger.addEventListener('click', () => {
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!expanded));
  mobilePanel.hidden = expanded;
});
$$('.mobile-link', mobilePanel).forEach(a => a.addEventListener('click', closeMobileMenu));
document.addEventListener('click', (e) => {
  if (!mobilePanel.hidden && !mobilePanel.contains(e.target) && !hamburger.contains(e.target)) closeMobileMenu();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobileMenu(); });

/* Blog placeholder links */
$$('[data-blog-link]').forEach(a => a.addEventListener('click', (e) => {
  e.preventDefault();
  closeMobileMenu();
  showToast('ব্লগ বিভাগটি শীঘ্রই যুক্ত হচ্ছে — সাথে থাকুন!');
}));

/* ────────────────────────────────────────────────
   LOCATION CASCADE (shared helper)
   ──────────────────────────────────────────────── */
function fillSelect(select, items, placeholder) {
  select.innerHTML = '';
  const ph = document.createElement('option');
  ph.value = ''; ph.textContent = placeholder;
  select.appendChild(ph);
  for (const item of items) {
    const opt = document.createElement('option');
    opt.value = item; opt.textContent = item;
    select.appendChild(opt);
  }
}

function attachLocationCascade(divisionId, districtId, upazilaId) {
  const divSel = $(divisionId), distSel = $(districtId), upaSel = $(upazilaId);
  const data = window.BANGLADESH_LOCATIONS || [];

  fillSelect(divSel, data.map(d => d.division), divSel.dataset.placeholder || '-- বিভাগ --');

  divSel.addEventListener('change', () => {
    const entry = data.find(d => d.division === divSel.value);
    if (entry) {
      fillSelect(distSel, entry.districts.map(d => d.name), districtPlaceholder(distSel));
      distSel.disabled = false;
    } else {
      distSel.innerHTML = `<option value="">${districtPlaceholder(distSel)}</option>`;
      distSel.disabled = true;
    }
    upaSel.innerHTML = `<option value="">${upazilaPlaceholder(upaSel)}</option>`;
    upaSel.disabled = true;
  });

  distSel.addEventListener('change', () => {
    const division = data.find(d => d.division === divSel.value);
    const district = division?.districts.find(d => d.name === distSel.value);
    if (district) {
      fillSelect(upaSel, district.upazilas, upazilaPlaceholder(upaSel));
      upaSel.disabled = false;
    } else {
      upaSel.innerHTML = `<option value="">${upazilaPlaceholder(upaSel)}</option>`;
      upaSel.disabled = true;
    }
  });

  // placeholders differ between the area card (short) and the form (long)
  function districtPlaceholder(sel) { return sel.dataset.placeholder || '-- জেলা --'; }
  function upazilaPlaceholder(sel) { return sel.dataset.placeholder || '-- উপজেলা --'; }
}

// short placeholders for the hero area card
$('#areaDivision').dataset.placeholder = 'বিভাগ';
$('#areaDistrict').dataset.placeholder = 'জেলা';
$('#areaUpazila').dataset.placeholder  = 'উপজেলা';
$('#fDivision').dataset.placeholder = '-- বিভাগ --';
$('#fDistrict').dataset.placeholder = '-- জেলা --';
$('#fUpazila').dataset.placeholder  = '-- উপজেলা --';

attachLocationCascade('#areaDivision', '#areaDistrict', '#areaUpazila');
attachLocationCascade('#fDivision', '#fDistrict', '#fUpazila');

/* service dropdowns (area card + form) */
const serviceNames = SERVICES.map(s => s.name);
fillSelect($('#areaService'), serviceNames, 'সেবা');
fillSelect($('#fService'), serviceNames, '-- বাছাই করুন --');

/* ────────────────────────────────────────────────
   SERVICES GRID
   ──────────────────────────────────────────────── */
const servicesGrid = $('#servicesGrid');
servicesGrid.innerHTML = SERVICES.map(s => `
  <button class="service-item" role="listitem" data-service="${s.name}" aria-label="${s.name} সেবা নির্বাচন করুন">
    <span class="service-circle">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${s.icon}</svg>
    </span>
    <span class="service-label">${s.name}</span>
  </button>`).join('');

function selectService(name, { scroll = true } = {}) {
  const select = $('#fService');
  select.value = name;
  select.closest('.field')?.classList.remove('has-error');

  $$('.service-item', servicesGrid).forEach(btn => btn.classList.toggle('is-selected', btn.dataset.service === name));

  if (scroll) {
    scrollToEl($('#request'), { behavior: 'smooth', block: 'start' });
    const card = $('#requestCard');
    card.classList.remove('is-pulsing');
    // restart pulse animation
    void card.offsetWidth;
    card.classList.add('is-pulsing');
  }
  showToast(`সেবা নির্বাচিত: ${name}`);
}
servicesGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.service-item');
  if (btn) selectService(btn.dataset.service);
});

/* ────────────────────────────────────────────────
   HERO CAROUSEL
   ──────────────────────────────────────────────── */
const heroCopy = $('.hero-copy');
const heroBadge = $('#heroBadge');
const heroTitle = $('#heroTitle');
const heroSub = $('#heroSub');
const heroCtaText = $('#heroCtaText');
const heroDotsWrap = $('#heroDots');
let heroIndex = 0, heroTimer = null;

heroDotsWrap.innerHTML = HERO_SLIDES.map((_, i) =>
  `<button class="hero-dot${i === 0 ? ' is-active' : ''}" role="tab" aria-label="স্লাইড ${toBn(i + 1)}" data-index="${i}"></button>`
).join('');

function renderHero(i) {
  heroIndex = (i + HERO_SLIDES.length) % HERO_SLIDES.length;
  const slide = HERO_SLIDES[heroIndex];
  heroCopy.classList.add('is-fading');
  setTimeout(() => {
    heroBadge.textContent = slide.badge;
    heroTitle.innerHTML = slide.title;
    heroSub.textContent = slide.sub;
    heroCtaText.textContent = slide.cta;
    heroCopy.classList.remove('is-fading');
  }, 170);
  $$('.hero-dot', heroDotsWrap).forEach((d, j) => d.classList.toggle('is-active', j === heroIndex));
}
function startHeroAutoplay() {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => renderHero(heroIndex + 1), 6500);
}
heroDotsWrap.addEventListener('click', (e) => {
  const dot = e.target.closest('.hero-dot');
  if (!dot) return;
  renderHero(+dot.dataset.index);
  startHeroAutoplay();
});
$('.hero').addEventListener('mouseenter', () => clearInterval(heroTimer));
$('.hero').addEventListener('mouseleave', startHeroAutoplay);
startHeroAutoplay();

$('#heroCta').addEventListener('click', () => {
  scrollToEl($('#area'), { behavior: 'smooth', block: 'center' });
});

/* ────────────────────────────────────────────────
   AREA FILTER FORM
   ──────────────────────────────────────────────── */
$('#areaFilterForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const div = $('#areaDivision').value, dist = $('#areaDistrict').value,
        upa = $('#areaUpazila').value, svc = $('#areaService').value;
  const missing = [];
  if (!div) missing.push('বিভাগ');
  if (!dist) missing.push('জেলা');
  if (!upa) missing.push('উপজেলা');
  if (!svc) missing.push('সেবা');
  if (missing.length) {
    showToast(`অনুগ্রহ করে বেছে নিন: ${missing.join(', ')}`, 'error');
    return;
  }
  // prefill request form
  $('#fDivision').value = div;
  $('#fDivision').dispatchEvent(new Event('change'));
  $('#fDistrict').value = dist;
  $('#fDistrict').dispatchEvent(new Event('change'));
  $('#fUpazila').value = upa;
  selectService(svc, { scroll: true });
});

/* ────────────────────────────────────────────────
   AD CAROUSEL
   ──────────────────────────────────────────────── */
const adTrack = $('#adTrack');
const adDots = $('#adDots');
let adIndex = 0, adTimer = null;

adTrack.innerHTML = AD_SLIDES.map(s => `
  <div class="ad-slide" role="group" aria-roledescription="slide">
    <span class="ad-badge">${s.badge}</span>
    <p class="ad-headline">${s.headline}</p>
    <p class="ad-sub">${s.sub}</p>
    <button class="ad-cta" data-ad-cta>${s.cta}</button>
  </div>`).join('');
adDots.innerHTML = AD_SLIDES.map((_, i) =>
  `<button class="ad-dot${i === 0 ? ' is-active' : ''}" data-index="${i}" aria-label="বিজ্ঞাপন ${toBn(i + 1)}"></button>`
).join('');

function renderAd(i) {
  adIndex = (i + AD_SLIDES.length) % AD_SLIDES.length;
  adTrack.style.transform = `translateX(-${adIndex * 100}%)`;
  $$('.ad-dot', adDots).forEach((d, j) => d.classList.toggle('is-active', j === adIndex));
}
function startAdAutoplay() {
  clearInterval(adTimer);
  adTimer = setInterval(() => renderAd(adIndex + 1), 5000);
}
$('#adPrev').addEventListener('click', () => { renderAd(adIndex - 1); startAdAutoplay(); });
$('#adNext').addEventListener('click', () => { renderAd(adIndex + 1); startAdAutoplay(); });
adDots.addEventListener('click', (e) => {
  const dot = e.target.closest('.ad-dot'); if (!dot) return;
  renderAd(+dot.dataset.index); startAdAutoplay();
});
adTrack.addEventListener('click', (e) => {
  if (e.target.closest('[data-ad-cta]')) {
    setGiveTab(true);
    scrollToEl($('#request'), { behavior: 'smooth' });
    showToast('বিজ্ঞাপনের জন্য "সেবা দিতে চাই" ট্যাবটি খুলে দেওয়া হয়েছে।');
  }
});
startAdAutoplay();

/* ────────────────────────────────────────────────
   TRUSTED PARTNERS
   ──────────────────────────────────────────────── */
$('#partnersRow').innerHTML = PARTNERS.map(p => `
  <button class="partner" aria-label="${p.name}">
    <span class="partner-seal">${p.letter}</span>
    <span class="partner-name">${p.name}</span>
  </button>`).join('');
$('#partnersRow').addEventListener('click', (e) => {
  const btn = e.target.closest('.partner');
  if (btn) showToast(`${btn.getAttribute('aria-label')} — বিশ্বস্ত পরিবহন পার্টনার।`);
});

/* ────────────────────────────────────────────────
   FEATURES (ABOUT)
   ──────────────────────────────────────────────── */
$('#featuresGrid').innerHTML = FEATURES.map(f => `
  <div class="feature-card">
    <span class="feature-num">${f.n}</span>
    <span>
      <span class="feature-title">${f.title}</span>
      <p class="feature-desc">${f.desc}</p>
    </span>
  </div>`).join('');

/* ────────────────────────────────────────────────
   SEARCH WITH LIVE SUGGESTIONS
   ──────────────────────────────────────────────── */
const searchInput = $('#serviceSearch');
const suggestList = $('#suggestList');
const searchBtn = $('#searchBtn');
let suggestIndex = -1;
let currentSuggestions = [];

function findMatches(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SERVICES.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.keywords.some(k => k.toLowerCase().includes(q))
  );
}

function renderSuggestions(list) {
  currentSuggestions = list;
  suggestIndex = -1;
  if (!list.length) {
    suggestList.innerHTML = '<li class="suggest-empty">কোনো মিল পাওয়া যায়নি — নিচের ফর্মে লিখে পাঠিয়ে দিন।</li>';
  } else {
    suggestList.innerHTML = list.map((s, i) => `
      <li><button class="suggest-item" role="option" data-index="${i}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg>
        <span>${s.name}</span>
      </button></li>`).join('');
  }
  suggestList.classList.add('is-open');
  searchInput.setAttribute('aria-expanded', 'true');
}
function closeSuggestions() {
  suggestList.classList.remove('is-open');
  searchInput.setAttribute('aria-expanded', 'false');
  suggestIndex = -1;
}
function highlightSuggestion(idx) {
  const items = $$('.suggest-item', suggestList);
  items.forEach((el, i) => el.classList.toggle('is-active', i === idx));
  if (items[idx]) items[idx].scrollIntoView({ block: 'nearest' });
}

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim();
  if (!q) return closeSuggestions();
  renderSuggestions(findMatches(q));
});
searchInput.addEventListener('keydown', (e) => {
  const items = $$('.suggest-item', suggestList);
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (!suggestList.classList.contains('is-open')) { renderSuggestions(findMatches(searchInput.value)); return; }
    suggestIndex = (suggestIndex + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % Math.max(items.length, 1);
    highlightSuggestion(suggestIndex);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (suggestIndex >= 0 && currentSuggestions[suggestIndex]) {
      selectService(currentSuggestions[suggestIndex].name);
    } else {
      runSearch();
    }
    closeSuggestions();
  } else if (e.key === 'Escape') {
    closeSuggestions();
  }
});
suggestList.addEventListener('click', (e) => {
  const item = e.target.closest('.suggest-item'); if (!item) return;
  const svc = currentSuggestions[+item.dataset.index];
  if (svc) { searchInput.value = svc.name; selectService(svc.name); }
  closeSuggestions();
});
document.addEventListener('click', (e) => { if (!$('#searchBox').contains(e.target)) closeSuggestions(); });

function runSearch() {
  const q = searchInput.value.trim();
  if (!q) { showToast('অনুগ্রহ করে একটি সেবার নাম লিখুন।', 'error'); searchInput.focus(); return; }
  const matches = findMatches(q);
  if (matches.length) {
    selectService(matches[0].name);
  } else {
    showToast('এ ধরনের সেবা পাওয়া যায়নি — ফর্মে লিখে অনুরোধ পাঠিয়ে দিন।', 'error');
    $('#fDetails').value = q;
    scrollToEl($('#request'), { behavior: 'smooth' });
  }
}
searchBtn.addEventListener('click', () => { runSearch(); closeSuggestions(); });

/* ────────────────────────────────────────────────
   TAKE / GIVE TABS
   ──────────────────────────────────────────────── */
const tabTake = $('#tabTake'), tabGive = $('#tabGive');
const fServiceLabel = $('#fServiceLabel'), submitBtn = $('#submitBtn');

function setGiveTab(give) {
  tabTake.classList.toggle('is-active', !give);
  tabGive.classList.toggle('is-active', give);
  tabTake.setAttribute('aria-selected', String(!give));
  tabGive.setAttribute('aria-selected', String(give));
  fServiceLabel.innerHTML = give ? 'আপনি কোন সেবা দিতে চান? <i>*</i>' : 'কোন সেবা দরকার <i>*</i>';
  submitBtn.textContent = give ? 'সেবাদাতা হিসেবে আবেদন পাঠান' : 'সেবার অনুরোধ পাঠান';
}
tabTake.addEventListener('click', () => setGiveTab(false));
tabGive.addEventListener('click', () => setGiveTab(true));
$('#providerRegisterBtn').addEventListener('click', () => {
  setGiveTab(true);
  scrollToEl($('#requestCard'), { behavior: 'smooth', block: 'start' });
  showToast('সেবাদাতা নিবন্ধন ফর্ম প্রস্তুত — তথ্য পূরণ করুন।');
});

/* ────────────────────────────────────────────────
   REQUEST FORM — validation & submit
   ──────────────────────────────────────────────── */
const requestForm = $('#requestForm');
const successPanel = $('#requestSuccess');

function setFieldError(input, hasError) {
  input.closest('.field')?.classList.toggle('has-error', hasError);
  return !hasError;
}
function validatePhone(value) { return /^01[3-9]\d{8}$/.test(value.trim()); }

requestForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#fName'), phone = $('#fPhone'), service = $('#fService'),
        div = $('#fDivision'), dist = $('#fDistrict'), upa = $('#fUpazila');

  let ok = true;
  ok = setFieldError(name, name.value.trim().length < 2) && ok;
  ok = setFieldError(phone, !validatePhone(phone.value)) && ok;
  ok = setFieldError(service, !service.value) && ok;
  ok = setFieldError(div, !div.value) && ok;
  ok = setFieldError(dist, !dist.value) && ok;
  ok = setFieldError(upa, !upa.value) && ok;

  if (!ok) {
    showToast('ফর্মের লাল দাগানো ঘরগুলো সঠিকভাবে পূরণ করুন।', 'error');
    $('.has-error .field-input, .has-error select', requestForm)?.focus();
    return;
  }

  const payload = {
    mode: tabGive.classList.contains('is-active') ? 'provider' : 'customer',
    name: name.value.trim(),
    phone: phone.value.trim(),
    service: service.value,
    location: [div.value, dist.value, upa.value].join(' › '),
    details: $('#fDetails').value.trim(),
    submittedAt: new Date().toISOString()
  };
  try {
    const prev = JSON.parse(localStorage.getItem('shebaBazarRequests') || '[]');
    prev.push(payload);
    localStorage.setItem('shebaBazarRequests', JSON.stringify(prev));
  } catch { /* storage unavailable — non-fatal */ }

  requestForm.hidden = true;
  successPanel.hidden = false;
  showToast('আপনার অনুরোধটি সফলভাবে পাঠানো হয়েছে!');
  scrollToEl(successPanel, { behavior: 'smooth', block: 'center' });
});

$('#successReset').addEventListener('click', () => {
  requestForm.reset();
  $('#fDistrict').disabled = true; $('#fUpazila').disabled = true;
  $$('.field', requestForm).forEach(f => f.classList.remove('has-error'));
  successPanel.hidden = true;
  requestForm.hidden = false;
  setGiveTab(false);
});

/* live re-validation once a field is fixed */
$$('.field-input, select.field-input', requestForm).forEach(el => {
  el.addEventListener('input', () => el.closest('.field')?.classList.remove('has-error'));
  el.addEventListener('change', () => el.closest('.field')?.classList.remove('has-error'));
});

/* ────────────────────────────────────────────────
   STAT COUNTERS
   ──────────────────────────────────────────────── */
const counters = $$('[data-counter]');
const hasIntersectionObserver = 'IntersectionObserver' in window;
const counterObserver = hasIntersectionObserver ? new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    animateCounter(el);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.6 }) : null;

function animateCounter(el) {
  const target = +el.dataset.counter || 0;
  const suffix = el.dataset.suffix || '';
  if (!hasIntersectionObserver) { el.textContent = toBn(target) + suffix; return; }
  const duration = 1600, start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(2, -8 * p);
    el.textContent = toBn(Math.round(target * (p === 1 ? 1 : eased))) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
counters.forEach(el => counterObserver ? counterObserver.observe(el) : animateCounter(el));
setTimeout(() => counters.forEach(animateCounter), 1400); /* safety: never leave ০ */

/* ────────────────────────────────────────────────
   REVEAL ON SCROLL
   ──────────────────────────────────────────────── */
const revealTargets = $$('.service-item, .partner, .feature-card, .stat-card, .request-card, .area-card, .partners-row');
revealTargets.forEach(el => el.classList.add('reveal'));
if (hasIntersectionObserver) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach(el => revealObserver.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('is-visible'));
}
/* safety net: never leave content hidden (e.g. IO never fires) */
setTimeout(() => revealTargets.forEach(el => el.classList.add('is-visible')), 900);

/* ────────────────────────────────────────────────
   AUTH MODAL
   ──────────────────────────────────────────────── */
const authOverlay = $('#authOverlay');
const authTitle = $('#authTitle'), authSub = $('#authSub'), authSubmit = $('#authSubmit');
const authNameField = $('#authNameField'), authName = $('#authName'), authPhone = $('#authPhone');
const authSwitchText = $('#authSwitchText'), authSwitchBtn = $('#authSwitchBtn');
const authForm = $('#authForm');
let authMode = 'login';
let lastFocused = null;

function setAuthMode(mode) {
  authMode = mode;
  const isSignup = mode === 'signup';
  authTitle.textContent = isSignup ? 'সাইন আপ করুন' : 'লগইন করুন';
  authSub.textContent = isSignup ? 'মিনিট খানেকেই নতুন অ্যাকাউন্ট খুলে ফেলুন' : 'আপনার মোবাইল নম্বর দিয়ে সহজেই লগইন করুন';
  authSubmit.textContent = isSignup ? 'অ্যাকাউন্ট খুলুন' : 'লগইন';
  authSwitchText.textContent = isSignup ? 'আগে থেকেই অ্যাকাউন্ট আছে?' : 'নতুন অ্যাকাউন্ট চান?';
  authSwitchBtn.textContent = isSignup ? 'লগইন করুন' : 'সাইন আপ করুন';
  authNameField.hidden = !isSignup;
  authName.required = isSignup;
}
function openAuth(mode) {
  lastFocused = document.activeElement;
  setAuthMode(mode);
  authOverlay.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => authPhone.focus(), 60);
}
function closeAuth() {
  authOverlay.hidden = true;
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}
$$('[data-auth-open]').forEach(btn => btn.addEventListener('click', () => { closeMobileMenu(); openAuth(btn.dataset.authOpen); }));
$('#authClose').addEventListener('click', closeAuth);
authOverlay.addEventListener('click', (e) => { if (e.target === authOverlay) closeAuth(); });
authSwitchBtn.addEventListener('click', () => setAuthMode(authMode === 'login' ? 'signup' : 'login'));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !authOverlay.hidden) closeAuth(); });

authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let ok = true;
  ok = setFieldError(authPhone, !validatePhone(authPhone.value)) && ok;
  if (authMode === 'signup') ok = setFieldError(authName, authName.value.trim().length < 2) && ok;
  if (!ok) { showToast('সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।', 'error'); return; }
  try {
    localStorage.setItem('shebaBazarUser', JSON.stringify({
      mode: authMode, name: authName.value.trim() || 'ব্যবহারকারী', phone: authPhone.value.trim()
    }));
  } catch { /* non-fatal */ }
  closeAuth();
  showToast(authMode === 'login' ? 'লগইন সফল! আবার স্বাগতম।' : 'সাইন আপ সম্পন্ন! সেবা বাজারে স্বাগতম।');
  authForm.reset();
});
$$('.field-input', authForm).forEach(el => el.addEventListener('input', () => el.closest('.field')?.classList.remove('has-error')));

/* ────────────────────────────────────────────────
   FOOTER YEAR (Bengali numerals)
   ──────────────────────────────────────────────── */
$('#footerYear').textContent = toBn(new Date().getFullYear());

/* initial scrollspy state */
onScroll();
