/**
 * FadeContent — react-bits style fade + slide on scroll into view
 */
import { useRef } from 'react'
import { motion, useInView } from 'motion/react'

export default function FadeContent({
  children,
  className = '',
  style = {},
  delay = 0,
  duration = 0.55,
  direction = 'up', // 'up' | 'down' | 'left' | 'right' | 'none'
  once = true,
  blur = false,
  threshold = 0.1,
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: threshold })

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 32 : direction === 'down' ? -32 : 0,
      x: direction === 'left' ? 32 : direction === 'right' ? -32 : 0,
      filter: blur ? 'blur(8px)' : undefined,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      filter: blur ? 'blur(0px)' : undefined,
    },
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  )
}
