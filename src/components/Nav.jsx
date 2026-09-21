import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sun, Moon, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Education', href: '#education' },
  { label: 'Contact', href: '#contact' },
]

export default function Nav({ theme, toggleTheme }) {
  const [active, setActive] = useState('Home')
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef(null)
  const itemRefs = useRef({})
  const menuRef = useRef(null)

  useEffect(() => {
    updateIndicator(active)
  }, [active])

  // Close mobile menu on click outside
  useEffect(() => {
    function handleOutsideClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileMenuOpen(false)
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
      document.addEventListener('touchstart', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [mobileMenuOpen])

  // Scroll spy
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

  function updateIndicator(label) {
    const el = itemRefs.current[label]
    if (el && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      setIndicatorStyle({
        left: elRect.left - navRect.left,
        width: elRect.width,
      })
    }
  }

  function handleClick(item, e) {
    e.preventDefault()
    setActive(item.label)
    setMobileMenuOpen(false)
    const target = document.querySelector(item.href)
    if (target) target.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="nav-container" ref={menuRef}>
      {/* Desktop Navigation Pill */}
      <nav className="nav nav-desktop" role="navigation" aria-label="Main navigation">
        <div className="nav-pill" ref={navRef}>
          <motion.span
            className="nav-indicator"
            animate={indicatorStyle}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            aria-hidden="true"
          />
          {NAV_ITEMS.map(item => (
            <a
              key={item.label}
              href={item.href}
              className={`nav-item ${active === item.label ? 'active' : ''}`}
              ref={el => (itemRefs.current[item.label] = el)}
              onClick={e => handleClick(item, e)}
              aria-current={active === item.label ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="nav-right">
          <button
            className="theme-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            id="theme-toggle-btn"
          >
            <motion.span
              key={theme}
              initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex' }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </motion.span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Bar */}
      <div className="nav nav-mobile" role="navigation" aria-label="Mobile navigation">
        {/* Leftmost: Theme toggle button */}
        <button
          className="theme-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          id="theme-toggle-mobile-btn"
        >
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex' }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </motion.span>
        </button>

        {/* Center: Current active page */}
        <div className="nav-mobile-center">
          <span className="nav-current-page">{active}</span>
        </div>

        {/* Rightmost: Breadcrumb menu button */}
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


      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="nav-mobile-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="nav-mobile-list">
              {NAV_ITEMS.map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`nav-mobile-item ${active === item.label ? 'active' : ''}`}
                  onClick={e => handleClick(item, e)}
                  aria-current={active === item.label ? 'page' : undefined}
                >
                  <span>{item.label}</span>
                  {active === item.label && (
                    <motion.span
                      className="nav-mobile-dot"
                      layoutId="active-dot"
                      aria-hidden="true"
                    />
                  )}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
