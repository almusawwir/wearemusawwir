"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function JoinPage() {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    interest: '',
    message: ''
  });
  
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [galleryImages, setGalleryImages] = useState([]);

  // Fetch dynamic gallery images just like the homepage
  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setGalleryImages(data);
        }
      })
      .catch(err => console.error("Could not load gallery images:", err));
  }, []);

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

    const scriptURL = 'https://script.google.com/macros/s/AKfycbzvmQy_HZOGPq1KrNg3hE8DF1NCwrwv00aFSgb8naf4Wm0FX-sV7PeeI7ijrwN2QBeT/exec';

    try {
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
    <div className="bg-[#F7F5F0] text-[#1A1817] font-sans antialiased selection:bg-[#FF6B35] selection:text-white min-h-screen relative overflow-x-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Manrope:wght@200;300;400;500;600;700&display=swap');
        html { scroll-behavior: smooth; }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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

      {/* --- 1. HEADER & FORM SECTION --- */}
      <section className="relative z-10 pt-16 pb-20 px-4 flex flex-col items-center">
        
        {/* Logo Integration */}
        <div className="w-48 h-16 relative mb-10">
          <Image 
            src="/images/logo_black.png" 
            alt="Al-Musawwir Logo" 
            fill 
            priority
            className="object-contain" 
          />
        </div>

        <div className="text-center mb-10 max-w-xl">
          <h1 className="font-serif italic text-3xl md:text-4xl text-[#1A1817] mb-4">An Invitation to Create</h1>
          <p className="font-sans text-sm md:text-base text-[#5C5855] leading-relaxed">
            Not everybody wants to become a professional artist. But everybody deserves a space to express, explore, and create without fear of judgment.
          </p>
        </div>

        <div className="w-full max-w-xl glass-card rounded-[2rem] shadow-2xl shadow-[#1A1817]/5 overflow-hidden">
          
          <div className="bg-[#1A1817] text-[#F7F5F0] p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35] rounded-full filter blur-[50px] opacity-20"></div>
            <h2 className="font-serif text-3xl text-white relative z-10">Join the Gathering</h2>
            <p className="font-sans text-xs tracking-widest uppercase text-[#F7F5F0]/70 relative z-10 mt-2">Leave your details below</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 flex flex-col gap-8">
            
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

            <div className="space-y-2">
              <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">Anything you want to say? (Optional)</label>
              <textarea name="message" value={formData.message} onChange={handleChange} rows="3" 
                className="bg-white/50 border border-[#1A1817]/20 rounded-xl px-4 py-3 font-serif text-lg text-[#1A1817] focus:outline-none focus:border-[#F9A03F] focus:bg-white transition-all placeholder:text-[#1A1817]/30 resize-none w-full" 
                placeholder="A thought, a question, or what art means to you..."></textarea>
            </div>

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
                <p className="text-center text-[#25D366] font-sans text-[11px] uppercase tracking-widest mt-4 font-bold">Details received. We'll be in touch soon.</p>
              )}
              {status === 'error' && (
                <p className="text-center text-red-500 font-sans text-[11px] uppercase tracking-widest mt-4 font-bold">Something went wrong. Try again.</p>
              )}
            </div>

          </form>
        </div>
      </section>

      {/* --- 2. WHAT IS AL-MUSAWWIR (CONTEXT) --- */}
      <section className="py-20 px-4 md:px-6 relative z-10 border-t border-[#1A1817]/10 bg-white/30 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-light text-[#1A1817] mb-10">What is Al-Musawwir?</h2>
          
          <div className="space-y-6 font-serif text-xl md:text-2xl text-[#5C5855] font-light leading-relaxed px-2">
            <p className="font-sans text-[12px] uppercase tracking-[0.4em] text-[#FF6B35] font-bold">The Philosophy</p>
            <p className="text-[#1A1817] font-medium">The Fashioner. The one who gives form to the formless.</p>
            <p>
              We believe most people are carrying hidden versions of themselves that never get a chance to exist because daily life becomes repetitive, performative, and emotionally disconnected.
            </p>
            <p>
              Al-Musawwir creates experiences where people can temporarily step outside routine identities and reconnect with curiosity, imagination, storytelling, and human connection.
            </p>
            <p className="italic text-[#1A1817]">You do not need permission to call yourself an artist.</p>
          </div>
        </div>
      </section>

      {/* --- 3. FORMATS (EXPLANATION FOR THE FORM CHOICES) --- */}
      <section className="py-20 px-4 md:px-6 relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-light text-[#1A1817]">Our Experimental Formats</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Strokes and Stories */}
          <div className="glass-card p-8 md:p-10 rounded-[2rem]">
            <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#E24E7A] font-bold block mb-4">Volume 01</span>
            <h3 className="font-serif text-3xl text-[#1A1817] mb-4">Strokes & Stories</h3>
            <p className="font-sans text-[#5C5855] leading-relaxed mb-6">
              A guided painting and conversation experience built around freedom, comfort, and connection instead of pressure and performance. Slow, human gatherings where people can create together, meet strangers, and learn gently.
            </p>
            <ul className="space-y-2 font-serif text-lg text-[#1A1817]">
              <li>✦ Intimate setting (max 10 people)</li>
              <li>✦ No painting experience required</li>
              <li>✦ Art, chai, and authentic conversations</li>
            </ul>
          </div>

          {/* BCC */}
          <div className="glass-card p-8 md:p-10 rounded-[2rem]">
            <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#FF6B35] font-bold block mb-4">Volume 02</span>
            <h3 className="font-serif text-3xl text-[#1A1817] mb-4">Broken Camera Crew</h3>
            <p className="font-sans text-[#5C5855] leading-relaxed mb-6">
              A cinematic social experiment where strangers become a temporary film crew for one day. People meet, create stories together, assign roles, improvise scenes, and document each other in the city.
            </p>
            <ul className="space-y-2 font-serif text-lg text-[#1A1817]">
              <li>✦ Participants become directors, actors, & paparazzi</li>
              <li>✦ The city itself becomes the film set</li>
              <li>✦ Focused on creative chaos, not perfection</li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- 4. SOCIAL PROOF / GALLERY (Fast Image Processing) --- */}
      {galleryImages.length > 0 && (
        <section className="py-20 relative z-10 overflow-hidden bg-[#1A1817]">
          <div className="max-w-6xl mx-auto px-4 mb-12 text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-light text-white">Moments Collected</h2>
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#F7F5F0]/60 block mt-4 hidden md:block">Scroll →</span>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-8 snap-x hide-scrollbar px-4 md:px-8">
            {galleryImages.map((filename, index) => (
              <div 
                key={index} 
                className="snap-center shrink-0 w-[260px] md:w-[350px] lg:w-[400px] h-[320px] md:h-[450px] relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group"
              >
                <Image 
                  src={`/images/home/${filename}`} 
                  alt={`Al-Musawwir Gathering - ${filename}`} 
                  fill 
                  quality={85}
                  sizes="(max-width: 768px) 260px, (max-width: 1024px) 350px, 400px"
                  className="object-cover group-hover:scale-105 transition-transform duration-1000" 
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- 5. UNIFIED FOOTER --- */}
      <footer className="py-20 text-center relative z-10 bg-[#F7F5F0] flex flex-col items-center">
        <div className="w-40 h-12 relative mb-6">
          <Image 
            src="/images/logo_black.png" 
            alt="Al-Musawwir Logo" 
            fill 
            className="object-contain opacity-80" 
          />
        </div>
        <p className="font-serif italic text-[#5C5855] text-2xl mb-8 px-4">We create, therefore we are.</p>
        
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mb-6 px-4">
          <Link href="/" className="font-sans text-[10px] text-[#5C5855] tracking-widest uppercase font-bold hover:text-[#FF6B35] transition-colors py-2">Home</Link>
          <span className="w-1 h-1 rounded-full bg-[#1A1817]/20"></span>
          <Link href="/about" className="font-sans text-[10px] text-[#5C5855] tracking-widest uppercase font-bold hover:text-[#FF6B35] transition-colors py-2">About Us</Link>
          <span className="w-1 h-1 rounded-full bg-[#1A1817]/20"></span>
          <a href="mailto:wearemusawwir@gmail.com" className="font-sans text-[10px] text-[#5C5855] tracking-widest uppercase font-bold hover:text-[#FF6B35] transition-colors py-2">Contact</a>
        </div>
        
        <p className="font-sans text-[9px] text-[#5C5855]/60 uppercase tracking-widest">© {new Date().getFullYear()} Al-Musawwir Gatherings. All rights reserved.</p>
      </footer>
    </div>
  );
}