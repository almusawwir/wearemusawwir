"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, useEscape } from './Common';
import {
  displayName, cls, tierFor, socialLinks, squarePhoto, ageText, yearsText, fmtDate, inr, PAY_TEXT,
} from '../_lib/helpers';

export default function PersonDrawer({ p, tiers, track, onClose, onSaved, onLocked, onDirty }) {
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
      const res = await track(() => fetch('/api/us/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id, patch }),
      }));
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