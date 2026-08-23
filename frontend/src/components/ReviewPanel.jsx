import React, { useState } from 'react'
import { submitReview } from '../api/client'

const DECISIONS = [
  { value: 'Verified',             label: 'Approve',              desc: 'Submission reviewed and appears in order.',               color: 'var(--forest)', bg: 'var(--forest-light)', border: 'var(--forest-mid)', active: 'var(--forest)' },
  { value: 'Needs Further Review', label: 'Request Information',  desc: 'Needs additional documentation before proceeding.',       color: 'var(--ochre)',  bg: 'var(--ochre-light)',  border: 'var(--ochre-border)', active: 'var(--ochre)' },
  { value: 'Dismissed',            label: 'Dismiss / No Issue',   desc: 'Reviewed — no significant issues found.',                 color: 'var(--ink-3)', bg: 'var(--bg-sunken)',    border: 'var(--border)', active: 'var(--ink-3)' },
]

export default function ReviewPanel({ submissionId, existingReview, onReviewed }) {
  const [decision,   setDecision]   = useState(existingReview?.decision || '')
  const [note,       setNote]       = useState(existingReview?.reviewer_note || '')
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)
  const [done,       setDone]       = useState(!!existingReview)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!decision) return
    setSubmitting(true); setError(null)
    try {
      const res = await submitReview(submissionId, { decision, reviewer_note: note })
      setDone(true); onReviewed?.(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit. Please try again.')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="v-card no-hover" style={{ padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, background: 'var(--forest-light)',
          borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 16, color: 'var(--forest)', flexShrink: 0,
        }}>≡</div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16 }}>Reviewer Decision</h3>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-4)' }}>Final decision belongs to the human reviewer</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{
        padding: '10px 12px', background: 'var(--bg-sunken)',
        border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)',
        fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 14,
      }}>
        <strong style={{ color: 'var(--ink-1)' }}>Important:</strong> The AI assessment is advisory only.
        The procurement decision rests entirely with the human reviewer.
      </div>

      {done && !error ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>
            {decision === 'Verified' ? '✅' : decision === 'Needs Further Review' ? '🔍' : '○'}
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 6px', color: 'var(--ink-1)' }}>{decision}</p>
          {note && <p style={{ fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic', margin: '0 0 4px' }}>"{note}"</p>}
          <button type="button" className="v-btn-ghost" onClick={() => setDone(false)} style={{ marginTop: 12 }}>
            Update Decision
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {DECISIONS.map(d => (
              <button type="button" key={d.value} onClick={() => setDecision(d.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  border: `2px solid ${decision === d.value ? d.active : d.border}`,
                  borderRadius: 'var(--r-md)',
                  background: decision === d.value ? d.bg : 'var(--bg-card)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all var(--t-fast) var(--ease)',
                  outline: 'none', width: '100%',
                }}>
                <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <circle cx="10" cy="10" r="9"
                    fill={decision === d.value ? d.color : 'transparent'}
                    stroke={d.color} strokeWidth="2" />
                  {decision === d.value && <circle cx="10" cy="10" r="4" fill="var(--bg-card)" />}
                </svg>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-1)' }}>{d.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{d.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="v-label" htmlFor="rev-note">
              Reviewer Notes <span style={{ color: 'var(--ink-4)' }}>(optional)</span>
            </label>
            <textarea id="rev-note" className="v-textarea" rows={3}
              placeholder="Add notes or justification..."
              value={note} onChange={e => setNote(e.target.value)} />
          </div>

          {error && (
            <div style={{
              padding: '10px 12px', background: 'var(--terra-light)',
              border: '0.5px solid var(--terra-border)', borderRadius: 'var(--r-md)',
              fontSize: 12, color: 'var(--terra-text)', marginBottom: 12,
            }}>{error}</div>
          )}

          <button type="submit" disabled={!decision || submitting}
            className="v-btn v-btn-primary" style={{ width: '100%' }}>
            {submitting ? 'Submitting...' : 'Submit Decision'}
          </button>
        </form>
      )}
    </div>
  )
}
