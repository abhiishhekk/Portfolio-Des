import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export default function RotatingText({
  texts = [],
  interval = 2600,
  className = '',
  style = {},
}) {
  const [index, setIndex] = useState(0)
  const [widths, setWidths] = useState([])
  const measureRef = useRef(null)

  useEffect(() => {
    function measure() {
      if (measureRef.current) {
        const spans = measureRef.current.children
        const measured = Array.from(spans).map(
          s => Math.ceil(s.getBoundingClientRect().width) + 2
        )
        setWidths(measured)
      }
    }
    measure()
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure)
    }
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [texts])

  useEffect(() => {
    const t = setInterval(() => {
      setIndex(i => (i + 1) % texts.length)
    }, interval)
    return () => clearInterval(t)
  }, [texts.length, interval])

  const currentWidth = widths[index] || undefined

  return (
    <>
      {/* Hidden measuring ruler to obtain exact rendered pixel widths */}
      <span
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
          height: 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          fontWeight: 600,
          fontSize: 'inherit',
          lineHeight: 'inherit',
          fontFamily: 'inherit',
          letterSpacing: 'inherit',
        }}
      >
        {texts.map((text, i) => (
          <span key={i} style={{ display: 'inline-block' }}>
            {text}
          </span>
        ))}
      </span>

      <motion.span
        className={className}
        style={{
          display: 'inline-flex',
          overflow: 'hidden',
          position: 'relative',
          height: '1.3em',
          verticalAlign: 'middle',
          alignItems: 'center',
          willChange: 'width',
          ...style,
        }}
        animate={currentWidth ? { width: currentWidth } : {}}
        transition={{
          width: {
            duration: 0.45,
            ease: [0.25, 1, 0.5, 1],
          },
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
            transition={{
              duration: 0.35,
              ease: [0.25, 1, 0.5, 1],
            }}
          >
            {texts[index]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </>
  )
}

