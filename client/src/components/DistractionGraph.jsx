import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Sample data - replace with real data from your backend
const data = [
  { date: '10/23', distractions: 5, intensity: 4 },
  { date: '10/24', distractions: 3, intensity: 2 },
  { date: '10/25', distractions: 4, intensity: 3 },
  { date: '10/26', distractions: 2, intensity: 2 },
  { date: '10/27', distractions: 3, intensity: 3 },
  { date: '10/28', distractions: 1, intensity: 1 },
  { date: '10/29', distractions: 2, intensity: 2 },
]

export default function DistractionGraph() {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)'
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="distractions"
            stroke="#38bdf8"
            name="Distractions"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="intensity"
            stroke="#f59e42"
            name="Emotional Intensity"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}