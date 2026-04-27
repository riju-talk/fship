import React from 'react'
import { SHIPMENT_TYPES, EXPRESS_TYPES } from '@/constants/mockData'

/**
 * SearchBar — horizontal filter bar for courier serviceability lookup.
 */
export default function SearchBar({ filters, onChange, onSearch, onReset, loading }) {
  const inputBase = [
    'h-11 w-full rounded-md border border-[#e5e9f0] bg-[#f5f7fb] px-3',
    'text-[13px] text-[#374151] placeholder:text-[#a1a9b5]',
    'transition-colors duration-150',
    'focus:outline-none focus:border-[#d6dbe5] focus:bg-white',
  ].join(' ')

  const labelClass = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8b94a3]'

  return (
    <div className="mb-4 rounded-[8px] border border-[#e5e9f0] bg-white p-4 md:p-5">
      <div className="grid gap-3 md:grid-cols-[1.1fr_1fr_1fr_1fr_auto_auto] md:items-end">
        <div>
          <label className={labelClass}>Select Type</label>
          <div className="relative">
            <select
              value={filters.shipmentType}
              onChange={e => onChange('shipmentType', e.target.value)}
              className={`${inputBase} cursor-pointer pr-9`}
            >
              {SHIPMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#99a2b1]">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        <div>
          <label className={labelClass}>Express Type</label>
          <div className="relative">
            <select
              value={filters.expressType}
              onChange={e => onChange('expressType', e.target.value)}
              className={`${inputBase} cursor-pointer pr-9`}
            >
              {EXPRESS_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#99a2b1]">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        <div>
          <label className={labelClass}>Source Pincode</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="e.g. 110001"
            value={filters.sourcePincode}
            onChange={e => onChange('sourcePincode', e.target.value.replace(/\D/g, ''))}
            className={inputBase}
          />
        </div>

        <div>
          <label className={labelClass}>Destination Pincode</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="e.g. 400001"
            value={filters.destPincode}
            onChange={e => onChange('destPincode', e.target.value.replace(/\D/g, ''))}
            className={inputBase}
          />
        </div>

        <div className="md:pt-[17px]">
          <button
            onClick={onSearch}
            disabled={loading}
            className={[
              'h-11 rounded-md bg-[#ed6a23] px-10 text-[12px] font-semibold uppercase tracking-[0.08em] text-white',
              'transition-colors duration-150 hover:bg-[#de5e1b]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f09764] focus-visible:ring-offset-2',
              loading ? 'cursor-not-allowed opacity-70' : '',
            ].join(' ')}
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        <div className="md:pt-[17px]">
          <button
            onClick={onReset}
            disabled={loading}
            className={[
              'flex h-11 w-11 items-center justify-center rounded-md border border-[#e5e9f0] bg-white text-[#7e8796]',
              'transition-colors duration-150 hover:bg-[#f7f9fc]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dce2ec] focus-visible:ring-offset-2',
              loading ? 'cursor-not-allowed opacity-50' : '',
            ].join(' ')}
            aria-label="Reset filters"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8a5 5 0 1 0 2-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M3 4v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
