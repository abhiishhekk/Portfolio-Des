import { useState, useEffect, useRef } from 'react'
import { Github, ExternalLink } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PixelTransition from './PixelTransition'
import './Projects.css'

import urbanResolveImg from '../assets/UrbanResolve.webp'
import teamSyncImg from '../assets/TeamSync.webp'
import plantDiseaseImg from '../assets/PlantDiseaseDetection.webp'
import procTraceImg from '../assets/ProcTrace.webp'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

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
    problem:
      'Municipal grievance reporting in cities is frequently fragmented, untracked, and prone to bureaucratic blackholes, causing civic issues (drainage, roads, sanitation, electrical hazards) to languish for weeks without accountability.',
    users:
      'Urban residents & civic communities reporting local problems, municipal ward maintenance engineers, and municipal grievance dispatch officers.',
    highlights: [
      'Role-based authority dispatch (Citizen vs Admin vs Municipal Officer) with strict ticket state transitions (Reported → In Progress → Resolved).',
      'Geocoded issue geotagging with image attachments to ensure verified physical problem reporting and prevent duplicate work orders.',
      'REST API architecture with MongoDB aggregation pipelines for ward-level resolution analytics and civic turnaround metrics.',
    ],
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
    problem:
      'Distributed engineering teams often struggle with fragmented context across disconnected task trackers and chat apps, causing sprint bottlenecks, misaligned priorities, and communication silos.',
    users:
      'Agile software engineering squads, scrum masters, technical product managers, and remote development teams.',
    highlights: [
      'Real-time synchronized kanban boards and sprint coordination via persistent WebSocket events and live presence indicators.',
      'Granular JWT authentication with workspace-level data isolation, encrypted session cookies, and multi-tenant role permissions.',
      'Optimized MongoDB data schemas for sprint velocity tracking, task dependency chains, and automated project milestone audits.',
    ],
  },
  {
    id: 'plant-disease',
    num: '03',
    title: 'KrishiMitra',
    description:
      'An AI agricultural advisor (KrishiMitra) pairing a quantized ResNet50 vision engine with Google Gemini RAG for real-time leaf disease diagnosis and multilingual crop treatment.',
    github: 'https://github.com/abhiishhekk/Plant-disease-detection',
    tags: ['React', 'FastAPI', 'LiteRT / TFLite', 'ResNet50', 'MongoDB'],
    image: plantDiseaseImg,
    problem:
      'Crop pathogens destroy 20–40% of agricultural yields annually. Smallholder farmers lack immediate access to plant pathologists, leading to misdiagnosis, delayed treatment, or excessive chemical damage.',
    users:
      'Farmers, agricultural extension officers, agritech field consultants, and crop pathology researchers.',
    highlights: [
      'Edge-optimized quantized ResNet50 vision engine (LiteRT / TFLite) delivering real-time, sub-second leaf disease diagnosis at edge speed.',
      'Google Gemini AI RAG pipeline providing multilingual disease remedies, organic alternatives, and exact chemical fertilizer dosages.',
      'High-concurrency FastAPI asynchronous backend with multi-modal payload validation, image preprocessing, and query caching.',
    ],
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
    problem:
      'High-density Linux production servers need low-overhead live process telemetry and thread anomaly monitoring without kernel resource starvation, heavy daemon overhead, or latency spikes.',
    users:
      'Linux DevOps/SREs, systems programmers, cloud infrastructure leads, and backend performance architects.',
    highlights: [
      'Multithreaded C process monitor extracting `/proc` filesystem metrics with microsecond precision, POSIX threads, and zero memory leaks.',
      'Layered asynchronous Express backend polling daemon aggregating CPU bursts, thread lifecycle states, and RSS memory consumption.',
      'Interactive real-time React analytics interface rendering live telemetry with dynamic PID filtering and resource pressure graphs.',
    ],
  },
]

function ProjectDossierGrid({ proj }) {
  return (
    <div className="project-dossier-grid">
      {/* Left Column: What the project real-life problem solves */}
      <div className="dossier-cell dossier-cell-problem">
        <p className="dossier-text">{proj.problem}</p>
      </div>

      {/* Right Column Top: Intended users */}
      <div className="dossier-cell dossier-cell-users">
        <p className="dossier-text">{proj.users}</p>
      </div>

      {/* Right Column Bottom: Recruiter highlights and key architecture */}
      <div className="dossier-cell dossier-cell-highlights">
        <ul className="dossier-list">
          {proj.highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Projects() {
  const [activeIdx, setActiveIdx] = useState(0)
  const activeIdxRef = useRef(0)
  activeIdxRef.current = activeIdx

  const sectionRef = useRef(null)
  const pinWrapperRef = useRef(null)
  const stageRef = useRef(null)
  const textItemsRef = useRef([])
  const cardItemsRef = useRef([])
  const mobileDossierItemsRef = useRef([])
  const triggerRef = useRef(null)

  useEffect(() => {
    const pinWrapper = pinWrapperRef.current
    const stage = stageRef.current
    if (!pinWrapper || !stage) return

    const totalProjects = PROJECTS.length
    const maxIndex = totalProjects - 1

    // Apple-style continuous harmonic S-curve:
    // Glides seamlessly across projects with natural deceleration at each item and zero jerk or dead stops.
    const mapProgressToFloatIndex = (p) => {
      const clamped = Math.max(0, Math.min(1, p))
      if (clamped <= 0) return 0
      if (clamped >= 1) return maxIndex

      const raw = clamped * maxIndex
      const segment = Math.min(maxIndex - 1, Math.floor(raw))
      const localT = raw - segment

      // Pure cosine harmonic ease: continuous C1 velocity with gentle zero-derivative ease at stations
      const easedT = (1 - Math.cos(localT * Math.PI)) / 2
      return segment + easedT
    }

    // Update positions of text slides (vertical) and image cards (horizontal)
    const updateMotion = (progress) => {
      const floatIndex = mapProgressToFloatIndex(progress)
      const currentInt = Math.round(floatIndex)

      if (currentInt !== activeIdxRef.current) {
        setActiveIdx(currentInt)
      }

      // 1. Vertical slide & fade for Text elements (lightweight, zero filter blur for pure 120fps)
      textItemsRef.current.forEach((el, i) => {
        if (!el) return
        const diff = floatIndex - i
        const absDiff = Math.abs(diff)

        if (absDiff >= 1) {
          el.style.opacity = '0'
          el.style.pointerEvents = 'none'
          el.style.transform = `translate3d(0, ${diff > 0 ? -36 : 36}px, 0)`
          el.style.filter = 'none'
        } else {
          const opacity = Math.max(0, 1 - absDiff * 1.5)
          const translateY = diff * -32 // Soft upward drift
          el.style.opacity = opacity.toFixed(3)
          el.style.pointerEvents = absDiff < 0.35 ? 'auto' : 'none'
          el.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`
          el.style.filter = 'none'
        }
      })

      // 2. Horizontal slide & subtle scale for Image Cards (Apple Keynote style)
      cardItemsRef.current.forEach((el, i) => {
        if (!el) return
        const diff = floatIndex - i
        const absDiff = Math.abs(diff)

        if (absDiff >= 1) {
          el.style.opacity = '0'
          el.style.pointerEvents = 'none'
          el.style.transform = `translate3d(${diff > 0 ? -100 : 100}%, 0, 0) scale(0.92)`
          el.style.zIndex = '1'
        } else {
          // Horizontal glide with subtle scale down when receding
          const translateX = -diff * 100
          const scale = 1 - absDiff * 0.08 // Elegant Apple-like subtle scale (1.0 -> 0.92)
          const opacity = Math.max(0, 1 - absDiff * 1.2)
          const zIndex = 10 - Math.round(absDiff * 4)

          el.style.opacity = opacity.toFixed(3)
          el.style.pointerEvents = absDiff < 0.35 ? 'auto' : 'none'
          el.style.transform = `translate3d(${translateX.toFixed(1)}%, 0, 0) scale(${scale.toFixed(3)})`
          el.style.zIndex = String(zIndex)
        }
      })

      // 3. Vertical slide & fade for Mobile Dossier (synchronized with Text Stage)
      mobileDossierItemsRef.current.forEach((el, i) => {
        if (!el) return
        const diff = floatIndex - i
        const absDiff = Math.abs(diff)

        if (absDiff >= 1) {
          el.style.opacity = '0'
          el.style.pointerEvents = 'none'
          el.style.transform = `translate3d(0, ${diff > 0 ? -36 : 36}px, 0)`
          el.style.filter = 'none'
        } else {
          const opacity = Math.max(0, 1 - absDiff * 1.5)
          const translateY = diff * -32 // Exact upward drift matching the text stage
          el.style.opacity = opacity.toFixed(3)
          el.style.pointerEvents = absDiff < 0.35 ? 'auto' : 'none'
          el.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`
          el.style.filter = 'none'
        }
      })
    }

    // Stable viewport height cache: prevents mobile address bar expand/collapse from altering scroll runway length
    let stableViewportHeight = window.innerHeight
    let lastWindowWidth = window.innerWidth

    const ctx = gsap.context(() => {
      // 3.6 viewports of pinned scroll distance: perfectly balanced runway for 4 showcase items
      const scrollDistance = () => stableViewportHeight * 3.6

      triggerRef.current = ScrollTrigger.create({
        trigger: pinWrapper,
        start: 'top top',
        end: () => `+=${scrollDistance()}`,
        pin: true,
        pinSpacing: true,
        refreshPriority: 1, // CRITICAL: Higher priority ensures pin spacer is measured before lower sections calculate offsets
        scrub: true,
        anticipatePin: 0,
        invalidateOnRefresh: false,
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

      // Section entrance reveal: as user scrolls into the Projects section, stage gently enters focus
      gsap.fromTo(
        stage,
        { opacity: 0.2, y: 24 },
        {
          opacity: 1,
          y: 0,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: pinWrapper,
            start: 'top 92%',
            end: 'top 15%',
            scrub: 0.5,
          },
        }
      )

      // Initialize layout setup immediately
      updateMotion(0)

      // Immediately refresh ScrollTrigger and notify smooth scroller of the new pin spacer
      ScrollTrigger.refresh()
      window.__lenis?.resize()

      document.fonts?.ready?.then(() => {
        ScrollTrigger.refresh()
        window.__lenis?.resize()
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
      // Only refresh ScrollTrigger if the window width actually changed (e.g. orientation change or desktop window resize).
      // Ignore vertical-only mobile browser address bar collapse/expand to prevent sudden height jumps/flickering.
      if (Math.abs(window.innerWidth - lastWindowWidth) > 10) {
        lastWindowWidth = window.innerWidth
        stableViewportHeight = window.innerHeight
        ScrollTrigger.refresh()
        window.__lenis?.resize()
      }
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
          {/* Upper Content: Vertical Slide of Headings, Descriptions, Buttons & Tags */}
          <div className="projects-text-stage">
            {PROJECTS.map((proj, idx) => (
              <div
                key={proj.id}
                ref={(el) => (textItemsRef.current[idx] = el)}
                className={`project-text-item project-item-${proj.id} ${activeIdx === idx ? 'is-active' : ''}`}
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

          {/* Lower Content: Horizontal Slide of Project Cards */}
          <div className="projects-gallery-viewport">
            <div className="projects-gallery-rail">
              {PROJECTS.map((proj, idx) => (
                <div
                  key={proj.id}
                  ref={(el) => (cardItemsRef.current[idx] = el)}
                  className={`project-gallery-card-slot ${activeIdx === idx ? 'is-active' : ''}`}
                >
                  {/* Desktop View: Image with PixelTransition swap revealing the [ | - ] dossier on hover */}
                  <div className="project-card-desktop">
                    <PixelTransition
                      firstContent={
                        <div className="project-pixel-front">
                          <img
                            src={proj.image}
                            alt={`${proj.title} preview screenshot`}
                            className="project-pixel-front-img"
                            loading={idx === 0 ? 'eager' : 'lazy'}
                          />
                        </div>
                      }
                      secondContent={
                        <div className="project-dossier-overlay">
                          <ProjectDossierGrid proj={proj} />
                        </div>
                      }
                      gridSize={12}
                      pixelColor="var(--pixel-color, #ffffff)"
                      once={false}
                      animationStepDuration={0.35}
                      className="project-pixel-transition"
                    />
                  </div>

                  {/* Smartphone View: Image ONLY (Only the images swipe horizontally!) */}
                  <div className="project-card-mobile-img-only">
                    <img
                      src={proj.image}
                      alt={`${proj.title} preview screenshot`}
                      className="project-mobile-img-clean"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smartphone Lower Content: Vertical Slide of Dossier Info (scrolling vertically like the heading!) */}
          <div className="projects-mobile-dossier-stage" aria-label="Project details for mobile">
            {PROJECTS.map((proj, idx) => (
              <div
                key={`mobile-dossier-${proj.id}`}
                ref={(el) => (mobileDossierItemsRef.current[idx] = el)}
                className={`project-mobile-dossier-item ${activeIdx === idx ? 'is-active' : ''}`}
              >
                <ProjectDossierGrid proj={proj} />
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
