"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const CONTACT_EMAIL = "wearemusawwir@gmail.com";

function Pink3AM({ text }) {
  const parts = text.split(/(3 AM)/g);
  return parts.map((part, i) =>
    part === '3 AM' ? <span key={i} className="brand">3 AM</span> : <React.Fragment key={i}>{part}</React.Fragment>
  );
}

export default function TermsPage() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length <= 2) router.push('/');
    else router.back();
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
          line-height:1.55; font-size:17px; width:100%; max-width:100vw; overflow-x:hidden; overflow-x:clip; min-height:100vh;
        }
        html{scroll-behavior:smooth}
        .tam *{box-sizing:border-box}
        .tam a{color:inherit}
        .tam .brand{color:var(--pink)}
        .tam :focus-visible{outline:3px solid var(--pink);outline-offset:3px}
        .tam .wrap{max-width:880px;margin:0 auto;padding:0 24px;width:100%}

        .tam .top{position:sticky;top:0;z-index:60;background:var(--black);color:var(--white);padding-top:env(safe-area-inset-top,0px)}
        .tam .bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:16px;padding-bottom:16px;min-height:64px}
        .tam .navlinks{display:flex;align-items:center;gap:20px;font-size:16px;font-weight:500;flex:0 0 auto}
        .tam .navlinks a,.tam .navlinks button{text-decoration:none;opacity:.85;padding:8px 2px;display:inline-block;white-space:nowrap;
          background:none;border:0;color:inherit;font:inherit;cursor:pointer}
        .tam .navlinks a:hover,.tam .navlinks button:hover{opacity:1;color:var(--pink)}

        .tam .hero{padding-top:44px;padding-bottom:26px}
        .tam .eyebrow{font-weight:500;color:var(--pink);font-size:14px;margin:0;letter-spacing:.06em;text-transform:uppercase}
        .tam h1{font-family:var(--display);font-weight:900;font-size:clamp(40px,10vw,110px);line-height:.94;letter-spacing:-.5px;margin:10px 0 12px}
        .tam .updated{font-size:14px;color:var(--grey);margin:0}

        .tam .terms{border-top:2px solid var(--black);padding-bottom:50px}
        .tam section.t{border-bottom:1px solid var(--black);padding:28px 0}
        .tam section.t:last-of-type{border-bottom:0}
        .tam h2{font-family:var(--display);font-weight:900;font-size:clamp(24px,4.5vw,34px);line-height:1.05;margin:0 0 14px;
          display:flex;align-items:baseline;gap:12px}
        .tam h2 em{font-style:normal;color:var(--pink);flex:0 0 auto}
        .tam section.t p{margin:0 0 12px;max-width:66ch;font-size:16px}
        .tam section.t p:last-child{margin-bottom:0}
        .tam section.t strong{font-weight:600}
        .tam .flag{border-left:5px solid var(--pink);padding:4px 0 4px 16px;margin:16px 0;font-weight:500}
        .tam .beat{font-family:var(--display);font-weight:900;font-size:clamp(20px,3.6vw,28px);line-height:1.15;margin:16px 0}

        .tam .ask{background:var(--black);color:var(--white);padding:40px 0 44px;margin-top:10px}
        .tam .ask h2{margin-bottom:12px}
        .tam .ask h2 em{color:var(--pink)}
        .tam .ask p{margin:0 0 18px;max-width:52ch;font-size:16px;color:#dcdcdc}
        .tam .btn{display:inline-block;padding:14px 24px;font-weight:600;font-size:15px;text-decoration:none;
          background:var(--pink);border:2px solid var(--pink);color:var(--white)}

        .tam footer{background:var(--black);color:var(--white);border-top:1px solid #333;
          padding:32px 0 calc(40px + env(safe-area-inset-bottom,0px))}
        .tam footer .fbar{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap}
        .tam footer nav{display:flex;gap:20px;flex-wrap:wrap;font-size:15px}
        .tam footer small{display:block;color:#8d8d8d;margin-top:14px;font-size:13px}

        @media (max-width:820px){
          .tam .wrap{padding:0 20px}
          .tam .bar{padding-top:14px;padding-bottom:14px;min-height:60px}
          .tam .navlinks{gap:16px;font-size:14.5px}
          .tam .hero{padding-top:32px;padding-bottom:20px}
          .tam section.t{padding:24px 0}
          .tam section.t p{font-size:15.5px}
          .tam h2{gap:10px}
          .tam .flag{padding-left:13px;border-left-width:4px}
          .tam .ask{padding:32px 0 36px}
          .tam .btn{width:100%;text-align:center}
          .tam footer nav{gap:16px}
        }
        @media (max-width:380px){ .tam .navlinks{gap:12px;font-size:13.5px} }
        @media (max-width:360px){ .tam .wrap{padding:0 16px} }
      `}} />

      <header className="top">
        <div className="wrap bar">
          <Link href="/" aria-label="3 AM Ideas home" style={{ display: 'flex', alignItems: 'center' }}>
            <Image src="/images/white_logo.png" alt="3 AM Ideas" width={130} height={32} priority style={{ height: 28, width: 'auto' }} />
          </Link>
          <nav className="navlinks">
            <button type="button" onClick={handleBack}>← Back</button>
            <Link href="/event">All events</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="wrap hero">
          <p className="eyebrow">The fine print</p>
          <h1>Terms &amp; guidelines</h1>
          {/* TODO: update this date whenever you change the terms */}
          <p className="updated">Last updated: October 2026</p>
        </section>

        <div className="wrap terms">
          <section className="t">
            <h2><em>01</em>Booking &amp; capacity</h2>
            <p>Our events are intentionally limited in capacity, so every spot matters.</p>
            <p>Your spot is confirmed only after full payment has been received and your ticket has been issued.</p>
            <p>If you&apos;d like to transfer your spot to someone else, please contact us in advance. Transfers are subject to approval and event capacity.</p>
          </section>

          <section className="t">
            <h2><em>02</em>Cancellation &amp; refunds</h2>
            <p>Because venues, materials and other arrangements are planned around confirmed attendance, <strong>we don&apos;t offer refunds for no-shows or last-minute cancellations.</strong></p>
            <p className="flag">Paid by mistake? You can request a cancellation within <strong>30 minutes of booking</strong> by contacting us directly.</p>
          </section>

          <section className="t">
            <h2><em>03</em>Be decent</h2>
            <p><Pink3AM text="3 AM is built around meeting people you don't know yet. That only works when everyone feels comfortable being there." /></p>
            <p className="beat">Ideas can be challenged. <span className="brand">People can&apos;t.</span></p>
            <p>Harassment, bullying, discrimination, intimidation, threats, deliberately disruptive behaviour, or disrespect towards participants, organisers, venues or staff won&apos;t be tolerated.</p>
            <p>We reserve the right to remove anyone who makes the space unsafe or uncomfortable for others, without a refund.</p>
          </section>

          <section className="t">
            <h2><em>04</em>Respect personal boundaries</h2>
            <p><Pink3AM text="Meeting someone at 3 AM doesn't mean you have access to them afterwards." /></p>
            <p>Don&apos;t repeatedly message, call, follow, pressure, flirt with, or contact another participant privately if they haven&apos;t invited you to.</p>
            <p>Respect someone&apos;s physical space too. No unwanted touching, blocking someone&apos;s movement, following them around, or deliberately getting into their personal space.</p>
            <p className="beat">A no is enough. So is silence.<br />If someone asks you to stop, <span className="brand">stop.</span></p>
            <p><Pink3AM text="If we receive a credible complaint or witness behaviour that violates these boundaries, we may remove you from the event and restrict you from future 3 AM experiences." /></p>
          </section>

          <section className="t">
            <h2><em>05</em>No abusive behaviour</h2>
            <p>Keep abusive, threatening, sexually inappropriate, hateful, or degrading language out of the space.</p>
            <p className="beat">Jokes are fine.<br />Making someone the joke after they&apos;ve asked you to stop isn&apos;t.</p>
            <p>Context matters, and so does intent. If your behaviour repeatedly makes other people uncomfortable, &ldquo;I was only joking&rdquo; isn&apos;t a free pass.</p>
          </section>

          <section className="t">
            <h2><em>06</em>Photography &amp; privacy</h2>
            <p>We often take photos and short videos during events to document what the community gets up to.</p>
            <p>By attending, you understand that you may appear in this content.</p>
            <p>If you&apos;d rather not be photographed or filmed, tell the host before the event starts and we&apos;ll respect that.</p>
            <p>Please also respect the privacy of other participants. Don&apos;t photograph, record, or post someone else&apos;s personal information or private moments without their consent.</p>
          </section>

          <section className="t">
            <h2><em>07</em>Personal responsibility</h2>
            <p>We do our best to create a safe and comfortable environment, but you&apos;re responsible for your own belongings and wellbeing during the event.</p>
            <p>Keep your valuables with you and treat any equipment, materials, venues and public spaces with care.</p>
            <p>If an activity has specific safety instructions, follow them.</p>
          </section>

          <section className="t">
            <h2><em>08</em>Our right to act</h2>
            <p>We don&apos;t want to police people&apos;s personalities.</p>
            <p>We do, however, reserve the right to step in when someone&apos;s behaviour crosses a line.</p>
            <p><Pink3AM text="Depending on the situation, this may mean a warning, asking someone to stop a behaviour, removing them from the event, cancelling their participation, or restricting access to future 3 AM events." /></p>
            <p className="beat">Protecting the room comes before protecting one person&apos;s ticket.</p>
          </section>
        </div>

        <section className="ask">
          <div className="wrap">
            <h2><em>?</em>Questions</h2>
            <p>If you&apos;re unsure about anything, ask us before you book. We&apos;d rather answer a slightly awkward question now than deal with a very awkward situation later.</p>
            <a className="btn" href={`mailto:${CONTACT_EMAIL}`}>Email us</a>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap fbar">
          <div>
            <Image src="/images/white_logo.png" alt="3 AM Ideas" width={120} height={30} style={{ height: 24, width: 'auto' }} />
            <small>© {new Date().getFullYear()} 3 AM Ideas, Bangalore</small>
          </div>
          <nav>
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/event">All events</Link>
            <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}