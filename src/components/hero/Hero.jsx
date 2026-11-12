'use client';

import React from 'react';
import Link from 'next/link';
import StatCard from './StatCard';
import PortfolioCarousel from '../sections/PortfolioCarousel';

/**
 * Hero Component
 *
 * Streamlined dark-luxury hero section:
 * - Eyebrow badge, main headline, and primary CTAs
 * - Phone mockup removed as requested
 * - "The Real Work" interactive 3D video portfolio carousel front and center
 * - Preserves #showcase anchor for smooth navbar navigation
 * - Stats cards row (45,000+ Reels / 5,000+ Bookings / 4.8 Rating) as social proof foundation
 * - Responsive: clean scaling on mobile with zero horizontal scroll
 */
export default function Hero({ onShowToast }) {
  return (
    <section
      id="hero"
      aria-label="ReelXpress Hero"
      className="relative w-full max-w-[1600px] mx-auto overflow-visible scroll-mt-20 md:scroll-mt-28"
    >
      {/* Subtle Grid Pattern Overlay */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-50 -z-10"
        aria-hidden="true"
      />

      {/* =========================================================================
          1. MOBILE HERO VIEW (< 768px / md:hidden)
          - Left-aligned, 100svh above-the-fold layout
          - Headline, both buttons, stats & tagline visible on 390x844 without scrolling
          ========================================================================= */}
      <div className="md:hidden flex flex-col justify-start text-left px-4 pt-3 pb-6 min-h-[100svh] relative hero-mobile-fadein">
        {/* Soft orange radial glow behind hero */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[280px] h-[280px] rounded-full bg-[#EA5A2B]/10 blur-[80px] pointer-events-none -z-10"
          aria-hidden="true"
        />

        {/* Small line: "Shot on iPhone. Edited live." with bolt icon */}
        <div className="flex items-center gap-1.5 text-[15px] font-semibold text-white mb-2">
          <svg className="w-4 h-4 fill-[#EA5A2B] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-5.97 10.49z" />
          </svg>
          <span>Shot on iPhone. Edited live.</span>
        </div>

        {/* H1: "Your moment. Posted before you leave." (orange gradient, weight 800, clamp(2.25rem, 9vw, 2.75rem), tight leading, max 2 lines) */}
        <h1 className="text-[clamp(2.25rem,9vw,2.75rem)] font-extrabold tracking-tight leading-[1.1] max-w-md mb-2.5">
          <span className="bg-gradient-to-r from-[#EA5A2B] to-[#F0A04B] bg-clip-text text-transparent">
            Your moment. Posted before you leave.
          </span>
        </h1>

        {/* Subtext: "We shoot, edit and hand you a ready-to-post reel on the spot. No waiting, no chasing editors." (15px, leading 1.5, white at 75%, max 3 lines) */}
        <p className="text-[15px] leading-[1.5] text-white/75 max-w-md mb-4">
          We shoot, edit and hand you a ready-to-post reel on the spot. No waiting, no chasing editors.
        </p>

        {/* Buttons (Left-aligned & stacked) */}
        <div className="flex flex-col gap-2.5 w-full mb-4">
          {/* Primary Button: "Book your reel" (full-width, 52px tall, rounded-2xl, gradient) */}
          <Link
            href="/#booking"
            className="w-full h-[52px] rounded-2xl bg-gradient-to-r from-[#EA5A2B] to-[#F0A04B] text-white font-bold text-base flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(234,90,43,0.35)] active:scale-[0.98] transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A04B] cursor-pointer"
          >
            <span>Book your reel</span>
            <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          {/* Secondary Button: "Join as a creator" (ghost style, arrow icon) */}
          <Link
            href="/creators"
            className="w-full h-[46px] rounded-2xl border border-white/20 bg-white/[0.04] hover:bg-white/[0.08] text-white/90 font-medium text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 cursor-pointer"
          >
            <span>Join as a creator</span>
            <svg className="w-4 h-4 fill-none stroke-current stroke-2 text-white/70" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Stats: ONE card holding a 3-column grid with thin dividers */}
        <div className="w-full bg-[#121013]/90 border border-white/10 rounded-2xl p-3 backdrop-blur-md shadow-lg mb-2">
          <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
            {/* Col 1 */}
            <div className="px-1 flex flex-col justify-center">
              <div className="text-[22px] font-bold text-white tracking-tight leading-tight">45,000+</div>
              <div className="text-[11px] uppercase tracking-wider text-white/60 font-medium mt-0.5">Reels delivered</div>
            </div>
            {/* Col 2 */}
            <div className="px-1 flex flex-col justify-center">
              <div className="text-[22px] font-bold text-white tracking-tight leading-tight">5,000+</div>
              <div className="text-[11px] uppercase tracking-wider text-white/60 font-medium mt-0.5">Bookings done</div>
            </div>
            {/* Col 3 */}
            <div className="px-1 flex flex-col justify-center">
              <div className="text-[22px] font-bold text-white tracking-tight leading-tight flex items-center justify-center gap-1">
                <span>4.8</span>
                <span className="text-[#F0A04B] text-base leading-none">★</span>
              </div>
              <div className="text-[11px] uppercase tracking-wider text-white/60 font-medium mt-0.5">Average rating</div>
            </div>
          </div>
        </div>

        {/* Tagline below the stats */}
        <div className="text-[13px] font-semibold text-[#EA5A2B] tracking-wide text-left">
          We Deliver The Reel.
        </div>
      </div>

      {/* =========================================================================
          2. DESKTOP & TABLET HERO VIEW (>= 768px / hidden md:flex)
          - Preserved exactly as-is: centered luxury headline, CTAs, 3 stat cards
          ========================================================================= */}
      <div className="hidden md:flex flex-col items-center pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-12 sm:pb-16 px-4 sm:px-6 md:px-margin text-center">
        {/* Main Headline */}
        <h1 className="reveal-on-scroll text-white w-full max-w-6xl mx-auto mb-6 sm:mb-8 select-none text-center">
          <span className="inline-flex flex-wrap items-center justify-center text-[clamp(15px,4.3vw,52px)] font-extrabold tracking-tight leading-[1.2]">
            <span className="whitespace-nowrap">Shoot The Moment</span>
            <img
              src="/brand/reelxpress-gold-x.png"
              alt="reelXpress Mark"
              className="inline-block h-[0.88em] w-auto mx-1.5 sm:mx-2.5 md:mx-3 object-contain drop-shadow-[0_0_12px_rgba(255,200,60,0.45)] shrink-0 select-none"
              loading="eager"
            />
            <span className="whitespace-nowrap">Own The Spotlight</span>
          </span>
          <span className="block mt-2 sm:mt-3 text-[clamp(20px,5.4vw,62px)] font-black tracking-tight leading-[1.15] text-shimmer text-primary-container">
            We Deliver The Reel.
          </span>
        </h1>

        {/* Sub-line */}
        <p className="reveal-on-scroll text-sm sm:text-lg md:text-xl font-normal text-text-muted/90 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed delay-100">
          You live the moment. ReelXpress captures it — instantly. Shot on latest iPhone gear with on-spot live editing.
        </p>

        {/* Primary CTAs */}
        <div className="reveal-on-scroll relative z-30 w-full max-w-xl mx-auto flex flex-row items-center justify-center gap-6 mb-8 sm:mb-10 px-4">
          <a
            href="#booking"
            className="btn-glow-orange btn-shine-sweep group w-auto inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-4 sm:py-4.5 rounded-full font-extrabold text-sm sm:text-base tracking-wider uppercase cursor-pointer select-none touch-manipulation min-h-[50px] shadow-lg"
            aria-label="Book reelXpress Now"
          >
            <span>BOOK NOW</span>
            <span className="material-symbols-outlined text-lg sm:text-xl transition-transform duration-200 group-hover:translate-x-1">
              arrow_forward
            </span>
          </a>

          <Link
            href="/creators"
            className="btn-glow-dark group w-auto inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-4 sm:py-4.5 rounded-full font-extrabold text-sm sm:text-base tracking-wider uppercase cursor-pointer select-none touch-manipulation min-h-[50px] shadow-lg"
            aria-label="Become a Creator"
          >
            <span>BECOME A CREATOR</span>
            <span className="material-symbols-outlined text-lg sm:text-xl text-primary transition-transform duration-200 group-hover:translate-x-1">
              north_east
            </span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="reveal-on-scroll relative z-30 w-full max-w-4xl mx-auto mb-10 sm:mb-14 px-4">
          <div className="grid grid-cols-3 gap-6">
            <StatCard value="45,000+" label="Reels delivered" />
            <StatCard value="5,000+" label="Bookings done" />
            <StatCard value="4.8" label="Average Rating" hasStar={true} />
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. KEY CREATIVE SHOWCASE ("THE REAL WORK" / CAROUSEL)
          - Video carousel sits openly and seamlessly on the hero section background
          - Preserves #showcase anchor for navbar navigation
          ========================================================================= */}
      <div id="showcase" className="reveal-scale-on-scroll relative w-full max-w-7xl mx-auto mb-8 sm:mb-12 overflow-visible scroll-mt-20 md:scroll-mt-28">
        {/* Ambient Warm Radial Glow Behind Showcase */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[620px] md:w-[920px] h-[340px] sm:h-[480px] rounded-full bg-gradient-to-br from-[#FF5E1E]/12 via-[#5c1d00]/05 to-transparent blur-3xl pointer-events-none -z-10"
          aria-hidden="true"
        />

        {/* Section Header */}
        <div className="relative text-center max-w-3xl mx-auto mb-6 md:mb-10 z-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-glass-tinted border border-border-amber text-primary text-label-sm font-label-sm uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(255,94,30,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container rec-indicator" />
            <span>LIVE FEED</span>
          </div>
          <h2 className="text-3xl md:text-headline-lg font-display-xl font-extrabold text-text-primary tracking-tight mb-2">
            THE REAL WORK
          </h2>
          <p className="text-body-md md:text-title-md font-body-lg text-text-muted max-w-2xl mx-auto">
            Shot on Pro-grade gear. Edited on-site. Delivered via Cloud.
          </p>
        </div>

        {/* Fanned-Out Reel Portfolio Carousel */}
        <PortfolioCarousel onShowToast={onShowToast} />
      </div>
    </section>
  );
}
