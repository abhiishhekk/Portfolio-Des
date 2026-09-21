import { useState } from 'react'
import { motion } from 'motion/react'
import { Copy, Check, Github, Linkedin, Code2 } from 'lucide-react'
import FadeContent from './FadeContent'

const EMAIL = 'abhishekkr.init@gmail.com'

const SOCIALS = [
  {
    label: 'GitHub',
    href: 'https://github.com/abhiishhekk',
    icon: Github,
    id: 'contact-github-btn',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/abhishek-kumar-init/',
    icon: Linkedin,
    id: 'contact-linkedin-btn',
  },
  {
    label: 'LeetCode',
    href: 'https://leetcode.com/u/abhiishhek_k/',
    icon: Code2,
    id: 'contact-leetcode-btn',
  },
]

export default function Contact() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      const el = document.createElement('textarea')
      el.value = EMAIL
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  return (
    <section id="contact" className="contact-section" aria-label="Contact section">
      <div className="container">
        <FadeContent delay={0}>
          <div className="contact-card">
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                display: 'flex',
                gap: '6px',
              }}
            >
              {[0, 1, 2].map(d => (
                <span
                  key={d}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--border-strong)',
                    opacity: 1 - d * 0.25,
                  }}
                />
              ))}
            </div>

            <FadeContent delay={0.1}>
              <span className="section-label" style={{ justifyContent: 'center' }}>
                Contact
              </span>
            </FadeContent>

            <FadeContent delay={0.2}>
              <h2 className="contact-title">Let&apos;s Connect</h2>
            </FadeContent>

            <FadeContent delay={0.3}>
              <p className="contact-sub">
                Open to full-time roles, internships, freelance projects, and collaboration.
                <br />
                Drop me an email — I usually respond within 24 hours.
              </p>
            </FadeContent>

            <FadeContent delay={0.4}>
              <motion.button
                className="contact-email-btn"
                onClick={handleCopy}
                id="contact-copy-email-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                aria-label={copied ? 'Email copied!' : 'Copy email address'}
              >
                {copied ? (
                  <>
                    <Check size={18} style={{ flexShrink: 0 }} />
                    <span>Copied to clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={18} style={{ flexShrink: 0 }} />
                    <span className="email-text">{EMAIL}</span>
                  </>
                )}
              </motion.button>
            </FadeContent>

            <FadeContent delay={0.5}>
              <p className="copy-feedback" aria-live="polite">
                {copied ? '✓ Email copied to clipboard' : 'Click to copy email'}
              </p>
            </FadeContent>

            <FadeContent delay={0.55}>
              <div className="contact-socials">
                {SOCIALS.map(social => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn"
                    id={social.id}
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    aria-label={`Visit ${social.label} profile`}
                  >
                    <social.icon size={16} aria-hidden="true" />
                    {social.label}
                  </motion.a>
                ))}
              </div>
            </FadeContent>
          </div>
        </FadeContent>
      </div>
    </section>
  )
}
