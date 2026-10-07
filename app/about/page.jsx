"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const WHATSAPP_URL = "https://chat.whatsapp.com/B68V6Q62HZPHHsGMG0t4jP";

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

export default function AboutPage() {
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
        .tam .wrap{max-width:1180px;margin:0 auto;padding:0 24px;width:100%}

        /* Header */
        .tam .top{position:sticky;top:0;z-index:60;background:var(--black);color:var(--white);padding-top:env(safe-area-inset-top,0px)}
        .tam .bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:16px;padding-bottom:16px;min-height:64px}
        .tam .navlinks{display:flex;align-items:center;gap:20px;font-size:16px;font-weight:500;flex:0 0 auto}
        .tam .navlinks a,.tam .navlinks button{text-decoration:none;opacity:.85;padding:8px 2px;display:inline-block;white-space:nowrap;
          background:none;border:0;color:inherit;font:inherit;cursor:pointer}
        .tam .navlinks a:hover,.tam .navlinks button:hover{opacity:1;color:var(--pink)}

        /* Hero */
        .tam .hero{padding-top:48px;padding-bottom:28px;text-align:center;display:flex;flex-direction:column;align-items:center}
        .tam .eyebrow{font-weight:500;color:var(--pink);font-size:15px;margin:0;letter-spacing:.04em;text-transform:uppercase}
        .tam h1{font-family:var(--display);font-weight:900;font-size:clamp(46px,12vw,150px);line-height:.92;letter-spacing:-.5px;margin:12px 0 0}

        /* Body copy */
        .tam .story{border-top:2px solid var(--black);padding-top:48px;padding-bottom:48px;max-width:68ch;margin-left:auto;margin-right:auto}
        .tam .story p{margin:0 0 16px;font-size:17px}
        .tam .story p.lead{font-size:21px;font-weight:500;line-height:1.45}
        .tam .pull{border-left:5px solid var(--pink);padding:4px 0 4px 18px;margin:28px 0;font-family:var(--display);font-weight:900;
          font-size:clamp(26px,4.5vw,40px);line-height:1.08}

        /* Formats */
        .tam .formats-wrap{border-top:2px solid var(--black);padding-top:48px;padding-bottom:48px}
        .tam .h2{font-family:var(--display);font-weight:900;font-size:clamp(34px,6vw,64px);line-height:.95;margin:0 0 20px}
        .tam .formats{border-top:1px solid var(--black)}
        .tam .fmt{border-bottom:1px solid var(--black)}
        .tam .fmt.plain{display:grid;grid-template-columns:220px 1fr;gap:12px;padding:16px 4px;font-size:16px}
        .tam .fmt.plain strong{font-weight:600}
        .tam .fmt > summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px 4px;font-size:16px}
        .tam .fmt > summary::-webkit-details-marker{display:none}
        .tam .fmt > summary strong{font-weight:600;margin-right:6px}
        .tam .fmt .plus{flex:0 0 auto;font-size:22px;font-weight:400;line-height:1;transition:transform .25s ease}
        .tam .fmt[open] .plus{transform:rotate(45deg)}
        .tam .fmt-body{padding:0 4px 20px;font-size:15.5px;max-width:64ch}
        .tam .fmt-body p{margin:0 0 12px}

        /* Signature + CTA */
        .tam .sign{border-top:2px solid var(--black);padding-top:40px;padding-bottom:48px;display:flex;justify-content:space-between;
          align-items:flex-end;gap:24px;flex-wrap:wrap}
        .tam .sign .who{font-family:var(--display);font-weight:900;font-size:clamp(24px,3.5vw,34px);line-height:1.05;margin:0}
        .tam .sign .note{margin:8px 0 0;font-size:15px;color:var(--grey)}
        .tam .btns{display:flex;gap:12px;flex-wrap:nowrap}
        .tam .btn{flex:1 1 0;display:inline-block;padding:14px 20px;font-weight:600;font-size:15px;text-decoration:none;
          border:2px solid var(--black);text-align:center;white-space:nowrap}
        .tam .btn.pink{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .btn.dark{background:var(--black);border-color:var(--black);color:var(--white)}

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
          .tam .hero{padding-top:34px;padding-bottom:20px}
          .tam .eyebrow{font-size:13.5px}
          .tam .story{padding-top:36px;padding-bottom:36px}
          .tam .story p{font-size:16px}
          .tam .story p.lead{font-size:18.5px}
          .tam .pull{margin:22px 0;padding-left:14px;border-left-width:4px}
          .tam .formats-wrap{padding-top:36px;padding-bottom:36px}
          .tam .fmt.plain{grid-template-columns:1fr;gap:3px;font-size:15px;padding:14px 4px}
          .tam .fmt > summary{font-size:15px;padding:14px 4px}
          .tam .fmt-body{font-size:15px;padding:0 4px 18px}
          .tam .sign{padding-top:32px;padding-bottom:40px;flex-direction:column;align-items:flex-start}
          .tam .btns{width:100%}
          .tam .btn{padding:14px 10px;font-size:14px}
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
        <section className="wrap hero">
          <p className="eyebrow">The story</p>
          <h1>What is <span className="brand">3 AM</span>?</h1>
        </section>

        <section className="wrap story">
          {ABOUT_COPY.map((p, i) => (
            <p key={i} className={i === 0 ? 'lead' : undefined}><Pink3AM text={p} /></p>
          ))}

          <p className="pull">Some ideas are too good to sleep on.</p>

          {/* TODO: if you want the Al-Musawwir origin story here, tell me the exact wording
              and I'll add it — I didn't want to write your history for you. */}
        </section>

        <section className="wrap formats-wrap">
          <h2 className="h2">The formats</h2>
          <div className="formats">
            <details className="fmt">
              <summary>
                <span><strong>3 AM Community</strong> — Free meetups. The easiest way in.</span>
                <span className="plus">+</span>
              </summary>
              <div className="fmt-body">{COMMUNITY_COPY.map((p, i) => <p key={i}><Pink3AM text={p} /></p>)}</div>
            </details>

            <div className="fmt plain"><strong>One Day Crew</strong><span>Teams, a challenge, a deadline. You run it.</span></div>

            <details className="fmt">
              <summary>
                <span><strong>Broken Camera Crew</strong> — Our signature one-day filmmaking chaos.</span>
                <span className="plus">+</span>
              </summary>
              <div className="fmt-body">{BCC_COPY.map((p, i) => <p key={i}><Pink3AM text={p} /></p>)}</div>
            </details>

            <div className="fmt plain"><strong>Creative experiences</strong><span>Deeper, hands-on sessions.</span></div>
          </div>
        </section>

        <section className="wrap sign">
          <div>
            <p className="who">— Nazim &amp; the <span className="brand">3 AM</span> team</p>
            <p className="note">Questions, ideas, or you just want to say hi? Come find us.</p>
          </div>
          <div className="btns">
            <a className="btn dark" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Join WhatsApp</a>
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
            <Link href="/">Home</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
            <a href="mailto:wearemusawwir@gmail.com">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}