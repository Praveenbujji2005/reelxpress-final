import Link from 'next/link';
import { FOOTER_NAV_LINKS, FOOTER_LEGAL_LINKS } from '@/lib/data';
import ReelXpressWordmark from '@/components/ui/ReelXpressWordmark';

// Shared website footer with branding, internal navigation, legal links, and copyright
export default function Footer() {
  return (
    <footer className="bg-[#080808] text-primary full-width border-t border-white/10 relative z-20 overflow-hidden">
      <div className="w-full px-4 sm:px-6 md:px-margin max-w-[1440px] mx-auto py-12 sm:py-16 md:py-space-2xl flex flex-col justify-between gap-10 sm:gap-14">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group" aria-label="reelXpress Home">
              <ReelXpressWordmark className="h-8 sm:h-9 w-auto align-middle drop-shadow-[0_0_16px_rgba(255,94,30,0.4)] transition-transform duration-300 group-hover:scale-105" />
            </Link>
            <p className="text-body-sm font-body-sm text-text-muted leading-relaxed mb-6">
              The intersection of speed and cinema. On-demand video production for the modern era.
            </p>
          </div>

          {/* Navigation & Legal Links Columns (side-by-side on all screens) */}
          <div className="grid grid-cols-2 gap-6 sm:gap-14 w-full sm:w-auto">
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


        {/* Copyright Notice */}
        <div className="pt-4 border-t border-border-specular/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-body-sm font-body-sm text-text-muted">
          <div>
            Copyright © 2026 by QUANTELLOVENTURES PRIVATE LIMITED. All rights reserved.
          </div>
          <Link href="/#why-us" className="flex items-center gap-2 text-label-sm font-label-sm text-text-muted/80 hover:text-white transition-colors">
            <img src="/brand/icon-gold.png" alt="" className="w-4 h-4 object-contain opacity-75" />
            <span>reel<span className="brand-x-gold">X</span>press · Cinematic Quick Content Platform</span>
          </Link>
        </div>

      </div>

      {/* Large Subtle Watermark Background Signature */}
      <div
        className="w-full overflow-hidden flex justify-center items-center pointer-events-none select-none -mb-6 sm:-mb-10 md:-mb-14 pt-2 relative z-0"
        aria-hidden="true"
      >
        <span className="text-[14vw] font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent whitespace-nowrap">
          reelXpress
        </span>
      </div>
    </footer>
  );
}
