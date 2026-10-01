import { useState, useEffect, useRef, useCallback } from 'react'
import { Menu, X, Github, Linkedin, Code2, Mail } from 'lucide-react'
import StaggeredMenu from './StaggeredMenu'
import { unlockScroll } from '../utils/scrollLock'

const NAV_ITEMS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Education', href: '#education' },
  { label: 'Contact', href: '#contact' },
]

const SOCIAL_ITEMS = [
  { label: 'GitHub', href: 'https://github.com/abhiishhekk', icon: Github },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/abhishek-kumar-init/', icon: Linkedin },
  { label: 'LeetCode', href: 'https://leetcode.com/u/abhiishhek_k/', icon: Code2 },
  { label: 'Email', href: 'mailto:abhishekkr.init@gmail.com', icon: Mail },
]

export default function Nav({ theme, toggleTheme, setTheme }) {
  const [active, setActive] = useState('Home')
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, ready: false })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef(null)
  const itemRefs = useRef({})
  const menuRef = useRef(null)
  const activeRef = useRef(active)
  activeRef.current = active

  const updateIndicator = useCallback((label) => {
    const targetLabel = label || activeRef.current
    const el = itemRefs.current[targetLabel]
    const nav = navRef.current
    if (el && nav) {
      const navRect = nav.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      if (elRect.width > 0 && navRect.width > 0) {
        setIndicatorStyle({
          left: elRect.left - navRect.left,
          width: elRect.width,
          ready: true,
        })
        return true
      }
    }
    return false
  }, [])

  const refreshIndicator = useCallback(() => {
    if (updateIndicator(activeRef.current)) return () => {}

    let frameCount = 0
    let rafId = null
    const retry = () => {
      frameCount++
      if (updateIndicator(activeRef.current) || frameCount >= 12) return
      rafId = requestAnimationFrame(retry)
    }
    rafId = requestAnimationFrame(retry)

    const timer1 = setTimeout(() => updateIndicator(activeRef.current), 40)
    const timer2 = setTimeout(() => updateIndicator(activeRef.current), 120)
    const timer3 = setTimeout(() => updateIndicator(activeRef.current), 300)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [updateIndicator])

  useEffect(() => {
    const cleanupRetries = refreshIndicator()

    const handleResize = () => {
      refreshIndicator()
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    // Update indicator on breakpoint change
    const mql = window.matchMedia('(min-width: 769px)')
    const handleMediaChange = () => {
      refreshIndicator()
    }
    if (mql.addEventListener) {
      mql.addEventListener('change', handleMediaChange)
    } else if (mql.addListener) {
      mql.addListener(handleMediaChange)
    }

    // Update indicator when nav resizes
    let resizeObserver
    if (typeof ResizeObserver !== 'undefined' && navRef.current) {
      resizeObserver = new ResizeObserver(() => {
        refreshIndicator()
      })
      resizeObserver.observe(navRef.current)
    }

    document.fonts?.ready?.then(() => {
      refreshIndicator()
    })

    return () => {
      cleanupRetries?.()
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleMediaChange)
      } else if (mql.removeListener) {
        mql.removeListener(handleMediaChange)
      }
      resizeObserver?.disconnect()
    }
  }, [refreshIndicator])

  useEffect(() => {
    updateIndicator(active)
  }, [active, updateIndicator])

  useEffect(() => {
    const sections = NAV_ITEMS.map(i => ({
      id: i.href.replace('#', ''),
      label: i.label,
    }))

    // Check which section is in view
    const checkActiveSection = () => {
      const probeY = window.innerHeight * 0.35
      for (let i = sections.length - 1; i >= 0; i--) {
        const s = sections[i]
        const el = document.getElementById(s.id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= probeY && rect.bottom > probeY) {
          setActive(s.label)
          return
        }
      }
    }

    const onCustomActive = (e) => {
      if (e.detail && typeof e.detail === 'string') {
        setActive(e.detail)
      }
    }

    window.addEventListener('portfolio:active-section', onCustomActive)
    window.addEventListener('scroll', checkActiveSection, { passive: true })

    const lenis = window.__lenis
    if (lenis && typeof lenis.on === 'function') {
      lenis.on('scroll', checkActiveSection)
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const match = sections.find(s => s.id === entry.target.id)
            if (match) setActive(match.label)
          }
        })
      },
      { rootMargin: '-30% 0px -50% 0px', threshold: 0 }
    )

    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    // Initial check
    checkActiveSection()

    return () => {
      window.removeEventListener('portfolio:active-section', onCustomActive)
      window.removeEventListener('scroll', checkActiveSection)
      if (lenis && typeof lenis.off === 'function') {
        lenis.off('scroll', checkActiveSection)
      }
      observer.disconnect()
    }
  }, [])

  function handleClick(item, e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault()
    }
    setActive(item.label)
    setMobileMenuOpen(false)
    unlockScroll()

    const isHome = item.href === '#home' || item.label === 'Home'

    if (window.__lenis) {
      if (isHome) {
        window.__lenis.scrollTo(0, { duration: 1.2 })
      } else {
        window.__lenis.scrollTo(item.href, { duration: 1.4 })
      }
    } else {
      if (isHome) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        const target = document.querySelector(item.href)
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }

  return (
    <header className="nav-container" ref={menuRef}>
      <nav className="nav nav-desktop" role="navigation" aria-label="Main navigation">
        <div className="nav-pill" ref={navRef}>
          <span
            className="nav-indicator"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              opacity: indicatorStyle.ready && indicatorStyle.width > 0 ? 1 : 0,
              transition: indicatorStyle.ready
                ? 'left 0.35s cubic-bezier(0.25, 1, 0.5, 1), width 0.35s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease'
                : 'none',
            }}
            aria-hidden="true"
          />
          {NAV_ITEMS.map(item => (
            <a
              key={item.label}
              href={item.href}
              className={`nav-item ${active === item.label ? (indicatorStyle.ready && indicatorStyle.width > 0 ? 'active' : 'active-pending') : ''}`}
              ref={el => (itemRefs.current[item.label] = el)}
              onClick={e => handleClick(item, e)}
              aria-current={active === item.label ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="nav-mobile" role="navigation" aria-label="Mobile navigation">
        <div className="nav-mobile-center">
          <span className="nav-current-page">{active}</span>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(prev => !prev)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          id="mobile-menu-toggle-btn"
        >
          <span
            key={mobileMenuOpen ? 'close' : 'menu'}
            style={{
              display: 'flex',
              transition: 'transform 0.2s ease, opacity 0.2s ease',
            }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </span>
        </button>
      </div>


      <StaggeredMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        items={NAV_ITEMS}
        activeItem={active}
        onItemClick={handleClick}
        socialItems={SOCIAL_ITEMS}
        colors={
          theme === 'dark'
            ? ['#8d8d8dff', '#fffcfcff', '#0a0a0a']
            : ['#a4a3a3ff', '#070707ff', '#ffffff']
        }
        displayItemNumbering={true}
        displaySocials={true}
      />
    </header>
  )
}
