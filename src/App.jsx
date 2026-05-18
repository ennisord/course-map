import { useRef, useState, useEffect } from 'react'
import courses from './data/courses.json'
import { buildLayout, getBezier, getColor, resolvePrereq, clampOffset, setContentBounds } from './utils/courseUtils'
import CourseNode from './components/CourseNode'
import Legend from './components/Legend'
import LoadingScreen from './components/LoadingScreen'
import CourseDetailPanel from './components/CourseDetailPanel'
import ElectivePopup from './components/ElectivePopup'

const WORD = 'Course Map'

// Edit these subheaders to match your department's language
const ZONE_LABELS = {
  1: { title: '100-level', sub: 'Foundations' },
  2: { title: '200-level', sub: 'Core methods' },
  3: { title: '300-level', sub: 'Intermediate theory' },
  4: { title: '400-level', sub: 'Advanced topics' },
  5: { title: '500-level', sub: 'Graduate / honours' },
}

// How far above the node layer (y=50) the bracket sits.
// Increase this value for more breathing room.
const LABEL_OFFSET_Y = -80

export default function App() {
  const [offset, setOffset] = useState({ x: 100, y: 200 })
  const [scale, setScale] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [popup, setPopup] = useState(null)
  const startRef = useRef({ x: 0, y: 0 })
  const lastPinchRef = useRef(null)
  const didDragRef = useRef(false)

  const { layout, collapsedElectives, zoneExtents } = buildLayout(courses)
  const getKey = (course) => `${course.dept}-${course.id}`

  const allPositions = Object.values(layout)
  if (allPositions.length > 0) {
    setContentBounds({
      minX: Math.min(...allPositions.map(p => p.x)) - 90,
      maxX: Math.max(...allPositions.map(p => p.x)) + 90,
      minY: Math.min(...allPositions.map(p => p.y)) - 40,
      maxY: Math.max(...allPositions.map(p => p.y)) + 40,
    })
  }

  const selectedCourse = selectedId
    ? courses.find(c => getKey(c) === selectedId) ?? null
    : null

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), WORD.length * 120 + 600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;500;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  useEffect(() => {
    const positions = Object.values(layout)
    if (positions.length === 0) return
    const minX = Math.min(...positions.map(p => p.x))
    const minY = Math.min(...positions.map(p => p.y))
    const maxY = Math.max(...positions.map(p => p.y))
    const colCenterY = (minY + maxY) / 2
    const spawnX = 120 - minX * scale
    const spawnY = window.innerHeight / 2 - colCenterY * scale
    setOffset(clampOffset(spawnX, spawnY, scale))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const connectedIds = selectedId ? (() => {
    const selected = courses.find(c => getKey(c) === selectedId)
    if (!selected) return new Set()
    const ids = new Set()
    selected.prereqs.forEach(prereq => {
      const key = resolvePrereq(prereq, courses)
      if (key) ids.add(key)
    })
    courses.forEach(c => {
      if (c.prereqs.some(p => {
        if (typeof p === 'number') {
          const sel = courses.find(x => getKey(x) === selectedId)
          return sel && p === sel.id
        }
        return resolvePrereq(p, courses) === selectedId
      })) ids.add(getKey(c))
    })
    return ids
  })() : new Set()

  const applyZoom = (delta, clientX, clientY) => {
    setScale(prev => {
      const next = Math.min(2, Math.max(0.3, prev + delta))
      const ratio = next / prev
      setOffset(o => clampOffset(
        clientX - ratio * (clientX - o.x),
        clientY - ratio * (clientY - o.y),
        next
      ))
      return next
    })
  }

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging) return
      didDragRef.current = true
      setOffset(clampOffset(e.clientX - startRef.current.x, e.clientY - startRef.current.y, scale))
    }
    const onMouseUp = () => setDragging(false)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragging, scale])

  const beginDrag = (clientX, clientY) => {
    setDragging(true)
    didDragRef.current = false
    startRef.current = { x: clientX - offset.x, y: clientY - offset.y }
  }

  const onMouseDown = (e) => beginDrag(e.clientX, e.clientY)
  const onWheel = (e) => { e.preventDefault(); applyZoom(-e.deltaY * 0.001, e.clientX, e.clientY) }

  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      beginDrag(e.touches[0].clientX, e.touches[0].clientY)
    } else if (e.touches.length === 2) {
      setDragging(false)
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastPinchRef.current = {
        dist: Math.hypot(dx, dy),
        cx: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        cy: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      }
    }
  }

  const onTouchMove = (e) => {
    e.preventDefault()
    if (e.touches.length === 1 && dragging) {
      didDragRef.current = true
      setOffset(clampOffset(e.touches[0].clientX - startRef.current.x, e.touches[0].clientY - startRef.current.y, scale))
    } else if (e.touches.length === 2 && lastPinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
      applyZoom((dist - lastPinchRef.current.dist) * 0.005, cx, cy)
      lastPinchRef.current = { dist, cx, cy }
    }
  }

  const onTouchEnd = () => { setDragging(false); lastPinchRef.current = null }

  const handleGhostClick = (ghostKey) => {
    if (didDragRef.current) return
    setPopup(prev => prev?.ghostKey === ghostKey ? null : { ghostKey })
  }

  if (loading) return <LoadingScreen />

  const popupElectives = popup ? collapsedElectives[popup.ghostKey] : null

  // Bracket geometry constants
  const BRACKET_TICK = 8
  const BRACKET_RADIUS = 4
  const bracketY = LABEL_OFFSET_Y + 36

  return (
    <div
      onMouseDown={onMouseDown}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`w-screen h-screen overflow-hidden relative select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ background: '#101010', touchAction: 'none' }}
    >
      <div style={{
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        transformOrigin: '0 0',
        position: 'absolute',
        top: 0,
        left: 0,
      }}>

        {/* Zone overbrace labels */}
        <svg
          className="absolute top-0 left-0 overflow-visible pointer-events-none"
          style={{ width: 4000, height: 4000 }}
        >
          {Object.entries(zoneExtents).map(([zone, { startX, endX }]) => {
            const label = ZONE_LABELS[Number(zone)]
            if (!label) return null
            const midX = (startX + endX) / 2
            const r = BRACKET_RADIUS
            const tick = BRACKET_TICK

            return (
              <g key={zone} style={{ fontFamily: "'League Spartan', sans-serif" }}>
                {/* Rectangular overbrace: left tick → rounded corner → bar → rounded corner → right tick */}
                <path
                  d={`M ${startX} ${bracketY + tick} L ${startX} ${bracketY + r} Q ${startX} ${bracketY} ${startX + r} ${bracketY} L ${endX - r} ${bracketY} Q ${endX} ${bracketY} ${endX} ${bracketY + r} L ${endX} ${bracketY + tick}`}
                  fill="none"
                  stroke="#2e2e2e"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
                {/* Level title e.g. "100-level" */}
                <text
                  x={midX}
                  y={LABEL_OFFSET_Y + 22}
                  textAnchor="middle"
                  fill="#666"
                  fontSize={12}
                  fontWeight={600}
                  letterSpacing="0.06em"
                >
                  {label.title.toUpperCase()}
                </text>
                {/* Subheader */}
                <text
                  x={midX}
                  y={LABEL_OFFSET_Y + 8}
                  textAnchor="middle"
                  fill="#3a3a3a"
                  fontSize={10}
                  fontWeight={400}
                  letterSpacing="0.03em"
                >
                  {label.sub}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Bezier curves — only for selected and connected nodes */}
        <svg className="absolute top-0 left-0 overflow-visible pointer-events-none" style={{ width: 4000, height: 4000 }}>
          {courses.map(course => {
            const key = getKey(course)
            const from = layout[key]
            if (!from) return null
            if (selectedId !== key) return null
            return course.prereqs.map((prereq, i) => {
              const prereqKey = resolvePrereq(prereq, courses)
              if (!prereqKey) return null
              const to = layout[prereqKey]
              if (!to) return null
              const { border } = getColor(course.tags)
              return (
                <path
                  key={`${key}-${i}`}
                  d={getBezier(to.x, to.y, from.x, from.y)}
                  stroke={border}
                  strokeWidth={2}
                  fill="none"
                  opacity={0.85}
                />
              )
            })
          })}
        </svg>

        {/* Regular course nodes */}
        {courses
          .filter(c => c.tags.length > 0)
          .map(course => {
            const key = getKey(course)
            const pos = layout[key]
            const selected = selectedId === key || connectedIds.has(key)
            return (
              <CourseNode
                key={key}
                course={course}
                pos={pos}
                selected={selected}
                onDragStart={(e) => {
                  const clientX = e.touches ? e.touches[0].clientX : e.clientX
                  const clientY = e.touches ? e.touches[0].clientY : e.clientY
                  beginDrag(clientX, clientY)
                }}
                onClick={() => {
                  if (!didDragRef.current) setSelectedId(prev => prev === key ? null : key)
                }}
                courses={courses}
                onSelectCourse={(prereqKey) => setSelectedId(prereqKey)}
              />
            )
          })}

        {/* Ghost nodes for collapsed electives */}
        {Object.entries(collapsedElectives).map(([ghostKey, { courses: electives, x, y }]) => {
          const isOpen = popup?.ghostKey === ghostKey
          return (
            <div
              key={ghostKey}
              data-ghost="true"
              className="absolute select-none -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: x,
                top: y,
                width: 176,
                fontFamily: "'League Spartan', sans-serif",
              }}
              onMouseDown={e => { e.stopPropagation(); beginDrag(e.clientX, e.clientY) }}
              onTouchStart={e => { e.stopPropagation(); beginDrag(e.touches[0].clientX, e.touches[0].clientY) }}
              onClick={() => handleGhostClick(ghostKey)}
            >
              <div style={{
                background: isOpen ? '#1e1e1e' : '#161616',
                border: `1px dashed ${isOpen ? '#555' : '#333'}`,
                borderRadius: 10,
                padding: '7px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'border-color 0.15s, background 0.15s',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isOpen ? '#888' : '#444'} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, transition: 'stroke 0.15s' }}>
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
                <div>
                  <div style={{ color: isOpen ? '#aaa' : '#666', fontSize: 11, fontWeight: 600, letterSpacing: '0.03em', transition: 'color 0.15s' }}>
                    {electives.length} elective{electives.length !== 1 ? 's' : ''}
                  </div>
                  <div style={{ color: '#3a3a3a', fontSize: 10, marginTop: 1 }}>
                    click to browse
                  </div>
                </div>
                <svg
                  width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke={isOpen ? '#666' : '#333'} strokeWidth="2.5" strokeLinecap="round"
                  style={{ marginLeft: 'auto', flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s, stroke 0.15s' }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
          )
        })}
      </div>

      {/* Elective popup — outside the panning layer, fixed position */}
      {popup && popupElectives && (
        <ElectivePopup
          courses={popupElectives.courses}
          allCourses={courses}
          selectedId={selectedId}
          onSelectCourse={(course) => setSelectedId(getKey(course))}
          onClose={() => setPopup(null)}
        />
      )}

      {/* Course detail panel */}
      <CourseDetailPanel
        course={selectedCourse}
        courses={courses}
        onClose={() => setSelectedId(null)}
      />

      <Legend
        onZoomIn={() => applyZoom(0.15, window.innerWidth / 2, window.innerHeight / 2)}
        onZoomOut={() => applyZoom(-0.15, window.innerWidth / 2, window.innerHeight / 2)}
      />
    </div>
  )
}