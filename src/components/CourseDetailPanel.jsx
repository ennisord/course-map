import { useEffect, useState } from 'react'
import { getColor, getCourseKey, resolvePrereq } from '../utils/courseUtils'

export default function CourseDetailPanel({ course, courses, onClose, onSelectCourse }) {
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

  const ids = Array.isArray(displayed.id) ? displayed.id : [displayed.id]
  const idLabel = ids.join(' / ')

  const blobMap = new Map()
  ;(displayed.prereqs || []).forEach(p => {
    const key = resolvePrereq(p, courses)
    const found = key ? courses.find(c => getCourseKey(c) === key) : null
    if (key) {
      if (!blobMap.has(key)) blobMap.set(key, { found, rawLabels: [] })
      const numeric = typeof p === 'number' ? String(p) : p.trim().split(/\s+/).slice(1).join(' ') || p
      blobMap.get(key).rawLabels.push(numeric)
    } else {
      const label = typeof p === 'string' ? p : String(p)
      const fk = `unresolved-${label}`
      if (!blobMap.has(fk)) blobMap.set(fk, { found: null, rawLabels: [label] })
    }
  })

  const prereqNames = Array.from(blobMap.values()).map(({ found, rawLabels }) => {
    if (!found) return rawLabels[0]
    const foundIds = Array.isArray(found.id) ? found.id : [found.id]
    if (rawLabels.length > 1) return `${found.dept} ${rawLabels.join(' / ')}, ${found.name}`
    return `${found.dept} ${foundIds[0]}, ${found.name}`
  })

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
        {/* Inner wrapper gives content a true constrained width so truncation works */}
        <div style={{ padding: '24px 22px 32px', overflow: 'hidden', boxSizing: 'border-box', width: '100%' }}>

          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 16,
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

          {displayed.desc ? (
            <Section label="Description">
              <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.7, margin: 0 }}>{displayed.desc}</p>
            </Section>
          ) : (
            <Section label="Description">
              <p style={{ fontSize: 13, color: '#444', fontStyle: 'italic', margin: 0 }}>No description available.</p>
            </Section>
          )}

          <Divider color={border} />

          <Section label="Prerequisites">
            {prereqNames.length === 0 ? (
              <p style={{ fontSize: 13, color: '#444', fontStyle: 'italic', margin: 0 }}>None</p>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {prereqNames.map((name, i) => {
                  const key = Array.from(blobMap.keys())[i]
                  const clickable = key && !key.startsWith('unresolved-')
                  return (
                    <li
                      key={i}
                      onClick={() => clickable && onSelectCourse(key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        cursor: clickable ? 'pointer' : 'default',
                        padding: '6px 8px',
                        borderRadius: 6,
                        border: '1px solid transparent',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                      onMouseEnter={e => {
                        if (!clickable) return
                        e.currentTarget.style.borderColor = border
                        e.currentTarget.style.background = `${border}11`
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'transparent'
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: clickable ? border : '#333', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: clickable ? '#aaa' : '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{name}</span>
                      {clickable && (
                        <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      )}
                    </li>
                  )
                })}
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