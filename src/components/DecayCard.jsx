import { useEffect, useRef, useId } from 'react'
import { gsap } from 'gsap'
import './DecayCard.css'

export default function DecayCard({
  id,
  image,
  alt = '',
  baseFrequency = 0.016,
  numOctaves = 4,
  seed = 4,
  maxDisplacement = 65,
  movementBound = 18,
  className = '',
}) {
  const reactId = useId()
  const filterId = `decay-filter-${id ?? reactId.replace(/:/g, '')}`
  const containerRef = useRef(null)
  const gRef = useRef(null)
  const displacementMapRef = useRef(null)

  const cursor = useRef({ x: 0, y: 0, active: false })
  const cachedCursor = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const lerp = (a, b, n) => (1 - n) * a + n * b
    const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c
    const distance = (x1, x2, y1, y2) => Math.hypot(x1 - x2, y1 - y2)

    const imgValues = {
      x: 0,
      y: 0,
      rz: 0,
      displacementScale: 0,
    }

    let rafId = 0
    let isHovering = false

    const handleMouseMove = ev => {
      const rect = container.getBoundingClientRect()
      cursor.current.x = ev.clientX - rect.left
      cursor.current.y = ev.clientY - rect.top
      cursor.current.active = true
      isHovering = true
    }

    const handleMouseEnter = ev => {
      const rect = container.getBoundingClientRect()
      cursor.current.x = ev.clientX - rect.left
      cursor.current.y = ev.clientY - rect.top
      cachedCursor.current.x = cursor.current.x
      cachedCursor.current.y = cursor.current.y
      cursor.current.active = true
      isHovering = true
    }

    const handleMouseLeave = () => {
      cursor.current.active = false
      isHovering = false
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    const render = () => {
      const rect = container.getBoundingClientRect()
      const w = rect.width || 400
      const h = rect.height || 225

      let targetX = 0
      let targetY = 0
      let targetRz = 0

      if (isHovering) {
        targetX = map(cursor.current.x, 0, w, -movementBound, movementBound)
        targetY = map(cursor.current.y, 0, h, -movementBound, movementBound)
        targetRz = map(cursor.current.x, 0, w, -2.5, 2.5)

        targetX = Math.max(-movementBound, Math.min(movementBound, targetX))
        targetY = Math.max(-movementBound, Math.min(movementBound, targetY))
      }

      imgValues.x = lerp(imgValues.x, targetX, 0.12)
      imgValues.y = lerp(imgValues.y, targetY, 0.12)
      imgValues.rz = lerp(imgValues.rz, targetRz, 0.12)

      if (gRef.current) {
        gsap.set(gRef.current, {
          x: imgValues.x,
          y: imgValues.y,
          rotateZ: imgValues.rz,
          transformOrigin: '50% 50%',
        })
      }

      let targetDisplacement = 0
      if (isHovering) {
        const cursorDistance = distance(
          cachedCursor.current.x,
          cursor.current.x,
          cachedCursor.current.y,
          cursor.current.y
        )
        targetDisplacement = Math.min(maxDisplacement, map(cursorDistance, 0, 80, 0, maxDisplacement))
      }

      imgValues.displacementScale = lerp(
        imgValues.displacementScale,
        targetDisplacement,
        0.08
      )

      if (displacementMapRef.current) {
        const currentScale = Math.max(0, imgValues.displacementScale)
        displacementMapRef.current.setAttribute('scale', currentScale.toFixed(2))
      }

      cachedCursor.current.x = cursor.current.x
      cachedCursor.current.y = cursor.current.y

      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [maxDisplacement, movementBound])

  return (
    <div
      ref={containerRef}
      className={`decay-content ${className}`.trim()}
      role="img"
      aria-label={alt}
    >
      <svg
        viewBox="0 0 600 338"
        preserveAspectRatio="xMidYMid slice"
        className="decay-svg"
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="turbulence"
              baseFrequency={baseFrequency}
              numOctaves={numOctaves}
              seed={seed}
              stitchTiles="stitch"
              result="turbulence1"
            />
            <feDisplacementMap
              ref={displacementMapRef}
              in="SourceGraphic"
              in2="turbulence1"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="B"
              result="displacementMap"
            />
          </filter>
        </defs>
        <g ref={gRef}>
          <image
            href={image}
            x="0"
            y="0"
            width="600"
            height="338"
            filter={`url(#${filterId})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      </svg>
    </div>
  )
}
