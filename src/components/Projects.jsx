import { useState, useEffect, useRef, useCallback } from 'react'
import { Github, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { lockScroll, unlockScroll } from '../utils/scrollLock'
import AnimatedContent from './AnimatedContent'
import './Projects.css'

import urbanResolveImg from '../assets/UrbanResolve.webp'
import teamSyncImg from '../assets/TeamSync.webp'
import plantDiseaseImg from '../assets/PlantDiseaseDetection.webp'
import procTraceImg from '../assets/ProcTrace.webp'

const PROJECTS = [
  {
    id: 'urban-resolve',
    num: '01',
    eyebrow: 'Civic Tech & Dispatch',
    headline: 'Report. Track. Resolve.',
    title: 'UrbanResolve',
    tagline: 'An urban issue resolution platform empowering citizens & municipal teams to eliminate civic blackholes.',
    description:
      'An urban issue resolution and complaint tracking platform empowering citizens to report, track, and resolve municipal problems with structured authority management.',
    theme: 'dark-navy',
    accentColor: '#38bdf8',
    badge: 'Municipal Ops',
    github: 'https://github.com/abhiishhekk/Complaint_Tracking_System',
    tags: ['React', 'Node.js', 'Express', 'MongoDB', 'REST API'],
    image: urbanResolveImg,
    problem:
      'Municipal grievance reporting in cities is frequently fragmented, untracked, and prone to bureaucratic blackholes, causing civic issues (drainage, roads, sanitation, electrical hazards) to languish for weeks without accountability.',
    users:
      'Urban residents & civic communities reporting local problems, municipal ward maintenance engineers, and municipal grievance dispatch officers.',
    highlights: [
      'Role-based authority dispatch (Citizen vs Admin vs Municipal Officer) with strict ticket state transitions (Pending → In Progress → Under Review → Resolved).',
      'Geocoded issue geotagging with image attachments to ensure verified physical problem reporting and prevent duplicate work orders.',
      'REST API architecture with MongoDB aggregation pipelines for ward-level resolution analytics and civic turnaround metrics.',
    ],
  },
  {
    id: 'plant-disease',
    num: '02',
    eyebrow: 'Quantized Edge AI & Gemini',
    headline: 'Smart. Precise. On device.',
    title: 'KrishiMitra',
    tagline: 'Edge-quantized ResNet50 paired with Google Gemini RAG for real-time leaf diagnosis and multilingual crop treatment.',
    description:
      'An AI agricultural advisor pairing a quantized ResNet50 vision engine with Google Gemini RAG for real-time leaf disease diagnosis and multilingual crop treatment.',
    theme: 'dark-ai',
    accentColor: '#10b981',
    badge: 'Edge AI Vision',
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
    id: 'team-sync',
    num: '03',
    eyebrow: 'Real-Time Collaboration',
    headline: 'Sync tasks. Align teams.',
    title: 'TeamSync',
    tagline: 'Live WebSocket kanban boards and sprint coordination with workspace isolation.',
    description:
      'A collaborative team management and task coordination platform built to help teams synchronize workflows, manage project tasks, and communicate in real time.',
    theme: 'light-apple',
    accentColor: '#6366f1',
    badge: 'Team Ops',
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
    id: 'proc-trace',
    num: '04',
    eyebrow: 'Realtime CPU & Memory Monitor',
    headline: 'Deep trace. Zero lag.',
    title: 'ProcTrace',
    tagline: 'High-density multithreaded Linux process telemetry dashboard with microsecond precision.',
    description:
      'A high-performance live process telemetry dashboard powered by a multithreaded C process monitor, layered Express backend poller, and interactive real-time React analytics.',
    theme: 'dark-graphite',
    accentColor: '#f59e0b',
    badge: 'Kernel Telemetry',
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

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [isClosing, setIsClosing] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const sectionRef          = useRef(null)
  const headerContainerRef  = useRef(null)
  const headlineRef         = useRef(null)
  const railRef             = useRef(null)       // the sliding flex rail
  const scrollXRef          = useRef(0)          // current slide offset (px)
  const maxScrollXRef       = useRef(0)          // maximum slide offset
  const currentIndexRef     = useRef(0)          // current active card index (0 to 3)
  const isDraggingRef       = useRef(false)
  const startXRef           = useRef(0)
  const baseScrollRef       = useRef(0)
  const hasDraggedRef       = useRef(false)

  const getHeadingLeft = () => {
    if (typeof window === 'undefined') return 16
    const isMobile = window.innerWidth <= 768
    if (isMobile) return 16
    if (headlineRef.current) {
      const rect = headlineRef.current.getBoundingClientRect()
      if (rect.left > 0) return rect.left
    }
    return Math.max(24, (window.innerWidth - 1100) / 2 + 24)
  }

  const [leftOffset, setLeftOffset] = useState(getHeadingLeft)

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Write the current scrollX to the rail's transform, no animation. */
  const applyInstant = useCallback((x) => {
    const rail = railRef.current
    if (!rail) return
    rail.style.transition = 'none'
    rail.style.transform  = `translateX(${-x}px)`
  }, [])

  /** Slide the rail to position x with a smooth CSS transition. */
  const applySmooth = useCallback((x) => {
    const rail = railRef.current
    if (!rail) return
    rail.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    rail.style.transform  = `translateX(${-x}px)`
  }, [])

  /** Calculate step width between cards (card width + gap) */
  const getStep = useCallback(() => {
    const rail = railRef.current
    const cards = rail?.querySelectorAll('.apple-project-card')
    if (cards && cards.length > 0) {
      const cardW = cards[0].offsetWidth
      const gap = window.innerWidth <= 768 ? 16 : 20
      return cardW + gap
    }
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return (window.innerWidth - 32) + 16
    }
    return 340 + 20
  }, [])

  /** Measure the exact left coordinate of the heading text */
  const updateAlignment = useCallback(() => {
    setLeftOffset(getHeadingLeft())
  }, [])

  /**
   * Navigate to a specific card index.
   * On mobile, each card is 100vw - 32px with 16px left/right margins,
   * showing strictly ONE card at a time.
   */
  const goToCard = useCallback((index, smooth = true) => {
    const clampedIndex = Math.max(0, Math.min(PROJECTS.length - 1, index))
    currentIndexRef.current = clampedIndex

    const step = getStep()
    let target = clampedIndex * step
    if (target > maxScrollXRef.current) {
      target = maxScrollXRef.current
    }
    target = Math.max(0, target)

    scrollXRef.current = target
    if (smooth) {
      applySmooth(target)
    } else {
      applyInstant(target)
    }

    setCanScrollLeft(clampedIndex > 0)
    setCanScrollRight(clampedIndex < PROJECTS.length - 1)
  }, [getStep, applySmooth, applyInstant])

  /**
   * Compute maxScrollX and keep carousel properly aligned on viewport changes
   */
  const computeMaxScroll = useCallback(() => {
    const rail = railRef.current
    if (!rail) return

    const max = Math.max(0, rail.scrollWidth - window.innerWidth)
    maxScrollXRef.current = max

    // Keep active card aligned
    const step = getStep()
    const target = Math.min(max, currentIndexRef.current * step)
    scrollXRef.current = target
    applyInstant(target)

    setCanScrollLeft(currentIndexRef.current > 0)
    setCanScrollRight(currentIndexRef.current < PROJECTS.length - 1)
  }, [applyInstant, getStep])

  // Prevent any horizontal window scrolling
  useEffect(() => {
    if (window.scrollX > 0) {
      window.scrollTo(0, window.scrollY)
    }
  }, [])

  // ─── On mount & resize: keep alignment and max-scroll in sync ──────────────
  useEffect(() => {
    const sync = () => {
      if (window.scrollX > 0) window.scrollTo(0, window.scrollY)
      updateAlignment()
      computeMaxScroll()
    }
    sync()
    const raf = requestAnimationFrame(sync)
    const ro = new ResizeObserver(sync)
    ro.observe(document.documentElement)
    if (headerContainerRef.current) ro.observe(headerContainerRef.current)
    window.addEventListener('resize', sync)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [updateAlignment, computeMaxScroll])

  // ─── Intersection observer for nav highlight ───────────────────────────────

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting)
          window.dispatchEvent(new CustomEvent('portfolio:active-section', { detail: 'Projects' }))
      }),
      { threshold: 0.25 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // ─── Horizontal wheel / trackpad swipe ────────────────────────────────────
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return

    let gestureLock = null
    let gestureTimer = null

    const onWheel = (e) => {
      if (!gestureLock) {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          gestureLock = 'horizontal'
        } else {
          gestureLock = 'vertical'
        }
      }

      clearTimeout(gestureTimer)
      gestureTimer = setTimeout(() => {
        gestureLock = null
      }, 140)

      if (gestureLock === 'vertical') {
        return
      }

      if (gestureLock === 'horizontal' && Math.abs(e.deltaX) > 0) {
        e.preventDefault()
        e.stopPropagation()
        const next = Math.max(0, Math.min(maxScrollXRef.current, scrollXRef.current + e.deltaX))
        scrollXRef.current = next
        applyInstant(next)
        const step = getStep()
        currentIndexRef.current = Math.min(PROJECTS.length - 1, Math.round(next / step))
        setCanScrollLeft(currentIndexRef.current > 0)
        setCanScrollRight(currentIndexRef.current < PROJECTS.length - 1)
      }
    }

    rail.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      clearTimeout(gestureTimer)
      rail.removeEventListener('wheel', onWheel)
    }
  }, [applyInstant, getStep])

  // ─── Chevron buttons ──────────────────────────────────────────────────────

  const handleScroll = (direction) => {
    if (direction === 'left') {
      goToCard(currentIndexRef.current - 1)
    } else {
      goToCard(currentIndexRef.current + 1)
    }
  }

  // ─── Mouse drag ───────────────────────────────────────────────────────────

  const handleMouseDown = (e) => {
    if (e.button !== 0 || e.target.closest('button') || e.target.closest('a')) return
    isDraggingRef.current = true
    hasDraggedRef.current = false
    startXRef.current     = e.clientX
    baseScrollRef.current = scrollXRef.current
    if (railRef.current) {
      railRef.current.style.transition = 'none'
      railRef.current.style.cursor = 'grabbing'
    }
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return
      const walk = startXRef.current - e.clientX
      if (Math.abs(walk) > 4) hasDraggedRef.current = true
      const next = Math.max(0, Math.min(maxScrollXRef.current, baseScrollRef.current + walk))
      scrollXRef.current = next
      applyInstant(next)
    }

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      if (railRef.current) railRef.current.style.cursor = ''
      const step = getStep()
      const nearestIndex = Math.min(PROJECTS.length - 1, Math.round(scrollXRef.current / step))
      goToCard(nearestIndex)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [applyInstant, getStep, goToCard])

  // ─── Touch swipe with card-by-card snapping on phones ─────────────────────

  const touchStartXRef = useRef(0)
  const touchStartYRef = useRef(0)
  const isTouchDraggingRef = useRef(false)
  const isHorizontalSwipeRef = useRef(false)

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return
    touchStartXRef.current = e.touches[0].clientX
    touchStartYRef.current = e.touches[0].clientY
    baseScrollRef.current = scrollXRef.current
    isTouchDraggingRef.current = true
    isHorizontalSwipeRef.current = false
    hasDraggedRef.current = false
    if (railRef.current) railRef.current.style.transition = 'none'
  }

  const handleTouchMove = (e) => {
    if (!isTouchDraggingRef.current || e.touches.length !== 1) return
    const dx = touchStartXRef.current - e.touches[0].clientX
    const dy = touchStartYRef.current - e.touches[0].clientY

    if (!isHorizontalSwipeRef.current) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
      if (Math.abs(dx) > Math.abs(dy)) {
        isHorizontalSwipeRef.current = true
      } else {
        // Vertical touch swipe: let page scroll normally!
        isTouchDraggingRef.current = false
        return
      }
    }

    if (isHorizontalSwipeRef.current) {
      hasDraggedRef.current = true
      const next = Math.max(0, Math.min(maxScrollXRef.current, baseScrollRef.current + dx))
      scrollXRef.current = next
      applyInstant(next)
    }
  }

  const handleTouchEnd = () => {
    isTouchDraggingRef.current = false
    if (!isHorizontalSwipeRef.current) return
    isHorizontalSwipeRef.current = false

    const dragDelta = scrollXRef.current - baseScrollRef.current

    // Drag threshold of 28px cleanly advances or rewinds card
    if (dragDelta > 28) {
      goToCard(currentIndexRef.current + 1)
    } else if (dragDelta < -28) {
      goToCard(currentIndexRef.current - 1)
    } else {
      goToCard(currentIndexRef.current)
    }
  }

  const handleCardClick = (project) => {
    if (hasDraggedRef.current) { hasDraggedRef.current = false; return }
    handleOpenModal(project)
  }

  // ─── Modal ─────────────────────────────────────────────────────────────────

  const handleOpenModal = (project) => {
    setSelectedProject(project)
    setIsClosing(false)
    lockScroll()
  }

  const handleCloseModal = useCallback(() => {
    if (isClosing) return
    setIsClosing(true)
  }, [isClosing])

  const finishClosing = useCallback(() => {
    setSelectedProject(null)
    setIsClosing(false)
    unlockScroll()
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && selectedProject && !isClosing) {
        handleCloseModal()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedProject, isClosing, handleCloseModal])

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <section
      id="projects"
      className="apple-projects-section"
      ref={sectionRef}
      aria-label="Projects section"
    >
      {/* ── Header: sits in the centered site container ── */}
      <div className="container apple-projects-header-container" ref={headerContainerRef}>
        <AnimatedContent
          distance={28}
          direction="vertical"
          duration={0.75}
          ease="power3.out"
          threshold={0.15}
        >
          <div className="apple-projects-title-row">
            <div className="apple-projects-heading-wrap">
              <h2 className="apple-projects-headline" ref={headlineRef}>
                Get to know my projects.
              </h2>
            </div>

            <div className="apple-carousel-controls" aria-label="Carousel navigation">
              <button
                type="button"
                className={`apple-nav-btn ${!canScrollLeft ? 'is-disabled' : ''}`}
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                aria-label="Previous project"
              >
                <ChevronLeft size={20} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                className={`apple-nav-btn ${!canScrollRight ? 'is-disabled' : ''}`}
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                aria-label="Next project"
              >
                <ChevronRight size={20} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </AnimatedContent>
      </div>

      {/*
        ── Full-Bleed Carousel Track ──────────────────────────────────────────
        The track spans the full viewport width (not trapped in a fixed container box).
        Card 1 starts at paddingLeft matching the heading's measured left position.
        Cards extend across the full screen to the right and slide off to the full left.
        ─────────────────────────────────────────────────────────────────────
      */}
      <AnimatedContent
        distance={36}
        direction="vertical"
        duration={0.85}
        delay={0.12}
        ease="power3.out"
        threshold={0.1}
        className="apple-carousel-animated-wrapper"
      >
        <div className="apple-carousel-track">
          <div
            className="apple-carousel-rail"
            ref={railRef}
            style={{ paddingLeft: `${leftOffset}px` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {PROJECTS.map((proj, idx) => (
              <article
                key={proj.id}
                className={`apple-project-card card-theme-${proj.theme}`}
                onClick={() => handleCardClick(proj)}
                role="button"
                aria-label={`Project: ${proj.title}. ${proj.headline}. Click to view details.`}
              >
                {/* Card Ambient Glow */}
                <div className="card-ambient-backdrop" />

                {/* Card Header */}
                <div className="card-top-content">
                  <span className="card-eyebrow">{proj.eyebrow}</span>
                  <h3 className="card-headline">{proj.headline}</h3>
                  <p className="card-tagline">{proj.tagline}</p>
                </div>

                {/* Card Visual */}
                <div className="card-visual-frame">
                  <div className="card-mockup-window">
                    <div className="card-mockup-header" aria-hidden="true">
                      <span className="window-dot dot-red" />
                      <span className="window-dot dot-yellow" />
                      <span className="window-dot dot-green" />
                      <span className="window-title">{proj.title}</span>
                    </div>
                    <div className="card-image-wrap">
                      <img
                        src={proj.image}
                        alt={`${proj.title} interface preview`}
                        className="card-preview-img"
                        loading={idx === 0 ? 'eager' : 'lazy'}
                      />
                    </div>
                  </div>
                </div>

                {/* GitHub direct repo button */}
                <a
                  href={proj.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-github-btn"
                  aria-label={`View ${proj.title} on GitHub`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github size={18} strokeWidth={2.2} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </AnimatedContent>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {selectedProject && (
        <div
          className={`apple-modal-overlay ${isClosing ? 'is-closing' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-project-title"
          onClick={() => {
            if (!isClosing) handleCloseModal()
          }}
        >
          <AnimatedContent
            distance={24}
            direction="vertical"
            scale={0.93}
            duration={0.36}
            ease="power3.out"
            scrollTrigger={false}
            active={!isClosing}
            disappearDuration={0.26}
            disappearEase="power3.in"
            className="apple-modal-animated-wrap"
            onDisappearanceComplete={finishClosing}
          >
            <div className="apple-modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="apple-modal-header">
                <div className="modal-header-meta">
                  <span className="modal-badge">{selectedProject.eyebrow}</span>
                  <h3 id="modal-project-title" className="modal-title">
                    {selectedProject.title}
                  </h3>
                  <p className="modal-headline-sub">{selectedProject.headline}</p>
                </div>
                <button
                  type="button"
                  className="apple-modal-close-btn"
                  onClick={handleCloseModal}
                  aria-label="Close dialog"
                >
                  <X size={20} strokeWidth={2.2} />
                </button>
              </div>

              <div className="apple-modal-body" data-lenis-prevent="true">
                <AnimatedContent distance={14} delay={0.06} scrollTrigger={false}>
                  <div className="modal-tech-stack" aria-label="Technologies used">
                    <div className="modal-chips-row">
                      {selectedProject.tags.map((t) => (
                        <span key={t} className="modal-tech-chip">{t}</span>
                      ))}
                    </div>
                  </div>
                </AnimatedContent>

                <AnimatedContent distance={18} delay={0.12} scrollTrigger={false}>
                  <div className="modal-dossier-grid">
                    <div className="modal-dossier-card card-problem">
                      <div className="dossier-card-title">
                        <h4>The Problem Solved</h4>
                      </div>
                      <p className="dossier-body-text">{selectedProject.problem}</p>
                    </div>
                    <div className="modal-dossier-card card-users">
                      <div className="dossier-card-title">
                        <h4>Intended Users & Stakeholders</h4>
                      </div>
                      <p className="dossier-body-text">{selectedProject.users}</p>
                    </div>
                  </div>
                </AnimatedContent>

                <AnimatedContent distance={18} delay={0.18} scrollTrigger={false}>
                  <div className="modal-highlights-card">
                    <div className="dossier-card-title">
                      <h4>Key Engineering Highlights</h4>
                    </div>
                    <ul className="modal-highlights-list">
                      {selectedProject.highlights.map((highlight, i) => (
                        <li key={i} className="highlight-item">
                          <span className="highlight-bullet" aria-hidden="true">—</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedContent>

                <AnimatedContent distance={14} delay={0.24} scrollTrigger={false}>
                  <div className="apple-modal-footer">
                    <a
                      href={selectedProject.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="modal-primary-btn"
                      aria-label={`View ${selectedProject.title} source code on GitHub`}
                    >
                      <Github size={17} />
                      <span>View on GitHub</span>
                      <ExternalLink size={14} className="btn-external-icon" />
                    </a>

                  </div>
                </AnimatedContent>
              </div>
            </div>
          </AnimatedContent>
        </div>
      )}
    </section>
  )
}
