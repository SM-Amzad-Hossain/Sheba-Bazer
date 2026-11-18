/**
 * সেবা বাজার — Blog logic.
 * Listing page (blog.html): featured post, category chips, search, article grid, newsletter.
 * Post page (blog-post.html): reads ?slug=, renders the article, share/like,
 * prev-next pager, related posts and sidebar widgets.
 * Depends on main.js (window.shebaToast) and blog-data.js (window.SHEBA_BAZER_POSTS).
 */
'use strict';

(function () {

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const toBn = (n) => String(n).split('').map((d) => BN_DIGITS[+d] ?? d).join('');
const toast = (msg, type) => (window.shebaToast ? window.shebaToast(msg, type) : undefined);

const POSTS = window.SHEBA_BAZER_POSTS || [];

/* ── Thumbnails: green-hue gradient + white line icon per post ── */
const THUMBS = {
  leaf:   { hue: 'green', svg: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>' },
  stetho: { hue: 'teal',  svg: '<path d="M5 3v5a6 6 0 0 0 12 0V3"/><path d="M5 3H2.5M5 3h2.5M19 3h-2.5M19 3h2.5"/><path d="M11 14v2.6a5.4 5.4 0 0 0 10.8 0V14"/><circle cx="21.8" cy="12" r="1.9"/>' },
  bolt:   { hue: 'amber', svg: '<path d="M13 2 4.5 13.5H11L9.5 22 18 10.5h-6.5L13 2Z"/>' },
  snow:   { hue: 'sky',   svg: '<path d="M12 2v20M4 6l16 12M20 6 4 18M12 6l-2-2m2 2 2-2M12 18l-2 2m2-2 2 2"/>' },
  pipe:   { hue: 'deep',  svg: '<path d="M4 9h7a3 3 0 0 1 3 3v9"/><path d="M14 21h4M4 6h7M4 12h4M17.5 21a2 2 0 0 0 2-2v-1a4 4 0 0 1 4-4h-1"/>' },
  rain:   { hue: 'green', svg: '<path d="M16 13a5 5 0 0 0-9.2-2.2A4.5 4.5 0 0 0 8 19.5h8a4 4 0 0 0 0-6.5Z"/><path d="M8 21v1m4-2v2m4-2v1"/>' },
};

const thumbSvg = (key, size = 44) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(THUMBS[key] || THUMBS.leaf).svg}</svg>`;

const thumbClass = (key) => `blog-thumb blog-thumb--${(THUMBS[key] || THUMBS.leaf).hue}`;

const CATEGORIES = ['সব', ...new Set(POSTS.map((p) => p.category))];

const postUrl = (slug) => `blog-post.html?slug=${encodeURIComponent(slug)}`;
const formatMin = (n) => `${toBn(n)} মিনিট`;

const cardHtml = (p) => `
  <a class="blog-card" href="${postUrl(p.slug)}" aria-label="${p.title}">
    <div class="${thumbClass(p.thumb)} blog-card-thumb">${thumbSvg(p.thumb, 54)}</div>
    <div class="blog-card-body">
      <span class="blog-tag">${p.category}</span>
      <h3 class="blog-card-title">${p.title}</h3>
      <p class="blog-card-excerpt">${p.excerpt}</p>
      <div class="blog-card-foot">
        <span>${p.date}</span>
        <span class="blog-dot" aria-hidden="true">·</span>
        <span>${formatMin(p.readMin)} পড়ার সময়</span>
      </div>
    </div>
  </a>`;

/* ══════════════════════════════════════════════
   LISTING PAGE (blog.html)
   ══════════════════════════════════════════════ */
const grid = $('#blogGrid');

if (grid) {
  const featured   = $('#blogFeatured');
  const chipsWrap  = $('#blogChips');
  const empty      = $('#blogEmpty');
  const searchForm = $('#blogSearchForm');
  const search     = $('#blogSearch');
  const badge      = $('#blogCountBadge');

  let activeCategory = 'সব';
  let query = '';

  /* Featured post (first entry) */
  if (featured && POSTS.length) {
    const p = POSTS[0];
    featured.href = postUrl(p.slug);
    featured.innerHTML = `
      <div class="blog-featured-media ${thumbClass(p.thumb)}">${thumbSvg(p.thumb, 84)}</div>
      <div class="blog-featured-copy">
        <span class="blog-featured-label">নির্বাচিত আর্টিকেল</span>
        <span class="blog-tag blog-tag--lg">${p.category}</span>
        <h2 class="blog-featured-title">${p.title}</h2>
        <p class="blog-featured-excerpt">${p.excerpt}</p>
        <div class="blog-card-foot">
          <span>${p.date}</span><span class="blog-dot" aria-hidden="true">·</span>
          <span>${formatMin(p.readMin)} পড়ার সময়</span>
          <span class="blog-readmore">পুরোটা পড়ুন <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>
        </div>
      </div>`;
  }

  /* Category chips */
  chipsWrap.innerHTML = CATEGORIES.map(
    (cat) => `<button type="button" class="blog-chip${cat === 'সব' ? ' is-active' : ''}" data-category="${cat}" aria-pressed="${cat === 'সব'}">${cat}</button>`
  ).join('');

  const filtered = () => POSTS.filter((p) => {
    /* avoid duplicating the featured card while browsing unfiltered */
    if (activeCategory === 'সব' && !query && POSTS.length && p.slug === POSTS[0].slug) return false;
    const inCategory = activeCategory === 'সব' || p.category === activeCategory;
    if (!inCategory) return false;
    if (!query) return true;
    const haystack = `${p.title} ${p.excerpt} ${p.category} ${(p.tags || []).join(' ')}`.toLowerCase();
    return haystack.includes(query);
  });

  const render = () => {
    const list = filtered();
    grid.innerHTML = list.map(cardHtml).join('');
    empty.hidden = list.length !== 0;
    if (badge) badge.textContent = `${toBn(POSTS.length)}টি আর্টিকেল`;
  };

  chipsWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.blog-chip');
    if (!btn) return;
    activeCategory = btn.dataset.category;
    $$('.blog-chip', chipsWrap).forEach((c) => {
      c.classList.toggle('is-active', c === btn);
      c.setAttribute('aria-pressed', String(c === btn));
    });
    render();
  });

  searchForm.addEventListener('submit', (e) => e.preventDefault());
  search.addEventListener('input', () => {
    query = search.value.trim().toLowerCase();
    render();
  });

  render();
}

/* ══════════════════════════════════════════════
   NEWSLETTER (either page)
   ══════════════════════════════════════════════ */
const newsletterForm = $('#blogNewsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#blogNewsletterEmail');
    const value = email.value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(value)) {
      toast('অনুগ্রহ করে সঠিক ইমেইল ঠিকানা দিন।', 'error');
      return;
    }
    email.value = '';
    toast('ধন্যবাদ! আপনার সাবস্ক্রিপশন গ্রহণ করা হয়েছে।');
  });
}

/* ══════════════════════════════════════════════
   POST PAGE (blog-post.html)
   ══════════════════════════════════════════════ */
const postBody = $('#postBody');

if (postBody) {
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const index = POSTS.findIndex((p) => p.slug === slug);
  const post = index !== -1 ? POSTS[index] : POSTS[0];
  if (!post) return;
  const postIndex = index !== -1 ? index : 0;

  /* Page metadata */
  document.title = `${post.title} | সেবা বাজার ব্লগ`;
  $('#postCrumb').textContent = post.title.length > 42 ? post.title.slice(0, 42) + '…' : post.title;
  $('#postCategory').textContent = post.category;
  $('#postRead').textContent = toBn(post.readMin);
  $('#postTitle').textContent = post.title;
  $('#postDate').textContent = post.date;
  $('#postThumb').innerHTML = `<span class="${thumbClass(post.thumb)} post-thumb-inner">${thumbSvg(post.thumb, 92)}</span>`;
  postBody.innerHTML = post.body;
  $('#postTags').innerHTML = (post.tags || []).map((t) => `<span class="post-tag">#${t}</span>`).join('');

  const setMeta = (id, value) => { const el = $(id); if (el) el.setAttribute('content', value); };
  setMeta('#postPageDescription', post.excerpt);
  setMeta('#postOgTitle', `${post.title} | সেবা বাজার`);
  setMeta('#postOgDescription', post.excerpt);

  /* Like button (localStorage-backed, per slug) */
  const likeKey = `shebaBazarBlogLikes:${post.slug}`;
  const likeBtn = $('#postLikeBtn');
  const likeCount = $('#postLikeCount');
  const baseLikes = 24 + (post.slug.length * 7) % 41; // stable, post-specific
  const liked = () => { try { return localStorage.getItem(likeKey) === '1'; } catch { return false; } };
  const renderLike = () => {
    const count = baseLikes + (liked() ? 1 : 0);
    likeCount.textContent = toBn(count);
    likeBtn.classList.toggle('is-liked', liked());
    likeBtn.setAttribute('aria-pressed', String(liked()));
  };
  likeBtn.addEventListener('click', () => {
    try {
      if (liked()) localStorage.removeItem(likeKey);
      else localStorage.setItem(likeKey, '1');
    } catch { /* storage unavailable — still toggle UI */ }
    renderLike();
  });
  renderLike();

  /* Share: Web Share API → clipboard fallback → toast */
  const shareBtn = $('#postShareBtn');
  shareBtn.addEventListener('click', async () => {
    const shareData = { title: post.title, text: post.excerpt, url: location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); return; } catch { /* user cancelled or unavailable — fall back */ }
    }
    try {
      await navigator.clipboard.writeText(location.href);
      toast('লিংক কপি করা হয়েছে!');
    } catch {
      toast('লিংক কপি করা যায়নি।', 'error');
    }
  });

  /* Prev / next pager */
  const pager = $('#postPager');
  const prev = POSTS[(postIndex - 1 + POSTS.length) % POSTS.length];
  const next = POSTS[(postIndex + 1) % POSTS.length];
  pager.innerHTML = `
    <a class="post-pager-link post-pager-prev" href="${postUrl(prev.slug)}">
      <span class="post-pager-label">← আগের লেখা</span>
      <span class="post-pager-title">${prev.title}</span>
    </a>
    <a class="post-pager-link post-pager-next" href="${postUrl(next.slug)}">
      <span class="post-pager-label">পরের লেখা →</span>
      <span class="post-pager-title">${next.title}</span>
    </a>`;

  /* Related: same category first, then newest others; exclude current */
  const related = POSTS.filter((p) => p.slug !== post.slug)
    .sort((a, b) => (b.category === post.category) - (a.category === post.category))
    .slice(0, 3);
  $('#relatedGrid').innerHTML = related.map(cardHtml).join('');

  /* Sidebar: categories with counts */
  $('#sideCategoryList').innerHTML = CATEGORIES.slice(1).map((cat) => {
    const count = POSTS.filter((p) => p.category === cat).length;
    return `<li><a class="post-side-link" href="blog.html"><span>${cat}</span><span class="post-side-count">${toBn(count)}</span></a></li>`;
  }).join('');

  /* Sidebar: recent posts */
  $('#sideRecentList').innerHTML = POSTS.slice(0, 4).map(
    (p) => `<li><a class="post-side-recent-link" href="${postUrl(p.slug)}"><span class="post-side-recent-title">${p.title}</span><span class="post-side-recent-date">${p.date}</span></a></li>`
  ).join('');
}

})();
