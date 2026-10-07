"use client";

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Papa from 'papaparse';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";
const WHATSAPP_URL = "https://chat.whatsapp.com/B68V6Q62HZPHHsGMG0t4jP";
const TZ = "Asia/Kolkata";
const DESC_MAX = 30;

const LABELS = {
  bcc:       { shortLabel: 'BCC',     fullName: 'Broken Camera Crew' },
  odc:       { shortLabel: 'ODC',     fullName: 'One Day Crew' },
  premium:   { shortLabel: 'Premium', fullName: 'Creative experience' },
  community: { shortLabel: 'Free',    fullName: '3 AM Community' },
};

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
  return p ? `From ₹${p}` : 'TBA';
}
function formatDate(raw) {
  if (!raw || !raw.toString().trim()) return 'TBA';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw.toString().trim();
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ }).format(d);
}
function truncate(text, max = DESC_MAX) {
  const t = (text || '').trim();
  if (!t) return '';
  return t.length > max ? t.slice(0, max).trimEnd() + '...' : t;
}
function isPast(event) {
  return event.status && /sold|closed|past/i.test(event.status);
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [visibleGalleryCount, setVisibleGalleryCount] = useState(6);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const revealRefs = useRef([]);

  const setRef = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const loadMoreImages = () => setVisibleGalleryCount(prev => prev + 6);

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

  /* Throttled via requestAnimationFrame; only sets state when the value flips. */
  useEffect(() => {
    let ticking = false;
    let prevY = window.scrollY;
    let navVisibleRef = true;

    const compute = () => {
      const y = window.scrollY;
      const shouldShowNav = y <= 50 || y < prevY;
      if (shouldShowNav !== navVisibleRef) {
        navVisibleRef = shouldShowNav;
        setIsNavVisible(shouldShowNav);
      }
      prevY = y;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(compute); }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const upcoming = events.filter(e => !isPast(e));
  const past = events.filter(e => isPast(e));

  const renderCard = (event, i) => {
    const style = getStyle(event);
    const labels = LABELS[style];
    const soldOut = isPast(event);
    const desc = truncate(event.tagline || event.description || '');
    return (
      <Link key={event.id || i} href={`/event/${event.id.trim()}`} className={`card ${style} ${soldOut ? 'soldout' : ''}`}>
        {style === 'community' && <span className="free">Free</span>}
        <div className="card-body">
          <span className="format">{style === 'bcc' && !soldOut && <span className="dot"></span>}{labels.shortLabel}</span>
          <span className="name">{event.title}</span>
          {desc && <span className="desc">{desc}</span>}
          <div className="meta">
            <div><span>Date</span><b>{formatDate(event.date)}</b></div>
            <div><span>Price</span><b>{priceText(event)}</b></div>
          </div>
          {event.status && <span className="status">{event.status}</span>}
          <span className="cta">{soldOut ? 'View event' : (event.button_text || 'View event')}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="tam">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Instrument+Sans:wght@400;500;600&display=swap');

        html,body{margin:0;padding:0;width:100%;max-width:100%}
        .tam{
          min-width:0;
          --pink:#FF0065; --pink-soft:#FFE3EE; --black:#000; --white:#fff; --grey:#5c5c5c;
          --display:"Big Shoulders Display","Arial Narrow",Impact,sans-serif;
          --body:"Instrument Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
          font-family:var(--body); background:var(--white); color:var(--black);
          line-height:1.55; font-size:17px; width:100%; max-width:100vw; overflow-x:hidden; min-height:100vh;
        }
        html{scroll-behavior:smooth}
        .tam *{box-sizing:border-box}
        .tam a{color:inherit}
        .tam .brand{color:var(--pink)}
        .tam :focus-visible{outline:3px solid var(--pink);outline-offset:3px}
        .tam .wrap{max-width:1180px;margin:0 auto;padding:0 24px;width:100%}
        .tam .reveal{opacity:0;transform:translateY(24px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
        .tam .reveal.active{opacity:1;transform:none}

        /* Header */
        .tam .top{position:sticky;top:0;z-index:60;background:var(--black);color:var(--white);padding-top:env(safe-area-inset-top,0px);transition:transform .35s ease}
        .tam .top.hidden{transform:translateY(-100%)}
        .tam .bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:16px;padding-bottom:16px;min-height:64px}
        .tam .navlinks{display:flex;align-items:center;gap:20px;font-size:16px;font-weight:500;flex:0 0 auto}
        .tam .navlinks a{text-decoration:none;opacity:.85;padding:8px 2px;display:inline-block;white-space:nowrap}
        .tam .navlinks a:hover{opacity:1;color:var(--pink)}
        .tam .navlinks a.on{opacity:1;color:var(--pink)}

        /* Hero */
        .tam .hero{padding-top:44px;padding-bottom:10px;text-align:center;display:flex;flex-direction:column;align-items:center}
        .tam .eyebrow{font-weight:500;color:var(--pink);font-size:15px;margin:0;letter-spacing:.04em;text-transform:uppercase}
        .tam h1{font-family:var(--display);font-weight:900;font-size:clamp(46px,12vw,150px);line-height:.92;letter-spacing:-.5px;margin:12px 0 14px}
        .tam .lede{max-width:54ch;font-size:17px;color:#222;margin:0 auto}

        /* Section heads */
        .tam .sechead{display:flex;align-items:baseline;gap:12px;border-top:2px solid var(--black);padding-top:22px;margin-top:34px}
        .tam .h2{font-family:var(--display);font-weight:900;font-size:clamp(30px,5.5vw,56px);line-height:.95;margin:0}
        .tam .count{font-size:14px;color:var(--grey);font-weight:500}

        /* Cards (same system as the homepage) */
        .tam .events{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding:22px 0 10px;align-items:stretch}
        .tam .card{position:relative;display:flex;flex-direction:column;height:100%;text-decoration:none;border:2px solid var(--black);background:var(--white);color:var(--black);transition:transform .15s ease, box-shadow .15s ease}
        .tam .card-body{display:flex;flex-direction:column;flex:1;padding:20px;min-height:220px}
        .tam .format{font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px}
        .tam .dot{width:8px;height:8px;border-radius:50%;background:var(--pink);animation:tampulse 1.2s infinite}
        @keyframes tampulse{50%{opacity:.25}}
        .tam .name{font-family:var(--display);font-weight:900;font-size:36px;line-height:1.15;margin:8px 0 8px;word-break:break-word}
        .tam .desc{font-size:14.5px;opacity:.85;margin-bottom:auto}
        .tam .meta{display:flex;justify-content:space-between;gap:10px;margin:18px 0 14px;font-size:14px}
        .tam .meta div{display:flex;flex-direction:column;gap:2px}
        .tam .meta span{opacity:.65;font-size:12.5px}
        .tam .meta b{font-weight:600}
        .tam .status{font-size:13px;font-weight:600;margin-bottom:10px}
        .tam .cta{display:block;text-align:center;padding:12px;font-weight:600;font-size:14.5px;border:2px solid currentColor;min-height:44px}

        .tam .bcc{background:var(--black);color:var(--white)}
        .tam .bcc .cta{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .odc{background:var(--pink)}
        .tam .odc .cta{background:var(--black);color:var(--white);border-color:var(--black)}
        .tam .premium .cta{background:var(--pink);color:var(--white);border-color:var(--pink)}
        .tam .community{background:var(--pink-soft);border-style:dashed}
        .tam .free{position:absolute;top:12px;right:12px;font-family:var(--display);font-weight:900;font-size:24px;line-height:1.2;color:var(--pink);background:var(--white);transform:rotate(6deg);border:3px solid var(--pink);padding:0 8px}
        .tam .soldout{opacity:.55}
        .tam .soldout .cta{background:transparent !important;color:inherit !important;border-color:currentColor !important}

        @media (hover:hover){
          .tam .card:hover{transform:translate(-3px,-3px);box-shadow:6px 6px 0 var(--black)}
          .tam .bcc:hover{box-shadow:6px 6px 0 var(--pink)}
        }

        /* Empty / loading states */
        .tam .state{padding:40px 0 48px;font-size:17px;color:var(--grey);text-align:center}
        .tam .empty{border:2px dashed var(--black);padding:40px 24px;text-align:center;margin:22px 0 10px}
        .tam .empty h3{font-family:var(--display);font-weight:900;font-size:clamp(28px,5vw,44px);line-height:.98;margin:0 0 10px}
        .tam .empty p{margin:0 auto 20px;max-width:44ch;font-size:16px;color:var(--grey)}

        /* Archive grid */
        .tam .archive{border-top:2px solid var(--black);padding-top:44px;padding-bottom:44px;margin-top:40px}
        .tam .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:22px}
        .tam .shot{position:relative;aspect-ratio:1;overflow:hidden;border:2px solid var(--black);background:#eee}
        .tam .shot img{transition:transform .8s ease}
        @media (hover:hover){ .tam .shot:hover img{transform:scale(1.06)} }
        .tam .more{text-align:center;margin-top:24px}

        /* CTA */
        .tam .join{border-top:2px solid var(--black);padding-top:44px;padding-bottom:48px;display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}
        .tam .join p{margin:10px 0 0;max-width:48ch}
        .tam .btns{display:flex;gap:12px;flex-wrap:nowrap}
        .tam .btn{flex:1 1 0;display:inline-block;padding:14px 20px;font-weight:600;font-size:15px;text-decoration:none;border:2px solid var(--black);text-align:center;white-space:nowrap;background:var(--white);cursor:pointer;font-family:inherit}
        .tam .btn.pink{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .btn.dark{background:var(--black);border-color:var(--black);color:var(--white)}

        /* Footer */
        .tam footer{background:var(--black);color:var(--white);padding:32px 0 calc(40px + env(safe-area-inset-bottom,0px))}
        .tam footer .bar{flex-wrap:wrap;align-items:flex-start;min-height:auto}
        .tam footer nav{display:flex;gap:20px;flex-wrap:wrap;font-size:15px}
        .tam footer small{display:block;color:#9a9a9a;margin-top:10px;font-size:13px}

        @media (max-width:1024px){ .tam .name{font-size:30px} }

        /* Mobile */
        @media (max-width:820px){
          .tam .wrap{padding:0 20px}
          .tam .bar{padding-top:14px;padding-bottom:14px;min-height:60px;gap:10px}
          .tam .navlinks{gap:16px;font-size:14.5px}
          .tam .hero{padding-top:32px;padding-bottom:6px}
          .tam .eyebrow{font-size:13.5px}
          .tam .lede{font-size:15.5px}
          .tam .sechead{margin-top:28px;padding-top:18px}
          .tam .events{grid-template-columns:repeat(2,1fr);gap:14px;padding:18px 0 6px}
          .tam .card-body{padding:16px;padding-top:40px;min-height:200px}
          .tam .format{font-size:12px}
          .tam .name{font-size:22px;margin:8px 0 6px}
          .tam .desc{font-size:13px;line-height:1.45}
          .tam .meta{margin:16px 0 12px;font-size:12.5px}
          .tam .meta span{font-size:11px}
          .tam .status{font-size:12px;margin-bottom:10px}
          .tam .cta{padding:11px;font-size:13.5px}
          .tam .free{font-size:16px;top:10px;right:10px;padding:0 6px}
          .tam .empty{padding:32px 18px}
          .tam .archive{padding-top:36px;padding-bottom:36px;margin-top:32px}
          .tam .grid{grid-template-columns:repeat(2,1fr);gap:10px}
          .tam .join{padding-top:36px;padding-bottom:44px;flex-direction:column;align-items:flex-start}
          .tam .btns{width:100%}
          .tam .btn{padding:14px 10px;font-size:14px}
          .tam footer nav{gap:16px;margin-top:16px}
        }

        @media (max-width:380px){ .tam .navlinks{gap:12px;font-size:13.5px} }
        @media (max-width:360px){
          .tam .wrap{padding:0 16px}
          .tam .events{gap:10px}
          .tam .name{font-size:19px}
          .tam .card-body{padding:12px;padding-top:36px}
        }

        @media (prefers-reduced-motion:reduce){
          .tam .reveal{opacity:1;transform:none;transition:none}
          .tam .card,.tam .top{transition:none}
          .tam .dot{animation:none}
        }
      `}} />

      <header className={`top ${isNavVisible ? '' : 'hidden'}`}>
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
          <p className="lede">What&apos;s open right now, and everything we&apos;ve run before. Pick one and come along.</p>
        </section>

        <section className="wrap">
          {isLoading ? (
            <p className="state">Loading the lineup…</p>
          ) : (
            <>
              <div className="sechead">
                <h2 className="h2">Open now</h2>
                {upcoming.length > 0 && <span className="count">{upcoming.length} {upcoming.length === 1 ? 'event' : 'events'}</span>}
              </div>

              {upcoming.length === 0 ? (
                <div className="empty">
                  <h3>Nothing open right now</h3>
                  <p>The next calendar drops on the 1st of the month. The WhatsApp community hears first.</p>
                  <div className="btns" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a className="btn dark" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{ flex: '0 1 auto' }}>Join WhatsApp</a>
                  </div>
                </div>
              ) : (
                <div className="events">{upcoming.map(renderCard)}</div>
              )}

              {past.length > 0 && (
                <>
                  <div className="sechead">
                    <h2 className="h2">Already happened</h2>
                    <span className="count">{past.length} {past.length === 1 ? 'event' : 'events'}</span>
                  </div>
                  <div className="events">{past.map(renderCard)}</div>
                </>
              )}
            </>
          )}
        </section>

        {galleryImages.length > 0 && (
          <section className="wrap archive">
            <h2 className="h2">A glimpse of the events</h2>
            <div className="grid">
              {galleryImages.slice(0, visibleGalleryCount).map((filename, index) => (
                <div key={index} className="shot reveal" ref={setRef}>
                  <Image
                    src={`/images/home/${filename}`}
                    alt={`3 AM Ideas event photo ${index + 1}`}
                    fill
                    quality={80}
                    sizes="(max-width: 820px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
            {visibleGalleryCount < galleryImages.length && (
              <div className="more">
                <button className="btn" onClick={loadMoreImages} style={{ flex: '0 1 auto' }}>Load more photos</button>
              </div>
            )}
          </section>
        )}

        <section className="wrap join">
          <div>
            <h2 className="h2">Hear about the next one first</h2>
            <p>The full calendar drops on the 1st of every month. The WhatsApp community gets it before anyone else.</p>
          </div>
          <div className="btns">
            <a className="btn dark" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Join WhatsApp</a>
            <Link className="btn pink" href="/join">Get on the list</Link>
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