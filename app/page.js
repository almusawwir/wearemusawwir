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
  
  // Navigation scroll state
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
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

  // Fetch Events
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

  // Intersection Observer for scroll animations
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

  // Smart Navigation Scroll Logic
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        // Hide at the very top
        if (currentScrollY < 100) {
          setIsNavVisible(false);
        } 
        // Show when scrolling up
        else if (currentScrollY < lastScrollY) {
          setIsNavVisible(true);
        } 
        // Hide when scrolling down
        else {
          setIsNavVisible(false);
        }
        
        setLastScrollY(currentScrollY);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [lastScrollY]);

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
        .animate-fade-in-up { animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />

      <div className="canvas-texture"></div>

      {/* Smart Floating Navigation */}
      <nav 
        className={`fixed top-4 left-0 right-0 z-[60] flex justify-center px-4 transition-all duration-500 ease-in-out ${
          isNavVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'
        }`}
      >
        <div className="glass-card px-6 py-3 rounded-full shadow-lg flex items-center justify-between gap-4 md:gap-6 max-w-max bg-white/80 border border-white/40">
          <a href="#about-section" className="font-serif italic font-medium text-[#1A1817] hover:text-[#FF6B35] transition-colors cursor-pointer">Al-Musawwir</a>
          <div className="w-1 h-1 rounded-full bg-[#FF6B35] hidden sm:block"></div>
          <Link href="/about" className="font-sans text-[10px] uppercase tracking-widest font-bold text-[#5C5855] hover:text-[#1A1817] transition-colors">About</Link>
          <div className="w-1 h-1 rounded-full bg-[#1A1817]/20"></div>
          <a href="#events" className="font-sans text-[10px] uppercase tracking-widest font-bold text-[#004E98] hover:text-[#FF6B35] transition-colors">Gatherings</a>
        </div>
      </nav>

      {/* Redesigned Premium Cinematic Hero Section */}
      <header className="relative min-h-[100vh] flex flex-col items-center justify-center px-4 md:px-6 overflow-hidden pt-20">
        <div className="absolute inset-0 z-0 bg-[#1A1817]">
          <Image
            src="/images/hero-bg.jpg"
            alt="Al-Musawwir Background"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover"
            style={{ opacity: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1817]/80 via-[#1A1817]/50 to-[#F7F5F0]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center text-center">
          <h1 className="font-serif font-light text-6xl md:text-8xl lg:text-[10rem] tracking-[0.1em] text-white leading-none mb-8 opacity-0 animate-fade-in-up drop-shadow-2xl" style={{ animationDelay: '0.2s' }}>
            AL MUSAWWIR
          </h1>
          
          <div className="w-full opacity-0 animate-fade-in-up flex flex-col items-center" style={{ animationDelay: '0.4s' }}>
            <p className="font-serif italic text-white/90 text-2xl md:text-3xl tracking-wider mb-8 drop-shadow-md font-light">
              We create, therefore we are.
            </p>
            <div className="font-sans font-light text-white/80 text-sm md:text-base leading-relaxed mb-12 space-y-2 max-w-2xl">
              <p>Not everyone calls themselves an artist.</p>
              <p>But everyone imagines, shapes, expresses, remembers, and creates.</p>
              <p>That is the spirit of Al-Musawwir.</p>
              <p>A gathering space for people to paint, reflect, connect, and explore creativity without pressure, perfection, or labels.</p>
            </div>
            <a href="#events" className="inline-block border border-white/30 bg-white/5 backdrop-blur-sm text-white font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold py-4 px-10 rounded-full hover:bg-white hover:text-[#1A1817] transition-all duration-500 hover:scale-105">
              Explore Gatherings
            </a>
          </div>
        </div>
      </header>

      {/* Dynamic Events Section (Untouched) */}
      <section id="events" className="py-24 px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div ref={setRef} className="text-center mb-16 reveal">
            <h2 className="font-serif text-4xl md:text-6xl font-light text-[#1A1817]">Current Volumes</h2>
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
                      <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#FF6B35] mb-2 font-bold">{event.id}</span>
                      <h3 className="font-serif text-3xl md:text-4xl text-[#1A1817] mb-2">{event.title}</h3>
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
                        <div className="flex flex-col gap-1">
                          <span className={`font-sans text-[10px] md:text-[11px] uppercase tracking-widest font-bold flex items-center gap-2 ${isSoldOut ? 'text-[#5C5855]' : 'text-red-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isSoldOut ? 'bg-[#5C5855]' : 'bg-red-500 animate-pulse'}`}></span>
                            {event.status || 'RSVP Open'}
                          </span>
                          <div className="font-serif text-xl text-[#1A1817] flex items-center gap-2">
                            {event.original_price && event.original_price.trim() !== '' && (
                              <span className="text-[#5C5855]/60 line-through text-sm md:text-base">₹{event.original_price}</span>
                            )}
                            <span>₹{event.price || '999'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="hidden sm:block font-sans text-[10px] uppercase tracking-widest text-[#1A1817] font-bold group-hover:text-[#FF6B35] transition-colors">
                            {event.button_text || 'View Details'}
                          </span>
                          <div className="w-10 h-10 rounded-full bg-[#1A1817] text-white flex items-center justify-center group-hover:bg-[#FF6B35] transition-colors shadow-md">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
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

      {/* What is Al-Musawwir Section */}
      <section id="about-section" className="py-24 px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center" ref={setRef}>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-[#1A1817] mb-10 reveal">What is Al-Musawwir?</h2>
          
          <div className="reveal space-y-6 font-serif text-xl md:text-2xl text-[#5C5855] font-light leading-relaxed">
            <p className="font-sans text-[12px] uppercase tracking-[0.4em] text-[#FF6B35] font-bold">Al-Musawwir</p>
            <p className="text-[#1A1817] font-medium">The Fashioner. The one who gives form to the formless.</p>
            <p>
              Across traditions, creation has always been deeply human.<br />
              We gather to paint, reflect, and reconnect with that instinct<br />
              without pressure, perfection, or labels.
            </p>
            <p className="italic text-[#1A1817]">You do not need permission to call yourself an artist.</p>
            <div className="pt-8">
              <a href="#events" className="inline-block border border-[#1A1817]/20 bg-[#1A1817] text-white font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold py-4 px-10 rounded-full hover:bg-[#FF6B35] hover:border-[#FF6B35] transition-all duration-500 hover:-translate-y-1 shadow-lg">
                Come create with us.
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Footer (Untouched) */}
      <footer className="py-20 text-center relative z-10 border-t border-[#1A1817]/10 flex flex-col items-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-[#1A1817] mb-4 font-bold">AL-MUSAWWIR</p>
        <p className="font-serif italic text-[#5C5855] text-2xl mb-8">We create, therefore we are.</p>
        
        <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
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