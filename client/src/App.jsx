import React, {useState} from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import PriorityDetail from './pages/PriorityDetail'
import Landing from './components/Landing'
import Dashboard from './components/Dashboard'
import AuthLogin from './components/AuthLogin'
import AuthRegister from './components/AuthRegister'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import SectionDetail from './components/SectionDetail'
import Analytics from './pages/Analytics'
import CRM from './pages/CRM'
import Priorities from './pages/Priorities'
import Habits from './pages/Habits'
import OtherSkills from './pages/OtherSkills'
import Reminders from './pages/Reminders'
import Distraction from './pages/Distraction'
import MindClarity from './pages/MindClarity'
import { Box, Container } from '@mui/material'

export default function App(){
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Dynamic left padding for main content and header
  const sidebarWidth = sidebarOpen ? '16rem' : '4rem'
  return (
    <AppProvider>
      <Box>
        <Header sidebarOpen={sidebarOpen} onMenu={() => setSidebarOpen(s => !s)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
  <Container 
        maxWidth="lg" 
        sx={{
          marginTop: '3rem',  // Match header height
          paddingLeft: { md: sidebarWidth },
          paddingRight: '1.25rem',
          paddingTop: '2rem',
          paddingBottom: '2rem'
        }}>
        <Routes>
          <Route path='/' element={<Landing/>} />
          <Route path='/dashboard' element={<Dashboard/>} />
          <Route path='/analytics' element={<Analytics/>} />
          <Route path='/crm' element={<CRM/>} />
          <Route path='/priorities' element={<Priorities/>} />
          <Route path='/habits' element={<Habits/>} />
          <Route path='/other-skills' element={<OtherSkills/>} />
          <Route path='/reminders' element={<Reminders/>} />
          <Route path='/section/:id' element={<SectionDetail/>} />
          <Route path='/priority/:id' element={<PriorityDetail/>} />
          <Route path='/distraction' element={<Distraction/>} />
          <Route path='/mind-clarity' element={<MindClarity/>} />
          <Route path='/auth/login' element={<AuthLogin/>} />
          <Route path='/auth/register' element={<AuthRegister/>} />
        </Routes>
      </Container>
    </Box>
    </AppProvider>
  )
}
