"use client";

import React, { useMemo, useState } from 'react';
import { Avatar } from './Common';
import { ProducerPicker, PeopleListModal } from './Modals';
import { ROLE_GROUPS, DEVICE_ORDER, displayName, isExcluded, splitMulti, cleanOption } from '../_lib/helpers';

/* Groups registrations by a single-choice answer; options nobody picked never appear */
function bucket(rows, key) {
  const map = new Map();
  rows.forEach(r => {
    const v = cleanOption((r.answers || {})[key]);
    if (!v) return;
    if (!map.has(v)) map.set(v, []);
    map.get(v).push(r);
  });
  return [...map.entries()].map(([label, list]) => ({ label, list }));
}

export default function PlanningTab({ ev, roster, people, peopleById, maxProducers, onOpen, onSaveProducers }) {
  const [picking, setPicking] = useState(false);
  const [list, setList] = useState(null);   // { title, items }
  const [pmsg, setPmsg] = useState('');

  const active = useMemo(() => roster.filter(r => !r.producerOnly && !isExcluded(r)), [roster]);

  const cameras = useMemo(() => {
    const rank = (l) => { const i = DEVICE_ORDER.indexOf(l.toLowerCase()); return i === -1 ? 99 : i; };
    return bucket(active, 'device').sort((a, b) => rank(a.label) - rank(b.label) || b.list.length - a.list.length);
  }, [active]);
  const noCameraAnswer = active.filter(r => !cleanOption((r.answers || {}).device)).length;

  const roles = useMemo(() => {
    const groups = ROLE_GROUPS.map(g => ({ ...g, list: [] }));
    const others = { id: 'others', label: 'Others', list: [] };
    active.forEach(r => {
      const picks = splitMulti((r.answers || {}).explore);
      if (!picks.length) return;
      groups.forEach(g => { if (picks.some(p => g.test.test(p))) g.list.push(r); });
      if (picks.some(p => !ROLE_GROUPS.some(g => g.test.test(p)))) others.list.push(r);
    });
    return [...groups, others].filter(g => g.list.length);
  }, [active]);

  const more = useMemo(() => ([
    { key: 'experience', title: 'Filmmaking experience' },
    { key: 'energy', title: 'Energy' },
    { key: 'reason', title: 'What brings them' },
  ].map(s => ({ ...s, buckets: bucket(active, s.key).sort((a, b) => b.list.length - a.list.length) }))
    .filter(s => s.buckets.length)), [active]);

  const openList = (title, rows, metaKey) => setList({
    title,
    items: rows.map(r => ({ p: r.p, meta: metaKey ? (r.answers || {})[metaKey] : '' })),
  });

  const slots = Math.min(maxProducers, Math.max(2, ev.producers.length + 1));
  const saveProducers = async (ids) => {
    setPmsg('Saving…');
    const res = await onSaveProducers(ids);
    setPmsg(res.ok ? 'Saved ✓' : `Not saved: ${res.error}`);
  };

  return (
    <div className="plan">
      <section className="psec">
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
        {pmsg && (
          <p className={pmsg.startsWith('Not saved') ? 'bad' : pmsg === 'Saving…' ? 'muted' : 'ok'} role="status">{pmsg}</p>
        )}
      </section>

      <section className="psec">
        <h3>Cameras</h3>
        <p className="hint">Who can use their own phone or camera. Tap a box to see names.</p>
        {cameras.length ? (
          <div className="psqs">
            {cameras.map(c => (
              <button key={c.label} type="button" className={`psq ${/^yes/i.test(c.label) ? 'hl' : ''}`}
                      onClick={() => openList(c.label, c.list)}>
                <b>{c.list.length}</b>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="muted">No answers yet.</p>
        )}
        {noCameraAnswer > 0 && cameras.length > 0 && (
          <p className="muted">{noCameraAnswer} didn&apos;t answer this.</p>
        )}
      </section>

      <section className="psec">
        <h3>Roles they want</h3>
        <p className="hint">From “Wants to explore”. Someone can be in more than one box.</p>
        {roles.length ? (
          <div className="psqs">
            {roles.map(g => (
              <button key={g.id} type="button" className="psq" onClick={() => openList(g.label, g.list, 'explore')}>
                <b>{g.list.length}</b>
                <span>{g.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="muted">No answers yet.</p>
        )}
      </section>

      {more.map(s => (
        <section className="psec" key={s.key}>
          <h3>{s.title}</h3>
          <div className="psqs">
            {s.buckets.map(b => (
              <button key={b.label} type="button" className="psq" onClick={() => openList(b.label, b.list)}>
                <b>{b.list.length}</b>
                <span>{b.label}</span>
              </button>
            ))}
          </div>
        </section>
      ))}

      {picking && (
        <ProducerPicker people={people} exclude={ev.producers}
                        onPick={(id) => { setPicking(false); saveProducers([...ev.producers, id]); }}
                        onClose={() => setPicking(false)} />
      )}
      {list && <PeopleListModal title={list.title} items={list.items} onClose={() => setList(null)} />}
    </div>
  );
}