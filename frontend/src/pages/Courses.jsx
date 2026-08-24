import { useEffect, useMemo, useState } from 'react'
import api, { messageFrom } from '../services/api.js'
import CourseCard from '../components/CourseCard.jsx'
import CourseFilters from '../components/CourseFilters.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import './Courses.css'

const initialFilters = { search: '', category: '', level: '', sort: 'relevance' }

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

  const visibleCourses = useMemo(() => {
    const result = [...courses]
    if (filters.sort === 'title-asc')
      result.sort((a, b) => a.title.localeCompare(b.title))
    if (filters.sort === 'price-low')
      result.sort((a, b) => Number(a.price) - Number(b.price))
    if (filters.sort === 'price-high')
      result.sort((a, b) => Number(b.price) - Number(a.price))
    return result
  }, [courses, filters.sort])

  const retryCourses = () => {
    setState({ loading: true, error: '' })
    setRetryKey((current) => current + 1)
  }

  useEffect(() => {
    const query = new URLSearchParams({
      page,
      limit: 6,
      ...(filters.search && { search: filters.search }),
      ...(filters.category && { category: filters.category }),
      ...(filters.level && { level: filters.level }),
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
  }, [page, filters.search, filters.category, filters.level, retryKey])

  const updateFilter = (key, value) => {
    setState({ loading: true, error: '' })
    setPage(1)
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const clearFilters = () => {
    setState({ loading: true, error: '' })
    setPage(1)
    setFilters(initialFilters)
  }

  return (
    <>
      <header className="catalog-hero">
        <div className="container catalog-hero-inner">
          <div>
            <span className="eyebrow">NGSkillForge learning catalog</span>
            <h1>Explore Courses</h1>
            <p>Build practical skills that move your career forward.</p>
          </div>
          <div className="catalog-hero-note">
            <strong>{meta.totalCourses || 0}</strong>
            <span>courses available</span>
          </div>
        </div>
      </header>

      <section className="courses-section">
        <div className="container">
          <CourseFilters
            {...filters}
            categories={categories}
            onChange={updateFilter}
            onClear={clearFilters}
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
          ) : visibleCourses.length ? (
            <div className="course-grid">
              {visibleCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <EmptyState onClear={clearFilters} />
          )}
        </div>
      </section>
    </>
  )
}
