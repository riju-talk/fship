import React from 'react'

/**
 * EmptyState — shown when the results table has no rows.
 */
export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-in">
      <div className="mb-4 flex h-[58px] w-[58px] items-center justify-center rounded-xl bg-[#eff2f7]">
        <svg
          width="34"
          height="34"
          viewBox="0 0 34 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="14" cy="14" r="7" stroke="#94a3b8" strokeWidth="1.8" />
          <path d="M19.1 19.1L24.8 24.8" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="11" cy="20.8" r="4.5" fill="#d5dbea" />
          <path d="M9 20.8h4M11 18.8v4" stroke="#7f8da7" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      <p className="mb-2 text-[28px] font-semibold leading-none text-[#1f2937]">No data available</p>
      <p className="max-w-[430px] text-[15px] leading-[1.55] text-[#717b8c]">
        Please enter source and destination pincodes to check for available courier services in our network.
      </p>

      <div className="mt-5 flex items-center gap-2 text-[11px] text-[#a0a9b7]">
        <span className="h-1 w-1 rounded-full bg-[#c2cad7]" />
        <span>Real-time verification</span>
        <span className="h-1 w-1 rounded-full bg-[#c2cad7]" />
        <span>Priority routing</span>
      </div>
    </div>
  )
}
