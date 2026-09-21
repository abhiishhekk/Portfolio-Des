import FadeContent from './FadeContent'
import BlurText from './BlurText'
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
          <FadeContent delay={0}>
            <span className="section-label">Skills</span>
          </FadeContent>

          <FadeContent delay={0.1}>
            <BlurText
              text="What I Work With"
              tag="h2"
              className="section-title"
              style={{ justifyContent: 'center' }}
              duration={0.5}
              delay={60}
            />
          </FadeContent>

          <FadeContent delay={0.2}>
            <p className="section-desc">
              A curated list of technologies and tools I use to build fast, scalable, and
              elegant software.
            </p>
          </FadeContent>
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
