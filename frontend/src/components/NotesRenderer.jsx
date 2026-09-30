import React, { useState } from 'react'
import { FiCopy, FiCheck, FiInfo, FiCode } from 'react-icons/fi'

/**
 * Interactive Code Snippet with Copy Button
 */
export function CodeBlock({ code, language = 'javascript' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="notes-code-wrapper">
      <div className="notes-code-header">
        <span className="notes-code-lang">
          <FiCode size={12} style={{ marginRight: 5 }} />
          {language.toUpperCase()}
        </span>
        <button
          type="button"
          className="notes-code-copy-btn"
          onClick={handleCopy}
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <FiCheck size={13} style={{ color: '#10b981' }} /> Copied!
            </>
          ) : (
            <>
              <FiCopy size={13} /> Copy Code
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
 * Render structured Markdown / text into modern formatted HTML elements
 */
export default function NotesRenderer({ content, markdown }) {
  const text = content || markdown || ''
  if (!text) return null

  // Split content by code fences ```
  const parts = text.split(/(```[\s\S]*?```)/g)

  return (
    <div className="notes-rendered-body">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n')
          const firstLine = lines[0].trim()
          let lang = 'code'
          let codeContent = lines.join('\n')

          if (firstLine && !firstLine.includes(' ') && firstLine.length < 15) {
            lang = firstLine
            codeContent = lines.slice(1).join('\n')
          }

          return <CodeBlock key={index} language={lang} code={codeContent} />
        }

        // Parse regular markdown lines (headings, lists, paragraphs)
        const lines = part.split('\n')
        return (
          <React.Fragment key={index}>
            {lines.map((line, lIdx) => {
              const trimmed = line.trim()
              if (!trimmed) return null

              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={lIdx} className="notes-h2">
                    {trimmed.replace(/^##\s+/, '')}
                  </h2>
                )
              }
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={lIdx} className="notes-h3">
                    {trimmed.replace(/^###\s+/, '')}
                  </h3>
                )
              }
              if (trimmed === '---') {
                return <hr key={lIdx} className="notes-divider" />
              }
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const bulletText = trimmed.replace(/^[-*]\s+/, '')
                return (
                  <li key={lIdx} className="notes-bullet-item">
                    {formatInlineText(bulletText)}
                  </li>
                )
              }
              if (/^\d+\.\s+/.test(trimmed)) {
                const itemText = trimmed.replace(/^\d+\.\s+/, '')
                return (
                  <div key={lIdx} className="notes-numbered-item">
                    <span className="notes-numbered-bullet">
                      {trimmed.match(/^\d+/)[0]}.
                    </span>
                    <span>{formatInlineText(itemText)}</span>
                  </div>
                )
              }
              if (trimmed.startsWith('> ')) {
                return (
                  <div key={lIdx} className="notes-callout-quote">
                    <FiInfo className="notes-callout-icon" />
                    <span>{formatInlineText(trimmed.replace(/^>\s+/, ''))}</span>
                  </div>
                )
              }

              return (
                <p key={lIdx} className="notes-paragraph">
                  {formatInlineText(trimmed)}
                </p>
              )
            })}
          </React.Fragment>
        )
      })}
    </div>
  )
}

/**
 * Format inline bold **text** and inline `code`
 */
function formatInlineText(text) {
  if (!text) return null
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`)/g)

  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={idx}>{token.slice(2, -2)}</strong>
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code key={idx} className="notes-inline-code">
          {token.slice(1, -1)}
        </code>
      )
    }
    return token
  })
}
