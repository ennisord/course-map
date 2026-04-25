import { useEffect, useState } from 'react'
import { getColor, resolvePrereq } from '../utils/courseUtils'

/**
 * CourseDetailPanel
 *
 * Desktop: slides in from the right edge of the screen.
 * Mobile  (≤640px): slides up from the bottom.
 *
 * Props
 *   course   – the selected course object (or null)
 *   courses  – full course list (for resolving prereq names)
 *   onClose  – called when the user dismisses the panel
 */
export default function CourseDetailPanel({ course, courses, onClose }) {
  // `visible` drives the CSS transition; we keep the DOM element mounted
  // for one extra tick after `course` becomes null so the exit animation plays.
  const [visible, setVisible] = useState(false)
  const [displayed, setDisplayed] = useState(course)

  useEffect(() => {
    if (course) {
      setDisplayed(course)
      // tiny delay so the browser registers the initial hidden state first
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else {
      setVisible(false)
      const t = setTimeout(() => setDisplayed(null), 380)
      return () => clearTimeout(t)
    }
  }, [course])

  if (!displayed) return null

  const { border, text, muted } = getColor(displayed.tags)

  const prereqNames = (displayed.prereqs || []).map(p => {
    const key = resolvePrereq(p, courses)
    if (!key) return typeof p === 'string' ? p : String(p)
    const found = courses.find(c => `${c.dept}-${c.id}` === key)
    return found ? `${found.dept} ${found.id} – ${found.name}` : key
  })

  return (
    <>
      {/* ---------- backdrop (mobile only) ---------- */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 49,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.32s ease',
          pointerEvents: visible ? 'auto' : 'none',
        }}
        className="sm:hidden"
      />

      {/* ---------- panel ---------- */}
      <div
        style={{
          position: 'fixed',
          zIndex: 50,
          background: '#141414',
          borderLeft: `1px solid ${border}`,
          fontFamily: "'League Spartan', sans-serif",
          overflowY: 'auto',
          boxShadow: `-6px 0 32px rgba(0,0,0,0.6)`,

          // ── Desktop: right-side drawer ──────────────────
          // Applied via inline style; Tailwind can't do runtime values cleanly
          ...desktopStyles(visible, border),
        }}
        // on mobile we override with a bottom sheet via className
        className="course-panel"
      >
        {/* close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#555',
            lineHeight: 1,
            padding: 0,
            fontSize: 18,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = text)}
          onMouseLeave={e => (e.currentTarget.style.color = '#555')}
          aria-label="Close"
        >
          ✕
        </button>

        {/* ── course id + name ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', color: muted, textTransform: 'uppercase', marginBottom: 4 }}>
            {displayed.dept}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: text, lineHeight: 1.15 }}>
            {displayed.id} — {displayed.name}
          </div>
        </div>

        {/* ── tags ── */}
        {displayed.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
            {displayed.tags.map(tag => (
              <span
                key={tag}
                style={{
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: 4,
                  border: `1px solid ${border}`,
                  color: muted,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Divider color={border} />

        {/* ── description ── */}
        {displayed.desc ? (
          <Section label="Description">
            <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.7, margin: 0 }}>
              {displayed.desc}
            </p>
          </Section>
        ) : (
          <Section label="Description">
            <p style={{ fontSize: 13, color: '#444', fontStyle: 'italic', margin: 0 }}>
              No description available.
            </p>
          </Section>
        )}

        <Divider color={border} />

        {/* ── prerequisites ── */}
        <Section label="Prerequisites">
          {prereqNames.length === 0 ? (
            <p style={{ fontSize: 13, color: '#444', fontStyle: 'italic', margin: 0 }}>None</p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {prereqNames.map((name, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: border, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#aaa' }}>{name}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* ── units / credits if present ── */}
        {displayed.units != null && (
          <>
            <Divider color={border} />
            <Section label="Units">
              <span style={{ fontSize: 20, fontWeight: 700, color: text }}>{displayed.units}</span>
              <span style={{ fontSize: 12, color: muted, marginLeft: 6 }}>credit hours</span>
            </Section>
          </>
        )}
      </div>

      {/* ── mobile bottom-sheet overrides via injected <style> ── */}
      <style>{`
        @media (max-width: 640px) {
          .course-panel {
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            max-height: 70vh !important;
            border-left: none !important;
            border-top: 1px solid ${border} !important;
            border-radius: 16px 16px 0 0 !important;
            box-shadow: 0 -6px 32px rgba(0,0,0,0.6) !important;
            transform: translateY(${visible ? '0' : '100%'}) !important;
            transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1) !important;
            padding: 24px 20px 32px !important;
          }
        }
      `}</style>
    </>
  )
}

// ── helpers ──────────────────────────────────────────────

function desktopStyles(visible, border) {
  return {
    top: 0,
    right: 0,
    width: 320,
    height: '100vh',
    padding: '24px 22px 32px',
    transform: `translateX(${visible ? '0' : '100%'})`,
    transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
  }
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 10,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#444',
        marginBottom: 10,
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function Divider({ color }) {
  return (
    <div style={{
      height: 1,
      background: `linear-gradient(to right, ${color}44, transparent)`,
      margin: '0 0 20px',
    }} />
  )
}