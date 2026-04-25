import { useState } from 'react'
import { getColor, getGlow } from '../utils/courseUtils'

export default function CourseNode({ course, pos, selected, onDragStart, onClick }) {
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
  )
}