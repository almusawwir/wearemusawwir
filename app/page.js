"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Papa from 'papaparse';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";

export default function App() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});
  const revealRefs = useRef([]);
  const router = useRouter();

  const setRef = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  const toggleExpand = (e, id) => {
    e.stopPropagation();
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCardClick = (id) => {
    if (id) router.push(`/event/${id.trim()}`);
  };

  useEffect(() => {
    fetch(CSV_URL)
      .then(res => res.text())
      .then(text => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (h) => h.trim().toLowerCase().replace(/^\uFEFF/, ''),
          complete: (results) => {
            const validEvents = results.data.filter(event => {
                const hasId = event.id && event.id.trim() !== '';
                const hasTitle = event.title && event.title.trim() !== '';
                return hasId && hasTitle;
            });
            
            setEvents(validEvents);
            setIsLoading(false);
          }
        });
      });
  }, []);

  useEffect(() => {
    if (isLoading) return;
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
  }, [isLoading, events]);

  return (
    <div className="relative overflow-x-hidden w-full bg-[#F7F5F0] text-[#1A1817] font-sans antialiased selection:bg-[#FF6B35] selection:text-white pb-24">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Manrope:wght@200;300;400;500;600;700&display=swap');
        html { scroll-behavior: smooth; }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }
        .canvas-texture {
          position: fixed; inset: 0; z-index: 50; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
          mix-blend-mode: multiply;
        }
        .reveal { opacity: 0; transform: translateY(40px); transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal.active { opacity: 1; transform: translateY(0); }
        .glass-card {
          background: rgba(255, 255, 255, 0.5); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.7);
        }
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .hero-blur { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}} />

      <div className="canvas-texture"></div>

      {/* Floating Navigation */}
      <nav className="fixed top-6 left-0 right-0 z-[60] flex justify-center px-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '1.5s' }}>
        <div className="glass-card px-6 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-between gap-5 md:gap-8 max-w-max bg-white/80">
          <span className="font-serif italic font-semibold text-[#1A1817] text-lg tracking-wide">Al-Musawwir</span>
          <div className="w-1 h-1 rounded-full bg-[#FF6B35] hidden sm:block"></div>
          <Link href="/about" className="font-sans text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold text-[#5C5855] hover:text-[#1A1817] transition-colors">About</Link>
          <div className="w-1 h-1 rounded-full bg-[#1A1817]/20"></div>
          <a href="#events" className="font-sans text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold text-[#004E98] hover:text-[#FF6B35] transition-colors">Gatherings</a>
        </div>
      </nav>

      {/* Refined Cinematic Hero Section */}
      <header className="relative min-h-[90vh] md:min-h-[100vh] flex flex-col items-center justify-center px-4 md:px-8 overflow-hidden pt-24 pb-12">
        <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
          <Image
            src="/images/hero-bg.jpg"
            alt="Al-Musawwir Canvas Background"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover opacity-60 scale-105"
          />
          {/* Enhanced Gradient for better text readability and smoother transition to the off-white body */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1817]/80 via-transparent to-[#F7F5F0]"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center text-center mt-auto md:mt-0">
          
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <p className="font-serif text-[#FF6B35] text-xl md:text-2xl mb-4 tracking-[0.8em] drop-shadow-md">
              المصوّر
            </p>
            <h1 className="font-sans font-light text-6xl md:text-8xl lg:text-[10rem] tracking-tighter text-white leading-[0.85] mb-8 drop-shadow-lg">
              AL <span className="text-[#FF6B35] italic font-serif">✦</span> MUSAWWIR
            </h1>
          </div>
          
          <div className="max-w-3xl mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <p className="font-serif italic text-white/90 text-2xl md:text-4xl lg:text-5xl tracking-wide mb-10 drop-shadow-md leading-tight">
              "You are the fashioner of your own reality."
            </p>
            <a href="#events" className="inline-block bg-white text-[#1A1817] font-sans text-xs md:text-sm uppercase tracking-[0.25em] font-bold py-5 px-12 rounded-full hover:bg-[#FF6B35] hover:text-white transition-all duration-500 shadow-[0_0_40px_rgba(255,107,53,0.3)] hover:shadow-[0_0_60px_rgba(255,107,53,0.5)] hover:-translate-y-1 mb-16 md:mb-24">
              Explore Gatherings
            </a>
          </div>
          
          {/* Redesigned Glass Hero Card */}
          <div className="hero-blur p-8 md:p-12 rounded-[2.5rem] shadow-2xl opacity-0 animate-fade-in-up w-full max-w-3xl text-left border border-white/10 bg-[#1A1817]/40 relative overflow-hidden group" style={{ animationDelay: '0.8s' }}>
             {/* Subtle gradient orb inside the card */}
            <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-[#FF6B35] rounded-full filter blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="hidden md:flex flex-col items-center shrink-0">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-4 text-white/50">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
                </div>
                <div className="w-px h-24 bg-gradient-to-b from-white/20 to-transparent"></div>
              </div>
              
              <div className="space-y-6">
                <p className="font-serif text-2xl md:text-3xl leading-snug text-white/95">
                  We believe that art isn't a profession—it's a human right. Whether you're a seasoned painter or haven't touched a brush since school, your story deserves a canvas.
                </p>
                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white/60 font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold pt-2">
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5"><span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]"></span> Bangalore</span>
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5"><span className="w-1.5 h-1.5 rounded-full bg-[#004E98]"></span> Safe Space</span>
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5"><span className="w-1.5 h-1.5 rounded-full bg-[#E24E7A]"></span> All Materials Provided</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dynamic Events Section */}
      <section id="events" className="py-24 md:py-32 px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div ref={setRef} className="text-center mb-16 md:mb-20 reveal">
            <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#FF6B35] font-bold block mb-4">The Archives</span>
            <h2 className="font-serif text-5xl md:text-6xl text-[#1A1817]">Current Volumes</h2>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
               <div className="w-12 h-12 border-2 border-[#1A1817]/20 border-t-[#FF6B35] rounded-full animate-spin"></div>
               <div className="font-serif text-xl animate-pulse text-[#5C5855]">Summoning canvases...</div>
            </div>
          ) : events.length === 0 ? (
             <div className="text-center bg-white/50 border border-[#1A1817]/10 rounded-3xl py-16 px-6 shadow-sm">
                 <p className="font-serif italic text-2xl text-[#5C5855] mb-2">The studio is currently quiet.</p>
                 <p className="font-sans text-xs uppercase tracking-widest text-[#1A1817] font-bold">No gatherings scheduled. Check back soon.</p>
             </div>
          ) : (
            <div className="space-y-16">
              {events.map((event) => {
                const isExpanded = expandedCards[event.id];
                const desc = event.description || "";
                const isLongDesc = desc.length > 120;
                const displayDesc = isExpanded ? desc : (isLongDesc ? desc.slice(0, 120) + '...' : desc);
                const isSoldOut = event.status && (event.status.toLowerCase().includes('sold') || event.status.toLowerCase().includes('closed'));
                const isExternalImage = event.image_url && event.image_url.startsWith('http');

                return (
                  <div key={event.id} ref={setRef} onClick={() => handleCardClick(event.id)}
                    className="cursor-pointer reveal glass-card rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#1A1817]/5 flex flex-col md:flex-row group hover:-translate-y-2 hover:shadow-[#1A1817]/10 transition-all duration-500 bg-white/60">
                    
                    <div className="w-full md:w-2/5 relative h-64 md:h-auto min-h-[16rem] overflow-hidden bg-[#1A1817]">
                      {event.image_url ? (
                        isExternalImage ? (
                          <img
                            src={event.image_url}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                            alt={event.title}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <Image
                            src={event.image_url}
                            alt={event.title}
                            fill
                            quality={75}
                            sizes="(max-width: 768px) 100vw, 40vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-1000"
                            loading="lazy"
                          />
                        )
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#004E98]/20">
                          <span className="font-serif italic text-[#F7F5F0]/50 text-sm">Artwork Pending</span>
                        </div>
                      )}
                    </div>

                    <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col">
                      <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#FF6B35] mb-3 font-bold">{event.id}</span>
                      <h3 className="font-serif text-3xl md:text-4xl text-[#1A1817] mb-2 leading-tight">{event.title}</h3>
                      <p className="font-serif italic text-lg md:text-xl text-[#5C5855] mb-6">{event.tagline}</p>

                      <div className="mb-8">
                        <p className="font-sans text-sm md:text-base text-[#1A1817]/80 leading-relaxed transition-all duration-300">
                          {displayDesc}
                          {isLongDesc && (
                            <button onClick={(e) => toggleExpand(e, event.id)} className="ml-2 font-bold text-[#FF6B35] text-[10px] uppercase tracking-widest hover:text-[#004E98] transition-colors">
                              {isExpanded ? "See Less" : "See More"}
                            </button>
                          )}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8 bg-[#1A1817]/5 p-5 md:p-6 rounded-2xl border border-[#1A1817]/5">
                        <div>
                          <span className="font-sans text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#5C5855] mb-1.5 font-semibold flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-[#004E98]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            When
                          </span>
                          <span className="font-serif text-lg text-[#1A1817] leading-tight block">{event.date}<br/><span className="text-sm italic text-[#5C5855]">{event.time}</span></span>
                        </div>
                        <div>
                          <span className="font-sans text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#5C5855] mb-1.5 font-semibold flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-[#E24E7A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            Where
                          </span>
                          <span className="font-serif text-lg text-[#1A1817] leading-tight block">{event.location_main}<br/><span className="text-sm italic text-[#5C5855] line-clamp-1">{event.location_sub}</span></span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-sans text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#5C5855] mb-1.5 font-semibold flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-[#FF6B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                            Focus
                          </span>
                          <span className="font-serif text-base text-[#1A1817] leading-tight block line-clamp-1">{event.provided}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <span className={`font-sans text-[10px] md:text-[11px] uppercase tracking-widest font-bold flex items-center gap-2 ${isSoldOut ? 'text-[#5C5855]' : 'text-[#25D366]'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isSoldOut ? 'bg-[#5C5855]' : 'bg-[#25D366] animate-pulse'}`}></span>
                            {event.status || 'RSVP Open'}
                          </span>
                          <div className="font-serif text-2xl text-[#1A1817] flex items-center gap-2">
                            {event.original_price && event.original_price.trim() !== '' && (
                              <span className="text-[#5C5855]/50 line-through text-base">₹{event.original_price}</span>
                            )}
                            <span>₹{event.price || '999'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="hidden sm:block font-sans text-[10px] uppercase tracking-widest text-[#1A1817] font-bold group-hover:text-[#FF6B35] transition-colors">
                            {event.button_text || 'View Canvas'}
                          </span>
                          <div className="w-12 h-12 rounded-full bg-[#1A1817] text-white flex items-center justify-center group-hover:bg-[#FF6B35] group-hover:scale-110 transition-all duration-300 shadow-lg">
                            <svg className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Unified Footer */}
      <footer className="py-20 text-center relative z-10 border-t border-[#1A1817]/10 flex flex-col items-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-[#1A1817] mb-4 font-bold">AL-MUSAWWIR</p>
        <p className="font-serif italic text-[#5C5855] text-2xl mb-8">We create, therefore we are.</p>
        
        <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
          <Link href="/about" className="font-sans text-[10px] text-[#5C5855] tracking-widest uppercase font-bold hover:text-[#FF6B35] transition-colors">About Us</Link>
          <span className="w-1 h-1 rounded-full bg-[#1A1817]/20"></span>
          <Link href="/terms" className="font-sans text-[10px] text-[#5C5855] tracking-widest uppercase font-bold hover:text-[#FF6B35] transition-colors">Terms & Conditions</Link>
          <span className="w-1 h-1 rounded-full bg-[#1A1817]/20"></span>
          <a href="mailto:wearemusawwir@gmail.com" className="font-sans text-[10px] text-[#5C5855] tracking-widest uppercase font-bold hover:text-[#FF6B35] transition-colors">Contact</a>
        </div>
        
        <p className="font-sans text-[9px] text-[#5C5855]/60 uppercase tracking-widest">© {new Date().getFullYear()} Al-Musawwir Gatherings. All rights reserved.</p>
      </footer>
    </div>
  );
}