import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useAuth } from '../context/authContext.js'
import { messageFrom } from '../services/api.js'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const submit = async (e) => {
    e.preventDefault()
    try {
      const data = await login(form)
      toast.success(data.message || 'Welcome back')
      navigate(
        location.state?.from ||
          (data.user?.role === 'admin' ? '/admin' : '/')
      )
    } catch (err) {
      toast.error(messageFrom(err))
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your learning journey."
    >
      <form className="auth-form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input
              id="password"
              type={show ? 'text' : 'password'}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="muted" style={{ textAlign: 'center', fontSize: '13.5px' }}>
          New to NGSkillForge?{' '}
          <Link className="auth-link" to="/register">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-layout">
      <div className="auth-visual">
        <span className="eyebrow">NGSkillForge learning platform</span>
        <h1>Build skills that travel with you.</h1>
        <p>
          Focused courses and practical work for the next version of your
          career.
        </p>
      </div>
      <div className="auth-form-side">
        <div className="auth-card">
          <span className="eyebrow">Your learning space</span>
          <h2>{title}</h2>
          <p className="muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

export { AuthLayout }
