import React from 'react'

const LEVEL_CONFIG = {
  High:   { color: '#D45A2A', bg: '#FAEDE8', border: '#E6B09A', label: 'HIGH RISK',   subtitle: 'Requires Verification' },
  Medium: { color: '#B87215', bg: '#FAF0DC', border: '#DDBF78', label: 'MEDIUM RISK', subtitle: 'Review Recommended' },
  Low:    { color: '#5E9420', bg: '#EBF4DF', border: '#ABCA76', label: 'LOW RISK',    subtitle: 'Standard Review' },
}

export default function RiskScoreCard({ analysis }) {
  if (!analysis) return null
  const c     = LEVEL_CONFIG[analysis.risk_level] || LEVEL_CONFIG.Low
  const score = Math.round(analysis.risk_score)

  return (
    <div
      className="v-card no-hover"
      style={{
        background: c.bg,
        border: `0.5px solid ${c.border}`,
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px 0',
      }}>
        <span style={{
          fontSize: 11, fontWeight: 500,
          color: '#1A9B6E',
          background: '#E2F4EC',
          border: '0.5px solid #A5D9C0',
          borderRadius: 4,
          padding: '2px 8px',
          letterSpacing: '0.04em',
        }}>
          AI ASSESSMENT
        </span>
        <span style={{ fontSize: 11, color: '#948E87' }}>Not a final determination</span>
      </div>

      {/* Centered score */}
      <div style={{ textAlign: 'center', padding: '20px 16px 8px' }}>
        <div style={{
          fontSize: 72,
          fontWeight: 500,
          color: c.color,
          lineHeight: 1,
        }}>
          {score}
        </div>
        <div style={{ fontSize: 12, color: '#948E87', marginTop: 4 }}>out of 100</div>
        <div style={{
          fontSize: 18,
          fontWeight: 500,
          color: c.color,
          marginTop: 8,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          {c.label}
        </div>
        <div style={{ fontSize: 13, color: '#5C5750', marginTop: 6 }}>
          {c.subtitle}
        </div>
      </div>

      {/* Sub-scores grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        padding: '12px 16px 16px',
        borderTop: `0.5px solid ${c.border}`,
        marginTop: 4,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.6)',
          borderRadius: 8,
          padding: '10px 12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: '#5C5750', marginBottom: 2 }}>Rule-Based</div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#2A2722' }}>
            {analysis.rule_score ?? '—'}
          </div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.55)',
          borderRadius: 8,
          padding: '10px 12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: '#5C5750', marginBottom: 2 }}>Indicators</div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#2A2722' }}>
            {(analysis.rule_flags || []).length}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p style={{
        fontSize: 11, color: '#948E87',
        textAlign: 'center', padding: '0 16px 14px',
        lineHeight: 1.5, margin: 0,
      }}>
        ⚠ Thresholds are prototype assumptions, not official standards
      </p>
    </div>
  )
}
