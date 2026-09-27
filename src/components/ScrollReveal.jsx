import { useEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ScrollReveal.css'

gsap.registerPlugin(ScrollTrigger)

// Debounced singleton for font-ready refresh across all ScrollReveal instances
let fontRefreshTimeout = null
function requestScrollTriggerRefresh() {
  if (typeof document === 'undefined' || !document.fonts?.ready) return
  if (!fontRefreshTimeout) {
    document.fonts.ready.then(() => {
      fontRefreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh()
        fontRefreshTimeout = null
      }, 60)
    })
  }
}

export default function ScrollReveal({
  children,
  text,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.2,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  start = 'top 95%',
  end = 'bottom 88%',
  rotationEnd = 'bottom 88%',
  wordAnimationEnd = 'bottom 88%',
  scrub = 0.8,
  style = {},
  tag: Tag = 'div',
}) {
  const containerRef = useRef(null)

  const isPureText = useMemo(() => {
    if (typeof text === 'string') return true
    if (typeof children === 'string') return true
    if (Array.isArray(children) && children.length > 0 && children.every(c => typeof c === 'string')) return true
    return false
  }, [children, text])

  const rawText = useMemo(() => {
    if (typeof text === 'string') return text
    if (typeof children === 'string') return children
    if (Array.isArray(children)) {
      return children.map(c => (typeof c === 'string' ? c : '')).join('')
    }
    return ''
  }, [children, text])

  const splitText = useMemo(() => {
    if (!isPureText || !rawText) return null
    return rawText.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word
      return (
        <span className="word" key={index}>
          {word}
        </span>
      )
    })
  }, [isPureText, rawText])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // If user prefers reduced motion, show content directly in place
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.opacity = '1'
      el.style.filter = 'none'
      const words = el.querySelectorAll('.word')
      words.forEach(w => {
        w.style.opacity = '1'
        w.style.filter = 'none'
      })
      return
    }

    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        window.innerWidth <= 768 ||
        'ontouchstart' in window)

    // On mobile / touch devices, disable expensive CSS Gaussian blur entirely.
    // CSS blur on dozens of elements during momentum scrolling overflows mobile GPU VRAM
    // and causes the browser process to freeze for multiple seconds.
    const shouldBlur = !isTouch && enableBlur

    // On mobile, avoid rotation to prevent continuous matrix rasterization.
    const effectiveRotation = isTouch ? 0 : baseRotation

    // On mobile, trigger earlier and complete earlier (in the lower third of the screen)
    // so content never appears late or delayed to the user.
    const effectiveStart = isTouch ? 'top 98%' : start
    const effectiveEnd = isTouch ? 'top 72%' : (end || wordAnimationEnd)
    const effectiveWordEnd = isTouch ? 'top 72%' : (wordAnimationEnd || end)
    const effectiveBaseOpacity = isTouch ? Math.max(baseOpacity, 0.4) : baseOpacity

    // On mobile, use a fast, tight scrub (0.15) so animations don't lag behind 800ms
    // after the user flicks their finger, completely eliminating animation backlogs.
    const effectiveScrub = isTouch
      ? (typeof scrub === 'number' ? Math.min(scrub, 0.15) : true)
      : scrub

    const scroller =
      scrollContainerRef && scrollContainerRef.current
        ? scrollContainerRef.current
        : window

    const ctx = gsap.context(() => {
      if (effectiveRotation !== 0) {
        gsap.fromTo(
          el,
          { transformOrigin: '0% 50%', rotate: effectiveRotation },
          {
            ease: 'none',
            rotate: 0,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: effectiveStart,
              end: rotationEnd || effectiveEnd,
              scrub: effectiveScrub,
              fastScrollEnd: true,
              preventOverlaps: true,
            },
          }
        )
      }

      if (isPureText) {
        const wordElements = el.querySelectorAll('.word')
        if (wordElements.length > 0) {
          gsap.fromTo(
            wordElements,
            {
              opacity: effectiveBaseOpacity,
              y: isTouch ? 8 : 0,
              filter: shouldBlur ? `blur(${blurStrength}px)` : 'none',
            },
            {
              ease: 'power1.out',
              opacity: 1,
              y: 0,
              filter: shouldBlur ? 'blur(0px)' : 'none',
              stagger: {
                each: isTouch ? 0.015 : 0.03,
                ease: 'power1.inOut',
              },
              scrollTrigger: {
                trigger: el,
                scroller,
                start: effectiveStart,
                end: effectiveWordEnd,
                scrub: effectiveScrub,
                fastScrollEnd: true,
                preventOverlaps: true,
              },
            }
          )
        }
      } else {
        // Container element (cards, buttons, sections)
        gsap.fromTo(
          el,
          {
            opacity: effectiveBaseOpacity,
            y: isTouch ? 12 : 0,
            filter: shouldBlur ? `blur(${blurStrength}px)` : 'none',
          },
          {
            ease: 'power1.out',
            opacity: 1,
            y: 0,
            filter: shouldBlur ? 'blur(0px)' : 'none',
            scrollTrigger: {
              trigger: el,
              scroller,
              start: effectiveStart,
              end: effectiveEnd,
              scrub: effectiveScrub,
              fastScrollEnd: true,
              preventOverlaps: true,
            },
          }
        )
      }
    }, containerRef)

    requestScrollTriggerRefresh()

    return () => {
      ctx.revert()
    }
  }, [
    scrollContainerRef,
    enableBlur,
    baseRotation,
    baseOpacity,
    start,
    end,
    rotationEnd,
    wordAnimationEnd,
    blurStrength,
    scrub,
    isPureText,
    splitText,
  ])

  return (
    <Tag
      ref={containerRef}
      className={`scroll-reveal ${containerClassName}`.trim()}
      style={style}
    >
      {isPureText ? (
        <span className={`scroll-reveal-text ${textClassName}`.trim()}>{splitText}</span>
      ) : (
        children
      )}
    </Tag>
  )
}
