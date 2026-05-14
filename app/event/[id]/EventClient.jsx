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
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  if (!currentEvent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-serif text-2xl bg-[#F7F5F0] text-[#1A1817]">
        <p>Event not found in the archives.</p>
        <Link href="/" className="mt-4 font-sans text-sm uppercase tracking-widest text-[#FF6B35] hover:underline font-bold">← Return Home</Link>
      </div>
    );
  }

  // Detect Google Sheet Line Breaks (\n) for Description
  const paragraphs = currentEvent.description ? currentEvent.description.split('\n').filter(p => p.trim() !== '') : [];
  const displayParagraphs = isDescExpanded ? paragraphs : paragraphs.slice(0, 2);

  // Lists (Provided & Bring)
  const providedList = currentEvent.provided ? currentEvent.provided.split(',').map(i => i.trim()) : [];
  const bringList = currentEvent.bring ? currentEvent.bring.split(',').map(i => i.trim()) : [];

  // Event Flow (Split by new lines)
  const flowList = currentEvent.flow ? currentEvent.flow.split('\n').filter(i => i.trim() !== '') : [];

  // Parse Gallery and Video
  const galleryImages = currentEvent.gallery ? currentEvent.gallery.split(',').map(i => i.trim()).filter(i => i) : [];
  const videoSrc = currentEvent.video ? currentEvent.video.trim() : null;

  // Sharing Links & Native Share Logic
  const shareText = `Join me at ${currentEvent.title}!\n${currentEvent.tagline}\n\nSecure your canvas here:`;
  const shareUrl = `https://almusawwir.art/event/${targetId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentEvent.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      // Fallback if browser doesn't support native sharing (like older desktops)
      handleCopyLink();
    }
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
        <Link href="/event" className="bg-white/80 backdrop-blur px-4 py-2 rounded-full font-sans text-[10px] uppercase tracking-widest font-bold hover:bg-[#1A1817] hover:text-white transition-all shadow-lg text-[#1A1817]">
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

          <div className="w-full md:w-1/2 flex flex-col gap-3">
            {/* Open Map Button - On Top */}
            {currentEvent.map_link && (
              <a href={currentEvent.map_link} target="_blank" rel="noreferrer" className="w-full bg-[#1A1817]/5 text-[#1A1817] font-sans text-[10px] uppercase tracking-[0.2em] font-bold py-3.5 rounded-full hover:bg-[#1A1817] hover:text-white transition-all text-center flex items-center justify-center gap-2">
                Open in Maps <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
            )}

            {/* 2 Rectangular Share Buttons Row */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleCopyLink} className="w-full bg-white border border-[#1A1817]/10 font-sans text-[10px] uppercase tracking-widest font-bold py-3.5 rounded-full hover:bg-[#1A1817] hover:text-white transition-all text-[#1A1817] shadow-sm flex items-center justify-center gap-2 relative">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              
              <button onClick={handleNativeShare} className="w-full bg-[#25D366]/10 border border-[#25D366]/20 font-sans text-[10px] uppercase tracking-widest font-bold py-3.5 rounded-full hover:bg-[#25D366] text-[#25D366] hover:text-white transition-all shadow-sm flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Multi-Paragraph Description (Capped at 2 paragraphs) */}
        <div className="prose prose-lg prose-p:font-serif prose-p:text-xl md:prose-p:text-2xl prose-p:leading-relaxed prose-p:text-[#1A1817]/80 mx-auto px-4 md:px-0 text-center md:text-left flex flex-col items-center md:items-start">
          {displayParagraphs.map((p, idx) => (
            <p key={idx} className="mb-6">{p}</p>
          ))}
          {paragraphs.length > 2 && (
            <button 
              onClick={() => setIsDescExpanded(!isDescExpanded)} 
              className="mt-2 bg-transparent border border-[#1A1817]/20 text-[#1A1817] font-sans text-[10px] uppercase tracking-widest font-bold py-2.5 px-6 rounded-full hover:bg-[#1A1817] hover:text-white transition-colors"
            >
              {isDescExpanded ? "See Less" : "See More"}
            </button>
          )}
        </div>

         {/* RESTORED: What's Provided / What To Bring (Original Pill Design) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
          <div className="bg-white/40 border border-[#1A1817]/5 rounded-[2rem] p-6 md:p-8">
            <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#FF6B35] font-bold mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
              What's Provided
            </h3>
            <ul className="flex flex-wrap gap-2">
              {providedList.map((item, idx) => (
                <li key={idx} className="font-sans text-xs md:text-sm font-bold text-[#1A1817] bg-[#FF6B35]/10 px-4 py-2 rounded-full border border-[#FF6B35]/20 shadow-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/40 border border-[#1A1817]/5 rounded-[2rem] p-6 md:p-8">
            <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#004E98] font-bold mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              What To Bring
            </h3>
            <ul className="flex flex-wrap gap-2">
              {bringList.map((item, idx) => (
                <li key={idx} className="font-sans text-xs md:text-sm font-bold text-[#1A1817] bg-[#004E98]/10 px-4 py-2 rounded-full border border-[#004E98]/20 shadow-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

       

        {/* Media Section: Horizontal Gallery + Portrait Video */}
        {(galleryImages.length > 0 || videoSrc) && (
          <div className="pt-8 space-y-8">
            <h3 className="font-serif italic text-3xl text-[#1A1817] px-4 md:px-0 text-center md:text-left">A Glimpse</h3>
            
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



       {/* The Event Flow Section (Compact 2-Column List) */}
        {flowList.length > 0 && (
          <div className="px-4 md:px-0 pt-4">
            <h3 className="font-serif italic text-3xl text-[#1A1817] mb-6 text-center md:text-left">The Flow</h3>
            <div className="bg-white/40 border border-[#1A1817]/5 rounded-[2rem] p-6 md:p-10 shadow-sm">
              <ul className={`grid gap-x-8 gap-y-4 ${flowList.length > 5 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {flowList.map((step, idx) => (
                  <li key={idx} className="font-sans text-sm md:text-base font-medium text-[#1A1817] flex items-start gap-3">
                    <span className="text-[#1A1817]/40 font-bold mt-0.5">{idx + 1}.</span> 
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

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
                  Book Now
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