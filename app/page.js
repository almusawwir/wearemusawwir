"use client";

import React, { useEffect, useRef, useState } from 'react';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";

// Lightweight CSV Parser to replace external dependency
const parseCSV = (text) => {
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
      else current += char;
    }
    result.push(current.trim());
    return result.map(str => str.replace(/^"|"$/g, ''));
  };
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/^\uFEFF/, ''));
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    return headers.reduce((obj, header, i) => { obj[header] = values[i] || ''; return obj; }, {});
  });
};

export default function App() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const revealRefs = useRef([]);

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
    if (id) window.location.href = `/event/${id.trim()}`;
  };

  // Highly optimized scroll handler using requestAnimationFrame
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Only update if state actually changed to prevent re-renders
          setScrolled(prev => {
            const next = currentScrollY > 50;
            return prev !== next ? next : prev;
          });

          // Hide navbar if scrolling down past 300px, show if scrolling up
          setIsNavVisible(prev => {
            let next = prev;
            if (currentScrollY > lastScrollY.current && currentScrollY > 300) {
              next = false;
            } else if (currentScrollY < lastScrollY.current) {
              next = true;
            }
            return prev !== next ? next : prev;
          });
          
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch(CSV_URL)
      .then(res => res.text())
      .then(text => {
        const data = parseCSV(text);
        const validEvents = data.filter(event => {
            const hasId = event.id && event.id.trim() !== '';
            const hasTitle = event.title && event.title.trim() !== '';
            return hasId && hasTitle;
        });
        setEvents(validEvents);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching or parsing CSV:", err);
        setIsLoading(false);
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
      {/* UPDATED FONTS */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');
        
        html { scroll-behavior: smooth; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Outfit', sans-serif; }
        
        /* Texture overlay */
        .canvas-texture {
          position: fixed; inset: 0; z-index: 50; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
          mix-blend-mode: multiply;
        }

        /* Cinematic Animations with GPU Acceleration */
        @keyframes fadeUpIn {
          0% { opacity: 0; transform: translateY(30px); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes fadeDownIn {
          0% { opacity: 0; transform: translateY(-30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes kenBurns {
          0% { transform: scale(1) translateZ(0); }
          100% { transform: scale(1.15) translateZ(0); }
        }
        
        .animate-fade-up { animation: fadeUpIn 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-fade-down { animation: fadeDownIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        
        .animate-ken-burns { 
          animation: kenBurns 30s ease-out forwards; 
          will-change: transform;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          -webkit-transform-style: preserve-3d;
          transform-style: preserve-3d;
        }

        /* General element reveals */
        .reveal { opacity: 0; transform: translateY(40px); transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal.active { opacity: 1; transform: translateY(0); }
        
        /* Glass Cards */
        .glass-card {
          background: rgba(255, 255, 255, 0.5); 
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.7);
        }
      `}} />

      <div className="canvas-texture"></div>

      {/* ✦ DYNAMIC FLOATING NAVIGATION ✦ */}
      <nav className={`fixed left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md transition-all duration-500 animate-fade-down ${scrolled ? 'top-4' : 'top-8'} ${isNavVisible ? 'translate-y-0 opacity-100' : '-translate-y-32 opacity-0 pointer-events-none'}`} style={{ animationDelay: '0.2s' }}>
        <div className={`
          flex items-center justify-between px-8 py-4 rounded-full shadow-2xl transition-all duration-500
          ${scrolled 
            ? 'bg-white/80 backdrop-blur-xl border border-white shadow-[#1A1817]/10' 
            : 'bg-[#1A1817]/20 backdrop-blur-md border border-white/10 text-white shadow-black/20'}
        `}>
          <a href="/about" className={`font-sans text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium transition-colors hover:text-[#FF6B35] ${scrolled ? 'text-[#5C5855]' : 'text-white/80'}`}>
            About
          </a>
          
          <div className="flex flex-col items-center justify-center">
            <span className={`font-serif italic text-lg sm:text-xl leading-none ${scrolled ? 'text-[#1A1817]' : 'text-white'}`}>
              Al-Musawwir
            </span>
            <div className={`w-1 h-1 rounded-full mt-1 ${scrolled ? 'bg-[#FF6B35]' : 'bg-[#FF6B35]/80'}`}></div>
          </div>

          <a href="#events" className={`font-sans text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium transition-colors hover:text-[#FF6B35] ${scrolled ? 'text-[#004E98]' : 'text-white/80'}`}>
            Gatherings
          </a>
        </div>
      </nav>

      {/* ✦ CINEMATIC HERO SECTION ✦ */}
      <header className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0A]">
        {/* Dynamic Background Image with Ken Burns */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 animate-ken-burns">
            <img
              src="/images/hero-bg.jpg"
              alt="Artistic Canvas Background"
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
            />
          </div>
          {/* Deep cinematic gradient overlays to make text pop */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/80 via-transparent to-[#F7F5F0] z-10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0A0A0A_90%)] z-10 opacity-80"></div>
        </div>

        {/* Hero Content */}
        {/* Added pt-24 here to push the hero content down so it clears the floating navigation */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center justify-center pt-24 pb-12">
          
          {/* Wrapper for Title & Geometry to keep them perfectly aligned */}
          <div className="relative flex flex-col items-center text-center animate-fade-up" style={{ animationDelay: '0.4s' }}>
            
            {/* Geometric Lines Lotus (Background Geometry) - Optimized for GPU & Resized */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] sm:w-[90vw] md:w-[70vw] lg:w-[600px] aspect-square z-0 pointer-events-none flex items-center justify-center">
              <svg viewBox="0 0 200 200" 
                   className="w-full h-full text-white/[0.08] animate-[spin_180s_linear_infinite]" 
                   fill="none" 
                   stroke="currentColor" 
                   strokeWidth="0.5"
                   style={{ willChange: 'transform', transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
                <g transform="translate(100, 100)">
                  {/* Overlapping Petals */}
                  {[0, 30, 60, 90, 120, 150].map((deg) => (
                    <path key={`petal-${deg}`} d="M 0,-95 C 25,-40 25,40 0,95 C -25,40 -25,-40 0,-95 Z" transform={`rotate(${deg})`} />
                  ))}
                  {/* Inner Sacred Geometry */}
                  <circle cx="0" cy="0" r="35" />
                  <circle cx="0" cy="0" r="50" strokeDasharray="1 3" />
                  <circle cx="0" cy="0" r="95" strokeWidth="0.2" />
                  {/* Connecting subtle rays */}
                  {[15, 45, 75, 105, 135, 165].map((deg) => (
                     <line key={`ray-${deg}`} x1="0" y1="-35" x2="0" y2="-95" transform={`rotate(${deg})`} strokeDasharray="1 2" strokeWidth="0.3" />
                  ))}
                </g>
              </svg>
            </div>
            
            {/* Main Typographic Lockup */}
            <h1 className="relative z-10 font-serif text-white flex flex-col items-center leading-[0.85] md:leading-[0.8]">
              <span className="text-6xl md:text-[8rem] lg:text-[10rem] font-light tracking-[0.1em] text-white/90">
                AL
              </span>
              <span className="text-[12vw] sm:text-7xl md:text-[9rem] lg:text-[11rem] font-medium tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-[#e0dcd5] mt-2 md:mt-4">
                MUSAWWIR
              </span>
            </h1>

          </div>
          
          {/* Divider Line */}
          <div className="w-px h-16 md:h-24 bg-gradient-to-b from-[#FF6B35] to-transparent my-8 md:my-12 animate-fade-up" style={{ animationDelay: '0.8s' }}></div>

          {/* Quote & CTA */}
          <div className="max-w-2xl mx-auto text-center flex flex-col items-center animate-fade-up" style={{ animationDelay: '1.0s' }}>
            <p className="font-serif italic text-white/80 text-2xl md:text-3xl lg:text-4xl font-light mb-10 md:mb-12">
              "You are the fashioner of your own reality."
            </p>
            <a href="#events" className="group relative overflow-hidden inline-flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/30 text-white font-sans text-xs md:text-sm uppercase tracking-[0.3em] font-medium py-4 px-10 rounded-full hover:bg-white hover:text-[#0A0A0A] transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105">
              <span className="relative z-10">Explore Gatherings</span>
              {/* Button sweep effect */}
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-0"></div>
            </a>
          </div>
          
          {/* Gallery Placard */}
          <div className="mt-16 md:mt-24 w-full max-w-lg md:max-w-3xl ml-auto mr-auto md:mr-0 md:ml-auto animate-fade-up bg-white/5 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-sm relative" style={{ animationDelay: '1.2s' }}>
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40"></div>
            
            <p className="font-sans font-light text-sm md:text-base leading-relaxed text-white/70">
              We believe that art isn't a profession—it's a human right. Whether you're a seasoned painter or haven't touched a brush since school, your story deserves a canvas.
            </p>
            <div className="mt-6 flex items-center gap-6 text-white/50 font-sans text-[9px] uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]"></span> Bangalore
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span> Curated Spaces
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* ✦ DYNAMIC EVENTS SECTION (Original Structure Maintained) ✦ */}
      <section id="events" className="py-24 px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div ref={setRef} className="text-center mb-16 reveal">
            <h2 className="font-serif text-4xl md:text-6xl text-[#1A1817]">Current Volumes</h2>
            <div className="w-12 h-px bg-[#FF6B35] mx-auto mt-6"></div>
          </div>

          {isLoading ? (
            <div className="text-center font-serif text-xl animate-pulse text-[#5C5855]">Summoning canvases...</div>
          ) : events.length === 0 ? (
             <div className="text-center font-serif text-xl text-[#5C5855]">No gatherings currently scheduled. Check back soon!</div>
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
                    className="cursor-pointer reveal glass-card rounded-[2rem] overflow-hidden shadow-2xl shadow-[#1A1817]/5 flex flex-col md:flex-row group hover:-translate-y-2 transition-all duration-500 bg-white/60">
                    
                    {/* Event Card Image */}
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
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
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
                      <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#FF6B35] mb-2 font-medium">{event.id}</span>
                      <h3 className="font-serif text-3xl md:text-4xl text-[#1A1817] mb-2">{event.title}</h3>
                      <p className="font-serif italic text-lg md:text-xl text-[#5C5855] mb-6">{event.tagline}</p>

                      <div className="mb-8">
                        <p className="font-sans text-sm md:text-base text-[#1A1817]/80 leading-relaxed font-light transition-all duration-300">
                          {displayDesc}
                          {isLongDesc && (
                            <button onClick={(e) => toggleExpand(e, event.id)} className="ml-2 font-medium text-[#FF6B35] text-[10px] uppercase tracking-widest hover:text-[#004E98] transition-colors">
                              {isExpanded ? "See Less" : "See More"}
                            </button>
                          )}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                        <div>
                          <span className="font-sans text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#5C5855] mb-1.5 font-medium flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-[#004E98]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            When
                          </span>
                          <span className="font-serif text-lg text-[#1A1817] leading-tight block">{event.date}<br/><span className="font-sans text-xs text-[#5C5855] font-light">{event.time}</span></span>
                        </div>
                        <div>
                          <span className="font-sans text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#5C5855] mb-1.5 font-medium flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-[#E24E7A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            Where
                          </span>
                          <span className="font-serif text-lg text-[#1A1817] leading-tight block">{event.location_main}<br/><span className="font-sans text-xs text-[#5C5855] font-light">{event.location_sub}</span></span>
                        </div>
                        <div>
                          <span className="font-sans text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#5C5855] mb-1.5 font-medium flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-[#FF6B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                            Provided
                          </span>
                          <span className="font-serif text-base text-[#1A1817] leading-tight block line-clamp-2">{event.provided}</span>
                        </div>
                        <div>
                          <span className="font-sans text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#5C5855] mb-1.5 font-medium flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-[#F9A03F]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                            To Bring
                          </span>
                          <span className="font-serif text-base text-[#1A1817] leading-tight block line-clamp-2">{event.bring}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-6 border-t border-[#1A1817]/10 flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <span className={`font-sans text-[10px] md:text-[11px] uppercase tracking-widest font-medium flex items-center gap-2 ${isSoldOut ? 'text-[#5C5855]' : 'text-red-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isSoldOut ? 'bg-[#5C5855]' : 'bg-red-500 animate-pulse'}`}></span>
                            {event.status || 'RSVP Open'}
                          </span>
                          <div className="font-serif text-xl text-[#1A1817] flex items-center gap-2">
                            {event.original_price && event.original_price.trim() !== '' && (
                              <span className="text-[#5C5855]/60 line-through text-sm md:text-base font-sans font-light">₹{event.original_price}</span>
                            )}
                            <span>₹{event.price || '999'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="hidden sm:block font-sans text-[10px] uppercase tracking-widest text-[#1A1817] font-medium group-hover:text-[#FF6B35] transition-colors">
                            {event.button_text || 'View Details'}
                          </span>
                          <div className="w-10 h-10 rounded-full bg-[#1A1817] text-white flex items-center justify-center group-hover:bg-[#FF6B35] transition-colors shadow-md">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
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
        <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-[#1A1817] mb-4 font-medium">AL-MUSAWWIR</p>
        <p className="font-serif italic text-[#5C5855] text-2xl mb-8">We create, therefore we are.</p>
        
        <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
          <a href="/about" className="font-sans text-[10px] text-[#5C5855] tracking-widest uppercase font-medium hover:text-[#FF6B35] transition-colors">About Us</a>
          <span className="w-1 h-1 rounded-full bg-[#1A1817]/20"></span>
          <a href="/terms" className="font-sans text-[10px] text-[#5C5855] tracking-widest uppercase font-medium hover:text-[#FF6B35] transition-colors">Terms & Conditions</a>
          <span className="w-1 h-1 rounded-full bg-[#1A1817]/20"></span>
          <a href="mailto:wearemusawwir@gmail.com" className="font-sans text-[10px] text-[#5C5855] tracking-widest uppercase font-medium hover:text-[#FF6B35] transition-colors">Contact</a>
        </div>
        
        <p className="font-sans text-[9px] text-[#5C5855]/60 uppercase tracking-widest">© {new Date().getFullYear()} Al-Musawwir Gatherings. All rights reserved.</p>
      </footer>
    </div>
  );
}