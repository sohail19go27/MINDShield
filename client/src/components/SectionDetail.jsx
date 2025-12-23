import React, {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Paper, Checkbox } from '@mui/material'

export default function SectionDetail(){
  const { id } = useParams()
  const [section, setSection] = useState(null)
  const [items, setItems] = useState([])
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [dueDate, setDueDate] = useState('')

  useEffect(()=>{
    axios.get(`http://localhost:5000/api/sections/${id}`)
      .then(res=> setSection(res.data))
      .catch(console.error)

    fetchItems()
  },[id])

  const fetchItems = () => {
    axios.get(`http://localhost:5000/api/sections/${id}/items`)
      .then(res=> setItems(res.data))
      .catch(console.error)
  }

  const addItem = async () =>{
    if(!text) return
    try{
      const payload = { text }
      if (dueDate) payload.dueDate = dueDate
      const res = await axios.post(`http://localhost:5000/api/sections/${id}/items`, payload)
      setItems(prev => [res.data, ...prev])
      setText('')
      setDueDate('')
    } catch (err){
      console.error(err)
    }
  }

  const startEdit = (item) => {
    setEditingId(item._id || item.id)
    setEditingText(item.text)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingText('')
  }

  const saveEdit = async (itemId) => {
    if (!editingText) return
    try {
      const res = await axios.put(`http://localhost:5000/api/items/${itemId}`, { text: editingText })
      setItems(prev => prev.map(i => (i._id === itemId || i.id === itemId) ? res.data : i))
      cancelEdit()
    } catch (err) {
      console.error(err)
    }
  }

  const deleteItem = async (itemId) => {
    try {
      await axios.delete(`http://localhost:5000/api/items/${itemId}`)
      setItems(prev => prev.filter(i => !(i._id === itemId || i.id === itemId)))
    } catch (err) {
      console.error(err)
    }
  }

  const toggleCompleted = async (item) => {
    try{
      const res = await axios.put(`http://localhost:5000/api/items/${item._id || item.id}`, { completed: !item.completed })
      setItems(prev => prev.map(i => (i._id === res.data._id ? res.data : i)))
    } catch (err){
      console.error(err)
    }
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>{section?.title || id}</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>{section?.description}</Typography>

      <Paper sx={{p:2, mt:2}}>
        <Box sx={{display:'flex', gap:2, alignItems: 'center'}}>
          <TextField fullWidth placeholder="Add a note or task" value={text} onChange={e=>setText(e.target.value)} />
          {id === 'overthinking' && (
            <input type="datetime-local" value={dueDate} onChange={e=>setDueDate(e.target.value)} style={{height:40}} />
          )}
          <Button variant="contained" onClick={addItem}>Add</Button>
        </Box>

        <List sx={{mt:2}}>
          {items.map(it=> (
            <ListItem key={it._id || it.id} divider secondaryAction={
              editingId === (it._id || it.id) ? (
                <>
                  <Button size="small" onClick={() => saveEdit(it._id || it.id)}>Save</Button>
                  <Button size="small" onClick={cancelEdit}>Cancel</Button>
                </>
              ) : (
                <>
                  <Button size="small" onClick={() => startEdit(it)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => deleteItem(it._id || it.id)}>Delete</Button>
                </>
              )
            }>
              {editingId === (it._id || it.id) ? (
                <TextField fullWidth value={editingText} onChange={e=>setEditingText(e.target.value)} />
              ) : (
                <>
                  <Checkbox checked={!!it.completed} onChange={()=>toggleCompleted(it)} />
                  <ListItemText
                    primary={it.text}
                    secondary={
                      <>
                        {it.dueDate ? `Due: ${new Date(it.dueDate).toLocaleString()} — ` : ''}
                        {new Date(it.createdAt).toLocaleString()}
                      </>
                    }
                  />
                </>
              )}
            </ListItem>
          ))}
          {items.length === 0 && <Typography color="text.secondary" sx={{p:2}}>No notes yet — add one above.</Typography>}
        </List>
      </Paper>
    </Box>
  )
}
