import React from 'react'
import CircularProgress from '@mui/material/CircularProgress'

export default function TopBar({ date = new Date(), streakDays = 12, pointsToday = 75, dailyTarget = 120 }){
  const percent = Math.round((pointsToday / dailyTarget) * 100)
  const formattedDate = date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="text-sm text-slate-400">{formattedDate}</div>
        <div className="text-2xl font-bold">Welcome back</div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-sm text-slate-400">Streak</div>
          <div className="text-lg font-semibold">{streakDays} days</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-16 h-16 relative">
            <CircularProgress variant="determinate" value={percent} size={64} thickness={6} style={{ color: '#38bdf8' }} />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">{percent}%</div>
          </div>
          <div>
            <div className="text-sm text-slate-400">Points today</div>
            <div className="text-lg font-semibold">{pointsToday} pts</div>
          </div>
        </div>
      </div>
    </div>
  )
}
