import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing(){
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const onSearch = (e) =>{
    e.preventDefault()
    navigate('/dashboard', { state: { query } })
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] ms-fade-in">
      <div className="max-w-2xl w-full p-8 rounded-2xl ms-glass ms-card-hover text-center">
        <h2 className="text-4xl font-extrabold text-white ms-gradient-text">MINDShield</h2>
        <p className="text-slate-300 mt-4 text-lg">"Get Mental wellness By MindShied"</p>
        <div className="mt-6">
          <p className="text-sm text-slate-400">Welcome — explore tools to improve focus, reduce distraction, and build calm.</p>
        </div>
      </div>
    </div>
  )
}
