import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCheck,
  FiPlayCircle,
  FiVideo,
  FiPlay,
  FiClock,
  FiAward,
  FiBarChart2,
  FiLayers,
  FiLock,
} from 'react-icons/fi'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import { useAuth } from '../context/authContext.js'
import { thumbnailForCourse } from '../assets/courseThumbnails.js'

export default function CourseDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [course, setCourse] = useState(null)
  const [lectures, setLectures] = useState([])
  const [modules, setModules] = useState([])
  const [progressData, setProgressData] = useState(null)
  const [assessmentData, setAssessmentData] = useState(null)
  const [completionData, setCompletionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    Promise.all([
      api.get(`/courses/single-course/${id}`),
      api.get(`/lectures/course/${id}`).catch(() => ({ data: { lectures: [] } })),
      api.get(`/progress/course/${id}`).catch(() => ({ data: null })),
      api.get(`/assessments/course/${id}`).catch(() => ({ data: null })),
      api.get(`/courses/${id}/completion`).catch(() => ({ data: null })),
    ])
      .then(([courseRes, lectureRes, progressRes, assessRes, compRes]) => {
        if (!isMounted) return
        setCourse(courseRes.data.course)
        setLectures(lectureRes.data?.lectures || [])
        setModules(lectureRes.data?.modules || [])
        if (progressRes.data && progressRes.data.success) {
          setProgressData(progressRes.data)
        }
        if (assessRes?.data?.hasAssessment) {
          setAssessmentData(assessRes.data)
        }
        if (compRes?.data?.success) {
          setCompletionData(compRes.data)
        }
      })
      .catch((err) => {
        if (isMounted) setError(messageFrom(err))
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  const enroll = async () => {
    if (!isAuthenticated) {
      return navigate('/login', { state: { from: `/courses/${id}` } })
    }
    setBusy(true)
    try {
      const { data } = await api.post('/enrollments/enroll-course', {
        courseId: id,
      })
      toast.success(data.message || 'Enrollment successful')
    } catch (err) {
      toast.error(messageFrom(err))
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <section className="section container">
        <Loader />
      </section>
    )
  }

  if (error || !course) {
    return (
      <section className="section container">
        <div className="status error">{error || 'Course not found'}</div>
      </section>
    )
  }

  const completedSet = new Set(progressData?.completedLectures || [])
  const continueLecture = progressData?.continueLearningLecture || (lectures[0] ? { lectureNumber: lectures[0].lectureNumber, title: lectures[0].title } : null)
  const isCompleted = progressData?.isCourseCompleted || false
  const progressPercent = progressData?.progressPercentage || 0
  const completedCount = progressData?.completedCount || 0
  const totalCount = progressData?.totalLectures || lectures.length

  return (
    <>
      <section className="detail-hero">
        <div className="container">
          <div style={{ marginBottom: '14px' }}>
            <Link
              to="/courses"
              className="nav-back-btn"
            >
              <FiArrowLeft /> Back to catalog
            </Link>
          </div>
          <span className="eyebrow">{course.category}</span>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
        </div>
      </section>

      <section className="container detail-layout">
        <div className="detail-content">
          {/* Course Progress Tracking Banner */}
          {lectures && lectures.length > 0 && (
            <div className="course-progress-panel">
              <div className="course-progress-panel-header">
                <div className="course-progress-title-wrap">
                  <FiBarChart2 size={20} color="var(--primary)" />
                  <h3>Course Progress</h3>
                </div>
                <span className="course-progress-stats">
                  {completedCount} / {totalCount} {totalCount === 1 ? 'lecture' : 'lectures'} completed ({progressPercent}%)
                </span>
              </div>

              <div className="course-progress-bar-track">
                <div
                  className={`course-progress-bar-fill ${isCompleted ? 'completed' : ''}`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              <div className="course-progress-actions">
                {isCompleted ? (
                  <div className="course-completed-celebration">
                    <span>🎉 Course Completed</span>
                  </div>
                ) : (
                  <span style={{ fontSize: '13.5px', color: 'var(--muted)', fontWeight: 500 }}>
                    {completedCount === 0
                      ? 'Begin your journey with the first lecture'
                      : `Pick up where you left off`}
                  </span>
                )}

                {continueLecture && (
                  <Link
                    to={`/courses/${course._id}/lectures/${continueLecture.lectureNumber}`}
                    className="btn btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      fontSize: '13.5px',
                      padding: '8px 18px',
                    }}
                  >
                    <FiPlayCircle size={16} />
                    {isCompleted
                      ? 'Review Course'
                      : completedCount === 0
                      ? 'Start Learning'
                      : `Continue Learning (Lecture ${continueLecture.lectureNumber})`}
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Final Course Assessment Section */}
          {assessmentData?.hasAssessment && (
            <div className="course-progress-panel" style={{ marginTop: 24, borderLeft: '4px solid #3b82f6' }}>
              <div className="course-progress-panel-header">
                <div className="course-progress-title-wrap">
                  <FiAward size={22} color="#3b82f6" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16 }}>{assessmentData.assessment?.title || 'Final Course Assessment'}</h3>
                    <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                      {assessmentData.assessment?.totalQuestions} Questions • Passing Threshold: {assessmentData.assessment?.passingPercentage}%
                      {assessmentData.assessment?.timeLimitMinutes > 0 && ` • ⏱ ${assessmentData.assessment?.timeLimitMinutes} Mins`}
                    </span>
                  </div>
                </div>

                {completionData?.courseCompleted ? (
                  <span className="badge badge-success" style={{ fontSize: 12, padding: '4px 10px' }}>
                    🎉 Course Completed (Score: {completionData.bestScore}%)
                  </span>
                ) : assessmentData.hasPassed ? (
                  <span className="badge badge-success" style={{ fontSize: 12, padding: '4px 10px' }}>
                    ✓ Passed ({assessmentData.bestScore}%)
                  </span>
                ) : null}
              </div>

              <div className="course-progress-actions" style={{ marginTop: 14 }}>
                {assessmentData.prerequisite?.isMet ? (
                  <>
                    <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                      {assessmentData.attempts?.length > 0
                        ? `Previous Attempts: ${assessmentData.attempts.length} • Best Score: ${assessmentData.bestScore}%`
                        : 'All required lectures completed. Ready for evaluation.'}
                    </span>
                    <Link
                      to={`/courses/${id}/assessment`}
                      className="btn btn-primary"
                      style={{ padding: '8px 18px', fontSize: '13.5px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <FiAward size={15} />
                      {assessmentData.attempts?.length > 0 ? 'View Results / Retry' : 'Start Final Assessment'}
                    </Link>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '13px', color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <FiLock size={14} /> Complete all {totalCount} required lectures to unlock assessment ({completedCount}/{totalCount} done)
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled
                      style={{ opacity: 0.6, cursor: 'not-allowed', padding: '8px 16px', fontSize: '13px' }}
                    >
                      Assessment Locked
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          <h2>About this course</h2>
          <p>{course.description}</p>

          {/* Video Lectures & Module Breakdown */}
          {lectures && lectures.length > 0 && (
            <div className="curriculum-container" style={{ marginTop: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 style={{ marginBottom: 4 }}>Curriculum & Video Lectures</h2>
                  <p style={{ fontSize: '13.5px', color: 'var(--muted)' }}>
                    {lectures.length} {lectures.length === 1 ? 'Lecture' : 'Lectures'} • YouTube Embedded Series
                  </p>
                </div>
                {continueLecture && (
                  <Link
                    to={`/courses/${course._id}/lectures/${continueLecture.lectureNumber}`}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '13.5px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <FiPlayCircle size={15} /> {isCompleted ? 'Review Course' : 'Continue Learning'}
                  </Link>
                )}
              </div>

              {/* Grouped by pedagogical modules if available */}
              {modules && modules.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {modules.map((mod) => {
                    const modLectures = mod.lectures || []
                    const modCompletedCount = modLectures.filter((l) => completedSet.has(l.lectureNumber)).length
                    const modTotal = modLectures.length
                    const modPct = modTotal > 0 ? Math.round((modCompletedCount / modTotal) * 100) : 0
                    const isModDone = modTotal > 0 && modCompletedCount === modTotal

                    return (
                      <div key={mod.moduleNumber} className="module-group-block">
                        <div className="module-progress-header">
                          <span className="module-progress-title">
                            <FiLayers size={16} color="var(--primary)" />
                            {mod.title}
                          </span>
                          <span className={`module-progress-badge ${isModDone ? 'completed' : ''}`}>
                            {isModDone && <FiCheck size={13} />}
                            {modCompletedCount} / {modTotal} lectures completed ({modPct}%)
                          </span>
                        </div>

                        <div className="curriculum-modules-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {modLectures.map((lec) => {
                            const isLecDone = completedSet.has(lec.lectureNumber)
                            const numStr = String(lec.lectureNumber).padStart(2, '0')

                            return (
                              <Link
                                key={lec._id || lec.lectureNumber}
                                to={`/courses/${course._id}/lectures/${lec.lectureNumber}`}
                                style={{
                                  background: 'var(--bg-white)',
                                  border: '1px solid var(--line)',
                                  borderRadius: 'var(--radius-lg)',
                                  padding: '13px 18px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  textDecoration: 'none',
                                  transition: 'border-color 0.2s ease, transform 0.15s ease',
                                  gap: 16,
                                }}
                                className={`course-topic-row-link ${isLecDone ? 'lecture-done' : ''}`}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
                                  {lec.thumbnailUrl ? (
                                    <div
                                      style={{
                                        position: 'relative',
                                        width: 68,
                                        height: 42,
                                        borderRadius: 6,
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        background: '#000',
                                        border: '1px solid var(--line)',
                                      }}
                                    >
                                      <img
                                        src={lec.thumbnailUrl}
                                        alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                      />
                                      <span
                                        style={{
                                          position: 'absolute',
                                          bottom: 2,
                                          right: 2,
                                          background: 'rgba(15,23,42,0.85)',
                                          color: '#fff',
                                          fontSize: 9.5,
                                          fontWeight: 800,
                                          padding: '1px 4px',
                                          borderRadius: 3,
                                          lineHeight: 1.2,
                                        }}
                                      >
                                        {numStr}
                                      </span>
                                    </div>
                                  ) : (
                                    <span
                                      style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: '50%',
                                        background: isLecDone ? 'rgba(16, 185, 129, 0.12)' : 'var(--primary-light)',
                                        color: isLecDone ? '#10b981' : 'var(--primary)',
                                        display: 'grid',
                                        placeItems: 'center',
                                        fontSize: '13px',
                                        fontWeight: 800,
                                        flexShrink: 0,
                                        fontFamily: 'var(--font-heading)',
                                      }}
                                    >
                                      {isLecDone ? <FiCheck size={14} /> : numStr}
                                    </span>
                                  )}
                                  <div style={{ minWidth: 0 }}>
                                    <strong
                                      style={{
                                        color: 'var(--text-heading)',
                                        display: 'block',
                                        fontSize: '14.5px',
                                        fontWeight: 700,
                                        lineHeight: 1.35,
                                      }}
                                    >
                                      {lec.title}
                                    </strong>
                                    {lec.duration && (
                                      <span
                                        style={{
                                          fontSize: '12px',
                                          color: 'var(--muted)',
                                          marginTop: 2,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: 4,
                                        }}
                                      >
                                        <FiClock size={11} /> {lec.duration}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                  {isLecDone ? (
                                    <span className="lecture-status-done-badge">
                                      <FiCheck size={12} /> Completed
                                    </span>
                                  ) : (
                                    <span className="lecture-status-pending-badge">
                                      Watch <FiPlay size={11} style={{ fill: 'currentColor' }} />
                                    </span>
                                  )}
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* Flat lectures list fallback */
                <div className="curriculum-modules-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {lectures.map((lec) => {
                    const isLecDone = completedSet.has(lec.lectureNumber)
                    const numStr = String(lec.lectureNumber).padStart(2, '0')

                    return (
                      <Link
                        key={lec._id || lec.lectureNumber}
                        to={`/courses/${course._id}/lectures/${lec.lectureNumber}`}
                        style={{
                          background: 'var(--bg-white)',
                          border: '1px solid var(--line)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '14px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          textDecoration: 'none',
                          transition: 'border-color 0.2s ease, transform 0.15s ease',
                          gap: 16,
                        }}
                        className={`course-topic-row-link ${isLecDone ? 'lecture-done' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
                          {lec.thumbnailUrl ? (
                            <div
                              style={{
                                position: 'relative',
                                width: 68,
                                height: 42,
                                borderRadius: 6,
                                overflow: 'hidden',
                                flexShrink: 0,
                                background: '#000',
                                border: '1px solid var(--line)',
                              }}
                            >
                              <img
                                src={lec.thumbnailUrl}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              />
                              <span
                                style={{
                                  position: 'absolute',
                                  bottom: 2,
                                  right: 2,
                                  background: 'rgba(15,23,42,0.85)',
                                  color: '#fff',
                                  fontSize: 9.5,
                                  fontWeight: 800,
                                  padding: '1px 4px',
                                  borderRadius: 3,
                                  lineHeight: 1.2,
                                }}
                              >
                                {numStr}
                              </span>
                            </div>
                          ) : (
                            <span
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                background: isLecDone ? 'rgba(16, 185, 129, 0.12)' : 'var(--primary-light)',
                                color: isLecDone ? '#10b981' : 'var(--primary)',
                                display: 'grid',
                                placeItems: 'center',
                                fontSize: '13px',
                                fontWeight: 800,
                                flexShrink: 0,
                                fontFamily: 'var(--font-heading)',
                              }}
                            >
                              {isLecDone ? <FiCheck size={14} /> : numStr}
                            </span>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <strong
                              style={{
                                color: 'var(--text-heading)',
                                display: 'block',
                                fontSize: '15px',
                                fontWeight: 700,
                                lineHeight: 1.35,
                              }}
                            >
                              {lec.title}
                            </strong>
                            {lec.duration && (
                              <span
                                style={{
                                  fontSize: '12.5px',
                                  color: 'var(--muted)',
                                  marginTop: 2,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <FiClock size={11} /> {lec.duration}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          {isLecDone ? (
                            <span className="lecture-status-done-badge">
                              <FiCheck size={12} /> Completed
                            </span>
                          ) : (
                            <span className="lecture-status-pending-badge">
                              Watch Lecture <FiPlay size={11} style={{ fill: 'currentColor' }} />
                            </span>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 36 }}>
            <h2>What you can expect</h2>
            <p style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
              <FiCheckCircle style={{ color: 'var(--primary)', flexShrink: 0, fontSize: 20 }} />
              A focused learning experience with practical context and a clear next step.
            </p>
          </div>
        </div>

        <aside className="detail-aside">
          <div className="course-visual" style={{ borderRadius: 12 }}>
            {thumbnailForCourse(course) ? (
              <img
                src={thumbnailForCourse(course)}
                alt={course.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              course.title.slice(0, 1)
            )}
          </div>
          <div className="meta-list">
            <span>
              Instructor <strong>{course.instructor}</strong>
            </span>
            <span>
              Level <strong>{course.level}</strong>
            </span>
            <span>
              Duration <strong>{course.duration}</strong>
            </span>
            <span>
              Price <strong>{course.price ? `$${course.price}` : 'Free'}</strong>
            </span>
          </div>

          {/* Sidebar Action Button */}
          {lectures && lectures.length > 0 && (
            <Link
              to={`/courses/${course._id}/lectures/${continueLecture ? continueLecture.lectureNumber : 1}`}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 10,
                textDecoration: 'none',
              }}
            >
              <FiPlayCircle size={17} />
              {isCompleted
                ? '🎉 Course Completed'
                : completedCount > 0
                ? `Continue Learning (Lec ${continueLecture?.lectureNumber || 1})`
                : 'Start Video Lectures'}
            </Link>
          )}

          <button className="btn btn-primary" disabled={busy} onClick={enroll} style={{ width: '100%' }}>
            {busy ? 'Enrolling...' : !course.price || Number(course.price) === 0 ? 'Enroll for Free' : 'Enroll in course'}
          </button>
        </aside>
      </section>
    </>
  )
}
