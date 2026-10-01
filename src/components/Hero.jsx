import { ArrowDown, Github } from 'lucide-react'
import WarpText from './WarpText'
import AnimatedContent from './AnimatedContent'
import RotatingText from './RotatingText'
import { useLeetCode } from '../hooks/useLeetCode'

const ROLES = [
  'Full-Stack Developer',
  'Competitive Programmer',
  'Problem Solver',
  'CS @ NIT Allahabad',
]

export default function Hero({ isPageVisible = true }) {
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
              fontSize="clamp(2.75rem, 11vw, 6.25rem)"
              letterSpacing="-0.04em"
              lineHeight={0.94}
              warpStrength={0.09}
              warpScale={1.6}
              speed={0.55}
              pointerInfluence={0.45}
              pointerStrength={0.4}
              refraction={0.02}
              ripple={true}
              isPageVisible={isPageVisible}
            />
          </h1>

          {/* Role */}
          <AnimatedContent
            distance={28}
            direction="vertical"
            duration={0.75}
            ease="power3.out"
            delay={0.3}
            active={isPageVisible}
            className="hero-animated-block"
          >
            <div
              className="hero-role-wrapper"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                flexWrap: 'nowrap',
                whiteSpace: 'nowrap',
                fontSize: '1.125rem',
                color: 'var(--fg-muted)',
                minHeight: '2rem',
                height: '2rem',
              }}
            >
              <span style={{ whiteSpace: 'nowrap' }}>I&apos;m a</span>
              <RotatingText texts={ROLES} interval={2600} />
            </div>
          </AnimatedContent>

          {/* Bio */}
          <AnimatedContent
            distance={28}
            direction="vertical"
            duration={0.8}
            ease="power3.out"
            delay={0.5}
            active={isPageVisible}
            className="hero-animated-block"
          >
            <p className="hero-subtitle">
              CS undergrad at{' '}
              <strong style={{ color: 'var(--fg)', fontWeight: 600 }}>NIT Allahabad</strong> — solved{' '}
              {leetCode.totalSolved}+ problems on LeetCode, building scalable full-stack apps and competing in
              algorithmic challenges.
            </p>
          </AnimatedContent>

          {/* Actions */}
          <AnimatedContent
            distance={24}
            direction="vertical"
            duration={0.8}
            ease="power3.out"
            delay={0.9}
            active={isPageVisible}
            className="hero-animated-block"
          >
            <div className="hero-ctas">
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
            </div>
          </AnimatedContent>

          {/* Scroll hint */}
          <AnimatedContent
            distance={16}
            direction="vertical"
            duration={0.8}
            ease="power3.out"
            delay={1.2}
            active={isPageVisible}
            className="hero-animated-block"
          >
            <div className="hero-scroll-hint">
              <span className="scroll-line" aria-hidden="true" />
              Scroll to explore
              <span className="scroll-line" aria-hidden="true" />
            </div>
          </AnimatedContent>

        </div>
      </div>
    </section>
  )
}
