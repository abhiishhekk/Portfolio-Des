import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'motion/react'
import { Menu, X, Github, Linkedin, Code2, Mail } from 'lucide-react'
import StaggeredMenu from './StaggeredMenu'

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

    // Media query listener specifically for switching between phone (<= 768px) and PC (> 768px)
    const mql = window.matchMedia('(min-width: 769px)')
    const handleMediaChange = () => {
      refreshIndicator()
    }
    if (mql.addEventListener) {
      mql.addEventListener('change', handleMediaChange)
    } else if (mql.addListener) {
      mql.addListener(handleMediaChange)
    }

    // ResizeObserver detects when PC nav switches layout or changes size
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

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const match = sections.find(s => s.id === entry.target.id)
            if (match) setActive(match.label)
          }
        })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    )

    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  function handleClick(item, e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault()
    }
    setActive(item.label)
    setMobileMenuOpen(false)
    document.body.style.overflow = ''

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
          <motion.span
            className="nav-indicator"
            animate={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              opacity: indicatorStyle.ready && indicatorStyle.width > 0 ? 1 : 0,
            }}
            transition={
              indicatorStyle.ready
                ? { type: 'spring', stiffness: 380, damping: 36 }
                : { duration: 0 }
            }
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
          <motion.span
            key={mobileMenuOpen ? 'close' : 'menu'}
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex' }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </motion.span>
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
