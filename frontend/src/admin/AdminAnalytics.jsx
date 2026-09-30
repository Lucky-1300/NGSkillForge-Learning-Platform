import { useEffect, useState } from 'react'
import {
  FiUsers,
  FiBookOpen,
  FiAward,
  FiCheckCircle,
  FiTrendingUp,
  FiActivity,
  FiFilter,
  FiRefreshCw,
  FiAlertTriangle,
  FiCpu,
  FiArrowUpRight,
  FiHelpCircle,
  FiBarChart2,
} from 'react-icons/fi'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import { AdminSide } from './AdminDashboard.jsx'

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState('all')
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [sortField, setSortField] = useState('totalStudents')
  const [sortAsc, setSortAsc] = useState(false)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError('')
      const params = {}
      if (timeRange && timeRange !== 'all') params.timeRange = timeRange
      if (selectedCourse && selectedCourse !== 'all') params.courseId = selectedCourse

      const res = await api.get('/admin/analytics/overview', { params })
      if (res.data?.success) {
        setData(res.data)
      } else {
        setError(res.data?.message || 'Failed to fetch platform analytics.')
      }
    } catch (err) {
      setError(messageFrom(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange, selectedCourse])

  // Sorting logic for course performance table
  const sortedCourses = [...(data?.coursePerformance || [])].sort((a, b) => {
    let valA = a[sortField]
    let valB = b[sortField]
    if (valA === null || valA === undefined) valA = -1
    if (valB === null || valB === undefined) valB = -1

    if (typeof valA === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
    }
    return sortAsc ? valA - valB : valB - valA
  })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  const overview = data?.overview || {}
  const assessment = data?.assessmentAnalytics || {}
  const difficult = data?.difficultTopics || {}
  const engagement = data?.lectureEngagement || {}
  const certificateData = data?.certificateAnalytics || {}
  const aiData = data?.aiAnalytics || {}
  const recentActivity = data?.recentActivity || []
  const coursesDropdown = data?.coursesDropdown || []

  return (
    <div className="dashboard-layout">
      <AdminSide />
      <main className="dashboard-main" style={{ maxWidth: '1280px', padding: '1.5rem 2rem 4rem' }}>
        {/* Header & Filter Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#60A5FA' }}>
              <FiBarChart2 /> Platform Intelligence
            </span>
            <h1 style={{ fontSize: '2rem', margin: '4px 0 6px', fontWeight: 800 }}>Platform Analytics & Insights</h1>
            <p className="muted" style={{ margin: 0, fontSize: '0.95rem' }}>
              Real-time data telemetry covering student engagement, completion rates, assessment mastery, and certifications.
            </p>
          </div>

          {/* Controls / Filter Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-color)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <FiFilter style={{ color: 'var(--text-muted)' }} />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-color)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <FiBookOpen style={{ color: 'var(--text-muted)' }} />
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer', maxWidth: '180px' }}
              >
                <option value="all">All Courses</option>
                {coursesDropdown.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchAnalytics}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '6px 12px', fontSize: '0.85rem' }}
              title="Refresh Analytics"
            >
              <FiRefreshCw className={loading ? 'spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="status error" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <button onClick={fetchAnalytics} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center' }}>
            <Loader />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Calculating real database analytics...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* 1. TOP SUMMARY METRIC CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3B82F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <span>Total Students</span>
                  <FiUsers style={{ color: '#3B82F6', fontSize: '1.2rem' }} />
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                  {overview.totalStudents?.toLocaleString() || 0}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <span>Active Users</span>
                  <FiActivity style={{ color: '#10B981', fontSize: '1.2rem' }} />
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                  {overview.activeStudents?.toLocaleString() || 0}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #6366F1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <span>Total Courses</span>
                  <FiBookOpen style={{ color: '#6366F1', fontSize: '1.2rem' }} />
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                  {overview.totalCourses?.toLocaleString() || 0}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #F59E0B' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <span>Enrollments</span>
                  <FiTrendingUp style={{ color: '#F59E0B', fontSize: '1.2rem' }} />
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                  {overview.totalEnrollments?.toLocaleString() || 0}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #14B8A6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <span>Completions</span>
                  <FiCheckCircle style={{ color: '#14B8A6', fontSize: '1.2rem' }} />
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                  {overview.completedCourses?.toLocaleString() || 0}
                  {overview.completionRate !== null && (
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#14B8A6', marginLeft: '6px' }}>
                      ({overview.completionRate}%)
                    </span>
                  )}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #EC4899' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <span>Certificates</span>
                  <FiAward style={{ color: '#EC4899', fontSize: '1.2rem' }} />
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                  {overview.certificatesIssued?.toLocaleString() || 0}
                </div>
              </div>
            </div>

            {/* 2. COURSE PERFORMANCE TABLE */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Course Performance & Engagement</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Real enrollment counts, in-progress rates, course completion rates, and average assessment scores.
                  </p>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Click column headers to sort
                </span>
              </div>

              {sortedCourses.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No course performance data available for this selection.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => handleSort('title')}>
                          Course Title {sortField === 'title' ? (sortAsc ? '▲' : '▼') : ''}
                        </th>
                        <th style={{ padding: '10px 12px', cursor: 'pointer', textAlign: 'center' }} onClick={() => handleSort('totalStudents')}>
                          Students {sortField === 'totalStudents' ? (sortAsc ? '▲' : '▼') : ''}
                        </th>
                        <th style={{ padding: '10px 12px', cursor: 'pointer', textAlign: 'center' }} onClick={() => handleSort('inProgress')}>
                          In Progress {sortField === 'inProgress' ? (sortAsc ? '▲' : '▼') : ''}
                        </th>
                        <th style={{ padding: '10px 12px', cursor: 'pointer', textAlign: 'center' }} onClick={() => handleSort('completed')}>
                          Completed {sortField === 'completed' ? (sortAsc ? '▲' : '▼') : ''}
                        </th>
                        <th style={{ padding: '10px 12px', cursor: 'pointer', textAlign: 'center' }} onClick={() => handleSort('completionRate')}>
                          Completion Rate {sortField === 'completionRate' ? (sortAsc ? '▲' : '▼') : ''}
                        </th>
                        <th style={{ padding: '10px 12px', cursor: 'pointer', textAlign: 'center' }} onClick={() => handleSort('averageAssessmentScore')}>
                          Avg Assessment {sortField === 'averageAssessmentScore' ? (sortAsc ? '▲' : '▼') : ''}
                        </th>
                        <th style={{ padding: '10px 12px', cursor: 'pointer', textAlign: 'center' }} onClick={() => handleSort('totalCertificates')}>
                          Certificates {sortField === 'totalCertificates' ? (sortAsc ? '▲' : '▼') : ''}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedCourses.map((c) => (
                        <tr key={c.courseId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>
                            <div style={{ color: 'var(--text-primary)' }}>{c.title}</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.category} • {c.level}</span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700 }}>
                            {c.totalStudents}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', color: '#F59E0B' }}>
                            {c.inProgress}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', color: '#10B981', fontWeight: 700 }}>
                            {c.completed}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {c.completionRate !== null ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <div style={{ width: '60px', height: '6px', background: 'var(--surface-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ width: `${Math.min(100, c.completionRate)}%`, height: '100%', background: '#10B981', borderRadius: '3px' }} />
                                </div>
                                <span style={{ fontWeight: 700, color: '#10B981', fontSize: '0.85rem' }}>{c.completionRate}%</span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No data</span>
                            )}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {c.averageAssessmentScore !== null ? (
                              <span style={{ fontWeight: 700, color: c.averageAssessmentScore >= 70 ? '#34D399' : '#F59E0B' }}>
                                {c.averageAssessmentScore}%
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No attempts</span>
                            )}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#EC4899' }}>
                            {c.totalCertificates}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 3. VISUAL COURSE COMPLETION BREAKDOWN & ASSESSMENT METRICS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {/* Course Completion Visual Progress Bars */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', margin: '0 0 1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiTrendingUp style={{ color: '#10B981' }} /> Course Completion Rates
                </h3>

                {sortedCourses.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No courses available.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {sortedCourses.map((c) => {
                      const rate = c.completionRate !== null ? c.completionRate : 0
                      return (
                        <div key={c.courseId}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                              {c.title}
                            </span>
                            <span style={{ fontWeight: 700, color: c.completionRate !== null ? '#10B981' : 'var(--text-muted)' }}>
                              {c.completionRate !== null ? `${c.completionRate}%` : '0%'}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '10px', background: 'var(--surface-subtle)', borderRadius: '5px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(100, rate)}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
                                borderRadius: '5px',
                                transition: 'width 0.4s ease',
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Assessment Performance Analytics */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', margin: '0 0 1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiAward style={{ color: '#F59E0B' }} /> Assessment Performance
                </h3>

                {assessment.totalAttempts === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Not enough assessment attempts to calculate performance.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: 'var(--surface-subtle)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Average Score</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38BDF8', marginTop: '2px' }}>
                        {assessment.averageScore !== null ? `${assessment.averageScore}%` : 'N/A'}
                      </div>
                    </div>

                    <div style={{ background: 'var(--surface-subtle)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pass Rate</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
                        {assessment.passRate !== null ? `${assessment.passRate}%` : 'N/A'}
                      </div>
                    </div>

                    <div style={{ background: 'var(--surface-subtle)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fail Rate</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#EF4444', marginTop: '2px' }}>
                        {assessment.failRate !== null ? `${assessment.failRate}%` : 'N/A'}
                      </div>
                    </div>

                    <div style={{ background: 'var(--surface-subtle)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Submissions</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {assessment.totalAttempts || 0}
                      </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1', background: 'var(--surface-subtle)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Average Attempts per Student:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{assessment.averageAttemptsPerStudent || 1}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. DIFFICULT CONTENT & LECTURE ENGAGEMENT */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {/* Difficult Learning Content (Real Assessment Question Error Rate Analysis) */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiAlertTriangle style={{ color: '#EF4444' }} /> Difficult Topics & Questions
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real error rates</span>
                </div>

                {!difficult.hasData || difficult.items?.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {difficult.message || 'Not enough data yet.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {difficult.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: '8px',
                          background: 'var(--surface-subtle)',
                          borderLeft: item.errorRate >= 50 ? '3px solid #EF4444' : '3px solid #F59E0B',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.3' }}>
                            {item.topic}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {item.incorrectAttempts} incorrect out of {item.totalAttempts} answers ({item.difficulty})
                          </span>
                        </div>

                        <span
                          style={{
                            background: item.errorRate >= 50 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: item.errorRate >= 50 ? '#EF4444' : '#F59E0B',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            flexShrink: 0,
                          }}
                        >
                          {item.errorRate}% Error
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lecture Engagement Metrics */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', margin: '0 0 1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiCheckCircle style={{ color: '#3B82F6' }} /> Lecture Progress Insights
                </h3>

                {!engagement.hasData ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No lecture progress data available yet.
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Most Completed Lectures
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      {engagement.mostCompleted.map((l, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', background: 'var(--surface-subtle)', padding: '6px 10px', borderRadius: '6px' }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                            #{l.lectureNumber}: {l.title}
                          </span>
                          <strong style={{ color: '#10B981' }}>{l.completedCount} completions</strong>
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Least Completed Lectures
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {engagement.leastCompleted.map((l, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', background: 'var(--surface-subtle)', padding: '6px 10px', borderRadius: '6px' }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                            #{l.lectureNumber}: {l.title}
                          </span>
                          <strong style={{ color: 'var(--text-muted)' }}>{l.completedCount} completions</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 5. CERTIFICATE ANALYTICS & AI TUTOR STATUS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {/* Certificate Analytics */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', margin: '0 0 1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiAward style={{ color: '#EC4899' }} /> Certificate Distribution
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--surface-subtle)', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Completion-to-Certificate Ratio:</span>
                  <strong style={{ color: '#EC4899' }}>
                    {certificateData.completionToCertificateRatio !== null ? `${certificateData.completionToCertificateRatio}%` : 'N/A'}
                  </strong>
                </div>

                {certificateData.byCourse?.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No certificates issued yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {certificateData.byCourse.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '6px', background: 'var(--surface-subtle)', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600 }}>{item.courseName}</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Avg Score: {item.averageScore}%</span>
                          <strong style={{ color: '#EC4899' }}>{item.certificatesCount} Certs</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Tutor Usage (Non-Fake Status) */}
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', margin: '0 0 0.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiCpu style={{ color: '#8B5CF6' }} /> AI Tutor Telemetry
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Live lecture-specific AI tutoring performance and query volume.
                  </p>

                  <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '1rem', borderRadius: '8px', fontSize: '0.88rem', color: '#CBD5E1', lineHeight: '1.5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#A78BFA', marginBottom: '4px' }}>
                      <FiHelpCircle /> Real Data Notice
                    </div>
                    {aiData.message || 'AI usage analytics will appear once AI conversations are stored.'}
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>AI Engine: Groq LLaMA-3 / Qwen</span>
                  <span>Status: Active Grounded</span>
                </div>
              </div>
            </div>

            {/* 6. RECENT PLATFORM ACTIVITY LOG */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', margin: '0 0 1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiActivity style={{ color: '#10B981' }} /> Recent Platform Milestones
              </h3>

              {recentActivity.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No recent activity records found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentActivity.map((act, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '10px 12px',
                        background: 'var(--surface-subtle)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>{act.icon}</span>
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{act.title}</strong>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{act.subtitle}</div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(act.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
