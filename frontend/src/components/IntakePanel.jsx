import React, { useState } from 'react'

export default function IntakePanel({
  demoComplaints,
  onSeedDemo,
  onSubmitNew,
  loading,
}) {
  // Prototype filter state
  const [state, setState] = useState('Maharashtra')
  const [district, setDistrict] = useState('Pune')
  const [crimeType, setCrimeType] = useState('All Cybercrimes')
  const [dateRange, setDateRange] = useState('19 May 2025 — 26 May 2025')

  const [riskLevels, setRiskLevels] = useState({
    high: true,
    medium: true,
    low: true,
  })

  // Existing complaint form state
  const [victimZone, setVictimZone] = useState('Z12')
  const [amount, setAmount] = useState(45000)
  const [sourceAccount, setSourceAccount] = useState('ACC90210001')

  const [filtersApplied, setFiltersApplied] = useState(false)

  const toggleRisk = (level) => {
    setRiskLevels(previous => ({
      ...previous,
      [level]: !previous[level],
    }))

    setFiltersApplied(false)
  }

  const resetFilters = () => {
    setState('Maharashtra')
    setDistrict('Pune')
    setCrimeType('All Cybercrimes')
    setDateRange('19 May 2025 — 26 May 2025')

    setRiskLevels({
      high: true,
      medium: true,
      low: true,
    })

    setFiltersApplied(false)
  }

  const applyFilters = () => {
    // Prototype for now.
    // Later this will send the selected filters to App.jsx
    // and filter the real zone/map data.
    setFiltersApplied(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    onSubmitNew({
      victim_zone: victimZone,
      amount: Number(amount),
      source_account: sourceAccount,
      chain: [
        {
          hop_number: 1,
          from_account: sourceAccount,
          to_account:
            'ACC' +
            Math.floor(Math.random() * 90000000 + 10000000),
          bank: 'HDFC',
          amount_transferred: Number(amount) * 0.95,
        },
      ],
    })
  }

  return (
    <div className="filter-panel">

      {/* =====================================================
          FILTER HEADER
      ===================================================== */}

      <div className="filter-panel-header">

        <div className="filter-title">
          <span className="filter-symbol">▼</span>
          <h2>Filters</h2>
        </div>

        <button
          type="button"
          className="reset-filters"
          onClick={resetFilters}
        >
          ↻ Reset All
        </button>

      </div>


      {/* =====================================================
          STATE
      ===================================================== */}

      <div className="filter-field">

        <label>State</label>

        <select
          value={state}
          onChange={e => {
            setState(e.target.value)
            setFiltersApplied(false)
          }}
        >
          <option>Maharashtra</option>
          <option>Gujarat</option>
          <option>Karnataka</option>
          <option>Delhi</option>
          <option>Telangana</option>
        </select>

      </div>


      {/* =====================================================
          DISTRICT
      ===================================================== */}

      <div className="filter-field">

        <label>District</label>

        <select
          value={district}
          onChange={e => {
            setDistrict(e.target.value)
            setFiltersApplied(false)
          }}
        >
          <option>Pune</option>
          <option>Mumbai</option>
          <option>Nashik</option>
          <option>Nagpur</option>
          <option>Thane</option>
        </select>

      </div>


      {/* =====================================================
          CRIME TYPE
      ===================================================== */}

      <div className="filter-field">

        <label>Crime Type</label>

        <select
          value={crimeType}
          onChange={e => {
            setCrimeType(e.target.value)
            setFiltersApplied(false)
          }}
        >
          <option>All Cybercrimes</option>
          <option>UPI Fraud</option>
          <option>Online Shopping Fraud</option>
          <option>Social Media Impersonation</option>
          <option>Investment Fraud</option>
          <option>Phishing</option>
        </select>

      </div>


      {/* =====================================================
          DATE RANGE
      ===================================================== */}

      <div className="filter-field">

        <label>Date Range</label>

        <div className="date-input">

          <span className="calendar-icon">▣</span>

          <input
            type="text"
            value={dateRange}
            onChange={e => {
              setDateRange(e.target.value)
              setFiltersApplied(false)
            }}
          />

        </div>

      </div>


      {/* =====================================================
          RISK LEVEL
      ===================================================== */}

      <div className="risk-filter">

        <label>Risk Level</label>

        <div className="risk-option">

          <input
            type="checkbox"
            checked={
              riskLevels.high &&
              riskLevels.medium &&
              riskLevels.low
            }
            onChange={() => {
              const allSelected =
                riskLevels.high &&
                riskLevels.medium &&
                riskLevels.low

              setRiskLevels({
                high: !allSelected,
                medium: !allSelected,
                low: !allSelected,
              })

              setFiltersApplied(false)
            }}
          />

          <span>All Levels</span>

        </div>


        <div className="risk-option">

          <input
            type="checkbox"
            checked={riskLevels.high}
            onChange={() => toggleRisk('high')}
          />

          <span className="risk-high-text">
            High
          </span>

        </div>


        <div className="risk-option">

          <input
            type="checkbox"
            checked={riskLevels.medium}
            onChange={() => toggleRisk('medium')}
          />

          <span className="risk-medium-text">
            Medium
          </span>

        </div>


        <div className="risk-option">

          <input
            type="checkbox"
            checked={riskLevels.low}
            onChange={() => toggleRisk('low')}
          />

          <span className="risk-low-text">
            Low
          </span>

        </div>

      </div>


      {/* =====================================================
          APPLY FILTERS
      ===================================================== */}

      <button
        type="button"
        className="apply-filters"
        onClick={applyFilters}
      >
        <span>
          {filtersApplied
            ? 'FILTERS APPLIED'
            : 'APPLY FILTERS'}
        </span>

        <strong>→</strong>
      </button>


      {/* =====================================================
          PROTOTYPE STATUS
      ===================================================== */}

      {filtersApplied && (
        <div className="filter-status">
          Showing prototype risk data for{' '}
          <strong>
            {district}, {state}
          </strong>
        </div>
      )}


      {/* =====================================================
          COMPLAINT TOOLS
          Existing functionality preserved.
      ===================================================== */}

      <details className="complaint-tools">

        <summary>
          <span>▸</span>
          Complaint Tools
        </summary>


        {/* QUICK DEMO */}

        <div className="complaint-section">

          <div className="complaint-heading">
            QUICK DEMO SCENARIOS
          </div>

          <div className="demo-list">

            {demoComplaints?.known_network_examples
              ?.slice(0, 2)
              .map(id => (
                <button
                  key={id}
                  onClick={() => onSeedDemo(id)}
                  disabled={loading}
                  className="demo-button known"
                >
                  ▶ Replay {id}
                  <span> · known network</span>
                </button>
              ))}

            {demoComplaints?.novel_examples
              ?.slice(0, 2)
              .map(id => (
                <button
                  key={id}
                  onClick={() => onSeedDemo(id)}
                  disabled={loading}
                  className="demo-button novel"
                >
                  ▶ Replay {id}
                  <span> · novel pattern</span>
                </button>
              ))}

          </div>

        </div>


        {/* NEW COMPLAINT */}

        <div className="complaint-section">

          <div className="complaint-heading">
            FILE NEW COMPLAINT
          </div>

          <form onSubmit={handleSubmit}>

            <label>Victim Zone</label>

            <input
              value={victimZone}
              onChange={e =>
                setVictimZone(e.target.value)
              }
              placeholder="Z12"
            />


            <label>Amount (₹)</label>

            <input
              type="number"
              value={amount}
              onChange={e =>
                setAmount(e.target.value)
              }
            />


            <label>Source Account</label>

            <input
              value={sourceAccount}
              onChange={e =>
                setSourceAccount(e.target.value)
              }
            />


            <button
              type="submit"
              disabled={loading}
              className="submit-complaint"
            >
              {loading
                ? 'ANALYZING…'
                : 'SUBMIT & FORECAST'}
            </button>

          </form>

        </div>

      </details>

    </div>
  )
}