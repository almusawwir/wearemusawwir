"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Papa from 'papaparse';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";
const WHATSAPP_URL = "https://chat.whatsapp.com/B68V6Q62HZPHHsGMG0t4jP";
const TZ = "Asia/Kolkata";

/* The 4 slots, in display order. Every slot always shows:
   real event(s) if the sheet has them, otherwise a "Coming soon" dummy. */
const SLOTS = [
  { style: 'bcc',       label: 'Broken Camera Crew',  dummyName: 'BCC',              dummyDesc: 'One-day filmmaking chaos. Next edition drops soon.' },
  { style: 'odc',       label: 'One Day Crew',        dummyName: 'ODC',              dummyDesc: 'Teams, a challenge, a deadline. Next one drops soon.' },
  { style: 'premium',   label: 'Creative experience', dummyName: 'Something new',    dummyDesc: 'A deeper, hands-on session. Details drop soon.' },
  { style: 'community', label: '3 AM Community',      dummyName: 'Community meetup', dummyDesc: 'Free. Meet people, make something, grab lunch.' },
];

/* Optional: add a "format" column in the sheet (bcc / odc / premium / community) to control the slot directly. */
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

export default function App() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [month, setMonth] = useState('This month');
  const [clock, setClock] = useState(null);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const revealRefs = useRef([]);

  const setRef = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  // Fetch events (Google Sheet) + gallery images
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

  // Month heading + Bangalore clock
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

  // Hide header on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsNavVisible(y <= 50 || y < lastScrollY);
      setLastScrollY(y);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Build the card list: real events per slot, or one dummy if the slot is empty
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
        .tam :focus-visible{outline:3px solid var(--pink);outline-offset:3px}
        .tam .wrap{max-width:1180px;margin:0 auto;padding:0 24px}
        .tam .reveal{opacity:0;transform:translateY(24px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
        .tam .reveal.active{opacity:1;transform:none}

        /* Header */
        .tam .top{position:sticky;top:0;z-index:60;background:var(--black);color:var(--white);padding-top:env(safe-area-inset-top,0px);transition:transform .35s ease}
        .tam .top.hidden{transform:translateY(-100%)}
        .tam .bar{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:12px 0}
        .tam .navlinks{display:flex;align-items:center;gap:20px;font-size:15px;font-weight:500}
        .tam .navlinks a{text-decoration:none;opacity:.85}
        .tam .navlinks a:hover{opacity:1;color:var(--pink)}
        .tam .clock{font-size:13px;color:#bdbdbd;margin:0}
        .tam .clock b{color:var(--white);font-weight:600}

        /* Hero */
        .tam .hero{padding:44px 0 8px}
        .tam .tagline{font-weight:500;color:var(--pink);font-size:18px;margin:0}
        .tam h1{font-family:var(--display);font-weight:900;font-size:clamp(52px,12vw,160px);line-height:.88;letter-spacing:-.5px;margin:10px 0 14px}
        .tam .lede{max-width:56ch;font-size:19px;color:#222;margin:0}

        /* Event grid */
        .tam .events{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding:28px 0 72px}
        .tam .card{position:relative;display:flex;flex-direction:column;text-decoration:none;border:2px solid var(--black);background:var(--white);color:var(--black);transition:transform .15s ease, box-shadow .15s ease}
        .tam .card-img{position:relative;aspect-ratio:4/3;border-bottom:2px solid var(--black);background:#222;overflow:hidden}
        .tam .card-img img{object-fit:cover;width:100%;height:100%}
        .tam .card-body{display:flex;flex-direction:column;flex:1;padding:18px 20px 20px}
        .tam .format{font-size:13px;font-weight:600;line-height:1.3}
        .tam .name{font-family:var(--display);font-weight:900;font-size:38px;line-height:.95;margin:8px 0 6px;word-break:break-word}
        .tam .desc{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;font-size:15px;opacity:.85;margin-bottom:auto}
        .tam .meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:18px 0 14px;font-size:14px}
        .tam .meta span{display:block;opacity:.65}
        .tam .meta b{display:block;font-weight:600}
        .tam .meta .old{display:inline;text-decoration:line-through;opacity:.5;font-weight:400;margin-right:4px}
        .tam .status{font-size:13px;font-weight:600;margin-bottom:10px}
        .tam .cta{display:block;text-align:center;padding:10px 12px;font-weight:600;font-size:14px;border:2px solid currentColor}
        .tam .soon{position:absolute;top:10px;left:10px;z-index:2;font-size:12px;font-weight:600;padding:2px 8px;background:var(--white);color:var(--black);border:2px solid var(--black)}

        .tam .bcc{background:var(--black);color:var(--white)}
        .tam .bcc .card-img{border-color:var(--white)}
        .tam .bcc .cta{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .rec{position:absolute;top:10px;left:10px;z-index:2;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--white);background:rgba(0,0,0,.55);padding:3px 8px}
        .tam .rec i{width:9px;height:9px;border-radius:50%;background:var(--pink);animation:tamblink 1.2s steps(1) infinite}
        @keyframes tamblink{50%{opacity:0}}
        .tam .odc{background:var(--pink)}
        .tam .odc .cta{background:var(--black);color:var(--white);border-color:var(--black)}
        .tam .premium .cta{background:var(--pink);color:var(--white);border-color:var(--pink)}
        .tam .community{background:var(--pink-soft);border-style:dashed}
        .tam .free{position:absolute;top:10px;right:10px;z-index:2;font-family:var(--display);font-weight:900;font-size:24px;line-height:1.2;color:var(--pink);background:var(--white);transform:rotate(6deg);border:3px solid var(--pink);padding:0 8px}
        .tam .dummy .name{opacity:.9}
        .tam .soldout{opacity:.55}
        .tam .soldout .cta{background:transparent !important;color:inherit !important;border-color:currentColor !important}
        .tam .state{padding:40px 0 80px;font-size:18px;color:var(--grey)}

        @media (hover:hover){
          .tam .card:hover{transform:translate(-3px,-3px);box-shadow:6px 6px 0 var(--black)}
          .tam .bcc:hover{box-shadow:6px 6px 0 var(--pink)}
        }

        /* About */
        .tam .about{border-top:2px solid var(--black);padding:64px 0;display:grid;grid-template-columns:1fr 1.3fr;gap:48px}
        .tam .h2{font-family:var(--display);font-weight:900;font-size:clamp(38px,6vw,72px);line-height:.92;margin:0}
        .tam .about p{max-width:60ch;margin:0 0 14px}
        .tam .formats{list-style:none;margin:20px 0 0;padding:0;border-top:1px solid var(--black)}
        .tam .formats li{display:grid;grid-template-columns:200px 1fr;gap:12px;padding:12px 0;border-bottom:1px solid var(--black);font-size:16px}
        .tam .formats strong{font-weight:600}

        /* Gallery */
        .tam .proof{background:var(--black);color:var(--white);padding:64px 0}
        .tam .proof-head{margin-bottom:24px}
        .tam .strip{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 24px 8px;scrollbar-width:none}
        .tam .strip::-webkit-scrollbar{display:none}
        .tam .shot{position:relative;flex:0 0 auto;width:min(70vw,340px);aspect-ratio:4/5;scroll-snap-align:center;background:#1f1f1f;overflow:hidden}

        /* Join */
        .tam .join{padding:64px 0;display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}
        .tam .join p{margin:10px 0 0;max-width:48ch}
        .tam .btns{display:flex;gap:12px;flex-wrap:wrap}
        .tam .btn{display:inline-block;padding:14px 22px;font-weight:600;font-size:16px;text-decoration:none;border:2px solid var(--black);text-align:center}
        .tam .btn.pink{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .btn.wa{background:#25D366;border-color:#25D366;color:var(--black)}

        /* Footer */
        .tam footer{background:var(--black);color:var(--white);padding:32px 0 calc(32px + env(safe-area-inset-bottom,0px))}
        .tam footer .bar{flex-wrap:wrap;align-items:flex-start}
        .tam footer nav{display:flex;gap:20px;flex-wrap:wrap;font-size:15px}
        .tam footer small{display:block;color:#9a9a9a;margin-top:10px;font-size:13px}
        .tam .mcta{display:none}

        /* Tablet: still 4 in a row until it gets tight */
        @media (max-width:1024px){
          .tam .name{font-size:32px}
          .tam .card-body{padding:16px}
        }

        /* Mobile */
        @media (max-width:820px){
          .tam .wrap{padding:0 16px}
          .tam .clock{display:none}
          .tam .navlinks{gap:16px;font-size:14px}
          .tam .hero{padding:28px 0 4px}
          .tam .tagline{font-size:15px}
          .tam .lede{font-size:16px;line-height:1.5}

          .tam .events{grid-template-columns:repeat(2,1fr);gap:12px;padding:20px 0 48px}
          .tam .card-img{aspect-ratio:1/1}
          .tam .card-body{padding:12px 12px 14px}
          .tam .format{font-size:11px}
          .tam .name{font-size:24px;margin:6px 0 4px}
          .tam .desc{font-size:13px;line-height:1.4;-webkit-line-clamp:3}
          .tam .meta{grid-template-columns:1fr;gap:4px;margin:12px 0 10px;font-size:12.5px}
          .tam .meta div{display:flex;justify-content:space-between;gap:6px}
          .tam .meta span,.tam .meta b{display:inline}
          .tam .status{font-size:11.5px;margin-bottom:8px}
          .tam .cta{padding:9px 6px;font-size:13px}
          .tam .free{font-size:15px;top:7px;right:7px;padding:0 5px;border-width:2px}
          .tam .soon,.tam .rec{top:7px;left:7px;font-size:10.5px;padding:1px 6px}
          .tam .rec i{width:7px;height:7px}

          .tam .about{grid-template-columns:1fr;gap:18px;padding:44px 0}
          .tam .about p{font-size:16px}
          .tam .formats li{grid-template-columns:1fr;gap:2px;font-size:15px}
          .tam .proof{padding:44px 0}
          .tam .strip{padding:0 16px 8px}
          .tam .join{padding:44px 0 110px}
          .tam .btns{width:100%;flex-direction:column}
          .tam .btn{width:100%}
          .tam footer nav{gap:16px;margin-top:16px}

          .tam .mcta{display:block;position:fixed;left:16px;right:16px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:60;
            text-align:center;background:var(--pink);color:var(--white);font-weight:600;font-size:15px;padding:14px;text-decoration:none;border:2px solid var(--black);
            box-shadow:4px 4px 0 var(--black);transition:transform .3s ease, opacity .3s ease}
          .tam .mcta.off{transform:translateY(140%);opacity:0;pointer-events:none}
        }

        /* Very small phones */
        @media (max-width:360px){
          .tam .wrap{padding:0 12px}
          .tam .events{gap:10px}
          .tam .name{font-size:21px}
          .tam .card-body{padding:10px}
        }

        @media (prefers-reduced-motion:reduce){
          .tam .reveal{opacity:1;transform:none;transition:none}
          .tam .card,.tam .top,.tam .mcta{transition:none}
          .tam .rec i{animation:none}
        }
      `}} />

      {/* Header */}
      <header className={`top ${isNavVisible ? '' : 'hidden'}`}>
        <div className="wrap bar">
          <Link href="/" aria-label="3AM Ideas home" style={{ display: 'flex', alignItems: 'center' }}>
            <Image src="/images/white_logo.png" alt="3AM Ideas" width={120} height={30} priority style={{ height: 26, width: 'auto' }} />
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
        {/* Hero */}
        <section className="wrap hero">
          <p className="tagline">Some ideas are too good to sleep on.</p>
          <h1>{month} at 3 AM</h1>
          <p className="lede">A creative community in Bangalore. Strangers make films, run citywide hunts and chase the ideas they'd normally talk themselves out of. Pick one and come along.</p>
        </section>

        {/* Events: always 4 slots */}
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
                         className={`card ${slot.style} dummy`}>
                        {slot.style === 'community' ? <span className="free">Free</span> : <span className="soon">Coming soon</span>}
                        <div className="card-body" style={{ paddingTop: slot.style === 'community' ? undefined : 44 }}>
                          <span className="format">{slot.label}</span>
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
                  const isExternalImage = event.image_url && event.image_url.startsWith('http');
                  const hasOld = event.original_price && event.original_price.trim() !== '' && !isFree(event);
                  return (
                    <Link key={event.id || i} href={`/event/${event.id.trim()}`} className={`card ${slot.style} ${isSoldOut ? 'soldout' : ''}`}>
                      {slot.style === 'community' && <span className="free">Free</span>}
                      {event.image_url && (
                        <div className="card-img">
                          {slot.style === 'bcc' && <span className="rec"><i></i>REC</span>}
                          {isExternalImage ? (
                            <img src={event.image_url} alt="" loading="lazy" decoding="async" />
                          ) : (
                            <Image src={event.image_url} alt="" fill quality={75} sizes="(max-width: 820px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
                          )}
                        </div>
                      )}
                      <div className="card-body">
                        <span className="format">{slot.label}</span>
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

        {/* About + values */}
        <section id="about-section" className="wrap about reveal" ref={setRef}>
          <h2 className="h2">What is 3 AM?</h2>
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

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <section className="proof">
            <div className="wrap proof-head reveal" ref={setRef}>
              <h2 className="h2">Nights we remember</h2>
            </div>
            <div className="strip">
              {galleryImages.map((filename, index) => (
                <div key={index} className="shot">
                  <Image src={`/images/home/${filename}`} alt={`3AM Ideas event photo ${index + 1}`} fill quality={80}
                         sizes="(max-width: 820px) 70vw, 340px" style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Join */}
        <section className="wrap join reveal" ref={setRef}>
          <div>
            <h2 className="h2">Hear about the next one first</h2>
            <p>The full calendar drops on the 1st of every month. The WhatsApp community gets it before anyone else.</p>
          </div>
          <div className="btns">
            <a className="btn wa" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Join on WhatsApp</a>
            <Link className="btn pink" href="/event">See all events</Link>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap bar">
          <div>
            <Image src="/images/white_logo.png" alt="3AM Ideas" width={120} height={30} style={{ height: 24, width: 'auto' }} />
            <small>© {new Date().getFullYear()} 3AM Ideas, Bangalore</small>
          </div>
          <nav>
            <Link href="/about">About</Link>
            <Link href="/terms">Terms & Conditions</Link>
            <a href="mailto:wearemusawwir@gmail.com">Contact</a>
          </nav>
        </div>
      </footer>

      {/* Mobile sticky CTA */}
      <a href="#event" className={`mcta ${lastScrollY > 900 && !isNavVisible ? '' : 'off'}`}>See {month}'s events</a>
    </div>
  );
}