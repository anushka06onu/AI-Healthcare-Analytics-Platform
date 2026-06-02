import React from 'react'
import { Activity, ShieldCheck, Heart, Brain, FileText, TrendingUp } from 'lucide-react'
import Card from '../components/Card'

function Home({ setPage }) {
  // Features details array
  const features = [
    {
      icon: Activity,
      title: "Multi-Disease Risk Scoring",
      desc: "Instant risk estimation across 5 chronic categories including Heart and Kidney.",
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20"
    },
    {
      icon: ShieldCheck,
      title: "100% Layperson Wording",
      desc: "All clinical indicators explained in plain everyday words without medical jargon.",
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
    },
    {
      icon: TrendingUp,
      title: "Diagnostics History Logs",
      desc: "Log your results over time and track your health improvement trends automatically.",
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/20"
    },
    {
      icon: FileText,
      title: "Simulated EMR PDF Reports",
      desc: "Compile patient details and care advisors directly into a printable EMR report.",
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20"
    }
  ]

  return (
    <div className="space-y-16 py-4 sm:py-8">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Side: Copywriting */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-health-primary px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Activity className="h-4 w-4 animate-pulse" />
            <span>AI Health Risk assistant</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-slate-900 dark:text-white">
            Understand Your <br />
            <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              Health Risks Simply
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
            A friendly health awareness assistant that translates complex medical indicators into simple, easy-to-understand human language.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setPage('predict')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Check Your Health Risk
            </button>
          </div>
        </div>

        {/* Right Side: Reassuring Abstract Vector Graphic */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[340px] aspect-square rounded-3xl bg-gradient-to-tr from-blue-500/10 to-emerald-500/10 flex items-center justify-center p-8 border border-slate-200/20 dark:border-slate-800/20 shadow-xxs">
            {/* Soft decorative background circles */}
            <div className="absolute inset-0 bg-radial-gradient from-blue-400/20 to-transparent blur-2xl"></div>
            
            {/* SVG Clinical Abstract Image */}
            <svg viewBox="0 0 200 200" className="w-full h-full text-blue-600 dark:text-health-primary">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              {/* Outer medical network track */}
              <circle cx="100" cy="100" r="85" fill="none" stroke="url(#gradient)" strokeWidth="1.5" strokeDasharray="5 5" className="opacity-40 animate-spin" style={{ animationDuration: '40s' }} />
              {/* Concentric grid layers */}
              <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-20" />
              {/* Heart pulse wave line */}
              <path d="M 35 100 L 70 100 L 80 80 L 90 130 L 105 50 L 115 110 L 125 90 L 135 100 L 165 100" fill="none" stroke="url(#gradient)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="pulse-glow" />
              {/* Central diagnostics status nodes */}
              <circle cx="105" cy="50" r="4.5" fill="#10B981" />
              <circle cx="90" cy="130" r="4.5" fill="#2563EB" />
            </svg>
          </div>
        </div>
      </div>

      {/* Features Showcase Section */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Designed for Health Awareness
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Discover the EMR diagnostics support assets integrated within this analytics assistant.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon
            return (
              <Card key={idx} className="flex flex-col items-center text-center p-6 space-y-4">
                <div className={`p-3 rounded-2xl ${f.color} shadow-sm`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-450 leading-relaxed">
                  {f.desc}
                </p>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Home
