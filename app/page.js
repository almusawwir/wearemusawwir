"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Papa from 'papaparse';
import { parseStatus } from './lib/eventStyles';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";
const WHATSAPP_URL = "https://chat.whatsapp.com/B68V6Q62HZPHHsGMG0t4jP";
const TZ = "Asia/Kolkata";
const DESC_MAX = 30;
const HOME_LIMIT = 4;

/* ── Extra cards ──
   0 upcoming events in the sheet → show BCC + Free community cards
   1 upcoming event              → show it + a "Join the WhatsApp community" card
   2 or more                     → show only the real events */
const BCC_WEEK = 3;                 // 3rd week of the month
const BCC_WEEKDAY = 0;              // 0 = Sunday, 1 = Monday … 6 = Saturday
const BCC_TIME = '10am – 5pm';
const COMMUNITY_TIME = '11am – 2pm'; // last Sunday of the month
const WHATSAPP_DM_NUMBER = '919096972905'; // 91 = India, then the number

const FORMAT_LABELS = { bcc: 'BCC', odc: 'ODC', community: 'Free', premium: 'Premium' };

/* ── Dates ── */
function todayIST() {
  const n = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

/* Reads sheet dates safely. If the year is missing ("11 Oct"), browsers
   guess 2001, so we add the current year in that case. */
function parseEventDate(raw) {
  if (!raw) return null;
  const s = raw.toString().trim();
  if (!s) return null;
  let d = new Date(s);
  if (isNaN(d.getTime()) || d.getFullYear() < 2020) {
    d = new Date(`${s} ${todayIST().getFullYear()}`);
  }
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDay(d) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
}
function formatDate(raw) {
  const d = parseEventDate(raw);
  if (!d) return raw && raw.toString().trim() ? raw.toString().trim() : 'TBA';
  return formatDay(d);
}

function nthWeekdayOfMonth(year, month, weekday, n) {
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + offset + (n - 1) * 7);
}
function lastWeekdayOfMonth(year, month, weekday) {
  const last = new Date(year, month + 1, 0);
  const offset = (last.getDay() - weekday + 7) % 7;
  return new Date(year, month, last.getDate() - offset);
}
/* This month's date if it hasn't passed yet, otherwise next month's */
function nextOccurrence(dateForMonth) {
  const today = todayIST();
  let y = today.getFullYear();
  let m = today.getMonth();
  let d = dateForMonth(y, m);
  if (d < today) {
    m += 1;
    if (m > 11) { m = 0; y += 1; }
    d = dateForMonth(y, m);
  }
  return d;
}
const nextBccDate = () => nextOccurrence((y, m) => nthWeekdayOfMonth(y, m, BCC_WEEKDAY, BCC_WEEK));
const nextCommunityDate = () => nextOccurrence((y, m) => lastWeekdayOfMonth(y, m, 0));

function isPastEvent(event) {
  if (parseStatus(event.status).code === 'PAST') return true;
  const d = parseEventDate(event.date);
  return d ? d < todayIST() : false; // no date = keep it (TBA events stay)
}

/* ── Cards ── */
function getFormatLabel(event) {
  const f = (event.format || '').toLowerCase().trim();
  if (FORMAT_LABELS[f]) return FORMAT_LABELS[f];
  const text = `${event.id} ${event.title}`.toLowerCase();
  if (text.includes('bcc') || text.includes('broken camera')) return 'BCC';
  if (text.includes('odc') || text.includes('one day crew')) return 'ODC';
  if (isFree(event)) return 'Free';
  return 'Premium';
}
function isFree(event) {
  const p = (event.price || '').toString().trim().toLowerCase();
  return p === '0' || p === 'free';
}
function priceText(event) {
  if (isFree(event)) return 'Free';
  const p = (event.price || '').toString().trim();
  return p ? `From ₹${p}` : 'TBA';
}
function truncate(text, max = DESC_MAX) {
  const t = (text || '').trim();
  if (!t) return '';
  return t.length > max ? t.slice(0, max).trimEnd() + '...' : t;
}
function dmLink(message) {
  return WHATSAPP_DM_NUMBER
    ? `https://wa.me/${WHATSAPP_DM_NUMBER}?text=${encodeURIComponent(message)}`
    : WHATSAPP_URL;
}

function Pink3AM({ text }) {
  const parts = text.split(/(3 AM)/g);
  return parts.map((part, i) =>
    part === '3 AM' ? <span key={i} className="brand">3 AM</span> : <React.Fragment key={i}>{part}</React.Fragment>
  );
}

/* ── This-week popup ──
   Lower number = higher priority. FREE is last, so it only shows if
   nothing else bookable is happening this week. */
const POPUP_RANK = { LAST: 1, FILLING: 2, OPEN: 3, FESTIVAL: 4, REC: 5, NEW: 6, DEFAULT: 7, FREE: 8 };
const POPUP_SKIP = ['SOLDOUT', 'PAST', 'INVITE', 'WAITLIST', 'SOON'];

function pickPopupEvent(events) {
  const today = todayIST();
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + ((7 - today.getDay()) % 7));

  const thisWeek = events
    .map(e => {
      const day = parseEventDate(e.date);
      if (!day || day < today || day > weekEnd) return null;
      const s = parseStatus(e.status);
      if (POPUP_SKIP.includes(s.code)) return null;
      return { event: e, s, day };
    })
    .filter(Boolean);

  if (!thisWeek.length) return null;
  thisWeek.sort((a, b) =>
    (POPUP_RANK[a.s.code] ?? 7) - (POPUP_RANK[b.s.code] ?? 7) || a.day - b.day
  );
  return thisWeek[0];
}

const ABOUT_COPY = [
  "3 AM is a creative community for people who want to make, explore, experiment and meet people along the way.",
  "We bring people together through filmmaking, music, writing, photography, art, conversations, games and creative chaos.",
  "You don't need to be an artist. You don't need experience. You don't need to know anyone.",
  "Just be curious enough to show up.",
  "Some experiences are free. Some are curated. Some are chaotic. Some are built around making something together. Some are simply about meeting people and doing something different.",
  "There isn't one way to do 3 AM.",
  "That's kind of the point.",
];

const FORMATS = [
  {
    name: '3 AM Community',
    line: 'Free meetups. The easiest way in.',
    body: [
      "Come meet the people behind 3 AM. No ticket, no audition and no need to know anyone.",
      "We talk, wander, eat, make things, play around and see where the day takes us.",
      "It's not networking. It's just people meeting people.",
      "Free to join. Optional contribution.",
    ],
  },
  {
    name: 'One Day Crew',
    line: 'Teams, a challenge, a deadline. You make the thing.',
    body: [
      "Get a brief, find your crew and make something together.",
      "You don't need to know exactly what you're doing. That's half the fun.",
    ],
  },
  {
    name: 'Broken Camera Crew',
    line: 'Our signature one-day filmmaking chaos.',
    body: [
      "You show up. We put people together, give you a challenge and a limited amount of time.",
      "Then you make a story.",
      "No crew required. No filmmaking experience required. Just a willingness to figure it out together.",
      "Broken camera. Working imagination.",
    ],
  },
  {
    name: 'Creative Experiences',
    line: 'Hands-on experiences for curious people.',
    body: [
      "Art, music, writing, conversations, experiments and whatever strange idea comes next.",
      "Not workshops. Not networking.",
      "Just something worth showing up for.",
    ],
  },
];

export default function App() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [month, setMonth] = useState('This month');
  const [clock, setClock] = useState(null);
  const [fallback, setFallback] = useState(null);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [popup, setPopup] = useState(null);
  const [lbOpen, setLbOpen] = useState(null);   // index the viewer opened at, or null
  const [lbIndex, setLbIndex] = useState(0);    // photo currently on screen
  const revealRefs = useRef([]);
  const lbRef = useRef(null);

  const setRef = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  // Events from the sheet + gallery images
  useEffect(() => {
    fetch(`${CSV_URL}&cb=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.text())
      .then(text => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (h) => h.trim().toLowerCase().replace(/^\uFEFF/, ''),
          complete: (results) => {
            setEvents(results.data.filter(e => e.id && e.id.trim() !== '' && e.title && e.title.trim() !== ''));
            setIsLoading(false);
          }
        });
      })
      .catch(() => setIsLoading(false));

    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setGalleryImages(data); })
      .catch(err => console.error("Could not load gallery images:", err));
  }, []);

  // Month heading, fallback dates, Bangalore clock
  useEffect(() => {
    setMonth(new Intl.DateTimeFormat('en-IN', { month: 'long', timeZone: TZ }).format(new Date()));
    setFallback({ bcc: nextBccDate(), community: nextCommunityDate() });

    const tick = () => {
      const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ })
          .formatToParts(new Date()).map(p => [p.type, p.value])
      );
      const left = (180 - (+parts.hour * 60 + +parts.minute) + 1440) % 1440;
      const now = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: TZ }).format(new Date());
      setClock({ now, h: Math.floor(left / 60), m: left % 60, isThree: left === 0 });
    };
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, []);

  // Scroll reveal
  useEffect(() => {
    if (isLoading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealRefs.current.forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, [isLoading, events, galleryImages]);

  /* Header hide-on-scroll — waits until it's sure what the user is doing.
     HIDE_AFTER / SHOW_AFTER: how far you must scroll in ONE direction
     LOCK_MS: after it moves, it can't move again for this long
     JUMP: anything bigger in a single frame is a layout jump, not a scroll */
  useEffect(() => {
    const HIDE_AFTER = 80;
    const SHOW_AFTER = 50;
    const TOP_ZONE = 120;
    const BOTTOM_ZONE = 80;
    const LOCK_MS = 400;
    const JUMP = 250;

    let ticking = false;
    let lastY = window.scrollY;
    let dir = 0;
    let travelled = 0;
    let hidden = false;
    let lockUntil = 0;

    const setHidden = (v) => {
      if (v === hidden) return;
      hidden = v;
      travelled = 0;
      lockUntil = performance.now() + LOCK_MS;
      setIsNavHidden(v);
    };

    const compute = () => {
      ticking = false;
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const y = Math.min(Math.max(0, window.scrollY), max);
      const diff = y - lastY;
      lastY = y;

      if (y <= TOP_ZONE) { travelled = 0; setHidden(false); return; }
      if (max - y < BOTTOM_ZONE) return;
      if (Math.abs(diff) > JUMP) { travelled = 0; return; }
      if (diff === 0 || performance.now() < lockUntil) return;

      const d = diff > 0 ? 1 : -1;
      if (d !== dir) { dir = d; travelled = 0; }
      travelled += Math.abs(diff);

      if (dir === 1 && !hidden && travelled >= HIDE_AFTER) setHidden(true);
      else if (dir === -1 && hidden && travelled >= SHOW_AFTER) setHidden(false);
    };

    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(compute); }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // This-week popup, once per session per event. ?popup=1 forces it for testing.
  useEffect(() => {
    if (isLoading || !events.length) return;
    const pick = pickPopupEvent(events);
    if (!pick) return;

    const force = new URLSearchParams(window.location.search).get('popup') === '1';
    const key = `tam-popup-${pick.event.id.trim()}`;
    if (!force) {
      try { if (sessionStorage.getItem(key)) return; } catch {}
    }

    const t = setTimeout(() => {
      setPopup(pick);
      try { sessionStorage.setItem(key, '1'); } catch {}
    }, 900);
    return () => clearTimeout(t);
  }, [isLoading, events]);

  const closePopup = () => setPopup(null);

  // Esc closes the popup
  useEffect(() => {
    if (!popup) return;
    const onKey = (e) => { if (e.key === 'Escape') setPopup(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [popup]);

  /* ── Photo viewer ── */
  const openLb = (i) => { setLbIndex(i); setLbOpen(i); };
  const closeLb = () => setLbOpen(null);

  // Jump straight to the tapped photo when the viewer opens
  useEffect(() => {
    if (lbOpen === null) return;
    const el = lbRef.current;
    if (el) el.scrollTop = lbOpen * el.clientHeight;
  }, [lbOpen]);

  const onLbScroll = () => {
    const el = lbRef.current;
    if (!el || !el.clientHeight) return;
    const i = Math.round(el.scrollTop / el.clientHeight);
    setLbIndex(prev => (prev === i ? prev : i));
  };

  // Keyboard: Esc closes, arrows / space move between photos
  useEffect(() => {
    if (lbOpen === null) return;
    const onKey = (e) => {
      const el = lbRef.current;
      if (!el) return;
      if (e.key === 'Escape') { setLbOpen(null); return; }
      if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        el.scrollBy({ top: el.clientHeight, behavior: 'smooth' });
      }
      if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        el.scrollBy({ top: -el.clientHeight, behavior: 'smooth' });
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lbOpen]);

  // Freeze the page behind any overlay (popup or photo viewer)
  const anyOverlay = !!popup || lbOpen !== null;
  useEffect(() => {
    if (!anyOverlay) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [anyOverlay]);

  // Upcoming only → bookable before sold-out → soonest first → cap at 4
  const upcoming = events
    .filter(e => !isPastEvent(e))
    .sort((a, b) => {
      const fa = parseStatus(a.status).faded ? 1 : 0;
      const fb = parseStatus(b.status).faded ? 1 : 0;
      if (fa !== fb) return fa - fb;
      const da = parseEventDate(a.date);
      const db = parseEventDate(b.date);
      if (da && db) return da - db;
      return da ? -1 : db ? 1 : 0; // dated events before undated
    });
  const homeEvents = upcoming.slice(0, HOME_LIMIT);
  const hiddenCount = upcoming.length - homeEvents.length;

  /* Extra cards, depending on how many real events there are */
  let fillers = [];
  if (fallback && upcoming.length === 0) {
    fillers = [
      {
        key: 'fb-bcc',
        href: dmLink(`Hi! I'd like to join the next Broken Camera Crew on ${formatDay(fallback.bcc)}, ${BCC_TIME}.`),
        status: 'REC | Next BCC',
        format: 'BCC',
        title: 'Broken Camera Crew',
        desc: 'One-day filmmaking chaos.',
        date: formatDay(fallback.bcc),
        time: BCC_TIME,
        price: 'TBA',
        cta: 'Message us',
      },
      {
        key: 'fb-community',
        href: dmLink(`Hi! I'd like to come to the free 3 AM Community meetup on ${formatDay(fallback.community)}, ${COMMUNITY_TIME}.`),
        status: 'FREE',
        format: 'Free',
        title: '3 AM Community',
        desc: 'Meet people, grab lunch.',
        date: formatDay(fallback.community),
        time: COMMUNITY_TIME,
        price: 'Free',
        cta: 'Save my spot',
      },
    ];
  } else if (upcoming.length === 1) {
    fillers = [
      {
        key: 'fb-join',
        href: WHATSAPP_URL,
        status: 'NEW | Always open',
        format: 'Community',
        title: 'Join the WhatsApp community',
        desc: 'Hear about every event first.',
        date: 'Every month',
        time: '',
        price: 'Free',
        cta: 'Join WhatsApp',
      },
    ];
  }

  const renderLights = () => (
    <span className="lights" aria-hidden="true">
      <svg viewBox="0 0 300 26" preserveAspectRatio="none">
        <path d="M0 4 Q 37 22 75 4 T 150 4 T 225 4 T 300 4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".55" />
      </svg>
      {Array.from({ length: 9 }).map((_, i) => <i key={i} style={{ animationDelay: `${(i % 4) * 0.35}s` }} />)}
    </span>
  );

  const renderBadge = (s) => {
    if (s.badgeType === 'none' || !s.badge) return null;
    if (s.badgeType === 'stamp') return <span className="stamp">{s.badge}</span>;
    if (s.badgeType === 'dot') return <span className="badge"><i className="blink"></i>{s.badge}</span>;
    return <span className="badge">{s.badge}</span>;
  };

  /* One card layout for both real events and extra cards */
  const renderCard = ({ key, href, external, s, format, title, desc, date, time, price, cta, delay }) => {
    const hasBadge = s.badgeType !== 'none' && s.badge;
    const className = `card t-${s.theme} ${s.faded ? 'faded' : ''} ${hasBadge ? 'hasbadge' : ''}`;
    const inner = (
      <>
        {s.lit && renderLights()}
        {renderBadge(s)}
        <div className="card-body">
          <span className="format">{format}</span>
          <span className="name">{title}</span>
          {desc && <span className="desc">{desc}</span>}
          <div className="meta">
            <div><span>Date</span><b>{date}</b>{time && <small>{time}</small>}</div>
            <div><span>Price</span><b>{price}</b></div>
          </div>
          <span className="cta">{cta}</span>
        </div>
      </>
    );
    const style = { animationDelay: `${delay}ms` };
    return external ? (
      <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>{inner}</a>
    ) : (
      <Link key={key} href={href} className={className} style={style}>{inner}</Link>
    );
  };

  return (
    <div className="tam">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Instrument+Sans:wght@400;500;600&display=swap');

        html,body{margin:0;padding:0;width:100%;max-width:100%}
        html{scroll-behavior:smooth}
        .tam{
          min-width:0;
          --pink:#FF0065; --pink-soft:#FFE3EE; --black:#000; --white:#fff; --grey:#5c5c5c;
          --display:"Big Shoulders Display","Arial Narrow",Impact,sans-serif;
          --body:"Instrument Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
          font-family:var(--body); background:var(--white); color:var(--black);
          line-height:1.55; font-size:17px; width:100%; max-width:100vw; min-height:100vh;
          /* clip, not hidden: hides sideways overflow without creating a
             second scroll area (that broke scrolling on phones) */
          overflow-x:hidden; overflow-x:clip;
        }
        .tam *{box-sizing:border-box}
        .tam a{color:inherit}
        .tam .brand{color:var(--pink)}
        .tam :focus-visible{outline:3px solid var(--pink);outline-offset:3px}
        .tam .wrap{max-width:1180px;margin:0 auto;padding:0 24px;width:100%}
        .tam .reveal{opacity:0;transform:translateY(24px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
        .tam .reveal.active{opacity:1;transform:none}

        /* Header */
        .tam .top{position:sticky;top:0;z-index:60;background:var(--black);color:var(--white);
          padding-top:env(safe-area-inset-top,0px);
          transition:transform .38s cubic-bezier(.33,1,.68,1)}
        .tam .top.hidden{transform:translate3d(0,-100%,0)}
        .tam .bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:16px;padding-bottom:16px;min-height:64px}
        .tam .navlinks{display:flex;align-items:center;gap:20px;font-size:16px;font-weight:500;flex:0 0 auto}
        .tam .navlinks a{text-decoration:none;opacity:.85;padding:8px 2px;display:inline-block;white-space:nowrap}
        .tam .navlinks a:hover{opacity:1;color:var(--pink)}
        .tam .clock{font-size:13px;color:#bdbdbd;margin:0}
        .tam .clock b{color:var(--white);font-weight:600}

        /* Hero */
        .tam .hero{padding-top:40px;padding-bottom:4px;text-align:center;display:flex;flex-direction:column;align-items:center}
        .tam .tagline{font-weight:500;color:var(--pink);font-size:16px;margin:0}
        .tam h1{font-family:var(--display);font-weight:900;font-size:clamp(40px,11vw,150px);line-height:.92;letter-spacing:-.5px;margin:10px 0 14px}
        .tam .lede{max-width:52ch;font-size:17px;color:#222;margin:0 auto}

        /* Events section */
        .tam #event{padding-bottom:56px}
        .tam .events{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding:24px 0 0;align-items:stretch}
        .tam .fallnote{text-align:center;margin:22px 0 0;color:var(--grey);font-size:15px}
        .tam .more{display:flex;justify-content:center;margin-top:28px}
        .tam .more a{display:inline-block;padding:13px 26px;font-weight:600;font-size:15px;text-decoration:none;
          border:2px solid var(--black);background:var(--white);color:var(--black)}
        @media (hover:hover){ .tam .more a:hover{background:var(--black);color:var(--white)} }

        /* Rise-in for placeholders and real cards. "backwards" so it
           doesn't block the hover lift afterwards. */
        @keyframes tamrise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}

        /* Cards */
        .tam .card{position:relative;display:flex;flex-direction:column;height:100%;text-decoration:none;
          border:2px solid var(--black);background:var(--white);color:var(--black);
          transition:transform .15s ease, box-shadow .15s ease;
          animation:tamrise .6s cubic-bezier(.16,1,.3,1) backwards}
        .tam .card-body{display:flex;flex-direction:column;flex:1;padding:20px;min-height:220px}
        .tam .card.hasbadge .card-body{padding-top:52px}
        .tam .format{font-size:13px;font-weight:600}
        .tam .name{font-family:var(--display);font-weight:900;font-size:36px;line-height:1.15;margin:8px 0 8px;word-break:break-word}
        .tam .desc{font-size:14.5px;opacity:.85;margin-bottom:auto}
        .tam .meta{display:flex;justify-content:space-between;gap:10px;margin:18px 0 14px;font-size:14px}
        .tam .meta div{display:flex;flex-direction:column;gap:2px}
        .tam .meta span{opacity:.65;font-size:12.5px}
        .tam .meta b{font-weight:600}
        .tam .meta small{font-size:12.5px;font-weight:500;opacity:.8}
        .tam .cta{display:block;text-align:center;padding:12px;font-weight:600;font-size:14.5px;border:2px solid currentColor;min-height:44px}

        /* Loading placeholders */
        .tam .skelcard{border:2px dashed #d4d4d4;min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;
          animation:tamrise .7s cubic-bezier(.16,1,.3,1) backwards}
        .tam .tri{width:46px;height:42px;overflow:visible}
        .tam .tri path{fill:none;stroke:var(--pink);stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round;
          stroke-dasharray:100;stroke-dashoffset:100;animation:tamdraw 2.2s cubic-bezier(.65,0,.35,1) infinite}
        @keyframes tamdraw{0%{stroke-dashoffset:100;opacity:.35}45%{stroke-dashoffset:0;opacity:1}55%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:-100;opacity:.35}}
        .tam .dots{display:flex;gap:6px}
        .tam .dots i{width:6px;height:6px;border-radius:50%;background:var(--black);opacity:.15;animation:tamdot 1.4s ease-in-out infinite}
        .tam .dots i:nth-child(2){animation-delay:.2s}
        .tam .dots i:nth-child(3){animation-delay:.4s}
        @keyframes tamdot{0%,100%{opacity:.15;transform:translateY(0)}50%{opacity:.8;transform:translateY(-3px)}}

        /* Badges */
        .tam .badge{position:absolute;top:12px;left:12px;z-index:4;display:inline-flex;align-items:center;gap:7px;
          font-size:12px;font-weight:600;padding:4px 10px;background:var(--white);color:var(--black);border:2px solid var(--black)}
        .tam .badge .blink{width:9px;height:9px;border-radius:50%;background:var(--pink);
          animation:tamblink 1.1s steps(1) infinite;flex:0 0 auto}
        @keyframes tamblink{50%{opacity:0}}
        .tam .stamp{position:absolute;top:12px;right:12px;z-index:4;font-family:var(--display);font-weight:900;
          font-size:24px;line-height:1.2;color:var(--pink);background:var(--white);transform:rotate(6deg);
          border:3px solid var(--pink);padding:0 8px}

        /* Themes from the status column */
        .tam .t-dark{background:var(--black);color:var(--white)}
        .tam .t-dark .cta{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .t-dark .badge{background:var(--black);color:var(--white);border-color:var(--white)}

        .tam .t-pink{background:var(--pink);color:var(--black)}
        .tam .t-pink .cta{background:var(--black);border-color:var(--black);color:var(--white)}
        .tam .t-pink .badge{background:var(--white);border-color:var(--black)}
        .tam .t-pink .badge .blink{background:var(--black)}

        .tam .t-white .cta{background:var(--pink);border-color:var(--pink);color:var(--white)}

        .tam .t-new{border-width:5px;border-color:var(--pink)}
        .tam .t-new .cta{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .t-new .badge{border-color:var(--pink);color:var(--pink)}

        .tam .t-soft{background:var(--pink-soft);border-style:dashed}
        .tam .t-soft .cta{background:var(--black);border-color:var(--black);color:var(--white)}

        .tam .t-invite{background:var(--black);color:var(--white);border-style:dashed;border-color:var(--pink);border-width:3px}
        .tam .t-invite .cta{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .t-invite .badge{background:transparent;color:var(--pink);border-color:var(--pink)}

        .tam .t-festival{background:var(--black);color:var(--white);overflow:hidden}
        .tam .t-festival .card-body{padding-top:56px}
        .tam .t-festival.hasbadge .card-body{padding-top:76px}
        .tam .t-festival .cta{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .t-festival .badge{background:var(--black);color:var(--white);border-color:var(--white);top:36px}
        .tam .lights{position:absolute;top:0;left:0;right:0;height:26px;z-index:3;color:#fff;pointer-events:none;display:block}
        .tam .lights svg{position:absolute;inset:0;width:100%;height:100%}
        .tam .lights i{position:absolute;top:0;width:7px;height:7px;border-radius:50%;animation:tamglow 2.4s ease-in-out infinite}
        .tam .lights i:nth-child(2){left:6%;top:9px;background:#FF0065;box-shadow:0 0 8px #FF0065}
        .tam .lights i:nth-child(3){left:17%;top:15px;background:#FFC53D;box-shadow:0 0 8px #FFC53D}
        .tam .lights i:nth-child(4){left:28%;top:9px;background:#4DA3FF;box-shadow:0 0 8px #4DA3FF}
        .tam .lights i:nth-child(5){left:39%;top:4px;background:#FF0065;box-shadow:0 0 8px #FF0065}
        .tam .lights i:nth-child(6){left:50%;top:9px;background:#3DDC84;box-shadow:0 0 8px #3DDC84}
        .tam .lights i:nth-child(7){left:61%;top:15px;background:#FFC53D;box-shadow:0 0 8px #FFC53D}
        .tam .lights i:nth-child(8){left:72%;top:9px;background:#FF0065;box-shadow:0 0 8px #FF0065}
        .tam .lights i:nth-child(9){left:83%;top:4px;background:#4DA3FF;box-shadow:0 0 8px #4DA3FF}
        .tam .lights i:nth-child(10){left:93%;top:11px;background:#FFC53D;box-shadow:0 0 8px #FFC53D}
        @keyframes tamglow{0%,100%{opacity:1}50%{opacity:.35}}

        .tam .faded{opacity:.5}
        .tam .faded .cta{background:transparent !important;color:inherit !important;border-color:currentColor !important}
        .tam .faded .blink{animation:none;background:currentColor}

        @media (hover:hover){
          .tam .card:hover{transform:translate(-3px,-3px);box-shadow:6px 6px 0 var(--black)}
          .tam .t-dark:hover,.tam .t-festival:hover,.tam .t-invite:hover{box-shadow:6px 6px 0 var(--pink)}
          .tam .faded:hover{transform:none;box-shadow:none}
        }

        /* About */
        .tam .about{border-top:2px solid var(--black);padding-top:60px;padding-bottom:60px;display:grid;grid-template-columns:1fr 1.3fr;gap:48px}
        .tam .h2{font-family:var(--display);font-weight:900;font-size:clamp(34px,6vw,72px);line-height:.92;margin:0}
        .tam .about p{max-width:60ch;margin:0 0 14px;font-size:16px}
        .tam .formats{margin:26px 0 0;border-top:1px solid var(--black)}
        .tam .fmt{border-bottom:1px solid var(--black)}
        .tam .fmt > summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px 4px;font-size:16px}
        .tam .fmt > summary::-webkit-details-marker{display:none}
        .tam .fmt > summary strong{font-weight:600;margin-right:6px}
        .tam .fmt .plus{flex:0 0 auto;font-size:22px;font-weight:400;line-height:1;transition:transform .25s ease}
        .tam .fmt[open] .plus{transform:rotate(45deg)}
        .tam .fmt-body{padding:0 4px 20px;font-size:15.5px;max-width:64ch}
        .tam .fmt-body p{margin:0 0 12px}

        /* Gallery strip — first photo lines up with the heading on wide screens */
        .tam .proof{background:var(--white);color:var(--black);border-top:2px solid var(--black);padding:56px 0}
        .tam .proof-head{margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap}
        .tam .proof-hint{font-size:14px;color:var(--grey);margin:0}
        .tam .strip{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x proximity;
          padding:0 max(24px, calc((100vw - 1180px) / 2 + 24px)) 8px;
          scroll-padding:0 max(24px, calc((100vw - 1180px) / 2 + 24px));
          scrollbar-width:none;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}
        .tam .strip::-webkit-scrollbar{display:none}
        .tam .shot{position:relative;flex:0 0 auto;width:min(70vw,340px);aspect-ratio:4/5;scroll-snap-align:start;background:#eee;
          overflow:hidden;border:2px solid var(--black);padding:0;margin:0;cursor:zoom-in;display:block;
          appearance:none;-webkit-appearance:none;font:inherit}
        .tam .shot img{transition:transform .6s ease}
        @media (hover:hover){ .tam .shot:hover img{transform:scale(1.04)} }

        /* Fullscreen photo viewer — scroll / swipe up and down between photos */
        .tam .lb{position:fixed;inset:0;z-index:300;background:#000;color:#fff;animation:tamfade .2s ease}
        .tam .lb-scroll{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;scroll-snap-type:y mandatory;
          overscroll-behavior:contain;scrollbar-width:none;-webkit-overflow-scrolling:touch}
        .tam .lb-scroll::-webkit-scrollbar{display:none}
        .tam .lb-slide{position:relative;width:100%;height:100%;scroll-snap-align:start;scroll-snap-stop:always}
        .tam .lb-x{position:absolute;top:calc(12px + env(safe-area-inset-top,0px));right:12px;z-index:2;width:48px;height:48px;
          background:rgba(0,0,0,.6);border:2px solid #fff;color:#fff;font-size:20px;cursor:pointer;font-family:inherit}
        .tam .lb-count{position:absolute;top:calc(24px + env(safe-area-inset-top,0px));left:16px;z-index:2;font-size:14px;font-weight:600;
          background:rgba(0,0,0,.6);padding:4px 10px;pointer-events:none}
        .tam .lb-hint{position:absolute;bottom:calc(20px + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%);z-index:2;
          font-size:13px;background:rgba(0,0,0,.6);padding:5px 12px;pointer-events:none;white-space:nowrap}

        /* Join */
        .tam .join{border-top:2px solid var(--black);padding-top:56px;padding-bottom:56px;display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}
        .tam .join p{margin:10px 0 0;max-width:48ch}
        .tam .btns{display:flex;gap:12px;flex-wrap:nowrap}
        .tam .btn{flex:1 1 0;display:inline-block;padding:14px 16px;font-weight:600;font-size:15px;text-decoration:none;border:2px solid var(--black);text-align:center;white-space:nowrap}
        .tam .btn.pink{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .btn.wa{background:var(--black);border-color:var(--black);color:var(--white)}

        /* Footer */
        .tam footer{background:var(--black);color:var(--white);padding:36px 0 calc(40px + env(safe-area-inset-bottom,0px))}
        .tam footer .fbar{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap}
        .tam footer .fline{margin:12px 0 0;max-width:40ch;color:#bdbdbd;font-size:15px}
        .tam footer nav{display:flex;gap:20px;flex-wrap:wrap;font-size:15px}
        .tam footer small{display:block;color:#8d8d8d;margin-top:18px;font-size:13px}

        /* This-week popup */
        .tam .pop-wrap{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.6);display:flex;align-items:center;
          justify-content:center;padding:20px;animation:tamfade .25s ease}
        .tam .pop{position:relative;width:100%;max-width:440px;border:3px solid var(--black);background:var(--white);
          color:var(--black);padding:28px 24px 24px;box-shadow:8px 8px 0 var(--pink);overflow:hidden;
          animation:tampop .4s cubic-bezier(.16,1,.3,1)}
        .tam .pop.t-festival{padding-top:44px}
        .tam .pop-x{position:absolute;top:8px;right:8px;z-index:5;width:44px;height:44px;background:none;border:0;
          color:inherit;font-size:20px;cursor:pointer;font-family:inherit}
        .tam .pop-eyebrow{display:block;font-size:12.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;
          opacity:.75;margin-bottom:12px}
        .tam .pop-badge{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:600;padding:4px 10px;
          border:2px solid currentColor;margin-bottom:12px}
        .tam .pop-badge .blink{width:9px;height:9px;border-radius:50%;background:var(--pink);animation:tamblink 1.1s steps(1) infinite}
        .tam .pop.t-pink .pop-badge .blink{background:var(--black)}
        .tam .pop-name{font-family:var(--display);font-weight:900;font-size:clamp(34px,9vw,52px);line-height:1.02;
          margin:0 0 8px;word-break:break-word;padding-right:34px}
        .tam .pop-tag{margin:0 0 18px;font-size:15.5px;opacity:.85}
        .tam .pop-meta{display:flex;gap:28px;margin:0 0 22px;font-size:15px}
        .tam .pop-meta div{display:flex;flex-direction:column;gap:2px}
        .tam .pop-meta span{font-size:12px;opacity:.65}
        .tam .pop-meta b{font-weight:600}
        .tam .pop-meta small{font-size:13px;opacity:.8}
        .tam .pop-btns{display:flex;flex-direction:column;gap:10px}
        .tam .pop-go,.tam .pop-skip{display:block;text-align:center;padding:14px;font-weight:600;font-size:15.5px;
          text-decoration:none;border:2px solid currentColor}
        .tam .pop-go{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .pop.t-pink .pop-go{background:var(--black);border-color:var(--black)}
        .tam .pop-skip{background:transparent;color:inherit}
        @keyframes tamfade{from{opacity:0}to{opacity:1}}
        @keyframes tampop{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}

        @media (max-width:1024px){ .tam .name{font-size:30px} }

        @media (max-width:820px){
          .tam .wrap{padding:0 20px}
          .tam .clock{display:none}
          .tam .bar{padding-top:14px;padding-bottom:14px;min-height:60px;gap:10px}
          .tam .navlinks{gap:16px;font-size:14.5px}
          .tam .hero{padding-top:28px;padding-bottom:2px}
          .tam .tagline{font-size:14px}
          .tam h1{margin:8px 0 10px}
          .tam .lede{font-size:15px;line-height:1.5}

          .tam #event{padding-bottom:44px}
          .tam .events{grid-template-columns:repeat(2,1fr);gap:14px;padding-top:20px}
          .tam .fallnote{font-size:14px;margin-top:18px}
          .tam .more{margin-top:22px}
          .tam .more a{width:100%;text-align:center}
          .tam .skelcard{min-height:240px}
          .tam .card-body{padding:16px;min-height:200px}
          .tam .card.hasbadge .card-body{padding-top:46px}
          .tam .t-festival .card-body{padding-top:48px}
          .tam .t-festival.hasbadge .card-body{padding-top:70px}
          .tam .format{font-size:12px}
          .tam .name{font-size:22px;margin:8px 0 6px}
          .tam .desc{font-size:13px;line-height:1.45}
          .tam .meta{margin:16px 0 12px;font-size:12.5px}
          .tam .meta span{font-size:11px}
          .tam .meta small{font-size:11.5px}
          .tam .cta{padding:11px;font-size:13.5px}
          .tam .badge{top:10px;left:10px;font-size:10.5px;padding:3px 8px;gap:5px}
          .tam .badge .blink{width:7px;height:7px}
          .tam .t-festival .badge{top:32px}
          .tam .stamp{font-size:16px;top:10px;right:10px;padding:0 6px;border-width:2px}

          .tam .about{grid-template-columns:1fr;gap:20px;padding-top:44px;padding-bottom:44px}
          .tam .about p{font-size:15.5px}
          .tam .fmt > summary{font-size:15px;padding:14px 4px}
          .tam .fmt-body{font-size:15px;padding:0 4px 18px}
          .tam .proof{padding:44px 0}
          .tam .proof-hint{font-size:13px}
          .tam .strip{padding:0 20px 8px;scroll-padding:0 20px}
          .tam .join{padding-top:44px;padding-bottom:44px;flex-direction:column;align-items:flex-start}
          .tam .btns{width:100%}
          .tam .btn{padding:14px 10px;font-size:14px}
          .tam footer nav{gap:16px}

          .tam .pop-wrap{align-items:flex-end;padding:0}
          .tam .pop{max-width:none;border-bottom:0;box-shadow:none;
            padding-bottom:calc(24px + env(safe-area-inset-bottom,0px))}
        }

        @media (max-width:380px){ .tam .navlinks{gap:12px;font-size:13.5px} }
        @media (max-width:360px){
          .tam .wrap{padding:0 16px}
          .tam .strip{padding:0 16px 8px;scroll-padding:0 16px}
          .tam .events{gap:10px}
          .tam .name{font-size:19px}
          .tam .card-body{padding:12px}
          .tam .card.hasbadge .card-body{padding-top:42px}
        }

        @media (prefers-reduced-motion:reduce){
          html{scroll-behavior:auto}
          .tam .reveal{opacity:1;transform:none;transition:none}
          .tam .card,.tam .skelcard,.tam .top,.tam .shot img{transition:none;animation:none}
          .tam .blink,.tam .lights i,.tam .tri path,.tam .dots i,.tam .pop,.tam .pop-wrap,.tam .lb{animation:none}
          .tam .tri path{stroke-dashoffset:0}
        }
      `}} />

      <header className={`top ${isNavHidden ? 'hidden' : ''}`}>
        <div className="wrap bar">
          <Link href="/" aria-label="3 AM Ideas home" style={{ display: 'flex', alignItems: 'center' }}>
            <Image src="/images/white_logo.png" alt="3 AM Ideas" width={130} height={32} priority style={{ height: 28, width: 'auto' }} />
          </Link>
          {clock && (
            <p className="clock">
              {clock.isThree
                ? <>It&apos;s <b>3 AM</b> in Bangalore. Good time for an idea.</>
                : <>{clock.now} in Bangalore. <b>{clock.h}h {clock.m}m</b> till 3 AM.</>}
            </p>
          )}
          <nav className="navlinks">
            <Link href="/about">About</Link>
            <Link href="/event">All events</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="wrap hero">
          <p className="tagline">Some ideas are too good to sleep on.</p>
          <h1>{month} at <span className="brand">3 AM</span></h1>
          <p className="lede">A creative community in Bangalore for people who want to make things, meet people and chase ideas.</p>
        </section>

        <section id="event" aria-label="Upcoming events">
          <div className="wrap">
            {isLoading ? (
              <div className="events" aria-busy="true" aria-label="Loading events">
                {Array.from({ length: HOME_LIMIT }).map((_, i) => (
                  <div className="skelcard" key={i} style={{ animationDelay: `${i * 90}ms` }}>
                    <svg className="tri" viewBox="0 0 46 42" aria-hidden="true">
                      <path d="M23 3 L43 39 L3 39 Z" pathLength="100" style={{ animationDelay: `${i * 0.22}s` }} />
                    </svg>
                    <span className="dots" aria-hidden="true"><i></i><i></i><i></i></span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {homeEvents.length === 0 && (
                  <p className="fallnote">Nothing booked yet. Here&apos;s what&apos;s coming up next.</p>
                )}
                <div className="events">
                  {homeEvents.map((event, i) => {
                    const s = parseStatus(event.status);
                    return renderCard({
                      key: event.id || i,
                      href: `/event/${event.id.trim()}`,
                      external: false,
                      s,
                      format: getFormatLabel(event),
                      title: event.title,
                      desc: truncate(event.tagline || event.description),
                      date: formatDate(event.date),
                      time: (event.time || '').trim(),
                      price: priceText(event),
                      cta: event.button_text || s.cta,
                      delay: i * 80,
                    });
                  })}
                  {fillers.map((c, i) => renderCard({
                    ...c,
                    external: true,
                    s: parseStatus(c.status),
                    delay: (homeEvents.length + i) * 80,
                  }))}
                </div>
                {hiddenCount > 0 && (
                  <div className="more">
                    <Link href="/event">See all {upcoming.length} events</Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {galleryImages.length > 0 && (
          <section className="proof">
            <div className="wrap proof-head reveal" ref={setRef}>
              <h2 className="h2">This is what <span className="brand">3 AM</span> looks like.</h2>
              <p className="proof-hint">Tap a photo to see it full screen.</p>
            </div>
            <div className="strip">
              {galleryImages.map((filename, index) => (
                <button type="button" key={index} className="shot" onClick={() => openLb(index)}
                        aria-label={`Open photo ${index + 1} of ${galleryImages.length}`}>
                  <Image src={`/images/home/${filename}`} alt="" fill quality={80}
                         sizes="(max-width: 820px) 70vw, 340px" style={{ objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </section>
        )}

        <section id="about-section" className="wrap about reveal" ref={setRef}>
          <h2 className="h2">What is <span className="brand">3 AM</span>?</h2>
          <div id="values">
            {ABOUT_COPY.map((p, i) => <p key={i}><Pink3AM text={p} /></p>)}
            <div className="formats">
              {FORMATS.map((f) => (
                <details className="fmt" key={f.name}>
                  <summary>
                    <span><strong>{f.name}</strong> — {f.line}</span>
                    <span className="plus">+</span>
                  </summary>
                  <div className="fmt-body">
                    {f.body.map((p, i) => <p key={i}><Pink3AM text={p} /></p>)}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="wrap join reveal" ref={setRef}>
          <div>
            <h2 className="h2">Be there for the next one.</h2>
            <p>The full calendar drops on the 1st of every month. The WhatsApp community gets it before anyone else.</p>
          </div>
          <div className="btns">
            <a className="btn wa" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Join WhatsApp</a>
            <Link className="btn pink" href="/event">See all events</Link>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap fbar">
          <div>
            <Image src="/images/white_logo.png" alt="3 AM Ideas" width={120} height={30} style={{ height: 26, width: 'auto' }} />
            <p className="fline">A creative community for people who&apos;d rather make something than just talk about it.</p>
            <small>© {new Date().getFullYear()} 3 AM Ideas, Bangalore</small>
          </div>
          <nav>
            <Link href="/about">About</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
            <a href="mailto:wearemusawwir@gmail.com">Contact</a>
          </nav>
        </div>
      </footer>

      {/* Fullscreen photo viewer */}
      {lbOpen !== null && (
        <div className="lb" role="dialog" aria-modal="true" aria-label="Photo viewer">
          <button type="button" className="lb-x" onClick={closeLb} aria-label="Close photos" autoFocus>✕</button>
          <span className="lb-count" aria-live="polite">{lbIndex + 1} / {galleryImages.length}</span>
          <div className="lb-scroll" ref={lbRef} onScroll={onLbScroll}>
            {galleryImages.map((filename, i) => (
              <div className="lb-slide" key={i}>
                <Image src={`/images/home/${filename}`} alt={`3 AM Ideas event photo ${i + 1}`} fill quality={85}
                       sizes="100vw" style={{ objectFit: 'contain' }} />
              </div>
            ))}
          </div>
          {lbIndex < galleryImages.length - 1 && <span className="lb-hint">Scroll for the next one ↓</span>}
        </div>
      )}

      {/* This-week popup */}
      {popup && (
        <div className="pop-wrap" role="dialog" aria-modal="true" aria-labelledby="pop-title" onClick={closePopup}>
          <div className={`pop t-${popup.s.theme}`} onClick={(e) => e.stopPropagation()}>
            {popup.s.lit && renderLights()}
            <button type="button" className="pop-x" onClick={closePopup} aria-label="Close" autoFocus>✕</button>
            <span className="pop-eyebrow">This week at 3 AM</span>
            {popup.s.badge && popup.s.badgeType !== 'none' && (
              <span className="pop-badge">
                {popup.s.badgeType === 'dot' && <i className="blink"></i>}
                {popup.s.badge}
              </span>
            )}
            <h2 id="pop-title" className="pop-name">{popup.event.title}</h2>
            {popup.event.tagline && <p className="pop-tag">{popup.event.tagline}</p>}
            <div className="pop-meta">
              <div>
                <span>Date</span>
                <b>{formatDate(popup.event.date)}</b>
                {popup.event.time && <small>{popup.event.time}</small>}
              </div>
              <div><span>Price</span><b>{priceText(popup.event)}</b></div>
            </div>
            <div className="pop-btns">
              <Link className="pop-go" href={`/event/${popup.event.id.trim()}`} onClick={closePopup}>
                {popup.event.button_text || popup.s.cta}
              </Link>
              <a className="pop-skip" href="#event" onClick={closePopup}>See other events</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}