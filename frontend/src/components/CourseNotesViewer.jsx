import React, { useState, useEffect, useMemo } from 'react'
import {
  FiBookOpen,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiCopy,
  FiCode,
  FiInfo,
  FiAlertTriangle,
  FiEdit3,
  FiHelpCircle,
  FiList,
  FiLayers,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi'
import api from '../services/api.js'
import Loader from './Loader.jsx'
import './CourseNotesViewer.css'

/**
 * Modern Syntax Highlighted Code Block Component with Copy
 */
export function NoteCodeBlock({ code, language = 'html' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="notes-code-block">
      <div className="notes-code-bar">
        <span className="notes-code-lang">
          <FiCode size={12} /> {language.toUpperCase()}
        </span>
        <button
          type="button"
          className="notes-code-copy-btn"
          onClick={handleCopy}
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <FiCheck size={12} style={{ color: '#10b981' }} /> Copied!
            </>
          ) : (
            <>
              <FiCopy size={12} /> Copy Code
            </>
          )}
        </button>
      </div>
      <pre className="notes-code-pre">
        <code>{code}</code>
      </pre>
    </div>
  )
}

/**
 * Intelligent Markdown / Structured Note Text Parser & Renderer
 */
function NoteContentRenderer({ rawText }) {
  if (!rawText) return null

  // Split content by major blocks / lines
  const lines = rawText.split('\n')
  const elements = []
  let inCodeBlock = false
  let codeBuffer = []
  let codeLang = 'html'
  let inTable = false
  let tableBuffer = []

  const flushCode = (idx) => {
    if (codeBuffer.length > 0) {
      const snippet = codeBuffer.join('\n')
      elements.push(
        <NoteCodeBlock key={`code-${idx}`} code={snippet} language={codeLang} />
      )
      codeBuffer = []
    }
  }

  const flushTable = (idx) => {
    if (tableBuffer.length > 0) {
      const headers = tableBuffer[0]
      const rows = tableBuffer.slice(1)
      elements.push(
        <div className="notes-table-wrapper" key={`table-${idx}`}>
          <table className="notes-table">
            {headers && (
              <thead>
                <tr>
                  {headers.map((h, hIdx) => (
                    <th key={hIdx}>{h}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((r, rIdx) => (
                <tr key={rIdx}>
                  {r.map((cell, cIdx) => (
                    <td key={cIdx}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      tableBuffer = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // 1. Explicit Markdown Code Fences
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false
        flushCode(i)
      } else {
        flushTable(i)
        inCodeBlock = true
        codeLang = trimmed.replace(/^```/, '').trim() || 'html'
      }
      continue
    }

    if (inCodeBlock) {
      codeBuffer.push(line)
      continue
    }

    // 2. Table Row detection (Tab-separated or Pipe | separated)
    if (line.includes('\t') && trimmed.length > 0) {
      const cells = line.split('\t').map((c) => c.trim()).filter(Boolean)
      if (cells.length > 1) {
        inTable = true
        tableBuffer.push(cells)
        continue
      }
    } else if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
      // Markdown pipe table
      const cells = trimmed.slice(1, -1).split('|').map((c) => c.trim())
      if (!cells.every((c) => /^:?-+:?$/.test(c))) {
        inTable = true
        tableBuffer.push(cells)
      }
      continue
    } else if (inTable) {
      inTable = false
      flushTable(i)
    }

    // 3. Horizontal Dividers
    if (trimmed === '___' || trimmed === '____' || trimmed === '________' || trimmed === '---' || trimmed === '________________') {
      elements.push(<hr key={`hr-${i}`} className="notes-divider" />)
      continue
    }

    // 4. Blank lines
    if (!trimmed) {
      continue
    }

    // 5. Raw multi-line HTML code blocks without backticks (e.g., <!DOCTYPE html>, <html>, <head>)
    if (
      trimmed.startsWith('<!DOCTYPE html>') ||
      (trimmed.startsWith('<html') && lines[i + 1]?.includes('<head')) ||
      (trimmed.startsWith('<form') && lines[i + 1]?.includes('<input')) ||
      (trimmed.startsWith('<table') && lines[i + 1]?.includes('<tr'))
    ) {
      // Gather HTML snippet
      const blockLines = [line]
      let j = i + 1
      while (j < lines.length && lines[j].trim() && !lines[j].trim().startsWith('🔑') && !lines[j].trim().startsWith('📝') && !lines[j].trim().startsWith('📖') && !lines[j].trim().startsWith('___')) {
        blockLines.push(lines[j])
        if (lines[j].trim() === '</html>' || lines[j].trim() === '</form>' || lines[j].trim() === '</table>') {
          j++
          break
        }
        j++
      }
      i = j - 1
      elements.push(
        <NoteCodeBlock key={`raw-code-${i}`} code={blockLines.join('\n')} language="html" />
      )
      continue
    }

    // 6. Callout Blocks
    if (trimmed.startsWith('📖 Definition')) {
      elements.push(
        <div key={`callout-def-${i}`} className="notes-callout definition">
          <div className="notes-callout-header">
            <FiBookOpen /> Definition
          </div>
        </div>
      )
      continue
    }

    if (trimmed.startsWith('💡 Example')) {
      elements.push(
        <div key={`callout-ex-${i}`} className="notes-callout example">
          <div className="notes-callout-header">
            <FiCode /> Example
          </div>
        </div>
      )
      continue
    }

    if (trimmed.startsWith('🔑 Important Points') || trimmed.startsWith('🔑 Important Point')) {
      elements.push(
        <div key={`callout-imp-${i}`} className="notes-callout important">
          <div className="notes-callout-header">
            <FiInfo /> Important Points
          </div>
        </div>
      )
      continue
    }

    if (trimmed.startsWith('📝 Task') || trimmed.startsWith('📝 Practice Tasks') || trimmed.startsWith('Task ')) {
      elements.push(
        <div key={`callout-task-${i}`} className="notes-callout task">
          <div className="notes-callout-header">
            <FiEdit3 /> Practice Task
          </div>
          <p style={{ margin: 0 }}>{trimmed.replace(/^📝\s*Task\s*/, '')}</p>
        </div>
      )
      continue
    }

    if (trimmed.startsWith('⚠️ Common Mistake') || trimmed.startsWith('⚠️ Important') || trimmed.startsWith('⚠️ Void Elements')) {
      elements.push(
        <div key={`callout-warn-${i}`} className="notes-callout warning">
          <div className="notes-callout-header">
            <FiAlertTriangle /> {trimmed.replace(/^⚠️\s*/, '')}
          </div>
        </div>
      )
      continue
    }

    if (trimmed.startsWith('🏠 Easy Analogy')) {
      elements.push(
        <div key={`callout-ana-${i}`} className="notes-callout analogy">
          <div className="notes-callout-header">
            <FiLayers /> Easy Analogy
          </div>
        </div>
      )
      continue
    }

    // 7. Headings
    if (/^\d+\.\s+[A-Za-z]/.test(trimmed) && !trimmed.includes('→') && !trimmed.includes('=')) {
      elements.push(
        <h2 key={`h2-${i}`} className="notes-heading-2">
          {trimmed}
        </h2>
      )
      continue
    }

    if (/^\d+\.\d+\s+[A-Za-z]/.test(trimmed)) {
      elements.push(
        <h3 key={`h3-${i}`} className="notes-heading-3">
          {trimmed}
        </h3>
      )
      continue
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={`md-h2-${i}`} className="notes-heading-2">
          {trimmed.replace(/^##\s+/, '')}
        </h2>
      )
      continue
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`md-h3-${i}`} className="notes-heading-3">
          {trimmed.replace(/^###\s+/, '')}
        </h3>
      )
      continue
    }

    // 8. ASCII Trees / Diagram Structures (e.g. Document ├── h1 ...)
    if (trimmed.includes('├──') || trimmed.includes('└──') || trimmed.includes('│') || trimmed.includes('↓') || trimmed.includes('/    \\')) {
      elements.push(
        <div key={`ascii-${i}`} className="notes-ascii-box">
          {line}
        </div>
      )
      continue
    }

    // 9. Bullet list item
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const bulletText = trimmed.replace(/^[*•-]\s+/, '')
      elements.push(
        <li key={`li-${i}`} style={{ marginLeft: 20 }}>
          {bulletText}
        </li>
      )
      continue
    }

    // 10. Default paragraph
    elements.push(
      <p key={`p-${i}`} className="notes-para">
        {line}
      </p>
    )
  }

  if (inCodeBlock) flushCode('end')
  if (inTable) flushTable('end')

  return <div className="notes-body">{elements}</div>
}

/**
 * Main CourseNotesViewer Component
 */
export default function CourseNotesViewer({
  courseId,
  initialTopicId,
  onSelectTopic,
}) {
  const [topics, setTopics] = useState([])
  const [activeTopicId, setActiveTopicId] = useState(initialTopicId || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Fetch Course Notes from Backend
  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError('')

    const targetCourse = courseId || 'html'

    api
      .get(`/notes/course/${targetCourse}`)
      .then(({ data }) => {
        if (!isMounted) return
        if (data && data.topics && data.topics.length > 0) {
          setTopics(data.topics)
          if (!activeTopicId) {
            setActiveTopicId(data.topics[0].topicId)
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.response?.data?.message || 'Failed to load course notes')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [courseId])

  // Filter topics based on search
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics
    const q = searchQuery.toLowerCase()
    return topics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.summary?.toLowerCase().includes(q) ||
        t.content?.toLowerCase().includes(q)
    )
  }, [topics, searchQuery])

  // Current Active Topic
  const activeTopic = useMemo(() => {
    return (
      topics.find((t) => t.topicId === activeTopicId) ||
      topics[0] ||
      null
    )
  }, [topics, activeTopicId])

  const activeIndex = useMemo(() => {
    if (!activeTopic) return 0
    return topics.findIndex((t) => t.topicId === activeTopic.topicId)
  }, [topics, activeTopic])

  const handleSelectTopic = (topicId) => {
    setActiveTopicId(topicId)
    setMobileSidebarOpen(false)
    if (onSelectTopic) onSelectTopic(topicId)
    // Scroll reader to top
    window.scrollTo({ top: 180, behavior: 'smooth' })
  }

  const handlePrev = () => {
    if (activeIndex > 0) {
      handleSelectTopic(topics[activeIndex - 1].topicId)
    }
  }

  const handleNext = () => {
    if (activeIndex < topics.length - 1) {
      handleSelectTopic(topics[activeIndex + 1].topicId)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <Loader />
      </div>
    )
  }

  if (error && topics.length === 0) {
    return (
      <div className="status error" style={{ margin: '20px 0' }}>
        {error}
      </div>
    )
  }

  return (
    <div className="course-notes-container">
      {/* Top Meta Bar */}
      <div className="notes-meta-bar">
        <div className="notes-meta-left">
          <div className="notes-meta-icon-badge">
            <FiBookOpen />
          </div>
          <div className="notes-meta-titles">
            <h3>Course Study Notes & Code Reference</h3>
            <p>
              100% comprehensive topic guides, exact examples, and interview prep.
            </p>
          </div>
        </div>

        <div className="notes-meta-right">
          <span className="notes-badge">
            <FiLayers /> {topics.length} Complete Topics
          </span>
        </div>
      </div>

      {/* Mobile Sidebar Dropdown Button */}
      <button
        type="button"
        className="notes-mobile-sidebar-toggle"
        onClick={() => setMobileSidebarOpen((prev) => !prev)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiList /> Topic: {activeTopic?.title || 'Select Topic'}
        </span>
        {mobileSidebarOpen ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {/* 2-Column Main Layout */}
      <div className="notes-layout-grid">
        {/* Left Sidebar: Table of Contents */}
        <aside
          className={`notes-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}
        >
          <div className="notes-sidebar-header">
            <div className="notes-sidebar-title-row">
              <h4>Table of Contents</h4>
              <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>
                {filteredTopics.length} / {topics.length}
              </span>
            </div>
            <div className="notes-search-wrap">
              <FiSearch className="notes-search-icon" />
              <input
                type="text"
                placeholder="Search notes & topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="notes-search-input"
              />
            </div>
          </div>

          <div className="notes-topic-list">
            {filteredTopics.map((topic) => {
              const isActive = topic.topicId === activeTopic?.topicId
              return (
                <button
                  key={topic.topicId}
                  type="button"
                  className={`notes-topic-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectTopic(topic.topicId)}
                >
                  <span className="notes-topic-num">
                    {String(topic.order).padStart(2, '0')}
                  </span>
                  <span className="notes-topic-name">{topic.title}</span>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Right Stage: Reader Content Area */}
        <main className="notes-reader-stage">
          {activeTopic ? (
            <>
              <header className="notes-reader-header">
                <span className="notes-reader-topic-tag">
                  Topic {String(activeTopic.order).padStart(2, '0')}
                </span>
                <h1 className="notes-reader-title">{activeTopic.title}</h1>
                {activeTopic.summary && (
                  <p className="notes-reader-summary">{activeTopic.summary}</p>
                )}
              </header>

              {/* Rendered Full Note Content */}
              <NoteContentRenderer rawText={activeTopic.content} />

              {/* Prev / Next Topic Navigation Controls */}
              <footer className="notes-footer-nav">
                <button
                  type="button"
                  className="notes-nav-btn prev"
                  disabled={activeIndex === 0}
                  onClick={handlePrev}
                >
                  <FiChevronLeft size={16} /> Previous Topic
                </button>

                <button
                  type="button"
                  className="notes-nav-btn next"
                  disabled={activeIndex === topics.length - 1}
                  onClick={handleNext}
                >
                  Next Topic <FiChevronRight size={16} />
                </button>
              </footer>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
              Select a topic from the sidebar to start reading notes.
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
