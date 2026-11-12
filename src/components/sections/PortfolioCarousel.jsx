'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { REEL_PORTFOLIO, INSTAGRAM_PAGE_URL } from '@/lib/data';
import { getHeroSlides, getCachedHeroSlides } from '@/lib/cmsServices';

// Overlapping fanned-out 3D reel portfolio carousel displaying clean photo stills with Instagram redirection
export default function PortfolioCarousel({ onShowToast }) {
  const [reels, setReels] = useState(REEL_PORTFOLIO);
  const [activeReelIndex, setActiveReelIndex] = useState(3); // Center card active by default
  const [windowWidth, setWindowWidth] = useState(1200);

  // Per-card media failure state for fallback handling
  const [failedImages, setFailedImages] = useState({});

  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const hasDragged = useRef(false);

  const totalCards = reels.length;

  // Load dynamic hero slides from CMS / Firestore with instantaneous cache fast-path
  useEffect(() => {
    // 1. Instant cache fast-path to prevent network delay on initial render
    const cached = getCachedHeroSlides();
    if (cached && cached.length > 0) {
      const activeSlides = cached.filter((s) => s.enabled !== false);
      if (activeSlides.length > 0) {
        setReels(activeSlides);
        setActiveReelIndex((prev) => (prev >= activeSlides.length ? Math.floor(activeSlides.length / 2) : prev));
      }
    }

    // 2. Background revalidation
    getHeroSlides()
      .then((slides) => {
        if (slides && slides.length > 0) {
          const activeSlides = slides.filter((s) => s.enabled !== false);
          if (activeSlides.length > 0) {
            setReels(activeSlides);
            setActiveReelIndex((prev) => (prev >= activeSlides.length ? Math.floor(activeSlides.length / 2) : prev));
          }
        }
      })
      .catch(() => {});

    // 3. React to live Admin updates
    const handleCmsUpdate = (e) => {
      if (!e.detail?.type || e.detail.type === 'hero') {
        getHeroSlides({ forceRefresh: true }).then((slides) => {
          if (slides && slides.length > 0) {
            const activeSlides = slides.filter((s) => s.enabled !== false);
            if (activeSlides.length > 0) {
              setReels(activeSlides);
              setActiveReelIndex((prev) => (prev >= activeSlides.length ? Math.floor(activeSlides.length / 2) : prev));
            }
          }
        });
      }
    };
    window.addEventListener('cms-cache-invalidated', handleCmsUpdate);
    return () => window.removeEventListener('cms-cache-invalidated', handleCmsUpdate);
  }, []);

  // Track window width for responsive 3D card layout calculations
  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute transform styles for each card based on activeReelIndex
  const getCardStyle = useCallback(
    (index) => {
      const isMobile = windowWidth < 640;
      const isTablet = windowWidth >= 640 && windowWidth < 1024;

      let spacing = 165;
      if (isMobile) {
        spacing = Math.min(Math.round(windowWidth * 0.26), 114);
      } else if (isTablet) {
        spacing = 124;
      }

      // Calculate shortest circular difference in ring of totalCards for symmetrical alignment
      const rawDiff = index - activeReelIndex;
      let diff = ((rawDiff % totalCards) + totalCards) % totalCards;
      if (diff > totalCards / 2) {
        diff -= totalCards;
      }

      const absDiff = Math.abs(diff);

      let tx = 0,
        ty = 0,
        scale = 1,
        rot = 0,
        zIndex = 10,
        opacity = 1,
        filter = 'brightness(1)',
        pointerEvents = 'auto';

      if (isMobile) {
        // Pure horizontal sliding animation on mobile - zero 3D rotation, zero tilt, zero vertical drop
        const cardWidth = Math.min(Math.round(windowWidth * 0.70), 248);
        const cardGap = 15;
        const mobileSpacing = cardWidth + cardGap;
        tx = diff * mobileSpacing;
        ty = 0;
        rot = 0;
        scale = absDiff === 0 ? 1 : 0.94;
        zIndex = absDiff === 0 ? 30 : Math.max(1, 20 - absDiff);
        opacity = absDiff === 0 ? 1 : absDiff === 1 ? 0.72 : 0;
        filter = absDiff === 0 ? 'brightness(1) contrast(1)' : 'brightness(0.8) contrast(0.95)';
        pointerEvents = absDiff <= 1 ? 'auto' : 'none';
      } else if (isTablet) {
        tx = diff * spacing;
        ty = absDiff === 0 ? 0 : absDiff === 1 ? 10 : absDiff === 2 ? 20 : 30;
        scale = absDiff === 0 ? 1.08 : absDiff === 1 ? 0.92 : absDiff === 2 ? 0.78 : 0.65;
        rot = diff === 0 ? 0 : diff < 0 ? (diff === -1 ? -4.5 : diff === -2 ? -9 : -13) : diff === 1 ? 4.5 : diff === 2 ? 9 : 13;
        zIndex = absDiff === 0 ? 30 : absDiff === 1 ? 20 : absDiff === 2 ? 10 : 5;
        opacity = absDiff === 0 ? 1 : absDiff === 1 ? 0.9 : absDiff === 2 ? 0.72 : 0;
        pointerEvents = absDiff <= 2 ? 'auto' : 'none';
        filter =
          absDiff === 0
            ? 'brightness(1) contrast(1)'
            : absDiff === 1
            ? 'brightness(0.9) contrast(0.96)'
            : absDiff === 2
            ? 'brightness(0.78) contrast(0.92)'
            : 'brightness(0.65) contrast(0.88)';
      } else {
        tx = diff * spacing;
        ty = absDiff === 0 ? 0 : absDiff === 1 ? 12 : absDiff === 2 ? 24 : 36;
        scale = absDiff === 0 ? 1.1 : absDiff === 1 ? 0.95 : absDiff === 2 ? 0.82 : 0.70;
        rot = diff === 0 ? 0 : diff < 0 ? (diff === -1 ? -5.5 : diff === -2 ? -11 : -16) : diff === 1 ? 5.5 : diff === 2 ? 11 : 16;
        zIndex = absDiff === 0 ? 30 : absDiff === 1 ? 20 : absDiff === 2 ? 10 : 5;
        opacity = absDiff === 0 ? 1 : absDiff === 1 ? 0.94 : absDiff === 2 ? 0.82 : (absDiff === 3 ? 0.65 : 0);
        pointerEvents = absDiff <= 3 ? 'auto' : 'none';
        filter =
          absDiff === 0
            ? 'brightness(1) contrast(1)'
            : absDiff === 1
            ? 'brightness(0.92) contrast(0.98)'
            : absDiff === 2
            ? 'brightness(0.84) contrast(0.94)'
            : 'brightness(0.74) contrast(0.90)';
      }

      if (opacity === 0) {
        pointerEvents = 'none';
      }

      return {
        '--slot-tx': `${tx}px`,
        '--slot-scale': `${scale}`,
        transform: isMobile
          ? `translateX(calc(-50% + ${tx}px)) translateY(-50%) scale(${scale})`
          : `translateX(calc(-50% + ${tx}px)) translateY(calc(-50% + ${ty}px)) scale(${scale}) rotate(${rot}deg)`,
        zIndex,
        opacity,
        filter,
        pointerEvents,
        visibility: opacity === 0 ? 'hidden' : 'visible',
      };
    },
    [activeReelIndex, totalCards, windowWidth]
  );

  // Center on a card
  const selectCard = useCallback(
    (index) => {
      const nextIndex = (index + totalCards) % totalCards;
      setActiveReelIndex(nextIndex);
    },
    [totalCards]
  );

  // Redirect to Instagram page
  const openInstagram = useCallback(
    (reel) => {
      const url = reel?.instagramUrl || INSTAGRAM_PAGE_URL;
      if (typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer');
        onShowToast?.({
          title: 'Opening Instagram',
          message: 'Redirecting to @reelxpress___ on Instagram',
          icon: 'open_in_new',
          visible: true,
        });
      }
    },
    [onShowToast]
  );

  // Handle card click: clicking center card redirects to Instagram; clicking side card centers it
  const handleCardClick = useCallback(
    (index) => {
      if (hasDragged.current) return;
      if (index === activeReelIndex) {
        openInstagram(reels[index]);
      } else {
        selectCard(index);
      }
    },
    [activeReelIndex, openInstagram, selectCard, reels]
  );

  // Touch and swipe gestures
  const handleTouchStart = (e) => {
    dragStartX.current = e.changedTouches[0].clientX;
    dragStartY.current = e.changedTouches[0].clientY;
    hasDragged.current = false;
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - dragStartX.current;
    const diffY = endY - dragStartY.current;

    if (Math.abs(diffX) > 30 && Math.abs(diffX) > Math.abs(diffY)) {
      hasDragged.current = true;
      if (diffX > 0) {
        selectCard(activeReelIndex - 1);
      } else {
        selectCard(activeReelIndex + 1);
      }
    }
  };

  return (
    <div id="fanned-carousel-container" suppressHydrationWarning className="my-6 md:my-10 relative w-full overflow-hidden sm:overflow-visible">
      {/* 3D Perspective Stage Track */}
      <div
        id="fanned-carousel-track"
        suppressHydrationWarning
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {reels.map((reel, index) => {
          const isCenter = index === activeReelIndex;
          const cardStyle = getCardStyle(index);

          const reelIdKey = String(reel.id !== undefined && reel.id !== null ? reel.id : index);
          const hasFailed = Boolean(failedImages[reelIdKey]);

          // Image source resolution with complete fallback chain
          const posterSrc =
            reel.poster ||
            reel.posterUrl ||
            reel.imageUrl ||
            reel.image ||
            reel.thumbnail ||
            reel.thumbnailUrl ||
            '/thumbnails/reel-frame-1.jpg';

          // Only use <source type="image/webp"> for static local sample photos that have a real .webp sibling
          const isLocalSample =
            typeof posterSrc === 'string' && /^\/thumbnails\/reel-frame-[1-7]\.jpg$/.test(posterSrc);
          const posterWebp = isLocalSample ? posterSrc.replace(/\.jpg$/, '.webp') : null;

          return (
            <div
              key={`portfolio-reel-${reelIdKey}-${index}`}
              suppressHydrationWarning
              onClick={() => handleCardClick(index)}
              style={cardStyle}
              className={`fanned-card group cursor-pointer overflow-hidden ${
                isCenter ? 'is-active ring-1 ring-white/30 shadow-[0_25px_60px_rgba(0,0,0,0.9)]' : 'ring-1 ring-white/10'
              }`}
              data-reel={index}
              role="button"
              tabIndex={0}
              aria-label={reel.title ? `${reel.title} - View reel on Instagram` : 'View reel on Instagram'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(index);
                }
              }}
            >
              {/* Fallback View: Displayed only if media completely fails to load */}
              {hasFailed && (
                <div className="absolute inset-0 bg-[#161217] flex flex-col items-center justify-center p-6 text-center z-10 border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container mb-3">
                    <span className="material-symbols-outlined text-xl">videocam</span>
                  </div>
                  <p className="text-xs font-bold text-white mb-1">{reel.title || 'ReelXpress Visual'}</p>
                  <p className="text-[11px] text-text-muted">Tap to view on Instagram</p>
                </div>
              )}

              {/* Single Frame / Reel Photo Still */}
              <picture className="w-full h-full block">
                {posterWebp && <source srcSet={posterWebp} type="image/webp" />}
                <img
                  src={posterSrc}
                  alt={reel.title || 'Reel Photo'}
                  width={290}
                  height={516}
                  loading="eager"
                  decoding="async"
                  onError={() => setFailedImages((prev) => ({ ...prev, [reelIdKey]: true }))}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-10"
                />
              </picture>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls: Prev Arrow, Pagination Dots, Next Arrow */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 md:mt-8 relative z-20">
        <button
          onClick={() => selectCard(activeReelIndex - 1)}
          aria-label="Previous Reel Card"
          className="w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-full bg-[#181216] border border-white/15 text-white flex items-center justify-center hover:bg-primary-container hover:border-primary-container hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer touch-manipulation"
        >
          <span className="material-symbols-outlined text-lg sm:text-xl">arrow_back</span>
        </button>

        {/* Pagination Dots */}
        <div id="carousel-dots" className="flex items-center gap-1.5 sm:gap-2 py-2">
          {reels.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => selectCard(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}`}
              className="p-1.5 cursor-pointer touch-manipulation group flex items-center justify-center"
            >
              <span
                className={`block rounded-full transition-all duration-200 ${
                  dotIdx === activeReelIndex
                    ? 'w-6 h-2 bg-primary-container shadow-[0_0_8px_rgba(255,109,41,0.7)]'
                    : 'w-2 h-2 bg-white/30 group-hover:bg-white/60'
                }`}
              />
            </button>
          ))}
        </div>

        <button
          onClick={() => selectCard(activeReelIndex + 1)}
          aria-label="Next Reel Card"
          className="w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-full bg-[#181216] border border-white/15 text-white flex items-center justify-center hover:bg-primary-container hover:border-primary-container hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer touch-manipulation"
        >
          <span className="material-symbols-outlined text-lg sm:text-xl">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
