import { Link } from 'react-router-dom'
import { FiBookOpen } from 'react-icons/fi'
export default function Footer() { return <footer className="footer"><div className="container footer-grid"><div><Link className="brand" to="/"><span className="brand-mark"><FiBookOpen /></span>NGSkillForge</Link><p>Practical learning experiences for people building what comes next.</p></div><p>© 2026 NGSkillForge. Learn with purpose.</p></div></footer> }
