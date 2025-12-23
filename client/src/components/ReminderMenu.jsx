import React, { useEffect, useState, useCallback } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Bell, AlertCircle, Brain } from 'lucide-react'
import { readJSON, writeJSON } from '../utils/storage'
import { apiUrl } from '../utils/api'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'ms:reminders'
const AUTO_REMINDER_INTERVAL = 1000 * 60 * 30 // 30 minutes

const REMINDER_ICONS = {
  priority: AlertCircle,
  reflection: Brain,
  default: Bell
}

export default function ReminderMenu(){
  const [items, setItems] = useState(() => readJSON(STORAGE_KEY, []))
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const fetchAutoReminders = useCallback(async () => {
    try {
      console.log('Fetching auto reminders...')
      setLoading(true)
      const response = await fetch(apiUrl('/api/reminders'), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ms:token')}`
        }
      })
      if (!response.ok) {
        console.error('Error response:', response.status, response.statusText)
        throw new Error('Failed to fetch reminders')
      }
      
      const autoReminders = await response.json()
      console.log('Received auto reminders:', autoReminders.length)
      
      // Update items, keeping manual reminders and replacing auto ones
      setItems(prev => {
        // Keep only manual reminders
        const manualReminders = prev.filter(r => !r.type || r.type === 'manual')
        console.log('Existing manual reminders:', manualReminders.length)
        // Add new auto reminders
        return [...autoReminders, ...manualReminders]
      })
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const checkDebugInfo = async () => {
    try {
      const response = await fetch(apiUrl('/api/reminders/debug'), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ms:token')}`
        }
      })
      if (!response.ok) {
        console.error('Debug check failed:', response.status, response.statusText)
        return
      }
      const debug = await response.json()
      console.log('Debug info:', debug)
    } catch (error) {
      console.error('Debug check error:', error)
    }
  }

  useEffect(() => {
    // Initial fetch and debug check
    checkDebugInfo()
    fetchAutoReminders()
    
    // Set up interval for periodic updates
    const interval = setInterval(fetchAutoReminders, AUTO_REMINDER_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchAutoReminders])

  // Listen for global events so other pages/components can add or refresh reminders
  useEffect(() => {
    const addHandler = (e) => {
      try {
        const d = e.detail || {}
        if (d && d.text) {
          const r = {
            id: (d.id || 'manual_' + Date.now()),
            text: d.text,
            type: d.type || 'manual',
            read: false,
            createdAt: d.createdAt || new Date().toISOString()
          }
          setItems(prev => [r, ...prev])
        }
      } catch (err) {
        console.error('ms:addReminder handler error', err)
      }
    }

    const refreshHandler = () => {
      fetchAutoReminders()
    }

    window.addEventListener('ms:addReminder', addHandler)
    window.addEventListener('ms:refreshReminders', refreshHandler)

    return () => {
      window.removeEventListener('ms:addReminder', addHandler)
      window.removeEventListener('ms:refreshReminders', refreshHandler)
    }
  }, [fetchAutoReminders])

  useEffect(() => {
    // Save only manual reminders to storage
    const manualReminders = items.filter(i => !i.type || i.type === 'manual')
    writeJSON(STORAGE_KEY, manualReminders)
  }, [items])

  const unreadCount = items.filter(i => !i.read).length

  const markAllRead = () => setItems(items.map(i => ({ ...i, read: true })))

  const toggleRead = (id) => {
    setItems(items.map(i => i.id === id ? { ...i, read: !i.read } : i))
  }

  const addReminder = (text, type = 'manual') => {
    const r = { 
      id: type + '_' + Date.now(), 
      text, 
      type,
      read: false, 
      createdAt: new Date().toISOString() 
    }
    setItems(prev => [r, ...prev])
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button aria-label="reminders" className="relative p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800/40 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-200 ms-scale-hover ms-focus-ring">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 text-xs bg-white text-black dark:bg-white dark:text-black rounded-full min-w-[18px] h-4 px-1 flex items-center justify-center ms-fade-in">
              {unreadCount > 99 ? '+99' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={8} className="w-80 bg-[#06102a] border border-slate-800 rounded shadow-lg z-50 p-0 overflow-hidden ms-fade-in">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <div className="font-semibold">Reminders</div>
            <div className="flex items-center gap-2">
              <button onClick={markAllRead} className="text-sm text-slate-400 px-2 py-1 rounded hover:bg-white/2 ms-scale-hover">Mark all read</button>
              <button onClick={() => navigate('/reminders')} className="text-sm text-sky-400 px-2 py-1 rounded hover:bg-white/2 ms-scale-hover">View all</button>
            </div>
          </div>

          <div className="p-2 max-h-64 overflow-auto">
            {loading && <div className="p-2 text-sm text-slate-400">Loading reminders...</div>}
            {!loading && items.length === 0 && <div className="p-2 text-sm text-slate-400">No reminders</div>}
            {items.map(item => {
              const Icon = REMINDER_ICONS[item.type] || REMINDER_ICONS.default
              return (
                <div key={item.id} className={`p-2 hover:bg-white/2 rounded flex items-start gap-3 ${item.read ? 'opacity-60' : ''} ms-fade-in`} role="menuitem">
                  <div className="mt-1">
                    <Icon className={`h-4 w-4 ${
                      item.type === 'priority' ? 'text-amber-400' :
                      item.type === 'reflection' ? 'text-purple-400' :
                      'text-slate-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-200">{item.text}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleRead(item.id)} 
                    className="text-xs text-slate-400 px-2 py-0.5 rounded hover:bg-white/2 ms-scale-hover"
                  >
                    {item.read ? 'Unread' : 'Read'}
                  </button>
                </div>
              )
            })}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}