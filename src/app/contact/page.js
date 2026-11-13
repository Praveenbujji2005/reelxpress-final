import ContactPageView from '@/components/contact/ContactPageView';

export const metadata = {
  title: 'Contact Us | reelXpress - Quick Content Video Production',
  description:
    'Get in touch with the reelXpress team for instant event video coverage, creator partnerships, brand shoots, or general enquiries.',
  alternates: {
    canonical: '/contact',
  },
  keywords: [
    'reelXpress contact',
    'Contact reelXpress',
    'Video Production Bangalore',
    'Reels Maker Contact',
    'Event Videography Contact Bengaluru',
  ],
  openGraph: {
    title: 'Contact Us | reelXpress',
    description:
      'Connect with our Bengaluru production desk for instant vertical video shoots and same-day delivery.',
    url: '/contact',
    siteName: 'reelXpress',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactPageView />;
}