import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSubmission } from '../api/client'

const CATS = [
  'Alat Tulis Kantor','Peralatan IT','Laptop','Server','Mebel Kantor',
  'Kendaraan Dinas','Obat-obatan','Alat Kesehatan','Bahan Bangunan',
  'Konstruksi Gedung','Jasa Konsultansi IT','Jasa Kebersihan','Jasa Keamanan',
  'Catering/Konsumsi','Percetakan','Pelatihan/Workshop','Pengadaan Software',
  'Pengadaan Seragam','BBM/Bahan Bakar','Jasa Audit/Konsultansi','Other',
]

const INIT = { title:'', category:'', requested_amount:'', quantity:'', unit_price:'', vendor_name:'', budget_available:'', reference_price:'', procurement_date:'', description:'', supporting_info:'' }

function Field({ label, hint, required, children }) {
  return (
    <div>
      <label className="v-label">
        {label}{required && <span style={{ color: 'var(--terra)', marginLeft: 3 }}>*</span>}
      </label>
      {hint && <p style={{ fontSize: 11, color: 'var(--ink-4)', margin: '-2px 0 6px', lineHeight: 1.5 }}>{hint}</p>}
      {children}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="v-card no-hover" style={{ padding: '20px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 16 }}>{title}</h2>
      <div style={{ display: 'grid', gap: 14 }}>{children}</div>
    </div>
  )
}

export default function Submit() {
  const nav = useNavigate()
  const [f, setF]             = useState(INIT)
  const [submitting, setSub]  = useState(false)
  const [error, setError]     = useState(null)

  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  function handleQtyPrice(k, v) {
    const u = { ...f, [k]: v }
    const q = parseFloat(u.quantity), p = parseFloat(u.unit_price)
    if (!isNaN(q) && !isNaN(p)) u.requested_amount = (q * p).toFixed(0)
    setF(u)
  }

  async function onSubmit(e) {
    e.preventDefault(); setError(null); setSub(true)
    try {
      const payload = { ...f, requested_amount: parseFloat(f.requested_amount), quantity: parseFloat(f.quantity), unit_price: parseFloat(f.unit_price), budget_available: parseFloat(f.budget_available), reference_price: parseFloat(f.reference_price) }
      const res = await createSubmission(payload)
      nav(`/review/${res.data.submission.id}`)
    } catch (err) {
      const d = err.response?.data?.detail
      setError(Array.isArray(d) ? d.map(x => x.msg).join('; ') : (d || 'Submission failed.'))
    } finally { setSub(false) }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>New Procurement Submission</h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--ink-3)' }}>Submit a procurement request for AI-assisted risk assessment.</p>
      </div>

      {/* Advisory notice */}
      <div style={{ padding: '10px 14px', background: 'var(--forest-light)', border: '0.5px solid var(--forest-mid)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--forest-text)', marginBottom: 20, lineHeight: 1.5 }}>
        <strong>AI Advisory System</strong> — After submission, VERA will automatically analyze this request for potential risk indicators. The analysis is advisory only.
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Section title="Procurement Details">
          <Field label="Procurement Title" required>
            <input className="v-input" placeholder="e.g. Pengadaan Laptop Dinas Q3 2025" value={f.title} onChange={e => set('title', e.target.value)} required />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Category" required>
              <select className="v-select" value={f.category} onChange={e => set('category', e.target.value)} required>
                <option value="">Pilih kategori...</option>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Procurement Date" required>
              <input type="date" className="v-input" value={f.procurement_date} onChange={e => set('procurement_date', e.target.value)} required />
            </Field>
          </div>
          <Field label="Vendor Name" required>
            <input className="v-input" placeholder="e.g. PT Maju Bersama Indonesia" value={f.vendor_name} onChange={e => set('vendor_name', e.target.value)} required />
          </Field>
        </Section>

        <Section title="Financial Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Quantity" required>
              <input type="number" min="0.01" step="any" className="v-input" placeholder="e.g. 10" value={f.quantity} onChange={e => handleQtyPrice('quantity', e.target.value)} required />
            </Field>
            <Field label="Unit Price (Rp)" required>
              <input type="number" min="0.01" step="any" className="v-input" placeholder="e.g. 8500000" value={f.unit_price} onChange={e => handleQtyPrice('unit_price', e.target.value)} required />
            </Field>
            <Field label="Requested Amount (Rp)" required hint="Auto-calculated from qty × unit price">
              <input type="number" min="0.01" step="any" className="v-input" value={f.requested_amount} onChange={e => set('requested_amount', e.target.value)} required />
            </Field>
            <Field label="Reference / Market Price (Rp)" required hint="E-Katalog or market reference">
              <input type="number" min="0.01" step="any" className="v-input" placeholder="e.g. 7500000" value={f.reference_price} onChange={e => set('reference_price', e.target.value)} required />
            </Field>
          </div>
          <Field label="Available Budget (Rp)" required>
            <input type="number" min="0.01" step="any" className="v-input" placeholder="e.g. 200000000" value={f.budget_available} onChange={e => set('budget_available', e.target.value)} required />
          </Field>
        </Section>

        <Section title="Description & Supporting Information">
          <Field label="Description">
            <textarea className="v-textarea" rows={3} placeholder="Deskripsi kebutuhan pengadaan..." value={f.description} onChange={e => set('description', e.target.value)} />
          </Field>
          <Field label="Supporting Information" hint="Referensi SPSE, NPWP, kode satker, dll.">
            <textarea className="v-textarea" rows={2} placeholder="e.g. Referensi: SPSE-1001-2025-0042 | Kode Satker: 10.01" value={f.supporting_info} onChange={e => set('supporting_info', e.target.value)} />
          </Field>
        </Section>

        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--terra-light)', border: '0.5px solid var(--terra-border)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--terra-text)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => nav(-1)} className="v-btn v-btn-secondary">Cancel</button>
          <button type="submit" disabled={submitting} className="v-btn v-btn-primary">
            {submitting ? 'Submitting & Analyzing...' : 'Submit for Risk Assessment →'}
          </button>
        </div>
      </form>
    </div>
  )
}
