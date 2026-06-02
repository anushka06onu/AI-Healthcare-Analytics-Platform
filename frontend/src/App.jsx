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

      {/* Premium Spacious Multi-Column Footer */}
      <footer className="bg-[var(--card-bg)] border-t border-[var(--card-border)] py-12 transition-colors shadow-inner mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 pb-8 border-b border-[var(--card-border)]">
            
            {/* Column 1: Brand details */}
            <div className="md:col-span-5 space-y-3">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[var(--text-color)] block">
                Health<span className="text-blue-600">AI</span>
              </span>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-semibold max-w-sm">
                Empowering proactive health risk awareness with transparent and explainable AI metric attributions. Accessible to everyone, everywhere.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Quick Navigation</h4>
              <div className="flex flex-col gap-2">
                {[
                  { id: 'home', label: 'Dashboard' },
                  { id: 'predict', label: 'Risk Checker' },
                  { id: 'history', label: 'History' },
                  { id: 'about', label: 'About' }
                ].map((link) => (
                  <button
                    key={link.id}
                    onClick={() => setPage(link.id)}
                    className="text-left text-xs sm:text-sm text-[var(--text-muted)] hover:text-blue-600 dark:hover:text-blue-400 font-extrabold transition-all cursor-pointer w-fit"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Column 3: Contact Us on the Right Side */}
            <div className="md:col-span-4 space-y-3 md:text-right">
              <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider md:text-right">Contact Support</h4>
              <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-[var(--text-muted)] font-semibold">
                <p>Location: Dhaka, Bangladesh</p>
                <p>Email: <a href="mailto:anushkaonu@gmail.com" className="hover:underline font-extrabold text-blue-600 dark:text-blue-400">anushkaonu@gmail.com</a></p>
                <button 
                  onClick={() => setPage('contact')} 
                  className="text-left md:text-right text-blue-600 dark:text-blue-400 font-black hover:underline cursor-pointer focus:outline-none w-fit md:ml-auto"
                >
                  ✉️ Access Contact Form
                </button>
              </div>
            </div>

          </div>

          {/* Bottom section: Copyrights & Developer Credit */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--text-muted)] font-semibold">
            <p>© 2026 HealthAI Platform. All rights reserved.</p>
            
            <p className="flex items-center gap-1.5">
              <span>Developed by</span>
              <a 
                href="https://fatehahossainanushka.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 dark:text-blue-400 font-black hover:underline"
              >
                Fateha Hossain Anushka
              </a>
            </p>
          </div>

          <p className="text-xxs text-[var(--text-muted)] opacity-70 leading-relaxed font-semibold mt-4 text-center border-t border-[var(--card-border)]/50 pt-4">
            Intended strictly for health awareness and educational reference. Not a substitute for professional medical diagnostics or clinical treatments.
          </p>

        </div>
      </footer>
    </div>
  )
}

export default App
