import { useRef } from 'react'
import { getColor, getCourseKey, resolvePrereq } from '../utils/courseUtils'

const isMobile = () => window.innerWidth < 768

export default function ElectivePopup({ courses, onSelectCourse, onClose, selectedId, allCourses, completedIds }) {
  const ref = useRef(null)

  if (!courses.length) return null

  const allC = allCourses || courses

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 999 }}
        onMouseDown={e => { e.stopPropagation(); onClose() }}
        onTouchStart={e => { e.stopPropagation(); onClose() }}
      />

      <div
        ref={ref}
        onMouseDown={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
        onWheel={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
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
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
            onMouseLeave={e => e.currentTarget.style.color = '#555'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <style>{`
          .elective-list::-webkit-scrollbar { width: 5px; }
          .elective-list::-webkit-scrollbar-track { background: transparent; }
          .elective-list::-webkit-scrollbar-thumb { background: #2e2e2e; border-radius: 999px; }
          .elective-list::-webkit-scrollbar-thumb:hover { background: #444; }
        `}</style>

        <div className="elective-list" style={{ overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: 5, scrollbarGutter: 'stable' }}>
          {courses.map(course => {
            const key = getCourseKey(course)
            const isSelected = selectedId === key
            const { border, text, muted } = getColor(course.tags)

            // Build blobs with completed awareness, deduped by resolved key
            const blobMap = new Map()
            ;(course.prereqs || []).forEach(prereq => {
              const prereqKey = resolvePrereq(prereq, allC)
              const prereqCourse = prereqKey ? allC.find(c => getCourseKey(c) === prereqKey) : null
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
                onClick={() => { onSelectCourse(course); if (isMobile()) onClose() }}
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
                onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.borderColor = text }}
                onMouseLeave={e => { e.currentTarget.style.background = isSelected ? '#1e1e1e' : '#1a1a1a'; e.currentTarget.style.borderColor = isSelected ? text : border }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                  <span style={{ color: text, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em' }}>
                    {course.dept} {Array.isArray(course.id) ? course.id[0] : course.id}
                  </span>
                </div>
                <div style={{ color: muted, fontSize: 11, lineHeight: 1.4, marginBottom: blobs.length ? 7 : 0 }}>
                  {course.name}
                </div>

                {blobs.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
                    {blobs.map(({ prereqKey, displayLabel, prereqCompleted }) => (
                      <span
                        key={prereqKey}
                        style={{
                          background: prereqCompleted ? '#0f2033' : '#181818',
                          border: `1px solid ${prereqCompleted ? '#1a3a5c' : '#5a5a5a'}`,
                          borderRadius: 999,
                          padding: '1px 7px',
                          fontSize: 10,
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