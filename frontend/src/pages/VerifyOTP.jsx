import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api, { messageFrom } from '../services/api.js'
import { useAuth } from '../context/authContext.js'
import { AuthLayout } from './Login.jsx'

export default function VerifyOTP() {
  const location = useLocation()
  const navigate = useNavigate()
  const { register, loading } = useAuth()
  const [form, setForm] = useState({
    email: '',
    otp: '',
    name: '',
    password: '',
    ...location.state,
  })

  const update = (key) => (event) =>
    setForm({ ...form, [key]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    try {
      const verified = await api.post('/auth/verify-otp', {
        email: form.email,
        otp: form.otp,
      })
      toast.success(verified.data.message || 'OTP verified')
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      })
      toast.success('Account created')
      navigate('/')
    } catch (error) {
      toast.error(messageFrom(error))
    }
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="One last step before you start learning."
    >
      <form className="auth-form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="verify-email">Email address</label>
          <input
            id="verify-email"
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            placeholder="you@example.com"
          />
        </div>
        <div className="field">
          <label htmlFor="otp">Verification code</label>
          <input
            id="otp"
            inputMode="numeric"
            maxLength={6}
            required
            value={form.otp}
            onChange={update('otp')}
            placeholder="6-digit OTP"
          />
        </div>
        <div className="field">
          <label htmlFor="verify-name">Full name</label>
          <input
            id="verify-name"
            required
            value={form.name}
            onChange={update('name')}
            placeholder="Your name"
          />
        </div>
        <div className="field">
          <label htmlFor="verify-password">Password</label>
          <input
            id="verify-password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={update('password')}
            placeholder="At least 6 characters"
          />
        </div>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Verify and create account'}
        </button>
        <p className="muted" style={{ textAlign: 'center', fontSize: '13.5px' }}>
          <Link className="auth-link" to="/register">
            Back to registration
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
