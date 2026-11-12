'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { REEL_PORTFOLIO } from '@/lib/data';
import { getHeroSlides, getCachedHeroSlides } from '@/lib/cmsServices';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Overlapping fanned-out 3D reel portfolio carousel with interactive video playback & full-screen mode
export default function PortfolioCarousel({ onOpenModal, onShowToast: _onShowToast } = {}) {
  const [reels, setReels] = useState(REEL_PORTFOLIO);
  const [activeReelIndex, setActiveReelIndex] = useState(2); // Center card active by default
  const [playingIndex, setPlayingIndex] = useState(null); // Track currently playing video
  const [isMuted, setIsMuted] = useState(true); // Default muted: autoplay without sound on click
  const [videoProgress, setVideoProgress] = useState({}); // Per-video progress { [index]: { currentTime, duration } }
  const [windowWidth, setWindowWidth] = useState(1200);

  // Full Screen Video Mode state
  const [fullscreenIndex, setFullscreenIndex] = useState(null);
  const [isFullscreenPlaying, setIsFullscreenPlaying] = useState(false);
  const [isFullscreenMuted, setIsFullscreenMuted] = useState(true);
  const [fullscreenCurrentTime, setFullscreenCurrentTime] = useState(0);
  const [fullscreenDuration, setFullscreenDuration] = useState(0);
  const fullscreenVideoRef = useRef(null);

  // Video element references for playback coordination
  const videoRefs = useRef({});

  // Per-card media failure state for fallback handling
  const [failedImages, setFailedImages] = useState({});

  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const hasDragged = useRef(false);

  const totalCards = reels.length;

  // Pause all playing carousel videos
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

  // Start video playback: autoplays without sound on click (muted = true)
  const startVideoPlayback = useCallback(
    (index, startMuted = true) => {
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
        currentVid.muted = startMuted;
        setIsMuted(startMuted);
        const playPromise = currentVid.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setPlayingIndex(index);
            })
            .catch((err) => {
              console.warn('[PortfolioCarousel] Video play notice:', err);
              // Fallback: force muted play
              currentVid.muted = true;
              setIsMuted(true);
              currentVid.play().then(() => setPlayingIndex(index)).catch(() => {});
            });
        }
      }
    },
    [activeReelIndex, selectCard]
  );

  // Toggle play/pause for active video
  const togglePlay = useCallback(
    (index, e) => {
      if (e) e.stopPropagation();
      const currentVid = videoRefs.current[index];
      if (!currentVid) return;

      if (currentVid.paused) {
        startVideoPlayback(index, isMuted);
      } else {
        currentVid.pause();
        setPlayingIndex(null);
      }
    },
    [isMuted, startVideoPlayback]
  );

  // Toggle Sound (Mute / Unmute)
  const toggleSound = useCallback((e, index) => {
    if (e) e.stopPropagation();
    const vid = videoRefs.current[index];
    if (!vid) return;

    const nextMuted = !vid.muted;
    vid.muted = nextMuted;
    if (!nextMuted) {
      vid.volume = 1.0;
    }
    setIsMuted(nextMuted);
  }, []);

  // Handle card click:
  // - Clicking a side card brings it to center AND autoplays without sound
  // - Clicking the active center card toggles video playback (autoplays without sound when paused)
  const handleCardClick = useCallback(
    (index) => {
      if (hasDragged.current) return;
      if (index !== activeReelIndex) {
        selectCard(index);
        startVideoPlayback(index, true); // Autoplay without sound on click
      } else {
        const currentVid = videoRefs.current[index];
        if (currentVid) {
          if (currentVid.paused) {
            startVideoPlayback(index, true); // Play without sound on click
          } else {
            currentVid.pause();
            setPlayingIndex(null);
          }
        } else {
          startVideoPlayback(index, true);
        }
      }
    },
    [activeReelIndex, selectCard, startVideoPlayback]
  );

  // Interactive scrubber seek
  const handleSeek = useCallback((e, index) => {
    if (e) e.stopPropagation();
    const vid = videoRefs.current[index];
    if (!vid || !vid.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    vid.currentTime = fraction * vid.duration;
    setVideoProgress((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        currentTime: fraction * vid.duration,
      },
    }));
  }, []);

  // Open Full Screen Video Mode
  const openFullscreen = useCallback(
    (index, e) => {
      if (e) e.stopPropagation();

      const carouselVid = videoRefs.current[index];
      const time = carouselVid ? carouselVid.currentTime : 0;
      const isCurrentlyPlaying = carouselVid ? !carouselVid.paused : false;

      // Pause carousel video
      if (carouselVid && !carouselVid.paused) {
        carouselVid.pause();
      }
      setPlayingIndex(null);

      setFullscreenIndex(index);
      setFullscreenCurrentTime(time);
      setIsFullscreenPlaying(isCurrentlyPlaying || true);
      setIsFullscreenMuted(isMuted);

      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }

      onOpenModal?.(reels[index]);
    },
    [isMuted, onOpenModal, reels]
  );

  // Close Full Screen Video Mode
  const closeFullscreen = useCallback(() => {
    if (fullscreenIndex === null) return;
    const savedIndex = fullscreenIndex;
    const fsTime = fullscreenVideoRef.current ? fullscreenVideoRef.current.currentTime : fullscreenCurrentTime;

    if (fullscreenVideoRef.current && !fullscreenVideoRef.current.paused) {
      fullscreenVideoRef.current.pause();
    }

    // Sync time back to carousel video
    if (videoRefs.current[savedIndex]) {
      videoRefs.current[savedIndex].currentTime = fsTime;
    }

    setFullscreenIndex(null);
    setIsFullscreenPlaying(false);

    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }, [fullscreenCurrentTime, fullscreenIndex]);

  // Fullscreen video controls
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

  const toggleFullscreenSound = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!fullscreenVideoRef.current) return;
    const nextMuted = !fullscreenVideoRef.current.muted;
    fullscreenVideoRef.current.muted = nextMuted;
    if (!nextMuted) {
      fullscreenVideoRef.current.volume = 1.0;
    }
    setIsFullscreenMuted(nextMuted);
    setIsMuted(nextMuted);
  }, []);

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
      fullscreenVideoRef.current.currentTime = fullscreenCurrentTime;
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
  }, [fullscreenIndex, fullscreenCurrentTime, isFullscreenMuted]);

  // Keyboard controls for fullscreen mode (Escape to go back, Space to toggle play, M for mute)
  useEffect(() => {
    if (fullscreenIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeFullscreen();
      } else if (e.code === 'Space') {
        e.preventDefault();
        toggleFullscreenPlay();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleFullscreenSound();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenIndex, closeFullscreen, toggleFullscreenPlay, toggleFullscreenSound]);

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

          const curTime = videoProgress[index]?.currentTime || 0;
          const dur = videoProgress[index]?.duration || 0;
          const progressPercent = dur > 0 ? (curTime / dur) * 100 : 0;

          // Image source resolution with complete fallback chain
          const posterSrc =
            reel.poster ||
            reel.posterUrl ||
            reel.imageUrl ||
            reel.image ||
            reel.thumbnail ||
            reel.thumbnailUrl ||
            '/thumbnails/reel-frame-1.jpg';

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

              {/* Video Element: Autoplays without sound on click (muted = true) */}
              {videoSrc && (
                <video
                  ref={(el) => {
                    if (el) videoRefs.current[index] = el;
                  }}
                  src={videoSrc}
                  poster={posterSrc}
                  playsInline
                  webkit-playsinline="true"
                  x5-playsinline="true"
                  preload="metadata"
                  muted={isMuted}
                  onTimeUpdate={() => {
                    const vid = videoRefs.current[index];
                    if (vid) {
                      setVideoProgress((prev) => ({
                        ...prev,
                        [index]: {
                          currentTime: vid.currentTime,
                          duration: vid.duration || 0,
                        },
                      }));
                    }
                  }}
                  onLoadedMetadata={() => {
                    const vid = videoRefs.current[index];
                    if (vid) {
                      setVideoProgress((prev) => ({
                        ...prev,
                        [index]: {
                          currentTime: vid.currentTime,
                          duration: vid.duration || 0,
                        },
                      }));
                    }
                  }}
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
                    isPlaying ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
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
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-10 pointer-events-none"
                />
              </picture>

              {/* Top Watermark & Quick Actions Bar */}
              <div className="absolute top-2.5 inset-x-2.5 z-30 flex items-center justify-between pointer-events-none">
                {/* Brand Pill */}
                <div
                  className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] sm:text-[10px] font-bold text-white/90 tracking-wide select-none flex items-center gap-0.5 shadow-sm"
                  aria-hidden="true"
                >
                  <span>reel</span><span className="text-[#ff6d29] font-black">X</span><span>press</span>
                </div>

                {/* Right Top Quick Controls: Sound pill & Fullscreen button */}
                <div className="flex items-center gap-1.5 pointer-events-auto">
                  {isPlaying && (
                    <button
                      type="button"
                      onClick={(e) => toggleSound(e, index)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md transition-all shadow-md active:scale-95 border ${
                        isMuted
                          ? 'bg-[#ff6d29] text-white border-[#ff6d29] shadow-[0_0_10px_rgba(255,109,41,0.5)] animate-pulse'
                          : 'bg-black/70 text-emerald-400 border-white/20'
                      }`}
                      aria-label={isMuted ? 'Unmute video sound' : 'Mute video sound'}
                      title={isMuted ? 'Click to hear sound' : 'Mute'}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {isMuted ? 'volume_off' : 'volume_up'}
                      </span>
                      <span>{isMuted ? 'Tap for sound' : 'Sound ON'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => openFullscreen(index, e)}
                    className="w-7 h-7 rounded-full bg-black/65 hover:bg-[#ff6d29] border border-white/20 text-white flex items-center justify-center transition-all shadow-md active:scale-90 backdrop-blur-md"
                    aria-label="Full screen video mode"
                    title="Watch full screen"
                  >
                    <span className="material-symbols-outlined text-sm">fullscreen</span>
                  </button>
                </div>
              </div>

              {/* Center Play Button Overlay (Visible when video is not playing) */}
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

              {/* Bottom Card Caption (Visible when video is not playing) */}
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

              {/* =========================================================================
                  CUSTOM HIGH-VISIBILITY VIDEO CONTROLS OVERLAY (Visible while playing)
                  ========================================================================= */}
              {isPlaying && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-x-0 bottom-0 z-30 p-3 bg-gradient-to-t from-black/95 via-black/85 to-transparent flex flex-col gap-1.5 pointer-events-auto"
                >
                  {/* Scrubber Progress Bar */}
                  <div
                    onClick={(e) => handleSeek(e, index)}
                    className="relative w-full h-4 flex items-center cursor-pointer group/scrub"
                    role="slider"
                    aria-valuenow={curTime}
                    aria-valuemin={0}
                    aria-valuemax={dur || 100}
                    aria-label="Video scrubber"
                  >
                    <div className="w-full h-1.5 rounded-full bg-white/25 overflow-hidden transition-all group-hover/scrub:h-2">
                      <div
                        className="h-full bg-[#ff6d29] transition-all duration-75"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    {/* Scrub Thumb */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md border border-[#ff6d29] transition-opacity"
                      style={{ left: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Controls Row: Play/Pause, Time, Sound Toggle, Fullscreen Option */}
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => togglePlay(index, e)}
                        className="w-7 h-7 rounded-full bg-white/15 hover:bg-[#ff6d29] text-white flex items-center justify-center transition-all active:scale-90"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        <span className="material-symbols-outlined text-base">
                          {isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                      </button>

                      <span className="text-[10px] font-mono text-white/90">
                        {formatTime(curTime)} / {formatTime(dur)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Sound Toggle Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleSound(e, index)}
                        className={`p-1 rounded-full transition-all active:scale-90 ${
                          isMuted ? 'text-[#ff6d29] hover:text-white' : 'text-emerald-400 hover:text-white'
                        }`}
                        aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
                        title={isMuted ? 'Click to hear sound' : 'Mute'}
                      >
                        <span className="material-symbols-outlined text-base">
                          {isMuted ? 'volume_off' : 'volume_up'}
                        </span>
                      </button>

                      {/* Fullscreen Button */}
                      <button
                        type="button"
                        onClick={(e) => openFullscreen(index, e)}
                        className="p-1 rounded-full text-white hover:text-[#ff6d29] transition-all active:scale-90"
                        aria-label="Full screen video mode with back option"
                        title="Full screen mode"
                      >
                        <span className="material-symbols-outlined text-base">fullscreen</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Category Line */}
                  <div className="flex items-baseline justify-between text-white/90 pt-0.5">
                    <span className="text-xs font-bold truncate max-w-[170px]">{reel.title}</span>
                    <span className="text-[10px] text-[#ff6d29] font-medium shrink-0">{reel.category}</span>
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

      {/* =========================================================================
          FULL SCREEN VIDEO MODE OVERLAY WITH PROMINENT "< BACK" OPTION
          ========================================================================= */}
      {fullscreenIndex !== null && reels[fullscreenIndex] && (
        <div
          id="reel-fullscreen-mode"
          className="fixed inset-0 z-[100050] bg-black/98 backdrop-blur-2xl flex flex-col justify-between items-center p-3 sm:p-6 select-none animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label="Full Screen Video Player"
        >
          {/* Top Header Bar */}
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

            {/* Reel Category Badge & Brand */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#ff6d29]/20 border border-[#ff6d29]/40 text-[#ff6d29] text-xs font-bold">
                {reels[fullscreenIndex].category || 'ReelXpress'}
              </span>
              <div className="hidden sm:flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-bold">
                <span>reel</span><span className="text-[#ff6d29] font-black">X</span><span>press</span>
              </div>
            </div>

            {/* Sound Toggle & Close buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleFullscreenSound}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer backdrop-blur-md border ${
                  isFullscreenMuted
                    ? 'bg-[#ff6d29] text-white border-[#ff6d29] shadow-[0_0_15px_rgba(255,109,41,0.7)] animate-pulse'
                    : 'bg-white/15 text-emerald-400 border-white/20 hover:bg-white/20'
                }`}
                aria-label={isFullscreenMuted ? 'Unmute video sound' : 'Mute video sound'}
              >
                <span className="material-symbols-outlined text-sm sm:text-base">
                  {isFullscreenMuted ? 'volume_off' : 'volume_up'}
                </span>
                <span className="hidden sm:inline">{isFullscreenMuted ? 'Tap for sound' : 'Sound ON'}</span>
              </button>

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
          </div>

          {/* Center 9:16 Video Player Surface */}
          <div className="relative flex-1 flex items-center justify-center w-full min-h-0 my-2">
            <div
              className="relative w-full max-w-[420px] sm:max-w-[440px] h-full max-h-[74vh] sm:max-h-[78vh] aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-[0_25px_80px_rgba(0,0,0,0.95)] border border-white/20 flex items-center justify-center cursor-pointer group"
              onClick={toggleFullscreenPlay}
            >
              <video
                ref={fullscreenVideoRef}
                src={reels[fullscreenIndex].videoUrl || reels[fullscreenIndex].videoSrc}
                poster={reels[fullscreenIndex].poster}
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
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ff6d29] text-white flex items-center justify-center shadow-[0_0_30px_rgba(255,109,41,0.8)] transform scale-100 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 fill-white translate-x-1" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Watermark in corner */}
              <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white pointer-events-none">
                <span>reel</span><span className="text-[#ff6d29] font-black">X</span><span>press</span>
              </div>
            </div>
          </div>

          {/* Bottom Fullscreen Control Deck */}
          <div className="w-full max-w-xl z-50 flex flex-col gap-2.5 p-3 sm:p-4 rounded-2xl bg-[#141015]/95 border border-white/15 backdrop-blur-xl shadow-2xl">
            {/* Title & Creator */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-sm sm:text-base font-extrabold truncate">
                  {reels[fullscreenIndex].title}
                </h3>
                <p className="text-text-muted text-xs">
                  Shot by {reels[fullscreenIndex].creator} • iPhone Pro Cine
                </p>
              </div>
              <button
                type="button"
                onClick={closeFullscreen}
                className="text-xs text-[#ff6d29] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Back to reels</span>
              </button>
            </div>

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

            {/* Control Actions Row */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleFullscreenPlay}
                  className="w-10 h-10 rounded-full bg-white/15 hover:bg-[#ff6d29] text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                  aria-label={isFullscreenPlaying ? 'Pause' : 'Play'}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {isFullscreenPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <span className="text-xs font-mono text-white/90">
                  {formatTime(fullscreenCurrentTime)} / {formatTime(fullscreenDuration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleFullscreenSound}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border ${
                    isFullscreenMuted
                      ? 'border-[#ff6d29] text-[#ff6d29] bg-[#ff6d29]/10'
                      : 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {isFullscreenMuted ? 'volume_off' : 'volume_up'}
                  </span>
                  <span>{isFullscreenMuted ? 'Tap for sound' : 'Sound ON'}</span>
                </button>

                <button
                  type="button"
                  onClick={closeFullscreen}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-white/15 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">fullscreen_exit</span>
                  <span>Exit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
