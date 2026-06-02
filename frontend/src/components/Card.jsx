import React from 'react'

function Card({ children, className = '', hover = true }) {
  return (
    <div 
      className={`bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 sm:p-6 shadow-[var(--shadow)] transition-all duration-300 ${
        hover ? 'hover:-translate-y-0.5 hover:scale-[1.01] hover:border-blue-500/30' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

export default Card
