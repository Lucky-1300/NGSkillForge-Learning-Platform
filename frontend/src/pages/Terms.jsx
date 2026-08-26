import { FiCalendar, FiCheckSquare, FiFileText, FiShield } from 'react-icons/fi'
import './CompanyPages.css'

const termsSections = [
  { id: 'acceptance', label: '1. Acceptance of Terms' },
  { id: 'accounts', label: '2. User Accounts & Security' },
  { id: 'licensing', label: '3. Course Access & IP' },
  { id: 'integrity', label: '4. Academic Integrity & Submissions' },
  { id: 'conduct', label: '5. Prohibited Conduct' },
  { id: 'payments', label: '6. Pricing & Refund Policy' },
  { id: 'disclaimers', label: '7. Disclaimers & Warranties' },
  { id: 'liability', label: '8. Limitation of Liability' },
  { id: 'termination', label: '9. Account Termination' },
  { id: 'governing-law', label: '10. Governing Law & Contact' },
]

export default function Terms() {
  return (
    <div className="terms-page">
      <div className="container">
        <div className="legal-layout">
          {/* Quick Table of Contents Sidebar */}
          <aside className="legal-sidebar">
            <h3>Terms Navigation</h3>
            <nav className="legal-nav">
              {termsSections.map((sec) => (
                <a href={`#${sec.id}`} key={sec.id}>
                  {sec.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Legal Terms Content */}
          <article className="legal-content">
            <div className="legal-header-block">
              <h1>Terms of Service</h1>
              <p className="legal-subtitle">
                Please read these terms carefully before accessing or using NGSkillForge.
                These terms govern your access to and use of our platform, learning materials,
                and interactive coding services.
              </p>
              <div className="legal-meta-badge">
                <FiCalendar /> Effective Date: January 1, 2026 • Version 2.4
              </div>
            </div>

            <section id="acceptance" className="legal-section">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By registering an account, purchasing or enrolling in courses, or browsing
                NGSkillForge, you agree to be bound by these Terms of Service and all
                applicable laws. If you do not agree with any part of these terms, you must
                not use our services.
              </p>
            </section>

            <section id="accounts" className="legal-section">
              <h2>2. User Accounts &amp; Security</h2>
              <p>
                To access assignments, track progress, and submit projects, you must register
                for an account. You agree to:
              </p>
              <ul>
                <li>Provide accurate, current, and complete registration information.</li>
                <li>Maintain the confidentiality of your credentials and OTP verification codes.</li>
                <li>Promptly notify NGSkillForge of any unauthorized use or security breaches.</li>
                <li>Accept full responsibility for all activities occurring under your account.</li>
              </ul>
            </section>

            <section id="licensing" className="legal-section">
              <h2>3. Course Access &amp; Intellectual Property</h2>
              <p>
                Upon enrollment, NGSkillForge grants you a non-exclusive, non-transferable,
                revocable personal license to view course materials, watch lectures, and
                complete exercises.
              </p>
              <div className="legal-callout">
                <p>
                  <strong>Copyright Notice:</strong> All course videos, curriculum outlines,
                  starter repositories, tests, and documentation are the exclusive intellectual
                  property of NGSkillForge and its instructors. You may not re-upload, sell,
                  publicly stream, or redistribute course contents.
                </p>
              </div>
            </section>

            <section id="integrity" className="legal-section">
              <h2>4. Academic Integrity &amp; Student Submissions</h2>
              <p>
                We believe in genuine skill development. When submitting code for assignments
                and lab evaluations:
              </p>
              <ul>
                <li>All submitted work must be your own authentic effort.</li>
                <li>
                  You retain ownership of any original code, apps, or projects you build
                  during assignments.
                </li>
                <li>
                  Plagiarizing another learner's code or submitting verbatim copied solutions
                  may result in assignment invalidation or account suspension.
                </li>
              </ul>
            </section>

            <section id="conduct" className="legal-section">
              <h2>5. Prohibited Conduct</h2>
              <p>You agree not to engage in any of the following prohibited behaviors:</p>
              <ul>
                <li>Attempting to bypass platform security, rate limiters, or authentication mechanisms.</li>
                <li>Harassing, abusing, or spamming instructors, admins, or other students.</li>
                <li>Scraping, crawling, or downloading platform assets via automated scripts.</li>
                <li>Deploying malicious scripts or vulnerabilities within coding playground environments.</li>
              </ul>
            </section>

            <section id="payments" className="legal-section">
              <h2>6. Pricing &amp; Refund Policy</h2>
              <p>
                Course fees are clearly stated at checkout. We provide a <strong>14-day 100% money-back guarantee</strong>
                for paid courses if you have completed less than 30% of the course modules
                and are unsatisfied with the curriculum.
              </p>
            </section>

            <section id="disclaimers" className="legal-section">
              <h2>7. Disclaimers &amp; Warranties</h2>
              <p>
                NGSkillForge provides its educational platform "as is" and "as available".
                While we strive for 99.9% uptime and high accuracy in all course lessons, we
                do not warrant that the service will be entirely error-free or uninterrupted.
              </p>
            </section>

            <section id="liability" className="legal-section">
              <h2>8. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by applicable law, NGSkillForge and its
                officers, employees, and instructors shall not be liable for any indirect,
                incidental, special, or consequential damages resulting from your use of the
                platform.
              </p>
            </section>

            <section id="termination" className="legal-section">
              <h2>9. Account Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account with or without notice
                if you violate these Terms of Service or engage in malicious platform behavior.
                You may also close your account at any time from your profile settings or by
                contacting support.
              </p>
            </section>

            <section id="governing-law" className="legal-section">
              <h2>10. Governing Law &amp; Contact</h2>
              <p>
                These Terms shall be governed by the laws of the State of California, USA.
                If you have questions concerning these terms, please contact:
              </p>
              <div className="legal-callout">
                <p>
                  <strong>Legal Department:</strong> legal@ngskillforge.com<br />
                  <strong>NGSkillForge Learning Technologies, Inc.</strong><br />
                  500 Howard Street, Suite 400, San Francisco, CA 94105
                </p>
              </div>
            </section>
          </article>
        </div>
      </div>
    </div>
  )
}
