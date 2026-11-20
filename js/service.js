/**
 * সেবা বাজার — Single provider page logic (service.html?id=<provider account id>)
 * Renders the provider from the shared account store (js/accounts.js) —
 * name, service category, area, phone (tel:/wa.me/copy), member since,
 * same-service providers — then share · review form (per-provider localStorage aggregate).
 * Depends on main.js (window.shebaToast) and accounts.js.
 */
'use strict';

(function () {
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const toast = (msg, type) => (window.shebaToast ? window.shebaToast(msg, type) : undefined);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

  const BN_DIGITS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  const toBn = (n) => String(n).split('').map(d => BN_DIGITS[+d] ?? d).join('');

  /* ────────────────────────────────────────────────
     RESOLVE + RENDER the provider from the account store
     ──────────────────────────────────────────────── */
  const ACCOUNTS = window.shebaAccounts;
  const params = new URLSearchParams(location.search);
  const wantedId = params.get('id');
  const storeReady = ACCOUNTS?.ready || Promise.resolve();

  function bnDate(iso) {
    try {
      return new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
    } catch { return new Date(iso).toLocaleDateString(); }
  }
  const displayPhone = (p) => (p ? toBn(p) : '—');
  const areaLine = (a) => [a.upazila, a.district, a.division ? a.division + ' বিভাগ' : ''].filter(Boolean).join(', ');

  function renderProvider(a) {
    const letter = (a.name.trim()[0] || 'স').toUpperCase();
    $('#spLetter').textContent = letter;
    $('#spName').textContent = a.name;
    $('#spSpec').textContent = `${a.service}${a.address ? ' · ' + a.address : ''}`;
    $('#spServiceChip').textContent = a.service;
    $('#spAreaChip').textContent = a.upazila || '—';
    $('#spCrumbName').textContent = a.name;
    const crumbSvc = $('#spCrumbService');
    crumbSvc.textContent = a.service;
    crumbSvc.href = 'providers.html?service=' + encodeURIComponent(a.service);
    $('#spInfoPhone').textContent = displayPhone(a.phone);
    $('#spAddress').textContent = a.address || areaLine(a) || 'ঠিকানা যুক্ত করা হয়নি';
    $('#spMemberSince').textContent = a.createdAt ? bnDate(a.createdAt) : '—';
    $('#spTagRow').innerHTML = `<span class="sp-tag">${esc(a.service)}</span><span class="sp-tag">আপনার এলাকার সেবাদাতা</span>${a.upazila ? `<span class="sp-tag">${esc(a.upazila)}</span>` : ''}`;
    $('#spPriceName').textContent = a.service;
    $('#spPhoneBig').textContent = displayPhone(a.phone);
    const tel = `tel:${a.phone}`, wa = `https://wa.me/88${a.phone}`;
    $$('.spTel').forEach((el) => { el.setAttribute('href', tel); });
    $$('.spWa').forEach((el) => { el.setAttribute('href', wa); });
    document.title = `${a.name} — ${a.service} | সেবা বাজার`;

    /* same-service providers (pills) */
    const others = (ACCOUNTS?.listOpenProviders() || []).filter((p) => p.id !== a.id && p.service === a.service);
    const othersWrap = $('#spOthers');
    if (othersWrap) {
      othersWrap.innerHTML = others.map((p) => `<a class="sp-other-pill" href="service.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a>`).join('');
      const card = $('#spOthersCard');
      if (card) card.hidden = others.length === 0;
    }
  }

  function renderNotFound() {
    $('#spName').textContent = 'সেবাদাতাটি খুঁজে পাওয়া যায়নি';
    $('#spSpec').textContent = 'লিংকটি আবার যাচাই করুন, অথবা সেবাসমূহ পেজ থেকে খুঁজে নিন।';
    $('#spCrumbName').textContent = 'পাওয়া যায়নি';
    $('#spLetter').textContent = '?';
    ['.sp-chips', '.sp-actions', '.sp-side', '.sp-mobile-cta', '#spOthersCard'].forEach((sel) => {
      $$(sel).forEach((el) => { el.hidden = true; });
    });
    $$('.sp-card').forEach((el, i) => { if (i > 0) el.hidden = true; });
    document.title = 'সেবাদাতা পাওয়া যায়নি | সেবা বাজার';
  }

  let active = null;
  storeReady.then(() => {
    const provider = wantedId
      ? (ACCOUNTS?.getAccount(wantedId) || null)
      : (ACCOUNTS?.listOpenProviders()[0] || null);
    active = (provider && provider.role === 'provider') ? provider : null;
    if (active) renderProvider(active); else renderNotFound();
    renderAggregate();
  });

  /* ────────────────────────────────────────────────
     SHARE + COPY NUMBER
     ──────────────────────────────────────────────── */
  const shareBtn = $('#shareBtn');
  if (shareBtn) shareBtn.addEventListener('click', async () => {
    const shareText = active
      ? `সেবা বাজারে ${active.name} (${active.service}, ${active.upazila || 'আপনার এলাকা'}) দেখুন।`
      : 'সেবা বাজারে এই সেবাদাতাকে দেখুন।';
    const data = { title: document.title, text: shareText, url: location.href };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      throw new Error('no web share');
    } catch {
      try {
        await navigator.clipboard.writeText(data.url);
        toast('লিংক কপি করা হয়েছে!');
      } catch {
        toast('শেয়ার করা যায়নি — আবার চেষ্টা করুন।', 'error');
      }
    }
  });

  const copyBtn = $('#copyNumberBtn');
  if (copyBtn) copyBtn.addEventListener('click', async () => {
    if (!active) { toast('নম্বর পাওয়া যায়নি।', 'error'); return; }
    try {
      await navigator.clipboard.writeText(active?.phone || '');
      toast('নম্বর কপি করা হয়েছে!');
    } catch {
      toast('কপি করা যায়নি — আবার চেষ্টা করুন।', 'error');
    }
  });

  /* ────────────────────────────────────────────────
     REVIEWS — localStorage-backed aggregate (per provider)
     ──────────────────────────────────────────────── */
  const STORE_KEY = () => `shebaBazarReviews:${active ? active.id : 'unknown'}`;
  const loadReviews = () => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY()) || '[]'); } catch { return []; }
  };
  const saveReviews = (list) => {
    try { localStorage.setItem(STORE_KEY(), JSON.stringify(list)); } catch { /* non-fatal */ }
  };

  const ratingBig    = $('#ratingBig');
  const ratingBarFill= $('#ratingBarFill');
  const ratingStars  = $('#ratingStars');
  const reviewCount  = $('#reviewCount');
  const reviewEmpty  = $('#reviewEmpty');
  const ratingBars   = $('#ratingBars');
  const rateInput    = $('#rateInput');

  function starString(filled) {
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
  }

  function renderAggregate() {
    const reviews = loadReviews();
    const n = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const avg = n ? sum / n : 0;
    const rounded = Math.round(avg);

    ratingBig.textContent = toBn(avg.toFixed(1));          // e.g. ০.০ / ৪.৩
    ratingBarFill.style.width = `${(avg / 5) * 100}%`;
    ratingStars.textContent = starString(rounded);
    reviewCount.textContent = `${toBn(n)}টি রিভিউ`;
    reviewEmpty.hidden = n !== 0;

    const counts = [0, 0, 0, 0, 0]; // index 0 = ১★ … index 4 = ৫★
    reviews.forEach(r => { const i = Math.min(Math.max((r.rating || 1) - 1, 0), 4); counts[i]++; });
    const max = Math.max(...counts, 1);
    ratingBars.innerHTML = [5, 4, 3, 2, 1].map(star => {
      const c = counts[star - 1];
      return `<div class="bar-row"><span class="bar-label">${toBn(star)}★</span><span class="bar-track"><span class="bar-fill" style="width:${(c / max) * 100}%"></span></span><span class="bar-count">${toBn(c)}</span></div>`;
    }).join('');
  }

  /* star rating input (1–5) */
  let chosenRating = 0;
  rateInput.innerHTML = Array.from({ length: 5 }, (_, i) => {
    const v = i + 1;
    return `<button type="button" class="rate-star" data-value="${v}" role="radio" aria-checked="false" aria-label="${toBn(v)} তারকা">★</button>`;
  }).join('');

  function paintRateInput() {
    $$('.rate-star', rateInput).forEach(btn => {
      const filled = +btn.dataset.value <= chosenRating;
      btn.classList.toggle('is-filled', filled);
      btn.setAttribute('aria-checked', String(+btn.dataset.value === chosenRating));
    });
  }
  rateInput.addEventListener('click', (e) => {
    const btn = e.target.closest('.rate-star');
    if (!btn) return;
    chosenRating = +btn.dataset.value;
    paintRateInput();
  });
  rateInput.addEventListener('mouseover', (e) => {
    const btn = e.target.closest('.rate-star');
    if (!btn) return;
    const hover = +btn.dataset.value;
    $$('.rate-star', rateInput).forEach(b => b.classList.toggle('is-filled', +b.dataset.value <= hover));
  });
  rateInput.addEventListener('mouseleave', paintRateInput);

  const reviewForm = $('#reviewForm');
  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (chosenRating < 1) {
      toast('আগে তারকা রেটিং বেছে নিন।', 'error');
      return;
    }
    const name = $('#reviewName').value.trim();
    const text = $('#reviewText').value.trim();
    const reviews = loadReviews();
    reviews.push({ name: name || 'অজ্ঞাত', text, rating: chosenRating, at: new Date().toISOString() });
    saveReviews(reviews);
    renderAggregate();
    reviewForm.reset();
    chosenRating = 0;
    paintRateInput();
    toast('আপনার রিভিউটি জমা হয়েছে — ধন্যবাদ!');
  });

  paintRateInput();
})();
