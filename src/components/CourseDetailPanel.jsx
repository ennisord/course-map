import { useEffect, useState } from 'react'
import { getColor, getCourseKey, resolvePrereq } from '../utils/courseUtils'

export default function CourseDetailPanel({ course, courses, onClose, onSelectCourse, completedIds, onToggleCompleted }) {
  const [visible, setVisible] = useState(false)
  const [displayed, setDisplayed] = useState(course)

  useEffect(() => {
    if (course) {
      setDisplayed(course)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else {
      setVisible(false)
      const t = setTimeout(() => setDisplayed(null), 380)
      return () => clearTimeout(t)
    }
  }, [course])

  if (!displayed) return null

  const { border, text, muted } = getColor(displayed.tags)
  const key = getCourseKey(displayed)
  const isCompleted = completedIds?.has(key) ?? false

  const ids = Array.isArray(displayed.id) ? displayed.id : [displayed.id]
  const idLabel = ids.join(' / ')

  // Deduplicate prereqs resolving to same node
  const blobMap = new Map()
  ;(displayed.prereqs || []).forEach(p => {
    const prereqKey = resolvePrereq(p, courses)
    const found = prereqKey ? courses.find(c => getCourseKey(c) === prereqKey) : null
    if (prereqKey) {
      if (!blobMap.has(prereqKey)) blobMap.set(prereqKey, { found, rawLabels: [] })
      const numeric = typeof p === 'number' ? String(p) : p.trim().split(/\s+/).slice(1).join(' ') || p
      blobMap.get(prereqKey).rawLabels.push(numeric)
    } else {
      const label = typeof p === 'string' ? p : String(p)
      const fk = `unresolved-${label}`
      if (!blobMap.has(fk)) blobMap.set(fk, { found: null, rawLabels: [label] })
    }
  })

  const prereqEntries = Array.from(blobMap.entries()).map(([prereqKey, { found, rawLabels }]) => {
    const prereqCompleted = !prereqKey.startsWith('unresolved-') && (completedIds?.has(prereqKey) ?? false)
    const foundIds = found ? (Array.isArray(found.id) ? found.id : [found.id]) : []
    let name
    if (!found) name = rawLabels[0]
    else if (rawLabels.length > 1) name = `${found.dept} ${rawLabels.join(' / ')}, ${found.name}`
    else name = `${found.dept} ${foundIds[0]}, ${found.name}`
    return { prereqKey, name, prereqCompleted, clickable: !prereqKey.startsWith('unresolved-') }
  })

  const hasPrereqs = prereqEntries.length > 0
  const allPrereqsDone = hasPrereqs && prereqEntries.every(e => e.prereqCompleted)
  const canTake = allPrereqsDone && !isCompleted

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 49,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.32s ease',
          pointerEvents: visible ? 'auto' : 'none',
        }}
        className="sm:hidden"
      />

      <div
        style={{
          position: 'fixed',
          zIndex: 50,
          background: '#141414',
          borderLeft: `1px solid ${border}`,
          fontFamily: "'League Spartan', sans-serif",
          overflowY: 'auto',
          boxShadow: `-6px 0 32px rgba(0,0,0,0.6)`,
          top: 0, right: 0, width: 320, height: '100vh',
          transform: `translateX(${visible ? '0' : '100%'})`,
          transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        className="course-panel"
      >
        <div style={{ padding: '24px 22px 32px', overflow: 'hidden', boxSizing: 'border-box', width: '100%' }}>

          {/* Close + thumbs up */}
          <div style={{ position: 'absolute', top: 14, right: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#555', lineHeight: 1, padding: 0, fontSize: 18,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = text)}
              onMouseLeave={e => (e.currentTarget.style.color = '#555')}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Course id + name */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', color: muted, textTransform: 'uppercase', marginBottom: 4 }}>
              {displayed.dept}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: text, lineHeight: 1.15 }}>
              {idLabel} — {displayed.name}
            </div>
          </div>

          {displayed.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {displayed.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '3px 8px', borderRadius: 4,
                  border: `1px solid ${border}`, color: muted,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <Divider color={border} />

          <Section label="Description">
  {displayed.desc
    ? <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.7, margin: 0 }}>{displayed.desc}</p>
    : <p style={{ fontSize: 13, color: '#444', fontStyle: 'italic', margin: 0 }}>No description available.</p>
  }
  {canTake && (
    <p style={{ fontSize: 12, color: '#60a5fa', margin: '10px 0 0', letterSpacing: '0.02em' }}>
      ✓ You can take this course.
    </p>
  )}
</Section>

<Divider color={border} />

<Section label="Completion">
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <button
      onClick={() => onToggleCompleted(key)}
      style={{
        background: isCompleted ? '#0f2033' : '#1a1a1a',
        border: `1px solid ${isCompleted ? '#1a3a5c' : '#2e2e2e'}`,
        borderRadius: 8,
        cursor: 'pointer',
        padding: '6px 8px',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = isCompleted ? '#2a5a8c' : '#555'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isCompleted ? '#1a3a5c' : '#2e2e2e'
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24"
        fill={isCompleted ? '#60a5fa' : 'none'}
        stroke={isCompleted ? '#60a5fa' : '#555'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
      </svg>
    </button>
    <span style={{ fontSize: 13, color: isCompleted ? '#60a5fa' : '#444', transition: 'color 0.15s' }}>
      {isCompleted ? 'I have completed this course.' : 'I haven\'t completed this course.'}
    </span>
  </div>
</Section>

          <Divider color={border} />

          <Section label="Prerequisites">
            {prereqEntries.length === 0 ? (
              <p style={{ fontSize: 13, color: '#444', fontStyle: 'italic', margin: 0 }}>None</p>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {prereqEntries.map(({ prereqKey, name, prereqCompleted, clickable }, i) => (
                  <li
                    key={i}
                    onClick={() => clickable && onSelectCourse(prereqKey)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      cursor: clickable ? 'pointer' : 'default',
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: `1px solid ${prereqCompleted ? '#1a3a5c' : 'transparent'}`,
                      background: prereqCompleted ? '#0a1520' : 'transparent',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={e => {
                      if (!clickable) return
                      e.currentTarget.style.borderColor = prereqCompleted ? '#2a5a8c' : border
                      e.currentTarget.style.background = prereqCompleted ? '#0f1a24' : `${border}11`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = prereqCompleted ? '#1a3a5c' : 'transparent'
                      e.currentTarget.style.background = prereqCompleted ? '#0a1520' : 'transparent'
                    }}
                  >
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: prereqCompleted ? '#60a5fa' : (clickable ? border : '#333'),
                    }} />
                    <span style={{
                      fontSize: 13,
                      color: prereqCompleted ? '#60a5fa' : (clickable ? '#aaa' : '#444'),
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      minWidth: 0, flex: 1,
                    }}>
                      {name}
                    </span>
                    {clickable && (
                      <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={prereqCompleted ? '#2a5a8c' : '#444'} strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {displayed.units != null && (
            <>
              <Divider color={border} />
              <Section label="Units">
                <span style={{ fontSize: 20, fontWeight: 700, color: text }}>{displayed.units}</span>
                <span style={{ fontSize: 12, color: muted, marginLeft: 6 }}>credit hours</span>
              </Section>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .course-panel {
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            max-height: 70vh !important;
            border-left: none !important;
            border-top: 1px solid ${border} !important;
            border-radius: 16px 16px 0 0 !important;
            box-shadow: 0 -6px 32px rgba(0,0,0,0.6) !important;
            transform: translateY(${visible ? '0' : '100%'}) !important;
            transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1) !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#444', marginBottom: 10 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function Divider({ color }) {
  return <div style={{ height: 1, background: `linear-gradient(to right, ${color}44, transparent)`, margin: '0 0 20px' }} />
}