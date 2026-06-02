import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Predict from './pages/Predict'
import History from './pages/History'
import About from './pages/About'
import Contact from './pages/Contact'

function App() {
  const [page, setPage] = useState('home')
  const [darkMode, setDarkMode] = useState(false)
  
  // Historical screening logs initialized with clean, realistic baseline cases
  const [predictions, setPredictions] = useState([
    {
      id: 1,
      date: '2026-05-18',
      disease: 'Heart Disease',
      riskScore: 24,
      riskLevel: 'Low',
      trend: 'improving',
      clinician: 'Self Screened'
    },
    {
      id: 2,
      date: '2026-05-24',
      disease: 'Diabetes',
      riskScore: 58,
      riskLevel: 'Medium',
      trend: 'worsening',
      clinician: 'Self Screened'
    },
    {
      id: 3,
      date: '2026-06-01',
      disease: 'Kidney Disease',
      riskScore: 12,
      riskLevel: 'Low',
      trend: 'improving',
      clinician: 'Self Screened'
    }
  ])

  // Synchronize dynamic dark mode state with document class list
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Health tips ticker array
  const healthTips = [
    "Drinking enough water supports your kidney filtration levels daily.",
    "Brisk walking for 30 minutes significantly lowers long-term cardiovascular risks.",
    "Limiting added sugars helps protect liver cells from fat accumulation.",
    "Consuming high-fiber foods helps regulate healthy blood sugar trends.",
    "A diet low in sodium is highly effective for maintaining normal blood pressure."
  ]
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % healthTips.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300">
      {/* Sticky Responsive Header Navbar */}
      <Navbar 
        activePage={page} 
        setPage={setPage} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />

      {/* Main Pages Canvas Content */}
      <main className="flex-grow pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-12">
        {page === 'home' && <Home setPage={setPage} />}
        {page === 'predict' && (
          <Predict 
            predictions={predictions} 
            setPredictions={setPredictions} 
            setPage={setPage}
          />
        )}
        {page === 'history' && <History predictions={predictions} />}
        {page === 'about' && <About />}
        {page === 'contact' && <Contact />}
      </main>

      {/* Dynamic Health Tips Ticker Banner */}
      <div className="bg-blue-50 dark:bg-slate-800/40 border-y border-blue-100 dark:border-slate-800 py-3 text-center transition-colors">
        <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium px-4 flex items-center justify-center gap-2">
          <span>💡 Did You Know?</span>
          <span className="italic">"{healthTips[tipIndex]}"</span>
        </p>
      </div>

      {/* Premium Clinical styled Footer */}
      <footer className="bg-[var(--card-bg)] border-t border-[var(--card-border)] py-6 text-center transition-colors shadow-inner">
        <div className="max-w-7xl mx-auto px-4 text-xs sm:text-sm text-[var(--text-muted)] space-y-1.5">
          <p className="font-medium">© 2026 HealthAI Platform | Dynamic Awareness & Health Risk Estimation</p>
          <p className="font-semibold text-xs text-[var(--text-muted)]">
            Developed by{' '}
            <a 
              href="https://fatehahossainanushka.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 dark:text-blue-400 font-extrabold hover:underline"
            >
              Fateha Hossain Anushka
            </a>
          </p>
          <p className="text-xxs sm:text-xs mt-1 text-[var(--text-muted)] opacity-80">
            Intended strictly for health awareness and educational reference. Not a substitute for professional medical diagnostics.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
