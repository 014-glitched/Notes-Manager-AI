import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { register, login } from './controllers/auth'
import { requireAuth } from './middleware/auth';
import { testDBConnection } from './config/prisma';


dotenv.config()
const app = express();

app.use(express.json())
app.use(cookieParser())

const PORT = process.env.PORT || 3000

async function startServer() {
  const dbConnected = await testDBConnection()
  if (!dbConnected) {
    console.error('❌ Failed to connect to database. Server may not work properly.')
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

startServer()

app.post("/auth/register", register)
app.post("/auth/login", login)

app.get("/me", requireAuth, (req, res) => {
    res.json({ message: `Hello user ${req.user?.id}, you have accessed a protected route!` })
})

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`)
})
