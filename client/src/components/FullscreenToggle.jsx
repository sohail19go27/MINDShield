import React, { useState, useEffect } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

export default function FullscreenToggle(){
  const [fs, setFs] = useState(false)

  useEffect(()=>{
    function onChange(){
      setFs(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onChange)
    return ()=>document.removeEventListener('fullscreenchange', onChange)
  },[])

  const toggle = async () => {
    try{
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen()
      else await document.exitFullscreen()
    }catch(e){ console.warn('fullscreen failed', e) }
  }

  return (
    <button aria-label="fullscreen" onClick={toggle} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800/40">
      {fs ? <Minimize2 className="h-5 w-5 text-slate-900 dark:text-slate-200"/> : <Maximize2 className="h-5 w-5 text-slate-900 dark:text-slate-200"/>}
    </button>
  )
}
