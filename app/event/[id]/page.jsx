import React from 'react';
import Papa from 'papaparse';
import EventClient from './EventClient';

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
      url: `https://almusawwir.art/event/${targetId}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: currentEvent.title,
      description: currentEvent.tagline,
      images: [ogImage],
    }
  };
}

export default async function EventDetailPage({ params }) {
  const resolvedParams = await params;
  const events = await getEvents();

  const targetId = decodeURIComponent(resolvedParams.id || '').trim().toLowerCase();
  const currentEvent = events.find(e => e.id && e.id.trim().toLowerCase() === targetId);
  const suggestedEvents = events.filter(e => e.id && e.id.trim().toLowerCase() !== targetId);

  return <EventClient currentEvent={currentEvent} suggestedEvents={suggestedEvents} targetId={targetId} />;
}