import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import noteRoutes from './routes/notes';
import { testDBConnection } from './config/prisma';
import { requireAuth } from "./middleware/auth";

dotenv.config()
const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const PORT = process.env.PORT || 3000

async function startServer() {
  const dbConnected = await testDBConnection()
  if (!dbConnected) {
    console.error('Failed to connect to database. Server may not work properly.')
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

startServer()

app.use('/api/auth', authRoutes)
app.use('/api/notes', requireAuth, noteRoutes)


app.get('/me', requireAuth, (req, res) => {
  res.json({ 
    message: `Hello user ${req.user?.id}, you have accessed a protected route!`,
  });
});


app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`)
})
