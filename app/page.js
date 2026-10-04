"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Papa from 'papaparse';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";
const WHATSAPP_URL = "https://chat.whatsapp.com/B68V6Q62HZPHHsGMG0t4jP";
const TZ = "Asia/Kolkata";

/* Picks a card look from the sheet row.
   Optional: add a "format" column in the sheet (bcc / odc / community / premium) to control it directly. */
function getStyle(event) {
  const f = (event.format || '').toLowerCase().trim();
  if (['bcc', 'odc', 'community', 'premium'].includes(f)) return f;
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
function formatLabel(style) {
  return { bcc: 'Broken Camera Crew', odc: 'One Day Crew', community: '3 AM Community', premium: 'Creative experience' }[style];
}
function priceText(event) {
  if (isFree(event)) return 'Free';
  const p = (event.price || '').toString().trim();
  return p ? `₹${p}` : 'TBA';
}
function shortDesc(event) {
  const d = (event.tagline || event.description || '').trim();
  return d.length > 110 ? d.slice(0, 107).trimEnd() + '…' : d;
}

export default function App() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [month, setMonth] = useState('This month');
  const [clock, setClock] = useState(null);

  // Navigation scroll state
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const revealRefs = useRef([]);
  const router = useRouter();

  const setRef = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const handleCardClick = (id) => {
    if (id) router.push(`/event/${id.trim()}`);
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
            const validEvents = results.data.filter(e =>
              e.id && e.id.trim() !== '' && e.title && e.title.trim() !== ''
            );
            setEvents(validEvents);
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

  // Month heading + Bangalore clock (client-only to avoid hydration mismatch)
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
        .tam .wrap{max-width:1180px;margin:0 auto;padding:0 20px}

        .tam .reveal{opacity:0;transform:translateY(24px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
        .tam .reveal.active{opacity:1;transform:none}

        /* Header */
        .tam .top{position:sticky;top:0;z-index:60;background:var(--black);color:var(--white);
          padding-top:env(safe-area-inset-top,0px);transition:transform .35s ease}
        .tam .top.hidden{transform:translateY(-100%)}
        .tam .bar{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:12px 0}
        .tam .navlinks{display:flex;align-items:center;gap:22px;font-size:15px;font-weight:500}
        .tam .navlinks a{text-decoration:none;opacity:.8}
        .tam .navlinks a:hover{opacity:1;color:var(--pink)}
        .tam .clock{font-size:13px;color:#bdbdbd}
        .tam .clock b{color:var(--white);font-weight:600}

        /* Hero */
        .tam .hero{padding:44px 0 20px}
        .tam .tagline{font-weight:500;color:var(--pink);font-size:18px;margin:0}
        .tam h1{font-family:var(--display);font-weight:900;font-size:clamp(60px,13vw,168px);line-height:.86;letter-spacing:-1px;margin:10px 0 16px}
        .tam .lede{max-width:56ch;font-size:19px;color:#222;margin:0}

        /* Events */
        .tam .events{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:20px;padding:24px 0 72px}
        .tam .card{position:relative;display:flex;flex-direction:column;text-align:left;cursor:pointer;
          border:2px solid var(--black);background:var(--white);color:var(--black);font:inherit;padding:0;
          transition:transform .15s ease, box-shadow .15s ease}
        .tam .card:hover{transform:translate(-3px,-3px);box-shadow:6px 6px 0 var(--black)}
        .tam .card-img{position:relative;aspect-ratio:16/10;border-bottom:2px solid var(--black);background:#222;overflow:hidden}
        .tam .card-img img{object-fit:cover;width:100%;height:100%}
        .tam .card-body{display:flex;flex-direction:column;flex:1;padding:20px 22px 22px}
        .tam .format{font-size:14px;font-weight:600}
        .tam .name{font-family:var(--display);font-weight:900;font-size:42px;line-height:.95;margin:10px 0 8px}
        .tam .desc{margin:6px 0 auto;font-size:15.5px;opacity:.85}
        .tam .meta{display:grid;grid-template-columns:1fr 1fr;gap:2px 12px;margin:20px 0 16px;font-size:15px}
        .tam .meta dt{opacity:.65}
        .tam .meta dd{margin:0;font-weight:600}
        .tam .meta .old{text-decoration:line-through;opacity:.5;font-weight:400;margin-right:6px}
        .tam .status{font-size:14px;font-weight:600;margin-bottom:12px}
        .tam .cta{display:inline-block;align-self:flex-start;padding:11px 18px;font-weight:600;font-size:15px;border:2px solid currentColor}

        .tam .bcc{background:var(--black);color:var(--white)}
        .tam .bcc .card-img{border-color:var(--white)}
        .tam .bcc .cta{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .bcc:hover{box-shadow:6px 6px 0 var(--pink)}
        .tam .rec{position:absolute;top:12px;left:12px;z-index:2;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--white);background:rgba(0,0,0,.55);padding:3px 8px}
        .tam .rec i{width:9px;height:9px;border-radius:50%;background:var(--pink);animation:tamblink 1.2s steps(1) infinite}
        @keyframes tamblink{50%{opacity:0}}
        .tam .odc{background:var(--pink)}
        .tam .odc .cta{background:var(--black);color:var(--white);border-color:var(--black)}
        .tam .premium .cta{background:var(--pink);color:var(--white);border-color:var(--pink)}
        .tam .community{background:var(--pink-soft);border-style:dashed}
        .tam .free{position:absolute;top:12px;right:12px;z-index:2;font-family:var(--display);font-weight:900;font-size:26px;color:var(--pink);background:var(--white);transform:rotate(6deg);border:3px solid var(--pink);padding:0 10px}
        .tam .soldout{opacity:.55}
        .tam .soldout .cta{background:transparent !important;color:inherit !important;border-color:currentColor !important}

        .tam .state{padding:40px 0 80px;font-size:18px;color:var(--grey)}

        /* About */
        .tam .about{border-top:2px solid var(--black);padding:64px 0;display:grid;grid-template-columns:1fr 1.3fr;gap:48px}
        .tam .h2{font-family:var(--display);font-weight:900;font-size:clamp(40px,6vw,72px);line-height:.9;margin:0}
        .tam .about p{max-width:60ch;margin:0 0 14px}
        .tam .formats{list-style:none;margin:20px 0 0;padding:0;border-top:1px solid var(--black)}
        .tam .formats li{display:grid;grid-template-columns:200px 1fr;gap:12px;padding:12px 0;border-bottom:1px solid var(--black);font-size:16px}
        .tam .formats strong{font-weight:600}

        /* Gallery */
        .tam .proof{background:var(--black);color:var(--white);padding:64px 0}
        .tam .proof-head{display:flex;justify-content:space-between;align-items:end;gap:24px;flex-wrap:wrap;margin-bottom:28px}
        .tam .strip{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 20px 8px;scrollbar-width:none}
        .tam .strip::-webkit-scrollbar{display:none}
        .tam .shot{position:relative;flex:0 0 auto;width:min(72vw,340px);aspect-ratio:4/5;scroll-snap-align:center;background:#1f1f1f;overflow:hidden}

        /* Join */
        .tam .join{padding:64px 0;display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}
        .tam .join p{margin:8px 0 0;max-width:48ch}
        .tam .btns{display:flex;gap:12px;flex-wrap:wrap}
        .tam .btn{display:inline-block;padding:14px 22px;font-weight:600;font-size:16px;text-decoration:none;border:2px solid var(--black)}
        .tam .btn.pink{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .btn.wa{background:#25D366;border-color:#25D366;color:var(--black)}

        /* Footer */
        .tam footer{background:var(--black);color:var(--white);padding:32px 0 calc(32px + env(safe-area-inset-bottom,0px))}
        .tam footer .bar{flex-wrap:wrap}
        .tam footer nav{display:flex;gap:20px;flex-wrap:wrap;font-size:15px}
        .tam footer small{display:block;color:#9a9a9a;margin-top:10px;font-size:13px}

        /* Mobile sticky CTA */
        .tam .mcta{display:none}

        @media (max-width:820px){
          .tam .clock{display:none}
          .tam .hero{padding:32px 0 12px}
          .tam .lede{font-size:17px}
          .tam .events{gap:16px;padding-bottom:56px}
          .tam .name{font-size:38px}
          .tam .about{grid-template-columns:1fr;gap:20px;padding:48px 0}
          .tam .formats li{grid-template-columns:1fr;gap:2px}
          .tam .join{padding:48px 0 110px}
          .tam .btns{width:100%}
          .tam .btn{flex:1;text-align:center}
          .tam .mcta{display:block;position:fixed;left:16px;right:16px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:60;
            text-align:center;background:var(--pink);color:var(--white);font-weight:600;padding:15px;text-decoration:none;border:2px solid var(--black);
            box-shadow:4px 4px 0 var(--black);transition:transform .3s ease, opacity .3s ease}
          .tam .mcta.off{transform:translateY(140%);opacity:0;pointer-events:none}
        }
        @media (prefers-reduced-motion:reduce){
          .tam .reveal{opacity:1;transform:none;transition:none}
          .tam .card,.tam .top,.tam .mcta{transition:none}
          .tam .card:hover{transform:none}
          .tam .rec i{animation:none}
        }
      `}} />

      {/* Header */}
      <header className={`top ${isNavVisible ? '' : 'hidden'}`}>
        <div className="wrap bar">
          <Link href="/" aria-label="3AM Ideas home" style={{ display: 'flex', alignItems: 'center' }}>
            <Image src="/images/white_logo.png" alt="3AM Ideas" width={120} height={30} priority style={{ height: 28, width: 'auto' }} />
          </Link>
          {clock && (
            <p className="clock" style={{ margin: 0 }}>
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
        {/* Hero: short, events visible right after */}
        <section className="wrap hero">
          <p className="tagline">Some ideas are too good to sleep on.</p>
          <h1>{month} at 3 AM</h1>
          <p className="lede">A creative community in Bangalore. Strangers make films, run citywide hunts and chase the ideas they'd normally talk themselves out of. Pick one and come along.</p>
        </section>

        {/* Events */}
        <section id="event" aria-label="Upcoming events">
          <div className="wrap">
            {isLoading ? (
              <p className="state">Loading this month's events…</p>
            ) : events.length === 0 ? (
              <p className="state">Nothing scheduled right now. The next calendar drops soon. Join the WhatsApp community to hear first.</p>
            ) : (
              <div className="events">
                {events.map((event) => {
                  const style = getStyle(event);
                  const isSoldOut = event.status && /sold|closed/i.test(event.status);
                  const isExternalImage = event.image_url && event.image_url.startsWith('http');
                  const hasOld = event.original_price && event.original_price.trim() !== '' && !isFree(event);
                  return (
                    <button
                      type="button"
                      key={event.id}
                      onClick={() => handleCardClick(event.id)}
                      className={`card ${style} ${isSoldOut ? 'soldout' : ''}`}
                      aria-label={`${event.title}, ${event.date || 'date TBA'}, ${priceText(event)}`}
                    >
                      {style === 'community' && <span className="free">Free</span>}
                      {event.image_url && (
                        <div className="card-img">
                          {style === 'bcc' && <span className="rec"><i></i>REC</span>}
                          {isExternalImage ? (
                            <img src={event.image_url} alt="" loading="lazy" decoding="async" />
                          ) : (
                            <Image src={event.image_url} alt="" fill quality={75} sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                          )}
                        </div>
                      )}
                      <div className="card-body">
                        <span className="format">{formatLabel(style)}</span>
                        <span className="name">{event.title}</span>
                        {shortDesc(event) && <p className="desc">{shortDesc(event)}</p>}
                        <dl className="meta">
                          <dt>Date</dt><dt>Price</dt>
                          <dd>{event.date || 'TBA'}</dd>
                          <dd>{hasOld && <span className="old">₹{event.original_price}</span>}{priceText(event)}</dd>
                        </dl>
                        {event.status && <span className="status">{event.status}</span>}
                        <span className="cta">{isSoldOut ? 'Sold out' : (event.button_text || 'View event')}</span>
                      </div>
                    </button>
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
                  <Image
                    src={`/images/home/${filename}`}
                    alt={`3AM Ideas event photo ${index + 1}`}
                    fill
                    quality={80}
                    sizes="(max-width: 768px) 72vw, 340px"
                    style={{ objectFit: 'cover' }}
                  />
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
            <Image src="/images/white_logo.png" alt="3AM Ideas" width={120} height={30} style={{ height: 26, width: 'auto' }} />
            <small>© {new Date().getFullYear()} 3AM Ideas, Bangalore</small>
          </div>
          <nav>
            <Link href="/about">About</Link>
            <Link href="/terms">Terms & Conditions</Link>
            <a href="mailto:wearemusawwir@gmail.com">Contact</a>
          </nav>
        </div>
      </footer>

      {/* Mobile: sticky CTA once the user scrolls past the events */}
      <a href="#event" className={`mcta ${lastScrollY > 900 && !isNavVisible ? '' : 'off'}`}>See {month}'s events</a>
    </div>
  );
}
