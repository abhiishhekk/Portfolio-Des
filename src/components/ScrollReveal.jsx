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
  start = 'top 92%',
  end = 'top 70%',
  rotationEnd = 'top 75%',
  wordAnimationEnd = 'top 70%',
  scrub = 0.5,
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

    // On smartphones: Bypass heavy GSAP ScrollTrigger entirely to prevent touch-scroll lag.
    // Uses native IntersectionObserver + hardware-accelerated CSS fade-up transition.
    if (isTouch) {
      el.classList.add('mobile-reveal')
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed')
              observer.unobserve(entry.target)
            }
          })
        },
        { rootMargin: '0px 0px -5% 0px', threshold: 0.1 }
      )
      observer.observe(el)
      return () => {
        observer.disconnect()
      }
    }

    const shouldBlur = enableBlur
    const effectiveRotation = baseRotation
    const effectiveStart = start
    const effectiveEnd = end || 'top 70%'
    const effectiveWordEnd = wordAnimationEnd || end || 'top 70%'
    const effectiveBaseOpacity = baseOpacity
    const effectiveScrub = scrub

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
