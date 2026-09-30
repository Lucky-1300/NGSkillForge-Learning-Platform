import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { FiShield, FiCheckCircle, FiXCircle, FiSearch, FiAward, FiExternalLink, FiDownload } from 'react-icons/fi'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'

export default function VerifyCertificate() {
  const [searchParams] = useSearchParams()
  const [certIdInput, setCertIdInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async (idToVerify) => {
    const targetId = (idToVerify || certIdInput).trim()
    if (!targetId) return

    setLoading(true)
    setError('')
    setResult(null)
    setSearched(true)

    try {
      const res = await api.get(`/certificates/verify/${encodeURIComponent(targetId)}`)
      if (res.data?.success && res.data?.valid) {
        setResult(res.data.certificate)
      } else {
        setError(res.data?.message || 'Certificate Not Found.')
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('✗ Certificate Not Found. The specified Certificate ID does not exist in NGSkillForge records.')
      } else {
        setError(messageFrom(err))
      }
    } finally {
      setLoading(false)
    }
  }

  // Pre-fill and auto-verify if 'id' is in query parameters
  useEffect(() => {
    const idFromQuery = searchParams.get('id')
    if (idFromQuery) {
      setCertIdInput(idFromQuery)
      handleVerify(idFromQuery)
    }
  }, [searchParams])

  const handleSubmit = (e) => {
    e.preventDefault()
    handleVerify(certIdInput)
  }

  return (
    <div className="verify-certificate-page">
      <header className="learning-header" style={{ background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.9) 100%)' }}>
        <div className="container learning-header-inner">
          <div>
            <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiShield /> Public Verification Service
            </span>
            <h1 style={{ fontSize: '2.25rem', marginTop: '0.25rem' }}>Verify Certificate Authenticity</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px' }}>
              Instantly validate official NGSkillForge course completion certificates and student credentials.
            </p>
          </div>
          <div className="learning-header-mark">
            <FiShield style={{ color: '#34D399' }} />
            <span>Tamper-Proof Verification</span>
          </div>
        </div>
      </header>

      <div className="container" style={{ padding: '3rem 1rem 5rem', maxWidth: '750px' }}>
        {/* Verification Form Card */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              Enter Certificate ID
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. NGSF-JS-2026-A7K92X"
                  value={certIdInput}
                  onChange={(e) => setCertIdInput(e.target.value)}
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !certIdInput.trim()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', minWidth: '140px', justifyContent: 'center' }}
              >
                {loading ? <Loader /> : <><FiSearch /> Verify ID</>}
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
              Format: NGSF-[CourseCode]-[Year]-[UniqueCode]
            </p>
          </form>
        </div>

        {/* Verification Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Loader />
            <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Querying immutable registry records...</p>
          </div>
        )}

        {/* Successful Verification Result */}
        {!loading && searched && result && (
          <div
            className="card"
            style={{
              padding: '2.5rem',
              border: '2px solid #10B981',
              background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', paddingBottom: '1.25rem' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                }}
              >
                <FiCheckCircle />
              </div>
              <div>
                <span style={{ color: '#10B981', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  ✓ Official Record Verified
                </span>
                <h2 style={{ fontSize: '1.5rem', margin: '2px 0 0' }}>Certificate Authenticity Confirmed</h2>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recipient Student</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38BDF8', marginTop: '2px' }}>
                  {result.studentName}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed Course</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FBBF24', marginTop: '2px' }}>
                  {result.courseName}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completion Date</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {new Date(result.completionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assessment Score</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10B981', marginTop: '2px' }}>
                  {result.assessmentScore}% (Passed)
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Certificate Identification Code</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', color: '#60A5FA', marginTop: '2px' }}>
                  {result.certificateId}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.25rem' }}>
              <Link to={`/certificate/${result.certificateId}`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiAward /> View Official Certificate Page
              </Link>
              <a href={`/api/certificates/${result.certificateId}/download`} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiDownload /> Download Certificate PDF
              </a>
            </div>
          </div>
        )}

        {/* Failed Verification Result */}
        {!loading && searched && error && (
          <div
            className="card"
            style={{
              padding: '2.5rem',
              border: '2px solid #EF4444',
              background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                margin: '0 auto 1rem',
              }}
            >
              <FiXCircle />
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#EF4444', marginBottom: '0.5rem' }}>Certificate Not Found</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
              The certificate ID entered does not match any verified credentials in the NGSkillForge database. Please verify the ID for typos and try again.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
