'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { REEL_PORTFOLIO } from '@/lib/data';
import { getHeroSlides, getCachedHeroSlides } from '@/lib/cmsServices';

// Overlapping fanned-out 3D reel portfolio carousel with interactive video playback
export default function PortfolioCarousel({ onShowToast: _onShowToast } = {}) {
  const [reels, setReels] = useState(REEL_PORTFOLIO);
  const [activeReelIndex, setActiveReelIndex] = useState(2); // Center card active by default
  const [playingIndex, setPlayingIndex] = useState(null); // Track currently playing video
  const [windowWidth, setWindowWidth] = useState(1200);

  // Video element references for playback coordination
  const videoRefs = useRef({});

  // Per-card media failure state for fallback handling
  const [failedImages, setFailedImages] = useState({});

  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const hasDragged = useRef(false);

  const totalCards = reels.length;

  // Pause all playing videos when switching slides
  const pauseAllVideos = useCallback(() => {
    Object.values(videoRefs.current).forEach((vid) => {
      if (vid && !vid.paused) {
        vid.pause();
      }
    });
    setPlayingIndex(null);
  }, []);

  // Pause previous video whenever activeReelIndex changes (switching slides)
  useEffect(() => {
    pauseAllVideos();
  }, [activeReelIndex, pauseAllVideos]);

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

  // Handle Play/Pause for individual reel video
  const handlePlayVideo = useCallback(
    (index, e) => {
      if (e) e.stopPropagation();

      // If card is not centered, center it first
      if (index !== activeReelIndex) {
        selectCard(index);
      }

      // Pause all other videos
      Object.entries(videoRefs.current).forEach(([k, vid]) => {
        if (Number(k) !== index && vid && !vid.paused) {
          vid.pause();
        }
      });

      const currentVid = videoRefs.current[index];
      if (currentVid) {
        if (currentVid.paused) {
          currentVid.play().then(() => {
            setPlayingIndex(index);
          }).catch((err) => {
            console.warn('[PortfolioCarousel] Video play notice:', err);
          });
        } else {
          currentVid.pause();
          setPlayingIndex(null);
        }
      }
    },
    [activeReelIndex, selectCard]
  );

  // Handle card click:
  // - Clicking a side card brings it to center (and pauses any playing video)
  // - Clicking the active center card toggles video playback
  const handleCardClick = useCallback(
    (index) => {
      if (hasDragged.current) return;
      if (index !== activeReelIndex) {
        selectCard(index);
      } else {
        handlePlayVideo(index);
      }
    },
    [activeReelIndex, handlePlayVideo, selectCard]
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
          const isPlaying = playingIndex === index;
          const cardStyle = getCardStyle(index);

          const reelIdKey = String(reel.id !== undefined && reel.id !== null ? reel.id : index);
          const hasFailed = Boolean(failedImages[reelIdKey]);
          const videoSrc = reel.videoUrl || reel.videoSrc || '';

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
              aria-label={reel.title ? `${reel.title} - ${isPlaying ? 'Pause video' : 'Play video'}` : 'Play video'}
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
                  <p className="text-[11px] text-text-muted">Tap to view video</p>
                </div>
              )}

              {/* Small reelXpress watermark on top corner */}
              <div
                className="absolute top-2.5 left-2.5 z-20 px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-md border border-white/10 text-[9px] sm:text-[10px] font-bold text-white/90 tracking-wide pointer-events-none select-none flex items-center gap-0.5 shadow-sm"
                aria-hidden="true"
              >
                <span>reel</span><span className="text-[#ff6d29] font-black">X</span><span>press</span>
              </div>

              {/* Video Element: Plays on click with native video controls */}
              {videoSrc && (
                <video
                  ref={(el) => {
                    if (el) videoRefs.current[index] = el;
                  }}
                  src={videoSrc}
                  poster={posterSrc}
                  playsInline
                  preload="metadata"
                  controls={isPlaying}
                  controlsList="nodownload"
                  onPlay={() => {
                    setPlayingIndex(index);
                    Object.entries(videoRefs.current).forEach(([k, vid]) => {
                      if (Number(k) !== index && vid && !vid.paused) vid.pause();
                    });
                  }}
                  onPause={() => {
                    if (playingIndex === index) setPlayingIndex(null);
                  }}
                  onEnded={() => {
                    if (playingIndex === index) setPlayingIndex(null);
                  }}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    isPlaying ? 'opacity-100 z-30' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                />
              )}

              {/* Poster / Thumbnail Image (Visible when video is not playing) */}
              <picture className={`w-full h-full block transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
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

              {/* Play Button Overlay (Visible when video is not playing) */}
              {!isPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                  aria-hidden="true"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-white flex items-center justify-center shadow-[0_4px_25px_rgba(0,0,0,0.85)] group-hover:scale-110 group-hover:border-[#ff6d29] group-hover:bg-[#ff6d29]/25 transition-all duration-300">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-[#ff6d29] translate-x-0.5 drop-shadow-[0_0_8px_rgba(255,109,41,0.6)]" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Card Meta / Caption Overlay at Bottom (Visible when video is not playing) */}
              {!isPlaying && (
                <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 pointer-events-none">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff6d29] block mb-0.5">
                    {reel.category || 'Featured Reel'}
                  </span>
                  <h4 className="text-xs sm:text-sm font-extrabold text-white leading-snug line-clamp-1">
                    {reel.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-white/70 mt-1">
                    <span>{reel.creator}</span>
                    {reel.views && <span className="text-white/50">{reel.views}</span>}
                  </div>
                </div>
              )}
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
