import React, { useState } from 'react'
import { submitReview } from '../api/client'

const DECISIONS = [
  {
    value: 'Verified',
    label: 'Mark as Verified',
    desc: 'Submission has been reviewed and appears to be in order.',
    cls: 'border-green-300 bg-green-50 text-green-800 hover:border-green-400 hover:bg-green-100',
    activeCls: 'border-green-500 bg-green-100 ring-2 ring-green-400',
    icon: '✓',
  },
  {
    value: 'Needs Further Review',
    label: 'Needs Further Review',
    desc: 'Requires additional documentation or clarification before proceeding.',
    cls: 'border-amber-300 bg-amber-50 text-amber-800 hover:border-amber-400 hover:bg-amber-100',
    activeCls: 'border-amber-500 bg-amber-100 ring-2 ring-amber-400',
    icon: '⚑',
  },
  {
    value: 'Dismissed',
    label: 'Dismiss / No Issue',
    desc: 'Reviewed and confirmed — no significant issues found.',
    cls: 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 hover:bg-gray-100',
    activeCls: 'border-gray-400 bg-gray-100 ring-2 ring-gray-300',
    icon: '○',
  },
]

export default function ReviewPanel({ submissionId, existingReview, onReviewed }) {
  const [decision, setDecision] = useState(existingReview?.decision || '')
  const [note, setNote] = useState(existingReview?.reviewer_note || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(!!existingReview)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!decision) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await submitReview(submissionId, { decision, reviewer_note: note })
      setDone(true)
      onReviewed?.(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="vera-card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-vera-primary-light rounded-xl flex items-center justify-center text-vera-primary font-bold text-lg">
          ≡
        </div>
        <div>
          <h3 className="vera-subsection-title">Reviewer Decision</h3>
          <p className="text-xs text-vera-text-muted mt-0.5">
            Final decision belongs to the human reviewer
          </p>
        </div>
      </div>

      {/* Important disclaimer */}
      <div className="bg-vera-bg border border-vera-border rounded-xl px-4 py-3 mb-5 text-xs text-vera-text-secondary leading-relaxed">
        <strong className="text-vera-text">Important:</strong> The AI assessment above is advisory only.
        The procurement decision rests entirely with the human reviewer based on a full review of
        all available information.
      </div>

      {done && !error ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-3">
            {decision === 'Verified' ? '✅' : decision === 'Needs Further Review' ? '🔍' : '○'}
          </div>
          <p className="font-semibold text-vera-text">{decision}</p>
          {note && <p className="text-sm text-vera-text-muted mt-2 italic">"{note}"</p>}
          <button
            onClick={() => setDone(false)}
            className="vera-btn-ghost mt-4 text-sm"
          >
            Update Decision
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3 mb-5">
            {DECISIONS.map((d) => (
              <button
                type="button"
                key={d.value}
                onClick={() => setDecision(d.value)}
                className={`rounded-xl border-2 p-4 text-left transition-all duration-150 ${
                  decision === d.value ? d.activeCls : d.cls
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl font-bold">{d.icon}</span>
                  <div>
                    <p className="font-semibold text-sm">{d.label}</p>
                    <p className="text-xs opacity-75 mt-0.5">{d.desc}</p>
                  </div>
                  {decision === d.value && (
                    <span className="ml-auto text-xs font-bold opacity-75">Selected</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mb-5">
            <label className="vera-label" htmlFor="reviewer-note">
              Reviewer Notes <span className="font-normal text-vera-text-muted">(optional)</span>
            </label>
            <textarea
              id="reviewer-note"
              className="vera-input resize-none"
              rows={3}
              placeholder="Add notes or justification for this decision..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!decision || submitting}
            className="vera-btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Decision'}
          </button>
        </form>
      )}
    </div>
  )
}
