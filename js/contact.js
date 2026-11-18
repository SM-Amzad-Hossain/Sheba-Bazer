/**
 * সেবা বাজার — Contact page logic (contact.html).
 * Validates the message form and simulates an async submit (loading state → toast),
 * keeping a local outbox in localStorage. Depends on main.js (window.shebaToast).
 */
'use strict';

(function () {

const $ = (s, c = document) => c.querySelector(s);

const form = $('#contactForm');
if (!form) return;

const toast = (msg, type) => (window.shebaToast ? window.shebaToast(msg, type) : undefined);
const OUTBOX_KEY = 'shebaBazarContactOutbox';

const nameEl    = $('#contactName');
const phoneEl   = $('#contactPhone');
const emailEl   = $('#contactEmail');
const subjectEl = $('#contactSubject');
const messageEl = $('#contactMessage');
const submitBtn = $('#contactSubmit');

const setInvalid = (el, invalid) => {
  const field = el.closest('.field');
  if (field) field.classList.toggle('has-error', invalid);
  el.setAttribute('aria-invalid', String(invalid));
};

const validators = {
  name:    () => nameEl.value.trim().length >= 2,
  phone:   () => /^01[3-9]\d{8}$/.test(phoneEl.value.trim()),
  email:   () => emailEl.value.trim() === '' || /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(emailEl.value.trim()),
  subject: () => subjectEl.value !== '',
  message: () => messageEl.value.trim().length >= 10,
};

nameEl.addEventListener('input', () => setInvalid(nameEl, false));
phoneEl.addEventListener('input', () => {
  phoneEl.value = phoneEl.value.replace(/[^\d]/g, '').slice(0, 11);
  setInvalid(phoneEl, false);
});
emailEl.addEventListener('input', () => setInvalid(emailEl, false));
subjectEl.addEventListener('change', () => setInvalid(subjectEl, false));
messageEl.addEventListener('input', () => setInvalid(messageEl, false));

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const results = {
    name: validators.name(),
    phone: validators.phone(),
    email: validators.email(),
    subject: validators.subject(),
    message: validators.message(),
  };
  setInvalid(nameEl, !results.name);
  setInvalid(phoneEl, !results.phone);
  setInvalid(emailEl, !results.email);
  setInvalid(subjectEl, !results.subject);
  setInvalid(messageEl, !results.message);

  const firstBad = Object.entries(results).find(([, ok]) => !ok);
  if (firstBad) {
    const map = { name: nameEl, phone: phoneEl, email: emailEl, subject: subjectEl, message: messageEl };
    map[firstBad[0]].focus();
    toast('অনুগ্রহ করে ফর্মের হাইলাইট করা ঘরগুলো ঠিক করুন।', 'error');
    return;
  }

  /* Simulate an async submit with a loading state */
  submitBtn.disabled = true;
  submitBtn.classList.add('is-loading');
  const originalHtml = submitBtn.innerHTML;
  submitBtn.innerHTML = 'পাঠানো হচ্ছে…';

  window.setTimeout(() => {
    try {
      const outbox = JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]');
      outbox.push({
        name: nameEl.value.trim(),
        phone: phoneEl.value.trim(),
        email: emailEl.value.trim(),
        subject: subjectEl.value,
        message: messageEl.value.trim(),
        at: new Date().toISOString(),
      });
      localStorage.setItem(OUTBOX_KEY, JSON.stringify(outbox));
    } catch { /* storage unavailable — still report success to the user */ }

    form.reset();
    submitBtn.disabled = false;
    submitBtn.classList.remove('is-loading');
    submitBtn.innerHTML = originalHtml;
    toast('ধন্যবাদ! আপনার মেসেজ পৌঁছেছে — আমরা শীঘ্রই যোগাযোগ করব।');
  }, 900);
});

})();
