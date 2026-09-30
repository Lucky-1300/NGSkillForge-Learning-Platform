import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FiCpu,
  FiBookOpen,
  FiCode,
  FiHelpCircle,
  FiCheckCircle,
  FiCheckSquare,
  FiSquare,
  FiChevronDown,
  FiChevronRight,
  FiPlay,
  FiRefreshCw,
  FiUploadCloud,
  FiLayers,
  FiCheck,
  FiClock,
  FiEye,
  FiFileText,
  FiSend,
  FiAlertTriangle,
  FiArrowLeft,
  FiInfo,
} from 'react-icons/fi'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import { AdminSide } from './AdminDashboard.jsx'
import NotesRenderer from '../components/NotesRenderer.jsx'
import { thumbnailForCourse } from '../assets/courseThumbnails.js'

export default function ManageAIContent() {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [courseData, setCourseData] = useState(null)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [error, setError] = useState('')

  // Selection states
  const [selectedLectureIds, setSelectedLectureIds] = useState([])
  const [openModules, setOpenModules] = useState({})

  // Generation options
  const [generateNotes, setGenerateNotes] = useState(true)
  const [generateTasks, setGenerateTasks] = useState(true)
  const [generateMCQs, setGenerateMCQs] = useState(true)
  const [taskCount, setTaskCount] = useState(3)
  const [mcqCount, setMcqCount] = useState(5)

  // Pipeline Execution State
  const [generating, setGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(null) // { current, total, currentTitle, logs: [] }
  const [previewContent, setPreviewContent] = useState(null) // { lecture, content }
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [publishing, setPublishing] = useState(false)

  // AI Service status
  const [aiStatus, setAiStatus] = useState(null)

  // Fetch all courses on mount
  useEffect(() => {
    let isMounted = true
    Promise.all([
      api.get('/courses/all-courses?limit=100'),
      api.get('/ai/status').catch(() => ({ data: { configured: false } })),
    ])
      .then(([coursesRes, aiRes]) => {
        if (!isMounted) return
        const list = coursesRes.data.courses || []
        setCourses(list)
        setAiStatus(aiRes.data)
        if (list.length > 0) {
          setSelectedCourseId(list[0]._id)
        }
      })
      .catch((err) => {
        if (isMounted) setError(messageFrom(err))
      })
      .finally(() => {
        if (isMounted) setLoadingCourses(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Load course content status whenever selected course changes
  const loadCourseContentStatus = (courseId) => {
    if (!courseId) return
    setLoadingStatus(true)
    api
      .get(`/ai/course-status/${courseId}`)
      .then(({ data }) => {
        setCourseData(data)
        // Reset selections for new course
        setSelectedLectureIds([])
        // Open all module accordions by default
        if (data.modules) {
          const modMap = {}
          data.modules.forEach((m) => (modMap[m.moduleNumber] = true))
          setOpenModules(modMap)
        }
      })
      .catch((err) => {
        toast.error(messageFrom(err))
      })
      .finally(() => {
        setLoadingStatus(false)
      })
  }

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseContentStatus(selectedCourseId)
    }
  }, [selectedCourseId])

  // Select / Deselect lecture
  const toggleLectureSelection = (id) => {
    setSelectedLectureIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Select all lectures in a specific module
  const toggleModuleSelection = (moduleLectures) => {
    const moduleIds = moduleLectures.map((l) => l._id)
    const allSelected = moduleIds.every((id) => selectedLectureIds.includes(id))

    if (allSelected) {
      setSelectedLectureIds((prev) => prev.filter((id) => !moduleIds.includes(id)))
    } else {
      setSelectedLectureIds((prev) => [...new Set([...prev, ...moduleIds])])
    }
  }

  // Select / Deselect All in Course
  const toggleSelectAll = () => {
    if (!courseData?.lectures) return
    const allIds = courseData.lectures.map((l) => l._id)
    if (selectedLectureIds.length === allIds.length) {
      setSelectedLectureIds([])
    } else {
      setSelectedLectureIds(allIds)
    }
  }

  // Toggle Module Accordion
  const toggleAccordion = (modNum) => {
    setOpenModules((prev) => ({ ...prev, [modNum]: !prev[modNum] }))
  }

  // Trigger Content Generation Pipeline
  const handleGenerate = async () => {
    if (selectedLectureIds.length === 0) {
      return toast.warn('Please select at least one lecture.')
    }
    if (!generateNotes && !generateTasks && !generateMCQs) {
      return toast.warn('Please select at least one content type (Notes, Tasks, or MCQs).')
    }

    setGenerating(true)
    setGenerationProgress({
      current: 0,
      total: selectedLectureIds.length,
      currentTitle: 'Initializing AI content pipeline...',
      logs: [],
    })

    const logs = []
    let successCount = 0

    // Process sequentially to give live visual feedback and respect rate limits
    for (let i = 0; i < selectedLectureIds.length; i++) {
      const lecId = selectedLectureIds[i]
      const lec = courseData.lectures.find((l) => l._id === lecId)
      const lecTitle = lec ? `Lecture #${lec.lectureNumber}: ${lec.title}` : `Lecture ${i + 1}`

      setGenerationProgress({
        current: i + 1,
        total: selectedLectureIds.length,
        currentTitle: `Synthesizing ${lecTitle}...`,
        logs: [...logs, { status: 'loading', text: `Generating: ${lecTitle}` }],
      })

      try {
        const { data } = await api.post('/ai/generate-content', {
          lectureIds: [lecId],
          generateNotes,
          generateTasks,
          generateMCQs,
          taskCount,
          mcqCount,
        })

        const itemRes = data.results?.[0]
        if (itemRes && itemRes.success) {
          successCount++
          logs.push({
            status: 'success',
            text: `✓ ${lecTitle} → Generated ${itemRes.generatedItems?.join(', ') || 'Content'} (${itemRes.transcriptSource})`,
          })
        } else {
          logs.push({
            status: 'error',
            text: `✗ ${lecTitle} → ${itemRes?.error || 'Generation failed'}`,
          })
        }
      } catch (err) {
        logs.push({
          status: 'error',
          text: `✗ ${lecTitle} → ${messageFrom(err)}`,
        })
      }

      setGenerationProgress((prev) => ({
        ...prev,
        logs: [...logs],
      }))
    }

    toast.success(`Completed generation for ${successCount}/${selectedLectureIds.length} lectures!`)
    setGenerating(false)
    loadCourseContentStatus(selectedCourseId)
  }

  // Preview Generated Content
  const handlePreview = async (lec) => {
    setLoadingPreview(true)
    try {
      const { data } = await api.get(`/ai/content/${lec._id}`)
      setPreviewContent({
        lecture: lec,
        content: data.content,
      })
    } catch (err) {
      toast.info('No generated draft found for this lecture yet. You can generate it now.')
    } finally {
      setLoadingPreview(false)
    }
  }

  // Publish Single Lecture Content
  const handlePublishLecture = async (lectureId) => {
    setPublishing(true)
    try {
      const { data } = await api.post(`/ai/publish-content/${lectureId}`)
      toast.success(data.message || 'Lecture content published to live platform!')
      if (previewContent && previewContent.lecture._id === lectureId) {
        setPreviewContent((prev) => ({
          ...prev,
          content: { ...prev.content, status: 'published' },
        }))
      }
      loadCourseContentStatus(selectedCourseId)
    } catch (err) {
      toast.error(messageFrom(err))
    } finally {
      setPublishing(false)
    }
  }

  // Batch Publish All Course Drafts
  const handlePublishAllDrafts = async () => {
    if (!window.confirm('Publish all draft content for this course to make it visible to students?')) return
    setPublishing(true)
    try {
      const { data } = await api.post(`/ai/publish-course-content/${selectedCourseId}`)
      toast.success(data.message || 'All course draft content published successfully!')
      loadCourseContentStatus(selectedCourseId)
    } catch (err) {
      toast.error(messageFrom(err))
    } finally {
      setPublishing(false)
    }
  }

  const selectedCourse = useMemo(() => {
    return courses.find((c) => c._id === selectedCourseId) || null
  }, [courses, selectedCourseId])

  return (
    <div className="dashboard-layout">
      <AdminSide />
      <main className="dashboard-main" style={{ maxWidth: 1200 }}>
        {/* Header Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: 999, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
              <FiCpu size={14} /> AI Content Generator Studio
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 6px' }}>
              Generate Curriculum Content
            </h1>
            <p className="muted" style={{ fontSize: '14.5px', margin: 0 }}>
              Synthesize structured notes, coding tasks, and MCQ quizzes from YouTube transcripts using Groq AI.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {aiStatus?.configured ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
                Groq AI Online ({aiStatus.model || 'Llama 3.3 70B'})
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
                <FiAlertTriangle size={14} /> Groq API Key Required
              </span>
            )}
          </div>
        </div>

        {/* Studio Grid: Left Control Box & Right Pipeline Workspace */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }}>
          {/* Main Stage (Course & Lecture Selection) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Step 1: Select Course */}
            <div style={{ background: 'var(--bg-white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-xl)', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12 }}>1</span>
                  Select Course
                </label>
                {courseData?.stats && (
                  <div style={{ display: 'flex', gap: 8, fontSize: 12, fontWeight: 700 }}>
                    <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: 4 }}>
                      {courseData.stats.publishedCount} Published
                    </span>
                    <span style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '3px 8px', borderRadius: 4 }}>
                      {courseData.stats.draftCount} Drafts
                    </span>
                    <span style={{ color: 'var(--muted)', background: 'var(--line)', padding: '3px 8px', borderRadius: 4 }}>
                      {courseData.stats.missingCount} Missing
                    </span>
                  </div>
                )}
              </div>

              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--line)',
                  background: 'var(--bg-white)',
                  color: 'var(--text-heading)',
                  fontSize: '15px',
                  fontWeight: 600,
                }}
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} ({c.category} • {c.level})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Module / Lectures */}
            <div style={{ background: 'var(--bg-white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-xl)', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12 }}>2</span>
                  Select Module / Lectures
                  <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>
                    ({selectedLectureIds.length} of {courseData?.totalLectures || 0} selected)
                  </span>
                </label>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={toggleSelectAll}
                    style={{ padding: '6px 12px', fontSize: 12.5 }}
                  >
                    {selectedLectureIds.length === (courseData?.lectures?.length || 0)
                      ? 'Deselect All'
                      : 'Select All in Course'}
                  </button>
                  {courseData?.stats?.draftCount > 0 && (
                    <button
                      type="button"
                      className="btn"
                      onClick={handlePublishAllDrafts}
                      disabled={publishing}
                      style={{ padding: '6px 12px', fontSize: 12.5, background: '#10b981', color: '#fff' }}
                    >
                      <FiUploadCloud size={13} /> Publish All Drafts ({courseData.stats.draftCount})
                    </button>
                  )}
                </div>
              </div>

              {loadingStatus ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                  <Loader />
                </div>
              ) : courseData?.modules && courseData.modules.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {courseData.modules.map((mod) => {
                    const modLecIds = mod.lectures.map((l) => l._id)
                    const isAllModSelected = modLecIds.every((id) => selectedLectureIds.includes(id))
                    const isSomeModSelected = modLecIds.some((id) => selectedLectureIds.includes(id))
                    const isExpanded = openModules[mod.moduleNumber] !== false

                    return (
                      <div key={mod.moduleNumber} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                        {/* Module Header */}
                        <div
                          style={{
                            background: 'var(--bg-surface, rgba(0,0,0,0.02))',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: isExpanded ? '1px solid var(--line)' : 'none',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button
                              type="button"
                              onClick={() => toggleModuleSelection(mod.lectures)}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: isAllModSelected ? 'var(--primary)' : 'var(--muted)', padding: 0 }}
                            >
                              {isAllModSelected ? <FiCheckSquare size={18} /> : <FiSquare size={18} />}
                            </button>

                            <span
                              onClick={() => toggleAccordion(mod.moduleNumber)}
                              style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-heading)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                              {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                              {mod.title}
                            </span>
                          </div>

                          <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>
                            {mod.totalLectures} Lectures
                          </span>
                        </div>

                        {/* Lecture List */}
                        {isExpanded && (
                          <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 8px' }}>
                            {mod.lectures.map((lec) => {
                              const isChecked = selectedLectureIds.includes(lec._id)
                              const lecStatus = courseData.lectures.find((l) => l._id === lec._id)?.status || 'none'
                              const hasNotes = courseData.lectures.find((l) => l._id === lec._id)?.hasNotes
                              const tasksCount = courseData.lectures.find((l) => l._id === lec._id)?.tasksCount || 0
                              const mcqsCount = courseData.lectures.find((l) => l._id === lec._id)?.mcqsCount || 0

                              return (
                                <div
                                  key={lec._id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '9px 12px',
                                    borderRadius: 'var(--radius-md)',
                                    background: isChecked ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                    borderBottom: '1px solid rgba(0,0,0,0.03)',
                                    gap: 12,
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                                    <button
                                      type="button"
                                      onClick={() => toggleLectureSelection(lec._id)}
                                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: isChecked ? 'var(--primary)' : 'var(--muted)', padding: 0 }}
                                    >
                                      {isChecked ? <FiCheckSquare size={16} /> : <FiSquare size={16} />}
                                    </button>

                                    <div style={{ minWidth: 0 }}>
                                      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-heading)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {String(lec.lectureNumber).padStart(2, '0')}. {lec.title}
                                      </span>
                                      {lec.duration && (
                                        <span style={{ fontSize: 11.5, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                          <FiClock size={10} /> {lec.duration}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                    {/* Content Badges */}
                                    {hasNotes && (
                                      <span title="Notes available" style={{ fontSize: 11, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                                        Notes
                                      </span>
                                    )}
                                    {tasksCount > 0 && (
                                      <span title={`${tasksCount} Tasks`} style={{ fontSize: 11, background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                                        {tasksCount} Tasks
                                      </span>
                                    )}
                                    {mcqsCount > 0 && (
                                      <span title={`${mcqsCount} MCQs`} style={{ fontSize: 11, background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                                        {mcqsCount} MCQs
                                      </span>
                                    )}

                                    {/* Status Badge */}
                                    {lecStatus === 'published' ? (
                                      <span style={{ fontSize: 11, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '2px 8px', borderRadius: 4, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                        <FiCheck size={11} /> Published
                                      </span>
                                    ) : lecStatus === 'draft' ? (
                                      <span style={{ fontSize: 11, background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                                        Draft
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: 11, background: 'var(--line)', color: 'var(--muted)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                                        Empty
                                      </span>
                                    )}

                                    <button
                                      type="button"
                                      className="btn btn-outline"
                                      onClick={() => handlePreview(lec)}
                                      style={{ padding: '4px 8px', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                    >
                                      <FiEye size={12} /> Preview
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="muted" style={{ textAlign: 'center', padding: 20 }}>No lectures imported for this course yet.</p>
              )}
            </div>
          </div>

          {/* Right Sidebar: Step 3 (Choose) & Step 4 (Generate Pipeline) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 90 }}>
            {/* Step 3: Choose Content Components */}
            <div style={{ background: 'var(--bg-white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-xl)', padding: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12 }}>3</span>
                Choose Content to Generate
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Notes Checkbox */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: generateNotes ? 'rgba(59, 130, 246, 0.06)' : 'var(--bg-surface, rgba(0,0,0,0.02))',
                    border: generateNotes ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid var(--line)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={generateNotes}
                    onChange={(e) => setGenerateNotes(e.target.checked)}
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <strong style={{ fontSize: 13.5, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiBookOpen size={14} color="#3b82f6" /> Educational Notes
                    </strong>
                    <span style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginTop: 2 }}>
                      Structured concepts, code snippets, important rules & takeaways.
                    </span>
                  </div>
                </label>

                {/* Tasks Checkbox */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: generateTasks ? 'rgba(168, 85, 247, 0.06)' : 'var(--bg-surface, rgba(0,0,0,0.02))',
                    border: generateTasks ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid var(--line)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={generateTasks}
                    onChange={(e) => setGenerateTasks(e.target.checked)}
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <strong style={{ fontSize: 13.5, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiCode size={14} color="#a855f7" /> Practice Tasks
                    </strong>
                    <span style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginTop: 2 }}>
                      Hands-on challenges with requirements, starter code & solutions.
                    </span>
                  </div>
                </label>

                {/* MCQs Checkbox */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: generateMCQs ? 'rgba(236, 72, 153, 0.06)' : 'var(--bg-surface, rgba(0,0,0,0.02))',
                    border: generateMCQs ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid var(--line)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={generateMCQs}
                    onChange={(e) => setGenerateMCQs(e.target.checked)}
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <strong style={{ fontSize: 13.5, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiHelpCircle size={14} color="#ec4899" /> MCQ Quizzes
                    </strong>
                    <span style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginTop: 2 }}>
                      Multiple choice questions with correct answer & explanation.
                    </span>
                  </div>
                </label>
              </div>

              {/* Counts Customizer */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Tasks Count</label>
                  <select
                    value={taskCount}
                    onChange={(e) => setTaskCount(Number(e.target.value))}
                    disabled={!generateTasks}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 13, background: 'var(--bg-white)' }}
                  >
                    <option value={2}>2 Tasks</option>
                    <option value={3}>3 Tasks</option>
                    <option value={4}>4 Tasks</option>
                    <option value={5}>5 Tasks</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>MCQs Count</label>
                  <select
                    value={mcqCount}
                    onChange={(e) => setMcqCount(Number(e.target.value))}
                    disabled={!generateMCQs}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 13, background: 'var(--bg-white)' }}
                  >
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={7}>7 Questions</option>
                    <option value={10}>10 Questions</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 4: Trigger Generator */}
            <div style={{ background: 'var(--bg-white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-xl)', padding: 20 }}>
              <button
                type="button"
                className="btn btn-primary"
                disabled={generating || selectedLectureIds.length === 0}
                onClick={handleGenerate}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {generating ? (
                  <>
                    <FiRefreshCw className="spin" size={16} /> Generating AI Drafts...
                  </>
                ) : (
                  <>
                    <FiCpu size={16} />
                    Generate Drafts ({selectedLectureIds.length})
                  </>
                )}
              </button>

              <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', margin: '10px 0 0', lineHeight: 1.4 }}>
                Pipeline: Fetches transcript → Groq AI synthesizes content → Saves as Draft in MongoDB.
              </p>
            </div>
          </div>
        </div>

        {/* Live Generation Progress Modal / Drawer */}
        {generating && generationProgress && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              display: 'grid',
              placeItems: 'center',
              padding: 20,
            }}
          >
            <div
              style={{
                background: 'var(--bg-white)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-xl)',
                width: '100%',
                maxWidth: 580,
                padding: 28,
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <FiRefreshCw className="spin" size={24} color="var(--primary)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Groq AI Generation in Progress</h3>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                    Processing {generationProgress.current} of {generationProgress.total} lectures
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 8, background: 'var(--line)', borderRadius: 999, overflow: 'hidden', margin: '16px 0' }}>
                <div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                    width: `${Math.round((generationProgress.current / generationProgress.total) * 100)}%`,
                    transition: 'width 0.3s ease',
                  }}
                ></div>
              </div>

              <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-heading)', margin: '8px 0 16px' }}>
                {generationProgress.currentTitle}
              </p>

              {/* Live Log Window */}
              <div
                style={{
                  background: 'var(--bg-surface, #0f172a)',
                  color: '#e2e8f0',
                  borderRadius: 8,
                  padding: 14,
                  fontSize: 12.5,
                  fontFamily: 'monospace',
                  maxHeight: 180,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                {generationProgress.logs.map((log, idx) => (
                  <div
                    key={idx}
                    style={{
                      color: log.status === 'success' ? '#34d399' : log.status === 'error' ? '#f87171' : '#93c5fd',
                    }}
                  >
                    {log.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview Content Drawer / Modal */}
        {previewContent && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <div
              style={{
                background: 'var(--bg-white)',
                width: '100%',
                maxWidth: 750,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-xl)',
                overflow: 'hidden',
              }}
            >
              {/* Drawer Top Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                    Lecture #{previewContent.lecture.lectureNumber} • Content Preview
                  </span>
                  <h3 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 800 }}>
                    {previewContent.lecture.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {previewContent.content?.status === 'published' ? (
                    <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '6px 12px', borderRadius: 6 }}>
                      ✓ Live Published
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn"
                      disabled={publishing}
                      onClick={() => handlePublishLecture(previewContent.lecture._id)}
                      style={{ background: '#10b981', color: '#fff', padding: '8px 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <FiUploadCloud size={14} /> Publish to Live
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setPreviewContent(null)}
                    style={{ padding: '8px 14px', fontSize: 13 }}
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Drawer Content Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Source Metadata */}
                {previewContent.content?.sourceContext && (
                  <div style={{ background: 'var(--bg-surface, rgba(0,0,0,0.02))', border: '1px solid var(--line)', borderRadius: 8, padding: 14, fontSize: 13 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>Generation Source: </span>
                    <span className="muted">
                      {previewContent.content.sourceContext.transcriptAvailable
                        ? `YouTube Transcript (${previewContent.content.sourceContext.transcriptLanguage || 'en'})`
                        : 'Course Metadata & Syllabus Guidelines'}
                    </span>
                  </div>
                )}

                {/* Notes Section */}
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiBookOpen color="#3b82f6" /> Educational Notes
                  </h4>
                  {previewContent.content?.notes ? (
                    <div style={{ background: 'var(--bg-white)', border: '1px solid var(--line)', borderRadius: 8, padding: 18 }}>
                      <NotesRenderer markdown={previewContent.content.notes} />
                    </div>
                  ) : (
                    <p className="muted" style={{ fontStyle: 'italic' }}>No notes generated for this lecture.</p>
                  )}
                </div>

                {/* Tasks Section */}
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiCode color="#a855f7" /> Practice Tasks ({previewContent.content?.tasks?.length || 0})
                  </h4>
                  {previewContent.content?.tasks && previewContent.content.tasks.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {previewContent.content.tasks.map((t, idx) => (
                        <div key={idx} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 14 }}>
                          <strong style={{ fontSize: 14.5 }}>Task {idx + 1}: {t.title}</strong>
                          <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '6px 0' }}>{t.description}</p>
                          {t.starterCode && (
                            <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: 10, borderRadius: 6, fontSize: 12, overflowX: 'auto', margin: '8px 0 0' }}>
                              <code>{t.starterCode}</code>
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted" style={{ fontStyle: 'italic' }}>No tasks generated for this lecture.</p>
                  )}
                </div>

                {/* MCQs Section */}
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiHelpCircle color="#ec4899" /> MCQ Quizzes ({previewContent.content?.mcqs?.length || 0})
                  </h4>
                  {previewContent.content?.mcqs && previewContent.content.mcqs.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {previewContent.content.mcqs.map((q, idx) => (
                        <div key={idx} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 14 }}>
                          <strong style={{ fontSize: 14 }}>Q{idx + 1}: {q.question}</strong>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, margin: '10px 0' }}>
                            {q.options?.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: 6,
                                  fontSize: 12.5,
                                  background: oIdx === q.correctAnswer ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface, rgba(0,0,0,0.02))',
                                  border: oIdx === q.correctAnswer ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--line)',
                                  fontWeight: oIdx === q.correctAnswer ? 700 : 500,
                                  color: oIdx === q.correctAnswer ? '#10b981' : 'var(--text-heading)',
                                }}
                              >
                                {opt} {oIdx === q.correctAnswer && '✓'}
                              </div>
                            ))}
                          </div>
                          {q.explanation && (
                            <span style={{ fontSize: 12, color: 'var(--muted)', display: 'block' }}>
                              <strong>Explanation: </strong>{q.explanation}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted" style={{ fontStyle: 'italic' }}>No MCQs generated for this lecture.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
