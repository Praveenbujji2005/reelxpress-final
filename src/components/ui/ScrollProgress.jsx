'use client';

import { useEffect } from 'react';

// Top hardware-accelerated progress bar tracking page scroll depth
// Uses direct DOM transform updates to eliminate 120Hz React state re-renders during mobile scrolling
export default function ScrollProgress() {
  useEffect(() => {
    const el = document.getElementById('scroll-progress');
    if (!el) return;

    let ticking = false;

    function updateProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
      if (el) {
        el.style.transform = `scaleX(${progress})`;
      }
      ticking = false;
    }

    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      id="scroll-progress"
      style={{ transform: 'scaleX(0)' }}
      aria-hidden="true"
    />
  );
}
