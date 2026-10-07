import React from 'react';
import Papa from 'papaparse';
import EventClient from './EventClient';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";
const SITE = "https://3amideas.club";

async function getEvents() {
  try {
    const res = await fetch(CSV_URL, { next: { revalidate: 0 } });
    if (!res.ok) return [];
    const text = await res.text();
    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim().toLowerCase().replace(/^\uFEFF/, ''),
        complete: (results) => resolve(results.data || [])
      });
    });
  } catch (err) {
    console.error('Could not load events CSV:', err);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const events = await getEvents();
  const targetId = decodeURIComponent(resolvedParams.id || '').trim().toLowerCase();
  const currentEvent = events.find(e => e.id && e.id.trim().toLowerCase() === targetId);

  if (!currentEvent) return { title: 'Event not found | 3 AM Ideas' };

  const rawImage = currentEvent.image_url || '/images/hero-bg.jpg';
  const absoluteImage = rawImage.startsWith('/') ? `${SITE}${rawImage}` : rawImage;
  const ogImage = `${SITE}/api/og-image?url=${encodeURIComponent(absoluteImage)}`;
  const description = currentEvent.tagline || currentEvent.description || 'Some ideas are too good to sleep on.';
  const eventUrl = `${SITE}/event/${encodeURIComponent(targetId)}`;

  return {
    title: `${currentEvent.title} | 3 AM Ideas`,
    description,
    alternates: { canonical: eventUrl },
    openGraph: {
      title: currentEvent.title,
      description,
      images: [ogImage],
      siteName: '3 AM Ideas',
      url: eventUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: currentEvent.title,
      description,
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