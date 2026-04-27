import React, { useState, useEffect } from 'react'
import ToggleSwitch from './ToggleSwitch'
import EmptyState from './EmptyState'

/**
 * Skeleton row shown while data is loading.
 */
function SkeletonRow() {
  const cell = 'h-4 animate-skeleton rounded bg-[#e8edf4]'
  return (
    <tr>
      <td className="px-4 py-4"><div className={`${cell} w-24`} /></td>
      <td className="px-4 py-4"><div className={`${cell} w-32`} /></td>
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-4 text-center">
          <div className={`${cell} mx-auto w-10 rounded-full`} style={{ height: 20 }} />
        </td>
      ))}
      <td className="px-4 py-4 text-center"><div className={`${cell} mx-auto w-6`} /></td>
    </tr>
  )
}

/**
 * Zone badge with colour mapped to zone letter.
 */
const ZONE_COLORS = {
  A: 'bg-emerald-100 text-emerald-700',
  B: 'bg-blue-100   text-blue-700',
  C: 'bg-amber-100  text-amber-700',
  D: 'bg-purple-100 text-purple-700',
  E: 'bg-rose-100   text-rose-700',
}

function ZoneBadge({ zone }) {
  const cls = ZONE_COLORS[zone] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex h-6 w-6 items-center justify-center rounded text-[10px] font-semibold ${cls}`}>
      {zone}
    </span>
  )
}

const TOGGLE_COLS = ['pickup', 'reverse', 'prepaid', 'cod', 'ndd']

/**
 * ResultsTable — shows serviceability rows with interactive toggles.
 */
export default function ResultsTable({ data, loading }) {
  // Per-cell toggle state: keyed by `${rowId}-${col}`
  const [toggles, setToggles] = useState({})

  // Initialise toggles whenever data changes
  useEffect(() => {
    const initial = {}
    data.forEach(row => {
      TOGGLE_COLS.forEach(col => {
        initial[`${row.id}-${col}`] = row[col]
      })
    })
    setToggles(initial)
  }, [data])

  const handleToggle = (rowId, col, val) => {
    setToggles(prev => ({ ...prev, [`${rowId}-${col}`]: val }))
  }

  const thClass = 'bg-[#f6f8fb] px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8b94a3] border-b border-[#e7ebf2]'
  const thCenter = thClass.replace('text-left', 'text-center')

  return (
    <div className="overflow-hidden rounded-[8px] border border-[#e6eaf1] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={thClass}>Courier</th>
              <th className={thClass}>Destination</th>
              <th className={thCenter}>Pickup</th>
              <th className={thCenter}>Reverse</th>
              <th className={thCenter}>Prepaid</th>
              <th className={thCenter}>COD</th>
              <th className={thCenter}>NDD</th>
              <th className={thCenter}>Zone</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#edf1f6]">
            {loading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

            {!loading && data.length > 0 && data.map((row, idx) => (
              <tr
                key={row.id}
                className="animate-slide-up transition-colors duration-150 hover:bg-[#fafbfe]"
                style={{ animationDelay: `${idx * 45}ms` }}
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#fff2ea]">
                      <span className="text-[10px] font-bold text-[#ef6a23]">
                        {row.courier.slice(0, 2).toUpperCase()}
                      </span>
                    </span>
                    <span className="text-[13px] font-semibold text-[#1f2937]">
                      {row.courier}
                    </span>
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 text-[13px] text-[#4b5563]">
                  {row.destination}
                </td>

                {TOGGLE_COLS.map(col => (
                  <td key={col} className="px-4 py-3.5 text-center">
                    <div className="flex justify-center">
                      <ToggleSwitch
                        checked={!!toggles[`${row.id}-${col}`]}
                        onChange={val => handleToggle(row.id, col, val)}
                      />
                    </div>
                  </td>
                ))}

                <td className="px-4 py-3.5 text-center">
                  <ZoneBadge zone={row.zone} />
                </td>
              </tr>
            ))}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <EmptyState />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
