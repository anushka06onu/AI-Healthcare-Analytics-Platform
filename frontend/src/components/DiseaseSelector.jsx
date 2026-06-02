import React from 'react'
import { Heart, Activity, Brain, ShieldAlert, Droplet } from 'lucide-react'

function DiseaseSelector({ selectedDisease, setSelectedDisease }) {
  const diseases = [
    { id: 'diabetes', label: 'Diabetes', icon: Activity, desc: 'Assess blood sugar levels and insulin responses.' },
    { id: 'heart', label: 'Heart Disease', icon: Heart, desc: 'Evaluate cardiovascular strain and blood pressure signs.' },
    { id: 'liver', label: 'Liver Disease', icon: Droplet, desc: 'Monitor bilirubin waste and structural liver metrics.' },
    { id: 'stroke', label: 'Stroke', icon: Brain, desc: 'Scan cerebrovascular history and average vitals.' },
    { id: 'kidney', label: 'Kidney Disease', icon: ShieldAlert, desc: 'Evaluate specific gravity, protein leaks, and blood counts.' },
  ]

  const activeDiseaseObj = diseases.find((d) => d.id === selectedDisease) || diseases[0]
  const IconComponent = activeDiseaseObj.icon

  return (
    <div className="space-y-2">
      <label className="block text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        🎯 Choose Diagnostic Focus
      </label>
      
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-500 dark:text-health-primary">
          <IconComponent className="h-5 w-5" />
        </div>
        
        <select
          value={selectedDisease}
          onChange={(e) => setSelectedDisease(e.target.value)}
          className="block w-full pl-10 pr-10 py-3 text-slate-800 dark:text-slate-100 bg-white dark:bg-health-darkCard border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-health-primary transition-all duration-200 font-semibold text-sm sm:text-base cursor-pointer appearance-none"
        >
          {diseases.map((d) => (
            <option key={d.id} value={d.id} className="font-semibold text-sm py-2">
              {d.label} Assessment
            </option>
          ))}
        </select>
        
        {/* Custom Chevron indicator */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Dynamic descriptor text below selectbox */}
      <p className="text-xxs sm:text-xs text-slate-400 dark:text-slate-500 italic mt-1 pl-1">
        Currently Evaluating: {activeDiseaseObj.desc}
      </p>
    </div>
  )
}

export default DiseaseSelector
