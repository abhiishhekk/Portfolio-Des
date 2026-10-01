import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { isScrollLocked } from '../utils/scrollLock'

export function useSmoothScroll() {
  useEffect(() => {
    // Respect reduced motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    // Skip on touch screens
    const isTouchDevice =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        window.innerWidth <= 768 ||
        ('ontouchstart' in window && !window.matchMedia('(hover: hover) and (pointer: fine)').matches))

    if (isTouchDevice) {
      return
    }

    // Initialize Lenis
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

    // Sync Lenis on ScrollTrigger refresh
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
