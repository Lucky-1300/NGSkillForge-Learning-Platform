import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiAward, FiDownload, FiCheckCircle, FiExternalLink, FiShield, FiArrowLeft } from 'react-icons/fi'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import { thumbnailForCourse } from '../assets/courseThumbnails.js'

export default function StudentCertificates() {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/certificates/my')
      .then(({ data }) => {
        if (data?.success) {
          setCertificates(data.certificates || [])
        }
      })
      .catch((err) => setError(messageFrom(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="student-certificates-page">
      <header className="learning-header" style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
        <div className="container learning-header-inner">
          <div>
            <div style={{ marginBottom: '12px' }}>
              <Link to="/dashboard" className="nav-back-btn">
                <FiArrowLeft /> Back to Dashboard
              </Link>
            </div>
            <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <FiShield /> Verified Credentials
            </span>
            <h1 style={{ fontSize: '2.25rem', marginTop: '0.25rem', color: 'var(--text-heading)' }}>My Certificates</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px' }}>
              All verified certificates earned across your completed NGSkillForge courses.
            </p>
          </div>
          <div className="learning-header-mark">
            <FiAward style={{ color: '#F59E0B' }} />
            <span>{certificates.length} {certificates.length === 1 ? 'Certificate' : 'Certificates'} Earned</span>
          </div>
        </div>
      </header>

      <div className="container" style={{ padding: '2.5rem 1rem 4rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Loader />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading your certificates...</p>
          </div>
        ) : error ? (
          <div className="status error">{error}</div>
        ) : certificates.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Certificates Earned Yet</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Complete all required lectures and pass the final course assessment with a score of 70% or higher to earn your official certificate.
            </p>
            <Link to="/courses" className="btn btn-primary">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="card"
                style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: '4px solid #F59E0B',
                }}
              >
                <div>
                  <div style={{ position: 'relative', height: '160px', overflow: 'hidden', background: '#0F172A' }}>
                    <img
                      src={thumbnailForCourse(cert.courseDetails || { title: cert.courseName })}
                      alt={cert.courseName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(16, 185, 129, 0.9)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <FiCheckCircle /> Verified
                    </span>
                  </div>

                  <div style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>{cert.courseName}</h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      <span>Completed: {new Date(cert.completionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>Score: <strong style={{ color: '#10B981' }}>{cert.assessmentScore}%</strong></span>
                    </div>

                    <div
                      style={{
                        background: 'var(--surface-subtle)',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        fontSize: '0.8rem',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>Certificate ID:</span>
                      <strong style={{ fontFamily: 'monospace', color: '#F59E0B', fontSize: '0.95rem' }}>{cert.certificateId}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link
                      to={`/certificate/${cert.certificateId}`}
                      className="btn btn-primary"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
                    >
                      <FiAward /> View Certificate
                    </Link>
                    <a
                      href={`/api/certificates/${cert.certificateId}/download`}
                      className="btn btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem 0.8rem' }}
                      title="Download PDF"
                    >
                      <FiDownload />
                    </a>
                  </div>

                  <Link
                    to={`/verify-certificate?id=${cert.certificateId}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      padding: '0.25rem',
                      textAlign: 'center',
                    }}
                  >
                    <FiShield /> Public Verification Link <FiExternalLink />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
