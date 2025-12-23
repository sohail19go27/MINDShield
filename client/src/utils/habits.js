// Utility functions for habit calculations
import { readJSON } from './storage'

const STORAGE_KEY_DEV = 'ms:habits:develop'
const STORAGE_KEY_REM = 'ms:habits:remove'

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

export function calcPointsForHabit(habit) {
  const base = habit.basePoints ?? 5
  const extra = habit.extraIncrement ?? 2
  const map = habit.dailyMinutes || {}
  let total = 0
  for (const [, minsRaw] of Object.entries(map)) {
    const mins = Number(minsRaw || 0)
    if (mins >= 30) {
      total += base + Math.floor((mins - 30) / 30) * extra
    } else if (mins > 0) {
      total += Math.round((mins / 30) * base)
    }
  }
  return total
}

export function calcHabitStreak(habit) {
  const map = habit.dailyMinutes || {}
  let count = 0
  let d = new Date()
  while (true) {
    const k = todayKey(d)
    const mins = Number(map[k] || 0)
    if (mins >= 30) {
      count++
      d.setDate(d.getDate() - 1)
    } else break
    if (count > 1000) break
  }
  return count
}

export function getHabitsData() {
  const develop = readJSON(STORAGE_KEY_DEV, [])
  const remove = readJSON(STORAGE_KEY_REM, [])
  
  const totalPoints = [...develop, ...remove].reduce((acc, h) => acc + calcPointsForHabit(h), 0)
  const maxStreak = [...develop, ...remove].reduce((acc, h) => Math.max(acc, calcHabitStreak(h)), 0)
  
  // Calculate daily points for the last 7 days
  const dailyPoints = {}
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const key = todayKey(date)
    let dayPoints = 0
    
    for (const habit of [...develop, ...remove]) {
      const mins = Number(habit.dailyMinutes?.[key] || 0)
      const base = habit.basePoints ?? 5
      const extra = habit.extraIncrement ?? 2
      if (mins >= 30) {
        dayPoints += base + Math.floor((mins - 30) / 30) * extra
      } else if (mins > 0) {
        dayPoints += Math.round((mins / 30) * base)
      }
    }
    
    dailyPoints[key] = dayPoints
  }

  return {
    totalPoints,
    maxStreak,
    dailyPoints,
    develop,
    remove
  }
}