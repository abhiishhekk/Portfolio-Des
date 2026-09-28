import FadeContent from './FadeContent'
import ScrollReveal from './ScrollReveal'
import StackChips from './StackChips'

const SKILLS = [
  'C / C++',
  'JavaScript (ES6+)',
  'React.js',
  'Node.js',
  'Express.js',
  'MongoDB',
  'Tailwind CSS',
  'SQL / MySQL',
  'Linux Systems',
  'Data Structures & Algorithms',
  'Git / GitHub',
  'Cloud / GCP',
]

export default function Skills() {
  return (
    <section id="skills" aria-label="Skills section">
      <div className="container">
        <div className="divider" style={{ marginBottom: '100px' }} />

        <div className="section-header-center">
          <ScrollReveal
            tag="h2"
            containerClassName="section-title"
            textClassName="section-title"
            style={{ textAlign: 'center' }}
          >
            What I Work With
          </ScrollReveal>

          <ScrollReveal
            tag="p"
            containerClassName="section-desc"
            textClassName="section-desc"
            style={{ textAlign: 'center', margin: '0 auto' }}
          >
            A curated list of technologies and tools I use to build fast, scalable, and
            elegant software.
          </ScrollReveal>
        </div>

        <div className="skills-grid">
          {SKILLS.map((skill, i) => (
            <FadeContent key={skill} delay={0.08 + i * 0.03}>
              <span className="skill-tag" id={`skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}>
                {skill}
              </span>
            </FadeContent>
          ))}
        </div>

        <FadeContent delay={0.3}>
          <div style={{ marginTop: '60px' }}>
            <h3
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '1.0625rem',
                fontWeight: 700,
                color: 'var(--fg)',
                letterSpacing: '-0.02em',
                marginBottom: '20px',
              }}
            >
              Stack
            </h3>
            <StackChips />
          </div>
        </FadeContent>
      </div>
    </section>
  )
}
