"use client";
import React from 'react';

export default function StarterGuidePage() {
  
  // Categorized Supply Links
  const supplyLinks = {
    colours: [
      { id: 1, title: "Essential Colour Set 1", url: "https://amzn.in/d/0bUuHxRo" },
      { id: 2, title: "Essential Colour Set 2", url: "https://amzn.in/d/0961PyQx" },
    ],
    brushes: [
      { id: 3, title: "Starter Brush Kit 1", url: "https://amzn.in/d/00B9cGa7" },
      { id: 4, title: "Starter Brush Kit 2", url: "https://amzn.in/d/00iPzdOo" },
    ],
    canvas: [
      { id: 5, title: "Smooth Texture Canvas 1", url: "https://amzn.in/d/07m9Iabc" },
      { id: 6, title: "Smooth Texture Canvas 2", url: "https://amzn.in/d/0j0i8nQL" },
    ],
    others: [
      { id: 7, title: "Mixing Palette", url: "https://amzn.in/d/00reea4P" },
      { id: 8, title: "Artist Accessory 1", url: "https://amzn.in/d/0fXjyfm8" },
      { id: 9, title: "Artist Accessory 2", url: "https://amzn.in/d/08JNpwPR" },
      { id: 10, title: "Artist Accessory 3", url: "https://amzn.in/d/0dMSmFtu" },
    ]
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F7F5F0] text-[#1A1817] font-sans pb-32">
      {/* Injecting Fonts and Custom Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Manrope:wght@200;300;400;500;600;700&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }
      `}} />

      {/* Navigation */}
      <div className="absolute top-8 left-4 md:left-8 z-50 flex gap-4">
        <a href="/" className="bg-white/80 backdrop-blur px-4 py-2 rounded-full font-sans text-[10px] uppercase tracking-widest font-bold hover:bg-[#1A1817] hover:text-white transition-all shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-[#1A1817] border border-[#1A1817]/5">
          ← Return Home
        </a>
        <a href="/ref" className="bg-[#FF6B35]/10 backdrop-blur px-4 py-2 rounded-full font-sans text-[10px] uppercase tracking-widest font-bold hover:bg-[#FF6B35] hover:text-white transition-all shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-[#FF6B35] border border-[#FF6B35]/20">
          Color Guide →
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
            As we discussed in the workshop, it is perfectly okay to use ready-made colors. But when you are starting out, mixing your own primary colors unlocks a beautiful <strong>surprise element</strong>. It teaches you the soul of the paint, allowing you to literally achieve any shade you desire. 
            <br/><br/>
            Below is your promised beginner's guide to the exact supplies you need to start painting at home today.
          </p>
        </header>

        {/* SECTION 1: The Essential Palette */}
        <section className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 md:p-10 border border-[#1A1817]/10 shadow-xl shadow-[#1A1817]/5">
          <div className="mb-8 border-b border-[#1A1817]/10 pb-6">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold text-[#FF6B35]">Part 1</span>
            <h2 className="font-serif text-3xl text-[#1A1817] mt-2">The Palette</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Essential */}
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

            {/* Additional */}
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
                  <p className="font-sans text-sm text-[#5C5855] mt-1">As a beginner, a smoother texture prevents the paint from fighting the fabric, making blending much easier.</p>
                </div>
                <div>
                  <h4 className="font-serif text-xl text-[#1A1817]">Mixing Palette</h4>
                  <p className="font-sans text-sm text-[#5C5855] mt-1">Any flat surface to mix your wonderful new colour combinations.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Curated Shop Links */}
        <section className="space-y-10">
          <div className="text-center">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold text-[#1A1817]">Shop The Look</span>
            <h2 className="font-serif italic text-4xl text-[#1A1817] mt-2">Curated Supply Links</h2>
            <div className="w-12 h-px bg-[#1A1817]/20 mx-auto mt-4"></div>
          </div>

          {/* Colours */}
          <ShopCategory title="Colours" items={supplyLinks.colours} />
          {/* Brushes */}
          <ShopCategory title="Brushes" items={supplyLinks.brushes} />
          {/* Canvas */}
          <ShopCategory title="Canvas" items={supplyLinks.canvas} />
          {/* Palettes & Other */}
          <ShopCategory title="Palette & Other Accessories" items={supplyLinks.others} />
          
        </section>
      </div>
    </div>
  );
}

/* --- Reusable Components --- */

function ShopCategory({ title, items }) {
  return (
    <div className="space-y-4">
      <h3 className="font-sans text-sm uppercase tracking-[0.2em] font-bold text-[#5C5855] pl-2">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <a 
            key={item.id} 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group block bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-[#1A1817]/10 hover:border-[#FF6B35]/50 hover:bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#FF6B35]/5"
          >
            <div className="w-full aspect-video bg-[#F7F5F0] rounded-xl mb-4 flex items-center justify-center border border-[#1A1817]/5 group-hover:bg-[#FF6B35]/5 transition-colors">
              {/* Amazon Icon Placeholder */}
              <svg className="w-8 h-8 text-[#1A1817]/20 group-hover:text-[#FF6B35]/40 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.982 10.741a3.076 3.076 0 00-1.077-2.338c-.896-.759-2.222-1.121-3.755-1.121-1.408 0-2.613.313-3.468.852v2.247c.928-.616 1.954-.925 2.929-.925 1.517 0 2.235.617 2.235 1.706 0 .399-.104.773-.306 1.096-.201.324-.52.597-.93.791-.41.196-.928.31-1.52.338L6 13.486c-1.28.06-2.261.357-2.883.864C2.495 14.856 2 15.549 2 16.438c0 .942.348 1.688 1.026 2.19.704.52 1.65.794 2.784.794 1.341 0 2.443-.377 3.232-1.098a3.528 3.528 0 001.218-2.223h.044v1.895h2.827v-3.784c0-.986.284-2.146.851-3.471zm-4.305 5.564c-1.378 0-1.879-.806-1.879-1.543 0-.585.244-1.031.716-1.312.47-.282 1.171-.439 2.053-.464l1.839-.053v.525c0 1.644-1.144 2.847-2.729 2.847zM20.89 21.056c-2.43 1.327-5.594 1.977-8.948 1.977-3.627 0-6.844-.75-9.39-2.115-.436-.233-.561-.806-.279-1.195.286-.395.845-.48 1.29-.227 2.185 1.233 5.093 1.905 8.38 1.905 3.013 0 5.86-.582 8.083-1.748.472-.249 1.058-.124 1.32.327.265.45.109 1.034-.366 1.291l-.09.085z"></path>
              </svg>
            </div>
            <h4 className="font-serif text-lg text-[#1A1817] mb-2 leading-tight group-hover:text-[#FF6B35] transition-colors">{title}</h4>
            <div className="flex items-center text-[#5C5855] text-xs font-bold uppercase tracking-wider group-hover:text-[#1A1817] transition-colors">
              <span>View on Amazon</span>
              <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}