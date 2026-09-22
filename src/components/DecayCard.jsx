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
    let isIntersecting = false
    let containerWidth = 400
    let containerHeight = 225

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect()
      containerWidth = rect.width || 400
      containerHeight = rect.height || 225
    }

    const startRender = () => {
      if (!rafId && isIntersecting) {
        rafId = requestAnimationFrame(render)
      }
    }

    const handleMouseMove = ev => {
      cursor.current.x = ev.offsetX
      cursor.current.y = ev.offsetY
      cursor.current.active = true
      isHovering = true
      startRender()
    }

    const handleMouseEnter = ev => {
      updateDimensions()
      cursor.current.x = ev.offsetX
      cursor.current.y = ev.offsetY
      cachedCursor.current.x = cursor.current.x
      cachedCursor.current.y = cursor.current.y
      cursor.current.active = true
      isHovering = true
      startRender()
    }

    const handleMouseLeave = () => {
      cursor.current.active = false
      isHovering = false
      startRender()
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    const render = () => {
      if (!isIntersecting) {
        rafId = 0
        return
      }

      const w = containerWidth
      const h = containerHeight

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

      // Check if settled to stop running RAF loop unnecessarily
      const isSettled =
        !isHovering &&
        Math.abs(imgValues.x) < 0.05 &&
        Math.abs(imgValues.y) < 0.05 &&
        Math.abs(imgValues.rz) < 0.05 &&
        imgValues.displacementScale < 0.05

      if (isSettled) {
        imgValues.x = 0
        imgValues.y = 0
        imgValues.rz = 0
        imgValues.displacementScale = 0
        if (gRef.current) gsap.set(gRef.current, { x: 0, y: 0, rotateZ: 0 })
        if (displacementMapRef.current) displacementMapRef.current.setAttribute('scale', '0')
        rafId = 0
        return
      }

      rafId = requestAnimationFrame(render)
    }

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting
      if (isIntersecting && isHovering) {
        startRender()
      } else if (!isIntersecting && rafId) {
        cancelAnimationFrame(rafId)
        rafId = 0
      }
    })
    observer.observe(container)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      observer.disconnect()
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
