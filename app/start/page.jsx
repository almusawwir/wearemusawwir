"use client";
import React from 'react';

export default function StarterGuidePage() {
  return (
    <div className="relative min-h-screen w-full bg-[#F7F5F0] text-[#1A1817] font-sans pb-32">
      {/* Injecting Fonts and Custom Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Manrope:wght@200;300;400;500;600;700&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }
      `}} />

      {/* Navigation */}
      <div className="absolute top-8 left-4 md:left-8 z-50">
        <a href="/" className="bg-white/80 backdrop-blur px-4 py-2 rounded-full font-sans text-[10px] uppercase tracking-widest font-bold hover:bg-[#1A1817] hover:text-white transition-all shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-[#1A1817] border border-[#1A1817]/5 inline-flex items-center gap-2">
          <span>←</span> Return Home
        </a>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-32 space-y-16">
        
        {/* Logo Placement */}
        <div className="flex justify-center mb-12">
          <img 
            src="/images/logo.png" 
            alt="Al-Musawwir Logo" 
            className="h-28 md:h-36 object-contain drop-shadow-xl"
          />
        </div>

        {/* Intro Header */}
        <header className="text-center space-y-6 max-w-3xl mx-auto bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 md:p-12 border border-[#1A1817]/10 shadow-xl shadow-[#1A1817]/5">
          <h1 className="font-serif italic text-4xl md:text-5xl text-[#1A1817] leading-tight">Welcome to the Canvas</h1>
          <p className="font-sans text-base md:text-lg text-[#5C5855] leading-relaxed">
            As we discussed in the workshop, while ready-made colours are perfectly fine, mixing your own primary colours unlocks a beautiful <strong>surprise element</strong>. It teaches you the soul of the paint, allowing you to literally achieve any shade you desire. 
            <br/><br/>
            Below is your beginner's guide to the supplies you need to start painting at home today.
          </p>
        </header>

        {/* SECTION 1: The Essential Palette */}
        <section className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 md:p-10 border border-[#1A1817]/10 shadow-xl shadow-[#1A1817]/5">
          <div className="mb-8 border-b border-[#1A1817]/10 pb-6">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold text-[#FF6B35]">Part 1</span>
            <h2 className="font-serif text-3xl text-[#1A1817] mt-2">The Palette</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-sans text-[12px] uppercase tracking-[0.2em] font-bold text-[#1A1817]">The Core Essentials</h3>
              <ul className="space-y-3 font-serif text-lg text-[#5C5855]">
                <li className="flex items-center gap-3"><span className="w-4 h-4 rounded-full bg-red-600 block shadow-inner"></span> Crimson (Red)</li>
                <li className="flex items-center gap-3"><span className="w-4 h-4 rounded-full bg-yellow-400 block shadow-inner"></span> Lemon Yellow</li>
                <li className="flex items-center gap-3"><span className="w-4 h-4 rounded-full bg-blue-700 block shadow-inner"></span> Ultramarine Blue</li>
                <li className="flex items-center gap-3"><span className="w-4 h-4 rounded-full bg-white border border-gray-300 block shadow-inner"></span> Titanium White</li>
                <li className="flex items-center gap-3"><span className="w-4 h-4 rounded-full bg-black block shadow-inner"></span> Black</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-sans text-[12px] uppercase tracking-[0.2em] font-bold text-[#1A1817]">Optional Add-ons</h3>
              <ul className="space-y-3 font-serif text-lg text-[#5C5855]">
                <li className="flex items-center gap-3"><span className="w-4 h-4 rounded-full bg-[#FF9900] block shadow-inner"></span> Cadmium Yellow</li>
                <li className="flex items-center gap-3"><span className="w-4 h-4 rounded-full bg-[#E30022] block shadow-inner"></span> Cadmium Red</li>
                <li className="flex items-center gap-3"><span className="w-4 h-4 rounded-full bg-[#000F89] block shadow-inner"></span> Phthalo or Cerulean Blue</li>
                <li className="flex items-center gap-3"><span className="w-4 h-4 rounded-full bg-[#8A3324] block shadow-inner"></span> Burnt Umber / Burnt Sienna</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 2: Brushes & Canvas */}
        <section className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 md:p-10 border border-[#1A1817]/10 shadow-xl shadow-[#1A1817]/5">
          <div className="mb-8 border-b border-[#1A1817]/10 pb-6">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold text-[#004E98]">Part 2</span>
            <h2 className="font-serif text-3xl text-[#1A1817] mt-2">The Arsenal</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
              <h3 className="font-sans text-[12px] uppercase tracking-[0.2em] font-bold text-[#1A1817]">Brush Sizes</h3>
              <div className="bg-white/50 rounded-2xl p-6 border border-[#1A1817]/5 space-y-4">
                <div className="flex justify-between items-center border-b border-[#1A1817]/5 pb-2">
                  <span className="font-serif text-lg text-[#1A1817]">Flat Brush</span>
                  <span className="font-sans text-xs font-bold text-[#5C5855] bg-white px-3 py-1 rounded-full shadow-sm">¾ to 1 inch</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#1A1817]/5 pb-2">
                  <span className="font-serif text-lg text-[#1A1817]">Medium Flat Brush</span>
                  <span className="font-sans text-xs font-bold text-[#5C5855] bg-white px-3 py-1 rounded-full shadow-sm">Size 15 - 20</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#1A1817]/5 pb-2">
                  <span className="font-serif text-lg text-[#1A1817]">Round Brush</span>
                  <span className="font-sans text-xs font-bold text-[#5C5855] bg-white px-3 py-1 rounded-full shadow-sm">Size 8 - 12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-serif text-lg text-[#1A1817]">Liner Brush</span>
                  <span className="font-sans text-xs font-bold text-[#5C5855] bg-white px-3 py-1 rounded-full shadow-sm">Size 0 - 1</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-sans text-[12px] uppercase tracking-[0.2em] font-bold text-[#1A1817]">Canvas & Extras</h3>
              <div className="bg-white/50 rounded-2xl p-6 border border-[#1A1817]/5 h-full flex flex-col justify-center space-y-6">
                <div>
                  <h4 className="font-serif text-xl text-[#1A1817]">Smooth Texture Canvas</h4>
                  <p className="font-sans text-sm text-[#5C5855] mt-1">A smoother texture prevents the paint from fighting the fabric, making blending much easier for beginners.</p>
                </div>
                <div>
                  <h4 className="font-serif text-xl text-[#1A1817]">Mixing Palette</h4>
                  <p className="font-sans text-sm text-[#5C5855] mt-1">Any flat surface or dedicated palette to mix your wonderful new colour combinations.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Amazon Wishlists (The Shop Section) */}
        <section className="space-y-8 pt-8">
          <div className="text-center">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold text-[#1A1817]">Shop The Look</span>
            <h2 className="font-serif italic text-4xl text-[#1A1817] mt-2">Curated Supply Kits</h2>
            <p className="font-sans text-sm text-[#5C5855] mt-4 max-w-xl mx-auto">
              We've created easy one-click Amazon lists. Choose the Basic Kit if you're just starting out, or the Complete Kit for all the extras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Basic Kit Card */}
            <a 
              href="https://www.amazon.in/hz/wishlist/ls/1L55H0ABA2YM3?ref_=wl_share" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-[#1A1817]/10 hover:border-[#FF6B35]/30 hover:shadow-2xl hover:shadow-[#FF6B35]/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/5 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div>
                <div className="w-12 h-12 bg-[#F7F5F0] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#FF6B35] group-hover:text-white transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="font-serif text-3xl text-[#1A1817] mb-2">Basic Supplies</h3>
                <p className="font-sans text-sm text-[#5C5855] mb-8">The absolute core essentials you need to start painting immediately. Perfect for your first masterpiece.</p>
              </div>
              
              <div className="flex items-center text-[#FF6B35] font-sans text-[11px] font-bold uppercase tracking-widest">
                <span>View List on Amazon</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </a>

            {/* All Supplies Card */}
            <a 
              href="https://www.amazon.in/hz/wishlist/ls/4NLFXC0AI796?ref_=wl_share" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative bg-[#1A1817] text-white rounded-3xl p-8 border border-[#1A1817] hover:shadow-2xl hover:shadow-[#1A1817]/20 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-[#1A1817] transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <h3 className="font-serif text-3xl mb-2">All Supplies</h3>
                <p className="font-sans text-sm text-gray-400 mb-8">The complete collection including our recommended optional add-ons, extra colors, and extended tools.</p>
              </div>
              
              <div className="flex items-center text-white font-sans text-[11px] font-bold uppercase tracking-widest">
                <span>View List on Amazon</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </a>

          </div>
        </section>

        {/* SECTION 4: Link to Reference Guide */}
        <section className="pt-16 pb-8">
          <div className="bg-gradient-to-br from-white/80 to-[#F7F5F0] backdrop-blur-md rounded-[2.5rem] p-8 md:p-12 border border-[#1A1817]/10 shadow-[0_20px_40px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Decorative Background Elements */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-orange-400/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 max-w-lg text-center md:text-left">
              <span className="inline-block px-3 py-1 bg-[#1A1817]/5 text-[#1A1817] rounded-full font-sans text-[10px] uppercase tracking-widest font-bold mb-4 border border-[#1A1817]/10">
                Next Steps
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-[#1A1817] mb-3">Master the Basics</h2>
              <p className="font-sans text-base text-[#5C5855]">
                Ready to paint? Review the basic techniques, color mixing secrets, and visual reference guides we covered during the workshop.
              </p>
            </div>

            <div className="relative z-10 w-full md:w-auto flex-shrink-0">
              <a 
                href="/ref" 
                className="group w-full md:w-auto flex items-center justify-center gap-3 bg-[#FF6B35] text-white px-8 py-4 rounded-full font-sans text-[12px] font-bold uppercase tracking-widest hover:bg-[#E55A2B] hover:shadow-[0_10px_20px_rgba(255,107,53,0.25)] hover:-translate-y-1 transition-all duration-300"
              >
                <span>View Reference Card</span>
                <svg className="w-5 h-5 transform group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </a>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}