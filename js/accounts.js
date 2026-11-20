/**
 * সেবা বাজার — Shared account store (client-side demo, GitHub Pages — no backend yet).
 * Accounts live in localStorage (shebaBazarAccounts), the login session in
 * shebaBazarSession, service requests in shebaBazarRequests.
 * NOTE: password hashing here is demo-grade obfuscation (cyrb53), NOT security —
 * replace with a real backend before storing real user credentials.
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

/* ── seed demo accounts on first run (demo: password demo123) ── */
function seedDemoAccounts() {
  if (readAccounts().length) return;
  const ago = (days) => new Date(Date.now() - days * 86400000).toISOString();
  writeAccounts([
    { id: newId(), name: 'নুসরাত জাহান', phone: '01700000001', passHash: hashPass('demo123'),
      role: 'customer', service: '', division: '', district: '', upazila: '', address: '',
      available: true, views: 0, createdAt: ago(45) },
    { id: newId(), name: 'মোঃ রফিকুল ইসলাম', phone: '01700000002', passHash: hashPass('demo123'),
      role: 'provider', service: 'কারেন্ট মিস্ত্রি', division: 'খুলনা', district: 'সাতক্ষীরা', upazila: 'সাতক্ষীরা সদর',
      address: 'সাতক্ষীরা সদর বাসস্ট্যান্ড, সাতক্ষীরা', available: true, views: 128, createdAt: ago(60) },
    { id: newId(), name: 'ডাঃ আরিফুল হক', phone: '01700000003', passHash: hashPass('demo123'),
      role: 'provider', service: 'ডাক্তার পাওয়া', division: 'খুলনা', district: 'সাতক্ষীরা', upazila: 'সাতক্ষীরা সদর',
      address: 'সাতক্ষীরা সদর, সাতক্ষীরা', available: true, views: 96, createdAt: ago(120) },
    { id: newId(), name: 'ডাঃ সাবরিনা ইয়াসমিন', phone: '01700000004', passHash: hashPass('demo123'),
      role: 'provider', service: 'ডাক্তার পাওয়া', division: 'খুলনা', district: 'সাতক্ষীরা', upazila: 'তালা',
      address: 'তালা, সাতক্ষীরা', available: true, views: 74, createdAt: ago(90) },
    { id: newId(), name: 'রবিউল ইসলাম', phone: '01700000005', passHash: hashPass('demo123'),
      role: 'provider', service: 'প্লাম্বার', division: 'খুলনা', district: 'সাতক্ষীরা', upazila: 'কালিয়ায়',
      address: 'কালিয়ায়, সাতক্ষীরা', available: true, views: 51, createdAt: ago(75) },
    { id: newId(), name: 'সুমন হোসেন', phone: '01700000006', passHash: hashPass('demo123'),
      role: 'provider', service: 'এসি মিস্ত্রি', division: 'খুলনা', district: 'সাতক্ষীরা', upazila: 'সাতক্ষীরা সদর',
      address: 'সাতক্ষীরা সদর, সাতক্ষীরা', available: true, views: 43, createdAt: ago(30) },
  ]);
}

window.shebaAccounts = {
  ACCOUNTS_KEY, SESSION_KEY, REQUESTS_KEY,
  readAccounts, writeAccounts, readRequests,
  hashPass, newId, getSession, setSession, getAccount,
  listProviders, listOpenProviders,
};

seedDemoAccounts();

})();
