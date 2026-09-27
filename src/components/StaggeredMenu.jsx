import { useEffect, useRef, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import {
  X,
  Home,
  User,
  Code2,
  Briefcase,
  GraduationCap,
  Mail,
  Github,
  Linkedin,
  Terminal,
} from 'lucide-react'
import BranchedMenu from './BranchedMenu'
import { lockScroll, unlockScroll } from '../utils/scrollLock'
import './StaggeredMenu.css'

export default function StaggeredMenu({
  isOpen = false,
  onClose,
  items = [],
  activeItem = '',
  onItemClick,
  colors = ['#262626', '#141414', '#0a0a0a'],
  position = 'right',
}) {
  const containerRef = useRef(null)
  const backdropRef = useRef(null)
  const layer1Ref = useRef(null)
  const layer2Ref = useRef(null)
  const panelRef = useRef(null)
  const headerRef = useRef(null)
  const menuBodyRef = useRef(null)

  const [mounted, setMounted] = useState(false)
  const isClosingRef = useRef(false)
  const openTimelineRef = useRef(null)
  const closeTimelineRef = useRef(null)
  const lockedRef = useRef(false)

  // Map items to BranchedMenu structure
  const branchedItems = useMemo(
    () => [
      {
        label: 'Navigation',
        children: [
          { label: 'Home', value: '#home', href: '#home', icon: Home },
          { label: 'About', value: '#about', href: '#about', icon: User },
          { label: 'Skills', value: '#skills', href: '#skills', icon: Code2 },
          { label: 'Projects', value: '#projects', href: '#projects', icon: Briefcase },
          { label: 'Education', value: '#education', href: '#education', icon: GraduationCap },
          { label: 'Contact', value: '#contact', href: '#contact', icon: Mail },
        ],
      },
      {
        label: 'Connect & Socials',
        children: [
          {
            label: 'GitHub',
            value: 'https://github.com/abhiishhekk',
            href: 'https://github.com/abhiishhekk',
            icon: Github,
            isExternal: true,
          },
          {
            label: 'LinkedIn',
            value: 'https://www.linkedin.com/in/abhishek-kumar-init/',
            href: 'https://www.linkedin.com/in/abhishek-kumar-init/',
            icon: Linkedin,
            isExternal: true,
          },
          {
            label: 'LeetCode',
            value: 'https://leetcode.com/u/abhiishhek_k/',
            href: 'https://leetcode.com/u/abhiishhek_k/',
            icon: Terminal,
            isExternal: true,
          },
          {
            label: 'Email',
            value: 'mailto:abhishekkr.init@gmail.com',
            href: 'mailto:abhishekkr.init@gmail.com',
            icon: Mail,
            isExternal: true,
          },
        ],
      },
    ],
    []
  )

  const activeValue = useMemo(() => {
    const found = items.find(i => i.label.toLowerCase() === activeItem.toLowerCase())
    return found ? found.href : '#home'
  }, [items, activeItem])

  // Mount when isOpen becomes true
  useEffect(() => {
    if (isOpen) {
      setMounted(true)
    }
  }, [isOpen])

  // Clean up timelines and scroll lock on unmount
  useEffect(() => {
    return () => {
      openTimelineRef.current?.kill()
      closeTimelineRef.current?.kill()
      if (lockedRef.current) {
        unlockScroll()
        lockedRef.current = false
      }
    }
  }, [])

  // GSAP Entrance and Exit
  useEffect(() => {
    if (!mounted) return

    const container = containerRef.current
    const backdrop = backdropRef.current
    const layer1 = layer1Ref.current
    const layer2 = layer2Ref.current
    const panel = panelRef.current
    const header = headerRef.current
    const menuBody = menuBodyRef.current

    const sign = position === 'right' ? 1 : -1

    if (isOpen) {
      isClosingRef.current = false
      if (!lockedRef.current) {
        lockScroll({ allowElement: panelRef.current })
        lockedRef.current = true
      }

      if (closeTimelineRef.current) {
        closeTimelineRef.current.kill()
      }

      const tl = gsap.timeline()
      openTimelineRef.current = tl

      // Reset initial styles
      gsap.set(container, { visibility: 'visible' })
      gsap.set(backdrop, { opacity: 0 })
      gsap.set([layer1, layer2, panel], { xPercent: 100 * sign })
      gsap.set(header, { opacity: 0, y: -16 })
      if (menuBody) gsap.set(menuBody, { opacity: 0, y: 24 })

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

      if (menuBody) {
        tl.to(
          menuBody,
          {
            opacity: 1,
            y: 0,
            duration: 0.42,
            ease: 'power3.out',
          },
          '-=0.2'
        )
      }
    }
  }, [isOpen, mounted, position])

  const handleClose = (itemToNavigate = null, event = null) => {
    // If already closing, ignore duplicate triggers
    if (isClosingRef.current) return
    isClosingRef.current = true

    // If navigation item clicked, trigger scroll navigation immediately
    if (itemToNavigate && onItemClick) {
      if (lockedRef.current) {
        unlockScroll()
        lockedRef.current = false
      }
      onItemClick(itemToNavigate, event)
    }

    // Cancel in-flight entrance animations immediately so exit starts without delay
    if (openTimelineRef.current) {
      openTimelineRef.current.kill()
    }
    gsap.killTweensOf([
      layer1Ref.current,
      layer2Ref.current,
      panelRef.current,
      backdropRef.current,
      headerRef.current,
      menuBodyRef.current,
    ])

    const container = containerRef.current
    const backdrop = backdropRef.current
    const layer1 = layer1Ref.current
    const layer2 = layer2Ref.current
    const panel = panelRef.current
    const header = headerRef.current
    const menuBody = menuBodyRef.current

    const sign = position === 'right' ? 1 : -1

    const tl = gsap.timeline({
      onComplete: () => {
        if (lockedRef.current) {
          unlockScroll()
          lockedRef.current = false
        }
        isClosingRef.current = false
        setMounted(false)
        if (onClose) onClose()
      },
    })
    closeTimelineRef.current = tl

    if (menuBody) {
      tl.to(menuBody, {
        opacity: 0,
        y: -14,
        duration: 0.2,
        ease: 'power2.in',
      })
    }

    if (header) {
      tl.to(header, { opacity: 0, duration: 0.18 }, '<')
    }

    tl.to(panel, { xPercent: 100 * sign, duration: 0.38, ease: 'power3.inOut' }, '-=0.08')
      .to(layer2, { xPercent: 100 * sign, duration: 0.38, ease: 'power3.inOut' }, '-=0.3')
      .to(layer1, { xPercent: 100 * sign, duration: 0.38, ease: 'power3.inOut' }, '-=0.3')
      .to(backdrop, { opacity: 0, duration: 0.22, ease: 'power2.in' }, '-=0.2')
  }

  const handleSelect = (val, item) => {
    if (item.isExternal) {
      window.open(item.value, '_blank', 'noopener,noreferrer')
      handleClose()
      return
    }

    const navItem = items.find(
      i => i.href === item.value || i.label.toLowerCase() === item.label.toLowerCase()
    ) || { label: item.label, href: item.value }

    handleClose(navItem)
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
        onTouchMove={e => e.preventDefault()}
        onWheel={e => e.preventDefault()}
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
          <button
            className="sm-close-btn"
            onClick={() => handleClose()}
            aria-label="Close navigation menu"
            id="staggered-menu-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Branched Menu */}
        <div ref={menuBodyRef} className="sm-branched-wrapper">
          <BranchedMenu
            items={branchedItems}
            defaultOpen={[0, 1]}
            defaultActive={activeValue}
            onSelect={handleSelect}
            width={340}
            rowHeight={44}
            indent={46}
            trunk={16}
            radius={12}
            lineWidth={1.6}
            fontSize={15}
          />
        </div>
      </div>
    </div>,
    document.body
  )
}
