import React, {useState} from 'react'
import { Box, TextField, Button, Paper, Typography } from '@mui/material'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { saveAuth } from '../utils/auth'

export default function AuthLogin(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) =>{
    e.preventDefault()
    try{
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password })
      saveAuth(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err){
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <Box sx={{display:'flex', justifyContent:'center', mt:6}}>
      <Paper sx={{p:4, width: 480}}>
        <Typography variant="h6" gutterBottom>Login</Typography>
        <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:12}}>
          <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" variant="contained">Login</Button>
        </form>
      </Paper>
    </Box>
  )
}
