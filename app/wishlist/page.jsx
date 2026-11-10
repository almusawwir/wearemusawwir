"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const WHATSAPP_URL = "https://chat.whatsapp.com/B68V6Q62HZPHHsGMG0t4jP";
// Paste the Web app URL from Google Apps Script here (it ends in /exec)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz10y-HO8K-etRAgkc73HiezHKA2iSrPLbg69nbuzvLbpCgwvR9dGfKLb2DNACKGuLTpg/exec';

const INTERESTS = [
  'Filmmaking events',
  'Art and craft events',
  'Socialising and meeting people',
  'Music and performances',
  'Experiencing new things',
  'Something else',
];
const TIMELINE = ['Very soon', 'Sometime this month', 'Next month', 'Maybe in 2–3 months', 'Not sure yet'];
const LOCATIONS = ['Indiranagar', 'HSR Layout', 'Koramangala', 'JP Nagar', 'MG Road'];
const BUDGETS = ['₹300+', '₹500+', '₹700+', '₹1,000+'];

const ORDER = ['name', 'whatsapp', 'interests', 'timeline', 'locations', 'budget', 'consent'];
const TOTAL = ORDER.length;
const MESSAGES = {
  name: 'Tell us your name.',
  whatsapp: 'Enter a valid WhatsApp number.',
  interests: 'Pick at least one.',
  timeline: 'Pick one.',
  locations: 'Pick at least one.',
  budget: 'Pick one.',
  consent: 'We need a yes to message you.',
};
const EMPTY = {
  name: '', whatsapp: '', interests: [], timeline: '', locations: [],
  budget: '', notes: '', consent: false, company: '',
};

export default function WishlistPage() {
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const digits = f.whatsapp.replace(/\D/g, '');
  const done = {
    name: f.name.trim().length > 0,
    whatsapp: digits.length >= 10 && digits.length <= 13,
    interests: f.interests.length > 0,
    timeline: !!f.timeline,
    locations: f.locations.length > 0,
    budget: !!f.budget,
    consent: f.consent,
  };
  const answered = ORDER.filter(k => done[k]).length;
  const pct = status === 'success' ? 100 : Math.round((answered / TOTAL) * 100);

  const clearErr = (k) => setErrors(prev => (prev[k] ? { ...prev, [k]: undefined } : prev));
  const setField = (k, v) => { setF(prev => ({ ...prev, [k]: v })); clearErr(k); };
  const toggle = (k, v) => {
    setF(prev => ({
      ...prev,
      [k]: prev[k].includes(v) ? prev[k].filter(x => x !== v) : [...prev[k], v],
    }));
    clearErr(k);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (status === 'loading') return;

    const errs = {};
    ORDER.forEach(k => { if (!done[k]) errs[k] = MESSAGES[k]; });
    setErrors(errs);

    const first = ORDER.find(k => errs[k]);
    if (first) {
      const el = document.getElementById(`q-${first}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = el.querySelector('input[type=text], input[type=tel]');
        if (input) input.focus({ preventScroll: true });
      }
      return;
    }

    if (SCRIPT_URL.includes('PASTE_')) {
      console.error('Wishlist form: SCRIPT_URL is not set yet.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    const data = new FormData();
    data.append('name', f.name.trim());
    data.append('whatsapp', f.whatsapp.trim());
    data.append('interests', f.interests.join(', '));
    data.append('timeline', f.timeline);
    data.append('locations', f.locations.join(', '));
    data.append('budget', f.budget);
    data.append('notes', f.notes.trim());
    data.append('consent', 'Yes');
    data.append('source', 'wishlist-page');
    data.append('company', f.company); // honeypot

    try {
      await fetch(SCRIPT_URL, { method: 'POST', body: data, mode: 'no-cors' });
      setStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Wishlist submit failed:', err);
      setStatus('error');
    }
  };

  const renderChoice = ({ key, num, title, note, options, multi }) => (
    <fieldset className="q" id={`q-${key}`}>
      <legend><em>{num}</em>{title}{note && <span className="note">{note}</span>}</legend>
      <div className="chips">
        {options.map(opt => {
          const on = multi ? f[key].includes(opt) : f[key] === opt;
          return (
            <label className="chip" key={opt}>
              <input type={multi ? 'checkbox' : 'radio'} name={key} value={opt} checked={on}
                     onChange={() => (multi ? toggle(key, opt) : setField(key, opt))} />
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
      {errors[key] && <p className="err" role="alert">{errors[key]}</p>}
    </fieldset>
  );

  return (
    <div className="tam">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Instrument+Sans:wght@400;500;600&display=swap');

        html,body{margin:0;padding:0;width:100%;max-width:100%}
        html{scroll-behavior:smooth;background:#000}
        .tam{
          min-width:0;
          --pink:#FF0065; --black:#000; --white:#fff; --grey:#9a9a9a;
          --display:"Big Shoulders Display","Arial Narrow",Impact,sans-serif;
          --body:"Instrument Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
          font-family:var(--body); background:var(--black); color:var(--white);
          line-height:1.55; font-size:17px; width:100%; max-width:100vw; min-height:100vh;
          overflow-x:hidden; overflow-x:clip;
        }
        .tam *{box-sizing:border-box}
        .tam a{color:inherit}
        .tam .brand{color:var(--pink)}
        .tam :focus-visible{outline:3px solid var(--white);outline-offset:3px}
        .tam .col{max-width:640px;margin:0 auto;padding:0 24px;width:100%}

        /* Header with progress bar */
        .tam .top{position:sticky;top:0;z-index:60;background:var(--black);padding-top:env(safe-area-inset-top,0px)}
        .tam .bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:14px;padding-bottom:14px;min-height:60px}
        .tam .barright{display:flex;align-items:center;gap:18px;font-size:15px;font-weight:500}
        .tam .barright a{text-decoration:none;opacity:.85;padding:8px 2px}
        .tam .barright a:hover{opacity:1;color:var(--pink)}
        .tam .count{font-weight:600;color:var(--pink);min-width:36px;text-align:right}
        .tam .prog{height:4px;background:#262626}
        .tam .prog i{display:block;height:100%;background:var(--pink);transition:width .35s cubic-bezier(.33,1,.68,1)}

        /* Intro */
        .tam .intro{padding-top:34px;padding-bottom:6px}
        .tam h1{font-family:var(--display);font-weight:900;font-size:clamp(42px,11vw,88px);line-height:.94;letter-spacing:-.5px;margin:0 0 16px}
        .tam .intro p{margin:0 0 10px;font-size:16px;color:#d6d6d6;max-width:52ch}
        .tam .intro p.last{color:var(--white);font-weight:600}

        /* Form */
        .tam form{display:flex;flex-direction:column;gap:32px;padding-top:26px;padding-bottom:56px}
        .tam .q{border:0;margin:0;padding:0;min-width:0;display:block}
        .tam .q label.ql,.tam .q legend{display:block;padding:0;margin:0 0 14px;font-size:17.5px;font-weight:600;line-height:1.3}
        .tam .q em{font-style:normal;font-family:var(--display);font-weight:900;font-size:24px;color:var(--pink);margin-right:10px}
        .tam .note{display:block;margin:4px 0 0 34px;font-size:13.5px;font-weight:400;color:var(--grey)}
        .tam input[type=text],.tam input[type=tel],.tam textarea{
          font:inherit;font-size:16px;padding:14px;border:2px solid var(--white);background:#0b0b0b;color:var(--white);width:100%;border-radius:0}
        .tam textarea{resize:vertical;min-height:100px}
        .tam input::placeholder,.tam textarea::placeholder{color:#777}
        .tam input[type=text]:focus,.tam input[type=tel]:focus,.tam textarea:focus{outline:none;border-color:var(--pink);box-shadow:3px 3px 0 var(--pink)}
        .tam .err{margin:10px 0 0;color:var(--pink);font-weight:600;font-size:14px}

        /* Choice chips */
        .tam .chips{display:flex;flex-wrap:wrap;gap:10px}
        .tam .chip{position:relative;cursor:pointer;display:inline-block}
        .tam .chip input{position:absolute;opacity:0;width:1px;height:1px;pointer-events:none}
        .tam .chip span{display:inline-block;padding:12px 16px;border:2px solid var(--white);font-weight:500;font-size:15.5px;
          line-height:1.2;min-height:46px;user-select:none;-webkit-user-select:none;transition:background .15s ease,border-color .15s ease}
        .tam .chip input:checked + span{background:var(--pink);border-color:var(--pink);color:var(--white);font-weight:600}
        .tam .chip input:focus-visible + span{outline:3px solid var(--white);outline-offset:3px}
        @media (hover:hover){ .tam .chip span:hover{border-color:var(--pink)} }

        /* Consent */
        .tam .consent{display:flex;align-items:flex-start;gap:12px;cursor:pointer;font-size:16px;font-weight:500}
        .tam .consent input{width:24px;height:24px;flex:0 0 auto;margin:1px 0 0;accent-color:var(--pink)}

        .tam .submit{width:100%;font:inherit;font-weight:600;font-size:16.5px;padding:17px;min-height:56px;border:2px solid var(--pink);
          background:var(--pink);color:var(--white);cursor:pointer;border-radius:0}
        .tam .submit:disabled{opacity:.6;cursor:wait}
        .tam .formerr{margin:12px 0 0;color:var(--pink);font-weight:600;font-size:14.5px;text-align:center}
        .tam .tiny{margin:14px 0 0;font-size:13px;color:var(--grey);text-align:center}

        /* Honeypot (hidden from people) */
        .tam .hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none}

        /* Success */
        .tam .donewrap{padding-top:70px;padding-bottom:70px}
        .tam .done h2{font-family:var(--display);font-weight:900;font-size:clamp(40px,10vw,78px);line-height:.98;margin:0 0 26px}
        .tam .btns{display:flex;gap:12px;flex-wrap:nowrap}
        .tam .btn{flex:1 1 0;display:inline-block;padding:14px 16px;font-weight:600;font-size:15px;text-decoration:none;
          border:2px solid var(--white);text-align:center;white-space:nowrap;color:var(--white)}
        .tam .btn.pink{background:var(--pink);border-color:var(--pink)}

        /* Footer */
        .tam footer{border-top:1px solid #222;padding-top:28px;padding-bottom:calc(36px + env(safe-area-inset-bottom,0px))}
        .tam .fnav{display:flex;gap:20px;flex-wrap:wrap;font-size:15px;color:#bdbdbd}
        .tam .fnav a{text-decoration:none}
        .tam .fnav a:hover{color:var(--pink)}
        .tam footer small{display:block;margin-top:14px;color:#777;font-size:13px}

        @media (max-width:820px){
          .tam .col{padding:0 20px}
          .tam .intro{padding-top:26px}
          .tam .intro p{font-size:15.5px}
          .tam form{gap:28px;padding-top:22px}
          .tam .note{margin-left:34px}
          .tam .donewrap{padding-top:46px;padding-bottom:50px}
          .tam .btns{flex-direction:column}
        }
        @media (max-width:360px){ .tam .col{padding:0 16px} }
        @media (prefers-reduced-motion:reduce){
          html{scroll-behavior:auto}
          .tam .prog i,.tam .chip span{transition:none}
        }
      `}} />

      <header className="top">
        <div className="col bar">
          <Link href="/" aria-label="3 AM Ideas home" style={{ display: 'flex', alignItems: 'center' }}>
            <Image src="/images/white_logo.png" alt="3 AM Ideas" width={130} height={32} priority style={{ height: 28, width: 'auto' }} />
          </Link>
          <div className="barright">
            <Link href="/">← Home</Link>
            <span className="count" aria-live="polite">{status === 'success' ? 'Done' : `${answered}/${TOTAL}`}</span>
          </div>
        </div>
        <div className="prog" role="progressbar" aria-label="Form progress" aria-valuemin={0} aria-valuemax={TOTAL} aria-valuenow={answered}>
          <i style={{ width: `${pct}%` }} />
        </div>
      </header>

      <main>
        {status === 'success' ? (
          <div className="done donewrap">
            <div className="col">
              <h2>You&apos;re on our radar now. See you at <span className="brand">3 AM</span>!</h2>
              <div className="btns">
                <a className="btn pink" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Join WhatsApp</a>
                <Link className="btn" href="/event">See all events</Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <section className="intro">
              <div className="col">
                <h1>Get closer to <span className="brand">3 AM</span> Ideas</h1>
                <p>We&apos;re building a community for people who love filmmaking, creativity, music, and meeting interesting people.</p>
                <p>We&apos;d love to know what you&apos;re interested in so we can keep you updated about events and experiences that you&apos;d actually enjoy.</p>
                <p className="last">This will take less than 30 seconds. Let&apos;s get to know you!</p>
              </div>
            </section>

            <div className="col">
              <form onSubmit={submit} noValidate>
                <div className="q" id="q-name">
                  <label className="ql" htmlFor="name"><em>1</em>What&apos;s your name?</label>
                  <input id="name" type="text" value={f.name} autoComplete="name" maxLength={80}
                         onChange={(e) => setField('name', e.target.value)} />
                  {errors.name && <p className="err" role="alert">{errors.name}</p>}
                </div>

                <div className="q" id="q-whatsapp">
                  <label className="ql" htmlFor="whatsapp"><em>2</em>What&apos;s your WhatsApp number?</label>
                  <input id="whatsapp" type="tel" value={f.whatsapp} autoComplete="tel" inputMode="tel"
                         placeholder="+91 00000 00000" maxLength={20}
                         onChange={(e) => setField('whatsapp', e.target.value)} />
                  {errors.whatsapp && <p className="err" role="alert">{errors.whatsapp}</p>}
                </div>

                {renderChoice({ key: 'interests', num: 3, title: 'What kind of events interest you?', note: 'Pick as many as you like', options: INTERESTS, multi: true })}
                {renderChoice({ key: 'timeline', num: 4, title: 'When are you planning to attend a 3 AM event?', options: TIMELINE, multi: false })}
                {renderChoice({ key: 'locations', num: 5, title: 'Which of these event locations work for you?', note: 'Pick as many as you like', options: LOCATIONS, multi: true })}
                {renderChoice({ key: 'budget', num: 6, title: "What's your comfortable budget for a 3 AM event?", options: BUDGETS, multi: false })}

                <div className="q" id="q-notes">
                  <label className="ql" htmlFor="notes"><em>7</em>Anything else you&apos;d like to tell us? <span style={{ color: 'var(--grey)', fontWeight: 400 }}>(optional)</span></label>
                  <textarea id="notes" rows={3} value={f.notes} maxLength={600}
                            onChange={(e) => setField('notes', e.target.value)} />
                </div>

                <fieldset className="q" id="q-consent">
                  <legend>Can we contact you on WhatsApp about upcoming 3 AM events and community updates?</legend>
                  <label className="consent">
                    <input type="checkbox" checked={f.consent} onChange={(e) => setField('consent', e.target.checked)} />
                    <span>Yes, I&apos;d love to receive updates from 3 AM Ideas.</span>
                  </label>
                  {errors.consent && <p className="err" role="alert">{errors.consent}</p>}
                </fieldset>

                <input className="hp" type="text" name="company" value={f.company} tabIndex={-1} autoComplete="off"
                       aria-hidden="true" onChange={(e) => setF(prev => ({ ...prev, company: e.target.value }))} />

                <div>
                  <button className="submit" type="submit" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Sending…' : 'Put me on the list'}
                  </button>
                  {status === 'error' && (
                    <p className="formerr" role="alert">That didn&apos;t go through. Check your connection and try again.</p>
                  )}
                  <p className="tiny">We only use your number for 3 AM updates.</p>
                </div>
              </form>
            </div>
          </>
        )}
      </main>

      <footer>
        <div className="col">
          <div className="fnav">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
            <a href="mailto:wearemusawwir@gmail.com">Contact</a>
          </div>
          <small>© {new Date().getFullYear()} 3 AM Ideas, Bangalore</small>
        </div>
      </footer>
    </div>
  );
}