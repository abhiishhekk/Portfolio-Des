import { useState } from 'react'
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

export default function App() {
  const { theme, toggle, setTheme } = useTheme()
  useSmoothScroll()
  const [isPreloaderMounted, setIsPreloaderMounted] = useState(true)
  const [isPageVisible, setIsPageVisible] = useState(false)

  return (
    <>
      {isPreloaderMounted && (
        <Preloader
          onExitStart={() => setIsPageVisible(true)}
          onComplete={() => setIsPreloaderMounted(false)}
        />
      )}

      <div
        className="portfolio-app-root"
        style={{
          opacity: isPageVisible ? 1 : 0,
          transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: isPageVisible ? 'auto' : 'none',
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
        <Hero />
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
