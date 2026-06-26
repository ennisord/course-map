import { useState } from 'react'

export default function IntroPopup({ onClose }) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)', // Safari
          background: 'rgba(0,0,0,0.4)',
          cursor: 'default'
        }}
        onMouseDown={() => onClose()}
        onTouchStart={() => onClose()}
      />

      {/* Modal */}
      <div
        onMouseDown={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          cursor: 'default',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(480px, calc(100vw - 32px))',
          zIndex: 1000,
          fontFamily: "'League Spartan', sans-serif",
          background: '#0d0d0d',
          border: '1px solid #1e1e1e',
          borderRadius: 20,
          boxShadow: '0 32px 96px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '22px 22px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ margin: 'auto', color: '#e0e0e0', fontSize: 18, fontWeight: 700, letterSpacing: '0.02em' }}>
            UCalgary Economics Course Map
          </span>
          
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px' }}>
          <p style={{ margin: 0, color: '#505050', fontSize: 13, lineHeight: 1.7, letterSpacing: '0.01em' }}>
            Explore ECON prerequisites, track completed courses, and plan your path through the curriculum.
          </p>
          <p style={{ margin: '14px 0 0', color: '#2e2e2e', fontSize: 11, letterSpacing: '0.04em' }}>
            Drag to pan · Scroll to zoom · Click a node to inspect
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 22px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={e => setDontShowAgain(e.target.checked)}
              style={{ width: 14, height: 14, cursor: 'pointer', accentColor: '#666' }}
            />
            <span style={{ color: '#333', fontSize: 12, fontWeight: 500, letterSpacing: '0.02em', userSelect: 'none' }}>
              Don't show this again
            </span>
          </label>
          <button
            onClick={() => onClose(dontShowAgain)}
            style={{
              background: '#dedede',
              border: 'none',
              borderRadius: 10,
              padding: '13px 16px',
              color: '#0a0a0a',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'League Spartan', sans-serif",
              letterSpacing: '0.04em',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={e => e.currentTarget.style.background = '#dedede'}
          >
            Get Started
          </button>
        </div>
      </div>
    </>
  )
}