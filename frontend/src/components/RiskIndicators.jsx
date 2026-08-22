import React, { useState } from 'react'

const severityConfig = {
  high: {
    icon: '⚠',
    cls: 'border-red-200 bg-red-50',
    labelCls: 'text-red-700 bg-red-100 border-red-200',
    barColor: 'bg-red-500',
    label: 'High',
  },
  medium: {
    icon: '◆',
    cls: 'border-amber-200 bg-amber-50',
    labelCls: 'text-amber-700 bg-amber-100 border-amber-200',
    barColor: 'bg-amber-500',
    label: 'Medium',
  },
  low: {
    icon: '●',
    cls: 'border-blue-200 bg-blue-50',
    labelCls: 'text-blue-700 bg-blue-100 border-blue-200',
    barColor: 'bg-blue-400',
    label: 'Low',
  },
}

function IndicatorCard({ flag }) {
  const cfg = severityConfig[flag.severity] || severityConfig['low']
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`rounded-xl border p-4 ${cfg.cls}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <span className="text-base mt-0.5">{cfg.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-vera-text leading-snug">
              {flag.label}
            </p>
            {flag.deviation_pct != null && flag.indicator_type !== 'quantity_anomaly' && flag.indicator_type !== 'amount_anomaly' && (
              <p className="text-xs text-vera-text-muted mt-1">
                Deviation: {flag.deviation_pct > 0 ? '+' : ''}{flag.deviation_pct?.toFixed(1)}%
              </p>
            )}
          </div>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${cfg.labelCls}`}>
          {cfg.label} {cfg.icon}
        </span>
      </div>

      {/* Potential Indicator disclaimer */}
      <p className="text-xs text-vera-text-muted mt-2.5 pt-2.5 border-t border-black/5">
        Potential Risk Indicator — does not confirm any wrongdoing
      </p>
    </div>
  )
}

export default function RiskIndicators({ flags }) {
  if (!flags || flags.length === 0) {
    return (
      <div className="vera-card p-6">
        <h3 className="vera-subsection-title mb-3">Risk Indicators</h3>
        <div className="flex flex-col items-center py-8 text-vera-text-muted">
          <div className="text-4xl mb-3">✓</div>
          <p className="text-sm font-medium">No anomalies detected</p>
          <p className="text-xs mt-1">No rule-based risk indicators were triggered</p>
        </div>
      </div>
    )
  }

  return (
    <div className="vera-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="vera-subsection-title">Risk Indicators</h3>
        <span className="text-xs text-vera-text-muted bg-vera-bg px-3 py-1 rounded-full border border-vera-border">
          {flags.length} indicator{flags.length !== 1 ? 's' : ''} found
        </span>
      </div>

      <div className="text-xs text-vera-primary bg-vera-primary-light border border-blue-200 rounded-xl px-3 py-2.5 mb-4">
        <strong>Review Recommended</strong> — The following patterns were detected by the AI system
        and require human verification.
      </div>

      <div className="flex flex-col gap-3">
        {flags.map((flag, i) => (
          <IndicatorCard key={i} flag={flag} />
        ))}
      </div>
    </div>
  )
}
