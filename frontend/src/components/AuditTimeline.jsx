import React from 'react'

const EV = {
  submitted: { icon: '📥', label: 'Submitted',   color: 'var(--forest)',      bg: 'var(--forest-light)', border: 'var(--forest-mid)' },
  analyzed:  { icon: '🤖', label: 'AI Analysis', color: '#5A58C8',            bg: '#EEEEF8',             border: '#B8B8DC' },
  reviewed:  { icon: '👤', label: 'Reviewed',    color: 'var(--forest)',      bg: 'var(--forest-light)', border: 'var(--forest-mid)' },
  default:   { icon: '◷',  label: 'Event',       color: 'var(--ink-4)',       bg: 'var(--bg-sunken)',    border: 'var(--border)' },
}

function fmt(iso) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}

export default function AuditTimeline({ events }) {
  if (!events?.length) {
    return <p style={{ fontSize: 14, color: 'var(--ink-4)', textAlign: 'center', padding: '16px 0', margin: 0 }}>No audit events yet.</p>
  }

  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label="Audit trail">
      {events.map((ev, i) => {
        const cfg = EV[ev.event_type] || EV.default
        const isLast = i === events.length - 1
        return (
          <li key={ev.id ?? i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
            {!isLast && (
              <div style={{ position: 'absolute', left: 15, top: 32, bottom: 0, width: 2, background: 'var(--forest)', opacity: 0.2 }} />
            )}
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: cfg.bg, border: `2px solid ${cfg.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, flexShrink: 0, zIndex: 1,
            }}>{cfg.icon}</div>
            <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: cfg.color, background: cfg.bg, border: `0.5px solid ${cfg.border}`, borderRadius: 'var(--r-sm)', padding: '2px 8px' }}>
                  {cfg.label}
                </span>
                {ev.actor && (
                  <span style={{ fontSize: 11, color: 'var(--ink-3)', background: 'var(--bg-sunken)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '1px 6px' }}>
                    by {ev.actor}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 11, color: 'var(--ink-4)', margin: '0 0 6px' }}>{fmt(ev.timestamp)}</p>
              {ev.event_data && Object.keys(ev.event_data).length > 0 && (
                <div style={{ background: 'var(--bg-sunken)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '8px 10px', fontSize: 12, color: 'var(--ink-3)' }}>
                  {Object.entries(ev.event_data).filter(([k]) => k !== 'source').map(([k, v]) => (
                    <div key={k}>
                      <span style={{ color: 'var(--ink-4)', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}: </span>
                      <span style={{ color: 'var(--ink-1)', fontWeight: 500 }}>{String(v)}</span>
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
