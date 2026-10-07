"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Papa from 'papaparse';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";
const WHATSAPP_URL = "https://chat.whatsapp.com/B68V6Q62HZPHHsGMG0t4jP";
const CONTACT_EMAIL = "wearemusawwir@gmail.com";
const TZ = "Asia/Kolkata";

function formatDate(raw) {
  if (!raw || !raw.toString().trim()) return 'TBA';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw.toString().trim();
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ }).format(d);
}

function TicketContent() {
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('id') || 'TKT-PENDING';
  const attendeeName = searchParams.get('name') || 'Guest';
  const eventId = searchParams.get('eventId') || '';

  const qtyString = searchParams.get('qty');
  const parsedQty = qtyString ? parseInt(qtyString, 10) : 1;
  const ticketQty = Number.isFinite(parsedQty) && parsedQty > 0 ? parsedQty : 1;

  const [eventDetails, setEventDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!eventId) { setIsLoading(false); return; }

    fetch(CSV_URL)
      .then(res => res.text())
      .then(text => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (h) => h.trim().toLowerCase().replace(/^\uFEFF/, ''),
          complete: (results) => {
            const foundEvent = results.data.find(e => e.id && e.id.trim().toLowerCase() === eventId.toLowerCase());
            if (foundEvent) setEventDetails(foundEvent);
            setIsLoading(false);
          }
        });
      })
      .catch(() => setIsLoading(false));
  }, [eventId]);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — the id is on screen anyway
    }
  };

  const eventTitle = eventDetails?.title || '3 AM Ideas';
  const cancelHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Cancel ticket: ${ticketId}`)}&body=${encodeURIComponent(`Hi team, I'd like to cancel my ticket (${ticketId}) for ${eventTitle}.`)}`;

  return (
    <>
      <section className="wrap head">
        <p className="eyebrow">You&apos;re in</p>
        <h1>See you there</h1>
        <p className="sub">
          {ticketQty > 1
            ? `${ticketQty} spots are confirmed. Screenshot this page.`
            : 'Your spot is confirmed. Screenshot this page.'}
        </p>
      </section>

      <section className="wrap">
        <div className="ticket">
          <div className="stub">
            <span className="pass">Digital pass</span>
            {ticketQty > 1 && <span className="qtybadge">Admits {ticketQty}</span>}
            {isLoading ? <div className="skel big"></div> : <h2>{eventTitle}</h2>}
          </div>

          <div className="perf" aria-hidden="true"></div>

          <div className="body">
            <div className="line">
              <span className="lbl">Name</span>
              <b className="val">{attendeeName}</b>
            </div>

            <div className="grid2">
              <div className="line">
                <span className="lbl">Date</span>
                {isLoading ? <div className="skel"></div> : <b className="val">{formatDate(eventDetails?.date)}</b>}
              </div>
              <div className="line">
                <span className="lbl">Time</span>
                {isLoading ? <div className="skel"></div> : <b className="val">{eventDetails?.time || 'TBA'}</b>}
              </div>
            </div>

            <div className="line">
              <span className="lbl">Where</span>
              {isLoading ? <div className="skel"></div> : (
                <b className="val">
                  {eventDetails?.location_main || 'TBA'}
                  {eventDetails?.location_sub ? `, ${eventDetails.location_sub}` : ''}
                </b>
              )}
            </div>

            {(eventDetails?.bring || eventDetails?.provided) && !isLoading && (
              <div className="grid2">
                {eventDetails?.bring && (
                  <div className="line"><span className="lbl">Bring</span><b className="val sm">{eventDetails.bring}</b></div>
                )}
                {eventDetails?.provided && (
                  <div className="line"><span className="lbl">Provided</span><b className="val sm">{eventDetails.provided}</b></div>
                )}
              </div>
            )}

            <div className="foot">
              <div className="line">
                <span className="lbl">Ticket ID</span>
                <button type="button" className="idbtn" onClick={copyId} title="Tap to copy">
                  <code>{ticketId}</code>
                  <span className="copyhint">{copied ? 'Copied' : 'Tap to copy'}</span>
                </button>
              </div>
              <span className="confirmed">Confirmed</span>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap next">
        <h3 className="h3">What happens now</h3>
        <ol className="steps">
          <li><b>1</b><span>Screenshot this page, or note your ticket ID. It&apos;s your entry.</span></li>
          <li><b>2</b><span>We&apos;ll message you on WhatsApp a day or two before with the exact meeting point.</span></li>
          <li><b>3</b><span>Turn up. That&apos;s it.</span></li>
        </ol>

        <div className="btns">
          <a className="btn dark" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Join WhatsApp</a>
          <Link className="btn pink" href="/event">See all events</Link>
        </div>

        <p className="cancel">
          Booked by mistake? <a href={cancelHref}>Request a cancellation</a> within 30 minutes.
        </p>
      </section>
    </>
  );
}

export default function TicketPage() {
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
        .tam *{box-sizing:border-box}
        .tam a{color:inherit}
        .tam .brand{color:var(--pink)}
        .tam :focus-visible{outline:3px solid var(--pink);outline-offset:3px}
        .tam .wrap{max-width:560px;margin:0 auto;padding:0 24px;width:100%}

        /* Header */
        .tam .top{background:var(--black);color:var(--white);padding-top:env(safe-area-inset-top,0px)}
        .tam .bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:16px;padding-bottom:16px;min-height:64px;
          max-width:560px;margin:0 auto;padding-left:24px;padding-right:24px}
        .tam .bar a{text-decoration:none;font-size:15px;font-weight:500;opacity:.85}
        .tam .bar a:hover{opacity:1;color:var(--pink)}

        /* Heading */
        .tam .head{padding-top:40px;padding-bottom:24px;text-align:center}
        .tam .eyebrow{font-weight:600;color:var(--pink);font-size:14px;margin:0;letter-spacing:.06em;text-transform:uppercase}
        .tam h1{font-family:var(--display);font-weight:900;font-size:clamp(46px,13vw,96px);line-height:.92;letter-spacing:-.5px;margin:8px 0 10px}
        .tam .sub{margin:0;font-size:16px;color:var(--grey)}

        /* Ticket */
        .tam .ticket{border:3px solid var(--black);box-shadow:8px 8px 0 var(--pink);background:var(--white)}
        .tam .stub{background:var(--black);color:var(--white);padding:24px 22px;text-align:center;position:relative}
        .tam .pass{font-size:12px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;opacity:.7;display:block}
        .tam .qtybadge{display:inline-block;margin-top:8px;background:var(--pink);color:var(--white);font-size:12px;font-weight:600;
          padding:3px 10px;letter-spacing:.04em}
        .tam .stub h2{font-family:var(--display);font-weight:900;font-size:clamp(30px,8vw,46px);line-height:1.02;margin:10px 0 0;word-break:break-word}

        /* Perforation */
        .tam .perf{height:0;border-top:3px dashed var(--black);position:relative}
        .tam .perf::before,.tam .perf::after{content:'';position:absolute;top:-14px;width:24px;height:24px;border-radius:50%;background:var(--white);
          border:3px solid var(--black)}
        .tam .perf::before{left:-15px;clip-path:inset(0 0 0 50%)}
        .tam .perf::after{right:-15px;clip-path:inset(0 50% 0 0)}

        .tam .body{padding:24px 22px;display:flex;flex-direction:column;gap:18px}
        .tam .line{display:flex;flex-direction:column;gap:3px;min-width:0}
        .tam .lbl{font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--grey)}
        .tam .val{font-family:var(--display);font-weight:900;font-size:28px;line-height:1.08;word-break:break-word}
        .tam .val.sm{font-family:var(--body);font-weight:500;font-size:15.5px;line-height:1.4}
        .tam .grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        .tam .skel{height:26px;background:#eee;width:100%}
        .tam .skel.big{height:40px;background:rgba(255,255,255,.18);margin-top:10px}

        .tam .foot{border-top:2px dashed var(--black);padding-top:16px;display:flex;justify-content:space-between;align-items:flex-end;gap:14px}
        .tam .idbtn{background:none;border:0;padding:0;margin:0;font:inherit;text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:3px;min-width:0}
        .tam .idbtn code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13.5px;background:var(--pink-soft);
          padding:4px 8px;display:inline-block;word-break:break-all}
        .tam .copyhint{font-size:11px;color:var(--grey)}
        .tam .confirmed{flex:0 0 auto;font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
          background:var(--pink);color:var(--white);padding:5px 10px}

        /* Next steps */
        .tam .next{padding-top:34px;padding-bottom:48px}
        .tam .h3{font-family:var(--display);font-weight:900;font-size:clamp(26px,6vw,38px);line-height:1;margin:0 0 14px}
        .tam .steps{list-style:none;margin:0 0 26px;padding:0;border-top:1px solid var(--black)}
        .tam .steps li{display:grid;grid-template-columns:38px 1fr;gap:12px;padding:14px 2px;border-bottom:1px solid var(--black);font-size:15.5px}
        .tam .steps b{font-family:var(--display);font-weight:900;font-size:26px;line-height:.95;color:var(--pink)}
        .tam .btns{display:flex;gap:12px;flex-wrap:nowrap}
        .tam .btn{flex:1 1 0;display:inline-block;padding:14px 16px;font-weight:600;font-size:15px;text-decoration:none;
          border:2px solid var(--black);text-align:center;white-space:nowrap}
        .tam .btn.pink{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .btn.dark{background:var(--black);border-color:var(--black);color:var(--white)}
        .tam .cancel{margin:22px 0 0;font-size:13.5px;color:var(--grey);text-align:center}
        .tam .cancel a{font-weight:600;text-decoration:underline}

        /* Footer */
        .tam footer{background:var(--black);color:var(--white);padding:28px 0 calc(36px + env(safe-area-inset-bottom,0px));text-align:center}
        .tam footer small{display:block;color:#9a9a9a;margin-top:10px;font-size:13px}

        @media (max-width:820px){
          .tam .wrap,.tam .bar{padding-left:20px;padding-right:20px}
          .tam .bar{padding-top:14px;padding-bottom:14px;min-height:60px}
          .tam .head{padding-top:30px;padding-bottom:20px}
          .tam .ticket{box-shadow:6px 6px 0 var(--pink)}
          .tam .val{font-size:24px}
          .tam .body{padding:20px 18px;gap:16px}
          .tam .stub{padding:20px 18px}
          .tam .next{padding-top:28px;padding-bottom:40px}
          .tam .btns{flex-direction:column}
        }
        @media (max-width:360px){
          .tam .wrap,.tam .bar{padding-left:16px;padding-right:16px}
          .tam .grid2{grid-template-columns:1fr;gap:16px}
        }

        /* Print / save as PDF */
        @media print{
          .tam .top,.tam .next,.tam footer,.tam .head .eyebrow{display:none}
          .tam .ticket{box-shadow:none}
        }
      `}} />

      <header className="top">
        <div className="bar">
          <Link href="/">← Home</Link>
          <Link href="/event">All events</Link>
        </div>
      </header>

      <main>
        <Suspense fallback={<p style={{ textAlign: 'center', padding: '60px 24px' }}>Loading your ticket…</p>}>
          <TicketContent />
        </Suspense>
      </main>

      <footer>
        <Image src="/images/white_logo.png" alt="3 AM Ideas" width={120} height={30} style={{ height: 24, width: 'auto' }} />
        <small>© {new Date().getFullYear()} 3 AM Ideas, Bangalore</small>
      </footer>
    </div>
  );
}