import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'About Us | Al-Musawwir',
  description: 'We believe that art is a human right. Discover the story behind Al-Musawwir gatherings.',
};

export default function AboutPage() {
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

      <nav className="fixed top-8 left-4 md:left-8 z-50">
        <Link href="/" className="bg-white/80 backdrop-blur px-4 py-2 rounded-full font-sans text-[10px] uppercase tracking-widest font-bold hover:bg-[#1A1817] hover:text-white transition-all shadow-lg text-[#1A1817]">
          ← Back to Home
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto relative z-10 space-y-12 mt-12">
        <div className="text-center space-y-4 mb-16">
          <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#FF6B35] font-bold">The Story</span>
          <h1 className="font-serif italic text-5xl md:text-7xl text-[#1A1817] leading-tight pt-4">About Al-Musawwir</h1>
        </div>

        <div className="prose prose-lg prose-p:font-serif prose-p:text-xl md:prose-p:text-2xl prose-p:leading-relaxed prose-p:text-[#1A1817]/80 mx-auto bg-white/60 p-8 md:p-12 rounded-[2rem] border border-[#1A1817]/10 shadow-2xl shadow-[#1A1817]/5">
          <p className="first-letter:text-7xl first-letter:font-bold first-letter:text-[#FF6B35] first-letter:mr-3 first-letter:float-left">
            Al-Musawwir translates to "The Fashioner" or "The Shaper of Beauty." We started this initiative because we noticed a gap in how society treats creativity. Somewhere along the way, art became restricted to galleries, professionals, and critics. We wanted to change that.
          </p>
          <p>
            We believe that art isn't a profession—it's a human right. Whether you're a seasoned painter, a poet, or someone who hasn't held a brush since middle school, your story deserves a canvas.
          </p>
          <p>
            Our gatherings are not workshops. They are safe, curated spaces where you can disconnect from the noise of the city, sit under the trees, meet incredibly beautiful souls, and simply create. No judgment, no grades, no pressure.
          </p>
          
          <div className="my-10 p-8 bg-[#1A1817] text-white rounded-2xl">
            <h3 className="font-sans text-xs uppercase tracking-widest text-[#FF6B35] mb-2">Our Promise</h3>
            <p className="font-serif text-xl m-0 text-[#F7F5F0]">We promise to provide the canvas, the colors, and the community. All you have to bring is an open heart.</p>
          </div>

          <p>
            This platform is entirely built by the community, for the community. We charge a small fee to cover the high-quality art supplies, venue costs, and to ensure that everyone who RSVPs actually shows up to respect the limited capacity.
          </p>
          <p>
            Come create with us. We can't wait to see what you fashion.
          </p>

          <div className="mt-12 pt-8 border-t border-[#1A1817]/10 flex items-center justify-between">
            <div className="font-sans text-sm font-bold uppercase tracking-widest">— Nazim & The Team</div>
            <a href="mailto:wearemusawwir@gmail.com" className="font-sans text-[10px] text-[#004E98] tracking-widest uppercase font-bold hover:text-[#FF6B35] transition-colors">Contact Us</a>
          </div>
        </div>
      </div>
    </div>
  );
}