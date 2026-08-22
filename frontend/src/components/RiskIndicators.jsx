import React, { useState } from 'react'

const SEV = {
  high:   { color: '#D85A30', bg: '#FAECE7', border: '#D85A30', label: 'High' },
  medium: { color: '#BA7517', bg: '#FAEEDA', border: '#BA7517', label: 'Medium' },
  low:    { color: '#639922', bg: '#EAF3DE', border: '#639922', label: 'Low' },
}

function formatRp(n) {
  if (n == null) return '—'
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}

function IndicatorItem({ flag }) {
  const [open, setOpen] = useState(false)
  const s = SEV[flag.severity] || SEV.low

  return (
    <div
      style={{
        borderLeft: `4px solid ${s.color}`,
        padding: '14px 16px',
        cursor: 'pointer',
        borderRadius: '0 8px 8px 0',
        background: open ? s.bg : 'transparent',
        transition: 'background 200ms',
      }}
      onClick={() => setOpen(o => !o)}
      role="button"
      aria-expanded={open}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && setOpen(o => !o)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true">
          <circle cx="8" cy="8" r="7" fill={s.color} />
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: '#2C2C2A', lineHeight: 1.5 }}>{flag.label}</div>

          {/* Expanded detail */}
          {open && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {flag.value != null && (
                <div style={{ fontSize: 12, color: '#5F5E5A' }}>
                  • Submitted value: <span style={{ color: '#2C2C2A' }}>{formatRp(flag.value)}</span>
                </div>
              )}
              {flag.threshold != null && (
                <div style={{ fontSize: 12, color: '#5F5E5A' }}>
                  • Reference / threshold: <span style={{ color: '#2C2C2A' }}>{formatRp(flag.threshold)}</span>
                </div>
              )}
              {flag.deviation_pct != null && (
                <div style={{ fontSize: 12, color: '#5F5E5A' }}>
                  • Deviation: <span style={{ color: s.color, fontWeight: 500 }}>
                    {flag.deviation_pct > 0 ? '+' : ''}{Number(flag.deviation_pct).toFixed(1)}
                    {flag.indicator_type === 'budget_utilization' ? '%' : '%'}
                  </span>
                </div>
              )}
              <div style={{ fontSize: 11, color: '#9B9A96', marginTop: 4 }}>
                Potential risk indicator — does not confirm wrongdoing
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            fontSize: 11,
            color: s.color,
            background: s.bg,
            border: `0.5px solid ${s.color}60`,
            borderRadius: 4,
            padding: '2px 8px',
          }}>{s.label}</span>
          <span style={{ fontSize: 14, color: '#9B9A96', transform: open ? 'rotate(180deg)' : 'none', transition: '200ms' }}>
            ▾
          </span>
        </div>
      </div>
    </div>
  )
}

export default function RiskIndicators({ flags }) {
  if (!flags || flags.length === 0) {
    return (
      <div className="v-card" style={{ padding: '24px 16px' }}>
        <h3 style={{ margin: '0 0 12px' }}>Risk Indicators</h3>
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#9B9A96' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 14 }}>No anomalies detected</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>No rule-based indicators triggered</div>
        </div>
      </div>
    )
  }

  return (
    <div className="v-card" style={{ padding: '16px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 12px' }}>
        <h3 style={{ margin: 0 }}>Why Flagged</h3>
        <span style={{
          fontSize: 12, color: '#5F5E5A',
          background: '#F1EFE8', border: '0.5px solid #D3D1C7',
          borderRadius: 4, padding: '2px 8px',
        }}>
          {flags.length} indicator{flags.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Review notice */}
      <div style={{
        margin: '0 16px 12px',
        padding: '10px 12px',
        background: '#E1F5EE',
        border: '0.5px solid #A8DCC7',
        borderRadius: 8,
        fontSize: 12,
        color: '#0F6E56',
      }}>
        <strong>Review Recommended</strong> — Tap each indicator for details.
        These are potential patterns, not confirmed findings.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {flags.map((flag, i) => <IndicatorItem key={i} flag={flag} />)}
      </div>
    </div>
  )
}
