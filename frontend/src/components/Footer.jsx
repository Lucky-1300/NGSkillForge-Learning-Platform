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
      ['FAQs', '/contact'],
      ['Help & Support', '/contact'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About NGSkillForge', '/about'],
      ['Contact', '/contact'],
      ['Privacy Policy', '/privacy'],
      ['Terms', '/terms'],
    ],
  },
]

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }

  return (
    <footer className="footer">
      <div className="container footer-main">
        <div className="footer-intro">
          <Link className="brand footer-brand" to="/" onClick={scrollToTop}>
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
                <Link to={path} key={label} onClick={scrollToTop}>
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
