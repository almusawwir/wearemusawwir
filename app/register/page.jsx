"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';
import Papa from 'papaparse';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";

// ── Fetched once, outside the component so it never triggers re-renders ──
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

function RegisterContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId') || '';
  // ticketsLeft passed from event detail page as a URL param — use as the ceiling
  const ticketsLeftParam = parseInt(searchParams.get('ticketsLeft') || '99');

  const [eventDetails, setEventDetails] = useState(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  // Cap is the minimum of ticketsLeftParam and 5 (your existing max)
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

  // ── Single fetch on mount, no dependencies that cause re-fetch ──
  useEffect(() => {
    if (!eventId) {
      setIsLoadingEvent(false);
      return;
    }
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
          bring: foundEvent.bring || 'An open heart.',
          provided: foundEvent.provided || 'Canvas and paints.',
        });
      }
      setIsLoadingEvent(false);
    });
  }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const increment = (e) => {
    e.preventDefault();
    setTicketCount((prev) => Math.min(maxTickets, prev + 1));
  };
  const decrement = (e) => {
    e.preventDefault();
    setTicketCount((prev) => Math.max(1, prev - 1));
  };

  const unitPrice =
    ticketCount === 1
      ? parseInt(eventDetails?.price || 999)
      : parseInt(eventDetails?.groupPrice || 999);
  const totalAmount = unitPrice * ticketCount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
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
        name: 'Al-Musawwir',
        description: `${ticketCount}x Ticket(s) for ${eventDetails ? eventDetails.title : 'Strokes & Stories'}`,
        order_id: data.order.id,

        handler: async function (response) {
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
                paymentId: response.razorpay_payment_id,
                eventTitle: eventDetails?.title || 'Al-Musawwir',
                eventDate: eventDetails?.date || 'TBD',
                eventTime: eventDetails?.time || 'TBD',
                eventLocation: eventDetails?.location || 'TBD',
                eventBring: eventDetails?.bring || 'An open heart',
                eventProvided: eventDetails?.provided || 'Art supplies',
                ticketCount,
                totalPaid: totalAmount,
              }),
            });
            window.location.href = `/ticket?id=${response.razorpay_payment_id}&name=${encodeURIComponent(formData.name)}&eventId=${encodeURIComponent(eventId)}&qty=${ticketCount}`;
          } catch (error) {
            console.error('Payment succeeded but saving failed:', error);
            setIsSuccessLoading(false);
            alert(
              'Payment successful, but we had trouble saving your form. Please WhatsApp us your Payment ID: ' +
                response.razorpay_payment_id
            );
          }
        },
        prefill: { name: formData.name, contact: formData.whatsapp, email: formData.email },
        theme: { color: '#1A1817' },
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
    <div className="relative min-h-screen w-full bg-[#F7F5F0] text-[#1A1817] font-sans antialiased selection:bg-[#FF6B35] selection:text-white flex justify-center py-12 px-4 md:px-6">

      {/* ── Success overlay ── */}
      {isSuccessLoading && (
        <div className="fixed inset-0 z-[100] bg-[#F7F5F0]/90 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 border-4 border-[#1A1817]/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#FF6B35] rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#1A1817] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <h2 className="font-serif italic text-3xl md:text-4xl text-[#1A1817] mb-2">Securing your canvas...</h2>
          <p className="font-sans text-xs text-[#5C5855] tracking-[0.2em] uppercase font-bold animate-pulse">
            Please do not close this window
          </p>
        </div>
      )}

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Manrope:wght@200;300;400;500;600;700&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }
        .canvas-texture {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
          mix-blend-mode: multiply;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
        @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .animate-pulse-fast { animation: pulse-fast 1.2s ease-in-out infinite; }
      `}} />

      <div className="canvas-texture"></div>

      {/* Background blobs — static, no state dependency, no jitter */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#004E98]/10 rounded-full mix-blend-multiply filter blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#FF6B35]/10 rounded-full mix-blend-multiply filter blur-[120px]"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10 flex flex-col gap-8">

        {/* Nav */}
        <div className="flex items-center justify-between">
          <Link
            href={`/event/${eventId}`}
            className="group flex items-center gap-2 text-[#5C5855] hover:text-[#FF6B35] transition-colors font-sans text-xs uppercase tracking-widest font-bold"
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Event
          </Link>
          <span className="font-serif italic text-lg text-[#1A1817]">Al-Musawwir</span>
        </div>

        {/* ── Urgency banner — only shown when ticketsLeft <= 4 ── */}
        {showCountdown && (
          <div className="bg-[#DC2626] text-white rounded-2xl px-5 py-3 flex items-center gap-3">
            <span className="animate-pulse-fast w-2 h-2 bg-white rounded-full shrink-0"></span>
            <p className="font-sans text-xs font-bold uppercase tracking-wider">
              Only {ticketsLeftParam} spot{ticketsLeftParam === 1 ? '' : 's'} left for this event — you're almost there
            </p>
          </div>
        )}

        <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-[#1A1817]/5 overflow-hidden">

          {/* Header */}
          <div className="bg-[#1A1817] text-[#F7F5F0] p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden min-h-[160px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35] rounded-full filter blur-[50px] opacity-20" aria-hidden="true"></div>

            {isLoadingEvent ? (
              <div className="animate-pulse flex flex-col gap-3 w-full">
                <div className="h-8 bg-white/20 rounded w-3/4"></div>
                <div className="h-4 bg-white/20 rounded w-1/2"></div>
              </div>
            ) : (
              <>
                <div>
                  <h1 className="font-serif text-3xl md:text-4xl mb-2 text-white line-clamp-1">
                    {eventDetails?.title || 'Secure Your Canvas'}
                  </h1>
                  <p className="font-sans text-sm tracking-wide text-[#F7F5F0]/70 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#FF6B35] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {eventDetails ? `${eventDetails.date} • ${eventDetails.time}` : 'Event specifics unavailable'}
                  </p>
                </div>
                <div className="text-left md:text-right shrink-0">
                  <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#F7F5F0]/50 block mb-1">Registration Fee</span>
                  <span className="font-serif text-3xl text-white">₹{eventDetails?.price || '999'}</span>
                </div>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 flex flex-col gap-8">

            {/* Section 1: Basics */}
            <div className="space-y-6">
              <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] font-bold text-[#FF6B35] border-b border-[#1A1817]/10 pb-2">
                1. The Basics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-white/50 border border-[#1A1817]/20 rounded-xl px-4 py-3 font-serif text-lg text-[#1A1817] focus:outline-none focus:border-[#004E98] focus:bg-white transition-all placeholder:text-[#1A1817]/30"
                    placeholder="Aham Brahmasmi"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">WhatsApp Number *</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="bg-white/50 border border-[#1A1817]/20 rounded-xl px-4 py-3 font-sans text-base text-[#1A1817] focus:outline-none focus:border-[#004E98] focus:bg-white transition-all placeholder:text-[#1A1817]/30"
                    placeholder="+91 00000 00000"
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-white/50 border border-[#1A1817]/20 rounded-xl px-4 py-3 font-sans text-base text-[#1A1817] focus:outline-none focus:border-[#004E98] focus:bg-white transition-all placeholder:text-[#1A1817]/30"
                    placeholder="artist@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Your World — REQUIRED, no URL or @ restriction */}
            <div className="space-y-6">
              <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] font-bold text-[#004E98] border-b border-[#1A1817]/10 pb-2">
                2. Your World
              </h2>
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">
                  Instagram / LinkedIn / Portfolio *
                </label>
                <input
                  type="text"
                  name="creativeLink"
                  required
                  value={formData.creativeLink}
                  onChange={handleChange}
                  className="bg-white/50 border border-[#1A1817]/20 rounded-xl px-4 py-3 font-sans text-base text-[#1A1817] focus:outline-none focus:border-[#004E98] focus:bg-white transition-all placeholder:text-[#1A1817]/30"
                  placeholder="username, handle, or link"
                />
                <p className="font-sans text-[10px] text-[#5C5855] tracking-wide">
                  Any format works — a handle, a username, or a full link.
                </p>
              </div>
            </div>

            {/* Section 3: Intentions */}
            <div className="space-y-6">
              <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] font-bold text-[#E24E7A] border-b border-[#1A1817]/10 pb-2">
                3. Intentions
              </h2>
              <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">
                Why are you joining us? *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {['To learn', 'To meet people', 'To paint with like-minded people', 'To explore creativity'].map((option) => (
                  <label
                    key={option}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.reason === option
                        ? 'border-[#E24E7A] bg-[#E24E7A]/5'
                        : 'border-[#1A1817]/10 bg-white/40 hover:bg-white/70'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={option}
                      required
                      onChange={handleChange}
                      className="w-4 h-4 text-[#E24E7A] focus:ring-[#E24E7A]"
                    />
                    <span className="font-serif text-[1.1rem] text-[#1A1817]">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Section 4: Reflection (optional) */}
            <div className="space-y-6">
              <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] font-bold text-[#F9A03F] border-b border-[#1A1817]/10 pb-2">
                4. Reflection (Optional)
              </h2>
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">
                  What does art/creation mean to you?
                </label>
                <textarea
                  name="reflection"
                  rows="3"
                  value={formData.reflection}
                  onChange={handleChange}
                  className="bg-white/50 border border-[#1A1817]/20 rounded-xl px-4 py-3 font-serif text-lg text-[#1A1817] focus:outline-none focus:border-[#F9A03F] focus:bg-white transition-all placeholder:text-[#1A1817]/30 resize-none"
                  placeholder="A few words on how you feel..."
                ></textarea>
              </div>
            </div>

            {/* Consent */}
            <div className="pt-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-1">
                  <input
                    type="checkbox"
                    name="consent"
                    required
                    checked={formData.consent}
                    onChange={handleChange}
                    className="peer appearance-none w-5 h-5 border-2 border-[#1A1817]/30 rounded-[4px] checked:bg-[#1A1817] checked:border-[#1A1817] transition-all cursor-pointer"
                  />
                  <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="font-sans text-sm text-[#5C5855] group-hover:text-[#1A1817] transition-colors">
                  I understand that this is a curated space for art, and I agree to the{' '}
                  <Link href="/terms" target="_blank" className="font-bold text-[#1A1817] underline hover:text-[#FF6B35]">
                    Terms & Guidelines
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* Ticket counter + pay button */}
            <div className="pt-6 border-t border-[#1A1817]/10">
              <div className="flex items-center justify-between bg-white/60 p-4 rounded-2xl border border-[#1A1817]/10 mb-4 shadow-sm">
                <div>
                  <span className="font-sans text-[10px] uppercase tracking-widest text-[#5C5855] font-bold block mb-1">
                    Select Quantity
                  </span>
                  <span className="font-serif text-lg text-[#1A1817] leading-none">
                    {ticketCount === 1
                      ? `₹${eventDetails?.price || '999'} per person`
                      : `Group Rate: ₹${eventDetails?.groupPrice || '899'} per person`}
                  </span>
                </div>
                <div className="flex items-center bg-[#1A1817] rounded-full p-1 gap-4 text-white">
                  <button
                    onClick={decrement}
                    disabled={ticketCount <= 1 || isProcessing}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors disabled:opacity-30"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                    </svg>
                  </button>
                  <span className="font-sans font-bold w-4 text-center">{ticketCount}</span>
                  <button
                    onClick={increment}
                    disabled={ticketCount >= maxTickets || isProcessing}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors disabled:opacity-30"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* ── "Only X left" warning under the counter ── */}
              {showCountdown && (
                <div className="flex items-center gap-2 mb-4 px-1">
                  <span className="animate-pulse-fast w-1.5 h-1.5 bg-[#DC2626] rounded-full shrink-0"></span>
                  <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#DC2626]">
                    Only {ticketsLeftParam} ticket{ticketsLeftParam === 1 ? '' : 's'} remaining for this event
                  </p>
                </div>
              )}

              <button
                disabled={isProcessing || isLoadingEvent}
                type="submit"
                className="w-full bg-[#1A1817] disabled:bg-[#5C5855] disabled:cursor-not-allowed text-white font-sans text-sm uppercase tracking-[0.2em] font-bold py-5 px-8 rounded-xl hover:bg-[#FF6B35] transition-all hover:shadow-xl hover:-translate-y-1 flex items-center justify-between group"
              >
                <span>{isProcessing ? 'Processing...' : `Secure ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''}`}</span>
                {!isProcessing && (
                  <span className="flex items-center gap-3">
                    Pay ₹{totalAmount}
                    <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </span>
                )}
              </button>

              <p className="font-sans text-[10px] text-center text-[#5C5855] uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                Secure Checkout by Razorpay
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0] text-[#1A1817] font-serif text-2xl">
        Setting up your canvas...
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}