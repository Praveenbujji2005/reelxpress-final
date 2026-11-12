'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { formatTime } from '@/lib/utils';

// Cinematic full-screen video lightbox modal for portrait reels
export default function ReelModal({ isOpen, reel, onClose, onShowToast: _onShowToast }) {
  const videoRef = useRef(null);
  const progressContainerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Lock body scroll when video modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Initialize playback when modal opens with a new reel
  useEffect(() => {
    if (isOpen && reel && videoRef.current) {
      setHasError(false);
      setIsLoading(true);
      videoRef.current.currentTime = 0;
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.muted = true;
      setIsMuted(true);

      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((err) => {
            console.warn('Video play notice:', err);
            setIsLoading(false);
          });
      }

      function handleKeyDown(e) {
        if (e.key === 'Escape') onClose();
        if (e.code === 'Space') {
          e.preventDefault();
          togglePlay();
        }
      }
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isOpen, reel, onClose]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  }, []);

  const handleVolumeChange = useCallback((e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handleSeek = useCallback((e) => {
    if (!progressContainerRef.current || !videoRef.current || !duration) return;
    const rect = progressContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
    videoRef.current.currentTime = percent * duration;
    setCurrentTime(percent * duration);
  }, [duration]);

  const changeSpeed = useCallback((speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
    setIsSpeedMenuOpen(false);
  }, []);

  if (!isOpen || !reel) return null;

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      id="reel-modal"
      data-lenis-prevent
      className="fixed inset-0 z-[100030] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-2xl opacity-100 pointer-events-auto transition-all duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        id="reel-modal-card"
        className="relative w-full max-w-[390px] sm:max-w-[430px] max-h-[96vh] max-h-[96dvh] rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#120f13]/95 border border-white/15 flex flex-col shadow-[0_25px_80px_rgba(0,0,0,0.95)]"
      >
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-b border-white/10 bg-[#161316]/80 backdrop-blur-md z-30 flex-shrink-0">
          <button
            onClick={onClose}
            aria-label="Back to carousel"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md group"
          >
            <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            <span>Back</span>
          </button>
          <button
            onClick={onClose}
            aria-label="Close Modal (Escape)"
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:bg-primary-container hover:text-white hover:border-primary-container transition-all active:scale-90 cursor-pointer touch-manipulation"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* 9:16 Video Player Canvas */}
        <div
          id="modal-video-surface"
          className="relative flex-1 flex items-center justify-center bg-black overflow-hidden select-none min-h-0"
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src={reel.videoSrc}
            poster={reel.poster}
            playsInline
            webkit-playsinline="true"
            x5-playsinline="true"
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
            className="w-full h-auto max-h-[58vh] max-h-[58dvh] sm:max-h-[62vh] sm:max-h-[62dvh] aspect-[9/16] object-contain mx-auto"
          />

          {/* Center Play/Pause Splash Icon */}
          {!isPlaying && !isLoading && !hasError && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              aria-label="Play Reel"
              className="absolute inset-0 m-auto w-16 h-16 rounded-full hero-glass-btn flex items-center justify-center z-20 cursor-pointer transition-all shadow-2xl active:scale-90 touch-manipulation"
            >
              <span className="material-symbols-outlined text-3xl reel-glass-play-icon">play_arrow</span>
            </button>
          )}

          {/* Buffering & Loading Message Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-25 pointer-events-none transition-all duration-300">
              <div className="w-12 h-12 rounded-full border-3 border-white/20 border-t-primary-container player-spinner mb-3" />
              <span className="text-xs font-semibold text-white tracking-wide bg-black/70 px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
                Preparing your experience...
              </span>
            </div>
          )}

          {/* Playback Error Overlay */}
          {hasError && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
              <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error_outline</span>
              <h4 className="text-white font-bold text-base mb-1">Playback Error</h4>
              <p className="text-xs text-text-muted mb-4 max-w-xs">Could not play this video. Tap Retry to reload the source.</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setHasError(false);
                  videoRef.current?.load();
                  videoRef.current?.play().catch(() => {});
                }}
                className="px-5 py-2.5 rounded-xl bg-primary-container text-white font-semibold text-xs shadow-lg active:scale-95 transition-all cursor-pointer touch-manipulation"
              >
                Retry Playback
              </button>
            </div>
          )}
        </div>

        {/* Bottom Control Deck */}
        <div id="player-controls-deck" className="px-4 py-3 border-t border-white/10 bg-[#161316]/95 backdrop-blur-md flex-shrink-0 z-30">

          {/* Scrubber Progress Bar */}
          <div
            ref={progressContainerRef}
            onClick={handleSeek}
            className="relative w-full py-1.5 cursor-pointer group"
          >
            <div className="relative w-full h-1.5 rounded-full bg-white/20 overflow-visible transition-all group-hover:h-2">
              <div
                className="absolute left-0 top-0 h-full bg-primary-container rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_8px_rgba(0,0,0,0.8)] scale-0 group-hover:scale-100 transition-transform"
                style={{ left: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer touch-manipulation"
              >
                <span className="material-symbols-outlined text-xl">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                  className="w-9 h-9 min-w-[36px] min-h-[36px] text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer touch-manipulation active:scale-90"
                >
                  <span className="material-symbols-outlined text-lg">
                    {isMuted || volume === 0 ? 'volume_off' : 'volume_up'}
                  </span>
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Volume Slider"
                  className="w-14 sm:w-16 h-1 cursor-pointer hidden sm:block"
                />
              </div>

              <div className="text-[11px] font-mono text-text-muted whitespace-nowrap select-none">
                <span className="text-white">{formatTime(currentTime)}</span> / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Speed Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
                  type="button"
                  aria-label="Playback Speed"
                  className="px-2.5 py-1.5 min-h-[36px] rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold font-mono transition-colors cursor-pointer touch-manipulation active:scale-90 flex items-center justify-center"
                >
                  {playbackSpeed}x
                </button>
                {isSpeedMenuOpen && (
                  <div className="absolute bottom-full right-0 mb-2 py-1 w-20 rounded-xl bg-[#161316] border border-white/20 shadow-2xl backdrop-blur-xl z-40">
                    {[0.5, 1.0, 1.25, 1.5, 2.0].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => changeSpeed(s)}
                        className={`speed-opt w-full px-3 py-1.5 text-left text-xs text-white hover:bg-white/10 transition-colors ${
                          playbackSpeed === s ? 'active' : ''
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
