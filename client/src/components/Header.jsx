import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Columns, Globe } from 'lucide-react'
import ReminderMenu from './ReminderMenu'
import FullscreenToggle from './FullscreenToggle'
import ThemeToggle from './ThemeToggle'
import ProfileMenu from './ProfileMenu'

export default function Header({ onMenu, sidebarOpen = true }){
  const navigate = useNavigate()

  const leftClass = sidebarOpen ? 'md:left-64' : 'md:left-16'

  return (
    <header className={`fixed top-0 right-0 left-0 ${leftClass} border-b border-[var(--ms-sidebar-border)] 
        backdrop-blur-[var(--ms-blur-amount)] 
        dark:bg-[var(--ms-topbar-dark-bg)] bg-[var(--ms-topbar-light-bg)]
        dark:bg-gradient-to-b dark:from-[var(--ms-topbar-dark-bg)] dark:to-[var(--ms-topbar-dark-bg-2)]
        bg-gradient-to-b from-[var(--ms-topbar-light-bg)] to-[var(--ms-topbar-light-bg-2)]
        transition-all duration-[var(--ms-transition-speed)]
        z-40 ms-topbar-enhanced`}>
      <div className="flex items-center justify-between h-12 px-3 ms-fade-in">
        {/* Left: sidebar toggle */}
        <div className="flex items-center">
          <button
            onClick={onMenu}
            aria-label="toggle sidebar"
            title="Toggle sidebar"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800/40 text-slate-900 dark:text-slate-200 ms-focus-ring ms-scale-hover"
          >
            <Columns className="h-5 w-5" />
          </button>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          <div title="Notifications" className="ms-fade-in-slow">
            <ReminderMenu />
          </div>

          <div title="Fullscreen" className="ms-fade-in-slow">
            <FullscreenToggle />
          </div>

          <div title="Change theme" className="ms-fade-in-slow">
            <ThemeToggle />
          </div>

          {/* Profile (avatar + name) */}
          <div className="ms-fade-in-slow">
            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
