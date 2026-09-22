import { useEffect } from 'react'
import Lenis from 'lenis'

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

    // Initialize Lenis smooth scroll for desktop mouse wheels and trackpads
    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1.0,
      gestureOrientation: 'vertical',
      orientation: 'vertical',
      smoothWheel: true,
      syncTouch: false,
      autoRaf: true,
      autoResize: true,
    })

    window.__lenis = lenis

    return () => {
      lenis.destroy()
      delete window.__lenis
    }
  }, [])
}
