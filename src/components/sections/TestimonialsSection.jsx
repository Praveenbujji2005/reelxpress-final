'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import TestimonialCard from './TestimonialCard';
import { ROW_1_TESTIMONIALS, ROW_2_TESTIMONIALS } from '@/lib/data';
import { getTestimonials, getCachedTestimonials } from '@/lib/cmsServices';

/**
 * TestimonialsSection Component
 *
 * Adaptive Architecture:
 * - Desktop (>= 768px): Full-width dual-row seamless infinite marquee (left & right)
 * - Mobile (< 768px): Touch-swipeable interactive card carousel with pagination dots & arrows
 *   eliminates cut-off cards, text truncation, and WebKit GPU tile memory exhaustion on iPhone.
 */

// SKELETON PLACEHOLDER FOR TESTIMONIAL CARDS
function TestimonialCardSkeleton() {
  return (
    <div className="w-[260px] xs:w-[280px] sm:w-[304px] md:w-[323px] h-[200px] rounded-2xl p-4 sm:p-5 md:p-6 bg-[#161217] border border-white/10 flex flex-col justify-between ambient-skeleton shrink-0 shadow-lg">
      <div>
        <div className="flex gap-1.5 mb-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={`skel-star-${s}`} className="w-3.5 h-3.5 rounded-full bg-white/10 ambient-pulse" />
          ))}
        </div>
        <div className="w-full h-3.5 rounded bg-white/10 mb-2 ambient-pulse" />
        <div className="w-5/6 h-3.5 rounded bg-white/10 mb-2 ambient-pulse" />
        <div className="w-3/5 h-3.5 rounded bg-white/5 ambient-pulse" />
      </div>
      <div className="flex items-center gap-3 pt-3 border-t border-white/5">
        <div className="w-10 h-10 rounded-full bg-white/10 shrink-0 ambient-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="w-28 h-3.5 rounded bg-white/10 ambient-pulse" />
          <div className="w-20 h-3 rounded bg-white/5 ambient-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [row1, setRow1] = useState(ROW_1_TESTIMONIALS);
  const [row2, setRow2] = useState(ROW_2_TESTIMONIALS);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Mobile Carousel State
  const [mobileIndex, setMobileIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    // 1. Instant check from cache for 0ms initial render
    const cached = getCachedTestimonials();
    if (cached && cached.length > 0) {
      const active = cached.filter((t) => t.enabled !== false);
      if (active.length > 0) {
        const mid = Math.ceil(active.length / 2);
        setRow1(active.slice(0, mid));
        setRow2(active.slice(mid).length > 0 ? active.slice(mid) : active.slice(0, mid));
        setIsLoading(false);
      }
    }

    // 2. Fetch fresh testimonials in background
    getTestimonials()
      .then((data) => {
        if (data && data.length > 0) {
          const active = data.filter((t) => t.enabled !== false);
          if (active.length > 0) {
            const mid = Math.ceil(active.length / 2);
            setRow1(active.slice(0, mid));
            setRow2(active.slice(mid).length > 0 ? active.slice(mid) : active.slice(0, mid));
          }
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    // 3. React to live Admin updates
    const handleCmsUpdate = (e) => {
      if (!e.detail?.type || e.detail.type === 'testimonials') {
        getTestimonials({ forceRefresh: true }).then((data) => {
          if (data && data.length > 0) {
            const active = data.filter((t) => t.enabled !== false);
            if (active.length > 0) {
              const mid = Math.ceil(active.length / 2);
              setRow1(active.slice(0, mid));
              setRow2(active.slice(mid).length > 0 ? active.slice(mid) : active.slice(0, mid));
            }
          }
        });
      }
    };
    window.addEventListener('cms-cache-invalidated', handleCmsUpdate);
    return () => window.removeEventListener('cms-cache-invalidated', handleCmsUpdate);
  }, []);

  // Pause animations when browser tab is inactive to preserve battery & CPU
  useEffect(() => {
    const handleVisibility = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const allReviews = [...row1, ...row2];
  const totalMobile = allReviews.length || 1;

  // Auto-advance mobile carousel every 5s if not paused
  useEffect(() => {
    if (isPaused || isLoading || totalMobile <= 1) return;
    const timer = setInterval(() => {
      setMobileIndex((prev) => (prev + 1) % totalMobile);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, isLoading, totalMobile]);

  const nextMobile = useCallback(() => {
    setMobileIndex((prev) => (prev + 1) % totalMobile);
  }, [totalMobile]);

  const prevMobile = useCallback(() => {
    setMobileIndex((prev) => (prev - 1 + totalMobile) % totalMobile);
  }, [totalMobile]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        nextMobile();
      } else {
        prevMobile();
      }
    }
  };

  // Minimal duplication for seamless desktop infinite marquee loop
  const topRowList = row1.length <= 3 ? [...row1, ...row1] : row1;
  const bottomRowList = row2.length <= 3 ? [...row2, ...row2] : row2;

  const currentMobileReview = allReviews[mobileIndex] || allReviews[0] || {};

  return (
    <section
      className="py-16 md:py-space-2xl overflow-hidden relative select-none scroll-mt-20 md:scroll-mt-28"
      id="testimonials"
      aria-label="Client Testimonials"
    >
      {/* Section Header */}
      <div className="reveal-on-scroll text-center max-w-3xl mx-auto mb-10 md:mb-16 px-4 sm:px-6">
        <span className="text-primary text-label-md font-label-md uppercase tracking-wider block mb-2 font-bold">
          TESTIMONIALS
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-headline-lg font-headline-lg text-text-primary tracking-tight">
          Insights from Satisfied Clients
        </h2>
        <p className="text-body-md font-body-md text-text-muted mt-3 max-w-2xl mx-auto leading-relaxed">
          Hear from our diverse community of clients who experienced the magic of instant video delivery. From weddings to business launches, see how we&apos;re revolutionizing event coverage with same-day professional reels.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4 sm:space-y-6 px-4 max-w-md mx-auto md:max-w-none">
          <div className="flex gap-4 justify-center overflow-hidden">
            {[1, 2, 3].map((n) => (
              <TestimonialCardSkeleton key={`skel-row1-${n}`} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* =========================================================================
              MOBILE INTERACTIVE CAROUSEL (< 768px):
              - Perfectly centered card with zero clipping
              - Touch swipe gestures (left / right)
              - Prev / Next buttons
              - Pagination indicator dots
              - Eliminates WebKit tile memory exhaustion and clipped cards
             ========================================================================= */}
          <div className="block md:hidden px-4 max-w-md mx-auto">
            <div
              className="relative touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div
                key={`mobile-${currentMobileReview.id || mobileIndex}`}
                className="w-full fade-in-content"
              >
                <TestimonialCard
                  name={currentMobileReview.name}
                  role={currentMobileReview.role}
                  quote={currentMobileReview.quote || currentMobileReview.review}
                  review={currentMobileReview.review || currentMobileReview.quote}
                  rating={currentMobileReview.rating}
                />
              </div>
            </div>

            {/* Mobile Controls: Prev, Pagination Dots, Next */}
            <div className="flex items-center justify-between mt-5 px-2">
              <button
                onClick={prevMobile}
                aria-label="Previous testimonial"
                className="w-10 h-10 rounded-full bg-[#181216] border border-white/15 text-white flex items-center justify-center hover:bg-primary-container hover:border-primary-container active:scale-95 transition-all shadow-md cursor-pointer touch-manipulation"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
              </button>

              {/* Dots */}
              <div className="flex items-center gap-1.5 py-1">
                {allReviews.map((_, dotIdx) => (
                  <button
                    key={`dot-${dotIdx}`}
                    onClick={() => setMobileIndex(dotIdx)}
                    aria-label={`Go to review ${dotIdx + 1}`}
                    className="p-1 cursor-pointer touch-manipulation"
                  >
                    <span
                      className={`block rounded-full transition-all duration-200 ${
                        dotIdx === mobileIndex
                          ? 'w-5 h-2 bg-primary-container shadow-[0_0_8px_rgba(255,109,41,0.7)]'
                          : 'w-2 h-2 bg-white/25 hover:bg-white/50'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={nextMobile}
                aria-label="Next testimonial"
                className="w-10 h-10 rounded-full bg-[#181216] border border-white/15 text-white flex items-center justify-center hover:bg-primary-container hover:border-primary-container active:scale-95 transition-all shadow-md cursor-pointer touch-manipulation"
              >
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* =========================================================================
              DESKTOP DUAL-ROW MARQUEE (>= 768px):
              - Preserves original aesthetic on tablet and desktop screens
              - Seamless infinite marquee scrolling left and right
              - Edge gradient masks
             ========================================================================= */}
          <div className="hidden md:block relative w-full overflow-hidden">
            {/* Edge Gradient Masks for Smooth Fade Out */}
            <div
              className="absolute left-0 inset-y-0 w-24 md:w-40 bg-gradient-to-r from-background via-background/70 to-transparent z-10 pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute right-0 inset-y-0 w-24 md:w-40 bg-gradient-to-l from-background via-background/70 to-transparent z-10 pointer-events-none"
              aria-hidden="true"
            />

            <div className="space-y-4 sm:space-y-6 fade-in-content">
              {/* ROW 1: Scrolling LEFT */}
              <div className="testimonials-marquee-row flex overflow-hidden w-full testimonials-mask-fade">
                <div
                  className="animate-marquee-left flex items-stretch shrink-0 gap-4 sm:gap-6 pr-4 sm:pr-6"
                  style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                >
                  {topRowList.map((item, idx) => (
                    <TestimonialCard
                      key={`row1-primary-${item.id}-${idx}`}
                      name={item.name}
                      role={item.role}
                      quote={item.quote || item.review}
                      review={item.review || item.quote}
                      rating={item.rating}
                    />
                  ))}
                </div>

                <div
                  className="animate-marquee-left flex items-stretch shrink-0 gap-4 sm:gap-6 pr-4 sm:pr-6"
                  style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                  aria-hidden="true"
                >
                  {topRowList.map((item, idx) => (
                    <TestimonialCard
                      key={`row1-dup-${item.id}-${idx}`}
                      name={item.name}
                      role={item.role}
                      quote={item.quote || item.review}
                      review={item.review || item.quote}
                      rating={item.rating}
                    />
                  ))}
                </div>
              </div>

              {/* ROW 2: Scrolling RIGHT */}
              <div className="testimonials-marquee-row flex overflow-hidden w-full testimonials-mask-fade">
                <div
                  className="animate-marquee-right-slow flex items-stretch shrink-0 gap-4 sm:gap-6 pr-4 sm:pr-6"
                  style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                >
                  {bottomRowList.map((item, idx) => (
                    <TestimonialCard
                      key={`row2-primary-${item.id}-${idx}`}
                      name={item.name}
                      role={item.role}
                      quote={item.quote || item.review}
                      review={item.review || item.quote}
                      rating={item.rating}
                    />
                  ))}
                </div>

                <div
                  className="animate-marquee-right-slow flex items-stretch shrink-0 gap-4 sm:gap-6 pr-4 sm:pr-6"
                  style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                  aria-hidden="true"
                >
                  {bottomRowList.map((item, idx) => (
                    <TestimonialCard
                      key={`row2-dup-${item.id}-${idx}`}
                      name={item.name}
                      role={item.role}
                      quote={item.quote || item.review}
                      review={item.review || item.quote}
                      rating={item.rating}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
