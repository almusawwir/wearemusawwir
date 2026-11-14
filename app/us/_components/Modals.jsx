"use client";

import React, { useMemo, useState } from 'react';
import { Avatar, useEscape } from './Common';
import { displayName, inr, socialLinks } from '../_lib/helpers';

/* One person in a list: tap to open their profile, plus IG and WhatsApp buttons */
export function PersonLine({ p, meta, onOpen }) {
  const ig = socialLinks(p.socials).find(l => l.kind === 'ig');
  return (
    <div className="plrow">
      <button type="button" className="plmain" onClick={() => onOpen(p.id)}>
        <Avatar p={p} size={38} />
        <span className="ptext">
          <b>{displayName(p)}</b>
          {meta ? <span className="meta">{meta}</span> : null}
        </span>
      </button>
      {ig && (
        <a className="ico" href={ig.href} target="_blank" rel="noopener noreferrer" aria-label={ig.label}>IG</a>
      )}
      {p.phone && (
        <a className="ico" href={`https://wa.me/91${p.phone}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${displayName(p)}`}>WA</a>
      )}
    </div>
  );
}

/* Pick a producer from your people */
export function ProducerPicker({ people, exclude, onPick, onClose }) {
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

/* A list of names (used by the Planning boxes) */
export function PeopleListModal({ title, items, onOpen, onClose }) {
  useEscape(onClose);
  return (
    <div className="modalwrap" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="mhead">
          <h3>{title} · {items.length}</h3>
          <button type="button" className="mini ghost" onClick={onClose}>Close</button>
        </div>
        <div className="plist">
          {items.map(({ p, meta }) => (
            <PersonLine key={p.id} p={p} meta={meta} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* Payment and status for one registration */
export function PayModal({ row, price, onSave, onClose }) {
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
            <button type="button" className={`payopt free ${row.pay === 'free' ? 'on' : ''}`}
                    disabled={busy} onClick={() => choose({ pay: 'free', amount: null })}>
              Wildcard (free entry)
              <small>Joining for free. Counts as a confirmed spot.</small>
            </button>
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