"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const router = useRouter();

  const handleBack = () => {
    // If history length is 1 or 2, it means this was opened in a new tab
    if (window.history.length <= 2) {
      window.close(); // Tries to close the new tab
      setTimeout(() => router.push('/'), 150); // Fallback: goes to home if browser blocks closing
    } else {
      router.back(); // Normal back behavior
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F7F5F0] text-[#1A1817] font-sans antialiased pt-24 pb-32 px-4 md:px-6">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Manrope:wght@200;300;400;500;600;700&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }
      `}} />
      
      {/* ✦ SMART BACK BUTTON ✦ */}
      <nav className="fixed top-8 left-4 md:left-8 z-50">
        <button 
          onClick={handleBack} 
          className="bg-white/80 backdrop-blur px-4 py-2 rounded-full font-sans text-[10px] uppercase tracking-widest font-bold hover:bg-[#1A1817] hover:text-white transition-all shadow-lg text-[#1A1817]"
        >
          ← Back
        </button>
      </nav>

      <div className="max-w-3xl mx-auto relative z-10 space-y-8 mt-12 bg-white/60 p-8 md:p-12 rounded-[2rem] border border-[#1A1817]/10">
        <h1 className="font-serif italic text-4xl text-[#1A1817] border-b border-[#1A1817]/10 pb-6">Terms & Event Guidelines</h1>
        
        <div className="space-y-8 text-sm md:text-base text-[#5C5855] leading-relaxed">
          <section>
            <h2 className="font-sans text-[11px] uppercase tracking-[0.2em] font-bold text-[#1A1817] mb-2">1. Booking & Capacity</h2>
            <p>Our gatherings are intentionally limited in capacity to maintain a calm and exclusive experience.</p>
            <p className="mt-2">Your spot is confirmed only after full payment has been received and your digital ticket has been issued. If you wish to transfer your ticket to someone else, please inform the organizers in advance.</p>
          </section>

          <section>
            <h2 className="font-sans text-[11px] uppercase tracking-[0.2em] font-bold text-[#FF6B35] mb-2">2. Cancellation & Refunds</h2>
            <p>Because art materials and venue arrangements are prepared based on confirmed attendance, <strong>we are unable to offer refunds</strong> for no-shows or last-minute cancellations.</p>
            <p className="mt-2">If you made a payment by mistake, you may request a cancellation <strong>within 30 minutes of booking</strong> by contacting us directly.</p>
          </section>

          <section>
            <h2 className="font-sans text-[11px] uppercase tracking-[0.2em] font-bold text-[#004E98] mb-2">3. Community Guidelines</h2>
            <p>Al-Musawwir is built as a respectful, welcoming, and judgment-free space.</p>
            <p className="mt-2">We ask all attendees to treat the venue, materials, and one another with care and kindness. Any form of harassment, disruptive behavior, or disrespect toward participants or organizers may result in removal from the gathering without refund.</p>
          </section>

          <section>
            <h2 className="font-sans text-[11px] uppercase tracking-[0.2em] font-bold text-[#E24E7A] mb-2">4. Photography & Privacy</h2>
            <p>We occasionally capture photographs and short videos during gatherings to document and share moments from the community.</p>
            <p className="mt-2">By attending, you consent to being photographed or filmed. If you would prefer not to appear in any media, please quietly let the host know before the session begins, and we will fully respect your preference.</p>
          </section>

          <section>
            <h2 className="font-sans text-[11px] uppercase tracking-[0.2em] font-bold text-[#1A1817] mb-2">5. Personal Responsibility</h2>
            <p>While we do our best to create a safe and comfortable environment, attendees remain responsible for their personal belongings and well-being during the gathering.</p>
            <p className="mt-2">Please handle art materials responsibly and keep valuables with you at all times.</p>
          </section>
        </div>
      </div>
    </div>
  );
}