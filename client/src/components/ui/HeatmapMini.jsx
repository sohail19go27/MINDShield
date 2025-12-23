import React from 'react'

// data: array of numbers 0..1 indicating intensity; length flexible
export default function HeatmapMini({ data = [] }){
  const cells = data.slice(-28) // last 4 weeks
  const colors = (v) => {
    if (v <= 0) return 'bg-slate-300/30 dark:bg-slate-700/40'
    if (v < 0.33) return 'bg-emerald-200 dark:bg-emerald-700/60'
    if (v < 0.66) return 'bg-emerald-400 dark:bg-emerald-500'
    return 'bg-emerald-600'
  }
  return (
    <div className="grid grid-cols-7 gap-1">
      {cells.map((v, i) => (
        <div key={i} className={`w-3 h-3 rounded ${colors(v)}`} />
      ))}
    </div>
  )
}
