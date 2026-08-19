import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { FiBookOpen, FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi'
import { useAuth } from '../context/authContext.js'

export default function Navbar() {
	const [open, setOpen] = useState(false)
	const { user, isAuthenticated, logout } = useAuth()
	const navigate = useNavigate()
	const close = () => setOpen(false)
	const handleLogout = async () => { await logout(); close(); navigate('/'); }
	return <header className={`navbar ${open ? 'open' : ''}`}><div className="container nav-inner">
		<Link className="brand" to="/" onClick={close}><span className="brand-mark"><FiBookOpen /></span>NGSkillForge</Link>
		<nav className="nav-links"><NavLink to="/" onClick={close}>Home</NavLink><NavLink to="/courses" onClick={close}>Courses</NavLink>{isAuthenticated && <><NavLink to="/enrollments" onClick={close}>My learning</NavLink><NavLink to="/assignments" onClick={close}>Assignments</NavLink></>}{user?.role === 'admin' && <NavLink to="/admin" onClick={close}>Admin</NavLink>}</nav>
		<div className="nav-actions">{isAuthenticated ? <><Link className="btn btn-secondary" to="/profile" onClick={close}><FiUser /> Profile</Link><button className="btn btn-primary" onClick={handleLogout}><FiLogOut /> Logout</button></> : <><Link className="btn btn-secondary" to="/login" onClick={close}>Login</Link><Link className="btn btn-primary" to="/register" onClick={close}>Get started</Link></>}</div>
		<button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <FiX /> : <FiMenu />}</button>
	</div></header>
}
