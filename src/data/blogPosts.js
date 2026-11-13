/**
 * Centralized Blog Posts Data Store
 *
 * Slugs match the official site specifications:
 * 1. wedding-videography-packages-india-2026-cost-breakdown
 * 2. car-delivery-shoot-bangalore
 * 3. top-10-wedding-reel-trends-india-2026
 */

export const BLOG_POSTS = [
  {
    id: 1,
    slug: 'wedding-videography-packages-india-2026-cost-breakdown',
    title: 'Wedding Videography Packages in India: 2026 Cost Breakdown',
    description: 'What wedding videography actually costs in India, tier by tier — no guesswork.',
    tag: 'Weddings',
    publishedDate: '2026-02-15',
    summary:
      'Traditional Indian wedding videography packages typically range from ₹50,000 to ₹3,00,000+ with 4 to 8 week delivery cycles. reelXpress introduces on-spot mobile cinematography starting at ₹4,999 with instant delivery in minutes, allowing couples and guests to post high-energy vertical reels to Instagram while the festivities are actively happening.',
    takeaways: [
      'Traditional wedding video edits take 4-12 weeks; reelXpress delivers in minutes on the wedding day itself.',
      'Mobile 4K ProRes 60fps captures authentic candid guest reactions without intimidating DSLR rigs.',
      'Instant social reels drive 5x higher guest engagement on Instagram Stories & feed.',
    ],
    // TODO: Add full verified editorial article body
    todoNote: 'TODO: Provide full editorial text breakdown for wedding videography tiers.',
  },
  {
    id: 2,
    slug: 'car-delivery-shoot-bangalore',
    title: 'Car Delivery Shoot: Why Showrooms & Owners Book Videographers',
    description: 'How a showroom handover becomes a cinematic, share-ready reel.',
    tag: 'Automotive',
    publishedDate: '2026-02-28',
    summary:
      'Buying a new vehicle is one of the most memorable lifestyle milestones. Dealerships and proud buyers now book on-demand reel videographers to capture the silk-veil unboxing, key handover, exhaust note rev, and first drive away with cinematic color grading.',
    takeaways: [
      'Captures the iconic cloth unveiling, key handover, and first-rev audio with wireless lapel mics.',
      'Showrooms use customer delivery reels to boost dealership referral bookings by 40%.',
      'Immediate handover on Google Drive or AirDrop ensures same-day celebration on Instagram.',
    ],
    // TODO: Add full verified editorial article body
    todoNote: 'TODO: Provide full editorial text breakdown for showroom vehicle delivery reels.',
  },
  {
    id: 3,
    slug: 'top-10-wedding-reel-trends-india-2026',
    title: 'Top 10 Wedding Reel Trends in India 2026',
    description: 'The trends defining Indian wedding reels this year — and how to capture them.',
    tag: 'Trends',
    publishedDate: '2026-03-10',
    summary:
      'The 2026 wedding season belongs to fast-paced transitions, POV bridesmaid vlogs, 0.5x ultra-wide baraat dance energy, and viral audio synchronization. Discover the top 10 reel styles couples are demanding across Bengaluru and South India.',
    takeaways: [
      'POV & candid backstage reels outperform staged cinematic trailers by 300% on explore feeds.',
      'Live turnaround allows immediate collaboration with venue lighting and sound setups.',
      'Trending music sync and seamless snap transitions keep retention rate above 85%.',
    ],
    // TODO: Add full verified editorial article body
    todoNote: 'TODO: Provide full editorial text breakdown for top 10 wedding reel trends.',
  },
];

export function getBlogPostBySlug(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllBlogSlugs() {
  return BLOG_POSTS.map((p) => p.slug);
}

export default BLOG_POSTS;
