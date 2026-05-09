"use client";
import React, { useState } from 'react';

export default function ReferenceGuidePage() {
  // Generate the array for 14 reference images
  const referenceImages = Array.from({ length: 14 }, (_, i) => `/images/r${i + 1}.jpeg`);
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="relative min-h-screen w-full bg-[#F7F5F0] text-[#1A1817] font-sans pb-32">
      {/* Injecting Fonts and Custom Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Manrope:wght@200;300;400;500;600;700&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }
        .color-swatch { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease; }
        .color-swatch:hover { transform: scale(1.15) translateY(-2px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2); z-index: 10; relative; }
      `}} />

      {/* Navigation */}
      <div className="absolute top-8 left-4 md:left-8 z-50">
        <a href="/" className="bg-white/80 backdrop-blur px-4 py-2 rounded-full font-sans text-[10px] uppercase tracking-widest font-bold hover:bg-[#1A1817] hover:text-white transition-all shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-[#1A1817] border border-[#1A1817]/5">
          ← Return Home
        </a>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-32 space-y-16">
        
        {/* Brand Name */}
        <div className="text-center space-y-4">
          <h2 className="font-serif text-2xl md:text-3xl text-[#1A1817] tracking-[0.3em] uppercase">Al-Musawwir</h2>
          <div className="w-16 h-px bg-[#FF6B35] mx-auto"></div>
        </div>

        {/* Header */}
        <header className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center p-4 bg-white/60 backdrop-blur-md rounded-full shadow-sm mb-2 text-[#FF6B35] border border-[#1A1817]/5">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
            </svg>
          </div>
          <h1 className="font-serif italic text-5xl md:text-6xl text-[#1A1817] leading-tight">Art Fundamentals</h1>
          <p className="font-serif text-xl md:text-2xl text-[#5C5855]">An interactive guide to colour theory, shading, and visual references.</p>
        </header>

        {/* SECTION 1: Colour Mixing */}
        <section className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 md:p-10 border border-[#1A1817]/10 shadow-xl shadow-[#1A1817]/5">
          <div className="mb-8 border-b border-[#1A1817]/10 pb-6 text-center md:text-left">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold text-[#FF6B35]">Chapter 1</span>
            <h2 className="font-serif text-4xl text-[#1A1817] mt-2">Colour Mixing</h2>
            <p className="font-sans text-sm text-[#5C5855] mt-2">Start with the 3 primary colours: <span className="font-bold text-red-500">Red</span>, <span className="font-bold text-yellow-500">Yellow</span>, and <span className="font-bold text-blue-500">Blue</span>.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
            <MixRow c1="bg-red-500" c2="bg-yellow-400" result="bg-orange-500" name="Orange" />
            <MixRow c1="bg-yellow-400" c2="bg-blue-500" result="bg-green-500" name="Green" />
            <MixRow c1="bg-red-500" c2="bg-blue-500" result="bg-purple-600" name="Purple" />
            <MixRow c1="bg-red-500" c2="bg-orange-500" result="bg-[#ff4500]" name="Red-Orange" />
            <MixRow c1="bg-yellow-400" c2="bg-orange-500" result="bg-[#ffae42]" name="Yellow-Orange" />
            <MixRow c1="bg-yellow-400" c2="bg-green-500" result="bg-[#9acd32]" name="Yellow-Green" />
            <MixRow c1="bg-blue-500" c2="bg-green-500" result="bg-teal-500" name="Teal" />
            <MixRow c1="bg-blue-500" c2="bg-purple-600" result="bg-[#8A2BE2]" name="Violet" />
            
            {/* Special Row: Brown */}
            <div className="flex items-center gap-3 w-full bg-[#1A1817]/5 p-3 rounded-2xl md:col-span-2 group hover:bg-white transition-colors duration-300">
              <div className="w-10 h-10 rounded-full bg-orange-500 shadow-inner color-swatch"></div>
              <PlusIcon />
              <div className="w-6 h-6 rounded-full bg-blue-500 shadow-inner color-swatch" title="A little bit of blue"></div>
              <span className="font-serif italic text-sm text-[#5C5855]">(a little)</span>
              <EqualIcon />
              <div className="w-12 h-12 rounded-full bg-[#8B4513] shadow-md ring-4 ring-amber-100/50 color-swatch"></div>
              <span className="font-serif text-lg ml-2 text-[#8B4513]">Brown</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: Shades and Tints */}
        <section className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 md:p-10 border border-[#1A1817]/10 shadow-xl shadow-[#1A1817]/5">
          <div className="mb-8 border-b border-[#1A1817]/10 pb-6 text-center md:text-left">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold text-[#004E98]">Chapter 2</span>
            <h2 className="font-serif text-4xl text-[#1A1817] mt-2">Shades and Tints</h2>
            <p className="font-sans text-sm text-[#5C5855] mt-2">Observe how adding White lightens (Tints) and Black deepens (Shades) the base colour.</p>
          </div>
          
          <div className="space-y-12">
            {/* Tints */}
            <div>
              <h3 className="font-sans text-[12px] uppercase tracking-[0.2em] font-bold text-[#1A1817] mb-6 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm block"></span>
                Adding White — Tints
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TintCard base="bg-blue-600" soft="bg-blue-400" light="bg-blue-300" pale="bg-blue-100" name="Blue" />
                <TintCard base="bg-yellow-400" soft="bg-yellow-300" light="bg-[#fef08a]" pale="bg-[#fef9c3]" name="Yellow" darkText />
                <TintCard base="bg-orange-500" soft="bg-orange-400" light="bg-orange-300" pale="bg-orange-100" name="Orange" />
                <TintCard base="bg-green-600" soft="bg-green-500" light="bg-green-300" pale="bg-green-100" name="Green" />
              </div>
            </div>

            {/* Shades */}
            <div>
              <h3 className="font-sans text-[12px] uppercase tracking-[0.2em] font-bold text-[#1A1817] mb-6 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1A1817] block"></span>
                Adding Black — Shades
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ShadeCard base="bg-blue-600" deep="bg-blue-700" dark="bg-blue-800" navy="bg-blue-950" name="Blue" />
                
                {/* Yellow Note (Turns Olive) */}
                <div className="rounded-2xl overflow-hidden border border-[#1A1817]/10 flex flex-col group hover:shadow-lg transition-all duration-300 relative">
                  <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0"></div>
                  <div className="flex h-16 relative z-10">
                    <div className="w-1/4 bg-yellow-400 flex flex-col justify-center items-center text-[#1A1817]">
                      <span className="font-bold text-sm">Yellow</span>
                    </div>
                    <div className="w-1/4 bg-[#a69b1e] flex flex-col justify-center items-center text-white text-center">
                      <span className="font-bold text-xs leading-none">Olive</span>
                      <span className="text-[9px] opacity-70 mt-0.5">(Yellow+Blk)</span>
                    </div>
                    <div className="w-1/4 bg-[#7a7215] flex justify-center items-center text-white font-bold text-xs text-center leading-none">Dark<br/>Olive</div>
                    <div className="w-1/4 bg-[#4d480d] flex justify-center items-center text-white font-bold text-xs text-center leading-none">Deep<br/>Olive</div>
                  </div>
                </div>

                {/* Orange Note (Turns Brown) */}
                <div className="rounded-2xl overflow-hidden border border-[#1A1817]/10 flex flex-col group hover:shadow-lg transition-all duration-300 relative">
                  <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0"></div>
                  <div className="flex h-16 relative z-10">
                    <div className="w-1/4 bg-orange-500 flex flex-col justify-center items-center text-white">
                      <span className="font-bold text-sm">Orange</span>
                    </div>
                    <div className="w-1/4 bg-[#c85a17] flex justify-center items-center text-white font-bold text-xs">Rust</div>
                    <div className="w-1/4 bg-[#8b4513] flex flex-col justify-center items-center text-white text-center">
                      <span className="font-bold text-xs leading-none">Brown</span>
                      <span className="text-[9px] opacity-70 mt-0.5">(Orange+Blk)</span>
                    </div>
                    <div className="w-1/4 bg-[#4a250a] flex justify-center items-center text-white font-bold text-xs text-center leading-none">Deep<br/>Brown</div>
                  </div>
                </div>

                <ShadeCard base="bg-green-600" deep="bg-green-700" dark="bg-green-800" navy="bg-[#064e3b]" name="Green" />
              </div>
            </div>

            {/* Warm vs Cool */}
            <div className="pt-8 border-t border-[#1A1817]/10">
              <h3 className="font-sans text-[12px] uppercase tracking-[0.2em] font-bold text-[#1A1817] mb-6 text-center md:text-left">Warm vs Cool</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="rounded-[2rem] p-8 bg-gradient-to-br from-orange-400 to-red-500 text-white relative overflow-hidden group shadow-lg">
                  <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left">
                    <svg className="w-8 h-8 mb-3 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    <h4 className="font-serif text-3xl mb-2">Warm Feeling</h4>
                    <p className="font-sans text-[10px] uppercase tracking-widest font-bold bg-white/20 px-4 py-2 rounded-full inline-block backdrop-blur-sm">Add Red / Yellow</p>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-300 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                </div>

                <div className="rounded-[2rem] p-8 bg-gradient-to-br from-cyan-400 to-[#004E98] text-white relative overflow-hidden group shadow-lg">
                  <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left">
                    <svg className="w-8 h-8 mb-3 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01"></path>
                    </svg>
                    <h4 className="font-serif text-3xl mb-2">Cool Feeling</h4>
                    <p className="font-sans text-[10px] uppercase tracking-widest font-bold bg-white/20 px-4 py-2 rounded-full inline-block backdrop-blur-sm">Add Blue</p>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-200 rounded-full blur-3xl opacity-40 group-hover:scale-150 transition-transform duration-700"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: References Gallery */}
        <section className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 md:p-10 border border-[#1A1817]/10 shadow-xl shadow-[#1A1817]/5">
          <div className="mb-10 text-center space-y-3">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold text-[#5C5855]">Chapter 3</span>
            <h2 className="font-serif italic text-4xl md:text-5xl text-[#1A1817]">Visual References</h2>
            <p className="font-sans text-sm text-[#5C5855] max-w-xl mx-auto">A curated collection of visual guides to inspire your next masterpiece on canvas.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {referenceImages.map((src, index) => (
              <div 
                key={index} 
                onClick={() => setSelectedImage(src)}
                className="group relative aspect-[4/5] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-[6px] md:border-[10px] border-white overflow-hidden cursor-pointer transform hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)]"
              >
                {/* Fallback skeleton background before image loads */}
                <div className="absolute inset-0 bg-[#F7F5F0] animate-pulse"></div>
                
                <img 
                  src={src} 
                  alt={`Art Reference ${index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover relative z-10 transition-transform duration-700 group-hover:scale-110"
                />

                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur text-[#1A1817] rounded-full w-10 h-10 flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1817]/95 backdrop-blur-md p-4 md:p-12"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 md:top-8 md:right-8 text-white/70 hover:text-white transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <img 
            src={selectedImage} 
            alt="Enlarged Art Reference" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}

/* --- Reusable Micro-Components for cleaner code --- */

function MixRow({ c1, c2, result, name }) {
  return (
    <div className="flex items-center gap-3 w-full bg-[#1A1817]/5 p-3 rounded-2xl group hover:bg-white transition-colors duration-300">
      <div className={`w-10 h-10 rounded-full ${c1} shadow-inner color-swatch`}></div>
      <PlusIcon />
      <div className={`w-10 h-10 rounded-full ${c2} shadow-inner color-swatch`}></div>
      <EqualIcon />
      <div className={`w-12 h-12 rounded-full ${result} shadow-md ring-4 ring-[#1A1817]/5 color-swatch`}></div>
      <span className="font-serif text-lg ml-2 text-[#1A1817] group-hover:text-[#FF6B35] transition-colors">{name}</span>
    </div>
  );
}

function TintCard({ base, soft, light, pale, name, darkText = false }) {
  const textColorBase = darkText ? "text-[#1A1817]" : "text-white";
  const textColorRest = "text-[#1A1817]";

  return (
    <div className="rounded-2xl overflow-hidden border border-[#1A1817]/10 flex flex-col group hover:shadow-lg transition-all duration-300">
      <div className="flex h-16">
        <div className={`w-1/4 ${base} flex flex-col justify-center items-center ${textColorBase} shadow-[inset_-4px_0_10px_rgba(0,0,0,0.05)] relative overflow-hidden`}>
          <span className="font-bold text-sm relative z-10">{name}</span>
        </div>
        <div className={`w-1/4 ${soft} flex flex-col justify-center items-center ${textColorRest} text-center leading-tight`}>
          <span className="text-[10px] uppercase font-bold opacity-60 mb-0.5">10%</span>
          <span className="font-bold text-xs">Soft</span>
        </div>
        <div className={`w-1/4 ${light} flex flex-col justify-center items-center ${textColorRest} text-center leading-tight`}>
           <span className="text-[10px] uppercase font-bold opacity-60 mb-0.5">30%</span>
           <span className="font-bold text-xs">Light</span>
        </div>
        <div className={`w-1/4 ${pale} flex flex-col justify-center items-center ${textColorRest} text-center leading-tight`}>
           <span className="text-[10px] uppercase font-bold opacity-60 mb-0.5">50%</span>
           <span className="font-bold text-xs">Pale</span>
        </div>
      </div>
    </div>
  );
}

function ShadeCard({ base, deep, dark, navy, name }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#1A1817]/10 flex flex-col group hover:shadow-lg transition-all duration-300">
      <div className="flex h-16">
        <div className={`w-1/4 ${base} flex flex-col justify-center items-center text-white shadow-[inset_-4px_0_10px_rgba(0,0,0,0.05)]`}>
          <span className="font-bold text-sm">{name}</span>
        </div>
        <div className={`w-1/4 ${deep} flex flex-col justify-center items-center text-white text-center leading-tight`}>
          <span className="text-[10px] uppercase font-bold opacity-60 mb-0.5">10%</span>
          <span className="font-bold text-xs">Deep</span>
        </div>
        <div className={`w-1/4 ${dark} flex flex-col justify-center items-center text-white text-center leading-tight`}>
           <span className="text-[10px] uppercase font-bold opacity-60 mb-0.5">30%</span>
           <span className="font-bold text-xs">Dark</span>
        </div>
        <div className={`w-1/4 ${navy} flex flex-col justify-center items-center text-white text-center leading-tight`}>
           <span className="text-[10px] uppercase font-bold opacity-60 mb-0.5">50%</span>
           <span className="font-bold text-xs">Tone</span>
        </div>
      </div>
    </div>
  );
}

/* SVG Icons */
function PlusIcon() {
  return (
    <svg className="w-3 h-3 text-[#5C5855]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path>
    </svg>
  );
}

function EqualIcon() {
  return (
    <svg className="w-4 h-4 text-[#5C5855]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 8h16M4 16h16"></path>
    </svg>
  );
}