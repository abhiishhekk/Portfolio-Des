import { useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'
import './ChromaGrid.css'

export default function ChromaGrid({
  children,
  radius = 320,
  damping = 0.45,
  fadeOut = 0.6,
  ease = 'power3.out',
  className = '',
}) {
  const containerRef = useRef(null)
  const spotlightRef = useRef(null)
  const channelMagentaRef = useRef(null)
  const channelCyanRef = useRef(null)
  const channelAmberRef = useRef(null)

  const rectRef = useRef(null)
  const posRef = useRef({ x: 0, y: 0 })
  const isInsideRef = useRef(false)

  useEffect(() => {
    if (spotlightRef.current) {
      spotlightRef.current.style.setProperty('--chroma-r', `${radius}px`)
    }
  }, [radius])

  // Update chromatic gradient positions via GPU-friendly CSS custom properties
  const updateGradients = useCallback((x, y) => {
    const el = spotlightRef.current
    if (!el) return
    el.style.setProperty('--chroma-mx', `${x - 5}px`)
    el.style.setProperty('--chroma-my', `${y - 3}px`)
    el.style.setProperty('--chroma-cx', `${x + 5}px`)
    el.style.setProperty('--chroma-cy', `${y + 3}px`)
    el.style.setProperty('--chroma-ax', `${x}px`)
    el.style.setProperty('--chroma-ay', `${y}px`)
  }, [])

  const handleMouseEnter = useCallback(() => {
    if (containerRef.current) {
      rectRef.current = containerRef.current.getBoundingClientRect()
    }
  }, [])

  const handleMouseMove = useCallback(
    (e) => {
      if (!containerRef.current) return
      if (!rectRef.current) {
        rectRef.current = containerRef.current.getBoundingClientRect()
      }
      const rect = rectRef.current
      const targetX = e.clientX - rect.left
      const targetY = e.clientY - rect.top

      if (!isInsideRef.current) {
        isInsideRef.current = true
        posRef.current = { x: targetX, y: targetY }
        updateGradients(targetX, targetY)

        if (spotlightRef.current) {
          gsap.to(spotlightRef.current, {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        }
      }

      gsap.to(posRef.current, {
        x: targetX,
        y: targetY,
        duration: damping,
        ease: ease,
        overwrite: 'auto',
        onUpdate: () => {
          updateGradients(posRef.current.x, posRef.current.y)
        },
      })
    },
    [damping, ease, updateGradients]
  )

  const handleMouseLeave = useCallback(() => {
    isInsideRef.current = false
    rectRef.current = null
    if (spotlightRef.current) {
      gsap.to(spotlightRef.current, {
        opacity: 0,
        duration: fadeOut,
        ease: ease,
        overwrite: 'auto',
      })
    }
  }, [fadeOut, ease])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    el.addEventListener('mouseenter', handleMouseEnter)
    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      el.removeEventListener('mouseenter', handleMouseEnter)
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseEnter, handleMouseMove, handleMouseLeave])

  return (
    <div ref={containerRef} className={`chroma-grid-container ${className}`}>
      {/* Chromatic Aberration Spotlight Layer */}
      <div ref={spotlightRef} className="chroma-spotlight" aria-hidden="true">
        <div ref={channelMagentaRef} className="chroma-channel chroma-channel-magenta" />
        <div ref={channelCyanRef} className="chroma-channel chroma-channel-cyan" />
        <div ref={channelAmberRef} className="chroma-channel chroma-channel-amber" />
      </div>

      {/* Grid Content */}
      <div className="chroma-grid-content">{children}</div>
    </div>
  )
}
