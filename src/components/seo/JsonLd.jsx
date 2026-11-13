import { SITE_CONFIG, SITE_URL } from '@/config/site';
import { FAQ_DATA } from '@/lib/data';

/**
 * Structured Data (JSON-LD) Component
 *
 * Provides Google Rich Snippets for:
 * 1. Organization (reelXpress / QUANTELLOVENTURES PRIVATE LIMITED)
 * 2. LocalBusiness / ProfessionalService (Bengaluru)
 * 3. FAQPage (All verified FAQs)
 * 4. Service / Offer catalog (Instant, Business & Wedding Packages)
 *
 * NOTE: aggregateRating is omitted as requested until real review count/metrics are verified.
 */
export default function JsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/icon-gold.png`,
    description: SITE_CONFIG.description,
    sameAs: [SITE_CONFIG.social.instagram],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE_CONFIG.contact.whatsappNumber,
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['en', 'kn', 'hi', 'te'],
    },
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: SITE_CONFIG.name,
    description: 'On-demand quick reel videography shot on flagship iPhone gear with on-spot live editing across Bengaluru.',
    url: SITE_URL,
    image: `${SITE_URL}/og-image.png`,
    telephone: SITE_CONFIG.contact.whatsappNumber,
    email: SITE_CONFIG.contact.email,
    priceRange: '₹1999 - ₹99999',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '12.9716',
      longitude: '77.5946',
    },
    areaServed: {
      '@type': 'City',
      name: 'Bengaluru',
    },
  };

  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map((faq) => ({
      '@type': 'Question',
      name: faq.question || faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer || faq.a,
      },
    })),
  };

  const servicesCatalogSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'reelXpress Video Packages',
    itemListElement: [
      {
        '@type': 'Service',
        name: 'Hourly Plan',
        description: '1 Hour professional shoot, 1 high-quality edited reel on latest iPhone with instant delivery.',
        offers: {
          '@type': 'Offer',
          price: '2200',
          priceCurrency: 'INR',
          description: '+ 18% GST',
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'Service',
        name: 'Vehicle Shoot',
        description: 'Automotive video coverage for car deliveries, bike rallies, and showroom handovers.',
        offers: {
          '@type': 'Offer',
          price: '3999',
          priceCurrency: 'INR',
          description: 'Starting at ₹1,999 / from ₹3,999 + 18% GST',
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'Service',
        name: 'Half Day Event Plan',
        description: 'Up to 4 hours coverage, 3 high-impact edited reels, dedicated creator on site.',
        offers: {
          '@type': 'Offer',
          price: '8500',
          priceCurrency: 'INR',
          description: '+ 18% GST',
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'Service',
        name: 'Full Day Event Plan',
        description: 'Up to 8 hours coverage, 7 high-impact edited reels, priority delivery.',
        offers: {
          '@type': 'Offer',
          price: '15000',
          priceCurrency: 'INR',
          description: '+ 18% GST',
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'Service',
        name: 'Wedding Gold Package',
        description: 'Covers up to four events, includes 15 reels, shot on iPhone with instant delivery.',
        offers: {
          '@type': 'Offer',
          price: '59999',
          priceCurrency: 'INR',
          description: '+ 18% GST',
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'Service',
        name: 'Wedding Platinum Package',
        description: 'Comprehensive wedding coverage, includes 25 reels, raw clips, interaction videos.',
        offers: {
          '@type': 'Offer',
          price: '99999',
          priceCurrency: 'INR',
          description: '+ 18% GST',
          availability: 'https://schema.org/InStock',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesCatalogSchema) }}
      />
    </>
  );
}
