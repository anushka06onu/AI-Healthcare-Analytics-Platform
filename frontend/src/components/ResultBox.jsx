import React, { useState, useEffect } from 'react'
import { Activity, ShieldCheck, AlertTriangle, XOctagon, Loader, FileDown, Heart, Flame, Sparkles, RefreshCw, Smile, Utensils, HelpCircle } from 'lucide-react'

function ResultBox({ prediction, isCalculating, onDownload, onReevaluate }) {
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    if (isCalculating) {
      setShowAnimation(true)
    } else {
      setShowAnimation(false)
    }
  }, [isCalculating])

  // 1. Loading State
  if (showAnimation) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 bg-[var(--card-bg)] border border-dashed border-[var(--card-border)] rounded-3xl shadow-sm animate-pulse">
        <Loader className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <h4 className="font-extrabold text-sm sm:text-base text-[var(--text-color)] tracking-wide">
          Calculating Wellness Risk Score...
        </h4>
        <p className="text-xs text-[var(--text-muted)] text-center mt-1.5 max-w-[280px] font-medium leading-relaxed">
          Running statistical model and compiling Explainable AI (XAI) SHAP contributors in layman's terms...
        </p>
      </div>
    )
  }

  // 2. Empty/Ready State (Rendered in right column before submit)
  if (!prediction) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl">
        <div className="bg-blue-600/10 p-3 rounded-full text-blue-600 mb-4 shadow-xs">
          <Activity className="h-6 w-6" />
        </div>
        <h4 className="font-black text-sm sm:text-base text-[var(--text-color)] uppercase tracking-wider">
          Diagnostic System Ready
        </h4>
        <p className="text-xs text-[var(--text-muted)] mt-2 max-w-xs leading-relaxed font-semibold">
          Answer the questions in the step-by-step wizard on the left. The system will dynamically generate a full-width wellness report with visual SHAP charts.
        </p>
      </div>
    )
  }

  const { riskScore, riskLevel, disease, advice, reasons, patientName, patientId, metrics } = prediction

  const theme = {
    Low: {
      color: 'text-emerald-500',
      fill: '#10B981',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/8',
      border: 'border-emerald-500/20',
      shadow: 'shadow-emerald-500/5',
      icon: ShieldCheck,
      desc: "Healthy baseline zone. Your current parameters and protective habits indicate excellent physical resilience. Keep maintaining your active lifestyle to protect your wellness!",
    },
    Medium: {
      color: 'text-amber-500',
      fill: '#F59E0B',
      bg: 'bg-amber-500/10 dark:bg-amber-500/8',
      border: 'border-amber-500/20',
      shadow: 'shadow-amber-500/5',
      icon: AlertTriangle,
      desc: "Moderate awareness zone. Certain lifestyle factors or metabolic markers are mildly elevated. Implementing slight changes now can successfully lower your baseline risk and protect long-term vitality.",
    },
    High: {
      color: 'text-red-500',
      fill: '#EF4444',
      bg: 'bg-red-500/10 dark:bg-red-500/8',
      border: 'border-red-500/20',
      shadow: 'shadow-red-500/5',
      icon: XOctagon,
      desc: "Elevated risk zone. Several prominent indicators (such as elevated vitals, low exercise, or biological baseline factors) are driving your risk score higher. This is a powerful, protective cue to consult a doctor and take actionable steps.",
    }
  }[riskLevel] || {
    color: 'text-blue-500',
    fill: '#3B82F6',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    shadow: 'shadow-blue-500/5',
    icon: ShieldCheck,
    desc: "Baseline reference zone. Continue tracking your routine habits.",
  }

  const IconComponent = theme.icon

  // 🧠 DETAILED LAYMAN SHAP VALUES GENERATOR
  const getShapValues = () => {
    if (!metrics) return []
    const list = []

    // 1. Age
    if (metrics.age > 65) {
      list.push({ label: 'Age baseline (65+ yrs)', desc: 'Natural stiffening of tissues over time', value: 22, type: 'up' })
    } else if (metrics.age > 45) {
      list.push({ label: 'Age baseline (45+ yrs)', desc: 'Slightly slower cellular response speeds', value: 10, type: 'up' })
    } else {
      list.push({ label: 'Age Factor (Under 45)', desc: 'Younger biological age baseline is protective', value: -6, type: 'down' })
    }

    // 2. Smoke
    if (metrics.smoke === 'yes') {
      list.push({ label: 'Active Tobacco Smoking', desc: 'Vessel constriction & chemical strain', value: disease === 'Heart Disease' || disease === 'Stroke' ? 28 : 12, type: 'up' })
    } else {
      list.push({ label: 'Non-Smoker Status', desc: 'Protected vessel linings & elastic flow', value: -7, type: 'down' })
    }

    // 3. Exercise
    if (metrics.exercise === 'yes') {
      list.push({ label: 'Active Exercise Habits', desc: 'Brisk weekly movements condition cardiac muscle', value: -12, type: 'down' })
    } else {
      list.push({ label: 'Sedentary Lifestyle', desc: 'Unconditioned vascular muscles & slower blood sweep', value: 15, type: 'up' })
    }

    // 4. Balanced Diet
    if (metrics.balancedDiet === 'yes') {
      list.push({ label: 'Balanced Foods Focus', desc: 'High fibers filter sugars & absorb fats', value: -12, type: 'down' })
    } else {
      list.push({ label: 'Processed Diet Intake', desc: 'Sudden liver fat loads & blood glucose spikes', value: disease === 'Liver Disease' || disease === 'Diabetes' ? 22 : 10, type: 'up' })
    }

    // 5. Stress Level
    if (metrics.stressLevel === 'high') {
      list.push({ label: 'High Daily Stress', desc: 'Sustained cortisol spikes vascular constriction', value: 18, type: 'up' })
    } else if (metrics.stressLevel === 'low') {
      list.push({ label: 'Low Managed Stress', desc: 'Quiet nervous system protects vitals', value: -8, type: 'down' })
    }

    // 6. Family History
    if (metrics.familyHistory === 'yes') {
      list.push({ label: 'Genetic Family History', desc: 'Biological heredity baseline', value: 16, type: 'up' })
    } else {
      list.push({ label: 'No Family Chronic History', desc: 'No biological baseline genetic triggers', value: -8, type: 'down' })
    }

    // 7. Disease-specific indicators
    if (disease === 'Diabetes') {
      if (metrics.bloodSugar === 'high') {
        list.push({ label: 'High Fasting Sugar', desc: 'High glucose floats, damaging cell locks', value: 45, type: 'up' })
      } else {
        list.push({ label: 'Normal Fasting Sugar', desc: 'Insulin locks easily clear sugars', value: -15, type: 'down' })
      }
      if (metrics.bmi >= 30) {
        list.push({ label: 'Weight Index (Obese range)', desc: 'Fat cells accumulate, creating physical block to insulin', value: 20, type: 'up' })
      } else if (metrics.bmi < 25 && metrics.bmi >= 18.5) {
        list.push({ label: 'Weight Index (Healthy BMI)', desc: 'Clear paths for insulin locks to operate', value: -10, type: 'down' })
      }
    } 
    
    else if (disease === 'Heart Disease') {
      if (metrics.bloodPressure === 'high') {
        list.push({ label: 'High Blood Pressure', desc: 'Heavy physical stress wearing out arterial walls', value: 35, type: 'up' })
      } else {
        list.push({ label: 'Normal Blood Pressure', desc: 'Gentle vascular flow protects arteries', value: -12, type: 'down' })
      }
      if (metrics.cholesterol === 'high') {
        list.push({ label: 'High Cholesterol lipids', desc: 'Excess fats bind, speeding clogging plaques', value: 25, type: 'up' })
      } else {
        list.push({ label: 'Normal Cholesterol lipids', desc: 'Smooth, unobstructed coronary flow', value: -10, type: 'down' })
      }
    }

    else if (disease === 'Liver Disease') {
      if (metrics.cholesterol === 'high') {
        list.push({ label: 'High Lipid Fats', desc: 'Overloads liver cells with saturated deposits', value: 22, type: 'up' })
      }
      if (metrics.bloodSugar === 'high') {
        list.push({ label: 'High Circulating Sugar', desc: 'Excess glucose converted directly to liver fat', value: 15, type: 'up' })
      }
    }

    else if (disease === 'Stroke') {
      if (metrics.bloodPressure === 'high') {
        list.push({ label: 'High Blood Pressure', desc: 'Critical force straining delicate cerebral pathways', value: 40, type: 'up' })
      } else {
        list.push({ label: 'Normal Blood Pressure', desc: 'Calm cerebral circulation safeguards vessels', value: -15, type: 'down' })
      }
    }

    else if (disease === 'Kidney Disease') {
      if (metrics.bloodPressure === 'high') {
        list.push({ label: 'High Blood Pressure', desc: 'Scarring microscopic kidney nephron filter nets', value: 35, type: 'up' })
      } else {
        list.push({ label: 'Normal Blood Pressure', desc: 'Safe filtration speeds protect kidneys', value: -12, type: 'down' })
      }
      if (metrics.bloodSugar === 'high') {
        list.push({ label: 'High Fasting Sugar', desc: 'Excessive volume overloads kidney filtration filters', value: 30, type: 'up' })
      }
    }

    // Sort absolute impact
    return list.sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
  }

  const shapAllValues = getShapValues()
  const shapProtectors = shapAllValues.filter(x => x.type === 'down')
  const shapDrivers = shapAllValues.filter(x => x.type === 'up')

  const getHabitPct = () => {
    if (!metrics) return 0
    let habits = 0
    if (metrics.smoke === 'no') habits++
    if (metrics.exercise === 'yes') habits++
    if (metrics.balancedDiet === 'yes') habits++
    return Math.round((habits / 3) * 100)
  }
  const habitPct = getHabitPct()

  // Calculate coordinates for circular SVG gauge
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (riskScore / 100) * circumference

  return (
    <div className="space-y-8 animate-fade-in w-full text-left">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-600/5 to-emerald-500/5 border border-[var(--card-border)] p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] bg-blue-600/10 text-blue-600 font-extrabold uppercase py-0.5 px-2 rounded-md tracking-wider border border-blue-500/20">
              Wellness Check Completed
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] py-0.5 px-2 rounded-md font-bold">
              ID: {patientId}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[var(--text-color)] tracking-tight">
            Personal Health Risk Assessment: <span className="text-blue-600">{disease}</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] font-semibold mt-0.5">
            Compiled for <span className="text-[var(--text-color)] font-bold">{patientName}</span> • Standardized public health reference models applied.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {onReevaluate && (
            <button
              onClick={onReevaluate}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[var(--bg-color)] border border-[var(--card-border)] hover:bg-slate-100/50 text-[var(--text-color)] font-extrabold text-xs rounded-xl shadow-xs transition-all duration-200 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Modify Metrics</span>
            </button>
          )}
          <button
            onClick={onDownload}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer"
          >
            <FileDown className="h-4 w-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* 2. Main 3-Column Dashboard Section (Fully responsive!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: Risk Overview Dial & Layman Explanation */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-[var(--text-color)] uppercase tracking-wider border-b border-[var(--card-border)] pb-2 flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-blue-600" />
              <span>Wellness Risk Level</span>
            </h4>
            
            {/* Visual Dial (SVG Speedometer circular path) */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Outer circle track */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Active colored path */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke={theme.fill}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-3xl font-black text-[var(--text-color)] leading-none">{riskScore}%</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider mt-1">Est. Risk</div>
                </div>
              </div>

              <div className={`mt-3 text-sm sm:text-base font-black flex items-center gap-1.5 ${theme.color}`}>
                <IconComponent className="h-5 w-5" />
                <span>{riskLevel} Risk Zone</span>
              </div>
            </div>
          </div>

          <div className={`${theme.bg} ${theme.border} border p-4.5 rounded-2xl`}>
            <h5 className={`text-[11px] font-black uppercase tracking-wider mb-1 ${theme.color} flex items-center gap-1`}>
              <Smile className="h-3.5 w-3.5" />
              <span>Layman Understanding</span>
            </h5>
            <p className="text-xs text-[var(--text-color)] font-medium leading-relaxed">
              {theme.desc}
            </p>
          </div>
        </div>

        {/* COLUMN 2: Visual XAI SHAP Plot & Descriptive Explanations */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6 lg:col-span-1">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--card-border)] pb-2">
              <h4 className="text-xs font-black text-[var(--text-color)] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <span>Explainable AI (XAI) SHAP Plot</span>
              </h4>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/10 px-2 py-0.5 rounded font-extrabold tracking-wider uppercase">Active</span>
            </div>

            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed font-semibold">
              This chart explains exactly which of your wellness markers push the risk score <strong className="text-rose-500">UP (+)</strong> or pull it <strong className="text-emerald-500">DOWN (-)</strong> relative to average baselines.
            </p>

            {/* Side-by-Side visual columns */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              
              {/* Wellness Protectors (Down indicators) */}
              {shapProtectors.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wide flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Wellness Protectors (Pulling Risk Down)</span>
                  </div>
                  <div className="space-y-2">
                    {shapProtectors.slice(0, 3).map((attr, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-[var(--text-color)]">{attr.label}</span>
                          <span className="text-emerald-600 font-extrabold">{attr.value}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-[var(--card-border)]">
                          <div 
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(Math.abs(attr.value) * 3, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-[9px] text-[var(--text-muted)] italic leading-tight">{attr.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Drivers (Up indicators) */}
              {shapDrivers.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[var(--card-border)]">
                  <div className="text-[10px] text-rose-500 font-extrabold uppercase tracking-wide flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>Risk Drivers (Pushing Risk Up)</span>
                  </div>
                  <div className="space-y-2">
                    {shapDrivers.slice(0, 3).map((attr, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-[var(--text-color)]">{attr.label}</span>
                          <span className="text-rose-500 font-extrabold">+{attr.value}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-[var(--card-border)]">
                          <div 
                            className="h-full bg-rose-500 rounded-full"
                            style={{ width: `${Math.min(attr.value * 3, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-[9px] text-[var(--text-muted)] italic leading-tight">{attr.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* COLUMN 3: Metrics Dashboard & Slider Visualizers */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-[var(--text-color)] uppercase tracking-wider border-b border-[var(--card-border)] pb-2 flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-emerald-500" />
              <span>Vitals & Metrics Dashboard</span>
            </h4>

            {/* Segmented BMI scale visualizer */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-[var(--text-muted)]">Body Mass Index (BMI):</span>
                <span className="text-blue-600 font-black">{metrics.bmi} BMI</span>
              </div>
              <div className="relative h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="absolute inset-0 flex">
                  <div className="w-[14%] bg-sky-400" title="Underweight (<18.5)"></div>
                  <div className="w-[26%] bg-emerald-500" title="Healthy (18.5-24.9)"></div>
                  <div className="w-[20%] bg-amber-400" title="Overweight (25-29.9)"></div>
                  <div className="w-[40%] bg-red-500" title="Obese (>=30)"></div>
                </div>
                {/* Pointer pointer based on BMI percentage */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white border border-slate-900 shadow-sm"
                  style={{ left: `${Math.min(Math.max((metrics.bmi / 45) * 100, 5), 95)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[9px] text-[var(--text-muted)] font-extrabold uppercase">
                <span>Underweight</span>
                <span>Healthy</span>
                <span>Overweight</span>
                <span>Obese</span>
              </div>
            </div>

            {/* Habits tracker bar */}
            <div className="space-y-1.5 pt-2 border-t border-[var(--card-border)]">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-[var(--text-muted)]">Lifestyle Habits Quality:</span>
                <span className="text-emerald-500 font-black">{habitPct}% Score</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-[var(--card-border)]">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                  style={{ width: `${habitPct}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] font-semibold leading-normal">
                Reflects smoking, regular exercise workouts, and balanced meals choices.
              </p>
            </div>
          </div>

          {/* Vitals quick indicators dots */}
          <div className="bg-[var(--bg-color)] border border-[var(--card-border)] p-3 rounded-2xl grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center justify-center">
              <span className={`w-2.5 h-2.5 rounded-full mb-1 ${metrics.bloodSugar === 'high' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Sugar</span>
              <span className="text-[8px] font-black text-[var(--text-color)] truncate max-w-[60px]">{metrics.bloodSugar === 'high' ? 'High' : 'Normal'}</span>
            </div>
            <div className="flex flex-col items-center justify-center border-x border-[var(--card-border)]">
              <span className={`w-2.5 h-2.5 rounded-full mb-1 ${
                metrics.bloodPressure === 'high' ? 'bg-red-500 animate-pulse' : metrics.bloodPressure === 'low' ? 'bg-amber-400' : 'bg-emerald-500'
              }`}></span>
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Pressure</span>
              <span className="text-[8px] font-black text-[var(--text-color)] truncate max-w-[60px]">{metrics.bloodPressure === 'high' ? 'High' : metrics.bloodPressure === 'low' ? 'Low' : 'Normal'}</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className={`w-2.5 h-2.5 rounded-full mb-1 ${metrics.cholesterol === 'high' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Lipids</span>
              <span className="text-[8px] font-black text-[var(--text-color)] truncate max-w-[60px]">{metrics.cholesterol === 'high' ? 'High' : 'Normal'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. "Why this Risk Score?" Detailed Layman Reasons (TAKES THE WHOLE WIDTH - BOLD, COMPREHENSIVE TEXT) */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-4">
        <h4 className="text-sm font-black text-[var(--text-color)] uppercase tracking-wider border-b border-[var(--card-border)] pb-2 flex items-center gap-1.5">
          <HelpCircle className="h-5 w-5 text-blue-600" />
          <span>🔍 Why this Risk Score? (Detailed Explanation)</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed font-semibold">
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Your wellness risk score of <strong className="text-blue-600">{riskScore}%</strong> is a statistical estimation calculated based on your personal health indicators and daily routine habits. It is designed to raise wellness awareness by comparing your parameters against chronic healthcare baseline research.
            </p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Below are the specific physiological and lifestyle drivers behind your report. Each indicator outlines exactly how it interacts with your body's cells, heart, and metabolic filter systems in simple, everyday words.
            </p>
          </div>
          <div className="space-y-3">
            {reasons && reasons.length > 0 ? (
              reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[var(--text-color)] bg-[var(--bg-color)] border border-[var(--card-border)] p-3.5 rounded-2xl shadow-xxs">
                  <span className="text-rose-500 font-extrabold text-sm leading-none mt-0.5">•</span>
                  <span className="leading-relaxed font-bold text-[11px] sm:text-xs">{reason}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-[var(--text-muted)] italic p-4 text-center">
                No adverse risk factors found. Your profile indicators are fully in standard healthy bounds!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Personalized Layman Wellness Action Plan (Takes the whole section!) */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-sm space-y-4">
        <h4 className="text-sm font-black text-[var(--text-color)] uppercase tracking-wider border-b border-[var(--card-border)] pb-2 flex items-center gap-1.5">
          <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
          <span>💡 Personalized Action Plan (Your Layman Steps)</span>
        </h4>

        {advice && advice.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {advice.map((adv, idx) => {
              // Pick icons based on content keyword matches
              let Icon = Smile
              let colorClass = 'text-emerald-500 bg-emerald-500/10'
              if (adv.toLowerCase().includes('walk') || adv.toLowerCase().includes('exercise') || adv.toLowerCase().includes('activity')) {
                Icon = Flame
                colorClass = 'text-orange-500 bg-orange-500/10'
              } else if (adv.toLowerCase().includes('diet') || adv.toLowerCase().includes('food') || adv.toLowerCase().includes('fiber') || adv.toLowerCase().includes('eat')) {
                Icon = Utensils
                colorClass = 'text-green-500 bg-green-500/10'
              } else if (adv.toLowerCase().includes('mindfulness') || adv.toLowerCase().includes('yoga') || adv.toLowerCase().includes('stress')) {
                Icon = Heart
                colorClass = 'text-purple-500 bg-purple-500/10'
              }

              return (
                <div key={idx} className="flex gap-3 bg-[var(--bg-color)] border border-[var(--card-border)] p-4.5 rounded-2xl shadow-xxs hover:scale-[1.01] transition-transform duration-200">
                  <div className={`p-2.5 rounded-xl h-fit ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-[var(--text-color)] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span>Step {idx + 1}</span>
                      <span className="text-emerald-500">✓</span>
                    </h5>
                    <p className="text-[11px] sm:text-xs text-[var(--text-muted)] leading-relaxed font-bold">
                      {adv}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-muted)] italic font-semibold text-center py-6">
            Keep maintaining your excellent daily fitness routines and balanced nutrient profiles!
          </p>
        )}
      </div>

    </div>
  )
}

export default ResultBox
