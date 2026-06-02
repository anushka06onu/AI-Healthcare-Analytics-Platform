import React from 'react'
import { Calendar, ShieldAlert, CheckCircle, TrendingUp, ClipboardList } from 'lucide-react'
import Card from '../components/Card'

function History({ predictions }) {
  // Chronological sorting (oldest on the left, newest on the right)
  const chronological = [...predictions].reverse()

  // Generate dynamic sparkline coordinate points based on actual risk scores
  const getSparklinePoints = () => {
    if (chronological.length === 0) return "20,135 350,135" // flat healthy base line
    if (chronological.length === 1) {
      const y = 145 - (chronological[0].riskScore / 100) * 115
      return `20,${y} 350,${y}`
    }
    return chronological.map((p, idx) => {
      const x = 20 + (idx / (chronological.length - 1)) * 330
      const y = 145 - (p.riskScore / 100) * 115
      return `${x},${y}`
    }).join(' ')
  }

  const sparkPoints = getSparklinePoints()
  const latestY = chronological.length > 0 ? (145 - (chronological[chronological.length - 1].riskScore / 100) * 115) : 135

  // Average trend description
  const averageRisk = predictions.length > 0 
    ? Math.round(predictions.reduce((acc, curr) => acc + curr.riskScore, 0) / predictions.length) 
    : 0

  return (
    <div className="space-y-8 py-4 sm:py-6 text-[var(--text-color)]">
      {/* Visual Diagnostics Caseload Header */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-color)] flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600 dark:text-health-primary" />
              <span>Wellness Screening History</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium leading-relaxed">
              Track your previous health risk evaluations compiled during this session. Use these trends to monitor your active lifestyle progress.
            </p>
          </div>
          
          {/* Custom SVG Sparkline Caseload Ticker */}
          <div className="md:col-span-4 bg-[var(--bg-color)] p-4 rounded-2xl border border-[var(--card-border)] flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Active Health Trend</span>
              <span className={`text-xs font-extrabold flex items-center gap-0.5 ${averageRisk > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>
                <TrendingUp className="h-3 w-3" />
                <span>Avg: {averageRisk}% Risk</span>
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
              <circle cx="350" cy={latestY} r="4.5" fill={averageRisk > 40 ? '#F59E0B' : '#10B981'} className="pulse-glow" />
            </svg>
          </div>
        </div>
      </Card>

      {/* screening Logs List */}
      <div className="space-y-4">
        <h3 className="text-xs sm:text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider pl-1">
          📋 Health Assessment Entries ({predictions.length})
        </h3>

        {predictions.length === 0 ? (
          <Card className="p-8 text-center text-[var(--text-muted)] italic">
            No health screenings performed yet. Use the Risk Checker tab to execute assessments.
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
                    <div className="bg-[var(--bg-color)] border border-[var(--card-border)] p-3 rounded-2xl text-[var(--text-muted)]">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-[var(--text-color)] flex items-center gap-2">
                        <span>{p.disease} Risk Assessment</span>
                        {p.patientName && (
                          <span className="text-xxs font-bold bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded">
                            User: {p.patientName}
                          </span>
                        )}
                      </h4>
                      <p className="text-xxs sm:text-xs text-[var(--text-muted)] font-medium mt-0.5">
                        Screened on: {p.date} • Wellness Assessment
                      </p>
                    </div>
                  </div>

                  {/* Right: Score and Trend */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-[var(--card-border)] pt-3 sm:pt-0">
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
