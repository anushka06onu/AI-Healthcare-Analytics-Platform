import React, { useState, useEffect, useRef } from 'react'
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
  
  // Slider click-to-type edit states
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState(value.toString())
  
  // Keep tempValue synchronized with parent slider value changes
  useEffect(() => {
    setTempValue(value.toString())
  }, [value])

  const handleInputChange = (e) => {
    setTempValue(e.target.value)
  }

  const handleInputBlur = () => {
    let parsed = parseFloat(tempValue)
    if (isNaN(parsed)) {
      parsed = value
    } else {
      // Clamping logic to prevent unrealistic values (e.g. age 200)
      parsed = Math.min(Math.max(parsed, min), max)
      // Round to step if necessary
      if (step && step > 0) {
        parsed = Math.round(parsed / step) * step
      }
    }
    onChange(parsed)
    setTempValue(parsed.toString())
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur()
    }
  }

  // Custom premium themed Select states
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value) || options[0]

  return (
    <div className="space-y-2 relative group mb-4">
      {/* Label and Info Tooltip Trigger */}
      <div className="flex items-center gap-1.5">
        <label className="block text-sm sm:text-base font-bold text-[var(--text-color)]">
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
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-52 sm:w-60 p-3 bg-slate-900/95 backdrop-blur text-white text-xs rounded-xl shadow-lg border border-slate-700 font-medium leading-relaxed transition-all">
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
              className="flex-grow h-2.5 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-blue-600 transition-all"
            />
            
            {/* Click-to-type input/badge box */}
            {isEditing ? (
              <input
                type="number"
                value={tempValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-18 text-center bg-blue-600/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 py-1 rounded-lg text-sm sm:text-base font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTempValue(value.toString())
                  setIsEditing(true)
                }}
                className="min-w-[4rem] text-center bg-blue-600/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 py-1.5 px-3 rounded-lg text-sm sm:text-base font-extrabold shadow-xxs cursor-pointer hover:bg-blue-600/20 hover:border-blue-500/40 hover:scale-[1.03] transition-all select-none focus:outline-none"
                title="Click to type custom value"
              >
                {value}
              </button>
            )}
          </div>
        </div>
      )}

      {type === 'select' && (
        <div className="relative w-full text-left" ref={selectRef}>
          {/* Custom Select Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex justify-between items-center w-full px-4 py-3 text-[var(--text-color)] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-sm sm:text-base cursor-pointer transition-all hover:bg-slate-100/5 dark:hover:bg-slate-800/10 text-left"
          >
            <span>{selectedOption?.label || 'Select choice'}</span>
            <span 
              className="ml-2 text-[var(--text-muted)] text-[10px] transition-transform duration-200" 
              style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
            >
              ▼
            </span>
          </button>

          {/* Custom Dropdown Items Menu */}
          {isOpen && (
            <div className="absolute left-0 right-0 mt-1.5 z-[100] max-h-60 overflow-y-auto bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-xl overflow-hidden animate-fade-in font-semibold text-sm sm:text-base">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={`flex items-center justify-between w-full px-4 py-3 hover:bg-blue-600/10 hover:text-blue-600 dark:hover:text-blue-400 text-left transition-all ${
                    opt.value === value 
                      ? 'bg-blue-600/5 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500' 
                      : 'text-[var(--text-color)] border-l-4 border-transparent'
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && <span className="text-blue-500 text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {type === 'text' && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={reference || "Type details..."}
          className="block w-full px-4 py-3 text-[var(--text-color)] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-sm sm:text-base"
        />
      )}

      {/* reference range badge below input */}
      {reference && (
        <span className="inline-block text-xs font-bold text-[var(--text-muted)] bg-[var(--bg-color)] border border-[var(--card-border)] py-1 px-2.5 rounded mt-1 shadow-xxs">
          🎯 {reference}
        </span>
      )}
    </div>
  )
}

export default InputField
