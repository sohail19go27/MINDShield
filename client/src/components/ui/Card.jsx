import React from 'react'

export default function Card({ children, onClick, className='' }){
  return (
    <div onClick={onClick} className={`rounded-2xl overflow-hidden 
      bg-[var(--ms-card-bg-light)] dark:bg-[var(--ms-card-bg-dark)]
      border border-[var(--ms-card-border)] dark:border-[var(--ms-card-border-2)]
      shadow-[0_4px_12px_0_var(--ms-card-hover-shadow)]
      transition-all duration-[var(--ms-transition-speed)] ${className} ms-scale-hover`}>
      {children}
    </div>
  )
}
