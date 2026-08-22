import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardStats, seedDemoData, seedGovData, getModelEval } from '../api/client'
import RiskBadge from '../components/RiskBadge'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

function StatCard({ title, value, sub, color = 'text-vera-text', icon, bg = 'bg-vera-bg' }) {
  return (
    <div className="vera-card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center text-2xl shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-vera-text-muted font-medium uppercase tracking-wide">{title}</p>
        <p className={`text-3xl font-bold leading-tight ${color}`}>{value}</p>
        {sub && <p className="text-xs text-vera-text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState(null)
  const [modelEval, setModelEval] = useState(null)

  async function load() {
    try {
      const [statsRes, evalRes] = await Promise.all([
        getDashboardStats(),
        getModelEval(),
      ])
      setStats(statsRes.data)
      setModelEval(evalRes.data)
    } catch (e) {
      // empty
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleSeed() {
    setSeeding(true)
    setSeedMsg(null)
    try {
      const res = await seedGovData(60)
      setSeedMsg(`${res.data.message} (Low: ${res.data.risk_distribution?.Low ?? 0}, Medium: ${res.data.risk_distribution?.Medium ?? 0}, High: ${res.data.risk_distribution?.High ?? 0})`)
      load()
    } catch {
      setSeedMsg('Failed to seed data.')
    } finally {
      setSeeding(false)
    }
  }

  const chartData = stats ? [
    { name: 'High', value: stats.high_risk, fill: '#DC2626' },
    { name: 'Medium', value: stats.medium_risk, fill: '#D97706' },
    { name: 'Low', value: stats.low_risk, fill: '#16A34A' },
  ] : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="vera-section-title">Dashboard</h1>
          <p className="text-vera-text-secondary mt-1">
            Overview of procurement submissions and risk assessments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="vera-btn-secondary text-sm disabled:opacity-50"
          >
            {seeding ? 'Loading Demo Data...' : '⊕ Load Demo Data'}
          </button>
          <Link to="/submit" className="vera-btn-primary text-sm">
            + New Submission
          </Link>
        </div>
      </div>

      {seedMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl mb-6">
          ✓ {seedMsg} — All records are synthetic demo data.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64 text-vera-text-muted">
          Loading...
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <StatCard
              title="Total Submissions"
              value={stats?.total_submissions ?? 0}
              icon="📋"
              bg="bg-blue-50"
            />
            <StatCard
              title="High Risk"
              value={stats?.high_risk ?? 0}
              icon="⚠"
              color="text-red-600"
              bg="bg-red-50"
            />
            <StatCard
              title="Medium Risk"
              value={stats?.medium_risk ?? 0}
              icon="◆"
              color="text-amber-600"
              bg="bg-amber-50"
            />
            <StatCard
              title="Low Risk"
              value={stats?.low_risk ?? 0}
              icon="✓"
              color="text-green-600"
              bg="bg-green-50"
            />
            <StatCard
              title="Pending Review"
              value={stats?.pending_review ?? 0}
              icon="⏳"
              color="text-amber-600"
              bg="bg-amber-50"
            />
            <StatCard
              title="Reviewed"
              value={stats?.reviewed ?? 0}
              icon="👤"
              color="text-vera-primary"
              bg="bg-vera-primary-light"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="vera-card p-6 lg:col-span-1">
              <h2 className="vera-subsection-title mb-1">Risk Distribution</h2>
              <p className="text-xs text-vera-text-muted mb-5">
                Submissions by risk level
              </p>
              {chartData.every(d => d.value === 0) ? (
                <div className="flex flex-col items-center py-8 text-vera-text-muted text-sm">
                  <p>No data yet.</p>
                  <p className="text-xs mt-1">Load demo data to see the chart.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData} barCategoryGap="30%">
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 10, border: '1px solid #E8ECF4', boxShadow: 'none' }}
                      cursor={{ fill: '#F4F6FB' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Recent submissions */}
            <div className="vera-card p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="vera-subsection-title">Recent Analyses</h2>
                <Link to="/queue" className="vera-btn-ghost text-sm px-3 py-1.5">
                  View All →
                </Link>
              </div>

              {!stats?.recent_analyses?.length ? (
                <div className="text-sm text-vera-text-muted text-center py-8">
                  No submissions yet. Load demo data or submit a new one.
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-vera-border">
                  {stats.recent_analyses.map((item) => (
                    <Link
                      key={item.submission_id}
                      to={`/review/${item.submission_id}`}
                      className="flex items-center gap-3 py-3 hover:bg-vera-bg -mx-2 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-vera-text truncate">
                            {item.title}
                            {item.is_synthetic && (
                              <span className="ml-1.5 text-xs text-vera-text-muted font-normal">[Demo]</span>
                            )}
                          </p>
                        </div>
                        <p className="text-xs text-vera-text-muted mt-0.5">
                          {item.vendor_name} · {item.category} · {formatDate(item.analyzed_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <RiskBadge level={item.risk_level} score={item.risk_score} showScore />
                        {item.is_reviewed && (
                          <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                            Reviewed
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Model Validation Card */}
          {modelEval && (
            <div className="vera-card p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center text-xl">🤖</div>
                <div>
                  <h2 className="vera-subsection-title">Model Validation</h2>
                  <p className="text-xs text-vera-text-muted">ML ↔ Rule Engine alignment (R² score)</p>
                </div>
                <span className="ml-auto text-xs font-semibold bg-vera-primary-light text-vera-primary px-3 py-1 rounded-full border border-blue-200">
                  AI Assessment
                </span>
              </div>

              {modelEval.status === 'ok' ? (
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* R² Score */}
                  <div className="bg-vera-bg rounded-xl p-4 text-center border border-vera-border">
                    <p className="text-xs text-vera-text-muted mb-1">R² Score</p>
                    <p className={`text-4xl font-bold ${
                      modelEval.r2_score >= 0.8 ? 'text-green-600' :
                      modelEval.r2_score >= 0.6 ? 'text-amber-600' : 'text-red-600'
                    }`}>{modelEval.r2_score}</p>
                    <p className={`text-xs font-semibold mt-1 ${
                      modelEval.r2_score >= 0.8 ? 'text-green-600' :
                      modelEval.r2_score >= 0.6 ? 'text-amber-600' : 'text-red-600'
                    }`}>{modelEval.alignment_level} Alignment</p>
                  </div>

                  {/* Stats */}
                  <div className="bg-vera-bg rounded-xl p-4 border border-vera-border">
                    <p className="text-xs text-vera-text-muted mb-2">Score Statistics</p>
                    <div className="text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-vera-text-muted">Samples evaluated</span>
                        <span className="font-semibold">{modelEval.sample_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-vera-text-muted">Rule score avg</span>
                        <span className="font-semibold">{modelEval.rule_score_mean}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-vera-text-muted">ML score avg</span>
                        <span className="font-semibold">{modelEval.ml_score_mean}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interpretation */}
                  <div className="bg-vera-bg rounded-xl p-4 border border-vera-border sm:col-span-1">
                    <p className="text-xs text-vera-text-muted mb-2">Interpretation</p>
                    <p className="text-xs text-vera-text leading-relaxed">{modelEval.interpretation}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                  {modelEval.message}
                </div>
              )}

              <p className="text-xs text-vera-text-muted mt-3 pt-3 border-t border-vera-border leading-relaxed">
                ⚠ {modelEval.note || 'R² measures internal consistency between ML and rule engine, not ground-truth fraud detection accuracy.'}
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
            <strong>⚠ Prototype Disclaimer:</strong> VERA is a research/competition prototype.
            Risk thresholds, scoring weights, and anomaly indicators are configurable prototype assumptions —
            not official government procurement standards. All demo data is synthetic and fictional.
            AI assessments are advisory only. All decisions require human review.
          </div>
        </>
      )}
    </div>
  )
}
