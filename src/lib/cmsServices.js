import { db, storage, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  REEL_PORTFOLIO,
  FAQ_DATA,
} from './data';

// =============================================================================
// LOCAL PERSISTENCE KEYS
// =============================================================================
export const CMS_STORAGE_KEYS = {
  hero: 'reelxpress_cms_hero',
  pricing: 'reelxpress_cms_pricing',
  testimonials: 'reelxpress_cms_testimonials',
  faqs: 'reelxpress_cms_faqs',
  activity: 'reelxpress_cms_activity_logs',
};

// Legacy keys for seamless backward compatibility
const LEGACY_STORAGE_KEYS = {
  hero: 'reelxpress_cms_hero_slides',
  pricing: 'reelxpress_cms_pricing_plans',
};

// =============================================================================
// 1. BASELINE CATALOG SEED DATA
// =============================================================================

// Default 6 client reviews
export const INITIAL_TESTIMONIALS = [
  {
    id: 'testi_1',
    name: 'Krishna D.',
    role: "Groom's Brother",
    quote:
      'Booked them just a day before the wedding. They showed up with iPhones and edited the video before the baraat ended. Unreal.',
    review:
      'Booked them just a day before the wedding. They showed up with iPhones and edited the video before the baraat ended. Unreal.',
    rating: 5,
    avatar: '/brand/icon-gold.png',
    enabled: true,
    order: 1,
  },
  {
    id: 'testi_2',
    name: 'Padma M.',
    role: 'Brand Manager, Skincare Brand',
    quote:
      'We used reelXpress for our store launch - got high-quality reels before the event wrapped up. Perfect for social!',
    review:
      'We used reelXpress for our store launch - got high-quality reels before the event wrapped up. Perfect for social!',
    rating: 5,
    avatar: '/brand/icon-gold.png',
    enabled: true,
    order: 2,
  },
  {
    id: 'testi_3',
    name: 'Radhika P.',
    role: 'Small Business Owner',
    quote:
      'As a new business, getting professional-looking content quickly helped us gain traction online. reelXpress is now our go-to team.',
    review:
      'As a new business, getting professional-looking content quickly helped us gain traction online. reelXpress is now our go-to team.',
    rating: 5,
    avatar: '/brand/icon-gold.png',
    enabled: true,
    order: 3,
  },
  {
    id: 'testi_4',
    name: 'Harish G.',
    role: 'Event Planner',
    quote:
      'reelXpress has changed the way we capture events for our clients. No delays, no chasing, just pure magic delivered instantly.',
    review:
      'reelXpress has changed the way we capture events for our clients. No delays, no chasing, just pure magic delivered instantly.',
    rating: 5,
    avatar: '/brand/icon-gold.png',
    enabled: true,
    order: 4,
  },
  {
    id: 'testi_5',
    name: 'Arjun S.',
    role: 'Influencer',
    quote:
      "I didn't have to do anything except show up. They shot, added trending music, and gave me perfect reels within the hour.",
    review:
      "I didn't have to do anything except show up. They shot, added trending music, and gave me perfect reels within the hour.",
    rating: 5,
    avatar: '/brand/icon-gold.png',
    enabled: true,
    order: 5,
  },
  {
    id: 'testi_6',
    name: 'Sravanthi R.',
    role: 'Bride',
    quote:
      'I was literally watching our wedding reel before the reception dinner even started. These guys are insanely fast and so good!',
    review:
      'I was literally watching our wedding reel before the reception dinner even started. These guys are insanely fast and so good!',
    rating: 5,
    avatar: '/brand/icon-gold.png',
    enabled: true,
    order: 6,
  },
];

// Default 10 pricing packages (Instant x4, Business x2, Wedding x4)
export const INITIAL_PRICING_PLANS = [
  // Instant
  {
    id: 'instant-hourly',
    category: 'instant',
    tag: 'SINGLE EVENT',
    name: 'Hourly Plan',
    description: 'Perfect for anyone who wants a single, fast, high-quality reel delivered in minutes.',
    price: '₹ 2,200',
    priceSuffix: '+ GST',
    badge: 'BEST SELLER',
    isPopular: true,
    enabled: true,
    order: 1,
    shootType: 'Hourly Plan (₹2,200 - 1 Hour Shoot, 1 Reel)',
    inclusions: [
      '1 Hour Professional Shoot',
      '1 High-Quality Edited Reel',
      'Shot on Latest iPhone',
      'Instant reel delivery (within minutes)',
      'Instant Reel Maker on site',
      'reelXpress Branding Included',
      'Up to 2 Free Revisions',
    ],
    ctaText: 'Book Hourly',
  },
  {
    id: 'instant-vehicle',
    category: 'instant',
    tag: 'AUTOMOTIVE',
    name: 'Vehicle Shoot',
    description: 'Specialized dynamic reels for car & superbike deliveries, unboxings, and rallies.',
    price: '₹3,999',
    priceSuffix: 'onwards + 18% GST',
    badge: '',
    isPopular: false,
    enabled: true,
    order: 2,
    shootType: 'Vehicle Shoot (From ₹3,999 - Regular / Premium / Drone)',
    inclusions: [
      'Regular ₹3,999 · Premium ₹4,999 · Drone ₹8,999',
      'Dynamic rolling & tracking shots',
      'Shot on Latest iPhone with gimbal gear',
      'Instant reel delivery',
      'Sound design & exhaust note capture',
      'RAW content on request',
      'reelXpress Logo Mandatory',
    ],
    ctaText: 'Book Vehicle Shoot',
  },
  {
    id: 'instant-half-day',
    category: 'instant',
    tag: 'FOUR HOURS',
    name: 'Half Day',
    description: 'Ideal for parties, pop-up events, store launches, or multi-content creator shoots.',
    price: '₹8,500',
    priceSuffix: '+ 18% GST',
    badge: '',
    isPopular: false,
    enabled: true,
    order: 3,
    shootType: 'Half Day Plan (₹8,500 - Up to 4 Hours, 3 Reels)',
    inclusions: [
      'Covers up to 4 hours event',
      'Includes 3 High-Impact Edited Reels',
      'Shot on Latest iPhone',
      'Instant reel delivery',
      'Dedicated Creator on site',
      'Complimentary mobile portraits',
      'reelXpress Logo Mandatory',
    ],
    ctaText: 'Book Half Day',
  },
  {
    id: 'instant-full-day',
    category: 'instant',
    tag: 'EIGHT HOURS',
    name: 'Full Day',
    description: 'Complete day-long coverage for exhibitions, major festivals, and marathon events.',
    price: '₹15,000',
    priceSuffix: '+ 18% GST',
    badge: '',
    isPopular: false,
    enabled: true,
    order: 4,
    shootType: 'Full Day Plan (₹15,000 - Up to 8 Hours, 7 Reels)',
    inclusions: [
      'Covers up to 8 hours event',
      'Includes 7 High-Impact Edited Reels',
      'Shot on Latest iPhone',
      'Priority on-site delivery',
      'Full event storytelling & coverage',
      'All RAW footage provided on request',
      'reelXpress Logo Mandatory',
    ],
    ctaText: 'Book Full Day',
  },
  // Business
  {
    id: 'business-brand',
    category: 'business',
    tag: 'COMPREHENSIVE',
    name: 'Brand shoot',
    description: 'Professional coverage tailored to campaign, launch, and showcase moments, scoped around your calendar and deliverables.',
    price: 'Customised',
    priceSuffix: '+ GST',
    badge: 'MOST FLEXIBLE',
    isPopular: true,
    enabled: true,
    order: 5,
    shootType: 'Brand Shoot (Customised Pricing - Campaign & Showcase)',
    inclusions: [
      'Cinematic visuals for premium brands & events',
      'Refined, brand-aligned storytelling',
      'Professional production with expert direction',
      'Hassle-free booking & coordination',
      'Quick turnaround: Cut. Polish. Launch.',
      'Ideal for campaigns, launches & brand showcases',
      'Dedicated creative director for every campaign',
      'reelXpress Logo Mandatory',
    ],
    ctaText: 'Book Now',
  },
  {
    id: 'business-product',
    category: 'business',
    tag: 'PER REEL',
    name: 'Product Shoot',
    description: 'High-converting product and catalog reels for e-commerce, D2C, and brand launches, shot and edited to make your product the hero.',
    price: '₹ 7,000',
    priceSuffix: 'onwards / per reel + GST',
    badge: '',
    isPopular: false,
    enabled: true,
    order: 6,
    shootType: 'Product Shoot (₹7,000 / reel - E-commerce & Catalog)',
    inclusions: [
      'Product, catalog & e-commerce reels',
      'Studio or on-location shoots',
      'Cinematic reel delivery',
      'Shot on the latest iPhone',
      'RAW content on request',
      'reelXpress Logo Mandatory',
    ],
    ctaText: 'Enquire now',
  },
  // Wedding
  {
    id: 'wedding-basic',
    category: 'wedding',
    tag: 'SINGLE EVENT',
    name: 'Basic',
    description: "Perfect for couples looking for a stunning, professionally crafted wedding shoot that won't break the bank.",
    price: '₹ 14,999',
    priceSuffix: '+ 18% GST',
    badge: '',
    isPopular: false,
    enabled: true,
    order: 7,
    shootType: 'Wedding Basic (₹14,999 - Single Event, 3 Reels)',
    inclusions: [
      'Covers up to one event',
      'Includes 3 Reels',
      'Shot on iPhone',
      'Instant reel delivery',
      'Complimentary pictures',
      'Please provide an SD card to receive all raw content if needed',
      'reelXpress Logo Mandatory',
    ],
    ctaText: 'Book Basic',
  },
  {
    id: 'wedding-silver',
    category: 'wedding',
    tag: 'THREE EVENTS',
    name: 'Silver',
    description: 'Perfect for those who want comprehensive coverage with an extra touch of elegance.',
    price: '₹ 44,999',
    priceSuffix: '+ 18% GST',
    badge: '',
    isPopular: false,
    enabled: true,
    order: 8,
    shootType: 'Wedding Silver (₹44,999 - Three Events, 10 Reels)',
    inclusions: [
      'Covers up to three event',
      'Includes 10 Reels',
      'Shot on iPhone',
      'Instant reel delivery',
      'Complimentary pictures',
      'Please provide an SD card to receive all raw content if needed',
      'reelXpress Logo Mandatory',
    ],
    ctaText: 'Book Silver',
  },
  {
    id: 'wedding-gold',
    category: 'wedding',
    tag: 'FOUR EVENTS',
    name: 'Gold',
    description: 'Perfect for couples who want an exclusive, comprehensive experience across four events.',
    price: '₹ 59,999',
    priceSuffix: '+ 18% GST',
    badge: 'MOST POPULAR',
    isPopular: true,
    enabled: true,
    order: 9,
    shootType: 'Wedding Gold (₹59,999 - Four Events, 15 Reels)',
    inclusions: [
      'Covers up to four event',
      'Includes 15 Reels',
      'Shot on iPhone',
      'Instant reel delivery',
      'Complimentary pictures',
      'Please provide an SD card to receive all raw content if needed',
      'reelXpress Logo Mandatory',
    ],
    ctaText: 'Book Gold',
  },
  {
    id: 'wedding-platinum',
    category: 'wedding',
    tag: 'COMPLETE WEDDING',
    name: 'Platinum',
    description: 'For couples who want it all: every moment captured with unmatched attention to detail.',
    price: '₹ 99,999',
    priceSuffix: '+ 18% GST',
    badge: '',
    isPopular: false,
    enabled: true,
    order: 10,
    shootType: 'Wedding Platinum (₹99,999 - Complete Wedding, 25 Reels)',
    inclusions: [
      'Covers whole wedding events',
      'Includes 25 Reels',
      'Shot on iPhone',
      'Instant reel delivery',
      'Interaction videos with complimentary mobile portraits',
      'Please provide an SD card to receive all raw content if needed',
      'reelXpress Logo Mandatory',
    ],
    ctaText: 'Book Platinum',
  },
];

// Default FAQs
export const INITIAL_FAQS = (FAQ_DATA || []).map((faq, idx) => ({
  id: 'faq_' + (idx + 1),
  question: faq.question || faq.q || '',
  answer: faq.answer || faq.a || '',
  category: faq.category || 'General',
  enabled: true,
  order: idx + 1,
}));

// Default Hero slides
export const INITIAL_HERO_SLIDES = (REEL_PORTFOLIO || []).map((reel, idx) => ({
  id: String(reel.id !== undefined && reel.id !== null ? reel.id : `hero_${idx + 1}`),
  title: reel.title || `Featured Reel ${idx + 1}`,
  creator: reel.creator || 'reelXpress Creator',
  category: reel.category || 'Celebrations',
  views: reel.views || '150K views',
  poster: reel.poster || '/thumbnails/hero-video-1.jpg',
  videoUrl: reel.videoUrl || reel.videoSrc || '',
  videoSrc: reel.videoSrc || reel.videoUrl || '',
  instagramUrl: reel.instagramUrl || 'https://www.instagram.com/reelxpress___',
  enabled: true,
  order: reel.order || idx + 1,
}));

// =============================================================================
// 2. HELPER FUNCTIONS: TIMEOUT & CACHE & MERGE
// =============================================================================

/**
 * Server-safe browser localStorage reader
 */
function getLocal(key, defaultVal) {
  if (typeof window === 'undefined') return defaultVal;
  try {
    let raw = localStorage.getItem(key);
    // Legacy fallback check if modern key not found
    if (!raw) {
      for (const [canonical, legacy] of Object.entries(LEGACY_STORAGE_KEYS)) {
        if (CMS_STORAGE_KEYS[canonical] === key) {
          raw = localStorage.getItem(legacy);
          break;
        }
      }
    }
    if (!raw) {
      if (defaultVal !== null && defaultVal !== undefined) {
        localStorage.setItem(key, JSON.stringify(defaultVal));
      }
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

/**
 * Server-safe browser localStorage writer (updates both canonical & legacy keys)
 */
function setLocal(key, val) {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(val);
    localStorage.setItem(key, serialized);
    for (const [canonical, legacy] of Object.entries(LEGACY_STORAGE_KEYS)) {
      if (CMS_STORAGE_KEYS[canonical] === key) {
        localStorage.setItem(legacy, serialized);
        break;
      }
    }
  } catch {}
}

// =============================================================================
// SYNCHRONOUS CACHED GETTERS (Instant 0ms bootstrap for public components)
// =============================================================================

export function getCachedHeroSlides() {
  const cached = getLocal(CMS_STORAGE_KEYS.hero, null);
  if (Array.isArray(cached) && cached.length > 0) {
    const active = cached.filter((s) => s.enabled !== false);
    if (active.length > 0) return active;
  }
  return INITIAL_HERO_SLIDES;
}

export function getCachedPricingPlans() {
  const cached = getLocal(CMS_STORAGE_KEYS.pricing, null);
  if (Array.isArray(cached) && cached.length > 0) {
    const active = cached.filter((p) => p.enabled !== false);
    if (active.length > 0) return active;
  }
  return INITIAL_PRICING_PLANS;
}

export function getCachedTestimonials() {
  const cached = getLocal(CMS_STORAGE_KEYS.testimonials, null);
  if (Array.isArray(cached) && cached.length > 0) {
    const active = cached.filter((t) => t.enabled !== false);
    if (active.length > 0) return active;
  }
  return INITIAL_TESTIMONIALS;
}

export function getCachedFaqs() {
  const cached = getLocal(CMS_STORAGE_KEYS.faqs, null);
  if (Array.isArray(cached) && cached.length > 0) {
    const active = cached.filter((f) => f.enabled !== false);
    if (active.length > 0) return active;
  }
  return INITIAL_FAQS;
}

// =============================================================================
// REQUEST DEDUPLICATION, IN-MEMORY CACHE & RESILIENT FETCH ENGINE
// =============================================================================

const inFlightQueries = new Map();
const memoryCache = new Map();
const MEMORY_CACHE_TTL = 3 * 60 * 1000; // 3 minutes fresh in-memory
const failureCooldown = new Map(); // 15-second cooldown per query key if failed
const COOLDOWN_MS = 15000;

export function invalidateCmsCache(type) {
  if (type) {
    for (const key of memoryCache.keys()) {
      if (key.includes(type)) memoryCache.delete(key);
    }
    for (const key of inFlightQueries.keys()) {
      if (key.includes(type)) inFlightQueries.delete(key);
    }
    for (const key of failureCooldown.keys()) {
      if (key.includes(type)) failureCooldown.delete(key);
    }
  } else {
    memoryCache.clear();
    inFlightQueries.clear();
    failureCooldown.clear();
  }

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('cms-cache-invalidated', { detail: { type } }));
    } catch {}
  }
}

/**
 * Classify errors for accurate diagnosis & appropriate recovery
 */
function classifyError(err) {
  if (!err) return { type: 'unknown', isTimeout: false, isOffline: false, message: 'Unknown error' };
  const msg = (err.message || String(err)).toLowerCase();
  const code = (err.code || '').toLowerCase();
  const isTimeout = msg.includes('timeout') || msg.includes('timed out');
  const isOffline =
    code === 'unavailable' ||
    code === 'failed-precondition' ||
    msg.includes('offline') ||
    msg.includes('network') ||
    msg.includes('failed to fetch');
  const isPermission = code === 'permission-denied' || msg.includes('permission');
  return {
    type: isTimeout ? 'timeout' : isOffline ? 'offline' : isPermission ? 'permission' : 'error',
    isTimeout,
    isOffline,
    isPermission,
    message: err.message || String(err),
  };
}

/**
 * Updates localStorage when a query (or delayed background query) succeeds
 */
function updateLocalStorageFromCollection(colName, docs) {
  if (typeof window === 'undefined' || !Array.isArray(docs)) return;
  const colToKeyMap = {
    cms_hero: CMS_STORAGE_KEYS.hero,
    cms_pricing: CMS_STORAGE_KEYS.pricing,
    cms_testimonials: CMS_STORAGE_KEYS.testimonials,
    cms_faqs: CMS_STORAGE_KEYS.faqs,
  };
  const key = colToKeyMap[colName];
  if (!key) return;

  let merged = docs;
  if (colName === 'cms_hero') merged = mergeCloudWithDefaults(INITIAL_HERO_SLIDES, docs, { type: 'hero' });
  else if (colName === 'cms_pricing') merged = mergeCloudWithDefaults(INITIAL_PRICING_PLANS, docs, { type: 'pricing' });
  else if (colName === 'cms_testimonials') merged = mergeCloudWithDefaults(INITIAL_TESTIMONIALS, docs, { type: 'testimonials' });
  else if (colName === 'cms_faqs') merged = mergeCloudWithDefaults(INITIAL_FAQS, docs, { type: 'faqs' });

  setLocal(key, merged);
}

/**
 * Robust safeQueryDocs Engine:
 * 1. Configurable request timeout (options.timeoutMs, default 3000ms).
 * 2. Per-collection in-flight request deduplication via shared Promise.
 * 3. Prevents overlapping fallback requests.
 * 4. Distinct classification of timeouts, offline errors, and empty collections.
 * 5. Does NOT treat timeout as an empty collection (returns null so cache/defaults are kept).
 * 6. Updates memory cache and localStorage when a delayed Firestore request eventually succeeds.
 */
async function safeQueryDocs(colName, sortField, sortDir = 'asc', options = {}) {
  const timeoutMs = options.timeoutMs || 3000;
  const queryKey = `${colName}_${sortField || 'none'}_${sortDir}`;

  // 1. In-memory cache check (instant 0ms)
  if (!options.forceRefresh && memoryCache.has(queryKey)) {
    const cached = memoryCache.get(queryKey);
    if (Date.now() - cached.timestamp < MEMORY_CACHE_TTL) {
      return cached.data;
    }
  }

  // 2. Per-collection in-flight request deduplication
  if (inFlightQueries.has(queryKey)) {
    return inFlightQueries.get(queryKey);
  }

  // 3. Failure cooldown check (prevents spammed timeouts when offline)
  if (!options.forceRefresh && failureCooldown.has(queryKey)) {
    const failedAt = failureCooldown.get(queryKey);
    if (Date.now() - failedAt < COOLDOWN_MS) {
      return null;
    }
  }

  const queryPromise = (async () => {
    let primaryResolved = false;
    let directFirestorePromise = null;

    // ATTEMPT 1: Direct Firestore client query
    if (isFirebaseConfigured && db) {
      try {
        let q;
        try {
          q = sortField
            ? query(collection(db, colName), orderBy(sortField, sortDir))
            : collection(db, colName);
        } catch {
          q = collection(db, colName);
        }

        directFirestorePromise = getDocs(q);

        // Delayed background resolution handler:
        // If Firestore takes longer than timeoutMs but eventually succeeds,
        // it updates memoryCache and localStorage, and notifies listeners.
        directFirestorePromise
          .then((snap) => {
            if (snap) {
              const docs = snap.empty ? [] : snap.docs.map((d) => ({ id: d.id, ...d.data() }));
              memoryCache.set(queryKey, { data: docs, timestamp: Date.now() });
              failureCooldown.delete(queryKey);
              updateLocalStorageFromCollection(colName, docs);

              // If this finished after the timeout had already triggered fallback, notify UI
              if (!primaryResolved && typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('cms-cache-invalidated', {
                    detail: { type: colName.replace('cms_', ''), source: 'delayed-firestore-success' },
                  })
                );
              }
            }
          })
          .catch((err) => {
            const classified = classifyError(err);
            if (process.env.NODE_ENV !== 'production' && !classified.isTimeout) {
              console.debug(`[safeQueryDocs] Background Firestore notice for ${colName}:`, classified.message);
            }
          });

        // Race against configurable timeout
        const snap = await Promise.race([
          directFirestorePromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Firestore query for ${colName} timed out after ${timeoutMs}ms`)), timeoutMs)
          ),
        ]);

        primaryResolved = true;
        if (snap) {
          const docs = snap.empty ? [] : snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          memoryCache.set(queryKey, { data: docs, timestamp: Date.now() });
          failureCooldown.delete(queryKey);
          updateLocalStorageFromCollection(colName, docs);
          return docs; // Legitimate empty [] or populated docs
        }
      } catch (err) {
        primaryResolved = false;
        const classified = classifyError(err);
        if (process.env.NODE_ENV !== 'production') {
          console.debug(`[safeQueryDocs] ${colName} SDK read notice: ${classified.message}. Attempting non-overlapping fallback.`);
        }
      }
    }

    // ATTEMPT 2: Client-side sequential fallback to internal /api/cms endpoint (Node.js direct connection)
    // Runs ONLY if Attempt 1 did not already resolve
    if (typeof window !== 'undefined') {
      try {
        const typeMap = {
          cms_hero: 'hero',
          cms_pricing: 'pricing',
          cms_testimonials: 'testimonials',
          cms_faqs: 'faqs',
          activity_logs: 'activity',
        };
        const apiType = typeMap[colName];
        if (apiType) {
          const apiTimeoutMs = Math.min(timeoutMs, 2500);
          const res = await Promise.race([
            fetch(`/api/cms?type=${apiType}`),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`API ${apiType} timed out after ${apiTimeoutMs}ms`)), apiTimeoutMs)
            ),
          ]);

          if (res && res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
              memoryCache.set(queryKey, { data: json.data, timestamp: Date.now() });
              failureCooldown.delete(queryKey);
              updateLocalStorageFromCollection(colName, json.data);
              return json.data;
            }
          }
        }
      } catch (fallbackErr) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug(`[safeQueryDocs] API fallback notice for ${colName}:`, fallbackErr?.message || fallbackErr);
        }
      }
    }

    // Cooldown on failure
    failureCooldown.set(queryKey, Date.now());
    // Return null (NOT empty array []) so caller treats this as network failure, NOT as "no items in DB"
    return null;
  })().finally(() => {
    inFlightQueries.delete(queryKey);
  });

  inFlightQueries.set(queryKey, queryPromise);
  return queryPromise;
}

/**
 * Intelligent Catalog Merge:
 * Combines default baseline items with Firestore modifications:
 * 1. Default items form the initial catalog.
 * 2. Documents from Firestore override defaults with updated fields.
 * 3. Deleted items (_deleted === true) are excluded.
 * 4. Custom items created by admin are appended.
 * 5. Returns sorted list by order.
 */
function mergeCloudWithDefaults(defaults, cloudDocs, options = {}) {
  const map = new Map();

  // Populate default baseline items with stringified IDs
  (defaults || []).forEach((item) => {
    if (!item) return;
    const key = String(item.id !== undefined && item.id !== null ? item.id : '').trim();
    if (key) {
      map.set(key, { ...item, id: key });
    }
  });

  if (Array.isArray(cloudDocs)) {
    cloudDocs.forEach((cloudItem) => {
      if (!cloudItem || cloudItem.id === undefined || cloudItem.id === null) return;

      const rawId = String(cloudItem.id).trim();
      // Handle legacy aliases (e.g. plan_business_brand -> business-brand)
      const targetId = rawId === 'plan_business_brand' ? 'business-brand' : rawId;

      if (cloudItem._deleted === true) {
        map.delete(targetId);
        map.delete(rawId);
        return;
      }

      const existing = map.get(targetId) || map.get(rawId) || {};

      // Testimonial specific: Keep quote and review strictly synchronized
      const text =
        cloudItem.review ||
        cloudItem.quote ||
        existing.review ||
        existing.quote ||
        '';

      // FAQ specific: Keep question and answer synchronized
      const question =
        cloudItem.question ||
        cloudItem.q ||
        existing.question ||
        existing.q ||
        '';
      const answer =
        cloudItem.answer ||
        cloudItem.a ||
        existing.answer ||
        existing.a ||
        '';

      const merged = {
        ...existing,
        ...cloudItem,
        id: targetId,
      };

      if (options.type === 'testimonials') {
        merged.quote = text;
        merged.review = text;
      } else if (options.type === 'faqs') {
        merged.question = question;
        merged.answer = answer;
        merged.q = question;
        merged.a = answer;
      } else if (options.type === 'hero') {
        merged.poster =
          merged.poster ||
          merged.posterUrl ||
          merged.imageUrl ||
          merged.image ||
          merged.thumbnail ||
          '/thumbnails/hero-video-1.jpg';
        merged.videoUrl =
          merged.videoUrl ||
          merged.videoSrc ||
          existing.videoUrl ||
          existing.videoSrc ||
          '';
        merged.videoSrc = merged.videoUrl;
      }

      map.set(targetId, merged);
    });
  }

  const result = Array.from(map.values());
  result.sort((a, b) => {
    const orderDiff = (Number(a.order) || 0) - (Number(b.order) || 0);
    if (orderDiff !== 0) return orderDiff;
    return String(a.id || '').localeCompare(String(b.id || ''));
  });
  return result;
}

// =============================================================================
// 3. ACTIVITY LOGGING
// =============================================================================
export async function logAdminActivity(action, details, adminEmail = 'admin@reelxpress.com') {
  const entry = {
    id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    action,
    details,
    adminEmail,
    timestamp: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, 'activity_logs'), entry);
    } catch {}
  }

  const logs = getLocal(CMS_STORAGE_KEYS.activity, []);
  setLocal(CMS_STORAGE_KEYS.activity, [entry, ...logs].slice(0, 50));
  return entry;
}

export async function getActivityLogs() {
  const cloud = await safeQueryDocs('activity_logs', 'timestamp', 'desc');
  if (cloud && cloud.length > 0) {
    cloud.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    return cloud;
  }
  return getLocal(CMS_STORAGE_KEYS.activity, [
    {
      id: 'act_init',
      action: 'System Initialized',
      details: 'reelXpress Admin Panel & Firebase Suite connected successfully.',
      adminEmail: 'admin@reelxpress.com',
      timestamp: new Date().toISOString(),
    },
  ]);
}

// =============================================================================
// 4. TESTIMONIALS & REVIEWS CMS
// =============================================================================

export async function getTestimonials(options = {}) {
  // Instant check from memory cache if fresh
  const memoryKey = 'cms_testimonials_order_asc';
  if (!options.forceRefresh && memoryCache.has(memoryKey)) {
    const mem = memoryCache.get(memoryKey);
    if (Date.now() - mem.timestamp < MEMORY_CACHE_TTL) {
      return mergeCloudWithDefaults(INITIAL_TESTIMONIALS, mem.data, { type: 'testimonials' });
    }
  }

  const cached = !options.forceRefresh ? getCachedTestimonials() : null;
  try {
    const cloud = await safeQueryDocs('cms_testimonials', 'order', 'asc', options);
    if (cloud) {
      const merged = mergeCloudWithDefaults(INITIAL_TESTIMONIALS, cloud, {
        type: 'testimonials',
      });
      setLocal(CMS_STORAGE_KEYS.testimonials, merged);
      return merged;
    }
  } catch {}
  return cached && cached.length > 0 ? cached : INITIAL_TESTIMONIALS;
}

export async function saveTestimonial(testimonial, adminEmail) {
  const isNew = !testimonial.id || testimonial.id.startsWith('new_');
  const tId = isNew ? 'testi_' + Date.now() : testimonial.id;
  const reviewText = (testimonial.review || testimonial.quote || '').trim();

  const payload = {
    ...testimonial,
    id: tId,
    review: reviewText,
    quote: reviewText,
    rating: Number(testimonial.rating) || 5,
    avatar: testimonial.avatar || '/brand/icon-gold.png',
    enabled: testimonial.enabled !== false,
    order: Number(testimonial.order) || 1,
    updatedAt: new Date().toISOString(),
    updatedBy: adminEmail || 'admin@reelxpress.com',
  };

  // Single Defined Persistence Strategy:
  // 1. Direct Firestore write (with fast 2500ms race timeout)
  let persisted = false;
  if (isFirebaseConfigured && db) {
    try {
      await Promise.race([
        setDoc(doc(db, 'cms_testimonials', tId), payload, { merge: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore write timeout')), 2500)),
      ]);
      persisted = true;
    } catch (err) {
      console.warn('[saveTestimonial] Direct Firestore write notice:', err?.message || err);
    }
  }

  // 2. Server API sync: ALWAYS sync to server store to guarantee cross-client persistence
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'testimonials', item: payload, adminEmail }),
      });
      if (res.ok) persisted = true;
    } catch (apiErr) {
      console.warn('[saveTestimonial] Server API sync notice:', apiErr?.message || apiErr);
    }
  }

  // Update in-memory cache and localStorage immediately
  const currentList = getCachedTestimonials();
  const updated = isNew
    ? [...currentList, payload]
    : currentList.map((item) => (item.id === tId ? payload : item));
  setLocal(CMS_STORAGE_KEYS.testimonials, updated);

  invalidateCmsCache('testimonials');

  await logAdminActivity(
    isNew ? 'Added Testimonial' : 'Updated Testimonial',
    `Author: "${payload.name}" (${payload.role})`,
    adminEmail
  );

  return payload;
}

export async function deleteTestimonial(testimonialId, adminEmail) {
  // Single Defined Persistence Strategy:
  let persisted = false;
  if (isFirebaseConfigured && db) {
    try {
      await Promise.race([
        setDoc(
          doc(db, 'cms_testimonials', testimonialId),
          { id: testimonialId, _deleted: true, updatedAt: new Date().toISOString() },
          { merge: true }
        ),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 2500)),
      ]);
      persisted = true;
    } catch {
      try {
        await Promise.race([
          deleteDoc(doc(db, 'cms_testimonials', testimonialId)),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 2500)),
        ]);
        persisted = true;
      } catch (err) {
        console.warn('[deleteTestimonial] Direct Firestore delete notice:', err?.message || err);
      }
    }
  }

  // Always sync deletion to server store
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(
        `/api/cms?type=testimonials&id=${encodeURIComponent(testimonialId)}&adminEmail=${encodeURIComponent(adminEmail || '')}`,
        { method: 'DELETE' }
      );
      if (res.ok) persisted = true;
    } catch (apiErr) {
      console.warn('[deleteTestimonial] Server API delete notice:', apiErr?.message || apiErr);
    }
  }

  // Update in-memory cache and localStorage immediately
  const currentList = getCachedTestimonials();
  const updated = currentList.filter((t) => t.id !== testimonialId);
  setLocal(CMS_STORAGE_KEYS.testimonials, updated);

  invalidateCmsCache('testimonials');

  await logAdminActivity('Deleted Testimonial', `Testimonial ID: ${testimonialId}`, adminEmail);
  return { success: true, id: testimonialId };
}

// =============================================================================
// 5. PRICING PLANS CMS
// =============================================================================

export async function getPricingPlans(options = {}) {
  // Instant check from memory cache if fresh
  const memoryKey = 'cms_pricing_order_asc';
  if (!options.forceRefresh && memoryCache.has(memoryKey)) {
    const mem = memoryCache.get(memoryKey);
    if (Date.now() - mem.timestamp < MEMORY_CACHE_TTL) {
      return mergeCloudWithDefaults(INITIAL_PRICING_PLANS, mem.data, { type: 'pricing' });
    }
  }

  const cached = !options.forceRefresh ? getCachedPricingPlans() : null;
  try {
    const cloud = await safeQueryDocs('cms_pricing', 'order', 'asc', options);
    if (cloud) {
      const merged = mergeCloudWithDefaults(INITIAL_PRICING_PLANS, cloud, {
        type: 'pricing',
      });
      setLocal(CMS_STORAGE_KEYS.pricing, merged);
      return merged;
    }
  } catch {}
  return cached && cached.length > 0 ? cached : INITIAL_PRICING_PLANS;
}

export async function savePricingPlan(plan, adminEmail) {
  const isNew = !plan.id || plan.id.startsWith('new_');
  const planId = isNew ? 'plan_' + Date.now() : plan.id;
  const payload = {
    ...plan,
    id: planId,
    enabled: plan.enabled !== false,
    order: Number(plan.order) || 1,
    updatedAt: new Date().toISOString(),
    updatedBy: adminEmail || 'admin@reelxpress.com',
  };

  // Single Defined Persistence Strategy:
  let persisted = false;
  if (isFirebaseConfigured && db) {
    try {
      await Promise.race([
        setDoc(doc(db, 'cms_pricing', planId), payload, { merge: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 2500)),
      ]);
      persisted = true;
    } catch (err) {
      console.warn('[savePricingPlan] Direct Firestore write notice:', err?.message || err);
    }
  }

  // Always sync to server CMS store to guarantee persistence
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'pricing', item: payload, adminEmail }),
      });
      if (res.ok) persisted = true;
    } catch (apiErr) {
      console.warn('[savePricingPlan] Server API sync notice:', apiErr?.message || apiErr);
    }
  }

  // Update in-memory cache and localStorage immediately
  const currentList = getCachedPricingPlans();
  const updated = isNew
    ? [...currentList, payload]
    : currentList.map((p) => (p.id === planId ? payload : p));
  setLocal(CMS_STORAGE_KEYS.pricing, updated);

  invalidateCmsCache('pricing');

  await logAdminActivity(
    isNew ? 'Added Pricing Plan' : 'Updated Pricing Plan',
    `Plan: "${payload.name}" (${payload.price})`,
    adminEmail
  );
  return payload;
}

export async function deletePricingPlan(planId, adminEmail) {
  // Single Defined Persistence Strategy:
  let persisted = false;
  if (isFirebaseConfigured && db) {
    try {
      await Promise.race([
        setDoc(
          doc(db, 'cms_pricing', planId),
          { id: planId, _deleted: true, updatedAt: new Date().toISOString() },
          { merge: true }
        ),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 2500)),
      ]);
      persisted = true;
    } catch {
      try {
        await Promise.race([
          deleteDoc(doc(db, 'cms_pricing', planId)),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 2500)),
        ]);
        persisted = true;
      } catch (err) {
        console.warn('[deletePricingPlan] Direct Firestore delete notice:', err?.message || err);
      }
    }
  }

  // Always sync deletion to server store
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(
        `/api/cms?type=pricing&id=${encodeURIComponent(planId)}&adminEmail=${encodeURIComponent(adminEmail || '')}`,
        { method: 'DELETE' }
      );
      if (res.ok) persisted = true;
    } catch (apiErr) {
      console.warn('[deletePricingPlan] Server API delete notice:', apiErr?.message || apiErr);
    }
  }

  // Update in-memory cache and localStorage immediately
  const currentList = getCachedPricingPlans();
  const updated = currentList.filter((p) => p.id !== planId);
  setLocal(CMS_STORAGE_KEYS.pricing, updated);

  invalidateCmsCache('pricing');

  await logAdminActivity('Deleted Pricing Plan', `Plan ID: ${planId}`, adminEmail);
  return { success: true, id: planId };
}

// =============================================================================
// 6. FAQS CMS
// =============================================================================

export async function getFaqs(options = {}) {
  // Instant check from memory cache if fresh
  const memoryKey = 'cms_faqs_order_asc';
  if (!options.forceRefresh && memoryCache.has(memoryKey)) {
    const mem = memoryCache.get(memoryKey);
    if (Date.now() - mem.timestamp < MEMORY_CACHE_TTL) {
      return mergeCloudWithDefaults(INITIAL_FAQS, mem.data, { type: 'faqs' });
    }
  }

  const cached = !options.forceRefresh ? getCachedFaqs() : null;
  try {
    const cloud = await safeQueryDocs('cms_faqs', 'order', 'asc', options);
    if (cloud) {
      const merged = mergeCloudWithDefaults(INITIAL_FAQS, cloud, {
        type: 'faqs',
      });
      setLocal(CMS_STORAGE_KEYS.faqs, merged);
      return merged;
    }
  } catch {}
  return cached && cached.length > 0 ? cached : INITIAL_FAQS;
}

export async function saveFaq(faq, adminEmail) {
  const isNew = !faq.id || faq.id.startsWith('new_');
  const faqId = isNew ? 'faq_' + Date.now() : faq.id;
  const question = (faq.question || faq.q || '').trim();
  const answer = (faq.answer || faq.a || '').trim();

  const payload = {
    ...faq,
    id: faqId,
    question,
    answer,
    q: question,
    a: answer,
    category: faq.category || 'General',
    enabled: faq.enabled !== false,
    order: Number(faq.order) || 1,
    updatedAt: new Date().toISOString(),
    updatedBy: adminEmail || 'admin@reelxpress.com',
  };

  // Single Defined Persistence Strategy:
  let persisted = false;
  if (isFirebaseConfigured && db) {
    try {
      await Promise.race([
        setDoc(doc(db, 'cms_faqs', faqId), payload, { merge: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 2500)),
      ]);
      persisted = true;
    } catch (err) {
      console.warn('[saveFaq] Direct Firestore write notice:', err?.message || err);
    }
  }

  // Always sync to server store
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'faqs', item: payload, adminEmail }),
      });
      if (res.ok) persisted = true;
    } catch (apiErr) {
      console.warn('[saveFaq] Server API sync notice:', apiErr?.message || apiErr);
    }
  }

  // Update in-memory cache and localStorage immediately
  const currentList = getCachedFaqs();
  const updated = isNew
    ? [...currentList, payload]
    : currentList.map((item) => (item.id === faqId ? payload : item));
  setLocal(CMS_STORAGE_KEYS.faqs, updated);

  invalidateCmsCache('faqs');

  await logAdminActivity(
    isNew ? 'Added FAQ' : 'Updated FAQ',
    `Question: "${payload.question.substring(0, 40)}..."`,
    adminEmail
  );
  return payload;
}

export async function deleteFaq(faqId, adminEmail) {
  // Single Defined Persistence Strategy:
  let persisted = false;
  if (isFirebaseConfigured && db) {
    try {
      await Promise.race([
        setDoc(
          doc(db, 'cms_faqs', faqId),
          { id: faqId, _deleted: true, updatedAt: new Date().toISOString() },
          { merge: true }
        ),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 2500)),
      ]);
      persisted = true;
    } catch {
      try {
        await Promise.race([
          deleteDoc(doc(db, 'cms_faqs', faqId)),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 2500)),
        ]);
        persisted = true;
      } catch (err) {
        console.warn('[deleteFaq] Direct Firestore delete notice:', err?.message || err);
      }
    }
  }

  // Always sync deletion to server store
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(
        `/api/cms?type=faqs&id=${encodeURIComponent(faqId)}&adminEmail=${encodeURIComponent(adminEmail || '')}`,
        { method: 'DELETE' }
      );
      if (res.ok) persisted = true;
    } catch (apiErr) {
      console.warn('[deleteFaq] Server API fallback notice:', apiErr?.message || apiErr);
    }
  }

  // Update in-memory cache and localStorage immediately
  const currentList = getCachedFaqs();
  const updated = currentList.filter((f) => f.id !== faqId);
  setLocal(CMS_STORAGE_KEYS.faqs, updated);

  invalidateCmsCache('faqs');

  await logAdminActivity('Deleted FAQ', `FAQ ID: ${faqId}`, adminEmail);
  return { success: true, id: faqId };
}

// =============================================================================
// 7. HERO CAROUSEL / REELS CMS
// =============================================================================

export async function getHeroSlides(options = {}) {
  // Instant check from memory cache if fresh
  const memoryKey = 'cms_hero_order_asc';
  if (!options.forceRefresh && memoryCache.has(memoryKey)) {
    const mem = memoryCache.get(memoryKey);
    if (Date.now() - mem.timestamp < MEMORY_CACHE_TTL) {
      return mergeCloudWithDefaults(INITIAL_HERO_SLIDES, mem.data, { type: 'hero' });
    }
  }

  const cached = !options.forceRefresh ? getCachedHeroSlides() : null;
  try {
    const cloud = await safeQueryDocs('cms_hero', 'order', 'asc', options);
    if (cloud) {
      const merged = mergeCloudWithDefaults(INITIAL_HERO_SLIDES, cloud, {
        type: 'hero',
      });
      setLocal(CMS_STORAGE_KEYS.hero, merged);
      return merged;
    }
  } catch {}
  return cached && cached.length > 0 ? cached : INITIAL_HERO_SLIDES;
}

export async function saveHeroSlide(slide, adminEmail) {
  const isNew = !slide.id || slide.id.startsWith('new_');
  const slideId = isNew ? 'slide_' + Date.now() : slide.id;
  const payload = {
    ...slide,
    id: slideId,
    enabled: slide.enabled !== false,
    order: Number(slide.order) || 1,
    updatedAt: new Date().toISOString(),
    updatedBy: adminEmail || 'admin@reelxpress.com',
  };

  // Single Defined Persistence Strategy:
  let persisted = false;
  if (isFirebaseConfigured && db) {
    try {
      await Promise.race([
        setDoc(doc(db, 'cms_hero', slideId), payload, { merge: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 2500)),
      ]);
      persisted = true;
    } catch (err) {
      console.warn('[saveHeroSlide] Direct Firestore write notice:', err?.message || err);
    }
  }

  // Always sync to server store
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'hero', item: payload, adminEmail }),
      });
      if (res.ok) persisted = true;
    } catch (apiErr) {
      console.warn('[saveHeroSlide] Server API sync notice:', apiErr?.message || apiErr);
    }
  }

  // Update in-memory cache and localStorage immediately
  const currentList = getCachedHeroSlides();
  const updated = isNew
    ? [...currentList, payload]
    : currentList.map((s) => (s.id === slideId ? payload : s));
  setLocal(CMS_STORAGE_KEYS.hero, updated);

  invalidateCmsCache('hero');

  await logAdminActivity(
    isNew ? 'Added Hero Slide' : 'Updated Hero Slide',
    `Slide: "${payload.title}" (${payload.category})`,
    adminEmail
  );
  return payload;
}

export async function deleteHeroSlide(slideId, adminEmail) {
  // Single Defined Persistence Strategy:
  let persisted = false;
  if (isFirebaseConfigured && db) {
    try {
      await Promise.race([
        setDoc(
          doc(db, 'cms_hero', slideId),
          { id: slideId, _deleted: true, updatedAt: new Date().toISOString() },
          { merge: true }
        ),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 2500)),
      ]);
      persisted = true;
    } catch {
      try {
        await Promise.race([
          deleteDoc(doc(db, 'cms_hero', slideId)),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 2500)),
        ]);
        persisted = true;
      } catch (err) {
        console.warn('[deleteHeroSlide] Direct Firestore delete notice:', err?.message || err);
      }
    }
  }

  // Always sync deletion to server store
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(
        `/api/cms?type=hero&id=${encodeURIComponent(slideId)}&adminEmail=${encodeURIComponent(adminEmail || '')}`,
        { method: 'DELETE' }
      );
      if (res.ok) persisted = true;
    } catch (apiErr) {
      console.warn('[deleteHeroSlide] Server API fallback notice:', apiErr?.message || apiErr);
    }
  }

  // Update in-memory cache and localStorage immediately
  const currentList = getCachedHeroSlides();
  const updated = currentList.filter((s) => s.id !== slideId);
  setLocal(CMS_STORAGE_KEYS.hero, updated);

  invalidateCmsCache('hero');

  await logAdminActivity('Deleted Hero Slide', `Slide ID: ${slideId}`, adminEmail);
  return { success: true, id: slideId };
}

// =============================================================================
// 8. IMAGE UPLOAD HELPER (Client-Side Compression + Firebase Storage with base64 Data URL fallback)
// =============================================================================

/**
 * Compresses an image file in-browser to max 1080x1920 (vertical 9:16 portrait)
 * to ensure lightning-fast uploads and prevent Firestore 1MB document limit breaches.
 */
async function compressImageFile(file, maxWidth = 1080, maxHeight = 1920, quality = 0.85) {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    !file ||
    !file.type ||
    !file.type.startsWith('image/')
  ) {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && (blob.size < file.size || file.size > 800000)) {
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
      img.src = objectUrl;
    } catch {
      resolve(file);
    }
  });
}

export async function uploadImageFile(file, folder = 'uploads') {
  if (!file) throw new Error('No file provided for upload.');

  // Pre-compress image for ultra-fast upload & safe storage
  const targetFile = await compressImageFile(file);

  // Direct Firebase Storage upload if accessible
  if (isFirebaseConfigured && storage) {
    try {
      const sanitizedName = (targetFile.name || file.name || 'image.jpg').replace(/[^a-zA-Z0-9.]/g, '_');
      const storageRef = ref(storage, `${folder}/${Date.now()}_${sanitizedName}`);
      const snapshot = await Promise.race([
        uploadBytes(storageRef, targetFile),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firebase Storage Upload timed out after 5000ms')), 5000)
        ),
      ]);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.warn('[uploadImageFile] Firebase Storage upload notice, falling back:', err?.message || err);
    }
  }

  // Server API fallback (persists to /public/uploads/images)
  if (typeof window !== 'undefined') {
    try {
      const formData = new FormData();
      formData.append('file', targetFile);
      formData.append('folder', 'images');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch (apiErr) {
      console.warn('[uploadImageFile] Server upload fallback notice:', apiErr?.message || apiErr);
    }
  }

  // Fast reliable client fallback: convert compressed file to base64 Data URL so images preview and persist immediately
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(targetFile);
  });
}

/**
 * Upload Video File directly to Firebase Storage bucket or Server API (/public/uploads/videos)
 */
export async function uploadVideoFile(file, folder = 'hero') {
  if (!file) throw new Error('No video file provided for upload.');

  // 1. Try Firebase Storage if configured
  if (isFirebaseConfigured && storage) {
    try {
      const sanitizedName = (file.name || 'video.mp4').replace(/[^a-zA-Z0-9.]/g, '_');
      const storageRef = ref(storage, `${folder}/${Date.now()}_${sanitizedName}`);
      const snapshot = await Promise.race([
        uploadBytes(storageRef, file),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firebase Storage Video upload timed out after 8000ms.')), 8000)
        ),
      ]);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.warn('[uploadVideoFile] Firebase Storage upload notice, falling back to server API:', err?.message || err);
    }
  }

  // 2. Direct Server API upload (/public/uploads/videos)
  if (typeof window !== 'undefined') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'videos');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status ${res.status}`);
      }
      const data = await res.json();
      if (data.url) {
        return data.url;
      }
      throw new Error(data.error || 'Server did not return a valid video URL.');
    } catch (serverErr) {
      console.error('[uploadVideoFile] Server upload error:', serverErr);
      throw new Error(`Video upload failed: ${serverErr.message || 'Server error'}`);
    }
  }

  throw new Error('Video upload is not available in current environment.');
}
