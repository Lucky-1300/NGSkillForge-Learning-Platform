import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiArrowLeft, FiCheckCircle, FiArrowRight, FiPlayCircle } from 'react-icons/fi'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import { useAuth } from '../context/authContext.js'
import { thumbnailForCourse } from '../assets/courseThumbnails.js'

export default function CourseDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get(`/courses/single-course/${id}`)
      .then(({ data }) => setCourse(data.course))
      .catch((err) => setError(messageFrom(err)))
      .finally(() => setLoading(false))
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

  return (
    <>
      <section className="detail-hero">
        <div className="container">
          <button
            className="btn"
            style={{ color: '#ffffff', background: 'transparent', paddingLeft: 0, marginBottom: 8 }}
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft /> Back to catalog
          </button>
          <span className="eyebrow">{course.category}</span>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
        </div>
      </section>

      <section className="container detail-layout">
        <div className="detail-content">
          <h2>About this course</h2>
          <p>{course.description}</p>

          {course.modules && course.modules.length > 0 && (
            <div className="curriculum-container" style={{ marginTop: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 style={{ marginBottom: 4 }}>Course Topics</h2>
                  <p style={{ fontSize: '13.5px', color: 'var(--muted)' }}>
                    {course.modules.length} Topics • {course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} Subtopics
                  </p>
                </div>
              </div>

              <div className="curriculum-modules-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {course.modules.map((module, mIdx) => {
                  const topicNumStr = String(module.order || mIdx + 1).padStart(2, '0')
                  const subtopicsCount = module.lessons?.length || 0

                  return (
                    <Link
                      key={mIdx}
                      to={`/courses/${course._id}/topics/${module.order}`}
                      style={{
                        background: 'var(--bg-white)',
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textDecoration: 'none',
                        transition: 'border-color 0.2s ease, transform 0.15s ease',
                        gap: 16,
                      }}
                      className="course-topic-row-link"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
                        <span
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '13px',
                            fontWeight: 800,
                            flexShrink: 0,
                            fontFamily: 'var(--font-heading)',
                          }}
                        >
                          {topicNumStr}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <strong
                            style={{
                              color: 'var(--text-heading)',
                              display: 'block',
                              fontSize: '15.5px',
                              fontWeight: 700,
                              lineHeight: 1.3,
                            }}
                          >
                            {module.title}
                          </strong>
                          <span style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: 2, display: 'block' }}>
                            {subtopicsCount} {subtopicsCount === 1 ? 'Subtopic' : 'Subtopics'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '13px',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            background: 'var(--primary-light)',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--primary-border)',
                          }}
                        >
                          Open Topic <FiArrowRight size={13} />
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
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
          <button className="btn btn-primary" disabled={busy} onClick={enroll}>
            {busy ? 'Enrolling...' : !course.price || Number(course.price) === 0 ? 'Enroll for Free' : 'Enroll in course'}
          </button>
        </aside>
      </section>
    </>
  )
}
