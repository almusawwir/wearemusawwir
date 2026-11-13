"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { css } from './_lib/styles';
import { CACHE_KEY, HOME, applyOverride } from './_lib/helpers';
import { Loader } from './_components/Common';
import PersonDrawer from './_components/PersonDrawer';
import EventView from './_components/EventView';
import { EveryoneView, ProducersView } from './_components/Directory';
import HomeView from './_components/Home';

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

  /* Saves are tracked so a refresh that started earlier can't overwrite them */
  const writeSeq = useRef(0);
  const pendingWrites = useRef(0);
  const loadRef = useRef(null);
  const track = useCallback(async (fn) => {
    writeSeq.current++;
    pendingWrites.current++;
    try { return await fn(); }
    finally { pendingWrites.current--; writeSeq.current++; }
  }, []);

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
    const startSeq = writeSeq.current;
    try {
      const res = await fetch('/api/us/people', { cache: 'no-store' });
      if (res.status === 401) {
        try { sessionStorage.removeItem(CACHE_KEY); } catch {}
        setData(null); setPhase('locked');
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not load');
      // Something was saved while this was loading, so this copy is out of date: fetch again
      if (writeSeq.current !== startSeq || pendingWrites.current > 0) {
        setTimeout(() => loadRef.current && loadRef.current(), 700);
        return;
      }
      setData(json);
      setPhase('ready');
    } catch (err) {
      setLoadErr(err.message || 'Could not load');
      setPhase(p => (p === 'checking' ? 'locked' : p));
    } finally {
      setLoading(false);
    }
  }, []);
  loadRef.current = load;

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
                         onLocked={lock} onEventUpdate={onEventUpdate} track={track} />
            )}
            {screen === 'event' && !currentEvent && (
              <p className="empty">This event isn&apos;t on the board any more. <button type="button" className="link" onClick={() => goScreen('home')}>Back home</button></p>
            )}

            {screen === 'unassigned' && unassignedEvent && (
              <EventView key="__unassigned" ev={unassignedEvent} people={data.people} peopleById={peopleById}
                         maxProducers={0} readOnly onBack={back} onOpen={openPerson}
                         onLocked={lock} onEventUpdate={() => {}} track={track} />
            )}
          </main>

          {personOpen && (
            <PersonDrawer key={personOpen.id} p={personOpen} tiers={data.tiers} track={track}
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