import { MapPin } from 'lucide-react'
import BlurText from './BlurText'
import FadeContent from './FadeContent'
import { useLeetCode } from '../hooks/useLeetCode'

export default function About() {
  const leetCode = useLeetCode('abhiishhek_k')

  const stats = [
    { num: `${leetCode.totalSolved}+`, label: 'DSA Problems Solved' },
    { num: `${leetCode.rating}`, label: 'LeetCode Rating' },
    { num: '6+', label: 'Projects Built' },
    { num: '7.56', label: 'CGPA at MNNIT' },
  ]

  return (
    <section id="about" aria-label="About section">
      <div className="container">
        <FadeContent delay={0} className="about-label-wrap">
          <span className="section-label">About</span>
        </FadeContent>

        <div className="about-grid">
          <div className="about-content">
            <FadeContent delay={0.1}>
              <BlurText
                text="My Passion for Coding"
                tag="h2"
                className="section-title"
                duration={0.5}
                delay={60}
              />
            </FadeContent>

            <FadeContent delay={0.2}>
              <p className="about-bio" style={{ marginTop: '20px' }}>
                CS undergraduate skilled in{' '}
                <strong>concurrent &amp; multithreaded systems (C)</strong> and full-stack MERN
                development; built a real-time Linux telemetry system (ProcTrace) applying OS &amp;
                networking coursework. Solved <strong>{leetCode.totalSolved}+ DSA problems</strong> across LeetCode,
                Codeforces and GeeksForGeeks.
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

          <FadeContent delay={0.2} direction="up">
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
