import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FiAward,
  FiBookOpen,
  FiPlus,
  FiTrash2,
  FiSave,
  FiUploadCloud,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiHelpCircle,
  FiX,
  FiRefreshCw,
  FiEye,
  FiBarChart2,
} from 'react-icons/fi'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import { AdminSide } from './AdminDashboard.jsx'

export default function ManageAssessments() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get('courseId') || '')
  const [assessments, setAssessments] = useState([])
  const [currentAssessment, setCurrentAssessment] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [unpublishing, setUnpublishing] = useState(false)
  const [error, setError] = useState('')

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [passingPercentage, setPassingPercentage] = useState(70)
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30)
  const [questions, setQuestions] = useState([])
  const [validationErrors, setValidationErrors] = useState([])
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null) // { qIndex }

  // Initial load: Fetch all courses
  useEffect(() => {
    let isMounted = true
    api
      .get('/courses/all-courses?limit=100')
      .then(({ data }) => {
        if (!isMounted) return
        const list = data.courses || []
        setCourses(list)
        if (list.length > 0 && !selectedCourseId) {
          setSelectedCourseId(list[0]._id)
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
  }, [])

  // Load assessment for selected course
  useEffect(() => {
    if (!selectedCourseId) return
    loadCourseAssessment(selectedCourseId)
  }, [selectedCourseId])

  const loadCourseAssessment = (cId) => {
    setLoading(true)
    setError('')
    setValidationErrors([])

    api
      .get(`/admin/assessments?courseId=${cId}`)
      .then(({ data }) => {
        const list = data.assessments || []
        setAssessments(list)
        if (list.length > 0) {
          const a = list[0]
          setCurrentAssessment(a)
          setTitle(a.title || '')
          setDescription(a.description || '')
          setPassingPercentage(a.passingPercentage || 70)
          setTimeLimitMinutes(a.timeLimitMinutes || 30)
          setQuestions(a.questions || [])
          fetchAssessmentStats(a._id)
        } else {
          // Initialize empty draft template
          setCurrentAssessment(null)
          const c = courses.find((item) => item._id === cId)
          setTitle(c ? `${c.title} Final Assessment` : 'Final Course Assessment')
          setDescription('Comprehensive final assessment evaluating your mastery of all course modules.')
          setPassingPercentage(70)
          setTimeLimitMinutes(30)
          setQuestions([])
          setStats(null)
        }
      })
      .catch((err) => {
        setError(messageFrom(err))
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const fetchAssessmentStats = (assessmentId) => {
    api
      .get(`/admin/assessments/${assessmentId}`)
      .then(({ data }) => {
        setStats(data.stats || null)
      })
      .catch(() => {})
  }

  // Question Management
  const handleAddQuestion = () => {
    const newQ = {
      question: `Question ${questions.length + 1}: What is the core concept?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'Explanation for why this is the correct answer.',
      difficulty: 'Medium',
      codeSnippet: '',
    }
    setQuestions([...questions, newQ])
  }

  const handleUpdateQuestion = (qIdx, field, val) => {
    const next = [...questions]
    next[qIdx] = { ...next[qIdx], [field]: val }
    setQuestions(next)
  }

  const handleOptionChange = (qIdx, optIdx, val) => {
    const next = [...questions]
    const opts = [...(next[qIdx].options || [])]
    opts[optIdx] = val
    next[qIdx] = { ...next[qIdx], options: opts }
    setQuestions(next)
  }

  const handleAddOption = (qIdx) => {
    const next = [...questions]
    const opts = [...(next[qIdx].options || []), `Option ${next[qIdx].options.length + 1}`]
    next[qIdx] = { ...next[qIdx], options: opts }
    setQuestions(next)
  }

  const handleRemoveOption = (qIdx, optIdx) => {
    const next = [...questions]
    const opts = next[qIdx].options || []
    if (opts.length <= 2) {
      toast.warning('Questions must contain at least 2 options.')
      return
    }
    const filtered = opts.filter((_, i) => i !== optIdx)
    let correct = next[qIdx].correctAnswer
    if (correct >= filtered.length) correct = 0
    next[qIdx] = { ...next[qIdx], options: filtered, correctAnswer: correct }
    setQuestions(next)
  }

  const handleDeleteQuestionConfirmed = () => {
    if (!deleteConfirmModal) return
    const next = questions.filter((_, i) => i !== deleteConfirmModal.qIndex)
    setQuestions(next)
    setDeleteConfirmModal(null)
    toast.info('Question removed.')
  }

  // Save Draft
  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      if (currentAssessment) {
        // Update existing assessment
        const { data } = await api.put(`/admin/assessments/${currentAssessment._id}`, {
          title,
          description,
          passingPercentage,
          timeLimitMinutes,
          questions,
        })
        setCurrentAssessment(data.assessment)
        toast.success('Assessment saved as draft successfully!')
      } else {
        // Create new assessment
        const { data } = await api.post('/admin/assessments', {
          courseId: selectedCourseId,
          title,
          description,
          passingPercentage,
          timeLimitMinutes,
          questions,
        })
        setCurrentAssessment(data.assessment)
        toast.success('Assessment draft created successfully!')
      }
    } catch (err) {
      toast.error(messageFrom(err))
    } finally {
      setSaving(false)
    }
  }

  // Publish Assessment
  const handlePublish = async () => {
    setPublishing(true)
    try {
      let aId = currentAssessment?._id

      // If unsaved, save first
      if (!aId) {
        const saveRes = await api.post('/admin/assessments', {
          courseId: selectedCourseId,
          title,
          description,
          passingPercentage,
          timeLimitMinutes,
          questions,
        })
        aId = saveRes.data.assessment._id
        setCurrentAssessment(saveRes.data.assessment)
      } else {
        await api.put(`/admin/assessments/${aId}`, {
          title,
          description,
          passingPercentage,
          timeLimitMinutes,
          questions,
        })
      }

      // Explicit publish call
      const { data } = await api.post(`/admin/assessments/${aId}/publish`)
      setCurrentAssessment(data.assessment)
      setValidationErrors([])
      toast.success(data.message || 'Assessment published successfully to live students!')
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

  // Unpublish Assessment
  const handleUnpublish = async () => {
    if (!currentAssessment) return
    setUnpublishing(true)
    try {
      const { data } = await api.post(`/admin/assessments/${currentAssessment._id}/unpublish`)
      setCurrentAssessment(data.assessment)
      toast.success(data.message || 'Assessment reverted to draft and hidden from students.')
    } catch (err) {
      toast.error(messageFrom(err))
    } finally {
      setUnpublishing(false)
    }
  }

  const isPublished = currentAssessment?.status === 'published'

  return (
    <div className="dashboard-layout">
      <AdminSide />
      <main className="dashboard-main" style={{ maxWidth: 1200 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div>
            <span className="eyebrow">Certification & Assessment Engine</span>
            <h1 style={{ margin: '4px 0 8px', fontSize: 24, fontWeight: 800 }}>
              Course Assessments Management
            </h1>
            <p className="muted" style={{ fontSize: 14 }}>
              Design and publish final course evaluations with passing score requirements and automated grading.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {currentAssessment && (
              <Link
                to={`/courses/${selectedCourseId}/assessment`}
                target="_blank"
                className="btn btn-outline"
                style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <FiEye size={14} /> Student Preview
              </Link>
            )}
          </div>
        </div>

        {/* Course Selector Card */}
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
            Select Course
          </label>
          <select
            className="input-field"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', fontWeight: 600, fontSize: 14 }}
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title} ({c.level || 'All Levels'})
              </option>
            ))}
          </select>
        </div>

        {/* Assessment Settings Card */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Assessment Configuration</h3>
              {isPublished ? (
                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <FiCheckCircle size={12} /> Live Published
                </span>
              ) : (
                <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <FiClock size={12} /> Draft Mode
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSaveDraft}
                disabled={saving || publishing}
                style={{ padding: '8px 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <FiSave size={14} /> {saving ? 'Saving...' : 'Save Draft'}
              </button>

              {isPublished ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleUnpublish}
                  disabled={unpublishing}
                  style={{ padding: '8px 14px', fontSize: 13, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                >
                  Unpublish
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePublish}
                  disabled={publishing || saving}
                  style={{
                    padding: '8px 20px',
                    fontSize: 13,
                    fontWeight: 700,
                    background: '#10b981',
                    borderColor: '#10b981',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <FiUploadCloud size={14} /> {publishing ? 'Publishing...' : 'Publish Assessment'}
                </button>
              )}
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div
              style={{
                marginBottom: 18,
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 8,
              }}
            >
              <strong style={{ color: '#ef4444', fontSize: 13, display: 'block', marginBottom: 4 }}>
                Please fix the following validation issues before publishing:
              </strong>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12.5, color: '#ef4444' }}>
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Input Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                Assessment Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', fontSize: 14, fontWeight: 600 }}
                placeholder="e.g. JavaScript Foundations Final Assessment"
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                Passing Score (%) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                className="input-field"
                value={passingPercentage}
                onChange={(e) => setPassingPercentage(e.target.value)}
                style={{ width: '100%', fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                Time Limit (Minutes)
              </label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(e.target.value)}
                style={{ width: '100%', fontSize: 14 }}
                placeholder="0 for untimed"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
              Description & Instructions
            </label>
            <textarea
              className="input-field"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', fontSize: 13 }}
            />
          </div>
        </div>

        {/* Assessment Statistics Card (if attempts exist) */}
        {stats && stats.totalAttempts > 0 && (
          <div className="card" style={{ padding: 20, marginBottom: 20, background: 'var(--bg-surface, rgba(0,0,0,0.02))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <FiBarChart2 color="var(--primary)" size={18} />
              <strong style={{ fontSize: 14 }}>Student Assessment Metrics</strong>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <span className="muted" style={{ fontSize: 12 }}>Total Submissions:</span>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{stats.totalAttempts}</div>
              </div>
              <div>
                <span className="muted" style={{ fontSize: 12 }}>Passed Attempts:</span>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>{stats.passedAttempts}</div>
              </div>
              <div>
                <span className="muted" style={{ fontSize: 12 }}>Overall Pass Rate:</span>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>{stats.passRate}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Questions Manager */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>
              Assessment Questions ({questions.length})
            </h3>
            <span className="muted" style={{ fontSize: 12.5 }}>
              Create multiple choice evaluation questions with a single validated correct answer.
            </span>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddQuestion}
            style={{ padding: '8px 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <FiPlus size={14} /> Add Question
          </button>
        </div>

        {/* Question Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {questions.map((q, qIdx) => {
            const options = q.options || []
            return (
              <div key={qIdx} className="card" style={{ padding: 22, borderLeft: '4px solid #3b82f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', padding: '3px 10px', borderRadius: 4 }}>
                      Q{qIdx + 1}
                    </span>
                    <strong style={{ fontSize: 14.5 }}>
                      {q.question ? q.question.slice(0, 70) + (q.question.length > 70 ? '...' : '') : 'Untitled Question'}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmModal({ qIndex: qIdx })}
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
                    <FiTrash2 size={13} /> Delete
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
                      onChange={(e) => handleUpdateQuestion(qIdx, 'question', e.target.value)}
                      style={{ width: '100%', fontSize: 13.5, fontWeight: 600 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                      Difficulty
                    </label>
                    <select
                      className="input-field"
                      value={q.difficulty || 'Medium'}
                      onChange={(e) => handleUpdateQuestion(qIdx, 'difficulty', e.target.value)}
                      style={{ width: '100%', fontSize: 13.5 }}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Code Snippet (Optional) */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                    Code Snippet (Optional)
                  </label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={q.codeSnippet || ''}
                    onChange={(e) => handleUpdateQuestion(qIdx, 'codeSnippet', e.target.value)}
                    style={{ width: '100%', fontFamily: 'monospace', fontSize: 12.5 }}
                    placeholder="// Optional code snippet to accompany question"
                  />
                </div>

                {/* Options List with Radio */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                      Options (Select the correct answer radio button) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleAddOption(qIdx)}
                      style={{ padding: '3px 8px', fontSize: 11.5 }}
                    >
                      + Add Option
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
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
                            name={`correct-assessment-ans-${qIdx}`}
                            checked={isCorrect}
                            onChange={() => handleUpdateQuestion(qIdx, 'correctAnswer', oIdx)}
                            style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                            title="Mark as correct answer"
                          />
                          <input
                            type="text"
                            className="input-field"
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                            style={{ flex: 1, padding: '4px 8px', fontSize: 13, background: 'transparent', border: 'none' }}
                            placeholder={`Option ${oIdx + 1}`}
                          />
                          {options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(qIdx, oIdx)}
                              style={{ border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', padding: 2 }}
                            >
                              <FiX size={14} />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                    Correct Answer Explanation
                  </label>
                  <textarea
                    className="input-field"
                    rows={2}
                    value={q.explanation || ''}
                    onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                    style={{ width: '100%', fontSize: 13 }}
                    placeholder="Explanation displayed to student after submitting the assessment..."
                  />
                </div>
              </div>
            )
          })}

          {questions.length === 0 && (
            <div className="card" style={{ padding: 48, textAlign: 'center' }}>
              <FiAward size={36} className="muted" style={{ marginBottom: 12 }} />
              <h4 style={{ margin: '0 0 6px' }}>No Assessment Questions</h4>
              <p className="muted" style={{ fontSize: 13.5, marginBottom: 16 }}>
                Add questions to build the final evaluation for this course.
              </p>
              <button type="button" className="btn btn-primary" onClick={handleAddQuestion}>
                <FiPlus /> Add First Question
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
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
            <div className="card" style={{ width: '100%', maxWidth: 420, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                  <FiTrash2 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>
                    Delete Question #{deleteConfirmModal.qIndex + 1}?
                  </h3>
                  <span className="muted" style={{ fontSize: 12.5 }}>Remove question from assessment</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button type="button" className="btn btn-outline" onClick={() => setDeleteConfirmModal(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={handleDeleteQuestionConfirmed}
                  style={{ background: '#ef4444', color: '#fff', padding: '8px 18px', fontWeight: 700, borderRadius: 6, border: 'none' }}
                >
                  Delete Question
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
