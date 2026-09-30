import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiX, FiBookOpen, FiPlay, FiFileText, FiCheckSquare, FiAward, FiArrowRight } from 'react-icons/fi'
import api from '../services/api.js'

export default function GlobalSearchBox() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const searchContainerRef = useRef(null)

  // Debounced search for live dropdown preview
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed || trimmed.length < 2) {
      setResults(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const handler = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(trimmed)}&limit=5`)
        if (res.data?.success) {
          setResults(res.data)
        }
      } catch (err) {
        console.error('Search preview error:', err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(handler)
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    const clean = query.trim()
    if (clean) {
      // Save to recent searches in localStorage
      try {
        const recents = JSON.parse(localStorage.getItem('ngskillforge_recent_searches') || '[]')
        const updated = [clean, ...recents.filter((r) => r.toLowerCase() !== clean.toLowerCase())].slice(0, 8)
        localStorage.setItem('ngskillforge_recent_searches', JSON.stringify(updated))
      } catch (e) {
        // ignore
      }
      setIsOpen(false)
      navigate(`/search?q=${encodeURIComponent(clean)}`)
    }
  }

  const handleResultClick = (url) => {
    const clean = query.trim()
    if (clean) {
      try {
        const recents = JSON.parse(localStorage.getItem('ngskillforge_recent_searches') || '[]')
        const updated = [clean, ...recents.filter((r) => r.toLowerCase() !== clean.toLowerCase())].slice(0, 8)
        localStorage.setItem('ngskillforge_recent_searches', JSON.stringify(updated))
      } catch (e) {
        // ignore
      }
    }
    setIsOpen(false)
    navigate(url)
  }

  const allItems = [
    ...(results?.results?.courses?.map((i) => ({ ...i, icon: <FiBookOpen />, categoryName: 'Course' })) || []),
    ...(results?.results?.lectures?.map((i) => ({ ...i, icon: <FiPlay />, categoryName: 'Lecture' })) || []),
    ...(results?.results?.notes?.map((i) => ({ ...i, icon: <FiFileText />, categoryName: 'Note' })) || []),
    ...(results?.results?.tasks?.map((i) => ({ ...i, icon: <FiCheckSquare />, categoryName: 'Task' })) || []),
    ...(results?.results?.mcqs?.map((i) => ({ ...i, icon: <FiAward />, categoryName: 'MCQ' })) || []),
  ].slice(0, 6)

  return (
    <div ref={searchContainerRef} className="global-search-container" style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
      <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
        <input
          type="text"
          className="search-input"
          placeholder="Search courses, lectures, notes..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          style={{
            width: '100%',
            padding: '7px 34px 7px 34px',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            background: 'var(--surface-color)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
        />
        <FiSearch
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            pointerEvents: 'none',
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setResults(null)
            }}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <FiX size={14} />
          </button>
        )}
      </form>

      {/* Live Dropdown Preview */}
      {isOpen && query.trim().length >= 2 && (
        <div
          className="search-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            minWidth: '320px',
            background: 'var(--surface-color, #111827)',
            border: '1px solid var(--border-color, #334155)',
            borderRadius: '12px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Searching published content...
            </div>
          ) : allItems.length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No results found for "{query}"
            </div>
          ) : (
            <div>
              <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>
                Top Matches ({results?.totalResults || allItems.length})
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {allItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleResultClick(item.url)}
                    style={{
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.15s ease',
                    }}
                    className="search-dropdown-item"
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#60A5FA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '0.85rem',
                      }}
                    >
                      {item.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title || item.question}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.badge || item.categoryName} {item.subtitle ? `• ${item.subtitle}` : item.courseTitle ? `• ${item.courseTitle}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div
                onClick={handleSearchSubmit}
                style={{
                  padding: '10px 12px',
                  background: 'var(--surface-subtle)',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#3B82F6',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                View all results for "{query}" <FiArrowRight />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
