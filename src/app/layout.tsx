import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: 'FilmScript AI | Powered by Exorbis Tech Labs',
  description: 'Advanced AI-powered screenplay and script generator. Write professional movie scripts and web series in Native Roman Hindi/Urdu and English in minutes.',
  keywords: [
    'AI script writer', 'FilmScript AI', 'screenplay generator', 
    'Exorbis Tech Labs', 'Sufiyan Raza', 'Roman Urdu script AI', 
    'Bollywood script writer', 'story generator AI', 'free script writing tool'
  ],
  authors: [{ name: 'Sufiyan Raza', url: 'https://exorbistech.online' }], 
  creator: 'Exorbis Tech Labs',
  publisher: 'Exorbis Tech Labs',
  
  // Open Graph (WhatsApp, Facebook, LinkedIn pe link share karne ke liye)
  openGraph: {
    title: 'FilmScript AI - Write Your Masterpiece',
    description: 'Generate professional screenplays in minutes using AI. Built by Exorbis Tech Labs.',
    url: 'https://filmscriptai.exorbistech.online',
    siteName: 'FilmScript AI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FilmScript AI Dashboard',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },

  // Twitter Cards (X par share karne ke liye)
  twitter: {
    card: 'summary_large_image',
    title: 'FilmScript AI | Exorbis Tech Labs',
    description: 'Advanced AI-powered screenplay generator. Write scripts seamlessly in multiple languages.',
    creator: '@SufiyanRaza',
    images: ['/og-image.jpg'], 
  },

  // Google Bots ko website index karne ki permission
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
