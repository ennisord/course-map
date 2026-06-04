import { useState } from 'react'

export default function IntroPopup({ onClose }) {
  const [dontShowAgain, setDontShowAgain] = useState(false)
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
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
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
          padding: '24px 24px 16px',
          borderBottom: '1px solid #1e1e1e',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
              </svg>
            </div>
            <div>
              <div style={{ color: '#ccc', fontSize: 18, fontWeight: 700, letterSpacing: '0.04em' }}>
                Course Map
              </div>
              <div style={{ color: '#555', fontSize: 12, marginTop: 2, fontWeight: 500, letterSpacing: '0.02em' }}>
                Organize your learning
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#555',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
            onMouseLeave={e => e.currentTarget.style.color = '#555'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Main description */}
            <div>
              <div style={{ color: '#ccc', fontSize: 15, lineHeight: 1.6, letterSpacing: '0.01em', marginBottom: 12 }}>
                This interactive visualizer helps you explore economics courses, understand prerequisites, and plan your academic path.
              </div>
            </div>

            {/* Features list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <div>
                  <div style={{ color: '#aaa', fontSize: 13, fontWeight: 600, letterSpacing: '0.02em' }}>
                    Track Progress
                  </div>
                  <div style={{ color: '#555', fontSize: 12, marginTop: 2, lineHeight: 1.5 }}>
                    Mark courses as completed or wishlisted
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <div>
                  <div style={{ color: '#aaa', fontSize: 13, fontWeight: 600, letterSpacing: '0.02em' }}>
                    Explore Dependencies
                  </div>
                  <div style={{ color: '#555', fontSize: 12, marginTop: 2, lineHeight: 1.5 }}>
                    Click courses to see prerequisites and next steps
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <div>
                  <div style={{ color: '#aaa', fontSize: 13, fontWeight: 600, letterSpacing: '0.02em' }}>
                    Search & Navigate
                  </div>
                  <div style={{ color: '#555', fontSize: 12, marginTop: 2, lineHeight: 1.5 }}>
                    Find courses by name or number instantly
                  </div>
                </div>
              </div>
            </div>

            {/* Tips section */}
            <div style={{
              background: '#0f1a24',
              border: '1px solid #1a3a5c',
              borderRadius: 10,
              padding: '12px 13px',
              marginTop: 8,
            }}>
              <div style={{ color: '#60a5fa', fontSize: 12, fontWeight: 600, letterSpacing: '0.02em', marginBottom: 6 }}>
                💡 Quick Tips
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 16px', color: '#555', fontSize: 12, lineHeight: 1.8 }}>
                <li>Drag to pan, scroll to zoom</li>
                <li>Use the search button in the corner</li>
                <li>Colors group related courses</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #1e1e1e',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          flexShrink: 0,
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              style={{
                width: 16,
                height: 16,
                cursor: 'pointer',
              }}
            />
            <span style={{ color: '#555', fontSize: 12, fontWeight: 500, letterSpacing: '0.02em' }}>
              Don't show this again
            </span>
          </label>
          <button
            onClick={() => onClose(dontShowAgain)}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
              border: 'none',
              borderRadius: 8,
              padding: '11px 16px',
              color: 'white',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'League Spartan', sans-serif",
              letterSpacing: '0.03em',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Get Started
          </button>
        </div>
      </div>
    </>
  )
}
