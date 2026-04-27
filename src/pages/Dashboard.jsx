import React, { useState, useCallback } from 'react'
import SearchBar from '@/components/SearchBar'
import ResultsTable from '@/components/ResultsTable'
import { checkServiceability } from '@/api'

const DEFAULT_FILTERS = {
  shipmentType: 'forward',
  expressType: 'air',
  sourcePincode: '',
  destPincode: '',
}

const NAV_LINKS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'tracking', label: 'Tracking' },
  { key: 'serviceability', label: 'Serviceability' },
  { key: 'analytics', label: 'Analytics' },
]

const METRIC_CARDS = [
  {
    label: 'Active Couriers',
    value: '12',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="5" cy="4" r="2" stroke="#ef6a23" strokeWidth="1.4" />
        <path d="M1.5 11.5c0-1.85 1.55-3.25 3.5-3.25s3.5 1.4 3.5 3.25" stroke="#ef6a23" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M9.3 4.2h4.2M9.3 7h4.2" stroke="#ef6a23" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Pincodes Covered',
    value: '19,000+',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M7.5 13c2-2.15 3.4-4.23 3.4-6.1a3.4 3.4 0 10-6.8 0c0 1.87 1.4 3.95 3.4 6.1z" stroke="#ef6a23" strokeWidth="1.4" />
        <circle cx="7.5" cy="6.6" r="1.25" fill="#ef6a23" />
      </svg>
    ),
  },
  {
    label: 'COD Available',
    value: '8',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1.5" y="3.4" width="12" height="8.2" rx="1.8" stroke="#ef6a23" strokeWidth="1.4" />
        <circle cx="7.5" cy="7.5" r="1.5" stroke="#ef6a23" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    label: 'NDD Zones',
    value: '3',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M8.8 1.6L3.9 8.1h3l-.7 5.3 4.9-6.5h-3l.7-5.3z" stroke="#ef6a23" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    ),
  },
]

function TopIconButton({ children, active }) {
  return (
    <button
      type="button"
      className={[
        'flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-150',
        active ? 'border-[#d8dde5] bg-[#f5f7fb] text-[#1f2937]' : 'border-transparent text-[#647083] hover:bg-[#f6f8fb]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

export default function Dashboard() {
  const activePage = 'serviceability'
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleSearch = useCallback(async () => {
    setLoading(true)

    const pickup = filters.sourcePincode || '110001'
    const destination = filters.destPincode || '400001'

    try {
      const rows = await checkServiceability({
        pickupPincode: pickup,
        destinationPincode: destination,
        userId: 'demo_user',
      })
      setResults(rows)
    } catch (error) {
      console.error('Serviceability API request failed:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setResults([])
    setLoading(false)
  }, [])

  return (
    <div className="min-h-screen bg-[#f3f5f8] text-[#1f2937]">
      <header className="border-b border-[#e6eaf1] border-t-2 border-t-[#6878f6] bg-white">
        <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center justify-between px-6">
          <div className="flex items-center gap-9">
            <div className="text-[18px] font-semibold text-[#1f2a37]">
              Fship
            </div>

            <nav className="hidden items-center gap-7 md:flex">
              {NAV_LINKS.map(link => (
                <button
                  key={link.key}
                  type="button"
                  className={[
                    'border-b-2 py-[18px] text-[12px] font-medium transition-colors duration-150',
                    activePage === link.key
                      ? 'border-[#ef6a23] text-[#ef6a23]'
                      : 'border-transparent text-[#7c8594] hover:text-[#4b5563]',
                  ].join(' ')}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <TopIconButton>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 2.1a2.9 2.9 0 00-2.9 2.9v1.9L3.3 9v1h8.4V9l-1.3-2.1V5a2.9 2.9 0 00-2.9-2.9z" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6 11.2a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </TopIconButton>
            <TopIconButton>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M6.2 1.8h2.6l.3 1.2a4.7 4.7 0 011 .4l1.1-.6 1.8 1.8-.6 1.1c.16.32.29.65.39 1l1.2.3v2.6l-1.2.3a4.8 4.8 0 01-.4 1l.6 1.1-1.8 1.8-1.1-.6a4.7 4.7 0 01-1 .4l-.3 1.2H6.2l-.3-1.2a4.7 4.7 0 01-1-.4l-1.1.6-1.8-1.8.6-1.1a4.8 4.8 0 01-.4-1L1 9.9V7.3l1.2-.3a4.7 4.7 0 01.4-1L2 4.9l1.8-1.8 1.1.6c.32-.16.65-.29 1-.39l.3-1.2z" stroke="currentColor" strokeWidth="1" />
                <circle cx="7.5" cy="8" r="1.7" stroke="currentColor" strokeWidth="1" />
              </svg>
            </TopIconButton>
            <button type="button" className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#0f172a] text-[10px] font-semibold text-white">
              <span>RJ</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1240px] px-6 py-6">
        <section className="animate-fade-in">
          <div className="mb-7">
            <h1 className="mb-1 text-[38px] font-semibold leading-[1.08] text-[#111827] md:text-[42px]">Serviceability Checker</h1>
            <p className="text-[15px] text-[#6b7280]">
              Instantly verify courier availability, transit times, and service zones across your global network.
            </p>
          </div>

          <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {METRIC_CARDS.map(card => (
              <div key={card.label} className="rounded-[8px] border border-[#e6eaf1] bg-white px-4 py-4 md:px-5 md:py-5">
                <div className="mb-3 text-[#ef6a23]">{card.icon}</div>
                <div className="text-[31px] font-semibold leading-none text-[#1f2937]">{card.value}</div>
                <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8f97a6]">
                  {card.label}
                </div>
              </div>
            ))}
          </div>

          <SearchBar
            filters={filters}
            onChange={handleChange}
            onSearch={handleSearch}
            onReset={handleReset}
            loading={loading}
          />

          <ResultsTable data={results} loading={loading} />

          <div className="mt-7 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="overflow-hidden rounded-[8px] border border-[#e6eaf1] bg-white">
              <div className="grid h-full min-h-[184px] md:grid-cols-[2.1fr_1fr]">
                <div className="bg-[#ef640f] p-8 text-white">
                  <h2 className="mb-3 text-[34px] font-semibold leading-tight">Enterprise Routing Engine</h2>
                  <p className="max-w-[520px] text-[16px] leading-[1.55] text-[#fff3ea]">
                    Our proprietary logic automatically selects the optimal courier based on cost, speed, and reliability history for every single pincode.
                  </p>
                  <button
                    type="button"
                    className="mt-6 inline-flex rounded-[4px] bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.09em] text-[#ea650f]"
                  >
                    Learn More
                  </button>
                </div>
                <div
                  className="relative hidden bg-cover bg-center md:block"
                  style={{
                    backgroundImage:
                      'linear-gradient(0deg, rgba(148,62,9,0.35), rgba(148,62,9,0.35)), url(https://images.unsplash.com/photo-1489516408517-0c0a15662682?auto=format&fit=crop&w=900&q=80)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ef640f]/55 to-transparent" />
                </div>
              </div>
            </div>

            <div className="rounded-[8px] border border-[#e6eaf1] bg-white p-6">
              <div className="mb-6 flex h-9 w-9 items-center justify-center rounded-md bg-[#fff3ea] text-[#ef6a23]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2l1.45 1.54 2.15-.15.84 1.99 1.9 1-.84 1.99.84 1.99-1.9 1-.84 1.99-2.15-.15L8 14l-1.45-1.54-2.15.15-.84-1.99-1.9-1 .84-1.99-.84-1.99 1.9-1 .84-1.99 2.15.15L8 2z" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </div>
              <h3 className="mb-2 text-[26px] font-semibold leading-tight text-[#111827]">Accuracy Guaranteed</h3>
              <p className="text-[15px] leading-[1.6] text-[#6b7280]">
                Data updated every 15 minutes across all partner carriers to ensure zero shipment failures.
              </p>
              <div className="my-5 h-px bg-[#eceff4]" />
              <button type="button" className="inline-flex items-center gap-2 text-[14px] font-medium text-[#ef6a23]">
                View API Documentation
                <span aria-hidden="true">-&gt;</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
