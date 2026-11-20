/**
 * সেবা বাজার — Shared account store (client-side demo, GitHub Pages — no backend yet).
 * Accounts live in localStorage (shebaBazarAccounts), the login session in
 * shebaBazarSession, service requests in shebaBazarRequests.
 * NOTE: password hashing here is demo-grade obfuscation (cyrb53), NOT security —
 * replace with a real backend before storing real user credentials.
 * Seed data (first run) comes from ./account_db.txt — a reusable JSON demo
 * database — see window.shebaAccounts.ready.
 *
 * Single source of truth used by:
 *   portal.html   — signup / login / dashboard (js/portal.js)
 *   services.html — dynamic provider listing (js/services.js)
 *   service.html  — dynamic provider profile (js/service.js)
 */
'use strict';

(function () {

const ACCOUNTS_KEY = 'shebaBazarAccounts';
const SESSION_KEY  = 'shebaBazarSession';
const REQUESTS_KEY = 'shebaBazarRequests';

const readAccounts = () => { try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]'); } catch { return []; } };
const writeAccounts = (list) => {
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list)); return true; } catch { return false; }
};
const readRequests = () => { try { return JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]'); } catch { return []; } };

/* demo-grade password hash (obfuscation only) */
function hashPass(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16);
}

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const getSession = () => { try { return localStorage.getItem(SESSION_KEY); } catch { return null; } };
const setSession = (id) => { try { id ? localStorage.setItem(SESSION_KEY, id) : localStorage.removeItem(SESSION_KEY); } catch { /* non-fatal */ } };
const getAccount = (id) => readAccounts().find((a) => a.id === id) || null;

/* providers, optionally only those open to work — used by the services pages */
const listProviders = () => readAccounts().filter((a) => a.role === 'provider');
const listOpenProviders = () => listProviders().filter((a) => a.available !== false);

/* ── seed demo accounts on first run ──
   Source of truth: ./account_db.txt (reusable JSON seed database — importable later).
   Fallback: the same data bundled inline, used only if the file can't be fetched
   (e.g. file:// or offline). Plain demo passwords are hashed at materialize time
   and never persisted to storage.
   Consumers await window.shebaAccounts.ready before reading accounts. */
const FALLBACK_SEED = [
  { id: 'acct-001', name: 'নুসরাত জাহান', phone: '01700000001', password: 'demo123', role: 'customer', service: '', division: '', district: '', upazila: '', address: '', available: true, views: 0, createdAt: '2026-10-06T00:00:00.000Z' },
  { id: 'acct-002', name: 'মোঃ রফিকুল ইসলাম', phone: '01700000002', password: 'demo123', role: 'provider', service: 'কারেন্ট মিস্ত্রি', division: 'খুলনা', district: 'সাতক্ষীরা', upazila: 'সাতক্ষীরা সদর', address: 'সাতক্ষীরা সদর বাসস্ট্যান্ড, সাতক্ষীরা', available: true, views: 128, createdAt: '2026-09-21T00:00:00.000Z' },
  { id: 'acct-003', name: 'ডাঃ আরিফুল হক', phone: '01700000003', password: 'demo123', role: 'provider', service: 'ডাক্তার পাওয়া', division: 'খুলনা', district: 'সাতক্ষীরা', upazila: 'সাতক্ষীরা সদর', address: 'সাতক্ষীরা সদর, সাতক্ষীরা', available: true, views: 96, createdAt: '2026-07-23T00:00:00.000Z' },
  { id: 'acct-004', name: 'ডাঃ সাবরিনা ইয়াসমিন', phone: '01700000004', password: 'demo123', role: 'provider', service: 'ডাক্তার পাওয়া', division: 'খুলনা', district: 'সাতক্ষীরা', upazila: 'তালা', address: 'তালা, সাতক্ষীরা', available: true, views: 74, createdAt: '2026-08-22T00:00:00.000Z' },
  { id: 'acct-005', name: 'রবিউল ইসলাম', phone: '01700000005', password: 'demo123', role: 'provider', service: 'প্লাম্বার', division: 'খুলনা', district: 'সাতক্ষীরা', upazila: 'কালিয়ায়', address: 'কালিয়ায়, সাতক্ষীরা', available: true, views: 51, createdAt: '2026-09-06T00:00:00.000Z' },
  { id: 'acct-006', name: 'সুমন হোসেন', phone: '01700000006', password: 'demo123', role: 'provider', service: 'এসি মিস্ত্রি', division: 'খুলনা', district: 'সাতক্ষীরা', upazila: 'সাতক্ষীরা সদর', address: 'সাতক্ষীরা সদর, সাতক্ষীরা', available: true, views: 43, createdAt: '2026-10-21T00:00:00.000Z' },
];

function materialize(r) {
  return {
    id: r.id || newId(),
    name: String(r.name || 'ব্যবহারকারী'),
    phone: String(r.phone || ''),
    /* plain `password` (demo seeds) → hash now; `passHash` (already hashed) → keep as-is */
    passHash: r.password ? hashPass(String(r.password)) : String(r.passHash || ''),
    role: r.role === 'provider' ? 'provider' : 'customer',
    service: r.service || '',
    division: r.division || '',
    district: r.district || '',
    upazila: r.upazila || '',
    address: r.address || '',
    available: r.available !== false,
    views: Number(r.views) || 0,
    createdAt: r.createdAt || new Date().toISOString(),
  };
}

async function seedDemoAccounts() {
  if (readAccounts().length) return; /* already seeded/used in this browser */
  let rows = null;
  try {
    const res = await fetch('account_db.txt', { cache: 'no-cache' });
    if (res.ok) {
      const db = await res.json();
      if (db && Array.isArray(db.accounts)) rows = db.accounts;
    }
  } catch { /* file:// or offline — bundled fallback below */ }
  if (!rows) rows = FALLBACK_SEED;
  writeAccounts(rows.map(materialize));
}

const ready = seedDemoAccounts();

window.shebaAccounts = {
  ACCOUNTS_KEY, SESSION_KEY, REQUESTS_KEY,
  readAccounts, writeAccounts, readRequests,
  hashPass, newId, getSession, setSession, getAccount,
  listProviders, listOpenProviders,
  ready,
};

})();
