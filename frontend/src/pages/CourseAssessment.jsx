import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAward,
  FiRefreshCw,
  FiAlertTriangle,
  FiHelpCircle,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiList,
  FiLock,
  FiBookOpen,
} from 'react-icons/fi'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import { CodeBlock } from '../components/NotesRenderer.jsx'
import { useAuth } from '../context/authContext.js'

export default function CourseAssessment() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [course, setCourse] = useState(null)
  const [assessment, setAssessment] = useState(null)
  const [prerequisite, setPrerequisite] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [hasPassed, setHasPassed] = useState(false)
  const [bestScore, setBestScore] = useState(0)

  // Quiz execution state
  const [isTakingQuiz, setIsTakingQuiz] = useState(false)
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({}) // { [questionId]: optionIndex }
  const [startedAt, setStartedAt] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState(null) // Attempt feedback payload
  const [activeReviewAttempt, setActiveReviewAttempt] = useState(null)

  // Timer state (if timeLimitMinutes > 0)
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    loadAssessmentData()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [courseId])

  const loadAssessmentData = () => {
    setLoading(true)
    setError('')

    Promise.all([
      api.get(`/courses/single-course/${courseId}`),
      api.get(`/assessments/course/${courseId}`),
    ])
      .then(([courseRes, assessRes]) => {
        setCourse(courseRes.data?.course || null)
        const aData = assessRes.data

        if (aData.hasAssessment && aData.assessment) {
          setAssessment(aData.assessment)
          setPrerequisite(aData.prerequisite || null)
          setAttempts(aData.attempts || [])
          setHasPassed(Boolean(aData.hasPassed))
          setBestScore(aData.bestScore || 0)

          // If there are previous attempts, show the latest attempt by default
          if (aData.attempts && aData.attempts.length > 0 && !isTakingQuiz) {
            setActiveReviewAttempt(aData.attempts[0])
          }
        } else {
          setAssessment(null)
          setPrerequisite(aData.prerequisite || null)
        }
      })
      .catch((err) => {
        setError(messageFrom(err))
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // Timer countdown hook
  useEffect(() => {
    if (isTakingQuiz && timeRemainingSeconds !== null && timeRemainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            handleAutoSubmitOnTimeout()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isTakingQuiz, timeRemainingSeconds])

  const handleStartAssessment = () => {
    if (!isAuthenticated) {
      return navigate('/login', { state: { from: `/courses/${courseId}/assessment` } })
    }

    if (prerequisite && !prerequisite.isMet) {
      toast.warning('Please complete all required lectures before starting the assessment.')
      return
    }

    setSelectedAnswers({})
    setCurrentQIndex(0)
    setSubmitResult(null)
    setActiveReviewAttempt(null)
    const startTime = new Date()
    setStartedAt(startTime)

    if (assessment.timeLimitMinutes && assessment.timeLimitMinutes > 0) {
      setTimeRemainingSeconds(assessment.timeLimitMinutes * 60)
    } else {
      setTimeRemainingSeconds(null)
    }

    setIsTakingQuiz(true)
  }

  const handleOptionSelect = (questionId, optionIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }))
  }

  const handleAutoSubmitOnTimeout = () => {
    toast.warning('Time limit reached! Submitting your assessment answers automatically...')
    handleSubmit()
  }

  const handleSubmit = async () => {
    if (!assessment || submitting) return

    const questions = assessment.questions || []
    const answeredCount = Object.keys(selectedAnswers).length

    if (answeredCount < questions.length && timeRemainingSeconds !== 0) {
      const confirmIncomplete = window.confirm(
        `You have answered ${answeredCount} of ${questions.length} questions. Are you sure you want to submit now?`
      )
      if (!confirmIncomplete) return
    }

    setSubmitting(true)
    try {
      const answersPayload = questions.map((q) => ({
        questionId: q._id,
        selectedOption: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : null,
      }))

      const timeSpentSeconds = startedAt
        ? Math.round((Date.now() - new Date(startedAt).getTime()) / 1000)
        : 0

      const { data } = await api.post(`/assessments/${assessment._id}/submit`, {
        answers: answersPayload,
        startedAt,
        timeSpentSeconds,
      })

      if (data.success && data.attempt) {
        setSubmitResult(data.attempt)
        setIsTakingQuiz(false)
        if (timerRef.current) clearInterval(timerRef.current)
        if (data.attempt.passed) {
          toast.success(data.message || '🎉 Congratulations! You passed the assessment!')
        } else {
          toast.info('Assessment submitted. Review your score below.')
        }
        loadAssessmentData()
      }
    } catch (err) {
      toast.error(messageFrom(err))
    } finally {
      setSubmitting(false)
    }
  }

  const formatTimer = (seconds) => {
    if (seconds === null || seconds === undefined) return ''
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <section className="section container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <Loader />
      </section>
    )
  }

  if (error || !course) {
    return (
      <section className="section container">
        <div className="status error">{error || 'Course not found'}</div>
        <Link to="/courses" className="nav-back-btn" style={{ marginTop: 16 }}>
          <FiArrowLeft /> Back to catalog
        </Link>
      </section>
    )
  }

  // 1. NO PUBLISHED ASSESSMENT EMPTY STATE
  if (!assessment) {
    return (
      <section className="section container" style={{ maxWidth: 800, margin: '40px auto' }}>
        <Link to={`/courses/${courseId}`} className="nav-back-btn" style={{ marginBottom: 20 }}>
          <FiArrowLeft /> Back to Course Details
        </Link>
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <FiAward size={48} className="muted" style={{ marginBottom: 14 }} />
          <h2 style={{ marginBottom: 8 }}>Final assessment is not available yet.</h2>
          <p className="muted" style={{ fontSize: 14.5, maxWidth: 500, margin: '0 auto 20px' }}>
            The comprehensive final assessment for <strong>{course.title}</strong> is currently being prepared. Check back soon!
          </p>
          <Link to={`/courses/${courseId}`} className="btn btn-primary">
            Return to Course Lectures
          </Link>
        </div>
      </section>
    )
  }

  // 2. PREREQUISITE NOT MET LOCKED VIEW
  if (prerequisite && !prerequisite.isMet && !isTakingQuiz && !submitResult) {
    return (
      <section className="section container" style={{ maxWidth: 800, margin: '40px auto' }}>
        <Link to={`/courses/${courseId}`} className="nav-back-btn" style={{ marginBottom: 20 }}>
          <FiArrowLeft /> Back to Course Details
        </Link>

        <div className="card" style={{ padding: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
              }}
            >
              <FiLock size={24} />
            </div>
            <div>
              <span className="eyebrow" style={{ color: '#d97706' }}>Prerequisite Required</span>
              <h2 style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 800 }}>
                Complete All Lectures to Unlock Assessment
              </h2>
            </div>
          </div>

          <p style={{ fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 24 }}>
            To ensure the highest learning outcomes, students must complete all video lectures and curriculum material for <strong>{course.title}</strong> before taking the Final Course Assessment.
          </p>

          <div style={{ background: 'var(--bg-surface, rgba(0,0,0,0.02))', padding: 20, borderRadius: 8, border: '1px solid var(--line)', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>
              <span>Lecture Completion Progress</span>
              <span>{prerequisite.completedCount} / {prerequisite.totalCount} Lectures ({prerequisite.progressPercent}%)</span>
            </div>
            <div className="course-progress-bar-track" style={{ height: 10 }}>
              <div
                className="course-progress-bar-fill"
                style={{ width: `${prerequisite.progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Link to={`/courses/${courseId}`} className="btn btn-outline">
              Review Course
            </Link>
            <Link to={`/courses/${courseId}/lectures/1`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <FiBookOpen size={16} /> Continue Learning
            </Link>
          </div>
        </div>
      </section>
    )
  }

  // 3. ACTIVE QUIZ TAKING VIEW
  if (isTakingQuiz && assessment.questions && assessment.questions.length > 0) {
    const questions = assessment.questions
    const currentQ = questions[currentQIndex]
    const answeredCount = Object.keys(selectedAnswers).length
    const progressPct = Math.round(((currentQIndex + 1) / questions.length) * 100)
    const isLastQ = currentQIndex === questions.length - 1

    return (
      <section className="section container" style={{ maxWidth: 880, margin: '20px auto 60px' }}>
        {/* Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              {course.title} • Final Assessment
            </span>
            <h2 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 800 }}>
              {assessment.title}
            </h2>
          </div>

          {timeRemainingSeconds !== null && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 20,
                background: timeRemainingSeconds < 300 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.1)',
                color: timeRemainingSeconds < 300 ? '#ef4444' : 'var(--primary)',
                fontWeight: 800,
                fontSize: 14,
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <FiClock size={16} />
              <span>Time Left: {formatTimer(timeRemainingSeconds)}</span>
            </div>
          )}
        </div>

        {/* Progress Tracker */}
        <div className="card" style={{ padding: '14px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>
            <span>Question {currentQIndex + 1} of {questions.length}</span>
            <span>{answeredCount} of {questions.length} Answered</span>
          </div>
          <div className="course-progress-bar-track" style={{ height: 8 }}>
            <div className="course-progress-bar-fill" style={{ width: `${progressPct}%` }}></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="card" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 4,
                background: 'rgba(59, 130, 246, 0.12)',
                color: 'var(--primary)',
              }}
            >
              Question #{currentQIndex + 1}
            </span>
            {currentQ.difficulty && (
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
                {currentQ.difficulty}
              </span>
            )}
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.45, margin: '0 0 16px' }}>
            {currentQ.question}
          </h3>

          {currentQ.codeSnippet && (
            <div style={{ marginBottom: 18 }}>
              <CodeBlock code={currentQ.codeSnippet} language="javascript" />
            </div>
          )}

          {/* Options Radio List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {currentQ.options?.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentQ._id] === optIdx
              const letter = String.fromCharCode(65 + optIdx) // A, B, C, D

              return (
                <div
                  key={optIdx}
                  onClick={() => handleOptionSelect(currentQ._id, optIdx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-surface, rgba(0,0,0,0.02))',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--line)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: isSelected ? 'var(--primary)' : 'var(--line)',
                      color: isSelected ? '#ffffff' : 'var(--muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {letter}
                  </span>
                  <span style={{ fontSize: 14.5, fontWeight: isSelected ? 700 : 500, color: 'var(--text-heading)' }}>
                    {opt}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Question Palette & Nav Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQIndex === 0}
            style={{ padding: '9px 18px', fontSize: 13.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <FiChevronLeft size={16} /> Previous
          </button>

          {/* Quick Palette Circles */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {questions.map((q, idx) => {
              const isAnswered = selectedAnswers[q._id] !== undefined
              const isCurrent = idx === currentQIndex
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentQIndex(idx)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    border: isCurrent ? '2px solid var(--primary)' : '1px solid var(--line)',
                    background: isAnswered ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    color: isAnswered ? '#10b981' : isCurrent ? 'var(--primary)' : 'var(--muted)',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                  title={`Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          {isLastQ ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                padding: '9px 24px',
                fontSize: 13.5,
                fontWeight: 700,
                background: '#10b981',
                borderColor: '#10b981',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Assessment ✓'}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              style={{ padding: '9px 20px', fontSize: 13.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              Next <FiChevronRight size={16} />
            </button>
          )}
        </div>
      </section>
    )
  }

  // 4. ASSESSMENT RESULTS / REVIEW VIEW
  const reviewAttempt = submitResult || activeReviewAttempt

  return (
    <section className="section container" style={{ maxWidth: 880, margin: '20px auto 60px' }}>
      <Link to={`/courses/${courseId}`} className="nav-back-btn" style={{ marginBottom: 20 }}>
        <FiArrowLeft /> Back to Course Details
      </Link>

      {/* Main Assessment Overview Card */}
      <div className="card" style={{ padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span className="eyebrow">{course.title}</span>
            <h1 style={{ margin: '4px 0 8px', fontSize: 24, fontWeight: 800 }}>
              {assessment.title}
            </h1>
            <p className="muted" style={{ fontSize: 14, margin: 0, maxWidth: 540 }}>
              {assessment.description}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge" style={{ background: 'var(--line)', fontSize: 12 }}>
                {assessment.questions?.length || 0} Questions
              </span>
              <span className="badge badge-warning" style={{ fontSize: 12 }}>
                Passing: {assessment.passingPercentage}%
              </span>
              {assessment.timeLimitMinutes > 0 && (
                <span className="badge" style={{ fontSize: 12 }}>
                  ⏱ {assessment.timeLimitMinutes} mins
                </span>
              )}
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleStartAssessment}
              style={{ padding: '10px 22px', fontSize: 14, fontWeight: 700, marginTop: 6 }}
            >
              {attempts.length > 0 ? 'Retry Assessment' : 'Start Assessment'}
            </button>
          </div>
        </div>

        {/* Results Banner if student has completed an attempt */}
        {reviewAttempt && (
          <div
            style={{
              marginTop: 24,
              padding: 24,
              borderRadius: 12,
              background: reviewAttempt.passed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: reviewAttempt.passed ? '1.5px solid rgba(16, 185, 129, 0.35)' : '1.5px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: reviewAttempt.passed ? '#10b981' : '#ef4444',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                {reviewAttempt.passed ? '🏆' : '🎯'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: reviewAttempt.passed ? '#10b981' : '#ef4444' }}>
                  {reviewAttempt.passed ? 'Assessment Passed! 🎉' : 'Assessment Not Passed'}
                </h3>
                <span style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 4, display: 'block' }}>
                  Score: <strong>{reviewAttempt.correctAnswers || reviewAttempt.score} / {reviewAttempt.totalQuestions}</strong> ({reviewAttempt.percentage}%) • Passing threshold: {reviewAttempt.passingPercentage}%
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {reviewAttempt.certificate?.certificateId && (
                <Link
                  to={`/certificate/${reviewAttempt.certificate.certificateId}`}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, padding: '8px 16px' }}
                >
                  <FiAward size={16} /> View Certificate
                </Link>
              )}
              {reviewAttempt.courseCompleted && (
                <div
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: '#10b981',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 13.5,
                  }}
                >
                  🎉 Course Completed!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Question by Question Review Accordion (if submitted attempt has review details) */}
      {reviewAttempt?.answersReview && reviewAttempt.answersReview.length > 0 && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 800 }}>
            Detailed Answers Review (Attempt #{reviewAttempt.attemptNumber})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviewAttempt.answersReview.map((q, idx) => (
              <div
                key={idx}
                style={{
                  padding: 18,
                  borderRadius: 8,
                  border: q.isCorrect ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                  background: q.isCorrect ? 'rgba(16, 185, 129, 0.03)' : 'rgba(239, 68, 68, 0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: q.isCorrect ? '#10b981' : '#ef4444' }}>
                    {q.isCorrect ? '✓ Correct' : '✗ Incorrect'} • Question {idx + 1}
                  </span>
                </div>

                <strong style={{ fontSize: 15, display: 'block', marginBottom: 12 }}>
                  {q.question}
                </strong>

                {q.codeSnippet && (
                  <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: 10, borderRadius: 6, fontSize: 12.5, margin: '8px 0 14px' }}>
                    <code>{q.codeSnippet}</code>
                  </pre>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '10px 0' }}>
                  {q.options?.map((opt, oIdx) => {
                    const isStudentChoice = q.selectedOption === oIdx
                    const isCorrectAnswer = q.correctAnswer === oIdx

                    let bg = 'var(--bg-surface, rgba(0,0,0,0.02))'
                    let border = '1px solid var(--line)'
                    let color = 'var(--text-heading)'

                    if (isCorrectAnswer) {
                      bg = 'rgba(16, 185, 129, 0.15)'
                      border = '1px solid #10b981'
                      color = '#10b981'
                    } else if (isStudentChoice && !isCorrectAnswer) {
                      bg = 'rgba(239, 68, 68, 0.12)'
                      border = '1px solid #ef4444'
                      color = '#ef4444'
                    }

                    return (
                      <div
                        key={oIdx}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 6,
                          fontSize: 13,
                          background: bg,
                          border,
                          color,
                          fontWeight: isCorrectAnswer || isStudentChoice ? 700 : 500,
                        }}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt}
                        {isCorrectAnswer && ' ✓ (Correct Answer)'}
                        {isStudentChoice && !isCorrectAnswer && ' ✗ (Your choice)'}
                      </div>
                    )
                  })}
                </div>

                {q.explanation && (
                  <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.45 }}>
                    <strong>Explanation: </strong>{q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Previous Attempts Table */}
      {attempts.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800 }}>
            Previous Attempts History ({attempts.length})
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '8px 12px', color: 'var(--muted)' }}>Attempt</th>
                <th style={{ padding: '8px 12px', color: 'var(--muted)' }}>Date</th>
                <th style={{ padding: '8px 12px', color: 'var(--muted)' }}>Score</th>
                <th style={{ padding: '8px 12px', color: 'var(--muted)' }}>Percentage</th>
                <th style={{ padding: '8px 12px', color: 'var(--muted)' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((att) => (
                <tr key={att._id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>#{att.attemptNumber}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>
                    {new Date(att.submittedAt || att.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {att.correctAnswers || att.score} / {att.totalQuestions}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                    {att.percentage}%
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {att.passed ? (
                      <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Passed</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>✗ Failed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
