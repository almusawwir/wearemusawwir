"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';

export default function RegisterPage() {
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Ask our backend to create a Razorpay Order
      const response = await fetch('/api/create-order', {
        method: 'POST',
      });
      const data = await response.json();

      if (!data.order) {
        alert("Failed to create order. Please try again.");
        setIsProcessing(false);
        return;
      }

      // 2. Setup the Razorpay popup window
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Your public key
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Al-Musawwir",
        description: "Strokes & Stories Registration",
        order_id: data.order.id, // The secure ID we got from the backend
        
        handler: async function (response) {
          console.log("Payment Success!", response);
          
          try {
            // Send the form data AND the Razorpay Payment ID to our new API route
            await fetch('/api/save-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                whatsapp: formData.whatsapp,
                creativeLink: formData.creativeLink,
                reason: formData.reason,
                reflection: formData.reflection,
                paymentId: response.razorpay_payment_id
              })
            });
            
            alert("Payment Successful! Your spot is secured. See you on May 16th!");
            // Optional: Redirect them to a success page or clear the form here!
            window.location.href = "/"; // Takes them back to the home page
            
          } catch (error) {
            console.error("Payment succeeded but saving failed:", error);
            alert("Payment successful, but we had trouble saving your form. Please screenshot this and WhatsApp us: " + response.razorpay_payment_id);
          }
        },

        prefill: {
          name: formData.name,
          contact: formData.whatsapp,
        },
        theme: {
          color: "#1A1817", // Matches your brand ink color
        },
      };

      // 3. Open the popup
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      // Handle popup close
      paymentObject.on('payment.failed', function (response) {
        alert("Payment Failed. Please try again.");
      });

    } catch (error) {
      console.error("Payment setup failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F7F5F0] text-[#1A1817] font-sans antialiased selection:bg-[#FF6B35] selection:text-white flex justify-center py-12 px-4 md:px-6">
      
      {/* Load the Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Global Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Manrope:wght@200;300;400;500;600;700&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }
        .canvas-texture {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
          mix-blend-mode: multiply;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
      `}} />

      <div className="canvas-texture"></div>

      {/* Ambient Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#004E98]/10 rounded-full mix-blend-multiply filter blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#FF6B35]/10 rounded-full mix-blend-multiply filter blur-[120px]"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10 flex flex-col gap-8">
        
        {/* Header / Back Button */}
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 text-[#5C5855] hover:text-[#FF6B35] transition-colors font-sans text-xs uppercase tracking-widest font-bold">
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Home
          </Link>
          <span className="font-serif italic text-lg text-[#1A1817]">Al-Musawwir</span>
        </div>

        {/* The Form Card */}
        <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-[#1A1817]/5 overflow-hidden">
          
          {/* Static Event Info Banner */}
          <div className="bg-[#1A1817] text-[#F7F5F0] p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35] rounded-full filter blur-[50px] opacity-20"></div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl mb-2 text-white">Secure Your Canvas</h1>
              <p className="font-sans text-sm tracking-wide text-[#F7F5F0]/70 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#FF6B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                May 16, 2026 • 10:00 AM • Cubbon Park
              </p>
            </div>
            <div className="text-left md:text-right">
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#F7F5F0]/50 block mb-1">Registration Fee</span>
              <span className="font-serif text-3xl text-white">₹999</span>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="p-8 md:p-10 flex flex-col gap-8">
            
            {/* 1. Basic Info */}
            <div className="space-y-6">
              <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] font-bold text-[#FF6B35] border-b border-[#1A1817]/10 pb-2">1. The Basics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">Full Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="bg-white/50 border border-[#1A1817]/20 rounded-xl px-4 py-3 font-serif text-lg text-[#1A1817] focus:outline-none focus:border-[#004E98] focus:bg-white transition-all placeholder:text-[#1A1817]/30" placeholder="Aham Brahmasmi" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">WhatsApp Number *</label>
                  <input type="tel" name="whatsapp" required value={formData.whatsapp} onChange={handleChange} className="bg-white/50 border border-[#1A1817]/20 rounded-xl px-4 py-3 font-sans text-base text-[#1A1817] focus:outline-none focus:border-[#004E98] focus:bg-white transition-all placeholder:text-[#1A1817]/30" placeholder="+91 00000 00000" />
                </div>
              
                <div className="flex flex-col gap-2">
                 <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">Email Address *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="bg-white/50 border border-[#1A1817]/20 rounded-xl px-4 py-3 font-sans text-base text-[#1A1817] focus:outline-none focus:border-[#004E98] focus:bg-white transition-all placeholder:text-[#1A1817]/30" placeholder="artist@example.com" />
                </div>
                
              </div>
            </div>
|
            {/* 2. Creative Link */}
            <div className="space-y-6">
              <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] font-bold text-[#004E98] border-b border-[#1A1817]/10 pb-2">2. Your World (Optional)</h2>
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">Instagram / LinkedIn / Portfolio</label>
                <input type="url" name="creativeLink" value={formData.creativeLink} onChange={handleChange} className="bg-white/50 border border-[#1A1817]/20 rounded-xl px-4 py-3 font-sans text-base text-[#1A1817] focus:outline-none focus:border-[#004E98] focus:bg-white transition-all placeholder:text-[#1A1817]/30" placeholder="https://" />
              </div>
            </div>

            {/* 3. Why Joining */}
            <div className="space-y-6">
              <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] font-bold text-[#E24E7A] border-b border-[#1A1817]/10 pb-2">3. Intentions</h2>
              <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">Why are you joining us? *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {["To learn", "To meet people", "To paint with like-minded people", "To explore creativity"].map((option) => (
                  <label key={option} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.reason === option ? 'border-[#E24E7A] bg-[#E24E7A]/5' : 'border-[#1A1817]/10 bg-white/40 hover:bg-white/70'}`}>
                    <input type="radio" name="reason" value={option} required onChange={handleChange} className="w-4 h-4 text-[#E24E7A] focus:ring-[#E24E7A]" />
                    <span className="font-serif text-[1.1rem] text-[#1A1817]">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Reflection */}
            <div className="space-y-6">
              <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] font-bold text-[#F9A03F] border-b border-[#1A1817]/10 pb-2">4. Reflection (Optional)</h2>
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">What does art/creation mean to you?</label>
                <textarea name="reflection" rows="3" value={formData.reflection} onChange={handleChange} className="bg-white/50 border border-[#1A1817]/20 rounded-xl px-4 py-3 font-serif text-lg text-[#1A1817] focus:outline-none focus:border-[#F9A03F] focus:bg-white transition-all placeholder:text-[#1A1817]/30 resize-none" placeholder="A few words on how you feel..."></textarea>
              </div>
            </div>

            {/* 6. Consent */}
            <div className="pt-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-1">
                  <input type="checkbox" name="consent" required checked={formData.consent} onChange={handleChange} className="peer appearance-none w-5 h-5 border-2 border-[#1A1817]/30 rounded-[4px] checked:bg-[#1A1817] checked:border-[#1A1817] transition-all cursor-pointer" />
                  <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className="font-sans text-sm text-[#5C5855] group-hover:text-[#1A1817] transition-colors">I understand that this is a curated space for art and connection, and I agree to abide by the event guidelines.</span>
              </label>
            </div>

            {/* 7. Submit */}
            <div className="pt-6">
              <button disabled={isProcessing} type="submit" className="w-full bg-[#1A1817] disabled:bg-[#5C5855] disabled:cursor-not-allowed text-white font-sans text-sm uppercase tracking-[0.2em] font-bold py-5 px-8 rounded-xl hover:bg-[#FF6B35] transition-all hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-3 group">
                {isProcessing ? "Processing..." : "Submit & Pay ₹999"}
                {!isProcessing && <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l7-7m7-7H3"></path></svg>}
              </button>
              <p className="font-sans text-[10px] text-center text-[#5C5855] uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Secure Checkout by Razorpay
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}