'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import QuickContactModal from '@/components/ui/QuickContactModal';
import { SITE_CONFIG } from '@/config/site';
import ReelXpressWordmark from '@/components/ui/ReelXpressWordmark';

/**
 * Responsive Navbar Component
 *
 * - Compact pill footprint (w-fit mx-auto)
 * - 100% solid matte dark pill background with crisp border
 * - Left links: Pricing, ReelXpress
 * - Center: Official orange 'X' logo mark
 * - Right links: Real work, Contact
 * - Mobile responsive: perfectly centered logo with accessible hamburger drawer trigger
 */
export default function Navbar({ onOpenMobileMenu, isMobileMenuOpen = false }) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  // Listen for global custom events to open the contact modal
  useEffect(() => {
    const handleOpen = () => setIsContactModalOpen(true);
    window.addEventListener('open-contact-modal', handleOpen);
    return () => window.removeEventListener('open-contact-modal', handleOpen);
  }, []);

  // Hero-only visibility: Disappear completely once the Hero section exits the viewport
  useEffect(() => {
    const heroEl = document.getElementById('hero');
    if (!heroEl) {
      // Subpages without #hero keep navbar visible at top
      setIsHeroVisible(true);
      return;
    }

    const checkHeroVisibility = () => {
      const rect = heroEl.getBoundingClientRect();
      // Hero is considered active as long as its main content hasn't exited the top viewport
      const inView = rect.bottom > 160;
      setIsHeroVisible(inView);
    };

    // Run initial check
    checkHeroVisibility();

    // IntersectionObserver for efficient viewport monitoring
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsHeroVisible(entry.isIntersecting && entry.boundingClientRect.bottom > 160);
        });
      },
      { root: null, threshold: [0, 0.05, 0.1] }
    );

    observer.observe(heroEl);

    // Passive scroll listener for instantaneous response on high-frequency mobile fling gestures
    window.addEventListener('scroll', checkHeroVisibility, { passive: true });
    window.addEventListener('resize', checkHeroVisibility, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', checkHeroVisibility);
      window.removeEventListener('resize', checkHeroVisibility);
    };
  }, []);

  return (
    <>
      <header
        style={{
          opacity: isHeroVisible ? 1 : 0,
          transform: isHeroVisible ? 'translateY(0)' : 'translateY(-28px)',
          visibility: isHeroVisible ? 'visible' : 'hidden',
          pointerEvents: isHeroVisible ? 'auto' : 'none',
        }}
        className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 w-full flex justify-center transition-all duration-300 ease-out"
        aria-hidden={!isHeroVisible}
      >
        <div
          className="rounded-full px-4 sm:px-7 py-2 sm:py-2.5 flex items-center justify-between gap-4 sm:gap-8 bg-[#110e13]/95 border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.8)] select-none transition-all duration-200"
          role="navigation"
          aria-label="Main Navigation"
        >
          {/* =====================================================================
              LEFT WING: Desktop Links (Pricing, Services) / Mobile Spacer
             ===================================================================== */}
          <div className="flex items-center">
            {/* Desktop Left Nav Links */}
            <nav className="hidden md:flex items-center gap-6 sm:gap-7 text-xs sm:text-[13px] font-semibold text-white/85">
              <Link
                href="/#pricing"
                className="hover:text-white transition-colors py-0.5 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary-container hover:after:w-full after:transition-all after:duration-200"
              >
                Pricing
              </Link>
              <Link
                href="/reelxpress"
                className="hover:text-white transition-colors py-0.5 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary-container hover:after:w-full after:transition-all after:duration-200"
              >
                Why us
              </Link>
            </nav>

            {/* Mobile Left Spacer to keep center logo perfectly balanced (matching hamburger button footprint) */}
            <div className="w-10 h-10 min-w-[40px] md:hidden opacity-0 pointer-events-none shrink-0" aria-hidden="true" />
          </div>

          {/* =====================================================================
              CENTER: Official Brand Wordmark (Crisp Text + Orange 'X' Icon)
             ===================================================================== */}
          <div className="shrink-0 flex items-center justify-center px-1 sm:px-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center group select-none py-1 min-w-[44px] min-h-[44px] transition-transform duration-200 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container rounded-full"
              aria-label={`${SITE_CONFIG.name} Home`}
            >
              <ReelXpressWordmark className="h-6 sm:h-7 w-auto align-middle drop-shadow-[0_0_14px_rgba(255,94,30,0.45)] transition-transform duration-200 group-hover:scale-105" />
            </Link>
          </div>

          {/* =====================================================================
              RIGHT WING: Desktop Links (Real work, Contact) / Mobile Hamburger
             ===================================================================== */}
          <div className="flex items-center">
            {/* Desktop Right Nav Links */}
            <nav className="hidden md:flex items-center gap-6 sm:gap-7 text-xs sm:text-[13px] font-semibold text-white/85">
              <Link
                href="/#showcase"
                className="hover:text-white transition-colors py-0.5 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary-container hover:after:w-full after:transition-all after:duration-200"
              >
                Real work
              </Link>
              <Link
                href="/contact"
                className="hover:text-white transition-colors py-0.5 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary-container hover:after:w-full after:transition-all after:duration-200"
              >
                Contact
              </Link>
            </nav>

            {/* Mobile Hamburger Trigger */}
            <button
              type="button"
              onClick={onOpenMobileMenu}
              aria-label="Menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-fullscreen"
              className="md:hidden flex items-center justify-center w-10 h-10 min-w-[40px] text-white hover:text-primary-container active:scale-90 transition-colors cursor-pointer shrink-0 touch-manipulation focus-visible:outline-none"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Quick Contact Form Modal */}
      <QuickContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}
