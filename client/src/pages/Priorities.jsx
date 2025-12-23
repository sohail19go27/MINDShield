import React, { useState, useEffect } from 'react'
import { readJSON, writeJSON } from '../utils/storage'
import PriorityModal from '../components/PriorityModal'
import PriorityCard from '../components/PriorityCard'

const STORAGE_KEY = 'ms:priorities'

function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

export default function Priorities() {
  const [items, setItems] = useState(() => readJSON(STORAGE_KEY, []))
  const [points, setPoints] = useState(() => readJSON('ms:points', 0))
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    writeJSON(STORAGE_KEY, items)
  }, [items])

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const onSave = (payload) => {
    if (payload.id) {
      setItems(prev => prev.map(it => it.id === payload.id ? { ...it, ...payload } : it))
    } else {
      const id = 'p_' + Date.now()
      setItems(prev => [{ id, dailyMinutes: {}, ...payload }, ...prev])
    }
    setModalOpen(false)
  }

  const onDelete = (id) => {
    if (!confirm('Delete this priority?')) return
    // Award 10 points on completion (persisted)
    try {
      const newPoints = Number(points || 0) + 10
      setPoints(newPoints)
      writeJSON('ms:points', newPoints)
    } catch (err) {
      console.error('Failed to update points', err)
    }
    setItems(prev => prev.filter(p => p.id !== id))
  }

  const addMinutes = (id, mins) => {
    const amount = prompt('Enter minutes to add:', '30')
    if (!amount) return
    
    setItems(prev => prev.map(p => {
      if (p.id !== id) return p
      const map = { ...(p.dailyMinutes || {}) }
      const key = todayKey()
      map[key] = (Number(map[key] || 0) + Number(amount))
      return { ...p, dailyMinutes: map }
    }))
  }

  const setTimerFor = (id) => {
    const p = items.find(x => x.id === id)
    if (!p) return
    if (p.timerEndsAt) {
      alert('Timer already set and cannot be edited.')
      return
    }
    const mins = prompt('Set timer duration in minutes (e.g. 25):', '25')
    if (!mins) return
    const n = Number(mins)
    if (!n || n <= 0) return alert('Invalid minutes')
    const endsAt = Date.now() + n * 60 * 1000
    setItems(prev => prev.map(it => it.id === id ? { ...it, timerMinutes: n, timerEndsAt: endsAt } : it))
  }

  const totalPointsToday = items.reduce((acc, p) => {
    const today = todayKey()
    const mins = Number((p.dailyMinutes || {})[today] || 0)
    return acc + Math.min(50, mins)
  }, 0)

  return (
    <div className="min-h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Priorities</h2>
        <div className="text-xl font-bold text-slate-700 dark:text-slate-300">{totalPointsToday + Number(points || 0)} pts</div> 
          </div>

      <div className="grid grid-cols-1 gap-4 mb-4">
        {items.length === 0 ? (
          <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg text-slate-400 dark:text-slate-500">
            No priorities yet. Click Add Priority to create one.
          </div>
        ) : (
          items.map(p => {
            const today = todayKey()
            const todayMins = Number((p.dailyMinutes || {})[today] || 0)
            const todayHours = (todayMins / 60).toFixed(1)

            // Calculate streak
            let streak = 0
            let d = new Date()
            while (true) {
              const k = todayKey(d)
              const mins = Number((p.dailyMinutes || {})[k] || 0)
              if (mins >= 30) {
                streak++
                d.setDate(d.getDate() - 1)
              } else break
              if (streak > 1000) break
            }

            return (
              <PriorityCard
                key={p.id}
                priority={{
                  ...p,
                  todayTime: todayHours,
                  streak: streak,
                  badge: streak >= 60 ? 'Iron Mind' :
                         streak >= 30 ? 'Disciplined' :
                         streak >= 15 ? 'Focused' :
                         streak >= 7 ? 'Sprout' : null
                }}
                onEdit={() => { setEditing(p); setModalOpen(true) }}
                onAddNotes={() => {
                  const notes = prompt('Add notes:', p.notes || '')
                  if (notes !== null) {
                    setItems(prev => prev.map(it => it.id === p.id ? { ...it, notes } : it))
                  }
                }}
                onAddMinutes={() => addMinutes(p.id)}
                onSetTimer={() => setTimerFor(p.id)}
                onComplete={() => {
                  onDelete(p.id)
                  try {
                    // Add a quick notification to the bell
                    window.dispatchEvent(new CustomEvent('ms:addReminder', { detail: {
                      text: `Completed priority: "${p.title}"`,
                      type: 'priority'
                    }}))
                    // Ask reminder menu to refresh auto reminders (e.g., achievements)
                    window.dispatchEvent(new Event('ms:refreshReminders'))
                  } catch (err) {
                    console.error('Failed to dispatch reminder events', err)
                  }
                }}
              />
            )
          })
        )}
      </div>

      <button
        onClick={openNew}
        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
      >
        Add Priority
      </button>

      <PriorityModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onSave}
        initial={editing}
      />
    </div>
  )
}