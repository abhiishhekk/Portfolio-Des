import { useRef, useCallback } from 'react'

export default function TiltCard({ children, className = '', style = {}, intensity = 10 }) {
  const ref = useRef(null)
  const innerRef = useRef(null)
  const rectRef = useRef(null)
  const rafId = useRef(null)

  const handleMouseEnter = useCallback(() => {
    if (ref.current) {
      rectRef.current = ref.current.getBoundingClientRect()
    }
    if (innerRef.current) {
      innerRef.current.style.transition = 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)'
      innerRef.current.style.willChange = 'transform'
    }
  }, [])

  const handleMouseMove = useCallback(
    e => {
      if (!ref.current || !innerRef.current) return
      if (!rectRef.current) {
        rectRef.current = ref.current.getBoundingClientRect()
      }
      const rect = rectRef.current
      const xVal = (e.clientX - rect.left) / rect.width - 0.5
      const yVal = (e.clientY - rect.top) / rect.height - 0.5

      if (rafId.current) cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(() => {
        if (!innerRef.current) return
        const rotX = -yVal * intensity * 2
        const rotY = xVal * intensity * 2
        innerRef.current.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(0)`
      })
    },
    [intensity]
  )

  const handleMouseLeave = useCallback(() => {
    rectRef.current = null
    if (rafId.current) cancelAnimationFrame(rafId.current)
    if (innerRef.current) {
      innerRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
      innerRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)'
      setTimeout(() => {
        if (innerRef.current) innerRef.current.style.willChange = 'auto'
      }, 500)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        perspective: 800,
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={innerRef}
        style={{
          transform: 'rotateX(0deg) rotateY(0deg) translateZ(0)',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  )
}
