import { useState } from 'react'
import { getColor, getGlow, getCourseKey, resolvePrereq } from '../utils/courseUtils'

// Colour of the "/" separator in merged blobs
const OR_SLASH_COLOR = '#333'

export default function CourseNode({ course, pos, selected, onDragStart, onClick, courses, onSelectCourse }) {
  const [completed, setCompleted] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  const baseColor = getColor(course.tags)
  const { border, text, muted } = completed
    ? { border: '#1a3a5c', text: '#60a5fa', muted: '#2a4a6c' }
    : baseColor
  const glow = selected
    ? completed
      ? '0 0 10px 2px rgba(96,165,250,0.7)'
      : getGlow(course.tags)
    : 'none'

  // Display label for the node header
  const ids = Array.isArray(course.id) ? course.id : [course.id]
  const courseLabel = `${course.dept} ${ids[0]}`
  const extraIds = ids.slice(1)

  // Build prereq blobs, collapsing multiple prereqs that resolve to the same
  // node into a single blob showing all the original ids (e.g. 249 / 265 / 275)
  const blobMap = new Map() // key -> { resolvedCourse, labels: [] }
  course.prereqs.forEach(prereq => {
    const key = resolvePrereq(prereq, courses)
    const resolvedCourse = key ? courses.find(c => getCourseKey(c) === key) : null

    // Raw label for this prereq entry
    const rawLabel = typeof prereq === 'number'
      ? String(prereq)
      : prereq.trim().split(/\s+/).slice(1).join(' ') || prereq // just the numeric part e.g. "265"

    if (key) {
      if (!blobMap.has(key)) {
        blobMap.set(key, { key, resolvedCourse, dept: resolvedCourse?.dept ?? null, labels: [] })
      }
      blobMap.get(key).labels.push(rawLabel)
    } else {
      // Unresolved prereq — show as-is, unique key by label
      const fallbackKey = `unresolved-${prereq}`
      if (!blobMap.has(fallbackKey)) {
        blobMap.set(fallbackKey, { key: null, resolvedCourse: null, dept: null, labels: [rawLabel] })
      }
    }
  })

  const prereqBlobs = Array.from(blobMap.values()).map(({ key, resolvedCourse, dept, labels }) => {
    // If multiple labels collapsed into one blob, build "249 / 265 / 275"
    // Prefix dept only on the first label if it's a cross-dept course
    let parts
    if (labels.length > 1) {
      // All from same dept node — show dept once then numbers
      const firstIsDeptPrefixed = resolvedCourse && resolvedCourse.dept !== 'ECON'
      parts = labels.map((l, i) => {
        // Strip any dept prefix from label since we'll add it on first
        const numeric = l.replace(/^[A-Z]+ /, '')
        if (i === 0 && firstIsDeptPrefixed) return `${resolvedCourse.dept} ${numeric}`
        return numeric
      })
    } else {
      // Single prereq — original display logic
      if (resolvedCourse) {
        parts = [resolvedCourse.dept === 'ECON'
          ? String(Array.isArray(resolvedCourse.id) ? resolvedCourse.id[0] : resolvedCourse.id)
          : `${resolvedCourse.dept} ${Array.isArray(resolvedCourse.id) ? resolvedCourse.id[0] : resolvedCourse.id}`]
      } else {
        parts = [labels[0]]
      }
    }

    const title = resolvedCourse
      ? `${resolvedCourse.dept} ${Array.isArray(resolvedCourse.id) ? resolvedCourse.id.join('/') : resolvedCourse.id} — ${resolvedCourse.name}`
      : parts.join(' / ')

    return { key, parts, title }
  })

  const CARD_HEIGHT = 68

  return (
    <div
      className="absolute select-none w-44 -translate-x-1/2 -translate-y-1/2"
      style={{ left: pos.x, top: pos.y, fontFamily: "'League Spartan', sans-serif", height: CARD_HEIGHT }}
    >
      <div
        className="rounded-lg bg-[#1a1a1a] px-3 py-2 cursor-pointer h-full"
        style={{ border: `1px solid ${border}`, boxShadow: glow }}
        onMouseDown={e => { e.stopPropagation(); onDragStart(e) }}
        onTouchStart={e => { e.stopPropagation(); onDragStart(e) }}
        onClick={onClick}
      >
        <div className="text-[13px] font-bold tracking-wide truncate" style={{ color: text }}>
          {courseLabel}
          {extraIds.map((xid) => (
            <span key={xid}>
              <span style={{ color: OR_SLASH_COLOR, fontWeight: 700 }}> / </span>
              <span>{xid}</span>
            </span>
          ))}
        </div>
        <div className="text-[11px] font-normal truncate" style={{ color: muted }}>
          {course.name}
        </div>

        <div className="flex gap-2 mt-1.5">
          <button
            title="Completed"
            className="group relative p-0 bg-transparent border-none cursor-pointer"
            onMouseDown={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); setCompleted(v => !v) }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={completed ? '#60a5fa' : 'none'} stroke={completed ? '#60a5fa' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 rounded bg-[#2a2a2a] text-[10px] text-[#ccc] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Completed
            </span>
          </button>

          <button
            title="Wishlist"
            className="group relative p-0 bg-transparent border-none cursor-pointer"
            onMouseDown={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); setWishlisted(v => !v) }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={wishlisted ? '#f87171' : 'none'} stroke={wishlisted ? '#f87171' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 rounded bg-[#2a2a2a] text-[10px] text-[#ccc] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Wishlist
            </span>
          </button>
        </div>
      </div>

      {prereqBlobs.length > 0 && (
        <div
          className="flex flex-wrap gap-1 px-1"
          style={{ position: 'absolute', top: CARD_HEIGHT + 6, left: 0, width: '100%' }}
        >
          {prereqBlobs.map(({ key, parts, title }) => (
            <button
              key={key ?? parts.join('/')}
              onMouseDown={e => e.stopPropagation()}
              onTouchStart={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); if (key && onSelectCourse) onSelectCourse(key) }}
              title={title}
              style={{
                background: '#1e1e1e',
                border: '1px solid #2e2e2e',
                borderRadius: 999,
                padding: '2px 7px',
                fontSize: 10,
                fontWeight: 600,
                color: '#555',
                cursor: key ? 'pointer' : 'default',
                fontFamily: "'League Spartan', sans-serif",
                letterSpacing: '0.03em',
                transition: 'border-color 0.15s, color 0.15s',
                lineHeight: 1.6,
              }}
              onMouseEnter={e => { if (!key) return; e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#999' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2e2e2e'; e.currentTarget.style.color = '#555' }}
            >
              {parts.map((p, i) => (
                <span key={i}>
                  {i > 0 && <span style={{ color: OR_SLASH_COLOR, margin: '0 2px' }}>/</span>}
                  {p}
                </span>
              ))}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}