import { useState } from 'react'

const features = [
  {
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#727272" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 11V8a2 2 0 0 0-4 0v3"/>
        <path d="M14 11V6a2 2 0 0 0-4 0v5"/>
        <path d="M10 11V8a2 2 0 0 0-4 0v6c0 3.31 2.69 6 6 6h0a6 6 0 0 0 6-6v-3a2 2 0 0 0-4 0"/>
      </svg>
    ),
    text: 'Drag to pan, scroll to zoom. Explore elective clusters by clicking the category buttons',
  },
  {
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#727272" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11V4a2 2 0 1 1 4 0v7"/>
        <path d="M13 9a2 2 0 1 1 4 0v3"/>
        <path d="M17 10a2 2 0 1 1 4 0v4a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-1l-1-4a2 2 0 1 1 3.9-.9L9 11"/>
      </svg>
    ),
    text: 'Click any course to view its description, prerequisites, and what it unlocks.',
  },
  {
    icon: (
      <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#727272" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
      </svg>
    ),
    text: "Mark courses as completed to see which ones you're now eligible to take.",
  },
]

export default function IntroPopup({ onClose }) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[999] cursor-default backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onMouseDown={() => onClose()}
        onTouchStart={() => onClose()}
      />

      {/* Modal */}
      <div
        className="fixed z-[1000] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[20px] cursor-default"
        style={{
          top: '50%', left: '50%',
          width: 'min(480px, calc(100vw - 32px))',
          fontFamily: "'League Spartan', sans-serif",
          background: '#0d0d0d',
          border: '1px solid #1e1e1e',
          boxShadow: '0 32px 96px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03)',
        }}
        onMouseDown={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center px-[22px] py-[22px]">
          <span className="text-[#e0e0e0] text-xl font-bold tracking-wide">
            UCalgary Economics Course Map
          </span>
        </div>

        {/* Body */}
        <div className="px-[22px] py-5 flex flex-col gap-4">
          {features.map(({ icon, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-[2px] shrink-0 opacity-70">{icon}</div>
              <p className="m-2 text-[#727272] text-sm font-light leading-[1.65] tracking-[0.01em] text-left">
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#141414' }} />

        {/* Footer */}
        <div className="flex flex-col gap-[10px] px-[22px] pt-4 pb-5">

          {/* Custom checkbox */}
          <label className="flex items-center gap-[10px] cursor-pointer group">
            <div className="relative w-[15px] h-[15px] shrink-0">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={e => setDontShowAgain(e.target.checked)}
                className="peer absolute inset-0 opacity-0 w-full h-full cursor-pointer m-0"
              />
              <div className="w-[15px] h-[15px] rounded-[4px] border border-[#646464] peer-checked:border-[#727272] bg-transparent peer-checked:bg-[#1c1c1c] transition-colors duration-100 flex items-center justify-center">
                {dontShowAgain && (
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#646464" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2 6 5 9 10 3"/>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-[#646464] group-hover:text-[#727272] text-sm font-medium tracking-[0.02em] select-none transition-colors duration-100">
              Don't show this again
            </span>
          </label>

          <button
            onClick={() => onClose(dontShowAgain)}
            className="w-full rounded-[10px] py-[13px] px-4 text-[#0a0a0a] text-sm font-bold tracking-[0.04em] transition-colors duration-[120ms] hover:bg-[#f5f5f5] bg-[#dedede] border-none cursor-pointer"
            style={{ fontFamily: "'League Spartan', sans-serif" }}
          >
            Get Started
          </button>
        </div>
      </div>
    </>
  )
}