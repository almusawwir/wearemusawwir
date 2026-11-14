"use client";

import React, { useMemo, useState } from 'react';
import { Avatar } from './Common';
import { ProducerPicker, PeopleListModal, PersonLine } from './Modals';
import { Donut, Bars } from './Charts';
import { ROLE_GROUPS, DEVICE_ORDER, displayName, isExcluded, splitMulti, cleanOption } from '../_lib/helpers';

const CAMERA_COLORS = ['#FF0065', '#FFC53D', '#8a8a8a', '#4a4a4a'];   // yes · maybe · prefer not · no
const camRank = (label) => {
  const i = DEVICE_ORDER.indexOf(String(label).toLowerCase());
  return i === -1 ? 99 : i;
};
const DIRECTOR = ROLE_GROUPS.find(g => g.id === 'directors').test;

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

/* Role boxes a person falls into (they can be in several) */
function rolesOf(r) {
  const picks = splitMulti((r.answers || {}).explore);
  const out = ROLE_GROUPS.filter(g => picks.some(p => g.test.test(p))).map(g => g.label);
  if (picks.some(p => !ROLE_GROUPS.some(g => g.test.test(p)))) out.push('Others');
  return out;
}
const single = (key) => (r) => {
  const v = cleanOption((r.answers || {})[key]);
  return v ? [v] : [];
};

/* Everything you can filter by */
const DIMS = [
  { key: 'roles', title: 'Roles', get: rolesOf },
  { key: 'device', title: 'Own phone / camera', get: single('device') },
  { key: 'experience', title: 'Filmmaking experience', get: single('experience') },
  { key: 'energy', title: 'Energy', get: single('energy') },
  { key: 'reason', title: 'What brings them', get: single('reason') },
  { key: 'reaction', title: 'Unexpected role reaction', get: single('reaction') },
  { key: 'explore', title: 'Wants to explore (exact answers)', get: (r) => splitMulti((r.answers || {}).explore) },
];

/* Lead picks: want to direct + some experience or professional + "Yes, absolutely" to own camera */
function isLead(r) {
  const a = r.answers || {};
  return splitMulti(a.explore).some(p => DIRECTOR.test(p))
    && /some experience|professional/i.test(a.experience || '')
    && /^yes/i.test(a.device || '');
}
function summary(r) {
  const a = r.answers || {};
  return [a.experience, a.energy, cleanOption(a.device)].filter(Boolean).join(' · ');
}

export default function PlanningTab({ ev, roster, people, peopleById, maxProducers, onOpen, onSaveProducers }) {
  const [view, setView] = useState('overview');   // overview | filter
  const [picking, setPicking] = useState(false);
  const [list, setList] = useState(null);         // { title, items }
  const [pmsg, setPmsg] = useState('');
  const [sel, setSel] = useState({});             // { dimKey: [labels] }

  const active = useMemo(() => roster.filter(r => !r.producerOnly && !isExcluded(r)), [roster]);

  const cameras = useMemo(
    () => bucket(active, 'device').sort((a, b) => camRank(a.label) - camRank(b.label) || b.list.length - a.list.length),
    [active],
  );
  const noCameraAnswer = active.filter(r => !cleanOption((r.answers || {}).device)).length;
  const camSegs = cameras.map(c => ({ label: c.label, value: c.list.length, color: CAMERA_COLORS[Math.min(camRank(c.label), 3)] }));
  const sure = cameras.filter(c => /^yes/i.test(c.label)).reduce((s, c) => s + c.list.length, 0);

  const roles = useMemo(() => {
    const groups = [...ROLE_GROUPS.map(g => ({ id: g.id, label: g.label })), { id: 'others', label: 'Others' }]
      .map(g => ({ ...g, list: [] }));
    active.forEach(r => {
      const mine = rolesOf(r);
      groups.forEach(g => { if (mine.includes(g.label)) g.list.push(r); });
    });
    return groups.filter(g => g.list.length);
  }, [active]);

  const more = useMemo(() => ([
    { key: 'experience', title: 'Filmmaking experience' },
    { key: 'energy', title: 'Energy' },
    { key: 'reason', title: 'What brings them' },
  ].map(s => ({ ...s, buckets: bucket(active, s.key).sort((a, b) => b.list.length - a.list.length) }))
    .filter(s => s.buckets.length)), [active]);

  const leads = useMemo(() => active.filter(isLead), [active]);

  /* Filter */
  const options = useMemo(() => DIMS.map(d => {
    const counts = new Map();
    active.forEach(r => d.get(r).forEach(v => counts.set(v, (counts.get(v) || 0) + 1)));
    const opts = [...counts.entries()].map(([label, n]) => ({ label, n }));
    if (d.key === 'device') opts.sort((a, b) => camRank(a.label) - camRank(b.label));
    else opts.sort((a, b) => b.n - a.n);
    return { ...d, opts };
  }).filter(d => d.opts.length), [active]);

  const filterCount = Object.values(sel).reduce((n, a) => n + a.length, 0);
  const matches = useMemo(() => active
    .filter(r => DIMS.every(d => {
      const want = sel[d.key] || [];
      if (!want.length) return true;
      const have = d.get(r);
      return want.some(w => have.includes(w));
    }))
    .sort((a, b) => displayName(a.p).localeCompare(displayName(b.p))), [active, sel]);

  const toggleOpt = (key, label) => setSel(s => {
    const cur = s[key] || [];
    return { ...s, [key]: cur.includes(label) ? cur.filter(x => x !== label) : [...cur, label] };
  });
  const leadPreset = () => {
    const pick = (key, re) => ((options.find(d => d.key === key) || { opts: [] }).opts).map(o => o.label).filter(l => re.test(l));
    setSel({
      roles: pick('roles', /^Directors$/),
      experience: pick('experience', /some experience|professional/i),
      device: pick('device', /^yes/i),
    });
  };

  const openList = (title, rows, metaKey) => setList({
    title,
    items: rows.map(r => ({ p: r.p, meta: metaKey === 'summary' ? summary(r) : metaKey ? (r.answers || {})[metaKey] : '' })),
  });

  const saveProducers = async (ids) => {
    setPmsg('Saving…');
    const res = await onSaveProducers(ids);
    setPmsg(res.ok ? 'Saved ✓' : `Not saved: ${res.error}`);
  };

  return (
    <div className="plan">
      <div className="subtabs" role="tablist" aria-label="Planning views">
        <button type="button" role="tab" aria-selected={view === 'overview'}
                className={`subtab ${view === 'overview' ? 'on' : ''}`} onClick={() => setView('overview')}>
          Overview
        </button>
        <button type="button" role="tab" aria-selected={view === 'filter'}
                className={`subtab ${view === 'filter' ? 'on' : ''}`} onClick={() => setView('filter')}>
          Filter{filterCount ? ` (${filterCount})` : ''}
        </button>
      </div>

      {view === 'overview' && (
        <>
          <section className="psec">
            <div className="phead2">
              <h3>Producers</h3>
              {ev.producers.length < maxProducers && (
                <button type="button" className="addsq" aria-label="Add producer" onClick={() => setPicking(true)}>+</button>
              )}
            </div>
            {ev.producers.length > 0 ? (
              <div className="slots">
                {ev.producers.map(pid => {
                  const p = peopleById[pid];
                  if (!p) return null;
                  return (
                    <div className="slot filled" key={pid}>
                      <button type="button" className="slotmain" onClick={() => onOpen(pid)}>
                        <Avatar p={p} size={72} />
                        <span className="slotname">{displayName(p)}</span>
                      </button>
                      <button type="button" className="slotx corner" aria-label={`Remove ${displayName(p)}`}
                              onClick={() => saveProducers(ev.producers.filter(x => x !== pid))}>✕</button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="muted">No producers yet. Tap + to add up to {maxProducers}.</p>
            )}
            {pmsg && (
              <p className={pmsg.startsWith('Not saved') ? 'bad' : pmsg === 'Saving…' ? 'muted' : 'ok'} role="status">{pmsg}</p>
            )}
          </section>

          <section className="psec">
            <h3>Lead picks</h3>
            <p className="hint">
              Want to direct (Directing, Cinematography or Filmmaking), have some experience or are professional,
              and said “Yes, absolutely” to using their own phone or camera.
            </p>
            <button type="button" className="leadbox" disabled={!leads.length}
                    onClick={() => openList('Lead picks', leads, 'summary')}>
              <b>{leads.length}</b>
              <span>{leads.length ? 'Tap to see who could lead a crew' : 'No one matches yet'}</span>
            </button>
          </section>

          <section className="psec">
            <h3>Cameras</h3>
            <p className="hint">Who can use their own phone or camera. Tap a box to see names.</p>
            {cameras.length ? (
              <div className="psqs">
                {cameras.map(c => (
                  <button key={c.label} type="button" className={`psq ${/^yes/i.test(c.label) ? 'hl' : ''}`}
                          onClick={() => openList(c.label, c.list, 'summary')}>
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
                  <button key={b.label} type="button" className="psq" onClick={() => openList(b.label, b.list, 'summary')}>
                    <b>{b.list.length}</b>
                    <span>{b.label}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}

          {(cameras.length > 0 || roles.length > 0 || more.length > 0) && (
            <section className="psec">
              <h3>Snapshot</h3>
              <div className="snap">
                {cameras.length > 0 && (
                  <div className="snapcard">
                    <p className="snapt">Cameras</p>
                    <Donut segments={camSegs} label={String(sure)} sub="for sure" />
                    <ul className="legend">
                      {camSegs.map(s => (
                        <li key={s.label}><i style={{ background: s.color }} />{s.label}<b>{s.value}</b></li>
                      ))}
                    </ul>
                    <p className="muted">
                      {sure > 0
                        ? `${active.length} people · one sure camera for every ${Math.ceil(active.length / sure)}`
                        : 'No sure cameras yet. Plan crew gear.'}
                    </p>
                  </div>
                )}
                {roles.length > 0 && (
                  <div className="snapcard">
                    <p className="snapt">Roles</p>
                    <Bars items={roles.map(g => ({ label: g.label, value: g.list.length }))} />
                  </div>
                )}
                {more.map(s => (
                  <div className="snapcard" key={`chart-${s.key}`}>
                    <p className="snapt">{s.title}</p>
                    <Bars items={s.buckets.map((b, i) => ({ label: b.label, value: b.list.length, color: i === 0 ? '#FF0065' : '#ffffff' }))} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {view === 'filter' && (
        <>
          <section className="psec">
            <div className="fbar">
              <span className="fcount"><b>{matches.length}</b> of {active.length} match</span>
              <span className="fbtns">
                <button type="button" className="mini" onClick={leadPreset}>Lead picks</button>
                {filterCount > 0 && <button type="button" className="mini ghost" onClick={() => setSel({})}>Clear</button>}
              </span>
            </div>
            <p className="hint">
              Tap any options. Inside one group, people with any of the picked options match.
              Across groups, they have to match all of them.
            </p>
            {options.length === 0 ? (
              <p className="muted">No answers yet.</p>
            ) : (
              <div className="fdims">
                {options.map(d => (
                  <div className="fdim" key={d.key}>
                    <h4>{d.title}</h4>
                    <div className="chips">
                      {d.opts.map(o => {
                        const on = (sel[d.key] || []).includes(o.label);
                        return (
                          <button key={o.label} type="button" className={`chip ${on ? 'on' : ''}`} aria-pressed={on}
                                  onClick={() => toggleOpt(d.key, o.label)}>
                            {o.label}<b>{o.n}</b>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="psec">
            <h3>Results · {matches.length}</h3>
            {matches.length === 0 ? (
              <p className="muted">No one matches all of that. Remove an option.</p>
            ) : (
              <div className="flist">
                {matches.map(r => (
                  <PersonLine key={r.personId} p={r.p} meta={summary(r)} onOpen={onOpen} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {picking && (
        <ProducerPicker people={people} exclude={ev.producers}
                        onPick={(id) => { setPicking(false); saveProducers([...ev.producers, id]); }}
                        onClose={() => setPicking(false)} />
      )}
      {list && (
        <PeopleListModal title={list.title} items={list.items} onOpen={onOpen} onClose={() => setList(null)} />
      )}
    </div>
  );
}