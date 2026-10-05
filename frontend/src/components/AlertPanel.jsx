import React from 'react'

const ZONE_METADATA = {
  Z21: {
    label: 'MG Road – Central Market',
    area: 'Pune Central',
    window: '6 – 12 hours',
    baseRisk: 87,
    cases: 8,
    explanation: 'Multiple fraud complaints with linked UPI-to-cash-out patterns detected near ATM cluster.',
    action: 'Increase patrolling near ATMs and coordinate with banks for enhanced monitoring.',
  },
  Z23: {
    label: 'Shastri Nagar – Metro Station',
    area: 'Pune',
    window: '12 – 24 hours',
    baseRisk: 73,
    cases: 5,
    explanation: 'Spike in mule account activity and OTC withdrawal patterns.',
    action: 'Deploy cyber patrol unit and monitor high-value withdrawals.',
  },
  Z25: {
    label: 'Lake View – City Mall',
    area: 'Pune',
    window: '6 – 24 hours',
    baseRisk: 68,
    cases: 4,
    explanation: 'Cluster of e-commerce fraud complaints with probable cash-out indicators.',
    action: 'Share alert with local police station and increase surveillance.',
  },
  Z19: {
    label: 'Madhav Puram',
    area: 'Pune South',
    window: '24 – 48 hours',
    baseRisk: 55,
    cases: 3,
    explanation: 'Secondary withdrawal zone linked to mule account cluster routing.',
    action: 'Place bank branches on watch and monitor off-peak ATM activity.',
  },
  Z1: {
    label: 'Tech Park',
    area: 'Pune West',
    window: '24 – 48 hours',
    baseRisk: 48,
    cases: 2,
    explanation: 'Low-velocity phishing transaction hops terminating in local accounts.',
    action: 'Flag accounts with sudden transaction spikes for KYC audit.',
  },
}

function getRiskLevel(score) {
  if (score >= 75) return 'CRITICAL'
  if (score >= 50) return 'HIGH'
  if (score >= 25) return 'MEDIUM'
  return 'LOW'
}

function getRiskClass(level) {
  if (level === 'CRITICAL') return 'alert-critical'
  if (level === 'HIGH') return 'alert-high'
  if (level === 'MEDIUM') return 'alert-medium'
  return 'alert-low'
}

function getRiskIcon(level) {
  if (level === 'CRITICAL') return '◆'
  if (level === 'HIGH') return '▲'
  if (level === 'MEDIUM') return '●'
  return '●'
}

export default function AlertPanel({
  analysis,
  zones = [],
  selectedZone,
  onSelectZone,
}) {
  let alerts = []

  if (analysis?.zone_risks && analysis.zone_risks.length > 0) {
    alerts = analysis.zone_risks.map(item => {
      const zoneId = item.zone_id
      const meta = ZONE_METADATA[zoneId] || {}
      const zoneApi = zones.find(z => z.zone_id === zoneId)
      const risk = Math.round(Number(item.risk_score) || meta.baseRisk || 50)
      const level = getRiskLevel(risk)
      const confidence = analysis.confidence ? Math.round(analysis.confidence * 100) : 85

      const matchedReason = analysis.explanation_reasons?.find(r => r.includes(zoneId))
      const explanation = matchedReason || analysis.explanation_summary || meta.explanation || 'Predicted cash-out pattern detected based on active case.'

      return {
        zone_id: zoneId,
        label: meta.label || zoneApi?.label || `Zone ${zoneId}`,
        area: meta.area || 'Pune',
        risk,
        level,
        confidence,
        window: item.predicted_time_window || meta.window || '6 – 24 hours',
        cases: zoneApi?.related_active_cases || meta.cases || 1,
        explanation,
        action: meta.action || (risk >= 70 ? 'Deploy immediate cyber patrol and coordinate with local bank branches.' : 'Monitor ATM withdrawal velocity and flag mule account activity.'),
      }
    })
  } else {
    alerts = ['Z21', 'Z23', 'Z25'].map(zoneId => {
      const meta = ZONE_METADATA[zoneId]
      const zoneApi = zones.find(z => z.zone_id === zoneId)
      const risk = zoneApi?.current_risk && Number(zoneApi.current_risk) > 0
        ? Math.round(Number(zoneApi.current_risk))
        : meta.baseRisk
      const level = getRiskLevel(risk)
      const confidence = risk >= 80 ? 88 : risk >= 70 ? 82 : 76

      return {
        zone_id: zoneId,
        label: meta.label,
        area: meta.area,
        risk,
        level,
        confidence,
        window: meta.window,
        cases: zoneApi?.related_active_cases || meta.cases,
        explanation: meta.explanation,
        action: meta.action,
      }
    })
  }

  return (
    <div className="intelligence-feed">
      {/* FEED HEADER */}
      <div className="feed-header">
        <div className="feed-header-left">
          <span className="feed-pulse" />
          <h2>PREDICTIVE INTELLIGENCE FEED</h2>
        </div>
        <span className="feed-count">{alerts.length}</span>
      </div>

      {/* ALERT LIST */}
      <div className="alert-list">
        {alerts.map(alert => {
          const selected = selectedZone === alert.zone_id
          const riskClass = getRiskClass(alert.level)

          return (
            <button
              key={alert.zone_id}
              type="button"
              className={`intelligence-card ${riskClass} ${selected ? 'selected' : ''}`}
              onClick={() => onSelectZone?.(alert.zone_id)}
            >
              {/* TOP ROW: Risk badge + Zone ID + Risk Score & Confidence */}
              <div className="alert-top-row">
                <div className="alert-badges">
                  <span className={`risk-badge ${riskClass}`}>
                    <span className="risk-badge-icon">{getRiskIcon(alert.level)}</span>
                    {alert.level}
                  </span>
                  <span className="zone-tag">{alert.zone_id}</span>
                </div>

                <div className="alert-score-group">
                  <div className="alert-score-num">
                    <strong>{alert.risk}</strong>
                    <small>/100</small>
                  </div>
                  <span className="alert-confidence">{alert.confidence}% conf</span>
                </div>
              </div>

              {/* LOCATION ROW: Location Name + Related Active Cases */}
              <div className="alert-location-row">
                <div className="alert-location-title">
                  <span className="location-pin-dot">●</span>
                  <strong>{alert.label}</strong>
                </div>
                <span className="alert-cases-badge">{alert.cases} active cases</span>
              </div>

              {/* TIME WINDOW ROW: Predicted Cash-Out Time Window */}
              <div className="alert-window-row">
                <span className="time-icon">◷</span>
                <span className="window-label">Cash-Out Window:</span>
                <strong className="window-time">{alert.window}</strong>
              </div>

              {/* EXPLANATION: Plain English reasoning why area is risky */}
              <p className="alert-explanation" title={alert.explanation}>
                {alert.explanation}
              </p>

              {/* RECOMMENDED ACTION */}
              {alert.action && (
                <div className="alert-action-row" title={alert.action}>
                  <span className="action-icon">✚</span>
                  <span className="action-text">{alert.action}</span>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}