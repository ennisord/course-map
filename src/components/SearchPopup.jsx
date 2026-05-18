import { useState, useEffect, useRef } from 'react'
import { getColor, resolvePrereq } from '../utils/courseUtils'

export default function SearchPopup({ courses, onSelectCourse, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  // ECON only
  const econCourses = courses.filter(c => c.dept === 'ECON')

  const results = query.trim().length === 0 ? [] : (() => {
    const q = query.trim().toLowerCase()
    return econCourses.filter(c => {
      const id = String(c.id)
      const name = (c.name || '').toLowerCase()
      const desc = (c.desc || '').toLowerCase()
      return id.includes(q) || name.includes(q) || desc.includes(q)
    })
  })()

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 999 }}
        onMouseDown={e => { e.stopPropagation(); onClose() }}
        onTouchStart={e => { e.stopPropagation(); onClose() }}
      />

      {/* Panel */}
      <div
        onMouseDown={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
        onWheel={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(540px, calc(100vw - 48px))',
          maxHeight: 'min(520px, calc(100vh - 80px))',
          zIndex: 1000,
          fontFamily: "'League Spartan', sans-serif",
          background: '#111',
          border: '1px solid #2a2a2a',
          borderRadius: 16,
          boxShadow: '0 24px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Search input */}
        <div style={{
          padding: '16px 18px',
          borderBottom: '1px solid #222',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, number, or keyword…"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#ccc',
              fontSize: 16,
              fontFamily: "'League Spartan', sans-serif",
              fontWeight: 500,
              letterSpacing: '0.01em',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 2, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#888'}
              onMouseLeave={e => e.currentTarget.style.color = '#444'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'color 0.15s', marginLeft: 2 }}
            onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
            onMouseLeave={e => e.currentTarget.style.color = '#555'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollbar + placeholder styles */}
        <style>{`
          .search-list::-webkit-scrollbar { width: 5px; }
          .search-list::-webkit-scrollbar-track { background: transparent; }
          .search-list::-webkit-scrollbar-thumb { background: #2e2e2e; border-radius: 999px; }
          .search-list::-webkit-scrollbar-thumb:hover { background: #444; }
          .search-input-field::placeholder { color: #3a3a3a; }
        `}</style>

        {/* Results */}
        <div
          className="search-list"
          style={{
            overflowY: 'auto',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            maxHeight: 360,
            scrollbarGutter: 'stable',
          }}
        >
          {query.trim().length === 0 ? (
            <div style={{ color: '#333', fontSize: 13, textAlign: 'center', margin: 18, letterSpacing: '0.03em' }}>
              Start typing to search ECON courses
            </div>
          ) : results.length === 0 ? (
            <div style={{ color: '#333', fontSize: 13, textAlign: 'center', marginTop: 36, letterSpacing: '0.03em' }}>
              No courses found
            </div>
          ) : results.map(course => {
            const key = `${course.dept}-${course.id}`
            const { border, text, muted } = getColor(course.tags)

            const highlight = (str, baseFontSize) => {
              if (!str) return null
              const q = query.trim()
              const idx = str.toLowerCase().indexOf(q.toLowerCase())
              const style = { color: muted, fontSize: baseFontSize, lineHeight: 1.5 }
              if (idx === -1) return <span style={style}>{str}</span>
              return (
                <span style={style}>
                  {str.slice(0, idx)}
                  <span style={{ color: '#ccc', background: '#2a2a2a', borderRadius: 3, padding: '0 2px' }}>
                    {str.slice(idx, idx + q.length)}
                  </span>
                  {str.slice(idx + q.length)}
                </span>
              )
            }

            const blobs = (course.prereqs || []).map(prereq => {
              const prereqKey = resolvePrereq(prereq, courses)
              const prereqCourse = prereqKey ? courses.find(c => `${c.dept}-${c.id}` === prereqKey) : null
              let label
              if (prereqCourse) {
                label = prereqCourse.dept === 'ECON' ? String(prereqCourse.id) : `${prereqCourse.dept} ${prereqCourse.id}`
              } else {
                label = typeof prereq === 'number' ? String(prereq) : prereq
              }
              return { prereqKey, label }
            })

            return (
              <button
                key={key}
                onMouseDown={e => e.stopPropagation()}
                onClick={() => { onSelectCourse(course); onClose() }}
                style={{
                  background: '#1a1a1a',
                  border: `1px solid ${border}`,
                  borderRadius: 10,
                  padding: '11px 13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s, border-color 0.15s',
                  width: '100%',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#222'
                  e.currentTarget.style.borderColor = text
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#1a1a1a'
                  e.currentTarget.style.borderColor = border
                }}
              >
                {/* Course ID + name row */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 4 }}>
                  <span style={{ color: text, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0 }}>
                    ECON {course.id}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {highlight(course.name, 13)}
                  </span>
                </div>

                {/* Description */}
                {course.desc && (
                  <div style={{ marginBottom: blobs.length ? 8 : 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {highlight(course.desc, 12)}
                  </div>
                )}

                {/* Prereq blobs */}
                {blobs.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {blobs.map(({ prereqKey, label }) => (
                      <span
                        key={prereqKey ?? label}
                        style={{
                          background: '#181818',
                          border: '1px solid #2e2e2e',
                          borderRadius: 999,
                          padding: '2px 8px',
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#555',
                          letterSpacing: '0.03em',
                          lineHeight: 1.6,
                        }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}