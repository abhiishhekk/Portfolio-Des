import { useState, useEffect, useRef } from 'react';
import ThoughtLine from './ThoughtLine';
import { lockScroll, unlockScroll } from '../utils/scrollLock';
import './Preloader.css';

const STEP_LIST = [
  'Starting the engine',
  'Initializing environment',
  'Loading projects, skills and visual assets',
  'Preparing interactive space',
  "Almost done...",
];

export default function Preloader({ theme, onExitStart, onComplete }) {
  const [working, setWorking] = useState(true);
  const [steps, setSteps] = useState([]);
  const [isExiting, setIsExiting] = useState(false);

  const currentTheme =
    theme ||
    (typeof document !== 'undefined'
      ? document.documentElement.getAttribute('data-theme')
      : null) ||
    (typeof window !== 'undefined' && localStorage.getItem('theme')) ||
    'dark';
  const isDark = currentTheme === 'dark';

  const startTimeRef = useRef(Date.now());
  const pageLoadedRef = useRef(
    typeof document !== 'undefined' && document.readyState === 'complete'
  );
  const onExitStartRef = useRef(onExitStart);
  onExitStartRef.current = onExitStart;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Lock scroll during preloader
    lockScroll({ forceTop: true });

    const handleWindowLoad = () => {
      pageLoadedRef.current = true;
    };

    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        pageLoadedRef.current = true;
      } else {
        window.addEventListener('load', handleWindowLoad);
      }
    }

    // Reveal steps sequentially
    const totalRevealTime = 2200;
    const stepInterval = STEP_LIST.length > 1 ? totalRevealTime / (STEP_LIST.length - 1) : 0;
    const stepTimers = STEP_LIST.map((_, index) => {
      const delay = 300 + Math.round(index * stepInterval);
      return setTimeout(() => {
        setSteps(STEP_LIST.slice(0, index + 1));
      }, delay);
    });

    let settleTimeout;
    let finishTimeout;

    // Check if ready to reveal
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed >= 3000 && pageLoadedRef.current) {
        clearInterval(interval);

        // Mark loading complete
        setWorking(false);

        // Trigger exit animation
        settleTimeout = setTimeout(() => {
          onExitStartRef.current?.();
          setIsExiting(true);
          unlockScroll();

          finishTimeout = setTimeout(() => {
            onCompleteRef.current?.();
          }, 600);
        }, 750);
      }
    }, 100);

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('load', handleWindowLoad);
      }
      stepTimers.forEach(t => clearTimeout(t));
      clearInterval(interval);
      clearTimeout(settleTimeout);
      clearTimeout(finishTimeout);
      unlockScroll();
    };
  }, []);

  return (
    <div
      className={`preloader-overlay ${isDark ? 'theme-dark' : 'theme-light'} ${isExiting ? 'is-exiting' : ''}`}
      data-theme={currentTheme}
      aria-label="Loading portfolio"
      role="status"
      onTouchMove={e => e.preventDefault()}
      onWheel={e => e.preventDefault()}
    >
      <ThoughtLine
        working={working}
        steps={steps}
        label="Getting the webpage ready..."
        doneLabel="We are ready!"
        glyph="sparkle"
        fontSize={16}
        breathPeriod={1.6}
        breathDepth={0.45}
        settleDuration={480}
        settleBlur={3}
        collapsible
        collapseOnSettle
        showTimer
        color={isDark ? '#ededed' : '#0a0a0a'}
      />
    </div>
  );
}
