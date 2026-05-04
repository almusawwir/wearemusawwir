"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length <= 2) {
      window.close();
      setTimeout(() => router.push('/'), 150);
    } else {
      router.back();
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F7F5F0] text-[#1A1817] font-sans antialiased selection:bg-[#FF6B35] selection:text-white pt-24 pb-32 px-4 md:px-6">
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

      {/* ✦ SMART BACK BUTTON ✦ */}
      <nav className="fixed top-8 left-4 md:left-8 z-50">
        <button 
          onClick={handleBack} 
          className="bg-white/80 backdrop-blur px-4 py-2 rounded-full font-sans text-[10px] uppercase tracking-widest font-bold hover:bg-[#1A1817] hover:text-white transition-all shadow-lg text-[#1A1817]"
        >
          ← Back
        </button>
      </nav>

      <div className="max-w-3xl mx-auto relative z-10 space-y-12 mt-12">
        <div className="text-center space-y-4 mb-16">
          <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#FF6B35] font-bold">The Story</span>
          <h1 className="font-serif italic text-5xl md:text-7xl text-[#1A1817] leading-tight pt-4">About Al-Musawwir</h1>
        </div>

        <div className="prose prose-lg prose-p:font-serif prose-p:text-xl md:prose-p:text-2xl prose-p:leading-relaxed prose-p:text-[#1A1817]/80 mx-auto bg-white/60 p-8 md:p-12 rounded-[2rem] border border-[#1A1817]/10 shadow-2xl shadow-[#1A1817]/5">
          <p className="first-letter:text-7xl first-letter:font-bold first-letter:text-[#FF6B35] first-letter:mr-3 first-letter:float-left">
            Al-Musawwir translates to "The Fashioner"—the one who gives form to the formless. We started this initiative after noticing how creativity slowly became something many people felt distant from. Somewhere along the way, art began to feel reserved for professionals, perfection, or performance.
          </p>
          <p>
            We wanted to create a space that gently brings creativity back to people. Al-Musawwir is not just about painting. It is about expression, presence, and human connection.
          </p>
          <p>
            Our gatherings are designed as calm, intentional spaces where people can slow down, create freely, meet like-minded people, and reconnect with their creative instinct without pressure or expectations. Whether you are an experienced artist, someone rediscovering creativity, or simply curious to begin, there is space for you here.
          </p>
          
          <p>
            We believe creation is deeply human. To imagine, shape, express, and give form is part of who we are. And perhaps, in some way, we are all <i className="font-serif">musawwir</i>.
          </p>

          <div className="my-10 p-8 bg-[#1A1817] text-white rounded-2xl shadow-lg">
            <h3 className="font-sans text-xs uppercase tracking-widest text-[#FF6B35] mb-2 font-bold">Our Promise</h3>
            <p className="font-serif text-2xl m-0 text-[#F7F5F0] italic">
              "We provide the canvas, the colors, and the community. You simply arrive as you are."
            </p>
          </div>

          <p>
            This platform is built by the community, for the community. Contributions help us cover art supplies, venues, and maintain intimate gatherings with limited spots.
          </p>
          <p>
            Come create with us. Because we create, therefore we are.
          </p>

          <div className="mt-12 pt-8 border-t border-[#1A1817]/10 flex items-center justify-between">
            <div className="font-sans text-sm font-bold uppercase tracking-widest text-[#1A1817]">
              — Nazim & The Al-Musawwir Team
            </div>
            <a href="mailto:wearemusawwir@gmail.com" className="font-sans text-[10px] text-[#004E98] tracking-widest uppercase font-bold hover:text-[#FF6B35] transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}