import { useState, useEffect, useRef, useCallback } from "react"
import { AnimatePresence } from "motion/react"
import { AppleHelloEffectEnglish } from "./apple-hello-effect/apple-hello-effect-english"
import { AppleHelloEffectHindi } from "./apple-hello-effect/apple-hello-effect-hindi"
import { AppleHelloEffectSpanish } from "./apple-hello-effect/apple-hello-effect-spanish"
import "./AppleHelloLanguages.css"

const LANGUAGES = ['english', 'hindi', 'spanish']

export default function AppleHelloLanguages({
  onWordComplete,
  onCycleComplete,
  isPageLoaded = false,
  className = "",
}) {
  const [index, setIndex] = useState(0)
  const cycleCountRef = useRef(0)
  const timerRef = useRef(null)

  const handleAnimationEnd = useCallback(() => {
    // Elegant hold after writing finishes so the full handwritten cursive word is seen
    timerRef.current = setTimeout(() => {
      setIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % LANGUAGES.length

        if (onWordComplete) {
          onWordComplete({
            finishedIndex: prevIndex,
            language: LANGUAGES[prevIndex],
            nextIndex,
            cycleCount: cycleCountRef.current,
          })
        }

        if (nextIndex === 0) {
          cycleCountRef.current += 1
          if (onCycleComplete) {
            onCycleComplete({
              cycleCount: cycleCountRef.current,
              isPageLoaded,
            })
          }
        }

        return nextIndex
      })
    }, 400)
  }, [onWordComplete, onCycleComplete, isPageLoaded])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Optimized scaling for brisk, organic, buttery SVG handwriting
  const demos = [
    <AppleHelloEffectEnglish
      key="english"
      className="apple-hello-svg"
      durationScale={0.5}
      onAnimationComplete={handleAnimationEnd}
    />,
    <AppleHelloEffectHindi
      key="hindi"
      className="apple-hello-svg"
      durationScale={0.4}
      onAnimationComplete={handleAnimationEnd}
    />,
    <AppleHelloEffectSpanish
      key="spanish"
      className="apple-hello-svg"
      durationScale={0.45}
      onAnimationComplete={handleAnimationEnd}
    />,
  ]

  return (
    <div className={`apple-hello-stage ${className}`} aria-live="polite">
      <AnimatePresence mode="wait">
        {demos[index]}
      </AnimatePresence>
    </div>
  )
}
