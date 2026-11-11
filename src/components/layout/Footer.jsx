import Link from 'next/link';
import { FOOTER_NAV_LINKS, FOOTER_LEGAL_LINKS } from '@/lib/data';
import ReelXpressWordmark from '@/components/ui/ReelXpressWordmark';

// Shared website footer with branding, internal navigation, legal links, and copyright
export default function Footer() {
  return (
    <footer className="bg-[#080808] text-primary full-width border-t border-white/10 relative z-20">
      <div className="w-full px-4 sm:px-6 md:px-margin max-w-[1440px] mx-auto py-12 sm:py-16 md:py-space-2xl flex flex-col justify-between gap-10 sm:gap-14">
        
        {/* =====================================================================
            DEDICATED CONTACT US CTA BANNER
            - Visible on desktop/tablet (hidden on mobile orientation as requested)
            - Glowing orange gradient button
            - Navigates directly to /contact
           ===================================================================== */}
        <div className="hidden md:flex w-full rounded-3xl bg-[#110e13] border border-white/10 p-6 sm:p-8 md:p-10 flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {/* Subtle Orange Glow Ambient Corner */}
          <div
            className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-gradient-to-br from-[#FF5E1E]/20 via-transparent to-transparent blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="text-center md:text-left max-w-xl z-10">
            <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-2">
              HAVE QUESTIONS OR A CUSTOM EVENT?
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              Let&apos;s Connect with Our Team
            </h3>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed">
              From wedding coverage to high-velocity brand reels, our Bengaluru production desk is ready to assist you.
            </p>
          </div>

          <div className="z-10 shrink-0 w-full sm:w-auto flex justify-center">
            <Link
              href="/contact"
              className="btn-glow-orange btn-shine-sweep group inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold text-white text-base tracking-wide uppercase transition-all min-h-[48px] w-full sm:w-auto"
              aria-label="Contact Us Page"
            >
              <span>CONTACT US</span>
              <span className="material-symbols-outlined text-lg sm:text-xl transition-transform duration-200 group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="max-w-md">
            <Link href="/reelxpress" className="inline-flex items-center gap-3 mb-4 group" aria-label="reelXpress">
              <ReelXpressWordmark className="h-8 sm:h-9 w-auto align-middle drop-shadow-[0_0_16px_rgba(255,94,30,0.4)] transition-transform duration-300 group-hover:scale-105" />
            </Link>
            <p className="text-body-sm font-body-sm text-text-muted leading-relaxed mb-6">
              The intersection of speed and cinema. On-demand video production for the modern era.
            </p>

            {/* Quick Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/#booking"
                className="btn-glow-orange btn-shine-sweep inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md"
              >
                <span>Book a Creator</span>
                <span className="material-symbols-outlined text-sm">bolt</span>
              </Link>
              <Link
                href="/contact"
                className="btn-glow-dark inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white font-semibold text-xs sm:text-sm hover:border-primary transition-all cursor-pointer"
              >
                <span>Contact Us</span>
                <span className="material-symbols-outlined text-sm text-primary">mail</span>
              </Link>
              <Link
                href="/creators"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <span>Become a Partner</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Navigation & Legal Links Columns */}
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-14">
            {/* Navigation Column */}
            <div>
              <div className="text-label-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                <span>Navigation</span>
              </div>
              <div className="flex flex-col gap-2.5 text-body-sm">
                {FOOTER_NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-text-muted hover:text-primary transition-colors flex items-center gap-1 group py-0.5"
                  >
                    <span className="material-symbols-outlined text-xs text-text-muted/40 group-hover:text-primary transition-colors">
                      chevron_right
                    </span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Connect / Legal Links Column */}
            <div>
              <div className="text-label-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                <span>Connect &amp; Legal</span>
              </div>
              <div className="flex flex-col gap-2.5 text-body-sm">
                {FOOTER_LEGAL_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-text-muted hover:text-primary transition-colors flex items-center gap-1 group py-0.5"
                  >
                    <span className="material-symbols-outlined text-xs text-text-muted/40 group-hover:text-primary transition-colors">
                      shield
                    </span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-6 border-t border-border-specular/30 text-xs text-text-muted/70 leading-relaxed text-center sm:text-left">
          reelXpress is an independent service provider operated by QUANTELLOVENTURES PRIVATE LIMITED and is not affiliated with or endorsed by Instagram, Meta, or any brands shown unless explicitly stated.
        </div>

        {/* Copyright Notice */}
        <div className="pt-4 border-t border-border-specular/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-body-sm font-body-sm text-text-muted">
          <div>
            Copyright © 2026 by QUANTELLOVENTURES PRIVATE LIMITED. All rights reserved.
          </div>
          <Link href="/reelxpress" className="flex items-center gap-2 text-label-sm font-label-sm text-text-muted/80 hover:text-white transition-colors">
            <img src="/brand/icon-gold.png" alt="" className="w-4 h-4 object-contain opacity-75" />
            <span>reel<span className="brand-x-gold">X</span>press · Cinematic Quick Content Platform</span>
          </Link>
        </div>

      </div>
    </footer>
  );
}
