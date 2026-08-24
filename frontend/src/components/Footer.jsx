import { Link } from 'react-router-dom'
import { FiBookOpen } from 'react-icons/fi'

const footerGroups = [
  {
    title: 'Platform',
    links: [
      ['Home', '/'],
      ['Courses', '/courses'],
      ['My Learning', '/enrollments'],
      ['Assignments', '/assignments'],
    ],
  },
  {
    title: 'Resources',
    links: [
      ['Practice Library', '/assignments'],
      ['Projects', '/courses'],
      ['Learning Resources', '/courses'],
      ['FAQs', '/courses'],
      ['Help & Support', '/courses'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About NGSkillForge', '/'],
      ['Contact', '/'],
      ['Privacy Policy', '/'],
      ['Terms', '/'],
    ],
  },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <div className="footer-intro">
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark">
              <FiBookOpen />
            </span>
            NGSkillForge
          </Link>
          <p>
            Learn practical skills through focused courses, hands-on assignments,
            and real projects.
          </p>
        </div>
        <div className="footer-links">
          {footerGroups.map((group) => (
            <div className="footer-group" key={group.title}>
              <h3>{group.title}</h3>
              {group.links.map(([label, path]) => (
                <Link to={path} key={label}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 NGSkillForge. All rights reserved.</span>
        <span>Learn. Practice. Build.</span>
      </div>
    </footer>
  )
}
