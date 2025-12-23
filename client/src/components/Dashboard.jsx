import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'
import Card from './ui/Card'
import Button from './ui/Button'
import TopBar from './TopBar'
import PriorityCard from './PriorityCard'
import { Star, Activity, BookOpen, Archive, Slash, Brain } from 'lucide-react'
import clsx from 'clsx'

const iconMap = {
  'priorities': <Star size={28} />,
  'discipline': <Activity size={28} />,
  'other-skills': <BookOpen size={28} />,
  'life-lessons': <Archive size={28} />,
  'distraction': <Slash size={28} />,
  'overthinking': <Brain size={28} />
}

export default function Dashboard(){
  const [sections, setSections] = useState([])
  const location = useLocation()
  const navigate = useNavigate()
  const query = location.state?.query || ''

  useEffect(() =>{
    axios.get('http://localhost:5000/api/sections')
      .then(res=> setSections(res.data))
      .catch(err=> console.error(err))
  },[])

  const samplePriorities = [
    { id: 'p1', title: 'Learn MERN Stack', deadline: '31 Dec 2025', streak: 12, badge: '🏅 Bronze', progress: 45, todayTime: 1.5, notes: 'Learned JWT Auth and tested API.' },
    { id: 'p2', title: 'Meditation', deadline: 'Ongoing', streak: 5, badge: '🌱 Sprout', progress: 60, todayTime: 0.5, notes: '10 min morning session.' },
    { id: 'p3', title: 'C++ Practice', deadline: '15 Nov 2025', streak: 3, badge: '', progress: 20, todayTime: 0.0, notes: 'Solved arrays problems.' },
  ]

  return (
    <div className="ms-fade-in">
      <TopBar />
      <h2 className="text-2xl font-bold ms-gradient-text">MINDShield Dashboard</h2>
      {query && <div className="text-sm text-slate-300 ms-fade-in-slow">Search: {query}</div>}

      {/* Priority demo section */}
      <div className="mt-4">
        <div className="mb-3 text-lg font-semibold">Priorities</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sample priorities - replace with API data */}
          {samplePriorities.map(p => (
            <PriorityCard key={p.id} priority={p} onEdit={()=>{}} onAddNotes={()=>{}} onComplete={()=>{}} />
          ))}
        </div>
        <div className="mt-4">
          <Button disabled={false} className="ms-scale-hover">Add Priority</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
        {sections
          .filter(s => {
            // remove any reminder section from the dashboard display, but keep notification bell in header
            if (!s) return false
            const id = (s.id || '').toString().toLowerCase()
            const title = (s.title || '').toString().toLowerCase()
            if (id === 'reminders' || title.includes('remind')) return false
            return true
          })
          .map(s=> (
          <Card key={s.id} onClick={() => navigate(`/section/${s.id}`)} className="ms-card-hover ms-glass p-0 cursor-pointer">
            <div className="p-4 bg-gradient-to-br from-white/2 to-white/1">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-white/3 flex items-center justify-center ms-scale-hover">{iconMap[s.id]}</div>
                <div>
                  <div className="text-lg font-semibold text-white">{s.title}</div>
                  <div className="text-sm text-slate-300">{s.description}</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/2">
              <div className="h-28 flex items-center justify-center text-slate-300">Click to open & add notes</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
