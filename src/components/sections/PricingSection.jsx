'use client';

import { useState, useEffect, useRef } from 'react';
import { getPricingPlans, getCachedPricingPlans } from '@/lib/cmsServices';

// Pricing Tabs
const TABS = [
  { id: 'instant', label: 'Instant packages' },
  { id: 'business', label: 'Business packages' },
  { id: 'wedding', label: 'Wedding & Luxe' },
];

// 1. INSTANT PACKAGES (Fast on-site delivery in minutes)
const INSTANT_PACKAGES = [
  {
    id: 'instant-hourly',
    tag: 'SINGLE EVENT',
    name: 'Hourly Plan',
    description: 'Perfect for anyone who wants a single, fast, high-quality reel delivered in minutes.',
    price: '₹2,200',
    priceSuffix: '+ 18% GST',
    badge: 'BEST SELLER',
    isPopular: true,
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
    tag: 'AUTOMOTIVE',
    name: 'Vehicle Shoot',
    description: 'Specialized dynamic reels for car & superbike deliveries, unboxings, and rallies.',
    price: '₹3,999',
    priceSuffix: 'onwards + 18% GST',
    isPopular: false,
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
    tag: 'FOUR HOURS',
    name: 'Half Day',
    description: 'Ideal for parties, pop-up events, store launches, or multi-content creator shoots.',
    price: '₹8,500',
    priceSuffix: '+ 18% GST',
    isPopular: false,
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
    tag: 'EIGHT HOURS',
    name: 'Full Day',
    description: 'Complete day-long coverage for exhibitions, major festivals, and marathon events.',
    price: '₹15,000',
    priceSuffix: '+ 18% GST',
    isPopular: false,
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
];

// 2. BUSINESS PACKAGES
const BUSINESS_PACKAGES = [
  {
    id: 'business-brand',
    tag: 'COMPREHENSIVE',
    name: 'Brand shoot',
    description: 'Professional coverage tailored to campaign, launch, and showcase moments, scoped around your calendar and deliverables.',
    price: 'Customised',
    priceSuffix: '+ 18% GST',
    badge: 'MOST FLEXIBLE',
    isPopular: true,
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
    btnVariant: 'primary',
  },
  {
    id: 'business-product',
    tag: 'PER REEL',
    name: 'Product Shoot',
    description: 'High-converting product and catalog reels for e-commerce, D2C, and brand launches, shot and edited to make your product the hero.',
    price: '₹7,000',
    priceSuffix: 'onwards / per reel + 18% GST',
    isPopular: false,
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
    btnVariant: 'white',
  },
];

// 3. WEDDING PACKAGES
const WEDDING_PACKAGES = [
  {
    id: 'wedding-basic',
    tag: 'SINGLE EVENT',
    name: 'Basic',
    description: "Perfect for couples looking for a stunning, professionally crafted wedding shoot that won't break the bank.",
    price: '₹14,999',
    priceSuffix: '+ 18% GST',
    isPopular: false,
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
    tag: 'THREE EVENTS',
    name: 'Silver',
    description: 'Perfect for those who want comprehensive coverage with an extra touch of elegance.',
    price: '₹44,999',
    priceSuffix: '+ 18% GST',
    isPopular: false,
    shootType: 'Wedding Silver (₹44,999 - Three Events, 10 Reels)',
    inclusions: [
      'Covers up to three events',
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
    tag: 'FOUR EVENTS',
    name: 'Gold',
    description: 'Perfect for couples who want an exclusive, comprehensive experience across four events.',
    price: '₹59,999',
    priceSuffix: '+ 18% GST',
    badge: 'MOST POPULAR',
    isPopular: true,
    shootType: 'Wedding Gold (₹59,999 - Four Events, 15 Reels)',
    inclusions: [
      'Covers up to four events',
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
    tag: 'COMPLETE WEDDING',
    name: 'Platinum',
    description: 'For couples who want it all: every moment captured with unmatched attention to detail.',
    price: '₹99,999',
    priceSuffix: '+ 18% GST',
    isPopular: false,
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

// SKELETON LOADER FOR PRICING CARDS
function PricingCardSkeleton({ count = 4, colsClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' }) {
  return (
    <div className={`grid ${colsClass} gap-3.5 sm:gap-4 lg:gap-5 mb-14`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`pricing-skel-${idx}`}
          className="relative rounded-[24px] sm:rounded-[28px] bg-[#140f13] p-5 sm:p-6 flex flex-col justify-between border border-white/5 min-h-[530px] ambient-skeleton shadow-lg"
        >
          <div>
            <div className="w-20 h-3.5 rounded-full bg-white/10 mb-2.5 ambient-pulse" />
            <div className="w-32 h-6 rounded-lg bg-white/10 mb-2.5 ambient-pulse" />
            <div className="w-full h-3 rounded bg-white/5 mb-1.5 ambient-pulse" />
            <div className="w-4/5 h-3 rounded bg-white/5 mb-5 ambient-pulse" />
            <div className="flex items-baseline gap-2 pb-5 border-b border-white/5 mb-5">
              <div className="w-20 h-7 rounded-lg bg-white/15 ambient-pulse" />
              <div className="w-12 h-3 rounded bg-white/5 ambient-pulse" />
            </div>
            <div className="w-20 h-3 rounded bg-white/10 mb-3.5 ambient-pulse" />
            <div className="space-y-2.5 mb-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={`pricing-skel-feature-${idx}-${i}`} className="flex items-start gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-white/10 shrink-0 ambient-pulse" />
                  <div className="h-3 rounded bg-white/5 flex-1 ambient-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="w-full h-10 rounded-full bg-white/10 ambient-pulse mt-5" />
        </div>
      ))}
    </div>
  );
}

export default function PricingSection() {
  const [activeTab, setActiveTab] = useState('instant');
  const [instantPlans, setInstantPlans] = useState(INSTANT_PACKAGES);
  const [businessPlans, setBusinessPlans] = useState(BUSINESS_PACKAGES);
  const [weddingPlans, setWeddingPlans] = useState(WEDDING_PACKAGES);
  const [isLoading, setIsLoading] = useState(true);
  const tabRefs = useRef([]);

  useEffect(() => {
    // 1. Instant check from cache for 0ms initial render
    const cached = getCachedPricingPlans();
    if (cached && cached.length > 0) {
      const activePlans = cached.filter((p) => p.enabled !== false);
      const instant = activePlans.filter((p) => p.category === 'instant');
      const business = activePlans.filter((p) => p.category === 'business');
      const wedding = activePlans.filter((p) => p.category === 'wedding');
      if (instant.length > 0) setInstantPlans(instant);
      if (business.length > 0) setBusinessPlans(business);
      if (wedding.length > 0) setWeddingPlans(wedding);
      setIsLoading(false);
    }

    // 2. Fetch fresh CMS pricing plans with background sync
    getPricingPlans()
      .then((plans) => {
        if (plans && plans.length > 0) {
          const activePlans = plans.filter((p) => p.enabled !== false);
          const instant = activePlans.filter((p) => p.category === 'instant');
          const business = activePlans.filter((p) => p.category === 'business');
          const wedding = activePlans.filter((p) => p.category === 'wedding');
          if (instant.length > 0) setInstantPlans(instant);
          if (business.length > 0) setBusinessPlans(business);
          if (wedding.length > 0) setWeddingPlans(wedding);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    // 3. React to live Admin updates
    const handleCmsUpdate = (e) => {
      if (!e.detail?.type || e.detail.type === 'pricing') {
        getPricingPlans({ forceRefresh: true }).then((plans) => {
          if (plans && plans.length > 0) {
            const activePlans = plans.filter((p) => p.enabled !== false);
            const instant = activePlans.filter((p) => p.category === 'instant');
            const business = activePlans.filter((p) => p.category === 'business');
            const wedding = activePlans.filter((p) => p.category === 'wedding');
            if (instant.length > 0) setInstantPlans(instant);
            if (business.length > 0) setBusinessPlans(business);
            if (wedding.length > 0) setWeddingPlans(wedding);
          }
        });
      }
    };
    window.addEventListener('cms-cache-invalidated', handleCmsUpdate);
    return () => window.removeEventListener('cms-cache-invalidated', handleCmsUpdate);
  }, []);

  // Keyboard navigation for WAI-ARIA tabs pattern
  const handleTabKeyDown = (e, index) => {
    let newIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      newIndex = (index + 1) % TABS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      newIndex = (index - 1 + TABS.length) % TABS.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = TABS.length - 1;
    }

    if (newIndex !== index) {
      setActiveTab(TABS[newIndex].id);
      tabRefs.current[newIndex]?.focus();
    }
  };

  const handleBooking = (e, shootType) => {
    e.preventDefault();
    if (shootType) {
      window.dispatchEvent(
        new CustomEvent('select-shoot-type', { detail: { type: shootType } })
      );
    }
    const bookingEl =
      document.getElementById('booking-form') ||
      document.getElementById('booking');

    if (bookingEl) {
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.scrollTo(bookingEl, { offset: -60, duration: 1.2 });
      } else {
        bookingEl.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = '#booking';
    }
  };

  return (
    <section className="relative py-16 md:py-24 px-4 sm:px-6 md:px-margin max-w-[1440px] mx-auto scroll-mt-20 md:scroll-mt-28" id="pricing">
      {/* Static Atmospheric Radial Ambient in Brand Orange */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[340px] bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(255,109,41,0.16),transparent_70%)] pointer-events-none -z-10" />

      {/* 1. Pill Switcher Bar (Fully Keyboard Accessible) */}
      <div className="flex justify-center mb-10 sm:mb-14 px-2 overflow-x-auto no-scrollbar">
        <div
          role="tablist"
          aria-label="Pricing Categories"
          className="inline-flex items-center p-1 sm:p-1.5 rounded-full bg-[#181216] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] gap-0.5 sm:gap-1 max-w-full select-none shrink-0"
        >
          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => (tabRefs.current[idx] = el)}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                className={`px-2.5 xs:px-3 sm:px-6 md:px-7 py-1.5 sm:py-2.5 md:py-3 rounded-full text-[11px] sm:text-sm md:text-[15px] font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6d29] ${
                  isActive
                    ? 'bg-[#ff6d29] text-white shadow-[0_4px_16px_rgba(255,109,41,0.45)]'
                    : 'text-[#9e969d] hover:text-white bg-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Dynamic Section Headers based on Active Tab */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        {activeTab === 'wedding' && (
          <>
            <span className="text-[#ff6d29] text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] block mb-2.5">
              WEDDING REEL PACKAGES
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Capture Your Wedding <span className="font-serif italic font-normal text-white/70">Memories</span>
            </h2>
            <p className="text-sm sm:text-base text-[#a8a1a8] mt-3 max-w-xl mx-auto leading-relaxed">
              Professional wedding reel services to preserve your special moments forever.
            </p>
          </>
        )}

        {activeTab === 'business' && (
          <>
            <span className="text-[#ff6d29] text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] block mb-2.5">
              FOR BUSINESS AND BRANDS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Cinematic coverage, <span className="font-serif italic font-normal text-white/70">built for brands.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#a8a1a8] mt-3 max-w-xl mx-auto leading-relaxed">
              Professional coverage for your business events, delivering polished content that aligns with your brand identity and marketing goals.
            </p>
          </>
        )}

        {activeTab === 'instant' && (
          <>
            <span className="text-[#ff6d29] text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] block mb-2.5">
              INSTANT CONTENT PACKAGES
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Minutes to Delivery. <span className="font-serif italic font-normal text-white/70">Zero Hassle.</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-[#a8a1a8] mt-2.5 max-w-2xl mx-auto leading-relaxed">
              High-speed vertical video packages shot on flagship iPhone gear with on-spot professional editing. Your finished, color-graded reels are delivered directly to your device via AirDrop or instant cloud link within 15–30 minutes before your shoot concludes.
            </p>
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] sm:text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6d29]" />
                15–30 Min On-Site Turnaround
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6d29]" />
                Shot on Latest iPhone Pro
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6d29]" />
                AirDrop &amp; Cloud Delivery
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6d29]" />
                Free Revisions &amp; Raw Clips
              </span>
            </div>
          </>
        )}
      </div>

      {/* 3. Cards Display by Category Panel */}
      {isLoading ? (
        <PricingCardSkeleton
          count={activeTab === 'business' ? 2 : 4}
          colsClass={
            activeTab === 'business'
              ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }
        />
      ) : (
        <>
          {/* ---------------- INSTANT PACKAGES (4 Cards) ---------------- */}
          {activeTab === 'instant' && (
            <div
              role="tabpanel"
              id="tabpanel-instant"
              aria-labelledby="tab-instant"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 mb-14 fade-in-content"
            >
          {instantPlans.map((pkg, idx) => (
            <div
              key={`instant-plan-${pkg.id || idx}-${idx}`}
              className={`relative rounded-[24px] sm:rounded-[28px] bg-[#140f13] p-5 sm:p-6 min-h-[530px] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                pkg.isPopular
                  ? 'border border-[#ff6d29]/70 shadow-[0_12px_40px_rgba(255,109,41,0.22)]'
                  : 'border border-white/10 hover:border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
              }`}
            >
              {pkg.badge && (
                <div className="absolute -top-3.5 right-6 sm:right-7 px-3.5 py-1 rounded-full bg-[#ff6d29] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-[0_4px_12px_rgba(255,109,41,0.45)]">
                  {pkg.badge}
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff6d29] mb-1.5 block">
                  {pkg.tag}
                </span>

                <h3 className="text-xl sm:text-[24px] font-extrabold text-white tracking-tight mb-1.5">
                  {pkg.name}
                </h3>

                <p className="text-xs sm:text-[12.5px] text-[#a8a1a8] leading-relaxed mb-5 font-normal min-h-[40px]">
                  {pkg.description}
                </p>

                <div className="flex items-baseline gap-1.5 pb-5 border-b border-white/10 mb-5">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {pkg.price}
                  </span>
                  <span className="text-xs font-normal text-white/50 tracking-normal">
                    {pkg.priceSuffix}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-3.5 block">
                    WHAT&apos;S INCLUDED
                  </span>
                  <ul className="space-y-3">
                    {pkg.inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-white/80 leading-normal">
                        <svg
                          className={`w-4 h-4 shrink-0 mt-0.5 ${pkg.isPopular ? 'text-[#ff6d29]' : 'text-white/60'}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <a
                href="#booking"
                onClick={(e) => handleBooking(e, pkg.shootType)}
                className={`group w-full mt-8 py-3.5 px-6 rounded-full font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6d29] ${
                  pkg.isPopular
                    ? 'bg-[#ff6d29] hover:bg-[#ff5500] text-white shadow-[0_8px_25px_rgba(255,109,41,0.4)]'
                    : 'bg-white/10 hover:bg-white/15 border border-white/15 text-white'
                }`}
              >
                <span>{pkg.ctaText}</span>
                <svg
                  className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17L17 7M17 7H9M17 7V15" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- BUSINESS PACKAGES (2 Cards Centered) ---------------- */}
      {activeTab === 'business' && (
        <div
          role="tabpanel"
          id="tabpanel-business"
          aria-labelledby="tab-business"
          className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7 max-w-4xl mx-auto mb-14 fade-in-content"
        >
          {businessPlans.map((pkg, idx) => (
            <div
              key={`business-plan-${pkg.id || idx}-${idx}`}
              className={`relative rounded-[24px] sm:rounded-[28px] bg-[#140f13] p-6 sm:p-7 min-h-[530px] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                pkg.isPopular
                  ? 'border border-[#ff6d29]/70 shadow-[0_12px_40px_rgba(255,109,41,0.22)]'
                  : 'border border-white/10 hover:border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
              }`}
            >
              {pkg.badge && (
                <div className="absolute -top-3.5 right-6 sm:right-7 px-3.5 py-1 rounded-full bg-[#ff6d29] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-[0_4px_12px_rgba(255,109,41,0.45)]">
                  {pkg.badge}
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff6d29] mb-1.5 block">
                  {pkg.tag}
                </span>

                <h3 className="text-xl sm:text-[24px] font-extrabold text-white tracking-tight mb-1.5">
                  {pkg.name}
                </h3>

                <p className="text-xs sm:text-[12.5px] text-[#a8a1a8] leading-relaxed mb-5 font-normal min-h-[40px]">
                  {pkg.description}
                </p>

                <div className="flex items-baseline gap-1.5 pb-5 border-b border-white/10 mb-5">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {pkg.price}
                  </span>
                  <span className="text-xs font-normal text-white/50 tracking-normal">
                    {pkg.priceSuffix}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-3.5 block">
                    WHAT&apos;S INCLUDED
                  </span>
                  <ul className="space-y-3">
                    {pkg.inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-white/80 leading-normal">
                        <svg
                          className={`w-4 h-4 shrink-0 mt-0.5 ${pkg.isPopular ? 'text-[#ff6d29]' : 'text-white/60'}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <a
                href="#booking"
                onClick={(e) => handleBooking(e, pkg.shootType)}
                className={`group w-full mt-7 py-3 px-6 rounded-full font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6d29] ${
                  pkg.btnVariant === 'white'
                    ? 'bg-white hover:bg-white/90 text-black shadow-lg font-extrabold'
                    : 'bg-[#ff6d29] hover:bg-[#ff5500] text-white shadow-[0_8px_25px_rgba(255,109,41,0.4)]'
                }`}
              >
                <span>{pkg.ctaText}</span>
                <svg
                  className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17L17 7M17 7H9M17 7V15" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- WEDDING PACKAGES (4 Cards) ---------------- */}
      {activeTab === 'wedding' && (
        <div
          role="tabpanel"
          id="tabpanel-wedding"
          aria-labelledby="tab-wedding"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 mb-14 fade-in-content"
        >
          {weddingPlans.map((pkg, idx) => (
            <div
              key={`wedding-plan-${pkg.id || idx}-${idx}`}
              className={`relative rounded-[24px] sm:rounded-[28px] bg-[#140f13] p-5 sm:p-6 min-h-[530px] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                pkg.isPopular
                  ? 'border border-[#ff6d29]/70 shadow-[0_12px_40px_rgba(255,109,41,0.22)]'
                  : 'border border-white/10 hover:border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
              }`}
            >
              {pkg.badge && (
                <div className="absolute -top-3.5 right-6 sm:right-7 px-3.5 py-1 rounded-full bg-[#ff6d29] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-[0_4px_12px_rgba(255,109,41,0.45)]">
                  {pkg.badge}
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff6d29] mb-1.5 block">
                  {pkg.tag}
                </span>

                <h3 className="text-xl sm:text-[24px] font-extrabold text-white tracking-tight mb-1.5">
                  {pkg.name}
                </h3>

                <p className="text-xs sm:text-[12.5px] text-[#a8a1a8] leading-relaxed mb-5 font-normal min-h-[40px]">
                  {pkg.description}
                </p>

                <div className="flex items-baseline gap-1.5 pb-5 border-b border-white/10 mb-5">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {pkg.price}
                  </span>
                  <span className="text-xs font-normal text-white/50 tracking-normal">
                    {pkg.priceSuffix}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-3.5 block">
                    WHAT&apos;S INCLUDED
                  </span>
                  <ul className="space-y-3">
                    {pkg.inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-white/80 leading-normal">
                        <svg
                          className={`w-4 h-4 shrink-0 mt-0.5 ${pkg.isPopular ? 'text-[#ff6d29]' : 'text-white/60'}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <a
                href="#booking"
                onClick={(e) => handleBooking(e, pkg.shootType)}
                className={`group w-full mt-8 py-3.5 px-6 rounded-full font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6d29] ${
                  pkg.isPopular
                    ? 'bg-[#ff6d29] hover:bg-[#ff5500] text-white shadow-[0_8px_25px_rgba(255,109,41,0.4)]'
                    : 'bg-white/10 hover:bg-white/15 border border-white/15 text-white'
                }`}
              >
                <span>{pkg.ctaText}</span>
                <svg
                  className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17L17 7M17 7H9M17 7V15" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </section>
  );
}
