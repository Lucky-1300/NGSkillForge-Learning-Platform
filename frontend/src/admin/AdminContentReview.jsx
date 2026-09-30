import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FiArrowLeft,
  FiBookOpen,
  FiCode,
  FiHelpCircle,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiUploadCloud,
  FiSave,
  FiTrash2,
  FiPlus,
  FiEye,
  FiEdit3,
  FiCheck,
  FiX,
  FiVideo,
  FiExternalLink,
  FiRefreshCw,
  FiShield,
  FiFileText,
} from 'react-icons/fi'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import NotesRenderer from '../components/NotesRenderer.jsx'
import { AdminSide } from './AdminDashboard.jsx'

export default function AdminContentReview() {
  const { lectureId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('notes') // 'notes' | 'tasks' | 'mcqs' | 'preview'

  // Data State
  const [lectureData, setLectureData] = useState(null)
  const [courseData, setCourseData] = useState(null)
  const [moduleData, setModuleData] = useState(null)
  const [rawContent, setRawContent] = useState(null)

  // Editable Form State
  const [notesText, setNotesText] = useState('')
  const [notesTitle, setNotesTitle] = useState('')
  const [notesOverview, setNotesOverview] = useState('')
  const [importantPoints, setImportantPoints] = useState([])
  const [keyTakeaways, setKeyTakeaways] = useState([])
  const [sections, setSections] = useState([])
  const [tasks, setTasks] = useState([])
  const [mcqs, setMcqs] = useState([])

  // Markdown live preview mode toggle
  const [notesPreviewMode, setNotesPreviewMode] = useState(false)

  // Action status
  const [savingDraft, setSavingDraft] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [unpublishing, setUnpublishing] = useState(false)
  const [unpublishModalOpen, setUnpublishModalOpen] = useState(false)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null) // { type: 'task' | 'mcq', index, id }

  // Validation report
  const [validationErrors, setValidationErrors] = useState([])

  useEffect(() => {
    loadLectureContent()
  }, [lectureId])

  const loadLectureContent = () => {
    setLoading(true)
    setError('')
    api
      .get(`/admin/content/${lectureId}`)
      .then(({ data }) => {
        setLectureData(data.lecture)
        setCourseData(data.course)
        setModuleData(data.module)
        setRawContent(data.content)

        // Initialize form fields
        const c = data.content || {}
        setNotesText(c.notes || '')
        setNotesTitle(c.structuredNotes?.title || data.lecture.title || '')
        setNotesOverview(c.structuredNotes?.overview || '')
        setImportantPoints(c.structuredNotes?.importantPoints || c.importantPoints || [])
        setKeyTakeaways(c.structuredNotes?.keyTakeaways || c.keyTakeaways || [])
        setSections(c.structuredNotes?.sections || [])
        setTasks(c.tasks || [])
        setMcqs(c.mcqs || [])

        if (data.validation && !data.validation.isValid) {
          setValidationErrors(data.validation.errors || [])
        } else {
          setValidationErrors([])
        }
      })
      .catch((err) => {
        setError(messageFrom(err))
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // Real-time client validation
  const validateCurrentState = () => {
    const errs = []
    // Notes validation
    if (!notesTitle.trim() && !notesText.trim()) {
      errs.push('Notes require a title or content.')
    }
    // Tasks validation
    tasks.forEach((t, i) => {
      if (!t.title || !t.title.trim()) errs.push(`Task #${i + 1} is missing a title.`)
      if (!t.description || !t.description.trim()) errs.push(`Task #${i + 1} is missing a description.`)
    })
    // MCQs validation
    mcqs.forEach((q, i) => {
      if (!q.question || !q.question.trim()) errs.push(`MCQ #${i + 1} question cannot be blank.`)
      if (!q.options || q.options.length < 2) {
        errs.push(`MCQ #${i + 1} must have at least 2 options.`)
      } else {
        const hasBlank = q.options.some((opt) => !opt || !String(opt).trim())
        if (hasBlank) errs.push(`MCQ #${i + 1} has blank option fields.`)
        const idx = Number(q.correctAnswer)
        if (isNaN(idx) || idx < 0 || idx >= q.options.length) {
          errs.push(`MCQ #${i + 1} has an invalid correct answer index.`)
        }
      }
    })

    if (!notesText.trim() && tasks.length === 0 && mcqs.length === 0) {
      errs.push('At least Notes, Tasks, or MCQs must have content.')
    }

    setValidationErrors(errs)
    return errs.length === 0
  }

  // Save Draft Action (keeps status = 'draft')
  const handleSaveDraft = async () => {
    setSavingDraft(true)
    try {
      const payload = {
        notes: notesText,
        structuredNotes: {
          title: notesTitle,
          overview: notesOverview,
          sections,
          importantPoints,
          keyTakeaways,
        },
        importantPoints,
        keyTakeaways,
        tasks,
        mcqs,
      }

      const res = await api.put(`/admin/content/${lectureId}/draft`, payload)
      setRawContent(res.data.content)
      toast.success('Changes saved as Draft successfully (Not published)')
      validateCurrentState()
    } catch (err) {
      toast.error(messageFrom(err))
    } finally {
      setSavingDraft(false)
    }
  }

  // Publish Action (Transitions status = 'published')
  const handlePublish = async () => {
    // First save any unsaved draft edits
    setPublishing(true)
    try {
      const payload = {
        notes: notesText,
        structuredNotes: {
          title: notesTitle,
          overview: notesOverview,
          sections,
          importantPoints,
          keyTakeaways,
        },
        importantPoints,
        keyTakeaways,
        tasks,
        mcqs,
      }
      await api.put(`/admin/content/${lectureId}/draft`, payload)

      // Execute explicit publish
      const res = await api.post(`/admin/content/${lectureId}/publish`)
      setRawContent(res.data.content)
      setValidationErrors([])
      toast.success(`Lecture #${lectureData.lectureNumber} published to live students!`)
    } catch (err) {
      const errData = err.response?.data
      if (errData?.errors && errData.errors.length > 0) {
        setValidationErrors(errData.errors)
        toast.error(`Publishing blocked: ${errData.errors[0]}`)
      } else {
        toast.error(messageFrom(err))
      }
    } finally {
      setPublishing(false)
    }
  }

  // Unpublish Action (Reverts status = 'draft')
  const handleConfirmUnpublish = async () => {
    setUnpublishing(true)
    try {
      const res = await api.post(`/admin/content/${lectureId}/unpublish`)
      setRawContent(res.data.content)
      setUnpublishModalOpen(false)
      toast.success('Content unpublished. Now in draft state and hidden from students.')
    } catch (err) {
      toast.error(messageFrom(err))
    } finally {
      setUnpublishing(false)
    }
  }

  // Task Handlers
  const handleAddTask = () => {
    const newTask = {
      title: `Practice Challenge ${tasks.length + 1}`,
      description: 'Write the code to complete the challenge requirements.',
      difficulty: 'Easy',
      expectedLearningOutcome: 'Master core syntax and problem solving.',
      starterCode: '// Starter code here\n',
      solution: '',
      requirements: [],
      hints: [],
    }
    setTasks([...tasks, newTask])
  }

  const handleUpdateTask = (idx, field, val) => {
    const next = [...tasks]
    next[idx] = { ...next[idx], [field]: val }
    setTasks(next)
  }

  const handleDeleteTaskConfirmed = () => {
    if (!deleteConfirmModal) return
    const next = tasks.filter((_, i) => i !== deleteConfirmModal.index)
    setTasks(next)
    setDeleteConfirmModal(null)
    toast.info('Task removed from draft.')
  }

  // MCQ Handlers
  const handleAddMCQ = () => {
    const newMCQ = {
      question: 'What is the expected output or behavior?',
      difficulty: 'Medium',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'Explanation for why this answer is correct.',
      codeSnippet: '',
    }
    setMcqs([...mcqs, newMCQ])
  }

  const handleUpdateMCQ = (idx, field, val) => {
    const next = [...mcqs]
    next[idx] = { ...next[idx], [field]: val }
    setMcqs(next)
  }

  const handleMCQOptionChange = (qIdx, optIdx, val) => {
    const next = [...mcqs]
    const nextOpts = [...(next[qIdx].options || [])]
    nextOpts[optIdx] = val
    next[qIdx] = { ...next[qIdx], options: nextOpts }
    setMcqs(next)
  }

  const handleAddMCQOption = (qIdx) => {
    const next = [...mcqs]
    const nextOpts = [...(next[qIdx].options || []), `Option ${next[qIdx].options.length + 1}`]
    next[qIdx] = { ...next[qIdx], options: nextOpts }
    setMcqs(next)
  }

  const handleRemoveMCQOption = (qIdx, optIdx) => {
    const next = [...mcqs]
    const currentOpts = next[qIdx].options || []
    if (currentOpts.length <= 2) {
      toast.warning('MCQs must have at least 2 options.')
      return
    }
    const nextOpts = currentOpts.filter((_, i) => i !== optIdx)
    let correct = next[qIdx].correctAnswer
    if (correct >= nextOpts.length) {
      correct = 0
    }
    next[qIdx] = { ...next[qIdx], options: nextOpts, correctAnswer: correct }
    setMcqs(next)
  }

  const handleDeleteMCQConfirmed = () => {
    if (!deleteConfirmModal) return
    const next = mcqs.filter((_, i) => i !== deleteConfirmModal.index)
    setMcqs(next)
    setDeleteConfirmModal(null)
    toast.info('MCQ removed from draft.')
  }

  // Array item helper (Important Points / Key Takeaways)
  const handleAddItem = (type) => {
    if (type === 'points') {
      setImportantPoints([...importantPoints, 'New key point'])
    } else {
      setKeyTakeaways([...keyTakeaways, 'New summary takeaway'])
    }
  }

  const handleUpdateItem = (type, idx, val) => {
    if (type === 'points') {
      const next = [...importantPoints]
      next[idx] = val
      setImportantPoints(next)
    } else {
      const next = [...keyTakeaways]
      next[idx] = val
      setKeyTakeaways(next)
    }
  }

  const handleRemoveItem = (type, idx) => {
    if (type === 'points') {
      setImportantPoints(importantPoints.filter((_, i) => i !== idx))
    } else {
      setKeyTakeaways(keyTakeaways.filter((_, i) => i !== idx))
    }
  }

  const isPublished = rawContent?.status === 'published'

  if (loading) {
    return (
      <div className="dashboard-layout">
        <AdminSide />
        <main className="dashboard-main" style={{ padding: 60, textAlign: 'center' }}>
          <Loader />
          <p className="muted" style={{ marginTop: 12 }}>Loading lecture review workspace...</p>
        </main>
      </div>
    )
  }

  if (error || !lectureData) {
    return (
      <div className="dashboard-layout">
        <AdminSide />
        <main className="dashboard-main" style={{ maxWidth: 900 }}>
          <div className="card" style={{ padding: 32, textAlign: 'center', borderColor: '#ef4444' }}>
            <FiAlertTriangle size={36} color="#ef4444" style={{ marginBottom: 12 }} />
            <h3>Unable to load lecture</h3>
            <p className="muted">{error || 'Lecture not found'}</p>
            <Link to="/admin/content" className="btn btn-secondary" style={{ marginTop: 16 }}>
              <FiArrowLeft /> Back to Content Review
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <AdminSide />
      <main className="dashboard-main" style={{ maxWidth: 1280 }}>
        {/* Top Breadcrumb & Return Link */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Link
            to={`/admin/content?courseId=${courseData?._id}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontWeight: 600 }}
          >
            <FiArrowLeft /> Back to Course Content
          </Link>

          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
            {courseData?.title} &gt; Module {moduleData?.moduleNumber} &gt; Lecture #{lectureData.lectureNumber}
          </span>
        </div>

        {/* Top Header Card */}
        <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ flex: '1 1 500px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Lecture #{lectureData.lectureNumber}
                </span>
                {isPublished ? (
                  <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <FiCheckCircle size={12} /> Live Published
                  </span>
                ) : (
                  <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <FiClock size={12} /> Draft Mode
                  </span>
                )}
                {rawContent?.sourceContext?.transcriptAvailable && (
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 4 }}>
                    ✓ Transcript Grounded
                  </span>
                )}
              </div>

              <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800 }}>
                {lectureData.title}
              </h1>

              {/* Audit Metadata */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12.5, color: 'var(--muted)', marginTop: 8 }}>
                {lectureData.duration && <span>⏱ Duration: {lectureData.duration}</span>}
                {rawContent?.reviewedBy && (
                  <span>
                    Reviewed by <strong>{rawContent.reviewedBy.name || 'Admin'}</strong>
                  </span>
                )}
                {rawContent?.publishedAt && isPublished && (
                  <span>
                    Published on {new Date(rawContent.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSaveDraft}
                disabled={savingDraft || publishing}
                style={{ padding: '8px 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <FiSave size={14} /> {savingDraft ? 'Saving...' : 'Save Draft'}
              </button>

              {isPublished ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setUnpublishModalOpen(true)}
                  disabled={unpublishing}
                  style={{ padding: '8px 14px', fontSize: 13, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                >
                  Unpublish
                </button>
              ) : null}

              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePublish}
                disabled={publishing || savingDraft}
                style={{
                  padding: '8px 20px',
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#10b981',
                  borderColor: '#10b981',
                }}
              >
                <FiUploadCloud size={15} /> {publishing ? 'Publishing...' : 'Approve & Publish'}
              </button>
            </div>
          </div>

          {/* Validation Errors Box (if any) */}
          {validationErrors.length > 0 && (
            <div
              style={{
                marginTop: 16,
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                <FiAlertTriangle size={15} /> Please address the following issues before publishing:
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12.5, color: '#ef4444' }}>
                {validationErrors.map((err, idx) => (
                  <li key={idx} style={{ marginTop: 2 }}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Video Embed Collapsible Preview */}
        {lectureData.youtubeVideoId && (
          <details className="card" style={{ padding: '14px 20px', marginBottom: 20 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiVideo color="#ef4444" /> Watch YouTube Video Source ({lectureData.duration || 'Video'})
            </summary>
            <div style={{ marginTop: 14, maxWidth: 640, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line)' }}>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={`https://www.youtube.com/embed/${lectureData.youtubeVideoId}`}
                  title={lectureData.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </details>
        )}

        {/* Section Tabs Navigation */}
        <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--line)', marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            style={{
              padding: '10px 18px',
              fontSize: 14,
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'notes' ? '3px solid #3b82f6' : '3px solid transparent',
              color: activeTab === 'notes' ? '#3b82f6' : 'var(--muted)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <FiBookOpen size={16} /> 📖 Notes & Summary
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            style={{
              padding: '10px 18px',
              fontSize: 14,
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'tasks' ? '3px solid #a855f7' : '3px solid transparent',
              color: activeTab === 'tasks' ? '#a855f7' : 'var(--muted)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <FiCode size={16} /> 💻 Practice Tasks ({tasks.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mcqs')}
            style={{
              padding: '10px 18px',
              fontSize: 14,
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'mcqs' ? '3px solid #ec4899' : '3px solid transparent',
              color: activeTab === 'mcqs' ? '#ec4899' : 'var(--muted)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <FiHelpCircle size={16} /> 📝 MCQs ({mcqs.length})
          </button>
        </div>

        {/* TAB 1: NOTES REVIEW & EDITOR */}
        {activeTab === 'notes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Title & Overview Editor */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800 }}>
                Notes Header & Concept Overview
              </h3>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                  Lecture Notes Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={notesTitle}
                  onChange={(e) => setNotesTitle(e.target.value)}
                  style={{ width: '100%', fontWeight: 700, fontSize: 15 }}
                  placeholder="e.g. Introduction to JavaScript Variables & Data Types"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                  Concept Overview / Intro Summary
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={notesOverview}
                  onChange={(e) => setNotesOverview(e.target.value)}
                  style={{ width: '100%', fontSize: 13.5, lineHeight: 1.5 }}
                  placeholder="Brief synopsis of what this lecture covers..."
                />
              </div>
            </div>

            {/* Markdown Body Editor with Live Preview Toggle */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
                    Markdown Educational Notes
                  </h3>
                  <span className="muted" style={{ fontSize: 12 }}>
                    Full Markdown supported (headings `##`, code blocks ````javascript`, callouts `&gt;`)
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setNotesPreviewMode(!notesPreviewMode)}
                  style={{ padding: '6px 14px', fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <FiEye size={13} /> {notesPreviewMode ? 'Switch to Edit' : 'Live Preview'}
                </button>
              </div>

              {notesPreviewMode ? (
                <div style={{ padding: 20, background: 'var(--bg-surface, rgba(0,0,0,0.02))', borderRadius: 8, border: '1px solid var(--line)', minHeight: 300 }}>
                  <NotesRenderer markdown={notesText} />
                </div>
              ) : (
                <textarea
                  className="input-field"
                  rows={14}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  style={{
                    width: '100%',
                    fontFamily: 'monospace',
                    fontSize: 13,
                    lineHeight: 1.5,
                    padding: 14,
                  }}
                  placeholder="## Concept Name&#10;&#10;Explain the topic in depth...&#10;&#10;```javascript&#10;const x = 10;&#10;```"
                />
              )}
            </div>

            {/* Key Takeaways & Important Points Manager */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Key Takeaways */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <strong style={{ fontSize: 14 }}>🎯 Key Takeaways</strong>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => handleAddItem('takeaways')}
                    style={{ padding: '4px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <FiPlus size={12} /> Add
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {keyTakeaways.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="text"
                        className="input-field"
                        value={item}
                        onChange={(e) => handleUpdateItem('takeaways', idx, e.target.value)}
                        style={{ flex: 1, padding: '6px 10px', fontSize: 13 }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem('takeaways', idx)}
                        style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {keyTakeaways.length === 0 && (
                    <span className="muted" style={{ fontSize: 12.5, fontStyle: 'italic' }}>
                      No key takeaways defined.
                    </span>
                  )}
                </div>
              </div>

              {/* Important Points */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <strong style={{ fontSize: 14 }}>💡 Important Points / Gotchas</strong>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => handleAddItem('points')}
                    style={{ padding: '4px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <FiPlus size={12} /> Add
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {importantPoints.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="text"
                        className="input-field"
                        value={item}
                        onChange={(e) => handleUpdateItem('points', idx, e.target.value)}
                        style={{ flex: 1, padding: '6px 10px', fontSize: 13 }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem('points', idx)}
                        style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {importantPoints.length === 0 && (
                    <span className="muted" style={{ fontSize: 12.5, fontStyle: 'italic' }}>
                      No important points defined.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TASKS REVIEW & EDITOR */}
        {activeTab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
                  Practice Coding Tasks & Challenges
                </h3>
                <span className="muted" style={{ fontSize: 12.5 }}>
                  Hands-on challenges that students will solve in the code editor.
                </span>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddTask}
                style={{ padding: '8px 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <FiPlus size={14} /> Add New Task
              </button>
            </div>

            {tasks.map((task, idx) => (
              <div key={idx} className="card" style={{ padding: 22, borderLeft: '4px solid #a855f7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', padding: '3px 10px', borderRadius: 4 }}>
                      Task #{idx + 1}
                    </span>
                    <strong style={{ fontSize: 15 }}>{task.title || 'Untitled Task'}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmModal({ type: 'task', index: idx, id: task._id })}
                    style={{
                      border: 'none',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <FiTrash2 size={13} /> Delete Task
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                      Task Title <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={task.title || ''}
                      onChange={(e) => handleUpdateTask(idx, 'title', e.target.value)}
                      style={{ width: '100%', fontSize: 13.5 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                      Difficulty
                    </label>
                    <select
                      className="input-field"
                      value={task.difficulty || 'Easy'}
                      onChange={(e) => handleUpdateTask(idx, 'difficulty', e.target.value)}
                      style={{ width: '100%', fontSize: 13.5 }}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                    Task Instructions & Description <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={task.description || ''}
                    onChange={(e) => handleUpdateTask(idx, 'description', e.target.value)}
                    style={{ width: '100%', fontSize: 13 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                      Starter Code Template
                    </label>
                    <textarea
                      className="input-field"
                      rows={5}
                      value={task.starterCode || ''}
                      onChange={(e) => handleUpdateTask(idx, 'starterCode', e.target.value)}
                      style={{ width: '100%', fontFamily: 'monospace', fontSize: 12.5 }}
                      placeholder="// Starter template for student"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                      Solution Code Reference
                    </label>
                    <textarea
                      className="input-field"
                      rows={5}
                      value={task.solution || ''}
                      onChange={(e) => handleUpdateTask(idx, 'solution', e.target.value)}
                      style={{ width: '100%', fontFamily: 'monospace', fontSize: 12.5 }}
                      placeholder="// Reference solution"
                    />
                  </div>
                </div>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                <FiCode size={32} className="muted" style={{ marginBottom: 10 }} />
                <h4 style={{ margin: '0 0 6px' }}>No Practice Tasks</h4>
                <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
                  Add a coding challenge to reinforce this lecture.
                </p>
                <button type="button" className="btn btn-primary" onClick={handleAddTask}>
                  <FiPlus /> Add First Task
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MCQS REVIEW & EDITOR */}
        {activeTab === 'mcqs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
                  Multiple Choice Quizzes (MCQs)
                </h3>
                <span className="muted" style={{ fontSize: 12.5 }}>
                  Interactive knowledge checks with one guaranteed correct answer and explanations.
                </span>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddMCQ}
                style={{ padding: '8px 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <FiPlus size={14} /> Add New MCQ
              </button>
            </div>

            {mcqs.map((q, qIdx) => {
              const options = q.options || []
              const hasAtLeast2 = options.length >= 2
              const correctValid = q.correctAnswer >= 0 && q.correctAnswer < options.length

              return (
                <div key={qIdx} className="card" style={{ padding: 22, borderLeft: '4px solid #ec4899' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899', padding: '3px 10px', borderRadius: 4 }}>
                        Q{qIdx + 1}
                      </span>
                      <strong style={{ fontSize: 14.5 }}>
                        {q.question ? q.question.slice(0, 60) + (q.question.length > 60 ? '...' : '') : 'Untitled Question'}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmModal({ type: 'mcq', index: qIdx, id: q._id })}
                      style={{
                        border: 'none',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <FiTrash2 size={13} /> Delete MCQ
                    </button>
                  </div>

                  {/* Question Text & Difficulty */}
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                        Question Text <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={q.question || ''}
                        onChange={(e) => handleUpdateMCQ(qIdx, 'question', e.target.value)}
                        style={{ width: '100%', fontSize: 13.5, fontWeight: 600 }}
                        placeholder="What is the result of typeof NaN?"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                        Difficulty
                      </label>
                      <select
                        className="input-field"
                        value={q.difficulty || 'Medium'}
                        onChange={(e) => handleUpdateMCQ(qIdx, 'difficulty', e.target.value)}
                        style={{ width: '100%', fontSize: 13.5 }}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Options List with Correct Answer Radio */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                        Answer Options (Select the correct radio option) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => handleAddMCQOption(qIdx)}
                        style={{ padding: '3px 8px', fontSize: 11.5 }}
                      >
                        + Add Option
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {options.map((opt, oIdx) => {
                        const isCorrect = q.correctAnswer === oIdx
                        return (
                          <div
                            key={oIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '8px 12px',
                              borderRadius: 6,
                              background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface, rgba(0,0,0,0.02))',
                              border: isCorrect ? '1.5px solid #10b981' : '1px solid var(--line)',
                            }}
                          >
                            <input
                              type="radio"
                              name={`correct-answer-${qIdx}`}
                              checked={isCorrect}
                              onChange={() => handleUpdateMCQ(qIdx, 'correctAnswer', oIdx)}
                              style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                              title="Mark as correct answer"
                            />
                            <input
                              type="text"
                              className="input-field"
                              value={opt}
                              onChange={(e) => handleMCQOptionChange(qIdx, oIdx, e.target.value)}
                              style={{ flex: 1, padding: '4px 8px', fontSize: 13, background: 'transparent', border: 'none' }}
                              placeholder={`Option ${oIdx + 1}`}
                            />
                            {options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMCQOption(qIdx, oIdx)}
                                style={{ border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', padding: 2 }}
                                title="Remove option"
                              >
                                <FiX size={14} />
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Explanation Field */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                      Correct Answer Explanation / Rationale
                    </label>
                    <textarea
                      className="input-field"
                      rows={2}
                      value={q.explanation || ''}
                      onChange={(e) => handleUpdateMCQ(qIdx, 'explanation', e.target.value)}
                      style={{ width: '100%', fontSize: 13 }}
                      placeholder="Explain why the selected option is correct so students understand..."
                    />
                  </div>
                </div>
              )
            })}

            {mcqs.length === 0 && (
              <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                <FiHelpCircle size={32} className="muted" style={{ marginBottom: 10 }} />
                <h4 style={{ margin: '0 0 6px' }}>No MCQ Quizzes</h4>
                <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
                  Add multiple choice questions to assess student understanding.
                </p>
                <button type="button" className="btn btn-primary" onClick={handleAddMCQ}>
                  <FiPlus /> Add First MCQ
                </button>
              </div>
            )}
          </div>
        )}

        {/* Unpublish Confirmation Modal */}
        {unpublishModalOpen && (
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
            <div className="card" style={{ width: '100%', maxWidth: 460, padding: 24, boxShadow: 'var(--shadow-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                  <FiAlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Unpublish Lecture #{lectureData.lectureNumber}?</h3>
                  <span className="muted" style={{ fontSize: 12.5 }}>{lectureData.title}</span>
                </div>
              </div>

              <p style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-body)', margin: '12px 0 20px' }}>
                Unpublishing will revert the lecture to <strong>Draft</strong> mode. It will immediately disappear from the student learning interface until published again. The content will NOT be deleted.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={() => setUnpublishModalOpen(false)} disabled={unpublishing}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={handleConfirmUnpublish}
                  disabled={unpublishing}
                  style={{ background: '#ef4444', color: '#fff', padding: '8px 18px', fontWeight: 700, borderRadius: 6, border: 'none' }}
                >
                  {unpublishing ? 'Unpublishing...' : 'Confirm Unpublish'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal (Task / MCQ) */}
        {deleteConfirmModal && (
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
            <div className="card" style={{ width: '100%', maxWidth: 440, padding: 24, boxShadow: 'var(--shadow-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                  <FiTrash2 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>
                    Delete {deleteConfirmModal.type === 'task' ? `Task #${deleteConfirmModal.index + 1}` : `MCQ #${deleteConfirmModal.index + 1}`}?
                  </h3>
                  <span className="muted" style={{ fontSize: 12.5 }}>Remove item from draft</span>
                </div>
              </div>

              <p style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-body)', margin: '12px 0 20px' }}>
                Are you sure you want to remove this {deleteConfirmModal.type === 'task' ? 'practice task' : 'MCQ quiz'} from the current draft?
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={() => setDeleteConfirmModal(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={deleteConfirmModal.type === 'task' ? handleDeleteTaskConfirmed : handleDeleteMCQConfirmed}
                  style={{ background: '#ef4444', color: '#fff', padding: '8px 18px', fontWeight: 700, borderRadius: 6, border: 'none' }}
                >
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
