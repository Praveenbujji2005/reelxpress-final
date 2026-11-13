import { Plus_Jakarta_Sans, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { SITE_CONFIG } from '@/config/site';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';
import FullScreenLoader from '@/components/ui/FullScreenLoader';
import AmbientOrbs from '@/components/ui/AmbientOrbs';
import ScrollProgress from '@/components/ui/ScrollProgress';
import FloatingActionButtons from '@/components/ui/FloatingActionButtons';
import WhatsAppWidget from '@/components/ui/WhatsAppWidget/WhatsAppWidget';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import JsonLd from '@/components/seo/JsonLd';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata = {
  title: `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`,
  description: SITE_CONFIG.description,
  keywords: [
    'Reel Maker',
    'Instagram Reels',
    'Bengaluru',
    'Quick Content Service',
    'Event Videography',
    'Same-Day Video Delivery',
    'Wedding Reels',
    'Vehicle Shoot',
    'Model Shoot',
  ],
  authors: [{ name: SITE_CONFIG.legalName }],
  metadataBase: new URL(SITE_CONFIG.canonicalUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    url: '/',
    siteName: SITE_CONFIG.name,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'reelXpress - Shoot • Edit • Deliver Reels in Minutes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: ['/og-image.png'],
  },
};

export const viewport = {
  themeColor: '#151215',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${plusJakartaSans.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Official Brand Favicon & Touch Icon */}
        <link rel="icon" href="/brand/icon-gold.png" type="image/png" />
        <link rel="apple-touch-icon" href="/brand/icon-gold.png" />
        {/* Google Material Symbols Outlined Icon Font with display=block to prevent text flash */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
        />
        {/* Same-origin proxy configuration for delivery SDK */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                window.__DELIVERY_SDK_BASE_URL__ = '/api/delivery-sdk';
                window.LINER_BASE_URL = '/api/delivery-sdk';
                window.deliverySdkBaseUrl = '/api/delivery-sdk';
              } catch (_) {}
            `,
          }}
        />
        {/* Structured Data JSON-LD Schemas */}
        <JsonLd />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${cormorantGaramond.variable} bg-background text-text-primary antialiased selection:bg-primary-container selection:text-text-primary min-h-screen min-h-[100dvh] relative font-sans`}
        suppressHydrationWarning
      >
        {/* Full-Screen reelXpress Loading Experience */}
        <FullScreenLoader />

        <ErrorBoundary>
          <SmoothScrollProvider>
            {/* Top GPU Scroll Progress Bar */}
            <ScrollProgress />

            {/* Background Ambient Glowing Orbs */}
            <AmbientOrbs />

            {/* Application Page Flow */}
            <div className="relative z-10 flex flex-col min-h-screen min-h-[100dvh]">
              {children}
            </div>
          </SmoothScrollProvider>

          {/* Persistent Floating Bottom-Left Action Buttons */}
          <FloatingActionButtons />

          {/* Persistent Floating WhatsApp Chat Widget (Bottom-Right) */}
          <WhatsAppWidget />
        </ErrorBoundary>
      </body>
    </html>
  );
}
