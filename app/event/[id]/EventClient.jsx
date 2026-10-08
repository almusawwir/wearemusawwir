"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const SITE = "https://3amideas.club";
const WHATSAPP_URL = "https://chat.whatsapp.com/B68V6Q62HZPHHsGMG0t4jP";
const TZ = "Asia/Kolkata";

function EventImage({ src, alt, className, fill, sizes, priority, quality, style }) {
  const isExternal = src && src.startsWith('http');
  if (isExternal) {
    return <img src={src} alt={alt} className={className} style={style}
                loading={priority ? "eager" : "lazy"} decoding="async" />;
  }
  return <Image src={src} alt={alt} fill={fill} sizes={sizes} priority={priority} quality={quality}
                loading={!priority ? "lazy" : undefined} className={className} style={style} />;
}

function formatDate(raw) {
  if (!raw || !raw.toString().trim()) return 'TBA';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw.toString().trim();
  return new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ }).format(d);
}

export default function EventClient({ currentEvent, suggestedEvents, targetId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!currentEvent) {
    return (
      <div className="tam">
        <style dangerouslySetInnerHTML={{ __html: baseCss }} />
        <div className="notfound">
          <h1>Event not found</h1>
          <p>This one may have ended, or the link might be wrong.</p>
          <Link className="btn pink" href="/event">See all events</Link>
        </div>
      </div>
    );
  }

  // Google Sheet line breaks (\n) become paragraphs
  const paragraphs = currentEvent.description
    ? currentEvent.description.split('\n').filter(p => p.trim() !== '')
    : [];

  // Comma-separated lists
  const providedList = currentEvent.provided ? currentEvent.provided.split(',').map(i => i.trim()).filter(Boolean) : [];
  const bringList = currentEvent.bring ? currentEvent.bring.split(',').map(i => i.trim()).filter(Boolean) : [];

  // Flow, one step per line
  const flowList = currentEvent.flow ? currentEvent.flow.split('\n').filter(i => i.trim() !== '') : [];

  // Media
  const galleryImages = currentEvent.gallery ? currentEvent.gallery.split(',').map(i => i.trim()).filter(Boolean) : [];
  const videoSrc = currentEvent.video ? currentEvent.video.trim() : null;

  // Sharing
  const shareUrl = `${SITE}/event/${targetId}`;
  const shareText = `${currentEvent.title}${currentEvent.tagline ? ` — ${currentEvent.tagline}` : ''}\n\nCome along:`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: currentEvent.title, text: shareText, url: shareUrl });
      } catch (err) {
        if (err?.name !== 'AbortError') console.error("Error sharing", err);
      }
    } else {
      handleCopyLink();
    }
  };

  // Status + booking
  const isSoldOut = currentEvent.status && /sold|closed/i.test(currentEvent.status);
  const isFree = ['0', 'free'].includes((currentEvent.price || '').toString().trim().toLowerCase());
  const hasOriginalPrice = currentEvent.original_price && currentEvent.original_price.trim() !== '' && !isFree;
  const priceLabel = isFree ? 'Free' : (currentEvent.price ? `₹${currentEvent.price}` : 'TBA');

  const bookingLinks = [
    { id: 'form', url: currentEvent.form_link, label: 'RSVP directly', recommend: true },
    { id: 'district', url: currentEvent.district_link, label: 'Book on District' },
    { id: 'meetup', url: currentEvent.meetup_link, label: 'Book on Meetup' },
    { id: 'bookmyshow', url: currentEvent.bookmyshow_link, label: 'Book on BookMyShow' }
  ].filter(link => link.url && link.url.trim() !== '');

  const handleBookingClick = (e) => {
    if (bookingLinks.length > 1) {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  const ctaLabel = isSoldOut ? 'Sold out' : (bookingLinks.length === 0 ? 'Opening soon' : (currentEvent.button_text || 'Book now'));
  const ctaDisabled = isSoldOut || bookingLinks.length === 0;

  return (
    <div className="tam">
      <style dangerouslySetInnerHTML={{ __html: baseCss }} />

      <header className="top">
        <div className="wrap bar">
          <Link href="/" aria-label="3 AM Ideas home" style={{ display: 'flex', alignItems: 'center' }}>
            <Image src="/images/white_logo.png" alt="3 AM Ideas" width={130} height={32} priority style={{ height: 28, width: 'auto' }} />
          </Link>
          <nav className="navlinks">
            <Link href="/event">← All events</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="hero">
          <div className="wrap">
            <h1>{currentEvent.title}</h1>
            {currentEvent.tagline && <p className="tagline">{currentEvent.tagline}</p>}
          </div>
          {currentEvent.image_url && (
            <div className="heroimg">
              <EventImage src={currentEvent.image_url} alt={currentEvent.title} fill priority quality={85}
                          sizes="100vw" style={{ objectFit: 'cover' }} />
            </div>
          )}
        </section>

        {/* Date & time, then location, then what it is */}
        <section className="wrap block">
          <h2 className="h2">Date &amp; time</h2>
          <div>
            <p className="big">{formatDate(currentEvent.date)}</p>
            {currentEvent.time && <p className="plain">{currentEvent.time}</p>}
          </div>
        </section>

        <section className="wrap block">
          <h2 className="h2">Location</h2>
          <div>
            <p className="big">{currentEvent.location_main || 'TBA'}</p>
            {currentEvent.location_sub && <p className="plain">{currentEvent.location_sub}</p>}
            {currentEvent.map_link && (
              <a className="inline" href={currentEvent.map_link} target="_blank" rel="noreferrer">Open in Maps ↗</a>
            )}
          </div>
        </section>

        {paragraphs.length > 0 && (
          <section className="wrap block">
            <h2 className="h2">What is this?</h2>
            <div className="prose">
              {paragraphs.map((p, idx) => <p key={idx}>{p}</p>)}
            </div>
          </section>
        )}

        {/* Price */}
        <section className="wrap block">
          <h2 className="h2">Price</h2>
          <div>
            <p className="big">
              {hasOriginalPrice && <span className="old">₹{currentEvent.original_price}</span>}
              {priceLabel}
            </p>
            {currentEvent.status && <p className="plain">{currentEvent.status}</p>}
          </div>
        </section>

        {flowList.length > 0 && (
          <section className="wrap block">
            <h2 className="h2">The flow</h2>
            <ol className="flow">
              {flowList.map((step, idx) => (
                <li key={idx}><b>{idx + 1}</b><span>{step}</span></li>
              ))}
            </ol>
          </section>
        )}

        {(providedList.length > 0 || bringList.length > 0) && (
          <section className="wrap block">
            <h2 className="h2">Come prepared</h2>
            <div className="twocol">
              {providedList.length > 0 && (
                <div>
                  <span className="sublbl">We provide</span>
                  <ul className="tags">
                    {providedList.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              )}
              {bringList.length > 0 && (
                <div>
                  <span className="sublbl">You bring</span>
                  <ul className="tags alt">
                    {bringList.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {(galleryImages.length > 0 || videoSrc) && (
          <section className="block noborder">
            <div className="wrap"><h2 className="h2 wide">A glimpse</h2></div>
            <div className="strip">
              {videoSrc && (
                <div className="shot vid">
                  <video src={videoSrc} autoPlay loop muted playsInline />
                </div>
              )}
              {galleryImages.map((img, idx) => (
                <div key={idx} className="shot">
                  <EventImage src={img} alt={`${currentEvent.title} photo ${idx + 1}`} fill
                              sizes="(max-width: 820px) 70vw, 340px" style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Share */}
        <section className="wrap block">
          <h2 className="h2">Bring someone</h2>
          <div className="sharebtns">
            <button type="button" className="btn" onClick={handleCopyLink}>{copied ? 'Link copied' : 'Copy link'}</button>
            <button type="button" className="btn dark" onClick={handleNativeShare}>Share</button>
          </div>
        </section>

        {/* Suggested */}
        {suggestedEvents.length > 0 && (
          <section className="block noborder">
            <div className="wrap"><h2 className="h2 wide">Other events</h2></div>
            <div className="strip">
              {suggestedEvents.map((event) => (
                <Link href={`/event/${event.id?.trim()}`} key={event.id} className="sugg">
                  <span className="sdate">{formatDate(event.date)}</span>
                  <span className="sname">{event.title}</span>
                  <span className="sgo">View event</span>
                </Link>
              ))}
            </div>
          </section>
        )}
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

      {/* Sticky booking bar */}
      <div className="stickybar">
        <div className="wrap sb">
          <div className="sbinfo">
            <span className="sbprice">
              {hasOriginalPrice && <span className="old">₹{currentEvent.original_price}</span>}
              {priceLabel}
            </span>
            <span className="sbdate">{formatDate(currentEvent.date)}</span>
          </div>
          {ctaDisabled ? (
            <span className="sbcta off">{ctaLabel}</span>
          ) : (
            <a className="sbcta"
               href={bookingLinks.length === 1 ? bookingLinks[0].url : '#'}
               target={bookingLinks.length === 1 ? '_blank' : undefined}
               rel={bookingLinks.length === 1 ? 'noreferrer' : undefined}
               onClick={handleBookingClick}>
              {ctaLabel}
            </a>
          )}
        </div>
      </div>

      {/* Booking platform picker */}
      {isModalOpen && (
        <div className="modalwrap" role="dialog" aria-modal="true" aria-label="Choose where to book"
             onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="mhead">
              <h3>Where to book</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} aria-label="Close">✕</button>
            </div>
            <div className="mlinks">
              {bookingLinks.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noreferrer"
                   className={link.recommend ? 'mlink best' : 'mlink'}>
                  <span>{link.label}</span>
                  {link.recommend && <small>No platform fees. Goes straight to us.</small>}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const baseCss = `
@import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Instrument+Sans:wght@400;500;600&display=swap');

html,body{margin:0;padding:0;width:100%;max-width:100%}
.tam{
  min-width:0;
  --pink:#FF0065; --pink-soft:#FFE3EE; --black:#000; --white:#fff; --grey:#5c5c5c;
  --display:"Big Shoulders Display","Arial Narrow",Impact,sans-serif;
  --body:"Instrument Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
  font-family:var(--body); background:var(--white); color:var(--black);
  line-height:1.55; font-size:17px; width:100%; max-width:100vw; overflow-x:hidden; min-height:100vh;
  padding-bottom:96px;
}
html{scroll-behavior:smooth}
.tam *{box-sizing:border-box}
.tam a{color:inherit}
.tam .brand{color:var(--pink)}
.tam :focus-visible{outline:3px solid var(--pink);outline-offset:3px}
.tam .wrap{max-width:900px;margin:0 auto;padding:0 24px;width:100%}

/* Not found */
.tam .notfound{min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;gap:10px}
.tam .notfound h1{font-family:var(--display);font-weight:900;font-size:clamp(40px,10vw,90px);line-height:.95;margin:0}
.tam .notfound p{margin:0 0 14px;color:var(--grey)}

/* Header */
.tam .top{position:sticky;top:0;z-index:60;background:var(--black);color:var(--white);padding-top:env(safe-area-inset-top,0px)}
.tam .bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:16px;padding-bottom:16px;min-height:64px}
.tam .navlinks{display:flex;align-items:center;gap:20px;font-size:16px;font-weight:500}
.tam .navlinks a{text-decoration:none;opacity:.85;padding:8px 2px;white-space:nowrap}
.tam .navlinks a:hover{opacity:1;color:var(--pink)}

/* Hero */
.tam .hero{padding-top:36px}
.tam .hero h1{font-family:var(--display);font-weight:900;font-size:clamp(44px,11vw,120px);line-height:.94;letter-spacing:-.5px;margin:0;word-break:break-word}
.tam .tagline{font-size:19px;color:var(--pink);font-weight:500;margin:12px 0 0;max-width:46ch}
.tam .heroimg{position:relative;width:100%;aspect-ratio:16/9;margin-top:26px;border-top:2px solid var(--black);border-bottom:2px solid var(--black);background:#eee;overflow:hidden}
.tam .heroimg img{width:100%;height:100%;object-fit:cover}

/* Blocks */
.tam .block{display:grid;grid-template-columns:190px 1fr;gap:28px;padding-top:28px;padding-bottom:28px;border-bottom:1px solid var(--black)}
.tam .block.noborder{display:block;border-bottom:1px solid var(--black)}
.tam .h2{font-family:var(--display);font-weight:900;font-size:30px;line-height:1;margin:0}
.tam .h2.wide{margin-bottom:18px}
.tam .big{font-family:var(--display);font-weight:900;font-size:clamp(26px,4.5vw,38px);line-height:1.08;margin:0}
.tam .big .old{font-family:var(--body);font-weight:400;font-size:18px;text-decoration:line-through;opacity:.45;margin-right:10px}
.tam .plain{margin:6px 0 0;font-size:16px;color:var(--grey)}
.tam .inline{display:inline-block;margin-top:12px;font-weight:600;font-size:15px;text-decoration:underline}
.tam .prose p{margin:0 0 14px;font-size:16.5px;max-width:64ch}
.tam .prose p:last-child{margin-bottom:0}

/* Flow */
.tam .flow{list-style:none;margin:0;padding:0}
.tam .flow li{display:grid;grid-template-columns:40px 1fr;gap:12px;padding:10px 0;border-bottom:1px dashed #bbb;font-size:16px}
.tam .flow li:last-child{border-bottom:0}
.tam .flow b{font-family:var(--display);font-weight:900;font-size:24px;line-height:1;color:var(--pink)}

/* Provided / bring */
.tam .twocol{display:grid;grid-template-columns:1fr 1fr;gap:26px}
.tam .sublbl{font-size:12.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--grey);display:block;margin-bottom:10px}
.tam .tags{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:8px}
.tam .tags li{border:2px solid var(--black);padding:6px 12px;font-size:14.5px;font-weight:500}
.tam .tags.alt li{background:var(--pink-soft);border-color:var(--pink)}

/* Strips */
.tam .strip{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 24px 10px;scrollbar-width:none}
.tam .strip::-webkit-scrollbar{display:none}
.tam .shot{position:relative;flex:0 0 auto;width:min(70vw,320px);aspect-ratio:4/5;scroll-snap-align:center;background:#eee;
  overflow:hidden;border:2px solid var(--black)}
.tam .shot img{width:100%;height:100%;object-fit:cover}
.tam .shot.vid{aspect-ratio:9/16;width:min(58vw,250px);background:#000}
.tam .shot.vid video{width:100%;height:100%;object-fit:cover;display:block}

/* Suggested */
.tam .sugg{flex:0 0 auto;width:min(68vw,280px);scroll-snap-align:start;border:2px solid var(--black);padding:18px;
  display:flex;flex-direction:column;gap:6px;text-decoration:none;background:var(--white);transition:transform .15s ease, box-shadow .15s ease}
.tam .sdate{font-size:13px;font-weight:600;color:var(--pink)}
.tam .sname{font-family:var(--display);font-weight:900;font-size:28px;line-height:1.08;word-break:break-word}
.tam .sgo{margin-top:8px;font-size:14px;font-weight:600;text-decoration:underline}
@media (hover:hover){ .tam .sugg:hover{transform:translate(-3px,-3px);box-shadow:6px 6px 0 var(--black)} }

/* Buttons */
.tam .btn{display:inline-block;padding:13px 22px;font-weight:600;font-size:15px;text-decoration:none;border:2px solid var(--black);
  text-align:center;background:var(--white);color:var(--black);cursor:pointer;font-family:inherit}
.tam .btn.pink{background:var(--pink);border-color:var(--pink);color:var(--white)}
.tam .btn.dark{background:var(--black);border-color:var(--black);color:var(--white)}
.tam .sharebtns{display:flex;gap:12px;flex-wrap:wrap}
.tam .sharebtns .btn{flex:1 1 0;min-width:140px}

/* Footer */
.tam footer{background:var(--black);color:var(--white);padding:32px 0 calc(40px + env(safe-area-inset-bottom,0px))}
.tam footer .bar{flex-wrap:wrap;align-items:flex-start;min-height:auto}
.tam footer nav{display:flex;gap:20px;flex-wrap:wrap;font-size:15px}
.tam footer small{display:block;color:#9a9a9a;margin-top:10px;font-size:13px}

/* Sticky booking bar */
.tam .stickybar{position:fixed;left:0;right:0;bottom:0;z-index:70;background:var(--white);border-top:3px solid var(--black);
  padding-bottom:env(safe-area-inset-bottom,0px)}
.tam .sb{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:12px;padding-bottom:12px}
.tam .sbinfo{display:flex;flex-direction:column;gap:1px;min-width:0}
.tam .sbprice{font-family:var(--display);font-weight:900;font-size:30px;line-height:1}
.tam .sbprice .old{font-family:var(--body);font-weight:400;font-size:15px;text-decoration:line-through;opacity:.45;margin-right:8px}
.tam .sbdate{font-size:13px;color:var(--grey);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tam .sbcta{flex:0 0 auto;display:inline-block;padding:15px 30px;font-weight:600;font-size:16px;text-decoration:none;
  background:var(--pink);border:2px solid var(--pink);color:var(--white);text-align:center}
.tam .sbcta.off{background:var(--white);border-color:#bbb;color:var(--grey);cursor:not-allowed}

/* Modal */
.tam .modalwrap{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;padding:0}
.tam .modal{background:var(--white);width:100%;max-width:520px;border:3px solid var(--black);border-bottom:0;padding:22px 22px calc(26px + env(safe-area-inset-bottom,0px))}
.tam .mhead{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px}
.tam .mhead h3{font-family:var(--display);font-weight:900;font-size:30px;line-height:1;margin:0}
.tam .mhead button{background:none;border:0;font-size:20px;cursor:pointer;padding:6px 10px;font-family:inherit}
.tam .mlinks{display:flex;flex-direction:column;gap:10px}
.tam .mlink{display:block;border:2px solid var(--black);padding:14px 16px;text-decoration:none;font-weight:600;font-size:16px}
.tam .mlink small{display:block;font-weight:400;font-size:13px;opacity:.75;margin-top:3px}
.tam .mlink.best{background:var(--pink);border-color:var(--pink);color:var(--white)}

/* Mobile */
@media (max-width:820px){
  .tam{padding-bottom:92px}
  .tam .wrap{padding:0 20px}
  .tam .strip{padding:0 20px 10px}
  .tam .bar{padding-top:14px;padding-bottom:14px;min-height:60px}
  .tam .navlinks{gap:16px;font-size:14.5px}
  .tam .hero{padding-top:26px}
  .tam .tagline{font-size:16.5px}
  .tam .heroimg{aspect-ratio:4/3;margin-top:20px}
  .tam .block{grid-template-columns:1fr;gap:10px;padding-top:22px;padding-bottom:22px}
  .tam .h2{font-size:24px}
  .tam .prose p{font-size:16px}
  .tam .twocol{grid-template-columns:1fr;gap:20px}
  .tam .sharebtns{flex-direction:column}
  .tam .sharebtns .btn{width:100%}
  .tam .sb{padding-top:10px;padding-bottom:10px;gap:12px}
  .tam .sbprice{font-size:26px}
  .tam .sbcta{padding:14px 20px;font-size:15px;flex:1 1 auto;max-width:60%}
  .tam footer nav{gap:16px;margin-top:16px}
}
@media (max-width:360px){
  .tam .wrap{padding:0 16px}
  .tam .strip{padding:0 16px 10px}
  .tam .sbprice{font-size:22px}
  .tam .sbcta{padding:13px 14px;font-size:14px}
}
@media (prefers-reduced-motion:reduce){ .tam .sugg{transition:none} }
`;