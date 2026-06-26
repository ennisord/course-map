import { useState } from 'react'

const features = [
  {
    icon: (
      <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#727272" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Four-arrow move cursor */}
        <polyline points="5 9 2 12 5 15"/>
        <polyline points="9 5 12 2 15 5"/>
        <polyline points="15 19 12 22 9 19"/>
        <polyline points="19 9 22 12 19 15"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <line x1="12" y1="2" x2="12" y2="22"/>
      </svg>
    ),
    text: 'Drag to pan, scroll to zoom. Explore elective clusters by clicking the category buttons.',
  },
  {
    icon: (
      <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#727272" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Eye */}
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
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
    text: "Mark courses as completed to see which ones you're eligible to take.",
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
        <div className="flex flex-col items-center justify-center px-[22px] pt-[26px] pb-[22px] gap-[10px]">
          <img
            src="/uofc-crest.png"
            alt="University of Calgary crest"
            style={{ opacity: 0.4, width: 36, height: 36, objectFit: 'contain' }}
          />
          <div className="flex flex-col items-center gap-[2px]">
            <span className="text-[#484848] text-xs sm:text-sm font-medium tracking-widest uppercase">
              Welcome to the
            </span>
            <span className="text-[#e0e0e0] text-md sm:text-xl font-bold tracking-wide">
              UCalgary Economics Course Map
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#141414' }} />

        {/* Body */}
        <div className="px-[22px] py-5 flex flex-col gap-4">
          {features.map(({ icon, text }, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-[30px] shrink-0 flex items-center justify-center opacity-70">{icon}</div>
              <p className="m-0 text-[#727272] text-xs sm:text-sm font-light leading-[1.65] tracking-[0.01em] text-left">
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#141414' }} />

        {/* Footer */}
        <div className="flex flex-col gap-[10px] px-[22px] pt-4 pb-5">

          {/* Beta notice */}
          <p className="m-0 text-[#484848] text-xs leading-[1.6] tracking-[0.01em]">
            This tool is still in beta. Data may be incomplete, and funcionality may not be perfect. Found something off?{' '}
            <a
              href="mailto:ennis.leeming@ucalgary.ca"
              className="text-[#484848] hover:text-[#666] underline underline-offset-2 transition-colors duration-100"
            >
              ennis.leeming@ucalgary.ca
            </a>
          </p>

          {/* Custom checkbox */}
          <label className="mt-3 mb-2 flex items-center gap-[10px] cursor-pointer group">
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
            <span className="text-[#646464] group-hover:text-[#727272] text-xs sm:text-sm font-medium tracking-[0.02em] select-none transition-colors duration-100">
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