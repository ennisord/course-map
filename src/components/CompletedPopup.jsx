import { getColor, getCourseKey } from '../utils/courseUtils'

export default function CompletedPopup({ courses, completedIds, onRemove, onSelectCourse, onClose }) {
  const completedCourses = courses.filter(c => completedIds.has(getCourseKey(c)))

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 999 }}
        onMouseDown={e => { e.stopPropagation(); onClose() }}
        onTouchStart={e => { e.stopPropagation(); onClose() }}
      />

      {/* Panel */}
      <div
        onMouseDown={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
        onWheel={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(480px, calc(100vw - 48px))',
          maxHeight: 'min(520px, calc(100vh - 80px))',
          zIndex: 1000,
          fontFamily: "'League Spartan', sans-serif",
          background: '#111',
          border: '1px solid #2a2a2a',
          borderRadius: 16,
          boxShadow: '0 24px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 18px',
          borderBottom: '1px solid #1e1e1e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#60a5fa" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            <span style={{ color: '#aaa', fontSize: 15, fontWeight: 600, letterSpacing: '0.03em' }}>
              Completed courses
            </span>
            {completedCourses.length > 0 && (
              <span style={{
                background: '#0f2033',
                border: '1px solid #1a3a5c',
                borderRadius: 999,
                padding: '1px 8px',
                fontSize: 11,
                fontWeight: 700,
                color: '#60a5fa',
                letterSpacing: '0.03em',
              }}>
                {completedCourses.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
            onMouseLeave={e => e.currentTarget.style.color = '#555'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <style>{`
          .completed-list::-webkit-scrollbar { width: 5px; }
          .completed-list::-webkit-scrollbar-track { background: transparent; }
          .completed-list::-webkit-scrollbar-thumb { background: #2e2e2e; border-radius: 999px; }
          .completed-list::-webkit-scrollbar-thumb:hover { background: #444; }
        `}</style>

        {/* List */}
        <div
          className="completed-list"
          style={{ overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          {completedCourses.length === 0 ? (
            <div style={{ color: '#333', fontSize: 13, textAlign: 'center', margin: '28px 0', letterSpacing: '0.03em' }}>
              No completed courses yet — click the thumbs up on any course node
            </div>
          ) : completedCourses.map(course => {
            const key = getCourseKey(course)
            const ids = Array.isArray(course.id) ? course.id : [course.id]
            const idLabel = `${course.dept} ${ids.join(' / ')}`

            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#0f1a24',
                  border: '1px solid #1a3a5c',
                  borderRadius: 10,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onClick={() => { onSelectCourse(key); onClose() }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#132030'
                  e.currentTarget.style.borderColor = '#2a5a8c'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#0f1a24'
                  e.currentTarget.style.borderColor = '#1a3a5c'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#60a5fa" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                  <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                </svg>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.04em' }}>
                    {idLabel}
                  </div>
                  <div style={{ fontSize: 11, color: '#2a5a8c', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {course.name}
                  </div>
                </div>
                <button
                  title="Remove"
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); onRemove(key) }}
                  style={{
                    background: 'none',
                    border: '1px solid transparent',
                    borderRadius: 6,
                    cursor: 'pointer',
                    color: '#2a4a6c',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.15s, border-color 0.15s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#f87171'
                    e.currentTarget.style.borderColor = '#7f1d1d'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#2a4a6c'
                    e.currentTarget.style.borderColor = 'transparent'
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}