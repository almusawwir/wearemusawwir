import { NextResponse } from 'next/server';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const imagePath = path.join(process.cwd(), 'public/images/hero-bg.jpg');
  const imageBuffer = fs.readFileSync(imagePath);

  const optimized = await sharp(imageBuffer)
    .resize(1200, 630, { fit: 'cover' })   // perfect OG dimensions
    .jpeg({ quality: 75 })                  // ~80–150KB output
    .toBuffer();

  return new NextResponse(optimized, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}