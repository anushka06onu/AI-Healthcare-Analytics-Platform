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
        <span>📊 Health Risk Report</span>
        <span className="text-xs bg-[var(--bg-color)] border border-[var(--card-border)] py-0.5 px-2 rounded-md text-[var(--text-muted)] font-semibold uppercase tracking-wider">
          {disease}
        </span>
      </h3>

      {/* Risk classification Card */}
      <div className={`p-6 rounded-2xl border ${theme.bg} ${theme.border} text-center shadow-md ${theme.shadow} transition-all duration-300`}>
        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
          Estimated Risk level
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
          Calculations based on typical lifestyle and vitals indicators.
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
            Your entered metrics are fully aligned with standard healthy averages.
          </p>
        )}
      </div>

      {/* 📊 Wellness Metrics Comparison Charts */}
      {prediction.metrics && (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 shadow-xs space-y-4">
          <h4 className="text-xs sm:text-sm font-extrabold text-[var(--text-color)] flex items-center gap-1.5 border-b border-[var(--card-border)] pb-2 mb-1">
            <span>📊 Wellness Metrics Comparison</span>
          </h4>

          {/* Metric 1: BMI Slider comparison */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[var(--text-muted)]">Body Mass Index (BMI):</span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold">{prediction.metrics.bmi} BMI</span>
            </div>
            <div className="relative h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full">
              {/* BMI Track segments colored */}
              <div className="absolute inset-0 flex rounded-full overflow-hidden">
                <div className="w-[14%] bg-sky-400" title="Underweight"></div>
                <div className="w-[26%] bg-emerald-500" title="Healthy"></div>
                <div className="w-[20%] bg-amber-400" title="Overweight"></div>
                <div className="w-[40%] bg-red-500" title="Obese"></div>
              </div>
              {/* User indicator marker pin */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-blue-600 dark:border-blue-400 shadow-md transition-all duration-500"
                style={{ left: `${Math.min(Math.max(((prediction.metrics.bmi - 15) / 25) * 100, 2), 98)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] text-[var(--text-muted)] font-bold px-0.5">
              <span>Underweight</span>
              <span className="text-emerald-600 font-extrabold">Healthy (18.5-25)</span>
              <span>Overweight</span>
              <span>Obese (30+)</span>
            </div>
          </div>

          {/* Metric 2: Lifestyle Quality index */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[var(--text-muted)]">Lifestyle Quality Score:</span>
              <span className={`font-extrabold ${
                (() => {
                  let habits = 0;
                  if (prediction.metrics.smoke === 'no') habits++;
                  if (prediction.metrics.exercise === 'yes') habits++;
                  if (prediction.metrics.balancedDiet === 'yes') habits++;
                  const pct = Math.round((habits / 3) * 100);
                  return pct >= 100 ? 'text-emerald-500' : pct >= 66 ? 'text-amber-500' : 'text-red-500';
                })()
              }`}>
                {(() => {
                  let habits = 0;
                  if (prediction.metrics.smoke === 'no') habits++;
                  if (prediction.metrics.exercise === 'yes') habits++;
                  if (prediction.metrics.balancedDiet === 'yes') habits++;
                  const pct = Math.round((habits / 3) * 100);
                  return `${pct}% (${habits}/3 Healthy Habits)`;
                })()}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-[var(--card-border)]">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  (() => {
                    let habits = 0;
                    if (prediction.metrics.smoke === 'no') habits++;
                    if (prediction.metrics.exercise === 'yes') habits++;
                    if (prediction.metrics.balancedDiet === 'yes') habits++;
                    const pct = Math.round((habits / 3) * 100);
                    return pct >= 100 ? 'bg-emerald-500' : pct >= 66 ? 'bg-amber-400' : 'bg-red-500';
                  })()
                }`}
                style={{ 
                  width: `${(() => {
                    let habits = 0;
                    if (prediction.metrics.smoke === 'no') habits++;
                    if (prediction.metrics.exercise === 'yes') habits++;
                    if (prediction.metrics.balancedDiet === 'yes') habits++;
                    return Math.round((habits / 3) * 100);
                  })()}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] text-[var(--text-muted)] font-bold px-0.5">
              <span>Exercise: {prediction.metrics.exercise.toUpperCase()}</span>
              <span>Diet: {prediction.metrics.balancedDiet.toUpperCase()}</span>
              <span>Non-Smoker: {prediction.metrics.smoke === 'no' ? 'YES' : 'NO'}</span>
            </div>
          </div>

          {/* Metric 3: Comparative vital quick badges */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[var(--card-border)]">
            <div className="p-2.5 rounded-xl bg-[var(--bg-color)] border border-[var(--card-border)] flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Blood Sugar</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${prediction.metrics.bloodSugar === 'high' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                <span className="text-xs font-extrabold">{prediction.metrics.bloodSugar === 'high' ? 'Elevated Sugar' : 'Normal / Healthy'}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--bg-color)] border border-[var(--card-border)] flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Blood Pressure</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  prediction.metrics.bloodPressure === 'high' ? 'bg-red-500' : prediction.metrics.bloodPressure === 'low' ? 'bg-amber-400' : 'bg-emerald-500'
                }`}></span>
                <span className="text-xs font-extrabold">
                  {prediction.metrics.bloodPressure === 'high' ? 'Elevated BP' : prediction.metrics.bloodPressure === 'low' ? 'Low BP Status' : 'Normal / Healthy'}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Simulated PDF download button */}
      <button
        onClick={onDownload}
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-755 text-white font-extrabold text-sm rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 active:translate-y-0.5 hover:scale-[1.01] transition-all duration-200 cursor-pointer"
      >
        <FileDown className="h-4.5 w-4.5" />
        <span>Download Wellness Risk Report (PDF)</span>
      </button>
    </div>
  )
}

export default ResultBox
