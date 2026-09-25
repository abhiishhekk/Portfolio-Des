import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { X, ExternalLink } from 'lucide-react'
import './StaggeredMenu.css'

export default function StaggeredMenu({
  isOpen = false,
  onClose,
  items = [],
  activeItem = '',
  onItemClick,
  socialItems = [],
  colors = ['#262626', '#141414', '#0a0a0a'],
  position = 'right',
  displayItemNumbering = true,
  displaySocials = true,
}) {
  const containerRef = useRef(null)
  const backdropRef = useRef(null)
  const layer1Ref = useRef(null)
  const layer2Ref = useRef(null)
  const panelRef = useRef(null)
  const headerRef = useRef(null)
  const itemsRef = useRef([])
  const footerRef = useRef(null)
  const socialsRef = useRef([])

  const [mounted, setMounted] = useState(false)
  const isAnimatingRef = useRef(false)

  // Mount when isOpen becomes true
  useEffect(() => {
    if (isOpen) {
      setMounted(true)
    }
  }, [isOpen])

  // GSAP Entrance and Exit
  useEffect(() => {
    if (!mounted) return

    const container = containerRef.current
    const backdrop = backdropRef.current
    const layer1 = layer1Ref.current
    const layer2 = layer2Ref.current
    const panel = panelRef.current
    const header = headerRef.current
    const itemEls = itemsRef.current.filter(Boolean)
    const footer = footerRef.current
    const socialEls = socialsRef.current.filter(Boolean)

    const sign = position === 'right' ? 1 : -1

    if (isOpen) {
      isAnimatingRef.current = true
      document.body.style.overflow = 'hidden'

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimatingRef.current = false
        },
      })

      // Reset initial styles
      gsap.set(container, { visibility: 'visible' })
      gsap.set(backdrop, { opacity: 0 })
      gsap.set([layer1, layer2, panel], { xPercent: 100 * sign })
      gsap.set(header, { opacity: 0, y: -16 })
      gsap.set(itemEls, { opacity: 0, y: 36, skewX: -2 * sign })
      if (footer) gsap.set(footer, { opacity: 0 })
      if (socialEls.length) gsap.set(socialEls, { opacity: 0, y: 16 })

      // Animate in sequence
      tl.to(backdrop, { opacity: 1, duration: 0.35, ease: 'power2.out' })
        .to(
          layer1,
          {
            xPercent: 0,
            duration: 0.52,
            ease: 'power3.inOut',
          },
          '-=0.25'
        )
        .to(
          layer2,
          {
            xPercent: 0,
            duration: 0.52,
            ease: 'power3.inOut',
          },
          '-=0.42'
        )
        .to(
          panel,
          {
            xPercent: 0,
            duration: 0.52,
            ease: 'power3.out',
          },
          '-=0.42'
        )
        .to(header, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, '-=0.25')
        .to(
          itemEls,
          {
            opacity: 1,
            y: 0,
            skewX: 0,
            duration: 0.45,
            stagger: 0.05,
            ease: 'power3.out',
          },
          '-=0.2'
        )

      if (footer) {
        tl.to(footer, { opacity: 1, duration: 0.3 }, '-=0.25')
      }
      if (socialEls.length) {
        tl.to(
          socialEls,
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.035,
            ease: 'power2.out',
          },
          '-=0.2'
        )
      }
    }
  }, [isOpen, mounted, position])

  const handleClose = (itemToNavigate = null, event = null) => {
    if (isAnimatingRef.current) return
    isAnimatingRef.current = true

    const container = containerRef.current
    const backdrop = backdropRef.current
    const layer1 = layer1Ref.current
    const layer2 = layer2Ref.current
    const panel = panelRef.current
    const header = headerRef.current
    const itemEls = itemsRef.current.filter(Boolean)
    const footer = footerRef.current
    const socialEls = socialsRef.current.filter(Boolean)

    const sign = position === 'right' ? 1 : -1

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = ''
        isAnimatingRef.current = false
        setMounted(false)
        if (onClose) onClose()
        if (itemToNavigate && onItemClick) {
          onItemClick(itemToNavigate, event)
        }
      },
    })

    // Items stagger out
    tl.to(itemEls, {
      opacity: 0,
      y: -18,
      duration: 0.22,
      stagger: 0.02,
      ease: 'power2.in',
    })

    if (socialEls.length) {
      tl.to(socialEls, { opacity: 0, y: 10, duration: 0.18, stagger: 0.015 }, '<')
    }
    if (footer) {
      tl.to(footer, { opacity: 0, duration: 0.18 }, '<')
    }
    if (header) {
      tl.to(header, { opacity: 0, duration: 0.18 }, '<')
    }

    tl.to(panel, { xPercent: 100 * sign, duration: 0.42, ease: 'power3.inOut' }, '-=0.08')
      .to(layer2, { xPercent: 100 * sign, duration: 0.42, ease: 'power3.inOut' }, '-=0.35')
      .to(layer1, { xPercent: 100 * sign, duration: 0.42, ease: 'power3.inOut' }, '-=0.35')
      .to(backdrop, { opacity: 0, duration: 0.25, ease: 'power2.in' }, '-=0.25')
  }

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!mounted || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={containerRef}
      className={`sm-container sm-position-${position}`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="sm-backdrop"
        onClick={() => handleClose()}
        aria-hidden="true"
      />

      {/* Staggered Underlay Layers */}
      <div
        ref={layer1Ref}
        className="sm-underlay-1"
        style={{
          background: colors[0] || 'var(--card-border)',
        }}
        aria-hidden="true"
      />
      <div
        ref={layer2Ref}
        className="sm-underlay-2"
        style={{
          background: colors[1] || 'var(--card-bg)',
        }}
        aria-hidden="true"
      />

      {/* Main Menu Panel */}
      <div
        ref={panelRef}
        className="sm-panel"
        style={{
          background: colors[2] || undefined,
        }}
      >
        {/* Header */}
        <div ref={headerRef} className="sm-header">
          <div className="sm-brand">
            <span className="sm-brand-dot" aria-hidden="true" />
            <span className="sm-brand-title">Navigation</span>
          </div>

          <button
            className="sm-close-btn"
            onClick={() => handleClose()}
            aria-label="Close navigation menu"
            id="staggered-menu-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="sm-nav" aria-label="Mobile navigation links">
          {items.map((item, index) => {
            const isActive = activeItem === item.label
            const numStr = String(index + 1).padStart(2, '0')

            return (
              <a
                key={item.label}
                ref={el => {
                  itemsRef.current[index] = el
                }}
                href={item.href}
                className={`sm-item ${isActive ? 'active' : ''}`}
                onClick={e => {
                  e.preventDefault()
                  handleClose(item, e)
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="sm-item-content">
                  {displayItemNumbering && (
                    <span className="sm-item-num">{numStr}</span>
                  )}
                  <span className="sm-item-label">{item.label}</span>
                </div>

                {isActive && (
                  <span className="sm-item-active-dot" aria-hidden="true" />
                )}
              </a>
            )
          })}
        </nav>
      </div>
    </div>,
    document.body
  )
}
