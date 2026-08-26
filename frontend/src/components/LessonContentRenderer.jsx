import React, { useState } from 'react'
import { FiCopy, FiCheck, FiInfo, FiCode, FiAward } from 'react-icons/fi'

export default function LessonContentRenderer({ content, notes }) {
  const [copiedIndex, setCopiedIndex] = useState(null)

  const handleCopy = (codeText, index) => {
    navigator.clipboard.writeText(codeText)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Parse raw text into structured blocks (Headings, Code Blocks, Tables, Lists, Paragraphs)
  const renderFormattedContent = (rawText) => {
    if (!rawText) return null

    // Split by code blocks first
    const parts = rawText.split(/(```[\s\S]*?```)/g)

    return parts.map((part, index) => {
      // 1. Code Block
      if (part.startsWith('```')) {
        const lines = part.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '')
        const codeClean = lines.trim()

        return (
          <div key={index} className="lesson-code-card" style={{ margin: '20px 0' }}>
            <div className="code-header">
              <div className="code-title-group">
                <FiCode className="code-icon" />
                <span>JavaScript Code</span>
              </div>
              <button
                type="button"
                className="copy-btn"
                onClick={() => handleCopy(codeClean, index)}
                title="Copy code"
              >
                {copiedIndex === index ? (
                  <>
                    <FiCheck style={{ color: '#10b981' }} />
                    <span style={{ color: '#10b981' }}>Copied!</span>
                  </>
                ) : (
                  <>
                    <FiCopy />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="code-pre">
              <code>{codeClean}</code>
            </pre>
          </div>
        )
      }

      // 2. Text / Table / List Parsing
      const lines = part.split('\n')
      const elements = []
      let tableRows = []
      let inTable = false
      let listItems = []
      let inList = false

      const flushTable = () => {
        if (tableRows.length > 0) {
          elements.push(
            <div key={`table-${elements.length}`} style={{ overflowX: 'auto', margin: '18px 0' }}>
              <table className="matrix-table">
                <thead>
                  <tr>
                    {tableRows[0].map((cell, cIdx) => (
                      <th key={cIdx}>{cell.trim()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.slice(1).map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx}>{cell.trim()}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
          tableRows = []
          inTable = false
        }
      }

      const flushList = () => {
        if (listItems.length > 0) {
          elements.push(
            <ul key={`list-${elements.length}`} className="callout-list" style={{ margin: '12px 0 16px 0', paddingLeft: 20 }}>
              {listItems.map((item, lIdx) => (
                <li key={lIdx} style={{ fontSize: '15px', lineHeight: '1.65', color: 'var(--text-secondary)' }}>
                  {item}
                </li>
              ))}
            </ul>
          )
          listItems = []
          inList = false
        }
      }

      lines.forEach((line, lIdx) => {
        const trimmed = line.trim()

        // Markdown Table Row
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          flushList()
          // Skip divider rows e.g. |---|---|
          if (!trimmed.includes('---')) {
            const cells = trimmed.split('|').slice(1, -1)
            tableRows.push(cells)
            inTable = true
          }
          return
        } else {
          flushTable()
        }

        // Bullet list item
        if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const itemText = trimmed.replace(/^[•\-\*]\s*/, '')
          listItems.push(itemText)
          inList = true
          return
        } else {
          flushList()
        }

        // Blank lines
        if (!trimmed) {
          return
        }

        // Headings
        if (trimmed.startsWith('### ')) {
          elements.push(
            <h4 key={`h4-${lIdx}`} style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-heading)', margin: '22px 0 10px 0' }}>
              {trimmed.replace(/^###\s*/, '')}
            </h4>
          )
        } else if (trimmed.startsWith('## ')) {
          elements.push(
            <h3 key={`h3-${lIdx}`} style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-heading)', margin: '28px 0 12px 0' }}>
              {trimmed.replace(/^##\s*/, '')}
            </h3>
          )
        } else if (trimmed.startsWith('# ')) {
          elements.push(
            <h2 key={`h2-${lIdx}`} style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)', margin: '32px 0 14px 0' }}>
              {trimmed.replace(/^#\s*/, '')}
            </h2>
          )
        } else if (/^\d+\.\s+[A-Za-z]+/.test(trimmed) && trimmed.length < 60) {
          // e.g. "1. Variables" or "2. Declaration vs Initialization"
          elements.push(
            <h2 key={`section-head-${lIdx}`} style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', margin: '32px 0 12px 0', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
              {trimmed}
            </h2>
          )
        } else if (
          [
            'What is a Variable?',
            'Why do we use Variables?',
            'Declaration',
            'Initialization',
            'Declaration + Initialization',
            'Difference',
            'Characteristics:',
            'Characteristics',
            'Example:',
            'Example',
            'Examples:',
            'Examples',
            'NaN (Not-a-Number)',
            'NaN',
            'typeof result:',
            'typeof:',
            'Strings can use:',
            'Backticks support:',
            'Common reference types:',
            'Used in:',
            'Allowed for:',
            'Not allowed for:',
            'Variable names:',
            'Use camelCase naming convention:',
            'Syntax:',
          ].includes(trimmed)
        ) {
          elements.push(
            <h3 key={`subhead-${lIdx}`} style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-heading)', margin: '18px 0 8px 0' }}>
              {trimmed}
            </h3>
          )
        } else {
          elements.push(
            <p key={`p-${lIdx}`} style={{ fontSize: '15.5px', lineHeight: '1.75', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
              {trimmed}
            </p>
          )
        }
      })

      flushTable()
      flushList()

      return <div key={index}>{elements}</div>
    })
  }

  return (
    <div className="lesson-content-body">
      {/* Exact Lesson Notes & Content */}
      <section className="lesson-section">
        {renderFormattedContent(content)}
      </section>

      {/* Key Takeaways & Rules Card from Notes */}
      {notes && (
        <section className="lesson-section" style={{ marginTop: 28 }}>
          <div className="lesson-callout notes-callout">
            <div className="callout-header">
              <FiInfo className="callout-icon" />
              <h3>Key Notes &amp; Summary</h3>
            </div>
            <div style={{ whiteSpace: 'pre-line', fontSize: '14.5px', lineHeight: '1.7', color: 'var(--text-heading)' }}>
              {notes}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
