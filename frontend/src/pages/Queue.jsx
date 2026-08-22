import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listSubmissions } from '../api/client'
import RiskBadge from '../components/RiskBadge'

const FILTERS = ['All', 'High', 'Medium', 'Low']

function formatCurrency(n) {
  return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const DECISION_STYLE = {
  'Verified': 'text-green-700 bg-green-50 border-green-200',
  'Needs Further Review': 'text-amber-700 bg-amber-50 border-amber-200',
  'Dismissed': 'text-gray-600 bg-gray-50 border-gray-200',
}

export default function Queue() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  async function load(riskLevel) {
    setLoading(true)
    try {
      const params = riskLevel !== 'All' ? { risk_level: riskLevel } : {}
      const res = await listSubmissions(params)
      setItems(res.data)
    } catch {
      // empty
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(filter) }, [filter])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="vera-section-title">Review Queue</h1>
          <p className="text-vera-text-secondary mt-1">
            Prioritized by risk score — highest risk first
          </p>
        </div>
        <Link to="/submit" className="vera-btn-primary text-sm shrink-0">
          + New Submission
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-btn text-sm font-medium border transition-all duration-150 ${
              filter === f
                ? 'bg-vera-primary text-white border-vera-primary shadow-sm'
                : 'bg-white text-vera-text-secondary border-vera-border hover:bg-vera-bg'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-vera-text-muted">Loading...</div>
      ) : items.length === 0 ? (
        <div className="vera-card p-12 text-center text-vera-text-muted">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">No submissions found</p>
          <p className="text-sm mt-1">
            {filter !== 'All' ? `No ${filter} risk submissions yet.` : 'Load demo data or submit a new procurement.'}
          </p>
        </div>
      ) : (
        <div className="vera-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-vera-border bg-vera-bg">
                  <th className="text-left px-4 py-3 font-semibold text-vera-text-secondary text-xs uppercase tracking-wide">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-vera-text-secondary text-xs uppercase tracking-wide">Submission</th>
                  <th className="text-left px-4 py-3 font-semibold text-vera-text-secondary text-xs uppercase tracking-wide hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-vera-text-secondary text-xs uppercase tracking-wide hidden md:table-cell">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-vera-text-secondary text-xs uppercase tracking-wide">AI Assessment</th>
                  <th className="text-left px-4 py-3 font-semibold text-vera-text-secondary text-xs uppercase tracking-wide hidden lg:table-cell">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-vera-text-secondary text-xs uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vera-border">
                {items.map(({ submission, analysis, review }) => (
                  <tr
                    key={submission.id}
                    className="hover:bg-vera-bg transition-colors duration-100"
                  >
                    <td className="px-4 py-3 text-vera-text-muted">{submission.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-vera-text leading-snug">
                        {submission.title}
                        {submission.is_synthetic && (
                          <span className="ml-1.5 text-xs text-vera-text-muted font-normal">[Demo]</span>
                        )}
                      </div>
                      <div className="text-xs text-vera-text-muted mt-0.5">
                        {submission.vendor_name} · {formatDate(submission.submitted_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-vera-text-secondary hidden sm:table-cell">
                      {submission.category}
                    </td>
                    <td className="px-4 py-3 text-vera-text font-medium hidden md:table-cell">
                      {formatCurrency(submission.requested_amount)}
                    </td>
                    <td className="px-4 py-3">
                      {analysis ? (
                        <RiskBadge level={analysis.risk_level} score={analysis.risk_score} showScore />
                      ) : (
                        <span className="text-vera-text-muted text-xs">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {review ? (
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${DECISION_STYLE[review.decision] || ''}`}>
                          {review.decision}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          Pending Review
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/review/${submission.id}`}
                        className="vera-btn-ghost text-xs px-3 py-1.5"
                      >
                        Review →
                      </Link>
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
