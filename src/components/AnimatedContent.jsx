'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const AnimatedContent = ({
  children,
  container,
  distance = 100,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  ease = 'power3.out',
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  threshold = 0.1,
  delay = 0,
  disappearAfter = 0,
  disappearDuration = 0.3,
  disappearEase = 'power3.in',
  onComplete,
  onDisappearanceComplete,
  className = '',
  active = true,
  scrollTrigger = true,
  style = {},
  ...props
}) => {
  const ref = useRef(null);
  const hasAnimatedInRef = useRef(false);
  const activeTimelineRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;

    const axis = direction === 'horizontal' ? 'x' : 'y';
    const offset = reverse ? -distance : distance;
    const startPct = (1 - threshold) * 100;

    // Handle closing / exit animation when active becomes false
    if (!active) {
      if (hasAnimatedInRef.current) {
        if (activeTimelineRef.current) {
          activeTimelineRef.current.kill();
        }
        activeTimelineRef.current = gsap.to(el, {
          [axis]: offset,
          scale,
          opacity: animateOpacity ? initialOpacity : 0,
          duration: disappearDuration,
          ease: disappearEase,
          onComplete: () => {
            hasAnimatedInRef.current = false;
            onDisappearanceComplete?.();
          }
        });
      } else {
        onDisappearanceComplete?.();
      }
      return;
    }

    // Active is true: set initial entrance state
    gsap.set(el, {
      [axis]: offset,
      scale,
      opacity: animateOpacity ? initialOpacity : 1,
      visibility: 'visible'
    });

    const tl = gsap.timeline({
      paused: true,
      delay,
      onComplete: () => {
        hasAnimatedInRef.current = true;
        if (onComplete) onComplete();
        if (disappearAfter > 0) {
          activeTimelineRef.current = gsap.to(el, {
            [axis]: reverse ? distance : -distance,
            scale,
            opacity: animateOpacity ? initialOpacity : 0,
            delay: disappearAfter,
            duration: disappearDuration,
            ease: disappearEase,
            onComplete: () => {
              hasAnimatedInRef.current = false;
              onDisappearanceComplete?.();
            }
          });
        }
      }
    });

    tl.to(el, {
      [axis]: 0,
      scale: 1,
      opacity: 1,
      duration,
      ease
    });

    activeTimelineRef.current = tl;

    let st = null;
    if (scrollTrigger) {
      let scrollerTarget = container || document.getElementById('snap-main-container') || null;
      if (typeof scrollerTarget === 'string') {
        scrollerTarget = document.querySelector(scrollerTarget);
      }
      st = ScrollTrigger.create({
        trigger: el,
        scroller: scrollerTarget,
        start: `top ${startPct}%`,
        once: true,
        onEnter: () => tl.play()
      });
    } else {
      tl.play();
    }

    return () => {
      if (st) st.kill();
      if (tl) tl.kill();
    };
  }, [
    active,
    container,
    distance,
    direction,
    reverse,
    duration,
    ease,
    initialOpacity,
    animateOpacity,
    scale,
    threshold,
    delay,
    disappearAfter,
    disappearDuration,
    disappearEase,
    onComplete,
    onDisappearanceComplete,
    scrollTrigger
  ]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ visibility: 'hidden', ...style }}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedContent;
