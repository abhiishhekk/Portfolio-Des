import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Sun, Moon, Menu, X, Github, Linkedin, Code2, Mail } from 'lucide-react'
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

      <div className="nav nav-mobile" role="navigation" aria-label="Mobile navigation">
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
