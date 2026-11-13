"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const NEW_DAYS = 7;
const PHOTO_SIDE = 256;
const PHOTO_MAX_CHARS = 44000;
const CACHE_KEY = 'us-snapshot-v3';   // last data, kept only for this browser tab
const HOME = { screen: 'home', eventKey: null, openId: null };

const SORTS = [
  { id: 'latest', label: 'Latest sign-up' },
  { id: 'newest', label: 'Newest members' },
  { id: 'events', label: 'Most events' },
  { id: 'name', label: 'Name A–Z' },
  { id: 'young', label: 'Youngest first' },
  { id: 'old', label: 'Oldest first' },
  { id: 'oldest', label: 'Longest with us' },
];
const VIEWS = [
  { id: 'all', label: 'Everyone' },
  { id: 'week', label: 'Signed up this week' },
  { id: 'starred', label: '★ Starred' },
  { id: 'bday', label: 'Birthdays this month' },
  { id: 'pending', label: 'Payment pending' },
];
const EVENT_SORTS = [
  { id: 'latest', label: 'Latest sign-up' },
  { id: 'name', label: 'Name A–Z' },
  { id: 'young', label: 'Youngest first' },
  { id: 'old', label: 'Oldest first' },
];
const EVENT_FILTERS = [
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
const EXPENSE_CATEGORIES = ['Marketing', 'Travel', 'Food', 'Venue', 'Other'];
const PAY_TEXT = { paid: 'Paid', later: 'Pays on day', unpaid: 'Not paid', rejected: 'Rejected', out: 'Not coming' };

/* ── Helpers ── */
const displayName = (p) => p.nickname || p.name;
const cls = (s) => String(s).replace(/[^A-Za-z]/g, '');
const isRecent = (ms) => Date.now() - ms <= NEW_DAYS * 864e5;
const isExcluded = (r) => r.pay === 'rejected' || r.pay === 'out';   // left out of this event entirely
const inr = (n) => `${n < 0 ? '−' : ''}₹${Math.abs(Math.round(n || 0)).toLocaleString('en-IN')}`;
const shownAmount = (r) => (r.amount ?? r.defaultAmount ?? 0);

function initials(s) {
  return String(s || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';
}
function fmtDate(ms) {
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function shortDate(ms) {
  return new Date(ms).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}
function ago(ms) {
  const d = Math.floor((Date.now() - ms) / 864e5);
  if (d <= 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 30) return `${d} days ago`;
  const m = Math.floor(d / 30.44);
  if (m < 12) return `${m} ${m === 1 ? 'month' : 'months'} ago`;
  const y = Math.floor(m / 12);
  return `${y} ${y === 1 ? 'year' : 'years'} ago`;
}
function ageText(days) {
  if (days < 1) return 'Joined today';
  if (days < 60) return `${days} days`;
  const m = Math.floor(days / 30.44);
  if (m < 12) return `${m} months`;
  const y = Math.floor(m / 12), r = m % 12;
  return `${y} ${y > 1 ? 'years' : 'year'}${r ? ` ${r} mo` : ''}`;
}
function yearsText(p) {
  if (p.age == null) return '';
  return `${p.ageApprox ? '~' : ''}${p.age} yrs`;
}
function relDay(ms) {
  if (!ms) return null;
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const days = Math.round((ms - midnight) / 864e5);
  if (days === 0) return { text: 'Today', cls: 'now' };
  if (days === 1) return { text: 'Tomorrow', cls: 'soon' };
  if (days > 1) return { text: `In ${days} days`, cls: 'soon' };
  return { text: 'Just happened', cls: 'past' };
}
function tierFor(n, tiers) {
  for (const t of tiers) if (n >= t.min) return t.label;
  return tiers[tiers.length - 1].label;
}
function applyOverride(p, o, tiers) {
  const extra = o.extra || 0;
  const count = Math.max(0, p.autoCount + extra);
  const autoTier = tierFor(count, tiers);
  const tierOverride = tiers.some(t => t.label === o.tier) ? o.tier : '';
  return {
    ...p, nickname: o.nickname || '', extra, count, autoTier, tierOverride,
    tier: tierOverride || autoTier, starred: !!o.starred, notes: o.notes || '', photo: o.photo || '',
  };
}
const byAge = (dir, get) => (a, b) => {
  const x = get(a).age, y = get(b).age;
  if (x == null && y == null) return 0;
  if (x == null) return 1;
  if (y == null) return -1;
  return dir * (x - y);
};
function payLabel(r) {
  if (r.pay === 'paid') { const a = shownAmount(r); return a ? `Paid ${inr(a)}` : 'Paid'; }
  return PAY_TEXT[r.pay] || 'Payment?';
}

/* Turns whatever people typed into clickable links.
   "@name", "name", "Ig: name", "insta- name" → instagram.com/name; URLs stay as they are. */
const URL_RE = /(https?:\/\/[^\s,]+|(?:www\.)?(?:instagram\.com|linkedin\.com)\/[^\s,]+)/gi;
const HANDLE_RE = /^@?[A-Za-z0-9._]{2,30}$/;
function socialLinks(socials) {
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
function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
// First time = no sign-up for any other event before this one, and no extra events added by you
function isFirstTime(p, label, time) {
  if ((p.extra || 0) > 0) return false;
  return !p.history.some(h => h.label !== label && h.time < time);
}
function openContacts(eventKey, who) {
  const mode = isIOS() ? 'inline' : 'attachment';
  window.location.href = `/api/us/vcf?event=${encodeURIComponent(eventKey)}&who=${who}&mode=${mode}`;
}

/* Crops to a square and shrinks to a small JPEG so it fits in one sheet cell */
async function squarePhoto(file) {
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

function Avatar({ p, photo, size = 48 }) {
  const src = photo !== undefined ? photo : p.photo;
  return (
    <span className="av" style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }} aria-hidden="true">
      {src ? <img src={src} alt="" /> : initials(displayName(p))}
    </span>
  );
}

function Loader({ label }) {
  return (
    <div className="ldr">
      <svg className="tri" viewBox="0 0 46 42" aria-hidden="true"><path d="M23 3 L43 39 L3 39 Z" pathLength="100" /></svg>
      {label && <span>{label}</span>}
    </div>
  );
}

function useEscape(handler) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handler(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handler]);
}

/* ── One person: details + your edits ── */
function PersonDrawer({ p, tiers, onClose, onSaved, onLocked, onDirty }) {
  const [draft, setDraft] = useState({
    nickname: p.nickname, tier: p.tierOverride, extra: p.extra, starred: p.starred, notes: p.notes,
  });
  const [photo, setPhoto] = useState(undefined); // undefined = unchanged, '' = remove
  const [photoBusy, setPhotoBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);

  const dirty = draft.nickname !== p.nickname || draft.tier !== p.tierOverride || draft.extra !== p.extra ||
    draft.starred !== p.starred || draft.notes !== p.notes || photo !== undefined;
  const count = Math.max(0, p.autoCount + draft.extra);
  const autoTier = tierFor(count, tiers);
  const shownTier = draft.tier || autoTier;
  const shownPhoto = photo !== undefined ? photo : p.photo;
  const links = socialLinks(p.socials);
  const set = (k, v) => { setDraft(d => ({ ...d, [k]: v })); setMsg(''); };

  useEffect(() => { onDirty(dirty); }, [dirty, onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);

  const tryClose = useCallback(() => {
    if (dirty && !window.confirm('You have unsaved changes. Close anyway?')) return;
    onClose();
  }, [dirty, onClose]);
  useEscape(tryClose);

  const pickPhoto = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setMsg('Please choose an image.'); return; }
    setPhotoBusy(true); setMsg('');
    try { setPhoto(await squarePhoto(file)); }
    catch { setMsg("Couldn't use that image. Try another one."); }
    finally { setPhotoBusy(false); }
  };

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true); setMsg('');
    const patch = { nickname: draft.nickname.trim(), tier: draft.tier, extra: draft.extra, starred: draft.starred, notes: draft.notes };
    if (photo !== undefined) patch.photo = photo;
    try {
      const res = await fetch('/api/us/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id, patch }),
      });
      if (res.status === 401) { onLocked(); return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not save');
      onSaved(p.id, json);
      setDraft({ nickname: json.nickname, tier: json.tier, extra: json.extra, starred: json.starred, notes: json.notes });
      setPhoto(undefined);
      setMsg('Saved');
    } catch (err) {
      setMsg(err.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const firstName = displayName(p).split(' ')[0];

  return (
    <div className="drawer" onClick={(e) => { if (e.target === e.currentTarget) tryClose(); }}>
      <div className="panel" role="dialog" aria-modal="true" aria-label={displayName(p)}>
        <button type="button" className="x" onClick={tryClose} aria-label="Close">✕</button>

        <div className="phead">
          <div className="pav">
            <Avatar p={p} photo={photo} size={96} />
            <div className="pavbtns">
              <button type="button" className="mini" onClick={() => fileRef.current && fileRef.current.click()} disabled={photoBusy}>
                {photoBusy ? 'Preparing…' : shownPhoto ? 'Change photo' : 'Add photo'}
              </button>
              {shownPhoto && <button type="button" className="mini ghost" onClick={() => setPhoto('')}>Remove</button>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidefile" onChange={pickPhoto} />
          </div>
          <div className="pname">
            <span className={`badge b-${cls(shownTier)}`}>{shownTier}{draft.tier ? ' · set by you' : ''}</span>
            <h2>{draft.starred && <span className="star">★ </span>}{draft.nickname.trim() || p.name}</h2>
            {draft.nickname.trim() && <p className="sub">{p.name}</p>}
            {p.otherNames.length > 0 && <p className="sub">Also signed up as {p.otherNames.join(', ')}</p>}
          </div>
        </div>

        <div className="facts">
          <div className="fact"><span>Events</span><b>{count}</b></div>
          <div className="fact"><span>Forms</span><b>{p.forms.join(', ')}</b></div>
          <div className="fact"><span>With 3 AM for</span><b>{ageText(p.ageDays)}</b></div>
          <div className="fact"><span>Age</span><b>{yearsText(p) || '—'}</b></div>
          <div className="fact"><span>Birthday</span><b>{p.birthday || '—'}</b></div>
          <div className="fact"><span>Based in</span><b>{p.city || '—'}</b></div>
        </div>

        <section className="sect first">
          <h3>Contact</h3>
          {p.phone && (
            <p>+91 {p.phone} · <a href={`https://wa.me/91${p.phone}`} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></p>
          )}
          {links.map(l => (
            <p key={l.href}><a href={l.href} target="_blank" rel="noopener noreferrer">{l.label} ↗</a></p>
          ))}
          {links.length === 0 && p.socials.map(s => <p key={s} className="muted">{s}</p>)}
        </section>

        <section className="edit">
          <h3>Your notes on {firstName}</h3>
          <label className="fld">
            <span>Nickname</span>
            <input type="text" value={draft.nickname} maxLength={60} placeholder="e.g. The Director"
                   onChange={(e) => set('nickname', e.target.value)} />
          </label>
          <div className="row2">
            <label className="fld">
              <span>Tier</span>
              <select value={draft.tier} onChange={(e) => set('tier', e.target.value)}>
                <option value="">Auto ({autoTier})</option>
                {tiers.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
              </select>
            </label>
            <div className="fld">
              <span>Events</span>
              <div className="stepper">
                <button type="button" aria-label="One less" onClick={() => set('extra', Math.max(-p.autoCount, draft.extra - 1))}>−</button>
                <b>{count}</b>
                <button type="button" aria-label="One more" onClick={() => set('extra', Math.min(100, draft.extra + 1))}>+</button>
              </div>
              <small>{p.autoCount} from forms{draft.extra ? ` ${draft.extra > 0 ? '+' : '−'} ${Math.abs(draft.extra)} by you` : ''}</small>
            </div>
          </div>
          <label className="check">
            <input type="checkbox" checked={draft.starred} onChange={(e) => set('starred', e.target.checked)} />
            <span>★ Star this person</span>
          </label>
          <label className="fld">
            <span>Private notes</span>
            <textarea rows={3} maxLength={1500} value={draft.notes} placeholder="Anything worth remembering"
                      onChange={(e) => set('notes', e.target.value)} />
          </label>
          <div className="saverow">
            <button type="button" className="save" onClick={save} disabled={!dirty || saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {msg && <span className={msg === 'Saved' ? 'ok' : 'bad'} role="status">{msg}</span>}
          </div>
        </section>

        {(p.vibe || p.experience || p.roles) && (
          <section className="sect">
            <h3>About</h3>
            {p.vibe && <p><em>Vibe:</em> {p.vibe}</p>}
            {p.experience && <p><em>Filmmaking:</em> {p.experience}</p>}
            {p.roles && <p><em>Into:</em> {p.roles}</p>}
          </section>
        )}

        <section className="sect">
          <h3>History</h3>
          <ol className="hist">
            {p.history.slice().reverse().map((h, i) => (
              <li key={i}>
                <b>{h.label}</b>
                <span>
                  {fmtDate(h.time)}
                  {h.pass ? ` · ${h.pass}` : ''}
                  {h.pay === 'paid' ? ` · Paid${h.amount ? ` ${inr(h.amount)}` : ''}` : h.pay ? ` · ${PAY_TEXT[h.pay]}` : ''}
                  {h.attended === true ? ' · Checked in ✓' : ''}
                </span>
                {h.why && <q>{h.why}</q>}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

/* ── Pick a producer from your people ── */
function ProducerPicker({ people, exclude, onPick, onClose }) {
  const [q, setQ] = useState('');
  useEscape(onClose);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const d = t.replace(/\D/g, '');
    return people
      .filter(p => !exclude.includes(p.id))
      .filter(p => !t || [p.name, p.nickname, ...p.otherNames].join(' ').toLowerCase().includes(t) ||
        (d.length >= 3 && p.phone.includes(d)))
      .sort((a, b) => b.count - a.count || b.last - a.last)
      .slice(0, 40);
  }, [q, people, exclude]);

  return (
    <div className="modalwrap" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Add producer">
        <div className="mhead">
          <h3>Add producer</h3>
          <button type="button" className="mini ghost" onClick={onClose}>Close</button>
        </div>
        <div className="msearch">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} autoFocus
                 placeholder="Search name or phone" aria-label="Search people" />
        </div>
        <div className="plist">
          {list.length === 0 && <p className="muted pad">No one matches that.</p>}
          {list.map(p => (
            <button key={p.id} type="button" className="pitem" onClick={() => onPick(p.id)}>
              <Avatar p={p} size={38} />
              <span className="ptext">
                <b>{displayName(p)}</b>
                <span className="meta">{p.tier} · {p.count} {p.count === 1 ? 'event' : 'events'}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Payment and status for one registration ── */
function PayModal({ row, price, onSave, onClose }) {
  const def = row.defaultAmount || price || 0;
  const current = row.amount;
  const [other, setOther] = useState(row.pay === 'paid' && current != null && current !== def ? String(current) : '');
  const [busy, setBusy] = useState(false);
  useEscape(onClose);

  const choose = async (patch) => {
    setBusy(true);
    await onSave(patch);
    setBusy(false);
    onClose();
  };
  const otherNum = other === '' ? NaN : parseInt(other, 10);
  const proof = /^https?:\/\//i.test(row.screenshot || '') ? row.screenshot : '';

  return (
    <div className="modalwrap" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Payment">
        <div className="mhead">
          <h3>Payment</h3>
          <button type="button" className="mini ghost" onClick={onClose}>Close</button>
        </div>
        <div className="mbody">
          <p className="who">
            <b>{displayName(row.p)}</b>
            {row.payment ? <span className="muted"> · Sheet says: {row.payment}</span> : null}
          </p>
          {proof && <a className="mini linkbtn" href={proof} target="_blank" rel="noopener noreferrer">Open payment screenshot ↗</a>}

          <div className="payopts">
            {def > 0 && (
              <button type="button" className={`payopt good ${row.pay === 'paid' && (current == null || current === def) ? 'on' : ''}`}
                      disabled={busy} onClick={() => choose({ pay: 'paid', amount: def })}>
                Paid {inr(def)}
              </button>
            )}
            <div className="payother">
              <input type="number" inputMode="numeric" min="0" placeholder="Other amount (discount)"
                     value={other} onChange={(e) => setOther(e.target.value)} aria-label="Other amount" />
              <button type="button" className="payopt good" disabled={busy || !(otherNum >= 0)}
                      onClick={() => choose({ pay: 'paid', amount: otherNum })}>
                Paid this
              </button>
            </div>
            <button type="button" className={`payopt later ${row.pay === 'later' ? 'on' : ''}`}
                    disabled={busy} onClick={() => choose({ pay: 'later', amount: null })}>
              Will pay on event day
            </button>
            <button type="button" className={`payopt ${row.pay === 'unpaid' ? 'on' : ''}`}
                    disabled={busy} onClick={() => choose({ pay: 'unpaid', amount: null })}>
              Not paid yet
            </button>

            <p className="optgroup">Leave them out of this event</p>
            <button type="button" className={`payopt away ${row.pay === 'out' ? 'on' : ''}`}
                    disabled={busy} onClick={() => choose({ pay: 'out', amount: null })}>
              Not coming
              <small>Cancelled, didn&apos;t show up, or just test data</small>
            </button>
            <button type="button" className={`payopt reject ${row.pay === 'rejected' ? 'on' : ''}`} disabled={busy}
                    onClick={() => { if (window.confirm(`Reject ${displayName(row.p)}'s registration? They won't count anywhere.`)) choose({ pay: 'rejected', amount: null }); }}>
              Reject registration
              <small>For spam, fake or unwanted registrations</small>
            </button>
            {row.pay && (
              <button type="button" className="link" disabled={busy} onClick={() => choose({ pay: '', amount: null })}>
                Clear (back to needs review)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Expenses for one event ── */
function ExpenseModal({ ev, onAdd, onDelete, onClose }) {
  const [cat, setCat] = useState(EXPENSE_CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [amt, setAmt] = useState('');
  const [busy, setBusy] = useState(false);
  useEscape(onClose);

  const total = ev.expenses.reduce((s, x) => s + (x.amount || 0), 0);
  const n = parseInt(amt, 10);

  const add = async () => {
    if (!(n > 0) || busy) return;
    setBusy(true);
    const ok = await onAdd({ category: cat, note: note.trim(), amount: n });
    setBusy(false);
    if (ok) { setNote(''); setAmt(''); }
  };

  return (
    <div className="modalwrap" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Expenses">
        <div className="mhead">
          <h3>Expenses · {inr(total)}</h3>
          <button type="button" className="mini ghost" onClick={onClose}>Done</button>
        </div>
        <div className="mbody">
          <div className="chips" role="group" aria-label="Category">
            {EXPENSE_CATEGORIES.map(c => (
              <button key={c} type="button" className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div className="expadd">
            <input type="text" value={note} maxLength={120} placeholder="What for? (optional)" onChange={(e) => setNote(e.target.value)} aria-label="Note" />
            <input type="number" inputMode="numeric" min="1" value={amt} placeholder="₹ Amount" onChange={(e) => setAmt(e.target.value)} aria-label="Amount" />
            <button type="button" className="save" onClick={add} disabled={!(n > 0) || busy}>{busy ? 'Adding…' : 'Add'}</button>
          </div>

          {ev.expenses.length === 0 ? (
            <p className="muted">No expenses yet.</p>
          ) : (
            <ul className="explist">
              {ev.expenses.map(x => (
                <li key={x.id}>
                  <span className="expcat">{x.category}</span>
                  <span className="expnote">{x.note || '—'}</span>
                  <b>{inr(x.amount)}</b>
                  <button type="button" className="slotx" aria-label={`Delete ${x.category} expense`}
                          onClick={() => { if (window.confirm(`Delete this ${x.category} expense of ${inr(x.amount)}?`)) onDelete(x.id); }}>✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── One event ── */
function EventView({ ev, people, peopleById, maxProducers, readOnly, onBack, onOpen, onLocked, onEventUpdate }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('latest');
  const [picking, setPicking] = useState(false);
  const [payFor, setPayFor] = useState(null);     // personId
  const [expOpen, setExpOpen] = useState(false);
  const [msg, setMsg] = useState('');

  // Registrations + producers (producers show up even if they didn't register)
  const roster = useMemo(() => {
    const list = ev.regs
      .map(r => ({ ...r, p: peopleById[r.personId], producer: ev.producers.includes(r.personId) }))
      .filter(r => r.p);
    const seen = new Set(list.map(r => r.personId));
    ev.producers.forEach(pid => {
      if (!seen.has(pid) && peopleById[pid]) {
        list.push({ personId: pid, p: peopleById[pid], producer: true, producerOnly: true, time: 0, pay: '', amount: null, defaultAmount: 0, attended: false });
      }
    });
    return list;
  }, [ev.regs, ev.producers, peopleById]);

  const money = useMemo(() => {
    let collected = 0, paidN = 0, due = 0, dueN = 0, rejected = 0, away = 0, review = 0, inn = 0, active = 0;
    roster.forEach(r => {
      if (r.producerOnly) return;
      if (r.pay === 'rejected') { rejected++; return; }
      if (r.pay === 'out') { away++; return; }
      active++;
      if (r.pay === 'paid') { collected += shownAmount(r); paidN++; }
      else if (r.pay === 'later') { due += shownAmount(r); dueN++; }
      else if (!r.pay) review++;
      if (r.attended) inn++;
    });
    const spent = (ev.expenses || []).reduce((s, x) => s + (x.amount || 0), 0);
    return { collected, paidN, due, dueN, rejected, away, review, inn, active, spent, net: collected - spent };
  }, [roster, ev.expenses]);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    const d = t.replace(/\D/g, '');
    const arr = roster.filter(r => {
      if (filter === 'rejected') { if (r.pay !== 'rejected') return false; }
      else if (filter === 'away') { if (r.pay !== 'out') return false; }
      else {
        if (isExcluded(r)) return false;
        if (filter === 'review' && (r.producerOnly || r.pay)) return false;
        if (filter === 'paid' && r.pay !== 'paid') return false;
        if (filter === 'later' && r.pay !== 'later') return false;
        if (filter === 'unpaid' && r.pay !== 'unpaid') return false;
        if (filter === 'in' && !r.attended) return false;
        if (filter === 'notin' && (r.attended || r.producerOnly)) return false;
      }
      if (t) {
        const hay = [r.p.name, r.p.nickname, ...r.p.otherNames, ...r.p.socials].join(' ').toLowerCase();
        if (!hay.includes(t) && !(d.length >= 3 && r.p.phone.includes(d))) return false;
      }
      return true;
    });
    const by = {
      latest: (a, b) => b.time - a.time,
      name: (a, b) => displayName(a.p).localeCompare(displayName(b.p)),
      young: byAge(1, r => r.p),
      old: byAge(-1, r => r.p),
    };
    const base = by[sort] || by.latest;
    return arr.sort((a, b) => (b.producer ? 1 : 0) - (a.producer ? 1 : 0) || base(a, b));
  }, [roster, q, filter, sort]);

  const post = async (body) => {
    const res = await fetch('/api/us/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 401) { onLocked(); throw new Error('Locked'); }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Could not save');
    return json;
  };

  const updateRow = (pid, patch) => onEventUpdate(ev.key, e => ({
    ...e, regs: e.regs.map(x => (x.personId === pid ? { ...x, ...patch } : x)),
  }));

  const savePay = async (row, patch) => {
    const prev = { pay: row.pay, amount: row.amount };
    updateRow(row.personId, { pay: patch.pay, amount: patch.amount ?? null });
    setMsg('');
    try { await post({ kind: 'mark', eventId: ev.key, personId: row.personId, patch }); }
    catch (err) { updateRow(row.personId, prev); setMsg(`Not saved: ${err.message}`); }
  };

  const toggleIn = async (row) => {
    const next = !row.attended;
    updateRow(row.personId, { attended: next });
    setMsg('');
    try { await post({ kind: 'mark', eventId: ev.key, personId: row.personId, patch: { attended: next } }); }
    catch (err) { updateRow(row.personId, { attended: !next }); setMsg(`Not saved: ${err.message}`); }
  };

  const saveProducers = async (ids) => {
    const prev = ev.producers;
    onEventUpdate(ev.key, e => ({ ...e, producers: ids }));
    setMsg('');
    try { await post({ kind: 'producers', eventId: ev.key, producers: ids }); }
    catch (err) { onEventUpdate(ev.key, e => ({ ...e, producers: prev })); setMsg(`Not saved: ${err.message}`); }
  };

  const addExpense = async (x) => {
    try {
      const res = await post({ kind: 'expense', eventId: ev.key, op: 'add', ...x });
      onEventUpdate(ev.key, e => ({ ...e, expenses: res.expenses }));
      return true;
    } catch (err) { setMsg(`Not saved: ${err.message}`); return false; }
  };
  const deleteExpense = async (id) => {
    const prev = ev.expenses;
    onEventUpdate(ev.key, e => ({ ...e, expenses: e.expenses.filter(x => x.id !== id) }));
    try {
      const res = await post({ kind: 'expense', eventId: ev.key, op: 'delete', id });
      onEventUpdate(ev.key, e => ({ ...e, expenses: res.expenses }));
    } catch (err) {
      onEventUpdate(ev.key, e => ({ ...e, expenses: prev }));
      setMsg(`Not saved: ${err.message}`);
    }
  };

  // Contacts to save: never producers, rejected or not coming. "New" = first time with 3 AM.
  const evLabel = ev.title + (ev.tag ? ' · ' + ev.tag : '');
  const saveable = roster.filter(r => !r.producer && !r.producerOnly && !isExcluded(r) && r.p.phone);
  const newCount = saveable.filter(r => isFirstTime(r.p, evLabel, r.time)).length;
  const doExport = (who) => {
    const n = who === 'new' ? newCount : saveable.length;
    if (!n) { setMsg(who === 'new' ? 'No first-timers to save.' : 'No phone numbers to save.'); return; }
    setMsg(`Preparing ${n} contacts…`);
    openContacts(ev.key, who);
  };

  const slots = Math.min(maxProducers, Math.max(2, ev.producers.length + 1));
  const where = [ev.date ? shortDate(ev.date) : (readOnly ? '' : 'Date TBA'), ev.time, ev.location].filter(Boolean).join(' · ');
  const payRow = payFor ? roster.find(r => r.personId === payFor) : null;

  return (
    <div className="evview">
      <div className="evhead">
        <button type="button" className="back" onClick={onBack}>← Back</button>
        {ev.tag && <span className="evtag">{ev.tag}</span>}
        <h2>{ev.title}</h2>
        {where && <p className="meta">{where}</p>}
        <p className="evstats">
          <b>{readOnly ? roster.length : money.active}</b>{ev.capacity ? ` / ${ev.capacity}` : ''} registered
          {!readOnly && (
            <>
              {' · '}<b>{money.inn}</b> checked in
              {money.review ? <> · <b>{money.review}</b> to review</> : null}
              {money.away ? <> · {money.away} not coming</> : null}
              {money.rejected ? <> · {money.rejected} rejected</> : null}
            </>
          )}
        </p>
        {readOnly && (
          <p className="muted">
            Recent sign-ups that couldn&apos;t be matched to an event. Check that the event is in your CMS sheet and its ID starts with the form name (ODC, BCC).
          </p>
        )}
      </div>

      {!readOnly && (
        <div className="money">
          <div className="mbox">
            <span>Collection</span>
            <b>{inr(money.collected)}</b>
            <small>{money.paidN} paid{money.due ? ` · ${inr(money.due)} due on the day` : ''}</small>
          </div>
          <button type="button" className="mbox exp" onClick={() => setExpOpen(true)}>
            <span>Expenses</span>
            <b>{inr(money.spent)}</b>
            <small>{ev.expenses.length ? `${ev.expenses.length} items · tap to edit` : '+ Add expense'}</small>
          </button>
          <div className={`mbox net ${money.net < 0 ? 'neg' : ''}`}>
            <span>Net profit</span>
            <b>{inr(money.net)}</b>
            <small>{money.due ? `${inr(money.net + money.due)} if day-of payments come in` : 'Collection minus expenses'}</small>
          </div>
        </div>
      )}

      {!readOnly && (
        <section className="prods">
          <h3>Producers</h3>
          <div className="slots">
            {Array.from({ length: slots }).map((_, i) => {
              const pid = ev.producers[i];
              const p = pid && peopleById[pid];
              return p ? (
                <div className="slot filled" key={pid}>
                  <button type="button" className="slotmain" onClick={() => onOpen(pid)}>
                    <Avatar p={p} size={72} />
                    <span className="slotname">{displayName(p)}</span>
                  </button>
                  <button type="button" className="slotx corner" aria-label={`Remove ${displayName(p)}`}
                          onClick={() => saveProducers(ev.producers.filter(x => x !== pid))}>✕</button>
                </div>
              ) : (
                <button type="button" className="slot empty" key={`empty-${i}`} onClick={() => setPicking(true)}>
                  <span className="plus">+</span>
                  <span>Add producer</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="evtools">
        <input className="search" type="search" value={q} onChange={(e) => setQ(e.target.value)}
               placeholder="Search name, phone or handle" aria-label="Search registrations" />
        {!readOnly && (
          <div className="chips scroll" role="group" aria-label="Filter">
            {EVENT_FILTERS.map(f => (
              <button key={f.id} type="button" className={`chip soft ${filter === f.id ? 'on' : ''}`} onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        )}
        <div className="line">
          <label className="inline-sel"><span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {EVENT_SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
          {!readOnly && (
            <div className="exports">
              <button type="button" className="export" onClick={() => doExport('new')} disabled={!newCount}>
                Save new contacts ({newCount})
              </button>
              <button type="button" className="export ghost" onClick={() => doExport('all')} disabled={!saveable.length}>
                Save all ({saveable.length})
              </button>
            </div>
          )}
        </div>
        <p className="muted">Showing {rows.length}</p>
        {msg && <p className={msg.startsWith('Not saved') || msg.startsWith('No ') ? 'bad' : 'ok'} role="status">{msg}</p>}
      </div>

      {rows.length === 0 ? (
        <p className="empty">{roster.length ? 'No one matches that.' : 'No registrations yet.'}</p>
      ) : (
        <div className="rows">
          {rows.map(r => {
            const ig = socialLinks(r.p.socials).find(l => l.kind === 'ig');
            const proof = /^https?:\/\//i.test(r.screenshot || '') ? r.screenshot : '';
            const firstTime = !readOnly && !r.producerOnly && !isExcluded(r) && isFirstTime(r.p, evLabel, r.time);
            return (
              <div className={`row ${isExcluded(r) ? 'excluded' : ''}`} key={r.personId}>
                <button type="button" className="rowmain" onClick={() => onOpen(r.personId)}>
                  <Avatar p={r.p} size={44} />
                  <span className="rowtext">
                    <span className="rowname">
                      {r.p.starred && <span className="star">★ </span>}{displayName(r.p)}
                      {r.producer && <span className="prodtag">Producer</span>}
                    </span>
                    <span className="meta">
                      {[firstTime ? 'First time' : null, yearsText(r.p), r.p.tier, readOnly ? r.form : null,
                        r.producerOnly ? 'Team' : `signed up ${ago(r.time)}`].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                </button>
                <div className="rowacts">
                  {ig && <a className="ico" href={ig.href} target="_blank" rel="noopener noreferrer" aria-label={ig.label}>IG</a>}
                  {r.p.phone && <a className="ico" href={`https://wa.me/91${r.p.phone}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">WA</a>}
                  {proof && <a className="ico" href={proof} target="_blank" rel="noopener noreferrer" aria-label="Payment screenshot">Proof</a>}
                  {!readOnly && !r.producerOnly && (
                    <>
                      <button type="button" className={`tick pay ${r.pay || 'none'}`} onClick={() => setPayFor(r.personId)}>
                        {payLabel(r)}
                      </button>
                      {!isExcluded(r) && (
                        <button type="button" className={`tick in ${r.attended ? 'on' : ''}`} aria-pressed={r.attended} onClick={() => toggleIn(r)}>
                          {r.attended ? 'Here ✓' : 'Check in'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {picking && (
        <ProducerPicker people={people} exclude={ev.producers}
                        onPick={(id) => { setPicking(false); saveProducers([...ev.producers, id]); }}
                        onClose={() => setPicking(false)} />
      )}
      {payRow && (
        <PayModal row={payRow} price={ev.price} onClose={() => setPayFor(null)}
                  onSave={(patch) => savePay(payRow, patch)} />
      )}
      {expOpen && (
        <ExpenseModal ev={ev} onClose={() => setExpOpen(false)} onAdd={addExpense} onDelete={deleteExpense} />
      )}
    </div>
  );
}

/* ── Everyone: the full directory ── */
function EveryoneView({ data, onBack, onOpen }) {
  const [q, setQ] = useState('');
  const [view, setView] = useState('all');
  const [tier, setTier] = useState('All');
  const [form, setForm] = useState('All');
  const [label, setLabel] = useState('All');
  const [sort, setSort] = useState('latest');

  const stats = useMemo(() => {
    const m = new Date().getMonth();
    let returning = 0, bdays = 0, week = 0;
    data.people.forEach(p => {
      if (p.count >= 2) returning++;
      if (p.bm === m + 1) bdays++;
      if (isRecent(p.last)) week++;
    });
    return { total: data.people.length, returning, bdays, week };
  }, [data]);

  const tierCounts = useMemo(() => {
    const c = { All: data.people.length };
    data.people.forEach(p => { c[p.tier] = (c[p.tier] || 0) + 1; });
    return c;
  }, [data]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const digits = term.replace(/\D/g, '');
    const month = new Date().getMonth() + 1;
    const arr = data.people.filter(p => {
      if (tier !== 'All' && p.tier !== tier) return false;
      if (form !== 'All' && !p.forms.includes(form)) return false;
      if (label !== 'All' && !p.labels.includes(label)) return false;
      if (view === 'week' && !isRecent(p.last)) return false;
      if (view === 'starred' && !p.starred) return false;
      if (view === 'bday' && p.bm !== month) return false;
      if (view === 'pending' && !/pending/i.test(p.lastPayment || '')) return false;
      if (term) {
        const hay = [p.name, p.nickname, ...p.otherNames, ...p.socials, p.city, p.notes].join(' ').toLowerCase();
        if (!hay.includes(term) && !(digits.length >= 3 && p.phone.includes(digits))) return false;
      }
      return true;
    });
    const by = {
      latest: (a, b) => b.last - a.last,
      newest: (a, b) => b.first - a.first,
      events: (a, b) => b.count - a.count || b.last - a.last,
      name: (a, b) => displayName(a).localeCompare(displayName(b)),
      young: byAge(1, p => p),
      old: byAge(-1, p => p),
      oldest: (a, b) => a.first - b.first,
    };
    if (view === 'bday') arr.sort((a, b) => a.bd - b.bd);
    else arr.sort(by[sort] || by.latest);
    return arr;
  }, [data, q, view, tier, form, label, sort]);

  const filtersOn = q || view !== 'all' || tier !== 'All' || form !== 'All' || label !== 'All';
  const resetFilters = () => { setQ(''); setView('all'); setTier('All'); setForm('All'); setLabel('All'); };

  return (
    <div>
      <div className="evhead">
        <button type="button" className="back" onClick={onBack}>← Back</button>
        <h2>Everyone</h2>
      </div>

      <div className="stats">
        <button type="button" className={`stat ${view === 'all' && !filtersOn ? 'on' : ''}`} onClick={resetFilters}>
          <b>{stats.total}</b><span>People</span>
        </button>
        <button type="button" className={`stat ${view === 'week' ? 'on' : ''}`} onClick={() => { setView('week'); setSort('latest'); }}>
          <b>{stats.week}</b><span>Signed up this week</span>
        </button>
        <button type="button" className={`stat ${sort === 'events' && view === 'all' ? 'on' : ''}`} onClick={() => { setView('all'); setSort('events'); }}>
          <b>{stats.returning}</b><span>Came back 2+ times</span>
        </button>
        <button type="button" className={`stat ${view === 'bday' ? 'on' : ''}`} onClick={() => setView('bday')}>
          <b>{stats.bdays}</b><span>Birthdays this month</span>
        </button>
      </div>

      <div className="tools">
        <input className="search" type="search" value={q} onChange={(e) => setQ(e.target.value)}
               placeholder="Search name, nickname, phone, handle, area or notes" aria-label="Search" />
        <div className="chips" role="group" aria-label="Tier">
          {['All', ...data.tiers.map(t => t.label)].map(t => (
            <button key={t} type="button" className={`chip ${tier === t ? 'on' : ''}`} onClick={() => setTier(t)}>
              {t}<b>{tierCounts[t] || 0}</b>
            </button>
          ))}
        </div>
        <div className="chips scroll" role="group" aria-label="Quick filters">
          {VIEWS.map(v => (
            <button key={v.id} type="button" className={`chip soft ${view === v.id ? 'on' : ''}`} onClick={() => setView(v.id)}>
              {v.label}
            </button>
          ))}
        </div>
        <div className="selects">
          <label><span>Form</span>
            <select value={form} onChange={(e) => setForm(e.target.value)}>
              <option value="All">All forms</option>
              {data.forms.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <label><span>Event</span>
            <select value={label} onChange={(e) => setLabel(e.target.value)}>
              <option value="All">All events</option>
              {data.labels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <label><span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} disabled={view === 'bday'}>
              {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>
        <div className="count">
          Showing {list.length} of {data.people.length}
          {filtersOn && <button type="button" className="link" onClick={resetFilters}>Clear filters</button>}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="empty">No one matches that.</p>
      ) : (
        <div className="grid">
          {list.map(p => (
            <button key={p.id} type="button" className="card" onClick={() => onOpen(p.id)}>
              <Avatar p={p} size={52} />
              <span className="cbody">
                <span className="ctop">
                  <span className={`badge b-${cls(p.tier)}`}>{p.tier}</span>
                  {p.starred && <span className="star" aria-label="Starred">★</span>}
                  {isRecent(p.last) && <span className="newtag">New sign-up</span>}
                </span>
                <span className="name">{displayName(p)}</span>
                {p.nickname && <span className="real">{p.name}</span>}
                <span className="meta">
                  {[yearsText(p), `${p.count} ${p.count === 1 ? 'event' : 'events'}`, `signed up ${ago(p.last)}`].filter(Boolean).join(' · ')}
                  {view === 'bday' && p.birthday ? ` · 🎂 ${p.birthday}` : ''}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Producers across all events ── */
function ProducersView({ data, peopleById, onBack, onOpen }) {
  const list = (data.producerBoard || []).map(x => ({ ...x, p: peopleById[x.personId] })).filter(x => x.p);
  return (
    <div>
      <div className="evhead">
        <button type="button" className="back" onClick={onBack}>← Back</button>
        <h2>Producers</h2>
        <p className="meta">Everyone you&apos;ve made a producer on any event.</p>
      </div>
      {list.length === 0 ? (
        <p className="empty">No producers yet. Add them from an event.</p>
      ) : (
        <div className="grid">
          {list.map(x => (
            <button key={x.personId} type="button" className="card" onClick={() => onOpen(x.personId)}>
              <Avatar p={x.p} size={56} />
              <span className="cbody">
                <span className="name">{displayName(x.p)}</span>
                <span className="meta">Produced {x.events.length} {x.events.length === 1 ? 'event' : 'events'}</span>
                <span className="evchips">
                  {x.events.slice(0, 6).map(e => <span key={e.key} className="evchip">{e.tag || e.title}</span>)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Home: tiles ── */
function EventTile({ ev, featured, onClick }) {
  const active = ev.regs.filter(r => !isExcluded(r));
  const paid = active.filter(r => r.pay === 'paid');
  const collected = paid.reduce((s, r) => s + shownAmount(r), 0);
  const inn = active.filter(r => r.attended).length;
  const when = relDay(ev.date);
  return (
    <button type="button" className={`tile ${featured ? 'featured' : ''}`} onClick={onClick}>
      <span className="ttop">
        <span className="ttag">{ev.tag || ev.form}</span>
        {when && <span className={`twhen ${when.cls}`}>{when.text}</span>}
      </span>
      <span className="ttitle">{ev.title}</span>
      <span className="tdate">{ev.date ? shortDate(ev.date) : 'Date TBA'}{ev.time ? ` · ${ev.time}` : ''}</span>
      <span className="tcount"><b>{active.length}</b>{ev.capacity ? ` / ${ev.capacity}` : ''} registered</span>
      <span className="tsub">{paid.length} paid · {inr(collected)} collected · {inn} in</span>
    </button>
  );
}

function HomeView({ data, onEvent, onScreen }) {
  const [first, ...rest] = data.events;
  const producers = (data.producerBoard || []).length;
  return (
    <div>
      <div className="tiles">
        {first && <EventTile ev={first} featured onClick={() => onEvent(first.key)} />}
        <button type="button" className="tile everyone" onClick={() => onScreen('everyone')}>
          <span className="ttop"><span className="ttag">Directory</span></span>
          <span className="ttitle">Everyone</span>
          <span className="tcount"><b>{data.people.length}</b> people</span>
          <span className="tsub">Search, tiers, birthdays, notes</span>
        </button>
        <button type="button" className="tile" onClick={() => onScreen('producers')}>
          <span className="ttop"><span className="ttag">Team</span></span>
          <span className="ttitle">Producers</span>
          <span className="tcount"><b>{producers}</b> {producers === 1 ? 'producer' : 'producers'}</span>
          <span className="tsub">Who produced which event</span>
        </button>
        {rest.map(ev => <EventTile key={ev.key} ev={ev} onClick={() => onEvent(ev.key)} />)}
        {data.unassigned.length > 0 && (
          <button type="button" className="tile unassigned" onClick={() => onScreen('unassigned')}>
            <span className="ttop"><span className="ttag">Check these</span></span>
            <span className="ttitle">Unassigned</span>
            <span className="tcount"><b>{data.unassigned.length}</b> sign-ups</span>
            <span className="tsub">Couldn&apos;t be matched to an event</span>
          </button>
        )}
      </div>
      {data.events.length === 0 && (
        <p className="muted">
          No upcoming events found. Events appear here when they&apos;re in your CMS sheet with an ID starting with ODC or BCC.
        </p>
      )}
    </div>
  );
}

/* ── The page ── */
export default function UsPage() {
  const [phase, setPhase] = useState('checking'); // checking | locked | ready
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState('');
  const [pin, setPin] = useState('');
  const [pinErr, setPinErr] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [leaveAsk, setLeaveAsk] = useState(false);

  const [screen, setScreen] = useState('home');   // home | event | everyone | producers | unassigned
  const [eventKey, setEventKey] = useState(null);
  const [openId, setOpenId] = useState(null);
  const navRef = useRef(HOME);
  const navReady = useRef(false);
  const dirtyRef = useRef(false);

  /* Navigation that works with the phone's back swipe and the browser back button */
  const apply = useCallback((s) => {
    navRef.current = s;
    setScreen(s.screen); setEventKey(s.eventKey); setOpenId(s.openId);
  }, []);
  const push = useCallback((patch) => {
    const s = { ...navRef.current, ...patch };
    window.history.pushState({ us: true, ...s }, '');
    apply(s);
  }, [apply]);
  const goScreen = useCallback((screenName, key = null) => {
    push({ screen: screenName, eventKey: key, openId: null });
    window.scrollTo({ top: 0 });
  }, [push]);
  const openPerson = useCallback((id) => push({ openId: id }), [push]);
  const back = useCallback(() => { dirtyRef.current = false; window.history.back(); }, []);
  const setDirty = useCallback((v) => { dirtyRef.current = v; }, []);

  useEffect(() => {
    const onPop = (e) => {
      const s = e.state;
      if (s && s.us === true) {
        const cur = navRef.current;
        if (cur.openId && !s.openId && dirtyRef.current &&
            !window.confirm('You have unsaved changes. Discard them?')) {
          window.history.pushState({ us: true, ...cur }, '');
          return;
        }
        dirtyRef.current = false;
        apply({ screen: s.screen || 'home', eventKey: s.eventKey || null, openId: s.openId || null });
        return;
      }
      if (s && s.us === 'root') {   // back pressed on the home screen
        window.history.pushState({ us: true, ...HOME }, '');
        apply(HOME);
        setLeaveAsk(true);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [apply]);

  useEffect(() => {
    if (phase !== 'ready' || navReady.current) return;
    navReady.current = true;
    const st = window.history.state;
    if (st && st.us === true) {
      apply({ screen: st.screen || 'home', eventKey: st.eventKey || null, openId: st.openId || null });
    } else {
      window.history.replaceState({ us: 'root' }, '');
      window.history.pushState({ us: true, ...HOME }, '');
      apply(HOME);
    }
  }, [phase, apply]);

  /* Data: show the last copy instantly, then refresh in the background */
  const load = useCallback(async () => {
    setLoading(true); setLoadErr('');
    try {
      const res = await fetch('/api/us/people', { cache: 'no-store' });
      if (res.status === 401) {
        try { sessionStorage.removeItem(CACHE_KEY); } catch {}
        setData(null); setPhase('locked');
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not load');
      setData(json);
      setPhase('ready');
    } catch (err) {
      setLoadErr(err.message || 'Could not load');
      setPhase(p => (p === 'checking' ? 'locked' : p));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) { setData(JSON.parse(raw)); setPhase('ready'); }
    } catch {}
    load();
  }, [load]);

  useEffect(() => {
    if (!data) return;
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
  }, [data]);

  const unlock = async (e) => {
    e.preventDefault();
    if (!pin || unlocking) return;
    setUnlocking(true); setPinErr('');
    try {
      const res = await fetch('/api/us/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setPinErr(j.error || 'Wrong PIN');
        return;
      }
      setPin('');
      setPhase('checking');
      await load();
    } catch {
      setPinErr('Network problem. Try again.');
    } finally {
      setUnlocking(false);
    }
  };

  const lock = useCallback(async () => {
    await fetch('/api/us/login', { method: 'DELETE' }).catch(() => {});
    try { sessionStorage.removeItem(CACHE_KEY); } catch {}
    setData(null);
    apply(HOME);
    setPhase('locked');
  }, [apply]);

  const onSaved = useCallback((id, override) => {
    setData(d => d && ({ ...d, people: d.people.map(p => (p.id === id ? applyOverride(p, override, d.tiers) : p)) }));
  }, []);

  const onEventUpdate = useCallback((key, fn) => {
    setData(d => d && ({ ...d, events: d.events.map(e => (e.key === key ? fn(e) : e)) }));
  }, []);

  useEffect(() => {
    if (!openId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [openId]);

  const peopleById = useMemo(() => {
    const m = {};
    if (data) data.people.forEach(p => { m[p.id] = p; });
    return m;
  }, [data]);

  const currentEvent = data && screen === 'event' ? data.events.find(e => e.key === eventKey) : null;
  const unassignedEvent = useMemo(() => (data ? {
    key: '__unassigned', title: 'Unassigned sign-ups', tag: '', form: '', date: null, time: '', location: '',
    capacity: 0, price: 0, producers: [], expenses: [],
    regs: data.unassigned.map(r => ({ ...r, pay: '', amount: null, defaultAmount: 0, attended: false })),
  } : null), [data]);
  const personOpen = data && openId ? peopleById[openId] : null;

  return (
    <div className="us">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {phase === 'checking' && <div className="center"><Loader label="Loading your people…" /></div>}

      {phase === 'locked' && (
        <div className="center">
          <form className="lockbox" onSubmit={unlock}>
            <h1><span>3 AM</span> Us</h1>
            <p>Enter the PIN to continue.</p>
            <input type="password" value={pin} onChange={(e) => { setPin(e.target.value); setPinErr(''); }}
                   placeholder="PIN" autoComplete="current-password" autoFocus aria-label="PIN" />
            <button type="submit" disabled={!pin || unlocking}>{unlocking ? 'Checking…' : 'Unlock'}</button>
            {pinErr && <p className="bad" role="alert">{pinErr}</p>}
            {loadErr && !pinErr && <p className="bad" role="alert">{loadErr}</p>}
          </form>
        </div>
      )}

      {phase === 'ready' && data && (
        <>
          <header className="top">
            <div className="wrap bar">
              <button type="button" className="homelink" onClick={() => { if (screen !== 'home' || openId) goScreen('home'); }} aria-label="Home">
                <h1><span>3 AM</span> Us</h1>
              </button>
              <div className="actions">
                <button type="button" className="mini" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
                <button type="button" className="mini ghost" onClick={lock}>Lock</button>
              </div>
            </div>
            <div className={`loadbar ${loading ? 'on' : ''}`} aria-hidden="true"><i /></div>
          </header>

          <main className="wrap">
            {loadErr && <p className="bad">Couldn&apos;t refresh: {loadErr}</p>}
            <p className="status">
              {data.people.length} people · {data.events.length} {data.events.length === 1 ? 'event' : 'events'} · updated{' '}
              {new Date(data.generated).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
            </p>

            {screen === 'home' && (
              <HomeView data={data} onEvent={(key) => goScreen('event', key)} onScreen={(s) => goScreen(s)} />
            )}

            {screen === 'everyone' && <EveryoneView data={data} onBack={back} onOpen={openPerson} />}

            {screen === 'producers' && <ProducersView data={data} peopleById={peopleById} onBack={back} onOpen={openPerson} />}

            {screen === 'event' && currentEvent && (
              <EventView key={currentEvent.key} ev={currentEvent} people={data.people} peopleById={peopleById}
                         maxProducers={data.maxProducers || 4} onBack={back} onOpen={openPerson}
                         onLocked={lock} onEventUpdate={onEventUpdate} />
            )}
            {screen === 'event' && !currentEvent && (
              <p className="empty">This event isn&apos;t on the board any more. <button type="button" className="link" onClick={() => goScreen('home')}>Back home</button></p>
            )}

            {screen === 'unassigned' && unassignedEvent && (
              <EventView key="__unassigned" ev={unassignedEvent} people={data.people} peopleById={peopleById}
                         maxProducers={0} readOnly onBack={back} onOpen={openPerson}
                         onLocked={lock} onEventUpdate={() => {}} />
            )}
          </main>

          {personOpen && (
            <PersonDrawer key={personOpen.id} p={personOpen} tiers={data.tiers}
                          onClose={back} onSaved={onSaved} onLocked={lock} onDirty={setDirty} />
          )}

          {leaveAsk && (
            <div className="modalwrap" onClick={(e) => { if (e.target === e.currentTarget) setLeaveAsk(false); }}>
              <div className="modal small" role="alertdialog" aria-modal="true" aria-label="Leave 3 AM Us?">
                <div className="mbody">
                  <h3 className="leaveh">Leave 3 AM Us?</h3>
                  <p className="muted">You&apos;ll go back to the previous page.</p>
                  <div className="leavebtns">
                    <button type="button" className="save" onClick={() => setLeaveAsk(false)} autoFocus>Stay</button>
                    <button type="button" className="mini ghost" onClick={() => { setLeaveAsk(false); window.history.go(-2); }}>Leave</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Instrument+Sans:wght@400;500;600&display=swap');
html,body{margin:0;padding:0;background:#000}
.us{--pink:#FF0065;--fg:#fff;--grey:#9a9a9a;--line:#262626;--card:#0d0d0d;--green:#3DDC84;--amber:#FFC53D;
  --display:"Big Shoulders Display","Arial Narrow",Impact,sans-serif;
  --body:"Instrument Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
  font-family:var(--body);background:#000;color:var(--fg);min-height:100vh;font-size:16px;line-height:1.5;
  overflow-x:hidden;overflow-x:clip;min-width:0}
.us *{box-sizing:border-box}
.us a{color:var(--fg)}
.us :focus-visible{outline:3px solid var(--pink);outline-offset:2px}
.us .wrap{max-width:1180px;margin:0 auto;padding:0 20px;width:100%}
.us h1{font-family:var(--display);font-weight:900;font-size:34px;line-height:1;margin:0}
.us h1 span{color:var(--pink)}
.us .bad{color:var(--pink);font-weight:600;font-size:14px;margin:10px 0 0}
.us .ok{color:var(--green);font-weight:600;font-size:14px;margin:10px 0 0}
.us .muted{color:var(--grey);font-size:14px;margin:6px 0 0}
.us .pad{padding:12px}
.us .status{margin:14px 0 0;font-size:13px;color:var(--grey)}

/* Lock screen */
.us .center{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.us .lockbox{width:100%;max-width:360px;display:flex;flex-direction:column;gap:12px;text-align:center}
.us .lockbox h1{font-size:56px}
.us .lockbox p{margin:0;color:var(--grey)}
.us .lockbox input{font:inherit;font-size:18px;padding:14px;text-align:center;letter-spacing:.12em;background:#0b0b0b;color:#fff;border:2px solid #fff;border-radius:0}
.us .lockbox input:focus{outline:none;border-color:var(--pink)}
.us .lockbox button{font:inherit;font-weight:600;font-size:16px;padding:14px;background:var(--pink);color:#fff;border:2px solid var(--pink);cursor:pointer}
.us .lockbox button:disabled{opacity:.6;cursor:default}

/* Loader */
.us .ldr{display:flex;flex-direction:column;align-items:center;gap:12px;color:var(--grey);font-size:14px}
.us .tri{width:46px;height:42px;overflow:visible}
.us .tri path{fill:none;stroke:var(--pink);stroke-width:2.5;stroke-linejoin:round;stroke-dasharray:100;stroke-dashoffset:100;animation:usdraw 2.2s cubic-bezier(.65,0,.35,1) infinite}
@keyframes usdraw{0%{stroke-dashoffset:100;opacity:.35}45%,55%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:-100;opacity:.35}}

/* Header */
.us .top{position:sticky;top:0;z-index:10;background:#000;border-bottom:1px solid var(--line)}
.us .bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:12px;padding-bottom:12px}
.us .homelink{background:none;border:0;padding:0;cursor:pointer;color:#fff;text-align:left}
.us .actions{display:flex;gap:8px}
.us .mini{font:inherit;font-size:14px;font-weight:600;padding:8px 14px;background:transparent;color:#fff;border:2px solid #fff;cursor:pointer;text-decoration:none;display:inline-block}
.us .mini.ghost{border-color:#555;color:#ccc}
.us .mini:disabled{opacity:.6;cursor:default}
.us .link{font:inherit;font-size:13.5px;font-weight:600;background:none;border:0;color:var(--pink);cursor:pointer;padding:0;text-decoration:underline;text-align:left}
.us .loadbar{height:3px;overflow:hidden;opacity:0;transition:opacity .2s ease}
.us .loadbar.on{opacity:1}
.us .loadbar i{display:block;width:40%;height:100%;background:var(--pink);animation:usload 1.1s ease-in-out infinite}
@keyframes usload{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}

/* Home tiles: rectangles that grow with their content */
.us .tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;padding-top:16px;padding-bottom:30px}
.us .tile{min-height:150px;display:flex;flex-direction:column;gap:6px;text-align:left;font:inherit;color:#fff;background:var(--card);
  border:2px solid #fff;padding:16px;cursor:pointer;min-width:0;transition:border-color .15s ease,transform .15s ease}
.us .tile:hover{border-color:var(--pink);transform:translate(-2px,-2px)}
.us .tile.featured{background:var(--pink);border-color:var(--pink)}
.us .tile.featured:hover{border-color:#fff}
.us .tile.everyone{background:#fff;color:#000;border-color:#fff}
.us .tile.everyone .tsub{color:#555}
.us .tile.unassigned{border-style:dashed;border-color:#888}
.us .ttop{display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap}
.us .ttag{font-size:12px;font-weight:600;padding:2px 8px;border:2px solid currentColor;white-space:nowrap}
.us .twhen{font-size:12px;font-weight:600;color:var(--grey)}
.us .twhen.now{color:#000;background:#fff;padding:2px 6px}
.us .twhen.soon{color:#ddd}
.us .tile.featured .twhen{color:#fff}
.us .tile.featured .twhen.now{color:var(--pink);background:#fff}
.us .ttitle{font-family:var(--display);font-weight:900;font-size:28px;line-height:1.05;margin-top:6px;word-break:break-word}
.us .tdate{font-size:13.5px;opacity:.85}
.us .tcount{font-size:14.5px;margin-top:auto}
.us .tcount b{font-family:var(--display);font-weight:900;font-size:30px;line-height:1}
.us .tsub{font-size:12.5px;color:var(--grey)}
.us .tile.featured .tsub{color:#fff}

/* Event + directory headers */
.us .evhead{padding-top:14px}
.us .back{font:inherit;font-size:15px;font-weight:600;background:none;border:0;color:var(--grey);cursor:pointer;padding:6px 0;margin-bottom:6px;display:block}
.us .back:hover{color:#fff}
.us .evtag{display:inline-block;font-size:12px;font-weight:600;padding:2px 8px;border:2px solid var(--pink);color:var(--pink)}
.us .evhead h2{font-family:var(--display);font-weight:900;font-size:clamp(34px,7vw,56px);line-height:1;margin:8px 0 6px;word-break:break-word}
.us .evhead .meta{font-size:14.5px;color:#ccc}
.us .evstats{margin:10px 0 0;font-size:15px;color:#ccc}
.us .evstats b{color:#fff;font-family:var(--display);font-weight:900;font-size:22px}

/* Money */
.us .money{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px}
.us .mbox{display:flex;flex-direction:column;gap:2px;text-align:left;font:inherit;color:#fff;background:var(--card);border:2px solid #fff;padding:14px;min-width:0}
.us .mbox span{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:var(--grey);font-weight:600}
.us .mbox b{font-family:var(--display);font-weight:900;font-size:32px;line-height:1.05}
.us .mbox small{font-size:12.5px;color:var(--grey)}
.us .mbox.exp{cursor:pointer;border-style:dashed}
.us .mbox.exp:hover{border-color:var(--pink);border-style:solid}
.us .mbox.net{border-color:var(--green)}
.us .mbox.net b{color:var(--green)}
.us .mbox.net.neg{border-color:var(--pink)}
.us .mbox.net.neg b{color:var(--pink)}

/* Producers: squares */
.us .prods{margin-top:22px}
.us .prods h3,.us .edit h3,.us .sect h3{font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:var(--grey);margin:0 0 8px;font-weight:600}
.us .slots{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;max-width:720px}
.us .slot{position:relative;aspect-ratio:1/1;border:2px solid #fff;display:flex;align-items:center;justify-content:center;min-width:0}
.us .slot.empty{flex-direction:column;gap:4px;border-style:dashed;border-color:#666;color:#bbb;font:inherit;font-weight:600;font-size:14px;background:transparent;cursor:pointer}
.us .slot.empty .plus{font-size:30px;line-height:1;font-weight:400}
.us .slot.empty:hover{border-color:var(--pink);color:#fff}
.us .slot.filled{background:var(--card)}
.us .slotmain{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:none;border:0;color:#fff;font:inherit;font-weight:600;cursor:pointer;padding:10px;min-width:0}
.us .slotname{max-width:100%;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14.5px}
.us .slotx{flex:0 0 auto;width:34px;height:34px;background:#000;border:2px solid #555;color:#ccc;cursor:pointer}
.us .slotx:hover{border-color:var(--pink);color:#fff}
.us .slotx.corner{position:absolute;top:6px;right:6px;width:30px;height:30px;font-size:13px}

/* Event tools + rows */
.us .evtools{display:flex;flex-direction:column;gap:10px;margin-top:22px}
.us .evtools .line{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;justify-content:space-between}
.us .inline-sel{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--grey);text-transform:uppercase;letter-spacing:.1em}
.us .export{font:inherit;font-weight:600;font-size:14.5px;padding:11px 16px;background:var(--pink);color:#fff;border:2px solid var(--pink);cursor:pointer}
.us .exports{display:flex;gap:8px;flex-wrap:wrap}
.us .export.ghost{background:transparent;color:#fff;border-color:#fff}
.us .export:disabled{opacity:.4;cursor:default}
.us .rows{display:flex;flex-direction:column;gap:8px;padding-top:6px;padding-bottom:60px}
.us .row{display:flex;align-items:center;gap:10px;border:2px solid #333;background:var(--card);padding:8px 10px;flex-wrap:wrap}
.us .row.excluded{opacity:.55}
.us .rowmain{flex:1 1 240px;display:flex;align-items:center;gap:12px;background:none;border:0;color:#fff;font:inherit;text-align:left;cursor:pointer;min-width:0;padding:0}
.us .rowtext{display:flex;flex-direction:column;min-width:0}
.us .rowname{font-weight:600;font-size:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.us .prodtag{display:inline-block;margin-left:8px;font-size:11px;font-weight:600;padding:1px 6px;background:var(--pink);color:#fff;vertical-align:2px}
.us .rowacts{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.us .ico{min-width:40px;height:38px;padding:0 8px;display:inline-flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:600;border:2px solid #555;text-decoration:none;color:#fff}
.us .ico:hover{border-color:var(--pink)}
.us .tick{height:38px;padding:0 10px;font:inherit;font-size:13px;font-weight:600;background:transparent;color:#ccc;border:2px solid #555;cursor:pointer;white-space:nowrap}
.us .tick:hover{border-color:#fff;color:#fff}
.us .tick.pay.paid{background:var(--green);border-color:var(--green);color:#000}
.us .tick.pay.later{background:var(--amber);border-color:var(--amber);color:#000}
.us .tick.pay.unpaid{border-color:var(--pink);color:var(--pink)}
.us .tick.pay.out{border-color:#777;color:#bbb}
.us .tick.pay.rejected{border-color:#777;color:#999;text-decoration:line-through}
.us .tick.in.on{background:var(--pink);border-color:var(--pink);color:#fff}

/* Directory */
.us .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding-top:18px}
.us .stat{text-align:left;font:inherit;color:#fff;background:var(--card);border:2px solid var(--line);padding:12px 14px;cursor:pointer}
.us .stat b{display:block;font-family:var(--display);font-weight:900;font-size:34px;line-height:1}
.us .stat span{font-size:13px;color:var(--grey)}
.us .stat.on,.us .stat:hover{border-color:var(--pink)}
.us .tools{display:flex;flex-direction:column;gap:12px;padding-top:16px}
.us .search{font:inherit;font-size:16px;padding:13px 14px;background:#0b0b0b;color:#fff;border:2px solid #fff;width:100%;border-radius:0}
.us .search:focus{outline:none;border-color:var(--pink)}
.us .chips{display:flex;gap:8px;flex-wrap:wrap}
.us .chip{font:inherit;font-size:14px;font-weight:600;padding:7px 12px;background:transparent;color:#fff;border:2px solid #555;cursor:pointer;white-space:nowrap}
.us .chip b{color:var(--grey);font-weight:600;margin-left:6px}
.us .chip.soft{border-style:dashed}
.us .chip.on{background:var(--pink);border-color:var(--pink);border-style:solid}
.us .chip.on b{color:#fff}
.us .selects{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.us .selects label{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--grey);text-transform:uppercase;letter-spacing:.1em}
.us select{font:inherit;font-size:15px;text-transform:none;letter-spacing:0;padding:10px 12px;background:#0b0b0b;color:#fff;border:2px solid #555;border-radius:0}
.us select:focus{outline:none;border-color:var(--pink)}
.us .count{font-size:13.5px;color:var(--grey);display:flex;gap:12px;align-items:center}
.us .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px;padding-top:14px;padding-bottom:60px}
.us .card{display:flex;gap:12px;align-items:flex-start;text-align:left;font:inherit;color:#fff;background:var(--card);border:2px solid #fff;padding:12px;cursor:pointer;transition:border-color .15s ease,transform .15s ease}
.us .card:hover{border-color:var(--pink);transform:translate(-2px,-2px)}
.us .cbody{display:flex;flex-direction:column;gap:3px;min-width:0}
.us .ctop{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.us .name{font-family:var(--display);font-weight:900;font-size:23px;line-height:1.1;word-break:break-word}
.us .real{font-size:13px;color:#ccc}
.us .meta{font-size:13px;color:var(--grey)}
.us .star{color:var(--pink)}
.us .newtag{font-size:11px;font-weight:600;padding:1px 6px;background:#fff;color:#000}
.us .empty{color:var(--grey);padding:40px 0}
.us .evchips{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
.us .evchip{font-size:11.5px;font-weight:600;padding:1px 6px;border:1px solid #555}

.us .av{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;overflow:hidden;
  background:#1d1d1d;border:2px solid #333;color:#fff;font-weight:600;font-family:var(--body)}
.us .av img{width:100%;height:100%;object-fit:cover;display:block}

.us .badge{display:inline-block;font-size:11.5px;font-weight:600;padding:1px 7px;border:2px solid currentColor}
.us .b-OG{background:var(--pink);border-color:var(--pink);color:#fff}
.us .b-Core{color:var(--pink)}
.us .b-Special{color:#fff}
.us .b-New{color:var(--grey)}

/* Modals */
.us .modalwrap{position:fixed;inset:0;z-index:40;background:rgba(0,0,0,.78);display:flex;align-items:flex-start;justify-content:center;padding:60px 16px}
.us .modal{width:min(520px,100%);max-height:84vh;display:flex;flex-direction:column;background:#0b0b0b;border:2px solid var(--pink)}
.us .modal.small{width:min(380px,100%)}
.us .modal .mhead{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid #222}
.us .modal .mhead h3{margin:0;font-family:var(--display);font-weight:900;font-size:26px}
.us .mbody{padding:14px;overflow-y:auto;display:flex;flex-direction:column;gap:12px}
.us .msearch{padding:12px 14px}
.us .msearch input,.us .payother input,.us .expadd input{font:inherit;font-size:16px;padding:12px;background:#000;color:#fff;border:2px solid #555;width:100%;border-radius:0;min-width:0}
.us .msearch input:focus,.us .payother input:focus,.us .expadd input:focus{outline:none;border-color:var(--pink)}
.us .plist{overflow-y:auto;padding:0 8px 10px}
.us .pitem{width:100%;display:flex;gap:10px;align-items:center;padding:8px;background:none;border:0;color:#fff;font:inherit;text-align:left;cursor:pointer}
.us .pitem:hover{background:#161616}
.us .ptext{display:flex;flex-direction:column;min-width:0}
.us .ptext b{font-weight:600}
.us .who{margin:0}
.us .linkbtn{align-self:flex-start}
.us .payopts{display:flex;flex-direction:column;gap:8px}
.us .payopt{font:inherit;font-weight:600;font-size:15px;padding:13px 14px;text-align:left;background:transparent;color:#fff;border:2px solid #555;cursor:pointer;display:flex;flex-direction:column;gap:2px}
.us .payopt small{font-size:12.5px;font-weight:500;opacity:.75}
.us .payopt:hover{border-color:#fff}
.us .payopt.on{outline:3px solid #fff;outline-offset:-6px}
.us .payopt.good{background:var(--green);border-color:var(--green);color:#000}
.us .payopt.later{border-color:var(--amber);color:var(--amber)}
.us .payopt.away{border-color:#888;color:#ddd}
.us .payopt.reject{border-color:var(--pink);color:var(--pink)}
.us .payopt:disabled{opacity:.5;cursor:default}
.us .optgroup{margin:8px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:var(--grey);font-weight:600}
.us .payother{display:grid;grid-template-columns:1fr auto;gap:8px}
.us .expadd{display:grid;grid-template-columns:1fr 130px auto;gap:8px}
.us .explist{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.us .explist li{display:grid;grid-template-columns:auto 1fr auto auto;gap:10px;align-items:center;border:1px solid #333;padding:8px 10px}
.us .expcat{font-size:12px;font-weight:600;padding:1px 6px;border:1px solid #666}
.us .expnote{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#ccc;font-size:14px}
.us .leaveh{margin:0;font-family:var(--display);font-weight:900;font-size:30px}
.us .leavebtns{display:flex;gap:10px;margin-top:6px}
.us .leavebtns .save{flex:1}

/* Person drawer */
.us .drawer{position:fixed;inset:0;z-index:30;background:rgba(0,0,0,.72);display:flex;justify-content:flex-end}
.us .panel{position:relative;width:min(560px,100%);height:100%;overflow-y:auto;background:#0b0b0b;border-left:2px solid var(--pink);
  padding:22px 22px calc(40px + env(safe-area-inset-bottom,0px))}
.us .x{position:absolute;top:12px;right:12px;width:44px;height:44px;font-size:18px;background:transparent;color:#fff;border:2px solid #fff;cursor:pointer}
.us .phead{display:flex;gap:16px;align-items:flex-start;padding-right:52px}
.us .pav{display:flex;flex-direction:column;align-items:center;gap:8px}
.us .pavbtns{display:flex;flex-direction:column;gap:6px}
.us .pavbtns .mini{font-size:12.5px;padding:5px 8px}
.us .hidefile{position:absolute;opacity:0;width:1px;height:1px;pointer-events:none}
.us .pname{min-width:0}
.us .pname h2{font-family:var(--display);font-weight:900;font-size:38px;line-height:1;margin:8px 0 4px;word-break:break-word}
.us .sub{margin:0;font-size:14px;color:var(--grey)}
.us .facts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:18px 0}
.us .fact{border:1px solid var(--line);padding:9px 11px;min-width:0}
.us .fact span{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--grey)}
.us .fact b{font-weight:600;word-break:break-word}
.us .edit{border:2px solid var(--pink);padding:16px;display:flex;flex-direction:column;gap:12px;margin-top:20px}
.us .fld{display:flex;flex-direction:column;gap:5px;font-size:13px;color:var(--grey);min-width:0}
.us .fld input,.us .fld textarea{font:inherit;font-size:16px;padding:11px 12px;background:#000;color:#fff;border:2px solid #555;border-radius:0;width:100%}
.us .fld input:focus,.us .fld textarea:focus{outline:none;border-color:var(--pink)}
.us .fld small{font-size:12px;color:var(--grey)}
.us .row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.us .stepper{display:flex;align-items:center;border:2px solid #555;width:max-content}
.us .stepper button{width:42px;height:42px;font-size:20px;background:transparent;color:#fff;border:0;cursor:pointer}
.us .stepper b{min-width:44px;text-align:center;font-family:var(--display);font-weight:900;font-size:24px;color:#fff}
.us .check{display:flex;gap:10px;align-items:center;cursor:pointer;font-weight:500}
.us .check input{width:22px;height:22px;accent-color:var(--pink)}
.us .saverow{display:flex;align-items:center;gap:14px}
.us .saverow .ok,.us .saverow .bad{margin:0}
.us .save{font:inherit;font-weight:600;font-size:15px;padding:12px 20px;background:var(--pink);color:#fff;border:2px solid var(--pink);cursor:pointer}
.us .save:disabled{opacity:.45;cursor:default}
.us .sect{margin-top:22px}
.us .sect.first{margin-top:0}
.us .sect p{margin:6px 0 0;word-break:break-word}
.us .sect em{font-style:normal;color:var(--grey)}
.us .hist{list-style:none;margin:8px 0 0;padding:0}
.us .hist li{border-left:3px solid var(--pink);padding:6px 0 6px 12px;margin-bottom:10px}
.us .hist b{display:block}
.us .hist span{font-size:13.5px;color:var(--grey)}
.us .hist q{display:block;margin-top:4px;font-size:14.5px;color:#d6d6d6}

@media (max-width:820px){
  .us .stats{grid-template-columns:repeat(2,1fr)}
  .us .selects{grid-template-columns:1fr 1fr}
  .us .facts{grid-template-columns:repeat(2,1fr)}
  .us .slots{grid-template-columns:repeat(2,minmax(0,1fr))}
  .us .money{grid-template-columns:1fr 1fr}
  .us .mbox.net{grid-column:1 / -1}
}
@media (max-width:520px){
  .us .wrap{padding:0 14px}
  .us h1{font-size:28px}
  .us .tiles{grid-template-columns:1fr;gap:10px}
  .us .tile{min-height:0;padding:14px}
  .us .ttitle{font-size:26px}
  .us .chips.scroll{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin:0 -14px;padding:0 14px}
  .us .chips.scroll::-webkit-scrollbar{display:none}
  .us .selects{grid-template-columns:1fr}
  .us .row2{grid-template-columns:1fr}
  .us .phead{flex-direction:column}
  .us .pav{flex-direction:row;align-items:center}
  .us .pname h2{font-size:32px}
  .us .rowacts{width:100%}
  .us .tick{flex:1 1 auto}
  .us .exports{width:100%}
  .us .export{flex:1 1 0}
  .us .mbox b{font-size:26px}
  .us .expadd{grid-template-columns:1fr 1fr}
  .us .expadd .save{grid-column:1 / -1}
  .us .modalwrap{padding:24px 10px}
}
@media (prefers-reduced-motion:reduce){
  .us .tri path,.us .loadbar i{animation:none;stroke-dashoffset:0}
  .us .card,.us .tile{transition:none}
}
`;