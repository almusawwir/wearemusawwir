"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function JoinPage() {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    interest: '',
    message: ''
  });
  
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    // Prepare data for Google Apps Script
    const data = new FormData();
    data.append('name', formData.name);
    data.append('whatsapp', formData.whatsapp);
    data.append('interest', formData.interest);
    data.append('message', formData.message);

    // Your active Google Script Deployment URL
    const scriptURL = 'https://script.google.com/macros/s/AKfycbzvmQy_HZOGPq1KrNg3hE8DF1NCwrwv00aFSgb8naf4Wm0FX-sV7PeeI7ijrwN2QBeT/exec';

    try {
      // Using no-cors to prevent Next.js/Browser CORS blocking with Google Scripts
      await fetch(scriptURL, {
        method: 'POST',
        body: data,
        mode: 'no-cors' 
      });
      
      setStatus('success');
      setFormData({ name: '', whatsapp: '', interest: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-[#F7F5F0] text-[#1A1817] font-sans antialiased selection:bg-[#FF6B35] selection:text-white min-h-screen flex items-center justify-center py-12 px-4 relative">
      
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
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.8);
        }
      `}} />

      <div className="canvas-texture"></div>

      <div className="w-full max-w-xl relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="mb-4 text-[#5C5855] hover:text-[#FF6B35] transition-colors flex items-center gap-2 font-sans text-xs uppercase tracking-widest font-bold">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back Home
          </Link>
          <h1 className="font-serif italic text-2xl text-[#1A1817] mb-2">Al-Musawwir</h1>
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#5C5855] font-bold">We create, therefore we are.</p>
        </div>

        <div className="glass-card rounded-[2rem] shadow-2xl shadow-[#1A1817]/5 overflow-hidden">
          
          <div className="bg-[#1A1817] text-[#F7F5F0] p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35] rounded-full filter blur-[50px] opacity-20"></div>
            <h2 className="font-serif text-3xl md:text-4xl mb-2 text-white relative z-10">Join the Gathering</h2>
            <p className="font-sans text-sm tracking-wide text-[#F7F5F0]/70 relative z-10">A space to express, explore, and create without fear of judgment.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 flex flex-col gap-8">
            
            {/* 1. Basic Info */}
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required 
                  className="bg-white/50 border border-[#1A1817]/20 rounded-xl px-4 py-3 font-serif text-lg text-[#1A1817] focus:outline-none focus:border-[#004E98] focus:bg-white transition-all placeholder:text-[#1A1817]/30" 
                  placeholder="Your name" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">WhatsApp Number *</label>
                <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} required 
                  className="bg-white/50 border border-[#1A1817]/20 rounded-xl px-4 py-3 font-sans text-base text-[#1A1817] focus:outline-none focus:border-[#004E98] focus:bg-white transition-all placeholder:text-[#1A1817]/30" 
                  placeholder="+91 00000 00000" />
              </div>
            </div>

            {/* 2. Interests */}
            <div className="space-y-4">
              <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">What are you drawn to? *</label>
              <div className="grid grid-cols-1 gap-3">
                
                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.interest === 'Strokes and Stories' ? 'border-[#E24E7A] bg-[#E24E7A]/5' : 'border-[#1A1817]/10 bg-white/40 hover:bg-white/70'}`}>
                  <input type="radio" name="interest" value="Strokes and Stories" checked={formData.interest === 'Strokes and Stories'} onChange={handleChange} required className="w-4 h-4 text-[#E24E7A] focus:ring-[#E24E7A] accent-[#E24E7A]" />
                  <div>
                    <span className="font-serif text-[1.1rem] text-[#1A1817] block leading-tight">Strokes & Stories</span>
                    <span className="font-sans text-[10px] text-[#5C5855] uppercase tracking-widest">Guided painting & conversation</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.interest === 'Broken Camera Crew' ? 'border-[#FF6B35] bg-[#FF6B35]/5' : 'border-[#1A1817]/10 bg-white/40 hover:bg-white/70'}`}>
                  <input type="radio" name="interest" value="Broken Camera Crew" checked={formData.interest === 'Broken Camera Crew'} onChange={handleChange} required className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35] accent-[#FF6B35]" />
                  <div>
                    <span className="font-serif text-[1.1rem] text-[#1A1817] block leading-tight">Broken Camera Crew (BCC)</span>
                    <span className="font-sans text-[10px] text-[#5C5855] uppercase tracking-widest">Cinematic social experiment</span>
                  </div>
                </label>

              </div>
            </div>

            {/* 3. Message */}
            <div className="space-y-2">
              <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">Anything you want to say? (Optional)</label>
              <textarea name="message" value={formData.message} onChange={handleChange} rows="3" 
                className="bg-white/50 border border-[#1A1817]/20 rounded-xl px-4 py-3 font-serif text-lg text-[#1A1817] focus:outline-none focus:border-[#F9A03F] focus:bg-white transition-all placeholder:text-[#1A1817]/30 resize-none w-full" 
                placeholder="A thought, a question, or what art means to you..."></textarea>
            </div>

            {/* Submission */}
            <div className="pt-4 border-t border-[#1A1817]/10">
              <button type="submit" disabled={status === 'loading' || status === 'success'}
                className={`w-full text-white font-sans text-sm uppercase tracking-[0.2em] font-bold py-5 px-8 rounded-xl transition-all flex items-center justify-center 
                  ${status === 'success' ? 'bg-[#25D366]' : 'bg-[#1A1817] hover:bg-[#FF6B35] hover:shadow-xl hover:-translate-y-1'}
                  ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}
                `}>
                <span>
                  {status === 'loading' ? 'Sending Details...' : 
                   status === 'success' ? 'Sent Successfully' : 
                   'Send Details'}
                </span>
              </button>
              
              {status === 'success' && (
                <p className="text-center text-[#25D366] font-sans text-[11px] uppercase tracking-widest mt-4 font-bold">Details received. We'll be in touch.</p>
              )}
              {status === 'error' && (
                <p className="text-center text-red-500 font-sans text-[11px] uppercase tracking-widest mt-4 font-bold">Something went wrong. Try again.</p>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}