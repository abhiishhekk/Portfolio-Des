import { useState, useCallback, useRef } from 'react'
import { useTheme } from './hooks/useTheme'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import SplashCursor from './components/SplashCursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Education from './components/Education'
import Contact from './components/Contact'
import Footer from './components/Footer'
import FullPageThemeSlider from './components/FullPageThemeSlider'
import Preloader from './components/Preloader'

import { ScrollTrigger } from 'gsap/ScrollTrigger'

ScrollTrigger.config({ ignoreMobileResize: true })

export default function App() {
  const { theme, toggle, setTheme } = useTheme()
  useSmoothScroll()
  const [isPreloaderMounted, setIsPreloaderMounted] = useState(true)
  const [isPageVisible, setIsPageVisible] = useState(false)
  const handleExitStart = useCallback(() => {
    setIsPageVisible(true)
  }, [])
  const handleComplete = useCallback(() => {
    setIsPreloaderMounted(false)
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
      ScrollTrigger.refresh()
    }, 50)
  }, [])

  return (
    <>
      {isPreloaderMounted && (
        <Preloader
          theme={theme}
          onExitStart={handleExitStart}
          onComplete={handleComplete}
        />
      )}

      <div
        id="portfolio-app-root"
        className="portfolio-app-root"
        style={{
          opacity: 1,
          pointerEvents: isPreloaderMounted ? 'none' : 'auto',
          minHeight: '100vh',
        }}
      >
      <SplashCursor
        RAINBOW_MODE={false}
        COLOR={theme === 'dark' ? '#ffffff' : '#000000'}
      />
      <div className="bg-grid" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />

      <a
        href="#home"
        style={{
          position: 'fixed',
          top: '-100%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--fg)',
          color: 'var(--bg)',
          padding: '12px 24px',
          borderRadius: '0 0 8px 8px',
          zIndex: 200,
          fontWeight: 600,
          fontSize: '0.875rem',
          transition: 'top 0.2s',
        }}
        onFocus={e => (e.currentTarget.style.top = '0')}
        onBlur={e => (e.currentTarget.style.top = '-100%')}
      >
        Skip to main content
      </a>

      <Nav theme={theme} toggleTheme={toggle} setTheme={setTheme} />

      <FullPageThemeSlider theme={theme} setTheme={setTheme} />

      <main id="main-content">
        <Hero isPageVisible={isPageVisible} />
        <About />
        <Skills />
        <Projects />
        <Education />
        <Contact />
      </main>

      <Footer />
      </div>
    </>
  )
}
