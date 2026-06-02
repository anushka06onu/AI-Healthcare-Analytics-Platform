import React, { useState, useEffect } from 'react'
import { Activity, ShieldCheck, AlertTriangle, XOctagon, Loader, FileDown } from 'lucide-react'

function ResultBox({ prediction, isCalculating, onDownload }) {
  const [showAnimation, setShowAnimation] = useState(false)

  // Sync animation timer with calculation state
  useEffect(() => {
    if (isCalculating) {
      setShowAnimation(true)
    } else {
      setShowAnimation(false)
    }
  }, [isCalculating])

  if (showAnimation) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
        <Loader className="h-10 w-10 text-blue-600 dark:text-health-primary animate-spin mb-4" />
        <h4 className="font-extrabold text-sm sm:text-base text-slate-850 dark:text-white">Analyzing Health Metrics...</h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1.5 max-w-[240px]">
          Computing clinical risk factors and compiling layman explanations.
        </p>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-slate-50 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-900 rounded-2xl">
        <div className="bg-blue-50 dark:bg-slate-800 p-3 rounded-full text-blue-500 mb-4 shadow-sm">
          <Activity className="h-6 w-6" />
        </div>
        <h4 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white">Ready for Risk Estimation</h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-xs">
          Fill out the health details on the left and submit to view your calculated risk score.
        </p>
      </div>
    )
  }

  const { riskScore, riskLevel, disease, reasons } = prediction

  // Style tokens based on risk levels
  const theme = {
    Low: {
      color: 'text-emerald-500 dark:text-health-accent',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-900/50',
      shadow: 'shadow-emerald-500/10',
      icon: ShieldCheck
    },
    Medium: {
      color: 'text-amber-500 dark:text-health-warning',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-900/50',
      shadow: 'shadow-amber-500/10',
      icon: AlertTriangle
    },
    High: {
      color: 'text-red-500 dark:text-health-danger',
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-200 dark:border-red-900/50',
      shadow: 'shadow-red-500/10',
      icon: XOctagon
    }
  }[riskLevel] || {
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    shadow: 'shadow-blue-500/10',
    icon: ShieldCheck
  }

  const IconComponent = theme.icon

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Title */}
      <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
        <span>📊 Diagnostics Risk Report</span>
        <span className="text-xs bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded-md text-slate-400 font-semibold uppercase tracking-wider">
          {disease}
        </span>
      </h3>

      {/* Risk classification Card */}
      <div className={`p-6 rounded-2xl border ${theme.bg} ${theme.border} text-center shadow-md ${theme.shadow} transition-all duration-300`}>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider block mb-1">
          Calculated Risk level
        </span>
        
        <div className={`text-3xl sm:text-4xl font-extrabold flex items-center justify-center gap-2 ${theme.color}`}>
          <IconComponent className="h-8 w-8" />
          <span>{riskLevel} Risk</span>
        </div>

        {/* Large Percentage Score Dial */}
        <div className="mt-4 inline-flex items-center justify-center p-5 bg-white dark:bg-health-darkCard border border-slate-200/50 dark:border-slate-800/80 rounded-full shadow-inner shadow-slate-100 dark:shadow-none">
          <span className="text-4xl sm:text-5xl font-extrabold text-slate-850 dark:text-white">
            {riskScore}<span className="text-lg sm:text-xl text-slate-400">%</span>
          </span>
        </div>

        <p className="text-xxs sm:text-xs mt-3 text-slate-500 dark:text-slate-400 font-medium">
          Calculated on the validation EMR screening reference database.
        </p>
      </div>

      {/* Layman Reasoning Box */}
      <div className="bg-white dark:bg-health-darkCard border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white mb-3">
          🔍 Why this risk score?
        </h4>
        
        {reasons && reasons.length > 0 ? (
          <ul className="space-y-2.5">
            {reasons.map((r, idx) => (
              <li key={idx} className="text-xs sm:text-sm text-slate-600 dark:text-slate-350 flex items-start gap-2.5">
                <span className="text-blue-500 dark:text-health-primary mt-1">•</span>
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic">
            Your patient metrics are fully aligned with typical normal ranges.
          </p>
        )}
      </div>

      {/* simulated PDF download button */}
      <button
        onClick={onDownload}
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 dark:bg-health-primary hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 active:translate-y-0.5 transition-all duration-200"
      >
        <FileDown className="h-4.5 w-4.5" />
        <span>Download EMR Diagnostics Report (PDF)</span>
      </button>
    </div>
  )
}

export default ResultBox
