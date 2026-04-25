import { useRef, useState, useEffect } from 'react'
import courses from './data/courses.json'
import { buildLayout, getBezier, getColor, resolvePrereq, clampOffset } from './utils/courseUtils'
import CourseNode from './components/CourseNode'
import Legend from './components/Legend'
import LoadingScreen from './components/LoadingScreen'
import CourseDetailPanel from './components/CourseDetailPanel'

const WORD = 'Course Map'

export default function App() {
  const [offset, setOffset] = useState({ x: 100, y: 200 })
  const [scale, setScale] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const startRef = useRef({ x: 0, y: 0 })
  const lastPinchRef = useRef(null)
  const didDragRef = useRef(false)

  const layout = buildLayout(courses)
  const getKey = (course) => `${course.dept}-${course.id}`

  // The course object for the currently selected node (or null)
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

  if (loading) return <LoadingScreen />

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
        <svg className="absolute top-0 left-0 overflow-visible pointer-events-none" style={{ width: 4000, height: 4000 }}>
          {courses.map(course => {
            const key = getKey(course)
            const from = layout[key]
            return course.prereqs.map((prereq, i) => {
              const prereqKey = resolvePrereq(prereq, courses)
              if (!prereqKey) return null
              const to = layout[prereqKey]
              if (!from || !to) return null
              const isHighlighted = selectedId === key || selectedId === prereqKey
              const { border } = getColor(course.tags)
              return (
                <path
                  key={`${key}-${i}`}
                  d={getBezier(to.x, to.y, from.x, from.y)}
                  stroke={border}
                  strokeWidth={isHighlighted ? 2 : 1.5}
                  fill="none"
                  opacity={isHighlighted ? 1 : 0.5}
                />
              )
            })
          })}
        </svg>

        {courses.map(course => {
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
            />
          )
        })}
      </div>

      {/* Course detail panel — sits outside the panning layer so it stays fixed */}
      <CourseDetailPanel
        course={selectedCourse}
        courses={courses}
        onClose={() => setSelectedId(null)}
      />

      <Legend />
    </div>
  )
}