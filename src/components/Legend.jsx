export default function Legend({ onZoomIn, onZoomOut, onOpenWishlist, onOpenCompleted, onOpenSearch }) {
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

  const iconBtnStyle = {
    background: '#1a1a1a',
    border: '1px solid #2e2e2e',
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    transition: 'border-color 0.15s',
    padding: 0,
    pointerEvents: 'auto',
  }

  const iconHover = (e) => { e.currentTarget.style.borderColor = '#555' }
  const iconUnhover = (e) => { e.currentTarget.style.borderColor = '#2e2e2e' }

  return (
    <>
      <style>{`
        .legend-wrap {
          position: fixed;
          bottom: 24px;
          left: 24px;
          font-family: 'League Spartan', sans-serif;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-start;
        }
        @media (max-width: 640px) {
          .legend-wrap {
            left: auto;
            right: 10px;
            bottom: 14px;
            align-items: flex-end;
          }
        }
      `}</style>
      <div className="legend-wrap">

        {/* Search */}
        <button
          style={iconBtnStyle}
          onMouseEnter={iconHover}
          onMouseLeave={iconUnhover}
          onMouseDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
          onClick={onOpenSearch}
          title="Search courses"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
          </svg>
        </button>

        {/* Wishlist
        <button
          style={iconBtnStyle}
          onMouseEnter={iconHover}
          onMouseLeave={iconUnhover}
          onMouseDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
          onClick={onOpenWishlist}
          title="Wishlist"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        */}

        {/* Completed */}
        <button
          style={{ ...iconBtnStyle, marginBottom: 4 }}
          onMouseEnter={iconHover}
          onMouseLeave={iconUnhover}
          onMouseDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
          onClick={onOpenCompleted}
          title="Completed"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
          </svg>
        </button>

        {/* Zoom controls */}
        <div
          style={{
            background: '#1a1a1a',
            border: '1px solid #2e2e2e',
            borderRadius: 8,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            marginBottom: 2,
            pointerEvents: 'auto',
          }}
        >
          <button
            style={{ ...btnStyle, border: 'none', borderRadius: 0 }}
            onMouseEnter={hover}
            onMouseLeave={unhover}
            onMouseDown={e => e.stopPropagation()}
            onClick={onZoomIn}
            title="Zoom in"
          >+</button>
          <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
            </svg>
          </div>
          <button
            style={{ ...btnStyle, border: 'none', borderRadius: 0 }}
            onMouseEnter={hover}
            onMouseLeave={unhover}
            onMouseDown={e => e.stopPropagation()}
            onClick={onZoomOut}
            title="Zoom out"
          >−</button>
        </div>

        {/* Legend items */}
        <span
          style={{
            display: 'inline-block',
            borderRadius: 6,
            padding: '2px 10px',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.05em',
            background: '#1a1a1a',
            border: '1px solid #1a5c2e',
            color: '#4ade80',
            whiteSpace: 'nowrap',
          }}
        >
          Core requirement
        </span>
        <span
          style={{
            display: 'inline-block',
            borderRadius: 6,
            padding: '2px 10px',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.05em',
            background: '#1a1a1a',
            border: '1px solid #b8860b',
            color: '#ffd700',
            whiteSpace: 'nowrap',
          }}
        >
          Honours requirement
        </span>

        {/* Fine print */}
        <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 5, pointerEvents: 'auto' }}>
          <span style={{ fontSize: 12, color: '#747474', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>© 2025 Ennis L.</span>
          <span style={{ fontSize: 12, color: '#747474' }}>·</span>
          <a
            href="https://github.com/ennisord/course-map"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: '#848484', textDecoration: 'none', letterSpacing: '0.02em', transition: 'color 0.15s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.color = '#969696'}
            onMouseLeave={e => e.currentTarget.style.color = '#747474'}
          >
            View on GitHub
          </a>
        </div>

      </div>
    </>
  )
}