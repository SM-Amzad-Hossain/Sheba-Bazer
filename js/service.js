/**
 * সেবা বাজার — Single provider page logic (service.html · ডাঃ নমুনা ১)
 * Share · copy number · review form (localStorage-backed aggregate).
 * Depends on main.js (window.shebaToast).
 */
'use strict';

(function () {
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const toast = (msg, type) => (window.shebaToast ? window.shebaToast(msg, type) : undefined);

  const BN_DIGITS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  const toBn = (n) => String(n).split('').map(d => BN_DIGITS[+d] ?? d).join('');

  /* ────────────────────────────────────────────────
     SHARE + COPY NUMBER
     ──────────────────────────────────────────────── */
  const shareBtn = $('#shareBtn');
  if (shareBtn) shareBtn.addEventListener('click', async () => {
    const data = { title: document.title, text: 'সেবা বাজারে ডাঃ নমুনা ১ (মেডিসিন বিশেষজ্ঞ, সাতক্ষীরা সদর) দেখুন।', url: location.href };
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
    try {
      await navigator.clipboard.writeText('০১XXX-XXXXXX');
      toast('নম্বর কপি করা হয়েছে!');
    } catch {
      toast('কপি করা যায়নি — আবার চেষ্টা করুন।', 'error');
    }
  });

  /* ────────────────────────────────────────────────
     REVIEWS — localStorage-backed aggregate (per provider)
     ──────────────────────────────────────────────── */
  const STORE_KEY = 'shebaBazarReviews:doctor-1';
  const loadReviews = () => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch { return []; }
  };
  const saveReviews = (list) => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch { /* non-fatal */ }
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

  renderAggregate();
  paintRateInput();
})();
