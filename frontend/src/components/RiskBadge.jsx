import React from 'react'

const CONFIG = {
  High:   { dot: '#D45A2A', bg: '#FAEDE8', border: '#E6B09A', text: '#6E2910', label: 'HIGH' },
  Medium: { dot: '#B87215', bg: '#FAF0DC', border: '#DDBF78', text: '#613604', label: 'MEDIUM' },
  Low:    { dot: '#5E9420', bg: '#EBF4DF', border: '#ABCA76', text: '#264E08', label: 'LOW' },
}

/**
 * Square badge card — 64×80px (md) or 80×96px (lg)
 * Shows SVG circle dot, score number, level label
 */
export default function RiskBadge({ level, score, size = 'md' }) {
  const c    = CONFIG[level] || CONFIG.Low
  const isLg = size === 'lg'

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width:  isLg ? 80 : 64,
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
      {/* Circle dot */}
      <svg
        width={isLg ? 28 : 22}
        height={isLg ? 28 : 22}
        viewBox="0 0 22 22"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="9" fill={c.dot} />
      </svg>

      {/* Score */}
      {score != null && (
        <span style={{
          fontSize: isLg ? 20 : 18,
          fontWeight: 500,
          color: c.dot,
          lineHeight: 1,
        }}>
          {Math.round(score)}
        </span>
      )}

      {/* Level label */}
      <span style={{
        fontSize: 11,
        fontWeight: 500,
        color: c.text,
        letterSpacing: '0.04em',
        lineHeight: 1,
        textTransform: 'uppercase',
      }}>
        {c.label}
      </span>
    </div>
  )
}

/**
 * Inline pill — 8px SVG dot + level text
 * 11px/500, pill shape, risk-colored bg + border
 */
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
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 500,
        color: c.text,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}
    >
      <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
        <circle cx="4" cy="4" r="4" fill={c.dot} />
      </svg>
      {c.label}
    </span>
  )
}
