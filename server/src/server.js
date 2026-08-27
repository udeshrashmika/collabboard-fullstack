import 'dotenv/config'
import http from 'http'
import { Server } from 'socket.io'
import app from './app.js'
import connectDB from '../config/db.js'

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

// make io reachable from controllers via req.app.get('io')
app.set('io', io)

// connect to Mongo first, then start listening
connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`CollabBoard server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message)
    process.exit(1)
  })