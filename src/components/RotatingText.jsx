import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function RotatingText({
  texts = [],
  interval = 2600,
  className = '',
  style = {},
}) {
  const [index, setIndex] = useState(0)
  const [widths, setWidths] = useState([])
  const measureRef = useRef(null)
  const textRef = useRef(null)
  const indexRef = useRef(index)
  indexRef.current = index

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
    if (texts.length <= 1) return
    const t = setInterval(() => {
      const el = textRef.current
      if (!el) return
      gsap.to(el, {
        y: '-110%',
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          const next = (indexRef.current + 1) % texts.length
          setIndex(next)
          gsap.fromTo(
            el,
            { y: '110%', opacity: 0 },
            { y: '0%', opacity: 1, duration: 0.35, ease: 'power2.out' }
          )
        },
      })
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

      <span
        className={className}
        style={{
          display: 'inline-flex',
          overflow: 'hidden',
          position: 'relative',
          height: '1.35em',
          lineHeight: '1.35em',
          verticalAlign: 'middle',
          alignItems: 'center',
          willChange: 'width',
          width: currentWidth ? `${currentWidth}px` : 'auto',
          transition: 'width 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
          ...style,
        }}
        aria-live="polite"
        aria-label={texts[index]}
      >
        <span
          ref={textRef}
          style={{
            display: 'inline-block',
            whiteSpace: 'nowrap',
            color: 'var(--fg)',
            fontWeight: 600,
            lineHeight: 'inherit',
          }}
        >
          {texts[index]}
        </span>
      </span>
    </>
  )
}
