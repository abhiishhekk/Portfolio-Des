import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import AnimatedContent from './AnimatedContent';
import { lockScroll, unlockScroll } from '../utils/scrollLock';
import './Preloader.css';

export default function Preloader({
  theme,
  onExitStart,
  onComplete,
}) {
  const currentTheme =
    theme ||
    (typeof document !== 'undefined'
      ? document.documentElement.getAttribute('data-theme')
      : null) ||
    (typeof window !== 'undefined' && localStorage.getItem('theme')) ||
    'dark';

  const containerRef = useRef(null);
  const greetingPanelRef = useRef(null);
  const loaderPanelRef = useRef(null);
  const progressBarRef = useRef(null);
  const counterNumRef = useRef(null);
  const curvePathRef = useRef(null);

  const [progress, setProgress] = useState(0);

  const onExitStartRef = useRef(onExitStart);
  onExitStartRef.current = onExitStart;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const isExitingRef = useRef(false);

  // Trigger the final slide-up exit revealing the site beneath
  const triggerFinalExit = useCallback(() => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;

    const loaderPanel = loaderPanelRef.current;
    const container = containerRef.current;
    const curvePath = curvePathRef.current;

    // 1. Notify App that curtain exit has begun so Hero and WarpText activate
    onExitStartRef.current?.();

    // 2. Make preloader root background transparent immediately so as the curtain rises,
    // the website underneath is revealed in real-time
    if (container) {
      container.style.backgroundColor = 'transparent';
      container.style.pointerEvents = 'none';
    }

    const windowH = typeof window !== 'undefined' ? window.innerHeight : 900;
    const curveHeight = Math.max(140, Math.round(windowH * 0.16));

    const tl = gsap.timeline({
      onComplete: () => {
        unlockScroll();
        window.dispatchEvent(new Event('resize'));
        setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 180);
        onCompleteRef.current?.();
      },
    });

    // Fade out percentage counter and progress bar immediately
    // so they disappear right as the preloader curtain starts getting pushed above
    tl.to(
      ['.loader-bottom-bar', '.loader-bar-track'],
      {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.out',
      },
      0
    );

    // Slide the loader panel completely up past the top of the viewport like a rising curtain
    // (-125% ensures the panel and the downward curved hem clear the screen completely)
    if (loaderPanel) {
      tl.to(
        loaderPanel,
        {
          yPercent: -125,
          duration: 0.95,
          ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
          force3D: true,
        },
        0
      );
    }

    // Dynamic curved hem: bows downward as it accelerates upwards, then flattens as it exits
    if (curvePath) {
      tl.to(
        curvePath,
        {
          attr: { d: 'M 0 0 L 1440 0 Q 720 160 0 0 Z' },
          duration: 0.45,
          ease: 'power2.out',
        },
        0
      );

      tl.to(
        curvePath,
        {
          attr: { d: 'M 0 0 L 1440 0 Q 720 0 0 0 Z' },
          duration: 0.5,
          ease: 'power2.in',
        },
        0.45
      );
    }
  }, []);

  useEffect(() => {
    lockScroll({ forceTop: true });

    const greetingPanel = greetingPanelRef.current;
    const loaderPanel = loaderPanelRef.current;

    if (!greetingPanel || !loaderPanel) return;

    // Initial setup:
    // Greeting panel is visible (0%), Loader panel is explicitly hidden and 100% down
    gsap.set(greetingPanel, { yPercent: 0, visibility: 'visible', force3D: true });
    gsap.set(loaderPanel, { yPercent: 100, visibility: 'hidden', force3D: true });

    let rafId = null;
    let pushTimeline = null;
    let progressStarted = false;
    let cleanupLoadListeners = null;

    // Start counting from 0% to 100%
    const startProgressCounter = () => {
      if (progressStarted || isExitingRef.current) return;
      progressStarted = true;

      const normalDuration = 1200; // Snappy, smooth 1.2s progression
      const startTime = performance.now();
      let finishStartTime = null;
      let finishStartProgress = 0;

      // Reliable page-load detection:
      // In modern browsers, document.readyState === 'complete' signals that HTML,
      // CSS stylesheets, fonts, and eager bundles are completely loaded.
      let pageLoaded = typeof document !== 'undefined' && document.readyState === 'complete';

      const markLoaded = () => {
        pageLoaded = true;
      };

      if (!pageLoaded && typeof window !== 'undefined') {
        window.addEventListener('load', markLoaded, { once: true });
        if (typeof document !== 'undefined') {
          document.addEventListener('readystatechange', () => {
            if (document.readyState === 'complete') markLoaded();
          });
          if (document.fonts?.ready) {
            document.fonts.ready.then(markLoaded).catch(markLoaded);
          }
        }
      }

      // Safety timeout: portfolio never stays blocked if an external script/font stalls
      const safetyTimer = setTimeout(() => {
        markLoaded();
      }, 4000);

      cleanupLoadListeners = () => {
        clearTimeout(safetyTimer);
        if (typeof window !== 'undefined') {
          window.removeEventListener('load', markLoaded);
        }
      };

      let lastProgressFloat = 0;
      let lastDisplayInt = 0;

      const tick = (now) => {
        if (isExitingRef.current) return;

        if (!pageLoaded && typeof document !== 'undefined' && document.readyState === 'complete') {
          pageLoaded = true;
        }

        const elapsed = now - startTime;
        let currentValFloat = 0;

        if (!pageLoaded) {
          // Page is STILL loading:
          // Loading check is now at 50%:
          // 1. From 0 to 50%: smooth ease-out progression over 450ms
          // 2. Beyond 50%: DO NOT WAIT OR FREEZE AT 50!
          //    Progresses very smoothly and continuously (subpixel fluid motion)
          //    towards 99% using a smooth exponential deceleration curve:
          //    50 + 49 * (1 - e^(-overTime / 2400))
          if (elapsed <= 450) {
            const ratio = elapsed / 450;
            const ease = 1 - (1 - ratio) * (1 - ratio);
            currentValFloat = ease * 50;
          } else {
            const overTime = elapsed - 450;
            // Continuous asymptotic growth from 50 towards 99:
            // Fluid on every single frame, capped strictly at 99.2
            const continuousPast50 = 49 * (1 - Math.exp(-overTime / 2400));
            currentValFloat = Math.min(50 + continuousPast50, 99.2);
          }
        } else {
          // Page IS completely loaded:
          if (finishStartTime === null) {
            finishStartTime = now;
            finishStartProgress = lastProgressFloat;
          }

          if (finishStartProgress < 50 && elapsed < normalDuration) {
            // Page loaded early (before 50%):
            // Glide smoothly from 0 to 100 at natural pace over normalDuration (no slowdown at 50)
            const ratio = Math.min(elapsed / normalDuration, 1);
            const ease = ratio < 0.5 ? 2 * ratio * ratio : 1 - Math.pow(-2 * ratio + 2, 2) / 2;
            currentValFloat = ease * 100;
          } else {
            // Page finished loading while waiting past 50 (e.g. at 52%, 67%, 85%, etc.)
            // or after normalDuration:
            // Seamlessly and smoothly complete the remaining distance to 100 at its natural pace
            const remaining = Math.max(0.5, 100 - finishStartProgress);
            const finishDuration = Math.min(320, Math.max(180, remaining * 5));
            const finishElapsed = now - finishStartTime;
            const finishRatio = Math.min(finishElapsed / finishDuration, 1);
            // Smooth cubic ease-out to 100
            const easeOut = 1 - Math.pow(1 - finishRatio, 3);
            currentValFloat = Math.min(finishStartProgress + easeOut * remaining, 100);
          }
        }

        // Strictly monotonic forward progress
        lastProgressFloat = Math.max(lastProgressFloat, currentValFloat);

        // Strict guarantee: CANNOT reach 100 until page is completely loaded
        if (!pageLoaded && lastProgressFloat >= 100) {
          lastProgressFloat = 99.2;
        }

        const displayInt = Math.min(Math.floor(lastProgressFloat), pageLoaded ? 100 : 99);
        lastDisplayInt = Math.max(lastDisplayInt, displayInt);

        // TIGHT SYNCHRONOUS COUPLING:
        // Progress bar width is updated with floating-point subpixel precision on every frame
        // so it glides with continuous silky smoothness even when loading takes longer
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${lastProgressFloat}%`;
        }
        if (counterNumRef.current) {
          counterNumRef.current.textContent = String(lastDisplayInt);
        }
        setProgress(lastDisplayInt);

        if (lastProgressFloat < 100 || !pageLoaded) {
          rafId = requestAnimationFrame(tick);
        } else {
          // Hit 100% AND page is 100% loaded: brief pause (100ms) then slide curtain up to reveal site
          setTimeout(() => {
            triggerFinalExit();
          }, 100);
        }
      };

      rafId = requestAnimationFrame(tick);
    };

    // Flow Step 1: Greeting animates in, holds for ~1s
    // Flow Step 2: Push transition where greeting goes UP and loader percentage pushes UP from down
    const pushTimer = setTimeout(() => {
      // Make loader visible before animating up
      gsap.set(loaderPanel, { visibility: 'visible', yPercent: 100 });

      pushTimeline = gsap.timeline({
        onStart: () => {
          // Start counting as the panel pushes up
          startProgressCounter();
        },
      });

      // Simultaneous vertical curtain push:
      // Greeting panel slides up out of screen (-100%)
      // Loader panel slides up from below into view (0%)
      pushTimeline.to(
        greetingPanel,
        {
          yPercent: -100,
          duration: 0.85,
          ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
          force3D: true,
        },
        0
      );

      pushTimeline.to(
        loaderPanel,
        {
          yPercent: 0,
          duration: 0.85,
          ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
          force3D: true,
        },
        0
      );
    }, 1300);

    return () => {
      clearTimeout(pushTimer);
      if (rafId) cancelAnimationFrame(rafId);
      cleanupLoadListeners?.();
      pushTimeline?.kill();
      unlockScroll();
    };
  }, [triggerFinalExit]);

  return (
    <div
      ref={containerRef}
      className={`framer-preloader-root theme-${currentTheme}`}
      data-theme={currentTheme}
      aria-label="Loading portfolio"
      role="status"
    >
      {/* 1st: Theme-aware Name Greeting Panel with ultra-smooth AnimatedContent */}
      <div
        ref={greetingPanelRef}
        className="preloader-panel preloader-panel-greeting"
      >
        <div className="panel-greeting-inner">
          <h1 className="preloader-greeting-text" aria-label="Hello, I am Abhishek">
            <span className="greeting-line">
              <AnimatedContent
                direction="vertical"
                distance={55}
                duration={0.88}
                ease="cubic-bezier(0.16, 1, 0.3, 1)"
                scrollTrigger={false}
                animateOpacity={true}
                delay={0.05}
              >
                <span className="greeting-prefix">Hello, I am</span>
              </AnimatedContent>
            </span>
            <span className="greeting-line">
              <AnimatedContent
                direction="vertical"
                distance={70}
                duration={0.94}
                ease="cubic-bezier(0.16, 1, 0.3, 1)"
                scrollTrigger={false}
                animateOpacity={true}
                delay={0.18}
              >
                <span className="greeting-name">Abhishek</span>
              </AnimatedContent>
            </span>
          </h1>
        </div>
      </div>

      {/* 2nd: Percentage Counter & Progress Bar Panel (pushes up from below) */}
      <div
        ref={loaderPanelRef}
        className="preloader-panel preloader-panel-loader"
      >
        {/* Full-width Progress Bar positioned on exact vertical center */}
        <div className="loader-bar-track">
          <div
            ref={progressBarRef}
            className="loader-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Right Bottom Corner: Only the Percentage Counter */}
        <div className="loader-bottom-bar">
          <div className="loader-counter-wrap">
            <span ref={counterNumRef} className="loader-counter-num">{progress}</span>
            <span className="loader-counter-unit">%</span>
          </div>
        </div>

        {/* Curved lower hem that bows downward as the curtain rises */}
        <svg
          className="preloader-curtain-curve"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            ref={curvePathRef}
            d="M 0 0 L 1440 0 Q 720 0 0 0 Z"
          />
        </svg>
      </div>
    </div>
  );
}
