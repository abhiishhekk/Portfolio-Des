import { useEffect } from 'react'
import Lenis from 'lenis'

export function useSmoothScroll() {
  useEffect(() => {
    // Respect user's motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    // Initialize Lenis smooth scroll with physics-based linear interpolation (lerp).
    // Using lerp instead of fixed duration/easing prevents discrete step-like jumps,
    // providing continuous inertia, fluid velocity, and seamless boundary deceleration.
    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1.0,
      gestureOrientation: 'vertical',
      orientation: 'vertical',
      smoothWheel: true,
      syncTouch: false,
      overscroll: false,
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
