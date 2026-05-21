import { useState, useEffect, useRef } from 'react'
import { getColor, getCourseKey, resolvePrereq } from '../utils/courseUtils'

export default function SearchPopup({ courses, onSelectCourse, onClose, completedIds }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  const econCourses = courses.filter(c => c.dept === 'ECON')

  const results = query.trim().length === 0 ? [] : (() => {
    const q = query.trim().toLowerCase()
    return econCourses.filter(c => {
      const ids = Array.isArray(c.id) ? c.id : [c.id]
      const idMatch = ids.some(id => String(id).includes(q))
      const name = (c.name || '').toLowerCase()
      const desc = (c.desc || '').toLowerCase()
      return idMatch || name.includes(q) || desc.includes(q)
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
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 999 }}
        onMouseDown={e => { e.stopPropagation(); onClose() }}
        onTouchStart={e => { e.stopPropagation(); onClose() }}
      />

      <div
        onMouseDown={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
        onWheel={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '12%', left: '50%',
          transform: 'translateX(-50%)',
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
          display: 'flex', alignItems: 'center', gap: 12,
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
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: '#ccc', fontSize: 16,
              fontFamily: "'League Spartan', sans-serif",
              fontWeight: 500, letterSpacing: '0.01em',
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

        <style>{`
          .search-list::-webkit-scrollbar { width: 5px; }
          .search-list::-webkit-scrollbar-track { background: transparent; }
          .search-list::-webkit-scrollbar-thumb { background: #2e2e2e; border-radius: 999px; }
          .search-list::-webkit-scrollbar-thumb:hover { background: #444; }
        `}</style>

        <div className="search-list" style={{ overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 360, scrollbarGutter: 'stable' }}>
          {query.trim().length === 0 ? (
            <div style={{ color: '#333', fontSize: 13, textAlign: 'center', margin: 18, letterSpacing: '0.03em' }}>
              Start typing to search ECON courses
            </div>
          ) : results.length === 0 ? (
            <div style={{ color: '#333', fontSize: 13, textAlign: 'center', marginTop: 36, letterSpacing: '0.03em' }}>
              No courses found
            </div>
          ) : results.map(course => {
            const key = getCourseKey(course)
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

            // Build blobs deduped by resolved key, with completed awareness
            const blobMap = new Map()
            ;(course.prereqs || []).forEach(prereq => {
              const prereqKey = resolvePrereq(prereq, courses)
              const prereqCourse = prereqKey ? courses.find(c => getCourseKey(c) === prereqKey) : null
              const rawLabel = typeof prereq === 'number'
                ? String(prereq)
                : prereq.trim().split(/\s+/).slice(1).join(' ') || prereq

              if (prereqKey) {
                if (!blobMap.has(prereqKey)) blobMap.set(prereqKey, { prereqCourse, labels: [] })
                blobMap.get(prereqKey).labels.push(rawLabel)
              } else {
                const fk = `unresolved-${prereq}`
                if (!blobMap.has(fk)) blobMap.set(fk, { prereqCourse: null, labels: [rawLabel] })
              }
            })

            const blobs = Array.from(blobMap.entries()).map(([prereqKey, { prereqCourse, labels }]) => {
              const prereqCompleted = !prereqKey.startsWith('unresolved-') && (completedIds?.has(prereqKey) ?? false)
              let displayLabel
              if (prereqCourse) {
                const firstId = Array.isArray(prereqCourse.id) ? prereqCourse.id[0] : prereqCourse.id
                const base = prereqCourse.dept === 'ECON' ? String(firstId) : `${prereqCourse.dept} ${firstId}`
                displayLabel = labels.length > 1
                  ? `${base} / ${labels.slice(1).map(l => l.replace(/^[A-Z]+ /, '')).join(' / ')}`
                  : base
              } else {
                displayLabel = labels[0]
              }
              return { prereqKey, displayLabel, prereqCompleted }
            })

            const hasPrereqs = blobs.length > 0
            const allDone = hasPrereqs && blobs.every(b => b.prereqCompleted)

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
                onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.borderColor = text }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = border }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 4 }}>
                  <span style={{ color: text, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0 }}>
                    ECON {Array.isArray(course.id) ? course.id[0] : course.id}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {highlight(course.name, 13)}
                  </span>
                </div>

                {course.desc && (
                  <div style={{ marginBottom: blobs.length ? 8 : 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {highlight(course.desc, 12)}
                  </div>
                )}

                {blobs.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
                    {blobs.map(({ prereqKey, displayLabel, prereqCompleted }) => (
                      <span
                        key={prereqKey}
                        style={{
                          background: prereqCompleted ? '#0f2033' : '#181818',
                          border: `1px solid ${prereqCompleted ? '#1a3a5c' : '#5a5a5a'}`,
                          borderRadius: 999,
                          padding: '2px 8px',
                          fontSize: 11,
                          fontWeight: 600,
                          color: prereqCompleted ? '#60a5fa' : '#848484',
                          letterSpacing: '0.03em',
                          lineHeight: 1.6,
                          transition: 'background 0.15s, border-color 0.15s, color 0.15s',
                        }}
                      >
                        {displayLabel}
                      </span>
                    ))}
                    {allDone && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 2, flexShrink: 0 }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
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