import { useState, useEffect } from 'react'

const WORD = 'Course Map'

export default function LoadingScreen() {
  const [lit, setLit] = useState(0)

  useEffect(() => {
    if (lit >= WORD.length) return
    const t = setTimeout(() => setLit(l => l + 1), 120)
    return () => clearTimeout(t)
  }, [lit])

  return (
    <div
      className="w-screen h-screen flex items-center justify-center"
      style={{ background: '#101010', fontFamily: "'League Spartan', sans-serif" }}
    >
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
    </div>
  )
}