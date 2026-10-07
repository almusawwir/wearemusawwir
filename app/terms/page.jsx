"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length <= 2) {
      router.push('/');
    } else {
      router.back();
    }
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
        .tam .wrap{max-width:860px;margin:0 auto;padding:0 24px;width:100%}

        /* Header */
        .tam .top{position:sticky;top:0;z-index:60;background:var(--black);color:var(--white);padding-top:env(safe-area-inset-top,0px)}
        .tam .bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:16px;padding-bottom:16px;min-height:64px}
        .tam .navlinks{display:flex;align-items:center;gap:20px;font-size:16px;font-weight:500;flex:0 0 auto}
        .tam .navlinks a,.tam .navlinks button{text-decoration:none;opacity:.85;padding:8px 2px;display:inline-block;white-space:nowrap;
          background:none;border:0;color:inherit;font:inherit;cursor:pointer}
        .tam .navlinks a:hover,.tam .navlinks button:hover{opacity:1;color:var(--pink)}

        /* Hero */
        .tam .hero{padding-top:44px;padding-bottom:26px}
        .tam .eyebrow{font-weight:500;color:var(--pink);font-size:14px;margin:0;letter-spacing:.04em;text-transform:uppercase}
        .tam h1{font-family:var(--display);font-weight:900;font-size:clamp(40px,10vw,110px);line-height:.94;letter-spacing:-.5px;margin:10px 0 12px}
        .tam .updated{font-size:14px;color:var(--grey);margin:0}

        /* Sections */
        .tam .terms{border-top:2px solid var(--black);padding-top:10px;padding-bottom:56px}
        .tam section{border-bottom:1px solid var(--black);padding:26px 0}
        .tam section:last-child{border-bottom:0}
        .tam h2{font-family:var(--display);font-weight:900;font-size:clamp(24px,4.5vw,34px);line-height:1.05;margin:0 0 12px;
          display:flex;align-items:baseline;gap:12px}
        .tam h2 em{font-style:normal;color:var(--pink);flex:0 0 auto}
        .tam section p{margin:0 0 12px;max-width:66ch;font-size:16px}
        .tam section p:last-child{margin-bottom:0}
        .tam section strong{font-weight:600}
        .tam .flag{border-left:5px solid var(--pink);padding:2px 0 2px 16px;margin:14px 0;font-weight:500}

        /* Contact strip */
        .tam .contact{border-top:2px solid var(--black);padding-top:32px;padding-bottom:48px;display:flex;justify-content:space-between;
          align-items:center;gap:20px;flex-wrap:wrap}
        .tam .contact p{margin:0;max-width:46ch;font-size:16px}
        .tam .contact .h3{font-family:var(--display);font-weight:900;font-size:clamp(24px,4vw,34px);line-height:1.05;margin:0 0 8px}
        .tam .btn{display:inline-block;padding:14px 22px;font-weight:600;font-size:15px;text-decoration:none;border:2px solid var(--black);
          text-align:center;white-space:nowrap;background:var(--pink);border-color:var(--pink);color:var(--white)}

        /* Footer */
        .tam footer{background:var(--black);color:var(--white);padding:32px 0 calc(40px + env(safe-area-inset-bottom,0px))}
        .tam footer .bar{flex-wrap:wrap;align-items:flex-start;min-height:auto}
        .tam footer nav{display:flex;gap:20px;flex-wrap:wrap;font-size:15px}
        .tam footer small{display:block;color:#9a9a9a;margin-top:10px;font-size:13px}

        /* Mobile */
        @media (max-width:820px){
          .tam .wrap{padding:0 20px}
          .tam .bar{padding-top:14px;padding-bottom:14px;min-height:60px;gap:10px}
          .tam .navlinks{gap:16px;font-size:14.5px}
          .tam .hero{padding-top:32px;padding-bottom:20px}
          .tam section{padding:22px 0}
          .tam section p{font-size:15.5px}
          .tam h2{gap:10px}
          .tam .flag{padding-left:13px;border-left-width:4px}
          .tam .contact{padding-top:28px;padding-bottom:40px;flex-direction:column;align-items:flex-start}
          .tam .btn{width:100%}
          .tam footer nav{gap:16px;margin-top:16px}
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
        <section className="wrap hero" style={{ borderBottom: 0 }}>
          <p className="eyebrow">The fine print</p>
          <h1>Terms &amp; guidelines</h1>
          {/* TODO: update this date whenever you change the terms */}
          <p className="updated">Last updated: October 2026</p>
        </section>

        <div className="wrap terms">
          <section>
            <h2><em>01</em>Booking &amp; capacity</h2>
            <p>Our events are intentionally limited in capacity, so every spot matters.</p>
            <p>Your spot is confirmed only after full payment has been received and your digital ticket has been issued. If you want to transfer your ticket to someone else, let us know in advance.</p>
          </section>

          <section>
            <h2><em>02</em>Cancellation &amp; refunds</h2>
            <p>Because materials, venues and arrangements are prepared based on confirmed attendance, <strong>we&apos;re unable to offer refunds</strong> for no-shows or last-minute cancellations.</p>
            <p className="flag">Paid by mistake? You can request a cancellation within <strong>30 minutes of booking</strong> by contacting us directly.</p>
          </section>

          <section>
            <h2><em>03</em>Community guidelines</h2>
            <p><span className="brand">3 AM</span> is built as a respectful, welcoming, judgment-free space. Ideas can be challenged. People can&apos;t.</p>
            <p>We ask everyone to treat the venue, the materials and each other with care. Any harassment, disruptive behaviour or disrespect toward participants or organisers may result in removal from the event without a refund.</p>
          </section>

          <section>
            <h2><em>04</em>Photography &amp; privacy</h2>
            <p>We often take photos and short videos during events to document and share what the community gets up to.</p>
            <p>By attending, you consent to being photographed or filmed. If you&apos;d rather not appear in any of it, quietly tell the host before the session starts and we&apos;ll fully respect that.</p>
          </section>

          <section>
            <h2><em>05</em>Personal responsibility</h2>
            <p>We do our best to create a safe and comfortable environment, but you remain responsible for your own belongings and wellbeing during the event.</p>
            <p>Please handle any equipment or materials responsibly, and keep your valuables with you.</p>
          </section>
        </div>

        <div className="wrap contact">
          <div>
            <p className="h3">Questions about any of this?</p>
            <p>Message us before you book. We&apos;d rather answer than have you guess.</p>
          </div>
          <a className="btn" href="mailto:wearemusawwir@gmail.com">Email us</a>
        </div>
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
            <Link href="/event">All events</Link>
            <a href="mailto:wearemusawwir@gmail.com">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}