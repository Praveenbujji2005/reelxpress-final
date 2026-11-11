'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Shuffle from './Shuffle/Shuffle';
import { getHeroSlides, getPricingPlans, getTestimonials, getFaqs } from '@/lib/cmsServices';

/**
 * FullScreenLoader Component for ReelXpress Pro
 *
 * Premium cinematic full-screen introductory loading animation powered by React Bits <Shuffle />.
 *
 * Life-Cycle Guarantees:
 * 1. Appears immediately when the website is opened or refreshed.
 * 2. Remains visible while the DOM initializes, fonts activate, critical assets preload,
 *    and Firestore CMS collections complete their initial queries.
 * 3. Does not prematurely disappear merely because the Shuffle text animation finished.
 * 4. Does not disappear before the website is genuinely ready.
 * 5. Handles slow network or failed API requests gracefully via Promise.allSettled and safety timeout fallback.
 * 6. Executes a smooth cinematic exit transition (slight scale reduction + opacity fade)
 *    revealing the fully loaded, interactive website underneath without layout jumps or flickering.
 * 7. Mobile-first responsive design matching 360px to 4K displays with 100dvh viewport bounds.
 */
export default function FullScreenLoader() {
  const pathname = usePathname();

  // If on admin dashboard or admin auth pages, bypass website loader
  const isAdmin = pathname?.startsWith('/admin');

  // State coordination
  const [isMounted, setIsMounted] = useState(!isAdmin);
  const [isExiting, setIsExiting] = useState(false);
  const [websiteReady, setWebsiteReady] = useState(false);
  const [shuffleFinished, setShuffleFinished] = useState(false);

  const hasExitedRef = useRef(false);

  // Callback when React Bits Shuffle text finishes its slide animation
  const handleShuffleComplete = useCallback(() => {
    setShuffleFinished(true);
  }, []);

  // Coordinate genuine website readiness conditions
  useEffect(() => {
    if (isAdmin) {
      setIsMounted(false);
      return;
    }

    let isSubscribed = true;

    // 1. Lock body scrolling while the full-screen loader is visible
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (typeof window !== 'undefined' && window.lenis) {
      window.lenis.stop();
    }

    // 2. Comprehensive Readiness Coordinator
    const coordinateLoadingReadiness = async () => {
      // Condition A: DOM Content Loaded / Interactive
      const domPromise = new Promise((resolve) => {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          resolve(true);
        } else {
          const onDomReady = () => {
            resolve(true);
            document.removeEventListener('DOMContentLoaded', onDomReady);
          };
          document.addEventListener('DOMContentLoaded', onDomReady);
        }
      });

      // Condition B: Window Load Event (Stylesheets, initial scripts, synchronous resources)
      const windowLoadPromise = new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve(true);
        } else {
          const onWindowLoad = () => {
            resolve(true);
            window.removeEventListener('load', onWindowLoad);
          };
          window.addEventListener('load', onWindowLoad);
        }
      });

      // Condition C: Web Fonts Ready (Plus Jakarta Sans, Cormorant, Material Symbols)
      const fontsPromise = (async () => {
        try {
          if ('fonts' in document) {
            await document.fonts.ready;
          }
        } catch {
          // Graceful fallback if FontFaceSet is unsupported
        }
        return true;
      })();

      // Condition D: Critical CMS Collections Pre-warm (Parallel Firestore reads with fallbacks)
      const cmsPromise = (async () => {
        try {
          await Promise.allSettled([
            getHeroSlides(),
            getPricingPlans(),
            getTestimonials(),
            getFaqs(),
          ]);
        } catch (err) {
          console.warn('[Loader] Handled CMS sync fallback:', err);
        }
        return true;
      })();

      // Condition E: Essential Brand Visual Assets Preload
      const assetsPromise = (async () => {
        const brandAssets = [
          '/brand/icon-gold.png',
          '/brand/reelxpress-x-logo.png',
          '/brand/reelxpress-wordmark-white-hd.png',
          '/brand/reelxpress-wordmark.svg',
        ];

        await Promise.allSettled(
          brandAssets.map((src) => {
            return new Promise((resolve) => {
              const img = new Image();
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false); // Gracefully proceed even if an asset fails
              img.src = src;
            });
          })
        );
        return true;
      })();

      // Await all genuine readiness promises simultaneously
      await Promise.all([
        domPromise,
        windowLoadPromise,
        fontsPromise,
        cmsPromise,
        assetsPromise,
      ]);

      if (isSubscribed) {
        setWebsiteReady(true);
      }
    };

    coordinateLoadingReadiness();

    // 3. Fallback safety timer: guarantees the loader will never remain stuck indefinitely
    // even if a 3rd-party script or network disconnects unexpectedly (6.5s limit)
    const safetyTimer = setTimeout(() => {
      if (isSubscribed) {
        setWebsiteReady(true);
        setShuffleFinished(true);
      }
    }, 6500);

    // 4. Shuffle completion safety timer in case ScrollTrigger observer is deferred (2.2s limit)
    const shuffleSafetyTimer = setTimeout(() => {
      if (isSubscribed) {
        setShuffleFinished(true);
      }
    }, 2200);

    return () => {
      isSubscribed = false;
      clearTimeout(safetyTimer);
      clearTimeout(shuffleSafetyTimer);
      document.body.style.overflow = originalBodyOverflow || '';
      document.documentElement.style.overflow = originalHtmlOverflow || '';
    };
  }, [isAdmin]);

  // Trigger Exit Transition once BOTH the website has genuinely loaded AND Shuffle text animated
  useEffect(() => {
    if (websiteReady && shuffleFinished && !hasExitedRef.current) {
      hasExitedRef.current = true;
      setIsExiting(true);

      // Re-enable document scrolling right as exit begins
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.start();
        window.lenis.resize();
      }

      // Allow 600ms for smooth scale & opacity exit animation before unmounting from DOM
      const unmountTimer = setTimeout(() => {
        setIsMounted(false);
      }, 620);

      return () => clearTimeout(unmountTimer);
    }
  }, [websiteReady, shuffleFinished]);

  if (!isMounted || isAdmin) {
    return null;
  }

  return (
    <div
      id="reelxpress-pro-loader"
      role="status"
      aria-live="polite"
      aria-label="ReelXpress Pro Loading"
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#080808] select-none pointer-events-auto touch-none overflow-hidden transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isExiting
          ? 'opacity-0 scale-[0.97] pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      style={{
        width: '100vw',
        height: '100vh',
        minHeight: '100dvh',
        maxHeight: '100dvh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      {/* 1. Subtle Cinematic Warm Radial Glow Centered Behind Brand Text */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[620px] md:w-[860px] h-[340px] sm:h-[480px] rounded-full bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(255,109,41,0.14),transparent_70%)] blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* 2. Soft Edge Vignette for Dark-Luxe Depth */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.7)_100%)] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* 3. Central Brand Stage */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-full">
        {/* React Bits Shuffle Text Animation */}
        <Shuffle
          text="ReelXpress Pro"
          effect="slide"
          shuffleDirection="right"
          duration={0.35}
          animationMode="evenodd"
          shuffleTimes={1}
          ease="power3.out"
          stagger={0.03}
          threshold={0.1}
          triggerOnce={true}
          triggerOnHover={true}
          hoverRadius={0}
          motionBlur={false}
          respectReducedMotion={true}
          color="#ffffff"
          accentColor="#ff6d29"
          className="font-sans font-extrabold tracking-tight select-none text-center"
          style={{
            fontFamily: 'var(--font-plus-jakarta-sans), -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: 'clamp(1.75rem, 5.5vw, 3.75rem)',
            letterSpacing: '-0.025em',
            textTransform: 'none',
            filter: 'drop-shadow(0 0 28px rgba(255, 109, 41, 0.28))',
          }}
          onShuffleComplete={handleShuffleComplete}
        />
      </div>
    </div>
  );
}
