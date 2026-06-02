import React, { useState } from 'react'
import { Sun, Moon, Activity, Menu, X, User } from 'lucide-react'

function Navbar({ activePage, setPage, darkMode, setDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Layperson friendly tab navigation list
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--card-bg)]/90 backdrop-blur-md border-b border-[var(--card-border)] transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Brand Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => handleNavClick('home')}
          >
            <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-md shadow-blue-500/25 group-hover:scale-105 active:scale-95 transition-all duration-200">
              <Activity className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[var(--text-color)]">
              Health<span className="text-blue-600">AI</span>
            </span>
          </div>

          {/* Center Side: Desktop Tabs */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 scale-[1.02] shadow-sm'
                      : 'text-[var(--text-muted)] hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-[var(--text-color)]'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Right Side: Options (Theme Toggle & Public Profile) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl border border-[var(--card-border)] text-[var(--text-muted)] hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-[var(--text-color)] hover:scale-105 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5 text-slate-600" />}
            </button>

            {/* Profile badge dummy for general public */}
            <div className="flex items-center gap-2 border-l border-[var(--card-border)] pl-3 select-none">
              <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full text-[var(--text-muted)]">
                <User className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs font-extrabold text-[var(--text-color)]">Guest User</span>
            </div>
          </div>

          {/* Mobile hamburger menu button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Theme switcher for mobile */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg border border-[var(--card-border)] text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg border border-[var(--card-border)] text-[var(--text-color)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[var(--card-bg)] border-b border-[var(--card-border)] transition-all duration-300">
          <div className="px-2 pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400'
                      : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
            
            <div className="border-t border-[var(--card-border)] mt-2 pt-3 px-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-muted)]">Active Profile</span>
              <span className="text-xs font-extrabold text-blue-600">Guest User</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
