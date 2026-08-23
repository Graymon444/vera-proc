import React, { useState, useRef, useEffect } from 'react'

export default function Collapsible({ title, defaultOpen = false, children, badge }) {
  const [open, setOpen] = useState(defaultOpen)
  const ref = useRef(null)
  const [height, setHeight] = useState(defaultOpen ? 'auto' : 0)

  useEffect(() => {
    if (open) {
      const h = ref.current?.scrollHeight || 0
      setHeight(h)
      const t = setTimeout(() => setHeight('auto'), 210)
      return () => clearTimeout(t)
    } else {
      const h = ref.current?.scrollHeight || 0
      setHeight(h)
      requestAnimationFrame(() => requestAnimationFrame(() => setHeight(0)))
    }
  }, [open])

  return (
    <div className="v-card no-hover" style={{ overflow: 'hidden' }}>
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '14px 16px',
          background: 'none', border: 'none', cursor: 'pointer',
          gap: 8, textAlign: 'left', outline: 'none',
        }}
        onFocus={e  => { e.currentTarget.style.outline = '2px solid var(--forest)' }}
        onBlur={e   => { e.currentTarget.style.outline = 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-1)' }}>{title}</span>
          {badge && (
            <span style={{ fontSize: 11, background: 'var(--bg-sunken)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '1px 6px', color: 'var(--ink-3)' }}>
              {badge}
            </span>
          )}
        </div>
        <span style={{
          fontSize: 18, color: 'var(--ink-4)', display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform var(--t-base) var(--ease)', flexShrink: 0, lineHeight: 1,
        }}>▾</span>
      </button>

      <div ref={ref} style={{ height: height === 'auto' ? 'auto' : `${height}px`, overflow: 'hidden', transition: 'height var(--t-base) var(--ease)' }}>
        <div style={{ padding: '0 16px 16px', borderTop: '0.5px solid var(--border)' }}>
          <div style={{ paddingTop: 14 }}>{children}</div>
        </div>
      </div>
    </div>
  )
}
