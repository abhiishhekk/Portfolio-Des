import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export default function RotatingText({
  texts = [],
  interval = 2400,
  className = '',
  style = {},
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setIndex(i => (i + 1) % texts.length)
    }, interval)
    return () => clearInterval(t)
  }, [texts.length, interval])

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        overflow: 'hidden',
        position: 'relative',
        height: '1.2em',
        verticalAlign: 'middle',
        ...style,
      }}
      aria-live="polite"
      aria-label={texts[index]}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          style={{
            display: 'inline-block',
            whiteSpace: 'nowrap',
            color: 'var(--fg)',
            fontWeight: 600,
          }}
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-110%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
