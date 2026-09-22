import { useTheme } from './hooks/useTheme'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Education from './components/Education'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  const { theme, toggle } = useTheme()
  useSmoothScroll()

  return (
    <>
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

      <Nav theme={theme} toggleTheme={toggle} />

      <main id="main-content">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Education />
        <Contact />
      </main>

      <Footer />
    </>
  )
}
