import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import { testDBConnection } from './config/prisma';


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

app.use('/auth', authRoutes)


app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`)
})
