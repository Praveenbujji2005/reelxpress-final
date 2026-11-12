'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import StatCard from './StatCard';
import PortfolioCarousel from '../sections/PortfolioCarousel';

/**
 * Hero Component
 *
 * Streamlined dark-luxury hero section:
 * - Eyebrow badge, main headline, and sub-line
 * - Desktop (>= 768px): Side-by-side primary CTAs & StatCards row
 * - Mobile (< 768px): Redesigned mobile hero bottom section:
 *     1. Trust Chips (1 on first row, 2 per row)
 *     2. Centered CTA buttons (BOOK NOW & BECOME A PARTNER, 70-75% width)
 *     3. Service Tiles (3 in a row: Quick Shoot, Wedding Shoot, Vehicle Shoot)
 *     4. Stats Row (45,000+ Reels, 4.8 /5 with 5 stars, 200+ Creators)
 *     5. 90px bottom padding to prevent WhatsApp widget overlap
 * - Key creative showcase ("THE REAL WORK") interactive 3D video portfolio carousel
 */
export default function Hero({ onShowToast }) {
  const handleBookNow = useCallback((e) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      e.preventDefault();
      window.location.href = '/contact';
      return;
    }
    e.preventDefault();
    const bookingEl = document.getElementById('booking') || document.getElementById('booking-form');
    if (bookingEl) {
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.scrollTo(bookingEl, { offset: -60, duration: 1.2 });
      } else {
        bookingEl.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = '/contact';
    }
  }, []);

  return (
    <section
      id="hero"
      aria-label="ReelXpress Hero"
      className="relative pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-12 sm:pb-16 px-4 sm:px-6 md:px-margin w-full max-w-[1600px] mx-auto text-center flex flex-col items-center overflow-visible scroll-mt-20 md:scroll-mt-28"
    >
      {/* Subtle Grid Pattern Overlay */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-50 -z-10"
        aria-hidden="true"
      />

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

      {/* =========================================================================
          DESKTOP ONLY (>= 768px): SIDE-BY-SIDE CTAs & 3-CARD STATS ROW
         ========================================================================= */}
      <div className="hidden md:flex reveal-on-scroll relative z-30 w-full max-w-xl mx-auto flex-row items-center justify-center gap-6 mb-10 px-4">
        {/* Book Now Button */}
        <a
          href="#booking"
          onClick={handleBookNow}
          className="btn-glow-orange btn-shine-sweep group w-auto inline-flex items-center justify-center gap-2.5 px-10 py-4.5 rounded-full font-extrabold text-base tracking-wider uppercase cursor-pointer select-none touch-manipulation min-h-[50px] shadow-lg"
          aria-label="Book reelXpress Now"
        >
          <span>BOOK NOW</span>
          <span className="material-symbols-outlined text-xl transition-transform duration-200 group-hover:translate-x-1">
            arrow_forward
          </span>
        </a>

        {/* Become a Creator Button */}
        <Link
          href="/creators"
          className="btn-glow-dark group w-auto inline-flex items-center justify-center gap-2.5 px-10 py-4.5 rounded-full font-extrabold text-base tracking-wider uppercase cursor-pointer select-none touch-manipulation min-h-[50px] shadow-lg"
          aria-label="Become a Creator"
        >
          <span>BECOME A CREATOR</span>
          <span className="material-symbols-outlined text-xl text-primary transition-transform duration-200 group-hover:translate-x-1">
            north_east
          </span>
        </Link>
      </div>

      {/* Desktop StatCards */}
      <div className="hidden md:block reveal-on-scroll relative z-30 w-full max-w-4xl mx-auto mb-14 px-4">
        <div className="grid grid-cols-3 gap-6">
          <StatCard value="45,000+" label="Reels delivered" />
          <StatCard value="5,000+" label="Bookings done" />
          <StatCard value="4.8" label="Average Rating" hasStar={true} />
        </div>
      </div>

      {/* =========================================================================
          MOBILE ONLY (< 768px): REDESIGNED HERO BOTTOM SECTION
          - 1. Trust Chips (1 on first row, 2 per row)
          - 2. Centered CTA Buttons (BOOK NOW & BECOME A PARTNER, ~70-75% screen width)
          - 3. Service Tiles (3 in a row: Quick Shoot, Wedding Shoot, Vehicle Shoot)
          - 4. Stats Row (3 columns: 45,000+, 4.8 /5 with 5 stars, 200+)
          - Soft orange radial glow behind CTA area
          - 90px bottom padding to prevent overlap with floating WhatsApp widget
         ========================================================================= */}
      <div className="md:hidden relative z-30 w-full max-w-lg mx-auto flex flex-col items-center pb-[90px] px-2 select-none">
        {/* Soft Orange Radial Glow behind CTA area */}
        <div
          className="absolute top-24 left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full pointer-events-none -z-10"
          style={{
            background: 'radial-gradient(circle at 50% 30%, rgba(255,122,26,0.12), transparent 60%)',
          }}
          aria-hidden="true"
        />

        {/* 1. TRUST CHIPS (1 on first row, 2 per row) */}
        <div className="flex flex-col items-center gap-2.5 mb-7 w-full">
          {/* Row 1: 1 chip */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-full py-2.5 px-4 text-[13px] sm:text-[14px] font-medium text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-[#FF7A1A]">star</span>
              <span>5-Star Rated (100+ Reviews)</span>
            </div>
          </div>
          {/* Row 2: 2 chips */}
          <div className="flex items-center justify-center gap-2.5 w-full">
            <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-full py-2.5 px-3.5 text-[13px] sm:text-[14px] font-medium text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-[#FF7A1A]">military_tech</span>
              <span>5000+ Bookings Done</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-full py-2.5 px-3.5 text-[13px] sm:text-[14px] font-medium text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-[#FF7A1A]">bolt</span>
              <span>Delivery in Minutes</span>
            </div>
          </div>
          {/* Row 3: 2 chips */}
          <div className="flex items-center justify-center gap-2.5 w-full">
            <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-full py-2.5 px-3.5 text-[13px] sm:text-[14px] font-medium text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-[#FF7A1A]">phone_iphone</span>
              <span>Shot on Latest iPhone</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-full py-2.5 px-3.5 text-[13px] sm:text-[14px] font-medium text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-[#FF7A1A]">currency_rupee</span>
              <span>Starting at ₹1,999</span>
            </div>
          </div>
        </div>

        {/* 2. CTA BUTTONS (centered, ~70-75% screen width, 14px gap) */}
        <div className="flex flex-col items-center gap-[14px] w-[74%] max-w-[310px] mb-8">
          {/* BOOK NOW: Solid orange gradient, white bold uppercase, radius 20px, height 60px, soft glow */}
          <a
            href="#booking"
            onClick={handleBookNow}
            className="w-full h-[60px] rounded-[20px] flex items-center justify-center text-white font-extrabold text-[15px] tracking-[0.04em] uppercase cursor-pointer select-none touch-manipulation active:scale-[0.97] transition-transform shadow-[0_8px_24px_rgba(255,122,26,0.35)]"
            style={{
              background: 'linear-gradient(135deg, #FF8A2B 0%, #FF7A1A 50%, #E8590C 100%)',
            }}
            aria-label="Book Now"
          >
            <span>BOOK NOW</span>
          </a>

          {/* BECOME A PARTNER: background #0D0D12, 1.5px orange border, orange bold uppercase text */}
          <Link
            href="/creators"
            className="w-full h-[60px] rounded-[20px] bg-[#0D0D12] border-[1.5px] border-[#FF7A1A] flex items-center justify-center text-[#FF7A1A] font-extrabold text-[15px] tracking-[0.04em] uppercase cursor-pointer select-none touch-manipulation active:scale-[0.97] transition-transform shadow-none"
            aria-label="Become a Partner"
          >
            <span>BECOME A PARTNER</span>
          </Link>
        </div>

        {/* 3. SERVICE TILES (3 in a row, equal width cards, 12px gap, 16px side margin) */}
        <div className="grid grid-cols-3 gap-3 w-full px-2 mb-8">
          {/* Quick Shoot */}
          <Link
            href="/contact?service=Quick%20Shoot"
            className="flex flex-col items-center text-center p-3.5 py-4 rounded-[24px] bg-white/[0.04] border border-white/[0.08] active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#FF7A1A]/15 flex items-center justify-center mb-2.5">
              <span className="material-symbols-outlined text-[26px] text-[#FF7A1A]">bolt</span>
            </div>
            <span className="text-[13.5px] sm:text-[15px] font-semibold text-white tracking-tight leading-tight">
              Quick Shoot
            </span>
          </Link>

          {/* Wedding Shoot */}
          <Link
            href="/contact?service=Wedding%20Shoot"
            className="flex flex-col items-center text-center p-3.5 py-4 rounded-[24px] bg-white/[0.04] border border-white/[0.08] active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#FF7A1A]/15 flex items-center justify-center mb-2.5">
              <span className="material-symbols-outlined text-[26px] text-[#FF7A1A]">favorite</span>
            </div>
            <span className="text-[13.5px] sm:text-[15px] font-semibold text-white tracking-tight leading-tight">
              Wedding Shoot
            </span>
          </Link>

          {/* Vehicle Shoot */}
          <Link
            href="/contact?service=Vehicle%20Shoot"
            className="flex flex-col items-center text-center p-3.5 py-4 rounded-[24px] bg-white/[0.04] border border-white/[0.08] active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#FF7A1A]/15 flex items-center justify-center mb-2.5">
              <span className="material-symbols-outlined text-[26px] text-[#FF7A1A]">directions_car</span>
            </div>
            <span className="text-[13.5px] sm:text-[15px] font-semibold text-white tracking-tight leading-tight">
              Vehicle Shoot
            </span>
          </Link>
        </div>

        {/* 4. STATS ROW (Thin divider above 1px rgba(255,255,255,0.10), 3 columns, padding-top 32px) */}
        <div className="w-full border-t border-white/10 pt-8">
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Column 1: 45,000+ / Reels Delivered */}
            <div className="flex flex-col items-center">
              <span className="text-[30px] sm:text-[36px] font-black tracking-tight text-white leading-none">
                45,000+
              </span>
              <span className="text-white/60 text-[12px] sm:text-[14px] mt-2 font-medium">
                Reels Delivered
              </span>
            </div>

            {/* Column 2: 4.8 /5 with 5 small orange stars below */}
            <div className="flex flex-col items-center">
              <div className="flex items-baseline justify-center text-[30px] sm:text-[36px] font-black tracking-tight text-white leading-none">
                <span>4.8</span>
                <span className="text-base sm:text-lg font-normal text-white/40 ml-0.5">/5</span>
              </div>
              <div className="flex items-center justify-center gap-0.5 mt-2.5 text-[#FF7A1A]">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-[14px]"
                    data-weight="fill"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>
            </div>

            {/* Column 3: 200+ / Creators */}
            <div className="flex flex-col items-center">
              <span className="text-[30px] sm:text-[36px] font-black tracking-tight text-white leading-none">
                200+
              </span>
              <span className="text-white/60 text-[12px] sm:text-[14px] mt-2 font-medium">
                Creators
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          KEY CREATIVE SHOWCASE ("THE REAL WORK")
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
