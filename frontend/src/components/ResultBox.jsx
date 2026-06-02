import React, { useState, useEffect } from 'react'
import { Activity, ShieldCheck, AlertTriangle, XOctagon, Loader, FileDown } from 'lucide-react'

function ResultBox({ prediction, isCalculating, onDownload }) {
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    if (isCalculating) {
      setShowAnimation(true)
    } else {
      setShowAnimation(false)
    }
  }, [isCalculating])

  if (showAnimation) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-[var(--bg-color)] border border-dashed border-[var(--card-border)] rounded-2xl animate-pulse">
        <Loader className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <h4 className="font-extrabold text-sm sm:text-base text-[var(--text-color)]">Analyzing Health Metrics...</h4>
        <p className="text-xs text-[var(--text-muted)] text-center mt-1.5 max-w-[240px]">
          Computing risk factors and compiling layman explanations.
        </p>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-[var(--bg-color)] border border-[var(--card-border)] rounded-2xl">
        <div className="bg-blue-600/10 p-3 rounded-full text-blue-600 mb-4 shadow-sm">
          <Activity className="h-6 w-6" />
        </div>
        <h4 className="font-extrabold text-sm sm:text-base text-[var(--text-color)]">Ready for Risk Estimation</h4>
        <p className="text-xs text-[var(--text-muted)] mt-2 max-w-xs leading-relaxed">
          Fill out the health details on the left and submit to view your calculated risk score.
        </p>
      </div>
    )
  }

  const { riskScore, riskLevel, disease, reasons } = prediction

  const theme = {
    Low: {
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/8',
      border: 'border-emerald-500/30',
      shadow: 'shadow-emerald-500/5',
      icon: ShieldCheck
    },
    Medium: {
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 dark:bg-amber-500/8',
      border: 'border-amber-500/30',
      shadow: 'shadow-amber-500/5',
      icon: AlertTriangle
    },
    High: {
      color: 'text-red-500',
      bg: 'bg-red-500/10 dark:bg-red-500/8',
      border: 'border-red-500/30',
      shadow: 'shadow-red-500/5',
      icon: XOctagon
    }
  }[riskLevel] || {
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    shadow: 'shadow-blue-500/5',
    icon: ShieldCheck
  }

  const IconComponent = theme.icon

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Title */}
      <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-color)] flex items-center gap-2">
        <span>📊 Diagnostics Risk Report</span>
        <span className="text-xs bg-[var(--bg-color)] border border-[var(--card-border)] py-0.5 px-2 rounded-md text-[var(--text-muted)] font-semibold uppercase tracking-wider">
          {disease}
        </span>
      </h3>

      {/* Risk classification Card */}
      <div className={`p-6 rounded-2xl border ${theme.bg} ${theme.border} text-center shadow-md ${theme.shadow} transition-all duration-300`}>
        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
          Calculated Risk level
        </span>
        
        <div className={`text-3xl sm:text-4xl font-extrabold flex items-center justify-center gap-2 ${theme.color}`}>
          <IconComponent className="h-8 w-8" />
          <span>{riskLevel} Risk</span>
        </div>

        {/* Large Percentage Score Dial */}
        <div className="mt-4 inline-flex items-center justify-center p-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-full shadow-inner">
          <span className="text-4xl sm:text-5xl font-extrabold text-[var(--text-color)]">
            {riskScore}<span className="text-lg sm:text-xl text-[var(--text-muted)]">%</span>
          </span>
        </div>

        <p className="text-xxs sm:text-xs mt-3 text-[var(--text-muted)] font-medium">
          Calculated on the validation screening reference database.
        </p>
      </div>

      {/* Layman Reasoning Box */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 shadow-xs">
        <h4 className="text-xs sm:text-sm font-extrabold text-[var(--text-color)] mb-3">
          🔍 Why this risk score?
        </h4>
        
        {reasons && reasons.length > 0 ? (
          <ul className="space-y-2.5">
            {reasons.map((r, idx) => (
              <li key={idx} className="text-xs sm:text-sm text-[var(--text-muted)] flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs sm:text-sm text-[var(--text-muted)] italic">
            Your patient metrics are fully aligned with typical normal ranges.
          </p>
        )}
      </div>

      {/* Simulated PDF download button */}
      <button
        onClick={onDownload}
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 active:translate-y-0.5 hover:scale-[1.01] transition-all duration-200 cursor-pointer"
      >
        <FileDown className="h-4.5 w-4.5" />
        <span>Download EMR Diagnostics Report (PDF)</span>
      </button>
    </div>
  )
}

export default ResultBox
