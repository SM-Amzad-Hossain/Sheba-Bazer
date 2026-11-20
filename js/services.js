/**
 * সেবা বাজার — সেবাসমূহ catalog page logic.
 * Renders one card per service (window.shebaServices, filled by main.js);
 * every card deep-links to the provider listing page with ?service=<name>.
 */
'use strict';

(function () {

const $ = (s, c = document) => c.querySelector(s);

const BN_DIGITS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
const toBn = (n) => String(n).split('').map(d => BN_DIGITS[+d] ?? d).join('');

const SERVICES = window.shebaServices || [];

/* one-line Bengali blurb per service (keyed by SERVICES id) */
const SERVICE_DESC = {
  'poribohon':       'ট্রাক, পিকআপ ও গাড়ি ভাড়া — মালামাল এক জায়গা থেকে অন্য জায়গায়।',
  'micro-driver':    'মাইক্রো ও প্রাইভেট কার ড্রাইভার ভাড়া নিন ঘন্টা বা ট্রিপ ভিত্তিতে।',
  'current':         'বিদ্যুৎ লাইন, ফ্যান–লাইট ও সকেট মেরামতের কাজ।',
  'ac':              'এসি সার্ভিস, গ্যাস রিফিল, মেরামত ও নতুন ইনস্টলেশন।',
  'nirman-mistri':   'রাজমিস্ত্রি — দেওয়াল, প্লাস্টার, ইট-সুড়কি ও টাইলস কাজ।',
  'nirman-thikedar': 'বাড়ি নির্মাণ ও রিনোভেশনের ঠিকাদারি — হাল থেকে শেষ।',
  'engineer':        'সাইট ইঞ্জিনিয়ার ও ডিজাইন পরামর্শ — সঠিক মাপ, নিরাপদ ভিত।',
  'haircut':         'ঘরে গিয়ে বা সেলুনে — হেয়ার কাটিং ও স্পা সেবা।',
  'doctor':          'মেডিসিন, সার্জারি, গাইনি, শিশু — অভিজ্ঞ ডাক্তারদের সাথে সরাসরি।',
  'plumber':         'পাইপ, ট্যাপ, বেসিন ও পানির লাইনের সব সমাধান।',
  'rang':            'বাড়ি-ঘর রঙ, পুটি ও ফাইনফিনিশিং — রং মিস্ত্রি।',
  'photographer':    'ওয়েডিং, ইভেন্ট, প্রোডাক্ট ফটোগ্রাফি ও ভিডিওগ্রাফি।',
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

const grid = $('#catalogGrid');
const countBadge = $('#svcCatalogCount');

if (countBadge) countBadge.textContent = `${toBn(SERVICES.length)} টি সেবা উপলব্ধ`;

if (grid) {
  grid.innerHTML = SERVICES.map((s) => `
  <a class="catalog-card" role="listitem" href="providers.html?service=${encodeURIComponent(s.name)}" aria-label="${esc(s.name)} — সেবাদাতা দেখুন">
    <span class="catalog-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg>
    </span>
    <span class="catalog-body">
      <span class="catalog-name">${esc(s.name)}</span>
      <span class="catalog-desc">${esc(SERVICE_DESC[s.id] || 'সরাসরি ফোন করে কথা বলুন।')}</span>
      <span class="catalog-cta">সেবাদাতা দেখুন
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
      </span>
    </span>
  </a>`).join('');
}

})();
