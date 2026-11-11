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

      {/* Drawer */}
      <div
        id="mobile-menu-drawer"
        data-lenis-prevent
        className={`fixed inset-x-0 top-0 z-[100025] p-3 sm:p-4 max-h-[92vh] max-h-[92dvh] overflow-y-auto transform transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-y-0 pointer-events-auto' : '-translate-y-full pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Drawer"
      >
        <div className="rounded-3xl bg-[#161217]/98 border border-white/15 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <Link
              href="/"
              onClick={() => handleLinkClick('/')}
              className="flex items-center min-h-[44px]"
              aria-label={`${SITE_CONFIG.name} Home`}
            >
              <ReelXpressWordmark className="h-7 w-auto align-middle drop-shadow-[0_0_12px_rgba(255,94,30,0.4)]" />
            </Link>

            {/* 48x48px touch target close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Menu"
              className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-text-muted hover:text-white active:scale-90 cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
            >
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => handleLinkClick(link.href)}
                className="text-base font-bold text-white hover:text-primary-container active:bg-white/5 rounded-xl px-3 py-3 border-b border-white/5 flex items-center justify-between min-h-[48px] touch-manipulation transition-colors"
              >
                <span>{link.label}</span>
                <svg className="w-4 h-4 text-white/40 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}

            <a
              href="/#booking"
              onClick={() => handleLinkClick('/#booking')}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full btn-glow-orange font-bold text-base mt-3 cursor-pointer min-h-[48px] touch-manipulation"
            >
              <span>Book Now</span>
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
