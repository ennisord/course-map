export default function Legend({ onZoomIn, onZoomOut }) {
  const btnStyle = {
    background: '#1a1a1a',
    border: '1px solid #2e2e2e',
    borderRadius: 6,
    color: '#666',
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1,
    transition: 'border-color 0.15s, color 0.15s',
    flexShrink: 0,
  }

  const hover = (e) => {
    e.currentTarget.style.borderColor = '#555'
    e.currentTarget.style.color = '#bbb'
  }
  const unhover = (e) => {
    e.currentTarget.style.borderColor = '#2e2e2e'
    e.currentTarget.style.color = '#666'
  }

  return (
    <div
      className="fixed bottom-6 left-6 flex flex-col gap-1.5 pointer-events-none"
      style={{ fontFamily: "'League Spartan', sans-serif" }}
    >
      {/* Zoom controls */}
      <div className="flex gap-1.5 mb-1 pointer-events-auto">
        <button
          style={btnStyle}
          onMouseEnter={hover}
          onMouseLeave={unhover}
          onMouseDown={e => e.stopPropagation()}
          onClick={onZoomIn}
          title="Zoom in"
        >+</button>
        <button
          style={btnStyle}
          onMouseEnter={hover}
          onMouseLeave={unhover}
          onMouseDown={e => e.stopPropagation()}
          onClick={onZoomOut}
          title="Zoom out"
        >−</button>
      </div>

      {/* Legend items */}
      <span className="inline-block w-fit rounded-md px-2.5 py-0.5 text-[12px] font-semibold tracking-wide" style={{ background: '#1a1a1a', border: '1px solid #1a5c2e', color: '#4ade80' }}>
        Core requirement
      </span>
      <span className="inline-block w-fit rounded-md px-2.5 py-0.5 text-[12px] font-semibold tracking-wide" style={{ background: '#1a1a1a', border: '1px solid #b8860b', color: '#ffd700' }}>
        Honours requirement
      </span>
    </div>
  )
}