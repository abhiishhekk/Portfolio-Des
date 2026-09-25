import { useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react'

export default function TiltCard({ children, className = '', style = {}, intensity = 10 }) {
  const ref = useRef(null)
  const rectRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { stiffness: 300, damping: 30 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  const rotateX = useTransform(ySpring, [-0.5, 0.5], [intensity, -intensity])
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-intensity, intensity])

  function handleMouseEnter() {
    if (ref.current) {
      rectRef.current = ref.current.getBoundingClientRect()
    }
    setIsHovered(true)
  }

  function handleMouseMove(e) {
    if (!ref.current) return
    if (!rectRef.current) {
      rectRef.current = ref.current.getBoundingClientRect()
    }
    const rect = rectRef.current
    const xVal = (e.clientX - rect.left) / rect.width - 0.5
    const yVal = (e.clientY - rect.top) / rect.height - 0.5
    x.set(xVal)
    y.set(yVal)
  }

  function handleMouseLeave() {
    rectRef.current = null
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
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
      <motion.div
        style={{
          rotateX,
          rotateY,
          transform: 'translateZ(0)',
          willChange: isHovered ? 'transform' : 'auto',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
