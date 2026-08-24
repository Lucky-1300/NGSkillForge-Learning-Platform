import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api, { messageFrom } from '../services/api.js'
import { AuthLayout } from './Login.jsx'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const update = (key) => (event) =>
    setForm({ ...form, [key]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/send-otp', { email: form.email })
      toast.success(data.message || 'OTP sent')
      navigate('/verify-otp', { state: form })
    } catch (error) {
      toast.error(messageFrom(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start with a focused learning path."
    >
      <form className="auth-form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            required
            value={form.name}
            onChange={update('name')}
            placeholder="Your name"
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={update('email')}
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
              onChange={update('password')}
              placeholder="At least 6 characters"
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
          {loading ? 'Sending OTP...' : 'Continue with email'}
        </button>
        <p className="muted" style={{ textAlign: 'center', fontSize: '13.5px' }}>
          Already have an account?{' '}
          <Link className="auth-link" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
