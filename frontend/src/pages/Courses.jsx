import { useEffect, useMemo, useState } from 'react'
import api, { messageFrom } from '../services/api.js'
import CourseCard from '../components/CourseCard.jsx'
import CourseFilters from '../components/CourseFilters.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import './Courses.css'

const initialFilters = { search: '', category: '' }

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [page, setPage] = useState(1)
  const [retryKey, setRetryKey] = useState(0)
  const [meta, setMeta] = useState({ totalPages: 1, totalCourses: 0 })
  const [state, setState] = useState({ loading: true, error: '' })

  const categories = useMemo(
    () =>
      [...new Set(courses.map((course) => course.category).filter(Boolean))].sort(),
    [courses]
  )

  const retryCourses = () => {
    setState({ loading: true, error: '' })
    setRetryKey((current) => current + 1)
  }

  useEffect(() => {
    const query = new URLSearchParams({
      page,
      limit: 20,
      ...(filters.search && { search: filters.search }),
      ...(filters.category && { category: filters.category }),
    })
    let cancelled = false
    api
      .get(`/courses/all-courses?${query}`)
      .then(({ data }) => {
        if (cancelled) return
        setCourses(data.courses || [])
        setMeta({
          totalPages: data.totalPages || 1,
          totalCourses: data.totalCourses || 0,
        })
      })
      .catch((error) => {
        if (!cancelled) setState({ loading: false, error: messageFrom(error) })
      })
      .finally(() => {
        if (!cancelled)
          setState((current) => ({ ...current, loading: false }))
      })
    return () => {
      cancelled = true
    }
  }, [page, filters.search, filters.category, retryKey])

  const updateFilter = (key, value) => {
    setState({ loading: true, error: '' })
    setPage(1)
    setFilters((current) => ({ ...current, [key]: value }))
  }

  return (
    <section className="courses-section">
      <div className="container">
          <CourseFilters
            search={filters.search}
            category={filters.category}
            categories={categories}
            onChange={updateFilter}
          />
          <div className="results-row">
            <p className="muted">
              {state.loading
                ? 'Finding courses...'
                : `${meta.totalCourses || 0} courses to explore`}
            </p>
            {!state.loading && meta.totalPages > 1 && (
              <div className="pagination compact">
                {Array.from({ length: meta.totalPages }, (_, index) => (
                  <button
                    className={page === index + 1 ? 'active' : ''}
                    key={index}
                    onClick={() => {
                      setState({ loading: true, error: '' })
                      setPage(index + 1)
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {state.loading ? (
            <LoadingSkeleton />
          ) : state.error ? (
            <ErrorState detail={state.error} onRetry={retryCourses} />
          ) : courses.length ? (
            <div className="course-grid">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <EmptyState onClear={() => setFilters(initialFilters)} />
          )}
        </div>
      </section>
  )
}
