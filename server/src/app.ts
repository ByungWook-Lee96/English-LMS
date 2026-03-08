import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import studentRoutes from './routes/students.js'
import scheduleRoutes from './routes/schedules.js'
import teacherRoutes from './routes/teachers.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/schedules', scheduleRoutes)
app.use('/api/teachers', teacherRoutes)

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
export default app
