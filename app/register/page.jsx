"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Papa from 'papaparse';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";
const TZ = "Asia/Kolkata";

const REASONS = ['To learn something', 'To meet people', 'To make something', 'To try something new'];

// ── CSV fetched once, cached globally — never causes re-renders ──
let cachedEvents = null;
async function fetchEvents() {
  if (cachedEvents) return cachedEvents;
  const res = await fetch(CSV_URL);
  const text = await res.text();
  return new Promise((resolve) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/^\uFEFF/, ''),
      complete: (results) => {
        cachedEvents = results.data;
        resolve(cachedEvents);
      }
    });
  });
}

// ── Load Razorpay script on demand, resolve when ready ──
function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(window.Razorpay);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) resolve(window.Razorpay);
      else reject(new Error('Razorpay did not initialise after script load'));
    };
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
}

function formatDate(raw) {
  if (!raw || !raw.toString().trim()) return 'TBA';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw.toString().trim();
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ }).format(d);
}

function RegisterContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId') || '';
  const ticketsLeftParam = parseInt(searchParams.get('ticketsLeft') || '99');

  const [eventDetails, setEventDetails] = useState(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);

  const maxTickets = Math.min(ticketsLeftParam, 5);
  const showCountdown = ticketsLeftParam <= 4 && ticketsLeftParam > 0;

  const [ticketCount, setTicketCount] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    creativeLink: '',
    reason: '',
    reflection: '',
    consent: false
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccessLoading, setIsSuccessLoading] = useState(false);

  // ── Single fetch on mount ──
  useEffect(() => {
    if (!eventId) { setIsLoadingEvent(false); return; }
    fetchEvents().then((data) => {
      const foundEvent = data.find(
        (e) => e.id && e.id.trim().toLowerCase() === eventId.toLowerCase()
      );
      if (foundEvent) {
        setEventDetails({
          title: foundEvent.title,
          date: foundEvent.date,
          time: foundEvent.time,
          location: foundEvent.location_main,
          price: foundEvent.price || '999',
          groupPrice: foundEvent.group_price || foundEvent.price || '999',
          bring: foundEvent.bring || 'Just yourself.',
          provided: foundEvent.provided || 'Everything you need.',
        });
      }
      setIsLoadingEvent(false);
    });
  }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const increment = (e) => { e.preventDefault(); setTicketCount((p) => Math.min(maxTickets, p + 1)); };
  const decrement = (e) => { e.preventDefault(); setTicketCount((p) => Math.max(1, p - 1)); };

  const unitPrice = ticketCount === 1 ? parseInt(eventDetails?.price || 999) : parseInt(eventDetails?.groupPrice || 999);
  const totalAmount = unitPrice * ticketCount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await loadRazorpay();

      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, ticketCount }),
      });
      const data = await response.json();

      if (!data.order) {
        alert('Failed to create order. Please try again.');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: '3 AM Ideas',
        description: `${ticketCount}x Ticket(s) for ${eventDetails ? eventDetails.title : '3 AM Ideas event'}`,
        order_id: data.order.id,

        handler: async function (razorpayResponse) {
          setIsSuccessLoading(true);
          try {
            await fetch('/api/save-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                eventId,
                name: formData.name,
                email: formData.email,
                whatsapp: formData.whatsapp,
                creativeLink: formData.creativeLink,
                reason: formData.reason,
                reflection: formData.reflection,
                paymentId: razorpayResponse.razorpay_payment_id,
                eventTitle: eventDetails?.title || '3 AM Ideas',
                eventDate: eventDetails?.date || 'TBD',
                eventTime: eventDetails?.time || 'TBD',
                eventLocation: eventDetails?.location || 'TBD',
                eventBring: eventDetails?.bring || 'Just yourself',
                eventProvided: eventDetails?.provided || 'Everything you need',
                ticketCount,
                totalPaid: totalAmount,
              }),
            });
            window.location.href = `/ticket?id=${razorpayResponse.razorpay_payment_id}&name=${encodeURIComponent(formData.name)}&eventId=${encodeURIComponent(eventId)}&qty=${ticketCount}`;
          } catch (error) {
            console.error('Payment succeeded but saving failed:', error);
            setIsSuccessLoading(false);
            alert('Payment successful, but we had trouble saving your form. Please WhatsApp us your Payment ID: ' + razorpayResponse.razorpay_payment_id);
          }
        },

        prefill: { name: formData.name, contact: formData.whatsapp, email: formData.email },
        theme: { color: '#FF0065' },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      paymentObject.on('payment.failed', function () {
        setIsProcessing(false);
        alert('Payment Failed. Please try again.');
      });

    } catch (error) {
      console.error('Payment setup failed:', error);
      setIsProcessing(false);
      alert('Something went wrong. Please try again.');
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
        .tam *{box-sizing:border-box}
        .tam a{color:inherit}
        .tam .brand{color:var(--pink)}
        .tam :focus-visible{outline:3px solid var(--pink);outline-offset:3px}
        .tam .wrap{max-width:760px;margin:0 auto;padding:0 24px;width:100%}

        /* Header */
        .tam .top{background:var(--black);color:var(--white);padding-top:env(safe-area-inset-top,0px)}
        .tam .bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:16px;padding-bottom:16px;min-height:64px;
          max-width:760px;margin:0 auto;padding-left:24px;padding-right:24px}
        .tam .back{font-size:15px;font-weight:500;text-decoration:none;opacity:.85}
        .tam .back:hover{opacity:1;color:var(--pink)}
        .tam .wordmark{font-family:var(--display);font-weight:900;font-size:22px;letter-spacing:.5px}

        /* Event summary */
        .tam .summary{border-bottom:2px solid var(--black);padding-top:28px;padding-bottom:24px}
        .tam .eyebrow{font-weight:500;color:var(--pink);font-size:14px;margin:0;letter-spacing:.04em;text-transform:uppercase}
        .tam .summary h1{font-family:var(--display);font-weight:900;font-size:clamp(34px,8vw,64px);line-height:1.02;margin:8px 0 14px;word-break:break-word}
        .tam .facts{display:flex;flex-wrap:wrap;gap:6px 26px;font-size:15px;margin:0}
        .tam .facts b{font-weight:600}
        .tam .facts span{opacity:.65}
        .tam .skel{height:18px;background:#eee;margin:8px 0;max-width:60%}
        .tam .skel.big{height:40px;max-width:80%}

        /* Low stock */
        .tam .lowstock{background:var(--pink);color:var(--white);padding:12px 16px;font-size:14px;font-weight:600;
          display:flex;align-items:center;gap:10px;margin-top:18px;border:2px solid var(--black)}
        .tam .lowstock i{width:9px;height:9px;border-radius:50%;background:var(--white);animation:tamblink 1.2s steps(1) infinite;flex:0 0 auto}
        @keyframes tamblink{50%{opacity:.25}}

        /* Form */
        .tam form{padding-top:32px;padding-bottom:40px;display:flex;flex-direction:column;gap:34px}
        .tam .step{display:flex;flex-direction:column;gap:18px}
        .tam .steptitle{font-family:var(--display);font-weight:900;font-size:26px;line-height:1;margin:0;border-bottom:1px solid var(--black);padding-bottom:10px}
        .tam .steptitle em{font-style:normal;color:var(--pink);margin-right:8px}
        .tam .row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .tam .field{display:flex;flex-direction:column;gap:8px}
        .tam .field.full{grid-column:1 / -1}
        .tam .field label{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.06em}
        .tam .field .hint{font-size:13px;color:var(--grey);font-weight:400;text-transform:none;letter-spacing:0}
        .tam input[type=text],.tam input[type=tel],.tam input[type=email],.tam textarea{
          font:inherit;font-size:16px;padding:13px 14px;border:2px solid var(--black);background:var(--white);color:var(--black);width:100%;border-radius:0}
        .tam textarea{resize:vertical;min-height:92px}
        .tam input::placeholder,.tam textarea::placeholder{color:#9a9a9a}
        .tam input:focus,.tam textarea:focus{outline:none;border-color:var(--pink);box-shadow:3px 3px 0 var(--pink)}

        .tam .choices{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
        .tam .choice{position:relative;display:block;padding:14px;border:2px solid var(--black);cursor:pointer;background:var(--white);font-size:15.5px;font-weight:500}
        .tam .choice input{position:absolute;opacity:0;pointer-events:none}
        .tam .choice.on{background:var(--pink);border-color:var(--pink);color:var(--white)}

        /* Consent */
        .tam .consent{display:flex;align-items:flex-start;gap:12px;cursor:pointer;font-size:15px}
        .tam .consent input{width:22px;height:22px;flex:0 0 auto;margin:2px 0 0;accent-color:var(--pink)}
        .tam .consent a{font-weight:600;text-decoration:underline}

        /* Quantity + pay */
        .tam .checkout{border-top:2px solid var(--black);padding-top:24px;display:flex;flex-direction:column;gap:16px}
        .tam .qty{display:flex;justify-content:space-between;align-items:center;gap:16px;border:2px solid var(--black);padding:16px}
        .tam .qty .lbl{font-size:12.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--grey);display:block;margin-bottom:4px}
        .tam .qty .per{font-weight:600;font-size:16px}
        .tam .stepper{display:flex;align-items:center;gap:0;flex:0 0 auto}
        .tam .stepper button{width:44px;height:44px;font:inherit;font-size:22px;line-height:1;background:var(--white);color:var(--black);
          border:2px solid var(--black);cursor:pointer}
        .tam .stepper button:disabled{opacity:.3;cursor:not-allowed}
        .tam .stepper .n{width:52px;text-align:center;font-weight:600;font-size:18px;border-top:2px solid var(--black);border-bottom:2px solid var(--black);
          height:44px;line-height:40px}

        .tam .pay{font:inherit;font-weight:600;font-size:16px;padding:18px 20px;border:2px solid var(--pink);background:var(--pink);color:var(--white);
          cursor:pointer;width:100%;border-radius:0;display:flex;justify-content:space-between;align-items:center;gap:12px}
        .tam .pay:disabled{opacity:.5;cursor:not-allowed}
        .tam .pay .total{font-family:var(--display);font-weight:900;font-size:24px;line-height:1}
        .tam .secure{font-size:13px;color:var(--grey);text-align:center;margin:0}

        /* Success overlay */
        .tam .overlay{position:fixed;inset:0;z-index:100;background:var(--white);display:flex;flex-direction:column;
          align-items:center;justify-content:center;text-align:center;padding:24px}
        .tam .overlay h2{font-family:var(--display);font-weight:900;font-size:clamp(34px,8vw,64px);line-height:1;margin:0 0 12px}
        .tam .overlay p{margin:0;font-size:15px;color:var(--grey)}
        .tam .spinner{width:54px;height:54px;border:5px solid var(--pink-soft);border-top-color:var(--pink);border-radius:50%;
          animation:tamspin .8s linear infinite;margin-bottom:26px}
        @keyframes tamspin{to{transform:rotate(360deg)}}

        /* Mobile */
        @media (max-width:820px){
          .tam .wrap,.tam .bar{padding-left:20px;padding-right:20px}
          .tam .bar{padding-top:14px;padding-bottom:14px;min-height:60px}
          .tam .summary{padding-top:22px;padding-bottom:20px}
          .tam .facts{font-size:14.5px;gap:4px 20px}
          .tam form{padding-top:26px;padding-bottom:36px;gap:28px}
          .tam .steptitle{font-size:22px}
          .tam .row{grid-template-columns:1fr;gap:16px}
          .tam .choices{grid-template-columns:1fr}
          .tam .qty{flex-direction:column;align-items:stretch;gap:14px}
          .tam .stepper{justify-content:space-between}
          .tam .stepper .n{flex:1}
          .tam .pay{font-size:15px;padding:16px}
          .tam .pay .total{font-size:21px}
        }
        @media (max-width:360px){ .tam .wrap,.tam .bar{padding-left:16px;padding-right:16px} }

        @media (prefers-reduced-motion:reduce){
          .tam .spinner,.tam .lowstock i{animation:none}
        }
      `}} />

      {isSuccessLoading && (
        <div className="overlay">
          <div className="spinner"></div>
          <h2>Locking in your spot</h2>
          <p>Please don&apos;t close this window.</p>
        </div>
      )}

      <header className="top">
        <div className="bar">
          <Link className="back" href={`/event/${eventId}`}>← Back to event</Link>
          <span className="wordmark">3<span className="brand">AM</span></span>
        </div>
      </header>

      <main className="wrap">
        <section className="summary">
          <p className="eyebrow">Book your spot</p>
          {isLoadingEvent ? (
            <>
              <div className="skel big"></div>
              <div className="skel"></div>
            </>
          ) : (
            <>
              <h1>{eventDetails?.title || 'Book your spot'}</h1>
              <p className="facts">
                <span>Date</span> <b>{formatDate(eventDetails?.date)}</b>
                {eventDetails?.time && <><span>Time</span> <b>{eventDetails.time}</b></>}
                {eventDetails?.location && <><span>Where</span> <b>{eventDetails.location}</b></>}
                <span>Price</span> <b>₹{eventDetails?.price || '999'}</b>
              </p>
            </>
          )}

          {showCountdown && (
            <div className="lowstock">
              <i></i>
              Only {ticketsLeftParam} spot{ticketsLeftParam === 1 ? '' : 's'} left
            </div>
          )}
        </section>

        <form onSubmit={handleSubmit}>
          <div className="step">
            <h2 className="steptitle"><em>01</em>The basics</h2>
            <div className="row">
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input id="name" type="text" name="name" required value={formData.name} onChange={handleChange}
                       autoComplete="name" placeholder="Your name" />
              </div>
              <div className="field">
                <label htmlFor="whatsapp">WhatsApp number</label>
                <input id="whatsapp" type="tel" name="whatsapp" required value={formData.whatsapp} onChange={handleChange}
                       autoComplete="tel" inputMode="tel" placeholder="+91 00000 00000" />
              </div>
              <div className="field full">
                <label htmlFor="email">Email address</label>
                <input id="email" type="email" name="email" required value={formData.email} onChange={handleChange}
                       autoComplete="email" inputMode="email" placeholder="you@example.com" />
                <span className="hint">Your ticket goes here.</span>
              </div>
            </div>
          </div>

          <div className="step">
            <h2 className="steptitle"><em>02</em>Your world</h2>
            <div className="field">
              <label htmlFor="creativeLink">Instagram, LinkedIn or portfolio</label>
              <input id="creativeLink" type="text" name="creativeLink" required value={formData.creativeLink} onChange={handleChange}
                     placeholder="username, handle, or link" />
              <span className="hint">Any format works. A handle, a username, or a full link.</span>
            </div>
          </div>

          <div className="step">
            <h2 className="steptitle"><em>03</em>Why you&apos;re coming</h2>
            <div className="choices">
              {REASONS.map((option) => (
                <label key={option} className={`choice ${formData.reason === option ? 'on' : ''}`}>
                  <input type="radio" name="reason" value={option} required
                         checked={formData.reason === option} onChange={handleChange} />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="step">
            <h2 className="steptitle"><em>04</em>Anything else</h2>
            <div className="field">
              <label htmlFor="reflection">Want to tell us something? <span className="hint">(optional)</span></label>
              <textarea id="reflection" name="reflection" rows="3" value={formData.reflection} onChange={handleChange}
                        placeholder="A thought, a question, or what brought you here…"></textarea>
            </div>
          </div>

          <label className="consent">
            <input type="checkbox" name="consent" required checked={formData.consent} onChange={handleChange} />
            <span>
              I&apos;ve read and agree to the{' '}
              <Link href="/terms" target="_blank">terms and guidelines</Link>.
            </span>
          </label>

          <div className="checkout">
            <div className="qty">
              <div>
                <span className="lbl">How many spots?</span>
                <span className="per">
                  {ticketCount === 1
                    ? `₹${eventDetails?.price || '999'} per person`
                    : `₹${eventDetails?.groupPrice || '999'} per person (group rate)`}
                </span>
              </div>
              <div className="stepper">
                <button type="button" onClick={decrement} disabled={ticketCount <= 1 || isProcessing} aria-label="One less">−</button>
                <span className="n" aria-live="polite">{ticketCount}</span>
                <button type="button" onClick={increment} disabled={ticketCount >= maxTickets || isProcessing} aria-label="One more">+</button>
              </div>
            </div>

            <button className="pay" type="submit" disabled={isProcessing || isLoadingEvent}>
              <span>{isProcessing ? 'Processing…' : `Book ${ticketCount} spot${ticketCount > 1 ? 's' : ''}`}</span>
              {!isProcessing && <span className="total">₹{totalAmount}</span>}
            </button>

            <p className="secure">Secure checkout by Razorpay.</p>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        Setting up your spot…
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}