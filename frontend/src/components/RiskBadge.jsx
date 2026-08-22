import React from 'react'

const CONFIG = {
  High:   { dot: '#D85A30', bg: '#FAECE7', border: '#E8B89F', text: '#712B13', label: 'HIGH' },
  Medium: { dot: '#BA7517', bg: '#FAEEDA', border: '#E0C27A', text: '#633806', label: 'MEDIUM' },
  Low:    { dot: '#639922', bg: '#EAF3DE', border: '#AECB78', text: '#27500A', label: 'LOW' },
}

/* Square badge: score number + level label */
export default function RiskBadge({ level, score, size = 'md' }) {
  const c = CONFIG[level] || CONFIG.Low
  const isLg = size === 'lg'

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: isLg ? 80 : 64,
        height: isLg ? 96 : 80,
        background: c.bg,
        border: `0.5px solid ${c.border}`,
        borderRadius: 12,
        gap: 4,
        flexShrink: 0,
      }}
      role="img"
      aria-label={`${level} risk${score != null ? `, score ${Math.round(score)}` : ''}`}
    >
      {/* Dot */}
      <svg width={isLg ? 28 : 22} height={isLg ? 28 : 22} viewBox="0 0 22 22" aria-hidden="true">
        <circle cx="11" cy="11" r="9" fill={c.dot} />
      </svg>
      {/* Score */}
      {score != null && (
        <span style={{ fontSize: isLg ? 20 : 18, fontWeight: 500, color: c.dot, lineHeight: 1 }}>
          {Math.round(score)}
        </span>
      )}
      {/* Label */}
      <span style={{ fontSize: 11, color: c.text, letterSpacing: '0.04em', lineHeight: 1 }}>
        {c.label}
      </span>
    </div>
  )
}

/* Inline pill version for tables */
export function RiskPill({ level }) {
  const c = CONFIG[level] || CONFIG.Low
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        background: c.bg,
        border: `0.5px solid ${c.border}`,
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        color: c.text,
        letterSpacing: '0.04em',
      }}
    >
      <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
        <circle cx="4" cy="4" r="4" fill={c.dot} />
      </svg>
      {c.label}
    </span>
  )
}
