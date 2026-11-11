'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Floating bottom-left CTA buttons with full crystal-clear glassmorphism, visible starting from the pricing section
export default function FloatingActionButtons() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;
    const pricingEl = document.getElementById('pricing');

    // If there is no pricing section on the current page, show by default
    if (!pricingEl) {
      setIsVisible(true);
      return;
    }

    const checkVisibility = (rect) => {
      const isAtOrPast = rect.top <= window.innerHeight * 0.85;
      setIsVisible(isAtOrPast);
    };

    // Native IntersectionObserver for instant, butter-smooth scroll tracking with Lenis
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isAtOrPast = entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight * 0.85;
          setIsVisible(isAtOrPast);
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -15% 0px',
        threshold: [0, 0.05, 0.1],
      }
    );

    observer.observe(pricingEl);

    // Initial check
    checkVisibility(pricingEl.getBoundingClientRect());

    // Backup scroll listeners
    const handleScroll = () => {
      checkVisibility(pricingEl.getBoundingClientRect());
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleBookClick = (e) => {
    e.preventDefault();
    const bookingEl =
      document.getElementById('booking-form') ||
      document.getElementById('booking');

    if (bookingEl) {
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.scrollTo(bookingEl, { offset: -60, duration: 1.2 });
      } else {
        bookingEl.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = '/#booking';
    }
  };

  if (pathname?.startsWith('/admin')) return null;

  return (
    <aside
      aria-label="Floating Quick Actions"
      data-lenis-prevent
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        visibility: isVisible ? 'visible' : 'hidden',
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
      }}
      className={`floating-overlay-container fixed bottom-4 sm:bottom-6 left-3 sm:left-6 flex flex-col gap-2.5 sm:gap-3 select-none w-[240px] sm:w-[295px] max-w-[calc(100vw-92px)] sm:max-w-none z-[99990] transition-all duration-300 ease-out ${
        isVisible
          ? 'is-visible opacity-100 translate-y-0 pointer-events-auto'
          : 'is-hidden opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      {/* 1. Primary Button: Book reelXpress Now (Crystal Clear Glassmorphism, Zero Colors) */}
      <a
        href="/#booking"
        onClick={handleBookClick}
        aria-label="Book reelXpress Now"
        className="group relative flex items-center justify-between gap-3 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full text-white font-semibold text-sm sm:text-[15px] tracking-tight transition-all duration-200 cursor-pointer overflow-hidden bg-[#181418]/95 hover:bg-[#201a20] active:bg-[#241d24] border border-white/20 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-95"
      >
        {/* Subtle shine sweep on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

        <span className="whitespace-nowrap font-sans text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          Book reelXpress Now
        </span>

        {/* Circular Arrow Badge - Crystal Glass Circle */}
        <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0 border border-white/25 group-hover:bg-white/25 group-hover:scale-105 transition-all duration-200 shadow-inner">
          <svg
            className="w-4 h-4 text-white fill-none stroke-current stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H9M17 7V15" />
          </svg>
        </div>
      </a>

      {/* 2. Secondary Button: Become a Creator (Crystal Clear Glassmorphism, Zero Colors) */}
      <Link
        href="/creators"
        aria-label="Become a Creator"
        className="group relative flex items-center justify-center px-5 sm:px-6 py-3 sm:py-3.5 rounded-full text-white font-semibold text-sm sm:text-[15px] tracking-tight transition-all duration-200 cursor-pointer overflow-hidden bg-[#181418]/95 hover:bg-[#201a20] active:bg-[#241d24] border border-white/20 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-95 text-center"
      >
        {/* Subtle shine sweep on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

        <span className="whitespace-nowrap font-sans text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          Become a Creator
        </span>
      </Link>
    </aside>
  );
}
