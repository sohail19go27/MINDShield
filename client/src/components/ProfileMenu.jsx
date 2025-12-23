import React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getUser, clearAuth } from '../utils/auth'

export default function ProfileMenu(){
  const navigate = useNavigate()
  const user = getUser()

  const logout = () => { clearAuth(); navigate('/') }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button aria-label="profile" className="flex items-center gap-3 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800/40 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <User className="h-4 w-4 text-slate-900 dark:text-slate-200" />
          </div>
          <div className="hidden sm:block text-sm">{user ? user.email.split('@')[0] : 'Guest'}</div>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={8} className="w-48 bg-[#06102a] border border-slate-800 rounded shadow-lg z-50 p-0 overflow-hidden">
          <div className="p-3 border-b border-slate-800">
            {user ? <div className="text-sm text-slate-200">{user.email}</div> : <div className="text-sm text-slate-200">Guest</div>}
          </div>

          <div className="flex flex-col p-2 text-sm">
            {user ? (
              <>
                <DropdownMenu.Item asChild>
                  <button className="p-2 text-left hover:bg-white/2 rounded" onClick={()=>navigate('/profile')}>Profile</button>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <button className="p-2 text-left hover:bg-white/2 rounded" onClick={logout}>Logout</button>
                </DropdownMenu.Item>
              </>
            ) : (
              <>
                <DropdownMenu.Item asChild>
                  <button className="p-2 text-left hover:bg-white/2 rounded" onClick={()=>navigate('/auth/login')}>Login</button>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <button className="p-2 text-left hover:bg-white/2 rounded" onClick={()=>navigate('/auth/register')}>Register</button>
                </DropdownMenu.Item>
              </>
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
