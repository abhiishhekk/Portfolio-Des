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

  const posRef = useRef({ x: 0, y: 0 })
  const isInsideRef = useRef(false)

  // Update chromatic gradients
  const updateGradients = useCallback(
    (x, y) => {
      if (!channelMagentaRef.current || !channelCyanRef.current || !channelAmberRef.current) {
        return
      }

      // Channel 1: Magenta / Red-Violet (Offset slightly top-left)
      const mX = x - 5
      const mY = y - 3
      channelMagentaRef.current.style.background = `radial-gradient(circle ${radius}px at ${mX}px ${mY}px, rgba(202, 198, 200, 0.18) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 100%)`

      // Channel 2: Cyan / Blue (Offset slightly bottom-right)
      const cX = x + 5
      const cY = y + 3
      channelCyanRef.current.style.background = `radial-gradient(circle ${radius}px at ${cX}px ${cY}px, rgba(6, 182, 212, 0.18) 0%, rgba(14, 165, 233, 0.08) 40%, transparent 100%)`

      // Channel 3: Amber / Violet center
      channelAmberRef.current.style.background = `radial-gradient(circle ${radius * 0.75}px at ${x}px ${y}px, rgba(168, 85, 247, 0.12) 0%, rgba(245, 158, 11, 0.06) 50%, transparent 100%)`
    },
    [radius]
  )

  const handleMouseMove = useCallback(
    (e) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
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

    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseMove, handleMouseLeave])

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
