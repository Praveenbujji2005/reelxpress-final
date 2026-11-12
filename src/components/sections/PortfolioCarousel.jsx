'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { REEL_PORTFOLIO } from '@/lib/data';
import { getHeroSlides, getCachedHeroSlides } from '@/lib/cmsServices';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Overlapping fanned-out 3D reel portfolio carousel
// Clicking any video card opens full-window vertical player with prominent "< Back" navigation
export default function PortfolioCarousel({ onShowToast: _onShowToast } = {}) {
  const [reels, setReels] = useState(REEL_PORTFOLIO);
  const [activeReelIndex, setActiveReelIndex] = useState(2); // Center card active by default
  const [windowWidth, setWindowWidth] = useState(1200);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Full Window Video Mode state
  const [fullscreenIndex, setFullscreenIndex] = useState(null);
  const [isFullscreenPlaying, setIsFullscreenPlaying] = useState(false);
  const [isFullscreenMuted, setIsFullscreenMuted] = useState(true); // Default muted autoplay
  const [fullscreenCurrentTime, setFullscreenCurrentTime] = useState(0);
  const [fullscreenDuration, setFullscreenDuration] = useState(0);
  const fullscreenVideoRef = useRef(null);

  // In-video Toast message state (replaces sound button)
  const [toast, setToast] = useState({ visible: false, message: '', icon: '' });
  const toastTimer = useRef(null);

  const showToast = useCallback((message, icon = '') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, message, icon });
    toastTimer.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);
  }, []);

  // Per-card media failure state for fallback handling
  const [failedImages, setFailedImages] = useState({});

  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const hasDragged = useRef(false);

  const totalCards = reels.length;

  // Load dynamic hero slides from CMS / Firestore with instantaneous cache fast-path
  useEffect(() => {
    // 1. Instant cache fast-path
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

  // Open Full Window Video Mode when card or play button is clicked
  const openFullscreen = useCallback(
    (index, e) => {
      if (e) e.stopPropagation();

      setFullscreenIndex(index);
      setFullscreenCurrentTime(0);
      setIsFullscreenPlaying(true);
      setIsFullscreenMuted(true); // Default muted autoplay

      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }

      // Show toast message notifying user video is playing muted
      showToast('Playing without sound · Tap video for sound', 'volume_off');
    },
    [showToast]
  );

  // Close Full Window Video Mode (< Back Button)
  const closeFullscreen = useCallback(() => {
    if (fullscreenIndex === null) return;

    if (fullscreenVideoRef.current && !fullscreenVideoRef.current.paused) {
      fullscreenVideoRef.current.pause();
    }

    setFullscreenIndex(null);
    setIsFullscreenPlaying(false);

    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }, [fullscreenIndex]);

  // Handle card click: center card if not active, and immediately launch Full Window video player
  const handleCardClick = useCallback(
    (index) => {
      if (hasDragged.current) return;
      if (index !== activeReelIndex) {
        selectCard(index);
      }
      openFullscreen(index);
    },
    [activeReelIndex, openFullscreen, selectCard]
  );

  // Fullscreen video controls: toggle play/pause
  const toggleFullscreenPlay = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!fullscreenVideoRef.current) return;
    if (fullscreenVideoRef.current.paused) {
      fullscreenVideoRef.current.play().then(() => {
        setIsFullscreenPlaying(true);
      }).catch(() => {});
    } else {
      fullscreenVideoRef.current.pause();
      setIsFullscreenPlaying(false);
    }
  }, []);

  // Tapping the video surface unmutes audio with a toast message (or toggles play/pause if already unmuted)
  const handleVideoTap = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!fullscreenVideoRef.current) return;

    if (isFullscreenMuted) {
      fullscreenVideoRef.current.muted = false;
      fullscreenVideoRef.current.volume = 1.0;
      setIsFullscreenMuted(false);
      showToast('Sound ON', 'volume_up');
      if (fullscreenVideoRef.current.paused) {
        fullscreenVideoRef.current.play().then(() => setIsFullscreenPlaying(true)).catch(() => {});
      }
    } else {
      if (fullscreenVideoRef.current.paused) {
        fullscreenVideoRef.current.play().then(() => setIsFullscreenPlaying(true)).catch(() => {});
      } else {
        fullscreenVideoRef.current.pause();
        setIsFullscreenPlaying(false);
      }
    }
  }, [isFullscreenMuted, showToast]);

  const handleFullscreenSeek = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!fullscreenVideoRef.current || !fullscreenDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    fullscreenVideoRef.current.currentTime = fraction * fullscreenDuration;
    setFullscreenCurrentTime(fraction * fullscreenDuration);
  }, [fullscreenDuration]);

  // Start playback in fullscreen when mounted
  useEffect(() => {
    if (fullscreenIndex !== null && fullscreenVideoRef.current) {
      fullscreenVideoRef.current.currentTime = 0;
      fullscreenVideoRef.current.muted = isFullscreenMuted;
      fullscreenVideoRef.current
        .play()
        .then(() => {
          setIsFullscreenPlaying(true);
        })
        .catch(() => {
          if (fullscreenVideoRef.current) {
            fullscreenVideoRef.current.muted = true;
            setIsFullscreenMuted(true);
            fullscreenVideoRef.current.play().then(() => setIsFullscreenPlaying(true)).catch(() => {});
          }
        });
    }
  }, [fullscreenIndex, isFullscreenMuted]);

  // Keyboard controls for fullscreen mode (Escape to go back, Space to toggle play, M for mute/unmute)
  useEffect(() => {
    if (fullscreenIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeFullscreen();
      } else if (e.code === 'Space') {
        e.preventDefault();
        toggleFullscreenPlay();
      } else if (e.key === 'm' || e.key === 'M') {
        if (!fullscreenVideoRef.current) return;
        const nextMuted = !fullscreenVideoRef.current.muted;
        fullscreenVideoRef.current.muted = nextMuted;
        if (!nextMuted) fullscreenVideoRef.current.volume = 1.0;
        setIsFullscreenMuted(nextMuted);
        showToast(nextMuted ? 'Sound muted' : 'Sound ON', nextMuted ? 'volume_off' : 'volume_up');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenIndex, closeFullscreen, toggleFullscreenPlay, showToast]);

  // Touch and swipe gestures for carousel
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

          // Matching video thumbnail resolution
          const posterSrc =
            reel.poster ||
            reel.posterUrl ||
            `/thumbnails/hero-video-${(index % 5) + 1}.jpg`;

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
              aria-label={reel.title ? `${reel.title} - Watch Fullscreen` : 'Watch video'}
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
                  <div className="w-10 h-10 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container mb-2">
                    <span className="material-symbols-outlined text-lg">videocam</span>
                  </div>
                  <p className="text-xs font-bold text-white mb-1">{reel.title || 'ReelXpress Visual'}</p>
                  <p className="text-[11px] text-text-muted">Tap to watch video</p>
                </div>
              )}

              {/* Exact Matching Video Cover / Thumbnail Image */}
              <picture className="w-full h-full block">
                <img
                  src={posterSrc}
                  alt={reel.title || 'Reel Cover Photo'}
                  width={290}
                  height={516}
                  loading="eager"
                  decoding="async"
                  onError={() => setFailedImages((prev) => ({ ...prev, [reelIdKey]: true }))}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-10 pointer-events-none"
                />
              </picture>

              {/* Redesigned Compact Play Button (Reduced Size, Modern Glass Style) */}
              <div
                className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                aria-hidden="true"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/65 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-[0_4px_18px_rgba(0,0,0,0.8)] group-hover:scale-110 group-hover:bg-[#ff6d29] group-hover:border-[#ff6d29] transition-all duration-300">
                  <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-white translate-x-0.5 transition-colors" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Bottom Card Caption on Carousel */}
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5 bg-gradient-to-t from-black/95 via-black/55 to-transparent z-20 pointer-events-none">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#ff6d29] block mb-0.5">
                  {reel.category || 'Featured Reel'}
                </span>
                <h4 className="text-xs sm:text-[13px] font-extrabold text-white leading-snug line-clamp-1">
                  {reel.title}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-white/70 mt-1">
                  <span>{reel.creator}</span>
                  {reel.views && <span className="text-white/50">{reel.views}</span>}
                </div>
              </div>
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

      {/* =========================================================================
          FULL WINDOW VIDEO MODE OVERLAY WITH PROMINENT "< BACK" NAVIGATION
          - Completely clean: Zero shooter name, views, shoot name, or type when playing
          - No sound button in UI: Replaced with automatic/interactive toast message
          - No watermark in video, no box icon
          - Mounted via createPortal onto document.body to stay above all navbars & layers
          ========================================================================= */}
      {isMounted && fullscreenIndex !== null && reels[fullscreenIndex] && typeof document !== 'undefined' && createPortal(
        <div
          id="reel-fullscreen-mode"
          className="fixed inset-0 z-[100050] bg-black/98 backdrop-blur-2xl flex flex-col justify-between items-center p-3 sm:p-6 select-none animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label="Full Screen Video Player"
        >
          {/* Top Header Bar: Back Button, Toast Notification & Close Button */}
          <div className="w-full max-w-2xl flex items-center justify-between z-50 py-1 sm:py-2">
            {/* Prominent Back Button */}
            <button
              type="button"
              onClick={closeFullscreen}
              className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-xl group"
              aria-label="Back to carousel"
            >
              <span className="material-symbols-outlined text-base sm:text-lg group-hover:-translate-x-0.5 transition-transform">
                arrow_back
              </span>
              <span>Back</span>
            </button>

            {/* In-Video Toast Message (Replaces bulky sound button) */}
            <div
              className={`transition-all duration-300 transform ${
                toast.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/85 border border-white/25 backdrop-blur-xl shadow-2xl text-white text-xs font-semibold">
                {toast.icon && (
                  <span className="material-symbols-outlined text-sm text-[#ff6d29]">
                    {toast.icon}
                  </span>
                )}
                <span>{toast.message}</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={closeFullscreen}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15"
              aria-label="Close Fullscreen (Esc)"
              title="Back / Close"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Center 9:16 Video Player Surface (Completely Clean: No watermark, no overlays) */}
          <div className="relative flex-1 flex items-center justify-center w-full min-h-0 my-2">
            <div
              className="relative w-full max-w-[420px] sm:max-w-[440px] h-full max-h-[76vh] sm:max-h-[82vh] aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-[0_25px_80px_rgba(0,0,0,0.95)] border border-white/20 flex items-center justify-center cursor-pointer group"
              onClick={handleVideoTap}
            >
              <video
                ref={fullscreenVideoRef}
                src={reels[fullscreenIndex].videoUrl || reels[fullscreenIndex].videoSrc}
                poster={reels[fullscreenIndex].poster || `/thumbnails/hero-video-${(fullscreenIndex % 5) + 1}.jpg`}
                playsInline
                webkit-playsinline="true"
                x5-playsinline="true"
                preload="auto"
                muted={isFullscreenMuted}
                onTimeUpdate={() => {
                  if (fullscreenVideoRef.current) {
                    setFullscreenCurrentTime(fullscreenVideoRef.current.currentTime);
                  }
                }}
                onLoadedMetadata={() => {
                  if (fullscreenVideoRef.current) {
                    setFullscreenDuration(fullscreenVideoRef.current.duration);
                  }
                }}
                onEnded={() => {
                  setIsFullscreenPlaying(false);
                }}
                className="w-full h-full object-cover"
              />

              {/* Big Splash Play button if paused in fullscreen */}
              {!isFullscreenPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20 pointer-events-none">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#ff6d29] text-white flex items-center justify-center shadow-[0_0_30px_rgba(255,109,41,0.8)] transform scale-100 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-white translate-x-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Fullscreen Control Deck: Pure Scrubber & Play/Pause (No shooter name, no views, no shoot name/type, no sound btn, no box icon) */}
          <div className="w-full max-w-xl z-50 flex flex-col gap-2 p-3 sm:p-3.5 rounded-2xl bg-[#141015]/95 border border-white/15 backdrop-blur-xl shadow-2xl">
            {/* Scrubber Progress Bar */}
            <div
              onClick={(e) => handleFullscreenSeek(e)}
              className="relative w-full h-5 flex items-center cursor-pointer group/fscrub"
            >
              <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden group-hover/fscrub:h-2.5 transition-all">
                <div
                  className="h-full bg-[#ff6d29] transition-all duration-75"
                  style={{
                    width: `${fullscreenDuration ? (fullscreenCurrentTime / fullscreenDuration) * 100 : 0}%`,
                  }}
                />
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-lg border-2 border-[#ff6d29] scale-100 transition-transform"
                style={{
                  left: `${fullscreenDuration ? (fullscreenCurrentTime / fullscreenDuration) * 100 : 0}%`,
                }}
              />
            </div>

            {/* Control Actions Row: Clean Play/Pause, Timestamp & Back navigation */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleFullscreenPlay}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 hover:bg-[#ff6d29] text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                  aria-label={isFullscreenPlaying ? 'Pause' : 'Play'}
                >
                  <span className="material-symbols-outlined text-xl sm:text-2xl">
                    {isFullscreenPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <span className="text-xs font-mono text-white/90">
                  {formatTime(fullscreenCurrentTime)} / {formatTime(fullscreenDuration)}
                </span>
              </div>

              <button
                type="button"
                onClick={closeFullscreen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Back to reels</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
