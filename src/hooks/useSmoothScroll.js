import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { isScrollLocked } from '../utils/scrollLock'

export function useSmoothScroll() {
  useEffect(() => {
    // Respect user's motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    // Do NOT run Lenis on smartphones / touch screens.
    const isTouchDevice =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        window.innerWidth <= 768 ||
        ('ontouchstart' in window && !window.matchMedia('(hover: hover) and (pointer: fine)').matches))

    if (isTouchDevice) {
      return
    }

    // Initialize Lenis smooth scroll tuned for Apple-grade fluid momentum
    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 0.95,
      gestureOrientation: 'vertical',
      orientation: 'vertical',
      smoothWheel: true,
      syncTouch: false,
      autoRaf: true,
      autoResize: true,
    })

    window.__lenis = lenis

    const onScroll = () => {
      ScrollTrigger.update()
    }
    lenis.on('scroll', onScroll)

    // Re-measure Lenis scroll limit whenever ScrollTrigger pins or unpins elements
    const onRefresh = () => {
      lenis.resize()
    }
    ScrollTrigger.addEventListener('refresh', onRefresh)

    if (isScrollLocked()) {
      lenis.stop()
    }

    return () => {
      ScrollTrigger.removeEventListener('refresh', onRefresh)
      lenis.off('scroll', onScroll)
      lenis.destroy()
      delete window.__lenis
    }
  }, [])
}
