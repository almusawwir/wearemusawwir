"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const WHATSAPP_URL = "https://chat.whatsapp.com/Gdb1lik7MQy1fjjz03O3OR";

function Pink3AM({ text }) {
  const parts = text.split(/(3 AM)/g);
  return parts.map((part, i) =>
    part === '3 AM' ? <span key={i} className="brand">3 AM</span> : <React.Fragment key={i}>{part}</React.Fragment>
  );
}

const INTRO = [
  "3 AM is a creative community for people who want to make things, try things, meet people, and occasionally do something that makes absolutely no sense on paper.",
  "We bring curious people together through filmmaking, music, writing, art, conversations, games, experiments, and whatever idea we can't stop thinking about.",
];

const NEEDS = [
  "You don't need to be an artist.",
  "You don't need a portfolio.",
  "You don't need to know anyone.",
];

const OUTRO = [
  "You just need to be curious enough to show up.",
  "Some experiences are free. Some are curated. Some are chaotic. Some ask you to make something. Some simply give you a few hours with people you wouldn't have met otherwise.",
  "There isn't one way to do 3 AM.",
  "That's kind of the point.",
];

const FORMATS = [
  {
    name: '3 AM Community',
    line: 'The easiest way in.',
    body: [
      "Free, low-pressure meetups for anyone curious about the people behind 3 AM.",
      "Come alone. Come with a friend. Walk around, talk, make something, grab food, or just exist around interesting people for a few hours.",
      "No ticket. No audition. No networking script.",
      "Just people.",
    ],
  },
  {
    name: 'One Day Crew',
    line: 'A team. A challenge. A deadline. Your move.',
    body: [
      "You get a small crew, a creative brief, and enough time to make something.",
      "You choose how to do it.",
      "Less workshop. More side quest.",
    ],
  },
  {
    name: 'Broken Camera Crew',
    line: 'Our signature one-day filmmaking chaos.',
    body: [
      "You arrive without a crew.",
      "We bring people together, give you a story, build teams, figure out the roles, find the locations, and start shooting.",
      "You don't need filmmaking experience. You don't even need to know what role you want.",
      "You might direct. You might act. You might write. You might hold the camera. You might end up asking strangers ridiculous questions for the paper department.",
      "The point isn't to make a perfect film.",
      "The point is to spend a day making something with people you met that morning.",
      "Broken camera. Working imagination.",
    ],
  },
  {
    name: 'Creative Experiences',
    line: 'For when an idea needs a little more time.',
    body: [
      "Painting. Music. Writing. Conversations. Experiments. Weird little concepts that don't fit anywhere else.",
      "Different format. Same philosophy.",
      "Come curious. Leave with a story.",
    ],
  },
];

export default function AboutPage() {
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
        .tam .wrap{max-width:1000px;margin:0 auto;padding:0 24px;width:100%}

        .tam .top{position:sticky;top:0;z-index:60;background:var(--black);color:var(--white);padding-top:env(safe-area-inset-top,0px)}
        .tam .bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:16px;padding-bottom:16px;min-height:64px}
        .tam .navlinks{display:flex;align-items:center;gap:20px;font-size:16px;font-weight:500;flex:0 0 auto}
        .tam .navlinks a,.tam .navlinks button{text-decoration:none;opacity:.85;padding:8px 2px;display:inline-block;white-space:nowrap;
          background:none;border:0;color:inherit;font:inherit;cursor:pointer}
        .tam .navlinks a:hover,.tam .navlinks button:hover{opacity:1;color:var(--pink)}

        .tam .hero{padding-top:48px;padding-bottom:26px;text-align:center;display:flex;flex-direction:column;align-items:center}
        .tam .eyebrow{font-weight:500;color:var(--pink);font-size:14px;margin:0;letter-spacing:.06em;text-transform:uppercase}
        .tam h1{font-family:var(--display);font-weight:900;font-size:clamp(46px,12vw,140px);line-height:.92;letter-spacing:-.5px;margin:12px 0 0}

        .tam .story{border-top:2px solid var(--black);padding-top:44px;padding-bottom:44px;max-width:68ch;margin-left:auto;margin-right:auto}
        .tam .story p{margin:0 0 16px;font-size:17px}
        .tam .story p.lead{font-size:20px;font-weight:500;line-height:1.5}
        .tam .needs{margin:22px 0;padding:0;list-style:none}
        .tam .needs li{font-family:var(--display);font-weight:900;font-size:clamp(22px,4vw,32px);line-height:1.12;margin-bottom:2px}
        .tam .beat{font-family:var(--display);font-weight:900;font-size:clamp(24px,4.5vw,38px);line-height:1.1;margin:4px 0 16px}
        .tam .pull{border-left:5px solid var(--pink);padding:6px 0 6px 18px;margin:30px 0 0;font-family:var(--display);font-weight:900;
          font-size:clamp(26px,5vw,44px);line-height:1.05}

        .tam .formats-wrap{border-top:2px solid var(--black);padding-top:44px;padding-bottom:44px}
        .tam .h2{font-family:var(--display);font-weight:900;font-size:clamp(34px,6vw,64px);line-height:.95;margin:0 0 20px}
        .tam .formats{border-top:1px solid var(--black)}
        .tam .fmt{border-bottom:1px solid var(--black)}
        .tam .fmt > summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px 4px;font-size:16px}
        .tam .fmt > summary::-webkit-details-marker{display:none}
        .tam .fmt > summary strong{font-weight:600;margin-right:6px}
        .tam .fmt .plus{flex:0 0 auto;font-size:22px;font-weight:400;line-height:1;transition:transform .25s ease}
        .tam .fmt[open] .plus{transform:rotate(45deg)}
        .tam .fmt-body{padding:0 4px 22px;font-size:15.5px;max-width:64ch}
        .tam .fmt-body p{margin:0 0 12px}

        .tam .sign{border-top:2px solid var(--black);padding-top:40px;padding-bottom:48px}
        .tam .sign p{margin:0 0 14px;font-size:17px;max-width:56ch}
        .tam .sign .big{font-family:var(--display);font-weight:900;font-size:clamp(26px,5vw,42px);line-height:1.1;margin-bottom:18px}
        .tam .who{font-family:var(--display);font-weight:900;font-size:clamp(20px,3.5vw,28px);margin:26px 0 22px}
        .tam .btns{display:flex;gap:12px;flex-wrap:nowrap;max-width:520px}
        .tam .btn{flex:1 1 0;display:inline-block;padding:14px 20px;font-weight:600;font-size:15px;text-decoration:none;
          border:2px solid var(--black);text-align:center;white-space:nowrap}
        .tam .btn.pink{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .btn.dark{background:var(--black);border-color:var(--black);color:var(--white)}

        .tam footer{background:var(--black);color:var(--white);padding:36px 0 calc(40px + env(safe-area-inset-bottom,0px))}
        .tam footer .fbar{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap}
        .tam footer .fline{margin:12px 0 0;max-width:40ch;color:#bdbdbd;font-size:15px}
        .tam footer nav{display:flex;gap:20px;flex-wrap:wrap;font-size:15px}
        .tam footer small{display:block;color:#8d8d8d;margin-top:18px;font-size:13px}

        @media (max-width:820px){
          .tam .wrap{padding:0 20px}
          .tam .bar{padding-top:14px;padding-bottom:14px;min-height:60px}
          .tam .navlinks{gap:16px;font-size:14.5px}
          .tam .hero{padding-top:34px;padding-bottom:20px}
          .tam .story{padding-top:34px;padding-bottom:34px}
          .tam .story p{font-size:16px}
          .tam .story p.lead{font-size:17.5px}
          .tam .pull{margin-top:24px;padding-left:14px;border-left-width:4px}
          .tam .formats-wrap{padding-top:34px;padding-bottom:34px}
          .tam .fmt > summary{font-size:15px;padding:16px 4px}
          .tam .fmt-body{font-size:15px;padding:0 4px 18px}
          .tam .sign{padding-top:32px;padding-bottom:40px}
          .tam .sign p{font-size:16px}
          .tam .btns{width:100%;flex-direction:column;max-width:none}
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
          <p className="eyebrow">The story</p>
          <h1>What is <span className="brand">3 AM</span>?</h1>
        </section>

        <section className="wrap story">
          {INTRO.map((p, i) => (
            <p key={i} className={i === 0 ? 'lead' : undefined}><Pink3AM text={p} /></p>
          ))}

          <ul className="needs">
            {NEEDS.map((n, i) => <li key={i}>{n}</li>)}
          </ul>

          <p className="beat">{OUTRO[0]}</p>
          <p>{OUTRO[1]}</p>
          <p className="beat"><Pink3AM text={OUTRO[2]} /></p>
          <p>{OUTRO[3]}</p>

          <p className="pull">Some ideas are too good to sleep on.</p>
        </section>

        <section className="wrap formats-wrap">
          <h2 className="h2">The formats</h2>
          <div className="formats">
            {FORMATS.map((f) => (
              <details className="fmt" key={f.name}>
                <summary>
                  <span><strong>{f.name}</strong> — {f.line}</span>
                  <span className="plus">+</span>
                </summary>
                <div className="fmt-body">
                  {f.body.map((p, i) => <p key={i}><Pink3AM text={p} /></p>)}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="wrap sign">
          <h2 className="h2">Come find us</h2>
          <p className="big"><Pink3AM text="3 AM is built one idea, one event, and one strange conversation at a time." /></p>
          <p>If you&apos;re wondering whether you belong here, you probably do.</p>
          <p className="who">— Zimzim &amp; the <span className="brand">3 AM</span> team</p>
          <div className="btns">
            <a className="btn dark" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Join WhatsApp</a>
            <Link className="btn pink" href="/event">See all events</Link>
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
            <Link href="/terms">Terms &amp; Conditions</Link>
            <a href="mailto:wearemusawwir@gmail.com">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}