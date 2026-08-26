import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiCircle,
  FiBookOpen,
  FiHelpCircle,
  FiCode,
  FiAward,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiCopy,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiDownload,
  FiExternalLink,
  FiClock,
} from 'react-icons/fi'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import {
  copyTopicNotesToClipboard,
  downloadTopicNotesDocument,
} from '../utils/docExport.js'
import './TopicHub.css'

export default function TopicHub() {
  const { courseId, topicId } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('lessons') // 'lessons' | 'questions' | 'tasks' | 'cheatsheet' | 'notes'
  const [copiedNotes, setCopiedNotes] = useState(false)

  // Question & Task filters
  const [questionFilter, setQuestionFilter] = useState('all')
  const [taskLevelFilter, setTaskLevelFilter] = useState('all')
  const [revealedAnswers, setRevealedAnswers] = useState({})
  const [openHints, setOpenHints] = useState({})
  const [copiedTask, setCopiedTask] = useState(null)
  const [busyItem, setBusyItem] = useState(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError('')

    api
      .get(`/courses/${courseId}/topics/${topicId}`)
      .then(({ data: res }) => {
        if (isMounted) setData(res)
      })
      .catch((err) => {
        if (isMounted) {
          if (err.response?.data?.requiresEnrollment) {
            toast.info('Please enroll in this course to access the topic hub.')
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
  }, [courseId, topicId, navigate])

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

  const handleCopyNotes = async () => {
    if (!data?.course || !data?.topic) return
    const success = await copyTopicNotesToClipboard(data.course, data.topic)
    if (success) {
      setCopiedNotes(true)
      toast.success('Notes copied! You can now press Ctrl+V in Google Docs.')
      setTimeout(() => setCopiedNotes(false), 3000)
    } else {
      toast.error('Failed to copy notes to clipboard')
    }
  }

  const handleDownloadNotes = () => {
    if (!data?.course || !data?.topic) return
    downloadTopicNotesDocument(data.course, data.topic)
    toast.success('Study notes downloaded! You can open it in Google Docs or Word.')
  }

  // Toggle Question Completion
  const handleToggleQuestion = async (qId, currentStatus) => {
    setBusyItem(qId)
    const targetStatus = !currentStatus
    try {
      const { data: res } = await api.post('/enrollments/complete-question', {
        courseId: data.course._id,
        questionId: qId,
        completed: targetStatus,
      })

      setData((prev) => {
        if (!prev) return prev
        const updatedQuestions = prev.topic.questions.map((q) =>
          q.id === qId ? { ...q, isCompleted: targetStatus } : q
        )
        const completedCount = updatedQuestions.filter((q) => q.isCompleted).length
        const qProg = Math.round((completedCount / (updatedQuestions.length || 1)) * 100)

        return {
          ...prev,
          topic: { ...prev.topic, questions: updatedQuestions },
          stats: {
            ...prev.stats,
            completedQuestionsCount: completedCount,
            questionsProgress: qProg,
            overallProgress: Math.round((prev.stats.lessonsProgress + qProg + prev.stats.tasksProgress) / 3),
          },
        }
      })

      toast.success(res.message || (targetStatus ? 'Question marked as practiced!' : 'Question unmarked'))
    } catch (err) {
      toast.error(messageFrom(err))
    } finally {
      setBusyItem(null)
    }
  }

  // Toggle Task Completion
  const handleToggleTask = async (tId, currentStatus) => {
    setBusyItem(tId)
    const targetStatus = !currentStatus
    try {
      const { data: res } = await api.post('/enrollments/complete-task', {
        courseId: data.course._id,
        taskId: tId,
        completed: targetStatus,
      })

      setData((prev) => {
        if (!prev) return prev
        const updatedTasks = prev.topic.tasks.map((t) =>
          t.id === tId ? { ...t, isCompleted: targetStatus } : t
        )
        const completedCount = updatedTasks.filter((t) => t.isCompleted).length
        const tProg = Math.round((completedCount / (updatedTasks.length || 1)) * 100)

        return {
          ...prev,
          topic: { ...prev.topic, tasks: updatedTasks },
          stats: {
            ...prev.stats,
            completedTasksCount: completedCount,
            tasksProgress: tProg,
            overallProgress: Math.round((prev.stats.lessonsProgress + prev.stats.questionsProgress + tProg) / 3),
          },
        }
      })

      toast.success(res.message || (targetStatus ? 'Task marked as solved!' : 'Task unmarked'))
    } catch (err) {
      toast.error(messageFrom(err))
    } finally {
      setBusyItem(null)
    }
  }

  if (loading) {
    return (
      <div className="topic-hub-container">
        <div style={{ padding: '80px 24px', display: 'grid', placeItems: 'center' }}>
          <Loader />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="topic-hub-container">
        <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div className="status error" style={{ maxWidth: 540, margin: '0 auto 20px' }}>
            {error || 'Topic not found'}
          </div>
          <Link to={`/courses/${courseId}`} className="btn btn-primary">
            <FiArrowLeft /> Return to course details
          </Link>
        </div>
      </div>
    )
  }

  const { course, topic, stats } = data
  const filteredQuestions =
    questionFilter === 'all'
      ? topic.questions
      : topic.questions.filter((q) => q.category === questionFilter)

  const filteredTasks =
    taskLevelFilter === 'all'
      ? topic.tasks
      : topic.tasks.filter((t) => t.level === taskLevelFilter)

  return (
    <div className="topic-hub-container">
      {/* 1. Hero Header */}
      <section className="topic-hub-hero">
        <div className="container">
          <div className="topic-breadcrumbs">
            <Link to="/courses">Courses</Link>
            <span className="separator">/</span>
            <Link to={`/courses/${course._id}`}>{course.title}</Link>
            <span className="separator">/</span>
            <span className="current">Topic {topic.order}: {topic.title}</span>
          </div>

          <div className="topic-hub-header-inner">
            <div className="topic-title-area">
              <span className="topic-eyebrow">
                <FiBookOpen /> Topic Hub &amp; Practice Lab
              </span>
              <h1 className="topic-title">{topic.title}</h1>
              <p className="topic-desc">{topic.description}</p>

              <div className="topic-doc-actions" style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                {(topic.notesDocUrl || course.notesDocUrl) && (
                  <a
                    href={topic.notesDocUrl || course.notesDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ padding: '7px 14px', fontSize: '12.5px', gap: 6 }}
                  >
                    <FiExternalLink /> Open Full Google Notes ↗
                  </a>
                )}
                <button
                  className="btn btn-secondary"
                  style={{ padding: '7px 14px', fontSize: '12.5px', gap: 6 }}
                  onClick={handleCopyNotes}
                  title="Copy rich notes formatted to paste straight into Google Docs"
                >
                  {copiedNotes ? <FiCheck style={{ color: '#10b981' }} /> : <FiCopy />}
                  {copiedNotes ? 'Notes Copied!' : 'Copy for Google Docs'}
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '7px 14px', fontSize: '12.5px', gap: 6 }}
                  onClick={handleDownloadNotes}
                  title="Download .doc file that opens in Google Docs or MS Word"
                >
                  <FiDownload /> Download Notes (.doc)
                </button>
              </div>
            </div>

            {/* Overall Progress Card */}
            <div className="topic-progress-card">
              <div className="topic-progress-header">
                <span>Topic Mastery</span>
                <span className="topic-progress-badge">{stats.overallProgress}%</span>
              </div>
              <div className="topic-progress-bar-lg">
                <div
                  className="topic-progress-fill-lg"
                  style={{ width: `${stats.overallProgress}%` }}
                />
              </div>
              <div className="topic-progress-stats">
                <div className="topic-progress-stat">
                  <strong>{stats.completedLessonsCount}/{stats.totalLessons}</strong>
                  <span>Lessons</span>
                </div>
                <div className="topic-progress-stat">
                  <strong>{stats.completedQuestionsCount}/{stats.totalQuestions}</strong>
                  <span>Questions</span>
                </div>
                <div className="topic-progress-stat">
                  <strong>{stats.completedTasksCount}/{stats.totalTasks}</strong>
                  <span>Tasks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Navigation Tabs */}
      <div className="topic-tabs-bar">
        <div className="container topic-tabs-inner">
          <button
            className={`topic-tab-btn ${activeTab === 'lessons' ? 'active' : ''}`}
            onClick={() => setActiveTab('lessons')}
          >
            <FiBookOpen />
            <span>Subtopics</span>
            <span className="tab-badge">{stats.totalLessons}</span>
          </button>

          <button
            className={`topic-tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            <FiHelpCircle />
            <span>Practice Questions</span>
            <span className="tab-badge">{stats.totalQuestions}</span>
          </button>

          <button
            className={`topic-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <FiCode />
            <span>Hands-on Tasks</span>
            <span className="tab-badge">{stats.totalTasks}</span>
          </button>

          <button
            className={`topic-tab-btn ${activeTab === 'cheatsheet' ? 'active' : ''}`}
            onClick={() => setActiveTab('cheatsheet')}
          >
            <FiAward />
            <span>Interview Matrices</span>
          </button>

          <button
            className={`topic-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <FiFileText />
            <span>Study &amp; Cloud Notes</span>
            {(topic.notesDocUrl || course.notesDocUrl) && (
              <span className="tab-badge" style={{ background: '#10b981', color: '#fff' }}>Cloud</span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Tab Contents */}
      <main className="container topic-content-body">
        {/* Tab 1: Subtopic Lessons */}
        {activeTab === 'lessons' && (
          <div className="lessons-grid">
            {topic.lessons.map((lesson, idx) => {
              const numStr = String(lesson.order || idx + 1).padStart(2, '0')
              const questionCount = lesson.questions?.length || 0
              const taskCount = lesson.tasks?.length || 0

              return (
                <Link
                  key={lesson.order}
                  to={`/courses/${course._id}/topics/${topic.order}/subtopics/${lesson.order}`}
                  className="lesson-hub-card"
                >
                  <div className="lesson-card-main">
                    <div
                      className={`lesson-number-circle ${lesson.isCompleted ? 'completed' : ''}`}
                    >
                      {lesson.isCompleted ? <FiCheck /> : numStr}
                    </div>
                    <div className="lesson-info">
                      <h3>{lesson.title}</h3>
                      {lesson.content && <p>{lesson.content}</p>}

                      {/* Content metrics: Questions & Tasks */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          marginTop: 8,
                          flexWrap: 'wrap',
                        }}
                      >
                        {lesson.duration && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '12px',
                              color: 'var(--muted)',
                              fontWeight: 600,
                            }}
                          >
                            <FiClock size={12} /> {lesson.duration}
                          </span>
                        )}

                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '12px',
                            color: questionCount > 0 ? 'var(--primary)' : 'var(--muted)',
                            background: questionCount > 0 ? 'var(--primary-light)' : 'var(--bg-alt)',
                            border: `1px solid ${questionCount > 0 ? 'var(--primary-border)' : 'var(--line)'}`,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 600,
                          }}
                        >
                          <FiHelpCircle size={12} /> {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
                        </span>

                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '12px',
                            color: taskCount > 0 ? '#059669' : 'var(--muted)',
                            background: taskCount > 0 ? '#ecfdf5' : 'var(--bg-alt)',
                            border: `1px solid ${taskCount > 0 ? '#a7f3d0' : 'var(--line)'}`,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 600,
                          }}
                        >
                          <FiCode size={12} /> {taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="lesson-card-meta">
                    {lesson.duration && (
                      <span className="tab-badge" style={{ padding: '4px 10px', fontSize: '12px' }}>
                        {lesson.duration}
                      </span>
                    )}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '13.5px',
                        fontWeight: 700,
                        color: 'var(--primary)',
                      }}
                    >
                      {lesson.isCompleted ? 'Review Lesson' : 'Start Lesson'} <FiArrowRight />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Tab 2: Practice Questions */}
        {activeTab === 'questions' && (
          <div className="questions-container">
            {/* Category Filter */}
            <div className="questions-filter-bar">
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)' }}>
                Filter Questions:
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['all', 'Console Output', 'typeof Questions'].map((cat) => (
                  <button
                    key={cat}
                    className={`task-level-pill ${questionFilter === cat ? 'active' : ''}`}
                    onClick={() => setQuestionFilter(cat)}
                  >
                    {cat === 'all' ? 'All (25)' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions List */}
            {filteredQuestions.map((q, idx) => {
              const isRevealed = revealedAnswers[q.id]
              const isChecking = busyItem === q.id

              return (
                <div
                  key={q.id}
                  className={`question-card ${q.isCompleted ? 'is-completed' : ''}`}
                >
                  <div className="question-header">
                    <div className="question-title-group">
                      <span className="question-badge">Q{q.order || idx + 1}</span>
                      <span className="question-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {q.category}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`toggle-question-check ${q.isCompleted ? 'checked' : ''}`}
                      onClick={() => handleToggleQuestion(q.id, q.isCompleted)}
                      disabled={isChecking}
                    >
                      {q.isCompleted ? (
                        <>
                          <FiCheckCircle /> <span>Practiced</span>
                        </>
                      ) : (
                        <>
                          <FiCircle /> <span>Mark as Practiced</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="question-text">{q.question}</h3>

                  {q.code && (
                    <pre className="question-code-block">
                      <code>{q.code}</code>
                    </pre>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                    <button
                      type="button"
                      className="reveal-answer-btn"
                      onClick={() => toggleAnswerReveal(q.id)}
                    >
                      {isRevealed ? (
                        <>
                          <FiEyeOff /> Hide Answer
                        </>
                      ) : (
                        <>
                          <FiEye /> Reveal Output &amp; Explanation
                        </>
                      )}
                    </button>
                  </div>

                  {isRevealed && (
                    <div className="question-answer-box">
                      <strong>Output: {q.answer}</strong>
                      <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Tab 3: Hands-on Tasks */}
        {activeTab === 'tasks' && (
          <div className="tasks-container">
            {/* Level Filter */}
            <div className="tasks-level-filter">
              {[
                'all',
                'Level 1',
                'Level 2',
                'Level 3',
                'Level 4',
                'Level 5',
                'Level 6',
                'Level 7',
              ].map((lvl) => (
                <button
                  key={lvl}
                  className={`task-level-pill ${taskLevelFilter === lvl ? 'active' : ''}`}
                  onClick={() => setTaskLevelFilter(lvl)}
                >
                  {lvl === 'all' ? 'All Tasks (28)' : lvl}
                </button>
              ))}
            </div>

            {/* Tasks Cards */}
            {filteredTasks.map((t) => {
              const isHintOpen = openHints[t.id]
              const isChecking = busyItem === t.id

              return (
                <div
                  key={t.id}
                  className={`task-card ${t.isCompleted ? 'is-solved' : ''}`}
                >
                  <div className="task-card-header">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span className="task-level-tag">{t.level}</span>
                        <span className="question-badge">Task #{t.taskNumber}</span>
                        <span className="question-badge" style={{ background: 'var(--bg-alt)' }}>
                          {t.category}
                        </span>
                      </div>
                      <h3>{t.title}</h3>
                    </div>

                    <button
                      type="button"
                      className={`complete-lesson-btn ${t.isCompleted ? 'is-completed' : ''}`}
                      style={{ padding: '8px 18px', fontSize: '13px' }}
                      onClick={() => handleToggleTask(t.id, t.isCompleted)}
                      disabled={isChecking}
                    >
                      {t.isCompleted ? (
                        <>
                          <FiCheckCircle /> Solved
                        </>
                      ) : (
                        <>
                          <FiCircle /> Mark as Solved
                        </>
                      )}
                    </button>
                  </div>

                  <p className="task-description">{t.description}</p>

                  {t.requirements && t.requirements.length > 0 && (
                    <div className="task-requirements-box">
                      <h4>Requirements &amp; Steps:</h4>
                      <ul className="task-req-list">
                        {t.requirements.map((req, rIdx) => (
                          <li key={rIdx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {t.starterCode && (
                    <div className="task-starter-code">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#94a3b8', fontSize: '12px' }}>
                        <span>Solution &amp; Starter Code:</span>
                        <button
                          type="button"
                          className="copy-btn"
                          style={{ padding: '2px 8px' }}
                          onClick={() => handleCopyCode(t.starterCode, t.id)}
                        >
                          {copiedTask === t.id ? (
                            <>
                              <FiCheck style={{ color: '#10b981' }} /> Copied
                            </>
                          ) : (
                            <>
                              <FiCopy /> Copy
                            </>
                          )}
                        </button>
                      </div>
                      <pre style={{ margin: 0 }}>
                        <code>{t.starterCode}</code>
                      </pre>
                    </div>
                  )}

                  {t.hints && t.hints.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <button
                        type="button"
                        className="reveal-answer-btn"
                        onClick={() => toggleHintReveal(t.id)}
                      >
                        {isHintOpen ? <FiChevronUp /> : <FiChevronDown />}
                        <span>{isHintOpen ? 'Hide Hint' : 'Show Hint & Explanation'}</span>
                      </button>
                      {isHintOpen && (
                        <div className="question-answer-box" style={{ marginTop: 8 }}>
                          {t.hints.map((hint, hIdx) => (
                            <p key={hIdx} style={{ margin: 0 }}>💡 {hint}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Tab 4: Interview Matrices */}
        {activeTab === 'cheatsheet' && (
          <div className="cheatsheet-section">
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: 8 }}>
              Core JavaScript Interview Comparison Matrices
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '14.5px', marginBottom: 24 }}>
              Review these essential comparison tables before interviews and coding tests.
            </p>

            {/* Matrix 1: var vs let vs const */}
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '20px 0 8px' }}>
              1. var vs. let vs. const
            </h3>
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>var</th>
                  <th>let</th>
                  <th>const</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Scope</strong></td>
                  <td>Function Scope</td>
                  <td>Block Scope</td>
                  <td>Block Scope</td>
                </tr>
                <tr>
                  <td><strong>Redeclaration</strong></td>
                  <td>✅ Yes (in same scope)</td>
                  <td>❌ No (SyntaxError)</td>
                  <td>❌ No (SyntaxError)</td>
                </tr>
                <tr>
                  <td><strong>Reassignment</strong></td>
                  <td>✅ Yes</td>
                  <td>✅ Yes</td>
                  <td>❌ No (TypeError)</td>
                </tr>
                <tr>
                  <td><strong>Hoisted</strong></td>
                  <td>✅ Yes (initialized with <code>undefined</code>)</td>
                  <td>✅ Yes (in Temporal Dead Zone)</td>
                  <td>✅ Yes (in Temporal Dead Zone)</td>
                </tr>
                <tr>
                  <td><strong>Initial Value Required</strong></td>
                  <td>❌ No (defaults to undefined)</td>
                  <td>❌ No (defaults to undefined)</td>
                  <td>✅ Yes (mandatory at declaration)</td>
                </tr>
              </tbody>
            </table>

            {/* Matrix 2: Primitive vs Non-Primitive */}
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '28px 0 8px' }}>
              2. Primitive vs. Reference (Non-Primitive) Types
            </h3>
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Characteristic</th>
                  <th>Primitive Data Types</th>
                  <th>Reference (Non-Primitive) Types</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Types Included</strong></td>
                  <td>String, Number, Boolean, Undefined, Null, BigInt, Symbol (7 types)</td>
                  <td>Object, Array, Function, Date, Map, Set</td>
                </tr>
                <tr>
                  <td><strong>Mutability</strong></td>
                  <td>Immutable (cannot be modified in place)</td>
                  <td>Mutable (properties can be changed)</td>
                </tr>
                <tr>
                  <td><strong>Memory Storage</strong></td>
                  <td>Stored directly in the Stack <strong>by value</strong></td>
                  <td>Stored in the Heap <strong>by reference (memory address)</strong></td>
                </tr>
                <tr>
                  <td><strong>Comparison</strong></td>
                  <td>Compared by actual value (<code>10 === 10</code>)</td>
                  <td>Compared by memory address reference (<code>{} !== {}</code>)</td>
                </tr>
              </tbody>
            </table>

            {/* Matrix 3: null vs undefined */}
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '28px 0 8px' }}>
              3. null vs. undefined
            </h3>
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>null</th>
                  <th>undefined</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Meaning</strong></td>
                  <td>Intentional absence of any value or object</td>
                  <td>Variable declared but not assigned a value yet</td>
                </tr>
                <tr>
                  <td><strong>Assigned By</strong></td>
                  <td>Manually assigned by the programmer</td>
                  <td>Automatically assigned by the JavaScript engine</td>
                </tr>
                <tr>
                  <td><strong>typeof Result</strong></td>
                  <td><code>"object"</code> (historical legacy bug)</td>
                  <td><code>"undefined"</code></td>
                </tr>
                <tr>
                  <td><strong>Equality</strong></td>
                  <td><code>null == undefined</code> (true)</td>
                  <td><code>null === undefined</code> (false)</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Study & Cloud Notes */}
        {activeTab === 'notes' && (
          <div className="topic-notes-hub">
            {/* Cloud Google Doc Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#fff',
                padding: '24px 28px',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid rgba(255,255,255,0.1)',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 20,
              }}
            >
              <div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#93c5fd', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <FiFileText /> Google Docs &amp; Cloud Integration
                </span>
                <h3 style={{ color: '#fff', fontSize: '20px', margin: '6px 0 4px', fontWeight: 800 }}>
                  {topic.title} — Study Document
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0, maxWidth: 540 }}>
                  Complete structured notes including theory, code examples, {topic.questions.length} interview questions, and {topic.tasks.length} hands-on practice challenges.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {(topic.notesDocUrl || course.notesDocUrl) ? (
                  <a
                    href={topic.notesDocUrl || course.notesDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ background: '#fff', color: '#0f172a', fontWeight: 700 }}
                  >
                    <FiExternalLink /> Open Full Google Notes ↗
                  </a>
                ) : (
                  <button
                    className="btn btn-primary"
                    style={{ background: '#2563eb', color: '#fff' }}
                    onClick={handleCopyNotes}
                  >
                    {copiedNotes ? <FiCheck /> : <FiCopy />} {copiedNotes ? 'Copied!' : 'Copy for Google Docs'}
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', borderColor: 'rgba(255,255,255,0.16)' }}
                  onClick={handleDownloadNotes}
                >
                  <FiDownload /> Download .doc
                </button>
              </div>
            </div>

            {/* Quick Export Steps */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 28 }}>
              <div style={{ background: 'var(--bg-white)', padding: 18, borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
                <strong style={{ display: 'block', fontSize: '14px', marginBottom: 4, color: 'var(--dark)' }}>1. 1-Click Copy</strong>
                <p style={{ fontSize: '12.5px', color: 'var(--muted)' }}>Click <strong>"Copy for Google Docs"</strong> to copy rich formatted text to your clipboard.</p>
              </div>
              <div style={{ background: 'var(--bg-white)', padding: 18, borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
                <strong style={{ display: 'block', fontSize: '14px', marginBottom: 4, color: 'var(--dark)' }}>2. Paste in Google Docs</strong>
                <p style={{ fontSize: '12.5px', color: 'var(--muted)' }}>Open a new Google Doc and press <strong>Ctrl + V</strong>. All headings and code will paste perfectly.</p>
              </div>
              <div style={{ background: 'var(--bg-white)', padding: 18, borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
                <strong style={{ display: 'block', fontSize: '14px', marginBottom: 4, color: 'var(--dark)' }}>3. Offline Word / PDF</strong>
                <p style={{ fontSize: '12.5px', color: 'var(--muted)' }}>Click <strong>"Download .doc"</strong> to save a local document readable in Microsoft Word or Google Docs.</p>
              </div>
            </div>

            {/* Full Notes Preview */}
            <div style={{ background: 'var(--bg-white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-xl)', padding: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, borderBottom: '2px solid var(--primary)', paddingBottom: 8, marginBottom: 20 }}>
                📑 Notes Outline &amp; Summary
              </h2>

              {/* Subtopics */}
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>
                  1. Subtopics &amp; Lessons ({topic.lessons.length})
                </h3>
                <div style={{ display: 'grid', gap: 10 }}>
                  {topic.lessons.map((l, i) => (
                    <div key={i} style={{ padding: 12, background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--dark)', marginBottom: 4 }}>
                        1.{i + 1} {l.title} {l.duration && <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>({l.duration})</span>}
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{l.content}</p>
                      {l.notes && (
                        <div style={{ marginTop: 8, padding: '6px 10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 4, fontSize: '12px', color: '#92400e' }}>
                          💡 <strong>Key Takeaway:</strong> {l.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Practice Questions */}
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>
                  2. Practice &amp; Interview Questions ({topic.questions.length})
                </h3>
                <div style={{ display: 'grid', gap: 10 }}>
                  {topic.questions.map((q, i) => (
                    <div key={i} style={{ padding: 12, background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--dark)' }}>
                        Q{i + 1}: {q.question}
                      </div>
                      {q.code && (
                        <pre style={{ background: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 4, fontSize: 12, margin: '8px 0' }}>
                          <code>{q.code}</code>
                        </pre>
                      )}
                      <div style={{ marginTop: 6, fontSize: '12.5px', color: '#059669', background: '#ecfdf5', padding: '6px 10px', borderRadius: 4, border: '1px solid #a7f3d0' }}>
                        <strong>Answer:</strong> {q.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>
                  3. Hands-on Tasks &amp; Practice Challenges ({topic.tasks.length})
                </h3>
                <div style={{ display: 'grid', gap: 10 }}>
                  {topic.tasks.map((t, i) => (
                    <div key={i} style={{ padding: 12, background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--dark)' }}>
                        Task #{t.taskNumber || i + 1}: {t.title} <span style={{ fontSize: 11, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px', borderRadius: 4 }}>{t.level}</span>
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: 4 }}>{t.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
