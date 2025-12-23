import React, { useEffect, useMemo, useRef, useState } from 'react'

function minutesToMs(mins){ return mins * 60 * 1000 }
function formatMMSS(ms){
  const total = Math.max(0, Math.floor(ms/1000))
  const m = Math.floor(total/60).toString().padStart(2,'0')
  const s = (total%60).toString().padStart(2,'0')
  return `${m}:${s}`
}
function todayKey(){
  const d = new Date()
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
}

// points: 30m => 10 pts, +5 pts per extra 30m
function computePoints(mins){
  if (mins < 30) return 0
  const extraBlocks = Math.floor((mins - 30)/30)
  return 10 + extraBlocks * 5
}

export default function FocusTimer({ priorityId, onEarn }){
  const STORAGE = `ms:timer:${priorityId}`
  const [duration, setDuration] = useState(30) // minutes
  const [state, setState] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem(STORAGE)) || { running:false } }catch{ return { running:false } }
  })
  const [now, setNow] = useState(Date.now())
  const beepRef = useRef(null)

  const remainingMs = useMemo(()=>{
    if (!state.running) return 0
    return Math.max(0, state.endsAt - now)
  },[state, now])
  const finished = state.running && remainingMs === 0 && !state.claimed
  const points = computePoints(state.minutes || duration)

  // tick
  useEffect(()=>{
    if (!state.running || state.claimed) return
    const t = setInterval(()=> setNow(Date.now()), 500)
    return ()=> clearInterval(t)
  },[state])

  // persist
  useEffect(()=>{
    try{ localStorage.setItem(STORAGE, JSON.stringify(state)) }catch{}
  },[state])

  // play sound when finished
  useEffect(()=>{
    if (finished && beepRef.current){
      try{ beepRef.current.currentTime = 0; beepRef.current.play() }catch{}
    }
  },[finished])

  const start = () => {
    if (state.running) return
    const minutes = duration
    setState({ running:true, minutes, startedAt: Date.now(), endsAt: Date.now() + minutesToMs(minutes), claimed:false, day: todayKey() })
  }

  const reset = () => setState({ running:false })

  const claim = () => {
    if (!finished) return
    const day = todayKey()
    // update per-priority daily minutes
    const keyTime = `ms:time:${priorityId}:${day}`
    let prevMin = 0
    try{ prevMin = parseFloat(localStorage.getItem(keyTime)) || 0 }catch{}
    const newMin = prevMin + (state.minutes || 0)
    try{ localStorage.setItem(keyTime, String(newMin)) }catch{}
    // update daily points total
    const keyPts = `ms:points:${day}`
    let prevPts = 0
    try{ prevPts = parseInt(localStorage.getItem(keyPts)) || 0 }catch{}
    const newPts = prevPts + points
    try{ localStorage.setItem(keyPts, String(newPts)) }catch{}
    setState(s => ({ ...s, claimed:true }))
    onEarn?.(points, state.minutes || 0)
  }

  const selectorDisabled = state.running

  return (
    <div className="mt-3 p-3 rounded-md border border-slate-200/50 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/30">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Focus Timer</div>
        <div className="text-xs text-slate-500">Points: {computePoints(selectorDisabled ? (state.minutes||0) : duration)}</div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <select disabled={selectorDisabled} value={duration} onChange={e=>setDuration(parseInt(e.target.value))} className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
          <option value={30}>30 min</option>
          <option value={60}>60 min</option>
          <option value={90}>90 min</option>
          <option value={120}>120 min</option>
        </select>
        {!state.running && (
          <button onClick={start} className="px-3 py-1 bg-emerald-600 text-white rounded text-sm ms-focus-ring ms-scale-hover">Start</button>
        )}
        {state.running && !finished && (
          <div className="text-sm text-slate-600 dark:text-slate-300">Remaining: <span className="font-semibold">{formatMMSS(remainingMs)}</span></div>
        )}
        {finished && !state.claimed && (
          <button onClick={claim} className="px-3 py-1 bg-sky-600 text-white rounded text-sm ms-scale-hover ms-focus-ring">Complete & claim +{points}</button>
        )}
        {state.running && (
          <button onClick={reset} className="ml-auto px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded text-sm">Reset</button>
        )}
      </div>
      <audio ref={beepRef}>
        <source src="data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQAA" type="audio/mpeg" />
      </audio>
    </div>
  )
}
