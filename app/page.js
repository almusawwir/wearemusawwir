"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";

export default function App() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({}); // Tracks which descriptions are open
  const revealRefs = useRef([]);
  const router = useRouter();

  // Helper to add refs for the scroll reveal animation
  const setRef = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  // Safe toggle for the "See More" button so it doesn't open the full page
  const toggleExpand = (e, id) => {
    e.stopPropagation(); // STOPS the card from clicking through to the next page!
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Navigates to the full page if they click anywhere else on the card
  const handleCardClick = (id) => {
    if (id) {
      router.push(`/event/${id.trim()}`);
    }
  };

  // Fetch Data from Google Sheets
  useEffect(() => {
    fetch(CSV_URL)
      .then(res => res.text())
      .then(text => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (h) => h.trim().toLowerCase().replace(/^\uFEFF/, ''),
          complete: (results) => {
            setEvents(results.data);
            setIsLoading(false);
          }
        });
      });
  }, []);

  // Run scroll animations once data is loaded
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

    revealRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [isLoading, events]);

  return (
    <div className="relative overflow-x-hidden w-full bg-[#F7F5F0] text-[#1A1817] font-sans antialiased selection:bg-[#FF6B35] selection:text-white pb-24">
      {/* Global Styles */}
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
        .animate-fade-in-up { animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 15s infinite alternate; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}} />

      <div className="canvas-texture"></div>

      {/* Floating Navigation */}
      <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '1.5s' }}>
        <div className="glass-card px-4 py-2 md:px-6 md:py-3 rounded-full shadow-lg shadow-[#1A1817]/5 flex items-center justify-between gap-3 md:gap-6 w-full max-w-sm md:max-w-max">
          <span className="font-serif italic font-medium text-[#1A1817] text-sm md:text-base">Al-Musawwir</span>
          <div className="w-1 h-1 rounded-full bg-[#FF6B35] shrink-0"></div>
          <a href="#events" className="font-sans text-[9px] md:text-[11px] uppercase tracking-widest font-bold text-[#004E98] hover:text-[#FF6B35] transition-colors text-center">
            Claim Canvas
          </a>
        </div>
      </nav>

      {/* Ambient Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[80vw] md:w-[50vw] h-[80vw] md:h-[50vw] bg-[#FF6B35]/10 rounded-full mix-blend-multiply filter blur-[80px] md:blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[70vw] md:w-[45vw] h-[70vw] md:h-[45vw] bg-[#004E98]/10 rounded-full mix-blend-multiply filter blur-[90px] md:blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[90vw] md:w-[60vw] h-[90vw] md:h-[60vw] bg-[#E24E7A]/10 rounded-full mix-blend-multiply filter blur-[100px] md:blur-[130px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <header className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 md:px-6 overflow-hidden z-10 pt-24 pb-16">
        <div className="flex flex-col items-center max-w-5xl mx-auto w-full">
          <p className="font-serif text-[#FF6B35] text-lg md:text-2xl mb-4 tracking-[0.4em] opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>المصوّر</p>
          <h1 className="font-sans font-light text-4xl sm:text-5xl md:text-7xl lg:text-[8rem] tracking-tight text-[#1A1817] leading-[1.1] mb-8 opacity-0 animate-fade-in-up drop-shadow-sm flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0 w-full" style={{ animationDelay: '0.4s' }}>
            <span>AL</span><span className="text-[#FF6B35] text-3xl sm:text-5xl md:text-7xl align-middle sm:mx-1 md:mx-3">✦</span><span>MUSAWWIR</span>
          </h1>
          <p className="font-serif italic text-[#5C5855] text-xl md:text-4xl tracking-widest mb-12 md:mb-16 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>Strokes & Stories</p>
          
          <div className="glass-card p-6 sm:p-8 md:p-12 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl shadow-[#FF6B35]/5 opacity-0 animate-fade-in-up w-full max-w-3xl relative overflow-hidden text-left sm:text-center" style={{ animationDelay: '0.8s' }}>
            <div className="absolute top-0 left-0 w-1 md:w-2 h-full bg-gradient-to-b from-[#FF6B35] via-[#E24E7A] to-[#004E98]"></div>
            <p className="font-serif text-xl sm:text-2xl md:text-4xl font-light leading-snug text-[#1A1817] mb-6">
              In Sanskrit, <em className="text-[#FF6B35] font-medium">Aham Brahmasmi</em><br/>
              <span className="text-sm md:text-xl text-[#5C5855] font-sans tracking-widest uppercase block mt-2 mb-6">I am the creator</span>
              In Arabic, <em className="text-[#004E98] font-medium">Al-Musawwir</em><br/>
              <span className="text-sm md:text-xl text-[#5C5855] font-sans tracking-widest uppercase block mt-2">The Fashioner</span>
            </p>
            <div className="w-12 md:w-16 h-px bg-[#1A1817]/20 sm:mx-auto my-6 md:my-8"></div>
            <p className="font-sans text-xs sm:text-sm md:text-base text-[#5C5855] tracking-wide leading-relaxed">
              You don't need permission to call yourself an artist. If you feel, observe, shape, or express — you are already a Musawwir. 
              <span className="text-[#E24E7A] block mt-4 italic font-serif text-lg sm:text-xl md:text-2xl tracking-normal">We create, therefore we are.</span>
            </p>
          </div>
        </div>
      </header>

      {/* Dynamic Events Section */}
      <section id="events" className="py-12 md:py-24 px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div ref={setRef} className="text-center mb-8 md:mb-12 reveal">
            <h2 className="font-serif text-3xl md:text-5xl font-light text-[#1A1817]">Gatherings</h2>
          </div>

          {isLoading ? (
            <div className="text-center font-serif text-xl animate-pulse">Summoning canvases...</div>
          ) : (
            <div className="space-y-12">
              {events.map((event) => {
                const isExpanded = expandedCards[event.id];
                const desc = event.description || "";
                const isLongDesc = desc.length > 120;
                const displayDesc = isExpanded ? desc : (isLongDesc ? desc.slice(0, 120) + '...' : desc);

                return (
                  // Using an interactive DIV instead of a LINK so the "See More" button can work!
                  <div 
                    key={event.id} 
                    ref={setRef} 
                    onClick={() => handleCardClick(event.id)}
                    className="cursor-pointer reveal glass-card rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl shadow-[#004E98]/5 flex flex-col md:flex-row group hover:-translate-y-2 transition-transform duration-500"
                  >
                    
                    {/* Event Image */}
                    <div className="w-full md:w-2/5 relative h-56 md:h-auto overflow-hidden">
                      <img src={event.image_url || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200"} 
                           alt={event.title} 
                           className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1817]/70 via-transparent to-transparent flex items-end p-6">
                        <span className="font-sans text-[9px] uppercase tracking-[0.3em] font-bold text-white bg-[#FF6B35] px-3 py-1.5 rounded-full backdrop-blur-md">View Details</span>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="w-full md:w-3/5 p-6 md:p-10 flex flex-col">
                      <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#FF6B35] mb-2 font-bold block">{event.id}</span>
                      <h3 className="font-serif text-3xl md:text-4xl text-[#1A1817] mb-2">{event.title}</h3>
                      <p className="font-serif italic text-lg md:text-xl text-[#5C5855] mb-4">{event.tagline}</p>

                      {/* Expandable Description */}
                      <div className="mb-8">
                        <p className="font-sans text-sm md:text-base text-[#1A1817]/80 leading-relaxed transition-all duration-300">
                          {displayDesc}
                          {isLongDesc && (
                            <button 
                              onClick={(e) => toggleExpand(e, event.id)}
                              className="ml-2 font-sans text-[10px] uppercase tracking-widest font-bold text-[#FF6B35] hover:text-[#004E98] transition-colors"
                            >
                              {isExpanded ? "See Less" : "See More"}
                            </button>
                          )}
                        </p>
                      </div>

                      {/* Full Info Grid from your original design */}
                      <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
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
                          <span className="font-serif text-lg text-[#1A1817] leading-tight block">{event.location_main}<br/><span className="text-sm italic text-[#5C5855]">{event.location_sub}</span></span>
                        </div>
                        <div>
                          <span className="font-sans text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#5C5855] mb-1.5 font-semibold flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-[#FF6B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                            Provided
                          </span>
                          <span className="font-serif text-base text-[#1A1817] leading-tight block line-clamp-2">{event.provided}</span>
                        </div>
                        <div>
                          <span className="font-sans text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#5C5855] mb-1.5 font-semibold flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-[#F9A03F]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                            To Bring
                          </span>
                          <span className="font-serif text-base text-[#1A1817] leading-tight block line-clamp-2">{event.bring}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-6 border-t border-[#1A1817]/10 flex items-center justify-between">
                        <span className="font-sans text-[11px] text-[#5C5855] italic flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                          Limited capacity.
                        </span>
                        <div className="w-10 h-10 rounded-full bg-[#1A1817] text-white flex items-center justify-center group-hover:bg-[#FF6B35] transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
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

      {/* Footer */}
      <footer className="py-12 md:py-16 px-4 md:px-6 text-center relative z-10">
        <div className="w-10 md:w-12 h-px bg-[#1A1817]/20 mx-auto mb-8"></div>
        <p className="font-sans text-[9px] md:text-[11px] uppercase tracking-[0.5em] text-[#1A1817] mb-3 font-bold">AL-MUSAWWIR</p>
        <p className="font-serif italic text-[#5C5855] mb-8 text-lg md:text-xl">We create, therefore we are.</p>
        <a href="mailto:wearemusawwir@gmail.com" className="font-sans text-[9px] md:text-[10px] text-[#5C5855] hover:text-[#FF6B35] transition-colors tracking-[0.2em] uppercase font-bold break-all">wearemusawwir@gmail.com</a>
      </footer>
    </div>
  );
}