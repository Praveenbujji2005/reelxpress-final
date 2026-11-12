'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ReelXpressWordmark from '@/components/ui/ReelXpressWordmark';

const MENU_LINKS = [
  { label: 'Home', href: '/#hero' },
  { label: 'Price', href: '/#pricing' },
  { label: 'Why Us', href: '/reelxpress' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'Contact Us', href: '/contact' },
];

/**
 * Full-screen Orange & Black Mobile Navigation Overlay
 * - Fixed inset-0 covering 100dvh, z-[100060] above everything
 * - Brand orange gradient (#FF8A2B to #E8590C)
 * - Black ReelXpress wordmark on top-left, 48px circular black close button on top-right
 * - Centered vertical links in #0D0D12 bold uppercase typography with 40ms stagger
 * - "Become a Partner" black pill CTA with #FF7A1A orange text
 */
export default function MobileMenu({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close menu on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow || '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleLinkClick = useCallback(
    (href) => {
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
            if (window.lenis) {
              window.lenis.scrollTo(targetElement, { offset: -20, duration: 1.0 });
            } else {
              targetElement.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }, 220);
      }
    },
    [onClose]
  );

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div
      id="mobile-nav-fullscreen"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      data-lenis-prevent
      className={`fixed inset-0 z-[100060] w-full h-[100dvh] flex flex-col justify-between select-none md:hidden transition-all duration-250 ease-out ${
        isOpen
          ? 'opacity-100 pointer-events-auto visible'
          : 'opacity-0 pointer-events-none invisible'
      }`}
      style={{
        background: 'linear-gradient(160deg, #FF8A2B 0%, #FF7A1A 50%, #E8590C 100%)',
      }}
    >
      {/* =========================================================================
          TOP BAR (Inside Overlay)
          - Respect safe-area-inset-top, 16-24px side padding
          - Black ReelXpress logo on the left
          - 48px circle black button with white X icon on the right
         ========================================================================= */}
      <div className="w-full flex items-center justify-between px-4 sm:px-6 pt-[max(env(safe-area-inset-top),16px)] pb-4 shrink-0 z-20">
        <Link
          href="/"
          onClick={() => handleLinkClick('/#hero')}
          className="flex items-center min-h-[48px] focus-visible:outline-none"
          aria-label="ReelXpress Home"
        >
          {/* Black version of ReelXpress for full readability against orange background */}
          <ReelXpressWordmark
            className="h-7 w-auto align-middle"
            textColor="#0D0D12"
            xColor="#0D0D12"
          />
        </Link>

        {/* 48px Black Circle Close Button with White X */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-[#0D0D12] text-white flex items-center justify-center hover:bg-black active:scale-90 transition-transform cursor-pointer touch-manipulation shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
        >
          <svg
            className="w-5 h-5 fill-none stroke-current"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* =========================================================================
          CENTERED NAVIGATION LINKS
          - Vertically & horizontally centered
          - In order: Home, Price, Why Us, Testimonials, Contact Us, Become a Partner
          - Bold/extra-bold, uppercase, letter-spacing 0.08em, 26-30px, color #0D0D12
          - 40ms stagger slide-up
         ========================================================================= */}
      <nav
        aria-label="Mobile Navigation Links"
        className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-7 px-6 my-auto"
      >
        {MENU_LINKS.map((link, index) => (
          <div
            key={link.label}
            className={`transition-all duration-300 ease-out transform ${
              isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{
              transitionDelay: isOpen ? `${index * 40}ms` : '0ms',
            }}
          >
            <Link
              href={link.href}
              onClick={() => handleLinkClick(link.href)}
              className="min-h-[48px] flex items-center justify-center text-[26px] sm:text-[30px] font-extrabold uppercase tracking-[0.08em] text-[#0D0D12] hover:opacity-80 active:opacity-70 active:underline decoration-[#0D0D12] decoration-[3px] underline-offset-4 transition-all touch-manipulation"
            >
              {link.label}
            </Link>
          </div>
        ))}

        {/* 6. Become a Partner CTA Pill Button */}
        <div
          className={`transition-all duration-300 ease-out transform ${
            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{
            transitionDelay: isOpen ? `${MENU_LINKS.length * 40}ms` : '0ms',
          }}
        >
          <Link
            href="/creators"
            onClick={() => handleLinkClick('/creators')}
            className="inline-flex items-center justify-center min-h-[52px] px-8 py-4 rounded-full bg-[#0D0D12] text-[#FF7A1A] font-extrabold text-sm sm:text-base uppercase tracking-[0.08em] shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:bg-black active:scale-95 transition-transform mt-3 touch-manipulation"
          >
            Become a Partner
          </Link>
        </div>
      </nav>

      {/* Bottom spacer respecting safe-area-inset-bottom */}
      <div className="pb-[max(env(safe-area-inset-bottom),16px)] shrink-0" aria-hidden="true" />
    </div>,
    document.body
  );
}
