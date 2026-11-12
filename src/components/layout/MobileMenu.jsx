'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { NAV_LINKS } from '@/lib/data';
import { SITE_CONFIG } from '@/config/site';
import ReelXpressWordmark from '@/components/ui/ReelXpressWordmark';

/**
 * Slide-down mobile navigation drawer with backdrop, scroll-lock and high-contrast touch targets
 */
export default function MobileMenu({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Lock body scroll when mobile menu is open to prevent background scrolling, restore cleanly
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleLinkClick = (href) => {
    onClose();

    if (typeof window === 'undefined') return;

    let targetSelector = null;
    if (href.startsWith('#')) {
      targetSelector = href;
    } else if (href.startsWith('/#')) {
      targetSelector = href.substring(1);
    }

    if (targetSelector) {
      setTimeout(() => {
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
          const header = document.querySelector('header');
          const headerOffset = header ? header.offsetHeight + 24 : 88;
          if (window.lenis) {
            window.lenis.scrollTo(targetElement, { offset: -headerOffset, duration: 1.0 });
          } else {
            const y = targetElement.getBoundingClientRect().top + window.pageYOffset - headerOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }
      }, 180);
    }
  };

  if (!mounted) return null;

  const content = (
    <>
      {/* Dimmed backdrop positioned above all floating widgets */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100020] bg-black/75 backdrop-blur-md md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Full-width Menu Sheet */}
      <div
        id="mobile-menu-drawer"
        data-lenis-prevent
        className={`fixed inset-x-0 top-0 z-[100025] w-full max-h-[100svh] overflow-y-auto bg-[#0b090c]/98 border-b border-white/15 backdrop-blur-2xl shadow-2xl transition-transform duration-300 md:hidden pt-[env(safe-area-inset-top)] pb-6 px-4 ${
          isOpen ? 'translate-y-0 pointer-events-auto' : '-translate-y-full pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
      >
        <div className="w-full max-w-[1600px] mx-auto">
          {/* Header inside sheet: Logo left, Close right (height 56px matching navbar) */}
          <div className="h-14 flex items-center justify-between border-b border-white/10 pb-1">
            <Link
              href="/"
              onClick={() => handleLinkClick('/')}
              className="flex items-center min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container rounded-lg"
              aria-label={`${SITE_CONFIG.name} Home`}
            >
              <ReelXpressWordmark className="h-6 w-auto drop-shadow-[0_0_12px_rgba(255,94,30,0.35)]" />
            </Link>

            {/* At least 44x44px close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg text-white/80 hover:text-white active:scale-95 transition-all flex items-center justify-center cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
            >
              <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links (each min 48px height using next/link) */}
          <nav className="flex flex-col pt-3 pb-2 divide-y divide-white/5" aria-label="Mobile Navigation Links">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => handleLinkClick(link.href)}
                className="h-12 min-h-[48px] flex items-center justify-between text-[15px] font-semibold text-white/90 hover:text-white active:bg-white/5 px-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
              >
                <span>{link.label}</span>
                <svg className="w-4 h-4 text-white/40 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}

            {/* Last Item: "Book your reel" using next/link */}
            <div className="pt-3 border-none">
              <Link
                href="/#booking"
                onClick={() => handleLinkClick('/#booking')}
                className="w-full h-12 min-h-[48px] rounded-2xl bg-gradient-to-r from-[#EA5A2B] to-[#F0A04B] text-white font-bold text-base flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(234,90,43,0.35)] active:scale-[0.98] transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A04B] cursor-pointer"
              >
                <span>Book your reel</span>
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
