import React from 'react'
import clsx from 'clsx'

export default function Button({ children, variant='default', className='', ...props }){
  const base = 'px-4 py-2 rounded-md font-medium transition-all duration-[var(--ms-transition-speed)] ms-focus-ring ms-scale-hover'
  const variants = {
    default: 'bg-[var(--ms-button-bg)] text-white hover:bg-[var(--ms-button-hover)]',
    ghost: 'bg-transparent text-white border border-[var(--ms-input-border)] hover:bg-[var(--ms-card-bg-light)]',
    outline: 'bg-transparent text-white border border-[var(--ms-input-border)]'
  }
  return (
    <button className={clsx(base, variants[variant], className)} {...props}>{children}</button>
  )
}
