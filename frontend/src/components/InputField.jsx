import React, { useState } from 'react'
import { Info } from 'lucide-react'

function InputField({ 
  label, 
  value, 
  onChange, 
  type = 'slider', 
  min = 0, 
  max = 100, 
  step = 1, 
  options = [], 
  tooltip = '', 
  reference = '' 
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="space-y-2 relative group mb-4">
      {/* Label and Info Tooltip Trigger */}
      <div className="flex items-center gap-1.5">
        <label className="block text-xs sm:text-sm font-bold text-[var(--text-color)]">
          {label}
        </label>
        
        {tooltip && (
          <div 
            className="relative cursor-pointer text-[var(--text-muted)] hover:text-blue-500 transition-colors"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
          >
            <Info className="h-3.5 w-3.5" />
            
            {/* Absolute floating explanation card */}
            {showTooltip && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-52 sm:w-60 p-3 bg-slate-900/95 backdrop-blur text-white text-xxs sm:text-xs rounded-xl shadow-lg border border-slate-700 font-medium leading-relaxed transition-all">
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/95"></div>
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Renders dynamic widgets based on type */}
      {type === 'slider' && (
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="flex-grow h-2 rounded-lg appearance-none cursor-pointer"
            />
            {/* Value indicator badge */}
            <span className="min-w-[3.5rem] text-center bg-blue-600/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 py-1 px-2.5 rounded-lg text-xs sm:text-sm font-extrabold shadow-xxs">
              {value}
            </span>
          </div>
        </div>
      )}

      {type === 'select' && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full px-3.5 py-2.5 text-[var(--text-color)] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-xs sm:text-sm cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="font-semibold text-xs py-1">
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {type === 'text' && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={reference || "Type details..."}
          className="block w-full px-3.5 py-2.5 text-[var(--text-color)] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-xs sm:text-sm"
        />
      )}

      {/* reference range badge below input */}
      {reference && (
        <span className="inline-block text-xxs font-bold text-[var(--text-muted)] bg-[var(--bg-color)] border border-[var(--card-border)] py-0.5 px-2 rounded mt-1 shadow-xxs">
          🎯 {reference}
        </span>
      )}
    </div>
  )
}

export default InputField
