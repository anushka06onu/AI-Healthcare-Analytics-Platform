import React from 'react'
import { Calendar, ShieldAlert, CheckCircle, TrendingUp, TrendingDown, ClipboardList } from 'lucide-react'
import Card from '../components/Card'

function History({ predictions }) {
  // Sparkline coordinates for simulated monthly volume trend (280 -> 640)
  const sparkPoints = "20,150 50,135 80,120 110,105 140,110 170,100 200,95 230,85 260,75 290,80 320,60 350,30"

  return (
    <div className="space-y-8 py-4 sm:py-6">
      {/* Visual Diagnostics Caseload Header */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600 dark:text-health-primary" />
              <span>Diagnostics Screening History</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Track past health evaluations compiled during this clinic session. Use historical indexes to monitor care pathway progress.
            </p>
          </div>
          
          {/* Custom SVG Sparkline Caseload Ticker */}
          <div className="md:col-span-4 bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xxs font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider">Active Caseload Trend</span>
              <span className="text-xs font-extrabold text-emerald-500 dark:text-health-accent flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                <span>+128%</span>
              </span>
            </div>
            
            <svg viewBox="0 0 370 170" className="w-full h-[60px] text-blue-600 dark:text-health-primary overflow-visible">
              {/* Gridlines */}
              <line x1="20" y1="150" x2="350" y2="150" stroke="rgba(128,128,128,0.15)" strokeWidth="1" />
              <line x1="20" y1="90" x2="350" y2="90" stroke="rgba(128,128,128,0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="20" y1="30" x2="350" y2="30" stroke="rgba(128,128,128,0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
              
              {/* Trend line */}
              <polyline fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={sparkPoints} />
              {/* Highlight endpoint node */}
              <circle cx="350" cy="30" r="4.5" fill="#10B981" className="pulse-glow" />
            </svg>
          </div>
        </div>
      </Card>

      {/* screening Logs List */}
      <div className="space-y-4">
        <h3 className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
          📋 Diagnostics Log Entries ({predictions.length})
        </h3>

        {predictions.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 italic">
            No diagnostic screenings performed yet. Use the Predict tab to execute evaluations.
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {predictions.map((p) => {
              const isImproving = p.trend === 'improving'
              
              const levelStyles = {
                Low: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50',
                Medium: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50',
                High: 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/50',
              }[p.riskLevel] || 'text-blue-500 bg-blue-50 border-blue-100'

              return (
                <Card key={p.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Disease and Date */}
                  <div className="flex items-start gap-4">
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl text-slate-650 dark:text-slate-350">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-850 dark:text-white flex items-center gap-2">
                        <span>{p.disease} Risk Screening</span>
                        {p.patientName && (
                          <span className="text-xxs font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-500 px-2 py-0.5 rounded">
                            Patient: {p.patientName}
                          </span>
                        )}
                      </h4>
                      <p className="text-xxs sm:text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                        Diagnostics compiled on: {p.date} • Operator: {p.clinician || 'Self-Screened'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Score and Trend */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/50 pt-3 sm:pt-0">
                    {/* Risk severity badge */}
                    <div className={`border py-1 px-3 rounded-xl flex items-center gap-1.5 ${levelStyles}`}>
                      <span className="text-xs font-extrabold">{p.riskLevel} Risk</span>
                      <span className="text-xxs font-semibold">({p.riskScore}%)</span>
                    </div>

                    {/* Progress Trend Badge */}
                    <div className={`flex items-center gap-1.5 font-bold text-xs py-1.5 px-3 rounded-xl ${
                      isImproving 
                        ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-450 dark:bg-slate-800/20' 
                        : 'text-amber-600 bg-amber-50 dark:text-amber-450 dark:bg-slate-800/20'
                    }`}>
                      {isImproving ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Improving</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="h-4 w-4" />
                          <span>Worsening</span>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default History
