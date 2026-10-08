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

const SITE = 'https://3amideas.club';
const TITLE = '3 AM Ideas | A creative community in Bangalore';
const DESCRIPTION = "A creative community in Bangalore for people who want to make things, try things, meet people and chase ideas they'd normally talk themselves out of.";
const SHARE_LINE = "Filmmaking, music, art, stories, games and experiments. Some ideas are too good to sleep on.";

export const metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: '3 AM Ideas',

  // Google Search Console. This token was issued for the old domain.
  // Add 3amideas.club as a new property in Search Console and paste
  // the new token here.
  verification: {
    google: '1h4maxE_OEqU5EXVwp91yD3jx2l6VwCnELRo8Xs43rY',
  },

  openGraph: {
    title: TITLE,
    description: SHARE_LINE,
    url: SITE,
    siteName: '3 AM Ideas',
    images: [
      {
        url: `${SITE}/api/og-image`,
        width: 1200,
        height: 630,
        alt: '3 AM Ideas',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: SHARE_LINE,
    images: [`${SITE}/api/og-image`],
  },
};

export const viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full min-w-0 flex flex-col bg-white">
        {children}
      </body>
    </html>
  );
}