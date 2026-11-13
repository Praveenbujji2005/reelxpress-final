import CreatorPageView from '@/components/creators/CreatorPageView';

export const metadata = {
  title: 'Become a Creator | reelXpress - Turn Your iPhone Into an Income Machine',
  description:
    'Join the reelXpress Creator Ecosystem. Turn your iPhone 13 Pro or newer into a high-velocity income machine. Shoot production-grade vertical reels for top brands and get paid instantly per shoot. Zero editing required.',
  alternates: {
    canonical: '/become-a-creator',
  },
  openGraph: {
    title: 'Turn Your iPhone Into an Income Machine | reelXpress Creator Network',
    description:
      'Join our creator ecosystem. Shoot high-velocity reels on your iPhone 13 Pro or newer and get paid instantly per shoot.',
    url: '/become-a-creator',
    siteName: 'reelXpress',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function BecomeACreatorPage() {
  return <CreatorPageView />;
}
