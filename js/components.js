/**
 * সেবা বাজার — Shared layout components.
 * THE single source of truth for the site header & footer (+ auth modal & toast).
 * Included identically on every page:
 *
 *   <div id="app-header"></div>
 *   <main>…</main>
 *   <div id="app-footer"></div>
 *   <script src="js/components.js"></script>
 *   <script src="js/main.js"></script>
 *
 * components.js must load BEFORE main.js (main.js wires up #siteHeader etc.).
 */
window.SHEBA_BAZER_HEADER = `<!-- ══════════ HEADER ══════════ -->
<header class="site-header" id="siteHeader">
  <div class="container header-inner">
    <a class="logo" href="#home" aria-label="সেবা বাজার — হোম">
      <!-- Brand mark: green shopping bag with white "সেবা", orange speed-lines + swoosh -->
      <svg class="logo-mark" viewBox="0 0 124 148" role="img" aria-label="সেবা বাজার লোগো" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bagGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#17A95B"/>
            <stop offset=".55" stop-color="#0E8F4C"/>
            <stop offset="1" stop-color="#0B6E3C"/>
          </linearGradient>
        </defs>
        <!-- orange speed lines -->
        <g stroke="#F58634" stroke-width="6" stroke-linecap="round">
          <line x1="4"  y1="52" x2="28" y2="46"/>
          <line x1="1"  y1="66" x2="26" y2="62"/>
          <line x1="6"  y1="80" x2="24" y2="78"/>
        </g>
        <!-- bag body -->
        <path d="M30 40 L92 40 L101 96 Q101 104 93 104 L29 104 Q21 104 21 96 Z"
              fill="url(#bagGrad)" stroke="#0A5B32" stroke-width="7" stroke-linejoin="round"/>
        <!-- handle -->
        <path d="M44 40 C44 21 52 12 61 12 C70 12 79 21 79 40"
              fill="none" stroke="#0A5B32" stroke-width="8" stroke-linecap="round"/>
        <!-- word inside bag -->
        <text x="61" y="88" text-anchor="middle" font-family="'Baloo Da 2','Hind Siliguri',sans-serif" font-weight="800" font-size="33" fill="#FFFFFF" stroke="#0A5B32" stroke-width="1.4" stroke-linejoin="round">সেবা</text>
        <!-- orange swoosh across the bag -->
        <path d="M24 98 C46 106 82 100 108 72" fill="none" stroke="#F58634" stroke-width="6" stroke-linecap="round"/>
        <!-- বাজার -->
        <text x="62" y="132" text-anchor="middle" font-family="'Baloo Da 2','Hind Siliguri',sans-serif" font-weight="800" font-size="33" fill="#0A5B32">বাজার</text>
        <path d="M22 142 C48 149 80 147 106 128" fill="none" stroke="#F58634" stroke-width="5.5" stroke-linecap="round"/>
      </svg>
    </a>

    <nav class="desktop-nav" aria-label="প্রধান নেভিগেশন">
      <a href="#home" class="nav-link is-active" data-navspy="home">হোম</a>
      <a href="#services" class="nav-link" data-navspy="services">সেবাসমূহ</a>
      <a href="#" class="nav-link" data-blog-link>ব্লগ</a>
      <a href="#about" class="nav-link" data-navspy="about">আমাদের সম্পর্কে</a>
      <a href="#contact" class="nav-link" data-navspy="contact">যোগাযোগ</a>
    </nav>

    <div class="header-actions">
      <button class="btn btn-outline btn-sm" data-auth-open="login">লগইন</button>
      <button class="btn btn-solid btn-sm" data-auth-open="signup">সাইন আপ</button>
      <button class="hamburger" id="hamburger" aria-label="মেনু টগল করুন" aria-expanded="false" aria-controls="mobilePanel">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>

  <!-- Mobile dropdown panel -->
  <div class="mobile-panel" id="mobilePanel" hidden>
    <nav class="container mobile-nav" aria-label="মোবাইল নেভিগেশন">
      <a href="#home" class="mobile-link">হোম</a>
      <a href="#services" class="mobile-link">সেবাসমূহ</a>
      <a href="#" class="mobile-link" data-blog-link>ব্লগ</a>
      <a href="#about" class="mobile-link">আমাদের সম্পর্কে</a>
      <a href="#contact" class="mobile-link">যোগাযোগ</a>
      <div class="mobile-auth">
        <button class="btn btn-outline" data-auth-open="login">লগইন</button>
        <button class="btn btn-solid" data-auth-open="signup">সাইন আপ</button>
      </div>
    </nav>
  </div>
</header>`;

window.SHEBA_BAZER_FOOTER = `<!-- ══════════ FOOTER ══════════ -->
<footer class="site-footer" id="contact">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a class="logo logo--footer" href="#home" aria-label="সেবা বাজার">
        <svg class="logo-mark" viewBox="0 2 124 108" role="img" aria-label="সেবা বাজার লোগো" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bagGradFooter" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#17A95B"/><stop offset=".55" stop-color="#0E8F4C"/><stop offset="1" stop-color="#0B6E3C"/>
            </linearGradient>
          </defs>
          <g stroke="#F58634" stroke-width="6" stroke-linecap="round">
            <line x1="4"  y1="52" x2="28" y2="46"/><line x1="1"  y1="66" x2="26" y2="62"/><line x1="6"  y1="80" x2="24" y2="78"/>
          </g>
          <path d="M30 40 L92 40 L101 96 Q101 104 93 104 L29 104 Q21 104 21 96 Z" fill="url(#bagGradFooter)" stroke="#0A5B32" stroke-width="7" stroke-linejoin="round"/>
          <path d="M44 40 C44 21 52 12 61 12 C70 12 79 21 79 40" fill="none" stroke="#0A5B32" stroke-width="8" stroke-linecap="round"/>
          <text x="61" y="88" text-anchor="middle" font-family="'Baloo Da 2','Hind Siliguri',sans-serif" font-weight="800" font-size="33" fill="#FFFFFF" stroke="#0A5B32" stroke-width="1.4" stroke-linejoin="round">সেবা</text>
          <path d="M24 98 C46 106 82 100 108 72" fill="none" stroke="#F58634" stroke-width="6" stroke-linecap="round"/>
        </svg>
        <span class="footer-brand-text">সেবা বাজার</span>
      </a>
      <p class="footer-tagline">আপনার এলাকার দক্ষ সেবাদাতা এক জায়গায়।</p>
    </div>

    <nav class="footer-col" aria-label="দ্রুত লিংক">
      <h3 class="footer-heading">দ্রুত লিংক</h3>
      <a href="#home" class="footer-link">হোম</a>
      <a href="#services" class="footer-link">সেবাসমূহ</a>
      <a href="#" class="footer-link" data-blog-link>ব্লগ</a>
      <a href="#about" class="footer-link">আমাদের সম্পর্কে</a>
      <a href="#contact" class="footer-link">যোগাযোগ</a>
    </nav>

    <div class="footer-col">
      <h3 class="footer-heading">যোগাযোগ</h3>
      <p class="footer-contact"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> ঠিকানা: সাতক্ষীরা, খুলনা বিভাগ, বাংলাদেশ</p>
      <p class="footer-contact"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 11.91a16 16 0 0 0 6 6l3.27-1.27a2 2 0 0 1 2.11.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg> মোবাইল: ০১XXX-XXXXXX</p>
      <p class="footer-contact"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg> ইমেইল: info@example.com</p>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container"><p>© <span id="footerYear">২০২৬</span> সেবা বাজার। সর্বস্বত্ব সংরক্ষিত।</p></div>
  </div>
</footer>

<!-- ══════════ AUTH MODAL ══════════ -->
<div class="auth-overlay" id="authOverlay" hidden>
  <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="authTitle">
    <button class="auth-close" id="authClose" aria-label="বন্ধ করুন">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
    <div class="auth-logo">
      <svg class="logo-mark logo-mark--sm" viewBox="0 2 124 108" role="img" aria-label="সেবা বাজার লোগো" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#F58634" stroke-width="7" stroke-linecap="round">
          <line x1="4"  y1="52" x2="28" y2="46"/><line x1="1"  y1="66" x2="26" y2="62"/><line x1="6"  y1="80" x2="24" y2="78"/>
        </g>
        <path d="M30 40 L92 40 L101 96 Q101 104 93 104 L29 104 Q21 104 21 96 Z" fill="#0E8F4C" stroke="#0A5B32" stroke-width="8" stroke-linejoin="round"/>
        <path d="M44 40 C44 21 52 12 61 12 C70 12 79 21 79 40" fill="none" stroke="#0A5B32" stroke-width="9" stroke-linecap="round"/>
        <text x="61" y="88" text-anchor="middle" font-family="'Baloo Da 2','Hind Siliguri',sans-serif" font-weight="800" font-size="33" fill="#FFFFFF">সেবা</text>
        <path d="M24 98 C46 106 82 100 108 72" fill="none" stroke="#F58634" stroke-width="7" stroke-linecap="round"/>
      </svg>
    </div>
    <h2 class="auth-title" id="authTitle">লগইন করুন</h2>
    <p class="auth-sub" id="authSub">আপনার মোবাইল নম্বর দিয়ে সহজেই লগইন করুন</p>
    <form id="authForm" class="auth-form" novalidate>
      <div class="field auth-name-field" id="authNameField" hidden>
        <label class="field-label" for="authName">আপনার নাম <i>*</i></label>
        <input type="text" id="authName" class="field-input" placeholder="নাম লিখুন" autocomplete="name" />
        <p class="field-error">অনুগ্রহ করে আপনার নাম লিখুন।</p>
      </div>
      <div class="field">
        <label class="field-label" for="authPhone">মোবাইল নম্বর <i>*</i></label>
        <input type="tel" id="authPhone" class="field-input" placeholder="01XXXXXXXXX" inputmode="numeric" maxlength="11" autocomplete="tel" required />
        <p class="field-error">সঠিক ১১-সংখ্যার মোবাইল নম্বর দিন।</p>
      </div>
      <button type="submit" class="btn btn-solid auth-submit" id="authSubmit">লগইন</button>
    </form>
    <p class="auth-switch"><span id="authSwitchText">নতুন অ্যাকাউন্ট চান?</span> <button class="auth-switch-btn" id="authSwitchBtn">সাইন আপ করুন</button></p>
  </div>
</div>

<div class="toast" id="toast" role="status" aria-live="polite"></div>`;

(function injectLayout() {
  var headerSlot = document.getElementById('app-header');
  var footerSlot = document.getElementById('app-footer');
  if (headerSlot) headerSlot.innerHTML = window.SHEBA_BAZER_HEADER;
  if (footerSlot) footerSlot.innerHTML = window.SHEBA_BAZER_FOOTER;
})();
