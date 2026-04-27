import React, { useState } from 'react'

const COVERAGE_DATA = [
  { courier: 'Blue Dart',       totalPincodes: 18200, states: 28, tier1: true,  tier2: true,  tier3: false, cod: true,  ndd: true  },
  { courier: 'Delhivery',       totalPincodes: 17800, states: 28, tier1: true,  tier2: true,  tier3: true,  cod: true,  ndd: false },
  { courier: 'DTDC',            totalPincodes: 16500, states: 27, tier1: true,  tier2: true,  tier3: true,  cod: true,  ndd: false },
  { courier: 'Ekart Logistics', totalPincodes: 15000, states: 25, tier1: true,  tier2: true,  tier3: false, cod: true,  ndd: false },
  { courier: 'FedEx',           totalPincodes: 12000, states: 22, tier1: true,  tier2: false, tier3: false, cod: false, ndd: true  },
  { courier: 'Xpressbees',      totalPincodes: 14500, states: 26, tier1: true,  tier2: true,  tier3: true,  cod: true,  ndd: false },
  { courier: 'Ecom Express',    totalPincodes: 13800, states: 24, tier1: true,  tier2: true,  tier3: false, cod: true,  ndd: false },
  { courier: 'Shadowfax',       totalPincodes: 10200, states: 20, tier1: true,  tier2: true,  tier3: false, cod: true,  ndd: false },
]

function Tick({ yes }) {
  return yes
    ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </span>
    : <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
      </span>
}

export default function Coverage() {
  const [search, setSearch] = useState('')

  const filtered = COVERAGE_DATA.filter(r =>
    r.courier.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Coverage Map</h1>
        <p className="text-sm text-gray-500">View pincode coverage and tier-wise availability for each courier.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Couriers',    value: COVERAGE_DATA.length,                        color: 'bg-brand-50 border-brand-200 text-brand-700' },
          { label: 'Max Pincodes',      value: Math.max(...COVERAGE_DATA.map(r=>r.totalPincodes)).toLocaleString(), color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Avg State Coverage',value: Math.round(COVERAGE_DATA.reduce((s,r)=>s+r.states,0)/COVERAGE_DATA.length), color: 'bg-purple-50 border-purple-200 text-purple-700' },
          { label: 'COD Couriers',      value: COVERAGE_DATA.filter(r=>r.cod).length,       color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-2xl border ${s.color} animate-slide-up`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Table */}
      <div className="glass-dark rounded-2xl shadow-card border border-white/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f0f2f8] flex items-center gap-3">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-gray-400 flex-shrink-0">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search courier..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Courier','Total Pincodes','States','Tier 1','Tier 2','Tier 3','COD','NDD'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-surface-50 border-b border-[#e5e8f0]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2f8]">
              {filtered.map((row, idx) => (
                <tr key={row.courier} className="group hover:bg-brand-50/40 transition-colors animate-slide-up" style={{ animationDelay: `${idx*40}ms` }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-700 text-xs font-bold">{row.courier.slice(0,2).toUpperCase()}</span>
                      </span>
                      <span className="text-sm font-semibold text-gray-800">{row.courier}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full bg-surface-200 w-24 overflow-hidden">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${(row.totalPincodes/19000)*100}%` }} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{row.totalPincodes.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 font-medium">{row.states}</td>
                  <td className="px-5 py-4"><Tick yes={row.tier1} /></td>
                  <td className="px-5 py-4"><Tick yes={row.tier2} /></td>
                  <td className="px-5 py-4"><Tick yes={row.tier3} /></td>
                  <td className="px-5 py-4"><Tick yes={row.cod} /></td>
                  <td className="px-5 py-4"><Tick yes={row.ndd} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">No couriers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
