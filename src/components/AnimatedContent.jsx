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
  hoverScale = 1,
  hoverY = 0,
  hoverDuration = 0.35,
  hoverEase = 'power2.out',
  tag,
  as,
  style = {},
  ...props
}) => {
  const ref = useRef(null);
  const hasAnimatedInRef = useRef(false);
  const activeTimelineRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;

    let handlePointerEnter = null;
    let handlePointerLeave = null;

    if (hoverScale !== 1 || hoverY !== 0) {
      let isHovered = false;

      handlePointerEnter = () => {
        if (typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(hover: hover)').matches) {
          return;
        }
        isHovered = true;
        gsap.to(el, {
          scale: hoverScale,
          y: hoverY,
          duration: hoverDuration,
          ease: hoverEase,
          overwrite: 'auto'
        });
      };

      handlePointerLeave = () => {
        if (!isHovered) return;
        isHovered = false;
        gsap.to(el, {
          scale: 1,
          y: 0,
          duration: hoverDuration,
          ease: hoverEase,
          overwrite: 'auto'
        });
      };

      el.addEventListener('pointerenter', handlePointerEnter);
      el.addEventListener('pointerleave', handlePointerLeave);
    }

    if (distance === 0 && !animateOpacity && scale === 1 && !scrollTrigger) {
      hasAnimatedInRef.current = true;
      gsap.set(el, { visibility: 'visible' });
      return () => {
        if (handlePointerEnter) el.removeEventListener('pointerenter', handlePointerEnter);
        if (handlePointerLeave) el.removeEventListener('pointerleave', handlePointerLeave);
      };
    }

    const axis = direction === 'horizontal' ? 'x' : 'y';
    const offset = reverse ? -distance : distance;
    const startPct = (1 - threshold) * 100;

    // Exit animation
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
      return () => {
        if (handlePointerEnter) el.removeEventListener('pointerenter', handlePointerEnter);
        if (handlePointerLeave) el.removeEventListener('pointerleave', handlePointerLeave);
      };
    }

    // Initial entrance state
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
      if (handlePointerEnter) el.removeEventListener('pointerenter', handlePointerEnter);
      if (handlePointerLeave) el.removeEventListener('pointerleave', handlePointerLeave);
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
    scrollTrigger,
    hoverScale,
    hoverY,
    hoverDuration,
    hoverEase
  ]);

  const Tag = tag || as || 'div';
  const initialVisibility = (animateOpacity || distance !== 0 || scale !== 1) ? 'hidden' : 'visible';

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ visibility: initialVisibility, ...style }}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default AnimatedContent;
