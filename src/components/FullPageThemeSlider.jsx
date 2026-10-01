import { useState, useRef, useEffect, useCallback } from 'react'
import { Sun, Moon } from 'lucide-react'
import gsap from 'gsap'
import './FullPageThemeSlider.css'

export default function FullPageThemeSlider({ theme = 'dark', setTheme }) {
  const isDark = theme === 'dark'
  const [handleX, setHandleX] = useState(() =>
    typeof window !== 'undefined' ? (isDark ? window.innerWidth : 0) : 0
  )
  const [isDragging, setIsDragging] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleRef = useRef(null)
  const revealRef = useRef(null)
  const lineRef = useRef(null)
  const handleXRef = useRef(handleX)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const hasMovedRef = useRef(false)
  const animRef = useRef(null)
  const transitionFromThemeRef = useRef(theme)
  const rafIdRef = useRef(null)

  // Icon transition refs
  const iconWrapperRef = useRef(null)
  const sunIconRef = useRef(null)
  const moonIconRef = useRef(null)
  const prevThemeRef = useRef(theme)
  const isFirstRender = useRef(true)

  // Sun and moon transition
  useEffect(() => {
    const sun = sunIconRef.current
    const moon = moonIconRef.current
    const wrapper = iconWrapperRef.current

    if (!sun || !moon) return

    if (isFirstRender.current) {
      isFirstRender.current = false
      prevThemeRef.current = theme
      if (theme === 'dark') {
        gsap.set(sun, { opacity: 1, scale: 1, rotate: 0 })
        gsap.set(moon, { opacity: 0, scale: 0.35, rotate: 90 })
      } else {
        gsap.set(moon, { opacity: 1, scale: 1, rotate: 0 })
        gsap.set(sun, { opacity: 0, scale: 0.35, rotate: -90 })
      }
      return
    }

    if (prevThemeRef.current === theme) return
    prevThemeRef.current = theme

    gsap.killTweensOf([sun, moon, wrapper])

    if (theme === 'dark') {
      // Moon to sun
      gsap.to(moon, {
        opacity: 0,
        scale: 0.25,
        rotate: 90,
        duration: 0.38,
        ease: 'power2.inOut',
      })
      gsap.fromTo(
        sun,
        { opacity: 0, scale: 0.25, rotate: -90 },
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 0.5,
          ease: 'back.out(1.85)',
        }
      )
      if (wrapper) {
        gsap.fromTo(
          wrapper,
          { rotate: -25 },
          { rotate: 0, duration: 0.45, ease: 'power3.out' }
        )
      }
    } else {
      // Sun to moon
      gsap.to(sun, {
        opacity: 0,
        scale: 0.25,
        rotate: -90,
        duration: 0.38,
        ease: 'power2.inOut',
      })
      gsap.fromTo(
        moon,
        { opacity: 0, scale: 0.25, rotate: 90 },
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 0.5,
          ease: 'back.out(1.85)',
        }
      )
      if (wrapper) {
        gsap.fromTo(
          wrapper,
          { rotate: 25 },
          { rotate: 0, duration: 0.45, ease: 'power3.out' }
        )
      }
    }
  }, [theme])

  useEffect(() => {
    return () => {
      if (sunIconRef.current) gsap.killTweensOf(sunIconRef.current)
      if (moonIconRef.current) gsap.killTweensOf(moonIconRef.current)
      if (iconWrapperRef.current) gsap.killTweensOf(iconWrapperRef.current)
    }
  }, [])

  // Sync theme ref
  useEffect(() => {
    transitionFromThemeRef.current = theme
  }, [theme])

  // Sync handle position on resize
  useEffect(() => {
    if (isDraggingRef.current || isTransitioning) return

    let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0

    const updateRestPos = () => {
      const currentWidth = typeof window !== 'undefined' ? window.innerWidth : 0
      // Ignore height-only resize
      if (Math.abs(currentWidth - lastWidth) < 2) return
      lastWidth = currentWidth

      const targetX = isDark ? currentWidth : 0
      setHandleX(targetX)
      handleXRef.current = targetX
      transitionFromThemeRef.current = theme
      if (handleRef.current) {
        handleRef.current.style.left = `${targetX}px`
      }
    }

    updateRestPos()
    window.addEventListener('resize', updateRestPos)
    return () => window.removeEventListener('resize', updateRestPos)
  }, [isDark, isTransitioning, theme])

  // Update visual position
  const updateVisuals = useCallback((x) => {
    const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
    const clampedX = Math.max(0, Math.min(winWidth, x))
    handleXRef.current = clampedX

    if (handleRef.current) {
      handleRef.current.style.left = `${clampedX}px`
    }
    if (lineRef.current) {
      lineRef.current.style.left = `${clampedX}px`
    }
    if (revealRef.current) {
      const fromDark = transitionFromThemeRef.current === 'dark'
      revealRef.current.style.clipPath = !fromDark
        ? `inset(0 calc(${winWidth}px - ${clampedX}px) 0 0)`
        : `inset(0 0 0 ${clampedX}px)`
    }
  }, [])

  // Apply target theme
  const finishTransition = useCallback(
    (targetTheme) => {
      const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
      const isTargetDark = targetTheme === 'dark'
      const finalX = isTargetDark ? winWidth : 0

      // Hide reveal layer and line
      if (revealRef.current) {
        revealRef.current.style.display = 'none'
      }
      if (lineRef.current) {
        lineRef.current.style.display = 'none'
      }

      // Disable CSS transitions temporarily
      document.documentElement.classList.add('no-theme-transition')

      // Update theme attribute
      document.documentElement.setAttribute('data-theme', targetTheme)
      localStorage.setItem('theme', targetTheme)

      // Snap handle to edge
      setHandleX(finalX)
      handleXRef.current = finalX
      if (handleRef.current) {
        handleRef.current.style.left = `${finalX}px`
      }

      // Update state
      if (setTheme) {
        setTheme(targetTheme)
      }

      // Reset flags
      setIsTransitioning(false)
      setIsDragging(false)
      isDraggingRef.current = false

      // Update ref
      transitionFromThemeRef.current = targetTheme

      // Re-enable CSS transitions
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.documentElement.classList.remove('no-theme-transition')
        })
      })
    },
    [setTheme]
  )

  // Animate handle across screen
  const animateAcross = useCallback(
    (targetTheme, isClick = false) => {
      if (animRef.current) animRef.current.kill()

      const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
      const currentX = handleXRef.current
      const targetX = targetTheme === 'dark' ? winWidth : 0
      const dist = Math.abs(targetX - currentX)

      // Commit immediately if already at boundary
      if (dist < 6) {
        finishTransition(targetTheme)
        return
      }

      setIsTransitioning(true)
      setIsDragging(false)
      isDraggingRef.current = false

      if (revealRef.current) revealRef.current.style.display = ''
      if (lineRef.current) lineRef.current.style.display = ''

      const duration = isClick
        ? 0.72
        : Math.min(0.55, Math.max(0.28, (dist / winWidth) * 0.65))

      const ease = isClick ? 'power3.inOut' : 'power3.out'

      const obj = { x: currentX }
      animRef.current = gsap.to(obj, {
        x: targetX,
        duration,
        ease,
        onUpdate: () => {
          updateVisuals(obj.x)
          setHandleX(obj.x)
        },
        onComplete: () => {
          finishTransition(targetTheme)
        },
      })
    },
    [finishTransition, updateVisuals]
  )

  // Snap back to origin
  const snapBack = useCallback(
    (originTheme) => {
      if (animRef.current) animRef.current.kill()

      const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
      const currentX = handleXRef.current
      const targetX = originTheme === 'dark' ? winWidth : 0
      const dist = Math.abs(targetX - currentX)

      if (dist < 4) {
        if (revealRef.current) revealRef.current.style.display = 'none'
        if (lineRef.current) lineRef.current.style.display = 'none'
        setIsTransitioning(false)
        setIsDragging(false)
        isDraggingRef.current = false
        setHandleX(targetX)
        handleXRef.current = targetX
        if (handleRef.current) handleRef.current.style.left = `${targetX}px`
        return
      }

      setIsTransitioning(true)
      setIsDragging(false)
      isDraggingRef.current = false

      if (revealRef.current) revealRef.current.style.display = ''
      if (lineRef.current) lineRef.current.style.display = ''

      const duration = Math.min(0.45, Math.max(0.22, (dist / winWidth) * 0.55))
      const obj = { x: currentX }

      animRef.current = gsap.to(obj, {
        x: targetX,
        duration,
        ease: 'power3.out',
        onUpdate: () => {
          updateVisuals(obj.x)
          setHandleX(obj.x)
        },
        onComplete: () => {
          if (revealRef.current) revealRef.current.style.display = 'none'
          if (lineRef.current) lineRef.current.style.display = 'none'
          setIsTransitioning(false)
          setHandleX(targetX)
          handleXRef.current = targetX
          if (handleRef.current) handleRef.current.style.left = `${targetX}px`
        },
      })
    },
    [updateVisuals]
  )

  // Pointer drag start
  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return

    if (animRef.current) animRef.current.kill()
    transitionFromThemeRef.current = theme
    if (revealRef.current) revealRef.current.style.display = ''
    if (lineRef.current) lineRef.current.style.display = ''
    setIsDragging(true)
    isDraggingRef.current = true
    hasMovedRef.current = false
    startXRef.current = e.clientX

    try {
      e.currentTarget.setPointerCapture?.(e.pointerId)
    } catch {
      // ignore
    }
  }

  // Pointer move and release
  useEffect(() => {
    if (!isDragging) return

    const handlePointerMove = (e) => {
      if (!isDraggingRef.current) return

      if (Math.abs(e.clientX - startXRef.current) > 3) {
        hasMovedRef.current = true
        if (e.cancelable) {
          e.preventDefault()
        }
      }

      // Visual update
      updateVisuals(e.clientX)

      // State update
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(() => {
          setHandleX(handleXRef.current)
          rafIdRef.current = null
        })
      }
    }

    const handlePointerUp = (e) => {
      if (!isDraggingRef.current) return
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }

      try {
        e.target?.releasePointerCapture?.(e.pointerId)
      } catch {
        // ignore
      }

      const winWidth = window.innerWidth
      const currentX = handleXRef.current
      const currentTheme = transitionFromThemeRef.current || theme

      // Click without drag: toggle theme
      if (!hasMovedRef.current) {
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'
        animateAcross(nextTheme, true)
        return
      }

      // Check drag threshold
      if (currentTheme !== 'dark') {
        if (currentX > winWidth * 0.35) {
          animateAcross('dark', false)
        } else {
          snapBack('light')
        }
      } else {
        if (currentX < winWidth * 0.65) {
          animateAcross('light', false)
        } else {
          snapBack('dark')
        }
      }
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [animateAcross, isDragging, snapBack, theme, updateVisuals])

  const showReveal = isDragging || isTransitioning
  const isAtRest = !showReveal
  const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
  const clampedX = Math.max(0, Math.min(winWidth, handleX))

  // Calculate clip path
  const fromDark = transitionFromThemeRef.current === 'dark'
  let revealClipPath = 'none'
  if (showReveal) {
    if (!fromDark) {
      revealClipPath = `inset(0 calc(${winWidth}px - ${clampedX}px) 0 0)`
    } else {
      revealClipPath = `inset(0 0 0 ${clampedX}px)`
    }
  }

  const isAtLeft = clampedX < winWidth / 2

  return (
    <>
      {/* Reveal layer */}
      {showReveal && (
        <div
          ref={revealRef}
          className="fullpage-theme-reveal"
          style={{ clipPath: revealClipPath }}
          aria-hidden="true"
        />
      )}

      {/* Divider line */}
      {showReveal && (
        <div
          ref={lineRef}
          className="fullpage-slider-line"
          style={{ left: `${clampedX}px` }}
          aria-hidden="true"
        />
      )}

      {/* Slider handle */}
      <div
        ref={handleRef}
        className={`fullpage-slider-handle ${isDragging ? 'is-dragging' : ''} ${
          isAtRest ? 'is-at-rest' : ''
        } ${isAtLeft ? 'at-left' : 'at-right'}`}
        style={{ left: `${clampedX}px` }}
        onPointerDown={handlePointerDown}
        role="slider"
        tabIndex={0}
        aria-label="Full webpage theme comparison slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round((clampedX / winWidth) * 100)}
        aria-valuetext={isDark ? 'Dark Mode' : 'Light Mode'}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault()
            transitionFromThemeRef.current = theme
            animateAcross('dark', true)
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault()
            transitionFromThemeRef.current = theme
            animateAcross('light', true)
          } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            transitionFromThemeRef.current = theme
            animateAcross(theme === 'dark' ? 'light' : 'dark', true)
          }
        }}
      >
        <div className="fullpage-slider-handle-content">
          {/* Theme icons */}
          <span className="fullpage-slider-grip" aria-hidden="true">
            <span ref={iconWrapperRef} className="fullpage-slider-icons-wrapper">
              <span ref={sunIconRef} className="fullpage-slider-icon icon-sun">
                <Sun size={18} strokeWidth={2.2} />
              </span>
              <span ref={moonIconRef} className="fullpage-slider-icon icon-moon">
                <Moon size={18} strokeWidth={2.2} />
              </span>
            </span>
          </span>

          {/* Tooltip */}
          <div className="fullpage-slider-tooltip">
            {isAtLeft ? (
              <span>Slide right for Dark Mode →</span>
            ) : (
              <span>← Slide left for Light Mode</span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
