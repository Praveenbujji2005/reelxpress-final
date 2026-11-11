'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * Smooth scrolling provider using Lenis for an inertia-style fluid scrolling experience.
 *
 * CRITICAL FIXES FOR IPHONE SAFARI & MOBILE FREEZING:
 * 1. Sets history.scrollRestoration = 'manual' to prevent mobile Safari from restoring scroll
 *    before layout and images have calculated heights.
 * 2. Clears any stuck document.body overflow styles on mount/unmount.
 * 3. On mobile touch devices (iPhone/Android with touch pointer or screens < 768px):
 *    Completely bypasses Lenis virtual scroll & continuous RAF loops so native iOS 120Hz ProMotion
 *    momentum scrolling runs with zero JavaScript contention and zero dropped compositor frames.
 * 4. On desktop: initializes Lenis for smooth fluid scrolling and anchors.
 */
export default function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    // 1. Enforce manual scroll restoration so browser does not jump before DOM hydrates
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      try {
        window.history.scrollRestoration = 'manual';
      } catch {}
    }

    // Safety clear any stuck body scroll-locks on initial mount (unless full-screen loader is active)
    if (typeof document !== 'undefined' && !document.getElementById('reelxpress-pro-loader')) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    // 2. Check if user prefers reduced motion or is on mobile touch device
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isTouchDevice =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);

    // Anchor click handler for smooth in-page navigation (#pricing, #showcase, etc.)
    function handleAnchorClick(e) {
      const link = e.target.closest('a[href*="#"]');
      if (!link) return;

      const rawHref = link.getAttribute('href');
      if (!rawHref) return;

      let hash = '';
      if (rawHref.startsWith('#')) {
        hash = rawHref;
      } else if (
        rawHref.startsWith('/#') &&
        (typeof window !== 'undefined' &&
          (window.location.pathname === '/' || window.location.pathname === ''))
      ) {
        hash = rawHref.substring(1);
      }

      if (!hash || hash === '#') return;

      try {
        const targetElement = document.querySelector(hash);
        if (targetElement) {
          e.preventDefault();
          const header = document.querySelector('header');
          const headerOffset = header ? header.offsetHeight + 24 : 88;

          if (window.lenis && typeof window.lenis.scrollTo === 'function' && !isTouchDevice) {
            window.lenis.scrollTo(targetElement, {
              offset: -headerOffset,
              duration: 1.2,
            });
          } else {
            const elPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
              top: elPosition - headerOffset,
              behavior: 'smooth',
            });
          }

          if (window.history.pushState) {
            window.history.pushState(null, '', hash);
          }
        }
      } catch {}
    }

    document.addEventListener('click', handleAnchorClick);

    // If on mobile touch device or reduced motion, do not spin up Lenis RAF loop
    if (prefersReducedMotion || isTouchDevice) {
      // Safe fallback stub so any external window.lenis calls don't crash
      window.lenis = {
        scrollTo: (target, opts) => {
          const el = typeof target === 'string' ? document.querySelector(target) : target;
          if (el) {
            const header = document.querySelector('header');
            const offset = (opts?.offset ?? (header ? -header.offsetHeight - 24 : -88));
            const pos = el.getBoundingClientRect().top + window.pageYOffset + offset;
            window.scrollTo({ top: pos, behavior: 'smooth' });
          }
        },
        start: () => {},
        stop: () => {},
        resize: () => {},
      };

      return () => {
        document.removeEventListener('click', handleAnchorClick);
        window.lenis = null;
        if (typeof document !== 'undefined') {
          document.body.style.overflow = '';
        }
      };
    }

    // 3. Desktop: Initialize Lenis instance
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.0,
      infinite: false,
    });

    lenisRef.current = lenis;
    window.lenis = lenis;

    // 4. Connect Lenis to requestAnimationFrame loop
    let rafId;
    let isRunning = true;
    function raf(time) {
      if (!isRunning) return;
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // 5. Refresh Lenis height calculations after window fully loads and after resize
    const handleWindowLoad = () => {
      lenis.resize();
    };
    window.addEventListener('load', handleWindowLoad);
    window.addEventListener('resize', handleWindowLoad, { passive: true });

    const timer1 = setTimeout(() => lenis.resize(), 500);
    const timer2 = setTimeout(() => lenis.resize(), 1500);

    return () => {
      isRunning = false;
      clearTimeout(timer1);
      clearTimeout(timer2);
      cancelAnimationFrame(rafId);
      window.removeEventListener('load', handleWindowLoad);
      window.removeEventListener('resize', handleWindowLoad);
      document.removeEventListener('click', handleAnchorClick);
      try {
        lenis.destroy();
      } catch {}
      window.lenis = null;
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, []);

  return <>{children}</>;
}
