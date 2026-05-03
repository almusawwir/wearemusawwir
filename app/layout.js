import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✦ AL-MUSAWWIR GLOBAL METADATA ✦
export const metadata = {
  metadataBase: new URL('https://almusawwir.art'),
  title: 'Al-Musawwir | Gatherings',
  description: 'The world is your canvas. You are the fashioner. A curated morning of strokes, stories, and silence at Cubbon Park.',

  // ✦ GOOGLE SEARCH CONSOLE VERIFICATION ✦
  verification: {
    google: '1h4maxE_OEqU5EXVwp91yD3jx2l6VwCnELRo8Xs43rY',
  },

  openGraph: {
    title: 'Al-Musawwir | Gatherings',
    description: 'We believe that art isn\'t a profession—it\'s a human right. Secure your canvas.',
    url: 'https://almusawwir.art',
    siteName: 'Al-Musawwir',
    images: [
      {
        url: 'https://almusawwir.art/api/og-image',
        width: 1200,
        height: 630,
        alt: 'Al-Musawwir Gathering',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Al-Musawwir | Gatherings',
    description: 'We believe that art isn\'t a profession—it\'s a human right. Secure your canvas.',
    images: ['https://almusawwir.art/api/og-image'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F7F5F0]">
        {children}
      </body>
    </html>
  );
}