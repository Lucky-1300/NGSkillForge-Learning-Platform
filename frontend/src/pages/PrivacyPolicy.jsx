import { FiCalendar, FiCheckCircle, FiLock, FiShield } from 'react-icons/fi'
import './CompanyPages.css'

const sections = [
  { id: 'introduction', label: '1. Introduction & Scope' },
  { id: 'collection', label: '2. Information We Collect' },
  { id: 'usage', label: '3. How We Use Information' },
  { id: 'analytics', label: '4. Learning Analytics & Progress' },
  { id: 'sharing', label: '5. Information Sharing & Third Parties' },
  { id: 'security', label: '6. Data Security & Storage' },
  { id: 'rights', label: '7. Your Rights (GDPR & CCPA)' },
  { id: 'cookies', label: '8. Cookies & Tracking Technologies' },
  { id: 'contact-privacy', label: '9. Contact Data Protection' },
]

export default function PrivacyPolicy() {
  return (
    <div className="privacy-page">
      <div className="container">
        <div className="legal-layout">
          {/* Quick Table of Contents Sidebar */}
          <aside className="legal-sidebar">
            <h3>Table of Contents</h3>
            <nav className="legal-nav">
              {sections.map((sec) => (
                <a href={`#${sec.id}`} key={sec.id}>
                  {sec.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Legal Document Content */}
          <article className="legal-content">
            <div className="legal-header-block">
              <h1>Privacy Policy</h1>
              <p className="legal-subtitle">
                At NGSkillForge, we take your trust seriously. This policy describes
                how we collect, use, safeguard, and manage your personal data when
                you use our platform, courses, and interactive tools.
              </p>
              <div className="legal-meta-badge">
                <FiCalendar /> Effective Date: January 1, 2026 • Last Reviewed: February 2026
              </div>
            </div>

            <section id="introduction" className="legal-section">
              <h2>1. Introduction &amp; Scope</h2>
              <p>
                NGSkillForge ("we", "us", "our", or "Platform") operates the online learning
                hub located at skillforge.dev and associated APIs. This Privacy Policy
                outlines the practices applicable to all learners, educators, enterprise
                clients, and visitors interacting with our software and services.
              </p>
              <p>
                By creating an account, enrolling in courses, submitting assignments, or
                otherwise using our platform, you acknowledge that you have read and understood
                this Privacy Policy.
              </p>
            </section>

            <section id="collection" className="legal-section">
              <h2>2. Information We Collect</h2>
              <p>
                We collect personal information that you provide directly to us, as well as
                technical data collected automatically:
              </p>
              <ul>
                <li>
                  <strong>Account Information:</strong> Full name, email address, password hash,
                  profile avatar, and educational or professional preferences.
                </li>
                <li>
                  <strong>Course &amp; Academic Data:</strong> Enrolled courses, assignment
                  submissions, project repositories, quiz scores, and instructor feedback.
                </li>
                <li>
                  <strong>Authentication Logs:</strong> IP address, device type, browser
                  configuration, login timestamps, and session tokens.
                </li>
                <li>
                  <strong>Communications:</strong> Messages sent via support tickets, contact
                  forms, and discussion feedback.
                </li>
              </ul>
            </section>

            <section id="usage" className="legal-section">
              <h2>3. How We Use Information</h2>
              <p>We use the data we collect solely for legitimate educational and platform purposes:</p>
              <ul>
                <li>To authenticate user sessions and secure accounts with OTP verification.</li>
                <li>To deliver curriculum content, video streaming, and coding environments.</li>
                <li>To grade assignments, calculate course progress, and issue verified completion credentials.</li>
                <li>To provide technical support and respond to customer queries.</li>
                <li>To detect and prevent fraudulent access, abuse, and security vulnerabilities.</li>
              </ul>

              <div className="legal-callout">
                <p>
                  <strong>Our Promise:</strong> We never sell, rent, or monetize your personal
                  information or project code to third-party advertisers or data brokers.
                </p>
              </div>
            </section>

            <section id="analytics" className="legal-section">
              <h2>4. Learning Analytics &amp; Progress</h2>
              <p>
                To help learners identify skill gaps and provide actionable recommendations,
                our platform processes aggregated performance metrics such as time spent on
                modules and assignment submission completion rates.
              </p>
            </section>

            <section id="sharing" className="legal-section">
              <h2>5. Information Sharing &amp; Third Parties</h2>
              <p>
                We only share personal data with trusted third-party infrastructure providers
                who adhere to strict data security standards:
              </p>
              <ul>
                <li>
                  <strong>Cloud &amp; Database Infrastructure:</strong> Secure cloud storage
                  and MongoDB Atlas hosting located in certified data centers.
                </li>
                <li>
                  <strong>Transactional Email Services:</strong> Providers used to deliver OTP
                  codes, assignment notices, and password reset instructions.
                </li>
                <li>
                  <strong>Legal Compliance:</strong> When strictly required by law, subpoena,
                  or regulatory mandates.
                </li>
              </ul>
            </section>

            <section id="security" className="legal-section">
              <h2>6. Data Security &amp; Storage</h2>
              <p>
                We employ industry-standard administrative, physical, and technical safeguards
                designed to protect user information:
              </p>
              <ul>
                <li>End-to-end encryption in transit via TLS 1.3.</li>
                <li>Strong salted cryptographic hashing (bcrypt) for passwords.</li>
                <li>JWT-based stateless authentication with token expiration.</li>
                <li>Regular automated vulnerability scanning and database backups.</li>
              </ul>
            </section>

            <section id="rights" className="legal-section">
              <h2>7. Your Rights (GDPR &amp; CCPA)</h2>
              <p>
                Regardless of your geographic location, NGSkillForge grants all users fundamental
                rights regarding their personal information:
              </p>
              <ul>
                <li><strong>Right of Access:</strong> Request a complete export of your personal data.</li>
                <li><strong>Right of Rectification:</strong> Edit or correct profile information anytime.</li>
                <li><strong>Right of Erasure:</strong> Request permanent deletion of your account and associated records.</li>
                <li><strong>Right of Restriction:</strong> Opt out of non-essential email notifications.</li>
              </ul>
            </section>

            <section id="cookies" className="legal-section">
              <h2>8. Cookies &amp; Tracking Technologies</h2>
              <p>
                We use strictly necessary cookies and local storage items to maintain your
                login session, preserve dark/light theme preferences, and track active course states.
                We do not use intrusive third-party cross-site ad trackers.
              </p>
            </section>

            <section id="contact-privacy" className="legal-section">
              <h2>9. Contact Data Protection</h2>
              <p>
                For questions regarding this policy, or to exercise your privacy and data
                rights, please contact our Data Protection Team:
              </p>
              <div className="legal-callout">
                <p>
                  <strong>Email:</strong> privacy@ngskillforge.com<br />
                  <strong>Address:</strong> Data Protection Officer, NGSkillForge Learning Inc.,
                  500 Howard St, San Francisco, CA 94105
                </p>
              </div>
            </section>
          </article>
        </div>
      </div>
    </div>
  )
}
