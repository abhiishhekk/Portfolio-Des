import { ExternalLink } from 'lucide-react'
import FadeContent from './FadeContent'
import TiltCard from './TiltCard'
import BlurText from './BlurText'
import DecayCard from './DecayCard'
import ChromaGrid from './ChromaGrid'

import urbanResolveImg from '../assets/UrbanResolve.webp'
import teamSyncImg from '../assets/TeamSync.webp'
import plantDiseaseImg from '../assets/PlantDiseaseDetection.webp'
import codePulseImg from '../assets/CodePulse.webp'
import procTraceImg from '../assets/ProcTrace.webp'
import truckDriverImg from '../assets/TruckDriver.webp'

const PROJECTS = [
  {
    id: 1,
    title: 'UrbanResolve',
    description:
      'An urban issue resolution and complaint tracking platform empowering citizens to report, track, and resolve municipal problems with structured authority management.',
    link: 'https://github.com/abhiishhekk/Complaint_Tracking_System',
    tags: ['React', 'Node.js', 'Express', 'MongoDB', 'REST API'],
    image: urbanResolveImg,
  },
  {
    id: 2,
    title: 'TeamSync',
    description:
      'A collaborative team management and task coordination platform built to help teams synchronize workflows, manage project tasks, and communicate in real time.',
    link: 'https://team-management-and-collaboration-client.onrender.com',
    tags: ['React', 'Node.js', 'MongoDB', 'Express', 'JWT'],
    image: teamSyncImg,
  },
  {
    id: 3,
    title: 'Plant Disease Detection',
    description:
      'An AI agricultural advisor (KrishiMitra) pairing a quantized ResNet50 vision engine with Google Gemini RAG for real-time leaf disease diagnosis and multilingual crop treatment.',
    link: 'https://github.com/abhiishhekk/Plant-disease-detection',
    tags: ['React', 'FastAPI', 'LiteRT / TFLite', 'ResNet50', 'Gemini AI', 'MongoDB'],
    image: plantDiseaseImg,
  },
  {
    id: 4,
    title: 'CodePulse',
    description:
      'A full-stack web application that visualizes LeetCode user statistics and submission progress, helping competitive programmers analyze patterns and track their algorithmic journey.',
    link: 'https://github.com/abhiishhekk/CodePulse',
    tags: ['React', 'Node.js', 'Express', 'LeetCode API'],
    image: codePulseImg,
  },
  {
    id: 5,
    title: 'ProcTrace',
    description:
      'A high-performance live process telemetry dashboard powered by a multithreaded C process monitor, layered Express backend poller, and interactive real-time React analytics.',
    link: 'https://github.com/abhiishhekk/ProcTrace',
    tags: ['C', 'Multithreading', 'Linux', 'Node.js', 'Express', 'React'],
    image: procTraceImg,
  },
  {
    id: 6,
    title: 'Truck Driver Music',
    description:
      'A web app that plays curated truck driver music from YouTube playlists using the YouTube Data API, featuring a live active visitor counter powered by Firebase Realtime Database.',
    link: 'https://github.com/abhiishhekk/TruckDriverMusic',
    tags: ['React', 'YouTube API', 'Firebase', 'Realtime DB', 'JavaScript'],
    image: truckDriverImg,
  },
]

export default function Projects() {
  return (
    <section id="projects" aria-label="Projects section">
      <div className="container">
        <div className="divider" style={{ marginBottom: '100px' }} />

        <div className="section-header-center">
          <FadeContent delay={0}>
            <span className="section-label">Projects</span>
          </FadeContent>

          <FadeContent delay={0.1}>
            <BlurText
              text="Projects I've Worked On"
              tag="h2"
              className="section-title"
              style={{ justifyContent: 'center' }}
              duration={0.5}
              delay={60}
            />
          </FadeContent>

          <FadeContent delay={0.2}>
            <p className="section-desc">
              A selection of personal and academic projects — from full-stack web apps to
              competitive programming tools.
            </p>
          </FadeContent>
        </div>

        <ChromaGrid radius={350} damping={0.45} fadeOut={0.6}>
          <div className="projects-grid">
            {PROJECTS.map((project, i) => (
              <FadeContent key={project.id} delay={0.1 + i * 0.08}>
                <TiltCard intensity={6}>
                  <article
                    className="project-card"
                    id={`project-${project.id}`}
                    onClick={() => window.open(project.link, '_blank', 'noopener,noreferrer')}
                    role="link"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        window.open(project.link, '_blank', 'noopener,noreferrer')
                      }
                    }}
                    aria-label={`Open ${project.title} on GitHub`}
                  >
                    <div className="project-card-img">
                      <DecayCard
                        id={project.id}
                        image={project.image}
                        alt={project.title}
                        maxDisplacement={70}
                        movementBound={16}
                      />
                    </div>

                    <div className="project-card-body">
                      <div className="project-card-header">
                        <h3 className="project-card-title">
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-card-title-link"
                            onClick={e => {
                              e.stopPropagation()
                              window.open(project.link, '_blank', 'noopener,noreferrer')
                            }}
                          >
                            {project.title}
                          </a>
                        </h3>
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-card-link-icon"
                          aria-label={`Open ${project.title} GitHub repository in new tab`}
                          title={`Open ${project.title} on GitHub`}
                          onClick={e => {
                            e.stopPropagation()
                            window.open(project.link, '_blank', 'noopener,noreferrer')
                          }}
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>

                      <p className="project-card-desc">{project.description}</p>

                      <div className="project-card-tags">
                        {project.tags.map(tag => (
                          <span className="project-tag" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                </TiltCard>
              </FadeContent>
            ))}
          </div>
        </ChromaGrid>
      </div>
    </section>
  )
}
