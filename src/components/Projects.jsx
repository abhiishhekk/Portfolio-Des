import { useState, useEffect, useRef } from 'react'
import { Github, ExternalLink } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DecayCard from './DecayCard'
import './Projects.css'

import urbanResolveImg from '../assets/UrbanResolve.webp'
import teamSyncImg from '../assets/TeamSync.webp'
import plantDiseaseImg from '../assets/PlantDiseaseDetection.webp'
import procTraceImg from '../assets/ProcTrace.webp'

gsap.registerPlugin(ScrollTrigger)

const PROJECTS = [
  {
    id: 'urban-resolve',
    num: '01',
    title: 'UrbanResolve',
    description:
      'An urban issue resolution and complaint tracking platform empowering citizens to report, track, and resolve municipal problems with structured authority management.',
    github: 'https://github.com/abhiishhekk/Complaint_Tracking_System',
    tags: ['React', 'Node.js', 'Express', 'MongoDB', 'REST API'],
    image: urbanResolveImg,
  },
  {
    id: 'team-sync',
    num: '02',
    title: 'TeamSync',
    description:
      'A collaborative team management and task coordination platform built to help teams synchronize workflows, manage project tasks, and communicate in real time.',
    github: 'https://github.com/abhiishhekk/Team-Management-and-Collaboration',
    tags: ['React', 'Node.js', 'MongoDB', 'Express', 'JWT'],
    image: teamSyncImg,
  },
  {
    id: 'plant-disease',
    num: '03',
    title: 'Plant Disease Detection',
    description:
      'An AI agricultural advisor (KrishiMitra) pairing a quantized ResNet50 vision engine with Google Gemini RAG for real-time leaf disease diagnosis and multilingual crop treatment.',
    github: 'https://github.com/abhiishhekk/Plant-disease-detection',
    tags: ['React', 'FastAPI', 'LiteRT / TFLite', 'ResNet50', 'Gemini AI', 'MongoDB'],
    image: plantDiseaseImg,
  },
  {
    id: 'proc-trace',
    num: '04',
    title: 'ProcTrace',
    description:
      'A high-performance live process telemetry dashboard powered by a multithreaded C process monitor, layered Express backend poller, and interactive real-time React analytics.',
    github: 'https://github.com/abhiishhekk/ProcTrace',
    tags: ['C', 'Multithreading', 'Linux', 'Node.js', 'Express', 'React'],
    image: procTraceImg,
  },
]

export default function Projects() {
  const [activeIdx, setActiveIdx] = useState(0)
  const activeIdxRef = useRef(0)
  activeIdxRef.current = activeIdx

  const sectionRef = useRef(null)
  const pinWrapperRef = useRef(null)
  const stageRef = useRef(null)
  const textItemsRef = useRef([])
  const cardItemsRef = useRef([])
  const triggerRef = useRef(null)

  useEffect(() => {
    const pinWrapper = pinWrapperRef.current
    const stage = stageRef.current
    if (!pinWrapper || !stage) return

    const totalProjects = PROJECTS.length
    const maxIndex = totalProjects - 1

    // Smoothstep mapping so each project has a clear resting phase
    const mapProgressToFloatIndex = (p) => {
      const clamped = Math.max(0, Math.min(1, p))
      if (clamped <= 0) return 0
      if (clamped >= 1) return maxIndex

      const segment = Math.min(maxIndex - 1, Math.floor(clamped * maxIndex))
      const localT = clamped * maxIndex - segment
      // Smoothstep curve for natural deceleration at each project
      const easedT = localT * localT * (3 - 2 * localT)
      return segment + easedT
    }

    // Update positions of text slides (vertical) and image cards (horizontal)
    const updateMotion = (progress) => {
      const floatIndex = mapProgressToFloatIndex(progress)
      const currentInt = Math.round(floatIndex)

      if (currentInt !== activeIdxRef.current) {
        setActiveIdx(currentInt)
      }

      // 1. Vertical slide & fade for Text elements
      textItemsRef.current.forEach((el, i) => {
        if (!el) return
        const diff = floatIndex - i
        const absDiff = Math.abs(diff)

        if (absDiff >= 1) {
          el.style.opacity = '0'
          el.style.pointerEvents = 'none'
          el.style.transform = `translate3d(0, ${diff > 0 ? -45 : 45}px, 0)`
          el.style.filter = 'blur(6px)'
        } else {
          const opacity = Math.max(0, 1 - absDiff * 1.5)
          const translateY = diff * -40 // Moves UP as you scroll down
          const blur = Math.min(5, absDiff * 4.5)

          el.style.opacity = opacity.toFixed(3)
          el.style.pointerEvents = absDiff < 0.35 ? 'auto' : 'none'
          el.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`
          el.style.filter = blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : 'none'
        }
      })

      // 2. Horizontal slide & scale for Image Cards
      cardItemsRef.current.forEach((el, i) => {
        if (!el) return
        const diff = floatIndex - i
        const absDiff = Math.abs(diff)

        if (absDiff >= 1) {
          el.style.opacity = '0'
          el.style.pointerEvents = 'none'
          el.style.transform = `translate3d(${diff > 0 ? -105 : 105}%, 0, 0) scale(0.88)`
          el.style.zIndex = '1'
        } else {
          // Horizontal translation relative to slot
          const translateX = -diff * 105 // Positive diff moves LEFT
          const scale = Math.max(0.88, 1 - absDiff * 0.12)
          const opacity = Math.max(0, 1 - absDiff * 0.6)
          const zIndex = 10 - Math.round(absDiff * 5)

          el.style.opacity = opacity.toFixed(3)
          el.style.pointerEvents = absDiff < 0.3 ? 'auto' : 'none'
          el.style.transform = `translate3d(${translateX.toFixed(1)}%, 0, 0) scale(${scale.toFixed(3)})`
          el.style.zIndex = String(zIndex)
        }
      })
    }

    const ctx = gsap.context(() => {
      // 2.8 viewports of pinned scroll distance
      const scrollDistance = () => window.innerHeight * 2.8

      triggerRef.current = ScrollTrigger.create({
        trigger: pinWrapper,
        start: 'top top',
        end: () => `+=${scrollDistance()}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.4,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: {
          snapTo: [0, 1 / 3, 2 / 3, 1],
          duration: { min: 0.25, max: 0.5 },
          delay: 0.08,
          ease: 'power2.out',
        },
        onToggle: (self) => {
          if (self.isActive) {
            window.dispatchEvent(new CustomEvent('portfolio:active-section', { detail: 'Projects' }))
          }
        },
        onUpdate: (self) => {
          updateMotion(self.progress)
          if (self.isActive) {
            window.dispatchEvent(new CustomEvent('portfolio:active-section', { detail: 'Projects' }))
          }
        },
      })

      // Initialize layout setup immediately
      updateMotion(0)

      document.fonts?.ready?.then(() => {
        ScrollTrigger.refresh()
      })
    }, sectionRef)

    // Touch swipe support for mobile
    let touchStartX = 0
    let touchStartY = 0
    const onTouchStart = (e) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    }
    const onTouchEnd = (e) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX
      const deltaY = e.changedTouches[0].clientY - touchStartY
      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        const st = triggerRef.current
        if (!st) return
        const next = deltaX < 0 ? activeIdxRef.current + 1 : activeIdxRef.current - 1
        const clamped = Math.max(0, Math.min(totalProjects - 1, next))
        const targetScroll = st.start + (clamped / (totalProjects - 1)) * (st.end - st.start)
        if (window.__lenis) {
          window.__lenis.scrollTo(targetScroll, { duration: 1.0 })
        } else {
          window.scrollTo({ top: targetScroll, behavior: 'smooth' })
        }
      }
    }

    stage.addEventListener('touchstart', onTouchStart, { passive: true })
    stage.addEventListener('touchend', onTouchEnd, { passive: true })

    const handleResize = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      stage.removeEventListener('touchstart', onTouchStart)
      stage.removeEventListener('touchend', onTouchEnd)
      ctx.revert()
    }
  }, [])

  return (
    <section id="projects" className="projects-showcase-section" ref={sectionRef} aria-label="Projects section">
      {/* Pinned Showcase Stage (Locks the screen while scrolling through projects) */}
      <div className="projects-pin-wrapper" ref={pinWrapperRef}>
        <div className="projects-pinned-stage" ref={stageRef}>
          
          {/* Static Section Badge: -- PROJECTS -- */}
          <div className="projects-badge-container">
            <span className="section-label">Projects</span>
          </div>

          {/* Upper Content: Vertical Slide of Headings, Descriptions, Buttons & Tags */}
          <div className="projects-text-stage">
            {PROJECTS.map((proj, idx) => (
              <div
                key={proj.id}
                ref={(el) => (textItemsRef.current[idx] = el)}
                className={`project-text-item ${activeIdx === idx ? 'is-active' : ''}`}
              >
                <h2 className="project-headline-title">
                  {proj.title}
                </h2>

                <p className="project-headline-desc">
                  {proj.description}
                </p>

                <div className="project-headline-meta" aria-label="Technologies and links">
                  <div className="project-headline-tags" aria-label="Technologies used">
                    {proj.tags.map((t) => (
                      <span key={t} className="project-chip-tag">
                        {t}
                      </span>
                    ))}
                  </div>

                  <a
                    href={proj.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-github-pill"
                    aria-label={`View ${proj.title} repository on GitHub`}
                  >
                    <Github size={14} />
                    <span>View on GitHub</span>
                    <ExternalLink size={12} className="btn-arrow-icon" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Lower Content: Horizontal Slide of Project Images */}
          <div className="projects-gallery-viewport">
            <div className="projects-gallery-rail">
              {PROJECTS.map((proj, idx) => (
                <div
                  key={proj.id}
                  ref={(el) => (cardItemsRef.current[idx] = el)}
                  className={`project-gallery-card-slot ${activeIdx === idx ? 'is-active' : ''}`}
                >
                  <div className="project-card-media-wrapper">
                    <DecayCard
                      id={proj.id}
                      image={proj.image}
                      alt={proj.title}
                      maxDisplacement={60}
                      movementBound={15}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
