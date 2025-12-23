import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import App from './App'
import theme from './theme'
import './index.css'
import axios from 'axios'

// If token exists in localStorage, set default Authorization header
const token = localStorage.getItem('ms_token')
if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)
