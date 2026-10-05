import React from 'react'

const ZONE_LANDMARKS = {
  Z21: 'MG Road – Central Market',
  Z23: 'Shastri Nagar – Metro Station',
  Z25: 'Lake View – City Mall',
  Z19: 'Madhav Puram',
  Z1: 'Tech Park',
  Z12: 'Pune Central',
  Z14: 'Khadki',
  Z15: 'Koregaon Park',
  Z18: 'Swargate',
  Z24: 'Hadapsar',
}

// Real archival events derived from data/complaints.json
const HISTORICAL_EVENTS = [
  {
    event_id: 'HIST-001',
    complaint_id: 'CMP0006',
    timestamp: '09 Aug 13:37',
    title: 'Predictive Alert Dispatched: High Cash-Out Risk (Zone Z25)',
    detail: 'Lake View – City Mall · NET4 syndicate cluster match · Score 73/100',
    status: 'CRITICAL ALERT',
    statusClass: 'status-critical',
  },
  {
    event_id: 'HIST-002',
    complaint_id: 'CMP0001',
    timestamp: '22 Aug 04:13',
    title: 'Network Match Correlated: NET1 Mule Syndicate',
    detail: 'Layering across ICICI -> HDFC -> Axis · ₹60,000 fraud debit traced to Z21',
    status: 'MATCHED',
    statusClass: 'status-matched',
  },
  {
    event_id: 'HIST-003',
    complaint_id: 'CMP0002',
    timestamp: '05 Aug 08:34',
    title: 'Cash-Out Confirmed: Terminal OTC Withdrawal in Z23',
    detail: 'Shastri Nagar – Metro Station · ₹42,000 confirmed withdrawal in forecast window',
    status: 'CONFIRMED',
    statusClass: 'status-confirmed',
  },
  {
    event_id: 'HIST-004',
    complaint_id: 'CMP0003',
    timestamp: '11 Aug 10:32',
    title: 'Multi-Hop Chain Traced: 2 Layering Hops Mapped',
    detail: 'Mule routing isolated in Z15 Koregaon Park · Terminal account flagged',
    status: 'TRACED',
    statusClass: 'status-traced',
  },
  {
    event_id: 'HIST-005',
    complaint_id: 'CMP0018',
    timestamp: '12 Aug 11:20',
    title: 'ML Predictive Shortlist: Top Risk Zone Z23 Ranked',
    detail: 'Novel pattern analysis · Distance & velocity model scored 56.1/100',
    status: 'CONFIRMED',
    statusClass: 'status-confirmed',
  },
  {
    event_id: 'HIST-006',
    complaint_id: 'CMP0004',
    timestamp: '09 Aug 22:18',
    title: 'Complaint Registered: High-Velocity Rapid Layering',
    detail: 'Victim reporting ₹90,000 fraud debit · Zone Z23 source · Priority 1',
    status: 'REGISTERED',
    statusClass: 'status-registered',
  },
  {
    event_id: 'HIST-007',
    complaint_id: 'CMP0005',
    timestamp: '06 Aug 04:16',
    title: 'Syndicate Activity Flagged: NET6 Cluster Monitored',
    detail: 'Target zone Z18 Swargate · Pre-emptive surveillance alert issued',
    status: 'MATCHED',
    statusClass: 'status-matched',
  },
  {
    event_id: 'HIST-008',
    complaint_id: 'CMP0008',
    timestamp: '01 Aug 19:19',
    title: 'Cash-Out Confirmed: Terminal Withdrawal in Z13',
    detail: '₹90,000 cash-out confirmed · Matched historical velocity window',
    status: 'CONFIRMED',
    statusClass: 'status-confirmed',
  },
]

export default function CaseLog({ cases = [], onSelect, selectedId }) {
  // Generate real-time investigation events for active session cases
  const activeEvents = []

  cases.forEach((c) => {
    const topZone = c.zone_risks?.[0]
    const zoneId = topZone?.zone_id || 'Z21'
    const zoneName = ZONE_LANDMARKS[zoneId] || `Zone ${zoneId}`
    const risk = Math.round(topZone?.risk_score || 0)
    const confidence = Math.round((c.confidence || 0) * 100)
    const isNetwork = c.match_type === 'known_network'

    // 1. Predictive Alert Dispatched
    activeEvents.push({
      event_id: `ACT-${c.complaint_id}-ALERT`,
      complaint_id: c.complaint_id,
      timestamp: 'LIVE · JUST NOW',
      title: `Predictive Alert Dispatched: ${zoneName} (${zoneId})`,
      detail: `Risk Score: ${risk}/100 · Window: ${topZone?.predicted_time_window || 'Imminent'} · Confidence: ${confidence}%`,
      status: risk >= 70 ? 'CRITICAL ALERT' : 'MATCHED',
      statusClass: risk >= 70 ? 'status-critical' : 'status-matched',
    })

    // 2. Network Match / ML Forecast
    activeEvents.push({
      event_id: `ACT-${c.complaint_id}-NET`,
      complaint_id: c.complaint_id,
      timestamp: 'LIVE · PROCESSED',
      title: isNetwork
        ? `Syndicate Correlated: ${c.network_id} Account Cluster`
        : 'ML Spatial Model: Novel Cybercrime Pattern Analyzed',
      detail: c.explanation_summary || 'Forensic multi-hop graph and behavioral analysis completed.',
      status: isNetwork ? 'MATCHED' : 'TRACED',
      statusClass: isNetwork ? 'status-matched' : 'status-traced',
    })

    // 3. Multi-Hop Chain Layering Traced
    activeEvents.push({
      event_id: `ACT-${c.complaint_id}-CHAIN`,
      complaint_id: c.complaint_id,
      timestamp: 'LIVE · TRACED',
      title: 'Multi-Hop Flow Traced: Layering Sequence Mapped',
      detail: 'Transaction path traced from source debit to terminal cash-out account.',
      status: 'TRACED',
      statusClass: 'status-traced',
    })

    // 4. Complaint Registered
    activeEvents.push({
      event_id: `ACT-${c.complaint_id}-REG`,
      complaint_id: c.complaint_id,
      timestamp: 'LIVE · LODGED',
      title: `Complaint Registered: ${c.complaint_id} Intake Processed`,
      detail: 'Victim statement logged · Automated cash-out forecast pipeline initiated.',
      status: 'REGISTERED',
      statusClass: 'status-registered',
    })
  })

  // Combine active session events with historical events
  // Filter out any historical item if the same complaint is already active
  const filteredHistorical = HISTORICAL_EVENTS.filter(
    h => !cases.some(c => c.complaint_id === h.complaint_id)
  )

  const allEvents = [...activeEvents, ...filteredHistorical]

  return (
    <div className="case-log">
      {/* Header */}
      <div className="case-log-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="mono">
            ▸ INVESTIGATION TIMELINE &amp; CASE LOG
          </span>
          <span
            className="mono"
            style={{
              fontSize: '8px',
              color: cases.length > 0 ? '#22c55e' : 'var(--text-dim)',
              letterSpacing: '0.8px',
            }}
          >
            ● {allEvents.length} EVENTS RECORDED {cases.length > 0 ? '· LIVE SYNC' : '· ARCHIVAL READY'}
          </span>
        </div>
      </div>

      {/* Scrollable Timeline List */}
      <div className="timeline-list">
        {allEvents.map((evt) => {
          const isSelected = selectedId === evt.complaint_id

          return (
            <div
              key={evt.event_id}
              className={`timeline-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect?.(evt.complaint_id)}
              title={`Click to load ${evt.complaint_id} into Money Trail and focus map`}
            >
              <div className="timeline-left">
                <span className="timeline-time">{evt.timestamp}</span>
                <span className={`timeline-badge-ref ${isSelected ? 'active-ref' : ''}`}>
                  {evt.complaint_id}
                </span>
                <div className="timeline-content">
                  <div className="timeline-title">{evt.title}</div>
                  <div className="timeline-detail">{evt.detail}</div>
                </div>
              </div>

              <span className={`timeline-status ${evt.statusClass}`}>
                {evt.status}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}