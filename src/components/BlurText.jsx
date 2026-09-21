import { useRef } from 'react'
import { motion, useInView } from 'motion/react'

export default function BlurText({
  text = '',
  className = '',
  delay = 80,
  duration = 0.55,
  style = {},
  once = true,
  tag: Tag = 'p',
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-20px' })
  const words = text.split(' ')

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25em', ...style }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          style={{ display: 'inline-block', willChange: 'transform, opacity, filter' }}
          initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{
            duration,
            delay: i * (delay / 1000),
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          aria-hidden="true"
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  )
}
