import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listSubmissions } from '../api/client'
import { RiskPill } from '../components/RiskBadge'

const FILTERS = ['All', 'High', 'Medium', 'Low']

const DEC = {
  'Verified':             { bg: 'var(--forest-light)', color: 'var(--forest-text)', border: 'var(--forest-mid)' },
  'Needs Further Review': { bg: 'var(--ochre-light)',  color: 'var(--ochre-text)',  border: 'var(--ochre-border)' },
  'Dismissed':            { bg: 'var(--bg-sunken)',    color: 'var(--ink-3)',       border: 'var(--border)' },
}

function fmtRp(n) { return n == null ? '—' : 'Rp ' + Math.round(n).toLocaleString('id-ID') }
function fmtDate(iso) { try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return iso } }

export default function Queue() {
  const [items,   setItems]   = useState([])
  const [filter,  setFilter]  = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listSubmissions(filter !== 'All' ? { risk_level: filter } : {})
      .then(r => setItems(r.data)).catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Review Queue</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--ink-3)' }}>Sorted by risk score — highest priority first</p>
        </div>
        <Link to="/submit" className="v-btn v-btn-primary" style={{ height: 40, minHeight: 40, padding: '0 16px', fontSize: 13 }}>+ New Submission</Link>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} type="button" onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: 'var(--r-md)', fontSize: 13,
            border: '0.5px solid', cursor: 'pointer', transition: 'all var(--t-fast) var(--ease)', minHeight: 36,
            background:  filter === f ? 'var(--forest)' : 'var(--bg-card)',
            color:       filter === f ? '#FAF7F0'       : 'var(--ink-3)',
            borderColor: filter === f ? 'var(--forest)' : 'var(--border)',
            fontWeight:  filter === f ? 500             : 400,
          }}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3,4,5].map(i => <div key={i} className="v-skeleton" style={{ height: 72 }} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="v-card no-hover" style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--ink-4)' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
          <p style={{ fontSize: 14, margin: 0 }}>No submissions found</p>
          <p style={{ fontSize: 12, margin: '4px 0 0' }}>{filter !== 'All' ? `No ${filter} risk submissions yet.` : 'Load demo data or submit a new procurement.'}</p>
        </div>
      ) : (
        <div className="v-card no-hover" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--bg-sunken)', borderBottom: '0.5px solid var(--border)' }}>
                  {['#', 'Submission', 'Category', 'Amount', 'AI Assessment', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(({ submission: s, analysis: a, review: r }) => (
                  <tr key={s.id} style={{ borderBottom: '0.5px solid var(--border)', transition: 'background var(--t-fast)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--ink-4)', fontSize: 12 }}>{s.id}</td>
                    <td style={{ padding: '12px 16px', maxWidth: 260 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-1)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {s.title.replace(/^\[SYNTHETIC[^\]]*\]\s*/, '').replace(/^\[.*?\]\s*/, '').substring(0, 48)}
                        {s.is_synthetic && <span style={{ fontSize: 10, color: 'var(--ink-4)', background: 'var(--bg-sunken)', border: '0.5px solid var(--border)', borderRadius: 3, padding: '1px 5px' }}>Demo</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{s.vendor_name} · {fmtDate(s.submitted_at)}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{s.category}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: 'var(--ink-1)', whiteSpace: 'nowrap' }}>{fmtRp(s.requested_amount)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {a ? (<><RiskPill level={a.risk_level} /><div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{Math.round(a.risk_score)} / 100</div></>) : <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {r ? (
                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 'var(--r-sm)', background: DEC[r.decision]?.bg || 'var(--bg-sunken)', color: DEC[r.decision]?.color || 'var(--ink-3)', border: `0.5px solid ${DEC[r.decision]?.border || 'var(--border)'}`, whiteSpace: 'nowrap' }}>{r.decision}</span>
                      ) : (
                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 'var(--r-sm)', background: 'var(--ochre-light)', color: 'var(--ochre-text)', border: '0.5px solid var(--ochre-border)' }}>Pending</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <Link to={`/review/${s.id}`} className="v-btn-ghost" style={{ fontSize: 12, minHeight: 32, padding: '0 10px' }}>Review →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
