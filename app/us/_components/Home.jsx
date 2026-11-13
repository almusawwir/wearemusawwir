"use client";

import React from 'react';
import { isExcluded, shownAmount, inr, relDay, shortDate } from '../_lib/helpers';

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

export default function HomeView({ data, onEvent, onScreen }) {
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