import { MapPin } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import FadeContent from './FadeContent'
import { useLeetCode } from '../hooks/useLeetCode'

export default function About() {
  const leetCode = useLeetCode('abhiishhek_k')

  const stats = [
    { num: `${leetCode.totalSolved}+`, label: 'DSA Problems Solved' },
    { num: `${leetCode.rating}`, label: 'LeetCode Rating' },
    { num: '6+', label: 'Projects Built' },
    { num: '7.56', label: 'CGPA at NIT Allahabad' },
  ]

  return (
    <section id="about" aria-label="About section">
      <div className="container">
        <div className="about-grid">
          <div className="about-content">
            <ScrollReveal
              tag="h2"
              containerClassName="section-title"
              textClassName="section-title"
            >
              Algorithms, Systems & the Web
            </ScrollReveal>

            <FadeContent delay={0.2}>
              <p className="about-bio" style={{ marginTop: '20px' }}>
                CSE undergrad at NIT Allahabad specializing in{' '}
                <strong>concurrent systems in C</strong> and{' '}
                <strong>full-stack MERN development</strong>. Built <strong>ProcTrace</strong>, a
                real-time Linux telemetry tool, and solved{' '} over {' '}
                <strong>{leetCode.totalSolved} DSA problems</strong> with a{' '}
                <strong>{leetCode.rating} LeetCode rating</strong>. Based in India, open to remote
                work worldwide.
              </p>
              <p className="about-bio" style={{ marginTop: '14px' }}>
                I&apos;m based in <strong>Bihar, India</strong> and open to remote work worldwide —
                flexible with time zones and async collaboration.
              </p>
            </FadeContent>

            <FadeContent delay={0.3}>
              <div className="location-badge" style={{ marginTop: '24px' }}>
                <MapPin size={14} aria-hidden="true" />
                Bihar, India
              </div>
            </FadeContent>
          </div>

          <FadeContent delay={0.2} direction="up" className="about-stat-wrap">
            <div className="about-stat-grid" style={{ marginTop: '8px' }}>
              {stats.map(s => (
                <div className="about-stat" key={s.label}>
                  <span className="about-stat-num">{s.num}</span>
                  <span className="about-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </FadeContent>
        </div>
      </div>
    </section>
  )
}
