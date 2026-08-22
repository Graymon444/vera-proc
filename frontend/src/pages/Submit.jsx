import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSubmission } from '../api/client'

const CATS = [
  'Alat Tulis Kantor','Peralatan IT','Laptop','Server','Mebel Kantor',
  'Kendaraan Dinas','Obat-obatan','Alat Kesehatan','Bahan Bangunan',
  'Konstruksi Gedung','Jasa Konsultansi IT','Jasa Kebersihan',
  'Jasa Keamanan','Catering/Konsumsi','Percetakan','Pelatihan/Workshop',
  'Pengadaan Software','Pengadaan Seragam','BBM/Bahan Bakar',
  'Jasa Audit/Konsultansi','Other',
]

const INIT = {
  title:'', category:'', requested_amount:'', quantity:'',
  unit_price:'', vendor_name:'', budget_available:'', reference_price:'',
  procurement_date:'', description:'', supporting_info:'',
}

function Field({ label, hint, required, children }) {
  return (
    <div>
      <label className="v-label">
        {label}{required && <span style={{ color: '#D85A30', marginLeft: 3 }}>*</span>}
      </label>
      {hint && <p style={{ fontSize: 11, color: '#9B9A96', margin: '-2px 0 6px' }}>{hint}</p>}
      {children}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="v-card" style={{ padding: '20px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 16 }}>{title}</h2>
      <div style={{ display: 'grid', gap: 14 }}>{children}</div>
    </div>
  )
}

export default function Submit() {
  const nav = useNavigate()
  const [f, setF] = useState(INIT)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function set(k, v) { setF(p => ({ ...p, [k]: v })) }

  function handleQtyPrice(k, v) {
    const u = { ...f, [k]: v }
    const q = parseFloat(u.quantity), p = parseFloat(u.unit_price)
    if (!isNaN(q) && !isNaN(p)) u.requested_amount = (q * p).toFixed(0)
    setF(u)
  }

  async function onSubmit(e) {
    e.preventDefault(); setError(null); setSubmitting(true)
    try {
      const payload = {
        ...f,
        requested_amount: parseFloat(f.requested_amount),
        quantity: parseFloat(f.quantity),
        unit_price: parseFloat(f.unit_price),
        budget_available: parseFloat(f.budget_available),
        reference_price: parseFloat(f.reference_price),
      }
      const res = await createSubmission(payload)
      nav(`/review/${res.data.submission.id}`)
    } catch (err) {
      const d = err.response?.data?.detail
      setError(Array.isArray(d) ? d.map(x => x.msg).join('; ') : (d || 'Submission failed.'))
    } finally { setSubmitting(false) }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>New Procurement Submission</h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#5F5E5A' }}>
          Submit a procurement request for AI-assisted risk assessment.
        </p>
      </div>

      {/* Notice */}
      <div style={{
        padding: '10px 14px', background: '#E1F5EE',
        border: '0.5px solid #A8DCC7', borderRadius: 8,
        fontSize: 13, color: '#0F6E56', marginBottom: 20, lineHeight: 1.5,
      }}>
        <strong>AI Advisory System</strong> — After submission, VERA will automatically analyze
        this request for potential risk indicators. The analysis is advisory only.
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <Section title="Procurement Details">
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Procurement Title" required>
              <input className="v-input" placeholder="e.g. Pengadaan Laptop Dinas Q3 2025"
                value={f.title} onChange={e => set('title', e.target.value)} required />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Category" required>
              <select className="v-select" value={f.category} onChange={e => set('category', e.target.value)} required>
                <option value="">Pilih kategori...</option>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Procurement Date" required>
              <input type="date" className="v-input" value={f.procurement_date}
                onChange={e => set('procurement_date', e.target.value)} required />
            </Field>
            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Vendor Name" required>
                <input className="v-input" placeholder="e.g. PT Maju Bersama Indonesia"
                  value={f.vendor_name} onChange={e => set('vendor_name', e.target.value)} required />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Financial Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Quantity" required>
              <input type="number" min="0.01" step="any" className="v-input" placeholder="e.g. 10"
                value={f.quantity} onChange={e => handleQtyPrice('quantity', e.target.value)} required />
            </Field>
            <Field label="Unit Price (Rp)" required>
              <input type="number" min="0.01" step="any" className="v-input" placeholder="e.g. 8500000"
                value={f.unit_price} onChange={e => handleQtyPrice('unit_price', e.target.value)} required />
            </Field>
            <Field label="Requested Amount (Rp)" required hint="Auto-calculated from qty × unit price">
              <input type="number" min="0.01" step="any" className="v-input"
                value={f.requested_amount} onChange={e => set('requested_amount', e.target.value)} required />
            </Field>
            <Field label="Reference / Market Price (Rp)" required hint="E-Katalog or market reference price">
              <input type="number" min="0.01" step="any" className="v-input" placeholder="e.g. 7500000"
                value={f.reference_price} onChange={e => set('reference_price', e.target.value)} required />
            </Field>
            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Available Budget (Rp)" required>
                <input type="number" min="0.01" step="any" className="v-input" placeholder="e.g. 200000000"
                  value={f.budget_available} onChange={e => set('budget_available', e.target.value)} required />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Description & Supporting Information">
          <Field label="Description">
            <textarea className="v-textarea" rows={3}
              placeholder="Deskripsi kebutuhan pengadaan dan justifikasi..."
              value={f.description} onChange={e => set('description', e.target.value)} />
          </Field>
          <Field label="Supporting Information" hint="Referensi SPSE, nomor NPWP, kode satker, dll.">
            <textarea className="v-textarea" rows={2}
              placeholder="e.g. Referensi: SPSE-1001-2025-0042 | Kode Satker: 10.01"
              value={f.supporting_info} onChange={e => set('supporting_info', e.target.value)} />
          </Field>
        </Section>

        {error && (
          <div style={{
            padding: '10px 14px', background: '#FAECE7',
            border: '0.5px solid #E8B89F', borderRadius: 8,
            fontSize: 13, color: '#712B13',
          }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => nav(-1)} className="v-btn v-btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="v-btn v-btn-primary">
            {submitting ? 'Submitting & Analyzing...' : 'Submit for Risk Assessment →'}
          </button>
        </div>
      </form>
    </div>
  )
}
