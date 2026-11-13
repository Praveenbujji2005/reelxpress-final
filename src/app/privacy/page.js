import PrivacyPolicyView from '@/components/privacy/PrivacyPolicyView';

export const metadata = {
  title: 'Privacy Policy | reelXpress - QUANTELLOVENTURES PRIVATE LIMITED',
  description:
    'Official Privacy Policy of QUANTELLOVENTURES PRIVATE LIMITED for reelXpress. Learn how we collect, process, and protect your data under Indian data protection laws.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | reelXpress',
    description:
      'Security & Privacy Policy of QUANTELLOVENTURES PRIVATE LIMITED for reelXpress.',
    url: '/privacy',
  },
};

export default function PrivacyPage() {
  return <PrivacyPolicyView />;
}
