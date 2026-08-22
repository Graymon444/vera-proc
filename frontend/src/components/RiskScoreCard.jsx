import React from 'react'
import RiskBadge from './RiskBadge'

function ScoreArc({ score }) {
  const pct = Math.min(score, 100)
  const radius = 52
  const circ = 2 * Math.PI * radius
  const offset = circ - (pct / 100) * circ

  const color =
    pct >= 70 ? '#DC2626' : pct >= 40 ? '#D97706' : '#16A34A'

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="130" height="80" viewBox="0 0 130 80" aria-hidden="true">
        {/* Background arc */}
        <path
          d="M 15 75 A 52 52 0 0 1 115 75"
          fill="none"
          stroke="#E8ECF4"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d="M 15 75 A 52 52 0 0 1 115 75"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 163.4} 163.4`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="text-center -mt-6">
        <div className="text-4xl font-bold text-vera-text leading-none">
          {Math.round(pct)}
        </div>
        <div className="text-xs text-vera-text-muted mt-0.5">out of 100</div>
      </div>
    </div>
  )
}

export default function RiskScoreCard({ analysis }) {
  if (!analysis) return null
  return (
    <div className="vera-card p-6">
      {/* AI Assessment disclaimer */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold text-vera-primary bg-vera-primary-light px-2.5 py-1 rounded-full">
          AI Assessment
        </span>
        <span className="text-xs text-vera-text-muted">Not a final determination</span>
      </div>

      <ScoreArc score={analysis.risk_score} />

      <div className="text-center mt-4">
        <RiskBadge level={analysis.risk_level} size="lg" />
        <p className="text-sm text-vera-text-secondary mt-2">
          {analysis.risk_level === 'High'
            ? 'Human Verification Required'
            : analysis.risk_level === 'Medium'
            ? 'Additional Verification Recommended'
            : 'Standard Review Recommended'}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-vera-border grid grid-cols-2 gap-3 text-sm">
        <div className="bg-vera-bg rounded-xl p-3 text-center">
          <div className="text-xs text-vera-text-muted mb-0.5">Rule-Based Score</div>
          <div className="font-bold text-vera-text">{analysis.rule_score ?? '—'}</div>
        </div>
        <div className="bg-vera-bg rounded-xl p-3 text-center">
          <div className="text-xs text-vera-text-muted mb-0.5">Anomaly Flags</div>
          <div className="font-bold text-vera-text">
            {(analysis.rule_flags || []).length}
          </div>
        </div>
      </div>

      <p className="text-xs text-vera-text-muted text-center mt-4 leading-relaxed">
        ⚠ Risk thresholds are prototype assumptions. Not official government standards.
      </p>
    </div>
  )
}
