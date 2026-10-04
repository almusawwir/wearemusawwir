"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Papa from 'papaparse';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";
const WHATSAPP_URL = "https://chat.whatsapp.com/B68V6Q62HZPHHsGMG0t4jP";
const TZ = "Asia/Kolkata";

const SLOTS = [
  { style: 'bcc',       label: 'Broken Camera Crew',  dummyName: 'BCC',              dummyDesc: 'One-day filmmaking chaos. Next edition drops soon.' },
  { style: 'odc',       label: 'One Day Crew',        dummyName: 'ODC',              dummyDesc: 'Teams, a challenge, a deadline. Next one drops soon.' },
  { style: 'premium',   label: 'Creative experience', dummyName: 'Something new',    dummyDesc: 'A deeper, hands-on session. Details drop soon.' },
  { style: 'community', label: '3 AM Community',      dummyName: 'Community meetup', dummyDesc: 'Free. Meet people, make something, grab lunch.' },
];

function getStyle(event) {
  const f = (event.format || '').toLowerCase().trim();
  if (['bcc', 'odc', 'premium', 'community'].includes(f)) return f;
  const text = `${event.id} ${event.title}`.toLowerCase();
  if (text.includes('bcc') || text.includes('broken camera')) return 'bcc';
  if (text.includes('odc') || text.includes('one day crew')) return 'odc';
  if (isFree(event)) return 'community';
  return 'premium';
}
function isFree(event) {
  const p = (event.price || '').toString().trim().toLowerCase();
  return p === '0' || p === 'free';
}
function priceText(event) {
  if (isFree(event)) return 'Free';
  const p = (event.price || '').toString().trim();
  return p ? `₹${p}` : 'TBA';
}
function shortDesc(event) {
  return (event.tagline || event.description || '').trim();
}

/* Wraps every standalone "3 AM" in the brand pink. */
function Pink3AM({ text }) {
  const parts = text.split(/(3 AM)/g);
  return parts.map((part, i) =>
    part === '3 AM' ? <span key={i} className="brand">3 AM</span> : <React.Fragment key={i}>{part}</React.Fragment>
  );
}

const ABOUT_COPY = [
  "3 AM is a creative community for people who want to make, explore, experiment and meet people along the way.",
  "We bring strangers together through experiences built around filmmaking, music, writing, photography, art, conversations, games and whatever creative chaos we feel like creating next.",
  "You don't need to be a filmmaker. You don't need to be an artist. You don't even need to know what you're good at yet.",
  "You just need to be curious enough to show up.",
  "Some 3 AM experiences are free and open to everyone. Some are curated. Some are chaotic. Some are built around making something together. Some are simply about finding a bunch of people you didn't know you needed to meet.",
  "There isn't really one way to do 3 AM.",
  "That's kind of the point.",
];
const BCC_COPY = [
  "Broken Camera Crew, or BCC, is one of 3 AM's signature experiences.",
  "A bunch of people. A creative challenge. A limited amount of time. And a whole lot of figuring things out together.",
  "You don't need to arrive with a crew, a script or years of filmmaking experience. We bring people together, form teams and give everyone a reason to make something.",
  "Every BCC can be different.",
  "Different people. Different themes. Different locations. Different stories.",
  "Sometimes it's filmmaking. Sometimes it's a completely ridiculous theme. Sometimes it's a special edition built around a place, a story or a moment.",
  "The only consistent thing is that you show up with strangers and leave having made something together.",
  "Broken camera. Working imagination.",
];
const COMMUNITY_COPY = [
  "This is the easiest way to enter 3 AM.",
  "No ticket. No audition. No need to know anyone.",
  "Just come meet the people behind the community.",
  "We'll get together, talk, wander around, maybe do something creative, grab some food and see where the day takes us.",
  "It's not a networking event where everyone walks around asking, \"So... what do you do?\"",
  "It's just a bunch of people who are curious, creative or simply looking for something different on a Sunday.",
  "Come alone. Come with a friend. Leave with new people in your phone.",
  "The event is free.",
  "If you enjoy being part of it and want to help us keep creating more free community experiences, you can optionally contribute ₹99 or any amount you feel comfortable with. ₹0 is completely okay too.",
  "Whatever comes in goes back into helping more people discover 3 AM.",
  "Come meet the community. That's it. No pressure.",
];

export default function App() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [month, setMonth] = useState('This month');
  const [clock, setClock] = useState(null);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [showMobileCta, setShowMobileCta] = useState(false);
  const revealRefs = useRef([]);

  const setRef = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  useEffect(() => {
    fetch(CSV_URL)
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
    setMonth(new Intl.DateTimeFormat('en-IN', { month: 'long', timeZone: TZ }).format(new Date()));
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

  /* FIX 6: scroll handler is throttled to one computation per animation frame
     via requestAnimationFrame, and each piece of state is only set when its
     value actually flips — not on every pixel of scroll. This is the fix for
     the "hundreds of re-renders per second" issue. */
  useEffect(() => {
    let ticking = false;
    let prevY = window.scrollY;
    let navVisibleRef = true;
    let ctaVisibleRef = false;

    const compute = () => {
      const y = window.scrollY;

      const shouldShowNav = y <= 50 || y < prevY;
      if (shouldShowNav !== navVisibleRef) {
        navVisibleRef = shouldShowNav;
        setIsNavVisible(shouldShowNav);
      }

      const distanceFromBottom = document.documentElement.scrollHeight - (y + window.innerHeight);
      const nearBottom = distanceFromBottom < 420;
      const shouldShowCta = y > 900 && !shouldShowNav && !nearBottom;
      if (shouldShowCta !== ctaVisibleRef) {
        ctaVisibleRef = shouldShowCta;
        setShowMobileCta(shouldShowCta);
      }

      prevY = y;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(compute);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    compute();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cards = SLOTS.flatMap(slot => {
    const real = events.filter(e => getStyle(e) === slot.style);
    return real.length
      ? real.map(e => ({ type: 'real', slot, event: e }))
      : [{ type: 'dummy', slot }];
  });

  return (
    <div className="tam">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Instrument+Sans:wght@400;500;600&display=swap');
        .tam{
          --pink:#FF0065; --pink-soft:#FFE3EE; --black:#000; --white:#fff; --grey:#5c5c5c;
          --display:"Big Shoulders Display","Arial Narrow",Impact,sans-serif;
          --body:"Instrument Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
          font-family:var(--body); background:var(--white); color:var(--black);
          line-height:1.55; font-size:17px; overflow-x:hidden; min-height:100vh;
        }
        html{scroll-behavior:smooth}
        .tam *{box-sizing:border-box}
        .tam a{color:inherit}
        .tam .brand{color:var(--pink)}
        .tam :focus-visible{outline:3px solid var(--pink);outline-offset:3px}
        .tam .wrap{max-width:1180px;margin:0 auto;padding:0 24px}
        .tam .reveal{opacity:0;transform:translateY(24px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
        .tam .reveal.active{opacity:1;transform:none}

        /* Header */
        .tam .top{position:sticky;top:0;z-index:60;background:var(--black);color:var(--white);padding-top:env(safe-area-inset-top,0px);transition:transform .35s ease}
        .tam .top.hidden{transform:translateY(-100%)}
        .tam .bar{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px 0;min-height:64px}
        .tam .navlinks{display:flex;align-items:center;gap:22px;font-size:16px;font-weight:500}
        .tam .navlinks a{text-decoration:none;opacity:.85;padding:8px 2px;display:inline-block}
        .tam .navlinks a:hover{opacity:1;color:var(--pink)}
        .tam .clock{font-size:13px;color:#bdbdbd;margin:0}
        .tam .clock b{color:var(--white);font-weight:600}

        /* Hero — FIX 4: no logo here, nav already has it */
        .tam .hero{padding:40px 0 8px;text-align:left}
        .tam .tagline{font-weight:500;color:var(--pink);font-size:16px;margin:0}
        .tam h1{font-family:var(--display);font-weight:900;font-size:clamp(44px,11vw,150px);line-height:.9;letter-spacing:-.5px;margin:10px 0 18px}
        .tam .lede{max-width:56ch;font-size:17px;color:#222;margin:0}

        /* Event grid */
        .tam .events{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding:28px 0 72px}
        .tam .card{position:relative;display:flex;flex-direction:column;text-decoration:none;border:2px solid var(--black);background:var(--white);color:var(--black);transition:transform .15s ease, box-shadow .15s ease}
        .tam .card-body{display:flex;flex-direction:column;flex:1;padding:20px;min-height:220px}
        .tam .format{font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px}
        .tam .dot{width:8px;height:8px;border-radius:50%;background:var(--pink);animation:tampulse 1.2s infinite}
        @keyframes tampulse{50%{opacity:.25}}
        /* FIX 5: line-height was .95 (too tight for 2-line titles), now 1.15 */
        .tam .name{font-family:var(--display);font-weight:900;font-size:36px;line-height:1.15;margin:8px 0 8px;word-break:break-word}
        .tam .desc{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;font-size:14.5px;opacity:.85;margin-bottom:auto}
        .tam .meta{display:flex;justify-content:space-between;gap:10px;margin:18px 0 14px;font-size:14px}
        .tam .meta div{display:flex;flex-direction:column;gap:2px}
        .tam .meta span{opacity:.65;font-size:12.5px}
        .tam .meta b{font-weight:600}
        .tam .meta .old{display:inline;text-decoration:line-through;opacity:.5;font-weight:400;margin-right:4px}
        .tam .status{font-size:13px;font-weight:600;margin-bottom:10px}
        .tam .cta{display:block;text-align:center;padding:12px;font-weight:600;font-size:14.5px;border:2px solid currentColor;min-height:44px}
        .tam .soon{position:absolute;top:12px;left:12px;font-size:12px;font-weight:600;padding:3px 9px;background:var(--white);color:var(--black);border:2px solid var(--black)}

        .tam .bcc{background:var(--black);color:var(--white)}
        .tam .bcc .cta{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .odc{background:var(--pink)}
        .tam .odc .cta{background:var(--black);color:var(--white);border-color:var(--black)}
        .tam .premium .cta{background:var(--pink);color:var(--white);border-color:var(--pink)}
        .tam .community{background:var(--pink-soft);border-style:dashed}
        .tam .free{position:absolute;top:12px;right:12px;font-family:var(--display);font-weight:900;font-size:24px;line-height:1.2;color:var(--pink);background:var(--white);transform:rotate(6deg);border:3px solid var(--pink);padding:0 8px}
        .tam .soldout{opacity:.55}
        .tam .soldout .cta{background:transparent !important;color:inherit !important;border-color:currentColor !important}
        .tam .state{padding:40px 0 80px;font-size:17px;color:var(--grey)}

        @media (hover:hover){
          .tam .card:hover{transform:translate(-3px,-3px);box-shadow:6px 6px 0 var(--black)}
          .tam .bcc:hover{box-shadow:6px 6px 0 var(--pink)}
        }

        /* About */
        .tam .about{border-top:2px solid var(--black);padding:60px 0;display:grid;grid-template-columns:1fr 1.3fr;gap:48px}
        .tam .h2{font-family:var(--display);font-weight:900;font-size:clamp(34px,6vw,72px);line-height:.92;margin:0}
        .tam .about p{max-width:60ch;margin:0 0 14px;font-size:16px}
        .tam .formats{list-style:none;margin:20px 0 0;padding:0;border-top:1px solid var(--black)}
        .tam .formats li{display:grid;grid-template-columns:200px 1fr;gap:12px;padding:12px 0;border-bottom:1px solid var(--black);font-size:16px}
        .tam .formats strong{font-weight:600}

        /* Learn more accordion — FIX 2: the question text + "?" live in one
           span, the "+" in a second span, so space-between only ever sees
           two flex children instead of treating loose text as its own item. */
        .tam .learn{border-top:2px solid var(--black);padding:56px 0}
        .tam .acc{border-bottom:1px solid var(--black)}
        .tam .acc:first-of-type{border-top:1px solid var(--black)}
        .tam .acc summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:20px 4px;font-family:var(--display);font-weight:900;font-size:24px}
        .tam .acc summary::-webkit-details-marker{display:none}
        .tam .acc summary .plus{flex:0 0 auto;font-size:28px;font-weight:400;transition:transform .25s ease}
        .tam .acc[open] summary .plus{transform:rotate(45deg)}
        .tam .acc-body{padding:0 4px 24px;font-size:16px;max-width:68ch}
        .tam .acc-body p{margin:0 0 14px}

        /* Gallery */
        .tam .proof{background:var(--black);color:var(--white);padding:56px 0}
        .tam .proof-head{margin-bottom:24px}
        .tam .strip{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 24px 8px;scrollbar-width:none}
        .tam .strip::-webkit-scrollbar{display:none}
        .tam .shot{position:relative;flex:0 0 auto;width:min(70vw,340px);aspect-ratio:4/5;scroll-snap-align:center;background:#1f1f1f;overflow:hidden}

        /* Join */
        .tam .join{padding:56px 0;display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}
        .tam .join p{margin:10px 0 0;max-width:48ch}
        .tam .btns{display:flex;gap:12px;flex-wrap:nowrap}
        .tam .btn{flex:1 1 0;display:inline-block;padding:14px 16px;font-weight:600;font-size:15px;text-decoration:none;border:2px solid var(--black);text-align:center;white-space:nowrap}
        .tam .btn.pink{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .btn.wa{background:var(--black);border-color:var(--black);color:var(--white)}

        /* Footer — FIX 3: extra bottom padding so the sticky mobile CTA
           never sits on top of the footer links */
        .tam footer{background:var(--black);color:var(--white);padding:32px 0 calc(90px + env(safe-area-inset-bottom,0px))}
        .tam footer .bar{flex-wrap:wrap;align-items:flex-start;min-height:auto}
        .tam footer nav{display:flex;gap:20px;flex-wrap:wrap;font-size:15px}
        .tam footer small{display:block;color:#9a9a9a;margin-top:10px;font-size:13px}
        .tam .mcta{display:none}

        @media (max-width:1024px){ .tam .name{font-size:30px} }

        /* Mobile */
        @media (max-width:820px){
          .tam .wrap{padding:0 18px}
          .tam .clock{display:none}
          .tam .bar{padding:14px 0;min-height:60px}
          .tam .navlinks{gap:18px;font-size:15px}

          .tam .hero{padding:28px 0 4px}
          .tam .tagline{font-size:14.5px}
          .tam .lede{font-size:15.5px;line-height:1.55}

          .tam .events{grid-template-columns:repeat(2,1fr);gap:14px;padding:22px 0 52px}
          /* FIX 1: padding-top clears the absolute "Coming soon"/"Free" badge
             so it never sits on top of the format label text below it */
          .tam .card-body{padding:16px;padding-top:40px;min-height:200px}
          .tam .format{font-size:12px}
          .tam .name{font-size:22px;margin:8px 0 6px}
          .tam .desc{font-size:13px;line-height:1.45;-webkit-line-clamp:4}
          .tam .meta{margin:16px 0 12px;font-size:12.5px}
          .tam .meta span{font-size:11px}
          .tam .status{font-size:12px;margin-bottom:10px}
          .tam .cta{padding:11px;font-size:13.5px}
          .tam .free{font-size:16px;top:10px;right:10px;padding:0 6px}
          .tam .soon{top:10px;left:10px;font-size:11px;padding:2px 8px}

          .tam .about{grid-template-columns:1fr;gap:20px;padding:44px 0}
          .tam .about p{font-size:15.5px}
          .tam .formats li{grid-template-columns:1fr;gap:3px;font-size:15px;padding:14px 0}

          .tam .learn{padding:44px 0}
          .tam .acc summary{font-size:19px;padding:18px 2px}
          .tam .acc-body{font-size:15px;padding:0 2px 20px}

          .tam .proof{padding:44px 0}
          .tam .strip{padding:0 18px 8px}

          .tam .join{padding:44px 0 112px;flex-direction:column;align-items:flex-start}
          .tam .btns{width:100%}
          .tam .btn{padding:14px 10px;font-size:14px}

          .tam footer nav{gap:16px;margin-top:16px}

          .tam .mcta{display:block;position:fixed;left:18px;right:18px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:60;
            text-align:center;background:var(--pink);color:var(--white);font-weight:600;font-size:15px;padding:15px;text-decoration:none;border:2px solid var(--black);
            box-shadow:4px 4px 0 var(--black);transition:transform .3s ease, opacity .3s ease}
          .tam .mcta.off{transform:translateY(140%);opacity:0;pointer-events:none}
        }

        @media (max-width:360px){
          .tam .wrap{padding:0 14px}
          .tam .events{gap:10px}
          .tam .name{font-size:19px}
          .tam .card-body{padding:12px;padding-top:36px}
        }

        @media (prefers-reduced-motion:reduce){
          .tam .reveal{opacity:1;transform:none;transition:none}
          .tam .card,.tam .top,.tam .mcta{transition:none}
          .tam .dot{animation:none}
        }
      `}} />

      <header className={`top ${isNavVisible ? '' : 'hidden'}`}>
        <div className="wrap bar">
          <Link href="/" aria-label="3 AM Ideas home" style={{ display: 'flex', alignItems: 'center' }}>
            <Image src="/images/white_logo.png" alt="3 AM Ideas" width={130} height={32} priority style={{ height: 30, width: 'auto' }} />
          </Link>
          {clock && (
            <p className="clock">
              {clock.isThree
                ? <>It's <b>3 AM</b> in Bangalore. Good time for an idea.</>
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
        {/* FIX 4: logo removed from here — it's already in the sticky nav above */}
        <section className="wrap hero">
          <p className="tagline">Some ideas are too good to sleep on.</p>
          <h1>{month} at <span className="brand">3 AM</span></h1>
          <p className="lede">A creative community in Bangalore. Strangers make films, run citywide hunts and chase the ideas they'd normally talk themselves out of. Pick one and come along.</p>
        </section>

        <section id="event" aria-label="Upcoming events">
          <div className="wrap">
            {isLoading ? (
              <p className="state">Loading this month's events…</p>
            ) : (
              <div className="events">
                {cards.map((c, i) => {
                  const { slot } = c;

                  if (c.type === 'dummy') {
                    return (
                      <a key={`dummy-${slot.style}`} href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                         className={`card ${slot.style}`}>
                        {slot.style === 'community' ? <span className="free">Free</span> : <span className="soon">Coming soon</span>}
                        <div className="card-body">
                          <span className="format">{slot.style === 'bcc' && <span className="dot"></span>}{slot.label}</span>
                          <span className="name">{slot.dummyName}</span>
                          <span className="desc">{slot.dummyDesc}</span>
                          <div className="meta">
                            <div><span>Date</span><b>Soon</b></div>
                            <div><span>Price</span><b>{slot.style === 'community' ? 'Free' : 'TBA'}</b></div>
                          </div>
                          <span className="cta">Get notified</span>
                        </div>
                      </a>
                    );
                  }

                  const event = c.event;
                  const isSoldOut = event.status && /sold|closed/i.test(event.status);
                  const hasOld = event.original_price && event.original_price.trim() !== '' && !isFree(event);
                  return (
                    <Link key={event.id || i} href={`/event/${event.id.trim()}`} className={`card ${slot.style} ${isSoldOut ? 'soldout' : ''}`}>
                      {slot.style === 'community' && <span className="free">Free</span>}
                      <div className="card-body">
                        <span className="format">{slot.style === 'bcc' && <span className="dot"></span>}{slot.label}</span>
                        <span className="name">{event.title}</span>
                        {shortDesc(event) && <span className="desc">{shortDesc(event)}</span>}
                        <div className="meta">
                          <div><span>Date</span><b>{event.date || 'TBA'}</b></div>
                          <div><span>Price</span><b>{hasOld && <span className="old">₹{event.original_price}</span>}{priceText(event)}</b></div>
                        </div>
                        {event.status && <span className="status">{event.status}</span>}
                        <span className="cta">{isSoldOut ? 'Sold out' : (event.button_text || 'View event')}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section id="about-section" className="wrap about reveal" ref={setRef}>
          <h2 className="h2">What is <span className="brand">3 AM</span>?</h2>
          <div id="values">
            <p>Every event starts as an idea that sounds ridiculous at 3am. Instead of dropping it, we make it happen. Small, vibe-checked rooms where it's safe to be loud, weird and fully yourself.</p>
            <p>Not networking. Not workshops. You come for the activity and leave with people you actually keep.</p>
            <ul className="formats">
              <li><strong>3 AM Community</strong><span>Free meetups. The easiest way in.</span></li>
              <li><strong>One Day Crew</strong><span>Teams, a challenge, a deadline. You run it.</span></li>
              <li><strong>Broken Camera Crew</strong><span>Our signature one-day filmmaking chaos.</span></li>
              <li><strong>Creative experiences</strong><span>Deeper, hands-on sessions.</span></li>
            </ul>
          </div>
        </section>

        {/* FIX 2: each summary wraps its question text + "?" in one span,
            and the "+" in its own span, so space-between has exactly two
            children instead of splitting on every loose text node */}
        <section className="wrap learn reveal" ref={setRef}>
          <details className="acc">
            <summary>
              <span>What is <span className="brand">3 AM</span>?</span>
              <span className="plus">+</span>
            </summary>
            <div className="acc-body">{ABOUT_COPY.map((p, i) => <p key={i}><Pink3AM text={p} /></p>)}</div>
          </details>
          <details className="acc">
            <summary>
              <span>What is Broken Camera Crew?</span>
              <span className="plus">+</span>
            </summary>
            <div className="acc-body">{BCC_COPY.map((p, i) => <p key={i}><Pink3AM text={p} /></p>)}</div>
          </details>
          <details className="acc">
            <summary>
              <span>What is the <span className="brand">3 AM</span> Community Event?</span>
              <span className="plus">+</span>
            </summary>
            <div className="acc-body">{COMMUNITY_COPY.map((p, i) => <p key={i}><Pink3AM text={p} /></p>)}</div>
          </details>
        </section>

        {galleryImages.length > 0 && (
          <section className="proof">
            <div className="wrap proof-head reveal" ref={setRef}>
              <h2 className="h2">Nights we remember</h2>
            </div>
            <div className="strip">
              {galleryImages.map((filename, index) => (
                <div key={index} className="shot">
                  <Image src={`/images/home/${filename}`} alt={`3 AM Ideas event photo ${index + 1}`} fill quality={80}
                         sizes="(max-width: 820px) 70vw, 340px" style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="wrap join reveal" ref={setRef}>
          <div>
            <h2 className="h2">Hear about the next one first</h2>
            <p>The full calendar drops on the 1st of every month. The WhatsApp community gets it before anyone else.</p>
          </div>
          <div className="btns">
            <a className="btn wa" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Join WhatsApp</a>
            <Link className="btn pink" href="/event">See all events</Link>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap bar">
          <div>
            <Image src="/images/white_logo.png" alt="3 AM Ideas" width={120} height={30} style={{ height: 24, width: 'auto' }} />
            <small>© {new Date().getFullYear()} 3 AM Ideas, Bangalore</small>
          </div>
          <nav>
            <Link href="/about">About</Link>
            <Link href="/terms">Terms & Conditions</Link>
            <a href="mailto:wearemusawwir@gmail.com">Contact</a>
          </nav>
        </div>
      </footer>

      <a href="#event" className={`mcta ${showMobileCta ? '' : 'off'}`}>See {month}'s events</a>
    </div>
  );
}
