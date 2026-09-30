import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import {
  FiSearch,
  FiX,
  FiBookOpen,
  FiPlay,
  FiFileText,
  FiCheckSquare,
  FiAward,
  FiArrowRight,
  FiClock,
  FiFilter,
  FiExternalLink,
  FiTrash2,
} from 'react-icons/fi'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import { thumbnailForCourse } from '../assets/courseThumbnails.js'

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = searchParams.get('q') || ''
  const initialType = searchParams.get('type') || 'all'

  const [searchInput, setSearchInput] = useState(initialQ)
  const [activeType, setActiveType] = useState(initialType)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recentSearches, setRecentSearches] = useState([])
  const navigate = useNavigate()

  // Load recent searches from localStorage
  const loadRecentSearches = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('ngskillforge_recent_searches') || '[]')
      setRecentSearches(stored)
    } catch (e) {
      setRecentSearches([])
    }
  }

  useEffect(() => {
    loadRecentSearches()
  }, [])

  const saveRecentSearch = (term) => {
    if (!term || !term.trim()) return
    const clean = term.trim()
    try {
      const stored = JSON.parse(localStorage.getItem('ngskillforge_recent_searches') || '[]')
      const updated = [clean, ...stored.filter((r) => r.toLowerCase() !== clean.toLowerCase())].slice(0, 8)
      localStorage.setItem('ngskillforge_recent_searches', JSON.stringify(updated))
      setRecentSearches(updated)
    } catch (e) {
      // ignore
    }
  }

  const clearRecentSearches = () => {
    localStorage.removeItem('ngskillforge_recent_searches')
    setRecentSearches([])
  }

  // Fetch search results whenever search params change
  useEffect(() => {
    const qParam = searchParams.get('q') || ''
    const typeParam = searchParams.get('type') || 'all'
    setSearchInput(qParam)
    setActiveType(typeParam)

    if (!qParam.trim()) {
      setData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    saveRecentSearch(qParam)

    api
      .get(`/search?q=${encodeURIComponent(qParam.trim())}&type=${typeParam}`)
      .then(({ data: resData }) => {
        if (resData?.success) {
          setData(resData)
        } else {
          setError(resData?.message || 'Failed to complete search.')
        }
      })
      .catch((err) => setError(messageFrom(err)))
      .finally(() => setLoading(false))
  }, [searchParams])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim(), type: activeType })
    }
  }

  const handleTypeChange = (newType) => {
    setActiveType(newType)
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim(), type: newType })
    }
  }

  const handleRecentClick = (term) => {
    setSearchInput(term)
    setSearchParams({ q: term, type: activeType })
  }

  const results = data?.results || {}
  const totalResults = data?.totalResults || 0

  const coursesList = results.courses || []
  const lecturesList = results.lectures || []
  const notesList = results.notes || []
  const tasksList = results.tasks || []
  const mcqsList = results.mcqs || []

  return (
    <div className="search-page">
      {/* Search Header Banner */}
      <header className="learning-header" style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)' }}>
            <FiSearch /> Global Curriculum Search
          </span>
          <h1 style={{ fontSize: '2.25rem', marginTop: '0.25rem', marginBottom: '1.25rem', color: 'var(--text-heading)' }}>
            {searchInput ? `Search Results for "${searchInput}"` : 'Search NGSkillForge'}
          </h1>

          {/* Search Form Box */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <input
                type="text"
                className="input"
                placeholder="Search courses, lectures, notes, tasks, MCQs..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ width: '100%', paddingLeft: '40px', fontSize: '1rem' }}
                autoFocus
              />
              <FiSearch
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontSize: '1.1rem',
                  pointerEvents: 'none',
                }}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', minWidth: '130px', justifyContent: 'center' }}>
              <FiSearch /> Search
            </button>
          </form>

          {/* Recent Searches Pills */}
          {recentSearches.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiClock size={12} /> Recent:
              </span>
              {recentSearches.map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentClick(term)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '2px 10px',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  {term}
                </button>
              ))}
              <button
                onClick={clearRecentSearches}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  marginLeft: '4px',
                }}
                title="Clear Recent Searches"
              >
                <FiTrash2 size={12} /> Clear
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Results Container */}
      <div className="container" style={{ maxWidth: '960px', padding: '2rem 1rem 5rem' }}>
        {/* Filter Type Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <button
            onClick={() => handleTypeChange('all')}
            className={`btn ${activeType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          >
            All {data ? `(${totalResults})` : ''}
          </button>
          <button
            onClick={() => handleTypeChange('courses')}
            className={`btn ${activeType === 'courses' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <FiBookOpen /> Courses {data ? `(${coursesList.length})` : ''}
          </button>
          <button
            onClick={() => handleTypeChange('lectures')}
            className={`btn ${activeType === 'lectures' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <FiPlay /> Lectures {data ? `(${lecturesList.length})` : ''}
          </button>
          <button
            onClick={() => handleTypeChange('notes')}
            className={`btn ${activeType === 'notes' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <FiFileText /> Notes {data ? `(${notesList.length})` : ''}
          </button>
          <button
            onClick={() => handleTypeChange('tasks')}
            className={`btn ${activeType === 'tasks' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <FiCheckSquare /> Tasks {data ? `(${tasksList.length})` : ''}
          </button>
          <button
            onClick={() => handleTypeChange('mcqs')}
            className={`btn ${activeType === 'mcqs' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <FiAward /> MCQs {data ? `(${mcqsList.length})` : ''}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ padding: '3.5rem 0', textAlign: 'center' }}>
            <Loader />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Searching across published courses, notes, and curriculum...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="status error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Empty Query Prompt */}
        {!loading && !searchInput && (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FiSearch size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Start Exploring Content</h2>
            <p style={{ maxWidth: '460px', margin: '0 auto 1.5rem' }}>
              Type a topic, concept, lecture, or keyword above to instantly discover relevant courses, published notes, practice tasks, and MCQs.
            </p>
          </div>
        )}

        {/* Zero Results State */}
        {!loading && searchInput && data && totalResults === 0 && (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No results found for "{searchInput}"</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
              We couldn't find any published courses, lectures, or notes matching your query. Try searching with a different keyword or checking for typos.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setSearchInput('JavaScript')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                JavaScript
              </button>
              <button onClick={() => setSearchInput('Functions')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                Functions
              </button>
              <button onClick={() => setSearchInput('DOM')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                DOM Manipulation
              </button>
              <button onClick={() => setSearchInput('Async')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                Async / Await
              </button>
            </div>
          </div>
        )}

        {/* Results List */}
        {!loading && data && totalResults > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* 1. COURSES SECTION */}
            {(activeType === 'all' || activeType === 'courses') && coursesList.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <FiBookOpen style={{ color: '#3B82F6' }} />
                  <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Courses ({coursesList.length})</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {coursesList.map((c) => (
                    <Link
                      key={c._id}
                      to={c.url}
                      className="card search-result-card"
                      style={{ padding: '1.25rem', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid #3B82F6' }}
                    >
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase' }}>
                          Course • {c.category}
                        </span>
                        <h3 style={{ fontSize: '1.1rem', margin: '4px 0 6px', color: 'var(--text-primary)' }}>{c.title}</h3>
                        {c.description && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '0.75rem' }}>
                            {c.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                        <span>{c.level}</span>
                        <span style={{ color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                          View Course <FiArrowRight size={14} />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 2. LECTURES SECTION */}
            {(activeType === 'all' || activeType === 'lectures') && lecturesList.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <FiPlay style={{ color: '#10B981' }} />
                  <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Lectures ({lecturesList.length})</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {lecturesList.map((l) => (
                    <Link
                      key={l._id}
                      to={l.url}
                      className="card search-result-card"
                      style={{ padding: '1rem 1.25rem', textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderLeft: '4px solid #10B981' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>
                          <FiPlay />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {l.courseTitle} {l.moduleTitle ? `• ${l.moduleTitle}` : ''}
                          </span>
                          <h3 style={{ fontSize: '1rem', margin: '2px 0 0', color: 'var(--text-primary)' }}>
                            #{l.lectureNumber}: {l.title}
                          </h3>
                        </div>
                      </div>
                      <span style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        Watch <FiArrowRight size={14} />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 3. NOTES SECTION */}
            {(activeType === 'all' || activeType === 'notes') && notesList.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <FiFileText style={{ color: '#F59E0B' }} />
                  <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Published Notes ({notesList.length})</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {notesList.map((n) => (
                    <Link
                      key={n._id}
                      to={n.url}
                      className="card search-result-card"
                      style={{ padding: '1rem 1.25rem', textDecoration: 'none', color: 'inherit', borderLeft: '4px solid #F59E0B' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--text-primary)' }}>{n.title}</h3>
                        <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 600, flexShrink: 0 }}>
                          Read Notes →
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        {n.subtitle}
                      </span>
                      {n.snippet && (
                        <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>
                          {n.snippet}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 4. TASKS SECTION */}
            {(activeType === 'all' || activeType === 'tasks') && tasksList.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <FiCheckSquare style={{ color: '#8B5CF6' }} />
                  <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Practice Tasks ({tasksList.length})</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {tasksList.map((t) => (
                    <Link
                      key={t._id}
                      to={t.url}
                      className="card search-result-card"
                      style={{ padding: '1rem 1.25rem', textDecoration: 'none', color: 'inherit', borderLeft: '4px solid #8B5CF6' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '4px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, marginRight: '8px' }}>
                            {t.difficulty} Task
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.subtitle}</span>
                          <h3 style={{ fontSize: '1.05rem', margin: '4px 0 0', color: 'var(--text-primary)' }}>{t.title}</h3>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#8B5CF6', fontWeight: 600, flexShrink: 0 }}>
                          Practice Task →
                        </span>
                      </div>
                      {t.description && (
                        <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '6px 0 0', lineHeight: '1.4' }}>
                          {t.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 5. MCQS SECTION */}
            {(activeType === 'all' || activeType === 'mcqs') && mcqsList.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <FiAward style={{ color: '#EC4899' }} />
                  <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Published MCQs ({mcqsList.length})</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {mcqsList.map((m) => (
                    <Link
                      key={m._id}
                      to={m.url}
                      className="card search-result-card"
                      style={{ padding: '1rem 1.25rem', textDecoration: 'none', color: 'inherit', borderLeft: '4px solid #EC4899' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, marginRight: '8px' }}>
                            {m.difficulty} MCQ
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.subtitle}</span>
                          <h3 style={{ fontSize: '1rem', margin: '4px 0 0', color: 'var(--text-primary)', fontWeight: 600 }}>
                            {m.question}
                          </h3>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#EC4899', fontWeight: 600, flexShrink: 0 }}>
                          Practice MCQ →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
