"use client";

import React, { useMemo, useState } from 'react';
import { Avatar } from './Common';
import { PayModal } from './Modals';
import PlanningTab from './PlanningTab';
import {
  EVENT_FILTERS, EVENT_SORTS, EXPENSE_CATEGORIES,
  displayName, isExcluded, inr, shownAmount, shortDate, ago, yearsText, byAge,
  payLabel, socialLinks, isFirstTime, openContacts,
} from '../_lib/helpers';

export default function EventView({ ev, people, peopleById, maxProducers, readOnly, onBack, onOpen, onLocked, onEventUpdate, track }) {
  const [tab, setTab] = useState('regs');           // regs | plan | money
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('latest');
  const [payFor, setPayFor] = useState(null);       // personId
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
    let collected = 0, paidN = 0, due = 0, dueN = 0, unpaidN = 0, rejected = 0, away = 0, review = 0, inn = 0, active = 0;
    roster.forEach(r => {
      if (r.producerOnly) return;
      if (r.pay === 'rejected') { rejected++; return; }
      if (r.pay === 'out') { away++; return; }
      active++;
      if (r.pay === 'paid') { collected += shownAmount(r); paidN++; }
      else if (r.pay === 'later') { due += shownAmount(r); dueN++; }
      else if (r.pay === 'unpaid') unpaidN++;
      else review++;
      if (r.attended) inn++;
    });
    const spent = (ev.expenses || []).reduce((s, x) => s + (x.amount || 0), 0);
    return { collected, paidN, due, dueN, unpaidN, rejected, away, review, inn, active, spent, net: collected - spent };
  }, [roster, ev.expenses]);

  const camYes = useMemo(
    () => roster.filter(r => !r.producerOnly && !isExcluded(r) && /^yes/i.test((r.answers || {}).device || '')).length,
    [roster],
  );

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

  /* Saving */
  const post = (body) => track(async () => {
    const res = await fetch('/api/us/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 401) { onLocked(); throw new Error('Locked'); }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Could not save');
    return json;
  });

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
    try {
      await post({ kind: 'producers', eventId: ev.key, producers: ids });
      return { ok: true };
    } catch (err) {
      onEventUpdate(ev.key, e => ({ ...e, producers: prev }));
      return { ok: false, error: err.message };
    }
  };

  const addExpense = async (x) => {
    try {
      const res = await post({ kind: 'expense', eventId: ev.key, op: 'add', ...x });
      onEventUpdate(ev.key, e => ({ ...e, expenses: res.expenses }));
      return { ok: true };
    } catch (err) { return { ok: false, error: err.message }; }
  };
  const deleteExpense = async (id) => {
    const prev = ev.expenses;
    onEventUpdate(ev.key, e => ({ ...e, expenses: e.expenses.filter(x => x.id !== id) }));
    try {
      const res = await post({ kind: 'expense', eventId: ev.key, op: 'delete', id });
      onEventUpdate(ev.key, e => ({ ...e, expenses: res.expenses }));
      return { ok: true };
    } catch (err) {
      onEventUpdate(ev.key, e => ({ ...e, expenses: prev }));
      return { ok: false, error: err.message };
    }
  };

  /* Contacts: never producers, rejected or not coming. "New" = first time with 3 AM. */
  const evLabel = ev.title + (ev.tag ? ' · ' + ev.tag : '');
  const saveable = roster.filter(r => !r.producer && !r.producerOnly && !isExcluded(r) && r.p.phone);
  const newCount = saveable.filter(r => isFirstTime(r.p, evLabel, r.time)).length;
  const doExport = (who) => {
    const n = who === 'new' ? newCount : saveable.length;
    if (!n) { setMsg(who === 'new' ? 'No first-timers to save.' : 'No phone numbers to save.'); return; }
    setMsg(`Preparing ${n} contacts…`);
    openContacts(ev.key, who);
  };

  const where = [ev.date ? shortDate(ev.date) : (readOnly ? '' : 'Date TBA'), ev.time, ev.location].filter(Boolean).join(' · ');
  const payRow = payFor ? roster.find(r => r.personId === payFor) : null;
  const showRegs = readOnly || tab === 'regs';

  return (
    <div className="evview">
      <div className="evhead">
        <button type="button" className="back" onClick={onBack}>← Back</button>
        {ev.tag && <span className="evtag">{ev.tag}</span>}
        <h2>{ev.title}</h2>
        {where && <p className="meta">{where}</p>}
        {readOnly && (
          <p className="muted">
            Recent sign-ups that couldn&apos;t be matched to an event. Check that the event is in your CMS sheet and its ID starts with the form name (ODC, BCC).
          </p>
        )}
      </div>

      {!readOnly && (
        <div className="evtabs" role="tablist" aria-label="Event sections">
          <button type="button" role="tab" aria-selected={tab === 'regs'} className={`evtab ${tab === 'regs' ? 'on' : ''}`} onClick={() => setTab('regs')}>
            <span>Registrations</span>
            <b>{money.active}{ev.capacity ? <small> / {ev.capacity}</small> : null}</b>
            <small>{money.review ? `${money.review} to review` : `${money.inn} checked in`}</small>
          </button>
          <button type="button" role="tab" aria-selected={tab === 'plan'} className={`evtab ${tab === 'plan' ? 'on' : ''}`} onClick={() => setTab('plan')}>
            <span>Planning</span>
            <b>{camYes}</b>
            <small>sure cameras · {ev.producers.length}/{maxProducers} producers</small>
          </button>
          <button type="button" role="tab" aria-selected={tab === 'money'} className={`evtab ${tab === 'money' ? 'on' : ''}`} onClick={() => setTab('money')}>
            <span>Money</span>
            <b className={money.net < 0 ? 'neg' : ''}>{inr(money.net)}</b>
            <small>net · {inr(money.collected)} in</small>
          </button>
        </div>
      )}

      {showRegs && (
        <>
          <div className="evtools">
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
        </>
      )}

      {!readOnly && tab === 'plan' && (
        <PlanningTab ev={ev} roster={roster} people={people} peopleById={peopleById}
                     maxProducers={maxProducers} onOpen={onOpen} onSaveProducers={saveProducers} />
      )}

      {!readOnly && tab === 'money' && (
        <MoneyTab ev={ev} money={money} onAdd={addExpense} onDelete={deleteExpense} />
      )}

      {payRow && (
        <PayModal row={payRow} price={ev.price} onClose={() => setPayFor(null)}
                  onSave={(patch) => savePay(payRow, patch)} />
      )}
    </div>
  );
}

/* ── Money: collection, expenses, net profit ── */
function MoneyTab({ ev, money, onAdd, onDelete }) {
  const [cat, setCat] = useState(EXPENSE_CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [amt, setAmt] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const n = parseInt(amt, 10);

  const add = async () => {
    if (!(n > 0) || busy) return;
    setBusy(true); setMsg('');
    const res = await onAdd({ category: cat, note: note.trim(), amount: n });
    setBusy(false);
    if (res.ok) { setNote(''); setAmt(''); setMsg('Added ✓'); }
    else setMsg(`Not saved: ${res.error}`);
  };
  const remove = async (x) => {
    if (!window.confirm(`Delete this ${x.category} expense of ${inr(x.amount)}?`)) return;
    setMsg('');
    const res = await onDelete(x.id);
    if (!res.ok) setMsg(`Not saved: ${res.error}`);
  };

  return (
    <div className="plan">
      <div className="money">
        <div className="mbox">
          <span>Collection</span>
          <b>{inr(money.collected)}</b>
          <small>{money.paidN} paid</small>
        </div>
        <div className="mbox">
          <span>Expenses</span>
          <b>{inr(money.spent)}</b>
          <small>{ev.expenses.length} {ev.expenses.length === 1 ? 'item' : 'items'}</small>
        </div>
        <div className={`mbox net ${money.net < 0 ? 'neg' : ''}`}>
          <span>Net profit</span>
          <b>{inr(money.net)}</b>
          <small>{money.due ? `${inr(money.net + money.due)} if day-of payments come in` : 'Collection minus expenses'}</small>
        </div>
      </div>

      <div className="paybreak">
        <span><b>{money.paidN}</b> paid</span>
        <span><b>{money.dueN}</b> pay on the day{money.due ? ` (${inr(money.due)})` : ''}</span>
        <span><b>{money.unpaidN}</b> not paid</span>
        <span><b>{money.review}</b> to review</span>
      </div>

      <section className="psec">
        <h3>Add expense</h3>
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
        {msg && <p className={msg.startsWith('Not saved') ? 'bad' : 'ok'} role="status">{msg}</p>}
      </section>

      <section className="psec">
        <h3>Expenses</h3>
        {ev.expenses.length === 0 ? (
          <p className="muted">No expenses yet.</p>
        ) : (
          <ul className="explist">
            {ev.expenses.map(x => (
              <li key={x.id}>
                <span className="expcat">{x.category}</span>
                <span className="expnote">{x.note || '—'}</span>
                <b>{inr(x.amount)}</b>
                <button type="button" className="slotx" aria-label={`Delete ${x.category} expense`} onClick={() => remove(x)}>✕</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}