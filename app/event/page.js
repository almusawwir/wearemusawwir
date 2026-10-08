"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Papa from 'papaparse';
import { parseStatus } from '../lib/eventStyles';
import {
  parseEventDate, formatDate, isPastEvent, priceText,
  getFormatLabel, truncate, sortUpcoming, WHATSAPP_URL,
} from '../lib/eventHelpers';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";
const PAST_STEP = 8;

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [visibleGalleryCount, setVisibleGalleryCount] = useState(6);
  const [visiblePast, setVisiblePast] = useState(PAST_STEP);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const revealRefs = useRef([]);

  const setRef = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

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
  }, [isLoading, events, visibleGalleryCount]);

  // Same header behaviour as the homepage
  useEffect(() => {
    const DELTA = 12, TOP_ZONE = 90, BOTTOM_ZONE = 60;
    let ticking = false, lastY = window.scrollY, hidden = false;
    const setHidden = (v) => { if (v !== hidden) { hidden = v; setIsNavHidden(v); } };
    const compute = () => {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const y = Math.min(Math.max(0, window.scrollY), max);
      const diff = y - lastY;
      if (y <= TOP_ZONE) { setHidden(false); lastY = y; }
      else if (max - y > BOTTOM_ZONE && Math.abs(diff) >= DELTA) { setHidden(diff > 0); lastY = y; }
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(compute); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const upcoming = sortUpcoming(events.filter(e => !isPastEvent(e)));
  const past = events
    .filter(e => isPastEvent(e))
    .sort((a, b) => (parseEventDate(b.date) || 0) - (parseEventDate(a.date) || 0));

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

  const renderCard = (event, i, isPast) => {
    // Past events always get the "Happened" look, whatever their status says
    const s = isPast ? parseStatus('PAST') : parseStatus(event.status);
    const hasBadge = s.badgeType !== 'none' && s.badge;
    return (
      <Link key={event.id || i} href={`/event/${event.id.trim()}`}
            style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}
            className={`card t-${s.theme} ${s.faded ? 'faded' : ''} ${hasBadge ? 'hasbadge' : ''}`}>
        {s.lit && renderLights()}
        {renderBadge(s)}
        <div className="card-body">
          <span className="format">{getFormatLabel(event)}</span>
          <span className="name">{event.title}</span>
          {truncate(event.tagline || event.description) && (
            <span className="desc">{truncate(event.tagline || event.description)}</span>
          )}
          <div className="meta">
            <div>
              <span>Date</span>
              <b>{formatDate(event.date)}</b>
              {event.time && event.time.trim() && <small>{event.time.trim()}</small>}
            </div>
            <div><span>Price</span><b>{priceText(event)}</b></div>
          </div>
          <span className="cta">{isPast ? 'See event' : (event.button_text || s.cta)}</span>
        </div>
      </Link>
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
          padding-top:env(safe-area-inset-top,0px);transition:transform .3s cubic-bezier(.4,0,.2,1)}
        .tam .top.hidden{transform:translate3d(0,-100%,0)}
        .tam .bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:16px;padding-bottom:16px;min-height:64px}
        .tam .navlinks{display:flex;align-items:center;gap:20px;font-size:16px;font-weight:500;flex:0 0 auto}
        .tam .navlinks a{text-decoration:none;opacity:.85;padding:8px 2px;display:inline-block;white-space:nowrap}
        .tam .navlinks a:hover,.tam .navlinks a.on{opacity:1;color:var(--pink)}

        /* Hero */
        .tam .hero{padding-top:36px;padding-bottom:4px;text-align:center;display:flex;flex-direction:column;align-items:center}
        .tam .eyebrow{font-weight:500;color:var(--pink);font-size:14px;margin:0;letter-spacing:.06em;text-transform:uppercase}
        .tam h1{font-family:var(--display);font-weight:900;font-size:clamp(42px,11vw,140px);line-height:.92;letter-spacing:-.5px;margin:10px 0 12px}
        .tam .lede{max-width:50ch;font-size:16.5px;color:#222;margin:0 auto}

        /* Sections */
        .tam .sechead{display:flex;align-items:baseline;gap:12px;border-top:2px solid var(--black);padding-top:22px;margin-top:34px}
        .tam .h2{font-family:var(--display);font-weight:900;font-size:clamp(30px,5.5vw,56px);line-height:.95;margin:0}
        .tam .count{font-size:14px;color:var(--grey);font-weight:500}
        .tam .events{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding:22px 0 0;align-items:stretch}
        .tam .morewrap{display:flex;justify-content:center;margin-top:24px}

        @keyframes tamrise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}

        /* Cards */
        .tam .card{position:relative;display:flex;flex-direction:column;height:100%;text-decoration:none;
          border:2px solid var(--black);background:var(--white);color:var(--black);
          transition:transform .15s ease, box-shadow .15s ease;
          animation:tamrise .6s cubic-bezier(.16,1,.3,1) backwards}
        .tam .card-body{display:flex;flex-direction:column;flex:1;padding:20px;min-height:220px}
        .tam .card.hasbadge .card-body{padding-top:52px}
        .tam .format{font-size:13px;font-weight:600}
        .tam .name{font-family:var(--display);font-weight:900;font-size:34px;line-height:1.15;margin:8px 0 8px;word-break:break-word}
        .tam .desc{font-size:14.5px;opacity:.85;margin-bottom:auto}
        .tam .meta{display:flex;justify-content:space-between;gap:10px;margin:18px 0 14px;font-size:14px}
        .tam .meta div{display:flex;flex-direction:column;gap:2px}
        .tam .meta span{opacity:.65;font-size:12.5px}
        .tam .meta b{font-weight:600}
        .tam .meta small{font-size:12.5px;font-weight:500;opacity:.8}
        .tam .cta{display:block;text-align:center;padding:12px;font-weight:600;font-size:14.5px;border:2px solid currentColor;min-height:44px}

        /* Loading */
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
        .tam .badge .blink{width:9px;height:9px;border-radius:50%;background:var(--pink);animation:tamblink 1.1s steps(1) infinite;flex:0 0 auto}
        @keyframes tamblink{50%{opacity:0}}
        .tam .stamp{position:absolute;top:12px;right:12px;z-index:4;font-family:var(--display);font-weight:900;
          font-size:24px;line-height:1.2;color:var(--pink);background:var(--white);transform:rotate(6deg);
          border:3px solid var(--pink);padding:0 8px}

        /* Themes */
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
          .tam .faded:hover{opacity:.8;transform:none;box-shadow:none}
        }

        /* Empty */
        .tam .empty{border:2px dashed var(--black);padding:36px 24px;text-align:center;margin:22px 0 0}
        .tam .empty h3{font-family:var(--display);font-weight:900;font-size:clamp(26px,5vw,40px);line-height:1;margin:0 0 10px}
        .tam .empty p{margin:0 auto 18px;max-width:44ch;color:var(--grey)}

        /* Gallery */
        .tam .archive{border-top:2px solid var(--black);padding-top:44px;padding-bottom:44px;margin-top:44px}
        .tam .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:22px}
        .tam .shot{position:relative;aspect-ratio:1;overflow:hidden;border:2px solid var(--black);background:#eee}

        /* Buttons */
        .tam .btn{display:inline-block;padding:13px 24px;font-weight:600;font-size:15px;text-decoration:none;border:2px solid var(--black);
          text-align:center;background:var(--white);color:var(--black);cursor:pointer;font-family:inherit}
        .tam .btn.pink{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .btn.dark{background:var(--black);border-color:var(--black);color:var(--white)}
        .tam .btns{display:flex;gap:12px;flex-wrap:nowrap}
        .tam .btns .btn{flex:1 1 0;white-space:nowrap}
        @media (hover:hover){ .tam .btn:not(.pink):not(.dark):hover{background:var(--black);color:var(--white)} }

        /* Join */
        .tam .join{border-top:2px solid var(--black);padding-top:44px;padding-bottom:48px;display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}
        .tam .join p{margin:10px 0 0;max-width:48ch}

        /* Footer */
        .tam footer{background:var(--black);color:var(--white);padding:36px 0 calc(40px + env(safe-area-inset-bottom,0px))}
        .tam footer .fbar{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap}
        .tam footer .fline{margin:12px 0 0;max-width:40ch;color:#bdbdbd;font-size:15px}
        .tam footer nav{display:flex;gap:20px;flex-wrap:wrap;font-size:15px}
        .tam footer small{display:block;color:#8d8d8d;margin-top:18px;font-size:13px}

        @media (max-width:1024px){ .tam .name{font-size:28px} }

        @media (max-width:820px){
          .tam .wrap{padding:0 20px}
          .tam .bar{padding-top:14px;padding-bottom:14px;min-height:60px;gap:10px}
          .tam .navlinks{gap:16px;font-size:14.5px}
          .tam .hero{padding-top:26px}
          .tam .eyebrow{font-size:13px}
          .tam .lede{font-size:15px}
          .tam .sechead{margin-top:28px;padding-top:18px}
          .tam .events{grid-template-columns:repeat(2,1fr);gap:14px;padding-top:18px}
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
          .tam .morewrap .btn{width:100%}
          .tam .archive{padding-top:36px;padding-bottom:36px;margin-top:36px}
          .tam .grid{grid-template-columns:repeat(2,1fr);gap:10px}
          .tam .join{padding-top:36px;padding-bottom:40px;flex-direction:column;align-items:flex-start}
          .tam .btns{width:100%}
          .tam footer nav{gap:16px}
        }
        @media (max-width:380px){ .tam .navlinks{gap:12px;font-size:13.5px} }
        @media (max-width:360px){
          .tam .wrap{padding:0 16px}
          .tam .events{gap:10px}
          .tam .name{font-size:19px}
          .tam .card-body{padding:12px}
          .tam .card.hasbadge .card-body{padding-top:42px}
        }
        @media (prefers-reduced-motion:reduce){
          html{scroll-behavior:auto}
          .tam .reveal{opacity:1;transform:none;transition:none}
          .tam .card,.tam .skelcard,.tam .top{transition:none;animation:none}
          .tam .blink,.tam .lights i,.tam .tri path,.tam .dots i{animation:none}
          .tam .tri path{stroke-dashoffset:0}
        }
      `}} />

      <header className={`top ${isNavHidden ? 'hidden' : ''}`}>
        <div className="wrap bar">
          <Link href="/" aria-label="3 AM Ideas home" style={{ display: 'flex', alignItems: 'center' }}>
            <Image src="/images/white_logo.png" alt="3 AM Ideas" width={130} height={32} priority style={{ height: 28, width: 'auto' }} />
          </Link>
          <nav className="navlinks">
            <Link href="/about">About</Link>
            <Link href="/event" className="on">All events</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="wrap hero">
          <p className="eyebrow">The lineup</p>
          <h1>Every <span className="brand">3 AM</span> event</h1>
          <p className="lede">What&apos;s coming up, and everything we&apos;ve already made happen.</p>
        </section>

        <section className="wrap">
          <div className="sechead">
            <h2 className="h2">Coming up</h2>
            {!isLoading && upcoming.length > 0 && (
              <span className="count">{upcoming.length} {upcoming.length === 1 ? 'event' : 'events'}</span>
            )}
          </div>

          {isLoading ? (
            <div className="events" aria-busy="true" aria-label="Loading events">
              {Array.from({ length: 4 }).map((_, i) => (
                <div className="skelcard" key={i} style={{ animationDelay: `${i * 90}ms` }}>
                  <svg className="tri" viewBox="0 0 46 42" aria-hidden="true">
                    <path d="M23 3 L43 39 L3 39 Z" pathLength="100" style={{ animationDelay: `${i * 0.22}s` }} />
                  </svg>
                  <span className="dots" aria-hidden="true"><i></i><i></i><i></i></span>
                </div>
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="empty">
              <h3>Nothing booked right now</h3>
              <p>The next calendar drops on the 1st of the month. The WhatsApp community hears first.</p>
              <a className="btn dark" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Join WhatsApp</a>
            </div>
          ) : (
            <div className="events">{upcoming.map((e, i) => renderCard(e, i, false))}</div>
          )}

          {!isLoading && past.length > 0 && (
            <>
              <div className="sechead">
                <h2 className="h2">Already happened</h2>
                <span className="count">{past.length} {past.length === 1 ? 'event' : 'events'}</span>
              </div>
              <div className="events">{past.slice(0, visiblePast).map((e, i) => renderCard(e, i, true))}</div>
              {visiblePast < past.length && (
                <div className="morewrap">
                  <button className="btn" type="button" onClick={() => setVisiblePast(v => v + PAST_STEP)}>
                    Show more past events
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {galleryImages.length > 0 && (
          <section className="wrap archive">
            <h2 className="h2">This is what <span className="brand">3 AM</span> looks like.</h2>
            <div className="grid">
              {galleryImages.slice(0, visibleGalleryCount).map((filename, index) => (
                <div key={index} className="shot reveal" ref={setRef}>
                  <Image src={`/images/home/${filename}`} alt={`3 AM Ideas event photo ${index + 1}`} fill quality={80}
                         sizes="(max-width: 820px) 50vw, 33vw" style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
            {visibleGalleryCount < galleryImages.length && (
              <div className="morewrap">
                <button className="btn" type="button" onClick={() => setVisibleGalleryCount(v => v + 6)}>Load more photos</button>
              </div>
            )}
          </section>
        )}

        <section className="wrap join">
          <div>
            <h2 className="h2">Be there for the next one.</h2>
            <p>The full calendar drops on the 1st of every month. The WhatsApp community gets it before anyone else.</p>
          </div>
          <div className="btns">
            <a className="btn dark" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Join WhatsApp</a>
            <Link className="btn pink" href="/">Back to home</Link>
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
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
            <a href="mailto:wearemusawwir@gmail.com">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}