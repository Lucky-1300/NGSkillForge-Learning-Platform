import { Link } from 'react-router-dom'
import {
  FiArrowRight,
  FiAward,
  FiCheckCircle,
  FiCode,
  FiCpu,
  FiGlobe,
  FiLayers,
  FiTarget,
  FiUsers,
  FiXCircle,
  FiZap,
} from 'react-icons/fi'
import './CompanyPages.css'

const stats = [
  { number: '25,000+', label: 'Active Learners', sub: 'Across 40+ countries' },
  { number: '150+', label: 'Hands-on Labs', sub: 'Real-world coding exercises' },
  { number: '94%', label: 'Career Outcomes', sub: 'Landed jobs or promotions' },
  { number: '50+', label: 'Industry Mentors', sub: 'Leading engineers & creators' },
]

const values = [
  {
    icon: <FiTarget />,
    title: 'Project-First Learning',
    description:
      'We believe the best way to master software engineering is by building real, deployable applications from day one.',
  },
  {
    icon: <FiCpu />,
    title: 'Modern Tech Stack',
    description:
      'Our curriculum is updated continuously to match current industry demands: React, Node.js, Cloud, Docker, and AI engineering.',
  },
  {
    icon: <FiUsers />,
    title: 'Active Mentorship',
    description:
      'Code reviews and structured assignment feedback give you actionable advice to refine your coding techniques.',
  },
  {
    icon: <FiAward />,
    title: 'Verified Competence',
    description:
      'Earn recognized skill badges and certificates based on reviewed assignments rather than passive video completions.',
  },
]

const team = [
  {
    name: 'Maya Okafor',
    role: 'Head of Curriculum & Frontend Lead',
    bio: 'Ex-Senior Frontend Architect with 10+ years crafting scalable web applications and developer tools.',
    avatarText: 'MO',
  },
  {
    name: 'Daniel Mensah',
    role: 'Lead Systems Engineer',
    bio: 'Distributed systems engineer passionate about cloud architecture, microservices, and database optimization.',
    avatarText: 'DM',
  },
  {
    name: 'Aisha Bello',
    role: 'Full Stack & DevOps Specialist',
    bio: 'Open source contributor and developer advocate dedicated to hands-on, practical engineering education.',
    avatarText: 'AB',
  },
]

export default function About() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="company-hero">
        <div className="container">
          <div className="company-hero-content">
            <span className="company-hero-badge">
              <FiZap /> About NGSkillForge
            </span>
            <h1>Forging the Next Generation of Tech Leaders & Builders</h1>
            <p>
              NGSkillForge was founded with a single mission: to replace passive,
              theory-heavy video tutorials with interactive, project-driven learning
              that prepares engineers for real-world software development.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <div className="container">
        <div className="about-stats-grid">
          {stats.map((stat, idx) => (
            <div className="about-stat-card" key={idx}>
              <div className="about-stat-number">{stat.number}</div>
              <div className="about-stat-label">{stat.label}</div>
              <div className="about-stat-sub">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Mission & Values Grid */}
        <div className="mission-grid">
          <div className="mission-text">
            <span className="eyebrow">Our Philosophy</span>
            <h2>Bridging the gap between theory and real code.</h2>
            <p>
              Traditional online education often leaves learners in "tutorial hell" —
              watching hours of lectures without gaining the confidence to start a
              project from scratch or troubleshoot production bugs.
            </p>
            <p>
              At NGSkillForge, every single lesson is anchored around practical
              milestones. You will write code, solve unit test suites, submit work
              for review, and build full-scale applications worthy of top-tier
              portfolios.
            </p>
            <div style={{ marginTop: '24px' }}>
              <Link to="/courses" className="btn btn-primary">
                Explore Our Courses <FiArrowRight />
              </Link>
            </div>
          </div>

          <div className="mission-cards">
            {values.map((v, i) => (
              <div className="value-card" key={i}>
                <div className="value-icon-box">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why NGSkillForge / Comparison Section */}
        <div className="why-us-section">
          <div className="section-heading" style={{ margin: '0 auto', textAlign: 'center' }}>
            <span className="eyebrow">The NGSkillForge Difference</span>
            <h2>Why learners choose our platform</h2>
            <p className="muted" style={{ margin: '0 auto' }}>
              Compare how our apprenticeship-style learning stacks up against
              conventional online platforms.
            </p>
          </div>

          <div className="why-grid">
            <div className="why-column">
              <span className="why-badge traditional">Traditional Platforms</span>
              <ul className="why-list">
                <li className="con">
                  <FiXCircle /> Passive video watching with no real practice
                </li>
                <li className="con">
                  <FiXCircle /> Toy examples that ignore edge cases and architecture
                </li>
                <li className="con">
                  <FiXCircle /> Outdated curriculum using superseded library versions
                </li>
                <li className="con">
                  <FiXCircle /> Zero instructor feedback or assignment evaluation
                </li>
              </ul>
            </div>

            <div className="why-column highlight">
              <span className="why-badge ngskillforge">NGSkillForge Way</span>
              <ul className="why-list">
                <li className="pro">
                  <FiCheckCircle /> Project-driven modules with runnable assignments
                </li>
                <li className="pro">
                  <FiCheckCircle /> Production-grade patterns, CI/CD, and clean code
                </li>
                <li className="pro">
                  <FiCheckCircle /> Constantly updated stacks matching tech job markets
                </li>
                <li className="pro">
                  <FiCheckCircle /> Direct mentor feedback and verified milestone badges
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructors / Leadership Team */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-heading">
            <span className="eyebrow">Our Team</span>
            <h2>Guided by industry practitioners</h2>
            <p className="muted">
              Learn from engineers and architects who build production software daily.
            </p>
          </div>

          <div className="team-grid">
            {team.map((member, i) => (
              <div className="team-card" key={i}>
                <div className="team-avatar">{member.avatarText}</div>
                <h3>{member.name}</h3>
                <span className="team-role">{member.role}</span>
                <p className="team-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Banner */}
        <div className="continue-panel" style={{ marginBottom: '80px' }}>
          <div>
            <span className="eyebrow">Start your journey</span>
            <h2>Ready to transform your tech career?</h2>
            <p>
              Join thousands of developers leveling up their skills with NGSkillForge today.
            </p>
          </div>
          <div className="continue-actions">
            <Link className="btn btn-primary" to="/register">
              Get Started Free <FiArrowRight />
            </Link>
            <Link className="btn btn-secondary" to="/courses">
              View Catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
