import React from 'react'

function riskColor(score) {
  if (score >= 70) return 'var(--risk-critical)'
  if (score >= 45) return 'var(--risk-high)'
  if (score >= 20) return 'var(--risk-med)'
  if (score > 0) return 'var(--risk-low)'
  return 'var(--border)'
}

function riskLabel(score) {
  if (score >= 70) return 'CRITICAL'
  if (score >= 45) return 'HIGH'
  if (score >= 20) return 'ELEVATED'
  if (score > 0) return 'LOW'
  return 'BASELINE'
}

export default function ZoneGrid({ zones, selectedZone, onSelectZone }) {
  const maxRisk = Math.max(0, ...zones.map(z => z.current_risk))

  // build a 5x5 grid keyed by row/col
  const grid = Array.from({ length: 5 }, () => Array(5).fill(null))
  zones.forEach(z => {
    if (z.row < 5 && z.col < 5) grid[z.row][z.col] = z
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1 }}>
          ZONE RISK GRID — 25 SECTORS
        </span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
          N ↑
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 6,
          background: 'var(--bg-void)',
          padding: 12,
          borderRadius: 6,
          border: '1px solid var(--border)',
        }}
      >
        {grid.flat().map((z, i) => {
          if (!z) return <div key={i} />
          const isMax = z.current_risk === maxRisk && maxRisk > 0
          const isSelected = selectedZone === z.zone_id
          return (
            <button
              key={z.zone_id}
              onClick={() => onSelectZone(z.zone_id)}
              title={`${z.zone_id} — ${z.label}`}
              style={{
                aspectRatio: '1',
                border: isSelected ? '2px solid var(--amber)' : '1px solid var(--border-bright)',
                borderRadius: 4,
                background: 'var(--bg-panel-raised)',
                color: 'var(--text-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: 0,
                animation: isMax ? 'pulse-glow 1.8s ease-in-out infinite' : 'none',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: riskColor(z.current_risk),
                  marginBottom: 4,
                }}
              />
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {z.zone_id}
              </span>
              {z.current_risk > 0 && (
                <span className="mono" style={{ fontSize: 9, color: riskColor(z.current_risk), fontWeight: 600 }}>
                  {Math.round(z.current_risk)}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 16, fontSize: 10, color: 'var(--text-dim)' }} className="mono">
        <LegendDot color="var(--border)" label="BASELINE" />
        <LegendDot color="var(--risk-low)" label="LOW" />
        <LegendDot color="var(--risk-med)" label="ELEVATED" />
        <LegendDot color="var(--risk-high)" label="HIGH" />
        <LegendDot color="var(--risk-critical)" label="CRITICAL" />
      </div>
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
      {label}
    </div>
  )
}

export { riskColor, riskLabel }
