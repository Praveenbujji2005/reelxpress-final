// Centralized content and structured data for reelXpress
// Official copy matching Bengaluru's First Quick Content Service specifications

export const SITE_METADATA = {
  title: "reelXpress | India's 1st Quick Content Service",
  description:
    "We Shoot • Edit • Deliver Reels in Minutes. You live the moment. reelXpress captures it — instantly. Shot on latest iPhone gear with on-spot live editing.",
  url: "https://www.reelxpress.com",
};

// Main navigation links used across header and mobile menu (Home removed)
export const NAV_LINKS = [
  { label: "Why us", href: "/reelxpress" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Real work", href: "/#showcase" },
  { label: "Contact", href: "/contact" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Partner", href: "/creators" },
  { label: "Blog", href: "/#blog" },
];

// Footer navigation & legal links
export const FOOTER_NAV_LINKS = [
  { label: "Home page", href: "/" },
  { label: "Why us", href: "/reelxpress" },
  { label: "Real work", href: "/#showcase" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Blog", href: "/#blog" },
  { label: "Partner", href: "/creators" },
  { label: "Contact Us", href: "/contact" },
];

export const FOOTER_LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

// Hero Value Badges matching the official design
export const HERO_VALUE_BADGES = [
  { icon: "star", text: "5-Star Rated (100+ Reviews)" },
  { icon: "military_tech", text: "1000+ Projects Delivered" },
  { icon: "bolt", text: "Delivery in Minutes" },
  { icon: "phone_iphone", text: "Shot on Latest iPhone" },
  { icon: "currency_rupee", text: "Starting at ₹2,200" },
];

// Shoot Category Cards
export const SHOOT_CATEGORIES = [
  { label: "Quick Shoot", icon: "bolt", href: "/#booking" },
  { label: "Wedding Shoot", icon: "favorite", href: "/#booking" },
  { label: "Vehicle Shoot", icon: "directions_car", href: "/#booking" },
];

// Hero metrics stats row
export const HERO_STATS = [
  { value: "1000+", label: "Reels Delivered" },
  { value: "4.9/5", label: "Client Rating", isStar: true },
  { value: "200+", label: "Creators" },
  { value: "Minutes", label: "Delivery Speed", isLive: true },
];

export const INSTAGRAM_PAGE_URL = "https://www.instagram.com/reelxpress___";

// Showcase Reel portfolio items matching "THE REAL WORK"
export const REEL_PORTFOLIO = [
  {
    id: 0,
    videoSrc: "/assets/Video1.mp4",
    poster: "/thumbnails/reel-frame-1.jpg",
    category: "Weddings & Luxe",
    title: "Bridal & Wedding Shoot",
    subtitle: "Captured & Edited in Minutes",
    creator: "Aditya S.",
    views: "240K",
    likes: "18.5K",
    aspectRatio: "9/16",
    instagramUrl: "https://www.instagram.com/reelxpress___",
  },
  {
    id: 1,
    videoSrc: "/assets/Video2.mp4",
    poster: "/thumbnails/reel-frame-2.jpg",
    category: "Fashion & Events",
    title: "Model Shoot on iPhone",
    subtitle: "Captured & Edited in Minutes",
    creator: "Priya M.",
    views: "420K",
    likes: "32.8K",
    aspectRatio: "9/16",
    instagramUrl: "https://www.instagram.com/reelxpress___",
  },
  {
    id: 2,
    videoSrc: "/assets/Video3.mp4",
    poster: "/thumbnails/reel-frame-3.jpg",
    category: "Luxe Celebrity",
    title: "SIIMA Red Carpet Entry",
    subtitle: "Captured & Edited in Minutes",
    creator: "Arvind K.",
    views: "890K",
    likes: "74.1K",
    aspectRatio: "9/16",
    instagramUrl: "https://www.instagram.com/reelxpress___",
  },
  {
    id: 3,
    videoSrc: "/assets/Video4.mp4",
    poster: "/thumbnails/reel-frame-4.jpg",
    category: "Official Creator",
    title: "SIIMA Awards - ReelXpress",
    subtitle: "Captured & Edited in Minutes",
    creator: "Sneha D.",
    views: "310K",
    likes: "21.5K",
    aspectRatio: "9/16",
    instagramUrl: "https://www.instagram.com/reelxpress___",
  },
  {
    id: 4,
    videoSrc: "/assets/Video5.mp4",
    poster: "/thumbnails/reel-frame-5.jpg",
    category: "Vehicle Shoots",
    title: "Automotive Track Shoot",
    subtitle: "Captured & Edited in Minutes",
    creator: "Vikram S.",
    views: "640K",
    likes: "58.3K",
    aspectRatio: "9/16",
    instagramUrl: "https://www.instagram.com/reelxpress___",
  },
  {
    id: 5,
    videoSrc: "/assets/Video2.mp4",
    poster: "/thumbnails/reel-frame-6.jpg",
    category: "Events & Red Carpet",
    title: "Event Launch Shoot",
    subtitle: "Captured & Edited in Minutes",
    creator: "Rohan V.",
    views: "510K",
    likes: "44.2K",
    aspectRatio: "9/16",
    instagramUrl: "https://www.instagram.com/reelxpress___",
  },
  {
    id: 6,
    videoSrc: "/assets/Video1.mp4",
    poster: "/thumbnails/reel-frame-7.jpg",
    category: "Celebrations",
    title: "Haldi & Wedding Setup",
    subtitle: "Captured & Edited in Minutes",
    creator: "Kavya M.",
    views: "720K",
    likes: "63.9K",
    aspectRatio: "9/16",
    instagramUrl: "https://www.instagram.com/reelxpress___",
  },
];

// "Why ReelXpress? The high-speed edge for your vertical storytelling."
export const WHY_REELXPRESS_DATA = [
  {
    badge: "ELITE QUALITY",
    title: "Premium Quality",
    description:
      "Every Partner is hand-vetted through a rigorous certification process. We guarantee the top 1% of mobile content talent for you.",
    icon: "verified",
    delayClass: "delay-50",
  },
  {
    badge: "SPEED",
    title: "Fast Delivery",
    description:
      "Fast delivery — no long waiting for videos. We understand that social media moves fast. Get your high-quality reels delivered in record time.",
    icon: "bolt",
    delayClass: "delay-100",
  },
  {
    badge: "SOCIAL",
    title: "Social-first Reels",
    description:
      "Social-first reels — shot and edited for Instagram & Shorts. Our creators specialize in vertical storytelling and hooks.",
    icon: "play_circle",
    delayClass: "delay-150",
  },
  {
    badge: "PRODUCTION",
    title: "Professional Shooting",
    description:
      "Professional shooting for any occasion — from vehicle unboxings to wedding shoots. Clean frames, right angles, and cinematic storytelling using high-end mobile gear.",
    icon: "videocam",
    delayClass: "delay-200",
  },
  {
    badge: "QUICK START",
    title: "Enjoy the Moment",
    description:
      "Enjoy the moment — no need to hold the camera yourself. Be fully present while we handle content creation professionally.",
    icon: "mood",
    delayClass: "delay-250",
  },
  {
    badge: "VALUE",
    title: "Clear Pricing",
    description:
      "Clear packages & pricing — no confusion, no hidden costs. Complete transparency with flat-rate packages for all services.",
    icon: "payments",
    delayClass: "delay-300",
  },
];

// Explore Packages Tier Cards
export const EXPLORE_PACKAGES = [
  {
    id: "hourly",
    title: "Hourly",
    price: "₹2,200+gst",
    description: "A single fast, high-quality reel from a one-hour shoot.",
    ctaText: "Book now",
    ctaLink: "#booking",
  },
  {
    id: "vehicle",
    title: "Vehicle Shoots",
    price: "From ₹3,999",
    description: "Regular ₹3,999 · Premium ₹4,999 · Premium + Drone ₹8999",
    ctaText: "View vehicle packages",
    ctaLink: "/#booking",
  },
  {
    id: "wedding",
    title: "Wedding",
    price: "From ₹10,000",
    description: "3 packages tiered by events and reel count, up to full wedding coverage.",
    ctaText: "View wedding packages",
    ctaLink: "/#booking",
  },
];

// Wedding Packages Tier Inclusions
export const WEDDING_TIERS = ["Single Basic", "Three Silver", "Four Gold", "Complete Platinum"];

// Business & Personal Package Inclusions
export const BUSINESS_PACKAGE_INCLUSIONS = [
  "Cinematic visuals for any event",
  "Quick turnaround Cut, Polish, Launch",
  "Refined, personalized storytelling",
  "Ideal for special moments, launches & showcases",
  "Professional production with expert direction",
  "Elevate your content with polished visual storytelling",
];

// Client Brands / Marquee Ticker
export const CLIENT_BRANDS = [
  "NIKE",
  "RED BULL",
  "SPOTIFY",
  "TESLA",
  "SONY",
  "VICE",
  "VOGUE",
];

// Marquee Client Testimonials (Split into dual continuous scrolling rows)
export const MARQUEE_TESTIMONIALS = [
  {
    id: 1,
    name: "Krishna D.",
    role: "Groom's Brother",
    quote:
      "Booked them just a day before the wedding. They showed up with iPhones and edited the video before the baraat ended. Unreal.",
    rating: 5,
  },
  {
    id: 2,
    name: "Padma M.",
    role: "Brand Manager, Skincare Brand",
    quote:
      "We used reelXpress for our store launch - got high-quality reels before the event wrapped up. Perfect for social!",
    rating: 5,
  },
  {
    id: 3,
    name: "Radhika P.",
    role: "Small Business Owner",
    quote:
      "As a new business, getting professional-looking content quickly helped us gain traction online. reelXpress is now our go-to team.",
    rating: 5,
  },
  {
    id: 4,
    name: "Harish G.",
    role: "Event Planner",
    quote:
      "reelXpress has changed the way we capture events for our clients. No delays, no chasing, just pure magic delivered instantly.",
    rating: 5,
  },
  {
    id: 5,
    name: "Arjun S.",
    role: "Influencer",
    quote:
      "I didn't have to do anything except show up. They shot, added trending music, and gave me perfect reels within the hour.",
    rating: 5,
  },
  {
    id: 6,
    name: "Sravanthi R.",
    role: "Bride",
    quote:
      "I was literally watching our wedding reel before the reception dinner even started. These guys are insanely fast and so good!",
    rating: 5,
  },
];

// Row 1: Testimonials 1, 3, 5
export const ROW_1_TESTIMONIALS = [
  MARQUEE_TESTIMONIALS[0], // Krishna D.
  MARQUEE_TESTIMONIALS[2], // Radhika P.
  MARQUEE_TESTIMONIALS[4], // Arjun S.
];

// Row 2: Testimonials 2, 4, 6
export const ROW_2_TESTIMONIALS = [
  MARQUEE_TESTIMONIALS[1], // Padma M.
  MARQUEE_TESTIMONIALS[3], // Harish G.
  MARQUEE_TESTIMONIALS[5], // Sravanthi R.
];

// Client Testimonials
export const TESTIMONIALS_DATA = [
  {
    name: "Dheeraj",
    role: "Lifestyle Influencer",
    avatar: "/creators/dp-1.jpg",
    quote:
      "The turnaround is not a gimmick. I booked, they shot, and I had the file before I finished my coffee.",
    delayClass: "delay-80",
  },
  {
    name: "Sarah Chen",
    role: "CMO, TechFlow",
    avatar: "/creators/dp-2.jpg",
    quote:
      "reelXpress is the Uber of content creation. Consistent quality, industrial aesthetic, and speed.",
    delayClass: "delay-160",
  },
  {
    name: "Marcus J.",
    role: "Event Organizer",
    avatar: "/creators/dp-3.jpg",
    quote:
      "Used the Event Pack for our launch party. The reelXpress creators were professional and invisible. The output was incredible.",
    delayClass: "delay-240",
  },
  {
    name: "Keerthana Jain",
    role: "Content Creator",
    avatar: "/creators/dp-4.jpg",
    quote:
      "reelXpress delivered exactly what I needed—professional reels, hassle-free booking, and great service. Totally worth it!",
    delayClass: "delay-320",
  },
  {
    name: "Adi Keshava Reddy",
    role: "Event Enthusiast",
    avatar: "/creators/dp-5.jpg",
    quote:
      "Capturing moments has never been easier! reelXpress connects you with skilled reel makers for any occasion.",
    delayClass: "delay-400",
  },
];

// Articles from the Blog
export const BLOG_POSTS = [
  {
    id: 1,
    title: "Wedding Videography Packages in India: 2026 Cost Breakdown",
    description:
      "What wedding videography actually costs in India, tier by tier — no guesswork.",
    link: "/#blog",
    tag: "Weddings",
    summary:
      "Traditional Indian wedding videography packages typically range from ₹50,000 to ₹3,00,000+ with 4 to 8 week delivery cycles. reelXpress introduces on-spot mobile cinematography starting at ₹4,999 with instant delivery in minutes, allowing couples and guests to post high-energy vertical reels to Instagram while the festivities are actively happening.",
    takeaways: [
      "Traditional wedding video edits take 4-12 weeks; reelXpress delivers in minutes on the wedding day itself.",
      "Mobile 4K ProRes 60fps captures authentic candid guest reactions without intimidating DSLR rigs.",
      "Instant social reels drive 5x higher guest engagement on Instagram Stories & feed.",
    ],
  },
  {
    id: 2,
    title: "Car Delivery Shoot: Why Showrooms & Owners Book Videographers",
    description:
      "How a showroom handover becomes a cinematic, share-ready reel.",
    link: "/#blog",
    tag: "Automotive",
    summary:
      "Buying a new vehicle is one of the most memorable lifestyle milestones. Dealerships and proud buyers now book on-demand reel videographers to capture the silk-veil unboxing, key handover, exhaust note rev, and first drive away with cinematic color grading.",
    takeaways: [
      "Captures the iconic cloth unveiling, key handover, and first-rev audio with wireless lapel mics.",
      "Showrooms use customer delivery reels to boost dealership referral bookings by 40%.",
      "Immediate handover on Google Drive or AirDrop ensures same-day celebration on Instagram.",
    ],
  },
  {
    id: 3,
    title: "Top 10 Wedding Reel Trends in India 2026",
    description:
      "The trends defining Indian wedding reels this year — and how to capture them.",
    link: "/#blog",
    tag: "Trends",
    summary:
      "The 2026 wedding season belongs to fast-paced transitions, POV bridesmaid vlogs, 0.5x ultra-wide baraat dance energy, and viral audio synchronization. Discover the top 10 reel styles couples are demanding across Bengaluru and South India.",
    takeaways: [
      "POV & candid backstage reels outperform staged cinematic trailers by 300% on explore feeds.",
      "Live turnaround allows immediate collaboration with venue lighting and sound setups.",
      "Trending music sync and seamless snap transitions keep retention rate above 85%.",
    ],
  },
];

// FAQ Data
export const FAQ_DATA = [
  {
    question: "What is reelXpress and how does it work?",
    answer:
      "reelXpress is an on-demand content creation service that connects you with skilled mobile photographers and videographers. We specialize in capturing high-quality, social-media-ready moments using professional mobile gear, ensuring you get authentic content instantly.",
  },
  {
    question: "What gear do your Reel Makers shoot on?",
    answer:
      "All our creators shoot exclusively on the latest flagship iPhone gear paired with professional handheld gimbals, specialized lenses, and high-fidelity wireless microphones for pristine 4K 60fps vertical footage.",
  },
  {
    question: "How fast is 'Delivery in Minutes'?",
    answer:
      "Our creators perform on-spot live editing and color grading directly at your shoot venue. You receive high-definition, post-ready reels before your event concludes or within minutes post-shoot via cloud link.",
  },
  {
    question: "Can I book for weddings, vehicle deliveries, and brand launches?",
    answer:
      "Yes! We offer dedicated formats for Quick Hourly Shoots, Vehicle Delivery & Rollouts, Wedding & Ceremony packages, and Commercial Brand & Store Launches.",
  },
  {
    question: "Can I book last minute? Like, the day before?",
    answer:
      "Yes — clients do this regularly! As long as a verified creator is available in your city zone, we can lock down your slot within minutes. We have successfully arranged same-day shoots multiple times across Hyderabad, Bengaluru, Chennai, Vizag, and Vijayawada.",
  },
  {
    question: "Can I see my Reel Maker's portfolio before the shoot?",
    answer:
      "Absolutely. We happily share creator profiles and sample reels upon request when booking, ensuring their specific aesthetic, camera movement, and pacing align seamlessly with your vision.",
  },
];

// Structured shoot type categories matching the pricing section packages
export const SHOOT_TYPE_CATEGORIES = [
  {
    group: '⚡ Instant Packages (Minutes Delivery)',
    options: [
      'Hourly Plan (₹2,200 - 1 Hour Shoot, 1 Reel)',
      'Vehicle Shoot (From ₹3,999 - Regular / Premium / Drone)',
      'Half Day Plan (₹8,500 - Up to 4 Hours, 3 Reels)',
      'Full Day Plan (₹15,000 - Up to 8 Hours, 7 Reels)',
    ],
  },
  {
    group: '💼 Business & Brand Packages',
    options: [
      'Brand Shoot (Customised Pricing - Campaign & Showcase)',
      'Product Shoot (₹7,000 / reel - E-commerce & Catalog)',
    ],
  },
  {
    group: '💍 Wedding & Celebration Packages',
    options: [
      'Wedding Basic (₹14,999 - Single Event, 3 Reels)',
      'Wedding Silver (₹44,999 - Three Events, 10 Reels)',
      'Wedding Gold (₹59,999 - Four Events, 15 Reels)',
      'Wedding Platinum (₹99,999 - Complete Wedding, 25 Reels)',
      'Luxe Edition (₹1,99,999 - The Pinnacle of Luxury)',
    ],
  },
  {
    group: '🎉 Other Shoots & Occasions',
    options: [
      'Personal Shoots & Lifestyle Outfits',
      'Parties & Celebrations (Birthdays, Housewarmings)',
    ],
  },
];

// Flat occasions list for backwards-compatibility and dropdowns
export const OCCASIONS_LIST = SHOOT_TYPE_CATEGORIES.flatMap((c) => c.options);

// Re-export centralized WhatsApp configuration
export { WHATSAPP_CONFIG, getWhatsAppUrl, openWhatsApp } from '@/config/whatsapp';
