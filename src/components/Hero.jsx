import { motion } from 'motion/react'
import { ArrowDown, Github } from 'lucide-react'
import WarpText from './WarpText'
import RotatingText from './RotatingText'
import { useLeetCode } from '../hooks/useLeetCode'

const ROLES = [
  'Full-Stack Developer',
  'Competitive Programmer',
  'Problem Solver',
  'CS @ MNNIT Allahabad',
]

export default function Hero() {
  const leetCode = useLeetCode('abhiishhek_k')

  function scrollTo(id) {
    if (window.__lenis) {
      window.__lenis.scrollTo(`#${id}`, { duration: 1.4 })
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="hero" id="home" aria-label="Hero section">
      <div className="container">
        <div className="hero-inner">

          <h1 className="hero-title" aria-label="Abhishek Kumar.">
            <span className="sr-only">Abhishek Kumar.</span>
            <WarpText
              text={"Abhishek\nKumar."}
              fontFamily="Syne, sans-serif"
              fontWeight={800}
              fontSize="clamp(2.75rem, 12vw, 6.25rem)"
              letterSpacing="-0.04em"
              lineHeight={0.94}
              warpStrength={0.09}
              warpScale={1.6}
              speed={0.55}
              pointerInfluence={0.45}
              pointerStrength={0.4}
              refraction={0.02}
              ripple={true}
            />
          </h1>

          <motion.div
            className="hero-role-wrapper"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              fontSize: '1.125rem',
              color: 'var(--fg-muted)',
              minHeight: '2rem',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <span style={{ whiteSpace: 'nowrap' }}>I&apos;m a</span>
            <RotatingText texts={ROLES} interval={2600} />
          </motion.div>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
          >
            CS undergrad at{' '}
            <strong style={{ color: 'var(--fg)', fontWeight: 600 }}>MNNIT Allahabad</strong> — solved{' '}
            {leetCode.totalSolved}+ problems on LeetCode, building scalable full-stack apps and competing in
            algorithmic challenges.
          </motion.p>

          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <button
              className="btn-primary"
              onClick={() => scrollTo('projects')}
              id="hero-view-work-btn"
            >
              View my work
              <ArrowDown size={16} />
            </button>
            <button
              className="btn-secondary"
              onClick={() => scrollTo('contact')}
              id="hero-contact-btn"
            >
              Get in touch
            </button>
            <a
              href="https://github.com/abhiishhekk"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              id="hero-github-btn"
              aria-label="Visit GitHub profile"
            >
              <Github size={16} />
              GitHub
            </a>
          </motion.div>

          <motion.div
            className="hero-scroll-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <span className="scroll-line" aria-hidden="true" />
            Scroll to explore
            <span className="scroll-line" aria-hidden="true" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
