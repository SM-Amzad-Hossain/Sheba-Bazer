# সেবা বাজার (Sheba Bazer)

A pixel-faithful, fully responsive implementation of the **সেবা বাজার** home page —
a local-services marketplace where people in Bangladesh book verified service
providers (মিস্ত্রি, ড্রাইভার, ইলেকট্রিশিয়ান…) from one place.

## Run it

No build step — it's a static site. Serve the folder and open it:

```bash
python3 -m http.server 8080 --bind 0.0.0.0
# then visit http://localhost:8080/
```

## What's inside

- `index.html` — semantic markup for all sections (header, hero, area filter, services,
  trusted partners, request form, about, footer, auth modal)
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
