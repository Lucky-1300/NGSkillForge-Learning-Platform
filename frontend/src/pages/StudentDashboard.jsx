import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiBookOpen,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiPlay,
  FiArrowRight,
  FiDownload,
  FiShield,
  FiActivity,
  FiTarget,
} from 'react-icons/fi'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import { thumbnailForCourse } from '../assets/courseThumbnails.js'

export default function StudentDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const res = await api.get('/student/dashboard')
      if (res.data?.success) {
        setData(res.data)
      } else {
        setError(res.data?.message || 'Failed to load dashboard.')
      }
    } catch (err) {
      setError(messageFrom(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <Loader />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading your learning dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '4rem 1rem' }}>
        <div className="status error">{error}</div>
      </div>
    )
  }

  const { user, overview, inProgressCourses = [], completedCourses = [], certificates = [], achievements = [], recentActivity = [] } = data || {}

  return (
    <div className="student-dashboard-page">
      {/* Hero Welcome Header */}
      <header className="learning-header" style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
        <div className="container learning-header-inner">
          <div>
            <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <FiTarget /> Student Learning Portal
            </span>
            <h1 style={{ fontSize: '2.25rem', marginTop: '0.25rem', color: 'var(--text-heading)' }}>
              Welcome back, {user?.name || 'Student'}! 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px' }}>
              Track your course progression, master technical skills, earn verified certificates, and unlock achievements.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/courses" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiBookOpen /> Browse Courses
            </Link>
            <Link to="/dashboard/certificates" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiAward /> My Certificates ({overview?.certificatesEarnedCount || 0})
            </Link>
          </div>
        </div>
      </header>

      <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
        {/* Metric Overview Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              <FiBookOpen />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{overview?.enrolledCoursesCount || 0}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Courses Enrolled</div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid var(--warning)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-subtle)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              <FiClock />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{overview?.inProgressCoursesCount || 0}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>In Progress</div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid var(--success)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-subtle)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              <FiCheckCircle />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{overview?.completedCoursesCount || 0}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed Courses</div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              <FiAward />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{overview?.certificatesEarnedCount || 0}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Certificates Earned</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'overview' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Learning Overview
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'achievements' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === 'achievements' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            Achievements 🏆
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'activity' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === 'activity' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Recent Activity
          </button>
        </div>

        {/* Tab 1: Learning Overview */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* CONTINUE LEARNING SECTION */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <FiPlay style={{ color: '#3B82F6' }} /> Continue Learning
                </h2>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {inProgressCourses.length} {inProgressCourses.length === 1 ? 'course' : 'courses'} in progress
                </span>
              </div>

              {inProgressCourses.length === 0 ? (
                <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎉</div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No courses currently in progress</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    You have completed all enrolled courses, or haven't started a new course yet!
                  </p>
                  <Link to="/courses" className="btn btn-primary">
                    Explore New Courses
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {inProgressCourses.map((c) => (
                    <div className="card" key={c.courseId} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ position: 'relative', height: '160px', overflow: 'hidden', background: '#0F172A' }}>
                          <img
                            src={thumbnailForCourse(c)}
                            alt={c.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              background: 'rgba(15, 23, 42, 0.85)',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#60A5FA',
                            }}
                          >
                            {c.category || 'Technology'}
                          </span>
                        </div>

                        <div style={{ padding: '1.25rem' }}>
                          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', lineHeight: '1.4' }}>{c.title}</h3>

                          {/* Progress Bar */}
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                              <span>
                                {c.completedLectures} / {c.totalLectures} lectures
                              </span>
                              <strong style={{ color: 'var(--text-primary)' }}>{c.progressPercent}%</strong>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--surface-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${c.progressPercent}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)',
                                  borderRadius: '4px',
                                  transition: 'width 0.3s ease',
                                }}
                              />
                            </div>
                          </div>

                          {/* Last accessed / next lecture */}
                          {c.continueLecture && (
                            <div
                              style={{
                                padding: '0.75rem',
                                background: 'var(--surface-subtle)',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                marginBottom: '1rem',
                              }}
                            >
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2px' }}>
                                Next Step:
                              </div>
                              <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                #{c.continueLecture.lectureNumber}: {c.continueLecture.title}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ padding: '0 1.25rem 1.25rem' }}>
                        <Link
                          to={c.continueUrl}
                          className="btn btn-primary"
                          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                          <FiPlay /> Continue Learning
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* COMPLETED COURSES SECTION */}
            {completedCourses.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <FiCheckCircle style={{ color: '#10B981' }} /> Completed Courses
                  </h2>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {completedCourses.length} {completedCourses.length === 1 ? 'course' : 'courses'} completed
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {completedCourses.map((c) => (
                    <div className="card" key={c.courseId} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #10B981' }}>
                      <div style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span
                            style={{
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#10B981',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            ✓ Completed
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Score: <strong style={{ color: '#10B981' }}>{c.assessmentScore}%</strong>
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>{c.title}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                          Completed on {new Date(c.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>

                        {c.certificateId && (
                          <div style={{ background: 'var(--surface-subtle)', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Certificate ID:</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#F59E0B' }}>{c.certificateId}</span>
                          </div>
                        )}
                      </div>

                      <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', gap: '0.75rem' }}>
                        {c.certificateUrl ? (
                          <>
                            <Link
                              to={c.certificateUrl}
                              className="btn btn-primary"
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
                            >
                              <FiAward /> View Certificate
                            </Link>
                            <a
                              href={`/api/certificates/${c.certificateId}/download`}
                              className="btn btn-secondary"
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem 0.8rem' }}
                              title="Download PDF"
                            >
                              <FiDownload />
                            </a>
                          </>
                        ) : (
                          <Link
                            to={`/courses/${c.courseId}/assessment`}
                            className="btn btn-secondary"
                            style={{ width: '100%', textAlign: 'center' }}
                          >
                            Claim Certificate
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Tab 2: Achievements */}
        {activeTab === 'achievements' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FiAward style={{ color: '#F59E0B' }} /> Learning Achievements
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Milestones earned through your active study, lecture completions, and assessment excellence.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {achievements.map((ach) => (
                <div
                  key={ach.key}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: ach.isEarned ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    opacity: ach.isEarned ? 1 : 0.65,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '2.25rem' }}>{ach.icon}</span>
                      {ach.isEarned ? (
                        <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                          🏆 Earned
                        </span>
                      ) : (
                        <span style={{ background: 'var(--surface-subtle)', color: 'var(--text-muted)', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                          🔒 Locked
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: ach.isEarned ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {ach.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {ach.description}
                    </p>
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {ach.isEarned ? (
                      <span style={{ color: '#F59E0B' }}>
                        Earned on {new Date(ach.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    ) : (
                      <span>Complete requirements to unlock</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Recent Activity */}
        {activeTab === 'activity' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FiActivity style={{ color: '#10B981' }} /> Recent Activity Log
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Real-time chronological events recorded across your learning milestones.
              </p>
            </div>

            {recentActivity.length === 0 ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No recent activity recorded yet. Start a lecture to see your progress here!
              </div>
            ) : (
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recentActivity.map((act, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        paddingBottom: idx !== recentActivity.length - 1 ? '1rem' : '0',
                        borderBottom: idx !== recentActivity.length - 1 ? '1px solid var(--border-color)' : 'none',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: act.badgeColor === 'golden' ? 'rgba(245, 158, 11, 0.15)' : act.badgeColor === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: act.badgeColor === 'golden' ? '#F59E0B' : act.badgeColor === 'success' ? '#10B981' : '#3B82F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          flexShrink: 0,
                        }}
                      >
                        {act.icon}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{act.title}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(act.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {act.subtitle}
                        </div>
                        {act.link && (
                          <Link to={act.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#60A5FA', marginTop: '4px' }}>
                            View Certificate <FiArrowRight />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
