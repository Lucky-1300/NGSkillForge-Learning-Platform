import { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { FiBookOpen, FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi'
import { useAuth } from '../context/authContext.js'
import ThemeToggle from './ThemeToggle.jsx'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const close = () => setOpen(false)

  // Auto-close menu when route changes
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const handleLogout = async () => {
    await logout()
    close()
    navigate('/')
  }

  return (
    <>
      <header className={`navbar ${open ? 'open' : ''}`}>
        <div className="container nav-inner">
          <Link className="brand" to="/" onClick={close}>
            <span className="brand-mark">
              <FiBookOpen />
            </span>
            <span className="brand-name">NGSkillForge</span>
          </Link>

          <nav className="nav-links">
            <NavLink to="/" onClick={close} end>
              Home
            </NavLink>
            <NavLink to="/courses" onClick={close}>
              Courses
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/enrollments" onClick={close}>
                  My learning
                </NavLink>
                <NavLink to="/assignments" onClick={close}>
                  Assignments
                </NavLink>
              </>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin" onClick={close}>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="nav-actions">
            {/* Theme Toggle Button for Desktop & Expanded Mobile */}
            <ThemeToggle className="desktop-theme-toggle" />

            {isAuthenticated ? (
              <>
                <Link className="btn btn-secondary" to="/profile" onClick={close}>
                  <FiUser /> Profile
                </Link>
                <button className="btn btn-primary" onClick={handleLogout}>
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-secondary" to="/login" onClick={close}>
                  Login
                </Link>
                <Link className="btn btn-primary" to="/register" onClick={close}>
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Right Mobile Header Actions: Mobile Theme Toggle + Hamburger Menu */}
          <div className="mobile-header-actions">
            <ThemeToggle className="mobile-theme-toggle" />
            <button
              className="menu-toggle"
              aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop overlay for mobile menu drawer */}
      {open && <div className="nav-backdrop" onClick={close} aria-hidden="true" />}
    </>
  )
}
