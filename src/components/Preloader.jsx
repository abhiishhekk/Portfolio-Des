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
  const loaderPanelRef = useRef(null);
  const greetingPanelRef = useRef(null);
  const progressBarRef = useRef(null);
  const counterNumRef = useRef(null);
  const curvePathRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [isGreetingActive, setIsGreetingActive] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(
    typeof document !== 'undefined' && document.readyState === 'complete'
  );

  const onExitStartRef = useRef(onExitStart);
  onExitStartRef.current = onExitStart;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const isPushingRef = useRef(false);
  const isPushTimelineCompleteRef = useRef(false);
  const isExitingRef = useRef(false);
  const pageLoadedRef = useRef(isPageLoaded);
  pageLoadedRef.current = isPageLoaded;

  const pushTimelineRef = useRef(null);
  const cancelRafRef = useRef(null);
  const handleUserSkipRef = useRef(null);

  // Trigger the final slide-up exit revealing the site beneath (from the Greeting stage)
  const triggerFinalExit = useCallback(() => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;

    const greetingPanel = greetingPanelRef.current;
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

    // Fade out greeting handwriting gently as curtain lifts
    tl.to(
      '.panel-greeting-inner',
      {
        opacity: 0,
        y: -24,
        duration: 0.28,
        ease: 'power2.out',
      },
      0
    );

    // Slide the greeting panel completely up past the top of the viewport like a rising curtain
    if (greetingPanel) {
      tl.to(
        greetingPanel,
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

  // Trigger push transition from percentage loader (stage 1) to multi-language greeting (stage 2)
  const triggerPushToGreeting = useCallback(() => {
    if (isPushingRef.current || isExitingRef.current) return;
    isPushingRef.current = true;

    if (cancelRafRef.current) {
      cancelRafRef.current();
    }

    if (progressBarRef.current) {
      progressBarRef.current.style.width = '100%';
    }
    if (counterNumRef.current) {
      counterNumRef.current.textContent = '100';
    }
    setProgress(100);

    const loaderPanel = loaderPanelRef.current;
    const greetingPanel = greetingPanelRef.current;

    if (!loaderPanel || !greetingPanel) return;

    setIsGreetingActive(true);
    gsap.set(greetingPanel, { visibility: 'visible', yPercent: 100, force3D: true });

    const pushTimeline = gsap.timeline({
      onComplete: () => {
        isPushTimelineCompleteRef.current = true;
        if (loaderPanel) {
          gsap.set(loaderPanel, { visibility: 'hidden' });
        }
      },
    });
    pushTimelineRef.current = pushTimeline;

    // Push progress loader upwards out of view
    pushTimeline.to(
      loaderPanel,
      {
        yPercent: -100,
        duration: 0.85,
        ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
        force3D: true,
      },
      0
    );

    // Push hello screen upwards into view
    pushTimeline.to(
      greetingPanel,
      {
        yPercent: 0,
        duration: 0.85,
        ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
        force3D: true,
      },
      0
    );
  }, []);

  // Called when all languages finish a complete cycle in AppleHelloLanguages
  const handleCycleComplete = useCallback(() => {
    triggerFinalExit();
  }, [triggerFinalExit]);

  // Called when any individual word finishes writing
  const handleWordComplete = useCallback(({ cycleCount }) => {
    if (cycleCount >= 1) {
      triggerFinalExit();
    }
  }, [triggerFinalExit]);

  // Handle skip action (click or keypress)
  const handleUserSkip = useCallback(() => {
    if (!isPushingRef.current) {
      // Still on progress bar stage: advance to greeting
      triggerPushToGreeting();
    } else if (isPushTimelineCompleteRef.current && !isExitingRef.current) {
      // On greeting stage: advance to final curtain exit
      triggerFinalExit();
    } else if (isPushingRef.current && !isPushTimelineCompleteRef.current && !isExitingRef.current) {
      // Mid-push transition: immediately finish push and exit
      pushTimelineRef.current?.kill();
      if (loaderPanelRef.current) {
        gsap.set(loaderPanelRef.current, { yPercent: -100, visibility: 'hidden' });
      }
      if (greetingPanelRef.current) {
        gsap.set(greetingPanelRef.current, { yPercent: 0, visibility: 'visible' });
      }
      isPushTimelineCompleteRef.current = true;
      triggerFinalExit();
    }
  }, [triggerPushToGreeting, triggerFinalExit]);

  handleUserSkipRef.current = handleUserSkip;

  useEffect(() => {
    lockScroll({ forceTop: true });

    const loaderPanel = loaderPanelRef.current;
    const greetingPanel = greetingPanelRef.current;

    if (loaderPanel && greetingPanel) {
      gsap.set(loaderPanel, { yPercent: 0, visibility: 'visible', force3D: true });
      gsap.set(greetingPanel, { yPercent: 100, visibility: 'hidden', force3D: true });
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

    // Start counting from 0% to 100% immediately on mount (Stage 1)
    const startProgressCounter = () => {
      if (progressStarted || isPushingRef.current || isExitingRef.current) return;
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
        if (isPushingRef.current || isExitingRef.current) return;

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

        const isComplete =
          isCurrentlyLoaded &&
          targetProgressFloat >= 99.9 &&
          (100 - renderedProgressFloat) <= 0.2;

        if (isComplete) {
          renderedProgressFloat = 100;
        }

        const displayInt = Math.min(
          Math.floor(renderedProgressFloat),
          isCurrentlyLoaded ? 100 : 99
        );
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
          // Brief hold at 100% so user registers completion, then push to greeting screen
          setTimeout(() => {
            triggerPushToGreeting();
          }, 180);
        }
      };

      rafId = requestAnimationFrame(tick);
    };

    cancelRafRef.current = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    // Kick off progress counter right away
    startProgressCounter();

    // Safety timeout: automatically transition if page is taking unusually long
    const safetyTimer = setTimeout(() => {
      markLoaded();
      if (!isPushingRef.current) {
        triggerPushToGreeting();
      } else if (!isExitingRef.current) {
        triggerFinalExit();
      }
    }, 14000);

    // Keyboard shortcut (Space, Enter, Esc) to skip intro quickly
    const handleKeyDown = (e) => {
      if (['Space', 'Enter', 'Escape'].includes(e.code) || e.key === ' ' || e.key === 'Enter') {
        handleUserSkipRef.current?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(safetyTimer);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('load', markLoaded);
      if (rafId) cancelAnimationFrame(rafId);
      pushTimelineRef.current?.kill();
      unlockScroll();
    };
  }, [triggerFinalExit, triggerPushToGreeting]);

  return (
    <div
      ref={containerRef}
      className={`framer-preloader-root theme-${currentTheme}`}
      data-theme={currentTheme}
      aria-label="Loading portfolio"
      role="status"
      onClick={handleUserSkip}
      style={{ cursor: 'pointer' }}
    >
      {/* 1st Stage: Percentage Counter & Progress Bar Panel (Immediate on Mount) */}
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

        {/* Right Bottom Corner: Percentage Counter */}
        <div className="loader-bottom-bar">
          <div className="loader-counter-wrap">
            <span ref={counterNumRef} className="loader-counter-num">{progress}</span>
            <span className="loader-counter-unit">%</span>
          </div>
        </div>
      </div>

      {/* 2nd Stage: Theme-aware Apple Hello Multi-Language Greeting Panel (Pushes up from below) */}
      <div
        ref={greetingPanelRef}
        className="preloader-panel preloader-panel-greeting"
      >
        <div className="panel-greeting-inner">
          {isGreetingActive && (
            <AppleHelloLanguages
              isPageLoaded={isPageLoaded}
              onCycleComplete={handleCycleComplete}
              onWordComplete={handleWordComplete}
            />
          )}
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
