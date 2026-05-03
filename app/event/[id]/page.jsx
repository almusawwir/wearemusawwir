import React from 'react';
import Link from 'next/link';
import Papa from 'papaparse';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";

async function getEvents() {
  const res = await fetch(CSV_URL, { next: { revalidate: 0 } });
  const text = await res.text();
  return new Promise((resolve) => {
    Papa.parse(text, { header: true, skipEmptyLines: true, complete: (results) => resolve(results.data) });
  });
}

// Next.js magically passes the URL ID into 'params'
export default async function EventDetailPage({ params }) {
  const events = await getEvents();
  const currentEvent = events.find(e => e.id === params.id);
  const suggestedEvents = events.filter(e => e.id !== params.id);

  if (!currentEvent) {
    return <div className="min-h-screen flex items-center justify-center font-serif text-2xl">Event not found in the archives.</div>;
  }

  // Convert comma-separated sheet strings into actual arrays
  const providedList = currentEvent.provided ? currentEvent.provided.split(',').map(i => i.trim()) : [];
  const bringList = currentEvent.bring ? currentEvent.bring.split(',').map(i => i.trim()) : [];

  return (
    <div className="relative min-h-screen w-full bg-[#F7F5F0] text-[#1A1817] font-sans pb-24">
      {/* Global Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Manrope:wght@200;300;400;500;600;700&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }
      `}} />

      {/* Navigation */}
      <div className="absolute top-8 left-4 md:left-8 z-50">
        <Link href="/" className="bg-white/80 backdrop-blur px-4 py-2 rounded-full font-sans text-[10px] uppercase tracking-widest font-bold hover:bg-[#1A1817] hover:text-white transition-all shadow-lg">
          ← Back to All
        </Link>
      </div>

      {/* Hero Image */}
      <div className="w-full h-[50vh] md:h-[60vh] bg-[#1A1817] relative">
        {currentEvent.image_url && (
          <img src={currentEvent.image_url} alt={currentEvent.title} className="w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7F5F0] via-transparent to-transparent"></div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-3xl mx-auto px-4 -mt-32 relative z-10 space-y-12">
        
        {/* Title Header */}
        <div className="text-center space-y-4">
          <span className="bg-[#1A1817] text-[#F7F5F0] px-4 py-1 rounded-full font-sans text-[10px] uppercase tracking-[0.3em]">
            {currentEvent.date} • {currentEvent.time}
          </span>
          <h1 className="font-serif italic text-5xl md:text-6xl text-[#1A1817] leading-tight">{currentEvent.title}</h1>
          <p className="font-sans text-lg text-[#5C5855]">{currentEvent.tagline}</p>
        </div>

        {/* Location & Action Box */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-[#1A1817]/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif text-2xl text-[#1A1817]">{currentEvent.location_main}</h3>
            <p className="font-sans text-sm text-[#5C5855]">{currentEvent.location_sub}</p>
            {currentEvent.map_link && (
              <a href={currentEvent.map_link} target="_blank" rel="noreferrer" className="text-[#004E98] text-xs uppercase tracking-widest font-bold hover:underline inline-flex items-center gap-1 mt-2">
                Open in Maps <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
            )}
          </div>
          <Link href="/register" className="w-full md:w-auto bg-[#1A1817] text-white font-sans text-xs uppercase tracking-[0.2em] font-bold py-4 px-8 rounded-xl hover:bg-[#FF6B35] transition-all text-center shadow-lg hover:-translate-y-1">
            Secure Your Canvas
          </Link>
        </div>

        {/* Description */}
        <div className="prose prose-lg prose-p:font-serif prose-p:text-xl prose-p:leading-relaxed prose-p:text-[#1A1817]/80 mx-auto">
          <p>{currentEvent.description}</p>
        </div>

        {/* Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-[#1A1817]/10">
          {/* Provided */}
          <div className="bg-[#1A1817]/5 rounded-2xl p-6">
            <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#FF6B35] font-bold mb-4">What's Provided</h3>
            <ul className="space-y-3">
              {providedList.map((item, idx) => (
                <li key={idx} className="font-serif text-lg text-[#1A1817] flex items-center gap-3">
                  <svg className="w-4 h-4 text-[#FF6B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* Bring */}
          <div className="bg-[#1A1817]/5 rounded-2xl p-6">
            <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#004E98] font-bold mb-4">What To Bring</h3>
            <ul className="space-y-3">
              {bringList.map((item, idx) => (
                <li key={idx} className="font-serif text-lg text-[#1A1817] flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#004E98]"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Suggested Events (Only shows if there are other events!) */}
      {suggestedEvents.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 mt-24">
          <h3 className="font-serif italic text-3xl text-[#1A1817] mb-8 text-center md:text-left">More Masterpieces</h3>
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
            {suggestedEvents.map((event) => (
              <Link href={`/event/${event.id}`} key={event.id} className="snap-start shrink-0 w-[280px] group">
                <div className="h-40 bg-[#1A1817] rounded-2xl overflow-hidden mb-4 relative">
                  {event.image_url && <img src={event.image_url} alt={event.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />}
                </div>
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#FF6B35] font-bold block mb-1">{event.date}</span>
                <h4 className="font-serif text-xl text-[#1A1817]">{event.title}</h4>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}