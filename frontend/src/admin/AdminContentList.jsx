import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FiBookOpen,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiHelpCircle,
  FiCode,
  FiSearch,
  FiFilter,
  FiUploadCloud,
  FiEye,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiChevronDown,
  FiExternalLink,
  FiVideo,
  FiShield,
  FiLayers,
} from 'react-icons/fi'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import { AdminSide } from './AdminDashboard.jsx'

export default function AdminContentList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get('courseId') || '')
  const [modules, setModules] = useState([])
  const [lectures, setLectures] = useState([])
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, missing: 0, failed: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [moduleFilter, setModuleFilter] = useState(searchParams.get('module') || 'all')
  const [searchQuery, setSearchQuery] = useState('')

  // Bulk Selection
  const [selectedLectureIds, setSelectedLectureIds] = useState([])
  const [bulkPublishModalOpen, setBulkPublishModalOpen] = useState(false)
  const [bulkPublishing, setBulkPublishing] = useState(false)

  // Unpublish Confirmation Modal
  const [unpublishModalData, setUnpublishModalData] = useState(null) // { lectureId, title, lectureNumber }
  const [unpublishing, setUnpublishing] = useState(false)

  // Quick Action in progress
  const [actionInProgress, setActionInProgress] = useState(null)

  // Fetch all courses on initial load
  useEffect(() => {
    let isMounted = true
    api
      .get('/courses/all-courses?limit=100')
      .then(({ data }) => {
        if (!isMounted) return
        const list = data.courses || []
        setCourses(list)
        if (list.length > 0 && !selectedCourseId) {
          const defaultId = list[0]._id
          setSelectedCourseId(defaultId)
          updateUrlParams({ courseId: defaultId })
        }
      })
      .catch((err) => {
        if (isMounted) setError(messageFrom(err))
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Load content catalog when course, module, status or search changes
  useEffect(() => {
    if (!selectedCourseId) return
    loadCatalog()
  }, [selectedCourseId, moduleFilter, statusFilter])

  const updateUrlParams = (params) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(params).forEach(([k, v]) => {
      if (v && v !== 'all') {
        next.set(k, v)
      } else {
        next.delete(k)
      }
    })
    setSearchParams(next, { replace: true })
  }

  const loadCatalog = () => {
    setLoading(true)
    setError('')
    setSelectedLectureIds([])

    const params = new URLSearchParams()
    if (selectedCourseId) params.append('courseId', selectedCourseId)
    if (moduleFilter !== 'all') params.append('moduleId', moduleFilter)
    if (statusFilter !== 'all') params.append('status', statusFilter)

    api
      .get(`/admin/content?${params.toString()}`)
      .then(({ data }) => {
        setLectures(data.lectures || [])
        setModules(data.modules || [])
        setStats(data.stats || { total: 0, published: 0, draft: 0, missing: 0, failed: 0 })
      })
      .catch((err) => {
        setError(messageFrom(err))
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // Handle course change
  const handleCourseChange = (id) => {
    setSelectedCourseId(id)
    setModuleFilter('all')
    updateUrlParams({ courseId: id, module: 'all' })
  }

  // Handle status filter tab click
  const handleStatusFilter = (st) => {
    setStatusFilter(st)
    updateUrlParams({ status: st })
  }

  // Filter lectures in memory by search query
  const filteredLectures = useMemo(() => {
    if (!searchQuery.trim()) return lectures
    const q = searchQuery.toLowerCase().trim()
    return lectures.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        String(l.lectureNumber).includes(q) ||
        l.moduleTitle.toLowerCase().includes(q)
    )
  }, [lectures, searchQuery])

  // Bulk Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLectureIds(filteredLectures.map((l) => l._id))
    } else {
      setSelectedLectureIds([])
    }
  }

  const toggleSelectLecture = (id) => {
    setSelectedLectureIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Single Lecture Publish
  const handlePublishLecture = async (lectureId) => {
    setActionInProgress(lectureId)
    try {
      const res = await api.post(`/admin/content/${lectureId}/publish`)
      toast.success(res.data.message || 'Lecture content published to live students!')
      loadCatalog()
    } catch (err) {
      const errData = err.response?.data
      if (errData?.errors && errData.errors.length > 0) {
        toast.error(`Publish failed: ${errData.errors[0]}`)
      } else {
        toast.error(messageFrom(err))
      }
    } finally {
      setActionInProgress(null)
    }
  }

  // Single Lecture Unpublish
  const handleConfirmUnpublish = async () => {
    if (!unpublishModalData) return
    setUnpublishing(true)
    try {
      const res = await api.post(`/admin/content/${unpublishModalData.lectureId}/unpublish`)
      toast.success(res.data.message || 'Content unpublished successfully. Now hidden from students.')
      setUnpublishModalData(null)
      loadCatalog()
    } catch (err) {
      toast.error(messageFrom(err))
    } finally {
      setUnpublishing(false)
    }
  }

  // Bulk Publish Action
  const handleConfirmBulkPublish = async () => {
    if (selectedLectureIds.length === 0) return
    setBulkPublishing(true)
    try {
      const res = await api.post('/admin/content/bulk-publish', {
        lectureIds: selectedLectureIds,
      })
      toast.success(res.data.message || 'Selected lectures published successfully!')
      setBulkPublishModalOpen(false)
      setSelectedLectureIds([])
      loadCatalog()
    } catch (err) {
      const errData = err.response?.data
      if (errData?.invalidLectures && errData.invalidLectures.length > 0) {
        const first = errData.invalidLectures[0]
        toast.error(`Validation error in Lecture #${first.lectureNumber || '?'}: ${first.errors[0]}`)
      } else {
        toast.error(messageFrom(err))
      }
    } finally {
      setBulkPublishing(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <FiCheckCircle size={12} /> Published
          </span>
        )
      case 'draft':
        return (
          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <FiClock size={12} /> Draft
          </span>
        )
      case 'failed':
        return (
          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <FiAlertTriangle size={12} /> Failed
          </span>
        )
      default:
        return (
          <span className="badge" style={{ background: 'var(--line)', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Missing
          </span>
        )
    }
  }

  const getComponentBadge = (status, count, label) => {
    if (status === 'published') {
      return (
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          ✓ {label} {count ? `(${count})` : ''}
        </span>
      )
    }
    if (status === 'draft') {
      return (
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: 'rgba(245, 158, 11, 0.14)', color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          ⏱ {label} {count ? `(${count})` : ''}
        </span>
      )
    }
    return (
      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: 'var(--line)', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
        ○ {label}
      </span>
    )
  }

  return (
    <div className="dashboard-layout">
      <AdminSide />
      <main className="dashboard-main" style={{ maxWidth: 1280 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div>
            <span className="eyebrow">Curriculum Review & Approval</span>
            <h1 style={{ margin: '4px 0 8px', fontSize: 26, fontWeight: 800 }}>
              Content Review & Publishing
            </h1>
            <p className="muted" style={{ fontSize: 14 }}>
              Review generated educational notes, practice tasks, and MCQs before approving live to students.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/admin/ai-content" className="btn btn-secondary" style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <FiLayers size={14} /> AI Generation Studio
            </Link>
            <button
              type="button"
              className="btn btn-outline"
              onClick={loadCatalog}
              disabled={loading}
              style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <FiRefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Top Filter Bar: Course Selector + Summary Stats */}
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Course Dropdown */}
            <div style={{ flex: '1 1 320px' }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
                Select Course
              </label>
              <select
                className="input-field"
                value={selectedCourseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', fontWeight: 600, fontSize: 14 }}
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} ({c.level || 'All Levels'})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Stat Badges */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ padding: '8px 14px', background: 'var(--bg-surface, rgba(0,0,0,0.02))', borderRadius: 8, border: '1px solid var(--line)', textAlign: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total</span>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{stats.total}</div>
              </div>
              <div style={{ padding: '8px 14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 8, border: '1px solid rgba(16, 185, 129, 0.25)', textAlign: 'center' }}>
                <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>Published</span>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>{stats.published}</div>
              </div>
              <div style={{ padding: '8px 14px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: 8, border: '1px solid rgba(245, 158, 11, 0.25)', textAlign: 'center' }}>
                <span style={{ fontSize: 11, color: '#d97706', fontWeight: 700, textTransform: 'uppercase' }}>Drafts</span>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#d97706' }}>{stats.draft}</div>
              </div>
              <div style={{ padding: '8px 14px', background: 'var(--bg-surface, rgba(0,0,0,0.02))', borderRadius: 8, border: '1px solid var(--line)', textAlign: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Missing</span>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--muted)' }}>{stats.missing}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls: Tabs + Module Selector + Search Box */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-surface, rgba(0,0,0,0.04))', padding: 4, borderRadius: 8, border: '1px solid var(--line)' }}>
            {[
              { key: 'all', label: 'All Content' },
              { key: 'draft', label: `Drafts (${stats.draft})` },
              { key: 'published', label: `Published (${stats.published})` },
              { key: 'missing', label: `Missing (${stats.missing})` },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleStatusFilter(tab.key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: statusFilter === tab.key ? 700 : 500,
                  border: 'none',
                  background: statusFilter === tab.key ? 'var(--bg-white)' : 'transparent',
                  color: statusFilter === tab.key ? 'var(--text-heading)' : 'var(--muted)',
                  boxShadow: statusFilter === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Module Selector & Search */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flex: '1 1 360px', justifyContent: 'flex-end' }}>
            <div style={{ minWidth: 170 }}>
              <select
                className="input-field"
                value={moduleFilter}
                onChange={(e) => {
                  setModuleFilter(e.target.value)
                  updateUrlParams({ module: e.target.value })
                }}
                style={{ width: '100%', padding: '7px 10px', fontSize: 13 }}
              >
                <option value="all">All Modules</option>
                {modules.map((m) => (
                  <option key={m.moduleNumber} value={m.moduleNumber}>
                    Module {m.moduleNumber}: {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ position: 'relative', minWidth: 200 }}>
              <FiSearch
                size={14}
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
              />
              <input
                type="text"
                placeholder="Search lectures..."
                className="input-field"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 30, paddingRight: 10, paddingTop: 7, paddingBottom: 7, fontSize: 13, width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Bulk Action Bar (when lectures are checked) */}
        {selectedLectureIds.length > 0 && (
          <div
            style={{
              padding: '12px 18px',
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, color: 'var(--text-heading)' }}>
              <span>✓ {selectedLectureIds.length} lectures selected</span>
              <span className="muted" style={{ fontWeight: 400 }}>
                (from {filteredLectures.length} visible)
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedLectureIds([])}
                style={{ padding: '6px 12px', fontSize: 12.5 }}
              >
                Deselect All
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setBulkPublishModalOpen(true)}
                style={{ padding: '6px 16px', fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <FiUploadCloud size={14} /> Publish Selected ({selectedLectureIds.length})
              </button>
            </div>
          </div>
        )}

        {/* Lectures Table */}
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Loader />
            <p className="muted" style={{ marginTop: 12 }}>Loading content catalog...</p>
          </div>
        ) : error ? (
          <div className="card" style={{ padding: 30, textAlign: 'center', borderColor: '#ef4444' }}>
            <FiAlertTriangle size={32} color="#ef4444" style={{ marginBottom: 12 }} />
            <h3 style={{ margin: '0 0 6px' }}>Failed to load content</h3>
            <p className="muted">{error}</p>
            <button type="button" className="btn btn-secondary" onClick={loadCatalog} style={{ marginTop: 14 }}>
              Retry
            </button>
          </div>
        ) : filteredLectures.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <FiBookOpen size={36} className="muted" style={{ marginBottom: 12 }} />
            <h3 style={{ margin: '0 0 6px' }}>No lectures matched</h3>
            <p className="muted" style={{ fontSize: 14, maxWidth: 440, margin: '0 auto 16px' }}>
              No lectures match your current filters. Try changing your status or module filter.
            </p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setStatusFilter('all')
                setModuleFilter('all')
                setSearchQuery('')
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface, rgba(0,0,0,0.02))', borderBottom: '1px solid var(--line)' }}>
                    <th style={{ padding: '12px 16px', width: 40, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={
                          filteredLectures.length > 0 &&
                          selectedLectureIds.length === filteredLectures.length
                        }
                        onChange={handleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ padding: '12px 14px', width: 60, fontWeight: 700, color: 'var(--muted)' }}>#</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--muted)' }}>Lecture Title</th>
                    <th style={{ padding: '12px 14px', width: 140, fontWeight: 700, color: 'var(--muted)' }}>Module</th>
                    <th style={{ padding: '12px 14px', width: 220, fontWeight: 700, color: 'var(--muted)' }}>Components</th>
                    <th style={{ padding: '12px 14px', width: 110, fontWeight: 700, color: 'var(--muted)' }}>Status</th>
                    <th style={{ padding: '12px 14px', width: 150, fontWeight: 700, color: 'var(--muted)' }}>Audit Info</th>
                    <th style={{ padding: '12px 16px', width: 180, fontWeight: 700, color: 'var(--muted)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLectures.map((lec) => {
                    const isSelected = selectedLectureIds.includes(lec._id)
                    const isPublishableDraft = lec.status === 'draft' && (lec.notesStatus === 'draft' || lec.tasksStatus === 'draft' || lec.mcqsStatus === 'draft')
                    const isPublished = lec.status === 'published'

                    return (
                      <tr
                        key={lec._id}
                        style={{
                          borderBottom: '1px solid var(--line)',
                          background: isSelected ? 'rgba(59, 130, 246, 0.04)' : 'transparent',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectLecture(lec._id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>

                        {/* Number */}
                        <td style={{ padding: '14px 14px', fontWeight: 800, color: 'var(--muted)' }}>
                          {lec.lectureNumber}
                        </td>

                        {/* Title & Video preview */}
                        <td style={{ padding: '14px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div>
                              <Link
                                to={`/admin/content/${lec._id}`}
                                style={{
                                  fontWeight: 700,
                                  color: 'var(--text-heading)',
                                  textDecoration: 'none',
                                  lineHeight: 1.35,
                                  display: 'block',
                                }}
                                className="hover-link"
                              >
                                {lec.title}
                              </Link>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, fontSize: 12, color: 'var(--muted)' }}>
                                {lec.duration && <span>⏱ {lec.duration}</span>}
                                {lec.hasTranscript && (
                                  <span style={{ color: '#10b981', fontWeight: 600 }}>
                                    ✓ Transcript
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Module */}
                        <td style={{ padding: '14px 14px', fontSize: 12.5, color: 'var(--muted)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-heading)', display: 'block' }}>
                            Mod {lec.moduleNumber}
                          </span>
                          <span style={{ fontSize: 11 }}>{lec.moduleTitle.replace(/^Module \d+:\s*/i, '')}</span>
                        </td>

                        {/* Component Breakdown */}
                        <td style={{ padding: '14px 14px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {getComponentBadge(lec.notesStatus, null, 'Notes')}
                            {getComponentBadge(lec.tasksStatus, lec.tasksCount, 'Tasks')}
                            {getComponentBadge(lec.mcqsStatus, lec.mcqsCount, 'MCQs')}
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '14px 14px' }}>
                          {getStatusBadge(lec.status)}
                        </td>

                        {/* Audit Info */}
                        <td style={{ padding: '14px 14px', fontSize: 11.5, color: 'var(--muted)' }}>
                          {lec.publishedBy ? (
                            <div>
                              <strong style={{ color: 'var(--text-heading)', display: 'block' }}>
                                Published
                              </strong>
                              <span>by {lec.publishedBy.name || 'Admin'}</span>
                            </div>
                          ) : lec.reviewedBy ? (
                            <div>
                              <strong style={{ color: '#d97706', display: 'block' }}>
                                Reviewed Draft
                              </strong>
                              <span>by {lec.reviewedBy.name || 'Admin'}</span>
                            </div>
                          ) : (
                            <span style={{ fontStyle: 'italic' }}>Pending review</span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Link
                              to={`/admin/content/${lec._id}`}
                              className="btn btn-outline"
                              style={{ padding: '6px 12px', fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <FiEye size={13} /> Review / Edit
                            </Link>

                            {isPublishableDraft && (
                              <button
                                type="button"
                                className="btn"
                                onClick={() => handlePublishLecture(lec._id)}
                                disabled={actionInProgress === lec._id}
                                style={{
                                  background: '#10b981',
                                  color: '#fff',
                                  padding: '6px 10px',
                                  fontSize: 12.5,
                                  border: 'none',
                                  borderRadius: 6,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  cursor: 'pointer',
                                }}
                                title="Approve & Publish to live students"
                              >
                                <FiUploadCloud size={13} /> Publish
                              </button>
                            )}

                            {isPublished && (
                              <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() =>
                                  setUnpublishModalData({
                                    lectureId: lec._id,
                                    title: lec.title,
                                    lectureNumber: lec.lectureNumber,
                                  })
                                }
                                style={{
                                  padding: '6px 10px',
                                  fontSize: 12,
                                  color: '#ef4444',
                                  borderColor: 'rgba(239, 68, 68, 0.4)',
                                }}
                                title="Unpublish from live students"
                              >
                                Unpublish
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Unpublish Confirmation Modal */}
        {unpublishModalData && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(3px)',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <div
              className="card"
              style={{
                width: '100%',
                maxWidth: 480,
                padding: 24,
                boxShadow: 'var(--shadow-xl)',
                animation: 'scaleIn 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444',
                  }}
                >
                  <FiAlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                    Unpublish Lecture #{unpublishModalData.lectureNumber}?
                  </h3>
                  <span className="muted" style={{ fontSize: 13 }}>{unpublishModalData.title}</span>
                </div>
              </div>

              <p style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-body)', margin: '12px 0 20px' }}>
                This action will revert the content status to <strong>Draft</strong>. Students will no longer see these notes, tasks, or MCQs on the platform until published again. The content will NOT be deleted.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setUnpublishModalData(null)}
                  disabled={unpublishing}
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={handleConfirmUnpublish}
                  disabled={unpublishing}
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    padding: '8px 18px',
                    fontSize: 13,
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: 6,
                  }}
                >
                  {unpublishing ? 'Unpublishing...' : 'Confirm Unpublish'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Publish Confirmation Modal */}
        {bulkPublishModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(3px)',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <div
              className="card"
              style={{
                width: '100%',
                maxWidth: 500,
                padding: 24,
                boxShadow: 'var(--shadow-xl)',
                animation: 'scaleIn 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981',
                  }}
                >
                  <FiUploadCloud size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                    Publish {selectedLectureIds.length} Selected Lectures?
                  </h3>
                  <span className="muted" style={{ fontSize: 13 }}>Batch approval to live students</span>
                </div>
              </div>

              <p style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-body)', margin: '12px 0 20px' }}>
                Every selected lecture will undergo strict validation (Notes title, task structures, and valid MCQs with single correct answers). If any lecture fails validation, the batch will be safely cancelled with detailed error feedback.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setBulkPublishModalOpen(false)}
                  disabled={bulkPublishing}
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmBulkPublish}
                  disabled={bulkPublishing}
                  style={{
                    padding: '8px 20px',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {bulkPublishing ? 'Validating & Publishing...' : `Confirm Publish (${selectedLectureIds.length})`}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
