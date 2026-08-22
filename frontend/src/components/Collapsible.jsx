import React, { useState, useRef, useEffect } from 'react'

/**
 * Animated collapsible section with smooth height transition.
 * After opening, height is set to "auto" to handle dynamic content resize.
 */
export default function Collapsible({ title, defaultOpen = false, children, badge }) {
  const [open, setOpen]     = useState(defaultOpen)
  const contentRef          = useRef(null)
  const [height, setHeight] = useState(defaultOpen ? 'auto' : 0)

  useEffect(() => {
    if (open) {
      const h = contentRef.current?.scrollHeight || 0
      setHeight(h)
      const t = setTimeout(() => setHeight('auto'), 210)
      return () => clearTimeout(t)
    } else {
      // Snap from auto → px, then animate to 0
      const h = contentRef.current?.scrollHeight || 0
      setHeight(h)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0))
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <div className="v-card no-hover" style={{ overflow: 'hidden' }}>
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          gap: 8,
          textAlign: 'left',
          outline: 'none',
        }}
        onFocus={e  => { e.currentTarget.style.outline = '2px solid #1D9E75' }}
        onBlur={e   => { e.currentTarget.style.outline = 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#2C2C2A' }}>
            {title}
          </span>
          {badge && (
            <span style={{
              fontSize: 11,
              background: '#F1EFE8',
              border: '0.5px solid #D3D1C7',
              borderRadius: 4,
              padding: '1px 6px',
              color: '#5F5E5A',
            }}>
              {badge}
            </span>
          )}
        </div>

        {/* Rotating chevron */}
        <span style={{
          fontSize: 18,
          color: '#9B9A96',
          display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms cubic-bezier(0.2, 0, 0.8, 1)',
          flexShrink: 0,
          lineHeight: 1,
        }}>
          ▾
        </span>
      </button>

      {/* Animated content area */}
      <div
        ref={contentRef}
        style={{
          height: height === 'auto' ? 'auto' : `${height}px`,
          overflow: 'hidden',
          transition: 'height 200ms cubic-bezier(0.2, 0, 0.8, 1)',
        }}
      >
        <div style={{ padding: '0 16px 16px', borderTop: '0.5px solid #D3D1C7' }}>
          <div style={{ paddingTop: 14 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
