"use client";

import React, { useMemo, useState } from 'react';
import { Avatar } from './Common';
import { SORTS, VIEWS, displayName, cls, isRecent, ago, yearsText, byAge } from '../_lib/helpers';

export function EveryoneView({ data, onBack, onOpen }) {
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

export function ProducersView({ data, peopleById, onBack, onOpen }) {
  const list = (data.producerBoard || []).map(x => ({ ...x, p: peopleById[x.personId] })).filter(x => x.p);
  return (
    <div>
      <div className="evhead">
        <button type="button" className="back" onClick={onBack}>← Back</button>
        <h2>Producers</h2>
        <p className="meta">Everyone you&apos;ve made a producer on any event.</p>
      </div>
      {list.length === 0 ? (
        <p className="empty">No producers yet. Add them from an event&apos;s Planning tab.</p>
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