import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
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

      let targetProgressFloat = 0;
      let renderedProgressFloat = 0;
      let lastDisplayInt = 0;
      let lastFrameTime = performance.now();

      const tick = (now) => {
        if (isExitingRef.current) return;

        if (!pageLoaded && typeof document !== 'undefined' && document.readyState === 'complete') {
          pageLoaded = true;
        }

        const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
        lastFrameTime = now;

        const elapsed = now - startTime;
        let calculatedTarget = 0;

        if (!pageLoaded) {
          // Page is STILL loading:
          // Loading check is at 50%:
          // 1. From 0 to 50%: smooth linear progression over 500ms
          // 2. Beyond 50%: DO NOT WAIT OR FREEZE AT 50!
          //    Progresses continuously towards 99% using an exponential asymptotic curve
          if (elapsed <= 500) {
            calculatedTarget = (elapsed / 500) * 50;
          } else {
            const overTime = elapsed - 500;
            // Asymptotically approaches 99 smoothly
            const past50 = 49 * (1 - Math.exp(-overTime / 2600));
            calculatedTarget = Math.min(50 + past50, 99.2);
          }
        } else {
          // Page IS completely loaded:
          if (finishStartTime === null) {
            finishStartTime = now;
            finishStartProgress = targetProgressFloat;
          }

          if (finishStartProgress < 50 && elapsed < normalDuration) {
            // Page loaded early (before 50%):
            // Glide smoothly from 0 to 100 at natural pace over normalDuration
            const ratio = Math.min(elapsed / normalDuration, 1);
            calculatedTarget = ratio * 100;
          } else {
            // Page finished loading while waiting past 50 (or after normalDuration):
            // Seamlessly and smoothly complete the remaining distance to 100 at its natural pace
            const remaining = Math.max(0.5, 100 - finishStartProgress);
            const finishDuration = Math.min(320, Math.max(180, remaining * 5));
            const finishElapsed = now - finishStartTime;
            const finishRatio = Math.min(finishElapsed / finishDuration, 1);
            const easeOut = 1 - Math.pow(1 - finishRatio, 2.5);
            calculatedTarget = Math.min(finishStartProgress + easeOut * remaining, 100);
          }
        }

        // Strictly monotonic target
        targetProgressFloat = Math.max(targetProgressFloat, calculatedTarget);
        if (!pageLoaded && targetProgressFloat >= 100) {
          targetProgressFloat = 99.2;
        }

        // CONTINUOUS DAMPED INTERPOLATION (SMOOTH ORGANIC GROWTH):
        // Rather than jumping directly when advancing 1 percent, rendered progress
        // grows softly and continuously into each new value with subpixel fluid damping
        const lerpFactor = 1 - Math.exp(-9.0 * dt);
        renderedProgressFloat += (targetProgressFloat - renderedProgressFloat) * lerpFactor;
        renderedProgressFloat = Math.max(renderedProgressFloat, 0);

        // Strict guarantee: CANNOT reach 100 until page is completely loaded
        if (!pageLoaded && renderedProgressFloat >= 99.5) {
          renderedProgressFloat = 99.2;
        }

        // Completion check: 100% loaded and rendered width has caught up
        const isComplete = pageLoaded && targetProgressFloat >= 99.9 && (100 - renderedProgressFloat) <= 0.2;
        if (isComplete) {
          renderedProgressFloat = 100;
        }

        const displayInt = Math.min(Math.floor(renderedProgressFloat), pageLoaded ? 100 : 99);
        lastDisplayInt = Math.max(lastDisplayInt, displayInt);

        // TIGHT SYNCHRONOUS COUPLING:
        // Progress bar width is written with 3-decimal subpixel precision on every frame
        // so the bar physically grows like liquid rather than advancing directly
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${renderedProgressFloat.toFixed(3)}%`;
        }
        if (counterNumRef.current) {
          counterNumRef.current.textContent = String(lastDisplayInt);
        }
        setProgress(lastDisplayInt);

        if (!isComplete) {
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

    // Hardware-accelerated smooth entrance for greeting text
    const greetingTl = gsap.timeline({ delay: 0.08 });
    greetingTl.fromTo(
      '.greeting-reveal-item',
      {
        y: 45,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.14,
        ease: 'power3.out',
        force3D: true,
      }
    );

    // Flow Step 1: Greeting animates in smoothly, holds comfortably so user can easily read it
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
    }, 1850);

    return () => {
      clearTimeout(pushTimer);
      if (rafId) cancelAnimationFrame(rafId);
      cleanupLoadListeners?.();
      greetingTl?.kill();
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
      {/* 1st: Theme-aware Name Greeting Panel with silky-smooth hardware-accelerated entrance */}
      <div
        ref={greetingPanelRef}
        className="preloader-panel preloader-panel-greeting"
      >
        <div className="panel-greeting-inner">
          <h1 className="preloader-greeting-text" aria-label="Hello, I am Abhishek">
            <span className="greeting-line">
              <span className="greeting-reveal-item greeting-prefix">Hello, I am</span>
            </span>
            <span className="greeting-line">
              <span className="greeting-reveal-item greeting-name">Abhishek</span>
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
