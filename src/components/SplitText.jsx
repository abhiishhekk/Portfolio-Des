import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'

export default function SplitText({
  text = '',
  className = '',
  delay = 50,
  duration = 0.5,
  style = {},
  once = true,
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-10px' })
  const chars = text.split('')

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: 'inline-block', whiteSpace: 'nowrap', ...style }}
      aria-label={text}
    >
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          style={{ display: 'inline-block', willChange: 'transform, opacity' }}
          initial={{ opacity: 0, y: 48, filter: 'blur(8px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{
            duration,
            delay: i * (delay / 1000),
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          aria-hidden="true"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}
