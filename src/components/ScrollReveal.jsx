import { useEffect, useRef, useMemo, forwardRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ScrollReveal.css'

gsap.registerPlugin(ScrollTrigger)

// Refresh ScrollTrigger when fonts load
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

const ScrollReveal = forwardRef(function ScrollReveal(
  {
    children,
    text,
    scrollContainerRef,
    enableBlur = false,
    baseOpacity = 0.2,
    baseRotation = 0,
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
  },
  forwardedRef
) {
  const containerRef = useRef(null)

  const setRefs = (node) => {
    containerRef.current = node
    if (typeof forwardedRef === 'function') {
      forwardedRef(node)
    } else if (forwardedRef) {
      forwardedRef.current = node
    }
  }

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

    // Respect reduced motion
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
              y: 0,
              filter: shouldBlur ? `blur(${blurStrength}px)` : 'none',
            },
            {
              ease: 'power1.out',
              opacity: 1,
              y: 0,
              filter: shouldBlur ? 'blur(0px)' : 'none',
              stagger: {
                each: 0.02,
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
        // Container reveal
        gsap.fromTo(
          el,
          {
            opacity: effectiveBaseOpacity,
            y: 0,
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
      ref={setRefs}
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
})

export default ScrollReveal
