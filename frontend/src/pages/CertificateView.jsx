import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiAward, FiDownload, FiCheckCircle, FiShield, FiArrowLeft, FiShare2, FiExternalLink } from 'react-icons/fi'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'

export default function CertificateView() {
  const { certificateId } = useParams()
  const [cert, setCert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!certificateId) return
    setLoading(true)
    api
      .get(`/certificates/${certificateId}`)
      .then(({ data }) => {
        if (data?.success) {
          setCert(data.certificate)
        } else {
          setError(data?.message || 'Certificate not found.')
        }
      })
      .catch((err) => setError(messageFrom(err)))
      .finally(() => setLoading(false))
  }, [certificateId])

  const handleCopyLink = () => {
    const url = `${window.location.origin}/verify-certificate?id=${cert?.certificateId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <Loader />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading verified certificate...</p>
      </div>
    )
  }

  if (error || !cert) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', maxWidth: '600px' }}>
        <div className="status error" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Certificate Not Found</h2>
          <p style={{ marginTop: '0.5rem' }}>{error || 'Unable to locate certificate record.'}</p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/dashboard" className="btn btn-primary">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formattedDate = new Date(cert.completionDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="certificate-view-page" style={{ padding: '2rem 1rem 4rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Top Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <Link to="/dashboard" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiArrowLeft /> Back to Dashboard
          </Link>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleCopyLink}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiShare2 /> {copied ? 'Link Copied!' : 'Share Verification Link'}
            </button>
            <a
              href={`/api/certificates/${cert.certificateId}/download`}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiDownload /> Download Certificate PDF
            </a>
          </div>
        </div>

        {/* Certificate Display Canvas */}
        <div
          className="certificate-frame"
          style={{
            background: 'linear-gradient(145deg, #0B0F19 0%, #111827 100%)',
            border: '8px solid #1E293B',
            borderRadius: '16px',
            padding: '2.5rem',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(59, 130, 246, 0.15)',
            color: '#FFFFFF',
            textAlign: 'center',
          }}
        >
          {/* Inner Golden Border */}
          <div
            style={{
              border: '2px solid rgba(245, 158, 11, 0.6)',
              borderRadius: '8px',
              padding: '3rem 2rem',
              position: 'relative',
            }}
          >
            {/* Header Brand */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                }}
              >
                <FiAward />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '2px', color: '#60A5FA' }}>
                NGSKILLFORGE
              </span>
            </div>

            {/* Certificate Title */}
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                letterSpacing: '3px',
                color: '#FFFFFF',
                textTransform: 'uppercase',
                margin: '0.5rem 0 0',
              }}
            >
              Certificate of Completion
            </h1>

            <div style={{ fontSize: '0.95rem', letterSpacing: '2px', color: '#94A3B8', marginTop: '1.5rem', textTransform: 'uppercase' }}>
              This is to proudly certify that
            </div>

            {/* Student Name */}
            <div
              style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                color: '#38BDF8',
                margin: '1.25rem 0 0.5rem',
                textTransform: 'capitalize',
                textShadow: '0 2px 10px rgba(56, 189, 248, 0.3)',
              }}
            >
              {cert.studentName}
            </div>

            <div style={{ width: '180px', height: '2px', background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)', margin: '0 auto 1.5rem' }} />

            <div style={{ fontSize: '1rem', color: '#CBD5E1', maxWidth: '550px', margin: '0 auto 1rem', lineHeight: '1.6' }}>
              has successfully completed all lectures, curriculum requirements, and passed the final assessment for
            </div>

            {/* Course Title */}
            <div
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                color: '#FBBF24',
                marginBottom: '1.5rem',
              }}
            >
              {cert.courseName}
            </div>

            {/* Score & Status Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '6px 18px', borderRadius: '30px', color: '#34D399', fontWeight: 700, fontSize: '0.95rem', marginBottom: '2.5rem' }}>
              <FiCheckCircle /> Assessment Score: {cert.assessmentScore}% • Verified Passing
            </div>

            {/* Certificate Metadata Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '2rem',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '1px' }}>Date of Completion</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>{formattedDate}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '1px' }}>Issuing Authority</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#60A5FA', marginTop: '4px' }}>NGSkillForge Academic Board</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '1px' }}>Certificate ID</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'monospace', color: '#FBBF24', marginTop: '4px' }}>{cert.certificateId}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Link Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <span>To verify this certificate, visit </span>
          <Link to={`/verify-certificate?id=${cert.certificateId}`} style={{ color: '#60A5FA', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            verify-certificate <FiExternalLink />
          </Link>
        </div>
      </div>
    </div>
  )
}
