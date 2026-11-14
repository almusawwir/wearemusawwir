"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, useEscape } from './Common';
import { PersonLine } from './Modals';
import { displayName, isExcluded } from '../_lib/helpers';
import {
  ROLE_OPTIONS, TEMPLATE, ROLE_SKILL, REQUIRED, SKILL_LABEL, profile, buildCrews, crewStats,
} from '../_lib/crewLogic';

const newId = () => `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const skillText = (prof) => (prof ? prof.skills.map(s => SKILL_LABEL[s]).join(' · ') : '');

export default function CrewsTab({ ev, roster, onOpen, onSaveCrews }) {
  const crews = ev.crews || [];

  // Everyone who can be in a crew: registered, not a producer, not rejected or not coming
  const pool = useMemo(() => roster.filter(r => !r.producer && !r.producerOnly && !isExcluded(r)), [roster]);
  const byId = useMemo(() => {
    const m = {};
    pool.forEach(r => { m[r.personId] = profile(r); });
    return m;
  }, [pool]);
  const rowById = useMemo(() => {
    const m = {};
    roster.forEach(r => { m[r.personId] = r; });
    return m;
  }, [roster]);
  const placedIn = useMemo(() => {
    const m = {};
    crews.forEach(c => c.members.forEach(mem => { if (mem.personId) m[mem.personId] = c; }));
    return m;
  }, [crews]);
  const unassigned = pool.filter(r => !placedIn[r.personId]);

  const suggested = Math.max(1, Math.min(12, Math.round(pool.length / 6) || 1));
  const [n, setN] = useState(String(suggested));
  const [warnings, setWarnings] = useState([]);
  const [msg, setMsg] = useState('');
  const [pick, setPick] = useState(null);      // { crewId, index }
  const [menu, setMenu] = useState(null);      // { crewId, index }
  const [newOpen, setNewOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const save = async (next, okText = 'Saved ✓') => {
    setMsg('Saving…');
    const res = await onSaveCrews(next);
    setMsg(res.ok ? okText : `Not saved: ${res.error}`);
  };
  // Works on a copy, then saves it
  const update = (fn) => save(fn(crews.map(c => ({ ...c, members: c.members.map(m => ({ ...m })) }))));

  const autoBuild = () => {
    const num = parseInt(n, 10);
    if (!(num >= 1)) return;
    if (crews.length && !window.confirm('Replace your current crews with a fresh auto-build? Your manual changes will be lost.')) return;
    const { crews: built, warnings: w } = buildCrews(pool, num);
    setWarnings(w);
    save(built, `Built ${built.length} crews ✓`);
  };

  const createCrew = (name, withTemplate) => update(cs => [...cs, {
    id: newId(),
    name: name || `Crew ${cs.length + 1}`,
    members: withTemplate ? TEMPLATE.map(role => ({ role, personId: '' })) : [],
  }]);

  const assign = (crewId, index, personId) => update(cs => {
    cs.forEach(c => c.members.forEach(m => { if (m.personId === personId) m.personId = ''; }));   // one crew per person
    const c = cs.find(x => x.id === crewId);
    if (c && c.members[index]) c.members[index].personId = personId;
    return cs;
  });
  const setRole = (crewId, index, role) => update(cs => {
    const c = cs.find(x => x.id === crewId);
    if (c && c.members[index]) c.members[index].role = role;
    return cs;
  });
  const emptySlot = (crewId, index) => update(cs => {
    const c = cs.find(x => x.id === crewId);
    if (c && c.members[index]) c.members[index].personId = '';
    return cs;
  });
  const deleteSlot = (crewId, index) => update(cs => {
    const c = cs.find(x => x.id === crewId);
    if (c) c.members.splice(index, 1);
    return cs;
  });
  const moveTo = (crewId, index, targetId) => update(cs => {
    const from = cs.find(x => x.id === crewId);
    const to = cs.find(x => x.id === targetId);
    if (!from || !to || !from.members[index]) return cs;
    const [m] = from.members.splice(index, 1);
    to.members.push(m);
    return cs;
  });
  const addRole = (crewId, role) => update(cs => {
    const c = cs.find(x => x.id === crewId);
    if (c) c.members.push({ role, personId: '' });
    return cs;
  });
  const rename = (crewId, name) => update(cs => {
    const c = cs.find(x => x.id === crewId);
    if (c) c.name = name;
    return cs;
  });
  const deleteCrew = (crew) => {
    if (!window.confirm(`Delete ${crew.name}? Its people go back to "Not in a crew".`)) return;
    update(cs => cs.filter(c => c.id !== crew.id));
  };
  const clearAll = () => {
    if (!window.confirm('Delete all crews for this event?')) return;
    setWarnings([]);
    save([], 'Cleared ✓');
  };

  const copyAll = async () => {
    const text = crews.map(c => [
      c.name,
      ...c.members.filter(m => m.personId && rowById[m.personId]).map(m => `${m.role}: ${displayName(rowById[m.personId].p)}`),
    ].join('\n')).join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMsg('Copy failed. Try again.');
    }
  };

  const onSlot = (crew, index) => {
    if (crew.members[index].personId) setMenu({ crewId: crew.id, index });
    else setPick({ crewId: crew.id, index });
  };

  const pickCrew = pick && crews.find(c => c.id === pick.crewId);
  const menuCrew = menu && crews.find(c => c.id === menu.crewId);

  return (
    <div className="plan">
      <section className="psec ocard">
        <h3>Auto-build</h3>
        <p className="hint">
          Spreads directors, then editors, cameras and writers (scarcest first), then two actors per crew,
          then evens out experience, energy and sure cameras. Same people in, same crews out.
        </p>
        <div className="crewbar">
          <label>
            Crews
            <input type="number" min="1" max="12" inputMode="numeric" value={n} onChange={(e) => setN(e.target.value)} aria-label="Number of crews" />
          </label>
          <span className="muted">
            {pool.length} people{parseInt(n, 10) >= 1 ? ` · about ${Math.ceil(pool.length / parseInt(n, 10))} per crew` : ''}
          </span>
          <button type="button" className="save" onClick={autoBuild} disabled={!pool.length || !(parseInt(n, 10) >= 1)}>Build crews</button>
        </div>
        {warnings.map(w => <p key={w} className="warnline">⚠ {w}</p>)}
      </section>

      <div className="crewtools">
        <button type="button" className="mini" onClick={() => setNewOpen(true)}>+ New crew</button>
        {crews.length > 0 && (
          <>
            <button type="button" className="mini ghost" onClick={copyAll}>{copied ? 'Copied ✓' : 'Copy crew list'}</button>
            <button type="button" className="mini ghost" onClick={clearAll}>Clear all</button>
          </>
        )}
        {msg && <span className={`crewmsg ${msg.startsWith('Not') || msg.startsWith('Copy failed') ? 'bad' : msg === 'Saving…' ? 'muted' : 'ok'}`} role="status">{msg}</span>}
      </div>

      {crews.length === 0 ? (
        <p className="muted">No crews yet. Build them automatically above, or tap + New crew.</p>
      ) : (
        <div className="crews">
          {crews.map(c => (
            <CrewCard key={c.id} crew={c} byId={byId} rowById={rowById}
                      onRename={(name) => rename(c.id, name)}
                      onSlot={(i) => onSlot(c, i)}
                      onAddRole={(role) => addRole(c.id, role)}
                      onDelete={() => deleteCrew(c)} />
          ))}
        </div>
      )}

      <section className="psec">
        <h3>Not in a crew · {unassigned.length}</h3>
        {unassigned.length === 0 ? (
          <p className="muted">Everyone is in a crew.</p>
        ) : (
          <div className="flist">
            {unassigned.map(r => (
              <PersonLine key={r.personId} p={r.p} meta={skillText(byId[r.personId]) || 'No roles picked'} onOpen={onOpen} />
            ))}
          </div>
        )}
      </section>

      {newOpen && <NewCrewModal count={crews.length} onCreate={createCrew} onClose={() => setNewOpen(false)} />}

      {pickCrew && pickCrew.members[pick.index] && (
        <SlotPicker crew={pickCrew} role={pickCrew.members[pick.index].role}
                    pool={pool} byId={byId} placedIn={placedIn}
                    onPick={(pid) => { assign(pick.crewId, pick.index, pid); setPick(null); }}
                    onClose={() => setPick(null)} />
      )}

      {menuCrew && menuCrew.members[menu.index] && (
        <MemberMenu crew={menuCrew} member={menuCrew.members[menu.index]}
                    row={rowById[menuCrew.members[menu.index].personId]} crews={crews}
                    onOpenProfile={(pid) => { setMenu(null); onOpen(pid); }}
                    onRole={(role) => setRole(menu.crewId, menu.index, role)}
                    onMove={(target) => { moveTo(menu.crewId, menu.index, target); setMenu(null); }}
                    onSwap={() => { const m = menu; setMenu(null); setPick(m); }}
                    onEmpty={() => { emptySlot(menu.crewId, menu.index); setMenu(null); }}
                    onDelete={() => { deleteSlot(menu.crewId, menu.index); setMenu(null); }}
                    onClose={() => setMenu(null)} />
      )}
    </div>
  );
}

/* ── One crew ── */
function CrewCard({ crew, byId, rowById, onRename, onSlot, onAddRole, onDelete }) {
  const [name, setName] = useState(crew.name);
  useEffect(() => { setName(crew.name); }, [crew.name]);
  const st = crewStats(crew, byId);

  return (
    <div className="crew">
      <div className="crewhead">
        <input className="crewname" value={name} maxLength={40} aria-label="Crew name"
               onChange={(e) => setName(e.target.value)}
               onBlur={() => { const v = name.trim(); if (v && v !== crew.name) onRename(v); else setName(crew.name); }}
               onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
        <button type="button" className="slotx" aria-label={`Delete ${crew.name}`} onClick={onDelete}>✕</button>
      </div>
      <p className="crewstats">
        {st.size} {st.size === 1 ? 'person' : 'people'} · experience {st.exp} · {st.out} outgoing / {st.inn} quiet · {st.cams} sure {st.cams === 1 ? 'camera' : 'cameras'}
      </p>
      <div className="cover">
        {REQUIRED.map(s => (
          <span key={s} className={st.covered.includes(s) ? 'ok' : 'no'}>{SKILL_LABEL[s]} {st.covered.includes(s) ? '✓' : '✗'}</span>
        ))}
      </div>
      <div className="cslots">
        {crew.members.map((m, i) => {
          const row = m.personId ? rowById[m.personId] : null;
          const prof = m.personId ? byId[m.personId] : null;
          return (
            <button key={`${i}-${m.role}`} type="button" className={`cslot ${row ? 'filled' : 'empty'} ${row && !prof ? 'gone' : ''}`}
                    onClick={() => onSlot(i)}>
              <span className="crole">{m.role}</span>
              {row ? (
                <>
                  <Avatar p={row.p} size={38} />
                  <span className="cname">{displayName(row.p)}</span>
                  <span className="cskills">{prof ? skillText(prof) : 'Not coming any more'}</span>
                </>
              ) : (
                <span className="cplus">+ Pick</span>
              )}
            </button>
          );
        })}
      </div>
      <select className="addrole" value="" aria-label="Add a role"
              onChange={(e) => { if (e.target.value) onAddRole(e.target.value); }}>
        <option value="">+ Add role</option>
        {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
    </div>
  );
}

/* ── New crew ── */
function NewCrewModal({ count, onCreate, onClose }) {
  const [name, setName] = useState(`Crew ${count + 1}`);
  const [withTemplate, setWithTemplate] = useState(true);
  useEscape(onClose);
  return (
    <div className="modalwrap" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal small" role="dialog" aria-modal="true" aria-label="New crew">
        <div className="mhead">
          <h3>New crew</h3>
          <button type="button" className="mini ghost" onClick={onClose}>Close</button>
        </div>
        <div className="mbody">
          <label className="fld">
            <span>Name</span>
            <input type="text" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>
          <label className="check">
            <input type="checkbox" checked={withTemplate} onChange={(e) => setWithTemplate(e.target.checked)} />
            <span>Start with the usual roles: {TEMPLATE.join(', ')}</span>
          </label>
          <button type="button" className="save" onClick={() => { onCreate(name.trim(), withTemplate); onClose(); }}>Create crew</button>
        </div>
      </div>
    </div>
  );
}

/* ── Pick a person for a slot: people who chose this role first ── */
function SlotPicker({ crew, role, pool, byId, placedIn, onPick, onClose }) {
  const [q, setQ] = useState('');
  useEscape(onClose);
  const skill = ROLE_SKILL[role];

  const { fits, others } = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = pool
      .filter(r => !t || [r.p.name, r.p.nickname].join(' ').toLowerCase().includes(t))
      .sort((a, b) =>
        (placedIn[a.personId] ? 1 : 0) - (placedIn[b.personId] ? 1 : 0) ||
        byId[b.personId].exp - byId[a.personId].exp ||
        displayName(a.p).localeCompare(displayName(b.p)));
    return {
      fits: skill ? list.filter(r => byId[r.personId].skills.includes(skill)) : [],
      others: skill ? list.filter(r => !byId[r.personId].skills.includes(skill)) : list,
    };
  }, [q, pool, byId, placedIn, skill]);

  const line = (r) => {
    const prof = byId[r.personId];
    const where = placedIn[r.personId];
    const a = r.answers || {};
    return (
      <button key={r.personId} type="button" className="pickrow" onClick={() => onPick(r.personId)}>
        <Avatar p={r.p} size={36} />
        <span className="ptext">
          <b>{displayName(r.p)}</b>
          <span className="meta">
            {[skillText(prof), a.experience, a.energy, where ? `in ${where.name}` : 'free'].filter(Boolean).join(' · ')}
          </span>
        </span>
      </button>
    );
  };

  return (
    <div className="modalwrap" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={`Pick ${role}`}>
        <div className="mhead">
          <h3>{role} · {crew.name}</h3>
          <button type="button" className="mini ghost" onClick={onClose}>Close</button>
        </div>
        <div className="msearch">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name" aria-label="Search" />
        </div>
        <div className="plist">
          {skill && <p className="pickhead">Picked {SKILL_LABEL[skill]} · {fits.length}</p>}
          {fits.map(line)}
          <p className="pickhead">{skill ? 'Everyone else' : 'Everyone'} · {others.length}</p>
          {others.map(line)}
        </div>
      </div>
    </div>
  );
}

/* ── Options for a filled slot ── */
function MemberMenu({ crew, member, row, crews, onOpenProfile, onRole, onMove, onSwap, onEmpty, onDelete, onClose }) {
  useEscape(onClose);
  const roles = ROLE_OPTIONS.includes(member.role) ? ROLE_OPTIONS : [member.role, ...ROLE_OPTIONS];
  return (
    <div className="modalwrap" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal small" role="dialog" aria-modal="true" aria-label="Crew member">
        <div className="mhead">
          <h3>{row ? displayName(row.p) : member.role}</h3>
          <button type="button" className="mini ghost" onClick={onClose}>Close</button>
        </div>
        <div className="mbody">
          {row && <button type="button" className="payopt" onClick={() => onOpenProfile(member.personId)}>Open profile</button>}
          <label className="fld">
            <span>Role</span>
            <select value={member.role} onChange={(e) => onRole(e.target.value)}>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          {crews.length > 1 && (
            <label className="fld">
              <span>Move to</span>
              <select value="" onChange={(e) => { if (e.target.value) onMove(e.target.value); }}>
                <option value="">Choose a crew…</option>
                {crews.filter(c => c.id !== crew.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          )}
          <button type="button" className="payopt" onClick={onSwap}>Put someone else here</button>
          <button type="button" className="payopt away" onClick={onEmpty}>Remove person (keep the slot)</button>
          <button type="button" className="payopt reject" onClick={onDelete}>Delete this slot</button>
        </div>
      </div>
    </div>
  );
}