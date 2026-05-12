"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

function EventImage({ src, alt, className, fill, sizes, priority, quality }) {
  const isExternal = src && src.startsWith('http');
  if (isExternal) {
    return <img src={src} alt={alt} className={className} loading={priority ? "eager" : "lazy"} decoding="async" />;
  }
  return <Image src={src} alt={alt} fill={fill} sizes={sizes} priority={priority} quality={quality} loading={!priority ? "lazy" : undefined} className={className} />;
}

export default function EventClient({ currentEvent, suggestedEvents, targetId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!currentEvent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-serif text-2xl bg-[#F7F5F0] text-[#1A1817]">
        <p>Event not found in the archives.</p>
        <Link href="/" className="mt-4 font-sans text-sm uppercase tracking-widest text-[#FF6B35] hover:underline font-bold">← Return Home</Link>
      </div>
    );
  }

  // Detect Google Sheet Line Breaks (\n)
  const paragraphs = currentEvent.description ? currentEvent.description.split('\n').filter(p => p.trim() !== '') : [];

  // Consolidate Lists
  const providedList = currentEvent.provided ? currentEvent.provided.split(',').map(i => i.trim()) : [];
  const bringList = currentEvent.bring ? currentEvent.bring.split(',').map(i => i.trim()) : [];

  // Parse Gallery and Video
  const galleryImages = currentEvent.gallery ? currentEvent.gallery.split(',').map(i => i.trim()).filter(i => i) : [];
  const videoSrc = currentEvent.video ? currentEvent.video.trim() : null;

  // Sharing Links
  const shareText = `Join me at ${currentEvent.title}!\n${currentEvent.tagline}\n\nSecure your canvas here:`;
  const shareUrl = `https://almusawwir.art/event/${targetId}`;
  const whatsappShareLink = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Status & Booking Logic
  const isSoldOut = currentEvent.status && (currentEvent.status.toLowerCase().includes('sold') || currentEvent.status.toLowerCase().includes('closed'));
  const hasOriginalPrice = currentEvent.original_price && currentEvent.original_price.trim() !== '';

  const bookingLinks = [
    { id: 'form', url: currentEvent.form_link, label: 'Google Form (Direct RSVP)', recommend: true },
    { id: 'district', url: currentEvent.district_link, label: 'Book via District' },
    { id: 'meetup', url: currentEvent.meetup_link, label: 'Book via Meetup' },
    { id: 'bookmyshow', url: currentEvent.bookmyshow_link, label: 'BookMyShow' }
  ].filter(link => link.url && link.url.trim() !== '');

  const handleBookingClick = (e) => {
    if (bookingLinks.length > 1) {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F7F5F0] text-[#1A1817] font-sans pb-32 md:pb-40 overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Manrope:wght@200;300;400;500;600;700&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Back Button */}
      <div className="absolute top-8 left-4 md:left-8 z-50">
        <Link href="/events" className="bg-white/80 backdrop-blur px-4 py-2 rounded-full font-sans text-[10px] uppercase tracking-widest font-bold hover:bg-[#1A1817] hover:text-white transition-all shadow-lg text-[#1A1817]">
          ← Back to Archives
        </Link>
      </div>

      {/* Hero Image */}
      <div className="w-full h-[50vh] md:h-[65vh] bg-[#1A1817] relative overflow-hidden">
        {currentEvent.image_url ? (
          <EventImage src={currentEvent.image_url} alt={currentEvent.title} fill priority quality={85} sizes="100vw" className="object-cover opacity-70" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#004E98]/20"><span className="font-serif italic text-[#F7F5F0]/50 text-2xl">Artwork Pending</span></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7F5F0] via-transparent to-transparent"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10 space-y-16">
        
        {/* Title Block */}
        <div className="text-center space-y-4">
          <span className="bg-[#1A1817] text-[#F7F5F0] px-4 py-1.5 rounded-full font-sans text-[10px] uppercase tracking-[0.3em] shadow-lg">
            {currentEvent.date} • {currentEvent.time}
          </span>
          <h1 className="font-serif italic text-5xl md:text-7xl text-[#1A1817] leading-tight pt-4">{currentEvent.title}</h1>
          <p className="font-serif text-xl md:text-2xl text-[#5C5855]">{currentEvent.tagline}</p>
        </div>

        {/* Location & Redesigned Share Card */}
        <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-8 border border-[#1A1817]/10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-[#1A1817]/5">
          <div className="space-y-2 text-center md:text-left w-full md:w-1/2">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold text-[#FF6B35]">The Location</span>
            <h3 className="font-serif text-3xl text-[#1A1817]">{currentEvent.location_main}</h3>
            <p className="font-sans text-sm text-[#5C5855]">{currentEvent.location_sub}</p>
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-4">
            {/* Open Map Button - On Top */}
            {currentEvent.map_link && (
              <a href={currentEvent.map_link} target="_blank" rel="noreferrer" className="w-full bg-[#1A1817]/5 text-[#1A1817] font-sans text-[10px] uppercase tracking-[0.2em] font-bold py-3.5 rounded-full hover:bg-[#1A1817] hover:text-white transition-all text-center flex items-center justify-center gap-2">
                Open in Maps <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
            )}

            {/* 3 Circular Share Buttons Row */}
            <div className="flex items-center justify-center md:justify-end gap-4">
              <button onClick={handleCopyLink} className="w-12 h-12 rounded-full bg-white border border-[#1A1817]/10 flex items-center justify-center hover:bg-[#1A1817] hover:text-white transition-all text-[#1A1817] shadow-sm relative group" aria-label="Copy Link">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                {copied && <span className="absolute -top-8 bg-[#1A1817] text-white text-[9px] uppercase tracking-widest px-2 py-1 rounded shadow">Copied</span>}
              </button>
              
              <a href={whatsappShareLink} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center hover:bg-[#25D366] text-[#25D366] hover:text-white transition-all shadow-sm" aria-label="Share on WhatsApp">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.115.552 4.148 1.597 5.952L.15 23.473l5.65-1.48c1.745.962 3.712 1.472 5.755 1.472h.004c6.645 0 12.03-5.384 12.03-12.03S18.676 0 12.031 0zm0 21.492c-1.782 0-3.535-.48-5.076-1.385l-.364-.216-3.766.988.997-3.67-.238-.376A9.972 9.972 0 012.052 12.03c0-5.503 4.478-9.98 9.983-9.98 2.668 0 5.176 1.04 7.062 2.927a9.92 9.92 0 012.924 7.054c0 5.503-4.478 9.98-9.98 9.98z"></path></svg>
              </a>

              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[#E1306C]/10 border border-[#E1306C]/20 flex items-center justify-center hover:bg-[#E1306C] text-[#E1306C] hover:text-white transition-all shadow-sm" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 1.76-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 1.76 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-1.76 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-1.778-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Dynamic Multi-Paragraph Description */}
        <div className="prose prose-lg prose-p:font-serif prose-p:text-xl md:prose-p:text-2xl prose-p:leading-relaxed prose-p:text-[#1A1817]/80 mx-auto px-4 md:px-0 text-center md:text-left">
          {paragraphs.map((p, idx) => (
            <p key={idx} className="mb-6">{p}</p>
          ))}
        </div>

        {/* Media Section: Horizontal Gallery + Portrait Video */}
        {(galleryImages.length > 0 || videoSrc) && (
          <div className="pt-8 space-y-8">
            <h3 className="font-serif italic text-3xl text-[#1A1817] px-4 md:px-0">A Glimpse</h3>
            
            <div className="flex gap-4 overflow-x-auto pb-6 snap-x hide-scrollbar px-4 md:px-0 items-stretch">
              {/* Portrait Video (If exists) */}
              {videoSrc && (
                <div className="snap-center shrink-0 w-[240px] md:w-[300px] aspect-[9/16] relative rounded-[2rem] overflow-hidden bg-black shadow-lg">
                  <video src={videoSrc} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-90"></video>
                </div>
              )}
              
              {/* Image Gallery */}
              {galleryImages.map((img, idx) => (
                <div key={idx} className="snap-center shrink-0 w-[280px] md:w-[360px] aspect-[4/5] relative rounded-[2rem] overflow-hidden shadow-lg border border-[#1A1817]/5 group">
                  <EventImage src={img} alt={`Gallery ${idx}`} fill sizes="(max-width: 768px) 280px, 360px" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consolidated Provided / Bring Lists */}
        <div className="bg-white/40 border border-[#1A1817]/5 rounded-[2rem] p-8 md:p-12 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Provided */}
            <div>
              <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#FF6B35] font-bold mb-6 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                What's Provided
              </h3>
              <ul className={`grid gap-x-4 gap-y-3 ${providedList.length > 5 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {providedList.map((item, idx) => (
                  <li key={idx} className="font-sans text-sm font-semibold text-[#1A1817] flex items-start gap-2">
                    <span className="text-[#FF6B35] mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Bring */}
            <div>
              <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#004E98] font-bold mb-6 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                What To Bring
              </h3>
              <ul className={`grid gap-x-4 gap-y-3 ${bringList.length > 5 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {bringList.map((item, idx) => (
                  <li key={idx} className="font-sans text-sm font-semibold text-[#1A1817] flex items-start gap-2">
                    <span className="text-[#004E98] mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* Suggested events */}
      {suggestedEvents.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 mt-24 mb-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif italic text-3xl text-[#1A1817]">More Masterpieces</h3>
            <span className="font-sans text-[9px] uppercase tracking-widest text-[#5C5855] hidden md:block">Scroll →</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-8 snap-x hide-scrollbar">
            {suggestedEvents.map((event) => (
              <Link href={`/event/${event.id?.trim()}`} key={event.id} className="snap-start shrink-0 w-[240px] md:w-[280px] group bg-white/50 border border-[#1A1817]/5 p-3 rounded-3xl hover:bg-white transition-colors">
                <div className="h-32 md:h-40 bg-[#1A1817] rounded-2xl overflow-hidden mb-4 relative">
                  {event.image_url ? (
                    <EventImage src={event.image_url} alt={event.title} fill quality={60} sizes="280px" className="object-cover opacity-80 group-hover:opacity-100 transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#E24E7A]/20"><span className="font-serif italic text-[#F7F5F0]/50 text-sm">Artwork Pending</span></div>
                  )}
                </div>
                <div className="px-2 pb-2">
                  <span className="font-sans text-[9px] uppercase tracking-widest text-[#FF6B35] font-bold block mb-1">{event.date}</span>
                  <h4 className="font-serif text-xl text-[#1A1817] line-clamp-1">{event.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Unified Footer */}
      <footer className="py-16 text-center relative z-10 border-t border-[#1A1817]/10 flex flex-col items-center pb-32">
        <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-[#1A1817] mb-4 font-bold">AL-MUSAWWIR</p>
        <p className="font-serif italic text-[#5C5855] text-2xl mb-8 px-4">We create, therefore we are.</p>
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mb-6 px-4">
          <Link href="/about" className="font-sans text-[10px] text-[#5C5855] tracking-widest uppercase font-bold hover:text-[#FF6B35] transition-colors py-2">About Us</Link>
          <span className="w-1 h-1 rounded-full bg-[#1A1817]/20"></span>
          <Link href="/terms" className="font-sans text-[10px] text-[#5C5855] tracking-widest uppercase font-bold hover:text-[#FF6B35] transition-colors py-2">Terms & Conditions</Link>
          <span className="w-1 h-1 rounded-full bg-[#1A1817]/20"></span>
          <a href="mailto:wearemusawwir@gmail.com" className="font-sans text-[10px] text-[#5C5855] tracking-widest uppercase font-bold hover:text-[#FF6B35] transition-colors py-2">Contact</a>
        </div>
        <p className="font-sans text-[9px] text-[#5C5855]/60 uppercase tracking-widest">© {new Date().getFullYear()} Al-Musawwir Gatherings. All rights reserved.</p>
      </footer>

      {/* ── STICKY BOTTOM BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-[#1A1817]/10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            
            <div className="hidden sm:block shrink-0">
              <p className="font-serif text-2xl text-[#1A1817] leading-none mb-1">{currentEvent.title}</p>
              <div className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest">
                <span className="text-[#5C5855]">{currentEvent.date}</span>
              </div>
            </div>

            <div className="flex flex-col gap-0.5 sm:hidden shrink-0">
              {hasOriginalPrice && <span className="font-sans text-xs line-through text-[#9C9894]">₹{currentEvent.original_price}</span>}
              <span className="font-sans text-lg font-bold text-[#1A1817]">₹{currentEvent.price || '999'}</span>
            </div>

            <div className="flex flex-col items-end gap-1 w-[65%] sm:w-auto">
              {isSoldOut ? (
                <div className="w-full bg-[#5C5855] text-white font-sans text-xs md:text-sm uppercase tracking-[0.2em] font-bold py-4 px-8 rounded-full text-center shadow-xl flex items-center justify-center gap-2 cursor-not-allowed opacity-80">
                  Sold Out
                </div>
              ) : bookingLinks.length === 0 ? (
                <div className="w-full bg-[#1A1817]/50 text-white font-sans text-xs md:text-sm uppercase tracking-[0.2em] font-bold py-4 px-8 rounded-full text-center shadow-xl cursor-not-allowed">
                  Coming Soon
                </div>
              ) : (
                <a
                  href={bookingLinks.length === 1 ? bookingLinks[0].url : '#'}
                  onClick={handleBookingClick}
                  className="w-full bg-[#1A1817] text-white font-sans text-xs md:text-sm uppercase tracking-[0.2em] font-bold py-4 px-8 rounded-full hover:bg-[#FF6B35] transition-all text-center shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Secure Canvas
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC BOOKING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-[#1A1817]/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-3xl text-[#1A1817]">Select Platform</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-black/50 hover:text-black">
                ✕
              </button>
            </div>
            <p className="font-sans text-sm text-[#5C5855] mb-6">Choose how you'd like to secure your canvas for this gathering.</p>
            
            <div className="space-y-3">
              {bookingLinks.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className={`block w-full text-center font-sans text-xs uppercase tracking-widest font-bold py-4 px-6 rounded-2xl transition-all ${link.recommend ? 'bg-[#1A1817] text-white hover:bg-[#FF6B35]' : 'bg-black/5 text-[#1A1817] hover:bg-black/10'}`}>
                  {link.label}
                  {link.recommend && <span className="block mt-1.5 font-sans text-[9px] text-white/70 tracking-normal normal-case font-medium">Saves platform fees & captures your preferences</span>}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}