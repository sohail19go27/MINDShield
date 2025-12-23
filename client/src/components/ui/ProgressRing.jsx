import React from 'react'
import CircularProgress from '@mui/material/CircularProgress'

export default function ProgressRing({ value=0, size=72, thickness=5, label }){
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <CircularProgress variant="determinate" value={clamped} size={size} thickness={thickness} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-sm font-semibold">{Math.round(clamped)}%</div>
      </div>
      {label && <div className="sr-only">{label}</div>}
    </div>
  )
}
