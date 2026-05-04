import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Papa from 'papaparse';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";

async function getEvents() {
  const res = await fetch(CSV_URL, { next: { revalidate: 0 } });
  const text = await res.text();
  return new Promise((resolve) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/^\uFEFF/, ''),
      complete: (results) => resolve(results.data)
    });
  });
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const events = await getEvents();
  const targetId = decodeURIComponent(resolvedParams.id || '').trim().toLowerCase();
  const currentEvent = events.find(e => e.id && e.id.trim().toLowerCase() === targetId);

  if (!currentEvent) return { title: 'Event Not Found | Al-Musawwir' };

  const rawImage = currentEvent.image_url || '/images/hero-bg.jpg';
  const absoluteImage = rawImage.startsWith('/')
    ? `https://almusawwir.art${rawImage}`
    : rawImage;
  const ogImage = `https://almusawwir.art/api/og-image?url=${encodeURIComponent(absoluteImage)}`;

  return {
    title: `${currentEvent.title} | Al-Musawwir`,
    description: currentEvent.tagline || 'Secure your canvas under the trees.',
    openGraph: {
      title: currentEvent.title,
      description: currentEvent.tagline,
      images: [ogImage],
      siteName: 'Al-Musawwir Gatherings',
    },
    twitter: {
      card: 'summary_large_image',
      title: currentEvent.title,
      description: currentEvent.tagline,
      images: [ogImage],
    }
  };
}

function EventImage({ src, alt, className, fill, sizes, priority, quality, loading }) {
  const isExternal = src && src.startsWith('http');
  if (isExternal) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading || 'lazy'}
        decoding="async"
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      quality={quality}
      loading={!priority ? (loading || 'lazy') : undefined}
      className={className}
    />
  );
}

export default async function EventDetailPage({ params }) {
  const resolvedParams = await params;
  const events = await getEvents();

  const targetId = decodeURIComponent(resolvedParams.id || '').trim().toLowerCase();
  const currentEvent = events.find(e => e.id && e.id.trim().toLowerCase() === targetId);
  const suggestedEvents = events.filter(e => e.id && e.id.trim().toLowerCase() !== targetId);

  if (!currentEvent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-serif text-2xl bg-[#F7F5F0] text-[#1A1817]">
        <p>Event not found in the archives.</p>
        <Link href="/" className="mt-4 font-sans text-sm uppercase tracking-widest text-[#FF6B35] hover:underline font-bold">
          ← Return Home
        </Link>
      </div>
    );
  }

  const providedList = currentEvent.provided ? currentEvent.provided.split(',').map(i => i.trim()) : [];
  const bringList = currentEvent.bring ? currentEvent.bring.split(',').map(i => i.trim()) : [];

  const shareText = `Join me at ${currentEvent.title}!\n${currentEvent.tagline}\n\nSecure your canvas here:`;
  const shareUrl = `https://almusawwir.art/event/${targetId}`;
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;

  const isSoldOut = currentEvent.status && (
    currentEvent.status.toLowerCase().includes('sold') ||
    currentEvent.status.toLowerCase().includes('closed')
  );

  // ── Ticket availability calculations ──
  const capacity = parseInt(currentEvent.capacity) || 0;
  const booked = parseInt(currentEvent.booked) || 0;
  const ticketsLeft = Math.max(0, capacity - booked);
  // "Feeling Fast" when >= 50% booked (and not fully sold out)
  const isFeelingFast = !isSoldOut && capacity > 0 && booked >= capacity * 0.5 && ticketsLeft > 0;
  // Countdown badge when <= 4 left (and not sold out)
  const showCountdown = !isSoldOut && ticketsLeft > 0 && ticketsLeft <= 4;

  const rawImage = currentEvent.image_url || '/images/hero-bg.jpg';
  const absoluteImage = rawImage.startsWith('/')
    ? `https://almusawwir.art${rawImage}`
    : rawImage;

  const hasOriginalPrice = currentEvent.original_price && currentEvent.original_price.trim() !== '';

  return (
    <div className="relative min-h-screen w-full bg-[#F7F5F0] text-[#1A1817] font-sans pb-32 md:pb-40">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            "name": currentEvent.title,
            "description": currentEvent.description || currentEvent.tagline,
            "image": absoluteImage,
            "url": `https://almusawwir.art/event/${targetId}`,
            "startDate": currentEvent.date,
            "eventStatus": isSoldOut
              ? "https://schema.org/EventCancelled"
              : "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "location": {
              "@type": "Place",
              "name": currentEvent.location_main,
              "address": {
                "@type": "PostalAddress",
                "streetAddress": currentEvent.location_sub,
                "addressLocality": "Bangalore",
                "addressRegion": "KA",
                "addressCountry": "IN"
              }
            },
            "offers": {
              "@type": "Offer",
              "url": `https://almusawwir.art/event/${targetId}`,
              "price": currentEvent.price || "999",
              "priceCurrency": "INR",
              "availability": isSoldOut
                ? "https://schema.org/SoldOut"
                : "https://schema.org/InStock",
              "validFrom": new Date().toISOString()
            },
            "organizer": {
              "@type": "Organization",
              "name": "Al-Musawwir",
              "url": "https://almusawwir.art"
            }
          })
        }}
      />

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Manrope:wght@200;300;400;500;600;700&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes imageFade { from { opacity: 0; filter: blur(10px); } to { opacity: 1; filter: blur(0); } }
        img { animation: imageFade 1s ease-out forwards; }
        @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .animate-pulse-fast { animation: pulse-fast 1.2s ease-in-out infinite; }
        @keyframes urgency-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.3); }
          50% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
        }
        .urgency-glow { animation: urgency-glow 2s ease-in-out infinite; }
      `}} />

      <div className="absolute top-8 left-4 md:left-8 z-50">
        <Link href="/" className="bg-white/80 backdrop-blur px-4 py-2 rounded-full font-sans text-[10px] uppercase tracking-widest font-bold hover:bg-[#1A1817] hover:text-white transition-all shadow-lg text-[#1A1817]">
          ← Back to All
        </Link>
      </div>

      {/* Hero Image */}
      <div className="w-full h-[50vh] md:h-[65vh] bg-[#1A1817] relative overflow-hidden">
        {currentEvent.image_url ? (
          <EventImage
            src={currentEvent.image_url}
            alt={currentEvent.title}
            fill
            priority
            quality={85}
            sizes="100vw"
            className="object-cover opacity-70"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#004E98]/20">
            <span className="font-serif italic text-[#F7F5F0]/50 text-2xl">Artwork Pending</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7F5F0] via-transparent to-transparent"></div>

        {/* ── Feeling Fast badge on hero image ── */}
        {isFeelingFast && !showCountdown && (
          <div className="absolute top-6 right-4 md:right-8 z-20">
            <span className="animate-pulse-fast inline-flex items-center gap-1.5 bg-[#FF6B35] text-white font-sans text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-2 rounded-full shadow-lg">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Filling Fast
            </span>
          </div>
        )}

        {/* ── Countdown badge on hero image (overrides Filling Fast) ── */}
        {showCountdown && (
          <div className="absolute top-6 right-4 md:right-8 z-20">
            <span className="urgency-glow inline-flex items-center gap-1.5 bg-[#DC2626] text-white font-sans text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-2 rounded-full shadow-lg">
              <span className="animate-pulse-fast w-1.5 h-1.5 bg-white rounded-full"></span>
              Only {ticketsLeft} left
            </span>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-24 relative z-10 space-y-12">

        {/* Title block */}
        <div className="text-center space-y-4">
          <span className="bg-[#1A1817] text-[#F7F5F0] px-4 py-1.5 rounded-full font-sans text-[10px] uppercase tracking-[0.3em] shadow-lg">
            {currentEvent.date} • {currentEvent.time}
          </span>
          <h1 className="font-serif italic text-5xl md:text-7xl text-[#1A1817] leading-tight pt-4">{currentEvent.title}</h1>
          <p className="font-serif text-xl md:text-2xl text-[#5C5855]">{currentEvent.tagline}</p>

          {/* ── Inline urgency strip below tagline ── */}
          {showCountdown && (
            <div className="inline-flex items-center gap-2 bg-[#DC2626]/8 border border-[#DC2626]/20 rounded-2xl px-5 py-3 mt-2">
              <svg className="w-4 h-4 text-[#DC2626] shrink-0 animate-pulse-fast" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-sans text-xs font-bold text-[#DC2626] uppercase tracking-wider">
                Only {ticketsLeft} spot{ticketsLeft === 1 ? '' : 's'} remaining
              </span>
            </div>
          )}
          {isFeelingFast && !showCountdown && (
            <div className="inline-flex items-center gap-2 bg-[#FF6B35]/8 border border-[#FF6B35]/20 rounded-2xl px-5 py-3 mt-2">
              <span className="animate-pulse-fast w-2 h-2 bg-[#FF6B35] rounded-full shrink-0"></span>
              <span className="font-sans text-xs font-bold text-[#FF6B35] uppercase tracking-wider">
                Filling fast — more than half the spots are gone
              </span>
            </div>
          )}
        </div>

        {/* Location card */}
        <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-8 md:p-10 border border-[#1A1817]/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-[#1A1817]/5">
          <div className="space-y-2 text-center md:text-left">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold text-[#FF6B35]">The Location</span>
            <h3 className="font-serif text-3xl text-[#1A1817]">{currentEvent.location_main}</h3>
            <p className="font-sans text-sm text-[#5C5855]">{currentEvent.location_sub}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="w-full sm:w-auto bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/20 font-sans text-[10px] uppercase tracking-[0.2em] font-bold py-3 px-5 rounded-full hover:bg-[#25D366] hover:text-white transition-all text-center flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.115.552 4.148 1.597 5.952L.15 23.473l5.65-1.48c1.745.962 3.712 1.472 5.755 1.472h.004c6.645 0 12.03-5.384 12.03-12.03S18.676 0 12.031 0zm0 21.492c-1.782 0-3.535-.48-5.076-1.385l-.364-.216-3.766.988.997-3.67-.238-.376A9.972 9.972 0 012.052 12.03c0-5.503 4.478-9.98 9.983-9.98 2.668 0 5.176 1.04 7.062 2.927a9.92 9.92 0 012.924 7.054c0 5.503-4.478 9.98-9.98 9.98zm5.474-7.48c-.3-.15-1.776-.877-2.05-.978-.276-.1-.476-.15-.677.15-.2.3-.775.978-.95 1.178-.175.2-.35.225-.65.075-.3-.15-1.267-.468-2.414-1.488-.89-.79-1.49-1.767-1.665-2.067-.175-.3-.018-.462.132-.612.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.626-.926-2.226-.244-.585-.49-.505-.677-.515-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.112 3.226 5.112 4.526.715.31 1.272.494 1.706.632.716.228 1.368.196 1.884.118.577-.087 1.775-.726 2.025-1.426.25-.7.25-1.3.175-1.426-.075-.125-.275-.2-.575-.35z"></path></svg>
              Share
            </a>
            {currentEvent.map_link && (
              <a href={currentEvent.map_link} target="_blank" rel="noreferrer" className="w-full sm:w-auto bg-[#1A1817]/5 text-[#1A1817] font-sans text-[10px] uppercase tracking-[0.2em] font-bold py-3 px-5 rounded-full hover:bg-[#1A1817] hover:text-white transition-all text-center flex items-center justify-center gap-2">
                Open Maps
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="prose prose-lg prose-p:font-serif prose-p:text-xl md:prose-p:text-2xl prose-p:leading-relaxed prose-p:text-[#1A1817]/80 mx-auto px-4 md:px-0">
          <p>{currentEvent.description}</p>
        </div>

        {/* What's Provided / What To Bring */}
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

      {/* Suggested events */}
      {suggestedEvents.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 mt-24">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif italic text-3xl text-[#1A1817]">More Masterpieces</h3>
            <span className="font-sans text-[9px] uppercase tracking-widest text-[#5C5855] hidden md:block">Scroll →</span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-8 snap-x hide-scrollbar">
            {suggestedEvents.map((event) => (
              <Link href={`/event/${event.id?.trim()}`} key={event.id} className="snap-start shrink-0 w-[240px] md:w-[280px] group bg-white/50 border border-[#1A1817]/5 p-3 rounded-3xl hover:bg-white transition-colors">
                <div className="h-32 md:h-40 bg-[#1A1817] rounded-2xl overflow-hidden mb-4 relative">
                  {event.image_url ? (
                    <EventImage
                      src={event.image_url}
                      alt={event.title}
                      fill
                      quality={60}
                      sizes="280px"
                      className="object-cover opacity-80 group-hover:opacity-100 transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#E24E7A]/20">
                      <span className="font-serif italic text-[#F7F5F0]/50 text-sm">Artwork Pending</span>
                    </div>
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

      {/* ── STICKY BOTTOM BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-[#1A1817]/10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">

        {/* ── Urgency strip above the bar (countdown only) ── */}
        {showCountdown && (
          <div className="w-full bg-[#DC2626] py-2 px-4 text-center">
            <p className="font-sans text-[10px] uppercase tracking-[0.25em] font-bold text-white flex items-center justify-center gap-2">
              <span className="animate-pulse-fast w-1.5 h-1.5 bg-white rounded-full inline-block"></span>
              Hurry — only {ticketsLeft} spot{ticketsLeft === 1 ? '' : 's'} left
              <span className="animate-pulse-fast w-1.5 h-1.5 bg-white rounded-full inline-block"></span>
            </p>
          </div>
        )}
        {isFeelingFast && !showCountdown && (
          <div className="w-full bg-[#FF6B35]/10 border-b border-[#FF6B35]/20 py-1.5 px-4 text-center">
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#FF6B35] flex items-center justify-center gap-2">
              <span className="animate-pulse-fast w-1.5 h-1.5 bg-[#FF6B35] rounded-full inline-block"></span>
              Filling fast
            </p>
          </div>
        )}

        <div className="p-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">

            {/* Title + price — desktop only */}
            <div className="hidden sm:block shrink-0">
              <p className="font-serif text-xl md:text-2xl text-[#1A1817] leading-none mb-1">{currentEvent.title}</p>
              <div className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest">
                <span className="text-[#5C5855]">{currentEvent.date}</span>
                <span className="text-[#5C5855]">•</span>
                {hasOriginalPrice && (
                  <span className="line-through text-[#9C9894]">₹{currentEvent.original_price}</span>
                )}
                <span className="font-bold text-[#1A1817]">₹{currentEvent.price || '999'}</span>
              </div>
            </div>

            {/* Price — mobile only, left side */}
            <div className="flex flex-col gap-0.5 sm:hidden shrink-0">
              {hasOriginalPrice && (
                <span className="font-sans text-xs line-through text-[#9C9894]">₹{currentEvent.original_price}</span>
              )}
              <span className="font-sans text-lg font-bold text-[#1A1817]">₹{currentEvent.price || '999'}</span>
            </div>

            {/* CTA Button */}
            {isSoldOut ? (
              <div className="w-[70%] sm:w-auto bg-[#5C5855] text-white font-sans text-xs md:text-sm uppercase tracking-[0.2em] font-bold py-4 px-6 rounded-full text-center shadow-xl flex items-center justify-center gap-2 cursor-not-allowed opacity-80">
                {currentEvent.button_text || 'Sold Out'}
              </div>
            ) : (
              <Link
                href={`/register?eventId=${currentEvent.id}&ticketsLeft=${ticketsLeft}`}
                className="w-[70%] sm:w-auto bg-[#1A1817] text-white font-sans text-xs md:text-sm uppercase tracking-[0.2em] font-bold py-4 px-6 rounded-full hover:bg-[#FF6B35] transition-all text-center shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                {currentEvent.button_text || 'Secure Canvas'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}