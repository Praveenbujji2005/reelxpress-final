'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import MobileMenu from '@/components/layout/MobileMenu';
import Footer from '@/components/layout/Footer';
import StatCard from '@/components/hero/StatCard';
import { WHY_REELXPRESS_DATA } from '@/lib/data';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import ReelXpressWordmark from '@/components/ui/ReelXpressWordmark';

export default function ReelXpressPageView() {
  useScrollReveal();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const COMPARISON_ROWS = [
    {
      feature: 'Delivery Turnaround',
      reelxpress: 'Minutes / On-Spot at Venue',
      agency: '3 to 14 Business Days',
      advantage: true,
    },
    {
      feature: 'Production Gear',
      reelxpress: 'Latest iPhone Flagship + Gimbals + Mics',
      agency: 'Bulky DSLR Cameras & Tripods',
      advantage: true,
    },
    {
      feature: 'Content Format',
      reelxpress: '9:16 Vertical Native, Algorithmic Hooks',
      agency: 'Horizontal 16:9 cropped post-shoot',
      advantage: true,
    },
    {
      feature: 'Pricing Model',
      reelxpress: 'Starting at ₹1,999 Flat Transparent Rates',
      agency: '₹25,000+ with hidden post-production fees',
      advantage: true,
    },
    {
      feature: 'Creator Network',
      reelxpress: 'Hand-vetted top 1% vertical reel makers',
      agency: 'Inconsistent freelancer subcontracting',
      advantage: true,
    },
    {
      feature: 'Raw Footage Rights',
      reelxpress: 'All raw clips provided on request',
      agency: 'Paid extra or withheld',
      advantage: true,
    },
  ];

  return (
    <>
      <Navbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="relative z-10 flex-1 pt-24 sm:pt-28 md:pt-32 pb-16">
        {/* =========================================================================
            HERO / HEADER SECTION
           ========================================================================= */}
        <section className="relative px-6 md:px-margin max-w-[1440px] mx-auto text-center mb-16 sm:mb-24">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[250px] sm:h-[350px] bg-primary-container/15 blur-[120px] rounded-full pointer-events-none -z-10" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-glass border border-border-specular backdrop-blur-xl mb-6 shadow-md">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            <span className="text-xs font-bold text-text-primary tracking-widest uppercase">
              BENGALURU&apos;S 1ST QUICK CONTENT SERVICE
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <span>Why</span>
            <span className="inline-flex items-center align-middle">
              <ReelXpressWordmark className="h-10 sm:h-12 md:h-16 lg:h-20 w-auto align-middle drop-shadow-[0_0_24px_rgba(255,94,30,0.5)]" />
            </span>
            <span>?</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-text-muted leading-relaxed mb-8">
            The intersection of speed, cinema, and social-first storytelling. We shoot, edit, and deliver high-velocity reels directly to your phone in minutes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/#booking"
              className="btn-shine-sweep btn-ripple inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#ff5722] to-[#ff6d29] text-white font-bold text-sm sm:text-base shadow-[0_10px_30px_rgba(255,109,41,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Book Your Shoot</span>
              <span className="material-symbols-outlined text-lg">bolt</span>
            </Link>

            <Link
              href="/#pricing"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-surface-glass border border-border-specular hover:border-border-amber text-text-primary font-semibold text-sm sm:text-base backdrop-blur-xl hover:bg-white/5 transition-all cursor-pointer"
            >
              <span>Explore Packages</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>

            <Link
              href="/creators"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-transparent border border-white/20 hover:border-white/50 text-white/80 hover:text-white font-semibold text-sm sm:text-base transition-all cursor-pointer"
            >
              <span>Become a Partner</span>
            </Link>
          </div>
        </section>

        {/* =========================================================================
            STATS COUNTERS ROW (Increasing Count-Up Animation)
           ========================================================================= */}
        <section className="reveal-on-scroll relative z-20 w-full max-w-4xl mx-auto mb-20 px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <StatCard value="45,000+" label="Reels delivered" />
            <StatCard value="5,000+" label="Bookings done" />
            <StatCard value="4.8" label="Average Rating" hasStar={true} />
          </div>
        </section>

        {/* =========================================================================
            THE 6 CORE ADVANTAGES (WHY REELXPRESS PILLARS)
           ========================================================================= */}
        <section className="py-12 px-6 md:px-margin max-w-[1440px] mx-auto mb-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-primary text-xs sm:text-sm font-bold uppercase tracking-[0.2em] block mb-2">
              THE ADVANTAGE
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Built for Speed. Tuned for Reach.
            </h2>
            <p className="text-text-muted text-sm sm:text-base mt-3">
              Traditional videography is slow, bulky, and expensive. reelXpress redesigns the entire workflow for modern mobile social media.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_REELXPRESS_DATA.map((item) => (
              <div
                key={item.title}
                className="spotlight-card p-7 sm:p-8 rounded-2xl bg-surface-glass border border-border-specular backdrop-blur-xl hover:border-border-amber transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary border border-border-specular group-hover:border-primary group-hover:scale-110 transition-all duration-300">
                    <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted bg-surface-container px-2.5 py-1 rounded-full border border-border-specular/40">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            HOW IT WORKS (3-STEP ACCELERATED PIPELINE)
           ========================================================================= */}
        <section className="py-16 px-6 md:px-margin max-w-[1440px] mx-auto mb-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-primary text-xs sm:text-sm font-bold uppercase tracking-[0.2em] block mb-2">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              From Booking to Viral in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-surface-glass border border-border-specular backdrop-blur-xl relative">
              <span className="text-5xl font-extrabold text-white/10 absolute top-6 right-6">01</span>
              <div className="w-12 h-12 rounded-2xl bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container font-extrabold mb-6">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Book in 60 Seconds</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Choose your shoot category, date, and venue. A verified flagship-equipped reel maker is dispatched immediately.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-surface-glass border border-border-specular backdrop-blur-xl relative">
              <span className="text-5xl font-extrabold text-white/10 absolute top-6 right-6">02</span>
              <div className="w-12 h-12 rounded-2xl bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container font-extrabold mb-6">
                <span className="material-symbols-outlined">videocam</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Shoot &amp; Live Edit</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                You enjoy the moment while our creator frames cinematic 4K vertical footage with on-spot color grading and sound syncing.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-surface-glass border border-border-specular backdrop-blur-xl relative">
              <span className="text-5xl font-extrabold text-white/10 absolute top-6 right-6">03</span>
              <div className="w-12 h-12 rounded-2xl bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container font-extrabold mb-6">
                <span className="material-symbols-outlined">send</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delivered in Minutes</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Receive finished, viral-ready Instagram Reels and raw clips instantly via AirDrop or instant cloud link before your event ends.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            COMPARISON MATRIX (REELXPRESS VS TRADITIONAL PRODUCTION)
           ========================================================================= */}
        <section className="py-12 px-6 md:px-margin max-w-4xl mx-auto mb-20">
          <div className="text-center mb-10">
            <span className="text-primary text-xs sm:text-sm font-bold uppercase tracking-[0.2em] block mb-2">
              THE COMPARISON
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              Why Creators &amp; Brands Switch to reelXpress
            </h2>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-border-specular bg-surface-glass backdrop-blur-xl shadow-2xl">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="py-4 px-6 font-bold text-text-muted uppercase text-xs">Feature</th>
                  <th className="py-4 px-6 font-extrabold text-primary uppercase text-xs flex items-center gap-2">
                    <img src="/brand/icon-gold.png" alt="" className="w-4 h-4 object-contain" />
                    <span>reelXpress</span>
                  </th>
                  <th className="py-4 px-6 font-bold text-white/40 uppercase text-xs">Traditional Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-semibold text-white/90">{row.feature}</td>
                    <td className="py-4 px-6 font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      <span>{row.reelxpress}</span>
                    </td>
                    <td className="py-4 px-6 text-text-muted">{row.agency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =========================================================================
            BOTTOM CALL TO ACTION BANNER
           ========================================================================= */}
        <section className="px-6 md:px-margin max-w-[1440px] mx-auto text-center mb-12">
          <div className="p-8 sm:p-12 md:p-16 rounded-3xl bg-gradient-to-b from-[#1b151b] to-[#120f12] border border-border-amber relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 blur-[100px] pointer-events-none" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
              Ready to capture your moment instantly?
            </h2>
            <p className="text-text-muted max-w-xl mx-auto mb-8 text-sm sm:text-base">
              Book a verified iPhone creator now. Available across Bengaluru, Hyderabad, Chennai, Vizag, and Vijayawada.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/#booking"
                className="btn-shine-sweep btn-ripple inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary-container text-text-primary font-bold text-base shadow-[0_0_30px_rgba(255,109,41,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Book a Creator Now</span>
                <span className="material-symbols-outlined">bolt</span>
              </Link>
              <Link
                href="/creators"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-surface-container border border-border-specular hover:border-white/30 text-white font-semibold text-base transition-all cursor-pointer"
              >
                <span>Partner as a Creator</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
