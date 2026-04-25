import { useState, useEffect } from 'react'

const WORD = 'Course Map'

export default function LoadingScreen() {
  const [lit, setLit] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const delay = setTimeout(() => setStarted(true), 600)
    return () => clearTimeout(delay)
  }, [])

  useEffect(() => {
    if (!started) return
    if (lit >= WORD.length) return
    const t = setTimeout(() => setLit(l => l + 1), 100)
    return () => clearTimeout(t)
  }, [lit, started])

  return (
    <div
      className="w-screen h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: '#101010', fontFamily: "'League Spartan', sans-serif", position: 'relative' }}
    >
      <img
        src="/uofc-crest.png"
        alt="University of Calgary crest"
        style={{ opacity: 0.4, width: 52, height: 52, objectFit: 'contain' }}
      />

      <p className="text-sm font-medium tracking-[0.3em] uppercase" style={{ color: '#646464' }}>
        University of Calgary
      </p>

      <div className="flex">
        {WORD.split('').map((char, i) => (
          <span
            key={i}
            className="text-6xl font-bold tracking-tight transition-colors duration-300"
            style={{
              color: char === ' ' ? 'transparent' : i < lit ? '#4ade80' : '#2a2a2a',
              display: 'inline-block',
              width: char === ' ' ? '1rem' : 'auto',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>

      <p className="text-sm font-medium tracking-[0.3em] uppercase" style={{ color: '#646464' }}>
        Department of Economics
      </p>

      <p className="absolute bottom-4 text-xs text-[#484848] tracking-[0.05em]">
        This tool is not affiliated with or endorsed by the University of Calgary or its Department of Economics.
      </p>
    </div>
  )
}