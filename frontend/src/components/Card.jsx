import React from 'react'

function Card({ children, className = '', hover = true }) {
  return (
    <div 
      className={`bg-white dark:bg-health-darkCard border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md dark:shadow-slate-950/20 transition-all duration-300 ${
        hover ? 'hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

export default Card
