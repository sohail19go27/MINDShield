import React from 'react'

export default function Bar({ value=0 }){
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className="w-full h-2 rounded bg-slate-200/40 dark:bg-slate-700/60 overflow-hidden">
      <div className="h-full bg-sky-500 dark:bg-sky-400" style={{ width: clamped + '%' }} />
    </div>
  )
}
