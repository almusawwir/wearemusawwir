import React from 'react';
import Link from 'next/link';
import Papa from 'papaparse';

// Your Google Sheet CSV Link
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";

// This runs securely on Vercel's servers before the page even loads!
async function getEvents() {
  // We use revalidate: 0 for now so whenever you update the sheet, the website updates instantly.
  const res = await fetch(CSV_URL, { next: { revalidate: 0 } });
  const text = await res.text();
  
  return new Promise((resolve) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
    });
  });
}

export default async function HomePage() {
  const events = await getEvents();

  return (
    <div className="relative min-h-screen w-full bg-[#F7F5F0] text-[#1A1817] font-sans">
      {/* Global Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Manrope:wght@200;300;400;500;600;700&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }
        .canvas-texture {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
          mix-blend-mode: multiply;
        }
      `}} />
      <div className="canvas-texture"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif italic text-5xl md:text-7xl text-[#1A1817] mb-4">Al-Musawwir</h1>
          <p className="font-sans text-sm md:text-base text-[#5C5855] tracking-[0.2em] uppercase">The Creator • The Shaper of Beauty</p>
        </div>

        {/* Dynamic Event Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map((event) => (
            <Link href={`/event/${event.id}`} key={event.id} className="group flex flex-col bg-white/60 backdrop-blur-md rounded-3xl overflow-hidden border border-[#1A1817]/10 hover:shadow-2xl hover:shadow-[#FF6B35]/10 transition-all duration-300 hover:-translate-y-1">
              
              {/* Image Box */}
              <div className="h-64 w-full bg-[#1A1817] relative overflow-hidden">
                {event.image_url ? (
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#004E98]/20">
                    <span className="font-serif italic text-[#F7F5F0]/50 text-2xl">Artwork Pending</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-[#1A1817] px-3 py-1 rounded-full font-sans text-[10px] font-bold uppercase tracking-widest">
                  {event.date}
                </div>
              </div>

              {/* Text Box */}
              <div className="p-8 flex flex-col flex-grow justify-between">
                <div>
                  <h2 className="font-serif text-3xl text-[#1A1817] mb-2">{event.title}</h2>
                  <p className="font-sans text-sm text-[#5C5855] line-clamp-2">{event.tagline}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-[#1A1817]/10 pt-6">
                  <div className="flex flex-col">
                    <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#FF6B35] font-bold mb-1">Location</span>
                    <span className="font-serif text-lg text-[#1A1817]">{event.location_main}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-[#1A1817]/20 flex items-center justify-center group-hover:bg-[#1A1817] group-hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}