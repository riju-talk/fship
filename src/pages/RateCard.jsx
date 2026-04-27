import React, { useState } from 'react'

const RATE_DATA = [
  { courier: 'Blue Dart',      surface: 45, air: 75, cod: 30, rto: 40, minWeight: 0.5, maxWeight: 50 },
  { courier: 'Delhivery',      surface: 38, air: 62, cod: 25, rto: 35, minWeight: 0.5, maxWeight: 100 },
  { courier: 'DTDC',           surface: 35, air: 58, cod: 28, rto: 38, minWeight: 0.5, maxWeight: 70 },
  { courier: 'Ekart Logistics',surface: 32, air: 55, cod: 22, rto: 30, minWeight: 0.5, maxWeight: 30 },
  { courier: 'FedEx',          surface: 60, air: 95, cod: 40, rto: 50, minWeight: 0.5, maxWeight: 70 },
  { courier: 'Xpressbees',     surface: 36, air: 60, cod: 24, rto: 32, minWeight: 0.5, maxWeight: 50 },
  { courier: 'Ecom Express',   surface: 34, air: 56, cod: 26, rto: 34, minWeight: 0.5, maxWeight: 40 },
  { courier: 'Shadowfax',      surface: 30, air: 52, cod: 20, rto: 28, minWeight: 0.5, maxWeight: 25 },
]

export default function RateCard() {
  const [weight, setWeight] = useState('1')
  const [mode, setMode]     = useState('surface')

  const wt = parseFloat(weight) || 1

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Rate Card</h1>
        <p className="text-sm text-gray-500">Compare shipping rates across couriers for your shipment weight.</p>
      </div>

      {/* Filters */}
      <div className="glass-dark rounded-2xl shadow-card border border-white/60 p-5 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Shipment Weight (kg)</label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className="w-36 bg-white border border-[#e5e8f0] rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Express Type</label>
          <div className="flex rounded-xl overflow-hidden border border-[#e5e8f0] bg-white">
            {['surface','air'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors ${
                  mode === m
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-600 hover:bg-surface-100'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-dark rounded-2xl shadow-card border border-white/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Courier','Rate / kg (₹)','COD Charge (₹)','RTO Charge (₹)','Min Wt (kg)','Max Wt (kg)','Total Estimate (₹)'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-surface-50 border-b border-[#e5e8f0]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2f8]">
              {RATE_DATA
                .slice()
                .sort((a, b) => a[mode] - b[mode])
                .map((row, idx) => {
                  const rate      = row[mode]
                  const total     = Math.round(rate * wt + row.cod)
                  const cheapest  = idx === 0
                  return (
                    <tr key={row.courier} className={`group hover:bg-brand-50/40 transition-colors duration-150 animate-slide-up ${cheapest ? 'bg-emerald-50/40' : ''}`} style={{ animationDelay: `${idx * 40}ms` }}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-brand-700 text-xs font-bold">{row.courier.slice(0,2).toUpperCase()}</span>
                          </span>
                          <span className="text-sm font-semibold text-gray-800">{row.courier}</span>
                          {cheapest && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">Best</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-800">₹{rate}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">₹{row.cod}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">₹{row.rto}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{row.minWeight}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{row.maxWeight}</td>
                      <td className="px-5 py-4 text-sm font-bold text-brand-600">₹{total}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[#f0f2f8]">
          <p className="text-xs text-gray-400">Rates are indicative and per kg. Actual rates may vary. Sorted by lowest rate.</p>
        </div>
      </div>
    </div>
  )
}
