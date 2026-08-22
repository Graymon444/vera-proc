import React from 'react'

const EVENT_CONFIG = {
  submitted: { icon: '📥', label: 'Submitted', color: 'text-blue-600', bg: 'bg-blue-100' },
  analyzed: { icon: '🤖', label: 'AI Analysis', color: 'text-purple-600', bg: 'bg-purple-100' },
  reviewed: { icon: '👤', label: 'Reviewed', color: 'text-green-600', bg: 'bg-green-100' },
  default: { icon: '◷', label: 'Event', color: 'text-gray-500', bg: 'bg-gray-100' },
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AuditTimeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-sm text-vera-text-muted py-4 text-center">
        No audit events yet.
      </div>
    )
  }

  return (
    <ol className="relative flex flex-col gap-0" aria-label="Audit timeline">
      {events.map((event, i) => {
        const cfg = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.default
        const isLast = i === events.length - 1
        return (
          <li key={event.id} className="flex gap-4 relative">
            {/* Connector line */}
            {!isLast && (
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-vera-border" />
            )}

            {/* Icon */}
            <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center text-sm shrink-0 z-10`}>
              {cfg.icon}
            </div>

            {/* Content */}
            <div className="pb-5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                {event.actor && (
                  <span className="text-xs text-vera-text-muted bg-vera-bg px-2 py-0.5 rounded-full border border-vera-border">
                    by {event.actor}
                  </span>
                )}
              </div>
              <p className="text-xs text-vera-text-muted mt-0.5">{formatDate(event.timestamp)}</p>

              {event.event_data && Object.keys(event.event_data).length > 0 && (
                <div className="mt-2 bg-vera-bg rounded-xl px-3 py-2 text-xs text-vera-text-secondary border border-vera-border">
                  {Object.entries(event.event_data)
                    .filter(([k]) => k !== 'source')
                    .map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-vera-text-muted capitalize">{k.replace(/_/g, ' ')}:</span>
                        <span className="font-medium">{String(v)}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
