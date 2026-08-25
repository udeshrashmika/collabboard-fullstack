import 'dotenv/config'
import http from 'http'
import { Server } from 'socket.io'
import app from './app.js'
import connectDB from '../config/db.js' 

connectDB(); 

const PORT = process.env.PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

const httpServer = http.createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
})

io.on('connection', (socket) => {
  socket.on('join:board', (boardId) => {
    socket.join(`board:${boardId}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`CollabBoard server running on port ${PORT}`)
})
