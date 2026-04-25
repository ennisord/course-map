import { useRef, useState, useEffect } from 'react'
import courses from './data/courses.json'

const ZONE_GAP = 320
const SUBCOL_GAP = 220
const ROW_GAP = 100

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
      const inZonePrereqs = course.prereqs.filter(pid => idSet.has(pid))
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

function CourseNode({ course, pos, selected, onDragStart, onClick }) {
  const { border, text, muted } = getColor(course.tags)
  const glow = selected ? getGlow(course.tags) : 'none'

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
      <div className="text-[13px] font-bold tracking-wide truncate" style={{ color: text }}>{course.dept} {course.id}</div>
      <div className="text-[11px] font-normal truncate" style={{ color: muted }}>{course.name}</div>
    </div>
  )
}

function Legend() {
  return (
    <div
      className="fixed bottom-6 left-6 flex flex-col gap-1.5 rounded-lg bg-[#1a1a1a] border border-[#2e2e2e] px-3 py-2.5 pointer-events-none"
      style={{ fontFamily: "'League Spartan', sans-serif" }}
    >
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-sm bg-[#4ade80]" />
        <span className="text-[12px] font-medium text-[#888]">Core requirement</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-sm bg-[#ffd700]" />
        <span className="text-[12px] font-medium text-[#888]">Honours</span>
      </div>
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

  const connectedIds = selectedId ? (() => {
    const selected = courses.find(c => getKey(c) === selectedId)
    if (!selected) return new Set()
    const ids = new Set()
    selected.prereqs.forEach(pid => {
      const p = courses.find(c => c.id === pid)
      if (p) ids.add(getKey(p))
    })
    courses.forEach(c => {
      if (c.prereqs.includes(selected.id)) ids.add(getKey(c))
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
      setOffset(o => ({
        x: clientX - ratio * (clientX - o.x),
        y: clientY - ratio * (clientY - o.y),
      }))
      return next
    })
  }

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging) return
      didDragRef.current = true
      setOffset({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y })
    }
    const onMouseUp = () => setDragging(false)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragging])

  const beginDrag = (clientX, clientY) => {
    setDragging(true)
    didDragRef.current = false
    startRef.current = { x: clientX - offset.x, y: clientY - offset.y }
  }

  const onMouseDown = (e) => {
    beginDrag(e.clientX, e.clientY)
  }

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
      setOffset({ x: t.clientX - startRef.current.x, y: t.clientY - startRef.current.y })
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
            return course.prereqs.map(prereqId => {
              const prereq = courses.find(c => c.id === prereqId)
              if (!prereq) return null
              const to = layout[getKey(prereq)]
              if (!from || !to) return null
              const isHighlighted = selectedId === key || selectedId === getKey(prereq)
              const { border } = getColor(course.tags)
              return (
                <path
                  key={`${key}-${prereqId}`}
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
                if (!didDragRef.current) {
                  setSelectedId(prev => prev === key ? null : key)
                }
              }}
            />
          )
        })}
      </div>

      <Legend />
    </div>
  )
}