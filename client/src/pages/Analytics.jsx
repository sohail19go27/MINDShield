import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine, BarChart, Bar, LabelList, LineChart, Line, Legend } from 'recharts'
import { getHabitsData, calcPointsForHabit, todayKey } from '../utils/habits'

export default function Analytics(){
  // Performance over time data
  const [performanceData, setPerformanceData] = useState([
    { date: '10/23', points: 85, focusHours: 2.5, streakDays: 1 },
    { date: '10/24', points: 120, focusHours: 3.2, streakDays: 2 },
    { date: '10/25', points: 20, focusHours: 1.5, streakDays: 3 },
    { date: '10/26', points: 0, focusHours: 0, streakDays: 0 },
    { date: '10/27', points: 95, focusHours: 2.8, streakDays: 1 },
    { date: '10/28', points: 145, focusHours: 4.1, streakDays: 2 },
    { date: '10/29', points: 110, focusHours: 3.5, streakDays: 3 },
  ])

  // Productivity/Bounce rate data
  const productivityData = [
    { date: '10/23', points: 85, isComeback: false },
    { date: '10/24', points: 120, isComeback: false },
    { date: '10/25', points: 20, isComeback: false },
    { date: '10/26', points: 0, isComeback: false },
    { date: '10/27', points: 95, isComeback: true },
    { date: '10/28', points: 145, isComeback: false },
    { date: '10/29', points: 110, isComeback: false },
  ]

  // Session time data (weekly)
  const sessionTimeData = [
    { day: 'Mon', focusTime: 2.5, target: 3 },
    { day: 'Tue', focusTime: 3.2, target: 3 },
    { day: 'Wed', focusTime: 4.1, target: 3 },
    { day: 'Thu', focusTime: 2.8, target: 3 },
    { day: 'Fri', focusTime: 3.5, target: 3 },
    { day: 'Sat', focusTime: 1.5, target: 3 },
    { day: 'Sun', focusTime: 2.2, target: 3 },
  ]
  const [totalPoints, setTotalPoints] = useState(0)
  const [pointsData, setPointsData] = useState([
    { name: 'Priorities', value: 1 },
    { name: 'Skills', value: 1 },
    { name: 'Habits', value: 1 },
  ])
  const weeklyGrowth = 12 // percent (placeholder)

  useEffect(()=>{
    // fetch per-priority summary from server AND get habits data
    Promise.all([
      axios.get('http://localhost:5000/api/analytics/summary').catch(() => ({ data: { priorities: [] } })),
      Promise.resolve(getHabitsData())
    ]).then(([serverRes, habitsData]) => {
      const priorities = (serverRes.data && serverRes.data.priorities) || []
      const priorityPoints = priorities.reduce((acc,p)=> acc + (p.points||0), 0)
      const total = priorityPoints + habitsData.totalPoints
      setTotalPoints(total)

      // compute overall streak = max streak among ALL items
      const overallStreak = Math.max(
        priorities.reduce((acc,p)=> Math.max(acc, p.streak || 0), 0),
        habitsData.maxStreak
      )

      // Create points distribution data
      const pd = [
        { name: 'Priorities', value: priorityPoints },
        { name: 'Develop Habits', value: habitsData.develop.reduce((acc, h) => acc + calcPointsForHabit(h), 0) },
        { name: 'Remove Habits', value: habitsData.remove.reduce((acc, h) => acc + calcPointsForHabit(h), 0) }
      ].filter(item => item.value > 0)
      
      if (pd.length < 3) {
        while (pd.length < 3) pd.push({ name: 'Other', value: 1 })
      }
      setPointsData(pd)

      // Update performance data with habit points included
      const now = new Date()
      const updatedPerformanceData = [...performanceData]
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const key = todayKey(date)
        const habitPoints = habitsData.dailyPoints[key] || 0
        const idx = performanceData.length - 1 - i
        if (idx >= 0 && idx < updatedPerformanceData.length) {
          updatedPerformanceData[idx] = {
            ...updatedPerformanceData[idx],
            points: updatedPerformanceData[idx].points + habitPoints
          }
        }
      }
      setPerformanceData(updatedPerformanceData)
    })
  },[])
  const COLORS = ['#38bdf8', '#6366f1', '#f59e42']

  return (
    <div className="pt-6">
      <h2 className="text-2xl font-bold mb-4">Analytics</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
          {/* Total Points Card */}
    <div className="p-4 ms-glass rounded col-span-12 md:col-span-1 lg:col-span-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-sm font-semibold">🔥 Weekly Growth</span>
                <div className="text-xs text-slate-500">Distribution of points by source</div>
              </div>
              <div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${weeklyGrowth >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {weeklyGrowth >= 0 ? '+' : ''}{weeklyGrowth}%
                </span>
              </div>
            </div>

            <div className="w-full" style={{ height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pointsData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    fill="#8884d8"
                    paddingAngle={2}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pointsData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 text-left">
              <span className="text-lg font-bold">{totalPoints}</span>
              <div className="text-xs text-slate-500">Total Points</div>
            </div>
          </div>
        {/* Session Time Card */}
  <div className="p-4 ms-glass rounded col-span-12 md:col-span-2 lg:col-span-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">Session Time</h3>
              <p className="text-sm text-slate-500">Weekly Focus Time Overview</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">3h 12m</span>
              <p className="text-sm text-slate-500">Avg. Daily</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sessionTimeData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="focusTimeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="day" />
              <YAxis unit="h" />
              <Tooltip 
                formatter={(value) => [`${value} hours`, 'Focus Time']}
                labelStyle={{ color: '#000' }}
              />
              <ReferenceLine 
                y={3} 
                label={{ value: 'Target: 3h', position: 'right' }} 
                stroke="#38bdf8"
                strokeDasharray="3 3"
              />
              <Area 
                type="monotone" 
                dataKey="focusTime" 
                stroke="#6366f1" 
                fill="url(#focusTimeGradient)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
  <div className="p-4 ms-glass rounded col-span-12 md:col-span-2 lg:col-span-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">Productivity Fluctuation</h3>
              <p className="text-sm text-slate-500">Daily points & comebacks</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <span className="text-amber-400 mr-1">⭐</span>
                <span className="text-sm text-slate-500">Comeback Day</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">18%</span>
                <p className="text-sm text-slate-500">Bounce Rate</p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={productivityData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
              <XAxis dataKey="date" />
              <YAxis unit=" pts" />
              <Tooltip
                formatter={(value, name) => [`${value} points`, 'Daily Points']}
                labelStyle={{ color: '#000' }}
              />
              <Bar dataKey="points" fill="#6366f1">
                {productivityData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.isComeback ? '#f59e42' : '#6366f1'}
                  />
                ))}
                <LabelList
                  dataKey="isComeback"
                  position="top"
                  content={({ x, y, value }) => value ? (
                    <text x={x} y={y - 10} fill="#f59e42" textAnchor="middle">
                      ⭐
                    </text>
                  ) : null}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
  <div className="p-4 ms-glass rounded col-span-12 lg:col-span-12">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">Performance Overview</h3>
              <p className="text-sm text-slate-500">Correlation between discipline, focus, and progress</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <span className="text-sm">Points</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                <span className="text-sm">Focus Time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-sm">Streak</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="date" />
              <YAxis yAxisId="points" domain={[0, 'auto']} />
              <YAxis yAxisId="hours" orientation="right" domain={[0, 'auto']} />
              <Tooltip 
                formatter={(value, name) => {
                  switch(name) {
                    case 'points':
                      return [`${value} points`, 'Points'];
                    case 'focusHours':
                      return [`${value} hours`, 'Focus Time'];
                    case 'streakDays':
                      return [`${value} days`, 'Streak'];
                    default:
                      return [value, name];
                  }
                }}
                labelStyle={{ color: '#000' }}
              />
              <Line 
                type="monotone" 
                dataKey="points" 
                stroke="#6366f1" 
                strokeWidth={2}
                yAxisId="points"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="focusHours" 
                stroke="#38bdf8" 
                strokeWidth={2}
                yAxisId="hours"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="streakDays" 
                stroke="#f59e42" 
                strokeWidth={2}
                yAxisId="points"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
