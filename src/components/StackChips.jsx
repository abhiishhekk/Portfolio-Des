/**
 * StackChips — Physics-driven tech chip stickers using Matter.js
 * Adapted from the react-bits / rbp-portfolio Stack component
 * (https://github.com/DavidHDev/rbp-portfolio/blob/main/components/about/stack.tsx)
 *
 * Chips fall into a container, pile up, and can be dragged around.
 * Click the ↺ button to scatter and re-drop them.
 */
import { useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'

// Abhishek's full tech stack extracted from resume
const CHIPS = [
  // Languages
  { label: 'C++',        slug: 'cplusplus',    bg: '#00599C', fg: '#ffffff' },
  { label: 'JavaScript', slug: 'javascript',   bg: '#F7DF1E', fg: '#000000' },
  { label: 'HTML5',      slug: 'html5',        bg: '#E34F26', fg: '#ffffff' },
  { label: 'CSS3',       slug: 'css3',         bg: '#1572B6', fg: '#ffffff' },
  { label: 'SQL',        slug: 'mysql',        bg: '#4479A1', fg: '#ffffff' },
  // Frameworks & Libraries
  { label: 'React',      slug: 'react',        bg: '#20232a', fg: '#61DAFB' },
  { label: 'Node.js',    slug: 'nodedotjs',    bg: '#339933', fg: '#ffffff' },
  { label: 'Express',    slug: 'express',      bg: '#404040', fg: '#ffffff' },
  { label: 'Tailwind',   slug: 'tailwindcss',  bg: '#06B6D4', fg: '#ffffff' },
  { label: 'Redux',      slug: 'redux',        bg: '#764ABC', fg: '#ffffff' },
  // Databases & Cloud
  { label: 'MongoDB',    slug: 'mongodb',      bg: '#47A248', fg: '#ffffff' },
  { label: 'GCP',        slug: 'googlecloud',  bg: '#4285F4', fg: '#ffffff' },
  // ML / AI
  { label: 'TensorFlow', slug: 'tensorflow',   bg: '#FF6F00', fg: '#ffffff' },
  { label: 'LangChain',  slug: 'langchain',    bg: '#1C3C3C', fg: '#ffffff' },
  // Tools & Platforms
  { label: 'Git',        slug: 'git',          bg: '#F05032', fg: '#ffffff' },
  { label: 'GitHub',     slug: 'github',       bg: '#181717', fg: '#ffffff' },
  { label: 'Linux',      slug: 'linux',        bg: '#FCC624', fg: '#000000' },
  { label: 'Postman',    slug: 'postman',      bg: '#FF6C37', fg: '#ffffff' },
  { label: 'Vite',       slug: 'vite',         bg: '#646CFF', fg: '#ffffff' },
]

const CHIP_RADIUS = 14
const ICON_RADIUS = 10
const WALL_PAD = 16

function ChipPill({ chip }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 10px 4px 4px',
        backgroundColor: chip.bg,
        color: chip.fg,
        borderRadius: `${CHIP_RADIUS}px`,
        fontSize: '14px',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      }}
    >
      {/* Icon bubble */}
      <span
        style={{
          display: 'inline-flex',
          width: 28,
          height: 28,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.92)',
          borderRadius: `${ICON_RADIUS}px`,
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <img
          src={chip.iconUrl ?? `https://cdn.simpleicons.org/${chip.slug}`}
          alt=""
          width={18}
          height={18}
          style={{ width: 18, height: 18, objectFit: 'contain' }}
          draggable={false}
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
      </span>
      <span>{chip.label}</span>
    </div>
  )
}

export default function StackChips() {
  const containerRef = useRef(null)
  const measureRef = useRef(null)
  const chipRefs = useRef([])
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    const measure = measureRef.current
    if (!container || !measure) return

    let cancelled = false
    let cleanup

    ;(async () => {
      const Matter = await import('matter-js')
      if (cancelled) return

      const { Engine, Runner, World, Bodies, Body, Mouse, MouseConstraint, Events } = Matter

      // Measure actual chip dimensions
      const measureChildren = Array.from(measure.children)
      const dims = measureChildren.map(el => {
        const r = el.getBoundingClientRect()
        return { w: Math.max(80, r.width), h: Math.max(30, r.height) }
      })

      let width = container.clientWidth
      let height = container.clientHeight

      const engine = Engine.create()
      engine.gravity.y = 1
      const world = engine.world

      const wallThickness = 400

      const floor = Bodies.rectangle(
        width / 2,
        height - WALL_PAD + wallThickness / 2,
        width * 3,
        wallThickness,
        { isStatic: true }
      )
      const leftWall = Bodies.rectangle(
        WALL_PAD - wallThickness / 2,
        height / 2,
        wallThickness,
        height * 4,
        { isStatic: true }
      )
      const rightWall = Bodies.rectangle(
        width - WALL_PAD + wallThickness / 2,
        height / 2,
        wallThickness,
        height * 4,
        { isStatic: true }
      )
      World.add(world, [floor, leftWall, rightWall])

      // Create physics bodies for each chip
      const states = CHIPS.map((chip, i) => {
        const dim = dims[i] ?? { w: 120, h: 36 }
        const { w, h } = dim
        const halfW = w / 2
        const minX = WALL_PAD + halfW + 4
        const maxX = width - WALL_PAD - halfW - 4
        const x = minX + Math.random() * Math.max(1, maxX - minX)
        const y = -80 - i * 55 - Math.random() * 100
        const body = Bodies.rectangle(x, y, w, h, {
          chamfer: { radius: CHIP_RADIUS },
          restitution: 0.35,
          friction: 0.5,
          frictionAir: 0.025,
          density: 0.0018,
          angle: (Math.random() - 0.5) * 0.4,
        })
        World.add(world, body)
        return { chip, body, width: w, height: h }
      })

      // Mouse interaction
      const mouse = Mouse.create(container)

      // Remove wheel hijacking from Matter.js
      const wheelTarget = mouse.element
      if (wheelTarget.mousemove) {
        wheelTarget.removeEventListener('wheel', wheelTarget.mousewheel)
        wheelTarget.removeEventListener('DOMMouseScroll', wheelTarget.mousewheel)
      }

      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.2,
          damping: 0.2,
          render: { visible: false },
        },
      })
      World.add(world, mouseConstraint)

      Events.on(mouseConstraint, 'startdrag', () => {
        container.style.cursor = 'grabbing'
      })
      Events.on(mouseConstraint, 'enddrag', () => {
        container.style.cursor = 'grab'
      })

      const runner = Runner.create()
      Runner.run(runner, engine)

      // rAF loop to sync DOM positions with physics bodies
      let raf = 0
      const tick = () => {
        for (let i = 0; i < states.length; i++) {
          const s = states[i]
          const el = chipRefs.current[i]
          if (!s || !el) continue
          const { x, y } = s.body.position
          el.style.transform = `translate3d(${x - s.width / 2}px, ${y - s.height / 2}px, 0) rotate(${s.body.angle}rad)`
        }
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)

      // Resize support
      const onResize = () => {
        const newW = container.clientWidth
        const newH = container.clientHeight
        if (newW === width && newH === height) return
        Body.setPosition(floor, { x: newW / 2, y: newH - WALL_PAD + wallThickness / 2 })
        Body.setPosition(leftWall, { x: WALL_PAD - wallThickness / 2, y: newH / 2 })
        Body.setPosition(rightWall, { x: newW - WALL_PAD + wallThickness / 2, y: newH / 2 })
        width = newW
        height = newH
      }
      const ro = new ResizeObserver(onResize)
      ro.observe(container)

      cleanup = () => {
        cancelAnimationFrame(raf)
        ro.disconnect()
        Runner.stop(runner)
        World.clear(world, false)
        Engine.clear(engine)
      }
    })()

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [resetKey])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Stack canvas */}
      <div
        style={{
          position: 'relative',
          height: '280px',
          overflow: 'hidden',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          background: 'var(--card-bg)',
        }}
      >
        {/* Reset button */}
        <button
          type="button"
          onClick={() => setResetKey(k => k + 1)}
          aria-label="Reset stack"
          id="stack-reset-btn"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 20,
            display: 'inline-flex',
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--fg-muted)',
            cursor: 'pointer',
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.borderColor = 'var(--fg)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          <RotateCcw size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>

        {/* Hidden measurement layer */}
        <div
          ref={measureRef}
          aria-hidden="true"
          style={{
            pointerEvents: 'none',
            visibility: 'hidden',
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          {CHIPS.map(chip => (
            <ChipPill key={`m-${chip.label}`} chip={chip} />
          ))}
        </div>

        {/* Physics canvas */}
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            inset: 0,
            cursor: 'grab',
            userSelect: 'none',
            touchAction: 'pan-y',
          }}
        >
          {CHIPS.map((chip, i) => (
            <div
              key={`${resetKey}-${chip.label}`}
              ref={el => { chipRefs.current[i] = el }}
              data-stack-chip
              style={{
                pointerEvents: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                willChange: 'transform',
                transform: 'translate3d(-9999px, -9999px, 0)',
              }}
            >
              <ChipPill chip={chip} />
            </div>
          ))}
        </div>
      </div>

      <p
        style={{
          fontSize: '0.75rem',
          color: 'var(--fg-subtle)',
          textAlign: 'center',
          letterSpacing: '0.04em',
        }}
      >
        Drag the chips around • click ↺ to scatter
      </p>
    </div>
  )
}
