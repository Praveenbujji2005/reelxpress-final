import CreatorPageView from '@/components/creators/CreatorPageView';

export const metadata = {
  title: 'Become a Creator | reelXpress - Turn Your iPhone Into an Income Machine',
  description:
    'Join the reelXpress Creator Ecosystem. Turn your iPhone 13 Pro or newer into a high-velocity income machine. Shoot production-grade vertical reels for top brands and get paid instantly per shoot. Zero editing required.',
  alternates: {
    canonical: '/creators',
  },
  keywords: [
    'Become a Creator',
    'iPhone Videographer',
    'Reel Creator Jobs Bengaluru',
    'Part-Time Content Creator',
    'Instagram Reel Maker',
    'reelXpress Creator Network',
    'Videography Freelance Bangalore',
  ],
  openGraph: {
    title: 'Turn Your iPhone Into an Income Machine | reelXpress Creator Network',
    description:
      'Join our creator ecosystem. Shoot high-velocity reels on your iPhone 13 Pro or newer and get paid instantly per shoot.',
    url: '/creators',
    siteName: 'reelXpress',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Become a Creator | reelXpress',
    description:
      'Turn your iPhone into an income machine. No editing needed. Just shoot, upload, and get paid.',
  },
};

export default function CreatorsPage() {
  return <CreatorPageView />;
}
