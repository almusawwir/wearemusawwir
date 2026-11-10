"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const NEW_DAYS = 7;            // "New sign-up" tag and "this week" filter
const PHOTO_SIDE = 256;        // profile photos are saved as small squares
const PHOTO_MAX_CHARS = 44000; // must stay under the sheet's cell limit

const SORTS = [
  { id: 'latest', label: 'Latest sign-up' },
  { id: 'newest', label: 'Newest members' },
  { id: 'events', label: 'Most events' },
  { id: 'name', label: 'Name A–Z' },
  { id: 'oldest', label: 'Longest with us' },
];
const VIEWS = [
  { id: 'all', label: 'Everyone' },
  { id: 'week', label: 'Signed up this week' },
  { id: 'starred', label: '★ Starred' },
  { id: 'bday', label: 'Birthdays this month' },
  { id: 'pending', label: 'Payment pending' },
];

/* ── Helpers ── */
const displayName = (p) => p.nickname || p.name;
const cls = (s) => String(s).replace(/[^A-Za-z]/g, '');
const isRecent = (ms) => Date.now() - ms <= NEW_DAYS * 864e5;

function initials(s) {
  return String(s || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';
}
function fmtDate(ms) {
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
function safeUrl(s) {
  let t = String(s).trim();
  if (/^(www\.)?(instagram|linkedin)\.com/i.test(t)) t = 'https://' + t;
  try {
    const u = new URL(t);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : '';
  } catch { return ''; }
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

/* ── One person: details + your edits ── */
function PersonDrawer({ p, tiers, onClose, onSaved, onLocked }) {
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
  const set = (k, v) => { setDraft(d => ({ ...d, [k]: v })); setMsg(''); };

  const tryClose = useCallback(() => {
    if (dirty && !window.confirm('You have unsaved changes. Close anyway?')) return;
    onClose();
  }, [dirty, onClose]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') tryClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [tryClose]);

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
          <div className="fact"><span>Last sign-up</span><b>{fmtDate(p.last)}</b></div>
          <div className="fact"><span>Birthday</span><b>{p.birthday || '—'}</b></div>
          <div className="fact"><span>Based in</span><b>{p.city || '—'}</b></div>
        </div>

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

        {(p.phone || p.socials.length > 0) && (
          <section className="sect">
            <h3>Contact</h3>
            {p.phone && (
              <p>
                +91 {p.phone} · <a href={`https://wa.me/91${p.phone}`} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>
              </p>
            )}
            {p.socials.map(s => {
              const u = safeUrl(s);
              return <p key={s}>{u ? <a href={u} target="_blank" rel="noopener noreferrer">{s} ↗</a> : s}</p>;
            })}
          </section>
        )}

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
                <b>{h.edition}</b>
                <span>{fmtDate(h.time)}{h.pass ? ` · ${h.pass}` : ''}{h.payment ? ` · Payment ${h.payment}` : ''}</span>
                {h.why && <q>{h.why}</q>}
              </li>
            ))}
          </ol>
        </section>
      </div>
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

  const [q, setQ] = useState('');
  const [view, setView] = useState('all');
  const [tier, setTier] = useState('All');
  const [form, setForm] = useState('All');
  const [edition, setEdition] = useState('All');
  const [sort, setSort] = useState('latest');
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setLoadErr('');
    try {
      const res = await fetch('/api/us/people', { cache: 'no-store' });
      if (res.status === 401) { setData(null); setPhase('locked'); return; }
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

  useEffect(() => { load(); }, [load]);

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
      await load();
    } catch {
      setPinErr('Network problem. Try again.');
    } finally {
      setUnlocking(false);
    }
  };

  const lock = useCallback(async () => {
    await fetch('/api/us/login', { method: 'DELETE' }).catch(() => {});
    setData(null); setOpenId(null); setPhase('locked');
  }, []);

  const onSaved = useCallback((id, override) => {
    setData(d => d && ({ ...d, people: d.people.map(p => (p.id === id ? applyOverride(p, override, d.tiers) : p)) }));
  }, []);

  // Page doesn't scroll behind the open person
  useEffect(() => {
    if (!openId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [openId]);

  const stats = useMemo(() => {
    if (!data) return null;
    const now = new Date();
    const m = now.getMonth(), y = now.getFullYear();
    let joined = 0, returning = 0, bdays = 0, week = 0;
    data.people.forEach(p => {
      const f = new Date(p.first);
      if (f.getMonth() === m && f.getFullYear() === y) joined++;
      if (p.count >= 2) returning++;
      if (p.bm === m + 1) bdays++;
      if (isRecent(p.last)) week++;
    });
    return { total: data.people.length, joined, returning, bdays, week };
  }, [data]);

  const tierCounts = useMemo(() => {
    const c = { All: data ? data.people.length : 0 };
    if (data) data.people.forEach(p => { c[p.tier] = (c[p.tier] || 0) + 1; });
    return c;
  }, [data]);

  const list = useMemo(() => {
    if (!data) return [];
    const term = q.trim().toLowerCase();
    const digits = term.replace(/\D/g, '');
    const month = new Date().getMonth() + 1;

    const arr = data.people.filter(p => {
      if (tier !== 'All' && p.tier !== tier) return false;
      if (form !== 'All' && !p.forms.includes(form)) return false;
      if (edition !== 'All' && !p.editions.includes(edition)) return false;
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
      oldest: (a, b) => a.first - b.first,
    };
    if (view === 'bday') arr.sort((a, b) => a.bd - b.bd);
    else arr.sort(by[sort] || by.latest);
    return arr;
  }, [data, q, view, tier, form, edition, sort]);

  const filtersOn = q || view !== 'all' || tier !== 'All' || form !== 'All' || edition !== 'All';
  const resetFilters = () => { setQ(''); setView('all'); setTier('All'); setForm('All'); setEdition('All'); };
  const openPerson = data && openId ? data.people.find(p => p.id === openId) : null;

  return (
    <div className="us">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {phase === 'checking' && <div className="center"><Loader label="Checking…" /></div>}

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
              <h1><span>3 AM</span> Us</h1>
              <div className="actions">
                <button type="button" className="mini" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
                <button type="button" className="mini ghost" onClick={lock}>Lock</button>
              </div>
            </div>
          </header>

          <main className="wrap">
            {loadErr && <p className="bad">Couldn&apos;t refresh: {loadErr}</p>}

            <div className="stats">
              <button type="button" className={`stat ${view === 'all' && !filtersOn ? 'on' : ''}`} onClick={resetFilters}>
                <b>{stats.total}</b><span>People</span>
              </button>
              <button type="button" className={`stat ${view === 'week' ? 'on' : ''}`} onClick={() => { setView('week'); setSort('latest'); }}>
                <b>{stats.week}</b><span>Signed up this week</span>
              </button>
              <button type="button" className={`stat ${tier === 'All' && view === 'all' && sort === 'events' ? 'on' : ''}`} onClick={() => { setView('all'); setSort('events'); }}>
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

              <div className="chips" role="group" aria-label="Quick filters">
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
                <label><span>Edition</span>
                  <select value={edition} onChange={(e) => setEdition(e.target.value)}>
                    <option value="All">All editions</option>
                    {data.editions.map(ed => <option key={ed} value={ed}>{ed}</option>)}
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
                  <button key={p.id} type="button" className="card" onClick={() => setOpenId(p.id)}>
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
                        {p.count} {p.count === 1 ? 'event' : 'events'} · signed up {ago(p.last)}
                        {view === 'bday' && p.birthday ? ` · 🎂 ${p.birthday}` : ''}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </main>

          {openPerson && (
            <PersonDrawer key={openPerson.id} p={openPerson} tiers={data.tiers}
                          onClose={() => setOpenId(null)} onSaved={onSaved} onLocked={lock} />
          )}
        </>
      )}
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Instrument+Sans:wght@400;500;600&display=swap');
html,body{margin:0;padding:0;background:#000}
.us{--pink:#FF0065;--fg:#fff;--grey:#9a9a9a;--line:#262626;--card:#0d0d0d;
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
.us .ok{color:#3DDC84;font-weight:600;font-size:14px}

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
.us .bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:14px;padding-bottom:14px}
.us .actions{display:flex;gap:8px}
.us .mini{font:inherit;font-size:14px;font-weight:600;padding:8px 14px;background:transparent;color:#fff;border:2px solid #fff;cursor:pointer}
.us .mini.ghost{border-color:#555;color:#ccc}
.us .mini:disabled{opacity:.6;cursor:default}

/* Stats */
.us .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding-top:18px}
.us .stat{text-align:left;font:inherit;color:#fff;background:var(--card);border:2px solid var(--line);padding:12px 14px;cursor:pointer}
.us .stat b{display:block;font-family:var(--display);font-weight:900;font-size:34px;line-height:1}
.us .stat span{font-size:13px;color:var(--grey)}
.us .stat.on,.us .stat:hover{border-color:var(--pink)}

/* Tools */
.us .tools{display:flex;flex-direction:column;gap:12px;padding-top:16px}
.us .search{font:inherit;font-size:16px;padding:13px 14px;background:#0b0b0b;color:#fff;border:2px solid #fff;width:100%;border-radius:0}
.us .search:focus{outline:none;border-color:var(--pink)}
.us .chips{display:flex;gap:8px;flex-wrap:wrap}
.us .chip{font:inherit;font-size:14px;font-weight:600;padding:7px 12px;background:transparent;color:#fff;border:2px solid #555;cursor:pointer}
.us .chip b{color:var(--grey);font-weight:600;margin-left:6px}
.us .chip.soft{border-style:dashed}
.us .chip.on{background:var(--pink);border-color:var(--pink);border-style:solid}
.us .chip.on b{color:#fff}
.us .selects{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.us .selects label{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--grey);text-transform:uppercase;letter-spacing:.1em}
.us select{font:inherit;font-size:15px;text-transform:none;letter-spacing:0;padding:10px 12px;background:#0b0b0b;color:#fff;border:2px solid #555;border-radius:0}
.us select:focus{outline:none;border-color:var(--pink)}
.us .count{font-size:13.5px;color:var(--grey);display:flex;gap:12px;align-items:center}
.us .link{font:inherit;font-size:13.5px;font-weight:600;background:none;border:0;color:var(--pink);cursor:pointer;padding:0;text-decoration:underline}

/* Cards */
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

.us .av{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;overflow:hidden;
  background:#1d1d1d;border:2px solid #333;color:#fff;font-weight:600;font-family:var(--body)}
.us .av img{width:100%;height:100%;object-fit:cover;display:block}

.us .badge{display:inline-block;font-size:11.5px;font-weight:600;padding:1px 7px;border:2px solid currentColor}
.us .b-OG{background:var(--pink);border-color:var(--pink);color:#fff}
.us .b-Core{color:var(--pink)}
.us .b-Special{color:#fff}
.us .b-New{color:var(--grey)}

/* Drawer */
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

.us .edit{border:2px solid var(--pink);padding:16px;display:flex;flex-direction:column;gap:12px}
.us .edit h3,.us .sect h3{font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:var(--grey);margin:0;font-weight:600}
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
.us .save{font:inherit;font-weight:600;font-size:15px;padding:12px 20px;background:var(--pink);color:#fff;border:2px solid var(--pink);cursor:pointer}
.us .save:disabled{opacity:.45;cursor:default}

.us .sect{margin-top:22px}
.us .sect p{margin:6px 0 0}
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
}
@media (max-width:480px){
  .us .wrap{padding:0 16px}
  .us .selects{grid-template-columns:1fr}
  .us .row2{grid-template-columns:1fr}
  .us .phead{flex-direction:column}
  .us .pav{flex-direction:row;align-items:center}
  .us .pname h2{font-size:32px}
}
@media (prefers-reduced-motion:reduce){
  .us .tri path{animation:none;stroke-dashoffset:0}
  .us .card{transition:none}
}
`;