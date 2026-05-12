"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Papa from 'papaparse';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'open', 'past'
  const [expandedCards, setExpandedCards] = useState({});
  const router = useRouter();

  // Navigation scroll state
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
            setFilteredEvents(validEvents); // Default to all
            setIsLoading(false);
          }
        });
      });
  }, []);

  // Filter Logic
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredEvents(events);
    } else if (activeFilter === 'open') {
      setFilteredEvents(events.filter(e => {
        const status = (e.status || '').toLowerCase();
        return !status.includes('sold') && !status.includes('closed');
      }));
    } else if (activeFilter === 'past') {
      setFilteredEvents(events.filter(e => {
        const status = (e.status || '').toLowerCase();
        return status.includes('sold') || status.includes('closed');
      }));
    }
  }, [activeFilter, events]);

  // Smart Navigation Scroll Logic
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY <= 50) setIsNavVisible(true);
        else if (currentScrollY < lastScrollY) setIsNavVisible(true);
        else setIsNavVisible(false);
        setLastScrollY(currentScrollY);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [lastScrollY]);

  return (
    <div className="relative min-h-screen w-full bg-[#F7F5F0] text-[#1A1817] font-sans antialiased selection:bg-[#FF6B35] selection:text-white pb-24">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Manrope:wght@200;300;400;500;600;700&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }
        .canvas-texture {
          position: fixed; inset: 0; z-index: 50; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
          mix-blend-mode: multiply;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.5); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.7);
        }
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />

      <div className="canvas-texture"></div>

      {/* Floating Navigation */}
      <nav 
        className={`fixed top-4 left-0 right-0 z-[60] flex justify-center px-4 transition-all duration-500 ease-in-out ${
          isNavVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'
        }`}
      >
        <div className="glass-card px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg flex items-center justify-between gap-3 sm:gap-6 max-w-max bg-white/90 sm:bg-white/80 border border-white/40">
          <Link href="/" className="cursor-pointer mr-1 sm:mr-0 shrink-0 flex items-center hover:opacity-70 transition-opacity">
            <Image src="/images/logo.png" alt="Al-Musawwir" width={120} height={30} className="h-5 sm:h-6 w-auto object-contain" />
          </Link>
          <div className="w-1 h-1 rounded-full bg-[#FF6B35] hidden sm:block"></div>
          <Link href="/about" className="font-sans text-[11px] sm:text-[10px] uppercase tracking-widest font-bold text-[#5C5855] hover:text-[#1A1817] transition-colors py-2 px-1 sm:p-0">About</Link>
          <div className="w-1 h-1 rounded-full bg-[#1A1817]/20 hidden sm:block"></div>
          <Link href="/events" className="font-sans text-[11px] sm:text-[10px] uppercase tracking-widest font-bold text-[#FF6B35] transition-colors py-2 px-1 sm:p-0">Gatherings</Link>
        </div>
      </nav>

      {/* Events Hero Section */}
      <header className="relative pt-32 pb-16 md:pt-40 md:pb-20 px-4 md:px-6 flex flex-col items-center text-center z-10 border-b border-[#1A1817]/5">
        <h1 className="font-serif text-5xl md:text-7xl font-light text-[#1A1817] mb-6 animate-fade-in-up">The Archives</h1>
        <p className="font-serif italic text-xl md:text-2xl text-[#5C5855] max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Every canvas has a story. Explore our upcoming volumes and look back at the art we've shared together.
        </p>
      </header>

      {/* Filtering Section */}
      <div className="sticky top-20 z-50 py-6 px-4 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-[#1A1817]/10 shadow-lg flex items-center gap-1">
          {['all', 'open', 'past'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setActiveFilter(filterType)}
              className={`font-sans text-[10px] uppercase tracking-widest font-bold py-2.5 px-6 rounded-full transition-all duration-300 ${
                activeFilter === filterType 
                  ? 'bg-[#1A1817] text-white shadow-md' 
                  : 'text-[#5C5855] hover:text-[#1A1817] hover:bg-black/5'
              }`}
            >
              {filterType === 'all' ? 'All' : filterType === 'open' ? 'Open Spots' : 'Past Volumes'}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <section className="py-12 px-4 md:px-6 relative z-10 min-h-[50vh]">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center font-serif text-xl animate-pulse text-[#5C5855] mt-12">Summoning canvases...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center mt-20 flex flex-col items-center animate-fade-in-up">
               <svg className="w-16 h-16 text-[#1A1817]/20 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
               <h3 className="font-serif text-3xl text-[#1A1817] mb-2">No volumes found.</h3>
               <p className="font-sans text-sm text-[#5C5855] uppercase tracking-widest">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {filteredEvents.map((event, index) => {
                const isExpanded = expandedCards[event.id];
                const desc = event.description || "";
                const isLongDesc = desc.length > 120;
                const displayDesc = isExpanded ? desc : (isLongDesc ? desc.slice(0, 120) + '...' : desc);
                const isSoldOut = event.status && (event.status.toLowerCase().includes('sold') || event.status.toLowerCase().includes('closed'));
                const isExternalImage = event.image_url && event.image_url.startsWith('http');

                return (
                  <div key={event.id} onClick={() => handleCardClick(event.id)}
                    className="cursor-pointer animate-fade-in-up glass-card rounded-[2rem] overflow-hidden shadow-2xl shadow-[#1A1817]/5 flex flex-col md:flex-row group hover:-translate-y-2 transition-all duration-500 bg-white/60"
                    style={{ animationDelay: `${index * 0.1}s` }}>
                    
                    {/* Event Card Image */}
                    <div className="w-full md:w-2/5 relative h-64 md:h-auto min-h-[16rem] overflow-hidden bg-[#1A1817]">
                      {event.image_url ? (
                        isExternalImage ? (
                          <img src={event.image_url} className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ${isSoldOut ? 'grayscale opacity-80' : ''}`} alt={event.title} loading="lazy" />
                        ) : (
                          <Image src={event.image_url} alt={event.title} fill quality={75} sizes="(max-width: 768px) 100vw, 40vw" className={`object-cover group-hover:scale-105 transition-transform duration-1000 ${isSoldOut ? 'grayscale opacity-80' : ''}`} loading="lazy" />
                        )
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#004E98]/20">
                          <span className="font-serif italic text-[#F7F5F0]/50 text-sm">Artwork Pending</span>
                        </div>
                      )}
                      
                      {/* Sold Out Overlay Tag */}
                      {isSoldOut && (
                        <div className="absolute top-4 left-4 bg-[#1A1817] text-white font-sans text-[9px] uppercase tracking-widest font-bold py-1.5 px-3 rounded-full">
                          Archived
                        </div>
                      )}
                    </div>

                    <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col">
                      <span className={`font-sans text-[10px] uppercase tracking-[0.4em] mb-2 font-bold ${isSoldOut ? 'text-[#5C5855]' : 'text-[#FF6B35]'}`}>{event.id}</span>
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

                      <div className="mt-auto pt-6 border-t border-[#1A1817]/10 flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <span className={`font-sans text-[10px] md:text-[11px] uppercase tracking-widest font-bold flex items-center gap-2 ${isSoldOut ? 'text-[#5C5855]' : 'text-red-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isSoldOut ? 'bg-[#5C5855]' : 'bg-red-500 animate-pulse'}`}></span>
                            {event.status || 'RSVP Open'}
                          </span>
                          <div className="font-serif text-xl text-[#1A1817] flex items-center gap-2">
                            <span>₹{event.price || '999'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="hidden sm:block font-sans text-[10px] uppercase tracking-widest text-[#1A1817] font-bold group-hover:text-[#FF6B35] transition-colors">
                            {isSoldOut ? 'View Gallery' : (event.button_text || 'View Details')}
                          </span>
                          <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center transition-colors shadow-md ${isSoldOut ? 'bg-[#5C5855] group-hover:bg-[#1A1817]' : 'bg-[#1A1817] group-hover:bg-[#FF6B35]'}`}>
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

      {/* Newsletter / WhatsApp CTA */}
      <section className="py-24 px-4 md:px-6 relative z-10 mt-12">
        <div className="max-w-2xl mx-auto glass-card rounded-[2rem] p-10 md:p-14 text-center shadow-xl">
          <svg className="w-10 h-10 mx-auto text-[#25D366] mb-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.115.552 4.148 1.597 5.952L.15 23.473l5.65-1.48c1.745.962 3.712 1.472 5.755 1.472h.004c6.645 0 12.03-5.384 12.03-12.03S18.676 0 12.031 0zm0 21.492c-1.782 0-3.535-.48-5.076-1.385l-.364-.216-3.766.988.997-3.67-.238-.376A9.972 9.972 0 012.052 12.03c0-5.503 4.478-9.98 9.983-9.98 2.668 0 5.176 1.04 7.062 2.927a9.92 9.92 0 012.924 7.054c0 5.503-4.478 9.98-9.98 9.98zm5.474-7.48c-.3-.15-1.776-.877-2.05-.978-.276-.1-.476-.15-.677.15-.2.3-.775.978-.95 1.178-.175.2-.35.225-.65.075-.3-.15-1.267-.468-2.414-1.488-.89-.79-1.49-1.767-1.665-2.067-.175-.3-.018-.462.132-.612.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.626-.926-2.226-.244-.585-.49-.505-.677-.515-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.112 3.226 5.112 4.526.715.31 1.272.494 1.706.632.716.228 1.368.196 1.884.118.577-.087 1.775-.726 2.025-1.426.25-.7.25-1.3.175-1.426-.075-.125-.275-.2-.575-.35z"></path>
          </svg>
          <h2 className="font-serif text-3xl md:text-4xl text-[#1A1817] mb-4">Don't miss the next volume.</h2>
          <p className="font-sans text-sm text-[#5C5855] leading-relaxed mb-8">
            Spots fill up fast. Join our community group to be the first to know when we announce our next gathering.
          </p>
          <a href="https://chat.whatsapp.com/B68V6Q62HZPHHsGMG0t4jP" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#25D366] text-white font-sans text-xs uppercase tracking-[0.2em] font-bold py-4 px-10 rounded-full hover:scale-105 transition-transform duration-300 shadow-lg shadow-[#25D366]/30">
            Join the Community
          </a>
        </div>
      </section>

      {/* Unified Footer */}
      <footer className="py-20 text-center relative z-10 border-t border-[#1A1817]/10 flex flex-col items-center">
        <div className="w-40 h-12 relative mb-6">
          <Image src="/images/logo_black.png" alt="Al-Musawwir Logo" fill className="object-contain opacity-80" />
        </div>
        <p className="font-serif italic text-[#5C5855] text-2xl mb-8 px-4">We create, therefore we are.</p>
        <p className="font-sans text-[9px] text-[#5C5855]/60 uppercase tracking-widest">© {new Date().getFullYear()} Al-Musawwir Gatherings. All rights reserved.</p>
      </footer>
    </div>
  );
}