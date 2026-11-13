/* Shared settings and helpers for 3 AM Us. */

export const NEW_DAYS = 7;
export const PHOTO_SIDE = 256;
export const PHOTO_MAX_CHARS = 44000;
export const CACHE_KEY = 'us-snapshot-v4';   // last data, kept only for this browser tab
export const HOME = { screen: 'home', eventKey: null, openId: null };

export const SORTS = [
  { id: 'latest', label: 'Latest sign-up' },
  { id: 'newest', label: 'Newest members' },
  { id: 'events', label: 'Most events' },
  { id: 'name', label: 'Name A–Z' },
  { id: 'young', label: 'Youngest first' },
  { id: 'old', label: 'Oldest first' },
  { id: 'oldest', label: 'Longest with us' },
];
export const VIEWS = [
  { id: 'all', label: 'Everyone' },
  { id: 'week', label: 'Signed up this week' },
  { id: 'starred', label: '★ Starred' },
  { id: 'bday', label: 'Birthdays this month' },
  { id: 'pending', label: 'Payment pending' },
];
export const EVENT_SORTS = [
  { id: 'latest', label: 'Latest sign-up' },
  { id: 'name', label: 'Name A–Z' },
  { id: 'young', label: 'Youngest first' },
  { id: 'old', label: 'Oldest first' },
];
export const EVENT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'review', label: 'Needs review' },
  { id: 'paid', label: 'Paid' },
  { id: 'later', label: 'Pays on day' },
  { id: 'unpaid', label: 'Not paid' },
  { id: 'in', label: 'Checked in' },
  { id: 'notin', label: 'Not checked in' },
  { id: 'away', label: 'Not coming' },
  { id: 'rejected', label: 'Rejected' },
];
export const EXPENSE_CATEGORIES = ['Marketing', 'Travel', 'Food', 'Venue', 'Other'];
export const PAY_TEXT = { paid: 'Paid', later: 'Pays on day', unpaid: 'Not paid', rejected: 'Rejected', out: 'Not coming' };

/* Planning: how "Wants to explore" answers group into roles. Someone can be in more than one. */
export const ROLE_GROUPS = [
  { id: 'actors', label: 'Actors', test: /\bact/i },
  { id: 'directors', label: 'Directors', test: /direct|cinematograph|filmmaking/i },
  { id: 'camera', label: 'Camera', test: /photograph|cinematograph|camera/i },
  { id: 'editors', label: 'Editors', test: /\bedit/i },
];
/* Order of the "Own phone / camera" boxes (lowercase, no full stop) */
export const DEVICE_ORDER = [
  'yes, absolutely',
  'maybe, depending on the shoot',
  "i have one, but i'd prefer not to use it",
  "no, i'd need to use what the crew has",
];

export const displayName = (p) => p.nickname || p.name;
export const cls = (s) => String(s).replace(/[^A-Za-z]/g, '');
export const isRecent = (ms) => Date.now() - ms <= NEW_DAYS * 864e5;
export const isExcluded = (r) => r.pay === 'rejected' || r.pay === 'out';   // left out of this event entirely
export const inr = (n) => `${n < 0 ? '−' : ''}₹${Math.abs(Math.round(n || 0)).toLocaleString('en-IN')}`;
export const shownAmount = (r) => (r.amount ?? r.defaultAmount ?? 0);

export function initials(s) {
  return String(s || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';
}
export function fmtDate(ms) {
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
export function shortDate(ms) {
  return new Date(ms).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}
export function ago(ms) {
  const d = Math.floor((Date.now() - ms) / 864e5);
  if (d <= 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 30) return `${d} days ago`;
  const m = Math.floor(d / 30.44);
  if (m < 12) return `${m} ${m === 1 ? 'month' : 'months'} ago`;
  const y = Math.floor(m / 12);
  return `${y} ${y === 1 ? 'year' : 'years'} ago`;
}
export function ageText(days) {
  if (days < 1) return 'Joined today';
  if (days < 60) return `${days} days`;
  const m = Math.floor(days / 30.44);
  if (m < 12) return `${m} months`;
  const y = Math.floor(m / 12), r = m % 12;
  return `${y} ${y > 1 ? 'years' : 'year'}${r ? ` ${r} mo` : ''}`;
}
export function yearsText(p) {
  if (p.age == null) return '';
  return `${p.ageApprox ? '~' : ''}${p.age} yrs`;
}
export function relDay(ms) {
  if (!ms) return null;
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const days = Math.round((ms - midnight) / 864e5);
  if (days === 0) return { text: 'Today', cls: 'now' };
  if (days === 1) return { text: 'Tomorrow', cls: 'soon' };
  if (days > 1) return { text: `In ${days} days`, cls: 'soon' };
  return { text: 'Just happened', cls: 'past' };
}
export function tierFor(n, tiers) {
  for (const t of tiers) if (n >= t.min) return t.label;
  return tiers[tiers.length - 1].label;
}
export function applyOverride(p, o, tiers) {
  const extra = o.extra || 0;
  const count = Math.max(0, p.autoCount + extra);
  const autoTier = tierFor(count, tiers);
  const tierOverride = tiers.some(t => t.label === o.tier) ? o.tier : '';
  return {
    ...p, nickname: o.nickname || '', extra, count, autoTier, tierOverride,
    tier: tierOverride || autoTier, starred: !!o.starred, notes: o.notes || '', photo: o.photo || '',
  };
}
export const byAge = (dir, get) => (a, b) => {
  const x = get(a).age, y = get(b).age;
  if (x == null && y == null) return 0;
  if (x == null) return 1;
  if (y == null) return -1;
  return dir * (x - y);
};
export function payLabel(r) {
  if (r.pay === 'paid') { const a = shownAmount(r); return a ? `Paid ${inr(a)}` : 'Paid'; }
  return PAY_TEXT[r.pay] || 'Payment?';
}
export function splitMulti(s) {
  return String(s || '').split(/,\s*/).map(x => x.trim()).filter(Boolean);
}
export function cleanOption(s) {
  return String(s || '').trim().replace(/\.$/, '');
}

/* Turns whatever people typed into clickable links.
   "@name", "name", "Ig: name", "insta- name" → instagram.com/name; URLs stay as they are. */
const URL_RE = /(https?:\/\/[^\s,]+|(?:www\.)?(?:instagram\.com|linkedin\.com)\/[^\s,]+)/gi;
const HANDLE_RE = /^@?[A-Za-z0-9._]{2,30}$/;
export function socialLinks(socials) {
  const out = [];
  const seen = {};
  const add = (kind, href, label) => { if (!seen[href]) { seen[href] = 1; out.push({ kind, href, label }); } };

  (socials || []).forEach(raw => {
    let txt = String(raw || '');
    (txt.match(URL_RE) || []).forEach(u => {
      const href = /^https?:\/\//i.test(u) ? u : 'https://' + u;
      try {
        const url = new URL(href);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') return;
        const host = url.hostname.replace(/^www\./, '');
        if (host.endsWith('instagram.com')) {
          const h = url.pathname.split('/').filter(Boolean)[0];
          add('ig', h ? `https://instagram.com/${h}` : url.href, h ? `Instagram @${h}` : 'Instagram');
        } else if (host.endsWith('linkedin.com')) {
          add('li', url.href, 'LinkedIn');
        } else {
          add('link', url.href, host);
        }
      } catch {}
    });

    txt = txt.replace(URL_RE, ' ').replace(/\b(instagram|insta|ig|linkedin)\b\s*[:\-–]?/gi, ' ');
    const tokens = txt.split(/[\s,/|]+/).map(t => t.trim()).filter(Boolean);
    tokens.forEach(t => {
      if (!HANDLE_RE.test(t) || /^\d+$/.test(t.replace('@', ''))) return;
      const looksLikeHandle = t.startsWith('@') || /[._\d]/.test(t);
      if (!looksLikeHandle && tokens.length > 1) return;   // skip loose words like "Already shared"
      const h = t.replace(/^@/, '').replace(/\.$/, '');
      if (h.length < 2) return;
      add('ig', `https://instagram.com/${h}`, `Instagram @${h}`);
    });
  });
  return out;
}

/* Contacts: the server builds the .vcf from the event itself (no names or numbers in the link) */
export function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
// First time = no sign-up for any other event before this one, and no extra events added by you
export function isFirstTime(p, label, time) {
  if ((p.extra || 0) > 0) return false;
  return !p.history.some(h => h.label !== label && h.time < time);
}
export function openContacts(eventKey, who) {
  const mode = isIOS() ? 'inline' : 'attachment';
  window.location.href = `/api/us/vcf?event=${encodeURIComponent(eventKey)}&who=${who}&mode=${mode}`;
}

/* Crops to a square and shrinks to a small JPEG so it fits in one sheet cell */
export async function squarePhoto(file) {
  let src;
  try {
    src = await createImageBitmap(file);
  } catch {
    src = await new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable')); };
      img.src = url;
    });
  }
  const side = Math.min(src.width, src.height);
  const sx = (src.width - side) / 2, sy = (src.height - side) / 2;
  let out = '';
  for (const size of [PHOTO_SIDE, 200, 160]) {
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(src, sx, sy, side, side, 0, 0, size, size);
    for (let q = 0.82; q >= 0.5; q -= 0.08) {
      out = c.toDataURL('image/jpeg', q);
      if (out.length <= PHOTO_MAX_CHARS) break;
    }
    if (out.length <= PHOTO_MAX_CHARS) break;
  }
  if (src.close) src.close();
  if (out.length > PHOTO_MAX_CHARS) throw new Error('too big');
  return out;
}