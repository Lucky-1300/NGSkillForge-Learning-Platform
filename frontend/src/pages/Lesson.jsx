import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiCircle,
  FiChevronDown,
  FiChevronRight,
  FiChevronUp,
  FiClock,
  FiMenu,
  FiX,
  FiBookOpen,
  FiCheck,
  FiExternalLink,
  FiFileText,
  FiHelpCircle,
  FiCode,
  FiEye,
  FiEyeOff,
  FiCopy,
} from 'react-icons/fi'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import LessonContentRenderer from '../components/LessonContentRenderer.jsx'
import './Lesson.css'

export default function Lesson() {
  const { courseId, topicId, subtopicId } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [togglingCompletion, setTogglingCompletion] = useState(false)
  const [openTopics, setOpenTopics] = useState({})
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Interactive Question & Task states
  const [revealedAnswers, setRevealedAnswers] = useState({})
  const [openHints, setOpenHints] = useState({})
  const [copiedTask, setCopiedTask] = useState(null)
  const [busyQuestion, setBusyQuestion] = useState(null)
  const [busyTask, setBusyTask] = useState(null)

  // Fetch lesson data whenever route params change
  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError('')

    api
      .get(`/courses/${courseId}/topics/${topicId}/subtopics/${subtopicId}`)
      .then(({ data: res }) => {
        if (isMounted) {
          setData(res)
          // Automatically keep active topic accordion expanded
          if (res.topic?.order) {
            setOpenTopics((prev) => ({
              ...prev,
              [res.topic.order]: true,
            }))
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          if (err.response?.data?.requiresEnrollment) {
            toast.info('Please enroll to view lesson content.')
            navigate(`/courses/${courseId}`)
          } else {
            setError(messageFrom(err))
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [courseId, topicId, subtopicId, navigate])

  const toggleTopicAccordion = (topicOrder) => {
    setOpenTopics((prev) => ({
      ...prev,
      [topicOrder]: !prev[topicOrder],
    }))
  }

  const toggleAnswerReveal = (id) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const toggleHintReveal = (id) => {
    setOpenHints((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedTask(id)
    setTimeout(() => setCopiedTask(null), 2000)
  }

  const handleToggleQuestion = async (qId, currentStatus) => {
    if (!data?.course?._id) return
    setBusyQuestion(qId)
    const targetStatus = !currentStatus
    try {
      const { data: res } = await api.post('/enrollments/complete-question', {
        courseId: data.course._id,
        questionId: qId,
        completed: targetStatus,
      })

      setData((prev) => {
        if (!prev) return prev
        const updatedQuestions = (prev.subtopic.questions || []).map((q) =>
          q.id === qId ? { ...q, isCompleted: targetStatus } : q
        )
        return {
          ...prev,
          subtopic: {
            ...prev.subtopic,
            questions: updatedQuestions,
          },
        }
      })

      toast.success(res.message || (targetStatus ? 'Question marked as practiced!' : 'Question unmarked'))
    } catch (err) {
      toast.error(messageFrom(err))
    } finally {
      setBusyQuestion(null)
    }
  }

  const handleToggleTask = async (taskId, currentStatus) => {
    if (!data?.course?._id) return
    setBusyTask(taskId)
    const targetStatus = !currentStatus
    try {
      const { data: res } = await api.post('/enrollments/complete-task', {
        courseId: data.course._id,
        taskId: taskId,
        completed: targetStatus,
      })

      setData((prev) => {
        if (!prev) return prev
        const updatedTasks = (prev.subtopic.tasks || []).map((t) =>
          t.id === taskId ? { ...t, isCompleted: targetStatus } : t
        )
        return {
          ...prev,
          subtopic: {
            ...prev.subtopic,
            tasks: updatedTasks,
          },
        }
      })

      toast.success(res.message || (targetStatus ? 'Task marked as solved!' : 'Task unmarked'))
    } catch (err) {
      toast.error(messageFrom(err))
    } finally {
      setBusyTask(null)
    }
  }

  const handleToggleComplete = async () => {
    if (!data?.subtopic || togglingCompletion) return

    const currentKey = data.subtopic.lessonKey
    const targetStatus = !data.subtopic.isCompleted

    setTogglingCompletion(true)
    try {
      const { data: res } = await api.post('/enrollments/complete-lesson', {
        courseId: data.course._id,
        lessonKey: currentKey,
        completed: targetStatus,
      })

      // Optimistically update local lesson completion state and progress
      setData((prev) => {
        if (!prev) return prev
        const updatedCompleted = res.completedLessons || []
        return {
          ...prev,
          subtopic: {
            ...prev.subtopic,
            isCompleted: targetStatus,
          },
          completedLessons: updatedCompleted,
          progress: res.progress !== undefined ? res.progress : prev.progress,
          curriculum: prev.curriculum.map((topic) => ({
            ...topic,
            lessons: topic.lessons.map((les) => ({
              ...les,
              isCompleted: updatedCompleted.includes(les.lessonKey),
            })),
          })),
        }
      })

      toast.success(res.message || (targetStatus ? 'Lesson marked as complete!' : 'Lesson marked as incomplete'))
    } catch (err) {
      toast.error(messageFrom(err))
    } finally {
      setTogglingCompletion(false)
    }
  }

  if (loading) {
    return (
      <div className="lesson-page-container">
        <div style={{ padding: '80px 24px', display: 'grid', placeItems: 'center' }}>
          <Loader />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="lesson-page-container">
        <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div className="status error" style={{ maxWidth: 540, margin: '0 auto 20px' }}>
            {error || 'Lesson not found'}
          </div>
          <Link to={`/courses/${courseId}`} className="btn btn-primary">
            <FiArrowLeft /> Return to course details
          </Link>
        </div>
      </div>
    )
  }

  const { course, topic, subtopic, navigation, curriculum, completedLessons, progress } = data
  const totalLessons = navigation?.totalLessons || 0
  const completedCount = completedLessons?.length || 0

  const subtopicQuestions = subtopic.questions || []
  const subtopicTasks = subtopic.tasks || []

  return (
    <div className="lesson-page-container">
      {/* 1. LMS Top Bar with Breadcrumbs & Progress */}
      <div className="lesson-top-bar">
        <div className="lesson-top-inner">
          <div className="lesson-breadcrumbs">
            <Link to="/courses">Courses</Link>
            <span className="separator">/</span>
            <Link to={`/courses/${course._id}`}>{course.title}</Link>
            <span className="separator">/</span>
            <Link to={`/courses/${course._id}/topics/${topic.order}`}>Topic {topic.order}: {topic.title}</Link>
            <span className="separator">/</span>
            <span className="current">{subtopic.title}</span>
          </div>

          <div className="lesson-top-controls">
            <div className="lesson-progress-wrap" title={`${completedCount} of ${totalLessons} lessons completed`}>
              <div className="lesson-progress-bar">
                <div className="lesson-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="lesson-progress-text">{progress}% Completed</span>
            </div>

            <button
              className="mobile-curriculum-btn"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Toggle Curriculum"
            >
              {mobileSidebarOpen ? <FiX /> : <FiMenu />}
              <span>Curriculum</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main LMS Workspace */}
      <div className="lesson-workspace">
        {/* Left Sidebar Curriculum */}
        <aside className={`lesson-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <h2 className="sidebar-course-title">
              <span>{course.title}</span>
            </h2>
            <div className="sidebar-subtitle">
              {curriculum.length} Topics • {totalLessons} Subtopics
            </div>
          </div>

          <div className="sidebar-topics-list">
            {curriculum.map((topicItem) => {
              const isTopicOpen = openTopics[topicItem.order] ?? topicItem.order === topic.order
              const topicCompletedCount = topicItem.lessons.filter((l) => l.isCompleted).length

              return (
                <div key={topicItem.order} className="sidebar-topic-accordion">
                  <div
                    className="sidebar-topic-header"
                    onClick={() => toggleTopicAccordion(topicItem.order)}
                  >
                    <div className="sidebar-topic-title-group">
                      <span className="topic-badge-num">{topicItem.order}</span>
                      <span className="sidebar-topic-title" title={topicItem.title}>
                        {topicItem.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                        {topicCompletedCount}/{topicItem.lessons.length}
                      </span>
                      {isTopicOpen ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                    </div>
                  </div>

                  {isTopicOpen && (
                    <div className="sidebar-subtopics">
                      {topicItem.lessons.map((lessonItem) => {
                        const isActive =
                          topicItem.order === topic.order && lessonItem.order === subtopic.order

                        return (
                          <Link
                            key={lessonItem.order}
                            to={`/courses/${course._id}/topics/${topicItem.order}/subtopics/${lessonItem.order}`}
                            className={`sidebar-subtopic-link ${isActive ? 'active' : ''}`}
                            onClick={() => setMobileSidebarOpen(false)}
                          >
                            <div className="subtopic-label">
                              {lessonItem.isCompleted ? (
                                <FiCheckCircle className="status-icon completed" />
                              ) : isActive ? (
                                <FiArrowRight className="status-icon active" />
                              ) : (
                                <FiCircle className="status-icon pending" />
                              )}
                              <span title={lessonItem.title}>{lessonItem.title}</span>
                            </div>
                            {lessonItem.duration && (
                              <span className="subtopic-duration">{lessonItem.duration}</span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </aside>

        {/* Right Main Lesson Canvas */}
        <main className="lesson-canvas">
          {/* Header */}
          <div className="lesson-header">
            <div className="lesson-meta-eyebrow">
              <FiBookOpen />
              <span>
                Topic {topic.order}: {topic.title}
              </span>
            </div>
            <h1 className="lesson-title">{subtopic.title}</h1>
            <div className="lesson-header-tags">
              {subtopic.duration && (
                <span className="lesson-tag">
                  <FiClock /> {subtopic.duration}
                </span>
              )}
              {subtopicQuestions.length > 0 && (
                <span className="lesson-tag">
                  <FiHelpCircle /> {subtopicQuestions.length} Questions
                </span>
              )}
              {subtopicTasks.length > 0 && (
                <span className="lesson-tag">
                  <FiCode /> {subtopicTasks.length} Tasks
                </span>
              )}
              {subtopic.isCompleted && (
                <span className="lesson-tag" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.08)' }}>
                  <FiCheck /> Completed
                </span>
              )}
              {(topic?.notesDocUrl || course?.notesDocUrl) && (
                <a
                  href={topic?.notesDocUrl || course?.notesDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lesson-tag"
                  style={{ color: 'var(--primary)', borderColor: 'var(--primary-border)', textDecoration: 'none', background: 'var(--primary-light)', fontWeight: 600 }}
                  title="Open topic study notes in Google Docs"
                >
                  <FiFileText /> Open Full Google Notes ↗
                </a>
              )}
            </div>
          </div>

          {/* 1. NOTES SECTION */}
          <section className="lesson-content-section" style={{ marginBottom: 40 }}>
            <LessonContentRenderer
              content={subtopic.content}
              notes={subtopic.notes}
              subtopicTitle={subtopic.title}
            />
          </section>

          {/* 2. QUESTIONS SECTION */}
          {subtopicQuestions.length > 0 && (
            <section className="lesson-content-section" style={{ marginTop: 40, borderTop: '1px solid var(--line)', paddingTop: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                    <FiHelpCircle style={{ color: 'var(--primary)' }} /> Practice Questions ({subtopicQuestions.length})
                  </h2>
                  <p style={{ fontSize: '13.5px', color: 'var(--muted)', marginTop: 4 }}>
                    Test your understanding of {subtopic.title} with conceptual and console output questions.
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 'var(--radius-full)', border: '1px solid var(--primary-border)' }}>
                  {subtopicQuestions.filter((q) => q.isCompleted).length} / {subtopicQuestions.length} Practiced
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {subtopicQuestions.map((q, qIdx) => {
                  const isRevealed = revealedAnswers[q.id]
                  const isCompleted = q.isCompleted
                  const qNum = String(q.order || qIdx + 1).padStart(2, '0')

                  return (
                    <div
                      key={q.id || qIdx}
                      style={{
                        background: 'var(--bg-white)',
                        border: `1px solid ${isCompleted ? '#a7f3d0' : 'var(--line)'}`,
                        borderRadius: 'var(--radius-lg)',
                        padding: '20px 24px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>
                            Q{qNum}
                          </span>
                          {q.category && (
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', background: 'var(--bg-alt)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--line)' }}>
                              {q.category}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleQuestion(q.id, isCompleted)}
                          disabled={busyQuestion === q.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: '12.5px',
                            fontWeight: 700,
                            color: isCompleted ? '#059669' : 'var(--muted)',
                            background: isCompleted ? '#ecfdf5' : 'var(--bg-alt)',
                            border: `1px solid ${isCompleted ? '#a7f3d0' : 'var(--line)'}`,
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                          }}
                        >
                          {isCompleted ? <FiCheckCircle style={{ color: '#10b981' }} /> : <FiCircle />}
                          <span>{isCompleted ? 'Practiced' : 'Mark Practiced'}</span>
                        </button>
                      </div>

                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                        {q.question}
                      </h3>

                      {q.code && (
                        <div className="lesson-code-card" style={{ margin: '12px 0' }}>
                          <div className="code-header">
                            <span>JavaScript Code</span>
                            <button
                              type="button"
                              className="copy-btn"
                              onClick={() => handleCopyCode(q.code, `q-${q.id}`)}
                            >
                              {copiedTask === `q-${q.id}` ? <><FiCheck /> Copied</> : <><FiCopy /> Copy</>}
                            </button>
                          </div>
                          <pre className="code-pre"><code>{q.code}</code></pre>
                        </div>
                      )}

                      {q.options && q.options.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, margin: '14px 0' }}>
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} style={{ padding: '8px 12px', background: 'var(--bg-alt)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-main)' }}>
                              <strong>{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ marginTop: 12 }}>
                        <button
                          type="button"
                          onClick={() => toggleAnswerReveal(q.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: '12.5px',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            background: 'var(--primary-light)',
                            border: '1px solid var(--primary-border)',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                          }}
                        >
                          {isRevealed ? <><FiEyeOff size={13} /> Hide Answer</> : <><FiEye size={13} /> Show Answer &amp; Explanation</>}
                        </button>
                      </div>

                      {isRevealed && (
                        <div style={{ marginTop: 14, padding: '14px 16px', background: 'var(--bg-alt)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#059669', marginBottom: 4 }}>
                            ✓ Correct Answer:
                          </div>
                          <pre style={{ margin: '0 0 10px 0', fontSize: '13.5px', fontFamily: 'monospace', color: 'var(--text-heading)', whiteSpace: 'pre-wrap' }}>
                            {q.answer}
                          </pre>
                          {q.explanation && (
                            <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6, borderTop: '1px solid var(--line)', paddingTop: 8 }}>
                              <strong>Explanation: </strong>{q.explanation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* 3. TASKS SECTION */}
          {subtopicTasks.length > 0 && (
            <section className="lesson-content-section" style={{ marginTop: 40, borderTop: '1px solid var(--line)', paddingTop: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                    <FiCode style={{ color: '#059669' }} /> Hands-on Tasks ({subtopicTasks.length})
                  </h2>
                  <p style={{ fontSize: '13.5px', color: 'var(--muted)', marginTop: 4 }}>
                    Apply your knowledge with practical coding challenges specifically for {subtopic.title}.
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: 'var(--radius-full)', border: '1px solid #a7f3d0' }}>
                  {subtopicTasks.filter((t) => t.isCompleted).length} / {subtopicTasks.length} Solved
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {subtopicTasks.map((task, tIdx) => {
                  const isCompleted = task.isCompleted
                  const isOpenHint = openHints[task.id]

                  return (
                    <div
                      key={task.id || tIdx}
                      style={{
                        background: 'var(--bg-white)',
                        border: `1px solid ${isCompleted ? '#a7f3d0' : 'var(--line)'}`,
                        borderRadius: 'var(--radius-lg)',
                        padding: '22px 24px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>
                            Task {task.taskNumber || tIdx + 1}
                          </span>
                          {task.level && (
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', background: 'var(--bg-alt)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--line)' }}>
                              {task.level}
                            </span>
                          )}
                          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                            {task.title}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id, isCompleted)}
                          disabled={busyTask === task.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: '12.5px',
                            fontWeight: 700,
                            color: isCompleted ? '#059669' : 'var(--muted)',
                            background: isCompleted ? '#ecfdf5' : 'var(--bg-alt)',
                            border: `1px solid ${isCompleted ? '#a7f3d0' : 'var(--line)'}`,
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                          }}
                        >
                          {isCompleted ? <FiCheckCircle style={{ color: '#10b981' }} /> : <FiCircle />}
                          <span>{isCompleted ? 'Solved' : 'Mark Solved'}</span>
                        </button>
                      </div>

                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 14px 0' }}>
                        {task.description}
                      </p>

                      {task.requirements && task.requirements.length > 0 && (
                        <div style={{ margin: '14px 0', padding: '12px 16px', background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                          <strong style={{ fontSize: '12.5px', color: 'var(--dark)', display: 'block', marginBottom: 6 }}>
                            Requirements:
                          </strong>
                          <ul style={{ margin: 0, paddingLeft: 18, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            {task.requirements.map((req, rIdx) => (
                              <li key={rIdx}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {task.starterCode && (
                        <div className="lesson-code-card" style={{ margin: '14px 0' }}>
                          <div className="code-header">
                            <span>Starter Code</span>
                            <button
                              type="button"
                              className="copy-btn"
                              onClick={() => handleCopyCode(task.starterCode, `task-${task.id}`)}
                            >
                              {copiedTask === `task-${task.id}` ? <><FiCheck /> Copied</> : <><FiCopy /> Copy Code</>}
                            </button>
                          </div>
                          <pre className="code-pre"><code>{task.starterCode}</code></pre>
                        </div>
                      )}

                      {task.hints && task.hints.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <button
                            type="button"
                            onClick={() => toggleHintReveal(task.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: '12.5px',
                              color: 'var(--muted)',
                              cursor: 'pointer',
                            }}
                          >
                            {isOpenHint ? <FiChevronUp /> : <FiChevronDown />}
                            <span>{isOpenHint ? 'Hide Hints' : 'Need a hint?'}</span>
                          </button>
                          {isOpenHint && (
                            <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--bg-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', fontSize: '13px', color: 'var(--muted)' }}>
                              {task.hints.map((hint, hIdx) => (
                                <p key={hIdx} style={{ margin: '2px 0' }}>💡 {hint}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* 4. COMPLETION & NAVIGATION FOOTER */}
          <div className="lesson-action-bar" style={{ marginTop: 44, borderTop: '1px solid var(--line)', paddingTop: 24 }}>
            <div className="completion-row" style={{ marginBottom: 20 }}>
              <button
                type="button"
                className={`complete-lesson-btn ${subtopic.isCompleted ? 'is-completed' : ''}`}
                onClick={handleToggleComplete}
                disabled={togglingCompletion}
              >
                {togglingCompletion ? (
                  'Saving...'
                ) : subtopic.isCompleted ? (
                  <>
                    <FiCheckCircle /> Completed
                  </>
                ) : (
                  <>
                    <FiCheckCircle /> Mark Subtopic as Complete
                  </>
                )}
              </button>
            </div>

            <div className="lesson-nav-footer">
              {navigation?.prev ? (
                <Link
                  to={`/courses/${course._id}/topics/${navigation.prev.topicOrder}/subtopics/${navigation.prev.subtopicOrder}`}
                  className="nav-step-btn"
                >
                  <FiArrowLeft /> Previous Subtopic
                </Link>
              ) : (
                <button className="nav-step-btn" disabled>
                  <FiArrowLeft /> Previous Subtopic
                </button>
              )}

              {navigation?.next ? (
                <Link
                  to={`/courses/${course._id}/topics/${navigation.next.topicOrder}/subtopics/${navigation.next.subtopicOrder}`}
                  className="nav-step-btn"
                  style={{ color: 'var(--primary)', borderColor: 'var(--primary-border)' }}
                >
                  Next Subtopic <FiArrowRight />
                </Link>
              ) : (
                <button className="nav-step-btn" disabled>
                  Next Subtopic <FiArrowRight />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
