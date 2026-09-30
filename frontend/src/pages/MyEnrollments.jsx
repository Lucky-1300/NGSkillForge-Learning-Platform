import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiBookOpen, FiClock } from 'react-icons/fi'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import { thumbnailForCourse } from '../assets/courseThumbnails.js'

export default function MyEnrollments() {
  const [items, setItems] = useState([])
  const [state, setState] = useState({ loading: true, error: '' })

  useEffect(() => {
    api
      .get('/enrollments/my-enrollments')
      .then(({ data }) => setItems(data.enrollments || []))
      .catch((err) => setState({ loading: false, error: messageFrom(err) }))
      .finally(() => setState((s) => ({ ...s, loading: false })))
  }, [])

  return (
    <>
      <header className="learning-header">
        <div className="container learning-header-inner">
          <div>
            <span className="eyebrow">Your learning dashboard</span>
            <h1>Continue learning</h1>
            <p>Pick up where you left off and keep building useful skills.</p>
          </div>
          <div className="learning-header-mark">
            <FiBookOpen />
            <span>{items.length} {items.length === 1 ? 'Course' : 'Courses'} in progress</span>
          </div>
        </div>
      </header>
      <section className="section learning-section">
        <div className="container">
          <div className="learning-summary">
            <span className="learning-summary-icon">
              <FiBookOpen />
            </span>
            <div>
              <strong>{items.length}</strong>
              <span>Courses in progress</span>
            </div>
            <span className="learning-summary-note">
              <FiClock /> Your next step is waiting
            </span>
          </div>

          {state.loading ? (
            <Loader />
          ) : state.error ? (
            <div className="status error">{state.error}</div>
          ) : items.length ? (
            <div className="course-grid">
              {items.map(
                (item) =>
                  item.course && (
                    <div className="course-card" key={item._id}>
                      <div className="course-visual">
                        {thumbnailForCourse(item.course) ? (
                          <img
                            src={thumbnailForCourse(item.course)}
                            alt={`${item.course.title} thumbnail`}
                          />
                        ) : (
                          <FiBookOpen />
                        )}
                      </div>
                      <div className="course-body">
                        <div className="course-meta">
                          <span>{item.course.category}</span>
                          <span>{item.course.level}</span>
                        </div>
                        <h3>{item.course.title}</h3>
                        <p>{item.course.description}</p>
                        <div className="enrollment-progress">
                          <div>
                            <span>Progress</span>
                            <strong>{item.progress || 0}%</strong>
                          </div>
                          <span className="progress-track">
                            <span style={{ width: `${item.progress || 0}%`, height: '100%', display: 'block', background: item.progress === 100 ? '#10b981' : 'var(--primary)', borderRadius: '999px', transition: 'width 0.3s ease' }} />
                          </span>
                        </div>
                        <div className="course-footer">
                          <span className="muted" style={{ fontSize: '12.5px', fontWeight: 500 }}>
                            Ready to continue
                          </span>
                          <Link
                            className="btn btn-primary"
                            to={`/courses/${item.course._id}`}
                          >
                            Continue <FiArrowRight />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
              )}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Your learning shelf is empty.</h3>
              <p className="muted">
                Explore the catalog and enroll in your first course.
              </p>
              <Link
                className="btn btn-primary"
                style={{ marginTop: 20 }}
                to="/courses"
              >
                Explore courses <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
