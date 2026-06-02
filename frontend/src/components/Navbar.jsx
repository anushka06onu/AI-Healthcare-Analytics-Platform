import React, { useState } from 'react'
import { Sun, Moon, Activity, Menu, X, User } from 'lucide-react'

function Navbar({ activePage, setPage, darkMode, setDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'home', label: 'Dashboard' },
    { id: 'predict', label: 'Predict' },
    { id: 'history', label: 'History' },
    { id: 'about', label: 'About' },
  ]

  const handleNavClick = (pageId) => {
    setPage(pageId)
    setMobileMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-health-darkCard/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => handleNavClick('home')}
          >
            <div className="bg-blue-600 dark:bg-health-primary p-1.5 rounded-lg text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Activity className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
              Health<span className="text-blue-600 dark:text-health-primary">AI</span>
            </span>
          </div>

          {/* Center Side: Desktop Tabs Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-health-primary'
                      : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Right Side: Options (Theme Toggle & Profile) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5 text-slate-700" />}
            </button>

            {/* Profile badge dummy */}
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
              <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full text-slate-600 dark:text-slate-400">
                <User className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active User</span>
            </div>
          </div>

          {/* Mobile hamburger menu button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Theme switcher for mobile */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-700" />}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-health-darkCard border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
          <div className="px-2 pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-health-primary'
                      : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
            
            <div className="border-t border-slate-100 dark:border-slate-800/50 mt-2 pt-3 px-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Profile Session</span>
              <span className="text-xs font-extrabold text-blue-600 dark:text-health-primary">Active User</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
