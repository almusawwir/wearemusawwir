import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // This securely finds your public/images/home folder
    const dirPath = path.join(process.cwd(), 'public', 'images', 'home');
    
    // Read all files inside the folder
    const files = fs.readdirSync(dirPath);
    
    // Filter out any hidden files (like .DS_Store) and only keep images
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    // Send the actual file names to your website
    return NextResponse.json(imageFiles);
  } catch (error) {
    console.error("Error reading gallery directory:", error);
    return NextResponse.json([], { status: 500 });
  }
}