"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Papa from 'papaparse';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";

function TicketContent() {
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('id') || 'TKT-PENDING';
  const attendeeName = searchParams.get('name') || 'Artist';
  const eventId = searchParams.get('eventId') || '';

  const [eventDetails, setEventDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the specific event details to populate the ticket
  useEffect(() => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    fetch(CSV_URL)
      .then(res => res.text())
      .then(text => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (h) => h.trim().toLowerCase().replace(/^\uFEFF/, ''),
          complete: (results) => {
            const foundEvent = results.data.find(e => e.id && e.id.trim().toLowerCase() === eventId.toLowerCase());
            if (foundEvent) {
              setEventDetails(foundEvent);
            }
            setIsLoading(false);
          }
        });
      });
  }, [eventId]);

  return (
    <div className="w-full max-w-md mx-auto relative z-10 flex flex-col gap-6">
      
      {/* Success Message */}
      <div className="text-center space-y-2 mb-4">
        <div className="w-16 h-16 bg-[#1A1817] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#1A1817]/20">
          <svg className="w-8 h-8 text-[#FF6B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-[#1A1817]">Payment Successful</h1>
        <p className="font-sans text-sm text-[#5C5855]">Your canvas is officially secured.</p>
      </div>

      {/* The Ticket Card */}
      <div className="glass-card rounded-[2rem] overflow-hidden shadow-2xl shadow-[#004E98]/10 border border-[#1A1817]/10 relative">
        
        {/* Ticket Header */}
        <div className="bg-[#1A1817] p-8 text-center relative overflow-hidden">
          <div className="absolute top-[-50%] right-[-20%] w-40 h-40 bg-[#FF6B35] rounded-full filter blur-[50px] opacity-30"></div>
          <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#F7F5F0]/60 block mb-2">Digital Pass</span>
          {isLoading ? (
             <div className="h-8 bg-white/20 rounded w-3/4 mx-auto animate-pulse"></div>
          ) : (
             <h2 className="font-serif italic text-3xl text-white leading-tight">
               {eventDetails?.title || 'Al-Musawwir'}
             </h2>
          )}
        </div>

        {/* Ticket Details */}
        <div className="p-8 bg-white/60 space-y-6">
          <div>
            <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#5C5855] font-bold block mb-1">Attendee</span>
            <span className="font-serif text-2xl text-[#1A1817]">{attendeeName}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#5C5855] font-bold block mb-1">Date</span>
              {isLoading ? (
                <div className="h-6 bg-[#1A1817]/10 rounded w-full animate-pulse mt-1"></div>
              ) : (
                <span className="font-serif text-lg text-[#1A1817]">{eventDetails?.date || 'TBD'}</span>
              )}
            </div>
            <div>
              <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#5C5855] font-bold block mb-1">Time</span>
              {isLoading ? (
                <div className="h-6 bg-[#1A1817]/10 rounded w-full animate-pulse mt-1"></div>
              ) : (
                <span className="font-serif text-lg text-[#1A1817]">{eventDetails?.time || 'TBD'}</span>
              )}
            </div>
          </div>

          <div>
            <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#5C5855] font-bold block mb-1">Location</span>
            {isLoading ? (
                <div className="h-6 bg-[#1A1817]/10 rounded w-3/4 animate-pulse mt-1"></div>
            ) : (
                <span className="font-serif text-lg text-[#1A1817]">
                  {eventDetails?.location_main || 'TBD'}
                  {eventDetails?.location_sub ? `, ${eventDetails.location_sub}` : ''}
                </span>
            )}
          </div>

          <div className="pt-6 border-t border-dashed border-[#1A1817]/20 flex justify-between items-end">
            <div>
              <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#5C5855] font-bold block mb-1">Ticket ID</span>
              <span className="font-sans text-xs text-[#1A1817] font-mono bg-[#1A1817]/5 px-2 py-1 rounded">{ticketId}</span>
            </div>
            <div className="text-right">
              <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#5C5855] font-bold block mb-1">Status</span>
              <span className="font-sans text-xs text-green-600 font-bold uppercase tracking-wider">Confirmed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-4">
        <Link href="/" className="w-full bg-[#1A1817] text-white font-sans text-xs uppercase tracking-[0.2em] font-bold py-4 px-8 rounded-xl hover:bg-[#FF6B35] transition-all text-center">
          Return to Home
        </Link>
        <a href={`mailto:wearemusawwir@gmail.com?subject=Cancel Ticket: ${ticketId}&body=Hi team, I would like to cancel my ticket (${ticketId}) for ${eventDetails?.title || 'Al-Musawwir'}.`} className="text-center font-sans text-[10px] text-[#5C5855] underline hover:text-[#E24E7A] transition-colors mt-2">
          Request Cancellation (Within 30 mins)
        </a>
      </div>

    </div>
  );
}

export default function TicketPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#F7F5F0] text-[#1A1817] flex justify-center items-center py-12 px-4 md:px-6">
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
        .glass-card { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.8); }
      `}} />
      <div className="canvas-texture"></div>
      
      <Suspense fallback={<div className="font-serif text-2xl animate-pulse z-10">Generating Ticket...</div>}>
        <TicketContent />
      </Suspense>
    </div>
  );
}