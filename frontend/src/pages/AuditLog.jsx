import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAuditLog } from '../api/client'

const EV_STYLE = {
  submitted: { label: '📥 Submitted',   color: 'var(--forest)',  bg: 'var(--forest-light)', border: 'var(--forest-mid)' },
  analyzed:  { label: '🤖 AI Analyzed', color: '#5A58C8',        bg: '#EEEEF8',             border: '#B8B8DC' },
  reviewed:  { label: '👤 Reviewed',    color: 'var(--forest)',  bg: 'var(--forest-light)', border: 'var(--forest-mid)' },
}

function fmt(iso) {
  try { return new Date(iso).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}

export default function AuditLog() {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAuditLog({ limit: 200 }).then(r => setLogs(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Audit Log</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--ink-3)' }}>Immutable record of all system and reviewer actions</p>
      </div>

      {/* Disclaimer */}
      <div style={{ padding: '10px 14px', background: 'var(--ochre-light)', border: '0.5px solid var(--ochre-border)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--ochre-text)', marginBottom: 20 }}>
        ⚠ Events tagged [Demo] originate from synthetic data and do not represent real procurement activity.
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3,4,5].map(i => <div key={i} className="v-skeleton" style={{ height: 56 }} />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="v-card no-hover" style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--ink-4)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>◷</div>
          <p style={{ fontSize: 14, margin: 0 }}>No audit events yet</p>
        </div>
      ) : (
        <div className="v-card no-hover" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-sunken)', borderBottom: '0.5px solid var(--border)' }}>
                  {['Time', 'Event', 'Submission', 'Actor', 'Details'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const cfg = EV_STYLE[log.event_type] || { label: `◷ ${log.event_type}`, color: 'var(--ink-4)', bg: 'var(--bg-sunken)', border: 'var(--border)' }
                  return (
                    <tr key={log.id}
                      style={{ borderBottom: '0.5px solid var(--border)', transition: 'background var(--t-fast)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                      <td style={{ padding: '11px 16px', fontSize: 11, color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>{fmt(log.timestamp)}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 'var(--r-sm)', background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}`, whiteSpace: 'nowrap' }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        {log.submission_id
                          ? <Link to={`/review/${log.submission_id}`} style={{ fontSize: 12, color: 'var(--forest)', textDecoration: 'none', fontWeight: 500 }}>#{log.submission_id}</Link>
                          : '—'}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--ink-3)' }}>{log.actor || '—'}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          {Object.entries(log.event_data || {}).filter(([k]) => k !== 'source').map(([k, v]) => (
                            <span key={k}>
                              <span style={{ color: 'var(--ink-4)', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}: </span>
                              <span style={{ color: 'var(--ink-1)', fontWeight: 500 }}>{String(v)}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
