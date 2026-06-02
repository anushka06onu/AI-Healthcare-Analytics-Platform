import React, { useState, useRef, useEffect } from 'react'
import { Heart, Activity, Brain, ShieldAlert, Droplet, ChevronDown, Check } from 'lucide-react'

function DiseaseSelector({ selectedDisease, setSelectedDisease }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const diseases = [
    { id: 'diabetes', label: 'Diabetes', icon: Activity, desc: 'Assess lifestyle habits, sugar trends, and body mass indicators.' },
    { id: 'heart', label: 'Heart Disease', icon: Heart, desc: 'Evaluate physical activity, blood pressure status, and cholesterol awareness.' },
    { id: 'liver', label: 'Liver Disease', icon: Droplet, desc: 'Monitor balanced diet intake, lifestyle habits, and metabolic parameters.' },
    { id: 'stroke', label: 'Stroke', icon: Brain, desc: 'Evaluate age factors, blood pressure status, and smoking habits.' },
    { id: 'kidney', label: 'Kidney Disease', icon: ShieldAlert, desc: 'Scan blood pressure status, family history, and lifestyle indicators.' },
  ]

  const activeDiseaseObj = diseases.find((d) => d.id === selectedDisease) || diseases[0]
  const ActiveIcon = activeDiseaseObj.icon

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (id) => {
    setSelectedDisease(id)
    setIsOpen(false)
  }

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label className="block text-xs sm:text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
        🎯 Choose Diagnostics Focus
      </label>
      
      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between pl-4 pr-3.5 py-3 text-[var(--text-color)] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-[var(--shadow)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-semibold text-sm sm:text-base cursor-pointer hover:scale-[1.01] hover:-translate-y-0.5 active:scale-99"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-blue-500">
              <ActiveIcon className="h-5 w-5" />
            </span>
            <span className="font-extrabold">{activeDiseaseObj.label} Assessment</span>
          </div>
          <ChevronDown className={`h-5 w-5 text-[var(--text-muted)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Animated Custom Dropdown List */}
        {isOpen && (
          <div className="absolute right-0 left-0 mt-2 z-50 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-xl max-h-[350px] overflow-y-auto animate-fade-in p-1.5 scrollbar-thin">
            {diseases.map((d) => {
              const Icon = d.icon
              const isSelected = d.id === selectedDisease
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleSelect(d.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-250 text-left cursor-pointer mb-1 last:mb-0 ${
                    isSelected 
                      ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 font-extrabold' 
                      : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/60 text-[var(--text-color)]'
                  }`}
                >
                  <div className={`p-2 rounded-lg mt-0.5 ${isSelected ? 'bg-blue-600/15 text-blue-600' : 'bg-[var(--bg-color)] border border-[var(--card-border)] text-[var(--text-muted)]'}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  
                  <div className="flex-grow space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-extrabold tracking-tight">{d.label}</span>
                      {isSelected && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <p className="text-xxs sm:text-xs text-[var(--text-muted)] leading-relaxed font-semibold">
                      {d.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
      
      <p className="text-xxs sm:text-xs text-[var(--text-muted)] italic mt-1 pl-1">
        Currently Evaluating: {activeDiseaseObj.desc}
      </p>
    </div>
  )
}

export default DiseaseSelector
