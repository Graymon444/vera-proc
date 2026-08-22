import React, { useState, useRef, useEffect } from 'react'

export default function Collapsible({ title, defaultOpen = false, children, badge }) {
  const [open,   setOpen]   = useState(defaultOpen)
  const contentRef          = useRef(null)
  const [height, setHeight] = useState(defaultOpen ? 'auto' : 0)

  useEffect(() => {
    if (open) {
      const h = contentRef.current?.scrollHeight || 0
      setHeight(h)
      const t = setTimeout(() => setHeight('auto'), 210)
      return () => clearTimeout(t)
    } else {
      const h = contentRef.current?.scrollHeight || 0
      setHeight(h)
      requestAnimationFrame(() => requestAnimationFrame(() => setHeight(0)))
    }
  }, [open])

  return (
    <div className="v-card no-hover" style={{ overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '14px 16px',
          background: 'none', border: 'none', cursor: 'pointer',
          gap: 8, textAlign: 'left', outline: 'none',
        }}
        onFocus={e => { e.currentTarget.style.outline = '2px solid #1A9B6E' }}
        onBlur={e  => { e.currentTarget.style.outline = 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#2A2722' }}>{title}</span>
          {badge && (
            <span style={{
              fontSize: 11, background: '#EDE9E1',
              border: '0.5px solid #D6D1C8', borderRadius: 4,
              padding: '1px 6px', color: '#5C5750',
            }}>{badge}</span>
          )}
        </div>
        <span style={{
          fontSize: 18, color: '#948E87', display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms cubic-bezier(0.2, 0, 0.8, 1)',
          flexShrink: 0, lineHeight: 1,
        }}>▾</span>
      </button>

      <div
        ref={contentRef}
        style={{
          height: height === 'auto' ? 'auto' : `${height}px`,
          overflow: 'hidden',
          transition: 'height 200ms cubic-bezier(0.2, 0, 0.8, 1)',
        }}
      >
        <div style={{ padding: '0 16px 16px', borderTop: '0.5px solid #D6D1C8' }}>
          <div style={{ paddingTop: 14 }}>{children}</div>
        </div>
      </div>
    </div>
  )
}
