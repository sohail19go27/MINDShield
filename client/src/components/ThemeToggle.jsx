import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle(){
  const [dark, setDark] = useState(() => {
    try {
      const v = localStorage.getItem('ms-theme')
      if (v) return v === 'dark'
    } catch(e){}
    return document.documentElement.classList.contains('dark')
  })

  useEffect(()=>{
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    try{ localStorage.setItem('ms-theme', dark ? 'dark' : 'light') }catch(e){}
  },[dark])

  return (
    <button aria-label="toggle theme" onClick={() => setDark(d => !d)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800/40 text-slate-900 dark:text-slate-200">
      {dark ? <Sun className="h-5 w-5 text-yellow-400"/> : <Moon className="h-5 w-5" />}
    </button>
  )
}
