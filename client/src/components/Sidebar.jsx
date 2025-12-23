import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Drawer, useMediaQuery, Box } from '@mui/material'
import { 
  Star, Activity, BookOpen, Archive, Slash, Brain, PieChart, LayoutDashboard, Search,
  Settings, User, Headphones, ShieldCheck, Bell
} from 'lucide-react'

function NavItem({ icon: Icon, label, to, badge, onClick, compact=false }){
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <div 
      onClick={() => { onClick?.() || navigate(to) }} 
      className={`flex items-center ${compact ? 'justify-center' : 'gap-3 px-3'} py-2 rounded-lg cursor-pointer transition-colors
        ${isActive ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50 dark:text-slate-300 dark:hover:text-sky-400 dark:hover:bg-slate-800/40'}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!compact && <span className="text-sm font-medium flex-1">{label}</span>}
      {badge && <span className="text-xs px-1.5 py-0.5 rounded bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300">{badge}</span>}
    </div>
  )
}

export default function Sidebar({ open, onClose }) {
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'))

  const SidebarContent = (
    <div className="h-full flex flex-col bg-white dark:bg-[var(--ms-topbar-dark-bg)] text-slate-900 dark:text-slate-200 
      bg-gradient-to-b from-[var(--ms-sidebar-gradient-start)] to-[var(--ms-sidebar-gradient-end)]
      dark:bg-gradient-to-b dark:from-[var(--ms-topbar-dark-bg)] dark:to-[var(--ms-topbar-dark-bg-2)]
      backdrop-blur-[var(--ms-blur-amount)] transition-all duration-[var(--ms-transition-speed)]
      ms-sidebar-enhanced">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-sky-100 dark:bg-slate-800 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          </div>
          <span className="font-semibold text-lg">MindShield</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 mb-4">
        <div className="relative">
          <input 
            placeholder="Search..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-slate-400 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500" 
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 space-y-6 overflow-auto scrollbar-none">
        {/* Dashboards */}
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 mb-2">Dashboards</div>
          <nav className="space-y-1">
            <NavItem icon={PieChart} label="Analytics" to="/analytics" />
            <NavItem icon={LayoutDashboard} label="CRM" to="/crm" />
          </nav>
        </div>

        {/* Pages */}
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 mb-2">Pages</div>
          <nav className="space-y-1">
            <NavItem icon={Star} label="Priorities" to="/priorities" />
            <NavItem icon={BookOpen} label="Other Skills" to="/other-skills" />
            <NavItem icon={Activity} label="Habits" to="/habits" />
            <NavItem icon={Slash} label="Distraction Journal" to="/distraction" badge="New" />
            <NavItem icon={Brain} label="MindClarity" to="/mind-clarity" />
            <NavItem icon={Bell} label="Reminders" to="/reminders" />
          </nav>
        </div>

        {/* Support */}
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 mb-2">Support</div>
          <nav className="space-y-1">
            <NavItem icon={Headphones} label="Help Center" to="/help" badge="Soon" />
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 dark:border-slate-800">
        <nav className="space-y-1">
          <NavItem icon={Settings} label="Settings" to="/settings" />
          <NavItem icon={User} label="Profile" to="/profile" />
        </nav>
      </div>
    </div>
  )

  // Desktop: Fixed sidebar (expanded or collapsed)
  if (mdUp) {
    const widthClass = open ? 'w-64' : 'w-16'
    // Always use dark or light background based on theme, regardless of open/collapsed state
    return (
  <Box className={`fixed inset-y-0 left-0 ${widthClass} border-r border-[var(--ms-sidebar-border)]
        bg-gradient-to-b from-[var(--ms-sidebar-gradient-start)] to-[var(--ms-sidebar-gradient-end)]
        dark:bg-gradient-to-b dark:from-[var(--ms-topbar-dark-bg)] dark:to-[var(--ms-topbar-dark-bg-2)]
        backdrop-blur-[var(--ms-blur-amount)] transition-all duration-[var(--ms-transition-speed)]
        ms-sidebar-enhanced`}>
        {/* When collapsed, render compact menu */}
        {open ? (
          SidebarContent
        ) : (
          <div className="h-full flex flex-col items-center py-4 space-y-3">
            {/* compact icons only */}
            <div className="w-8 h-8 rounded bg-sky-100 dark:bg-slate-800 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <nav className="flex flex-col gap-2 mt-4">
              <NavItem compact icon={PieChart} label="Analytics" to="/analytics" />
              <NavItem compact icon={LayoutDashboard} label="CRM" to="/crm" />
              <NavItem compact icon={Star} label="Priorities" to="/priorities" />
              <NavItem compact icon={Activity} label="Habits" to="/habits" />
              <NavItem compact icon={BookOpen} label="Other Skills" to="/other-skills" />
              <NavItem compact icon={Slash} label="Distraction Journal" to="/distraction" />
              <NavItem compact icon={Brain} label="MindClarity" to="/mind-clarity" />
              <NavItem compact icon={Bell} label="Reminders" to="/reminders" />
            </nav>
            <div className="mt-auto mb-4">
              <NavItem compact icon={Settings} label="Settings" to="/settings" />
            </div>
          </div>
        )}
      </Box>
    )
  }

  // Mobile: Drawer
  return (
    <Drawer
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 280,
          backgroundColor: 'transparent',
          backgroundImage: 'none',
        }
      }}
    >
      {SidebarContent}
    </Drawer>
  )
}
