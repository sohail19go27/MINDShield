import React, {useState} from 'react'
import { Box, TextField, Button, Paper, Typography } from '@mui/material'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { saveAuth } from '../utils/auth'

export default function AuthRegister(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) =>{
    e.preventDefault()
    try{
      const res = await axios.post('http://localhost:5000/api/auth/register', { email, password, name })
      saveAuth(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err){
      setError(err.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <Box sx={{display:'flex', justifyContent:'center', mt:6}}>
      <Paper sx={{p:4, width: 480}}>
        <Typography variant="h6" gutterBottom>Register</Typography>
        <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:12}}>
          <TextField label="Name" value={name} onChange={e=>setName(e.target.value)} />
          <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" variant="contained">Create account</Button>
        </form>
      </Paper>
    </Box>
  )
}
