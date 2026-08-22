import React, { useState } from 'react'

const SEV = {
  high:   { color: '#D45A2A', bg: '#FAEDE8', border: '#D45A2A', label: 'High' },
  medium: { color: '#B87215', bg: '#FAF0DC', border: '#B87215', label: 'Medium' },
  low:    { color: '#5E9420', bg: '#EBF4DF', border: '#5E9420', label: 'Low' },
}

function formatRp(n) {
  if (n == null) return '—'
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}

function IndicatorItem({ flag }) {
  const [open, setOpen] = useState(false)
  const s = SEV[flag.severity] || SEV.low

  function toggle() { setOpen(o => !o) }

  return (
    <div
      style={{
        borderLeft: `4px solid ${s.color}`,
        padding: '14px 16px',
        cursor: 'pointer',
        borderRadius: '0 8px 8px 0',
        background: open ? s.bg : 'transparent',
        transition: 'background 200ms cubic-bezier(0.2,0,0.8,1)',
      }}
      onClick={toggle}
      role="button"
      aria-expanded={open}
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggle()}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {/* Severity dot */}
        <svg
          width="16" height="16" viewBox="0 0 16 16"
          style={{ flexShrink: 0, marginTop: 2 }}
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="7" fill={s.color} />
        </svg>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: '#2A2722', lineHeight: 1.5 }}>
            {flag.label}
          </div>

          {/* Expanded details — smooth reveal via max-height */}
          <div style={{
            overflow: 'hidden',
            maxHeight: open ? 200 : 0,
            opacity: open ? 1 : 0,
            transition: 'max-height 200ms cubic-bezier(0.2,0,0.8,1), opacity 200ms',
          }}>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {flag.value != null && (
                <div style={{ fontSize: 12, color: '#5C5750' }}>
                  <span>Your bid: </span>
                  <span style={{ color: '#2A2722', fontWeight: 500 }}>{formatRp(flag.value)}</span>
                </div>
              )}
              {flag.threshold != null && (
                <div style={{ fontSize: 12, color: '#5C5750' }}>
                  <span>Reference: </span>
                  <span style={{ color: '#2A2722', fontWeight: 500 }}>{formatRp(flag.threshold)}</span>
                </div>
              )}
              {flag.deviation_pct != null && (
                <div style={{ fontSize: 12, color: '#5C5750' }}>
                  <span>Deviation: </span>
                  <span style={{ color: s.color, fontWeight: 500 }}>
                    {flag.deviation_pct > 0 ? '+' : ''}
                    {Number(flag.deviation_pct).toFixed(1)}%
                  </span>
                </div>
              )}
              <div style={{ fontSize: 11, color: '#948E87', marginTop: 4 }}>
                Potential risk indicator — does not confirm wrongdoing
              </div>
            </div>
          </div>
        </div>

        {/* Right side: severity pill + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            fontSize: 11,
            color: s.color,
            background: s.bg,
            border: `0.5px solid ${s.color}60`,
            borderRadius: 4,
            padding: '2px 8px',
            fontWeight: 500,
          }}>
            {s.label}
          </span>
          <span style={{
            fontSize: 14,
            color: '#9B9A96',
            display: 'inline-block',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 200ms cubic-bezier(0.2,0,0.8,1)',
            lineHeight: 1,
          }}>
            ▾
          </span>
        </div>
      </div>
    </div>
  )
}

export default function RiskIndicators({ flags }) {
  /* Empty state */
  if (!flags || flags.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0', color: '#9B9A96' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
        <div style={{ fontSize: 14 }}>No anomalies detected</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>No rule-based indicators triggered</div>
      </div>
    )
  }

  return (
    <div>
      {/* Review notice */}
      <div style={{
        marginBottom: 12,
        padding: '10px 12px',
        background: '#E1F5EE',
        border: '0.5px solid #A8DCC7',
        borderRadius: 8,
        fontSize: 12,
        color: '#0F6E56',
        lineHeight: 1.5,
      }}>
        <strong>Review Recommended</strong> — Tap each indicator for details.
        These are potential patterns, not confirmed findings.
      </div>

      {/* Indicator list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {flags.map((flag, i) => (
          <IndicatorItem key={i} flag={flag} />
        ))}
      </div>
    </div>
  )
}
