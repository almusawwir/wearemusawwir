"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  const revealRefs = useRef([]);

  // Fetch dynamic gallery images
  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setGalleryImages(data);
      })
      .catch(err => console.error("Could not load gallery images:", err));
  }, []);

  // Scroll Reveal Animation Observer
  const setRef = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  useEffect(() => {
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    revealRefs.current.forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, [galleryImages]);

  // Accidental Exit Prevention
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

    const scriptURL = 'https://script.google.com/macros/s/AKfycbzvmQy_HZOGPq1KrNg3hE8DF1NCwrwv00aFSgb8naf4Wm0FX-sV7PeeI7ijrwN2QBeT/exec';

    try {
      await fetch(scriptURL, { method: 'POST', body: data, mode: 'no-cors' });
      setStatus('success');
      setFormData({ name: '', whatsapp: '', interest: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-[#F7F5F0] text-[#1A1817] font-sans antialiased selection:bg-[#ff0064] selection:text-white min-h-screen relative overflow-x-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Manrope:wght@200;300;400;500;600;700&display=swap');
        html { scroll-behavior: smooth; }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Fast CSS Texture */
        .canvas-texture {
            position: fixed; inset: 0; z-index: 0; pointer-events: none;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
            mix-blend-mode: multiply;
        }
        
        /* Animations */
        .reveal { opacity: 0; transform: translateY(30px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal.active { opacity: 1; transform: translateY(0); }
        
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes fadeIn { 0% { opacity: 0; backdrop-filter: blur(0px); } 100% { opacity: 1; backdrop-filter: blur(12px); } }
        .animate-fade-in-blur { animation: fadeIn 0.4s ease-out forwards; }
      `}} />

      <div className="canvas-texture"></div>

      {/* --- SUCCESS MODAL OVERLAY --- */}
      {status === 'success' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F7F5F0]/90 animate-fade-in-blur px-4">
          <div className="bg-white/80 border border-[#1A1817]/10 p-10 md:p-14 rounded-[2rem] shadow-2xl text-center max-w-lg w-full flex flex-col items-center animate-fade-in-up relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff0064] rounded-full filter blur-[60px] opacity-10"></div>
            <div className="w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="font-serif italic text-4xl text-[#1A1817] mb-4">You're on the list.</h2>
            <p className="font-sans text-sm md:text-base text-[#5C5855] leading-relaxed mb-8">
              We have received your details. We will keep you updated via WhatsApp when the next gathering is ready.
            </p>
            <Link href="/" className="bg-[#1A1817] text-white font-sans text-xs uppercase tracking-[0.2em] font-bold py-4 px-8 rounded-xl hover:bg-[#ff0064] transition-all hover:shadow-xl hover:-translate-y-1">
              Return Home
            </Link>
          </div>
        </div>
      )}

      {/* --- 1. HERO & FORM SECTION --- */}
      <section className="relative pt-16 pb-20 px-4 flex flex-col items-center min-h-screen justify-center z-10">
        
        {/* Logo Fast Load */}
        <div className="w-48 h-16 relative mb-8 animate-fade-in-up">
          <Image src="/images/logo_black.png" alt="Al-Musawwir Logo" fill priority className="object-contain" />
        </div>

        {/* Simplified Header */}
        <div className="text-center mb-10 max-w-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="font-serif italic text-4xl md:text-5xl text-[#1A1817] mb-4">Join the Community</h1>
          <p className="font-sans text-sm md:text-base text-[#5C5855] leading-relaxed font-medium">
            Curated creative gatherings for expression and creation.
          </p>
        </div>

        {/* Clean, Fast Form Card */}
        <div className="w-full max-w-xl bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-2xl shadow-[#1A1817]/5 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          
          <div className="bg-[#ff0064] text-[#F7F5F0] p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full filter blur-[60px] opacity-20"></div>
            <h2 className="font-serif text-3xl text-white relative z-10">Stay in the loop</h2>
            <p className="font-sans text-[10px] tracking-widest uppercase text-[#F7F5F0]/90 relative z-10 mt-2 font-bold">Leave your details and we'll keep you updated</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 flex flex-col gap-8 bg-white/40">
            
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required 
                  className="bg-white/70 border border-[#1A1817]/10 rounded-xl px-4 py-3 font-serif text-lg text-[#1A1817] focus:outline-none focus:border-[#ff0064] focus:ring-1 focus:ring-[#ff0064]/30 focus:bg-white transition-all placeholder:text-[#1A1817]/30" 
                  placeholder="Your name" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">WhatsApp Number *</label>
                <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} required 
                  className="bg-white/70 border border-[#1A1817]/10 rounded-xl px-4 py-3 font-sans text-base text-[#1A1817] focus:outline-none focus:border-[#ff0064] focus:ring-1 focus:ring-[#ff0064]/30 focus:bg-white transition-all placeholder:text-[#1A1817]/30" 
                  placeholder="+91 00000 00000" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">What are you drawn to? *</label>
              <div className="grid grid-cols-1 gap-3">
                
                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.interest === 'Strokes and Stories' ? 'border-[#ff0064] bg-[#ff0064]/5 shadow-sm' : 'border-[#1A1817]/10 bg-white/50 hover:bg-white/80'}`}>
                  <input type="radio" name="interest" value="Strokes and Stories" checked={formData.interest === 'Strokes and Stories'} onChange={handleChange} required className="w-4 h-4 text-[#ff0064] focus:ring-[#ff0064] accent-[#ff0064]" />
                  <div>
                    <span className="font-serif text-[1.1rem] text-[#1A1817] block leading-tight">Strokes & Stories</span>
                    <span className="font-sans text-[10px] text-[#5C5855] uppercase tracking-widest">Guided painting & connection</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.interest === 'Broken Camera Crew' ? 'border-[#ff0064] bg-[#ff0064]/5 shadow-sm' : 'border-[#1A1817]/10 bg-white/50 hover:bg-white/80'}`}>
                  <input type="radio" name="interest" value="Broken Camera Crew" checked={formData.interest === 'Broken Camera Crew'} onChange={handleChange} required className="w-4 h-4 text-[#ff0064] focus:ring-[#ff0064] accent-[#ff0064]" />
                  <div>
                    <span className="font-serif text-[1.1rem] text-[#1A1817] block leading-tight">Broken Camera Crew (BCC)</span>
                    <span className="font-sans text-[10px] text-[#5C5855] uppercase tracking-widest">Cinematic chaos experiment</span>
                  </div>
                </label>

              </div>
            </div>

            <div className="space-y-2">
              <label className="font-sans text-xs font-bold text-[#1A1817] uppercase tracking-wider">Anything you want to say? (Optional)</label>
              <textarea name="message" value={formData.message} onChange={handleChange} rows="3" 
                className="bg-white/70 border border-[#1A1817]/10 rounded-xl px-4 py-3 font-serif text-lg text-[#1A1817] focus:outline-none focus:border-[#ff0064] focus:ring-1 focus:ring-[#ff0064]/30 focus:bg-white transition-all placeholder:text-[#1A1817]/30 resize-none w-full" 
                placeholder="A thought, a question, or what art means to you..."></textarea>
            </div>

            <div className="pt-4 border-t border-[#1A1817]/10">
              <button type="submit" disabled={status === 'loading'}
                className={`w-full text-white font-sans text-sm uppercase tracking-[0.2em] font-bold py-5 px-8 rounded-xl transition-all flex items-center justify-center 
                  ${status === 'loading' ? 'bg-[#ff0064]/80 cursor-wait' : 'bg-[#1A1817] hover:bg-[#ff0064] hover:shadow-xl hover:-translate-y-1'}
                `}>
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Details...
                  </span>
                ) : (
                  <span>Send Details</span>
                )}
              </button>
              
              {status === 'error' && (
                <p className="text-center text-red-500 font-sans text-[11px] uppercase tracking-widest mt-4 font-bold">Something went wrong. Try again.</p>
              )}
            </div>

          </form>
        </div>
      </section>

      {/* --- 2. WHAT IS AL-MUSAWWIR (CONTEXT) --- */}
      <section className="py-24 px-4 md:px-6 relative z-10 border-t border-[#1A1817]/5 bg-transparent">
        <div ref={setRef} className="max-w-3xl mx-auto text-center reveal">
          <h2 className="font-serif text-4xl md:text-5xl font-light text-[#1A1817] mb-10">What is Al-Musawwir?</h2>
          
          <div className="space-y-6 font-serif text-xl md:text-2xl text-[#5C5855] font-light leading-relaxed px-2">
            <p className="font-sans text-[12px] uppercase tracking-[0.4em] text-[#ff0064] font-bold">The Philosophy</p>
            <p className="text-[#1A1817] font-medium">The Fashioner. The one who gives form to the formless.</p>
            <p>
              We believe most people are carrying hidden versions of themselves that never get a chance to exist because daily life becomes repetitive, performative, and emotionally disconnected.
            </p>
            <p>
              Al-Musawwir creates experiences where people can temporarily step outside routine identities and reconnect with curiosity, imagination, storytelling, and human connection.
            </p>
            <p className="italic text-[#1A1817]">We create, therefore we are.</p>
          </div>
        </div>
      </section>

      {/* --- 3. FORMATS (EXPLANATION FOR THE FORM CHOICES) --- */}
      <section className="py-24 px-4 md:px-6 relative z-10 max-w-5xl mx-auto">
        <div ref={setRef} className="text-center mb-16 reveal">
          <h2 className="font-serif text-3xl md:text-4xl font-light text-[#1A1817]">Our Experimental Formats</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Strokes and Stories */}
          <div ref={setRef} className="bg-white/60 border border-white/80 p-8 md:p-10 rounded-[2rem] reveal hover:-translate-y-2 transition-transform duration-500 shadow-xl shadow-[#1A1817]/5">
            <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#ff0064] font-bold block mb-4">Format 01</span>
            <h3 className="font-serif text-3xl text-[#1A1817] mb-4">Strokes & Stories</h3>
            <p className="font-serif italic text-xl text-[#1A1817] mb-4">A guided painting gathering built around expression, connection, and shared creativity.</p>
            <p className="font-sans text-[#5C5855] leading-relaxed mb-6">
              This is not a traditional art class, a networking, or a dating event. It is a calm creative gathering where people come together to slow down, paint freely, and reconnect with expression. Through a guided layered process, you won't recreate the same artwork as everyone else—you will learn how to begin creating freely and intuitively to build something entirely your own.
            </p>
            <ul className="space-y-3 font-serif text-lg text-[#1A1817]">
              <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#ff0064] block"></span> No pressure. No perfection. No prior experience.</li>
              <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#ff0064] block"></span> We provide the canvas, paints, and guidance.</li>
              <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#ff0064] block"></span> Bring your curiosity and a love for creation.</li>
            </ul>
          </div>

          {/* BCC */}
          <div ref={setRef} className="bg-white/60 border border-white/80 p-8 md:p-10 rounded-[2rem] reveal hover:-translate-y-2 transition-transform duration-500 shadow-xl shadow-[#1A1817]/5" style={{ transitionDelay: '0.1s' }}>
            <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#ff0064] font-bold block mb-4">Format 02</span>
            <h3 className="font-serif text-3xl text-[#1A1817] mb-4">Broken Camera Crew</h3>
            <p className="font-serif italic text-xl text-[#1A1817] mb-4">A one-day cinematic chaos experience across Bangalore.</p>
            <p className="font-sans text-[#5C5855] leading-relaxed mb-6">
              Strangers come together to collaboratively build a story on the spot, assign random character roles, explore real city locations, improvise scenes, and shoot chaotic footage. The focus is on participation, spontaneity, and shared expression—not professional output. No acting or filmmaking experience required.
            </p>
            <ul className="space-y-3 font-serif text-lg text-[#1A1817] font-medium italic">
              <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#ff0064] block not-italic"></span> The city becomes the set.</li>
              <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#ff0064] block not-italic"></span> The people become the crew.</li>
              <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#ff0064] block not-italic"></span> The day becomes the film.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- 4. SOCIAL PROOF / GALLERY (Fast Lazy Loading) --- */}
      {galleryImages.length > 0 && (
        <section className="py-24 relative z-10 overflow-hidden bg-[#ff0064]">
          <div ref={setRef} className="max-w-6xl mx-auto px-4 mb-12 text-center reveal">
            <h2 className="font-serif text-4xl md:text-5xl font-light text-white">Moments Collected</h2>
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#F7F5F0]/80 block mt-4 hidden md:block">Scroll →</span>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-8 snap-x hide-scrollbar px-4 md:px-8">
            {galleryImages.map((filename, index) => (
              <div 
                key={index} 
                className="snap-center shrink-0 w-[260px] md:w-[350px] lg:w-[400px] h-[320px] md:h-[450px] relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 group bg-black/10"
              >
                <Image 
                  src={`/images/home/${filename}`} 
                  alt={`Al-Musawwir Gathering - ${filename}`} 
                  fill 
                  quality={75}
                  sizes="(max-width: 768px) 260px, (max-width: 1024px) 350px, 400px"
                  className="object-cover group-hover:scale-105 transition-transform duration-1000" 
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- 5. UNIFIED FOOTER --- */}
      <footer className="py-20 text-center relative z-10 bg-[#F7F5F0] flex flex-col items-center border-t border-[#1A1817]/10">
        <div className="w-40 h-12 relative mb-6">
          <Image src="/images/logo_black.png" alt="Al-Musawwir Logo" fill className="object-contain opacity-80" />
        </div>
        <p className="font-serif italic text-[#5C5855] text-2xl mb-8 px-4">We create, therefore we are.</p>
        
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mb-6 px-4">
          <Link href="/" className="font-sans text-[10px] text-[#5C5855] tracking-widest uppercase font-bold hover:text-[#ff0064] transition-colors py-2">Home</Link>
          <span className="w-1 h-1 rounded-full bg-[#1A1817]/20"></span>
          <Link href="/about" className="font-sans text-[10px] text-[#5C5855] tracking-widest uppercase font-bold hover:text-[#ff0064] transition-colors py-2">About Us</Link>
          <span className="w-1 h-1 rounded-full bg-[#1A1817]/20"></span>
          <a href="mailto:wearemusawwir@gmail.com" className="font-sans text-[10px] text-[#5C5855] tracking-widest uppercase font-bold hover:text-[#ff0064] transition-colors py-2">Contact</a>
        </div>
        
        <p className="font-sans text-[9px] text-[#5C5855]/60 uppercase tracking-widest">© {new Date().getFullYear()} Al-Musawwir Gatherings. All rights reserved.</p>
      </footer>
    </div>
  );
}
