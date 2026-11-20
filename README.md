# সেবা বাজার (Sheba Bazer)

A pixel-faithful, fully responsive implementation of the **সেবা বাজার** home page and
service-detail page — a local-services marketplace where people in Bangladesh book
verified service providers (মিস্ত্রি, ড্রাইভার, ইলেকট্রিশিয়ান…) from one place.

## What's inside

- `index.html` — semantic markup for all sections (header, hero, area filter, services,
  trusted partners, request form, about, footer, auth modal)
- `services.html` — ডাক্তার পাওয়া service-detail page: green hero band with breadcrumb,
  stethoscope tile + live count badge, area-filter card (filters the doctor list),
  doctor cards, ad banner carousel, help cards and an অন্যান্য সেবা quick-pick row
  (doctor cards link to `service.html`)
- `service.html` — single provider profile page (ডাঃ নমুনা ১): photo block, chips,
  call/WhatsApp/share actions, সেবাদাতা info card, price list, work-photo placeholders,
  schedule, working review form (localStorage-backed aggregate) and
  একই সেবার অন্যান্য সেবাদাতা pills; backed by `js/service.js`
- `blog.html` — সেবা বাজার ব্লগ: green hero band, featured article, live search,
  category chips (filtered grid), newsletter signup; renders from `js/blog-data.js`
- `blog-post.html` — single article view (`?slug=`): article with tags/like/share
  (localStorage-backed like), prev-next pager, related posts, sidebar
  (categories, recent posts, CTA); backed by `js/blog.js`
- `about.html` — আমাদের সম্পর্কে page (green hero band with diagonal rays,
  our story, mission/provider cards, কীভাবে কাজ করে steps, কেন সেবা বাজার,
  CTA band)
- `contact.html` — যোগাযোগ page (green hero band, message form with validation +
  loading state and localStorage outbox, direct call/WhatsApp buttons,
  address/email/office hours, stylized map tile linking to Google Maps, quick links);
  backed by `js/contact.js`
- `portal.html` — গ্রাহক ও সেবাদাতা পোর্টাল: split gateway (লগইন/সাইন আপ tabs,
  গ্রাহক/সেবাদাতা role cards, বিভাগ→জেলা→উপজেলা cascade for providers), then a
  dashboard: welcome band with role badge, live stats, request list
  (customer: own requests; provider: open requests in their upazila), profile editor
  with availability switch. Client-side accounts in localStorage
  (demo accounts, password `demo123`: গ্রাহক 01700000001 · provider
  01700000002 (কারেন্ট মিস্ত্রি) / 01700000003 (ডাঃ, সাতক্ষীরা সদর) / 01700000004
  (ডাঃ, তালা) / 01700000005 (প্লাম্বার) / 01700000006 (এসি মিস্ত্রি));
  accounts persist across reloads (session), login verifies against stored data;
  লগআউট clears the session and lands on the লগইন tab. Backed by `js/portal.js`
  + shared `js/accounts.js`. Header লগইন/সাইন আপ buttons link here
- `services.html` / `service.html` — প্রোভাইডার তালিকা dynamic: এলাকার সেবা select
  (category) অনুযায়ী `shebaBazarAccounts`-এর available providers দেখায়
  (card → `service.html?id=<id>`); single provider pageও dynamic
  (name/chips/ফোন/ঠিকানা/সদস্যতা/একই সেবার অন্যান্যরা, `?id=` ছাড়া first available);
  availability off হলে সেবাদাতা তালিকায় দেখা যায় না
- `privacy.html` / `terms.html` — গোপনীয়তা নীতি ও শর্তাবলি (footer legal links)

Signup/login lives only in the portal (header লগইন/সাইন আপ → portal.html);
the old unreachable header auth modal was removed. Account storage is a single
shared store in `js/accounts.js` (`window.shebaAccounts`) used by portal +
services + single-provider pages. NOTE: client-side demo — password hashing is
obfuscation only; replace with a backend before real credentials.

The shared footer matches the সেবা বাজার draft footer (medium green `#0a6b3c`,
plain "সেবা বাজার" brand, দ্রুত লিংক: হোম/সেবাসমূহ/সেবা দিতে চাই/আমাদের সম্পর্কে,
যোগাযোগ column, bottom bar with গোপনীয়তা নীতি · শর্তাবলি)
- `js/components.js` — single source of truth for the shared header, footer, auth modal
  and toast (injected on every page; path-aware links + active nav)
- `js/services.js` — services-page logic: renders doctor cards, filters them via the
  area-filter card, ad carousel, অন্যান্য সেবা quick-pick
- `css/styles.css` — design system (self-hosted Hind Siliguri / Baloo Da 2,
  CSS custom properties, responsive breakpoints down to 360px)
- `js/data-locations.js` — all 8 divisions → 64 districts → upazilas (dependent dropdowns)
- `js/main.js` — interactions:
  - hero auto-carousel with dots, pause-on-hover
  - live service search with keyboard-navigable suggestions (বাংলা + ইংরেজি keywords)
  - 12 tappable service categories that pre-select the request form
  - সেবা নিতে চাই / সেবা দিতে চাই tabs with full form validation (বাংলা error messages,
    BD mobile-number regex) and a success state (stored in `localStorage`)
  - ad banner carousel (autoplay, arrows, dots)
  - লগইন / সাইন আপ modal with validation
  - animated Bengali-numeral stat counters, scroll-reveal, scrollspy nav, mobile hamburger menu, toasts
- `assets/` — the সেবা বাজার logo (PNG, used as icon everywhere) and self-hosted fonts (OFL)

## Notes

- Fonts are self-hosted (`assets/fonts`, SIL Open Font License) — no CDN required.
- The hero illustration is a hand-drawn inline SVG (Lalbagh-fort–style waterfront).
- Form submissions are stored locally (`localStorage: shebaBazarRequests`); wire the
  submit handler to a backend endpoint when one becomes available.
