import { useState, Suspense, lazy } from 'react'
import './App.css'

// Lazy load design components
const LighthouseRadical = lazy(() => import('./components/LighthouseRadical'))
const LighthouseUnified = lazy(() => import('./components/LighthouseUnified'))
const LighthouseV5 = lazy(() => import('./components/LighthouseV5'))

const designs = [
  { id: 'radical', name: 'Radical Design', desc: 'Make.com inspired — no sidebar, icon dock, hero typography', Component: LighthouseRadical },
  { id: 'unified', name: 'Unified Explorer', desc: '12 design modes — scrollytelling, bento, glassmorphism, etc.', Component: LighthouseUnified },
  { id: 'v5', name: 'V5 Iteration 3', desc: 'Dashboard, program detail, proctored pre-check flow', Component: LighthouseV5 },
]

function App() {
  const [active, setActive] = useState(null)

  if (active) {
    const { Component } = designs.find(d => d.id === active)
    return (
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <button
          onClick={() => setActive(null)}
          style={{
            position: 'fixed',
            top: 8,
            right: 8,
            zIndex: 9999,
            padding: '5px 10px',
            background: 'rgba(0,0,0,0.65)',
            color: 'rgba(255,255,255,0.85)',
            border: '1px dashed rgba(255,255,255,0.3)',
            borderRadius: 4,
            fontFamily: "ui-monospace, 'SF Mono', Monaco, monospace",
            fontWeight: 500,
            fontSize: 11,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            opacity: 0.7,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
        >
          ✕ Exit Preview
        </button>
        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#666' }}>Loading...</div>}>
          <Component />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="preview-menu">
      <h1>Lighthouse Design Preview</h1>
      <p className="subtitle">Select a design to preview</p>
      <div className="design-grid">
        {designs.map(d => (
          <button key={d.id} className="design-card" onClick={() => setActive(d.id)}>
            <h2>{d.name}</h2>
            <p>{d.desc}</p>
            <span className="launch">Launch →</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default App
