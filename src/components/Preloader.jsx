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

    // Start counting from 0% to 100%
    const startProgressCounter = () => {
      if (progressStarted || isExitingRef.current) return;
      progressStarted = true;

      const minDuration = 1500; // Minimum 1.5s as requested
      const startTime = performance.now();
      let pageLoaded = typeof document !== 'undefined' && document.readyState === 'complete';
      let finishStartTime = null;
      let finishStartProgress = 0;

      const handleWindowLoad = () => {
        pageLoaded = true;
      };
      if (!pageLoaded && typeof window !== 'undefined') {
        window.addEventListener('load', handleWindowLoad);
      }

      let lastProgress = 0;

      const tick = (now) => {
        if (isExitingRef.current) return;

        // Check live document readyState in case load event fired silently
        if (!pageLoaded && typeof document !== 'undefined' && document.readyState === 'complete') {
          pageLoaded = true;
        }

        const elapsed = now - startTime;
        let currentVal = 0;

        if (!pageLoaded) {
          // Page NOT yet loaded:
          // CANNOT reach 100 under any circumstance while page is still loading!
          if (elapsed <= 1300) {
            // Smooth progress from 0% to 90% over 1300ms
            currentVal = Math.min(Math.floor((elapsed / 1300) * 90), 90);
          } else {
            // Beyond 1300ms: Do NOT stay stuck at 90! Slowly creep upward (91, 92, 93... up to 98 max)
            const overTime = elapsed - 1300;
            // Every ~550ms gently advance by 1% so the user sees it is actively working, capped strictly at 98
            const creep = Math.min(Math.floor(overTime / 550), 8);
            currentVal = Math.min(90 + creep, 98);
          }
        } else {
          // Page IS completely loaded:
          if (finishStartTime === null) {
            finishStartTime = now;
            finishStartProgress = lastProgress;
          }

          if (elapsed < minDuration) {
            // Fast page load: continue smoothly at natural pace from 0 to 100 over minDuration
            const naturalRatio = elapsed / minDuration;
            currentVal = Math.min(Math.floor(naturalRatio * 100), 100);
          } else {
            // Page finished after minDuration:
            // Glide smoothly from current progress (e.g. 92% or 95%) to 100% over a natural 240ms pace
            const finishElapsed = now - finishStartTime;
            const finishRatio = Math.min(finishElapsed / 240, 1);
            currentVal = Math.min(
              Math.floor(finishStartProgress + finishRatio * (100 - finishStartProgress)),
              100
            );
          }
        }

        // Strictly monotonic forward progress
        lastProgress = Math.max(lastProgress, currentVal);

        // Strict guarantee: CANNOT reach 100 unless page is fully loaded
        if (!pageLoaded && lastProgress >= 99) {
          lastProgress = 98;
        }

        // TIGHT SYNCHRONOUS COUPLING:
        // Direct DOM write to both the progress bar fill and the counter number on the exact same frame
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${lastProgress}%`;
        }
        if (counterNumRef.current) {
          counterNumRef.current.textContent = String(lastProgress);
        }
        setProgress(lastProgress);

        if (lastProgress < 100 || !pageLoaded) {
          rafId = requestAnimationFrame(tick);
        } else {
          // Hit 100% AND page is 100% loaded: brief pause then slide curtain up to reveal site
          setTimeout(() => {
            triggerFinalExit();
          }, 140);
        }
      };

      rafId = requestAnimationFrame(tick);
    };

    // Flow Step 1: Greeting animates in, holds for 1s
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
    }, 1800);

    return () => {
      clearTimeout(pushTimer);
      if (rafId) cancelAnimationFrame(rafId);
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
