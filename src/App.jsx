import { useRef, useState, useEffect, useCallback } from 'react'
import courses from './data/courses.json'
import LoadingScreen from './components/LoadingScreen'

const ZONE_GAP = 320
const SUBCOL_GAP = 220
const ROW_GAP = 100
const WORD = 'Course Map'

function getColor(tags) {
  if (tags.includes('honours')) return { border: '#b8860b', text: '#ffd700', muted: '#8a6500' }
  if (tags.includes('core')) return { border: '#1a5c2e', text: '#4ade80', muted: '#166634' }
  return { border: '#2e2e2e', text: '#e5e5e5', muted: '#555' }
}

function getGlow(tags) {
  if (tags.includes('honours')) return '0 0 10px 2px rgba(184,134,11,0.7)'
  if (tags.includes('core')) return '0 0 10px 2px rgba(74,222,128,0.7)'
  return '0 0 10px 2px rgba(150,150,150,0.5)'
}

// Resolve a prereq (int or string like 'STAT 217') to a course key, or null
function resolvePrereq(prereq, courseList) {
  if (typeof prereq === 'number') {
    const match = courseList.find(c => c.id === prereq)
    return match ? `${match.dept}-${match.id}` : null
  }
  // string like 'STAT 217'
  const parts = prereq.trim().split(/\s+/)
  if (parts.length < 2) return null
  const dept = parts[0]
  const id = parseInt(parts[1])
  const match = courseList.find(c => c.dept === dept && c.id === id)
  return match ? `${match.dept}-${match.id}` : null
}

function buildLayout(courses) {
  const byZone = {}
  courses.forEach(c => {
    const zone = Math.floor(c.id / 100)
    if (!byZone[zone]) byZone[zone] = []
    byZone[zone].push(c)
  })

  const positioned = {}
  const sortedZones = Object.keys(byZone).map(Number).sort()
  const globalMax = Math.max(...Object.values(byZone).map(g => g.length))
  const globalHeight = (globalMax - 1) * ROW_GAP
  let zoneX = 0

  sortedZones.forEach(zone => {
    const group = byZone[zone]
    const idSet = new Set(group.map(c => c.id))

    const subcol = {}
    const getSubcol = (course) => {
      if (subcol[course.id] !== undefined) return subcol[course.id]
      // Only consider integer prereqs within this zone for layout
      const inZonePrereqs = course.prereqs.filter(p => typeof p === 'number' && idSet.has(p))
      if (inZonePrereqs.length === 0) { subcol[course.id] = 0; return 0 }
      const max = Math.max(...inZonePrereqs.map(pid => {
        const prereq = group.find(c => c.id === pid)
        return prereq ? getSubcol(prereq) : 0
      }))
      subcol[course.id] = max + 1
      return max + 1
    }

    group.forEach(c => getSubcol(c))

    const bySubcol = {}
    group.forEach(c => {
      const sc = subcol[c.id]
      if (!bySubcol[sc]) bySubcol[sc] = []
      bySubcol[sc].push(c)
    })

    Object.entries(bySubcol).forEach(([sc, subgroup]) => {
      const colHeight = (subgroup.length - 1) * ROW_GAP
      const startY = (globalHeight - colHeight) / 2
      subgroup.forEach((c, i) => {
        positioned[`${c.dept}-${c.id}`] = {
          x: zoneX + parseInt(sc) * SUBCOL_GAP,
          y: startY + i * ROW_GAP,
        }
      })
    })

    const maxSubcol = Math.max(...Object.keys(bySubcol).map(Number))
    zoneX += ZONE_GAP + maxSubcol * SUBCOL_GAP
  })

  return positioned
}

function getBezier(x1, y1, x2, y2) {
  const cx = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`
}

function clampOffset(x, y, scale) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const pad = 0.85 // how much of a viewport you can drag past the edge
  const minX = -4000 * scale + vw * pad
  const maxX = vw * (1 - pad + 1)
  const minY = -4000 * scale + vh * pad
  const maxY = vh * (1 - pad + 1)
  return {
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.min(maxY, Math.max(minY, y)),
  }
}

function CourseNode({ course, pos, selected, onDragStart, onClick }) {
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

  return (
    <div
      className="absolute select-none w-44 rounded-lg bg-[#1a1a1a] px-3 py-2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      style={{
        left: pos.x,
        top: pos.y,
        border: `1px solid ${border}`,
        boxShadow: glow,
        fontFamily: "'League Spartan', sans-serif",
      }}
      onMouseDown={e => { e.stopPropagation(); onDragStart(e) }}
      onTouchStart={e => { e.stopPropagation(); onDragStart(e) }}
      onClick={onClick}
    >
      <div className="text-[13px] font-bold tracking-wide truncate" style={{ color: text }}>
        {course.dept} {course.id}
      </div>
      <div className="text-[11px] font-normal truncate" style={{ color: muted }}>
        {course.name}
      </div>

      <div className="flex gap-2 mt-1.5">
        {/* Thumbs up — Completed */}
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

        {/* Heart — Wishlist */}
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
  )
}

function Legend() {
  return (
    <div className="fixed bottom-6 left-6 flex flex-col gap-1.5 pointer-events-none" style={{ fontFamily: "'League Spartan', sans-serif" }}>
      <span className="inline-block bg-green-400 text-[#101010] rounded-md px-2.5 py-0.5 text-md font-medium w-fit">
        Core requirement
      </span>
      <span className="inline-block bg-[#ffd700] text-[#101010] rounded-md px-2.5 py-0.5 text-md font-medium w-fit">
        Honours requirement
      </span>
    </div>
  )
}

export default function App() {
  const [offset, setOffset] = useState({ x: 100, y: 200 })
  const [scale, setScale] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const startRef = useRef({ x: 0, y: 0 })
  const lastPinchRef = useRef(null)
  const didDragRef = useRef(false)

  const layout = buildLayout(courses)
  const getKey = (course) => `${course.dept}-${course.id}`

  // Loading screen
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), WORD.length * 120 + 600)
    return () => clearTimeout(t)
  }, [])

  // Spawn: center the first column on screen
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

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;500;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  const applyZoom = (delta, clientX, clientY) => {
    setScale(prev => {
      const next = Math.min(2, Math.max(0.3, prev + delta))
      const ratio = next / prev
      setOffset(o => {
        const nx = clientX - ratio * (clientX - o.x)
        const ny = clientY - ratio * (clientY - o.y)
        return clampOffset(nx, ny, next)
      })
      return next
    })
  }

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging) return
      didDragRef.current = true
      const nx = e.clientX - startRef.current.x
      const ny = e.clientY - startRef.current.y
      setOffset(clampOffset(nx, ny, scale))
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

  const onWheel = (e) => {
    e.preventDefault()
    applyZoom(-e.deltaY * 0.001, e.clientX, e.clientY)
  }

  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      const t = e.touches[0]
      beginDrag(t.clientX, t.clientY)
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
      const t = e.touches[0]
      didDragRef.current = true
      const nx = t.clientX - startRef.current.x
      const ny = t.clientY - startRef.current.y
      setOffset(clampOffset(nx, ny, scale))
    } else if (e.touches.length === 2 && lastPinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
      const delta = (dist - lastPinchRef.current.dist) * 0.005
      lastPinchRef.current = { dist, cx, cy }
      applyZoom(delta, cx, cy)
    }
  }

  const onTouchEnd = () => {
    setDragging(false)
    lastPinchRef.current = null
  }

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

      <Legend />
    </div>
  )
}