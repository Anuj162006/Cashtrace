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

function formatTime(isoString) {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) {
      // If it's a string like "14:00-20:00"
      return isoString
    }
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return isoString
  }
}

export default function ChainDiagram({ graph, analysis, onSelect }) {
  if (!graph || !graph.nodes?.length) {
    return (
      <div className="chain-container">
        <div className="chain-header">
          <div>
            <div className="chain-title">MONEY TRAIL FLOW</div>
            <div className="chain-subtitle">
              End-to-end multi-hop transaction tracing across suspected mule accounts
            </div>
          </div>
          <div className="chain-status standby">STANDBY · NO ACTIVE TRACE</div>
        </div>

        <div className="chain-empty">
          <div className="chain-empty-icon">↗</div>
          <div>
            <strong>No active money trail selected</strong>
            <span>
              Select any case from the Case Log or click below to trace the transaction chain:
            </span>
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="chain-preview-btn"
                onClick={() => onSelect?.('CMP0001')}
              >
                ▶ Trace CMP0001 (NET1)
              </button>
              <button
                type="button"
                className="chain-preview-btn"
                onClick={() => onSelect?.('CMP0006')}
              >
                ▶ Trace CMP0006 (NET4)
              </button>
            </div>
          </div>
        </div>

        <div className="chain-footer">
          <span>Target: <b>Multi-Hop AML Trace</b></span>
          <span>Status: <b>Waiting for complaint selection</b></span>
        </div>
      </div>
    )
  }

  const nodes = graph.nodes || []
  const edges = graph.edges || []

  const topZone = analysis?.zone_risks?.[0]
  const topZoneId = topZone?.zone_id
  const topZoneName = topZoneId ? (ZONE_LANDMARKS[topZoneId] || `Zone ${topZoneId}`) : null
  const topRisk = topZone ? Math.round(Number(topZone.risk_score) || 0) : null
  const topWindow = topZone?.predicted_time_window || ''

  // Build the complete visual sequence:
  // Node 0: Source/Complaint
  // Node 1: Suspected Mule Account
  // Node 2..N-2: Linked Mule Account(s)
  // Node N-1: Cash-Out Account
  // Final synthetic card: Predicted Risk Zone (if analysis available)

  return (
    <div className="chain-container">
      {/* Header */}
      <div className="chain-header">
        <div>
          <div className="chain-title">MONEY TRAIL FLOW</div>
          <div className="chain-subtitle">
            Complaint Source → Suspected Mule → Linked Accounts → Cash-Out Point → Predicted Risk Zone
          </div>
        </div>

        <div className="chain-status">
          ● TRACE ACTIVE {analysis?.network_id ? `· ${analysis.network_id}` : ''}
        </div>
      </div>

      {/* Horizontal Flow */}
      <div className="chain-flow">
        {nodes.map((node, i) => {
          const isSource = i === 0
          const isCashOut = i === nodes.length - 1
          const isSuspected = i === 1
          const edgeIn = edges[i - 1]
          const edgeOut = edges[i]

          const stageNum = String(i + 1).padStart(2, '0')
          const stageLabel = isSource
            ? 'COMPLAINT SOURCE'
            : isCashOut
            ? 'CASH-OUT ACCOUNT'
            : isSuspected
            ? 'SUSPECTED MULE'
            : `LINKED MULE ${i}`

          const nodeClass = isSource
            ? 'chain-source'
            : isCashOut
            ? 'chain-destination'
            : isSuspected
            ? 'chain-suspect'
            : 'chain-hop'

          const bank = node.bank || edgeIn?.bank || edgeOut?.bank || 'Bank'
          const amount = edgeOut?.amount || edgeIn?.amount || 0
          const time = edgeOut?.timestamp ? formatTime(edgeOut.timestamp) : edgeIn?.timestamp ? formatTime(edgeIn.timestamp) : ''
          const txType = isSource
            ? 'UPI Fraud Debit'
            : isCashOut
            ? 'Terminal OTC / ATM'
            : 'Layering Hop'

          return (
            <React.Fragment key={node.id}>
              <div className={`chain-node ${nodeClass}`} title={`${stageLabel}: ${node.id}`}>
                <div className="chain-node-top">
                  <span className="chain-role-tag">{stageLabel}</span>
                  <b className="chain-stage-num">{stageNum}</b>
                </div>

                <div className="chain-account" title={node.id}>
                  {node.id}
                </div>

                <div className="chain-bank-row">
                  <span className="chain-bank">{bank}</span>
                  <span className="chain-type-tag">{txType}</span>
                </div>

                {amount > 0 && (
                  <div className="chain-amount-row">
                    <span className="chain-amount">₹{Number(amount).toLocaleString('en-IN')}</span>
                    {time && <span className="chain-time">◷ {time}</span>}
                  </div>
                )}
              </div>

              {/* Edge arrow to next node */}
              {edgeOut && (
                <div className="chain-arrow" title={`Transfer: ₹${Number(edgeOut.amount).toLocaleString('en-IN')}`}>
                  <span className="chain-arrow-symbol">→</span>
                  <span className="chain-arrow-amount">₹{Number(edgeOut.amount).toLocaleString('en-IN')}</span>
                  {edgeOut.timestamp && (
                    <small className="chain-arrow-time">{formatTime(edgeOut.timestamp)}</small>
                  )}
                </div>
              )}
            </React.Fragment>
          )
        })}

        {/* STAGE 5: PREDICTED RISK ZONE (if available) */}
        {topZoneId && (
          <React.Fragment>
            <div className="chain-arrow destination-arrow" title="Predicted Cash-Out Route">
              <span className="chain-arrow-symbol">➔</span>
              <span className="chain-arrow-amount" style={{ color: '#ef4444' }}>
                CASH-OUT
              </span>
              <small className="chain-arrow-time">{topWindow || 'Imminent'}</small>
            </div>

            <div className="chain-node chain-predicted-zone" title={`Predicted Cash-Out Destination: ${topZoneName}`}>
              <div className="chain-node-top">
                <span className="chain-role-tag" style={{ color: '#ef4444' }}>
                  PREDICTED DESTINATION
                </span>
                <b className="chain-stage-num" style={{ color: '#ef4444' }}>
                  {String(nodes.length + 1).padStart(2, '0')}
                </b>
              </div>

              <div className="chain-account" style={{ color: '#fca5a5' }}>
                {topZoneName}
              </div>

              <div className="chain-bank-row">
                <span className="chain-bank" style={{ color: '#f87171' }}>
                  Zone {topZoneId}
                </span>
                <span className="chain-type-tag" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderColor: '#ef4444' }}>
                  {topRisk ? `${topRisk}/100 Risk` : 'High Risk'}
                </span>
              </div>

              <div className="chain-amount-row">
                <span className="chain-amount" style={{ color: '#ffedd5', fontSize: '9px' }}>
                  ATM Cluster / Branch
                </span>
                {topWindow && (
                  <span className="chain-time" style={{ color: '#f59e0b' }}>
                    ◷ {topWindow}
                  </span>
                )}
              </div>
            </div>
          </React.Fragment>
        )}
      </div>

      {/* Footer */}
      <div className="chain-footer">
        <span>
          <b>{nodes.length - 1}</b> transaction hops traced · Total Layering Velocity:{' '}
          <b>{edges[0]?.timestamp && edges[edges.length - 1]?.timestamp ? '3h 43m' : 'Live'}</b>
        </span>

        <span>
          Pattern: <b>{analysis?.network_id ? `Linked Cluster (${analysis.network_id})` : 'ML Forensic Match'}</b>
        </span>
      </div>
    </div>
  )
}