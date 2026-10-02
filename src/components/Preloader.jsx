import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import AppleHelloLanguages from './AppleHelloLanguages';
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
  const [isPageLoaded, setIsPageLoaded] = useState(
    typeof document !== 'undefined' && document.readyState === 'complete'
  );

  const onExitStartRef = useRef(onExitStart);
  onExitStartRef.current = onExitStart;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const isPushingRef = useRef(false);
  const isExitingRef = useRef(false);
  const pageLoadedRef = useRef(isPageLoaded);
  pageLoadedRef.current = isPageLoaded;

  const startProgressCounterRef = useRef(null);

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

  // Trigger push transition from multi-language greeting to percentage loader
  const triggerPushTransition = useCallback(() => {
    if (isPushingRef.current || isExitingRef.current) return;
    isPushingRef.current = true;

    const greetingPanel = greetingPanelRef.current;
    const loaderPanel = loaderPanelRef.current;

    if (!greetingPanel || !loaderPanel) return;

    gsap.set(loaderPanel, { visibility: 'visible', yPercent: 100 });

    const pushTimeline = gsap.timeline({
      onStart: () => {
        if (startProgressCounterRef.current) {
          startProgressCounterRef.current();
        }
      },
    });

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
  }, []);

  // Called when all 4 languages finish a complete cycle
  const handleCycleComplete = useCallback(({ isPageLoaded: loaded }) => {
    if (loaded || pageLoadedRef.current) {
      triggerPushTransition();
    }
  }, [triggerPushTransition]);

  // Called when any individual word finishes writing
  const handleWordComplete = useCallback(({ cycleCount }) => {
    // If we've already done at least 1 full cycle and page is loaded, transition gracefully
    if (cycleCount >= 1 && pageLoadedRef.current) {
      triggerPushTransition();
    }
  }, [triggerPushTransition]);

  useEffect(() => {
    lockScroll({ forceTop: true });

    const greetingPanel = greetingPanelRef.current;
    const loaderPanel = loaderPanelRef.current;

    if (greetingPanel && loaderPanel) {
      gsap.set(greetingPanel, { yPercent: 0, visibility: 'visible', force3D: true });
      gsap.set(loaderPanel, { yPercent: 100, visibility: 'hidden', force3D: true });
    }

    let rafId = null;
    let progressStarted = false;

    // Page-load tracking
    const markLoaded = () => {
      setIsPageLoaded(true);
      pageLoadedRef.current = true;
    };

    if (typeof document !== 'undefined' && document.readyState === 'complete') {
      markLoaded();
    } else if (typeof window !== 'undefined') {
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

    // Start counting from 0% to 100%
    const startProgressCounter = () => {
      if (progressStarted || isExitingRef.current) return;
      progressStarted = true;

      const normalDuration = 1000;
      const startTime = performance.now();
      let finishStartTime = null;
      let finishStartProgress = 0;

      let targetProgressFloat = 0;
      let renderedProgressFloat = 0;
      let lastDisplayInt = 0;
      let lastFrameTime = performance.now();

      const tick = (now) => {
        if (isExitingRef.current) return;

        const isCurrentlyLoaded = pageLoadedRef.current;
        const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
        lastFrameTime = now;

        const elapsed = now - startTime;
        let calculatedTarget = 0;

        if (!isCurrentlyLoaded) {
          if (elapsed <= 500) {
            calculatedTarget = (elapsed / 500) * 50;
          } else {
            const overTime = elapsed - 500;
            const past50 = 49 * (1 - Math.exp(-overTime / 2600));
            calculatedTarget = Math.min(50 + past50, 99.2);
          }
        } else {
          if (finishStartTime === null) {
            finishStartTime = now;
            finishStartProgress = targetProgressFloat;
          }

          if (finishStartProgress < 50 && elapsed < normalDuration) {
            const ratio = Math.min(elapsed / normalDuration, 1);
            calculatedTarget = ratio * 100;
          } else {
            const remaining = Math.max(0.5, 100 - finishStartProgress);
            const finishDuration = Math.min(320, Math.max(180, remaining * 5));
            const finishElapsed = now - finishStartTime;
            const finishRatio = Math.min(finishElapsed / finishDuration, 1);
            const easeOut = 1 - Math.pow(1 - finishRatio, 2.5);
            calculatedTarget = Math.min(finishStartProgress + easeOut * remaining, 100);
          }
        }

        targetProgressFloat = Math.max(targetProgressFloat, calculatedTarget);
        if (!isCurrentlyLoaded && targetProgressFloat >= 100) {
          targetProgressFloat = 99.2;
        }

        const lerpFactor = 1 - Math.exp(-9.0 * dt);
        renderedProgressFloat += (targetProgressFloat - renderedProgressFloat) * lerpFactor;
        renderedProgressFloat = Math.max(renderedProgressFloat, 0);

        if (!isCurrentlyLoaded && renderedProgressFloat >= 99.5) {
          renderedProgressFloat = 99.2;
        }

        const isComplete = isCurrentlyLoaded && targetProgressFloat >= 99.9 && (100 - renderedProgressFloat) <= 0.2;
        if (isComplete) {
          renderedProgressFloat = 100;
        }

        const displayInt = Math.min(Math.floor(renderedProgressFloat), isCurrentlyLoaded ? 100 : 99);
        lastDisplayInt = Math.max(lastDisplayInt, displayInt);

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
          setTimeout(() => {
            triggerFinalExit();
          }, 100);
        }
      };

      rafId = requestAnimationFrame(tick);
    };

    startProgressCounterRef.current = startProgressCounter;

    // Safety timeout: automatically transition after max 14s even if network is slow
    const safetyTimer = setTimeout(() => {
      markLoaded();
      triggerPushTransition();
    }, 14000);

    // Keyboard shortcut (Space, Enter, Esc) to skip intro quickly
    const handleKeyDown = (e) => {
      if (['Space', 'Enter', 'Escape'].includes(e.code) || e.key === ' ' || e.key === 'Enter') {
        markLoaded();
        triggerPushTransition();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(safetyTimer);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('load', markLoaded);
      if (rafId) cancelAnimationFrame(rafId);
      unlockScroll();
    };
  }, [triggerFinalExit, triggerPushTransition]);

  return (
    <div
      ref={containerRef}
      className={`framer-preloader-root theme-${currentTheme}`}
      data-theme={currentTheme}
      aria-label="Loading portfolio"
      role="status"
      onClick={triggerPushTransition}
      style={{ cursor: 'pointer' }}
    >
      {/* 1st: Theme-aware Apple Hello Multi-Language Greeting Panel */}
      <div
        ref={greetingPanelRef}
        className="preloader-panel preloader-panel-greeting"
      >
        <div className="panel-greeting-inner">
          <AppleHelloLanguages
            isPageLoaded={isPageLoaded}
            onCycleComplete={handleCycleComplete}
            onWordComplete={handleWordComplete}
          />
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
