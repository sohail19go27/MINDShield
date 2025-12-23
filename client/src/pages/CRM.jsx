import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import LinearProgress from '@mui/material/LinearProgress'
import { getHabitsData, calcPointsForHabit } from '../utils/habits'

export default function CRM(){
  // Redeem / points data
  const [totalPoints, setTotalPoints] = useState(0)
  const redeemedPoints = 0
  const remainingPoints = Math.max(0, totalPoints - redeemedPoints)
  const redeemPie = [
    { name: 'Redeemed', value: redeemedPoints },
    { name: 'Remaining', value: remainingPoints },
  ]
  const REDEEM_COLORS = ['#38bdf8', '#e5e7eb']

  const rewards = [
    { title: 'Movie Night 🍿', cost: 100, date: 'Oct 15' },
    { title: 'Book: Deep Work 📘', cost: 200, date: 'Sep 30' },
  ]

  // Discipline heatmap sample (last 28 days)
  const disciplineDays = Array.from({ length: 28 }).map((_, i) => {
    // random consistency score 0-100 for demo
    const score = [95,80,60,40,20,10,0][i % 7] + (i % 3) * 5
    return { day: i + 1, score }
  })

  // Active goals
  const [activeGoals, setActiveGoals] = useState([
    { id: 1, title: 'Learn React', progress: 75, type: 'Priority', deadlineDays: 5 },
    { id: 2, title: 'Meditation', progress: 60, type: 'Habit', deadlineDays: 12 },
    { id: 3, title: 'Build Portfolio', progress: 40, type: 'Skill', deadlineDays: 30 },
  ])

  // Activity timeline sample
  const timeline = [
    { time: '10:00 AM', text: 'Completed Priority "C++ Practice" (+10 pts)', icon: '✅' },
    { time: '12:15 PM', text: 'Redeemed 50 pts for Other skills', icon: '🎁' },
    { time: 'Yesterday', text: 'Missed Meditation 😞', icon: '⚠️' },
  ]

  // Goal success rate
  const goalsCompleted = 12
  const goalsAbandoned = 3
  const goalSuccessRate = Math.round((goalsCompleted / (goalsCompleted + goalsAbandoned)) * 100)

  useEffect(()=>{
    Promise.all([
      axios.get('http://localhost:5000/api/analytics/summary').catch(() => ({ data: { priorities: [] } })),
      Promise.resolve(getHabitsData())
    ]).then(([serverRes, habitsData]) => {
      const priorities = (serverRes.data && serverRes.data.priorities) || []
      const priorityPoints = priorities.reduce((acc,p)=> acc + (p.points||0), 0)
      const total = priorityPoints + habitsData.totalPoints
      
      // Compute overall streak including both priorities and habits
      const overallStreak = Math.max(
        priorities.reduce((acc,p)=> Math.max(acc, p.streak || 0), 0),
        habitsData.maxStreak
      )
      
      setTotalPoints(total)
      
      // Update CSS variable for streak visualization
      const root = document.documentElement
      root.style.setProperty('--crm-overall-streak', String(overallStreak))
      
      // Update active goals to include habits
      setActiveGoals([
        ...priorities.slice(0, 2).map(p => ({
          id: p.id,
          title: p.title,
          progress: Math.min(100, Math.round((p.points || 0) / 100 * 100)),
          type: 'Priority',
          deadlineDays: 30 // placeholder, could be calculated from priority deadline
        })),
        ...[...habitsData.develop, ...habitsData.remove].slice(0, 1).map(h => ({
          id: h.id,
          title: h.title,
          progress: Math.min(100, Math.round(calcPointsForHabit(h) / 50 * 100)),
          type: 'Habit',
          deadlineDays: 12 // placeholder for habits
        }))
      ])
    })
  },[])

  return (
    <div className="pt-6">
      <h2 className="text-2xl font-bold mb-4">CRM</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="p-4 ms-glass rounded">
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-semibold">🎯 Redeem points</div>
            <div className="text-sm text-slate-500">Next goal: Movie Night — 100 pts</div>
          </div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={redeemPie} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={2}>
                  {redeemPie.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={REDEEM_COLORS[idx % REDEEM_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} pts`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

  <div className="p-4 ms-glass rounded">
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-semibold">📅 Discipline</div>
            <div className="text-sm text-slate-500">Best streak: 7 days • Avg: 72%</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {disciplineDays.map((d) => {
              const opacity = Math.min(1, Math.max(0.05, d.score / 100))
              const bg = d.score === 0 ? 'bg-red-600' : 'bg-emerald-500'
              return (
                <div key={d.day} className={`h-6 w-full rounded`} title={`Day ${d.day}: ${d.score}%`} style={{ backgroundColor: d.score === 0 ? `rgba(239,68,68,${opacity})` : `rgba(16,185,129,${opacity})` }} />
              )
            })}
          </div>
        </div>

  <div className="p-4 ms-glass rounded col-span-2">
          <div className="flex gap-4">
            {/* Active Goals (left) */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-semibold">🎯 Active Goals</div>
                <div className="text-sm text-slate-500">3 goals active</div>
              </div>
              <div className="space-y-3">
                {activeGoals.map((g) => (
                  <div key={g.id} className="p-3 bg-slate-800 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">{g.title}</div>
                      <div className="text-sm text-slate-400">{g.deadlineDays} days left</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <LinearProgress variant="determinate" value={g.progress} sx={{ height: 8, borderRadius: 2, backgroundColor: '#1f2937', '& .MuiLinearProgress-bar': { background: g.type === 'Priority' ? '#38bdf8' : g.type === 'Skill' ? '#f59e42' : '#10b981' } }} />
                        <div className="text-sm text-slate-400 mt-1">{g.progress}%</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-2 py-1 text-sm bg-indigo-600 rounded">Edit</button>
                        <button className="px-2 py-1 text-sm bg-emerald-600 rounded">Complete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Consistency Tracker (right) */}
            <div className="w-1/2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-semibold">📈 Consistency Tracker</div>
                <div className="text-sm text-slate-500">% tasks completed daily</div>
              </div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={
                    // last 7 days demo data
                    [
                      { day: 'Mon', percent: 80 },
                      { day: 'Tue', percent: 90 },
                      { day: 'Wed', percent: 60 },
                      { day: 'Thu', percent: 70 },
                      { day: 'Fri', percent: 100 },
                      { day: 'Sat', percent: 40 },
                      { day: 'Sun', percent: 55 },
                    ]
                  } margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Line type="step" dataKey="percent" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="ms-glass p-4 rounded">
          <h3 className="font-semibold mb-2">Activity Timeline</h3>
          <div className="space-y-3">
            {timeline.map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="text-xl mt-1">{t.icon}</div>
                <div>
                  <div className="text-sm text-slate-400">{t.time}</div>
                  <div className="text-sm">{t.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Small total points card (from server) */}
          <div className="mt-4">
            <div className="p-4 ms-glass rounded w-44">
              <div className="text-sm text-slate-400">From Priorities</div>
              <div className="text-2xl font-bold">{totalPoints}</div>
            </div>
          </div>
        </div>

        <div className="ms-glass p-4 rounded">
          <h3 className="font-semibold mb-2">Goal Success Rate</h3>
          <div className="flex items-center justify-center h-32">
            {/* Simple semi-circle gauge using SVG */}
            <svg width="140" height="80" viewBox="0 0 140 80">
              <path d="M10 70 A60 60 0 0 1 130 70" stroke="#e5e7eb" strokeWidth="16" fill="none" strokeLinecap="round"/>
              <path d="M10 70 A60 60 0 0 1 " stroke="#38bdf8" strokeWidth="16" fill="none" strokeLinecap="round" strokeDasharray={`${(goalSuccessRate/100)*380} 380`} />
              <text x="70" y="45" textAnchor="middle" className="text-xl" style={{ fontSize: '20px', fill: '#fff' }}>{goalSuccessRate}%</text>
              <text x="70" y="64" textAnchor="middle" style={{ fontSize: '12px', fill: '#9ca3af' }}>Success</text>
            </svg>
          </div>
          <div className="text-sm text-slate-400 mt-2">{goalsCompleted} completed • {goalsAbandoned} abandoned</div>
        </div>
      </div>

      <div className="mt-6 ms-glass p-4 rounded">
        <h3 className="font-semibold">Redeem History</h3>
        <div className="mt-3 space-y-2">
          {rewards.map((r, i) => (
            <div key={i} className="flex justify-between items-center">
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-sm text-slate-400">{r.date}</div>
              </div>
              <div className="text-sm text-slate-200">-{r.cost} pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
