/**
 * Centralized Site and Business Configuration for reelXpress
 *
 * All contact information, branding rules, social links, and legal flags
 * are centralized here to maintain 100% consistency across the entire application.
 */

// Single centralized site URL constant
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.reelxpress.com';

export const SITE_CONFIG = {
  name: 'reelXpress',
  legalName: 'QUANTELLOVENTURES PRIVATE LIMITED',
  // TODO: [Confirm 'First' claim if provable] Provable tagline used across SEO & branding
  tagline: 'Quick Reel Service in Bengaluru',
  description:
    'We Shoot • Edit • Deliver Reels in Minutes. You live the moment. reelXpress captures it — instantly. Shot on latest iPhone gear with on-spot live editing and fast cloud delivery.',
  canonicalUrl: SITE_URL,
  
  // Contact details
  contact: {
    directLine: '+91 9988338180',
    directLineTel: '+919988338180',
    whatsappNumber: '+91 84319 12122',
    whatsappClean: '918431912122',
    email: 'connect@reelxpress.com',
    primaryCity: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    supportedCities: ['Bengaluru', 'Hyderabad', 'Chennai', 'Vizag', 'Vijayawada'],
  },

  social: {
    instagram: 'https://www.instagram.com/reelxpress___',
    instagramHandle: '@reelxpress___',
  },

  gst: {
    rate: '18%',
    noticeText: '+ 18% GST applicable on all packages',
    shortNotice: '+ GST',
  },

  /**
   * LEGAL / TRUST: Brand Logo Strip (Nike, Red Bull, Spotify, Tesla, Sony, Vice, Vogue)
   * TODO: Confirm whether Nike, Red Bull, Spotify, Tesla, Sony, Vice, and Vogue are official
   * verified enterprise clients of reelXpress before setting SHOW_CLIENT_BRANDS to true.
   * Kept false by default to prevent trademark infringement and misleading advertising claims.
   */
  SHOW_CLIENT_BRANDS: false,
};

export default SITE_CONFIG;
