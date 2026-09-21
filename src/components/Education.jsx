import FadeContent from './FadeContent'
import BlurText from './BlurText'

const EDUCATION = [
  {
    date: '2023 — Present',
    title: 'B.Tech. in Computer Science Engineering',
    org: 'Motilal Nehru National Institute of Technology Allahabad',
    location: 'Prayagraj, Uttar Pradesh',
    desc: 'Focusing on Data Structures & Algorithms, Object-Oriented Programming, and full-stack development. Active participant in competitive programming contests.',
  },
  {
    date: '2021 — 2023',
    title: 'Senior Secondary (Class XII)',
    org: 'Nardiganj College',
    location: 'Nardiganj, Bihar',
    desc: 'Completed senior secondary education with a focus on Science stream — Physics, Chemistry, and Mathematics.',
  },
  {
    date: '2019 — 2021',
    title: 'Matriculation (Class X)',
    org: 'Gyan Bharti Model Residential Complex',
    location: 'Hisua, Bihar',
    desc: 'Completed foundational schooling with distinction, developing a strong interest in mathematics and logical reasoning.',
  },
]

export default function Education() {
  return (
    <section id="education" aria-label="Education section">
      <div className="container">
        <div className="divider" style={{ marginBottom: '100px' }} />

        {/* Centered Section Header */}
        <div className="section-header-center">
          <FadeContent delay={0}>
            <span className="section-label">Education</span>
          </FadeContent>

          <FadeContent delay={0.1}>
            <BlurText
              text="Academic Background"
              tag="h2"
              className="section-title"
              style={{ justifyContent: 'center' }}
              duration={0.5}
              delay={60}
            />
          </FadeContent>

          <FadeContent delay={0.2}>
            <p className="section-desc">
              My educational journey — from foundational schooling to a Computer Science degree
              at one of India&apos;s premier technical institutions.
            </p>
          </FadeContent>
        </div>

        <div className="timeline">
          {EDUCATION.map((edu, i) => (
            <FadeContent key={edu.title} delay={0.15 + i * 0.12} direction="up">
              <div className="timeline-item">
                <div className="timeline-date-col">
                  <span className="timeline-date">{edu.date}</span>
                </div>

                <div className="timeline-line-col" aria-hidden="true">
                  <span className="timeline-dot" />
                  <span className="timeline-line" />
                </div>

                <div className="timeline-content">
                  <span className="timeline-mobile-date">{edu.date}</span>
                  <h3 className="timeline-title">{edu.title}</h3>
                  <p className="timeline-org">
                    {edu.org}
                    {edu.location && (
                      <span style={{ color: 'var(--fg-subtle)' }}> — {edu.location}</span>
                    )}
                  </p>
                  <p className="timeline-desc">{edu.desc}</p>
                </div>
              </div>
            </FadeContent>
          ))}
        </div>
      </div>
    </section>
  )
}
