import React, { useState } from 'react'

const MONTHLY_DATA = [
  { month: 'Oct', shipments: 4200, delivered: 3900, rto: 300  },
  { month: 'Nov', shipments: 5100, delivered: 4750, rto: 350  },
  { month: 'Dec', shipments: 7800, delivered: 7200, rto: 600  },
  { month: 'Jan', shipments: 5500, delivered: 5100, rto: 400  },
  { month: 'Feb', shipments: 4900, delivered: 4600, rto: 300  },
  { month: 'Mar', shipments: 6200, delivered: 5900, rto: 300  },
]

const COURIER_PERF = [
  { courier: 'Blue Dart',       successRate: 96.2, avgDays: 1.2, rtoRate: 3.8,  searches: 1420 },
  { courier: 'Delhivery',       successRate: 93.8, avgDays: 2.1, rtoRate: 6.2,  searches: 2100 },
  { courier: 'DTDC',            successRate: 91.5, avgDays: 2.4, rtoRate: 8.5,  searches: 980  },
  { courier: 'Ekart Logistics', successRate: 89.3, avgDays: 2.8, rtoRate: 10.7, searches: 750  },
  { courier: 'FedEx',           successRate: 97.1, avgDays: 1.0, rtoRate: 2.9,  searches: 610  },
  { courier: 'Xpressbees',      successRate: 92.4, avgDays: 2.2, rtoRate: 7.6,  searches: 870  },
]

const maxShipments = Math.max(...MONTHLY_DATA.map(d => d.shipments))

export default function Reports() {
  const [tab, setTab] = useState('overview')

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Reports</h1>
        <p className="text-sm text-gray-500">Shipment analytics, courier performance, and delivery trends.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-surface-100 rounded-xl w-fit mb-6 border border-[#e5e8f0]">
        {[
          { key: 'overview',     label: 'Overview'     },
          { key: 'performance',  label: 'Performance'  },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === t.key
                ? 'bg-white shadow-soft text-brand-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="animate-fade-in space-y-6">
          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Shipments',  value: '33,700', delta: '+12%', up: true,  color: 'text-brand-600' },
              { label: 'Delivered',        value: '31,450', delta: '+14%', up: true,  color: 'text-emerald-600' },
              { label: 'RTO',              value: '2,250',  delta: '-8%',  up: false, color: 'text-rose-600' },
              { label: 'Success Rate',     value: '93.3%',  delta: '+1.2%',up: true,  color: 'text-blue-600' },
            ].map((s, i) => (
              <div key={s.label} className="glass-dark rounded-2xl shadow-card border border-white/60 p-5 animate-slide-up" style={{ animationDelay: `${i*60}ms` }}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${s.up ? 'text-emerald-600' : 'text-rose-500'}`}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d={s.up ? "M5 8V2M2 5l3-3 3 3" : "M5 2v6M2 5l3 3 3-3"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {s.delta} vs last 6 mo
                </span>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="glass-dark rounded-2xl shadow-card border border-white/60 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-5">Monthly Shipment Volume</h2>
            <div className="flex items-end gap-3 h-40">
              {MONTHLY_DATA.map((d, i) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5 animate-slide-up" style={{ animationDelay: `${i*60}ms` }}>
                  <span className="text-xs font-bold text-gray-700">{(d.shipments/1000).toFixed(1)}k</span>
                  <div className="w-full rounded-t-lg overflow-hidden bg-surface-200 relative" style={{ height: 120 }}>
                    {/* Delivered bar */}
                    <div
                      className="absolute bottom-0 w-full bg-brand-500 rounded-t-lg transition-all duration-700"
                      style={{ height: `${(d.delivered/maxShipments)*100}%` }}
                    />
                    {/* RTO overlay */}
                    <div
                      className="absolute bottom-0 w-full bg-rose-400 rounded-t-lg opacity-80 transition-all duration-700"
                      style={{ height: `${(d.rto/maxShipments)*100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4">
              <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded bg-brand-500 inline-block"/> Delivered</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded bg-rose-400 inline-block"/> RTO</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'performance' && (
        <div className="glass-dark rounded-2xl shadow-card border border-white/60 overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Courier','Success Rate','Avg Delivery (days)','RTO Rate','Total Searches','Score'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-surface-50 border-b border-[#e5e8f0]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2f8]">
                {COURIER_PERF
                  .slice()
                  .sort((a,b) => b.successRate - a.successRate)
                  .map((row, idx) => (
                    <tr key={row.courier} className="group hover:bg-brand-50/40 transition-colors animate-slide-up" style={{ animationDelay: `${idx*50}ms` }}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-brand-700 text-xs font-bold">{row.courier.slice(0,2).toUpperCase()}</span>
                          </span>
                          <span className="text-sm font-semibold text-gray-800">{row.courier}</span>
                          {idx === 0 && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">Top</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 rounded-full bg-surface-200 w-20 overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${row.successRate}%` }} />
                          </div>
                          <span className="text-sm font-bold text-emerald-600">{row.successRate}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{row.avgDays} days</td>
                      <td className="px-5 py-4 text-sm font-medium text-rose-500">{row.rtoRate}%</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{row.searches.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <svg key={s} width="12" height="12" viewBox="0 0 12 12" fill={s <= Math.round(row.successRate/20) ? '#FF6A00' : '#e5e8f0'}>
                              <path d="M6 1l1.35 2.73L10.5 4.2l-2.25 2.2.53 3.1L6 7.95 3.22 9.5l.53-3.1L1.5 4.2l3.15-.47z"/>
                            </svg>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
