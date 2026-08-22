import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAuditLog } from '../api/client'

const EVENT_LABELS = {
  submitted: { icon: '📥', label: 'Submitted', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  analyzed: { icon: '🤖', label: 'AI Analyzed', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  reviewed: { icon: '👤', label: 'Reviewed', color: 'text-green-600 bg-green-50 border-green-200' },
}

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAuditLog({ limit: 200 })
      .then(r => setLogs(r.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="vera-section-title">Audit Log</h1>
        <p className="text-vera-text-secondary mt-1">
          Immutable record of all system and reviewer actions
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-xs text-amber-800">
        ⚠ Events with [Demo] tag are from synthetic data and do not represent real procurement activity.
      </div>

      {loading ? (
        <div className="text-center py-16 text-vera-text-muted">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="vera-card p-12 text-center text-vera-text-muted">
          <p className="text-3xl mb-3">◷</p>
          <p className="font-medium">No audit events yet</p>
        </div>
      ) : (
        <div className="vera-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-vera-bg border-b border-vera-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-vera-text-secondary uppercase tracking-wide">Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-vera-text-secondary uppercase tracking-wide">Event</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-vera-text-secondary uppercase tracking-wide hidden sm:table-cell">Submission</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-vera-text-secondary uppercase tracking-wide hidden md:table-cell">Actor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-vera-text-secondary uppercase tracking-wide">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vera-border">
                {logs.map((log) => {
                  const cfg = EVENT_LABELS[log.event_type] || { icon: '◷', label: log.event_type, color: 'text-gray-600 bg-gray-50 border-gray-200' }
                  return (
                    <tr key={log.id} className="hover:bg-vera-bg transition-colors duration-100">
                      <td className="px-4 py-3 text-xs text-vera-text-muted whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {log.submission_id ? (
                          <Link
                            to={`/review/${log.submission_id}`}
                            className="text-vera-primary hover:underline text-xs"
                          >
                            #{log.submission_id}
                          </Link>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-vera-text-secondary hidden md:table-cell">
                        {log.actor || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-vera-text-secondary">
                          {Object.entries(log.event_data || {})
                            .filter(([k]) => k !== 'source')
                            .map(([k, v]) => (
                              <span key={k} className="mr-3 whitespace-nowrap">
                                <span className="text-vera-text-muted capitalize">{k.replace(/_/g, ' ')}: </span>
                                <span className="font-medium">{String(v)}</span>
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
