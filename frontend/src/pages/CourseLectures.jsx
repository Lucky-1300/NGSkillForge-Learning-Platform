import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiPlay,
  FiClock,
  FiVideo,
  FiCheckCircle,
  FiCheck,
  FiBookOpen,
  FiCode,
  FiHelpCircle,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiMenu,
  FiX,
  FiBarChart2,
  FiFileText,
  FiCpu,
  FiSend,
  FiTrash2,
  FiAlertCircle,
  FiInfo,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import NotesRenderer, { CodeBlock } from '../components/NotesRenderer.jsx'
import { thumbnailForCourse } from '../assets/courseThumbnails.js'
import { useAuth } from '../context/authContext.js'
import './CourseLectures.css'

export default function CourseLectures() {
  const { courseId, lectureNumber } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // Course & Lecture States
  const [course, setCourse] = useState(null)
  const [lectures, setLectures] = useState([])
  const [modules, setModules] = useState([])
  const [currentLecture, setCurrentLecture] = useState(null)
  const [currentModule, setCurrentModule] = useState(null)
  const [content, setContent] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Completion & Progress
  const [completedLectures, setCompletedLectures] = useState([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [togglingComplete, setTogglingComplete] = useState(false)

  // UI States
  const [sidebarTab, setSidebarTab] = useState('content') // 'content' | 'about'
  const [activeTab, setActiveTab] = useState('notes') // 'notes' | 'tasks' | 'mcqs' | 'ai'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openModules, setOpenModules] = useState({})

  // Tasks Tab State
  const [revealedSolutions, setRevealedSolutions] = useState({})

  // MCQ Tab State
  const [mcqStep, setMcqStep] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [userAnswers, setUserAnswers] = useState([])
  const [quizFinished, setQuizFinished] = useState(false)

  // Ask AI Tab State
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiChatHistory, setAiChatHistory] = useState([])

  const activeItemRef = useRef(null)
  const chatEndRef = useRef(null)

  // LocalStorage Key for offline/guest completion persistence
  const storageKey = useMemo(() => `ng_completed_lectures_${courseId}`, [courseId])

  // Initial load: Fetch course metadata & all lectures list
  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError('')

    const targetNum = lectureNumber ? parseInt(lectureNumber, 10) : 1

    Promise.all([
      api.get(`/lectures/course/${courseId}`),
      api.get(`/lectures/course/${courseId}/${targetNum}`).catch(() => null),
      api.get(`/progress/course/${courseId}`).catch(() => null),
    ])
      .then(([allRes, singleRes, progressRes]) => {
        if (!isMounted) return

        const allData = allRes.data
        const singleData = singleRes?.data
        const progressData = progressRes?.data

        setCourse(allData.course || null)
        const list = allData.lectures || []
        setLectures(list)
        setModules(allData.modules || [])

        // Initialize completion from backend progress or localStorage
        let initialCompleted = progressData?.completedLectures || allData.completedLectures || []
        try {
          const localSaved = JSON.parse(localStorage.getItem(storageKey) || '[]')
          if (Array.isArray(localSaved) && localSaved.length > initialCompleted.length) {
            initialCompleted = [...new Set([...initialCompleted, ...localSaved])]
          }
        } catch {}
        setCompletedLectures(initialCompleted)

        // Find active lecture
        const matchedIndex = list.findIndex((l) => l.lectureNumber === targetNum)
        const activeIdx = matchedIndex >= 0 ? matchedIndex : 0
        setActiveIndex(activeIdx)

        if (singleData && singleData.lecture) {
          setCurrentLecture(singleData.lecture)
          setCurrentModule(singleData.module || null)
          setContent(singleData.content || null)
          setIsCompleted(
            singleData.isCompleted || initialCompleted.includes(singleData.lecture.lectureNumber)
          )

          // Record access timestamp in progress model
          if (singleData.lecture._id && isAuthenticated) {
            api.post(`/progress/lecture/${singleData.lecture._id}/access`).catch(() => {})
          }
        } else if (list[activeIdx]) {
          setCurrentLecture(list[activeIdx])
          setIsCompleted(initialCompleted.includes(list[activeIdx].lectureNumber))

          if (list[activeIdx]._id && isAuthenticated) {
            api.post(`/progress/lecture/${list[activeIdx]._id}/access`).catch(() => {})
          }
        }

        // Auto-expand module containing this lecture
        if (allData.modules) {
          const containingMod = allData.modules.find(
            (m) => targetNum >= m.startLecture && targetNum <= m.endLecture
          )
          if (containingMod) {
            setOpenModules({ [containingMod.moduleNumber]: true })
          } else if (allData.modules[0]) {
            setOpenModules({ [allData.modules[0].moduleNumber]: true })
          }
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
  }, [courseId, isAuthenticated])

  // On URL change / lecture navigation: fetch single lecture details & rich content
  useEffect(() => {
    if (!lectures.length) return
    const targetNum = lectureNumber ? parseInt(lectureNumber, 10) : 1
    const idx = lectures.findIndex((l) => l.lectureNumber === targetNum)
    if (idx >= 0 && idx !== activeIndex) {
      setActiveIndex(idx)
    }

    let isMounted = true
    api
      .get(`/lectures/course/${courseId}/${targetNum}`)
      .then(({ data }) => {
        if (!isMounted) return
        setCurrentLecture(data.lecture)
        setCurrentModule(data.module || null)
        setContent(data.content || null)
        setIsCompleted(
          data.isCompleted || completedLectures.includes(data.lecture?.lectureNumber)
        )

        // Record lecture access timestamp in progress model
        if (data.lecture?._id && isAuthenticated) {
          api.post(`/progress/lecture/${data.lecture._id}/access`).catch(() => {})
        }

        // Auto-expand current module
        if (data.module?.moduleNumber) {
          setOpenModules((prev) => ({ ...prev, [data.module.moduleNumber]: true }))
        }

        // Reset Quiz, Tasks & AI UI states for new lecture
        setMcqStep(0)
        setSelectedOption(null)
        setIsAnswerSubmitted(false)
        setUserAnswers([])
        setQuizFinished(false)
        setRevealedSolutions({})
        setAiQuestion('')
        setAiLoading(false)
        setAiError('')
        setAiChatHistory([])
      })
      .catch(() => {
        if (isMounted && lectures[idx]) {
          setCurrentLecture(lectures[idx])
        }
      })

    return () => {
      isMounted = false
    }
  }, [lectureNumber, courseId, lectures.length, isAuthenticated])

  // Auto-scroll active sidebar item into view
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [activeIndex, activeTab])

  // Auto-scroll chat thread when message added
  useEffect(() => {
    if (activeTab === 'ai' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [aiChatHistory.length, aiLoading, activeTab])

  // Select a lecture
  const selectLecture = (index) => {
    if (index < 0 || index >= lectures.length) return
    setActiveIndex(index)
    const targetLecture = lectures[index]
    navigate(`/courses/${courseId}/lectures/${targetLecture.lectureNumber}`)
    setSidebarOpen(false)
  }

  // Previous & Next Navigation
  const handlePrev = () => {
    if (activeIndex > 0) selectLecture(activeIndex - 1)
  }

  const handleNext = () => {
    if (activeIndex < lectures.length - 1) selectLecture(activeIndex + 1)
  }

  // Toggle Module Accordion
  const toggleModuleAccordion = (modNum) => {
    setOpenModules((prev) => ({
      ...prev,
      [modNum]: !prev[modNum],
    }))
  }

  // Toggle Lecture Complete
  const handleToggleComplete = async () => {
    if (!currentLecture) return
    const targetNum = currentLecture.lectureNumber
    const willBeComplete = !isCompleted

    // Immediate optimistic update
    setIsCompleted(willBeComplete)
    const updatedList = willBeComplete
      ? [...new Set([...completedLectures, targetNum])]
      : completedLectures.filter((n) => n !== targetNum)

    setCompletedLectures(updatedList)

    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedList))
    } catch {}

    setTogglingComplete(true)
    try {
      if (currentLecture._id && isAuthenticated) {
        const { data } = await api.post(`/progress/lecture/${currentLecture._id}/complete`, {
          completed: willBeComplete,
        })
        if (data && data.courseProgress) {
          // Re-fetch course progress to ensure all numbers are fresh
          api.get(`/progress/course/${courseId}`).then((pRes) => {
            if (pRes.data && Array.isArray(pRes.data.completedLectures)) {
              setCompletedLectures(pRes.data.completedLectures)
            }
          }).catch(() => {})
        }
      } else {
        const { data } = await api.post(
          `/lectures/course/${courseId}/${targetNum}/toggle-complete`
        )
        if (data && Array.isArray(data.completedLectures)) {
          setCompletedLectures(data.completedLectures)
          setIsCompleted(data.isCompleted)
        }
      }

      toast.success(
        willBeComplete ? '✓ Lecture marked as complete!' : 'Lecture marked as incomplete'
      )
    } catch {
      // Fallback
      try {
        await api.post(`/lectures/course/${courseId}/${targetNum}/toggle-complete`)
      } catch {}
      toast.info(willBeComplete ? '✓ Lecture marked complete' : 'Lecture marked incomplete')
    } finally {
      setTogglingComplete(false)
    }
  }

  // Task Solution Toggle
  const toggleSolution = (taskIdx) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [taskIdx]: !prev[taskIdx],
    }))
  }

  // MCQ Quiz Handlers
  const handleMcqSubmit = (correctAnswer) => {
    if (selectedOption === null) return
    setIsAnswerSubmitted(true)
    const isCorrect = selectedOption === correctAnswer
    setUserAnswers((prev) => [...prev, { selected: selectedOption, isCorrect }])
  }

  const handleNextMcq = (totalQuestions) => {
    if (mcqStep < totalQuestions - 1) {
      setMcqStep((prev) => prev + 1)
      setSelectedOption(null)
      setIsAnswerSubmitted(false)
    } else {
      setQuizFinished(true)
    }
  }

  const handleRetryQuiz = () => {
    setMcqStep(0)
    setSelectedOption(null)
    setIsAnswerSubmitted(false)
    setUserAnswers([])
    setQuizFinished(false)
  }

  // Ask AI Assistant Handlers
  const handleAskAI = async (overridePrompt) => {
    const promptToSend = (overridePrompt || aiQuestion || '').trim()
    const targetLecture = currentLecture || lectures[activeIndex]
    if (!promptToSend || !targetLecture || aiLoading) return

    setAiError('')
    setAiQuestion('')
    const userMsg = { role: 'user', content: promptToSend, timestamp: new Date() }
    setAiChatHistory((prev) => [...prev, userMsg])
    setAiLoading(true)

    try {
      const { data } = await api.post(`/ai/lecture/${targetLecture._id}/ask`, {
        message: promptToSend,
        question: promptToSend,
        conversationHistory: aiChatHistory.map((m) => ({ role: m.role, content: m.content })),
      })

      if (data && data.success && data.answer) {
        const aiMsg = {
          role: 'assistant',
          content: data.answer,
          model: data.metadata?.model || data.model,
          timestamp: new Date(),
        }
        setAiChatHistory((prev) => [...prev, aiMsg])
      } else {
        throw new Error(data?.message || 'Failed to get answer from AI tutor')
      }
    } catch (err) {
      const errMsg = messageFrom(err) || 'Failed to get response from AI tutor. Please try again.'
      setAiError(errMsg)
      toast.error(errMsg)
    } finally {
      setAiLoading(false)
    }
  }

  const handleClearAIChat = () => {
    setAiChatHistory([])
    setAiError('')
  }

  // Calculate Course Progress Percentage
  const progressPercent = useMemo(() => {
    if (!lectures.length) return 0
    return Math.min(100, Math.round((completedLectures.length / lectures.length) * 100))
  }, [completedLectures.length, lectures.length])

  // Active Lecture
  const activeLecture = currentLecture || lectures[activeIndex] || lectures[0]
  const isFirst = activeIndex === 0
  const isLast = activeIndex === lectures.length - 1

  if (loading) {
    return (
      <div className="learn-page-wrapper">
        <section className="section container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <Loader />
        </section>
      </div>
    )
  }

  if (error || !course || !lectures.length) {
    return (
      <div className="learn-page-wrapper">
        <section className="section container" style={{ padding: '60px 0' }}>
          <div className="status error" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <h2>{error || 'No video lectures found for this course'}</h2>
            <p style={{ marginTop: 8 }}>
              {error ? 'Please try again or return to the course catalog.' : 'Lectures for this course have not been imported yet.'}
            </p>
            <Link to={`/courses/${courseId}`} className="btn btn-primary" style={{ marginTop: 16 }}>
              <FiArrowLeft /> Back to Course
            </Link>
          </div>
        </section>
      </div>
    )
  }

  const courseThumbnail = thumbnailForCourse(course)
  const currentMcq = content?.mcqs?.[mcqStep] || null
  const quizScore = userAnswers.filter((a) => a.isCorrect).length

  return (
    <div className="learn-page-wrapper">
      {/* Mobile Top Bar (Only shown on small screens) */}
      <div className="learn-mobile-bar">
        <Link to={`/courses/${course._id || courseId}`} className="learn-back-link">
          <FiArrowLeft /> Back to Course
        </Link>
        <button
          className="learn-mobile-toggle-btn"
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label="Toggle Course Content"
        >
          {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          <span>Curriculum</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="learn-layout-container">
        {/* Left Sidebar: Course Content & Modules */}
        <aside className={`learn-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {/* Top Back Link */}
          <div className="sidebar-top-back-wrap">
            <Link to={`/courses/${course._id || courseId}`} className="sidebar-back-link">
              <FiArrowLeft size={14} /> Back to Course
            </Link>
          </div>

          {/* Course Overview Card */}
          <div className="sidebar-course-card">
            <div className="sidebar-course-card-top">
              <div className="sidebar-course-thumb-box">
                {courseThumbnail ? (
                  <img src={courseThumbnail} alt="" className="sidebar-course-thumb" />
                ) : (
                  <div className="sidebar-course-thumb-fallback">{course.title.slice(0, 1)}</div>
                )}
              </div>

              <div className="sidebar-course-details">
                <h2 className="sidebar-course-title">{course.title}</h2>
                <div className="sidebar-course-meta">
                  <span>{lectures.length} Lectures</span>
                  <span className="meta-dot">•</span>
                  <span>{course.duration || '5 weeks'}</span>
                </div>
                <div className="sidebar-progress-row">
                  <div className="sidebar-progress-track">
                    <div
                      className="sidebar-progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <span className="sidebar-progress-pct">{progressPercent}%</span>
                </div>
              </div>
            </div>

            {/* Sidebar View Switcher Tabs */}
            <div className="sidebar-nav-tabs">
              <button
                type="button"
                className={`sidebar-tab-btn ${sidebarTab === 'content' ? 'active' : ''}`}
                onClick={() => setSidebarTab('content')}
              >
                Course Content
              </button>
              <button
                type="button"
                className={`sidebar-tab-btn ${sidebarTab === 'about' ? 'active' : ''}`}
                onClick={() => setSidebarTab('about')}
              >
                About Course
              </button>
            </div>
          </div>

          {/* Module Accordions List (When 'Course Content' tab is active) */}
          {sidebarTab === 'content' ? (
            <div className="sidebar-modules-list">
              {modules.map((mod) => {
                const isExpanded = openModules[mod.moduleNumber] !== false
                const modCompletedCount = mod.lectures.filter((l) =>
                  completedLectures.includes(l.lectureNumber)
                ).length
                const isModActive = mod.lectures.some(
                  (l) => l.lectureNumber === activeLecture?.lectureNumber
                )

                return (
                  <div
                    key={mod.moduleNumber}
                    className={`sidebar-module-block ${isModActive ? 'active-module' : ''}`}
                  >
                    <button
                      type="button"
                      className="sidebar-module-header"
                      onClick={() => toggleModuleAccordion(mod.moduleNumber)}
                    >
                      <div className="sidebar-module-header-left">
                        {isExpanded ? (
                          <FiChevronDown className="module-chevron" />
                        ) : (
                          <FiChevronRight className="module-chevron" />
                        )}
                        <span className="sidebar-module-title">{mod.title}</span>
                      </div>
                      <span className="sidebar-module-badge">
                        {modCompletedCount}/{mod.totalLectures} ({mod.totalLectures > 0 ? Math.round((modCompletedCount / mod.totalLectures) * 100) : 0}%)
                        <FiChevronDown size={11} className="badge-chevron" />
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="sidebar-lectures-group">
                        {mod.lectures.map((lec) => {
                          const isLecActive = lec.lectureNumber === activeLecture?.lectureNumber
                          const isLecDone = completedLectures.includes(lec.lectureNumber)
                          const lecIdx = lectures.findIndex(
                            (x) => x.lectureNumber === lec.lectureNumber
                          )

                          return (
                            <button
                              key={lec._id || lec.lectureNumber}
                              ref={isLecActive ? activeItemRef : null}
                              type="button"
                              className={`sidebar-lecture-row ${isLecActive ? 'active' : ''} ${
                                isLecDone ? 'completed' : ''
                              }`}
                              onClick={() => selectLecture(lecIdx)}
                            >
                              <span className="lecture-status-icon">
                                {isLecDone ? (
                                  <span className="status-badge-done">
                                    <FiCheck size={11} />
                                  </span>
                                ) : isLecActive ? (
                                  <span className="status-badge-active">
                                    <FiPlay size={10} style={{ marginLeft: 1 }} />
                                  </span>
                                ) : (
                                  <span className="status-badge-pending">○</span>
                                )}
                              </span>

                              <div className="sidebar-lecture-info">
                                <span className="sidebar-lecture-title">
                                  {String(lec.lectureNumber).padStart(2, '0')}. {lec.title}
                                </span>
                              </div>

                              {lec.duration && (
                                <span className="sidebar-lecture-duration">{lec.duration}</span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            /* 'About Course' Sidebar Tab View */
            <div className="sidebar-about-pane">
              <h3 className="about-pane-title">About this Course</h3>
              <p className="about-pane-desc">
                {course.description ||
                  'Learn industry-standard concepts with practical hands-on exercises and quizzes.'}
              </p>
              <div className="about-pane-meta-list">
                <div className="about-meta-item">
                  <span className="about-meta-label">Category:</span>
                  <span className="about-meta-val">{course.category || 'Development'}</span>
                </div>
                <div className="about-meta-item">
                  <span className="about-meta-label">Level:</span>
                  <span className="about-meta-val">{course.level || 'All Levels'}</span>
                </div>
                <div className="about-meta-item">
                  <span className="about-meta-label">Instructor:</span>
                  <span className="about-meta-val">{course.instructor || 'NGSkillForge'}</span>
                </div>
              </div>
              <Link to={`/courses/${course._id || courseId}`} className="btn btn-outline about-view-btn">
                View Full Course Page →
              </Link>
            </div>
          )}
        </aside>

        {/* Backdrop for Mobile Sidebar Drawer */}
        {sidebarOpen && (
          <div className="learn-backdrop" onClick={() => setSidebarOpen(false)}></div>
        )}

        {/* Right Stage: Learning Area */}
        <main className="learn-main-stage">
          {/* Top Breadcrumb & Mark as Complete Row */}
          <div className="learn-top-stage-row">
            <div className="learn-stage-breadcrumbs">
              <Link to={`/courses/${course._id || courseId}`} className="stage-bc-link">
                {course.title}
              </Link>
              <span className="stage-bc-sep">&gt;</span>
              {currentModule && (
                <>
                  <span className="stage-bc-link">{currentModule.title}</span>
                  <span className="stage-bc-sep">&gt;</span>
                </>
              )}
              <span className="stage-bc-active">
                Lecture {String(activeLecture?.lectureNumber || 1).padStart(2, '0')}
              </span>
            </div>

            <button
              className={`learn-mark-complete-btn ${isCompleted ? 'completed' : ''}`}
              onClick={handleToggleComplete}
              disabled={togglingComplete}
            >
              {isCompleted ? (
                <>
                  <FiCheckCircle size={15} />
                  <span>Completed</span>
                </>
              ) : (
                <>
                  <FiCheck size={15} />
                  <span>Mark as Complete</span>
                </>
              )}
            </button>
          </div>

          {/* Lecture Title & Metadata Row */}
          <div className="learn-lecture-heading-box">
            <h1 className="learn-lecture-title">
              Lecture {String(activeLecture.lectureNumber).padStart(2, '0')}: {activeLecture.title}
            </h1>

            <div className="learn-lecture-meta-tags">
              {activeLecture.duration && (
                <span className="stage-meta-tag">
                  <FiClock size={13} /> {activeLecture.duration}
                </span>
              )}
              <span className="stage-meta-tag">
                <FiVideo size={13} /> YouTube Lecture
              </span>
              <span className="stage-meta-tag">
                <FiBarChart2 size={13} /> {course.level || 'Beginner'}
              </span>
              {currentModule && (
                <span className="stage-meta-tag">
                  <FiFileText size={13} /> {currentModule.title}
                </span>
              )}
            </div>
          </div>

          {/* YouTube Video Player Embed */}
          <div className="learn-video-wrapper">
            <iframe
              src={`https://www.youtube.com/embed/${activeLecture.youtubeVideoId}?autoplay=0&rel=0`}
              title={activeLecture.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>

          {/* Prev / Next Navigation Controls */}
          <div className="learn-nav-bar">
            <button
              type="button"
              className="learn-nav-btn prev"
              disabled={isFirst}
              onClick={handlePrev}
            >
              <FiChevronLeft size={16} /> Previous Lecture
            </button>

            <button
              type="button"
              className="learn-nav-btn next"
              disabled={isLast}
              onClick={handleNext}
            >
              Next Lecture <FiChevronRight size={16} />
            </button>
          </div>

          {/* Learning Content Section & Modern Tabs */}
          <section className="learn-content-tabs-section">
            <div className="learn-tabs-header" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'notes'}
                className={`learn-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                <FiBookOpen size={16} />
                <span>Notes</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'tasks'}
                className={`learn-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveTab('tasks')}
              >
                <FiCode size={16} />
                <span>Tasks</span>
                {content?.tasks?.length > 0 && (
                  <span className="tab-count-badge">{content.tasks.length}</span>
                )}
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'mcqs'}
                className={`learn-tab-btn ${activeTab === 'mcqs' ? 'active' : ''}`}
                onClick={() => setActiveTab('mcqs')}
              >
                <FiHelpCircle size={16} />
                <span>MCQs</span>
                {content?.mcqs?.length > 0 && (
                  <span className="tab-count-badge">{content.mcqs.length}</span>
                )}
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'ai'}
                className={`learn-tab-btn ai-tab ${activeTab === 'ai' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai')}
              >
                <FiCpu size={16} />
                <span>Ask AI</span>
                <span className="tab-ai-pill">Tutor</span>
              </button>
            </div>

            {/* TAB 1: Notes Content */}
            {activeTab === 'notes' && (
              <div className="learn-tab-pane">
                {content?.notes ? (
                  <div className="notes-container-layout">
                    <div className="notes-main-column">
                      <NotesRenderer content={content.notes} />
                    </div>

                    {/* Supporting Cards on Right Column */}
                    <div className="notes-side-column">
                      {/* Key Takeaways Card */}
                      {content?.keyTakeaways && content.keyTakeaways.length > 0 && (
                        <div className="support-card takeaways">
                          <div className="support-card-header">
                            <span className="support-card-icon">💡</span>
                            <h3>Key Takeaways</h3>
                          </div>
                          <ul className="takeaways-list">
                            {content.keyTakeaways.map((point, idx) => (
                              <li key={idx}>
                                <span className="takeaway-bullet">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Important Note Callout */}
                      {content?.importantNote && (
                        <div className="support-card important">
                          <div className="support-card-header">
                            <span className="support-card-icon">📗</span>
                            <h3>Important Note</h3>
                          </div>
                          <p>{content.importantNote}</p>
                        </div>
                      )}

                      {/* Useful Resources */}
                      {content?.usefulResources && content.usefulResources.length > 0 && (
                        <div className="support-card resources">
                          <div className="support-card-header">
                            <span className="support-card-icon">🔗</span>
                            <h3>Useful Resources</h3>
                          </div>
                          <ul className="resources-list">
                            {content.usefulResources.map((res, idx) => (
                              <li key={idx}>
                                <a
                                  href={res.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="resource-link"
                                >
                                  <span className="resource-bullet">•</span>
                                  <span>{res.title}</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="content-empty-placeholder">
                    <div className="placeholder-icon-wrap">📖</div>
                    <h3>Notes are not available for this lecture yet.</h3>
                    <p>
                      Official notes will be published for this lecture soon. In the meantime, watch the video above to follow the instructor.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Practice Tasks Content */}
            {activeTab === 'tasks' && (
              <div className="learn-tab-pane">
                <div className="tasks-container">
                  <div className="tasks-header-banner">
                    <h2>💻 Hands-on Practice Tasks</h2>
                    <p>
                      Apply what you learned in this lecture by solving the exercises below.
                    </p>
                  </div>

                  {content?.tasks && content.tasks.length > 0 ? (
                    <div className="tasks-list">
                      {content.tasks.map((task, tIdx) => {
                        const isRevealed = revealedSolutions[tIdx]
                        const diffClass = (task.difficulty || 'Easy').toLowerCase()

                        return (
                          <div key={tIdx} className="task-card">
                            <div className="task-card-header">
                              <div className="task-title-area">
                                <span className="task-num-badge">Task {tIdx + 1}</span>
                                <h3 className="task-title">{task.title}</h3>
                              </div>
                              <span className={`task-diff-pill ${diffClass}`}>
                                {task.difficulty || 'Easy'}
                              </span>
                            </div>

                            <p className="task-description">{task.description}</p>

                            {task.expectedLearningOutcome && (
                              <div className="task-learning-outcome">
                                <strong>🎯 Learning Outcome:</strong> {task.expectedLearningOutcome}
                              </div>
                            )}

                            {task.requirements && task.requirements.length > 0 && (
                              <div className="task-requirements">
                                <strong>Requirements:</strong>
                                <ul>
                                  {task.requirements.map((req, rIdx) => (
                                    <li key={rIdx}>{req}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {task.starterCode && (
                              <div className="task-code-section">
                                <div className="task-code-title">Starter Template</div>
                                <CodeBlock code={task.starterCode} />
                              </div>
                            )}

                            {task.solution && (
                              <div className="task-solution-box">
                                <button
                                  type="button"
                                  className="task-solution-toggle-btn"
                                  onClick={() => toggleSolution(tIdx)}
                                >
                                  {isRevealed ? (
                                    <>
                                      <FiEyeOff size={14} /> Hide Solution
                                    </>
                                  ) : (
                                    <>
                                      <FiEye size={14} /> Show Solution
                                    </>
                                  )}
                                </button>

                                {isRevealed && (
                                  <div className="task-revealed-solution">
                                    <CodeBlock code={task.solution} />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="content-empty-placeholder">
                      <div className="placeholder-icon-wrap">💻</div>
                      <h3>Practice tasks are not available for this lecture yet.</h3>
                      <p>
                        Practical exercises for this lecture will be published shortly.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: MCQ Quiz Content */}
            {activeTab === 'mcqs' && (
              <div className="learn-tab-pane">
                <div className="mcq-quiz-container">
                  {content?.mcqs && content.mcqs.length > 0 ? (
                    !quizFinished && currentMcq ? (
                      <div className="mcq-card">
                        <div className="mcq-header">
                          <div className="mcq-counter">
                            Question {mcqStep + 1} of {content.mcqs.length}
                          </div>
                          <div className="mcq-progress-dots">
                            {content.mcqs.map((_, dotIdx) => (
                              <span
                                key={dotIdx}
                                className={`mcq-dot ${
                                  dotIdx === mcqStep
                                    ? 'current'
                                    : dotIdx < userAnswers.length
                                    ? userAnswers[dotIdx]?.isCorrect
                                      ? 'correct'
                                      : 'incorrect'
                                    : ''
                                }`}
                              ></span>
                            ))}
                          </div>
                        </div>

                        <h3 className="mcq-question-text">{currentMcq.question}</h3>

                        {currentMcq.codeSnippet && (
                          <CodeBlock code={currentMcq.codeSnippet} />
                        )}

                        {/* Options List */}
                        <div className="mcq-options-list">
                          {currentMcq.options.map((optionText, optIdx) => {
                            const optLetter = String.fromCharCode(65 + optIdx)
                            const isSelected = selectedOption === optIdx
                            const isCorrectOpt = optIdx === currentMcq.correctAnswer

                            let optStateClass = ''
                            if (isAnswerSubmitted) {
                              if (isCorrectOpt) optStateClass = 'correct-choice'
                              else if (isSelected) optStateClass = 'wrong-choice'
                            } else if (isSelected) {
                              optStateClass = 'selected-choice'
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={isAnswerSubmitted}
                                className={`mcq-option-btn ${optStateClass}`}
                                onClick={() => setSelectedOption(optIdx)}
                              >
                                <span className="mcq-option-letter">{optLetter}</span>
                                <span className="mcq-option-label">{optionText}</span>
                              </button>
                            )
                          })}
                        </div>

                        {/* Submit or Next Question Action */}
                        {!isAnswerSubmitted ? (
                          <div className="mcq-action-row">
                            <button
                              type="button"
                              className="btn btn-primary mcq-submit-btn"
                              disabled={selectedOption === null}
                              onClick={() => handleMcqSubmit(currentMcq.correctAnswer)}
                            >
                              Submit Answer
                            </button>
                          </div>
                        ) : (
                          <div className="mcq-feedback-box">
                            <div
                              className={`mcq-feedback-alert ${
                                selectedOption === currentMcq.correctAnswer
                                  ? 'success'
                                  : 'error'
                              }`}
                            >
                              <strong>
                                {selectedOption === currentMcq.correctAnswer
                                  ? '✓ Correct!'
                                  : '✗ Incorrect!'}
                              </strong>
                              {currentMcq.explanation && (
                                <p className="mcq-explanation-text">
                                  {currentMcq.explanation}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              className="btn btn-primary mcq-next-q-btn"
                              onClick={() => handleNextMcq(content.mcqs.length)}
                            >
                              {mcqStep < content.mcqs.length - 1
                                ? 'Next Question →'
                                : 'View Quiz Summary →'}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Quiz Completed Score Summary Card */
                      <div className="quiz-summary-card">
                        <div className="quiz-summary-trophy">
                          {quizScore === content.mcqs.length ? '🏆' : '🎯'}
                        </div>
                        <h2>Quiz Completed!</h2>
                        <div className="quiz-score-pill">
                          Score: {quizScore} / {content.mcqs.length} (
                          {Math.round((quizScore / content.mcqs.length) * 100)}%)
                        </div>
                        <p className="quiz-summary-message">
                          {quizScore === content.mcqs.length
                            ? 'Excellent work! You got every question right.'
                            : 'Good effort! Review the notes and try again to master this lecture.'}
                        </p>

                        <div className="quiz-summary-actions">
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={handleRetryQuiz}
                          >
                            <FiRefreshCw /> Retry Quiz
                          </button>
                          {!isLast && (
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={handleNext}
                            >
                              Continue to Next Lecture →
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="content-empty-placeholder">
                      <div className="placeholder-icon-wrap">📝</div>
                      <h3>Quiz questions are not available for this lecture yet.</h3>
                      <p>
                        Self-assessment quizzes will be published for this lecture shortly.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: Ask NGSkillForge AI */}
            {activeTab === 'ai' && (
              <div className="learn-tab-pane">
                <div className="ai-tutor-container">
                  {/* AI Header */}
                  <div className="ai-tutor-header">
                    <div className="ai-tutor-identity">
                      <div className="ai-avatar-ring">
                        <span className="ai-avatar-icon">🤖</span>
                        <span className="ai-online-pulse"></span>
                      </div>
                      <div>
                        <div className="ai-title-row">
                          <h2 className="ai-tutor-title">NGSkillForge AI Learning Assistant</h2>
                          <span className="ai-model-tag">Groq LPU Powered</span>
                        </div>
                        <p className="ai-tutor-subtitle">
                          Ask anything about <strong>Lecture #{activeLecture.lectureNumber}: {activeLecture.title}</strong>. Grounded in verified lecture context & transcript.
                        </p>
                      </div>
                    </div>

                    {aiChatHistory.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-outline ai-clear-btn"
                        onClick={handleClearAIChat}
                        title="Clear conversation"
                      >
                        <FiTrash2 size={13} /> Clear Chat
                      </button>
                    )}
                  </div>

                  {/* Suggested Prompt Chips */}
                  <div className="ai-suggestions-bar">
                    <span className="ai-suggestions-label">💡 Suggested Questions:</span>
                    <div className="ai-chips-list">
                      <button
                        type="button"
                        className="ai-chip-btn"
                        onClick={() =>
                          handleAskAI(
                            `Can you explain the core concept of "${activeLecture.title}" in simple words with an intuitive analogy?`
                          )
                        }
                        disabled={aiLoading}
                      >
                        Explain concept simply
                      </button>
                      <button
                        type="button"
                        className="ai-chip-btn"
                        onClick={() =>
                          handleAskAI(
                            `Can you provide a clean, step-by-step code example demonstrating what is taught in Lecture #${activeLecture.lectureNumber}?`
                          )
                        }
                        disabled={aiLoading}
                      >
                        Step-by-step code example
                      </button>
                      <button
                        type="button"
                        className="ai-chip-btn"
                        onClick={() =>
                          handleAskAI(
                            `What common mistakes or edge cases should I watch out for in this topic?`
                          )
                        }
                        disabled={aiLoading}
                      >
                        Common pitfalls & tips
                      </button>
                      <button
                        type="button"
                        className="ai-chip-btn"
                        onClick={() =>
                          handleAskAI(
                            `Can you give me a hint on how to approach the practice coding tasks for this lecture?`
                          )
                        }
                        disabled={aiLoading}
                      >
                        Practice challenge hint
                      </button>
                    </div>
                  </div>

                  {/* Chat Conversation Thread */}
                  <div className="ai-conversation-thread">
                    {/* Welcome Introduction Bubble */}
                    <div className="ai-message-row assistant intro">
                      <div className="ai-msg-avatar">🤖</div>
                      <div className="ai-msg-bubble">
                        <div className="ai-msg-author">NGSkillForge AI Tutor</div>
                        <div className="ai-msg-text">
                          <p>
                            Hello! I am your AI learning assistant for <strong>{course.title}</strong>.
                            I have full pedagogical context for <strong>Lecture #{activeLecture.lectureNumber}: {activeLecture.title}</strong>.
                          </p>
                          <p style={{ marginTop: 8, fontSize: '13.5px', color: '#64748b' }}>
                            Ask me anything about what was taught in this video lecture, get concept clarifications, or request custom coding examples!
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Messages History */}
                    {aiChatHistory.map((msg, idx) => (
                      <div key={idx} className={`ai-message-row ${msg.role}`}>
                        <div className="ai-msg-avatar">
                          {msg.role === 'user' ? '👤' : '🤖'}
                        </div>
                        <div className="ai-msg-bubble">
                          <div className="ai-msg-author">
                            {msg.role === 'user' ? 'You' : 'NGSkillForge AI Tutor'}
                            <span className="ai-msg-time">
                              {msg.timestamp
                                ? new Date(msg.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : ''}
                            </span>
                          </div>
                          <div className="ai-msg-text">
                            {msg.role === 'assistant' ? (
                              <NotesRenderer content={msg.content} />
                            ) : (
                              <p>{msg.content}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Loading Indicator */}
                    {aiLoading && (
                      <div className="ai-message-row assistant typing">
                        <div className="ai-msg-avatar">🤖</div>
                        <div className="ai-msg-bubble loading">
                          <div className="ai-typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                          <span className="ai-typing-text">
                            AI is synthesizing an answer from the lecture context...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Error Banner in Thread */}
                    {aiError && (
                      <div className="ai-thread-error">
                        <FiAlertCircle size={15} />
                        <span>{aiError}</span>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Box Row */}
                  <form
                    className="ai-input-form"
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleAskAI()
                    }}
                  >
                    <div className="ai-input-wrapper">
                      <input
                        type="text"
                        className="ai-input-field"
                        placeholder={`Ask anything about Lecture #${activeLecture.lectureNumber} (e.g. 'Why is JS called the brain of a website?')...`}
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        disabled={aiLoading}
                      />
                      <button
                        type="submit"
                        className="ai-send-btn"
                        disabled={!aiQuestion.trim() || aiLoading}
                        title="Send question to AI tutor"
                      >
                        {aiLoading ? (
                          <FiRefreshCw size={15} className="spin-animation" />
                        ) : (
                          <>
                            <FiSend size={15} />
                            <span>Ask AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
