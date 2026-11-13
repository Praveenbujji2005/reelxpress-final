'use client';

import React from 'react';
import { WHY_REELXPRESS_DATA } from '@/lib/data';
import ReelXpressWordmark from '@/components/ui/ReelXpressWordmark';

/**
 * Why ReelXpress? Section
 * The high-speed edge for your vertical storytelling.
 * 6 Core Advantages:
 * 1. ELITE QUALITY - Premium Quality
 * 2. SPEED - Fast Delivery
 * 3. SOCIAL - Social-first Reels
 * 4. PRODUCTION - Professional Shooting
 * 5. QUICK START - Enjoy the Moment
 * 6. VALUE - Clear Pricing
 */
export default function WhyUsSection() {
  return (
    <section
      id="why-us"
      aria-label="Why ReelXpress"
      className="relative py-16 sm:py-20 md:py-space-2xl px-4 sm:px-6 md:px-margin max-w-[1440px] mx-auto scroll-mt-20 md:scroll-mt-28"
    >
      {/* Backward-compatibility anchor for legacy #services links */}
      <span id="services" className="absolute -top-28" aria-hidden="true" />

      {/* Ambient Warm Radial Background Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[620px] md:w-[860px] h-[340px] sm:h-[480px] rounded-full bg-gradient-to-br from-[#FF5E1E]/08 via-[#5c1d00]/03 to-transparent blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Section Header */}
      <div className="reveal-on-scroll text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-glass-tinted border border-border-amber text-primary text-label-sm font-label-sm uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(255,94,30,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-container rec-indicator" />
          <span>THE ADVANTAGE</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-headline-lg font-headline-lg font-extrabold text-text-primary tracking-tight">
          <span>Why </span>
          <span className="inline-flex items-center align-middle whitespace-nowrap">
            <ReelXpressWordmark className="inline-block h-[0.92em] sm:h-[1.0em] w-auto align-middle drop-shadow-[0_0_14px_rgba(255,94,30,0.4)]" />
            <span>?</span>
          </span>
        </h2>

        <p className="text-body-md md:text-title-md font-body-lg text-text-muted mt-3 max-w-2xl mx-auto leading-relaxed">
          The high-speed edge for your vertical storytelling.
        </p>
      </div>

      {/* 6 Core Value Proposition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {WHY_REELXPRESS_DATA.map((item) => (
          <div
            key={item.title}
            className={`reveal-on-scroll spotlight-card p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#141015]/90 border border-white/10 hover:border-[#ff6d29]/50 transition-all duration-300 group hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(0,0,0,0.7),0_0_25px_rgba(255,109,41,0.12)] flex flex-col justify-between ${item.delayClass}`}
          >
            <div>
              {/* Card Header: Icon & Badge */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ff6d29] group-hover:scale-110 group-hover:bg-[#ff6d29]/15 group-hover:border-[#ff6d29]/40 group-hover:shadow-[0_0_20px_rgba(255,109,41,0.4)] transition-all duration-300">
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#ff6d29] text-[10px] sm:text-[11px] font-bold tracking-wider uppercase">
                  {item.badge}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2.5 group-hover:text-[#ff6d29] transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed font-normal">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
