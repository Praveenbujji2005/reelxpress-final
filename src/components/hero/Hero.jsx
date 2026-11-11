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
export default function Hero({ onOpenModal, onShowToast }) {
  return (
    <section
      id="hero"
      aria-label="ReelXpress Hero"
      className="relative pt-14 sm:pt-16 md:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 md:px-margin w-full max-w-[1600px] mx-auto text-center flex flex-col items-center overflow-visible scroll-mt-20 md:scroll-mt-28"
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

      {/* Primary CTAs: BOOK NOW & BECOME A PARTNER */}
      <div className="reveal-on-scroll flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 sm:mb-14 w-full z-20 delay-150">
        <a
          href="#booking"
          className="btn-shine-sweep btn-ripple w-full sm:w-auto inline-flex items-center justify-center px-9 sm:px-11 py-4 sm:py-4.5 rounded-2xl bg-gradient-to-r from-[#ff5722] to-[#ff6d29] text-white font-extrabold text-sm sm:text-base tracking-wider uppercase shadow-[0_0_30px_rgba(255,109,41,0.55)] hover:shadow-[0_0_45px_rgba(255,109,41,0.85)] hover:scale-[1.03] active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <span>BOOK NOW</span>
        </a>
        <Link
          href="/creators"
          className="w-full sm:w-auto inline-flex items-center justify-center px-9 sm:px-11 py-4 sm:py-4.5 rounded-2xl bg-[#0c0a0c] border-2 border-primary-container/80 text-primary-container hover:bg-primary-container/10 hover:border-primary-container font-extrabold text-sm sm:text-base tracking-wider uppercase shadow-md hover:scale-[1.03] active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <span>BECOME A PARTNER</span>
        </Link>
      </div>

      {/* =========================================================================
          KEY CREATIVE SHOWCASE ("THE REAL WORK")
          - Enclosing box/card background removed as requested
          - Video carousel sits openly and seamlessly on the hero section background
          - Preserves #showcase anchor for navbar navigation
         ========================================================================= */}
      <div id="showcase" className="reveal-scale-on-scroll relative w-full max-w-7xl mx-auto mb-10 sm:mb-14 overflow-visible scroll-mt-20 md:scroll-mt-28">
        {/* Ambient Warm Radial Glow Behind Showcase (Toned Down) */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[620px] md:w-[920px] h-[340px] sm:h-[480px] rounded-full bg-gradient-to-br from-[#ff6d29]/10 via-[#5c1d00]/05 to-transparent blur-3xl pointer-events-none -z-10"
          aria-hidden="true"
        />

        {/* Section Header */}
        <div className="relative text-center max-w-3xl mx-auto mb-6 md:mb-10 z-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-glass-tinted border border-border-amber text-primary text-label-sm font-label-sm uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(255,109,41,0.15)]">
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
        <PortfolioCarousel onOpenModal={onOpenModal} onShowToast={onShowToast} />

        {/* View More on Instagram CTA */}
        <div className="relative z-20 flex justify-center mt-6 md:mt-8">
          <a
            href="https://www.instagram.com/reelxpress___"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shine-sweep btn-ripple inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary-container text-text-primary font-bold text-title-md font-title-md shadow-[0_0_30px_rgba(255,109,41,0.55)] hover:shadow-[0_0_45px_rgba(255,109,41,0.85)] hover:scale-[1.03] active:scale-95 transition-all duration-150 group cursor-pointer"
          >
            <span>View More on Instagram</span>
            <span className="material-symbols-outlined text-lg transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              north_east
            </span>
          </a>
        </div>
      </div>

      {/* =========================================================================
          STATS ROW (45,000+ Reels / 5,000+ Bookings / 4.8 Rating)
          Clean social proof foundation directly beneath the showcase deck
         ========================================================================= */}
      <div className="reveal-on-scroll relative z-30 w-full max-w-4xl mx-auto mb-8 sm:mb-12 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <StatCard value="45,000+" label="Reels delivered" />
          <StatCard value="5,000+" label="Bookings done" />
          <StatCard value="4.8" label="Average Rating" hasStar={true} />
        </div>
      </div>
    </section>
  );
}
