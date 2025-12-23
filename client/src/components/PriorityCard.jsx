import React, { useState, useEffect } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MoreVertical } from 'lucide-react'

export default function PriorityCard({ priority, onEdit, onAddNotes, onComplete, onAddMinutes, onSetTimer }){
  const { title, deadline, streak, badge, todayTime, notes, timerEndsAt, timerMinutes } = priority
  const [remainingMs, setRemainingMs] = useState(timerEndsAt ? Math.max(0, timerEndsAt - Date.now()) : null)
  const [alarmPlayed, setAlarmPlayed] = useState(false)

  useEffect(() => {
    if (!timerEndsAt) return
    let mounted = true
    const tick = () => {
      const rem = Math.max(0, timerEndsAt - Date.now())
      if (!mounted) return
      setRemainingMs(rem)
      if (rem <= 0 && !alarmPlayed) {
        // play a light sound once
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext
          if (AudioCtx) {
            const ctx = new AudioCtx()
            const o = ctx.createOscillator()
            const g = ctx.createGain()
            o.type = 'sine'
            o.frequency.value = 880
            g.gain.value = 0.04
            o.connect(g)
            g.connect(ctx.destination)
            o.start()
            setTimeout(() => { try { o.stop(); ctx.close() } catch(e){} }, 250)
          }
        } catch (err) {
          console.warn('Audio beep failed', err)
        }
        // Add a quick reminder event
        try { window.dispatchEvent(new CustomEvent('ms:addReminder', { detail: { text: `Timer finished for \"${title}\"`, type: 'priority' } })) } catch (e) {}
        setAlarmPlayed(true)
      }
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => { mounted = false; clearInterval(id) }
  }, [timerEndsAt, alarmPlayed, title])

  const formatRemaining = (ms) => {
    if (ms == null) return ''
    if (ms <= 0) return "Time's up"
    const total = Math.ceil(ms / 1000)
    const mins = Math.floor(total / 60)
    const secs = total % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const badges = [
    { min: 60, label: '🏆 Iron Mind', color: 'text-amber-400' },
    { min: 30, label: '💎 Disciplined', color: 'text-sky-400' },
    { min: 15, label: '🔥 Focused', color: 'text-orange-400' },
    { min: 7, label: '🌱 Sprout', color: 'text-emerald-400' }
  ]
  const currentBadgeObj = badges.find(b => streak >= b.min)
  const currentBadge = currentBadgeObj?.label || badge

  return (
    <div className="p-4 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-start gap-2">
            <div className="text-xl mt-1">{title.includes('Exercise') ? '💪' : title.includes('MERN') ? '🔥' : '📚'}</div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">{title}</div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span>Deadline: {deadline ? new Date(deadline).toLocaleDateString() : '—'}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span>Streak: {streak} Days</span>
                </div>
                <div>Today's Time Spent: {todayTime} hrs</div>
                {timerEndsAt && (
                  <div className="text-xs text-amber-300">Timer: {formatRemaining(remainingMs)} {timerMinutes ? `(${timerMinutes}m)` : ''}</div>
                )}
                <div className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-fit">
                  <span className={currentBadgeObj?.color}>{currentBadge?.split(' ')[0]}</span>
                  <span>{(currentBadge?.split(' ').slice(1).join(' ')) || 'Badge'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button 
              aria-label="actions" 
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content 
              sideOffset={6} 
              className="min-w-[160px] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-1 z-50"
            >
              <DropdownMenu.Item 
                onSelect={(e) => {e.preventDefault(); onEdit?.()}} 
                className="px-3 py-1.5 rounded text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200"
              >
                Edit
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                onSelect={(e) => {e.preventDefault(); onAddNotes?.()}} 
                className="px-3 py-1.5 rounded text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200"
              >
                Add Notes
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                onSelect={(e) => {e.preventDefault(); onSetTimer?.()}} 
                disabled={!!timerEndsAt}
                className={`px-3 py-1.5 rounded text-sm ${timerEndsAt ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'} text-slate-700 dark:text-slate-200`}
              >
                {timerEndsAt ? 'Timer set' : 'Set Timer'}
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                onSelect={(e) => {e.preventDefault(); onAddMinutes?.()}} 
                className="px-3 py-1.5 rounded text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200"
              >
                Add Minutes
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                onSelect={(e) => {e.preventDefault(); onComplete?.()}} 
                className="px-3 py-1.5 rounded text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-emerald-600 dark:text-emerald-400"
              >
                Mark as Done
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {notes && (
        <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          <span className="text-slate-400 dark:text-slate-500">Notes:</span> {notes}
        </div>
      )}
    </div>
  )
}