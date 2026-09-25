import { useState, useEffect, useRef } from 'react';
import ThoughtLine from './ThoughtLine';
import './Preloader.css';

const STEP_LIST = [
  'Hold on for a moment...',
  'Initializing portfolio environment',
  'Loading projects, skills and visual assets',
  'Preparing interactive space',
  "We are ready, Let's Explore!",
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

  useEffect(() => {
    // Lock scroll while preloader is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

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

    // Sequentially reveal trace steps across the loading duration
    const totalRevealTime = 3400;
    const stepInterval = STEP_LIST.length > 1 ? totalRevealTime / (STEP_LIST.length - 1) : 0;
    const stepTimers = STEP_LIST.map((_, index) => {
      const delay = 400 + Math.round(index * stepInterval);
      return setTimeout(() => {
        setSteps(STEP_LIST.slice(0, index + 1));
      }, delay);
    });

    let settleTimeout;
    let finishTimeout;

    // Check after minimum ~4.3 seconds (giving time for the final step to display) and document is ready
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed >= 4300 && pageLoadedRef.current) {
        clearInterval(interval);

        // Settle ThoughtLine: folds trace and transitions to "Messages Over"
        setWorking(false);

        // Allow settle animation to complete before initiating page reveal
        settleTimeout = setTimeout(() => {
          onExitStart?.();
          setIsExiting(true);
          document.body.style.overflow = originalOverflow;

          finishTimeout = setTimeout(() => {
            onComplete?.();
          }, 650);
        }, 850);
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
      document.body.style.overflow = originalOverflow;
    };
  }, [onExitStart, onComplete]);

  return (
    <div
      className={`preloader-overlay ${isDark ? 'theme-dark' : 'theme-light'} ${isExiting ? 'is-exiting' : ''}`}
      data-theme={currentTheme}
      aria-label="Loading portfolio"
      role="status"
    >
      <ThoughtLine
        working={working}
        steps={steps}
        label="You got messages from Abhishek…"
        doneLabel="Messages Over"
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
        onSettle={seconds => console.log(`Thought for ${seconds}s`)}
      />
    </div>
  );
}
