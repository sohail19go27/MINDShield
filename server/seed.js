const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const Section = require('./models/Section')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mindshield'

const sections = [
  { id: 'priorities', title: 'Priorities', description: 'Your top priorities' },
  { id: 'discipline', title: 'Discipline', description: 'Daily disciplines' },
  { id: 'other-skills', title: 'Other Skills', description: 'Skills to build' },
  { id: 'life-lessons', title: 'My life lessons and mistakes', description: 'Lessons and mistakes' },
  { id: 'distraction', title: 'Distraction', description: 'Distractions to avoid' },
  { id: 'overthinking', title: 'Overthinking (Planner)', description: 'Planner for overthinking' }
]

async function seed(){
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  console.log('Connected to Mongo for seeding')

  for (const s of sections){
    try {
      await Section.updateOne({ id: s.id }, { $setOnInsert: s }, { upsert: true })
      console.log('Ensured', s.id)
    } catch (err) { console.error('Seed error', err) }
  }

  mongoose.disconnect()
}

seed().then(()=> console.log('Seeding finished')).catch(console.error)
