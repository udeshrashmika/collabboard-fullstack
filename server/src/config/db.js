import mongoose from 'mongoose'

export async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGO_URI is not configured')
  }
  await mongoose.connect(uri)
}
