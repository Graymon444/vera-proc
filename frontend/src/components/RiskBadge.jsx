import React from 'react'

// Maps level → CSS variables defined in index.css
const CONFIG = {
  High: {
    dot:    'var(--terra)',
    bg:     'var(--terra-light)',
    border: 'var(--terra-border)',
    text:   'var(--terra-text)',
    label:  'HIGH',
  },
  Medium: {
    dot:    'var(--ochre)',
    bg:     'var(--ochre-light)',
    border: 'var(--ochre-border)',
    text:   'var(--ochre-text)',
    label:  'MEDIUM',
  },
  Low: {
    dot:    'var(--olive)',
    bg:     'var(--olive-light)',
    border: 'var(--olive-border)',
    text:   'var(--olive-text)',
    label:  'LOW',
  },
}

/** Square badge card — 64×80 (md) or 80×96 (lg) */
export default function RiskBadge({ level, score, size = 'md' }) {
  const c = CONFIG[level] || CONFIG.Low
  const lg = size === 'lg'

  return (
    <div
      style={{
        display: 'inline-flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        width: lg ? 80 : 64, height: lg ? 96 : 80,
        background: c.bg,
        border: `0.5px solid ${c.border}`,
        borderRadius: 'var(--r-lg)',
        gap: 4, flexShrink: 0,
      }}
      role="img"
      aria-label={`${level} risk${score != null ? `, score ${Math.round(score)}` : ''}`}
    >
      <svg width={lg ? 28 : 22} height={lg ? 28 : 22} viewBox="0 0 22 22" aria-hidden="true">
        <circle cx="11" cy="11" r="9" fill={c.dot} />
      </svg>
      {score != null && (
        <span style={{ fontSize: lg ? 20 : 18, fontWeight: 500, color: c.dot, lineHeight: 1 }}>
          {Math.round(score)}
        </span>
      )}
      <span style={{ fontSize: 11, fontWeight: 500, color: c.text, letterSpacing: '0.04em', lineHeight: 1, textTransform: 'uppercase' }}>
        {c.label}
      </span>
    </div>
  )
}

/** Inline pill for tables / banners */
export function RiskPill({ level }) {
  const c = CONFIG[level] || CONFIG.Low
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px',
      background: c.bg,
      border: `0.5px solid ${c.border}`,
      borderRadius: 20,
      fontSize: 11, fontWeight: 500,
      color: c.text,
      letterSpacing: '0.04em', whiteSpace: 'nowrap',
    }}>
      <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
        <circle cx="4" cy="4" r="4" fill={c.dot} />
      </svg>
      {c.label}
    </span>
  )
}
