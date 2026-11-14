"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Papa from 'papaparse';
import { parseStatus } from '../lib/eventStyles';
import { parseEventDate, isPastEvent } from '../lib/eventHelpers';

const WHATSAPP_URL = "https://chat.whatsapp.com/KRwGD7vmniL5jWjP1aEycF";
// Your CMS sheet (same one the homepage reads)
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";
// Registrations are sent to /api/odc/submit. The Google script URL lives ONLY in
// app/api/odc/submit/route.js, so there's one place to keep it correct.

/* ── Edit these ── */
const EVENT_NAME = 'One Day Crew';
const AMOUNT = 0;                         // fallback price when no ODC is listed in the sheet
const UPI_ID = 'nazi4272m-1@okicici';
const PAYEE_NAME = 'Nazim Mansuri';
const QR_IMAGE = '/images/pay.jpeg';      // must be in public/images/, NOT public/images/home/

// An event counts as ODC only if its ID STARTS with "ODC" (any capitals):
// ODC, ODC-4, ODC-78, ODCvol67 → yes.  podcast-night, BCC-ODC-collab → no.
const ODC_ID = /^odc/i;

const EXPLORE = [
  'Acting', 'Directing', 'Cinematography / Camera', 'Photography', 'Editing', 'Writing',
  'Sound Designing', 'Music Production', 'Filmmaking', 'Trying something completely new', 'Not sure', 'Surprise me!',
];
const EXPERIENCE = ['Never done it', 'Just started', 'Have some experience', 'Professional'];
const ENERGY = ['Main Character Energy', 'The Observer', 'Social Butterfly', 'Mysterious Creature', 'Depends on the room!'];
const REASONS = [
  'I want to make a short film.',
  'I want to meet creative people.',
  'I want to explore something new.',
  'I want to build my portfolio.',
  "I'm here for the experience and chaos.",
  'A little bit of everything!',
];
const REACTIONS = [
  'New side quest unlocked!',
  "Let's try it. I'll figure it out.",
  "I'm open to it with some guidance.",
  "I'd prefer my chosen role.",
];
const DEVICE = [
  'Yes, absolutely.',
  'Maybe, depending on the shoot.',
  "I have one, but I'd prefer not to use it.",
  "No, I'd need to use what the crew has.",
];
const TERMS = [
  '3 AM Ideas provides the curated crew, script, storyboard and filmmaking experience.',
  "We'll try to provide a microphone, subject to availability.",
  'Professional cameras, lenses, lighting, shooting locations and additional production expenses are not included.',
  'The crew must submit its film within one week.',
  'All footage and photographs captured during ODC must be uploaded to 3 AM Ideas. 3 AM Ideas retains ownership and the agreed rights to edit, archive and use the material for promotional purposes, as covered by the participant release.',
];

const MAX_FILE_MB = 12;
const MAX_SIDE = 1600;
const TARGET_BYTES = 1.5 * 1024 * 1024;

const BASE_ORDER = ['name', 'whatsapp', 'social', 'birthday', 'city', 'explore', 'experience', 'energy',
  'reason', 'reaction', 'device', 'why', 'consent'];
const MESSAGES = {
  name: 'Tell us your name.',
  whatsapp: 'Enter a valid WhatsApp number.',
  social: 'Add your Instagram or LinkedIn.',
  birthday: 'Add your birthday.',
  city: 'Tell us where you are based.',
  explore: 'Pick at least one.',
  experience: 'Pick one.',
  energy: 'Pick one.',
  reason: 'Pick one.',
  reaction: 'Pick one.',
  device: 'Pick one.',
  why: 'Tell us a little about why.',
  consent: 'Please agree to the terms to continue.',
  event: 'Pick the ODC you are joining.',
  shot: 'Upload your payment screenshot.',
};

/* ── Reading ODC dates from the CMS sheet ── */
function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function dateLabel(raw) {
  const d = parseEventDate(raw);
  if (!d) return (raw || '').toString().trim() || 'Date TBA';
  const weekday = d.toLocaleDateString('en-IN', { weekday: 'long' });
  const month = d.toLocaleDateString('en-IN', { month: 'short' });
  return `${weekday} ${ordinal(d.getDate())} ${month}`;   // e.g. Sunday 15th Nov
}
function isOdc(e) {
  return ODC_ID.test((e.id || '').trim());
}
function priceNumber(p) {
  const n = parseInt(String(p || '').replace(/[^\d]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

/* Shrinks a photo or screenshot to a small JPEG so it uploads fast on mobile data */
async function compressImage(file) {
  let src;
  try {
    src = await createImageBitmap(file);
  } catch {
    src = await new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable')); };
      img.src = url;
    });
  }
  const w = src.width, h = src.height;
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
  const cw = Math.max(1, Math.round(w * scale));
  const ch = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement('canvas');
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(src, 0, 0, cw, ch);
  if (src.close) src.close();

  let q = 0.85, dataUrl = '';
  for (let i = 0; i < 4; i++) {
    dataUrl = canvas.toDataURL('image/jpeg', q);
    if (dataUrl.length * 0.75 < TARGET_BYTES) break;
    q -= 0.15;
  }
  return { dataUrl, base64: dataUrl.split(',')[1] };
}

const EMPTY = {
  name: '', whatsapp: '', social: '', birthday: '', city: '', explore: [], experience: '', energy: '',
  reason: '', reaction: '', device: '', why: '', consent: false, event: '', company: '',
};

export default function OdcJoinPage() {
  const [f, setF] = useState(EMPTY);
  const [shot, setShot] = useState(null);       // { dataUrl, base64, name }
  const [shotBusy, setShotBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [copied, setCopied] = useState(false);
  const [events, setEvents] = useState([]);     // upcoming ODC dates from the CMS sheet
  const [eventsLoading, setEventsLoading] = useState(true);
  const fileRef = useRef(null);

  // Load upcoming ODC dates from the CMS sheet
  useEffect(() => {
    fetch(`${CSV_URL}&cb=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.text())
      .then(text => {
        const { data } = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (h) => h.trim().toLowerCase().replace(/^\uFEFF/, ''),
        });
        const list = data
          .filter(e => e.id && e.id.trim() && e.title && e.title.trim())
          .filter(e => isOdc(e) && !isPastEvent(e))
          .map(e => {
            const time = (e.time || '').trim();
            const where = (e.location_main || '').trim();
            return {
              id: e.id.trim(),
              title: e.title.trim(),
              date: dateLabel(e.date),
              when: `${dateLabel(e.date)}${time ? `, ${time}` : ''}${where ? ` at ${where}` : ''}`,
              priceNum: priceNumber(e.price),
              soldOut: parseStatus(e.status).code === 'SOLDOUT',
              sortDate: (parseEventDate(e.date) || new Date(8640000000000000)).getTime(),
            };
          })
          .sort((a, b) => a.sortDate - b.sortDate);

        setEvents(list);

        // Pre-select: ?event=ID from the link, or the only open date
        const open = list.filter(e => !e.soldOut);
        const wanted = (new URLSearchParams(window.location.search).get('event') || '').toLowerCase();
        const fromLink = open.find(e => e.id.toLowerCase() === wanted);
        if (fromLink) setF(prev => ({ ...prev, event: fromLink.id }));
        else if (open.length === 1) setF(prev => ({ ...prev, event: open[0].id }));
      })
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, []);

  const hasEvents = events.length > 0;
  const selected = events.find(e => e.id === f.event && !e.soldOut) || null;
  const ORDER = useMemo(() => [...BASE_ORDER, ...(hasEvents ? ['event'] : []), 'shot'], [hasEvents]);
  const TOTAL = ORDER.length;

  // Fee: the chosen date's price, otherwise the fallback AMOUNT
  const amount = selected ? (selected.priceNum || AMOUNT) : (hasEvents ? 0 : AMOUNT);
  const payFor = selected ? selected.title : EVENT_NAME;

  const today = new Date().toISOString().slice(0, 10);
  const digits = f.whatsapp.replace(/\D/g, '');
  const done = {
    name: f.name.trim().length > 0,
    whatsapp: digits.length >= 10 && digits.length <= 13,
    social: f.social.trim().length >= 3,
    birthday: /^\d{4}-\d{2}-\d{2}$/.test(f.birthday) && f.birthday <= today,
    city: f.city.trim().length > 0,
    explore: f.explore.length > 0,
    experience: !!f.experience,
    energy: !!f.energy,
    reason: !!f.reason,
    reaction: !!f.reaction,
    device: !!f.device,
    why: f.why.trim().length > 0,
    consent: f.consent,
    event: !!selected,
    shot: !!shot,
  };
  const answered = ORDER.filter(k => done[k]).length;
  const pct = status === 'success' ? 100 : Math.round((answered / TOTAL) * 100);

  const clearErr = (k) => setErrors(prev => (prev[k] ? { ...prev, [k]: undefined } : prev));
  const setField = (k, v) => { setF(prev => ({ ...prev, [k]: v })); clearErr(k); };
  const toggle = (k, v) => {
    setF(prev => ({ ...prev, [k]: prev[k].includes(v) ? prev[k].filter(x => x !== v) : [...prev[k], v] }));
    clearErr(k);
  };

  const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}${amount ? `&am=${amount}` : ''}&cu=INR&tn=${encodeURIComponent(payFor)}`;

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const onPick = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(p => ({ ...p, shot: 'Please choose an image. A screenshot works best.' }));
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setErrors(p => ({ ...p, shot: `That file is too big. Keep it under ${MAX_FILE_MB}MB.` }));
      return;
    }
    clearErr('shot');
    setShotBusy(true);
    try {
      const out = await compressImage(file);
      setShot({ ...out, name: file.name });
    } catch {
      setErrors(p => ({ ...p, shot: "Couldn't read that image. Try a PNG or JPG screenshot." }));
    } finally {
      setShotBusy(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (status === 'loading' || shotBusy || eventsLoading) return;

    const errs = {};
    ORDER.forEach(k => { if (!done[k]) errs[k] = MESSAGES[k]; });
    setErrors(errs);

    const first = ORDER.find(k => errs[k]);
    if (first) {
      const el = document.getElementById(`q-${first}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = el.querySelector('input[type=text], input[type=tel], input[type=date], textarea');
        if (input) input.focus({ preventScroll: true });
      }
      return;
    }

    setStatus('loading');
    const params = new URLSearchParams();
    params.set('name', f.name.trim());
    params.set('whatsapp', f.whatsapp.trim());
    params.set('social', f.social.trim());
    params.set('birthday', f.birthday);
    params.set('city', f.city.trim());
    params.set('explore', f.explore.join(', '));
    params.set('experience', f.experience);
    params.set('energy', f.energy);
    params.set('reason', f.reason);
    params.set('reaction', f.reaction);
    params.set('device', f.device);
    params.set('why', f.why.trim());
    params.set('consent', 'Yes');
    params.set('event', selected ? `${selected.title} · ${selected.date}` : EVENT_NAME);
    params.set('amount', amount ? String(amount) : '');
    params.set('screenshot', shot.base64);
    params.set('screenshotType', 'image/jpeg');
    params.set('source', selected ? selected.id : (new URLSearchParams(window.location.search).get('event') || 'odc-join'));
    params.set('company', f.company); // honeypot

    // Sent to our own server, which only says "ok" once Google confirms the row is saved
    try {
      const res = await fetch('/api/odc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: params.toString(),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || 'Could not save');
      setStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('ODC submit failed:', err);
      setStatus('error');
    }
  };

  const renderChoice = ({ key, num, title, note, options, multi, stack }) => (
    <fieldset className="q" id={`q-${key}`}>
      <legend><em>{num}</em>{title}{note && <span className="note">{note}</span>}</legend>
      <div className={`chips ${stack ? 'stack' : ''}`}>
        {options.map(opt => {
          const on = multi ? f[key].includes(opt) : f[key] === opt;
          return (
            <label className="chip" key={opt}>
              <input type={multi ? 'checkbox' : 'radio'} name={key} value={opt} checked={on}
                     onChange={() => (multi ? toggle(key, opt) : setField(key, opt))} />
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
      {errors[key] && <p className="err" role="alert">{errors[key]}</p>}
    </fieldset>
  );

  const textQ = ({ key, num, title, type = 'text', ...rest }) => (
    <div className="q" id={`q-${key}`}>
      <label className="ql" htmlFor={key}><em>{num}</em>{title}</label>
      <input id={key} type={type} value={f[key]} onChange={(e) => setField(key, e.target.value)} {...rest} />
      {errors[key] && <p className="err" role="alert">{errors[key]}</p>}
    </div>
  );

  const shotNum = hasEvents ? 14 : 13;

  return (
    <div className="tam">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Instrument+Sans:wght@400;500;600&display=swap');

        html,body{margin:0;padding:0;width:100%;max-width:100%}
        html{scroll-behavior:smooth;background:#000}
        .tam{
          min-width:0;
          --pink:#FF0065; --black:#000; --white:#fff; --grey:#9a9a9a;
          --display:"Big Shoulders Display","Arial Narrow",Impact,sans-serif;
          --body:"Instrument Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
          font-family:var(--body); background:var(--black); color:var(--white);
          line-height:1.55; font-size:17px; width:100%; max-width:100vw; min-height:100vh;
          overflow-x:hidden; overflow-x:clip;
        }
        .tam *{box-sizing:border-box}
        .tam a{color:inherit}
        .tam .brand{color:var(--pink)}
        .tam :focus-visible{outline:3px solid var(--white);outline-offset:3px}
        .tam .col{max-width:640px;margin:0 auto;padding:0 24px;width:100%}

        .tam .top{position:sticky;top:0;z-index:60;background:var(--black);padding-top:env(safe-area-inset-top,0px)}
        .tam .bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:14px;padding-bottom:14px;min-height:60px}
        .tam .barright{display:flex;align-items:center;gap:18px;font-size:15px;font-weight:500}
        .tam .barright a{text-decoration:none;opacity:.85;padding:8px 2px}
        .tam .barright a:hover{opacity:1;color:var(--pink)}
        .tam .count{font-weight:600;color:var(--pink);min-width:44px;text-align:right}
        .tam .prog{height:4px;background:#262626}
        .tam .prog i{display:block;height:100%;background:var(--pink);transition:width .35s cubic-bezier(.33,1,.68,1)}

        .tam .intro{padding-top:34px;padding-bottom:6px}
        .tam h1{font-family:var(--display);font-weight:900;font-size:clamp(42px,11vw,88px);line-height:.94;letter-spacing:-.5px;margin:0 0 16px}
        .tam .intro p{margin:0 0 10px;font-size:16px;color:#d6d6d6;max-width:52ch}

        .tam form{display:flex;flex-direction:column;gap:44px;padding-top:26px;padding-bottom:56px}
        .tam .sec{display:flex;flex-direction:column;gap:30px;border-top:1px solid #333;padding-top:24px}
        .tam .sech{font-family:var(--display);font-weight:900;font-size:30px;line-height:1;margin:0;text-transform:uppercase;letter-spacing:.02em}
        .tam .sech em{font-style:normal;color:var(--pink);margin-right:10px}

        .tam .q{border:0;margin:0;padding:0;min-width:0;display:block}
        .tam .q label.ql,.tam .q legend{display:block;padding:0;margin:0 0 14px;font-size:17.5px;font-weight:600;line-height:1.3}
        .tam .q em{font-style:normal;font-family:var(--display);font-weight:900;font-size:24px;color:var(--pink);margin-right:10px}
        .tam .note{display:block;margin:4px 0 0 34px;font-size:13.5px;font-weight:400;color:var(--grey)}
        .tam input[type=text],.tam input[type=tel],.tam input[type=date],.tam textarea{
          font:inherit;font-size:16px;padding:14px;border:2px solid var(--white);background:#0b0b0b;color:var(--white);width:100%;border-radius:0}
        .tam input[type=date]{color-scheme:dark;min-height:52px}
        .tam textarea{resize:vertical;min-height:120px}
        .tam input::placeholder,.tam textarea::placeholder{color:#777}
        .tam input:focus,.tam textarea:focus{outline:none;border-color:var(--pink);box-shadow:3px 3px 0 var(--pink)}
        .tam .err{margin:10px 0 0;color:var(--pink);font-weight:600;font-size:14px}

        .tam .chips{display:flex;flex-wrap:wrap;gap:10px}
        .tam .chips.stack{display:grid;grid-template-columns:1fr;gap:10px}
        .tam .chip{position:relative;cursor:pointer;display:inline-block}
        .tam .chips.stack .chip span{display:block}
        .tam .chip input{position:absolute;opacity:0;width:1px;height:1px;pointer-events:none}
        .tam .chip span{display:inline-block;padding:12px 16px;border:2px solid var(--white);font-weight:500;font-size:15.5px;
          line-height:1.3;min-height:46px;user-select:none;-webkit-user-select:none;transition:background .15s ease,border-color .15s ease}
        .tam .chip input:checked + span{background:var(--pink);border-color:var(--pink);color:var(--white);font-weight:600}
        .tam .chip input:focus-visible + span{outline:3px solid var(--white);outline-offset:3px}
        @media (hover:hover){ .tam .chip span:hover{border-color:var(--pink)} }

        /* Final check */
        .tam .terms{margin:0 0 18px;padding:18px 18px 18px 36px;border:2px solid #333;background:#0b0b0b}
        .tam .terms li{margin:0 0 10px;font-size:15px;color:#d6d6d6}
        .tam .terms li:last-child{margin-bottom:0}
        .tam .consent{display:flex;align-items:flex-start;gap:12px;cursor:pointer;font-size:15.5px;font-weight:500}
        .tam .consent input{width:24px;height:24px;flex:0 0 auto;margin:1px 0 0;accent-color:var(--pink)}
        .tam .consent a{color:var(--pink);font-weight:600;text-decoration:underline;text-underline-offset:3px}

        /* ODC date picker */
        .tam .evs{display:flex;flex-direction:column;gap:10px}
        .tam .ev{position:relative;cursor:pointer;display:block}
        .tam .ev input{position:absolute;opacity:0;width:1px;height:1px;pointer-events:none}
        .tam .evbox{display:flex;flex-direction:column;gap:3px;padding:14px 16px;border:2px solid var(--white);transition:background .15s ease,border-color .15s ease}
        .tam .evtop{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
        .tam .evtop b{font-weight:600;font-size:16.5px}
        .tam .evprice{font-family:var(--display);font-weight:900;font-size:26px;line-height:1;white-space:nowrap}
        .tam .evwhen{font-size:14.5px;color:#d6d6d6}
        .tam .evsold{align-self:flex-start;margin-top:4px;font-size:12px;font-weight:600;padding:1px 7px;border:2px solid currentColor}
        .tam .ev input:checked + .evbox{background:var(--pink);border-color:var(--pink)}
        .tam .ev input:checked + .evbox .evwhen{color:#fff}
        .tam .ev input:focus-visible + .evbox{outline:3px solid var(--white);outline-offset:3px}
        .tam .ev.off{cursor:not-allowed;opacity:.45}
        @media (hover:hover){ .tam .ev:not(.off) .evbox:hover{border-color:var(--pink)} }

        /* Payment */
        .tam .paycard{border:2px solid var(--pink);padding:18px}
        .tam .paycard .row{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap}
        .tam .paycard .lbl{font-size:12.5px;text-transform:uppercase;letter-spacing:.12em;color:var(--grey);font-weight:600}
        .tam .paycard .amt{font-family:var(--display);font-weight:900;font-size:40px;line-height:1}
        .tam .payfor{margin:6px 0 0;font-size:14px;color:#d6d6d6}
        .tam .warn{color:var(--pink);font-weight:600;font-size:14px;margin:8px 0 0}
        .tam .hintline{color:var(--grey);font-size:14px;margin:8px 0 0}
        .tam .qr{max-width:280px;margin:16px auto 0;background:#fff}
        .tam .qrhint{margin:12px 0 0;font-size:13.5px;color:var(--grey);text-align:center}
        .tam .upi{margin-top:14px;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap}
        .tam .upi code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:15px;background:#161616;padding:8px 10px;word-break:break-all}
        .tam .smallbtn{font:inherit;font-weight:600;font-size:14px;padding:9px 14px;background:transparent;color:var(--white);border:2px solid var(--white);cursor:pointer;border-radius:0}
        .tam .upibtn{display:block;text-align:center;margin-top:14px;padding:14px;font-weight:600;font-size:15.5px;text-decoration:none;
          background:var(--pink);border:2px solid var(--pink);color:var(--white)}
        @media (min-width:821px){ .tam .upibtn{display:none} }

        .tam .upload{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;
          border:2px dashed var(--white);padding:26px 16px;cursor:pointer;min-height:130px}
        .tam .upload strong{font-weight:600}
        .tam .upload span{font-size:13.5px;color:var(--grey)}
        .tam .upload.busy{opacity:.6;cursor:wait}
        @media (hover:hover){ .tam .upload:hover{border-color:var(--pink)} }
        .tam .fileinput{position:absolute;opacity:0;width:1px;height:1px;pointer-events:none}
        .tam .preview{display:flex;gap:14px;align-items:flex-start}
        .tam .preview img{width:96px;height:auto;max-height:170px;object-fit:cover;border:2px solid var(--white);background:#111}
        .tam .preview .meta{display:flex;flex-direction:column;gap:10px;align-items:flex-start;min-width:0}
        .tam .preview .fname{font-size:13.5px;color:var(--grey);word-break:break-all}

        .tam .submit{width:100%;font:inherit;font-weight:600;font-size:16.5px;padding:17px;min-height:56px;border:2px solid var(--pink);
          background:var(--pink);color:var(--white);cursor:pointer;border-radius:0}
        .tam .submit:disabled{opacity:.6;cursor:wait}
        .tam .formerr{margin:12px 0 0;color:var(--pink);font-weight:600;font-size:14.5px;text-align:center}
        .tam .tiny{margin:14px 0 0;font-size:13px;color:var(--grey);text-align:center}
        .tam .hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none}

        .tam .donewrap{padding-top:70px;padding-bottom:70px}
        .tam .done h2{font-family:var(--display);font-weight:900;font-size:clamp(40px,10vw,78px);line-height:.98;margin:0 0 16px}
        .tam .done p{margin:0 0 26px;font-size:17px;color:#d6d6d6;max-width:46ch}
        .tam .btns{display:flex;gap:12px;flex-wrap:nowrap}
        .tam .btn{flex:1 1 0;display:inline-block;padding:14px 16px;font-weight:600;font-size:15px;text-decoration:none;
          border:2px solid var(--white);text-align:center;white-space:nowrap;color:var(--white)}
        .tam .btn.pink{background:var(--pink);border-color:var(--pink)}

        .tam footer{border-top:1px solid #222;padding-top:28px;padding-bottom:calc(36px + env(safe-area-inset-bottom,0px))}
        .tam .fnav{display:flex;gap:20px;flex-wrap:wrap;font-size:15px;color:#bdbdbd}
        .tam .fnav a{text-decoration:none}
        .tam .fnav a:hover{color:var(--pink)}
        .tam footer small{display:block;margin-top:14px;color:#777;font-size:13px}

        @media (max-width:820px){
          .tam .col{padding:0 20px}
          .tam .intro{padding-top:26px}
          .tam .intro p{font-size:15.5px}
          .tam form{gap:36px;padding-top:22px}
          .tam .sech{font-size:26px}
          .tam .donewrap{padding-top:46px;padding-bottom:50px}
          .tam .btns{flex-direction:column}
        }
        @media (max-width:360px){ .tam .col{padding:0 16px} }
        @media (prefers-reduced-motion:reduce){ html{scroll-behavior:auto} .tam .prog i,.tam .chip span,.tam .evbox{transition:none} }
      `}} />

      <header className="top">
        <div className="col bar">
          <Link href="/" aria-label="3 AM Ideas home" style={{ display: 'flex', alignItems: 'center' }}>
            <Image src="/images/white_logo.png" alt="3 AM Ideas" width={130} height={32} priority style={{ height: 28, width: 'auto' }} />
          </Link>
          <div className="barright">
            <Link href="/event">← Events</Link>
            <span className="count" aria-live="polite">{status === 'success' ? 'Done' : `${answered}/${TOTAL}`}</span>
          </div>
        </div>
        <div className="prog" role="progressbar" aria-label="Form progress" aria-valuemin={0} aria-valuemax={TOTAL} aria-valuenow={answered}>
          <i style={{ width: `${pct}%` }} />
        </div>
      </header>

      <main>
        {status === 'success' ? (
          <div className="done donewrap">
            <div className="col">
              <h2>We&apos;ve got your registration.</h2>
              <p>
                {selected ? <>You picked <b>{selected.title}</b>, {selected.when}. </> : null}
                Registration is confirmed after payment verification. We&apos;ll confirm your spot on WhatsApp.
              </p>
              <div className="btns">
                <a className="btn pink" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Join WhatsApp</a>
                <Link className="btn" href="/event">See all events</Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <section className="intro">
              <div className="col">
                <h1>Join the <span className="brand">{EVENT_NAME}</span></h1>
                <p>A few quick questions, then payment. Takes about three minutes.</p>
              </div>
            </section>

            <div className="col">
              <form onSubmit={submit} noValidate>

                <div className="sec">
                  <h2 className="sech"><em>01</em>The basics</h2>
                  {textQ({ key: 'name', num: 1, title: 'Name?', autoComplete: 'name', maxLength: 80 })}
                  {textQ({ key: 'whatsapp', num: 2, title: 'WhatsApp number?', type: 'tel', autoComplete: 'tel', inputMode: 'tel', placeholder: '+91 00000 00000', maxLength: 20 })}
                  {textQ({ key: 'social', num: 3, title: 'Instagram or LinkedIn?', autoComplete: 'off', placeholder: 'Profile link or @handle', maxLength: 200 })}
                  {textQ({ key: 'birthday', num: 4, title: 'Birthday?', type: 'date', max: today })}
                  {textQ({ key: 'city', num: 5, title: 'Where are you based?', autoComplete: 'address-level2', placeholder: 'e.g. Koramangala, Bangalore', maxLength: 100 })}
                </div>

                <div className="sec">
                  <h2 className="sech"><em>02</em>Your creative side</h2>
                  {renderChoice({ key: 'explore', num: 6, title: 'What would you like to explore at ODC?', note: 'Select all that apply', options: EXPLORE, multi: true })}
                  {renderChoice({ key: 'experience', num: 7, title: 'Do you have filmmaking experience?', options: EXPERIENCE })}
                </div>

                <div className="sec">
                  <h2 className="sech"><em>03</em>Your energy</h2>
                  {renderChoice({ key: 'energy', num: 8, title: 'What’s your kind of energy?', options: ENERGY })}
                  {renderChoice({ key: 'reason', num: 9, title: 'What brings you to ODC?', options: REASONS, stack: true })}
                  {renderChoice({ key: 'reaction', num: 10, title: 'Your crew gives you a role you didn’t sign up for. What’s your reaction?', options: REACTIONS, stack: true })}
                  {renderChoice({ key: 'device', num: 11, title: 'ODC is a collaborative shoot. Would you be comfortable using your personal phone or camera if needed?', options: DEVICE, stack: true })}
                  <div className="q" id="q-why">
                    <label className="ql" htmlFor="why"><em>12</em>Why do you want to be part of ODC?
                      <span className="note">No right answers. Just tell us what brought you here.</span>
                    </label>
                    <textarea id="why" rows={4} value={f.why} maxLength={1500}
                              onChange={(e) => setField('why', e.target.value)} />
                    {errors.why && <p className="err" role="alert">{errors.why}</p>}
                  </div>
                </div>

                <div className="sec">
                  <h2 className="sech"><em>04</em>Final check</h2>
                  <fieldset className="q" id="q-consent">
                    <legend>Before joining, please understand:</legend>
                    <ul className="terms">
                      {TERMS.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                    <label className="consent">
                      <input type="checkbox" checked={f.consent} onChange={(e) => setField('consent', e.target.checked)} />
                      <span>
                        I have read and understood the above, and I agree to the ODC participation terms and
                        the <Link href="/terms" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</Link>.
                      </span>
                    </label>
                    {errors.consent && <p className="err" role="alert">{errors.consent}</p>}
                  </fieldset>
                </div>

                <div className="sec">
                  <h2 className="sech"><em>05</em>Payment</h2>

                  {eventsLoading && <p className="hintline">Loading ODC dates…</p>}

                  {!eventsLoading && hasEvents && (
                    <fieldset className="q" id="q-event">
                      <legend><em>13</em>Which ODC are you joining?</legend>
                      <div className="evs">
                        {events.map(ev => (
                          <label key={ev.id} className={`ev ${ev.soldOut ? 'off' : ''}`}>
                            <input type="radio" name="event" value={ev.id} checked={f.event === ev.id}
                                   disabled={ev.soldOut} onChange={() => setField('event', ev.id)} />
                            <span className="evbox">
                              <span className="evtop">
                                <b>{ev.title}</b>
                                {ev.priceNum > 0 && <span className="evprice">₹{ev.priceNum}</span>}
                              </span>
                              <span className="evwhen">{ev.when}</span>
                              {ev.soldOut && <span className="evsold">Sold out</span>}
                            </span>
                          </label>
                        ))}
                      </div>
                      {errors.event && <p className="err" role="alert">{errors.event}</p>}
                    </fieldset>
                  )}

                  <div className="paycard">
                    <div className="row">
                      <span className="lbl">Participation fee</span>
                      {amount > 0 && <span className="amt">₹{amount}</span>}
                    </div>
                    {selected && <p className="payfor">{selected.title} · {selected.date}</p>}
                    {hasEvents && !selected && <p className="hintline">Pick your ODC above to see the fee.</p>}
                    {!(amount > 0) && (!hasEvents || selected) && !eventsLoading && (
                      <p className="warn">Ticket price not set (add a price to the event in your sheet, or set AMOUNT in this file).</p>
                    )}
                    <div className="qr">
                      <Image src={QR_IMAGE} alt={`UPI QR code to pay ${PAYEE_NAME}`} width={1152} height={1600}
                             sizes="280px" style={{ width: '100%', height: 'auto', display: 'block' }} />
                    </div>
                    <p className="qrhint">Scan with any UPI app. On your phone? Use the button below, or screenshot the QR and open it from your UPI app&apos;s gallery.</p>
                    <div className="upi">
                      <code>{UPI_ID}</code>
                      <button type="button" className="smallbtn" onClick={copyUpi}>{copied ? 'Copied' : 'Copy'}</button>
                    </div>
                    <a className="upibtn" href={upiLink}>Pay{amount > 0 ? ` ₹${amount}` : ''} in your UPI app</a>
                  </div>

                  <div className="q" id="q-shot">
                    <label className="ql" htmlFor="shotfile"><em>{shotNum}</em>Upload payment screenshot</label>
                    <input id="shotfile" ref={fileRef} className="fileinput" type="file" accept="image/*" onChange={onPick} />
                    {!shot ? (
                      <label htmlFor="shotfile" className={`upload ${shotBusy ? 'busy' : ''}`}>
                        <strong>{shotBusy ? 'Preparing your image…' : 'Tap to choose a screenshot'}</strong>
                        <span>PNG or JPG. We shrink it so it uploads fast.</span>
                      </label>
                    ) : (
                      <div className="preview">
                        <img src={shot.dataUrl} alt="Your payment screenshot" />
                        <div className="meta">
                          <span className="fname">{shot.name}</span>
                          <button type="button" className="smallbtn" onClick={() => fileRef.current && fileRef.current.click()}>Change</button>
                          <button type="button" className="smallbtn" onClick={() => setShot(null)}>Remove</button>
                        </div>
                      </div>
                    )}
                    {errors.shot && <p className="err" role="alert">{errors.shot}</p>}
                  </div>
                </div>

                <input className="hp" type="text" name="company" value={f.company} tabIndex={-1} autoComplete="off"
                       aria-hidden="true" onChange={(e) => setF(prev => ({ ...prev, company: e.target.value }))} />

                <div>
                  <button className="submit" type="submit" disabled={status === 'loading' || shotBusy || eventsLoading}>
                    {status === 'loading' ? 'Sending…' : 'Submit registration'}
                  </button>
                  {status === 'error' && (
                    <p className="formerr" role="alert">
                      Your registration wasn&apos;t saved. Please try again. If it keeps failing, don&apos;t pay again:
                      message us on WhatsApp and we&apos;ll sort it out.
                    </p>
                  )}
                  <p className="tiny">Registration is confirmed after payment verification.</p>
                </div>
              </form>
            </div>
          </>
        )}
      </main>

      <footer>
        <div className="col">
          <div className="fnav">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
            <a href="mailto:wearemusawwir@gmail.com">Contact</a>
          </div>
          <small>© {new Date().getFullYear()} 3 AM Ideas, Bangalore</small>
        </div>
      </footer>
    </div>
  );
}