'use client';

import { useEffect } from 'react';

/**
 * High-Performance Scroll Reveal Hook
 *
 * Triggers smooth fade-in and slide-up animations as elements scroll into view
 * on both mobile and desktop viewports.
 * - Immediately reveals elements visible above the fold on initial paint.
 * - Uses IntersectionObserver with a gentle negative bottom rootMargin so elements
 *   gracefully slide up and fade in as they enter the viewport.
 * - Respects prefers-reduced-motion.
 */
export function useScrollReveal() {
  useEffect(() => {
    // Check user's motion preferences
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      document.documentElement.classList.add('js-ready');
      document
        .querySelectorAll('.reveal-on-scroll, .reveal-scale-on-scroll')
        .forEach((el) => {
          el.classList.add('is-revealed');
          el.setAttribute('data-revealed', 'true');
        });
      return;
    }

    document.documentElement.classList.add('js-ready');

    const revealElements = Array.from(
      document.querySelectorAll('.reveal-on-scroll, .reveal-scale-on-scroll')
    );

    if (!revealElements.length) return;

    const markRevealed = (el) => {
      if (!el) return;
      el.classList.add('is-revealed');
      el.setAttribute('data-revealed', 'true');
    };

    // 1. Immediately reveal elements already in the viewport on initial paint (Hero & Above-the-fold)
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    revealElements.forEach((el) => {
      if (el.closest('#hero')) {
        markRevealed(el);
        return;
      }
      try {
        const rect = el.getBoundingClientRect();
        // If element is already in the viewport on initial page load
        if (rect.top < vh * 0.9 && rect.bottom > 0) {
          markRevealed(el);
        }
      } catch {}
    });

    // 2. Observer for remaining elements to reveal on scroll
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              markRevealed(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -40px 0px',
        }
      );

      revealElements.forEach((el) => {
        if (!el.classList.contains('is-revealed') && el.getAttribute('data-revealed') !== 'true') {
          observer.observe(el);
        }
      });

      return () => {
        observer.disconnect();
      };
    } else {
      // Fallback for browsers without IntersectionObserver
      revealElements.forEach(markRevealed);
    }
  }, []);
}
