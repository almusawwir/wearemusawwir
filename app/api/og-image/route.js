import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  // Fallback to hero image if no URL provided
  const fetchUrl = imageUrl || 'https://almusawwir.art/images/hero-bg.jpg';

  const res = await fetch(fetchUrl);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const optimized = await sharp(buffer)
    .resize(1200, 630, { fit: 'cover' })
    .jpeg({ quality: 75 })
    .toBuffer();

  return new NextResponse(optimized, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}