import { useEffect, useRef } from 'react'
import { getColor, resolvePrereq } from '../utils/courseUtils'

const isMobile = () => window.innerWidth < 768

export default function ElectivePopup({ courses, onSelectCourse, onClose, selectedId, allCourses }) {
  const ref = useRef(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [onClose])

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    if (!selectedId) return
    const isElective = courses.some(c => `${c.dept}-${c.id}` === selectedId)
    if (isElective) return
    if (!isMobile()) onClose()
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!courses.length) return null

  return (
    <div
      ref={ref}
      onMouseDown={e => e.stopPropagation()}
      onTouchStart={e => e.stopPropagation()}
      onWheel={e => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(520px, calc(100vw - 48px))',
        height: 'min(680px, calc(100vh - 80px))',
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
      {/* Header */}
      <div style={{
        padding: '12px 14px 10px',
        borderBottom: '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ color: '#888', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>
            Electives
          </div>
          <div style={{ color: '#ddd', fontSize: 13, fontWeight: 600 }}>
            {courses.length} optional course{courses.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#555',
            padding: 4,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
          onMouseLeave={e => e.currentTarget.style.color = '#555'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .elective-list::-webkit-scrollbar { width: 5px; }
        .elective-list::-webkit-scrollbar-track { background: transparent; }
        .elective-list::-webkit-scrollbar-thumb { background: #2e2e2e; border-radius: 999px; }
        .elective-list::-webkit-scrollbar-thumb:hover { background: #444; }
      `}</style>

      {/* Course list */}
      <div className="elective-list" style={{ overflowY: 'auto', padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 5, scrollbarGutter: 'stable' }}>
        {courses.map(course => {
          const key = `${course.dept}-${course.id}`
          const isSelected = selectedId === key
          const { border, text, muted } = getColor(course.tags)

          const blobs = (course.prereqs || []).map(prereq => {
            const prereqKey = resolvePrereq(prereq, allCourses || courses)
            const prereqCourse = prereqKey ? (allCourses || courses).find(c => `${c.dept}-${c.id}` === prereqKey) : null
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
              onClick={() => {
                onSelectCourse(course)
                if (isMobile()) onClose()
              }}
              style={{
                background: isSelected ? '#1e1e1e' : '#1a1a1a',
                border: `1px solid ${isSelected ? text : border}`,
                boxShadow: isSelected ? `0 0 0 1px ${text}33` : 'none',
                borderRadius: 8,
                padding: '9px 11px',
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
                e.currentTarget.style.background = isSelected ? '#1e1e1e' : '#1a1a1a'
                e.currentTarget.style.borderColor = isSelected ? text : border
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                <span style={{ color: text, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em' }}>
                  {course.dept} {course.id}
                </span>
              </div>
              <div style={{ color: muted, fontSize: 11, lineHeight: 1.4, whiteSpace: 'normal', marginBottom: blobs.length ? 7 : 0 }}>
                {course.name}
              </div>

              {blobs.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {blobs.map(({ prereqKey, label }) => (
                    <span
                      key={prereqKey ?? label}
                      style={{
                        background: '#181818',
                        border: '1px solid #4a4a4a',
                        borderRadius: 999,
                        padding: '1px 7px',
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#727272',
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
  )
}