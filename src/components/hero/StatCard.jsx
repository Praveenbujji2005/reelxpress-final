'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * StatCard Component with Smooth Increasing Count-Up Animation
 *
 * Glassmorphic stat card matching project theme:
 * - Smooth IntersectionObserver-triggered count-up animation
 * - Ease-out exponential deceleration for a luxury dynamic feel
 * - High-contrast bold numeric values with subtle amber/gold glow
 * - Uppercase letter-spaced muted descriptor
 * - Star icon badge for rating
 */
export default function StatCard({ value, label, hasStar = false }) {
  const cardRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(value);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    // Respect user's motion preferences
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      return;
    }

    // Parse the value string (e.g., '45,000+', '5,000+', '4.8')
    const str = String(value).trim();
    const hasPlus = str.endsWith('+');
    const cleaned = str.replace(/[^\d.]/g, '');
    const isFloat = cleaned.includes('.');
    const targetNumber = parseFloat(cleaned);

    if (isNaN(targetNumber)) {
      setDisplayValue(value);
      return;
    }

    if (hasAnimatedRef.current) {
      setDisplayValue(value);
      return;
    }

    // Set initial 0 display
    setDisplayValue(isFloat ? '0.0' : hasPlus ? '0+' : '0');

    let animationFrameId;

    const startCountUp = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;

      const duration = 1800; // 1.8 seconds smooth count up
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out exponential deceleration
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = targetNumber * ease;

        if (progress < 1) {
          if (isFloat) {
            setDisplayValue(currentVal.toFixed(1) + (hasPlus ? '+' : ''));
          } else {
            setDisplayValue(Math.floor(currentVal).toLocaleString('en-US') + (hasPlus ? '+' : ''));
          }
          animationFrameId = requestAnimationFrame(updateCounter);
        } else {
          setDisplayValue(value);
        }
      };

      animationFrameId = requestAnimationFrame(updateCounter);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          observer.disconnect();
          startCountUp();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value]);

  return (
    <div
      ref={cardRef}
      className="spotlight-card rounded-2xl bg-[#110e13] border border-white/10 p-4 sm:p-5 md:p-6 text-center shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:border-border-amber transition-all duration-300 group hover:-translate-y-1"
    >
      <div className="flex items-center justify-center gap-1.5 text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-1 tabular-nums">
        <span>{displayValue}</span>
        {hasStar && (
          <span
            className="material-symbols-outlined text-primary-container text-xl sm:text-2xl drop-shadow-[0_0_8px_rgba(255,94,30,0.65)]"
            data-weight="fill"
            aria-hidden="true"
          >
            star
          </span>
        )}
      </div>
      <div className="text-[11px] sm:text-xs md:text-sm font-semibold text-text-muted uppercase tracking-wider group-hover:text-primary transition-colors">
        {label}
      </div>
    </div>
  );
}
