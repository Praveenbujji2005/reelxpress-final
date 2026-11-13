import TermsConditionsView from '@/components/terms/TermsConditionsView';

export const metadata = {
  title: 'Terms & Conditions | reelXpress - QUANTELLOVENTURES PRIVATE LIMITED',
  description:
    'Terms and Conditions governing access to and use of reelXpress platform, booking services, and intellectual property by QUANTELLOVENTURES PRIVATE LIMITED.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms & Conditions | reelXpress',
    description:
      'Legally binding terms agreement between QUANTELLOVENTURES PRIVATE LIMITED and the user.',
    url: '/terms',
  },
};

export default function TermsPage() {
  return <TermsConditionsView />;
}
