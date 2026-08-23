import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardStats, seedGovData, getModelEval } from '../api/client'
import { RiskPill } from '../components/RiskBadge'
import RiskDistributionCard from '../components/RiskDistributionCard'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// Risk color map using CSS variables
const RC = {
  High:   { color: 'var(--terra)',  bg: 'var(--terra-light)',  border: 'var(--terra-border)' },
  Medium: { color: 'var(--ochre)',  bg: 'var(--ochre-light)',  border: 'var(--ochre-border)' },
  Low:    { color: 'var(--olive)',  bg: 'var(--olive-light)',  border: 'var(--olive-border)' },
}
// Recharts needs resolved hex — map for chart cells
const CHART_FILL = { High: '#C05A3A', Medium: '#C08C1A', Low: '#72941F' }

function fmtRp(n) {
  if (n == null) return '—'
  const v = Math.round(n)
  if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(1)}M`
  if (v >= 1_000_000)     return `Rp ${(v / 1_000_000).toFixed(0)}jt`
  return 'Rp ' + v.toLocaleString('id-ID')
}
function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }
  catch { return '' }
}

function MetricCard({ value, label, level }) {
  const c = RC[level] || { color: 'var(--ink-1)', bg: 'var(--bg-sunken)', border: 'var(--border)' }
  return (
    <div className="v-card no-hover" style={{ background: c.bg, border: `0.5px solid ${c.border}`, padding: '16px', textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 500, color: c.color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.4 }}>{label}</div>
    </div>
  )
}

function Chip({ label, level }) {
  const c = RC[level] || RC.Low
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px',
      background: c.bg, border: `0.5px solid ${c.border}`,
      borderRadius: 'var(--r-sm)', fontSize: 11,
      color: c.color, fontWeight: 500, lineHeight: 1.6, whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

function SubmissionCard({ item }) {
  const lv = item.risk_level
  const c = RC[lv] || RC.Low
  const cleanTitle = item.title.replace(/^\[SYNTHETIC[^\]]*\]\s*/, '').replace(/^\[.*?\]\s*/, '')

  const flags = item.rule_flags || []
  const pf = flags.find(f => f.indicator_type === 'price_deviation')
  const bf = flags.find(f => f.indicator_type === 'budget_utilization')
  const chips = []
  if (pf?.deviation_pct != null) chips.push({ label: `Price ${pf.deviation_pct > 0 ? '+' : ''}${Number(pf.deviation_pct).toFixed(0)}%`, level: 'High' })
  if (bf?.deviation_pct != null) chips.push({ label: `Budget ${Number(bf.deviation_pct).toFixed(0)}%`, level: bf.deviation_pct > 90 ? 'High' : 'Medium' })

  return (
    <Link to={`/review/${item.submission_id}`} style={{
      display: 'block', textDecoration: 'none',
      background: 'var(--bg-card)',
      border: `0.5px solid ${c.border}`,
      borderLeft: `4px solid ${c.color}`,
      borderRadius: 'var(--r-lg)', padding: '14px 16px',
      boxShadow: 'var(--shadow-sm)',
      transition: 'box-shadow var(--t-base) var(--ease), transform var(--t-base) var(--ease)',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'scale(1.01)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'scale(1)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-1)', lineHeight: 1.4 }}>{cleanTitle}</span>
            {item.is_synthetic && (
              <span style={{ fontSize: 10, color: 'var(--ink-4)', background: 'var(--bg-sunken)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '1px 6px' }}>Demo</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: chips.length ? 8 : 0 }}>
            {item.category} · {fmtDate(item.submitted_at)}
          </div>
          {chips.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {chips.map((ch, i) => <Chip key={i} label={ch.label} level={ch.level} />)}
            </div>
          )}
        </div>
        {/* Score badge */}
        <div style={{ background: c.bg, border: `0.5px solid ${c.border}`, borderRadius: 'var(--r-md)', padding: '6px 10px', textAlign: 'center', minWidth: 52, flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: c.color, lineHeight: 1 }}>{Math.round(item.risk_score)}</div>
          <div style={{ fontSize: 10, color: c.color, letterSpacing: '0.04em', marginTop: 2 }}>{lv?.toUpperCase()}</div>
        </div>
      </div>
      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTop: '0.5px solid var(--border)' }}>
        <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{fmtRp(item.requested_amount)} · #{item.submission_id}</span>
        <RiskPill level={lv} />
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const [stats,    setStats]    = useState(null)
  const [evalData, setEvalData] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [seeding,  setSeeding]  = useState(false)
  const [seedMsg,  setSeedMsg]  = useState(null)

  async function load() {
    try {
      const [s, e] = await Promise.all([getDashboardStats(), getModelEval()])
      setStats(s.data); setEvalData(e.data)
    } catch { /**/ } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function handleSeed() {
    setSeeding(true); setSeedMsg(null)
    try {
      const r = await seedGovData(60)
      const d = r.data.risk_distribution || {}
      setSeedMsg(`Loaded ${r.data.count} synthetic records — Low: ${d.Low ?? 0}, Medium: ${d.Medium ?? 0}, High: ${d.High ?? 0}`)
      load()
    } catch { setSeedMsg('Failed to load data.') } finally { setSeeding(false) }
  }

  const chartData = stats ? [
    { name: 'High',   value: stats.high_risk,  fill: CHART_FILL.High },
    { name: 'Medium', value: stats.medium_risk, fill: CHART_FILL.Medium },
    { name: 'Low',    value: stats.low_risk,    fill: CHART_FILL.Low },
  ] : []

  const r2 = evalData?.r2_score
  const r2HexColor = r2 == null ? '#9A8F82' : r2 >= 0.8 ? '#72941F' : r2 >= 0.6 ? '#C08C1A' : '#C05A3A'

  const recent  = stats?.recent_analyses || []
  const avgRisk = recent.length ? Math.round(recent.reduce((s, x) => s + x.risk_score, 0) / recent.length) : 0
  const maxRisk = recent.length ? Math.round(Math.max(...recent.map(x => x.risk_score))) : 0
  const flagBudget = recent.filter(x => x.risk_level === 'High').reduce((s, x) => s + (x.requested_amount || 0), 0)
  const lvl = n => n >= 70 ? 'High' : n >= 40 ? 'Medium' : 'Low'

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--ink-3)' }}>AI-assisted procurement risk overview</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={handleSeed} disabled={seeding} className="v-btn v-btn-secondary" style={{ height: 40, minHeight: 40, padding: '0 16px', fontSize: 13 }}>
            {seeding ? 'Loading...' : '⊕ Load Indonesia Gov Data'}
          </button>
          <Link to="/submit" className="v-btn v-btn-primary" style={{ height: 40, minHeight: 40, padding: '0 16px', fontSize: 13 }}>
            + New Submission
          </Link>
        </div>
      </div>

      {seedMsg && (
        <div style={{ padding: '10px 14px', background: 'var(--forest-light)', border: '0.5px solid var(--forest-mid)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--forest-text)', marginBottom: 20 }}>
          ✓ {seedMsg} — All records are synthetic demo data, not real procurement.
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="v-skeleton" style={{ height: 80 }} />)}
        </div>
      ) : (
        <>
          {/* Risk Distribution */}
          <section style={{ marginBottom: 16 }}>
            <RiskDistributionCard
              high={stats?.high_risk ?? 0} medium={stats?.medium_risk ?? 0} low={stats?.low_risk ?? 0}
              r2Score={r2} totalSubmissions={stats?.total_submissions ?? 0}
              pendingReview={stats?.pending_review ?? 0} reviewed={stats?.reviewed ?? 0}
            />
          </section>

          {/* Quick metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            <MetricCard value={avgRisk}        label="Avg Risk Score"   level={lvl(avgRisk)} />
            <MetricCard value={maxRisk}        label="Max Risk Score"   level={lvl(maxRisk)} />
            <MetricCard value={fmtRp(flagBudget)} label="High-Risk Budget" level="High" />
          </div>

          {/* Chart + Model Eval */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }} className="two-col-mobile">
            <div className="v-card no-hover" style={{ padding: '16px' }}>
              <h2 style={{ margin: '0 0 4px' }}>Risk Distribution</h2>
              <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--ink-4)' }}>Submissions by risk level</p>
              {chartData.every(d => d.value === 0) ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-4)', fontSize: 13 }}>Load demo data to see chart</div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData} barCategoryGap="35%">
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#635A50' }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9A8F82' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '0.5px solid #DDD5C4', fontSize: 12, background: '#FAF7F0', boxShadow: '0 2px 8px rgba(28,24,20,0.07)' }} cursor={{ fill: '#EBE4D6' }} />
                    <Bar dataKey="value" radius={[6,6,0,0]}>
                      {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="v-card no-hover" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>🤖</span>
                <h2 style={{ margin: 0 }}>Model Validation</h2>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--ink-4)' }}>ML ↔ Rule Engine alignment</p>
              {evalData?.status === 'ok' ? (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 14 }}>
                    <div style={{ fontSize: 40, fontWeight: 500, color: r2HexColor, lineHeight: 1 }}>{evalData.r2_score}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>R² Score</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: r2HexColor, marginTop: 6 }}>{evalData.alignment_level} Alignment</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    {[{ l: 'Samples', v: evalData.sample_count }, { l: 'Rule avg', v: evalData.rule_score_mean }, { l: 'ML avg', v: evalData.ml_score_mean }, { l: 'Rule σ', v: evalData.rule_score_std }].map(({ l, v }) => (
                      <div key={l} style={{ background: 'var(--bg-sunken)', borderRadius: 'var(--r-md)', padding: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{l}</div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink-1)' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--ink-4)', lineHeight: 1.5, margin: 0 }}>{evalData.interpretation}</p>
                </div>
              ) : (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>{evalData?.message || 'Load data to run model evaluation'}</div>
              )}
            </div>
          </div>

          {/* Submission queue */}
          <section style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>Recent Analyses</h2>
              <Link to="/queue" className="v-btn-ghost" style={{ fontSize: 12, minHeight: 32, padding: '0 10px' }}>View all →</Link>
            </div>
            {recent.length === 0 ? (
              <div className="v-card no-hover" style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--ink-4)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <p style={{ margin: 0, fontSize: 14 }}>No submissions yet</p>
                <p style={{ margin: '4px 0 0', fontSize: 12 }}>Load demo data or submit a new procurement</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...recent].sort((a, b) => ({ High: 0, Medium: 1, Low: 2 }[a.risk_level] ?? 3) - ({ High: 0, Medium: 1, Low: 2 }[b.risk_level] ?? 3))
                  .map(item => <SubmissionCard key={item.submission_id} item={item} />)}
              </div>
            )}
          </section>

          {/* Disclaimer */}
          <div style={{ padding: '12px 16px', background: 'var(--ochre-light)', border: '0.5px solid var(--ochre-border)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--ochre-text)', lineHeight: 1.6 }}>
            <strong>⚠ Prototype Disclaimer:</strong> VERA is a research prototype. Risk thresholds are configurable assumptions — not official government standards. All demo data is synthetic and fictional. AI assessments are advisory only.
          </div>
        </>
      )}

      <style>{`@media (max-width: 640px) { .two-col-mobile { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
