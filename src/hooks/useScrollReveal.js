'use client';

import { useEffect } from 'react';

/**
 * Bulletproof Scroll Reveal Hook for High-Performance Mobile & Desktop Scrolling
 *
 * Designed specifically for iOS Safari momentum scrolling and 120Hz ProMotion:
 * 1. Immediately reveals any elements within initial 1.5x viewport height on mount.
 * 2. Uses a generous 350px rootMargin so off-screen elements are pre-revealed long before
 *    the user scrolls into them, eliminating empty/blank screen gaps.
 * 3. Includes a dual safety fallback timer (350ms and 1200ms) that guarantees no section
 *    can ever remain permanently hidden or stuck at opacity: 0 under throttled mobile conditions.
 */
export function useScrollReveal() {
  useEffect(() => {
    // Flag the document so CSS transitions take effect smoothly
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

    // On mobile touch devices: immediately reveal everything with 0 observers to eliminate WebKit lag
    const isMobile =
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches));

    if (isMobile) {
      revealElements.forEach(markRevealed);
      return;
    }
    const initialCutoff = (typeof window !== 'undefined' ? window.innerHeight : 900) * 1.5;
    revealElements.forEach((el) => {
      if (el.closest('#hero') || el.closest('#showcase')) {
        markRevealed(el);
        return;
      }
      try {
        const rect = el.getBoundingClientRect();
        if (rect.top <= initialCutoff) {
          markRevealed(el);
        }
      } catch {}
    });

    // 2. High-performance IntersectionObserver with generous 350px rootMargin
    let observer = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              markRevealed(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.01,
          rootMargin: '350px 0px 350px 0px',
        }
      );

      revealElements.forEach((el) => {
        if (!el.classList.contains('is-revealed') && el.getAttribute('data-revealed') !== 'true') {
          observer.observe(el);
        }
      });
    } else {
      revealElements.forEach(markRevealed);
    }

    // 3. Fast safety fallback (350ms): reveal elements within 2.5x viewport height
    const fastTimer = setTimeout(() => {
      const fastCutoff = (typeof window !== 'undefined' ? window.innerHeight : 900) * 2.5;
      revealElements.forEach((el) => {
        if (!el.classList.contains('is-revealed')) {
          try {
            const rect = el.getBoundingClientRect();
            if (rect.top <= fastCutoff) {
              markRevealed(el);
              observer?.unobserve(el);
            }
          } catch {}
        }
      });
    }, 350);

    // 4. Guaranteed complete fallback (1200ms): unconditionally reveal all elements
    // Guarantees zero blank spaces on any mobile device even if observer callbacks are paused during fling-scroll
    const guaranteedTimer = setTimeout(() => {
      revealElements.forEach(markRevealed);
      observer?.disconnect();
    }, 1200);

    return () => {
      clearTimeout(fastTimer);
      clearTimeout(guaranteedTimer);
      observer?.disconnect();
    };
  }, []);
}
