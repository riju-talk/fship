import React from 'react'

/**
 * ToggleSwitch — animated pill toggle.
 * ON  → green background, knob slides right.
 * OFF → grey background, knob slides left.
 */
export default function ToggleSwitch({ checked, onChange, disabled = false }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={[
        'relative inline-flex items-center w-11 h-6 rounded-full',
        'transition-colors duration-300 ease-in-out focus:outline-none',
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-600',
        checked
          ? 'bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.3)]'
          : 'bg-gray-300',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      {/* Knob */}
      <span
        className={[
          'inline-block w-4 h-4 bg-white rounded-full shadow-md',
          'transition-transform duration-300 ease-in-out',
          checked ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  )
}
