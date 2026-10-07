"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const WHATSAPP_URL = "https://chat.whatsapp.com/B68V6Q62HZPHHsGMG0t4jP";
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzvmQy_HZOGPq1KrNg3hE8DF1NCwrwv00aFSgb8naf4Wm0FX-sV7PeeI7ijrwN2QBeT/exec';

const INTERESTS = [
  { value: 'Broken Camera Crew', label: 'Broken Camera Crew', note: 'One-day filmmaking chaos' },
  { value: 'One Day Crew',       label: 'One Day Crew',       note: 'Teams, a challenge, a deadline' },
  { value: '3 AM Community',     label: '3 AM Community',     note: 'Free meetups. The easiest way in' },
  { value: 'Anything',           label: 'Surprise me',        note: 'Tell me whatever is next' },
];

export default function JoinPage() {
  const [formData, setFormData] = useState({ name: '', whatsapp: '', interest: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  // Warn before leaving with an unsent form
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const isDirty = formData.name || formData.whatsapp || formData.interest || formData.message;
      if (isDirty && status !== 'success') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    const data = new FormData();
    data.append('name', formData.name);
    data.append('whatsapp', formData.whatsapp);
    data.append('interest', formData.interest);
    data.append('message', formData.message);

    try {
      await fetch(SCRIPT_URL, { method: 'POST', body: data, mode: 'no-cors' });
      setStatus('success');
      setFormData({ name: '', whatsapp: '', interest: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
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
        .tam .navlinks a{text-decoration:none;opacity:.85;padding:8px 2px;display:inline-block;white-space:nowrap}
        .tam .navlinks a:hover{opacity:1;color:var(--pink)}

        /* Hero */
        .tam .hero{padding-top:48px;padding-bottom:24px;text-align:center;display:flex;flex-direction:column;align-items:center}
        .tam .eyebrow{font-weight:500;color:var(--pink);font-size:15px;margin:0;letter-spacing:.04em;text-transform:uppercase}
        .tam h1{font-family:var(--display);font-weight:900;font-size:clamp(46px,12vw,140px);line-height:.92;letter-spacing:-.5px;margin:12px 0 14px}
        .tam .lede{max-width:54ch;font-size:17px;color:#222;margin:0 auto}

        /* Form */
        .tam .formwrap{border-top:2px solid var(--black);padding-top:40px;padding-bottom:56px;max-width:680px;margin-left:auto;margin-right:auto}
        .tam form{display:flex;flex-direction:column;gap:28px}
        .tam .field{display:flex;flex-direction:column;gap:8px}
        .tam .field label{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.06em}
        .tam .field .hint{font-size:13px;color:var(--grey);font-weight:400;text-transform:none;letter-spacing:0}
        .tam input[type=text],.tam input[type=tel],.tam textarea{
          font:inherit;font-size:16px;padding:13px 14px;border:2px solid var(--black);background:var(--white);color:var(--black);width:100%;border-radius:0}
        .tam textarea{resize:vertical;min-height:96px}
        .tam input::placeholder,.tam textarea::placeholder{color:#9a9a9a}
        .tam input:focus,.tam textarea:focus{outline:none;border-color:var(--pink);box-shadow:3px 3px 0 var(--pink)}

        .tam .choices{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
        .tam .choice{position:relative;display:flex;flex-direction:column;gap:2px;padding:14px;border:2px solid var(--black);cursor:pointer;background:var(--white)}
        .tam .choice input{position:absolute;opacity:0;pointer-events:none}
        .tam .choice .ttl{font-weight:600;font-size:15.5px}
        .tam .choice .note{font-size:13px;color:var(--grey)}
        .tam .choice.on{background:var(--pink);border-color:var(--pink);color:var(--white)}
        .tam .choice.on .note{color:rgba(255,255,255,.85)}
        .tam .choice input:focus-visible + .ttl{outline:3px solid var(--pink);outline-offset:3px}

        .tam .submit{font:inherit;font-weight:600;font-size:16px;padding:16px;border:2px solid var(--pink);background:var(--pink);color:var(--white);
          cursor:pointer;width:100%;border-radius:0}
        .tam .submit:disabled{opacity:.6;cursor:wait}
        .tam .err{color:var(--pink);font-weight:600;font-size:14px;margin:12px 0 0;text-align:center}
        .tam .small{font-size:13.5px;color:var(--grey);margin:0}

        /* Success panel (replaces the form, no modal) */
        .tam .done{border:2px solid var(--black);padding:36px 28px;text-align:center;box-shadow:6px 6px 0 var(--pink)}
        .tam .done h2{font-family:var(--display);font-weight:900;font-size:clamp(34px,7vw,58px);line-height:.95;margin:0 0 12px}
        .tam .done p{margin:0 auto 22px;max-width:46ch;font-size:16px}
        .tam .done .btns{display:flex;gap:12px;flex-wrap:nowrap;justify-content:center}

        /* What happens next */
        .tam .next{border-top:2px solid var(--black);padding-top:44px;padding-bottom:48px}
        .tam .h2{font-family:var(--display);font-weight:900;font-size:clamp(32px,6vw,60px);line-height:.95;margin:0 0 20px}
        .tam .steps{list-style:none;margin:0;padding:0;border-top:1px solid var(--black)}
        .tam .steps li{display:grid;grid-template-columns:44px 1fr;gap:14px;padding:16px 4px;border-bottom:1px solid var(--black);font-size:16px}
        .tam .steps b{font-family:var(--display);font-weight:900;font-size:30px;line-height:.9;color:var(--pink)}

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
          .tam .hero{padding-top:34px;padding-bottom:18px}
          .tam .eyebrow{font-size:13.5px}
          .tam .lede{font-size:15.5px}
          .tam .formwrap{padding-top:32px;padding-bottom:44px}
          .tam form{gap:24px}
          .tam .choices{grid-template-columns:1fr;gap:9px}
          .tam .choice{padding:13px}
          .tam .done{padding:28px 20px}
          .tam .done .btns{flex-direction:column}
          .tam .next{padding-top:36px;padding-bottom:40px}
          .tam .steps li{grid-template-columns:36px 1fr;gap:12px;font-size:15px}
          .tam .steps b{font-size:26px}
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
            <Link href="/about">About</Link>
            <Link href="/event">All events</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="wrap hero">
          <p className="eyebrow">Join the community</p>
          <h1>Get on the list</h1>
          <p className="lede">Leave your details and we&apos;ll message you on WhatsApp when the next thing opens up. No spam, no newsletters.</p>
        </section>

        <section className="wrap formwrap">
          {status === 'success' ? (
            <div className="done">
              <h2>You&apos;re on the list</h2>
              <p>We&apos;ve got your details. We&apos;ll message you on WhatsApp when the next one opens up. Want it sooner? The community group gets everything first.</p>
              <div className="btns">
                <a className="btn dark" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Join WhatsApp</a>
                <Link className="btn pink" href="/event">See all events</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Your name</label>
                <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required
                       autoComplete="name" placeholder="What should we call you?" />
              </div>

              <div className="field">
                <label htmlFor="whatsapp">WhatsApp number</label>
                <input id="whatsapp" type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} required
                       autoComplete="tel" inputMode="tel" placeholder="+91 00000 00000" />
                <span className="hint">This is the only way we&apos;ll reach you.</span>
              </div>

              <div className="field">
                <label>What pulls you in?</label>
                <div className="choices">
                  {INTERESTS.map(opt => (
                    <label key={opt.value} className={`choice ${formData.interest === opt.value ? 'on' : ''}`}>
                      <input type="radio" name="interest" value={opt.value} required
                             checked={formData.interest === opt.value} onChange={handleChange} />
                      <span className="ttl">{opt.label}</span>
                      <span className="note">{opt.note}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="field">
                <label htmlFor="message">Anything you want to say? <span className="hint">(optional)</span></label>
                <textarea id="message" name="message" rows="3" value={formData.message} onChange={handleChange}
                          placeholder="A thought, a question, or what brought you here…"></textarea>
              </div>

              <div>
                <button className="submit" type="submit" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Sending…' : 'Send my details'}
                </button>
                {status === 'error' && (
                  <p className="err">That didn&apos;t go through. Try again, or message us on WhatsApp.</p>
                )}
              </div>
            </form>
          )}
        </section>

        <section className="wrap next">
          <h2 className="h2">What happens next</h2>
          <ol className="steps">
            <li><b>1</b><span>We save your details. Nothing goes out publicly, and we don&apos;t share your number.</span></li>
            <li><b>2</b><span>When something opens that matches what you picked, we message you on WhatsApp.</span></li>
            <li><b>3</b><span>You decide then. Being on the list doesn&apos;t commit you to anything.</span></li>
          </ol>
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